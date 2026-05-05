// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// FIXED: Removed SanskritWordMission, connected PowerUnlockOverlay directly to next phase

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './VakratundaGroveSimplified.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay'; // ← superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
// import { PauseButton, PauseMenu } from '../../../../lib/components/ui/PauseMenu'; // ← removed: replaced by home icon
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
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

// Game Components
import VakratundaGame from './VakratundaGame';
import MahakayaGame from './MahakayaGame';

// Character images
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';
import smartwatchScreen from '../assets/images/smartwatch-screen.webp';

// Images
import riverBackground from './assets/images/vakratundachant-bg-new2.svg';
import mooshikaCoach from "./assets/images/mooshika-coach.webp";
import symbolVakratunda from '../../../symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import symbolMahakaya from './assets/images/banyan-full-from-download.png';

// Elephant images for memory game
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';

// Singers & Rewards
import budVa from './assets/images/vakratunda/va-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';

// ========================================
// 1. LOCAL UI COMPONENTS
// ========================================

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
          vakratundaGameState: null,
          mahakayaGameState: null,
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

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));

  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);

  // Controls the Power Unlock Overlay (superseded by SymbolAutoReveal)
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showPowerButton, setShowPowerButton] = useState(false);
  const [showPracticeAgainButton, setShowPracticeAgainButton] = useState(false);

  // ── SymbolAutoReveal state ──────────────────────────────────────────────
  // null = not showing; object = reveal active
  const [revealConfig, setRevealConfig] = useState(null);

  const [currentWord, setCurrentWord] = useState(null);
  const { isAudioOn, toggleAudio, setAudioEnabled } = useAudioPreference();
  // Ref mirror — always in sync with isAudioOn state but readable synchronously
  // (used in effects/callbacks where React state batching can cause stale reads)
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const [showTapSparkles, setShowTapSparkles] = useState(false);

  // Pause Menu State — removed: replaced by home icon
  // const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Opening Modal State
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);

  const [savedRecordings, setSavedRecordings] = useState({});
  const [showAppDiscovery, setShowAppDiscovery] = useState(false);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showSceneCompletion ||
    showAppDiscovery ||
    sceneState.phase === PHASES.COMPLETE;

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

  const playGuidanceVoice = useCallback((key, onEnded) => {
    const webSpeechMap = {
      welcome: "Let's wake up the flowers together.",
      mahakayaGameStart: "Now Mahakaya… let's chant together.",
      instructionListen: 'Listen carefully.',
      instructionTapAndRepeat: 'Tap the little elephant… chant with him.',
      instructionTapTheElephant: 'Tap the little elephant… chant with him.',
      hintTapElephant: 'Tap the little elephant… chant with him.',
      hintLookForGlow: 'Look for the glowing elephant.',
      vakratundaSetup: 'You chanted… and the lotus opened.',
      vakratundaClaim: 'I find a new way.',
      mahakayaSetup: 'You chanted… and it grew tall and strong.',
      mahakayaClaim: 'You have that strength too.',
      sceneComplete: 'You opened the lotus. You grew it strong. Both powers — yours now.',
      instructionTapLotusWord: 'Tap the lotus.',
      instructionTapLotus: 'Tap the lotus.',
      instructionTapLotusUnlock: 'Tap the lotus.',
      instructionTapLilyWord: 'Tap the lily.',
      instructionTapLily: 'Tap the lily.',
      instructionTapLilyUnlock: 'Tap the lily.',
    };
    if (webSpeechMap[key]) {
      speakWebSpeech(webSpeechMap[key], onEnded);
      return;
    }
    if (onEnded) onEnded();
  }, [speakWebSpeech]);

  const stopAllVoice = useCallback(() => {
    stopVoice();
    stopWebSpeech();
  }, [stopVoice, stopWebSpeech]);


  // ── ESC key pause handler — REMOVED (replaced by home icon) ──
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

  // ── Auto-pause on blur — REMOVED (replaced by home icon) ──
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
    return () => clearAllTimeouts();
  }, []);

  useEffect(() => {
    return () => {
      stopWebSpeech();
    };
  }, [stopWebSpeech]);

  // ── SymbolAutoReveal helpers ──────────────────────────────────────────────

  // Play setup + affirmation VO when the flip card appears (SymbolAutoReveal)
  useEffect(() => {
    if (!revealConfig || !isAudioOn) return;
    const voMapSetup = {
      vakratunda: 'vakratundaSetup',
      mahakaya: 'mahakayaSetup'
    };
    const voMapClaim = {
      vakratunda: 'vakratundaClaim',
      mahakaya: 'mahakayaClaim'
    };
    const setupKey = voMapSetup[revealConfig.symbolId];
    const claimKey = voMapClaim[revealConfig.symbolId];
    if (!setupKey || !claimKey) return;
    // Delay 400ms so VO plays after card animation starts
    const id = setTimeout(() => {
      playGuidanceVoice(setupKey, () => {
        // After setup VO finishes, play affirmation VO
        playGuidanceVoice(claimKey);
      });
    }, 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, playGuidanceVoice]);

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

  // ── Home button: stop everything → go to main map ──────────────────────
  const handleHomeToMainMap = () => {
    stopAllVoice();
    stopIdleTimer();
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      localStorage.removeItem(`temp_session_${activeProfileId}_${zoneId}_${sceneId}`);
    }
    SimpleSceneManager.clearCurrentScene();
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
  useEffect(() => {
    if (isReload) {
      sceneActions.updateState({
        vakratundaGameState: null,
        mahakayaGameState: null,
      });
    }
  }, []); // intentionally runs only on mount

  // Memory game completion
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);

    // Sanskrit moment — full word learned → blessing gesture
    triggerMiniGesture('blessing', 'center', 2500);

    // Stop idle timer — game is done, no more hints
    stopIdleTimer();
    setCurrentPhase(null);

    // Play celebration VO
    if (isAudioOn) {
      playGuidanceVoice('chantWordReveal');
    }

    // Update State
    const chantKey = word === 'vakratunda' ? 'vakratunda-chant' : 'mahakaya-chant';
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [chantKey]: true },
      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
    });

    // Visuals — word celebration removed, game stays visible while VO plays
    setShowSparkle(`${word}-celebration`);
    playWord(word);

    // ── Transition: VO completes → SymbolAutoReveal ───────────────────────────
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
      if (word === 'mahakaya') {
        // mahakaya: after chantWordReveal, play word-reveal VO then reveal
        safeSetTimeout(() => {
          playGuidanceVoice('mahakaya-word-reveal', () => {
            triggerReveal();
          });
        }, 2000);
      } else {
        // vakratunda: chantWordReveal is sufficient, just reveal after delay
        safeSetTimeout(() => {
          triggerReveal();
        }, 2000);
      }
    } else {
      // Audio off fallback — short delay then reveal
      safeSetTimeout(() => {
        triggerReveal();
      }, 1500);
    }

    // ── Old goToPowerOverlay (superseded by SymbolAutoReveal) ──
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

  // ✅ FIXED: Direct transitions, no "Save Animal" mission
  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false);
    stopVoice(); // Stop any playing VO

    if (currentWord === 'vakratunda') {
      console.log('🔄 Moving to Mahakaya Phase');
      // Go straight to Mahakaya Game
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
        mahakayaGameState: null // Ensure Mahakaya always starts from first syllable
      });
    } else {
      console.log('📱 Showing App Discovery screen');
      // Show App Discovery screen before final celebration
      setShowAppDiscovery(true);
    }
  };

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    console.log('🎉 Triggering Final Celebration from App Discovery');

    // Play scene complete VO
    if (isAudioOn) {
      playGuidanceVoice('sceneComplete');
    }

    // Complete Scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });

    setShowSparkle('final-fireworks');
  };

  const handleElephantMicroWin = useCallback(() => {
    triggerMiniGesture('thumbsup', 'item', 1200);
    setShowTapSparkles(true);
    safeSetTimeout(() => setShowTapSparkles(false), 850);
  }, [triggerMiniGesture, safeSetTimeout]);

  // 🔄 Play Again - Replay the current word's game
  const handlePlayAgain = () => {
    setShowPowerOverlay(false);

    if (currentWord === 'vakratunda') {
      console.log('🔄 Replaying Vakratunda Game');
      // Reset vakratunda game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.VAKRATUNDA_GAME,
        vakratundaGameState: null, // Clear saved state to start fresh
        learnedWords: { ...sceneState.learnedWords, vakratunda: false }
      });
    } else if (currentWord === 'mahakaya') {
      console.log('🔄 Replaying Mahakaya Game');
      // Reset mahakaya game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
        mahakayaGameState: null, // Clear saved state to start fresh
        learnedWords: { ...sceneState.learnedWords, mahakaya: false }
      });
    }

    setCurrentWord(null);
  };

  // Unified State Saver
  const handleSaveComponentState = (componentType, componentState) => {
    const updatedState = {
      ...(componentType === 'vakratundaGame' && { vakratundaGameState: componentState }),
      ...(componentType === 'mahakayaGame' && { mahakayaGameState: componentState })
    };
    sceneActions.updateState(updatedState);
  };

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <ResumeCountdown value={countdownValue} />
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>
            {!showSceneCompletion && (
            <>

            {/* HOME BUTTON — inline green button removed; HomeButton component handles this */}

            {/* ── PauseButton — REMOVED (replaced by home icon) ──
            <PauseButton
              visible={sceneState.welcomeShown && !showSceneCompletion && !isFinalCelebrationActive}
              onClick={() => {
                if (isFinalCelebrationActive) return;
                stopVoice();
                stopIdleTimer();
                setShowPauseMenu(true);
              }}
            />
            ── End PauseButton ── */}

            {/* DEV TEST BUTTONS - Skip to word overlay */}
            {sceneState.welcomeShown && !showPowerOverlay && !showCenteredWord && (
              <div style={{
                position: 'fixed', top: 10, right: 10, zIndex: 99999,
                display: 'flex', gap: '6px', flexDirection: 'column'
              }}>
                <button
                  onClick={() => handlePhaseComplete('vakratunda')}
                  style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 'bold',
                    background: '#4ECDC4', color: '#fff', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', opacity: 0.85
                  }}
                >
                  ⚡ Test Vakratunda Reveal
                </button>
                <button
                  onClick={() => handlePhaseComplete('mahakaya')}
                  style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 'bold',
                    background: '#FF6B35', color: '#fff', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', opacity: 0.85
                  }}
                >
                  ⚡ Test Mahakaya Reveal
                </button>
              </div>
            )}

            {/* ── Pause blur overlay — REMOVED (replaced by home icon) ──
            {showPauseMenu && !isFinalCelebrationActive && (
              <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                zIndex: 999, pointerEvents: 'none',
                transition: 'opacity 0.2s ease-out', opacity: 1
              }} />
            )}
            ── End blur overlay ── */}

            {/* ── PauseMenu — REMOVED (replaced by home icon) ──
            <PauseMenu
              show={showPauseMenu && !isFinalCelebrationActive}
              onResume={() => { setShowPauseMenu(false); startIdleTimer(); }}
              onBackToMap={() => { setShowPauseMenu(false); onNavigate?.('zones'); }}
              isSoundOn={isAudioOn}
              onSoundToggle={() => { if (isAudioOn) stopVoice(); setIsAudioOn(!isAudioOn); }}
              zoneName="Shloka River"
            />
            ── End PauseMenu ── */}

            {/* 3. OPENING MODAL (Using Zone Theme Colors) */}
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              isOpen={!sceneState.welcomeShown}
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

            {/* VAKRATUNDA MEMORY GAME */}
            <VakratundaGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              onMicroWin={handleElephantMicroWin}
              onPhaseComplete={() => handlePhaseComplete('vakratunda')}
              onGameComplete={() => { }}
              profileName={profileName}
              getBudImage={() => budVa}
              getLotusImage={() => lotusVa}
              getBabyElephantImage={() => elephantBabyVa}
              selectedMode="auto"
              skipModeSelection={true}
              isReload={isReload}
              savedGameState={sceneState.vakratundaGameState}
              onSaveGameState={(state) => handleSaveComponentState('vakratundaGame', state)}
              voiceGuidance={{ playVoice: playGuidanceVoice, playSfx, stopVoice: stopAllVoice, characterImage: mooshikaCoach }}
              isPaused={isRecorderOpen}
              startRound={3}
            />

            {/* MAHAKAYA MEMORY GAME */}
            <MahakayaGame
              isActive={sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              powerGained={sceneState.learnedWords?.vakratunda}
              onMicroWin={handleElephantMicroWin}
              onPhaseComplete={() => handlePhaseComplete('mahakaya')}
              onGameComplete={() => { }}
              profileName={profileName}
              getSeedImage={() => seedImage}
              getFlowerImage={() => flowerMa}
              getAdultElephantImage={() => elephantMa}
              selectedMode="auto"
              skipModeSelection={true}
              isReload={isReload}
              savedGameState={sceneState.mahakayaGameState}
              onSaveGameState={(state) => handleSaveComponentState('mahakayaGame', state)}
              voiceGuidance={{ playVoice: playGuidanceVoice, playSfx, stopVoice: stopAllVoice, characterImage: mooshikaCoach }}
              isPaused={isRecorderOpen}
              startRound={3}
            />

            {/* PERSISTENT BOY CHARACTER (Commented out per user request) */}
            {/* {sceneState.welcomeShown && !showSceneCompletion && (
              <div className="vakratunda-companion-boy">
                <img src={boyNamaste} alt="Learning with you" className="vakratunda-boy-companion" />
              </div>
            )} */}

            {showTapSparkles && (
              <div className="vakratunda-tap-sparkles">
                <SparkleAnimation
                  type="magic"
                  count={14}
                  color="#FFD54F"
                  size={9}
                  duration={850}
                  area="full"
                />
              </div>
            )}

            {/* ── SYMBOL AUTO-REVEAL (replaces PowerUnlockOverlay) ───────────────
                 Flip card: symbol image → affirmation → user taps → flies to sidebar */}
            {revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sidebarTargetRect={revealConfig.sidebarTarget}
                zoneId={zoneId}
                sceneId={sceneId}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* ── PowerUnlockOverlay — COMMENTED OUT (superseded by SymbolAutoReveal) ──
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
                      ? 'I am strong inside.'
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
            ── End PowerUnlockOverlay ── */}

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
                  isReload={isReload}
                  onPopupOpen={() => {
                    console.log("🎤 Recorder Opening - Pausing Game");
                    stopAllVoice();
                    stopIdleTimer();
                    setIsRecorderOpen(true);
                  }}
                  onPopupClose={() => {
                    console.log("🎤 Recorder Closing - Resuming Game");
                    setIsRecorderOpen(false);
                    // Only restart idle timer if we're in an active game phase (not celebration/overlay/complete)
                    const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
                    if (activeGamePhases.includes(sceneState.phase) && !showPowerOverlay && !showCenteredWord) {
                      startIdleTimer();
                    }
                  }}
                />
              )}

            {/* ── GANESHA MICRO-REWARD GESTURE CUE ────────────────────────────────
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

                    // Save completion data
                    const profileId = localStorage.getItem('activeProfileId');
                    if (profileId) {
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
                        localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
                        SimpleSceneManager.clearCurrentScene();
                      } catch (error) {
                        console.error('Error saving game state:', error);
                      }
                    }
                    setShowSceneCompletion(true);
                  }}
                />
              </>
            )}
            </>
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion}
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
              completionData={{
                stars: 5,
                syllables: sceneState.learnedSyllables,
                words: sceneState.learnedWords,
                completed: true
              }}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                // Block VO immediately via ref — resetScene() delays 100ms internally so
                // the welcome VO effect fires after this event handler. Ref ensures it reads false.
                audioEnabledRef.current = false;
                setAudioEnabled(false);
                setVoiceVolume(0); // mute any currently playing VO narration
                stopAllVoice();    // stop it outright (safe — scene is resetting)
                // Reset all local UI state
                setShowSceneCompletion(false);
                setRevealConfig(null);
                setShowSparkle(null);
                setShowPowerOverlay(false);
                setOpeningButtonVisible(true); // Show button straight away (audio is off = no VO to wait for)
                resetScene();
              }}
              onContinue={() => {
                onNavigate?.('scene-complete-continue');
              }}
            />

            <ProgressiveHintSystem
              ref={useRef(null)}
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
