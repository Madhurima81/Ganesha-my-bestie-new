// zones/cave-of-secrets/scenes/suryakoti-samaprabha/SuryakotiScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import './SuryakotiScene.css';
import '../../../shared/components/OpeningModal.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';

// Import scene management components (PROVEN FROM CAVE)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components (PROVEN FROM CAVE)
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Cave-specific components
import SanskritSidebar from '../../../../lib/components/feedback/SanskritSidebar';
import DoorComponent from '../../components/DoorComponent';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';

// ADD these imports:
import RescueModal from '../../components/RescueModal';
import { RESCUE_CONFIGS } from '../../config/RescueConfigs';
import SymbolSidebar from '../../components/SymbolSidebar';

// Symbol images for centered celebration
import suryakotiSymbol from '../../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../../assets/images/symbols/samaprabha-symbol.png';
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png'; // Added character image



// NEW: Game components
import SunCollectionGameV1 from '../../components/SunCollectionGameV1';
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';

// Cave images
import caveBackgroundDark from './assets/images/cave-background-dark.png';
import caveBackgroundBright from './assets/images/cave-background-bright.png';
import doorImage from './assets/images/door-image.png';
import orbEmpty from './assets/images/orb-empty.png';
import orbGanesha from './assets/images/orb-ganesha.png';
import suryakotiCard from './assets/images/suryakoti-card.png';
import samaprabhaCard from './assets/images/samaprabha-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// Child face images
import scaredFace1 from './assets/images/scared-face-1.png';
import scaredFace2 from './assets/images/scared-face-2.png';
import scaredFace3 from './assets/images/scared-face-3.png';
import scaredFace4 from './assets/images/scared-face-4.png';
import scaredFace5 from './assets/images/scared-face-5.png';
import happyFace1 from './assets/images/happy-face-1.png';
import happyFace2 from './assets/images/happy-face-2.png';
import happyFace3 from './assets/images/happy-face-3.png';
import happyFace4 from './assets/images/happy-face-4.png';
import happyFace5 from './assets/images/happy-face-5.png';

// Sun image for draggable suns
import sunImage from './assets/images/sun.png';

import meaningJournal from '../../assets/images/meaning-journal.png';

// All 8 app images
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';
import appSuryakoti from "../../assets/images/apps/app-suryakoti.png";
import appSamaprabha from "../../assets/images/apps/app-samaprabha.png";

const CAVE_PHASES = {
    STORY_INTRO: 'story_intro', // ← ADD THIS LINE

  // Part 1: Suryakoti Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  SUN_COLLECTION_INTRO: 'sun_collection_intro',
  SUN_COLLECTION_ACTIVE: 'sun_collection_active',
  SUN_COLLECTION_COMPLETE: 'sun_collection_complete',
  SURYAKOTI_LEARNING: 'suryakoti_learning',
  
  // Part 2: Samaprabha Learning  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  HEALING_INTRO: 'healing_intro',
  HEALING_ACTIVE: 'healing_active',
  HEALING_COMPLETE: 'healing_complete',
  SAMAPRABHA_LEARNING: 'samaprabha_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

// Story modal data
const STORY_MODALS = {
  suryakoti: {
    icon: orbGanesha, // Using orbGanesha image
    speech: "Let's explore my brilliant radiance! ☀️",
    title: "Discover Ganesha's Divine Light!",
    subtitle: "2 divine words to master!",
    description: "First, learn to chant SURYAKOTI to unlock the power of million suns and save animals!",
    buttonText: "Start Learning!",
    buttonColor: "linear-gradient(135deg, #FFD700, #FFA500)"
  },
  samaprabha: {
    icon: orbGanesha,
    speech: "Now unlock equal radiance! ✨",
    title: "Wonderful Progress!",
    subtitle: "Master the balanced light!",
    description: "Learn to chant SAMAPRABHA to unlock equal radiance power and save animals!",
    buttonText: "Continue Learning!",
    buttonColor: "linear-gradient(135deg, #9C27B0, #E91E63)"
  }
};

const powerConfig = {
  suryakoti: { 
    name: 'Million Suns Power', 
    image: suryakotiSymbol,
    color: '#FF8C42' 
  },
  samaprabha: { 
    name: 'Equal Radiance Power', 
    image: samaprabhaSymbol,
    color: '#FFD700' 
  }
};

// Error Boundary (PROVEN FROM CAVE)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Suryakoti Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Million Suns Chamber.</h2>
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

const SuryakotiScene = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'suryakoti-samaprabha'
}) => {
  console.log('SuryakotiScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
        welcomeShown: false,

          // Door 1 state (Su-rya-ko-ti)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Su', 'rya', 'ko', 'ti'],

          // Door 2 state (Sa-ma-pra-bha)  
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Sa', 'ma', 'pra', 'bha'],

          // Game 1: Sun Collection state
          sunCollectionStarted: false,
          collectedSuns: 0,
          sunCollectionCompleted: false,
          caveIllumination: 0,
          orbSuns: [],

          // Game 2: Healing Touch state
          healingStarted: false,
          healedChildren: [],
          availableSuns: [],
          healingCompleted: false,
          childStates: [
            { id: 1, healed: false, scaredFace: scaredFace1, happyFace: happyFace1 },
            { id: 2, healed: false, scaredFace: scaredFace2, happyFace: happyFace2 },
            { id: 3, healed: false, scaredFace: scaredFace3, happyFace: happyFace3 },
            //{ id: 4, healed: false, scaredFace: scaredFace4, happyFace: happyFace4 },
            //{ id: 5, healed: false, scaredFace: scaredFace5, happyFace: happyFace5 }
          ],
          
    // Sanskrit learning - Scene 1 words already learned
learnedWords: {
  vakratunda: { learned: true, scene: 1 },
  mahakaya: { learned: true, scene: 1 },
  suryakoti: { learned: false, scene: 2 },
  samaprabha: { learned: false, scene: 2 } 
},

// ✅ NEW: Add these at root level (not inside learnedWords)
showSuryakotiText: false,
showSamaprabhaText: false,

          // Scene progression  
phase: CAVE_PHASES.DOOR1_ACTIVE,
          currentFocus: 'door1',
          
          // Discovery and popup states (PROVEN SYSTEM)
          discoveredSymbols: {},
          currentPopup: null,
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // GameCoach states (PROVEN SYSTEM)
          /*gameCoachState: null,
          isReloadingGameCoach: false,
          suryakotiWisdomShown: false,
          samaprabhaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          sunCollectionIntroShown: false,
          healingIntroShown: false,*/
          
          // Progress tracking (PROVEN SYSTEM)
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },
          
          // UI states (PROVEN SYSTEM)
          showingCompletionScreen: false,
          fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <SuryakotiSceneContent
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

const SuryakotiSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('SuryakotiSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality (PROVEN FROM CAVE)
// GameCoach removed - using direct navigation
const hideCoach = () => {}; // Stub for compatibility
const clearManualCloseTracking = () => {}; // Stub for compatibility

  const { resetScene } = useSceneReset(
  sceneActions, 
  'cave-of-secrets', 
  'suryakoti-samaprabha', 
  getSceneResetConfig('suryakoti-samaprabha')
);

  // State management (PROVEN FROM CAVE)
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ADD after existing useState declarations:
const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
const [showPowerModal, setShowPowerModal] = useState(false);
const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
const [showRescueModal, setShowRescueModal] = useState(false);
const [currentRescueWord, setCurrentRescueWord] = useState(null);
const [showStoryModal, setShowStoryModal] = useState(null); // 'suryakoti' or 'samaprabha'

// ========== 🛡️ CLICK PROTECTION STATE ==========
const [clickLocked, setClickLocked] = useState(false);
const lastClickTime = useRef(0);
const activeTouches = useRef(0);
const isProcessingClick = useRef(false);

const [isManualReset, setIsManualReset] = useState(false);

// Discovery overlay states
const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);

const [discovery1Triggered, setDiscovery1Triggered] = useState(false);
const [discovery2Triggered, setDiscovery2Triggered] = useState(false);

// Resume popup
const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');
const resumePopupTimeoutRef = useRef(null);

// Reload handler
const reloadHandledRef = useRef(false);

  // Refs (PROVEN FROM CAVE)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function (PROVEN FROM CAVE)
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
    'sur': 'suryakoti-sur',
    'ya': 'suryakoti-ya',
    'ko': 'suryakoti-ko',
    'ti': 'suryakoti-ti',
    'sa': 'samaprabha-sa',
    'ma': 'samaprabha-ma',
    'pra': 'samaprabha-pra',
    'bha': 'samaprabha-bha'
  };
  playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
};


  // Show first modal on mount
