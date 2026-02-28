// zones/cave-of-secrets/scenes/nirvighnam-kurumedeva/NirvighnamScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import './NirvighnamScene.css';
import '../../../shared/components/OpeningModal.css';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from "../../../../lib/services/ProgressManager";
import SimpleSceneManager from "../../../../lib/services/SimpleSceneManager";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Cave-specific components
import DoorComponent from '../../components/DoorComponent';
import RescueModal from '../../components/RescueModal';
import { RESCUE_CONFIGS } from '../../config/RescueConfigs';
import SymbolSidebar from '../../components/SymbolSidebar';

// Game components
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';

import meaningJournal from '../../assets/images/meaning-journal.png';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';

// Cave images
import caveBackgroundDark from './assets/images/caveriver-background.png';
import doorImage from './assets/images/door-image.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png'; // Added character image


// Crystal tool images
import crystalAnger from './assets/images/crystal-anger.png';
import crystalFear from './assets/images/crystal-fear.png';
import crystalSad from './assets/images/crystal-sad.png';

// Fog area images
import fogAnger from './assets/images/fog-anger.png';
import fogFear from './assets/images/fog-fear.png';
import fogSad from './assets/images/fog-sad.png';

// Rock collection images
import rockAnger from './assets/images/rock-anger.png';
import rockFear from './assets/images/rock-fear.png';
import rockSad from './assets/images/rock-sad.png';


// App images
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';
import appSuryakoti from "../../assets/images/apps/app-suryakoti.png";
import appSamaprabha from "../../assets/images/apps/app-samaprabha.png";
import appNirvighnam from "../../assets/images/apps/app-nirvighnam.png";
import appKurumedeva from "../../assets/images/apps/app-kurumedeva.png";

// Symbol images for celebrations
import nirvighnamSymbol from '../../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../../assets/images/symbols/kurumedeva-symbol.png';

// ✅ NEW: Simple 3-click fog reveal component
const SimpleFogClicker = ({ emotionId, fogImage, rockImage, onComplete, isActive, fogProgress = 0 }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  if (!isActive && fogProgress === 0) return null;

  const opacity = Math.max(0, 1 - (fogProgress / 3));

  return (
    <div 

      className={`simple-fog-clicker fog-${emotionId}`}
      style={{
        position: 'relative',
        width: '240px',     // ✅ Made bigger
        height: '200px',    // ✅ Made bigger
        cursor: 'default',
        border: '3px solid transparent',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        overflow: 'visible'  // ✅ Don't crop!
      }}
    >
      {/* Rock Background */}
      <img 
        src={rockImage}
        alt={`${emotionId} rock`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          zIndex: 1
        }}
      />
      
      {/* Fog Overlay */}
      {fogProgress < 3 && (
        <img 
          src={fogImage}
          alt={`${emotionId} fog`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
            zIndex: 2,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none'
          }}
        />
      )}
      
{/* Initial Instruction - BEFORE first click */}
      {isActive && fogProgress === 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 215, 0, 0.95)',
          color: '#2c1810',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 3,
          border: '3px solid #FFA500',
          animation: 'bounce 2s infinite',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          👆 Click 3 times to clear!
        </div>
      )}
      
      {/* Progress Counter - AFTER first click */}
      {isActive && fogProgress > 0 && fogProgress < 3 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#FFD700',
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 3,
          border: '2px solid #FFD700'
        }}>
          {3 - fogProgress} more clicks!
        </div>
      )}
      {/* Completion Badge */}
      {fogProgress >= 3 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '64px',
          zIndex: 3,
          animation: 'bounceIn 0.5s ease-out',
          textShadow: '0 0 20px rgba(255,215,0,0.8)'
        }}>
          ✨
        </div>
      )}
    </div>
  );
};

const SimpleRockPlacer = ({ rockId, rockImage, emotion, onPlace, isPlaced, isUsed, isClickable = true }) => {
  const [isAnimating, setIsAnimating] = useState(false);  // ✅ This was missing!
  
  const handleClick = () => {
    // Check if clickable first
    if (!isClickable) {
      console.log(`🚫 Rock ${rockId} not clickable yet - place previous rocks first`);
      return;
    }
    
    if (isPlaced || isUsed || isAnimating) return;

    console.log(`🪨 Rock clicked: ${rockId}`);
    setIsAnimating(true);

    // Animate then place
    setTimeout(() => {
      onPlace(rockId);
      setIsAnimating(false);
    }, 800);
  };

  // Don't render if already used in bridge
  if (isUsed) return null;

  return (
    <div 
      onClick={handleClick}
      style={{
        width: '80px',
        height: '80px',
        cursor: !isClickable ? 'not-allowed' : (isAnimating ? 'default' : 'pointer'),
        opacity: !isClickable ? 0.4 : (isAnimating ? 0.3 : 1),
        transform: isAnimating ? 'scale(0.5)' : 'scale(1)',
        transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
        position: 'relative',
        filter: isAnimating ? 'blur(2px)' : (!isClickable ? 'grayscale(0.5)' : 'none')
      }}
    >
      <img 
        src={rockImage}
        alt={`${emotion} rock`}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          border: isAnimating ? '3px solid rgba(255, 215, 0, 0.3)' : 
                  !isClickable ? '3px solid rgba(128, 128, 128, 0.3)' :
                  '3px solid rgba(255, 215, 0, 0.6)',
          boxShadow: isAnimating ? 'none' : 
                     !isClickable ? '0 2px 4px rgba(0,0,0,0.2)' :
                     '0 4px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
      />
      
      {!isAnimating && isClickable && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '5px 12px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          animation: 'bounce 2s infinite',
          border: '2px solid #FFD700'
        }}>
          👆 Click to place!
        </div>
      )}
    </div>
  );
};

const getBridgeRockPosition = (displayIndex) => {
  // Center over the river gap
  const bridgeCenterX = 50;
  const bridgeCenterY = 60;
  
  const positions = [
    { top: bridgeCenterY, left: bridgeCenterX - 10 },  // Left
    { top: bridgeCenterY - 3, left: bridgeCenterX },   // Center (slightly higher)
    { top: bridgeCenterY, left: bridgeCenterX + 10 }   // Right
  ];
  const pos = positions[displayIndex] || positions[0];
  
  return {
    top: `${pos.top}%`,
    left: `${pos.left}%`
  };
};

