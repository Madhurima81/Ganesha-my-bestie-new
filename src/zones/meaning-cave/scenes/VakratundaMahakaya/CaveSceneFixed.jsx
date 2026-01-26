// zones/cave-of-secrets/scenes/vakratunda-mahakaya/CaveSceneFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CaveSceneFixed.css';

// Import scene management components (PROVEN FROM POND)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CurvedPathTracer from './CurvedPathTracer';

// UI Components (PROVEN FROM POND)
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
import doorImage from './assets/images/door-image.png';
import DoorComponent from '../../components/DoorComponent';
import ganeshaComplete from './assets/images/ganesha-complete.png';


// Cave images
import caveBackground from './assets/images/cave-background.png';
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';

const CAVE_PHASES = {
  // Part 1: Vakratunda Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  TRACE_INTRO: 'trace_intro',
  TRACE_ACTIVE: 'trace_active',
  TRACE_COMPLETE: 'trace_complete',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  
  // Part 2: Mahakaya Learning  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GROW_INTRO: 'grow_intro',
  GROW_ACTIVE: 'grow_active',
  GROW_COMPLETE: 'grow_complete',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};


// Error Boundary (PROVEN FROM POND)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Cave Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Cave.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Cave Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CaveSceneFixed = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  console.log('CaveSceneFixed props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
      // Door 1 state (Va-kra-tun-da)
door1State: 'waiting',
door1SyllablesPlaced: [],
door1Completed: false,
door1CurrentStep: 0,
door1Syllables: ['Va', 'kra', 'tun', 'da'],

// Door 2 state (Ma-ha-ka-ya)  
door2State: 'waiting',
door2SyllablesPlaced: [],
door2Completed: false,
door2CurrentStep: 0,
door2Syllables: ['Ma', 'ha', 'ka', 'ya'],

// Game 1: Tracing state (EXACT from VakratundaV4)
tracingStarted: false,
tracedPoints: [],
traceProgress: 0,
traceQuality: 'good',
tracingCompleted: false,
trunkPosition: { x: 50, y: 100 },
canResumeTracing: false,

// ✅ NEW: Sequential path validation
currentPathSegment: 0,        // Which segment user must reach next (0-5)
segmentsCompleted: [],        // Array of completed segments
mustFollowSequence: true,     // Force sequential progress

// ✅ NEW: Mini Ganesha always visible
ganeshaVisible: false,

ganeshaAnimation: 'breathing',
ganeshaSize: 0.8,
ganeshaGlow: 0.2,

// Game 2: Growing Ganesha state
growingStarted: false,
stonesClicked: 0,
floatingStones: [
  { id: 1, clicked: false, x: 20, y: 30 },  // Head stone
  { id: 2, clicked: false, x: 70, y: 20 },  // Trunk stone
  { id: 3, clicked: false, x: 30, y: 60 },  // Body stone
  { id: 4, clicked: false, x: 80, y: 50 }   // Legs stone
],
growingCompleted: false,
          
          // Sanskrit learning
          learnedWords: {
            vakratunda: { learned: false, scene: 1 },
            mahakaya: { learned: false, scene: 1 }
          },
          
          // Scene progression  
          phase: CAVE_PHASES.DOOR1_ACTIVE,
          currentFocus: 'door1',
          
          // Discovery and popup states (PROVEN SYSTEM)
          discoveredSymbols: {},
          currentPopup: null,
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // GameCoach states (PROVEN SYSTEM)
          gameCoachState: null,
          isReloadingGameCoach: false,
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          tracingIntroShown: false,
          
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
          <CaveSceneContent
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

const CaveSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('CaveSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });
  //if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.TRACE_INTRO });

  // Access GameCoach functionality (PROVEN FROM POND)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // State management (PROVEN FROM POND)
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs (PROVEN FROM POND)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function (PROVEN FROM POND)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const stoneImages = [
  stoneHead,   // Stone 1 - Head stone
  stoneTrunk,  // Stone 2 - Trunk stone  
  stoneBody,   // Stone 3 - Body stone
  stoneLegs    // Stone 4 - Legs stone
];

const getGaneshaAnimationClass = () => {
  console.log('🐘 Animation Debug:', {
    ganeshaVisible: sceneState.ganeshaVisible,
    ganeshaAnimation: sceneState.ganeshaAnimation,
    currentState: sceneState
  });
  
  if (!sceneState.ganeshaVisible) {
    console.log('🐘 Returning empty - ganeshaVisible is false');
    return '';
  }
  if (sceneState.ganeshaAnimation === 'happy') return 'happy';
  if (sceneState.ganeshaAnimation === 'growing') {
    console.log('🐘 Returning growing class');
    return 'growing';
  }
  if (sceneState.ganeshaAnimation === 'mighty') return 'mighty breathing';
  console.log('🐘 Returning default breathing');
  return 'breathing'; // Default animation
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

// ✅ FIXED: Simple CurvedPathTracer Integration
const renderTracingPath = () => {
  // Only show during tracing phases
  if (sceneState.phase !== CAVE_PHASES.TRACE_ACTIVE && 
      sceneState.phase !== CAVE_PHASES.TRACE_INTRO && 
      sceneState.phase !== CAVE_PHASES.TRACE_COMPLETE) {
    return null;
  }

  return (
    <div className="tracing-area" id="tracing-area">
<CurvedPathTracer
  onComplete={() => {
    console.log('🎉 Tracing completed via imported component!');
    completeTracing();
  }}
        onProgress={(progress, quality, tracedPath, currentSegment) => {
    sceneActions.updateState({
      traceProgress: progress,
      traceQuality: quality,
      // ✅ ADD: Save traced path points for resume

            tracedPoints: tracedPath || [], // ← REAL path points from component
      currentPathSegment: Math.floor(progress / 10)
    });
  }}
  disabled={false}
  showDebug={true}
  
  // ✅ ADD: Resume props
  isResuming={isReload}
  resumeProgress={sceneState.traceProgress || 0}
  resumeCurrentSegment={sceneState.currentPathSegment || 0}
  resumeSegmentsCompleted={sceneState.segmentsCompleted || []}
  resumeIsTracing={sceneState.tracingStarted && !sceneState.tracingCompleted}
  resumeTracedPath={sceneState.tracedPoints || []}
/>
    </div>
  );
};

const renderGrowingGame = () => {
  if (!sceneState.growingStarted) return null;

  return (
    <div className="growing-area" id="grow-area">
      <div className="floating-stones">
        {sceneState.floatingStones.map((stone, index) => (
          <div
            key={stone.id}
            className={`floating-stone ${stone.clicked ? 'clicked' : ''}`}
            style={{ 
              left: `${stone.x}%`, 
              top: `${stone.y}%`,
              display: stone.clicked ? 'none' : 'block'
            }}
            onClick={() => handleStoneClick(stone.id)}
          >
            <img src={stoneImages[index]} alt={`Stone ${stone.id}`} />
            {showSparkle === `stone-${stone.id}-clicked` && (
              <SparkleAnimation
                type="magic"
                count={10}
                color="#ffd700"
                size={8}
                duration={1000}
                fadeOut={true}
                area="full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

  // Cleanup timeouts on unmount (PROVEN FROM POND)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (PROVEN FROM POND)
  useEffect(() => {
    console.log('🧹 CAVE: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
  }, []);

  // GameCoach messages (ADAPTED FOR CAVE)
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Cave of Secrets, ${profileName}! Ancient Sanskrit wisdom awaits your discovery!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'vakratunda_wisdom',
      message: `Magnificent, ${profileName}! You've unlocked Vakratunda - the curved trunk of wisdom!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.vakratunda?.learned && !sceneState?.vakratundaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },

    {
  id: 'tracing_intro',
  message: `🐭 Help Mooshika reach Ganesha through his curved trunk! 🐘`,
  timing: 500,
  condition: () => sceneState?.phase === CAVE_PHASES.TRACE_INTRO && !sceneState?.tracingIntroShown
},

    {
      id: 'mahakaya_wisdom',
      message: `Wonderful, ${profileName}! You've mastered Mahakaya - the mighty form of divine strength!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.mahakaya?.learned && !sceneState?.mahakayaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

// ✅ REPLACE the getHintConfigs function in CaveSceneFixed.jsx with this:

const getHintConfigs = () => [
  {
    id: 'door1-hint',
    message: 'Try arranging the Sanskrit syllables in order!',
    explicitMessage: 'Drag Va-kra-tun-da syllables to spell Vakratunda!',
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState, hintLevel) => {
      if (!sceneState) return false;
      return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
             !sceneState?.door1Completed &&
             !showMagicalCard && !isVisible && !showPopupBook;
    }
  },
  {
    id: 'trace-hint', 
    message: 'Trace the curved path like Ganesha\'s trunk!',
    explicitMessage: 'Start at the green circle and follow the orange path!',
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState, hintLevel) => {
      if (!sceneState) return false;

      
       // ✅ SIMPLE: Show during any tracing phase
    return (sceneState?.phase === 'trace_intro' || 
            sceneState?.phase === CAVE_PHASES.TRACE_INTRO ||
            sceneState?.phase === CAVE_PHASES.TRACE_ACTIVE) &&
           !sceneState?.tracingCompleted &&
           !showMagicalCard && 
           !isVisible && 
           !showPopupBook;
    }
  },
  {
    id: 'door2-hint',
    message: 'Arrange the Sanskrit syllables for Mahakaya!',
    explicitMessage: 'Drag Ma-ha-ka-ya syllables to spell Mahakaya!',
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState, hintLevel) => {
      if (!sceneState) return false;
      return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
             !sceneState?.door2Completed &&
             !showMagicalCard && !isVisible && !showPopupBook;
    }
  },
  {
    id: 'grow-hint',
    message: 'Click the floating stones to make Ganesha grow!',
    explicitMessage: 'Tap each sacred stone to make Ganesha mighty!',
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState, hintLevel) => {
      if (!sceneState) return false;
      return sceneState?.phase === CAVE_PHASES.GROW_ACTIVE &&
             sceneState?.stonesClicked < 4 &&
             !showMagicalCard && !isVisible && !showPopupBook;
    }
  }
];

  // Watch for GameCoach visibility changes (PROVEN FROM POND)
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
     
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'start-door2':
            console.log('🚪 Starting Door 2 after GameCoach wisdom');
            sceneActions.updateState({
              phase: CAVE_PHASES.DOOR2_ACTIVE,
              gameCoachState: null,
              isReloadingGameCoach: false
            });
            break;
           
          case 'start-fireworks':
            console.log('🎆 Starting fireworks after final GameCoach wisdom');
            showFinalCelebration();
            break;
        }
       
        setPendingAction(null);
      }, 1000);
     
      timeoutsRef.current.push(actionTimer);
    }
   
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // GameCoach triggering system (PROVEN FROM POND)
  useEffect(() => {
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
        (matchingMessage.id === 'vakratunda_wisdom' && sceneState.vakratundaWisdomShown) ||
        (matchingMessage.id === 'mahakaya_wisdom' && sceneState.mahakayaWisdomShown) ||
        (matchingMessage.id === 'cave_welcome' && sceneState.welcomeShown);
     
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
              case 'tracing_intro':
    sceneActions.updateState({ tracingIntroShown: true });
    break;
          case 'vakratunda_wisdom':
            sceneActions.updateState({
              vakratundaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'vakratunda_wisdom'
            });
            setPendingAction('start-door2');
            break;
          case 'mahakaya_wisdom':
            sceneActions.updateState({
              mahakayaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'mahakaya_wisdom'
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
    sceneState?.vakratundaWisdomShown,
    sceneState?.mahakayaWisdomShown,
    sceneState?.readyForWisdom,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

  // CAVE SCENE RELOAD LOGIC - Add this useEffect to CaveSceneFixed.jsx
// Place this after your other useEffects, before the handler functions

useEffect(() => {
  if (!isReload || !sceneState) return;
 
 
  console.log('🔄 CAVE RELOAD: Starting comprehensive reload sequence', {
    currentPopup: sceneState.currentPopup,
    showingCompletionScreen: sceneState.showingCompletionScreen,
    completed: sceneState.completed,
    phase: sceneState.phase,
    door1Completed: sceneState.door1Completed,
    door2Completed: sceneState.door2Completed,
    tracingCompleted: sceneState.tracingCompleted,
    growingCompleted: sceneState.growingCompleted
  });

  // ✅ ENHANCED: Check for Play Again flag first
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
    console.log('🔄 CAVE RELOAD: Detected fresh restart after Play Again - clearing completion state');
    
    if (playAgainRequested === 'true') {
      localStorage.removeItem(playAgainKey);
      console.log('✅ CLEARED: Cave Play Again storage flag');
    }
    
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      showingCompletionScreen: false,
      currentPopup: null,
      completed: false,
      phase: CAVE_PHASES.DOOR1_ACTIVE
    });
    return;
  }

  // IMMEDIATELY block GameCoach normal flow
  sceneActions.updateState({ isReloadingGameCoach: true });
 
  setTimeout(() => {
   
    // 🔥 PRIORITY 1: Handle active symbol discovery states first
    if (sceneState.symbolDiscoveryState) {
      console.log('🔄 CAVE: Resuming symbol discovery:', sceneState.symbolDiscoveryState);
     
      switch(sceneState.symbolDiscoveryState) {
        case 'vakratunda_discovering':
          setPopupBookContent({
            title: "Vakratunda - The Curved Trunk",
            symbolImage: vakratundaCard,
            description: `Vakratunda means "curved trunk", ${profileName}! You traced the curved path like Ganesha's wise trunk. Ganesha's trunk can reach anywhere to help!`
          });
          setCurrentSourceElement('tracing-area');
          setShowPopupBook(true);
          sceneActions.updateState({
            currentPopup: 'vakratunda_info',
            isReloadingGameCoach: false
          });
          break;
         
        case 'mahakaya_discovering':
          setPopupBookContent({
            title: "Mahakaya - The Mighty Form",
            symbolImage: mahakayaCard,
            description: `Mahakaya means "mighty form", ${profileName}! You made Ganesha grow from tiny to mighty and golden. Ganesha is strong enough to help with any challenge!`
          });
          setCurrentSourceElement('grow-area');
          setShowPopupBook(true);
          sceneActions.updateState({
            currentPopup: 'mahakaya_info',
            isReloadingGameCoach: false
          });
          break;
      }
      return;
    }
   
    // 🔥 PRIORITY 2: Handle sidebar highlight states
    else if (sceneState.sidebarHighlightState) {
      console.log('🔄 CAVE: Resuming sidebar highlight:', sceneState.sidebarHighlightState);
     
      setTimeout(() => {
        const symbolType = sceneState.sidebarHighlightState === 'vakratunda_highlighting' ? 'vakratunda' : 'mahakaya';
        console.log(`🌟 CAVE: Resuming ${symbolType} celebration after sidebar highlight`);
        showSanskritCelebration(symbolType);
      }, 1000);
     
      sceneActions.updateState({ isReloadingGameCoach: false });
      return;
    }

    // 🔥 PRIORITY 3: Handle explicit popup states
    else if (sceneState.currentPopup) {
      console.log('🔄 CAVE: Resuming popup:', sceneState.currentPopup);
     
      switch(sceneState.currentPopup) {
        case 'vakratunda_info':
          setPopupBookContent({
            title: "Vakratunda - The Curved Trunk",
            symbolImage: vakratundaCard,
            description: `Vakratunda means "curved trunk", ${profileName}! You traced the curved path like Ganesha's wise trunk. Ganesha's trunk can reach anywhere to help!`
          });
          setCurrentSourceElement('tracing-area');
          setShowPopupBook(true);
          break;
         
        case 'vakratunda_card':
          setCardContent({
            title: `You've learned Vakratunda, ${profileName}!`,
            image: vakratundaCard,
            stars: 3
          });
          setShowMagicalCard(true);
          // ✅ Clear blocking flags
          setTimeout(() => {
            console.log('🎉 CAVE RELOAD: Clearing vakratunda celebration card reload flags');
            sceneActions.updateState({ 
              isReloadingGameCoach: false,
              symbolDiscoveryState: null,
              sidebarHighlightState: null
            });
          }, 500);
          break;

        case 'mahakaya_info':
          setPopupBookContent({
            title: "Mahakaya - The Mighty Form",
            symbolImage: mahakayaCard,
            description: `Mahakaya means "mighty form", ${profileName}! You made Ganesha grow from tiny to mighty and golden. Ganesha is strong enough to help with any challenge!`
          });
          setCurrentSourceElement('grow-area');
          setShowPopupBook(true);
          break;
         
        case 'mahakaya_card':
          setCardContent({
            title: `You've learned Mahakaya, ${profileName}!`,
            image: mahakayaCard,
            stars: 3
          });
          setShowMagicalCard(true);
          // ✅ Clear blocking flags  
          setTimeout(() => {
            console.log('🎉 CAVE RELOAD: Clearing mahakaya celebration card reload flags');
            sceneActions.updateState({ 
              isReloadingGameCoach: false,
              symbolDiscoveryState: null,
              sidebarHighlightState: null
            });
          }, 500);
          break;
  
        case 'final_fireworks':
          // ✅ CHECK: Is this a Play Again reset using storage?
          const profileId = localStorage.getItem('activeProfileId');
          const playAgainKey = `play_again_${profileId}_cave-of-secrets_vakratunda-mahakaya`;
          const playAgainRequested = localStorage.getItem(playAgainKey);
          
          if (playAgainRequested === 'true') {
            console.log('🚫 CAVE FIREWORKS BLOCKED: Play Again was clicked (from storage)');
            
            // Clear the flag
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
          
          // ✅ LEGITIMATE: Real fireworks reload
          console.log('🎆 CAVE: Resuming final fireworks');
          setShowSparkle('final-fireworks');
          sceneActions.updateState({
            gameCoachState: null,
            isReloadingGameCoach: false,
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

    // 3.5. HANDLE COMPLETION SCREEN RELOAD
    if (sceneState.showingCompletionScreen) {
      // ✅ CHECK: Is this a Play Again reset using storage?
      const profileId = localStorage.getItem('activeProfileId');
      const playAgainKey = `play_again_${profileId}_cave-of-secrets_vakratunda-mahakaya`;
      const playAgainRequested = localStorage.getItem(playAgainKey);
      
      if (playAgainRequested === 'true') {
        console.log('🚫 CAVE COMPLETION BLOCKED: Play Again was clicked');
        
        // Clear the flag
        localStorage.removeItem(playAgainKey);
        
        sceneActions.updateState({
          currentPopup: null,
          showingCompletionScreen: false,
          completed: false,
          phase: CAVE_PHASES.DOOR1_ACTIVE,
          stars: 0,
          isReloadingGameCoach: false
        });
        return;
      }
      
      // ✅ LEGITIMATE: Real completion screen reload
      console.log('🔄 CAVE: Resuming completion screen');
      setShowSceneCompletion(true);
      sceneActions.updateState({ isReloadingGameCoach: false });
      return;
    }

    // 🔥 PRIORITY 4: Handle GameCoach states
    else if (sceneState.gameCoachState) {
      console.log('🔄 CAVE: Resuming GameCoach:', sceneState.gameCoachState);
     
      switch(sceneState.gameCoachState) {
        case 'vakratunda_wisdom':
          console.log('📜 CAVE: Setting up vakratunda wisdom resume');
          sceneActions.updateState({
            readyForWisdom: true,
            vakratundaWisdomShown: false,
            isReloadingGameCoach: false
          });
          setPendingAction('start-door2');
          break;
         
        case 'mahakaya_wisdom':
          console.log('🏗️ CAVE: Setting up mahakaya wisdom resume');
          sceneActions.updateState({
            readyForWisdom: true,
            mahakayaWisdomShown: false,
            isReloadingGameCoach: false
          });
          setPendingAction('start-fireworks');
          break;
      }
    }
   

    // 🔥 PRIORITY 5: Handle mid-game states that need special attention

// ✅ ADD THIS ENTIRE BLOCK - Handle incomplete Door 1 completion and tracing start
else if (sceneState.door1Completed && !sceneState.tracingStarted && 
         sceneState.phase !== CAVE_PHASES.TRACE_INTRO && 
         sceneState.phase !== CAVE_PHASES.TRACE_ACTIVE &&
         !sceneState.symbolDiscoveryState && !sceneState.currentPopup) {
  console.log('🔄 CAVE: Door 1 completed but tracing not started - resuming tracing intro');
  sceneActions.updateState({
    phase: CAVE_PHASES.TRACE_INTRO,
    isReloadingGameCoach: false
  });
  return;
}

// ✅ ADD THIS ENTIRE BLOCK - Handle mid-tracing resume (THIS IS THE MISSING PIECE!)
else if (sceneState.tracingStarted && !sceneState.tracingCompleted && 
         sceneState.traceProgress > 0 && sceneState.traceProgress < 100) {
  console.log('🔄 CAVE: Resuming mid-tracing with progress:', sceneState.traceProgress);
  
  // Ensure we're in the right phase and Ganesha is visible
  sceneActions.updateState({ 
    phase: CAVE_PHASES.TRACE_ACTIVE,
    ganeshaVisible: true,
    ganeshaAnimation: 'breathing',
    isReloadingGameCoach: false 
  });
  return;
}

// ✅ ADD THIS ENTIRE BLOCK - Handle incomplete tracing completion
else if (sceneState.tracingCompleted && !sceneState.learnedWords?.vakratunda?.learned &&
         !sceneState.symbolDiscoveryState && !sceneState.currentPopup) {
  console.log('🔄 CAVE: Tracing completed but vakratunda discovery not started - triggering discovery');
  sceneActions.updateState({
    symbolDiscoveryState: 'vakratunda_discovering',
    currentPopup: 'vakratunda_info',
    phase: CAVE_PHASES.VAKRATUNDA_LEARNING,
    isReloadingGameCoach: false
  });
  
  setPopupBookContent({
    title: "Vakratunda - The Curved Trunk",
    symbolImage: vakratundaCard,
    description: `Vakratunda means "curved trunk", ${profileName}! You traced the curved path like Ganesha's wise trunk. Ganesha's trunk can reach anywhere to help!`
  });
  setCurrentSourceElement('tracing-area');
  setShowPopupBook(true);
  return;
}
    else {
      console.log('🔄 CAVE: No special reload needed, clearing flags');
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
    }
   
  }, 500);
 
}, [isReload]);

  // Door 1 handlers
const handleDoor1SyllablePlaced = (syllable) => {
  hideActiveHints();
  console.log(`Door 1 syllable placed: ${syllable}`);
  
  const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Va';
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
      setTimeout(() => {
        handleDoor1Complete();
      }, 1000);
    }
  } else {
    console.log(`❌ Wrong! Expected "${expectedSyllable}", got "${syllable}"`);
    if (showMessage) {
      showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
        duration: 2000,
        animation: 'shake',
        position: 'top-center'
      });
    }
  }
};

const handleDoor1Complete = () => {
  console.log('🚪 Door 1 completed - starting sparkle fade!');
  
  // ✅ STEP 1: Add sparkles immediately
  setShowSparkle('door1-completing');
  
  // ✅ STEP 2: Add fade class to door
  const doorElement = document.querySelector('.vakratunda-door .door-container');
  if (doorElement) {
    doorElement.classList.add('completing');
  }
  
  // ✅ STEP 3: Mark as completed but DON'T change phase yet
  sceneActions.updateState({
    door1Completed: true
    // ✅ REMOVED: Don't change phase here!
    // phase: CAVE_PHASES.DOOR1_COMPLETE
  });
  
  // ✅ STEP 4: Clear sparkles and change phase AFTER fade completes
  setTimeout(() => {
    setShowSparkle(null); // ← Clear sparkles first
    sceneActions.updateState({
      phase: CAVE_PHASES.TRACE_INTRO // ← Then change phase
    });
  }, 3000); // ← Wait for fade to complete
};
// Door 2 handlers
const handleDoor2SyllablePlaced = (syllable) => {
  hideActiveHints();
  console.log(`Door 2 syllable placed: ${syllable}`);
  
  const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ma';
  const isCorrect = syllable === expectedSyllable;
  
  if (isCorrect) {
    const newStep = (sceneState.door2CurrentStep || 0) + 1;
    const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
    
    sceneActions.updateState({
      door2SyllablesPlaced: newSyllablesPlaced,
      door2CurrentStep: newStep
    });
    
    if (newStep >= 4) {
      setTimeout(() => {
        handleDoor2Complete();
      }, 1000);
    }
  } else {
    if (showMessage) {
      showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
        duration: 2000,
        animation: 'shake',
        position: 'top-center'
      });
    }
  }
};
const handleDoor2Complete = () => {
  console.log('🚪 Door 2 completed - starting sparkle fade!');
  
  // ✅ STEP 1: Add sparkles immediately
  setShowSparkle('door2-completing');
  
  // ✅ STEP 2: Add fade class to door
  const doorElement = document.querySelector('.mahakaya-door .door-container');
  if (doorElement) {
    doorElement.classList.add('completing');
  }
  
  // ✅ STEP 3: Mark as completed but DON'T change phase yet
  sceneActions.updateState({
    door2Completed: true
    // ✅ REMOVED: Don't change phase here!
  });
  
  // ✅ STEP 4: Clear sparkles and change phase AFTER fade completes
  setTimeout(() => {
    setShowSparkle(null); // ← Clear sparkles first
    sceneActions.updateState({
      phase: CAVE_PHASES.GROW_ACTIVE,
      growingStarted: true
    });
  }, 3000); // ← Wait for fade to complete
};

const handleStartTracing = () => {
  console.log('🐘 Starting trunk tracing game!');
  
  sceneActions.updateState({
    tracingStarted: true,
    phase: CAVE_PHASES.TRACE_ACTIVE,
    traceProgress: 0,
    canResumeTracing: false,
    // ✅ ADD: Initialize tracking arrays
    tracedPoints: [],
    currentPathSegment: 0,
    segmentsCompleted: [],
    ganeshaVisible: true,
    ganeshaAnimation: 'breathing'
  });
};

const handleTraceProgress = (progress, position) => {
  sceneActions.updateState({
    traceProgress: progress,
    trunkPosition: position
  });
  
  if (progress >= 95) {
    completeTracing();
  }
};

const completeTracing = () => {
  console.log('🌟 Tracing completed - going directly to Vakratunda learning!');
  
  sceneActions.updateState({
    tracingCompleted: true,
    phase: CAVE_PHASES.TRACE_COMPLETE,
    traceProgress: 100,
    // ✅ ADD: Mark final tracking state
    currentPathSegment: 16, // All segments completed
    tracingStarted: false, // No longer actively tracing
    progress: {
      ...sceneState.progress,
      percentage: 50,
      starsEarned: 3
    }
  });

  safeSetTimeout(() => {
    completeVakratundaLearning();
  }, 2000);
};

const handleStartGrowing = () => {
  console.log('🌱 Starting growing Ganesha game!');
  
  sceneActions.updateState({
    growingStarted: true,
    phase: CAVE_PHASES.GROW_ACTIVE,
      ganeshaVisible: true,  // ✅ ADD THIS LINE!
    ganeshaAnimation: 'breathing'  // ✅ ADD THIS LINE!
  });
};

const handleStoneClick = (stoneId) => {
  hideActiveHints();
  
  const stone = sceneState.floatingStones.find(s => s.id === stoneId);
  if (!stone || stone.clicked) return;
  
  console.log(`Stone ${stoneId} clicked!`);
  
  const updatedStones = sceneState.floatingStones.map(s => 
    s.id === stoneId ? { ...s, clicked: true } : s
  );
  
  const newStonesClicked = sceneState.stonesClicked + 1;
// ✅ NEW: Dramatic scaling array
  const scalingSizes = [1.1, 1.5, 2.0, 3.2]; // Stone 1→4
  const glowSizes = [0.3, 0.6, 1.0, 1.5];    // Glow 1→4
  
  const newSize = scalingSizes[newStonesClicked - 1] || 0.8;
  const newGlow = glowSizes[newStonesClicked - 1] || 0.2;
  
  sceneActions.updateState({
    floatingStones: updatedStones,
    stonesClicked: newStonesClicked,
    ganeshaSize: newSize,
    ganeshaGlow: newGlow,
    ganeshaAnimation: 'growing',
    
  });
  
  setShowSparkle(`stone-${stoneId}-clicked`);
  setTimeout(() => setShowSparkle(null), 1000);
  
  if (newStonesClicked >= 4) {
    safeSetTimeout(() => {
      completeGrowing();
    }, 2000);
  }
};


const completeGrowing = () => {
  console.log('🏗️ Growing completed!');
  
  sceneActions.updateState({
    growingCompleted: true,
    phase: CAVE_PHASES.GROW_COMPLETE,
    ganeshaAnimation: 'mighty'
  });

  setShowSparkle('ganesha-mighty');

  safeSetTimeout(() => {
    startMahakayaLearning();
  }, 2000);
};

const startMahakayaLearning = () => {
  console.log('📜 Starting Mahakaya learning');
  
  sceneActions.updateState({
    symbolDiscoveryState: 'mahakaya_discovering',
    currentPopup: 'mahakaya_info',
    phase: CAVE_PHASES.MAHAKAYA_LEARNING
  });

  setPopupBookContent({
    title: "Mahakaya - The Mighty Form",
    symbolImage: mahakayaCard,
    description: `Mahakaya means "mighty form", ${profileName}! You made Ganesha grow from tiny to mighty and golden. Ganesha is strong enough to help with any challenge!`
  });

  setCurrentSourceElement('grow-area');
  setShowPopupBook(true);
};

const completeVakratundaLearning = () => {
  console.log('📜 Starting Vakratunda complete learning');
  
  sceneActions.updateState({
    symbolDiscoveryState: 'vakratunda_discovering',
    currentPopup: 'vakratunda_info',
    phase: CAVE_PHASES.VAKRATUNDA_LEARNING
  });

  setPopupBookContent({
    title: "Vakratunda - The Curved Trunk",
    symbolImage: vakratundaCard,
    description: `Vakratunda means "curved trunk", ${profileName}! You traced the curved path like Ganesha's wise trunk. Ganesha's trunk can reach anywhere to help!`
  });

  setCurrentSourceElement('tracing-area');
  setShowPopupBook(true);
};

  // SIMPLE CAVE GAMES

  // Simple Game 1: Click the crystal to learn Vakratunda
  /*const handleCrystalClick = () => {
    console.log('💎 Crystal clicked - starting Vakratunda learning!');
    hideActiveHints();
    
    // Show sparkle effect
    setShowSparkle('crystal-clicked');
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.DOOR1_COMPLETE,
      symbolDiscoveryState: 'vakratunda_discovering',
      currentPopup: 'vakratunda_info'
    });

    setPopupBookContent({
      title: "Vakratunda - The Curved Trunk",
      symbolImage: vakratundaCard,
      description: `Vakratunda means "curved trunk", ${profileName}! You clicked the magical crystal and discovered Ganesha's wise curved trunk that can reach anywhere to help!`
    });

    setCurrentSourceElement('crystal-area');
    
    // Delay showing popup to let sparkle play
    setTimeout(() => {
      setShowPopupBook(true);
    }, 1000);
  };

  // Simple Game 2: Click the golden stone to learn Mahakaya
  const handleStoneClick = () => {
    console.log('🪨 Golden stone clicked - starting Mahakaya learning!');
    hideActiveHints();
    
    // Show sparkle effect
    setShowSparkle('stone-clicked');
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.DOOR2_COMPLETE,
      symbolDiscoveryState: 'mahakaya_discovering',
      currentPopup: 'mahakaya_info'
    });

    setPopupBookContent({
      title: "Mahakaya - The Mighty Form",
      symbolImage: mahakayaCard,
      description: `Mahakaya means "mighty form", ${profileName}! You clicked the golden stone and discovered Ganesha's mighty powerful presence that gives strength!`
    });

    setCurrentSourceElement('stone-area');
    
    // Delay showing popup to let sparkle play
    setTimeout(() => {
      setShowPopupBook(true);
    }, 1000);
  };*/

  // Symbol info close handler (PROVEN FROM POND)
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Sacred Lotus") || popupBookContent.title?.includes("Vakratunda")) {
      console.log('📜 Lotus info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          vakratunda: { learned: true, scene: 1 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          vakratunda: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'vakratunda_highlighting',
        // ✅ IMPORTANT: Trigger Door 2 phase to show the stone
        //phase: CAVE_PHASES.DOOR2_ACTIVE
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing vakratunda celebration after sidebar highlight');
        showSanskritCelebration('vakratunda');
      }, 1000);

    } else if (popupBookContent.title?.includes("Sacred Elephant") || popupBookContent.title?.includes("Mahakaya")) {
      console.log('📜 Elephant info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          mahakaya: { learned: true, scene: 1 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          mahakaya: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'mahakaya_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing mahakaya celebration after sidebar highlight');
        showSanskritCelebration('mahakaya');
      }, 1000);
    }
  };

  // Sanskrit celebration system (ADAPTED FROM POND)
  const showSanskritCelebration = (word) => {
    let title = "";
    let image = null;
    let stars = 0;

    console.log(`🎉 Showing Sanskrit celebration for: ${word}`);

    if (sceneState?.isReloadingGameCoach) {
      console.log('🚫 Skipping celebration during reload');
      return;
    }

    switch(word) {
      case 'vakratunda':
        title = `You've learned Vakratunda, ${profileName}!`;
        image = vakratundaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'vakratunda_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'mahakaya':
        title = `You've learned Mahakaya, ${profileName}!`;
        image = mahakayaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'mahakaya_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;
    }
  };

  // Close card handler (PROVEN FROM POND)
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Lotus Symbol") || cardContent.title?.includes("Vakratunda")) {
      console.log('📜 Lotus card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'vakratunda_wisdom'
        });
      }, 500);

    } else if (cardContent.title?.includes("Trunk Symbol") || cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Trunk card closed - triggering final GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'mahakaya_wisdom'
        });
      }, 500);
    }
  };

