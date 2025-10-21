// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV2.jsx
// 🎵 Clean Musical Mountain Scene with Integrated Tusk Assembly - CURSOR OFFSET FIXED

import React, { useState, useEffect, useRef } from 'react';
import './SymbolMountainSceneV2.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Import game components
import EyesTelescopeGame from './EyesTelescopeGame';
import EarsRhythmGame from './EarsRhythmGame';
// ✅ REMOVED: TuskAssemblyGame import

// Import drag & drop components for musical notes
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Images - Background and Symbols
import mountainBackground from '../tusk/assets/images/rock-background.png';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Popup images
import popupEyes from '../tusk/assets/images/popup-eyes-info.png';
import popupEars from '../tusk/assets/images/popup-ears-info.png';
import popupTusk from '../tusk/assets/images/popup-tusk-info.png';
import eyesCoach from '../tusk/assets/images/mooshika-coach.png';
import ganeshaOutline from '../tusk/assets/images/ganesha-outline.png';
import ganeshaComplete from '../tusk/assets/images/ganesha-complete.png';

// Shared symbol images for completion - ALL 8 SYMBOLS
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-colored.png';
import symbolEarColored from '../../shared/images/icons/symbol-ear-colored.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-colored.png';

// Import your actual musical instrument images
import musicalTabla from '../tusk/assets/images/musical-tabla-colored.png';
import musicalFlute from '../tusk/assets/images/musical-flute-colored.png';
import musicalBells from '../tusk/assets/images/musical-bells-colored.png';
import musicalCymbals from '../tusk/assets/images/musical-cymbals-colored.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla' },
  flute: { image: musicalFlute, name: 'Flute' },
  bells: { image: musicalBells, name: 'Bells' },
  cymbals: { image: musicalCymbals, name: 'Cymbals' }
};

// Game phases
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
  ALL_COMPLETE: 'all_complete'
};

// Musical instrument positions
const instrumentPositions = {
  1: { x: 20, y: 30, type: 'tabla' },     // Top left
  2: { x: 80, y: 35, type: 'flute' },     // Top right  
  3: { x: 30, y: 65, type: 'bells' },     // Bottom left
  4: { x: 70, y: 70, type: 'cymbals' }    // Bottom right
};

