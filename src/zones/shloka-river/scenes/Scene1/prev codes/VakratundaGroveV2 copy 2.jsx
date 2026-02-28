// zones/shloka-river/scenes/Scene1/VakratundaGrove.jsx - FIXED with Unified Reload Support
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGrove.css';

// Import scene management components
import SceneManager from "../../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../../lib/services/SimpleSceneManager';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// UI Components
import TocaBocaNav from '../../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../../lib/components/celebration/SceneCompletionCelebration';

// NEW: Import water spray and updated memory game components
import SanskritMemoryGame from './SanskritMemoryGame';
import WaterSprayArc from './WaterSprayArc';
import SanskritVoiceRecorder from '../../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from './SmartwatchWidget';
import HelperSignatureAnimation from '../../../../../lib/components/animation/HelperSignatureAnimation';

import ProgressiveHintSystem from '../../../../../lib/components/interactive/ProgressiveHintSystem';
import SanskritRiverProgress from './SanskritRiverProgress';
import SaveAnimalMission from '../../../../../lib/components/missions/SaveAnimalMission';

// Images - River scene assets
import riverBackground from './assets/images/elephant-grove-bg.png';
//import lotusVa from './assets/images/lotus-va.png';
//import lotusKra from './assets/images/lotus-kra.png';
//import lotusTun from './assets/images/lotus-tun.png';
//import lotusDa from './assets/images/lotus-da.png';

import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantBabyKra from './assets/images/vakratunda/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/vakratunda/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/vakratunda/elephant-baby-da.png';
import elephantHa from './assets/images/mahakaya/elephant-ha.png';
import elephantKa from './assets/images/mahakaya/elephant-ka.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';
import elephantYa from './assets/images/mahakaya/elephant-ya.png';

// SINGERS: Bud images for vakratunda
import budVa from './assets/images/vakratunda/va-bud.png';
import budKra from './assets/images/vakratunda/kra-bud.png';
import budTun from './assets/images/vakratunda/tun-bud.png';
import budDa from './assets/images/vakratunda/da-bud.png';

// SINGERS: Seed image for mahakaya (same seed.png used 4 times)
import seedImage from './assets/images/mahakaya/seed.png';

// REWARDS: Lotus images for vakratunda (from vakratunda folder)
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import lotusKra from './assets/images/vakratunda/kra-lotus.png';
import lotusTun from './assets/images/vakratunda/tun-lotus.png';
import lotusDa from './assets/images/vakratunda/da-lotus.png';

// REWARDS: Flower images for mahakaya
import flowerMa from './assets/images/mahakaya/ma-flower.png';
import flowerHa from './assets/images/mahakaya/ha-flower.png';
import flowerKa from './assets/images/mahakaya/ka-flower.png';
import flowerYa from './assets/images/mahakaya/ya-flower.png';

import ganeshaWithHeadphones from '../assets/images/ganesha_with_headphones.png';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import vakratundaBefore from './assets/images/vakratunda-before.png';
import vakratundaAfter from './assets/images/vakratunda-after.png';
import mahakayaBefore from './assets/images/mahakaya-before.png'; 
import mahakayaAfter from './assets/images/mahakaya-after.png';

