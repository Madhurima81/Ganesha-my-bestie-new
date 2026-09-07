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
import forestBackground from './assets/images/newmodakbg.webp';
import mooshikaActive from './assets/images/mushika-active-game2.webp';
import mooshikaCalm from './assets/images/mushika-calm-game2.webp';
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

// Flower Journey assets (new)
import fjMudCrossing from './assets/images/fj-mud-crossing.png';
import fjLeafyClosed from './assets/images/fj-leafy-closed.png';
import fjLeafyOpened from './assets/images/fj-leafy-opened.png';
import fjTree from './assets/images/fj-tree.png';
import fjBranch from './assets/images/fj-branch.png';
import fjFlowerCoral from './assets/images/fj-flower-coral.png';
import fjFlowerCream from './assets/images/fj-flower-cream.png';
import fjGarlandEmpty from './assets/images/fj-garland-empty.png';
import fjGarlandComplete from './assets/images/fj-garland-complete.png';

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

// garland thread slots (percent within the garland overlay stage)
const GARLAND_SLOTS = [
  { left: '20%', top: '46%' },
  { left: '31%', top: '58%' },
  { left: '43%', top: '64%' },
  { left: '57%', top: '64%' },
  { left: '69%', top: '58%' },
  { left: '80%', top: '46%' }
];
const GARLAND_FLOWER_TYPES = ['coral', 'cream', 'coral', 'cream', 'coral', 'cream'];
const garlandFlowerImage = (type) => (type === 'cream' ? fjFlowerCream : fjFlowerCoral);

const TRAVELLING_EMOTIONS = [
  { id: 'happy', image: emotionHappy },
  { id: 'worried', image: emotionWorried },
  { id: 'angry', image: emotionAngry },
  { id: 'sad', image: emotionSad }
];

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
  [PHASES.CALM_SEARCH]: { game: 'calm', start: 'calmMooshika', idle: 'calmMooshikaIdle' },
  [PHASES.MUD_CROSS]: { game: 'mud', start: 'mudStart', idle: 'mudIdle' },
  [PHASES.LEAVES_OPEN]: { game: 'leaves', start: 'leavesStart', idle: 'leavesIdle' },
  [PHASES.BRANCH_PULL]: { game: 'branch', start: 'branchStart', idle: 'branchIdle' },
  [PHASES.GARLAND_MAKING]: { game: 'garland', start: 'garlandStart', idle: 'garlandIdle' },
  [PHASES.CARRY]: { game: 'carry', start: 'carryStart', idle: 'carryIdle' }
};
const WORKING_PHASES = Object.keys(PHASE_META);

