// zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
// Flower Journey + Garland rework (2026-09-06)
//
// Interaction vocabulary (7 beats):
//   1. HOLD        -> calm Mooshika (press & hold until he settles)
//   2. GUIDE       -> drag Mooshika across the muddy stepping stones  -> 2 flowers
//   3. SWIPE       -> swipe the leafy cluster apart (2 swipes)        -> 2 flowers
//   4. PULL + HOLD -> pull the flowering branch down and hold         -> 2 flowers
//   5. DRAG + SNAP -> thread the 6 flowers into a garland
//   6. GUIDE       -> carry the finished garland to Ganesha
//   7. REVEAL      -> Modak appears (no mechanic) as the sweet reveal
//
// Belly meaning: "I can feel many things and still stay steady."

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ModakScene.css';
import '../../../../lib/styles/zone-themes.css';

// Unified Components
import UnifiedButtonV2 from '../../../../lib/components/ui/Button/UnifiedButtonV2';
import UnifiedModal from '../../../../lib/components/ui/Modal/UnifiedModal';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

// Analytics
import { Analytics } from '../../../../lib/services/analytics';
import { sceneAnalytics } from '../../../../lib/services/sceneAnalytics';

// Voice Guidance
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';

const RESUME_DELAY_MS = 3000;

import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

import {
  getOpeningModal,
  getCompletionModal
} from '../../../../lib/config/content';

import OpeningModal from '../../../shared/components/OpeningModal';

import FlowerJourneyGame2 from './FlowerJourneyGame2';
import GarlandGame3 from './GarlandGame3';

import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';

// Images ---------------------------------------------------------------
import forestBackground from './assets/images/modak-fj-bg.webp';
// Keep Mooshika's established bush-phase walking pose consistent across
// Game 1's moving, settled, reveal, and belly moments.
import mooshikaTurned from './assets/images/mooshika-turned-game2.webp';
const mooshikaActive = mooshikaTurned;
const mooshikaCalm = mooshikaTurned;
import journeyFeather from './assets/images/journey-feather.webp';
import journeyBerry from './assets/images/journey-berry.webp';
import journeyAcorn from './assets/images/journey-acorn.webp';
import emotionWorried from './assets/images/emotion-worried-game3.webp';
import emotionSad from './assets/images/emotion-sad-game3.webp';
import emotionAngry from './assets/images/emotion-angry-game3.webp';
import emotionHappy from './assets/images/emotion-happy-game3.webp';
import ganeshaFeeding from './assets/images/ganesha-game3-new.webp';

import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';

// Flower Journey assets - the flower tray (beat-1 only) still needs the two
// flower colours; the rest (mud/leaves/branch/garland art) now live inside
// FlowerJourneyGame2 / GarlandGame3, which import their own copies.
import fjFlowerCoral from './assets/images/fj-flower-coral.webp';
import fjFlowerCream from './assets/images/fj-flower-cream.webp';

// ========================================
// PHASES
// ========================================
const PHASES = {
  CALM_SEARCH: 'calm_search',      // beat 1 - hold Mooshika
  CALM_REVEAL: 'calm_reveal',      // mooshika card flip
  MUD_CROSS: 'mud_cross',          // beat 2 - guide across mud
  LEAVES_OPEN: 'leaves_open',      // beat 3 - swipe apart
  BRANCH_PULL: 'branch_pull',      // beat 4 - pull + hold
  GARLAND_MAKING: 'garland_making',// beat 5 - drag + snap
  CARRY: 'carry',                  // beat 6 - guide to Ganesha
  CARRY_REVEAL: 'carry_reveal',    // belly card flip
  MODAK_PAUSE: 'modak_pause',      // beat 7 - short pause before reveal
  MODAK_REVEAL: 'modak_reveal',    // modak card flip
  CELEBRATE: 'celebrate',          // fireworks + mandala
  COMPLETE: 'complete'
};

// beat 1 darting anchors (reused art)
const CALM_DISTRACTIONS = [
  { id: 'feather', image: journeyFeather, top: '52%', left: '22%' },
  { id: 'acorn', image: journeyAcorn, top: '41%', left: '70%' },
  { id: 'berry', image: journeyBerry, top: '70%', left: '56%' }
];
const CALM_SETTLE_POSITION = { top: '58%', left: '32%' };

// beat 2 mud crossing
const MUD_START_POSITION = { top: '70%', left: '28%' };
const MUD_END_POSITION = { top: '63%', left: '70%' };

// beat 3 leaves cluster
const LEAVES_POSITION = { top: '55%', left: '50%' };
const LEAVES_SWIPES_NEEDED = 2;
const LEAVES_SWIPE_DISTANCE = 55; // px horizontal drag counts as one swipe

// beat 4 branch
const BRANCH_ANCHOR = { top: '38%', left: '70%' };
const BRANCH_PULL_RANGE_PX = 150;   // px of downward drag = full bend
const BRANCH_PULL_TRIGGER = 0.82;   // fraction of bend that lets Mooshika reach
const BRANCH_HOLD_MS = 1100;

// beat 6 carry
const CARRY_START_POSITION = { top: '72%', left: '16%' };
const CARRY_END_POSITION = { top: '52%', left: '74%' };

// Live-tunable layout (percent of the scene). Editable via the debug panel
// (?debugModak=1) and persisted to localStorage so tuning survives reload.
const FJ_LAYOUT_KEY = 'modakFjLayout';
const DEFAULT_FJ_LAYOUT = {
  calmSettle:  { x: 32, y: 58 },
  mud:         { x: 50, y: 74, w: 42 },
  mudStart:    { x: 26, y: 74 },
  mudS1:       { x: 36, y: 72 },
  mudS2:       { x: 46, y: 68 },
  mudS3:       { x: 56, y: 64 },
  leaves:      { x: 50, y: 52, w: 26 },
  branch:      { x: 70, y: 34, w: 24 },
  carryStart:  { x: 16, y: 72 },
  carryEnd:    { x: 74, y: 52 },
  // The 6 real pickup flowers (percent of the scene) - 2 per challenge.
  mudF1:       { x: 70, y: 56 },
  mudF2:       { x: 77, y: 58 },
  leafF1:      { x: 46, y: 50 },
  leafF2:      { x: 54, y: 50 },
  branchF1:    { x: 66, y: 40 },
  branchF2:    { x: 73, y: 41 },
  // Garland-build: resting spots of the 6 loose flowers (percent of the
  // garland work area, not the whole scene).
  garlandF1:   { x: 10, y: 20 },
  garlandF2:   { x: 10, y: 72 },
  garlandF3:   { x: 25, y: 88 },
  garlandF4:   { x: 75, y: 88 },
  garlandF5:   { x: 90, y: 72 },
  garlandF6:   { x: 90, y: 20 }
};
const MUD_STONE_KEYS = ['mudS1', 'mudS2', 'mudS3'];

