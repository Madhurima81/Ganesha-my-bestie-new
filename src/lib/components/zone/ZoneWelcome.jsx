// ZoneWelcome.jsx - Updated with Disney/PBS Unlock Detection System
// Path: lib/components/zone/ZoneWelcome.jsx

import React, { useState, useEffect } from 'react';
import './ZoneWelcome.css';
import '../../styles/zone-themes.css';
import { getZoneTheme, getProfilePillBtnStyle } from '../../config/ZoneThemes';
import ScreenHeader from '../shared/ScreenHeader';
import GameStateManager from '../../services/GameStateManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import HomeButton from '../ui/HomeButton';
import ProfileChip from '../navigation/ProfileChip';
import ProfilePillBtn from '../shared/ProfilePillBtn';
import { GANESHA_POSE_ASSETS } from '../../config/ganeshaUsageSystem';


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

const ZONE_LIFE_CONFIG = {
  'symbol-mountain': {
    creature: {
      kind: 'butterfly',
      src: '/images/map/butterflyyellow.png',
      alt: 'Yellow butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--yellow',
    },
    cloud: { left: '64%', top: '14%', scale: 1.08, duration: '36s' },
    ambient: [
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '14%', top: '22%', size: '11px', duration: '28s', delay: '0s' },
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '78%', top: '34%', size: '9px', duration: '31s', delay: '7s' },
    ],
  },
  'shloka-river': {
    creature: {
      kind: 'butterfly',
      src: '/images/map/butterflyblue.png',
      alt: 'Blue butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--blue',
    },
    cloud: { left: '20%', top: '12%', scale: 1.02, duration: '34s' },
    ambient: [
      { kind: 'drop', className: 'zone-ambient-item--drop', left: '18%', top: '24%', size: '11px', duration: '26s', delay: '0s' },
      { kind: 'drop', className: 'zone-ambient-item--drop', left: '76%', top: '18%', size: '9px', duration: '29s', delay: '8s' },
    ],
  },
  'cave-of-secrets': {
    creature: {
      kind: 'firefly',
      alt: 'Firefly',
      className: 'zone-card-creature--firefly',
    },
    cloud: { left: '68%', top: '13%', scale: 0.98, duration: '38s' },
    ambient: [
      { kind: 'firefly', className: 'zone-ambient-item--firefly', left: '20%', top: '18%', size: '8px', duration: '24s', delay: '0s' },
      { kind: 'firefly', className: 'zone-ambient-item--firefly', left: '74%', top: '30%', size: '7px', duration: '27s', delay: '6s' },
    ],
  },
  'about-me-hut': {
    creature: {
      kind: 'bird',
      src: '/images/critters/bird-flying-orange.svg',
      alt: 'Orange bird',
      className: 'zone-card-creature--bird zone-card-creature--orange',
    },
    cloud: { left: '18%', top: '13%', scale: 1.04, duration: '35s' },
    ambient: [
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '16%', top: '26%', size: '12px', duration: '30s', delay: '0s' },
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '76%', top: '18%', size: '10px', duration: '33s', delay: '9s' },
    ],
  },
  'festival-square': {
    creature: {
      kind: 'butterfly',
      src: '/images/critters/butterfly-pink.svg',
      alt: 'Pink butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--pink',
    },
    cloud: { left: '70%', top: '14%', scale: 1.06, duration: '37s' },
    ambient: [
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '18%', top: '18%', size: '10px', duration: '29s', delay: '0s' },
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '76%', top: '26%', size: '9px', duration: '32s', delay: '8s' },
    ],
  },
  'story-treehouse': {
    creature: {
      kind: 'bird',
      src: '/images/map/birdnew.png',
      alt: 'Yellow bird',
      className: 'zone-card-creature--bird zone-card-creature--yellow',
    },
    cloud: { left: '22%', top: '12%', scale: 1.03, duration: '35s' },
    ambient: [
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '18%', top: '20%', size: '12px', duration: '31s', delay: '0s' },
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '72%', top: '29%', size: '10px', duration: '34s', delay: '7s' },
    ],
  },
};

// ✅ ENHANCED: More specific color mapping


