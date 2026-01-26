// FlipbookApp.jsx - Complete flipbook conversion of your existing App.jsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import './Flipbook.css'; // NEW: Import flipbook styles
import MainWelcomeScreen from './lib/components/navigation/MainWelcomeScreen';
import CleanGameWelcomeScreen from './lib/components/navigation/CleanGameWelcomeScreen';
import CleanMapZone from './pages/CleanMapZone';
import ZoneWelcome from './lib/components/zone/ZoneWelcome';
import { getZoneConfig } from './lib/components/zone/ZoneConfig';
import GameStateManager from './lib/services/GameStateManager';
import { GameCoachProvider } from './lib/components/coach/GameCoach';
import ProgressManager from './lib/services/ProgressManager';
import SimpleSceneManager from './lib/services/SimpleSceneManager';

// 🎯 KEEP YOUR EXISTING SCENE MAPPING - No changes needed!
const SCENE_MAPPING = {
  'symbol-mountain': {
    'modak': () => import('./zones/symbol-mountain/scenes/modak/NewModakSceneV5'),
    'pond': () => import('./zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV3'),
    'symbol': () => import('./zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3'),
    'final-scene': () => import('./zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8'),  
  },
  'cave-of-secrets': {
    'vakratunda-mahakaya': () => import('./zones/meaning cave/scenes/VakratundaMahakaya/CaveSceneFixedV1'),
    'suryakoti-samaprabha': () => import('./zones/meaning cave/scenes/suryakoti-samaprabha/SuryakotiSceneV2'), 
    'nirvighnam-kurumedeva': () => import('./zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV3')
  }
};

