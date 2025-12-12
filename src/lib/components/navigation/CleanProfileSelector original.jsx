// CleanProfileSelector.jsx - NO conflicts, clean state management
import React, { useState, useEffect } from 'react';
import GameStateManager from '../../services/GameStateManager';
import './CleanProfileSelector.css';

const CleanProfileSelector = ({ onProfileSelect, onClose, profiles: initialProfiles }) => {
  console.log('🌟 CleanProfileSelector rendering');
  
  const [profiles, setProfiles] = useState(initialProfiles || {});
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('owl');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Animal avatar options
  const animalAvatars = [
    { id: 'owl', name: 'Wise Owl', emoji: '🦉', personality: 'Thoughtful and clever' },
    { id: 'panda', name: 'Gentle Panda', emoji: '🐼', personality: 'Kind and peaceful' },
    { id: 'tiger', name: 'Brave Tiger', emoji: '🐯', personality: 'Bold and adventurous' },
    { id: 'mouse', name: 'Quick Mouse', emoji: '🐭', personality: 'Swift and curious' }
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
      const avatarEmoji = selectedAnimal?.emoji || '🦉';
      
      const newProfile = GameStateManager.createProfile(
        newProfileName.trim(),
        avatarEmoji,
        defaultColor
      );
      
      if (newProfile && newProfile.id) {
        // Reset form
        setNewProfileName('');
        setSelectedAvatar('owl');
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
      if (['owl', 'panda', 'tiger', 'mouse'].includes(avatarData)) {
        return avatarData;
      }
      
      const emojiToAnimal = {
        '🦉': 'owl',
        '🐼': 'panda', 
        '🐯': 'tiger',
        '🐭': 'mouse'
      };
      
      if (emojiToAnimal[avatarData]) {
        return emojiToAnimal[avatarData];
      }
    }
    
    return 'owl'; // Default fallback
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
        <h2 className="clean-profile-title">Choose Your Forest Friend</h2>
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
                <div className="clean-add-icon">✨</div>
                <div className="clean-add-text">New Explorer</div>
                <div className="clean-add-subtext">Join the adventure!</div>
              </div>
            </div>
          ))}
        </div>
        
        {showCreateProfile && (
          <div className="clean-create-profile-modal">
            <h3>Create Your Forest Friend</h3>
            <p className="clean-modal-subtitle">Choose your companion for the magical journey ahead!</p>
            
            <input
              type="text"
              placeholder="What's your name, explorer?"
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
              <p>Choose your forest animal guide:</p>
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
                    <div className="clean-animal-info">
                      <div className="clean-animal-name-small">{animal.name}</div>
                      <div className="clean-animal-personality">{animal.personality}</div>
                    </div>
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
                Begin Adventure ✨
              </button>
              <button 
                onClick={() => setShowCreateProfile(false)}
                className="clean-cancel-btn"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
        
        {onClose && (
          <button className="clean-close-selector" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default CleanProfileSelector;