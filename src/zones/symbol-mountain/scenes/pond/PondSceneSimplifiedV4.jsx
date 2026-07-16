// zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV5.jsx
// V5 GAMEPLAY UPDATE (locked spec):
//   Phase 1 — Hold to bloom (3 lotuses, escalating focus: clean / fish swim-by / soft ripples)
//   Phase 2 — Tap golden bud → baby elephant emerges and grows
//   Phase 3 — Drag water drop along curved petal path (3 stepping stones, soft snap)
//   Phase 4 — Final reveal (existing flow preserved)
// All non-gameplay systems (reload, hints, audio, voice, sidebar, completion) untouched.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PondScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure theme vars are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Shared Components
import OpeningModal from '../../../shared/components/OpeningModal';

// --- NEW MASTER LAYOUT & CONFIG ---
import GameLayout from '../../../../lib/components/layout/GameLayout';
import { pondHelpConfig } from './helpConfig';
// ----------------------------------

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';

// UI Components
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import pondGameBg from './assets/images/pondbg.png';
import pondGameTreeOverlay from './assets/images/pond-tree.png';
import lotusClosed from './assets/images/lotus-closed-new.webp';
import lotusBloomed from './assets/images/lotus-bloomed-new.webp';
import goldenLotusClosed from './assets/images/goldenlotus-bud-new.webp';
import goldenLotusBloomed from './assets/images/goldenlotus-bloom-new.webp';
import pondFishImage from './assets/images/fish-new.webp';
import elephantFull from './assets/images/elephant-new.webp';
import mooshikaCoach from "./assets/images/mooshika-coach.webp";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.webp';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.webp';

// Mission images
import lotusBefore from './assets/images/lotus-before.webp';
import lotusAfter from './assets/images/lotus-after.webp';
import trunkBefore from './assets/images/trunk-before.webp';
import trunkAfter from './assets/images/trunk-after.webp';
import ganeshaCharacter from './assets/images/ganesha-character.webp';

const GANESHA_REFLECTION_IMAGE = '/images/ganesha-sit.svg';

const RESUME_DELAY_MS = 3000;

const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MINI_VICTORY_ICON   = '/images/hand-victory.svg';
const MINI_OK_ICON        = '/images/hand-ok.svg';

const PHASES = {
  INITIAL: 'initial',
  SOME_BLOOMED: 'some_bloomed',
  ALL_BLOOMED: 'all_bloomed',
  GOLDEN_VISIBLE: 'golden_visible',
  ELEPHANT_VISIBLE: 'elephant_visible',
  ELEPHANT_TRANSFORMED: 'elephant_transformed',
  GOLDEN_BLOOM: 'golden_bloom',
  COMPLETE: 'complete'
};

const VOICE_LINES = {
  // Entry
  opening: "A golden lotus is waiting... let's see it bloom.",

  // Lotus phase
  lotusRound: 'Three lotuses are sleeping. Press and hold... let it bloom.',
  idleLotus: 'Hold it gently... watch it open.',
  lotusBloomPower: 'You stayed with it... nice and slow. Say it with me... I stay calm.',

  // Golden lotus phase
  goldenLotus: 'Look. A golden bud. Tap it.',
  idleGolden: 'Tap the golden bud.',

  // Elephant tap phase (before drag starts)
  elephant: 'Can you see an elephant? Tap it.',
  idleElephant: 'Tap the little elephant.',

  // Water drag phase
  trunkRound: 'Drag the drop. To the golden bud.',
  dragWaterIdle: 'Drag the drop. To the golden bud.',
  waterPathPower: "You followed the path... and reached it. Say it with me... I find my way.",

  // Completion
  complete: 'You stayed calm. You found your way. All yours.'
};

const powerConfig = {
  lotus: {
    name: 'Sacred Purity',
    image: symbolLotusColored,
    color: '#4ECDC4'
  },
  trunk: {
    name: 'Divine Blessing',
    image: symbolTrunkColored,
    color: '#FFD700'
  }
};

const missionImages = {
  lotus: { before: lotusBefore, after: lotusAfter },
  trunk: { before: trunkBefore, after: trunkAfter }
};

// ==================== V5 GAMEPLAY CONFIG ====================
// Hold-to-bloom: each lotus has its own hold duration + ambient distraction.
// Distractions are VISUAL ONLY — they never interrupt the hold mechanically.
const LOTUS_HOLD_CONFIG = [
  { id: 0, holdMs: 1500, ambient: 'none'    }, // Lotus 1: clean, easy success
  { id: 1, holdMs: 1500, ambient: 'fish'    }, // Lotus 2: fish swims by (visual only)
  { id: 2, holdMs: 2000, ambient: 'ripples' }  // Lotus 3: soft ripples (visual only)
];

// Forgiving release: when finger lifts, glow shrinks at 2× speed.
// Within 1s of release, hold resumes from current value.
// After 1s, hold resets to 0.
const HOLD_DECAY_MULTIPLIER = 2;
const HOLD_RESET_GRACE_MS = 1000;

// Drag-along-curve: 3 petal stepping stones along a gentle curve from
// elephant trunk (left) → golden lotus (center). Coordinates are %.
// The drop "snaps" forward when the finger is within SNAP_RADIUS_PCT.
const DROP_START_POINT = { x: 42, y: 34.2 };
const GOLDEN_LOTUS_TARGET_POINT = { x: 52, y: 46.7 };
const PETAL_STEPPING_STONES = [
  { id: 'p1', x: 47.8, y: 35 },
  { id: 'p2', x: 52.7, y: 38.5 },
  { id: 'p3', x: 53.9, y: 47.5 }
];
const PETAL_SNAP_RADIUS_PCT = 8;       // % of viewport diagonal
const DROP_FADE_MS = 400;              // off-path fade duration
const PETAL_STEP_LOCK_MS = 250;        // prevent instant multi-step snaps
const ELEPHANT_MOVE_DURATION_MS = 1200;
const DROP_APPEAR_BUFFER_MS = 120;
const TRUNK_SPARKLE_DURATION_MS = 1000;
const DROP_MAGIC_PULSE_MS = 400;
const DROP_MAGIC_STREAM_MS = 300;
const DROP_MAGIC_PRE_BLOOM_PAUSE_MS = 120;
const POND_OVERLAY_MID = pondGameTreeOverlay;
const POND_OVERLAY_FRONT = '';
// =============================================================

const discoveryConfig = {
  lotus: {
    foundTitle: "You Bloomed All Lotuses!",
    foundSubtitle: "Something magical appears...",
    powerName: "Sacred Purity",
    image: symbolLotusColored
  },
  trunk: {
    foundTitle: "The Pond is Full!",
    foundSubtitle: "Ganesha's trunk reveals its power...",
    powerName: "Divine Blessing",
    image: symbolTrunkColored
  }
};

// Error Boundary Component
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

const PondSceneSimplifiedV5 = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'pond'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          lotusStates: [0, 0, 0],
          goldenLotusVisible: false,
          goldenLotusBloom: false,
          elephantVisible: false,
          elephantTransformed: false,
          trunkActive: false,
          phase: 'initial',
          currentFocus: 'lotus',
          discoveredSymbols: {
            mooshika: true,
            modak: true,
            belly: true,
          },
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
          <PondSceneContent
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

const PondSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'pond', getSceneResetConfig('pond'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'Friend';

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false);
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);

  // Discovery overlay states

  // Resume popup states

  // Discovery overlay states (kept to avoid undeclared-var errors; never set to true — SymbolAutoReveal handles discovery now)
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // eslint-disable-line no-unused-vars
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // eslint-disable-line no-unused-vars
  const [revealConfig, setRevealConfig] = useState(null);

  // ==================== V5 HOLD-TO-BLOOM STATE ====================
  // holdProgress: 0–1 per lotus. Drives the glow ring + petal-open animation.
  const [holdProgress, setHoldProgress] = useState([0, 0, 0]);
  const holdTimersRef = useRef([null, null, null]);     // active hold rAF ids
  const holdReleaseRef = useRef([null, null, null]);    // release decay rAF ids
  const holdResetTimerRef = useRef([null, null, null]); // 1s grace timers
  const holdStartedAtRef = useRef([0, 0, 0]);

  // ==================== V5 DRAG-PATH STATE ====================
  // dragActive: whether finger is currently dragging the water drop.
  // dropPosition: current % position of the drop (or null = at start).
  // currentPetal: index of last reached petal (-1 = none yet, 2 = at lotus).
  const [dragActive, setDragActive] = useState(false);
  const [dropPosition, setDropPosition] = useState(null);
  const [currentPetal, setCurrentPetal] = useState(-1);
  const [dropFading, setDropFading] = useState(false);
  const [dropMagicPhase, setDropMagicPhase] = useState(null);
  const dragContainerRef = useRef(null);
  const dragActiveRef = useRef(false);
  const petalAdvanceLockUntilRef = useRef(0);
  const dropCompletedRef = useRef(false);
  // ================================================================


  // Mini gesture cue
  const [miniGesture, setMiniGesture] = useState({ show: false, target: 'center', durationMs: 1500, key: 0, icon: MINI_THUMBS_UP_ICON });
  const triggerMiniGesture = useCallback((target = 'center', durationMs = 1500, icon = MINI_THUMBS_UP_ICON) => {
    setMiniGesture(prev => ({ show: true, target, durationMs, key: prev.key + 1, icon }));
    setTimeout(() => setMiniGesture(prev => ({ ...prev, show: false })), durationMs);
  }, []);

  // Audio
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const { setGlobalVolume } = useGameSounds();
  const { startMusic, stopMusic, setVoiceVolume, playTap, playCorrect, playPowerUnlock, playCelebration } = useVoiceGuidance(
    zoneId, sceneId, {
      enableMusic: true,
      musicVolume: 0.06,
      sfxVolume: 0.7,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,
    }
  );
  const playUiTap = playTap;
  const playBloom = playCorrect;
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;
  const playTwinkle = playCelebration;
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);
  useEffect(() => { if (sceneState?.welcomeShown) startMusic(); }, [sceneState?.welcomeShown]);
  useEffect(() => {
    setGlobalVolume(0.35);
    return () => { stopMusic(); setGlobalVolume(1.0); };
  }, []);

  // Resume popup timeout ref
  const resumePopupTimeoutRef = useRef(null);

  // Backfill missing phase for older saved state objects (effect, not render).
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });
  }, [sceneState?.phase, sceneActions]);

  // Live ref of sceneState so rAF hold callbacks never read a stale snapshot
  // (two-finger simultaneous holds were losing blooms).
  const sceneStateRef = useRef(sceneState);
  useEffect(() => { sceneStateRef.current = sceneState; }, [sceneState]);
  const pendingLotusStatesRef = useRef(null);
  useEffect(() => { pendingLotusStatesRef.current = null; }, [sceneState?.lotusStates]);

  const progressiveHintRef = useRef(null);
  const reloadHandledRef = useRef(false);

  const lastAnnouncedPromptRef = useRef(null);
  const resumePromptPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);
  const wasAudioOnRef = useRef(isAudioOn);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const resetIdleBaseline = useCallback(() => {
    idleVoGateRef.current = false;
    setIdleHintLevel(0);
    lastIdleInteractionAtRef.current = Date.now();
  }, []);

  const rearmIdleHints = useCallback(() => {
    setHintResetKey(k => k + 1);
  }, []);

  const speakPondPrompt = useCallback((key) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 7,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement'
    });
  }, [isAudioOn, speak]);
  const getPromptKeyForPhase = useCallback(() => {
    if (!sceneState?.welcomeShown) return 'opening';
    if (revealConfig?.symbolId === 'trunk' || showSparkle === 'final-fireworks') return null;
    if (sceneState?.phase === PHASES.COMPLETE) return 'complete';
    if (sceneState?.phase === PHASES.ELEPHANT_TRANSFORMED && !sceneState?.completed) return 'trunkRound';
    if (sceneState?.phase === PHASES.ELEPHANT_VISIBLE && !sceneState?.elephantTransformed) return 'elephant';
    if (sceneState?.phase === PHASES.GOLDEN_VISIBLE && !sceneState?.elephantVisible) return 'goldenLotus';
    if (sceneState?.phase === PHASES.INITIAL || sceneState?.phase === PHASES.SOME_BLOOMED) return 'lotusRound';
    return null;
  }, [
    sceneState?.completed,
    sceneState?.elephantTransformed,
    sceneState?.elephantVisible,
    sceneState?.phase,
    sceneState?.welcomeShown,
    revealConfig?.symbolId,
    showSparkle
  ]);
  const replayCurrentVoice = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) speakPondPrompt(replayKey);
  }, [getPromptKeyForPhase, speakPondPrompt]);
  function cancelActiveDrag() {
    if (!dragActiveRef.current) return;
    setDragActive(false);
    setDropFading(true);
    dropCompletedRef.current = false;
    safeSetTimeout(() => {
      setCurrentPetal(-1);
      setDropPosition({ x: DROP_START_POINT.x, y: DROP_START_POINT.y });
      setDropFading(false);
      setDropMagicPhase(null);
      petalAdvanceLockUntilRef.current = 0;
    }, DROP_FADE_MS);
  }

  function onPauseHide() {
    stopSpokenVoice();
    cancelActiveDrag();
  }
  const onPauseShow = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) {
      resetIdleBaseline();
      speakPondPrompt(replayKey);
    }
    rearmIdleHints();
  }, [getPromptKeyForPhase, resetIdleBaseline, speakPondPrompt, rearmIdleHints]);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => {
    dragActiveRef.current = dragActive;
  }, [dragActive]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopSpokenVoice();
      reloadHandledRef.current = false;
    };
  }, [clearAllTimeouts, stopSpokenVoice]);

  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;

    if (!wasAudioOn && isAudioOn) {
      idleVoGateRef.current = false;
      lastAnnouncedPromptRef.current = null;
      resumePromptPlayedRef.current = false;

      if (revealConfig?.symbolId) {
        const voMap = { lotus: 'lotusBloomPower', trunk: 'waterPathPower' };
        const voKey = voMap[revealConfig.symbolId];
        if (voKey) {
          speakPondPrompt(voKey);
          return;
        }
      }

      const replayKey = getPromptKeyForPhase();
      if (replayKey) speakPondPrompt(replayKey);
    }
  }, [isAudioOn, revealConfig, getPromptKeyForPhase, speakPondPrompt]);

  // Reset hook:
  // 1) clear current hint visuals
  // 2) reset idle hint level to 0
  // 3) restart the level timer from now
  useEffect(() => {
    setIdleHintLevel(0);
    idleVoGateRef.current = false;
    lastIdleInteractionAtRef.current = Date.now();
  }, [hintResetKey]);

  useEffect(() => {
    if (!isAudioOn) return;
    const promptKey = getPromptKeyForPhase();
    if (!promptKey || revealConfig || showSceneCompletion || isSymbolPopupOpen) return;
    if (promptKey === 'trunkRound' && !dropPosition) return;
    if (lastAnnouncedPromptRef.current === promptKey) return;

    const timer = setTimeout(() => {
      resetIdleBaseline();
      speakPondPrompt(promptKey);
      lastAnnouncedPromptRef.current = promptKey;
    }, promptKey === 'complete' ? 250 : promptKey === 'trunkRound' ? 850 : 500);
    return () => clearTimeout(timer);
  }, [
    isAudioOn,
    sceneState?.phase,
    sceneState?.welcomeShown,
    sceneState?.completed,
    sceneState?.elephantTransformed,
    sceneState?.elephantVisible,
    dropPosition,
    isSymbolPopupOpen,
    revealConfig,
    showSceneCompletion
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Deterministic idle ladder:
  // L1 @ 10s (hint), L2 @ 18s (hint-strong), L3 @ 26s (hint-final + gesture).
  useEffect(() => {
    const hintPhases = [
      PHASES.INITIAL,
      PHASES.SOME_BLOOMED,
      PHASES.GOLDEN_VISIBLE,
      PHASES.ELEPHANT_VISIBLE,
      PHASES.ELEPHANT_TRANSFORMED
    ];
    const isHintPhase = hintPhases.includes(sceneState?.phase)
      && sceneState?.welcomeShown
      && !isSymbolPopupOpen
      && !revealConfig
      && !showSceneCompletion;

    if (!isHintPhase) {
      setIdleHintLevel(0);
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
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    isSymbolPopupOpen,
    revealConfig,
    showSceneCompletion
  ]);

  const hintClassName = idleHintLevel === 1
    ? 'hint'
    : idleHintLevel === 2
      ? 'hint-strong'
      : idleHintLevel >= 3
        ? 'hint-final'
        : '';

  useEffect(() => {
    if (idleHintLevel < 2) return;
    if (idleVoGateRef.current) return;

    let idleKey = 'idleLotus';
    if (sceneState?.phase === PHASES.GOLDEN_VISIBLE) idleKey = 'idleGolden';
    if (sceneState?.phase === PHASES.ELEPHANT_VISIBLE) idleKey = 'idleElephant';
    if (sceneState?.phase === PHASES.ELEPHANT_TRANSFORMED) idleKey = 'dragWaterIdle';
    speakPondPrompt(idleKey);
    idleVoGateRef.current = true;
  }, [idleHintLevel, sceneState?.phase, speakPondPrompt]);

  // Re-arm hints when phase/context changes.
  useEffect(() => {
    rearmIdleHints();
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    revealConfig,
    showSceneCompletion,
    rearmIdleHints
  ]);

  // ==================== RELOAD / RESUME LOGIC ====================
  // Runs once on mount — same pattern as Modak (empty deps, no isReload check).
  useEffect(() => {
    // NOTE: no isAudioOn guard here — this effect repairs STATE (reveal cards,
    // drag-drop seeding, completion screen), not just VO. Gating it on audio
    // soft-locked the scene for muted players reloading mid-phase.
    if (!sceneState?.welcomeShown) return;

    // 1. RESET PARTIAL LOTUS BLOOMING
    // 1 or 2 lotuses bloomed but not all 3 → reset to start of lotus phase.
    // Matches Modak's "reset partial mound search / partial modak collection" pattern.
    if (sceneState.phase === PHASES.SOME_BLOOMED) {
      const bloomed = sceneState.lotusStates?.filter(s => s === 1).length || 0;
      if (bloomed > 0 && bloomed < 3) {
        sceneActions.updateState({
          lotusStates: [0, 0, 0],
          phase: PHASES.INITIAL,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        });
        return;
      }
      // All 3 bloomed but phase hasn't advanced to ALL_BLOOMED yet (rare mid-transition reload):
      if (bloomed === 3) {
        safeSetTimeout(() => {
          playChime();
          setRevealConfig({
            symbolId: 'lotus',
            symbolName: 'Lotus',
            affirmation: 'I stay calm.',
            symbolImage: symbolLotusColored
          });
        }, 1200);
        return;
      }
    }

    // 2. RESTORE LOTUS CARD FLIP
    // All 3 bloomed (ALL_BLOOMED phase) but card not yet shown / dismissed.
    if (sceneState.phase === PHASES.ALL_BLOOMED) {
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I stay calm.',
          symbolImage: symbolLotusColored
        });
      }, 1200);
      return;
    }

    // 2b. REPAIR GOLDEN / ELEPHANT PHASE FLAGS
    // Older saves or interrupted transitions can leave the phase ahead of the
    // visibility flags, which makes the scene look empty even though progress
    // has advanced correctly.
    if (sceneState.phase === PHASES.GOLDEN_VISIBLE && !sceneState.goldenLotusVisible) {
      sceneActions.updateState({
        goldenLotusVisible: true,
        phase: PHASES.GOLDEN_VISIBLE
      });
      return;
    }

    if (sceneState.phase === PHASES.ELEPHANT_VISIBLE && !sceneState.elephantVisible) {
      sceneActions.updateState({
        goldenLotusVisible: true,
        elephantVisible: true,
        phase: PHASES.ELEPHANT_VISIBLE,
        currentFocus: 'elephant'
      });
      return;
    }

    // 3. RESTORE TRUNK CARD FLIP
    // Only restore trunk card after successful water trace (GOLDEN_BLOOM).
    // ELEPHANT_TRANSFORMED is now the active drag phase and should not auto-flip.
    if (sceneState.phase === PHASES.GOLDEN_BLOOM && !sceneState.completed) {
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'trunk',
          symbolName: 'Trunk',
          affirmation: 'I find my way.',
          symbolImage: symbolTrunkColored
        });
      }, 1200);
      return;
    }
    // Defensive repair: if a stale save marks completed during trunk reveal phase,
    // clear it so reload resumes the card flow instead of treating scene as done.
    if (sceneState.phase === PHASES.GOLDEN_BLOOM && sceneState.completed) {
      sceneActions.updateState({
        completed: false,
        showingCompletionScreen: false,
        phase: PHASES.GOLDEN_BLOOM
      });
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'trunk',
          symbolName: 'Trunk',
          affirmation: 'I find my way.',
          symbolImage: symbolTrunkColored
        });
      }, 300);
      return;
    }

    // 4. RESTORE WATER-DRAG PHASE (ELEPHANT_TRANSFORMED)
    // On reload during Phase 3, re-seed drag UI state so the drop is visible and interactive.
    if (sceneState.phase === PHASES.ELEPHANT_TRANSFORMED && !sceneState.goldenLotusBloom) {
      sceneActions.updateState({
        elephantTransformed: true,
        trunkActive: true,
        phase: PHASES.ELEPHANT_TRANSFORMED
      });
      setCurrentPetal(-1);
      setDropFading(false);
      setDropMagicPhase(null);
      dropCompletedRef.current = false;
      petalAdvanceLockUntilRef.current = 0;
      // Seed on next tick so render condition sees a stable phase first.
      safeSetTimeout(() => {
        setDropPosition({ x: DROP_START_POINT.x, y: DROP_START_POINT.y });
      }, 80);
      return;
    }

    // 5. RESTORE COMPLETION SCREEN
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.showingCompletionScreen) {
      safeSetTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

  }, []); // Empty array — runs once on mount, same as Modak

  // Scene 2 resume/continue VO guard:
  // when entering with welcomeShown already true (mid-scene continue/reload),
  // replay the current phase prompt once so guidance never feels silent.
  useEffect(() => {
    if (!sceneState?.welcomeShown) return;
    if (resumePromptPlayedRef.current) return;
    if (showSceneCompletion || revealConfig || isSymbolPopupOpen) return;
    const promptKey = getPromptKeyForPhase();
    if (promptKey === 'trunkRound' && !dropPosition) return;
    if (!promptKey || promptKey === 'opening') return;

    resumePromptPlayedRef.current = true;
    const timer = setTimeout(() => {
      resetIdleBaseline();
      speakPondPrompt(promptKey);
      lastAnnouncedPromptRef.current = promptKey;
    }, promptKey === 'trunkRound' ? 850 : 500);
    return () => clearTimeout(timer);
  }, [
    isAudioOn,
    sceneState?.welcomeShown,
    showSceneCompletion,
    revealConfig,
    isSymbolPopupOpen,
    dropPosition,
    getPromptKeyForPhase,
    resetIdleBaseline,
    speakPondPrompt
  ]);

  // Completion message intentionally disabled for Pond (remove orange popup).

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = { lotus: '🐘 Discover Trunk', trunk: '✨ End Scene' };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      lotus: 'The Sacred Lotus represents purity.\nIt blooms beautifully even in muddy water!',
      trunk: 'The Curved Trunk represents adaptability.\nGanesha uses it to remove obstacles!'
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  // Handler functions
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setShowPowerMission(true);
  };

  const handleContinueLearning = () => {
    setShowPowerModal(false);
    const symbolKey = currentMissionSymbol;

    if (symbolKey === 'lotus') {
      setTimeout(() => setShowSparkle('all-lotuses'), 500);
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          phase: PHASES.GOLDEN_VISIBLE,
          currentFocus: 'golden'
        });
        setShowSparkle('golden-lotus');
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);

    } else if (symbolKey === 'trunk') {
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusBloom: true,
          phase: PHASES.GOLDEN_BLOOM
        });
        setShowSparkle(null);
        setTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.COMPLETE,
            stars: 5,
            completed: true,
            currentPopup: 'final_fireworks',
            progress: { percentage: 100, starsEarned: 5, completed: true }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  const handleMissionComplete = (symbolKey) => {
    setShowPowerMission(false);
    if (symbolKey === 'lotus') {
      setTimeout(() => setShowSparkle('all-lotuses'), 500);
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          phase: PHASES.GOLDEN_VISIBLE,
          currentFocus: 'golden'
        });
        setShowSparkle('golden-lotus');
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
    } else if (symbolKey === 'trunk') {
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusBloom: true,
          phase: PHASES.GOLDEN_BLOOM
        });
        setShowSparkle(null);
        setTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.COMPLETE,
            stars: 5,
            completed: true,
            currentPopup: 'final_fireworks',
            progress: { percentage: 100, starsEarned: 5, completed: true }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  // -- SymbolAutoReveal helpers -----------------------------------------------
  // Play power VO when the reveal card appears (Scene 1 parity).
  useEffect(() => {
    if (!revealConfig) return;
    if (!isAudioOn) return;
    const voMap = {
      lotus: 'lotusBloomPower',
      trunk: 'waterPathPower'
    };
    const voKey = voMap[revealConfig.symbolId];
    if (!voKey) return;
    const id = setTimeout(() => speakPondPrompt(voKey), 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, speakPondPrompt]);

  const getSidebarTarget = useCallback((symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2),
    };
  }, []);

  const triggerFireworks = () => {
    setShowSparkle('final-fireworks');
  };

  const persistPondCompletion = useCallback(() => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 5,
      symbols: { lotus: true, trunk: true },
      phase: 'complete',
      timestamp: Date.now()
    });

    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'pond', {
      completed: true,
      stars: 5,
      symbols: { lotus: true, trunk: true }
    });

    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_pond`);
    SimpleSceneManager.clearCurrentScene();
  }, []);

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'lotus') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.GOLDEN_VISIBLE });
      // discoveredSymbols + goldenLotusVisible delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          discoveredSymbols: { ...sceneState.discoveredSymbols, lotus: true }
        });
      }, 950);

    } else if (symbolId === 'trunk') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.COMPLETE, completed: false, showingCompletionScreen: false });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({ discoveredSymbols: { lotus: true, trunk: true } });
      }, 950);
      safeSetTimeout(() => triggerFireworks(), 2450);
    }
  };

  // -------------------------------------------------------------------------

  // ==================== V5 PHASE 1 — HOLD TO BLOOM ====================
  // Press and hold a lotus. A glow ring fills around it (1.5s for lotus 1 & 2,
  // 2s for lotus 3). Releasing early shrinks the glow at 2× speed; if the
  // child re-presses within 1s, hold resumes from current value. After 1s
  // grace, hold fully resets. No fail state, no reset on the lotus that's
  // already bloomed.

  const completeLotusBloom = useCallback((index) => {
    const liveState = sceneStateRef.current;
    if (!liveState || !sceneActions) return;
    // Read from the pending ref first: two holds completing before React
    // re-renders must each see the other's bloom, or one gets overwritten.
    const lotusStates = [...(pendingLotusStatesRef.current || liveState.lotusStates || [0, 0, 0])];
    if (lotusStates[index] === 1) return; // already bloomed

    playBloom();
    lotusStates[index] = 1;
    pendingLotusStatesRef.current = lotusStates;
    setShowSparkle(`lotus-${index}`);
    setTimeout(() => setShowSparkle(null), 1500);

    const bloomedCount = lotusStates.filter(s => s === 1).length;

    if (bloomedCount === 3) {
      playChime();
      triggerMiniGesture('center', 2500, MINI_VICTORY_ICON);
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: { percentage: 50, starsEarned: 4 }
      });

      safeSetTimeout(() => {
        sceneActions.updateState({
          allLotusBloom: true,
          phase: PHASES.ALL_BLOOMED
        });
        safeSetTimeout(() => setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I stay calm.',
          symbolImage: symbolLotusColored
        }), 1500);
      }, 1000);

    } else {
      triggerMiniGesture('lotus', 1200, MINI_THUMBS_UP_ICON);
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: { ...liveState.progress, percentage: 10 * bloomedCount }
      });
    }
  }, [sceneActions, playBloom, playChime, triggerMiniGesture, safeSetTimeout]);

  const handleLotusHoldStart = (index) => {
    rearmIdleHints();
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });

    const lotusStates = sceneState.lotusStates || [0, 0, 0];
    if (lotusStates[index] === 1) {
      // Already bloomed — keep tap acknowledgment for replay-ability
      playUiTap();
      setShowSparkle(`lotus-${index}`);
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    // Cancel any active release decay or reset timer for this lotus
    if (holdReleaseRef.current[index]) {
      cancelAnimationFrame(holdReleaseRef.current[index]);
      holdReleaseRef.current[index] = null;
    }
    if (holdResetTimerRef.current[index]) {
      clearTimeout(holdResetTimerRef.current[index]);
      holdResetTimerRef.current[index] = null;
    }

    const cfg = LOTUS_HOLD_CONFIG[index];
    const startProgress = holdProgress[index]; // resume from current value
    const startTime = performance.now();
    holdStartedAtRef.current[index] = startTime;

    const tick = (now) => {
      const elapsed = now - startTime;
      const added = elapsed / cfg.holdMs;
      const next = Math.min(1, startProgress + added);

      setHoldProgress(prev => {
        const updated = [...prev];
        updated[index] = next;
        return updated;
      });

      if (next >= 1) {
        holdTimersRef.current[index] = null;
        completeLotusBloom(index);
        // Reset progress AFTER bloom so glow ring fades naturally
        setTimeout(() => {
          setHoldProgress(prev => {
            const updated = [...prev];
            updated[index] = 0;
            return updated;
          });
        }, 600);
        return;
      }

      holdTimersRef.current[index] = requestAnimationFrame(tick);
    };

    holdTimersRef.current[index] = requestAnimationFrame(tick);
  };

  const handleLotusHoldEnd = (index) => {
    if (!sceneState) return;
    const lotusStates = sceneState.lotusStates || [0, 0, 0];
    if (lotusStates[index] === 1) return; // already bloomed, ignore

    // Cancel active hold tick
    if (holdTimersRef.current[index]) {
      cancelAnimationFrame(holdTimersRef.current[index]);
      holdTimersRef.current[index] = null;
    }

    // Begin gentle decay at 2× the fill speed
    const cfg = LOTUS_HOLD_CONFIG[index];
    const decayDurationMs = cfg.holdMs / HOLD_DECAY_MULTIPLIER;
    const startProgress = holdProgress[index];
    if (startProgress <= 0) return;

    const startTime = performance.now();
    const decayTick = (now) => {
      const elapsed = now - startTime;
      const shrinkRatio = elapsed / decayDurationMs;
      const next = Math.max(0, startProgress - shrinkRatio);

      setHoldProgress(prev => {
        const updated = [...prev];
        updated[index] = next;
        return updated;
      });

      if (next <= 0) {
        holdReleaseRef.current[index] = null;
        return;
      }
      holdReleaseRef.current[index] = requestAnimationFrame(decayTick);
    };
    holdReleaseRef.current[index] = requestAnimationFrame(decayTick);

    // Hard reset after grace window (in case decay is slow / paused)
    holdResetTimerRef.current[index] = setTimeout(() => {
      if (holdReleaseRef.current[index]) {
        cancelAnimationFrame(holdReleaseRef.current[index]);
        holdReleaseRef.current[index] = null;
      }
      setHoldProgress(prev => {
        const updated = [...prev];
        updated[index] = 0;
        return updated;
      });
      holdResetTimerRef.current[index] = null;
    }, HOLD_RESET_GRACE_MS);
  };

  // Cleanup hold timers on unmount
  useEffect(() => {
    return () => {
      holdTimersRef.current.forEach(id => id && cancelAnimationFrame(id));
      holdReleaseRef.current.forEach(id => id && cancelAnimationFrame(id));
      holdResetTimerRef.current.forEach(id => id && clearTimeout(id));
    };
  }, []);
  // =====================================================================

  const handleGoldenLotusClick = () => {
    rearmIdleHints();
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;

    if (sceneState.goldenLotusBloom) {
      playUiTap();
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    if (sceneState.elephantVisible) {
      playUiTap();
      setShowSparkle('golden-lotus-clicked');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    playBloom();
    triggerMiniGesture('center', 1500, MINI_OK_ICON);
    setShowSparkle('golden-lotus-clicked');

    safeSetTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        elephantVisible: true,
        phase: PHASES.ELEPHANT_VISIBLE,
        currentFocus: 'elephant'
      });
      setShowSparkle('elephant-appear');
      safeSetTimeout(() => setShowSparkle(null), 1500);
    }, 500);
  };

  // ==================== V5 PHASE 3 — DRAG WATER ALONG CURVE ====================
  // Tap elephant → it slides into final position. Then the curved petal path
  // appears with a pulsing water drop at the start. Child drags the drop along
  // the path. Drop "snaps" forward when finger is near the next petal.
  // Going off-path = drop fades softly (0.4s) and reappears at start.
  // No fail state.

  const handleElephantClick = () => {
    rearmIdleHints();
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions || sceneState.elephantTransformed) return;
    if (sceneState.phase !== PHASES.ELEPHANT_VISIBLE) return;

    playUiTap();
    triggerMiniGesture('center', 1500, MINI_OK_ICON);
    setShowSparkle('elephant');
    safeSetTimeout(() => {
      // Mark elephant as transformed and ACTIVATE DRAG PHASE
      // (instead of auto-spray, the child now drags the drop themselves)
      sceneActions.updateState({
        elephantTransformed: true,
        trunkActive: true,
        phase: PHASES.ELEPHANT_TRANSFORMED
      });

      // Trunk-tip handoff: wait for elephant movement to finish,
      // then show sparkle and spawn the drop from trunk.
      setCurrentPetal(-1);
      setDropPosition(null);
      setDropFading(false);
      setDropMagicPhase(null);
      dropCompletedRef.current = false;
      petalAdvanceLockUntilRef.current = 0;
      safeSetTimeout(() => {
        setShowSparkle('trunk-tip');
        safeSetTimeout(() => {
          setShowSparkle(null);
          setDropPosition({ x: DROP_START_POINT.x, y: DROP_START_POINT.y });
        }, TRUNK_SPARKLE_DURATION_MS);
      }, ELEPHANT_MOVE_DURATION_MS + DROP_APPEAR_BUFFER_MS);
    }, 500);
  };

  // Helper: compute distance between two %-coords (normalized for aspect)
  const pctDistance = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pointer position → % within the drag container
  const getPctFromEvent = (e) => {
    const container = dragContainerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  const handleDropPointerDown = (e) => {
    if (sceneState?.goldenLotusBloom || dropFading || dropCompletedRef.current) return;
    setDragActive(true);
    rearmIdleHints();
    e.preventDefault?.();
  };

  const completeDragToLotus = () => {
    if (dropCompletedRef.current) return;
    dropCompletedRef.current = true;
    setDragActive(false);
    setDropFading(false);
    petalAdvanceLockUntilRef.current = 0;

    // Beat 1: drop comes alive (pulse + spin)
    setDropMagicPhase('pulsing');
    playChime();

    // Beat 2: burst into stream sparkles
    safeSetTimeout(() => {
      setDropMagicPhase('bursting');
      setShowSparkle('drop-to-lotus-stream');
    }, DROP_MAGIC_PULSE_MS);

    // Beat 3: tiny pause then bloom
    safeSetTimeout(() => {
      setShowSparkle('golden-lotus-wiggle');
    }, DROP_MAGIC_PULSE_MS + DROP_MAGIC_STREAM_MS);

    safeSetTimeout(() => {
      setDropPosition(null);
      setDropMagicPhase(null);
      setShowSparkle('golden-lotus-bloom');
      sceneActions.updateState({
        trunkActive: false,
        goldenLotusBloom: true,
        phase: PHASES.GOLDEN_BLOOM
      });
      playGlow();
      safeSetTimeout(() => playTwinkle(), 400);
      triggerMiniGesture('center', 2500, MINI_VICTORY_ICON);
      safeSetTimeout(() => setRevealConfig({
        symbolId: 'trunk',
        symbolName: 'Trunk',
        affirmation: 'I find my way.',
        symbolImage: symbolTrunkColored
      }), 2400);
    }, DROP_MAGIC_PULSE_MS + DROP_MAGIC_STREAM_MS + DROP_MAGIC_PRE_BLOOM_PAUSE_MS);

    // Clear the stream sparkle once it lands.
    safeSetTimeout(() => {
      setShowSparkle((prev) => (prev === 'drop-to-lotus-stream' ? null : prev));
    }, DROP_MAGIC_PULSE_MS + DROP_MAGIC_STREAM_MS);
  };

  const handleDropPointerMove = (e) => {
    if (!dragActive) return;
    const pct = getPctFromEvent(e);
    if (!pct) return;

    setDropPosition(pct);

    // Check if near next petal — snap and advance
    const nextIdx = currentPetal + 1;
    if (nextIdx < PETAL_STEPPING_STONES.length) {
      const nextPetal = PETAL_STEPPING_STONES[nextIdx];
      const stepLockActive = Date.now() < petalAdvanceLockUntilRef.current;
      if (!stepLockActive && pctDistance(pct, nextPetal) < PETAL_SNAP_RADIUS_PCT) {
        setCurrentPetal(nextIdx);
        setDropPosition({ x: nextPetal.x, y: nextPetal.y });
        playUiTap();
        petalAdvanceLockUntilRef.current = Date.now() + PETAL_STEP_LOCK_MS;

        // Reaching the final petal now completes immediately (no extra drop phase).
        if (nextIdx === PETAL_STEPPING_STONES.length - 1) {
          completeDragToLotus();
          return;
        }
      }
    }

    // Off-path detection: if far from all path points, fade
    const allPoints = [
      { x: DROP_START_POINT.x, y: DROP_START_POINT.y }, // start
      ...PETAL_STEPPING_STONES,
      { x: GOLDEN_LOTUS_TARGET_POINT.x, y: GOLDEN_LOTUS_TARGET_POINT.y }  // golden lotus
    ];
    const minDist = Math.min(...allPoints.map(p => pctDistance(pct, p)));
    if (minDist > PETAL_SNAP_RADIUS_PCT * 2.5) {
      // Drop went off-path
      cancelActiveDrag();
    }
  };

  const handleDropPointerUp = (e) => {
    if (!dragActive) return;
    setDragActive(false);

    const pct = e ? getPctFromEvent(e) : dropPosition;
    const nextIdx = currentPetal + 1;

    // If the finger lifts right after reaching a petal, React state may not
    // have committed the snap yet. Re-check the release point so the first
    // step doesn't falsely reset back to trunk.
    if (
      pct &&
      nextIdx < PETAL_STEPPING_STONES.length &&
      pctDistance(pct, PETAL_STEPPING_STONES[nextIdx]) < PETAL_SNAP_RADIUS_PCT
    ) {
      setCurrentPetal(nextIdx);
      setDropPosition({
        x: PETAL_STEPPING_STONES[nextIdx].x,
        y: PETAL_STEPPING_STONES[nextIdx].y
      });

      if (nextIdx === PETAL_STEPPING_STONES.length - 1) {
        completeDragToLotus();
      }
      return;
    }

    // Fallback completion path (for release exactly at end step)
    if (currentPetal === PETAL_STEPPING_STONES.length - 1) {
      completeDragToLotus();
    } else {
      // Released mid-path — gently fade and reset
      cancelActiveDrag();
    }
  };
  // ==============================================================================

  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.COMPLETE, PHASES.GOLDEN_BLOOM];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'lotus-hint',
      message: 'Press and hold a lotus 🌸',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        if (sceneState.phase !== PHASES.INITIAL && sceneState.phase !== PHASES.SOME_BLOOMED) return false;
        const lotusStates = sceneState.lotusStates || [0, 0, 0];
        return !lotusStates.every(state => state === 1);
      }
    },
    {
      id: 'elephant-hint',
      message: 'Tap the elephant 🐘',
      position: { bottom: '60%', right: '20%', transform: 'translateX(50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState.elephantVisible && !sceneState.elephantTransformed;
      }
    },
    {
      id: 'golden-hint',
      message: 'Tap the golden bud ✨',
      position: { bottom: '60%', left: '45%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        if (sceneState.elephantVisible && !sceneState.elephantTransformed) return false;
        return sceneState.goldenLotusVisible && !sceneState.goldenLotusBloom;
      }
    }
  ];

  const getLotusImage = (index) => {
    const lotusStates = sceneState?.lotusStates || [0, 0, 0];
    return lotusStates[index] === 0 ? lotusClosed : lotusBloomed;
  };

  const lotusStates = sceneState?.lotusStates || [0, 0, 0];
  const bloomCount = lotusStates.filter(state => state === 1).length;
  const showLotusHoldDemo =
    sceneState?.welcomeShown &&
    sceneState?.phase === PHASES.INITIAL &&
    bloomCount === 0 &&
    !holdTimersRef.current.some(Boolean);

  const renderCounter = () => {
    return (
      <div className="lotus-counter">
        <div className="counter-icon">
          <img src={bloomCount > 0 ? lotusBloomed : lotusClosed} alt="Lotus" />
        </div>
        <div className="counter-progress">
          <div className="counter-progress-fill" style={{ width: `${(bloomCount / 3) * 100}%` }} />
        </div>
        <div className="counter-display">{bloomCount}/3</div>
      </div>
    );
  };

  const isFinalCelebrationActive = showSparkle === 'final-fireworks' || showMandala || showSceneCompletion;

  // Fireworks completion handler (matches Modak-style fireworks swap)
  useEffect(() => {
    if (showSparkle !== 'final-fireworks') return;
    setFireworksFinished(false);
    const timer = setTimeout(() => {
      setShowSparkle(null);
      setFireworksFinished(true);
      persistPondCompletion();
      setShowMandala(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [persistPondCompletion, showSparkle]);

  // Keep completion UI sticky across tab switch/remount.
  useEffect(() => {
    if (sceneState?.showingCompletionScreen && !showSceneCompletion) {
      setShowSceneCompletion(true);
      setShowSparkle(null);
    }
  }, [sceneState?.showingCompletionScreen, showSceneCompletion]);

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen || showMandala;
  const isFinalFireworksView = showSparkle === 'final-fireworks';

  // 1. WRAP IN GAMELAYOUT
  return (
    <GameLayout
      zoneId="symbol-mountain"
      helpConfig={pondHelpConfig}
      sceneState={sceneState}
      onHome={() => onNavigate?.('home')}
      onReplay={resetScene}
      isAudioOn={isAudioOn}
      onAudioToggle={toggleAudio}
      showMenu={false}
    >
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="pond-scene-container">
            <HomeButton onNavigate={onNavigate} />
            <div
              ref={dragContainerRef}
              className="pond-background"
              style={{ backgroundImage: `url(${pondGameBg})` }}
              onPointerMove={dragActive ? handleDropPointerMove : undefined}
              onPointerUp={dragActive ? handleDropPointerUp : undefined}
              onPointerCancel={dragActive ? handleDropPointerUp : undefined}
              onPointerLeave={dragActive ? handleDropPointerUp : undefined}
              onContextMenu={(e) => e.preventDefault()}
            >
              {!isCompletionView && !isFinalFireworksView && (
                <>
              {POND_OVERLAY_MID ? (
                <div className="pond-bg-overlay pond-bg-overlay--mid" style={{ backgroundImage: `url(${POND_OVERLAY_MID})` }} aria-hidden="true" />
              ) : null}

              {/* REMOVE OLD MANUAL RENDERCOUNTER, UNIFIED HEADER IS HANDLED BELOW */}

              {/* UnifiedHeaderV2 disabled per request */}

              {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
                <OpeningModal
                  zoneId={zoneId}
                  sceneId={sceneId}
                  onStart={() => {
                    rearmIdleHints();
                    sceneActions.updateState({ welcomeShown: true });
                  }}
                  characterImg={ganeshaCharacter}
                  showButton={true}
                />
              )}

              {/* Lotus flowers — V5: HOLD TO BLOOM */}
              {[0, 1, 2].map((index) => {
                const cfg = LOTUS_HOLD_CONFIG[index];
                const isBloomed = (sceneState.lotusStates || [])[index] === 1;
                const progress = holdProgress[index] || 0;
                return (
                  <div
                    key={index}
                    className={`lotus lotus-${index + 1} ${!isBloomed ? hintClassName : ''}`}
                  >
                    {/* Hold target — uses pointer events for cross-device support */}
                    <div
                      id={`lotus-${index}`}
                      role="button"
                      aria-label={`Hold to bloom lotus ${index + 1}`}
                      data-element={`lotus-${index + 1}`}
                      onPointerDown={(e) => {
                        e.preventDefault?.();
                        if (!isBloomed) handleLotusHoldStart(index);
                      }}
                      onPointerUp={() => !isBloomed && handleLotusHoldEnd(index)}
                      onPointerLeave={() => !isBloomed && handleLotusHoldEnd(index)}
                      onPointerCancel={() => !isBloomed && handleLotusHoldEnd(index)}
                      className="pond-lotus-hold-target"
                      style={{ cursor: isBloomed ? 'default' : 'pointer' }}
                    >
                      {index === 0 && showLotusHoldDemo && (
                        <svg
                          viewBox="0 0 100 100"
                          className="pond-hold-ring pond-hold-ring--demo"
                          aria-hidden="true"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="#FFD86B"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 46}`}
                            strokeDashoffset={`${2 * Math.PI * 46}`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      )}

                      {/* Glow ring — fills as hold progresses (no progress bar UI) */}
                      {!isBloomed && progress > 0 && (
                        <svg
                          viewBox="0 0 100 100"
                          className="pond-hold-ring"
                          aria-hidden="true"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="#FFD86B"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 46}`}
                            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
                            transform="rotate(-90 50 50)"
                            style={{
                              filter: `drop-shadow(0 0 ${4 + progress * 8}px rgba(255, 216, 107, ${0.5 + progress * 0.4}))`,
                              transition: 'filter 0.1s linear',
                            }}
                          />
                        </svg>
                      )}

                      <img
                        src={getLotusImage(index)}
                        alt={`Lotus ${index + 1}`}
                        className="pond-lotus-image"
                        style={{
                          // Subtle scale during hold — feels like the lotus is "stirring"
                          transform: !isBloomed && progress > 0 ? `scale(${1 + progress * 0.06})` : 'scale(1)',
                        }}
                        draggable={false}
                      />

                      {/* Ambient distraction overlays — VISUAL ONLY, never interrupt hold */}
                      {!isBloomed && cfg.ambient === 'fish' && (
                        <div aria-hidden="true" className="pond-fish-overlay">
                          <img src={pondFishImage} alt="" className="pond-fish-image" draggable={false} />
                        </div>
                      )}

                      {!isBloomed && cfg.ambient === 'ripples' && (
                        <div aria-hidden="true" className="pond-ripple-overlay">
                          <div className="pond-soft-ripple pond-soft-ripple--1" />
                          <div className="pond-soft-ripple pond-soft-ripple--2" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Existing sparkle layer for lotus bloom celebration */}
              {[0, 1, 2].map((index) => (
                showSparkle === `lotus-${index}` && (
                  <div
                    key={`sparkle-${index}`}
                    className={`lotus lotus-${index + 1} pond-lotus-sparkle`}
                  >
                    <SparkleAnimation type="star" count={15} color="#ff9ebd" size={10} duration={1500} fadeOut={true} area="full" />
                  </div>
                )
              ))}
              {/* Pointer emoji hint removed per request */}

              {/* All lotuses sparkle */}
              {showSparkle === 'all-lotuses' && (
                <div className="all-lotuses-sparkle">
                  <SparkleAnimation type="magic" count={20} color="lightblue" size={10} duration={1500} fadeOut={true} area="full" />
                </div>
              )}

              {/* Golden lotus */}
              {sceneState.goldenLotusVisible && (
                <div className={`golden-lotus-container ${sceneState.goldenLotusBloom ? 'blooming' : ''} ${showSparkle === 'golden-lotus-wiggle' ? 'golden-lotus-wiggling' : ''} ${!sceneState.goldenLotusBloom && !sceneState.elephantVisible ? hintClassName : ''}`}>
                  <ClickableElement
                    id="golden-lotus"
                    onClick={handleGoldenLotusClick}
                    completed={sceneState.goldenLotusBloom}
                    zone="golden-zone"
                  >
                    <img src={sceneState.goldenLotusBloom ? goldenLotusBloomed : goldenLotusClosed} alt="Golden Lotus" className="pond-fit-image" />
                  </ClickableElement>
                  {(showSparkle === 'golden-lotus' || showSparkle === 'golden-lotus-clicked' || showSparkle === 'golden-lotus-bloom') && (
                    <SparkleAnimation
                      type={showSparkle === 'golden-lotus-bloom' ? 'glitter' : 'magic'}
                      count={20}
                      color={showSparkle === 'golden-lotus-bloom' ? 'gold' : 'orange'}
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* Elephant */}
              {sceneState.elephantVisible && (
                <div
                  className={`elephant-partial ${sceneState.elephantTransformed ? 'elephant-position-locked' : ''} ${!sceneState.elephantTransformed ? hintClassName : ''}`}
                  id="elephant-container"
                  style={{ position: 'relative' }}
                >
                  <ClickableElement
                    id="elephant"
                    onClick={handleElephantClick}
                    completed={sceneState.elephantTransformed}
                    zone="elephant-zone"
                    style={{ position: 'relative', zIndex: 10 }}
                  >
                    <img src={elephantFull} alt="Elephant" className="pond-fit-image" />
                  </ClickableElement>
                  {(showSparkle === 'elephant' || showSparkle === 'elephant-appear') && (
                    <SparkleAnimation
                      type={showSparkle === 'elephant' ? 'firefly' : 'star'}
                      count={20}
                      color={showSparkle === 'elephant' ? 'lightblue' : '#aaaaaa'}
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* V5 PHASE 3 — DRAG WATER ALONG CURVE */}
              {sceneState.elephantTransformed && !sceneState.goldenLotusBloom && dropPosition && (
                <>
                  {/* Petal stepping stones */}
                  {PETAL_STEPPING_STONES.map((p, idx) => {
                    const reached = idx <= currentPetal;
                    const isNext = idx === currentPetal + 1;
                    return (
                      <div
                        key={p.id}
                        aria-hidden="true"
                        className="pond-petal-stone"
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          background: reached
                            ? 'radial-gradient(circle, #AEE8FF 0%, #5BB3E8 100%)'
                            : 'radial-gradient(circle, rgba(174,232,255,0.55) 0%, rgba(91,179,232,0.35) 100%)',
                          boxShadow: reached
                            ? '0 0 16px rgba(91, 179, 232, 0.85)'
                            : '0 0 8px rgba(91, 179, 232, 0.45)',
                          animation: reached
                            ? 'none'
                            : isNext
                              ? 'pondPetalPulse 1.2s ease-in-out infinite'
                              : 'pondPetalPulse 2.4s ease-in-out infinite',
                          opacity: reached ? 1 : isNext ? 1 : 0.5,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}

                  {/* The draggable water drop */}
                  <div
                    role="button"
                    aria-label="Drag the water drop along the curved path"
                    onPointerDown={handleDropPointerDown}
                    className={`pond-drop-handle ${dropMagicPhase === 'pulsing' ? 'drop-magic-pulsing' : ''} ${dropMagicPhase === 'bursting' ? 'drop-magic-bursting' : ''}`}
                    style={{
                      left: `${dropPosition.x}%`,
                      top: `${dropPosition.y}%`,
                      cursor: dragActive ? 'grabbing' : 'grab',
                      opacity: dropFading ? 0 : 1,
                      transition: dragActive
                        ? 'opacity 0.4s ease-out'
                        : 'left 0.25s ease-out, top 0.25s ease-out, opacity 0.4s ease-out',
                      animation: !dragActive && !dropMagicPhase && currentPetal === -1
                        ? 'pondDropPulse 1.4s ease-in-out infinite'
                        : 'none',
                    }}
                  >
                    <svg viewBox="0 0 46 52" className="pond-drop-svg">
                      <path
                        d="M 23 4 C 23 4, 8 22, 8 34 C 8 44, 15 50, 23 50 C 31 50, 38 44, 38 34 C 38 22, 23 4, 23 4 Z"
                        fill="url(#dropGradient)"
                        stroke="#5BB3E8"
                        strokeWidth="1.5"
                      />
                      <ellipse cx="18" cy="22" rx="4" ry="6" fill="#FFFFFF" opacity="0.7" />
                      <defs>
                        <radialGradient id="dropGradient" cx="35%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#B8E5FB" />
                          <stop offset="60%" stopColor="#5BB3E8" />
                          <stop offset="100%" stopColor="#3A8FCB" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                </>
              )}

              {/* Ganesha reflection in pond water — appears at golden lotus bloom */}
              {sceneState.goldenLotusBloom && (
                <div className="pond-ganesha-reflection" aria-hidden="true">
                  <img
                    src={GANESHA_REFLECTION_IMAGE}
                    alt=""
                    className="pond-ganesha-reflection__img"
                  />
                </div>
              )}

              {POND_OVERLAY_FRONT ? (
                <div className="pond-bg-overlay pond-bg-overlay--front" style={{ backgroundImage: `url(${POND_OVERLAY_FRONT})` }} aria-hidden="true" />
              ) : null}

              {/* Symbol Learning Sparkles */}
              {showSparkle === 'lotus-to-sidebar' && (
                <div className="pond-symbol-stream pond-symbol-stream--lotus">
                  <SparkleAnimation type="stream" count={20} color="#4ECDC4" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {showSparkle === 'trunk-to-sidebar' && (
                <div className="pond-symbol-stream pond-symbol-stream--trunk">
                  <SparkleAnimation type="stream" count={20} color="#FFD700" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {showSparkle === 'drop-to-lotus-stream' && (
                <div
                  className="pond-drop-to-lotus-stream"
                  style={{
                    left: `${PETAL_STEPPING_STONES[PETAL_STEPPING_STONES.length - 1].x}%`,
                    top: `${PETAL_STEPPING_STONES[PETAL_STEPPING_STONES.length - 1].y}%`,
                    width: `${Math.abs(GOLDEN_LOTUS_TARGET_POINT.x - PETAL_STEPPING_STONES[PETAL_STEPPING_STONES.length - 1].x) + 14}%`,
                    height: `${Math.abs(GOLDEN_LOTUS_TARGET_POINT.y - PETAL_STEPPING_STONES[PETAL_STEPPING_STONES.length - 1].y) + 14}%`,
                  }}
                >
                  <SparkleAnimation type="stream" count={14} color="#9BE6FF" size={9} duration={DROP_MAGIC_STREAM_MS + 100} fadeOut={true} area="full" />
                </div>
              )}

              {showSparkle === 'trunk-tip' && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${DROP_START_POINT.x}%`,
                    top: `${DROP_START_POINT.y}%`,
                    width: '84px',
                    height: '84px',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 40,
                  }}
                >
                  <SparkleAnimation type="magic" count={16} color="#5BB3E8" size={10} duration={TRUNK_SPARKLE_DURATION_MS} fadeOut={true} area="full" />
                </div>
              )}

              {/* ProgressiveHintSystem disabled per request */}

              {/* MINI GESTURE CUE — thumbs up / victory / ok */}
              {miniGesture.show && (
                <div
                  key={`mini-gesture-${miniGesture.key}`}
                  className={`ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--${miniGesture.target}`}
                  style={{ '--mini-cue-duration': `${miniGesture.durationMs}ms` }}
                  aria-hidden="true"
                >
                  <img className="modak-mini-gesture-icon" src={miniGesture.icon} alt="" />
                </div>
              )}

              {showLotusHoldDemo && (
                <div
                  className="ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--lotus modak-mini-ganesha-cue--idle pond-hold-demo-cue"
                  aria-hidden="true"
                >
                  <img className="modak-mini-gesture-icon" src={MINI_THUMBS_UP_ICON} alt="" />
                </div>
              )}
                </>
              )}
            </div>

            {/* Resume Popup */}
              {!isCompletionView && !isFinalFireworksView && showResumePopup && (
              <div className="pond-resume-popup">
                {resumeMessage}
              </div>
            )}

            {/* Fireworks (Modak-style) */}
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

            {showMandala && (
              <InnerMandala
                childName={profileName}
                symbolPetalStates={{
                  1: 'awakened',
                  2: 'awakened',
                  3: 'awakened',
                  4: 'awakened',
                  5: 'awakened'
                }}
                highlightPetals={[5]}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  setShowSceneCompletion(true);
                  // Persist so the sticky-completion effect and reload restore work.
                  sceneActions.updateState({ showingCompletionScreen: true });
                }}
              />
            )}

            {/* DISCOVERY 1: GOLDEN LOTUS — disabled; SymbolAutoReveal handles this now */}
            {false && showDiscoveryFlip1 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found the Golden Lotus!"
                celebrationText="It has something magical to share!"
                celebrationImage={goldenLotusClosed}
                powerTitle="Positivity Power Unlocked!"
                powerText="Just like a lotus stays clean in muddy water… you can stay bright and happy even on messy days!"
                powerIcon={symbolLotusColored}
                buttonText="Ready to Bloom!"
                onComplete={() => {
                  console.log("Discovery 1: Golden Lotus discovered!");
                  setShowDiscoveryFlip1(false);
                  sceneActions.updateState({
                    phase: PHASES.GOLDEN_VISIBLE,
                    goldenLotusVisible: true,
                    discoveredSymbols: { ...sceneState.discoveredSymbols, lotus: true }
                  });
                }}
                showSparkles={true}
              />
            )}

            {/* DISCOVERY 2: ELEPHANT TRUNK — disabled; SymbolAutoReveal handles this now */}
            {false && showDiscoveryFlip2 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found the Elephant's Trunk Magic!"
                celebrationText="It wants to share its secret with you!"
                celebrationImage={elephantFull}
                powerTitle="Power Switch Unlocked!"
                powerText="Your trunk can be strong or gentle. And just like that… you can choose how to act!"
                powerIcon={symbolTrunkColored}
                buttonText="Mission Complete!"
                onComplete={() => {
                  console.log("Discovery 2: Mission complete! 🎆");
                  setShowDiscoveryFlip2(false);
                  sceneActions.updateState({
                    phase: PHASES.COMPLETE,
                    completed: true,
                    discoveredSymbols: { lotus: true, trunk: true }
                  });
                  setShowSparkle('final-fireworks');
                }}
                showSparkles={true}
              />
            )}

            {/* SYMBOL AUTO REVEAL */}
            {!isCompletionView && !isFinalFireworksView && revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                symbolImage={revealConfig.symbolImage}
                sidebarTargetRect={getSidebarTarget(revealConfig.symbolId)}
                enableTapHintPrompt={!sceneState?.discoveredSymbols?.lotus}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* Scene Completion */}
            {isCompletionView && !showMandala && (
              <SceneCompletionCelebration
                show={isCompletionView}
                zoneId={zoneId}
                sceneName="Pond Adventure"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={2}
                totalScenes={4}
                starsEarned={5}
                totalStars={5}
                discoveredSymbols={['lotus', 'trunk']}
                symbolImages={{
                  lotus: symbolLotusColored,
                  trunk: symbolTrunkColored
                }}
                symbolData={{
                  lotus: {
                    title: "Lotus — Ganesha's Pure Flower!",
                    description: "The lotus grows in muddy water but blooms beautifully clean. It reminds us to stay pure and bright no matter what!"
                  },
                  trunk: {
                    title: "Trunk — Ganesha's Super Tool!",
                    description: "Ganesha's trunk can pick up tiny flowers or move giant rocks! It shows us that being gentle AND strong is a superpower."
                  }
                }}
                nextSceneName="Temple Discovery"
                sceneId="pond"
                completionData={{
                  stars: 5,
                  symbols: { lotus: true, trunk: true },
                  completed: true,
                  totalStars: 5
                }}
                onComplete={onComplete}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onContinue={() => {
                  persistPondCompletion();

                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('symbol-mountain', 'temple', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}

            {/* DELETE MANUAL TOCABOCA NAV - GameLayout HANDLES THIS NOW */}

            {/* BackToMapButton disabled per request */}

            {!isCompletionView && !isFinalFireworksView && (
              <CulturalCelebrationModal
                show={showCulturalCelebration}
                onClose={() => setShowCulturalCelebration(false)}
              />
            )}

            {!isCompletionView && !isFinalFireworksView && sceneState.welcomeShown && !isFinalCelebrationActive && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true,
                  modak: true,
                  belly: true,
                  ...(sceneState.discoveredSymbols || {})
                }}
                onSymbolClick={(symbolId) => {
                  console.log(`Sidebar symbol clicked: ${symbolId}`);
                }}
                onPopupOpen={() => {
                  setIsSymbolPopupOpen(true);
                  stopSpokenVoice();
                  resetIdleBaseline();
                }}
                onPopupClose={() => {
                  setIsSymbolPopupOpen(false);
                  resetIdleBaseline();
                  rearmIdleHints();
                  const replayKey = getPromptKeyForPhase();
                  if (replayKey) speakPondPrompt(replayKey);
                }}
              />
            )}

          </div>
        </MessageManager>
      </InteractionManager>

      <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      <VOReplayButton
        onReplay={replayCurrentVoice}
        disabled={!isAudioOn || !getPromptKeyForPhase()}
      />
      {/* 3-2-1 resume countdown — renders on top of everything when child returns to tab */}
      <ResumeCountdown value={countdownValue} />
    </GameLayout>
  );
};

export default PondSceneSimplifiedV5;



