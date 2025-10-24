// zones/shloka-river/scenes/Scene1/VakratundaGrove.jsx - Updated with Water Spray Integration
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

// Images - River scene assets
import riverBackground from './assets/images/elephant-grove-bg.png';
import lotusVa from './assets/images/lotus-va.png';
import lotusKra from './assets/images/lotus-kra.png';
import lotusTun from './assets/images/lotus-tun.png';
import lotusDa from './assets/images/lotus-da.png';
import stoneMa from './assets/images/stone-ma.png';
import stoneHa from './assets/images/stone-ha.png';
import stoneKa from './assets/images/stone-ka.png';
import stoneYa from './assets/images/stone-ya.png';
import elephantBabyVa from './assets/images/elephant-baby-va.png';
import elephantBabyKra from './assets/images/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/elephant-baby-da.png';
import elephantHa from './assets/images/elephant-ha.png';
import elephantKa from './assets/images/elephant-ka.png';
import elephantMa from './assets/images/elephant-ma.png';
import elephantYa from './assets/images/elephant-ya.png';

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

const PHASES = {
  INITIAL: 'initial',
  MEMORY_GAME_ACTIVE: 'memory_game_active',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
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
          
          // Memory game state (for reload support)
          memoryGameState: null,
          
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
  console.log('VakratundaGroveContent render', { sceneState, isReload, zoneId, sceneId });

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
// Add these after your existing useState declarations
const [blessingPhase, setBlessingPhase] = useState('welcome'); // You already have this
const [showParticles, setShowParticles] = useState(false);
const [showPulseRings, setShowPulseRings] = useState(false);

const [vakratundaPowerGained, setVakratundaPowerGained] = useState(false);
const [showCenteredApp, setShowCenteredApp] = useState(null);
const [blessingWord, setBlessingWord] = useState('');

// Add these state variables at the top with other useState
const [showRescueMission, setShowRescueMission] = useState(false);
const [rescuePhase, setRescuePhase] = useState('problem'); // 'problem', 'action', 'success'
const [currentRescueWord, setCurrentRescueWord] = useState('');


// Add power configuration
const powerConfig = {
  vakratunda: { name: 'Flexibility', icon: '🌀', color: '#FFD700' },
  mahakaya: { name: 'Inner Strength', icon: '💎', color: '#FF6B35' }
};

  
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
    };
  }, []);

  // Add this useEffect to track showCenteredApp changes
useEffect(() => {
  console.log('showCenteredApp changed to:', showCenteredApp);
}, [showCenteredApp]);

// ADD THIS NEW useEffect HERE:
useEffect(() => {
  // Set up communication with memory game
  window.sanskritMemoryGame = {};
  return () => {
    if (window.sanskritMemoryGame) {
      delete window.sanskritMemoryGame;
    }
  };
}, []);

// ENHANCED RELOAD LOGIC - Adapted from Document 3
useEffect(() => {
  if (!isReload || !sceneState) return;
  
  console.log('🔄 SANSKRIT RELOAD: Starting reload sequence', {
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
      phase: PHASES.INITIAL
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
          
          console.log('🎆 SANSKRIT: Resuming final fireworks');
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

    // Default: clear flags
    setTimeout(() => {
      sceneActions.updateState({ isReloadingGameCoach: false });
    }, 1500);
    
  }, 500);
  
}, [isReload]);

  // Get element images
  const getLotusImage = (index) => {
    const images = [lotusVa, lotusKra, lotusTun, lotusDa];
    return images[index];
  };

  const getStoneImage = (index) => {
    const images = [stoneMa, stoneHa, stoneKa, stoneYa];
    return images[index];
  };

  const getBabyElephantImage = (index) => {
    const images = [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa];
    return images[index];
  };

  const getAdultElephantImage = (index) => {
    const images = [elephantMa, elephantHa, elephantKa, elephantYa];
    return images[index];
  };

  // Handle memory game state saving for reload support
  const handleSaveMemoryGameState = (gameState) => {
    console.log('Saving memory game state:', gameState);
    sceneActions.updateState({ memoryGameState: gameState });
  };

  // Update handleSaveAnimal function
const handleSaveAnimal = () => {
  console.log('🐱 RESCUE MISSION: Starting animal rescue');
  
  setShowChoiceButtons(false);
  setCurrentRescueWord(currentPracticeWord || blessingWord);
  setRescuePhase('problem');
  setShowRescueMission(true);
};

