// zones/shloka-river/scenes/Scene2/SuryakotiBank.jsx - Scene 2 with Sun/Rainbow mechanics
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

// NEW: Import sun/rainbow game components
import SuryakotiMemoryGame from './components/SuryakotiMemoryGame';
import SamaprabhaRainbowGame from './components/SamaprabhaRainbowGame';
import SunRayArc from './components/SunRayArc';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';

import CombinedMemoryGame from './components/CombinedMemoryGame';


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
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import suryakotiBefore from './assets/images/Suryakoti/suryakoti-before.png';
import suryakotiAfter from './assets/images/Suryakoti/suryakoti-after.png';
import samaprabhaBefore from './assets/images/Samaprabha/samaprabha-before.png'; 
import samaprabhaAfter from './assets/images/Samaprabha/samaprabha-after.png';

// Updated PHASES constant for Scene 2
const PHASES = {
  INITIAL: 'initial',
  SURYAKOTI_GAME_ACTIVE: 'suryakoti_game_active',
  SURYAKOTI_COMPLETE: 'suryakoti_complete',
  GANESHA_BLESSING_SURYAKOTI: 'ganesha_blessing_suryakoti',
  CHOICE_BUTTONS_SURYAKOTI: 'choice_buttons_suryakoti',
  RESCUE_MISSION_SURYAKOTI: 'rescue_mission_suryakoti',
  SAMAPRABHA_STORY: 'samaprabha_story',
  SAMAPRABHA_GAME_ACTIVE: 'samaprabha_game_active',
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
          // Simplified state - memory games handle their own logic
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
          
          // UNIFIED: Combined state for both games
          suryakotiGameState: null,
          samaprabhaGameState: null,
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
  console.log('🌞 SuryakotiBankContent render', { 
    sceneState: sceneState?.phase, 
    isReload, 
    suryakotiGameState: !!sceneState?.suryakotiGameState,
    samaprabhaGameState: !!sceneState?.samaprabhaGameState,
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


  // Add power configuration for Scene 2
  const powerConfig = {
    suryakoti: { name: 'Solar Clarity', icon: '☀️', color: '#FFA500' },
    samaprabha: { name: 'Radiant Light', icon: '🌟', color: '#FFD700' }
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

  // 3. Load audio preference on component mount
useEffect(() => {
  const savedAudioPreference = localStorage.getItem('sanskritGameAudio');
  if (savedAudioPreference !== null) {
    setIsAudioOn(savedAudioPreference === 'true');
  }
}, []);

// UNIFIED: Single state saving function for both components
const handleSaveComponentState = (componentType, componentState) => {
  console.log(`💾 Saving ${componentType} state:`, componentState);
  
  // Prevent double calls by debouncing
  if (handleSaveComponentState.lastCall && 
      Date.now() - handleSaveComponentState.lastCall < 100) {
    console.log('🚫 Debounced duplicate save call');
    return;
  }
  handleSaveComponentState.lastCall = Date.now();
  
  const updatedState = {
    ...(componentType === 'suryakotiGame' && { suryakotiGameState: componentState }),
    ...(componentType === 'samaprabhaGame' && { 
      samaprabhaGameState: {
        ...sceneState.samaprabhaGameState,
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
  
  console.log(`⚡ Updating scene state with ${componentType}:`, updatedState);
  sceneActions.updateState(updatedState);
};

  // Set up communication with our game components
  useEffect(() => {
    // We create a channel specifically for our new game component.
    // This allows the game to call functions if it needs to.
    window.suryakotiMemoryGame = {};
    return () => {
      if (window.suryakotiMemoryGame) {
        delete window.suryakotiMemoryGame;
      }
    };
  }, []);

  // Set up communication for the scene itself
  useEffect(() => {
    // This object is named after our scene: SuryakotiBank.
    window.suryakotiBank = {
      // The function is now named to match our next story part.
      showSamaprabhaStory: () => {
        // It calls the state setter for the Samaprabha story.
        setShowSamaprabhaStory(true);
      }
    };
    
    return () => {
      if (window.suryakotiBank) {
        delete window.suryakotiBank;
      }
    };
  }, []);

  // Add a separate useEffect to handle word celebration -> Ganesha blessing:
  /*useEffect(() => {
    if (showWordCelebration && (blessingWord || currentPracticeWord)) {
      const timer = safeSetTimeout(() => {
        setShowWordCelebration(false);
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWordCelebration, blessingWord, currentPracticeWord]);*/

  // This is the Master Restorer for the Suryakoti Bank scene
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 SANSKRIT RELOAD: Starting reload', {
    phase: sceneState.phase,
    showingCompletionScreen: sceneState.showingCompletionScreen,
    completed: sceneState.completed
  });

    // This part for handling "Play Again" can stay the same
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    if (playAgainRequested === 'true') {
      console.log('🔄 SURYAKOTI: Fresh restart after Play Again');
      localStorage.removeItem(playAgainKey);
      sceneActions.updateState({ 
        phase: PHASES.INITIAL,
        showingCompletionScreen: false,
        completed: false,
        stars: 0,
        welcomeShown: false,
        // Reset all game states
        suryakotiGameState: null,
        samaprabhaGameState: null,
      });
      return;
    }

    // Handle completion screen reload
    if (sceneState.showingCompletionScreen) {
      console.log('🔄 SURYAKOTI: Resuming completion screen');
      setShowSceneCompletion(true);
      return;
    }

    // --- THIS IS THE MAIN CHANGE: A new script for each phase ---
    switch (sceneState.phase) {
      case PHASES.INITIAL:
        console.log('🔄 SURYAKOTI: Resuming initial welcome');
        break;
        
      case PHASES.SURYAKOTI_GAME_ACTIVE:
        console.log('🔄 SURYAKOTI: Suryakoti game active - letting component handle itself');
        break;

      case PHASES.SAMAPRABHA_GAME_ACTIVE:
        console.log('🔄 SURYAKOTI: Samaprabha game active - letting component handle itself');
        // Make sure the power from the first game is restored
        setSuryakotiPowerGained(true);
        break;
        
      case PHASES.SURYAKOTI_COMPLETE:
        console.log('🔄 SURYAKOTI: Resuming Suryakoti completion celebration');
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
        console.log('🔄 SURYAKOTI: Resuming Samaprabha completion celebration');
        setBlessingWord('samaprabha');
        setCurrentPracticeWord('samaprabha');
        //setSuryakotiPowerGained(true); // Power should be gained here too
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
        console.log('🔄 SURYAKOTI: Resuming Ganesha blessing for Suryakoti');
        setBlessingWord('suryakoti');
        setCurrentPracticeWord('suryakoti');
      // Hide conflicting elements
      setShowChoiceButtons(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowRecording(false);
      
      // Show only Ganesha blessing
      setShowGaneshaBlessing(true);
      setBlessingPhase('welcome'); // FIX 4: Always start at welcome phase
      break;

     case PHASES.GANESHA_BLESSING_SAMAPRABHA:
        console.log('🔄 SURYAKOTI: Resuming Ganesha blessing for Samaprabha');
        setBlessingWord('samaprabha');
        setCurrentPracticeWord('samaprabha');
            // Hide conflicting elements
      setShowChoiceButtons(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowRecording(false);
      
      // Show only Ganesha blessing
      setShowGaneshaBlessing(true);
      setBlessingPhase('welcome'); // FIX 4: Always start at welcome phase
      break;
        
      case PHASES.CHOICE_BUTTONS_SURYAKOTI:
        console.log('🔄 SURYAKOTI: Resuming choice buttons for Suryakoti');
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
        console.log('🔄 SURYAKOTI: Resuming choice buttons for Samaprabha');
        setCurrentPracticeWord('samaprabha');

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
        console.log('🔄 SURYAKOTI: Resuming rescue mission for Suryakoti');
        setCurrentRescueWord('suryakoti');
        setShowRescueMission(true);
        break;
        
      case PHASES.SAMAPRABHA_STORY:
        console.log('🔄 SURYAKOTI: Resuming Samaprabha story');
        setSuryakotiPowerGained(true);
        setShowSamaprabhaStory(true);
        break;
        
      case PHASES.RESCUE_MISSION_SAMAPRABHA:
        console.log('🔄 SURYAKOTI: Resuming rescue mission for Samaprabha');
        setCurrentRescueWord('samaprabha');
        setSuryakotiPowerGained(true);
        setShowRescueMission(true);
        break;
        
      case PHASES.SCENE_COMPLETE:
        console.log('🔄 SURYAKOTI: Resuming scene complete');
        if (!sceneState.showingCompletionScreen) {
          setTimeout(() => {
            setShowSparkle('final-fireworks');
          }, 500);
        }
        break;
        
      default:
        console.log('🔄 SURYAKOTI: No specific reload needed for phase:', sceneState.phase);
    }
  }, [isReload]);

 
  // Get Sun Orb images for the Suryakoti game
  const getSunOrbImage = (index) => {
    // Make sure 'sunOrb' is imported at the top of your file!
    const images = [sunOrb, sunOrb, sunOrb, sunOrb];
    return images[index];
  };
  // Get flower images for the Suryakoti game
  const getSunflowerImage = (state) => state ? sunflowerOpen : sunflowerClose;
  const getDaisyImage = (state) => state ? daisyOpen : daisyClose;
  const getRoseImage = (state) => state ? roseOpen : roseClose;
  const getTulipImage = (state) => state ? tulipOpen : tulipClose;

  // Get images for the Samaprabha game (for later)
  const getRainbowImage = (index) => {
    const images = [rainbowRed, rainbowBlue, rainbowGreen, rainbowPurple];
    return images[index];
  };

  // This one function now handles both sad and happy animals
  const getAnimalImage = (index, isHappy) => {
    const sadImages = [bunnySad, kittenSad, puppySad, squirrelSad];
    const happyImages = [bunnyHappy, kittenHappy, puppyHappy, squirrelHappy];
    return isHappy ? happyImages[index] : sadImages[index];
  };

  // This one function handles both the fruit bubble and the collected fruit
  const getFruitImage = (index, isCollected) => {
    // Assumes only one type of fruit for now (mango)
    return isCollected ? mangoPlate : mangoBubble;
  };

  const handleSaveAnimal = () => {
    console.log('🐱 RESCUE MISSION: Starting animal rescue');
    
    // This part stays the same
    setShowChoiceButtons(false);
    setCurrentRescueWord(currentPracticeWord || blessingWord);
    
    // Figure out which word we are using for the mission
    const word = currentPracticeWord || blessingWord;

    // --- THIS IS THE MAIN CHANGE ---
    // Update the scene phase to the correct rescue mission
    sceneActions.updateState({
      phase: word === 'suryakoti' // We check for 'suryakoti' now
        ? PHASES.RESCUE_MISSION_SURYAKOTI // If it is, use the SURYAKOTI phase
        : PHASES.RESCUE_MISSION_SAMAPRABHA // Otherwise, use the SAMAPRABHA phase
    });
    
    // This part stays mostly the same, it just uses our new 'word' variable
    handleSaveComponentState('mission', {
      rescuePhase: 'problem',
      word: word,
      showParticles: false
    });
    
    setShowRescueMission(true);
  };

  const handleRoundJump = (round) => {
  console.log(`Jumping to round ${round} in main scene`);
  
  // Update main scene state to reflect the round change
  sceneActions.updateState({
    // Update any relevant scene state for the new round
    currentRound: round
  });
};

  const handleRescueComplete = () => {
    console.log('✅ Rescue complete for:', currentRescueWord);
    
    // Save the mission state to prevent it from re-triggering on reload
    handleSaveComponentState('mission', {
      rescuePhase: 'success',
      word: currentRescueWord,
      missionJustCompleted: true
    });
    
    // Hide the rescue mission screen
    setShowRescueMission(false);
    
    // --- THIS IS THE MAIN CHANGE ---

    // IF the first rescue mission ('suryakoti') is complete...
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
      
    // ELSE IF the final rescue mission ('samaprabha') is complete...
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
    
    // --- THIS IS THE LOGIC FOR THE FIRST GAME ---
    if (phase === 'suryakoti') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, suryakoti: true }, // The new word
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          // The new syllables for this word
          sur: true, ya: true, ko: true, ti: true 
        },
        phase: PHASES.SURYAKOTI_COMPLETE, // The new, correct phase
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      // Set up the celebration and blessing with the new word
      setBlessingWord('suryakoti');
      setCurrentPracticeWord('suryakoti');
      setShowSparkle('suryakoti-complete');
      setShowWordCelebration(true);
      
      // After 4 seconds, transition to the Ganesha blessing
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SURYAKOTI // The new blessing phase
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      
    // --- THIS IS THE LOGIC FOR THE SECOND GAME ---
    } else if (phase === 'samaprabha') {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, samaprabha: true }, // The new word
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          // The new syllables for this word
          sa: true, ma: true, pra: true, bha: true
        },
        phase: PHASES.SAMAPRABHA_COMPLETE, // The new, correct phase
        progress: { percentage: 90, starsEarned: 4 }
      });

      // Grant the power from the first game before starting the second's blessing
      setSuryakotiPowerGained(true);
      
      // Set up the celebration and blessing with the new word
      setBlessingWord('samaprabha');
      setCurrentPracticeWord('samaprabha');
      setShowSparkle('samaprabha-complete');
      setShowWordCelebration(true);
      
      // After 4 seconds, transition to the Ganesha blessing
      safeSetTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_SAMAPRABHA // The new blessing phase
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
    
    // This part stays the same
    setShowChoiceButtons(false);
    
    // --- THIS IS THE MAIN CHANGE ---

    // IF the first word was 'suryakoti'...
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
        suryakotiGameState: null 
      });
      
      // After a brief moment, show the intro popup for the Samaprabha game
      setTimeout(() => {
        setIsTransitioning(false);
        setShowSamaprabhaStory(true);
      }, 100);
      
    // ELSE IF the final word was 'samaprabha'...
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

  // Handle complete game from memory game
  const handleGameComplete = () => {
    console.log('Memory game complete! Both words learned.');
  };

  // --- This new block replaces the old sound functions ---

  // Plays the correct audio for a given syllable
  const handleSyllablePlay = (syllable) => {
    if (!isAudioOn) return;
    
    // THIS IS THE MAIN CHANGE: A new map for our new syllables
    const syllableFileMap = {
      // Syllables for Suryakoti
      'sur': 'suryakoti-sur',
      'ya': 'suryakoti-ya', 
      'ko': 'suryakoti-ko',
      'ti': 'suryakoti-ti',

      // Syllables for Samaprabha
      'sa': 'samaprabha-sa',
      'ma': 'samaprabha-ma',
      'pra': 'samaprabha-pra',
      'bha': 'samaprabha-bha'
    };
    
    const fileName = syllableFileMap[syllable.toLowerCase()] || syllable;
    playAudio(`/audio/syllables/${fileName}.mp3`);
  };

  // Plays the correct audio for a given word
  const handleWordPlay = (word) => {
    if (!isAudioOn) return;
    
    // This is a simplified version that just plays the word file directly
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

  const getHintConfigs = () => [
    {
      id: 'sequence-listening-hint',
      message: 'Listen to the golden sounds of the sun orbs!',
      // THIS IS THE MAIN CHANGE: New, specific hint text
      explicitMessage: 'Wait for the sequence to finish, then click the sun orbs in the same order to bloom the flowers!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      // The condition logic can stay the same
      condition: (sceneState) => {
        // This condition checks the internal state of the memory game component
        return sceneState?.suryakotiGameState?.gamePhase === 'listening' && !showRecording;
      }
    },
    {
      id: 'orb-clicking-hint', 
      message: 'Click the sun orbs to repeat the sequence!',
      // THIS IS THE MAIN CHANGE: New, specific hint text
      explicitMessage: 'Click the sun orbs in the order you heard: sur-ya-ko-ti!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.suryakotiGameState?.gamePhase === 'playing' && !showRecording;
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
      console.log('Starting Suryakoti memory game');
      safeSetTimeout(() => {
        // --- THIS IS THE KEY CHANGE ---
        // We now set the phase to start our specific game
        sceneActions.updateState({ phase: PHASES.SURYAKOTI_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);  

  // Auto-start memory game after welcome
  useEffect(() => {
    // This watches for the welcome screen to be closed
    if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown) {
      console.log('Starting Suryakoti memory game');
      safeSetTimeout(() => {
        // --- THIS IS THE KEY CHANGE ---
        // It now sets the phase to start our specific Suryakoti game
        sceneActions.updateState({ phase: PHASES.SURYAKOTI_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // This function creates the UI for the syllable progress counter
  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        {/* --- UI THEME CHANGE 1: New Icon --- */}
        <div className="counter-icon">☀️</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{
              width: `${(learnedCount / totalSyllables) * 100}%`,
              // --- UI THEME CHANGE 2: New Colors ---
              background: `linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)`
            }}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
        {/* --- UI THEME CHANGE 3: New Label --- */}
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
    console.log('=== CALLING startBlessingAnimation for samaprabha ==='); // FIXED: Same pattern
    startBlessingAnimation(); // FIXED: Don't skip to fireworks
  }
};

// Updated startBlessingAnimation function - add phase update after setShowChoiceButtons
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
    
    // This is the second half of the startBlessingAnimation function

    if (window.smartwatchWidget) {
      window.smartwatchWidget.addApp({
        id: wordToProcess,
        name: wordToProcess,
        // --- CHANGE 1: Use the correct app images ---
        image: wordToProcess === 'suryakoti' ? appSuryakoti : appSamaprabha,
        // --- CHANGE 2: Use the correct scene ID ---
        sceneId: 'suryakoti-bank', 
        power: powerConfig[wordToProcess]
      });
    }

    await new Promise(resolve => safeSetTimeout(resolve, 1000));

    setShowGaneshaBlessing(false);
    setShowChoiceButtons(true);
    setBlessingPhase('complete');
    
    // Update to the specific choice buttons phase
    const word = blessingWord || currentPracticeWord;
    sceneActions.updateState({
      // --- THIS IS THE MAIN CHANGE ---
      phase: word === 'suryakoti' // Check for the new word
        ? PHASES.CHOICE_BUTTONS_SURYAKOTI // Use the new phase
        : PHASES.CHOICE_BUTTONS_SAMAPRABHA // Use the other new phase
    });

  } catch (error) {
    console.error('Blessing animation error:', error);
    setShowGaneshaBlessing(false);
    setShowChoiceButtons(true);
    setBlessingPhase('complete');
    
    // Update phase even on error (the "Safety Net")
    const word = blessingWord || currentPracticeWord;
    sceneActions.updateState({
      // --- THE SAME CHANGE IS MADE HERE ---
      phase: word === 'suryakoti' // Check for the new word
        ? PHASES.CHOICE_BUTTONS_SURYAKOTI // Use the new phase
        : PHASES.CHOICE_BUTTONS_SAMAPRABHA // Use the other new phase
    });
  }
}; // This marks the end of the startBlessingAnimation function

  const getSyllableState = (syllable) => {
    // Check if the syllable is already in our list of learned ones
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    // --- THIS IS THE MAIN CHANGE ---

    // Figure out which word we are currently learning
    const currentWord = sceneState.learnedWords?.suryakoti ? 'samaprabha' : 'suryakoti';
    
    // Define the syllables for each word in our new scene
    const phaseSyllables = currentWord === 'suryakoti'
      ? ['sur', 'ya', 'ko', 'ti']
      : ['sa', 'ma', 'pra', 'bha'];
    
    // If the syllable is in the current word's list, it's 'current'
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';

    // Otherwise, it's still locked
    return 'locked';
  };

  // NOTE: We have removed the 'isMemoryGameActive' variable.
  // The activity of each game is now controlled directly in the JSX
  // with its 'isActive' prop, which is a clearer way to handle two separate games.

  // Determine if memory game should be active
  /*const isMemoryGameActive = sceneState.phase === PHASES.MEMORY_GAME_ACTIVE || 
                           sceneState.phase === PHASES.VAKRATUNDA_COMPLETE;*/

// In SuryakotiBank.jsx - Add this reload props extraction

// In SuryakotiBank.jsx - Add this reload props extraction

// UNIFIED: Extract reload props for both components
const suryakotiMemoryGameReloadProps = sceneState.suryakotiGameState ? {
  isReload: isReload,
  initialGamePhase: sceneState.suryakotiGameState.gamePhase || 'waiting',
  initialCurrentRound: sceneState.suryakotiGameState.currentRound || 1,
  initialPlayerInput: sceneState.suryakotiGameState.playerInput || [],
  initialCurrentSequence: sceneState.suryakotiGameState.currentSequence || [],
  initialSequenceItemsShown: sceneState.suryakotiGameState.sequenceItemsShown || 0,
  initialPermanentlyBloomed: sceneState.suryakotiGameState.permanentlyBloomed || {},
  initialPermanentlyActivated: sceneState.suryakotiGameState.permanentlyActivated || {}, // ADD THIS LINE
  initialComboStreak: sceneState.suryakotiGameState.comboStreak || 0,
  initialMistakeCount: sceneState.suryakotiGameState.mistakeCount || 0,
  phaseJustCompleted: sceneState.suryakotiGameState.phaseJustCompleted || false,
  lastCompletedPhase: sceneState.suryakotiGameState.lastCompletedPhase || null,
  gameJustCompleted: sceneState.suryakotiGameState.gameJustCompleted || false,
  initialIsCountingDown: sceneState.suryakotiGameState.isCountingDown || false,
  initialCountdown: sceneState.suryakotiGameState.countdown || 0
} : {};

const samaprabhaRainbowGameReloadProps = sceneState.samaprabhaGameState ? {
  isReload: isReload,
  initialGamePhase: sceneState.samaprabhaGameState.gamePhase || 'waiting',
  initialCurrentRound: sceneState.samaprabhaGameState.currentRound || 1,
  initialPlayerInput: sceneState.samaprabhaGameState.playerInput || [],
  initialCurrentSequence: sceneState.samaprabhaGameState.currentSequence || [],
  initialSequenceItemsShown: sceneState.samaprabhaGameState.sequenceItemsShown || 0,
  initialPermanentTransformations: sceneState.samaprabhaGameState.permanentTransformations || {},
  initialPermanentlyActivatedRainbows: sceneState.samaprabhaGameState.permanentlyActivatedRainbows || {},
  initialComboStreak: sceneState.samaprabhaGameState.comboStreak || 0,
  initialMistakeCount: sceneState.samaprabhaGameState.mistakeCount || 0,
  phaseJustCompleted: sceneState.samaprabhaGameState.phaseJustCompleted || false,
  lastCompletedPhase: sceneState.samaprabhaGameState.lastCompletedPhase || null,
  gameJustCompleted: sceneState.samaprabhaGameState.gameJustCompleted || false,
  initialIsCountingDown: sceneState.samaprabhaGameState.isCountingDown || false,
  initialCountdown: sceneState.samaprabhaGameState.countdown || 0
} : {};

  const missionReloadProps = sceneState.missionState ? {
    isReload: isReload && !!sceneState.missionState.word,
    initialRescuePhase: sceneState.missionState.rescuePhase || 'problem',
    initialShowParticles: sceneState.missionState.showParticles || false,
    missionJustCompleted: sceneState.missionState.missionJustCompleted || false,
    // FIX 2: Add special flag for Mahakaya reload detection

  } : {};

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
    return <div className="loading">Loading scene state...</div>;
  }

 return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="suryakoti-bank-container">
          <div className="river-background" style={{ backgroundImage: `url(${suryakotiBankBg})` }}>


            {/* Suryakoti Memory Game */}
            <SuryakotiMemoryGame
              // Add these props:
  getSunflowerImage={getSunflowerImage}
  getDaisyImage={getDaisyImage} 
  getRoseImage={getRoseImage}
  getTulipImage={getTulipImage}
    getSunOrbImage={getSunOrbImage}

              isActive={sceneState.phase === PHASES.SURYAKOTI_GAME_ACTIVE || 
                       sceneState.phase === PHASES.SURYAKOTI_COMPLETE}
              hideElements={isTransitioning || 
                showGaneshaBlessing || showSamaprabhaStory || 
                sceneState.phase === PHASES.SURYAKOTI_COMPLETE || 
                sceneState.phase === PHASES.SCENE_COMPLETE}
              powerGained={suryakotiPowerGained}
              onPhaseComplete={handlePhaseComplete}
              profileName={profileName}
              
              // Asset getters
              /*getFlowerCloseImage={getFlowerCloseImage}
              getFlowerOpenImage={getFlowerOpenImage}*/
              
              isAudioOn={isAudioOn}
              playAudio={playAudio}
              
              // Pass SunRayArc component
              SunRayComponent={SunRayArc}
              
              // State saving for reload support
              onSaveGameState={(gameState) => handleSaveComponentState('suryakotiGame', gameState)}
              onCleanup={() => console.log('Suryakoti game cleaned up')}
              
             // FIXED: Use the correctly structured reload props
  {...suryakotiMemoryGameReloadProps}
  onRoundJump={(round) => handleRoundJump(round)}

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
                      phase: PHASES.SURYAKOTI_GAME_ACTIVE 
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

            
            {/* Samaprabha Rainbow Game */}
            <SamaprabhaRainbowGame
              isActive={sceneState.phase === PHASES.SAMAPRABHA_GAME_ACTIVE || 
                       sceneState.phase === PHASES.SAMAPRABHA_COMPLETE}
              hideElements={isTransitioning || 
                showGaneshaBlessing || 
                sceneState.phase === PHASES.SAMAPRABHA_COMPLETE || 
                sceneState.phase === PHASES.SCENE_COMPLETE}
              suryakotiPowerGained={suryakotiPowerGained}
              onPhaseComplete={handlePhaseComplete}
              profileName={profileName}
              
          
            // --- AND REPLACE IT WITH THIS NEW, CORRECT BLOCK ---
            getRainbowImage={getRainbowImage}
            getAnimalImage={getAnimalImage}
            getFruitImage={getFruitImage}
              
              isAudioOn={isAudioOn}
              playAudio={playAudio}
              
              // State saving for reload support
              onSaveGameState={(gameState) => handleSaveComponentState('samaprabhaGame', gameState)}
              onCleanup={() => console.log('Samaprabha game cleaned up')}
              
              // Reload support props
             {...samaprabhaRainbowGameReloadProps}

            />

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
            color: '#9400D3', // A purple color for the rainbow theme
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
  console.log('Begin Stone Awakening clicked - starting Mahakaya properly');
  
  setIsTransitioning(true);
  setShowSamaprabhaStory(false);
  
  setTimeout(() => {
    // This logic was WORKING - don't change it
    sceneActions.updateState({ 
      phase: PHASES.SAMAPRABHA_GAME_ACTIVE,
      currentPopup: null,
      memoryGameState: null  // Clear old Vakratunda state
    });
    
    // Start Mahakaya immediately - this was working
    /*setTimeout(() => {
      if (window.sanskritMemoryGame?.startMahakayaPhase) {
        window.sanskritMemoryGame.startMahakayaPhase();
      }
    }, 200);*/
    
    // ONLY TIMING FIX: Keep transitioning longer to hide flash
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Was 100ms, now 400ms - hides the brief flash
    
  }, 100);
}}
                   style={{
              // --- CHANGE 5: New Button Style ---
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

            {/* Sanskrit Voice Recorder */}
            <SanskritVoiceRecorder
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

            {/* Smartwatch Widget */}
            <SmartwatchWidget
              profileId={GameStateManager.getActiveProfile()?.id}
              onAppClick={(app) => {
                setCurrentPracticeWord(app.id);
                setShowAudioPractice(true);
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
                          {powerConfig[currentPracticeWord]?.icon || 'Ã¢Å"¨'}
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
                      🎤 Chant Now
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

        // --- CHANGE 1: Use the correct 'before' images ---
        beforeImage={currentRescueWord === 'suryakoti' ? suryakotiBefore : samaprabhaBefore}
        
        // --- CHANGE 2: Use the correct 'after' images ---
        afterImage={currentRescueWord === 'suryakoti' ? suryakotiAfter : samaprabhaAfter}
        
        powerConfig={powerConfig[currentRescueWord]}
        smartwatchBase={smartwatchBase}
        smartwatchScreen={smartwatchScreen}
        
        // --- CHANGE 3: Use the correct app images ---
        appImage={currentRescueWord === 'suryakoti' ? appSuryakoti : appSamaprabha}
        
        boyCharacter={boyNamaste}
        onComplete={handleRescueComplete}
        onCancel={() => setShowRescueMission(false)}
        
        // The reload support props can stay the same
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
            // If the word is 'suryakoti', show these syllables:
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
                    🎵 {currentPracticeWord.toUpperCase()}
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
                  🐱 Save an Animal
                </button>
                <button className="choice-btn continue-learning-btn" onClick={handleContinueLearning}>
                  {currentPracticeWord === 'samaprabha' ? 'Ã¢Å"¨ End Scene' : '➡️ Continue Learning'}
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
                            console.log('🎯suryakoti-bank fireworks complete');
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
                              console.log('✅ suryakoti-bank : Completion saved and temp session cleared');
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
            discoveredSymbols={Object.keys(sceneState.learnedSyllables || {}).filter(syl =>
              sceneState.learnedSyllables?.[syl]
            )}
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
              console.log('NUCLEAR OPTION: Bulletproof Play Again');
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                localStorage.removeItem(`temp_session_${profileId}_shloka-river_suryakoti-bank`);
                localStorage.removeItem(`replay_session_${profileId}_shloka-river_suryakoti-bank`);
                localStorage.removeItem(`play_again_${profileId}_shloka-river_suryakoti-bank`);
                
                SimpleSceneManager.setCurrentScene('shloka-river', 'suryakoti-bank', false, false);
                console.log('NUCLEAR: All storage cleared');
              }
              
              console.log('NUCLEAR: Forcing reload in 100ms');
              setTimeout(() => {
                window.location.reload();
              }, 100);
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
                  words: sceneState.learnedWords
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
                console.log('SANSKRIT CONTINUE: Next scene (firefly-garden) set for resume tracking');
                
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
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

          // Add this button to your JSX return in SuryakotiBank.jsx, near your other test buttons

{/* TESTING: Skip to Samaprabha Game Button */}
<div style={{
  position: 'fixed',
  top: '240px',
  right: '60px',
  zIndex: 9999,
  background: '#9C27B0',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🧪 TESTING: Skip to Samaprabha Game clicked');
  
  // Clear all UI states first
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
  setShowSamaprabhaStory(false);
  setIsTransitioning(false);
  
  // Set Suryakoti as completed and gain its power
  setSuryakotiPowerGained(true);
  
  // Update scene state to simulate Suryakoti completion + skip to Samaprabha
  sceneActions.updateState({
    // Mark Suryakoti as fully learned
    learnedSyllables: {
      sur: true, ya: true, ko: true, ti: true,  // Suryakoti complete
      sa: false, ma: false, pra: false, bha: false  // Samaprabha not learned yet
    },
    learnedWords: {
      suryakoti: true,    // Suryakoti complete
      samaprabha: false   // Samaprabha not learned yet
    },
    
    // JUMP STRAIGHT TO SAMAPRABHA GAME
    phase: PHASES.SAMAPRABHA_GAME_ACTIVE,
    
    // Clear any conflicting popup/UI states
    currentPopup: null,
    showingCompletionScreen: false,
    gameCoachState: null,
    isReloadingGameCoach: false,
    
    // Clear game states to avoid contamination
    suryakotiGameState: null,  // Clear Suryakoti game state
    samaprabhaGameState: null, // Start fresh Samaprabha state
    
    // Reset mission state
    missionState: {
      rescuePhase: 'problem',
      showParticles: false,
      word: null,
      missionJustCompleted: false
    },
    
    // Progress shows Suryakoti complete, Samaprabha starting
    stars: 3,
    completed: false,  // Scene not fully complete yet
    progress: { percentage: 60, starsEarned: 3, completed: false },
    
    // Story flags
    welcomeShown: true,
    suryakotiWisdomShown: true,
    samaprabhaWisdomShown: false
  });
  
  console.log('✅ State set for Samaprabha game - should start immediately');
}}>
  SKIP TO SAMAPRABHA
</div>

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
  console.log('🧪 TESTING: Universal completion clicked');
  
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
            console.log('🧪 TESTING: Reload test clicked');
            console.log('Current sceneState:', sceneState);
            console.log('Memory game state:', sceneState?.memoryGameState);
            console.log('Mission state:', sceneState?.missionState);
            
            // Test mission state
            handleSaveComponentState('mission', {
              rescuePhase: 'action',
              word: 'suryakoti',
              showParticles: true,
              missionJustCompleted: false
            });
            
            // Test memory game state
            handleSaveComponentState('memoryGame', {
              gamePhase: 'listening',
              currentPhase: 'suryakoti',
              currentRound: 2,
              playerInput: ['sur', 'kra'],
              currentSequence: ['va', 'kra', 'tun'],
              sequenceItemsShown: 3
            });
            
            console.log('Test states saved - check console for save calls');
          }}>
            TEST RELOAD SAVE
          </div>

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
                  vakratundaWisdomShown: false,
                  mahakayaWisdomShown: false,
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
