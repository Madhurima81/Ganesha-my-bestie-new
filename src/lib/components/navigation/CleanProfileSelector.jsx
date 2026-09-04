// CleanProfileSelector.jsx - With scroll skin + Mooshika ride transition
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import PrimaryBtn from '../shared/PrimaryBtn';
import ScreenHeader from '../shared/ScreenHeader';
import MooshikaRideTransition from './MooshikaRideTransition';
import pwaInstallManager, { getInstallGuide } from '../../services/PwaInstallManager';
import ParentGate from '../onboarding/ParentGate';
import AudioToggle from '../ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../hooks/useAudioPreference';
import { playUiTap } from '../../services/AudioService';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({
  onProfileSelect,
  profiles: initialProfiles,
  forceCreate = false,
  // Installed-PWA relaunch: the parent already captured name + age in the
  // browser and installed mid-setup. App.jsx mounts this straight into the
  // child-facing "Pick your friend" screen; name/age come from localStorage.
  bootStage = null,
}) => {
  const ONB_NAME_KEY = 'gmb_onboarding_name';
  const ONB_AGE_KEY = 'gmb_onboarding_age';
  const bootPickCharacter = bootStage === 'pick-character';
  const resumedName = bootPickCharacter ? (localStorage.getItem(ONB_NAME_KEY) || '') : '';
  const resumedAge = bootPickCharacter ? Number(localStorage.getItem(ONB_AGE_KEY)) || 7 : 7;

  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(forceCreate && !bootStage);
  const [newProfileName, setNewProfileName] = useState(resumedName);
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [avatarTapPulseId, setAvatarTapPulseId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(resumedAge);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [manageModeId, setManageModeId] = useState(null);
  const [createError, setCreateError] = useState('');

  // Post-Age flow:
  //   null → 'allset' (one scene, two phases) → 'pick-character' → 'ride'
  const [transitionStage, setTransitionStage] = useState(bootPickCharacter ? 'pick-character' : null);
  const [pendingProfile, setPendingProfile] = useState(null);
  // 'allset' scene sub-state: 'install' (Add to Home Screen) | 'handoff' (hand to child)
  const [allSetPhase, setAllSetPhase] = useState('install');
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  // Gate re-triggered for "add another profile" from the selector grid — the
  // first-run path already passed the parent gate upstream (App.jsx), so this only
  // fires for later add-profile entries, not the initial forceCreate flow.
  const [showAddGate, setShowAddGate] = useState(false);
  const { isAudioOn, toggleAudio } = useAudioPreference();

  const longPressTimer = React.useRef(null);
  // HIGH FIX: guards against the stale-closure touchend synthetic click. The
  // 900ms timer flips manageModeId state, but a touchend-triggered click event
  // fires with the pre-timer `isManaging` closure still false, launching the
  // game instead of entering delete mode. A ref updates synchronously so the
  // click handler always sees the current value.
  const isManagingRef = React.useRef(false);
  const voiceTimersRef = useRef([]);
  const hasPlayedFriendChoiceVoRef = useRef(false);
  const playedStepVoRef = useRef({ 1: false, 2: false });
  const avatarAudioCtxRef = useRef(null);

  // 20 explorer friends — art lives at /images/new-explorer-<id>.webp (+ .png fallback).
  const animalAvatars = [
    { id: 'monkey', name: 'Monkey' },
    { id: 'elephant', name: 'Elephant' },
    { id: 'peacock', name: 'Peacock' },
    { id: 'tiger', name: 'Tiger' },
    { id: 'lion', name: 'Lion' },
    { id: 'rabbit', name: 'Rabbit' },
    { id: 'squirrel', name: 'Squirrel' },
    { id: 'mouse', name: 'Mouse' },
    { id: 'owl', name: 'Owl' },
    { id: 'peacock1', name: 'Peacock' }, // placeholder slot — replaced below
    { id: 'deer', name: 'Deer' },
    { id: 'horse', name: 'Horse' },
    { id: 'camel', name: 'Camel' },
    { id: 'buffalo', name: 'Buffalo' },
    { id: 'cobra', name: 'Cobra' },
    { id: 'turtle', name: 'Turtle' },
    { id: 'fish', name: 'Fish' },
    { id: 'swan', name: 'Swan' },
    { id: 'crane', name: 'Crane' },
    { id: 'crow', name: 'Crow' },
    { id: 'fox', name: 'Fox' },
  ].filter((a) => a.id !== 'peacock1');

  const CHARS_PER_PAGE = 8;
  const charPageCount = Math.ceil(animalAvatars.length / CHARS_PER_PAGE);

  useEffect(() => {
    if (initialProfiles) {
      setProfiles(initialProfiles);
      return;
    }
    loadProfiles();
  }, [initialProfiles]);

  useEffect(() => {
    if (showCreateProfile) {
      setCurrentStep(1);
      setCreateError('');
    }
  }, [showCreateProfile]);

  useEffect(() => {
    const canSpeak = isAudioOn && window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined';

    if (!showCreateProfile || !canSpeak || playedStepVoRef.current[currentStep]) {
      return;
    }

    const entryTimerId = setTimeout(() => {
      window.speechSynthesis.cancel();
      const u = new window.SpeechSynthesisUtterance(
        currentStep === 1 ? "What's your child's name?"
          : 'How old is your child?'
      );
      u.rate = currentStep === 2 ? 1.05 : 1.02;
      u.pitch = currentStep === 2 ? 1.05 : 1;
      u.volume = 0.9;
      window.speechSynthesis.speak(u);
      playedStepVoRef.current[currentStep] = true;
    }, 220);
    let idleTimerId = null;

    if (currentStep === 1 && !newProfileName.trim()) {
      idleTimerId = setTimeout(() => {
        if (!newProfileName.trim()) {
          window.speechSynthesis.cancel();
          const idleU = new window.SpeechSynthesisUtterance('Tell me your name.');
          idleU.rate = 1.02;
          idleU.pitch = 1;
          idleU.volume = 0.9;
          window.speechSynthesis.speak(idleU);
        }
      }, 2500);
    }

    return () => {
      clearTimeout(entryTimerId);
      if (idleTimerId) clearTimeout(idleTimerId);
    };
  }, [showCreateProfile, currentStep, newProfileName, isAudioOn]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      voiceTimersRef.current.forEach(clearTimeout);
      if (avatarAudioCtxRef.current?.close) {
        avatarAudioCtxRef.current.close().catch(() => {});
        avatarAudioCtxRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!showCreateProfile) {
      hasPlayedFriendChoiceVoRef.current = false;
    }
  }, [showCreateProfile]);

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const resetCreateFlow = () => {
    setShowCreateProfile(false);
    setCurrentStep(1);
    setNewProfileName('');
    setSelectedAvatar('monkey');
    setSelectedAge(7);
    setIsCreatingProfile(false);
    setCreateError('');
    hasPlayedFriendChoiceVoRef.current = false;
    window.speechSynthesis?.cancel();
  };

  const goBackInCreateFlow = () => {
    setCreateError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      return;
    }
    resetCreateFlow();
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setCreateError('');
    setAvatarTapPulseId(avatarId);
    const pulseTimer = setTimeout(() => setAvatarTapPulseId(null), 140);
    voiceTimersRef.current.push(pulseTimer);

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const ctx = avatarAudioCtxRef.current || new Ctx();
        avatarAudioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume?.().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      // non-blocking
    }

    if (hasPlayedFriendChoiceVoRef.current) return;
    if (!isAudioOn || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;

    hasPlayedFriendChoiceVoRef.current = true;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance('Nice choice!');
    utterance.rate = 1.03;
    utterance.pitch = 1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const loadProfiles = () => {
    try {
      const gameProfiles = GameStateManager.getProfiles();
      setProfiles(gameProfiles?.profiles || {});
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles({});
    }
  };

  const getAnimalId = (avatar) => {
    if (!avatar) return 'monkey';
    if (typeof avatar === 'string') return avatar;
    return avatar.id || 'monkey';
  };

  // Fires once the child has picked their friend on the kid-facing avatar step —
  // this is where the profile actually gets created, then straight to the ride.
  const handleCreateProfile = () => {
    if (!newProfileName.trim() || isCreatingProfile) return;
    setIsCreatingProfile(true);
    setCreateError('');

    try {
      const selectedAnimal = animalAvatars.find((animal) => animal.id === selectedAvatar);
      const newProfile = GameStateManager.createProfile(
        newProfileName.trim(),
        selectedAnimal?.id || 'monkey',
        '#000000',
        selectedAge
      );

      if (newProfile && newProfile.id) {
        // Cancel any in-flight VO so it doesn't bleed into the ride
        window.speechSynthesis?.cancel();

        // Onboarding is complete now — clear the resume crumbs so a later PWA
        // relaunch doesn't drop back into "pick your friend".
        try {
          localStorage.removeItem(ONB_NAME_KEY);
          localStorage.removeItem(ONB_AGE_KEY);
          localStorage.setItem('gmb_handoff_done', '1');
        } catch { /* ignore */ }

        setNewProfileName('');
        setSelectedAvatar('monkey');
        setSelectedAge(7);

        // Straight to the Mooshika ride — the child just picked their friend.
        setPendingProfile(newProfile);
        setShowCreateProfile(false);
        setTransitionStage('ride');
      } else {
        setCreateError('That profile could not be created. Try deleting one first.');
        setIsCreatingProfile(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setCreateError('Something went wrong while creating your profile.');
      setIsCreatingProfile(false);
    }
  };

  const confirmDelete = (profileId) => {
    try {
      GameStateManager.deleteProfile(profileId);
      const updated = { ...profiles };
      delete updated[profileId];
      setProfiles(updated);
      setShowDeleteConfirm(null);
      setManageModeId(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  // Shared shell for the post-Age handoff scenes — same scroll-card / scenic
  // background as the create flow. (No Ganesha figure here — Ganesha's own
  // "hello" moment is the kids-facing Meet Ganesha screen after Pick Your
  // Friend.)
  const renderHandoffCard = (inner) => (
    <div className="clean-profile-overlay">
      <div className="clean-forest-background">
        <div className="profile-bg-overlay" />
        <div className="profile-vignette" />
      </div>
      <div className="clean-profile-container">
        <div className="clean-modal-overlay scroll-overlay">
          <div className="scroll-card">
            <div className="scroll-card-inner">
              <span className="create-card-lotus" aria-hidden="true" />
              {inner}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const goToHandoff = () => {
    setShowInstallSteps(false);
    setAllSetPhase('handoff');
  };

  // ONE "All set" scene, two states (content transition — no new page):
  //   'install'  — final setup step: add GMB to the Home Screen
  //   'handoff'  — pass the device to the child
  // Skips straight to 'handoff' when there's nothing to install.
  if (transitionStage === 'allset') {
    const guide = getInstallGuide();
    const wantInstall = allSetPhase === 'install' && pwaInstallManager.shouldShowAnyNudge();

    if (wantInstall && showInstallSteps) {
      return renderHandoffCard(
        <>
          <h2 className="create-step-heading">{guide.title}</h2>
          <ul className="install-steps">
            {guide.steps.map((step, i) => (
              <li className="install-step" key={i}>
                <span className="install-step-icon" aria-hidden="true">{step.icon}</span>
                <span className="install-step-text">{step.text}</span>
              </li>
            ))}
          </ul>
          <PrimaryBtn label="Done" onClick={goToHandoff} size="md" fullWidth className="final-cta-btn" />
          <button type="button" className="back-btn" onClick={() => setShowInstallSteps(false)}>
            ← Back
          </button>
        </>
      );
    }

    if (wantInstall) {
      return renderHandoffCard(
        <>
          <img className="cps-step-icon cps-step-icon--install" src="/images/onboarding/icon-install.webp" alt="" aria-hidden="true" />
          <h2 className="create-step-heading">Almost there!</h2>
          <p className="handoff-body">
            Add GMB to your Home Screen so it&rsquo;s easy to come back.
          </p>
          <PrimaryBtn
            label="Show me how"
            onClick={async () => {
              if (guide.canNativePrompt) {
                await pwaInstallManager.promptInstall();
                goToHandoff();
              } else {
                setShowInstallSteps(true);
              }
            }}
            size="md"
            fullWidth
            className="final-cta-btn"
          />
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              pwaInstallManager.recordDismissal();
              goToHandoff();
            }}
          >
            Maybe later
          </button>
        </>
      );
    }

    // handoff state
    return renderHandoffCard(
      <>
        <h2 className="create-step-heading">All set!</h2>
        <p className="create-step-subheading">Now it&rsquo;s your child&rsquo;s turn.</p>
        <p className="handoff-body">Hand them the device and let the adventure begin.</p>
        <PrimaryBtn
          label="Start Adventure  →"
          onClick={() => setTransitionStage('pick-character')}
          size="md"
          fullWidth
          className="final-cta-btn"
        />
      </>
    );
  }

  // PICK YOUR FRIEND — child-facing. First real choice that belongs to the
  // child. The profile is created here (name + age were captured earlier),
  // then straight into the Mooshika ride.
  if (transitionStage === 'pick-character') {
    return renderHandoffCard(
      <>
        <h2 className="create-step-heading">Who will join your adventure?</h2>
        <p className="create-step-subheading">Pick a friend to explore with.</p>
        <div className="friend-grid">
          {animalAvatars.map((animal) => (
            <div
              key={animal.id}
              className={`friend-card ${selectedAvatar === animal.id ? 'active' : ''} ${avatarTapPulseId === animal.id ? 'pop' : ''}`}
              onClick={() => handleAvatarSelect(animal.id)}
              aria-label={animal.name}
              role="button"
            >
              <img src={`/images/new-explorer-${animal.id}.webp`} alt={animal.name} />
            </div>
          ))}
        </div>
        {createError ? <p className="create-error-text">{createError}</p> : null}
        <PrimaryBtn
          label="Let's go"
          onClick={handleCreateProfile}
          disabled={isCreatingProfile}
          size="md"
          fullWidth
          className="final-cta-btn"
        />
      </>,
      'sit-hi'
    );
  }

  // RIDE TRANSITION â€” handoff to the child, no changes.
  if (transitionStage === 'ride' && pendingProfile) {
    return (
      <MooshikaRideTransition
        avatarId={getAnimalId(pendingProfile.avatar)}
        profileName={pendingProfile.name}
        onComplete={() => {
          const id = pendingProfile.id;
          setTransitionStage(null);
          setPendingProfile(null);
          setIsCreatingProfile(false);
          onProfileSelect(id);
        }}
      />
    );
  }

  if (showAddGate) {
    return (
      <ParentGate
        onComplete={() => {
          setShowAddGate(false);
          setShowCreateProfile(true);
        }}
        onBackToWelcome={() => setShowAddGate(false)}
      />
    );
  }

  const profileArray = Object.values(profiles);
  const emptySlots = Math.max(0, 4 - profileArray.length);

  return (
    <div className="clean-profile-overlay">
      <div className="clean-forest-background">
        <div className="profile-bg-overlay" />
        <div className="profile-vignette" />
        <div className="profile-dust" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="clean-profile-container">
        {showCreateProfile && (
          <div className="clean-modal-overlay scroll-overlay">
            <AudioToggle
              isAudioOn={isAudioOn}
              onToggle={toggleAudio}
              position="top-right"
            />
            {/* SCROLL SKIN â€” bg image lives behind, scroll PNG frames the card */}
            <div className="scroll-card">
              <div className="scroll-card-inner">
                <span className="create-card-lotus" aria-hidden="true" />
                <div className="create-step-content">
                  {currentStep === 1 && (
                    <>
                      <h2 className="create-step-heading">What&rsquo;s your child&rsquo;s name?</h2>
                      <p className="create-step-subheading">We&rsquo;ll use this to personalise their experience.</p>
                      <div className="name-input-wrap">
                        <img className="name-input-icon" src="/images/onboarding/icon-name.webp" alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newProfileName.trim().length >= 2) {
                              setCurrentStep(2);
                            }
                          }}
                          placeholder="Enter their name"
                          maxLength={12}
                          className="name-input"
                          autoFocus
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <h2 className="create-step-heading">How old is {newProfileName.trim() || 'your child'}?</h2>
                      <p className="create-step-subheading">We&rsquo;ll tailor the games and stories to their age.</p>
                      <div className="age-stepper">
                        <button
                          className="age-stepper-btn"
                          onClick={() => setSelectedAge(Math.max(5, (selectedAge || 7) - 1))}
                          type="button"
                          aria-label="Decrease age"
                        >
                          -
                        </button>
                        <div className="age-stepper-value" key={selectedAge}>
                          {selectedAge || 7}
                        </div>
                        <button
                          className="age-stepper-btn"
                          onClick={() => setSelectedAge(Math.min(12, (selectedAge || 7) + 1))}
                          type="button"
                          aria-label="Increase age"
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {createError ? <p className="create-error-text">{createError}</p> : null}

                <PrimaryBtn
                  label={currentStep < 2 ? '→' : 'Next'}
                  onClick={() => {
                    setCreateError('');
                    if (currentStep === 1) {
                      setCurrentStep(2);
                      return;
                    }
                    // Age done — stash name + age so an installed-PWA relaunch
                    // can resume at "pick your friend", then go to the one
                    // "All set" scene.
                    try {
                      localStorage.setItem(ONB_NAME_KEY, newProfileName.trim());
                      localStorage.setItem(ONB_AGE_KEY, String(selectedAge || 7));
                    } catch { /* ignore */ }
                    setShowCreateProfile(false);
                    setAllSetPhase('install');
                    setShowInstallSteps(false);
                    setTransitionStage('allset');
                  }}
                  disabled={(currentStep === 1 && newProfileName.trim().length < 2) || isCreatingProfile}
                  size="md"
                  fullWidth={currentStep === 2}
                  className={currentStep < 2 ? 'arrow-btn' : 'final-cta-btn'}
                />

                {(currentStep > 1 || !forceCreate) && (
                  <button type="button" className="back-btn" onClick={goBackInCreateFlow}>
                    {currentStep > 1 ? '← Back' : '← Cancel'}
                  </button>
                )}

              </div>
            </div>
          </div>
        )}

        {!showCreateProfile && (
          <>
            <div className="clean-profile-header">
              <ScreenHeader title="Who's Playing?" glowColor="purple" />
              <button className="clean-info-btn" onClick={() => setShowInfo(true)}>
                ?
              </button>
            </div>

            <AudioToggle
              isAudioOn={isAudioOn}
              onToggle={toggleAudio}
              position="top-right"
            />

            <div className="clean-profiles-grid">
              {profileArray.map((profile) => {
                const animalId = getAnimalId(profile.avatar);
                const isManaging = manageModeId === profile.id;
                isManagingRef.current = isManaging;
                return (
                  <div
                    key={profile.id}
                    className={`clean-profile-card ${isManaging ? 'manage' : ''}`}
                    onClick={() => {
                      if (!isManagingRef.current) {
                        playUiTap(0.24);
                        onProfileSelect(profile.id);
                      }
                    }}
                    onMouseDown={() => {
                      longPressTimer.current = setTimeout(() => {
                        isManagingRef.current = true;
                        setManageModeId(profile.id);
                      }, 900);
                    }}
                    onMouseUp={clearLongPressTimer}
                    onMouseLeave={clearLongPressTimer}
                    onTouchStart={() => {
                      longPressTimer.current = setTimeout(() => {
                        isManagingRef.current = true;
                        setManageModeId(profile.id);
                      }, 900);
                    }}
                    onTouchEnd={clearLongPressTimer}
                    onTouchCancel={clearLongPressTimer}
                  >
                    <div className="clean-animal-avatar-container">
                      <img src={`/images/new-explorer-${animalId}.webp`} alt="Profile" className="clean-animal-avatar-image" />
                      {isManaging && (
                        <button
                          className="clean-delete-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(profile.id);
                          }}
                        >
                          x
                        </button>
                      )}
                    </div>
                    <div className="clean-profile-name">{profile.name}</div>
                  </div>
                );
              })}

              {[...Array(emptySlots)].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="clean-profile-card empty"
                  onClick={() => {
                    playUiTap(0.24);
                    setManageModeId(null);
                    setCreateError('');
                    // Re-adding a profile from here is a fresh "add profile" entry
                    // point — re-trigger the parent gate rather than skip straight in.
                    setShowAddGate(true);
                  }}
                >
                  <div className="clean-add-icon">+</div>
                  <div className="clean-add-text">Add Friend</div>
                </div>
              ))}
            </div>

            {manageModeId && (
              <button className="manage-done-btn" onClick={() => setManageModeId(null)}>
                Done
              </button>
            )}

            {showDeleteConfirm && (
              <div className="clean-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                <div className="clean-delete-card" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title-small">Delete {profiles[showDeleteConfirm]?.name}?</h3>
                  <p className="modal-text">This will erase all their progress. This can't be undone.</p>
                  <button className="btn-delete-lavender" onClick={() => confirmDelete(showDeleteConfirm)}>
                    Yes, Delete
                  </button>
                  <button
                    className="btn-text-cancel"
                    onClick={() => {
                      setShowDeleteConfirm(null);
                      setManageModeId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {showInfo && (
          <div className="clean-modal-overlay" onClick={() => setShowInfo(false)}>
            <div className="clean-create-card" onClick={(e) => e.stopPropagation()}>
              <ScreenHeader title="Help & Guide" glowColor="purple" />
              <p className="modal-text" style={{ textAlign: 'left', padding: '0 10px' }}>
                Welcome to Ganesha's World!<br />
                <br />
                <strong>1. Create a Profile:</strong> Tap "Add Friend" to start.
                <br />
                <strong>2. Pick a Friend:</strong> Choose an animal avatar.
                <br />
                <strong>3. Play:</strong> Tap your profile to continue.
                <br />
                <strong>4. Manage:</strong> Long-press a profile to show the delete button.
              </p>
              <PrimaryBtn label="Got it!" onClick={() => setShowInfo(false)} size="md" fullWidth />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanProfileSelector;