// Add rescue mission handlers
const handleRescueAction = () => {
  console.log('⚡ RESCUE MISSION: Using power to help');
  setRescuePhase('action');
  
  // Show power effect
  setShowParticles(true);
  setTimeout(() => {
    setShowParticles(false);
    setRescuePhase('success');
  }, 3000);
};

const handleRescueComplete = () => {
  console.log('Rescue complete for:', currentRescueWord);
  setShowRescueMission(false);
  
  if (currentRescueWord === 'vakratunda') {
    // First rescue done - return to choice buttons for mahakaya
    setShowChoiceButtons(true);
  } else if (currentRescueWord === 'mahakaya') {
    // Second rescue done - trigger final fireworks
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      currentPopup: 'final_fireworks'
    });
    setTimeout(() => setShowSparkle('final-fireworks'), 500);
  }
};

  // Handle phase completion from memory game
  /*const handlePhaseComplete = (phase) => {
    console.log(`Phase ${phase} completed!`);
    
    if (phase === 'vakratunda') {
      // Update learning progress
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, vakratunda: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          va: true, kra: true, tun: true, da: true
        },
        phase: PHASES.VAKRATUNDA_COMPLETE,
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      setShowSparkle('vakratunda-complete');
      safeSetTimeout(() => setShowSparkle(null), 3000);
      
    } else if (phase === 'mahakaya') {
      // Complete scene
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, mahakaya: true },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          ma: true, ha: true, ka: true, ya: true
        },
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      setShowSparkle('scene-complete');
      safeSetTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 2000);
    }
  };*/

// Update handlePhaseComplete to store the word safely
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
    
    setShowSparkle('vakratunda-complete');
    safeSetTimeout(() => setShowSparkle(null), 3000);
    
    // CHANGED: Store word safely and show blessing
    safeSetTimeout(() => {
      setBlessingWord('vakratunda'); // Store the word safely
      setCurrentPracticeWord('vakratunda'); // Keep existing logic
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
  setShowSparkle('mahakaya-complete');
  safeSetTimeout(() => setShowSparkle(null), 3000);

  // FIXED: Use regular setTimeout and add proper initialization
  setTimeout(() => {
    console.log('=== MAHAKAYA BLESSING TRIGGER ===');
    setBlessingWord('mahakaya');
    setCurrentPracticeWord('mahakaya');
    setBlessingPhase('welcome'); // ADD THIS LINE
    setShowGaneshaBlessing(true);
    console.log('Mahakaya blessing should now be visible');
  }, 4000);
}
};

const handleGaneshaRecord = () => {
  // Chant Now - open recorder first, blessing happens after recording
  setCurrentRecordingWord(currentPracticeWord);
  setShowRecording(true);
  // Don't hide Ganesha yet - wait until recording is done
};

const handleGaneshaSkip = () => {
  // Chant Later - start blessing animation immediately 
  startBlessingAnimation();
  // Don't hide Ganesha yet - let animation play first
};

// Add new blessing sequence function
const startBlessingSequence = async () => {
  try {
    // Phase 1: Welcome (2 seconds)
    setBlessingPhase('welcome');
    await new Promise(resolve => safeSetTimeout(resolve, 2000));

    // Phase 2: Blessing (3 seconds)
    setBlessingPhase('blessing');
    await new Promise(resolve => safeSetTimeout(resolve, 3000));

    // Phase 3: Power transfer with particles (4 seconds)
    setBlessingPhase('transfer');
    setShowParticles(true);
    await new Promise(resolve => safeSetTimeout(resolve, 4000));
    setShowParticles(false);

    // Phase 4: Recording
    setBlessingPhase('recording');
    setShowPulseRings(true);
    setShowGaneshaBlessing(false);
    setCurrentRecordingWord(currentPracticeWord);
    setShowRecording(true);

  } catch (error) {
    console.error('Blessing sequence error:', error);
    // Fallback to recording
    setShowGaneshaBlessing(false);
    setCurrentRecordingWord(currentPracticeWord);
    setShowRecording(true);
  }
};

