// zones/cave-of-secrets/scenes/suryakoti-samaprabha/SuryakotiScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SuryakotiScene.css';

// Import scene management components (PROVEN FROM CAVE)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components (PROVEN FROM CAVE)
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
import DoorComponent from '../../components/DoorComponent';

// NEW: Game components
import SunCollectionGame from '../../components/SunCollectionGame';
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';

// Cave images
import caveBackgroundDark from './assets/images/cave-background-dark.png';
import caveBackgroundBright from './assets/images/cave-background-bright.png';
import doorImage from './assets/images/door-image.png';
import orbEmpty from './assets/images/orb-empty.png';
import orbGanesha from './assets/images/orb-ganesha.png';
import suryakotiCard from './assets/images/suryakoti-card.png';
import samaprabhaCard from './assets/images/samaprabha-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// Child face images
import scaredFace1 from './assets/images/scared-face-1.png';
import scaredFace2 from './assets/images/scared-face-2.png';
import scaredFace3 from './assets/images/scared-face-3.png';
import scaredFace4 from './assets/images/scared-face-4.png';
import scaredFace5 from './assets/images/scared-face-5.png';
import happyFace1 from './assets/images/happy-face-1.png';
import happyFace2 from './assets/images/happy-face-2.png';
import happyFace3 from './assets/images/happy-face-3.png';
import happyFace4 from './assets/images/happy-face-4.png';
import happyFace5 from './assets/images/happy-face-5.png';

// Sun image for draggable suns
import sunImage from './assets/images/sun.png';

