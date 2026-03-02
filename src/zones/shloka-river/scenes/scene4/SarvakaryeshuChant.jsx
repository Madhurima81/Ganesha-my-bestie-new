// zones/shloka-river/scenes/Scene5/SarvakaryeshuChant.jsx - Scene 5 with Divine Games
import React, { useState, useEffect, useRef } from 'react';
import './SarvakaryeshuChant.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Import the actual game components
//import SarvakaryeshuGame from './components/SarvakaryeshuGame';
//import SarvadaGame from './components/SarvadaGame';

import SarvakaryeshuSarvadaGame from './components/SarvakaryeshuSarvadaGame';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';

// Background Images
import sarvakaryeshuBg from './assets/images/sarvakaryeshu-bg.png';
import sarvadaBg from './assets/images/sarvada-bg.png';

// Sarvakaryeshu game assets - Animals, Items, Decorations  
import sarSquirrelHappy from './assets/images/sarvakaryeshu/sar-squirrel-happy.png';
import sarSquirrelHelper from './assets/images/sarvakaryeshu/sar-squirrel-helper.png';
import sarSquirrelSad from './assets/images/sarvakaryeshu/sar-squirrel-sad.png';
import vaBirdHappy from './assets/images/sarvakaryeshu/va-bird-happy.png';
import vaBirdHelper from './assets/images/sarvakaryeshu/va-bird-helper.png';
import vaBirdSad from './assets/images/sarvakaryeshu/va-bird-sad.png';
import karDuckHappy from './assets/images/sarvakaryeshu/kar-duck-happy.png';
import karDuckHelper from './assets/images/sarvakaryeshu/kar-duck-helper.png';
import karDuckSad from './assets/images/sarvakaryeshu/kar-duck-sad.png';
import yeshuRabbitHappy from './assets/images/sarvakaryeshu/yeshu-rabbit-happy.png';
import yeshuRabbitHelper from './assets/images/sarvakaryeshu/yeshu-rabbit-helper.png';
import yeshuRabbitSad from './assets/images/sarvakaryeshu/yeshu-rabbit-sad.png';

// Sarvada game assets - Animals, Items, Decorations
import savButterflyHappy from './assets/images/sarvada/sav-butterfly-happy.png';
import savButterflyHelper from './assets/images/sarvada/sav-butterfly-helper.png';
import savButterflySad from './assets/images/sarvada/sav-butterfly-sad.png';
import vaFawnHappy from './assets/images/sarvada/va-fawn-happy.png';
import vaFawnHelper from './assets/images/sarvada/va-fawn-helper.png';
import vaFawnSad from './assets/images/sarvada/va-fawn-sad.png';
import daHedgehogHappy from './assets/images/sarvada/da-hedgehog-happy.png';
import daHedgehogHelper from './assets/images/sarvada/da-hedgehog-helper.png';
import daHedgehogSad from './assets/images/sarvada/da-hedgehog-sad.png';

// Shared assets
import ganeshaWithHeadphones from '../assets/images/ganesha_with_headphones.png';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';
import appNirvighnam from '../assets/images/apps/app-nirvighnam.png';
import appKurumedeva from '../assets/images/apps/app-kurumedeva.png';
import appSarvakaryeshu from '../assets/images/apps/app-sarvakaryeshu.png';
import appSarvada from '../assets/images/apps/app-sarvada.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import sarvakaryeshuBefore from './assets/images/sarvakaryeshu/sarvakaryeshu-before.png';
import sarvakaryeshuAfter from './assets/images/sarvakaryeshu/sarvakaryeshu-after.png';
import sarvadaBefore from './assets/images/sarvada/sarvada-before.png'; 
import sarvadaAfter from './assets/images/sarvada/sarvada-after.png';

// Updated PHASES constant for Scene 5
const PHASES = {
  INITIAL: 'initial',
  SARVAKARYESHU_GAME_ACTIVE: 'sarvakaryeshu_game_active',
  SARVAKARYESHU_COMPLETE: 'sarvakaryeshu_complete',
  GANESHA_BLESSING_SARVAKARYESHU: 'ganesha_blessing_sarvakaryeshu',
  CHOICE_BUTTONS_SARVAKARYESHU: 'choice_buttons_sarvakaryeshu',
  RESCUE_MISSION_SARVAKARYESHU: 'rescue_mission_sarvakaryeshu',
  SARVADA_STORY: 'sarvada_story',
  SARVADA_GAME_ACTIVE: 'sarvada_game_active',
  SARVADA_COMPLETE: 'sarvada_complete',
  GANESHA_BLESSING_SARVADA: 'ganesha_blessing_sarvada',
  CHOICE_BUTTONS_SARVADA: 'choice_buttons_sarvada',
  RESCUE_MISSION_SARVADA: 'rescue_mission_sarvada',
  SCENE_COMPLETE: 'scene_complete'
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

const SarvakaryeshuChant = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'sarvakaryeshu-chant'
}) => {
  console.log('SarvakaryeshuChant props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Simplified state - memory games handle their own logic
          phase: PHASES.INITIAL,
          
          // Learning progress (for progress tracking)
          learnedSyllables: {
            sar: false, va: false, kar: false, yeshu: false, // Sarvakaryeshu
            da: false // Sarvada
          },
          learnedWords: {
            sarvakaryeshu: false,
            sarvada: false
          },

          unlockedApps: {},
          
          // UNIFIED: Combined state for both games
    combinedGameState: null,
          missionState: {
            rescuePhase: 'problem',
            showParticles: false,
            word: null,
            missionJustCompleted: false
          },
          
          // Message flags
          welcomeShown: false,
          sarvakaryeshuWisdomShown: false,
          sarvadaWisdomShown: false,
          
          // System state
          currentPopup: null,
          showingCompletionScreen: false,
          gameCoachState: null,
          isReloadingGameCoach: false,
          
          // Progress
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <SarvakaryeshuChantContent
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

const SarvakaryeshuChantContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('ðŸŽ¨ SarvakaryeshuChantContent render', { 
    sceneState: sceneState?.phase, 
    isReload, 
    sarvakaryeshuGameState: !!sceneState?.sarvakaryeshuGameState,
    sarvadaGameState: !!sceneState?.sarvadaGameState,
    missionState: sceneState?.missionState 
  });

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  // Access GameCoach functionality
  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  
  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);

  // Get profile name for messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const [showRecording, setShowRecording] = useState(false);
  const [currentRecordingWord, setCurrentRecordingWord] = useState('');
  const [showAudioTracker, setShowAudioTracker] = useState(true);

  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  const [showGaneshaBlessing, setShowGaneshaBlessing] = useState(false);
  const [showAudioPractice, setShowAudioPractice] = useState(false);
  const [currentPracticeWord, setCurrentPracticeWord] = useState('');
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);
  const [unlockedApps, setUnlockedApps] = useState([]);
  
  const [blessingPhase, setBlessingPhase] = useState('welcome');
  const [showParticles, setShowParticles] = useState(false);
  const [showPulseRings, setShowPulseRings] = useState(false);

  const [sarvakaryeshuPowerGained, setSarvakaryeshuPowerGained] = useState(false);
  const [showCenteredApp, setShowCenteredApp] = useState(null);
  const [blessingWord, setBlessingWord] = useState('');

  // UNIFIED: Single state for rescue mission
  const [showRescueMission, setShowRescueMission] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState('');
  const [showWordCelebration, setShowWordCelebration] = useState(false);

  const [showSarvadaStory, setShowSarvadaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

     const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
  const [rescuePhase, setRescuePhase] = useState('problem');

  // Add power configuration for Scene 5
  const powerConfig = {
    sarvakaryeshu: { name: 'Divine Action', icon: 'âœ¨', color: '#FFD700' },
    sarvada: { name: 'Eternal Blessing', icon: 'ðŸŒŸ', color: '#4B0082' }
  };

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const playAudio = (audioPath, volume = 1.0) => {
    if (!isAudioOn) return Promise.resolve();
    
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      return audio.play().catch(e => {
        console.log(`Audio not found: ${audioPath}`);
        return Promise.resolve();
      });
    } catch (error) {
      console.log(`Audio error: ${error.message}`);
      return Promise.resolve();
    }
  };

  // Add this reusable resetScene function inside your SarvakaryeshuChantContent component