const CAVE_PHASES = {
    STORY_INTRO: 'story_intro', // ← ADD THIS LINE

  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  CRYSTAL_FOG_INTRO: 'crystal_fog_intro',
  CRYSTAL_FOG_ACTIVE: 'crystal_fog_active',
  CRYSTAL_FOG_COMPLETE: 'crystal_fog_complete',
  NIRVIGHNAM_LEARNING: 'nirvighnam_learning',
  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  BRIDGE_BUILDING_INTRO: 'bridge_building_intro',
  BRIDGE_BUILDING_ACTIVE: 'bridge_building_active',
  BRIDGE_BUILDING_COMPLETE: 'bridge_building_complete',
  KURUME_DEVA_LEARNING: 'kurume_deva_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

// Story modal data
const STORY_MODALS = {
  nirvighnam: {
    icon: doorImage, // Using doorImage as Ganesha icon
    speech: "Let's remove all obstacles! 🛡️",
    title: "Learn the Obstacle Remover Chant!",
    subtitle: "2 divine words to master!",
    description: "First, learn to chant NIRVIGHNAM to unlock obstacle-removing power and save animals!",
    buttonText: "Start Learning!",
    buttonColor: "linear-gradient(135deg, #FFD700, #FFA500)"
  },
  kurumedeva: {
    icon: doorImage,
    speech: "Now receive my divine blessing! 🙏",
    title: "Amazing Work!",
    subtitle: "Complete the blessing!",
    description: "Learn to chant KURUMEDEVA to unlock divine blessing power and save animals!",
    buttonText: "Complete Learning!",
    buttonColor: "linear-gradient(135deg, #9C27B0, #E91E63)"
  }
};

// Emotion crystal mapping system
const EMOTION_PAIRS = [
  {
    crystal: crystalAnger,
    fog: fogAnger,
    rock: rockAnger,
    emotion: 'anger',
    id: 'anger'
  },
  {
    crystal: crystalFear,
    fog: fogFear,
    rock: rockFear,
    emotion: 'fear',
    id: 'fear'
  },
  {
    crystal: crystalSad,
    fog: fogSad,
    rock: rockSad,
    emotion: 'sad',
    id: 'sad'
  }
];

// Power configuration for celebrations
const powerConfig = {
  nirvighnam: { 
    name: 'Obstacle Remover Power', 
    image: nirvighnamSymbol,
    color: '#9C27B0' 
  },
  kurumedeva: { 
    name: 'Divine Help Power', 
    image: kurumedevaSymbol,
    color: '#FFD700' 
  }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Nirvighnam Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Obstacle Remover Chamber.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Chamber Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const NirvighnamScene = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'nirvighnam-kurumedeva'
}) => {
  console.log('NirvighnamScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Door states
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Nir', 'vigh', 'nam'],

          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Kuru', 'me', 'de', 'va'],

          // Game 1: Crystal Fog Clearing
          crystalFogStarted: false,
          selectedCrystal: null,
          clearedFogs: [],
          collectedRocks: [],
          crystalFogCompleted: false,
          emotionalProgress: 0,

          // Game 2: Bridge Building
          bridgeBuildingStarted: false,
          bridgeRocks: [],
          bridgeStability: 0,
          bridgeCompleted: false,
          ganeshaCanCross: false,
          
          // Sanskrit learning
          learnedWords: {
            vakratunda: { learned: true, scene: 1 },
            mahakaya: { learned: true, scene: 1 },
            suryakoti: { learned: true, scene: 2 },
            samaprabha: { learned: true, scene: 2 },
            nirvighnam: { learned: false, scene: 3 },
            kurumedeva: { learned: false, scene: 3 }
          },
          
          // Scene progression
phase: CAVE_PHASES.DOOR1_ACTIVE, // ✅ Was 'STORY_INTRO'
          currentFocus: 'door1',

         
          
          // Discovery and popup states
          discoveredSymbols: {},
          currentPopup: null,
          
          // Progress tracking
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },
          
          // UI states
          showingCompletionScreen: false,
          fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <NirvighnamSceneContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

const NirvighnamSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('NirvighnamSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // GameCoach removed - using direct navigation
  const hideCoach = () => {};
  const clearManualCloseTracking = () => {};

  const { resetScene } = useSceneReset(
    sceneActions, 
    'cave-of-secrets', 
    'nirvighnam-kurumedeva', 
    getSceneResetConfig('nirvighnam-kurumedeva')
  );
  
  // State management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  // NEW: Celebration and modal states
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(null); // 'nirvighnam' or 'kurumedeva'

  // --- Fog Crystal Control (sequential clearing) ---
const [activeCrystal, setActiveCrystal] = useState(null);
const [fogProgress, setFogProgress] = useState({});  // Tracks clicks per crystal
const [hintMessage, setHintMessage] = useState(null);

  // ========== 🛡️ CLICK PROTECTION STATE ==========
const [clickLocked, setClickLocked] = useState(false);
const lastClickTime = useRef(0);
const activeTouches = useRef(0);
const isProcessingClick = useRef(false);

// Discovery overlay states
const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // First discovery
const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // Second discovery

// Resume popup
const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');
const resumePopupTimeoutRef = useRef(null);

// Reload handler
const reloadHandledRef = useRef(false);


  

  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Show first modal on mount
/*useEffect(() => {
  if (sceneState.phase === 'STORY_INTRO' && !showStoryModal) {
    setTimeout(() => {
      setShowStoryModal('nirvighnam');
    }, 500);
  }
}, [sceneState.phase]);*/

// Auto-hide hint message after 2 seconds
useEffect(() => {
  if (hintMessage) {
    const timer = setTimeout(() => setHintMessage(null), 2000);
    return () => clearTimeout(timer);
  }
}, [hintMessage]);

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const playAudio = (audioPath, volume = 1.0) => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (error) {
    console.warn('Audio failed:', error);
  }
};

const playSyllable = (syllable) => {
  const map = {
    'nir': 'nirvighnam-nir',
    'vigh': 'nirvighnam-vigh',
    'nam': 'nirvighnam-nam',
    'kuru': 'kurume-kuru',
    'me': 'kurume-me',
    'de': 'deva-de',
    'va': 'deva-va'
  };
  playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
};

  // Clear local storage function
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all saved progress? This cannot be undone.')) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('gameState_') ||
            key.includes('activeProfileId') ||
            key.includes('profiles_') ||
            key.includes('temp_session_') ||
            key.includes('scene_progress_') ||
            key.includes('user_progress_')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('🗑️ Local storage cleared:', keysToRemove.length, 'keys removed');
        alert('Local storage cleared! The page will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        alert('Error clearing local storage. Check console for details.');
      }
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ==================== RESTORE FOG GAME STATE ON RELOAD ====================
useEffect(() => {
  if (isReload && sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE) {
    console.log('🔄 Restoring fog game state on reload');
    
    // ✅ Restore active crystal
    if (sceneState.selectedCrystal) {
      console.log('📌 Restoring active crystal:', sceneState.selectedCrystal);
      setActiveCrystal(sceneState.selectedCrystal);
    }
    
    // ✅ Restore fog progress if you saved it (optional)
    if (sceneState.fogClickProgress) {
      console.log('📌 Restoring fog progress:', sceneState.fogClickProgress);
      setFogProgress(sceneState.fogClickProgress);
    }
  }
}, [isReload, sceneState.phase, sceneState.selectedCrystal]);

  useEffect(() => {
  if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
    return;
  }

  console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
  reloadHandledRef.current = true;

  // ============================================
  // 1. DISCOVERY: NIRVIGHNAM (Obstacle Remover)
  // ============================================
  if (sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) {
    console.log('📌 Reload: Nirvighnam Discovery');
    
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        nirvighnam: { learned: true, scene: 3 }
      }
    });
    
    // Force the card to appear
    setTimeout(() => setShowDiscoveryFlip1(true), 500);
    return;
  }

  // ============================================
  // 2. DISCOVERY: KURUMEDEVA (Solution Builder)
  // ============================================
  if (sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING) {
    console.log('📌 Reload: Kurumedeva Discovery');
    
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        nirvighnam: { learned: true, scene: 3 },
        kurumedeva: { learned: true, scene: 3 }
      }
    });
    
    // Force the card to appear
    setTimeout(() => setShowDiscoveryFlip2(true), 500);
    return;
  }

  // ============================================
  // 3. GAME 1: CRYSTAL FOG (Check Completion)
  // ============================================

  
  // ✅ Check if complete
  if (sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE) {
  console.log('📌 Reload: Crystal Fog phase');
  
  const clearedCount = sceneState.clearedFogs?.length || 0;
  
  // ✅ Check if complete
  if (clearedCount >= 3) {
    console.log('📌 All fog cleared, transitioning to learning phase');
    sceneActions.updateState({
      phase: CAVE_PHASES.NIRVIGHNAM_LEARNING,
      crystalFogCompleted: true
    });
    return;
  }
  
  // ✅ Check what stage user is at
  const selectedCrystal = sceneState.selectedCrystal;
  
  if (selectedCrystal) {
    // Mid-fog-clearing
    setResumeMessage(`Keep clicking the fog to clear it!`);
  } else {
    // Need to pick crystal
    setResumeMessage(`Click a crystal to start! (${clearedCount}/3 cleared)`);
  }
  
  setShowResumePopup(true);
  
  if (resumePopupTimeoutRef.current) {
    clearTimeout(resumePopupTimeoutRef.current);
  }
  resumePopupTimeoutRef.current = setTimeout(() => {
    setShowResumePopup(false);
  }, 5000);
  
  return;
}

  // ============================================
  // 4. GAME 2: BRIDGE BUILDING (Check Completion)
  // ============================================
  if (sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE) {
    const bridgeCount = sceneState.bridgeRocks?.length || 0;
    
    // ✅ If complete, force transition to Discovery
    if (bridgeCount >= 3) {
      console.log('📌 Bridge complete on reload, triggering discovery');
      
      sceneActions.updateState({
        bridgeCompleted: true,
        phase: CAVE_PHASES.KURUME_DEVA_LEARNING
      });

      setTimeout(() => setShowDiscoveryFlip2(true), 500);
      return;
    }

    // Resume popup
    setResumeMessage(`Build the bridge! ${bridgeCount}/3 rocks placed!`);
    setShowResumePopup(true);
    if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
    return;
  }

  // ============================================
  // 5. DOORS & COMPLETION
  // ============================================
  
  // Door 1 Active
  if (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE) {
    const placed = sceneState.door1SyllablesPlaced?.length || 0;
    if (placed < 3) {
      setResumeMessage(`Spell Nirvighnam! ${placed}/3 syllables placed!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
    }
    return;
  }

  // Scene Complete
  if (sceneState.phase === CAVE_PHASES.COMPLETE) {
    sceneActions.updateState({
      learnedWords: {
        nirvighnam: { learned: true, scene: 3 },
        kurumedeva: { learned: true, scene: 3 }
      }
    });
    if (!sceneState.showingCompletionScreen) {
      setTimeout(() => setShowSceneCompletion(true), 500);
    }
    return;
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown]);

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      explicitMessage: 'Drag Nir-vigh-nam syllables to spell Nirvighnam!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed;
      }
    },
    {
      id: 'crystal-selection-hint',
  message: 'Choose a crystal tool to clear the matching fog!',
  explicitMessage: 'Click a crystal, then erase the same-colored fog area!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE &&
               !sceneState?.selectedCrystal;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the Sanskrit syllables for Kurume Deva!',
      explicitMessage: 'Drag Ku-ru-me-de-va syllables to spell Kurume Deva!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed;
      }
    },
    {
      id: 'bridge-building-hint',
       message: 'Click your rocks to place them on the bridge!',
  explicitMessage: 'Click each rock to automatically place it on the bridge path!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE &&
               sceneState?.bridgeRocks?.length < 3;
      }
    }
  ];

  // RELOAD LOGIC
  /*useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 NIRVIGHNAM RELOAD: Starting reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase
    });

    // Check for Play Again flag
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    if (playAgainRequested === 'true') {
      console.log('🔄 NIRVIGHNAM RELOAD: Play Again detected');
      localStorage.removeItem(playAgainKey);
      sceneActions.updateState({ 
        showingCompletionScreen: false,
        currentPopup: null,
        completed: false,
        phase: CAVE_PHASES.DOOR1_ACTIVE
      });
      return;
    }
    
    setTimeout(() => {
      
      // Handle animated text states
      if (sceneState.showObstacleText || 
          (sceneState.learnedWords?.nirvighnam?.learned && 
           sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING)) {
        console.log('🔄 NIRVIGHNAM: Skipping to Door 2');
        sceneActions.updateState({
          showObstacleText: false,
          phase: CAVE_PHASES.DOOR2_ACTIVE
        });
        return;
      }

      if (sceneState.showDivineHelpText || 
          (sceneState.learnedWords?.kurumedeva?.learned && 
           sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING)) {
        console.log('🔄 NIRVIGHNAM: Skipping to fireworks');
        sceneActions.updateState({
          showDivineHelpText: false
        });
        setTimeout(() => showFinalCelebration(), 500);
        return;
      }

      // Handle popup states
      if (sceneState.currentPopup === 'final_fireworks') {
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        if (playAgainRequested === 'true') {
          console.log('🚫 NIRVIGHNAM FIREWORKS BLOCKED');
          localStorage.removeItem(playAgainKey);
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: CAVE_PHASES.DOOR1_ACTIVE,
            stars: 0
          });
          return;
        }
        
        console.log('🎆 NIRVIGHNAM: Resuming fireworks');
        setShowSparkle('final-fireworks');
        sceneActions.updateState({
          phase: CAVE_PHASES.COMPLETE,
          stars: 8,
          completed: true,
          progress: {
            percentage: 100,
            starsEarned: 8,
            completed: true
          }
        });
        return;
      }

      // Handle incomplete door completions
      if (sceneState.door2Completed && !sceneState.bridgeBuildingStarted) {
        console.log('🔄 NIRVIGHNAM: Resuming bridge intro');
        sceneActions.updateState({
          phase: CAVE_PHASES.BRIDGE_BUILDING_INTRO,
          bridgeBuildingStarted: true
        });
        return;
      }

      if (sceneState.door1Completed && !sceneState.crystalFogStarted) {
        console.log('🔄 NIRVIGHNAM: Resuming crystal fog intro');
        sceneActions.updateState({
          phase: CAVE_PHASES.CRYSTAL_FOG_INTRO
        });
        return;
      }

      // Handle completion screen
      if (sceneState.showingCompletionScreen) {
        if (playAgainRequested === 'true') {
          console.log('🚫 NIRVIGHNAM COMPLETION BLOCKED');
          localStorage.removeItem(playAgainKey);
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: CAVE_PHASES.DOOR1_ACTIVE,
            stars: 0
          });
          return;
        }
        
        console.log('🔄 NIRVIGHNAM: Resuming completion screen');
        setShowSceneCompletion(true);
        return;
      }
      
    }, 500);
    
  }, [isReload]);*/

  // Door 1 handlers
  const handleDoor1SyllablePlaced = (syllable) => {
 if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }

    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Nir';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door1SyllablesPlaced: newSyllablesPlaced,
        door1CurrentStep: newStep
      });
      
if (newStep >= 3) {
  // ❌ REMOVED: Don't auto-trigger door completion
  // The DoorComponent will call onDoorComplete when button is clicked
  console.log('✅ All syllables placed - waiting for Start Challenge button');
}
    } else {
      console.log(`Expected: ${expectedSyllable}, got: ${syllable}`);
    }
  };

  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed');
    
    setShowSparkle('door1-completing');
    
    const doorElement = document.querySelector('.nirvighnam-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.CRYSTAL_FOG_ACTIVE,
      crystalFogStarted: true
    });

    setTimeout(() => {
      setShowSparkle(null);
    }, 3000);
  };

  // Door 2 handlers
  const handleDoor2SyllablePlaced = (syllable) => {
     if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ku';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
      
  if (newStep >= 4) {
  // ❌ REMOVED: Don't auto-trigger door completion
  // The DoorComponent will call onDoorComplete when button is clicked
  console.log('✅ All syllables placed - waiting for Start Challenge button');
}
    } else {
      console.log(`Expected: ${expectedSyllable}, got: ${syllable}`);
    }
  };

  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed');
    
    setShowSparkle('door2-completing');
    
    const doorElement = document.querySelector('.kurumedeva-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.BRIDGE_BUILDING_ACTIVE,
      bridgeBuildingStarted: true
    });

    setTimeout(() => {
      setShowSparkle(null);
    }, 3000);
  };

  const handleFogClick = (emotionId) => {
  if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
  }
  
  if (activeCrystal !== emotionId) {
    console.log(`🚫 Can't click fog - ${emotionId} not active`);
    return;
  }
  
  hideActiveHints();
  
  setFogProgress(prev => {
    const clicks = (prev[emotionId] || 0) + 1;
    console.log(`🌫️ Fog ${emotionId} clicked: ${clicks}/3`);
    
    // ✅ SAVE to sceneState for reload
    const newProgress = { ...prev, [emotionId]: clicks };
    sceneActions.updateState({
      fogClickProgress: newProgress
    });
    
    if (clicks >= 3) {
      handleFogClear(emotionId);
    }
    
    return newProgress;
  });
};

const handleCrystalSelect = (emotionId) => {
  console.log(`🔮 Crystal selected: ${emotionId}`);
  
  // 🛡️ If fog is being cleared for another crystal, block
  if (activeCrystal && activeCrystal !== emotionId) {
    setHintMessage("Finish clearing the other fog first! 🌫️✨");
    return;
  }
  
  // Set this as the active crystal and start its fog sequence
  setActiveCrystal(emotionId);
  
  sceneActions.updateState({
    selectedCrystal: emotionId
  });
};

const handleFogClear = (emotionId) => {
  console.log(`🌫️ Fog cleared: ${emotionId}`);
  
  // ✅ Unlock crystal - ready for next one
  setActiveCrystal(null);
  
  // ✅ NEW: Show celebration hint for next step
  /*const remainingFogs = 3 - (sceneState.clearedFogs?.length || 0) - 1;
  if (remainingFogs > 0) {
    setTimeout(() => {
      setHintMessage(`🎉 Great job! Now pick another crystal! (${remainingFogs} more to go!)`);
    }, 1500);
  }*/


  
  const newClearedFogs = [...(sceneState.clearedFogs || []), emotionId];
    const newCollectedRocks = [...(sceneState.collectedRocks || []), emotionId];
    const newProgress = (newClearedFogs.length / 3) * 100;
    
    setShowSparkle(`fog-${emotionId}-cleared`);
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      clearedFogs: newClearedFogs,
      collectedRocks: newCollectedRocks,
      emotionalProgress: newProgress,
      selectedCrystal: null
    });
    
    if (newClearedFogs.length >= 3) {
      console.log('All fog cleared!');
      safeSetTimeout(() => {
        handleCrystalFogComplete();
      }, 2000);
    }
  };