const CAVE_PHASES = {
  // Part 1: Suryakoti Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  SUN_COLLECTION_INTRO: 'sun_collection_intro',
  SUN_COLLECTION_ACTIVE: 'sun_collection_active',
  SUN_COLLECTION_COMPLETE: 'sun_collection_complete',
  SURYAKOTI_LEARNING: 'suryakoti_learning',
  
  // Part 2: Samaprabha Learning  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  HEALING_INTRO: 'healing_intro',
  HEALING_ACTIVE: 'healing_active',
  HEALING_COMPLETE: 'healing_complete',
  SAMAPRABHA_LEARNING: 'samaprabha_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

// Error Boundary (PROVEN FROM CAVE)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Suryakoti Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Million Suns Chamber.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Chamber Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SuryakotiScene = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'suryakoti-samaprabha'
}) => {
  console.log('SuryakotiScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Door 1 state (Su-rya-ko-ti)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Su', 'rya', 'ko', 'ti'],

          // Door 2 state (Sa-ma-pra-bha)  
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Sa', 'ma', 'pra', 'bha'],

          // Game 1: Sun Collection state
          sunCollectionStarted: false,
          collectedSuns: 0,
          sunCollectionCompleted: false,
          caveIllumination: 0,
          orbSuns: [],

          // Game 2: Healing Touch state
          healingStarted: false,
          healedChildren: [],
          availableSuns: [],
          healingCompleted: false,
          childStates: [
            { id: 1, healed: false, scaredFace: scaredFace1, happyFace: happyFace1 },
            { id: 2, healed: false, scaredFace: scaredFace2, happyFace: happyFace2 },
            { id: 3, healed: false, scaredFace: scaredFace3, happyFace: happyFace3 },
            { id: 4, healed: false, scaredFace: scaredFace4, happyFace: happyFace4 },
            { id: 5, healed: false, scaredFace: scaredFace5, happyFace: happyFace5 }
          ],
          
    // Sanskrit learning - Scene 1 words already learned
learnedWords: {
  vakratunda: { learned: true, scene: 1 },
  mahakaya: { learned: true, scene: 1 },
  suryakoti: { learned: false, scene: 2 },
  samaprabha: { learned: false, scene: 2 }
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
          suryakotiWisdomShown: false,
          samaprabhaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          sunCollectionIntroShown: false,
          healingIntroShown: false,
          
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
          <SuryakotiSceneContent
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

const SuryakotiSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('SuryakotiSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality (PROVEN FROM CAVE)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // State management (PROVEN FROM CAVE)
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs (PROVEN FROM CAVE)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function (PROVEN FROM CAVE)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
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

  // Cleanup timeouts on unmount (PROVEN FROM CAVE)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (PROVEN FROM CAVE)
  useEffect(() => {
    console.log('🧹 SURYAKOTI: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
  }, []);

  // GameCoach messages (ADAPTED FOR SURYAKOTI)
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Million Suns Chamber, ${profileName}! Ancient light awaits your collection!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'suryakoti_wisdom',
      message: `Magnificent, ${profileName}! You've mastered Suryakoti - the brilliance of a million suns!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.suryakoti?.learned && !sceneState?.suryakotiWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'sun_collection_intro',
      message: `🌞 Collect the golden suns, ${profileName}! Fill your magical orb with divine light!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.SUN_COLLECTION_INTRO && !sceneState?.sunCollectionIntroShown
    },
    {
      id: 'healing_intro',
      message: `💖 Share your sunshine, ${profileName}! Drag the suns to heal the sad children's hearts!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.HEALING_INTRO && !sceneState?.healingIntroShown
    },
    {
      id: 'samaprabha_wisdom',
      message: `Wonderful, ${profileName}! You've learned Samaprabha - your inner light that removes all darkness!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.samaprabha?.learned && !sceneState?.samaprabhaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      explicitMessage: 'Drag Su-rya-ko-ti syllables to spell Suryakoti!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'sun-collection-hint',
      message: 'Click the golden suns to collect them!',
      explicitMessage: 'Look for bright golden suns and click them to fill your orb!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE &&
               sceneState?.collectedSuns < 5 &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the Sanskrit syllables for Samaprabha!',
      explicitMessage: 'Drag Sa-ma-pra-bha syllables to spell Samaprabha!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'healing-hint',
      message: 'Drag the suns to the sad children to heal them!',
      explicitMessage: 'Drag suns from around the orb to each scared child!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.HEALING_ACTIVE &&
               sceneState?.healedChildren?.length < 5 &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    }
  ];

  // Watch for GameCoach visibility changes (PROVEN FROM CAVE)
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
     
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'start-door2':
            console.log('🚪 Starting Door 2 after Suryakoti wisdom');
            sceneActions.updateState({
              phase: CAVE_PHASES.DOOR2_ACTIVE,
              gameCoachState: null,
              isReloadingGameCoach: false
            });
            break;
           
          case 'start-fireworks':
            console.log('🎆 Starting fireworks after final wisdom');
            showFinalCelebration();
            break;
        }
       
        setPendingAction(null);
      }, 1000);
     
      timeoutsRef.current.push(actionTimer);
    }
   
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // GameCoach triggering system (PROVEN FROM CAVE)
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
        (matchingMessage.id === 'suryakoti_wisdom' && sceneState.suryakotiWisdomShown) ||
        (matchingMessage.id === 'samaprabha_wisdom' && sceneState.samaprabhaWisdomShown) ||
        (matchingMessage.id === 'cave_welcome' && sceneState.welcomeShown) ||
        (matchingMessage.id === 'sun_collection_intro' && sceneState.sunCollectionIntroShown) ||
        (matchingMessage.id === 'healing_intro' && sceneState.healingIntroShown);
     
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
          case 'sun_collection_intro':
            sceneActions.updateState({ sunCollectionIntroShown: true });
            break;
          case 'healing_intro':
            sceneActions.updateState({ healingIntroShown: true });
            break;
          case 'suryakoti_wisdom':
            sceneActions.updateState({
              suryakotiWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'suryakoti_wisdom'
            });
            setPendingAction('start-door2');
            break;
          case 'samaprabha_wisdom':
            sceneActions.updateState({
              samaprabhaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'samaprabha_wisdom'
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
    sceneState?.suryakotiWisdomShown,
    sceneState?.samaprabhaWisdomShown,
    sceneState?.sunCollectionIntroShown,
    sceneState?.healingIntroShown,
    sceneState?.readyForWisdom,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

  // RELOAD LOGIC (PROVEN FROM CAVE)
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 SURYAKOTI RELOAD: Starting comprehensive reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase
    });

    // Check for Play Again flag first
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
      console.log('🔄 SURYAKOTI RELOAD: Detected fresh restart after Play Again - clearing completion state');
      
      if (playAgainRequested === 'true') {
        localStorage.removeItem(playAgainKey);
        console.log('✅ CLEARED: Suryakoti Play Again storage flag');
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
      // Handle popup states, symbol discovery, etc. (same pattern as Cave)
      if (sceneState.currentPopup) {
        console.log('🔄 SURYAKOTI: Resuming popup:', sceneState.currentPopup);
        
        switch(sceneState.currentPopup) {
          case 'suryakoti_info':
            setPopupBookContent({
              title: "Suryakoti - Million Suns",
              symbolImage: suryakotiCard,
              description: `Suryakoti means "million suns", ${profileName}! You collected golden sunshine like gathering the light of a million suns!`
            });
            setCurrentSourceElement('sun-collection-area');
            setShowPopupBook(true);
            break;
            
          case 'suryakoti_card':
            setCardContent({
              title: `You've learned Suryakoti, ${profileName}!`,
              image: suryakotiCard,
              stars: 3
            });
            setShowMagicalCard(true);
            setTimeout(() => {
              sceneActions.updateState({ 
                isReloadingGameCoach: false,
                symbolDiscoveryState: null,
                sidebarHighlightState: null
              });
            }, 500);
            break;

          case 'samaprabha_info':
            setPopupBookContent({
              title: "Samaprabha - Equal Brilliance",
              symbolImage: samaprabhaCard,
              description: `Samaprabha means "equal brilliance", ${profileName}! You shared your sunshine and removed darkness from sad hearts!`
            });
            setCurrentSourceElement('healing-area');
            setShowPopupBook(true);
            break;
            
          case 'samaprabha_card':
            setCardContent({
              title: `You've learned Samaprabha, ${profileName}!`,
              image: samaprabhaCard,
              stars: 3
            });
            setShowMagicalCard(true);
            setTimeout(() => {
              sceneActions.updateState({ 
                isReloadingGameCoach: false,
                symbolDiscoveryState: null,
                sidebarHighlightState: null
              });
            }, 500);
            break;

          case 'final_fireworks':
            const profileId = localStorage.getItem('activeProfileId');
            const playAgainKey = `play_again_${profileId}_cave-of-secrets_suryakoti-samaprabha`;
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              console.log('🚫 SURYAKOTI FIREWORKS BLOCKED: Play Again was clicked');
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
            
            console.log('🎆 SURYAKOTI: Resuming final fireworks');
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

      // Handle completion screen reload
      if (sceneState.showingCompletionScreen) {
        const profileId = localStorage.getItem('activeProfileId');
        const playAgainKey = `play_again_${profileId}_cave-of-secrets_suryakoti-samaprabha`;
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        if (playAgainRequested === 'true') {
          console.log('🚫 SURYAKOTI COMPLETION BLOCKED: Play Again was clicked');
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
        
        console.log('🔄 SURYAKOTI: Resuming completion screen');
        setShowSceneCompletion(true);
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

      // Default: clear flags
      console.log('🔄 SURYAKOTI: No special reload needed, clearing flags');
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
      
    }, 500);
    
  }, [isReload]);

  // Door 1 handlers (ADAPTED FOR SURYAKOTI)
  const handleDoor1SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Su';
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
    
    setShowSparkle('door1-completing');
    
    const doorElement = document.querySelector('.suryakoti-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door1Completed: true
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        phase: CAVE_PHASES.SUN_COLLECTION_INTRO
      });
    }, 3000);
  };

  // Door 2 handlers (ADAPTED FOR SAMAPRABHA)
  const handleDoor2SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Sa';
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
    
    setShowSparkle('door2-completing');
    
    const doorElement = document.querySelector('.samaprabha-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door2Completed: true
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        phase: CAVE_PHASES.HEALING_INTRO,
        healingStarted: true,
     availableSuns: [
 { id: 1, angle: 0 },
      { id: 2, angle: 72 },
      { id: 3, angle: 144 },
      { id: 4, angle: 216 },
      { id: 5, angle: 288 }]
      });
    }, 3000);
  };

  // Sun Collection Game handlers
  const handleSunCollectionStart = () => {
    console.log('🌞 Starting sun collection game!');
    
    sceneActions.updateState({
      sunCollectionStarted: true,
      phase: CAVE_PHASES.SUN_COLLECTION_ACTIVE
    });
  };

  const handleSunCollected = (count) => {
    console.log(`☀️ Sun collected! Total: ${count}/5`);
    
    const newIllumination = (count / 5) * 100;
    
    sceneActions.updateState({
      collectedSuns: count,
      caveIllumination: newIllumination
    });
  };

  const handleSunCollectionComplete = () => {
    console.log('🌟 Sun collection completed!');
    
    sceneActions.updateState({
      sunCollectionCompleted: true,
      phase: CAVE_PHASES.SUN_COLLECTION_COMPLETE,
      progress: {
        ...sceneState.progress,
        percentage: 50,
        starsEarned: 3
      }
    });

    safeSetTimeout(() => {
      completeSuryakotiLearning();
    }, 2000);
  };

  const completeSuryakotiLearning = () => {
    console.log('📜 Starting Suryakoti learning');
    
    sceneActions.updateState({
      symbolDiscoveryState: 'suryakoti_discovering',
      currentPopup: 'suryakoti_info',
      phase: CAVE_PHASES.SURYAKOTI_LEARNING
    });

    setPopupBookContent({
      title: "Suryakoti - Million Suns",
      symbolImage: suryakotiCard,
      description: `Suryakoti means "million suns", ${profileName}! You collected golden sunshine like gathering the light of a million suns!`
    });

    setCurrentSourceElement('sun-collection-area');
    setShowPopupBook(true);
  };

  // Healing Touch Game handlers
