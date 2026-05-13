// zones/shloka-river/scenes/Scene2/SuryakotiBank.jsx - Updated with Combined Memory Game
import React, { useState, useEffect, useRef } from 'react';
import './SuryakotiBank.css';

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

// NEW: Import combined memory game component and animations
import SimplifiedCombinedMemoryGame from './components/SimplifiedCombinedMemoryGame';

import SunRayArc from './components/SunRayArc';
//import SparkleTrailComponent from './components/SparkleTrailComponent'; // Add this component
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';


import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';

// Images - Suryakoti scene assets
import suryakotiBankBg from './assets/images/Scene2-bg.png';
import sunflowerClose from './assets/images/Suryakoti/sunflower-close.png';
import sunflowerOpen from './assets/images/Suryakoti/sunflower-open.png';
import daisyClose from './assets/images/Suryakoti/daisy-close.png';
import daisyOpen from './assets/images/Suryakoti/daisy-open.png';
import roseClose from './assets/images/Suryakoti/rose-close.png';
import roseOpen from './assets/images/Suryakoti/rose-open.png';
import tulipClose from './assets/images/Suryakoti/tulip-close.png';
import tulipOpen from './assets/images/Suryakoti/tulip-open.png';
import sunOrb from './assets/images/Suryakoti/suryakoti-sun.png';

import rainbowRed from './assets/images/Samaprabha/rainbow-red.png';
import rainbowBlue from './assets/images/Samaprabha/rainbow-blue.png';
import rainbowGreen from './assets/images/Samaprabha/rainbow-green.png';
import rainbowPurple from './assets/images/Samaprabha/rainbow-purple.png';

import bunnySad from './assets/images/Samaprabha/bunny-sad.png';
import bunnyHappy from './assets/images/Samaprabha/bunny-happy.png';
import kittenSad from './assets/images/Samaprabha/kitten-sad.png';
import kittenHappy from './assets/images/Samaprabha/kitten-happy.png';
import puppySad from './assets/images/Samaprabha/puppy-sad.png';
import puppyHappy from './assets/images/Samaprabha/puppy-happy.png';
import squirrelSad from './assets/images/Samaprabha/squirrel-sad.png';
import squirrelHappy from './assets/images/Samaprabha/squirrel-happy.png';

import mangoBubble from './assets/images/Samaprabha/mango-bubble.png';
import mangoPlate from './assets/images/Samaprabha/mango-plate.png';

import ganeshaWithHeadphones from '../assets/images/ganesha_with_headphones.png';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import suryakotiBefore from './assets/images/Suryakoti/suryakoti-before.png';
import suryakotiAfter from './assets/images/Suryakoti/suryakoti-after.png';
import samaprabhaBefore from './assets/images/Samaprabha/samaprabha-before.png'; 
import samaprabhaAfter from './assets/images/Samaprabha/samaprabha-after.png';

