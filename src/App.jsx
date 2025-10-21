// App.jsx - Updated with Dynamic Scene Loading System

import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import './Enhanced.css'

import MainWelcomeScreen from './lib/components/navigation/MainWelcomeScreen';
import CleanGameWelcomeScreen from './lib/components/navigation/CleanGameWelcomeScreen';
import CleanMapZone from './pages/CleanMapZone';
import ZoneWelcome from './lib/components/zone/ZoneWelcome';
import { getZoneConfig } from './lib/components/zone/ZoneConfig';
import GameStateManager from './lib/services/GameStateManager';
import { GameCoachProvider } from './lib/components/coach/GameCoach';
import ProgressManager from './lib/services/ProgressManager';
import SimpleSceneManager from './lib/services/SimpleSceneManager';

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
    'nirvighnam-kurumedeva': () => import('./zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV3'),
    'sarvakaryeshu-sarvada': () => import('./zones/meaning cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV5.jsx'),

  },
  // ✅ ADD: Shloka River scenes
  'shloka-river': {
    'vakratunda-grove': () => import('./zones/shloka-river/scenes/Scene1/VakratundaGroveV2'),
    'suryakoti-bank': () => import('./zones/shloka-river/scenes/Scene2/SuryakotiBank'),
    'nirvighnam-chant': () => import('./zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx'),
    'sarvakaryeshu-chant': () => import('./zones/shloka-river/scenes/scene4/SarvakaryeshuChant'),
    'shloka-river-finale': () => import('./zones/shloka-river/scenes/scene5/ShlokaRiverFinale')
  },
  'festival-square': {
    'game1': () => import('./zones/festival-square/Game1-piano/FestivalPianoGame.jsx'),
    'game2': () => import('./zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx'), 
    'game3': () => import('./zones/festival-square/game3-cooking/ModakCookingGame.jsx'),
    'game4': () => import('./zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx')
  }

};