const resetScene = (showConfirm = true) => {
  if (showConfirm && !confirm('Start this scene from the beginning? You will lose current progress.')) {
    return;
  }

  console.log('ðŸ”¥ Sarvakaryeshu Scene reset: User chose to start fresh');
  
  // STEP 1: Set force reset flag for the combined game component
  if (window.sarvakaryeshuSarvadaGame) {
    window.sarvakaryeshuSarvadaGame.isForceReset = true;
  }
  
  // STEP 2: Clear all timeouts first to prevent conflicts
  timeoutsRef.current.forEach(id => clearTimeout(id));
  timeoutsRef.current = [];
  
  // STEP 3: Clear ALL local React state variables immediately
  setShowSparkle(null);
  setShowRecording(false);
  setShowSceneCompletion(false);
  setCurrentRecordingWord('');
  setShowAudioTracker(true);
  
  // Clear Ganesha-related states
  setShowGaneshaBlessing(false);
  setBlessingPhase('welcome');
  setCurrentPracticeWord('');
  setShowChoiceButtons(false);
  setShowAudioPractice(false);
  setBlessingWord('');
  
  // Clear power and blessing states
  setShowParticles(false);
  setShowPulseRings(false);
  setShowCenteredApp(null);
  setUnlockedApps([]);
  setSarvakaryeshuPowerGained(false);
  
  // Clear rescue mission states
  setShowRescueMission(false);
  setCurrentRescueWord('');
  setShowWordCelebration(false);
  
  // Clear story and transition states
  setShowSarvadaStory(false);
  setIsTransitioning(false);
  
  // Clear hint states
  setHintUsed(false);
  if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
    progressiveHintRef.current.hideHint();
  }
  
  // STEP 4: Hide GameCoach immediately
  if (hideCoach) hideCoach();
  if (clearManualCloseTracking) clearManualCloseTracking();
  
  // STEP 5: Clear combined game completion state
  if (window.sarvakaryeshuSarvadaGame && window.sarvakaryeshuSarvadaGame.clearCompletionState) {
    window.sarvakaryeshuSarvadaGame.clearCompletionState();
  }
  
  // STEP 6: Force combined game reset
  const forceCombinedGameReset = () => {
    if (window.sarvakaryeshuSarvadaGame) {
      window.sarvakaryeshuSarvadaGame.visualRewards = {};
      window.sarvakaryeshuSarvadaGame.activatedSingers = {};
      window.sarvakaryeshuSarvadaGame.isForceReset = true;
    }
  };
  
  forceCombinedGameReset();
  
  // STEP 7: Reset scene state
  setTimeout(() => {
    sceneActions.updateState({
      // Reset syllable learning progress for Sarvakaryeshu + Sarvada
      learnedSyllables: {
        sar: false, va: false, kar: false, yeshu: false, // Sarvakaryeshu
        da: false // Sarvada
      },
      
      // Reset word learning progress
      learnedWords: {
        sarvakaryeshu: false,
        sarvada: false
      },

      // Clear game states
      combinedGameState: null,
      unlockedApps: {},
      
      // Reset mission state
      missionState: {
        rescuePhase: 'problem',
        showParticles: false,
        word: null,
        missionJustCompleted: false
      },
      
      // Reset phase to beginning
      phase: PHASES.INITIAL,
      
      // Reset message flags
      welcomeShown: false,
      sarvakaryeshuWisdomShown: false,
      sarvadaWisdomShown: false,
      
      // Clear system state
      currentPopup: null,
      showingCompletionScreen: false,
      gameCoachState: null,
      isReloadingGameCoach: false,
      
      // Reset progress
      stars: 0,
      completed: false,
      progress: { percentage: 0, starsEarned: 0, completed: false }
    });
    
    // Clear the force reset flag after a delay
    setTimeout(() => {
      if (window.sarvakaryeshuSarvadaGame) {
        window.sarvakaryeshuSarvadaGame.isForceReset = false;
      }
    }, 1000);
    
    console.log('âœ… Sarvakaryeshu scene state reset complete');
  }, 150);
};

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    
    // Save preference to localStorage
    localStorage.setItem('sanskritGameAudio', newAudioState.toString());
    
    // Stop all currently playing audio if muting
    if (!newAudioState) {
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
    
    console.log(`Audio ${newAudioState ? 'enabled' : 'muted'}`);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Load audio preference on component mount
  useEffect(() => {
    const savedAudioPreference = localStorage.getItem('sanskritGameAudio');
    if (savedAudioPreference !== null) {
      setIsAudioOn(savedAudioPreference === 'true');
    }
  }, []);

const handleSaveComponentState = (componentType, componentState) => {
  console.log(`ðŸ’¾ Saving ${componentType} state:`, componentState);
  
  if (handleSaveComponentState.lastCall && 
      Date.now() - handleSaveComponentState.lastCall < 100) {
    console.log('ðŸš« Debounced duplicate save call');
    return;
  }
  handleSaveComponentState.lastCall = Date.now();
  
  const updatedState = {
    ...(componentType === 'combinedGame' && { combinedGameState: componentState }),
    ...(componentType === 'mission' && { 
      missionState: {
        ...sceneState.missionState,
        ...componentState
      }
    })
  };
  
  console.log(`âš¡ Updating scene state with ${componentType}:`, updatedState);
  sceneActions.updateState(updatedState);
};

useEffect(() => {
  window.sarvakaryeshuSarvadaGame = {};
  return () => {
    if (window.sarvakaryeshuSarvadaGame) {
      delete window.sarvakaryeshuSarvadaGame;
    }
  };
}, []);

  // Set up communication for the scene itself
  useEffect(() => {
    window.sarvakaryeshuChant = {
      showSarvadaStory: () => {
        setShowSarvadaStory(true);
      }
    };
    
    return () => {
      if (window.sarvakaryeshuChant) {
        delete window.sarvakaryeshuChant;
      }
    };
  }, []);

useEffect(() => {
  if (sarvakaryeshuPowerGained && 
      window.sarvakaryeshuSarvadaGame?.startSarvadaPhase) {
    window.sarvakaryeshuSarvadaGame.startSarvadaPhase();
  }
}, [sarvakaryeshuPowerGained]);

  // Master Restorer for the SarvakaryeshuChant scene
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('ðŸ”„ SARVAKARYESHU RELOAD: Starting reload', {
      phase: sceneState.phase,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed
    });

    // Handle "Play Again" requests
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    if (playAgainRequested === 'true') {
      console.log('ðŸ”„ SARVAKARYESHU: Fresh restart after Play Again');
      localStorage.removeItem(playAgainKey);
      sceneActions.updateState({ 
        phase: PHASES.INITIAL,
        showingCompletionScreen: false,
        completed: false,
        stars: 0,
        welcomeShown: false,
    combinedGameState: null,
      });
      return;
    }

    // Handle completion screen reload
    if (sceneState.showingCompletionScreen) {
      console.log('ðŸ”„ SARVAKARYESHU: Resuming completion screen');
      setShowSceneCompletion(true);
      return;
    }

    // Phase-specific reload logic
    switch (sceneState.phase) {
      case PHASES.INITIAL:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming initial welcome');
        break;
        
      case PHASES.SARVAKARYESHU_GAME_ACTIVE:
        console.log('ðŸ”„ SARVAKARYESHU: Sarvakaryeshu game active - letting component handle itself');
        break;

      case PHASES.SARVADA_GAME_ACTIVE:
        console.log('ðŸ”„ SARVAKARYESHU: Sarvada game active - letting component handle itself');
        setSarvakaryeshuPowerGained(true);
        break;
        
      case PHASES.SARVAKARYESHU_COMPLETE:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming Sarvakaryeshu completion celebration');
        setBlessingWord('sarvakaryeshu');
        setCurrentPracticeWord('sarvakaryeshu');
        setShowWordCelebration(true);
        setShowSparkle('sarvakaryeshu-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_SARVAKARYESHU
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.SARVADA_COMPLETE:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming Sarvada completion celebration');
        setBlessingWord('sarvada');
        setCurrentPracticeWord('sarvada');
        setShowWordCelebration(true);
        setShowSparkle('sarvada-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_SARVADA
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.GANESHA_BLESSING_SARVAKARYESHU:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming Ganesha blessing for Sarvakaryeshu');
        setBlessingWord('sarvakaryeshu');
        setCurrentPracticeWord('sarvakaryeshu');
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;

      case PHASES.GANESHA_BLESSING_SARVADA:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming Ganesha blessing for Sarvada');
        setBlessingWord('sarvada');
        setCurrentPracticeWord('sarvada');
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;
        
      case PHASES.CHOICE_BUTTONS_SARVAKARYESHU:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming choice buttons for Sarvakaryeshu');
        setCurrentPracticeWord('sarvakaryeshu');
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowSarvadaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');
        setShowChoiceButtons(true);
        break;
        
      case PHASES.CHOICE_BUTTONS_SARVADA:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming choice buttons for Sarvada');
        setCurrentPracticeWord('sarvada');
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowSarvadaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');
        setShowChoiceButtons(true);
        break;
        
      case PHASES.RESCUE_MISSION_SARVAKARYESHU:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming rescue mission for Sarvakaryeshu');
        setCurrentRescueWord('sarvakaryeshu');
        setShowRescueMission(true);
        break;
        
      case PHASES.SARVADA_STORY:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming Sarvada story');
        setSarvakaryeshuPowerGained(true);
        setShowSarvadaStory(true);
        break;
        
      case PHASES.RESCUE_MISSION_SARVADA:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming rescue mission for Sarvada');
        setCurrentRescueWord('sarvada');
        setSarvakaryeshuPowerGained(true);
        setShowRescueMission(true);
        break;
        
      case PHASES.SCENE_COMPLETE:
        console.log('ðŸ”„ SARVAKARYESHU: Resuming scene complete');
        if (!sceneState.showingCompletionScreen) {
          setTimeout(() => {
            setShowSparkle('final-fireworks');
          }, 500);
        }
        break;
        
      default:
        console.log('ðŸ”„ SARVAKARYESHU: No specific reload needed for phase:', sceneState.phase);
    }
  }, [isReload]);

/*const getSarvakaryeshuAnimalImage = (index) => {
  const images = [sarSquirrelHelper, vaBirdHelper, karDuckHelper, yeshuRabbitHelper];
  return images[index];
};

const getSarvakaryeshuItemImage = (index, singing) => {
  const images = [sarSquirrelSad, vaBirdSad, karDuckSad, yeshuRabbitSad];
  return images[index];
};

const getSarvakaryeshuDecorImage = (index, activated) => {
  const images = [sarSquirrelHappy, vaBirdHappy, karDuckHappy, yeshuRabbitHappy];
  return images[index];
};

const getSarvadaAnimalImage = (index) => {
  const images = [savButterflyHelper, vaFawnHelper, daHedgehogHelper];
  return images[index];
};

const getSarvadaItemImage = (index, singing) => {
  const images = [savButterflySad, vaFawnSad, daHedgehogSad];
  return images[index];
};

const getSarvadaDecorImage = (index, activated) => {
  const images = [savButterflyHappy, vaFawnHappy, daHedgehogHappy];
  return images[index];
};*/

  const handleSaveAnimal = () => {
    console.log('ðŸ˜ RESCUE MISSION: Starting divine animal rescue');
    
    setShowChoiceButtons(false);
    setCurrentRescueWord(currentPracticeWord || blessingWord);
    
    const word = currentPracticeWord || blessingWord;

    // Update the scene phase to the correct rescue mission
    sceneActions.updateState({
      phase: word === 'sarvakaryeshu'
        ? PHASES.RESCUE_MISSION_SARVAKARYESHU
        : PHASES.RESCUE_MISSION_SARVADA
    });
    
    handleSaveComponentState('mission', {
      rescuePhase: 'problem',
      word: word,
      showParticles: false
    });
    
    setShowRescueMission(true);
  };

  const handleRoundJump = (round) => {
    console.log(`Jumping to round ${round} in main scene`);
    sceneActions.updateState({
      currentRound: round
    });
  };

  const handleRescueComplete = () => {
    console.log('âœ… Rescue complete for:', currentRescueWord);
    
    handleSaveComponentState('mission', {
      rescuePhase: 'success',
      word: currentRescueWord,
      missionJustCompleted: true
    });
    
    setShowRescueMission(false);
    
    if (currentRescueWord === 'sarvakaryeshu') {
      console.log('Sarvakaryeshu rescue complete - showing Sarvada story now');
      
      setShowChoiceButtons(false);
      setShowGaneshaBlessing(false);
      setSarvakaryeshuPowerGained(true);
      
      sceneActions.updateState({
        phase: PHASES.SARVADA_STORY
      });
      
      setTimeout(() => {
        setShowSarvadaStory(true);
      }, 500);
      
    } else if (currentRescueWord === 'sarvada') {
      console.log('Sarvada rescue complete - FINAL FIREWORKS NOW!');
      
      setShowChoiceButtons(false);
      setShowGaneshaBlessing(false);
      
      sceneActions.updateState({
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      setTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 500);
    }
  };

  const handlePhaseComplete = (phase) => {
    console.log(`Phase ${phase} completed!`);
    
    if (phase === 'sarvakaryeshu') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, sarvakaryeshu: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          sar: true, va: true, kar: true, yeshu: true 
        },
        phase: PHASES.SARVAKARYESHU_COMPLETE,
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      setBlessingWord('sarvakaryeshu');
      setCurrentPracticeWord('sarvakaryeshu');
      setShowSparkle('sarvakaryeshu-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SARVAKARYESHU
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      
    } else if (phase === 'sarvada') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, sarvada: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          sar: true, va: true, da: true
        },
        phase: PHASES.SARVADA_COMPLETE,
        progress: { percentage: 90, starsEarned: 4 }
      });

      setSarvakaryeshuPowerGained(true);
      setBlessingWord('sarvada');
      setCurrentPracticeWord('sarvada');
      setShowSparkle('sarvada-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SARVADA
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
    }
  };

  const handleGaneshaRecord = () => {
    setCurrentRecordingWord(currentPracticeWord);
    setShowRecording(true);
  };

  const handleGaneshaSkip = () => {
    startBlessingAnimation();
  };

  const startBlessingSequence = async () => {
    try {
      setBlessingPhase('welcome');
      await new Promise(resolve => safeSetTimeout(resolve, 2000));

      setBlessingPhase('blessing');
      await new Promise(resolve => safeSetTimeout(resolve, 3000));

      setBlessingPhase('transfer');
      setShowParticles(true);
      await new Promise(resolve => safeSetTimeout(resolve, 4000));
      setShowParticles(false);

      setBlessingPhase('recording');
      setShowPulseRings(true);
      setShowGaneshaBlessing(false);
      setCurrentRecordingWord(currentPracticeWord);
      setShowRecording(true);

    } catch (error) {
      console.error('Blessing sequence error:', error);
      setShowGaneshaBlessing(false);
      setCurrentRecordingWord(currentPracticeWord);
      setShowRecording(true);
    }
  };

  const handlePowerTransfer = (word) => {
    setUnlockedApps(prev => [...prev, word]);
    setShowChoiceButtons(true);
    setShowSparkle(`${word}-power-gained`);
    setTimeout(() => setShowSparkle(null), 2000);
  };

  const handleContinueLearning = () => {
    console.log('Continue Learning clicked for:', currentPracticeWord);
    
    setShowChoiceButtons(false);
    
    if (currentPracticeWord === 'sarvakaryeshu') {
      console.log('Sarvakaryeshu continue - showing Sarvada story now');
      
      setIsTransitioning(true);
      setShowGaneshaBlessing(false);
      setShowSparkle(null);
      setShowWordCelebration(false);
      setSarvakaryeshuPowerGained(true);
      
      sceneActions.updateState({
        phase: PHASES.SARVADA_STORY,
        sarvakaryeshuGameState: null 
      });
      
      setTimeout(() => {
        setIsTransitioning(false);
        setShowSarvadaStory(true);
      }, 100);
      
    } else if (currentPracticeWord === 'sarvada') {
      console.log('Sarvada continue - ending scene');
      
      sceneActions.updateState({
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      setTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 500);
    }
  };

  const handleAppClick = (appType) => {
    setCurrentPracticeWord(appType);
    setShowAudioPractice(true);
  };

  const handleAudioPracticeClose = () => {
    setShowAudioPractice(false);
  };

  const handleGameComplete = () => {
    console.log('Memory game complete! Both words learned.');
  };

  // Plays the correct audio for syllables
  const handleSyllablePlay = (syllable) => {
    if (!isAudioOn) return;
    
    const syllableFileMap = {
      // Syllables for Sarvakaryeshu
      'sar': 'sarvakaryeshu-sar',
      'va': 'sarvakaryeshu-va', 
      'kar': 'sarvakaryeshu-ka',
      'yeshu': 'sarvakaryeshu-shu',

      // Syllables for Sarvada
      'da': 'sarvada-da'
    };
    
    const fileName = syllableFileMap[syllable.toLowerCase()] || syllable;
    playAudio(`/audio/syllables/${fileName}.mp3`);
  };

  // Plays the correct audio for words
  const handleWordPlay = (word) => {
    if (!isAudioOn) return;
    playAudio(`/audio/words/${word}.mp3`);
  };

  const startPracticeRound = (word, round) => {
    console.log(`Starting practice: ${word} round ${round}`);
    
    if (window.sanskritMemoryGame && window.sanskritMemoryGame.startPracticeMode) {
      window.sanskritMemoryGame.startPracticeMode(word, round);
    }
    
    sceneActions.updateState({
      phase: PHASES.MEMORY_GAME_ACTIVE,
      currentPopup: null
    });
  };

  // GET CURRENT BACKGROUND FUNCTION
  const getCurrentBackground = () => {
    const shouldUseSarvadaBg = sarvakaryeshuPowerGained || 
                              sceneState.phase === PHASES.SARVADA_STORY ||
                              sceneState.phase === PHASES.SARVADA_GAME_ACTIVE ||
                              sceneState.phase === PHASES.SARVADA_COMPLETE ||
                              sceneState.phase === PHASES.GANESHA_BLESSING_SARVADA ||
                              sceneState.phase === PHASES.CHOICE_BUTTONS_SARVADA ||
                              sceneState.phase === PHASES.RESCUE_MISSION_SARVADA ||
                              sceneState.learnedWords?.sarvakaryeshu;
    
    return shouldUseSarvadaBg ? sarvadaBg : sarvakaryeshuBg;
  };

  const getHintConfigs = () => [
    {
      id: 'sequence-listening-hint',
      message: 'Listen to the divine items singing their sacred syllables!',
      explicitMessage: 'Wait for the sequence to finish, then click the animals in the same order to create divine decorations!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
  return sceneState?.combinedGameState?.gamePhase === 'playing';
      }
    },
    {
      id: 'animal-clicking-hint', 
      message: 'Click the animals to activate divine decorations!',
      explicitMessage: 'Click the animals in the order you heard: sar-va-kar-yeshu!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.sarvakaryeshuGameState?.gamePhase === 'animal_clicking' && !showRecording;
      }
    },
    {
      id: 'recording-hint',
      message: 'Try chanting the divine word you just learned!',
      explicitMessage: 'Listen to the syllables first, then record yourself saying the complete word!',
      position: { bottom: '30%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return showRecording === true;
      }
    }
  ];

  // Auto-start memory game after welcome
  useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown) {
      console.log('Starting Sarvakaryeshu memory game');
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.SARVAKARYESHU_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // Progress counter for syllables
  const renderProgressCounter = () => {
    const totalSyllables = 7; // 4 + 3 syllables
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        <div className="counter-icon">âœ¨</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{
              width: `${(learnedCount / totalSyllables) * 100}%`,
              background: `linear-gradient(90deg, #FFD700 0%, #FF8C00 50%, #4B0082 100%)`
            }}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
        <div className="counter-label">Divine Sounds</div>
      </div>
    );
  };

  const handleRecordingComplete = (recordingData) => {
    console.log('Recording completed:', recordingData);
    setShowRecording(false);
    setShowPulseRings(false);
    setBlessingPhase('complete');
    
    safeSetTimeout(() => {
      continueAfterRecording();
    }, 2000);
  };

  const handleRecordingSkip = () => {
    console.log('User skipped recording');
    setShowRecording(false);
    continueAfterRecording();
  };

  const continueAfterRecording = () => {
    if (currentRecordingWord === 'sarvakaryeshu') {
      console.log('=== CALLING startBlessingAnimation for sarvakaryeshu ===');
      startBlessingAnimation();
      
    } else if (currentRecordingWord === 'sarvada') {
      console.log('=== CALLING startBlessingAnimation for sarvada ===');
      startBlessingAnimation();
    }
  };

  // Updated startBlessingAnimation function
  const startBlessingAnimation = async () => {
    try {
      console.log('=== BLESSING ANIMATION START ===');
      
      const wordToProcess = blessingWord || currentPracticeWord;
      if (!wordToProcess) {
        console.error('No word to process in blessing animation!');
        return;
      }
      
      setBlessingPhase('transfer');
      setShowParticles(true);
      await new Promise(resolve => safeSetTimeout(resolve, 4000));
      setShowParticles(false);

      await new Promise(resolve => safeSetTimeout(resolve, 2000));

      setShowCenteredApp(wordToProcess);
      
      for (let i = 1; i <= 4; i++) {
        await new Promise(resolve => safeSetTimeout(resolve, 1000));
      }

      setShowCenteredApp(null);
      
  sceneActions.updateState({
  unlockedApps: {
    ...sceneState.unlockedApps,
    [wordToProcess]: true  // suryakoti OR samaprabha (one at a time)
  }
});

      await new Promise(resolve => safeSetTimeout(resolve, 1000));

      setShowGaneshaBlessing(false);
      setShowChoiceButtons(true);
      setBlessingPhase('complete');
      
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'sarvakaryeshu'
          ? PHASES.CHOICE_BUTTONS_SARVAKARYESHU
          : PHASES.CHOICE_BUTTONS_SARVADA
      });

    } catch (error) {
      console.error('Blessing animation error:', error);
      setShowGaneshaBlessing(false);
      setShowChoiceButtons(true);
      setBlessingPhase('complete');
      
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'sarvakaryeshu'
          ? PHASES.CHOICE_BUTTONS_SARVAKARYESHU
          : PHASES.CHOICE_BUTTONS_SARVADA
      });
    }
  };

  const getSyllableState = (syllable) => {
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    const currentWord = sceneState.learnedWords?.sarvakaryeshu ? 'sarvada' : 'sarvakaryeshu';
    
    const phaseSyllables = currentWord === 'sarvakaryeshu'
      ? ['sar', 'va', 'kar', 'yeshu']
      : ['sar', 'va', 'da'];
    
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';
    return 'locked';
  };

