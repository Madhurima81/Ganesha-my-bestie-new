// ZoneWelcome.jsx - Updated with Disney/PBS Unlock Detection System
// Path: lib/components/zone/ZoneWelcome.jsx

import React, { useState, useEffect } from 'react';
import './ZoneWelcome.css';
import { getZoneTheme } from '../../config/ZoneThemes';
import ScreenHeader from '../shared/ScreenHeader';
import GameStateManager from '../../services/GameStateManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import HomeButton from '../ui/HomeButton';


//import ProgressManager from '../../services/ProgressManager';
// In ZoneWelcome.jsx

// ✅ ZONE CONTENT CONFIGURATION
const ZONE_CONTENT_TYPES = {
  'symbol-mountain': ['symbols'],
  'shloka-river': ['chants'],
  'story-treehouse': ['stories'], 
  'festival-square': [], // ✅ CHANGE: Empty array since it's pure fun games
  'about-me-hut': [],
  'cave-of-secrets': ['meanings'], // ✅ FIXED: Cave teaches Sanskrit word meanings
  'obstacle-forest': ['symbols']
};

// ✅ ENHANCED: More specific color mapping


const ZoneWelcome = ({ 
  zoneData,           // Zone configuration object
  onSceneSelect,      // Function to navigate to specific scene
  onBackToMap,        // Function to return to map
  onNavigate          // General navigation function
}) => {
  const [sceneProgress, setSceneProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [culturalData, setCulturalData] = useState(null); // ← ADD THIS LINE

  console.log('🏔️ ZoneWelcome rendered for zone:', zoneData?.name);

  // Add this near the top of ZoneWelcome component:
  const [highlightedScene, setHighlightedScene] = useState(null);


// ✅ ADD THIS: Track zone entry time for quick navigation detection
  useEffect(() => {
    if (zoneData?.id) {
      const entryTime = Date.now();
      sessionStorage.setItem(`zone_entry_${zoneData.id}`, entryTime.toString());
      console.log(`📍 Zone entry tracked: ${zoneData.id} at ${entryTime}`);
    }
  }, [zoneData?.id]);

  // Add this useEffect to detect context:
  useEffect(() => {
    // You can pass context through URL params or props
    const urlParams = new URLSearchParams(window.location.search);
    const context = urlParams.get('context');
    const fromScene = urlParams.get('fromScene');
    
    if (context === 'replay' && fromScene) {
      setHighlightedScene(fromScene); // Highlight the scene they want to replay
    } else if (context === 'continue') {
      // Highlight next unlocked scene
      const nextScene = getNextUnlockedScene();
      setHighlightedScene(nextScene);
    }
  }, []);

  // Load scene progress for this zone
  useEffect(() => {
    if (!zoneData) return;
    
    loadSceneProgress();
    setIsLoading(false);
  }, [zoneData]);

  // Add this line:

const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);

// Import the session manager at the top



// ✨ DISNEY PATTERN: Load cultural progress data
useEffect(() => {
  const loadCulturalData = () => {
    try {
      const data = CulturalProgressExtractor.getCulturalProgressData();
      setCulturalData(data);
      console.log('🎒 Cultural data loaded for zone:', data);
    } catch (error) {
      console.error('Error loading cultural data:', error);
      setCulturalData(null);
    }
  };
  
  // Load initially and when scene progress changes
  if (Object.keys(sceneProgress).length > 0) {
    loadCulturalData();
  }
}, [sceneProgress, zoneData?.id]); // Reload when scenes update

// Debug useEffect to check scene statuses
useEffect(() => {
  if (!zoneData?.scenes || !sceneProgress || Object.keys(sceneProgress).length === 0) return;
  
  console.log('🔍 SCENE STATUS DEBUG - Each Scene:');
  zoneData.scenes.forEach(scene => {
    const progress = sceneProgress[scene.id];
    const status = getSceneStatus(scene);
    
    console.log(`${scene.id}:`, {
      'Status': status.status,
      'Stars': status.stars,
      'Raw Progress': progress,
      'Completed Flag': progress?.completed,
      'Progress Percentage': progress?.progress?.percentage
    });
  });
}, [sceneProgress, zoneData]); // Triggers when sceneProgress updates

// ✅ FIXED: Check BOTH permanent AND temporary storage
const loadSceneProgress = () => {
  if (!zoneData || !zoneData.scenes) return;
  
  try {
    const activeProfileId = localStorage.getItem('activeProfileId');
    console.log('🔍 COMBINED: Loading progress for profile:', activeProfileId);
    
    // ✅ Get permanent completion data from GameStateManager
    const gameProgress = GameStateManager.getGameProgress();
    const zoneProgress = gameProgress.zones?.[zoneData.id] || { scenes: {} };
    
    console.log('📊 PERMANENT: Zone progress loaded:', zoneProgress);
    
    const progressData = {};
    let completedScenes = 0;
    let totalStars = 0;
    
    zoneData.scenes.forEach(scene => {
      const sceneData = zoneProgress.scenes?.[scene.id] || {};
      const isCompleted = sceneData.completed || false;
      const stars = sceneData.stars || 0;
      
      // ✅ NEW: Check SceneManager's temporary storage for in-progress
      const tempKey = `temp_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
      const tempData = localStorage.getItem(tempKey);
      let hasInProgressData = false;
      let progressPercentage = 0;
      let tempStars = 0;
      
      if (tempData && !isCompleted) {
        try {
          const tempState = JSON.parse(tempData);

          // Check if scene has meaningful progress
          hasInProgressData = (
            tempState.stars > 0 || 
            tempState.mooshikaFound || 
            tempState.collectedModaks?.length > 0 ||
            tempState.lotusStates?.some(state => state === 1) ||
            tempState.placedGaneshaMembers?.length > 0 ||
            tempState.childFamily?.length > 0 ||
            (tempState.phase && tempState.phase !== 'mooshika_search' && tempState.phase !== 'initial') ||
            (tempState.gamePhase && !['intro', 'initial'].includes(tempState.gamePhase))
          );
          progressPercentage = tempState.progress?.percentage || 0;
          tempStars = tempState.stars || 0;
          console.log(`🔍 TEMP CHECK: ${scene.id} has progress:`, hasInProgressData, 'percentage:', progressPercentage, 'tempStars:', tempStars);
        } catch (e) {
          console.error('Error parsing temp data:', e);
        }
      }
      
      if (isCompleted) completedScenes++;
      totalStars += stars;
      
      progressData[scene.id] = {
        completed: isCompleted,
        stars: isCompleted ? stars : tempStars, // Use temp stars if not completed
        unlocked: sceneData.unlocked || scene.order === 1,
        // ✅ NEW: Add progress structure that getSceneStatus expects
        progress: {
          percentage: isCompleted ? 100 : progressPercentage,
          hasInProgress: hasInProgressData
        }
      };
    });
    
    setSceneProgress(progressData);
    console.log('🔍 COMBINED PROGRESS DATA:', progressData);

    // ✅ ENHANCED DEBUG with combined data
    console.log('📊 COMBINED: Final progress totals:', {
      'Completed Scenes': completedScenes,
      'Total Scenes': zoneData.scenes.length,
      'Total Stars': totalStars,
      'Progress Data': progressData
    });
    
  } catch (error) {
    console.log('Error loading scene progress:', error);
    // Initialize with empty progress
    const emptyProgress = {};
    zoneData.scenes.forEach(scene => {
      emptyProgress[scene.id] = { 
        completed: false, 
        stars: 0, 
        unlocked: scene.order === 1,
        progress: { percentage: 0, hasInProgress: false }
      };
    });
    setSceneProgress(emptyProgress);
  }
};

// ✅ NEW: Get relevant cards for current zone
const getRelevantCards = () => {
  const zoneId = zoneData?.id || 'symbol-mountain';
  const contentTypes = ZONE_CONTENT_TYPES[zoneId] || ['symbols'];
  
  const cards = [];
  
  // Add content-specific cards
  contentTypes.forEach(type => {
    cards.push(type);
  });
  
  // Always add universal cards
  cards.push('level', 'progress');
  
  return cards;
};

const getZoneStats = () => {
  if (!sceneProgress || !zoneData?.scenes) {
    return { symbols: 0, stories: 0, chants: 0, completed: 0, total: zoneData?.scenes?.length || 4 };
  }

  let completed = 0;

  zoneData.scenes.forEach(scene => {
    const progress = sceneProgress[scene.id];
    if (progress?.completed) {
      completed++;
    }
  });

  // ✅ NEW: Get actual cultural data for this zone
  const culturalData = CulturalProgressExtractor.getCulturalProgressData();
  
  // For Symbol Mountain, show actual symbols collected
  const zoneId = zoneData?.id || 'symbol-mountain';
  let symbols = 0;
  let stories = 0;
  let chants = 0;
  let meanings = 0; // ✅ ADD: For Cave of Secrets

  if (zoneId === 'symbol-mountain') {
    symbols = culturalData?.symbolsCount || 0;
  } else if (zoneId === 'story-treehouse') {
    stories = culturalData?.storiesCount || 0;
  } else if (zoneId === 'shloka-river') {
    chants = culturalData?.chantsCount || 0;
  } else if (zoneId === 'cave-of-secrets') {
    meanings = culturalData?.meaningsCount || 0; // ✅ FIXED: Cave shows meanings
  }

  return { symbols, stories, chants, meanings, completed, total: zoneData.scenes.length };
};

// ✅ NEW: Render individual card
const renderStatCard = (cardType, stats) => {
  switch (cardType) {
    case 'symbols':
      return (
        <div key="symbols" className="stat-card symbols">
          <div className="stat-icon">🕉️</div>
          <div className="stat-number">{stats.symbols}</div>
          <div className="stat-label">Symbols</div>
        </div>
      );
      
    case 'stories':
      return (
        <div key="stories" className="stat-card stories">
          <div className="stat-icon">📜</div>
          <div className="stat-number">{stats.stories}</div>
          <div className="stat-label">Stories</div>
        </div>
      );
      
    case 'chants':
      return (
        <div key="chants" className="stat-card chants">
          <div className="stat-icon">🎵</div>
          <div className="stat-number">{stats.chants}</div>
          <div className="stat-label">Chants</div>
        </div>
      );
      
    case 'meanings': // ✅ ADD: For Cave of Secrets Sanskrit words
      return (
        <div key="meanings" className="stat-card meanings">
          <div className="stat-icon">📖</div>
          <div className="stat-number">{stats.meanings}</div>
          <div className="stat-label">Meanings</div>
        </div>
      );
      
    case 'level':
      return (
        <div key="level" className="stat-card level">
          <div className="stat-icon">🔍</div>
          <div className="stat-text">Wisdom Seeker</div>
        </div>
      );
      
    case 'progress':
      return (
        <div key="progress" className="stat-card progress">
          <div className="stat-icon">🎒</div>
          <div className="stat-number">{stats.completed}/{stats.total}</div>
          <div className="stat-label">Adventures</div>
        </div>
      );
      
    default:
      return null;
  }
};

const getSceneStatus = (scene) => {
  const progress = sceneProgress[scene.id];
  const isUnlocked = checkSceneUnlocked(scene);
  
  if (!isUnlocked) {
    return { status: 'locked', stars: 0 };
  }
  
  if (!progress) return { status: 'available', stars: 0 };

  
  
  const activeProfileId = localStorage.getItem('activeProfileId');
  const tempKey = `temp_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
  const tempData = localStorage.getItem(tempKey);
  

  
 // ✅ ADD THIS NEW CHECK at the top of temp data parsing:
if (tempData) {
  try {
    const tempState = JSON.parse(tempData);
    
    // ✅ NEW: Check for completion screen showing (still in-progress)
    if (tempState.showingCompletionScreen === true) {
      console.log(`🎬 COMPLETION SCREEN: ${scene.id} showing completion screen`);
      return { status: 'in-progress', stars: tempState.stars || 0 };
    }
      
      // ✅ SCENE-SPECIFIC COMPLETION DETECTION
      let isCompleteInTemp = false;
      
      if (scene.id === 'modak') {
        // Modak is complete if: phase is complete OR rockTransformed OR completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' 
          //tempState.rockTransformed === true
        );
      } else if (scene.id === 'pond') {
        // Pond is complete if: phase is complete OR (elephantTransformed AND goldenLotusBloom) OR completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          (tempState.elephantTransformed === true && tempState.goldenLotusBloom === true)
        );
        } else if (scene.id === 'symbol') {
  // Symbol is complete if: phase is all_complete OR ganeshaComplete OR completed flag  
  isCompleteInTemp = (
    tempState.completed === true ||
    //tempState.phase === 'complete' ||
    tempState.phase === 'all_complete' ||      // ← KEY: Symbol uses 'all_complete'
    tempState.ganeshaComplete === true         // ← KEY: Symbol completion flag
  );
  } else if (scene.id === 'final-scene' || scene.id === 'sacred-assembly') {
  // ✅ Sacred Assembly completion detection
  isCompleteInTemp = (
    tempState.completed === true ||
    tempState.phase === 'complete' ||
    tempState.phase === 'zone-complete' ||
    tempState.showingZoneCompletion === true ||
    (tempState.placedSymbols && Object.keys(tempState.placedSymbols).length === 8) ||
    tempState.stars === 8
  );
      } else {
        // Generic completion check
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete'
        );
      }
      
      if (isCompleteInTemp) {
        console.log(`🎯 TEMP COMPLETED: ${scene.id} temp session shows completion`);
        return { status: 'completed', stars: tempState.stars || progress.stars || 0 };
      }
      
      // ✅ NOW check for partial progress (more restrictive)
      const hasPartialProgress = (
  tempState.stars > 0 ||
  tempState.phase && !['initial', 'mooshika_search'].includes(tempState.phase) ||
  (tempState.gamePhase && !['intro', 'initial'].includes(tempState.gamePhase)) ||
  tempState.discoveredSymbols && Object.keys(tempState.discoveredSymbols).length > 0 ||
  tempState.mooshikaFound ||
  tempState.collectedModaks?.length > 0 ||
  tempState.placedGaneshaMembers?.length > 0 ||
  tempState.childFamily?.length > 0 ||
  tempState.rockFeedCount > 0 ||
  tempState.rockTransformed ||  // ✅ INCLUDE rock transformed as progress
  tempState.lotusStates?.some(state => state === 1) ||
  tempState.elephantVisible ||
  tempState.basketFull
);
      
      if (hasPartialProgress) {
        console.log(`🎮 TEMP PROGRESS: ${scene.id} has partial progress`);
        return { status: 'in-progress', stars: tempState.stars || 0 };
      }
      
      console.log(`🔄 TEMP EMPTY: ${scene.id} has empty temp session`);
      
    } catch (e) {
      console.error('Error parsing temp data:', e);
    }
  }
  
  // ✅ Fall back to permanent data
  if (progress.completed === true) {
    console.log(`💾 PERMANENT: ${scene.id} is permanently completed`);
    return { status: 'completed', stars: progress.stars || 0 };
  }
  
  if (progress.stars > 0) {
    return { status: 'in-progress', stars: progress.stars || 0 };
  }
  
  return { status: 'available', stars: 0 };
};

  const getCardAccentColor = () => {
    const theme = getZoneTheme(zoneData?.id);
    return theme?.accentColor || '#9b7be8';
  };

  // ✅ MVP: Only scene 1 is playable in each zone — scenes 2+ are "Coming Soon"
  const MVP_FIRST_SCENE_ONLY = false;

  // ✅ ALL SCENES UNLOCKED — remove this line to re-enable sequential locking
  const checkSceneUnlocked = (scene) => {
    return true;
    if (!zoneData || !zoneData.scenes) return false;

    // ✅ MVP LOCK: Only the first scene is unlocked in MVP mode
    if (MVP_FIRST_SCENE_ONLY && scene.order !== 1) {
      console.log(`🌙 MVP: Scene ${scene.id} locked (MVP — only scene 1 available)`);
      return false;
    }

    // ✅ NEW: Check if scene has explicit unlocked flag in ZoneConfig (for zones like About Me Hut & Festival Square)
    if (scene.unlocked === true) {
      console.log(`🔓 ZONE CONFIG: Scene ${scene.id} explicitly unlocked in ZoneConfig`);
      return true;
    }

    // ✅ DISNEY PATH 1: First scene is always unlocked
    if (scene.order === 1) {
      console.log(`🔓 DISNEY: Scene ${scene.id} unlocked (first scene)`);
      return true;
    }
    
    // ✅ DISNEY PATH 2: Check explicit unlock flag from auto-unlock system
    const gameProgress = GameStateManager.getGameProgress();
    const explicitUnlock = gameProgress.zones?.[zoneData.id]?.scenes?.[scene.id]?.unlocked;
    
    if (explicitUnlock === true) {
      console.log(`🔓 DISNEY: Scene ${scene.id} explicitly unlocked by auto-unlock system`);
      return true;
    }
    
    // ✅ DISNEY PATH 3: Check if previous scene is completed (fallback)
    const previousScene = zoneData.scenes.find(s => s.order === scene.order - 1);
    if (!previousScene) {
      console.log(`🔒 DISNEY: Scene ${scene.id} locked (no previous scene found)`);
      return false;
    }
    
    const previousProgress = sceneProgress[previousScene.id];
    const previousCompleted = previousProgress && previousProgress.completed;
    
    // ✅ DISNEY ENHANCED DEBUG: Show all unlock paths
    console.log(`🔍 DISNEY: Comprehensive unlock check for ${scene.id}:`, {
      'Scene Order': scene.order,
      'Previous Scene': previousScene.id,
      'Previous Completed': previousCompleted,
      'Explicit Unlock Flag': explicitUnlock,
      'Auto-Unlock Path': explicitUnlock === true ? '✅ UNLOCKED' : '❌ Not set',
      'Previous Completion Path': previousCompleted ? '✅ UNLOCKED' : '❌ Not completed',
      'Final Decision': explicitUnlock === true || previousCompleted ? '🔓 UNLOCKED' : '🔒 LOCKED'
    });
    
    const isUnlocked = explicitUnlock === true || previousCompleted;
    
    if (isUnlocked) {
      console.log(`🔓 DISNEY: Scene ${scene.id} unlocked via ${explicitUnlock ? 'auto-unlock system' : 'previous completion'}`);
    } else {
      console.log(`🔒 DISNEY: Scene ${scene.id} locked - waiting for previous scene completion or auto-unlock`);
    }
    
    return isUnlocked;
  };

  // ✅ DISNEY: Helper function for highlighting next available scene
  const getNextUnlockedScene = () => {
    if (!zoneData || !zoneData.scenes) return null;
    
    // Find first uncompleted but unlocked scene
    for (const scene of zoneData.scenes) {
      const progress = sceneProgress[scene.id];
      const isUnlocked = checkSceneUnlocked(scene);
      
      if (isUnlocked && (!progress || !progress.completed)) {
        return scene.id;
      }
    }
    
    return null;
  };

 const handleSceneClick = (scene, action = 'default') => {

  const status = getSceneStatus(scene);
  
  if (status.status === 'locked') {
    console.log('🔒 DISNEY: Scene locked, showing feedback:', scene.name);
    return;
  }
  
  console.log('🎯 DISNEY: Scene clicked:', scene.id, 'Action:', action);
  
  // Handle specific actions from buttons
  switch (action) {
    case 'continue':
      console.log('↶ CONTINUE: Loading scene with progress');
      if (onSceneSelect) {
        onSceneSelect(scene.id, { mode: 'continue' });
      }
      break;
      
    case 'replay':
      console.log('🎮 REPLAY: Loading scene fresh (clear progress)');
      if (onSceneSelect) {
        onSceneSelect(scene.id, { mode: 'replay' });
      }
      break;
      
    case 'start':
      console.log('🚀 START: Loading scene for first time');
      if (onSceneSelect) {
        onSceneSelect(scene.id, { mode: 'start' });
      }
      break;
      
    default:
      // Legacy fallback for scenes clicked without specific action
      if (status.status === 'completed') {
        console.log('🎮 DEFAULT: Completed scene - starting replay');
        if (onSceneSelect) {
          onSceneSelect(scene.id, { mode: 'replay' });
        }
      } else if (status.status === 'in-progress') {
        console.log('↶ DEFAULT: In-progress scene - continuing');
        if (onSceneSelect) {
          onSceneSelect(scene.id, { mode: 'continue' });
        }
      } else {
        console.log('🚀 DEFAULT: New scene - starting fresh');
        if (onSceneSelect) {
          onSceneSelect(scene.id, { mode: 'start' });
        }
      }
  }
};

  const handleBackToMap = () => {
    console.log('⬅️ Back to map clicked');
    if (onBackToMap) {
      onBackToMap();
    } else if (onNavigate) {
      onNavigate('map');
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`scene-star ${i < count ? 'earned' : 'empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };

  if (isLoading || !zoneData) {
    return (
      <div className="zone-welcome-loading">
        <div className="loading-spinner">🌟 Loading {zoneData?.name || 'zone'}...</div>
      </div>
    );
  }

  return (
    <div
      className={`zone-welcome-container screen ${zoneData.id}`}
      data-zone={zoneData.id}
      style={{
        '--zone-bg': `url('${zoneData.background}')`,
        '--zone-text-primary': getZoneTheme(zoneData.id)?.textPrimary || '#6B5416'
      }}
    >
      <div className="bg-layer"></div>

      {/* 🔍 TEMPORARY DEBUG BUTTON */}
<button 
  onClick={() => {
    console.log('🔍 MANUAL DEBUG - Scene Progress Check:');
    console.log('zoneData?.scenes:', zoneData?.scenes);
    console.log('sceneProgress:', sceneProgress);
    console.log('Object.keys(sceneProgress):', Object.keys(sceneProgress || {}));
    
    if (zoneData?.scenes) {
      zoneData.scenes.forEach(scene => {
        const progress = sceneProgress[scene.id];
        const status = getSceneStatus(scene);
        
        console.log(`${scene.id}:`, {
          'Status': status.status,
          'Stars': status.stars,
          'Raw Progress': progress,
          'Completed Flag': progress?.completed,
          'Progress Percentage': progress?.progress?.percentage
        });
      });
    }
  }}
  style={{
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'orange',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 9999
  }}
>
  🔍 DEBUG STATUS
</button>

      {/* Back to Map Button */}
      <button className="zone-back-button" onClick={handleBackToMap}>
        ← Back to Map
      </button>

      <div className="zone-title-top">
        <ScreenHeader title={zoneData.name} glowColor="gold" />
      </div>

      {/* Scene Icons Grid */}
      <div className="zone-scenes-container cards-wrapper" data-zone={zoneData.id}>
        <div className="scenes-horizontal-container">
          {zoneData.scenes.map((scene, index) => {
            const status = getSceneStatus(scene);
            
            // Determine if this is the next recommended scene
            const nextScene = zoneData.scenes.find(s => {
              const st = getSceneStatus(s);
              return st.status === 'available' || st.status === 'in-progress';
            });
            const isNextScene = nextScene && nextScene.id === scene.id;
            
            return (
              <div
                key={scene.id}
                className={`zone-scene-card zone-card zone-${index + 1} ${status.status} ${
                  highlightedScene === scene.id ? 'highlighted' : ''
                } ${status.status === 'locked' ? 'locked-scene' : 'unlocked-scene'} ${
                  isNextScene ? 'next-scene' : ''
                }`}
                style={{
                  cursor: status.status === 'locked' ? 'not-allowed' : 'pointer',
                  '--zone-color': getCardAccentColor()
                }}
                onClick={() => handleSceneClick(scene)}
              >
              

                {/* Order indicator */}
                <div className="scene-order-indicator">
                  {scene.order}
                </div>
                
                {/* Stars display */}
                {status.stars > 0 && (
                  <div className="scene-stars-display">
                    {status.stars}⭐
                  </div>
                )}

                {(status.status === 'completed' || sceneProgress[scene.id]?.completed === true) && (
                  <div className="scene-complete-badge">✓</div>
                )}

                <div className="zone-inner">
                  {/* ✨ NEW: Scene Icon Area (Top) */}
                  <div className="scene-icon-area">
                    <div className="icon-circle">
                      {scene.iconImage ? (
                        <img 
                          src={scene.iconImage}
                          alt={scene.name}
                          className="scene-icon-img"
                          style={{
                            filter: status.status === 'locked' ? 'grayscale(100%) opacity(0.5)' : 'none'
                          }}
                          onError={(e) => {
                            console.warn(`Failed to load image for ${scene.id}, falling back to emoji`);
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      
                      <div 
                        className="scene-emoji"
                        style={{
                          filter: status.status === 'locked' ? 'grayscale(100%)' : 'none',
                          display: scene.iconImage ? 'none' : 'block'
                        }}
                      >
                        {scene.emoji}
                      </div>
                    </div>
                    
                    {/* Moon overlay for MVP locked scenes */}
                    {status.status === 'locked' && (
                      <div className="scene-lock-overlay">
                        <span className="scene-lock-icon">🌙</span>
                        <span className="scene-lock-stars">✨</span>
                      </div>
                    )}
                  </div>

                  {/* ✨ NEW: Scene Name Area (Middle) */}
                  <div className="scene-name-area">
                    <div className="scene-name">
                      {scene.name}
                    </div>
                  </div>

                  {/* ✨ NEW: Integrated Action Area (Bottom) */}
                  <div className="scene-action-integrated">
                    {status.status === 'in-progress' ? (
                      <div className="action-split-container">
                        <button 
                          className="action-button-split zone-btn continue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSceneClick(scene, 'continue');
                          }}
                        >
Continue                            
                        </button>
                        <button 
                          className="action-button-split zone-btn replay"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSceneClick(scene, 'replay');
                          }}
                        >
                          Replay
                        </button>
                      </div>
                    ) : (
                      <button 
                        className={`action-button-integrated zone-btn ${status.status}`}
                        onClick={(e) => {
                          e.stopPropagation();
                              console.log('Button clicked!', scene.id); // ✨ DEBUG LOG
                          handleSceneClick(scene);
                        }}
                      >
                        {status.status === 'available' && 'Start'}
                        {status.status === 'completed' && 'Replay'}
                        {status.status === 'locked' && 'Coming Soon'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

{/* JOURNEY PANEL — progress pill at bottom */}
<div className="stats-bottom-bar">
  {Object.keys(sceneProgress).length > 0 ? (() => {
    const zoneStats = getZoneStats();
    const totalScenes = zoneStats.total;
    const completedCount = zoneStats.completed;
    const symbolCount = zoneStats.symbols || zoneStats.chants || zoneStats.stories || zoneStats.meanings || 0;

    const statIcon =
      zoneData?.id === 'symbol-mountain' ? '/images/icons/zone_stat_symbol.svg' :
      zoneData?.id === 'shloka-river'    ? '/images/icons/zone_stat_chants.svg' :
      zoneData?.id === 'cave-of-secrets' ? '/images/icons/zone_stat_meaning.svg' : null;

    const statLabel =
      zoneData?.id === 'symbol-mountain' ? 'Symbols' :
      zoneData?.id === 'shloka-river'    ? 'Chants'  :
      zoneData?.id === 'story-treehouse' ? 'Stories' :
      zoneData?.id === 'cave-of-secrets' ? 'Meanings' : 'Points';

    return (
      <div className="journey-panel">
        {statIcon && (
          <div className="journey-left">
            <img src={statIcon} alt={statLabel} className="journey-stat-icon" />
            <span>{symbolCount}/8 {statLabel}</span>
          </div>
        )}
        <div className="journey-steps">
          {Array.from({ length: totalScenes }, (_, i) => (
            <span key={i} className={`step ${i < completedCount ? 'done' : ''}`} />
          ))}
        </div>
      </div>
    );
  })() : (
    <div className="stats-loading">🎒 Loading...</div>
  )}
</div>

      {/* ✅ DISNEY: Add CSS for unlock animations */}
      {/* ✅ FIXED: Regular CSS styles instead of jsx */}

    </div>
  );
};



export default ZoneWelcome;