const handleChildHeal = (dragData) => {
  const { id, data } = dragData;
  const childId = parseInt(id.split('-')[2]); // Extract child ID from drop zone ID
  const sunId = data.id;
  
  console.log(`🎯 HEAL DEBUG:`, {
    dropZoneId: id,
    extractedChildId: childId,
    sunId: sunId,
    currentHealedChildren: sceneState.healedChildren
  });
  
  hideActiveHints();
  hideCoach();

  // Add to healed children
  const newHealedChildren = [...(sceneState.healedChildren || []), childId];
  
  console.log(`🎯 NEW HEALED:`, newHealedChildren);
  
  setShowSparkle(`child-${childId}-healed`);
  setTimeout(() => setShowSparkle(null), 1500);
  
  sceneActions.updateState({
    healedChildren: newHealedChildren,
    caveIllumination: Math.min(100, sceneState.caveIllumination + 20)
  });
  
  if (newHealedChildren.length >= 5) {
    console.log('All children healed!');
    safeSetTimeout(() => {
      completeHealing();
    }, 2000);
  }
};

  const completeHealing = () => {
    console.log('💖 Healing completed!');
    
    sceneActions.updateState({
      healingCompleted: true,
      phase: CAVE_PHASES.HEALING_COMPLETE
    });

    safeSetTimeout(() => {
      startSamaprabhaLearning();
    }, 2000);
  };

  const startSamaprabhaLearning = () => {
    console.log('📜 Starting Samaprabha learning');
    
    sceneActions.updateState({
      symbolDiscoveryState: 'samaprabha_discovering',
      currentPopup: 'samaprabha_info',
      phase: CAVE_PHASES.SAMAPRABHA_LEARNING
    });

    setPopupBookContent({
      title: "Samaprabha - Equal Brilliance",
      symbolImage: samaprabhaCard,
      description: `Samaprabha means "equal brilliance", ${profileName}! You shared your sunshine and removed darkness from sad hearts!`
    });

    setCurrentSourceElement('healing-area');
    setShowPopupBook(true);
  };

  // Symbol celebration system (ADAPTED FROM CAVE)
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
      case 'suryakoti':
        title = `You've learned Suryakoti, ${profileName}!`;
        image = suryakotiCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'suryakoti_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'samaprabha':
        title = `You've learned Samaprabha, ${profileName}!`;
        image = samaprabhaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'samaprabha_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;
    }
  };

  // Close card handler (PROVEN FROM CAVE)
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Suryakoti")) {
      console.log('📜 Suryakoti card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'suryakoti_wisdom'
        });
      }, 500);

    } else if (cardContent.title?.includes("Samaprabha")) {
      console.log('📜 Samaprabha card closed - triggering final GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'samaprabha_wisdom'
        });
      }, 500);
    }
  };

  // Symbol info close handler (PROVEN FROM CAVE)
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Suryakoti")) {
      console.log('📜 Suryakoti info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          suryakoti: { learned: true, scene: 2 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          suryakoti: { learned: true, scene: 2 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'suryakoti_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing suryakoti celebration after sidebar highlight');
        showSanskritCelebration('suryakoti');
      }, 1000);

    } else if (popupBookContent.title?.includes("Samaprabha")) {
      console.log('📜 Samaprabha info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          samaprabha: { learned: true, scene: 2 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          samaprabha: { learned: true, scene: 2 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'samaprabha_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing samaprabha celebration after sidebar highlight');
        showSanskritCelebration('samaprabha');
      }, 1000);
    }
  };

  const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    // Hide Sanskrit Sidebar during completion
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
    return <div className="loading">Loading Million Suns Chamber...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>
{/* GRADUAL BACKGROUND BLENDING */}
<div className="pond-background" style={{ position: 'relative', width: '100%', height: '100%' }}>
  
  {/* Dark background - always there */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url(${caveBackgroundDark})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1
  }} />
  
  {/* Bright background - fades in gradually */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url(${caveBackgroundBright})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat',
    opacity: Math.max(0, (sceneState.caveIllumination - 60) / 40), // Starts fading in at 60%, full at 100%
    transition: 'opacity 2s ease',
    zIndex: 2
  }} />
  
  {/* Filter overlay */}
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    filter: `brightness(${1 + Math.min((sceneState.caveIllumination || 0) / 500, 0.15)})`,
    transition: 'all 2s ease',
    zIndex: 3,
    pointerEvents: 'none'
  }} />
            
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

            {/* COMPREHENSIVE PHASE TEST BUTTONS */}