// Stable drag payloads - a fresh object literal each render makes KidsDraggable's
// effect re-run mid-drag and its cleanup kills the in-flight clone.
const DRAG_DATA_MOOSHIKA = { type: 'fj-mooshika' };
const DRAG_DATA_CARRY = { type: 'fj-carry' };
const DRAG_DATA_GARLAND = [0, 1, 2, 3, 4, 5].map((i) => ({ type: 'garland-flower', flowerIndex: i }));
const loadFjLayout = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_FJ_LAYOUT };
  try {
    const raw = window.localStorage.getItem(FJ_LAYOUT_KEY);
    if (!raw) return { ...DEFAULT_FJ_LAYOUT };
    const saved = JSON.parse(raw);
    const merged = { ...DEFAULT_FJ_LAYOUT };
    Object.keys(DEFAULT_FJ_LAYOUT).forEach((k) => {
      if (saved[k]) merged[k] = { ...DEFAULT_FJ_LAYOUT[k], ...saved[k] };
    });
    return merged;
  } catch {
    return { ...DEFAULT_FJ_LAYOUT };
  }
};

// Snap positions along the U-shaped thread (percent within the work area).
//        0                     5
//            1             4
//                 2     3
const GARLAND_SLOTS = [
  { left: '23%', top: '43%' },
  { left: '32%', top: '58%' },
  { left: '43%', top: '68%' },
  { left: '57%', top: '68%' },
  { left: '68%', top: '58%' },
  { left: '77%', top: '43%' }
];
// Loose flowers rest around the outside of the work area before placement.
const GARLAND_LOOSE_POSITIONS = [
  { left: '10%', top: '20%' },
  { left: '10%', top: '72%' },
  { left: '25%', top: '88%' },
  { left: '75%', top: '88%' },
  { left: '90%', top: '72%' },
  { left: '90%', top: '20%' }
];
const GARLAND_FLOWER_TYPES = ['coral', 'cream', 'coral', 'cream', 'coral', 'cream'];
const garlandFlowerImage = (type) => (type === 'cream' ? fjFlowerCream : fjFlowerCoral);

const TRAVELLING_EMOTIONS = [
  { id: 'happy', image: emotionHappy },
  { id: 'worried', image: emotionWorried },
  { id: 'angry', image: emotionAngry },
  { id: 'sad', image: emotionSad }
];
// The 3 feelings actually earned during the mud/leaves/branch challenges -
// 'happy' is not earned until the modak reveal, so it's excluded from the
// "feelings travelling with Mooshika" badges shown before that.
const EARNED_TRAVELLING_EMOTIONS = TRAVELLING_EMOTIONS.filter((e) => e.id !== 'happy');

const MINI_GESTURE_ANCHORS = {
  calm: { x: 30, y: 52 },
  mud: { x: 50, y: 66 },
  leaves: { x: 50, y: 52 },
  branch: { x: 68, y: 46 },
  garland: { x: 50, y: 50 },
  carry: { x: 72, y: 46 },
  center: { x: 50, y: 30 }
};

function parsePercentValue(value, fallback) {
  if (value == null) return fallback;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ========================================
// VO (Web Speech scaffolding - MP3s later)
// ========================================
const MODAK_VO = {
  calmMooshika: 'Mooshika is dashing about. Press and hold him gently until his busy mind grows calm.',
  calmMooshikaIdle: 'Wait for Mooshika to pause, then press and hold him.',
  mooshikaCalmed: 'You helped Mooshika slow down and feel steady.',
  guidePower: 'I can guide my busy thoughts.',
  mudStart: 'Two flowers are waiting across the mud. Guide Mooshika from stone to stone.',
  mudIdle: 'Keep guiding Mooshika across the stepping stones.',
  leavesStart: 'Two more flowers are hiding in the leaves. Swipe the leaves apart to open them.',
  leavesIdle: 'Swipe the leaves apart again.',
  branchStart: 'The last two flowers are up on the branch. Pull it down gently and hold it there.',
  branchIdle: 'Keep holding the branch until Mooshika can reach.',
  garlandStart: 'Six flowers! Drag each one onto the string to make a garland.',
  garlandIdle: 'Drag another flower onto the string.',
  garlandDone: 'Look, six flowers became one beautiful garland.',
  carryStart: 'Carry the garland to Ganesha. Your feelings can travel along with you.',
  carryIdle: 'Keep guiding Mooshika to Ganesha.',
  bellyPower: 'I can feel many things and still stay steady.',
  modakPower: 'When we stay steady through big feelings, something sweet grows inside.',
  sceneComplete: 'You calmed the busy mind, gathered every flower, and stayed steady all the way to Ganesha.'
};

const MODAK_VO_MOMENT = {
  calmMooshika: 'default',
  calmMooshikaIdle: 'default',
  mooshikaCalmed: 'celebration',
  guidePower: 'encouragement',
  mudStart: 'default',
  mudIdle: 'default',
  leavesStart: 'default',
  leavesIdle: 'default',
  branchStart: 'default',
  branchIdle: 'default',
  garlandStart: 'default',
  garlandIdle: 'default',
  garlandDone: 'celebration',
  carryStart: 'default',
  carryIdle: 'default',
  bellyPower: 'encouragement',
  modakPower: 'encouragement',
  sceneComplete: 'celebration'
};

// phase -> {game key, start VO, idle VO}
const PHASE_META = {
  [PHASES.CALM_SEARCH]: { game: 'calm', start: 'calmMooshika', idle: 'calmMooshikaIdle' }
};
// Game 2 (Flower Journey) and Game 3 (Garland Build) own their own VO/idle
// systems internally - they're excluded from the parent's idle-hint ladder,
// but still tagged here for mini-game analytics (sceneAnalytics.recordEntry).
const ANALYTICS_GAME_KEY = {
  [PHASES.MUD_CROSS]: 'flower-journey',
  [PHASES.GARLAND_MAKING]: 'garland'
};
const WORKING_PHASES = Object.keys(PHASE_META);

const MODAK_DEBUG_UI_ENABLED = (() => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('debugModak') || window.localStorage.getItem('debugModakUI') === '1') return true;
  // Always on inside the local dev harnesses (never in a production build).
  let isDev = false;
  try { isDev = !!import.meta.env?.DEV; } catch { isDev = false; }
  return isDev && /game-test|modak-test|\/dev\//.test(window.location.pathname);
})();

// ========================================
// Error Boundary
// ========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError() {
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
  sceneId = 'modak',
  debugStartGame // dev-only: 1 | 2 | 3 — auto-jumps to that game on mount (see jumpToDebugPhase)
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.CALM_SEARCH,
          welcomeShown: false,

          // beat 1
          mooshikaVisible: false,
          mooshikaPosition: { top: CALM_DISTRACTIONS[0].top, left: CALM_DISTRACTIONS[0].left },
          activeDistractionId: CALM_DISTRACTIONS[0].id,
          mushikaHolding: false,
          holdProgress: 0,
          mooshikaCalm: false,

          // flowers gathered across beats 2-4
          flowers: 0,
          mudStoneIndex: 0,

          // beat 3
          leafSwipes: 0,
          leavesOpen: false,

          // beat 4
          branchDone: false,

          // beat 5
          placedGarlandFlowers: [],
          garlandComplete: false,

          // beat 6
          carryComplete: false,

          discoveredSymbols: {},

          currentPopup: null,
          showingCompletionScreen: false,

          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
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
            debugStartGame={debugStartGame}
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
  sceneId,
  debugStartGame
}) => {
  if (!sceneState || !sceneActions) {
    return <div>Loading scene...</div>;
  }

  // Backfill phase for older saves
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.CALM_SEARCH });
  }, [sceneState?.phase, sceneActions]);

  // ------------------------------------------------------------------
  // VOICE GUIDANCE
  // ------------------------------------------------------------------
  const sceneStateRef = useRef(sceneState);
  sceneStateRef.current = sceneState;

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
    resumeDelay: RESUME_DELAY_MS,
    onReturnHint
  });

  const pauseCelebRef = useRef(null);
  const resumeCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    resumeCelebRef.current?.();
    setHintResetKey(k => k + 1);
  }, []);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS
  });

  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  const playUiTap = playTap;
  const playDiscovery = useCallback(() => playSfx('discovery'), [playSfx]);
  const playRevealBloom = useCallback(() => playSfx('revealBloom'), [playSfx]);
  const playTransition = useCallback(() => playSfx('transition'), [playSfx]);
  const playCelebrationSfx = useCallback(() => playSfx('celebration'), [playSfx]);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const lastVoRef = useRef(null);
  const wasAudioOnRef = useRef(isAudioOn);

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

  const playVoice = useCallback((key, onEnded, _options = {}) => {
    stopRecordedVoice();
    const text = MODAK_VO[key];
    if (!text) {
      onEnded?.();
      return;
    }
    replaySpeak(text, {
      age: 7,
      moment: MODAK_VO_MOMENT[key] || 'default',
      onEnd: onEnded || null,
      onError: () => onEnded?.()
    });
  }, [replaySpeak, stopRecordedVoice]);

  // Replay context on audio toggle-on
  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;
    if (!wasAudioOn && isAudioOn) {
      if (revealConfig?.symbolId) {
        const voMap = { mooshika: 'guidePower', belly: 'bellyPower', modak: 'modakPower' };
        const voKey = voMap[revealConfig.symbolId];
        if (voKey) {
          playVoice(voKey, null, { replayOnReturn: true });
          return;
        }
      }
      const meta = PHASE_META[sceneState.phase];
      if (meta) playVoice(meta.start);
    }
  }, [isAudioOn, sceneState.phase, revealConfig, playVoice]);

  // AudioToggle -> VO volume (mutes narration only)
  useEffect(() => {
    setVoiceVolume(0);
    if (!isAudioOn) stopSpokenVoice();
  }, [isAudioOn, setVoiceVolume, stopSpokenVoice]);

  // Analytics
  useEffect(() => {
    Analytics.sceneStarted(zoneId, sceneId);
    return () => {
      if (!sceneStateRef.current?.completed) {
        Analytics.sceneAbandoned(zoneId, sceneId);
      }
    };
  }, []);

  const openingModalContent = getOpeningModal(zoneId, sceneId);
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  const showOpeningModal = sceneState.phase === PHASES.CALM_SEARCH && !sceneState.welcomeShown;

  const backgroundRef = useRef(null);
  const { miniGesture, triggerMiniGesture } = useMiniGesture();


  // Show-what-to-do gesture shown briefly on entering each working beat.
  const [introGesture, setIntroGesture] = useState(false);

  // --- Live layout + debug panel -----------------------------------
  const [fjLayout, setFjLayout] = useState(loadFjLayout);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [dbgShowAll, setDbgShowAll] = useState(false);
  const [dbgCopyStatus, setDbgCopyStatus] = useState('');
  const [debugPanelPos, setDebugPanelPos] = useState({ x: 16, y: 90 });
  const debugDragRef = useRef(null);
  const L = fjLayout;

  const updateFjLayout = useCallback((key, axis, value) => {
    setFjLayout((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [axis]: Number(value) } };
      try { window.localStorage.setItem(FJ_LAYOUT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const resetFjLayout = useCallback(() => {
    setFjLayout({ ...DEFAULT_FJ_LAYOUT });
    try { window.localStorage.removeItem(FJ_LAYOUT_KEY); } catch {}
  }, []);
  const copyFjLayout = useCallback(() => {
    const json = JSON.stringify(fjLayout, null, 2);
    try {
      navigator.clipboard?.writeText(json);
      setDbgCopyStatus('copied');
    } catch {
      setDbgCopyStatus('see console');
    }
    console.log('[modak-fj-layout]\n' + json);
    setTimeout(() => setDbgCopyStatus(''), 1500);
  }, [fjLayout]);

  const startDebugDrag = (e) => {
    debugDragRef.current = { ox: e.clientX - debugPanelPos.x, oy: e.clientY - debugPanelPos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const moveDebugDrag = (e) => {
    const d = debugDragRef.current;
    if (!d) return;
    setDebugPanelPos({ x: e.clientX - d.ox, y: e.clientY - d.oy });
  };
  const endDebugDrag = () => { debugDragRef.current = null; };

  // final celebration sync
  const [sceneCompleteVOFinished, setSceneCompleteVOFinished] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);

  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const idleHintsEnabled = true;

  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const idleVoPlayedRef = useRef({});
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;

  const resetIdleBaseline = useCallback(() => {
    lastIdleInteractionAtRef.current = Date.now();
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
  }, []);

  const noteInteraction = useCallback(() => {
    recordInteraction();
    resetIdleBaseline();
    setShowIdleGestureHint(false);
    setIntroGesture(false);
    setHintResetKey(k => k + 1);
  }, [recordInteraction, resetIdleBaseline]);

  // Brief "show what to do" gesture whenever a working beat begins.
  useEffect(() => {
    if (!PHASE_META[sceneState.phase] || !sceneState.welcomeShown) {
      setIntroGesture(false);
      return undefined;
    }
    setIntroGesture(true);
    const t = setTimeout(() => setIntroGesture(false), 6000);
    return () => clearTimeout(t);
  }, [sceneState.phase, sceneState.welcomeShown]);

  // ------------------------------------------------------------------
  // beat 1 - HOLD Mooshika
  // ------------------------------------------------------------------
  const mushikaDartTimerRef = useRef(null);
  const mushikaHoldStartRef = useRef(null);
  const mushikaHoldRafRef = useRef(null);
  const mushikaDartIndexRef = useRef(0);
  const calmRevealFiredRef = useRef(false);
  const MUSHIKA_DART_INTERVAL_MS = 1100;
  const MUSHIKA_HOLD_MS = 1600;
  const CALM_REVEAL_GAP_MS = 500;   // beat after "well done" line ends
  const CALM_REVEAL_FALLBACK_MS = 6500; // safety net if speech onEnd never fires

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
    if (
      !sceneStateRef.current?.welcomeShown ||
      sceneStateRef.current?.phase !== PHASES.CALM_SEARCH ||
      sceneStateRef.current?.mushikaHolding
    ) return;

    let nextIndex = Math.floor(Math.random() * CALM_DISTRACTIONS.length);
    if (CALM_DISTRACTIONS.length > 1 && nextIndex === mushikaDartIndexRef.current) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (CALM_DISTRACTIONS.length - 1))) % CALM_DISTRACTIONS.length;
    }
    mushikaDartIndexRef.current = nextIndex;
    const target = CALM_DISTRACTIONS[nextIndex];
    sceneActions.updateState({
      mooshikaVisible: true,
      mooshikaPosition: { top: target.top, left: target.left },
      activeDistractionId: target.id
    });
    clearMushikaDartTimer();
    mushikaDartTimerRef.current = setTimeout(scheduleNextMushikaDart, MUSHIKA_DART_INTERVAL_MS);
  }, [clearMushikaDartTimer, sceneActions]);

  const completeMushikaSettle = useCallback(() => {
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    playDiscovery();
    triggerMiniGesture('thumbsup', 'anchored', 1500, MINI_GESTURE_ANCHORS.calm);
    setShowSparkle('mooshika-calm');

    sceneActions.updateState({
      mooshikaVisible: true,
      mooshikaCalm: true,
      mushikaHolding: false,
      holdProgress: 1,
      activeDistractionId: null,
      phase: PHASES.CALM_REVEAL,
      mooshikaPosition: CALM_SETTLE_POSITION
    });

    // Gate the reveal card (and the affirmation VO it auto-plays) until the
    // "well done" line has finished, so the two VOs never collide.
    calmRevealFiredRef.current = false;
    const showMooshikaReveal = () => {
      if (calmRevealFiredRef.current) return;
      calmRevealFiredRef.current = true;
      playRevealBloom();
      setShowSparkle(null);
      setRevealConfig({
        symbolId: 'mooshika',
        symbolImage: symbolMooshikaColored,
        symbolName: 'Mooshika',
        affirmation: MODAK_VO.guidePower,
        sidebarTarget: getSidebarTarget('mooshika')
      });
    };
    playVoice('mooshikaCalmed', () => safeSetTimeout(showMooshikaReveal, CALM_REVEAL_GAP_MS));
    safeSetTimeout(showMooshikaReveal, CALM_REVEAL_FALLBACK_MS);
  }, [clearMushikaDartTimer, clearMushikaHoldLoop, idleHintsEnabled, playDiscovery, playRevealBloom, playVoice, safeSetTimeout, sceneActions, stopIdleTimer, stopVoice, triggerMiniGesture]);

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

  const handleMushikaHoldStart = (event) => {
    event.preventDefault?.();
    noteInteraction();
    if (!sceneState || sceneState.phase !== PHASES.CALM_SEARCH) return;
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    mushikaHoldStartRef.current = performance.now();
    sceneActions.updateState({ mooshikaVisible: true, mushikaHolding: true, holdProgress: 0 });
    mushikaHoldRafRef.current = requestAnimationFrame(tickMushikaHold);
  };

  const handleMushikaHoldEnd = () => {
    if (!sceneState || sceneState.phase !== PHASES.CALM_SEARCH || !sceneState.mushikaHolding) return;
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    sceneActions.updateState({ mushikaHolding: false, holdProgress: 0 });
    scheduleNextMushikaDart();
  };

  // darting loop lifecycle
  useEffect(() => {
    if (
      sceneState?.welcomeShown &&
      sceneState?.phase === PHASES.CALM_SEARCH &&
      !sceneState?.mushikaHolding
    ) {
      if (!mushikaDartTimerRef.current) scheduleNextMushikaDart();
      return undefined;
    }
    clearMushikaDartTimer();
    return undefined;
  }, [clearMushikaDartTimer, scheduleNextMushikaDart, sceneState?.mushikaHolding, sceneState?.phase, sceneState?.welcomeShown]);

  useEffect(() => {
    return () => {
      clearMushikaDartTimer();
      clearMushikaHoldLoop();
    };
  }, [clearMushikaDartTimer, clearMushikaHoldLoop]);

  // ------------------------------------------------------------------
  // Game 2 (Flower Journey: Bush -> Branch -> Marsh -> belly-feeling beat)
  // and Game 3 (Garland Build -> Carry to Ganesha) are standalone components
  // now (FlowerJourneyGame2 / GarlandGame3) - they own their own mechanics,
  // VO and idle hints internally. This scene only tracks the flower count
  // for persistence/progress and reacts to their onComplete hand-off.
  // ------------------------------------------------------------------
  const handleGame2FlowersUpdate = useCallback((count) => {
    sceneActions.updateState({ flowers: count, progress: { percentage: Math.min(15 + count * 8, 55) } });
  }, [sceneActions]);

  const handleGame2Complete = useCallback(() => {
    playRevealBloom();
    sceneActions.updateState({
      flowers: 6,
      discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true },
      phase: PHASES.CARRY_REVEAL,
      progress: { percentage: 55 }
    });
    setRevealConfig({
      symbolId: 'belly',
      symbolImage: symbolBellyColored,
      symbolName: 'Big Belly',
      affirmation: MODAK_VO.bellyPower,
      sidebarTarget: getSidebarTarget('belly')
    });
  }, [playRevealBloom, sceneActions, sceneState.discoveredSymbols]);

  const handleGame3Complete = useCallback(() => {
    sceneActions.updateState({
      discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true },
      phase: PHASES.MODAK_REVEAL,
      progress: { percentage: 85 }
    });
    playRevealBloom();
    setShowSparkle('modak-appear');
    setRevealConfig({
      symbolId: 'modak',
      symbolImage: symbolModakColored,
      symbolName: 'Modak',
      affirmation: 'I can feel peaceful inside.',
      sidebarTarget: getSidebarTarget('modak')
    });
    safeSetTimeout(() => setShowSparkle(null), 1600);
  }, [playRevealBloom, safeSetTimeout, sceneActions, sceneState.discoveredSymbols]);

  // ------------------------------------------------------------------
  // SymbolAutoReveal helpers
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!revealConfig || !isAudioOn) return;
    const voMap = { mooshika: 'guidePower', belly: 'bellyPower', modak: 'modakPower' };
    const voKey = voMap[revealConfig.symbolId];
    if (!voKey) return;
    const id = setTimeout(() => playVoice(voKey, null, { replayOnReturn: true }), 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, playVoice]);

  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2)
    };
  };

  const triggerFireworks = () => {
    setSceneCompleteVOFinished(false);
    setFireworksFinished(false);
    playCelebrationSfx();
    playVoice('sceneComplete', () => setSceneCompleteVOFinished(true));
    setShowSparkle('final-fireworks');
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'mooshika') {
      safeSetTimeout(() => {
        resetIdleBaseline();
        playVoice('mudStart');
        setShowSparkle('flowers-appear');
        safeSetTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.MUD_CROSS,
            mooshikaVisible: true,
            mooshikaPosition: MUD_START_POSITION,
            activeDistractionId: null,
            discoveredSymbols: { ...sceneState.discoveredSymbols, mooshika: true },
            progress: { percentage: 15 }
          });
          setCurrentPhase('mud');
          if (idleHintsEnabled) startIdleTimer();
          safeSetTimeout(() => setShowSparkle(null), 1500);
        }, 400);
      }, 950);

    } else if (symbolId === 'belly') {
      // Hand off to Game 3 (Garland Build -> Carry to Ganesha). Flowers were
      // already gathered by Game 2; GarlandGame3's onComplete (see
      // handleGame3Complete) triggers the modak reveal at the end.
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true },
          phase: PHASES.GARLAND_MAKING
        });
      }, 950);

    } else if (symbolId === 'modak') {
      stopVoice();
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true },
          phase: PHASES.CELEBRATE
        });
      }, 950);
      safeSetTimeout(() => triggerFireworks(), 1900);
    }
  };

  // ------------------------------------------------------------------
  // Analytics: mini-game entry
  // ------------------------------------------------------------------
  const currentMiniGame = PHASE_META[sceneState.phase]?.game || ANALYTICS_GAME_KEY[sceneState.phase] || null;
  useEffect(() => {
    if (!currentMiniGame) return;
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;
    sceneAnalytics.recordEntry(profileId, sceneId, currentMiniGame);
  }, [currentMiniGame, sceneId]);

  // ------------------------------------------------------------------
  // Opening-modal body class
  // ------------------------------------------------------------------
  useEffect(() => {
    if (showOpeningModal) {
      document.body.classList.add('modak-opening-active');
      return () => document.body.classList.remove('modak-opening-active');
    }
    document.body.classList.remove('modak-opening-active');
    return undefined;
  }, [showOpeningModal]);

  // ------------------------------------------------------------------
  // Pause / resume plumbing
  // ------------------------------------------------------------------
  const isCelebrationOrOverlayActive =
    showSceneCompletion ||
    !!revealConfig ||
    sceneState.phase === PHASES.CALM_REVEAL ||
    sceneState.phase === PHASES.CARRY_REVEAL ||
    sceneState.phase === PHASES.MODAK_PAUSE ||
    sceneState.phase === PHASES.MODAK_REVEAL ||
    sceneState.phase === PHASES.CELEBRATE;

  const isCelebRef = useRef(false);
  isCelebRef.current = isCelebrationOrOverlayActive;

  onReturnHintImplRef.current = () => {
    const s = sceneStateRef.current;
    if (!s?.welcomeShown || isCelebRef.current) return;
    const meta = PHASE_META[s.phase];
    if (!meta) return;
    safeSetTimeout(() => {
      resetIdleBaseline();
      idleVoPlayedRef.current[s.phase] = false;
      playVoice(meta.start);
      setCurrentPhase(meta.game);
    }, 500);
  };

  const isFinalTransitionView =
    showSparkle === 'final-fireworks' || showMandala;
  const isFinalCelebrationActive = isFinalTransitionView || showSceneCompletion;
  const showPersistentEndOverlay =
    showSparkle === 'final-fireworks' && !showSceneCompletion;

  const handlePauseCore = () => {
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
  };

  const resumePhaseAfterPause = () => {
    if (sceneState.phase === PHASES.CELEBRATE && !sceneCompleteVOFinished && showSparkle === 'final-fireworks') {
      playVoice('sceneComplete', () => setSceneCompleteVOFinished(true));
      return;
    }
    if (!sceneState?.welcomeShown || isCelebrationOrOverlayActive) return;
    const meta = PHASE_META[sceneState.phase];
    if (meta) {
      resetIdleBaseline();
      playVoice(meta.start);
      setCurrentPhase(meta.game);
      if (idleHintsEnabled) startIdleTimer();
    }
  };

  pauseCelebRef.current = handlePauseCore;
  resumeCelebRef.current = resumePhaseAfterPause;

  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const symbolPopupSessionOpenRef = useRef(false);

  const handleSymbolPopupOpen = useCallback(() => {
    if (symbolPopupSessionOpenRef.current) return;
    symbolPopupSessionOpenRef.current = true;
    setIsSymbolPopupOpen(true);
    handlePauseCore();
    resetIdleBaseline();
  }, [resetIdleBaseline]);

  const handleSymbolPopupClose = useCallback(() => {
    if (!symbolPopupSessionOpenRef.current) return;
    symbolPopupSessionOpenRef.current = false;
    setIsSymbolPopupOpen(false);
    resetIdleBaseline();
    resumePhaseAfterPause();
  }, [resetIdleBaseline]);

  const activeProfile = GameStateManager.getActiveProfile();

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopMusic();
      if (idleHintsEnabled) stopIdleTimer();
    };
  }, []);

  // ------------------------------------------------------------------
  // RELOAD / RESUME - reset the current beat to a clean start
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sceneState) return;
    const phase = sceneState.phase;

    if (phase === PHASES.CALM_REVEAL) {
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'mooshika',
          symbolImage: symbolMooshikaColored,
          symbolName: 'Mooshika',
          affirmation: MODAK_VO.guidePower,
          sidebarTarget: getSidebarTarget('mooshika')
        });
      }, 1200);
      return;
    }

    if (phase === PHASES.CARRY_REVEAL) {
      safeSetTimeout(() => {
        playRevealBloom();
        setRevealConfig({
          symbolId: 'belly',
          symbolImage: symbolBellyColored,
          symbolName: 'Big Belly',
          affirmation: MODAK_VO.bellyPower,
          sidebarTarget: getSidebarTarget('belly')
        });
      }, 1200);
      return;
    }

    if (phase === PHASES.MODAK_PAUSE || phase === PHASES.MODAK_REVEAL) {
      safeSetTimeout(() => {
        playRevealBloom();
        sceneActions.updateState({ phase: PHASES.MODAK_REVEAL });
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I can feel peaceful inside.',
          sidebarTarget: getSidebarTarget('modak')
        });
      }, 1200);
      return;
    }

    if (phase === PHASES.CELEBRATE && !sceneState.completed) {
      safeSetTimeout(() => triggerFireworks(), 600);
      return;
    }

    // Game 2 / Game 3 manage their own in-progress state internally and
    // remount fresh from their own beginning (Bush / garland-build) on
    // reload - just make sure the persisted flower count matches that.
    if (phase === PHASES.MUD_CROSS) {
      sceneActions.updateState({ flowers: 0, mooshikaVisible: true });
    } else if (phase === PHASES.GARLAND_MAKING) {
      sceneActions.updateState({ flowers: 6 });
    }

    if (WORKING_PHASES.includes(phase) && sceneState.welcomeShown) {
      safeSetTimeout(() => {
        resetIdleBaseline();
        const meta = PHASE_META[phase];
        playVoice(meta.start);
        setCurrentPhase(meta.game);
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
    }
  }, []); // once on mount

  // ------------------------------------------------------------------
  // VOICE: first instruction after Start
  // ------------------------------------------------------------------
  useEffect(() => {
    if (sceneState.welcomeShown && sceneState.phase === PHASES.CALM_SEARCH) {
      startMusic();
      const timer = safeSetTimeout(() => {
        resetIdleBaseline();
        idleVoPlayedRef.current = {};
        playVoice('calmMooshika');
        setCurrentPhase('calm');
        if (idleHintsEnabled) startIdleTimer();
      }, 500);
      return timer;
    }
  }, [sceneState.welcomeShown, sceneState.phase, idleHintsEnabled, playVoice, resetIdleBaseline, safeSetTimeout, setCurrentPhase, startIdleTimer, startMusic]);

  // Update phase context + restart idle timer on phase change
  useEffect(() => {
    const meta = PHASE_META[sceneState.phase];
    if (meta) {
      setCurrentPhase(meta.game);
      if (idleHintsEnabled) {
        stopIdleTimer();
        startIdleTimer();
      }
    } else if (
      sceneState.phase === PHASES.CELEBRATE ||
      sceneState.phase === PHASES.COMPLETE
    ) {
      if (idleHintsEnabled) stopIdleTimer();
      setCurrentPhase(null);
    }
  }, [sceneState.phase]);

  // Idle reset hook
  useEffect(() => {
    if (!idleHintsEnabled) return;
    setShowIdleGestureHint(false);
    setIdleHintLevel(0);
    idleVoPlayedRef.current = {};
    lastIdleInteractionAtRef.current = Date.now();
  }, [hintResetKey, idleHintsEnabled]);

  // Deterministic idle ladder
  useEffect(() => {
    if (!idleHintsEnabled) return;
    const isHintPhase =
      WORKING_PHASES.includes(sceneState?.phase) &&
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

  useEffect(() => {
    if (!idleHintsEnabled) return;
    const isHintPhase =
      WORKING_PHASES.includes(sceneState?.phase) &&
      !!sceneState?.welcomeShown &&
      !isSymbolPopupOpen;
    setShowIdleGestureHint(isHintPhase && idleHintLevel >= 3);
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen]);

  // Idle VO once at level >= 2
  useEffect(() => {
    if (!idleHintsEnabled || !sceneState?.welcomeShown || isSymbolPopupOpen) return;
    const meta = PHASE_META[sceneState?.phase];
    if (!meta) return;
    if (idleHintLevel >= 2 && !idleVoPlayedRef.current[sceneState.phase]) {
      idleVoPlayedRef.current[sceneState.phase] = true;
      playVoice(meta.idle);
    }
  }, [idleHintLevel, sceneState?.phase, sceneState?.welcomeShown, idleHintsEnabled, isSymbolPopupOpen, playVoice]);

  // Final celebration sync
  useEffect(() => {
    if (fireworksFinished && sceneCompleteVOFinished && sceneState.phase === PHASES.CELEBRATE) {
      setShowMandala(true);
    }
  }, [fireworksFinished, sceneCompleteVOFinished, sceneState.phase]);

  useEffect(() => {
    if (!fireworksFinished || sceneCompleteVOFinished) return;
    const t = setTimeout(() => setSceneCompleteVOFinished(true), 10000);
    return () => clearTimeout(t);
  }, [fireworksFinished, sceneCompleteVOFinished]);

  useEffect(() => {
    if (sceneState?.showingCompletionScreen && !showSceneCompletion) {
      playTransition();
      setShowSceneCompletion(true);
      setShowSparkle(null);
    }
  }, [sceneState?.showingCompletionScreen, showSceneCompletion, playTransition]);

  // ------------------------------------------------------------------
  // Reset / debug jump
  // ------------------------------------------------------------------
  const resetScene = () => {
    if (idleHintsEnabled) stopIdleTimer();
    setShowIdleGestureHint(false);
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    mushikaHoldStartRef.current = null;
    mushikaDartIndexRef.current = 0;

    sceneActions.updateState({
      phase: PHASES.CALM_SEARCH,
      welcomeShown: false,
      mooshikaVisible: false,
      mooshikaPosition: { top: CALM_DISTRACTIONS[0].top, left: CALM_DISTRACTIONS[0].left },
      activeDistractionId: CALM_DISTRACTIONS[0].id,
      mushikaHolding: false,
      holdProgress: 0,
      mooshikaCalm: false,
      flowers: 0,
      mudStoneIndex: 0,
      leafSwipes: 0,
      leavesOpen: false,
      branchDone: false,
      placedGarlandFlowers: [],
      garlandComplete: false,
      carryComplete: false,
      discoveredSymbols: {},
      currentPopup: null,
      showingCompletionScreen: false,
      stars: 0,
      completed: false,
      progress: { percentage: 0, starsEarned: 0, completed: false }
    });

    setShowSparkle(null);
    setShowSceneCompletion(false);
    setShowMandala(false);
    setFireworksFinished(false);
    setRevealConfig(null);
  };

  const jumpToDebugPhase = useCallback((n) => {
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    clearMushikaDartTimer();
    clearMushikaHoldLoop();
    setShowSparkle(null);
    setShowSceneCompletion(false);
    setShowMandala(false);
    setFireworksFinished(false);
    setSceneCompleteVOFinished(false);
    setRevealConfig(null);
    setHintResetKey(k => k + 1);

    const base = {
      welcomeShown: true,
      mooshikaVisible: true,
      mushikaHolding: false,
      holdProgress: 0,
      mooshikaCalm: true,
      currentPopup: null,
      showingCompletionScreen: false,
      stars: 0,
      completed: false
    };

    if (n === 1) {
      sceneActions.updateState({
        ...base,
        phase: PHASES.CALM_SEARCH,
        welcomeShown: true,
        mooshikaCalm: false,
        mooshikaPosition: { top: CALM_DISTRACTIONS[0].top, left: CALM_DISTRACTIONS[0].left },
        activeDistractionId: CALM_DISTRACTIONS[0].id,
        flowers: 0,
        mudStoneIndex: 0,
        leafSwipes: 0,
        leavesOpen: false,
        branchDone: false,
        placedGarlandFlowers: [],
        garlandComplete: false,
        carryComplete: false,
        discoveredSymbols: {},
        progress: { percentage: 0 }
      });
    } else if (n === 2) {
      // Game 2: Belly Feeding (Mud Crossing -> Leafy Cluster -> Branch Pull) —
      // the flower-collecting arc. Mooshika card already earned.
      sceneActions.updateState({
        ...base,
        phase: PHASES.MUD_CROSS,
        mooshikaVisible: true,
        mooshikaPosition: MUD_START_POSITION,
        activeDistractionId: null,
        flowers: 0,
        mudStoneIndex: 0,
        leafSwipes: 0,
        leavesOpen: false,
        branchDone: false,
        placedGarlandFlowers: [],
        garlandComplete: false,
        carryComplete: false,
        discoveredSymbols: { mooshika: true },
        progress: { percentage: 15 }
      });
    } else {
      // Game 3: Modak card (Garland Making -> Carry to Ganesha). Flowers
      // already gathered from Game 2.
      sceneActions.updateState({
        ...base,
        phase: PHASES.GARLAND_MAKING,
        mooshikaPosition: CALM_SETTLE_POSITION,
        activeDistractionId: null,
        flowers: 6,
        leafSwipes: LEAVES_SWIPES_NEEDED,
        leavesOpen: true,
        branchDone: true,
        placedGarlandFlowers: [],
        garlandComplete: false,
        carryComplete: false,
        discoveredSymbols: { mooshika: true },
        progress: { percentage: 55 }
      });
    }
  }, [clearMushikaDartTimer, clearMushikaHoldLoop, idleHintsEnabled, sceneActions, stopIdleTimer, stopVoice]);

  // Dev harness support: mount straight into one of the 3 games instead of
  // always starting at Game 1. Fires once per mount (game-test.html passes a
  // fresh key per game so this only ever runs on a clean mount).
  const debugStartAppliedRef = useRef(false);
  useEffect(() => {
    if (!debugStartGame || debugStartAppliedRef.current) return;
    debugStartAppliedRef.current = true;
    jumpToDebugPhase(debugStartGame);
  }, [debugStartGame, jumpToDebugPhase]);

  // ------------------------------------------------------------------
  // Derived view helpers
  // ------------------------------------------------------------------
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen;
  const flowers = sceneState.flowers || 0;

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
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

      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && [1, 2, 3].map((n) => (
        <button
          key={`dbg-${n}`}
          type="button"
          onClick={() => jumpToDebugPhase(n)}
          style={{
            position: 'fixed',
            top: `${80 + (n - 1) * 34}px`,
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
          {n === 1 ? 'Game 1: Mooshika' : n === 2 ? 'Game 2: Belly Feeding' : 'Game 3: Modak'}
        </button>
      ))}

      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && !showDebugPanel && (
        <button
          type="button"
          onClick={() => setShowDebugPanel(true)}
          style={{
            position: 'fixed', top: '184px', right: '74px', zIndex: 1200,
            border: '1px solid #7c3aed', background: '#7c3aed', color: '#fff',
            borderRadius: '999px', padding: '8px 12px', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
          }}
        >
          Layout Debug
        </button>
      )}

      {!isFinalTransitionView && MODAK_DEBUG_UI_ENABLED && showDebugPanel && (
        <div
          className="modak-fj-debug-panel"
          style={{ left: `${debugPanelPos.x}px`, top: `${debugPanelPos.y}px` }}
        >
          <div
            className="modak-fj-debug-handle"
            onPointerDown={startDebugDrag}
            onPointerMove={moveDebugDrag}
            onPointerUp={endDebugDrag}
            onPointerCancel={endDebugDrag}
          >
            <span>Flower Journey layout</span>
            <button type="button" onClick={() => setShowDebugPanel(false)}>close</button>
          </div>
          <div className="modak-fj-debug-body">
            <label className="modak-fj-debug-row" style={{ gridTemplateColumns: '1fr auto' }}>
              <span>Show all beats</span>
              <input type="checkbox" checked={dbgShowAll} onChange={(e) => setDbgShowAll(e.target.checked)} />
            </label>

            {Object.keys(DEFAULT_FJ_LAYOUT).map((key) => (
              <div key={key}>
                <div className="modak-fj-debug-section">{key}</div>
                {['x', 'y', ...(('w' in DEFAULT_FJ_LAYOUT[key]) ? ['w'] : [])].map((axis) => {
                  const max = axis === 'w' ? 80 : 100;
                  return (
                    <label key={axis} className="modak-fj-debug-row">
                      <span>{axis.toUpperCase()}</span>
                      <input
                        type="range" min={0} max={max} step={0.5}
                        value={L[key][axis]}
                        onChange={(e) => updateFjLayout(key, axis, e.target.value)}
                      />
                      <input
                        type="number" min={0} max={max} step={0.5}
                        value={L[key][axis]}
                        onChange={(e) => updateFjLayout(key, axis, e.target.value)}
                      />
                    </label>
                  );
                })}
              </div>
            ))}

            <div className="modak-fj-debug-actions">
              <button type="button" onClick={copyFjLayout}>Copy Layout JSON</button>
              {dbgCopyStatus && <span style={{ alignSelf: 'center' }}>{dbgCopyStatus}</span>}
              <button type="button" onClick={resetFjLayout}>Reset</button>
            </div>
          </div>
        </div>
      )}

      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="modak-game-container">
            {showPersistentEndOverlay && !revealConfig && (
              <div className="modak-game-end-overlay" />
            )}

            <div
              ref={backgroundRef}
              className={`modak-game-background ${dbgShowAll ? 'modak-fj-debug-live' : ''}`}
              style={{ backgroundImage: `url(${forestBackground})` }}
            >
              {!isCompletionView && !isFinalTransitionView && (
                <>
                  {/* OPENING MODAL */}
                  {showOpeningModal && (
                    <OpeningModal
                      zoneId={zoneId}
                      sceneId={sceneId}
                      onStart={() => {
                        playUiTap();
                        mushikaDartIndexRef.current = 0;
                        sceneActions.updateState({
                          welcomeShown: true,
                          mooshikaVisible: true,
                          mooshikaPosition: { top: CALM_DISTRACTIONS[0].top, left: CALM_DISTRACTIONS[0].left },
                          activeDistractionId: CALM_DISTRACTIONS[0].id,
                          mushikaHolding: false,
                          holdProgress: 0
                        });
                      }}
                      characterImg={ganeshaFeeding}
                      showButton={true}
                    />
                  )}

                  {/* FLOWER TRAY - docked beside Mooshika's current spot, not a fixed top counter */}
                  {sceneState.welcomeShown && !isFinalTransitionView && sceneState.phase !== PHASES.GARLAND_MAKING && sceneState.phase !== PHASES.MUD_CROSS && sceneState.phase !== PHASES.CARRY_REVEAL && (() => {
                    const mPos = sceneState.mooshikaPosition || CALM_SETTLE_POSITION;
                    const trayTop = Math.max(6, parsePercentValue(mPos.top, 50) - 13);
                    const trayLeft = Math.min(88, parsePercentValue(mPos.left, 50) + 12);
                    return (
                      <div
                        className="modak-fj-flower-tray modak-fj-flower-tray--follow"
                        style={{ top: `${trayTop}%`, left: `${trayLeft}%` }}
                        aria-label={`${flowers} of 6 flowers gathered`}
                      >
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span
                            key={`ft-${i}`}
                            className={`modak-fj-flower-slot ${i < flowers ? 'filled' : ''} ${i === flowers - 1 && showSparkle?.startsWith('flowers-') ? 'pop' : ''}`}
                          >
                            {i < flowers && (
                              <img src={garlandFlowerImage(GARLAND_FLOWER_TYPES[i])} alt="" />
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* ============ BEAT 1: CALM (hold) ============ */}
                  {/* Only one Mooshika image is ever on screen at a time - this
                      static/live-position render is strictly beat-1-only so it
                      never overlaps the beat-2 draggable Mooshika (#fj-mooshika). */}
                  {sceneState.welcomeShown &&
                    [PHASES.CALM_SEARCH, PHASES.CALM_REVEAL].includes(sceneState.phase) &&
                    sceneState.phase !== PHASES.MUD_CROSS && (
                      <>
                        {CALM_DISTRACTIONS.map((item) => {
                          const isActive =
                            sceneState.activeDistractionId === item.id &&
                            sceneState.phase === PHASES.CALM_SEARCH &&
                            !sceneState.mushikaHolding;
                          const isFaded =
                            sceneState.mushikaHolding || sceneState.phase === PHASES.CALM_REVEAL;
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
                            className={`modak-game-mushika-search ${sceneState.phase === PHASES.CALM_REVEAL ? 'walking' : 'darting'} ${sceneState.mushikaHolding ? 'holding' : ''}`}
                            style={sceneState.mooshikaPosition || { top: CALM_DISTRACTIONS[0].top, left: CALM_DISTRACTIONS[0].left }}
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
                              src={sceneState.phase === PHASES.CALM_REVEAL ? mooshikaCalm : mooshikaActive}
                              alt="Mooshika"
                              style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
                            />
                            {showSparkle === 'mooshika-calm' && (
                              <>
                                <span className="modak-game-mushika-calm-aura" aria-hidden="true" />
                                <SparkleAnimation type="magic" count={14} color="#ffd76b" size={10} duration={1200} fadeOut area="full" />
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}

                  {/* ============ GAME 2: Flower Journey (Bush -> Branch ->
                      Marsh -> belly-feeling beat) ============ */}
                  {sceneState.phase === PHASES.MUD_CROSS && (
                    <FlowerJourneyGame2
                      isActive
                      isPaused={isSymbolPopupOpen}
                      isAudioOn={isAudioOn}
                      onFlowersUpdate={handleGame2FlowersUpdate}
                      onComplete={handleGame2Complete}
                    />
                  )}

                  {/* ============ GAME 3: Garland Build -> Carry to Ganesha
                      ============ */}
                  {sceneState.phase === PHASES.GARLAND_MAKING && (
                    <GarlandGame3
                      isActive
                      isPaused={isSymbolPopupOpen}
                      isAudioOn={isAudioOn}
                      onComplete={handleGame3Complete}
                    />
                  )}

                  {/* ============ GESTURE DEMOS ============ */}
                  <GestureDemo
                    type="hold"
                    from={{
                      x: parsePercentValue((sceneState.mooshikaPosition || CALM_DISTRACTIONS[0]).left, 30),
                      y: parsePercentValue((sceneState.mooshikaPosition || CALM_DISTRACTIONS[0]).top, 52)
                    }}
                    active={(introGesture || showIdleGestureHint) && sceneState.phase === PHASES.CALM_SEARCH && !sceneState.mushikaHolding}
                    idleDelay={120}
                    zIndex={24}
                  />

                  {/* MINI THUMBS-UP CUE */}
                  {miniGesture.show && (
                    <GaneshaGestureCue
                      key={miniGesture.key}
                      gestureType={miniGesture.type}
                      position={miniGesture.position}
                      anchor={miniGesture.anchor}
                      size={72}
                    />
                  )}
                </>
              )}
            </div>

            {/* FIREWORKS (visual only) */}
            {!isCompletionView && (
              <FireworksCompletion show={showSparkle === 'final-fireworks'} showCard={false} />
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
                  { ring: 'middle', id: 3 }
                ]}
                earnedSymbols={[
                  { id: 'mooshika', petalId: 1, ring: 'middle', image: symbolMooshikaColored },
                  { id: 'belly', petalId: 2, ring: 'middle', image: symbolBellyColored },
                  { id: 'modak', petalId: 3, ring: 'middle', image: symbolModakColored }
                ]}
                autoCloseMs={3000 + (3 * 950) + 2600}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  playTransition();
                  setShowSceneCompletion(true);
                  sceneActions.updateState({ completed: true, showingCompletionScreen: true });
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
                discoveredSymbols={['mooshika', 'belly', 'modak']}
                symbolImages={{
                  mooshika: symbolMooshikaColored,
                  modak: symbolModakColored,
                  belly: symbolBellyColored
                }}
                symbolData={{
                  mooshika: {
                    title: "Mooshika - Ganesha's Clever Friend!",
                    description: "A tiny mouse with a big heart! Mooshika helps us steer a busy, buzzing mind."
                  },
                  modak: {
                    title: "Modak - Ganesha's Sweet Treat!",
                    description: "The sweetness that grows inside when we stay steady through big feelings."
                  },
                  belly: {
                    title: "Ganesha's Big Belly",
                    description: "It reminds us we can feel many things at once and still stay steady."
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
                  stopVoice();
                  SimpleSceneManager.setCurrentScene('symbol-mountain', 'pond', false, false);
                  onNavigate?.('scene-complete-continue');
                }}
              />
            )}

            {/* SYMBOL AUTO-REVEAL */}
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

            {/* SIDE RAIL */}
            {!isCompletionView && !isFinalTransitionView && sceneState.welcomeShown && !isFinalCelebrationActive && (
              <SymbolSidebar
                discoveredSymbols={sceneState.discoveredSymbols || {}}
                onSymbolClick={() => {}}
                onPopupOpen={handleSymbolPopupOpen}
                onPopupClose={handleSymbolPopupClose}
              />
            )}
          </div>
        </MessageManager>
      </InteractionManager>

      <ResumeCountdown value={countdownValue} />
    </div>
  );
};

export default NewModakSceneMVP;