const GameStateManagerClass = GameStateManager.constructor;

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [currentZone, setCurrentZone] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  console.log('🌟 Clean App rendering - current view:', currentView);
  console.log('🎯 Current zone:', currentZone, 'Current scene:', currentScene);
  
  // 🎯 DYNAMIC SCENE LOADER: Load scene component dynamically
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

  // 🎯 PLACEHOLDER SCENE: For scenes that don't exist yet
  const PlaceholderScene = ({ zoneId, sceneId, onNavigate }) => (
    <div className="scene-placeholder" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
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
          onClick={() => onNavigate('zone-welcome')}
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
          onClick={() => onNavigate('map')}
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

  // 🎯 SCENE LOADING COMPONENT: Handle dynamic loading with error boundaries
  const SceneLoader = ({ zoneId, sceneId, onNavigate, onComplete, onSceneSelect }) => {
    const SceneComponent = loadSceneComponent(zoneId, sceneId);
    
    if (!SceneComponent) {
      console.log(`🎯 Scene ${zoneId}/${sceneId} not implemented, showing placeholder`);
      return (
        <PlaceholderScene 
          zoneId={zoneId} 
          sceneId={sceneId} 
          onNavigate={onNavigate}
        />
      );
    }
    
    return (
<Suspense fallback={
  <div className="elegant-scene-loader">
    <div className="lotus-spinner">
      <div className="petal petal-1"></div>
      <div className="petal petal-2"></div>
      <div className="petal petal-3"></div>
      <div className="petal petal-4"></div>
      <div className="center-dot"></div>
    </div>
    <div className="loading-text">
      <span className="loading-word">Loading {sceneId}</span>
      <span className="loading-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
    <div className="progress-ring">
      <div className="progress-fill"></div>
    </div>
  </div>
}>
        <SceneComponent 
          onNavigate={onNavigate}
          onComplete={onComplete}
          onSceneSelect={onSceneSelect}
          zoneId={zoneId}
          sceneId={sceneId}
        />
      </Suspense>
    );
  };

  // Initialize app and check for profiles/saves
  useEffect(() => {
    console.log('🌟 Clean App mounting, initializing...');
    initializeApp();
    
    // Cleanup function
    return () => {
      console.log('🧹 Clean App cleanup');
      // Clean up any persistent styles when app unmounts
      document.body.style.cssText = '';
      const root = document.getElementById('root');
      if (root) root.style.cssText = '';
    };
  }, []);

  // Smart preloading for better performance
useEffect(() => {
  if (currentZone && currentScene) {
    // Preload next scene in sequence
    const nextScene = getNextScene(currentZone, currentScene);
    if (nextScene) {
      // Preload next scene component
      const nextSceneComponent = loadSceneComponent(currentZone, nextScene);
      if (nextSceneComponent) {
        console.log(`🔄 Preloading next scene: ${nextScene}`);
      }
    }
  }
}, [currentZone, currentScene]);
  
  // 🔄 REPLACE the initializeApp function in App.jsx with this simple version:

/*const initializeApp = () => {
  try {
    if (!GameStateManager) {
      console.error('GameStateManager is not imported correctly');
      setCurrentView('error');
      return;
    }
    
    console.log('🌟 GameStateManager initialized successfully');
    
    // ✅ SIMPLE LOGIC: Check for active profile
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      console.log('🌟 Found active profile, going to profile welcome');
      setCurrentView('profile-welcome');
    } else {
      console.log('🌟 No active profile, starting with main welcome');
      setCurrentView('main-welcome');
    }      
    
    setIsInitialized(true);
  } catch (error) {
    console.error('Error initializing app:', error);
    setCurrentView('error');
  }
};*/

const initializeApp = () => {
  try {
    if (!GameStateManager) {
      console.error('GameStateManager is not imported correctly');
      setCurrentView('error');
      return;
    }
    
    console.log('🌟 GameStateManager initialized successfully');
    
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      // ✅ SIMPLE: Check if user should resume a scene
      const resumeLocation = SimpleSceneManager.shouldResumeScene();
      
      if (resumeLocation) {
        console.log('🔄 SIMPLE: Resuming scene directly');
        setCurrentZone(resumeLocation.zone);
        setCurrentScene(resumeLocation.scene);
  setCurrentView('profile-welcome'); // ✅ Go to welcome first
      } else {
        console.log('🌟 SIMPLE: Going to profile welcome');
        setCurrentView('profile-welcome');
      }
    } else {
      console.log('🌟 No active profile, starting with main welcome');
      setCurrentView('main-welcome');
    }      
    
    setIsInitialized(true);
  } catch (error) {
    console.error('Error initializing app:', error);
    setCurrentView('error');
  }
};

  
  // Clean style restoration helper
  const restoreDefaultStyles = () => {
    document.body.style.cssText = '';
    const root = document.getElementById('root');
    if (root) root.style.cssText = '';
  };
  
  // Handle main welcome "New Adventure" click
  const handleStartAdventure = () => {
    console.log('🌟 Start Adventure clicked from main welcome');
    restoreDefaultStyles();
    
    // Always go to CleanGameWelcomeScreen
    // It will handle profile selection internally if needed
    setCurrentView('profile-welcome');
  };
  
  // Handle continuing from last save
  /*const handleContinue = () => {
    try {
      console.log('🚀 Continuing game - clean handoff');
      restoreDefaultStyles(); // Clean styles before navigation
      
      const lastLocation = GameStateManager.getLastPlayedLocation();
      console.log('🌟 Last location:', lastLocation);
      
      if (lastLocation && lastLocation.zone && lastLocation.scene) {
        setCurrentZone(lastLocation.zone);
        setCurrentScene(lastLocation.scene);
        setCurrentView('scene');
      } else {
        setCurrentView('map');
      }
    } catch (error) {
      console.error('Error continuing game:', error);
      handleNewGame();
    }
  };*/
// ✅ TEMPORARY DEBUG VERSION - Replace your handleContinue with this:


// 🔄 REPLACE the handleContinue function in App.jsx with this simple version:

const handleContinue = (targetZone, targetScene) => {
  try {
    console.log('🚀 CONTINUE: Received parameters:', { targetZone, targetScene });
    restoreDefaultStyles();
    
    // ✅ FIXED: Check SimpleSceneManager for actual resume data
    const shouldResume = SimpleSceneManager.shouldResumeScene();
    console.log('🧪 CONTINUE: SimpleSceneManager says:', shouldResume);
    
    let zoneToLoad, sceneToLoad;
    
    if (shouldResume && shouldResume.zone && shouldResume.scene) {
      // Use the actual resume data
      zoneToLoad = shouldResume.zone;
      sceneToLoad = shouldResume.scene;
      console.log('✅ CONTINUE: Using resume data:', { zoneToLoad, sceneToLoad });
    } else if (targetZone && targetScene) {
      // Use passed parameters
      zoneToLoad = targetZone;
      sceneToLoad = targetScene;
      console.log('✅ CONTINUE: Using passed parameters:', { zoneToLoad, sceneToLoad });
    } else {
      // Fallback to defaults
      zoneToLoad = 'symbol-mountain';
      sceneToLoad = 'modak';
      console.log('✅ CONTINUE: Using fallback defaults:', { zoneToLoad, sceneToLoad });
    }
    
    setCurrentZone(zoneToLoad);
    setCurrentScene(sceneToLoad);
    setCurrentView('scene');
    
  } catch (error) {
    console.error('❌ CONTINUE: Error:', error);
    setCurrentView('map');
  }
};

  
  
  // Handle new game - Start with map for zone selection
  const handleNewGame = () => {
    console.log('🚀 Choose scene clicked - clean handoff');
    //restoreDefaultStyles(); // Clean styles before navigation
    
    setCurrentZone(null);
    setCurrentScene(null);
    setCurrentView('map');
  };
  
  // Handle zone selection from map
  /*const handleZoneSelect = (zoneId, sceneId = null) => {
    console.log('🎯 Zone selected:', zoneId, sceneId ? `Scene: ${sceneId}` : 'No scene');
    //restoreDefaultStyles();
    
    setCurrentZone(zoneId);
    
    if (sceneId) {
      // Scene selected - go directly to scene
      console.log('🎯 Going directly to scene:', sceneId);
      setCurrentScene(sceneId);
      setCurrentView('scene');
      
      // Save current location
      GameStateManager.saveGameState(zoneId, sceneId, {
        currentZone: zoneId,
        currentScene: sceneId,
        enteredAt: Date.now()
      });
    } else {
      // Zone selected - go to zone welcome page
      console.log('🎯 Going to zone welcome page for:', zoneId);
      setCurrentView('zone-welcome');
    }
  };*/

  const handleZoneSelect = (zoneId, sceneId = null) => {
  console.log('🎯 Zone selected:', zoneId, sceneId ? `Scene: ${sceneId}` : 'No scene');
  
  setCurrentZone(zoneId);
  
  if (sceneId) {
    setCurrentScene(sceneId);
    setCurrentView('scene');
    
    // ✅ SIMPLE: Save scene location
    SimpleSceneManager.setCurrentScene(zoneId, sceneId);
  } else {
    setCurrentView('zone-welcome');
  }
};