const handlePowerTransfer = (word) => {
  // Add app to unlocked list
  setUnlockedApps(prev => [...prev, word]);
  
  // Show choice buttons
  setShowChoiceButtons(true);
  
  // Show sparkle effect
  setShowSparkle(`${word}-power-gained`);
  setTimeout(() => setShowSparkle(null), 2000);
};

const handleContinueLearning = () => {
  console.log('=== CONTINUE LEARNING CLICKED ===');
  console.log('currentPracticeWord:', currentPracticeWord);
  
  setShowChoiceButtons(false);
  
  if (currentPracticeWord === 'vakratunda') {
    console.log('Continue Learning clicked after vakratunda - starting Mahakaya');
    setShowGaneshaBlessing(false);
    setVakratundaPowerGained(true);
    
    // DON'T update scene phase immediately - let memory game handle it
    // sceneActions.updateState({
    //   phase: PHASES.MEMORY_GAME_ACTIVE  // <- REMOVE THIS
    // });
    
    // Enhanced retry function with readiness check
    const tryStartMahakaya = (attempts = 0) => {
      console.log(`Attempt ${attempts + 1}: Checking memory game availability...`);
      console.log('window.sanskritMemoryGame:', window.sanskritMemoryGame);
      
      if (window.sanskritMemoryGame && 
          window.sanskritMemoryGame.isReady && 
          typeof window.sanskritMemoryGame.startMahakayaPhase === 'function') {
        
        console.log('Memory game ready! Starting Mahakaya phase...');
        try {
          window.sanskritMemoryGame.startMahakayaPhase();
          console.log('Mahakaya phase started successfully');
          
          // NOW update the scene phase after memory game transitions
          setTimeout(() => {
            sceneActions.updateState({
              phase: PHASES.MEMORY_GAME_ACTIVE
            });
          }, 200); // Brief delay to let memory game update first
          
        } catch (error) {
          console.error('Error calling startMahakayaPhase:', error);
        }
        
      } else if (attempts < 15) {
        console.log(`Not ready yet. Retrying in 300ms... (attempt ${attempts + 1}/15)`);
        setTimeout(() => tryStartMahakaya(attempts + 1), 300);
        
      } else {
        console.error('Failed to start Mahakaya phase after 15 attempts');
        console.log('Final state:', {
          sanskritMemoryGame: window.sanskritMemoryGame,
          isReady: window.sanskritMemoryGame?.isReady,
          functionType: typeof window.sanskritMemoryGame?.startMahakayaPhase
        });
      }
    };
    
    // Start trying after a brief delay
    setTimeout(() => tryStartMahakaya(), 200);
    
  } else if (currentPracticeWord === 'mahakaya') {
    console.log('END SCENE CLICKED - TRIGGERING FINAL FIREWORKS!');
    
    // Clear all UI states
    setShowGaneshaBlessing(false);
    setShowSparkle(null);
    
    // Set final completion state
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      currentPopup: 'final_fireworks',
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    // Trigger fireworks
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
    // The final phase completion will be handled by handlePhaseComplete
  };

const handleSyllablePlay = (syllable) => {
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
  const audio = new Audio(`/audio/syllables/${fileName}.mp3`);
  audio.play().catch(e => console.log('Audio not found'));
};

const handleWordPlay = (word) => {
  if (word === 'complete') {
    const audio = new Audio('/audio/words/vakratunda-mahakaya-complete.mp3');
    audio.play().catch(e => console.log('Complete shloka audio not found'));
  } else {
    const audio = new Audio(`/audio/words/${word}.mp3`);
    audio.play().catch(e => console.log('Word audio not found'));
  }
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

  // GameCoach messages with enhanced story
  useEffect(() => {
    if (!sceneState || !showMessage || sceneState.isReloadingGameCoach) return;
    
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      const timer = setTimeout(() => {
        showMessage(`Welcome to the Sacred Grove, ${profileName}! The baby elephants know ancient sounds that can awaken sleeping lotus flowers. Click an elephant to see their magical water spray!`, {
          duration: 8000,
          animation: 'bounce',
          position: 'top-right'
        });
        sceneActions.updateState({ welcomeShown: true });
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Phase completion messages
    /*if (sceneState.phase === PHASES.VAKRATUNDA_COMPLETE && !sceneState.vakratundaWisdomShown) {
      const timer = setTimeout(() => {
        showMessage(`Beautiful! The lotus flowers have learned the sacred word 'Vakratunda' and will remember it forever. Now the adult elephants want to teach their stone friends with their powerful water sprays!`, {
          duration: 6000,
          animation: 'slideInRight',
          position: 'top-right'
        });
        sceneActions.updateState({ vakratundaWisdomShown: true });
      }, 2000);
      return () => clearTimeout(timer);
    }*/
    
  }, [sceneState?.phase, sceneState?.welcomeShown, sceneState?.vakratundaWisdomShown, showMessage]);

  // Render progress counter with bloom visualization
  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;
    
    return (
      <div className="syllable-counter">
        <div className="counter-icon">🌸</div>
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
  
  // Show completion glow
  safeSetTimeout(() => {
    continueAfterRecording();
  }, 2000);
};

// Handle recording skip
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
    console.log('MAHAKAYA RECORDING COMPLETE - TRIGGERING FINAL FIREWORKS!');
    
    // CLEAR ALL UI STATES FIRST
    setShowSparkle(null);
    
    // UPDATE TO FINAL COMPLETION STATE
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      currentPopup: 'final_fireworks',
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    // TRIGGER FINAL FIREWORKS
    setTimeout(() => {
      setShowSparkle('final-fireworks');
    }, 500);
  }
};

// Update startBlessingAnimation to use stored word
const startBlessingAnimation = async () => {
  try {
    console.log('=== BLESSING ANIMATION START ===');
    console.log('blessingWord:', blessingWord);
    console.log('currentPracticeWord:', currentPracticeWord);
    
    // Use blessingWord as primary source
    const wordToProcess = blessingWord || currentPracticeWord;
    console.log('Using word for processing:', wordToProcess);
    
    if (!wordToProcess) {
      console.error('No word to process in blessing animation!');
      return;
    }
    
    // Phase 1: Power transfer with particles (4 seconds)
    setBlessingPhase('transfer');
    setShowParticles(true);
    await new Promise(resolve => safeSetTimeout(resolve, 4000));
    setShowParticles(false);

    // Phase 2: Smartwatch animation to center
    console.log('Phase 2: Moving smartwatch to center...');
    await new Promise(resolve => safeSetTimeout(resolve, 2000));

    // Phase 3: Show app in center with glow
    console.log('Phase 3: SETTING showCenteredApp to:', wordToProcess);
    setShowCenteredApp(wordToProcess);
    console.log('showCenteredApp should now be visible');
    
    // Wait 4 seconds and log progress
    for (let i = 1; i <= 4; i++) {
      await new Promise(resolve => safeSetTimeout(resolve, 1000));
      console.log(`Second ${i}: Centered app should be showing ${wordToProcess}`);
    }

    // Phase 4: Move app to smartwatch
    console.log('Phase 4: CLEARING showCenteredApp, moving to smartwatch');
    setShowCenteredApp(null);
// Add to persistent smartwatch
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

    // Phase 5: Complete blessing
    setShowGaneshaBlessing(false);
    setShowChoiceButtons(true);
    setBlessingPhase('complete');
    
    console.log('=== BLESSING ANIMATION COMPLETE ===');

  } catch (error) {
    console.error('Blessing animation error:', error);
    setShowGaneshaBlessing(false);
if (window.smartwatchWidget && (blessingWord || currentPracticeWord)) {
  window.smartwatchWidget.addApp({
    id: blessingWord || currentPracticeWord,
    name: blessingWord || currentPracticeWord,
    image: (blessingWord || currentPracticeWord) === 'vakratunda' ? appVakratunda : appMahakaya,
    sceneId: 'vakratunda-grove'
  });
}    setShowChoiceButtons(true);
    setBlessingPhase('complete');
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

  // Extract reload props for memory game
  const memoryGameReloadProps = sceneState.memoryGameState ? {
    isReload: isReload,
    initialGamePhase: sceneState.memoryGameState.gamePhase || 'waiting',
    initialCurrentPhase: sceneState.memoryGameState.currentPhase || 'vakratunda',
    initialCurrentRound: sceneState.memoryGameState.currentRound || 1,
    initialPlayerInput: sceneState.memoryGameState.playerInput || [],
    initialCurrentSequence: sceneState.memoryGameState.currentSequence || [],
    initialSequenceItemsShown: sceneState.memoryGameState.sequenceItemsShown || 0,
    phaseJustCompleted: sceneState.memoryGameState.phaseJustCompleted || false,
    lastCompletedPhase: sceneState.memoryGameState.lastCompletedPhase || null,
    initialPermanentlyBloomed: sceneState.memoryGameState.permanentlyBloomed || {}
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
{/* {renderProgressCounter()} */}

            {/* Sanskrit Memory Game Component with Water Spray Integration */}
            <SanskritMemoryGame
              isActive={isMemoryGameActive}
  hideElements={showGaneshaBlessing || sceneState.phase === PHASES.VAKRATUNDA_COMPLETE || 
    sceneState.phase === PHASES.MAHAKAYA_COMPLETE || sceneState.phase === PHASES.SCENE_COMPLETE}
  powerGained={vakratundaPowerGained}
              onPhaseComplete={handlePhaseComplete}
              onGameComplete={handleGameComplete}
              profileName={profileName}
              
              // Asset getters
              getLotusImage={getLotusImage}
              getStoneImage={getStoneImage}
              getBabyElephantImage={getBabyElephantImage}
              getAdultElephantImage={getAdultElephantImage}
              
              // NEW: Pass WaterSprayArc component
              WaterSprayComponent={WaterSprayArc}
              
              // State saving for reload support
              onSaveGameState={handleSaveMemoryGameState}
              
              // Reload support props
              {...memoryGameReloadProps}
            />

            {/* Add this before the closing </div> of your main container */}
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

{/* Replace the existing syllable-progress-bar with this 
<SanskritRiverProgress
  learnedWords={sceneState.learnedWords || {}}
  currentScene={1}
  onWordClick={(word, state) => {
    if (state === 'learned') {
      handleWordPlay(word.id);
    }
  }}
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

{/* Smartwatch Widget 
<div className="smartwatch-widget" onClick={() => console.log('Smartwatch clicked')}>
  <div className="smartwatch-apps-overlay">
    <img 
      src={smartwatchScreen} 
      alt="screen" 
      className={`smartwatch-screen ${unlockedApps.length > 0 ? 'active' : ''}`} 
    />
    {unlockedApps.includes('vakratunda') && (
      <img 
        src={appVakratunda}
        alt="memory app"
        className="smartwatch-app app-1 unlocked"
        onClick={() => handleAppClick('vakratunda')}
      />
    )}
    {unlockedApps.includes('mahakaya') && (
      <img 
        src={appMahakaya}
        alt="strength app"
        className="smartwatch-app app-2 unlocked"
        onClick={() => handleAppClick('mahakaya')}
      />
    )}
  </div>
</div>*/}

<SmartwatchWidget
  profileId={GameStateManager.getActiveProfile()?.id}
  onAppClick={(app) => {
    setCurrentPracticeWord(app.id);
    setShowAudioPractice(true);
  }}
/>

{/* Boy Character - appears after game completion */}
{(showGaneshaBlessing || showChoiceButtons) && (
  <div style={{
    position: 'absolute',
    right: '15%',
    bottom: '20%',
    zIndex: 15
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


{/* Enhanced Ganesha Blessing - No Overlay */}
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
              {powerConfig[currentPracticeWord]?.icon || '✨'}
            </div>
          ))}
        </div>
      )}
    </div>

{/* Only show speech bubble during specific phases */}
{(blessingPhase === 'welcome' || blessingPhase === 'blessing' || blessingPhase === 'transfer') && (
  <div className={`ganesha-speech-bubble ${blessingPhase}`}>
    <div className="speech-bubble-content">
      {/* Your existing content from lines 1140-1167 stays the same */}
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



    {/* Only show buttons if still in initial phase */}
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

{/* Rescue Mission - Full Updated Block */}
{showRescueMission && (
  <>
    {/* Scene Darkening Effect */}
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.2)',
      backdropFilter: 'blur(1px)',
      zIndex: 5,
      pointerEvents: 'none'
    }} />
    
    {/* Animal Image Content */}
    <div style={{
      position: 'absolute',
      top: '45%',
      left: '40%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      textAlign: 'center'
    }}>
      
      {rescuePhase === 'problem' && (
        <div style={{ position: 'relative' }}>
          <img 
            src={currentRescueWord === 'vakratunda' ? vakratundaBefore : mahakayaBefore}
            alt="Animal in trouble"
            style={{
              width: '450px',
              height: '320px',
              objectFit: 'contain',
              borderRadius: '20px',
              border: '4px solid #FFD700',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
            }}
          />
          
          {/* Speech Bubble from Animal */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'white',
            borderRadius: '20px',
            padding: '10px 15px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxWidth: '200px'
          }}>
            <div style={{ fontSize: '14px', color: '#8B4513' }}>
              {currentRescueWord === 'vakratunda' 
                ? "Help! I want to eat that fruit!" 
                : "I'm so frightened, please help me!"
              }
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '20px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white'
            }} />
          </div>
        </div>
      )}

      {rescuePhase === 'action' && (
        <div style={{ position: 'relative' }}>
          <img 
            src={currentRescueWord === 'vakratunda' ? vakratundaBefore : mahakayaBefore}
            alt="Using power to help"
            style={{
              width: '400px',
              height: '280px',
              objectFit: 'contain',
              borderRadius: '15px',
              filter: 'brightness(1.2) drop-shadow(0 8px 25px rgba(0,0,0,0.3))'
            }}
          />
          
          {/* Child's Speech Bubble */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            background: '#FFD700',
            borderRadius: '20px',
            padding: '10px 15px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxWidth: '180px'
          }}>
            <div style={{ fontSize: '10px', color: '#8B4513', fontWeight: 'bold' }}>
              {currentRescueWord === 'vakratunda' 
                ? "My flexibility is flowing to you!" 
                : "Feel my inner strength!"
              }
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '20px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #FFD700'
            }} />
          </div>
          
          {/* Power Animation */}
          <HelperSignatureAnimation
            helperId={currentRescueWord === 'vakratunda' ? 'snuggyshawl' : 'hammerhero'}
            fromPosition={{ x: 80, y: 80 }}
            toPosition={{ x: 20, y: 30 }}
            onAnimationComplete={() => {
              setTimeout(() => {
                setRescuePhase('success');
              }, 1000);
            }}
          />
        </div>
      )}

      {rescuePhase === 'success' && (
        <div style={{ 
          position: 'relative', 
          zIndex: 40,
          pointerEvents: 'auto'
        }}>
          <img 
            src={currentRescueWord === 'vakratunda' ? vakratundaAfter : mahakayaAfter}
            alt="Happy rescued animal"
            style={{
              width: '400px',
              height: '280px',
              objectFit: 'contain',
              borderRadius: '15px',
              animation: 'rescueBounce 0.8s ease-in-out infinite',
              filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.3))'
            }}
          />
          
          {/* Happy Animal Speech Bubble */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#90EE90',
            borderRadius: '20px',
            padding: '10px 15px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxWidth: '200px'
          }}>
            <div style={{ fontSize: '14px', color: '#2F4F2F' }}>
              {currentRescueWord === 'vakratunda' 
                ? "Thank you! I feel so brave now!" 
                : "Your strength helped me feel safe!"
              }
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '20px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #90EE90'
            }} />
          </div>
          
          <button 
            style={{
              background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 100,
              position: 'relative',
              pointerEvents: 'auto'
            }}
            onClick={handleRescueComplete}
          >
            {currentRescueWord === 'vakratunda' 
              ? 'Amazing! Continue Learning'
              : 'Awesome! End Scene'
            }
          </button>
        </div>
      )}
    </div>

    {/* Boy Character - Separate Positioning */}
    <div style={{
      position: 'absolute',
      right: '15%',
      bottom: '25%',
      zIndex: 18,
      transform: 'scale(1.2)',
      transition: 'transform 0.4s ease'
    }}>
      <img 
        src={boyNamaste}
        alt="Boy character"
        style={{ 
          width: '110px',
          height: 'auto'
        }}
      />
    </div>

    {/* Smartwatch - Separate Positioning */}
    <div style={{
      position: 'absolute',
      left: '68%',
      bottom: '20%',
      zIndex: 40,
      transform: 'scale(1.5)',
      transition: 'transform 0.4s ease',
      pointerEvents: 'auto'
    }}>
      <img 
        src={smartwatchBase}
        alt="Smartwatch"
        style={{
          width: '120px',
          height: '120px',
          cursor: 'pointer',
          filter: rescuePhase === 'problem' ? 'drop-shadow(0 0 20px #FFD700)' : 'none',
          pointerEvents: 'auto'
        }}
      />
      <img 
        src={smartwatchScreen}
        alt="Screen"
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          width: '90px',
          height: '90px',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={currentRescueWord === 'vakratunda' ? appVakratunda : appMahakaya}
        alt="Power App"
        onClick={(e) => {
          e.stopPropagation();
          console.log('App clicked!', rescuePhase);
          if (rescuePhase === 'problem') {
            handleRescueAction();
          }
        }}
        style={{
          position: 'absolute',
          top: '35px',
          left: '35px',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          animation: rescuePhase === 'problem' ? 'appPulse 1.5s ease-in-out infinite' : 'none',
          filter: rescuePhase === 'problem' ? 'drop-shadow(0 0 15px gold) brightness(1.4)' : 'none',
          pointerEvents: 'auto',
          zIndex: 25
        }}
      />
      
      {/* Instruction Bubble */}
      {rescuePhase === 'problem' && (
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-30px',
          background: '#FFD700',
          borderRadius: '15px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#8B4513',
          boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
          animation: 'instructionBounce 2s ease-in-out infinite',
          whiteSpace: 'nowrap'
        }}>
          Tap your {powerConfig[currentRescueWord]?.name} app!
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '30px',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #FFD700'
          }} />
        </div>
      )}
    </div>
  </>
)}

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
        🔊 {currentPracticeWord.toUpperCase()}
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
      {currentPracticeWord === 'mahakaya' ? '✨ End Scene' : '➡️ Continue Learning'}
    </button>
  </div>
)}

