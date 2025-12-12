// zones/symbol-mountain/scenes/pond/PondSceneSimplified.jsx
import React, { useState, useEffect, useRef } from 'react';
import './PondScene.css';


// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';


// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';


// Images
import pondBackground from './assets/images/pond-background.png';
import lotusClosed from './assets/images/lotus-closed.png';
import lotusBloomed from './assets/images/lotus-bloomed.png';
import goldenLotusClosed from './assets/images/golden-lotus-closed.png';
import goldenLotusBloomed from './assets/images/golden-lotus-bloomed.png';
import elephantFull from './assets/images/elephant-full.png';
import waterElephant from './assets/images/water-elephant.png';
import popup1 from './assets/images/popup-1.png';
import popupGolden from './assets/images/popup-golden.png';
import popupTrunk from './assets/images/popup-trunk.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';


const PHASES = {
  INITIAL: 'initial',
  SOME_BLOOMED: 'some_bloomed',
  ALL_BLOOMED: 'all_bloomed',
  GOLDEN_VISIBLE: 'golden_visible',
  GOLDEN_POPUP: 'golden_popup',
  ELEPHANT_VISIBLE: 'elephant_visible',
  ELEPHANT_TRANSFORMED: 'elephant_transformed',
  GOLDEN_BLOOM: 'golden_bloom',
  COMPLETE: 'complete'
};


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


const PondSceneSimplified = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'pond'
}) => {
  console.log('PondSceneSimplified props:', { onComplete, onNavigate, zoneId, sceneId });


  // 🧪 ADD THIS DEBUG
  console.log('🧪 POND WRAPPER PROPS DEBUG:');
  console.log('🧪 onComplete received by wrapper:', !!onComplete);
  console.log('🧪 onComplete type:', typeof onComplete);
  console.log('🧪 onComplete function:', onComplete);


  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          lotusStates: [0, 0, 0],
          goldenLotusVisible: false,
          goldenLotusBloom: false,
          elephantVisible: false,
          elephantTransformed: false,
          trunkActive: false,
          waterDrops: [],
          celebrationStars: 0,
          phase: 'initial',
          currentFocus: 'lotus',
discoveredSymbols: {
    mooshika: true,    // From previous scene
    modak: true,       // From previous scene  
    belly: true,       // From previous scene
    // lotus and trunk will be added during gameplay
  },          // Message flags to prevent duplicates
          welcomeShown: false,
          lotusWisdomShown: false,
          elephantWisdomShown: false,
          masteryShown: false,
          readyForWisdom: false,
                   // FIXED RELOAD SYSTEM - Better state tracking
          currentPopup: null,  // 'lotus_info', 'lotus_card', 'elephant_info', 'trunk_card', 'final_fireworks'
            showingCompletionScreen: false,  // ← ADD THIS LINE
  playAgainRequested: false,  // ← ADD THIS LINE
  fireworksCompleted: false,        // 🆕 NEW: Track fireworks completion
fireworksStartTime: 0,            // 🆕 NEW: Track when fireworks started
completionScreenShown: false,    // 🆕 NEW: Track if completion screen was shown


           // Symbol discovery state tracking
          symbolDiscoveryState: null,  // 'lotus_discovering', 'trunk_discovering'
          sidebarHighlightState: null,  // 'lotus_highlighting', 'trunk_highlighting'

           // ✨ NEW: Add these lines for animated text (ONLY 2)
  showLotusText: false,
  showTrunkText: false,
         
          // GameCoach reload tracking
          gameCoachState: null,  // 'lotus_wisdom', 'elephant_wisdom', 'mastery_wisdom'
          isReloadingGameCoach: false,
          lastGameCoachTime: 0,  // Timestamp tracking for duplicates
                    // Progress tracking for GameWelcomeScreen
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
          <PondSceneContent
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


const PondSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('PondSceneContent render', { sceneState, isReload, zoneId, sceneId });


  // 🧪 ADD THIS DEBUG
  console.log('🧪 POND CONTENT PROPS DEBUG:');
  console.log('🧪 onComplete received by content:', !!onComplete);
  console.log('🧪 onComplete type:', typeof onComplete);


  if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });


  // Access GameCoach functionality
const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();


  const [showSparkle, setShowSparkle] = useState(null);
  const [activePopup, setActivePopup] = useState(-1);
  const [popupAnimation, setPopupAnimation] = useState('');
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
 
  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);


  // Water drop management
  const activeDropsRef = useRef(new Set());
  const MAX_WATER_DROPS = 15;


  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);


  // Add this ref at the top with your other refs
  const previousVisibilityRef = useRef(false);
// ✅ ADD: Get profile name for scene messages
const activeProfile = GameStateManager.getActiveProfile();
const profileName = activeProfile?.name || 'little explorer';

  // DISNEY-STYLE GAMECOACH MESSAGES - UPDATED with reload prevention
  const gameCoachStoryMessages = [
    {
      id: 'welcome',
    message: `Welcome to Ganesha's magical world, ${profileName}! You're about to discover ancient secrets!`,
      timing: 500,
      condition: () => sceneState?.phase === PHASES.INITIAL && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    /*{
      id: 'lotus_wisdom',
    message: `Wonderful, ${profileName}! Like the lotus, you're growing wiser! Ganesha would be proud!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.lotus && !sceneState?.lotusWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'elephant_wisdom',
    message: `Amazing work, ${profileName}! You've learned about Ganesha's strength and kindness!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.trunk && !sceneState?.elephantWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    /*{
      id: 'mastery_wisdom',
      message: "You've become a keeper of Ganesha's wisdom! Ready for your next adventure?",
      timing: 1000,
      condition: () => sceneState?.phase === PHASES.COMPLETE && !sceneState?.masteryShown && !sceneState?.isReloadingGameCoach
    }*/
  ];


  const getHintConfigs = () => [
    {
      id: 'lotus-hint',
      message: 'Try clicking on the lotus flowers!',
      explicitMessage: 'Click on all three lotus flowers to make them bloom!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const lotusStates = sceneState.lotusStates || [0, 0, 0];
        return !lotusStates.every(state => state === 1) &&
               !showMagicalCard &&
               !isVisible &&
               !showPopupBook;
      }
    },
    {
      id: 'golden-hint',
      message: 'The golden lotus holds a secret!',
      explicitMessage: 'Click on the golden lotus to discover its power!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.goldenLotusVisible &&
              !sceneState.goldenLotusBloom &&
              !sceneState.elephantVisible &&
              !showMagicalCard &&
              !isVisible &&
              !showPopupBook;
      }
    },
    {
      id: 'elephant-hint',
      message: 'The elephant wants to show you something!',
      explicitMessage: 'Click on the elephant to see what it can do!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.elephantVisible &&
              !sceneState.elephantTransformed &&
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
      activeDropsRef.current.clear();
    };
  }, []);

  // ✅ ADD THIS: Simple cleanup on scene entry
