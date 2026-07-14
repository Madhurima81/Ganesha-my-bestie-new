// CleanProfileSelector.jsx - With scroll skin + Mooshika ride transition
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import PrimaryBtn from '../shared/PrimaryBtn';
import ScreenHeader from '../shared/ScreenHeader';
import MooshikaRideTransition from './MooshikaRideTransition';
import AudioToggle from '../ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../hooks/useAudioPreference';
import { playUiTap } from '../../services/AudioService';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({
  onProfileSelect,
  profiles: initialProfiles,
  forceCreate = false
}) => {
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(forceCreate);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [avatarTapPulseId, setAvatarTapPulseId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(7);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [manageModeId, setManageModeId] = useState(null);
  const [createError, setCreateError] = useState('');

  // NEW: transition state
  const [transitionStage, setTransitionStage] = useState(null); // null | 'ride'
  const [pendingProfile, setPendingProfile] = useState(null);
  const { isAudioOn, toggleAudio } = useAudioPreference();

  const longPressTimer = React.useRef(null);
  const voiceTimersRef = useRef([]);
  const hasPlayedFriendChoiceVoRef = useRef(false);
  const playedStepVoRef = useRef({ 1: false, 2: false, 3: false });
  const avatarAudioCtxRef = useRef(null);

  const animalAvatars = [
    { id: 'monkey', name: 'Monkey', labelColor: '#FF9800' },
    { id: 'peacock', name: 'Peacock', labelColor: '#00BCD4' },
    { id: 'squirrel', name: 'Squirrel', labelColor: '#8D6E63' },
    { id: 'tiger', name: 'Tiger', labelColor: '#4CAF50' }
  ];

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
      playedStepVoRef.current = { 1: false, 2: false, 3: false };
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
        currentStep === 1 ? 'What should I call you?'
          : currentStep === 2 ? 'How old are you?'
            : 'Pick your friend!'
      );
      u.rate = currentStep === 3 ? 1.05 : 1.02;
      u.pitch = currentStep === 3 ? 1.05 : 1;
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
    playedStepVoRef.current = { 1: false, 2: false, 3: false };
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

  // UPDATED: instead of calling onProfileSelect immediately, trigger Mooshika ride
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

        setNewProfileName('');
        setSelectedAvatar('monkey');
        setSelectedAge(7);

        // Hand off to Mooshika ride
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

  // RIDE TRANSITION â€” render first if active
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
                <button type="button" className="back-btn" onClick={goBackInCreateFlow}>
                  {currentStep > 1 ? 'Back' : 'Cancel'}
                </button>
                <div className="create-step-content">
                  {currentStep === 1 && (
                    <>
                      <h2 className="create-step-heading">What should I call you?</h2>
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newProfileName.trim().length >= 2) {
                            setCurrentStep(2);
                          }
                        }}
                        placeholder="Type your name"
                        maxLength={12}
                        className="name-input"
                        autoFocus
                      />
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <h2 className="create-step-heading">How old are you, {newProfileName.trim()}?</h2>
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

                  {currentStep === 3 && (
                    <>
                      <h2 className="create-step-heading">Pick your friend</h2>
                      <p className="create-step-subheading">Who will join your adventure?</p>
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
                    </>
                  )}
                </div>

                {createError ? <p className="create-error-text">{createError}</p> : null}

                <PrimaryBtn
                  label={currentStep < 3 ? '→' : "Let's Explore"}
                  onClick={() => {
                    setCreateError('');
                    if (currentStep === 1) setCurrentStep(2);
                    else if (currentStep === 2) setCurrentStep(3);
                    else handleCreateProfile();
                  }}
                  disabled={(currentStep === 1 && newProfileName.trim().length < 2) || isCreatingProfile}
                  size="md"
                  fullWidth={currentStep === 3}
                  className={currentStep < 3 ? 'arrow-btn' : 'final-cta-btn'}
                />

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
                return (
                  <div
                    key={profile.id}
                    className={`clean-profile-card ${isManaging ? 'manage' : ''}`}
                    onClick={() => {
                      if (!isManaging) {
                        playUiTap(0.24);
                        onProfileSelect(profile.id);
                      }
                    }}
                    onMouseDown={() => {
                      longPressTimer.current = setTimeout(() => setManageModeId(profile.id), 900);
                    }}
                    onMouseUp={clearLongPressTimer}
                    onMouseLeave={clearLongPressTimer}
                    onTouchStart={() => {
                      longPressTimer.current = setTimeout(() => setManageModeId(profile.id), 900);
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
                    setShowCreateProfile(true);
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

