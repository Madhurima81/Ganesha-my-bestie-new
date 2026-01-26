// zones/cave-of-secrets/scenes/vakratunda-mahakaya/VakratundaV3.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaV3.css';

// Import scene management components
import SceneManager from "../../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../../lib/components/animation/MagicalCardFlip';
import SceneCompletionCelebration from '../../../../../lib/components/celebration/SceneCompletionCelebration';

// Sanskrit Learning Sidebar & Door
import SanskritSidebar from '../../../../../lib/components/feedback/SanskritSidebar';
import DoorComponent from '../../../components/DoorComponent';

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

// Find trunk game images (placeholder - you'll need to add these)
import elephantTrunk from './assets/images/elephant-trunk.png';
import snakeImage from './assets/images/snake.png';
import treeRoot from './assets/images/tree-root.png';
import rope from './assets/images/rope.png';

// Sanskrit learning card images
//import vakraCard from './assets/images/vakra-card.png';
//import tundaCard from './assets/images/tunda-card.png';
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';

// 🆕 NEW: Dual-Door 3-Game Phase System
const CAVE_PHASES = {
  // Part 1: Vakratunda Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  TRACE_INTRO: 'trace_intro',
  TRACE_ACTIVE: 'trace_active',
  TRACE_COMPLETE: 'trace_complete',
  FIND_INTRO: 'find_intro',
  FIND_ACTIVE: 'find_active', 
  FIND_COMPLETE: 'find_complete',
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
          // 🆕 Door 1 state (Va-kra-tun-da)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          
          // 🆕 Door 2 state (Ma-ha-ka-ya)
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          
          // 🆕 Game 1: Tracing state
          tracingStarted: false,
          isTracing: false,
          tracedPoints: [],
          traceProgress: 0,
          tracingCompleted: false,
          trunkPosition: { x: 50, y: 100 },
          
          // 🆕 Game 2: Find trunk state
          findStarted: false,
          selectedTrunk: null,
          correctTrunkFound: false,
          wrongAttempts: 0,
          
          // 🆕 Game 3: Growing Ganesha state
          growingStarted: false,
          stonesClicked: 0,
          ganeshaSize: 0.3, // Starts tiny
          ganeshaGlow: 0.2, // Starts dim
          floatingStones: [
            { id: 1, clicked: false, x: 20, y: 30 },
            { id: 2, clicked: false, x: 70, y: 20 },
            { id: 3, clicked: false, x: 30, y: 60 },
            { id: 4, clicked: false, x: 80, y: 50 }
          ],
          growingCompleted: false,
          
          // Sanskrit learning state
          learnedWords: {
            vakra: { learned: false, scene: 1, doorStarted: false },
            tunda: { learned: false, scene: 1, doorStarted: false },
            vakratunda: { learned: false, scene: 1, doorStarted: false },
            mahakaya: { learned: false, scene: 1, doorStarted: false }
          },
          unlockedScenes: [1],
          
          // Scene progression - starts with first door
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
  console.log('CaveSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

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

  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name for personalized messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // 🔄 Updated GameCoach messages for 3-game flow
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Cave of Secrets, ${profileName}! Touch the floating syllables to unlock the ancient door!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'trace_encourage',
      message: `Beautiful tracing, ${profileName}! Follow the curved path like Ganesha's wise trunk!`,
      timing: 1000,
      condition: () => sceneState?.phase === CAVE_PHASES.TRACE_ACTIVE && sceneState?.traceProgress > 30 && sceneState?.traceProgress < 70
    },
    {
      id: 'find_encourage', 
      message: `Great work! Now find Ganesha's trunk among these images, ${profileName}!`,
      timing: 1000,
      condition: () => sceneState?.phase === CAVE_PHASES.FIND_ACTIVE && !sceneState?.correctTrunkFound
    },
    {
      id: 'vakratunda_wisdom',
      message: `Magnificent, ${profileName}! You've discovered the complete meaning of Vakratunda!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.vakratunda?.learned && !sceneState?.vakratundaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'grow_encourage',
      message: `Amazing! Watch Ganesha grow mighty with each sacred stone, ${profileName}!`,
      timing: 1000,
      condition: () => sceneState?.phase === CAVE_PHASES.GROW_ACTIVE && sceneState?.stonesClicked > 0 && sceneState?.stonesClicked < 4
    },
    {
      id: 'mahakaya_wisdom',
      message: `Wonderful work, ${profileName}! You've learned the power of Mahakaya!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.mahakaya?.learned && !sceneState?.mahakayaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

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

  // 🚪 DOOR 1 HANDLERS (Va-kra-tun-da)
  const handleDoor1SyllablePlaced = (syllable) => {
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
    const allSyllablesPlaced = newSyllablesPlaced.length >= 4;
    
    sceneActions.updateState({
      door1SyllablesPlaced: newSyllablesPlaced
    });
    
    if (allSyllablesPlaced) {
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          vakratunda: { 
            ...sceneState.learnedWords.vakratunda, 
            doorStarted: true 
          }
        }
      });
    }
  };

  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed - starting tracing game!');
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.DOOR1_COMPLETE
    });
    
    // Start tracing game
    setTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.TRACE_INTRO
      });
    }, 1000);
  };

  // 🎮 GAME 1: TRACING HANDLERS
  const handleStartTracing = () => {
    console.log('🐘 Starting trunk tracing game!');
    
    sceneActions.updateState({
      tracingStarted: true,
      phase: CAVE_PHASES.TRACE_ACTIVE
    });
    
    showMessage(`Follow Ganesha's curved trunk path, ${profileName}!`, {
      duration: 4000,
      animation: 'bounce',
      position: 'top-right'
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
    console.log('🌟 Tracing completed!');
    
    sceneActions.updateState({
      tracingCompleted: true,
      phase: CAVE_PHASES.TRACE_COMPLETE,
      progress: {
        ...sceneState.progress,
        percentage: 25,
        starsEarned: 1
      }
    });

    // Start find trunk game
    safeSetTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.FIND_INTRO
      });
    }, 2000);
  };

  // 🎮 GAME 2: FIND TRUNK HANDLERS
  const handleStartFindTrunk = () => {
    console.log('🔍 Starting find trunk game!');
    
    sceneActions.updateState({
      findStarted: true,
      phase: CAVE_PHASES.FIND_ACTIVE
    });
  };

  const handleTrunkImageClick = (imageType) => {
    console.log(`Trunk image clicked: ${imageType}`);
    
    if (imageType === 'elephant-trunk') {
      // Correct choice!
      sceneActions.updateState({
        selectedTrunk: imageType,
        correctTrunkFound: true,
        phase: CAVE_PHASES.FIND_COMPLETE,
        progress: {
          ...sceneState.progress,
          percentage: 50,
          starsEarned: 2
        }
      });
      
      setShowSparkle('correct-trunk');
      setTimeout(() => setShowSparkle(null), 2000);
      
      // Complete Vakratunda learning
      safeSetTimeout(() => {
        completeVakratundaLearning();
      }, 2000);
      
    } else {
      // Wrong choice
      const newWrongAttempts = sceneState.wrongAttempts + 1;
      sceneActions.updateState({
        selectedTrunk: imageType,
        wrongAttempts: newWrongAttempts
      });
      
      setShowSparkle('wrong-trunk');
      setTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({ selectedTrunk: null });
      }, 1000);
    }
  };

  // 📜 Complete Vakratunda learning (after both games)
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
      description: `Vakratunda means "curved trunk", ${profileName}! You traced the curved path and found the trunk. Ganesha's trunk can reach anywhere to help!`
    });

    setCurrentSourceElement('find-area');
    setShowPopupBook(true);
  };

  // 🚪 DOOR 2 HANDLERS (Ma-ha-ka-ya)
  const handleDoor2SyllablePlaced = (syllable) => {
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
    const allSyllablesPlaced = newSyllablesPlaced.length >= 4;
    
    sceneActions.updateState({
      door2SyllablesPlaced: newSyllablesPlaced
    });
    
    if (allSyllablesPlaced) {
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          mahakaya: { 
            ...sceneState.learnedWords.mahakaya, 
            doorStarted: true 
          }
        }
      });
    }
  };

  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed - starting growing game!');
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.DOOR2_COMPLETE
    });
    
    // Start growing game
    setTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.GROW_INTRO
      });
    }, 1000);
  };

  // 🎮 GAME 3: GROWING GANESHA HANDLERS
  const handleStartGrowing = () => {
    console.log('🌱 Starting growing Ganesha game!');
    
    sceneActions.updateState({
      growingStarted: true,
      phase: CAVE_PHASES.GROW_ACTIVE
    });
  };

  const handleStoneClick = (stoneId) => {
    const stone = sceneState.floatingStones.find(s => s.id === stoneId);
    if (!stone || stone.clicked) return;
    
    console.log(`Stone ${stoneId} clicked!`);
    
    // Mark stone as clicked
    const updatedStones = sceneState.floatingStones.map(s => 
      s.id === stoneId ? { ...s, clicked: true } : s
    );
    
    const newStonesClicked = sceneState.stonesClicked + 1;
    const newSize = 0.3 + (newStonesClicked * 0.25); // Grows from 0.3 to 1.3
    const newGlow = 0.2 + (newStonesClicked * 0.25); // Glow increases
    
    sceneActions.updateState({
      floatingStones: updatedStones,
      stonesClicked: newStonesClicked,
      ganeshaSize: newSize,
      ganeshaGlow: newGlow,
      progress: {
        ...sceneState.progress,
        percentage: 50 + (newStonesClicked / 4 * 25), // 50% to 75%
        starsEarned: 2 + newStonesClicked
      }
    });
    
    setShowSparkle(`stone-${stoneId}-clicked`);
    setTimeout(() => setShowSparkle(null), 1000);
    
    // Check if all stones clicked
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
        starsEarned: 6
      }
    });

    setShowSparkle('ganesha-mighty');

    // Start Mahakaya learning sequence
    safeSetTimeout(() => {
      startMahakayaLearning();
    }, 2000);
  };

  // 📜 Mahakaya learning sequence
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

  // Symbol info close handler
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Vakratunda")) {
      console.log('📜 Vakratunda info closed - updating Sanskrit sidebar');
      
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          vakratunda: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'vakratunda_highlighting'
      });

      safeSetTimeout(() => {
        showSanskritCelebration('vakratunda');
      }, 1000);

    } else if (popupBookContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya info closed - updating Sanskrit sidebar');
      
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          mahakaya: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'mahakaya_highlighting'
      });

      safeSetTimeout(() => {
        showSanskritCelebration('mahakaya');
      }, 1000);
    }
  };

  // Sanskrit celebration system
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

  // Close card handler
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Vakratunda")) {
      console.log('📜 Vakratunda card closed - starting Door 2');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'vakratunda_wisdom',
          phase: CAVE_PHASES.DOOR2_ACTIVE // Start second door
        });
        setPendingAction('start-door2');
      }, 500);

    } else if (cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya card closed - completing scene');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'mahakaya_wisdom'
        });
        setPendingAction('complete-scene');
      }, 200);
    }
  };

  // Final celebration
  const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_celebration',
      phase: CAVE_PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });

    setShowSparkle('final-celebration');
  };

 // 🎮 COMPLETE WORKING renderTracingPath function - Replace your entire function