const handleCrystalFogComplete = () => {
  console.log('🔮 Crystal fog clearing completed!');
  
  sceneActions.updateState({
    crystalFogCompleted: true,
    phase: CAVE_PHASES.NIRVIGHNAM_LEARNING, // ✅ Set to Learning Phase
    progress: {
      ...sceneState.progress,
      percentage: 50,
      starsEarned: 3
    }
  });

  // ✅ Trigger Discovery Overlay immediately
  setTimeout(() => {
    setShowDiscoveryFlip1(true);
  }, 1500);
};

  const completeNirvighnamLearning = () => {
    if (sceneState.learnedWords?.nirvighnam?.learned) {
      console.log('🚫 Nirvighnam already learned, skipping');
      sceneActions.updateState({ phase: CAVE_PHASES.DOOR2_ACTIVE });
      return;
    }
    
    console.log('🌟 Nirvighnam symbol learned - FULL CELEBRATION');
    
    setShowCenteredSymbol('nirvighnam');
    
    setTimeout(() => {
      setShowCenteredSymbol(null);
      setShowSparkle('nirvighnam-to-sidebar');
      
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          nirvighnam: { learned: true, scene: 3 }
        }
      });
      
      setTimeout(() => {
        setShowSparkle(null);
        setCurrentMissionSymbol('nirvighnam');
        setShowPowerModal(true);
      }, 2000);
    }, 5000);
  };

  
 const handleBridgeRockClick = (rockId) => {
  if (showResumePopup) {
  setShowResumePopup(false);
  if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
}
  console.log(`🌉 Bridge rock clicked: ${rockId}`);
  
  hideActiveHints();

  const newBridgeRocks = [...(sceneState.bridgeRocks || []), rockId];
  
  // Big sparkle celebration
  setShowSparkle(`bridge-rock-${rockId}-placed`);
  setTimeout(() => setShowSparkle(null), 2000);
  
  sceneActions.updateState({
    bridgeRocks: newBridgeRocks,
    ganeshaCanCross: newBridgeRocks.length >= 3
  });
  
  if (newBridgeRocks.length >= 3) {
    console.log('✅ Bridge completed!');
    safeSetTimeout(() => {
      completeBridgeBuilding();
    }, 2000);
  }
};