/*useEffect(() => {
  if (sceneState.phase === 'STORY_INTRO' && !showStoryModal) {
    setTimeout(() => {
      setShowStoryModal('suryakoti');
    }, 500);
  }
}, [sceneState.phase]);*/
  

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

  

  // Cleanup timeouts on unmount (PROVEN FROM CAVE)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ==================== RELOAD HANDLING ====================
useEffect(() => {
  if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
    return;
  }

  console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
  reloadHandledRef.current = true;

  // ============================================
  // DISCOVERY PHASES - SHOW OVERLAYS AGAIN
  // ============================================
  
  if (sceneState.phase === CAVE_PHASES.SURYAKOTI_LEARNING) {
    console.log('📌 Reload: Discovery 1 - Showing again');
    
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        suryakoti: { learned: true, scene: 2 }
      }
    });
    
    setTimeout(() => setShowDiscoveryFlip1(true), 500);
    return;
  }
  
  if (sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING) {
    console.log('📌 Reload: Discovery 2 - Showing again');
    
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        suryakoti: { learned: true, scene: 2 },
        samaprabha: { learned: true, scene: 2 }
      }
    });
    
    setTimeout(() => setShowDiscoveryFlip2(true), 500);
    return;
  }
  
  // ============================================
  // DOOR PHASES
  // ============================================
  
  // Door 1 - Su-rya-ko-ti
  if (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE) {
    const placedCount = sceneState.door1SyllablesPlaced?.length || 0;
    
    if (placedCount >= 4) {
      console.log('📌 Door 1 complete, modal will show');
      return;
    }
    
    setResumeMessage(`Continue spelling SURYAKOTI! ${placedCount}/4 syllables placed!`);
    setShowResumePopup(true);
    
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
    resumePopupTimeoutRef.current = setTimeout(() => {
      setShowResumePopup(false);
    }, 5000);
    
    return;
  }
  
  if (sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) {
    console.log('📌 Door 1 complete, showing modal');
    return;
  }
  
  // Door 2 - Sa-ma-pra-bha
  if (sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE) {
    const placedCount = sceneState.door2SyllablesPlaced?.length || 0;
    
    if (placedCount >= 4) {
      console.log('📌 Door 2 complete, modal will show');
      return;
    }
    
    setResumeMessage(`Continue spelling SAMAPRABHA! ${placedCount}/4 syllables placed!`);
    setShowResumePopup(true);
    
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
    resumePopupTimeoutRef.current = setTimeout(() => {
      setShowResumePopup(false);
    }, 5000);
    
    return;
  }
  
  if (sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) {
    console.log('📌 Door 2 complete, showing modal');
    return;
  }
  
  // ============================================
  // GAME 1: SUN COLLECTION (Component handles its own reload)
  // ============================================
  
if (sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE) {
    console.log('📌 Reload: Sun collection phase');
    
    const collectedSuns = sceneState.collectedSuns || 0;
    
    // ✅ FIX: Check count AND trigger the Discovery Flip
    if (collectedSuns >= 3) {
      console.log('📌 All suns collected, triggering discovery');
      
      sceneActions.updateState({
        phase: CAVE_PHASES.SURYAKOTI_LEARNING,
        sunCollectionCompleted: true
      });
      
      // ⚡️ ADD THIS: Force the overlay to open immediately
      setTimeout(() => {
        setShowDiscoveryFlip1(true);
      }, 500);

      return;
    }
    
    // Show resume for in-progress
    setResumeMessage(`Keep collecting suns! ${collectedSuns}/3 found!`);
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
  // GAME 2: HEALING (Inline game)
  // ============================================

  if (sceneState.phase === CAVE_PHASES.HEALING_ACTIVE) {
    console.log('📌 Reload: Healing phase');
    
    // Keep your existing learnedWords update logic here
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        suryakoti: { learned: true, scene: 2 }
      }
    });
    
    const healedCount = sceneState.healedChildren?.length || 0;
    
    // ✅ FIX: Check count AND trigger the Discovery Flip
    if (healedCount >= 3) {
      console.log('📌 All 3 healed, triggering discovery');
      
      sceneActions.updateState({
        phase: CAVE_PHASES.SAMAPRABHA_LEARNING,
        healingCompleted: true
      });

      // ⚡️ ADD THIS: Force the overlay to open immediately
      setTimeout(() => {
        setShowDiscoveryFlip2(true);
      }, 500);

      return;
    }
    
    // Show resume for in-progress
    setResumeMessage(`Continue healing! ${healedCount}/3 children healed!`);
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
  // COMPLETION
  // ============================================
  
  if (sceneState.phase === CAVE_PHASES.COMPLETE) {
    console.log('📌 Reload: Completion');
    
    sceneActions.updateState({
      learnedWords: {
        suryakoti: { learned: true, scene: 2 },
        samaprabha: { learned: true, scene: 2 }
      }
    });
    
    if (!sceneState.showingCompletionScreen) {
      setTimeout(() => setShowSceneCompletion(true), 500);
    }
    
    return;
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown]);



  // GameCoach messages (ADAPTED FOR SURYAKOTI)
  /*const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Million Suns Chamber, ${profileName}! Ancient light awaits your collection!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    /*{
      id: 'suryakoti_wisdom',
      message: `Magnificent, ${profileName}! You've mastered Suryakoti - the brilliance of a million suns!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.suryakoti?.learned && !sceneState?.suryakotiWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'sun_collection_intro',
      message: `🌞 Collect the golden suns, ${profileName}! Fill your magical orb with divine light!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.SUN_COLLECTION_INTRO && !sceneState?.sunCollectionIntroShown
    },
    {
      id: 'healing_intro',
      message: `💖 Share your sunshine, ${profileName}! Drag the suns to heal the sad children's hearts!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.HEALING_INTRO && !sceneState?.healingIntroShown
    },
    /*{
      id: 'samaprabha_wisdom',
      message: `Wonderful, ${profileName}! You've learned Samaprabha - your inner light that removes all darkness!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.samaprabha?.learned && !sceneState?.samaprabhaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];*/

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      explicitMessage: 'Drag Su-rya-ko-ti syllables to spell Suryakoti!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'sun-collection-hint',
      message: 'Click the golden suns to collect them!',
      explicitMessage: 'Look for bright golden suns and click them to fill your orb!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE &&
               sceneState?.collectedSuns < 5 &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the Sanskrit syllables for Samaprabha!',
      explicitMessage: 'Drag Sa-ma-pra-bha syllables to spell Samaprabha!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'healing-hint',
      message: 'Drag the suns to the sad children to heal them!',
      explicitMessage: 'Drag suns from around the orb to each scared child!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.HEALING_ACTIVE &&
               sceneState?.healedChildren?.length < 3 &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    }
  ];



  // GameCoach triggering system (PROVEN FROM CAVE)
  /*useEffect(() => {
    if (!sceneState || !showMessage) return;
   
    if (sceneState.isReloadingGameCoach) {
      console.log('🚫 GameCoach blocked: Reload in progress');
      return;
    }
   
    if (sceneState.symbolDiscoveryState) {
      console.log('🚫 GameCoach blocked: Symbol discovery in progress');
      return;
    }

    if (sceneState.sidebarHighlightState) {
      console.log('🚫 GameCoach blocked: Sidebar highlighting in progress');
      return;
    }

    const matchingMessage = caveGameCoachMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
   
    if (matchingMessage) {
      const messageAlreadyShown =
        (matchingMessage.id === 'suryakoti_wisdom' && sceneState.suryakotiWisdomShown) ||
        (matchingMessage.id === 'samaprabha_wisdom' && sceneState.samaprabhaWisdomShown) ||
        (matchingMessage.id === 'cave_welcome' && sceneState.welcomeShown) ||
        (matchingMessage.id === 'sun_collection_intro' && sceneState.sunCollectionIntroShown) ||
        (matchingMessage.id === 'healing_intro' && sceneState.healingIntroShown);
     
      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }
     
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing divine light first, then ${matchingMessage.id} message`);
        
        setShowSparkle('divine-light');
        
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 6000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: 'wisdom'
          });
        }, 2000);
       
        switch (matchingMessage.id) {
          case 'cave_welcome':
            sceneActions.updateState({ welcomeShown: true });
            break;
          case 'sun_collection_intro':
            sceneActions.updateState({ sunCollectionIntroShown: true });
            break;
          case 'healing_intro':
            sceneActions.updateState({ healingIntroShown: true });
            break;
          case 'suryakoti_wisdom':
            sceneActions.updateState({
              suryakotiWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'suryakoti_wisdom'
            });
            setPendingAction('start-door2');
            break;
          case 'samaprabha_wisdom':
            sceneActions.updateState({
              samaprabhaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'samaprabha_wisdom'
            });
            setPendingAction('start-fireworks');
            break;
        }
      }, matchingMessage.timing);
     
      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase,
    sceneState?.learnedWords,
    sceneState?.welcomeShown,
    sceneState?.suryakotiWisdomShown,
    sceneState?.samaprabhaWisdomShown,
    sceneState?.sunCollectionIntroShown,
    sceneState?.healingIntroShown,
    sceneState?.readyForWisdom,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);*/

  // RELOAD LOGIC (PROVEN FROM CAVE)
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 SURYAKOTI RELOAD: Starting comprehensive reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase
    });

    // ✅ EMERGENCY: Clear all sparkles on any reload