const ZoneWelcome = ({ 
  zoneData,           // Zone configuration object
  onSceneSelect,      // Function to navigate to specific scene
  onNavigate          // General navigation function
}) => {
  const getZoneMapGaneshaAsset = (pose) =>
    pose === 'celebration' ? GANESHA_POSE_ASSETS.celebrate : GANESHA_POSE_ASSETS.standPoint;
  const [sceneProgress, setSceneProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [culturalData, setCulturalData] = useState(null); // ← ADD THIS LINE
  const [isHomeExiting, setIsHomeExiting] = useState(false);
  const [profileChipPulse, setProfileChipPulse] = useState(false);
  // Tracks which scene whispers the child has heard — drives re-render to hide Ganesha
  const [heardWhispers, setHeardWhispers] = useState({});
  const [confetti, setConfetti] = useState([]);
  const [activeCardPopSceneId, setActiveCardPopSceneId] = useState(null);

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

  useEffect(() => {
    const shouldPulse = sessionStorage.getItem('zone_welcome_profile_chip_pulse') === '1';
    if (!shouldPulse) return;

    sessionStorage.removeItem('zone_welcome_profile_chip_pulse');
    setProfileChipPulse(true);
    const timer = setTimeout(() => setProfileChipPulse(false), 850);
    return () => clearTimeout(timer);
  }, []);

  // Add this line:

const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);

// Import the session manager at the top

// ── VO persistence — once-per-profile-per-zone ──
const _voKey = (kind) => {
  const pid = localStorage.getItem('activeProfileId') || 'default';
  return `gzw_vo_${pid}_${zoneData?.id}_${kind}`;
};
const hasHeardZoneVo = (kind) => {
  try { return localStorage.getItem(_voKey(kind)) === '1'; } catch { return false; }
};
const markZoneVoHeard = (kind) => {
  try { localStorage.setItem(_voKey(kind), '1'); } catch {}
};

const speakZoneLine = (text) => {
  if (!text) return;
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
  if (GameStateManager?.isMuted?.()) return;
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  u.pitch = 1;
  u.volume = 0.9;
  const voices = window.speechSynthesis.getVoices?.() || [];
  const indianVoice = voices.find(v => v.lang === 'en-IN');
  if (indianVoice) u.voice = indianVoice;
  window.speechSynthesis.speak(u);
};

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

// 🎉 Zone completion confetti effect
useEffect(() => {
  const completedCount = (zoneData?.scenes || []).filter(
    (scene) => getSceneStatus(scene).status === 'completed'
  ).length;
  const isZoneComplete = completedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;

  if (isZoneComplete && confetti.length === 0) {
    // Generate 15-20 confetti pieces
    const confettiCount = Math.floor(Math.random() * 6) + 15;
    const newConfetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2
    }));
    setConfetti(newConfetti);
    // Clear confetti after animation ends
    const timer = setTimeout(() => setConfetti([]), 1500);
    return () => clearTimeout(timer);
  }
}, [sceneProgress, zoneData?.scenes]);

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
      const replayKey = `replay_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
      const tempData = localStorage.getItem(tempKey) || localStorage.getItem(replayKey);
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
            (tempState.phase === 'mooshika_search' && tempState.welcomeShown === true) ||
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
  const replayKey = `replay_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
  const replaySessionRaw = localStorage.getItem(replayKey);
  // Prefer replay session when it exists; temp_session can be stale from old runs.
  const tempData = replaySessionRaw || localStorage.getItem(tempKey);
  let hasReplaySession = !!replaySessionRaw;
  let replayIsOpeningState = false;

  if (replaySessionRaw) {
    try {
      const replayState = JSON.parse(replaySessionRaw);
      const phase = replayState?.phase;
      const isOpeningPhase = !phase || phase === 'initial' || phase === 'mooshika_search';
      const hasMeaningfulProgress = (
        replayState?.stars > 0 ||
        (replayState?.welcomeShown === true && !['initial', 'mooshika_search'].includes(phase || 'initial')) ||
        replayState?.mooshikaFound === true ||
        replayState?.moundStates?.some(state => state === 1) ||
        replayState?.collectedModaks?.length > 0 ||
        replayState?.lotusStates?.some(state => state === 1) ||
        replayState?.placedSymbols && Object.keys(replayState.placedSymbols).length > 0 ||
        (phase && !['initial', 'mooshika_search'].includes(phase)) ||
        (replayState?.gamePhase && !['intro', 'initial'].includes(replayState.gamePhase))
      );

      replayIsOpeningState = isOpeningPhase && !hasMeaningfulProgress;
      if (replayIsOpeningState) {
        hasReplaySession = false; // Opening modal reload should still show "Replay"
      }
    } catch (e) {
      console.error('Error parsing replay session state:', e);
    }
  }
  

  
 // ✅ ADD THIS NEW CHECK at the top of temp data parsing:
