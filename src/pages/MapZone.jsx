// MapZone.jsx - Updated with scene selection
import React, { useState, useEffect } from 'react';
import './MapZone.css';
import GameStateManager from '../lib/services/GameStateManager';

console.log('MapZone file loaded');

// Zone badge images (fallback to emoji where needed)
const zoneBadges = {
  'symbol-mountain': '/images/zone-badge/icon-symbolmtn.png',
  'about-me-hut': '/images/zone-badge/icon-aboutme.png'
};

// Use emoji icons for fallback
const zoneEmojis = {
  'symbol-mountain': '🏔️',
  'rainbow-valley': '🌈',
  'ocean-depths': '🌊',
  'sky-kingdom': '☁️',
  'forest-haven': '🌲',
  'desert-oasis': '🏜️',
  'ice-palace': '❄️',
  'volcano-peak': '🌋'
};

// Scene emojis
const sceneEmojis = {
  'modak': '🍯',
  'pond': '🪷'
};

// Zone positions for 8 zones - optimized for visual flow
const zonePositions = {
  'symbol-mountain': {
    landscape: { x: 15, y: 25 },
    portrait: { x: 20, y: 15 }
  },
  'rainbow-valley': {
    landscape: { x: 35, y: 20 },
    portrait: { x: 50, y: 22 }
  },
  'ocean-depths': {
    landscape: { x: 60, y: 30 },
    portrait: { x: 75, y: 35 }
  },
  'sky-kingdom': {
    landscape: { x: 75, y: 15 },
    portrait: { x: 65, y: 10 }
  },
  'forest-haven': {
    landscape: { x: 20, y: 55 },
    portrait: { x: 25, y: 50 }
  },
  'desert-oasis': {
    landscape: { x: 45, y: 65 },
    portrait: { x: 50, y: 60 }
  },
  'ice-palace': {
    landscape: { x: 70, y: 55 },
    portrait: { x: 75, y: 65 }
  },
  'volcano-peak': {
    landscape: { x: 85, y: 40 },
    portrait: { x: 85, y: 45 }
  }
};

// Default zones data with scenes
const defaultZones = [
  { 
    id: 'symbol-mountain', 
    name: 'Modak Mountain',
    icon: '🏔️', 
    unlocked: true, 
    stars: 0, 
    totalStars: 6,  // 3 stars per scene × 2 scenes
    description: 'Learn about Ganesha\'s sacred symbols in this magical modak mountain.',
    requiredStars: 0,
    scenes: [
      {
        id: 'modak',
        name: 'Modak Forest',
        emoji: '🍯',
        description: 'Help Mooshika collect sweet modaks',
        unlocked: true,
        order: 1
      },
      {
        id: 'pond',
        name: 'Sacred Pond',
        emoji: '🪷',
        description: 'Find lotus flowers and meet the elephant',
        unlocked: true,  // Both scenes available from start
        order: 2
      }
    ]
  },
  { 
    id: 'rainbow-valley', 
    name: 'Rainbow Valley', 
    icon: '🌈', 
    unlocked: false, 
    stars: 0, 
    totalStars: 15,
    description: 'Discover the colorful stories of wisdom and joy.',
    requiredStars: 6  // Complete Symbol Mountain first
  },
  // ... other zones remain the same
];