setTimeout(() => {
  setShowSparkle(null); // Clear React sparkle state
  
  // Clear any DOM sparkle elements
  const sparkleElements = document.querySelectorAll('.sparkle, [class*="sparkle"]');
  sparkleElements.forEach(el => el.style.display = 'none');
}, 100);

    // Check for Play Again flag first
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    const isFreshRestartAfterPlayAgain = (
      playAgainRequested === 'true' ||
      (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && 
       sceneState.completed === false && 
       sceneState.stars === 0 && 
       (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen))
    );
    
    if (isFreshRestartAfterPlayAgain) {
      console.log('🔄 SURYAKOTI RELOAD: Detected fresh restart after Play Again - clearing completion state');
      
      if (playAgainRequested === 'true') {
        localStorage.removeItem(playAgainKey);
        console.log('✅ CLEARED: Suryakoti Play Again storage flag');
      }
      
      sceneActions.updateState({ 
        showingCompletionScreen: false,
        currentPopup: null,
        completed: false,
        phase: CAVE_PHASES.DOOR1_ACTIVE
      });
      return;
    }

    // IMMEDIATELY block GameCoach normal flow
    
    setTimeout(() => {
      // Handle popup states, symbol discovery, etc. (same pattern as Cave)
      if (sceneState.currentPopup) {
        console.log('🔄 SURYAKOTI: Resuming popup:', sceneState.currentPopup);
        
        switch(sceneState.currentPopup) {
    

          case 'final_fireworks':
            const profileId = localStorage.getItem('activeProfileId');
            const playAgainKey = `play_again_${profileId}_cave-of-secrets_suryakoti-samaprabha`;
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              console.log('🚫 SURYAKOTI FIREWORKS BLOCKED: Play Again was clicked');
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
            
            console.log('🎆 SURYAKOTI: Resuming final fireworks');
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
            
            setTimeout(() => {
              setShowSparkle('final-fireworks');
            }, 500);
            return;
        }
        return;
      }

      // Line 609: }
// Line 610: return;
// Line 611: }

// ✅ FIXED - Handle Door 1 reload properly:
else if (sceneState.door1Completed && 
         (sceneState.phase === CAVE_PHASES.SUN_COLLECTION_INTRO || 
          (sceneState.collectedSuns === 0 && sceneState.sunCollectionStarted))) {
  console.log('🔄 SURYAKOTI: Door 1 complete, clearing all animations and starting game');
  
  // Clear ALL blocking states
  sceneActions.updateState({
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE, // Skip intro, go straight to active
    sunCollectionStarted: true, // Ensure game is started
    
    // ✅ Clear all blocking animation states
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
      
    
    // ✅ Clear any sparkle states
    currentPopup: null
  });
  
  // ✅ Force clear any remaining sparkles
  setTimeout(() => {
    const sparkleElements = document.querySelectorAll('[style*="sparkle"], [class*="sparkle"]');
    sparkleElements.forEach(el => el.remove());
  }, 100);
  
  return;
}

// ✅ ADD: Handle Door 2 completed but healing not started  
else if (sceneState.door2Completed && !sceneState.healingStarted) {
  console.log('🔄 SURYAKOTI: Door 2 completed but healing not started - starting healing game');
  sceneActions.updateState({
    phase: CAVE_PHASES.HEALING_INTRO,
    healingStarted: true,
    availableSuns: [
      { id: 1, angle: 0 },
      { id: 2, angle: 72 },
      { id: 3, angle: 144 },
      //{ id: 4, angle: 216 },
      //{ id: 5, angle: 288 }
    ],
  
  });
  return;
}

// ✅ NEW: Handle sun collection started but 0 suns collected (freeze point)
else if (sceneState.sunCollectionStarted && 
         sceneState.collectedSuns === 0 && 
         (sceneState.phase === CAVE_PHASES.SUN_COLLECTION_INTRO || 
          sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE)) {
  console.log('🔄 SURYAKOTI: Sun collection started but 0 suns - clearing freeze state');
  sceneActions.updateState({
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE,
  });
  return;
}

// ✅ ADD: Handle mid-sun-collection reload
else if (sceneState.sunCollectionStarted && 
         !sceneState.sunCollectionCompleted && 
         sceneState.collectedSuns > 0 && 
         sceneState.collectedSuns < 3) {
  console.log('🔄 SURYAKOTI: Resuming mid-sun-collection with', sceneState.collectedSuns, 'suns');
  sceneActions.updateState({
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE,
  });
  return;
}

// ✅ ADD: Handle sun collection completed but learning not started
else if (sceneState.sunCollectionCompleted && 
         !sceneState.learnedWords?.suryakoti?.learned &&
         !sceneState.symbolDiscoveryState && 
         !sceneState.currentPopup) {
  console.log('🔄 SURYAKOTI: Sun collection completed but Suryakoti learning not started');
  sceneActions.updateState({
    phase: CAVE_PHASES.SURYAKOTI_LEARNING,
  });
  // Trigger learning completion
  setTimeout(() => completeSuryakotiLearning(), 500);
  return;
}

// ✅ FIXED - Better handling of text animation reload:
else if (sceneState.showSuryakotiText || 
         (sceneState.learnedWords?.suryakoti?.learned && 
          sceneState.phase === CAVE_PHASES.SURYAKOTI_LEARNING)) {
  console.log('🔄 SURYAKOTI: Resuming during Suryakoti text animation - skipping to Door 2');
  
  // Clear ALL animation states to prevent loops
  sceneActions.updateState({
    showSuryakotiText: false,
    phase: CAVE_PHASES.DOOR2_ACTIVE,
    
    // ✅ ADD: Ensure sun collection is marked complete
    sunCollectionCompleted: true,
    sunCollectionStarted: true,
    collectedSuns: 3,
    caveIllumination: 100,
    
    // ✅ ADD: Prevent any pending callbacks
    symbolDiscoveryState: null,
    sidebarHighlightState: null
  });
  
  // ✅ ADD: Clear any pending timeouts that might restart animation
  if (typeof window !== 'undefined') {
    const highestId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
      clearTimeout(i);
    }
  }
  
  return;
}

else if (sceneState.showSamaprabhaText || 
         (sceneState.learnedWords?.samaprabha?.learned && 
          sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING)) {
  console.log('🔄 SURYAKOTI: Resuming during Samaprabha text animation - skipping to fireworks');
  sceneActions.updateState({
    showSamaprabhaText: false, // Clear the text
  });
  // Skip to final celebration
  setTimeout(() => showFinalCelebration(), 500);
  return;
}

// Continue with existing code after this...

      // Handle completion screen reload
      if (sceneState.showingCompletionScreen) {
        const profileId = localStorage.getItem('activeProfileId');
        const playAgainKey = `play_again_${profileId}_cave-of-secrets_suryakoti-samaprabha`;
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        if (playAgainRequested === 'true') {
          console.log('🚫 SURYAKOTI COMPLETION BLOCKED: Play Again was clicked');
          localStorage.removeItem(playAgainKey);
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: CAVE_PHASES.DOOR1_ACTIVE,
            stars: 0,
          });
          return;
        }
        
        console.log('🔄 SURYAKOTI: Resuming completion screen');
        setShowSceneCompletion(true);
      
        return;
      }

      // Default: clear flags
      console.log('🔄 SURYAKOTI: No special reload needed, clearing flags');
      setTimeout(() => {
      }, 1500);
      
    }, 500);
    
  }, [isReload]);

  // Door 1 handlers (ADAPTED FOR SURYAKOTI)
  const handleDoor1SyllablePlaced = (syllable) => {
     if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }
    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Su';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      console.log(`✅ Correct! Step ${newStep-1} -> ${newStep}`);
      
      sceneActions.updateState({
        door1SyllablesPlaced: newSyllablesPlaced,
        door1CurrentStep: newStep
      });
      
  if (newStep >= 4) {
  // ❌ REMOVED: Don't auto-trigger door completion
  // The DoorComponent will call onDoorComplete when button is clicked
  console.log('✅ All syllables placed - waiting for Start Challenge button');
}
    } else {
      console.log(`❌ Wrong! Expected "${expectedSyllable}", got "${syllable}"`);
    // Removed GameCoach feedback - user gets visual feedback from door
console.log(`Expected: ${expectedSyllable}, got: ${syllable}`);
    }
  };