if (tempData) {
  try {
    const tempState = JSON.parse(tempData);
    
    // Completion celebration was showing — treat as completed, show Replay only
    if (tempState.showingCompletionScreen === true) {
      console.log(`🎬 COMPLETION SCREEN: ${scene.id} → treating as completed, show Replay only`);
      return { status: 'completed', stars: tempState.stars || progress?.stars || 0, hasReplaySession };
    }
      
      // ✅ SCENE-SPECIFIC COMPLETION DETECTION
      let isCompleteInTemp = false;
      
      if (scene.id === 'modak') {
        // Modak is complete only when explicitly completed/completion phase/screen.
        // rock_transformed is a pre-completion stage (belly card reveal), so keep Continue.
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'pond') {
        // Pond is complete only when explicitly completed/completion phase/screen.
        // elephantTransformed+goldenLotusBloom is a pre-completion stage (trunk card reveal).
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'symbol') {
        // Symbol is complete only when explicitly completed/completion phase/screen.
        // all_complete is reached before the final completion modal appears.
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
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
      } else if (scene.id === 'vakratunda-grove') {
        // Complete if: both words learned, mahakaya_power phase (both games done,
        // in final reveal — SceneManager stops saving after this), or explicitly complete
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.phase === 'mahakaya_power' ||
          (tempState.learnedWords?.vakratunda === true && tempState.learnedWords?.mahakaya === true)
        );
      } else if (scene.id === 'family-tree') {
        // Complete if: sideBySide phase reached (both trees shown) OR completion screen showing
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.gamePhase === 'sideBySide' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'my-indian-story') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
        );
      } else if (scene.id === 'favorite-food') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
        );
      } else if (scene.id === 'dreams-wishes') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
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
        return { status: 'completed', stars: tempState.stars || progress.stars || 0, hasReplaySession };
      }
      
      // ✅ NOW check for partial progress (more restrictive)
      const hasMeaningfulDiscoveredSymbols = (() => {
        const symbols = tempState.discoveredSymbols || {};
        if (!symbols || Object.keys(symbols).length === 0) return false;

        // Scene-specific symbol progress checks:
        // Pond preloads earlier symbols (mooshika/modak/belly), so only lotus/trunk
        // should count as in-progress for Pond.
        if (scene.id === 'pond') {
          return !!(symbols.lotus || symbols.trunk);
        }
        return Object.keys(symbols).length > 0;
      })();

      const hasPartialProgress = (
  tempState.stars > 0 ||
  (tempState.phase === 'mooshika_search' && tempState.welcomeShown === true) ||
  tempState.phase && !['initial', 'mooshika_search'].includes(tempState.phase) ||
  (tempState.gamePhase && !['intro', 'initial'].includes(tempState.gamePhase)) ||
  hasMeaningfulDiscoveredSymbols ||
  tempState.placedSymbols && Object.keys(tempState.placedSymbols).length > 0 ||
  tempState.mooshikaFound ||
  tempState.moundStates?.some(state => state === 1) ||   // ✅ any mound tapped = in-progress
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
        return { status: 'in-progress', stars: tempState.stars || 0, hasReplaySession };
      }
      
      console.log(`🔄 TEMP EMPTY: ${scene.id} has empty temp session`);
      
    } catch (e) {
      console.error('Error parsing temp data:', e);
    }
  }
  
  // ✅ Fall back to permanent data
  if (progress.completed === true) {
    console.log(`💾 PERMANENT: ${scene.id} is permanently completed`);
    return { status: 'completed', stars: progress.stars || 0, hasReplaySession };
  }
  
  if (progress.stars > 0) {
    return { status: 'in-progress', stars: progress.stars || 0 };
  }

  // Fallback: if Symbol Mountain has progress in later scenes, Modak should not show "Start".
  // This handles inconsistent saved completion flags for the first scene.
  if (zoneData?.id === 'symbol-mountain' && scene.id === 'modak') {
    const laterSceneIds = ['pond', 'symbol', 'final-scene'];
    const hasLaterProgress = laterSceneIds.some((id) => {
      const p = sceneProgress[id];
      if (p?.completed || (p?.stars || 0) > 0 || (p?.progress?.percentage || 0) > 0) return true;

      const profileId = localStorage.getItem('activeProfileId');
      const key = `temp_session_${profileId}_${zoneData.id}_${id}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      try {
        const temp = JSON.parse(raw);
        return (
          temp?.completed === true ||
          temp?.showingCompletionScreen === true ||
          temp?.phase === 'complete' ||
          temp?.phase === 'all_complete' ||
          temp?.phase === 'zone-complete' ||
          temp?.stars > 0 ||
          (temp?.progress?.percentage || 0) > 0
        );
      } catch {
        return false;
      }
    });

    if (hasLaterProgress) {
      return { status: 'completed', stars: progress?.stars || 0, hasReplaySession };
    }
  }
  
  return { status: 'available', stars: 0, hasReplaySession };
};

// ⭐ PROGRESS DOTS — reads ONLY from permanent storage (GameStateManager).
// Completely separate from getSceneStatus so replay sessions never affect dot count.
// Same pattern as CulturalProgressExtractor for symbol count.
const getPermanentCompletedCount = () => {
  try {
    const gameProgress = GameStateManager.getGameProgress();
    const zoneScenes = gameProgress.zones?.[zoneData?.id]?.scenes || {};
    return (zoneData?.scenes || []).filter(
      scene => zoneScenes[scene.id]?.completed === true
    ).length;
  } catch (e) {
    return 0;
  }
};

  // ── Scene Whisper heard-tracking ──────────────────────────────────────────
  // Persisted per profile + zone + scene in localStorage.
  // Ganesha appears next to a scene ONLY the first time it unlocks.
  // Once the child taps (or dismisses), it is gone forever for that scene.

  const _whisperKey = (sceneId) => {
    const pid = localStorage.getItem('activeProfileId') || 'default';
    return `gsw_heard_${pid}_${zoneData?.id}_${sceneId}`;
  };

  const hasHeardWhisper = (sceneId) => {
    if (heardWhispers[sceneId]) return true;
    try { return localStorage.getItem(_whisperKey(sceneId)) === '1'; } catch { return false; }
  };

  const markWhisperHeard = (sceneId) => {
    try { localStorage.setItem(_whisperKey(sceneId), '1'); } catch {}
    setHeardWhispers(prev => ({ ...prev, [sceneId]: true }));
  };

  // Show invite-whisper only when:
  //   1. At least one scene is still locked (progressive unlock is active)
  //   2. This scene just became 'available' (freshly unlocked, not started)
  //   3. Child hasn't heard this whisper yet
  const shouldShowInviteWhisper = (scene, status) => {
    if (!zoneData?.scenes) return false;
    const anyLocked = zoneData.scenes.some(s => getSceneStatus(s).status === 'locked');
    if (!anyLocked) return false;                   // all unlocked → no whispers
    if (status.status !== 'available') return false; // only on fresh unlocks
    return !hasHeardWhisper(scene.id);
  };

  const getCardAccentColor = () => {
    const theme = getZoneTheme(zoneData?.id);
    return theme?.accentColor || '#9b7be8';
  };

  const getZoneWelcomeGaneshaState = () => {
    if (!zoneData?.scenes?.length) return null;

    const sceneStatuses = zoneData.scenes.map((scene) => ({
      scene,
      status: getSceneStatus(scene).status
    }));

    const completedCount = sceneStatuses.filter((entry) => entry.status === 'completed').length;
    const allDone = completedCount === zoneData.scenes.length;

    if (allDone) {
      const lastScene = zoneData.scenes.reduce((latest, scene) => {
        if (!latest || (scene.order || 0) > (latest.order || 0)) return scene;
        return latest;
      }, null);
      return { pose: 'celebration', activeSceneId: lastScene?.id, size: 66 };
    }

    const nextActive = sceneStatuses.find(
      (entry) => entry.status === 'available' || entry.status === 'in-progress'
    );

    // Ganesha badge is a persistent visual guide — always points at the next scene.
    // (The whisper audio system handles its own timing separately.)
    if (!nextActive?.scene?.id) {
      return null;
    }

    return {
      pose: 'pointing',
      activeSceneId: nextActive.scene.id,
      size: 88
    };
  };

  const triggerActiveCardGaneshaPop = (sceneId) => {
    if (!sceneId || zoneWelcomeGaneshaState?.activeSceneId !== sceneId) return;
    setActiveCardPopSceneId(sceneId);
    window.setTimeout(() => {
      setActiveCardPopSceneId((prev) => (prev === sceneId ? null : prev));
    }, 800);
  };

  // ✅ MVP: Only scene 1 is playable in each zone — scenes 2+ are "Coming Soon"
  const MVP_FIRST_SCENE_ONLY = false;

  // Progressive unlock: first scene is open; next scenes open via completion/auto-unlock.
  const checkSceneUnlocked = (scene) => {
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

  if (zoneWelcomeGaneshaState?.activeSceneId === scene.id) {
    markWhisperHeard(scene.id);
  }
  
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
        if (status.hasReplaySession) {
          console.log('↪ DEFAULT: Completed scene with replay session - continuing replay');
          if (onSceneSelect) {
            onSceneSelect(scene.id, { mode: 'continue' });
          }
          return;
        }
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

const handleReplayIntroStory = () => {
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    localStorage.removeItem(`ganeshaStoryShown_${profileId}`);
  }
  if (onSceneSelect) {
    onSceneSelect('__replay_intro_story__', { mode: 'start' });
  }
};

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`scene-star ${i < count ? 'earned' : 'empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };

  // VO effect — welcome + completion VO, once-per-profile
  useEffect(() => {
    if (!zoneData?.id || isLoading || !sceneProgress) return;

    const timer = setTimeout(() => {
      // Calculate zone completion inside effect to avoid temporal dead zone
      const zoneCompletedCount = (zoneData?.scenes || []).filter(
        (scene) => getSceneStatus(scene).status === 'completed'
      ).length;
      const isZoneComplete = zoneCompletedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;

      if (isZoneComplete && !hasHeardZoneVo('complete')) {
        speakZoneLine(`You finished ${zoneData.name.replace('\n', ' ')}! I'm so proud of you.`);
        markZoneVoHeard('complete');
        return;
      }

      if (!hasHeardZoneVo('welcome')) {
        speakZoneLine(`Welcome to ${zoneData.name.replace('\n', ' ')}! Tap a card to begin.`);
        markZoneVoHeard('welcome');
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [zoneData?.id, isLoading, sceneProgress]);

  if (isLoading || !zoneData) {
    return (
      <div className="zone-welcome-loading">
        <div className="loading-spinner">🌟 Loading {zoneData?.name || 'zone'}...</div>
      </div>
    );
  }

  const zoneWelcomeGaneshaState = getZoneWelcomeGaneshaState();
  const zoneLifeConfig = ZONE_LIFE_CONFIG[zoneData.id] || null;
  const zoneCompletedCount = (zoneData?.scenes || []).filter(
    (scene) => getSceneStatus(scene).status === 'completed'
  ).length;
  const isZoneComplete = zoneCompletedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;
  const recommendedScene = zoneData?.scenes?.find((scene) => getSceneStatus(scene).status === 'available') || null;

  return (
    <div
      className={`zone-welcome-container screen ${zoneData.id} ${isHomeExiting ? 'zone-welcome-exiting' : ''} ${isZoneComplete ? 'zone-complete' : ''}`}
      data-zone={zoneData.id}
      style={{
        '--zone-bg': `url('${zoneData.background}')`,
        '--zone-text-primary': getZoneTheme(zoneData.id)?.textPrimary || '#6B5416'
      }}
    >
      {/* Confetti container */}
      {confetti.length > 0 && (
        <div className="zone-confetti">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: `${piece.left}%`,
                top: '-20px',
                animationDelay: `${piece.delay}s`
              }}
            />
          ))}
        </div>
      )}

      <HomeButton
        onNavigate={onNavigate}
        onPrepareNavigate={() => setIsHomeExiting(true)}
        transitionMs={130}
      />
      <ProfileChip onNavigate={onNavigate} pulseOnce={profileChipPulse} />
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

      <div className="zone-title-top zone-title">
        <ScreenHeader title={zoneData.name} glowColor="gold" />
        {isZoneComplete && (
          <div className="zone-mastered-badge" aria-label="Zone mastered">
            <span className="mastered-line" aria-hidden="true" />
            <span className="mastered-text">Mastered</span>
            <span className="mastered-line" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Zone Welcome Whisper removed per request */}

      {/* Scene Icons Grid */}
      <div className="zone-scenes-container cards-wrapper" data-zone={zoneData.id}>
        {zoneLifeConfig && (
          <div className="zone-ambient-layer" aria-hidden="true">
            {zoneLifeConfig.cloud && (
              <div
                className="zone-cloud"
                style={{
                  left: zoneLifeConfig.cloud.left,
                  top: zoneLifeConfig.cloud.top,
                  '--cloud-scale': zoneLifeConfig.cloud.scale || 1,
                  animationDuration: zoneLifeConfig.cloud.duration,
                }}
              />
            )}
            {zoneLifeConfig.ambient.map((item, index) => (
              <div
                key={`${zoneData.id}-ambient-${index}`}
                className={`zone-ambient-item ${item.className}`}
                style={{
                  left: item.left,
                  top: item.top,
                  width: item.size,
                  height: item.size,
                  animationDuration: item.duration,
                  animationDelay: item.delay,
                }}
              />
            ))}
          </div>
        )}
        <div className="scenes-horizontal-container">
          {zoneData.scenes.map((scene, index) => {
            const status = getSceneStatus(scene);
            const isNextScene = recommendedScene && recommendedScene.id === scene.id;
            const creature = zoneLifeConfig?.creature;
            // Ganesha: any available (unlocked, never played) card — zones unlock sequentially so only one exists at a time
            const showGaneshaGuide = status.status === 'available';
            // Butterfly: completed + in-progress cards (played at least once)
            const showButterfly =
              zoneLifeConfig &&
              creature &&
              (status.status === 'completed' || status.status === 'in-progress' || sceneProgress[scene.id]?.completed === true);
            
            return (
              <>
              <div
                key={scene.id}
                className={`zone-scene-card scene-card zone-card zone-${scene.order} ${status.status} ${
                  highlightedScene === scene.id ? 'highlighted' : ''
                } ${status.status === 'locked' ? 'locked-scene' : 'unlocked-scene'} ${
                  isNextScene ? 'next-scene' : ''
                }`}
                style={{
                  cursor: status.status === 'locked' ? 'not-allowed' : 'pointer',
                  '--zone-color': getCardAccentColor()
                }}
                onClick={() => handleSceneClick(scene)}
                onMouseEnter={() => triggerActiveCardGaneshaPop(scene.id)}
                onTouchStart={() => triggerActiveCardGaneshaPop(scene.id)}
              >
                {showButterfly && creature && (
                  <div
                    className={`zone-card-creature ${creature.className || ''} ${
                      isNextScene ? 'zone-card-creature--recommended' : ''
                    } ${status.status === 'in-progress' ? 'zone-card-creature--in-progress' : ''}`}
                    aria-hidden="true"
                  >
                    {creature.kind === 'firefly' ? (
                      <span className="zone-card-firefly" />
                    ) : (
                      <img src={creature.src} alt="" className="zone-card-creature-image" />
                    )}
                  </div>
                )}

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
                  <div className="scene-complete-badge scene-complete-icon">✓</div>
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
                      <div className="scene-lock-overlay" aria-hidden="true">
                        <img src="/images/map/lock.png" alt="" className="scene-lock-icon" />
                      </div>
                    )}
                  </div>

                  {/* ✨ NEW: Scene Name Area (Middle) */}
                  <div className="scene-name-area">
                    <div className="scene-name">
                      {scene.name}
                    </div>
                    {/* Scene Invite Whisper — appears only the FIRST TIME a scene
                        unlocks. Tapping plays Ganesha's invite. Heard/dismissed
                        = marked done in localStorage, Ganesha gone from this card. */}
                    {/* Scene invite whisper removed per request */}
                  </div>

                  {/* ✨ NEW: Integrated Action Area (Bottom) */}
                  <div className="scene-action-integrated">
                    {status.status === 'in-progress' ? (
                      <div className="action-split-container">
                        <ProfilePillBtn
                          className="zone-welcome-cta zone-welcome-continue-btn btn-continue"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerActiveCardGaneshaPop(scene.id);
                            handleSceneClick(scene, 'continue');
                          }}
                          label="Continue"
                          size="sm"
                          fullWidth={true}
                          style={getProfilePillBtnStyle(zoneData.id)}
                        />
                        <ProfilePillBtn
                          className="zone-welcome-cta zone-welcome-replay-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerActiveCardGaneshaPop(scene.id);
                            handleSceneClick(scene, 'replay');
                          }}
                          label="↻"
                          ariaLabel="Replay"
                          size="sm"
                          fullWidth={false}
                          style={getProfilePillBtnStyle(zoneData.id, {
                            top: '#5FBEA8',
                            base: '#4A9B87',
                            shadow: '#1A6B5A',
                            glow: 'rgba(74, 155, 135, 0.28)'
                          })}
                        />
                      </div>
                    ) : (
                      <ProfilePillBtn
                        className={`zone-welcome-cta ${status.status}`.trim()}
                        onClick={(e) => {
                          e.stopPropagation();
                              console.log('Button clicked!', scene.id); // ✨ DEBUG LOG
                          triggerActiveCardGaneshaPop(scene.id);
                          handleSceneClick(scene);
                        }}
                        label={status.status === 'available' ? 'Start' : status.status === 'completed' ? '↻ Play Again' : 'Locked'}
                        size="sm"
                        fullWidth={true}
                        style={getProfilePillBtnStyle(zoneData.id)}
                      />
                    )}
                  </div>
                  {showGaneshaGuide && (
                    <div
                      className={`zone-card-ganesha-guide zone-card-ganesha-guide--pointing`}
                      aria-hidden="true"
                    >
                      <img
                        src={getZoneMapGaneshaAsset('pointing')}
                        alt=""
                        className="zone-card-ganesha-guide-image"
                      />
                    </div>
                  )}
                </div>
              </div>

              </>
            );
          })}

          {zoneData.id === 'about-me-hut' && (
            <div
              key="about-me-replay-story"
              className="zone-scene-card scene-card zone-card zone-5 available unlocked-scene"
              style={{
                cursor: 'pointer',
                '--zone-color': getCardAccentColor()
              }}
              onClick={handleReplayIntroStory}
            >
              <div className="scene-order-indicator">★</div>
              <div className="zone-inner">
                <div className="scene-icon-area">
                  <div className="icon-circle">
                    <img
                      src="/intro-story/story1-img4.png"
                      alt="Meet Ganesha Again"
                      className="scene-icon-img"
                    />
                  </div>
                </div>
                <div className="scene-name-area">
                  <div className="scene-name">Meet Ganesha Again</div>
                </div>
                <div className="scene-action-integrated">
                  <ProfilePillBtn
                    className="zone-welcome-cta available"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplayIntroStory();
                    }}
                    label="Replay Story"
                    size="sm"
                    fullWidth={true}
                    style={getProfilePillBtnStyle(zoneData.id)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

{/* JOURNEY PANEL — progress pill at bottom */}
<div className="stats-bottom-bar">
  {Object.keys(sceneProgress).length > 0 ? (() => {
    const zoneStats = getZoneStats();
    const totalScenes = zoneStats.total;
    // ⭐ Use permanent-only count — never affected by replay/temp sessions
    // Same pattern as symbol count (CulturalProgressExtractor). Keeps dots stable.
    const completedCount = getPermanentCompletedCount();
    const displayCount = Math.min(completedCount, totalScenes);
    const progressDotsCount = completedCount;
    const allScenesCompleted = completedCount >= totalScenes && totalScenes > 0;

    const statIcon = '/images/icons/symbols-icon.png';
    const statLabel = 'Scenes';

    return (
      <div className="journey-panel zone-progress">
        {statIcon && (
          <div className="journey-left">
            <img src={statIcon} alt={statLabel} className="journey-stat-icon" />
            <div className="journey-left-text">
              <span className="journey-left-main zone-progress-label">
                {displayCount}/{totalScenes} {statLabel}
              </span>
            </div>
          </div>
        )}
        <div className="journey-steps">
          {Array.from({ length: totalScenes }, (_, i) => (
            <span key={i} className={`step progress-dot ${i < progressDotsCount ? 'done' : ''}`} />
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