const MODAK_DEBUG_UI_ENABLED = (() => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('debugModak') || window.localStorage.getItem('debugModakUI') === '1';
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
  sceneId = 'modak'
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

          // beat 3
          leafSwipes: 0,
          leavesOpen: false,

          // beat 4
          branchDone: false,

          // beat 5
          garlandFilled: 0,
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
  const playPlace = useCallback(() => playSfx('place'), [playSfx]);
  const playTransition = useCallback(() => playSfx('transition'), [playSfx]);
  const playEmotionalGlow = useCallback(() => playSfx('emotionalGlow'), [playSfx]);
  const playCelebrationSfx = useCallback(() => playSfx('celebration'), [playSfx]);
  const playSoftWrong = useCallback(() => playSfx('softWrong'), [playSfx]);

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

  // transient mechanic visuals (not persisted)
  const [branchPull, setBranchPull] = useState(0);
  const [leavesShake, setLeavesShake] = useState(false);
  const [activeEmotion, setActiveEmotion] = useState(null); // 'worried' | 'angry' | 'sad'
  const [garlandBounce, setGarlandBounce] = useState(-1);
  const [dragActive, setDragActive] = useState(false);

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
    setHintResetKey(k => k + 1);
  }, [recordInteraction, resetIdleBaseline]);

  // ------------------------------------------------------------------
  // beat 1 - HOLD Mooshika
  // ------------------------------------------------------------------
  const mushikaDartTimerRef = useRef(null);
  const mushikaHoldStartRef = useRef(null);
  const mushikaHoldRafRef = useRef(null);
  const mushikaDartIndexRef = useRef(0);
  const MUSHIKA_DART_INTERVAL_MS = 1100;
  const MUSHIKA_HOLD_MS = 1600;
  const MUSHIKA_CALM_BEAT_MS = 1200;

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
    playVoice('mooshikaCalmed');
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

    safeSetTimeout(() => {
      playRevealBloom();
      setShowSparkle(null);
      setRevealConfig({
        symbolId: 'mooshika',
        symbolImage: symbolMooshikaColored,
        symbolName: 'Mooshika',
        affirmation: MODAK_VO.guidePower,
        sidebarTarget: getSidebarTarget('mooshika')
      });
    }, MUSHIKA_CALM_BEAT_MS);
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
  // beat 2 - GUIDE across mud
  // ------------------------------------------------------------------
  const mudLockRef = useRef(false);
  const handleMudDragStart = useCallback(() => {
    if (sceneState.phase !== PHASES.MUD_CROSS) return;
    noteInteraction();
    stopVoice();
    setDragActive(true);
    setActiveEmotion('worried');
  }, [noteInteraction, sceneState.phase, stopVoice]);

  const handleMudDragEnd = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleMudArrive = useCallback(() => {
    if (sceneState.phase !== PHASES.MUD_CROSS || mudLockRef.current) return;
    mudLockRef.current = true;
    setDragActive(false);
    setActiveEmotion(null);
    playPlace();
    playDiscovery();
    setShowSparkle('flowers-2');
    triggerMiniGesture('thumbsup', 'anchored', 1500, MINI_GESTURE_ANCHORS.mud);
    if (idleHintsEnabled) stopIdleTimer();
    sceneActions.updateState({
      flowers: 2,
      phase: PHASES.LEAVES_OPEN,
      mooshikaPosition: { top: '52%', left: '40%' },
      progress: { percentage: 25 }
    });
    safeSetTimeout(() => setShowSparkle(null), 1100);
    safeSetTimeout(() => {
      resetIdleBaseline();
      playVoice('leavesStart');
      setCurrentPhase('leaves');
      if (idleHintsEnabled) startIdleTimer();
    }, 700);
  }, [idleHintsEnabled, playDiscovery, playPlace, playVoice, resetIdleBaseline, safeSetTimeout, sceneActions, sceneState.phase, setCurrentPhase, startIdleTimer, stopIdleTimer, triggerMiniGesture]);

  // ------------------------------------------------------------------
  // beat 3 - SWIPE leaves apart
  // ------------------------------------------------------------------
  const leafSwipeStartRef = useRef(null);
  const leavesLockRef = useRef(false);

  const handleLeavesPointerDown = (e) => {
    if (sceneState.phase !== PHASES.LEAVES_OPEN || sceneState.leavesOpen) return;
    leafSwipeStartRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? null;
  };

  const registerLeafSwipe = useCallback(() => {
    if (sceneState.phase !== PHASES.LEAVES_OPEN || sceneState.leavesOpen || leavesLockRef.current) return;
    noteInteraction();
    stopVoice();
    const next = (sceneState.leafSwipes || 0) + 1;
    setLeavesShake(true);
    setActiveEmotion('angry');
    playUiTap();
    safeSetTimeout(() => setLeavesShake(false), 360);

    if (next >= LEAVES_SWIPES_NEEDED) {
      leavesLockRef.current = true;
      setActiveEmotion(null);
      playDiscovery();
      playPlace();
      setShowSparkle('flowers-4');
      triggerMiniGesture('thumbsup', 'anchored', 1500, MINI_GESTURE_ANCHORS.leaves);
      if (idleHintsEnabled) stopIdleTimer();
      sceneActions.updateState({
        leafSwipes: next,
        leavesOpen: true,
        flowers: 4,
        phase: PHASES.BRANCH_PULL,
        progress: { percentage: 40 }
      });
      safeSetTimeout(() => setShowSparkle(null), 1200);
      safeSetTimeout(() => {
        resetIdleBaseline();
        playVoice('branchStart');
        setCurrentPhase('branch');
        if (idleHintsEnabled) startIdleTimer();
      }, 900);
    } else {
      sceneActions.updateState({ leafSwipes: next });
    }
  }, [idleHintsEnabled, noteInteraction, playDiscovery, playPlace, playUiTap, playVoice, resetIdleBaseline, safeSetTimeout, sceneActions, sceneState.leafSwipes, sceneState.leavesOpen, sceneState.phase, setCurrentPhase, startIdleTimer, stopIdleTimer, stopVoice, triggerMiniGesture]);

  const handleLeavesPointerUp = (e) => {
    const startX = leafSwipeStartRef.current;
    leafSwipeStartRef.current = null;
    if (startX == null) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? startX;
    if (Math.abs(endX - startX) >= LEAVES_SWIPE_DISTANCE) registerLeafSwipe();
  };

  // ------------------------------------------------------------------
  // beat 4 - PULL + HOLD branch
  // ------------------------------------------------------------------
  const branchDragRef = useRef({ active: false, startY: 0 });
  const branchHoldTimerRef = useRef(null);
  const branchLockRef = useRef(false);

  const clearBranchHoldTimer = () => {
    if (branchHoldTimerRef.current) {
      clearTimeout(branchHoldTimerRef.current);
      branchHoldTimerRef.current = null;
    }
  };

  const completeBranch = useCallback(() => {
    if (branchLockRef.current) return;
    branchLockRef.current = true;
    clearBranchHoldTimer();
    branchDragRef.current.active = false;
    setBranchPull(1);
    setActiveEmotion(null);
    playPlace();
    playDiscovery();
    setShowSparkle('flowers-6');
    triggerMiniGesture('thumbsup', 'anchored', 1800, MINI_GESTURE_ANCHORS.branch);
    if (idleHintsEnabled) stopIdleTimer();
    sceneActions.updateState({
      branchDone: true,
      flowers: 6,
      phase: PHASES.GARLAND_MAKING,
      progress: { percentage: 55 }
    });
    safeSetTimeout(() => {
      setBranchPull(0);
      setShowSparkle(null);
      resetIdleBaseline();
      playVoice('garlandStart');
      setCurrentPhase('garland');
    }, 1200);
  }, [idleHintsEnabled, playDiscovery, playPlace, playVoice, resetIdleBaseline, safeSetTimeout, sceneActions, setCurrentPhase, stopIdleTimer, triggerMiniGesture]);

  const handleBranchPointerDown = (e) => {
    if (sceneState.phase !== PHASES.BRANCH_PULL || sceneState.branchDone) return;
    e.preventDefault?.();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    noteInteraction();
    stopVoice();
    branchDragRef.current = { active: true, startY: e.clientY ?? 0 };
    setActiveEmotion('sad');
  };

  const handleBranchPointerMove = (e) => {
    if (!branchDragRef.current.active) return;
    const dy = (e.clientY ?? 0) - branchDragRef.current.startY;
    const pull = Math.max(0, Math.min(1, dy / BRANCH_PULL_RANGE_PX));
    setBranchPull(pull);
    if (pull >= BRANCH_PULL_TRIGGER) {
      setActiveEmotion(null);
      if (!branchHoldTimerRef.current && !branchLockRef.current) {
        branchHoldTimerRef.current = safeSetTimeout(completeBranch, BRANCH_HOLD_MS);
      }
    } else {
      setActiveEmotion('sad');
      clearBranchHoldTimer();
    }
  };

  const handleBranchPointerUp = () => {
    if (!branchDragRef.current.active) return;
    branchDragRef.current.active = false;
    clearBranchHoldTimer();
    if (!branchLockRef.current) {
      playSoftWrong();
      setBranchPull(0);
      setActiveEmotion('sad');
      safeSetTimeout(() => setActiveEmotion(null), 500);
    }
  };

  useEffect(() => () => clearBranchHoldTimer(), []);

  // ------------------------------------------------------------------
  // beat 5 - DRAG + SNAP garland
  // ------------------------------------------------------------------
  const garlandLockRef = useRef(false);
  const handleGarlandDrop = useCallback(() => {
    if (sceneState.phase !== PHASES.GARLAND_MAKING || sceneState.garlandComplete) return;
    const filled = (sceneState.garlandFilled || 0) + 1;
    noteInteraction();
    stopVoice();
    playPlace();
    setGarlandBounce(filled - 1);
    safeSetTimeout(() => setGarlandBounce(-1), 420);

    if (filled >= 6) {
      if (garlandLockRef.current) return;
      garlandLockRef.current = true;
      playDiscovery();
      triggerMiniGesture('thumbsup', 'anchored', 2000, MINI_GESTURE_ANCHORS.garland);
      if (idleHintsEnabled) stopIdleTimer();
      sceneActions.updateState({
        garlandFilled: filled,
        garlandComplete: true,
        progress: { percentage: 70 }
      });
      playVoice('garlandDone');
      safeSetTimeout(() => {
        resetIdleBaseline();
        sceneActions.updateState({
          phase: PHASES.CARRY,
          mooshikaPosition: CARRY_START_POSITION
        });
        playVoice('carryStart');
        setCurrentPhase('carry');
        if (idleHintsEnabled) startIdleTimer();
      }, 2200);
    } else {
      sceneActions.updateState({ garlandFilled: filled });
    }
  }, [idleHintsEnabled, noteInteraction, playDiscovery, playPlace, playVoice, resetIdleBaseline, safeSetTimeout, sceneActions, sceneState.garlandComplete, sceneState.garlandFilled, sceneState.phase, setCurrentPhase, startIdleTimer, stopIdleTimer, stopVoice, triggerMiniGesture]);

  // ------------------------------------------------------------------
  // beat 6 - GUIDE to Ganesha
  // ------------------------------------------------------------------
  const carryLockRef = useRef(false);
  const handleCarryDragStart = useCallback(() => {
    if (sceneState.phase !== PHASES.CARRY) return;
    noteInteraction();
    stopVoice();
    setDragActive(true);
  }, [noteInteraction, sceneState.phase, stopVoice]);

  const handleCarryDragEnd = useCallback(() => setDragActive(false), []);

  const completeCarry = useCallback(() => {
    if (sceneState.phase !== PHASES.CARRY || carryLockRef.current) return;
    carryLockRef.current = true;
    setDragActive(false);
    stopVoice();
    if (idleHintsEnabled) stopIdleTimer();
    playPlace();
    playEmotionalGlow();
    triggerMiniGesture('thumbsup', 'anchored', 1800, MINI_GESTURE_ANCHORS.carry);
    sceneActions.updateState({
      carryComplete: true,
      phase: PHASES.CARRY_REVEAL,
      mooshikaPosition: CARRY_END_POSITION,
      progress: { percentage: 85 }
    });
    safeSetTimeout(() => {
      playRevealBloom();
      setRevealConfig({
        symbolId: 'belly',
        symbolImage: symbolBellyColored,
        symbolName: 'Big Belly',
        affirmation: MODAK_VO.bellyPower,
        sidebarTarget: getSidebarTarget('belly')
      });
    }, 1500);
  }, [idleHintsEnabled, playEmotionalGlow, playPlace, playRevealBloom, safeSetTimeout, sceneActions, sceneState.phase, stopIdleTimer, stopVoice, triggerMiniGesture]);

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
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true },
          phase: PHASES.MODAK_PAUSE
        });
      }, 950);
      // short pause, then the sweet reveal
      safeSetTimeout(() => {
        setShowSparkle('modak-appear');
        playRevealBloom();
        sceneActions.updateState({ phase: PHASES.MODAK_REVEAL });
        setRevealConfig({
          symbolId: 'modak',
          symbolImage: symbolModakColored,
          symbolName: 'Modak',
          affirmation: 'I can feel peaceful inside.',
          sidebarTarget: getSidebarTarget('modak')
        });
        safeSetTimeout(() => setShowSparkle(null), 1600);
      }, 2600);

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
  const currentMiniGame = PHASE_META[sceneState.phase]?.game || null;
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

    // mid-beat working phases: reset that beat and replay its start VO
    if (phase === PHASES.MUD_CROSS) {
      sceneActions.updateState({
        flowers: 0,
        mooshikaVisible: true,
        mooshikaPosition: MUD_START_POSITION
      });
    } else if (phase === PHASES.LEAVES_OPEN) {
      sceneActions.updateState({ flowers: 2, leafSwipes: 0, leavesOpen: false });
    } else if (phase === PHASES.BRANCH_PULL) {
      sceneActions.updateState({ flowers: 4, branchDone: false });
      setBranchPull(0);
    } else if (phase === PHASES.GARLAND_MAKING) {
      sceneActions.updateState({ flowers: 6, garlandFilled: 0, garlandComplete: false });
    } else if (phase === PHASES.CARRY) {
      sceneActions.updateState({
        carryComplete: false,
        mooshikaPosition: CARRY_START_POSITION
      });
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
    clearBranchHoldTimer();
    mushikaHoldStartRef.current = null;
    mushikaDartIndexRef.current = 0;
    mudLockRef.current = false;
    leavesLockRef.current = false;
    branchLockRef.current = false;
    garlandLockRef.current = false;
    carryLockRef.current = false;
    setBranchPull(0);
    setActiveEmotion(null);

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
      leafSwipes: 0,
      leavesOpen: false,
      branchDone: false,
      garlandFilled: 0,
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
    clearBranchHoldTimer();
    mudLockRef.current = false;
    leavesLockRef.current = false;
    branchLockRef.current = false;
    garlandLockRef.current = false;
    carryLockRef.current = false;
    setBranchPull(0);
    setActiveEmotion(null);
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
        leafSwipes: 0,
        leavesOpen: false,
        branchDone: false,
        garlandFilled: 0,
        garlandComplete: false,
        carryComplete: false,
        discoveredSymbols: {},
        progress: { percentage: 0 }
      });
    } else if (n === 2) {
      sceneActions.updateState({
        ...base,
        phase: PHASES.GARLAND_MAKING,
        mooshikaPosition: CALM_SETTLE_POSITION,
        activeDistractionId: null,
        flowers: 6,
        leafSwipes: LEAVES_SWIPES_NEEDED,
        leavesOpen: true,
        branchDone: true,
        garlandFilled: 0,
        garlandComplete: false,
        carryComplete: false,
        discoveredSymbols: { mooshika: true },
        progress: { percentage: 55 }
      });
    } else {
      sceneActions.updateState({
        ...base,
        phase: PHASES.CARRY,
        mooshikaPosition: CARRY_START_POSITION,
        activeDistractionId: null,
        flowers: 6,
        leafSwipes: LEAVES_SWIPES_NEEDED,
        leavesOpen: true,
        branchDone: true,
        garlandFilled: 6,
        garlandComplete: true,
        carryComplete: false,
        discoveredSymbols: { mooshika: true },
        progress: { percentage: 80 }
      });
    }
  }, [clearMushikaDartTimer, clearMushikaHoldLoop, idleHintsEnabled, sceneActions, stopIdleTimer, stopVoice]);

  // ------------------------------------------------------------------
  // Derived view helpers
  // ------------------------------------------------------------------
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen;
  const flowers = sceneState.flowers || 0;

  const mooshikaImg = sceneState.mooshikaCalm ? mooshikaCalm : mooshikaActive;

  const emotionImageFor = (id) => {
    const found = TRAVELLING_EMOTIONS.find(e => e.id === id);
    return found ? found.image : null;
  };

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
          {n === 1 ? 'Beat 1: Calm' : n === 2 ? 'Beat 5: Garland' : 'Beat 6: Carry'}
        </button>
      ))}

      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="modak-game-container">
            {showPersistentEndOverlay && !revealConfig && (
              <div className="modak-game-end-overlay" />
            )}

            <div
              ref={backgroundRef}
              className="modak-game-background"
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

                  {/* FLOWER COUNTER */}
                  {sceneState.welcomeShown && !isFinalTransitionView && sceneState.phase !== PHASES.GARLAND_MAKING && (
                    <div className="modak-fj-flower-tray" aria-label={`${flowers} of 6 flowers gathered`}>
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
                  )}

                  {/* ============ BEAT 1: CALM (hold) ============ */}
                  {sceneState.welcomeShown &&
                    [PHASES.CALM_SEARCH, PHASES.CALM_REVEAL].includes(sceneState.phase) && (
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

                  {/* ============ BEAT 2: MUD CROSSING (guide) ============ */}
                  {sceneState.phase === PHASES.MUD_CROSS && (
                    <>
                      <img src={fjMudCrossing} alt="" className="modak-fj-mud" aria-hidden="true" />
                      <KidsDropZone
                        id="mud-far-side"
                        accepts="fj-mooshika"
                        onDrop={handleMudArrive}
                        style={{
                          position: 'absolute',
                          left: MUD_END_POSITION.left,
                          top: MUD_END_POSITION.top,
                          width: 'clamp(120px, 12vw, 190px)',
                          height: 'clamp(120px, 12vw, 190px)',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 12
                        }}
                      >
                        <div className={`modak-fj-target ${idleHintLevel >= 2 ? 'hint-strong' : idleHintLevel >= 1 ? 'hint' : ''}`} />
                      </KidsDropZone>

                      <KidsDraggable
                        id="fj-mooshika"
                        data={{ type: 'fj-mooshika' }}
                        dragScale={1.06}
                        dragBorderRadius="50%"
                        style={{
                          position: 'absolute',
                          left: (sceneState.mooshikaPosition || MUD_START_POSITION).left,
                          top: (sceneState.mooshikaPosition || MUD_START_POSITION).top,
                          width: 'clamp(120px, 11vw, 175px)',
                          height: 'clamp(120px, 11vw, 175px)',
                          transform: `translate(-50%, -50%)${dragActive ? ' scale(1.03)' : ''}`,
                          zIndex: 15,
                          touchAction: 'none'
                        }}
                        onDragStart={handleMudDragStart}
                        onDragEnd={handleMudDragEnd}
                      >
                        <div className={`modak-fj-carrier ${dragActive ? 'wobble' : ''}`}>
                          <img src={mooshikaCalm} alt="Mooshika" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
                          {activeEmotion === 'worried' && (
                            <img src={emotionImageFor('worried')} alt="" className="modak-fj-emotion modak-fj-emotion--tr" aria-hidden="true" />
                          )}
                        </div>
                      </KidsDraggable>
                    </>
                  )}

                  {/* ============ BEAT 3: LEAVES (swipe apart) ============ */}
                  {sceneState.phase === PHASES.LEAVES_OPEN && (
                    <div
                      className="modak-fj-leaves-stage"
                      style={{ left: LEAVES_POSITION.left, top: LEAVES_POSITION.top }}
                    >
                      <img
                        src={sceneState.leavesOpen ? fjLeafyOpened : fjLeafyClosed}
                        alt=""
                        className={`modak-fj-leaves ${leavesShake ? 'shake' : ''} ${!sceneState.leavesOpen && idleHintLevel >= 1 ? 'hint' : ''}`}
                        onPointerDown={handleLeavesPointerDown}
                        onPointerUp={handleLeavesPointerUp}
                        draggable={false}
                      />
                      {!sceneState.leavesOpen && activeEmotion === 'angry' && (
                        <img src={emotionImageFor('angry')} alt="" className="modak-fj-emotion modak-fj-emotion--tl" aria-hidden="true" />
                      )}
                      {sceneState.leavesOpen && (
                        <SparkleAnimation type="star" count={16} color="#ffd700" size={10} duration={1400} fadeOut area="full" />
                      )}
                    </div>
                  )}

                  {/* ============ BEAT 4: BRANCH (pull + hold) ============ */}
                  {sceneState.phase === PHASES.BRANCH_PULL && (
                    <div
                      className="modak-fj-branch-stage"
                      style={{ left: BRANCH_ANCHOR.left, top: BRANCH_ANCHOR.top }}
                    >
                      <img src={fjTree} alt="" className="modak-fj-tree" aria-hidden="true" />
                      <img
                        src={fjBranch}
                        alt="Flowering branch"
                        className={`modak-fj-branch ${idleHintLevel >= 1 && !sceneState.branchDone ? 'hint' : ''}`}
                        style={{
                          transform: `rotate(${branchPull * 26}deg) translateY(${branchPull * 34}px)`
                        }}
                        onPointerDown={handleBranchPointerDown}
                        onPointerMove={handleBranchPointerMove}
                        onPointerUp={handleBranchPointerUp}
                        onPointerCancel={handleBranchPointerUp}
                        draggable={false}
                      />
                      {branchPull >= BRANCH_PULL_TRIGGER && !sceneState.branchDone && (
                        <span className="modak-fj-branch-hold-ring" aria-hidden="true" />
                      )}
                      {activeEmotion === 'sad' && !sceneState.branchDone && (
                        <img src={emotionImageFor('sad')} alt="" className="modak-fj-emotion modak-fj-emotion--bl" aria-hidden="true" />
                      )}
                    </div>
                  )}

                  {/* ============ BEAT 6: CARRY to Ganesha (guide) ============ */}
                  {sceneState.phase === PHASES.CARRY || sceneState.phase === PHASES.CARRY_REVEAL ||
                    sceneState.phase === PHASES.MODAK_PAUSE || sceneState.phase === PHASES.MODAK_REVEAL ? (
                    <div className="modak-game-belly-stage">
                      {sceneState.phase === PHASES.CARRY && (
                        <KidsDraggable
                          id="fj-carry"
                          data={{ type: 'fj-carry' }}
                          dragScale={1.04}
                          dragBorderRadius="50%"
                          style={{
                            position: 'absolute',
                            left: (sceneState.mooshikaPosition || CARRY_START_POSITION).left,
                            top: (sceneState.mooshikaPosition || CARRY_START_POSITION).top,
                            width: 'clamp(120px, 11vw, 175px)',
                            height: 'clamp(120px, 11vw, 175px)',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 8,
                            touchAction: 'none'
                          }}
                          onDragStart={handleCarryDragStart}
                          onDragEnd={handleCarryDragEnd}
                        >
                          <div className="modak-fj-carrier">
                            <img src={mooshikaCalm} alt="Mooshika" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
                            <img src={fjGarlandComplete} alt="" className="modak-fj-carry-garland" aria-hidden="true" />
                            <div className="modak-game-belly-feelings" aria-hidden="true">
                              {TRAVELLING_EMOTIONS.map((emotion) => (
                                <img
                                  key={emotion.id}
                                  src={emotion.image}
                                  alt=""
                                  className={`modak-game-belly-travelling-emotion modak-game-belly-travelling-emotion--${emotion.id}`}
                                />
                              ))}
                            </div>
                          </div>
                        </KidsDraggable>
                      )}

                      <div className="modak-game-belly-ganesha-area">
                        <img src={ganeshaFeeding} alt="Ganesha" className="modak-game-belly-ganesha" />

                        {sceneState.phase === PHASES.CARRY && (
                          <KidsDropZone
                            id="ganesha-destination"
                            accepts="fj-carry"
                            onDrop={() => completeCarry()}
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '64%',
                              width: '55%',
                              height: '65%',
                              transform: 'translate(-50%, -50%)',
                              borderRadius: '45%',
                              zIndex: 6
                            }}
                          >
                            <div className={`modak-game-belly-destination ${idleHintLevel === 1 ? 'hint' : ''} ${idleHintLevel === 2 ? 'hint-strong' : ''} ${idleHintLevel >= 3 ? 'hint-final' : ''}`} />
                          </KidsDropZone>
                        )}

                        {(sceneState.phase === PHASES.CARRY_REVEAL ||
                          sceneState.phase === PHASES.MODAK_PAUSE ||
                          sceneState.phase === PHASES.MODAK_REVEAL) && (
                          <>
                            <div className="modak-game-belly-completion-halo" aria-hidden="true" />
                            <img src={fjGarlandComplete} alt="" className="modak-fj-garland-on-ganesha" aria-hidden="true" />
                            <div className="modak-game-belly-arrived-feelings" aria-hidden="true">
                              {TRAVELLING_EMOTIONS.map((emotion) => (
                                <img
                                  key={`arrived-${emotion.id}`}
                                  src={emotion.image}
                                  alt=""
                                  className={`modak-game-belly-arrived-emotion modak-game-belly-arrived-emotion--${emotion.id}`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {showSparkle === 'modak-appear' && (
                          <div className="modak-fj-modak-pop" aria-hidden="true">
                            <img src={symbolModakColored} alt="" />
                            <SparkleAnimation type="magic" count={18} color="#ffd700" size={12} duration={1800} fadeOut area="full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* ============ GESTURE DEMOS ============ */}
                  <GestureDemo
                    type="hold"
                    from={{
                      x: parsePercentValue((sceneState.mooshikaPosition || CALM_DISTRACTIONS[0]).left, 30),
                      y: parsePercentValue((sceneState.mooshikaPosition || CALM_DISTRACTIONS[0]).top, 52)
                    }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.CALM_SEARCH && !sceneState.mushikaHolding}
                    idleDelay={120}
                    zIndex={24}
                  />
                  <GestureDemo
                    type="drag"
                    from={{ x: parsePercentValue(MUD_START_POSITION.left, 28), y: parsePercentValue(MUD_START_POSITION.top, 70) }}
                    to={{ x: parsePercentValue(MUD_END_POSITION.left, 70), y: parsePercentValue(MUD_END_POSITION.top, 63) }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.MUD_CROSS && !dragActive}
                    idleDelay={120}
                    zIndex={24}
                  />
                  <GestureDemo
                    type="swipe-left"
                    from={{ x: parsePercentValue(LEAVES_POSITION.left, 50), y: parsePercentValue(LEAVES_POSITION.top, 55) }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.LEAVES_OPEN && !sceneState.leavesOpen}
                    idleDelay={120}
                    zIndex={24}
                  />
                  <GestureDemo
                    type="pull-down"
                    from={{ x: parsePercentValue(BRANCH_ANCHOR.left, 70), y: parsePercentValue(BRANCH_ANCHOR.top, 38) }}
                    to={{ x: parsePercentValue(BRANCH_ANCHOR.left, 70), y: parsePercentValue(BRANCH_ANCHOR.top, 38) + 20 }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.BRANCH_PULL && !sceneState.branchDone}
                    idleDelay={120}
                    zIndex={24}
                  />
                  <GestureDemo
                    type="drag"
                    from={{ x: 50, y: 82 }}
                    to={{ x: 50, y: 55 }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.GARLAND_MAKING && !sceneState.garlandComplete}
                    idleDelay={120}
                    zIndex={2600}
                  />
                  <GestureDemo
                    type="drag"
                    from={{ x: parsePercentValue(CARRY_START_POSITION.left, 16), y: parsePercentValue(CARRY_START_POSITION.top, 72) }}
                    to={{ x: parsePercentValue(CARRY_END_POSITION.left, 74), y: parsePercentValue(CARRY_END_POSITION.top, 52) }}
                    active={showIdleGestureHint && sceneState.phase === PHASES.CARRY && !dragActive}
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

            {/* ============ BEAT 5: GARLAND OVERLAY (drag + snap) ============ */}
            {!isCompletionView && !isFinalTransitionView && sceneState.phase === PHASES.GARLAND_MAKING && (
              <div className="modak-garland-overlay">
                <div className="modak-garland-stage">
                  <img
                    src={sceneState.garlandComplete ? fjGarlandComplete : fjGarlandEmpty}
                    alt=""
                    className="modak-garland-thread"
                    aria-hidden="true"
                  />

                  {!sceneState.garlandComplete && GARLAND_SLOTS.map((slot, i) => (
                    <span
                      key={`gslot-${i}`}
                      className={`modak-garland-slot ${i < (sceneState.garlandFilled || 0) ? 'filled' : ''} ${garlandBounce === i ? 'bounce' : ''} ${i === (sceneState.garlandFilled || 0) && idleHintLevel >= 1 ? 'hint' : ''}`}
                      style={{ left: slot.left, top: slot.top }}
                    >
                      {i < (sceneState.garlandFilled || 0) && (
                        <img src={garlandFlowerImage(GARLAND_FLOWER_TYPES[i])} alt="" />
                      )}
                    </span>
                  ))}

                  {!sceneState.garlandComplete && (
                    <KidsDropZone
                      id="garland-thread-zone"
                      accepts="garland-flower"
                      onDrop={handleGarlandDrop}
                      style={{
                        position: 'absolute',
                        left: '10%',
                        top: '30%',
                        width: '80%',
                        height: '50%',
                        zIndex: 4
                      }}
                    >
                      <div className="modak-garland-thread-zone" />
                    </KidsDropZone>
                  )}

                  {sceneState.garlandComplete && (
                    <SparkleAnimation type="glitter" count={28} color="#ffd700" size={13} duration={2600} fadeOut area="full" />
                  )}
                </div>

                {!sceneState.garlandComplete && (
                  <div className="modak-garland-tray">
                    {GARLAND_FLOWER_TYPES.map((type, i) => {
                      if (i < (sceneState.garlandFilled || 0)) {
                        return <span key={`tray-${i}`} className="modak-garland-tray-slot empty" />;
                      }
                      return (
                        <KidsDraggable
                          key={`tray-${i}`}
                          id={`garland-flower-${i}`}
                          data={{ type: 'garland-flower', flowerIndex: i }}
                          dragScale={1.12}
                          dragBorderRadius="50%"
                          style={{ width: 'clamp(52px, 6vw, 84px)', height: 'clamp(52px, 6vw, 84px)', touchAction: 'none' }}
                        >
                          <img src={garlandFlowerImage(type)} alt="Flower" className="modak-garland-tray-flower" />
                        </KidsDraggable>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