<div style={{
  position: 'fixed',
  top: '60px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 9999,
  background: 'rgba(0,0,0,0.8)',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '11px'
}}>
  <div style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
    🧪 PHASE TESTS
  </div>
  

  
  {/* Door 1 Complete */}
  <button style={{
    background: '#27AE60', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.DOOR1_COMPLETE,
      door1Completed: true,
      door1CurrentStep: 4,
      door1SyllablesPlaced: ['Va', 'kra', 'tun', 'da']
    });
  }}>
    ✅1 Door1 Done
  </button>

  


  

  
  {/* Door 2 Active */}
  <button style={{
    background: '#8E44AD', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.DOOR2_ACTIVE,
      learnedWords: { vakratunda: { learned: true }, mahakaya: { learned: false } },
      door2Completed: false,
      door2CurrentStep: 0,
      door2SyllablesPlaced: []
    });
  }}>
    🚪6 Door2 Active
  </button>
  

  
  {/* Complete Scene */}
  <button style={{
    background: '#E67E22', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '4px', cursor: 'pointer'
  }} onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.COMPLETE,
      completed: true,
      stars: 8,
      learnedWords: { vakratunda: { learned: true }, mahakaya: { learned: true } },
      growingCompleted: true
    });
    setTimeout(() => showFinalCelebration(), 500);
  }}>
    🎆8 Complete
  </button>