const showFinalCelebration = () => {
  console.log('🎊 Starting final cave celebration');
  
  setShowMagicalCard(false);
  setShowPopupBook(false);
  setShowSparkle(null);
  setCardContent({});
  setPopupBookContent({});

  // ✅ ENHANCED: Hide Sanskrit Sidebar during ALL completion phases
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

  // Hide active hints
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
    return <div className="loading">Loading cave scene...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>  {/* USING PROVEN POND CSS CLASSES */}
          <div className="pond-background" style={{ backgroundImage: `url(${caveBackground})` }}>
            
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


{/* Start Growing Test Button */}
<div style={{
  position: 'fixed',
  top: '320px',
  left: '20px',
  zIndex: 9999,
  background: '#9B59B6',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🌱 GROW TEST - Starting growing game');
  
  sceneActions.updateState({
    phase: CAVE_PHASES.GROW_ACTIVE,
    growingStarted: true,
    growingCompleted: false,
    stonesClicked: 0,
    ganeshaSize: 0.8,
    ganeshaGlow: 0.2
  });
}}>
  🌱 START GROW
</div>

{/* Debug Tracing State 
<div style={{
  position: 'fixed',
  top: '120px',
  left: '20px',
  background: 'rgba(0,255,255,0.8)',
  color: 'black',
  padding: '10px',
  borderRadius: '5px',
  fontSize: '12px',
  zIndex: 9999
}}>
  <div><strong>Tracing Debug:</strong></div>
  <div>Progress: {sceneState.traceProgress || 0}%</div>
  <div>Started: {String(sceneState.tracingStarted)}</div>
  <div>Completed: {String(sceneState.tracingCompleted)}</div>
  <div>Segment: {sceneState.currentPathSegment || 0}</div>
  <div>Points: {(sceneState.tracedPoints || []).length}</div>
  <div>Phase: {sceneState.phase}</div>
</div>

{/* Clear Storage Button */}
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

            {/* Test Complete Button */}
            <div style={{
              position: 'fixed',
              top: '170px',
              left: '20px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🧪 CAVE TEST: Completing both doors');
              
              sceneActions.updateState({
                door1Completed: true,
                door2Completed: true,
                learnedWords: {
                  vakratunda: { learned: true, scene: 1 },
                  mahakaya: { learned: true, scene: 1 }
                },
                welcomeShown: true,
                vakratundaWisdomShown: true,
                mahakayaWisdomShown: false,
                readyForWisdom: true,
                phase: CAVE_PHASES.COMPLETE,
                completed: true,
                stars: 8
              });
              
              setShowMagicalCard(false);
              setShowPopupBook(false);
              
              console.log('🎭 Final GameCoach should trigger automatically...');
            }}>
              🎆 TEST COMPLETE
            </div>

            {/* Start Tracing Test Button */}
