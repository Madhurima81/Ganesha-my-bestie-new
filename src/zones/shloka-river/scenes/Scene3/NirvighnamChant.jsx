// zones/shloka-river/scenes/Scene3/NirvighnamChant.jsx - Scene 3 with Stone/Decoration mechanics
import React, { useState, useEffect, useRef } from 'react';
import './NirvighnamChant.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import mooshikaCoach from "./assets/images/mooshika-coach.webp";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Import the actual game components
//import NirvighnamGame from './components/NirvighnamGame';
//import KurumeDevaGame from './components/KurumeDevaGame';
import SimplifiedNirvighnamKurumedevaGame from './components/SimplifiedNirvighnamKurumedevaGame';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';


// Images - Nirvighnam scene assets
import nirvighnamChantBg from './assets/images/nirvighnam-bg.png';
import kuruBg from './assets/images/kuru-bg.png';


// Nirvighnam game assets - Animals, Objects, Stones
import frogNir from './assets/images/nirvighnam/nir-frog.png';
import snailVigh from './assets/images/nirvighnam/nir-snail.png';
import turtleNam from './assets/images/nirvighnam/nir-turtle.png';
import leafNir from './assets/images/nirvighnam/nir-leaf.png';
import drumVigh from './assets/images/nirvighnam/nir-drum.png';
import featherNam from './assets/images/nirvighnam/nir-feather.png';
import stone1Nir from './assets/images/nirvighnam/stone1.png';
import stone2Vigh from './assets/images/nirvighnam/stone2.png';
import stone3Nam from './assets/images/nirvighnam/stone3.png';
import stone1NirCol from './assets/images/nirvighnam/stone1-col.png';
import stone2VighCol from './assets/images/nirvighnam/stone2-col.png';
import stone3NamCol from './assets/images/nirvighnam/stone3-col.png';

// Kurumedeva game assets - Animals, Items, Decorations
import animal1Ku from './assets/images/Kurumedeva/animal1-ku.png';
import animal2Ru from './assets/images/Kurumedeva/animal2-ru.png';
import animal3Me from './assets/images/Kurumedeva/animal3-me.png';
import animal4De from './assets/images/Kurumedeva/animal4-de.png';
import animal5Va from './assets/images/Kurumedeva/animal5-va.png';
import item1Ku from './assets/images/Kurumedeva/item1-ku.png';
import item2Ru from './assets/images/Kurumedeva/item2-ru.png';
import item3Me from './assets/images/Kurumedeva/item3-me.png';
import item4De from './assets/images/Kurumedeva/item4-de.png';
import item5Va from './assets/images/Kurumedeva/item5-va.png';
import decor1Ku from './assets/images/Kurumedeva/decor1-ku.png';
import decor2Ru from './assets/images/Kurumedeva/decor2-ru.png';
import decor3Me from './assets/images/Kurumedeva/decor3-me.png';
import decor4De from './assets/images/Kurumedeva/decor4-de.png';
import decor5Va from './assets/images/Kurumedeva/decor5-va.png';

import ganeshaWithHeadphones from '../assets/images/ganesha_with_headphones.png';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';
import appNirvighnam from '../assets/images/apps/app-nirvighnam.png';
import appKurumedeva from '../assets/images/apps/app-kurumedeva.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import nirvighnamBefore from './assets/images/nirvighnam/nirvighnam-before.png';
import nirvighnamAfter from './assets/images/nirvighnam/nirvighnam-after.png';
import kurumedevaBefore from './assets/images/Kurumedeva/kurumedeva-before.png'; 
import kurumedevaAfter from './assets/images/Kurumedeva/kurumedeva-after.png';

// Updated PHASES constant for Scene 3
const PHASES = {
  INITIAL: 'initial',
  NIRVIGHNAM_GAME_ACTIVE: 'nirvighnam_game_active',
  NIRVIGHNAM_COMPLETE: 'nirvighnam_complete',
  GANESHA_BLESSING_NIRVIGHNAM: 'ganesha_blessing_nirvighnam',
  CHOICE_BUTTONS_NIRVIGHNAM: 'choice_buttons_nirvighnam',
  RESCUE_MISSION_NIRVIGHNAM: 'rescue_mission_nirvighnam',
  KURUMEDEVA_STORY: 'kurumedeva_story',
  KURUMEDEVA_GAME_ACTIVE: 'kurumedeva_game_active',
  KURUMEDEVA_COMPLETE: 'kurumedeva_complete',
  GANESHA_BLESSING_KURUMEDEVA: 'ganesha_blessing_kurumedeva',
  CHOICE_BUTTONS_KURUMEDEVA: 'choice_buttons_kurumedeva',
  RESCUE_MISSION_KURUMEDEVA: 'rescue_mission_kurumedeva',
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

const NirvighnamChant = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'nirvighnam-chant'
}) => {
  console.log('NirvighnamChant props:', { onComplete, onNavigate, zoneId, sceneId });

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
            nir: false, vigh: false, nam: false,
  kuru: false, me: false, de: false, va: false
          },
          learnedWords: {
            nirvighnam: false,
            kurumedeva: false
          },

          unlockedApps: {},
          
          // UNIFIED: Combined state for both games
     // UPDATED: Combined state for both games in one component