useEffect(() => {
  console.log('🧹 MODAK: Cleaning GameCoach on scene entry');
  
  if (hideCoach) {
    hideCoach();
  }
  if (clearManualCloseTracking) {
    clearManualCloseTracking();
  }
  
}, []);


  // Watch for GameCoach visibility changes to trigger pending actions - PRESERVED ORIGINAL
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
     
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'show-golden-lotus':
            console.log('🌟 Showing golden lotus after GameCoach wisdom');
            setShowSparkle('all-lotuses');
           
            safeSetTimeout(() => {
              sceneActions.updateState({
                goldenLotusVisible: true,
                phase: PHASES.GOLDEN_VISIBLE,
                currentFocus: 'golden',
                gameCoachState: null,  // Clear GameCoach state after action
                isReloadingGameCoach: false
              });
             
              setShowSparkle('golden-lotus');
              safeSetTimeout(() => setShowSparkle(null), 2000);
            }, 1000);
            break;
           
          case 'bloom-golden-lotus':
            console.log('🌸 Blooming golden lotus after GameCoach wisdom');
            setShowSparkle('golden-lotus-bloom');
           
            safeSetTimeout(() => {
              sceneActions.updateState({
                goldenLotusBloom: true,
                phase: PHASES.GOLDEN_BLOOM,
                gameCoachState: null,  // Clear GameCoach state after action
                isReloadingGameCoach: false
              });
              setShowSparkle(null);
             
              safeSetTimeout(() => {
                showSymbolCelebration('golden');
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


  // Discover symbol function
  const discoverSymbol = (symbolId) => {
    if (!sceneState || !sceneActions) return;
   
    const newSymbols = {
      ...(sceneState.discoveredSymbols || {}),
      [symbolId]: true
    };
   
    const discoveredCount = Object.keys(newSymbols).length;
    const totalSymbols = 3;
    const percentage = Math.round((discoveredCount / totalSymbols) * 100);
   
    sceneActions.updateState({
      discoveredSymbols: newSymbols,
      progress: {
        ...sceneState.progress,
        percentage: percentage,
        starsEarned: discoveredCount * 2
      }
    });
  };


  // FIXED GAMECOACH LOGIC - Better duplicate prevention with timestamps
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


    // ADD THIS DEBUG CODE HERE:
console.log('🔍 GameCoach Debug:', {
  phase: sceneState?.phase,
  lotusDiscovered: sceneState?.discoveredSymbols?.lotus,
  lotusWisdomShown: sceneState?.lotusWisdomShown,
  readyForWisdom: sceneState?.readyForWisdom,
  isReloadingGameCoach: sceneState?.isReloadingGameCoach,
  gameCoachState: sceneState?.gameCoachState
});


      const isReloadRecovery = sceneState.isReloadingGameCoach;




    // IMPROVED: Block if GameCoach message was recently shown (timestamp-based)
    const recentlyFinishedGameCoach =
      (sceneState.lotusWisdomShown && sceneState.readyForWisdom === false &&
       !sceneState.gameCoachState && Date.now() - (sceneState.lastGameCoachTime || 0) < 8000) ||
      (sceneState.elephantWisdomShown && sceneState.readyForWisdom === false &&
       !sceneState.gameCoachState && Date.now() - (sceneState.lastGameCoachTime || 0) < 8000);


    if (recentlyFinishedGameCoach) {
      console.log('🚫 GameCoach: Recently finished message, preventing duplicate');
      return;
    }
   
    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
   
    if (matchingMessage) {
      // Check if this specific message was already shown in this session
     // Check if this specific message was already shown
const messageAlreadyShown =
  (matchingMessage.id === 'lotus_wisdom' && sceneState.lotusWisdomShown && !isReloadRecovery) ||
  (matchingMessage.id === 'elephant_wisdom' && sceneState.elephantWisdomShown && !isReloadRecovery) ||
  (matchingMessage.id === 'mastery_wisdom' && sceneState.masteryShown && !isReloadRecovery) ||
  (matchingMessage.id === 'welcome' && sceneState.welcomeShown);
     
      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }
     
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing ${matchingMessage.id} message (normal flow)`);
       
        const timer = setTimeout(() => {
  console.log(`🎭 GameCoach: Showing divine light first, then ${matchingMessage.id} message`);
  
  // ✨ Show divine light effect first
  setShowSparkle('divine-light');
  
  // Then show GameCoach message after divine light
  setTimeout(() => {
    setShowSparkle(null);
    
    showMessage(matchingMessage.message, {
      duration: 8000,
      animation: 'bounce',
      position: 'top-right',
      source: 'scene',
      messageType: getMessageType(matchingMessage.id)
    });
  }, 2000); // 2 seconds for divine light
        });
       
        // Mark message as shown and set GameCoach state for reload tracking
        switch (matchingMessage.id) {
          case 'welcome':
            sceneActions.updateState({
              welcomeShown: true
            });
            break;
          case 'lotus_wisdom':
            sceneActions.updateState({
              lotusWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'lotus_wisdom',
              lastGameCoachTime: Date.now()  // Add timestamp
            });
            setPendingAction('show-golden-lotus');
            break;
          case 'elephant_wisdom':
            sceneActions.updateState({
              elephantWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'elephant_wisdom',
              lastGameCoachTime: Date.now()  // Add timestamp
            });
            setPendingAction('bloom-golden-lotus');
            break;
          case 'mastery_wisdom':
            sceneActions.updateState({
              masteryShown: true,
              gameCoachState: 'mastery_wisdom',
              lastGameCoachTime: Date.now()  // Add timestamp
            });
            break;
        }
      }, matchingMessage.timing);
     
      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase,
    sceneState?.discoveredSymbols,
    sceneState?.welcomeShown,
    sceneState?.lotusWisdomShown,
    sceneState?.elephantWisdomShown,
    sceneState?.masteryShown,
    sceneState?.readyForWisdom,
    //sceneState?.isReloadingGameCoach,
    sceneState?.gameCoachState,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    //isReload,
    showMessage
  ]);

  // Helper function to get message colors
const getMessageType = (messageId) => {
  switch(messageId) {
    case 'welcome': return 'welcome';        // Coral Pink
    case 'lotus_wisdom': return 'wisdom1';   // Teal  
    case 'elephant_wisdom': return 'wisdom2'; // Peach
    case 'mastery_wisdom': return 'wisdom3';  // Soft Violet
    default: return 'welcome';
  }
};

  // Water Drop Creation
  const createWaterDrop = () => {
    if (!sceneActions || !sceneState) return;
   
    if (activeDropsRef.current.size >= MAX_WATER_DROPS) {
      return;
    }
   
    const id = Date.now() + Math.random();
    activeDropsRef.current.add(id);
   
    const size = Math.floor(Math.random() * 4) + 2;
    const speedFactor = Math.random() * 0.4 + 0.8;
   
    const trunkRight = 25;
    const trunkBottom = 52;
    const deltaX = (trunkRight + 35);
    const deltaY = (trunkBottom - 55);
   
    const spreadX = Math.random() * 8 - 4;
    const spreadY = Math.random() * 6 - 3;
    const arcHeight = Math.random() * 12 + 8;
   
    const newDrop = {
      id,
      size,
      speedFactor,
      startRight: trunkRight + spreadX,
      startBottom: trunkBottom + spreadY,
      deltaX: deltaX + spreadX,
      deltaY: deltaY + spreadY,
      arcHeight: arcHeight,
      duration: speedFactor * 1.5,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.3 + 0.7
    };
   
    const currentDrops = [...(sceneState.waterDrops || [])];
    sceneActions.updateState({ waterDrops: [...currentDrops, newDrop] });
   
    safeSetTimeout(() => {
      activeDropsRef.current.delete(id);
      sceneActions.updateState({
        waterDrops: (sceneState.waterDrops || []).filter(drop => drop.id !== id)
      });
    }, newDrop.duration * 1000 + 500);
  };




 
  // Show lotus info after all bloom
  useEffect(() => {
    if (!sceneState || !sceneActions) return;
   
    if ((sceneState.phase === PHASES.ALL_BLOOMED ||
         sceneState.lotusStates?.every(state => state === 1)) &&
        sceneState.currentPopup !== 'lotus_info' &&
        !sceneState.discoveredSymbols?.lotus &&
        !sceneState.symbolDiscoveryState) {
     
      console.log('🌸 Starting lotus discovery sequence');
     
      console.log('🌸 Starting lotus discovery - STREAMLINED');
completeSymbolLearning('lotus', { name: 'Sacred Lotus' });
    }
  }, [sceneState?.phase, sceneState?.lotusStates, sceneActions]);


  // ✅ ADD this useEffect in both scenes (after existing useEffects):


/*useEffect(() => {
  // Auto-reset completed scenes for fresh start
  if (sceneState?.completed && !isReload) {
    console.log('🔄 AUTO-RESET: Scene was completed, starting fresh');
   
    // Call the same reset function as "Start Fresh" button
    resetSceneForNewPlaythrough();
  }
}, [sceneState?.completed, isReload]);*/


  // COMPLETELY REWRITTEN RELOAD LOGIC - Handles all cases properly
  // REORDER THE RELOAD LOGIC - Put completion screen check FIRST

useEffect(() => {
  if (!isReload || !sceneState) return;
 
  console.log('🔄 RELOAD: Starting reload sequence', {
    currentPopup: sceneState.currentPopup,
    showingCompletionScreen: sceneState.showingCompletionScreen,
    completed: sceneState.completed,
    phase: sceneState.phase
  });

  // ✅ ENHANCED: Check for Play Again flag first
  const profileId = localStorage.getItem('activeProfileId');
  const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const flagValue = localStorage.getItem(playAgainKey);
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  const isFreshRestartAfterPlayAgain = (
    playAgainRequested === 'true' ||
    (sceneState.phase === 'initial' && 
     sceneState.completed === false && 
     sceneState.stars === 0 && 
     (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen))
  );
  
  if (isFreshRestartAfterPlayAgain) {
    console.log('🔄 RELOAD: Detected fresh restart after Play Again - clearing completion state');
    
    if (playAgainRequested === 'true') {
      localStorage.removeItem(playAgainKey);
      console.log('✅ CLEARED: Play Again storage flag');
    }
    
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      showingCompletionScreen: false,
      currentPopup: null,
      completed: false,
      phase: 'initial'
    });
    return;
  }

  // IMMEDIATELY block GameCoach normal flow
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
        const symbolType = sceneState.sidebarHighlightState === 'lotus_highlighting' ? 'lotus' : 'trunk';
        console.log(`🌟 Resuming ${symbolType} celebration after sidebar highlight`);
        showSymbolCelebration(symbolType);
      }, 1000);
     
      sceneActions.updateState({ isReloadingGameCoach: false });
      return;
    }

    // 🔥 PRIORITY 3: Handle explicit popup states
    else if (sceneState.currentPopup) {
      console.log('🔄 Resuming popup:', sceneState.currentPopup);
     
      switch(sceneState.currentPopup) {
        /*case 'lotus_info':
          setPopupBookContent({
            title: "The Sacred Lotus",
            symbolImage: popup1,
            description: "The lotus represents purity and spiritual awakening in Ganesha's story. Just like the lotus grows from muddy water yet remains pure, we can rise above challenges!"
          });
          setCurrentSourceElement('lotus-1');
          setShowPopupBook(true);
          break;
         
        case 'lotus_card':
          setCardContent({
            title: "You've discovered the Lotus Symbol!",
            image: popup1,
            stars: 3
          });
          setShowMagicalCard(true);
// ✅ ADD THIS BLOCK - Clear blocking flags
  setTimeout(() => {
    console.log('🎉 RELOAD: Clearing lotus celebration card reload flags');
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      symbolDiscoveryState: null,
      sidebarHighlightState: null
    });
  }, 500);
  break;

        case 'elephant_info':
          setPopupBookContent({
            title: "The Sacred Elephant",
            symbolImage: popupTrunk,
            description: "The elephant represents Lord Ganesha, the remover of obstacles. The trunk blessing shows Ganesha's power to purify and bless the sacred lotus!"
          });
          setCurrentSourceElement('lotus-1');
          setShowPopupBook(true);
          break;
         
        case 'trunk_card':
          setCardContent({
            title: "You've discovered the Trunk Symbol!",
            image: popupTrunk,
            stars: 2
          });
          setShowMagicalCard(true);
 // ✅ ADD THIS BLOCK - Clear blocking flags  
  setTimeout(() => {
    console.log('🎉 RELOAD: Clearing trunk celebration card reload flags');
    sceneActions.updateState({ 
      isReloadingGameCoach: false,
      symbolDiscoveryState: null,
      sidebarHighlightState: null
    });
  }, 500);
  break;*/
  
       case 'final_fireworks':
  // ✅ CHECK: Is this a Play Again reset using storage?
  const profileId = localStorage.getItem('activeProfileId');
  const playAgainKey = `play_again_${profileId}_symbol-mountain_pond`;
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  if (playAgainRequested === 'true') {
    console.log('🚫 FIREWORKS BLOCKED: Play Again was clicked (from storage)');
    
    // Clear the flag
    localStorage.removeItem(playAgainKey);
    
    sceneActions.updateState({
      currentPopup: null,
      showingCompletionScreen: false,
      completed: false,
      phase: 'initial',
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
    phase: PHASES.COMPLETE,
    stars: 5,
    completed: true,
    progress: {
      percentage: 100,
      starsEarned: 5,
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
  const playAgainKey = `play_again_${profileId}_symbol-mountain_pond`;
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  if (playAgainRequested === 'true') {
    console.log('🚫 COMPLETION BLOCKED: Play Again was clicked');
    
    // Clear the flag
    localStorage.removeItem(playAgainKey);
    
    sceneActions.updateState({
      currentPopup: null,
      showingCompletionScreen: false,
      completed: false,
      phase: 'initial',
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
        case 'lotus_wisdom':
          console.log('🌸 Setting up lotus wisdom resume');
          sceneActions.updateState({
            readyForWisdom: true,
            lotusWisdomShown: false,
            isReloadingGameCoach: false
          });
          setPendingAction('show-golden-lotus');
          break;
         
        case 'elephant_wisdom':
          console.log('🐘 Setting up elephant wisdom resume');
          sceneActions.updateState({
            readyForWisdom: true,
            elephantWisdomShown: false,
            isReloadingGameCoach: false
          });
          setPendingAction('bloom-golden-lotus');
          break;
         
        case 'mastery_wisdom':
          console.log('🏆 Setting up mastery wisdom resume');
          sceneActions.updateState({
            masteryShown: false,
            isReloadingGameCoach: false
          });
          break;
      }
    }
   
        // 🔥 PRIORITY 5: Handle mid-game states that need special attention

    else {
      console.log('🔄 No special reload needed, clearing flags');
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
    }
   
  }, 500);
 
}, [isReload]);


  // Lotus Click Handler
  const handleLotusClick = (index) => {
    if (!sceneState || !sceneActions) return;
   
    console.log(`Lotus ${index} clicked`);
    hideActiveHints();
    hideCoach();


    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }
   
    const lotusStates = [...(sceneState.lotusStates || [0, 0, 0])];
   
    if (lotusStates[index] === 1) {
      console.log(`Lotus ${index} already bloomed - showing sparkle`);
      setShowSparkle(`lotus-${index}`);
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }
   
    lotusStates[index] = 1;
   
    setShowSparkle(`lotus-${index}`);
    setTimeout(() => setShowSparkle(null), 1500);
   
    const bloomedCount = lotusStates.filter(s => s === 1).length;
   
    if (bloomedCount === 3) {
      console.log('All lotuses bloomed');
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.ALL_BLOOMED,
        currentFocus: 'waiting-for-golden',
        progress: {
          ...sceneState.progress,
          percentage: 30,
          starsEarned: 1
        }
      });
    } else {
      console.log(`${bloomedCount} lotuses bloomed`);
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: {
          ...sceneState.progress,
          percentage: 10 * bloomedCount
        }
      });
    }
  };


  const handleGoldenLotusClick = () => {
  if (!sceneState || !sceneActions) return;
  
  console.log('Golden lotus clicked');
  hideActiveHints();
  
  if (sceneState.goldenLotusBloom) {
    console.log('Golden lotus already bloomed - showing sparkle');
    setShowSparkle('golden-lotus-bloom');
    setTimeout(() => setShowSparkle(null), 1500);
    return;
  }
  
  if (sceneState.elephantVisible) {
    console.log('Elephant already appeared - just sparkle');
    setShowSparkle('golden-lotus-clicked');
    setTimeout(() => setShowSparkle(null), 1500);
    return;
  }
  
  setShowSparkle('golden-lotus-clicked');
  
  // ✅ STREAMLINED: Skip popup, go directly to elephant appearance
  safeSetTimeout(() => {
    setShowSparkle(null);
    
    sceneActions.updateState({
      elephantVisible: true,
      phase: PHASES.ELEPHANT_VISIBLE,
      currentFocus: 'elephant'
    });
    
    setShowSparkle('elephant-appear');
    safeSetTimeout(() => setShowSparkle(null), 1500);
  }, 500);
};


  // Elephant Click Handler
  const handleElephantClick = () => {
    if (!sceneState || !sceneActions || sceneState.elephantTransformed) return;
   
    hideActiveHints();
    setShowSparkle('elephant');
   
    const elephant = document.getElementById('elephant-container');
    if (elephant) {
      elephant.classList.add('elephant-slide-in');
     
      safeSetTimeout(() => {
        elephant.style.right = '4%';
        elephant.classList.add('elephant-position-locked');
       
        sceneActions.updateState({
          elephantTransformed: true,
          trunkActive: true,
          phase: PHASES.ELEPHANT_TRANSFORMED
        });
       
        let dropCount = 0;
        const maxDrops = 15;
       
        createWaterDrop();
        dropCount++;
       
        const waterInterval = setInterval(() => {
          if (dropCount >= maxDrops) {
            clearInterval(waterInterval);
           
            safeSetTimeout(() => {
      // STREAMLINED: Direct to trunk learning
sceneActions.updateState({ trunkActive: false });
setShowSparkle(null);
completeSymbolLearning('trunk', { name: 'Helpful Hand' });
            }, 1000);
            return;
          }
         
          createWaterDrop();
          dropCount++;
        }, 150);
       
        timeoutsRef.current.push(waterInterval);
      }, 1000);
    }
  };


  // SYMBOL CELEBRATION FUNCTION - No longer marks symbols as discovered
  /*const showSymbolCelebration = (symbol) => {
    let title = "";
    let image = null;
    let stars = 0;
   
    console.log(`🎉 Showing celebration for: ${symbol}`);
   
    // Check if this is a reload scenario - don't duplicate celebrations
    if (sceneState?.isReloadingGameCoach) {
      console.log('🚫 Skipping celebration during reload');
      return;
    }
   
    switch(symbol) {
      case 'lotus':
  title = `You've discovered the Lotus Symbol, ${profileName}!`;
        image = popup1;
        stars = 3;
       
        // Clear discovery state but DON'T mark symbol again (already done by sidebar flow)
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,  // Clear sidebar highlight state
          currentPopup: 'lotus_card'
        });
       
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;


      case 'trunk':
  title = `You've discovered the Trunk Symbol, ${profileName}!`;
        image = popupTrunk;
        stars = 2;
       
        // Clear discovery state but DON'T mark symbol again (already done by sidebar flow)
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,  // Clear sidebar highlight state
          currentPopup: 'trunk_card'
        });
       
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;


      case 'golden':
        console.log('Golden lotus discovered - no card celebration');
        sceneActions.updateState({
          discoveredSymbols: {
            ...sceneState.discoveredSymbols,
            golden: true
          }
        });
       
        safeSetTimeout(() => {
          showSymbolCelebration('final');
        }, 800);
        return;