</div>

            {/* Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent
                  syllables={['Su', 'rya', 'ko', 'ti']}
                  completedWord="Suryakoti"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="suryakoti-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="SURYAKOTI"
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

            {/* Sun Collection Game */}
            {(sceneState.phase === CAVE_PHASES.SUN_COLLECTION_INTRO || 
              sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE || 
              sceneState.phase === CAVE_PHASES.SUN_COLLECTION_COMPLETE ||
              sceneState.phase === CAVE_PHASES.SURYAKOTI_LEARNING) && (
              <div className="sun-collection-area" id="sun-collection-area">
                <SunCollectionGame
                  onComplete={handleSunCollectionComplete}
                  onSunCollected={handleSunCollected}
                  profileName={profileName}
                />
              </div>
            )}

            {/* Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  syllables={['Sa', 'ma', 'pra', 'bha']}
                  completedWord="Samaprabha"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="samaprabha-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle="SAMAPRABHA"
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
                  color="#ff8c42"
                  size={12}
                  duration={2500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

{/* Healing Touch Game - CENTRAL ORB DESIGN - PERSISTENT TILL END 
{(sceneState.phase === CAVE_PHASES.HEALING_INTRO || 
  sceneState.phase === CAVE_PHASES.HEALING_ACTIVE || 
  sceneState.phase === CAVE_PHASES.HEALING_COMPLETE ||
  sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING ||
  sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
  sceneState.phase === CAVE_PHASES.COMPLETE ||
  sceneState.showingCompletionScreen ||
  showSparkle === 'final-fireworks') && (
  <div className="healing-area" id="healing-area">
    
    {/* CENTRAL HEALING ORB 
    <div className="central-healing-orb" style={{
      position: 'absolute',
top: '50%',      // ✅ Use fixed pixels instead of % + transform
    left: '40%',     // ✅ Use fixed pixels instead of % + transform  
      transform: 'translate(-50%, -50%)',
      width: '200px',
      height: '200px',
      zIndex: 10,
      background: 'radial-gradient(circle, rgba(218, 165, 32, 0.1), rgba(255, 140, 0, 0.05))',
      borderRadius: '50%',
      border: '3px solid rgba(218, 165, 32, 0.3)',
      boxShadow: '0 0 20px rgba(218, 165, 32, 0.2)',
      transition: 'all 1s ease'
    }}>
      
      {/* ORB BACKGROUND IMAGE 
      <div className="orb-background-center" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '160px',
        height: '160px',
        zIndex: 5,
        opacity: 0.7
      }}>
        <img 
          src={orbGanesha}
          alt="Healing Orb Center"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'brightness(1.1)'
          }}
        />
      </div>
      
      {/* DRAGGABLE SUNS INSIDE ORB 
      <div className="central-orb-suns" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '140px',
        height: '140px',
        transform: 'translate(-50%, -50%)',
        zIndex: 15
      }}>
        {sceneState.availableSuns?.map((sun, index) => {
        // Simple grid positions instead of trigonometric calculations
  const SUN_SIZE = 40; // The width/height of your sun in pixels

  const positions = [
    { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },  // Top
    { top: '35%', left: '80%', transform: 'translate(-50%, -50%)' },  // Top-right  
    { top: '65%', left: '80%', transform: 'translate(-50%, -50%)' },  // Bottom-right
    { top: '80%', left: '50%', transform: 'translate(-50%, -50%)' },  // Bottom
    { top: '35%', left: '20%', transform: 'translate(-50%, -50%)' }   // Top-left
  ];
  
  const position = positions[index] || positions[0];
          
          return (
            <div
              key={sun.id}
              className="central-orb-sun"
              style={{
                position: 'absolute',
              top: position.top,     // ✅ Simple percentage positioning
        left: position.left,   // ✅ Simple percentage positioning
                width: '40px',
                height: '40px',
    transform: position.transform, // ✅ Add proper transform for centering
                zIndex: 25,
                cursor: 'grab',
                //border: '2px solid #FF8C00',
                //borderRadius: '50%',
                //background: 'radial-gradient(circle, rgba(255, 215, 0, 0.9), rgba(255, 140, 0, 0.7))',
                //boxShadow: '0 0 10px rgba(255, 140, 0, 0.6)',
                //transition: 'all 0.3s ease'
              }}
            >
              <DraggableItem
                id={`healing-sun-${sun.id}`}
                data={{ type: 'sun', id: sun.id }}
                onDragStart={(id, data) => console.log('Dragging central sun:', id, data)}
                onDragEnd={(id) => console.log('Central sun drag ended:', id)}
              >
                <img 
                  src={sunImage}
                  alt={`Healing Sun ${sun.id}`}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    filter: 'brightness(1.2)',
                    pointerEvents: 'none'
                  }}
                />
              </DraggableItem>
            </div>
          );
        })}
      </div>
      
      {/* ORB GLOW EFFECT 
      <div className="central-orb-glow" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent 70%)',
        borderRadius: '50%',
        zIndex: 1,
        animation: 'centralOrbPulse 3s ease-in-out infinite'
      }} />
    </div>
    
    {/* SCARED CHILDREN AROUND THE EDGES 
    {sceneState.childStates.map((child, index) => {
      const isHealed = sceneState.healedChildren?.includes(child.id);
      
      // Position children around the edges of the screen
      const positions = [
        { top: '20%', left: '15%' },   // Top-left
        { top: '25%', right: '15%' },  // Top-right  
        { top: '60%', left: '5%' },   // Bottom-left
        { top: '55%', right: '10%' },  // Bottom-right
        { top: '5%', left: '70%', transform: 'translateX(-50%)' } // Bottom-center
      ];
      
      return (
        <div 
          key={child.id}
          className={`scared-child child-${child.id} ${isHealed ? 'healed' : ''}`}
          style={{
            position: 'absolute',
            ...positions[index],
            width: '80px',
            height: '80px',
            zIndex: 20
          }}
        >
          <DropZone
            id={`scared-child-${child.id}`}
            acceptTypes={['sun']}
            onDrop={handleChildHeal}
            disabled={isHealed}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%'
            }}
          >
            <img 
              src={isHealed ? child.happyFace : child.scaredFace}
              alt={`Child ${child.id}`}
              style={{ 
                width: '100%', 
                height: '100%',
                filter: isHealed ? 'brightness(1.3) saturate(1.2)' : 'brightness(0.8)',
                transition: 'all 0.5s ease',
                border: isHealed ? '3px solid #90EE90' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%'
              }}
            />
            
            {/* Healing sparkles when child is healed 
            {showSparkle === `child-${child.id}-healed` && (
              <SparkleAnimation
                type="star"
                count={15}
                color="#90EE90"
                size={10}
                duration={1500}
                fadeOut={true}
                area="full"
              />
            )}
          </DropZone>
        </div>
      );
    })}

  </div>
)}*/}
        
    