combinedGameState: null,
          missionState: {
            rescuePhase: 'problem',
            showParticles: false,
            word: null,
            missionJustCompleted: false
          },
          
          // Message flags
          welcomeShown: false,
          nirvighnamWisdomShown: false,
          kurumedevaWisdomShown: false,
          
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
          <NirvighnamChantContent
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

const NirvighnamChantContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
console.log('ðŸ•‰ï¸ NirvighnamChantContent render', { 
  sceneState: sceneState?.phase, 
  isReload, 
  combinedGameState: !!sceneState?.combinedGameState,
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

  const [nirvighnamPowerGained, setNirvighnamPowerGained] = useState(false);
  const [showCenteredApp, setShowCenteredApp] = useState(null);
  const [blessingWord, setBlessingWord] = useState('');

  // UNIFIED: Single state for rescue mission
  const [showRescueMission, setShowRescueMission] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState('');
  const [showWordCelebration, setShowWordCelebration] = useState(false);

  const [showKurumedevaStory, setShowKurumedevaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

     const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
    const [rescuePhase, setRescuePhase] = useState('problem');

  // Add power configuration for Scene 3
  const powerConfig = {
    nirvighnam: { name: 'Sacred Wisdom', icon: 'ðŸ•‰ï¸', color: '#DAA520' },
    kurumedeva: { name: 'Divine Grace', icon: 'ðŸª·', color: '#9370DB' }
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

  // UNIFIED: Single state saving function for both components
  const handleSaveComponentState = (componentType, componentState) => {
    console.log(`Ã°Å¸'Â¾ Saving ${componentType} state:`, componentState);
    
    // Prevent double calls by debouncing
    if (handleSaveComponentState.lastCall && 
        Date.now() - handleSaveComponentState.lastCall < 100) {
      console.log('ðŸš« Debounced duplicate save call');
      return;
    }
    handleSaveComponentState.lastCall = Date.now();
    
    const updatedState = {
      ...(componentType === 'nirvighnamGame' && { nirvighnamGameState: componentState }),
      ...(componentType === 'kurumedevaGame' && { 
        kurumedevaGameState: {
          ...sceneState.kurumedevaGameState,
          ...componentState
        }
      }),
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

      const handleSaveCombinedGameState = (gameState) => {
  console.log('Saving combined game state:', gameState);
  
  sceneActions.updateState({
    combinedGameState: gameState
  });
};

useEffect(() => {
  window.simplifiedNirvighnamKurumedevaGame = {};
  return () => {
    if (window.simplifiedNirvighnamKurumedevaGame) {
      delete window.simplifiedNirvighnamKurumedevaGame;
    }
  };
}, []);

  // Set up communication for the scene itself
  useEffect(() => {
    window.nirvighnamChant = {
      showKurumedevaStory: () => {
        setShowKurumedevaStory(true);
      }
    };
    
    return () => {
      if (window.nirvighnamChant) {
        delete window.nirvighnamChant;
      }
    };
  }, []);

  // Master Restorer for the Nirvighnam Chant scene
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('Ã°Å¸"â€ž NIRVIGHNAM RELOAD: Starting reload', {
      phase: sceneState.phase,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed
    });

    // Handle "Play Again" requests
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    if (playAgainRequested === 'true') {
      console.log('Ã°Å¸"â€ž NIRVIGHNAM: Fresh restart after Play Again');
      localStorage.removeItem(playAgainKey);
      sceneActions.updateState({ 
        phase: PHASES.INITIAL,
        showingCompletionScreen: false,
        completed: false,
        stars: 0,
        welcomeShown: false,
        nirvighnamGameState: null,
        kurumedevaGameState: null,
      });
      return;
    }

    // Handle completion screen reload
    if (sceneState.showingCompletionScreen) {
      console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming completion screen');
      setShowSceneCompletion(true);
      return;
    }

    // Phase-specific reload logic
    switch (sceneState.phase) {
      case PHASES.INITIAL:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming initial welcome');
        break;
        
      case PHASES.NIRVIGHNAM_GAME_ACTIVE:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Nirvighnam game active - letting component handle itself');
        break;

      case PHASES.KURUMEDEVA_GAME_ACTIVE:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Kurumedeva game active - letting component handle itself');
        setNirvighnamPowerGained(true);
        break;
        
      case PHASES.NIRVIGHNAM_COMPLETE:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming Nirvighnam completion celebration');
        setBlessingWord('nirvighnam');
        setCurrentPracticeWord('nirvighnam');
        setShowWordCelebration(true);
        setShowSparkle('nirvighnam-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_NIRVIGHNAM
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.KURUMEDEVA_COMPLETE:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming Kurumedeva completion celebration');
        setBlessingWord('kurumedeva');
        setCurrentPracticeWord('kurumedeva');
        setShowWordCelebration(true);
        setShowSparkle('kurumedeva-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_KURUMEDEVA
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.GANESHA_BLESSING_NIRVIGHNAM:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming Ganesha blessing for Nirvighnam');
        setBlessingWord('nirvighnam');
        setCurrentPracticeWord('nirvighnam');
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;

      case PHASES.GANESHA_BLESSING_KURUMEDEVA:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming Ganesha blessing for Kurumedeva');
        setBlessingWord('kurumedeva');
        setCurrentPracticeWord('kurumedeva');
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;
        
      case PHASES.CHOICE_BUTTONS_NIRVIGHNAM:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming choice buttons for Nirvighnam');
        setCurrentPracticeWord('nirvighnam');
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowKurumedevaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');
        setShowChoiceButtons(true);
        break;
        
      case PHASES.CHOICE_BUTTONS_KURUMEDEVA:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming choice buttons for Kurumedeva');
        setCurrentPracticeWord('kurumedeva');
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowKurumedevaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');
        setShowChoiceButtons(true);
        break;
        
      case PHASES.RESCUE_MISSION_NIRVIGHNAM:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming rescue mission for Nirvighnam');
        setCurrentRescueWord('nirvighnam');
        setShowRescueMission(true);
        break;
        
      case PHASES.KURUMEDEVA_STORY:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming Kurumedeva story');
        setNirvighnamPowerGained(true);
        setShowKurumedevaStory(true);
        break;
        
      case PHASES.RESCUE_MISSION_KURUMEDEVA:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming rescue mission for Kurumedeva');
        setCurrentRescueWord('kurumedeva');
        setNirvighnamPowerGained(true);
        setShowRescueMission(true);
        break;
        
      case PHASES.SCENE_COMPLETE:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: Resuming scene complete');
        if (!sceneState.showingCompletionScreen) {
          setTimeout(() => {
            setShowSparkle('final-fireworks');
          }, 500);
        }
        break;
        
      default:
        console.log('Ã°Å¸"â€ž NIRVIGHNAM: No specific reload needed for phase:', sceneState.phase);
    }
  }, [isReload]);

  // Add this reusable resetScene function inside your NirvighnamChantContent component
const resetScene = (showConfirm = true) => {
  if (showConfirm && !confirm('Start this scene from the beginning? You will lose current progress.')) {
    return;
  }

      setForceMemoryGameReset(true);


  console.log('ðŸ”¥ Nirvighnam Scene reset: User chose to start fresh');
  
  // STEP 1: Set force reset flag for the combined game component
  if (window.simplifiedNirvighnamKurumedevaGame) {
    window.simplifiedNirvighnamKurumedevaGame.isForceReset = true;
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
  setNirvighnamPowerGained(false);
  
  // Clear rescue mission states
  setShowRescueMission(false);
  setCurrentRescueWord('');
  setShowWordCelebration(false);
  
  // Clear story and transition states
  setShowKurumedevaStory(false);
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
  if (window.simplifiedNirvighnamKurumedevaGame && window.simplifiedNirvighnamKurumedevaGame.clearCompletionState) {
    window.simplifiedNirvighnamKurumedevaGame.clearCompletionState();
  }
  
  // STEP 6: Force combined game reset
  const forceCombinedGameReset = () => {
    if (window.simplifiedNirvighnamKurumedevaGame) {
      window.simplifiedNirvighnamKurumedevaGame.visualRewards = {};
      window.simplifiedNirvighnamKurumedevaGame.activatedSingers = {};
      window.simplifiedNirvighnamKurumedevaGame.isForceReset = true;
    }
  };
  
  forceCombinedGameReset();
  
  // STEP 7: Reset scene state
  setTimeout(() => {
    sceneActions.updateState({
      // Reset syllable learning progress
      learnedSyllables: {
        nir: false, vigh: false, nam: false,
        kuru: false, me: false, de: false, va: false
      },
      
      // Reset word learning progress
      learnedWords: {
        nirvighnam: false,
        kurumedeva: false
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
      nirvighnamWisdomShown: false,
      kurumedevaWisdomShown: false,
      
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
      if (window.simplifiedNirvighnamKurumedevaGame) {
        window.simplifiedNirvighnamKurumedevaGame.isForceReset = false;
      }
    }, 1000);
    
    console.log('âœ… Nirvighnam scene state reset complete');
  }, 150);
};

  // Image getter functions for Nirvighnam game (stone clearing)
  const getNirvighnamAnimalImage = (index) => {
    const images = [frogNir, snailVigh, turtleNam];
    return images[index];
  };

  const getNirvighnamObjectImage = (index, singing) => {
    const images = [leafNir, drumVigh, featherNam];
    return images[index];
  };

 const getNirvighnamStoneImage = (index, colored) => {
  const baseStones = [stone1Nir, stone2Vigh, stone3Nam];
  const coloredStones = [stone1NirCol, stone2VighCol, stone3NamCol];
  
  if (colored) {
    return coloredStones[index];
  } else {
    return baseStones[index];
  }
};

  // Image getter functions for Kurumedeva game (divine decoration)
  const getKurumedevaAnimalImage = (index) => {
    const images = [animal1Ku, animal2Ru, animal3Me, animal4De, animal5Va];
    return images[index];
  };

  const getKurumedevaItemImage = (index, singing) => {
    const images = [item1Ku, item2Ru, item3Me, item4De, item5Va];
    return images[index];
  };

  const getKurumedevaDecorImage = (index, activated) => {
    const images = [decor1Ku, decor2Ru, decor3Me, decor4De, decor5Va];
    return images[index];
  };

  const handleSaveAnimal = () => {
    console.log('ðŸ˜ RESCUE MISSION: Starting sacred animal rescue');
    
    setShowChoiceButtons(false);
    setCurrentRescueWord(currentPracticeWord || blessingWord);
    
    const word = currentPracticeWord || blessingWord;

    // Update the scene phase to the correct rescue mission
    sceneActions.updateState({
      phase: word === 'nirvighnam'
        ? PHASES.RESCUE_MISSION_NIRVIGHNAM
        : PHASES.RESCUE_MISSION_KURUMEDEVA
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
    
    if (currentRescueWord === 'nirvighnam') {
      console.log('Nirvighnam rescue complete - showing Kurumedeva story now');
      
      setShowChoiceButtons(false);
      setShowGaneshaBlessing(false);
      setNirvighnamPowerGained(true);
      
      sceneActions.updateState({
        phase: PHASES.KURUMEDEVA_STORY
      });
      
      setTimeout(() => {
        setShowKurumedevaStory(true);
      }, 500);
      
    } else if (currentRescueWord === 'kurumedeva') {
      console.log('Kurumedeva rescue complete - FINAL FIREWORKS NOW!');
      
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
    
    if (phase === 'nirvighnam') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, nirvighnam: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          nir: true, vigh: true, nam: true 
        },
        phase: PHASES.NIRVIGHNAM_COMPLETE,
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      setBlessingWord('nirvighnam');
      setCurrentPracticeWord('nirvighnam');
      setShowSparkle('nirvighnam-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_NIRVIGHNAM
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      
    } else if (phase === 'kurumedeva') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, kurumedeva: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          kuru: true, me: true, de: true, va: true
        },
        phase: PHASES.KURUMEDEVA_COMPLETE,
        progress: { percentage: 90, starsEarned: 4 }
      });

      setNirvighnamPowerGained(true);
      setBlessingWord('kurumedeva');
      setCurrentPracticeWord('kurumedeva');
      setShowSparkle('kurumedeva-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_KURUMEDEVA
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
    }
  };
  
  // Add this near the top with other helper functions
const getPlainStoneImage = (syllable) => {
  if (syllable === 'nir') return stone1Nir;
  if (syllable === 'vigh') return stone2Vigh;
  if (syllable === 'nam') return stone3Nam;
  return null;
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
    
    if (currentPracticeWord === 'nirvighnam') {
      console.log('Nirvighnam continue - showing Kurumedeva story now');
      
      setIsTransitioning(true);
      setShowGaneshaBlessing(false);
      setShowSparkle(null);
      setShowWordCelebration(false);
      setNirvighnamPowerGained(true);
      
      sceneActions.updateState({
        phase: PHASES.KURUMEDEVA_STORY,
        nirvighnamGameState: null 
      });
      
      setTimeout(() => {
        setIsTransitioning(false);
        setShowKurumedevaStory(true);
      }, 100);
      
    } else if (currentPracticeWord === 'kurumedeva') {
      console.log('Kurumedeva continue - ending scene');
      
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
      // Syllables for Nirvighnam
      'nir': 'nirvighnam-nir',
      'vigh': 'nirvighnam-vigh', 
      'nam': 'nirvighnam-nam',

      // Syllables for Kurumedeva
      'ku': 'kurumedeva-ku',
      'ru': 'kurumedeva-ru',
      'me': 'kurumedeva-me',
      'de': 'kurumedeva-de',
      'va': 'kurumedeva-va'
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

// Add this simple logic - no complex function calls
const backgroundImage = (
  sceneState?.learnedWords?.nirvighnam || 
  nirvighnamPowerGained ||
  sceneState?.phase === PHASES.KURUMEDEVA_STORY ||
  sceneState?.phase === PHASES.KURUMEDEVA_GAME_ACTIVE ||
  sceneState?.phase === PHASES.KURUMEDEVA_COMPLETE ||
  sceneState?.phase === PHASES.GANESHA_BLESSING_KURUMEDEVA ||
  sceneState?.phase === PHASES.CHOICE_BUTTONS_KURUMEDEVA ||
  sceneState?.phase === PHASES.RESCUE_MISSION_KURUMEDEVA
) ? kuruBg : nirvighnamChantBg;

  const getHintConfigs = () => [
    {
      id: 'sequence-listening-hint',
      message: 'Listen to the magical objects singing!',
      explicitMessage: 'Wait for the sequence to finish, then click the animals in the same order to clear the path!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
  return sceneState?.combinedGameState?.gamePhase === 'playing' && !showRecording;
      }
    },
    {
      id: 'animal-clicking-hint', 
      message: 'Click the animals to clear the objects from stones!',
      explicitMessage: 'Click the animals in the order you heard: nir-vigh-nam!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
  return sceneState?.combinedGameState?.gamePhase === 'listening' && !showRecording;
      }
    },
    {
      id: 'recording-hint',
      message: 'Try chanting the sacred word you just learned!',
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
      console.log('Starting Nirvighnam memory game');
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.NIRVIGHNAM_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // Progress counter for syllables
  const renderProgressCounter = () => {
    const totalSyllables = 8; // 3 + 5 syllables
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        <div className="counter-icon">ðŸ•‰ï¸</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{
              width: `${(learnedCount / totalSyllables) * 100}%`,
              background: `linear-gradient(90deg, #DAA520 0%, #8B4513 50%, #9370DB 100%)`
            }}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
        <div className="counter-label">Sacred Sounds</div>
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
    if (currentRecordingWord === 'nirvighnam') {
      console.log('=== CALLING startBlessingAnimation for nirvighnam ===');
      startBlessingAnimation();
      
    } else if (currentRecordingWord === 'kurumedeva') {
      console.log('=== CALLING startBlessingAnimation for kurumedeva ===');
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
    [wordToProcess]: true 
  }
});

      await new Promise(resolve => safeSetTimeout(resolve, 1000));

      setShowGaneshaBlessing(false);
      setShowChoiceButtons(true);
      setBlessingPhase('complete');
      
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'nirvighnam'
          ? PHASES.CHOICE_BUTTONS_NIRVIGHNAM
          : PHASES.CHOICE_BUTTONS_KURUMEDEVA
      });

    } catch (error) {
      console.error('Blessing animation error:', error);
      setShowGaneshaBlessing(false);
      setShowChoiceButtons(true);
      setBlessingPhase('complete');
      
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'nirvighnam'
          ? PHASES.CHOICE_BUTTONS_NIRVIGHNAM
          : PHASES.CHOICE_BUTTONS_KURUMEDEVA
      });
    }
  };

  const getSyllableState = (syllable) => {
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    const currentWord = sceneState.learnedWords?.nirvighnam ? 'kurumedeva' : 'nirvighnam';
    
    const phaseSyllables = currentWord === 'nirvighnam'
      ? ['nir', 'vigh', 'nam']
      : ['ku', 'ru', 'me', 'de', 'va'];
    
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';
    return 'locked';
  };

// Extract reload props for combined component
const combinedGameReloadProps = sceneState.combinedGameState ? {
  isReload: isReload,
  initialGamePhase: sceneState.combinedGameState.gamePhase || 'waiting',
  initialCurrentPhase: sceneState.combinedGameState.currentPhase || 'nirvighnam',
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
    console.log(`Sacred hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Sacred hint button clicked");
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>

        
        <div className="nirvighnam-chant-container">

<div 
  className="river-background" 
  style={{
    backgroundImage: `url(${backgroundImage})`, // CHANGED: use simple variable
    backgroundSize: 'cover',
    backgroundPosition: 'center top', // Shows more of the top
    backgroundRepeat: 'no-repeat'
  }}
>

<SimplifiedNirvighnamKurumedevaGame
  isActive={sceneState.phase === PHASES.NIRVIGHNAM_GAME_ACTIVE || 
           sceneState.phase === PHASES.KURUMEDEVA_GAME_ACTIVE ||
           sceneState.phase === PHASES.NIRVIGHNAM_COMPLETE ||
           sceneState.phase === PHASES.KURUMEDEVA_COMPLETE}
  hideElements={isTransitioning || 
    showGaneshaBlessing || showKurumedevaStory || 
    sceneState.phase === PHASES.NIRVIGHNAM_COMPLETE || 
    sceneState.phase === PHASES.KURUMEDEVA_COMPLETE ||
    sceneState.phase === PHASES.SCENE_COMPLETE}
  onPhaseComplete={handlePhaseComplete}
  onGameComplete={handleGameComplete}
  profileName={profileName}
    forceReset={forceMemoryGameReset} // ADD THIS LINE

  // Nirvighnam asset functions
  getDrumVighImage={() => drumVigh}
  getLeafRirImage={() => leafNir}
  getFeatherNamImage={() => featherNam}
  getFrogNirImage={() => frogNir}
  getSnailVighImage={() => snailVigh}
  getTurtleNamImage={() => turtleNam}
  getStone1NirColImage={() => stone1NirCol}
  getStone2VighColImage={() => stone2VighCol}
  getStone3NamColImage={() => stone3NamCol}

  // ADD THESE THREE NEW LINES HERE:
  getStone1NirImage={() => stone1Nir}
  getStone2VighImage={() => stone2Vigh}
  getStone3NamImage={() => stone3Nam}
  
  // Kurumedeva asset functions
  getAnimal1KuImage={() => animal1Ku}
  getAnimal2RuImage={() => animal2Ru}
  getAnimal3MeImage={() => animal3Me}
  getAnimal4DeImage={() => animal4De}
  getItem1KuImage={() => item1Ku}
  getItem2RuImage={() => item2Ru}
  getItem3MeImage={() => item3Me}
  getItem4DeImage={() => item4De}
  getDecor1KuImage={() => decor1Ku}
  getDecor2RuImage={() => decor2Ru}
  getDecor3MeImage={() => decor3Me}
  getDecor4DeImage={() => decor4De}
  
  isAudioOn={isAudioOn}
  playAudio={playAudio}
  onSaveGameState={handleSaveCombinedGameState}
  powerGained={nirvighnamPowerGained}
  
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
                  color: '#8B4513',
                  marginBottom: '10px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  The Sacred Stone Path
                </div>
                
                <div style={{
                  fontSize: '15px',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  Help the animals clear objects from the sacred stones
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  Listen to the magical objects, then click animals to clear the path
                </div>
                
                <button
                  onClick={() => {
                    sceneActions.updateState({ 
                      welcomeShown: true,
                      phase: PHASES.NIRVIGHNAM_GAME_ACTIVE 
                    });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
                  }}
                >
                  Begin Stone Clearing
                </button>
              </div>
            )}

            {/* Kurumedeva Story Introduction */}
            {showKurumedevaStory && (
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
                  color: '#9370DB',
                  marginBottom: '10px'
                }}>
                  The Divine Decoration Hall
                </div>
                
                <div style={{
                  fontSize: '15px',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  The sacred space needs divine decorations!
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  Use your Sacred Wisdom power to help the animals create beautiful decorations.
                </div>              
                
                <button
                  onClick={() => {
                    console.log('Begin Divine Decoration clicked - starting Kurumedeva properly');
                    
                    setIsTransitioning(true);
                    setShowKurumedevaStory(false);
                    
                    setTimeout(() => {
                      sceneActions.updateState({ 
                        phase: PHASES.KURUMEDEVA_GAME_ACTIVE,
                        currentPopup: null,
                        combinedGameState: null  // Clear old state
                      });

                 // Start Kurumedeva immediately
setTimeout(() => {
  if (window.simplifiedNirvighnamKurumedevaGame?.startKurumedevaPhase) {
    window.simplifiedNirvighnamKurumedevaGame.startKurumedevaPhase();
  }
}, 200);
                      
                      setTimeout(() => {
                        setIsTransitioning(false);
                      }, 400);
                      
                    }, 100);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #9370DB 0%, #4169E1 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer'
                  }}
                >
                  Create Divine Art
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
              stopAudio={() => {
                document.querySelectorAll('audio').forEach((audio) => {
                  audio.pause();
                  audio.currentTime = 0;
                });
              }}
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
                  src={showCenteredApp === 'nirvighnam' ? appNirvighnam : appKurumedeva}
                  alt={`${showCenteredApp} app`}
                  style={{
                    width: '120px',
                    height: '120px',
                    filter: 'drop-shadow(0 0 30px #DAA520)',
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
    ...(sceneState.unlockedApps || {})  // nirvighnam, kurumedeva
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
             !showKurumedevaStory && 
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
                        ? `brightness(1.4) drop-shadow(0 0 35px ${powerConfig[currentPracticeWord]?.color || '#DAA520'})`
                        : blessingPhase === 'blessing'
                        ? `brightness(1.2) drop-shadow(0 0 25px ${powerConfig[currentPracticeWord]?.color || '#DAA520'})`
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
                            color: powerConfig[currentPracticeWord]?.color || '#DAA520'
                          }}
                        >
                          {powerConfig[currentPracticeWord]?.icon || 'ðŸ•‰ï¸'}
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
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513', marginBottom: '5px' }}>
                            Wonderful sacred chanting!
                          </div>
                          <div style={{ fontSize: '14px', color: '#8B4513' }}>
                            You have learned the sacred word "{blessingWord || currentPracticeWord}"!
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
                            Sacred power flowing to you...
                          </div>
                          <div className="speech-subtext">Feel the ancient divine energy!</div>
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

              beforeImage={currentRescueWord === 'nirvighnam' ? nirvighnamBefore : kurumedevaBefore}
              afterImage={currentRescueWord === 'nirvighnam' ? nirvighnamAfter : kurumedevaAfter}
              
              powerConfig={powerConfig[currentRescueWord]}
              smartwatchBase={smartwatchBase}
              smartwatchScreen={smartwatchScreen}
              
              appImage={currentRescueWord === 'nirvighnam' ? appNirvighnam : appKurumedeva}
              
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
                    {currentPracticeWord === 'nirvighnam' ? 
                      ['NIR', 'VIGH', 'NAM'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      )) :
                      ['KU', 'RU', 'ME', 'DE', 'VA'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      ))
                    }
                  </div>
                  <button className="word-practice-btn" onClick={() => handleWordPlay(currentPracticeWord)}>
                    Ã°Å¸"Âµ {currentPracticeWord.toUpperCase()}
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
                  ðŸ˜ Save a Sacred Animal
                </button>
                <button className="choice-btn continue-learning-btn" onClick={handleContinueLearning}>
                  {currentPracticeWord === 'kurumedeva' ? 'âœ¨ End Scene' : 'ðŸª· Continue Learning'}
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
                  color: (blessingWord || currentPracticeWord) === 'nirvighnam' ? '#DAA520' : '#9370DB',
                  textShadow: `0 0 20px ${(blessingWord || currentPracticeWord) === 'nirvighnam' ? 'rgba(218, 165, 32, 0.8)' : 
                    'rgba(147, 112, 219, 0.8)'}`,
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

            {/* Enhanced Sparkle Effects */}
            {showSparkle === 'nirvighnam-complete' && (
              <SparkleAnimation
                type="glitter"
                count={40}
                color="#DAA520"
                size={18}
                duration={4000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'kurumedeva-complete' && (
              <SparkleAnimation
                type="magic"
                count={50}
                color="#9370DB"
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
                    filter: 'brightness(1.2) drop-shadow(0 0 25px #DAA520)'
                  }}
                />
              </div>
            </>
          )}

            {/* Final Fireworks */}
                      {showSparkle === 'final-fireworks' && (
                        <Fireworks
                          show={true}
                          duration={8000}
                          count={25}
                          colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                          onComplete={() => {
                            console.log('ðŸŽ¯ Nirvighnam chant fireworks complete');
                            setShowSparkle(null);
                            
                            const profileId = localStorage.getItem('activeProfileId');
                            if (profileId) {
                      GameStateManager.saveGameState('shloka-river', 'nirvighnam-chant', {
                        completed: true,
                        stars: 5,
                        syllables: sceneState?.learnedSyllables || {},
                        words: sceneState?.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });
                      localStorage.removeItem(`temp_session_${profileId}_shloka-river_nirvighnam-chant`);
                              SimpleSceneManager.clearCurrentScene();
                              console.log('âœ… nirvighnam chant: Completion saved and temp session cleared');
                            }
                            
                            setShowSceneCompletion(true);
                          }}
                        />
                      )}
          
          
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Nirvighnam Chant"
            sceneNumber={3}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva']}
  containerType="smartwatch"
  containerScreenImage={smartwatchScreen}
appImages={{
  vakratunda: appVakratunda,
  mahakaya: appMahakaya,
  suryakoti: appSuryakoti,
  samaprabha: appSamaprabha,
  nirvighnam: appNirvighnam,
  kurumedeva: appKurumedeva,
}}

            nextSceneName="sarvakaryeshu-chant"
            sceneId="nirvighnam-chant"
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
              console.log('NIRVIGHNAM CONTINUE: Going to next scene + preserving resume');
              
              if (clearManualCloseTracking) {
                clearManualCloseTracking();
                console.log('NIRVIGHNAM CONTINUE: GameCoach manual tracking cleared');
              }
              if (hideCoach) {
                hideCoach();
                console.log('NIRVIGHNAM CONTINUE: GameCoach hidden');
              }
              
              setTimeout(() => {
                console.log('NIRVIGHNAM CONTINUE: Forcing GameCoach fresh start for next scene');
                if (clearManualCloseTracking) {
                  clearManualCloseTracking();
                }
              }, 500);
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'nirvighnam-chant', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords,
                  chantedVerses: {
                    'nirvighnam-chant': true,
                    'kurumedeva-chant': true
                  }
                });

                GameStateManager.saveGameState('shloka-river', 'nirvighnam-chant', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
                
                console.log('NIRVIGHNAM CONTINUE: Completion data saved');
              }

              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'sarvakaryeshu-chant', false, false);
                console.log('NIRVIGHNAM CONTINUE: Next scene (divine-dance) set for resume tracking');
                
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

          {/* TESTING: Skip to Kurumedeva Game Button */}
          <div style={{
            position: 'fixed',
            top: '240px',
            right: '60px',
            zIndex: 9999,
            background: '#9370DB',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }} onClick={() => {
            console.log('ðŸ§ª TESTING: Skip to Kurumedeva Game clicked');
            
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
            setShowKurumedevaStory(false);
            setIsTransitioning(false);
            
            setNirvighnamPowerGained(true);
            
            sceneActions.updateState({
              learnedSyllables: {
                nir: true, vigh: true, nam: true,  // Nirvighnam complete
  kuru: false, me: false, de: false, va: false
              },
              learnedWords: {
                nirvighnam: true,    // Nirvighnam complete
                kurumedeva: false   // Kurumedeva not learned yet
              },
              
              phase: PHASES.KURUMEDEVA_GAME_ACTIVE,
              
              currentPopup: null,
              showingCompletionScreen: false,
              gameCoachState: null,
              isReloadingGameCoach: false,
              
              nirvighnamGameState: null,  // Clear first game state
              kurumedevaGameState: null, // Start fresh second state
              
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
              nirvighnamWisdomShown: true,
              kurumedevaWisdomShown: false
            });
            
            console.log('âœ… State set for Kurumedeva game - should start immediately');
          }}>
            SKIP TO KURUMEDEVA
          </div>

          {/* TESTING: Reload test button */}
          <div style={{
            position: 'fixed',
            top: '160px',
            right: '60px',
            zIndex: 9999,
            background: 'blue',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }} onClick={() => {
            console.log('ðŸ§ª TESTING: Reload test clicked');
            console.log('Current sceneState:', sceneState);
            console.log('Nirvighnam game state:', sceneState?.nirvighnamGameState);
            console.log('Mission state:', sceneState?.missionState);
            
            handleSaveComponentState('mission', {
              rescuePhase: 'action',
              word: 'nirvighnam',
              showParticles: true,
              missionJustCompleted: false
            });
            
            handleSaveComponentState('nirvighnamGame', {
              gamePhase: 'playing',
              currentRound: 2,
              playerInput: ['nir', 'vigh'],
              currentSequence: ['nir', 'vigh', 'nam'],
              sequenceItemsShown: 3
            });
            
            console.log('Test states saved - check console for save calls');
          }}>
            TEST RELOAD SAVE
          </div>

                    <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />


          {/* Emergency Reset Button */}
          <div   style={{
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
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 15px rgba(238, 90, 82, 0.4)'
    }
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
                  nirvighnamGameState: null,
                  kurumedevaGameState: null,
                  missionState: {
                    rescuePhase: 'problem',
                    showParticles: false,
                    word: null,
                    missionJustCompleted: false
                  },
                  phase: PHASES.INITIAL,
                  welcomeShown: false,
                  nirvighnamWisdomShown: false,
                  kurumedevaWisdomShown: false,
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

export default NirvighnamChant;
