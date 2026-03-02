// zones/shloka-river/scenes/Scene2/SuryakotiBank.jsx - Updated with Combined Memory Game
import React, { useState, useEffect, useRef } from 'react';
import './SuryakotiBankSimplified.css';
import '../../../shared/components/OpeningModal.css';
// ... existing imports
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content';

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

// NEW: Import game wrappers (like VakratundaGame pattern)
import SuryakotiGame from './components/SuryakotiGame';
import SamaprabhaGame from './components/SamaprabhaGame';

import SunRayArc from './components/SunRayArc';
//import SparkleTrailComponent from './components/SparkleTrailComponent'; // Add this component
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder.jsx';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SanskritWordMission from '../../shared/SanskritWordMission';

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

import ganeshaHeadphones from '../assets/images/ganesha_with_headphones.png';
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

// Updated PHASES constant for separate game approach (like VakratundaGrove)
const PHASES = {
  INITIAL: 'initial',
  SURYAKOTI_GAME_ACTIVE: 'suryakoti_game_active',
  SURYAKOTI_LEARNING: 'suryakoti_learning',   // ⭐ NEW: Triggers Discovery 1
  SAMAPRABHA_GAME_ACTIVE: 'samaprabha_game_active',
  SAMAPRABHA_LEARNING: 'samaprabha_learning', // ⭐ NEW: Triggers Discovery 2
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
              chantedVerses: {}, 

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

          // ⭐ Mode selection (like VakratundaGrove)
          suryakotiMode: null,      // 'auto' or 'manual'
          samaprabhaMode: null,     // 'auto' or 'manual'

          // UNIFIED: State for each game
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
    memoryGameState: !!sceneState?.memoryGameState,
    missionState: sceneState?.missionState 
  });

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  // Access GameCoach functionality
  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);

  // ⭐ Mode selection state (like VakratundaGrove)
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [modeForPhase, setModeForPhase] = useState(null); // 'suryakoti' or 'samaprabha'
  const [modeSelected, setModeSelected] = useState(false); // Prevent loops

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
    const [showCenteredWord, setShowCenteredWord] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);  // ⭐ ADD THIS LINE
const [showMission, setShowMission] = useState(false);  // ⭐ ADD THIS LINE TOO
const [currentWord, setCurrentWord] = useState(null);  // ⭐ ADD THIS LINE


  const [showSamaprabhaStory, setShowSamaprabhaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

    const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
  const [rescuePhase, setRescuePhase] = useState('problem');

  const [savedRecordings, setSavedRecordings] = useState({});

  // Add these with your other useState hooks
const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);

const reloadHandledRef = useRef(false);



  // Add power configuration for Scene 2
// ✅ REPLACE the existing powerConfig with:
const powerConfig = {
  suryakoti: { 
    name: 'Solar Clarity', 
    image: appSuryakoti,
    color: '#FFA500',
    affirmation: 'I am clear',
    description: 'I see with clarity!'
  },
  samaprabha: { 
    name: 'Radiant Light', 
    image: appSamaprabha,
    color: '#9400D3',
    affirmation: 'I am radiant',
    description: 'I shine from within!'
  }
};