<div style={{
  position: 'fixed',
  top: '270px',
  left: '20px',
  zIndex: 9999,
  background: '#4ECDC4',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🐘 TRACE TEST - Going directly to tracing phase');
  
  sceneActions.updateState({
    phase: CAVE_PHASES.TRACE_ACTIVE,
    tracingStarted: true,
    tracingCompleted: false,
    traceProgress: 0
  });
  
  console.log('🎯 Ready to test tracing!');
}}>
  🐘 START TRACE
</div>

{/* Door 1 Test Button */}
<div style={{
  position: 'fixed',
  top: '370px',
  left: '20px',
  zIndex: 9999,
  background: '#E74C3C',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🚪 DOOR 1 TEST');
  sceneActions.updateState({
    phase: CAVE_PHASES.DOOR1_ACTIVE,
    door1Completed: false,
    door1CurrentStep: 0,
    door1SyllablesPlaced: []
  });
}}>
  🚪 DOOR 1
</div>

{/* Debug Animation Class 
<div style={{
  position: 'fixed',
  top: '160px',
  left: '20px',
  background: 'rgba(0,255,0,0.8)',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  fontSize: '12px',
  zIndex: 9999
}}>
  <div>ganeshaAnimation: {sceneState.ganeshaAnimation}</div>
  <div>animClass: {getGaneshaAnimationClass()}</div>
</div>

{/* DEBUG: Trace Hint State 
<div style={{
  position: 'fixed',
  top: '120px',
  left: '20px',
  background: 'rgba(255,0,0,0.8)',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  fontSize: '12px',
  zIndex: 9999
}}>
  <div>phase: {sceneState.phase}</div>
  <div>tracingStarted: {String(sceneState.tracingStarted)}</div>
  <div>tracingCompleted: {String(sceneState.tracingCompleted)}</div>
  <div>showMagicalCard: {String(showMagicalCard)}</div>
  <div>isVisible: {String(isVisible)}</div>
</div>

{/* Door 2 Test Button */}
<div style={{
  position: 'fixed',
  top: '420px',
  left: '20px',
  zIndex: 9999,
  background: '#8E44AD',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🚪 DOOR 2 TEST');
  sceneActions.updateState({
    phase: CAVE_PHASES.DOOR2_ACTIVE,
    door2Completed: false,
    door2CurrentStep: 0,
    door2SyllablesPlaced: []
  });
}}>
  🚪 DOOR 2
