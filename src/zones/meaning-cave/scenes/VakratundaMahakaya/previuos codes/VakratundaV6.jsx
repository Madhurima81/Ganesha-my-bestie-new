// zones/cave-of-secrets/scenes/vakratunda-mahakaya/VakratundaV6-Fixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaV6.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

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

const VakratundaV6Fixed = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  console.log('VakratundaV6Fixed props:', { onComplete, onNavigate, zoneId, sceneId });

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
          
          // ✅ FIXED: Sequential tracing state (like CavePathTracer)
          tracingStarted: false,
          isTracing: false,
          tracedPoints: [],
          traceProgress: 0,
          traceQuality: 'good',
          tracingCompleted: false,
          trunkPosition: { x: 50, y: 100 },
          canResumeTracing: false,
          currentPathSegment: 0,      // ✅ NEW: Which segment to reach next
          segmentsCompleted: [],      // ✅ NEW: Completed segments array
          mustFollowSequence: true,   // ✅ NEW: Force sequential progress

          // Game 2: Growing Ganesha state
          growingStarted: false,
          stonesClicked: 0,
          ganeshaSize: 0.3,
          ganeshaGlow: 0.2,
          ganeshaVisible: true,
          ganeshaAnimation: 'breathing',
          
          floatingStones: [
            { id: 1, clicked: false, x: 20, y: 30 },
            { id: 2, clicked: false, x: 70, y: 20 },
            { id: 3, clicked: false, x: 30, y: 60 },
            { id: 4, clicked: false, x: 80, y: 50 }
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
  console.log('🏗️ VakratundaV6Fixed LOADING - V4 UI + Working Sequential Logic!');

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // ✅ FIXED: Tracing hooks (V4 style but with sequential logic)
  const svgRef = useRef(null);
  const [isTracing, setIsTracing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 120, y: 140 });
  const [tracedPath, setTracedPath] = useState([]);
  const [showCursor, setShowCursor] = useState(false);

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

  // Stone images
  const stoneImages = [
    stoneHead,   // Stone 1 - Head stone
    stoneTrunk,  // Stone 2 - Trunk stone  
    stoneBody,   // Stone 3 - Body stone
    stoneLegs    // Stone 4 - Legs stone
  ];

  // ✅ NEW: Sequential path segments (from CavePathTracer)
  const pathSegments = [
    { x: 120, y: 140, progress: 0, name: "entrance" },
    { x: 180, y: 160, progress: 15, name: "curve1" },
    { x: 250, y: 170, progress: 30, name: "tunnel" },
    { x: 320, y: 175, progress: 50, name: "chamber" },
    { x: 400, y: 165, progress: 70, name: "passage" },
    { x: 450, y: 140, progress: 85, name: "approach" },
    { x: 350, y: 80, progress: 100, name: "treasure" }
  ];

  // ✅ NEW: Sequential progress validation (from CavePathTracer)
  const getSequentialProgress = (x, y) => {
    const currentSegment = sceneState.currentPathSegment || 0;
    const targetSegment = pathSegments[currentSegment];
    
    if (!targetSegment) {
      return { progress: -1, quality: 'complete' };
    }

    const distance = Math.sqrt(
      Math.pow(x - targetSegment.x, 2) + Math.pow(y - targetSegment.y, 2)
    );

    const tolerance = 40; // Must be within 40px of current target

    if (distance < tolerance) {
      // ✅ Reached current segment target
      return {
        progress: targetSegment.progress,
        quality: distance < 25 ? 'perfect' : distance < 35 ? 'good' : 'okay',
        segmentReached: currentSegment,
        segmentName: targetSegment.name
      };
    }

    return { 
      progress: currentSegment > 0 ? pathSegments[currentSegment - 1].progress : 0, 
      quality: 'off-path' 
    };
  };

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

  // ✅ FIXED: Tracing helper functions (V4 style)
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

  // ✅ FIXED: Quality colors (V4 style)
  const getQualityColor = (quality) => {
    switch(quality) {
      case 'perfect': return '#00FF00';  // Bright green
      case 'good': return '#FFFF00';     // Yellow
      case 'okay': return '#FFA500';     // Orange
      case 'off-path': return '#FF4444'; // Red
      default: return '#FFD700';         // Gold default
    }
  };

  // ✅ FIXED: Trace quality feedback (V4 style)
  const getTraceLineColor = (quality, opacity = 1) => {
    const alpha = opacity < 1 ? `, ${opacity}` : '';
    switch(quality) {
      case 'good': return `rgba(0, 255, 0${alpha})`;        // 🟢 Green - "Good!"
      case 'off-path': return `rgba(255, 165, 0${alpha})`;  // 🟠 Orange - "Come back!"
      default: return `rgba(0, 255, 0${alpha})`;            // 🟢 Default green
    }
  };

  // ✅ FIXED: Handle trace start (V4 style but with sequential logic)
  const handleTraceStart = (e) => {
    hideActiveHints();
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ Tracing started');

    if (!sceneState.tracingStarted) {
      console.log('⚠️ Not ready to trace yet, auto-starting...');
      handleStartTracing();
      return;
    }

    // ✅ NEW: Trigger Ganesha happy animation when tracing starts
    setGaneshaAnimation('happy');
    setTimeout(() => setGaneshaAnimation('breathing'), 800);
    
    const coords = getCoordinates(e);
    
    // ✅ FIXED: Only start if near green circle
    const distanceFromStart = Math.sqrt(
      Math.pow(coords.x - 120, 2) + Math.pow(coords.y - 140, 2)
    );
    
    if (distanceFromStart < 30) {
      console.log('✅ Starting from green circle');
      setIsTracing(true);
      setShowCursor(true);
      setCurrentPosition({ x: 120, y: 140 });
      setTracedPath([{ x: 120, y: 140 }]);
      
      // ✅ NEW: Reset sequential tracking
      sceneActions.updateState({ 
        currentPathSegment: 1,  // Start looking for segment 1
        traceProgress: 0
      });
      
      // Show V4-style feedback
      if (showMessage) {
        showMessage(`Great start, ${profileName}! Follow the curved path!`, {
          duration: 2000,
          position: 'top-center'
        });
      }
      
    } else {
      console.log('❌ Must start from green circle');
      if (showMessage) {
        showMessage(`Start from the green circle, ${profileName}!`, {
          duration: 2000,
          animation: 'bounce',
          position: 'top-center'
        });
      }
    }
  };

  // ✅ FIXED: Handle trace move (V4 style but with sequential validation)
  const handleTraceMove = (e) => {
    if (!isTracing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    setCurrentPosition(coords);
    setTracedPath(prev => [...prev, coords]);
    
    // ✅ NEW: Use sequential validation instead of old logic
    const result = getSequentialProgress(coords.x, coords.y);
    
    if (result.segmentReached !== undefined && result.segmentReached === sceneState.currentPathSegment) {
      // ✅ Reached the next required segment!
      console.log(`✅ Cave segment reached: ${result.segmentName}`);
      
      const newProgress = result.progress;
      
      sceneActions.updateState({
        traceProgress: newProgress,
        traceQuality: result.quality,
        currentPathSegment: sceneState.currentPathSegment + 1
      });
      
      // Show V4-style progress feedback
      if (showMessage && newProgress < 100) {
        showMessage(`Great! ${Math.round(newProgress)}% complete!`, {
          duration: 1500,
          position: 'top-center'
        });
      }
      
      if (newProgress >= 100) {
        console.log('🎉 Sequential tracing completed!');
        completeTracing();
      }
      
    } else if (result.quality === 'off-path') {
      // ❌ Off path - show V4-style guidance
      sceneActions.updateState({ traceQuality: 'off-path' });
      
      const targetSegment = pathSegments[sceneState.currentPathSegment];
      if (targetSegment && showMessage) {
        showMessage(`🐘 Follow the orange path to ${targetSegment.name}!`, {
          duration: 1500,
          position: 'top-center'
        });
      }
    }
  };

  // ✅ FIXED: Handle trace end (V4 style)
  const handleTraceEnd = (e) => {
    if (!isTracing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ Tracing paused - Progress saved:', sceneState.traceProgress);
    setIsTracing(false);
    setShowCursor(false);
    
    if (sceneState.traceProgress < 95 && sceneState.traceProgress > 10) {
      if (showMessage) {
        showMessage(`Progress saved: ${Math.round(sceneState.traceProgress)}%. Tap to continue!`, {
          duration: 3000,
          position: 'top-center'
        });
      }
      sceneActions.updateState({ canResumeTracing: true });
    } else if (sceneState.traceProgress < 10) {
      if (showMessage) {
        showMessage(`Start from the green circle, ${profileName}!`, {
          duration: 3000,
          position: 'top-center'
        });
      }
      setTracedPath([]);
      sceneActions.updateState({ 
        traceProgress: 0,
        currentPathSegment: 0,
        canResumeTracing: false
      });
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

  // ✅ FIXED: Watch for GameCoach visibility changes
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

  // ✅ FIXED: GameCoach triggering system
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
        phase: CAVE_PHASES.TRACE_ACTIVE,
        tracingStarted: true
      });
    }, 1000);
  };

  // ✅ FIXED: Start tracing (V4 style)
  const handleStartTracing = () => {
    console.log('🐘 Starting trunk tracing game!');
    
    setTracedPath([]);
    setCurrentPosition({ x: 120, y: 140 });
    
    sceneActions.updateState({
      tracingStarted: true,
      phase: CAVE_PHASES.TRACE_ACTIVE,
      traceProgress: 0,
      currentPathSegment: 0,  // ✅ NEW: Reset to start
      canResumeTracing: false
    });
  };

  // ✅ FIXED: Complete tracing (V4 flow preserved)
  const completeTracing = () => {
    console.log('🌟 Tracing completed - going directly to Vakratunda learning!');
    
    setIsTracing(false);
    setShowCursor(false);
    
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

    // Show V4-style completion message
    if (showMessage) {
      showMessage(`Perfect tracing, ${profileName}! You followed Ganesha's trunk beautifully!`, {
        duration: 3000,
        animation: 'bounce',
        position: 'top-center'
      });
    }

    safeSetTimeout(() => {
      completeVakratundaLearning();
    }, 2000);
  };

  // ✅ PRESERVED: All V4 completion flow
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

  // Door 2 handlers (preserved from V4)
  const handleDoor2SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ma';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      console.log(`✅ Correct! Step ${newStep-1} -> ${newStep}`);
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
      
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

  // Growing game handlers (preserved from V4)
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

  // ✅ ALL V4 handlers preserved...
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
          sceneActions.updateState({ 
            isReloadingGameCoach: false,
            symbolDiscoveryState: null,
            sidebarHighlightState: null
          });
        }, 500);
        break;
    }
  };

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
      }, 500);

    } else if (cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Mahakaya card closed - triggering final GameCoach wisdom');
      
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

  // ✅ FIXED: Get Ganesha animation class
  const getGaneshaAnimationClass = () => {
    if (!sceneState.ganeshaVisible) return '';
    if (ganeshaAnimation === 'happy') return 'happy';
    if (ganeshaAnimation === 'growing') return 'growing';
    if (ganeshaAnimation === 'mighty') return 'mighty breathing';
    return 'breathing';
  };

  // ✅ FIXED: Render tracing path (V4 style but with sequential logic)
  const renderTracingPath = () => {
    return (
      <div className="tracing-area" id="tracing-area">
        <div className="trace-instructions">
          <h3>🐘 Trace Ganesha's Curved Trunk!</h3>
          <p>Start at the green circle and follow the orange path</p>
          {sceneState.canResumeTracing && (
            <p style={{ color: '#ffd700', fontWeight: 'bold' }}>
              Progress saved: {Math.round(sceneState.traceProgress)}% - Continue tracing!
            </p>
          )}
        </div>
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '200px',
          margin: '20px auto',             
          maxWidth: '600px'                
        }}>

          <svg 
            ref={svgRef}
            className="trace-svg" 
            viewBox="0 0 600 200"
            onMouseDown={handleTraceStart}
            onMouseMove={handleTraceMove}
            onMouseUp={handleTraceEnd}
            onTouchStart={handleTraceStart}
            onTouchMove={handleTraceMove}
            onTouchEnd={handleTraceEnd}
            style={{ 
              touchAction: 'none',
              cursor: 'pointer',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isTracing ? 1 : 0.7
            }}
          >
            
            {/* Tolerance zone guide */}
            <path
              d="M 120 140 Q 180 170 280 180 Q 380 185 480 170 Q 550 130 350 80"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="50"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Main orange path */}
            <path
              d="M 120 140 Q 180 170 280 180 Q 380 185 480 170 Q 550 130 350 80"
              stroke="#ff8c42"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="15,8"
              opacity="0.9"
            />
            
            {/* Progress indicator */}
            {sceneState.traceProgress > 0 && (
              <path
                d="M 120 140 Q 180 170 280 180 Q 380 185 480 170 Q 550 130 350 80"
                stroke="#00ff88"
                strokeWidth="25"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${sceneState.traceProgress * 3} 300`}
                opacity="1"
              />
            )}
            
            {/* Start circle (green) */}
            <circle cx="120" cy="140" r="15" fill="#00ff00" stroke="#fff" strokeWidth="3">
              <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {/* End circle (red) */}
            <circle cx="350" cy="80" r="15" fill="#ff4444" stroke="#fff" strokeWidth="3">
              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* ✅ NEW: Sequential tracking indicators */}
            {pathSegments.map((segment, index) => {
              if (index === 0 || index === pathSegments.length - 1) return null; // Skip start/end
              
              const isCompleted = index < sceneState.currentPathSegment;
              const isActive = index === sceneState.currentPathSegment;
              
              return (
                <circle
                  key={index}
                  cx={segment.x}
                  cy={segment.y}
                  r="8"
                  fill={isCompleted ? "#00ff00" : isActive ? "#ffff00" : "rgba(255,255,255,0.3)"}
                  stroke="#fff"
                  strokeWidth="2"
                  opacity={isCompleted || isActive ? 1 : 0.5}
                >
                  {isActive && (
                    <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>
              );
            })}
            
            {/* Traced path overlay */}
            {tracedPath.length > 1 && (
              <polyline
                points={tracedPath.map(point => `${point.x},${point.y}`).join(' ')}
                stroke={getTraceLineColor(sceneState.traceQuality || 'good')}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
                filter={`drop-shadow(0 0 6px ${getTraceLineColor(sceneState.traceQuality || 'good', 0.6)})`}
              />
            )}

            {/* Cursor */}
            {showCursor && (
              <circle 
                cx={currentPosition.x} 
                cy={currentPosition.y} 
                r="10" 
                fill={getQualityColor(sceneState.traceQuality || 'good')}
                stroke="#000"
                strokeWidth="2"
                opacity="0.9"
              >
                <animate attributeName="r" values="8;15;8" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Mooshika character on traced path */}
            {tracedPath.length > 0 && (
              <MooshikaCharacter
                position={currentPosition}
                tracedPath={tracedPath}
                pathQuality={sceneState.traceQuality || 'good'}
                isTracing={isTracing}
                isVisible={true}
                size={95}
              />
            )}

          </svg>
        </div>
        
        {/* Quality feedback display */}
        {sceneState.tracingStarted && sceneState.traceQuality && (
          <div style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 25,
            border: '2px solid #FFD700'
          }}>
            {sceneState.traceQuality === 'good' && '✅ Great tracing!'}
            {sceneState.traceQuality === 'off-path' && '🐘 Follow the trunk curve!'}
          </div>
        )}
        
        {!sceneState.tracingStarted && (
          <div className="trace-start-button" onClick={handleStartTracing}>
            <img src={trunkGuide} alt="Start tracing" />
            <div>Start Tracing!</div>
          </div>
        )}

        {!isTracing && sceneState.tracingStarted && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 215, 0, 0.9)',
            padding: '10px 20px',
            borderRadius: '15px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold', 
            color: '#8B4513'
          }}>
            🐘 Click the green circle to continue!
          </div>
        )}

        {sceneState.tracingCompleted && (
          <div className="trace-completed">
            <h3>🌟 Perfect Tracing!</h3>
            <p>You followed Ganesha's trunk beautifully!</p>
          </div>
        )}
      </div>
    );
  };

  // ✅ FIXED: Render growing Ganesha game
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
        
        <div className="growing-ganesha-container">
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
        </div>
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

            {/* Complete Test Button */}
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
              console.log('🧪 CAVE COMPLETION TEST');
              
              sceneActions.updateState({
                growingStarted: true,
                growingCompleted: true,
                ganeshaSize: 1.3,
                ganeshaGlow: 1.2,
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
                educationalMode={true}
                showTargetWord={true}
                currentStep={sceneState.door1CurrentStep || 0}
                expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                targetWordTitle="🚪 VAKRATUNDA 🚪"
                primaryColor="#FFD700"
                secondaryColor="#FF8C42"
                errorColor="#FF4444"
              />
            )}

            {/* ✅ FIXED: V4-style Tracing Game with Sequential Logic */}
            {(sceneState.phase === CAVE_PHASES.TRACE_INTRO || sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || sceneState.phase === CAVE_PHASES.TRACE_COMPLETE) && (
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

            {/* Mini Ganesha - Always visible */}
            {sceneState.ganeshaVisible && (
              <div 
                className={`mini-ganesha-container ${getGaneshaAnimationClass()}`}
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: '65%',
                  transform: `translate(-50%, -50%) scale(${sceneState.ganeshaSize || 0.3})`,
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

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaV6Fixed;