// zones/shloka-river/scenes/Scene4/SarvakaryeshuChant.jsx - REBUILT using Scene 2 pattern
// ✅ Clean architecture: No early exit handling in scene file
// ✅ Simple callbacks like Scenes 1, 2, 3
// ✅ MemoryGameEngine handles all mode logic internally

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SarvakaryeshuChantSimplified.css';
// ... existing imports
// import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay'; // ← superseded by SymbolAutoReveal
import OpeningModal from '../../../shared/components/OpeningModal';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
import useIdleNudge from '../../../../lib/hooks/useIdleNudge';
import IdleHint from '../../../../lib/components/idle/IdleHint';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// ⭐ Import game wrappers (like Scene 2 pattern)
import SarvakaryeshuGame from './SarvakaryeshuGame';
import SarvadaGame from './SarvadaGame';

import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder.jsx';
import SmartwatchWidget from '../Scene1/components/SmartwatchWidget';
import HelperSignatureAnimation from '../../../../lib/components/animation/HelperSignatureAnimation';

import AppSidebar from "../../shared/AppSidebar";
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SanskritWordMission from '../../shared/SanskritWordMission';

import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SaveAnimalMission from '../../../../lib/components/missions/SaveAnimalMission';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';

// Background Images
import sarvakaryeshuBg from './assets/images/sarvakaryeshu-bg.png';
import sarvadaBg from './assets/images/sarvada-bg.png';

// Sarvakaryeshu game assets
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

// Sarvada game assets
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
import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
import symbolNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import symbolKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import symbolSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import symbolSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.png';
import appSarvakaryeshu from '../assets/images/apps/app-sarvakaryeshu.png';
import appSarvada from '../assets/images/apps/app-sarvada.png';
import boyNamaste from '../assets/images/boy-namaste.png';

// Rescue mission images
import sarvakaryeshuBefore from './assets/images/sarvakaryeshu/sarvakaryeshu-before.png';
import sarvakaryeshuAfter from './assets/images/sarvakaryeshu/sarvakaryeshu-after.png';
import sarvadaBefore from './assets/images/sarvada/sarvada-before.png'; 
import sarvadaAfter from './assets/images/sarvada/sarvada-after.png';
import { getCompletionModal } from '../../../../lib/config/content';

// ✅ Clean phase structure (like Scene 2)
const PHASES = {
  INITIAL: 'initial',
  SARVAKARYESHU_GAME_ACTIVE: 'sarvakaryeshu_game_active',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning',   // ⭐ NEW
  SARVADA_GAME_ACTIVE: 'sarvada_game_active',
  SARVADA_LEARNING: 'sarvada_learning',               // ⭐ NEW
  COMPLETE: 'complete'
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Shared countdown duration — must match across useVoiceGuidance + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

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
          phase: PHASES.INITIAL,
              chantedVerses: {}, 

          // Learning progress
          learnedSyllables: {
            sar: false, va: false, kar: false, yeshu: false,
            sarvada_sar: false, sarvada_va: false, da: false
          },
          learnedWords: {
            sarvakaryeshu: false,
            sarvada: false
          },

          unlockedApps: {},
          
          // ⭐ Mode selection state (handled by MemoryGameEngine)
          sarvakaryeshuMode: null,
          sarvadaMode: null,

          // ⭐ Individual game states
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
  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();

  // UI State
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { miniGesture, triggerMiniGesture } = useMiniGesture();
  const primaryRef = useRef(null);
  const { isIdle, resetIdle } = useIdleNudge(20000);
  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: false, idleTimeout: 20, resumeDelay: RESUME_DELAY_MS }
  );
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.phase ?? null); }, [sceneState?.phase, setCurrentPhase]);

  const pauseCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => { pauseCelebRef.current?.(); }, []);

  const [showFinalGanesha, setShowFinalGanesha] = useState(false);
  const [sarvakaryeshuPowerGained, setSarvakaryeshuPowerGained] = useState(false);
  const [showSarvadaStory, setShowSarvadaStory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [practiceWord, setPracticeWord] = useState(null);
  const [savedRecordings, setSavedRecordings] = useState({});

  // Mode selection state
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [modeForPhase, setModeForPhase] = useState(null);
  const [modeSelected, setModeSelected] = useState(false);

  const [showWordCelebration, setShowWordCelebration] = useState(false);
const [celebrationWord, setCelebrationWord] = useState('');

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';

  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // kept for reload-guard compat
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // kept for reload-guard compat
  // ── SymbolAutoReveal state ──────────────────────────────────────────────
  const [revealConfig, setRevealConfig] = useState(null);
    const reloadHandledRef = useRef(false);

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
  

  // Drop-in for safeSetTimeout — auto-pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  // 3-2-1 countdown display — fires immediately on tab show
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // ── SymbolAutoReveal helpers ──────────────────────────────────────────────
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2)
    };
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    if (symbolId === 'sarvakaryeshu') {
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.SARVADA_GAME_ACTIVE });
        setTimeout(() => {
          setModeForPhase('sarvada');
          setShowModeSelection(true);
          setModeSelected(false);
        }, 500);
      }, 950);
    } else if (symbolId === 'sarvada') {
      safeSetTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 950);
    }
  };

  useEffect(() => {
    return () => { clearAllTimeouts(); };
  }, [clearAllTimeouts]);