</div>

{/* Debug Ganesha State 
<div style={{
  position: 'fixed',
  top: '60px',
  left: '20px',
  background: 'rgba(0,0,0,0.8)',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  fontSize: '12px',
  zIndex: 9999
}}>
  <div>ganeshaVisible: {String(sceneState.ganeshaVisible)}</div>
  <div>phase: {sceneState.phase}</div>
  <div>tracingStarted: {String(sceneState.tracingStarted)}</div>
</div>

            {/* Show Stone Button 
            <div style={{
              position: 'fixed',
              top: '220px',
              left: '20px',
              zIndex: 9999,
              background: 'orange',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🪨 SHOW STONE: Forcing Door 2 phase');
              
              sceneActions.updateState({
                phase: CAVE_PHASES.DOOR2_ACTIVE
              });
              
              console.log('🪨 Stone should now be visible');
            }}>
              🪨 SHOW STONE
            </div>

            {/* Simple Game 1: Magical Crystal (Vakratunda) 
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="crystal-area" id="crystal-area">
                <ClickableElement
                  id="magical-crystal"
                  onClick={handleCrystalClick}
                  completed={sceneState.door1Completed}
                  zone="crystal-zone"
                >
                  <div className="magical-crystal">
                    💎
                    <div className="crystal-glow"></div>
                  </div>
                </ClickableElement>
                {showSparkle === 'crystal-clicked' && (
                  <SparkleAnimation
                    type="magic"
                    count={15}
                    color="#ff9ebd"
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Door 1 Component */}
{(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
  <div className="door1-area" id="door1-area">
    <DoorComponent
      syllables={['Va', 'kra', 'tun', 'da']}
      completedWord="Vakratunda"
      onDoorComplete={handleDoor1Complete}
      onSyllablePlaced={handleDoor1SyllablePlaced}
      sceneTheme="cave-of-secrets"
      doorImage={doorImage}
      className="vakratunda-door"
      educationalMode={true}
      showTargetWord={true}
      currentStep={sceneState.door1CurrentStep || 0}
      expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
      targetWordTitle="VAKRATUNDA "
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

{/* Door 2 Component */}
{(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
  <div className="door2-area" id="door2-area">
    <DoorComponent
      syllables={['Ma', 'ha', 'ka', 'ya']}
      completedWord="Mahakaya"
      onDoorComplete={handleDoor2Complete}
      onSyllablePlaced={handleDoor2SyllablePlaced}
      sceneTheme="cave-of-secrets"
      doorImage={doorImage}
      className="mahakaya-door"
      educationalMode={true}
      showTargetWord={true}
      currentStep={sceneState.door2CurrentStep || 0}
      expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
      targetWordTitle=" MAHAKAYA "
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
      color="#ff8c42" // ✅ DIFFERENT: Orange color for Mahakaya
      size={12}
      duration={2500}
      fadeOut={true}
      area="full"
    />
  </div>
)}

              {/* ✅ YOUR TRACING GAME CODE IS HERE - PERFECT! */}
          {/* Tracing Game */}
          {(sceneState.phase === 'trace_intro' || 
            sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
            sceneState.phase === CAVE_PHASES.TRACE_COMPLETE ||
            sceneState.phase === CAVE_PHASES.VAKRATUNDA_LEARNING) && (
              renderTracingPath()
          )}

          {/* Growing Ganesha Game - Game 2 */}
{renderGrowingGame()}

            {/* Simple Game 2: Golden Stone (Mahakaya) 
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="stone-area" id="stone-area">
                <ClickableElement
                  id="golden-stone"
                  onClick={handleStoneClick}
                  completed={sceneState.door2Completed}
                  zone="stone-zone"
                >
                  <div className="golden-stone">
                    🪨
                    <div className="stone-glow"></div>
                  </div>
                </ClickableElement>
                {showSparkle === 'stone-clicked' && (
                  <SparkleAnimation
                    type="star"
                    count={20}
                    color="#ffd700"
                    size={12}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

 {/* ✅ FIXED: Show Ganesha from tracing through final completion */}
{(sceneState.phase === CAVE_PHASES.TRACE_INTRO || 
  sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
  sceneState.phase === CAVE_PHASES.TRACE_COMPLETE ||
  sceneState.phase === CAVE_PHASES.VAKRATUNDA_LEARNING ||
  sceneState.phase === CAVE_PHASES.GROW_ACTIVE ||
  sceneState.phase === CAVE_PHASES.GROW_COMPLETE ||
  sceneState.phase === CAVE_PHASES.MAHAKAYA_LEARNING ||
  sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
  sceneState.phase === CAVE_PHASES.COMPLETE ||
  sceneState.showingCompletionScreen ||
  showSparkle === 'final-fireworks') && (
      <div 
    className={`mini-ganesha-container ${getGaneshaAnimationClass()}`}
    style={{
      position: 'absolute',
      top: '40%',
      left: '55%',
      transform: `translate(-50%, -50%) scale(${sceneState.ganeshaSize || 0.8})`,
      zIndex: 8,
    filter: `brightness(${1 + (sceneState.ganeshaGlow || 0.2)})`
    }}
  >
    <img 
      src={ganeshaComplete}
      alt="Mini Ganesha" 
      style={{ 
        width: '100px', 
        height: '100px',
        userSelect: 'none',
        pointerEvents: 'none',
         // ✅ ADD these to remove borders:
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
     // ✅ FORCE INLINE ANIMATION
 animation: sceneState.ganeshaAnimation === 'breathing' ? 'ganeshaBreathing 3s ease-in-out infinite' :
           sceneState.ganeshaAnimation === 'growing' ? 'ganeshaBreathing 3s ease-in-out infinite' :
           sceneState.ganeshaAnimation === 'happy' ? 'ganeshaBreathing 3s ease-in-out infinite' :
           sceneState.ganeshaAnimation === 'mighty' ? 'ganeshaMighty 5s ease-out' : 'none'
  
      }}
    />
  </div>
)}

            {/* Sanskrit Sidebar */}
            <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={1}
              unlockedScenes={[1]}
              mode="meanings"
              onWordClick={(wordId, wordData) => {
                console.log(`Sanskrit word clicked: ${wordId}`, wordData);
              }}
              highlightState={sceneState.sidebarHighlightState}
            />

            {/* Symbol Information Popup (PROVEN CSS) */}
            <SymbolSceneIntegration
              show={showPopupBook}
              symbolImage={popupBookContent.symbolImage}
              title={popupBookContent.title}
              description={popupBookContent.description}
              sourceElement={currentSourceElement}
              onClose={handleSymbolInfoClose}
            />

            {/* Sanskrit Learning Cards (PROVEN CSS) */}
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

            {/* Confetti during card celebrations */}
            {showMagicalCard && (cardContent.title?.includes("Vakratunda") || cardContent.title?.includes("Mahakaya")) && (
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
            `}</style>

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 Cave fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'vakratunda-mahakaya', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { vakratunda: true, mahakaya: true },
                        learnedWords: sceneState.learnedWords || {},          // ← ADD: Scene's learned words
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ CAVE: Completion saved and temp session cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Cave of Secrets - Scene 1"
              sceneNumber={1}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['vakratunda', 'mahakaya'].filter(word =>
                sceneState.learnedWords?.[word]?.learned
              )}
              symbolImages={{
                vakratunda: vakratundaCard,
                mahakaya: mahakayaCard
              }}
              nextSceneName="Million Suns Chamber"
              sceneId="vakratunda-mahakaya"
              completionData={{
                stars: 8,
                  symbols: {},  // ← ADD: Empty symbols for Cave
                sanskritWords: { vakratunda: true, mahakaya: true },
                 learnedWords: sceneState.learnedWords || {},  // ← ADD: Scene learned words
  chants: { vakratuna: true, mahakaya: true },  // ← ADD: For CulturalProgressExtractor
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}

          // ADD THIS TO SceneCompletionCelebration:
onReplay={() => {
  console.log('🔄 Vakratunda Scene: Play Again requested');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    // Clear ALL storage
    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
    localStorage.removeItem(`replay_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
    localStorage.removeItem(`play_again_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
    
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'vakratunda-mahakaya', false, false);
    console.log('🗑️ Vakratunda scene storage cleared');
  }
  
  // Force clean reload
  setTimeout(() => {
    window.location.reload();
  }, 100);
}}
        
// ADD THIS TO SceneCompletionCelebration:
onContinue={() => {
  console.log('🔧 CONTINUE: Vakratunda scene to next scene');
  
  // 1. Clear GameCoach
  if (clearManualCloseTracking) clearManualCloseTracking();
  if (hideCoach) hideCoach();
  
  setTimeout(() => {
    if (clearManualCloseTracking) clearManualCloseTracking();
  }, 500);
  
  // 2. Save completion data - CHANT FORMAT
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'vakratunda-mahakaya', {
      completed: true,
      stars: 8,
      symbols: {},  // ← Cave scenes don't learn symbols
      sanskritWords: { vakratunda: true, mahakaya: true },
      learnedWords: sceneState.learnedWords || {},
      chants: { vakratunda: true, mahakaya: true }
    });
    
    GameStateManager.saveGameState('cave-of-secrets', 'vakratunda-mahakaya', {
      completed: true,
      stars: 8,
      sanskritWords: { vakratunda: true, mahakaya: true },
      learnedWords: sceneState.learnedWords || {}
    });
    
    console.log('✅ CONTINUE: Vakratunda completion data saved');
  }

  // 3. Set next scene for resume tracking
  setTimeout(() => {
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'suryakoti-samaprabha', false, false);
    console.log('✅ CONTINUE: Next scene (suryakoti-samaprabha) set for resume tracking');
    
    onNavigate?.('scene-complete-continue');
  }, 100);
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

            {/* Navigation */}
            <TocaBocaNav
              onHome={() => {
                console.log('🧹 HOME: Cleaning GameCoach before navigation');
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onProgress={() => {
                const name = activeProfile?.name || 'little explorer';
                console.log(`Great Sanskrit progress, ${name}!`);
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

export default CaveSceneFixed;