const completeBridgeBuilding = () => {
  console.log('🌉 Bridge building completed!');
  
  sceneActions.updateState({
    bridgeCompleted: true,
    phase: CAVE_PHASES.KURUME_DEVA_LEARNING, // ✅ Set to Learning Phase
    showDivineHelpText: true
  });

  // ✅ Trigger Discovery Overlay immediately
  setTimeout(() => {
    setShowDiscoveryFlip2(true);
  }, 1500);
};

  const startKurumedevaLearning = () => {
    if (sceneState.learnedWords?.kurumedeva?.learned) {
      console.log('🚫 Kurume Deva already learned, skipping');
      showFinalCelebration();
      return;
    }
    
    console.log('🌟 Kurume Deva symbol learned - FULL CELEBRATION');
    
    setShowCenteredSymbol('kurumedeva');
    
    setTimeout(() => {
      setShowCenteredSymbol(null);
      setShowSparkle('kurumedeva-to-sidebar');
      
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          kurumedeva: { learned: true, scene: 3 }
        }
      });
      
      setTimeout(() => {
        setShowSparkle(null);
        setCurrentMissionSymbol('kurumedeva');
        setShowPowerModal(true);
      }, 2000);
    }, 5000);
  };

  // NEW: Power Modal Actions
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setCurrentRescueWord(currentMissionSymbol);
    setShowRescueModal(true);
  };

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentMissionSymbol === 'nirvighnam') {
    // Show second story modal before Door 2
    setShowStoryModal('kurumedeva');
  } else if (currentMissionSymbol === 'kurumedeva') {
    // Go to final celebration
    setTimeout(() => showFinalCelebration(), 500);
  }
};

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      nirvighnam: '🚪 Discover Kurume Deva',
      kurumedeva: '✨ Complete Chamber'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