const MapZone = ({ onZoneSelect }) => {
  console.log('MapZone rendered with onZoneSelect:', typeof onZoneSelect);
  
  const [zones] = useState(defaultZones);
  const [progress] = useState({ 
    earnedStars: 0, 
    totalStars: 150, 
    percentage: 0 
  });
  
  const [orientation, setOrientation] = useState('landscape');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [sceneProgress, setSceneProgress] = useState({});

  // Load scene progress
  useEffect(() => {
    loadSceneProgress();
  }, []);

  const loadSceneProgress = () => {
    try {
      const modakProgress = GameStateManager.getSceneProgress('symbol-mountain', 'modak');
      const pondProgress = GameStateManager.getSceneProgress('symbol-mountain', 'pond');
      
      setSceneProgress({
        modak: modakProgress || { completed: false, stars: 0 },
        pond: pondProgress || { completed: false, stars: 0 }
      });
    } catch (error) {
      console.log('Error loading scene progress:', error);
      setSceneProgress({
        modak: { completed: false, stars: 0 },
        pond: { completed: false, stars: 0 }
      });
    }
  };
  
  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    
    // If zone has scenes, show scene selector, otherwise show zone details
    if (zone.scenes && zone.scenes.length > 0) {
      setShowSceneSelector(true);
    } else {
      setShowZoneDetails(true);
    }
  };
  
  const handleSceneSelect = (sceneId) => {
    console.log('Scene selected:', sceneId);
    if (onZoneSelect) {
      // Pass both zone and scene to App.jsx
      onZoneSelect(selectedZone.id, sceneId);
    }
    closeModals();
  };

  const getSceneStatus = (sceneId) => {
    const progress = sceneProgress[sceneId];
    if (!progress) return { status: 'available', stars: 0 };
    
    if (progress.completed) {
      return { status: 'completed', stars: progress.stars || 0 };
    } else if (progress.stars > 0) {
      return { status: 'in-progress', stars: progress.stars };
    } else {
      return { status: 'available', stars: 0 };
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`star ${i < count ? 'earned' : 'empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };
  
  const handleZoneEnter = () => {
    if (selectedZone && selectedZone.unlocked) {
      console.log('Entering zone:', selectedZone.id);
      if (onZoneSelect) {
        onZoneSelect(selectedZone.id);
      }
      closeModals();
    }
  };
  
  const closeModals = () => {
    setShowZoneDetails(false);
    setShowSceneSelector(false);
    setSelectedZone(null);
  };

  const renderZoneBadge = (zoneId, altText = 'Zone') => {
    const badgeSrc = zoneBadges[zoneId];
    if (badgeSrc) {
      return <img src={badgeSrc} alt={altText} className="zone-icon-image zone-detail-image" />;
    }
    return <span className="zone-icon-emoji-fallback">{zoneEmojis[zoneId]}</span>;
  };

  // Scene Selector Modal
  if (showSceneSelector && selectedZone) {
    return (
      <div className="zone-details-overlay" onClick={closeModals}>
        <div className="zone-details-modal scene-selector" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={closeModals}>×</button>
          
          <div className="zone-detail-icon">
            {renderZoneBadge(selectedZone.id, selectedZone.name)}
          </div>
          
          <h2>{selectedZone.name}</h2>
          <p>Choose your adventure:</p>
          
          <div className="scenes-grid">
            {selectedZone.scenes.map((scene) => {
              const status = getSceneStatus(scene.id);
              
              return (
                <div 
                  key={scene.id}
                  className={`scene-card ${status.status}`}
                  onClick={() => handleSceneSelect(scene.id)}
                >
                  <div className="scene-emoji">{scene.emoji}</div>
                  <h3>{scene.name}</h3>
                  <p>{scene.description}</p>
                  
                  <div className="scene-progress">
                    <div className="stars">
                      {renderStars(status.stars)}
                    </div>
                    <div className="status-text">
                      {status.status === 'completed' && '✅ Complete'}
                      {status.status === 'in-progress' && '🎯 In Progress'}
                      {status.status === 'available' && '🚀 Start Adventure'}
                    </div>
                  </div>
                  
                  <div className="recommended-order">
                    {scene.order === 1 && '🌟 Start Here'}
                    {scene.order === 2 && '⭐ Play Next'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flow-suggestion">
            <p>💡 <strong>Suggested Flow:</strong> Modak Forest first, then Sacred Pond</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`map-container ${orientation}`}>
      {/* Map Background - using gradient for now */}
      <div className="map-background" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #87CEEB 0%, #98D8C8 100%)',
        zIndex: -1
      }} />
      
      {/* Zone Markers */}
      {zones.map(zone => {
        const position = zonePositions[zone.id][orientation];
        const isUnlocked = zone.unlocked;
        const zoneProgress = zone.stars;
        
        return (
          <div
            key={zone.id}
            className={`zone-marker ${isUnlocked ? 'unlocked' : 'locked'} ${selectedZone?.id === zone.id ? 'selected' : ''}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            onClick={() => handleZoneClick(zone)}
          >
            {/* Zone Icon - using emoji */}
            <div className="zone-icon-wrapper">
              {renderZoneBadge(zone.id, zone.name)}
              {!isUnlocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </div>
            
            {/* Zone Name */}
            <div className="zone-label">
              <span className="zone-name">{zone.name}</span>
              {isUnlocked && (
                <div className="zone-stars">
                  {'⭐'.repeat(Math.min(zoneProgress, 3))} {'☆'.repeat(Math.max(0, Math.min(3, zone.totalStars) - zoneProgress))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Zone Details Modal (for zones without scenes) */}
      {showZoneDetails && selectedZone && (
        <div className="zone-details-overlay" onClick={closeModals}>
          <div className="zone-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModals}>×</button>
            
            <div className="zone-detail-icon">
              {renderZoneBadge(selectedZone.id, selectedZone.name)}
            </div>
            
            <h2>{selectedZone.name}</h2>
            
            <div className="zone-progress">
              <div className="stars-display">
                {[...Array(Math.min(selectedZone.totalStars, 5))].map((_, i) => (
                  <span key={i} className={i < selectedZone.stars ? 'star filled' : 'star'}>
                    {i < selectedZone.stars ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
              <p>{selectedZone.stars} / {selectedZone.totalStars} Stars</p>
            </div>
            
            {selectedZone.unlocked ? (
              <>
                <p className="zone-description">{selectedZone.description}</p>
                <button className="enter-button" onClick={handleZoneEnter}>
                  Enter Zone
                </button>
              </>
            ) : (
              <>
                <p className="locked-message">
                  Complete more stars to unlock this zone!
                </p>
                <div className="unlock-requirement">
                  Required: {selectedZone.requiredStars} stars
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Overall Progress Bar */}
      <div className="overall-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="progress-text">
          {progress.earnedStars} / {progress.totalStars} Total Stars
        </span>
      </div>
    </div>
  );
};

export default MapZone;