// ✅ FIXED: Musical note data simplified (positioning handled by CSS)
const musicalNoteData = [
  { emoji: '🎵', id: 'note1' },
  { emoji: '🎶', id: 'note2' },
  { emoji: '🎼', id: 'note3' }
];

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SymbolMountainSceneV2 = ({ 
  onComplete, 
  onNavigate, 
  zoneId = 'symbol-mountain', 
  sceneId = 'symbol' 
}) => {
  console.log('SymbolMountainSceneV2 props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Game progression
          phase: PHASES.EYES_GAME,
          activeGame: 'eyes',
          completedGames: [],
          currentFocus: 'eyes',
          
          // Eyes game state
          showEyesTelescopeGame: false,
          eyesGameActive: false,
          eyesGameComplete: false,
          foundInstruments: [],
          discoveredInstruments: {},
          instrumentsFound: 0,
          
          // Ears game state
          earsVisible: false,
          showEarsRhythmGame: false,
          earsGameActive: false,
          earsGameComplete: false,
          musicalNotesVisible: false,
          currentNote: 'note1',
          musicalNoteStates: {
            note1: 'gray',
            note2: 'gray',
            note3: 'gray'
          },
           // ✅ ADD these lines to the ears game state section:
  earsGamePhase: 'waiting',
  earsPlayerInput: [],
  // ✅ ADD THESE 5 LINES:
earsCurrentSequence: [],                // ← Missing
earsSequenceItemsShown: 0,             // ← Missing  
earsSequenceJustCompleted: false,      // ← Missing
earsReadyForNextNote: false,           // ← Missing
earsLastCompletedNote: null,           // ← Missing
          
          // ✅ ENHANCED: Integrated tusk assembly state
          showTuskAssemblyGame: false,
          tuskGameActive: false,
          tuskPower: 0,
          tuskFullyPowered: false,
          tuskFloating: false,
          ganeshaComplete: false,
          ganeshaAssembling: false,  // New: Assembly animation
          showGaneshaOutline: false, // New: Show outline when active
          
          // Symbol discovery tracking
discoveredSymbols: {
  // Previous symbols from earlier scenes (already discovered)
  mooshika: true,
  modak: true,
  belly: true,
  lotus: true,
  trunk: true,
  // Current scene symbols will be discovered during gameplay
  // eyes, ears, tusk will be added when discovered

},          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // Message flags
          welcomeShown: false,
          eyesWisdomShown: false,
          earsWisdomShown: false,
          tuskWisdomShown: false,
          readyForWisdom: false,
          
          // Reload system
          currentPopup: null,
          showingCompletionScreen: false,  // ✅ ADDED: Missing flag
          playAgainRequested: false,
          fireworksCompleted: false,        // 🆕 NEW: Track fireworks completion
fireworksStartTime: 0,            // 🆕 NEW: Track when fireworks started
completionScreenShown: false,    // 🆕 NEW: Track if completion screen was shown
          
          // GameCoach state
          gameCoachState: null,
          isReloadingGameCoach: false,
          lastGameCoachTime: 0,

          // ✨ NEW: Add these lines for animated text
showEyesText: false,
showEarsText: false, 
showTuskText: false,
          
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
          <SymbolMountainSceneContent 
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

const SymbolMountainSceneContent = ({ 
  sceneState, 
  sceneActions, 
  isReload, 
  onComplete, 
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('SymbolMountainSceneContent render', { sceneState, isReload, zoneId, sceneId });

  // Safety check
  if (!sceneState || !sceneActions) {
    console.warn('⚠️ MUSICAL MOUNTAIN: Missing required props');
    return <div>Loading Musical Mountain scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYES_GAME });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  const getContainerClass = () => {
  if (!isReload) {
    console.log('🎯 CSS CLASS: show-game (not reload)');
    return 'show-game';
  }
  
  const profileId = localStorage.getItem('activeProfileId');
  const tempKey = `temp_session_${profileId}_symbol-mountain_symbol`;
  const tempData = localStorage.getItem(tempKey);
  
  console.log('🎯 CSS DEBUG:', {
    isReload,
    profileId,
    tempKey,
    tempData: tempData ? 'exists' : 'missing'
  });
  
  if (tempData) {
    try {
      const parsed = JSON.parse(tempData);
      if (parsed.showingCompletionScreen) {
        console.log('🎯 CSS CLASS: checking-completion (hiding scene)');
        return 'checking-completion';
      }
    } catch (error) {}
  }
  
  console.log('🎯 CSS CLASS: show-game (showing scene)');
  return 'show-game';
};

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // ✅ NEW: Tusk assembly animation states
  const [tuskGlowing, setTuskGlowing] = useState(false);
  const [assemblyMessage, setAssemblyMessage] = useState('');

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));


  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const previousVisibilityRef = useRef(false);
  const [hintUsed, setHintUsed] = useState(false);

  // Get profile name for personalized messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ✅ ADD: Debug completion screen state
  useEffect(() => {
    console.log('🎯 COMPLETION STATE CHANGE:', {
      showSceneCompletion,
      showingCompletionScreen: sceneState?.showingCompletionScreen,
      completed: sceneState?.completed,
      phase: sceneState?.phase,
      stars: sceneState?.stars,
      timestamp: Date.now()
    });
  }, [showSceneCompletion, sceneState?.showingCompletionScreen, sceneState?.completed, sceneState?.phase]);

  // ✅ ENHANCED: Watch tusk power for visual feedback
  useEffect(() => {
    if (sceneState.showTuskAssemblyGame && sceneState.tuskPower > 0) {
      setTuskGlowing(true);
      
      // Cultural feedback messages
      const messages = [
        '',  // 0
        `🎵 Divine harmony begins! The sacred tusk awakens with musical energy!`,
        `🎶 Sacred melodies flow! Ganesha's power grows stronger with each note!`,
        `✨ Perfect divine symphony! The tusk is ready to join Lord Ganesha!`
      ];
      
      setAssemblyMessage(messages[sceneState.tuskPower] || '');
      
      // Auto-hide message after delay
      safeSetTimeout(() => {
        setAssemblyMessage('');
      }, 4000);
    }
  }, [sceneState.tuskPower, sceneState.showTuskAssemblyGame]);

  // GameCoach story messages
  const gameCoachStoryMessages = [
    /*{
      id: 'welcome',
      message: `Welcome to the Sacred Musical Mountain, ${profileName}! Click the divine eyes to begin your musical discovery!`,
      timing: 500,
      condition: () => sceneState?.phase === PHASES.EYES_GAME && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    /*{
      id: 'eyes_wisdom',
      message: `Amazing musical discovery, ${profileName}! You've found all the sacred instruments! Divine vision reveals the sounds of creation!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.eyes && !sceneState?.eyesWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'ears_wisdom',
      message: `Beautiful rhythm mastery, ${profileName}! Sacred listening creates harmony! All musical notes now glow with divine energy!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.ears && !sceneState?.earsWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },*/
    {
      id: 'tusk_wisdom',
      message: `Perfect musical assembly, ${profileName}! You've awakened Ganesha through the power of sacred sounds and rhythm!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.tusk && !sceneState?.tuskWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  const shouldEnableHints = () => {
  const disabledPhases = [
    PHASES.ALL_COMPLETE,
    PHASES.EYES_COMPLETE, // Disable during celebration
    PHASES.EARS_COMPLETE  // Disable during celebration
  ];
    return !disabledPhases.includes(sceneState?.phase);
};

const getHintConfigs = () => [
  {
    id: 'eyes-hint',
    message: 'Click the divine eyes!', // ✅ Shortened from long sentence
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState) => {
      if (!sceneState) return false;
      return sceneState.phase === PHASES.EYES_GAME && 
             !sceneState.showEyesTelescopeGame &&
             !sceneState.eyesGameComplete;
    }
  },
  {
    id: 'ears-hint',
    message: 'Click the sacred ears!', // ✅ Shortened
    position: { bottom: '60%', right: '70%', transform: 'translateX(50%)' },
    condition: (sceneState) => {
      if (!sceneState) return false;
      return sceneState.earsVisible &&
             !sceneState.showEarsRhythmGame &&
             !sceneState.earsGameComplete;
    }
  },
  {
    id: 'tusk-hint',
    message: 'Drag notes to tusk!', // ✅ Shortened
    position: { bottom: '40%', left: '50%', transform: 'translateX(-50%)' },
    condition: (sceneState) => {
      if (!sceneState) return false;
      const hasGoldenNotes = Object.values(sceneState.musicalNoteStates || {}).some(state => state === 'golden');
      return sceneState.showTuskAssemblyGame &&
             hasGoldenNotes &&
             !sceneState.ganeshaComplete;
    }
  }
];

  // Get message type for GameCoach
  const getMessageType = (messageId) => {
    switch(messageId) {
      case 'welcome': return 'welcome';
      case 'eyes_wisdom': return 'wisdom1';
      case 'ears_wisdom': return 'wisdom2'; 
      case 'tusk_wisdom': return 'wisdom3';
      default: return 'welcome';
    }
  };

  // Initial cleanup
  useEffect(() => {
    console.log('🧹 MUSICAL MOUNTAIN: Aggressive GameCoach cleanup on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
    
    const cleanupEvent = new CustomEvent('clearGameCoach', {
      detail: { source: 'symbol-mountain-scene', zoneId: 'symbol-mountain', sceneId: 'symbol' }
    });
    window.dispatchEvent(cleanupEvent);
    
    const aggressiveCleanup = setTimeout(() => {
      console.log('🧹 MUSICAL MOUNTAIN: Second cleanup wave');
      if (hideCoach) {
        hideCoach();
      }
    }, 2000);
    
    return () => clearTimeout(aggressiveCleanup);
  }, []);

  // Watch for GameCoach visibility changes
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`, {
        previousVisibility: previousVisibilityRef.current,
        currentVisibility: isVisible,
        pendingAction,
        timestamp: Date.now()
      });
      
      const actionTimer = setTimeout(() => {
        console.log(`🎬 ACTION TIMER: About to execute ${pendingAction}`);
        
        switch (pendingAction) {
          case 'materialize-ears':
            console.log('👂 Materializing ears after eyes wisdom');
            setShowSparkle('ears-materialize');
            
            safeSetTimeout(() => {
              sceneActions.updateState({
                earsVisible: true,
                phase: PHASES.EARS_GAME,
                activeGame: 'ears',
                currentFocus: 'ears',
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              setShowSparkle(null);
            }, 2000);
            break;
            
          case 'activate-tusk':
            console.log('🐘 Activating tusk assembly after ears wisdom');

            console.log('🔍 TUSK ACTIVATION DEBUG:', {
              musicalNoteStates: sceneState.musicalNoteStates,
              showTuskAssemblyGame: sceneState.showTuskAssemblyGame,
              phase: sceneState.phase
            });
            setShowSparkle('tusk-activate');
            
            safeSetTimeout(() => {
              console.log('🔍 BEFORE TUSK UPDATE:', sceneState.musicalNoteStates);

              sceneActions.updateState({
                showTuskAssemblyGame: true,
                tuskGameActive: true,
                showGaneshaOutline: true, 
                musicalNoteStates: {
                  note1: 'golden',
                  note2: 'golden', 
                  note3: 'golden'
                },
                phase: PHASES.TUSK_GAME,
                activeGame: 'tusk',
                currentFocus: 'tusk',
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              setShowSparkle(null);
            }, 2000);
            break;
            
          case 'final-celebration':
            console.log('✨ Starting final celebration after tusk wisdom');
            console.log('✨ FINAL CELEBRATION: About to call showSymbolCelebration("final")');
            showSymbolCelebration('final');
            break;
        }
        
        setPendingAction(null);
      }, 1000);
      
      timeoutsRef.current.push(actionTimer);
    }
    
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // GAMECOACH LOGIC
  useEffect(() => {
    console.log('🎭 MUSICAL MOUNTAIN GAMECOACH: Starting check', {
      hasSceneState: !!sceneState,
      hasShowMessage: !!showMessage,
      isReloadingGameCoach: sceneState?.isReloadingGameCoach,
      symbolDiscoveryState: sceneState?.symbolDiscoveryState,
      sidebarHighlightState: sceneState?.sidebarHighlightState,
      discoveredSymbols: sceneState?.discoveredSymbols,
      readyForWisdom: sceneState?.readyForWisdom,
      phase: sceneState?.phase,
      timestamp: Date.now()
    });
    
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

    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
    
    console.log('🎭 GAMECOACH: Condition check results', {
      foundMatchingMessage: !!matchingMessage,
      messageId: matchingMessage?.id,
      allConditions: gameCoachStoryMessages.map(msg => ({
        id: msg.id,
        conditionResult: typeof msg.condition === 'function' ? msg.condition() : false
      }))
    });
    
    if (matchingMessage) {
      const messageAlreadyShown = 
        (matchingMessage.id === 'eyes_wisdom' && sceneState.eyesWisdomShown) ||
        (matchingMessage.id === 'ears_wisdom' && sceneState.earsWisdomShown) ||
        (matchingMessage.id === 'tusk_wisdom' && sceneState.tuskWisdomShown) ||
        (matchingMessage.id === 'welcome' && sceneState.welcomeShown);
      
      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }
      
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing ${matchingMessage.id} message`);
        
        // Show divine light effect first
        setShowSparkle('divine-light');
        
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 8000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: getMessageType(matchingMessage.id)
          });
        }, 2000);
        
        switch (matchingMessage.id) {
           /* REMOVED: Welcome case
  case 'welcome':
    sceneActions.updateState({ welcomeShown: true });
    break;
  */
          case 'eyes_wisdom':
            sceneActions.updateState({ 
              eyesWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'eyes_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('materialize-ears');
            break;
          case 'ears_wisdom':
            sceneActions.updateState({ 
              earsWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'ears_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('activate-tusk');
            break;
          case 'tusk_wisdom':
            sceneActions.updateState({ 
              tuskWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'tusk_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('final-celebration');
            break;
        }
      }, matchingMessage.timing);
      
      return () => clearTimeout(timer);
    } else {
      console.log('🎭 GAMECOACH: No matching message found');
    }
  }, [
    sceneState?.phase, 
    sceneState?.discoveredSymbols, 
    sceneState?.welcomeShown,
    sceneState?.eyesWisdomShown,
    sceneState?.earsWisdomShown,
    sceneState?.tuskWisdomShown,
    sceneState?.readyForWisdom,
    sceneState?.gameCoachState,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

    const [shouldShowCompletion, setShouldShowCompletion] = useState(false);


// ✅ ADD THIS useEffect (find the other useEffects and add this near them)
useEffect(() => {
  window.saveEarsGameState = (gameState) => {
    sceneActions.updateState({
      earsGamePhase: gameState.gamePhase,
      earsPlayerInput: gameState.playerInput
    });
  };
  
  return () => {
    delete window.saveEarsGameState;
  };
}, []);

// ✅ ADD: Debug ears component props
useEffect(() => {
  if (sceneState.showEarsRhythmGame) {
    console.log('🔍 EARS COMPONENT PROPS:', {
      isReload: isReload && sceneState.showEarsRhythmGame,
      earsGamePhase: sceneState.earsGamePhase,
      earsPlayerInput: sceneState.earsPlayerInput,
      showEarsRhythmGame: sceneState.showEarsRhythmGame
    });
  }
}, [sceneState.showEarsRhythmGame, isReload, sceneState.earsGamePhase, sceneState.earsPlayerInput]);

  // ✅ FIXED RELOAD LOGIC - Handle all interrupted states for SymbolMountainSceneV2
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_symbol-mountain_symbol`;
    const playAgainRequested = localStorage.getItem(playAgainKey);

    console.log('🔄 RELOAD: Starting SymbolMountainSceneV2 reload sequence', {
      currentPopup: sceneState.currentPopup,
      gameCoachState: sceneState.gameCoachState,
      phase: sceneState.phase,
      completed: sceneState.completed,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      playAgainFlag: playAgainRequested,
      stars: sceneState.stars,
      discoveredSymbols: sceneState.discoveredSymbols
    });

    // ✅ CRITICAL FIX: Check if this is a fresh restart after Play Again
    const isFreshRestartAfterPlayAgain = (
      playAgainRequested === 'true' ||  // ← Most reliable check
      (
        sceneState.phase === 'eyes_game' && 
        sceneState.completed === false && 
        sceneState.stars === 0 && 
        !sceneState.eyesGameComplete &&
        !sceneState.welcomeShown &&
        (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen)
      )
    );
    
    console.log('🔄 FRESH RESTART CHECK:', {
      playAgainRequested: playAgainRequested === 'true',
      phaseCheck: sceneState.phase === 'eyes_game',
      completedCheck: sceneState.completed === false,
      starsCheck: sceneState.stars === 0,
      eyesGameCheck: !sceneState.eyesGameComplete,
      welcomeCheck: !sceneState.welcomeShown,
      popupCheck: (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen),
      overallResult: isFreshRestartAfterPlayAgain
    });
    
    if (isFreshRestartAfterPlayAgain) {
      console.log('🔄 RELOAD: Detected fresh restart after Play Again - clearing completion state');

      // Clear the storage flag if it exists
      if (playAgainRequested === 'true') {
        localStorage.removeItem(playAgainKey);
        console.log('✅ CLEARED: Play Again storage flag');
      }

      sceneActions.updateState({ 
        isReloadingGameCoach: false,
        showingCompletionScreen: false,
        currentPopup: null,
        completed: false,
        phase: PHASES.EYES_GAME
      });
      return; // EXIT EARLY - Don't resume completion
    }

    // Block GameCoach normal flow during reload
    sceneActions.updateState({ isReloadingGameCoach: true });
    
    setTimeout(() => {
  
      
   // 🔥 PRIORITY 1: Handle active symbol discovery states first
if (sceneState.symbolDiscoveryState) {
  console.log('🔄 Skipping symbol discovery - using streamlined flow');
  sceneActions.updateState({ 
    symbolDiscoveryState: null,
    isReloadingGameCoach: false 
  });
  return;
}
      
    // 🔥 PRIORITY 2: Handle sidebar highlight states
      else if (sceneState.sidebarHighlightState) {
        console.log('🔄 Resuming sidebar highlight:', sceneState.sidebarHighlightState);
        
        setTimeout(() => {
          if (sceneState.sidebarHighlightState === 'eyes_highlighting') {
            showSymbolCelebration('eyes');
          } else if (sceneState.sidebarHighlightState === 'ears_highlighting') {
            showSymbolCelebration('ears');
          } else if (sceneState.sidebarHighlightState === 'tusk_highlighting') {
            showSymbolCelebration('tusk');
          }
        }, 1000);
        
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

    // 🔥 PRIORITY 3: Handle explicit popup states
      else if (sceneState.currentPopup) {
        console.log('🔄 Resuming popup:', sceneState.currentPopup);
        
        switch(sceneState.currentPopup) {
          /*case 'eyes_info':
            setPopupBookContent({
              title: "Divine Eyes - Musical Vision",
              symbolImage: popupEyes,
              description: `Ganesha's divine eyes revealed all sacred instruments! With wisdom and perception, these sacred eyes see the harmony in all creation!`
            });
            setCurrentSourceElement('eyes-1');
            setShowPopupBook(true);
            break;
            
          case 'eyes_card':
            setCardContent({ 
              title: `You've discovered the Musical Eyes Symbol, ${profileName}!`,
              image: popupEyes,
              stars: 3
            });
            setShowMagicalCard(true);

  // ✅ CELEBRATION CARD RELOAD FIX: Clear blocking flags
  setTimeout(() => {
    console.log('🎉 RELOAD: Clearing eyes celebration card reload flags');
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      symbolDiscoveryState: null,
      sidebarHighlightState: null
    });
  }, 500);
  break;            
          case 'ears_info':
            setPopupBookContent({
              title: "Sacred Ears - Rhythmic Mastery",
              symbolImage: popupEars,
              description: `Ganesha's sacred ears mastered all rhythms! Perfect listening creates perfect harmony in the cosmic dance of music!`
            });
            setCurrentSourceElement('ears-1');
            setShowPopupBook(true);
            break;
            
          case 'ears_card':
            setCardContent({ 
              title: `You've mastered the Musical Ears Symbol, ${profileName}!`,
              image: popupEars,
              stars: 3
            });
            setShowMagicalCard(true);

  // ✅ CELEBRATION CARD RELOAD FIX: Clear blocking flags
  setTimeout(() => {
    console.log('🎉 RELOAD: Clearing eyes celebration card reload flags');
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      symbolDiscoveryState: null,
      sidebarHighlightState: null
    });
  }, 500);
  break;

          case 'tusk_info':
            setPopupBookContent({
              title: "Sacred Tusk - Musical Assembly",
              symbolImage: popupTusk,
              description: `Ganesha's mighty tusk assembled through sacred music! The power of rhythm and harmony brings divine energy to life!`
            });
            setCurrentSourceElement('tusk-1');
            setShowPopupBook(true);
            break;
            
          case 'tusk_card':
            setCardContent({ 
              title: `You've assembled the Musical Tusk Symbol, ${profileName}!`,
              image: popupTusk,
              stars: 3
            });
            setShowMagicalCard(true);

  // ✅ CELEBRATION CARD RELOAD FIX: Clear blocking flags
  setTimeout(() => {
    console.log('🎉 RELOAD: Clearing eyes celebration card reload flags');
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      symbolDiscoveryState: null,
      sidebarHighlightState: null
    });
  }, 500);
  break;*/
          case 'final_fireworks':
            // ✅ ENHANCED: Check for Play Again reset using storage
            const profileId = localStorage.getItem('activeProfileId');
            const playAgainKey = `play_again_${profileId}_symbol-mountain_symbol`;
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              console.log('🚫 FIREWORKS BLOCKED: Play Again was clicked (from storage)');
              
              // Clear the flag
              localStorage.removeItem(playAgainKey);
              
              sceneActions.updateState({
                currentPopup: null,
                showingCompletionScreen: false,
                completed: false,
                phase: PHASES.EYES_GAME,
                stars: 0
              });
              return;
            }
            
            // ✅ LEGITIMATE: Real fireworks reload
            console.log('🎆 Resuming final fireworks');
            setShowSparkle('final-fireworks');
            sceneActions.updateState({
              gameCoachState: null,
              isReloadingGameCoach: false,
              phase: PHASES.ALL_COMPLETE,
              stars: 9,
              completed: true,
              progress: {
                percentage: 100,
                starsEarned: 9,
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

      // 3.5. HANDLE COMPLETION SCREEN RELOAD
  // ✅ ENHANCED: Handle completion screen reload (PRIORITY)
      else if (sceneState.showingCompletionScreen) {
        // Check for Play Again reset using storage
        const profileId = localStorage.getItem('activeProfileId');
        const playAgainKey = `play_again_${profileId}_symbol-mountain_symbol`;
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        console.log('🔄 COMPLETION SCREEN RELOAD:', {
          showingCompletionScreen: sceneState.showingCompletionScreen,
          playAgainRequested,
          completed: sceneState.completed,
          stars: sceneState.stars
        });
        
        if (playAgainRequested === 'true') {
          console.log('🚫 COMPLETION BLOCKED: Play Again was clicked');
          
          // Clear the flag
          localStorage.removeItem(playAgainKey);
          
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: PHASES.EYES_GAME,
            stars: 0,
            isReloadingGameCoach: false
          });
          return;
        }
        
        // ✅ LEGITIMATE: Real completion screen reload
        console.log('🔄 Resuming completion screen');
        setShowSceneCompletion(true);
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

    // 🔥 PRIORITY 4: Handle GameCoach states
      else if (sceneState.gameCoachState) {
        console.log('🔄 Resuming GameCoach:', sceneState.gameCoachState);
        
        switch(sceneState.gameCoachState) {
          case 'eyes_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              eyesWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('materialize-ears');
            break;
            
          case 'ears_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              earsWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('activate-tusk');
            break;
            
          case 'tusk_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              tuskWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('final-celebration');
            break;
        }
        return;
      }

      // Default: No special reload handling needed
      else {
        console.log('🔄 No special reload needed, clearing flags');
        setTimeout(() => {
          sceneActions.updateState({ isReloadingGameCoach: false });
        }, 1500);
      }
      
    }, 500);
    
  }, [isReload]);

  // ✨ NEW: Streamlined symbol learning function
const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`🕉 ${symbolKey} symbol learned - STREAMLINED FLOW`);
  
  // Update discovered symbols + show text
  sceneActions.updateState({
    discoveredSymbols: {
      ...sceneState.discoveredSymbols,
      [symbolKey]: true
    },
    // Show the appropriate text
    showEyesText: symbolKey === 'eyes',
    showEarsText: symbolKey === 'ears',
    showTuskText: symbolKey === 'tusk'
  });
  
  // Show sparkle effect
  setShowSparkle(`${symbolKey}-to-sidebar`);
  
  // Continue game after 2 seconds
  setTimeout(() => {
    console.log(`🎯 ${symbolKey} - hiding text and continuing game`);
    
    // Hide text and sparkle
    setShowSparkle(null);
    sceneActions.updateState({
      showEyesText: false,
      showEarsText: false,
      showTuskText: false
    });
    
    // Game flow logic
    if (symbolKey === 'eyes') {
      console.log('🎮 UNLOCKING EARS PHASE!');
      sceneActions.updateState({
        earsVisible: true,
        phase: PHASES.EARS_GAME,
        activeGame: 'ears',
        currentFocus: 'ears'
      });
    } else if (symbolKey === 'ears') {
      console.log('🎮 UNLOCKING TUSK PHASE!');
      sceneActions.updateState({
        showTuskAssemblyGame: true,
        tuskGameActive: true,
        showGaneshaOutline: true,
        musicalNoteStates: {
          note1: 'golden',
          note2: 'golden',
          note3: 'golden'
        },
        phase: PHASES.TUSK_GAME,
        activeGame: 'tusk',
        currentFocus: 'tusk'
      });
    } else if (symbolKey === 'tusk') {
      // Final completion
      setShowSparkle('final-fireworks');
      sceneActions.updateState({
        phase: PHASES.ALL_COMPLETE,
        completed: true,
        stars: 9,
        showingCompletionScreen: true,
        currentPopup: 'final_fireworks',
        progress: {
          percentage: 100,
          starsEarned: 9,
          completed: true
        }
      });
    }
  }, 2000);
};

  // Hide active hints function
  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  const handleTuskNoteDrop = (dragData) => {
    console.log('🎵 Musical note dropped on tusk:', dragData);
    
    const { id, data } = dragData;
    const noteId = data.noteId;
    const noteState = data.state;
    
    // ✅ NEW: Check if note is golden first
    if (noteState !== 'golden') {
      console.log('🚫 Note is not golden yet - must complete rhythm game first');
      
      // Show helpful message
      if (showMessage) {
        showMessage("Complete the rhythm game to make the notes golden first!", {
          duration: 3000,
          animation: 'bounce',
          position: 'top-center'
        });
      }
      
      return false; // Reject the drop
    }
    
    if (!sceneState.showTuskAssemblyGame) {
      console.log('🚫 Tusk assembly not active');
      return false;
    }
      
    console.log(`🎵 Note ${noteId} fed to tusk!`);
    hideActiveHints();
    hideCoach();
    
    // Update note state and tusk power
    const newNoteStates = {
      ...sceneState.musicalNoteStates,
      [noteId]: 'used'
    };
    
    const newTuskPower = sceneState.tuskPower + 1;
    
    sceneActions.updateState({
      musicalNoteStates: newNoteStates,
      tuskPower: newTuskPower,
      tuskFullyPowered: newTuskPower === 3
    });
    
    // Visual feedback
    setShowSparkle('tusk-feeding');
    setTimeout(() => setShowSparkle(null), 1500);
    
    // Check if complete and start assembly sequence
    if (newTuskPower >= 3) {
      console.log('🐘 Tusk fully powered - starting assembly sequence');
      
      safeSetTimeout(() => {
        // Skip yellow Ganesha - go directly to final completion
        sceneActions.updateState({
          ganeshaComplete: true,
          ganeshaAssembling: false,
          tuskFloating: false
        });
        
        setShowSparkle('ganesha-complete');
        
        // Trigger game completion immediately
        safeSetTimeout(() => {
          handleTuskGameComplete();
        }, 1000);  // Shorter delay
        
      }, 1000);  // Shorter initial delay
              
      setShowSparkle('ganesha-complete');
      setAssemblyMessage(`🎉 Glory to Lord Ganesha! Divine assembly complete through sacred music!`);
      
      // Trigger game completion
      safeSetTimeout(() => {
        handleTuskGameComplete();
      }, 2000);
    }
    
    console.log(`🎵 Tusk power now: ${newTuskPower}/3`);
    return true;
  };

  // CLICK HANDLERS

  // Eyes symbol click handler
  const handleEyesClick = () => {
    if (sceneState.eyesGameComplete) return;
    
    console.log('👁️ Eyes clicked - starting inline telescope game');
    hideActiveHints();
    hideCoach();

    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }

    sceneActions.updateState({ 
      showEyesTelescopeGame: true,
      eyesGameActive: true,
      activeGame: 'eyes'
    });
  };

  // Ears symbol click handler
  const handleEarsClick = () => {
    if (!sceneState.earsVisible || sceneState.earsGameComplete) return;
    
    console.log('👂 Ears clicked - starting inline rhythm game');
    hideActiveHints();
    hideCoach();
    
    sceneActions.updateState({ 
      showEarsRhythmGame: true,
      earsGameActive: true,
      musicalNotesVisible: true,
      activeGame: 'ears',
      currentNote: 'note1'
    });
  };

  // GAME COMPLETION HANDLERS

// Eyes game completion
const handleEyesGameComplete = () => {
  console.log('👁️ Eyes game complete - all instruments discovered');
  
  sceneActions.updateState({
    eyesGameComplete: true,
    showEyesTelescopeGame: false,
    phase: PHASES.EYES_COMPLETE
  });
  
  setShowSparkle('eyes-complete');
  
  safeSetTimeout(() => {
    setShowSparkle(null);
    completeSymbolLearning('eyes', { name: 'All-Seeing Musical Wisdom' });
  }, 800);
};

  // Ears game completion
  const handleEarsGameComplete = () => {
    console.log('👂 Ears game complete - all musical notes golden');

    console.log('🔍 EARS COMPLETE DEBUG:', {
      musicalNoteStates: sceneState.musicalNoteStates,
      allNotesGolden: Object.values(sceneState.musicalNoteStates || {}).every(state => state === 'golden'),
      noteCount: Object.keys(sceneState.musicalNoteStates || {}).length
    });
    
    sceneActions.updateState({
      earsGameComplete: true,
      showEarsRhythmGame: false,
      phase: PHASES.EARS_COMPLETE,
      symbolDiscoveryState: 'ears_discovering',
    });
    
    setShowSparkle('ears-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
  completeSymbolLearning('ears', { name: 'Divine Musical Listening' });
    }, 2000);
  };

  // Tusk game completion
  const handleTuskGameComplete = () => {
    console.log('🐘 Tusk game complete - Ganesha assembled');
    
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: true,     // ← KEEP ACTIVE
      phase: PHASES.ALL_COMPLETE,
      symbolDiscoveryState: 'tusk_discovering'
    });
    
    setShowSparkle('tusk-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
      console.log('🐘 TUSK COMPLETE: About to show symbol info for tusk');
  completeSymbolLearning('tusk', { name: 'Sacred Musical Assembly' });
    }, 1000);
  };

  // Show symbol information
  /*const showSymbolInfo = (symbolType) => {
    let title = "";
    let description = "";
    let image = null;
    
    switch(symbolType) {
      case 'eyes':
        title = "Divine Eyes - Musical Vision";
        description = `Ganesha's divine eyes revealed all sacred instruments, ${profileName}! With wisdom and perception, these sacred eyes see the harmony in all creation!`;
        image = popupEyes;
        break;
      case 'ears':
        title = "Sacred Ears - Rhythmic Mastery";
        description = `Ganesha's sacred ears mastered all rhythms, ${profileName}! Perfect listening creates perfect harmony in the cosmic dance of music!`;
        image = popupEars;
        break;
      case 'tusk':
        title = "Sacred Tusk - Musical Assembly";
        description = `Ganesha's mighty tusk assembled through sacred music, ${profileName}! The power of rhythm and harmony brings divine energy to life!`;
        image = popupTusk;
        break;
    }
    
    setPopupBookContent({ title, symbolImage: image, description });
    setCurrentSourceElement(`${symbolType}-1`);
    setShowPopupBook(true);
    
    sceneActions.updateState({ 
      currentPopup: `${symbolType}_info`
    });
  };*/

  // Symbol celebration function
  /*const showSymbolCelebration = (symbol) => {
    let title = "";
    let image = null;
    let stars = 0;
    
    console.log(`🎉 Showing celebration for: ${symbol}`);
    
    if (sceneState?.isReloadingGameCoach) {
      console.log('🚫 Skipping celebration during reload');
      return;
    }
    
    switch(symbol) {
      case 'eyes':
        title = `You've discovered the Musical Eyes Symbol, ${profileName}!`;
        image = popupEyes;
        stars = 3;
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'eyes_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'ears':
        title = `You've mastered the Musical Ears Symbol, ${profileName}!`;
        image = popupEars;
        stars = 3;
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'ears_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'tusk':
        title = `You've assembled the Musical Tusk Symbol, ${profileName}!`;
        image = popupTusk;
        stars = 3;
        
        console.log('🐘 TUSK CELEBRATION: Setting up tusk card');
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'tusk_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        
        console.log('🐘 TUSK CELEBRATION: Card set up complete');
        break;

      case 'final':
        console.log('🎆 Final musical mastery achieved - showing fireworks celebration');

        // ✅ FIXED: Clear ALL UI states before fireworks
        setShowMagicalCard(false);
        setShowPopupBook(false);
        setShowSparkle(null);
        setCardContent({});
        setPopupBookContent({});

        console.log('🧪 COMPLETION TRIGGER:', {
          source: 'fireworks',
          timestamp: Date.now(),
          sceneState: sceneState.phase,
          showSceneCompletion: showSceneCompletion
        });
        
        // ✅ ENHANCED: Set completion state and trigger fireworks
        sceneActions.updateState({ 
          showingCompletionScreen: true,
          currentPopup: 'final_fireworks',
          phase: PHASES.ALL_COMPLETE,
          stars: 9,
          completed: true,
          progress: {
            percentage: 100,
            starsEarned: 9,
            completed: true
          }
        });

        // ✅ ENHANCED: Ensure fireworks trigger properly
        console.log('🎆 Setting fireworks sparkle');
        setShowSparkle('final-fireworks');
        
        // ✅ ADD: Backup completion trigger in case fireworks don't complete
        //setTimeout(() => {
          //console.log('🎆 BACKUP: Checking if completion screen should show');
          //if (!showSceneCompletion && sceneState.showingCompletionScreen) {
            //console.log('🎆 BACKUP: Manually triggering completion screen');
            //setShowSceneCompletion(true);
          //}
        //}, 10000); // 10 seconds backup
        
        return;

      default:
        title = "Congratulations on your musical discovery!";
        stars = 1;
    }
  };*/

  // Close card handler
  /*const handleCloseCard = () => {
    console.log('🎴 CARD CLOSE: Starting card close handler', {
      cardTitle: cardContent.title,
      discoveredSymbols: sceneState.discoveredSymbols,
      phase: sceneState.phase,
      timestamp: Date.now()
    });
    
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });
    
    if (cardContent.title?.includes("Musical Eyes Symbol")) {
      console.log('👁️ Eyes card closed - setting up progression to ears');
      
      setTimeout(() => {
        console.log('👁️ Eyes card: Triggering GameCoach wisdom');
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'eyes_wisdom',
          // ✅ ENSURE: Clear any blocking flags
          isReloadingGameCoach: false,
          symbolDiscoveryState: null,
          sidebarHighlightState: null
        });
        setPendingAction('materialize-ears');
      }, 500);
    }
    
    else if (cardContent.title?.includes("Musical Ears Symbol")) {
      console.log('👂 Ears card closed - setting up progression to tusk');
      
      setTimeout(() => {
        console.log('👂 Ears card: Triggering GameCoach wisdom');
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'ears_wisdom',
          // ✅ ENSURE: Clear any blocking flags
          isReloadingGameCoach: false,
          symbolDiscoveryState: null,
          sidebarHighlightState: null
        });
        setPendingAction('activate-tusk');
      }, 300);
    }
    
    else if (cardContent.title?.includes("Musical Tusk Symbol")) {
      console.log('🐘 Tusk card closed - setting up final progression');
      
      setTimeout(() => {
        console.log('🐘 Tusk card: Triggering GameCoach wisdom');
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'tusk_wisdom',
          // ✅ ENSURE: Clear any blocking flags
          isReloadingGameCoach: false,
          symbolDiscoveryState: null,
          sidebarHighlightState: null
        });
        setPendingAction('final-celebration');
        
        // ✅ ADD: Debug final flow
        console.log('🐘 TUSK CARD CLOSE: Set up final celebration flow', {
          readyForWisdom: true,
          gameCoachState: 'tusk_wisdom',
          pendingAction: 'final-celebration'
        });
      }, 300);
    }
    
    // ✅ ADD: Fallback debug logging
    else {
      console.warn('🎴 CARD CLOSE: Unknown card type, no progression triggered', {
        cardTitle: cardContent.title,
        availableActions: ['eyes', 'ears', 'tusk']
      });
    }
  };*/

  // Symbol info close handler
  /*const handleSymbolInfoClose = () => {
    console.log('🔍 Closing SymbolSceneIntegration');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });
    
    if (popupBookContent.title?.includes("Eyes") || popupBookContent.title?.includes("Musical Eyes")) {
      console.log('👁️ Eyes info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          eyes: true
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'eyes_highlighting'
      });
      
      safeSetTimeout(() => {
        console.log('🎉 Showing eyes celebration after sidebar highlight');
        showSymbolCelebration('eyes');
      }, 1000);
      
    } else if (popupBookContent.title?.includes("Ears") || popupBookContent.title?.includes("Musical Ears")) {
      console.log('👂 Ears info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          ear: true,
          ears: true,  // ← Keep this for GameCoach
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'ear_highlighting'
      });
      
      safeSetTimeout(() => {
        console.log('🎉 Showing ears celebration after sidebar highlight');
        showSymbolCelebration('ears');
      }, 1000);
      
    } else if (popupBookContent.title?.includes("Tusk") || popupBookContent.title?.includes("Musical Tusk")) {
      console.log('🐘 Tusk info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          tusk: true
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'tusk_highlighting'
      });
      
      safeSetTimeout(() => {
        console.log('🎉 Showing tusk celebration after sidebar highlight');
        showSymbolCelebration('tusk');
      }, 1000);
    }
    
    // ✅ ADD: Debug what's happening
    else {
      console.warn('🔍 SYMBOL INFO CLOSE: Unknown popup type', {
        title: popupBookContent.title,
        availableTypes: ['Eyes', 'Ears', 'Tusk']
      });
    }
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }*/
  
  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager 
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
<div className={`symbol-mountain-scene-v2-container ${getContainerClass()}`}>
          <div className="mountain-background" style={{ backgroundImage: `url(${mountainBackground})` }}>

            {/* STORY INTRODUCTION */}
{sceneState.phase === PHASES.EYES_GAME && !sceneState.welcomeShown && (
  <>
    {/* Gentle glow on background elements */}
    <div style={{
      position: 'absolute',
      top: '25%',
      left: '20%',
      animation: 'gentle-glow 3s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={ganeshaEyes} alt="Divine Eyes" style={{width: '80px', opacity: 0.8}} />
    </div>
    
    <div style={{
      position: 'absolute',
      top: '35%',
      right: '15%',
      animation: 'gentle-breathe 4s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={ganeshaTusk} alt="Sacred Tusk" style={{width: '70px', opacity: 0.9}} />
    </div>

    {/* Story Modal */}
    <div style={{
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '25px 35px',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 100,
      maxWidth: '400px'
    }}>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#8e24aa',
        marginBottom: '10px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        Musical Mountain Adventure
      </div>
      
      <div style={{
        fontSize: '15px',
        color: '#ff8c00',
        marginBottom: '8px'
      }}>
        Discover the sacred musical instruments!
      </div>
      
      <div style={{
        fontSize: '13px',
        color: '#666',
        marginBottom: '20px',
        fontStyle: 'italic'
      }}>
        Use divine vision to find hidden treasures, master rhythms, and assemble Lord Ganesha
      </div>
      
      <button
        onClick={() => {
          sceneActions.updateState({ welcomeShown: true });
        }}
        style={{
          background: 'linear-gradient(135deg, #8e24aa 0%, #ba68c8 100%)',
          border: 'none',
          color: 'white',
          padding: '12px 25px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '25px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 15px rgba(142, 36, 170, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Begin the Adventure
      </button>
    </div>
  </>
)}
            
            {/* 👁️ EYES SYMBOL - Always visible first */}
            {!sceneState.discoveredSymbols?.eyes && (
            <div 
              className={`eyes-symbol-container ${sceneState.eyesGameComplete ? 'completed' : 'active'}`}
              onClick={handleEyesClick}
            >
              <ClickableElement
                id="eyes-symbol"
                onClick={handleEyesClick}
                completed={sceneState.eyesGameComplete}
                zone="eyes-zone"
              >
                <img 
                  src={ganeshaEyes}
                  alt="Divine Eyes Symbol"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    filter: sceneState.eyesGameComplete ? 'brightness(1.2) saturate(0.5) hue-rotate(15deg) sepia(0.2)' : 'brightness(1.0) saturate(0.5) hue-rotate(15deg) sepia(0.2)',
                    cursor: 'pointer'
                  }}
                />
              </ClickableElement>
              
              {showSparkle === 'eyes-activation' && (
                <SparkleAnimation
                  type="magic"
                  count={20}
                  color="#4a90e2"
                  size={12}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
            )}

            {/* 🔭 INLINE EYES TELESCOPE GAME */}
            {sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes && (
              <EyesTelescopeGame
                isActive={sceneState.showEyesTelescopeGame}
                instrumentPositions={instrumentPositions}
                discoveryRadius={15}
                profileName={profileName}

                // ✅ ADD THESE 3 LINES HERE:
    initialDiscoveredInstruments={sceneState.discoveredInstruments || {}}
    initialFoundInstruments={sceneState.foundInstruments || []}
    isReload={isReload && sceneState.showEyesTelescopeGame}
    
                onInstrumentFound={(instrumentType, allFound, discovered) => {
                  console.log(`🎵 Found: ${instrumentType}`);
                  
                  sceneActions.updateState({
                    foundInstruments: allFound,
                    discoveredInstruments: discovered,
                    instrumentsFound: allFound.length
                  });
                }}
                onAllInstrumentsFound={(allFound, discovered) => {
                  console.log('🔭 All instruments found - completing eyes game');
                  
                  sceneActions.updateState({
                    foundInstruments: allFound,
                    discoveredInstruments: discovered,
                    instrumentsFound: 4,
                    eyesGameComplete: true,
                    showEyesTelescopeGame: false,
                    phase: PHASES.EYES_COMPLETE
                  });
                  
                  setTimeout(() => {
                    handleEyesGameComplete();
                  }, 1000);
                }}
                onClose={() => {
                  sceneActions.updateState({ 
                    showEyesTelescopeGame: false 
                  });
                }}
              />
            )}

            {/* 👂 EARS SYMBOL - Only appears after eyes complete */}
            {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && !sceneState.earsGameComplete && (
              <div 
                className={`ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized`}
                onClick={handleEarsClick}
              >
                <ClickableElement
                  id="ears-symbol"
                  onClick={handleEarsClick}
                  completed={sceneState.earsGameComplete}
                  zone="ears-zone"
                >
                  <img 
                    src={ganeshaEars}
                    alt="Sacred Ears Symbol"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      filter: sceneState.earsGameComplete ? 'brightness(1.2) saturate(1.3)' : 'brightness(0.8)',
                      cursor: 'pointer'
                    }}
                  />
                </ClickableElement>
                
                {showSparkle === 'ears-activation' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#ff8c00"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
                
                {showSparkle === 'ears-materialize' && (
                  <SparkleAnimation
                    type="glitter"
                    count={30}
                    color="gold"
                    size={15}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* 🎵 INLINE EARS RHYTHM GAME */}
            {sceneState.showEarsRhythmGame && (
              <EarsRhythmGame
                isActive={sceneState.showEarsRhythmGame}
                currentNote={sceneState.currentNote || 'note1'}
                discoveredInstruments={sceneState.discoveredInstruments}
                profileName={profileName}

    // ✅ ADD THESE 3 LINES:
    isReload={isReload && sceneState.showEarsRhythmGame}
    initialGamePhase={sceneState.earsGamePhase || 'waiting'}
    initialPlayerInput={sceneState.earsPlayerInput || []}
     initialCurrentSequence={sceneState.earsCurrentSequence || []}
  initialSequenceItemsShown={sceneState.earsSequenceItemsShown || 0}
  sequenceJustCompleted={sceneState.earsSequenceJustCompleted || false}
  readyForNextNote={sceneState.earsReadyForNextNote || false}
  lastCompletedNote={sceneState.earsLastCompletedNote || null}

                onSequenceComplete={(noteId) => {
                  console.log(`🎉 Sequence completed for: ${noteId}`);
                  
                  const newNoteStates = {
                    ...sceneState.musicalNoteStates,
                    [noteId]: 'golden'
                  };
                  
                  sceneActions.updateState({
                    musicalNoteStates: newNoteStates,
                    //showEarsRhythmGame: false
                  });

                    // ✅ ADD: Clear ears game state for next note
  sceneActions.updateState({
    musicalNoteStates: newNoteStates,
    // Clear ears game state for fresh start on next note
    earsGamePhase: 'waiting',           // ← ADD: Reset phase
    earsPlayerInput: [],                // ← ADD: Clear input
    earsCurrentSequence: [],            // ← ADD: Clear sequence  
    earsSequenceItemsShown: 0,          // ← ADD: Reset progress
    earsSequenceJustCompleted: false,   // ← ADD: Clear completion flag
    earsReadyForNextNote: false,        // ← ADD: Clear ready flag
    earsLastCompletedNote: null         // ← ADD: Clear last completed
  });
                  
                  setShowSparkle(`note-${noteId}-golden`);
                  
                  setTimeout(() => {
                    setShowSparkle(null);
                  }, 2000);
                  
                  const goldenNotes = Object.values(newNoteStates).filter(state => state === 'golden');
                  if (goldenNotes.length === 3) {
                    handleEarsGameComplete();
                  } else {
                    const nextNote = noteId === 'note1' ? 'note2' : 'note3';
                    setTimeout(() => {
                      sceneActions.updateState({
                        currentNote: nextNote,
                        //showEarsRhythmGame: true
                      });
                    }, 500);
                  }
                }}
                onGameComplete={() => {
                  console.log('🎉 All ears game complete!');
                  handleEarsGameComplete();
                }}
                onClose={() => {
                  sceneActions.updateState({ 
                    showEarsRhythmGame: false 
                  });
                }}
              />
            )}

            {sceneState.musicalNotesVisible && (
              <>
                {musicalNoteData.map((noteData, index) => {
                  const noteState = sceneState.musicalNoteStates[noteData.id];
                  const isGolden = noteState === 'golden';
                  const isUsed = noteState === 'used';
                  
                  // Position mapping
                  const positions = {
                    'note1': { top: '17%', left: '27%' },
                    'note2': { top: '22%', left: '47%' },
                    'note3': { top: '19%', left: '67%' }
                  };
                  
                  const position = positions[noteData.id];
                  
                  if (isUsed) return null; // Don't render used notes
                  
                  return (
                    <div 
                      key={noteData.id}
                      style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: '60px',          // ← BIGGER
                        height: '60px',         // ← BIGGER  
                        zIndex: 45,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isGolden ? 1 : 0.6,
                        transition: 'opacity 0.5s ease',  // ← ONLY opacity transition
                        // Golden glow effect - safe with box-shadow
                        filter: 'none',  // ← ENSURE no filters
                        textShadow: isGolden 
                          ? '0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4)' 
                          : 'none'
                      }}
                    >
                      <DraggableItem
                        id={`musical-note-${noteData.id}`}
                        data={{ type: 'musical-note', noteId: noteData.id, emoji: noteData.emoji, state: noteState }}
                        onDragStart={(id, data) => console.log('🎵 Dragging musical note:', id, data)}
                        onDragEnd={(id) => console.log('🎵 Musical note drag ended:', id)}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'grab',
                          fontSize: '40px'
                        }}>
                          {noteData.emoji}
                        </div>
                      </DraggableItem>
                    </div>
                  );
                })}
              </>
            )}

            {/* ✅ ENHANCED: Sacred Tusk Assembly Area - Integrated directly in main scene */}
            {sceneState.showTuskAssemblyGame && (
              <div className="sacred-tusk-assembly-area" style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                width: '200px',
                height: '220px',
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
                pointerEvents: 'none'  // ← ADD THIS LINE
              }}>

                {/* Unified Sacred Ganesha - Smooth Transition */}
                {(sceneState.showGaneshaOutline || sceneState.ganeshaComplete) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '60%',
                    width: '260px',
                    height: '290px',
                    transform: 'translateX(-50%)',
                    opacity: 0.8,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '60px',
                    filter: sceneState.tuskPower > 0 ? `brightness(${1.1 + (sceneState.tuskPower * 0.1)}) 
            drop-shadow(0 0 ${5 + (sceneState.tuskPower * 5)}px rgba(255, 215, 0, ${0.2 + (sceneState.tuskPower * 0.1)}))` : 'none',
                    transition: 'all 0.8s ease'
                  }}>
                    <img 
                      src={sceneState.ganeshaComplete ? ganeshaComplete : ganeshaOutline}
                      alt={sceneState.ganeshaComplete ? "Complete Lord Ganesha - Divine Assembly Complete" : "Ganesha Outline Waiting for Assembly"}
                      style={{
                        width: sceneState.ganeshaComplete ? '80%' : '100%',      // ← SMALLER WHEN COMPLETE
                        height: sceneState.ganeshaComplete ? '80%' : '100%',     // ← SMALLER WHEN COMPLETE
                        opacity: 1,
                        filter: sceneState.ganeshaComplete ? 'none' : 'brightness(1.4) contrast(1.3) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))',
                        transition: 'all 0.8s ease',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                    />
                    
                    {/* Divine outline glow when tusk is powering up */}
                    {sceneState.tuskPower > 0 && !sceneState.ganeshaComplete && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'divineGlow 2.5s infinite'
                      }} />
                    )}
                    
                    {/* Magnificent divine completion sparkles */}
                    {showSparkle === 'ganesha-complete' && (
                      <SparkleAnimation
                        type="magic"
                        count={60}
                        color="#ffd700"
                        size={18}
                        duration={4500}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                )}
                
                {/* Sacred Tusk Drop Zone - Enhanced visual feedback */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',       // ← Move tusk higher within assembly area
                  left: '30%',          // ← Move tusk left within assembly area  
                  width: '120px',
                  height: '120px',
                  transform: 'translateX(-30%)',   // ← Adjust transform accordingly
                  zIndex: 30
                }}>
                    
                  <DropZone
                    id="tusk-feeding-zone"
                    acceptTypes={['musical-note']}
                    onDrop={handleTuskNoteDrop}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: 'none',                    // ← REMOVE DASH BORDER
                      position: 'relative',              // ← ADD THIS
                      left: '200px',                     // ← ADD THIS (moves tusk left)
                      top: '15px',                       // ← ADD THIS (moves tusk down)
                      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 70%, transparent 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '50px',
                      filter: tuskGlowing ? 'brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))' : 'brightness(1.1)',
                      transition: 'all 0.5s ease',
                      pointerEvents: 'auto'  // ← ADD THIS LINE to re-enable for drop zone only
                    }}
                  >
                    <img 
                      src={ganeshaTusk}
                      alt="Sacred Tusk"
                      style={{
                        width: '60px',
                        height: '60px',
                        filter: sceneState.tuskPower > 0 ? `brightness(${1.2 + (sceneState.tuskPower * 0.2)}) 
            drop-shadow(0 0 ${8 + (sceneState.tuskPower * 4)}px #ffd700)` : 'brightness(1.1)',    
                        transition: 'all 0.8s ease'
                      }}
                    />
                    
                    {/* Sacred tusk power glow effect */}
                    {sceneState.tuskPower > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '-8px',
                        right: '-8px',
                        bottom: '-8px',
                        background: `radial-gradient(circle, rgba(255,255,255,${0.15 + sceneState.tuskPower * 0.1}) 0%, transparent 70%)`,
                        borderRadius: '50%',
                        animation: `sacredPower${sceneState.tuskPower} 2s infinite`,
                        pointerEvents: 'none'
                      }} />
                    )}
                  </DropZone>
                  
                  {/* Enhanced Power counter with cultural significance */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '14px',
                    color: '#8B4513',
                    background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.95), rgba(255, 235, 205, 0.95))',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)'
                  }}>
                    ✨ Divine Power: {sceneState.tuskPower || 0}/3 ✨
                  </div>
                </div>

                {/* Assembly sparkle effects */}
                {(showSparkle === 'tusk-feeding' || showSparkle === 'ganesha-assembly') && (
                  <SparkleAnimation
                    type={showSparkle === 'ganesha-assembly' ? 'glitter' : 'magic'}
                    count={30}
                    color="#ffd700"
                    size={14}
                    duration={2500}
                    fadeOut={true}
                    area="full"
                  />
                )}

              </div>
            )}

            {showSparkle === 'eyes-complete' && (
  <SparkleAnimation
    type="star"
    count={30}
    color="#4a90e2"
    size={15}
    duration={2000}
    fadeOut={true}
    area="full"
  />
)}

