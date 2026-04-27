// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - V2 with Smart Components
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';

// Import scene management components (same as pond scene)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration'; // Enhanced version
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';


// UI Components (reuse from pond)
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
//import CleanZoneCompletionCelebration from '../../../../lib/components/celebration/CleanZoneCompletionCelebration';

// NEW: Smart Assembly Components
import SmartDropZone from '../../../../lib/components/interactive/SmartDropZone';
import SmartDraggableSymbol from '../../../../lib/components/interactive/SmartDraggableSymbol';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.png';

// Images - Ganesha Forms (from earlier images you showed)
import ganeshaStone from './assets/images/ganesha-stone.png';
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons (your existing shared symbols)
/*import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-new.png';
import symbolEarsColored from '../../shared/images/icons/symbol-ears-new.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-new.png';*/

// Images - Symbol Icons (your existing shared symbols)
import symbolMooshikaColored from './assets/images/symbol-mooshika-new.png';
import symbolModakColored from './assets/images/symbol-modak-new.png';
import symbolBellyColored from './assets/images/symbol-belly-new.png';
import symbolLotusColored from './assets/images/symbol-lotus-new.png';
import symbolTrunkColored from './assets/images/symbol-trunk-new.png';
import symbolEyesColored from './assets/images/symbol-eyes-new.png';
import symbolEarsColored from './assets/images/symbol-ears-new.png';
import symbolTuskColored from './assets/images/symbol-tusk-new.png';

// Coach image (reuse from pond)
import mooshikaCoach from "../pond/assets/images/mooshika-coach.png";

// Sacred Assembly Game Configuration
const SACRED_SYMBOLS = [
  { 
    id: 'mooshika', 
    name: 'Mooshika', 
    emoji: '🐭', 
    image: symbolMooshikaColored,
    blessing: "Mooshika, Ganesha's divine vehicle awakens! May wisdom guide your every journey, dear child.",
    bodyPart: 'base'
  },
  { 
    id: 'modak', 
    name: 'Modak', 
    emoji: '🍯', 
    image: symbolModakColored,
    blessing: "Ganesha's blessing hand awakens! May sweetness and abundance fill your life.",
    bodyPart: 'left-hand'
  },
  { 
    id: 'belly', 
    name: 'Belly', 
    emoji: '🫄', 
    image: symbolBellyColored,
    blessing: "Ganesha's sacred belly awakens! May you hold the universe's love within you.",
    bodyPart: 'belly'
  },
  { 
    id: 'lotus', 
    name: 'Lotus', 
    emoji: '🪷', 
    image: symbolLotusColored,
    blessing: "Ganesha's wisdom hand comes alive! May purity and enlightenment guide you.",
    bodyPart: 'right-hand'
  },
  { 
    id: 'trunk', 
    name: 'Trunk', 
    emoji: '🐘', 
    image: symbolTrunkColored,
    blessing: "Ganesha's mighty trunk awakens! May all obstacles be removed from your path.",
    bodyPart: 'trunk'
  },
  { 
    id: 'eyes', 
    name: 'Eyes', 
    emoji: '👁️', 
    image: symbolEyesColored,
    blessing: "Ganesha's divine eyes awaken! May you see truth in all things.",
    bodyPart: 'eyes'
  },
  { 
    id: 'ears', 
    name: 'Ears', 
    emoji: '👂', 
    image: symbolEarsColored,
    blessing: "Ganesha's sacred ears come alive! May you listen with wisdom and compassion.",
    bodyPart: 'ears'
  },
  { 
    id: 'tusk', 
    name: 'Tusk', 
    emoji: '🦷', 
    image: symbolTuskColored,
    blessing: "Ganesha's powerful tusk glows! May you break through any challenge with determination.",
    bodyPart: 'tusk'
  }
];

// Body part drop zone configurations
const BODY_PART_ZONES = [
  {
    id: 'eyes',
    acceptTypes: ['eyes'],
    position: { top: '30%', left: '40%', transform: 'translateX(-50%)', width: '120px', height: '60px' },
    hint: 'Divine Sight'
  },
  {
    id: 'ears', 
    acceptTypes: ['ears'],
    position: { top: '25%', left: '25%', width: '80px', height: '80px' },
    hint: 'Deep Listening'
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'], 
    position: { top: '35%', left: '40%', transform: 'translateX(-50%)', width: '100px', height: '120px' },
    hint: 'Removing Obstacles'
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    position: { top: '40%', right: '40%', width: '60px', height: '80px' },
    hint: 'Breaking Barriers'
  },
  {
    id: 'left-hand',
    acceptTypes: ['modak'],
    position: { top: '35%', left: '20%', width: '80px', height: '80px' },
    hint: 'Sweet Blessings'
  },
  {
    id: 'right-hand', 
    acceptTypes: ['lotus'],
    position: { top: '45%', right: '20%', width: '80px', height: '80px' },
    hint: 'Pure Wisdom'
  },
  {
    id: 'belly',
    acceptTypes: ['belly'],
    position: { top: '50%', left: '40%', transform: 'translateX(-50%)', width: '160px', height: '120px' },
    hint: 'Universe Within'
  },
  {
    id: 'base',
    acceptTypes: ['mooshika'], 
    position: { bottom: '25%', left: '60%', transform: 'translateX(-50%)', width: '120px', height: '80px' },
    hint: 'Divine Vehicle'
  }
];

