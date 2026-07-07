// App.jsx - Updated with Dynamic Scene Loading System

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import './App.css';
import './Enhanced.css'
import ErrorBoundary from './lib/components/error/ErrorBoundary';

// Lazy-loaded views — keep the startup bundle small; only the loading screen
// needs to be eager.
const DailyDarePopup     = lazy(() => import('./lib/components/twg/DailyDarePopup'));
const TimeWithGaneshaHub = lazy(() => import('./lib/components/twg/TimeWithGaneshaHub'));
const GaneshaEngineTest  = lazy(() => import('./lib/components/twg/GaneshaEngineTest'));
const MainWelcomeScreen  = lazy(() => import('./lib/components/navigation/MainWelcomeScreen'));
const GaneshaIntroStory  = lazy(() => import('./components/GaneshaIntroStory'));
import { GANESHA_USAGE_SYSTEM } from './lib/config/ganeshaUsageSystem';

const CleanGameWelcomeScreen = lazy(() => import('./lib/components/navigation/CleanGameWelcomeScreen'));
const CleanProfileSelector   = lazy(() => import('./lib/components/navigation/CleanProfileSelector'));
const ParentDashboard        = lazy(() => import('./lib/components/navigation/ParentDashboard'));
const CleanMapZone         = lazy(() => import('./pages/CleanMapZone'));
const ZoneWelcome          = lazy(() => import('./lib/components/zone/ZoneWelcome'));
import { getZoneConfig } from './lib/components/zone/ZoneConfig';
import GameStateManager from './lib/services/GameStateManager';
// import { GameCoachProvider } from './lib/components/coach/GameCoach'; // disabled — GameCoach not used (CLAUDE.md)
import ProgressManager from './lib/services/ProgressManager';
import SimpleSceneManager from './lib/services/SimpleSceneManager';
import { getPendingKindnessCheck, resolveKindnessCheck } from './lib/services/KindnessJournal';
// initializeSounds replaced by initAudioService() in main.jsx (AudioService/Howler)
import { Analytics } from './lib/services/analytics';
import { preloadImages, avatarImagePaths } from './lib/utils/preloadImages';

const AVATAR_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];

const ZONE_FIRST_SCENE_IMAGES = {
  'symbol-mountain': [
    '/images/symbol-mountain-bg.webp',
    '/images/modakmtn-bg.webp',
    '/images/zones/symbol-mountain/modak-icon.png',
    '/images/ganesha-poses/sit-modak.webp',
    '/images/ganesha-point.webp',
  ],
  // 'cave-of-secrets': [
  //   '/images/cave-of-secrets-background.webp',
  //   '/images/cave-bg.webp',
  //   '/images/zones/cave-of-secrets/vakratunda-icon.png',
  // ],
  'shloka-river': [
    '/images/shlokariver-bg.webp',
    '/images/zones/shloka-river/vakratunda-grove-icon.png',
  ],
  // 'festival-square': [
  //   '/images/festivalsquare-bg.webp',
  //   '/images/lotussquare-bg.webp',
  //   '/images/zones/festival-square/piano-icon.png',
  // ],
  'about-me-hut': [
    '/images/about-me-hut-bg.webp',
    '/images/hut-bg.webp',
    '/images/zones/about-me-hut/family-tree-icon.png',
    '/images/ganesha-final-new.svg',
  ],
};

const SCENE_MAPPING = {
  'symbol-mountain': {
    'modak': () => import('./zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx'),
    'pond': () => import('./zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx'),
    'symbol': () => import('./zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3'),
    'final-scene': () => import('./zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8'),
  },
  'cave-of-secrets': {
    'vakratunda-mahakaya': () => import('./zones/meaning cave/scenes/VakratundaMahakaya/CaveSceneFixedV2'),
    'suryakoti-samaprabha': () => import('./zones/meaning cave/scenes/suryakoti-samaprabha/SuryakotiSceneV4'), 
    'nirvighnam-kurumedeva': () => import('./zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV5'),
    'sarvakaryeshu-sarvada': () => import('./zones/meaning cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV7.jsx'),
    'final-meaning-scene': () => import('./zones/meaning cave/scenes/final meaning scene/Cavescene5memoryfinale.jsx'),
    'mantra-assembly': () => import('./zones/meaning cave/scenes/final meaning scene/Cavescene5memoryfinale.jsx'),

  },
  // ✅ ADD: Shloka River scenes
  'shloka-river': {
    'vakratunda-grove': () => import('./zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx'),
    'suryakoti-bank': () => import('./zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx'),
    'nirvighnam-chant': () => import('./zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx'),
    'sarvakaryeshu-chant': () => import('./zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx'),
    
    'shloka-river-finale': () => import('./zones/shloka-river/scenes/scene5/ShlokaRiverFinale')
  },
  'festival-square': {
    'game1': () => import('./zones/festival-square/Game1-piano/FestivalPianoGame.jsx'),
    'game2': () => import('./zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx'), 
    'game3': () => import('./zones/festival-square/game3-cooking/ModakCookingGame.jsx'),
    'game4': () => import('./zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx')
  },
'about-me-hut': {
  'family-tree':   () => import('./zones/about-me-hut/family-tree/Familytreegame.jsx'),
  'favorite-food': () => import('./zones/about-me-hut/food/Favoritefoodgame.jsx'),
  'dreams-wishes': () => import('./zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx'),
  'my-indian-story': () => import('./zones/about-me-hut/indian-story/MyIndianStoryGame.jsx')
}

};


