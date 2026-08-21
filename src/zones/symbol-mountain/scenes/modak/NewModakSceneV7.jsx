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

// Analytics
import { Analytics } from '../../../../lib/services/analytics';

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';

// Shared countdown duration � must match across useVoiceGuidance + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

// Synthesized Sound Effects



import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';


import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Symbol Collection Hook (flight animation ? sidebar bloom ? overlay) � superseded by SymbolAutoReveal
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
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';

// Images
//import forestBackground from './assets/images/forest-background.webp';
import forestBackground from './assets/images/newmodakbg.png';
// import foregroundOverlay from './assets/images/modaktree.png';
import modak1 from './assets/images/modak-new.webp';
import modak2 from './assets/images/modak-new.webp';
import modak3 from './assets/images/modak-new.webp';
import mooshikaActive from './assets/images/mushika-active-game2.png';
import mooshikaCalm from './assets/images/mushika-calm-game2.png';
import journeyFeather from './assets/images/journey-feather.png';
import journeyBerry from './assets/images/journey-berry.png';
import journeyAcorn from './assets/images/journey-acorn.png';
import offeringFlower from './assets/images/offering-flower-game2.png';
import offeringDurva from './assets/images/offering-durva-game2.png';
import offeringGarland from './assets/images/offering-garland-game2.png';
import emotionWorried from './assets/images/emotion-worried-game3.png';
import emotionSad from './assets/images/emotion-sad-game3.png';
import emotionAngry from './assets/images/emotion-angry-game3.png';
import emotionHappy from './assets/images/emotion-happy-game3.png';
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';
import mooshikaBefore from './assets/images/mooshika-before.webp';
import mooshikaAfter from './assets/images/mooshika-after.webp';
import modakBefore from './assets/images/modak-before.webp';
import modakAfter from './assets/images/modak-after.webp';
import bellyBefore from './assets/images/belly-before.webp';
import bellyAfter from './assets/images/belly-after.webp';
import ganeshaFeeding from './assets/images/ganesha-game3-new.png';

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

const MODAK_DISTRACTIONS = [
  { id: 'feather', image: journeyFeather, top: '54%', left: '24%' },
  { id: 'acorn', image: journeyAcorn, top: '43%', left: '72%' },
  { id: 'berry', image: journeyBerry, top: '72%', left: '58%' }
];
const MUSHIKA_CLEARING_POSITION = { top: '58%', left: '35%' };
const MUSHIKA_OFFERING_START_POSITION = { top: '64%', left: '18%' };
const MUSHIKA_BELLY_POSITION = { top: '70%', left: '23%' };
const MODAK_OFFERINGS = [
  { id: 'flower', image: offeringFlower, top: '38%', left: '28%', label: 'Red flower' },
  { id: 'durva', image: offeringDurva, top: '70%', left: '48%', label: 'Durva grass' },
  { id: 'garland', image: offeringGarland, top: '42%', left: '74%', label: 'Garland' }
];
const BELLY_EMOTIONS = [
  { id: 'happy', image: emotionHappy, label: 'Happy', orbClass: 'modak-game-emotion-happy', insideClass: 'modak-game-inside-happy', left: '8%', top: '12%' },
  { id: 'worried', image: emotionWorried, label: 'Worried', orbClass: 'modak-game-emotion-worried', insideClass: 'modak-game-inside-worried', right: '6%', top: '16%' },
  { id: 'angry', image: emotionAngry, label: 'Angry', orbClass: 'modak-game-emotion-angry', insideClass: 'modak-game-inside-angry', left: '4%', bottom: '10%' },
  { id: 'sad', image: emotionSad, label: 'Sad', orbClass: 'modak-game-emotion-sad', insideClass: 'modak-game-inside-sad', right: '8%', bottom: '14%' }
];
const MUSHIKA_DART_INTERVAL_MS = 1100;
const MUSHIKA_HOLD_MS = 1600;
const MUSHIKA_CALM_BEAT_MS = 1200;
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MODAK_POSITION_SLOTS = [
  { top: '32.1%', left: '32.8%' },
  { top: '35.6%', left: '66.2%' },
  { top: '27.4%', left: '64.3%' },
  { top: '45%', left: '16.5%' },
  { top: '44.4%', left: '11.3%' },
  { top: '34.2%', left: '73.2%' },
  { top: '41.6%', left: '83.5%' },
  { top: '34.3%', left: '39.1%' }
];
const MODAK_SLOT_POSITIONS_KEY = 'debugModakSlotPositions';
const getModakDebugFlags = () => {
  if (typeof window === 'undefined') {
    return { showSlotCenters: false, showAllSlotsPreview: false, showDebugUi: false };
  }

  const params = new URLSearchParams(window.location.search);
  const showSlotCenters =
    params.has('debugModakSlotCenters') ||
    window.localStorage.getItem('debugModakSlotCenters') === '1';
  const showAllSlotsPreview =
    params.has('debugModakSlots') ||
    window.localStorage.getItem('debugModakSlots') === '1';
  const showDebugUi =
    params.has('debugModak') ||
    showSlotCenters ||
    showAllSlotsPreview ||
    window.localStorage.getItem('debugModakUI') === '1';

  return { showSlotCenters, showAllSlotsPreview, showDebugUi };
};

const MODAK_DEBUG_FLAGS = getModakDebugFlags();
const MODAK_DEBUG_UI_ENABLED = MODAK_DEBUG_FLAGS.showDebugUi;
const SHOW_MODAK_SLOT_DEBUG = MODAK_DEBUG_FLAGS.showSlotCenters;
const SHOW_ALL_MODAK_SLOTS_PREVIEW = MODAK_DEBUG_FLAGS.showAllSlotsPreview;
const GANESHA_SIT_FEED_IMAGE = ganeshaFeeding;

const pickRandomModakSlots = () => {
  const indices = MODAK_POSITION_SLOTS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, 3);
};

const parseSavedModakSlots = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MODAK_SLOT_POSITIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== MODAK_POSITION_SLOTS.length) return null;
    const valid = parsed.every((p) => p && typeof p.top === 'string' && typeof p.left === 'string');
    return valid ? parsed : null;
  } catch {
    return null;
  }
};

const getFeedingGaneshaScale = (feedCount, transformed) => {
  const growthSteps = [0.72, 0.82, 0.94, 1.08];
  const stepIndex = Math.min(Math.max(feedCount, 0), growthSteps.length - 1);
  const baseScale = growthSteps[stepIndex];
  return transformed ? Math.max(baseScale, 1.5) : baseScale;
};