{blessingPhase === 'recording' && (
  <>
    <div className="speech-text">You have learned the sacred word "vakratunda"!</div>
    <div className="speech-subtext">Would you like to chant it to receive your power?</div>
  </>
)}

{/* Test Buttons */}
<div className="test-buttons">
  <button className="test-btn" onClick={() => {
    setShowGaneshaBlessing(true);
    setCurrentPracticeWord('vakratunda');
  }}>
    Test Ganesha 1
  </button>
  
  <button className="test-btn" onClick={() => {
    setShowGaneshaBlessing(true);
    setCurrentPracticeWord('mahakaya');
  }}>
    Test Ganesha 2
  </button>
  
  <button className="test-btn" onClick={() => {
    setUnlockedApps(['vakratunda']);
    setShowChoiceButtons(true);
  }}>
    Test Choice 1
  </button>
  
  <button className="test-btn" onClick={() => {
    setUnlockedApps(['vakratunda', 'mahakaya']);
    setShowChoiceButtons(true);
  }}>
    Test Choice 2
  </button>
</div>

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
          
  {/* Final Fireworks */}
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
        console.log('✅ Game state saved successfully');
      } catch (saveError) {
        console.warn('⚠️ Error saving game state:', saveError);
        // Continue anyway
      }

      try {
        localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
        SimpleSceneManager.clearCurrentScene();
        console.log('✅ Temp session cleared');
      } catch (clearError) {
        console.warn('⚠️ Error clearing session:', clearError);
        // Continue anyway
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
    console.error('❌ Error in fireworks completion:', error);
    // Force show completion screen anyway
    setShowSceneCompletion(true);
  }
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
  nextSceneName="Firefly Garden"
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
      // Clear ALL storage
      localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
      localStorage.removeItem(`replay_session_${profileId}_shloka-river_vakratunda-grove`);
      localStorage.removeItem(`play_again_${profileId}_shloka-river_vakratunda-grove`);
      
      SimpleSceneManager.setCurrentScene('shloka-river', 'vakratunda-grove', false, false);
      console.log('NUCLEAR: All storage cleared');
    }
    
    // Force clean reload
    console.log('NUCLEAR: Forcing reload in 100ms');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }}
  onContinue={() => {
    console.log('SANSKRIT CONTINUE: Going to next scene + preserving resume');
    
    // Enhanced GameCoach clearing
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
      console.log('SANSKRIT CONTINUE: GameCoach manual tracking cleared');
    }
    if (hideCoach) {
      hideCoach();
      console.log('SANSKRIT CONTINUE: GameCoach hidden');
    }
    
    // Enhanced GameCoach timeout
    setTimeout(() => {
      console.log('SANSKRIT CONTINUE: Forcing GameCoach fresh start for next scene');
      if (clearManualCloseTracking) {
        clearManualCloseTracking();
      }
    }, 500);
    
    // Save completion data
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

    // Set NEXT scene for resume tracking
    setTimeout(() => {
      SimpleSceneManager.setCurrentScene('shloka-river', 'firefly-garden', false, false);
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

          {/* Sanskrit Scene Test Buttons */}
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
  console.log('Sanskrit completion test clicked');
  
  // Set all syllables and words as learned
  sceneActions.updateState({
    // All syllables learned
    learnedSyllables: {
      va: true, kra: true, tun: true, da: true,
      ma: true, ha: true, ka: true, ya: true
    },
    
    // Both words learned
    learnedWords: {
      vakratunda: true,
      mahakaya: true
    },
    
    // Set to final phase
    phase: PHASES.SCENE_COMPLETE,
    
    // Completion data
    completed: true,
    stars: 5,
    progress: {
      percentage: 100,
      starsEarned: 5,
      completed: true
    },
    
    // Clear any active states
    currentPopup: null,
    gameCoachState: null,
    isReloadingGameCoach: false
  });
  
  // Clear all UI states
  setShowSparkle(null);
  setShowRecording(false);
  setShowSceneCompletion(false);
  
  // Trigger final fireworks
  setTimeout(() => {
    setShowSparkle('final-fireworks');
  }, 1000);
}}>
  COMPLETE SANSKRIT
</div>

{/* Emergency Reset Button */}
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
  if (confirm('Start this Sanskrit scene from the beginning? You will lose current progress.')) {
    console.log('Sanskrit emergency restart: User chose to start fresh');
    
    // Clear all UI states immediately
    setShowSparkle(null);
    setShowRecording(false);
    setShowSceneCompletion(false);
    setCurrentRecordingWord('');
    setShowAudioTracker(true);
    
    // Reset scene state
    setTimeout(() => {
      sceneActions.updateState({
        // Reset learning progress
        learnedSyllables: {},
        learnedWords: {},
        
        // Reset memory game state
        memoryGameState: null,
        
        // Reset phases
        phase: PHASES.INITIAL,
        
        // Clear all message flags
        welcomeShown: false,
        vakratundaWisdomShown: false,
        mahakayaWisdomShown: false,
        
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
    }, 100);
    
    // Hide GameCoach if active
    if (hideCoach) hideCoach();
    if (clearManualCloseTracking) clearManualCloseTracking();
  }
}}>
  Start Fresh
</div>


{/*<button 
  style={{
    position: 'fixed', 
    top: '200px', 
    right: '20px', 
    zIndex: 9999,
    background: 'purple',
    color: 'white',
    padding: '10px',
    borderRadius: '5px'
  }}
  onClick={() => {
    console.log('Manual test: showing centered app');
    setShowCenteredApp('vakratunda');
    setTimeout(() => {
      console.log('Manual test: hiding centered app');
      setShowCenteredApp(null);
    }, 5000);
  }}
>
  Test Centered App
</button>*/}
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

<style>{`
  .rescue-mission-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .rescue-mission-modal {
    background: linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 100%);
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .rescue-title {
    font-size: 24px;
    font-weight: bold;
    color: #8B4513;
    margin-bottom: 20px;
  }

  .rescue-image {
    width: 200px;
    height: 150px;
    object-fit: contain;
    border-radius: 15px;
    margin: 20px 0;
  }

  .rescue-image.glowing {
    animation: rescueGlow 2s ease-in-out infinite alternate;
  }

  .rescue-image.celebrating {
    animation: rescueBounce 1s ease-in-out infinite;
  }

  @keyframes rescueGlow {
    0% { filter: brightness(1) drop-shadow(0 0 10px gold); }
    100% { filter: brightness(1.3) drop-shadow(0 0 30px gold); }
  }

  @keyframes rescueBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .rescue-action-btn, .rescue-complete-btn {
    background: linear-gradient(45deg, #4ECDC4, #44A08D);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
  }


  @keyframes appPulse {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px gold); }
    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px gold); }
  }

  @keyframes rescueGlow {
    0% { transform: scale(1); filter: brightness(1); }
    100% { transform: scale(1.1); filter: brightness(1.3); }
  }

  @keyframes rescueBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  
`}</style>

export default VakratundaGrove;