// Ganesha transformation states
const GANESHA_STATES = {
  STONE: 'stone',
  AWAKENING: 'awakening', 
  DIVINE: 'divine',
  BLESSED: 'blessed'
};

const SYMBOL_POSITIONS = [
  // Top quadrant
  { top: '38%', left: '25%' },      // mooshika - top-left
  { top: '12%', left: '75%' },     // modak - top-right
  
  // Side quadrants  
  { top: '35%', left: '8%' },      // belly - middle-left
  { top: '20%', left: '86%' },     // lotus - middle-right (FIXED)
  
  // Lower-middle quadrants
  { top: '60%', left: '15%' },     // trunk - bottom-left
  { top: '55%', left: '85%' },     // eyes - bottom-right (FIXED)
  
  // Bottom quadrant
  { bottom: '15%', left: '30%' },  // ears - bottom-left  
  { bottom: '20%', left: '70%' }   // tusk - bottom-right (FIXED)
];

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  console.log('SacredAssemblyScene V2 props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        // Assembly game state
        placedSymbols: {},           // {eyes: true, trunk: true, ...}
        ganeshaState: GANESHA_STATES.STONE,
        currentDragSymbol: null,
        activeMagneticZone: null,
        symbolPositions: {},         // Track floating symbol positions
        
        // Audio/blessing state
        currentBlessing: null,
        blessingsHeard: [],
        finalBlessingShown: false,
        
        // Existing pattern (from pond scene)
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          // Start with all symbols from previous scenes
          mooshika: true,
          modak: true, 
          belly: true,
          lotus: true,
          trunk: true,
          eyes: true,
          ear: true,
          tusk: true
        },
        
        // Message flags
        welcomeShown: false,
        assemblyWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        
        // Reload system (same as pond)
        currentPopup: null,
        gameCoachState: null,
        isReloadingGameCoach: false,
        symbolDiscoveryState: null,
        sidebarHighlightState: null,
        showingCompletionScreen: false,
        playAgainRequested: false,
        showingZoneCompletion: false,  // ← ADD THIS LINE
        
        // Progress tracking
        stars: 0,
        completed: false,
        progress: {
          percentage: 0,
          starsEarned: 0,
          completed: false
        }
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <SacredAssemblyContent
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
  );
};

const SacredAssemblyContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('SacredAssemblyContent V2 render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });

  // GameCoach functionality (same as pond)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();
  
  // State management (similar to pond)
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  
  // Refs (same as pond)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const previousVisibilityRef = useRef(false);

  // Get profile name (same as pond)
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe timeout function (same as pond)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount (same as pond)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (same as pond)
useEffect(() => {
  console.log('🧹 ASSEMBLY: Cleaning GameCoach on scene entry');
  
  if (hideCoach) {
    hideCoach();
  }
  if (clearManualCloseTracking) {
    clearManualCloseTracking();
    console.log('✅ ASSEMBLY: Manual close tracking cleared');
  }
  
  // FORCE CLEAR after a delay too
  setTimeout(() => {
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
      console.log('✅ ASSEMBLY: Manual close tracking force cleared');
    }
  }, 1000);
}, []);

  // NEW: Progressive Ganesha awakening functions
  const getGaneshaOpacity = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    
    if (placedCount === 0) return 0;
    if (placedCount <= 2) return 0.15; // Very faint start
    if (placedCount <= 4) return 0.35; // Getting clearer  
    if (placedCount <= 6) return 0.6;  // Much more visible
    if (placedCount === 7) return 0.85; // Almost complete
    return 1; // Full divine radiance
  };

  const getGaneshaAwakeningClass = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    
    if (placedCount === 0) return 'sleeping';
    if (placedCount <= 2) return 'stirring';
    if (placedCount <= 4) return 'awakening';
    if (placedCount <= 6) return 'rising';
    if (placedCount === 7) return 'manifesting';
    return 'divine-radiance';
  };

  // GameCoach messages (following pond pattern)
  const gameCoachStoryMessages = [
  {
    id: 'welcome',
    message: `Welcome to the Sacred Summit, ${profileName}! You've collected all of Ganesha's sacred symbols. Now assemble them to awaken his divine form!`,
    timing: 500,
    condition: () => {
  console.log('🧪 ASSEMBLY Welcome Check:', {
    phase: sceneState?.phase,
    welcomeShown: sceneState?.welcomeShown,
    isReloadingGameCoach: sceneState?.isReloadingGameCoach,
    result: sceneState?.phase === 'initial' //&& !sceneState?.welcomeShown
  });
  return sceneState?.phase === 'initial' //&& !sceneState?.welcomeShown;
}
  },
    {
      id: 'assembly_wisdom',
      message: `Magnificent, ${profileName}! You're bringing Ganesha to life! Each symbol you place awakens his divine power!`,
      timing: 1000,
      condition: () => {
        const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
        console.log('🧪 ASSEMBLY_WISDOM DEBUG:', {
    placedCount,
    assemblyWisdomShown: sceneState?.assemblyWisdomShown,
    readyForWisdom: sceneState?.readyForWisdom,
    isReloadingGameCoach: sceneState?.isReloadingGameCoach,
    result: placedCount >= 3 && !sceneState?.assemblyWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
  });
        return placedCount >= 3 && !sceneState?.assemblyWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach;
      }
    },
    {
      id: 'mastery_wisdom',
      message: `Divine Child! You have awakened Ganesha completely! You are now a true keeper of ancient wisdom! The entire realm celebrates your achievement!`,
      timing: 1000,
      condition: () => {
        const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
         console.log('🧪 MASTERY_WISDOM DEBUG:', {
    placedCount,
    masteryShown: sceneState?.masteryShown,
    isReloadingGameCoach: sceneState?.isReloadingGameCoach,
    result: placedCount === 8 && !sceneState?.masteryShown && !sceneState?.isReloadingGameCoach
  });
        return placedCount === 8 && !sceneState?.masteryShown && !sceneState?.isReloadingGameCoach;
      }
    }
  ];

