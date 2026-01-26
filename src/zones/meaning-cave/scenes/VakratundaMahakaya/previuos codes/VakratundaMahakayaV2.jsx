// zones/cave-of-secrets/scenes/vakratunda-mahakaya/VakratundaMahakaya.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaMahakaya.css';

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

// NEW: Sanskrit Learning Sidebar
import SanskritSidebar from '../../../../../lib/components/feedback/SanskritSidebar';

// 🆕 NEW: Door Component
import DoorComponent from '../../../components/DoorComponent';

// Cave-themed images
import caveBackground from './assets/images/cave-background.png';
import pathSegment1 from './assets/images/path-segment-1.png';
import pathSegment2 from './assets/images/path-segment-2.png';
import pathSegment3 from './assets/images/path-segment-3.png';
import pathSegment4 from './assets/images/path-segment-4.png';
import pathSegment5 from './assets/images/path-segment-5.png';
import trunkGuide from './assets/images/trunk-guide.png';
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';
import ganeshaOutline from './assets/images/ganesha-outline.png';
import ganeshaComplete from './assets/images/ganesha-complete.png';
import rockPiece1 from './assets/images/rock-piece-1.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
// Add this line with your other image imports
import doorImage from './assets/images/door-image.png';

// Sanskrit learning card images
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';