const GameStateManagerClass = GameStateManager.constructor;

function MushikaLoader({ progress, ready }) {
  const TOTAL = 3;
  const [landed, setLanded] = useState(0);
  const [pos, setPos] = useState(0);
  const [hopState, setHopState] = useState('');
  const hopping = useRef(false);
  const startRef = useRef(Date.now());

  const fromProgress = Math.floor((progress / 100) * TOTAL);
  const fromTimer = Math.floor((Date.now() - startRef.current) / 850);
  const target = Math.min(TOTAL, Math.max(fromProgress, fromTimer));

  useEffect(() => {
    if (hopping.current) return;
    if (pos >= target) return;

    hopping.current = true;
    setHopState('pre-hop');
    const t1 = setTimeout(() => setHopState('hopping'), 140);
    const t2 = setTimeout(() => {
      setPos((p) => p + 1);
      setLanded((l) => Math.min(TOTAL, l + 1));
      setHopState('land');
    }, 790);
    const t3 = setTimeout(() => {
      setHopState('');
      hopping.current = false;
    }, 970);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pos, target, ready]);

  const [, force] = useState(0);
  useEffect(() => {
    if (pos >= TOTAL) return;
    const id = setInterval(() => force((n) => n + 1), 300);
    return () => clearInterval(id);
  }, [pos]);

  const stoneGap = 106;
  const trackW = stoneGap * (TOTAL - 1);
  const mushikaLeft = `calc(50% - ${trackW / 2}px + ${pos * stoneGap}px - 44px)`;

  return (
    <>
      <div className="loader-track">
        {[...Array(TOTAL)].map((_, i) => (
          <img
            key={i}
            src="/images/modak.webp"
            alt=""
            className={`loader-modak ${i < landed ? 'active' : ''}`}
          />
        ))}
      </div>
      <img
        src="/images/mooshika-flying.webp"
        alt=""
        className={`loader-mushika ${hopState}`}
        style={{ left: mushikaLeft }}
      />
    </>
  );
}

function normalizeSceneId(zoneId, sceneId) {
  if (zoneId === 'cave-of-secrets' && sceneId === 'mantra-assembly') {
    return 'final-meaning-scene';
  }

  return sceneId;
}

function readTempSceneData(profileId, zoneId, sceneId) {
  if (!profileId || !zoneId || !sceneId) {
    return {};
  }

  const tempKey = `temp_session_${profileId}_${zoneId}_${sceneId}`;

  try {
    return JSON.parse(localStorage.getItem(tempKey) || '{}');
  } catch (error) {
    console.warn('Failed to parse temp scene data:', { tempKey, error });
    return {};
  }
}

function loadStableSceneComponent(sceneCacheRef, zoneId, sceneId) {
  const normalizedSceneId = normalizeSceneId(zoneId, sceneId);
  const key = `${zoneId}/${normalizedSceneId}`;
  if (sceneCacheRef.current[key]) return sceneCacheRef.current[key];

  const zoneMapping = SCENE_MAPPING[zoneId];
  if (!zoneMapping) {
    console.error(`Zone "${zoneId}" not found in SCENE_MAPPING`);
    return null;
  }

  const sceneLoader = zoneMapping[normalizedSceneId];
  if (!sceneLoader) {
    console.error(`Scene "${normalizedSceneId}" not found in zone "${zoneId}"`);
    return null;
  }

  const Component = lazy(sceneLoader);
  sceneCacheRef.current[key] = Component;
  return Component;
}