// COMPLETELY REWRITTEN RELOAD LOGIC - Handles all cases properly
useEffect(() => {
  if (!isReload || !sceneState) return;
  
  console.log('🔄 ASSEMBLY RELOAD: Starting reload sequence', {
    currentPopup: sceneState.currentPopup,
    gameCoachState: sceneState.gameCoachState,
    symbolDiscoveryState: sceneState.symbolDiscoveryState,
    sidebarHighlightState: sceneState.sidebarHighlightState,
    placedSymbols: sceneState.placedSymbols
  });

  // ✅ ENHANCED: Check for Play Again flag first
  const profileId = localStorage.getItem('activeProfileId');
  const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  const isFreshRestartAfterPlayAgain = (
    playAgainRequested === 'true' ||
    (sceneState.phase === 'initial' && 
     sceneState.completed === false && 
     sceneState.stars === 0 && 
     (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen))
  );
  
  if (isFreshRestartAfterPlayAgain) {
    console.log('🔄 ASSEMBLY RELOAD: Detected fresh restart after Play Again - clearing completion state');
    
    if (playAgainRequested === 'true') {
      localStorage.removeItem(playAgainKey);
      console.log('✅ CLEARED: Play Again storage flag');
    }
    
   // ✅ ENHANCED: Clear ALL blocking flags for Play Again
  sceneActions.updateState({ 
    isReloadingGameCoach: false,
    showingCompletionScreen: false,
    currentPopup: null,
    completed: false,
    phase: 'initial',
    welcomeShown: false,  // ← ADD THIS LINE
    // Reset message flags so GameCoach can show welcome
    assemblyWisdomShown: false,
    masteryShown: false,
    gameCoachState: null
  });
    return;
  }

  // IMMEDIATELY block GameCoach normal flow
  sceneActions.updateState({ isReloadingGameCoach: true });
  
  setTimeout(() => {
    // 1. HANDLE REGULAR POPUP STATES FIRST
    if (sceneState.currentPopup) {
      console.log('🔄 ASSEMBLY: Resuming popup:', sceneState.currentPopup);
      
      switch(sceneState.currentPopup) {  
        
        case 'zone_completion':
  console.log('🏆 ASSEMBLY: Resuming zone completion celebration');
  sceneActions.updateState({
    gameCoachState: null,  
    isReloadingGameCoach: false,
    phase: 'zone-complete',
    showingZoneCompletion: true,
    showingCompletionScreen: true,
    stars: 8,
    progress: {
      percentage: 100,
      starsEarned: 8,
      completed: true
    }
  });
  setTimeout(() => {
    setShowZoneCompletion(true);
  }, 500);
  return;

        case 'final_fireworks':
          console.log('🎆 ASSEMBLY: Resuming final fireworks');
          sceneActions.updateState({
            gameCoachState: null,  
            isReloadingGameCoach: false,
            phase: 'complete',
            stars: 8,
            progress: {
              percentage: 100,
              starsEarned: 8,
              completed: false  // ← Keep false during fireworks
            }
          });
          setTimeout(() => {
    setShowZoneCompletion(true);  // ← CHANGE: Show zone completion instead
          }, 500);

// ← ENHANCED: Set up proper fireworks→zone completion chain for reload
  setTimeout(() => {
    console.log('🎆 RELOAD: Fireworks timeout - transitioning to zone completion');
    
    // Set zone completion state immediately
    sceneActions.updateState({
      showingZoneCompletion: true,
      currentPopup: null,
      phase: 'zone-complete'
    });
    
    // Show zone completion UI
    if (!showZoneCompletion) {
      setShowZoneCompletion(true);
    }
  }, 5500);  // ← Slightly shorter than fireworks duration
  return;}
      return;
    }

  // 2. HANDLE COMPLETION SCREEN RELOAD
else if (sceneState.showingCompletionScreen) {
  console.log('🔄 ASSEMBLY: Resuming completion screen');
  setShowZoneCompletion(true);
  sceneActions.updateState({ isReloadingGameCoach: false });
}

// 2.5. ENHANCED: Zone Completion Reload Detection
else if (
    sceneState.currentPopup === 'zone_completion' ||  // ← ADD THIS LINE
  sceneState.showingZoneCompletion || 
    sceneState.showingCompletionScreen ||  // ← ADD THIS LINE
      sceneState.phase === 'zone-complete' ||  // ← ADD THIS LINE

  (sceneState.completed === true && sceneState.stars === 8 && sceneState.phase === 'complete' && 
   Object.keys(sceneState.placedSymbols || {}).length === 8 && 
   !sceneState.currentPopup && !sceneState.currentBlessing)  // ← ADD !sceneState.currentBlessing
) {
  console.log('🏆 ASSEMBLY RELOAD: Detected zone completion state - resuming zone completion', {
    showingZoneCompletion: sceneState.showingZoneCompletion,
    completed: sceneState.completed,
    stars: sceneState.stars,
    phase: sceneState.phase,
    placedSymbols: Object.keys(sceneState.placedSymbols || {}).length
  });
  
  // Immediately set zone completion state
  sceneActions.updateState({ 
    isReloadingGameCoach: false,
    showingCompletionScreen: true,
    showingZoneCompletion: true,
    currentPopup: null,
    phase: 'complete',
    completed: true,
    stars: 8
  });
  
  // Show zone completion with slight delay
  setTimeout(() => {
    console.log('🏆 ASSEMBLY: Resuming zone completion celebration');
    setShowZoneCompletion(true);
  }, 100);
  return;
}
    
    // 3. HANDLE GAMECOACH STATES - COMPLETELY REWRITTEN
    else if (sceneState.gameCoachState) {
      console.log('🔄 ASSEMBLY: Resuming GameCoach:', sceneState.gameCoachState);
      
      // DON'T CALL showMessage HERE - instead set readyForWisdom and let normal flow handle it
      switch(sceneState.gameCoachState) {
        case 'assembly_wisdom':
          console.log('🎯 ASSEMBLY: Setting up assembly wisdom resume');
          sceneActions.updateState({
            readyForWisdom: true,  // Let normal flow trigger
            assemblyWisdomShown: false,  // Reset flag so message can show again
            isReloadingGameCoach: false  // Allow normal flow
          });
          break;
        
        case 'mastery_wisdom':
          console.log('🏆 ASSEMBLY: Setting up mastery wisdom resume');
          sceneActions.updateState({
            masteryShown: false,  // Reset flag so message can show again
            isReloadingGameCoach: false  // Allow normal flow
            // Don't clear gameCoachState - let normal flow handle it
          });
          break;
      }
    }
    
    // 4. NO SPECIAL RELOAD NEEDED
    else {
      console.log('🔄 ASSEMBLY: No special reload needed, clearing flags');
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
    }
    
  }, 500);
  
}, [isReload]);

  // GameCoach effect (same pattern as pond)