const handleDoor1Complete = () => {
  console.log('🚪 Door 1 completed - starting sparkle fade!');
  
  if (sceneState.door1Completed) {
    console.log('🚫 Door 1 already completed, ignoring duplicate call');
    return;
  }
  
  setShowSparkle('door1-completing');
  
  const doorElement = document.querySelector('.suryakoti-door .door-container');
  if (doorElement) {
    doorElement.classList.add('completing');
  }
  
  sceneActions.updateState({
    door1Completed: true,
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE,  // ✅ CHANGE: Set to ACTIVE immediately
    sunCollectionStarted: true  // ✅ ADD: Mark as started too
  });

  setTimeout(() => {
    setShowSparkle(null);
  }, 3000);
};

  // Door 2 handlers (ADAPTED FOR SAMAPRABHA)
  const handleDoor2SyllablePlaced = (syllable) => {
     if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Sa';
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
 // Removed GameCoach feedback - user gets visual feedback from door
console.log(`Expected: ${expectedSyllable}, got: ${syllable}`);
    }
  };

const handleDoor2Complete = () => {
  console.log('🚪 Door 2 completed - starting sparkle fade!');
  
  setShowSparkle('door2-completing');
  
  const doorElement = document.querySelector('.samaprabha-door .door-container');
  if (doorElement) {
    doorElement.classList.add('completing');
  }
  
  sceneActions.updateState({
    door2Completed: true,
    phase: CAVE_PHASES.HEALING_ACTIVE,  // ✅ CHANGE: Set to ACTIVE immediately
    healingStarted: true,  // ✅ ADD: Mark as started
    availableSuns: [
      { id: 1, angle: 0 },
      { id: 2, angle: 72 },
      { id: 3, angle: 144 }
    ]
  });

  setTimeout(() => {
    setShowSparkle(null);
  }, 3000);
};


// ✅ REPLACE this function entirely:
const handleSunCollectionStart = () => {
  console.log('🌞 Starting sun collection game!');
  
  // ✅ ADD: Prevent multiple calls
  if (sceneState.sunCollectionStarted) {
    console.log('🚫 Sun collection already started, ignoring duplicate call');
    return;
  }
  
  sceneActions.updateState({
    sunCollectionStarted: true,
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE,
    
    // ✅ ADD: Clear any blocking states that could cause freeze
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
  });
};

const handleSunCollected = (count) => {
  console.log(`☀️ Sun collected! Total: ${count}/3`);
  console.log('🔍 BEFORE UPDATE:', sceneState.collectedSuns);
  
  const newIllumination = (count / 3) * 100;
  
  sceneActions.updateState({
    collectedSuns: count,
    caveIllumination: newIllumination,
    sunCollectionStarted: true
  });
  
  console.log('🔍 AFTER UPDATE - should be', count);
};


const handleSunCollectionComplete = () => {
  console.log('🌟 Sun collection completed!');
  
  sceneActions.updateState({
    sunCollectionCompleted: true,
    phase: CAVE_PHASES.SURYAKOTI_LEARNING  // ✅ CHANGE to learning phase
  });

  safeSetTimeout(() => {
    setTimeout(() => {
      setShowDiscoveryFlip1(true);  // ✅ Trigger discovery overlay
    }, 1500);
  }, 500);
};

