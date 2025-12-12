// CleanMapZone.jsx - Positions controlled by CSS Media Queries
import React, { useState, useEffect } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import ZonePreviewModal from './components/ZonePreviewModal';

console.log('🗺️ CleanMapZone loaded - CSS Positioning Enabled');

// Hardcoded zone data - 5 active zones
const ZONES_DATA = [
  {
    id: 'about-me-hut',
    name: 'About Me Hut',
    sequence: 5,
    scenes: [
      { id: 'game1', name: 'Family Tree' },
      { id: 'game2', name: 'Profile' },
      { id: 'game3', name: 'Avatar' }
    ]
  },
  {
    id: 'symbol-mountain',
    name: 'Symbol Mountain',
    sequence: 1,
    scenes: [
      { id: 'scene1', name: 'Introduction' },
      { id: 'scene2', name: 'Symbol Quiz' },
      { id: 'scene3', name: 'Matching Game' },
      { id: 'scene4', name: 'Final Challenge' }
    ]
  },
  {
    id: 'cave-of-secrets',
    name: 'Cave of Secrets',
    sequence: 2,
    scenes: [
      { id: 'scene1', name: 'Word Learning' },
      { id: 'scene2', name: 'Practice' },
      { id: 'scene3', name: 'Memory Game' },
      { id: 'scene4', name: 'Quiz' }
    ]
  },
  {
    id: 'shloka-river',
    name: 'Shloka River',
    sequence: 3,
    scenes: [
      { id: 'shloka-river-intro', name: 'Introduction' },
      { id: 'shloka-river-learn', name: 'Learn Shloka' },
      { id: 'shloka-river-practice', name: 'Practice' },
      { id: 'shloka-river-finale', name: 'Final Performance' }
    ]
  },
  {
    id: 'festival-square',
    name: 'Festival Square',
    sequence: 4,
    scenes: [
      { id: 'piano', name: 'Piano Game' },
      { id: 'rangoli', name: 'Rangoli Art' },
      { id: 'modak', name: 'Modak Cooking' },
      { id: 'mandap', name: 'Mandap Decoration' }
    ]
  }
];

// Zone images mapping
const zoneImages = {
  'about-me-hut': '/images/about-me-hut-map-icon.png',
  'symbol-mountain': '/images/symbol-mountain-map-icon.png',
  'cave-of-secrets': '/images/cave-of-secrets-map-icon.png',
  'festival-square': '/images/festival-square-map-icon.png',
  'shloka-river': '/images/shloka-river-map-icon.png'
};