// Updated PHASES constant with granular phases
const PHASES = {
  INITIAL: 'initial',
  MEMORY_GAME_ACTIVE: 'memory_game_active',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  GANESHA_BLESSING_VAKRATUNDA: 'ganesha_blessing_vakratunda',
  CHOICE_BUTTONS_VAKRATUNDA: 'choice_buttons_vakratunda',
  RESCUE_MISSION_VAKRATUNDA: 'rescue_mission_vakratunda',
  MAHAKAYA_STORY: 'mahakaya_story',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  GANESHA_BLESSING_MAHAKAYA: 'ganesha_blessing_mahakaya',
  CHOICE_BUTTONS_MAHAKAYA: 'choice_buttons_mahakaya',
  RESCUE_MISSION_MAHAKAYA: 'rescue_mission_mahakaya',
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

const VakratundaGrove = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'vakratunda-grove'
}) => {
  console.log('VakratundaGrove props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Simplified state - memory game handles its own logic
          phase: PHASES.INITIAL,
          
          // Learning progress (for progress tracking)
          learnedSyllables: {
            va: false, kra: false, tun: false, da: false,
            ma: false, ha: false, ka: false, ya: false
          },
          learnedWords: {
            vakratunda: false,
            mahakaya: false
          },
          
          // UNIFIED: Combined state for both components
          memoryGameState: null,
          missionState: {
            rescuePhase: 'problem',
            showParticles: false,
            word: null,
            missionJustCompleted: false
          },
          
          // Message flags
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          
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
          <VakratundaGroveContent
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

const VakratundaGroveContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('🎮 VakratundaGroveContent render', { 
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

  const [vakratundaPowerGained, setVakratundaPowerGained] = useState(false);
  const [showCenteredApp, setShowCenteredApp] = useState(null);
  const [blessingWord, setBlessingWord] = useState('');

  // UNIFIED: Single state for rescue mission
  const [showRescueMission, setShowRescueMission] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState('');
  const [showWordCelebration, setShowWordCelebration] = useState(false);

  const [showMahakayaStory, setShowMahakayaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);


  // Add power configuration
  const powerConfig = {
    vakratunda: { name: 'Flexibility', icon: 'Ã°Å¸Å'€', color: '#FFD700' },
    mahakaya: { name: 'Inner Strength', icon: '💪', color: '#FF6B35' }
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
      ...(componentType === 'memoryGame' && { memoryGameState: componentState }),
      ...(componentType === 'mission' && { 
        missionState: {
          ...sceneState.missionState,
          ...componentState
        }
      })
    };
    
    console.log(`Ã¢Å"… Updating scene state with ${componentType}:`, updatedState);
    sceneActions.updateState(updatedState);
  };

  // Set up communication with memory game
  useEffect(() => {
    window.sanskritMemoryGame = {};
    return () => {
      if (window.sanskritMemoryGame) {
        delete window.sanskritMemoryGame;
      }
    };
  }, []);

  useEffect(() => {
    window.vakratundaGrove = {
      showMahakayaStory: () => {
        setShowMahakayaStory(true);
      }
    };
    return () => {
      if (window.vakratundaGrove) {
        delete window.vakratundaGrove;
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

  useEffect(() => {
  if (!isReload || !sceneState) return;
  
  console.log('🔄 SANSKRIT RELOAD: Starting reload', {
    phase: sceneState.phase,
    showingCompletionScreen: sceneState.showingCompletionScreen,
    completed: sceneState.completed
  });

  // Check for Play Again flag first
  const profileId = localStorage.getItem('activeProfileId');
  const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  const isFreshRestartAfterPlayAgain = (
    playAgainRequested === 'true' ||
    (sceneState.phase === PHASES.INITIAL && 
     sceneState.completed === false && 
     sceneState.stars === 0 && 
     sceneState.showingCompletionScreen)
  );
  
  if (isFreshRestartAfterPlayAgain) {
    console.log('🔄 SANSKRIT: Fresh restart after Play Again');
    
    if (playAgainRequested === 'true') {
      localStorage.removeItem(playAgainKey);
    }
    
    sceneActions.updateState({ 
      phase: PHASES.INITIAL,
      showingCompletionScreen: false,
      completed: false,
      stars: 0,
      welcomeShown: false
    });
    return;
  }

  // Handle completion screen reload
  if (sceneState.showingCompletionScreen) {
    console.log('🔄 SANSKRIT: Resuming completion screen');
    setShowSceneCompletion(true);
    return;
  }

  // Handle specific phases - each phase maps to exact UI state
  switch (sceneState.phase) {
    case PHASES.INITIAL:
      console.log('🔄 SANSKRIT: Resuming initial welcome');
      break;
      
    case PHASES.MEMORY_GAME_ACTIVE:
  console.log('🔄 SANSKRIT: Memory game active - letting component handle itself');
  // ADD THIS CONDITION:
  if (sceneState.learnedWords?.vakratunda === true) {
    setVakratundaPowerGained(true);
  }
  break;
      
    case PHASES.VAKRATUNDA_COMPLETE:
      console.log('🔄 SANSKRIT: Resuming Vakratunda completion');
      setBlessingWord('vakratunda');
      setCurrentPracticeWord('vakratunda');
      setShowWordCelebration(true);
      // FIX 1: Trigger sparkle animation for Vakratunda
      setShowSparkle('vakratunda-complete');
      
      // FIX 1: Set timer to continue the sequence
      setTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_VAKRATUNDA
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      break;
      
    case PHASES.MAHAKAYA_COMPLETE:
      console.log('🔄 SANSKRIT: Resuming Mahakaya completion');
      setBlessingWord('mahakaya');
      setCurrentPracticeWord('mahakaya');
      setShowWordCelebration(true);
      // FIX 1: Trigger sparkle animation for Mahakaya
      setShowSparkle('mahakaya-complete');
      
      // FIX 1: Set timer to continue the sequence (this was missing!)
      setTimeout(() => {
        setShowSparkle(null);
        setShowWordCelebration(false);
        sceneActions.updateState({
          phase: PHASES.GANESHA_BLESSING_MAHAKAYA
        });
        setBlessingPhase('welcome');
        setShowGaneshaBlessing(true);
      }, 4000);
      break;
      
   case PHASES.GANESHA_BLESSING_VAKRATUNDA:
      console.log('🔄 SANSKRIT: Resuming Ganesha blessing for Vakratunda');
      setBlessingWord('vakratunda');
      setCurrentPracticeWord('vakratunda');
      
      // Hide conflicting elements
      setShowChoiceButtons(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowRecording(false);
      
      // Show only Ganesha blessing
      setShowGaneshaBlessing(true);
      setBlessingPhase('welcome'); // FIX 4: Always start at welcome phase
      break;
      
   case PHASES.GANESHA_BLESSING_MAHAKAYA:
      console.log('🔄 SANSKRIT: Resuming Ganesha blessing for Mahakaya');
      setBlessingWord('mahakaya');
      setCurrentPracticeWord('mahakaya');
        setVakratundaPowerGained(true); // ADD THIS LINE

      
      // Hide conflicting elements
      setShowChoiceButtons(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowRecording(false);
      
      // Show only Ganesha blessing
      setShowGaneshaBlessing(true);
      setBlessingPhase('welcome'); // FIX 4: Always start at welcome phase
      break;
      
    case PHASES.CHOICE_BUTTONS_VAKRATUNDA:
      console.log('🔄 SANSKRIT: Resuming choice buttons for Vakratunda');
      setCurrentPracticeWord('vakratunda');
      
      // Hide all conflicting UI elements
      setShowGaneshaBlessing(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowMahakayaStory(false);
      setShowRecording(false);
      setBlessingPhase('complete');
      
      // Show only choice buttons
      setShowChoiceButtons(true);
      break;
      
    case PHASES.CHOICE_BUTTONS_MAHAKAYA:
      console.log('🔄 SANSKRIT: Resuming choice buttons for Mahakaya');
      setCurrentPracticeWord('mahakaya');
        setVakratundaPowerGained(true); // ADD THIS LINE
      
      // Hide all conflicting UI elements
      setShowGaneshaBlessing(false);
      setShowWordCelebration(false);
      setShowRescueMission(false);
      setShowMahakayaStory(false);
      setShowRecording(false);
      setBlessingPhase('complete');
      
      // Show only choice buttons
      setShowChoiceButtons(true);
      break;
      
    case PHASES.RESCUE_MISSION_VAKRATUNDA:
      console.log('🔄 SANSKRIT: Resuming rescue mission for Vakratunda');
      setCurrentRescueWord('vakratunda');
      setShowRescueMission(true);
      break;
      
    case PHASES.MAHAKAYA_STORY:
  console.log('🔄 SANSKRIT: Resuming Mahakaya story');
  setVakratundaPowerGained(true);  // ← ADD THIS LINE
  setShowMahakayaStory(true);
  break;
      
    case PHASES.RESCUE_MISSION_MAHAKAYA:
      console.log('🔄 SANSKRIT: Resuming rescue mission for Mahakaya');
      setCurrentRescueWord('mahakaya');
        setVakratundaPowerGained(true); // ADD THIS LINE
      setShowRescueMission(true);
      break;
      
    case PHASES.SCENE_COMPLETE:
      console.log('🔄 SANSKRIT: Resuming scene complete');
      // FIX 3: Check if we're in the middle of fireworks
      if (!sceneState.showingCompletionScreen) {
        console.log('🔄 SANSKRIT: Triggering fireworks on reload');
        setTimeout(() => {
          setShowSparkle('final-fireworks');
        }, 500);
      }
      break;
      
    default:
      console.log('🔄 SANSKRIT: No specific reload needed for phase:', sceneState.phase);
  }
  
}, [isReload]);

  // ENHANCED RELOAD LOGIC - With unified state restoration
  /*useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 SANSKRIT RELOAD: Starting unified reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase,
      memoryGameState: !!sceneState.memoryGameState,
      missionState: sceneState.missionState
    });

    // Check for Play Again flag first
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    const isFreshRestartAfterPlayAgain = (
      playAgainRequested === 'true' ||
      (sceneState.phase === PHASES.INITIAL && 
       sceneState.completed === false && 
       sceneState.stars === 0 && 
       (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen))
    );
    
    if (isFreshRestartAfterPlayAgain) {
      console.log('🔄 SANSKRIT RELOAD: Detected fresh restart after Play Again');
      
      if (playAgainRequested === 'true') {
        localStorage.removeItem(playAgainKey);
      }
      
      sceneActions.updateState({ 
        isReloadingGameCoach: false,
        showingCompletionScreen: false,
        currentPopup: null,
        completed: false,
        phase: PHASES.INITIAL,
        memoryGameState: null,
        missionState: {
          rescuePhase: 'problem',
          showParticles: false,
          word: null,
          missionJustCompleted: false
        }
      });
      return;
    }

    // Block GameCoach during reload
    sceneActions.updateState({ isReloadingGameCoach: true });
    
    setTimeout(() => {
      
      // Handle popup states
      if (sceneState.currentPopup) {
        console.log('🔄 SANSKRIT: Resuming popup:', sceneState.currentPopup);
        
        switch(sceneState.currentPopup) {
          case 'final_fireworks':
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              localStorage.removeItem(playAgainKey);
              sceneActions.updateState({
                currentPopup: null,
                showingCompletionScreen: false,
                completed: false,
                phase: PHASES.INITIAL,
                stars: 0
              });
              return;
            }
            
            console.log('🎯 SANSKRIT: Resuming final fireworks');
            setShowSparkle('final-fireworks');
            sceneActions.updateState({
              gameCoachState: null,
              isReloadingGameCoach: false,
              phase: PHASES.SCENE_COMPLETE,
              stars: 5,
              completed: true
            });
            return;
        }
        return;
      }

      // Handle completion screen reload
      if (sceneState.showingCompletionScreen) {
        if (playAgainRequested === 'true') {
          localStorage.removeItem(playAgainKey);
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: PHASES.INITIAL,
            stars: 0,
            isReloadingGameCoach: false
          });
          return;
        }
        
        setShowSceneCompletion(true);
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

      // UNIFIED: Restore component states if available
      if (sceneState.memoryGameState) {
        console.log('🔄 Restoring memory game state:', sceneState.memoryGameState);
      }
      
      if (sceneState.missionState && sceneState.missionState.word) {
        console.log('🔄 Restoring mission state:', sceneState.missionState);
        setCurrentRescueWord(sceneState.missionState.word);
        if (sceneState.missionState.rescuePhase !== 'problem') {
          setShowRescueMission(true);
        }
      }

      // Default: clear flags
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
      
    }, 500);
    
  }, [isReload]);*/

// SINGERS: Buds for vakratunda
const getBudImage = (index) => {
  const images = [budVa, budKra, budTun, budDa];
  return images[index];
};

const getSeedImage = (index) => {
  return seedImage; // Always returns the same seed.png file
};

// CLICKERS: Keep existing elephant functions unchanged
const getBabyElephantImage = (index) => {
  const images = [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa];
  return images[index];
};

const getAdultElephantImage = (index) => {
  const images = [elephantMa, elephantHa, elephantKa, elephantYa];
  return images[index];
};

// REWARDS: Lotus for vakratunda (keep existing)
const getLotusImage = (index) => {
  const images = [lotusVa, lotusKra, lotusTun, lotusDa];
  return images[index];
};

// REWARDS: Flowers for mahakaya  
const getFlowerImage = (index) => {
  const images = [flowerMa, flowerHa, flowerKa, flowerYa];
  return images[index];
};

 // Updated handleSaveAnimal function - replace the entire function
const handleSaveAnimal = () => {
  console.log('🐱 RESCUE MISSION: Starting animal rescue');
  
  setShowChoiceButtons(false);
  setCurrentRescueWord(currentPracticeWord || blessingWord);
  
  // Update to specific rescue mission phase
  const word = currentPracticeWord || blessingWord;
  sceneActions.updateState({
    phase: word === 'vakratunda' 
      ? PHASES.RESCUE_MISSION_VAKRATUNDA 
      : PHASES.RESCUE_MISSION_MAHAKAYA
  });
  
  // UNIFIED: Save mission state
  handleSaveComponentState('mission', {
    rescuePhase: 'problem',
    word: word,
    showParticles: false
  });
  
  setShowRescueMission(true);
};

 // Updated handleRescueComplete function - replace the entire function
const handleRescueComplete = () => {
  console.log('✅ Rescue complete for:', currentRescueWord);
  
  // UNIFIED: Save completion state
  handleSaveComponentState('mission', {
    rescuePhase: 'success',
    word: currentRescueWord,
    missionJustCompleted: true
  });
  
  setShowRescueMission(false);
  
  if (currentRescueWord === 'vakratunda') {
    console.log('Vakratunda rescue complete - showing Mahakaya story first');
    
    setShowChoiceButtons(false);
    setShowGaneshaBlessing(false);
    setVakratundaPowerGained(true);
    
    // Update to story phase
    sceneActions.updateState({
      phase: PHASES.MAHAKAYA_STORY
    });
    
    setTimeout(() => {
      setShowMahakayaStory(true);
    }, 500);
    
  } else if (currentRescueWord === 'mahakaya') {
    console.log('Mahakaya rescue complete - FINAL FIREWORKS NOW!');
    
    setShowRescueMission(false);
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

 // Updated handlePhaseComplete function - replace the entire function
const handlePhaseComplete = (phase) => {
  console.log(`Phase ${phase} completed!`);
  
  if (phase === 'vakratunda') {
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, vakratunda: true },
      learnedSyllables: {
        ...sceneState.learnedSyllables,
        va: true, kra: true, tun: true, da: true
      },
      phase: PHASES.VAKRATUNDA_COMPLETE,
      progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
    });
    
    setBlessingWord('vakratunda');
    setCurrentPracticeWord('vakratunda');
    setShowSparkle('vakratunda-complete');
    setShowWordCelebration(true);
    
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowWordCelebration(false);
      // Move to specific blessing phase
      sceneActions.updateState({
        phase: PHASES.GANESHA_BLESSING_VAKRATUNDA
      });
      setBlessingPhase('welcome');
      setShowGaneshaBlessing(true);
    }, 4000);
    
  } else if (phase === 'mahakaya') {
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, mahakaya: true },
      learnedSyllables: {
        ...sceneState.learnedSyllables,
        ma: true, ha: true, ka: true, ya: true
      },
      phase: PHASES.MAHAKAYA_COMPLETE,
      progress: { percentage: 90, starsEarned: 4 }
    });

    setVakratundaPowerGained(false);
    
    setBlessingWord('mahakaya');
    setCurrentPracticeWord('mahakaya');
    setShowSparkle('mahakaya-complete');
    setShowWordCelebration(true);
    
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowWordCelebration(false);
      // Move to specific blessing phase
      sceneActions.updateState({
        phase: PHASES.GANESHA_BLESSING_MAHAKAYA
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
  
  if (currentPracticeWord === 'vakratunda') {
    console.log('Vakratunda continue - showing Mahakaya story first');

    // FORCE HIDE EVERYTHING FIRST
    setIsTransitioning(true);
    
    // Update to specific story phase
    sceneActions.updateState({
      phase: PHASES.MAHAKAYA_STORY,
      memoryGameState: null
    });
    
    setIsTransitioning(true);
    setShowGaneshaBlessing(false);
    setShowSparkle(null);           
    setShowWordCelebration(false);  
    setVakratundaPowerGained(true);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setShowMahakayaStory(true);
    }, 100);
    
  } else if (currentPracticeWord === 'mahakaya') {
    console.log('Mahakaya continue - ending scene');
    
    // ✅ Properly clear all UI states before fireworks
    setShowGaneshaBlessing(false);
    setShowChoiceButtons(false);
    setShowRecording(false);
    setShowWordCelebration(false);
    
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

  // Handle complete game from memory game
  const handleGameComplete = () => {
    console.log('Memory game complete! Both words learned.');
  };

// Replace the handleSyllablePlay function:
const handleSyllablePlay = (syllable) => {
  if (!isAudioOn) return;
  
  const syllableFileMap = {
    'va': 'vakratunda-va',
    'kra': 'vakratunda-kra', 
    'tun': 'vakratunda-tun',
    'da': 'vakratunda-da',
    'ma': 'mahakaya-ma',
    'ha': 'mahakaya-ha',
    'ka': 'mahakaya-ka',
    'ya': 'mahakaya-ya'
  };
  
  const fileName = syllableFileMap[syllable] || syllable;
  playAudio(`/audio/syllables/${fileName}.mp3`);
};

 // Replace the handleWordPlay function:
const handleWordPlay = (word) => {
  if (!isAudioOn) return;
  
  if (word === 'complete') {
    playAudio('/audio/words/vakratunda-mahakaya-complete.mp3');
  } else {
    playAudio(`/audio/words/${word}.mp3`);
  }
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
      message: 'Listen carefully to the sacred sounds!',
      explicitMessage: 'Wait for the sequence to finish, then click the elephants in the same order!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.gamePhase === 'playing' && !showRecording;
      }
    },
    {
      id: 'elephant-clicking-hint', 
      message: 'Click the elephants to repeat the sequence!',
      explicitMessage: 'Click the baby elephants in the order you heard: va-kra-tun-da!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        return sceneState?.gamePhase === 'listening' && !showRecording;
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
      console.log('Starting memory game');
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
        <div className="counter-icon">Ã°Å¸Å'¸</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{
              width: `${(learnedCount / totalSyllables) * 100}%`,
              background: `linear-gradient(90deg, #4ECDC4 0%, #44A08D 50%, #FFD700 100%)`
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
  if (currentRecordingWord === 'vakratunda') {
    console.log('=== CALLING startBlessingAnimation for vakratunda ===');
    startBlessingAnimation();
    
  } else if (currentRecordingWord === 'mahakaya') {
    console.log('=== CALLING startBlessingAnimation for mahakaya ===');
    // ✅ Fix: Use the same blessing flow as vakratunda
    startBlessingAnimation();
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
    
    if (window.smartwatchWidget) {
      window.smartwatchWidget.addApp({
        id: wordToProcess,
        name: wordToProcess,
        image: wordToProcess === 'vakratunda' ? appVakratunda : appMahakaya,
        sceneId: 'vakratunda-grove',
        power: powerConfig[wordToProcess]
      });
    }
    await new Promise(resolve => safeSetTimeout(resolve, 1000));

    setShowGaneshaBlessing(false);
    setShowChoiceButtons(true);
    setBlessingPhase('complete');
    
    // Update to specific choice buttons phase
    const word = blessingWord || currentPracticeWord;
    sceneActions.updateState({
      phase: word === 'vakratunda' 
        ? PHASES.CHOICE_BUTTONS_VAKRATUNDA 
        : PHASES.CHOICE_BUTTONS_MAHAKAYA
    });
    
  } catch (error) {
    console.error('Blessing animation error:', error);
    setShowGaneshaBlessing(false);
    setShowChoiceButtons(true);
    setBlessingPhase('complete');
    
    // Update phase even on error
    const word = blessingWord || currentPracticeWord;
    sceneActions.updateState({
      phase: word === 'vakratunda' 
        ? PHASES.CHOICE_BUTTONS_VAKRATUNDA 
        : PHASES.CHOICE_BUTTONS_MAHAKAYA
    });
  }
};


  const getSyllableState = (syllable) => {
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    const currentPhase = sceneState.learnedWords?.vakratunda ? 'mahakaya' : 'vakratunda';
    const phaseSyllables = currentPhase === 'vakratunda' 
      ? ['va', 'kra', 'tun', 'da'] 
      : ['ma', 'ha', 'ka', 'ya'];
    
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';
    return 'locked';
  };

  // Determine if memory game should be active
  const isMemoryGameActive = sceneState.phase === PHASES.MEMORY_GAME_ACTIVE || 
                           sceneState.phase === PHASES.VAKRATUNDA_COMPLETE;

  // UNIFIED: Extract reload props for both components
  const memoryGameReloadProps = sceneState.memoryGameState ? {
    isReload: isReload,
    initialGamePhase: sceneState.memoryGameState.gamePhase || 'waiting',
    initialCurrentPhase: sceneState.memoryGameState.currentPhase || 'vakratunda',
    initialCurrentRound: sceneState.memoryGameState.currentRound || 1,
    initialPlayerInput: sceneState.memoryGameState.playerInput || [],
    initialCurrentSequence: sceneState.memoryGameState.currentSequence || [],
    initialSequenceItemsShown: sceneState.memoryGameState.sequenceItemsShown || 0,
    initialPermanentlyBloomed: sceneState.memoryGameState.permanentlyBloomed || {},
    initialComboStreak: sceneState.memoryGameState.comboStreak || 0,
    initialMistakeCount: sceneState.memoryGameState.mistakeCount || 0,
    phaseJustCompleted: sceneState.memoryGameState.phaseJustCompleted || false,
    lastCompletedPhase: sceneState.memoryGameState.lastCompletedPhase || null,
    gameJustCompleted: sceneState.memoryGameState.gameJustCompleted || false,
    initialIsCountingDown: sceneState.memoryGameState.isCountingDown || false,  // ADD THIS
  initialCountdown: sceneState.memoryGameState.countdown || 0,                // ADD THIS
      forcePhase: sceneState.phase === PHASES.MEMORY_GAME_ACTIVE && 
              sceneState.learnedWords?.vakratunda === true && 
              sceneState.learnedWords?.mahakaya === false ? 'mahakaya' : null
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
        <div className="vakratunda-grove-container">
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>

            {/* UNIFIED: Sanskrit Memory Game Component with proper reload props */}
            <SanskritMemoryGame
              isActive={isMemoryGameActive}
              hideElements={isTransitioning || 
                showGaneshaBlessing || showMahakayaStory || 
                sceneState.phase === PHASES.VAKRATUNDA_COMPLETE || 
                sceneState.phase === PHASES.MAHAKAYA_COMPLETE || 
                sceneState.phase === PHASES.SCENE_COMPLETE}
              powerGained={vakratundaPowerGained}
              onPhaseComplete={handlePhaseComplete}
              onGameComplete={handleGameComplete}
              profileName={profileName}
              
             // NEW: 3-element system asset getters
  getBudImage={getBudImage}           // Singers for vakratunda
  getSeedImage={getSeedImage}         // Singers for mahakaya
  getBabyElephantImage={getBabyElephantImage}  // Clickers for vakratunda
  getAdultElephantImage={getAdultElephantImage} // Clickers for mahakaya
  getLotusImage={getLotusImage}       // Rewards for vakratunda
  getFlowerImage={getFlowerImage}     // Rewards for mahakaya


              isAudioOn={isAudioOn}
  playAudio={playAudio}
              
              // Pass WaterSprayArc component
              WaterSprayComponent={WaterSprayArc}
              
              // UNIFIED: State saving for reload support
              onSaveGameState={(gameState) => handleSaveComponentState('memoryGame', gameState)}
              
              // UNIFIED: Cleanup callback
              onCleanup={() => console.log('Memory game cleaned up')}
              
              // Reload support props
              {...memoryGameReloadProps}
            />

            

            {/* Story Introduction - Show immediately when scene starts */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
              <>
                {/* Preview Elements */}
                <div style={{
                  position: 'absolute',
                  left: '15%',
                  top: '45%',
                  animation: 'gentle-glow 3s ease-in-out infinite',
                  zIndex: 5
                }}>
                  <img src={getLotusImage(0)} alt="Sleeping Lotus" style={{width: '60px', opacity: 0.8}} />
                </div>
                
                <div style={{
                  position: 'absolute',
                  left: '18%',
                  top: '65%',
                  animation: 'gentle-breathe 4s ease-in-out infinite',
                  zIndex: 5
                }}>
                  <img src={getBabyElephantImage(0)} alt="Baby Elephant" style={{width: '120px', opacity: 0.9}} />
                </div>

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
                    color: '#2E7D32',
                    marginBottom: '10px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    The Magical Sacred Water
                  </div>
                  
                  <div style={{
                    fontSize: '15px',
                    color: '#1565C0',
                    marginBottom: '8px'
                  }}>
                    Help the baby elephants bloom sleeping lotus flowers
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    Listen to their ancient chants, then repeat the sounds
                  </div>
                  
                  <button
                    onClick={() => {
                      sceneActions.updateState({ 
                        welcomeShown: true,
                        phase: PHASES.MEMORY_GAME_ACTIVE 
                      });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '12px 25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    Begin the Adventure
                  </button>
                </div>
              </>
            )}

            {showMahakayaStory && (
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
                    color: '#FF6B35',
                    marginBottom: '10px'
                  }}>
                    The Ancient Stone Powers
                  </div>
                  
                  <div style={{
                    fontSize: '15px',
                    color: '#1565C0',
                    marginBottom: '8px'
                  }}>
                    Help the mighty elephants awaken sleeping stone guardians
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    With your new flexibility power, teach them the sounds of strength
                  </div>
                  
                  <button
onClick={() => {
  console.log('Begin Stone Awakening clicked - starting Mahakaya properly');
  
  setIsTransitioning(true);
  setShowMahakayaStory(false);
  
  setTimeout(() => {
    // This logic was WORKING - don't change it
    sceneActions.updateState({ 
      phase: PHASES.MEMORY_GAME_ACTIVE,
      currentPopup: null,
      memoryGameState: null  // Clear old Vakratunda state
    });
    
    // Start Mahakaya immediately - this was working
    setTimeout(() => {
      if (window.sanskritMemoryGame?.startMahakayaPhase) {
        window.sanskritMemoryGame.startMahakayaPhase();
      }
    }, 200);
    
    // ONLY TIMING FIX: Keep transitioning longer to hide flash
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Was 100ms, now 400ms - hides the brief flash
    
  }, 100);
}}
                    style={{
                      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '12px 25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      cursor: 'pointer'
                    }}
                  >
                    Begin Stone Awakening
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
                  src={showCenteredApp === 'vakratunda' ? appVakratunda : appMahakaya}
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
             !showMahakayaStory && 
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

            {/* UNIFIED: Save Animal Mission Component with proper reload props */}
            <SaveAnimalMission
              show={showRescueMission}
              word={currentRescueWord}
              beforeImage={currentRescueWord === 'vakratunda' ? vakratundaBefore : mahakayaBefore}
              afterImage={currentRescueWord === 'vakratunda' ? vakratundaAfter : mahakayaAfter}
              powerConfig={powerConfig[currentRescueWord]}
              smartwatchBase={smartwatchBase}
              smartwatchScreen={smartwatchScreen}
              appImage={currentRescueWord === 'vakratunda' ? appVakratunda : appMahakaya}
              boyCharacter={boyNamaste}
              onComplete={handleRescueComplete}
              onCancel={() => setShowRescueMission(false)}
              
              // UNIFIED: Reload support props
              {...missionReloadProps}
              onSaveMissionState={(missionState) => handleSaveComponentState('mission', missionState)}
            />

            {/* Audio Practice Popup */}
            {showAudioPractice && (
              <div className="audio-practice-popup">
                <div className="audio-practice-content">
                  <div className="practice-title">Practice {currentPracticeWord}</div>
                  <div className="syllable-buttons">
                    {currentPracticeWord === 'vakratunda' ? 
                      ['VA', 'KRA', 'TUN', 'DA'].map(syl => (
                        <button key={syl} className="syllable-practice-btn" 
                                onClick={() => handleSyllablePlay(syl.toLowerCase())}>
                          {syl}
                        </button>
                      )) :
                      ['MA', 'HA', 'KA', 'YA'].map(syl => (
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
                  {currentPracticeWord === 'mahakaya' ? 'Ã¢Å"¨ End Scene' : '➡️ Continue Learning'}
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
                  color: (blessingWord || currentPracticeWord) === 'vakratunda' ? '#FFD700' : '#FF6B35',
                  textShadow: `0 0 20px ${(blessingWord || currentPracticeWord) === 'vakratunda' ? 'rgba(255, 215, 0, 0.8)' : 
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
            {showSparkle === 'vakratunda-complete' && (
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

            {showSparkle === 'mahakaya-complete' && (
              <SparkleAnimation
                type="magic"
                count={50}
                color="#FF6B35"
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
        
          {/* Final Fireworks 
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              count={15}
              colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
              onComplete={() => {
                console.log('🎯 FIREWORKS COMPLETION HANDLER CALLED');
                
                try {
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    try {
                      GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                        completed: true,
                        stars: 5,
                        syllables: sceneState?.learnedSyllables || {},
                        words: sceneState?.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });
                      console.log('Ã¢Å"… Game state saved successfully');
                    } catch (saveError) {
                      console.warn('âš ️ Error saving game state:', saveError);
                    }

                    try {
                      localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                      SimpleSceneManager.clearCurrentScene();
                      console.log('Ã¢Å"… Temp session cleared');
                    } catch (clearError) {
                      console.warn('âš ️ Error clearing session:', clearError);
                    }
                  }

                  sceneActions.updateState({
                    showingCompletionScreen: true,
                    currentPopup: null,
                    phase: PHASES.SCENE_COMPLETE,
                    stars: 5,
                    completed: true
                  });
                  console.log('🎯 Scene state updated');

                  setShowSceneCompletion(true);
                  console.log('🎯 setShowSceneCompletion(true) called');
                  
                } catch (error) {
                  console.error('💥 Error in fireworks completion:', error);
                  setShowSceneCompletion(true);
                }
              }}
            />
          )}*/}

           {/* Final Fireworks */}
                      {showSparkle === 'final-fireworks' && (
                        <Fireworks
                          show={true}
                          duration={8000}
                          count={25}
                          colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                          onComplete={() => {
                            console.log('🎯 Vakratunda chant fireworks complete');
                            setShowSparkle(null);
                            
                            const profileId = localStorage.getItem('activeProfileId');
                            if (profileId) {
                        GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                        completed: true,
                        stars: 5,
                        syllables: sceneState?.learnedSyllables || {},
                        words: sceneState?.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });
                      localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                              SimpleSceneManager.clearCurrentScene();
                              console.log('✅ vakratunda chant: Completion saved and temp session cleared');
                            }
                            
                            setShowSceneCompletion(true);
                          }}
                        />
                      )}
          
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Vakratunda Grove"
            sceneNumber={1}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
            discoveredSymbols={Object.keys(sceneState.learnedSyllables || {}).filter(syl =>
              sceneState.learnedSyllables?.[syl]
            )}
            nextSceneName="Suryakoti Bank"
            sceneId="vakratunda-grove"
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
                localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                localStorage.removeItem(`replay_session_${profileId}_shloka-river_vakratunda-grove`);
                localStorage.removeItem(`play_again_${profileId}_shloka-river_vakratunda-grove`);
                
                SimpleSceneManager.setCurrentScene('shloka-river', 'vakratunda-grove', false, false);
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
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'vakratunda-grove', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
                
                GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
                
                console.log('SANSKRIT CONTINUE: Completion data saved');
              }

              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'suryakoti-bank', false, false);
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

          {/* TESTING: Quick completion button */}
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
            console.log('🧪 TESTING: Quick completion test clicked');
            
            sceneActions.updateState({
              learnedSyllables: {
                va: true, kra: true, tun: true, da: true,
                ma: true, ha: true, ka: true, ya: true
              },
              learnedWords: {
                vakratunda: true,
                mahakaya: true
              },
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
            
            setShowSparkle(null);
            setShowRecording(false);
            setShowSceneCompletion(false);
            
            setTimeout(() => {
              setShowSparkle('final-fireworks');
            }, 1000);
          }}>
            COMPLETE SANSKRIT
          </div>

          // 6. Add visual mute indicator (optional - add this to the JSX)
{!isAudioOn && (
  <div style={{
    position: 'fixed',
    top: '50px',
    left: '20%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    🔇 Audio Muted
  </div>
)}

          // Add this test button near your other test buttons in the JSX return

{/* TESTING: Skip to Mahakaya Story Button */}
<div style={{
  position: 'fixed',
  top: '200px',
  right: '60px',
  zIndex: 9999,
  background: '#FF6B35',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
}} onClick={() => {
  console.log('🧪 TESTING: Skip to Mahakaya Story clicked');
  
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
  
  // Set Vakratunda as completed
  setVakratundaPowerGained(true);
  
  // Update scene state to simulate Vakratunda completion
  sceneActions.updateState({
    // Mark Vakratunda as fully learned
    learnedSyllables: {
      va: true, kra: true, tun: true, da: true,
      ma: false, ha: false, ka: false, ya: false  // Mahakaya not learned yet
    },
    learnedWords: {
      vakratunda: true,   // Vakratunda complete
      mahakaya: false     // Mahakaya not learned yet
    },
    
    // Set to Mahakaya story phase
    phase: PHASES.MAHAKAYA_STORY,
    
    // Clear any conflicting popup/UI states
    currentPopup: null,
    showingCompletionScreen: false,
    gameCoachState: null,
    isReloadingGameCoach: false,
    
    // Clear memory game state to avoid contamination
    memoryGameState: null,
    
    // Reset mission state
    missionState: {
      rescuePhase: 'problem',
      showParticles: false,
      word: null,
      missionJustCompleted: false
    },
    
    // Progress shows Vakratunda complete
    stars: 3,
    completed: false,  // Scene not fully complete yet
    progress: { percentage: 50, starsEarned: 3, completed: false },
    
    // Story flags
    welcomeShown: true,
    vakratundaWisdomShown: true,
    mahakayaWisdomShown: false
  });
  
  // Show the Mahakaya story after brief delay
  setTimeout(() => {
    setShowMahakayaStory(true);
  }, 500);
  
  console.log('✅ State set for Mahakaya story - should show "Begin Stone Awakening" button');
}}>
  SKIP TO MAHAKAYA
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
              word: 'vakratunda',
              showParticles: true,
              missionJustCompleted: false
            });
            
            // Test memory game state
            handleSaveComponentState('memoryGame', {
              gamePhase: 'listening',
              currentPhase: 'vakratunda',
              currentRound: 2,
              playerInput: ['va', 'kra'],
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

export default VakratundaGrove;