// ❌ DELETE the old function entirely, REPLACE with:
/*/*const completeSuryakotiLearning = () => {
  if (sceneState.learnedWords?.suryakoti?.learned) {
    console.log('🚫 Suryakoti already learned, skipping');
    sceneActions.updateState({ phase: CAVE_PHASES.DOOR2_ACTIVE });
    return;
  }
  
  console.log('🌟 Suryakoti symbol learned - FULL CELEBRATION');
  
  // Step 1: Show big centered symbol + text (5 seconds)
  setShowCenteredSymbol('suryakoti');
  
  setTimeout(() => {
    // Step 2: Hide centered, start fly animation to sidebar
    setShowCenteredSymbol(null);
    setShowSparkle('suryakoti-to-sidebar');
    
    // ✅ UPDATE: Mark symbol as learned
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        suryakoti: { learned: true, scene: 2 }
      }
    });
    
    setTimeout(() => {
      // Step 3: Symbol in sidebar, show power modal
      setShowSparkle(null);
      setCurrentMissionSymbol('suryakoti');
      setShowPowerModal(true);
    }, 2000);
  }, 5000);
};*/

/*const handleSunClick = (sunIndex) => {
  const now = Date.now();
  
  // 🛡️ PROTECTION LAYERS
  if (now - lastClickTime.current < 400) {
    console.log('🚫 BLOCKED: Too fast');
    return;
  }
  if (clickLocked) {
    console.log('🚫 BLOCKED: Animation playing');
    return;
  }
  if (isProcessingClick.current) {
    console.log('🚫 BLOCKED: Processing');
    return;
  }
  if (activeTouches.current > 1) {
    console.log('🚫 BLOCKED: Multi-touch');
    return;
  }
  if (sceneState.phase !== CAVE_PHASES.HEALING_ACTIVE) {
    console.log('🚫 BLOCKED: Wrong phase');
    return;
  }
  if (showPowerModal || showRescueModal || showStoryModal || showCenteredSymbol) {
    console.log('🚫 BLOCKED: Modal open');
    return;
  }
  
  // ✅ APPROVED - Process click
  console.log(`☀️ Sun ${sunIndex} clicked!`);
  lastClickTime.current = now;
  setClickLocked(true);
  isProcessingClick.current = true;
  
  hideActiveHints();
  
  // Check if this sun was already used
  if (sceneState.healedChildren?.includes(sunIndex)) {
    console.log('⚠️ This sun was already used');
    setClickLocked(false);
    isProcessingClick.current = false;
    return;
  }
  
  // Add to healed children
  const newHealedChildren = [...(sceneState.healedChildren || []), sunIndex];
  
  // Show sparkle effect
  setShowSparkle(`child-${sunIndex}-healed`);
  setTimeout(() => setShowSparkle(null), 1500);
  
  // Update state
  sceneActions.updateState({
    healedChildren: newHealedChildren,
    caveIllumination: Math.min(100, sceneState.caveIllumination + 33)
  });
  
  // Check completion
  if (newHealedChildren.length >= 3) {
    console.log('✅ All 3 children healed!');
    safeSetTimeout(() => {
      completeHealing();
    }, 2000);
  }
  
  // Unlock after delay
  setTimeout(() => {
    setClickLocked(false);
    isProcessingClick.current = false;
  }, 1000);
};*/

const completeHealing = () => {
  console.log('💖 Healing completed!');
  
  sceneActions.updateState({
    healingCompleted: true,
    phase: CAVE_PHASES.SAMAPRABHA_LEARNING  // ✅ CHANGE to learning phase
  });

  safeSetTimeout(() => {
    setTimeout(() => {
      setShowDiscoveryFlip2(true);  // ✅ Trigger discovery overlay
    }, 1500);
  }, 500);
};

  const handleSunClick = (sunIndex) => {
      if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }

  // Basic validation only
  if (clickLocked) {
    console.log('Animation playing');
    return;
  }
  
  if (sceneState.phase !== CAVE_PHASES.HEALING_ACTIVE) {
    console.log('Wrong phase');
    return;
  }
  
  if (showPowerModal || showRescueModal || showStoryModal || showCenteredSymbol) {
    console.log('Modal open');
    return;
  }
  
  if (sceneState.healedChildren?.includes(sunIndex)) {
    console.log('Sun already used');
    return;
  }
  
  // Process click
  console.log(`☀️ Sun ${sunIndex} clicked!`);
  setClickLocked(true);
  hideActiveHints();
  
  // Add to healed children
  const newHealedChildren = [...(sceneState.healedChildren || []), sunIndex];
  
  // Show sparkle
  setShowSparkle(`child-${sunIndex}-healed`);
  setTimeout(() => setShowSparkle(null), 1500);
  
  // Update state
  sceneActions.updateState({
    healedChildren: newHealedChildren,
    caveIllumination: Math.min(100, sceneState.caveIllumination + 33)
  });
  
  // Check completion
  if (newHealedChildren.length >= 3) {
    console.log('✅ All 3 children healed!');
    setTimeout(() => {
      completeHealing();
    }, 2000);
  }
  
  // Unlock
  setTimeout(() => {
    setClickLocked(false);
  }, 800);
};

// ❌ DELETE the old function entirely, REPLACE with:
/*const startSamaprabhaLearning = () => {
  if (sceneState.learnedWords?.samaprabha?.learned) {
    console.log('🚫 Samaprabha already learned, skipping');
    showFinalCelebration();
    return;
  }
  
  console.log('🌟 Samaprabha symbol learned - FULL CELEBRATION');
  
  // Step 1: Show big centered symbol + text (5 seconds)
  setShowCenteredSymbol('samaprabha');
  
  setTimeout(() => {
    // Step 2: Hide centered, start fly animation to sidebar
    setShowCenteredSymbol(null);
    setShowSparkle('samaprabha-to-sidebar');
    
    // ✅ UPDATE: Mark symbol as learned
    sceneActions.updateState({
      learnedWords: {
        ...sceneState.learnedWords,
        samaprabha: { learned: true, scene: 2 }
      }
    });
    
    setTimeout(() => {
      // Step 3: Symbol in sidebar, show power modal
      setShowSparkle(null);
      setCurrentMissionSymbol('samaprabha');
      setShowPowerModal(true);
    }, 2000);
  }, 5000);
};*/

// ✅ ADD: Power Modal Actions
const handleSaveAnimal = () => {
  setShowPowerModal(false);
  setCurrentRescueWord(currentMissionSymbol);
  setShowRescueModal(true);
};

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentMissionSymbol === 'suryakoti') {
    // Show second story modal before Door 2
    setShowStoryModal('samaprabha');
  } else if (currentMissionSymbol === 'samaprabha') {
    // Go to final celebration
    setTimeout(() => showFinalCelebration(), 500);
  }
};

// Helper function for button text
const getNextDiscoveryText = (currentSymbol) => {
  const nextActions = {
    suryakoti: '🚪 Discover Samaprabha',
    samaprabha: '✨ Complete Chamber'
  };
  return nextActions[currentSymbol] || '➡️ Continue';
};

