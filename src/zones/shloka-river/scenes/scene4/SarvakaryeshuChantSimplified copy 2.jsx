// zones/shloka-river/scenes/Scene5/SarvakaryeshuChant.jsx - Scene 5 with Divine Games (REFRACTORED to use individual game components)
import React, { useState, useEffect, useRef } from 'react';
import './SarvakaryeshuChantSimplified.css';

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

// ⭐ NEW: Import the individual game components
import SarvakaryeshuGame from './SarvakaryeshuGame';
import SarvadaGame from './SarvadaGame';

import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';
import SanskritWordMission from '../../shared/SanskritWordMission';


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
import ganeshaHeadphones from '../assets/images/ganesha_with_headphones.png';
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

// Updated PHASES constant for separate game approach
const PHASES = {
  INITIAL: 'initial',
  SARVAKARYESHU_GAME_ACTIVE: 'sarvakaryeshu_game_active',
  SARVAKARYESHU_COMPLETE: 'sarvakaryeshu_complete',
  SARVAKARYESHU_POWER: 'sarvakaryeshu_power',  
  SARVADA_STORY: 'sarvada_story',
  SARVADA_GAME_ACTIVE: 'sarvada_game_active',
  SARVADA_COMPLETE: 'sarvada_complete',
  SARVADA_POWER: 'sarvada_power',  
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
            sarvada_sar: false, sarvada_va: false, da: false // Sarvada (Using distinct keys for Sarvada's shared syllables)
          },
          learnedWords: {
            sarvakaryeshu: false,
            sarvada: false
          },

          unlockedApps: {},
          
          // ⭐ NEW: Mode selection state
          sarvakaryeshuMode: null,      // 'auto' or 'manual'
          sarvadaMode: null,            // 'auto' or 'manual'

          // ⭐ NEW: Individual game states
          sarvakaryeshuGameState: null,
          sarvadaGameState: null,
          
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
  console.log('🎨 SarvakaryeshuChantContent render', { 
    phase: sceneState?.phase, 
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

  // ⭐ NEW: Mode selection state
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [modeForPhase, setModeForPhase] = useState(null); // 'sarvakaryeshu' or 'sarvada'
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
  // removed unused local variable 'previousVisibilityRef'

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

  const [showCenteredWord, setShowCenteredWord] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);

  const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); 
  const [rescuePhase, setRescuePhase] = useState('problem');

// Power configuration
const powerConfig = {
  sarvakaryeshu: { 
    name: 'Divine Action', 
    image: appSarvakaryeshu,
    color: '#FFD700',
    affirmation: 'I act with purpose',
    description: 'Divine blessings in all actions!'
  },
  sarvada: { 
    name: 'Eternal Blessing', 
    image: appSarvada,
    color: '#4B0082',
    affirmation: 'I am eternal',
    description: 'Forever blessed!'
  }
};

// Mission images mapping
const missionImages = {
  sarvakaryeshu: { before: sarvakaryeshuBefore, after: sarvakaryeshuAfter },
  sarvada: { before: sarvadaBefore, after: sarvadaAfter }
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

const playSyllable = (syllable) => {
  const map = {
    // Sarvakaryeshu syllables (4 syllables)
    'sar': 'sarvakaryeshu-sar',
    'va': 'sarvakaryeshu-va', 
    'kar': 'sarvakaryeshu-kar',
    'yeshu': 'sarvakaryeshu-yeshu',
    
    // Sarvada syllables (3 syllables) - Mapped to simpler file names
    'sarvada_sar': 'sarvada-sar', 
    'sarvada_va': 'sarvada-va',   
    'da': 'sarvada-da'
  };
  playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
};

const playWord = (word) => {
  playAudio(`/audio/words/${word}.mp3`);
};

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    window.playSanskritAudio = playSyllable;
    window.playSanskritWord = playWord;
    
    return () => {
      delete window.playSanskritAudio;
      delete window.playSanskritWord;
    };
  }, [isAudioOn]); 
  

  // Load audio preference on component mount
  useEffect(() => {
    const savedAudioPreference = localStorage.getItem('sanskritGameAudio');
    if (savedAudioPreference !== null) {
      setIsAudioOn(savedAudioPreference === 'true');
    }
  }, []);