const handleRescueComplete = (success) => {
  if (!success) return;
  
  setShowRescueModal(false);
  
  if (currentRescueWord === 'nirvighnam') {
    setTimeout(() => {
      setShowStoryModal('kurumedeva');  // ✅ Show second story modal
    }, 500);
  } else if (currentRescueWord === 'kurumedeva') {
    setTimeout(() => {
      showFinalCelebration();
    }, 500);
  }
  
  setCurrentRescueWord(null);
};

  const showFinalCelebration = () => {
    console.log('🎊 Starting final celebration');

    const sidebarElement = document.querySelector('.symbol-sidebar');
    if (sidebarElement) {
      sidebarElement.style.opacity = '0';
      sidebarElement.style.pointerEvents = 'none';
    }

    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_fireworks',
      phase: CAVE_PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });

    setShowSparkle('final-fireworks');
  };

  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  const handleHintShown = (level) => {
    console.log(`Hint level ${level} shown`);
    setHintUsed(true);
  };

  if (!sceneState) {
    return <div className="loading">Loading Obstacle Remover Chamber...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>
          <div className="pond-background" style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            backgroundImage: `url(${caveBackgroundDark})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>

            {/* ✅ OPENING SCREEN: Nirvighnam & Kurumedeva */}
{sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.welcomeShown && (() => {
  const theme = getZoneTheme(zoneId);
  const modal = getOpeningModal(zoneId, sceneId);
  return (
    <div className="game-modal-overlay" style={{
      '--modal-card-bg': theme.parentBg,
      '--modal-text-primary': theme.textPrimary,
      '--modal-btn-bg': theme.buttonActiveBg,
      '--modal-btn-shadow': theme.glowColor
    }}>
      <div className="game-modal-content">
        <div className="game-modal-character">
          <img src={ganeshaCharacterCave} alt="Ganesha Character" />
        </div>
        <div className="game-modal-card">
          <h1 className="game-modal-title">{modal?.title || 'Cross the Bridge'}</h1>
          <p className="game-modal-subtitle">{modal?.description || 'Clear a way and move forward.'}</p>
          <div className="game-modal-icons">
            <div className="game-modal-icon-item">
              <img src={nirvighnamSymbol} alt="Nirvighnam" />
              <span className="game-modal-icon-label">No Obstacles</span>
            </div>
            <div className="game-modal-icon-item">
              <img src={kurumedevaSymbol} alt="Kurumedeva" />
              <span className="game-modal-icon-label">Divine Help</span>
            </div>
          </div>
          <button className="game-modal-button" onClick={() => sceneActions.updateState({ welcomeShown: true })}>
            {modal?.buttonText || "Let's Explore"}
          </button>
        </div>
      </div>
    </div>
  );
})()}

{/* Phase Headers - Always Visible */}
{!showPowerModal && !showRescueModal && !showCenteredSymbol && !showStoryModal && (
  <>
    {sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed && (
      <div className="phase-header">
        🔤 SPELL NIRVIGHNAM! Click the syllables in order!
      </div>
    )}
    
{sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE && sceneState.clearedFogs?.length < 3 && (
  <div className="phase-header">
    🔮 CLEAR THE FOG! {sceneState.clearedFogs?.length || 0}/3 crystals clicked
  </div>
)}
    
    {sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed && (
      <div className="phase-header">
        🔤 SPELL KURUME DEVA! Click the syllables in order!
      </div>
    )}
    
    {sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE && sceneState.bridgeRocks?.length < 3 && (
      <div className="phase-header">
    🌉 BUILD THE BRIDGE! Click rocks to place them!
      </div>
    )}
  </>
)}

{/* Hint Banner - Fog game guidance */}
{hintMessage && !showPowerModal && !showRescueModal && !showStoryModal && !showCenteredSymbol && (
  <div
    style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #FFF9C4, #FFF59D)',
      border: '3px solid #FBC02D',
      borderRadius: '20px',
      padding: '12px 24px',
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#4b3d02',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 2000,
      animation: 'hintFadeInOut 2s ease-in-out',
      pointerEvents: 'none',
      textAlign: 'center',
      maxWidth: '400px'
    }}
  >
    {hintMessage}
  </div>
)}
            
            <button 
              className="clear-storage-button"
              onClick={clearLocalStorage}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              title="Clear all saved progress"
            >
              🗑️ Clear Storage
            </button>


            {/* Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent
                  key={`door1-${sceneState.door1CurrentStep}-${sceneState.door1Completed}-${sceneState.phase}`}
                  syllables={['Nir', 'vigh', 'nam']}
                    onSyllableAudio={playSyllable}  // ← ADD THIS

                  completedWord="Nirvighnam"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="nirvighnam-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="NIRVIGHNAM"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                  isResuming={isReload}
                  
                />
              </div>
            )}

            {showSparkle === 'door1-completing' && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ffd700"
                  size={12}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Crystal Fog Clearing Game */}
            {(sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO || 
              sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE || 
              sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_COMPLETE ||
              sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) && 
             !showCenteredSymbol && 
             !showPowerModal && 
             !showRescueModal && 
             !showStoryModal && 
             !showSceneCompletion && (
<div 
                className="crystal-fog-area" 
                id="crystal-fog-area"
                onTouchStart={(e) => {
                  activeTouches.current = e.touches.length;
                  if (e.touches.length > 1) {
                    console.log('🚫 MULTI-TOUCH BLOCKED in Crystal Fog');
                    e.preventDefault();
                  }
                }}
                onTouchEnd={() => {
                  activeTouches.current = 0;
                }}
              >                
    <div className="crystal-tools-area">
                  {EMOTION_PAIRS.map((pair) => {
                    const isSelected = sceneState.selectedCrystal === pair.id;
                    const isUsed = sceneState.clearedFogs?.includes(pair.id);
                    const isLocked = activeCrystal && activeCrystal !== pair.id;  // ✅ ADD THIS LINE
                    
                    if (isUsed) return null;
                    
                    return (
                   <div 
                        key={pair.id} 
                        className={`crystal-tool crystal-${pair.id} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCrystalSelect(pair.id)}
                        style={{
                          opacity: isLocked ? 0.4 : 1,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          transition: 'opacity 0.3s ease',
                          animation: !isLocked && !isUsed && !activeCrystal ? 'crystalPulse 2s ease-in-out infinite' : 'none',  // ✅ ADD THIS
                          filter: !isLocked && !isUsed && !activeCrystal ? 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' : 'none'  // ✅ ADD THIS
                        }}
                      >
                    
                        <img 
                          src={pair.crystal}
                          alt={`${pair.emotion} crystal`}
                          style={{ 
                            width: '60px', 
                            height: '60px',
                            cursor: 'pointer',
                            filter: isSelected ? 'brightness(1.3) drop-shadow(0 0 10px #FFD700)' : 'brightness(1)'
                          }}
                        />
                        <div className="crystal-label">
                          {pair.emotion.charAt(0).toUpperCase() + pair.emotion.slice(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>

    <div className="fog-erasing-areas">
                  {EMOTION_PAIRS.map((pair) => {
                    const isCleared = sceneState.clearedFogs?.includes(pair.id);
                    const isThisCrystalActive = activeCrystal === pair.id;
                    const currentProgress = fogProgress[pair.id] || 0;
                    
                    return (
                      <div 
                        key={pair.id} 
                        className={`fog-erasing-container fog-${pair.id}`}
                        onClick={() => isThisCrystalActive && handleFogClick(pair.id)}
                        style={{
                          cursor: isThisCrystalActive ? 'pointer' : 'default',
                          border: isThisCrystalActive ? '4px solid rgba(255, 215, 0, 0.6)' : 'none',
                          borderRadius: '15px',
                          padding: '10px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {!isCleared && (
                          <SimpleFogClicker
                            emotionId={pair.id}
                            fogImage={pair.fog}
                            rockImage={pair.rock}
                            onComplete={handleFogClear}
                            isActive={isThisCrystalActive}
                            fogProgress={currentProgress}
                          />
                        )}
                        
                        {isCleared && (
                          <div className="completed-fog-area">
                            <div className="revealed-rock-display">
                              <img 
                                src={pair.rock}
                                alt={`${pair.emotion} rock revealed`}
                                style={{ 
                                  width: '80px', 
                                  height: 'auto',
                                  borderRadius: '10px',
                                  animation: 'rockReveal 2s ease-out'
                                }}
                              />
                              <div className="rock-blessing">
                                ✨ {pair.emotion} overcome! ✨
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  key={`door2-${sceneState.door2CurrentStep}-${sceneState.door2Completed}-${sceneState.phase}`}
                  syllables={['Kuru', 'me', 'de', 'va']}
                    onSyllableAudio={playSyllable}  // ← ADD THIS

                  completedWord="Kurume Deva"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="kurumedeva-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle="KURUME DEVA"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {showSparkle === 'door2-completing' && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ff8c42"
                  size={12}
                  duration={2500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

{/* Animated Texts 
{sceneState.showObstacleText && (
  <div className="obstacle-text" style={{
    position: 'absolute',
    top: '65%',
    left: '30%',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#9C27B0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    animation: 'textGlow 3s ease-out forwards',
    zIndex: 15
  }}>
    Without Obstacles
  </div>
)}

{sceneState.showDivineHelpText && (
  <div className="divine-help-text" style={{
    position: 'absolute',
    top: '65%',
    left: '55%',
    transform: 'translateX(-50%)',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    animation: 'textGrow 2s ease-out forwards',
    zIndex: 15
  }}>
    Divine Help
  </div>
)}*/}

{showSparkle === 'nirvighnam-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '30%',
    left: '30%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#9C27B0"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{showSparkle === 'kurumedeva-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#FFD700"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

            {/* Bridge Building Game */}
         {/* Bridge Building Game */}
            {(sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_INTRO || 
              sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE || 
              sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_COMPLETE ||
              sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING ||
              sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
              sceneState.phase === CAVE_PHASES.COMPLETE) && 
             !showCenteredSymbol && 
             !showPowerModal && 
             !showRescueModal && 
             !showStoryModal && 
             !showSceneCompletion && (
              
<div 
                className="bridge-building-area" 
                id="bridge-building-area"
                onTouchStart={(e) => {
                  activeTouches.current = e.touches.length;
                  if (e.touches.length > 1) {
                    console.log('🚫 MULTI-TOUCH BLOCKED in Bridge Building');
                    e.preventDefault();
                  }
                }}
                onTouchEnd={() => {
                  activeTouches.current = 0;
                }}
              >                
                <div className="simple-gap">
                  <div className="gap-line"></div>
                </div>

<div className="bridge-rocks-inventory">
  <div className="inventory-rocks">
    {sceneState.collectedRocks?.map((rockId, index) => {
      const isUsed = sceneState.bridgeRocks?.includes(rockId);
      const pair = EMOTION_PAIRS.find(p => p.id === rockId);
      
      // ✅ NEW: Only current rock is clickable (sequential)
      const currentBridgeCount = sceneState.bridgeRocks?.length || 0;
      const isCurrentRock = index === currentBridgeCount;
      const isClickable = !isUsed && isCurrentRock;
      
      return (
        <div key={rockId} className={`bridge-rock-inventory bridge-rock-${rockId}`}>
          <SimpleRockPlacer
            rockId={rockId}
            rockImage={pair.rock}
            emotion={pair.emotion}
            onPlace={handleBridgeRockClick}
            isUsed={isUsed}
            isClickable={isClickable}  // ✅ NEW: Pass clickable state
          />
        </div>
      );
    })}
  </div>
</div>

          
                {/* Bridge Counter */}
                <div className="bridge-counter" style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '25px',
                  padding: '8px 16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '180px',
                  height: '40px'
                }}>
                  <div className="counter-icon" style={{ width: '24px', height: '24px' }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, #8B4513, #DAA520)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      🪨
                    </div>
                  </div>
                  
                  <div className="counter-progress" style={{
                    flex: 1,
                    height: '6px',
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      className="counter-progress-fill"
                      style={{
                        width: `${((sceneState.bridgeRocks?.length || 0) / 3) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #8B4513, #DAA520)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  
                  <div className="counter-display" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {sceneState.bridgeRocks?.length || 0}/3
                  </div>
                </div>

                {/* Crystal Fog Counter */}
                {(sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO || 
                  sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE || 
                  sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_COMPLETE ||
                  sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) &&  !showCenteredSymbol && !showPowerModal && 
                  !showRescueModal && !showStoryModal && !showSceneCompletion && !sceneState.learnedWords?.nirvighnam?.learned && (

                  
                  <div className="crystal-fog-counter" style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '25px',
                    padding: '8px 16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '180px',
                    height: '40px'
                  }}>
                    <div className="counter-icon" style={{ width: '24px', height: '24px' }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, #9C27B0, #E1BEE7)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        🔮
                      </div>
                    </div>
                    
                    <div className="counter-progress" style={{
                      flex: 1,
                      height: '6px',
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        className="counter-progress-fill"
                        style={{
                          width: `${((sceneState.clearedFogs?.length || 0) / 3) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(to right, #9C27B0, #E1BEE7)',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                    
                    <div className="counter-display" style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {sceneState.clearedFogs?.length || 0}/3
                    </div>
                  </div>
                )}

                {sceneState.bridgeRocks && sceneState.bridgeRocks.map((rockId, displayIndex) => {
                  const pair = EMOTION_PAIRS.find(p => p.id === rockId);
                  if (!pair) return null;
                  
                  const position = getBridgeRockPosition(displayIndex);
                  
                  return (
                    <div 
                      key={`bridge-rock-placed-${rockId}-${displayIndex}`}
                      className={`bridge-rock-placed bridge-rock-${displayIndex + 1}`}
                      style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: '90px',
                        height: 'auto',
                        zIndex: 20 + displayIndex,
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        filter: 'brightness(1.1)'
                      }}
                    >
                      <img 
                        src={pair.rock}
                        alt={`Bridge ${pair.emotion} rock`}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          borderRadius: '12px'
                        }}
                      />
                    </div>
                  );
                })}

              </div>
            )}

            {/* ========== STORY MODAL ========== 
{showStoryModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200
  }}>
        <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 199,
        pointerEvents: 'all'
      }}
      onClick={(e) => {
        e.stopPropagation();
        console.log('🛡️ Click blocked by story modal shield');
      }}
    />
    <div style={{
      background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 100%)',
      borderRadius: '25px',
      padding: '35px 40px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
      border: '4px solid #8B4513',
      animation: 'modalAppear 0.5s ease-out',
       position: 'relative',  // ✅ ADD THIS
      zIndex: 201  // ✅ ADD THIS
    }}>
      {/* Ganesha Icon 
      <img 
        src={STORY_MODALS[showStoryModal].icon}
        alt="Ganesha"
        style={{
          width: '80px',
          height: '80px',
          marginBottom: '15px',
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
        }}
      />
      
      {/* Speech Bubble 
      <div style={{
        background: '#FFF8DC',
        border: '3px solid #FFD700',
        borderRadius: '18px',
        padding: '12px 20px',
        marginBottom: '20px',
        fontSize: '16px',
        color: '#8B4513',
        fontWeight: 'bold'
      }}>
        {STORY_MODALS[showStoryModal].speech}
      </div>
      
      {/* Title 
      <h1 style={{
        color: '#8B4513',
        fontSize: '28px',
        margin: '15px 0',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}>
        {STORY_MODALS[showStoryModal].title}
      </h1>
      
      {/* Subtitle 
      <h2 style={{
        color: '#D2691E',
        fontSize: '20px',
        margin: '12px 0'
      }}>
        {STORY_MODALS[showStoryModal].subtitle}
      </h2>
      
      {/* Description 
      <p style={{
        color: '#5D4E37',
        fontSize: '16px',
        lineHeight: '1.5',
        margin: '15px 0 30px 0'
      }}>
        {STORY_MODALS[showStoryModal].description}
      </p>
      
      {/* Start Button 
      <button
        onClick={() => {
          setShowStoryModal(null);
          // Continue to appropriate phase
          if (showStoryModal === 'nirvighnam') {
            sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });
          } else {
            sceneActions.updateState({ phase: CAVE_PHASES.DOOR2_ACTIVE });
          }
        }}
        style={{
          background: STORY_MODALS[showStoryModal].buttonColor,
          color: 'white',
          border: 'none',
          padding: '15px 40px',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {STORY_MODALS[showStoryModal].buttonText}
      </button>
    </div>
  </div>
)}

{/* ========== CENTERED SYMBOL CELEBRATION (5 SECONDS) ========== 
{showCenteredSymbol && (
  <>
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 199,
      animation: 'fadeIn 0.3s ease-out',
      pointerEvents: 'all'  // ✅ ADD THIS - blocks all clicks!
    }} 
    onClick={(e) => {
      e.stopPropagation();
      console.log('🛡️ Click blocked during symbol celebration');
    }}
    />
    
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 200,
      textAlign: 'center',
      animation: 'symbolAppear 0.5s ease-out'
    }}>
      <img 
        src={powerConfig[showCenteredSymbol]?.image}
        alt={showCenteredSymbol}
        style={{
          width: '180px',
          height: '180px',
          filter: `drop-shadow(0 0 40px ${powerConfig[showCenteredSymbol]?.color})`,
          animation: 'symbolGlow 2s ease-in-out infinite alternate',
          marginBottom: '25px'
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        pointerEvents: 'none'
      }}>
        <SparkleAnimation
          type="glitter"
          count={30}
          color={powerConfig[showCenteredSymbol]?.color}
          size={12}
          duration={3000}
          fadeOut={true}
          area="full"
        />
      </div>
      
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: `3px 3px 6px ${powerConfig[showCenteredSymbol]?.color}`,
        animation: 'textPulse 1.5s ease-in-out infinite',
        letterSpacing: '2px'
      }}>
        {powerConfig[showCenteredSymbol]?.name}
      </div>
    </div>
  </>
)}

{/* ========== POWER MODAL (CHOICE SCREEN) ========== 
{showPowerModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500
  }}>
        {/* Blocker 
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 499,
        pointerEvents: 'all'
      }}
      onClick={(e) => e.stopPropagation()}
    />
    <div style={{
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      borderRadius: '25px',
      padding: '40px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    position: 'relative',  // ✅ ADD THIS
      zIndex: 501  // ✅ ADD THIS
    }}>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#1565C0', 
        marginBottom: '25px' 
      }}>
        {powerConfig[currentMissionSymbol]?.name} Unlocked!
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '15px',
            lineHeight: '1.6'
          }}>
            You can now use this power to help animals in need!
          </div>
          <div style={{
            fontSize: '14px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            Choose your next action:
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px', 
          alignItems: 'center' 
        }}>
          <img 
            src={powerConfig[currentMissionSymbol]?.image}
            alt="power symbol"
            style={{
              width: '100px',
              height: '100px',
              filter: `drop-shadow(0 0 20px ${powerConfig[currentMissionSymbol]?.color})`,
              animation: 'powerPulse 2s ease-in-out infinite',
              marginBottom: '10px'
            }}
          />

          {/* ⭐ NEW: Play Again button 
<button 
  onClick={() => {
    console.log(`🔄 Play Again: Restarting ${currentMissionSymbol} game`);
    setShowPowerModal(false);
    setShowSparkle(null);
    setShowCenteredSymbol(null);
    
    // Reset to the appropriate phase and game for the current symbol
if (currentMissionSymbol === 'nirvighnam') {
  // Reset Crystal Fog Clearing Game
  setActiveCrystal(null);  // ⭐ CRITICAL: Reset local state
  setFogProgress({});  // ⭐ CRITICAL: Reset fog progress if it exists
  
  sceneActions.updateState({ 
    phase: CAVE_PHASES.CRYSTAL_FOG_ACTIVE,
    crystalFogStarted: true,
    selectedCrystal: null,
    clearedFogs: [],
    collectedRocks: [],
    crystalFogCompleted: false,
    emotionalProgress: 0,
    learnedWords: {
      ...sceneState.learnedWords,
      nirvighnam: { learned: false, scene: 3 }
    },
    discoveredSymbols: {
      ...sceneState.discoveredSymbols,
      nirvighnam: false
    },
    currentFocus: 'crystal-fog'
  });

  
} else if (currentMissionSymbol === 'kurumedeva') {
  // Reset Bridge Building Game
  sceneActions.updateState({ 
    phase: CAVE_PHASES.BRIDGE_BUILDING_ACTIVE,
    bridgeBuildingStarted: true,
    bridgeRocks: [],
    bridgeStability: 0,
    bridgeCompleted: false,
    ganeshaCanCross: false,
    learnedWords: {
      ...sceneState.learnedWords,
      kurumedeva: { learned: false, scene: 3 }
    },
    discoveredSymbols: {  // ⭐ CRITICAL: Reset discovered status
      ...sceneState.discoveredSymbols,
      kurumedeva: false
    },
    currentFocus: 'bridge-building'
  });
}
  }}
  style={{
    background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(156,39,176,0.4)',
    width: '100%',
    transition: 'transform 0.2s ease',
    marginBottom: '10px'
  }}
  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
>
  🔄 Play Again
</button>
          
          <button 
            onClick={handleSaveAnimal}
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
🐾 Save an Animal          </button>
          
          <button 
            onClick={handleContinueLearning}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(78,205,196,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {getNextDiscoveryText(currentMissionSymbol)}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ========== RESCUE MODAL ========== */}
<RescueModal
  key={currentRescueWord}
  show={showRescueModal}
  wordData={currentRescueWord ? RESCUE_CONFIGS[currentRescueWord] : null}
  onComplete={handleRescueComplete}
  profileName={profileName}
/>

            {/* Symbol Sidebar */}
            <div style={{ filter: 'none' }}>
              <SymbolSidebar
                unlockedSymbols={{
                  vakratunda: sceneState.learnedWords?.vakratunda?.learned || false,
                  mahakaya: sceneState.learnedWords?.mahakaya?.learned || false,
                  suryakoti: sceneState.learnedWords?.suryakoti?.learned || false,
                  samaprabha: sceneState.learnedWords?.samaprabha?.learned || false,
                  nirvighnam: sceneState.learnedWords?.nirvighnam?.learned || false,
                  kurumedeva: sceneState.learnedWords?.kurumedeva?.learned || false,
                  sarvakaryeshu: false,
                  sarvada: false
                }}
                onSymbolClick={(symbolId) => {
                  console.log(`Symbol clicked: ${symbolId}`);
                }}
              />
            </div>

            <style>{`
              @keyframes confettiFall {
                to {
                  transform: translateY(100vh) rotate(720deg);
                }
              }
              
              @keyframes rockReveal {
                0% {
                  opacity: 0;
                  transform: scale(0.5) rotate(-45deg);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) rotate(0deg);
                }
              }

              @keyframes textGlow {
                0% {
                  opacity: 0;
                  transform: scale(0.8) rotateY(-20deg);
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                }
                50% {
                  opacity: 1;
                  transform: scale(1.1) rotateY(0deg);
                  text-shadow: 0 0 20px rgba(156, 39, 176, 0.8), 2px 2px 4px rgba(0,0,0,0.7);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) rotateY(0deg);
                  text-shadow: 0 0 10px rgba(156, 39, 176, 0.4), 2px 2px 4px rgba(0,0,0,0.7);
                }
              }

              @keyframes textGrow {
                0% {
                  opacity: 0;
                  transform: translateX(-50%) scale(0.5);
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                }
                50% {
                  opacity: 1;
                  transform: translateX(-50%) scale(1.2);
                  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.7);
                }
                100% {
                  opacity: 1;
                  transform: translateX(-50%) scale(1);
                  text-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 2px 2px 4px rgba(0,0,0,0.7);
                }
              }

              @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }

              @keyframes symbolAppear {
                0% { 
                  transform: translate(-50%, -50%) scale(0);
                  opacity: 0;
                }
                100% { 
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 1;
                }
              }

              @keyframes symbolGlow {
                0% { 
                  filter: drop-shadow(0 0 30px currentColor) brightness(1);
                  transform: scale(1);
                }
                100% { 
                  filter: drop-shadow(0 0 60px currentColor) brightness(1.4);
                  transform: scale(1.05);
                }
              }

              @keyframes textPulse {
                0%, 100% { 
                  opacity: 1;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.8;
                  transform: scale(1.1);
                }
              }

              @keyframes powerPulse {
                0%, 100% { 
                  transform: scale(1);
                }
                50% { 
                  transform: scale(1.08);
                }
              }

              @keyframes bounce {
  0%, 100% { 
    transform: translateX(-50%) translateY(0); 
  }
  50% { 
    transform: translateX(-50%) translateY(-8px); 
  }
}

@keyframes bounceIn {
  0% { 
    transform: translate(-50%, -50%) scale(0) rotate(-180deg); 
    opacity: 0;
  }
  60% { 
    transform: translate(-50%, -50%) scale(1.3) rotate(10deg); 
    opacity: 1;
  }
  100% { 
    transform: translate(-50%, -50%) scale(1) rotate(0deg); 
    opacity: 1;
  }
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
  @keyframes hintFadeInOut {
                0% { 
                  opacity: 0; 
                  transform: translate(-50%, -20px) scale(0.9); 
                }
                10% { 
                  opacity: 1; 
                  transform: translate(-50%, 0) scale(1.05); 
                }
                15% {
                  transform: translate(-50%, 0) scale(1);
                }
                85% { 
                  opacity: 1; 
                  transform: translate(-50%, 0) scale(1); 
                }
                100% { 
                  opacity: 0; 
                  transform: translate(-50%, -20px) scale(0.9); 
                }
              }
                @keyframes crystalPulse {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1) drop-shadow(0 0 5px rgba(255,215,0,0.3));
  }
  50% { 
    transform: scale(1.1);
    filter: brightness(1.3) drop-shadow(0 0 15px rgba(255,215,0,0.8));
  }
}
            `}</style>
          

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 Nirvighnam fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'nirvighnam-kurumedeva', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { nirvighnam: true, kurumedeva: true },
                      learnedWords: sceneState.learnedWords || {},
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ NIRVIGHNAM: Completion saved');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* ==================== DISCOVERY 1: NIRVIGHNAM ==================== */}
{showDiscoveryFlip1 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="Nirvighnam Revealed!"
    celebrationText={""Clear the Path…"\n\nYou cleared the fog that was blocking the way! Nirvighnam means 'No Obstacles'—you now have the magic to clear your mind."}
    celebrationImage={rockAnger} // or fogAnger
    
    // STAGE 2: Power Reveal
    powerTitle="Obstacle Remover Unlocked!"
    powerText="Don't let little worries cover your bright light. Use this power to clear the way and focus on peace, love, and joy!"
    powerIcon={nirvighnamSymbol}
    
    buttonText="Clear the Way!"
    onComplete={() => {
      console.log("Discovery 1 complete!");
      setShowDiscoveryFlip1(false);
      
      // Move to Door 2
      sceneActions.updateState({ 
        phase: CAVE_PHASES.DOOR2_ACTIVE,
        learnedWords: {
          ...sceneState.learnedWords,
          nirvighnam: { learned: true, scene: 3 }
        }
      });
    }}
    showSparkles={true}
  />
)}

{/* ==================== DISCOVERY 2: KURUMEDEVA ==================== */}
{showDiscoveryFlip2 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="Kurumedeva Revealed!"
    celebrationText={""The Builder's Power…"\n\nYou built the bridge! Kurumedeva means 'Grant Me This Blessing'—a magic that helps you build solutions and ask for help when you need it."}
    celebrationImage={rockSad} // or bridge image
    
    // STAGE 2: Power Reveal
    powerTitle="Solution Builder Unlocked!"
    powerText="When you find a gap, don't stop! Use your Builder's Power to find the right tools—or ask for help—and cross any problem."
    powerIcon={kurumedevaSymbol}
    
    buttonText="Start Building!"
    onComplete={() => {
      console.log("Discovery 2 complete!");
      setShowDiscoveryFlip2(false);
      
      // Complete Scene
      sceneActions.updateState({ 
        phase: CAVE_PHASES.COMPLETE,
        completed: true,
        learnedWords: {
          nirvighnam: { learned: true, scene: 3 },
          kurumedeva: { learned: true, scene: 3 }
        }
      });
        setShowSparkle('final-fireworks');
    }}
    showSparkles={true}
  />
)}

{/* ==================== RESUME POPUP ==================== */}
{showResumePopup && (
  <div style={{
    position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, background: 'linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)',
    color: 'white', padding: '20px 40px', borderRadius: '15px',
    fontFamily: "'Baloo 2', cursive", fontSize: '1.4rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)', border: '3px solid #FFD700',
    textAlign: 'center', animation: 'slideDown 0.3s ease'
  }}>
    {resumeMessage}
  </div>
)}

{sceneState.welcomeShown && !showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Obstacle Remover Chamber - Scene 3"
              sceneNumber={3}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva']}
              containerType="journal"
              containerImage={meaningJournal}
              meaningCards={{
                vakratunda: { sanskrit: "वक्रतुण्ड", meaning: "Curved Trunk" },
                mahakaya: { sanskrit: "महाकाय", meaning: "Great Body" },
                suryakoti: { sanskrit: "सूर्यकोटि", meaning: "Million Suns" },
                samaprabha: { sanskrit: "समप्रभ", meaning: "Equal Radiance" },
                nirvighnam: { sanskrit: "निर्विघ्नम्", meaning: "Without Obstacles" },
                kurumedeva: { sanskrit: "कुरुमे देव", meaning: "Please Bless" }
              }}
              appImages={{
                vakratunda: appVakratunda,
                mahakaya: appMahakaya,
                suryakoti: appSuryakoti,
                samaprabha: appSamaprabha,
                nirvighnam: appNirvighnam,
                kurumedeva: appKurumedeva
              }}
              nextSceneName="Divine Tasks Chamber"
              sceneId="nirvighnam-kurumedeva"
              completionData={{
                stars: 8,
                symbols: {},
                sanskritWords: { nirvighnam: true, kurumedeva: true },
                learnedWords: sceneState.learnedWords || {},
                chants: { nirvighnam: true, kurumedeva: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                resetScene();
              }}
              onContinue={() => {
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'nirvighnam-kurumedeva', {
                    completed: true,
                    stars: 8,
                    symbols: {},
                    sanskritWords: { nirvighnam: true, kurumedeva: true },
                    learnedWords: sceneState.learnedWords || {},
                    chants: { nirvighnam: true, kurumedeva: true }
                  });
                  
                  GameStateManager.saveGameState('cave-of-secrets', 'nirvighnam-kurumedeva', {
                    completed: true,
                    stars: 8,
                    sanskritWords: { nirvighnam: true, kurumedeva: true },
                    learnedWords: sceneState.learnedWords || {}
                  });
                }

                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('cave-of-secrets', 'sarvakaryeshu-sarvada', false, false);
                  onNavigate?.('scene-complete-continue');
                }, 100);
              }}
              onExploreZones={() => {
  setShowSceneCompletion(false);
  onNavigate?.('zones');
}}
            />

            {/* Progressive Hints System */}
            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getHintConfigs()}
              characterImage={mooshikaCoach}
              initialDelay={20000}        
              hintDisplayTime={10000}    
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={handleHintShown}
              onHintButtonClick={() => console.log("Hint clicked")}
              enabled={true}
            />

{/* Navigation - Always on top */}
            <div style={{ position: 'relative', zIndex: 10000 }}>
              <TocaBocaNav
                onHome={() => {
                  onNavigate?.('home');
                }}
                onProgress={() => {
                  const name = activeProfile?.name || 'little explorer';
                  console.log(`Great Sanskrit progress, ${name}!`);
                  setShowCulturalCelebration(true);
                }}
                onHelp={() => console.log('Show help')}
                onParentMenu={() => console.log('Parent menu')}
                isAudioOn={true}
                onAudioToggle={() => console.log('Toggle audio')}
                onZonesClick={() => {
                  onNavigate?.('zones');
                }}
                onStartFresh={() => resetScene()}
                currentProgress={{
                  stars: sceneState.stars || 0,
                  completed: sceneState.completed ? 1 : 0,
                  total: 1
                }}
              />
            </div>

            {/* Cultural Celebration Modal */}
            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default NirvighnamScene;
