// zones/symbol-mountain/scenes/modak/NewModakSceneV7_MVP.jsx
// MVP Version: Voice-guided, minimal UI (no header, no help menu)
// Like Khan Academy Kids / Lingokids approach

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ModakScene.css';
import '../../../../lib/styles/zone-themes.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';

// Unified Components (keep buttons/modals, remove header)
import UnifiedButtonV2 from '../../../../lib/components/ui/Button/UnifiedButtonV2';
import UnifiedModal from '../../../../lib/components/ui/Modal/UnifiedModal';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';

// Analytics
import { Analytics } from '../../../../lib/services/analytics';

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';

// Shared countdown duration — must match across useVoiceGuidance + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

// Synthesized Sound Effects



import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';


import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Symbol Collection Hook (flight animation → sidebar bloom → overlay) ï¿½ superseded by SymbolAutoReveal
// import useSymbolCollection from '../../../../lib/hooks/useSymbolCollection';

// Content Configs
import {
  getOpeningModal,
  getCompletionModal
} from '../../../../lib/config/content';

// Shared Components
import OpeningModal from '../../../shared/components/OpeningModal';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
// import Fireworks from '../../../../lib/components/feedback/Fireworks'; // ? replaced by FireworksCompletion
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay';

// Images
//import forestBackground from './assets/images/forest-background.png';
import forestBackground from './assets/images/modak-game-bg.webp';
import foregroundOverlay from './assets/images/modak-game-overlay.png';
import modak1 from './assets/images/modak-new.png';
import modak2 from './assets/images/modak-new.png';
import modak3 from './assets/images/modak-new.png';
import basket from './assets/images/modak-plate.png';
import mooshika from './assets/images/mooshika-new.png';
import mudMound from './assets/images/mound.svg';
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.png';
import mooshikaBefore from './assets/images/mooshika-before.webp';
import mooshikaAfter from './assets/images/mooshika-after.webp';
import modakBefore from './assets/images/modak-before.webp';
import modakAfter from './assets/images/modak-after.webp';
import bellyBefore from './assets/images/belly-before.webp';
import bellyAfter from './assets/images/belly-after.webp';
import ganeshaCharacter from './assets/images/ganesha-character.webp';

// ========================================
// VO-GATED BUTTON COMPONENT
// ========================================
const VOGatedButton = ({
  visible,
  onClick,
  children,
  className = '',
  style = {}
}) => {
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
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </button>
  );
};

const PHASES = {
  MOOSHIKA_SEARCH: 'mooshika_search',
  MOOSHIKA_FOUND: 'mooshika_found',
  MODAKS_UNLOCKED: 'modaks_unlocked',
  SOME_COLLECTED: 'some_collected',
  ALL_COLLECTED: 'all_collected',
  BASKET_READY: 'basket_ready',
  ROCK_VISIBLE: 'rock_visible',
  ROCK_FEEDING: 'rock_feeding',
  ROCK_TRANSFORMED: 'rock_transformed',
  COMPLETE: 'complete'
};
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MODAK_POSITION_SLOTS = [
  { top: '43.3%', left: '8.2%' },
  { top: '36%', left: '26.6%' },
  { top: '48.7%', left: '84.5%' },
  { top: '40%', left: '68.1%' },
  { top: '35%', left: '66.8%' },
  { top: '40.9%', left: '15.8%' },
  { top: '35%', left: '38.3%' },
  { top: '38.5%', left: '3.2%' }
];
const SHOW_MODAK_SLOT_DEBUG = false;
const SHOW_ALL_MODAK_SLOTS_PREVIEW = false;
const GANESHA_SIT_FEED_IMAGE = '/images/ganesha-sit.svg';

const pickRandomModakSlots = () => {
  const indices = MODAK_POSITION_SLOTS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, 3);
};

const getFeedingGaneshaScale = (feedCount, transformed) => {
  const growthSteps = [0.72, 0.82, 0.94, 1.08];
  const stepIndex = Math.min(Math.max(feedCount, 0), growthSteps.length - 1);
  const baseScale = growthSteps[stepIndex];
  return transformed ? Math.max(baseScale, 1.5) : baseScale;
};

const MODAK_WEB_SPEECH_VO = {
  welcome: "Mooshika is nearby. Let's find the sweet modaks.",
  findMooshika: 'Mooshika is hiding. Tap the mounds to find him.',
  findMooshikaIdle: "Tap the little hills. He's in one!",
  mooshikaFound: 'There he is... my little friend.',
  focusPower: 'You looked closely... and found him. Say it with me... I can focus.',
  collectStart: 'Look... sweet modaks. Tap them to collect.',
  collectIdleHint: 'Look near the trees. Tap the modaks.',
  sharingPower: 'You found them... one by one. That feels good. Say it with me... I am full of joy.',
  feedGanesha: "Lets enjoy the sweet modaks. Drag them to me",
  feedIdleHint: 'Drag a modak to me.',
  gratitudePower: 'You gave... and it felt good. Say it with me... I feel good inside.',
  sceneComplete: 'You found Mooshika. You felt joy. You feel good inside. All yours.',
};

const MODAK_WEB_SPEECH_MOMENT = {
  welcome: 'greeting',
  findMooshika: 'default',
  findMooshikaIdle: 'default',
  mooshikaFound: 'celebration',
  focusPower: 'encouragement',
  collectStart: 'default',
  collectIdleHint: 'default',
  sharingPower: 'encouragement',
  feedGanesha: 'default',
  feedIdleHint: 'default',
  gratitudePower: 'gratitude',
  sceneComplete: 'celebration',
};

const powerConfig = {
  mooshika: {
    name: 'Divine Guidance',
    image: symbolMooshikaColored,
    color: '#FF69B4'
  },
  modak: {
    name: 'Sweet Blessing',
    image: symbolModakColored,
    color: '#FFD700'
  },
  belly: {
    name: 'Cosmic Container',
    image: symbolBellyColored,
    color: '#FF8C42'
  }
};

const missionImages = {
  mooshika: { before: mooshikaBefore, after: mooshikaAfter },
  modak: { before: modakBefore, after: modakAfter },
  belly: { before: bellyBefore, after: bellyAfter }
};

// Error Boundary
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

const NewModakSceneMVP = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'modak'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          moundStates: [0, 0, 0, 0, 0],
          correctMound: Math.floor(Math.random() * 5) + 1,
          mooshikaVisible: false,
          mooshikaFound: false,
          mooshikaPosition: { top: '45%', left: '25%' },
          moundsVanished: false,
          moundsVanishing: false,

          modakStates: [0, 0, 0],
          modakSlotIndices: pickRandomModakSlots(),
          modaksUnlocked: false,
          basketVisible: false,
          basketFull: false,
          basketReady: false,
          collectedModaks: [],

          rockVisible: false,
          rockFeedCount: 0,
          rockTransformed: false,
          rockBellySize: 0,

          phase: PHASES.MOOSHIKA_SEARCH,
          currentFocus: 'mooshika',
          discoveredSymbols: {},

          welcomeShown: false,

          currentPopup: null,
          showingCompletionScreen: false,

          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <NewModakSceneMVPContent
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

const NewModakSceneMVPContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState || !sceneActions) {
    return <div>Loading scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.MOOSHIKA_SEARCH });

  // Backfill randomized modak slots for older saved state objects.
  useEffect(() => {
    const hasValidSlots = Array.isArray(sceneState?.modakSlotIndices) && sceneState.modakSlotIndices.length === 3;
    if (!hasValidSlots) {
      sceneActions.updateState({ modakSlotIndices: pickRandomModakSlots() });
    }
  }, [sceneState?.modakSlotIndices, sceneActions]);

  // Reload hygiene: once we're beyond mound-search/found phases, never render mound fade state again.
  useEffect(() => {
    const phase = sceneState?.phase;
    if (!phase) return;
    const pastMoundPhase = ![PHASES.MOOSHIKA_SEARCH, PHASES.MOOSHIKA_FOUND].includes(phase);
    if (!pastMoundPhase) return;
    if (sceneState.moundsVanished && !sceneState.moundsVanishing) return;
    sceneActions.updateState({
      moundsVanishing: false,
      moundsVanished: true
    });
  }, [sceneState?.phase, sceneState?.moundsVanished, sceneState?.moundsVanishing, sceneActions]);

  // ========================================
  // VOICE GUIDANCE HOOK
  // ========================================

  // Keep a live ref to sceneState so onReturnHint never has stale closures
  const sceneStateRef = useRef(sceneState);
  sceneStateRef.current = sceneState;

  // Stable callback passed to useVoiceGuidance; actual impl assigned after safeSetTimeout is ready
  const onReturnHintImplRef = useRef(null);
  const onReturnHint = useCallback(() => onReturnHintImplRef.current?.(), []);

  const {
    stopVoice: stopRecordedVoice,
    setVoiceVolume,
    startMusic,
    stopMusic,
    startIdleTimer,
    stopIdleTimer,
    setCurrentPhase,
    recordInteraction,
    playTap,
    playSfx
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: true,
    musicVolume: 0.1,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 20,
    resumeDelay: RESUME_DELAY_MS,  // waits for countdown before replaying VO / music
    onReturnHint,                  // called when child returns with no VO queued
  });

  // Refs that point to pauseCelebrationTransition / resumeCelebrationTransition
  // (defined later in the component — assigned after their definitions below)
  const pauseCelebRef = useRef(null);
  const resumeCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    resumeCelebRef.current?.();
    // Reset hints so return starts a fresh 10s/18s/26s ladder.
    setHintResetKey(k => k + 1);
  }, []);

  // Drop-in for safeSetTimeout — auto-pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,  // timers resume in sync with audio after countdown
  });

  // 3-2-1 countdown display — fires immediately on tab show (no delay),
  // so the visual matches the 3000ms audio/timer resume delay above.
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  const playUiTap = playTap;
  const playSoftWrong = useCallback(() => playSfx('softWrong'), [playSfx]);
  const playDiscovery = useCallback(() => playSfx('discovery'), [playSfx]);
  const playRevealBloom = useCallback(() => playSfx('revealBloom'), [playSfx]);
  const playPlace = useCallback(() => playSfx('place'), [playSfx]);
  const playTransition = useCallback(() => playSfx('transition'), [playSfx]);
  const playEmotionalGlow = useCallback(() => playSfx('emotionalGlow'), [playSfx]);
  const playCelebrationSfx = useCallback(() => playSfx('celebration'), [playSfx]);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const wasAudioOnRef = useRef(isAudioOn);
  // -- SymbolAutoReveal state ----------------------------------------------
  // null = not showing; object = reveal active
  const [revealConfig, setRevealConfig] = useState(null);

  const stopVoice = useCallback(() => {
    stopRecordedVoice();
    stopSpokenVoice();
  }, [stopRecordedVoice, stopSpokenVoice]);

  // Web Speech VO adapter for the locked Modak V7 script.
  // Keeps all existing playVoice(key, onEnded) trigger points intact.
  const playVoice = useCallback((key, onEnded, _options = {}) => {
    stopRecordedVoice();
    const text = MODAK_WEB_SPEECH_VO[key];

    if (!text) {
      onEnded?.();
      return;
    }

    if (!isAudioOn) {
      onEnded?.();
      return;
    }

    speak(text, {
      age: 7,
      moment: MODAK_WEB_SPEECH_MOMENT[key] || 'default',
      onEnd: onEnded || null,
      onError: () => onEnded?.(),
    });
  }, [isAudioOn, speak, stopRecordedVoice]);

  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;

    if (!wasAudioOn && isAudioOn) {
      if (sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown) {
        playVoice('welcome');
        return;
      }

      if (revealConfig?.symbolId) {
        const voMap = {
          mooshika: 'focusPower',
          modak: 'sharingPower',
          belly: 'gratitudePower'
        };
        const voKey = voMap[revealConfig.symbolId];
        if (voKey) {
          playVoice(voKey, null, { replayOnReturn: true });
          return;
        }
      }

      const phase = getCurrentGamePhase();
      if (phase) replayInitialInstruction(phase);
    }
  }, [isAudioOn, sceneState.phase, sceneState.welcomeShown, revealConfig, playVoice]);

  // ── Idle hint (glow ring + gesture) ─────────────────────────────────────
  // Wire AudioToggle → VO volume: mutes narration only, SFX + game flow unaffected
  useEffect(() => {
    setVoiceVolume(0);
    if (!isAudioOn) {
      stopSpokenVoice();
    }
  }, [isAudioOn, setVoiceVolume, stopSpokenVoice]);

  // Analytics: scene started on mount
  useEffect(() => {
    Analytics.sceneStarted(zoneId, sceneId);
    return () => {
      // If scene unmounts without completing, count as abandoned
      if (!sceneState?.completed) {
        Analytics.sceneAbandoned(zoneId, sceneId);
      }
    };
  }, []);

  // Get content from configs
  const openingModalContent = getOpeningModal(zoneId, sceneId);
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showMooshikaSpeech, setShowMooshikaSpeech] = useState(false);
  const [mooshikaSpeechMessage, setMooshikaSpeechMessage] = useState('');

  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);
  const [showDiscoveryFlip3, setShowDiscoveryFlip3] = useState(false);
  const [showSymbolDiscovery, setShowSymbolDiscovery] = useState(false);

  // -- useSymbolCollection (superseded by SymbolAutoReveal) ----------------
  // const [currentOverlaySymbol, setCurrentOverlaySymbol] = useState(null);
  // const { flyingSymbol, flightStyle, animatingSymbol, showOverlay: symbolCollectOverlay,
  //         handleCollect, closeOverlay: closeSymbolOverlay }
  //   = useSymbolCollection({ onCollectSound: () => playSfx('chime') });

  // Track final celebration completion (VO + fireworks sync)
  const [sceneCompleteVOFinished, setSceneCompleteVOFinished] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);

  // Drag tutorial hint — shown once when rock first appears
  const [showDragHint, setShowDragHint] = useState(false);
  const hasShownDragHintRef = useRef(false);
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const [wrongMoundIndex, setWrongMoundIndex] = useState(null);
  const [wrongMoundPuff, setWrongMoundPuff] = useState(null);
  const wrongMoundShakeTimerRef = useRef(null);
  const wrongMoundPuffTimerRef = useRef(null);
  const idleHintsEnabled = true;
  const miniGestureTimerRef = useRef(null);
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0
  });

  // Incremented each time the child returns from a tab switch (after countdown).
  // Adding this to the hint effects forces a full reset:
  // clear visuals, idle level=0, and restart the 10s/18s/26s ladder.
  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const phase1IdleVoPlayedRef = useRef(false);
  const modakIdleVoPlayedRef = useRef(false);
  const feedIdleVoPlayedRef = useRef(false);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const resetIdleBaseline = useCallback(() => {
    lastIdleInteractionAtRef.current = Date.now();
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
  }, []);

  const triggerMiniGesture = useCallback((target = 'center', durationMs = 1500) => {
    if (miniGestureTimerRef.current) {
      clearTimeout(miniGestureTimerRef.current);
      miniGestureTimerRef.current = null;
    }
    setMiniGesture(prev => ({
      show: true,
      target,
      durationMs,
      key: prev.key + 1
    }));
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture(prev => ({ ...prev, show: false }));
      miniGestureTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (wrongMoundShakeTimerRef.current) {
        clearTimeout(wrongMoundShakeTimerRef.current);
        wrongMoundShakeTimerRef.current = null;
      }
      if (wrongMoundPuffTimerRef.current) {
        clearTimeout(wrongMoundPuffTimerRef.current);
        wrongMoundPuffTimerRef.current = null;
      }
    };
  }, []);

  // ========================================
  // TIMER / FLOW STATE
  // ========================================
  // timeoutsRef removed — safeSetTimeout now comes from usePauseAwareTimeout above

  // 🔧 Track symbol sidebar popup state for celebration pausing
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const symbolPopupSessionOpenRef = useRef(false);
  const celebrationTimeoutRef = useRef(null);
  const celebrationTimeRemainingRef = useRef(0);
  const celebrationPauseTimeRef = useRef(0);
  const celebrationTypeRef = useRef(null); // 'flip1', 'flip2', or 'flip3'
  const celebrationRunIdRef = useRef(0);

  // Track if initial instruction has completed for each phase
  const [initialInstructionPlayed, setInitialInstructionPlayed] = useState({
    findMooshika: false,
    collectModaks: false,
    shareWithGanesha: false
  });

  const isCelebrationOrOverlayActive =
    showSceneCompletion ||
    isSymbolPopupOpen ||
    showDiscoveryFlip1 ||
    showDiscoveryFlip2 ||
    showDiscoveryFlip3 ||
    !!revealConfig ||          // Block while SymbolAutoReveal is showing
    sceneState.phase === PHASES.ALL_COLLECTED || // Block during modak completion ? reveal transition
    sceneState.phase === PHASES.ROCK_TRANSFORMED; // Block during feeding completion ? reveal transition

  // Phase-aware hint when child returns from a tab switch with no VO queued (Bug 3).
  // Uses refs so the callback never has stale closures.
  const isCelebRef = useRef(false);
  isCelebRef.current = isCelebrationOrOverlayActive;
  onReturnHintImplRef.current = () => {
    const s = sceneStateRef.current;
    if (!s?.welcomeShown || isCelebRef.current) return;
    const phase = s.phase;
    safeSetTimeout(() => {
      if (phase === PHASES.MOOSHIKA_SEARCH) {
        resetIdleBaseline();
        phase1IdleVoPlayedRef.current = false;
        playVoice('findMooshika');
        setCurrentPhase('findMooshika');
      } else if (phase === PHASES.MOOSHIKA_FOUND) {
        // SymbolAutoReveal card flip is about to show — stop any replayed VO
        // so it doesn't talk over the flip animation.
        stopVoice();
      } else if (phase === PHASES.MODAKS_UNLOCKED || phase === PHASES.SOME_COLLECTED) {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
      } else if (phase === PHASES.ROCK_VISIBLE || phase === PHASES.ROCK_FEEDING) {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
      }
    }, 500);
  };

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showSceneCompletion;

  const showPersistentEndOverlay =
    showSparkle === 'final-fireworks' &&
    !showSceneCompletion;

  // Get current game phase for initial instruction tracking
  const getCurrentGamePhase = () => {
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH) return 'findMooshika';
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) return 'collectModaks';
    if (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) return 'shareWithGanesha';
    return null;
  };

  // Replay initial instruction with callback to mark as complete
  const replayInitialInstruction = (phase) => {
    if (phase === 'findMooshika') {
      resetIdleBaseline();
      phase1IdleVoPlayedRef.current = false;
      playVoice('findMooshika', () => {
        setInitialInstructionPlayed(prev => ({ ...prev, findMooshika: true }));
      });
      setCurrentPhase('findMooshika');
    } else if (phase === 'collectModaks') {
      resetIdleBaseline();
      modakIdleVoPlayedRef.current = false;
      playVoice('collectStart', () => {
        setInitialInstructionPlayed(prev => ({ ...prev, collectModaks: true }));
      });
      setCurrentPhase('collectModaks');
    } else if (phase === 'shareWithGanesha') {
      resetIdleBaseline();
      feedIdleVoPlayedRef.current = false;
      playVoice('feedGanesha', () => {
        setInitialInstructionPlayed(prev => ({ ...prev, shareWithGanesha: true }));
      });
      setCurrentPhase('shareWithGanesha');
    }
  };

  // Restore phase context for idle hints (NO VO played)
  const restoreCurrentPhase = () => {
    if (!sceneState?.welcomeShown || isCelebrationOrOverlayActive) return;

    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH) {
      setCurrentPhase('findMooshika');
    } else if (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) {
      setCurrentPhase('collectModaks');
    } else if (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) {
      setCurrentPhase('shareWithGanesha');
    }
  };

  const handlePauseCore = () => {
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
  };

  const resumePhaseAfterPause = () => {
    // Final celebration path: only resume sceneComplete VO if fireworks are actually playing
    // NOT during symbol discovery screen (which happens before fireworks)
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && !sceneCompleteVOFinished && showSparkle === 'final-fireworks') {
      console.log('[final-celebration] resume final VO after popup close');
      playVoice('sceneComplete', () => {
        console.log('✅ Scene complete VO finished');
        setSceneCompleteVOFinished(true);
      });
      return;
    }

    if (!sceneState?.welcomeShown || isCelebrationOrOverlayActive) return;

    const currentGamePhase = getCurrentGamePhase();

    // SPECIAL CASE: Replay completion VOs during transition phases
    // This handles the gap between completion and power overlay
    if (sceneState.phase === PHASES.ALL_COLLECTED) {
      if (idleHintsEnabled) startIdleTimer();
      return;
    }

    if (sceneState.phase === PHASES.ROCK_TRANSFORMED) {
      if (idleHintsEnabled) startIdleTimer();
      return;
    }

    // If initial instruction hasn't finished playing, replay it
    if (currentGamePhase && !initialInstructionPlayed[currentGamePhase]) {
      replayInitialInstruction(currentGamePhase);
      if (idleHintsEnabled) startIdleTimer();
    } else {
      // Initial instruction already played - use silent resume + idle timer
      restoreCurrentPhase();
      if (idleHintsEnabled) startIdleTimer();
    }
  };

  const handleSymbolPopupOpen = useCallback(() => {
    // Guard against duplicate open callbacks from nested click/close timing.
    if (symbolPopupSessionOpenRef.current) return;
    symbolPopupSessionOpenRef.current = true;

    console.log('[symbol-popup] opened');
    console.log('📊 Celebration state:', {
      hasTimeout: !!celebrationTimeoutRef.current,
      type: celebrationTypeRef.current,
      remaining: celebrationTimeRemainingRef.current
    });

    setIsSymbolPopupOpen(true);

    // Same as pause: stop VOs and timers
    handlePauseCore();
    resetIdleBaseline();

    // Pause pending celebration transition, if any.
    if (pauseCelebrationTransition()) {
      console.log(
        `[symbol-popup] paused celebration type=${celebrationTypeRef.current} remaining=${celebrationTimeRemainingRef.current}ms`
      );
    } else {
      console.log('[symbol-popup] no active celebration timer to pause');
    }
  }, [handlePauseCore, resetIdleBaseline]);

  const handleSymbolPopupClose = useCallback(() => {
    // Guard against duplicate close callbacks causing double VO resume.
    if (!symbolPopupSessionOpenRef.current) return;
    symbolPopupSessionOpenRef.current = false;

    console.log('[symbol-popup] closed');
    setIsSymbolPopupOpen(false);
    resetIdleBaseline();

    // Same as resume: replay initial instruction or silent resume
    resumePhaseAfterPause();

    // Resume celebration timeout if it was paused.
    if (celebrationTimeRemainingRef.current > 0 && celebrationTypeRef.current) {
      console.log(
        `[symbol-popup] resuming celebration type=${celebrationTypeRef.current} in=${celebrationTimeRemainingRef.current}ms`
      );
      resumeCelebrationTransition();
    }
  }, [resetIdleBaseline, resumePhaseAfterPause]);

  // ========================================
  // VO-GATED STATE MACHINE
  // Listen = VO playing, no button
  // Ready = VO done, button visible
  // ========================================
  const [appState, setAppState] = useState('listen'); // 'listen' | 'ready' | 'play'
  const [openingButtonVisible] = useState(true);
  const [discoveryButtonVisible, setDiscoveryButtonVisible] = useState(false);

  // Configuration for the Overlay Text/Images
  const discoveryConfig = {
    mooshika: {
      foundTitle: "You Found Mooshika!",
      foundSubtitle: "He has something magical to share...",
      powerName: "Divine Guidance",
      image: symbolMooshikaColored
    },
    modak: {
      foundTitle: "You Collected All Modaks!",
      foundSubtitle: "A sweet reward appears...",
      powerName: "Sweet Blessing",
      image: symbolModakColored
    },
    belly: {
      foundTitle: "Ganesha is Full!",
      foundSubtitle: "His belly glows with cosmic energy...",
      powerName: "Cosmic Container",
      image: symbolBellyColored
    }
  };

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // safeSetTimeout is provided by usePauseAwareTimeout — auto-pauses on tab hide

  const clearCelebrationTimer = () => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
  };

  const completeCelebrationTransition = (type) => {
    if (type === 'flip1') setShowDiscoveryFlip1(true);
    else if (type === 'flip2') setShowDiscoveryFlip2(true);
    else if (type === 'flip3') setShowDiscoveryFlip3(true);

    celebrationTimeoutRef.current = null;
    celebrationTimeRemainingRef.current = 0;
    celebrationPauseTimeRef.current = 0;
    celebrationTypeRef.current = null;
  };

  const scheduleCelebrationTransition = (type, delayMs) => {
    clearCelebrationTimer();
    celebrationRunIdRef.current += 1;
    const runId = celebrationRunIdRef.current;

    celebrationTypeRef.current = type;
    celebrationTimeRemainingRef.current = delayMs;
    celebrationPauseTimeRef.current = Date.now();
    console.log(`[celebration][${type}] start delay=${delayMs}ms runId=${runId}`);

    celebrationTimeoutRef.current = setTimeout(() => {
      if (runId !== celebrationRunIdRef.current) {
        console.log(
          `[celebration][${type}] stale-callback ignored callbackRunId=${runId} activeRunId=${celebrationRunIdRef.current}`
        );
        return;
      }
      console.log(`[celebration][${type}] complete -> show overlay runId=${runId}`);
      completeCelebrationTransition(type);
    }, delayMs);
  };

  const pauseCelebrationTransition = () => {
    if (!celebrationTimeoutRef.current || !celebrationTypeRef.current) return false;

    const type = celebrationTypeRef.current;
    clearCelebrationTimer();
    const elapsed = Date.now() - celebrationPauseTimeRef.current;
    celebrationTimeRemainingRef.current = Math.max(
      0,
      celebrationTimeRemainingRef.current - elapsed
    );
    console.log(
      `[celebration][${type}] pause elapsed=${elapsed}ms remaining=${celebrationTimeRemainingRef.current}ms`
    );
    return true;
  };

  const resumeCelebrationTransition = () => {
    if (celebrationTimeRemainingRef.current <= 0 || !celebrationTypeRef.current) return false;

    celebrationRunIdRef.current += 1;
    const runId = celebrationRunIdRef.current;
    const type = celebrationTypeRef.current;
    const remaining = celebrationTimeRemainingRef.current;

    celebrationPauseTimeRef.current = Date.now();
    console.log(`[celebration][${type}] resume remaining=${remaining}ms runId=${runId}`);
    celebrationTimeoutRef.current = setTimeout(() => {
      if (runId !== celebrationRunIdRef.current) {
        console.log(
          `[celebration][${type}] stale-resume-callback ignored callbackRunId=${runId} activeRunId=${celebrationRunIdRef.current}`
        );
        return;
      }
      console.log(`[celebration][${type}] complete-after-resume -> show overlay runId=${runId}`);
      completeCelebrationTransition(type);
    }, remaining);
    return true;
  };

  // Keep refs in sync so usePauseAwareTimeout can call them on tab hide/show
  pauseCelebRef.current = pauseCelebrationTransition;
  resumeCelebRef.current = resumeCelebrationTransition;

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      clearCelebrationTimer();
      if (miniGestureTimerRef.current) {
        clearTimeout(miniGestureTimerRef.current);
        miniGestureTimerRef.current = null;
      }
      celebrationRunIdRef.current += 1;
      stopMusic();
      if (idleHintsEnabled) stopIdleTimer();
    };
  }, []);

  // ========================================
  // RELOAD / RESUME LOGIC
  // Handles resetting partial progress or restoring popups
  // ========================================
  useEffect(() => {
    if (!sceneState) return;

    // 1. RESET PARTIAL MOUND SEARCH
    // If user clicked some mounds but didn't find Mooshika, reset to start.
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH && sceneState.welcomeShown) {
      const hasClicks = sceneState.moundStates?.some(state => state === 1);
      if (hasClicks) {
        sceneActions.updateState({
          moundStates: [0, 0, 0, 0, 0] // Reset all mounds
        });
      }
    }

    // 2. RESTORE MOOSHIKA CARD FLIP (Power Unlock 1)
    // Mooshika found but card flip (SymbolAutoReveal) not yet shown.
    // Old system used showDiscoveryFlip1 — now we trigger setRevealConfig directly.
    // Short delay so Mooshika has time to render in her saved position first.
    if (sceneState.phase === PHASES.MOOSHIKA_FOUND) {
      setTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'mooshika',
          symbolImage: symbolMooshikaColored,
          symbolName: 'Mooshika',
          affirmation: 'I can focus.',
          sidebarTarget: getSidebarTarget('mooshika')
        });
      }, 1200);
    }

    // 3. RESET PARTIAL MODAK COLLECTION
    // If user collected 1 or 2 modaks (but not 3), reset them to the forest.
    if (sceneState.phase === PHASES.SOME_COLLECTED) {
      sceneActions.updateState({
        phase: PHASES.MODAKS_UNLOCKED,
        collectedModaks: [],
        modakStates: [0, 0, 0], // All visible in forest
        basketFull: false,
        progress: { percentage: 30 } // Reset progress bar visual
      });
      // Replay collect instruction VO on reload
      setTimeout(() => {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 3b. REPLAY VO for modak collection phase on reload
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED && sceneState.modaksUnlocked) {
      setTimeout(() => {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 4. RESTORE MODAK CARD FLIP (Power Unlock 2)
    // All modaks collected but SymbolAutoReveal for modak not yet shown.
    // Old system used showDiscoveryFlip2 — now trigger setRevealConfig directly.
    if (sceneState.phase === PHASES.ALL_COLLECTED && !sceneState.rockVisible) {
      setTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I am full of joy.',
          sidebarTarget: getSidebarTarget('modak')
        });
      }, 1200);
    }

    // 5. RESET PARTIAL FEEDING
    // If user fed 1 or 2 modaks to the rock, refill the basket to start feeding over.
    if (sceneState.phase === PHASES.ROCK_FEEDING) {
      hasShownDragHintRef.current = true; // Don't re-show drag hint on reload
      sceneActions.updateState({
        phase: PHASES.ROCK_VISIBLE, // Go back to step before feeding
        rockFeedCount: 0,
        rockBellySize: 0,
        collectedModaks: [0, 1, 2], // Refill basket with 3 modaks
        basketFull: true
      });
      // Replay feed instruction VO on reload
      setTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 5b. REPLAY VO for feeding phase on reload
    if (sceneState.phase === PHASES.ROCK_VISIBLE && sceneState.rockVisible) {
      hasShownDragHintRef.current = true; // Don't re-show drag hint on reload
      setTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 6. RESTORE BELLY CARD FLIP (Power Unlock 3)
    // Rock transformed but SymbolAutoReveal for belly not yet shown.
    // Old system used showDiscoveryFlip3 — now trigger setRevealConfig directly.
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && !sceneState.completed) {
      hasShownDragHintRef.current = true; // Don't re-show drag hint on reload
      setTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'belly',
          symbolImage: symbolBellyColored,
          symbolName: 'Big Belly',
          affirmation: 'I feel good inside.',
          sidebarTarget: getSidebarTarget('belly')
        });
      }, 1200);
    }
    // Defensive repair: stale save may mark completed during belly reveal phase.
    // Reset and restore belly card instead of treating scene as done.
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && sceneState.completed) {
      hasShownDragHintRef.current = true;
      sceneActions.updateState({
        completed: false,
        showingCompletionScreen: false,
        phase: PHASES.ROCK_TRANSFORMED
      });
      setTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'belly',
          symbolImage: symbolBellyColored,
          symbolName: 'Big Belly',
          affirmation: 'I feel good inside.',
          sidebarTarget: getSidebarTarget('belly')
        });
      }, 300);
    }

  }, []); // Empty dependency array ensures this runs only ONCE on reload

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button appears only after VO finishes
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is MOOSHIKA_SEARCH and not yet started)
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown) {
      if (!isAudioOn) return;
      // Small delay before starting welcome VO
      const timer = setTimeout(() => {
        // Button shows immediately from start
        playTransition();
        setAppState('ready');
        playVoice('welcome');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn]);

  // ========================================
  // VOICE: Play instruction after game starts
  // ========================================
  useEffect(() => {
    if (sceneState.welcomeShown && sceneState.phase === PHASES.MOOSHIKA_SEARCH) {
      // Start background music
      startMusic();
      // Play find mooshika instruction
      setTimeout(() => {
        resetIdleBaseline();
        phase1IdleVoPlayedRef.current = false;
        playVoice('findMooshika', () => {
          // Mark initial instruction as complete
          setInitialInstructionPlayed(prev => ({ ...prev, findMooshika: true }));
        });
        setCurrentPhase('findMooshika');
        setAppState('play');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }
  }, [sceneState.welcomeShown]);

  // Update phase for idle hints AND restart idle timer
  useEffect(() => {
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) {
      setCurrentPhase('collectModaks');
      // Restart idle timer for this phase
      if (idleHintsEnabled) {
        stopIdleTimer();
        startIdleTimer();
      }
    } else if (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) {
      setCurrentPhase('shareWithGanesha');
      // Restart idle timer for this phase
      if (idleHintsEnabled) {
        stopIdleTimer();
        startIdleTimer();
      }
    } else if (sceneState.phase === PHASES.ROCK_TRANSFORMED || sceneState.phase === PHASES.COMPLETE) {
      // Scene is ending - stop idle timer and clear phase
      if (idleHintsEnabled) stopIdleTimer();
      setCurrentPhase(null);
    }
  }, [sceneState.phase]);

  // Reset hook:
  // 1) clear current visuals
  // 2) reset idle level to 0
  // 3) restart countdown from "now"
  useEffect(() => {
    if (!idleHintsEnabled) return;
    setShowIdleGestureHint(false);
    setIdleHintLevel(0);
    lastIdleInteractionAtRef.current = Date.now();
  }, [hintResetKey, idleHintsEnabled]);

  // Deterministic idle ladder: Level 1 @10s, Level 2 @18s, Level 3 @26s.
  useEffect(() => {
    if (!idleHintsEnabled) return;
    const glowPhases = [
      PHASES.MOOSHIKA_SEARCH,
      PHASES.MODAKS_UNLOCKED,
      PHASES.SOME_COLLECTED,
      PHASES.ROCK_VISIBLE,
      PHASES.ROCK_FEEDING
    ];
    const isHintPhase =
      glowPhases.includes(sceneState?.phase) &&
      !!sceneState?.welcomeShown &&
      !isSymbolPopupOpen;

    if (!isHintPhase) {
      setIdleHintLevel(0);
      setShowIdleGestureHint(false);
      return;
    }

    const tick = setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel(prev => (prev === nextLevel ? prev : nextLevel));
    }, 250);

    return () => clearInterval(tick);
  }, [sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen]);

  // Visual mapping per level.
  useEffect(() => {
    if (!idleHintsEnabled) return;
    const glowPhases = [
      PHASES.MOOSHIKA_SEARCH,
      PHASES.MODAKS_UNLOCKED,
      PHASES.SOME_COLLECTED,
      PHASES.ROCK_VISIBLE,
      PHASES.ROCK_FEEDING
    ];
    const isHintPhase =
      glowPhases.includes(sceneState?.phase) &&
      !!sceneState?.welcomeShown &&
      !isSymbolPopupOpen;
    if (!isHintPhase) {
      setShowIdleGestureHint(false);
      return;
    }
    // Gesture cue appears only at level 3.
    setShowIdleGestureHint(idleHintLevel >= 3);
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen]);

  // Phase 1 idle VO: play once at level 2 (hint-glow), reset on interaction/hintResetKey.
  useEffect(() => {
    if (!idleHintsEnabled) return;
    if (!sceneState?.welcomeShown) return;
    if (isSymbolPopupOpen) return;
    if (sceneState?.phase !== PHASES.MOOSHIKA_SEARCH) return;

    if (idleHintLevel >= 2 && !phase1IdleVoPlayedRef.current) {
      phase1IdleVoPlayedRef.current = true;
      playVoice('findMooshikaIdle');
    }
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen, playVoice]);

  // Modak phase idle VO: play once at level 2 (hint-strong), reset on interaction/hintResetKey.
  useEffect(() => {
    if (!idleHintsEnabled) return;
    if (!sceneState?.welcomeShown) return;
    if (isSymbolPopupOpen) return;
    const isModakPhase =
      sceneState?.phase === PHASES.MODAKS_UNLOCKED ||
      sceneState?.phase === PHASES.SOME_COLLECTED;
    if (!isModakPhase) return;

    if (idleHintLevel >= 2 && !modakIdleVoPlayedRef.current) {
      modakIdleVoPlayedRef.current = true;
      playVoice('collectIdleHint');
    }
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen, playVoice]);

  // Feed phase idle VO: play once at level 2 (hint-strong), reset on interaction/hintResetKey.
  useEffect(() => {
    if (!idleHintsEnabled) return;
    if (!sceneState?.welcomeShown) return;
    if (isSymbolPopupOpen) return;
    const isFeedPhase =
      sceneState?.phase === PHASES.ROCK_VISIBLE ||
      sceneState?.phase === PHASES.ROCK_FEEDING;
    if (!isFeedPhase) return;

    if (idleHintLevel >= 2 && !feedIdleVoPlayedRef.current) {
      feedIdleVoPlayedRef.current = true;
      playVoice('feedIdleHint');
    }
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen, playVoice]);

  // ========================================
  // FIX: Handle Discovery Overlay Logic via useEffect
  // ========================================

  // 1. Handle Focus Power (Mooshika) Overlay
  useEffect(() => {
    if (showDiscoveryFlip1) {
      setDiscoveryButtonVisible(false);
      const timer = setTimeout(() => {
        playVoice('focusPower', () => {
          playRevealBloom();
          setDiscoveryButtonVisible(true);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip1]);

  // 2. Handle Sharing Power (Modak) Overlay
  useEffect(() => {
    if (showDiscoveryFlip2) {
      setDiscoveryButtonVisible(false);

      const timer = setTimeout(() => {
        playVoice('sharingPower', () => {
          playRevealBloom();
          setDiscoveryButtonVisible(true);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip2]);

  // 3. Handle Gratitude Power (Belly) Overlay
  useEffect(() => {
    if (showDiscoveryFlip3) {
      // Stop idle timer - scene is essentially complete
      if (idleHintsEnabled) stopIdleTimer();
      setDiscoveryButtonVisible(false);

      const timer = setTimeout(() => {
        playVoice('gratitudePower', () => {
          playRevealBloom();
          setDiscoveryButtonVisible(true);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip3]);

  // Bridge useEffect (useSymbolCollection ? flip states) ï¿½ superseded by SymbolAutoReveal
  // useEffect(() => {
  //   if (symbolCollectOverlay && currentOverlaySymbol) {
  //     if (currentOverlaySymbol === 'mooshika') setShowDiscoveryFlip1(true);
  //     else if (currentOverlaySymbol === 'modak') setShowDiscoveryFlip2(true);
  //     else if (currentOverlaySymbol === 'belly') setShowDiscoveryFlip3(true);
  //     closeSymbolOverlay();
  //     setCurrentOverlaySymbol(null);
  //   }
  // }, [symbolCollectOverlay, currentOverlaySymbol]);

  // Symbol discovery VO removed - not in the 8 active voice overs

  // ========================================
  // FINAL CELEBRATION SYNC: Show completion modal 1s after VO finishes
  // Fireworks duration is long enough to always cover the VO
  useEffect(() => {
    if (sceneCompleteVOFinished) {
      console.log('✅ Scene complete VO finished → showing modal in 1s');
      const timer = setTimeout(() => {
        playTransition();
        setShowSceneCompletion(true);
        setShowSparkle(null); // stop fireworks when modal appears
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneCompleteVOFinished, playTransition]);

  // Keep completion UI sticky across tab switch/remount:
  // if scene state says completion screen is active, ensure local modal flag stays on.
  useEffect(() => {
    if (sceneState?.showingCompletionScreen && !showSceneCompletion) {
      playTransition();
      setShowSceneCompletion(true);
      setShowSparkle(null);
    }
  }, [sceneState?.showingCompletionScreen, showSceneCompletion, playTransition]);


  // -- SymbolAutoReveal helpers ----------------------------------------------

  // Play affirmation VO when the flip card appears
  useEffect(() => {
    if (!revealConfig) return;
    if (!isAudioOn) return;
    const voMap = {
      mooshika: 'focusPower',
      modak: 'sharingPower',
      belly: 'gratitudePower'
    };
    const voKey = voMap[revealConfig.symbolId];
    if (!voKey) return;
    // replayOnReturn: true — card is still on screen when child returns, replay VO so they know what to do
    const id = setTimeout(() => playVoice(voKey, null, { replayOnReturn: true }), 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, playVoice]);

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

  // Trigger final fireworks + scene-complete VO (extracted from onCelebrate)
  const triggerFireworks = () => {
    setSceneCompleteVOFinished(false);
    setFireworksFinished(false);
    playCelebrationSfx();
    playVoice('sceneComplete', () => {
      console.log('✅ Scene complete VO finished');
      setSceneCompleteVOFinished(true);
    });
    setShowSparkle('final-fireworks');
  };

  // Run game-phase advancement after user taps card and it finishes flying
  //
  // Timing reference (all from user tap):
  //   tap + 680ms  ? sar-sidebar-bloom class added (CSS anim = 1.4s ? finishes at tap+2080ms)
  //   tap + 1150ms ? onComplete() fires  (this function runs)
  //   bloom finishes ~930ms after onComplete
  //
  // Rule: never update discoveredSymbols before ~950ms after onComplete ï¿½
  // updating it causes SymbolSidebar to re-render which strips the bloom
  // class mid-animation and makes the icon vanish.
  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'mooshika') {
      // 950ms: bloom fully done ? start VO + sparkles at modak positions
      safeSetTimeout(() => {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart', () => {
          setInitialInstructionPlayed(prev => ({ ...prev, collectModaks: true }));
        });
        setShowSparkle('modaks-appearing');
        // 500ms later: unlock modaks + mark symbol discovered (brief settle beat)
        safeSetTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.MODAKS_UNLOCKED,
            modaksUnlocked: true,
            basketVisible: true,
            discoveredSymbols: { ...sceneState.discoveredSymbols, mooshika: true }
          });
          safeSetTimeout(() => setShowSparkle(null), 2000);
        }, 500);
      }, 950);

    } else if (symbolId === 'modak') {
      // 950ms: bloom fully done ? start VO + show rock
      safeSetTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha', () => {
          setInitialInstructionPlayed(prev => ({ ...prev, shareWithGanesha: true }));
        });
        sceneActions.updateState({
          phase: PHASES.ROCK_VISIBLE,
          basketReady: true,
          rockVisible: true,
          discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true }
        });
        // Show drag hint while "bring the modaks to me" VO is playing (first time only)
        if (!hasShownDragHintRef.current) {
          hasShownDragHintRef.current = true;
          setTimeout(() => setShowDragHint(true), 400);          // 400ms after VO starts
          setTimeout(() => setShowDragHint(false), 4000);         // hide after 3.5s animation
        }
      }, 950);

    } else if (symbolId === 'belly') {
      // Release gratitudePower ("I feel safe inside") from interruptedVoiceRef tracking.
      // Without this, if the child switches tab in the 2450ms window before triggerFireworks
      // fires, handleShow will replay gratitudePower on return — which then races with
      // sceneComplete VO and its setSceneCompleteVOFinished callback never fires → frozen.
      // stopVoice() here is safe: if VO already finished it's a no-op; if still playing
      // we intentionally cut it since the card has been accepted and we're moving on.
      stopVoice();

      // 950ms: bloom fully done → icon settles into found state
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true }
        });
      }, 950);
      // -- Phase: Symbol Discovery screen (showSymbolDiscovery) commented out --
      // setShowSymbolDiscovery(true);
      // 950ms bloom settle + 1500ms hold in found state = 2450ms before fireworks
      safeSetTimeout(() => {
        triggerFireworks();
      }, 2450);
    }
  };

  const handleMoundClick = (moundIndex, event) => {
    recordInteraction();
    setWrongMoundIndex(null);
    setShowIdleGestureHint(false);
    // Re-arm idle ladder from this interaction point.
    setHintResetKey(k => k + 1);

    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.MOOSHIKA_SEARCH) return;

    const moundStates = [...(sceneState.moundStates || [0, 0, 0, 0, 0])];

    if (moundIndex === sceneState.correctMound) {
      playUiTap();
      moundStates[moundIndex - 1] = 1;
      // 1. STOP THE SEARCH VOICE IMMEDIATELY
      stopVoice(); // Cut any playing VO so it doesn't overlap with success sound
      if (idleHintsEnabled) stopIdleTimer();
      stopMusic(); // Optional: Dip music volume if you have that capability, or stop it

      // 2. PLAY SUCCESS VOICE (The "Yay" moment)
      playDiscovery();
      triggerMiniGesture('mound', 1500);
      playVoice('mooshikaFound');
      setShowSparkle('mooshika-found');

      const moundPositions = { 1: { top: '45%', left: '25%' }, 2: { top: '55%', left: '75%' }, 3: { top: '60%', left: '30%' }, 4: { top: '60%', left: '50%' }, 5: { top: '60%', left: '60%' } };

      sceneActions.updateState({
        mooshikaVisible: true,
        mooshikaFound: true,
        mooshikaPosition: moundPositions[moundIndex],
        moundStates,
        phase: PHASES.MOOSHIKA_FOUND,
        moundsVanishing: true
      });
      // Lock final mound state after fade so reloads in later phases do not briefly re-render mounds.
      safeSetTimeout(() => {
        sceneActions.updateState({
          moundsVanishing: false,
          moundsVanished: true
        });
      }, 900);

      // AUTO-PARK VISUALS — safeSetTimeout so Mooshika doesn't move while tab is hidden
      safeSetTimeout(() => {
        sceneActions.updateState({
          mooshikaPosition: { top: '48%', left: '45%' }
        });
        // Tiny speech bubble for visual flavor
        safeSetTimeout(() => {
          //setMooshikaSpeechMessage("I'll wait here! Find the Modaks!");
          setShowMooshikaSpeech(true);
          safeSetTimeout(() => setShowMooshikaSpeech(false), 3000);
        }, 500);
      }, 1500);

      // 3. Show SymbolAutoReveal for mooshika at 4800ms
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'mooshika',
          symbolImage: symbolMooshikaColored,
          symbolName: 'Mooshika',
          affirmation: 'I can focus.',
          sidebarTarget: getSidebarTarget('mooshika')
        });
      }, 4800);
      // -- Old useSymbolCollection trigger (superseded) --
      // safeSetTimeout(() => {
      //   const el = document.querySelector('.modak-game-mooshika-container');
      //   const startRect = el ? el.getBoundingClientRect() : { top: window.innerHeight*0.48, left: window.innerWidth*0.45, width: 60, height: 60 };
      //   setCurrentOverlaySymbol('mooshika');
      //   handleCollect('mooshika', startRect, symbolMooshikaColored);
      // }, 4800);

    } else {
      // Wrong mound - Scene 22 style: shake only (no wrong SFX, no fade/lock)
      stopVoice();
      if (wrongMoundPuffTimerRef.current) {
        clearTimeout(wrongMoundPuffTimerRef.current);
        wrongMoundPuffTimerRef.current = null;
      }
      if (event?.currentTarget && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
        const rect = event.currentTarget.getBoundingClientRect();
        setWrongMoundPuff({
          moundIndex,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          key: Date.now()
        });
      } else {
        setWrongMoundPuff({
          moundIndex,
          x: 35,
          y: 25,
          key: Date.now()
        });
      }
      wrongMoundPuffTimerRef.current = setTimeout(() => {
        setWrongMoundPuff(null);
        wrongMoundPuffTimerRef.current = null;
      }, 720);
      if (wrongMoundShakeTimerRef.current) {
        clearTimeout(wrongMoundShakeTimerRef.current);
        wrongMoundShakeTimerRef.current = null;
      }
      setWrongMoundIndex(moundIndex);
      wrongMoundShakeTimerRef.current = setTimeout(() => {
        setWrongMoundIndex(null);
        wrongMoundShakeTimerRef.current = null;
      }, 350);
      setTimeout(() => setShowSparkle(null), 1000);
      // Clear hint visuals immediately — glow + gesture stop on any interaction
      setShowIdleGestureHint(false);
    }
  };

  const handleModakClick = (modakIndex) => {
    recordInteraction();
    stopVoice(); // Cut any playing VO (idle hint / collect instruction) before tap SFX
    playUiTap();
    // Clear hint visuals immediately on every modak tap
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);

    if (!sceneState.modaksUnlocked) return;
    if (sceneState.modakStates[modakIndex] === 1) return;

    const modakStates = [...sceneState.modakStates];
    modakStates[modakIndex] = 1;

    const collectedModaks = [...(sceneState.collectedModaks || [])];
    collectedModaks.push(modakIndex);

    playPlace();
    setShowSparkle(`modak-${modakIndex}`);
    setTimeout(() => setShowSparkle(null), 1000);

    const collectedCount = collectedModaks.length;
    if (collectedCount === 3) {
      triggerMiniGesture('center', 2000);
    } else {
      triggerMiniGesture('modak', 1500);
    }

    if (collectedCount === 3) {
      // Stop idle timer during transition
      if (idleHintsEnabled) stopIdleTimer();

      playDiscovery();
      // Show celebration sparkles immediately
      setShowSparkle('modaks-complete');

      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 50, starsEarned: 4 }
      });

      setTimeout(() => {
        playDiscovery();
        sceneActions.updateState({
          basketFull: true,
          phase: PHASES.ALL_COLLECTED
        });
      }, 1000);

      // Clear sparkle before overlay
      setTimeout(() => {
        setShowSparkle(null);
      }, 4000);

      // Show SymbolAutoReveal for modak at 4300ms
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I am full of joy.',
          sidebarTarget: getSidebarTarget('modak')
        });
      }, 4300);
      // -- Old useSymbolCollection trigger (superseded) --
      // safeSetTimeout(() => {
      //   const el = document.querySelector('.modak-game-basket-container');
      //   const startRect = el ? el.getBoundingClientRect() : { top: window.innerHeight*0.45, left: window.innerWidth*0.15, width: 80, height: 80 };
      //   setCurrentOverlaySymbol('modak');
      //   handleCollect('modak', startRect, symbolModakColored);
      // }, 4300);
    } else {
      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 30 + (10 * collectedCount) }
      });
    }
  };

  // Handle drop on rock/belly - DropZone callback
  const handleRockFeed = ({ id, data }) => {
    console.log('🎯 Modak dropped on rock:', id, data);

    if (!sceneState.rockVisible || sceneState.rockFeedCount >= 3) return;
    if (!data || data.type !== 'basket-modak') return;

    const modakIndex = data.index;
    recordInteraction();
    stopVoice(); // Cut any playing VO (idle hint / feed instruction) before feed SFX
    playUiTap();
    // Clear hint visuals immediately on every rock drop
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);

    const newCollectedModaks = sceneState.collectedModaks.filter(i => i !== modakIndex);
    const newFeedCount = sceneState.rockFeedCount + 1;
    const newBellySize = newFeedCount * 33.33;

    setShowSparkle('rock-feeding');
    playEmotionalGlow();
    if (newFeedCount >= 3) {
      triggerMiniGesture('rock', 2000);
    } else {
      triggerMiniGesture('rock', 1500);
    }

    sceneActions.updateState({
      collectedModaks: newCollectedModaks,
      rockFeedCount: newFeedCount,
      rockBellySize: newBellySize,
      phase: PHASES.ROCK_FEEDING,
      progress: { percentage: 60 + (10 * newFeedCount) }
    });


    if (newFeedCount >= 3) {
      // Pre-compute sidebar target NOW (while rock is still in DOM / before transform)
      const bellySidebarTarget = getSidebarTarget('belly');

      setTimeout(() => {
        playEmotionalGlow();
        setShowSparkle('belly-transform');

        sceneActions.updateState({
          rockTransformed: true,
          phase: PHASES.ROCK_TRANSFORMED
        });

        // Keep reveal pacing consistent with other symbol cards:
        // short transform beat, then card appears quickly.
        safeSetTimeout(() => {
          playRevealBloom();
          setShowSparkle(null);
          setRevealConfig({
            symbolId: 'belly',
            symbolImage: symbolBellyColored,
            symbolName: 'Big Belly',
            affirmation: 'I feel good inside.',
            sidebarTarget: bellySidebarTarget
          });
        }, 950);
        // -- Old useSymbolCollection trigger (superseded) --
        // safeSetTimeout(() => {
        //   const el = document.querySelector('.modak-game-rock-container');
        //   const startRect = el ? el.getBoundingClientRect() : { top: window.innerHeight*0.6, left: window.innerWidth*0.5, width: 80, height: 80 };
        //   setCurrentOverlaySymbol('belly');
        //   handleCollect('belly', startRect, symbolBellyColored);
        // }, 2300);

      }, 900);
    } else {
      setTimeout(() => setShowSparkle(null), 1500);
    }
  };

  const resetScene = () => {
    if (idleHintsEnabled) stopIdleTimer();
    setShowIdleGestureHint(false);
    clearCelebrationTimer();
    celebrationRunIdRef.current += 1;
    celebrationTimeRemainingRef.current = 0;
    celebrationPauseTimeRef.current = 0;
    celebrationTypeRef.current = null;

    sceneActions.updateState({
      moundStates: [0, 0, 0, 0, 0],
      correctMound: Math.floor(Math.random() * 5) + 1,
      mooshikaVisible: false,
      mooshikaFound: false,
      mooshikaPosition: { top: '45%', left: '25%' },
      moundsVanished: false,
      moundsVanishing: false,
      modakStates: [0, 0, 0],
      modakSlotIndices: pickRandomModakSlots(),
      modaksUnlocked: false,
      basketVisible: false,
      basketFull: false,
      basketReady: false,
      collectedModaks: [],
      rockVisible: false,
      rockFeedCount: 0,
      rockTransformed: false,
      rockBellySize: 0,
      phase: PHASES.MOOSHIKA_SEARCH,
      currentFocus: 'mooshika',
      discoveredSymbols: {},
      welcomeShown: false,
      currentPopup: null,
      showingCompletionScreen: false,
      stars: 0,
      completed: false,
      progress: {
        percentage: 0,
        starsEarned: 0,
        completed: false
      }
    });

    setShowSparkle(null);
    setShowMooshikaSpeech(false);
    setShowDiscoveryFlip1(false);
    setShowDiscoveryFlip2(false);
    setShowDiscoveryFlip3(false);
    setShowSceneCompletion(false);
    setRevealConfig(null);
  };

  const getModakImage = (index) => {
    const modakImages = [modak1, modak2, modak3];
    return modakImages[index] || modak1;
  };
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen;

  // ========================================
  // MVP RENDER - No GameLayout, No Header
  // ========================================
  return (
    <div data-zone="symbol-mountain">
      <HomeButton onNavigate={(dest) => { stopVoice(); onNavigate?.(dest); }} />
      <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => { stopVoice(); onNavigate?.('zone-welcome'); }} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      {/* Flying Symbol Clone (useSymbolCollection) ï¿½ superseded by SymbolAutoReveal */}
      {/* {flyingSymbol && <img className="flying-symbol" src={flyingSymbol.src} alt="" style={flightStyle} />} */}

      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="modak-game-container">
            {showPersistentEndOverlay && !revealConfig && (
              <div className="modak-game-end-overlay" />
            )}
            <div className="modak-game-background" style={{ backgroundImage: `url(${forestBackground})` }}>
              {!isCompletionView && (
                <>

              {/* --- OPENING MODAL --- */}
              {sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown && (
                <OpeningModal
                  zoneId={zoneId}
                  sceneId={sceneId}
                  onStart={() => {
                    playUiTap();
                    sceneActions.updateState({ welcomeShown: true });
                  }}
                  characterImg={ganeshaCharacter}
                  showButton={openingButtonVisible}
                />
              )}

              {/* MUD MOUNDS */}
              {sceneState.welcomeShown &&
                [PHASES.MOOSHIKA_SEARCH, PHASES.MOOSHIKA_FOUND].includes(sceneState.phase) &&
                !sceneState.moundsVanished &&
                [1, 2, 3, 4, 5].map((index) => (
                <div
                  className={`modak-game-mud-mound modak-game-mound-${index}
                    ${sceneState.moundsVanishing ? 'fade-out' : ''}
                    ${wrongMoundIndex === index ? 'wrong-shake' : ''}
                    ${sceneState.phase === PHASES.MOOSHIKA_SEARCH
                      ? (idleHintLevel === 1
                        ? 'hint'
                        : idleHintLevel === 2
                          ? 'hint-strong'
                          : idleHintLevel >= 3
                            ? 'hint-final'
                            : '')
                      : ''}`}
                  key={`mound-${index}`}
                >

                  <ClickableElement
                    id={`mound-${index}`}
                    onClick={(event) => handleMoundClick(index, event)}
                    completed={(sceneState.moundStates || [])[index - 1] === 1}
                    zone="mound-zone"
                  >
                    <img
                      src={mudMound}
                      alt={`Mud Mound ${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        opacity: (sceneState.moundStates || [])[index - 1] === 1 ? 0.7 : 1
                      }}
                    />
                  </ClickableElement>
                  {wrongMoundPuff?.moundIndex === index && (
                    <div
                      className="mound-dirt-puff"
                      style={{ left: `${wrongMoundPuff.x}px`, top: `${wrongMoundPuff.y}px` }}
                      key={wrongMoundPuff.key}
                    >
                      <div className="mound-dirt-particle" />
                      <div className="mound-dirt-particle" />
                      <div className="mound-dirt-particle" />
                    </div>
                  )}
                  {showSparkle === `mound-${index}` && (
                    <SparkleAnimation
                      type="firefly"
                      count={10}
                      color="#8B4513"
                      size={8}
                      duration={1000}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              ))}

              {/* MOOSHIKA - FREE DRAGGABLE */}
              {sceneState.mooshikaVisible && (
                <FreeDraggableItem
                  id="mooshika-companion"
                  position={sceneState.mooshikaPosition || { top: '45%', left: '25%' }}
                  onPositionChange={(newPosition) => {
                    sceneActions.updateState({
                      mooshikaPosition: newPosition
                    });
                  }}
                  onDragStart={() => {
                    setShowMooshikaSpeech(false);
                  }}
                  onDragEnd={() => {
                    safeSetTimeout(() => {
                      setMooshikaSpeechMessage("Wheee! I love exploring!");
                      setShowMooshikaSpeech(true);

                      safeSetTimeout(() => {
                        setShowMooshikaSpeech(false);
                      }, 3000);
                    }, 500);
                  }}
                  className="modak-game-mooshika-container breathing"
                  bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
                >
                  <img
                    src={mooshika}
                    alt="Mooshika - Drag me around!"
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  />

                  {showSparkle === 'mooshika-found' && (
                    <SparkleAnimation
                      type="magic"
                      count={20}
                      color="#ff69b4"
                      size={12}
                      duration={2000}
                      fadeOut={true}
                      area="full"
                    />
                  )}

                </FreeDraggableItem>
              )}

              {/* MODAKS APPEARING SPARKLES */}
              {showSparkle === 'modaks-appearing' && (
                <>
                  {[0, 1, 2].map((slotRenderIndex) => {
                    const slotIndex = sceneState.modakSlotIndices?.[slotRenderIndex] ?? slotRenderIndex;
                    const slot = MODAK_POSITION_SLOTS[slotIndex] || MODAK_POSITION_SLOTS[slotRenderIndex];
                    return (
                      <div
                        key={`modak-appear-sparkle-${slotRenderIndex}`}
                        style={{ position: 'absolute', top: slot.top, left: slot.left, transform: 'translate(-50%, -50%)', width: '80px', height: '80px', zIndex: 11 }}
                      >
                        <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
                      </div>
                    );
                  })}
                </>
              )}

              {/* TEMP DEBUG: visualize selected slot centers for this run */}
              {SHOW_MODAK_SLOT_DEBUG && (sceneState.modakSlotIndices || []).map((slotIndex, idx) => {
                const slot = MODAK_POSITION_SLOTS[slotIndex];
                if (!slot) return null;
                return (
                  <div
                    key={`modak-slot-debug-${slotIndex}-${idx}`}
                    className="modak-slot-debug-circle"
                    style={{ top: slot.top, left: slot.left }}
                    aria-hidden="true"
                  >
                    {slotIndex + 1}
                  </div>
                );
              })}

              {/* TEMP CHECK MODE: show modak visual at all slots for final position tuning */}
              {SHOW_ALL_MODAK_SLOTS_PREVIEW && MODAK_POSITION_SLOTS.map((slot, idx) => (
                <div
                  key={`modak-slot-preview-${idx}`}
                  className="modak-slot-anchor modak-slot-preview"
                  style={{ top: slot.top, left: slot.left }}
                  aria-hidden="true"
                >
                  <div className="modak-game-modak modak-game-modak-field modak-slot-preview-card">
                    <img src={modak1} alt="" />
                  </div>
                </div>
              ))}

              {/* MODAKS COMPLETE CELEBRATION SPARKLES */}
              {showSparkle === 'modaks-complete' && (
                <>
                  <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', zIndex: 20 }}>
                    <SparkleAnimation type="glitter" count={30} color="#ffd700" size={14} duration={3500} fadeOut={true} area="full" />
                  </div>
                  <div style={{ position: 'absolute', top: '35%', left: '20%', width: '100px', height: '100px', zIndex: 20 }}>
                    <SparkleAnimation type="star" count={20} color="#FFD700" size={12} duration={3000} fadeOut={true} area="full" />
                  </div>
                  <div style={{ position: 'absolute', top: '35%', right: '20%', width: '100px', height: '100px', zIndex: 20 }}>
                    <SparkleAnimation type="star" count={20} color="#FFD700" size={12} duration={3000} fadeOut={true} area="full" />
                  </div>
                </>
              )}

              {/* MODAKS */}
              {sceneState.modaksUnlocked && [0, 1, 2].map((index) => {
                if (sceneState.modakStates[index] === 1) return null;
                const slotIndex = sceneState.modakSlotIndices?.[index] ?? index;
                const slot = MODAK_POSITION_SLOTS[slotIndex] || MODAK_POSITION_SLOTS[index];
                const isModakHintPhase =
                  sceneState.phase === PHASES.MODAKS_UNLOCKED ||
                  sceneState.phase === PHASES.SOME_COLLECTED;
                const modakHintClass = isModakHintPhase
                  ? (idleHintLevel === 1
                    ? 'hint'
                    : idleHintLevel === 2
                      ? 'hint-strong'
                      : idleHintLevel >= 3
                        ? 'hint-final'
                        : '')
                  : '';

                return (
                  <div
                    className="modak-slot-anchor"
                    key={`modak-${index}`}
                    style={{ top: slot.top, left: slot.left }}
                  >
                    <div
                      className={`modak-game-modak modak-game-modak-field modak-game-modak-field-${index + 1}
                        ${modakHintClass}`}
                    >
                      <ClickableElement
                        id={`modak-${index}`}
                        onClick={() => handleModakClick(index)}
                        completed={false}
                        zone="modak-zone"
                        disableTransformFeedback={true}
                      >
                        <img
                          src={getModakImage(index)}
                          alt={`Modak ${index + 1}`}
                          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                      </ClickableElement>

                      {showSparkle === `modak-${index}` && (
                        <SparkleAnimation
                          type="star"
                          count={15}
                          color="#ffd700"
                          size={10}
                          duration={1500}
                          fadeOut={true}
                          area="full"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* BASKET */}
              {sceneState.basketVisible && (
                <div className="modak-game-basket-container">
                  <div className="modak-game-basket-main">
                    <img
                      src={basket}
                      alt="Collection Basket"
                      style={{ width: '100%', height: '100%' }}
                    />
                    {sceneState.collectedModaks?.map((modakIndex, displayIndex) => {
                      const canDrag = sceneState.rockVisible && sceneState.rockFeedCount < 3;
                      const isRockHintPhase =
                        sceneState.phase === PHASES.ROCK_VISIBLE ||
                        sceneState.phase === PHASES.ROCK_FEEDING;
                      const rockHintClass = isRockHintPhase
                        ? (idleHintLevel === 1
                          ? 'hint'
                          : idleHintLevel === 2
                            ? 'hint-strong'
                            : idleHintLevel >= 3
                              ? 'hint-final'
                              : '')
                        : '';

                      return (
                        <div
                          key={`collected-${modakIndex}-${displayIndex}`}
                          className={`modak-game-modak modak-game-modak-collected-${displayIndex + 1}
                            ${rockHintClass}`}
                          style={{
                            position: 'absolute',
                            zIndex: 15,
                            animation: canDrag ? 'none' : 'modak-game-modakToBasket 0.8s ease-out'
                          }}
                        >
                          <KidsDraggable
                            id={`basket-modak-${modakIndex}`}
                            data={{ type: 'basket-modak', index: modakIndex }}
                            dragScale={1}
                            dragFilter="none"
                            dragBorderRadius="0"
                            style={{ width: '100%', height: '100%' }}
                            disabled={!canDrag}
                            onDragStart={() => recordInteraction()}
                          >
                            <img
                              src={getModakImage(modakIndex)}
                              alt={`Collected Modak ${modakIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                filter: 'brightness(1.1) saturate(1.2)',
                                cursor: canDrag ? 'grab' : 'default'
                              }}
                            />
                          </KidsDraggable>
                          <SparkleAnimation type="star" count={8} color="#ffd700" size={6} duration={1500} fadeOut={true} area="full" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GANESHA FEEDING TARGET - grows with each modak drop */}
              {sceneState.rockVisible && (
                <div className="modak-game-rock-container breathing">
                  <KidsDropZone
                    id="feeding-rock"
                    accepts="basket-modak"
                    onDrop={handleRockFeed}
                    disabled={sceneState.rockFeedCount >= 3}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%'
                    }}
                  >
                    <img
                      src={GANESHA_SIT_FEED_IMAGE}
                      alt="Ganesha"
                      style={{
                        width: '100%',
                        height: '100%',
                        cursor: 'default',
                        transform: `scale(${getFeedingGaneshaScale(sceneState.rockFeedCount, sceneState.rockTransformed)})`,
                        transition: 'transform 2.2s cubic-bezier(0.34, 1.2, 0.64, 1)'
                      }}
                    />
                  </KidsDropZone>

                  {(showSparkle === 'rock-feeding' || showSparkle === 'belly-transform') && (
                    <SparkleAnimation
                      type={showSparkle === 'belly-transform' ? 'glitter' : 'magic'}
                      count={25}
                      color={showSparkle === 'belly-transform' ? 'gold' : '#ff6347'}
                      size={12}
                      duration={2000}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* DRAG TUTORIAL HINT — ghost hand, shown once on first rock reveal */}
              {showDragHint && (
                <div className="modak-drag-hint-overlay" aria-hidden="true">
                  <span className="modak-drag-hint-hand">👆</span>
                </div>
              )}

              {/* IDLE GESTURE HINT — shown from 2nd idle hint cycle; gesture type matches current phase */}
              {showIdleGestureHint && (
                sceneState.rockVisible ? (
                  // ROCK_VISIBLE: drag gesture (basket → rock)
                  <div className="modak-drag-hint-overlay" aria-hidden="true">
                    <span className="modak-drag-hint-hand">👆</span>
                  </div>
                ) : sceneState.modaksUnlocked ? (
                  // MODAKS_UNLOCKED: no pointer emoji in freeze copy
                  null
                ) : sceneState.phase === PHASES.MOOSHIKA_SEARCH ? (
                  // MOOSHIKA_SEARCH: mini thumbs-up cue over a mound
                  <div
                    key={`idle-mound-${hintResetKey}-${sceneState.phase}`}
                    className="ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--mound modak-mini-ganesha-cue--idle"
                    aria-hidden="true"
                  >
                    <img className="modak-mini-gesture-icon" src={MINI_THUMBS_UP_ICON} alt="" />
                  </div>
                ) : null
              )}



              {/* MINI THUMBS-UP CUE — micro rewards + reassurance across phase transitions */}
              {miniGesture.show && (
                <div
                  key={`mini-gesture-${miniGesture.key}`}
                  className={`ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--${miniGesture.target}`}
                  style={{ '--mini-cue-duration': `${miniGesture.durationMs}ms` }}
                  aria-hidden="true"
                >
                  <img className="modak-mini-gesture-icon" src={MINI_THUMBS_UP_ICON} alt="" />
                </div>
              )}

              {/* SYMBOL LEARNING SPARKLES */}
              {showSparkle === 'mooshika-to-sidebar' && (
                <div style={{ position: 'absolute', top: '25%', left: '30%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FF69B4" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}
              {showSparkle === 'modak-to-sidebar' && (
                <div style={{ position: 'absolute', top: '40%', right: '25%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FFD700" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}
              {showSparkle === 'belly-to-sidebar' && (
                <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FF8C42" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

                  {/* Foreground occlusion layer (trees + bushes) shown throughout scene */}
                  <img
                    src={foregroundOverlay}
                    alt=""
                    className="modak-game-foreground-overlay"
                    aria-hidden="true"
                  />
                </>
              )}

            </div>

            {/* FIREWORKS ï¿½ old <Fireworks> replaced by <FireworksCompletion> */}
            {/* <Fireworks
                show={showSparkle === 'final-fireworks'}
                duration={15000}
                onComplete={() => {
                  console.log('✅ Fireworks finished');
                  setShowSparkle(null);
                  setFireworksFinished(true);
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('symbol-mountain', 'modak', {
                      completed: true, stars: 8,
                      symbols: { mooshika: true, modak: true, belly: true },
                      phase: 'complete', timestamp: Date.now()
                    });
                    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_modak`);
                    SimpleSceneManager.clearCurrentScene();
                  }
                }}
              /> */}

            {/* Visual-only fireworks ï¿½ no card/buttons. SceneCompletionCelebration
                auto-shows via the sceneCompleteVOFinished useEffect. */}
            {!isCompletionView && (
              <FireworksCompletion
                show={showSparkle === 'final-fireworks'}
                showCard={false}
              />
            )}

            {!isCompletionView && (
              <CalmGoldenFireworks
                show={showSparkle === 'final-fireworks'}
                particles={14}
                duration={3500}
              />
            )}


            {/* SCENE COMPLETION */}
            {isCompletionView && (
              <SceneCompletionCelebration
                show={isCompletionView}
                zoneId={zoneId}
                sceneName="Mooshika's Modak Mission"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={1}
                totalScenes={4}
                starsEarned={3}
                totalStars={3}
                discoveredSymbols={['mooshika', 'modak', 'belly']}
                symbolImages={{
                  mooshika: symbolMooshikaColored,
                  modak: symbolModakColored,
                  belly: symbolBellyColored
                }}
                symbolData={{
                  mooshika: {
                    title: "Mooshika ï¿½ Ganesha's Clever Friend!",
                    description: "A tiny mouse with a big heart! Mooshika helps Ganesha travel anywhere and reminds us to stay humble & smart."
                  },
                  modak: {
                    title: "Modak ï¿½ Ganesha's Sweet Treat!",
                    description: "A magical sweet that fills you with happy, joyful energy!"
                  },
                  belly: {
                    title: "Belly ï¿½ Big Happy Tummy!",
                    description: "Ganesha's big belly holds all worries and turns them into calm. It reminds us to feel safe, relaxed and happy inside."
                  }
                }}
                nextSceneName="Next Symbol Mountain Adventure"
                sceneId="modak"
                completionData={{
                  stars: 3,
                  symbols: { mooshika: true, modak: true, belly: true },
                  completed: true
                }}
                showFireworks={true}
                onComplete={() => {
                  Analytics.sceneCompleted(zoneId, sceneId, 3);
                  onComplete?.();
                }}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onContinue={() => {
                  console.log("Next scene clicked");
                  stopVoice();
                  SimpleSceneManager.setCurrentScene('symbol-mountain', 'pond', false, false);
                  onNavigate?.('scene-complete-continue');
                }}
              />
            )}

            {/* -- SYMBOL AUTO-REVEAL (replaces PowerUnlockOverlay) ---------------
               Flip card: symbol image ? affirmation ? user taps ? flies to sidebar */}
            {!isCompletionView && revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sidebarTargetRect={revealConfig.sidebarTarget}
                enableTapHintPrompt={!sceneState?.discoveredSymbols?.mooshika}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* -- PowerUnlockOverlay instances ï¿½ COMMENTED OUT (superseded by SymbolAutoReveal) --

            {showDiscoveryFlip1 && (
              <PowerUnlockOverlay title="Focus Power Unlocked!"
                description={{ main: ["Sometimes our mind runs everywhere like a tiny mouse!", "But when it's time to learn or play, we can bring it back."], emphasis: "Say with me: I can focus!" }}
                icon={symbolMooshikaColored} iconColor="#FF69B4"
                buttonText="Let's Collect Modaks!" showButton={discoveryButtonVisible}
                onComplete={() => { setShowDiscoveryFlip1(false); setDiscoveryButtonVisible(false); playVoice('collectStart', () => setInitialInstructionPlayed(prev => ({ ...prev, collectModaks: true }))); setShowSparkle('modaks-appearing'); setTimeout(() => { sceneActions.updateState({ phase: PHASES.MODAKS_UNLOCKED, modaksUnlocked: true, basketVisible: true, discoveredSymbols: { ...sceneState.discoveredSymbols, mooshika: true } }); setTimeout(() => setShowSparkle(null), 2000); }, 500); }}
              />
            )}

            {showDiscoveryFlip2 && (
              <PowerUnlockOverlay title="Sweet Reward Earned!"
                description="You searched carefully and found all the modaks! Sweet rewards come when we try our best."
                icon={symbolModakColored} iconColor="#FFD700"
                buttonText="Let's Share Them" showButton={discoveryButtonVisible}
                onComplete={() => { setShowDiscoveryFlip2(false); setDiscoveryButtonVisible(false); playVoice('feedGanesha', () => setInitialInstructionPlayed(prev => ({ ...prev, shareWithGanesha: true }))); sceneActions.updateState({ phase: PHASES.ROCK_VISIBLE, basketReady: true, rockVisible: true, discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true } }); }}
              />
            )}

            {showDiscoveryFlip3 && (
              <PowerUnlockOverlay title="Sharing Power Unlocked!"
                description={{ main: ["You chose to share your sweets with me.", "That shows a kind heart."], emphasis: "Say with me: I am kind!" }}
                icon={symbolBellyColored} iconColor="#FF8C42"
                buttonText="Discover Symbols!" showButton={discoveryButtonVisible}
                onComplete={() => { setShowDiscoveryFlip3(false); setDiscoveryButtonVisible(false); sceneActions.updateState({ discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true } }); setShowSymbolDiscovery(true); }}
              />
            )}

            -- End PowerUnlockOverlay -- */}

            {!isCompletionView && (
              <CulturalCelebrationModal
                show={showCulturalCelebration}
                onClose={() => setShowCulturalCelebration(false)}
                {...CulturalProgressExtractor.getCulturalProgressData()}
              />
            )}

            {/* SYMBOL DISCOVERY MOMENT - center mode ï¿½ COMMENTED OUT
                 Fireworks now auto-trigger 350ms after sidebar bloom via handleRevealComplete.
            {showSymbolDiscovery && (
              <SymbolSidebar
                centerMode={true}
                discoveredSymbols={sceneState.discoveredSymbols || {}}
                highlightSymbols={Object.keys(sceneState.discoveredSymbols || {})}
                onPopupOpen={() => handlePauseCore()}
                onPopupClose={() => resumePhaseAfterPause()}
                onCelebrate={() => {
                  setShowSymbolDiscovery(false);
                  setSceneCompleteVOFinished(false);
                  setFireworksFinished(false);
                  playVoice('sceneComplete', () => {
                    console.log('✅ Scene complete VO finished');
                    setSceneCompleteVOFinished(true);
                  });

                  setShowSparkle('final-fireworks');
                }}
              />
            )}
            -- End Symbol Discovery screen -- */}

            {/* SIDE RAIL - hide during final fireworks and celebration popup */}
            {!isCompletionView && sceneState.welcomeShown && !isFinalCelebrationActive && (
              <SymbolSidebar
                // animatingSymbol={animatingSymbol}  // superseded by SymbolAutoReveal
                discoveredSymbols={sceneState.discoveredSymbols || {}}
                onSymbolClick={(symbolId) => {
                  console.log(`Sidebar symbol clicked: ${symbolId}`);
                }}
                onPopupOpen={handleSymbolPopupOpen}
                onPopupClose={handleSymbolPopupClose}
              />
            )}
          </div>
        </MessageManager>
      </InteractionManager>

      {/* 3-2-1 resume countdown — renders on top of everything when child returns to tab */}
      <ResumeCountdown value={countdownValue} />
    </div>
  );
};

export default NewModakSceneMVP;