{/* Persistent Ganesha Orb - Visible throughout scene 
{(sceneState.collectedSuns >= 5 || sceneState.completed) && (
  <div className="persistent-ganesha-orb" style={{
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: '150px',
    height: '150px',
    zIndex: 15,
    opacity: sceneState.showingCompletionScreen ? 0.8 : 1,
    transition: 'opacity 0.5s ease'
  }}>
<img 
  src={orbGanesha}
  alt="Ganesha Orb"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }}
  className="persistent-ganesha-glow"
/>
  </div>
)}*/}

{/* Game 2: Simple Draggable Suns - NO CONNECTION TO GAME 1 */}
{(sceneState.phase === CAVE_PHASES.HEALING_INTRO || 
  sceneState.phase === CAVE_PHASES.HEALING_ACTIVE || 
  sceneState.phase === CAVE_PHASES.HEALING_COMPLETE ||
  sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING ||
  sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
  sceneState.phase === CAVE_PHASES.COMPLETE) && (
  
  <div className="healing-game-area">
    
    {/* Central Orb - Simple positioning */}
    <div className="central-healing-orb">
      <img 
        src={orbGanesha}
        alt="Healing Orb"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
    
    {/* 5 Simple Draggable Suns - Like ModakScene modaks */}
    {[1, 2, 3, 4, 5].map((sunIndex) => {
      const isUsed = sceneState.healedChildren?.includes(sunIndex);
      
      if (isUsed) return null;
      
      return (
        <div key={sunIndex} className={`healing-sun healing-sun-${sunIndex}`}>
          <DraggableItem
            id={`healing-sun-${sunIndex}`}
            data={{ type: 'sun', id: sunIndex }}
            onDragStart={(id, data) => console.log('Dragging sun:', id, data)}
            onDragEnd={(id) => console.log('Sun drag ended:', id)}
          >
            <img 
              src={sunImage}
              alt={`Healing Sun ${sunIndex}`}
              style={{ 
                width: '100%', 
                height: '100%',
                filter: 'brightness(1.2)',
                cursor: 'grab'
              }}
            />
          </DraggableItem>
        </div>
      );
    })}
    
{/* 5 Simple Drop Zone Children - CORRECTED MAPPING */}
{(() => {
  // Define explicit visual-to-logical mapping
  const childPositions = [
    { childId: 1, className: 'healing-child-1', position: 'top-left' },    // Index 0 = Child 1 = Top-left
    { childId: 2, className: 'healing-child-2', position: 'top-right' },   // Index 1 = Child 2 = Top-right  
    { childId: 3, className: 'healing-child-3', position: 'bottom-left' }, // Index 2 = Child 3 = Bottom-left
    { childId: 4, className: 'healing-child-4', position: 'bottom-right' },// Index 3 = Child 4 = Bottom-right
    { childId: 5, className: 'healing-child-5', position: 'top-center' }   // Index 4 = Child 5 = Top-center
  ];
  
  return childPositions.map((childConfig, arrayIndex) => {
    const childData = sceneState.childStates?.[arrayIndex]; // Use array index to get correct child data
    const isHealed = sceneState.healedChildren?.includes(childConfig.childId); // Use explicit childId
    
    console.log(`🧪 CHILD DEBUG:`, {
      position: childConfig.position,
      childId: childConfig.childId,
      arrayIndex: arrayIndex,
      isHealed: isHealed,
      healedChildren: sceneState.healedChildren
    });
    
    return (
      <div key={childConfig.childId} className={childConfig.className}>
        <DropZone
          id={`scared-child-${childConfig.childId}`} // Use explicit childId
          acceptTypes={['sun']}
          onDrop={handleChildHeal}
          disabled={isHealed}
        >
          <img 
            src={isHealed ? childData?.happyFace : childData?.scaredFace}
            alt={`Child ${childConfig.childId} (${childConfig.position})`}
            style={{ 
              width: '100%', 
              height: '100%',
              filter: isHealed ? 'brightness(1.3)' : 'brightness(0.8)',
              border: isHealed ? '3px solid #90EE90' : '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }}
          />
          
          {/* Debug overlay - remove after testing */}
          <div style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            background: 'rgba(255,0,0,0.3)',
            color: 'white',
            fontSize: '10px',
            padding: '2px',
            pointerEvents: 'none'
          }}>
            ID:{childConfig.childId}
          </div>
        </DropZone>
      </div>
    );
  });
})()}
    
  </div>
)}