const handleRescueComplete = (success) => {
  if (!success) return;
  
  setShowRescueModal(false);
  
  if (currentRescueWord === 'suryakoti') {
    setTimeout(() => {
      setShowStoryModal('samaprabha');  // ✅ Show second story modal
    }, 500);
  } else if (currentRescueWord === 'samaprabha') {
    setTimeout(() => {
      showFinalCelebration();
    }, 500);
  }
  
  setCurrentRescueWord(null);
};

 const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    // Hide Sanskrit Sidebar during completion
    const sidebarElement = document.querySelector('.sanskrit-sidebar');
    if (sidebarElement) {
      sidebarElement.style.opacity = '0';
      sidebarElement.style.pointerEvents = 'none';
      sidebarElement.style.transition = 'opacity 0.5s ease';
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
    console.log(`Cave hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Cave hint button clicked");
  };

  if (!sceneState) {
    return <div className="loading">Loading Million Suns Chamber...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>
{/* GRADUAL BACKGROUND BLENDING */}
<div className="pond-background" style={{ position: 'relative', width: '100%', height: '100%' }}>


      {/* ✅ OPENING INSTRUCTION SCREEN (Full Screen) */}
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
          <h1 className="game-modal-title">{modal?.title || 'Spread the Light'}</h1>
          <p className="game-modal-subtitle">{modal?.description || 'Find them and light up the cave.'}</p>
          <div className="game-modal-icons">
            <div className="game-modal-icon-item">
              <img src={suryakotiSymbol} alt="Suryakoti" />
              <span className="game-modal-icon-label">Million Suns</span>
            </div>
            <div className="game-modal-icon-item">
              <img src={samaprabhaSymbol} alt="Samaprabha" />
              <span className="game-modal-icon-label">Equal Radiance</span>
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
{!showPowerModal && !showRescueModal && !showCenteredSymbol && (
  <>
    {/* Door 1 Active */}
    {sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed && (
      <div className="phase-header">
        🔤 SPELL SURYAKOTI! Drag the syllables in order!
      </div>
    )}
    
    {/* Sun Collection */}
    {sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE && sceneState.collectedSuns < 3 && (
      <div className="phase-header">
        ☀️ COLLECT THE GOLDEN SUNS! Fill your orb!
      </div>
    )}
    
    {/* Door 2 Active */}
    {sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed && (
      <div className="phase-header">
        🔤 SPELL SAMAPRABHA! Arrange the syllables!
      </div>
    )}
    
    {/* Healing Children */}
    {sceneState.phase === CAVE_PHASES.HEALING_ACTIVE && sceneState.healedChildren?.length < 3 && (
      <div className="phase-header">
        💖 HEAL THE CHILDREN! Click the suns!
      </div>
    )}
  </>
)}
  
  {/* Dark background - always there */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url(${caveBackgroundDark})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1
  }} />
  
  {/* Bright background - fades in gradually */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url(${caveBackgroundBright})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat',
    opacity: Math.max(0, (sceneState.caveIllumination - 60) / 40), // Starts fading in at 60%, full at 100%
    transition: 'opacity 2s ease',
    zIndex: 2
  }} />
  
  {/* Filter overlay */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    filter: `brightness(${1 + Math.min((sceneState.caveIllumination || 0) / 500, 0.15)})`,
    transition: 'all 2s ease',
    zIndex: 3,
    pointerEvents: 'none'
  }} />
            
            {/* Divine light for GameCoach */}
            {showSparkle === 'divine-light' && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '200px',
                zIndex: 199,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="glitter"
                  count={80}
                  color="#FFD700" 
                  size={3}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Clear Storage Button 
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

            {/* COMPREHENSIVE PHASE TEST BUTTONS 
<div style={{
  position: 'fixed',
  top: '60px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 9999,
  background: 'rgba(0,0,0,0.8)',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '11px'
}}>
  <div style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
    🧪 PHASE TESTS
  </div>
  

  
  {/* Door 1 Complete 
  <button style={{
    background: '#27AE60', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.DOOR1_COMPLETE,
      door1Completed: true,
      door1CurrentStep: 4,
      door1SyllablesPlaced: ['Va', 'kra', 'tun', 'da']
    });
  }}>
    ✅1 Door1 Done
  </button>

  


  

  
  {/* Door 2 Active 
  <button style={{
    background: '#8E44AD', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.DOOR2_ACTIVE,
      learnedWords: { vakratunda: { learned: true }, mahakaya: { learned: false } },
      door2Completed: false,
      door2CurrentStep: 0,
      door2SyllablesPlaced: []
    });
  }}>
    🚪6 Door2 Active
  </button>
  

  
  {/* Complete Scene 
  <button style={{
    background: '#E67E22', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.COMPLETE,
      completed: true,
      stars: 8,
      learnedWords: { vakratunda: { learned: true }, mahakaya: { learned: true } },
      growingCompleted: true
    });
    setTimeout(() => showFinalCelebration(), 500);
  }}>
    🎆8 Complete
  </button>
</div>

{/* PERFECT TEST COMPLETE BUTTON 
<div style={{
  position: 'fixed',
  top: '170px',
  left: '20px',
  zIndex: 9999,
  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  border: '2px solid #FFD700'
}} onClick={() => {
  console.log('🧪 PERFECT SURYAKOTI TEST: Setting all completion states');
  
  // Close any open popups first
  setShowMagicalCard(false);
  setShowPopupBook(false);
  setShowSparkle(null);
  setCardContent({});
  setPopupBookContent({});
  
  // Set ALL completion states
  sceneActions.updateState({
    // Door states
    door1Completed: true,
    door1CurrentStep: 4,
    door1SyllablesPlaced: ['Su', 'rya', 'ko', 'ti'],
    
    door2Completed: true,
    door2CurrentStep: 4,
    door2SyllablesPlaced: ['Sa', 'ma', 'pra', 'bha'],
    
    // Game 1 completion states
    sunCollectionCompleted: true,
    sunCollectionStarted: true,
    collectedSuns: 3,
    caveIllumination: 100,
    
    // Game 2 completion states
    healingCompleted: true,
    healingStarted: true,
    healedChildren: [1, 2, 3],
    availableSuns: [],
    
    // Learning states - Include Scene 1 words + Scene 2 words
    learnedWords: {
      vakratunda: { learned: true, scene: 1 },
      mahakaya: { learned: true, scene: 1 },
      suryakoti: { learned: true, scene: 2 },
      samaprabha: { learned: true, scene: 2 }
    },
    

    // Clear any blocking states
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    currentPopup: null,
 
    
    // Final completion states
    phase: CAVE_PHASES.COMPLETE,
    completed: true,
    stars: 8,
    progress: {
      percentage: 100,
      starsEarned: 8,
      completed: true
    }
  });
  
  // Trigger final celebration after state is set
  setTimeout(() => {
    console.log('🎆 PERFECT SURYAKOTI TEST: Triggering final celebration');
    showFinalCelebration();
  }, 500);
  
  console.log('✅ PERFECT SURYAKOTI TEST: All states set, fireworks should start!');
}}>
  🎆 PERFECT TEST
</div>




            {/* Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent
                  key={`door1-${sceneState.door1CurrentStep}-${sceneState.door1Completed}-${sceneState.phase}`}
                  syllables={['Su', 'rya', 'ko', 'ti']}
                  completedWord="Suryakoti"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                    onSyllableAudio={playSyllable}  // ← ADD THIS LINE

                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="suryakoti-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="SURYAKOTI"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* Door 1 Completion Sparkles */}
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

{/* Sun Collection Game */}
{(sceneState.phase === CAVE_PHASES.SUN_COLLECTION_INTRO || 
  sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE || 
  sceneState.phase === CAVE_PHASES.SUN_COLLECTION_COMPLETE ||
  sceneState.phase === CAVE_PHASES.SURYAKOTI_LEARNING) && 
 !showCenteredSymbol && 
 !showPowerModal && 
 !showRescueModal && 
 !showStoryModal && 
 !showSceneCompletion && ( 
  <div className="sun-collection-area" id="sun-collection-area">
<SunCollectionGameV1
  onComplete={handleSunCollectionComplete}
  onSunCollected={handleSunCollected}
  profileName={profileName}
  
  isResuming={isReload}
  resumeCollectedSuns={sceneState.collectedSuns || 0}
  resumeIllumination={sceneState.caveIllumination || 0}
  resumeStarted={sceneState.sunCollectionStarted || false}
  
  caveBounds={{
    top: '10%',
    left: '15%',
    width: '80%',
    height: '80%',
  }}
  
  // ✅ ADD THIS
  onInteraction={() => {
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) {
        clearTimeout(resumePopupTimeoutRef.current);
      }
    }
  }}
/>
  </div>
)}



            {/* Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  key={`door2-${sceneState.door2CurrentStep}-${sceneState.door2Completed}-${sceneState.phase}`}

                  syllables={['Sa', 'ma', 'pra', 'bha']}
                  completedWord="Samaprabha"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                    onSyllableAudio={playSyllable}  // ← ADD THIS LINE

                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="samaprabha-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle="SAMAPRABHA"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* Door 2 Completion Sparkles */}
            {showSparkle === 'door2-completing' && sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && (
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

{/* ✨ NEW: Suryakoti to Sidebar Effect */}
{showSparkle === 'suryakoti-to-sidebar' && (
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
      color="#FF8C42"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{/* ✨ NEW: Samaprabha to Sidebar Effect */}
{showSparkle === 'samaprabha-to-sidebar' && (
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

{/* Suryakoti Text */}
{sceneState.showSuryakotiText && (
  <div className="suryakoti-text" style={{
    position: 'absolute',
    top: '65%',
    left: '30%',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FF8C42',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    animation: 'textFloat 3s ease-out forwards',
    zIndex: 15
  }}>
    Million Suns
  </div>
)}

{/* Samaprabha Text */}
{sceneState.showSamaprabhaText && (
  <div className="samaprabha-text" style={{
    position: 'absolute',
    top: '65%',
    right: '30%',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    animation: 'textGrow 2s ease-out forwards',
    zIndex: 15
  }}>
    Equal Brilliance
  </div>
)}

{/* Game 2: CLICK THE SUNS - Simple Click Game */}
{(sceneState.phase === CAVE_PHASES.HEALING_INTRO || 
  sceneState.phase === CAVE_PHASES.HEALING_ACTIVE || 
  sceneState.phase === CAVE_PHASES.HEALING_COMPLETE ||
  sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING ||
  sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
  sceneState.phase === CAVE_PHASES.COMPLETE) && 
 !showCenteredSymbol && 
 !showPowerModal && 
 !showRescueModal && 
 !showStoryModal && 
 !showSceneCompletion && (
  
 <div 
    className="healing-game-area"
    onTouchStart={(e) => {
      activeTouches.current = e.touches.length;
      if (e.touches.length > 1) {
        console.log('🚫 MULTI-TOUCH BLOCKED');
        e.preventDefault();
      }
    }}
    onTouchEnd={() => {
      activeTouches.current = 0;
    }}
  >
    
    {/* Central Orb */}
    <div className="central-healing-orb">
      <img 
        src={orbGanesha}
        alt="Healing Orb"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
    
    {/* 3 Clickable Suns Around Orb */}
    {[1, 2, 3].map((sunIndex) => {
      const isUsed = sceneState.healedChildren?.includes(sunIndex);
      
      if (isUsed) return null;
      
      return (
        <div 
          key={sunIndex} 
          className={`healing-sun healing-sun-${sunIndex}`}
          onClick={() => handleSunClick(sunIndex)}
          style={{ cursor: isUsed ? 'default' : 'pointer' }}
        >
          <img 
            src={sunImage}
            alt={`Healing Sun ${sunIndex}`}
            style={{ 
              width: '100%', 
              height: '100%',
              filter: 'brightness(1.2)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      );
    })}
    
    {/* 3 Children - Show scared or happy face */}
    {(() => {
      const childPositions = [
        { childId: 1, className: 'healing-child-1', position: 'top-left' },
        { childId: 2, className: 'healing-child-2', position: 'top-right' },
        { childId: 3, className: 'healing-child-3', position: 'bottom-left' }
      ];
      
      return childPositions.map((childConfig, arrayIndex) => {
        const childData = sceneState.childStates?.[arrayIndex];
        const isHealed = sceneState.healedChildren?.includes(childConfig.childId);
        
        return (
          <div key={childConfig.childId} className={childConfig.className}>
            <img 
              src={isHealed ? childData?.happyFace : childData?.scaredFace}
              alt={`Child ${childConfig.childId}`}
              style={{ 
                width: '100%', 
                height: '100%',
                filter: isHealed ? 'brightness(1.3)' : 'brightness(0.8)',
                border: isHealed ? '3px solid #90EE90' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                transition: 'all 0.5s ease'
              }}
            />
          </div>
        );
      });
    })()}
    
  </div>
)}

<style>{`
  @keyframes gentleGlow {
    0%, 100% { 
      filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.8)) brightness(1.2);
    }
    50% { 
      filter: drop-shadow(0 0 35px rgba(255, 215, 0, 1)) brightness(1.4);
    }
  }