// ⭐ REFACTORED STATE SAVING: Use separate keys
const handleSaveComponentState = (componentType, componentState) => {
  console.log(`💾 Saving ${componentType} state:`, componentState);
  
  if (handleSaveComponentState.lastCall && 
      Date.now() - handleSaveComponentState.lastCall < 100) {
    console.log('🚫 Debounced duplicate save call');
    return;
  }
  handleSaveComponentState.lastCall = Date.now();
  
 const updatedState = {
  ...(componentType === 'sarvakaryeshuGame' && { 
    sarvakaryeshuGameState: componentState,
    // ⭐ FIX: Update mode if it changed
    ...(componentState.savedGameMode && { sarvakaryeshuMode: componentState.savedGameMode })
  }),
  ...(componentType === 'sarvadaGame' && { 
    sarvadaGameState: componentState,
    // ⭐ FIX: Update mode if it changed
    ...(componentState.savedGameMode && { sarvadaMode: componentState.savedGameMode })
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

// Asset Getters for Sarvakaryeshu (Game 7)
const getSarvakaryeshuSadAnimalImage = (index) => {
    const images = [sarSquirrelSad, vaBirdSad, karDuckSad, yeshuRabbitSad];
    return images[index];
};
const getSarvakaryeshuHappyAnimalImage = (index) => {
    const images = [sarSquirrelHappy, vaBirdHappy, karDuckHappy, yeshuRabbitHappy];
    return images[index];
};
const getSarvakaryeshuHelperImage = (index) => {
    const images = [sarSquirrelHelper, vaBirdHelper, karDuckHelper, yeshuRabbitHelper];
    return images[index];
};

// Asset Getters for Sarvada (Game 8)
const getSarvadaSadAnimalImage = (index) => {
    const images = [savButterflySad, vaFawnSad, daHedgehogSad];
    return images[index];
};
const getSarvadaHappyAnimalImage = (index) => {
    const images = [savButterflyHappy, vaFawnHappy, daHedgehogHappy];
    return images[index];
};
const getSarvadaHelperImage = (index) => {
    const images = [savButterflyHelper, vaFawnHelper, daHedgehogHelper];
    return images[index];
};


const handleSaveAnimal = () => {
  setShowPowerModal(false);
  setShowMission(true);
};

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentWord === 'sarvakaryeshu') {
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.SARVADA_STORY });
      setShowSarvadaStory(true);
    }, 500);
  } else {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
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
  
  if (currentWord === 'sarvakaryeshu') {
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.SARVADA_STORY });
      setShowSarvadaStory(true);
    }, 500);
  } else {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    setShowSparkle('final-fireworks');
  }
};

// ⭐ REFACTORED handlePhaseComplete
const handlePhaseComplete = (word) => {
  console.log(`${word} learned!`);
  
  const syllableUpdates = word === 'sarvakaryeshu' 
    ? { sar: true, va: true, kar: true, yeshu: true }
    : { sarvada_sar: true, sarvada_va: true, da: true }; // Use specific keys for Sarvada

  sceneActions.updateState({
    learnedWords: { ...sceneState.learnedWords, [word]: true },
    learnedSyllables: {
      ...sceneState.learnedSyllables,
      ...syllableUpdates
    },
    phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_COMPLETE : PHASES.SARVADA_COMPLETE
  });

  // Step 1: Show 5-second celebration
  setShowCenteredWord(word);
  setShowSparkle(`${word}-celebration`);
  playAudio(`/audio/words/${word}.mp3`);
  
  safeSetTimeout(() => {
    // Step 2: Hide centered, fly to sidebar
    setShowCenteredWord(null);
    setShowSparkle(`${word}-to-sidebar`);
    
    sceneActions.updateState({
      unlockedApps: { ...sceneState.unlockedApps, [word]: true }
    });
    
    safeSetTimeout(() => {
      // Step 3: Show power modal IMMEDIATELY
      setShowSparkle(null);
      setCurrentWord(word);
      setShowPowerModal(true);
      sceneActions.updateState({
        phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_POWER : PHASES.SARVADA_POWER
      });
    }, 2000);
  }, 5000);
};