{/* ✨ NEW: Symbol Learning Sparkle Effects */}
{showSparkle === 'eyes-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '25%',
    left: '30%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#87CEEB"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{showSparkle === 'ears-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '40%',
    right: '25%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#4ECDC4"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{showSparkle === 'tusk-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '60%',
    left: '50%',
    transform: 'translateX(-50%)',
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

{/* ✨ NEW: Animated Symbol Learning Text */}
          {sceneState.showEyesText && (
            <div className="eyes-text">
              All-Seeing Musical Wisdom 👁
            </div>
          )}
          
          {sceneState.showEarsText && (
            <div className="ears-text">
              Divine Musical Listening 👂
            </div>
          )}
          
          {sceneState.showTuskText && (
            <div className="tusk-text">
              Sacred Musical Assembly 🐘
            </div>
          )}

            {/* Enhanced CSS Animations for Assembly + Musical Note Positioning */}
            <style>{`
              /* Musical Note Positioning - Fixed cursor offset */
              .musical-note {
                position: absolute;
                width: 40px;
                height: 40px;
              }
              
              .musical-note-note1 {
                top: 17vh;
                left: 27vw;
              }
              
              .musical-note-note2 {
                top: 22vh;
                left: 47vw;
              }
              
              .musical-note-note3 {
                top: 19vh;
                left: 67vw;
              }
              
              @keyframes divineGlow {
                0%, 100% { 
                  opacity: 0.2;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.6;
                  transform: scale(1.05);
                }
              }
              
              @keyframes sacredPower1 {
                0%, 100% { opacity: 0.25; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.03); }
              }
              
              @keyframes sacredPower2 {
                0%, 100% { opacity: 0.35; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.05); }
              }
              
              @keyframes sacredPower3 {
                0%, 100% { opacity: 0.45; transform: scale(1); }
                50% { opacity: 0.85; transform: scale(1.07); }
              }
              
              @keyframes divineAppearance {
                0% { 
                  opacity: 0;
                  transform: translateX(-50%) scale(0.7);
                  filter: brightness(0.8) saturate(0.8);
                }
                40% {
                  opacity: 0.8;
                  transform: translateX(-50%) scale(1.15);
                  filter: brightness(1.8) saturate(1.8);
                }
                100% { 
                  opacity: 1;
                  transform: translateX(-50%) scale(1);
                  filter: brightness(1.5) saturate(1.5) drop-shadow(0 0 35px #ffd700);
                }
              }
              
              @keyframes messageGlow {
                0% { 
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }
                100% { 
                  box-shadow: 0 4px 25px rgba(255, 215, 0, 0.4);
                }
              }
              
              @keyframes goldenPulse {
                0%, 100% { 
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.7;
                  transform: scale(1.1);
                }
              }

               /* ✨ NEW: Animated Text Styles */
  .eyes-text {
    position: absolute;
    top: 30%;
    left: 35%;
    font-size: 24px;
    font-weight: bold;
    color: #87CEEB;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    animation: textFloat 3s ease-out forwards;
    z-index: 15;
  }
  
  .ears-text {
    position: absolute;
    top: 45%;
    right: 30%;
    font-size: 24px;
    font-weight: bold;
    color: #4ECDC4;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    animation: textGrow 3s ease-out forwards;
    z-index: 15;
  }
  
  .tusk-text {
    position: absolute;
    top: 65%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    animation: textBounce 3s ease-out forwards;
    z-index: 15;
  }
  
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
  
  @keyframes textBounce {
    0% {
      transform: translateX(-50%) translateY(30px) scale(0);
      opacity: 0;
    }
    50% {
      transform: translateX(-50%) translateY(-15px) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
    }
  }
            `}</style>

            {/* Various sparkle effects */}
            {showSparkle === 'eyes-complete' && (
              <SparkleAnimation
                type="star"
                count={30}
                color="#4a90e2"
                size={15}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'ears-complete' && (
              <SparkleAnimation
                type="star"
                count={30}
                color="#ff8c00"
                size={15}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'tusk-activate' && (
              <SparkleAnimation
                type="glitter"
                count={40}
                color="#DAA520"
                size={12}
                duration={3000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'tusk-complete' && (
              <SparkleAnimation
                type="magic"
                count={40}
                color="#ffd700"
                size={15}
                duration={3000}
                fadeOut={true}
                area="full"
              />
            )}

            {/* Divine light for GameCoach entrance */}
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

    <ProgressiveHintSystem
  ref={progressiveHintRef}
  sceneId={sceneId}
  sceneState={sceneState}
  hintConfigs={getHintConfigs()}
  characterImage={eyesCoach}
  initialDelay={12000}
  hintDisplayTime={10000}
  position="bottom-right"
  iconSize={60}
  zIndex={2000}
  enabled={shouldEnableHints()}  // ← ADD THIS
  disabledMessage="Great job!"   // ← ADD THIS
  onHintShown={() => setHintUsed(true)}
  onHintButtonClick={() => console.log("Hint button clicked")}
/>

          </div>
          
          {/* SymbolSceneIntegration for Symbol Information 
          <SymbolSceneIntegration
            show={showPopupBook}
            symbolImage={popupBookContent.symbolImage}
            title={popupBookContent.title}
            description={popupBookContent.description}
            sourceElement={currentSourceElement}
            onClose={handleSymbolInfoClose}
          />

          {/* MagicalCardFlip for Symbol Celebrations 
          <MagicalCardFlip
            show={showMagicalCard}
            backImage={cardContent.image}
            title={cardContent.title}
            stars={cardContent.stars}
            onClose={handleCloseCard}
            autoFlip={false}
            autoFlipDelay={5000}
            animationDuration={6000}
          />

          {/* Real Confetti Effect */}
          {showMagicalCard && (cardContent.title?.includes("Musical Eyes Symbol") || cardContent.title?.includes("Musical Ears Symbol") || cardContent.title?.includes("Musical Tusk Symbol")) && (
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

          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              console.log('🧹 HOME: Cleaning GameCoach before navigation');
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              const activeProfile = GameStateManager.getActiveProfile();
              const name = activeProfile?.name || 'little explorer';
              
              console.log(`Great musical progress, ${name}!`);
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
                 onStartFresh={() => resetScene()}  // ← ADD THIS LINE

            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.phase === PHASES.ALL_COMPLETE ? 1 : 0,
              total: 1
            }}
          />

          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
            {...CulturalProgressExtractor.getCulturalProgressData()}
          />

<SymbolSidebar 
  discoveredSymbols={{
    // Show previous symbols from earlier scenes (highlighted from start)
    mooshika: true,
    modak: true,
    belly: true,
    lotus: true,
    trunk: true,
    // Add current scene discoveries
    ...(sceneState.discoveredSymbols || {})
  }}
  onSymbolClick={(symbolId) => {
    console.log(`Sidebar symbol clicked: ${symbolId}`);
  }}
/>

          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={8000}
 // In your tusk scene Fireworks component onComplete callback:
onComplete={() => {
  console.log('🎆 FIREWORKS CALLBACK STARTED');

  // ✅ IMMEDIATE: Stop ALL sparkle effects
  setShowSparkle(null);
  
  // ✅ CRITICAL: Save completion to GameStateManager
  const profileId = localStorage.getItem('activeProfileId');
  console.log('🔍 Profile ID for cleanup:', profileId);
  
  if (profileId) {
    try {
      // ✅ SAVE: Mark symbol scene as completed
      GameStateManager.saveGameState('symbol-mountain', 'symbol', {
        completed: true,
        stars: 9,
        symbols: { eyes: true, ears: true, tusk: true },
        phase: 'complete',
        unlocked: true,
        timestamp: Date.now()
      });
      
      console.log('✅ SAVE: Symbol scene completion saved successfully');
      
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
    }
    
    // ✅ CLEANUP: Remove temp storage
    const tempKey = `temp_session_${profileId}_symbol-mountain_symbol`;
    console.log('🔍 Removing temp key:', tempKey);
    localStorage.removeItem(tempKey);
    console.log('✅ CLEANUP: Temp storage removed');
    
    SimpleSceneManager.clearCurrentScene();
  }

  // ✅ Show completion screen
  console.log('🎆 Setting showSceneCompletion to true');
  setShowSceneCompletion(true);
  
  console.log('🎆 FIREWORKS CALLBACK FINISHED');
}}
            />
          )}

          {/* ✅ DEBUG: Log SceneCompletionCelebration state */}
          {console.log('🎯 RENDER CHECK: SceneCompletionCelebration', {
            show: showSceneCompletion,
            timestamp: Date.now()
          })}

{/* Scene Completion - FIXED: Single state control */}
{showSceneCompletion && (
  <SceneCompletionCelebration
    show={true}  // Always true when rendered
    sceneName="Musical Mountain Adventure"
    sceneNumber={3}
    totalScenes={4}
    starsEarned={9}
    totalStars={9}
    discoveredSymbols={[
      'mooshika', 'modak', 'belly',    // Previous symbols (3)
      'lotus', 'trunk',                // Pond scene symbols (2)
      'eyes', 'ears', 'tusk'           // Current scene symbols (3)
    ].filter(symbol => sceneState.discoveredSymbols?.[symbol])}
    symbolImages={{
      mooshika: symbolMooshikaColored,
      modak: symbolModakColored,
      belly: symbolBellyColored,
      lotus: symbolLotusColored,
      trunk: symbolTrunkColored,
      eyes: symbolEyesColored,
      ears: symbolEarColored,
      tusk: symbolTuskColored
    }}
    nextSceneName="Final Assembly"
    sceneId="symbol"
    completionData={{
      stars: 9,
      symbols: { 
        mooshika: true, modak: true, belly: true,
        lotus: true, trunk: true,
        eyes: true, ears: true, tusk: true 
      },
      completed: true,
      totalStars: 9
    }}
    onComplete={onComplete}

         onReplay={() => {
  console.log('🔄 INSTANT REPLAY: Garden Adventure restart');
  setShowSceneCompletion(false);  // Hide completion screen
  resetScene();  // Use the hook instead of all that complex logic
}}

    onContinue={() => {
      console.log('🔧 MUSICAL MOUNTAIN CONTINUE: Going to next scene + preserving resume');
      
      // 1. Enhanced GameCoach clearing
      if (clearManualCloseTracking) {
        clearManualCloseTracking();
        console.log('✅ MUSICAL MOUNTAIN CONTINUE: GameCoach manual tracking cleared');
      }
      if (hideCoach) {
        hideCoach();
        console.log('✅ MUSICAL MOUNTAIN CONTINUE: GameCoach hidden');
      }
      
      // Enhanced GameCoach timeout
      setTimeout(() => {
        console.log('🎭 MUSICAL MOUNTAIN CONTINUE: Forcing GameCoach fresh start for next scene');
        if (clearManualCloseTracking) {
          clearManualCloseTracking();
          console.log('🎭 MUSICAL MOUNTAIN CONTINUE: GameCoach cleared again after delay');
        }
      }, 500);
      
      // 2. Save completion data
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        try {
          ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'symbol', {
            completed: true,
            stars: 9,
            symbols: { eyes: true, ears: true, tusk: true }
          });
          
          GameStateManager.saveGameState('symbol-mountain', 'symbol', {
            completed: true,
            stars: 9,
            symbols: { eyes: true, ears: true, tusk: true },
            unlocked: true,
            timestamp: Date.now()
          });
          
          console.log('✅ MUSICAL MOUNTAIN CONTINUE: Completion data saved');
        } catch (error) {
          console.error('❌ MUSICAL MOUNTAIN CONTINUE SAVE ERROR:', error);
          console.log('🔄 MUSICAL MOUNTAIN CONTINUE: Navigation continues despite save error');
        }
      }

      // 3. Set NEXT scene for resume tracking
      setTimeout(() => {
        SimpleSceneManager.setCurrentScene('symbol-mountain', 'final-scene', false, false);
        console.log('✅ MUSICAL MOUNTAIN CONTINUE: Next scene (final-scene) set for resume tracking');
        
        onNavigate?.('scene-complete-continue');
      }, 100);
    }}
  />
)}
<BackToMapButton 
  onNavigate={onNavigate}
  hideCoach={hideCoach}
  clearManualCloseTracking={clearManualCloseTracking}
  position="bottom-left"
/>

          {/* 🧪 TESTING BUTTONS - Remove before production 
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <button 
                onClick={() => {
                  console.log('🧪 TEST: Completing Eyes Game');
                  sceneActions.updateState({
                    eyesGameComplete: true,
                    showEyesTelescopeGame: false,
                    foundInstruments: ['tabla', 'flute', 'bells', 'cymbals'],
                    discoveredInstruments: {
                      tabla: true,
                      flute: true, 
                      bells: true,
                      cymbals: true
                    },
                    instrumentsFound: 4,
                    phase: PHASES.EYES_COMPLETE,
                    earsVisible: true
                  });
                }}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🎯 Complete Eyes Game
              </button>


<button 
  onClick={() => {
    console.log('🧪 EARS STATE DEBUG:', {
      earsGamePhase: sceneState.earsGamePhase,
      earsPlayerInput: sceneState.earsPlayerInput,
      showEarsRhythmGame: sceneState.showEarsRhythmGame,
      currentNote: sceneState.currentNote,
      isReload: isReload
    });
  }}
  style={{
    background: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer'
  }}
>
  🎵 Debug Ears State
</button>
              <button 
                onClick={() => {
                  console.log('🧪 TEST: Completing Ears Game');
                  sceneActions.updateState({
                    earsGameComplete: true,
                    showEarsRhythmGame: false,
                    musicalNotesVisible: true,
                    musicalNoteStates: {
                      note1: 'golden',
                      note2: 'golden', 
                      note3: 'golden'
                    },
                    phase: PHASES.EARS_COMPLETE,
                    showTuskAssemblyGame: true,
                    tuskGameActive: true,
                    showGaneshaOutline: true
                  });
                }}
                style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🎵 Complete Ears Game
              </button>

              <button 
  onClick={() => {
    // Set up ears game in middle of sequence
    sceneActions.updateState({
      showEarsRhythmGame: true,
      earsGameActive: true,
      earsGamePhase: 'listening',
      earsPlayerInput: ['tabla'], // Partially completed
      currentNote: 'note2',
      musicalNotesVisible: true,
      earsVisible: true
    });
  }}
  style={{
    background: '#FF5722',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer'
  }}
>
  🎵 Test Ears Reload
</button>

              <button 
                onClick={() => {
                  console.log('🧪 TEST: Reset to Beginning');
                  sceneActions.updateState({
                    phase: PHASES.EYES_GAME,
                    activeGame: 'eyes',
                    completedGames: [],
                    currentFocus: 'eyes',
                    eyesGameComplete: false,
                    earsGameComplete: false,
                    earsVisible: false,
                    musicalNotesVisible: false,
                    showTuskAssemblyGame: false,
                    tuskGameActive: false,
                    musicalNoteStates: {
                      note1: 'gray',
                      note2: 'gray',
                      note3: 'gray'
                    },
                    discoveredSymbols: {},
                    ganeshaComplete: false
                  });
                }}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset Game
              </button>

              <button 
                onClick={() => {
                  console.log('🧪 TEST: Manual Completion Screen');
                  console.log('🧪 Current state before manual trigger:', {
                    showSceneCompletion,
                    showingCompletionScreen: sceneState.showingCompletionScreen,
                    completed: sceneState.completed
                  });
                  setShowSceneCompletion(true);
                  console.log('🧪 Manually set showSceneCompletion to true');
                }}
                style={{
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🎯 Test Completion
              </button>

              <button 
  onClick={() => {
    console.log('🧪 COMPLETE ALL: Running full completion sequence');
    
    // ✅ STEP 1: Complete all games and set discovered symbols
    sceneActions.updateState({
      // Eyes game completed
      eyesGameComplete: true,
      showEyesTelescopeGame: false,
      foundInstruments: ['tabla', 'flute', 'bells', 'cymbals'],
      discoveredInstruments: {
        tabla: true,
        flute: true, 
        bells: true,
        cymbals: true
      },
      instrumentsFound: 4,
      
      // Ears game completed  
      earsGameComplete: true,
      earsVisible: true,
      showEarsRhythmGame: false,
      musicalNotesVisible: true,
      musicalNoteStates: {
        note1: 'used',  // All notes used in tusk
        note2: 'used',
        note3: 'used'
      },
      
      // Tusk game completed
      showTuskAssemblyGame: true,
      tuskGameActive: true,
      showGaneshaOutline: true,
      tuskPower: 3,
      tuskFullyPowered: true,
      ganeshaComplete: true,
      ganeshaAssembling: false,
      
  discoveredSymbols: {
  // All 8 symbols for testing
  mooshika: true,
  modak: true,
  belly: true,
  lotus: true,
  trunk: true,
  eyes: true,
  ear: true,
  tusk: true
},
      // Final completion state
      phase: PHASES.ALL_COMPLETE,
      stars: 9,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 9,
        completed: true
      },
      
      // Clear any blocking states
      symbolDiscoveryState: null,
      sidebarHighlightState: null,
      currentPopup: null,
      isReloadingGameCoach: false,
      welcomeShown: true,
      eyesWisdomShown: true,
      earsWisdomShown: true,
      tuskWisdomShown: true
    });
    
    // ✅ STEP 2: Trigger final fireworks after brief delay
    setTimeout(() => {
      console.log('🎆 COMPLETE ALL: Triggering fireworks');
      showSymbolCelebration('final');
    }, 1000);
  }}
  style={{
    background: '#9C27B0',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer'
  }}
>
  🎆 Complete All Phases
</button>
            </div>
          )}*/}
        </div>       
      </MessageManager>
    </InteractionManager>
  );
};

<style>{`
  /* Stronger CSS to completely hide scene content */
  .symbol-mountain-scene-v2-container.checking-completion .mountain-background,
  .symbol-mountain-scene-v2-container.checking-completion .eyes-symbol-container,
  .symbol-mountain-scene-v2-container.checking-completion .ears-symbol-container,
  .symbol-mountain-scene-v2-container.checking-completion .sacred-tusk-assembly-area,
  .symbol-mountain-scene-v2-container.checking-completion .musical-note {
    display: none !important;
  }
  
  .symbol-mountain-scene-v2-container.checking-completion {
    background: transparent !important;
  }
`}</style>

export default SymbolMountainSceneV2;