// zones/symbol-mountain/scenes/eye-ear-tusk/EyeEarTuskScene.jsx
// 🎯 Cultural Flow: Eyes → Ear → Tusk (Simplified Template for Testing Ending Reloads)

import React, { useState, useEffect, useRef } from 'react';
import './EyeEarTuskScene.css';

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

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Images - 🎯 UPDATED for EyeEarTuskScene
import forestBackground from './assets/images/forest-background.png';
import hidingSpot from './assets/images/hiding-spot.png';
import eye from './assets/images/eye.png';
import ear from './assets/images/ear.png';
import tusk from './assets/images/tusk.png';
import popupEye from './assets/images/popup-eye-info.png';
import popupEar from './assets/images/popup-ears-info.png';
import popupTusk from './assets/images/popup-tusk-info.png';
import coachImage from "./assets/images/ganesha-coach.png";

// Symbol images for completion
import symbolEyeColored from '../../shared/images/icons/symbol-eyes-new.png';
import symbolEarColored from '../../shared/images/icons/symbol-ears-new.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-new.png';

// 🎯 SIMPLIFIED PHASES - Just 3 discoveries
const PHASES = {
  EYE_SEARCH: 'eye_search',           // Phase 1: Find Eyes
  EYE_FOUND: 'eye_found',             // Phase 2: Eyes discovered
  EAR_SEARCH: 'ear_search',           // Phase 3: Find Ear
  EAR_FOUND: 'ear_found',             // Phase 4: Ear discovered  
  TUSK_SEARCH: 'tusk_search',         // Phase 5: Find Tusk
  TUSK_FOUND: 'tusk_found',           // Phase 6: Tusk discovered
  COMPLETE: 'complete'                // Phase 7: Scene complete
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

const EyeEarTuskScene = ({ 
  onComplete, 
  onNavigate, 
  zoneId = 'symbol-mountain', 
  sceneId = 'eye-ear-tusk' 
}) => {
  console.log('EyeEarTuskScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // 🎯 SIMPLIFIED: Just 3 simple discovery states
          eyeVisible: false,
          eyeFound: false,
          earVisible: false,
          earFound: false,
          tuskVisible: false,
          tuskFound: false,
          
          // Hiding spots for discoveries (simple)
          hidingSpots: [0, 0, 0], // 3 hiding spots
          correctSpot: 1, // Always spot 1 for simplicity
          
          celebrationStars: 0,
          phase: PHASES.EYE_SEARCH,
          currentFocus: 'eyes',
          discoveredSymbols: {},
          
          // Message flags to prevent duplicates
          welcomeShown: false,
          eyeWisdomShown: false,
          earWisdomShown: false,
          tuskWisdomShown: false,
          readyForWisdom: false,
          
          // 🔥 CRITICAL: Enhanced reload system for ending fixes
          currentPopup: null,  // 'eye_info', 'eye_card', 'ear_info', 'ear_card', 'tusk_info', 'tusk_card', 'final_fireworks'
          showingCompletionScreen: false,
          playAgainRequested: false,
          fireworksCompleted: false,        // 🆕 NEW: Track fireworks completion
          fireworksStartTime: 0,            // 🆕 NEW: Track when fireworks started
          completionScreenShown: false,    // 🆕 NEW: Track if completion screen was shown
          
          // Symbol discovery state tracking
          symbolDiscoveryState: null,  // 'eye_discovering', 'ear_discovering', 'tusk_discovering'
          sidebarHighlightState: null, // 'eye_highlighting', 'ear_highlighting', 'tusk_highlighting'
          
          // GameCoach reload tracking
          gameCoachState: null,  // 'eye_wisdom', 'ear_wisdom', 'tusk_wisdom'
          isReloadingGameCoach: false,
          lastGameCoachTime: 0,
          
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
          <EyeEarTuskSceneContent 
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

const EyeEarTuskSceneContent = ({ 
  sceneState, 
  sceneActions, 
  isReload, 
  onComplete, 
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('EyeEarTuskSceneContent render', { sceneState, isReload, zoneId, sceneId });

  // MINIMAL DEBUG - Just log what's happening
  console.log('🧪 EYE-EAR-TUSK RENDER:', { 
    hasSceneState: !!sceneState,
    phase: sceneState?.phase,
    isReload,
    currentPopup: sceneState?.currentPopup,
    showingCompletionScreen: sceneState?.showingCompletionScreen
  });

  // SAFETY CHECK - Prevent crashes if props missing
  if (!sceneState || !sceneActions) {
    console.warn('⚠️ EYE-EAR-TUSK: Missing required props');
    return <div>Loading Eye-Ear-Tusk scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYE_SEARCH });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  
  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);

  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const previousVisibilityRef = useRef(false);

  // ✅ Get profile name for scene messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // 🎯 SIMPLIFIED GAMECOACH MESSAGES
  const gameCoachStoryMessages = [
    {
      id: 'welcome',
      message: `Welcome to Ganesha's sacred temple, ${profileName}! Let's discover his divine features!`,
      timing: 500,
      condition: () => sceneState?.phase === PHASES.EYE_SEARCH && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'eye_wisdom',
      message: `Amazing, ${profileName}! Ganesha's eyes see all - wisdom, truth, and the path ahead!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.eye && !sceneState?.eyeWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'ear_wisdom',
      message: `Wonderful, ${profileName}! Ganesha's ears listen to all prayers and calls for help!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.ear && !sceneState?.earWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'tusk_wisdom',
      message: `Incredible, ${profileName}! Ganesha's tusk removes all obstacles from your path!`,
      timing: 1000,
      condition: () => sceneState?.discoveredSymbols?.tusk && !sceneState?.tuskWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // 🎯 SIMPLIFIED HINT CONFIGS
  const getHintConfigs = () => [
    {
      id: 'eye-hint',
      message: 'Look for Ganesha\'s wise eyes hidden behind the sacred objects!',
      explicitMessage: 'Click on different hiding spots to find where the eyes are hidden!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.phase === PHASES.EYE_SEARCH && 
              !sceneState.eyeFound &&
              !showMagicalCard &&
              !isVisible &&
              !showPopupBook;
      }
    },
    {
      id: 'ear-hint',
      message: 'Find Ganesha\'s listening ear!',
      explicitMessage: 'Click to discover Ganesha\'s divine ear that hears all prayers!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.phase === PHASES.EAR_SEARCH &&
               !sceneState.earFound && 
               !showMagicalCard &&
               !isVisible &&
               !showPopupBook;
      }
    },
    {
      id: 'tusk-hint',
      message: 'Discover Ganesha\'s powerful tusk!',
      explicitMessage: 'Click to reveal the tusk that removes all obstacles!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState.phase === PHASES.TUSK_SEARCH && 
              !sceneState.tuskFound &&
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

  // 🧹 AGGRESSIVE GAMECOACH CLEANUP
  useEffect(() => {
    console.log('🧹 EYE-EAR-TUSK: Aggressive GameCoach cleanup on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
    
    const cleanupEvent = new CustomEvent('clearGameCoach', {
      detail: { source: 'eye-ear-tusk-scene', zoneId: 'symbol-mountain', sceneId: 'eye-ear-tusk' }
    });
    window.dispatchEvent(cleanupEvent);
    
    const aggressiveCleanup = setTimeout(() => {
      console.log('🧹 EYE-EAR-TUSK: Second cleanup wave');
      if (hideCoach) {
        hideCoach();
      }
    }, 2000);
    
    return () => clearTimeout(aggressiveCleanup);
  }, []);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Watch for GameCoach visibility changes to trigger pending actions
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
      
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'unlock-ear':
            console.log('👂 Unlocking ear search after eye wisdom');
            setShowSparkle('ear-unlock');
            
            safeSetTimeout(() => {
              sceneActions.updateState({
                earVisible: true,
                phase: PHASES.EAR_SEARCH,
                currentFocus: 'ear',
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              setShowSparkle(null);
            }, 800);
            break;
            
          case 'unlock-tusk':
            console.log('🦷 Revealing tusk search after ear wisdom');
            setShowSparkle('tusk-unlock');
            
            safeSetTimeout(() => {
              sceneActions.updateState({
                tuskVisible: true,
                phase: PHASES.TUSK_SEARCH,
                currentFocus: 'tusk',
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              setShowSparkle(null);
            }, 800);
            break;
            
          case 'complete-scene':
            console.log('✨ Scene completion after tusk wisdom');
            showSymbolCelebration('final');
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

  // Get message type for GameCoach
  const getMessageType = (messageId) => {
    switch(messageId) {
      case 'welcome': return 'welcome';
      case 'eye_wisdom': return 'wisdom1';
      case 'ear_wisdom': return 'wisdom2'; 
      case 'tusk_wisdom': return 'wisdom3';
      default: return 'welcome';
    }
  };

  // GAMECOACH LOGIC
  useEffect(() => {
    console.log('🎯 EYE-EAR-TUSK GAMECOACH: Starting check');
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

    const isReloadRecovery = sceneState.isReloadingGameCoach;

    const recentlyFinishedGameCoach = 
      (sceneState.eyeWisdomShown && sceneState.readyForWisdom === false && 
       !sceneState.gameCoachState && Date.now() - (sceneState.lastGameCoachTime || 0) < 8000) ||
      (sceneState.earWisdomShown && sceneState.readyForWisdom === false && 
       !sceneState.gameCoachState && Date.now() - (sceneState.lastGameCoachTime || 0) < 8000) ||
      (sceneState.tuskWisdomShown && sceneState.readyForWisdom === false && 
       !sceneState.gameCoachState && Date.now() - (sceneState.lastGameCoachTime || 0) < 8000);

    if (recentlyFinishedGameCoach) {
      console.log('🚫 GameCoach: Recently finished message, preventing duplicate');
      return;
    }
    
    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
    
    if (matchingMessage) {
      const messageAlreadyShown = 
        (matchingMessage.id === 'eye_wisdom' && sceneState.eyeWisdomShown && !isReloadRecovery) ||
        (matchingMessage.id === 'ear_wisdom' && sceneState.earWisdomShown && !isReloadRecovery) ||
        (matchingMessage.id === 'tusk_wisdom' && sceneState.tuskWisdomShown && !isReloadRecovery) ||
        (matchingMessage.id === 'welcome' && sceneState.welcomeShown);
      
      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }
      
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing ${matchingMessage.id} message`);
        
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
        }, 2000);
        
        switch (matchingMessage.id) {
          case 'welcome':
            sceneActions.updateState({ welcomeShown: true });
            break;
          case 'eye_wisdom':
            sceneActions.updateState({ 
              eyeWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'eye_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('unlock-ear');
            break;
          case 'ear_wisdom':
            sceneActions.updateState({ 
              earWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'ear_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('unlock-tusk');
            break;
          case 'tusk_wisdom':
            sceneActions.updateState({ 
              tuskWisdomShown: true, 
              readyForWisdom: false,
              gameCoachState: 'tusk_wisdom',
              lastGameCoachTime: Date.now()
            });
            setPendingAction('complete-scene');
            break;
        }
      }, matchingMessage.timing);
      
      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase, 
    sceneState?.discoveredSymbols, 
    sceneState?.welcomeShown,
    sceneState?.eyeWisdomShown,
    sceneState?.earWisdomShown,
    sceneState?.tuskWisdomShown,
    sceneState?.readyForWisdom,
    sceneState?.gameCoachState,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

  // 🔥 ENHANCED RELOAD LOGIC - Fixes for ending issues
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_symbol-mountain_eye-ear-tusk`;
    const playAgainRequested = localStorage.getItem(playAgainKey);

    console.log('🔄 RELOAD: Starting EyeEarTuskScene reload sequence', {
      currentPopup: sceneState.currentPopup,
      gameCoachState: sceneState.gameCoachState,
      phase: sceneState.phase,
      completed: sceneState.completed,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      fireworksCompleted: sceneState.fireworksCompleted,
      playAgainFlag: playAgainRequested
    });

    // ✅ CRITICAL FIX: Check if this is a fresh restart after Play Again
    const isFreshRestartAfterPlayAgain = (
      playAgainRequested === 'true' ||
      (sceneState.phase === 'eye_search' && 
       sceneState.completed === false && 
       sceneState.stars === 0 && 
       !sceneState.eyeFound &&
       !sceneState.welcomeShown &&
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
        phase: 'eye_search',
        fireworksCompleted: false,
        fireworksStartTime: 0,
        completionScreenShown: false
      });
      return;
    }

    // IMMEDIATELY block GameCoach normal flow
    sceneActions.updateState({ isReloadingGameCoach: true });
    
    setTimeout(() => {
      
      // 🔥 PRIORITY 1: Handle active symbol discovery states first
      if (sceneState.symbolDiscoveryState) {
        console.log('🔄 Resuming symbol discovery:', sceneState.symbolDiscoveryState);
        
        switch(sceneState.symbolDiscoveryState) {
          case 'eye_discovering':
            setPopupBookContent({
              title: "Ganesha's Wise Eyes",
              symbolImage: popupEye,
              description: `Ganesha's eyes see all, ${profileName}! They represent wisdom, insight, and the ability to see beyond the obvious to truth and understanding.`
            });
            setCurrentSourceElement('eye-1');
            setShowPopupBook(true);
            sceneActions.updateState({ 
              currentPopup: 'eye_info',
              isReloadingGameCoach: false 
            });
            return;
            
          case 'ear_discovering':
            setPopupBookContent({
              title: "Ganesha's Listening Ear",
              symbolImage: popupEar,
              description: `Ganesha's ears hear all prayers, ${profileName}! They represent his compassion and his promise to listen to those who call upon him.`
            });
            setCurrentSourceElement('ear-1');
            setShowPopupBook(true);
            sceneActions.updateState({ 
              currentPopup: 'ear_info',
              isReloadingGameCoach: false 
            });
            return;
            
          case 'tusk_discovering':
            setPopupBookContent({
              title: "Ganesha's Powerful Tusk",
              symbolImage: popupTusk,
              description: `Ganesha's tusk removes all obstacles, ${profileName}! It represents his power to clear the path ahead and help overcome any challenge.`
            });
            setCurrentSourceElement('tusk-1');
            setShowPopupBook(true);
            sceneActions.updateState({ 
              currentPopup: 'tusk_info',
              isReloadingGameCoach: false 
            });
            return;
        }
      }
      
      // 🔥 PRIORITY 2: Handle sidebar highlight states
      else if (sceneState.sidebarHighlightState) {
        console.log('🔄 Resuming sidebar highlight:', sceneState.sidebarHighlightState);
        
        setTimeout(() => {
          if (sceneState.sidebarHighlightState === 'eye_highlighting') {
            showSymbolCelebration('eye');
          } else if (sceneState.sidebarHighlightState === 'ear_highlighting') {
            showSymbolCelebration('ear');
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
          case 'eye_info':
            setPopupBookContent({
              title: "Ganesha's Wise Eyes",
              symbolImage: popupEye,
              description: `Ganesha's eyes see all, ${profileName}! They represent wisdom, insight, and the ability to see beyond the obvious to truth and understanding.`
            });
            setCurrentSourceElement('eye-1');
            setShowPopupBook(true);
            break;
            
          case 'eye_card':
            setCardContent({ 
              title: `You've discovered the Eye Symbol, ${profileName}!`,
              image: popupEye,
              stars: 2
            });
            setShowMagicalCard(true);
            break;
            
          case 'ear_info':
            setPopupBookContent({
              title: "Ganesha's Listening Ear",
              symbolImage: popupEar,
              description: `Ganesha's ears hear all prayers, ${profileName}! They represent his compassion and his promise to listen to those who call upon him.`
            });
            setCurrentSourceElement('ear-1');
            setShowPopupBook(true);
            break;
            
          case 'ear_card':
            setCardContent({ 
              title: `You've discovered the Ear Symbol, ${profileName}!`,
              image: popupEar,
              stars: 3
            });
            setShowMagicalCard(true);
            break;

          case 'tusk_info':
            setPopupBookContent({
              title: "Ganesha's Powerful Tusk",
              symbolImage: popupTusk,
              description: `Ganesha's tusk removes all obstacles, ${profileName}! It represents his power to clear the path ahead and help overcome any challenge.`
            });
            setCurrentSourceElement('tusk-1');
            setShowPopupBook(true);
            break;
            
          case 'tusk_card':
            setCardContent({ 
              title: `You've discovered the Tusk Symbol, ${profileName}!`,
              image: popupTusk,
              stars: 3
            });
            setShowMagicalCard(true);
            break;

          case 'final_fireworks':
            // 🔥 FIX 1: Enhanced fireworks reload handling
            const profileId = localStorage.getItem('activeProfileId');
            const playAgainKey = `play_again_${profileId}_symbol-mountain_eye-ear-tusk`;
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              console.log('🚫 FIREWORKS BLOCKED: Play Again was clicked (from storage)');
              
              localStorage.removeItem(playAgainKey);
              
              sceneActions.updateState({
                currentPopup: null,
                showingCompletionScreen: false,
                completed: false,
                phase: PHASES.EYE_SEARCH,
                stars: 0,
                fireworksCompleted: false,
                fireworksStartTime: 0,
                completionScreenShown: false
              });
              return;
            }
            
            // ✅ LEGITIMATE: Real fireworks reload
            console.log('🎆 Resuming final fireworks');
            
            // 🔥 FIX: Check if fireworks already completed vs still playing
            const now = Date.now();
            const fireworksStartTime = sceneState.fireworksStartTime || now;
            const fireworksElapsed = now - fireworksStartTime;
            
            if (sceneState.fireworksCompleted || fireworksElapsed > 8000) {
              // Fireworks already finished - skip to completion screen
              console.log('🎆 Fireworks already completed, showing completion screen');
              setShowSceneCompletion(true);
              sceneActions.updateState({
                currentPopup: null,
                showingCompletionScreen: true,
                fireworksCompleted: true,
                completionScreenShown: true,
                isReloadingGameCoach: false
              });
            } else {
              // Resume fireworks from where they left off
              console.log('🎆 Resuming fireworks in progress');
              setShowSparkle('final-fireworks');
              sceneActions.updateState({
                gameCoachState: null,
                isReloadingGameCoach: false,
                phase: PHASES.COMPLETE,
                stars: 8,
                completed: true,
                fireworksStartTime: fireworksStartTime,
                progress: {
                  percentage: 100,
                  starsEarned: 8,
                  completed: true
                }
              });
              
              // Complete fireworks after remaining time
              const remainingTime = Math.max(500, 8000 - fireworksElapsed);
              setTimeout(() => {
                setShowSparkle(null);
                setShowSceneCompletion(true);
                sceneActions.updateState({
                  currentPopup: null,
                  showingCompletionScreen: true,
                  fireworksCompleted: true,
                  completionScreenShown: true
                });
              }, remainingTime);
            }
            return;
        }
        
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

      // 🔥 FIX 2: Handle completion screen reload
      else if (sceneState.showingCompletionScreen) {
        const profileId = localStorage.getItem('activeProfileId');
        const playAgainKey = `play_again_${profileId}_symbol-mountain_eye-ear-tusk`;
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        if (playAgainRequested === 'true') {
          console.log('🚫 COMPLETION BLOCKED: Play Again was clicked');
          
          localStorage.removeItem(playAgainKey);
          
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: PHASES.EYE_SEARCH,
            stars: 0,
            isReloadingGameCoach: false,
            fireworksCompleted: false,
            fireworksStartTime: 0,
            completionScreenShown: false
          });
          return;
        }
        
        // ✅ LEGITIMATE: Real completion screen reload
        console.log('🔄 Resuming completion screen');
        setShowSceneCompletion(true);
        sceneActions.updateState({ 
          isReloadingGameCoach: false,
          completionScreenShown: true
        });
        return;
      }

      // 🔥 PRIORITY 4: Handle GameCoach states
      else if (sceneState.gameCoachState) {
        console.log('🔄 Resuming GameCoach:', sceneState.gameCoachState);
        
        switch(sceneState.gameCoachState) {
          case 'eye_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              eyeWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('unlock-ear');
            break;
            
          case 'ear_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              earWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('unlock-tusk');
            break;
            
          case 'tusk_wisdom':
            sceneActions.updateState({ 
              readyForWisdom: true,
              tuskWisdomShown: false,
              isReloadingGameCoach: false
            });
            setPendingAction('complete-scene');
            break;
        }
        return;
      }

      // 🔥 DEFAULT: No special reload handling needed
      else {
        console.log('🔄 No special reload needed, clearing flags');
        setTimeout(() => {
          sceneActions.updateState({ isReloadingGameCoach: false });
        }, 1500);
      }
      
    }, 500);
    
  }, [isReload]);

  // 🎯 SIMPLIFIED INTERACTION HANDLERS
  
  // Phase 1: Eye Discovery
  const handleEyeSearch = () => {
    if (!sceneState || !sceneActions) return;
    
    console.log('👁️ Eye search clicked');
    hideActiveHints();
    hideCoach();

    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }
    
    if (sceneState.phase !== PHASES.EYE_SEARCH) {
      return;
    }
    
    // Simple discovery - always successful
    console.log('👁️ Eyes found!');
    setShowSparkle('eye-found');
    
    sceneActions.updateState({ 
      eyeVisible: true,
      eyeFound: true,
      phase: PHASES.EYE_FOUND,
      currentFocus: 'eye',
      progress: {
        ...sceneState.progress,
        percentage: 30,
        starsEarned: 2
      }
    });
    
    // Start eye discovery sequence
    safeSetTimeout(() => {
      console.log('👁️ Starting eye discovery sequence');
      
      sceneActions.updateState({ 
        symbolDiscoveryState: 'eye_discovering',
        currentPopup: 'eye_info'
      });

      safeSetTimeout(() => {
        setPopupBookContent({
          title: "Ganesha's Wise Eyes",
          symbolImage: popupEye,
          description: `Ganesha's eyes see all, ${profileName}! They represent wisdom, insight, and the ability to see beyond the obvious to truth and understanding.`
        });
        
        setCurrentSourceElement('eye-1');
        setShowPopupBook(true);
        setShowSparkle(null);
      }, 800);
      
    }, 2000);
  };

  // Phase 2: Ear Discovery  
  const handleEarSearch = () => {
    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.EAR_SEARCH) return;
    
    console.log('👂 Ear search clicked');
    hideActiveHints();
    hideCoach();
    
    console.log('👂 Ear found!');
    setShowSparkle('ear-found');
    
    sceneActions.updateState({ 
      earFound: true,
      phase: PHASES.EAR_FOUND,
      currentFocus: 'ear',
      progress: {
        ...sceneState.progress,
        percentage: 60,
        starsEarned: 5
      }
    });
    
    // Start ear discovery sequence
    safeSetTimeout(() => {
      sceneActions.updateState({ 
        symbolDiscoveryState: 'ear_discovering',
        currentPopup: 'ear_info'
      });

      safeSetTimeout(() => {
        setPopupBookContent({
          title: "Ganesha's Listening Ear",
          symbolImage: popupEar,
          description: `Ganesha's ears hear all prayers, ${profileName}! They represent his compassion and his promise to listen to those who call upon him.`
        });
        
        setCurrentSourceElement('ear-1');
        setShowPopupBook(true);
        setShowSparkle(null);
      }, 800);
      
    }, 2000);
  };

  // Phase 3: Tusk Discovery
  const handleTuskSearch = () => {
    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.TUSK_SEARCH) return;
    
    console.log('🦷 Tusk search clicked');
    hideActiveHints();
    hideCoach();
    
    console.log('🦷 Tusk found!');
    setShowSparkle('tusk-found');
    
    sceneActions.updateState({ 
      tuskFound: true,
      phase: PHASES.TUSK_FOUND,
      currentFocus: 'tusk',
      progress: {
        ...sceneState.progress,
        percentage: 90,
        starsEarned: 7
      }
    });
    
    // Start tusk discovery sequence
    safeSetTimeout(() => {
      sceneActions.updateState({ 
        symbolDiscoveryState: 'tusk_discovering',
        currentPopup: 'tusk_info'
      });

      safeSetTimeout(() => {
        setPopupBookContent({
          title: "Ganesha's Powerful Tusk",
          symbolImage: popupTusk,
          description: `Ganesha's tusk removes all obstacles, ${profileName}! It represents his power to clear the path ahead and help overcome any challenge.`
        });
        
        setCurrentSourceElement('tusk-1');
        setShowPopupBook(true);
        setShowSparkle(null);
      }, 800);
      
    }, 2000);
  };

  // SYMBOL CELEBRATION FUNCTION
  const showSymbolCelebration = (symbol) => {
    let title = "";
    let image = null;
    let stars = 0;
    
    console.log(`🎉 Showing celebration for: ${symbol}`);
    
    if (sceneState?.isReloadingGameCoach) {
      console.log('🚫 Skipping celebration during reload');
      return;
    }
    
    switch(symbol) {
      case 'eye':
        title = `You've discovered the Eye Symbol, ${profileName}!`;
        image = popupEye;
        stars = 2;
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'eye_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'ear':
        title = `You've discovered the Ear Symbol, ${profileName}!`;
        image = popupEar;
        stars = 3;
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'ear_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'tusk':
        title = `You've discovered the Tusk Symbol, ${profileName}!`;
        image = popupTusk;
        stars = 3;
        
        sceneActions.updateState({ 
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'tusk_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'final':
        console.log('Final mastery achieved - showing fireworks celebration');

        // ✅ Clear ALL UI states before fireworks
        setShowMagicalCard(false);
        setShowPopupBook(false);
        setShowSparkle(null);
        setCardContent({});
        setPopupBookContent({});

        console.log('🧪 COMPLETION TRIGGER:', {
          source: 'fireworks',
          timestamp: Date.now(),
          sceneState: sceneState.phase
        });
        
        // 🔥 FIX: Enhanced completion tracking
        const now = Date.now();
        sceneActions.updateState({ 
          showingCompletionScreen: true,
          currentPopup: 'final_fireworks',
          phase: PHASES.COMPLETE,
          stars: 8,
          completed: true,
          fireworksStartTime: now,        // 🆕 Track start time
          fireworksCompleted: false,     // 🆕 Track completion
          completionScreenShown: false,  // 🆕 Track screen shown
          progress: {
            percentage: 100,
            starsEarned: 8,
            completed: true
          }
        });

        setShowSparkle('final-fireworks');
        return;

      default:
        title = "Congratulations on your discovery!";
        stars = 1;
    }
  };

  // CLOSE CARD HANDLER
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });
    
    if (cardContent.title?.includes("Eye Symbol")) {
      console.log('👁️ Eye card closed - continuing progression');
      
      setTimeout(() => {
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'eye_wisdom'
        });
        setPendingAction('unlock-ear');
      }, 500);
    }
    
    else if (cardContent.title?.includes("Ear Symbol")) {
      console.log('👂 Ear card closed - continuing progression');
      
      setTimeout(() => {
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'ear_wisdom'
        });
        setPendingAction('unlock-tusk');
      }, 300);
    }
    
    else if (cardContent.title?.includes("Tusk Symbol")) {
      console.log('🦷 Tusk card closed - continuing progression');
      
      setTimeout(() => {
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'tusk_wisdom'
        });
        setPendingAction('complete-scene');
      }, 300);
    }
  };

  // SYMBOL INFO CLOSE HANDLER
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing SymbolSceneIntegration');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });
    
    if (popupBookContent.title?.includes("Eye") || popupBookContent.title?.includes("Wise Eyes")) {
      console.log('👁️ Eye info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          eye: true
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'eye_highlighting'
      });
      
      safeSetTimeout(() => {
        console.log('🎉 Showing eye celebration after sidebar highlight');
        showSymbolCelebration('eye');
      }, 1000);
      
    } else if (popupBookContent.title?.includes("Ear") || popupBookContent.title?.includes("Listening")) {
      console.log('👂 Ear info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          ear: true
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'ear_highlighting'
      });
      
      safeSetTimeout(() => {
        console.log('🎉 Showing ear celebration after sidebar highlight');
        showSymbolCelebration('ear');
      }, 1000);
      
    } else if (popupBookContent.title?.includes("Tusk") || popupBookContent.title?.includes("Powerful")) {
      console.log('🦷 Tusk info closed - highlighting sidebar first');
      
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
  };

  // Hint interaction handlers
  const handleHintShown = (level) => {
    console.log(`Hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Hint button clicked");
    console.log("Current hint configs:", getHintConfigs());
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
        <div className="eye-ear-tusk-scene-container">
          <div className="temple-background" style={{ backgroundImage: `url(${forestBackground})` }}>
            
            {/* 🎯 PHASE 1: Eye Search Area */}
            {sceneState.phase === PHASES.EYE_SEARCH && (
              <div className="eye-search-area">
                {[1, 2, 3].map((index) => (
                  <div key={index} className={`hiding-spot spot-${index}`}>
                    <ClickableElement
                      id={`eye-spot-${index}`}
                      onClick={handleEyeSearch}
                      completed={false}
                      zone="eye-zone"
                    >
                      <img 
                        src={hidingSpot}
                        alt={`Hiding Spot ${index}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    {showSparkle === `eye-spot-${index}` && (
                      <SparkleAnimation
                        type="firefly"
                        count={10}
                        color="#FFD700"
                        size={8}
                        duration={1000}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 👁️ Eyes - Show when found */}
            {sceneState.eyeVisible && (
              <div className="eye-container breathing">
                <img 
                  src={eye}
                  alt="Ganesha's Wise Eyes"
                  style={{ width: '100%', height: '100%' }}
                />
                {showSparkle === 'eye-found' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#87CEEB"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* 🎯 PHASE 2: Ear Search */}
            {sceneState.earVisible && sceneState.phase === PHASES.EAR_SEARCH && (
              <div className="ear-search-area">
                <ClickableElement
                  id="ear-discovery"
                  onClick={handleEarSearch}
                  completed={sceneState.earFound}
                  zone="ear-zone"
                >
                  <div className="ear-search-spot">
                    <img 
                      src={hidingSpot}
                      alt="Find the Ear"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </ClickableElement>
              </div>
            )}

            {/* 👂 Ear - Show when found */}
            {sceneState.earFound && (
              <div className="ear-container breathing">
                <img 
                  src={ear}
                  alt="Ganesha's Listening Ear"
                  style={{ width: '100%', height: '100%' }}
                />
                {showSparkle === 'ear-found' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#DDA0DD"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* 🎯 PHASE 3: Tusk Search */}
            {sceneState.tuskVisible && sceneState.phase === PHASES.TUSK_SEARCH && (
              <div className="tusk-search-area">
                <ClickableElement
                  id="tusk-discovery"
                  onClick={handleTuskSearch}
                  completed={sceneState.tuskFound}
                  zone="tusk-zone"
                >
                  <div className="tusk-search-spot">
                    <img 
                      src={hidingSpot}
                      alt="Find the Tusk"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </ClickableElement>
              </div>
            )}

            {/* 🦷 Tusk - Show when found */}
            {sceneState.tuskFound && (
              <div className="tusk-container breathing">
                <img 
                  src={tusk}
                  alt="Ganesha's Powerful Tusk"
                  style={{ width: '100%', height: '100%' }}
                />
                {showSparkle === 'tusk-found' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#F0E68C"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Unlock sparkles */}
            {showSparkle === 'ear-unlock' && (
              <SparkleAnimation
                type="glitter"
                count={30}
                color="#DDA0DD"
                size={12}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'tusk-unlock' && (
              <SparkleAnimation
                type="glitter"
                count={30}
                color="#F0E68C"
                size={12}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}

            {/* 🧪 COMPLETION TEST BUTTON */}
            <div style={{
              position: 'fixed',
              top: '170px',
              right: '10px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🧪 EYE-EAR-TUSK COMPLETION TEST CLICKED');
              sceneActions.updateState({
                // Set all discoveries complete
                eyeVisible: true,
                eyeFound: true,
                earVisible: true,
                earFound: true,
                tuskVisible: true,
                tuskFound: true,
                
                // All symbols discovered
                discoveredSymbols: {
                  eye: true,
                  ear: true,
                  tusk: true
                },
                
                // All messages shown
                welcomeShown: true,
                eyeWisdomShown: true,
                earWisdomShown: true,
                tuskWisdomShown: true,
                
                // Set to final phase
                phase: PHASES.COMPLETE,
                currentFocus: 'complete',
                
                // COMPLETION DATA
                completed: true,
                stars: 8,
                progress: {
                  percentage: 100,
                  starsEarned: 8,
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
              
              // Trigger final celebration
              setTimeout(() => {
                showSymbolCelebration('final');
              }, 1000);
            }}>
              COMPLETE
            </div>

            {/* 🆘 EMERGENCY: Start Fresh Button */}
            <div style={{
              position: 'fixed',
              top: '20px',
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
                console.log('🔄 EYE-EAR-TUSK EMERGENCY RESTART: User chose to start fresh');
                
                // Clear all UI states immediately
                setShowSparkle(null);
                setShowPopupBook(false);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                setCurrentSourceElement(null);
                setPopupBookContent({});
                setCardContent({});
                setPendingAction(null);
                
                // Reset scene state after UI cleared
                setTimeout(() => {
                  sceneActions.updateState({
                    // Reset all discovery states
                    eyeVisible: false,
                    eyeFound: false,
                    earVisible: false,
                    earFound: false,
                    tuskVisible: false,
                    tuskFound: false,
                    
                    hidingSpots: [0, 0, 0],
                    correctSpot: 1,
                    
                    phase: PHASES.EYE_SEARCH,
                    currentFocus: 'eyes',
                    discoveredSymbols: {},
                    
                    welcomeShown: false,
                    isReloadingGameCoach: false,
                    gameCoachState: null,
                           
                    // Clear all message flags
                    welcomeShown: false,
                    eyeWisdomShown: false,
                    earWisdomShown: false,
                    tuskWisdomShown: false,
                    readyForWisdom: false,
                    
                    // Clear reload states
                    currentPopup: null,
                    symbolDiscoveryState: null,
                    sidebarHighlightState: null,
                    gameCoachState: null,
                    isReloadingGameCoach: false,
                    lastGameCoachTime: 0,
                    showingCompletionScreen: false,
                    fireworksCompleted: false,
                    fireworksStartTime: 0,
                    completionScreenShown: false,
                    
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
                
                // Hide GameCoach if active
                if (hideCoach) {
                  hideCoach();
                }
              }
            }}>
              🔄 Start Fresh
            </div>

            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getHintConfigs()}
              characterImage={coachImage}
              initialDelay={20000}        
              hintDisplayTime={10000}     
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={handleHintShown}
              onHintButtonClick={handleHintButtonClick}
              enabled={true}
            />

          </div>
          
          {/* SymbolSceneIntegration for Symbol Information */}
          <SymbolSceneIntegration
            show={showPopupBook}
            symbolImage={popupBookContent.symbolImage}
            title={popupBookContent.title}
            description={popupBookContent.description}
            sourceElement={currentSourceElement}
            onClose={handleSymbolInfoClose}
          />

          {/* MagicalCardFlip for Symbol Celebrations */}
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
          {showMagicalCard && (cardContent.title?.includes("Eye Symbol") || cardContent.title?.includes("Ear Symbol") || cardContent.title?.includes("Tusk Symbol")) && (
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

          <style>{`
            @keyframes confettiFall {
              to {
                transform: translateY(100vh) rotate(720deg);
              }
            }
            
            .eye-search-area {
              position: absolute;
              top: 20%;
              left: 20%;
              width: 60%;
              height: 30%;
              display: flex;
              justify-content: space-around;
              align-items: center;
            }
            
            .hiding-spot {
              width: 80px;
              height: 80px;
              cursor: pointer;
              transition: transform 0.2s;
            }
            
            .hiding-spot:hover {
              transform: scale(1.1);
            }
            
            .eye-container {
              position: absolute;
              top: 25%;
              left: 45%;
              width: 100px;
              height: 80px;
              z-index: 10;
            }
            
            .ear-search-area {
              position: absolute;
              top: 60%;
              left: 30%;
              width: 100px;
              height: 100px;
            }
            
            .ear-container {
              position: absolute;
              top: 60%;
              left: 30%;
              width: 100px;
              height: 100px;
              z-index: 10;
            }
            
            .tusk-search-area {
              position: absolute;
              top: 50%;
              right: 20%;
              width: 120px;
              height: 80px;
            }
            
            .tusk-container {
              position: absolute;
              top: 50%;
              right: 20%;
              width: 120px;
              height: 80px;
              z-index: 10;
            }
            
            .breathing {
              animation: breathe 3s ease-in-out infinite;
            }
            
            @keyframes breathe {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            .temple-background {
              width: 100vw;
              height: 100vh;
              background-size: cover;
              background-position: center;
              position: relative;
              overflow: hidden;
            }
          `}</style>

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
            currentProgress={{
              stars: sceneState.celebrationStars || 0,
              completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
              total: 1
            }}
          />

          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
            {...CulturalProgressExtractor.getCulturalProgressData()}
          />

          {/* Symbol Sidebar */}
          <SymbolSidebar 
            discoveredSymbols={sceneState.discoveredSymbols || {}}
            onSymbolClick={(symbolId) => {
              console.log(`Sidebar symbol clicked: ${symbolId}`);
            }}
          />

          {/* 🔥 ENHANCED FIREWORKS with completion tracking */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={8000}
              onComplete={() => {
                console.log('🎯 Fireworks complete');

                // ✅ IMMEDIATE: Stop ALL sparkle effects
                setShowSparkle(null);
                
                // ✅ FORCE: Clear any lingering animations
                const sparkleElements = document.querySelectorAll('[class*="sparkle"], [class*="glitter"]');
                sparkleElements.forEach(el => el.remove());

                // 🎯 ENHANCED: Track fireworks completion
                sceneActions.updateState({
                  fireworksCompleted: true,
                  currentPopup: null
                });

                // Save completion
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('symbol-mountain', 'eye-ear-tusk', {
                    completed: true,
                    stars: 8,
                    symbols: { eye: true, ear: true, tusk: true },
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_eye-ear-tusk`);
                  SimpleSceneManager.clearCurrentScene();
                  console.log('✅ EYE-EAR-TUSK: Completion saved and temp session cleared');
                }
                
                // Then show scene completion UI
                setShowSceneCompletion(true);
                sceneActions.updateState({
                  showingCompletionScreen: true,
                  completionScreenShown: true
                });
              }}
            />
          )}

          {/* 🔥 ENHANCED SCENE COMPLETION with better reload handling */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Temple Discovery"
            sceneNumber={2}
            totalScenes={4}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={['eye', 'ear', 'tusk']}
            symbolImages={{
              eye: symbolEyeColored,
              ear: symbolEarColored,
              tusk: symbolTuskColored
            }}
            nextSceneName="Sacred Forest"
            sceneId="eye-ear-tusk"
            completionData={{
              stars: 8,
              symbols: { eye: true, ear: true, tusk: true },
              completed: true,
              totalStars: 8
            }}
            onComplete={onComplete}

            onReplay={() => {
              console.log('🔧 NUCLEAR OPTION: Bulletproof Play Again');
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                // Clear ALL storage
                localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_eye-ear-tusk`);
                localStorage.removeItem(`replay_session_${profileId}_symbol-mountain_eye-ear-tusk`);
                localStorage.removeItem(`play_again_${profileId}_symbol-mountain_eye-ear-tusk`);
                
                SimpleSceneManager.setCurrentScene('symbol-mountain', 'eye-ear-tusk', false, false);
                console.log('🗑️ NUCLEAR: All storage cleared');
              }
              
              // Force clean reload
              console.log('🔄 NUCLEAR: Forcing reload in 100ms');
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}

            onContinue={() => {
              console.log('🔧 CONTINUE: Going to next scene + preserving resume');
              
              // Enhanced GameCoach clearing
              if (clearManualCloseTracking) {
                clearManualCloseTracking();
                console.log('✅ CONTINUE: GameCoach manual tracking cleared');
              }
              if (hideCoach) {
                hideCoach();
                console.log('✅ CONTINUE: GameCoach hidden');
              }
              
              setTimeout(() => {
                console.log('🎭 CONTINUE: Forcing GameCoach fresh start for next scene');
                if (clearManualCloseTracking) {
                  clearManualCloseTracking();
                  console.log('🎭 CONTINUE: GameCoach cleared again after delay');
                }
              }, 500);
              
              // Save completion data
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'eye-ear-tusk', {
                  completed: true,
                  stars: 8,
                  symbols: { eye: true, ear: true, tusk: true }
                });
                
                GameStateManager.saveGameState('symbol-mountain', 'eye-ear-tusk', {
                  completed: true,
                  stars: 8,
                  symbols: { eye: true, ear: true, tusk: true }
                });
                
                console.log('✅ CONTINUE: Completion data saved');
              }

              // Set NEXT scene for resume tracking
              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('symbol-mountain', 'next-scene', false, false);
                console.log('✅ CONTINUE: Next scene set for resume tracking');
                
                // Navigate to next scene
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          />

        </div>       
      </MessageManager>
    </InteractionManager>
  );
};

export default EyeEarTuskScene;