/* ✅ ADD: Missing text animations */
  @keyframes textFloat {
    0% {
      transform: translateY(20px) scale(0);
      opacity: 0;
    }
    50% {
      transform: translateY(-10px) scale(1.1);
      opacity: 1;
    }
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes textGrow {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.3);
      opacity: 1;
    }
    100% {
      transform: scale(1);
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

`}</style>

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
     {/* ✅ ADD THIS BLOCKER 
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 199, 
        pointerEvents: 'all' 
      }} 
      onClick={(e) => e.stopPropagation()} 
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
      zIndex: 201  // ✅ ADD THIS - keeps content above blocker
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
          if (showStoryModal === 'suryakoti') {
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
     {/* ✅ ADD THIS BLOCKER 
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
      background: 'linear-gradient(135deg, #E3F2FD 0%, #5d5307ff 100%)',
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
    
 if (currentMissionSymbol === 'suryakoti') {
  // Reset Sun Collection Game (SunCollectionGameV1)
  sceneActions.updateState({ 
    phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE,
    sunCollectionStarted: true,
    collectedSuns: 0,
    sunCollectionCompleted: false,
    caveIllumination: 0,
    orbSuns: [],
    learnedWords: {  // ⭐ ADD: Temporarily mark as not learned
      ...sceneState.learnedWords,
      suryakoti: { learned: false, scene: 2 }
    },
    currentFocus: 'sun-collection'
  });

      
} else if (currentMissionSymbol === 'samaprabha') {
  // Reset Healing Touch Game (Dragging suns to children)
  sceneActions.updateState({ 
    phase: CAVE_PHASES.HEALING_ACTIVE,
    healingStarted: true,
    healedChildren: [],
    availableSuns: [
      { id: 1, x: 20, y: 30 },
      { id: 2, x: 50, y: 25 },
      { id: 3, x: 80, y: 35 }
    ],
    healingCompleted: false,
    childStates: [
      { id: 1, healed: false, scaredFace: scaredFace1, happyFace: happyFace1 },
      { id: 2, healed: false, scaredFace: scaredFace2, happyFace: happyFace2 },
      { id: 3, healed: false, scaredFace: scaredFace3, happyFace: happyFace3 }
    ],
    learnedWords: {  // ⭐ CRITICAL FIX: Temporarily mark as not learned
      ...sceneState.learnedWords,
      samaprabha: { learned: false, scene: 2 }
    },
    currentFocus: 'healing'
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
🐾 Save an Animal     
     </button>
          
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
  key={currentRescueWord} // ✅ ADD THIS LINE - Forces remount for each word
  show={showRescueModal}
  wordData={currentRescueWord ? RESCUE_CONFIGS[currentRescueWord] : null}
  onComplete={handleRescueComplete}
  profileName={profileName}
/>


<div style={{ filter: 'none' }}>
  <SymbolSidebar
    unlockedSymbols={{
      vakratunda: sceneState.learnedWords?.vakratunda?.learned || false,
      mahakaya: sceneState.learnedWords?.mahakaya?.learned || false,
      suryakoti: sceneState.learnedWords?.suryakoti?.learned || false,
      samaprabha: sceneState.learnedWords?.samaprabha?.learned || false,
      nirvighnam: false,
      kurumedeva: false,
      sarvakaryeshu: false,
      sarvada: false
    }}
    onSymbolClick={(symbolId) => {
      console.log(`Symbol clicked: ${symbolId}`);
    }}
  />
</div>


            {/* Confetti during card celebrations */}
            {showMagicalCard && (cardContent.title?.includes("Suryakoti") || cardContent.title?.includes("Samaprabha")) && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9998,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}>
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: `${Math.random() * 100}%`,
                      width: '10px',
                      height: '10px',
                      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'][Math.floor(Math.random() * 6)],
                      animation: `confettiFall ${2 + Math.random() * 3}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  />
                ))}
              </div>
            )}

      <style>{`
  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(720deg);
    }
  }
  
  /* ✅ NEW: Fix draggable cursor offset */
  .central-orb-sun:active {
    cursor: grabbing;
  }
  
  .central-orb-sun img {
    pointer-events: none;
    user-select: none;
  }
  
  /* ✅ NEW: Ensure orb stays centered on all screen sizes */
  .central-healing-orb {
    min-width: 200px;
    min-height: 200px;
  }
  
  @keyframes centralOrbPulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
    }
    50% { 
      box-shadow: 0 0 40px rgba(218, 165, 32, 0.4);
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
  

            `}</style>

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 Suryakoti fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'suryakoti-samaprabha', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { suryakoti: true, samaprabha: true },
                      learnedWords: sceneState.learnedWords || {},  // ← ADD THIS
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ SURYAKOTI: Completion saved and temp session cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* ==================== DISCOVERY 1: SURYAKOTI (Million Suns) ==================== */}
{/* ==================== DISCOVERY 1: SURYAKOTI (Million Suns) ==================== */}
{showDiscoveryFlip1 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="Surya Koti Uncovered!"
    celebrationText={""Gathering Light…"\n\nYou collected the light of many suns! Surya Koti means 'Like Ten Million Suns'— it's the brightest magic of all!"}
    celebrationImage={suryakotiCard}
    
    // STAGE 2: Vibrancy Power Reveal
    powerTitle="Vibrancy Power Unlocked!"
    powerText="You hold the brightest light! Use this power to bring energy and joy to everything you do—and every game you play."
    powerIcon={suryakotiSymbol}
    
    buttonText="Shine Bright!"
    onComplete={() => {
      console.log("Discovery 1: Suryakoti learned!");
      setShowDiscoveryFlip1(false);
      
      // Update learned words + move to Door 2
      sceneActions.updateState({ 
        phase: CAVE_PHASES.DOOR2_ACTIVE,
        learnedWords: {
          ...sceneState.learnedWords,
          suryakoti: { learned: true, scene: 2 }
        }
      });
    }}
    
    showSparkles={true}
  />
)}