function StablePlaceholderScene({ zoneId, sceneId, onNavigate }) {
  return (
    <div className="scene-placeholder" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'var(--app-height, 100vh)',
      backgroundColor: '#FFF8E7',
      textAlign: 'center',
      padding: '20px',
      fontFamily: "'Nunito', sans-serif"
    }}>
      <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
        {sceneId === 'temple' ? '🛕' : sceneId === 'garden' ? '🌸' : '🎮'}
      </h2>
      <h1 style={{ fontFamily: "'Baloo 2', cursive", color: '#5e49a8', marginBottom: '10px' }}>
        Ganesha is still building this one!
      </h1>
      <p style={{ color: '#6b5f8e', fontSize: '18px', marginBottom: '30px' }}>
        Come back soon - something wonderful is on the way.
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('zone-welcome')}
          style={{
            padding: '12px 24px',
            minHeight: '60px',
            fontFamily: "'Baloo 2', cursive",
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
            minHeight: '60px',
            fontFamily: "'Baloo 2', cursive",
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
}

function StableSceneLoader({
  zoneId,
  sceneId,
  onNavigate,
  onComplete,
  onSceneSelect,
  childName,
  childAge,
  sceneCacheRef,
}) {
  const normalizedSceneId = normalizeSceneId(zoneId, sceneId);
  const SceneComponent = loadStableSceneComponent(sceneCacheRef, zoneId, normalizedSceneId);

  if (!SceneComponent) {
    return (
      <StablePlaceholderScene
        zoneId={zoneId}
        sceneId={normalizedSceneId}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="enhanced-loading-screen">
        <div className="loading-ganesha-container">
          <div className="loading-ganesha-glow"></div>
          <img
            src={GANESHA_USAGE_SYSTEM.loading.asset}
            className="loading-ganesha"
            alt="Ganesha"
          />
        </div>
      </div>
    }>
      <SceneComponent
        onNavigate={onNavigate}
        onComplete={onComplete}
        onSceneSelect={onSceneSelect}
        zoneId={zoneId}
        sceneId={normalizedSceneId}
        childName={childName}
        childAge={childAge}
      />
    </Suspense>
  );
}

function App() {
  // DEV: ?engine-test in URL → show engine test harness only
  if (false && typeof window !== 'undefined' && window.location.search.includes('engine-test')) {
    return <Suspense fallback={null}><GaneshaEngineTest /></Suspense>;
  }

  const [currentView, setCurrentView] = useState('loading');
  const [currentZone, setCurrentZone] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // ADD THIS LINE
const [loadingStep, setLoadingStep] = useState(''); // ADD THIS LINE
const [showDarePopup, setShowDarePopup] = useState(false);
const [showDareChip, setShowDareChip] = useState(false);
const previousViewRef = useRef('loading');
const dareOpenTimerRef = useRef(null);
const [kindnessCheckEntry, setKindnessCheckEntry] = useState(null);
const [showIntroStory, setShowIntroStory] = useState(false);
const [introStoryReturnView, setIntroStoryReturnView] = useState('map');
const showEngineTest = typeof window !== 'undefined' && window.location.search.includes('engine-test');

useEffect(() => {
  if (currentView !== 'map' || showIntroStory) return;
  const profileId = localStorage.getItem('activeProfileId');
  if (!profileId) return;
  const alreadyShown = localStorage.getItem(`ganeshaStoryShown_${profileId}`);
  if (!alreadyShown) {
    setIntroStoryReturnView('map');
    setShowIntroStory(true);
  }
}, [currentView, showIntroStory]);
  
  console.log('🌟 Clean App rendering - current view:', currentView);
  console.log('🎯 Current zone:', currentZone, 'Current scene:', currentScene);
  
  // 🎯 DYNAMIC SCENE LOADER: cached so React.lazy() is never called twice for the same scene
  const _sceneCache = useRef({});
  const loadSceneComponent = (zoneId, sceneId) => {
    const key = `${zoneId}/${sceneId}`;
    if (_sceneCache.current[key]) return _sceneCache.current[key];

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
    const Component = lazy(sceneLoader);
    _sceneCache.current[key] = Component;
    return Component;
  };

  // 🎯 PLACEHOLDER SCENE: For scenes that don't exist yet
  const PlaceholderScene = ({ zoneId, sceneId, onNavigate }) => (
    <div className="scene-placeholder" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'var(--app-height, 100vh)',
      backgroundColor: '#FFF8E7',
      textAlign: 'center',
      padding: '20px',
      fontFamily: "'Nunito', sans-serif"
    }}>
      <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
        {sceneId === 'temple' ? '🛕' : sceneId === 'garden' ? '🌸' : '🎮'}
      </h2>
      <h1 style={{ fontFamily: "'Baloo 2', cursive", color: '#5e49a8', marginBottom: '10px' }}>
        Ganesha is still building this one!
      </h1>
      <p style={{ color: '#6b5f8e', fontSize: '18px', marginBottom: '30px' }}>
        Come back soon — something wonderful is on the way.
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => onNavigate('zone-welcome')}
          style={{
            padding: '12px 24px',
            minHeight: '60px',
            fontFamily: "'Baloo 2', cursive",
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
            minHeight: '60px',
            fontFamily: "'Baloo 2', cursive",
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
  const SceneLoader = ({ zoneId, sceneId, onNavigate, onComplete, onSceneSelect, childName, childAge }) => {
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
  <div className="enhanced-loading-screen">
    <div className="loading-ganesha-container">
      <div className="loading-ganesha-glow"></div>
      <img
        src={GANESHA_USAGE_SYSTEM.loading.asset}
        className="loading-ganesha"
        alt="Ganesha"
      />
    </div>
  </div>
}>
        <SceneComponent
          onNavigate={onNavigate}
          onComplete={onComplete}
          onSceneSelect={onSceneSelect}
          zoneId={zoneId}
          sceneId={sceneId}
          childName={childName}
          childAge={childAge}
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

// Smart preloading — actually fetches the next scene's chunk
useEffect(() => {
  if (currentZone && currentScene) {
    const nextScene = getNextScene(currentZone, currentScene);
    const loader = SCENE_MAPPING[currentZone]?.[nextScene];
    if (loader) {
      loader()
        .then(() => console.log(`✅ Preloaded next scene: ${nextScene}`))
        .catch(err => console.warn(`⚠️ Preload failed: ${nextScene}`, err));
    }
  }
}, [currentZone, currentScene]);

  useEffect(() => {
    const previousView = previousViewRef.current;
    if (previousView === 'scene' && currentView === 'zone-welcome') {
      sessionStorage.setItem('zone_welcome_profile_chip_pulse', '1');
    }
    previousViewRef.current = currentView;
  }, [currentView]);

  // Lot 2 — warm ride + intro story images while child is on welcome/profile screen
  useEffect(() => {
    if (currentView === 'profile-welcome') {
      preloadImages([
        '/images/pan-bg.webp',
        '/images/mooshika-flying.webp',
        '/intro-story/story1-open-pg.webp',
        '/intro-story/story1-img1.webp',
        '/intro-story/story1-img2.webp',
        '/intro-story/story1-img3.webp',
        '/intro-story/story1-img4.webp',
        '/intro-story/map-new-2.webp',
        '/images/ganesha-poses/stand-namaste.webp',
        '/images/map/butterflyyellow.png',
        '/images/map/butterflyblue.png',
        '/images/map/birdnew.png',
        '/images/map/lock.png',
        '/images/critters/bird-flying-orange.svg',
        '/images/critters/butterfly-pink.svg',
      ]);
    }
  }, [currentView]);

  useEffect(() => {
    if (dareOpenTimerRef.current) {
      clearTimeout(dareOpenTimerRef.current);
      dareOpenTimerRef.current = null;
    }

    if (currentView !== 'map') {
      setShowDareChip(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const openedTodaySession = sessionStorage.getItem('gmb_daily_dare_opened') === today;
    const openedTodayLocal = localStorage.getItem('gmb_daily_dare_opened') === today;
    if (openedTodaySession || openedTodayLocal) {
      setShowDareChip(localStorage.getItem('gmb_last_dare_date') === today);
      return;
    }

    setShowDareChip(false);

    // Don't show Daily Dare on the user's very first map visit —
    // let map intro VO + tutorial breathe.
    const profileId = localStorage.getItem('activeProfileId') || 'default';
    const firstMapVisitKey = `gmb_map_first_visit_done_${profileId}`;
    const isFirstMapVisit = !localStorage.getItem(firstMapVisitKey);
    if (isFirstMapVisit) {
      localStorage.setItem(firstMapVisitKey, '1');
      return;
    }

    dareOpenTimerRef.current = setTimeout(() => {
      // Wait if any other VO is playing (zone unlock, intro, completion)
      if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
        dareOpenTimerRef.current = setTimeout(() => {
          setShowDarePopup(true);
          sessionStorage.setItem('gmb_daily_dare_opened', today);
          localStorage.setItem('gmb_daily_dare_opened', today);
        }, 2500);
        return;
      }
      setShowDarePopup(true);
      sessionStorage.setItem('gmb_daily_dare_opened', today);
      localStorage.setItem('gmb_daily_dare_opened', today);
    }, 2500);

    return () => {
      if (dareOpenTimerRef.current) {
        clearTimeout(dareOpenTimerRef.current);
        dareOpenTimerRef.current = null;
      }
    };
  }, [currentView]);

  // Never allow Daily Dare popup to remain open outside map view.
  useEffect(() => {
    if (currentView !== 'map' && showDarePopup) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setShowDarePopup(false);
    }
  }, [currentView, showDarePopup]);

  // Phase 1: next-day self-check popup for pending kindness entry.
  useEffect(() => {
    if (currentView !== 'map' || showDarePopup) {
      setKindnessCheckEntry(null);
      return;
    }
    const pending = getPendingKindnessCheck();
    setKindnessCheckEntry(pending || null);
  }, [currentView, showDarePopup]);

  const handleKindnessCheck = (completed) => {
    if (!kindnessCheckEntry?.date) {
      setKindnessCheckEntry(null);
      return;
    }
    resolveKindnessCheck(kindnessCheckEntry.date, completed);
    setKindnessCheckEntry(null);
  };
  
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

const initializeApp = async () => {
  try {
    console.log('🌟 Initializing app...');
    setCurrentView('loading');
    setLoadingProgress(0);
    setLoadingStep('Just a moment… let\'s get ready.');
    
    // Step 1: Sound system already initialised via initAudioService() in main.jsx
    setLoadingProgress(20);
    setLoadingStep('Bringing in happy sounds…');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 2: Verify managers are loaded (40%)
    console.log('📦 Managers loaded and ready');
    setLoadingProgress(40);
    setLoadingStep('Getting our world ready…');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Step 2.5: Preload critical images (50%)
    const criticalImages = [
      '/images/welcome-background.svg',
      '/images/welcome-board.webp',
      '/images/welcome-ganesha.webp',
      '/images/welcome-mooshika.webp'
    ];

    const imagePromises = criticalImages.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`✅ Loaded: ${src}`);
          resolve();
        };
        img.onerror = () => {
          console.warn(`⚠️ Failed to load: ${src}`);
          resolve(); // Continue even if image fails
        };
        img.src = src;
      });
    });

    await Promise.all(imagePromises);

    // Lot 1 — warm next screens (profile bg + all avatars) while loader is still showing
    preloadImages([
      '/images/profile-bg.webp',
      ...avatarImagePaths(AVATAR_IDS),
    ]);

    setLoadingProgress(50);
    setLoadingStep('Adding beautiful pictures…');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 3: Check for active profile (60%)
    console.log('📊 Checking for active profile...');
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      console.log('👤 Active profile ID:', activeProfileId);
      // Try to get profile safely
      try {
        const profile = GameStateManager.getProfile?.(activeProfileId);
        if (profile) {
          setCurrentProfile(profile);
          console.log('👤 Active profile loaded:', profile);
        }
      } catch (err) {
        console.warn('⚠️ Could not load profile:', err);
      }
    }
    setLoadingProgress(60);
    setLoadingStep('Remembering your progress…');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 4: Scene Manager ready (80%)
    console.log('🎬 Scene Manager ready');
    setLoadingProgress(80);
    setLoadingStep('Setting up your adventure…');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 5: Check for existing profiles in localStorage (90%)
    let hasExistingProfiles = false;
    try {
      // Read the actual profile store, not incidental key-name patterns
      const stored = GameStateManager.getProfiles?.();
      hasExistingProfiles = !!stored?.profiles && Object.keys(stored.profiles).length > 0;
      console.log('👥 Found profiles:', stored?.profiles ? Object.keys(stored.profiles).length : 0);
    } catch (err) {
      console.warn('⚠️ Could not check profiles:', err);
    }
    setLoadingProgress(90);
    setLoadingStep('Almost ready, bestie…');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 6: Complete (100%)
    setLoadingProgress(100);
    setLoadingStep('Yay… let\'s play!');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('⏱️ Load time:', performance.now().toFixed(0), 'ms');
    console.log('✅ App initialization complete');
    setIsInitialized(true);

    // Determine starting view
    if (hasExistingProfiles && activeProfileId) {
      setCurrentView('profile-welcome');
    } else if (hasExistingProfiles) {
      console.log('👤 Profiles exist but none active, going to profile selection');
      setCurrentView('profile-welcome');
    } else {
      console.log('🆕 No profiles found, showing main welcome');
      setCurrentView('main-welcome');
    }
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    setLoadingStep('Oops! Something went wrong...');
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
    try { window.speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch(e) {}
    restoreDefaultStyles();

    // First-time users: go straight to profile creation, then map (skip dashboard)
    setCurrentView('profile-create');
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
    // iOS: speechSynthesis must be primed inside a user gesture or first VO is silent
    try { window.speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) {}
    restoreDefaultStyles();

    if (!targetZone) {
      const activeProfileId = localStorage.getItem('activeProfileId');
      const shouldShowStory =
        !!activeProfileId && !localStorage.getItem(`ganeshaStoryShown_${activeProfileId}`);
      setIntroStoryReturnView('map');
      setShowIntroStory(shouldShowStory);
      setCurrentView('map');
      return;
    }

    // Zone only (completed scene) → zone welcome
    if (!targetScene) {
      setCurrentZone(targetZone);
      setCurrentScene(null);
      setCurrentView('zone-welcome');
      return;
    }

    // Mid-game scene → resume directly
    const normalizedSceneId = normalizeSceneId(targetZone, targetScene);
    setCurrentZone(targetZone);
    setCurrentScene(normalizedSceneId);
    setCurrentView('scene');

  } catch (error) {
    console.error('Error in handleContinue:', error);
    setCurrentView('map');
  }
};

  
  
  // Handle new game - Start with map for zone selection
  const handleNewGame = () => {
    console.log('🚀 Choose scene clicked - clean handoff');
    //restoreDefaultStyles(); // Clean styles before navigation
    try { window.speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) {}

    const activeProfileId = localStorage.getItem('activeProfileId');
    const shouldShowStory =
      !!activeProfileId && !localStorage.getItem(`ganeshaStoryShown_${activeProfileId}`);
    setIntroStoryReturnView('map');
    setShowIntroStory(shouldShowStory);
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

  // TWG is not a regular zone — go to its full-screen hub
  if (zoneId === 'twg') {
    setCurrentView('twg');
    return;
  }

  Analytics.zoneEntered(zoneId);

  setCurrentZone(zoneId);
  
  if (sceneId) {
    const normalizedSceneId = normalizeSceneId(zoneId, sceneId);
    setCurrentScene(normalizedSceneId);
    setCurrentView('scene');

    // ✅ SIMPLE: Save scene location
    SimpleSceneManager.setCurrentScene(zoneId, normalizedSceneId);
  } else {
    // Lot 3 — warm this zone's welcome bg + first scene assets
    preloadImages(ZONE_FIRST_SCENE_IMAGES[zoneId] || []);
    setCurrentView('zone-welcome');
  }
};

