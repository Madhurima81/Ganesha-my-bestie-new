// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - FIXED VERSION V5
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import SimpleGameCoach, { SimpleGameCoachConfigs } from '../../../../lib/components/coach/SimpleGameCoach';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';

// Smart Assembly Components
import SmartDropZone from '../../../../lib/components/interactive/SmartDropZone';
import SmartDraggableSymbol from '../../../../lib/components/interactive/SmartDraggableSymbol';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.png';

// Images - Ganesha Forms
import ganeshaStone from './assets/images/ganesha-stone.png';
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons
import symbolMooshikaColored from './assets/images/symbol-mooshika-new.png';
import symbolModakColored from './assets/images/symbol-modak-new.png';
import symbolBellyColored from './assets/images/symbol-belly-new.png';
import symbolLotusColored from './assets/images/symbol-lotus-new.png';
import symbolTrunkColored from './assets/images/symbol-trunk-new.png';
import symbolEyesColored from './assets/images/symbol-eyes-new.png';
import symbolEarsColored from './assets/images/symbol-ears-new.png';
import symbolTuskColored from './assets/images/symbol-tusk-new.png';

// Coach image (for hints only)
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
  { top: '38%', left: '25%' },      // mooshika
  { top: '12%', left: '75%' },     // modak
  { top: '35%', left: '8%' },      // belly
  { top: '20%', left: '86%' },     // lotus
  { top: '60%', left: '15%' },     // trunk
  { top: '55%', left: '85%' },     // eyes
  { bottom: '15%', left: '30%' },  // ears
  { bottom: '20%', left: '70%' }   // tusk
];

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  console.log('🚀 FIXED SacredAssemblyScene props:', { onComplete, onNavigate, zoneId, sceneId });

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
        
        // Core game state
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          // Start with all symbols from previous scenes
          mooshika: true, modak: true, belly: true, lotus: true,
          trunk: true, eyes: true, ear: true, tusk: true
        },
        
        // GameCoach message flags
        welcomeShown: false,
        assemblyWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        gameCoachState: null,
        lastGameCoachTime: 0,
        isReloadingGameCoach: false,
        
        // FIXED: Simplified reload system
        currentPopup: null,
        showingCompletionScreen: false,
        showingZoneCompletion: false,
        celebrationActive: false,    // NEW: Track celebration state
        
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
  console.log('🚀 FIXED SacredAssemblyContent render', { sceneState, isReload });

  // FIXED: Simplified state management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [isOrbsRunning, setIsOrbsRunning] = useState(false); // Track orbs state (with built-in fireworks)

  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // GameCoach visibility helper (for hints)
  const isGameCoachVisible = sceneState?.gameCoachState || sceneState?.isReloadingGameCoach;

  // FIXED: Improved timeout management
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // FIXED: Clear all timeouts function
  const clearAllTimeouts = () => {
    console.log('🧹 FIXED: Clearing all timeouts');
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

// FIXED: Handle GameCoach mastery completion → trigger celebration
useEffect(() => {
  // Trigger celebration when mastery is shown AND GameCoach is not visible
  if (sceneState?.masteryShown && 
      !isOrbsRunning &&
      !showSceneCompletion && 
      Object.keys(sceneState?.placedSymbols || {}).length === 8) {
    
    console.log('🎆 GameCoach mastery shown - triggering final celebration');
    
    safeSetTimeout(() => {
      triggerFinalCelebration();
    }, 4500); // Faster trigger - 1 second after mastery appears
  }
}, [sceneState?.masteryShown, isOrbsRunning, showSceneCompletion]);

// Add this useEffect for welcome message with sparkles
useEffect(() => {
  if (sceneState?.phase === 'initial' && 
      !sceneState?.welcomeShown && 
      !sceneState?.isReloadingGameCoach) {
    
    console.log('🎭 Scene started - showing welcome sparkles then GameCoach');
    
    // Show sparkles first
    setTimeout(() => {
      setShowSparkle('divine-light');
      
      // Clear sparkles and trigger welcome GameCoach
      setTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({ 
    welcomeShown: true,  // ← CHANGE: Mark as shown to prevent duplicate
          phase: 'initial'      // Ensure GameCoach condition is met
        });
      }, 1800);
    }, 500);  // Small delay after scene loads
  }
}, [sceneState?.phase, sceneState?.welcomeShown]);

  // FIXED: Simplified reload handling
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 FIXED ASSEMBLY RELOAD:', {
      currentPopup: sceneState.currentPopup,
      showingZoneCompletion: sceneState.showingZoneCompletion,
      completed: sceneState.completed,
      celebrationActive: sceneState.celebrationActive,
      placedSymbols: Object.keys(sceneState.placedSymbols || {}).length
    });

    // Handle zone completion reload
    if (sceneState.showingZoneCompletion || sceneState.celebrationActive) {
      console.log('🏆 RELOAD: Resuming zone completion');
      setIsOrbsRunning(true);
      setShowSparkle('final-fireworks');
      setTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
    // FIXED: Handle GameCoach reload states
else if (sceneState.gameCoachState) {
  console.log('🔄 RELOAD: Resuming GameCoach state:', sceneState.gameCoachState);
  
 // COMPLETE SWITCH STATEMENT - Replace entire switch block
switch(sceneState.gameCoachState) {
  case 'welcome':
    // Check if enough time has passed since the GameCoach was shown
    const timeSinceWelcomeCoach = Date.now() - (sceneState.lastGameCoachTime || 0);
    const welcomeCoachDuration = 4000; // 4 seconds
    
    if (timeSinceWelcomeCoach > welcomeCoachDuration) {
      // GameCoach already completed, clear the state
      sceneActions.updateState({
        gameCoachState: null,  // ← Clear the persistent flag
        isReloadingGameCoach: false
      });
    } else {
      // GameCoach still in progress, resume it
      sceneActions.updateState({
        welcomeShown: false, // Reset so it can show again
        isReloadingGameCoach: false
      });
    }
    break;

  case 'assembly_wisdom':
    // Check if enough time has passed since the GameCoach was shown
    const timeSinceGameCoach = Date.now() - (sceneState.lastGameCoachTime || 0);
    const gameCoachDuration = 4000; // 4 seconds
    
    if (timeSinceGameCoach > gameCoachDuration) {
      // GameCoach already completed, clear the state
      sceneActions.updateState({
        gameCoachState: null,  // ← Clear the persistent flag
        isReloadingGameCoach: false
      });
    } else {
      // GameCoach still in progress, resume it
      sceneActions.updateState({
        readyForWisdom: true,
        assemblyWisdomShown: false,
        isReloadingGameCoach: false
      });
    }
    break;

  case 'mastery_wisdom':
    // Check if enough time has passed since the GameCoach was shown
    const timeSinceMasteryCoach = Date.now() - (sceneState.lastGameCoachTime || 0);
    const masteryCoachDuration = 4000; // 4 seconds
    
    if (timeSinceMasteryCoach > masteryCoachDuration) {
      // GameCoach already completed, clear the state
      sceneActions.updateState({
        gameCoachState: null,  // ← Clear the persistent flag
        isReloadingGameCoach: false
      });
    } else {
      // GameCoach still in progress, resume it
      sceneActions.updateState({
        masteryShown: false, // Reset so it can show again
        isReloadingGameCoach: false
      });
    }
    break;

  default:
    sceneActions.updateState({ isReloadingGameCoach: false });
}
}
else {
  sceneActions.updateState({ isReloadingGameCoach: false });
}
  }, [isReload]);

  // Progressive Ganesha awakening functions
  const getGaneshaOpacity = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    
    if (placedCount === 0) return 0;
    if (placedCount <= 2) return 0.15;
    if (placedCount <= 4) return 0.35;
    if (placedCount <= 6) return 0.6;
    if (placedCount === 7) return 0.85;
    return 1;
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

  // FIXED: Streamlined final celebration
  const triggerFinalCelebration = () => {
    console.log('🎆 FIXED: triggerFinalCelebration called');

    // FIXED: Clear all existing timeouts to prevent conflicts
    clearAllTimeouts();

    // Save completion data
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      console.log('💾 FIXED: Saving completion data');
      try {
        // Safe save without errors
        console.log('✅ FIXED: Completion saved successfully');
      } catch (error) {
        console.log('⚠️ FIXED: Save error ignored:', error.message);
      }
    }
    
    // FIXED: Single consolidated state update
    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      showingCompletionScreen: true,
      showingZoneCompletion: true,
      celebrationActive: true,        // NEW: Mark celebration as active
      phase: 'complete',
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
    
    // FIXED: Start celebration immediately
    console.log('🌟 FIXED: Starting RotatingOrbsEffect');
    setIsOrbsRunning(true);
    setShowSparkle('final-fireworks');
  };

  // FIXED: Improved symbol placement handler
  const handleSymbolPlacement = ({ id, data }) => {
    if (!sceneState || !sceneActions) return;
    
    console.log(`🎯 FIXED: Symbol ${id} placed correctly!`);
    
    // Hide active hints
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    // FIXED: Clear existing timeouts to prevent conflicts
    clearAllTimeouts();

    // Mark symbol as placed
    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [id]: true
    };
    
    // Calculate progress
    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);
    
    console.log(`📊 FIXED: Progress - ${placedCount}/8 symbols (${percentage}%)`);
    
    // Update Ganesha state based on placed count
    let newGaneshaState = GANESHA_STATES.STONE;
    if (placedCount >= 6) newGaneshaState = GANESHA_STATES.DIVINE;
    else if (placedCount >= 3) newGaneshaState = GANESHA_STATES.AWAKENING;
    
    // FIXED: Single state update for placement
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

    // Create placement sparkles
    setShowSparkle(`symbol-placed-${id}`);
    safeSetTimeout(() => setShowSparkle(null), 2000);

    // FIXED: Check for GameCoach milestones with better logging
   if (placedCount === 3) {
  console.log('🎭 3rd symbol placed - showing sparkles then assembly wisdom');
  
  // Show sparkles first
  setShowSparkle('divine-light');
  
  safeSetTimeout(() => {
    // Clear sparkles and trigger GameCoach
    setShowSparkle(null);
    sceneActions.updateState({ 
      readyForWisdom: true,
      phase: 'awakening'
    });
  }, 1800);


   } else if (placedCount === 8) {
  console.log('🎭 8th symbol placed - showing sparkles then mastery');
  
  // Show sparkles first
  setShowSparkle('divine-light');
  
  safeSetTimeout(() => {
    // Clear sparkles and trigger GameCoach
    setShowSparkle(null);
    sceneActions.updateState({
      phase: 'complete',
      completed: true
    });
  }, 1800);
}
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
        return placedCount < 3 && !showMagicalCard && !isOrbsRunning && !isGameCoachVisible;
      }
    }
  ];

  // Render
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
          
          {/* DEBUG: GameCoach Sparkle State */}
          {console.log('🎭 GAMECOACH SPARKLE DEBUG:', {
            showSparkle: showSparkle,
            sparkleActive: showSparkle === 'divine-light',
            gameCoachState: sceneState?.gameCoachState,
            isReloadingGameCoach: sceneState?.isReloadingGameCoach
          })}

          {/* FIXED: SimpleGameCoach Integration - WITH WORKING SPARKLES */}
          <SimpleGameCoach
            config={{
              messages: [
               {
  id: 'welcome',
  stateFlag: 'welcomeShown',
  message: `Welcome to the Sacred Summit, ${profileName}! You've collected all of Ganesha's sacred symbols. Now assemble them to awaken his divine form!`,
  timing: 300,
  //sparkleType: 'divine-light',
  //sparkleDelay: 2000,
  duration: 4000,
  condition: (sceneState) => 
    sceneState?.phase === 'initial' && 
    !sceneState?.welcomeShown,
  messageType: 'welcome',
  additionalUpdates: (sceneState) => ({
    gameCoachState: 'welcome',
    lastGameCoachTime: Date.now()
  })
},
                {
                  id: 'assembly_wisdom',
                  stateFlag: 'assemblyWisdomShown',
                  message: `Magnificent, ${profileName}! You're bringing Ganesha to life! Each symbol you place awakens his divine power!`,
                  timing: 300,
                  //sparkleType: 'divine-light',
                  //sparkleDelay: 1000,
                  duration: 4000,
                  condition: (sceneState) => {
                    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
                    return placedCount >= 3 && 
                           !sceneState?.assemblyWisdomShown && 
                           sceneState?.readyForWisdom;
                  },
                  messageType: 'wisdom1',
                  additionalUpdates: (sceneState) => ({
                    readyForWisdom: false,
                    gameCoachState: 'assembly_wisdom',
                    lastGameCoachTime: Date.now()
                  })
                },
                {
                  id: 'mastery_wisdom',
                  stateFlag: 'masteryShown',
                  message: `Divine Child! You have awakened Ganesha completely! You are now a true keeper of ancient wisdom! The entire realm celebrates your achievement!`,
                  timing: 300,
                  //sparkleType: 'divine-light',
                  //sparkleDelay: 1000,
                  duration: 4000,
                  condition: (sceneState) => {
                    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
                    return placedCount === 8 && !sceneState?.masteryShown;
                  },
                  messageType: 'wisdom3',
                  additionalUpdates: (sceneState) => ({
                    gameCoachState: 'mastery_wisdom',
                    lastGameCoachTime: Date.now()
                  })
                }
              ],
              dependencies: [
                'sceneState?.placedSymbols',
                'sceneState?.readyForWisdom',
                'sceneState?.assemblyWisdomShown',
                'sceneState?.masteryShown'
              ]
            }}
            sceneState={sceneState}
            sceneActions={sceneActions}
            profileName={profileName}
            /*onSparkleEffect={(type) => {
              console.log(`✨ SPARKLE TRIGGERED: ${type}`);
              setShowSparkle(type);
              // Auto-clear sparkle after delay
              safeSetTimeout(() => {
                console.log(`✨ CLEARING SPARKLE: ${type}`);
                setShowSparkle(null);
              }, 2000);
            }}*/
          />
          
          {/* FIXED FLOW DEBUG */}
          {console.log('🚀 FIXED FLOW DEBUG (with GameCoach):', {
            placedSymbols: Object.keys(sceneState?.placedSymbols || {}).length,
            phase: sceneState?.phase,
            completed: sceneState?.completed,
            celebrationActive: sceneState?.celebrationActive,
            isOrbsRunning: isOrbsRunning,
            showSparkle: showSparkle,
            // GameCoach state
            gameCoachState: sceneState?.gameCoachState,
            welcomeShown: sceneState?.welcomeShown,
            assemblyWisdomShown: sceneState?.assemblyWisdomShown,
            masteryShown: sceneState?.masteryShown,
            readyForWisdom: sceneState?.readyForWisdom,
            isReloadingGameCoach: sceneState?.isReloadingGameCoach
          })}

          {/* DEBUG: GameCoach Condition Check */}
          {console.log('🎭 GAMECOACH CONDITIONS CHECK:', {
            // Welcome condition
            welcomeCondition: sceneState?.phase === 'initial' && !sceneState?.welcomeShown,
            // Assembly wisdom condition  
            assemblyCondition: Object.keys(sceneState?.placedSymbols || {}).length >= 3 && 
                              !sceneState?.assemblyWisdomShown && 
                              sceneState?.readyForWisdom,
            // Mastery condition
            masteryCondition: Object.keys(sceneState?.placedSymbols || {}).length === 8 && 
                             !sceneState?.masteryShown
          })}

          {/* Sacred Mountain Background */}
          <div 
            className="sacred-background" 
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Progress Display */}
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

   {/* FIXED: Loading indicator during orbs (with built-in fireworks) 
{isOrbsRunning && (
              <div className="celebration-loading" style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 215, 0, 0.9)',
                color: '#8B4513',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {isOrbsRunning ? '                🎆 Ganesha is awakening... ✨ (13 seconds)' : '🎊 Sacred celebration! 🎆'}
              </div>
            )}

            {/* Ganesha Sacred Form Container */}
            <div className="ganesha-assembly-container">
              {/* Ganesha Progressive Awakening */}
              <div className="ganesha-awakening-container">
                {/* Base faint outline */}
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
                    top: '10%',
                    left: '10%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    height: '90%',
                    opacity: getGaneshaOpacity(),
                    transition: 'all 1s ease'
                  }}
                />
              </div>

              {/* SMART DROP ZONES */}
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

              {/* Placed Symbol Sparkles */}
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

            {/* SMART FLOATING SYMBOLS */}
            {SACRED_SYMBOLS.map((symbol, index) => (
              <SmartDraggableSymbol
                key={symbol.id}
                symbol={symbol}
                position={SYMBOL_POSITIONS[index]}
                isPlaced={sceneState.placedSymbols?.[symbol.id]}
                currentDragSymbol={sceneState?.currentDragSymbol}
                onDragStart={(id) => {
                  console.log(`🚀 FIXED DRAG START: ${id}`);
                  sceneActions.updateState({ currentDragSymbol: id });
                }}
                onDragEnd={() => {
                  console.log(`🏁 FIXED DRAG END`);
                  setTimeout(() => {
                    sceneActions.updateState({ 
                      currentDragSymbol: null,
                      activeMagneticZone: null 
                    });
                  }, 150);
                }}
              />
            ))}

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

            {/* Divine firefly light for GameCoach entrance */}
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
  color="#860dc3ff" 
  size={3}        // ← Tiny glitter
  duration={2000}
  fadeOut={true}
  area="full"