// ✅ ADD mission images mapping:
const missionImages = {
  suryakoti: { before: suryakotiBefore, after: suryakotiAfter },
  samaprabha: { before: samaprabhaBefore, after: samaprabhaAfter }
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
          unlockedApps: {},  // ← This is what's missing!

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

  const onSaveAppRecording = (recordingData) => {
  console.log('💾 Saving recording:', recordingData);
  setSavedRecordings(prev => ({
    ...prev,
    [recordingData.word]: [
      ...(prev[recordingData.word] || []),
      recordingData
    ]
  }));
};

const onDeleteAppRecording = (recordingId, word) => {
  console.log('🗑️ Deleting recording:', recordingId, word);
  setSavedRecordings(prev => {
    const wordRecordings = prev[word] || [];
    return {
      ...prev,
      [word]: wordRecordings.filter(rec => rec.id !== recordingId)
    };
  });
};

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

    // Expose audio functions globally for SanskritWordMission
  useEffect(() => {
    window.playSanskritAudio = playSyllable;
    window.playSanskritWord = playWord;
    
    return () => {
      delete window.playSanskritAudio;
      delete window.playSanskritWord;
    };
  }, [isAudioOn]); // Re-attach if audio setting changes

  // Load audio preference on component mount
  useEffect(() => {
    const savedAudioPreference = localStorage.getItem('sanskritGameAudio');
    if (savedAudioPreference !== null) {
      setIsAudioOn(savedAudioPreference === 'true');
    }
  }, []);

  // UNIFIED: Single state saving function (like VakratundaGrove)
  const handleSaveComponentState = (componentType, componentState) => {
    console.log(`💾 Saving ${componentType} state:`, componentState);
    
    // Prevent double calls by debouncing
    if (handleSaveComponentState.lastCall && 
        Date.now() - handleSaveComponentState.lastCall < 100) {
      console.log('🚫 Debounced duplicate save call');
      return;
    }
    handleSaveComponentState.lastCall = Date.now();

    if (componentState === null || componentState?.cleared) {
  const updatedState = {
    ...(componentType === 'suryakotiGame' && { suryakotiGameState: null }),
    ...(componentType === 'samaprabhaGame' && { samaprabhaGameState: null })
  };
  sceneActions.updateState(updatedState);
  return;
}
    
const updatedState = {
  ...(componentType === 'memoryGame' && { memoryGameState: componentState }),
  ...(componentType === 'suryakotiGame' && { suryakotiGameState: componentState }),
  ...(componentType === 'samaprabhaGame' && { samaprabhaGameState: componentState }),
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


 // ==================== RELOAD LOGIC ====================

  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;
    
    console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // -----------------------------------------------------
    // ⭐ NEW: RELOAD DURING MODE SELECTION
    // -----------------------------------------------------
    
    // 1. First Game (Suryakoti): Phase is Initial, Welcome is done, but Mode is missing
    if (sceneState.phase === PHASES.INITIAL && !sceneState.suryakotiMode) {
      console.log('📌 Reload: Restoring Suryakoti Mode Selection');
      setModeForPhase('suryakoti');
      setShowModeSelection(true);
      return;
    }

    // 2. Second Game (Samaprabha): Phase is Active (set by discovery), but Mode is missing
    if (sceneState.phase === PHASES.SAMAPRABHA_GAME_ACTIVE && !sceneState.samaprabhaMode) {
      console.log('📌 Reload: Restoring Samaprabha Mode Selection');
      setModeForPhase('samaprabha');
      setShowModeSelection(true);
      return;
    }
    // -----------------------------------------------------

    // Discovery 1
    if (sceneState.phase === PHASES.SURYAKOTI_LEARNING) {
      setTimeout(() => setShowDiscoveryFlip1(true), 500);
      return;
    }

    // Discovery 2
    if (sceneState.phase === PHASES.SAMAPRABHA_LEARNING) {
      setTimeout(() => setShowDiscoveryFlip2(true), 500);
      return;
    }

    // Complete Phase
    if (sceneState.phase === PHASES.COMPLETE) {
      if (!sceneState.showingCompletionScreen) {
        setTimeout(() => setShowSceneCompletion(true), 500);
      }
      return;
    }

  }, [isReload, sceneState.phase, sceneState.welcomeShown]); // Added welcomeShown dependency

  // COMPREHENSIVE RELOAD LOGIC - Based on VakratundaGrove pattern
  /*useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 SURYAKOTI RELOAD: Starting reload', {
      phase: sceneState.phase,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed
    });

    // Check for Play Again flag first
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
        memoryGameState: null,
      });
      return;
    }

    // Handle completion screen reload
    if (sceneState.showingCompletionScreen) {
      console.log('🔄 SURYAKOTI: Resuming completion screen');
      setShowSceneCompletion(true);
      return;
    }

    // Handle specific phases - each phase maps to exact UI state
    switch (sceneState.phase) {
      case PHASES.INITIAL:
        console.log('🔄 SURYAKOTI: Resuming initial welcome');
        break;
        
      case PHASES.MEMORY_GAME_ACTIVE:
        console.log('🔄 SURYAKOTI: Memory game active - letting component handle itself');
        // Check if power should be gained
        if (sceneState.learnedWords?.suryakoti === true) {
          setSuryakotiPowerGained(true);
        }
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
        setBlessingPhase('welcome');
        break;

      case PHASES.GANESHA_BLESSING_SAMAPRABHA:
        console.log('🔄 SURYAKOTI: Resuming Ganesha blessing for Samaprabha');
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
  }, [isReload]);*/

  // Add this around line 380-400 (after playAudio function)

const playSyllable = (syllable) => {
  const map = {
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
  playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
};

const playWord = (word) => {
  playAudio(`/audio/words/${word}.mp3`);
};

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

// ✅ KEEP your existing getAnimalImage function
const getAnimalImage = (index, isHappy) => {
  const sadImages = [bunnySad, kittenSad, puppySad, squirrelSad];
  const happyImages = [bunnyHappy, kittenHappy, puppyHappy, squirrelHappy];
  return isHappy ? happyImages[index] : sadImages[index];
};

// ✅ ADD these two new functions right after getAnimalImage:
const getSadAnimalImage = (index) => {
  const images = [bunnySad, kittenSad, puppySad, squirrelSad];
  return images[index];
};

const getHappyAnimalImage = (index) => {
  const images = [bunnyHappy, kittenHappy, puppyHappy, squirrelHappy];
  return images[index];
};

  const getFruitImage = (index, isCollected) => {
    // Assumes only one type of fruit for now (mango)
    return isCollected ? mangoPlate : mangoBubble;
  };


    
// ✅ REPLACE with clean versions:
const handleSaveAnimal = () => {
  setShowPowerModal(false);
  setShowMission(true);
};

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentWord === 'suryakoti') {
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.SAMAPRABHA_STORY });
    }, 500);
  } else {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    setShowSparkle('final-fireworks');
  }
};

