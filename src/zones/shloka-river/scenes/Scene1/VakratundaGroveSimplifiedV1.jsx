// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// Clean implementation following Pond scene pattern

import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGroveSimplified.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';

// Memory game component (reuse existing)
import SimplifiedMemoryGame from './components/SimplifiedMemoryGame';
import AppSidebar from '../../shared/AppSidebar';
import SanskritWordMission from '../../shared/SanskritWordMission';
//import AppPracticeModal from '../../shared/AppPracticeModal';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

// NEW: Config-driven memory games
import VakratundaGame from './VakratundaGame';
import MahakayaGame from './MahakayaGame';
// Optional: WaterSpray if you have it
// import WaterSpray from './components/WaterSpray';

import useSafeClick from '../../core/hooks/useSafeClick';

// Character images
import boyNamaste from './assets/images/boy-namaste.png';
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';

// Images
import riverBackground from './assets/images/elephant-grove-bg.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';

// Mission images
import vakratundaBefore from './assets/images/vakratunda-before.png';
import vakratundaAfter from './assets/images/vakratunda-after.png';
import mahakayaBefore from './assets/images/mahakaya-before.png'; 
import mahakayaAfter from './assets/images/mahakaya-after.png';

// Elephant images for memory game
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantBabyKra from './assets/images/vakratunda/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/vakratunda/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/vakratunda/elephant-baby-da.png';
import elephantHa from './assets/images/mahakaya/elephant-ha.png';
import elephantKa from './assets/images/mahakaya/elephant-ka.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';
import elephantYa from './assets/images/mahakaya/elephant-ya.png';

// Singers & Rewards
import budVa from './assets/images/vakratunda/va-bud.png';
import budKra from './assets/images/vakratunda/kra-bud.png';
import budTun from './assets/images/vakratunda/tun-bud.png';
import budDa from './assets/images/vakratunda/da-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import lotusKra from './assets/images/vakratunda/kra-lotus.png';
import lotusTun from './assets/images/vakratunda/tun-lotus.png';
import lotusDa from './assets/images/vakratunda/da-lotus.png';
import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';
import flowerHa from './assets/images/mahakaya/ha-flower.png';
import flowerKa from './assets/images/mahakaya/ka-flower.png';
import flowerYa from './assets/images/mahakaya/ya-flower.png';

const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  VAKRATUNDA_POWER: 'vakratunda_power',
  MAHAKAYA_STORY: 'mahakaya_story',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  MAHAKAYA_POWER: 'mahakaya_power',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { 
    name: 'Flexibility Power', 
    image: appVakratunda,
    color: '#4ECDC4',
    affirmation: 'I am flexible',
    description: 'I can adapt to anything!'
  },
  mahakaya: { 
    name: 'Inner Strength', 
    image: appMahakaya,
    color: '#FF6B35',
    affirmation: 'I am strong',
    description: 'I have power inside me!'
  }
};

const missionImages = {
  vakratunda: { before: vakratundaBefore, after: vakratundaAfter },
  mahakaya: { before: mahakayaBefore, after: mahakayaAfter }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VakratundaGroveSimplified = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'vakratunda-grove'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.INITIAL,
          learnedWords: { vakratunda: false, mahakaya: false },
              chantedVerses: {}, 

          learnedSyllables: {
            va: false, kra: false, tun: false, da: false,
            ma: false, ha: false, ka: false, ya: false
          },
          unlockedApps: {},
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false },
            vakratundaGameState: null,  // â­ ADD THIS
  mahakayaGameState: null  ,   // â­ ADD THIS
       // â­ Mode selection (like Scene 2)
          vakratundaMode: null,      // 'auto' or 'manual'
          mahakayaMode: null,      // 'auto' or 'manual'
          missionState: {
            rescuePhase: 'problem',
            showParticles: false,
            word: null,
            missionJustCompleted: false
          },
        
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
  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);

  const [isAudioOn, setIsAudioOn] = useState(true);
const [showGaneshaCelebration, setShowGaneshaCelebration] = useState(false);

  const [showInitialHeader, setShowInitialHeader] = useState(true);
const [headerMessage, setHeaderMessage] = useState('');

const [showFinalGanesha, setShowFinalGanesha] = useState(false);

// Mode selection state
const [showModeSelection, setShowModeSelection] = useState(false);
const [modeForPhase, setModeForPhase] = useState(null); // 'vakratunda' or 'mahakaya'
const [modeSelected, setModeSelected] = useState(false); // Prevent loops

const [practiceWord, setPracticeWord] = useState(null);
const [showRecorder, setShowRecorder] = useState(false);
const [savedRecordings, setSavedRecordings] = useState({}); // { vakratunda: [...], mahakaya: [...] }

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
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

  // Audio functions
  const playAudio = (audioPath, volume = 1.0) => {
    if (!isAudioOn) return Promise.resolve();
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      return audio.play().catch(() => Promise.resolve());
    } catch {
      return Promise.resolve();
    }
  };

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

    if (componentState === null || componentState?.cleared) {
  const updatedState = {
    ...(componentType === 'vakratundaGame' && { vakratundaGameState: null }),
    ...(componentType === 'mahakayaGame' && { mahakayaGameState: null })
  };
  sceneActions.updateState(updatedState);
  return;
}
    
const updatedState = {
  ...(componentType === 'memoryGame' && { memoryGameState: componentState }),
  ...(componentType === 'vakratundaGame' && { vakratundaGameState: componentState }),
  ...(componentType === 'mahakayaGame' && { mahakayaGameState: componentState }),
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

const onSaveAppRecording = (recordingData) => {
  setSavedRecordings(prev => ({
    ...prev,
    [recordingData.word]: [
      ...(prev[recordingData.word] || []),
      recordingData
    ]
  }));
};

const onDeleteAppRecording = (recordingId, word) => {
  setSavedRecordings(prev => {
    const wordRecordings = prev[word] || [];
    return {
      ...prev,
      [word]: wordRecordings.filter(rec => rec.id !== recordingId)
    };
  });
};

  const playSyllable = (syllable) => {
    const map = {
      'va': 'vakratunda-va', 'kra': 'vakratunda-kra',
      'tun': 'vakratunda-tun', 'da': 'vakratunda-da',
      'ma': 'mahakaya-ma', 'ha': 'mahakaya-ha',
      'ka': 'mahakaya-ka', 'ya': 'mahakaya-ya'
    };
    playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
  };

  const playWord = (word) => {
    playAudio(`/audio/words/${word}.mp3`);
  };


// Memory game completion - MATCHES POND PATTERN
const handlePhaseComplete = (word) => {
  console.log(`${word} learned!`);

    // âœ… DEFINE THE CHANT KEY BASED ON THE WORD
  const chantKey = word === 'vakratunda' ? 'vakratunda-chant' : 'mahakaya-chant';
  
  sceneActions.updateState({
    learnedWords: { ...sceneState.learnedWords, [word]: true },
    // âœ… IMMEDIATE UPDATE: Add this specific chant to the list
    chantedVerses: { 
      ...sceneState.chantedVerses, 
      [chantKey]: true 
    },
    learnedSyllables: {
      ...sceneState.learnedSyllables,
      ...(word === 'vakratunda' 
        ? { va: true, kra: true, tun: true, da: true }
        : { ma: true, ha: true, ka: true, ya: true })
    },
    phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
  });

  // Step 1: Show 5-second celebration
  setShowCenteredWord(word);
  setShowSparkle(`${word}-celebration`);
  playWord(word);
  
  safeSetTimeout(() => {
    // Step 2: Hide centered, fly to sidebar
    setShowCenteredWord(null);
    setShowSparkle(`${word}-to-sidebar`);
    
    sceneActions.updateState({
      unlockedApps: { ...sceneState.unlockedApps, [word]: true }
    });
    
    safeSetTimeout(() => {
      // Step 3: Show power modal IMMEDIATELY (like Pond)
      setShowSparkle(null);
      setCurrentWord(word);
      setShowPowerModal(true);
      sceneActions.updateState({
        phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
      });
    }, 2000);
  }, 5000);
};

  // Power modal handlers
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setShowMission(true);

  };

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentWord === 'vakratunda') {
    // Show Mahakaya story
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_STORY });
    }, 500);
  } else {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    // Show Ganesha AND fireworks together
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');
  }
};

const handleMissionComplete = () => {
  console.log('âœ… Mission complete for:', currentWord);
  setShowMission(false);
  
  if (currentWord === 'vakratunda') {
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_STORY });
    }, 500);
  } else {
    // Complete scene - SAME AS handleContinueLearning
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    // Show Ganesha AND fireworks together
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');
  }
};

  // Image helpers
  const getBabyElephantImage = (i) => [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa][i];
  const getAdultElephantImage = (i) => [elephantMa, elephantHa, elephantKa, elephantYa][i];
  const getBudImage = (i) => [budVa, budKra, budTun, budDa][i];
  const getLotusImage = (i) => [lotusVa, lotusKra, lotusTun, lotusDa][i];
  const getSeedImage = () => seedImage;
  const getFlowerImage = (i) => [flowerMa, flowerHa, flowerKa, flowerYa][i];

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>

{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <div className="vakratunda-mission-modal-overlay">
    <div className="vakratunda-mission-modal">
      <div className="vakratunda-modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-character-img" />
        <div className="vakratunda-character-speech-bubble">
          Let's save the forest! ðŸŒ³
        </div>
      </div>
      
      <h2 className="vakratunda-mission-title">Help Ganesha Save the Forest!</h2>
      <div className="vakratunda-mission-subtitle">2 magical words have special powers!</div>
      <p className="vakratunda-mission-description">
        First, learn to chant <strong>VAKRATUNDA</strong> to unlock flexibility power and rescue trapped animals!
      </p>
      <button 
        className="vakratunda-mission-start-btn"
  onClick={() => {
  sceneActions.updateState({ 
    welcomeShown: true
  });
  setModeForPhase('vakratunda');
  setShowModeSelection(true);
    setModeSelected(false);
}}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}

{/* VAKRATUNDA MEMORY GAME */}
<VakratundaGame
  isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME}
  hideElements={showCenteredWord || showPowerModal || showMission || sceneState.phase === PHASES.MAHAKAYA_STORY}
  onPhaseComplete={() => handlePhaseComplete('vakratunda')}
  onGameComplete={() => {}}
  profileName={profileName}
  // âœ… BUG 6 & 8 FIX: Pass BOTH initial (bud) and reward (lotus) asset getters
  getBudImage={getBudImage}
  getLotusImage={getLotusImage}
  getBabyElephantImage={getBabyElephantImage}
  selectedMode={sceneState.vakratundaMode}  // â­ Mode from scene modal
  skipModeSelection={true}  // â­ ALWAYS skip - scene handles mode selection
  isReload={isReload}
  savedGameState={sceneState.vakratundaGameState}
onSaveGameState={(state) => handleSaveComponentState('vakratundaGame', state)}
/>

{/* MAHAKAYA MEMORY GAME */}
<MahakayaGame
  isActive={sceneState.phase === PHASES.MAHAKAYA_GAME}
  hideElements={showCenteredWord || showPowerModal || showMission}
  powerGained={sceneState.learnedWords?.vakratunda}
  onPhaseComplete={() => handlePhaseComplete('mahakaya')}
  onGameComplete={() => {}}
  profileName={profileName}
  // âœ… BUG 6 & 8 FIX: Pass BOTH initial (seed) and reward (flower) asset getters
  getSeedImage={getSeedImage}
  getFlowerImage={getFlowerImage}
  getAdultElephantImage={getAdultElephantImage}
  selectedMode={sceneState.mahakayaMode}  // â­ Mode from scene modal
  skipModeSelection={true}  // â­ ALWAYS skip - scene handles mode selection
  isReload={isReload}
  savedGameState={sceneState.mahakayaGameState}
onSaveGameState={(state) => handleSaveComponentState('mahakayaGame', state)}

/>


            {/* MEMORY GAME 
            <SimplifiedMemoryGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME || sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerModal || showMission || sceneState.phase === PHASES.MAHAKAYA_STORY}
              onPhaseComplete={handlePhaseComplete}
              onGameComplete={() => {}}
              profileName={profileName}
              getBabyElephantImage={getBabyElephantImage}
              getAdultElephantImage={getAdultElephantImage}
              getBudImage={getBudImage}
              getLotusImage={getLotusImage}
              getSeedImage={getSeedImage}
              getFlowerImage={getFlowerImage}
              isAudioOn={isAudioOn}
              playAudio={playAudio}
              powerGained={sceneState.learnedWords?.vakratunda}
            />

{/* PERSISTENT BOY CHARACTER - Always visible once game starts */}
{sceneState.welcomeShown && 
 !showSceneCompletion && (
  <div className="vakratunda-companion-boy">
    <img src={boyNamaste} alt="Learning with you" className="vakratunda-boy-companion" />
  </div>
)}

{/* STATIC LEARNING HEADER 
{sceneState.phase === PHASES.VAKRATUNDA_GAME && !showCenteredWord && !showPowerModal && !showMission && (
  <div className="game-phase-header">
    ðŸŽµ Let's Learn to Chant VAKRATUNDA!
  </div>
)}

{sceneState.phase === PHASES.MAHAKAYA_GAME && !showCenteredWord && !showPowerModal && !showMission && (
  <div className="game-phase-header">
    ðŸŽµ Let's Learn to Chant MAHAKAYA!
  </div>
)}*/}

       {sceneState.phase === PHASES.MAHAKAYA_STORY && (
  <div className="vakratunda-mission-modal-overlay">
    <div className="vakratunda-mission-modal">
      <div className="vakratunda-modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-character-img" />
        <div className="vakratunda-character-speech-bubble">
          One more to learn! ðŸ’ª
        </div>
      </div>
      
      <h2 className="vakratunda-mission-title">Great Work!</h2>
      <div className="vakratunda-mission-subtitle">Now unlock the second power!</div>
      <p className="vakratunda-mission-description">
        Learn to chant <strong>MAHAKAYA</strong> to unlock inner strength and save more animals!
      </p>
      <button
        className="vakratunda-story-continue-btn"
onClick={() => {
  // Show mode selection INSTEAD of starting game
  setModeForPhase('mahakaya');
  setShowModeSelection(true);
  setModeSelected(false);
}}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}

         

{/* SPARKLES BEFORE GANESHA APPEARS */}
{showSparkle === 'vakratunda-ganesha-incoming' && (
  <div className="vakratunda-ganesha-sparkle-position">
    <SparkleAnimation
      type="burst"
      count={20}
      color="#FFD700"
      size={15}
      duration={1500}
      fadeOut={true}
    />
  </div>
)}

{/* GANESHA CELEBRATION - Fades in next to persistent boy */}
{showGaneshaCelebration && (
  <div className="vakratunda-ganesha-celebration-enter">
    <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-slides-in" />
    <div className="vakratunda-ganesha-celebration-bubble">
      {showGaneshaCelebration === 'vakratunda' ? 'Great job! ðŸŽ‰' : 'Amazing! â­'}
    </div>
  </div>
)}
          {/* POWER MODAL - POND STYLE */}
{showPowerModal && (
  <div className="vakratunda-power-modal-overlay">
    <div className="vakratunda-power-modal">
      {/* Affirmation section - NO TITLE */}
      <div className="vakratunda-power-affirmation-row">
        <img 
          src={powerConfig[currentWord]?.image}
          alt={currentWord}
          className="vakratunda-affirmation-icon"
        />
        <div className="vakratunda-affirmation-content">
          <div className="vakratunda-affirmation-text">"{powerConfig[currentWord]?.affirmation}"</div>
          <div className="vakratunda-affirmation-description">{powerConfig[currentWord]?.description}</div>
        </div>
      </div>
      
      <div className="vakratunda-power-modal-content">
        <div className="vakratunda-power-modal-left">
          <p className="vakratunda-power-modal-text">
            You can now use this power to help animals in need!
          </p>
          <p className="vakratunda-power-modal-subtext">Choose your next action:</p>
        </div>
        
  <div className="vakratunda-power-modal-right">
  {/* NO ICON HERE - removed duplicate */}
  
  {/* â­ NEW: Play Again button */}
  <button 
    className="vakratunda-power-modal-btn play-again-btn" 
    onClick={() => {
      console.log(`ðŸ”„ Play Again: Restarting ${currentWord} game`);
      setShowPowerModal(false);
      
      // Reset to game phase for the current word
      if (currentWord === 'vakratunda') {
        setModeForPhase('vakratunda');
        setShowModeSelection(true);
        setModeSelected(false);
      } else if (currentWord === 'mahakaya') {
        setModeForPhase('mahakaya');
        setShowModeSelection(true);
        setModeSelected(false);
      }
    }}
    style={{
      background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      marginBottom: '10px'
    }}
  >
    ðŸ”„ Play Again
  </button>
  
  <button className="vakratunda-power-modal-btn save-btn" onClick={handleSaveAnimal}>
    ðŸ¾ Save an Animal
  </button>
  
  <button className="vakratunda-power-modal-btn continue-btn" onClick={handleContinueLearning}>
    {currentWord === 'vakratunda' ? 'ðŸŽµ Discover Mahakaya' : 'âœ¨ End Scene'}
  </button>
</div>
      </div>
    </div>
  </div>
)}

   {/* 5-SECOND WORD CELEBRATION */}
            {showCenteredWord && (
              <>
                <div className="vakratunda-celebration-overlay" />
                <div className="vakratunda-centered-word-celebration">
                  <img 
                    src={powerConfig[showCenteredWord]?.image}
                    alt={showCenteredWord}
                    className="vakratunda-celebration-app-icon"
                  />
                  <div className="vakratunda-celebration-word-text">
                    {showCenteredWord.toUpperCase()}
                  </div>
                  <div className="vakratunda-celebration-sparkles">
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

{/* MODE SELECTION MODAL - Shows BEFORE game starts */}
{showModeSelection && !modeSelected && (
  <div className="vakratunda-mission-modal-overlay">
    <div className="vakratunda-mission-modal mode-selection-modal">
      <h2 className="vakratunda-mission-title">ðŸŽ® How do you want to play?</h2>
      <p className="vakratunda-mission-description">
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
          className="vakratunda-mission-start-btn"
          style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            padding: '20px',
            fontSize: '16px'
          }}
          onClick={() => {
            console.log(`ðŸŽ® Mode selected: AUTO for ${modeForPhase}`);

            // Mark as selected to prevent loop
            setModeSelected(true);
            setShowModeSelection(false);

            // â­ FIX: Set mode AND phase in SINGLE update to prevent race condition
            const modeKey = `${modeForPhase}Mode`;
            sceneActions.updateState({
              [modeKey]: 'auto',
              phase: modeForPhase === 'vakratunda' ? PHASES.VAKRATUNDA_GAME : PHASES.MAHAKAYA_GAME
            });
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>â–¶ï¸ Auto Play</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Start from Round 1 and learn step by step
          </div>
        </button>
        
        {/* MANUAL BUTTON */}
        <button
          className="vakratunda-mission-start-btn"
          style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            padding: '20px',
            fontSize: '16px'
          }}
          onClick={() => {
            console.log(`ðŸŽ® Mode selected: MANUAL for ${modeForPhase}`);

            // Mark as selected to prevent loop
            setModeSelected(true);
            setShowModeSelection(false);

            // â­ FIX: Set mode AND phase in SINGLE update to prevent race condition
            const modeKey = `${modeForPhase}Mode`;
            sceneActions.updateState({
              [modeKey]: 'manual',
              phase: modeForPhase === 'vakratunda' ? PHASES.VAKRATUNDA_GAME : PHASES.MAHAKAYA_GAME
            });
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>ðŸŽ¯ Choose a Round</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Pick any round you like and practice!
          </div>
        </button>
      </div>
    </div>
  </div>
)}

{/* SAVE ANIMAL MISSION - REUSABLE COMPONENT */}
<SanskritWordMission
  show={showMission}
  word={currentWord}
  beforeImage={missionImages[currentWord]?.before}
  afterImage={missionImages[currentWord]?.after}
  powerConfig={powerConfig[currentWord]}
      isFinalWordInScene={currentWord === 'mahakaya'}  // â­ ADD THIS LINE

  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
  }}
/>

<AppSidebar
  unlockedApps={sceneState.unlockedApps || {}}
  savedRecordings={savedRecordings}
  onSaveRecording={onSaveAppRecording}
  onDeleteRecording={onDeleteAppRecording}  // NEW!
  isReload={isReload}
  onSaveAppState={(appState) => {
    sceneActions.updateState({ unlockedApps: appState });
  }}
/>


<SanskritVoiceRecorder
  chantResult={null}
  show={showRecorder}
  word={practiceWord || ''}
  savedRecordings={savedRecordings}
  onSaveRecording={handleSaveRecording}
  stopAudio={() => {
    document.querySelectorAll('audio').forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }}
  onComplete={() => {
    setShowRecorder(false);
    setPracticeWord(null);
  }}
  onSkip={() => {
    setShowRecorder(false);
    setPracticeWord(null);
  }}
  title={practiceWord ? powerConfig[practiceWord]?.name : 'Practice Chanting'}
  appIcon={powerConfig[practiceWord]?.image} // ADD THIS
  appColor={powerConfig[practiceWord]?.color} // ADD THIS
  allowSkip={true}
/>

{showSparkle === 'final-fireworks' && (
  <Fireworks
    show={true}
    duration={6000}
    count={20}
    colors={['#FFD700', '#FF8C00', '#FFA500']}
  onComplete={() => {
  setShowSparkle(null);
  setShowFinalGanesha(false);
  
  // Save and show completion immediately
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    console.log('ðŸ”¥ SAVING:', zoneId, sceneId, {
  completed: true,
  stars: 5,
  chantedVerses: { 'vakratunda-mahakaya-line1': true }
});
    try {
      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 5,
        phase: PHASES.COMPLETE,
        words: sceneState.learnedWords || {},
        syllables: sceneState.learnedSyllables || {},
        apps: sceneState.unlockedApps || {},
chantedVerses: sceneState.chantedVerses || { 
    'vakratunda-chant': true, 
    'mahakaya-chant': true 
  },
          timestamp: Date.now()
      });
          localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
          SimpleSceneManager.clearCurrentScene();
        } catch (error) {
          console.error('Error saving game state:', error);
        }
      }
      
      setShowSceneCompletion(true);
    }}
  />
)}