const handleSceneSelect = (sceneId, options = {}) => {
  console.log('🎯 Scene selected:', sceneId, 'Options:', options);
  
  if (sceneId === '__replay_intro_story__') {
    const replayProfileId = localStorage.getItem('activeProfileId');
    if (replayProfileId) {
      localStorage.removeItem(`ganeshaStoryShown_${replayProfileId}`);
    }
    setIntroStoryReturnView('zone-welcome');
    setShowIntroStory(true);
    return;
  }

  const mode = options.mode || 'default';
  const profileId = localStorage.getItem('activeProfileId');
  const normalizedSceneId = normalizeSceneId(currentZone, sceneId);
  
  // ✅ ALWAYS: Set scene and view (this keeps continue journey working)
  setCurrentScene(normalizedSceneId);
  setCurrentView('scene');
  
  // ✅ ALWAYS: Save location for continue journey
  SimpleSceneManager.setCurrentScene(currentZone, normalizedSceneId);
  
  // ✅ ONLY FOR REPLAY/RESTART: Clear storage
  if (mode === 'restart' || mode === 'replay') {
    console.log('🔄 CLEARING: Storage for fresh start');
    
    const sceneStateKey = `${profileId}_${currentZone}_${normalizedSceneId}_state`;
    const tempKey = `temp_session_${profileId}_${currentZone}_${normalizedSceneId}`;
    
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
      'final-meaning-scene'
    ],
    // ✅ ADD: Shloka River progression - Sanskrit chant learning journey
    'shloka-river': [
      'vakratunda-grove',      // Scene 1: Learn Vakratunda
      'suryakoti-bank',        // Scene 2: Learn Suryakoti  
      'nirvighnam-chant',      // Scene 3: Learn Nirvighnam
      'sarvakaryeshu-chant',   // Scene 4: Learn Sarvakaryeshu
      'shloka-river-finale'    // Scene 5: Complete chant assembly
    ],
      'festival-square': ['game1', 'game2', 'game3', 'game4'],
    // ✅ About Me Hut progression
    'about-me-hut': ['family-tree', 'favorite-food', 'dreams-wishes', 'my-indian-story']
  };

  const scenes = sceneProgression[zoneId];
  const normalizedCurrentSceneId = normalizeSceneId(zoneId, currentSceneId);
  if (!scenes) {
    console.log(`🎯 HELPER: No progression defined for zone: ${zoneId}`);
    return null;
  }

  const currentIndex = scenes.indexOf(normalizedCurrentSceneId);
  if (currentIndex === -1) {
    console.log(`🎯 HELPER: Scene ${currentSceneId} not found in ${zoneId}`);
    return null;
  }

  if (currentIndex === scenes.length - 1) {
    // ✅ Festival Square: circular — loop back to first scene
    if (zoneId === 'festival-square') {
      console.log(`🔄 CIRCULAR: ${currentSceneId} → ${scenes[0]} in ${zoneId}`);
      return scenes[0];
    }
    console.log(`🎯 HELPER: ${currentSceneId} is last scene in ${zoneId}`);
    return null; // Last scene in zone → zone-welcome
  }

  const nextScene = scenes[currentIndex + 1];
  console.log(`🎯 HELPER: ${currentSceneId} → ${nextScene} in ${zoneId}`);
  return nextScene;
};

  // Handle navigation from scenes and zone welcome
  const handleNavigate = (destination) => {
    console.log('🎯 Navigate to:', destination);
    //restoreDefaultStyles(); // Always restore styles when navigating

    // Allow scenes to navigate directly by sceneId (e.g. "favorite-food", "dreams-wishes").
    // If destination matches a scene in the current zone, open it directly.
    const normalizedDestination = normalizeSceneId(currentZone, destination);
    const zoneScenes = currentZone ? SCENE_MAPPING[currentZone] : null;
    if (zoneScenes && zoneScenes[normalizedDestination]) {
      setCurrentScene(normalizedDestination);
      setCurrentView('scene');
      SimpleSceneManager.setCurrentScene(currentZone, normalizedDestination);
      return;
    }
    
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
        SimpleSceneManager.clearCurrentScene();
        setCurrentZone(null);
        setCurrentScene(null);
        setCurrentView('profile-welcome');
        break;
      case 'parent-dashboard':
        setCurrentView('parent-dashboard');
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
  const normalizedSceneId = normalizeSceneId(currentZone, sceneId);
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
    if (activeProfileId && currentZone && result?.stars != null) {
      
      console.log('🧪 APP: About to call ProgressManager.updateSceneCompletion with:');
console.log('🧪 symbols:', result?.symbols || {});
console.log('🧪 chants:', result?.chants);
console.log('🧪 chantedVerses:', result?.chantedVerses);
console.log('🧪 WILL SAVE chants as:', result?.chants || result?.chantedVerses || {});
      
      const updatedZoneProgress = ProgressManager.updateSceneCompletion(
        activeProfileId, 
        currentZone, 
        normalizedSceneId,
        {
          completed: true,
          stars: result?.stars || 0,
          symbols: result?.symbols || {},  // ✅ These should be permanent now

           // ✅ ADD THESE LINES - Save chant data for Cave scenes
    sanskritWords: result?.sanskritWords || result?.learnedWords || {},
    learnedWords: result?.learnedWords || {},
chants: result?.chants || result?.chantedVerses || {},
    mantras: result?.mantras || {}
        }
      );
      
      console.log('✅ APP: Scene completion saved to ProgressManager');
      console.log('📊 APP: Updated zone progress:', updatedZoneProgress);
      
      const unlockedScene = GameStateManager.unlockNextScene(currentZone, normalizedSceneId);
      if (unlockedScene) {
        console.log('🎉 APP: Next scene auto-unlocked:', unlockedScene);
      } else {
        console.log('🏁 APP: Last scene in zone completed');
      }
    } else {
      console.error('❌ APP: Missing required data for scene completion', {
        activeProfileId,
        currentZone,
        sceneId: normalizedSceneId,
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
  

  // Apply scene-specific styles only when rendering scenes
  const applySceneStyles = () => {
    document.body.className = '';
    document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden; width: 100vw; height: var(--app-height, 100vh);';
    
    const root = document.getElementById('root');
    if (root) {
      root.className = '';
      root.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: var(--app-height, 100vh); margin: 0; padding: 0;';
    }
  };

  useEffect(() => {
    if (currentView !== 'scene' || !currentZone || !currentScene) {
      return undefined;
    }

    const profileId = localStorage.getItem('activeProfileId');
    const normalizedSceneId = normalizeSceneId(currentZone, currentScene);
    const tempData = readTempSceneData(profileId, currentZone, normalizedSceneId);

    if (tempData.playAgainRequested) {
      const tempKey = `temp_session_${profileId}_${currentZone}_${normalizedSceneId}`;
      const sceneStateKey = `${profileId}_${currentZone}_${normalizedSceneId}_state`;
      localStorage.removeItem(tempKey);
      localStorage.removeItem(sceneStateKey);
    }

    applySceneStyles();

    return () => {
      document.body.className = '';
      document.body.style.cssText = '';

      const root = document.getElementById('root');
      if (root) {
        root.className = '';
        root.style.cssText = '';
      }
    };
  }, [currentView, currentZone, currentScene]);
  
  // Get zone data for current zone
  const getCurrentZoneData = () => {
    if (!currentZone) return null;
    return getZoneConfig(currentZone);
  };
  
  // Render different views
  return (
    <>
    {/* GameCoachProvider disabled — not used per CLAUDE.md */}
    <Suspense fallback={<div className="enhanced-loading-screen" />}>
{showEngineTest ? (
  <GaneshaEngineTest />
) : (
<>
{currentView === 'loading' && !showDarePopup && (
  <div className="enhanced-loading-screen">

    {/* Layer 1 — Atmospheric overlay (center lift + edge depth) */}
    <div className="bg-overlay" />
    {/* Layer 2 — Cinematic vignette */}
    <div className="bg-vignette" />

    {/* Ganesha Character (anchors the screen, stays floating) */}
    <div className="loading-ganesha-container">
      <div className="loading-ganesha-glow"></div>
      <img
        src={GANESHA_USAGE_SYSTEM.loading.asset}
        alt="Ganesha"
        className="loading-ganesha"
      />
    </div>

    {/* Mushika hops across 3 modaks that light up on real load progress */}
    <MushikaLoader
      progress={loadingProgress}
      ready={isInitialized}
    />
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
            onParentCorner={() => setCurrentView('parent-dashboard')}
          />
        </div>
      )}

      {currentView === 'parent-dashboard' && (
        <div className="view-transition">
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'var(--app-height, 100vh)', backgroundColor: '#FAF6EE' }}>Loading...</div>}>
            <ParentDashboard
              onBack={() => setCurrentView('profile-welcome')}
            />
          </Suspense>
        </div>
      )}
      
      {/* First-time profile creation — skips dashboard, goes straight to map */}
      {currentView === 'profile-create' && (
        <div className="view-transition">
          <CleanProfileSelector
            forceCreate={true}
            profiles={{}}
            onProfileSelect={(profileId) => {
              GameStateManager.setActiveProfile(profileId);
              setIntroStoryReturnView('map');
              setShowIntroStory(!localStorage.getItem(`ganeshaStoryShown_${profileId}`));
              setCurrentView('map');  // first-timers go directly to map after creating profile
            }}
          />
        </div>
      )}

      {currentView === 'profile-selector' && (
        <div className="view-transition">
          <CleanProfileSelector
            onProfileSelect={(profileId) => {
              GameStateManager.setActiveProfile(profileId);
              setCurrentView('profile-welcome');  // go to dashboard, not map
            }}
          />
        </div>
      )}

      {showIntroStory && (
        <div className="view-transition">
          <GaneshaIntroStory
            profileId={localStorage.getItem('activeProfileId')}
            childName={currentProfile?.name || GameStateManager.getCurrentProfile?.()?.name}
            onComplete={() => {
              setShowIntroStory(false);
              setCurrentView(introStoryReturnView === 'zone-welcome' ? 'zone-welcome' : 'map');
            }}
          />
        </div>
      )}

      {currentView === 'map' && !showIntroStory && (
        <div className="view-transition" style={{ position: 'relative' }}>
          <CleanMapZone
            onZoneSelect={handleZoneSelect}
            onBackToWelcome={() => setCurrentView('profile-welcome')}
            onGoToProfiles={() => setCurrentView('profile-welcome')}
            onParentCorner={() => setCurrentView('parent-dashboard')}
            onTWGOpen={() => setCurrentView('twg')}
            currentZone={currentZone}
            highlightedScene={currentScene}
          />
          {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => setShowDarePopup(true)}
            style={{
              position: 'absolute',
              left: '16px',
              top: '16px',
              zIndex: 1200,
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.94)',
              boxShadow: '0 8px 24px rgba(40,20,80,0.2)',
              color: '#5e49a8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
            aria-label="Test Daily Dare"
          >
            Test Daily Dare
          </button>
          )}
          {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => {
              setIntroStoryReturnView('map');
              setShowIntroStory(true);
            }}
            style={{
              position: 'absolute',
              left: '16px',
              top: '60px',
              zIndex: 1200,
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.94)',
              boxShadow: '0 8px 24px rgba(40,20,80,0.2)',
              color: '#5e49a8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
            aria-label="Test intro story"
          >
            Test Intro Story
          </button>
          )}
          {showDareChip && !showDarePopup && (
            <button
              type="button"
              onClick={() => setShowDarePopup(true)}
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '88px',
                transform: 'translateX(-50%)',
                zIndex: 1200,
                border: 'none',
                borderRadius: '999px',
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.94)',
                boxShadow: '0 8px 24px rgba(40,20,80,0.2)',
                color: '#5e49a8',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              aria-label="Share a happy moment"
            >
              ✨ Share a happy moment
            </button>
          )}
          {kindnessCheckEntry && !showDarePopup && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '140px',
                transform: 'translateX(-50%)',
                zIndex: 1400,
                width: 'min(92vw, 480px)',
                borderRadius: '22px',
                padding: '16px',
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 12px 28px rgba(40,20,80,0.22)',
                border: '1px solid rgba(130,100,200,0.15)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: '#5e49a8', fontSize: '20px', marginBottom: '6px' }}>
                Did you do your kindness mission? 🌟
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", color: '#6b5f8e', fontSize: '16px', marginBottom: '12px' }}>
                {kindnessCheckEntry.kindnessTask || 'Kindness mission'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleKindnessCheck(true)}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '12px 22px',
                    minHeight: '52px',
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#fff',
                    background: 'linear-gradient(135deg,#40b36b,#2f9d57)',
                    cursor: 'pointer'
                  }}
                >
                  I did it! 🎉
                </button>
                <button
                  type="button"
                  onClick={() => handleKindnessCheck(false)}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '12px 22px',
                    minHeight: '52px',
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#5e49a8',
                    background: '#efe9ff',
                    cursor: 'pointer'
                  }}
                >
                  Not yet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentView === 'twg' && (
        <TimeWithGaneshaHub onNavigate={handleNavigate} />
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
      {false && currentView === 'scene' && currentZone && currentScene && (() => {
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
          <ErrorBoundary onReset={() => {
            SimpleSceneManager.clearCurrentScene();
            setCurrentZone(null);
            setCurrentScene(null);
            setCurrentView('map');
          }}>
            <SceneLoader
              zoneId={currentZone}
              sceneId={currentScene}
              onNavigate={handleNavigate}
              onComplete={handleSceneComplete}
              onSceneSelect={handleSceneSelect}
              childName={currentProfile?.name || 'friend'}
              childAge={currentProfile?.age || 8}
            />
          </ErrorBoundary>
        );
      })()}
      {currentView === 'scene' && currentZone && currentScene && (
        <ErrorBoundary onReset={() => {
          SimpleSceneManager.clearCurrentScene();
          setCurrentZone(null);
          setCurrentScene(null);
          setCurrentView('map');
        }}>
          <StableSceneLoader
            zoneId={currentZone}
            sceneId={currentScene}
            onNavigate={handleNavigate}
            onComplete={handleSceneComplete}
            onSceneSelect={handleSceneSelect}
            childName={currentProfile?.name || 'friend'}
            childAge={currentProfile?.age || 8}
            sceneCacheRef={_sceneCache}
          />
        </ErrorBoundary>
      )}
      
      {/* Fallback view */}
      {!['loading', 'error', 'main-welcome', 'profile-welcome', 'profile-create', 'profile-selector', 'map', 'zone-welcome', 'scene', 'parent-dashboard', 'twg'].includes(currentView) && (
        <div className="unknown-view-error">
          <h2>Error: Unknown view state</h2>
          <p>Current view: {currentView}</p>
          <button onClick={() => setCurrentView('map')}>Go to Map</button>
        </div>
      )}
      </>
)}
    </Suspense>
    {/* TWG: Daily Dare Popup — fires once per day; z-index 3000 covers all views */}
    {showDarePopup && currentView === 'map' && (
      <Suspense fallback={null}>
      <DailyDarePopup onClose={() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setShowDarePopup(false);
        const today = new Date().toISOString().split('T')[0];
        setShowDareChip(localStorage.getItem('gmb_last_dare_date') === today);
      }} />
      </Suspense>
    )}
    {/* </GameCoachProvider> */}
    </>
  );
}

export default App;