const handleMissionComplete = () => {
  console.log('✅ Mission complete for:', currentWord);
  setShowMission(false);
  
  if (currentWord === 'suryakoti') {
    // Mission 1 Done: Prepare for Game 2 (Samaprabha)
    // The Discovery Overlay 1 logic (Step 7) handles the phase change,
    // so here we just ensure the modal closes.
  } else {
    // Mission 2 Done: Scene Complete
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    setShowSparkle('final-fireworks');
    
    safeSetTimeout(() => {
      setShowSceneCompletion(true);
    }, 3000);
  }
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

const handlePhaseComplete = (word) => {
  console.log(`${word} learned!`);

  // ✅ DEFINE KEY: Matches CulturalProgressExtractor keys
  const chantKey = word === 'suryakoti' ? 'suryakoti-chant' : 'samaprabha-chant';
  
  // 1. Update progress
  sceneActions.updateState({
    learnedWords: { ...sceneState.learnedWords, [word]: true },
    // ✅ ADD THIS: Save the specific chant for this phase
    chantedVerses: { 
      ...sceneState.chantedVerses, 
      [chantKey]: true 
    },
    learnedSyllables: {
      ...sceneState.learnedSyllables,
      ...(word === 'suryakoti' 
        ? { sur: true, ya: true, ko: true, ti: true }
        : { sa: true, ma: true, pra: true, bha: true })
    },
    unlockedApps: { ...sceneState.unlockedApps, [word]: true },
    // 2. Move to LEARNING phase
    phase: word === 'suryakoti' ? PHASES.SURYAKOTI_LEARNING : PHASES.SAMAPRABHA_LEARNING
  });

  playWord(word);
  
  // 3. Trigger Discovery Overlay after a brief moment
  safeSetTimeout(() => {
    if (word === 'suryakoti') {
      setShowDiscoveryFlip1(true);
    } else {
      setShowDiscoveryFlip2(true);
    }
  }, 1500);
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
  /*useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown) {
      console.log('Starting combined memory game');
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.MEMORY_GAME_ACTIVE });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);*/

  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        <div className="counter-icon">☀️</div>
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
  /*const simplifiedCombinedMemoryGameReloadProps = sceneState.memoryGameState ? {
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
  } : {};*/

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

   {/* ==================== SHLOKA RIVER INSTRUCTION MODAL ==================== */}
{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (() => {
  const theme = getZoneTheme(zoneId);
  const modal = getOpeningModal(zoneId, sceneId);
  return (
    <div className="game-modal-overlay" style={{ '--modal-card-bg': theme.parentBg, '--modal-text-primary': theme.textPrimary, '--modal-btn-bg': theme.buttonActiveBg, '--modal-btn-shadow': theme.glowColor }}>
      <div className="game-modal-content">
        <div className="game-modal-character">
          <img src={ganeshaHeadphones} alt="Ganesha Character" />
        </div>
        <div className="game-modal-card">
          <h1 className="game-modal-title">{modal?.title || 'Sun and Smiles'}</h1>
          <div className="game-modal-icons">
            <div className="game-modal-icon-item">
              <img src={appSuryakoti} alt="Suryakoti" />
              <span className="game-modal-icon-label">Energy</span>
            </div>
            <div className="game-modal-icon-item">
              <img src={appSamaprabha} alt="Samaprabha" />
              <span className="game-modal-icon-label">Kindness</span>
            </div>
          </div>
          <button
            className="game-modal-button"
            onClick={() => {
              sceneActions.updateState({ welcomeShown: true });
              setModeForPhase('suryakoti');
              setShowModeSelection(true);
              setModeSelected(false);
            }}
          >
            {modal?.buttonText || "Let's Explore"}
          </button>
        </div>
      </div>
    </div>
  );
})()}

           {/*} {sceneState.phase === PHASES.SAMAPRABHA_STORY && (
  <div className="suryakoti-mission-modal-overlay">
    <div className="suryakoti-mission-modal">
      <div className="suryakoti-modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="suryakoti-character-img" />
        <div className="suryakoti-character-speech-bubble">
          One more to learn! 💪
        </div>
      </div>
      
      <h2 className="suryakoti-mission-title">Great Work!</h2>
      <div className="suryakoti-mission-subtitle">Now unlock the second power!</div>
      <p className="suryakoti-mission-description">
        Learn to chant <strong>SAMAPRABHA</strong> to unlock radiant light and save more animals!
      </p>
     <button
        className="suryakoti-mission-start-btn"
        onClick={() => {
          console.log('🎮 Opening mode selection for SAMAPRABHA');
          setSuryakotiPowerGained(true); // ⭐ Keep this - makes Samaprabha visible
          setModeForPhase('samaprabha');
          setShowModeSelection(true);
          setModeSelected(false);
        }}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}

{/* ⭐ MODE SELECTION MODAL - Shows BEFORE game starts */}
{showModeSelection && !modeSelected && (
  <div className="suryakoti-mission-modal-overlay">
    <div className="suryakoti-mission-modal mode-selection-modal">
      <h2 className="suryakoti-mission-title">🎮 How do you want to play?</h2>
      <p className="suryakoti-mission-description">
        Choose your learning style for <strong>{modeForPhase?.toUpperCase()}</strong>
      </p>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '30px',
        flexDirection: 'column'
      }}>
        {/* AUTO PLAY BUTTON */}
        <button
          className="suryakoti-mission-start-btn"
          style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            padding: '20px',
            fontSize: '16px'
          }}
          onClick={() => {
            console.log(`🎮 Mode selected: AUTO for ${modeForPhase}`);
            setModeSelected(true);
            setShowModeSelection(false);

            // ⭐ Single state update: mode + phase
            const modeKey = `${modeForPhase}Mode`;
            const phaseKey = modeForPhase === 'suryakoti' ? PHASES.SURYAKOTI_GAME_ACTIVE : PHASES.SAMAPRABHA_GAME_ACTIVE;
            sceneActions.updateState({
              [modeKey]: 'auto',
              phase: phaseKey
            });
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>▶️ Auto Play</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Start from Round 1 and learn step by step
          </div>
        </button>

        {/* MANUAL BUTTON */}
        <button
          className="suryakoti-mission-start-btn"
          style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            padding: '20px',
            fontSize: '16px'
          }}
          onClick={() => {
            console.log(`🎮 Mode selected: MANUAL for ${modeForPhase}`);
            setModeSelected(true);
            setShowModeSelection(false);

            // ⭐ Single state update: mode + phase
            const modeKey = `${modeForPhase}Mode`;
            const phaseKey = modeForPhase === 'suryakoti' ? PHASES.SURYAKOTI_GAME_ACTIVE : PHASES.SAMAPRABHA_GAME_ACTIVE;
            sceneActions.updateState({
              [modeKey]: 'manual',
              phase: phaseKey
            });
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯 Choose a Round</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Pick any round you want to practice
          </div>
        </button>
      </div>
    </div>
  </div>
)}

            {/* ⭐ SURYAKOTI GAME - Separate component like VakratundaGame */}
            <SuryakotiGame
              isActive={sceneState.phase === PHASES.SURYAKOTI_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || showMission}
              selectedMode={sceneState.suryakotiMode}  // ⭐ Mode from scene modal
              skipModeSelection={true}  // ⭐ Scene handles mode selection

              // Assets
              getClosedFlowerImage={getClosedFlowerImage}
              getOpenFlowerImage={getOpenFlowerImage}
              getSunOrbImage={getSunOrbImage}

              // Scene integration
              onPhaseComplete={() => handlePhaseComplete('suryakoti')}
              onGameComplete={() => handleGameComplete('suryakoti')}
              profileName={profileName}

              // Components
              SunRayComponent={SunRayArc}

              // Audio
              isAudioOn={isAudioOn}
              playAudio={playAudio}

              // Reload support
              isReload={isReload}
              savedGameState={sceneState.suryakotiGameState}
              onSaveGameState={(gameState) => handleSaveComponentState('suryakotiGame', gameState)}
            />

            {/* ⭐ SAMAPRABHA GAME - Separate component like MahakayaGame */}
            <SamaprabhaGame
              isActive={sceneState.phase === PHASES.SAMAPRABHA_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || showMission}
              selectedMode={sceneState.samaprabhaMode}  // ⭐ Mode from scene modal
              skipModeSelection={true}  // ⭐ Scene handles mode selection

              // Assets
              getSadAnimalImage={getSadAnimalImage}
              getHappyAnimalImage={getHappyAnimalImage}
              /*getRainbowImage={getRainbowImage}

               getRainbowSaImage={() => rainbowRed} 
    getRainbowMaImage={() => rainbowBlue}
    getRainbowPraImage={() => rainbowGreen}
    getRainbowBhaImage={() => rainbowPurple}*/

              // Scene integration
              onPhaseComplete={() => handlePhaseComplete('samaprabha')}
              onGameComplete={() => handleGameComplete('samaprabha')}
              profileName={profileName}

              // Audio
              isAudioOn={isAudioOn}
              playAudio={playAudio}

              // Reload support
              isReload={isReload}
              savedGameState={sceneState.samaprabhaGameState}
              onSaveGameState={(gameState) => handleSaveComponentState('samaprabhaGame', gameState)}
            />

            {/* Story Introduction - Show immediately when scene starts 
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
            )}*/}

            



            {/* ✅ ADD: 5-SECOND WORD CELEBRATION - SAME AS VAKRATUNDA 
{showCenteredWord && (
  <>
    <div className="suryakoti-celebration-overlay" />
    <div className="suryakoti-centered-word-celebration">
      <img 
        src={powerConfig[showCenteredWord]?.image}
        alt={showCenteredWord}
        className="suryakoti-celebration-app-icon"
      />
      <div className="suryakoti-celebration-word-text">
        {showCenteredWord.toUpperCase()}
      </div>
      <div className="suryakoti-celebration-sparkles">
        <SparkleAnimation
          type="glitter"
          count={30}
          color={powerConfig[showCenteredWord]?.color}
          size={12}
          duration={5000}
          fadeOut={true}
          area="full"
        />
      </div>
    </div>
  </>
)}

{/* ✅ ADD: POWER MODAL - SAME AS VAKRATUNDA 
{showPowerModal && (
  <div className="suryakoti-power-modal-overlay">
    <div className="suryakoti-power-modal">
      <div className="suryakoti-power-affirmation-row">
        <img 
          src={powerConfig[currentWord]?.image}
          alt={currentWord}
          className="suryakoti-affirmation-icon"
        />
        <div className="suryakoti-affirmation-content">
          <div className="suryakoti-affirmation-text">"{powerConfig[currentWord]?.affirmation}"</div>
          <div className="suryakoti-affirmation-description">{powerConfig[currentWord]?.description}</div>
        </div>
      </div>
      
      <div className="suryakoti-power-modal-content">
        <div className="suryakoti-power-modal-left">
          <p className="suryakoti-power-modal-text">
            You can now use this power to help animals in need!
          </p>
          <p className="suryakoti-power-modal-subtext">Choose your next action:</p>
        </div>
        
   <div className="suryakoti-power-modal-right">
  
  {/* ⭐ NEW: Play Again button 
  <button 
    className="suryakoti-power-modal-btn suryakoti-play-again-btn" 
    onClick={() => {
      console.log(`🔄 Play Again: Restarting ${currentWord} game`);
      setShowPowerModal(false);
      
      // Reset to game phase for the current word
      if (currentWord === 'suryakoti') {
        setModeForPhase('suryakoti');
        setShowModeSelection(true);
        setModeSelected(false);
      } else if (currentWord === 'samaprabha') {
        setModeForPhase('samaprabha');
        setShowModeSelection(true);
        setModeSelected(false);
      }
    }}
    style={{
      background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      marginBottom: '10px'
    }}
  >
    🔄 Play Again
  </button>

  <button className="suryakoti-power-modal-btn suryakoti-save-btn" onClick={handleSaveAnimal}>
    🌟Save an Animal
  </button>
          <button className="suryakoti-power-modal-btn suryakoti-continue-btn" onClick={handleContinueLearning}>
            {currentWord === 'suryakoti' ? '🎵 Discover Samaprabha' : '✨ End Scene'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ==================== DISCOVERY 1: SURYAKOTI (Energy) ==================== */}
{showDiscoveryFlip1 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery
    celebrationTitle="Surya Koti Chanted!"
    celebrationText="You touched the sun and made the world bloom! Sur-ya Ko-ti means bright light lives inside you."
    celebrationImage={appSuryakoti}
    
    // STAGE 2: Power Unlock
    powerTitle="I Am Full of Energy!"
    powerText="Your energy helps you play, learn, and smile. You bring excitement wherever you go!"
    powerIcon={appSuryakoti}
    
    buttonText="Share My Light!"
    onComplete={() => {
      console.log("Discovery 1: Suryakoti complete!");
      setShowDiscoveryFlip1(false);
      
      // Update sidebar + set phase for NEXT game (Samaprabha)
      sceneActions.updateState({ 
        phase: PHASES.SAMAPRABHA_GAME_ACTIVE,
        unlockedApps: { ...sceneState.unlockedApps, suryakoti: true }
      });

      // Trigger mode selection for next game
      setTimeout(() => {
        setModeForPhase('samaprabha');
        setShowModeSelection(true);
        setModeSelected(false);
      }, 500);
    }}
    showSparkles={true}
  />
)}

