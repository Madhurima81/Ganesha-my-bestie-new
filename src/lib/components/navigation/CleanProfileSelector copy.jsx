// CleanProfileSelector.jsx - With new animals and cream overlay modal
import React, { useState, useEffect } from 'react';
import GameStateManager from '../../services/GameStateManager';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({ onProfileSelect, onClose, profiles: initialProfiles }) => {
  console.log('🌟 CleanProfileSelector rendering');
  
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('monkey');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Animal avatar options - NEW ANIMALS
  const animalAvatars = [
    { id: 'monkey', name: 'Curious Monkey', emoji: '🐵', personality: 'Swift and adventurous' },
    { id: 'peacock', name: 'Pretty Peacock', emoji: '🦚', personality: 'Bright and cheerful' },
    { id: 'squirrel', name: 'Gentle Squirrel', emoji: '🐿️', personality: 'Kind and thoughtful' },
    { id: 'tiger', name: 'Playful Cub', emoji: '🐯', personality: 'Bold and brave' }
  ];

  const defaultColor = '#8B4513'; // Forest Brown

  // Clean initialization
  useEffect(() => {
    if (!initialProfiles) {
      loadProfiles();
    }
    
    // Cleanup function
    return () => {
      console.log('🧹 CleanProfileSelector cleanup');
    };
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
    console.log('🎯 Creating profile:', { newProfileName, selectedAvatar });
    
    if (!newProfileName.trim()) {
      return;
    }

    try {
      const selectedAnimal = animalAvatars.find(animal => animal.id === selectedAvatar);
      const avatarEmoji = selectedAnimal?.emoji || '🐵';
      
      const newProfile = GameStateManager.createProfile(
        newProfileName.trim(),
        avatarEmoji,
        defaultColor
      );
      
      if (newProfile && newProfile.id) {
        // Reset form
        setNewProfileName('');
        setSelectedAvatar('monkey');
        setShowCreateProfile(false);
        
        // Reload profiles
        loadProfiles();
        
        // Select the new profile
        onProfileSelect(newProfile.id);
      } else {
        console.error('Failed to create profile');
        alert('Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error creating profile. Please try again.');
    }
  };

  const handleSelectProfile = (profileId) => {
    console.log('🎯 Selecting profile:', profileId);
    onProfileSelect(profileId);
  };

  const confirmDelete = (profileId) => {
    try {
      GameStateManager.deleteProfile(profileId);
      loadProfiles();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const getAnimalId = (avatarData) => {
    if (typeof avatarData === 'string') {
      if (['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) {
        return avatarData;
      }
      
      const emojiToAnimal = {
        '🐵': 'monkey',
        '🦚': 'peacock', 
        '🐿️': 'squirrel',
        '🐯': 'tiger'
      };
      
      if (emojiToAnimal[avatarData]) {
        return emojiToAnimal[avatarData];
      }
    }
    
    return 'monkey'; // Default fallback
  };

  const profileArray = Object.values(profiles || {});
  const emptySlots = Math.max(0, 4 - profileArray.length);

  return (
    <div className="clean-profile-overlay">
      {/* Forest background */}
      <div className="clean-forest-background"></div>
      
      {/* Floating particles */}
      <div className="clean-floating-particles">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="clean-particle"
            style={{
              animationDelay: `${i * 0.8}s`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="clean-profile-container">
        <div className="clean-profile-header">
          <h2 className="clean-profile-title">Who's Playing Today?</h2>
          <button 
            className="clean-info-btn"
            onClick={() => setShowInfo(true)}
            aria-label="Profile information"
          >
            ℹ️
          </button>
        </div>
        <p className="clean-profile-subtitle">Who will join Ganesha on this magical journey?</p>
        
        <div className="clean-profiles-grid">
          {profileArray.map((profile) => {
            const animalId = getAnimalId(profile.avatar);
            const animalData = animalAvatars.find(a => a.id === animalId) || animalAvatars[0];
            
            return (
              <div 
                key={profile.id}
                className="clean-profile-card"
                onClick={() => handleSelectProfile(profile.id)}
              >
                {/* Animal avatar image */}
                <div className="clean-animal-avatar-container">
                  <img 
                    src={`/images/new-explorer-${animalId}.png`}
                    alt={animalData.name}
                    className="clean-animal-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div 
                    className="clean-emoji-fallback" 
                    style={{
                      display: 'none',
                      fontSize: '60px',
                      textAlign: 'center',
                      lineHeight: '90px',
                      color: '#fff'
                    }}
                  >
                    {profile.avatar}
                  </div>
                </div>
                
                <div className="clean-profile-content">
                  <div className="clean-profile-name">{profile.name}</div>
                  <div className="clean-animal-name">{animalData.name}</div>
                  <div className="clean-profile-stats">
                    <span>⭐ {profile.totalStars || 0}</span>
                    <span>🎯 {profile.completedScenes || 0}</span>
                  </div>
                </div>
                
                <button 
                  className="clean-delete-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(profile.id);
                  }}
                >
                  ×
                </button>
                
                {showDeleteConfirm === profile.id && (
                  <div className="clean-delete-confirm-popup">
                    <p>Say goodbye to {profile.name}'s adventure?</p>
                    <div className="clean-confirm-buttons">
                      <button onClick={() => confirmDelete(profile.id)} className="clean-confirm-yes">Yes</button>
                      <button onClick={() => setShowDeleteConfirm(null)} className="clean-confirm-no">Keep</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {[...Array(emptySlots)].map((_, index) => (
            
      <div 
  key={`empty-${index}`}
  className="clean-profile-card empty"
  onClick={() => setShowCreateProfile(true)}
>
  <div className="clean-add-profile">
    <div className="clean-add-icon">+</div>  {/* CHANGED from ✨ to + */}
    <div className="clean-add-text">New Explorer</div>
    <div className="clean-add-subtext">Join the adventure!</div>
  </div>
</div>
          ))}
        </div>
        
        {showCreateProfile && (
          <div className="clean-create-profile-modal-overlay">
            <div className="clean-create-profile-modal">
              <h3 style={{ color: '#8B4513', textAlign: 'center', fontSize: '24px', fontWeight: '700', marginBottom: '20px', marginTop: 0 }}>
                Create Your Explorer!
              </h3>
              
              <input
                type="text"
                placeholder="Enter your name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                maxLength={12}
                className="clean-name-input"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newProfileName.trim()) {
                    handleCreateProfile();
                  }
                }}
              />
              
              <div className="clean-avatar-selection">
                <p>Pick your Forest Friend:</p>
                <div className="clean-avatar-grid">
                  {animalAvatars.map((animal) => (
                    <div
                      key={animal.id}
                      className={`clean-avatar-option ${selectedAvatar === animal.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(animal.id)}
                    >
                      <img 
                        src={`/images/new-explorer-${animal.id}.png`}
                        alt={animal.name}
                        className="clean-avatar-image"
                      />
                      {/*<div className="clean-animal-name-only">{animal.name}</div>*/}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="clean-create-profile-buttons">
                <button 
                  onClick={handleCreateProfile}
                  className="clean-create-btn"
                  disabled={!newProfileName.trim()}
                >
                  Start Adventure!
                </button>
                <button 
                  onClick={() => setShowCreateProfile(false)}
                  className="clean-cancel-btn"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
        
        {onClose && (
          <button className="clean-close-selector" onClick={onClose}>
            ×
          </button>
        )}
        
        {showInfo && (
          <div className="clean-info-modal-overlay" onClick={() => setShowInfo(false)}>
            <div className="clean-info-modal" onClick={(e) => e.stopPropagation()}>
              <button className="clean-info-close" onClick={() => setShowInfo(false)}>×</button>
              
              <h3>📝 Profile Guide</h3>
              
              <div className="clean-info-section">
                <h4>✨ Create a New Profile</h4>
                <ol>
                  <li>Click on "New Explorer" card</li>
                  <li>Enter your name</li>
                  <li>Pick your favorite animal friend</li>
                  <li>Click "Start Adventure!"</li>
                </ol>
              </div>
              
              <div className="clean-info-section">
                <h4>🗑️ Delete a Profile</h4>
                <ol>
                  <li>Find the red ❌ button on top-right of profile</li>
                  <li>Click it to delete</li>
                  <li>Confirm to say goodbye</li>
                </ol>
              </div>
              
              <div className="clean-info-section">
                <h4>⚠️ Important</h4>
                <ul>
                  <li>You can create up to <strong>4 profiles</strong></li>
                  <li>Each profile saves your progress</li>
                  <li>Pick different animals for each explorer!</li>
                </ul>
              </div>
              
              <button className="clean-info-got-it" onClick={() => setShowInfo(false)}>
                Got it! 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanProfileSelector;