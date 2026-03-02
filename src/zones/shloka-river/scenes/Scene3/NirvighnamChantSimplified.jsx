// zones/shloka-river/scenes/Scene3/NirvighnamChant.jsx - Scene 3 with Stone/Decoration mechanics
import React, { useState, useEffect, useRef } from 'react';
import './NirvighnamChantSimplified.css';
// ... existing imports
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import OpeningModal from '../../../shared/components/OpeningModal';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Import the thin wrapper game components
import NirvighnamGame from './NirvighnamGame';
import KurumeDevaGame from './KurumeDevaGame';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder.jsx';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SanskritWordMission from '../../shared/SanskritWordMission';



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

// Kurumedeva game assets - Animals, Items, Decorations (4 syllables: kuru, me, de, va)
import animal1Ku from './assets/images/Kurumedeva/animal1-ku.png';
import animal2Ru from './assets/images/Kurumedeva/animal2-ru.png';
import animal3Me from './assets/images/Kurumedeva/animal3-me.png';
import animal4De from './assets/images/Kurumedeva/animal4-de.png';
import item1Ku from './assets/images/Kurumedeva/item1-ku.png';
import item2Ru from './assets/images/Kurumedeva/item2-ru.png';
import item3Me from './assets/images/Kurumedeva/item3-me.png';
import item4De from './assets/images/Kurumedeva/item4-de.png';
import decor1Ku from './assets/images/Kurumedeva/decor1-ku.png';
import decor2Ru from './assets/images/Kurumedeva/decor2-ru.png';
import decor3Me from './assets/images/Kurumedeva/decor3-me.png';
import decor4De from './assets/images/Kurumedeva/decor4-de.png';

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
  NIRVIGHNAM_LEARNING: 'nirvighnam_learning',     // ⭐ NEW
  KURUMEDEVA_GAME_ACTIVE: 'kurumedeva_game_active',
  KURUMEDEVA_LEARNING: 'kurumedeva_learning',     // ⭐ NEW
  COMPLETE: 'complete'
};

const powerConfig = {
  nirvighnam: { 
    name: 'Sacred Wisdom', 
    image: appNirvighnam,
    color: '#DAA520',
    affirmation: 'I am wise',
    description: 'I have ancient knowledge!'
  },
  kurumedeva: { 
    name: 'Divine Grace', 
    image: appKurumedeva,
    color: '#9370DB',
    affirmation: 'I am graceful',
    description: 'I move with divine grace!'
  }
};

const missionImages = {
    nirvighnam: { before: nirvighnamBefore, after: nirvighnamAfter },
    kurumedeva: { before: kurumedevaBefore, after: kurumedevaAfter }
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
              chantedVerses: {}, 

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

          // ⭐ Mode selection (like Scene 2)
          nirvighnamMode: null,      // 'auto' or 'manual'
          kurumedevaMode: null,      // 'auto' or 'manual'
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
console.log('🕉️ NirvighnamChantContent render', { 
  sceneState: sceneState?.phase, 
  isReload, 
  nirvighnamMode: sceneState?.nirvighnamMode,
  kurumedevaMode: sceneState?.kurumedevaMode,
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

const [showCenteredWord, setShowCenteredWord] = useState(null);
const [showPowerModal, setShowPowerModal] = useState(false);

  const [showKurumedevaStory, setShowKurumedevaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

     const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
    const [rescuePhase, setRescuePhase] = useState('problem');

      const [showMission, setShowMission] = useState(false);

  // ⭐ Mode selection state (like Scene 2)
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [modeForPhase, setModeForPhase] = useState(null); // 'nirvighnam' or 'kurumedeva'
  const [modeSelected, setModeSelected] = useState(false); // Prevent loops

  // Add with other useState hooks
const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);
  const reloadHandledRef = useRef(false);


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

    // Handle saving a new recording
const handleSaveRecording = (recordingData) => {
  setSavedRecordings(prev => {
    const wordRecordings = prev[recordingData.word] || [];
    return {
      ...prev,
      [recordingData.word]: [...wordRecordings, recordingData]
    };
  });
};

// Add this around line 200-230 (after playAudio function)

const playSyllable = (syllable) => {
  const map = {
    // Nirvighnam syllables
    'nir': 'nirvighnam-nir',
    'vigh': 'nirvighnam-vigh', 
    'nam': 'nirvighnam-nam',
    // Kurumedeva syllables
    'kuru': 'kurumedeva-kuru',
    'me': 'kurumedeva-me',
    'de': 'kurumedeva-de',
    'va': 'kurumedeva-va'
  };
  playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
};

const playWord = (word) => {
  playAudio(`/audio/words/${word}.mp3`);
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

// Safety: Show completion screen if scene is marked complete but modal not showing
useEffect(() => {
  if (sceneState.phase === PHASES.COMPLETE && 
      sceneState.completed && 
      !showSceneCompletion && 
      !showSparkle) {
    const timer = safeSetTimeout(() => {
      setShowFinalGanesha(false);
      setShowSceneCompletion(true);
    }, 7000); // 7 seconds max wait
    
    return () => clearTimeout(timer);
  }
}, [sceneState.phase, sceneState.completed, showSceneCompletion, showSparkle]);


  // Load audio preference on component mount
  useEffect(() => {
    const savedAudioPreference = localStorage.getItem('sanskritGameAudio');
    if (savedAudioPreference !== null) {
      setIsAudioOn(savedAudioPreference === 'true');
    }
  }, []);


// ==================== RELOAD LOGIC ====================

  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;
    
    console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // -----------------------------------------------------
    // ⭐ NEW: RELOAD DURING MODE SELECTION
    // -----------------------------------------------------

    // 1. First Game (Nirvighnam)
    if (sceneState.phase === PHASES.INITIAL && !sceneState.nirvighnamMode) {
      console.log('📌 Reload: Restoring Nirvighnam Mode Selection');
      setModeForPhase('nirvighnam');
      setShowModeSelection(true);
      return;
    }

    // 2. Second Game (Kurumedeva)
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME_ACTIVE && !sceneState.kurumedevaMode) {
      console.log('📌 Reload: Restoring Kurumedeva Mode Selection');
      setModeForPhase('kurumedeva');
      setShowModeSelection(true);
      return;
    }
    // -----------------------------------------------------

    // Discovery 1
    if (sceneState.phase === PHASES.NIRVIGHNAM_LEARNING) {
      setTimeout(() => setShowDiscoveryFlip1(true), 500);
      return;
    }

    // Discovery 2
    if (sceneState.phase === PHASES.KURUMEDEVA_LEARNING) {
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
  }, [isReload, sceneState.phase, sceneState.welcomeShown]);

// UNIFIED: Single state saving function (like VakratundaGrove & SuryakotiBank)
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
   ...(componentType === 'nirvighnamGame' && { nirvighnamGameState: null }),
      ...(componentType === 'kurumedevaGame' && { kurumedevaGameState: null }),
  };
  sceneActions.updateState(updatedState);
  return;
}
  
  const updatedState = {
    ...(componentType === 'nirvighnamGame' && { nirvighnamGameState: componentState }),
    ...(componentType === 'kurumedevaGame' && { kurumedevaGameState: componentState }),
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

  const getNirvighnamAnimalImage = (index) => {
  const images = [frogNir, snailVigh, turtleNam];
  return images[index];
};


  const getStoneInitialImage = (index) => {
  const images = [stone1Nir, stone2Vigh, stone3Nam];
  return images[index];
};

const getStoneRewardImage = (index) => {
  const images = [stone1NirCol, stone2VighCol, stone3NamCol];
  return images[index];
};

const getDecorInitialImage = (index) => {
  const images = [decor1Ku, decor2Ru, decor3Me];

  return images[index];
};

const getDecorRewardImage = (index) => {
  const images = [decor1Ku, decor2Ru, decor3Me]; // Same image, rendered with opacity
  return images[index];
};

const getKurumedevaAnimalImage = (index) => {
  const images = [
    animal1Ku,   // kuru
    animal3Me,   // me
    animal4De,   // de
    animal2Ru    // va
  ];
  return images[index];
};


  // Image getter functions for Nirvighnam game (stone clearing)


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

  // Image getter functions for Kurumedeva game (4 syllables: kuru, me, de, va)


  const getKurumedevaItemImage = (index, singing) => {
    const images = [item1Ku, item3Me, item4De, item2Ru];
    return images[index];
  };

  const getKurumedevaDecorImage = (index, activated) => {
    const images = [decor1Ku, decor3Me, decor4De, decor2Ru];
    return images[index];
  };

const handleSaveAnimal = () => {
  setShowPowerModal(false);
  setCurrentRescueWord(currentPracticeWord); // ADD THIS LINE!
  setShowMission(true);
};

  const handleRoundJump = (round) => {
    console.log(`Jumping to round ${round} in main scene`);
    sceneActions.updateState({
      currentRound: round
    });
  };

const handleRescueComplete = () => {
  console.log('✅ Rescue complete for:', currentRescueWord);
  
  setShowRescueMission(false);
  
  if (currentRescueWord === 'nirvighnam') {
    console.log('Nirvighnam rescue complete - showing Kurumedeva story');
    
    setNirvighnamPowerGained(true);
    
    sceneActions.updateState({
      phase: PHASES.KURUMEDEVA_STORY
    });
    
    safeSetTimeout(() => {
      setShowKurumedevaStory(true);
    }, 500);
    
  } else if (currentRescueWord === 'kurumedeva') {
    console.log('Kurumedeva rescue complete - FINAL FIREWORKS!');
    
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    safeSetTimeout(() => {
      setShowSparkle('final-fireworks');
    }, 500);
  }
};

const handlePhaseComplete = (phase) => {
    console.log(`${phase} learned!`);
    
    // ✅ DEFINE KEY: Matches CulturalProgressExtractor dictionary
    const chantKey = phase === 'nirvighnam' ? 'nirvighnam-chant' : 'kurumedeva-chant';

    if (phase === 'nirvighnam') {
      // 1. Update State
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, nirvighnam: true },
        // ✅ ADD THIS: Save the specific chant to state
        chantedVerses: { 
          ...sceneState.chantedVerses, 
          [chantKey]: true 
        },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          nir: true, vigh: true, nam: true 
        },
        unlockedApps: { ...sceneState.unlockedApps, nirvighnam: true },
        // 2. Move to LEARNING Phase
        phase: PHASES.NIRVIGHNAM_LEARNING
      });

      playWord('nirvighnam');

      // 3. Trigger Discovery Overlay 1
      safeSetTimeout(() => {
        setShowDiscoveryFlip1(true);
      }, 1500);

    } else if (phase === 'kurumedeva') {
      // 1. Update State
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, kurumedeva: true },
        // ✅ ADD THIS: Save the specific chant to state
        chantedVerses: { 
          ...sceneState.chantedVerses, 
          [chantKey]: true 
        },
        learnedSyllables: {
          ...sceneState.learnedSyllables,
          ku: true, ru: true, me: true, de: true, va: true
        },
        unlockedApps: { ...sceneState.unlockedApps, kurumedeva: true },
        // 2. Move to LEARNING Phase
        phase: PHASES.KURUMEDEVA_LEARNING
      });

      setNirvighnamPowerGained(true);
      playWord('kurumedeva');
      
      // 3. Trigger Discovery Overlay 2
      safeSetTimeout(() => {
        setShowDiscoveryFlip2(true);
      }, 1500);
    }
  };