const handleSceneSelect = (sceneId, options = {}) => {
  console.log('🎯 Scene selected:', sceneId, 'Options:', options);
  
  const mode = options.mode || 'default';
  const profileId = localStorage.getItem('activeProfileId');
  
  // ✅ ALWAYS: Set scene and view (this keeps continue journey working)
  setCurrentScene(sceneId);
  setCurrentView('scene');
  
  // ✅ ALWAYS: Save location for continue journey
  SimpleSceneManager.setCurrentScene(currentZone, sceneId);
  
  // ✅ ONLY FOR REPLAY/RESTART: Clear storage
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
    // ✅ ADD: Shloka River progression - Sanskrit chant learning journey
    'shloka-river': [
      'vakratunda-grove',      // Scene 1: Learn Vakratunda
      'suryakoti-bank',        // Scene 2: Learn Suryakoti  
      'nirvighnam-chant',      // Scene 3: Learn Nirvighnam
      'sarvakaryeshu-chant',   // Scene 4: Learn Sarvakaryeshu
      'shloka-river-finale'    // Scene 5: Complete chant assembly
    ],
      'festival-square': ['game1', 'game2', 'game3', 'game4']

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

  // Handle navigation from scenes and zone welcome
  const handleNavigate = (destination) => {
    console.log('🎯 Navigate to:', destination);
    //restoreDefaultStyles(); // Always restore styles when navigating
    
    // Save current location before navigating away
    if (currentZone && currentScene) {
      GameStateManager.saveGameState(currentZone, currentScene, {
        currentZone: currentZone,
        currentScene: currentScene,
        lastNavigated: Date.now()
      });
    }
    
    switch (destination) {
      case 'home':
              SimpleSceneManager.clearCurrentScene(); // ✅ ADD THIS LINE
        setCurrentZone(null);
        setCurrentScene(null);
  setCurrentView('profile-welcome');    // ← CORRECT DESTINATION
        break;
      case 'zones':
      case 'map':
              SimpleSceneManager.clearCurrentScene(); // ✅ ADD THIS LINE
        setCurrentZone(null);
        setCurrentScene(null);
        setCurrentView('map');
        break;
      case 'zone-welcome':
              SimpleSceneManager.clearCurrentScene(); // ✅ ADD THIS LINE
        // Go back to current zone's welcome page
        setCurrentScene(null);
        setCurrentView('zone-welcome');
        break;
      case 'profile':
              SimpleSceneManager.clearCurrentScene(); // ✅ ADD THIS LINE
        setCurrentView('profile-welcome');
        break;
        case 'scene-complete-continue':
  // ✅ FINAL VERSION: Use helper function for scene progression
  console.log('✅ CONTINUE: Going to next scene - resume tracking already updated');
  
  const nextScene = getNextScene(currentZone, currentScene);
  
  if (nextScene) {
    // Go to next scene
    console.log(`🎯 CONTINUE: ${currentScene} → ${nextScene} in ${currentZone}`);
    setCurrentScene(nextScene);
    setCurrentView('scene');
  } else {
    // Last scene in zone - go to zone welcome
    console.log(`🎯 CONTINUE: ${currentScene} is last scene - going to zone welcome`);
    setCurrentScene(null);
    setCurrentView('zone-welcome');
  }
  break;

case 'scene-complete-replay':
  // ✅ REPLAY: Stay in same scene (already reset by scene)
  console.log('✅ REPLAY: Staying in scene - content reset already handled');
  // Don't navigate anywhere - scene handles its own reset
  break;

case 'scene-complete-map':
  // ✅ MAP: Go to map - CLEAR navigation state  
  console.log('✅ MAP: Going to map - clearing scene tracking');
  SimpleSceneManager.clearCurrentScene();
  setCurrentZone(null);
  setCurrentScene(null);
  setCurrentView('map');
  break;
     case 'next-scene':
  // Handle progression between scenes
  if (currentZone === 'symbol-mountain') {
    if (currentScene === 'modak') {
      setCurrentScene('pond');
      setCurrentView('scene');
      SimpleSceneManager.clearCurrentScene();
    } else if (currentScene === 'pond') {
      setCurrentScene('symbol');  // ✅ Goes to SymbolMountainSceneV2
      setCurrentView('scene');
      SimpleSceneManager.clearCurrentScene();
    } else if (currentScene === 'symbol') {  // ✅ From SymbolMountainSceneV2
      setCurrentScene('final-scene');  // ✅ Goes to SacredAssemblyScene
      setCurrentView('scene');
      SimpleSceneManager.clearCurrentScene();
    } else if (currentScene === 'final-scene') {
      // After final scene, zone is complete - go to zone welcome
      SimpleSceneManager.clearCurrentScene();
      setCurrentScene(null);
      setCurrentView('zone-welcome');
    } else {
      SimpleSceneManager.clearCurrentScene();
      setCurrentView('zone-welcome');
    }
  } else {
    setCurrentView('zone-welcome');
  }
  break;

  // In App.jsx, add this to your handleNavigate function:
case 'direct-to-map':
  console.log('🗺️ DIRECT MAP: Bypassing profile welcome, going straight to map');
  SimpleSceneManager.clearCurrentScene();
  setCurrentZone(null);
  setCurrentScene(null);
  setCurrentView('map');
  break;
      default:
        console.log('Unknown navigation:', destination);
              SimpleSceneManager.clearCurrentScene(); // ✅ ADD THIS LINE
        setCurrentView('map');
    }
  };
  

// ✅ UPDATED: Use ProgressManager for unified saving

// ✅ ADD THIS DEBUG VERSION to App.jsx handleSceneComplete function
const handleSceneComplete = (sceneId, result) => {
  console.log('🎯 APP: Scene completed:', sceneId, result);
  
  // ✅ DEBUG: Check if symbols are being passed
  console.log('🔍 APP DEBUG: Checking completion result...');
  console.log('🔍 result?.symbols:', result?.symbols);
  console.log('🔍 Object.keys(result?.symbols || {}):', Object.keys(result?.symbols || {}));
  
  if (!result?.symbols || Object.keys(result?.symbols || {}).length === 0) {
    console.log('❌ APP DEBUG: NO SYMBOLS in completion result!');
    console.log('❌ Scene must pass discoveredSymbols in completion result');
    console.log('❌ Add props.onComplete call to scene fireworks completion');
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
          symbols: result?.symbols || {},  // ✅ These should be permanent now

           // ✅ ADD THESE LINES - Save chant data for Cave scenes
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
    
    setCurrentScene(null);
    setCurrentView('zone-welcome');
    
  } catch (error) {
    console.error('❌ APP: Error saving scene completion:', error);
    setCurrentScene(null);
    setCurrentView('zone-welcome');
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
  
  // Render different views - wrapped with GameCoachProvider
  return (
    <GameCoachProvider defaultConfig={{
      name: 'Ganesha',
      image: 'images/ganesha-character.png',
      position: 'top-right'
    }}>
 {currentView === 'loading' && (
  <div className="enhanced-loading-screen">
    <div className="lotus-spinner large">
      <div className="petal petal-1"></div>
      <div className="petal petal-2"></div>
      <div className="petal petal-3"></div>
      <div className="petal petal-4"></div>
      <div className="center-dot"></div>
    </div>
    <div className="loading-text large">
      <span className="loading-word">Loading magical adventure</span>
      <span className="loading-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
    <div className="welcome-subtitle">Preparing your Sanskrit journey...</div>
  </div>
)}
      {currentView === 'error' && (
        <div className="error-screen">
          <h1>Initialization Error</h1>
          <p>Failed to load game resources. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}
      
      {currentView === 'main-welcome' && (
                  <div className="view-transition">
        <MainWelcomeScreen
          onStartAdventure={handleStartAdventure}
        />
          </div>
      )}
      
      {currentView === 'profile-welcome' && (
                  <div className="view-transition">
        <CleanGameWelcomeScreen
          onContinue={handleContinue}
          onNewGame={handleNewGame}
        />
          </div>
      )}
      
      {currentView === 'map' && (
                  <div className="view-transition">
        <CleanMapZone 
          onZoneSelect={handleZoneSelect}
          currentZone={currentZone}
          highlightedScene={currentScene}
        />
          </div>
      )}
      
      {currentView === 'zone-welcome' && currentZone && (
                  <div className="view-transition">
        <ZoneWelcome 
          zoneData={getCurrentZoneData()}
          onSceneSelect={handleSceneSelect}
          onBackToMap={() => setCurrentView('map')}
          onNavigate={handleNavigate}
        />
          </div>
      )}
      
      {/* 🎯 DYNAMIC SCENE RENDERING: Replaces all hardcoded scene logic */}
      {currentView === 'scene' && currentZone && currentScene && (() => {
        console.log('🎯 Rendering scene view');
        console.log('🎯 Zone:', currentZone, 'Scene:', currentScene); 

  // ✅ REPLACE the existing clearing logic:
// ✅ UPDATED: Check if we should start fresh
/*const profileId = localStorage.getItem('activeProfileId');
const tempKey = `temp_session_${profileId}_${currentZone}_${currentScene}`;
const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');

// ✅ NEW: Only clear if completed AND not showing completion screen
if (tempData.completed && !tempData.showingCompletionScreen) {
  console.log('🔄 APP: Clearing completed scene state for fresh start');
  localStorage.removeItem(tempKey);
  
  const sceneStateKey = `${profileId}_${currentZone}_${currentScene}_state`;
  localStorage.removeItem(sceneStateKey);
} else if (tempData.showingCompletionScreen) {
  console.log('🎬 APP: Scene showing completion screen - keeping state for resume');
  // Don't clear anything - let scene resume completion screen
}*/

// ✅ SIMPLE: Let scenes handle their own state - don't interfere
const profileId = localStorage.getItem('activeProfileId');
const tempKey = `temp_session_${profileId}_${currentZone}_${currentScene}`;
const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');

// Only clear if explicit play again flag is set
if (tempData.playAgainRequested) {
  console.log('🔄 APP: Play Again detected - clearing all scene storage');
  localStorage.removeItem(tempKey);
  const sceneStateKey = `${profileId}_${currentZone}_${currentScene}_state`;
  localStorage.removeItem(sceneStateKey);
}

        
        // Apply scene-specific styles
        applySceneStyles();
        
        return (
          <SceneLoader 
            zoneId={currentZone}
            sceneId={currentScene}
            onNavigate={handleNavigate}
            onComplete={handleSceneComplete}
            onSceneSelect={handleSceneSelect}
          />
        );
      })()}
      
      {/* Fallback view */}
      {!['loading', 'error', 'main-welcome', 'profile-welcome', 'map', 'zone-welcome', 'scene'].includes(currentView) && (
        <div className="unknown-view-error">
          <h2>Error: Unknown view state</h2>
          <p>Current view: {currentView}</p>
          <button onClick={() => setCurrentView('map')}>Go to Map</button>
        </div>
      )}
    </GameCoachProvider>
  );
}

export default App;