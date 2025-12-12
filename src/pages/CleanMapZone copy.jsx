// CleanMapZone.jsx - Simplified for zone selection only
// Path: pages/CleanMapZone.jsx

import React, { useState, useEffect } from 'react';
import './CleanMapZone.css';
import { getAllZones, calculateZoneProgress } from '../lib/components/zone/ZoneConfig';
import GameStateManager from '../lib/services/GameStateManager';

console.log('🗺️ CleanMapZone loaded - Simplified version');

// Zone images mapping
const zoneImages = {
  'about-me-hut': '/images/about-me-hut.png',
  'story-treehouse': '/images/story-treehouse.png',
  'symbol-mountain': '/images/symbol-mountain.png',
  'cave-of-secrets': '/images/cave-of-secrets.png',
  'obstacle-forest': '/images/obstacle-forest.png',
  'festival-square': '/images/festival-square.png',
  'shloka-river': '/images/shloka-river.png'
};

// Zone emojis as fallback
const zoneEmojis = {
  'about-me-hut': '🌲',
  'story-treehouse': '🏜️',
  'symbol-mountain': '🏔️',
  'cave-of-secrets': '🌈',
  'obstacle-forest': '🌊',
  'festival-square': '❄️',
  'shloka-river': '☁️'
};

// Zone positions on the map
const pathZonePositions = {
  'about-me-hut': {
    landscape: { x: 12, y: 70 },
    portrait: { x: 15, y: 75 }
  },
  'story-treehouse': {
    landscape: { x: 35, y: 55 },
    portrait: { x: 40, y: 60 }
  },
  'symbol-mountain': {
    landscape: { x: 25, y: 25 },
    portrait: { x: 30, y: 30 }
  },
  'cave-of-secrets': {
    landscape: { x: 50, y: 20 },
    portrait: { x: 55, y: 25 }
  },
  'obstacle-forest': {
    landscape: { x: 70, y: 35 },
    portrait: { x: 70, y: 40 }
  },
  'festival-square': {
    landscape: { x: 85, y: 60 },
    portrait: { x: 80, y: 65 }
  },
  'shloka-river': {
    landscape: { x: 75, y: 15 },
    portrait: { x: 75, y: 20 }
  }
};

const CleanMapZone = ({ onZoneSelect, currentZone, highlightedScene }) => {
  console.log('🗺️ CleanMapZone rendered with onZoneSelect:', typeof onZoneSelect);
  
  const [zones, setZones] = useState([]);
  const [zoneProgress, setZoneProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState({ 
    earnedStars: 0, 
    totalStars: 105,
    percentage: 0 
  });
  const [orientation, setOrientation] = useState('landscape');
  const [selectedZone, setSelectedZone] = useState(null);

  // Initialize zones and load progress
  useEffect(() => {
    console.log('🗺️ Initializing CleanMapZone...');
    initializeZones();
    loadZoneProgress();
    
    return () => {
      console.log('🧹 CleanMapZone cleanup');
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

  const initializeZones = () => {
    try {
      const allZones = getAllZones();
      console.log('🗺️ Loaded zones:', allZones.length);
      setZones(allZones);
    } catch (error) {
      console.error('Error loading zones:', error);
      setZones([]);
    }
  };

  const loadZoneProgress = () => {
    try {
      const progressData = {};
      let totalEarnedStars = 0;
      let totalPossibleStars = 0;

      const allZones = getAllZones();
      
      allZones.forEach(zone => {
        const sceneProgressData = {};
        
        // Load progress for each scene in the zone
        zone.scenes.forEach(scene => {
          const progress = GameStateManager.getSceneProgress(zone.id, scene.id);
          sceneProgressData[scene.id] = progress || { completed: false, stars: 0 };
        });
        
        // Calculate zone progress
        const zoneProgressCalc = calculateZoneProgress(zone.id, sceneProgressData);
        progressData[zone.id] = {
          ...zoneProgressCalc,
          sceneProgress: sceneProgressData
        };
        
        totalEarnedStars += zoneProgressCalc.stars;
        totalPossibleStars += zone.totalStars || (zone.scenes.length * 3);
      });
      
      setZoneProgress(progressData);
      setOverallProgress({
        earnedStars: totalEarnedStars,
        totalStars: totalPossibleStars,
        percentage: Math.round((totalEarnedStars / totalPossibleStars) * 100) || 0
      });
      
      console.log('📊 Zone progress loaded:', progressData);
      console.log('📊 Overall progress:', { totalEarnedStars, totalPossibleStars });
    } catch (error) {
      console.error('Error loading zone progress:', error);
      setZoneProgress({});
    }
  };
  
  const handleZoneClick = (zone) => {
    console.log('🎯 Zone clicked:', zone.id);
    setSelectedZone(zone);
    
    // Simple navigation - just pass zone ID to parent
    if (onZoneSelect) {
      onZoneSelect(zone.id);
    }
  };

  /*const isZoneUnlocked = (zone) => {
    // For now, keep the simple unlock logic
    if (zone.id === 'about-me-hut' || zone.id === 'story-treehouse' || zone.id === 'symbol-mountain') {
      return true;
    }
    
    // Check if zone meets star requirements
    return overallProgress.earnedStars >= (zone.requiredStars || 0);
  };*/

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
    <div className={`clean-map-container ${orientation}`}>
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
      </div>
      
      {/* Zone Markers */}
      {zones.map(zone => {
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
              top: `${position.y}%`
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
    </div>
  );
};

export default CleanMapZone;