const handleMissionComplete = () => {
  console.log('✅ Mission complete for:', currentPracticeWord);
  setShowMission(false);
  
  if (currentPracticeWord === 'nirvighnam') {
    // Mission 1 Done. Transition to Game 2 is handled by Discovery 1 logic (below).
    // Just ensure power gained is set for visual consistency if needed.
    setNirvighnamPowerGained(true);
    
  } else {
    // Mission 2 Done. Complete Scene.
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

  // Add this near the top with other helper functions
const getPlainStoneImage = (syllable) => {
  if (syllable === 'nir') return stone1Nir;
  if (syllable === 'vigh') return stone2Vigh;
  if (syllable === 'nam') return stone3Nam;
  return null;
};

  
const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentPracticeWord === 'nirvighnam') {
    setNirvighnamPowerGained(true);
    sceneActions.updateState({ phase: PHASES.KURUMEDEVA_STORY });
    safeSetTimeout(() => setShowKurumedevaStory(true), 500);
    
  } else if (currentPracticeWord === 'kurumedeva') {
    sceneActions.updateState({
      phase: PHASES.SCENE_COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    safeSetTimeout(() => setShowSparkle('final-fireworks'), 500);
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
const backgroundImage = (() => {
  // ⭐ NEW: Check which game is currently being played
  const isPlayingNirvighnam = sceneState?.phase === PHASES.NIRVIGHNAM_GAME_ACTIVE ||
                              modeForPhase === 'nirvighnam';
  
  const isPlayingKurumedeva = sceneState?.phase === PHASES.KURUMEDEVA_GAME_ACTIVE ||
                              sceneState?.phase === PHASES.KURUMEDEVA_STORY ||
                              sceneState?.phase === PHASES.KURUMEDEVA_COMPLETE ||
                              sceneState?.phase === PHASES.GANESHA_BLESSING_KURUMEDEVA ||
                              sceneState?.phase === PHASES.CHOICE_BUTTONS_KURUMEDEVA ||
                              sceneState?.phase === PHASES.RESCUE_MISSION_KURUMEDEVA ||
                              modeForPhase === 'kurumedeva' ||
                              modeForPhase === 'kurume';
  
  // ⭐ Priority: If actively playing Nirvighnam, use its background
  if (isPlayingNirvighnam) {
    return nirvighnamChantBg;
  }
  
  // ⭐ Otherwise check if should use Kurumedeva background
  const shouldUseKuruBg = isPlayingKurumedeva ||
                         sceneState?.learnedWords?.nirvighnam || 
                         nirvighnamPowerGained;
  
  return shouldUseKuruBg ? kuruBg : nirvighnamChantBg;
})();

  // ⭐ Simplified hint configs for new wrapper-based architecture
  const getHintConfigs = () => [
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
        <div className="counter-icon">🕉️</div>
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

  /*const getSyllableState = (syllable) => {
    const learned = sceneState.learnedSyllables?.[syllable.toLowerCase()];
    if (learned) return 'learned';
    
    const currentPracticeWord= sceneState.learnedWords?.nirvighnam ? 'kurumedeva' : 'nirvighnam';
    
    const phaseSyllables = currentPracticeWord=== 'nirvighnam'
      ? ['nir', 'vigh', 'nam']
      : ['ku', 'ru', 'me', 'de', 'va'];
    
    if (phaseSyllables.includes(syllable.toLowerCase())) return 'current';
    return 'locked';
  };*/

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
          <HomeButton onNavigate={onNavigate} />

<div 
  className="river-background" 
  style={{
    backgroundImage: `url(${backgroundImage})`, // CHANGED: use simple variable
    backgroundSize: 'cover',
    backgroundPosition: 'center top', // Shows more of the top
    backgroundRepeat: 'no-repeat'
  }}
>

{/* ⭐ NIRVIGHNAM GAME - Scene-controlled mode */}
<NirvighnamGame
  isActive={sceneState.phase === PHASES.NIRVIGHNAM_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || showMission}
  onPhaseComplete={handlePhaseComplete}
  onGameComplete={handleGameComplete}
  profileName={profileName}

    // ⭐ ADD THESE STONE GETTERS
  getStoneInitialImage={getStoneInitialImage}
  getStoneRewardImage={getStoneRewardImage}
  getNirvighnamAnimalImage={getNirvighnamAnimalImage}

  // Nirvighnam asset functions
  getLeafRirImage={() => leafNir}
  getDrumVighImage={() => drumVigh}
  getFeatherNamImage={() => featherNam}
  getFrogNirImage={() => frogNir}
  getSnailVighImage={() => snailVigh}
  getTurtleNamImage={() => turtleNam}
  getStone1NirImage={() => stone1Nir}
  getStone2VighImage={() => stone2Vigh}
  getStone3NamImage={() => stone3Nam}
  getStone1NirColImage={() => stone1NirCol}
  getStone2VighColImage={() => stone2VighCol}
  getStone3NamColImage={() => stone3NamCol}

  // ⭐ Mode control - scene manages the modal, game gets the selection
  selectedMode={sceneState.nirvighnamMode}
  skipModeSelection={true}

  // Audio
  isAudioOn={isAudioOn}
  playAudio={playAudio}

  isReload={isReload}
  savedGameState={sceneState.nirvighnamGameState}
  onSaveGameState={(gameState) => handleSaveComponentState('nirvighnamGame', gameState)}
/>

{/* ⭐ KURUMEDEVA GAME - Scene-controlled mode */}
<KurumeDevaGame
  isActive={sceneState.phase === PHASES.KURUMEDEVA_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || showMission}
  onPhaseComplete={handlePhaseComplete}
  onGameComplete={handleGameComplete}
  profileName={profileName}

  // Kurumedeva asset functions
  getAnimal1KuImage={() => animal1Ku}
  getAnimal3MeImage={() => animal3Me}
  getAnimal4DeImage={() => animal4De}
  getAnimal2RuImage={() => animal2Ru}

    getDecorInitialImage={getDecorInitialImage}
  getDecorRewardImage={getDecorRewardImage}
  getKurumedevaAnimalImage={getKurumedevaAnimalImage}

  // ⭐ Mode control - scene manages the modal, game gets the selection
  selectedMode={sceneState.kurumedevaMode}
  skipModeSelection={true}

  // Audio
  isAudioOn={isAudioOn}
  playAudio={playAudio}

  isReload={isReload}
  savedGameState={sceneState.kurumedevaGameState}
  onSaveGameState={(gameState) => handleSaveComponentState('kurumedevaGame', gameState)}

/>
{/* ==================== SCENE 3 INTRO: CLEAR & BUILD ==================== */}
{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <OpeningModal
    zoneId={zoneId}
    sceneId={sceneId}
    characterImg={ganeshaWithHeadphones}
    onStart={() => {
      sceneActions.updateState({ welcomeShown: true });
      setModeForPhase('nirvighnam');
      setShowModeSelection(true);
      setModeSelected(false);
    }}
  />
)}

{/* ⭐ MODE SELECTION MODAL - Shows BEFORE game starts */}
{showModeSelection && !modeSelected && (
  <div className="nirvighnam-mission-modal-overlay">
    <div className="nirvighnam-mission-modal">
      <h2 className="nirvighnam-mission-title">🎮 How do you want to play?</h2>
      <p className="nirvighnam-mission-description">
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
          className="nirvighnam-mission-start-btn"
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
            const phaseKey = modeForPhase === 'nirvighnam' ? PHASES.NIRVIGHNAM_GAME_ACTIVE : PHASES.KURUMEDEVA_GAME_ACTIVE;
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
          className="nirvighnam-mission-start-btn"
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
            const phaseKey = modeForPhase === 'nirvighnam' ? PHASES.NIRVIGHNAM_GAME_ACTIVE : PHASES.KURUMEDEVA_GAME_ACTIVE;
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

{/* STORY TRANSITION MODAL 
{showKurumedevaStory && (
  <div className="nirvighnam-mission-modal-overlay">
    <div className="nirvighnam-mission-modal">
      <div className="nirvighnam-modal-character">
        <img src={ganeshaWithHeadphones} alt="Ganesha" className="nirvighnam-character-img" />
        <div className="nirvighnam-character-speech-bubble">
          One more to learn! 💪
        </div>
      </div>
      
      <h2 className="nirvighnam-mission-title">Great Work!</h2>
      <div className="nirvighnam-mission-subtitle">Now unlock the second power!</div>
      <p className="nirvighnam-mission-description">
        Learn to chant <strong>KURUMEDEVA</strong> to unlock Divine Grace and save more animals!
      </p>
      <button
        className="nirvighnam-mission-start-btn"
        onClick={() => {
          console.log('🎮 Opening mode selection for KURUMEDEVA');
          setShowKurumedevaStory(false);
          setModeForPhase('kurumedeva');
          setShowModeSelection(true);
          setModeSelected(false);
        }}
      >
        Start Learning!
      </button>
    </div>
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

            {/* ==================== DISCOVERY 1: NIRVIGHNAM (Clearing Obstacles) ==================== */}
{showDiscoveryFlip1 && (
  <SimpleDiscoveryOverlay
    celebrationTitle="Nirvighnam Chanted!"
    celebrationText={
      <>
        You moved the rocks and helped the animals!
        <br /><br />
        Nir-vigh-nam means clearing blocks from the path.
      </>
    }
    celebrationImage={appNirvighnam}
    
    powerTitle="I Clear the Way!"
    powerText="When something feels stuck, you don't give up. You find a way forward."
    powerIcon={appNirvighnam}
    
    buttonText="What Is My Power?"
    onComplete={() => {
      console.log("Discovery 1: Nirvighnam complete!");
      setShowDiscoveryFlip1(false);
      
      // Update sidebar + set phase for NEXT game
      sceneActions.updateState({ 
        phase: PHASES.KURUMEDEVA_GAME_ACTIVE,
        unlockedApps: { ...sceneState.unlockedApps, nirvighnam: true }
      });
            
      // Trigger mode selection for next game
      setTimeout(() => {
        setModeForPhase('kurumedeva');
        setShowModeSelection(true);
        setModeSelected(false);
      }, 500);
    }}
    showSparkles={true}
  />
)}

{/* ==================== DISCOVERY 2: KURUMEDEVA (Helping Actions) ==================== */}
{showDiscoveryFlip2 && (
  <SimpleDiscoveryOverlay
    celebrationTitle="Kurumedeva Chanted!"
    celebrationText={
      <>
        The temple looks beautiful!
        <br /><br />
        Ku-ru-me-de-va means turning good thoughts into helpful actions.
      </>
    }
    celebrationImage={appKurumedeva}
    
    powerTitle="I Like to Help!"
    powerText="You help with your hands and your heart. You make things better just by helping."
    powerIcon={appKurumedeva}
    
    buttonText="Feel My Power!"
    onComplete={() => {
      console.log("Discovery 2: Kurumedeva complete!");
      setShowDiscoveryFlip2(false);
      
      // Update sidebar
      sceneActions.updateState({ 
        unlockedApps: { ...sceneState.unlockedApps, kurumedeva: true }
      });

 setShowSparkle('final-fireworks');
    }}
    showSparkles={true}
  />
)}

            {/* SAVE ANIMAL MISSION - REUSABLE COMPONENT */}
<SanskritWordMission
  show={showMission}
  word={currentPracticeWord}
  beforeImage={missionImages[currentPracticeWord]?.before}
  afterImage={missionImages[currentPracticeWord]?.after}
  powerConfig={powerConfig[currentPracticeWord]}
      isFinalWordInScene={currentPracticeWord=== 'kurumedeva'}  // ⭐ ADD THIS LINE

  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
  }}
/>

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

       {/* 5-SECOND WORD CELEBRATION 
{showCenteredWord && (
  <>
    <div className="nirvighnam-celebration-overlay" />
    <div className="nirvighnam-centered-word-celebration">
      <img 
        src={powerConfig[showCenteredWord]?.image}
        alt={showCenteredWord}
        className="nirvighnam-celebration-app-icon"
      />
      <div className="nirvighnam-celebration-word-text">
        {showCenteredWord.toUpperCase()}
      </div>
      <div className="nirvighnam-celebration-sparkles">
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

{/* POWER MODAL 
{showPowerModal && (
  <div className="nirvighnam-power-modal-overlay">
    <div className="nirvighnam-power-modal">
      <div className="nirvighnam-power-affirmation-row">
        <img 
          src={powerConfig[currentPracticeWord]?.image}
          alt={currentPracticeWord}
          className="nirvighnam-affirmation-icon"
        />
        <div className="nirvighnam-affirmation-content">
          <div className="nirvighnam-affirmation-text">"{powerConfig[currentPracticeWord]?.affirmation}"</div>
          <div className="nirvighnam-affirmation-description">{powerConfig[currentPracticeWord]?.description}</div>
        </div>
      </div>
      
      <div className="nirvighnam-power-modal-content">
        <div className="nirvighnam-power-modal-left">
          <p className="nirvighnam-power-modal-text">
            You can now use this power to help animals in need!
          </p>
          <p className="nirvighnam-power-modal-subtext">Choose your next action:</p>
        </div>
        
       <div className="nirvighnam-power-modal-right">
  
  {/* ⭐ NEW: Play Again button 
  <button 
    className="nirvighnam-power-modal-btn nirvighnam-play-again-btn" 
onClick={() => {
  console.log(`🔄 Play Again: Restarting ${currentPracticeWord} game`);
  
  // ⭐ UPDATE PHASE FIRST (before closing modal)
  if (currentPracticeWord === 'nirvighnam') {
    sceneActions.updateState({ 
      phase: PHASES.NIRVIGHNAM_GAME_ACTIVE  // ⭐ Set phase FIRST
    });
    setModeForPhase('nirvighnam');
    setShowModeSelection(true);
    setModeSelected(false);
  } else if (currentPracticeWord === 'kurumedeva') {
    sceneActions.updateState({ 
      phase: PHASES.KURUMEDEVA_GAME_ACTIVE  // ⭐ Set phase FIRST
    });
    setModeForPhase('kurumedeva');
    setShowModeSelection(true);
    setModeSelected(false);
  } else if (currentPracticeWord === 'kurume') {
    sceneActions.updateState({ 
      phase: PHASES.KURUMEDEVA_GAME_ACTIVE  // ⭐ Set phase FIRST
    });
    setModeForPhase('kurume');
    setShowModeSelection(true);
    setModeSelected(false);
  }
  
  // ⭐ Close power modal AFTER phase update
  setShowPowerModal(false);
}}
    style={{
      background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      marginBottom: '10px'
    }}
  >
    🔄 Play Again
  </button>

  <button className="nirvighnam-power-modal-btn nirvighnam-save-btn" onClick={handleSaveAnimal}>
    🐾 Save an Animal
  </button>
          
          <button className="nirvighnam-power-modal-btn nirvighnam-continue-btn" onClick={handleContinueLearning}>
            {currentPracticeWord === 'kurumedeva' ? '✨ End Scene' : '🪷 Discover Kurumedeva'}
          </button>
        </div>
      </div>
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

{/* ✅ FIREWORKS: Save & Cleanup (Enables Replay) */}
{showSparkle === 'final-fireworks' && (
  <Fireworks
    show={true}
    duration={8000}
    count={25}
    colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
    onComplete={() => {
      console.log('🎯 Nirvighnam chant fireworks complete');
      setShowSparkle(null);
      
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        const finalChants = { 
          'nirvighnam-chant': true, 
          'kurumedeva-chant': true 
        };

        // 1. Save to GameStateManager
        GameStateManager.saveGameState('shloka-river', 'nirvighnam-chant', {
          completed: true,
          stars: 5,
          syllables: sceneState?.learnedSyllables || {},
          words: sceneState?.learnedWords || {},
          unlocked: sceneState?.unlockedApps || {},
          chantedVerses: finalChants, // ✅ Save Chants
          phase: 'complete',
          timestamp: Date.now()
        });
        
        // 2. Clear Session (REQUIRED for "Replay" button to show)
        localStorage.removeItem(`temp_session_${profileId}_shloka-river_nirvighnam-chant`);
        SimpleSceneManager.clearCurrentScene();
        console.log('✅ nirvighnam chant: Completion saved and temp session cleared');
      }
      
      setShowSceneCompletion(true);
    }}
  />
)}
          
{/* ✅ CELEBRATION: Double-Lock Save on Continue */}
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
            nextSceneName="Sarvakaryeshu Chant"
            sceneId="nirvighnam-chant"
            completionData={{
              stars: 5,
              syllables: sceneState.learnedSyllables,
              words: sceneState.learnedWords,
              unlocked: sceneState.unlockedApps,
              chantedVerses: { 'nirvighnam-chant': true, 'kurumedeva-chant': true }, // ✅ Pass Chants
              completed: true
            }}
            // 1. EXPLORE SCENES: Go to zone welcome
            onComplete={() => onNavigate?.('zone-welcome')}
            // 2. REPLAY FIX: Reset scene
            onReplay={() => {
              console.log('🔀 INSTANT REPLAY');
              setShowSceneCompletion(false);
              resetScene(false);
            }}
            // 3. CONTINUE FIX: Force Save & Navigate
            onContinue={() => {
              console.log('💾 CONTINUE: Force-Saving data to prevent Auto-Save wipe...');
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                // ✅ RE-SAVE DATA RIGHT BEFORE EXIT
                GameStateManager.saveGameState('shloka-river', 'nirvighnam-chant', {
                  completed: true,
                  stars: 5,
                  phase: 'complete',
                  words: { nirvighnam: true, kurumedeva: true },
                  // Hardcoded syllables for safety
                  syllables: { 
                    nir: true, vigh: true, nam: true,
                    kuru: true, me: true, de: true, va: true 
                  },
                  chantedVerses: { 'nirvighnam-chant': true, 'kurumedeva-chant': true },
                  unlocked: { nirvighnam: true, kurumedeva: true },
                  timestamp: Date.now()
                });
              }

              if (clearManualCloseTracking) clearManualCloseTracking();
              if (hideCoach) hideCoach();

              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'sarvakaryeshu-chant', false, false);
                console.log('NIRVIGHNAM CONTINUE: Next scene set');
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          /> 

          {/* TESTING: Universal completion button - works for any Sanskrit scene 
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

          {/* TESTING: Skip to Kurumedeva Game Button 
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
            console.log('🧪 TESTING: Skip to Kurumedeva Game clicked');
            
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
            
            console.log('✅ State set for Kurumedeva game - should start immediately');
          }}>
            SKIP TO KURUMEDEVA
          </div>

          {/* TESTING: Reload test button 
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
          </div>*/}

  {/* Back Button */}
         {sceneState.welcomeShown && !showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}

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