// Zone emojis as fallback
const zoneEmojis = {
  'about-me-hut': '🏠',
  'symbol-mountain': '⛰️',
  'cave-of-secrets': '🕳️',
  'festival-square': '🎡',
  'shloka-river': '🌊'
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome }) => {
  const [zones] = useState(ZONES_DATA);
  const [zoneProgress, setZoneProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState({ 
    earnedStars: 0, 
    totalStars: 60, 
    percentage: 0 
  });
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  // Initialize and load progress
  useEffect(() => {
    loadBasicProgress();
    
    // Enable animations after component mounts
    const timer = setTimeout(() => {
      setAnimationsEnabled(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const loadBasicProgress = () => {
    try {
      const progressData = {};
      let totalEarned = 0;
      
      ZONES_DATA.forEach(zone => {
        let completedScenes = 0;
        let totalStars = 0;
        
        zone.scenes.forEach(scene => {
          const progress = GameStateManager.getSceneProgress(zone.id, scene.id);
          if (progress?.completed) {
            completedScenes++;
            totalStars += progress.stars || 0;
          }
        });
        
        progressData[zone.id] = {
          completedScenes: completedScenes,
          totalScenes: zone.scenes.length,
          stars: totalStars,
          percentage: Math.round((completedScenes / zone.scenes.length) * 100)
        };
        
        totalEarned += totalStars;
      });
      
      setZoneProgress(progressData);
      setOverallProgress(prev => ({
        ...prev,
        earnedStars: totalEarned,
        percentage: Math.min(100, Math.round((totalEarned / prev.totalStars) * 100))
      }));
      
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };
  
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleStartZone = (zone) => {
    if (onZoneSelect) {
      onZoneSelect(zone.id);
    }
  };

  const isZoneUnlocked = (zone) => true; // All unlocked

  return (
    <div className={`clean-map-container ${animationsEnabled ? 'animations-enabled' : ''}`}>
      {/* Map Background */}
      <div className="clean-map-background">
        <img 
          src="/images/map-background.png" 
          alt="Map Background"
          className="map-background-image"
        />
        <img 
          src="/images/fun zone gate.png" 
          alt="Fun Zone Gate"
          className="fun-zone-gate"
        />
      </div>
      
      {/* Zone Markers */}
      {zones.map((zone, index) => {
        const isUnlocked = isZoneUnlocked(zone);
        const progress = zoneProgress[zone.id];
        const zoneStars = progress ? progress.stars : 0;
        const completionPercentage = progress ? progress.percentage : 0;
        const isCompleted = completionPercentage >= 100;
        
        return (
          <div
            key={zone.id}
            // IMPORTANT: specific class `zone-${zone.id}` added here for CSS positioning
            className={`clean-zone-marker zone-${zone.id} ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} ${selectedZone?.id === zone.id ? 'selected' : ''}`}
            // IMPORTANT: No 'left' or 'top' here anymore. Only animation delay.
            style={{
              animationDelay: animationsEnabled ? `${index * 0.2}s` : '0s'
            }}
            onClick={() => isUnlocked && handleZoneClick(zone)}
          >
            {/* Sequence Number */}
            <div className="zone-sequence-number">
              {zone.sequence}
            </div>

            {/* Icon */}
            <div className="clean-zone-icon-wrapper">
              <img 
                src={zoneImages[zone.id]} 
                alt={zone.name}
                className="clean-zone-icon-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="clean-zone-icon-emoji" style={{ display: 'none' }}>
                {zoneEmojis[zone.id]}
              </div>
              
              {!isUnlocked && (
                <div className="clean-lock-overlay">
                  <span className="clean-lock-icon">🔒</span>
                </div>
              )}
            </div>
            
            {/* Label & Stars */}
            <div className="clean-zone-integrated-label">
              <span className="clean-zone-name">{zone.name}</span>
              {isUnlocked && (
                <div className="clean-zone-stars">
                  {'⭐'.repeat(Math.min(zoneStars, 3))}
                  {zoneStars > 3 && <span className="extra-stars"> +{zoneStars - 3}</span>}
                </div>
              )}
            </div>

            {/* Mini Progress Bar */}
            {isUnlocked && completionPercentage > 0 && (
              <div className="zone-progress-indicator">
                <div 
                  className="zone-progress-fill" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Overall Progress Bar */}
      <div className="clean-overall-progress">
        <div className="clean-progress-bar">
          <div 
            className="clean-progress-fill" 
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
        <span className="clean-progress-text">
          Journey Progress: {overallProgress.earnedStars} / {overallProgress.totalStars} Stars
        </span>
      </div>

      {/* Ganesha Decoration */}
      <div className="map-ganesha-character">
        <img 
          src="/images/welcome-ganesha.png" 
          alt="Ganesha"
          className="map-ganesha-image"
        />
      </div>

      {/* Back Button */}
      <button 
        className="map-back-button" 
        onClick={onBackToWelcome}
      >
        ← Back
      </button>

      {/* Header */}
      <div className="map-header">
        <h1 className="map-header-text">Click on any zone to begin! 🗺️</h1>
      </div>

      {/* Preview Modal */}
      {showZoneModal && selectedZone && (
        <ZonePreviewModal
          zone={selectedZone}
          onClose={() => {
            setShowZoneModal(false);
            setSelectedZone(null);
          }}
          onStartZone={handleStartZone}
          progress={zoneProgress[selectedZone.id]}
        />
      )}
    </div>
  );
};

export default CleanMapZone;