{/* ==================== DISCOVERY 2: SAMAPRABHA (Kindness) ==================== */}
{showDiscoveryFlip2 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery
    celebrationTitle="Samaprabha Chanted!"
    celebrationText="The rainbow shared treats with everyone! Sa-ma-pra-bha means sharing your light with all."
    celebrationImage={appSamaprabha}
    
    // STAGE 2: Power Unlock
    powerTitle="I Am Kind to Everyone!"
    powerText="You treat everyone the same. Your kindness makes others feel happy and safe."
    powerIcon={appSamaprabha}
    
    buttonText="Kindness Complete!"
    onComplete={() => {
      console.log("Discovery 2: Samaprabha complete!");
      setShowDiscoveryFlip2(false);
      
      // Update sidebar
      sceneActions.updateState({ 
        unlockedApps: { ...sceneState.unlockedApps, samaprabha: true }
      });
    setShowSparkle('final-fireworks');
    }}

    showSparkles={true}
  />
)}

{/* ✅ REPLACE SaveAnimalMission with SanskritWordMission */}
<SanskritWordMission
  show={showMission}
  word={currentWord}
  beforeImage={missionImages[currentWord]?.before}
  afterImage={missionImages[currentWord]?.after}
  powerConfig={powerConfig[currentWord]}
      isFinalWordInScene={currentWord === 'samaprabha'}  // ⭐ ADD THIS LINE
  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
  }}