const renderTracingPath = () => {
  const svgRef = useRef(null);
  const [isTracing, setIsTracing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 80, y: 60 });
  const [tracedPath, setTracedPath] = useState([]);
  const [showCursor, setShowCursor] = useState(false);

  // Path points for progress calculation
  const pathPoints = [
    { x: 80, y: 60, progress: 0 },
    { x: 150, y: 50, progress: 25 },
    { x: 250, y: 80, progress: 50 },
    { x: 350, y: 60, progress: 75 },
    { x: 500, y: 100, progress: 100 }
  ];

  // Get coordinates from mouse/touch
  const getCoordinates = (event) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = svgRef.current.viewBox.baseVal;
    
    let clientX, clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Find progress from position
  const getProgressFromPosition = (x, y) => {
    let closestDistance = Infinity;
    let closestPoint = pathPoints[0];
    
    pathPoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    });
    
    // Valid if within 40 units
    if (closestDistance < 40) {
      return closestPoint.progress;
    }
    
    return -1;
  };

  // Handle start
  const handleStart = (e) => {
    e.preventDefault();
    console.log('🖱️ Tracing started');
    
    const coords = getCoordinates(e);
    const pathCheck = getProgressFromPosition(coords.x, coords.y);
    
    console.log('📍 Start position:', coords, 'Progress:', pathCheck);
    
    // Check if starting near beginning
    const startDistance = Math.sqrt(
      Math.pow(coords.x - 80, 2) + Math.pow(coords.y - 60, 2)
    );
    
    if (startDistance < 30 || pathCheck > -1) {
      setIsTracing(true);
      setShowCursor(true);
      setCurrentPosition(coords);
      setTracedPath([coords]); // Initialize traced path
      
      showMessage(`Great start! Keep tracing, ${profileName}!`, {
        duration: 2000,
        position: 'top-center'
      });
    }
  };

  // Handle move
  const handleMove = (e) => {
    if (!isTracing) return;
    
    e.preventDefault();
    
    const coords = getCoordinates(e);
    const progress = getProgressFromPosition(coords.x, coords.y);
    
    setCurrentPosition(coords);
    
    // 🆕 ALWAYS add to traced path regardless of whether on path
    setTracedPath(prev => [...prev, coords]);
    
    if (progress > 0) {
      console.log('📈 Progress:', progress);
      handleTraceProgress(progress, coords);
      
      if (progress >= 95) {
        console.log('🎉 Tracing completed!');
        setIsTracing(false);
        setShowCursor(false);
        
        showMessage(`Perfect tracing, ${profileName}!`, {
          duration: 3000,
          animation: 'bounce'
        });
      }
    }
  };

  // Handle end
  const handleEnd = (e) => {
    e.preventDefault();
    console.log('🖱️ Tracing ended');
    setIsTracing(false);
    setShowCursor(false);
    
    if (sceneState.traceProgress < 95) {
      setTimeout(() => {
        showMessage(`Try tracing the whole path, ${profileName}!`, {
          duration: 3000,
          position: 'top-center'
        });
      }, 1000);
    }
  };

  // Render traced path as separate overlay
  const renderTracedPathOverlay = () => {
    if (tracedPath.length < 2) return null;
    
    const pathPoints = tracedPath
      .map(point => `${point.x},${point.y}`)
      .join(' ');
    
    return (
      <svg 
        className="traced-path-svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
        viewBox="0 0 600 200"
      >
        <polyline
          points={pathPoints}
          stroke={sceneState.tracingCompleted ? "#00ff00" : "#ffd700"}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
          filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"
        />
        
        {/* Trail sparkles */}
        {tracedPath.length > 5 && tracedPath.slice(-3).map((point, index) => (
          <circle
            key={`trail-${index}-${Date.now()}`}
            cx={point.x}
            cy={point.y}
            r={4 - index}
            fill="#ffff00"
            opacity={0.7 - (index * 0.2)}
          >
            <animate 
              attributeName="r" 
              values={`${4-index};${6-index};${4-index}`} 
              dur="1s" 
              repeatCount="indefinite" 
            />
          </circle>
        ))}
      </svg>
    );
  };

  console.log('🎮 Tracing render - tracingStarted:', sceneState.tracingStarted, 'tracedPath length:', tracedPath.length);

  return (
    <div className="tracing-area">
      <div className="trace-instructions">
        <h3>🐘 Trace Ganesha's Curved Trunk!</h3>
        <p>Start at the green circle and follow the orange path</p>
      </div>
      
      {/* Main Path SVG */}
      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
        <svg 
          ref={svgRef}
          className="trace-svg" 
          viewBox="0 0 600 200"
          onMouseDown={sceneState.tracingStarted ? handleStart : undefined}
          onMouseMove={sceneState.tracingStarted ? handleMove : undefined}
          onMouseUp={sceneState.tracingStarted ? handleEnd : undefined}
          onTouchStart={sceneState.tracingStarted ? handleStart : undefined}
          onTouchMove={sceneState.tracingStarted ? handleMove : undefined}
          onTouchEnd={sceneState.tracingStarted ? handleEnd : undefined}
          style={{ 
            touchAction: 'none',
            cursor: sceneState.tracingStarted ? 'pointer' : 'default',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
          }}
        >
          {/* Background */}
          <rect width="600" height="200" fill="rgba(255,255,255,0.05)" stroke="#ff8c42" strokeWidth="1"/>
          
          {/* MAIN PATH - Very visible */}
          <path
            d="M 80 60 Q 150 30 250 80 Q 350 120 500 100"
            stroke="#ff8c42"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10,5"
            opacity="0.8"
          />
          
          {/* Progress path */}
          {sceneState.traceProgress > 0 && (
            <path
              d="M 80 60 Q 150 30 250 80 Q 350 120 500 100"
              stroke="#00ff88"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${sceneState.traceProgress * 3} 300`}
              opacity="1"
            />
          )}
          
          {/* Start circle - VERY VISIBLE */}
          <circle cx="80" cy="60" r="15" fill="#00ff00" stroke="#fff" strokeWidth="3">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* End circle - VERY VISIBLE */}
          <circle cx="500" cy="100" r="15" fill="#ff4444" stroke="#fff" strokeWidth="3">
            <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* Current position cursor */}
          {showCursor && (
            <circle 
              cx={currentPosition.x} 
              cy={currentPosition.y} 
              r="10" 
              fill="#ffff00" 
              stroke="#000"
              strokeWidth="2"
              opacity="0.9"
            >
              <animate attributeName="r" values="8;15;8" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {/* 🆕 TRACED PATH OVERLAY - This was missing! */}
        {renderTracedPathOverlay()}
      </div>
      
      {/* Progress indicator */}
      {sceneState.tracingStarted && (
        <div className="trace-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${sceneState.traceProgress || 0}%` }}
            />
          </div>
          <div className="progress-text">
            {Math.round(sceneState.traceProgress || 0)}% traced
          </div>
        </div>
      )}
      
      {/* Start button */}
      {!sceneState.tracingStarted && (
        <div className="trace-start-button" onClick={handleStartTracing}>
          <img src={trunkGuide} alt="Start tracing" />
          <div>Start Tracing!</div>
        </div>
      )}
      
      {/* Completion message */}
      {sceneState.tracingCompleted && (
        <div className="trace-completed">
          <h3>🌟 Perfect Tracing!</h3>
          <p>You followed Ganesha's trunk beautifully!</p>
        </div>
      )}
    </div>
  );

    

  };

  // Render find trunk game
  const renderFindTrunkGame = () => {
    if (sceneState.phase !== CAVE_PHASES.FIND_ACTIVE && sceneState.phase !== CAVE_PHASES.FIND_COMPLETE) return null;
    
    const trunkImages = [
      { id: 'elephant-trunk', image: elephantTrunk, correct: true },
      { id: 'snake', image: snakeImage, correct: false },
      { id: 'tree-root', image: treeRoot, correct: false },
      { id: 'rope', image: rope, correct: false }
    ];
    
    return (
      <div className="find-trunk-area" id="find-area">
        <div className="find-instructions">
          <h3>Find Ganesha's Trunk!</h3>
        </div>
        
        <div className="trunk-options">
          {trunkImages.map((item) => (
            <div
              key={item.id}
              className={`trunk-option ${sceneState.selectedTrunk === item.id ? 'selected' : ''} ${sceneState.correctTrunkFound && item.correct ? 'correct' : ''}`}
              onClick={() => handleTrunkImageClick(item.id)}
            >
              <img src={item.image} alt={item.id} />
              {sceneState.correctTrunkFound && item.correct && (
                <div className="correct-indicator">✅</div>
              )}
            </div>
          ))}
        </div>
        
        {!sceneState.findStarted && (
          <button className="start-find-button" onClick={handleStartFindTrunk}>
            Start Finding!
          </button>
        )}
      </div>
    );
  };

  // Render growing Ganesha game
  const renderGrowingGame = () => {
    if (sceneState.phase !== CAVE_PHASES.GROW_ACTIVE && sceneState.phase !== CAVE_PHASES.GROW_COMPLETE) return null;
    
    return (
      <div className="growing-area" id="grow-area">
        <div className="grow-instructions">
          <h3>Click the Sacred Stones!</h3>
          <p>Watch Ganesha grow mighty and golden!</p>
        </div>
        
        {/* Floating stones */}
        <div className="floating-stones">
          {sceneState.floatingStones.map((stone) => (
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
              <img src={stoneHead} alt={`Stone ${stone.id}`} />
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
        
        {/* Growing Ganesha */}
        <div className="growing-ganesha-container">
          <div 
            className="growing-ganesha"
            style={{
              transform: `scale(${sceneState.ganeshaSize})`,
              filter: `brightness(${1 + sceneState.ganeshaGlow}) drop-shadow(0 0 ${sceneState.ganeshaGlow * 20}px rgba(255, 215, 0, ${sceneState.ganeshaGlow}))`
            }}
          >
            <img 
              src={sceneState.growingCompleted ? ganeshaComplete : ganeshaOutline} 
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
        </div>
        
        {!sceneState.growingStarted && (
          <button className="start-grow-button" onClick={handleStartGrowing}>
            Start Growing!
          </button>
        )}
      </div>
    );
  };

// 🔍 ADD THIS DEBUG BEFORE THE RETURN
console.log('🎮 RENDER DEBUG:', {
  phase: sceneState.phase,
  shouldShowTracing: (sceneState.phase === CAVE_PHASES.TRACE_INTRO || 
                      sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
                      sceneState.phase === CAVE_PHASES.TRACE_COMPLETE),
  TRACE_INTRO: CAVE_PHASES.TRACE_INTRO,
  currentPhase: sceneState.phase
});


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
            
            {/* Sanskrit Progress Counter */}
            <div className="sanskrit-counter">
              <div className="counter-icon">
                <span>📜</span>
              </div>
              <div className="counter-progress">
                <div 
                  className="counter-progress-fill"
                  style={{ width: `${Object.values(sceneState.learnedWords || {}).filter(w => w.learned).length / 2 * 100}%` }}
                />
              </div>
              <div className="counter-display">
                {Object.values(sceneState.learnedWords || {}).filter(w => w.learned).length}/2 Sanskrit words
              </div>
            </div>

            {/* 🚪 Door 1 Component (Va-kra-tun-da) */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <DoorComponent
                syllables={['Va', 'kra', 'tun', 'da']}
                completedWord="Vakratunda"
                onDoorComplete={handleDoor1Complete}
                onSyllablePlaced={handleDoor1SyllablePlaced}
                sceneTheme="cave-of-secrets"
                doorImage={doorImage}
                className="vakratunda-door"
              />
            )}

       // 🔧 TO (temporary debug):
{(sceneState.phase === 'trace_intro' || sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || sceneState.phase === CAVE_PHASES.TRACE_COMPLETE) && (
  renderTracingPath()
)}
            {/* 🎮 Game 2: Find Trunk */}
            {(sceneState.phase === CAVE_PHASES.FIND_INTRO || sceneState.phase === CAVE_PHASES.FIND_ACTIVE || sceneState.phase === CAVE_PHASES.FIND_COMPLETE) && (
              renderFindTrunkGame()
            )}

            {/* 🚪 Door 2 Component (Ma-ha-ka-ya) */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <DoorComponent
                syllables={['Ma', 'ha', 'ka', 'ya']}
                completedWord="Mahakaya"
                onDoorComplete={handleDoor2Complete}
                onSyllablePlaced={handleDoor2SyllablePlaced}
                sceneTheme="cave-of-secrets"
                doorImage={doorImage}
                className="mahakaya-door"
              />
            )}

            {/* 🎮 Game 3: Growing Ganesha */}
            {(sceneState.phase === CAVE_PHASES.GROW_INTRO || sceneState.phase === CAVE_PHASES.GROW_ACTIVE || sceneState.phase === CAVE_PHASES.GROW_COMPLETE) && (
              renderGrowingGame()
            )}

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

            {/* Sanskrit Learning Sidebar */}
            <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={1}
              unlockedScenes={sceneState.unlockedScenes || [1]}
              mode="meanings"
              onWordClick={(wordId, wordData) => {
                console.log(`Sanskrit word clicked: ${wordData.sanskrit}`);
              }}
              onSlideChange={(rowIndex) => {
                console.log(`Sanskrit sidebar row: ${rowIndex + 1}`);
              }}
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

            {/* Final Fireworks */}
            {showSparkle === 'final-celebration' && (
              <Fireworks
                show={true}
                duration={4000}
                count={15}
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