// 🔄 UPDATED: Added door phases
const CAVE_PHASES = {
  DOOR_ACTIVE: 'door_active',        // 🆕 NEW
  DOOR_COMPLETE: 'door_complete',    // 🆕 NEW
  INITIAL: 'initial',
  MAZE_INTRO: 'maze_intro',
  MAZE_ACTIVE: 'maze_active',
  MAZE_COMPLETE: 'maze_complete',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  STONES_INTRO: 'stones_intro', 
  STONES_ACTIVE: 'stones_active',
  STONES_COMPLETE: 'stones_complete',
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

const VakratundaMahakaya = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  console.log('VakratundaMahakaya props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // 🆕 NEW: Door state
          doorState: 'waiting',
          syllablesPlaced: [],
          doorCompleted: false,
          
          // Maze game state
          currentPathSegment: 0,
          pathSegmentsCompleted: [false, false, false, false, false],
          nextAvailableSegment: 1,
          trunkPosition: { segment: 0, animating: false },
          pathSegmentStates: ['inactive', 'ready', 'inactive', 'inactive', 'inactive'],
          mazeCompleted: false,
          
          // Stone stacking game state
          placedStones: 0,
          stonePositions: {
            head: false,
            trunk: false, 
            body: false,
            legs: false
          },
          selectedStone: null,
          ganeshaFormVisible: false,
          ganeshaFormComplete: false,
          
          // 🔄 UPDATED: Sanskrit learning state with door tracking
          learnedWords: {
            vakratunda: { learned: false, scene: 1, doorStarted: false },
            mahakaya: { learned: false, scene: 1, doorStarted: false }
          },
          unlockedScenes: [1],
          
          // 🔄 UPDATED: Scene progression starts with door
          phase: CAVE_PHASES.DOOR_ACTIVE,
          currentFocus: 'door',
          
          // Popup and learning states (reuse pond system)
          currentPopup: null,
          discoveredSymbols: {},
          gameCoachState: null,
          isReloadingGameCoach: false,
          
          // Message flags
          welcomeShown: false,
          mazeWisdomShown: false,
          stoneWisdomShown: false,
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

  // 🔄 UPDATED: Default to door phase instead of initial
  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR_ACTIVE });

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

  // 🔄 UPDATED: Cave-specific GameCoach messages with door welcome
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Cave of Secrets, ${profileName}! Touch the floating syllables to unlock the ancient door!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'maze_wisdom',
      message: `Magnificent, ${profileName}! You followed Ganesha's curved path like a true seeker of wisdom!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.vakratunda?.learned && !sceneState?.mazeWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'stone_wisdom',
      message: `Wonderful work, ${profileName}! You've built Ganesha's mighty form with such dedication!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.mahakaya?.learned && !sceneState?.stoneWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // Cave-specific hint configurations
  const getCaveHintConfigs = () => [
    {
      id: 'trunk-path-hint',
      message: 'Click the glowing path segment to guide Ganesha\'s trunk!',
      explicitMessage: 'Click the glowing segments one by one to build the path!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return !sceneState.mazeCompleted &&
               sceneState.phase === CAVE_PHASES.MAZE_ACTIVE &&
               !showMagicalCard &&
               !isVisible &&
               !showPopupBook;
      }
    },
    {
      id: 'stone-stacking-hint',
      message: 'Build Ganesha\'s mighty form!',
      explicitMessage: 'Click stones and then click where they belong on Ganesha!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.mazeCompleted &&
               sceneState.placedStones < 4 &&
               sceneState.phase === CAVE_PHASES.STONES_ACTIVE &&
               !showMagicalCard &&
               !isVisible &&
               !showPopupBook;
      }
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

  // GameCoach visibility watcher for pending actions
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
      
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'start-stone-stacking':
            console.log('🏗️ Starting stone stacking after maze wisdom');
            setShowSparkle('maze-to-stones-transition');
            
            safeSetTimeout(() => {
              sceneActions.updateState({
                phase: CAVE_PHASES.STONES_INTRO,
                ganeshaFormVisible: true,
                currentFocus: 'stones',
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              setShowSparkle('stones-intro');
              safeSetTimeout(() => setShowSparkle(null), 2000);
            }, 1000);
            break;
            
          case 'complete-scene':
            console.log('🎊 Completing cave scene after stone wisdom');
            setShowSparkle('scene-completion');
            
            safeSetTimeout(() => {
              sceneActions.updateState({
                phase: CAVE_PHASES.SCENE_CELEBRATION,
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              setShowSparkle(null);
              
              safeSetTimeout(() => {
                showFinalCelebration();
              }, 800);
            }, 500);
            break;
        }
        
        setPendingAction(null);
      }, 1000);
      
      timeoutsRef.current.push(actionTimer);
    }
    
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // Hide active hints function
  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  // GameCoach message system (adapted from pond)
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

    const matchingMessage = caveGameCoachMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );

    if (matchingMessage) {
      const messageAlreadyShown =
        (matchingMessage.id === 'maze_wisdom' && sceneState.mazeWisdomShown) ||
        (matchingMessage.id === 'stone_wisdom' && sceneState.stoneWisdomShown) ||
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
            duration: 8000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: getMessageType(matchingMessage.id)
          });
        }, 2000);
      });

      // Mark message as shown
      switch (matchingMessage.id) {
        case 'cave_welcome':
          sceneActions.updateState({ welcomeShown: true });
          break;
        case 'maze_wisdom':
          sceneActions.updateState({
            mazeWisdomShown: true,
            readyForWisdom: false,
            gameCoachState: 'maze_wisdom',
            lastGameCoachTime: Date.now()
          });
          setPendingAction('start-stone-stacking');
          break;
        case 'stone_wisdom':
          sceneActions.updateState({
            stoneWisdomShown: true,
            readyForWisdom: false,
            gameCoachState: 'stone_wisdom',
            lastGameCoachTime: Date.now()
          });
          setPendingAction('complete-scene');
          break;
      }

      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase,
    sceneState?.learnedWords,
    sceneState?.welcomeShown,
    sceneState?.mazeWisdomShown,
    sceneState?.stoneWisdomShown,
    sceneState?.readyForWisdom,
    sceneState?.gameCoachState,
    sceneState?.symbolDiscoveryState,
    showMessage
  ]);

  // Helper function for message colors
  const getMessageType = (messageId) => {
    switch(messageId) {
      case 'cave_welcome': return 'welcome';
      case 'maze_wisdom': return 'wisdom1';
      case 'stone_wisdom': return 'wisdom2';
      default: return 'welcome';
    }
  };