{/* FINAL CELEBRATION - Ganesha appears BEFORE completion screen */}
{showFinalGanesha && !showSceneCompletion && (
  <div className="vakratunda-final-ganesha-appears">
    <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-final-enters" />
    <div className="vakratunda-ganesha-final-bubble">
      You're a hero! ðŸŒŸ
    </div>
  </div>
)}

          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Vakratunda Grove"
            sceneNumber={1}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
discoveredSymbols={['vakratunda', 'mahakaya']}
containerType="smartwatch"
//containerImage={smartwatchBase}
containerScreenImage={smartwatchScreen}
appImages={{
  vakratunda: appVakratunda,
  mahakaya: appMahakaya,
  // Add other apps as you create them
}}
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
  console.log('ðŸ”„ INSTANT REPLAY: Garden Adventure restart');
  setShowSceneCompletion(false);
  resetScene();
}}
            onContinue={() => {
              console.log('SANSKRIT CONTINUE: Going to next scene + preserving resume');
        
              
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
                  words: sceneState.learnedWords,
chantedVerses: sceneState.chantedVerses || { 
    'vakratunda-chant': true, 
    'mahakaya-chant': true 
  }
                });
                
                GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords,
                   // âœ… ADD THIS:
 chantedVerses: sceneState.chantedVerses || { 
    'vakratunda-chant': true, 
    'mahakaya-chant': true 
  }
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

            {/* NAVIGATION */}
            <TocaBocaNav
              onHome={() => {
               
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onZonesClick={() => {
              
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              onStartFresh={() => resetScene()}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
            />

           {/* Back Button */}
         {sceneState.welcomeShown && !showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}

            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={[]}
              characterImage={mooshikaCoach}
              enabled={false}
            />
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaGroveSimplified;