// ⭐ ADDED: Missing hint system functions
const handleHintShown = (level) => {
    console.log(`Divine hint level ${level} shown`);
    setHintUsed(true);
};

const handleHintButtonClick = () => {
    console.log("Divine hint button clicked");
};

const getCurrentBackground = () => {
  // ⭐ NEW: Check which game is currently being played
  const isPlayingSarvakaryeshu = sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE ||
                                 modeForPhase === 'sarvakaryeshu';
  
  const isPlayingSarvada = sceneState.phase === PHASES.SARVADA_GAME_ACTIVE ||
                           sceneState.phase === PHASES.SARVADA_STORY ||
                           sceneState.phase === PHASES.SARVADA_COMPLETE ||
                           sceneState.phase === PHASES.SARVADA_POWER ||
                           modeForPhase === 'sarvada';
  
  // ⭐ Priority: If actively playing Sarvakaryeshu, use its background
  if (isPlayingSarvakaryeshu) {
    return sarvakaryeshuBg;
  }
  
  // ⭐ Otherwise check if should use Sarvada background
  const shouldUseSarvadaBg = isPlayingSarvada ||
                            sarvakaryeshuPowerGained || 
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
        const gameActive = sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE ? sceneState.sarvakaryeshuGameState : sceneState.sarvadaGameState;
        return gameActive?.gamePhase === 'playing';
      }
    },
    {
      id: 'animal-clicking-hint', 
      message: 'Click the animals to activate divine decorations!',
      explicitMessage: 'Click the animals in the order you heard: sar-va-kar-yeshu! (or sar-va-da!)',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        const gameActive = sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE ? sceneState.sarvakaryeshuGameState : sceneState.sarvadaGameState;
        return gameActive?.gamePhase === 'listening';
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

// ⭐ RELOAD LOGIC: Update to handle individual game states
useEffect(() => {
  if (!isReload || !sceneState) return;
  
  // Check for Play Again flag
  const profileId = localStorage.getItem('activeProfileId');
  const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
  const playAgainRequested = localStorage.getItem(playAgainKey);
  
  if (playAgainRequested === 'true') {
    // Already handled in resetScene, ensures clean component re-render
    return; 
  }

  // Set power gained state for correct background display
  if (sceneState.learnedWords?.sarvakaryeshu === true) {
    setSarvakaryeshuPowerGained(true);
  }

  // Resume UI based on saved phase
  switch (sceneState.phase) {
    case PHASES.SARVAKARYESHU_POWER:
      // If we land here, the word is learned, but the modal may have been dismissed
      setCurrentWord('sarvakaryeshu');
      setShowPowerModal(true);
      break;

    case PHASES.SARVADA_GAME_ACTIVE:
      // If we jump straight to game 2, ensure transition state is set
      setSarvakaryeshuPowerGained(true);
      break;
      
    case PHASES.SARVADA_POWER:
      setCurrentWord('sarvada');
      setShowPowerModal(true);
      break;

    case PHASES.SCENE_COMPLETE:
      setShowSparkle('final-fireworks');
      break;
      
    default:
      // For game active states, the individual game components handle their own reload via savedGameState
      break;
  }
}, [isReload]);

  // Auto-start mode selection after welcome
  useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown && !modeSelected) {
      console.log('Starting Sarvakaryeshu mode selection');
      setModeForPhase('sarvakaryeshu');
      setShowModeSelection(true);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, modeSelected]);

  // Progress counter for syllables
  const renderProgressCounter = () => {
    // Sarvakaryeshu (4) + Sarvada (3) = 7 syllables
    const totalSyllables = 7; 
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;

    return (
      <div className="syllable-counter">
        <div className="counter-icon">✨</div>
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

            {/* Opening Mission Modal */}
{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <div className="sarvakaryeshu-mission-modal-overlay">  
    <div className="sarvakaryeshu-mission-modal"> 
      <div className="sarvakaryeshu-modal-character"> 
        <img src={ganeshaHeadphones} alt="Ganesha" className="sarvakaryeshu-character-img" />
        <div className="sarvakaryeshu-character-speech-bubble"> 
          Let's create divine decorations! ✨
        </div>
      </div>
      
      <h2 className="sarvakaryeshu-mission-title">Help Ganesha Bless All Actions!</h2>
      <div className="sarvakaryeshu-mission-subtitle">2 divine words to master!</div>
      <p className="sarvakaryeshu-mission-description">
        First, learn to chant <strong>SARVAKARYESHU</strong> to unlock divine action power and save animals!
      </p>
      <button 
        className="sarvakaryeshu-mission-start-btn"
        onClick={() => {
          console.log('🎮 Opening mode selection for SARVAKARYESHU');
          sceneActions.updateState({ welcomeShown: true });
          setModeForPhase('sarvakaryeshu');
          setShowModeSelection(true);
          setModeSelected(false);
        }}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}

{/* Sarvada Story Modal */}
{showSarvadaStory && (
  <div className="sarvakaryeshu-story-modal-overlay"> 
    <div className="sarvakaryeshu-story-modal"> 
      <div className="sarvakaryeshu-modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="sarvakaryeshu-character-img" />
        <div className="sarvakaryeshu-character-speech-bubble">
          One more divine word! 💪
        </div>
      </div>
      
      <h2 className="sarvakaryeshu-story-title">Great Work!</h2>
      <div className="sarvakaryeshu-story-subtitle">Now unlock eternal blessing!</div>
      <p className="sarvakaryeshu-story-description">
        Learn to chant <strong>SARVADA</strong> to unlock eternal blessing power and save animals!
      </p>
 <button
        className="sarvakaryeshu-story-continue-btn"
        onClick={() => {
          console.log('🎮 Opening mode selection for SARVADA');
          setSarvakaryeshuPowerGained(true);
          setIsTransitioning(true);
          setShowSarvadaStory(false);
          setModeForPhase('sarvada');
          setShowModeSelection(true);
          setModeSelected(false);

          setTimeout(() => setIsTransitioning(false), 500);
        }}
      >
        Start Learning
      </button>
    </div>
  </div>
)}


{/* ⭐ MODE SELECTION MODAL - Shows BEFORE game starts */}
{showModeSelection && !modeSelected && (
  <div className="sarvakaryeshu-mission-modal-overlay">
    <div className="sarvakaryeshu-mission-modal">
      <h2 className="sarvakaryeshu-mission-title">🎮 How do you want to play?</h2>
      <p className="sarvakaryeshu-mission-description">
        Choose your learning style for <strong>{modeForPhase?.toUpperCase()}</strong>
      </p>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {/* AUTO PLAY BUTTON */}
        <button
              className="sarvakaryeshu-mission-start-btn"
          style={{
            flex: '1',
            minWidth: '200px',
            maxWidth: '300px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
          }}
          onClick={() => {
            console.log(`🎮 Mode selected: AUTO for ${modeForPhase}`);
            setModeSelected(true);
            setShowModeSelection(false);

            // ⭐ Single state update: mode + phase
            const modeKey = `${modeForPhase}Mode`;
            const phaseKey = modeForPhase === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_GAME_ACTIVE : PHASES.SARVADA_GAME_ACTIVE;
            sceneActions.updateState({
              [modeKey]: 'auto',
              phase: phaseKey
            });
          }}
        >
          <div>▶️ Auto Play</div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
            Start from Round 1 and learn step by step
          </div>
        </button>

        {/* MANUAL BUTTON */}
        <button
                 className="sarvakaryeshu-mission-start-btn"
          style={{
            flex: '1',
            minWidth: '200px',
            maxWidth: '300px',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
          }}
          onClick={() => {
            console.log(`🎮 Mode selected: MANUAL for ${modeForPhase}`);
            setModeSelected(true);
            setShowModeSelection(false);

            // ⭐ Single state update: mode + phase
            const modeKey = `${modeForPhase}Mode`;
            const phaseKey = modeForPhase === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_GAME_ACTIVE : PHASES.SARVADA_GAME_ACTIVE;
            sceneActions.updateState({
              [modeKey]: 'manual',
              phase: phaseKey
            });
          }}
        >
          <div>🎯 Choose a Round</div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
            Pick any round you want to practice
          </div>
        </button>
      </div>
    </div>
  </div>
)}


{/* ⭐ SARVAKARYESHU GAME (Game 7) */}
<SarvakaryeshuGame
  isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE}
  hideElements={isTransitioning || showGaneshaBlessing || sceneState.phase === PHASES.SARVAKARYESHU_COMPLETE}
  selectedMode={sceneState.sarvakaryeshuMode}
  skipModeSelection={true} 
  isAudioOn={isAudioOn} // ⭐ ADDED
  
  // Assets
  getSarvakaryeshuSadAnimalImage={getSarvakaryeshuSadAnimalImage}
  getSarvakaryeshuHappyAnimalImage={getSarvakaryeshuHappyAnimalImage}
  getSarvakaryeshuHelperImage={getSarvakaryeshuHelperImage}
  
  // Scene integration
  onPhaseComplete={() => handlePhaseComplete('sarvakaryeshu')}
  // onGameComplete={() => handleGameComplete('sarvakaryeshu')} // Not needed as phase complete does the job
  profileName={profileName}
  
  // Reload support
  isReload={isReload}
  savedGameState={sceneState.sarvakaryeshuGameState}
  onSaveGameState={(gameState) => handleSaveComponentState('sarvakaryeshuGame', gameState)}
/>

{/* ⭐ SARVADA GAME (Game 8) */}
<SarvadaGame
  isActive={sceneState.phase === PHASES.SARVADA_GAME_ACTIVE}
  hideElements={isTransitioning || showGaneshaBlessing || sceneState.phase === PHASES.SARVADA_COMPLETE}
  selectedMode={sceneState.sarvadaMode}
  skipModeSelection={true} 
  isAudioOn={isAudioOn} // ⭐ ADDED
  
  // Assets
  getSarvadaSadAnimalImage={getSarvadaSadAnimalImage}
  getSarvadaHappyAnimalImage={getSarvadaHappyAnimalImage}
  getSarvadaHelperImage={getSarvadaHelperImage}
  
  // Scene integration
  onPhaseComplete={() => handlePhaseComplete('sarvada')}
  // onGameComplete={() => handleGameComplete('sarvada')} // Not needed as phase complete does the job
  profileName={profileName}
  
  // Reload support
  isReload={isReload}
  savedGameState={sceneState.sarvadaGameState}
  onSaveGameState={(gameState) => handleSaveComponentState('sarvadaGame', gameState)}
/>


         

<AppSidebar 
  unlockedApps={{
    vakratunda: true,      // From Scene 1
    mahakaya: true,        // From Scene 1
    suryakoti: true,       // From Scene 2
    samaprabha: true,      // From Scene 2
    nirvighnam: true,      // From Scene 3 (Assuming this data comes from global state)
    kurumedeva: true,      // From Scene 3 (Assuming this data comes from global state)
    ...(sceneState.unlockedApps || {})  // sarvakaryeshu, sarvada
  }}
  onAppClick={(app) => {
    setCurrentPracticeWord(app.id);
    // setShowAudioPractice(true); // Assuming this opens a separate modal for practice
  }}
  isReload={isReload}
  onSaveAppState={(appState) => {
    sceneActions.updateState({ unlockedApps: appState });
  }}
/>

{/* ✅ ADD: 5-SECOND WORD CELEBRATION */}
{showCenteredWord && (
  <>
    <div className="sarvakaryeshu-celebration-overlay" />
    <div className="sarvakaryeshu-centered-word-celebration">
      <img 
        src={powerConfig[showCenteredWord]?.image}
        alt={showCenteredWord}
        className="sarvakaryeshu-celebration-app-icon"
      />
      <div className="sarvakaryeshu-celebration-word-text">
        {showCenteredWord.toUpperCase()}
      </div>
      <div className="sarvakaryeshu-celebration-sparkles">
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

{/* ✅ ADD: POWER MODAL */}
{showPowerModal && (
  <div className="sarvakaryeshu-power-modal-overlay">
    <div className="sarvakaryeshu-power-modal">
      <div className="sarvakaryeshu-power-affirmation-row">
        <img 
          src={powerConfig[currentWord]?.image}
          alt={currentWord}
          className="sarvakaryeshu-affirmation-icon"
        />
        <div className="sarvakaryeshu-affirmation-content">
          <div className="sarvakaryeshu-affirmation-text">"{powerConfig[currentWord]?.affirmation}"</div>
          <div className="sarvakaryeshu-affirmation-description">{powerConfig[currentWord]?.description}</div>
        </div>
      </div>
      
      <div className="sarvakaryeshu-power-modal-content">
        <div className="sarvakaryeshu-power-modal-left">
          <p className="sarvakaryeshu-power-modal-text">
            You can now use this power to help divine animals!
          </p>
          <p className="sarvakaryeshu-power-modal-subtext">Choose your next action:</p>
        </div>
        
     <div className="sarvakaryeshu-power-modal-right">
  
  {/* ⭐ NEW: Play Again button */}
  <button 
    className="sarvakaryeshu-power-modal-btn sarvakaryeshu-play-again-btn" 
    onClick={() => {
      console.log(`🔄 Play Again: Restarting ${currentWord} game`);
      setShowPowerModal(false);
      
      // Reset to game phase for the current word
      if (currentWord === 'sarvakaryeshu') {
        setModeForPhase('sarvakaryeshu');
        setShowModeSelection(true);
        setModeSelected(false);
      } else if (currentWord === 'sarvada') {
        setModeForPhase('sarvada');
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

  <button className="sarvakaryeshu-power-modal-btn sarvakaryeshu-save-btn" onClick={handleSaveAnimal}>
    😇 Save a Divine Animal
  </button>
          
          <button className="sarvakaryeshu-power-modal-btn sarvakaryeshu-continue-btn" onClick={handleContinueLearning}>
            {currentWord === 'sarvakaryeshu' ? '🎵 Discover Sarvada' : '✨ End Scene'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ✅ REPLACE SaveAnimalMission with SanskritWordMission */}
<SanskritWordMission
  show={showMission}
  word={currentWord}
  beforeImage={missionImages[currentWord]?.before}
  afterImage={missionImages[currentWord]?.after}
  powerConfig={powerConfig[currentWord]}
    isFinalWordInScene={currentWord === 'sarvada'}  // ⭐ ADD THIS LINE
  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
  }}
/>
          
            {/* Progressive Hints System 
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
        
                      {/* Final Fireworks */}
                      {showSparkle === 'final-fireworks' && (
                        <Fireworks
                          show={true}
                          duration={8000}
                          count={25}
                          colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                          onComplete={() => {
                            console.log('🎯 sarvakaryeshu-chant fireworks complete');
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
                              console.log('✅ sarvakaryeshu chant: Completion saved and temp session cleared');
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
  console.log('🔀 INSTANT REPLAY: Garden Adventure restart');
  // ⭐ The resetScene must be fixed to be safe with individual game states (omitted here for brevity)
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
  console.log('🧪 TESTING: Universal completion clicked');
  
  // Automatically complete all syllables and words in any scene
  const allSyllables = Object.keys(sceneState?.learnedSyllables || {});
  const allWords = Object.keys(sceneState?.learnedWords || {});
  
  const completedSyllables = {};
  const completedWords = {};
  
  allSyllables.forEach(syl => completedSyllables[syl] = true);
  allWords.forEach(word => completedWords[word] = true);
  
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
                          onStartFresh={() => {
                                      // ⭐ The resetScene must be fixed to be safe with individual game states (omitted here for brevity)
                          }}  // Add this if TocaBoca has reset option

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
            console.log('🧪 TESTING: Skip to Sarvada Game clicked');
            
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
                sarvada_sar: false, sarvada_va: false, da: false // Sarvada not learned yet
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
            
            console.log('✅ State set for Sarvada game - should start immediately');
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
                 sarvakaryeshuGameState: null, // ⭐ UPDATED
                 sarvadaGameState: null, // ⭐ UPDATED
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