const handleDoorSyllablePlaced = (syllable) => {
  console.log(`Door syllable placed: ${syllable}`);
  
  const newSyllablesPlaced = [...(sceneState.syllablesPlaced || []), syllable];
  
  // Only highlight when ALL 4 syllables are placed
  const allSyllablesPlaced = newSyllablesPlaced.length >= 4;
  
  sceneActions.updateState({
    learnedWords: {
      ...sceneState.learnedWords,
      vakratunda: { 
        ...sceneState.learnedWords.vakratunda, 
        doorStarted: allSyllablesPlaced  // 🆕 True only when all 4 placed
      }
    },
    syllablesPlaced: newSyllablesPlaced
  });
};

  const handleDoorComplete = () => {
    console.log('🚪 Door completed - starting maze game!');
    
    // Update state to show door is complete
    sceneActions.updateState({
      doorCompleted: true,
      phase: CAVE_PHASES.DOOR_COMPLETE
    });
    
    // Start maze game after door animation
    setTimeout(() => {
      sceneActions.updateState({
        phase: CAVE_PHASES.MAZE_INTRO
      });
    }, 1000);
  };

  // 🔄 UPDATED: Trunk guide handler with phase check
  const handleTrunkGuideClick = () => {
    if (!sceneState || sceneState.mazeCompleted || sceneState.phase !== CAVE_PHASES.MAZE_INTRO) return;

    console.log('Trunk guide clicked - starting interactive maze');
    hideActiveHints();
    hideCoach();

    // Start interactive maze mode
    sceneActions.updateState({
      phase: CAVE_PHASES.MAZE_ACTIVE,
      currentFocus: 'maze',
      nextAvailableSegment: 1,
      pathSegmentStates: ['inactive', 'ready', 'inactive', 'inactive', 'inactive'],
      trunkPosition: { segment: 0, animating: false }
    });

    // Show GameCoach instruction
    setTimeout(() => {
      showMessage(`Follow Ganesha's curved trunk path, ${profileName}! Click the glowing path segments one by one!`, {
        duration: 6000,
        animation: 'bounce',
        position: 'top-right'
      });
    }, 1000);
  };

  // Handle individual path segment clicks
  const handlePathSegmentClick = (segmentIndex) => {
    if (!sceneState || sceneState.mazeCompleted) return;
    
    const segmentNumber = segmentIndex + 1;
    
    // Check if this segment is clickable
    if (segmentNumber !== sceneState.nextAvailableSegment) {
      console.log(`Wrong segment clicked: ${segmentNumber}, expected: ${sceneState.nextAvailableSegment}`);
      setShowSparkle('wrong-segment-hint');
      
      // Gentle guidance - highlight correct segment
      setTimeout(() => {
        setShowSparkle(`segment-${sceneState.nextAvailableSegment}-hint`);
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1000);
      return;
    }

    console.log(`Correct segment clicked: ${segmentNumber}`);
    hideActiveHints();
    
    // Start trunk animation to this segment
    animateTrunkToSegment(segmentIndex);
  };

  // Animate trunk movement to segment
  const animateTrunkToSegment = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    console.log(`Animating trunk to segment ${segmentNumber}`);
    
    // Show movement sparkles
    setShowSparkle(`trunk-moving-to-${segmentNumber}`);
    
    // Update trunk position with animation flag
    sceneActions.updateState({
      trunkPosition: { segment: segmentNumber, animating: true }
    });
    
    // Complete animation after 2 seconds
    safeSetTimeout(() => {
      completeSegmentConnection(segmentIndex);
    }, 2000);
  };

  // Complete segment connection
  const completeSegmentConnection = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    console.log(`Completing connection to segment ${segmentNumber}`);
    
    // Mark segment as completed
    const newCompletedPaths = [...sceneState.pathSegmentsCompleted];
    newCompletedPaths[segmentIndex] = true;
    
    // Update segment states
    const newSegmentStates = [...sceneState.pathSegmentStates];
    newSegmentStates[segmentIndex] = 'completed';
    
    // Make next segment ready (if exists)
    if (segmentNumber < 5) {
      newSegmentStates[segmentNumber] = 'ready';
    }
    
    // Update state
    sceneActions.updateState({
      currentPathSegment: segmentNumber,
      pathSegmentsCompleted: newCompletedPaths,
      pathSegmentStates: newSegmentStates,
      nextAvailableSegment: segmentNumber < 5 ? segmentNumber + 1 : null,
      trunkPosition: { segment: segmentNumber, animating: false },
      progress: {
        ...sceneState.progress,
        percentage: Math.round(segmentNumber / 5 * 25)
      }
    });

    // Show completion sparkles
    setShowSparkle(`segment-${segmentNumber}-complete`);
    safeSetTimeout(() => setShowSparkle(null), 1500);
    
    // Check if maze is complete
    if (segmentNumber >= 5) {
      safeSetTimeout(() => {
        completeMaze();
      }, 2000);
    }
  };

  // Complete maze and learn Vakratunda
  const completeMaze = () => {
    console.log('🌟 Maze completed!');
    
    setShowSparkle('maze-completion');
    
    sceneActions.updateState({
      mazeCompleted: true,
      phase: CAVE_PHASES.MAZE_COMPLETE,
      progress: {
        ...sceneState.progress,
        percentage: 25,
        starsEarned: 1
      }
    });

    // Start Vakratunda learning sequence
    safeSetTimeout(() => {
      startVakratundaLearning();
    }, 2000);
  };

  // Vakratunda learning sequence
  const startVakratundaLearning = () => {
    console.log('📜 Starting Vakratunda learning');
    
    sceneActions.updateState({
      symbolDiscoveryState: 'vakratunda_discovering',
      currentPopup: 'vakratunda_info',
      phase: CAVE_PHASES.VAKRATUNDA_LEARNING
    });

    setPopupBookContent({
      title: "Vakratunda - The Curved Trunk",
      symbolImage: vakratundaCard,
      description: `Vakratunda means "curved trunk", ${profileName}! Just like the curved path you followed through the cave. Ganesha's trunk can reach anywhere to help!`
    });

    setCurrentSourceElement('maze-area');
    setShowPopupBook(true);
  };

  // Stone stacking click handlers
  const handleStoneClick = (stoneType) => {
    if (!sceneState || sceneState.phase !== CAVE_PHASES.STONES_ACTIVE) return;
    
    console.log(`Stone clicked: ${stoneType}`);
    hideActiveHints();

    // Select/deselect stone
    if (sceneState.selectedStone === stoneType) {
      sceneActions.updateState({ selectedStone: null });
    } else {
      sceneActions.updateState({ selectedStone: stoneType });
      setShowSparkle(`stone-selected-${stoneType}`);
      setTimeout(() => setShowSparkle(null), 500);
    }
  };

  const handleBodyPartClick = (partType) => {
    if (!sceneState || !sceneState.selectedStone || sceneState.phase !== CAVE_PHASES.STONES_ACTIVE) return;

    const selectedStone = sceneState.selectedStone;
    
    // Check if stone matches body part
    if (selectedStone !== partType) {
      console.log(`Wrong placement: ${selectedStone} doesn't go on ${partType}`);
      setShowSparkle('incorrect-placement');
      setTimeout(() => setShowSparkle(null), 1000);
      return;
    }

    // Correct placement
    console.log(`Correct placement: ${selectedStone} on ${partType}`);
    
    const newStonePositions = {
      ...sceneState.stonePositions,
      [partType]: true
    };
    
    const newPlacedStones = sceneState.placedStones + 1;
    
    sceneActions.updateState({
      stonePositions: newStonePositions,
      placedStones: newPlacedStones,
      selectedStone: null,
      progress: {
        ...sceneState.progress,
        percentage: 25 + (newPlacedStones / 4 * 25),
        starsEarned: 1 + newPlacedStones
      }
    });

    setShowSparkle(`stone-placed-${partType}`);
    setTimeout(() => setShowSparkle(null), 1500);

    // Check if all stones placed
    if (newPlacedStones >= 4) {
      safeSetTimeout(() => {
        completeStoneStacking();
      }, 2000);
    }
  };

  // Complete stone stacking and learn Mahakaya
  const completeStoneStacking = () => {
    console.log('🏗️ Stone stacking completed!');
    
    sceneActions.updateState({
      ganeshaFormComplete: true,
      phase: CAVE_PHASES.STONES_COMPLETE,
      progress: {
        ...sceneState.progress,
        percentage: 50,
        starsEarned: 5
      }
    });

    setShowSparkle('ganesha-form-complete');

    // Start Mahakaya learning sequence
    safeSetTimeout(() => {
      startMahakayaLearning();
    }, 2000);
  };

  // Mahakaya learning sequence
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
      description: `Mahakaya means "mighty form", ${profileName}! Just like how you built Ganesha's powerful shape with the stones. Ganesha is strong enough to help with any challenge!`
    });

    setCurrentSourceElement('ganesha-form');
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
        stars = 2;
        
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
      console.log('📜 Vakratunda card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'maze_wisdom'
        });
        setPendingAction('start-stone-stacking');
      }, 500);

    } else if (cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'stone_wisdom'
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
      stars: 5,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 5,
        completed: true
      }
    });

    setShowSparkle('final-celebration');
  };

  // Render path segments
  const renderPathSegments = () => {
    const pathImages = [pathSegment1, pathSegment2, pathSegment3, pathSegment4, pathSegment5];
    
    return pathImages.map((segment, index) => {
      const segmentNumber = index + 1;
      const isCompleted = sceneState.pathSegmentsCompleted?.[index];
      const isActive = sceneState.currentPathSegment === segmentNumber;
      const segmentState = sceneState.pathSegmentStates?.[index] || 'inactive';
      const isClickable = segmentState === 'ready';
      
      return (
        <div
          key={index}
          className={`path-segment segment-${segmentNumber} ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${segmentState}`}
          onClick={() => handlePathSegmentClick(index)}
          style={{ 
            cursor: isClickable ? 'pointer' : 'default',
            opacity: segmentState === 'inactive' ? 0.3 : 1
          }}
        >
          <img src={segment} alt={`Path segment ${segmentNumber}`} />
          
          {/* Sparkle animations for various states */}
          {showSparkle === `path-segment-${segmentNumber}` && (
            <SparkleAnimation type="star" count={12} color="#ffd700" size={8} duration={800} fadeOut={true} area="full" />
          )}
          
          {showSparkle === `trunk-moving-to-${segmentNumber}` && (
            <SparkleAnimation type="magic" count={15} color="#ff8c42" size={10} duration={2000} fadeOut={true} area="full" />
          )}
          
          {showSparkle === `segment-${segmentNumber}-complete` && (
            <SparkleAnimation type="glitter" count={20} color="#ffd700" size={12} duration={1500} fadeOut={true} area="full" />
          )}
          
          {showSparkle === `segment-${segmentNumber}-hint` && (
            <SparkleAnimation type="pulse" count={8} color="#00ff00" size={6} duration={2000} fadeOut={true} area="full" />
          )}
        </div>
      );
    });
  };

  // Render stones for stacking game
  const renderStones = () => {
    const stones = [
      { type: 'head', image: stoneHead, emoji: '👑' },
      { type: 'trunk', image: stoneTrunk, emoji: '🐘' },
      { type: 'body', image: stoneBody, emoji: '💪' },
      { type: 'legs', image: stoneLegs, emoji: '🦵' }
    ];

    return stones.map((stone) => {
      if (sceneState.stonePositions?.[stone.type]) return null; // Hide placed stones
      
      const isSelected = sceneState.selectedStone === stone.type;
      
      return (
        <div
          key={stone.type}
          className={`strength-stone ${stone.type}-stone ${isSelected ? 'selected' : ''}`}
          onClick={() => handleStoneClick(stone.type)}
        >
          <img src={stone.image} alt={`${stone.type} stone`} />
          <div className="stone-emoji">{stone.emoji}</div>
          {showSparkle === `stone-selected-${stone.type}` && (
            <SparkleAnimation
              type="magic"
              count={8}
              color="#ffd700"
              size={6}
              duration={500}
              fadeOut={true}
              area="full"
            />
          )}
        </div>
      );
    });
  };

  // Render Ganesha form zones
  const renderGaneshaForm = () => {
    if (!sceneState.ganeshaFormVisible) return null;

    const bodyParts = [
      { type: 'head', label: 'Crown', emoji: '👑' },
      { type: 'trunk', label: 'Trunk', emoji: '🐘' },
      { type: 'body', label: 'Body', emoji: '💪' },
      { type: 'legs', label: 'Legs', emoji: '🦵' }
    ];

    return (
      <div className={`ganesha-form-container ${sceneState.ganeshaFormComplete ? 'complete' : ''}`}>
        <img 
          src={sceneState.ganeshaFormComplete ? ganeshaComplete : ganeshaOutline} 
          alt="Ganesha form" 
          className="ganesha-base"
        />
        
        {bodyParts.map((part) => {
          const isPlaced = sceneState.stonePositions?.[part.type];
          
          return (
            <div
              key={part.type}
              className={`body-part-zone ${part.type}-zone ${isPlaced ? 'filled' : ''}`}
              onClick={() => handleBodyPartClick(part.type)}
            >
              {isPlaced && (
                <div className="placed-stone-indicator">{part.emoji}</div>
              )}
              {showSparkle === `stone-placed-${part.type}` && (
                <SparkleAnimation
                  type="glitter"
                  count={15}
                  color="#ffd700"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          );
        })}
        
        {showSparkle === 'ganesha-form-complete' && (
          <SparkleAnimation
            type="firework"
            count={25}
            color="#ffd700"
            size={12}
            duration={2000}
            fadeOut={true}
            area="full"
          />
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

            {/* 🆕 NEW: Door Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR_COMPLETE) && (
              <DoorComponent
  syllables={['Va', 'kra', 'tun', 'da']}  // 🆕 4 syllables
                completedWord="Vakratunda"
                onDoorComplete={handleDoorComplete}
                onSyllablePlaced={handleDoorSyllablePlaced}
                sceneTheme="cave-of-secrets"
doorImage={doorImage}
                className="vakratunda-door"
              />
            )}

            {/* 🔄 UPDATED: Maze Area - only shows after door complete */}
            {(sceneState.phase === CAVE_PHASES.MAZE_INTRO || sceneState.phase === CAVE_PHASES.MAZE_ACTIVE) && (
              <div className="maze-area" id="maze-area">
                {renderPathSegments()}
                
                {/* 🔄 UPDATED: Trunk Guide - only shows in maze intro phase */}
                {!sceneState.mazeCompleted && sceneState.phase === CAVE_PHASES.MAZE_INTRO && (
                  <div className="trunk-guide">
                    <ClickableElement
                      id="trunk-guide"
                      onClick={handleTrunkGuideClick}
                      completed={sceneState.mazeCompleted}
                      zone="cave-zone"
                    >
                      <img src={trunkGuide} alt="Ganesha's trunk guide" />
                    </ClickableElement>
                    {showSparkle === 'trunk-guide' && (
                      <SparkleAnimation
                        type="magic"
                        count={10}
                        color="#ff8c42"
                        size={8}
                        duration={1500}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stone Stacking Area */}
            {sceneState.phase === CAVE_PHASES.STONES_INTRO || sceneState.phase === CAVE_PHASES.STONES_ACTIVE ? (
              <div className="stones-area">
                {renderStones()}
              </div>
            ) : null}

            {/* Ganesha Form */}
            <div className="ganesha-area" id="ganesha-form">
              {renderGaneshaForm()}
            </div>

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

            {/* Divine light for GameCoach entrance */}
            {showSparkle === 'divine-light' && (
              <div className="divine-light-effect">
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

            {/* Progressive Hint System */}
            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getCaveHintConfigs()}
              characterImage={mooshikaCoach}
              initialDelay={20000}
              hintDisplayTime={10000}
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={setHintUsed}
              enabled={true}
            />

            {/* 🔄 UPDATED: Sanskrit Learning Sidebar with door state */}
            <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={1}
              unlockedScenes={sceneState.unlockedScenes || [1]}
              mode="meanings"
              currentWord={sceneState.learnedWords?.vakratunda?.doorStarted ? 'vakratunda' : null}
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
                      stars: 5,
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
              starsEarned={sceneState.progress?.starsEarned || 5}
              totalStars={5}
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
                stars: 5,
                sanskritWords: { vakratunda: true, mahakaya: true },
                completed: true,
                totalStars: 5
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

export default VakratundaMahakaya;