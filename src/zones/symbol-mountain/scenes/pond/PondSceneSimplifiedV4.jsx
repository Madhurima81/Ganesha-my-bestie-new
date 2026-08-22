// zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV6.jsx
// V6 GAMEPLAY UPDATE — "Find a Way, Rise Anyway" (locked spec):
//   Phase 1 (Trunk, first) — Blocked stream + rock obstacle. Child free-drags
//     the water around the rock (either side) to reach the muddy pond.
//     Reaching the pond lifts the dormant/drooped lotus upright (confirmation
//     that water arrived) — this does NOT bloom it.
//   Phase 2 (Lotus, second) — Press-and-hold the now-upright lotus bud;
//     it rises from the still-muddy pond and blooms.
//   Phase 3 — Final reveal (existing flow preserved)
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
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import trunkPondBg from './assets/images/trunk-pond-bg-new.webp';
import trunkRock from './assets/images/trunk-rock-new.webp';
import lotusDormant from './assets/images/trunk-lotus-dormant-new.webp';
import lotusUpright from './assets/images/trunk-lotus-upright-new.webp';
import lotusBloomedImg from './assets/images/trunk-lotus-bloomed-new.webp';
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
  INITIAL: 'initial',           // stream blocked by rock, lotus dormant, dragging enabled
  TRUNK_SOLVED: 'trunk_solved', // water reached the pond, lotus lifting upright
  TRUNK_REVEAL: 'trunk_reveal', // SymbolAutoReveal card for trunk showing
  LOTUS_ACTIVE: 'lotus_active', // lotus upright, press-and-hold enabled
  BLOOMED: 'bloomed',           // lotus bloomed, about to reveal lotus card
  COMPLETE: 'complete'
};

