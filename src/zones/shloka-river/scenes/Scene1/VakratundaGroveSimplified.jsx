// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// FIXED: Removed SanskritWordMission, connected PowerUnlockOverlay directly to next phase

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './VakratundaGroveSimplified.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from "../../../../lib/services/ProgressManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay'; // ? superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
// import { PauseButton, PauseMenu } from '../../../../lib/components/ui/PauseMenu'; // ? removed: replaced by home icon
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import { SCENE_TO_OUTER_PETAL_ID } from '../../../../lib/components/navigation/ProgressPopup';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';

import AppSidebar from '../../shared/AppSidebar';
import OpeningModal from '../../../shared/components/OpeningModal';
// REMOVED: import SanskritWordMission (No longer needed)

// Zone Theme
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal, getCompletionModal, getDiscoveryContent } from '../../../../lib/config/content';
import { getVoiceScript } from '../../../../lib/config/content/voiceGuidance';

// Game Components
import VakratundaRescueGame from './VakratundaRescueGame';
import MahakayaRescueGame from './MahakayaRescueGame';

// Character images
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';

// Images
import riverBackground from './assets/images/vakratunda-scene-bg.webp';
import mooshikaCoach from "./assets/images/mooshika-coach.webp";
import banyanTree from './assets/images/banyan-full-from-download.webp';
import symbolVakratunda from '../../../symbol-mountain/shared/images/icons/symbol-trunk-new.webp';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';

// Elephant images for memory game
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.webp';
import elephantMa from './assets/images/mahakaya/elephant-ma.webp';

// Singers & Rewards
import budVa from './assets/images/vakratunda/va-bud.webp';
import lotusVa from './assets/images/vakratunda/va-lotus.webp';
import seedImage from './assets/images/mahakaya/seed.webp';
import flowerMa from './assets/images/mahakaya/ma-flower.webp';

// ========================================
// 1. LOCAL UI COMPONENTS
// ========================================

const sceneOuterPetalId = SCENE_TO_OUTER_PETAL_ID['Your Journey Begins!'];
const sceneOuterPetalIds = [sceneOuterPetalId - 1, sceneOuterPetalId];