<style>{`
  @keyframes gentleGlow {
    0%, 100% { 
      filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.8)) brightness(1.2);
    }
    50% { 
      filter: drop-shadow(0 0 35px rgba(255, 215, 0, 1)) brightness(1.4);
    }
  }
`}</style>

            {/* Sanskrit Sidebar */}
            {!sceneState.showingCompletionScreen && (

     <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={2}
              unlockedScenes={[1, 2]}
              mode="meanings"
              onWordClick={(wordId, wordData) => {
                console.log(`Sanskrit word clicked: ${wordId}`, wordData);
              }}
              highlightState={sceneState.sidebarHighlightState}
            />
            )}


<SymbolSceneIntegration
  show={showPopupBook}
  symbolImage={popupBookContent.symbolImage}
  title={popupBookContent.title}
  description={popupBookContent.description}
  sourceElement={currentSourceElement}
  onClose={handleSymbolInfoClose}
/>



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
            {showMagicalCard && (cardContent.title?.includes("Suryakoti") || cardContent.title?.includes("Samaprabha")) && (
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
  
  /* ✅ NEW: Fix draggable cursor offset */
  .central-orb-sun:active {
    cursor: grabbing;
  }
  
  .central-orb-sun img {
    pointer-events: none;
    user-select: none;
  }
  
  /* ✅ NEW: Ensure orb stays centered on all screen sizes */
  .central-healing-orb {
    min-width: 200px;
    min-height: 200px;
  }
  
  @keyframes centralOrbPulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
    }
    50% { 
      box-shadow: 0 0 40px rgba(218, 165, 32, 0.4);
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
                  console.log('🎯 Suryakoti fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'suryakoti-samaprabha', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { suryakoti: true, samaprabha: true },
                      learnedWords: sceneState.learnedWords || {},  // ← ADD THIS
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ SURYAKOTI: Completion saved and temp session cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Million Suns Chamber - Scene 2"
              sceneNumber={2}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['suryakoti', 'samaprabha'].filter(word =>
                sceneState.learnedWords?.[word]?.learned
              )}
              symbolImages={{
                suryakoti: suryakotiCard,
                samaprabha: samaprabhaCard
              }}
              nextSceneName="Sacred Cleansing Waters"
              sceneId="suryakoti-samaprabha"
              completionData={{
                stars: 8,
                  symbols: {},  // ← ADD: Empty symbols for Cave
                sanskritWords: { suryakoti: true, samaprabha: true },
                 learnedWords: sceneState.learnedWords || {},  // ← ADD: Scene learned words
  chants: { suryakoti: true, samaprabha: true },  // ← ADD: For CulturalProgressExtractor
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}

    // ADD THIS TO SceneCompletionCelebration:
onReplay={() => {
  console.log('🔄 Suryakoti Scene: Play Again requested');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    // Clear ALL storage
    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`);
    localStorage.removeItem(`replay_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`);
    localStorage.removeItem(`play_again_${profileId}_cave-of-secrets_suryakoti-samaprabha`);
    
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'suryakoti-samaprabha', false, false);
    console.log('🗑️ Suryakoti scene storage cleared');
  }
  
  // Force clean reload
  setTimeout(() => {
    window.location.reload();
  }, 100);
}}

        // ADD THIS TO SceneCompletionCelebration:
onContinue={() => {
  console.log('🔧 CONTINUE: Suryakoti scene to next scene');
  
  // 1. Clear GameCoach
  if (clearManualCloseTracking) clearManualCloseTracking();
  if (hideCoach) hideCoach();
  
  setTimeout(() => {
    if (clearManualCloseTracking) clearManualCloseTracking();
  }, 500);
  
  // 2. Save completion data - CHANT FORMAT
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'suryakoti-samaprabha', {
      completed: true,
      stars: 8,
      symbols: {},  // ← Cave scenes don't learn symbols
      sanskritWords: { suryakoti: true, samaprabha: true },
      learnedWords: sceneState.learnedWords || {},
      chants: { suryakoti: true, samaprabha: true }
    });
    
    GameStateManager.saveGameState('cave-of-secrets', 'suryakoti-samaprabha', {
      completed: true,
      stars: 8,
      sanskritWords: { suryakoti: true, samaprabha: true },
      learnedWords: sceneState.learnedWords || {}
    });
    
    console.log('✅ CONTINUE: Suryakoti completion data saved');
  }

  // 3. Set next scene for resume tracking
  setTimeout(() => {
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'nirvighnam-kurumedeva', false, false);
    console.log('✅ CONTINUE: Next scene (nirvighnam-kurumedeva) set for resume tracking');
    
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

export default SuryakotiScene;