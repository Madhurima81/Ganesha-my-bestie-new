import PoseImage, { usePreloadPoses } from '../../../../../lib/components/animation/PoseImage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import usePausableTimers from '../../../../../lib/hooks/usePausableTimers';
import './SamaprabhaGame.css';

import bgImg from '../assets/images/Samaprabha/samaprabha-bg.webp';
import fawnWorriedImg from '../assets/images/Samaprabha/fawn-worried.webp';
import fawnHappyImg from '../assets/images/Samaprabha/fawn-happy.webp';
import fawnWalkImg from '../assets/images/Samaprabha/fawn-walk-new.png';
import branchImg from '../assets/images/Samaprabha/reveal-branch-new.png';
import reedsLeavesImg from '../assets/images/Samaprabha/reveal-reeds-leaves.png';
import stumpImg from '../assets/images/Samaprabha/reveal-stump.png';
import rocksGrassImg from '../assets/images/Samaprabha/reveal-rock-new.png';
import shadowBranchImg from '../assets/images/Samaprabha/shadow-branch.png';
import shadowReedImg from '../assets/images/Samaprabha/shadow-reed.png';
import shadowStumpImg from '../assets/images/Samaprabha/shadow-stump.png';
import shadowLeavesImg from '../assets/images/Samaprabha/shadow-leaves.png';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];
const AUDIO = { syllables: ['sa', 'ma', 'pra', 'bha'] };
const HOLD_MS = 1150;
const HOLD_DRAIN_MS = 260;

// Static metadata for each clue (id/label/art) -- positions live in
// SAMA_DEFAULT_LAYOUT below so they can be tuned via the Layout Debug panel.
const CLUE_META = [
  { id: 'branch', label: 'branch', img: branchImg, shadowImg: shadowBranchImg, shadowPieceKey: 'branch', hintW: 18, hintH: 20, revealVo: 'scene11_sama_reveal_branch' },
  { id: 'reeds-leaves', label: 'reeds and leaves', img: reedsLeavesImg, shadowImg: shadowReedImg, shadowPieceKey: 'reeds', hintW: 18, hintH: 24, revealVo: 'scene11_sama_reveal_reeds' },
  { id: 'stump', label: 'stump', img: stumpImg, shadowImg: shadowStumpImg, shadowPieceKey: 'stump', hintW: 19, hintH: 21, revealVo: 'scene11_sama_reveal_stump' },
  { id: 'rocks', label: 'rocks and grass', img: rocksGrassImg, shadowImg: shadowLeavesImg, shadowPieceKey: 'rocks', hintW: 21, hintH: 17, revealVo: 'scene11_sama_reveal_rocks' },
];

const SAMA_DEFAULT_LAYOUT = {
  fawnStart: { l: 20, t: 69, w: 11, flip: 1 },
  fawnWalk: { l: 12.952856684840002, t: 45.947287246765875, w: 11, flip: 1 },
  shadowPieces: {
    // rx/ry is the hold-target hit-zone the child actually shines the
    // light on — the shadow IS the interaction target now. hitOffsetX/Y
    // nudges the hit-zone center away from the shadow's own l/t, in case
    // the shadow art isn't visually centered in its bounding box.
    branch: { l: 56.162004692609926, t: 56.550715519831726, w: 31.5, rotate: -45, scaleX: 0.88, scaleY: 0.7, skewX: 30, rx: 25.60907851817997, ry: 25.60907851817997, hitOffsetX: 0, hitOffsetY: 0 },
    reeds: { l: 50.32827244248501, t: 56.82613975123355, w: 28, rotate: 0, scaleX: 0.96, scaleY: 1.02, skewX: 25, rx: 14, ry: 14.7, hitOffsetX: 0, hitOffsetY: 0 },
    stump: { l: 53.591204798498815, t: 66.87873500561425, w: 28, rotate: 0, scaleX: 1.22, scaleY: 1.48, skewX: 0, rx: 18.8, ry: 10, hitOffsetX: 0, hitOffsetY: 0 },
    rocks: { l: 54.975478593693225, t: 74.45261101973685, w: 28, rotate: 0, scaleX: 1.48, scaleY: 1, skewX: 0, rx: 14.5, ry: 11.9, hitOffsetX: 0, hitOffsetY: 0 },
  },
  // Bank display objects — purely visual placement, no interaction target.
  clues: [
    { cx: 70.49913628156796, cy: 34.79302595501487, w: 27.5, rotate: 18.5, scaleX: 1, scaleY: 1, skewX: 0 },
    { cx: 79.39804432003997, cy: 49.38996349751708, w: 28, rotate: 0, scaleX: 0.96, scaleY: 1.02, skewX: 0 },
    { cx: 76.92612049191497, cy: 52.28181290723052, w: 28, rotate: 0, scaleX: 1.22, scaleY: 1.48, skewX: 0 },
    { cx: 90.96662831860918, cy: 52.28181290723052, w: 28, rotate: 0, scaleX: 0.92, scaleY: 0.7, skewX: 0 },
  ],
};

const SHADOW_PIECE_KEYS = ['branch', 'reeds', 'stump', 'rocks'];

const SAMA_DEBUG_STORAGE_KEY = 'shloka_samaprabha_layout_debug_v1';

const DEBUG_PHASE_OPTIONS = [
  { value: 0, label: 'Start (worried)' },
  { value: 1, label: 'After Clue 1' },
  { value: 2, label: 'After Clue 2' },
  { value: 3, label: 'After Clue 3' },
  { value: 4, label: 'All Revealed (relieved)' },
  { value: 5, label: 'Walking' },
  { value: 6, label: 'Done' },
];

const SAMA_DEBUG_FIELD_RANGE = {
  rx: { min: 1, max: 30, step: 0.1 },
  ry: { min: 1, max: 30, step: 0.1 },
  w: { min: 10, max: 60, step: 0.5 },
  rotate: { min: -45, max: 45, step: 0.5 },
  flip: { min: -1, max: 1, step: 2 },
  scaleX: { min: 0.3, max: 2, step: 0.02 },
  scaleY: { min: 0.3, max: 2, step: 0.02 },
  skewX: { min: -30, max: 30, step: 0.5 },
  hitOffsetX: { min: -20, max: 20, step: 0.1 },
  hitOffsetY: { min: -20, max: 20, step: 0.1 },
};

const samaDebugOptions = [
  { type: 'object', key: 'fawnStart', label: 'Fawn Start', fields: ['l', 't', 'w', 'flip'] },
  { type: 'object', key: 'fawnWalk', label: 'Fawn Walk Target', fields: ['l', 't', 'w', 'flip'] },
  { type: 'shadowPiece', pieceKey: 'branch', key: 'shadowPiece-branch', label: 'Shadow: Branch', preview: 'shadow', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX', 'rx', 'ry', 'hitOffsetX', 'hitOffsetY'] },
  { type: 'shadowPiece', pieceKey: 'reeds', key: 'shadowPiece-reeds', label: 'Shadow: Reeds', preview: 'shadow', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX', 'rx', 'ry', 'hitOffsetX', 'hitOffsetY'] },
  { type: 'shadowPiece', pieceKey: 'stump', key: 'shadowPiece-stump', label: 'Shadow: Stump', preview: 'shadow', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX', 'rx', 'ry', 'hitOffsetX', 'hitOffsetY'] },
  { type: 'shadowPiece', pieceKey: 'rocks', key: 'shadowPiece-rocks', label: 'Shadow: Rock', preview: 'shadow', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX', 'rx', 'ry', 'hitOffsetX', 'hitOffsetY'] },
  { type: 'clue', index: 0, key: 'clue-0', label: 'Object: Branch', fields: ['cx', 'cy', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'clue', index: 1, key: 'clue-1', label: 'Object: Reeds/Leaves', fields: ['cx', 'cy', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'clue', index: 2, key: 'clue-2', label: 'Object: Stump', fields: ['cx', 'cy', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'clue', index: 3, key: 'clue-3', label: 'Object: Rocks', fields: ['cx', 'cy', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
];

const getDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('debug')
    || window.location.pathname.includes('/dev/game-test')
    || window.location.pathname.includes('game-test');
};

const cloneLayout = (layout) => JSON.parse(JSON.stringify(layout));
const createDefaultLayout = () => cloneLayout(SAMA_DEFAULT_LAYOUT);

const loadDebugLayout = () => {
  const fallback = createDefaultLayout();
  if (!getDebugEnabled()) return fallback;

  try {
    const saved = window.localStorage.getItem(SAMA_DEBUG_STORAGE_KEY);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      fawnStart: { ...fallback.fawnStart, ...parsed.fawnStart },
      fawnWalk: { ...fallback.fawnWalk, ...parsed.fawnWalk },
      shadowPieces: {
        branch: { ...fallback.shadowPieces.branch, ...parsed.shadowPieces?.branch },
        reeds: { ...fallback.shadowPieces.reeds, ...parsed.shadowPieces?.reeds },
        stump: { ...fallback.shadowPieces.stump, ...parsed.shadowPieces?.stump },
        rocks: { ...fallback.shadowPieces.rocks, ...parsed.shadowPieces?.rocks },
      },
      clues: fallback.clues.map((clue, index) => ({
        ...clue,
        ...(parsed.clues?.[index] || {}),
      })),
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Unable to load Samaprabha layout debug values:', error);
    }
    return fallback;
  }
};

const START_BEAM = { x: 31, y: 57 };

function pointInsideClue(point, clue) {
  if (!clue) return false;
  const dx = (point.x - clue.cx) / clue.rx;
  const dy = (point.y - clue.cy) / clue.ry;
  return dx * dx + dy * dy <= 1;
}

function Animal({ animalState, style }) {
  const src =
    animalState === 'walking'
      ? fawnWalkImg
      : animalState === 'worried' || animalState === 'curious'
        ? fawnWorriedImg
        : fawnHappyImg;

  return (
    <div className={`sama-animal is-${animalState}`} style={style} aria-hidden="true">
      <PoseImage src={src} alt="" draggable={false} />
    </div>
  );
}

function TruthLayer({ clue, isRevealed, isBeingSeen, isNew }) {
  return (
    <img
      className={[
        'sama-truth-layer',
        `sama-truth-${clue.id}`,
        isRevealed ? 'is-revealed' : '',
        isBeingSeen ? 'is-being-seen' : '',
        isNew ? 'is-new' : '',
      ].filter(Boolean).join(' ')}
      src={clue.img}
      alt=""
      draggable={false}
    />
  );
}

const POSE_ASSETS = [
  bgImg,
  fawnWorriedImg,
  fawnHappyImg,
  fawnWalkImg,
  branchImg,
  reedsLeavesImg,
  stumpImg,
  rocksGrassImg,
  shadowBranchImg,
  shadowReedImg,
  shadowStumpImg,
  shadowLeavesImg,
];

export default function SamaprabhaGame({
  isActive = false,
  introComplete = true,
  introVoStarted = true,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  onFirstInteraction = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice } = voiceGuidance;

  const debugEnabled = getDebugEnabled();
  const defaultLayout = useMemo(createDefaultLayout, []);
  const [debugLayout, setDebugLayout] = useState(loadDebugLayout);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState(samaDebugOptions[0].key);
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 16, y: 16 });

  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState('play');
  const [animalState, setAnimalState] = useState('worried');
  const [beamPos, setBeamPos] = useState(START_BEAM);
  const [isHoldingClue, setIsHoldingClue] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [revealPulse, setRevealPulse] = useState(null);
  const [clueVoComplete, setClueVoComplete] = useState(true);
  const stageRef = useRef(null);
  const debugItemDragRef = useRef(null); // { mode: 'move' | 'resize' }
  const pointerIdRef = useRef(null);
  const holdRafRef = useRef(null);
  const holdDrainRafRef = useRef(null);
  const holdStartedAtRef = useRef(null);
  const holdProgressRef = useRef(0);
  const holdingClueIndexRef = useRef(null);
  const litRef = useRef(0);
  const timersRef = useRef([]);
  const isPausedRef = useRef(isPaused);
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable, clear: clearPausable } = usePausableTimers(isPaused);
  const firstInteractionSentRef = useRef(false);
  const doneCalledRef = useRef(false);
  const doneAnnouncedRef = useRef(false);
  const lastSyllableDoneRef = useRef(false);
  const completionVoStartedRef = useRef(false);
  const completionFinishedRef = useRef(false);
  const sylEndFallbackRef = useRef(null);
  const voFallbackRef = useRef(null);
  const pendingRevealIndexRef = useRef(null);
  const lastHintVoKeyRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const onGameCompleteRef = useRef(onGameComplete);
  const onPhaseCompleteRef = useRef(onPhaseComplete);

  isPausedRef.current = isPaused;

  const activeLayout = debugEnabled ? debugLayout : defaultLayout;
  // The reveal / tap-target position for each clue is driven directly by its
  // own shadow piece's position (l/t), so the real object always fades in
  // exactly where its shadow was, and the light/hold interaction happens
  // right over the shadow itself. Only the hit-zone radius (rx/ry) is a
  // separate, independently tunable value.
  // Interaction target — the child shines the light ON THE SHADOW, so the
  // hold hit-zone is centered on the shadow's own position/size, not the
  // bank object's. The bank object (BANK_OBJECTS below) is purely visual.
  const CLUES = useMemo(
    () => CLUE_META.map((meta) => {
      const piece = activeLayout.shadowPieces[meta.shadowPieceKey];

      return {
        ...meta,
        cx: piece.l + (piece.hitOffsetX || 0),
        cy: piece.t + (piece.hitOffsetY || 0),
        rx: piece.rx,
        ry: piece.ry,
      };
    }),
    [activeLayout.shadowPieces]
  );

  // Bank display objects — fully independent position/size/transform, no
  // bearing on the interaction hit-test.
  const BANK_OBJECTS = useMemo(
    () => CLUE_META.map((meta, index) => {
      const obj = activeLayout.clues[index];

      return {
        ...meta,
        cx: obj.cx,
        cy: obj.cy,
        w: obj.w,
        rotate: obj.rotate,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        skewX: obj.skewX,
      };
    }),
    [activeLayout.clues]
  );

  const activeClue = phase === 'play' && lit < CLUE_META.length ? CLUES[lit] : null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    clearPausable();
  }, [clearPausable]);

  const safeAfter = pausableAfter;

  const hintStageKey = phase === 'play' ? `clue-${lit}` : phase;

  // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
  // clueVoComplete additionally gates the ladder on each clue's own reveal
  // VO ("That's a branch!" etc.) finishing, not just the game's intro VO.
  // A child correctly holding a shadow must never get an idle hint while
  // the progress ring is filling.
  const { hintLevel, markInteraction, markLevel2VoiceStarted, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && introComplete && clueVoComplete && !isHoldingClue,
    stageKey: hintStageKey,
    initialDelay: 10000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
  });

  // L2 VO — one mechanic now: press and hold on the shadow.
  useEffect(() => {
    if (!isActive || isPaused || phase !== 'play' || hintLevel !== 2) return;

    const voiceKey = 'scene11_sama_hint_hold';
    const onceKey = `${lit}-${voiceKey}`;
    if (lastHintVoKeyRef.current === onceKey) return;

    lastHintVoKeyRef.current = onceKey;
    stopVoice?.();
    if (playSceneLine) markLevel2VoiceStarted();
    playSceneLine?.(voiceKey, markLevel2VoiceEnded, { replayOnReturn: false });
  }, [hintLevel, isActive, isPaused, lit, phase, playSceneLine, stopVoice, markLevel2VoiceStarted, markLevel2VoiceEnded]);

  useEffect(() => {
    lastHintVoKeyRef.current = null;
  }, [lit]);

  const setHoldProgressValue = useCallback((value) => {
    holdProgressRef.current = value;
    setHoldProgress(value);
  }, []);

  const stopHoldDrain = useCallback(() => {
    if (holdDrainRafRef.current) {
      window.cancelAnimationFrame(holdDrainRafRef.current);
      holdDrainRafRef.current = null;
    }
  }, []);

  const drainHoldProgress = useCallback(() => {
    stopHoldDrain();

    const startProgress = holdProgressRef.current;
    if (startProgress <= 0) {
      setHoldProgressValue(0);
      return;
    }

    const startedAt = performance.now();
    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.max(startProgress * (1 - elapsed / HOLD_DRAIN_MS), 0);
      setHoldProgressValue(progress);

      if (progress > 0) {
        holdDrainRafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      holdDrainRafRef.current = null;
    };

    holdDrainRafRef.current = window.requestAnimationFrame(tick);
  }, [setHoldProgressValue, stopHoldDrain]);

  const cancelHold = useCallback((drain = false) => {
    const wasHolding = holdRafRef.current || holdingClueIndexRef.current !== null;

    if (holdRafRef.current) {
      window.cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }

    holdStartedAtRef.current = null;
    holdingClueIndexRef.current = null;
    setIsHoldingClue(false);
    if (drain && wasHolding) drainHoldProgress();
    else {
      stopHoldDrain();
      setHoldProgressValue(0);
    }
  }, [drainHoldProgress, setHoldProgressValue, stopHoldDrain]);

  const revealCurrentClue = useCallback(() => {
    if (phase !== 'play' || isPausedRef.current) return;

    const currentIndex = litRef.current;
    if (currentIndex >= CLUE_META.length) return;

    const next = currentIndex + 1;
    litRef.current = next;
    setLit(next);
    setRevealPulse(currentIndex);

    safeAfter(480, () => setRevealPulse(null));
    window.setTimeout(() => onMicroWin?.(), 0);
    markInteraction();

    if (currentIndex === 0) setAnimalState('curious');

    pendingRevealIndexRef.current = currentIndex;
    setClueVoComplete(false);

    if (next === CLUE_META.length && !doneCalledRef.current) {
      doneCalledRef.current = true;
      safeAfter(450, () => {
        setPhase('resolved');
        setAnimalState('relieved');
      });
      safeAfter(1250, () => setAnimalState('walking'));
      safeAfter(3000, () => setPhase('done'));
    }
  }, [markInteraction, onMicroWin, phase, safeAfter]);

  const startHoldAtPoint = useCallback((point, pointerId = null) => {
    if (phase !== 'play' || isPausedRef.current) {
      cancelHold();
      return;
    }

    const clueIndex = litRef.current;
    const clue = CLUES[clueIndex];

    if (!clue || !pointInsideClue(point, clue)) {
      cancelHold(true);
      return;
    }

    if (holdingClueIndexRef.current === clueIndex && holdRafRef.current) return;

    cancelHold();
    if (pointerId !== null) pointerIdRef.current = pointerId;
    holdingClueIndexRef.current = clueIndex;
    holdStartedAtRef.current = performance.now();
    setIsHoldingClue(true);
    setBeamPos(point);
    stopHoldDrain();
    setHoldProgressValue(0);
    markInteraction();

    const tick = (now) => {
      if (isPausedRef.current || holdingClueIndexRef.current !== litRef.current) {
        cancelHold();
        return;
      }

      const progress = Math.min((now - holdStartedAtRef.current) / HOLD_MS, 1);
      setHoldProgressValue(progress);

      if (progress >= 1) {
        holdRafRef.current = null;
        holdStartedAtRef.current = null;
        holdingClueIndexRef.current = null;
        setIsHoldingClue(false);
        setHoldProgressValue(0);
        revealCurrentClue();
        return;
      }

      holdRafRef.current = window.requestAnimationFrame(tick);
    };

    holdRafRef.current = window.requestAnimationFrame(tick);
  }, [CLUES, cancelHold, markInteraction, phase, revealCurrentClue, setHoldProgressValue, stopHoldDrain]);

  const getStagePoint = useCallback((event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return START_BEAM;

    return {
      x: Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handlePointerDown = useCallback((event) => {
    if (isPaused || phase !== 'play') return;
    // The Layout Debug panel adds its own move/resize handles directly on
    // the stage (not inside .sama-debug-panel), so relying on propagation
    // order between the two pointer systems is fragile — while the panel
    // is open, gameplay dragging (the light beam) is fully disabled instead.
    if (debugEnabled && showDebugPanel) return;
    if (event.target.closest?.('.sama-debug-panel')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = getStagePoint(event);
    stopVoice?.();
    setBeamPos(point);
    startHoldAtPoint(point, event.pointerId);

    if (!firstInteractionSentRef.current) {
      firstInteractionSentRef.current = true;
      onFirstInteraction?.();
    }
  }, [debugEnabled, showDebugPanel, getStagePoint, isPaused, onFirstInteraction, phase, startHoldAtPoint, stopVoice]);

  const handlePointerMove = useCallback((event) => {
    if (pointerIdRef.current !== event.pointerId || holdingClueIndexRef.current === null) return;

    event.preventDefault();
    const point = getStagePoint(event);
    setBeamPos(point);
    const clue = CLUES[litRef.current];
    if (!clue || !pointInsideClue(point, clue)) cancelHold(true);
  }, [CLUES, cancelHold, getStagePoint]);

  const endPointer = useCallback((event) => {
    if (event && pointerIdRef.current !== event.pointerId) return;

    if (event?.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    pointerIdRef.current = null;
    cancelHold(true);
  }, [cancelHold]);

  useEffect(() => {
    if (!debugEnabled) return;
    window.localStorage.setItem(SAMA_DEBUG_STORAGE_KEY, JSON.stringify(debugLayout));
  }, [debugEnabled, debugLayout]);

  useEffect(() => {
    if (!debugEnabled || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const panelWidth = Math.min(360, Math.max(260, rect.width - 24));
    const nextX = Math.max(12, rect.width - panelWidth - 16);
    setDebugPanelPosition((current) => (
      current.x === 16 && current.y === 16
        ? { x: nextX, y: 14 }
        : current
    ));
  }, [debugEnabled, isActive]);

  useEffect(() => {
    litRef.current = lit;
  }, [lit]);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
    onPhaseCompleteRef.current = onPhaseComplete;
  }, [onGameComplete, onPhaseComplete]);

  useEffect(() => {
    if (!isPaused) return;

    pointerIdRef.current = null;
    cancelHold();
  }, [cancelHold, isPaused]);

  useEffect(() => {
    if (isActive) return;

    clearTimers();
    cancelHold();
    setLit(0);
    litRef.current = 0;
    setPhase('play');
    setAnimalState('worried');
    setBeamPos(START_BEAM);
    setRevealPulse(null);
    pointerIdRef.current = null;
    firstInteractionSentRef.current = false;
    doneCalledRef.current = false;
    doneAnnouncedRef.current = false;
    lastSyllableDoneRef.current = false;
    completionVoStartedRef.current = false;
    completionFinishedRef.current = false;
    pendingRevealIndexRef.current = null;
    lastHintVoKeyRef.current = null;
  }, [cancelHold, clearTimers, isActive]);

  const playRevealForIndex = useCallback((index, afterReveal) => {
    if (pendingRevealIndexRef.current !== index) {
      afterReveal?.();
      return;
    }
    pendingRevealIndexRef.current = null;

    const revealVo = CLUE_META[index]?.revealVo;
    if (!revealVo || !playSceneLine) {
      setClueVoComplete(true);
      afterReveal?.();
      return;
    }

    let finished = false;
    const finishRevealVo = () => {
      if (finished) return;
      finished = true;
      setClueVoComplete(true);
      if (index === 0) {
        safeAfter(300, () => playSceneLine('scene11_sama_find_another', undefined, { replayOnReturn: false }));
      }
      afterReveal?.();
    };

    playSceneLine(revealVo, finishRevealVo, { replayOnReturn: false });
    safeAfter(4000, finishRevealVo);
  }, [playSceneLine, safeAfter]);

  const startCompletionVo = useCallback(() => {
    if (
      completionVoStartedRef.current ||
      !lastSyllableDoneRef.current ||
      !doneAnnouncedRef.current
    ) {
      return;
    }

    completionVoStartedRef.current = true;

    if (sylEndFallbackRef.current) {
      cancelPausable(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }

    const finish = () => {
      if (completionFinishedRef.current) return;

      completionFinishedRef.current = true;

      if (voFallbackRef.current) {
        cancelPausable(voFallbackRef.current);
        voFallbackRef.current = null;
      }

      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    };

    if (!playSceneLine) {
      pausableAfter(800, finish);
      return;
    }

    const afterWord = () => {
      playSceneLine('scene11_sama_done', finish, { stripLeadingText: 'Samaprabha' });
    };

    if (playWord) playWord('samaprabha', afterWord);
    else afterWord();

    // Pausable, so the sidebar can't let it complete the game behind the panel.
    voFallbackRef.current = pausableAfter(10000, finish);
  }, [cancelPausable, pausableAfter, playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'done' || doneAnnouncedRef.current) return;

    doneAnnouncedRef.current = true;
    sylEndFallbackRef.current = pausableAfter(1700, () => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    });

    startCompletionVo();
  }, [pausableAfter, phase, startCompletionVo]);

  useEffect(() => () => {
    clearTimers();
    cancelHold();

    if (sylEndFallbackRef.current) cancelPausable(sylEndFallbackRef.current);
    if (voFallbackRef.current) cancelPausable(voFallbackRef.current);
  }, [cancelHold, cancelPausable, clearTimers]);

  if (!isActive) return null;

  // Debug Phase selector previews the scene at a given phase without running
  // gameplay: clues revealed, fawn moved/re-posed, shadow/mystery understood.
  const debugPreview = debugEnabled && showDebugPanel;
  const effLit = debugPreview ? Math.min(debugPhase, CLUE_META.length) : lit;
  const effAnimalState = debugPreview
    ? (debugPhase === 0 ? 'worried' : debugPhase <= 3 ? 'curious' : debugPhase === 4 ? 'relieved' : 'walking')
    : animalState;
  const effUnderstood = debugPreview ? debugPhase >= 4 : phase !== 'play';
  const effShowDoneline = debugPreview ? debugPhase === 6 : phase === 'done';
  const fawnPos = effAnimalState === 'walking' ? activeLayout.fawnWalk : activeLayout.fawnStart;

  const getDebugValue = (field) => {
    const option = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];
    if (option.type === 'object') return activeLayout[option.key][field];
    if (option.type === 'clue') return activeLayout.clues[option.index][field];
    if (option.type === 'shadowPiece') return activeLayout.shadowPieces[option.pieceKey][field];
    return '';
  };

  const updateDebugValue = (field, rawValue) => {
    const value = Number(rawValue);
    if (Number.isNaN(value)) return;
    const option = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];

    setDebugLayout((current) => {
      const next = cloneLayout(current);
      if (option.type === 'object') next[option.key][field] = value;
      if (option.type === 'clue') next.clues[option.index][field] = value;
      if (option.type === 'shadowPiece') next.shadowPieces[option.pieceKey][field] = value;
      return next;
    });
  };

  const nudgeDebugField = (field, delta) => {
    const current = Number(getDebugValue(field)) || 0;
    updateDebugValue(field, current + delta);
  };

  // On-canvas drag for the selected debug element — dragging the sliders
  // one field at a time made repositioning slow, so this lets you grab the
  // element directly. One small handle moves it (l/t or cx/cy), a second
  // offset handle resizes it (w, or rx+ry together) by drag distance from
  // the position handle. Position-only fields (fawn start/walk, mystery
  // object) just get the move handle.
  const posFieldsFor = (option) => (
    option.fields.includes('cx') ? { x: 'cx', y: 'cy' } : { x: 'l', y: 't' }
  );
  const sizeFieldsFor = (option) => (
    option.fields.includes('rx') ? ['rx', 'ry'] : (option.fields.includes('w') ? ['w'] : [])
  );

  const startDebugItemDrag = (event, mode) => {
    event.preventDefault();
    event.stopPropagation();
    debugItemDragRef.current = { mode };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDebugItemDrag = (event) => {
    const drag = debugItemDragRef.current;
    if (!drag) return;
    event.preventDefault();
    event.stopPropagation();

    const option = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];
    const point = getStagePoint(event);
    const pos = posFieldsFor(option);

    if (drag.mode === 'move') {
      updateDebugValue(pos.x, point.x);
      updateDebugValue(pos.y, point.y);
      return;
    }

    // resize: size follows how far the pointer is from the element's own
    // position, in stage percent — drag outward to grow, inward to shrink.
    const cx = Number(getDebugValue(pos.x)) || 0;
    const cy = Number(getDebugValue(pos.y)) || 0;
    const dist = Math.max(1, Math.hypot(point.x - cx, point.y - cy));
    sizeFieldsFor(option).forEach((field) => updateDebugValue(field, dist));
  };

  const endDebugItemDrag = (event) => {
    if (!debugItemDragRef.current) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    debugItemDragRef.current = null;
  };

  const copyDebugLayout = () => {
    const payload = 'const SAMA_DEFAULT_LAYOUT = ' + JSON.stringify(activeLayout, null, 2) + ';';
    if (import.meta.env.DEV) {
      console.log('Samaprabha layout JSON:', payload);
    }
    window.prompt('Copy Samaprabha layout', payload);
  };

  const startDebugPanelDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    debugPanelDragRef.current = {
      offsetX: event.clientX - rect.left - debugPanelPosition.x,
      offsetY: event.clientY - rect.top - debugPanelPosition.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDebugPanelDrag = (event) => {
    const drag = debugPanelDragRef.current;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;

    event.preventDefault();
    event.stopPropagation();

    const panelWidth = Math.min(360, Math.max(260, rect.width - 24));
    const panelHeight = showDebugPanel ? Math.min(rect.height - 96, 560) : 44;
    const rawX = event.clientX - rect.left - drag.offsetX;
    const rawY = event.clientY - rect.top - drag.offsetY;
    const nextX = Math.max(8, Math.min(rect.width - panelWidth - 8, rawX));
    const nextY = Math.max(8, Math.min(rect.height - panelHeight - 8, rawY));

    setDebugPanelPosition({ x: nextX, y: nextY });
  };

  const endDebugPanelDrag = (event) => {
    if (!debugPanelDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    debugPanelDragRef.current = null;
  };

  const selectedDebugOption = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];

  return (
    <div className={`sama-game${hideElements ? ' is-hidden' : ''}${isPaused ? ' is-paused' : ''}`}>
      <div
        ref={stageRef}
        className={`sama-stage is-${phase}`}
        style={{ backgroundImage: `url(${bgImg})` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="sama-dusk-wash" />

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={effLit}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable, index) => {
            stopVoice?.();
            const isLast = index === SYLLABLES.length - 1;
            playSyllable?.(syllable, () => {
              if (isLast) {
                lastSyllableDoneRef.current = true;
                playRevealForIndex(index, startCompletionVo);
                return;
              }
              playRevealForIndex(index);
            });
          }}
        />

        <Animal
          animalState={effAnimalState}
          style={{
            left: `${fawnPos.l}%`,
            top: `${fawnPos.t}%`,
            width: `${fawnPos.w}vw`,
            scale: `${fawnPos.flip || 1} 1`,
          }}
        />

        <div className={`sama-shadow-group${effUnderstood ? ' is-understood' : ''}`} aria-hidden="true">
          {CLUE_META.map((clue, index) => {
            const piece = activeLayout.shadowPieces[clue.shadowPieceKey];
            return (
              <div
                key={clue.id}
                className={`sama-shadow-piece${index < effLit ? ' is-faded' : ''}`}
                style={{
                  left: `${piece.l}%`,
                  top: `${piece.t}%`,
                  width: `${piece.w}vw`,
                  transform: `translate(-50%, -50%) rotate(${piece.rotate}deg) scaleX(${piece.scaleX}) scaleY(${piece.scaleY}) skewX(${piece.skewX}deg)`,
                }}
              >
                <img src={clue.shadowImg} alt="" draggable={false} />
              </div>
            );
          })}
        </div>

        {phase === 'play' && CLUES.map((clue, index) => {
          if (index < lit) return null;
          return (
            <div
              key={`hold-target-${clue.id}`}
              className={[
                'sama-hold-target',
                index === lit ? 'is-current' : 'is-future',
              ].join(' ')}
              style={{
                left: `${clue.cx}%`,
                top: `${clue.cy}%`,
              }}
              aria-hidden="true"
            />
          );
        })}

        <div className="sama-mystery-group" aria-hidden="true">
          {BANK_OBJECTS.map((clue, index) => (
            <div
              key={clue.id}
              className="sama-mystery-piece"
              style={{
                // BANK position — fully independent of the shadow
                left: `${clue.cx}%`,
                top: `${clue.cy}%`,
                width: `${clue.w}vw`,
                transform: `translate(-50%, -50%) rotate(${clue.rotate}deg) scaleX(${clue.scaleX}) scaleY(${clue.scaleY}) skewX(${clue.skewX}deg)`,
              }}
            >
              <TruthLayer
                clue={clue}
                isRevealed={index < effLit}
                isBeingSeen={index === lit && isHoldingClue}
                isNew={revealPulse === index}
              />
            </div>
          ))}
        </div>

        {isHoldingClue && (
          <div
            className="sama-inspection-light is-holding"
            style={{ left: `${beamPos.x}%`, top: `${beamPos.y}%` }}
            aria-hidden="true"
          >
            <div className="sama-light-core" />
            <svg className="sama-hold-progress" viewBox="0 0 44 44">
              <circle className="sama-hold-track" cx="22" cy="22" r="18" />
              <circle
                className="sama-hold-fill"
                cx="22"
                cy="22"
                r="18"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - holdProgress * 100}
              />
            </svg>
          </div>
        )}

        {activeClue && phase === 'play' && lit === 0 && !firstInteractionSentRef.current && introVoStarted && !showDebugPanel && !isHoldingClue && (
          <GestureDemo
            key="sama-start-hold-demo"
            type="hold-progress-l3"
            from={{ x: activeClue.cx, y: activeClue.cy }}
            to={{ x: activeClue.cx, y: activeClue.cy }}
            active
            idleDelay={750}
            iterations={1}
            paused={isPaused}
            zIndex={46}
          />
        )}

        {activeClue && phase === 'play' && !showDebugPanel && !isHoldingClue && hintLevel === 2 && (
          <GestureDemo
            key={`sama-hold-partial-${lit}`}
            type="hold-progress-l2"
            from={{ x: activeClue.cx, y: activeClue.cy }}
            to={{ x: activeClue.cx, y: activeClue.cy }}
            active
            idleDelay={0}
            iterations={1}
            paused={isPaused}
            zIndex={46}
          />
        )}

        {activeClue && phase === 'play' && !showDebugPanel && !isHoldingClue && hintLevel >= 3 && (
          <GestureDemo
            key={`sama-hold-full-${lit}`}
            type="hold-progress-l3"
            from={{ x: activeClue.cx, y: activeClue.cy }}
            to={{ x: activeClue.cx, y: activeClue.cy }}
            active
            idleDelay={0}
            iterations={1}
            paused={isPaused}
            zIndex={46}
          />
        )}

        {debugEnabled && showDebugPanel && activeLayout.clues.map((clue, index) => {
          // Reference layer: every bank object placed so far, dimmed, so
          // positioning the next one doesn't lose sight of the ones
          // already done — only the selected one (rendered separately
          // below, full strength + handles) needs to stand out.
          if (selectedDebugKey === `clue-${index}`) return null;
          return (
            <img
              key={`clue-ref-${index}`}
              src={CLUE_META[index]?.img}
              alt=""
              className="sama-debug-clue-preview sama-debug-clue-preview--dim"
              style={{
                left: `${clue.cx}%`,
                top: `${clue.cy}%`,
                width: `${clue.w}vw`,
                transform: `translate(-50%, -50%) rotate(${clue.rotate}deg) scaleX(${clue.scaleX}) scaleY(${clue.scaleY}) skewX(${clue.skewX}deg)`,
              }}
              draggable={false}
            />
          );
        })}

        {debugEnabled && showDebugPanel && (() => {
          const option = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];
          const pos = posFieldsFor(option);
          const sizeFields = sizeFieldsFor(option);
          const cx = Number(getDebugValue(pos.x)) || 0;
          const cy = Number(getDebugValue(pos.y)) || 0;
          const handleDist = sizeFields.length ? (Number(getDebugValue(sizeFields[0])) || 8) : 0;

          // Bank object (type 'clue'): purely visual, own size/rotation.
          // Shadow (type 'shadowPiece'): also carries the rx/ry hit-zone —
          // the actual area the child shines the light on — shown as a
          // dashed ellipse alongside the shadow's own footprint.
          let outline = null;
          let clueImg = null;
          let hitZone = null;
          if (option.type === 'clue') {
            const w = Number(getDebugValue('w')) || 20;
            outline = {
              left: `${cx - w / 2}%`, top: `${cy - w / 2}%`,
              width: `${w}%`, height: `${w}%`,
              borderRadius: '10%',
            };
            clueImg = {
              src: CLUE_META[option.index]?.img,
              style: {
                left: `${cx}%`,
                top: `${cy}%`,
                width: `${w}vw`,
                transform: `translate(-50%, -50%) rotate(${Number(getDebugValue('rotate')) || 0}deg) scaleX(${Number(getDebugValue('scaleX')) || 1}) scaleY(${Number(getDebugValue('scaleY')) || 1}) skewX(${Number(getDebugValue('skewX')) || 0}deg)`,
              },
            };
          } else if (option.type === 'shadowPiece') {
            const w = Number(getDebugValue('w')) || 20;
            const meta = CLUE_META.find((clue) => clue.shadowPieceKey === option.pieceKey);
            const src = option.preview === 'shadow' ? meta?.shadowImg : meta?.img;
            outline = {
              left: `${cx - w / 2}%`, top: `${cy - w / 2}%`,
              width: `${w}%`, height: `${w}%`,
              borderRadius: '10%',
            };
            clueImg = {
              src,
              style: {
                left: `${cx}%`,
                top: `${cy}%`,
                width: `${w}vw`,
                transform: `translate(-50%, -50%) rotate(${Number(getDebugValue('rotate')) || 0}deg) scaleX(${Number(getDebugValue('scaleX')) || 1}) scaleY(${Number(getDebugValue('scaleY')) || 1}) skewX(${Number(getDebugValue('skewX')) || 0}deg)`,
              },
            };
            if (option.fields.includes('rx')) {
              const rx = Number(getDebugValue('rx')) || 8;
              const ry = Number(getDebugValue('ry')) || 8;
              const hx = cx + (Number(getDebugValue('hitOffsetX')) || 0);
              const hy = cy + (Number(getDebugValue('hitOffsetY')) || 0);
              hitZone = {
                left: `${hx - rx}%`, top: `${hy - ry}%`,
                width: `${rx * 2}%`, height: `${ry * 2}%`,
                borderRadius: '50%',
              };
            }
          } else if (option.fields.includes('w')) {
            const w = Number(getDebugValue('w')) || 20;
            outline = {
              left: `${cx - w / 2}%`, top: `${cy - w / 2}%`,
              width: `${w}%`, height: `${w}%`,
              borderRadius: '10%',
            };
          }

          return (
            <>
              {clueImg?.src && (
                <img
                  src={clueImg.src}
                  alt=""
                  className="sama-debug-clue-preview"
                  style={clueImg.style}
                  draggable={false}
                />
              )}
              {outline && <div className="sama-debug-outline" style={outline} />}
              {hitZone && <div className="sama-debug-outline sama-debug-hitzone" style={hitZone} />}
              <div
                className="sama-debug-move-handle"
                style={{ left: `${cx}%`, top: `${cy}%` }}
                onPointerDown={(e) => startDebugItemDrag(e, 'move')}
                onPointerMove={continueDebugItemDrag}
                onPointerUp={endDebugItemDrag}
                onPointerCancel={endDebugItemDrag}
                title="Drag to move"
              />
              {sizeFields.length > 0 && (
                <div
                  className="sama-debug-resize-handle"
                  style={{ left: `${cx + handleDist}%`, top: `${cy}%` }}
                  onPointerDown={(e) => startDebugItemDrag(e, 'resize')}
                  onPointerMove={continueDebugItemDrag}
                  onPointerUp={endDebugItemDrag}
                  onPointerCancel={endDebugItemDrag}
                  title="Drag to resize"
                />
              )}
            </>
          );
        })()}

        {debugEnabled && (
          <div
            className="sama-debug-panel"
            style={{
              position: 'absolute',
              left: `${debugPanelPosition.x}px`,
              top: `${debugPanelPosition.y}px`,
              right: 'auto',
              bottom: 'auto',
              maxHeight: showDebugPanel ? 'min(78vh, 620px)' : 'none',
              overflow: showDebugPanel ? 'auto' : 'visible',
            }}
          >
            <button
              type="button"
              className="sama-debug-toggle"
              style={{ position: 'static', right: 'auto', bottom: 'auto', width: '100%' }}
              onClick={() => setShowDebugPanel((prev) => !prev)}
            >
              {showDebugPanel ? 'Hide Layout Debug' : 'Layout Debug'}
            </button>

            {showDebugPanel && (
              <div className="sama-debug-body">
                <div
                  className="sama-debug-drag-handle"
                  onPointerDown={startDebugPanelDrag}
                  onPointerMove={continueDebugPanelDrag}
                  onPointerUp={endDebugPanelDrag}
                  onPointerCancel={endDebugPanelDrag}
                >
                  Drag layout panel
                </div>

                <div className="sama-debug-title">Samaprabha Placement</div>

                <label className="sama-debug-row">
                  <span>Phase</span>
                  <select value={debugPhase} onChange={(event) => setDebugPhase(Number(event.target.value))}>
                    {DEBUG_PHASE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span />
                </label>

                <label className="sama-debug-row">
                  <span>Element</span>
                  <select value={selectedDebugKey} onChange={(event) => setSelectedDebugKey(event.target.value)}>
                    {samaDebugOptions.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                  <span />
                </label>

                {selectedDebugOption.fields.map((field) => (
                  <label className="sama-debug-row" key={field}>
                    <span>{field}</span>
                    <input
                      type="range"
                      min={SAMA_DEBUG_FIELD_RANGE[field]?.min ?? 0}
                      max={SAMA_DEBUG_FIELD_RANGE[field]?.max ?? 100}
                      step={SAMA_DEBUG_FIELD_RANGE[field]?.step ?? 0.1}
                      value={getDebugValue(field)}
                      onChange={(event) => updateDebugValue(field, event.target.value)}
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={getDebugValue(field)}
                      onChange={(event) => updateDebugValue(field, event.target.value)}
                    />
                  </label>
                ))}

                {(selectedDebugOption.fields.includes('l') || selectedDebugOption.fields.includes('cx')) && (
                  <div className="sama-debug-grid">
                    <button type="button" onClick={() => nudgeDebugField(selectedDebugOption.fields.includes('cy') ? 'cy' : 't', -0.5)}>up</button>
                    <button type="button" onClick={() => nudgeDebugField(selectedDebugOption.fields.includes('cx') ? 'cx' : 'l', -0.5)}>left</button>
                    <button type="button" onClick={() => nudgeDebugField(selectedDebugOption.fields.includes('cx') ? 'cx' : 'l', 0.5)}>right</button>
                    <button type="button" onClick={() => nudgeDebugField(selectedDebugOption.fields.includes('cy') ? 'cy' : 't', 0.5)}>down</button>
                  </div>
                )}

                <div className="sama-debug-actions">
                  <button type="button" onClick={copyDebugLayout}>Copy Layout</button>
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.removeItem(SAMA_DEBUG_STORAGE_KEY);
                      setDebugLayout(createDefaultLayout());
                    }}
                  >
                    Reset
                  </button>
                </div>
                <pre>{JSON.stringify(activeLayout, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