const VOICE_LINES = {
  // Entry
  opening: "The water can't get through... let's find it a way around.",

  // Trunk phase (blocked stream, drag around rock) — first
  trunkRound: "The rock is in the way. Guide the water around it, to the pond.",
  idleTrunk: 'Try curving the water around the rock...',
  waterPathPower: "You found a way around... Say it with me... I find my way.",

  // Lotus phase (press-and-hold to bloom) — second
  lotusRound: 'The lotus woke up... press and hold it gently... let it bloom.',
  idleLotus: 'Hold it gently... watch it rise.',
  lotusBloomPower: 'You stayed with it... nice and slow. Say it with me... I stay calm.',

  // Completion
  complete: 'You found a way, and something beautiful grew. All yours.'
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

// ==================== V6 GAMEPLAY CONFIG ====================
// Trunk phase: guided drag around a rock obstacle to the pond, stepping-stone
// style (same feel as the earlier pond water-drag) — the child commits to a
// side (top or bottom) on the first move, then snaps stone-by-stone to the
// pond. A hard rock collision still blocks cutting through the middle.
// Coordinates are % of the background container.
const SOURCE_POINT = { x: 8, y: 47 };
const POND_POINT = { x: 78, y: 58 };
const ROCK = { x: 40, y: 51, rx: 11, ry: 10 };
const TOP_ROUTE_STONES = [
  { id: 'top-1', x: 30, y: 34 },
  { id: 'top-2', x: 48, y: 30 },
  { id: 'top-3', x: 62, y: 40 },
];
const BOTTOM_ROUTE_STONES = [
  { id: 'bot-1', x: 30, y: 68 },
  { id: 'bot-2', x: 48, y: 72 },
  { id: 'bot-3', x: 62, y: 62 },
];
const ROUTE_SIDE_LOCK_DELTA = 8;   // % vertical offset from source before a side commits
const STONE_SNAP_RADIUS_PCT = 9;   // % distance to snap onto the next stone
const POND_SUCCESS_RADIUS = 13;    // % distance from POND_POINT counted as "reached"
const SOURCE_GRAB_RADIUS = 12;     // % distance from SOURCE_POINT to start dragging
const DRAG_FADE_MS = 300;          // fade-out duration when a failed drag resets
const TRAIL_MAX_DOTS = 16;         // how many droplet trail dots stay visible at once

// Lotus phase: press-and-hold to bloom. Same forgiving-release feel as before.
const LOTUS_HOLD_MS = 1800;
const HOLD_DECAY_MULTIPLIER = 2;
const HOLD_RESET_GRACE_MS = 1000;

const LOTUS_GLOW_MS = 900;           // glow burst duration as the lotus wakes up
const TRUNK_REVEAL_DELAY_MS = 1200;  // pause before the trunk SymbolAutoReveal card
const POND_OVERLAY_MID = null;
const POND_OVERLAY_FRONT = '';
// =============================================================

const discoveryConfig = {
  trunk: {
    foundTitle: "The Water Found a Way!",
    foundSubtitle: "Something magical appears...",
    powerName: "Divine Blessing",
    image: symbolTrunkColored
  },
  lotus: {
    foundTitle: "The Lotus Bloomed!",
    foundSubtitle: "Ganesha's lotus reveals its power...",
    powerName: "Sacred Purity",
    image: symbolLotusColored
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
          streamSolved: false,
          lotusUpright: false,
          lotusBloomed: false,
          phase: 'initial',
          currentFocus: 'trunk',
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
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);

  // Discovery overlay states

  // Resume popup states
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // eslint-disable-line no-unused-vars
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // eslint-disable-line no-unused-vars
  const [revealConfig, setRevealConfig] = useState(null);

  // ==================== V6 HOLD-TO-BLOOM STATE (single lotus) ====================
  // holdProgress: 0–1. Drives the glow ring + bud "stirring" animation.
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);       // active hold rAF id
  const holdReleaseRef = useRef(null);     // release decay rAF id
  const holdResetTimerRef = useRef(null);  // 1s grace timer

  // ==================== V6 DRAG-AROUND-ROCK STATE ====================
  // dragActive: finger currently guiding the water.
  // routeSide: null until the child commits up/down, then 'top' | 'bottom'.
  // currentStone: index of the last stone snapped onto (-1 = none yet).
  // dropPosition: current % position of the lead water drop.
  // dragTrail: recent points behind the lead drop, rendered as small fading
  // droplets so the water reads as flowing, not a single dot.
  const [dragActive, setDragActive] = useState(false);
  const [routeSide, setRouteSide] = useState(null);
  const [currentStone, setCurrentStone] = useState(-1);
  const [dropPosition, setDropPosition] = useState(null);
  const [dragTrail, setDragTrail] = useState([]);
  const [dragFading, setDragFading] = useState(false);
  const dragContainerRef = useRef(null);
  const dragActiveRef = useRef(false);
  const streamCompletedRef = useRef(false);
  const stoneAdvanceLockUntilRef = useRef(0);
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
    if (revealConfig || showSparkle === 'final-fireworks') return null;
    if (sceneState?.phase === PHASES.COMPLETE) return 'complete';
    if (sceneState?.phase === PHASES.LOTUS_ACTIVE || sceneState?.phase === PHASES.BLOOMED) return 'lotusRound';
    if (sceneState?.phase === PHASES.INITIAL || sceneState?.phase === PHASES.TRUNK_SOLVED) return 'trunkRound';
    return null;
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    revealConfig,
    showSparkle
  ]);
  const replayCurrentVoice = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) speakPondPrompt(replayKey);
  }, [getPromptKeyForPhase, speakPondPrompt]);
  function cancelActiveDrag() {
    setDragActive(false);
    if (streamCompletedRef.current) return;
    setDragFading(true);
    safeSetTimeout(() => {
      setRouteSide(null);
      setCurrentStone(-1);
      setDropPosition(null);
      setDragTrail([]);
      setDragFading(false);
      stoneAdvanceLockUntilRef.current = 0;
    }, DRAG_FADE_MS);
  }

  function onPauseHide() {
    stopSpokenVoice();
    cancelActiveDrag();
    // Lotus press-and-hold uses its own rAF loops (not covered by
    // cancelActiveDrag, which only tracks the rock-drag state) — a
    // pointercancel-equivalent pause (tab hidden mid-hold) must stop them too,
    // or the hold silently keeps progressing/animating in the background.
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdReleaseRef.current) {
      cancelAnimationFrame(holdReleaseRef.current);
      holdReleaseRef.current = null;
    }
    if (holdResetTimerRef.current) {
      clearTimeout(holdResetTimerRef.current);
      holdResetTimerRef.current = null;
    }
    setHoldProgress(0);
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
      PHASES.TRUNK_SOLVED,
      PHASES.LOTUS_ACTIVE
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

    let idleKey = 'idleTrunk';
    if (sceneState?.phase === PHASES.LOTUS_ACTIVE) idleKey = 'idleLotus';
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

    // 1. RESTORE TRUNK-DRAG PHASE (INITIAL / TRUNK_SOLVED before card shown)
    // Re-seed drag UI state so the water-drag is visible and interactive.
    if (sceneState.phase === PHASES.INITIAL) {
      streamCompletedRef.current = false;
      setRouteSide(null);
      setCurrentStone(-1);
      setDropPosition(null);
      setDragTrail([]);
      setDragFading(false);
      return;
    }

    // 2. TRUNK SOLVED BUT CARD NOT YET SHOWN (rare mid-transition reload)
    if (sceneState.phase === PHASES.TRUNK_SOLVED) {
      streamCompletedRef.current = true;
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

    // 3. RESTORE TRUNK CARD FLIP
    if (sceneState.phase === PHASES.TRUNK_REVEAL) {
      streamCompletedRef.current = true;
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

    // 4. RESTORE LOTUS PRESS-HOLD PHASE — nothing to seed, target just needs
    // to render (handled by JSX reading sceneState.phase directly).
    if (sceneState.phase === PHASES.LOTUS_ACTIVE) {
      streamCompletedRef.current = true;
      return;
    }

    // 5. LOTUS BLOOMED BUT CARD NOT YET SHOWN
    if (sceneState.phase === PHASES.BLOOMED && !sceneState.completed) {
      streamCompletedRef.current = true;
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
    // Defensive repair: if a stale save marks completed during lotus reveal phase,
    // clear it so reload resumes the card flow instead of treating scene as done.
    if (sceneState.phase === PHASES.BLOOMED && sceneState.completed) {
      sceneActions.updateState({
        completed: false,
        showingCompletionScreen: false,
        phase: PHASES.BLOOMED
      });
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I stay calm.',
          symbolImage: symbolLotusColored
        });
      }, 300);
      return;
    }

    // 6. RESTORE COMPLETION SCREEN
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
    getPromptKeyForPhase,
    resetIdleBaseline,
    speakPondPrompt
  ]);

  // Completion message intentionally disabled for Pond (remove orange popup).

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = { trunk: '🌸 Discover Lotus', lotus: '✨ End Scene' };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      lotus: 'The Sacred Lotus represents purity.\nIt blooms beautifully even in muddy water!',
      trunk: 'The Curved Trunk represents adaptability.\nGanesha uses it to remove obstacles!'
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
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

    if (symbolId === 'trunk') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.LOTUS_ACTIVE, currentFocus: 'lotus' });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, trunk: true }
        });
      }, 950);

    } else if (symbolId === 'lotus') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.COMPLETE, completed: false, showingCompletionScreen: false });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({ discoveredSymbols: { trunk: true, lotus: true } });
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

  // ==================== V6 PHASE 1 (TRUNK, FIRST) — DRAG AROUND THE ROCK ====================
  // Free-drag the water from the source, around either side of the rock
  // (hard collision — can't pass through it), to the muddy pond.
  // No fail state: bumping the rock just bounces the path back; drifting
  // too far off fades the path and resets.

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

  const addTrailDot = (pct) => {
    setDragTrail(prev => {
      const next = [...prev, { ...pct, key: Date.now() + Math.random() }];
      return next.length > TRAIL_MAX_DOTS ? next.slice(next.length - TRAIL_MAX_DOTS) : next;
    });
  };

  const handleStreamPointerDown = (e) => {
    if (!sceneState || streamCompletedRef.current) return;
    if (sceneState.phase !== PHASES.INITIAL) return;
    const pct = getPctFromEvent(e);
    if (!pct || pctDistance(pct, SOURCE_POINT) > SOURCE_GRAB_RADIUS) return;
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });
    rearmIdleHints();
    setDragActive(true);
    setDragFading(false);
    setRouteSide(null);
    setCurrentStone(-1);
    setDropPosition(SOURCE_POINT);
    setDragTrail([SOURCE_POINT]);
    stoneAdvanceLockUntilRef.current = 0;
    e.preventDefault?.();
  };

  const completeStreamDrag = () => {
    if (streamCompletedRef.current) return;
    streamCompletedRef.current = true;
    setDragActive(false);
    setDropPosition(POND_POINT);
    addTrailDot(POND_POINT);
    playChime();

    // Beat 1: lotus glows, then lifts from dormant → upright (confirmation only, no bloom).
    setShowSparkle('lotus-wake');
    safeSetTimeout(() => {
      sceneActions.updateState({ lotusUpright: true });
      playGlow();
      triggerMiniGesture('center', 2000, MINI_VICTORY_ICON);
    }, 250);
    safeSetTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({ phase: PHASES.TRUNK_SOLVED });
    }, LOTUS_GLOW_MS);

    // Beat 2: reveal the Trunk symbol card.
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.TRUNK_REVEAL });
      setRevealConfig({
        symbolId: 'trunk',
        symbolName: 'Trunk',
        affirmation: 'I find my way.',
        symbolImage: symbolTrunkColored
      });
    }, LOTUS_GLOW_MS + TRUNK_REVEAL_DELAY_MS);
  };

  const handleStreamPointerMove = (e) => {
    if (!dragActive || streamCompletedRef.current) return;
    const pct = getPctFromEvent(e);
    if (!pct) return;

    // Commit to a side once the finger has moved clearly up or down from the source.
    let side = routeSide;
    if (!side) {
      const dy = pct.y - SOURCE_POINT.y;
      if (Math.abs(dy) >= ROUTE_SIDE_LOCK_DELTA) {
        side = dy < 0 ? 'top' : 'bottom';
        setRouteSide(side);
      } else {
        setDropPosition(pct);
        addTrailDot(pct);
        return;
      }
    }

    const stones = side === 'top' ? TOP_ROUTE_STONES : BOTTOM_ROUTE_STONES;
    const nextIdx = currentStone + 1;
    const stepLockActive = Date.now() < stoneAdvanceLockUntilRef.current;

    if (nextIdx < stones.length) {
      const nextStone = stones[nextIdx];
      if (!stepLockActive && pctDistance(pct, nextStone) < STONE_SNAP_RADIUS_PCT) {
        setCurrentStone(nextIdx);
        setDropPosition(nextStone);
        addTrailDot(nextStone);
        playUiTap();
        stoneAdvanceLockUntilRef.current = Date.now() + 220;
        return;
      }
      setDropPosition(pct);
      addTrailDot(pct);
      return;
    }

    // All stones reached — final leg is a free approach into the pond.
    setDropPosition(pct);
    addTrailDot(pct);
    if (pctDistance(pct, POND_POINT) < POND_SUCCESS_RADIUS) {
      completeStreamDrag();
    }
  };

  const handleStreamPointerUp = () => {
    if (!dragActive) return;
    setDragActive(false);
    cancelActiveDrag();
  };
  // ==========================================================================================

  // ==================== V6 PHASE 2 (LOTUS, SECOND) — PRESS AND HOLD TO BLOOM ====================
  // Same forgiving-release feel as before, now driving a single lotus through
  // dormant → upright (already done by the Trunk phase) → bloomed.

  const completeLotusBloom = useCallback(() => {
    if (!sceneActions) return;
    playBloom();
    playChime();
    triggerMiniGesture('center', 2500, MINI_VICTORY_ICON);
    sceneActions.updateState({
      lotusBloomed: true,
      phase: PHASES.BLOOMED,
      progress: { percentage: 100, starsEarned: 5 }
    });
    setShowSparkle('lotus-bloom');
    safeSetTimeout(() => setShowSparkle(null), 2000);

    // Give the child a clear moment to see the lotus actually bloom before
    // the reveal card covers the scene.
    safeSetTimeout(() => setRevealConfig({
      symbolId: 'lotus',
      symbolName: 'Lotus',
      affirmation: 'I stay calm.',
      symbolImage: symbolLotusColored
    }), 2400);
  }, [sceneActions, playBloom, playChime, triggerMiniGesture, safeSetTimeout]);

  const handleLotusHoldStart = () => {
    rearmIdleHints();
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.LOTUS_ACTIVE) return;
    if (sceneState.lotusBloomed) return;

    if (holdReleaseRef.current) {
      cancelAnimationFrame(holdReleaseRef.current);
      holdReleaseRef.current = null;
    }
    if (holdResetTimerRef.current) {
      clearTimeout(holdResetTimerRef.current);
      holdResetTimerRef.current = null;
    }

    const startProgress = holdProgress; // resume from current value
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const added = elapsed / LOTUS_HOLD_MS;
      const next = Math.min(1, startProgress + added);
      setHoldProgress(next);

      if (next >= 1) {
        holdTimerRef.current = null;
        completeLotusBloom();
        setTimeout(() => setHoldProgress(0), 600);
        return;
      }
      holdTimerRef.current = requestAnimationFrame(tick);
    };

    holdTimerRef.current = requestAnimationFrame(tick);
  };

  const handleLotusHoldEnd = () => {
    if (!sceneState || sceneState.lotusBloomed) return;

    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const decayDurationMs = LOTUS_HOLD_MS / HOLD_DECAY_MULTIPLIER;
    const startProgress = holdProgress;
    if (startProgress <= 0) return;

    const startTime = performance.now();
    const decayTick = (now) => {
      const elapsed = now - startTime;
      const shrinkRatio = elapsed / decayDurationMs;
      const next = Math.max(0, startProgress - shrinkRatio);
      setHoldProgress(next);

      if (next <= 0) {
        holdReleaseRef.current = null;
        return;
      }
      holdReleaseRef.current = requestAnimationFrame(decayTick);
    };
    holdReleaseRef.current = requestAnimationFrame(decayTick);

    holdResetTimerRef.current = setTimeout(() => {
      if (holdReleaseRef.current) {
        cancelAnimationFrame(holdReleaseRef.current);
        holdReleaseRef.current = null;
      }
      setHoldProgress(0);
      holdResetTimerRef.current = null;
    }, HOLD_RESET_GRACE_MS);
  };

  // Cleanup hold/drag timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) cancelAnimationFrame(holdTimerRef.current);
      if (holdReleaseRef.current) cancelAnimationFrame(holdReleaseRef.current);
      if (holdResetTimerRef.current) clearTimeout(holdResetTimerRef.current);
    };
  }, []);
  // ===============================================================================================

  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.COMPLETE, PHASES.BLOOMED];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'trunk-hint',
      message: 'Guide the water around the rock 💧',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => sceneState?.phase === PHASES.INITIAL
    },
    {
      id: 'lotus-hint',
      message: 'Press and hold the lotus 🌸',
      position: { bottom: '60%', right: '20%', transform: 'translateX(50%)' },
      condition: (sceneState) => sceneState?.phase === PHASES.LOTUS_ACTIVE && !sceneState?.lotusBloomed
    }
  ];

  const getLotusImage = () => {
    if (sceneState?.lotusBloomed) return lotusBloomedImg;
    if (sceneState?.lotusUpright) return lotusUpright;
    return lotusDormant;
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
              style={{ backgroundImage: `url(${trunkPondBg})` }}
              onPointerDown={sceneState.phase === PHASES.INITIAL ? handleStreamPointerDown : undefined}
              onPointerMove={dragActive ? handleStreamPointerMove : undefined}
              onPointerUp={dragActive ? handleStreamPointerUp : undefined}
              onPointerCancel={dragActive ? handleStreamPointerUp : undefined}
              onPointerLeave={dragActive ? handleStreamPointerUp : undefined}
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

              {/* Rock — static obstacle, always rendered while the pond is visible */}
              <img
                src={trunkRock}
                alt=""
                aria-hidden="true"
                className="pond-trunk-rock"
                draggable={false}
              />

              {/* V6 PHASE 1 (TRUNK, FIRST) — guided drag around the rock, stepping-stone style */}
              {sceneState.phase === PHASES.INITIAL && (
                <>
                  <GestureDemo
                    type="drag"
                    from={{ x: SOURCE_POINT.x, y: SOURCE_POINT.y }}
                    to={{ x: TOP_ROUTE_STONES[0].x, y: TOP_ROUTE_STONES[0].y }}
                    active={!dragActive && currentStone === -1 && !dropPosition}
                    idleDelay={1800}
                    zIndex={28}
                  />

                  {/* Water source handle — hides once dragging starts, the lead drop takes over */}
                  {!dropPosition && (
                    <div
                      role="button"
                      aria-label="Drag the water around the rock, to the pond"
                      className={`pond-water-source ${hintClassName}`}
                      style={{ left: `${SOURCE_POINT.x}%`, top: `${SOURCE_POINT.y}%` }}
                    >
                      💧
                    </div>
                  )}

                  {/* Stepping stones for the committed side only */}
                  {routeSide && (routeSide === 'top' ? TOP_ROUTE_STONES : BOTTOM_ROUTE_STONES).map((stone, idx) => {
                    const reached = idx <= currentStone;
                    const isNext = idx === currentStone + 1;
                    return (
                      <div
                        key={stone.id}
                        aria-hidden="true"
                        className="pond-route-stone"
                        style={{
                          left: `${stone.x}%`,
                          top: `${stone.y}%`,
                          background: reached
                            ? 'radial-gradient(circle, #AEE8FF 0%, #5BB3E8 100%)'
                            : 'radial-gradient(circle, rgba(174,232,255,0.55) 0%, rgba(91,179,232,0.35) 100%)',
                          boxShadow: reached
                            ? '0 0 16px rgba(91, 179, 232, 0.85)'
                            : '0 0 8px rgba(91, 179, 232, 0.45)',
                          animation: reached ? 'none' : isNext ? 'pondPetalPulse 1.2s ease-in-out infinite' : 'pondPetalPulse 2.4s ease-in-out infinite',
                          opacity: reached ? 1 : isNext ? 1 : 0.5,
                        }}
                      />
                    );
                  })}

                  {/* Flowing droplet trail — many small dots so the water reads as moving, not one dot */}
                  {dragTrail.map((p, idx) => (
                    <div
                      key={p.key}
                      aria-hidden="true"
                      className="pond-trail-dot"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: dragFading ? 0 : 0.25 + (idx / dragTrail.length) * 0.6,
                        width: `${6 + (idx / dragTrail.length) * 6}px`,
                        height: `${6 + (idx / dragTrail.length) * 6}px`,
                      }}
                    />
                  ))}

                  {/* Lead water drop — follows the finger/stone snaps */}
                  {dropPosition && (
                    <div
                      aria-hidden="true"
                      className="pond-lead-drop"
                      style={{
                        left: `${dropPosition.x}%`,
                        top: `${dropPosition.y}%`,
                        opacity: dragFading ? 0 : 1,
                      }}
                    >
                      💧
                    </div>
                  )}
                </>
              )}

              {/* Lotus — dormant → upright (Trunk success) → bloomed (Lotus success) */}
              <div
                className={`pond-trunk-lotus ${sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed ? hintClassName : ''}`}
              >
                {showSparkle === 'lotus-wake' && (
                  <div className="pond-lotus-wake-glow" aria-hidden="true">
                    <SparkleAnimation type="magic" count={18} color="#FFD86B" size={10} duration={LOTUS_GLOW_MS} fadeOut={true} area="full" />
                  </div>
                )}
                {sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed && holdProgress > 0 && (
                  <svg viewBox="0 0 100 100" className="pond-hold-ring" aria-hidden="true">
                    <circle
                      cx="50" cy="50" r="46" fill="none" stroke="#FFD86B" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
                      transform="rotate(-90 50 50)"
                      style={{
                        filter: `drop-shadow(0 0 ${4 + holdProgress * 8}px rgba(255, 216, 107, ${0.5 + holdProgress * 0.4}))`,
                        transition: 'filter 0.1s linear',
                      }}
                    />
                  </svg>
                )}
                <div
                  role="button"
                  aria-label="Press and hold the lotus to let it bloom"
                  onPointerDown={(e) => {
                    e.preventDefault?.();
                    handleLotusHoldStart();
                  }}
                  onPointerUp={handleLotusHoldEnd}
                  onPointerLeave={handleLotusHoldEnd}
                  onPointerCancel={handleLotusHoldEnd}
                  className="pond-lotus-hold-target"
                  style={{ cursor: sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed ? 'pointer' : 'default' }}
                >
                  <img
                    src={getLotusImage()}
                    alt="Lotus"
                    className={`pond-lotus-image ${sceneState.lotusBloomed && showSparkle === 'lotus-bloom' ? 'pond-lotus-bloom-pop' : ''}`}
                    style={{
                      transform: sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed && holdProgress > 0
                        ? `scale(${1 + holdProgress * 0.06})`
                        : undefined,
                    }}
                    draggable={false}
                  />
                </div>
                {showSparkle === 'lotus-bloom' && (
                  <SparkleAnimation type="star" count={15} color="#ff9ebd" size={10} duration={2000} fadeOut={true} area="full" />
                )}
              </div>

              {/* Ganesha reflection in pond water — appears once the lotus blooms */}
              {sceneState.lotusBloomed && (
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
                }}
                justEarnedPetals={[
                  { ring: 'middle', id: 4 },
                  { ring: 'middle', id: 5 },
                ]}
                earnedSymbols={[
                  { id: 'lotus', petalId: 4, ring: 'middle', image: symbolLotusColored },
                  { id: 'trunk', petalId: 5, ring: 'middle', image: symbolTrunkColored },
                ]}
                autoCloseMs={3000 + (2 * 950) + 2600}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  setShowSceneCompletion(true);
                  // Persist so the sticky-completion effect and reload restore work.
                  sceneActions.updateState({ showingCompletionScreen: true });
                }}
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
                enableTapHintPrompt={!sceneState?.discoveredSymbols?.trunk}
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
                discoveredSymbols={['trunk', 'lotus']}
                symbolImages={{
                  trunk: symbolTrunkColored,
                  lotus: symbolLotusColored
                }}
                symbolData={{
                  trunk: {
                    title: "Trunk — Ganesha's Super Tool!",
                    description: "Ganesha's trunk can pick up tiny flowers or move giant rocks! It shows us that being gentle AND strong is a superpower."
                  },
                  lotus: {
                    title: "Lotus — Ganesha's Pure Flower!",
                    description: "The lotus grows in muddy water but blooms beautifully clean. It reminds us to stay pure and bright no matter what!"
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
                  if (import.meta.env.DEV) console.log(`Sidebar symbol clicked: ${symbolId}`);
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



