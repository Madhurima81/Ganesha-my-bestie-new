// zones/cave-of-secrets/scenes/vakratunda-mahakaya/VakratundaV4.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaV4.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CurvedPathTracer from './CurvedPathTracer';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Sanskrit Learning Sidebar & Door
import SanskritSidebar from '../../../../lib/components/feedback/SanskritSidebar';
import DoorComponent from '../../components/DoorComponent';
// ✅ NEW: Mooshika Character  
import MooshikaCharacter from '../../components/MooshikaCharacter';

// Cave-themed images
import caveBackground from './assets/images/cave-background.png';
import doorImage from './assets/images/door-image.png';
import trunkGuide from './assets/images/trunk-guide.png';
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';
import ganeshaOutline from './assets/images/ganesha-outline.png';
import ganeshaComplete from './assets/images/ganesha-complete.png';
import rockPiece1 from './assets/images/rock-piece-1.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// Sanskrit learning card images
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';

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

// Error Boundary Component
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
          <h2>Something went wrong in the Cave of Secrets.</h2>
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

const VakratundaV3 = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  console.log('VakratundaV3 props:', { onComplete, onNavigate, zoneId, sceneId });

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

          // ✅ NEW: Educational door tracking
          door1CurrentStep: 0,        // Which syllable we expect next (0=Va, 1=kra, 2=tun, 3=da)
          door1Syllables: ['Va', 'kra', 'tun', 'da'], // Correct sequence
          door2CurrentStep: 0,        
          door2Syllables: ['Ma', 'ha', 'ka', 'ya'],
          
          // Door 2 state (Ma-ha-ka-ya)
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          
          // Game 1: Tracing state
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
          
          // Game 2: Growing Ganesha state
          growingStarted: false,
          stonesClicked: 0,
          ganeshaSize: 0.7,
          ganeshaGlow: 0.2,

          // ✅ NEW: Mini Ganesha always visible
          ganeshaVisible: true,
          ganeshaAnimation: 'breathing',
          
          floatingStones: [
            { id: 1, clicked: false, x: 20, y: 30 },  // Head stone
            { id: 2, clicked: false, x: 70, y: 20 },  // Trunk stone
            { id: 3, clicked: false, x: 30, y: 60 },  // Body stone
            { id: 4, clicked: false, x: 80, y: 50 }   // Legs stone
          ],
          growingCompleted: false,
          
          // Sanskrit learning state
          learnedWords: {
            vakratunda: { learned: false, scene: 1, doorStarted: false },
            mahakaya: { learned: false, scene: 1, doorStarted: false }
          },
          unlockedScenes: [1],
          
          // Scene progression
          phase: CAVE_PHASES.DOOR1_ACTIVE,
          currentFocus: 'door1',
          
          // Popup and learning states
          currentPopup: null,
          discoveredSymbols: {},
          gameCoachState: null,
          isReloadingGameCoach: false,
          
          // Message flags
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          masteryShown: false,
          readyForWisdom: false,
          door2WelcomeShown: false,
          tracingWelcomeShown: false,
          growingWelcomeShown: false,
          
          // Symbol discovery state tracking
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // Progress tracking
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },
          
          // Cave-specific effects
          crystalSparkles: [],
          celebrationStars: 0,
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
  console.log('🏗️ COMPONENT LOADING!');

  console.log('CaveSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // Other state
  const [showSparkle, setShowSparkle] = useState(null);
  const [activePopup, setActivePopup] = useState(-1);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const [ganeshaAnimation, setGaneshaAnimation] = useState('breathing');

  // ✅ ADD THE FUNCTION HERE:
  const getGaneshaAnimationClass = () => {
    if (!sceneState.ganeshaVisible) return '';
    if (ganeshaAnimation === 'happy') return 'happy';
    if (ganeshaAnimation === 'growing') return 'growing';
    if (ganeshaAnimation === 'mighty') return 'mighty breathing';
    return 'breathing'; // Default animation
  };

  const stoneImages = [
    stoneHead,   // Stone 1 - Head stone
    stoneTrunk,  // Stone 2 - Trunk stone  
    stoneBody,   // Stone 3 - Body stone
    stoneLegs    // Stone 4 - Legs stone
  ];

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // ✅ FIXED: GameCoach messages (simplified)
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Cave of Secrets, ${profileName}! Ancient Sanskrit wisdom awaits your discovery!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'vakratunda_wisdom',
      message: `Magnificent, ${profileName}! You've unlocked the first Sanskrit treasure - Vakratunda!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.vakratunda?.learned && !sceneState?.vakratundaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'mahakaya_wisdom',
      message: `Wonderful, ${profileName}! You've mastered Mahakaya - the mighty form of divine strength!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.mahakaya?.learned && !sceneState?.mahakayaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // ✅ FIXED: Hint configurations
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
        return sceneState?.phase === CAVE_PHASES.TRACE_ACTIVE &&
               !sceneState?.tracingCompleted &&
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

  const handleHintShown = (level) => {
    console.log(`Cave hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Cave hint button clicked");
  };

  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry
  useEffect(() => {
    console.log('🧹 CAVE: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
  }, []);

  // ✅ FIXED: Watch for GameCoach visibility changes (EXACTLY like Pond Scene)
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

  // ✅ FIXED: GameCoach triggering system (EXACTLY like Pond Scene)
  useEffect(() => {
    if (!sceneState || !showMessage) return;
   
    // Block during active reload process
    if (sceneState.isReloadingGameCoach) {
      console.log('🚫 GameCoach blocked: Reload in progress');
      return;
    }
   
    // Prevent messages during symbol discovery sequence
    if (sceneState.symbolDiscoveryState) {
      console.log('🚫 GameCoach blocked: Symbol discovery in progress');
      return;
    }

    // Block during sidebar highlight sequence
    if (sceneState.sidebarHighlightState) {
      console.log('🚫 GameCoach blocked: Sidebar highlighting in progress');
      return;
    }

    const matchingMessage = caveGameCoachMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
   
    if (matchingMessage) {
      // Check if this specific message was already shown
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
        
        // ✨ Show divine light effect first
        setShowSparkle('divine-light');
        
        // Then show GameCoach message after divine light
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 6000,  // ← AUTO-CLOSE duration
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: 'wisdom'
          });
        }, 2000);
       
        // Mark message as shown and set pending actions
        switch (matchingMessage.id) {
          case 'cave_welcome':
            sceneActions.updateState({ welcomeShown: true });
            break;
          case 'vakratunda_wisdom':
            sceneActions.updateState({
              vakratundaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'vakratunda_wisdom'
            });
            setPendingAction('start-door2');  // ← Set pending action
            break;
          case 'mahakaya_wisdom':
            sceneActions.updateState({
              mahakayaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'mahakaya_wisdom'
            });
            setPendingAction('start-fireworks');  // ← Set pending action
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

  // Door 1 handlers
  const handleDoor1SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    // ✅ NEW: Educational mode check
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Va';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      // ✅ Correct syllable clicked
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      console.log(`✅ Correct! Step ${newStep-1} -> ${newStep}`);
      
      sceneActions.updateState({
        door1SyllablesPlaced: newSyllablesPlaced,
        door1CurrentStep: newStep
      });
      
      // Check if door is complete
      if (newStep >= 4) {
        console.log('🚪 Door 1 completed!');
        setTimeout(() => {
          sceneActions.updateState({
            door1Completed: true,
            learnedWords: {
              ...sceneState.learnedWords,
              vakratunda: { 
                ...sceneState.learnedWords.vakratunda, 
                doorStarted: true 
              }
            }
          });
          handleDoor1Complete();
        }, 1500);
      }
    } else {
      // ❌ Wrong syllable - show helpful message
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
    console.log('🚪 Door 1 completed - starting tracing game!');
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.DOOR1_COMPLETE
    });
    
    setTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.TRACE_INTRO
      });
    }, 1000);
  };

  const handleStartTracing = () => {
    console.log('🐘 Starting trunk tracing game!');
    
    sceneActions.updateState({
      tracingStarted: true,
      phase: CAVE_PHASES.TRACE_ACTIVE,
      traceProgress: 0,
      canResumeTracing: false
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

  // Door 2 handlers
  const handleDoor2SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    // ✅ NEW: Educational mode check
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ma';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      // ✅ Correct syllable clicked
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      console.log(`✅ Correct! Step ${newStep-1} -> ${newStep}`);
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
      
      // Check if door is complete
      if (newStep >= 4) {
        console.log('🚪 Door 2 completed!');
        setTimeout(() => {
          sceneActions.updateState({
            door2Completed: true,
            learnedWords: {
              ...sceneState.learnedWords,
              mahakaya: { 
                ...sceneState.learnedWords.mahakaya, 
                doorStarted: true 
              }
            }
          });
          handleDoor2Complete();
        }, 1500);
      }
    } else {
      // ❌ Wrong syllable
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

  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed - starting growing game!');
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.DOOR2_COMPLETE
    });
    
    setTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.GROW_ACTIVE,
        growingStarted: true
      });
    }, 1000);
  };

  // Growing game handlers
  const handleStartGrowing = () => {
    console.log('🌱 Starting growing Ganesha game!');
    
    sceneActions.updateState({
      growingStarted: true,
      phase: CAVE_PHASES.GROW_ACTIVE
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
    const newSize = 0.3 + (newStonesClicked * 0.25);
    const newGlow = 0.2 + (newStonesClicked * 0.25);
    
    sceneActions.updateState({
      floatingStones: updatedStones,
      stonesClicked: newStonesClicked,
      ganeshaSize: newSize,
      ganeshaGlow: newGlow,
      progress: {
        ...sceneState.progress,
        percentage: 50 + (newStonesClicked / 4 * 25),
        starsEarned: 3 + newStonesClicked
      }
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
      progress: {
        ...sceneState.progress,
        percentage: 75,
        starsEarned: 7
      }
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

  // ✅ FIXED: Symbol info close handler
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Vakratunda")) {
      console.log('📜 Vakratunda info closed - highlighting sidebar first');
      
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
        sidebarHighlightState: 'vakratunda_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing vakratunda celebration after sidebar highlight');
        showSanskritCelebration('vakratunda');
      }, 1000);

    } else if (popupBookContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya info closed - highlighting sidebar first');
      
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

  // ✅ FIXED: Sanskrit celebration system
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

        setTimeout(() => {
          console.log('🎉 RELOAD: Clearing vakratunda celebration card reload flags');
          sceneActions.updateState({ 
            isReloadingGameCoach: false,
            symbolDiscoveryState: null,
            sidebarHighlightState: null
          });
        }, 500);
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

        setTimeout(() => {
          console.log('🎉 RELOAD: Clearing mahakaya celebration card reload flags');
          sceneActions.updateState({ 
            isReloadingGameCoach: false,
            symbolDiscoveryState: null,
            sidebarHighlightState: null
          });
        }, 500);
        break;
    }
  };

  // ✅ FIXED: Close card handler (triggers GameCoach flow)
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Vakratunda")) {
      console.log('📜 Vakratunda card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'vakratunda_wisdom'
        });
        // GameCoach will auto-close and trigger Door 2 via pendingAction
      }, 500);

    } else if (cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya card closed - triggering final GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'mahakaya_wisdom'
        });
        // GameCoach will auto-close and trigger fireworks via pendingAction
      }, 500);
    }
  };

  // ✅ FIXED: Final celebration
  const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    // Clear ALL UI states before fireworks
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    // Hide Sanskrit Sidebar during fireworks
    const sidebarElement = document.querySelector('.sanskrit-sidebar');
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
      },
      symbolDiscoveryState: null,
      sidebarHighlightState: null,
      gameCoachState: null,
      isReloadingGameCoach: false
    });

    setShowSparkle('final-fireworks');
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
          onProgress={(progress, quality) => {
            sceneActions.updateState({
              traceProgress: progress,
              traceQuality: quality
            });
          }}
          disabled={false}
          showDebug={true}
        />
      </div>
    );
  };

  // ✅ FIXED: Render growing Ganesha game (SIMPLIFIED condition)
  const renderGrowingGame = () => {
    // ✅ SIMPLE CHECK: Once growing starts, show forever (like Pond Scene)
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
        
        {/*<div className="growing-ganesha-container">
          <div 
            className="growing-ganesha"
            style={{
              transform: `scale(${sceneState.ganeshaSize})`,
              filter: `brightness(${1 + sceneState.ganeshaGlow}) drop-shadow(0 0 ${sceneState.ganeshaGlow * 20}px rgba(255, 215, 0, ${sceneState.ganeshaGlow}))`
            }}
          >
            <img 
              src={ganeshaComplete}
              alt="Growing Ganesha" 
            />
          </div>
          
          {showSparkle === 'ganesha-mighty' && (
            <SparkleAnimation
              type="firework"
              count={25}
              color="#ffd700"
              size={12}
              duration={3000}
              fadeOut={true}
              area="full"
            />
          )}
        </div>*/}
        
        {!sceneState.growingStarted && (
          <button className="start-grow-button" onClick={handleStartGrowing}>
            Start Growing!
          </button>
        )}
      </div>
    );
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
        <div className="cave-scene-container">
          <div className="cave-background" style={{ backgroundImage: `url(${caveBackground})` }}>
            
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

            {/* Skip to Trace Test Button */}
<div style={{
  position: 'fixed',
  top: '220px',  // Below the COMPLETE button
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
  console.log('🐘 SKIP TO TRACE TEST - Going directly to tracing phase');
  
  // Reset to clean state and go to tracing
  sceneActions.updateState({
    // Clear all completion states
    door1Completed: true,  // Mark door as done
    door1State: 'completed',
    
    // Set tracing phase
    phase: CAVE_PHASES.TRACE_ACTIVE,
    tracingStarted: true,
    tracingCompleted: false,
    traceProgress: 0,
    
    // Clear other phases
    growingStarted: false,
    growingCompleted: false,
    
    // Clear learning states
    currentPopup: null,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // Basic progress
    stars: 0,
    completed: false
  });
  
  // Clear any UI modals
  setShowMagicalCard(false);
  setShowPopupBook(false);
  setShowSparkle(null);
  
  console.log('🎯 Ready to test tracing directly!');
}}>
  🐘 TRACE TEST
</div>

            {/* ✅ FIXED: Complete Test Button */}
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
              console.log('🧪 CAVE COMPLETION TEST - Following proper flow');
              
              // Set everything completed but DON'T trigger fireworks directly
              sceneActions.updateState({
                // All completion states
                growingStarted: true,
                growingCompleted: true,
                ganeshaSize: 1.3,
                ganeshaGlow: 1.2,
                learnedWords: {
                  vakratunda: { learned: true, scene: 1 },
                  mahakaya: { learned: true, scene: 1 }
                },
                // Key flags
                welcomeShown: true,
                vakratundaWisdomShown: true,
                mahakayaWisdomShown: false,  // ← Will trigger final message
                readyForWisdom: true,  // ← Will trigger final message
                phase: CAVE_PHASES.COMPLETE,
                completed: true,
                stars: 8
              });
              
              // Clear UI
              setShowMagicalCard(false);
              setShowPopupBook(false);
              
              // The final GameCoach will trigger automatically and then fireworks
              console.log('🎭 Final GameCoach should trigger automatically...');
            }}>
              🎆 COMPLETE
            </div>

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
              @keyframes instructionPulse {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; }
              }
              @keyframes messageSlideIn {
                0% { 
                  opacity: 0; 
                  transform: translate(-50%, -50%) scale(0.8); 
                }
                100% { 
                  opacity: 1; 
                  transform: translate(-50%, -50%) scale(1); 
                }
              }
            `}</style>
            
            {/* Enhanced Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <DoorComponent
                syllables={['Va', 'kra', 'tun', 'da']}
                completedWord="Vakratunda"
                onDoorComplete={handleDoor1Complete}
                onSyllablePlaced={handleDoor1SyllablePlaced}
                sceneTheme="cave-of-secrets"
                doorImage={doorImage}
                className="vakratunda-door"
                // ✅ NEW: Educational props
                educationalMode={true}
                showTargetWord={true}
                currentStep={sceneState.door1CurrentStep || 0}
                expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                targetWordTitle="VAKRATUNDA 🚪"
                primaryColor="#FFD700"
                secondaryColor="#FF8C42"
                errorColor="#FF4444"
              />
            )}

            {/* Tracing Game */}
        {(sceneState.phase === 'trace_intro' || 
  sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
  sceneState.phase === CAVE_PHASES.TRACE_COMPLETE ||
  sceneState.phase === CAVE_PHASES.VAKRATUNDA_LEARNING) && (  // <-- ADD THIS LINE
    renderTracingPath()
)}
            {/* Enhanced Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <DoorComponent
                syllables={['Ma', 'ha', 'ka', 'ya']}
                completedWord="Mahakaya"
                onDoorComplete={handleDoor2Complete}
                onSyllablePlaced={handleDoor2SyllablePlaced}
                sceneTheme="cave-of-secrets"
                doorImage={doorImage}
                className="mahakaya-door"
                // ✅ NEW: Educational props
                educationalMode={true}
                showTargetWord={true}
                currentStep={sceneState.door2CurrentStep || 0}
                expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                targetWordTitle="🚪 MAHAKAYA 🚪"
                primaryColor="#FFD700"
                secondaryColor="#FF8C42"
                errorColor="#FF4444"
              />
            )}

            {/* ✅ NEW: Mini Ganesha - Always visible */}
            {sceneState.ganeshaVisible && (
              <div 
                className={`mini-ganesha-container ${getGaneshaAnimationClass()}`}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '55%',
                  transform: `translate(-50%, -50%) scale(${sceneState.ganeshaSize || 0.8})`,
                  zIndex: 15,
                  filter: `brightness(${1 + (sceneState.ganeshaGlow || 0.2)}) drop-shadow(0 0 ${(sceneState.ganeshaGlow || 0.2) * 20}px rgba(255, 215, 0, ${sceneState.ganeshaGlow || 0.2}))`
                }}
              >
                <img 
                  src={ganeshaComplete}
                  alt="Mini Ganesha" 
                  style={{ 
                    width: '100px', 
                    height: '100px',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            )}

            {/* Growing Ganesha Game */}
            {renderGrowingGame()}

            {/* Rock Piece Reward */}
            {sceneState.completed && (
              <div className="rock-piece-reward">
                <img src={rockPiece1} alt="First rock piece" />
                {showSparkle === 'rock-piece' && (
                  <SparkleAnimation
                    type="star"
                    count={20}
                    color="#daa520"
                    size={10}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Sanskrit Sidebar */}
            <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={1}
              unlockedScenes={sceneState.unlockedScenes || [1]}
              mode="meanings"
              onWordClick={(wordId, wordData) => {
                console.log(`Sanskrit word clicked: ${wordId}`, wordData);
                
                if (sceneState.learnedWords?.[wordId]?.learned) {
                  console.log(`Playing pronunciation for: ${wordId}`);
                }
              }}
              onSlideChange={(rowIndex) => {
                console.log(`Sanskrit sidebar row: ${rowIndex + 1}`);
              }}
              highlightState={sceneState.sidebarHighlightState}
            />

            {/* Symbol Information Popup */}
            <SymbolSceneIntegration
              show={showPopupBook}
              symbolImage={popupBookContent.symbolImage}
              title={popupBookContent.title}
              description={popupBookContent.description}
              sourceElement={currentSourceElement}
              onClose={handleSymbolInfoClose}
            />

            {/* Sanskrit Learning Cards */}
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

            {/* ✅ FIXED: Final Fireworks (longer duration) */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}  // ← LONGER duration (8 seconds)
                count={25}       // ← MORE fireworks
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
                sanskritWords: { vakratunda: true, mahakaya: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}
              onReplay={() => {
                console.log('🔄 Cave Scene 1 replay requested');
                window.location.reload();
              }}
              onContinue={() => {
                console.log('🔧 Cave Scene 1 continue to next scene');
                onNavigate?.('scene-complete-continue');
              }}
            />

            {/* Cultural Celebration Modal */}
            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

            {/* ✅ FIXED: Progressive Hints System */}
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

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaV3;