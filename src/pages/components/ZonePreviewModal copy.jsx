// ZonePreviewModal.jsx - Zone preview card when clicking on map zones
import React from 'react';
import './ZonePreviewModal.css';

// Zone content configuration - Currently 5 active zones
const zoneContent = {
  'symbol-mountain': {
    tagline: "Where Sacred Symbols Come to Life",
    type: 'learning',
    icon: '📚',
    description: [
      '🎯 Discover Ganesha\'s 8 sacred symbols',
      '🎮 Play fun matching games',
      '⭐ Unlock scenes one by one as you learn'
    ],
    totalScenes: 4
  },
  'shloka-river': {
    tagline: "Where Sanskrit Sounds Like Music",
    type: 'learning',
    icon: '📚',
    description: [
      '🎵 Learn beautiful Sanskrit shlokas',
      '🐘 Help animals with memory games',
      '⭐ Master each shloka to unlock the next'
    ],
    totalScenes: 4
  },
  'cave-of-secrets': {
    tagline: "Where Words Become Wisdom",
    type: 'learning',
    icon: '📚',
    description: [
      '✨ Learn Sanskrit words with Ganesha',
      '🎯 Practice with fun activities',
      '⭐ Complete each lesson to continue'
    ],
    totalScenes: 4
  },
  'festival-square': {
    tagline: "Where Celebration Feels Like Home",
    type: 'fun',
    icon: '🎪',
    description: [
      '🎨 Create beautiful rangoli art',
      '🎹 Play festive music',
      '🎉 All games unlocked - play anytime!'
    ],
    totalScenes: 4
  },
  'about-me-hut': {
    tagline: "Where Your Story Begins",
    type: 'fun',
    icon: '✨',
    description: [
      '🌟 Create your explorer profile',
      '🎭 Choose your adventure character',
      '🎉 All activities available anytime!'
    ],
    totalScenes: 3
  }
};

const ZonePreviewModal = ({ zone, onClose, onStartZone, progress }) => {
  if (!zone) return null;

  const content = zoneContent[zone.id] || {
    tagline: zone.name,
    type: 'learning',
    icon: '📚',
    description: ['Explore this zone!'],
    totalScenes: zone.scenes?.length || 4
  };

  const isLearningZone = content.type === 'learning';
  const completedScenes = progress?.completedScenes || 0;
  const totalScenes = content.totalScenes;
  const currentStars = progress?.stars || 0;

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div className="zone-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Ganesha Character */}
        <div className="zone-modal-character">
          <img 
            src="/images/welcome-ganesha.png" 
            alt="Ganesha"
            className="zone-modal-ganesha"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="zone-modal-sparkles">
            <span className="sparkle">✨</span>
            <span className="sparkle">⭐</span>
            <span className="sparkle">✨</span>
          </div>
        </div>

        {/* Zone Type Badge */}
        <div className={`zone-type-badge ${content.type}`}>
          <span className="zone-type-icon">{content.icon}</span>
          <span className="zone-type-text">
            {isLearningZone ? 'Learning Zone' : 'Fun Zone'}
          </span>
        </div>

        {/* Zone Title */}
        <h2 className="zone-modal-title">{zone.name}</h2>
        <p className="zone-modal-tagline">{content.tagline}</p>

        {/* Zone Description */}
        <div className="zone-modal-description">
          {content.description.map((item, index) => (
            <div key={index} className="zone-modal-feature">
              {item}
            </div>
          ))}
        </div>

        {/* Progress Info for Learning Zones */}
        {isLearningZone && (
          <div className="zone-modal-progress">
            <div className="progress-label">
              📖 Your Progress: Scene {completedScenes} of {totalScenes}
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${(completedScenes / totalScenes) * 100}%` }}
              />
            </div>
            {currentStars > 0 && (
              <div className="current-stars">
                ⭐ {currentStars} stars earned!
              </div>
            )}
          </div>
        )}

        {/* Fun Zone Notice */}
        {!isLearningZone && (
          <div className="zone-modal-fun-notice">
            🎉 All activities unlocked - Play anytime!
          </div>
        )}

        {/* Action Buttons */}
        <div className="zone-modal-buttons">
          <button 
            className="zone-modal-button primary"
            onClick={() => {
              onStartZone(zone);
              onClose();
            }}
          >
            {isLearningZone ? 'Start Learning!' : 'Let\'s Play!'}
          </button>
          <button 
            className="zone-modal-button secondary"
            onClick={onClose}
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonePreviewModal;