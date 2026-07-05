// CleanMapZone.jsx - Path-Based Journey Design
import React, { useState, useEffect } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';

console.log('CleanMapZone file loaded');

// Zone images mapping - using your actual images
const zoneImages = {
  'about-me-hut': '/images/about-me-hut.webp',
  'story-treehouse': '/images/story-treehouse.webp',
  'symbol-mountain': '/images/symbol-mountain.webp',
  'cave-of-secrets': '/images/cave-of-secrets.webp',
  'obstacle-forest': '/images/obstacle-forest.webp',
  'festival-square': '/images/festival-square.webp',
  'shloka-river': '/images/shloka-river.webp'
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

// Scene emojis
const sceneEmojis = {
  'modak': '🍯',
  'pond': '🪷'
};

// PATH-BASED ZONE POSITIONS - Following the journey sequence
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

// Path dots positions
const pathDots = [
  { x: 22, y: 65 },
  { x: 30, y: 45 },
  { x: 35, y: 22 },
  { x: 58, y: 25 },
  { x: 75, y: 25 },
  { x: 80, y: 45 }
];

// REORDERED ZONES for path-based journey (1-7 sequence)
const defaultZones = [
  { 
    id: 'about-me-hut', 
    name: 'About Me Hut', 
    icon: '🌲', 
    unlocked: true, 
    stars: 0, 
    totalStars: 9,
    description: 'Start your journey! Discover your inner self and personal growth.',
    requiredStars: 0,
    sequence: 1
  },
  { 
    id: 'story-treehouse', 
    name: 'Story Treehouse', 
    icon: '🏜️', 
    unlocked: true,
    stars: 0, 
    totalStars: 21,
    description: 'Listen to magical tales from ancient times.',
    requiredStars: 0,
    sequence: 2
  },
  { 
    id: 'symbol-mountain', 
    name: 'Symbol Mountain', 
    icon: '🏔️', 
    unlocked: true, 
    stars: 0, 
    totalStars: 6,
    description: 'Learn about Ganesha\'s sacred symbols in this mystical mountain.',
    requiredStars: 6,
    sequence: 3,
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
        unlocked: true,
        order: 2
      }
    ]
  },
  { 
    id: 'cave-of-secrets', 
    name: 'Cave of Secrets', 
    icon: '🌈', 
    unlocked: false,
    stars: 0, 
    totalStars: 15,
    description: 'Discover hidden treasures and ancient wisdom.',
    requiredStars: 15,
    sequence: 4
  },
  { 
    id: 'obstacle-forest', 
    name: 'Obstacle Forest', 
    icon: '🌊', 
    unlocked: false,
    stars: 0, 
    totalStars: 12,
    description: 'Navigate through challenges with courage and wit.',
    requiredStars: 25,
    sequence: 5
  },
  { 
    id: 'festival-square', 
    name: 'Festival Square', 
    icon: '❄️', 
    unlocked: false,
    stars: 0, 
    totalStars: 24,
    description: 'Celebrate with music, dance, and joy!',
    requiredStars: 40,
    sequence: 6
  },
  { 
    id: 'shloka-river', 
    name: 'Shloka River', 
    icon: '☁️', 
    unlocked: false,
    stars: 0, 
    totalStars: 18,
    description: 'Learn sacred chants by the flowing waters.',
    requiredStars: 60,
    sequence: 7
  }
];