{/* ==================== DISCOVERY 2: SAMAPRABHA (Equal Radiance) ==================== */}
{/* ==================== DISCOVERY 2: SAMAPRABHA (Equal Radiance) ==================== */}
{showDiscoveryFlip2 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="Samaprabha Revealed!"
    celebrationText={""Equal Radiance…"\n\nYou shared your light with everyone equally! Samaprabha means 'Equal Shine'— a magic of kindness that reaches all."}
    celebrationImage={samaprabhaCard}
    
    // STAGE 2: Kindness Power Reveal
    powerTitle="Kindness Power Unlocked!"
    powerText="Shine your light on everyone, no matter what! Your kindness makes the world a better, brighter place."
    powerIcon={samaprabhaSymbol}
    
    buttonText="Light the Way!"
    onComplete={() => {
      console.log("Discovery 2: Samaprabha learned!");
      setShowDiscoveryFlip2(false);
      
      // Update learned words + complete scene
      sceneActions.updateState({ 
        phase: CAVE_PHASES.COMPLETE,
        completed: true,
        learnedWords: {
          suryakoti: { learned: true, scene: 2 },
          samaprabha: { learned: true, scene: 2 }
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
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'linear-gradient(135deg, #FF6B35 0%, #FFA500 100%)',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '15px',
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.4rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    border: '3px solid #FFD700',
    textAlign: 'center',
    animation: 'slideDown 0.3s ease'
  }}>
    {resumeMessage}
  </div>
)}


            {/* Back Button */}
         {sceneState.welcomeShown && !showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Million Suns Chamber - Scene 2"
              sceneNumber={2}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
     discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha']}
containerType="journal"
containerImage={meaningJournal}
meaningCards={{
  vakratunda: { sanskrit: "वक्रतुण्ड", meaning: "Curved Trunk" },
  mahakaya: { sanskrit: "महाकाय", meaning: "Great Body" },
  suryakoti: { sanskrit: "सूर्यकोटि", meaning: "Million Suns" },
  samaprabha: { sanskrit: "समप्रभ", meaning: "Equal Radiance" }
}}
appImages={{
  vakratunda: appVakratunda,
  mahakaya: appMahakaya,
  suryakoti: appSuryakoti,
  samaprabha: appSamaprabha
}}
              nextSceneName="Sacred Cleansing Waters"
              sceneId="suryakoti-samaprabha"
              completionData={{
                stars: 8,
                  symbols: {},  // ← ADD: Empty symbols for Cave
                sanskritWords: { suryakoti: true, samaprabha: true },
                 learnedWords: sceneState.learnedWords || {},  // ← ADD: Scene learned words
  chants: { suryakoti: true, samaprabha: true },  // ← ADD: For CulturalProgressExtractor
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}

    // ADD THIS TO SceneCompletionCelebration:
        onReplay={() => {
  console.log('🔄 INSTANT REPLAY: Garden Adventure restart');
  setShowSceneCompletion(false);
  resetScene();
}}

        // ADD THIS TO SceneCompletionCelebration:
onContinue={() => {
  console.log('🔧 CONTINUE: Suryakoti scene to next scene');

  
  // 2. Save completion data - CHANT FORMAT
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'suryakoti-samaprabha', {
      completed: true,
      stars: 8,
      symbols: {},  // ← Cave scenes don't learn symbols
      sanskritWords: { suryakoti: true, samaprabha: true },
      learnedWords: sceneState.learnedWords || {},
      chants: { suryakoti: true, samaprabha: true }
    });
    
    GameStateManager.saveGameState('cave-of-secrets', 'suryakoti-samaprabha', {
      completed: true,
      stars: 8,
      sanskritWords: { suryakoti: true, samaprabha: true },
      learnedWords: sceneState.learnedWords || {}
    });
    
    console.log('✅ CONTINUE: Suryakoti completion data saved');
  }

  // 3. Set next scene for resume tracking
  setTimeout(() => {
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'sarvakaryeshu-sarvada', false, false);
    console.log('✅ CONTINUE: Next scene (nirvighnam-kurumedeva) set for resume tracking');
    
    onNavigate?.('scene-complete-continue');
  }, 100);
}}

onExploreZones={() => {
  setShowSceneCompletion(false);
  onNavigate?.('zone-welcome');
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
              onHintButtonClick={handleHintButtonClick}
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

export default SuryakotiScene;
