// CleanProfileSelector.jsx - FIXED: Delete Modal Bug
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import PrimaryBtn from '../shared/PrimaryBtn';
import ScreenHeader from '../shared/ScreenHeader';
import './CleanProfileSelector.css';

const PROFILE_CREATE_INTRO_VO_KEY = 'gmb_vo_profile_create_intro_heard';
const PROFILE_CREATE_INTRO_LINE = "Let's create your profile. Type your name and pick a friend.";

const CleanProfileSelector = ({
  onProfileSelect,
  profiles: initialProfiles,
  forceCreate = false   // true for first-time users — skips grid, opens create modal immediately
}) => {
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(forceCreate);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [selectedAge, setSelectedAge] = useState(7);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [manageModeId, setManageModeId] = useState(null); // stores the profile id being managed
  const longPressTimer = React.useRef(null);
  const voiceTimersRef = useRef([]);
  const hasPlayedFriendChoiceVoRef = useRef(false);

  // 🎨 Animal Config: Matches Image 1 Colors
  const animalAvatars = [
    { id: 'monkey', name: 'Monkey', labelColor: '#FF9800' },   // Orange
    { id: 'peacock', name: 'Peacock', labelColor: '#00BCD4' }, // Cyan
    { id: 'squirrel', name: 'Squirrel', labelColor: '#8D6E63' }, // Brown
    { id: 'tiger', name: 'Tiger', labelColor: '#4CAF50' }      // Green
  ];

  useEffect(() => {
    if (!initialProfiles) loadProfiles();
  }, [initialProfiles]);

  useEffect(() => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
    const shouldSpeakIntro = forceCreate && showCreateProfile && isAudioOn
      && localStorage.getItem(PROFILE_CREATE_INTRO_VO_KEY) !== '1';
    if (!shouldSpeakIntro || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
      return () => {
        voiceTimersRef.current.forEach(clearTimeout);
        window.speechSynthesis?.cancel();
      };
    }

    localStorage.setItem(PROFILE_CREATE_INTRO_VO_KEY, '1');
    const timerId = setTimeout(() => {
      const u = new window.SpeechSynthesisUtterance(PROFILE_CREATE_INTRO_LINE);
      u.rate = 1.02;
      u.pitch = 1;
      u.volume = 0.9;
      window.speechSynthesis.speak(u);
    }, 450);
    voiceTimersRef.current.push(timerId);

    return () => {
      voiceTimersRef.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
    };
  }, [forceCreate, showCreateProfile]);

  useEffect(() => {
    if (!showCreateProfile) {
      hasPlayedFriendChoiceVoRef.current = false;
    }
  }, [showCreateProfile]);

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);

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
    if (!newProfileName.trim()) return;

    try {
      const selectedAnimal = animalAvatars.find(animal => animal.id === selectedAvatar);
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
        setShowCreateProfile(false);
        loadProfiles();

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
      }
    } catch (error) {
      console.error('Error creating profile:', error);
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
    const map = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
    return map[avatarData] || 'monkey';
  };

  const profileArray = Object.values(profiles || {});
  const emptySlots = Math.max(0, 4 - profileArray.length);

  return (
    <div className="clean-profile-overlay page-transition">
      <div className="clean-forest-background">
        <div className="profile-dust" aria-hidden="true">
          <span/><span/><span/>
        </div>
        {/* Atmospheric overlay — center lift + edge depth */}
        <div className="profile-bg-overlay" aria-hidden="true" />
        {/* Cinematic vignette */}
        <div className="profile-vignette" aria-hidden="true" />
      </div>
      
      <div className="clean-profile-container">
        
        {/* ✨ CREATE PROFILE MODAL */}
        {showCreateProfile && (
          <div className="overlay">
            <div className="explorer-modal">

              <ScreenHeader
                title="Create Your Profile"
                glowColor="purple"
              />

              <input
                type="text"
                placeholder="Enter your name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newProfileName.trim()) handleCreateProfile(); }}
                maxLength={12}
                className="name-input"
                autoFocus
              />

              <p className="pick-friend-label">How old are you?</p>
              <div className="age-stepper">
                <button
                  className="age-stepper-btn"
                  onClick={() => setSelectedAge(Math.max(1, (selectedAge || 7) - 1))}
                  type="button"
                  aria-label="Decrease age"
                >−</button>
                <div className="age-stepper-value" key={selectedAge}>{selectedAge || 7}</div>
                <button
                  className="age-stepper-btn"
                  onClick={() => setSelectedAge((selectedAge || 7) + 1)}
                  type="button"
                  aria-label="Increase age"
                >+</button>
              </div>

              <p className="pick-friend-label">Pick your Forest Friend</p>

              <div className="friend-grid">
                {animalAvatars.map((animal) => (
                  <div
                    key={animal.id}
                    className={`friend-card ${selectedAvatar === animal.id ? 'active' : ''}`}
                    onClick={() => handleAvatarSelect(animal.id)}
                  >
                    <img
                      src={`/images/new-explorer-${animal.id}.png`}
                      alt={animal.name}
                    />
                    <span>{animal.name}</span>
                  </div>
                ))}
              </div>

              <PrimaryBtn
                label="Start Adventure!"
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                size="md"
                fullWidth
              />

              <button
                onClick={() => setShowCreateProfile(false)}
                className="back-btn"
              >
                Back
              </button>

            </div>
          </div>
        )}

        {/* MAIN SCREEN */}
        {!showCreateProfile && (
          <>
            <div className="clean-profile-header">
              <ScreenHeader title="Who's Playing?" glowColor="purple" />
              {/* ℹ️ Help Button */}
              <button
                className="clean-info-btn"
                onClick={() => setShowInfo(true)}
              >
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
                    onClick={() => { if (!isManaging) onProfileSelect(profile.id); }}
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
                      <img
                        src={`/images/new-explorer-${animalId}.png`}
                        alt="Profile"
                        className="clean-animal-avatar-image"
                      />
                      {isManaging && (
                        <button
                          className="clean-delete-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(profile.id);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="clean-profile-name">{profile.name}</div>
                  </div>
                );
              })}

              {/* EMPTY SLOTS */}
              {[...Array(emptySlots)].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="clean-profile-card empty"
                  onClick={() => { setManageModeId(null); setShowCreateProfile(true); }}
                >
                  <div className="clean-add-icon">＋</div>
                  <div className="clean-add-text">Add Friend</div>
                </div>
              ))}
            </div>

            {/* Done managing */}
            {manageModeId && (
              <button className="manage-done-btn" onClick={() => setManageModeId(null)}>
                Done
              </button>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteConfirm && (
              <div className="clean-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                <div className="clean-delete-card" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title-small">
                    Delete {profiles[showDeleteConfirm]?.name}?
                  </h3>
                  <p className="modal-text">
                    This will erase all their progress. This can't be undone.
                  </p>
                  <button
                    className="btn-delete-lavender"
                    onClick={() => confirmDelete(showDeleteConfirm)}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="btn-text-cancel"
                    onClick={() => { setShowDeleteConfirm(null); setManageModeId(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ✅ INFO MODAL */}
        {showInfo && (
          <div className="clean-modal-overlay" onClick={() => setShowInfo(false)}>
            <div className="clean-create-card" onClick={(e) => e.stopPropagation()}>
              <ScreenHeader title="Help & Guide" glowColor="purple" />
              <p className="modal-text" style={{textAlign:'left', padding:'0 10px'}}>
                👋 Welcome to Ganesha's World!<br/><br/>
                <strong>1. Create a Profile:</strong> Tap "Add Friend" to start.<br/>
                <strong>2. Pick a Friend:</strong> Choose an animal avatar.<br/>
                <strong>3. Play:</strong> Tap your profile to continue.<br/>
                <strong>4. Manage:</strong> You can have up to 4 profiles. Tap "×" to delete one.
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