const VOGatedButton = ({ visible, onClick, children, className = '', style = {} }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...style,
        animation: 'buttonFadeIn 0.35s ease-out',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {children}
      <style>{`
        @keyframes buttonFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </button>
  );
};

// ========================================

// Shared countdown duration — matches useVoiceGuidance + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  VAKRATUNDA_POWER: 'vakratunda_power',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  MAHAKAYA_POWER: 'mahakaya_power',
  COMPLETE: 'complete'
};

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(`^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
};

const powerConfig = {
  vakratunda: {
    name: 'Flexibility Power',
    image: symbolVakratunda,
    color: '#4ECDC4',
    affirmation: 'My trunk bends to find a new way.',
    story: 'When you feel stuck, try a new way.'
  },
  mahakaya: {
    name: 'Inner Strength',
    image: symbolMahakaya,
    color: '#FF6B35',
    affirmation: 'I am big and strong — and you have strength inside too.',
    story: 'Stand tall. Be brave.'
  }
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
          learnedSyllables: {},
          unlockedApps: {},
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false },
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
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));

  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);

  // Controls the Power Unlock Overlay (superseded by SymbolAutoReveal)
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showPowerButton, setShowPowerButton] = useState(false);
  const [showPracticeAgainButton, setShowPracticeAgainButton] = useState(false);

  // -- SymbolAutoReveal state ----------------------------------------------
  // null = not showing; object = reveal active
  const [revealConfig, setRevealConfig] = useState(null);

  const [currentWord, setCurrentWord] = useState(null);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  // Ref mirror — always in sync with isAudioOn state but readable synchronously
  // (used in effects/callbacks where React state batching can cause stale reads)
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const [showTapSparkles, setShowTapSparkles] = useState(false);
  const [showWordStar, setShowWordStar] = useState(false);
  const fxBgRef = useRef(null);
  const lastPointRef = useRef(null);
  const [sparklePos, setSparklePos] = useState(null);
  const recordPoint = useCallback((e) => {
    const el = fxBgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    if (cx == null || cy == null) return;
    lastPointRef.current = {
      x: Math.min(95, Math.max(5, ((cx - r.left) / r.width) * 100)),
      y: Math.min(95, Math.max(5, ((cy - r.top) / r.height) * 100)),
    };
  }, []);

  const [vakratundaStage, setVakratundaStage] = useState('intro');

  // Pause Menu State — removed: replaced by home icon
  // const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Opening Modal State
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);

  const [savedRecordings, setSavedRecordings] = useState({});
  const handleSaveRecording = useCallback((wordId, data) => {
    setSavedRecordings((prev) => ({ ...prev, [wordId]: data }));
  }, []);
  const handleDeleteRecording = useCallback((wordId) => {
    setSavedRecordings((prev) => {
      const next = { ...prev };
      delete next[wordId];
      return next;
    });
  }, []);
  const [showAppDiscovery, setShowAppDiscovery] = useState(false);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showMandala ||
    showSceneCompletion ||
    showAppDiscovery ||
    sceneState.phase === PHASES.COMPLETE;
  const shouldShowOpeningModal =
    sceneState.phase === PHASES.INITIAL &&
    !sceneState.welcomeShown &&
    !showSceneCompletion &&
    !showMandala &&
    !showAppDiscovery &&
    showSparkle !== 'final-fireworks';

  const isCelebrationOrOverlayActive =
    isFinalCelebrationActive ||
    !!revealConfig ||          // Block while SymbolAutoReveal is showing
    showPowerOverlay ||
    showCenteredWord;

  // useEffect(() => {
  //   if (isFinalCelebrationActive && showPauseMenu) {
  //     setShowPauseMenu(false);
  //   }
  // }, [isFinalCelebrationActive, showPauseMenu]);

  // Voice Guidance Hook
  const {
    playVoice: playHookVoice,
    stopVoice,
    setVoiceVolume,
    playSyllable,
    playWord: playWordAudio,
    playSfx,
    playCorrect,
    playWrong,
    isPlaying: isVOPlaying,
    setCurrentPhase,
    startIdleTimer,
    stopIdleTimer
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false,
    voiceVolume: 1,
    sfxVolume: 0.7,
    // Keep hook idle voice effectively disabled; guidance is handled by Web Speech.
    idleTimeout: 999999,
    resumeDelay: RESUME_DELAY_MS, // audio waits for 3-2-1 countdown after tab return
  });

  const { playUiTap, playBloom, playChime, playGlow, playTwinkle } = useGameSounds();

  // Track whether recorder popup is open — pause game voice when it is
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const stopWebSpeech = useCallback(() => {
    try {
      speechSynthRef.current?.cancel();
    } catch {
      // no-op
    }
  }, []);

  const speakWebSpeech = useCallback((text, onEnded) => {
    if (!audioEnabledRef.current || !text) {
      if (onEnded) onEnded();
      return;
    }
    const synth = speechSynthRef.current;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      if (onEnded) onEnded();
      return;
    }
    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 0.95;
      utterance.onend = () => onEnded?.();
      utterance.onerror = () => onEnded?.();
      synth.speak(utterance);
    } catch {
      if (onEnded) onEnded();
    }
  }, []);

  const playGuidanceVoice = useCallback((key, onEnded, options = {}) => {
    const webSpeechMap = {
      welcome: "Let's help our friends by the river.",
      instructionListen: 'Listen carefully.',
      instructionTapAndRepeat: "That way's blocked — look for another way around.",
      instructionTapTheElephant: "That way's blocked — look for another way around.",
      hintTapElephant: "That way's blocked — look for another way around.",
      hintLookForGlow: "Try going around — see the open water?",
      hintKeepBuildingPath: "Keep going — you're finding the way through.",
      vakratundaSetup: 'The frog made it! He found his family!',
      vakratundaClaim: 'I find a new way.',
      mahakayaSetup: 'You chanted… and it grew tall and strong.',
      mahakayaClaim: 'You have that strength too.',
      sceneComplete: "You found another way. There's room for everyone. Both powers are yours now.",
      instructionTapLotusWord: 'Tap the lotus.',
      instructionTapLotus: 'Tap the lotus.',
      instructionTapLotusUnlock: 'Tap the lotus.',
      instructionTapLilyWord: 'Tap the lily.',
      instructionTapLily: 'Tap the lily.',
      instructionTapLilyUnlock: 'Tap the lily.',
      scene10_vak_intro: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
      scene10_vak_current_too_strong: "The river current is too strong there. Let's try another way.",
      scene10_vak_frog_cross: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
      scene10_vak_tap_logs: "That way's blocked — look for another way around.",
      scene10_vak_blocked: "That way's blocked — look for another way around.",
      scene10_vak_choose: "That way's blocked — look for another way around.",
      scene10_vak_make_path: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
      scene10_vak_drag_leaves: 'Follow the safe water past the rocks.',
      scene10_vak_drag: 'Follow the safe water past the rocks.',
      scene10_vak_drag_pieces: 'Follow the safe water past the rocks.',
      scene10_vak_crossed: 'Vakratunda! You found another way and helped the frog reach his family.',
      scene10_vak_meaning: 'Vakratunda means finding another way.',
      scene10_maha_intro: 'Everyone wants to cross, but the raft is too small. Help make room for them all.',
      scene10_maha_blocking: "The raft's still too small for everyone.",
      scene10_maha_drag_rope: 'Grab another log so everyone can fit.',
      scene10_maha_pull_down: '',
      scene10_maha_log_moving: '',
      scene10_maha_success: 'Mahakaya! You made the raft bigger, and everyone crossed.',
      scene10_maha_meaning: 'Mahakaya means great strength.',
      scene10_maha_strength: 'You have strength inside you too.',
    };
    const script = getVoiceScript(zoneId, sceneId, key);
    if (script) {
      playHookVoice(key, onEnded, options);
      return;
    }
    if (webSpeechMap[key]) {
      speakWebSpeech(stripLeadingSpeechText(webSpeechMap[key], options.stripLeadingText), onEnded);
      return;
    }
    if (onEnded) onEnded();
  }, [playHookVoice, sceneId, speakWebSpeech, zoneId]);
  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState.welcomeShown || sceneState.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome');
      return;
    }
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME) {
      if (vakratundaStage === 'vaFail') {
        playGuidanceVoice('scene10_vak_current_too_strong');
        return;
      }
      playGuidanceVoice(['kra', 'tun', 'da'].includes(vakratundaStage) ? 'scene10_vak_drag' : 'scene10_vak_choose');
      return;
    }
    if (sceneState.phase === PHASES.MAHAKAYA_GAME) {
      playGuidanceVoice('scene10_maha_drag_rope');
      return;
    }
    if (showSceneCompletion) {
      playGuidanceVoice('sceneComplete');
    }
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion, vakratundaStage]);

  const stopAllVoice = useCallback(() => {
    stopVoice();
    stopWebSpeech();
  }, [stopVoice, stopWebSpeech]);


  // -- ESC key pause handler — REMOVED (replaced by home icon) --
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === 'Escape' && sceneState.welcomeShown && !isCelebrationOrOverlayActive && !showSceneCompletion) {
  //       e.preventDefault();
  //       if (!showPauseMenu) {
  //         stopVoice();
  //         stopIdleTimer();
  //         setShowPauseMenu(true);
  //       } else {
  //         setShowPauseMenu(false);
  //         const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
  //         const celebrationPhases = [PHASES.VAKRATUNDA_COMPLETE, PHASES.VAKRATUNDA_POWER, PHASES.MAHAKAYA_COMPLETE, PHASES.MAHAKAYA_POWER];
  //         if (activeGamePhases.includes(sceneState.phase) &&
  //             !celebrationPhases.includes(sceneState.phase) &&
  //             !showPowerOverlay &&
  //             !revealConfig &&
  //             !showCenteredWord) {
  //           startIdleTimer();
  //         }
  //       }
  //     }
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [showPauseMenu, sceneState.welcomeShown, isCelebrationOrOverlayActive, showSceneCompletion, sceneState.phase, showPowerOverlay, showCenteredWord, revealConfig]);

  // -- Auto-pause on blur — REMOVED (replaced by home icon) --
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     const shouldNotPause = showPowerOverlay || !!revealConfig || showCenteredWord || isFinalCelebrationActive || showSceneCompletion || showPauseMenu;
  //     if (document.hidden && sceneState.welcomeShown && !shouldNotPause) {
  //       stopVoice();
  //       stopIdleTimer();
  //       setShowPauseMenu(true);
  //     }
  //   };
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, [sceneState.welcomeShown, isFinalCelebrationActive, showSceneCompletion, showPauseMenu, showPowerOverlay, showCenteredWord]);

  // Pause/resume refs — stop celebration timers on tab hide, restart on show
  const pauseCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    if ([PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME].includes(sceneState.phase)) {
      startIdleTimer();
    }
  }, [sceneState.phase, startIdleTimer]);

  // Drop-in safeSetTimeout — auto-pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  // 3-2-1 countdown display — shown when child switches back to tab/app
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => {
    if (!sceneState?.phase) {
      sceneActions.updateState({ phase: PHASES.INITIAL });
    }
  }, [sceneState?.phase]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  useEffect(() => {
    return () => {
      stopWebSpeech();
    };
  }, [stopWebSpeech]);

  // -- SymbolAutoReveal helpers ----------------------------------------------

  // Compute delta from card center (viewport center) to sidebar icon center
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 }; // fallback: right edge of screen
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2)
    };
  };

  const persistCompletion = useCallback(() => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    try {
      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 5,
        phase: PHASES.COMPLETE,
        words: sceneState.learnedWords || {},
        syllables: sceneState.learnedSyllables || {},
        apps: sceneState.unlockedApps || {},
        chantedVerses: sceneState.chantedVerses || {},
        timestamp: Date.now()
      });
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 5,
      });
      localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
      SimpleSceneManager.clearCurrentScene();
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [sceneId, sceneState.chantedVerses, sceneState.learnedSyllables, sceneState.learnedWords, sceneState.unlockedApps, zoneId]);

  // Run game-phase advancement after user taps card and it finishes flying
  // Rule: never update unlockedApps before ~950ms after onComplete —
  // updating it causes AppSidebar to re-render which strips the bloom
  // class mid-animation.
  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'vakratunda') {
      // Capture current unlockedApps now (before recorder opens) to avoid stale closure
      const appsNow = sceneState.unlockedApps;

      const advanceToMahakaya = () => {
        safeSetTimeout(() => {
          sceneActions.updateState({
            unlockedApps: { ...appsNow, vakratunda: true },
            phase: PHASES.MAHAKAYA_GAME,
            mahakayaGameState: null
          });
        }, 950);
      };

      advanceToMahakaya();

    } else if (symbolId === 'mahakaya') {
      const appsNow = sceneState.unlockedApps;

      const advanceToCelebration = () => {
        safeSetTimeout(() => {
          sceneActions.updateState({
            unlockedApps: { ...appsNow, mahakaya: true }
          });
        }, 950);
        safeSetTimeout(() => {
          handleAppDiscoveryCelebrate();
        }, 1500);
      };

      advanceToCelebration();
    }
  };

  // Reload-only restore: re-show the reveal card + chime if the saved state
  // was mid-reveal when the page was refreshed. Guarded to run once per
  // mount (not on every live phase change) — otherwise this races
  // handlePhaseComplete's own triggerReveal() for the same phase transition
  // and both fire playChime()/setRevealConfig() back to back (double SFX).
  const hasRestoredRevealRef = useRef(false);
  useEffect(() => {
    if (!sceneState || revealConfig) return;
    if (hasRestoredRevealRef.current) return;
    hasRestoredRevealRef.current = true;

    const restoreReveal = (word) => {
      safeSetTimeout(() => {
        const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
        playChime();
        setShowSparkle(null);
        setRevealConfig({
          symbolId: word,
          symbolImage: powerConfig[word].image,
          symbolName: discoveryData?.title || powerConfig[word].name,
          affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
          sidebarTarget: getSidebarTarget(word)
        });
      }, 1200);
    };

    if ([PHASES.VAKRATUNDA_COMPLETE, PHASES.VAKRATUNDA_POWER].includes(sceneState.phase)) {
      restoreReveal('vakratunda');
      return;
    }

    if ([PHASES.MAHAKAYA_COMPLETE, PHASES.MAHAKAYA_POWER].includes(sceneState.phase)) {
      restoreReveal('mahakaya');
    }
  }, [sceneState?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Home button: stop everything ? go to main map ----------------------
  const handleHomeToMainMap = () => {
    stopAllVoice();
    stopIdleTimer();
    onNavigate?.('direct-to-map');
  };

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button is visible immediately (like ModakScene)
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is INITIAL and not yet started)
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      setOpeningButtonVisible(true);
      // Use ref (not state) — avoids stale-closure race when resetScene() delays 100ms
      if (!audioEnabledRef.current) {
        return;
      }
      const timer = setTimeout(() => {
        playGuidanceVoice('welcome', () => {
          playSfx('chime');
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn, playGuidanceVoice]); // isAudioOn in deps so effect re-runs on toggle

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

  // Use hook's playWord for word audio — always plays (game audio, not VO narration)
  const playWord = (word) => {
    playWordAudio(word);
  };

  // Audio toggle handler — volume approach: change volume live so game callbacks always fire.
  // Turning OFF: set vol 0 (audio silenced but still plays, callbacks intact).
  //              Stop welcome VO during INITIAL phase only — safe, no game callbacks there.
  // Turning ON:  restore vol 1 on whatever is currently playing, and future audio.
  const handleAudioToggle = () => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn && sceneState.phase === PHASES.INITIAL) {
      stopAllVoice(); // during opening modal: stop welcome VO cleanly (no game callbacks running)
    }
    toggleAudio();
  };

  // Set current phase + start organic idle hint timer when game phases begin
  useEffect(() => {
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME && sceneState.welcomeShown) {
      setCurrentPhase('vakratundaGame');
      startIdleTimer(); // hints fire after ~12s of no interaction
    }
  }, [sceneState.phase, sceneState.welcomeShown, setCurrentPhase]);

  useEffect(() => {
    if (sceneState.phase === PHASES.MAHAKAYA_GAME) {
      setCurrentPhase('mahakayaGame');
      startIdleTimer(); // hints fire after ~12s of no interaction
    }
  }, [sceneState.phase, setCurrentPhase]);

  // On Continue (isReload=true): clear saved mini-game states so games restart fresh
  // instead of resuming a potentially frozen mid-game state
  // Memory game completion
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);

    // Sanskrit moment — full word learned: one blessing gesture + one Golden Star
    triggerMiniGesture('blessing', 'center', 2500);
    setShowWordStar(true);
    safeSetTimeout(() => setShowWordStar(false), 1500);

    // Stop idle timer — game is done, no more hints
    stopIdleTimer();
    setCurrentPhase(null);

    // Update State
    const chantKey = word === 'vakratunda' ? 'vakratunda-chant' : 'mahakaya-chant';
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [chantKey]: true },
      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
    });

    // Visuals — word celebration removed, game stays visible while VO plays
    setShowSparkle(`${word}-celebration`);

    // -- Transition: VO completes ? SymbolAutoReveal ---------------------------
    const triggerReveal = () => {
      setShowSparkle(null);

      // Show SymbolAutoReveal flip card — content from discoveryContent.js
      const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
      playChime();
      setRevealConfig({
        symbolId: word,
        symbolImage: powerConfig[word].image,
        symbolName: discoveryData?.title || powerConfig[word].name,
        affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word)
      });

      sceneActions.updateState({
        phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
      });
    };

    // Word reveal VO -> then transition to SymbolAutoReveal
    if (isAudioOn) {
      safeSetTimeout(() => {
        triggerReveal();
      }, 2000);
    } else {
      // Audio off fallback — short delay then reveal
      safeSetTimeout(() => {
        triggerReveal();
      }, 1500);
    }

    // -- Old goToPowerOverlay (superseded by SymbolAutoReveal) --
    // const goToPowerOverlay = () => {
    //   setShowCenteredWord(null);
    //   setShowSparkle(`${word}-to-sidebar`);
    //   sceneActions.updateState({ unlockedApps: { ...sceneState.unlockedApps, [word]: true } });
    //   safeSetTimeout(() => {
    //     setShowSparkle(null);
    //     setCurrentWord(word);
    //     setShowPowerOverlay(true);
    //     setShowPowerButton(false);
    //     setShowPracticeAgainButton(false);
    //     if (isAudioOn) {
    //       const powerVOKey = word === 'vakratunda' ? 'vakratundaPower' : 'mahakayaPower';
    //       playVO(powerVOKey, () => { playSfx('chime'); setShowPowerButton(true); setShowPracticeAgainButton(true); });
    //     } else { setShowPowerButton(true); setShowPracticeAgainButton(true); }
    //     sceneActions.updateState({ phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER });
    //   }, 2000);
    // };
  };

  // ? FIXED: Direct transitions, no "Save Animal" mission
  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false);
    stopVoice(); // Stop any playing VO

    if (currentWord === 'vakratunda') {
      console.log('?? Moving to Mahakaya Phase');
      // Go straight to Mahakaya Game
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
      });
    } else {
      console.log('?? Showing App Discovery screen');
      // Show App Discovery screen before final celebration
      setShowAppDiscovery(true);
    }
  };

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    console.log('?? Triggering Final Celebration from App Discovery');

    // Play scene complete VO
    if (isAudioOn) {
      playGuidanceVoice('sceneComplete');
    }

    // Complete Scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      progress: { percentage: 100, starsEarned: 5, completed: false }
    });

    setShowSparkle('final-fireworks');
  };

  useEffect(() => {
    if (
      sceneState.phase === PHASES.COMPLETE &&
      !showSparkle &&
      !showMandala &&
      !showSceneCompletion
    ) {
      setShowMandala(true);
    }
  }, [sceneState.phase, showMandala, showSparkle, showSceneCompletion]);

  const handleElephantMicroWin = useCallback(() => {
    setSparklePos(lastPointRef.current);
    setShowTapSparkles(true);
    safeSetTimeout(() => setShowTapSparkles(false), 1600);
  }, [safeSetTimeout]);

  // ?? Play Again - Replay the current word's game
  const handlePlayAgain = () => {
    setShowPowerOverlay(false);

    if (currentWord === 'vakratunda') {
      console.log('?? Replaying Vakratunda Game');
      // Reset vakratunda game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.VAKRATUNDA_GAME,
        learnedWords: { ...sceneState.learnedWords, vakratunda: false }
      });
    } else if (currentWord === 'mahakaya') {
      console.log('?? Replaying Mahakaya Game');
      // Reset mahakaya game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
        learnedWords: { ...sceneState.learnedWords, mahakaya: false }
      });
    }

    setCurrentWord(null);
  };

  // Stable identity for SceneCompletionCelebration's completionData prop —
  // an inline object literal here would recreate on every render and re-fire
  // that component's save-on-show effect in a loop while showing.
  const completionData = useMemo(() => ({
    stars: 5,
    syllables: sceneState?.learnedSyllables,
    words: sceneState?.learnedWords,
    completed: true
  }), [sceneState?.learnedSyllables, sceneState?.learnedWords]);

  // Unified State Saver
  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />
          <ResumeCountdown value={countdownValue} />
          <div className="river-background" ref={fxBgRef} onPointerDownCapture={recordPoint} style={{ backgroundImage: `url(${riverBackground})` }}>
            <div style={{ display: showSceneCompletion ? 'none' : 'contents' }}>
            <>

            <div className="vakratunda-scene-banyan">
              <img src={banyanTree} alt="" />
            </div>

            {/* HOME BUTTON — inline green button removed; HomeButton component handles this */}

            {/* -- PauseButton — REMOVED (replaced by home icon) --
            <PauseButton
              visible={sceneState.welcomeShown && !showSceneCompletion && !isFinalCelebrationActive}
              onClick={() => {
                if (isFinalCelebrationActive) return;
                stopVoice();
                stopIdleTimer();
                setShowPauseMenu(true);
              }}
            />
            -- End PauseButton -- */}

            {/* -- Pause blur overlay — REMOVED (replaced by home icon) --
            {showPauseMenu && !isFinalCelebrationActive && (
              <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                zIndex: 999, pointerEvents: 'none',
                transition: 'opacity 0.2s ease-out', opacity: 1
              }} />
            )}
            -- End blur overlay -- */}

            {/* -- PauseMenu — REMOVED (replaced by home icon) --
            <PauseMenu
              show={showPauseMenu && !isFinalCelebrationActive}
              onResume={() => { setShowPauseMenu(false); startIdleTimer(); }}
              onBackToMap={() => { setShowPauseMenu(false); onNavigate?.('zones'); }}
              isSoundOn={isAudioOn}
              onSoundToggle={() => { if (isAudioOn) stopVoice(); setIsAudioOn(!isAudioOn); }}
              zoneName="Shloka River"
            />
            -- End PauseMenu -- */}

            {/* 3. OPENING MODAL (Using Zone Theme Colors) */}
            {shouldShowOpeningModal && (
              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                isOpen
                onStart={() => {
                  playUiTap();
                  stopAllVoice();
                  sceneActions.updateState({
                    welcomeShown: true,
                    phase: PHASES.VAKRATUNDA_GAME
                  });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

            {/* VAKRATUNDA RESCUE GAME — BendReeds → word build → chant */}
            <VakratundaRescueGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              onMicroWin={handleElephantMicroWin}
              onStageChange={setVakratundaStage}
              onPhaseComplete={() => handlePhaseComplete('vakratunda')}
              onGameComplete={() => {}}
              profileName={profileName}
              voiceGuidance={{
                playVoice: playGuidanceVoice,
                playSfx,
                playWord: playWordAudio,
                playSyllable: (syllable, onEnded) => {
                  stopAllVoice();
                  playSyllable('vakratunda', syllable, onEnded);
                },
                stopVoice: stopAllVoice,
                characterImage: mooshikaCoach
              }}
              isPaused={isRecorderOpen}
            />

            {/* MAHAKAYA RESCUE GAME — PushLog → word build → chant */}
            <MahakayaRescueGame
              isActive={sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              powerGained={sceneState.learnedWords?.vakratunda}
              onMicroWin={handleElephantMicroWin}
              onPhaseComplete={() => handlePhaseComplete('mahakaya')}
              onGameComplete={() => {}}
              profileName={profileName}
              voiceGuidance={{
                playVoice: playGuidanceVoice,
                playSfx,
                playWord: playWordAudio,
                playSyllable: (syllable, onEnded) => {
                  stopAllVoice();
                  playSyllable('mahakaya', syllable, onEnded);
                },
                stopVoice: stopAllVoice,
                characterImage: mooshikaCoach
              }}
              isPaused={isRecorderOpen}
            />

            {/* PERSISTENT BOY CHARACTER (Commented out per user request) */}
            {/* {sceneState.welcomeShown && !showSceneCompletion && (
              <div className="vakratunda-companion-boy">
                <img src={boyNamaste} alt="Learning with you" className="vakratunda-boy-companion" />
              </div>
            )} */}

            {showWordStar && (
              <div className="vakratunda-word-star">
                <SparkleAnimation type="star" count={20} color="#FFD54F" size={14} duration={1500} area="full" />
              </div>
            )}

            {showTapSparkles && (
              <div className="vakratunda-tap-sparkles" style={sparklePos ? { left: `${sparklePos.x}%`, top: `${sparklePos.y}%`, width: '32%', height: '32%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' } : undefined}>
                <SparkleAnimation
                  type="dust"
                  count={22}
                  color="#FFD54F"
                  size={5}
                  duration={1600}
                  area="full"
                />
              </div>
            )}

            {/* -- SYMBOL AUTO-REVEAL (replaces PowerUnlockOverlay) ---------------
                 Flip card: symbol image ? affirmation ? user taps ? flies to sidebar */}
            {revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                revealVoice={{
                  isEnabled: isAudioOn,
                  wordId: revealConfig.symbolId,
                  meaningKey: revealConfig.symbolId === 'vakratunda'
                    ? 'scene10_vak_meaning'
                    : revealConfig.symbolId === 'mahakaya'
                      ? 'scene10_maha_meaning'
                      : null,
                  playWord: playWordAudio,
                  playLine: playGuidanceVoice,
                  stopVoice: stopAllVoice,
                }}
                sidebarTargetRect={revealConfig.sidebarTarget}
                zoneId={zoneId}
                sceneId={sceneId}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* -- PowerUnlockOverlay — COMMENTED OUT (superseded by SymbolAutoReveal) --
            {showPowerOverlay && currentWord && (
              <PowerUnlockOverlay
                zoneId={zoneId}
                title={`${powerConfig[currentWord].name} Unlocked!`}
                description={{
                  main: [
                    powerConfig[currentWord].affirmation,
                    powerConfig[currentWord].story
                  ],
                  emphasis: currentWord === 'vakratunda'
                    ? 'I can try again.'
                    : currentWord === 'mahakaya'
                      ? 'I can make room.'
                      : 'You have mastered both powers!'
                }}
                icon={powerConfig[currentWord].image}
                iconColor={powerConfig[currentWord].color}
                buttonText={currentWord === 'vakratunda' ? "Discover Mahakaya" : "Discover Words!"}
                showButton={showPowerButton}
                showPlayAgain={showPracticeAgainButton}
                playAgainText="Practice Again"
                onPlayAgain={handlePlayAgain}
                onComplete={handlePowerUnlockComplete}
              />
            )}
            -- End PowerUnlockOverlay -- */}

            {/* 5-SECOND WORD CELEBRATION — REMOVED: goes directly to SymbolAutoReveal */}
            {/* {showCenteredWord && (
              <>
                <div className="vakratunda-celebration-overlay" />
                <div className="vakratunda-centered-word-celebration">
                  <img
                    src={powerConfig[showCenteredWord]?.image}
                    alt={showCenteredWord}
                    className="vakratunda-celebration-app-icon"
                  />
                  <div className="vakratunda-celebration-word-text">
                    {showCenteredWord.charAt(0).toUpperCase() + showCenteredWord.slice(1).toLowerCase()}
                  </div>
                </div>
              </>
            )} */}

            {/* App Discovery Screen (centerMode) — REMOVED: auto-celebration triggers directly after reveal */}
            {/* {showAppDiscovery && (
              <AppSidebar
                centerMode={true}
                unlockedApps={sceneState.unlockedApps || {}}
                savedRecordings={savedRecordings}
                highlightApps={['vakratunda', 'mahakaya']}
                onCelebrate={handleAppDiscoveryCelebrate}
                onPopupOpen={() => {
                  stopVoice();
                  stopIdleTimer();
                }}
                onPopupClose={() => {
                  // stay on discovery screen, no timer restart
                }}
              />
            )} */}

            {/* Side rail AppSidebar — hidden during App Discovery and final celebration */}
            {!showAppDiscovery &&
              !isFinalCelebrationActive &&
              !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
                <AppSidebar
                  unlockedApps={sceneState.unlockedApps || {}}
                  savedRecordings={savedRecordings}
                  onSaveRecording={handleSaveRecording}
                  onDeleteRecording={handleDeleteRecording}
                  isReload={isReload}
                  onPopupOpen={() => {
                    console.log("?? Recorder Opening - Pausing Game");
                    stopAllVoice();
                    stopIdleTimer();
                    setIsRecorderOpen(true);
                  }}
                  onPopupClose={() => {
                    console.log("?? Recorder Closing - Resuming Game");
                    setIsRecorderOpen(false);
                    // Only restart idle timer if we're in an active game phase (not celebration/overlay/complete)
                    const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
                    if (activeGamePhases.includes(sceneState.phase) && !showPowerOverlay && !showCenteredWord) {
                      startIdleTimer();
                    }
                  }}
                />
              )}

            {/* -- GANESHA MICRO-REWARD GESTURE CUE --------------------------------
                 blessing/center = Sanskrit word complete (phase win)
                 thumbsup/item   = single correct tap (micro win, fired by sub-games)
                 Sits above game content, below celebration overlays (z-index 200/999) */}
            {miniGesture.show && (
              <GaneshaGestureCue
                key={miniGesture.key}
                gestureType={miniGesture.type}
                position={miniGesture.position}
                size={120}
              />
            )}

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
                    setShowMandala(true);
                  }}
                />
              </>
            )}
            {showMandala && (
              <InnerMandala
                childName={profileName}
                shlokaPetalStates={{
                }}
                justEarnedPetals={sceneOuterPetalIds.map((id) => ({ ring: 'outer', id }))}
                earnedSymbols={[
                  { id: 'vakratunda', petalId: 1, ring: 'outer', image: symbolVakratunda },
                  { id: 'mahakaya', petalId: 2, ring: 'outer', image: symbolMahakaya },
                ]}
                highlightPetals={sceneOuterPetalIds}
                message="These meanings are growing inside you"
                autoCloseMs={3000 + (2 * 950) + 2600}
                onClose={() => {
                  sceneActions.updateState({ completed: true });
                  persistCompletion();
                  setShowMandala(false);
                  setShowSceneCompletion(true);
                }}
              />
            )}
            </>
            </div>
            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Vakratunda Grove"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={1}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['vakratunda', 'mahakaya']}
              containerType="backpack"
              symbolImages={{
                vakratunda: symbolVakratunda,
                mahakaya: symbolMahakaya,
              }}
              symbolData={{
                vakratunda: {
                  title: "Vakratunda - Curved Trunk",
                  description: "Remover of obstacles with his curved trunk. Chant: VA-KRA-TUN-DA"
                },
                mahakaya: {
                  title: "Mahakaya - Great Body",
                  description: "Great cosmic form that holds the universe. Chant: MA-HA-KA-YA"
                }
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Suryakoti Bank"
              sceneId="vakratunda-grove"
              completionData={completionData}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                stopAllVoice();
                // Reset all local UI state
                setShowSceneCompletion(false);
                setShowMandala(false);
                setRevealConfig(null);
                setShowSparkle(null);
                setShowPowerOverlay(false);
                setOpeningButtonVisible(true);
                setVakratundaStage('intro');
                resetScene();
              }}
              onContinue={() => {
                onNavigate?.('scene-complete-continue');
              }}
            />

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaGroveSimplified;