const combinedGameReloadProps = sceneState.combinedGameState ? {
  isReload: isReload,
  initialGamePhase: sceneState.combinedGameState.gamePhase || 'waiting',
  initialCurrentPhase: sceneState.combinedGameState.currentPhase || 'sarvada',
  initialCurrentRound: sceneState.combinedGameState.currentRound || 1,
  initialPlayerInput: sceneState.combinedGameState.playerInput || [],
  initialCurrentSequence: sceneState.combinedGameState.currentSequence || [],
  initialVisualRewards: sceneState.combinedGameState.visualRewards || {},
  initialActivatedSingers: sceneState.combinedGameState.activatedSingers || {},
} : {};

  const missionReloadProps = sceneState.missionState ? {
    isReload: isReload && !!sceneState.missionState.word,
    initialRescuePhase: sceneState.missionState.rescuePhase || 'problem',
    initialShowParticles: sceneState.missionState.showParticles || false,
    missionJustCompleted: sceneState.missionState.missionJustCompleted || false,
  } : {};

  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  const handleHintShown = (level) => {
    console.log(`Divine hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Divine hint button clicked");
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>

        
        <div className="sarvakaryeshu-chant-container">

          <div 
            className="river-background" 
            style={{
              backgroundImage: `url(${getCurrentBackground()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat'
            }}
          >

<SarvakaryeshuSarvadaGame
  isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE || 
           sceneState.phase === PHASES.SARVADA_GAME_ACTIVE ||
           sceneState.phase === PHASES.SARVAKARYESHU_COMPLETE ||
           sceneState.phase === PHASES.SARVADA_COMPLETE}
  hideElements={isTransitioning || 
    showGaneshaBlessing || showSarvadaStory || 
    sceneState.phase === PHASES.SARVAKARYESHU_COMPLETE || 
    sceneState.phase === PHASES.SARVADA_COMPLETE ||
    sceneState.phase === PHASES.SCENE_COMPLETE}
  onPhaseComplete={handlePhaseComplete}
  onGameComplete={handleGameComplete}
  
  // Phase 1 - Sarvakaryeshu assets
  getSarSquirrelHelperImage={() => sarSquirrelHelper}
  getVaBirdHelperImage={() => vaBirdHelper}
  getKarDuckHelperImage={() => karDuckHelper}
  getYeshuRabbitHelperImage={() => yeshuRabbitHelper}
  getSarSquirrelSadImage={() => sarSquirrelSad}
  getVaBirdSadImage={() => vaBirdSad}
  getKarDuckSadImage={() => karDuckSad}
  getYeshuRabbitSadImage={() => yeshuRabbitSad}
  getSarSquirrelHappyImage={() => sarSquirrelHappy}
  getVaBirdHappyImage={() => vaBirdHappy}
  getKarDuckHappyImage={() => karDuckHappy}
  getYeshuRabbitHappyImage={() => yeshuRabbitHappy}
  
  // Phase 2 - Sarvada assets  
  getSavButterflyHelperImage={() => savButterflyHelper}
  getVaFawnHelperImage={() => vaFawnHelper}
  getDaHedgehogHelperImage={() => daHedgehogHelper}
  getSavButterflySadImage={() => savButterflySad}
  getVaFawnSadImage={() => vaFawnSad}
  getDaHedgehogSadImage={() => daHedgehogSad}
  getSavButterflyHappyImage={() => savButterflyHappy}
  getVaFawnHappyImage={() => vaFawnHappy}
  getDaHedgehogHappyImage={() => daHedgehogHappy}
  
  isAudioOn={isAudioOn}
  playAudio={playAudio}
  onSaveGameState={(gameState) => handleSaveComponentState('combinedGame', gameState)}
  powerGained={sarvakaryeshuPowerGained}
  {...combinedGameReloadProps}
/>

            {/* Story Introduction - Show immediately when scene starts */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
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
                  color: '#FFD700',
                  marginBottom: '10px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  The Divine Action Hall
                </div>
                
                <div style={{
                  fontSize: '15px',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  Help the animals create divine decorations for all sacred actions
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  Listen to the divine items, then click animals to activate beautiful decorations
                </div>
                
                <button
                  onClick={() => {
                    sceneActions.updateState({ 
                      welcomeShown: true,
                      phase: PHASES.SARVAKARYESHU_GAME_ACTIVE 
                    });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  Begin Divine Decoration
                </button>
              </div>
            )}

            {/* Sarvada Story Introduction */}
            {showSarvadaStory && (
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
                  color: '#4B0082',
                  marginBottom: '10px'
                }}>
                  The Eternal Blessing Chamber
                </div>
                
                <div style={{
                  fontSize: '15px',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  The final blessing awaits you!
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  Use your Divine Action power to create the ultimate eternal blessing.
                </div>              
                
                <button
                  onClick={() => {
                    console.log('Begin Eternal Blessing clicked - starting Sarvada properly');
                    
                    setIsTransitioning(true);
                    setShowSarvadaStory(false);
                    
                    setTimeout(() => {
                      sceneActions.updateState({ 
                        phase: PHASES.SARVADA_GAME_ACTIVE,
                        currentPopup: null,
                        sarvakaryeshuGameState: null  // Clear old state
                      });

                      setTimeout(() => {
if (window.sarvakaryeshuSarvadaGame?.startSarvadaPhase) {
  window.sarvakaryeshuSarvadaGame.startSarvadaPhase();
  }
}, 200);
                      
                      setTimeout(() => {
                        setIsTransitioning(false);
                      }, 400);
                      
                    }, 100);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #4B0082 0%, #FF69B4 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer'
                  }}
                >
                  Create Eternal Blessing
                </button>
              </div>
            )}

            {/* Sanskrit Voice Recorder */}
            <SanskritVoiceRecorder
              chantResult={null}
              show={showRecording}
              prompt="Try chanting"
              word={currentRecordingWord}
              title="Practice Your Sanskrit"
              theme="sanskrit"
              allowSkip={true}
              maxRecordingTime={10}
              onComplete={handleRecordingComplete}
              onSkip={handleRecordingSkip}
            />

            {/* Centered App Display */}
            {showCenteredApp && (
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                animation: 'appGlow 2s ease-in-out infinite alternate'
              }}>
                <img 
                  src={showCenteredApp === 'sarvakaryeshu' ? appSarvakaryeshu : appSarvada}
                  alt={`${showCenteredApp} app`}
                  style={{
                    width: '120px',
                    height: '120px',
                    filter: 'drop-shadow(0 0 30px #FFD700)',
                    borderRadius: '20px'
                  }}
                />
              </div>
            )}

<AppSidebar 
  unlockedApps={{
    vakratunda: true,      // From Scene 1
    mahakaya: true,        // From Scene 1
    suryakoti: true,       // From Scene 2
    samaprabha: true,      // From Scene 2
    nirvighnam: true,      // From Scene 3
    kurumedeva: true,      // From Scene 3
    ...(sceneState.unlockedApps || {})  // sarvakaryeshu, sarvada
  }}
  onAppClick={(app) => {
    setCurrentPracticeWord(app.id);
    setShowAudioPractice(true);
  }}
  isReload={isReload}
  onSaveAppState={(appState) => {
    sceneActions.updateState({ unlockedApps: appState });
  }}
/>


            {/* Boy Character - only show when conditions are met AND not during rescue */}
            {!showRescueMission && (showGaneshaBlessing || showChoiceButtons) && 
             !showSarvadaStory && 
             !showRecording &&
             sceneState.phase !== PHASES.SCENE_COMPLETE && (
              <div style={{
                position: 'absolute',
                right: '15%',
                bottom: '20%',
                zIndex: 15,
                display: showRescueMission ? 'none' : 'block'
              }}>
                <img 
                  src={boyNamaste}
                  alt="Boy character"
                  className="breathing-animation"
                  style={{ 
                    width: '100px', 
                    height: 'auto', 
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            {/* Enhanced Ganesha Blessing */}
            {(showGaneshaBlessing || showChoiceButtons) && (
              <>
                {/* Ganesha Avatar with Dynamic States */}
                <div className={`ganesha-avatar ${blessingPhase} power-${currentPracticeWord}`}>
                  <img 
                    src={ganeshaWithHeadphones} 
                    alt="Ganesha" 
                    className="ganesha-image breathing-animation"
                    style={{
                      filter: blessingPhase === 'transfer' 
                        ? `brightness(1.4) drop-shadow(0 0 35px ${powerConfig[currentPracticeWord]?.color || '#FFD700'})`
                        : blessingPhase === 'blessing'
                        ? `brightness(1.2) drop-shadow(0 0 25px ${powerConfig[currentPracticeWord]?.color || '#FFD700'})`
                        : 'brightness(1)'
                    }}
                  />
                  
                  {/* Power Transfer Particles */}
                  {showParticles && (
                    <div className="power-particles">
                      {Array.from({length: 8}).map((_, i) => (
                        <div 
                          key={i} 
                          className="particle"
                          style={{ 
                            '--delay': `${i * 0.3}s`,
                            color: powerConfig[currentPracticeWord]?.color || '#FFD700'
                          }}
                        >
                          {powerConfig[currentPracticeWord]?.icon || 'âœ¨'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speech Bubble */}
                {(blessingPhase === 'welcome' || blessingPhase === 'blessing' || blessingPhase === 'transfer') && (
                  <div className={`ganesha-speech-bubble ${blessingPhase}`}>
                    <div className="speech-bubble-content">
                      {blessingPhase === 'welcome' && (
                        <>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700', marginBottom: '5px' }}>
                            Magnificent divine chanting!
                          </div>
                          <div style={{ fontSize: '14px', color: '#FFD700' }}>
                            You have learned the divine word "{blessingWord || currentPracticeWord}"!
                          </div>
                        </>
                      )}
                      
                      {blessingPhase === 'blessing' && (
                        <>
                          <div className="speech-text" style={{ color: powerConfig[currentPracticeWord]?.color }}>
                            {powerConfig[currentPracticeWord]?.icon} {powerConfig[currentPracticeWord]?.name} Power!
                          </div>
                          <div className="speech-subtext">This divine power is now flowing to you...</div>
                        </>
                      )}
                      
                      {blessingPhase === 'transfer' && (
                        <>
                          <div className="speech-text" style={{ color: powerConfig[currentPracticeWord]?.color }}>
                            Divine power flowing to you...
                          </div>
                          <div className="speech-subtext">Feel the eternal divine energy!</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Blessing Buttons */}
                {blessingPhase === 'welcome' && (
                  <div className="blessing-buttons" style={{ 
                    position: 'absolute', 
                    bottom: '20%', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    zIndex: 25 
                  }}>
                    <button className="record-blessing-btn" onClick={handleGaneshaRecord}>
                      ðŸŽ¤ Chant Now
                    </button>
                    <button className="skip-blessing-btn" onClick={handleGaneshaSkip}>
                      Chant Later
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Save Animal Mission */}
            <SaveAnimalMission
              show={showRescueMission}
              word={currentRescueWord}

              beforeImage={currentRescueWord === 'sarvakaryeshu' ? sarvakaryeshuBefore : sarvadaBefore}
              afterImage={currentRescueWord === 'sarvakaryeshu' ? sarvakaryeshuAfter : sarvadaAfter}
              
              powerConfig={powerConfig[currentRescueWord]}
              smartwatchBase={smartwatchBase}
              smartwatchScreen={smartwatchScreen}
              
              appImage={currentRescueWord === 'sarvakaryeshu' ? appSarvakaryeshu : appSarvada}
              
              boyCharacter={boyNamaste}
              onComplete={handleRescueComplete}
              onCancel={() => setShowRescueMission(false)}
              
              {...missionReloadProps}
              onSaveMissionState={(missionState) => handleSaveComponentState('mission', missionState)}
            />

            {/* Audio Practice Popup */}
            {showAudioPractice && (
              <div className="audio-practice-popup">
                <div className="audio-practice-content">
                  <div className="practice-title">Practice {currentPracticeWord}</div>
                  <div className="syllable-buttons">
                    {currentPracticeWord === 'sarvakaryeshu' ? 
                      ['SAR', 'VA', 'KAR', 'YESHU'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      )) :
                      ['SAR', 'VA', 'DA'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      ))
                    }
                  </div>
                  <button className="word-practice-btn" onClick={() => handleWordPlay(currentPracticeWord)}>
                    ðŸ”µ {currentPracticeWord.toUpperCase()}
                  </button>
                  <button className="practice-close-btn" onClick={handleAudioPracticeClose}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Choice Buttons */}
            {showChoiceButtons && (
              <div className="power-choice-buttons">
                <button className="choice-btn save-animal-btn" onClick={handleSaveAnimal}>
                  ðŸ˜ Save a Divine Animal
                </button>
                <button className="choice-btn continue-learning-btn" onClick={handleContinueLearning}>
                  {currentPracticeWord === 'sarvada' ? 'âœ¨ End Scene' : 'ðŸŒŸ Continue Learning'}
                </button>
              </div>
            )}

            {/* Word Celebration */}
            {showWordCelebration && (
              <div style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 200
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: (blessingWord || currentPracticeWord) === 'sarvakaryeshu' ? '#FFD700' : '#4B0082',
                  textShadow: `0 0 20px ${(blessingWord || currentPracticeWord) === 'sarvakaryeshu' ? 'rgba(255, 215, 0, 0.8)' : 
                    'rgba(75, 0, 130, 0.8)'}`,
                  zIndex: 200,
                  animation: 'wordCelebration 4s ease-in-out',
                  marginBottom: '10px'
                }}>
                  {((blessingWord || currentPracticeWord) || '').toUpperCase()}
                </div>
              </div>
            )}

            {/* Progressive Hints System */}
            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getHintConfigs()}
              //characterImage={mooshikaCoach}
              initialDelay={20000}        
              hintDisplayTime={10000}    
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={handleHintShown}
              onHintButtonClick={handleHintButtonClick}
              enabled={true}
            />

            {/* Enhanced Sparkle Effects */}
            {showSparkle === 'sarvakaryeshu-complete' && (
              <SparkleAnimation
                type="glitter"
                count={40}
                color="#FFD700"
                size={18}
                duration={4000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'sarvada-complete' && (
              <SparkleAnimation
                type="magic"
                count={50}
                color="#4B0082"
                size={22}
                duration={4000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'scene-complete' && (
              <SparkleAnimation
                type="magic"
                count={60}
                color="gold"
                size={25}
                duration={3000}
                fadeOut={true}
                area="full"
              />
            )}
          </div>

          {/* Characters visible during fireworks */}
          {showSparkle === 'final-fireworks' && (
            <>
              <div style={{
                position: 'absolute',
                right: '15%',
                bottom: '20%',
                zIndex: 15
              }}>
                <img 
                  src={boyNamaste}
                  alt="Boy character celebrating"
                  className="breathing-animation"
                  style={{ 
                    width: '100px', 
                    height: 'auto', 
                    objectFit: 'contain'
                  }}
                />
              </div>
              
              <div className="ganesha-avatar celebration">
                <img 
                  src={ganeshaWithHeadphones} 
                  alt="Ganesha celebrating" 
                  className="ganesha-image breathing-animation"
                  style={{
                    filter: 'brightness(1.2) drop-shadow(0 0 25px #FFD700)'
                  }}
                />
              </div>
            </>
          )}
        
          {/* Final Fireworks 
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              count={15}
              colors={['#FFD700', '#4B0082', '#FF69B4', '#32CD32', '#FF8C00', '#9370DB']}
              onComplete={() => {
                console.log('ðŸŽ¯ FIREWORKS COMPLETION HANDLER CALLED');
                
                try {
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    try {
                      GameStateManager.saveGameState('shloka-river', 'sarvakaryeshu-chant', {
                        completed: true,
                        stars: 5,
                        syllables: sceneState?.learnedSyllables || {},
                        words: sceneState?.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });
                      console.log('âœ… Game state saved successfully');
                    } catch (saveError) {
                      console.warn('âš ï¸ Error saving game state:', saveError);
                    }

                    try {
                      localStorage.removeItem(`temp_session_${profileId}_shloka-river_sarvakaryeshu-chant`);
                      SimpleSceneManager.clearCurrentScene();
                      console.log('âœ… Temp session cleared');
                    } catch (clearError) {
                      console.warn('âš ï¸ Error clearing session:', clearError);
                    }
                  }

                  sceneActions.updateState({
                    showingCompletionScreen: true,
                    currentPopup: null,
                    phase: PHASES.SCENE_COMPLETE,
                    stars: 5,
                    completed: true
                  });
                  console.log('ðŸŽ¯ Scene state updated');

                  setShowSceneCompletion(true);
                  console.log('ðŸŽ¯ setShowSceneCompletion(true) called');
                  
                } catch (error) {
                  console.error('ðŸ’¥ Error in fireworks completion:', error);
                  setShowSceneCompletion(true);
                }
              }}
            />
          )}

                        {/* Final Fireworks */}
                      {showSparkle === 'final-fireworks' && (
                        <Fireworks
                          show={true}
                          duration={8000}
                          count={25}
                          colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                          onComplete={() => {
                            console.log('ðŸŽ¯ sarvakaryeshu-chant fireworks complete');
                            setShowSparkle(null);
                            
                            const profileId = localStorage.getItem('activeProfileId');
                            if (profileId) {
                        GameStateManager.saveGameState('shloka-river', 'sarvakaryeshu-chant', {
                        completed: true,
                        stars: 5,
                        syllables: sceneState?.learnedSyllables || {},
                        words: sceneState?.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });
                      localStorage.removeItem(`temp_session_${profileId}_shloka-river_sarvakaryeshu-chant`);
                              SimpleSceneManager.clearCurrentScene();
                              console.log('âœ… vakratunda chant: Completion saved and temp session cleared');
                            }
                            
                            setShowSceneCompletion(true);
                          }}
                        />
                      )}
              
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Sarvakaryeshu Chant"
            sceneNumber={5}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
  containerType="smartwatch"
  containerImage={smartwatchBase}
  containerScreenImage={smartwatchScreen}
appImages={{
  // All 8 apps
  vakratunda: appVakratunda,
  mahakaya: appMahakaya,
  suryakoti: appSuryakoti,
  samaprabha: appSamaprabha,
  nirvighnam: appNirvighnam,
  kurumedeva: appKurumedeva,
  sarvakaryeshu: appSarvakaryeshu,
  sarvada: appSarvada,
}}
            nextSceneName="Shloka River Finale"
            sceneId="sarvakaryeshu-chant"
            completionData={{
              stars: 5,
              syllables: sceneState.learnedSyllables,
              words: sceneState.learnedWords,
              completed: true
            }}
            onComplete={onComplete}
   onReplay={() => {
  console.log('ðŸ”€ INSTANT REPLAY: Garden Adventure restart');
  resetScene(false);  // No confirm dialog for replay
}}
        
            onContinue={() => {
              console.log('SARVAKARYESHU CONTINUE: Going to next scene + preserving resume');
              
              if (clearManualCloseTracking) {
                clearManualCloseTracking();
                console.log('SARVAKARYESHU CONTINUE: GameCoach manual tracking cleared');
              }
              if (hideCoach) {
                hideCoach();
                console.log('SARVAKARYESHU CONTINUE: GameCoach hidden');
              }
              
              setTimeout(() => {
                console.log('SARVAKARYESHU CONTINUE: Forcing GameCoach fresh start for next scene');
                if (clearManualCloseTracking) {
                  clearManualCloseTracking();
                }
              }, 500);
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'sarvakaryeshu-chant', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
                
                GameStateManager.saveGameState('shloka-river', 'sarvakaryeshu-chant', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
                
                console.log('SARVAKARYESHU CONTINUE: Completion data saved');
              }

              setTimeout(() => {
                                SimpleSceneManager.setCurrentScene('shloka-river', 'shloka-river-finale', false, false);
                console.log('SARVAKARYESHU CONTINUE: Scene completed - going back to zones');
                
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          />        

          {/* TESTING: Universal completion button - works for any Sanskrit scene */}
<div style={{
  position: 'fixed',
  top: '120px',
  right: '60px',
  zIndex: 9999,
  background: 'green',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('ðŸ§ª TESTING: Universal completion clicked');
  
  // Automatically complete all syllables and words in any scene
  const allSyllables = Object.keys(sceneState?.learnedSyllables || {});
  const allWords = Object.keys(sceneState?.learnedWords || {});
  
  const completedSyllables = {};
  const completedWords = {};
  
  allSyllables.forEach(syl => completedSyllables[syl] = true);
  allWords.forEach(word => completedWords[word] = true);
  
  console.log('Completing syllables:', completedSyllables);
  console.log('Completing words:', completedWords);
  
  sceneActions.updateState({
    learnedSyllables: completedSyllables,
    learnedWords: completedWords,
    phase: PHASES.SCENE_COMPLETE,
    completed: true,
    stars: 5,
    progress: {
      percentage: 100,
      starsEarned: 5,
      completed: true
    },
    currentPopup: null,
    gameCoachState: null,
    isReloadingGameCoach: false
  });
  
  // Clear common scene states
  setShowSparkle(null);
  setShowRecording(false);
  setShowSceneCompletion(false);
  
  // Clear additional states if they exist (safe with typeof check)
  if (typeof setShowGaneshaBlessing !== 'undefined') setShowGaneshaBlessing(false);
  if (typeof setShowChoiceButtons !== 'undefined') setShowChoiceButtons(false);
  if (typeof setShowWordCelebration !== 'undefined') setShowWordCelebration(false);
  if (typeof setShowRescueMission !== 'undefined') setShowRescueMission(false);
  if (typeof setCurrentRecordingWord !== 'undefined') setCurrentRecordingWord('');
  if (typeof setBlessingWord !== 'undefined') setBlessingWord('');
  if (typeof setCurrentPracticeWord !== 'undefined') setCurrentPracticeWord('');
  
  setTimeout(() => {
    setShowSparkle('final-fireworks');
  }, 1000);
}}>
  COMPLETE SCENE
</div>
          
          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`Memory game progress, ${profileName}!`);
              if (hideCoach) hideCoach();
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
                          onStartFresh={() => resetScene(true)}  // Add this if TocaBoca has reset option

            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

                    <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />

          {/* TESTING: Skip to Sarvada Game Button */}
          <div style={{
            position: 'fixed',
            top: '240px',
            right: '60px',
            zIndex: 9999,
            background: '#4B0082',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }} onClick={() => {
            console.log('ðŸ§ª TESTING: Skip to Sarvada Game clicked');
            
            setShowSparkle(null);
            setShowRecording(false);
            setShowSceneCompletion(false);
            setShowGaneshaBlessing(false);
            setShowChoiceButtons(false);
            setShowWordCelebration(false);
            setShowRescueMission(false);
            setCurrentRecordingWord('');
            setBlessingWord('');
            setCurrentPracticeWord('');
            setShowSarvadaStory(false);
            setIsTransitioning(false);
            
            setSarvakaryeshuPowerGained(true);
            
            sceneActions.updateState({
              learnedSyllables: {
                sar: true, va: true, kar: true, yeshu: true,  // Sarvakaryeshu complete
                da: false  // Sarvada not learned yet
              },
              learnedWords: {
                sarvakaryeshu: true,    // Sarvakaryeshu complete
                sarvada: false   // Sarvada not learned yet
              },
              
              phase: PHASES.SARVADA_GAME_ACTIVE,
              
              currentPopup: null,
              showingCompletionScreen: false,
              gameCoachState: null,
              isReloadingGameCoach: false,
              
              sarvakaryeshuGameState: null,  // Clear first game state
              sarvadaGameState: null, // Start fresh second state
              
              missionState: {
                rescuePhase: 'problem',
                showParticles: false,
                word: null,
                missionJustCompleted: false
              },
              
              stars: 3,
              completed: false,
              progress: { percentage: 60, starsEarned: 3, completed: false },
              
              welcomeShown: true,
              sarvakaryeshuWisdomShown: true,
              sarvadaWisdomShown: false
            });
            
            console.log('âœ… State set for Sarvada game - should start immediately');
          }}>
            SKIP TO SARVADA
          </div>

          {/* Emergency Reset Button */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #FF6B6B, #EE5A52)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 30,
            boxShadow: '0 3px 10px rgba(238, 90, 82, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            if (confirm('Start this Sanskrit scene from the beginning? You will lose current progress.')) {
              console.log('Sanskrit emergency restart: User chose to start fresh');
              
              setShowSparkle(null);
              setShowRecording(false);
              setShowSceneCompletion(false);
              setCurrentRecordingWord('');
              setShowAudioTracker(true);
              
              setTimeout(() => {
                sceneActions.updateState({
                  learnedSyllables: {},
                  learnedWords: {},
                 combinedGameState: null,
                  missionState: {
                    rescuePhase: 'problem',
                    showParticles: false,
                    word: null,
                    missionJustCompleted: false
                  },
                  phase: PHASES.INITIAL,
                  welcomeShown: false,
                  sarvakaryeshuWisdomShown: false,
                  sarvadaWisdomShown: false,
                  currentPopup: null,
                  showingCompletionScreen: false,
                  gameCoachState: null,
                  isReloadingGameCoach: false,
                  stars: 0,
                  completed: false,
                  progress: { percentage: 0, starsEarned: 0, completed: false }
                });
              }, 100);
              
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
            }
          }}>
            Start Fresh
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuChant;
