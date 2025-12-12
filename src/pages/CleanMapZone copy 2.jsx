// CleanMapZone.jsx - Enhanced with animations and modals (5 zones only)
// Path: pages/CleanMapZone.jsx

import React, { useState, useEffect } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import ZonePreviewModal from './components/ZonePreviewModal';

console.log('🗺️ CleanMapZone loaded - Enhanced version with animations (5 zones)');

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


// Zone images mapping - 5 active zones
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

// Zone positions on the map - 5 zones
const pathZonePositions = {
  'about-me-hut': {
    landscape: { x: 12, y: 70 },
    portrait: { x: 15, y: 75 }
  },
  'symbol-mountain': {
    landscape: { x: 25, y: 25 },
    portrait: { x: 30, y: 30 }
  },
  'cave-of-secrets': {
    landscape: { x: 50, y: 20 },
    portrait: { x: 55, y: 25 }
  },
  'shloka-river': {
    landscape: { x: 75, y: 15 },
    portrait: { x: 75, y: 20 }
  },
  'festival-square': {
    landscape: { x: 85, y: 60 },
    portrait: { x: 80, y: 65 }
  }
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, currentZone, highlightedScene }) => {
  console.log('🗺️ CleanMapZone rendered with onZoneSelect:', typeof onZoneSelect);
  
  const [zones] = useState(ZONES_DATA);
  const [zoneProgress, setZoneProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState({ 
    earnedStars: 0, 
    totalStars: 60, // 5 zones × 12 stars max (approximate)
    percentage: 0 
  });
  const [orientation, setOrientation] = useState('landscape');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  // Initialize and load progress
  useEffect(() => {
    console.log('🗺️ Initializing CleanMapZone...');
    loadBasicProgress();
    
    // Enable animations after component mounts
    const timer = setTimeout(() => {
      setAnimationsEnabled(true);
    }, 300);
    
    return () => {
      console.log('🧹 CleanMapZone cleanup');
      clearTimeout(timer);
    };
  }, []);
  
  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const loadBasicProgress = () => {
    try {
      const progressData = {};
      
      // Simple progress loading - just check if scenes are completed
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
      });
      
      setZoneProgress(progressData);
      console.log('📊 Basic progress loaded:', progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
      setZoneProgress({});
    }
  };
  
  const handleZoneClick = (zone) => {
    console.log('🎯 Zone clicked:', zone.id);
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleStartZone = (zone) => {
    console.log('🚀 Starting zone:', zone.id);
    if (onZoneSelect) {
      onZoneSelect(zone.id);
    }
  };

  const isZoneUnlocked = (zone) => {
    // All zones unlocked for child exploration
    return true;
  };

  const getZoneStars = (zoneId) => {
    const progress = zoneProgress[zoneId];
    return progress ? progress.stars : 0;
  };

  const getZoneCompletionPercentage = (zoneId) => {
    const progress = zoneProgress[zoneId];
    return progress ? progress.percentage : 0;
  };
  
  return (
    <div className={`clean-map-container ${orientation} ${animationsEnabled ? 'animations-enabled' : ''}`}>
      {/* Map Background */}
      <div className="clean-map-background">
        <img 
          src="/images/map-background.png" 
          alt="Map Background"
          className="map-background-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        
        {/* Fun Zone Gate Decoration */}
        <img 
          src="/images/fun zone gate.png" 
          alt="Fun Zone Gate"
          className="fun-zone-gate"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {/* Zone Markers */}
      {zones.map((zone, index) => {
        const position = pathZonePositions[zone.id]?.[orientation] || { x: 50, y: 50 };
        const isUnlocked = isZoneUnlocked(zone);
        const zoneStars = getZoneStars(zone.id);
        const completionPercentage = getZoneCompletionPercentage(zone.id);
        const isCompleted = completionPercentage >= 100;
        
        return (
          <div
            key={zone.id}
            className={`clean-zone-marker ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} ${selectedZone?.id === zone.id ? 'selected' : ''}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              animationDelay: animationsEnabled ? `${index * 0.2}s` : '0s'
            }}
            onClick={() => isUnlocked && handleZoneClick(zone)}
          >
            {/* Zone Sequence Number */}
            <div className="zone-sequence-number">
              {zone.sequence}
            </div>

            {/* Zone Icon */}
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
              
              {/* Lock overlay for locked zones */}
              {!isUnlocked && (
                <div className="clean-lock-overlay">
                  <span className="clean-lock-icon">🔒</span>
                </div>
              )}
            </div>
            
            {/* Zone Label */}
            <div className="clean-zone-integrated-label">
              <span className="clean-zone-name">{zone.name}</span>
              {isUnlocked && (
                <div className="clean-zone-stars">
                  {'⭐'.repeat(Math.min(zoneStars, 3))} {'☆'.repeat(Math.max(0, 3 - zoneStars))}
                  {zoneStars > 3 && (
                    <span className="extra-stars"> +{zoneStars - 3}</span>
                  )}
                </div>
              )}
            </div>

            {/* Zone Progress Indicator */}
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
          Journey Progress: {overallProgress.earnedStars} / {overallProgress.totalStars} Stars ({overallProgress.percentage}%)
        </span>
      </div>

      {/* Ganesha Character on Side */}
      <div className="map-ganesha-character">
        <img 
          src="/images/welcome-ganesha.png" 
          alt="Ganesha"
          className="map-ganesha-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
        <div className="map-ganesha-emoji" style={{ display: 'none' }}>
          🐘
        </div>
      </div>

      {/* Back Button */}
      <button 
        className="map-back-button" 
        onClick={onBackToWelcome || (() => console.log('No back handler provided'))}
      >
        ← Back
      </button>

      {/* Simple Header */}
      <div className="map-header">
        <h1 className="map-header-text">Click on any zone to begin! 🗺️</h1>
      </div>

      {/* Zone Preview Modal */}
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