const MODAK_WEB_SPEECH_VO = {
  welcome: "Mooshika is nearby. Let's find the sweet modaks.",
  findMooshika: 'Mooshika is darting around. Press and hold him gently to help him settle.',
  findMooshikaIdle: 'Hold Mooshika gently when he pauses near an object.',
  mooshikaFound: 'There he is... calm and ready to walk with us.',
  focusPower: 'You looked closely... and found him. Say it with me... I can focus.',
  collectStart: 'Mushika is ready to gather three offerings for Ganesha. Drag her to each one.',
  collectIdleHint: 'Guide Mushika to each offering for Ganesha.',
  sharingPower: 'Mushika finished with care. That peaceful feeling is sweet. Say it with me... I feel peaceful inside.',
  feedGanesha: "Drag each feeling into Ganesha's belly. There is room for every feeling.",
  feedIdleHint: "Move a feeling into Ganesha's belly.",
  gratitudePower: 'All my feelings can rest safely inside.',
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
          mooshikaPosition: { top: MODAK_DISTRACTIONS[0].top, left: MODAK_DISTRACTIONS[0].left },
          activeDistractionId: MODAK_DISTRACTIONS[0].id,
          mushikaHolding: false,
          holdProgress: 0,
          moundsVanished: false,
          moundsVanishing: false,

          modakStates: [0, 0, 0],
          modakSlotIndices: pickRandomModakSlots(),
          modaksUnlocked: false,
          basketVisible: false,
          basketFull: false,
          basketReady: false,
          collectedModaks: [],
          bellyEmotionIds: [],

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

  // Backfill missing phase for older saved state objects (effect, not render —
  // calling updateState during render triggers React warnings/loops).
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.MOOSHIKA_SEARCH });
  }, [sceneState?.phase, sceneActions]);

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

  // Pause-aware timeout hooks can call these refs on tab hide/show when needed.
  // (defined later in the component � assigned after their definitions below)
  const pauseCelebRef = useRef(null);
  const resumeCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    resumeCelebRef.current?.();
    // Reset hints so return starts a fresh 10s/18s/26s ladder.
    setHintResetKey(k => k + 1);
  }, []);

  // Drop-in for safeSetTimeout � auto-pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,  // timers resume in sync with audio after countdown
  });

  // 3-2-1 countdown display � fires immediately on tab show (no delay),
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
  const lastVoRef = useRef(null);
  const wasAudioOnRef = useRef(isAudioOn);
  // -- SymbolAutoReveal state ----------------------------------------------
  // null = not showing; object = reveal active
  const [revealConfig, setRevealConfig] = useState(null);

  const replaySpeak = useCallback((line, options = {}) => {
    if (!line) return;
    lastVoRef.current = line;
    if (!isAudioOn) {
      options.onEnd?.();
      return;
    }
    speak(line, options);
  }, [isAudioOn, speak]);

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

    replaySpeak(text, {
      age: 7,
      moment: MODAK_WEB_SPEECH_MOMENT[key] || 'default',
      onEnd: onEnded || null,
      onError: () => onEnded?.(),
    });
  }, [replaySpeak, stopRecordedVoice]);

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

  // -- Idle hint (glow ring + gesture) -------------------------------------
  // Wire AudioToggle ? VO volume: mutes narration only, SFX + game flow unaffected
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
      // Read live state via ref — the [] deps would otherwise freeze the
      // initial sceneState and report every play (even completed) as abandoned.
      if (!sceneStateRef.current?.completed) {
        Analytics.sceneAbandoned(zoneId, sceneId);
      }
    };
  }, []);

  // Get content from configs
  const openingModalContent = getOpeningModal(zoneId, sceneId);
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showMooshikaSpeech, setShowMooshikaSpeech] = useState(false);
  const [mooshikaSpeechMessage, setMooshikaSpeechMessage] = useState('');
  const showOpeningModal = sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown;
  const [isBellyPulseActive, setIsBellyPulseActive] = useState(false);

  const [debugSlotsPreview, setDebugSlotsPreview] = useState(SHOW_ALL_MODAK_SLOTS_PREVIEW);
  const [debugSlotCenters, setDebugSlotCenters] = useState(SHOW_MODAK_SLOT_DEBUG);
  const [slotPositions, setSlotPositions] = useState(() => parseSavedModakSlots() || MODAK_POSITION_SLOTS);
  const [draggingSlotIndex, setDraggingSlotIndex] = useState(null);
  const backgroundRef = useRef(null);

  // -- useSymbolCollection (superseded by SymbolAutoReveal) ----------------
  // const [currentOverlaySymbol, setCurrentOverlaySymbol] = useState(null);
  // const { flyingSymbol, flightStyle, animatingSymbol, showOverlay: symbolCollectOverlay,
  //         handleCollect, closeOverlay: closeSymbolOverlay }
  //   = useSymbolCollection({ onCollectSound: () => playSfx('chime') });

  // Track final celebration completion (VO + fireworks sync)
  const [sceneCompleteVOFinished, setSceneCompleteVOFinished] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);

  // Drag tutorial hint � shown once when rock first appears
  const hasShownDragHintRef = useRef(false);
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const [wrongMoundIndex, setWrongMoundIndex] = useState(null);
  const [wrongMoundPuff, setWrongMoundPuff] = useState(null);
  const wrongMoundShakeTimerRef = useRef(null);
  const wrongMoundPuffTimerRef = useRef(null);
  const mushikaDartTimerRef = useRef(null);
  const mushikaHoldStartRef = useRef(null);
  const mushikaHoldRafRef = useRef(null);
  const mushikaDartIndexRef = useRef(0);
  const offeringCollectLockRef = useRef(false);
  const [isOfferingDragActive, setIsOfferingDragActive] = useState(false);
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
  const feedInFlightRef = useRef(false);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const resetIdleBaseline = useCallback(() => {
    lastIdleInteractionAtRef.current = Date.now();
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
  }, []);

  const clearMushikaDartTimer = useCallback(() => {
    if (mushikaDartTimerRef.current) {
      clearTimeout(mushikaDartTimerRef.current);
      mushikaDartTimerRef.current = null;
    }
  }, []);

  const clearMushikaHoldLoop = useCallback(() => {
    if (mushikaHoldRafRef.current) {
      cancelAnimationFrame(mushikaHoldRafRef.current);
      mushikaHoldRafRef.current = null;
    }
  }, []);

  const scheduleNextMushikaDart = useCallback(() => {
    if (!sceneState?.welcomeShown || sceneState?.phase !== PHASES.MOOSHIKA_SEARCH || sceneState?.mushikaHolding) {
      return;
    }

    let nextIndex = Math.floor(Math.random() * MODAK_DISTRACTIONS.length);
    if (MODAK_DISTRACTIONS.length > 1 && nextIndex === mushikaDartIndexRef.current) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (MODAK_DISTRACTIONS.length - 1))) % MODAK_DISTRACTIONS.length;
    }
    mushikaDartIndexRef.current = nextIndex;
    const target = MODAK_DISTRACTIONS[nextIndex];
    sceneActions.updateState({
      mooshikaVisible: true,
      mooshikaPosition: { top: target.top, left: target.left },
      activeDistractionId: target.id
    });

    clearMushikaDartTimer();
    mushikaDartTimerRef.current = setTimeout(() => {
      scheduleNextMushikaDart();
    }, MUSHIKA_DART_INTERVAL_MS);
  }, [clearMushikaDartTimer, sceneActions, sceneState?.mushikaHolding, sceneState?.phase, sceneState?.welcomeShown]);

  const completeMushikaSettle = useCallback(() => {
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    playDiscovery();
    setMiniGesture(prev => ({
      show: true,
      target: 'mound',
      durationMs: 1500,
      key: prev.key + 1
    }));
    if (miniGestureTimerRef.current) {
      clearTimeout(miniGestureTimerRef.current);
    }
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture(prev => ({ ...prev, show: false }));
      miniGestureTimerRef.current = null;
    }, 1500);
    playVoice('mooshikaFound');
    setShowSparkle('mooshika-calm');

    sceneActions.updateState({
      mooshikaVisible: true,
      mooshikaFound: true,
      mushikaHolding: false,
      holdProgress: 1,
      activeDistractionId: null,
      phase: PHASES.MOOSHIKA_FOUND,
      mooshikaPosition: MUSHIKA_CLEARING_POSITION,
      moundsVanished: true,
      moundsVanishing: false
    });

    safeSetTimeout(() => {
      const el = document.getElementById('sidebar-mooshika');
      const sidebarTarget = el
        ? (() => {
            const rect = el.getBoundingClientRect();
            return {
              x: (rect.left + rect.width / 2) - (window.innerWidth / 2),
              y: (rect.top + rect.height / 2) - (window.innerHeight / 2)
            };
          })()
        : { x: 220, y: 0 };

      playRevealBloom();
      setRevealConfig({
        symbolId: 'mooshika',
        symbolImage: symbolMooshikaColored,
        symbolName: 'Mooshika',
        affirmation: 'I can focus.',
        sidebarTarget
      });
    }, MUSHIKA_CALM_BEAT_MS);
  }, [clearMushikaDartTimer, clearMushikaHoldLoop, idleHintsEnabled, playDiscovery, playRevealBloom, playVoice, safeSetTimeout, sceneActions, stopIdleTimer, stopVoice]);

  const tickMushikaHold = useCallback(() => {
    if (!mushikaHoldStartRef.current) return;
    const elapsed = performance.now() - mushikaHoldStartRef.current;
    const progress = Math.min(elapsed / MUSHIKA_HOLD_MS, 1);
    sceneActions.updateState({ holdProgress: progress });

    if (progress >= 1) {
      completeMushikaSettle();
      return;
    }

    mushikaHoldRafRef.current = requestAnimationFrame(tickMushikaHold);
  }, [completeMushikaSettle, sceneActions]);

  useEffect(() => {
    if (showOpeningModal) {
      document.body.classList.add('modak-opening-active');
      return () => {
        document.body.classList.remove('modak-opening-active');
      };
    }

    document.body.classList.remove('modak-opening-active');
    return undefined;
  }, [showOpeningModal]);

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
      clearMushikaDartTimer();
      clearMushikaHoldLoop();
    };
  }, [clearMushikaDartTimer, clearMushikaHoldLoop]);

  useEffect(() => {
    if (sceneState?.welcomeShown && sceneState?.phase === PHASES.MOOSHIKA_SEARCH && !sceneState?.mushikaHolding) {
      if (!mushikaDartTimerRef.current) {
        scheduleNextMushikaDart();
      }
      return undefined;
    }

    clearMushikaDartTimer();
    return undefined;
  }, [clearMushikaDartTimer, scheduleNextMushikaDart, sceneState?.mushikaHolding, sceneState?.phase, sceneState?.welcomeShown]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const feedImage = new window.Image();
    feedImage.src = GANESHA_SIT_FEED_IMAGE;

    if (typeof feedImage.decode === 'function') {
      feedImage.decode().catch(() => {
        // Ignore decode failures; the browser cache warm-up is still useful.
      });
    }

    return undefined;
  }, []);

  // ========================================
  // TIMER / FLOW STATE
  // ========================================
  // timeoutsRef removed � safeSetTimeout now comes from usePauseAwareTimeout above

  // ?? Track symbol sidebar popup state for celebration pausing
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const symbolPopupSessionOpenRef = useRef(false);
  // Track if initial instruction has completed for each phase
  const [initialInstructionPlayed, setInitialInstructionPlayed] = useState({
    findMooshika: false,
    collectModaks: false,
    shareWithGanesha: false
  });

  const isCelebrationOrOverlayActive =
    showSceneCompletion ||
    isSymbolPopupOpen ||
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
        // SymbolAutoReveal card flip is about to show � stop any replayed VO
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
        console.log('? Scene complete VO finished');
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
    setIsSymbolPopupOpen(true);

    // Same as pause: stop VOs and timers
    handlePauseCore();
    resetIdleBaseline();

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

  }, [resetIdleBaseline, resumePhaseAfterPause]);

  // ========================================
  // VO-GATED STATE MACHINE
  // Listen = VO playing, no button
  // Ready = VO done, button visible
  // ========================================
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // safeSetTimeout is provided by usePauseAwareTimeout � auto-pauses on tab hide

  pauseCelebRef.current = null;
  resumeCelebRef.current = null;

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (miniGestureTimerRef.current) {
        clearTimeout(miniGestureTimerRef.current);
        miniGestureTimerRef.current = null;
      }
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
    // Trigger the live SymbolAutoReveal flow directly on reload.
    // Short delay so Mooshika has time to render in her saved position first.
    if (sceneState.phase === PHASES.MOOSHIKA_FOUND) {
      safeSetTimeout(() => {
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
      safeSetTimeout(() => {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 3b. REPLAY VO for modak collection phase on reload
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED && sceneState.modaksUnlocked) {
      safeSetTimeout(() => {
        resetIdleBaseline();
        modakIdleVoPlayedRef.current = false;
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 4. RESTORE MODAK CARD FLIP (Power Unlock 2)
    // All modaks collected but SymbolAutoReveal for modak not yet shown.
    // Trigger the live SymbolAutoReveal flow directly on reload.
    if (sceneState.phase === PHASES.ALL_COLLECTED && !sceneState.rockVisible) {
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I feel happy inside.',
          sidebarTarget: getSidebarTarget('modak')
        });
      }, 1200);
    }

    // 5. RESET PARTIAL BELLY GAME
    if (sceneState.phase === PHASES.ROCK_FEEDING) {
      sceneActions.updateState({
        phase: PHASES.ROCK_VISIBLE,
        rockFeedCount: 0,
        rockBellySize: 0,
        collectedModaks: [],
        bellyEmotionIds: [],
        basketFull: true,
        mooshikaPosition: MUSHIKA_BELLY_POSITION
      });
      safeSetTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 5b. REPLAY VO for belly phase on reload
    if (sceneState.phase === PHASES.ROCK_VISIBLE && sceneState.rockVisible) {
      safeSetTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }

    // 6. RESTORE BELLY CARD FLIP (Power Unlock 3)
    // Rock transformed but SymbolAutoReveal for belly not yet shown.
    // Trigger the live SymbolAutoReveal flow directly on reload.
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && !sceneState.completed) {
      hasShownDragHintRef.current = true; // Don't re-show drag hint on reload
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'belly',
          symbolImage: symbolBellyColored,
          symbolName: 'Big Belly',
          affirmation: 'I have room for every feeling.',
          sidebarTarget: getSidebarTarget('belly')
        });
      }, 1200);
    }
    // Defensive repair: stale save may mark completed during belly reveal phase.
    // Reset and restore belly card instead of treating scene as done.
    // (Skip when the completion screen was genuinely reached — that state is valid.)
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && sceneState.completed && !sceneState.showingCompletionScreen) {
      hasShownDragHintRef.current = true;
      sceneActions.updateState({
        completed: false,
        showingCompletionScreen: false,
        phase: PHASES.ROCK_TRANSFORMED
      });
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'belly',
          symbolImage: symbolBellyColored,
          symbolName: 'Big Belly',
          affirmation: 'I have room for every feeling.',
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
      const timer = safeSetTimeout(() => {
        // Button shows immediately from start
        playTransition();
        playVoice('welcome');
      }, 800);
      return timer;
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn, playTransition, playVoice, safeSetTimeout]);

  // ========================================
  // VOICE: Play instruction after game starts
  // ========================================
  useEffect(() => {
    if (sceneState.welcomeShown && sceneState.phase === PHASES.MOOSHIKA_SEARCH) {
      // Start background music
      startMusic();
      // Play find mooshika instruction
      const timer = safeSetTimeout(() => {
        resetIdleBaseline();
        phase1IdleVoPlayedRef.current = false;
        playVoice('findMooshika', () => {
          // Mark initial instruction as complete
          setInitialInstructionPlayed(prev => ({ ...prev, findMooshika: true }));
        });
        setCurrentPhase('findMooshika');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
      return timer;
    }
  }, [sceneState.welcomeShown, sceneState.phase, idleHintsEnabled, playVoice, resetIdleBaseline, safeSetTimeout, setCurrentPhase, startIdleTimer, startMusic]);

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
    feedIdleVoPlayedRef.current = false;
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
  // FINAL CELEBRATION SYNC: Show completion modal 1s after VO finishes
  // Fireworks duration is long enough to always cover the VO
  useEffect(() => {
    // Wait for BOTH fireworks and the sceneComplete VO — the mandala must not
    // appear while Ganesha is still speaking the closing line.
    if (fireworksFinished && sceneCompleteVOFinished && sceneState.phase === PHASES.ROCK_TRANSFORMED) {
      setShowMandala(true);
    }
  }, [fireworksFinished, sceneCompleteVOFinished, sceneState.phase]);

  // Safety net: if the VO onEnd never fires (interrupted speech engine),
  // release the mandala gate so the finale can't freeze.
  useEffect(() => {
    if (!fireworksFinished || sceneCompleteVOFinished) return;
    const t = setTimeout(() => setSceneCompleteVOFinished(true), 10000);
    return () => clearTimeout(t);
  }, [fireworksFinished, sceneCompleteVOFinished]);

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
    // replayOnReturn: true � card is still on screen when child returns, replay VO so they know what to do
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
      console.log('? Scene complete VO finished');
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
  // Rule: never update discoveredSymbols before ~950ms after onComplete �
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
            mooshikaVisible: true,
            mooshikaPosition: MUSHIKA_OFFERING_START_POSITION,
            activeDistractionId: null,
            discoveredSymbols: { ...sceneState.discoveredSymbols, mooshika: true }
          });
          safeSetTimeout(() => setShowSparkle(null), 2000);
        }, 500);
      }, 950);

    } else if (symbolId === 'modak') {
      // 950ms: bloom fully done ? start belly game
      safeSetTimeout(() => {
        resetIdleBaseline();
        feedIdleVoPlayedRef.current = false;
        playVoice('feedGanesha', () => {
          setInitialInstructionPlayed(prev => ({ ...prev, shareWithGanesha: true }));
        });
        sceneActions.updateState({
          phase: PHASES.ROCK_VISIBLE,
          rockVisible: true,
          rockTransformed: false,
          bellyEmotionIds: [],
          mooshikaVisible: true,
          mooshikaPosition: MUSHIKA_BELLY_POSITION,
          discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true }
        });
        hasShownDragHintRef.current = true;
      }, 950);

    } else if (symbolId === 'belly') {
      // Release gratitudePower ("I feel safe inside") from interruptedVoiceRef tracking.
      // Without this, if the child switches tab in the 2450ms window before triggerFireworks
      // fires, handleShow will replay gratitudePower on return � which then races with
      // sceneComplete VO and its setSceneCompleteVOFinished callback never fires ? frozen.
      // stopVoice() here is safe: if VO already finished it's a no-op; if still playing
      // we intentionally cut it since the card has been accepted and we're moving on.
      stopVoice();

      // 950ms: bloom fully done ? icon settles into found state
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true }
        });
      }, 950);
      // 950ms bloom settle + 1500ms hold in found state = 2450ms before fireworks
      safeSetTimeout(() => {
        triggerFireworks();
      }, 2450);
    }
  };

  const handleMushikaHoldStart = (event) => {
    event.preventDefault?.();
    recordInteraction();
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);

    if (!sceneState || sceneState.phase !== PHASES.MOOSHIKA_SEARCH) return;

    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();

    mushikaHoldStartRef.current = performance.now();
    sceneActions.updateState({
      mooshikaVisible: true,
      mushikaHolding: true,
      holdProgress: 0
    });
    mushikaHoldRafRef.current = requestAnimationFrame(tickMushikaHold);
  };

  const handleMushikaHoldEnd = () => {
    if (!sceneState || sceneState.phase !== PHASES.MOOSHIKA_SEARCH || !sceneState.mushikaHolding) return;

    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    sceneActions.updateState({
      mushikaHolding: false,
      holdProgress: 0
    });
    scheduleNextMushikaDart();
  };

  const handleOfferingCollect = useCallback((offeringIndex) => {
    if (!sceneState?.modaksUnlocked) return;
    if (sceneState.modakStates[offeringIndex] === 1) return;
    if (offeringCollectLockRef.current) return;
    offeringCollectLockRef.current = true;
    safeSetTimeout(() => {
      offeringCollectLockRef.current = false;
    }, 220);

    recordInteraction();
    stopVoice();
    playUiTap();
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);

    const modakStates = [...sceneState.modakStates];
    modakStates[offeringIndex] = 1;

    const collectedModaks = [...(sceneState.collectedModaks || [])];
    collectedModaks.push(offeringIndex);

    playPlace();
    setShowSparkle(`offering-${offeringIndex}`);
    safeSetTimeout(() => setShowSparkle(null), 1000);

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
      setShowSparkle('offerings-complete');

      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 50, starsEarned: 4 }
      });

      safeSetTimeout(() => {
        sceneActions.updateState({
          basketFull: true,
          phase: PHASES.ALL_COLLECTED
        });
      }, 700);

      safeSetTimeout(() => {
        setShowSparkle('modak-satisfaction');
      }, 1200);

      safeSetTimeout(() => {
        playRevealBloom();
        setShowSparkle(null);
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I feel happy inside.',
          sidebarTarget: getSidebarTarget('modak')
        });
      }, 4700);
    } else {
      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 30 + (10 * collectedCount) }
      });
    }
  }, [
    idleHintsEnabled,
    recordInteraction,
    safeSetTimeout,
    sceneActions,
    sceneState,
    stopIdleTimer,
    stopVoice,
    triggerMiniGesture
  ]);

  const handleOfferingDragStart = useCallback(() => {
    if (!sceneState) return;
    const isOfferingPhase =
      sceneState.phase === PHASES.MODAKS_UNLOCKED ||
      sceneState.phase === PHASES.SOME_COLLECTED ||
      sceneState.phase === PHASES.ALL_COLLECTED;
    if (!isOfferingPhase) return;

    setIsOfferingDragActive(true);
    recordInteraction();
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);
  }, [recordInteraction, sceneState]);

  const handleOfferingDragEnd = useCallback(() => {
    setIsOfferingDragActive(false);
  }, []);

  const handleOfferingDrop = useCallback(({ data }) => {
    const offeringIndex = data?.offeringIndex;
    if (typeof offeringIndex !== 'number') return;
    const offering = MODAK_OFFERINGS[offeringIndex];
    if (!offering) return;

    sceneActions.updateState({
      mooshikaPosition: {
        top: offering.top,
        left: offering.left
      }
    });
    handleOfferingCollect(offeringIndex);
  }, [handleOfferingCollect, sceneActions]);

  const handleBellyEmotionDrop = useCallback(({ data }) => {
    const emotionId = data?.emotionId;
    if (!sceneState?.rockVisible || !emotionId) return;
    if ((sceneState.bellyEmotionIds || []).includes(emotionId)) return;

    recordInteraction();
    stopVoice();
    playUiTap();
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);
    setIsBellyPulseActive(false);
    requestAnimationFrame(() => {
      setIsBellyPulseActive(true);
    });
    safeSetTimeout(() => {
      setIsBellyPulseActive(false);
    }, 430);

    const nextEmotionIds = [...(sceneState.bellyEmotionIds || []), emotionId];
    const isComplete = nextEmotionIds.length === BELLY_EMOTIONS.length;

    sceneActions.updateState({
      bellyEmotionIds: nextEmotionIds,
      phase: isComplete ? PHASES.ROCK_TRANSFORMED : PHASES.ROCK_FEEDING,
      rockTransformed: isComplete,
      progress: { percentage: isComplete ? 90 : 60 + (nextEmotionIds.length * 7) }
    });

    if (!isComplete) {
      return;
    }

    triggerMiniGesture('rock', 1800);
    safeSetTimeout(() => {
      playRevealBloom();
      setRevealConfig({
        symbolId: 'belly',
        symbolImage: symbolBellyColored,
        symbolName: 'Big Belly',
        affirmation: 'I have room for every feeling.',
        sidebarTarget: getSidebarTarget('belly')
      });
    }, 1800);
  }, [
    playRevealBloom,
    playUiTap,
    recordInteraction,
    safeSetTimeout,
    sceneActions,
    sceneState,
    stopVoice,
    triggerMiniGesture
  ]);

  // Legacy feed callback retained while Game 3 transitions are being rebuilt.
  const handleRockFeed = ({ id, data }) => {
    console.log('?? Modak dropped on rock:', id, data);

    if (!sceneState.rockVisible || sceneState.rockFeedCount >= 3) return;
    if (!data || data.type !== 'basket-modak') return;
    if (feedInFlightRef.current) return;
    feedInFlightRef.current = true;
    safeSetTimeout(() => {
      feedInFlightRef.current = false;
    }, 400);

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

      safeSetTimeout(() => {
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
            affirmation: 'I have room for every feeling.',
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
      safeSetTimeout(() => setShowSparkle(null), 1500);
    }
  };

  const resetScene = () => {
    if (idleHintsEnabled) stopIdleTimer();
    setShowIdleGestureHint(false);
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    mushikaDartIndexRef.current = 0;

    sceneActions.updateState({
      moundStates: [0, 0, 0, 0, 0],
      correctMound: Math.floor(Math.random() * 5) + 1,
      mooshikaVisible: false,
      mooshikaFound: false,
      mooshikaPosition: { top: MODAK_DISTRACTIONS[0].top, left: MODAK_DISTRACTIONS[0].left },
      activeDistractionId: MODAK_DISTRACTIONS[0].id,
      mushikaHolding: false,
      holdProgress: 0,
      moundsVanished: false,
      moundsVanishing: false,
      modakStates: [0, 0, 0],
      modakSlotIndices: pickRandomModakSlots(),
      modaksUnlocked: false,
      basketVisible: false,
      basketFull: false,
      basketReady: false,
      collectedModaks: [],
      bellyEmotionIds: [],
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
    setShowSceneCompletion(false);
    setShowMandala(false);
    setFireworksFinished(false);
    setRevealConfig(null);
  };

  const getModakImage = (index) => {
    const modakImages = [modak1, modak2, modak3];
    return modakImages[index] || modak1;
  };
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen;
  const isFinalFireworksView = showSparkle === 'final-fireworks';
  const isFinalTransitionView = isFinalFireworksView || showMandala;
  const isMooshikaSearchPhase = sceneState.phase === PHASES.MOOSHIKA_SEARCH && sceneState.welcomeShown && !sceneState.mooshikaFound;
  const isOfferingPhase =
    sceneState.modaksUnlocked &&
    !sceneState.rockVisible &&
    (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED);
  const isBellyDragPhase =
    sceneState.rockVisible &&
    (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING);
  const nextOfferingHintTarget =
    MODAK_OFFERINGS.find((_, index) => sceneState.modakStates?.[index] !== 1) ||
    MODAK_OFFERINGS[0];
  const jumpToDebugGame = useCallback((gameNumber) => {
    if (!sceneActions) return;

    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    mushikaDartIndexRef.current = 0;
    hasShownDragHintRef.current = gameNumber >= 3;

    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);
    setShowSparkle(null);
    setShowMooshikaSpeech(false);
    setShowSceneCompletion(false);
    setShowMandala(false);
    setFireworksFinished(false);
    setSceneCompleteVOFinished(false);
    setRevealConfig(null);

    const sharedState = {
      correctMound: Math.floor(Math.random() * 5) + 1,
      modakSlotIndices: Array.isArray(sceneState?.modakSlotIndices) && sceneState.modakSlotIndices.length === 3
        ? sceneState.modakSlotIndices
        : pickRandomModakSlots(),
      currentPopup: null,
      showingCompletionScreen: false,
      stars: 0,
      completed: false,
      progress: {
        percentage: gameNumber === 1 ? 0 : gameNumber === 2 ? 30 : 65,
        starsEarned: 0,
        completed: false
      }
    };

    if (gameNumber === 1) {
      sceneActions.updateState({
        ...sharedState,
        moundStates: [0, 0, 0, 0, 0],
        mooshikaVisible: true,
        mooshikaFound: false,
        mooshikaPosition: { top: MODAK_DISTRACTIONS[0].top, left: MODAK_DISTRACTIONS[0].left },
        activeDistractionId: MODAK_DISTRACTIONS[0].id,
        mushikaHolding: false,
        holdProgress: 0,
        moundsVanished: false,
        moundsVanishing: false,
        modakStates: [0, 0, 0],
        modaksUnlocked: false,
        basketVisible: false,
        basketFull: false,
        basketReady: false,
        collectedModaks: [],
        bellyEmotionIds: [],
        rockVisible: false,
        rockFeedCount: 0,
        rockTransformed: false,
        rockBellySize: 0,
        phase: PHASES.MOOSHIKA_SEARCH,
        currentFocus: 'mooshika',
        discoveredSymbols: {},
        welcomeShown: true
      });
      return;
    }

    if (gameNumber === 2) {
      sceneActions.updateState({
        ...sharedState,
        moundStates: [0, 0, 0, 0, 0],
        mooshikaVisible: true,
        mooshikaFound: true,
        mooshikaPosition: MUSHIKA_CLEARING_POSITION,
        activeDistractionId: null,
        mushikaHolding: false,
        holdProgress: 0,
        moundsVanished: true,
        moundsVanishing: false,
        modakStates: [0, 0, 0],
        modaksUnlocked: true,
        basketVisible: true,
        basketFull: false,
        basketReady: false,
        collectedModaks: [],
        bellyEmotionIds: [],
        rockVisible: false,
        rockFeedCount: 0,
        rockTransformed: false,
        rockBellySize: 0,
        phase: PHASES.MODAKS_UNLOCKED,
        currentFocus: 'modak',
        discoveredSymbols: { mooshika: true },
        welcomeShown: true
      });
      return;
    }

    sceneActions.updateState({
      ...sharedState,
      moundStates: [0, 0, 0, 0, 0],
      mooshikaVisible: true,
      mooshikaFound: true,
      mooshikaPosition: MUSHIKA_CLEARING_POSITION,
      activeDistractionId: null,
      mushikaHolding: false,
      holdProgress: 0,
      moundsVanished: true,
      moundsVanishing: false,
      modakStates: [1, 1, 1],
      modaksUnlocked: true,
      basketVisible: true,
      basketFull: true,
      basketReady: false,
      collectedModaks: [],
      bellyEmotionIds: [],
      rockVisible: true,
      rockFeedCount: 0,
      rockTransformed: false,
      rockBellySize: 0,
      phase: PHASES.ROCK_VISIBLE,
      currentFocus: 'belly',
      discoveredSymbols: { mooshika: true, modak: true },
      mooshikaPosition: MUSHIKA_BELLY_POSITION,
      welcomeShown: true
    });
  }, [
    clearMushikaDartTimer,
    clearMushikaHoldLoop,
    idleHintsEnabled,
    sceneActions,
    sceneState?.modakSlotIndices,
    stopIdleTimer,
    stopVoice
  ]);
  const toggleModakDebugSlots = useCallback(() => {
    const next = !debugSlotsPreview;
    setDebugSlotsPreview(next);
    setDebugSlotCenters(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('debugModakUI', '1');
      window.localStorage.setItem('debugModakSlots', next ? '1' : '0');
      window.localStorage.setItem('debugModakSlotCenters', next ? '1' : '0');
    }
  }, [debugSlotsPreview]);

  const persistSlotPositions = useCallback((positions) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MODAK_SLOT_POSITIONS_KEY, JSON.stringify(positions));
    }
  }, []);

  const resetSlotPositions = useCallback(() => {
    setSlotPositions(MODAK_POSITION_SLOTS);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(MODAK_SLOT_POSITIONS_KEY);
    }
  }, []);

  const updateSlotFromPointer = useCallback((slotIndex, clientX, clientY) => {
    const el = backgroundRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    setSlotPositions((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        top: `${Math.round(clampedY * 10) / 10}%`,
        left: `${Math.round(clampedX * 10) / 10}%`
      };
      return next;
    });
  }, []);

  useEffect(() => {
    if (!debugSlotsPreview || draggingSlotIndex === null) return undefined;
    const handleMove = (e) => updateSlotFromPointer(draggingSlotIndex, e.clientX, e.clientY);
    const handleUp = () => {
      setDraggingSlotIndex(null);
      persistSlotPositions(slotPositions);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [debugSlotsPreview, draggingSlotIndex, updateSlotFromPointer, persistSlotPositions, slotPositions]);

  // ========================================
  // MVP RENDER - No GameLayout, No Header
  // ========================================
  return (
    <div data-zone="symbol-mountain">
      {!isFinalTransitionView && <HomeButton onNavigate={(dest) => { stopVoice(); onNavigate?.(dest); }} />}
      {!isFinalTransitionView && <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => { stopVoice(); onNavigate?.('zone-welcome'); }} />}
      {!isFinalTransitionView && <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />}
      {!isFinalTransitionView && (
        <VOReplayButton
          getLine={() => lastVoRef.current}
          speak={replaySpeak}
          disabled={!isAudioOn || !lastVoRef.current}
        />
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && (
        <button
          type="button"
          onClick={toggleModakDebugSlots}
          style={{
            position: 'fixed',
            top: '12px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #0f766e',
            background: debugSlotsPreview ? '#0f766e' : '#ffffff',
            color: debugSlotsPreview ? '#ffffff' : '#0f766e',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          {debugSlotsPreview ? 'Debug Slots On' : 'Debug Slots'}
        </button>
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && debugSlotsPreview && (
        <button
          type="button"
          onClick={() => persistSlotPositions(slotPositions)}
          style={{
            position: 'fixed',
            top: '46px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #2563eb',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Save Slots
        </button>
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && debugSlotsPreview && (
        <button
          type="button"
          onClick={resetSlotPositions}
          style={{
            position: 'fixed',
            top: '80px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #b91c1c',
            background: '#ffffff',
            color: '#b91c1c',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Reset Slots
        </button>
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && (
        <button
          type="button"
          onClick={() => jumpToDebugGame(1)}
          style={{
            position: 'fixed',
            top: '114px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #7c3aed',
            background: '#ffffff',
            color: '#7c3aed',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Debug Game 1
        </button>
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && (
        <button
          type="button"
          onClick={() => jumpToDebugGame(2)}
          style={{
            position: 'fixed',
            top: '148px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #7c3aed',
            background: '#ffffff',
            color: '#7c3aed',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Debug Game 2
        </button>
      )}
      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && (
        <button
          type="button"
          onClick={() => jumpToDebugGame(3)}
          style={{
            position: 'fixed',
            top: '182px',
            right: '74px',
            zIndex: 1200,
            border: '1px solid #7c3aed',
            background: '#ffffff',
            color: '#7c3aed',
            borderRadius: '999px',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Debug Game 3
        </button>
      )}
      {/* Flying Symbol Clone (useSymbolCollection) � superseded by SymbolAutoReveal */}
      {/* {flyingSymbol && <img className="flying-symbol" src={flyingSymbol.src} alt="" style={flightStyle} />} */}

      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
            <div className="modak-game-container">
              {showPersistentEndOverlay && !revealConfig && (
                <div className="modak-game-end-overlay" />
              )}
              <div ref={backgroundRef} className="modak-game-background" style={{ backgroundImage: `url(${forestBackground})` }}>
                {!isCompletionView && !isFinalTransitionView && (
                  <>
              {/* --- OPENING MODAL --- */}
              {sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown && (
                <OpeningModal
                  zoneId={zoneId}
                  sceneId={sceneId}
                  onStart={() => {
                    playUiTap();
                    mushikaDartIndexRef.current = 0;
                    sceneActions.updateState({
                      welcomeShown: true,
                      mooshikaVisible: true,
                      mooshikaPosition: { top: MODAK_DISTRACTIONS[0].top, left: MODAK_DISTRACTIONS[0].left },
                      activeDistractionId: MODAK_DISTRACTIONS[0].id,
                      mushikaHolding: false,
                      holdProgress: 0
                    });
                  }}
                  characterImg={ganeshaFeeding}
                  showButton={true}
                />
              )}

              {/* MUSHIKA + DISTRACTIONS */}
              {sceneState.welcomeShown &&
                [PHASES.MOOSHIKA_SEARCH, PHASES.MOOSHIKA_FOUND].includes(sceneState.phase) &&
                <>
                  {MODAK_DISTRACTIONS.map((item) => {
                    const isActive = sceneState.activeDistractionId === item.id && sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.mushikaHolding;
                    const isFaded = sceneState.mushikaHolding || sceneState.phase === PHASES.MOOSHIKA_FOUND;
                    return (
                      <img
                        key={item.id}
                        src={item.image}
                        alt={item.id}
                        className={`modak-game-distraction modak-game-distraction--${item.id} ${isActive ? 'active' : ''} ${isFaded ? 'fading' : ''}`}
                        style={{ top: item.top, left: item.left }}
                      />
                    );
                  })}

                  {sceneState.mooshikaVisible && (
                    <button
                      type="button"
                      className={`modak-game-mushika-search ${sceneState.phase === PHASES.MOOSHIKA_FOUND ? 'walking' : 'darting'} ${sceneState.mushikaHolding ? 'holding' : ''}`}
                      style={sceneState.mooshikaPosition || { top: MODAK_DISTRACTIONS[0].top, left: MODAK_DISTRACTIONS[0].left }}
                      onPointerDown={handleMushikaHoldStart}
                      onPointerUp={handleMushikaHoldEnd}
                      onPointerLeave={handleMushikaHoldEnd}
                      onPointerCancel={handleMushikaHoldEnd}
                      onTouchStart={handleMushikaHoldStart}
                      onTouchEnd={handleMushikaHoldEnd}
                    >
                      {sceneState.mushikaHolding && (
                        <span
                          className="modak-game-hold-ring"
                          style={{ clipPath: `inset(${(1 - (sceneState.holdProgress || 0)) * 100}% 0 0 0)` }}
                          aria-hidden="true"
                        />
                      )}
                      <img
                        src={sceneState.phase === PHASES.MOOSHIKA_FOUND ? mooshikaCalm : mooshikaActive}
                        alt="Mooshika"
                        style={{
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          userSelect: 'none'
                        }}
                      />

                      {showSparkle === 'mooshika-calm' && (
                        <>
                          <span className="modak-game-mushika-calm-aura" aria-hidden="true" />
                          <SparkleAnimation
                            type="magic"
                            count={14}
                            color="#ffd76b"
                            size={10}
                            duration={1200}
                            fadeOut={true}
                            area="full"
                          />
                        </>
                      )}
                    </button>
                  )}
                </>
              }

              {/* OFFERINGS APPEARING SPARKLES */}
              {showSparkle === 'modaks-appearing' && (
                <>
                  {MODAK_OFFERINGS.map((item) => {
                    return (
                      <div
                        key={`offering-appear-sparkle-${item.id}`}
                        style={{ position: 'absolute', top: item.top, left: item.left, transform: 'translate(-50%, -50%)', width: '80px', height: '80px', zIndex: 11 }}
                      >
                        <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
                      </div>
                    );
                  })}
                </>
              )}

              {/* TEMP DEBUG: visualize selected slot centers for this run */}
              {MODAK_DEBUG_UI_ENABLED && debugSlotCenters && (sceneState.modakSlotIndices || []).map((slotIndex, idx) => {
                const slot = slotPositions[slotIndex];
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
              {MODAK_DEBUG_UI_ENABLED && debugSlotsPreview && slotPositions.map((slot, idx) => (
                <div
                  key={`modak-slot-preview-${idx}`}
                  className="modak-slot-anchor modak-slot-preview"
                  style={{ top: slot.top, left: slot.left, pointerEvents: 'auto', cursor: 'grab' }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDraggingSlotIndex(idx);
                    updateSlotFromPointer(idx, e.clientX, e.clientY);
                  }}
                  aria-hidden="true"
                >
                  <div className="modak-game-modak modak-game-modak-field modak-slot-preview-card">
                    <img src={modak1} alt="" />
                  </div>
                </div>
              ))}

              {/* OFFERINGS COMPLETE CELEBRATION SPARKLES */}
              {showSparkle === 'offerings-complete' && (
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

              {/* OFFERINGS */}
              {sceneState.modaksUnlocked && MODAK_OFFERINGS.map((item, index) => {
                if (sceneState.modakStates[index] === 1) return null;
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
                  <KidsDropZone
                    id={`offering-zone-${item.id}`}
                    key={`offering-${item.id}`}
                    accepts="mushika-offering"
                    onDrop={({ id, data }) => handleOfferingDrop({ id, data: { ...data, offeringIndex: index } })}
                    style={{
                      position: 'absolute',
                      top: item.top,
                      left: item.left,
                      transform: 'translate(-50%, -50%)',
                      width: 'clamp(100px, 9vw, 150px)',
                      height: 'clamp(100px, 9vw, 150px)',
                      zIndex: 12
                    }}
                  >
                    <div
                      className={`modak-game-modak modak-game-offering modak-game-modak-field modak-game-modak-field-${index + 1}
                        ${modakHintClass}`}
                    >
                      <img
                        src={item.image}
                        alt={item.label}
                        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                      />

                      {showSparkle === `offering-${index}` && (
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
                  </KidsDropZone>
                );
              })}

              {sceneState.modaksUnlocked && !sceneState.rockVisible && sceneState.mooshikaVisible && showSparkle !== 'modak-satisfaction' && (
                <KidsDraggable
                  id="mushika-offering"
                  data={{ type: 'mushika-offering' }}
                  dragScale={1.08}
                  dragFilter="drop-shadow(0 10px 18px rgba(97, 63, 20, 0.22))"
                  dragBorderRadius="28px"
                  style={{
                    position: 'absolute',
                    width: 'clamp(118px, 10.5vw, 172px)',
                    height: 'clamp(118px, 10.5vw, 172px)',
                    left: (sceneState.mooshikaPosition || MUSHIKA_OFFERING_START_POSITION).left,
                    top: (sceneState.mooshikaPosition || MUSHIKA_OFFERING_START_POSITION).top,
                    transform: `translate(-50%, -50%)${isOfferingDragActive ? ' scale(1.04)' : ''}`,
                    zIndex: 15,
                    touchAction: 'none'
                  }}
                  onDragStart={handleOfferingDragStart}
                  onDragEnd={handleOfferingDragEnd}
                >
                  <img
                    src={mooshikaCalm}
                    alt="Mooshika with basket"
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  />
                  <div className="modak-game-mushika-basket-pack" aria-hidden="true">
                    {MODAK_OFFERINGS.map((offering, idx) => (
                      <div key={`pack-${offering.id}`} className="modak-game-mushika-pack-slot">
                        {sceneState.modakStates[idx] === 1 ? (
                          <img src={offering.image} alt="" />
                        ) : (
                          <span className="modak-game-mushika-pack-dot" />
                        )}
                      </div>
                    ))}
                  </div>
                </KidsDraggable>
              )}

              {showSparkle === 'modak-satisfaction' && (
                <div
                  className="modak-game-modak-satisfaction"
                  style={sceneState.mooshikaPosition || MUSHIKA_OFFERING_START_POSITION}
                >
                  <div className="modak-game-modak-satisfaction-glow" />
                  <img
                    src={mooshikaCalm}
                    alt="Calm Mooshika"
                    className="modak-game-modak-satisfaction-mushika"
                  />
                  <div className="modak-game-modak-satisfaction-pack" aria-hidden="true">
                    {MODAK_OFFERINGS.map((offering, idx) => (
                      <div key={`satisfaction-pack-${offering.id}`} className="modak-game-mushika-pack-slot">
                        {sceneState.modakStates[idx] === 1 ? (
                          <img src={offering.image} alt="" />
                        ) : (
                          <span className="modak-game-mushika-pack-dot" />
                        )}
                      </div>
                    ))}
                  </div>
                  <img src={symbolModakColored} alt="Golden Modak" className="modak-game-modak-satisfaction-icon" />
                </div>
              )}

              {/* GAME 3 - FEELINGS INTO BELLY */}
              {sceneState.rockVisible && (
                <div className="modak-game-belly-stage">
                  <div className={`modak-game-belly-mushika-area ${sceneState.rockTransformed ? 'complete' : ''}`}>
                    <img
                      src={mooshikaCalm}
                      alt="Mooshika"
                      className="modak-game-belly-mushika"
                    />
                    {BELLY_EMOTIONS.filter((emotion) => !(sceneState.bellyEmotionIds || []).includes(emotion.id)).map((emotion) => (
                      <KidsDraggable
                        key={emotion.id}
                        id={`belly-emotion-${emotion.id}`}
                        data={{ type: 'belly-emotion', emotionId: emotion.id }}
                        dragScale={1.05}
                        dragFilter="drop-shadow(0 8px 16px rgba(97, 63, 20, 0.2))"
                        dragBorderRadius="50%"
                        style={{
                          position: 'absolute',
                          left: emotion.left,
                          right: emotion.right,
                          top: emotion.top,
                          bottom: emotion.bottom,
                          zIndex: 4
                        }}
                        onDragStart={() => recordInteraction()}
                      >
                        <img
                          src={emotion.image}
                          alt={emotion.label}
                          className={`modak-game-emotion-orb ${emotion.orbClass}`}
                        />
                      </KidsDraggable>
                    ))}
                  </div>

                  <div className="modak-game-belly-ganesha-area">
                    <img
                      src={GANESHA_SIT_FEED_IMAGE}
                      alt="Ganesha"
                      className="modak-game-belly-ganesha"
                    />
                    <KidsDropZone
                      id="ganesha-belly-zone"
                      accepts="belly-emotion"
                      onDrop={handleBellyEmotionDrop}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '72%',
                        width: '31%',
                        aspectRatio: '1.12',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        zIndex: 5
                      }}
                    >
                      <div className={`modak-game-belly-zone ${isBellyPulseActive ? 'belly-pulse' : ''} ${sceneState.rockTransformed ? 'belly-complete' : ''}`}>
                        <div className="modak-game-belly-glow" />
                        <div className="modak-game-belly-inside-emotions">
                          {(sceneState.bellyEmotionIds || []).map((emotionId) => {
                            const emotion = BELLY_EMOTIONS.find((item) => item.id === emotionId);
                            if (!emotion) return null;
                            return (
                              <span
                                key={`inside-${emotionId}`}
                                className={`modak-game-belly-inside-emotion ${emotion.insideClass}`}
                              >
                                <img src={emotion.image} alt="" />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </KidsDropZone>
                    {sceneState.rockTransformed && (
                      <div className="modak-game-belly-completion-halo" aria-hidden="true" />
                    )}
                  </div>
                </div>
              )}

              {/* LEGACY FEED TARGET REMOVED */}
              {false && sceneState.rockVisible && (
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
                      type={showSparkle === 'belly-transform' ? 'glitter' : 'star'}
                      count={showSparkle === 'belly-transform' ? 25 : 12}
                      color="#FFD700"
                      size={showSparkle === 'belly-transform' ? 12 : 7}
                      duration={showSparkle === 'belly-transform' ? 2000 : 1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* Phase-specific gesture demos for the three games. */}
              {showIdleGestureHint && isMooshikaSearchPhase && (
                <div
                  className="modak-drag-hint-overlay modak-gesture-demo modak-gesture-demo--hold-mooshika"
                  style={{
                    '--hint-left': (sceneState.mooshikaPosition || MODAK_DISTRACTIONS[0]).left,
                    '--hint-top': (sceneState.mooshikaPosition || MODAK_DISTRACTIONS[0]).top
                  }}
                  aria-hidden="true"
                >
                  <img className="modak-drag-hint-hand" src="/images/ganesha-point.webp" alt="" />
                </div>
              )}

              {showIdleGestureHint && isOfferingPhase && (
                <div
                  className="modak-drag-hint-overlay modak-gesture-demo modak-gesture-demo--mooshika-offering"
                  style={{
                    '--hint-start-left': (sceneState.mooshikaPosition || MUSHIKA_OFFERING_START_POSITION).left,
                    '--hint-start-top': (sceneState.mooshikaPosition || MUSHIKA_OFFERING_START_POSITION).top,
                    '--hint-end-left': nextOfferingHintTarget.left,
                    '--hint-end-top': nextOfferingHintTarget.top
                  }}
                  aria-hidden="true"
                >
                  <img className="modak-drag-hint-hand" src="/images/ganesha-point.webp" alt="" />
                </div>
              )}

              {showIdleGestureHint && isBellyDragPhase && (
                <div className="modak-drag-hint-overlay modak-gesture-demo modak-gesture-demo--emotion-belly" aria-hidden="true">
                  <img className="modak-drag-hint-hand" src="/images/ganesha-point.webp" alt="" />
                </div>
              )}



              {/* MINI THUMBS-UP CUE � micro rewards + reassurance across phase transitions */}
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
                  {/* <img
                    src={foregroundOverlay}
                    alt=""
                    className="modak-game-foreground-overlay"
                    aria-hidden="true"
                  /> */}
                </>
              )}

            </div>

            {/* FIREWORKS � old <Fireworks> replaced by <FireworksCompletion> */}
            {/* <Fireworks
                show={showSparkle === 'final-fireworks'}
                duration={15000}
                onComplete={() => {
                  console.log('? Fireworks finished');
                  setShowMandala(true);
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

            {/* Visual-only fireworks � no card/buttons. SceneCompletionCelebration
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
                particles={8}
                duration={1500}
                onComplete={() => {
                  setShowMandala(true);
                  setShowSparkle(null);
                  setFireworksFinished(true);
                }}
              />
            )}

            {showMandala && (
              <InnerMandala
                childName={activeProfile?.name || 'Friend'}
                symbolPetalStates={{}}
                justEarnedPetals={[
                  { ring: 'middle', id: 1 },
                  { ring: 'middle', id: 2 },
                  { ring: 'middle', id: 3 },
                ]}
                earnedSymbols={[
                  { id: 'mooshika', petalId: 1, ring: 'middle', image: symbolMooshikaColored },
                  { id: 'modak', petalId: 2, ring: 'middle', image: symbolModakColored },
                  { id: 'belly', petalId: 3, ring: 'middle', image: symbolBellyColored },
                ]}
                autoCloseMs={3000 + (3 * 950) + 2600}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  playTransition();
                  setShowSceneCompletion(true);
                  // Persist completion so reload restores this screen and
                  // analytics' unmount check sees the scene as finished.
                  sceneActions.updateState({
                    completed: true,
                    showingCompletionScreen: true
                  });
                }}
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
                    title: "Mooshika � Ganesha's Clever Friend!",
                    description: "A tiny mouse with a big heart! Mooshika helps Ganesha travel anywhere and reminds us to stay humble & smart."
                  },
                  modak: {
                    title: "Modak � Ganesha's Sweet Treat!",
                    description: "A magical sweet that fills you with happy, joyful energy!"
                  },
                  belly: {
                    title: "Belly � Big Happy Tummy!",
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
            {!isCompletionView && !isFinalTransitionView && revealConfig && (
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

            {!isCompletionView && !isFinalTransitionView && (
              <CulturalCelebrationModal
                show={showCulturalCelebration}
                onClose={() => setShowCulturalCelebration(false)}
                {...CulturalProgressExtractor.getCulturalProgressData()}
              />
            )}

            {/* SIDE RAIL - hide during final fireworks and celebration popup */}
              {!isCompletionView && !isFinalTransitionView && sceneState.welcomeShown && !isFinalCelebrationActive && (
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

      {/* 3-2-1 resume countdown � renders on top of everything when child returns to tab */}
      <ResumeCountdown value={countdownValue} />
    </div>
  );
};

export default NewModakSceneMVP;