useEffect(() => {
  console.log('🔍 ASSEMBLY GameCoach Effect Running:', {
    sceneState: !!sceneState,
    showMessage: !!showMessage,
    phase: sceneState?.phase,
    welcomeShown: sceneState?.welcomeShown,
    isReloadingGameCoach: sceneState?.isReloadingGameCoach
  });
  
  if (!sceneState || !showMessage) {
    console.log('🚫 ASSEMBLY: Missing sceneState or showMessage');
    return;
  }
    if (sceneState.isReloadingGameCoach) {
      console.log('🚫 GameCoach blocked: Reload in progress');
      return;
    }

    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );

    if (matchingMessage) {
   // TEMPORARILY COMMENT OUT THE ENTIRE CHECK
// const messageAlreadyShown = ...
// if (messageAlreadyShown) {
//   console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
//   return;
// }

 // ✅ ADD THESE LINES HERE (after line 643, before line 650)
  console.log(`🔒 IMMEDIATE: Marking ${matchingMessage.id} as shown to prevent loops`);
  switch (matchingMessage.id) {
    case 'welcome':
      sceneActions.updateState({ welcomeShown: true });
      break;
    case 'assembly_wisdom':
      sceneActions.updateState({ assemblyWisdomShown: true });
      break;
    case 'mastery_wisdom':
      sceneActions.updateState({ masteryShown: true });
      break;
  }
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing divine light first, then ${matchingMessage.id} message`);
        
        setShowSparkle('divine-light');
        
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 8000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: getMessageType(matchingMessage.id),
              immediate: true  // ← ADD THIS LINE - bypasses queue and manual close checks
          });
        }, 2000);
      }, matchingMessage.timing);

      // Mark message as shown
      switch (matchingMessage.id) {
        case 'welcome':
          sceneActions.updateState({ welcomeShown: true });
          break;
        case 'assembly_wisdom':
          sceneActions.updateState({
            assemblyWisdomShown: true,
            readyForWisdom: false,
            gameCoachState: 'assembly_wisdom',
            lastGameCoachTime: Date.now()
          });
          break;
        case 'mastery_wisdom':
          sceneActions.updateState({
            masteryShown: true,
            gameCoachState: 'mastery_wisdom', 
            lastGameCoachTime: Date.now()
          });
          // Start final celebration sequence
          safeSetTimeout(() => {
            showFinalCelebration();
          }, 3000);
          break;
      }

      return () => clearTimeout(timer);
    }
}, [
  sceneState?.phase || 'initial',
  sceneState?.placedSymbols || {},
  sceneState?.welcomeShown || false,
  sceneState?.assemblyWisdomShown || false,
  sceneState?.masteryShown || false,
  sceneState?.readyForWisdom || false,
  sceneState?.isReloadingGameCoach || false,
  sceneState?.gameCoachState || null,
  showMessage
]);

  // Helper function for message colors
  const getMessageType = (messageId) => {
    switch(messageId) {
      case 'welcome': return 'welcome';
      case 'assembly_wisdom': return 'wisdom1';
      case 'mastery_wisdom': return 'wisdom3';
      default: return 'welcome';
    }
  };

  // Handle symbol placement - CORE GAME LOGIC
  const handleSymbolPlacement = ({ id, data }) => {
    if (!sceneState || !sceneActions) return;
    
    console.log(`🎯 Symbol ${id} placed correctly!`);
    
    // Hide active hints
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    // Mark symbol as placed
    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [id]: true
    };
    
    // Get symbol info for blessing
    const symbolInfo = SACRED_SYMBOLS.find(s => s.id === id);
    
    // Calculate progress
    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);
    
    // Update Ganesha state based on placed count
    let newGaneshaState = GANESHA_STATES.STONE;
    if (placedCount >= 6) newGaneshaState = GANESHA_STATES.DIVINE;
    else if (placedCount >= 3) newGaneshaState = GANESHA_STATES.AWAKENING;
    
    // Update scene state
    sceneActions.updateState({
      placedSymbols: newPlacedSymbols,
      ganeshaState: newGaneshaState,
      currentDragSymbol: null,
      activeMagneticZone: null,
      stars: placedCount,
      progress: {
        percentage: percentage,
        starsEarned: placedCount,
        completed: placedCount === 8
      }
    });

    // Show blessing text
    //showBlessing(symbolInfo.blessing);
    
   // Create dramatic placement sparkles
setShowSparkle(`symbol-placed-${id}`);
safeSetTimeout(() => setShowSparkle(null), 3000);

// Add zone-specific sparkle effect
const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(id));
if (zone) {
  const sparkleContainer = document.createElement('div');
  sparkleContainer.style.cssText = `
    position: absolute;
    top: ${zone.position.top || 'auto'};
    left: ${zone.position.left || 'auto'};
    right: ${zone.position.right || 'auto'};
    bottom: ${zone.position.bottom || 'auto'};
    width: ${zone.position.width};
    height: ${zone.position.height};
    pointer-events: none;
    z-index: 150;
    ${zone.position.transform ? `transform: ${zone.position.transform};` : ''}
  `;
  
  document.querySelector('.ganesha-assembly-container').appendChild(sparkleContainer);
  
  // Remove after 3 seconds
  safeSetTimeout(() => {
    if (sparkleContainer.parentNode) {
      sparkleContainer.remove();
    }
  }, 3000);
}
    
    // Check for special milestones
    if (placedCount === 3) {
      // First awakening
      safeSetTimeout(() => {
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'assembly_wisdom'
        });
      }, 2000);
} else if (placedCount === 8) {
  console.log('🎯 MANUAL COMPLETION: Bypassing GameCoach for now');
  
  safeSetTimeout(() => {
    // Skip GameCoach and go straight to celebration
    showFinalCelebration();
  }, 2000);

    }
  };

  // Show blessing text - ENHANCED VERSION
  const showBlessing = (blessingText) => {
    console.log(`🙏 Blessing: ${blessingText}`);
    
    const blessingElement = document.createElement('div');
    blessingElement.style.cssText = `
      position: fixed;
      bottom: 150px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(145deg, rgba(255,215,0,0.95), rgba(255,193,7,0.9));
      color: #2C1810;
      padding: 25px 35px;
      border-radius: 25px;
      font-size: 1.3rem;
      font-weight: bold;
      text-align: center;
      z-index: 1500;
      max-width: 85%;
      box-shadow: 0 8px 25px rgba(255,215,0,0.4);
      border: 3px solid rgba(255,255,255,0.8);
      animation: blessingFlow 5s ease forwards;
      font-family: 'Comic Sans MS', cursive;
      text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
    `;
    
    // Enhanced animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blessingFlow {
        0% { 
          opacity: 0; 
          transform: translateX(-50%) translateY(30px) scale(0.8); 
        }
        15%, 85% { 
          opacity: 1; 
          transform: translateX(-50%) translateY(0) scale(1); 
        }
        100% { 
          opacity: 0; 
          transform: translateX(-50%) translateY(-20px) scale(0.9); 
        }
      }
    `;
    document.head.appendChild(style);
    
    blessingElement.textContent = blessingText;
    document.body.appendChild(blessingElement);
    
    // Remove after animation
    safeSetTimeout(() => {
      blessingElement.remove();
      style.remove();
    }, 5000);
  };

const showFinalCelebration = () => {
  console.log('🎆 STARTING showFinalCelebration');

  
  // ✅ SIMPLE: Just save with GameStateManager instead
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
      completed: true,
      stars: 8,
      symbols: { all: true },
      phase: 'complete',
      timestamp: Date.now()
    });
    console.log('✅ Zone completion saved');
  }
  
  const newState = {
    currentPopup: 'final_fireworks',
    showingCompletionScreen: true,
    showingZoneCompletion: true,
    phase: 'complete',
    stars: 8,
    progress: {
      percentage: 100,
      starsEarned: 8,
      completed: true
    }
  };
  
  console.log('🎆 SETTING STATE:', newState);
  sceneActions.updateState(newState);
  
  // Add a check to see if state was actually set
  setTimeout(() => {
    console.log('🎆 STATE CHECK after 100ms:', {
      currentPopup: sceneState?.currentPopup,
      showingZoneCompletion: sceneState?.showingZoneCompletion,
      phase: sceneState?.phase,
      stars: sceneState?.stars
    });
  }, 100);
  
  setTimeout(() => {
    setShowZoneCompletion(true);
  }, 1000);
};

  // Hint system configuration
  const getHintConfigs = () => [
    {
      id: 'assembly-hint',
      message: 'Drag the symbols to the correct parts of Ganesha!',
      explicitMessage: 'Each symbol belongs to a specific part of Ganesha. Try dragging them to see where they fit!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const placedCount = Object.keys(sceneState.placedSymbols || {}).length;
        return placedCount < 3 && !showMagicalCard && !isVisible;
      }
    }
  ];

  // Render methods
  if (!sceneState) {
    return <div className="loading">Loading sacred assembly...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="sacred-assembly-container">
          {/* Sacred Mountain Background */}
          <div 
            className="sacred-background" 
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Progress Display - Sleek counter like pond scene */}
            <div className="assembly-progress">
              <div className="progress-text">
                <span style={{ fontSize: '16px' }}>🏔️</span>
                {Object.keys(sceneState.placedSymbols || {}).length}/8 symbols
              </div>
              <div 
                className="assembly-progress-fill"
                style={{
                  width: `${(Object.keys(sceneState.placedSymbols || {}).length / 8) * 100}%`
                }}
              />
            </div>

            {/* Ganesha Sacred Form Container */}
            <div className="ganesha-assembly-container">
              {/* Ganesha Progressive Awakening */}
              <div className="ganesha-awakening-container">
                {/* Base faint outline - always visible */}
                <img 
                  src={ganeshaStone}
                  alt="Ganesha Outline"
                  className="ganesha-outline"
                  style={{
                    opacity: 0.2,
                    filter: 'brightness(1.5) contrast(0.8)'
                  }}
                />
                
                {/* Progressive divine form */}
                <img 
                  src={ganeshaDivine}
                  alt="Ganesha Divine Form"
                  className={`ganesha-divine ${getGaneshaAwakeningClass()}`}
                 style={{
  position: 'absolute',
  top: '10%',           // ← ADD THIS
  left: '10%',          // ← ADD THIS  
  transform: 'translateX(-50%)',  // ← ADD THIS
  width: '90%',         // ← CHANGE TO 60%
  height: '90%',        // ← CHANGE TO 60%
                    opacity: getGaneshaOpacity(),
                    transition: 'all 1s ease'
                  }}
                />
              </div>

              {/* SMART DROP ZONES - Only appear when correct symbol is dragged */}
              {BODY_PART_ZONES.map(zone => (
                <SmartDropZone
                  key={zone.id}
                  id={zone.id}
                  acceptTypes={zone.acceptTypes}
                  currentDragSymbol={sceneState?.currentDragSymbol}
                  onDrop={handleSymbolPlacement}
                  position={zone.position}
                  hint={zone.hint}
                  className={`${zone.id}-zone`}
                />
              ))}
{/* Placed Symbol Sparkles (instead of visible symbols) */}
{Object.keys(sceneState.placedSymbols || {}).map(symbolId => {
  const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(symbolId));
  
  return (
    <div
      key={`sparkle-${symbolId}`}
      className="placed-symbol-sparkle"
      style={{
        position: 'absolute',
        ...zone.position,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 60
      }}
    >
      <SparkleAnimation
        type="star"
        count={8}
        color="#FFD700"
        size={4}
        duration={3000}
        fadeOut={false}
        area="contained"
        key={`sparkle-${symbolId}-${Date.now()}`}
      />
    </div>
  );
})}
            </div>

            {/* SMART FLOATING SYMBOLS - Enhanced with smart behavior */}
            {SACRED_SYMBOLS.map((symbol, index) => (
              <SmartDraggableSymbol
                key={symbol.id}
                symbol={symbol}
                position={SYMBOL_POSITIONS[index]}
                isPlaced={sceneState.placedSymbols?.[symbol.id]}
                currentDragSymbol={sceneState?.currentDragSymbol}
                onDragStart={(id) => {
                  console.log(`🚀 SMART DRAG START: ${id}`);
                  sceneActions.updateState({ currentDragSymbol: id });
                }}
                onDragEnd={() => {
                  console.log(`🏁 SMART DRAG END`);
                  // Delay cleanup to allow drop completion
                  setTimeout(() => {
                    sceneActions.updateState({ 
                      currentDragSymbol: null,
                      activeMagneticZone: null 
                    });
                  }, 150);
                }}
              />
            ))}

            {/* Divine light effect for GameCoach entrance */}
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

            {/* Symbol placement sparkles */}
            {showSparkle?.startsWith('symbol-placed-') && (
              <div className="symbol-placement-sparkles">
                <SparkleAnimation
                  type="star"
                  count={20}
                  color="#FFD700"
                  size={8}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

          {/* Sacred Orbs Effect (replaces fireworks) */}
{showSparkle === 'final-fireworks' && (
  <RotatingOrbsEffect
    show={true}
    duration={9000}
    symbolImages={{
      mooshika: symbolMooshikaColored,
      modak: symbolModakColored,
      belly: symbolBellyColored,
      lotus: symbolLotusColored,
      trunk: symbolTrunkColored,
      eyes: symbolEyesColored,
      ears: symbolEarsColored,
      tusk: symbolTuskColored
    }}
    ganeshaImage={ganeshaDivine}
    playerName={profileName}
    onComplete={() => {
      console.log('🎯 Orb effect complete');
      setShowSparkle(null);
      
      // Save completion data
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
          completed: true,
          stars: 8,
          symbols: { all: true },
          phase: 'complete',
          timestamp: Date.now()
        });
        
        ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'final-scene', {
          completed: true,
          stars: 8,
          symbols: { all: true }
        });
        
        localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_final-scene`);
        SimpleSceneManager.clearCurrentScene();
        console.log('✅ FINAL SCENE: Completion saved');
      }
      
      // Show scene completion
      setShowSceneCompletion(true);
    }}
  />
)}

       {/* Updated COMPLETE V2 button for RotatingOrbsEffect */}
<div style={{
  position: 'fixed',
  top: '40px',
  right: '40px',
  zIndex: 9999,
  background: 'purple',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🧪 ASSEMBLY V2 COMPLETION TEST CLICKED - UPDATED FOR ORBS');
  
  // Mark all symbols as placed
  const allPlaced = {};
  SACRED_SYMBOLS.forEach(symbol => {
    allPlaced[symbol.id] = true;
  });
  
  // Set completion state
  sceneActions.updateState({
    placedSymbols: allPlaced,
    ganeshaState: GANESHA_STATES.DIVINE,
    phase: 'complete',
    completed: true,
    stars: 8,
    progress: {
      percentage: 100,
      starsEarned: 8,
      completed: true
    },
    welcomeShown: true,
    assemblyWisdomShown: true,
    masteryShown: false, // Will trigger final message
    currentPopup: null,
    gameCoachState: null,
    isReloadingGameCoach: false
  });
  
  // Clear UI states
  setShowSparkle(null);
  setShowMagicalCard(false);
  setShowSceneCompletion(false);
  
  // ✅ NEW: Trigger RotatingOrbsEffect instead of old showFinalCelebration
  setTimeout(() => {
    console.log('🌟 COMPLETE V2: Triggering RotatingOrbsEffect');
    setShowSparkle('final-fireworks'); // This should trigger RotatingOrbsEffect
  }, 1000);
}}>
  COMPLETE V2
</div>

// Add this debug button temporarily
<div style={{
  position: 'fixed',
  top: '40px',
  left: '20px',
  zIndex: 9999,
  background: 'green',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px'
}} onClick={() => {
  console.log('🔄 RESET: Clearing welcomeShown flag');
  sceneActions.updateState({ 
    welcomeShown: false,
    isReloadingGameCoach: false,
    gameCoachState: null 
  });
}}>
  RESET WELCOME
</div>

<div style={{
  position: 'fixed',
  top: '120px',
  left: '20px',
  zIndex: 9999,
  background: 'orange',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px'
}} onClick={() => {
  console.log('🧹 CLEARING: Manual close tracking');
  if (clearManualCloseTracking) {
    clearManualCloseTracking();
    console.log('✅ Manual close tracking cleared');
  }
  
  // Also try direct showMessage test
  if (showMessage) {
    showMessage('DIRECT TEST MESSAGE!', {
      duration: 5000,
      source: 'debug',
      id: 'unique-test-' + Date.now()
    });
  }
}}>
  CLEAR & TEST
</div>

            {/* Start Fresh button */}
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#FF4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
              border: '2px solid white'
            }} onClick={() => {
              if (confirm('Start this scene from the beginning? You will lose current progress.')) {
                console.log('🔄 ASSEMBLY V2 EMERGENCY RESTART');
                
                // Clear all UI states
                setShowSparkle(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                
                // Reset scene state
                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    currentDragSymbol: null,
                    activeMagneticZone: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    
                    // Clear message flags
                    welcomeShown: false,
                    assemblyWisdomShown: false,
                    masteryShown: false,
                    readyForWisdom: false,
                    
                    // Clear popup states
                    currentPopup: null,
                    gameCoachState: null,
                    isReloadingGameCoach: false,
                    lastGameCoachTime: 0,
                    
                    // Reset progress
                    stars: 0,
                    completed: false,
                    progress: {
                      percentage: 0,
                      starsEarned: 0,
                      completed: false
                    }
                  });
                }, 100);
                
                if (hideCoach) {
                  hideCoach();
                }
              }
            }}>
              🔄 Start Fresh
            </div>
          </div>

          {/* DEBUG ONLY: Clear LocalStorage - Set to false when not needed */}
{true && (  // ← CHANGE TO false TO HIDE
  <div style={{
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    zIndex: 9999,
    background: '#DC143C',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)',
    border: '1px solid white',
    opacity: 0.8  // ← Subtle debug appearance
  }} onClick={() => {
    console.log('🗑️ DEBUG: Clearing localStorage');
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ DEBUG: Storage cleared');
    
    // No alert in debug mode - just console
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }}>
    🗑️ DEBUG
  </div>
)}

          {/* Progressive Hint System */}
          <ProgressiveHintSystem
            ref={progressiveHintRef}
            sceneId={sceneId}
            sceneState={sceneState}
            hintConfigs={getHintConfigs()}
            characterImage={mooshikaCoach}
            initialDelay={30000}
            hintDisplayTime={10000}
            position="bottom-right"
            iconSize={60}
            zIndex={2000}
            onHintShown={(level) => {
              console.log(`Assembly V2 hint level ${level} shown`);
              setHintUsed(true);
            }}
            enabled={true}
          />

          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              console.log('🧹 HOME: Cleaning GameCoach before navigation');
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`Great progress, ${profileName}!`);
              if (hideCoach) hideCoach();
              setShowCulturalCelebration(true);
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              console.log('🧹 ZONES: Cleaning GameCoach before navigation');
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

          {/* Minimized Symbol Sidebar 
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            gap: '5px'
          }}>
            {Object.keys(sceneState.discoveredSymbols || {}).map(symbolId => (
              <div key={symbolId} style={{
                width: '25px',
                height: '25px',
                background: 'rgba(255,215,0,0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ✓
              </div>
            ))}
          </div>

        

{/* Enhanced Scene Completion with Final Scene Buttons */}
<SceneCompletionCelebration
  show={showSceneCompletion}
  sceneName="Symbol Mountain"
  sceneNumber={4}
  totalScenes={4}
  starsEarned={8}
  totalStars={8}
  discoveredSymbols={Object.keys(sceneState.discoveredSymbols || {})}
  symbolImages={{
    mooshika: symbolMooshikaColored,
    modak: symbolModakColored,
    belly: symbolBellyColored,
    lotus: symbolLotusColored,
    trunk: symbolTrunkColored,
    eyes: symbolEyesColored,
    ear: symbolEarsColored,
    tusk: symbolTuskColored
  }}
  sceneId="final-scene"
  completionData={{
    stars: 8,
    symbols: { 
      mooshika: true, lotus: true, trunk: true, eyes: true,
      ears: true, tusk: true, modak: true, belly: true 
    },
    completed: true,
    totalStars: 8
  }}
  onComplete={onComplete}  // ← Saves scene data for ZoneWelcome
  childName={profileName}
  isFinalScene={true}      // ← Shows final scene buttons
  
  // Final scene button handlers
  onExploreZones={() => {
    console.log('🗺️ Explore other zones');
    setShowSceneCompletion(false);
    onNavigate?.('zones');
  }}
  //onViewProgress={() => {
    //console.log('📊 View progress');
    //setShowSceneCompletion(false);
    //onNavigate?.('progress');
 // }}
  onHome={() => {
    console.log('🏠 Home');
    setShowSceneCompletion(false);
    onNavigate?.('zone-welcome');
  }}
  onReplay={() => {
    console.log('🔄 Final scene replay');
    setShowSceneCompletion(false);
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      localStorage.setItem(`play_again_${profileId}_${zoneId}_${sceneId}`, 'true');
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }}
/>
          {/* Cultural Celebration Modal */}
          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SacredAssemblyScene;