case 'final':
  console.log('Final mastery achieved - showing fireworks celebration');

  // ✅ ADD THESE LINES - Clear ALL UI states before fireworks
  setShowMagicalCard(false);  // ← This stops the confetti!
  setShowPopupBook(false);
  setShowSparkle(null);
  setCardContent({});
  setPopupBookContent({});

   // ✅ ADD THIS DEBUG:
  console.log('🧪 COMPLETION TRIGGER:', {
    source: 'fireworks',
    timestamp: Date.now(),
    sceneState: sceneState.phase
  });
 
  // ✅ NEW: DON'T save permanent completion yet - just mark completion screen showing
  sceneActions.updateState({
    showingCompletionScreen: true,  // ← NEW: Flag for ZoneWelcome detection
    currentPopup: 'final_fireworks',
    phase: PHASES.COMPLETE,
    stars: 5,
    completed: true,  // ← This stays in temp session only
    progress: {
      percentage: 100,
      starsEarned: 5,
      completed: true
    }
  });
 
  setShowSparkle('final-fireworks');
 

  return;


      default:
        title = "Congratulations on your discovery!";
        stars = 1;
    }
  };*/


  // CLOSE CARD HANDLER - Symbols already discovered, just continue flow
  /*const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });
   
    if (cardContent.title?.includes("Lotus Symbol")) {
      console.log('🌸 Lotus card closed - continuing progression');
     
      // Symbol was already marked as discovered by sidebar flow
      // Just trigger GameCoach wisdom
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'lotus_wisdom'
        });
        setPendingAction('show-golden-lotus');
      }, 500);
    }
   
    else if (cardContent.title?.includes("Trunk Symbol")) {
      console.log('🐘 Trunk card closed - continuing progression');
     
      // Symbol was already marked as discovered by sidebar flow
      // Just trigger GameCoach wisdom
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'elephant_wisdom'
        });
        setPendingAction('bloom-golden-lotus');
      }, 200);
    }
   
    else if (cardContent.title?.includes("Golden Lotus")) {
      setTimeout(() => {
        showSymbolCelebration('final');
      }, 1000);
    }
   
    else if (cardContent.title?.includes("discovered all")) {
      console.log("🏆 Game completed! All symbols discovered!");
     
      sceneActions.updateState({
        phase: PHASES.COMPLETE,
        stars: 5,
        completed: true,
        progress: {
          percentage: 100,
          starsEarned: 5,
          completed: true
        }
      });
     
      if (onComplete) {
        onComplete('pond', {
          stars: 5,
          completed: true,
          totalStars: 5
        });
      }
    }
  };*/


  // SYMBOL INFO CLOSE HANDLER - Proper flow with sidebar highlight
  /*const handleSymbolInfoClose = () => {
    console.log('🔍 Closing SymbolSceneIntegration');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });
   
    // RESTORE THE PROPER FLOW: Info → Sidebar highlight → Celebration
    if (popupBookContent.title?.includes("Sacred Elephant")) {
      console.log('🐘 Elephant info closed - highlighting sidebar first');
     
      // Mark symbol as discovered to trigger sidebar highlight
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          trunk: true
        },
        symbolDiscoveryState: null,  // Clear discovery state
        sidebarHighlightState: 'trunk_highlighting'  // Set highlight state
      });
     
      // THEN after sidebar highlight animation, show celebration
      safeSetTimeout(() => {
        console.log('🎉 Showing trunk celebration after sidebar highlight');
        showSymbolCelebration('trunk');
      }, 1000); // Give time for sidebar animation
     
    } else if (popupBookContent.title?.includes("Sacred Lotus")) {
      console.log('🌸 Lotus info closed - highlighting sidebar first');
     
      // Mark symbol as discovered to trigger sidebar highlight
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          lotus: true
        },
        symbolDiscoveryState: null,  // Clear discovery state
        sidebarHighlightState: 'lotus_highlighting'  // Set highlight state
      });
     
      // THEN after sidebar highlight animation, show celebration
      safeSetTimeout(() => {
        console.log('🎉 Showing lotus celebration after sidebar highlight');
        showSymbolCelebration('lotus');
      }, 1000); // Give time for sidebar animation
    }
  };*/

  const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`🕉 ${symbolKey} symbol learned - STREAMLINED FLOW`);
  
  // Update discovered symbols + show text (ONLY 2 symbols)
  sceneActions.updateState({
    discoveredSymbols: {
      ...sceneState.discoveredSymbols,
      [symbolKey]: true
    },
    showLotusText: symbolKey === 'lotus',
    showTrunkText: symbolKey === 'trunk'
  });
  
  // Show sparkle effect
  setShowSparkle(`${symbolKey}-to-sidebar`);
  
  // Continue game after 2 seconds
  setTimeout(() => {
    console.log(`🎯 ${symbolKey} - hiding text and continuing game`);
    
    // Hide text and sparkle (ONLY 2 symbols)
    setShowSparkle(null);
    sceneActions.updateState({
      showLotusText: false,
      showTrunkText: false
    });
    
    // Continue game flow
    if (symbolKey === 'lotus') {
      console.log('🌟 SHOWING GOLDEN LOTUS!');
      setShowSparkle('all-lotuses');
      
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          phase: PHASES.GOLDEN_VISIBLE,
          currentFocus: 'golden'
        });
        setShowSparkle('golden-lotus');
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1000);
    } else if (symbolKey === 'trunk') {
      console.log('🌸 BLOOMING GOLDEN LOTUS!');
      setShowSparkle('golden-lotus-bloom');
      
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusBloom: true,
          phase: PHASES.GOLDEN_BLOOM
        });
        setShowSparkle(null);
        
        setTimeout(() => {
          // Final completion
          setShowSparkle('final-fireworks');
          sceneActions.updateState({
            phase: PHASES.COMPLETE,
            stars: 5,
            completed: true,
            currentPopup: 'final_fireworks',
            progress: {
              percentage: 100,
              starsEarned: 5,
              completed: true
            }
          });
        }, 800);
      }, 500);
    }
  }, 2000);
};


  // Hint interaction handlers
  const handleHintShown = (level) => {
    console.log(`Hint level ${level} shown`);
    setHintUsed(true);
  };


  const handleHintButtonClick = () => {
    console.log("Hint button clicked");
    console.log("Current hint configs:", getHintConfigs());
    console.log("Scene state for hints:", {
      currentFocus: sceneState?.currentFocus,
      lotusStates: sceneState?.lotusStates,
      goldenLotusVisible: sceneState?.goldenLotusVisible,
      elephantVisible: sceneState?.elephantVisible
    });
  };


  // Render helpers
  const getLotusImage = (index) => {
    const lotusStates = sceneState?.lotusStates || [0, 0, 0];
    return lotusStates[index] === 0 ? lotusClosed : lotusBloomed;
  };


  const getPopupImage = () => {
    switch (activePopup) {
      case 3: return popupGolden;
      default: return null;
    }
  };


  const renderAnimatedPopup = () => {
    if (activePopup === -1) return null;
   
    return (
      <div className="popup-overlay">
        <div className={`popup-container ${popupAnimation}`}>
          <img
            src={getPopupImage()}
            className="popup-image"
            alt="Popup"
          />
          <button
            className="close-button"
            onClick={handleClosePopup}
          >
            Close
          </button>
        </div>
      </div>
    );
  };


  const renderCounter = () => {
    const lotusStates = sceneState?.lotusStates || [0, 0, 0];
    const bloomCount = lotusStates.filter(state => state === 1).length;
   
    return (
      <div className="lotus-counter">
        <div className="counter-icon">
          <img src={bloomCount > 0 ? lotusBloomed : lotusClosed} alt="Lotus" />
        </div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{width: `${(bloomCount / 3) * 100}%`}}
          />
        </div>
        <div className="counter-display">{bloomCount}/3</div>
      </div>
    );
  };


  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }
 
  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container">
          <div className="pond-background" style={{ backgroundImage: `url(${pondBackground})` }}>
            {renderCounter()}
           
            {/* Lotus flowers */}
            {[0, 1, 2].map((index) => (
              <div key={index} className={`lotus lotus-${index + 1}`}>
                <ClickableElement
                  id={`lotus-${index}`}
                  onClick={() => handleLotusClick(index)}
                  completed={(sceneState.lotusStates || [])[index] === 1}
                  zone="pond-zone"
                  data-element={`lotus-${index + 1}`}
                >
                  <img
                    src={getLotusImage(index)}
                    alt={`Lotus ${index + 1}`}
                    style={{ width: '100%', height: '100%' }}
                  />
                </ClickableElement>
                {showSparkle === `lotus-${index}` && (
                  <SparkleAnimation
                    type="star"
                    count={15}
                    color="#ff9ebd"
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            ))}
           
            {/* All lotuses sparkle */}
            {showSparkle === 'all-lotuses' && (
              <div className="all-lotuses-sparkle">
                <SparkleAnimation
                  type="magic"
                  count={20}
                  color="lightblue"
                  size={10}
                  duration={1500}
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
  color="#FFD700" 
  size={3}        // ← Tiny glitter
  duration={2000}
  fadeOut={true}
  area="full"
/>
  </div>
)}
           
            {/* Golden lotus */}
            {sceneState.goldenLotusVisible && (
              <div className={`golden-lotus-container ${sceneState.goldenLotusBloom ? 'blooming' : ''}`}>
                <ClickableElement
                  id="golden-lotus"
                  onClick={handleGoldenLotusClick}
                  completed={sceneState.goldenLotusBloom}
                  zone="golden-zone"
                >
                  <img
                    src={sceneState.goldenLotusBloom ? goldenLotusBloomed : goldenLotusClosed}
                    alt="Golden Lotus"
                    style={{ width: '100%', height: '100%' }}
                  />
                </ClickableElement>
                {(showSparkle === 'golden-lotus' ||
                  showSparkle === 'golden-lotus-clicked' ||
                  showSparkle === 'golden-lotus-bloom') && (
                  <SparkleAnimation
                    type={showSparkle === 'golden-lotus-bloom' ? 'glitter' : 'magic'}
                    count={20}
                    color={showSparkle === 'golden-lotus-bloom' ? 'gold' : 'orange'}
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}


            {/* Elephant with proper ID */}
            {sceneState.elephantVisible && (
              <div
                className={`elephant-partial ${sceneState.elephantTransformed ? 'elephant-position-locked' : ''}`}
                id="elephant-container"
              >
                <ClickableElement
                  id="elephant"
                  onClick={handleElephantClick}
                  completed={sceneState.elephantTransformed}
                  zone="elephant-zone"
                >
                  <img
                    src={sceneState.elephantTransformed ? waterElephant : elephantFull}
                    alt="Elephant"
                    style={{ width: '100%', height: '100%' }}
                  />
                </ClickableElement>
                {(showSparkle === 'elephant' || showSparkle === 'elephant-appear') && (
                  <SparkleAnimation
                    type={showSparkle === 'elephant' ? 'firefly' : 'star'}
                    count={20}
                    color={showSparkle === 'elephant' ? 'lightblue' : '#aaaaaa'}
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}


         


{/* 🧪 POND COMPLETION TEST BUTTON */}
{/* 🗺️ Navigation & Debug Controls */}
<BackToMapButton 
  onNavigate={onNavigate}
  hideCoach={hideCoach}
  clearManualCloseTracking={clearManualCloseTracking}
  position="bottom-left"
/>

{/* 🧪 POND COMPLETION TEST BUTTON - FIXED */}
<div style={{
  position: 'fixed',
  top: '170px',
  left: '200px',
  zIndex: 9999,
  background: 'purple',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🧪 POND COMPLETION TEST CLICKED');
  sceneActions.updateState({
    // All phases complete
    lotusStates: [1, 1, 1],
    goldenLotusVisible: true,
    goldenLotusBloom: true,
    elephantVisible: true,
    elephantTransformed: true,
    trunkActive: false,
    waterDrops: [],
   
    // All symbols discovered
    discoveredSymbols: {
      // Keep previous symbols from initial state
      mooshika: true,
      modak: true,
      belly: true,
      // Add current scene symbols
      lotus: true,
      trunk: true,
      golden: true,
    },
    
    // All messages shown
    welcomeShown: true,
    lotusWisdomShown: true,
    elephantWisdomShown: true,
    masteryShown: false,
   
    // Set to final phase
    phase: PHASES.COMPLETE,
    currentFocus: 'complete',
   
    // COMPLETION DATA
    completed: true,
    stars: 5,
    progress: {
      percentage: 100,
      starsEarned: 5,
      completed: true
    },
   
    // Clear popup states
    currentPopup: null,
    symbolDiscoveryState: null,
    gameCoachState: null,
    isReloadingGameCoach: false
  });
 
  // Clear all UI states
  setShowSparkle(null);
  setShowPopupBook(false);
  setShowMagicalCard(false);
  setShowSceneCompletion(false);
 
  // 🔥 FIXED: Trigger final celebration directly instead of showSymbolCelebration
  setTimeout(() => {
    console.log('🎯 Starting final fireworks celebration');
    
    // Clear all UI states before fireworks
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    // Set completion state with fireworks
    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_fireworks',
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 5,
        completed: true
      }
    });
 
    setShowSparkle('final-fireworks');
  }, 1000);
}}>
  COMPLETE
</div>


{/* 🆘 EMERGENCY: Start Fresh Button 
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
    console.log('🔄 POND EMERGENCY RESTART: User chose to start fresh');
   
    // 1. FIRST: Clear all UI states immediately
    setShowSparkle(null);
    setShowPopupBook(false);
    setShowMagicalCard(false);
    setShowSceneCompletion(false);
    setActivePopup(-1);
    setPopupAnimation('');
    setCurrentSourceElement(null);
    setPopupBookContent({});
    setCardContent({});
    setPendingAction(null);
   
    // 2. THEN: Reset scene state after UI cleared
    setTimeout(() => {
      sceneActions.updateState({
        lotusStates: [0, 0, 0],
        goldenLotusVisible: false,
        goldenLotusBloom: false,
        elephantVisible: false,
        elephantTransformed: false,
        trunkActive: false,
        waterDrops: [],
        celebrationStars: 0,
        phase: 'initial',
        currentFocus: 'lotus',
        discoveredSymbols: {},
       
        // Clear all message flags
        welcomeShown: false,
        lotusWisdomShown: false,
        elephantWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,


        welcomeShown: false,           // ← ENSURE THIS IS FALSE
    isReloadingGameCoach: false,   // ← ENSURE THIS IS FALSE
    gameCoachState: null,          // ← CLEAR ANY COACH STATE
   
       
        // Clear all popup states
        currentPopup: null,
        symbolDiscoveryState: null,
        sidebarHighlightState: null,
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
   
    // 3. FINALLY: Hide GameCoach if active
    if (hideCoach) {
      hideCoach();
    }
  }
}}>
  🔄 Start Fresh
</div>*/}


           
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
           
            {/* Trunk/Water Spray Element */}
            {sceneState.trunkActive && (
              <div className="trunk" style={{ position: 'absolute', right: '20%', bottom: '30%' }}>
                💦
              </div>
            )}
           
            {/* Water Drops */}
            {(sceneState.waterDrops || []).map(drop => (
              <div
                key={drop.id}
                className="water-drop enhanced-arc"
                style={{
                  fontSize: `${drop.size * 1.5 + 2}vh`,
                  right: `${drop.startRight}%`,
                  bottom: `${drop.startBottom}%`,
                  transform: `rotate(${drop.rotation}deg)`,
                  opacity: drop.opacity,
                  '--delta-x': `${drop.deltaX}vw`,
                  '--delta-y': `${drop.deltaY}vh`,
                  '--arc-height': `${drop.arcHeight}vh`,
                  '--duration': `${drop.duration}s`,
                  animation: `fixedWaterArc var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  animationFillMode: 'forwards'
                }}
              >
                💧
              </div>
            ))}


          </div>
         
          {/* Popup overlay with animation 
          {renderAnimatedPopup()}

{/* ❌ REMOVE: Symbol Information Popup */}
{/*
<SymbolSceneIntegration
  show={showPopupBook}
  symbolImage={popupBookContent.symbolImage}
  title={popupBookContent.title}
  description={popupBookContent.description}
  sourceElement={currentSourceElement}
  onClose={handleSymbolInfoClose}
/>
*/}

{/* ❌ REMOVE: Symbol Celebration Cards */}
{/*
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
*/}


          {/* Real Confetti Effect - Falling from Top */}
          {showMagicalCard && (cardContent.title?.includes("Lotus Symbol") || cardContent.title?.includes("Trunk Symbol")) && (
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

          {/* ✨ NEW: Symbol Learning Sparkle Effects */}
{showSparkle === 'lotus-to-sidebar' && (
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
      color="#4ECDC4"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{showSparkle === 'trunk-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '60%',
    right: '25%',
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
{sceneState.showLotusText && (
  <div className="lotus-text">
    Sacred Lotus 🌸
  </div>
)}

{sceneState.showTrunkText && (
  <div className="trunk-text">
    Helpful Hand 🤝
  </div>
)}


          {/* Add CSS for confetti animation */}
          <style>{`
            @keyframes confettiFall {
              to {
                transform: translateY(100vh) rotate(720deg);
              }
            }
          `}</style>


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
    console.log(`Great progress, ${name}!`);
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
  onStartFresh={() => { // ← ADD THIS NEW HANDLER
    console.log('🔄 MENU START FRESH: User chose to restart scene');
    
    // Same logic as your existing Start Fresh button
    setShowSparkle(null);
    setShowPopupBook(false);
    setShowMagicalCard(false);
    setShowSceneCompletion(false);
    setActivePopup(-1);
    setPopupAnimation('');
    setCurrentSourceElement(null);
    setPopupBookContent({});
    setCardContent({});
    setPendingAction(null);
    
    setTimeout(() => {
      sceneActions.updateState({
        lotusStates: [0, 0, 0],
        goldenLotusVisible: false,
        goldenLotusBloom: false,
        elephantVisible: false,
        elephantTransformed: false,
        trunkActive: false,
        waterDrops: [],
        celebrationStars: 0,
        phase: 'initial',
        currentFocus: 'lotus',
        discoveredSymbols: {
          mooshika: true,
          modak: true,
          belly: true,
        },
        welcomeShown: false,
        lotusWisdomShown: false,
        elephantWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        currentPopup: null,
        showingCompletionScreen: false,
        symbolDiscoveryState: null,
        sidebarHighlightState: null,
        gameCoachState: null,
        isReloadingGameCoach: false,
        lastGameCoachTime: 0,
        stars: 0,
        completed: false,
        progress: {
          percentage: 0,
          starsEarned: 0,
          completed: false
        },
        showLotusText: false,
        showTrunkText: false,
      });
    }, 100);
    
    if (hideCoach) hideCoach();
    if (clearManualCloseTracking) clearManualCloseTracking();
  }}
  currentProgress={{
    stars: sceneState.celebrationStars || 0,
    completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
    total: 1
  }}
/>


          {/* Symbol Sidebar */}
          <SymbolSidebar
  discoveredSymbols={{
    mooshika: true,    // Always show from start
    modak: true,       // Always show from start
    belly: true,       // Always show from start
    ...(sceneState.discoveredSymbols || {})  // Add new discoveries
  }}
  onSymbolClick={(symbolId) => {
    console.log(`Sidebar symbol clicked: ${symbolId}`);
  }}
/>
           


       {showSparkle === 'final-fireworks' && (
  <Fireworks
    show={true}
    duration={4000}
    count={15}
    colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
 onComplete={() => {
  console.log('🎯 Fireworks complete - cleaning all effects');
  
  // ✅ IMMEDIATE: Stop ALL sparkle effects
  setShowSparkle(null);
  
  // ✅ FORCE: Clear any lingering animations
  const sparkleElements = document.querySelectorAll('[class*="sparkle"], [class*="glitter"]');
  sparkleElements.forEach(el => el.remove());
  
  // ✅ COMPLETION SAVE
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 5,
      symbols: { lotus: true, trunk: true, golden: true },
      phase: 'complete',
      timestamp: Date.now()
    });
   
    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_pond`);
    SimpleSceneManager.clearCurrentScene(); // ← ADD THIS LINE
    console.log('✅ POND: Completion saved and temp session cleared');
  }
 
  // ✅ IMMEDIATE: Show completion screen (no delay)
  setShowSceneCompletion(true);
}}
  />
)}

{/* Scene Completion - FIXED: Single state control */}
{showSceneCompletion && (
  <SceneCompletionCelebration
    show={true}  // Always true when rendered
    sceneName="Pond Adventure"
    sceneNumber={2}
    totalScenes={4}
    starsEarned={sceneState.progress?.starsEarned || 5}
    totalStars={5}
    discoveredSymbols={['mooshika', 'modak', 'belly', 'lotus', 'trunk'].filter(symbol =>
      sceneState.discoveredSymbols?.[symbol]
    )}
    symbolImages={{
      mooshika: symbolMooshikaColored,
      modak: symbolModakColored,
      belly: symbolBellyColored,
      lotus: symbolLotusColored,
      trunk: symbolTrunkColored
    }}
    nextSceneName="Temple Discovery"
    sceneId="pond"
    completionData={{
      stars: 5,
      symbols: { lotus: true, trunk: true, golden: true },
      completed: true,
      totalStars: 5
    }}
    onComplete={onComplete}

    onReplay={() => {
      console.log('🚀 INSTANT REPLAY: Immediate scene restart');
      
      // STEP 1: IMMEDIATELY hide completion screen (parent control)
      setShowSceneCompletion(false);
      
      // STEP 2: IMMEDIATELY clear storage flag for App.jsx
      const profileId = localStorage.getItem('activeProfileId');
      const tempKey = `temp_session_${profileId}_symbol-mountain_pond`;
      localStorage.setItem(tempKey, JSON.stringify({ playAgainRequested: true }));
      
      // STEP 3: FORCE clear all visual states
      setShowSparkle(null);
      setShowPopupBook(false);
      setShowMagicalCard(false);
      setActivePopup(-1);
      setPopupAnimation('');
      setCurrentSourceElement(null);
      setPopupBookContent({});
      setCardContent({});
      setPendingAction(null);
      
      // STEP 4: Reset scene to initial state
      sceneActions.updateState({
        lotusStates: [0, 0, 0],
        goldenLotusVisible: false,
        goldenLotusBloom: false,
        elephantVisible: false,
        elephantTransformed: false,
        trunkActive: false,
        waterDrops: [],
        celebrationStars: 0,
        phase: 'initial',
        currentFocus: 'lotus',
        discoveredSymbols: {
          mooshika: true,
          modak: true,
          belly: true,
        },
        welcomeShown: false,
        lotusWisdomShown: false,
        elephantWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        currentPopup: null,
        showingCompletionScreen: false,
        symbolDiscoveryState: null,
        sidebarHighlightState: null,
        gameCoachState: null,
        isReloadingGameCoach: false,
        lastGameCoachTime: 0,
        stars: 0,
        completed: false,
        progress: {
          percentage: 0,
          starsEarned: 0,
          completed: false
        },
        showLotusText: false,
        showTrunkText: false,
      });
      
      // STEP 5: Clean GameCoach
      if (hideCoach) hideCoach();
      if (clearManualCloseTracking) clearManualCloseTracking();
      
      console.log('✅ INSTANT REPLAY: Complete reset applied');
    }}

    onContinue={() => {
      console.log('🔧 POND CONTINUE: Going to next scene + preserving resume');
      
      // 1. Enhanced GameCoach clearing
      if (clearManualCloseTracking) {
        clearManualCloseTracking();
        console.log('✅ POND CONTINUE: GameCoach manual tracking cleared');
      }
      if (hideCoach) {
        hideCoach();
        console.log('✅ POND CONTINUE: GameCoach hidden');
      }
      
      // Enhanced GameCoach timeout
      setTimeout(() => {
        console.log('🎭 POND CONTINUE: Forcing GameCoach fresh start for next scene');
        if (clearManualCloseTracking) {
          clearManualCloseTracking();
          console.log('🎭 POND CONTINUE: GameCoach cleared again after delay');
        }
      }, 500);
      
      // 2. Save completion data
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'pond', {
          completed: true,
          stars: 5,
          symbols: { lotus: true, trunk: true, golden: true }
        });
        
        GameStateManager.saveGameState('symbol-mountain', 'pond', {
          completed: true,
          stars: 5,
          symbols: { lotus: true, trunk: true, golden: true }
        });
        
        console.log('✅ POND CONTINUE: Completion data saved');
      }

      // 3. Set NEXT scene for resume tracking
      setTimeout(() => {
        SimpleSceneManager.setCurrentScene('symbol-mountain', 'temple', false, false);
        console.log('✅ POND CONTINUE: Next scene (temple) set for resume tracking');
        
        onNavigate?.('scene-complete-continue');
      }, 100);
    }}
  />
)}
          {/* Scene Completion - For moving to next scene 
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Pond Adventure"
            sceneNumber={2}
            totalScenes={4}
            starsEarned={sceneState.progress?.starsEarned || 5}
            totalStars={5}
discoveredSymbols={['mooshika', 'modak', 'belly', 'lotus', 'trunk'].filter(symbol =>
    sceneState.discoveredSymbols?.[symbol]
  )}
  symbolImages={{
    mooshika: symbolMooshikaColored,
    modak: symbolModakColored,
    belly: symbolBellyColored,
    lotus: symbolLotusColored,
    trunk: symbolTrunkColored
  }}
            nextSceneName="Temple Discovery"
            sceneId="pond"           // ← ADD THIS LINE
completionData={{        // ← ADD THIS BLOCK
  stars: 5,
  symbols: { lotus: true, trunk: true, golden: true },
  completed: true,
  totalStars: 5
}}
onComplete={onComplete}  // ← ADD THIS LINE


/*onReplay={() => {
  console.log('🔧 NUCLEAR OPTION: Bulletproof Play Again');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    // Clear ALL storage
    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_pond`);
    localStorage.removeItem(`replay_session_${profileId}_symbol-mountain_pond`);
    localStorage.removeItem(`play_again_${profileId}_symbol-mountain_pond`);
    
    SimpleSceneManager.setCurrentScene('symbol-mountain', 'pond', false, false);
    console.log('🗑️ NUCLEAR: All storage cleared');
  }
  
  // Force clean reload
  console.log('🔄 NUCLEAR: Forcing reload in 100ms');
  setTimeout(() => {
    window.location.reload();
  }, 100);
}}

onReplay={() => {
  console.log('🔄 PLAY AGAIN: Setting App.jsx flag + immediate reset');
  
  // ✅ SIGNAL TO APP.JSX: We're doing a play again
  const profileId = localStorage.getItem('activeProfileId');
  const tempKey = `temp_session_${profileId}_symbol-mountain_pond`;
  localStorage.setItem(tempKey, JSON.stringify({ playAgainRequested: true }));
  
  // ✅ IMMEDIATE: Hide completion screen in parent
  setShowSceneCompletion(false);
  
  // ✅ IMMEDIATE: Clear all UI states
  setShowSparkle(null);
  setShowPopupBook(false);
  setShowMagicalCard(false);
  setActivePopup(-1);
  setPopupAnimation('');
  setCurrentSourceElement(null);
  setPopupBookContent({});
  setCardContent({});
  setPendingAction(null);
  
  // ✅ IMMEDIATE: Hide GameCoach
  if (hideCoach) hideCoach();
  if (clearManualCloseTracking) clearManualCloseTracking();
  
  // ✅ IMMEDIATE: Reset scene state (no setTimeout)
  sceneActions.updateState({
    lotusStates: [0, 0, 0],
    goldenLotusVisible: false,
    goldenLotusBloom: false,
    elephantVisible: false,
    elephantTransformed: false,
    trunkActive: false,
    waterDrops: [],
    celebrationStars: 0,
    phase: 'initial',
    currentFocus: 'lotus',
    
    discoveredSymbols: {
      mooshika: true,
      modak: true,
      belly: true,
    },
    
    // Clear ALL completion flags
    welcomeShown: false,
    lotusWisdomShown: false,
    elephantWisdomShown: false,
    masteryShown: false,
    readyForWisdom: false,
    currentPopup: null,
    showingCompletionScreen: false,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    gameCoachState: null,
    isReloadingGameCoach: false,
    lastGameCoachTime: 0,
    
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    
    showLotusText: false,
    showTrunkText: false,
  });
  
  console.log('✅ PLAY AGAIN: Complete reset applied');
}}
 
 
onContinue={() => {
  console.log('🔧 POND CONTINUE: Going to next scene + preserving resume');
  
  // 1. Enhanced GameCoach clearing
  if (clearManualCloseTracking) {
    clearManualCloseTracking();
    console.log('✅ POND CONTINUE: GameCoach manual tracking cleared');
  }
  if (hideCoach) {
    hideCoach();
    console.log('✅ POND CONTINUE: GameCoach hidden');
  }
  
  // Enhanced GameCoach timeout
  setTimeout(() => {
    console.log('🎭 POND CONTINUE: Forcing GameCoach fresh start for next scene');
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
      console.log('🎭 POND CONTINUE: GameCoach cleared again after delay');
    }
  }, 500);
  
  // 2. Save completion data
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'pond', {
      completed: true,
      stars: 5, // ← Change to PondScene stars
      symbols: { lotus: true, trunk: true, golden: true } // ← Change to PondScene symbols
    });
    
    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 5, // ← Change to PondScene stars  
      symbols: { lotus: true, trunk: true, golden: true } // ← Change to PondScene symbols
    });
    
    console.log('✅ POND CONTINUE: Completion data saved');
  }

  // 3. Set NEXT scene for resume tracking
  setTimeout(() => {
    SimpleSceneManager.setCurrentScene('symbol-mountain', 'temple', false, false); // ← Next scene after pond
    console.log('✅ POND CONTINUE: Next scene (temple) set for resume tracking');
    
    onNavigate?.('scene-complete-continue');
  }, 100);
}}
          />

          {/* Cultural Celebration Modal */}
<CulturalCelebrationModal
  show={showCulturalCelebration}
  onClose={() => setShowCulturalCelebration(false)}
  //{...CulturalProgressExtractor.getCulturalProgressData()}
/>


        </div>      
      </MessageManager>
    </InteractionManager>
  );
};


export default PondSceneSimplified