// ==================== RELOAD LOGIC ====================

  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;
    
    console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // -----------------------------------------------------
    // ⭐ NEW: RELOAD DURING MODE SELECTION
    // -----------------------------------------------------

    // 1. First Game (Sarvakaryeshu)
    if (sceneState.phase === PHASES.INITIAL && sceneState.welcomeShown && !sceneState.sarvakaryeshuMode) {
      console.log('📌 Reload: Restoring Sarvakaryeshu Mode Selection');
      setModeForPhase('sarvakaryeshu');
      setShowModeSelection(true);
      return;
    }

    // 2. Second Game (Sarvada)
    if (sceneState.phase === PHASES.SARVADA_GAME_ACTIVE && !sceneState.sarvadaMode) {
      console.log('📌 Reload: Restoring Sarvada Mode Selection');
      setModeForPhase('sarvada');
      setShowModeSelection(true);
      return;
    }
    // -----------------------------------------------------

    // Discovery 1 — restored via SymbolAutoReveal
    if (sceneState.phase === PHASES.SARVAKARYESHU_LEARNING) {
      setTimeout(() => setRevealConfig({ symbolId: 'sarvakaryeshu', symbolImage: symbolSarvakaryeshu, symbolName: 'Sarvakaryeshu', affirmation: 'I can do things.', sidebarTarget: getSidebarTarget('sarvakaryeshu') }), 500);
      return;
    }

    // Discovery 2 — restored via SymbolAutoReveal
    if (sceneState.phase === PHASES.SARVADA_LEARNING) {
      setTimeout(() => setRevealConfig({ symbolId: 'sarvada', symbolImage: symbolSarvada, symbolName: 'Sarvada', affirmation: 'I help always.', sidebarTarget: getSidebarTarget('sarvada') }), 500);
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

useEffect(() => {
    window.playSanskritAudio = playSyllable;
    window.playSanskritWord = playWord;
    
    return () => {
      delete window.playSanskritAudio;
      delete window.playSanskritWord;
    };
  }, [isAudioOn]); 
  
// UNIFIED: Single state saving function (like other scenes)
const handleSaveComponentState = (componentType, componentState) => {
  console.log(`💾 Saving ${componentType} state:`, componentState);
  
  // ⭐ Handle state clearing
  if (componentState === null || componentState?.cleared) {
    console.log(`🧹 Clearing ${componentType} state`);
    const updatedState = {
      ...(componentType === 'sarvakaryeshuGame' && { sarvakaryeshuGameState: null }),
      ...(componentType === 'sarvadaGame' && { sarvadaGameState: null })
    };
    sceneActions.updateState(updatedState);
    return;
  }
  
  // Normal save logic
  const updatedState = {
    ...(componentType === 'sarvakaryeshuGame' && { sarvakaryeshuGameState: componentState }),
    ...(componentType === 'sarvadaGame' && { sarvadaGameState: componentState }),
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
  // Asset Getters
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

  // ✅ CLEAN: Simple phase complete handler (like Scenes 1 & 2)
  // No early exit logic - MemoryGameEngine handles that internally
// ✅ CLEAN: Simple phase complete handler (like Scenes 1 & 2)
  // No early exit logic - MemoryGameEngine handles that internally
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);

    // ✅ DEFINE KEY: Matches CulturalProgressExtractor keys
    const chantKey = word === 'sarvakaryeshu' ? 'sarvakaryeshu-chant' : 'sarvada-chant';

    const syllableUpdates = word === 'sarvakaryeshu'
      ? { sar: true, va: true, kar: true, yeshu: true }
      : { sarvada_sar: true, sarvada_va: true, da: true };

    // 1. Update State & Phase
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      
      // ✅ ADD THIS: Save the specific chant for this phase
      chantedVerses: {
        ...sceneState.chantedVerses,
        [chantKey]: true
      },

      learnedSyllables: {
        ...sceneState.learnedSyllables,
        ...syllableUpdates
      },
      unlockedApps: { ...sceneState.unlockedApps, [word]: true },
      phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_LEARNING : PHASES.SARVADA_LEARNING
    });

    playWord(word);

    // 2. Trigger SymbolAutoReveal (replaces SimpleDiscoveryOverlay)
    safeSetTimeout(() => {
      if (word === 'sarvakaryeshu') {
        setRevealConfig({ symbolId: 'sarvakaryeshu', symbolImage: symbolSarvakaryeshu, symbolName: 'Sarvakaryeshu', affirmation: 'I can do things.', sidebarTarget: getSidebarTarget('sarvakaryeshu') });
      } else {
        setRevealConfig({ symbolId: 'sarvada', symbolImage: symbolSarvada, symbolName: 'Sarvada', affirmation: 'I help always.', sidebarTarget: getSidebarTarget('sarvada') });
      }
    }, 1500);
  };

  const handleGameComplete = (word) => {
  console.log(`🎯 ${word} game completed!`);
  
  // Update learned state
  sceneActions.updateState({
    learnedWords: {
      ...sceneState.learnedWords,
      [word]: true
    }
  });
  
  // Trigger word celebration
  setCelebrationWord(word);
  setShowWordCelebration(true);
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
      
      setShowFinalGanesha(true);
      setShowSparkle('final-fireworks');
    }
  };

 const handleMissionComplete = () => {
  console.log('✅ Mission complete for:', currentWord);
  setShowMission(false);
  
  if (currentWord === 'sarvakaryeshu') {
    // Mission 1 Done. Transition handled by Discovery 1 logic (below).
    // Just ensure visual state is correct.
    setSarvakaryeshuPowerGained(true);
    
  } else {
    // Mission 2 Done. Complete Scene.
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');

    safeSetTimeout(() => {
      setShowSceneCompletion(true);
    }, 3000);
  }
};

  const getCurrentBackground = () => {
    const isPlayingSarvakaryeshu = sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE ||
                                   modeForPhase === 'sarvakaryeshu';
    
    const isPlayingSarvada = sceneState.phase === PHASES.SARVADA_GAME_ACTIVE ||
                             sceneState.phase === PHASES.SARVADA_STORY ||
                             sceneState.phase === PHASES.SARVADA_COMPLETE ||
                             sceneState.phase === PHASES.SARVADA_POWER ||
                             modeForPhase === 'sarvada';
    
    if (isPlayingSarvakaryeshu) {
      return sarvakaryeshuBg;
    }
    
    const shouldUseSarvadaBg = isPlayingSarvada ||
                              sarvakaryeshuPowerGained || 
                              sceneState.learnedWords?.sarvakaryeshu;
    
    return shouldUseSarvadaBg ? sarvadaBg : sarvakaryeshuBg;
  };

  const handleSaveRecording = (recordingData) => {
    setSavedRecordings(prev => {
      const wordRecordings = prev[recordingData.word] || [];
      return {
        ...prev,
        [recordingData.word]: [...wordRecordings, recordingData]
      };
    });
  };

  // ⭐ RELOAD LOGIC: Update to handle individual game states
  /*useEffect(() => {
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
  }, [isReload]);*/
  
    // Auto-start mode selection after welcome
    useEffect(() => {
      if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown && !modeSelected) {
        console.log('Starting Sarvakaryeshu mode selection');
        setModeForPhase('sarvakaryeshu');
        setShowModeSelection(true);
      }
    }, [sceneState?.phase, sceneState?.welcomeShown, modeSelected]);

  const onSaveAppRecording = (recordingData) => {
    handleSaveRecording(recordingData);
  };

  const onDeleteAppRecording = (word, timestamp) => {
    setSavedRecordings(prev => ({
      ...prev,
      [word]: prev[word]?.filter(r => r.timestamp !== timestamp) || []
    }));
  };

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="sarvakaryeshu-chant-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
          <ResumeCountdown value={countdownValue} />
          <div
            className="river-background" 
            style={{
              backgroundImage: `url(${getCurrentBackground()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat'
            }}
          >

  {/* ==================== SCENE 4 INTRO: EVERY DAY, ALWAYS ==================== */}
{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <OpeningModal
    zoneId={zoneId}
    sceneId={sceneId}
    characterImg={ganeshaHeadphones}
    onStart={() => {
      sceneActions.updateState({ welcomeShown: true });
      setModeForPhase('sarvakaryeshu');
      setShowModeSelection(true);
      setModeSelected(false);
    }}
  />
)}

            {/* Sarvada Story Modal 
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
                    Learn to chant <strong>SARVADA</strong> to unlock eternal blessing power!
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

            {/* MODE SELECTION MODAL */}
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
                        Learn step by step from Round 1
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
                        Pick any round to practice
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ⭐ SARVAKARYESHU GAME - Clean callback like Scene 2 */}
            <SarvakaryeshuGame
              isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || !!revealConfig || showMission}
              selectedMode={sceneState.sarvakaryeshuMode}
              skipModeSelection={true} 
              
              // Assets
              getSarvakaryeshuSadAnimalImage={getSarvakaryeshuSadAnimalImage}
              getSarvakaryeshuHappyAnimalImage={getSarvakaryeshuHappyAnimalImage}
              getSarvakaryeshuHelperImage={getSarvakaryeshuHelperImage}
              
              // ✅ CLEAN: Simple callback - MemoryGameEngine handles early exit internally
              onMicroWin={() => triggerMiniGesture('thumbsup', 'item', 1200)}
              onPhaseComplete={() => handlePhaseComplete('sarvakaryeshu')}
              onGameComplete={() => {}}
              profileName={profileName}
              
              // Reload support
              isReload={isReload}
              savedGameState={sceneState.sarvakaryeshuGameState}
              onSaveGameState={(gameState) => handleSaveComponentState('sarvakaryeshuGame', gameState)}
            />

            {/* ⭐ SARVADA GAME - Clean callback like Scene 2 */}
            <SarvadaGame
              isActive={sceneState.phase === PHASES.SARVADA_GAME_ACTIVE}
hideElements={showDiscoveryFlip1 || showDiscoveryFlip2 || !!revealConfig || showMission}
              selectedMode={sceneState.sarvadaMode}
              skipModeSelection={true} 
              
              // Assets
              getSarvadaSadAnimalImage={getSarvadaSadAnimalImage}
              getSarvadaHappyAnimalImage={getSarvadaHappyAnimalImage}
              getSarvadaHelperImage={getSarvadaHelperImage}
              
              // ✅ CLEAN: Simple callback - MemoryGameEngine handles early exit internally
              onMicroWin={() => triggerMiniGesture('thumbsup', 'item', 1200)}
              onPhaseComplete={() => handlePhaseComplete('sarvada')}
              onGameComplete={() => {}}
              profileName={profileName}
              
              // Reload support
              isReload={isReload}
              savedGameState={sceneState.sarvadaGameState}
              onSaveGameState={(gameState) => handleSaveComponentState('sarvadaGame', gameState)}
            />

            {/* ── GANESHA MICRO-REWARD GESTURE CUE ──────────────────────────────
                 thumbsup/item = single correct tap (micro win, fired by sub-games) */}
            {miniGesture.show && (
              <GaneshaGestureCue
                key={miniGesture.key}
                gestureType={miniGesture.type}
                position={miniGesture.position}
                size={120}
              />
            )}

    <div ref={primaryRef}>
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
          resetIdle();
          setCurrentPracticeWord(app.id);
          // setShowAudioPractice(true); // Assuming this opens a separate modal for practice
        }}
        isReload={isReload}
        onSaveAppState={(appState) => {
          sceneActions.updateState({ unlockedApps: appState });
        }}
      />
    </div>

    <IdleHint isIdle={isIdle} targetRef={primaryRef} gesturePosition="above" />

{/* ✅ ADD: 5-SECOND WORD CELEBRATION 
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

{/* ✅ ADD: POWER MODAL 
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
  
  {/* ⭐ NEW: Play Again button 
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

{/* ── SimpleDiscoveryOverlay COMMENTED OUT — superseded by SymbolAutoReveal ──
{showDiscoveryFlip1 && ( <SimpleDiscoveryOverlay celebrationTitle="Sarvakaryeshu Chanted!" ... /> )}
{showDiscoveryFlip2 && ( <SimpleDiscoveryOverlay celebrationTitle="Sarvada Chanted!" ... /> )}
── End SimpleDiscoveryOverlay ── */}

{/* ── SymbolAutoReveal (replaces SimpleDiscoveryOverlay) ── */}
{revealConfig && (
  <SymbolAutoReveal
    key={revealConfig.symbolId}
    symbolId={revealConfig.symbolId}
    symbolImage={revealConfig.symbolImage}
    symbolName={revealConfig.symbolName}
    affirmation={revealConfig.affirmation}
    sidebarTargetRect={revealConfig.sidebarTarget}
    onComplete={() => handleRevealComplete(revealConfig.symbolId)}
  />
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

           {/* ✅ FIREWORKS: Save & Cleanup (Enables Replay) */}
            {showSparkle === 'final-fireworks' && (
              <>
                <FireworksCompletion
                  show={showSparkle === 'final-fireworks'}
                  showCard={false}
                />
                <CalmGoldenFireworks
                  show={showSparkle === 'final-fireworks'}
                  particles={14}
                  duration={3500}
                  onComplete={() => {
                    setShowSparkle(null);
                    setShowFinalGanesha(false);
                    
                    const profileId = localStorage.getItem('activeProfileId');
                    if (profileId) {
                      try {
                        console.log('💾 FIREWORKS: Saving Permanent Data...');
                        
                        const finalChants = { 
                          'sarvakaryeshu-chant': true, 
                          'sarvada-chant': true 
                        };

                        // 1. Save to GameStateManager
                        GameStateManager.saveGameState(zoneId, sceneId, {
                          completed: true,
                          stars: 5,
                          phase: PHASES.SCENE_COMPLETE,
                          words: sceneState.learnedWords || {},
                          syllables: sceneState.learnedSyllables || {},
                          apps: sceneState.unlockedApps || {},
                          chantedVerses: finalChants, // ✅ Save Chants
                          timestamp: Date.now()
                        });
                        
                        // 2. Clear Session (REQUIRED for "Replay" button to show)
                        localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
                        SimpleSceneManager.clearCurrentScene();
                        console.log('✅ FIREWORKS: Data Saved & Session Cleared');
                        
                      } catch (error) {
                        console.error('Error saving game state:', error);
                      }
                    }
                    
                    setShowSceneCompletion(true);
                  }}
                />
              </>
            )}

{/* ✅ CELEBRATION: Double-Lock Save on Continue */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Sarvakaryeshu Chant"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={4} // Scene 4 (Scene 5 is usually Finale)
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
              containerType="backpack"
              symbolImages={{
                vakratunda: symbolVakratunda,
                mahakaya: symbolMahakaya,
                suryakoti: symbolSuryakoti,
                samaprabha: symbolSamaprabha,
                nirvighnam: symbolNirvighnam,
                kurumedeva: symbolKurumedeva,
                sarvakaryeshu: symbolSarvakaryeshu,
                sarvada: symbolSarvada,
              }}
              nextSceneName="Shloka River Finale"
              sceneId="sarvakaryeshu-chant"
              completionData={{
                stars: 5,
                syllables: sceneState.learnedSyllables,
                words: sceneState.learnedWords,
                chantedVerses: { 'sarvakaryeshu-chant': true, 'sarvada-chant': true }, // ✅ Pass Chants
                completed: true
              }}
              // 1. EXPLORE SCENES: Go to zone welcome
              onComplete={() => onNavigate?.('zone-welcome')}
              // 2. REPLAY FIX
              onReplay={() => {
                console.log('🔀 INSTANT REPLAY');
                setShowSceneCompletion(false);
                // Standard reset (adjust if your scene uses specific reset logic)
                sceneActions.updateState({
                   phase: PHASES.INITIAL,
                   welcomeShown: false,
                   stars: 0,
                   completed: false
                });
              }}
              // 3. CONTINUE FIX: Force Save & Navigate
              onContinue={() => {
                console.log('💾 CONTINUE: Force-Saving data to prevent Auto-Save wipe...');
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  // ✅ RE-SAVE DATA RIGHT BEFORE EXIT
                  GameStateManager.saveGameState(zoneId, sceneId, {
                    completed: true,
                    stars: 5,
                    phase: PHASES.SCENE_COMPLETE,
                    words: { sarvakaryeshu: true, sarvada: true },
                    syllables: { 
                      sar: true, va: true, kar: true, yeshu: true,
                      sarvada_sar: true, sarvada_va: true, da: true
                    },
                    chantedVerses: { 'sarvakaryeshu-chant': true, 'sarvada-chant': true },
                    apps: { sarvakaryeshu: true, sarvada: true },
                    timestamp: Date.now()
                  });
                }

                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                
                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('shloka-river', 'shloka-river-finale', false, false);
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
              isAudioOn={isAudioOn}
              onAudioToggle={toggleAudio}
              onZonesClick={() => {
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              onStartFresh={() => {
                sceneActions.updateState({
                  phase: PHASES.INITIAL,
                  welcomeShown: false,
                  learnedWords: {},
                  learnedSyllables: {},
                  sarvakaryeshuGameState: null,
                  sarvadaGameState: null,
                  stars: 0,
                  completed: false
                });
              }}
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

        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuChant;
