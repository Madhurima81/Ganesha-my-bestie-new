// CleanProfileSelector.jsx - FIXED: Delete Modal Bug
import React, { useState, useEffect } from 'react';
import GameStateManager from '../../services/GameStateManager';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({ 
  onProfileSelect, 
  profiles: initialProfiles
}) => {
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

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
        '#000000'
      );
      
      if (newProfile && newProfile.id) {
        setNewProfileName('');
        setSelectedAvatar('monkey');
        setShowCreateProfile(false);
        loadProfiles();
        onProfileSelect(newProfile.id);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const confirmDelete = (profileId) => {
    GameStateManager.deleteProfile(profileId);
    loadProfiles();
    setShowDeleteConfirm(null);
  };

  const getAnimalId = (avatarData) => {
    if (['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) return avatarData;
    const map = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
    return map[avatarData] || 'monkey';
  };

  const profileArray = Object.values(profiles || {});
  const emptySlots = Math.max(0, 4 - profileArray.length);

  return (
    <div className="clean-profile-overlay">
      <div className="clean-forest-background"></div>
      
      <div className="clean-profile-container">
        
        {/* ✨ CREATE PROFILE MODAL */}
        {showCreateProfile && (
          <div className="clean-modal-overlay">
            <div className="clean-create-card">
              
              <h2 className="modal-title">Create Your Explorer!</h2>
              <p className="modal-subtitle">Pick your name and your forest friend</p>
              
              <input
                type="text"
                placeholder="Enter your name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                maxLength={12}
                className="clean-text-input"
                autoFocus
              />
              
              <h3 className="section-label">Pick your Forest Friend</h3>
              
              <div className="clean-avatar-grid">
                {animalAvatars.map((animal) => (
                  <div
                    key={animal.id}
                    className={`clean-avatar-option ${selectedAvatar === animal.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(animal.id)}
                  >
                    {selectedAvatar === animal.id && (
                      <div className="checkmark-badge">✓</div>
                    )}
                    <img 
                      src={`/images/new-explorer-${animal.id}.png`}
                      alt={animal.name}
                      className="clean-avatar-img"
                    />
                    <div 
                      className="animal-label-pill"
                      style={{ backgroundColor: animal.labelColor }}
                    >
                      {animal.name}
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleCreateProfile}
                className="btn-primary-blue"
                disabled={!newProfileName.trim()}
              >
                Start Adventure!
              </button>
              
              <button 
                onClick={() => setShowCreateProfile(false)}
                className="btn-text-back"
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
              <h2 className="clean-profile-title">Who's Playing?</h2>
              {/* ✅ Info Button */}
              <button 
                className="clean-info-btn"
                onClick={() => setShowInfo(true)}
              >
                ℹ️
              </button>
            </div>
            
            <div className="clean-profiles-grid">
              {profileArray.map((profile) => {
                const animalId = getAnimalId(profile.avatar);
                return (
                  <div 
                    key={profile.id}
                    className="clean-profile-card"
                    onClick={() => onProfileSelect(profile.id)}
                  >
                    <div className="clean-animal-avatar-container">
                      <img 
                        src={`/images/new-explorer-${animalId}.png`}
                        alt="Profile"
                        className="clean-animal-avatar-image"
                      />
                    </div>
                    <div className="clean-profile-name">{profile.name}</div>
                    
                    <button 
                      className="clean-delete-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(profile.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              
              {/* EMPTY SLOTS */}
              {[...Array(emptySlots)].map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="clean-profile-card empty"
                  onClick={() => setShowCreateProfile(true)}
                >
                  <div className="clean-add-profile">
                    <div className="clean-add-icon">+</div>
                    <div className="clean-add-text">New</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ FIXED: DELETE MODAL - Moved OUTSIDE profiles grid */}
            {showDeleteConfirm && (
              <div className="clean-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                <div className="clean-delete-card" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title-small">Delete Profile?</h3>
                  <p className="modal-text">
                    Are you sure you want to delete <strong>{profiles[showDeleteConfirm]?.name}</strong>?
                  </p>
                  <button 
                    className="btn-danger-red" 
                    onClick={() => confirmDelete(showDeleteConfirm)}
                  >
                    Yes, Delete
                  </button>
                  <button 
                    className="btn-text-cancel" 
                    onClick={() => setShowDeleteConfirm(null)}
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
              <h2 className="modal-title">Help & Guide</h2>
              <p className="modal-text" style={{textAlign:'left', padding:'0 10px'}}>
                👋 Welcome to Ganesha's World!<br/><br/>
                <strong>1. Create a Profile:</strong> Tap "New" to start.<br/>
                <strong>2. Pick a Friend:</strong> Choose an animal avatar.<br/>
                <strong>3. Play:</strong> Tap your profile to continue.<br/>
                <strong>4. Manage:</strong> You can have up to 4 profiles. Tap "×" to delete one.
              </p>
              <button className="btn-primary-blue" onClick={() => setShowInfo(false)}>Got it!</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CleanProfileSelector;