/>

            {/* Rest of the components remain the same as original SuryakotiBank... */}
            
            {/* Sanskrit Voice Recorder 
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
            />*/}

         

<AppSidebar
  unlockedApps={{
    vakratunda: true,
    mahakaya: true,
    ...(sceneState.unlockedApps || {})
  }}
  savedRecordings={savedRecordings}              // ADD THIS
  onSaveRecording={onSaveAppRecording}           // ADD THIS
  onDeleteRecording={onDeleteAppRecording}       // ADD THIS
  onAppClick={(app) => {
    setCurrentPracticeWord(app.id);
    setShowAudioRecorder(true);
  }}
  isReload={isReload}
  onSaveAppState={(appState) => {
    sceneActions.updateState({ unlockedApps: appState });
  }}
/>

          {/* SAVE ANIMAL MISSION - REUSABLE COMPONENT */}
<SanskritWordMission
  show={showMission}
  word={currentWord}
  beforeImage={missionImages[currentWord]?.before}
  afterImage={missionImages[currentWord]?.after}
  powerConfig={powerConfig[currentWord]}
      isFinalWordInScene={currentWord === 'samaprabha'}  // ⭐ ADD THIS LINE

  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
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
                  src={ganeshaHeadphones} 
                  alt="Ganesha celebrating" 
                  className="ganesha-image breathing-animation"
                  style={{
                    filter: 'brightness(1.2) drop-shadow(0 0 25px #FFD700)'
                  }}
                />
              </div>
            </>
          )}

       {/* ✅ FIREWORKS: Save & Cleanup (Enables Replay) */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 suryakoti-bank fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    console.log('💾 FIREWORKS: Saving Permanent Data...');
                    
                    const finalChants = { 
                      'suryakoti-chant': true, 
                      'samaprabha-chant': true 
                    };

                    // 1. Save to GameStateManager
                    GameStateManager.saveGameState('shloka-river', 'suryakoti-bank', {
                      completed: true,
                      stars: 5,
                      phase: 'complete',
                      words: sceneState.learnedWords || {},
                      syllables: sceneState.learnedSyllables || {},
                      chantedVerses: finalChants,
                      apps: sceneState.unlockedApps || {},
                      timestamp: Date.now()
                    });

                    // 2. Clear Session (REQUIRED for "Replay" button to show)
                    localStorage.removeItem(`temp_session_${profileId}_shloka-river_suryakoti-bank`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ FIREWORKS: Data Saved & Session Cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}
          
  {/* ✅ CELEBRATION: Double-Lock Save on Continue */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Suryakoti Bank"
              sceneNumber={2}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              // Adjust discovered symbols as per your design (accumulated or current)
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
                chantedVerses: { 'suryakoti-chant': true, 'samaprabha-chant': true },
                completed: true
              }}
              // 1. EXPLORE SCENES: Go to zone welcome
              onComplete={() => onNavigate?.('zone-welcome')}
              // 2. REPLAY FIX: Reset scene
              onReplay={() => {
                console.log('🔄 INSTANT REPLAY');
                setShowSceneCompletion(false);
                resetScene(false);
              }}
              // 3. CONTINUE FIX: Force Save & Navigate
              onContinue={() => {
                console.log('💾 CONTINUE: Force-Saving data to prevent Auto-Save wipe...');
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  // ✅ RE-SAVE DATA RIGHT BEFORE EXIT
                  GameStateManager.saveGameState('shloka-river', 'suryakoti-bank', {
                    completed: true,
                    stars: 5,
                    phase: 'complete',
                    words: { suryakoti: true, samaprabha: true },
                    // Hardcoded syllables for safety (Su, Rya, Ko, Ti, Sa, Ma, Pra, Bha)
                    syllables: { su: true, rya: true, ko: true, ti: true, sa: true, ma: true, pra: true, bha: true },
                    chantedVerses: { 'suryakoti-chant': true, 'samaprabha-chant': true },
                    apps: { suryakoti: true, samaprabha: true },
                    timestamp: Date.now()
                  });
                }

                if (clearManualCloseTracking) clearManualCloseTracking();
                
                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('shloka-river', 'nirvighnam-chant', false, false);
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


          {/* Emergency Reset Button 
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
          </div>*/}
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SuryakotiBank;