// Updated PHASES constant for combined memory game approach
const PHASES = {
  INITIAL: 'initial',
  MEMORY_GAME_ACTIVE: 'memory_game_active',
  SURYAKOTI_COMPLETE: 'suryakoti_complete',
  GANESHA_BLESSING_SURYAKOTI: 'ganesha_blessing_suryakoti',
  CHOICE_BUTTONS_SURYAKOTI: 'choice_buttons_suryakoti',
  RESCUE_MISSION_SURYAKOTI: 'rescue_mission_suryakoti',
  SAMAPRABHA_STORY: 'samaprabha_story',
  SAMAPRABHA_COMPLETE: 'samaprabha_complete',
  GANESHA_BLESSING_SAMAPRABHA: 'ganesha_blessing_samaprabha',
  CHOICE_BUTTONS_SAMAPRABHA: 'choice_buttons_samaprabha',
  RESCUE_MISSION_SAMAPRABHA: 'rescue_mission_samaprabha',
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

const SuryakotiBank = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'suryakoti-bank'
}) => {
  console.log('SuryakotiBank props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Simplified state - combined memory game handles its own logic
          phase: PHASES.INITIAL,
          
          // Learning progress (for progress tracking)
          learnedSyllables: {
            sur: false, ya: false, ko: false, ti: false,
            sa: false, ma: false, pra: false, bha: false
          },
          learnedWords: {
            suryakoti: false,
            samaprabha: false
          },

          unlockedApps: {},

          
          // UNIFIED: Combined state for memory game (like VakratundaGrove)
          memoryGameState: null,
          missionState: {
            rescuePhase: 'problem',
            showParticles: false,
            word: null,
            missionJustCompleted: false
          },
          
          // Message flags
          welcomeShown: false,
          suryakotiWisdomShown: false,
          samaprabhaWisdomShown: false,
          
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
          <SuryakotiBankContent
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

const SuryakotiBankContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('ðŸŒž SuryakotiBankContent render', { 
    sceneState: sceneState?.phase, 
    isReload, 
    memoryGameState: !!sceneState?.memoryGameState,
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

  const [suryakotiPowerGained, setSuryakotiPowerGained] = useState(false);
  const [showCenteredApp, setShowCenteredApp] = useState(null);
  const [blessingWord, setBlessingWord] = useState('');

  // UNIFIED: Single state for rescue mission
  const [showRescueMission, setShowRescueMission] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState('');
  const [showWordCelebration, setShowWordCelebration] = useState(false);

  const [showSamaprabhaStory, setShowSamaprabhaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

    const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
  const [rescuePhase, setRescuePhase] = useState('problem');


  // Add power configuration for Scene 2
  const powerConfig = {
    suryakoti: { name: 'Solar Clarity', icon: 'â˜€ï¸', color: '#FFA500' },
    samaprabha: { name: 'Radiant Light', icon: 'ðŸŒŸ', color: '#FFD700' }
  };

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const playAudio = (audioPath, volume = 1.0) => {
    if (!isAudioOn) return Promise.resolve(); // Skip if muted
    
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

  // At the top of your component, create the reusable function
const resetScene = (showConfirm = true) => {
  if (showConfirm && !confirm('Start this scene from the beginning? You will lose current progress.')) {
    return;
  }

  console.log('Scene reset: User chose to start fresh');
  
  // STEP 1: Set force reset flag FIRST
  setForceMemoryGameReset(true);
  
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
  
  // Clear other UI states with safety checks
  if (typeof setShowParticles !== 'undefined') setShowParticles(false);
  if (typeof setShowPulseRings !== 'undefined') setShowPulseRings(false);
  if (typeof setShowCenteredApp !== 'undefined') setShowCenteredApp(null);
  if (typeof setUnlockedApps !== 'undefined') setUnlockedApps([]);
  if (typeof setSuryakotiPowerGained !== 'undefined') setSuryakotiPowerGained(false);
  if (typeof setBlessingWord !== 'undefined') setBlessingWord('');
  
  // Clear rescue mission states
  if (typeof setShowRescueMission !== 'undefined') setShowRescueMission(false);
  if (typeof setRescuePhase !== 'undefined') setRescuePhase('problem');
  if (typeof setCurrentRescueWord !== 'undefined') setCurrentRescueWord('');
  
  // Clear hint states
  if (typeof setHintUsed !== 'undefined') setHintUsed(false);
  if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
    progressiveHintRef.current.hideHint();
  }
  
  // STEP 4: Hide GameCoach immediately
  if (hideCoach) hideCoach();
  if (clearManualCloseTracking) clearManualCloseTracking();
  
  // STEP 5: Clear memory game completion state
  if (window.simplifiedCombinedMemoryGame && window.simplifiedCombinedMemoryGame.clearCompletionState) {
    window.simplifiedCombinedMemoryGame.clearCompletionState();
  }
  
  // STEP 6: Force memory game reset
  const forceMemoryGameReset = () => {
    if (window.simplifiedCombinedMemoryGame) {
      window.simplifiedCombinedMemoryGame.visualRewards = {};
      window.simplifiedCombinedMemoryGame.activatedSingers = {};
      window.simplifiedCombinedMemoryGame.isForceReset = true;
    }
  };
  
  forceMemoryGameReset();
  
  // STEP 7: Reset scene state
  setTimeout(() => {
    sceneActions.updateState({
      learnedSyllables: {
        sur: false, ya: false, ko: false, ti: false,
        sa: false, ma: false, pra: false, bha: false
      },
      learnedWords: {
        suryakoti: false,
        samaprabha: false
      },
      memoryGameState: null,
          unlockedApps: {},  // â† This is what's missing!

      phase: PHASES.INITIAL,
      welcomeShown: false,
      suryakotiWisdomShown: false,
      samaprabhaWisdomShown: false,
      currentPopup: null,
      showingCompletionScreen: false,
      gameCoachState: null,
      isReloadingGameCoach: false,
      stars: 0,
      completed: false,
      progress: { percentage: 0, starsEarned: 0, completed: false }
    });
    
    setTimeout(() => {
      setForceMemoryGameReset(false);
    }, 1000);
    
    console.log('Scene state reset complete');
  }, 150);
};

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    
    // Save preference to localStorage
    localStorage.setItem('sanskritGameAudio', newAudioState.toString());
    
    // Stop all currently playing audio if muting
    if (!newAudioState) {
      // Stop all audio elements
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

  // UNIFIED: Single state saving function (like VakratundaGrove)
  const handleSaveComponentState = (componentType, componentState) => {
    console.log(`ðŸ’¾ Saving ${componentType} state:`, componentState);
    
    // Prevent double calls by debouncing
    if (handleSaveComponentState.lastCall && 
        Date.now() - handleSaveComponentState.lastCall < 100) {
      console.log('ðŸš« Debounced duplicate save call');
      return;
    }
    handleSaveComponentState.lastCall = Date.now();
    
    const updatedState = {
      ...(componentType === 'memoryGame' && { memoryGameState: componentState }),
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

  // Set up communication with combined memory game
  useEffect(() => {
    window.simplifiedCombinedMemoryGame = {};
    return () => {
      if (window.simplifiedCombinedMemoryGame) {
        delete window.simplifiedCombinedMemoryGame;
      }
    };
  }, []);

  // Set up communication for the scene itself
  useEffect(() => {
    window.suryakotiBank = {
      showSamaprabhaStory: () => {
        setShowSamaprabhaStory(true);
      }
    };
    
    return () => {
      if (window.suryakotiBank) {
        delete window.suryakotiBank;
      }
    };
  }, []);

  // COMPREHENSIVE RELOAD LOGIC - Based on VakratundaGrove pattern
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('ðŸ”„ SURYAKOTI RELOAD: Starting reload', {
      phase: sceneState.phase,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed
    });

    // Check for Play Again flag first
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    if (playAgainRequested === 'true') {
      console.log('ðŸ”„ SURYAKOTI: Fresh restart after Play Again');
      localStorage.removeItem(playAgainKey);
      sceneActions.updateState({ 
        phase: PHASES.INITIAL,
        showingCompletionScreen: false,
        completed: false,
        stars: 0,
        welcomeShown: false,
        // Reset all game states
        memoryGameState: null,
      });
      return;
    }

    // Handle completion screen reload
    if (sceneState.showingCompletionScreen) {
      console.log('ðŸ”„ SURYAKOTI: Resuming completion screen');
      setShowSceneCompletion(true);
      return;
    }

    // Handle specific phases - each phase maps to exact UI state
    switch (sceneState.phase) {
      case PHASES.INITIAL:
        console.log('ðŸ”„ SURYAKOTI: Resuming initial welcome');
        break;
        
      case PHASES.MEMORY_GAME_ACTIVE:
        console.log('ðŸ”„ SURYAKOTI: Memory game active - letting component handle itself');
        // Check if power should be gained
        if (sceneState.learnedWords?.suryakoti === true) {
          setSuryakotiPowerGained(true);
        }
        break;
        
      case PHASES.SURYAKOTI_COMPLETE:
        console.log('ðŸ”„ SURYAKOTI: Resuming Suryakoti completion celebration');
        setBlessingWord('suryakoti');
        setCurrentPracticeWord('suryakoti');
        setShowWordCelebration(true);
        setShowSparkle('suryakoti-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_SURYAKOTI
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.SAMAPRABHA_COMPLETE:
        console.log('ðŸ”„ SURYAKOTI: Resuming Samaprabha completion celebration');
        setBlessingWord('samaprabha');
        setCurrentPracticeWord('samaprabha');
        setSuryakotiPowerGained(true); // Power should be gained here too
        setShowWordCelebration(true);
        setShowSparkle('samaprabha-complete');
        
        setTimeout(() => {
          setShowSparkle(null);
          setShowWordCelebration(false);
          sceneActions.updateState({
            phase: PHASES.GANESHA_BLESSING_SAMAPRABHA
          });
          setBlessingPhase('welcome');
          setShowGaneshaBlessing(true);
        }, 4000);
        break;
        
      case PHASES.GANESHA_BLESSING_SURYAKOTI:
        console.log('ðŸ”„ SURYAKOTI: Resuming Ganesha blessing for Suryakoti');
        setBlessingWord('suryakoti');
        setCurrentPracticeWord('suryakoti');
        // Hide conflicting elements
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        
        // Show only Ganesha blessing
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;

      case PHASES.GANESHA_BLESSING_SAMAPRABHA:
        console.log('ðŸ”„ SURYAKOTI: Resuming Ganesha blessing for Samaprabha');
        setBlessingWord('samaprabha');
        setCurrentPracticeWord('samaprabha');
        setSuryakotiPowerGained(true);
        
        // Hide conflicting elements
        setShowChoiceButtons(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowRecording(false);
        
        // Show only Ganesha blessing
        setShowGaneshaBlessing(true);
        setBlessingPhase('welcome');
        break;
        
      case PHASES.CHOICE_BUTTONS_SURYAKOTI:
        console.log('ðŸ”„ SURYAKOTI: Resuming choice buttons for Suryakoti');
        setCurrentPracticeWord('suryakoti');
        
        // Hide all conflicting UI elements
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowSamaprabhaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');

        setShowChoiceButtons(true);
        break;
        
      case PHASES.CHOICE_BUTTONS_SAMAPRABHA:
        console.log('ðŸ”„ SURYAKOTI: Resuming choice buttons for Samaprabha');
        setCurrentPracticeWord('samaprabha');
        setSuryakotiPowerGained(true);

        // Hide all conflicting UI elements
        setShowGaneshaBlessing(false);
        setShowWordCelebration(false);
        setShowRescueMission(false);
        setShowSamaprabhaStory(false);
        setShowRecording(false);
        setBlessingPhase('complete');

        setShowChoiceButtons(true);
        break;
        
      case PHASES.RESCUE_MISSION_SURYAKOTI:
        console.log('ðŸ”„ SURYAKOTI: Resuming rescue mission for Suryakoti');
        setCurrentRescueWord('suryakoti');
        setShowRescueMission(true);
        break;
        
      case PHASES.SAMAPRABHA_STORY:
        console.log('ðŸ”„ SURYAKOTI: Resuming Samaprabha story');
        setSuryakotiPowerGained(true);
        setShowSamaprabhaStory(true);
        break;
        
      case PHASES.RESCUE_MISSION_SAMAPRABHA:
        console.log('ðŸ”„ SURYAKOTI: Resuming rescue mission for Samaprabha');
        setCurrentRescueWord('samaprabha');
        setSuryakotiPowerGained(true);
        setShowRescueMission(true);
        break;
        
      case PHASES.SCENE_COMPLETE:
        console.log('ðŸ”„ SURYAKOTI: Resuming scene complete');
        if (!sceneState.showingCompletionScreen) {
          setTimeout(() => {
            setShowSparkle('final-fireworks');
          }, 500);
        }
        break;
        
      default:
        console.log('ðŸ”„ SURYAKOTI: No specific reload needed for phase:', sceneState.phase);
    }
  }, [isReload]);

  // Asset getter functions - consolidated for combined memory game
  const getSunOrbImage = (index) => {
    const images = [sunOrb, sunOrb, sunOrb, sunOrb];
    return images[index];
  };

  const getClosedFlowerImage = (index) => {
    const images = [sunflowerClose, daisyClose, roseClose, tulipClose];
    return images[index];
  };

  const getOpenFlowerImage = (index) => {
    const images = [sunflowerOpen, daisyOpen, roseOpen, tulipOpen];
    return images[index];
  };

  const getRainbowImage = (index) => {
    const images = [rainbowRed, rainbowBlue, rainbowGreen, rainbowPurple];
    return images[index];
  };

  const getAnimalImage = (index, isHappy) => {
    const sadImages = [bunnySad, kittenSad, puppySad, squirrelSad];
    const happyImages = [bunnyHappy, kittenHappy, puppyHappy, squirrelHappy];
    return isHappy ? happyImages[index] : sadImages[index];
  };

  const getFruitImage = (index, isCollected) => {
    // Assumes only one type of fruit for now (mango)
    return isCollected ? mangoPlate : mangoBubble;
  };

  const handleSaveAnimal = () => {
    console.log('ðŸ± RESCUE MISSION: Starting animal rescue');
    
    setShowChoiceButtons(false);
    setCurrentRescueWord(currentPracticeWord || blessingWord);
    
    // Update to specific rescue mission phase
    const word = currentPracticeWord || blessingWord;
    sceneActions.updateState({
      phase: word === 'suryakoti' 
        ? PHASES.RESCUE_MISSION_SURYAKOTI 
        : PHASES.RESCUE_MISSION_SAMAPRABHA
    });
    
    // Save mission state
    handleSaveComponentState('mission', {
      rescuePhase: 'problem',
      word: word,
      showParticles: false
    });
    
    setShowRescueMission(true);
  };

  const handleRescueComplete = () => {
    console.log('âœ… Rescue complete for:', currentRescueWord);
    
    // Save the mission state to prevent it from re-triggering on reload
    handleSaveComponentState('mission', {
      rescuePhase: 'success',
      word: currentRescueWord,
      missionJustCompleted: true
    });
    
    // Hide the rescue mission screen
    setShowRescueMission(false);
    
    if (currentRescueWord === 'suryakoti') {
      console.log('Suryakoti rescue complete - showing Samaprabha story now');
      
      // Clean up the UI
      setShowChoiceButtons(false);
      setShowGaneshaBlessing(false);
      setSuryakotiPowerGained(true); // Grant the power from the first word
      
      // Update the scene's main phase to the story of the NEXT game
      sceneActions.updateState({
        phase: PHASES.SAMAPRABHA_STORY
      });
      
      // Show the intro popup for the Samaprabha game
      setTimeout(() => {
        setShowSamaprabhaStory(true);
      }, 500);
      
    } else if (currentRescueWord === 'samaprabha') {
      console.log('Samaprabha rescue complete - FINAL FIREWORKS NOW!');
      
      // Clean up all UI
      setShowChoiceButtons(false);
      setShowGaneshaBlessing(false);
      
      // Update the scene's main phase to SCENE_COMPLETE
      sceneActions.updateState({
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      // Start the final fireworks celebration
      setTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 500);
    }
  };

  const handlePhaseComplete = (phase) => {
    console.log(`Phase ${phase} completed!`);
    
    if (phase === 'suryakoti') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, suryakoti: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          sur: true, ya: true, ko: true, ti: true 
        },
        phase: PHASES.SURYAKOTI_COMPLETE,
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      setBlessingWord('suryakoti');
      setCurrentPracticeWord('suryakoti');
      setShowSparkle('suryakoti-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SURYAKOTI
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      
    } else if (phase === 'samaprabha') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, samaprabha: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          sa: true, ma: true, pra: true, bha: true
        },
        phase: PHASES.SAMAPRABHA_COMPLETE,
        progress: { percentage: 90, starsEarned: 4 }
      });

      // Grant the power from the first game before starting the second's blessing
      setSuryakotiPowerGained(true);
      
      setBlessingWord('samaprabha');
      setCurrentPracticeWord('samaprabha');
      setShowSparkle('samaprabha-complete');
      setShowWordCelebration(true);
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SAMAPRABHA
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
    
    if (currentPracticeWord === 'suryakoti') {
      console.log('Suryakoti continue - showing Samaprabha story now');
      
      // Clean up the screen
      setIsTransitioning(true);
      setShowGaneshaBlessing(false);
      setShowSparkle(null);
      setShowWordCelebration(false);
      setSuryakotiPowerGained(true); // Grant the power from the first word
      
      // Update the scene's main phase to the story of the NEXT game
      sceneActions.updateState({
        phase: PHASES.SAMAPRABHA_STORY,
        // Clear the state of the first game so it doesn't interfere
        memoryGameState: null 
      });
      
      // After a brief moment, show the intro popup for the Samaprabha game
      setTimeout(() => {
        setIsTransitioning(false);
        setShowSamaprabhaStory(true);
      }, 100);
      
    } else if (currentPracticeWord === 'samaprabha') {
      console.log('Samaprabha continue - ending scene');
      
      // Update the scene's main phase to SCENE_COMPLETE
      sceneActions.updateState({
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      // Start the final fireworks celebration
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

  // Handle complete game from combined memory game
  const handleGameComplete = () => {
    console.log('Combined memory game complete! Both words learned.');
  };

  // Audio playback functions
  const handleSyllablePlay = (syllable) => {
    if (!isAudioOn) return;
    
    const syllableFileMap = {
      // Suryakoti syllables
      'sur': 'suryakoti-sur',
      'ya': 'suryakoti-ya', 
      'ko': 'suryakoti-ko',
      'ti': 'suryakoti-ti',
      // Samaprabha syllables
      'sa': 'samaprabha-sa',
      'ma': 'samaprabha-ma',
      'pra': 'samaprabha-pra',
      'bha': 'samaprabha-bha'
    };
    
    const fileName = syllableFileMap[syllable.toLowerCase()] || syllable;
    playAudio(`/audio/syllables/${fileName}.mp3`);
  };

  const handleWordPlay = (word) => {
    if (!isAudioOn) return;
    playAudio(`/audio/words/${word}.mp3`);
  };

  const startPracticeRound = (word, round) => {
    console.log(`Starting practice: ${word} round ${round}`);
    
    if (window.simplifiedCombinedMemoryGame && window.simplifiedCombinedMemoryGame.startPracticeMode) {
      window.simplifiedCombinedMemoryGame.startPracticeMode(word, round);
    }
    
    sceneActions.updateState({
      phase: PHASES.MEMORY_GAME_ACTIVE,
      currentPopup: null
    });
  };

  const getHintConfigs = () => [
    {
      id: 'sequence-listening-hint',
      message: 'Listen to the golden sounds of the sun orbs!',
      explicitMessage: 'Wait for the sequence to finish, then click the sun orbs in the same order to bloom the flowers!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.memoryGameState?.gamePhase === 'listening' && !showRecording;
      }
    },
    {
      id: 'orb-clicking-hint', 
      message: 'Click the sun orbs to repeat the sequence!',
      explicitMessage: 'Click the sun orbs in the order you heard: sur-ya-ko-ti!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.memoryGameState?.gamePhase === 'playing' && !showRecording;
      }
    },
    {
      id: 'recording-hint',
      message: 'Try chanting the word you just learned!',
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
      console.log('Starting combined memory game');
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.MEMORY_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);  

  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        <div className="counter-icon">â˜€ï¸</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{
              width: `${(learnedCount / totalSyllables) * 100}%`,
              background: `linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)`
            }}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
        <div className="counter-label">Solar Sounds</div>
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
    // BOTH words should follow the same pattern
    if (currentRecordingWord === 'suryakoti') {
      console.log('=== CALLING startBlessingAnimation for suryakoti ===');
      startBlessingAnimation();
      
    } else if (currentRecordingWord === 'samaprabha') {
      console.log('=== CALLING startBlessingAnimation for samaprabha ===');
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
      
      // Update to the specific choice buttons phase
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'suryakoti' 
          ? PHASES.CHOICE_BUTTONS_SURYAKOTI 
          : PHASES.CHOICE_BUTTONS_SAMAPRABHA
      });

    } catch (error) {
      console.error('Blessing animation error:', error);
      setShowGaneshaBlessing(false);
      setShowChoiceButtons(true);
      setBlessingPhase('complete');
      
      // Update phase even on error
      const word = blessingWord || currentPracticeWord;
      sceneActions.updateState({
        phase: word === 'suryakoti' 
          ? PHASES.CHOICE_BUTTONS_SURYAKOTI 
          : PHASES.CHOICE_BUTTONS_SAMAPRABHA
      });
    }
  };

  const getSyllableState = (syllable) => {
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    const currentWord = sceneState.learnedWords?.suryakoti ? 'samaprabha' : 'suryakoti';
    const phaseSyllables = currentWord === 'suryakoti'
      ? ['sur', 'ya', 'ko', 'ti']
      : ['sa', 'ma', 'pra', 'bha'];
    
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';
    return 'locked';
  };

  // Determine if combined memory game should be active
  const isCombinedGameActive = sceneState.phase === PHASES.MEMORY_GAME_ACTIVE || 
                             sceneState.phase === PHASES.SURYAKOTI_COMPLETE || 
                             sceneState.phase === PHASES.SAMAPRABHA_COMPLETE;

  // UNIFIED: Extract reload props for combined memory game (like VakratundaGrove)
  const simplifiedCombinedMemoryGameReloadProps = sceneState.memoryGameState ? {
    isReload: isReload,
    initialGamePhase: sceneState.memoryGameState.gamePhase || 'waiting',
    initialCurrentPhase: sceneState.memoryGameState.currentPhase || 'suryakoti',
    initialCurrentRound: sceneState.memoryGameState.currentRound || 1,
    initialPlayerInput: sceneState.memoryGameState.playerInput || [],
    initialCurrentSequence: sceneState.memoryGameState.currentSequence || [],
    initialSequenceItemsShown: sceneState.memoryGameState.sequenceItemsShown || 0,
    initialPermanentTransformations: sceneState.memoryGameState.permanentTransformations || {},
    initialPermanentlyActivatedClickers: sceneState.memoryGameState.permanentlyActivatedClickers || {},
    initialComboStreak: sceneState.memoryGameState.comboStreak || 0,
    initialMistakeCount: sceneState.memoryGameState.mistakeCount || 0,
    phaseJustCompleted: sceneState.memoryGameState.phaseJustCompleted || false,
    lastCompletedPhase: sceneState.memoryGameState.lastCompletedPhase || null,
    gameJustCompleted: sceneState.memoryGameState.gameJustCompleted || false,
    initialIsCountingDown: sceneState.memoryGameState.isCountingDown || false,
    initialCountdown: sceneState.memoryGameState.countdown || 0,
    forcePhase: sceneState.phase === PHASES.MEMORY_GAME_ACTIVE && 
            sceneState.learnedWords?.suryakoti === true && 
            sceneState.learnedWords?.samaprabha === false ? 'samaprabha' : null
  } : {};

  const missionReloadProps = sceneState.missionState ? {
    isReload: isReload && !!sceneState.missionState.word,
    initialRescuePhase: sceneState.missionState.rescuePhase || 'problem',
    initialShowParticles: sceneState.missionState.showParticles || false,
    missionJustCompleted: sceneState.missionState.missionJustCompleted || false,
  } : {};

  // Hide active hints
  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  const handleHintShown = (level) => {
    console.log(`Hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Hint button clicked");
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="suryakoti-bank-container">
          <div className="river-background" style={{ backgroundImage: `url(${suryakotiBankBg})` }}>

            {/* UNIFIED: Combined Memory Game Component */}
<SimplifiedCombinedMemoryGame
              isActive={isCombinedGameActive}
              hideElements={isTransitioning || 
                showSamaprabhaStory || 
                sceneState.phase === PHASES.SURYAKOTI_COMPLETE || 
                sceneState.phase === PHASES.SAMAPRABHA_COMPLETE ||
                sceneState.phase === PHASES.SCENE_COMPLETE}
              powerGained={suryakotiPowerGained}
              onPhaseComplete={handlePhaseComplete}
              onGameComplete={handleGameComplete}
              profileName={profileName}
                forceReset={forceMemoryGameReset} // ADD THIS LINE
              
              // Animation components
              SunRayComponent={SunRayArc}
              
              // Asset getters - consolidated for both phases
              getSunOrbImage={getSunOrbImage}
           getWiltedFlowerImage={getClosedFlowerImage}    // Same function, different name
getBloomedFlowerImage={getOpenFlowerImage}     // Same function, different name
              getRainbowImage={getRainbowImage}
              getFruitImage={getFruitImage}
              getAnimalImage={getAnimalImage}
              getSadAnimalImage={(index) => getAnimalImage(index, 0)}     // Sad animals
getHappyAnimalImage={(index) => getAnimalImage(index, 1)}   // Happy animals
              
              isAudioOn={isAudioOn}
              playAudio={playAudio}
              
              // UNIFIED: State saving for reload support
              onSaveGameState={(gameState) => handleSaveComponentState('memoryGame', gameState)}
              onCleanup={() => console.log('Combined memory game cleaned up')}
              
              // Reload support props
              {...simplifiedCombinedMemoryGameReloadProps}
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
                  color: '#FF8C00',
                  marginBottom: '10px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  The Solar Garden
                </div>
                
                <div style={{
                  fontSize: '15px',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  Help the sun orbs bloom the sleeping flowers
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  Click sun orbs to send golden rays and awaken flowers
                </div>
                
                <button
                  onClick={() => {
                    sceneActions.updateState({ 
                      welcomeShown: true,
                      phase: PHASES.MEMORY_GAME_ACTIVE 
                    });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)'
                  }}
                >
                  Begin Solar Adventure
                </button>
              </div>
            )}

            {showSamaprabhaStory && (
              <>
                {/* Story Introduction */}
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
                    color: '#9400D3',
                    marginBottom: '10px'
                  }}>
                    The Rainbow Bridge
                  </div>
                  
                  <div style={{
                    fontSize: '15px',
                    color: '#1565C0',
                    marginBottom: '8px'
                  }}>
                    The little animals are sad. Their colorful world has turned grey!
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    Use your new Solar Clarity power to help them chant and bring back the colors.
                  </div>              
                  <button
                    onClick={() => {
                      console.log('Begin Rainbow Bridge clicked - starting Samaprabha properly');
                      
                      setIsTransitioning(true);
                      setShowSamaprabhaStory(false);
                      
                      setTimeout(() => {
                        sceneActions.updateState({ 
                          phase: PHASES.MEMORY_GAME_ACTIVE,
                          currentPopup: null,
                          memoryGameState: null  // Clear old state
                        });
                        
                        // Start Samaprabha immediately
                        setTimeout(() => {
                          if (window.simplifiedCombinedMemoryGame?.startSamaprabhaPhase) {
                            window.simplifiedCombinedMemoryGame.startSamaprabhaPhase();
                          }
                        }, 200);
                        
                        setTimeout(() => {
                          setIsTransitioning(false);
                        }, 400);
                        
                      }, 100);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #9400D3 0%, #4B0082 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '12px 25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      cursor: 'pointer'
                    }}
                  >
                    Build the Bridge
                  </button>
                </div>
              </>
            )}

            {/* Rest of the components remain the same as original SuryakotiBank... */}
            
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
                  src={showCenteredApp === 'suryakoti' ? appSuryakoti : appSamaprabha}
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
    ...(sceneState.unlockedApps || {})  // suryakoti, samaprabha
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
             !showSamaprabhaStory && 
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
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513', marginBottom: '5px' }}>
                            Wonderful work!
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
                          <div className="speech-subtext">This power is now flowing to you...</div>
                        </>
                      )}
                      
                      {blessingPhase === 'transfer' && (
                        <>
                          <div className="speech-text" style={{ color: powerConfig[currentPracticeWord]?.color }}>
                            Power flowing to you...
                          </div>
                          <div className="speech-subtext">Feel the ancient energy!</div>
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

            <SaveAnimalMission
              show={showRescueMission}
              word={currentRescueWord}
              beforeImage={currentRescueWord === 'suryakoti' ? suryakotiBefore : samaprabhaBefore}
              afterImage={currentRescueWord === 'suryakoti' ? suryakotiAfter : samaprabhaAfter}
              powerConfig={powerConfig[currentRescueWord]}
              smartwatchBase={smartwatchBase}
              smartwatchScreen={smartwatchScreen}
              appImage={currentRescueWord === 'suryakoti' ? appSuryakoti : appSamaprabha}
              boyCharacter={boyNamaste}
              onComplete={handleRescueComplete}
              onCancel={() => setShowRescueMission(false)}
              
              // The reload support props
              {...missionReloadProps}
              onSaveMissionState={(missionState) => handleSaveComponentState('mission', missionState)}
            />

            {/* Audio Practice Popup */}
            {showAudioPractice && (
              <div className="audio-practice-popup">
                <div className="audio-practice-content">
                  <div className="practice-title">Practice {currentPracticeWord}</div>
                  <div className="syllable-buttons">
                    {currentPracticeWord === 'suryakoti' ? 
                      ['SUR', 'YA', 'KO', 'TI'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      )) :
                      ['SA', 'MA', 'PRA', 'BHA'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      ))
                    }
                  </div>
                  <button className="word-practice-btn" onClick={() => handleWordPlay(currentPracticeWord)}>
                    ðŸŽµ {currentPracticeWord.toUpperCase()}
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
                  ðŸ± Save an Animal
                </button>
                <button className="choice-btn continue-learning-btn" onClick={handleContinueLearning}>
                  {currentPracticeWord === 'samaprabha' ? 'âœ¨ End Scene' : 'âš¡ Continue Learning'}
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
                  color: (blessingWord || currentPracticeWord) === 'suryakoti' ? '#FFD700' : '#FF6B35',
                  textShadow: `0 0 20px ${(blessingWord || currentPracticeWord) === 'suryakoti' ? 'rgba(255, 215, 0, 0.8)' : 
                    'rgba(255, 107, 53, 0.8)'}`,
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
            {showSparkle === 'suryakoti-complete' && (
              <SparkleAnimation
                type="glitter"
                count={40}
                color="#4ECDC4"
                size={18}
                duration={4000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'samaprabha-complete' && (
              <SparkleAnimation
                type="magic"
                count={50}
                color="#d16dffff"
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
              {/* Namaste Boy during celebration */}
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
              
              {/* Ganesha during celebration */}
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

          {/* Final Fireworks */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={8000}
              count={25}
              colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
              onComplete={() => {
                console.log('ðŸŽ¯ suryakoti-bank fireworks complete');
                setShowSparkle(null);
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('shloka-river', 'suryakoti-bank', {
                    completed: true,
                    stars: 5,
                    syllables: sceneState?.learnedSyllables || {},
                    words: sceneState?.learnedWords || {},
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  localStorage.removeItem(`temp_session_${profileId}_shloka-river_suryakoti-bank`);
                  SimpleSceneManager.clearCurrentScene();
                  console.log('âœ… suryakoti-bank : Completion saved and temp session cleared');
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}
          
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Suryakoti Bank"
            sceneNumber={2}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
         discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha']}
  containerType="smartwatch"
  containerScreenImage={smartwatchScreen}
  appImages={{
    vakratunda: appVakratunda,
    mahakaya: appMahakaya,
    suryakoti: appSuryakoti,
    samaprabha: appSamaprabha,
  }}

            nextSceneName="Nirvighnam Chant"
            sceneId="suryakoti-bank"
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
              console.log('SANSKRIT CONTINUE: Going to next scene + preserving resume');
              
              if (clearManualCloseTracking) {
                clearManualCloseTracking();
                console.log('SANSKRIT CONTINUE: GameCoach manual tracking cleared');
              }
              if (hideCoach) {
                hideCoach();
                console.log('SANSKRIT CONTINUE: GameCoach hidden');
              }
              
              setTimeout(() => {
                console.log('SANSKRIT CONTINUE: Forcing GameCoach fresh start for next scene');
                if (clearManualCloseTracking) {
                  clearManualCloseTracking();
                }
              }, 500);
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'suryakoti-bank', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords,
                  chantedVerses: {
                    'suryakoti-chant': true,
                    'samaprabha-chant': true
                  }
                });

                GameStateManager.saveGameState('shloka-river', 'suryakoti-bank', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });

                console.log('SANSKRIT CONTINUE: Completion data saved');
              }

              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'nirvighnam-chant', false, false);
                console.log('SANSKRIT CONTINUE: Next scene (nirvighnam-chant) set for resume tracking');
                
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          />        
          
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


          {/* Emergency Reset Button */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '90px',
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
                  memoryGameState: null,
                  missionState: {
                    rescuePhase: 'problem',
                    showParticles: false,
                    word: null,
                    missionJustCompleted: false
                  },
                  phase: PHASES.INITIAL,
                  welcomeShown: false,
                  suryakotiWisdomShown: false,
                  samaprabhaWisdomShown: false,
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

export default SuryakotiBank;