const CleanMapZone = ({ onZoneSelect }) => {
  console.log('🌟 CleanMapZone rendered with onZoneSelect:', typeof onZoneSelect);
  
  const [zones] = useState(defaultZones);
  const [progress] = useState({ 
    earnedStars: 0, 
    totalStars: 105,
    percentage: 0 
  });
  
  const [orientation, setOrientation] = useState('landscape');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [sceneProgress, setSceneProgress] = useState({});

  // Clean initialization
  useEffect(() => {
    loadSceneProgress();
    
    return () => {
      console.log('🧹 CleanMapZone cleanup');
      closeModals();
    };
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
    
    if (zone.scenes && zone.scenes.length > 0) {
      setShowSceneSelector(true);
    } else {
      setShowZoneDetails(true);
    }
  };
  
  const handleSceneSelect = (sceneId) => {
    console.log('🎯 Scene selected:', sceneId);
    if (onZoneSelect) {
      onZoneSelect(selectedZone.id, sceneId);
    }
    closeModals();
  };

const getSceneStatus = (sceneId) => {
  const progress = sceneProgress[sceneId];
  
  // Check if scene should be unlocked
  const isUnlocked = checkSceneUnlocked(sceneId);
  
  if (!isUnlocked) {
    return { status: 'locked', stars: 0 };
  }
  
  if (!progress) return { status: 'available', stars: 0 };
  
  if (progress.completed) {
    return { status: 'completed', stars: progress.stars || 0 };
  } else if (progress.stars > 0) {
    return { status: 'in-progress', stars: progress.stars };
  } else {
    return { status: 'available', stars: 0 };
  }
};

const checkSceneUnlocked = (sceneId) => {
  // Modak is always unlocked (first scene)
  if (sceneId === 'modak') return true;
  
  // For pond scene, check if modak is completed
  if (sceneId === 'pond') {
    const modakProgress = sceneProgress['modak'];
    return modakProgress && modakProgress.completed;
  }
  
  // For future scenes, check previous scene completion
  return false;
};

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`clean-star ${i < count ? 'earned' : 'empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };
  
  const handleZoneEnter = () => {
    if (selectedZone && selectedZone.unlocked) {
      console.log('🎯 Entering zone:', selectedZone.id);
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

  // Scene Selector Modal
  if (showSceneSelector && selectedZone) {
    return (
    <div className={`clean-zone-details-overlay zone-${selectedZone.id}`} onClick={closeModals}>
        <div className="clean-zone-details-modal clean-scene-selector" onClick={e => e.stopPropagation()}>

            {/* ADD THIS BACK BUTTON */}
        <button className="zone-back-button" onClick={closeModals}>
          ← Back to Map
        </button>
          <button className="clean-close-button" onClick={closeModals}>×</button>
          
          <div className="clean-zone-detail-icon">
            <img 
              src={zoneImages[selectedZone.id]} 
              alt={selectedZone.name}
              className="clean-zone-detail-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="clean-zone-emoji-fallback" style={{ display: 'none' }}>
              {zoneEmojis[selectedZone.id]}
            </div>
          </div>
          
          <h2>{selectedZone.name}</h2>
          <p>Choose your adventure:</p>
          
          <div className="clean-scenes-grid">
  {selectedZone.scenes.map((scene) => {
    const status = getSceneStatus(scene.id);
    
    return (
      <div 
        key={scene.id}
        className={`clean-scene-card ${status.status}`}
        onClick={() => status.status !== 'locked' ? handleSceneSelect(scene.id) : null}
      >
        {/* Order indicator for first scenes */}
        {scene.order === 1 && <div className="scene-order-indicator">1</div>}
        {scene.order === 2 && <div className="scene-order-indicator">2</div>}
        
        {/* Main scene icon */}
        <div className="scene-icon-container">
          <div className="scene-status-ring"></div>
          <div className="clean-scene-emoji">{scene.emoji}</div>
          
          {/* Lock overlay */}
          {status.status === 'locked' && (
            <div className="scene-lock-overlay">
              <span className="scene-lock-icon">🔒</span>
            </div>
          )}
        </div>
        
        {/* Simple stars display */}
        {status.stars > 0 && (
          <div className="scene-simple-stars">
            {status.stars}⭐
          </div>
        )}
        
        {/* Clean name badge */}
        <div className="scene-name-badge">
          {scene.name}
        </div>
      </div>
    );
  })}
</div>

          <div className="clean-flow-suggestion">
            <p>💡 <strong>Suggested Flow:</strong> Modak Forest first, then Sacred Pond</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`clean-map-container ${orientation}`}>
      {/* Map Background */}
      <div className="clean-map-background">
        <img 
          src="/images/map-background.webp" 
          alt="Map Background"
          className="map-background-image"
          onError={(e) => {
            // Fallback to gradient if image fails
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {/* Winding River Path SVG - like image 2 */}
      <div className="path-container">
        <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path 
            className="winding-path"
            d="M 8 75 Q 20 65 35 60 Q 50 55 30 30 Q 40 25 55 25 Q 70 25 75 40 Q 80 50 88 65 Q 85 50 78 20"
            fill="none"
          />
          {/* Additional river branches */}
          <path 
            className="winding-path"
            d="M 55 25 Q 65 30 75 40"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Path Dots */}
      {pathDots.map((dot, index) => (
        <div
          key={index}
          className="path-dot"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animationDelay: `${index * 0.3}s`
          }}
        />
      ))}
      
      {/* Zone Markers - NO MORE SPEECH BUBBLES */}
      {zones.map(zone => {
        const position = pathZonePositions[zone.id][orientation];
        const isUnlocked = zone.unlocked;
        const zoneProgress = zone.stars;
        const isCompleted = zoneProgress >= 3;
        
        return (
          <div
            key={zone.id}
            className={`clean-zone-marker ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} ${selectedZone?.id === zone.id ? 'selected' : ''}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            onClick={() => handleZoneClick(zone)}
          >
            {/* Zone Sequence Number */}
            <div className="zone-sequence-number">
              {zone.sequence}
            </div>

            {/* Zone Icon - Clean circular design */}
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
            
            {/* Zone Label - Integrated design like image 2 */}
            <div className="clean-zone-integrated-label">
              <span className="clean-zone-name">{zone.name}</span>
              {isUnlocked && (
                <div className="clean-zone-stars">
                  {'⭐'.repeat(Math.min(zoneProgress, 3))} {'☆'.repeat(Math.max(0, Math.min(3, zone.totalStars) - zoneProgress))}
                </div>
              )}
            </div>

            {/* Zone Progress Indicator */}
            {isUnlocked && (
              <div className="zone-progress-indicator">
                <div 
                  className="zone-progress-fill" 
                  style={{ width: `${(zoneProgress / Math.min(zone.totalStars, 3)) * 100}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Zone Details Modal */}
      {showZoneDetails && selectedZone && (
        <div className="clean-zone-details-overlay" onClick={closeModals}>
          <div className="clean-zone-details-modal" onClick={e => e.stopPropagation()}>
            <button className="clean-close-button" onClick={closeModals}>×</button>
            
            <div className="clean-zone-detail-icon">
              <img 
                src={zoneImages[selectedZone.id]} 
                alt={selectedZone.name}
                className="clean-zone-detail-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="clean-zone-emoji-fallback" style={{ display: 'none' }}>
                {zoneEmojis[selectedZone.id]}
              </div>
            </div>
            
            <h2>{selectedZone.name}</h2>
            
            <div className="clean-zone-progress">
              <div className="clean-stars-display">
                {[...Array(Math.min(selectedZone.totalStars, 5))].map((_, i) => (
                  <span key={i} className={i < selectedZone.stars ? 'clean-star filled' : 'clean-star'}>
                    {i < selectedZone.stars ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
              <p>{selectedZone.stars} / {selectedZone.totalStars} Stars</p>
            </div>
            
            {selectedZone.unlocked ? (
              <>
                <p className="clean-zone-description">{selectedZone.description}</p>
                <button className="clean-enter-button" onClick={handleZoneEnter}>
                  Enter Zone
                </button>
              </>
            ) : (
              <>
                <p className="clean-locked-message">
                  Complete more stars to unlock this zone!
                </p>
                <div className="clean-unlock-requirement">
                  Required: {selectedZone.requiredStars} stars
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Overall Progress Bar */}
      <div className="clean-overall-progress">
        <div className="clean-progress-bar">
          <div 
            className="clean-progress-fill" 
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="clean-progress-text">
          Journey Progress: {progress.earnedStars} / {progress.totalStars} Stars
        </span>
      </div>
    </div>
  );
};

export default CleanMapZone;