function FlipbookApp() {
  // 🔄 NEW: Page-based state instead of view-based
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(35); // Adjust based on your content
  const [loadedPages, setLoadedPages] = useState(new Set([1, 2, 3])); // Pre-load first 3 pages

  //const [isAnimating, setIsAnimating] = useState(false);
  
  // 🎯 KEEP: Existing state for scene logic
  const [currentZone, setCurrentZone] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pre-load adjacent pages when current page changes
useEffect(() => {
  const adjacentPages = [currentPage - 1, currentPage + 1].filter(
    page => page >= 1 && page <= totalPages
  );
  
  const newLoadedPages = new Set(loadedPages);
  adjacentPages.forEach(page => newLoadedPages.add(page));
  
  if (newLoadedPages.size !== loadedPages.size) {
    console.log(`🔄 Pre-loading adjacent pages: ${adjacentPages.join(', ')}`);
    setLoadedPages(newLoadedPages);
  }
}, [currentPage, loadedPages, totalPages]);
  
  
  console.log('🌟 FlipbookApp rendering - current page:', currentPage);
  console.log('🎯 Current zone:', currentZone, 'Current scene:', currentScene);

  // 🎯 NEW: Page structure mapping
  const pageStructure = {
    // Setup Pages (1-3)
    1: { type: 'main-welcome', component: 'MainWelcomeScreen' },
    2: { type: 'profile-welcome', component: 'CleanGameWelcomeScreen' },
    3: { type: 'map', component: 'CleanMapZone' },
    
    // Symbol Mountain Zone (4-8)
    4: { type: 'zone-welcome', zone: 'symbol-mountain', component: 'ZoneWelcome' },
    5: { type: 'scene', zone: 'symbol-mountain', scene: 'modak', component: 'Scene' },
    6: { type: 'scene', zone: 'symbol-mountain', scene: 'pond', component: 'Scene' },
    7: { type: 'scene', zone: 'symbol-mountain', scene: 'symbol', component: 'Scene' },
    8: { type: 'scene', zone: 'symbol-mountain', scene: 'final-scene', component: 'Scene' },
    
    // Cave of Secrets Zone (9-12)
    9: { type: 'zone-welcome', zone: 'cave-of-secrets', component: 'ZoneWelcome' },
    10: { type: 'scene', zone: 'cave-of-secrets', scene: 'vakratunda-mahakaya', component: 'Scene' },
    11: { type: 'scene', zone: 'cave-of-secrets', scene: 'suryakoti-samaprabha', component: 'Scene' },
    12: { type: 'scene', zone: 'cave-of-secrets', scene: 'nirvighnam-kurumedeva', component: 'Scene' },
    
    // Shloka River Zone (13-17) - Add when ready
    13: { type: 'zone-welcome', zone: 'shloka-river', component: 'ZoneWelcome' },
    14: { type: 'scene', zone: 'shloka-river', scene: 'scene1', component: 'Scene' },
    15: { type: 'scene', zone: 'shloka-river', scene: 'scene2', component: 'Scene' },
    16: { type: 'scene', zone: 'shloka-river', scene: 'scene3', component: 'Scene' },
    17: { type: 'scene', zone: 'shloka-river', scene: 'scene4', component: 'Scene' },
    
    // Festival Square Zone (18-22) - Add when ready
    18: { type: 'zone-welcome', zone: 'festival-square', component: 'ZoneWelcome' },
    19: { type: 'scene', zone: 'festival-square', scene: 'scene1', component: 'Scene' },
    20: { type: 'scene', zone: 'festival-square', scene: 'scene2', component: 'Scene' },
    21: { type: 'scene', zone: 'festival-square', scene: 'scene3', component: 'Scene' },
    22: { type: 'scene', zone: 'festival-square', scene: 'scene4', component: 'Scene' },
    
    // Story Treehouse Zone (23-27) - Add when ready
    23: { type: 'zone-welcome', zone: 'story-treehouse', component: 'ZoneWelcome' },
    24: { type: 'scene', zone: 'story-treehouse', scene: 'scene1', component: 'Scene' },
    25: { type: 'scene', zone: 'story-treehouse', scene: 'scene2', component: 'Scene' },
    26: { type: 'scene', zone: 'story-treehouse', scene: 'scene3', component: 'Scene' },
    27: { type: 'scene', zone: 'story-treehouse', scene: 'scene4', component: 'Scene' },
    
    // Obstacle Forest Zone (28-32) - Add when ready
    28: { type: 'zone-welcome', zone: 'obstacle-forest', component: 'ZoneWelcome' },
    29: { type: 'scene', zone: 'obstacle-forest', scene: 'scene1', component: 'Scene' },
    30: { type: 'scene', zone: 'obstacle-forest', scene: 'scene2', component: 'Scene' },
    31: { type: 'scene', zone: 'obstacle-forest', scene: 'scene3', component: 'Scene' },
    32: { type: 'scene', zone: 'obstacle-forest', scene: 'scene4', component: 'Scene' },
  };

  // 🎯 NEW: Bookmark navigation
  const bookmarks = [
    { name: 'Welcome', icon: '🏠', page: 1, color: '#FF6B6B' },
    { name: 'Map', icon: '🗺️', page: 3, color: '#4ECDC4' },
    { name: 'Symbol Mountain', icon: '⛰️', page: 4, color: '#FFD166' },
    { name: 'Cave Secrets', icon: '🕳️', page: 9, color: '#95E1D3' },
    { name: 'Shloka River', icon: '🏞️', page: 13, color: '#F38BA8' },
    { name: 'Festival Square', icon: '🎪', page: 18, color: '#A8DADC' },
    { name: 'Story Tree', icon: '🌳', page: 23, color: '#B5EAD7' },
    { name: 'Obstacle Forest', icon: '🌲', page: 28, color: '#C7CEEA' },
  ];

  // 🎯 KEEP YOUR EXISTING DYNAMIC SCENE LOADER - No changes needed!
  const loadSceneComponent = (zoneId, sceneId) => {
    const zoneMapping = SCENE_MAPPING[zoneId];
    if (!zoneMapping) {
      console.error(`🚫 Zone "${zoneId}" not found in SCENE_MAPPING`);
      return null;
    }
    
    const sceneLoader = zoneMapping[sceneId];
    if (!sceneLoader) {
      console.error(`🚫 Scene "${sceneId}" not found in zone "${zoneId}"`);
      return null;
    }
    
    console.log(`🎯 Loading scene: ${zoneId}/${sceneId}`);
    return lazy(sceneLoader);
  };

  // 🎯 KEEP YOUR EXISTING PLACEHOLDER SCENE - Just adapted for flipbook nav
  const PlaceholderScene = ({ zoneId, sceneId }) => (
    <div className="scene-placeholder" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: '#f0f0f0',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
        {sceneId === 'temple' ? '🛕' : sceneId === 'garden' ? '🌸' : '🎮'}
      </h2>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>
        {sceneId.charAt(0).toUpperCase() + sceneId.slice(1)} Scene
      </h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
        This magical scene is coming soon!
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => {
            const zoneWelcomePage = getZoneWelcomePage(zoneId);
            goToPage(zoneWelcomePage);
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back to {zoneId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </button>
        <button 
          onClick={() => goToPage(3)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🗺️ Back to Map
        </button>
      </div>
    </div>
  );

  // 🎯 KEEP YOUR EXISTING SCENE LOADER - Just adapted for flipbook nav
  const SceneLoader = ({ zoneId, sceneId }) => {
    const SceneComponent = loadSceneComponent(zoneId, sceneId);
    
    if (!SceneComponent) {
      console.log(`🎯 Scene ${zoneId}/${sceneId} not implemented, showing placeholder`);
      return <PlaceholderScene zoneId={zoneId} sceneId={sceneId} />;
    }
    
    return (
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f9f9f9',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌟</div>
          <div style={{ fontSize: '24px', color: '#333' }}>
            Loading {sceneId} scene...
          </div>
        </div>
      }>
        <SceneComponent 
          onNavigate={handleFlipbookNavigate}
          onComplete={handleSceneComplete}
          onSceneSelect={handleSceneSelect}
          zoneId={zoneId}
          sceneId={sceneId}
        />
      </Suspense>
    );
  };

const getPageContent = (pageNumber) => {
  const pageInfo = pageStructure[pageNumber];
  
  // CRITICAL: Never show loading for current page or immediate neighbors
  const isCurrentOrNeighbor = Math.abs(pageNumber - currentPage) <= 1;
  
  // Only show loading for distant pages that aren't loaded
// Replace the loading div with this beautiful preloader
if (!loadedPages.has(pageNumber) && !isCurrentOrNeighbor) {
  return (
    <div className="elegant-loader">
      <div className="lotus-spinner">
        <div className="petal petal-1"></div>
        <div className="petal petal-2"></div>
        <div className="petal petal-3"></div>
        <div className="petal petal-4"></div>
        <div className="center-dot"></div>
      </div>
      <div className="loading-text">
        <span className="loading-word">Loading</span>
        <span className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
      <div className="progress-ring">
        <div className="progress-fill"></div>
      </div>
    </div>
  );
}
  
  if (!pageInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Page {pageNumber}</h2>
        <p>Content coming soon...</p>
      </div>
    );
  }

  // Apply scene styles for scene pages
  if (pageInfo.type === 'scene') {
    applySceneStyles();
  }

  switch (pageInfo.type) {
    case 'main-welcome':
      return <MainWelcomeScreen onStartAdventure={handleStartAdventure} />;
      
    case 'profile-welcome':
      return <CleanGameWelcomeScreen onContinue={handleContinue} onNewGame={handleNewGame} />;
      
    case 'map':
      return <CleanMapZone onZoneSelect={handleZoneSelect} currentZone={currentZone} highlightedScene={currentScene} />;
      
    case 'zone-welcome':
      return <ZoneWelcome zoneData={getCurrentZoneData()} onSceneSelect={handleSceneSelect} onBackToMap={() => goToPage(3)} onNavigate={handleFlipbookNavigate} />;
      
    case 'scene':
      return <SceneLoader zoneId={pageInfo.zone} sceneId={pageInfo.scene} />;
      
    default:
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Unknown page type: {pageInfo.type}</h2>
        </div>
      );
  }
};

const updateLoadedPages = (targetPage) => {
  const windowSize = 3;
  const halfWindow = Math.floor(windowSize / 2);
  
  const newLoadedPages = new Set(loadedPages); // Keep existing loaded pages
  
  // CRITICAL: Always keep current page loaded during transition
  newLoadedPages.add(currentPage);
  
  // Load pages in window around target page
  for (let i = Math.max(1, targetPage - halfWindow); 
       i <= Math.min(totalPages, targetPage + halfWindow); 
       i++) {
    newLoadedPages.add(i);
  }
  
  // Always keep essential pages loaded
  newLoadedPages.add(1); // main welcome
  newLoadedPages.add(2); // profile welcome  
  newLoadedPages.add(3); // map
  
  console.log(`🔄 Loading pages: ${Array.from(newLoadedPages).join(', ')}`);
  console.log(`🔒 Current page ${currentPage} stays loaded`);
  setLoadedPages(newLoadedPages);
};

const goToPage = (pageNumber) => {
  if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
    return;
  }
  
  console.log('🎯 Going to page:', pageNumber);
  
  // Pre-load pages around target
  updateLoadedPages(pageNumber);
  
  // Update zone/scene state
  const pageInfo = pageStructure[pageNumber];
  if (pageInfo) {
    if (pageInfo.type === 'scene') {
      setCurrentZone(pageInfo.zone);
      setCurrentScene(pageInfo.scene);
    } else if (pageInfo.type === 'zone-welcome') {
      setCurrentZone(pageInfo.zone);
      setCurrentScene(null);
    } else {
      setCurrentZone(null);
      setCurrentScene(null);
    }
  }
  
  setCurrentPage(pageNumber);
  localStorage.setItem('flipbook-current-page', pageNumber);
};

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const MemoizedPageContent = React.memo(({ pageNumber }) => {
  return getPageContent(pageNumber);
}, (prevProps, nextProps) => {
  // Only re-render if page number changes
  return prevProps.pageNumber === nextProps.pageNumber;
});

  // 🔄 ADAPTED: Your existing initialization logic
  const initializeApp = () => {
    try {
      if (!GameStateManager) {
        console.error('GameStateManager is not imported correctly');
        return;
      }
      
      console.log('🌟 GameStateManager initialized successfully');
      
      const activeProfileId = localStorage.getItem('activeProfileId');
      if (activeProfileId) {
        const resumeLocation = SimpleSceneManager.shouldResumeScene();
        
        if (resumeLocation) {
          console.log('🔄 Resuming scene in flipbook');
          const resumePage = getScenePage(resumeLocation.zone, resumeLocation.scene);
          goToPage(resumePage);
        } else {
          console.log('🌟 Going to profile welcome page');
          goToPage(2); // Profile welcome page
        }
      } else {
        console.log('🌟 No active profile, starting at page 1');
        goToPage(1); // Main welcome page
      }      
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      goToPage(1); // Fallback to start
    }
  };

  // 🔄 ADAPTED: Your existing handlers to use page navigation
  const handleStartAdventure = () => {
    console.log('🌟 Start Adventure clicked - going to profile page');
    goToPage(2); // Go to profile welcome page
  };

  const handleContinue = (targetZone, targetScene) => {
    try {
      console.log('🚀 Continue clicked');
      const shouldResume = SimpleSceneManager.shouldResumeScene();
      
      let pageToGo;
      if (shouldResume && shouldResume.zone && shouldResume.scene) {
        pageToGo = getScenePage(shouldResume.zone, shouldResume.scene);
      } else if (targetZone && targetScene) {
        pageToGo = getScenePage(targetZone, targetScene);
      } else {
        pageToGo = 4; // Default to first zone welcome
      }
      
      goToPage(pageToGo);
    } catch (error) {
      console.error('❌ Continue error:', error);
      goToPage(3); // Fallback to map
    }
  };

  const handleNewGame = () => {
    console.log('🚀 New game - going to map');
    goToPage(3); // Go to map page
  };

  const handleZoneSelect = (zoneId, sceneId = null) => {
    console.log('🎯 Zone selected:', zoneId, sceneId);
    
    if (sceneId) {
      const scenePage = getScenePage(zoneId, sceneId);
      goToPage(scenePage);
      SimpleSceneManager.setCurrentScene(zoneId, sceneId);
    } else {
      const zoneWelcomePage = getZoneWelcomePage(zoneId);
      goToPage(zoneWelcomePage);
    }
  };

  const handleSceneSelect = (sceneId, options = {}) => {
    console.log('🎯 Scene selected:', sceneId, 'Options:', options);
    
    const mode = options.mode || 'default';
    const profileId = localStorage.getItem('activeProfileId');
    
    // Always set scene and navigate
    const scenePage = getScenePage(currentZone, sceneId);
    goToPage(scenePage);
    
    // Save location for continue journey
    SimpleSceneManager.setCurrentScene(currentZone, sceneId);
    
    // Handle replay/restart clearing
    if (mode === 'restart' || mode === 'replay') {
      console.log('🔄 CLEARING: Storage for fresh start');
      
      const sceneStateKey = `${profileId}_${currentZone}_${sceneId}_state`;
      const tempKey = `temp_session_${profileId}_${currentZone}_${sceneId}`;
      
      localStorage.removeItem(sceneStateKey);
      localStorage.removeItem(tempKey);
      sessionStorage.removeItem(sceneStateKey);
      sessionStorage.removeItem(tempKey);
      
      console.log('✅ Storage cleared for:', sceneId);
    }
  };

  // 🆕 NEW: Navigation handler specifically for flipbook buttons
  const handleFlipbookNavigate = (destination) => {
    console.log('🎯 Flipbook navigate to:', destination);
    
    switch (destination) {
      case 'home':
        SimpleSceneManager.clearCurrentScene();
        goToPage(2); // Profile welcome
        break;
      case 'zones':
      case 'map':
        SimpleSceneManager.clearCurrentScene();
        goToPage(3); // Map page
        break;
      case 'zone-welcome':
        SimpleSceneManager.clearCurrentScene();
        const zoneWelcomePage = getZoneWelcomePage(currentZone);
        goToPage(zoneWelcomePage);
        break;
      case 'profile':
        SimpleSceneManager.clearCurrentScene();
        goToPage(2); // Profile welcome
        break;
      case 'scene-complete-continue':
        console.log('✅ CONTINUE: Going to next scene');
        const nextScene = getNextScene(currentZone, currentScene);
        if (nextScene) {
          const nextPage = getScenePage(currentZone, nextScene);
          goToPage(nextPage);
        } else {
          const zoneWelcomePage = getZoneWelcomePage(currentZone);
          goToPage(zoneWelcomePage);
        }
        break;
      case 'scene-complete-replay':
        console.log('✅ REPLAY: Staying in scene - clearing state');
        const profileId = localStorage.getItem('activeProfileId');
        const sceneStateKey = `${profileId}_${currentZone}_${currentScene}_state`;
        const tempKey = `temp_session_${profileId}_${currentZone}_${currentScene}`;
        localStorage.removeItem(sceneStateKey);
        localStorage.removeItem(tempKey);
        sessionStorage.removeItem(sceneStateKey);
        sessionStorage.removeItem(tempKey);
        // Force page refresh by going to same page
        const currentPageNum = currentPage;
        goToPage(currentPageNum);
        break;
      case 'scene-complete-map':
        console.log('✅ MAP: Going to map - clearing scene tracking');
        SimpleSceneManager.clearCurrentScene();
        goToPage(3); // Map page
        break;
      case 'next-scene':
        // Handle progression between scenes
        if (currentZone === 'symbol-mountain') {
          if (currentScene === 'modak') {
            goToPage(6); // pond scene
          } else if (currentScene === 'pond') {
            goToPage(7); // symbol scene
          } else if (currentScene === 'symbol') {
            goToPage(8); // final-scene
          } else if (currentScene === 'final-scene') {
            goToPage(4); // back to zone welcome
          } else {
            goToPage(4); // default to zone welcome
          }
        } else if (currentZone === 'cave-of-secrets') {
          if (currentScene === 'vakratunda-mahakaya') {
            goToPage(11); // suryakoti scene
          } else if (currentScene === 'suryakoti-samaprabha') {
            goToPage(12); // nirvighnam scene
          } else if (currentScene === 'nirvighnam-kurumedeva') {
            goToPage(9); // back to zone welcome
          } else {
            goToPage(9); // default to zone welcome
          }
        } else {
          const zoneWelcomePage = getZoneWelcomePage(currentZone);
          goToPage(zoneWelcomePage);
        }
        break;
      default:
        console.log('Unknown flipbook navigation:', destination);
        goToPage(3); // Default to map
    }
  };

  // 🎯 KEEP YOUR EXISTING getNextScene function - No changes needed!
  const getNextScene = (zoneId, currentSceneId) => {
    const sceneProgression = {
      'symbol-mountain': ['modak', 'pond', 'symbol', 'final-scene'],
      'cave-of-secrets': [
        'vakratunda-mahakaya', 
        'suryakoti-samaprabha', 
        'nirvighnam-kurumedeva',
        'sarvakaryeshu-sarvada',
        'mantra-assembly'
      ],
    };
    
    const scenes = sceneProgression[zoneId];
    if (!scenes) {
      console.log(`🎯 HELPER: No progression defined for zone: ${zoneId}`);
      return null;
    }
    
    const currentIndex = scenes.indexOf(currentSceneId);
    if (currentIndex === -1) {
      console.log(`🎯 HELPER: Scene ${currentSceneId} not found in ${zoneId}`);
      return null;
    }
    
    if (currentIndex === scenes.length - 1) {
      console.log(`🎯 HELPER: ${currentSceneId} is last scene in ${zoneId}`);
      return null; // Last scene in zone
    }
    
    const nextScene = scenes[currentIndex + 1];
    console.log(`🎯 HELPER: ${currentSceneId} → ${nextScene} in ${zoneId}`);
    return nextScene;
  };

  // 🎯 KEEP YOUR EXISTING handleSceneComplete - No changes needed!
  const handleSceneComplete = (sceneId, result) => {
    console.log('🎯 APP: Scene completed:', sceneId, result);
    
    console.log('🔍 APP DEBUG: Checking completion result...');
    console.log('🔍 result?.symbols:', result?.symbols);
    console.log('🔍 Object.keys(result?.symbols || {}):', Object.keys(result?.symbols || {}));
    
    if (!result?.symbols || Object.keys(result?.symbols || {}).length === 0) {
      console.log('❌ APP DEBUG: NO SYMBOLS in completion result!');
    } else {
      console.log('✅ APP DEBUG: Symbols found in completion result:', result.symbols);
    }
    
    try {
      const activeProfileId = localStorage.getItem('activeProfileId');
      if (activeProfileId && currentZone && result?.stars) {
        
        console.log('🧪 APP: About to call ProgressManager.updateSceneCompletion with:');
        console.log('🧪 symbols:', result?.symbols || {});
        
        const updatedZoneProgress = ProgressManager.updateSceneCompletion(
          activeProfileId, 
          currentZone, 
          sceneId, 
          {
            completed: true,
            stars: result?.stars || 0,
            symbols: result?.symbols || {},
            sanskritWords: result?.sanskritWords || result?.learnedWords || {},
            learnedWords: result?.learnedWords || {},
            chants: result?.chants || {},
            mantras: result?.mantras || {}
          }
        );
        
        console.log('✅ APP: Scene completion saved to ProgressManager');
        console.log('📊 APP: Updated zone progress:', updatedZoneProgress);
        
        const unlockedScene = GameStateManager.unlockNextScene(currentZone, sceneId);
        if (unlockedScene) {
          console.log('🎉 APP: Next scene auto-unlocked:', unlockedScene);
        } else {
          console.log('🏁 APP: Last scene in zone completed');
        }
      } else {
        console.error('❌ APP: Missing required data for scene completion', {
          activeProfileId,
          currentZone,
          sceneId,
          result
        });
      }
      
      // After completion, go to zone welcome
      const zoneWelcomePage = getZoneWelcomePage(currentZone);
      goToPage(zoneWelcomePage);
      
    } catch (error) {
      console.error('❌ APP: Error saving scene completion:', error);
      const zoneWelcomePage = getZoneWelcomePage(currentZone);
      goToPage(zoneWelcomePage);
    }
  };

  // Handle profile changes
  const handleProfileChange = () => {
    const activeProfile = GameStateManager.getCurrentProfile();
    setCurrentProfile(activeProfile);
    initializeApp();
  };

  // Apply scene-specific styles only when rendering scenes
  const applySceneStyles = () => {
    document.body.className = '';
    document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden; width: 100vw; height: 100vh;';
    
    const root = document.getElementById('root');
    if (root) {
      root.className = '';
      root.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; margin: 0; padding: 0;';
    }
  };

  // Get zone data for current zone
  const getCurrentZoneData = () => {
    if (!currentZone) return null;
    return getZoneConfig(currentZone);
  };

  // 🆕 NEW: Render current page content
  const renderCurrentPage = () => {
    const pageInfo = pageStructure[currentPage];
    if (!pageInfo) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center' 
        }}>
          <h2>Page {currentPage}</h2>
          <p>Content coming soon...</p>
          <button onClick={() => goToPage(3)} style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}>
            Go to Map
          </button>
        </div>
      );
    }

    // Apply scene styles for scene pages
    if (pageInfo.type === 'scene') {
      applySceneStyles();
    }

    switch (pageInfo.type) {
      case 'main-welcome':
        return (
          <MainWelcomeScreen
            onStartAdventure={handleStartAdventure}
          />
        );
        
      case 'profile-welcome':
        return (
          <CleanGameWelcomeScreen
            onContinue={handleContinue}
            onNewGame={handleNewGame}
          />
        );
        
      case 'map':
        return (
          <CleanMapZone 
            onZoneSelect={handleZoneSelect}
            currentZone={currentZone}
            highlightedScene={currentScene}
          />
        );
        
      case 'zone-welcome':
        return (
          <ZoneWelcome 
            zoneData={getCurrentZoneData()}
            onSceneSelect={handleSceneSelect}
            onBackToMap={() => goToPage(3)}
            onNavigate={handleFlipbookNavigate}
          />
        );
        
      case 'scene':
        // Handle scene state clearing logic
        const profileId = localStorage.getItem('activeProfileId');
        const tempKey = `temp_session_${profileId}_${pageInfo.zone}_${pageInfo.scene}`;
        const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');

        // Only clear if completed AND not showing completion screen
        if (tempData.completed && !tempData.showingCompletionScreen) {
          console.log('🔄 APP: Clearing completed scene state for fresh start');
          localStorage.removeItem(tempKey);
          
          const sceneStateKey = `${profileId}_${pageInfo.zone}_${pageInfo.scene}_state`;
          localStorage.removeItem(sceneStateKey);
        } else if (tempData.showingCompletionScreen) {
          console.log('🎬 APP: Scene showing completion screen - keeping state for resume');
        }

        return (
          <SceneLoader 
            zoneId={pageInfo.zone}
            sceneId={pageInfo.scene}
          />
        );
        
      default:
        return (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <h2>Unknown page type: {pageInfo.type}</h2>
          </div>
        );
    }
  };

  // Initialize on mount
  useEffect(() => {
    console.log('🌟 FlipbookApp mounting, initializing...');
    
    // Check for saved page
    const savedPage = localStorage.getItem('flipbook-current-page');
    if (savedPage && parseInt(savedPage) !== currentPage) {
      setCurrentPage(parseInt(savedPage));
    }
    
    initializeApp();
    
    // Cleanup function
    return () => {
      console.log('🧹 FlipbookApp cleanup');
      document.body.style.cssText = '';
      const root = document.getElementById('root');
      if (root) root.style.cssText = '';
    };
  }, []);

  // 🆕 NEW: Main flipbook render
  return (
    <GameCoachProvider defaultConfig={{
      name: 'Ganesha',
      image: 'images/ganesha-character.png',
      position: 'top-right'
    }}>
      <div className="flipbook-container">
        {/* Main Book */}
        <div className="book">
{[...Array(totalPages)].map((_, index) => {
  const pageNumber = index + 1;
  return (
    <div
      key={pageNumber}
      className={`page ${pageNumber < currentPage ? 'flipped' : ''}`}
      style={{ zIndex: totalPages - index }}
      data-page-type={pageStructure[pageNumber]?.type || 'unknown'}
    >
      <MemoizedPageContent pageNumber={pageNumber} />
    </div>
  );
})}
        </div>

        {/* Bookmark Navigation */}
        <div className="bookmarks">
          {bookmarks.map((bookmark, index) => (
            <button
              key={index}
              className={`bookmark ${currentPage >= bookmark.page ? 'available' : 'locked'} ${
                currentPage >= bookmark.page && 
                currentPage < (bookmarks[index + 1]?.page || totalPages + 1) ? 'active' : ''
              }`}
              onClick={() => {
                if (currentPage >= bookmark.page) {
                  goToPage(bookmark.page);
                }
              }}
              style={{ 
                backgroundColor: currentPage >= bookmark.page ? bookmark.color : '#95a5a6' 
              }}
              disabled={currentPage < bookmark.page}
            >
              <span className="bookmark-icon">{bookmark.icon}</span>
              <span className="bookmark-text">{bookmark.name}</span>
            </button>
          ))}
        </div>

        {/* Page Navigation */}
   <div className="nav-controls">
  <button className="nav-btn prev" onClick={prevPage} disabled={currentPage === 1}>
    ←
  </button>
  
  <div className="zone-quick-nav">
    {['🏠', '⛰️', '🕳️', '🏞️'].map((icon, index) => (
      <button 
        key={index}
        className={`zone-quick-btn ${currentPage >= (index * 8 + 1) && currentPage <= (index * 8 + 8) ? 'active' : ''}`}
        onClick={() => goToPage(index === 0 ? 1 : index * 8 + 1)}
        title={['Home', 'Symbol Mountain', 'Cave Secrets', 'Shloka River'][index]}
      >
        {icon}
      </button>
    ))}
  </div>
  
  <div className="page-indicator">
    <input type="number" value={currentPage} onChange={(e) => {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) goToPage(page);
    }} />
    <span>/{totalPages}</span>
  </div>
  
  <button className="nav-btn next" onClick={nextPage} disabled={currentPage === totalPages}>
    →
  </button>
</div>
      </div>
    </GameCoachProvider>
  );
}

export default FlipbookApp;
