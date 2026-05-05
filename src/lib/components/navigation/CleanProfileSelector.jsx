// CleanProfileSelector.jsx - FIXED: Delete Modal Bug
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import PrimaryBtn from '../shared/PrimaryBtn';
import ScreenHeader from '../shared/ScreenHeader';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({
  onProfileSelect,
  profiles: initialProfiles,
  forceCreate = false // true for first-time users - skips grid, opens create modal immediately
}) => {
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(forceCreate);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [avatarTapPulseId, setAvatarTapPulseId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(7);
  const [currentStep, setCurrentStep] = useState(1); // 1=name, 2=age, 3=friend
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [manageModeId, setManageModeId] = useState(null); // stores the profile id being managed
  const longPressTimer = React.useRef(null);
  const voiceTimersRef = useRef([]);
  const hasPlayedFriendChoiceVoRef = useRef(false);
  const playedStepVoRef = useRef({ 1: false, 2: false, 3: false });

  const animalAvatars = [
    { id: 'monkey', name: 'Monkey', labelColor: '#FF9800' },
    { id: 'peacock', name: 'Peacock', labelColor: '#00BCD4' },
    { id: 'squirrel', name: 'Squirrel', labelColor: '#8D6E63' },
    { id: 'tiger', name: 'Tiger', labelColor: '#4CAF50' }
  ];

  useEffect(() => {
    if (!initialProfiles) loadProfiles();
  }, [initialProfiles]);

  useEffect(() => {
    if (showCreateProfile) {
      setCurrentStep(1);
      playedStepVoRef.current = { 1: false, 2: false, 3: false };
    }
  }, [showCreateProfile]);

  useEffect(() => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
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
  }, [showCreateProfile, currentStep, newProfileName]);

  useEffect(() => {
    return () => {
      voiceTimersRef.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!showCreateProfile) {
      hasPlayedFriendChoiceVoRef.current = false;
    }
  }, [showCreateProfile]);

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setAvatarTapPulseId(avatarId);
    const pulseTimer = setTimeout(() => setAvatarTapPulseId(null), 140);
    voiceTimersRef.current.push(pulseTimer);

    // Tiny "pop" using Web Audio so selection feels tactile even without asset files.
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
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
      // Non-blocking: skip if audio context is unavailable.
    }

    if (hasPlayedFriendChoiceVoRef.current) return;
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
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

  const handleCreateProfile = () => {
    if (!newProfileName.trim() || isCreatingProfile) return;
    setIsCreatingProfile(true);

    try {
      const selectedAnimal = animalAvatars.find((animal) => animal.id === selectedAvatar);
      const newProfile = GameStateManager.createProfile(
        newProfileName.trim(),
        selectedAnimal?.id || 'monkey',
        '#000000',
        selectedAge
      );

      if (newProfile && newProfile.id) {
        const createdName = newProfile.name;
        const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
        const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
        const canSpeak = isAudioOn && window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined';

        setNewProfileName('');
        setSelectedAvatar('monkey');
        setSelectedAge(null);
        if (canSpeak) {
          window.speechSynthesis.cancel();
          const u = new window.SpeechSynthesisUtterance(`Yay, ${createdName}! Let's go!`);
          u.rate = 1.03;
          u.pitch = 1.02;
          u.volume = 0.92;
          window.speechSynthesis.speak(u);
          const timerId = setTimeout(() => onProfileSelect(newProfile.id), 950);
          voiceTimersRef.current.push(timerId);
        } else {
          onProfileSelect(newProfile.id);
        }
      } else {
        setIsCreatingProfile(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setIsCreatingProfile(false);
    }
  };

  const confirmDelete = (profileId) => {
    GameStateManager.deleteProfile(profileId);
    loadProfiles();
    setShowDeleteConfirm(null);
    setManageModeId(null);
  };

  const getAnimalId = (avatarData) => {
    if (['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) return avatarData;
    const map = { 'ðŸµ': 'monkey', 'ðŸ¦š': 'peacock', 'ðŸ¿ï¸': 'squirrel', 'ðŸ¯': 'tiger' };
    return map[avatarData] || 'monkey';
  };

  const profileArray = Object.values(profiles || {});
  const emptySlots = Math.max(0, 4 - profileArray.length);

  return (
    <div className="clean-profile-overlay page-transition">
      <div className="clean-forest-background">
        <div className="profile-dust" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="profile-bg-overlay" aria-hidden="true" />
        <div className="profile-vignette" aria-hidden="true" />
      </div>

      <div className="clean-profile-container">
        {showCreateProfile && (
          <div className="overlay">
            <div className="explorer-modal">
              <div className="ganesha-onboarding-portrait">
                <img src="/images/ganesha-sit.svg" alt="Ganesha" />
              </div>

              <div className="step-dots">
                <span className={currentStep >= 1 ? 'active' : ''} />
                <span className={currentStep >= 2 ? 'active' : ''} />
                <span className={currentStep >= 3 ? 'active' : ''} />
              </div>

              <div className={`create-step-content step-${currentStep}`}>
                {currentStep === 1 && (
                  <>
                    <h2 className="create-step-heading">What should I call you?</h2>
                    <p className="create-step-subheading">Tell me your name</p>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProfileName.trim().length >= 2) setCurrentStep(2);
                      }}
                      maxLength={12}
                      className="name-input"
                      autoFocus
                    />
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <p className="create-step-echo">{newProfileName.trim()}</p>
                    <h2 className="create-step-heading">How old are you?</h2>
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
                          <img src={`/images/new-explorer-${animal.id}.png`} alt={animal.name} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <PrimaryBtn
                label={currentStep < 3 ? 'Next' : 'Start Adventure!'}
                onClick={() => {
                  if (currentStep === 1) setCurrentStep(2);
                  else if (currentStep === 2) setCurrentStep(3);
                  else handleCreateProfile();
                }}
                disabled={(currentStep === 1 && newProfileName.trim().length < 2) || isCreatingProfile}
                size="md"
                fullWidth
              />

              <button
                onClick={() => {
                  if (currentStep === 1) setShowCreateProfile(false);
                  else setCurrentStep(currentStep - 1);
                }}
                className="back-btn"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
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

            <div className="clean-profiles-grid">
              {profileArray.map((profile) => {
                const animalId = getAnimalId(profile.avatar);
                const isManaging = manageModeId === profile.id;
                return (
                  <div
                    key={profile.id}
                    className={`clean-profile-card ${isManaging ? 'manage' : ''}`}
                    onClick={() => {
                      if (!isManaging) onProfileSelect(profile.id);
                    }}
                    onMouseDown={() => {
                      longPressTimer.current = setTimeout(() => setManageModeId(profile.id), 900);
                    }}
                    onMouseUp={() => clearTimeout(longPressTimer.current)}
                    onMouseLeave={() => clearTimeout(longPressTimer.current)}
                    onTouchStart={() => {
                      longPressTimer.current = setTimeout(() => setManageModeId(profile.id), 900);
                    }}
                    onTouchEnd={() => clearTimeout(longPressTimer.current)}
                  >
                    <div className="clean-animal-avatar-container">
                      <img src={`/images/new-explorer-${animalId}.png`} alt="Profile" className="clean-animal-avatar-image" />
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
                    setManageModeId(null);
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
                <strong>4. Manage:</strong> You can have up to 4 profiles. Tap "x" to delete one.
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