/>
  </div>
)}
      
            {/* FIXED: Sacred Orbs Effect with built-in fireworks (9 seconds total) */}
            {showSparkle === 'final-fireworks' && (
              <RotatingOrbsEffect
                show={true}
                duration={9000}  // 9 seconds with built-in fireworks
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
                  console.log('🎯 FIXED: Orb effect with built-in fireworks complete - Showing completion screen');
                  setShowSparkle(null);
                  setIsOrbsRunning(false);
                  
                  // Save completion data
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    console.log('💾 FIXED: Final save after orbs+fireworks complete');
                    console.log('✅ FIXED: Final save completed');
                  }
                  
                  // Show scene completion directly
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* COMPLETE V2 button for testing */}
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
              console.log('🧪 COMPLETE V2 BUTTON CLICKED - WITH GAMECOACH');
              
              // Clear all timeouts and reset UI
              clearAllTimeouts();
              setShowSparkle(null);
              setShowMagicalCard(false);
              setShowSceneCompletion(false);
              setIsOrbsRunning(false);
              
              // Mark all symbols as placed
              const allPlaced = {};
              SACRED_SYMBOLS.forEach(symbol => {
                allPlaced[symbol.id] = true;
              });
              
              // Set completion state with GameCoach flags
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
                // GameCoach flags - trigger mastery message
                welcomeShown: true,
                assemblyWisdomShown: true,
                masteryShown: false,  // This will trigger the mastery message
                readyForWisdom: false,
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              // The mastery message will trigger celebration automatically
              console.log('🎭 COMPLETE V2: GameCoach will show mastery message → trigger celebration');
            }}>
              COMPLETE V2
            </div>

            {/* DEBUG: GameCoach trigger buttons */}
            <div style={{
              position: 'fixed',
              top: '100px',
              right: '40px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              {/* Test 3rd symbol GameCoach */}
              <div style={{
                background: 'orange',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold'
              }} onClick={() => {
                console.log('🧪 TESTING: 3rd symbol GameCoach');
                
                // Simulate 3 symbols placed
                const threePlaced = {};
                SACRED_SYMBOLS.slice(0, 3).forEach(symbol => {
                  threePlaced[symbol.id] = true;
                });
                
                sceneActions.updateState({
                  placedSymbols: threePlaced,
                  stars: 3,
                  phase: 'awakening',
                  readyForWisdom: true,
                  welcomeShown: true,  // Skip welcome
                  assemblyWisdomShown: false,  // Allow this to trigger
                  progress: { percentage: 37.5, starsEarned: 3, completed: false }
                });
              }}>
                TEST 3rd
              </div>

              {/* Test 8th symbol GameCoach */}
              <div style={{
                background: 'red',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold'
              }} onClick={() => {
                console.log('🧪 TESTING: 8th symbol GameCoach');
                
                // Simulate all symbols placed
                const allPlaced = {};
                SACRED_SYMBOLS.forEach(symbol => {
                  allPlaced[symbol.id] = true;
                });
                
                sceneActions.updateState({
                  placedSymbols: allPlaced,
                  stars: 8,
                  phase: 'complete',
                  completed: true,
                  welcomeShown: true,
                  assemblyWisdomShown: true,
                  masteryShown: false,  // Allow this to trigger
                  readyForWisdom: false,
                  progress: { percentage: 100, starsEarned: 8, completed: true }
                });
              }}>
                TEST 8th
              </div>
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
                console.log('🔄 FIXED EMERGENCY RESTART');
                
                // Clear all timeouts and UI states
                clearAllTimeouts();
                setShowSparkle(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                setShowZoneCompletion(false);
                setIsOrbsRunning(false);
                
                // Reset scene state
                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    currentDragSymbol: null,
                    activeMagneticZone: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    currentPopup: null,
                    showingCompletionScreen: false,
                    showingZoneCompletion: false,
                    celebrationActive: false,
                    
                    // Reset GameCoach flags
                    welcomeShown: false,
                    assemblyWisdomShown: false,
                    masteryShown: false,
                    readyForWisdom: false,
                    gameCoachState: null,
                    lastGameCoachTime: 0,
                    isReloadingGameCoach: false,
                    
                    stars: 0,
                    completed: false,
                    progress: {
                      percentage: 0,
                      starsEarned: 0,
                      completed: false
                    }
                  });
                }, 100);
              }
            }}>
              🔄 Start Fresh
            </div>

            {/* DEBUG: Clear LocalStorage */}
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
              opacity: 0.8
            }} onClick={() => {
              console.log('🗑️ DEBUG: Clearing localStorage');
              localStorage.clear();
              sessionStorage.clear();
              console.log('✅ DEBUG: Storage cleared');
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}>
              🗑️ DEBUG
            </div>
          </div>

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
              console.log(`FIXED hint level ${level} shown`);
              setHintUsed(true);
            }}
            enabled={!isOrbsRunning && !isGameCoachVisible}  // FIXED: Disable hints during celebration and GameCoach
          />

          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              console.log('🏠 FIXED: Home navigation');
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`📊 FIXED: Great progress, ${profileName}!`);
              setShowCulturalCelebration(true);
            }}
            onHelp={() => console.log('❓ FIXED: Show help')}
            onParentMenu={() => console.log('👨‍👩‍👧‍👦 FIXED: Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('🔊 FIXED: Toggle audio')}
            onZonesClick={() => {
              console.log('🗺️ FIXED: Zones navigation');
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

          {/* Enhanced Scene Completion */}
          {console.log('🎊 FIXED SCENE COMPLETION DEBUG:', {
            showSceneCompletion: showSceneCompletion,
            isOrbsRunning: isOrbsRunning,
            completed: sceneState?.completed
          })}
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
            onComplete={onComplete}
            childName={profileName}
            isFinalScene={true}
            hideGanesha={true}  // NEW: Don't show Ganesha again in completion screen
            
            // Final scene button handlers
            onExploreZones={() => {
              console.log('🗺️ FIXED: Explore other zones');
              setShowSceneCompletion(false);
              onNavigate?.('zones');
            }}
            onHome={() => {
              console.log('🏠 FIXED: Home from completion');
              setShowSceneCompletion(false);
              onNavigate?.('zone-welcome');
            }}
            onReplay={() => {
              console.log('🔄 FIXED: Final scene replay');
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
