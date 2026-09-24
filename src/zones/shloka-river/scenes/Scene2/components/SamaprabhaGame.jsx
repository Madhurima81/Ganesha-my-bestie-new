import PoseImage, { usePreloadPoses } from '../../../../../lib/components/animation/PoseImage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import './SamaprabhaGame.css';

import bgImg from '../assets/images/Samaprabha/samaprabha-bg.webp';
import fawnWorriedImg from '../assets/images/Samaprabha/fawn-worried.webp';
import fawnHappyImg from '../assets/images/Samaprabha/fawn-happy.webp';
import fawnWalkImg from '../assets/images/Samaprabha/fawn-walk.webp';
import branchImg from '../assets/images/Samaprabha/reveal-branch.png';
import reedsLeavesImg from '../assets/images/Samaprabha/reveal-reeds-leaves.png';
import stumpImg from '../assets/images/Samaprabha/reveal-stump.png';
import rocksGrassImg from '../assets/images/Samaprabha/reveal-rocks-grass.png';
import shadowBranchImg from '../assets/images/Samaprabha/shadow-branch.png';
import shadowReedImg from '../assets/images/Samaprabha/shadow-reed.png';
import shadowStumpImg from '../assets/images/Samaprabha/shadow-stump.png';
import shadowLeavesImg from '../assets/images/Samaprabha/shadow-leaves.png';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];
const AUDIO = { syllables: ['sa', 'ma', 'pra', 'bha'] };
const HOLD_MS = 1150;

// Static metadata for each clue (id/label/art) -- positions live in
// SAMA_DEFAULT_LAYOUT below so they can be tuned via the Layout Debug panel.
const CLUE_META = [
  { id: 'branch', label: 'branch', img: branchImg, shadowImg: shadowBranchImg, shadowPieceKey: 'branch', hintW: 18, hintH: 20, revealVo: 'scene11_sama_reveal_branch' },
  { id: 'reeds-leaves', label: 'reeds and leaves', img: reedsLeavesImg, shadowImg: shadowReedImg, shadowPieceKey: 'reeds', hintW: 18, hintH: 24, revealVo: 'scene11_sama_reveal_reeds' },
  { id: 'stump', label: 'stump', img: stumpImg, shadowImg: shadowStumpImg, shadowPieceKey: 'stump', hintW: 19, hintH: 21, revealVo: 'scene11_sama_reveal_stump' },
  { id: 'rocks', label: 'rocks and grass', img: rocksGrassImg, shadowImg: shadowLeavesImg, shadowPieceKey: 'rocks', hintW: 21, hintH: 17, revealVo: 'scene11_sama_reveal_rocks' },
];

const SAMA_DEFAULT_LAYOUT = {
  fawnStart: { l: 20, t: 69 },
  fawnWalk: { l: 12.952856684840002, t: 45.947287246765875 },
  shadowPieces: {
    branch: { l: 55.86536762326263, t: 52.9703364198507, w: 27.5, rotate: -42, scaleX: 0.88, scaleY: 1, skewX: 30 },
    reeds: { l: 50.130515874818315, t: 53.796584403466596, w: 28, rotate: 0, scaleX: 0.96, scaleY: 1.02, skewX: 25 },
    stump: { l: 55.964248124943225, t: 63.71147989744117, w: 28, rotate: 0, scaleX: 1.22, scaleY: 1.48, skewX: 0 },
    rocks: { l: 57.05189372217932, t: 70.18370840713563, w: 28, rotate: 0, scaleX: 1, scaleY: 1, skewX: 0 },
  },
  clues: [
    { cx: 73.06992286859557, cy: 40.989836410954894, rx: 27, ry: 9 },
    { cx: 79.39804432003997, cy: 49.38996349751708, rx: 14, ry: 14.7 },
    { cx: 81.17782237917878, cy: 46.911238079611586, rx: 18.8, ry: 10 },
    { cx: 86.81379806163699, cy: 43.74397679379112, rx: 14.5, ry: 11.9 },
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
  scaleX: { min: 0.3, max: 2, step: 0.02 },
  scaleY: { min: 0.3, max: 2, step: 0.02 },
  skewX: { min: -30, max: 30, step: 0.5 },
};

const samaDebugOptions = [
  { type: 'object', key: 'fawnStart', label: 'Fawn Start', fields: ['l', 't'] },
  { type: 'object', key: 'fawnWalk', label: 'Fawn Walk Target', fields: ['l', 't'] },
  { type: 'shadowPiece', pieceKey: 'branch', key: 'shadowPiece-branch', label: 'Shadow: Branch', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'shadowPiece', pieceKey: 'reeds', key: 'shadowPiece-reeds', label: 'Shadow: Reeds/Leaves', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'shadowPiece', pieceKey: 'stump', key: 'shadowPiece-stump', label: 'Shadow: Stump', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'shadowPiece', pieceKey: 'rocks', key: 'shadowPiece-rocks', label: 'Shadow: Rocks/Grass', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'clue', index: 0, key: 'clue-0', label: 'Clue: Branch (hit radius)', fields: ['rx', 'ry'] },
  { type: 'clue', index: 1, key: 'clue-1', label: 'Clue: Reeds/Leaves (hit radius)', fields: ['rx', 'ry'] },
  { type: 'clue', index: 2, key: 'clue-2', label: 'Clue: Stump (hit radius)', fields: ['rx', 'ry'] },
  { type: 'clue', index: 3, key: 'clue-3', label: 'Clue: Rocks (hit radius)', fields: ['rx', 'ry'] },
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
  const [showDebugPanel, setShowDebugPanel] = useState(debugEnabled);
  const [selectedDebugKey, setSelectedDebugKey] = useState(samaDebugOptions[0].key);
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 16, y: 16 });

  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState('play');
  const [animalState, setAnimalState] = useState('worried');
  const [beamPos, setBeamPos] = useState(START_BEAM);
  const [isDraggingLight, setIsDraggingLight] = useState(false);
  const [isHoldingClue, setIsHoldingClue] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealPulse, setRevealPulse] = useState(null);
  const [clueVoComplete, setClueVoComplete] = useState(true);
  // The mechanic is two different skills — find the shadow, then hold the
  // light there. Each needs its own hints: 'find' points at direction/where,
  // 'hold' says "stay" instead of "go somewhere else."
  const [hintMode, setHintMode] = useState('find');

  const stageRef = useRef(null);
  const debugItemDragRef = useRef(null); // { mode: 'move' | 'resize' }
  const pointerIdRef = useRef(null);
  const holdRafRef = useRef(null);
  const holdStartedAtRef = useRef(null);
  const holdingClueIndexRef = useRef(null);
  const litRef = useRef(0);
  const timersRef = useRef([]);
  const isPausedRef = useRef(isPaused);
  const firstInteractionSentRef = useRef(false);
  const doneCalledRef = useRef(false);
  const doneAnnouncedRef = useRef(false);
  const lastSyllableDoneRef = useRef(false);
  const completionVoStartedRef = useRef(false);
  const completionFinishedRef = useRef(false);
  const sylEndFallbackRef = useRef(null);
  const voFallbackRef = useRef(null);
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
  const CLUES = useMemo(
    () => CLUE_META.map((meta, index) => {
      const piece = activeLayout.shadowPieces[meta.shadowPieceKey];
      const radius = activeLayout.clues[index];
      return {
        ...meta,
        cx: piece.l,
        cy: piece.t,
        rx: radius.rx,
        ry: radius.ry,
      };
    }),
    [activeLayout.shadowPieces, activeLayout.clues]
  );

  const activeClue = phase === 'play' && lit < CLUE_META.length ? CLUES[lit] : null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const safeAfter = useCallback((ms, fn) => {
    const runWhenReady = () => {
      if (isPausedRef.current) {
        const retry = window.setTimeout(runWhenReady, 150);
        timersRef.current.push(retry);
        return;
      }
      fn();
    };

    const id = window.setTimeout(runWhenReady, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // The hint key includes hintMode so "find the shadow" and "hold the light
  // there" are treated as separate problems — each gets its own fresh timer.
  const hintStageKey = phase === 'play' ? `clue-${lit}-${hintMode}` : phase;

  // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
  // clueVoComplete additionally gates the ladder on each clue's own reveal
  // VO ("That's a branch!" etc.) finishing, not just the game's intro VO.
  // A child correctly holding the light must never get an idle hint while
  // the progress ring is filling — isHoldingClue/isDraggingLight excluded.
  const { hintLevel, markInteraction, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && introComplete && clueVoComplete && !isDraggingLight && !isHoldingClue,
    stageKey: hintStageKey,
    initialDelay: 10000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
  });

  // L2 VO — the only hint VO needed. "Move the light over the shadow" while
  // still searching, "Keep the light there" once they've found it and just
  // need to hold. No L3 VO — the child has already heard what to do; L3 just
  // shows the fuller visual.
  useEffect(() => {
    if (!isActive || isPaused || phase !== 'play' || hintLevel !== 2) return;

    const voiceKey = hintMode === 'find' ? 'scene11_sama_hint_move' : 'scene11_sama_hint_hold';
    const onceKey = `${lit}-${hintMode}-${voiceKey}`;
    if (lastHintVoKeyRef.current === onceKey) return;

    lastHintVoKeyRef.current = onceKey;
    stopVoice?.();
    playSceneLine?.(voiceKey, markLevel2VoiceEnded, { replayOnReturn: false });
  }, [hintLevel, hintMode, isActive, isPaused, lit, phase, playSceneLine, stopVoice, markLevel2VoiceEnded]);

  useEffect(() => {
    lastHintVoKeyRef.current = null;
  }, [lit, hintMode]);

  const cancelHold = useCallback(() => {
    if (holdRafRef.current) {
      window.cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }

    holdStartedAtRef.current = null;
    holdingClueIndexRef.current = null;
    setIsHoldingClue(false);
    setHoldProgress(0);
  }, []);

  const revealCurrentClue = useCallback(() => {
    if (phase !== 'play' || isPausedRef.current) return;

    const currentIndex = litRef.current;
    if (currentIndex >= CLUE_META.length) return;

    const next = currentIndex + 1;
    litRef.current = next;
    setLit(next);
    setRevealPulse(currentIndex);
    // Fresh clue starts back in FIND mode — the object just revealed doesn't
    // carry forward into the next shadow's hints.
    setHintMode('find');

    safeAfter(480, () => setRevealPulse(null));
    window.setTimeout(() => onMicroWin?.(), 0);
    markInteraction();

    if (currentIndex === 0) setAnimalState('curious');

    const revealVo = CLUE_META[currentIndex]?.revealVo;
    if (revealVo && playSceneLine) {
      setClueVoComplete(false);
      safeAfter(250, () => {
        stopVoice?.();
        let finished = false;
        const finishRevealVo = () => {
          if (finished) return;
          finished = true;
          setClueVoComplete(true);
        };
        playSceneLine(revealVo, finishRevealVo, { replayOnReturn: false });
        // iOS Safari can silently drop the onend/onerror callback — don't
        // let a lost callback block the hint ladder indefinitely.
        safeAfter(4000, finishRevealVo);
      });
    } else {
      setClueVoComplete(true);
    }

    if (next === CLUE_META.length && !doneCalledRef.current) {
      doneCalledRef.current = true;
      safeAfter(450, () => {
        setPhase('resolved');
        setAnimalState('relieved');
      });
      safeAfter(1250, () => setAnimalState('walking'));
      safeAfter(3000, () => setPhase('done'));
    }
  }, [markInteraction, onMicroWin, phase, playSceneLine, safeAfter, stopVoice]);

  const startHoldAtPoint = useCallback((point) => {
    if (phase !== 'play' || isPausedRef.current) {
      cancelHold();
      return;
    }

    const clueIndex = litRef.current;
    const clue = CLUES[clueIndex];

    if (!clue || !pointInsideClue(point, clue)) {
      cancelHold();
      return;
    }

    if (holdingClueIndexRef.current === clueIndex && holdRafRef.current) return;

    cancelHold();
    // First time the child reaches the right shadow, "where does the light
    // go?" is solved — hints from here should help with "what do I do now
    // that I'm here?" instead.
    setHintMode('hold');
    holdingClueIndexRef.current = clueIndex;
    holdStartedAtRef.current = performance.now();
    setIsHoldingClue(true);
    setHoldProgress(0);
    markInteraction();

    const tick = (now) => {
      if (isPausedRef.current || holdingClueIndexRef.current !== litRef.current) {
        cancelHold();
        return;
      }

      const progress = Math.min((now - holdStartedAtRef.current) / HOLD_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        holdRafRef.current = null;
        holdStartedAtRef.current = null;
        holdingClueIndexRef.current = null;
        setIsHoldingClue(false);
        setHoldProgress(0);
        revealCurrentClue();
        return;
      }

      holdRafRef.current = window.requestAnimationFrame(tick);
    };

    holdRafRef.current = window.requestAnimationFrame(tick);
  }, [CLUES, cancelHold, markInteraction, phase, revealCurrentClue]);

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
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDraggingLight(true);

    const point = getStagePoint(event);
    setBeamPos(point);

    if (!firstInteractionSentRef.current) {
      firstInteractionSentRef.current = true;
      setHasInteracted(true);
      onFirstInteraction?.();
    }

    startHoldAtPoint(point);
  }, [debugEnabled, showDebugPanel, getStagePoint, isPaused, onFirstInteraction, phase, startHoldAtPoint]);

  const handlePointerMove = useCallback((event) => {
    if (pointerIdRef.current !== event.pointerId || !isDraggingLight) return;

    event.preventDefault();
    const point = getStagePoint(event);
    setBeamPos(point);
    startHoldAtPoint(point);
  }, [getStagePoint, isDraggingLight, startHoldAtPoint]);

  const endPointer = useCallback((event) => {
    if (event && pointerIdRef.current !== event.pointerId) return;

    if (event?.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    pointerIdRef.current = null;
    setIsDraggingLight(false);
    cancelHold();
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
    setIsDraggingLight(false);
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
    setIsDraggingLight(false);
    setHasInteracted(false);
    setRevealPulse(null);
    setHintMode('find');
    pointerIdRef.current = null;
    firstInteractionSentRef.current = false;
    doneCalledRef.current = false;
    doneAnnouncedRef.current = false;
    lastSyllableDoneRef.current = false;
    completionVoStartedRef.current = false;
    completionFinishedRef.current = false;
    lastHintVoKeyRef.current = null;
  }, [cancelHold, clearTimers, isActive]);

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
      window.clearTimeout(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }

    const finish = () => {
      if (completionFinishedRef.current) return;

      completionFinishedRef.current = true;

      if (voFallbackRef.current) {
        window.clearTimeout(voFallbackRef.current);
        voFallbackRef.current = null;
      }

      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    };

    if (!playSceneLine) {
      window.setTimeout(finish, 800);
      return;
    }

    const afterWord = () => {
      playSceneLine('scene11_sama_done', finish, { stripLeadingText: 'Samaprabha' });
    };

    if (playWord) playWord('samaprabha', afterWord);
    else afterWord();

    voFallbackRef.current = window.setTimeout(finish, 10000);
  }, [playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'done' || doneAnnouncedRef.current) return;

    doneAnnouncedRef.current = true;
    sylEndFallbackRef.current = window.setTimeout(() => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    }, 1700);

    startCompletionVo();
  }, [phase, startCompletionVo]);

  useEffect(() => () => {
    clearTimers();
    cancelHold();

    if (sylEndFallbackRef.current) window.clearTimeout(sylEndFallbackRef.current);
    if (voFallbackRef.current) window.clearTimeout(voFallbackRef.current);
  }, [cancelHold, clearTimers]);

  if (!isActive) return null;

  // FIND mode only — HOLD mode shows a stationary ring instead (the target
  // is already found; dots pointing "toward the shadow" would be confusing
  // once the child is standing on it). L2 = partial direction, L3 = almost
  // the whole path — reusing the existing dot visual instead of a new one.
  const rescueDots = activeClue && hintMode === 'find' && hintLevel >= 2
    ? (hintLevel === 2 ? [0.2, 0.35, 0.5] : [0.34, 0.62, 0.88]).map((amount) => ({
      x: beamPos.x + (activeClue.cx - beamPos.x) * amount,
      y: beamPos.y + (activeClue.cy - beamPos.y) * amount,
    }))
    : [];

  const firstClue = CLUES[0];

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
    <div className={`sama-game${hideElements ? ' is-hidden' : ''}`}>
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
            playSyllable?.(syllable, isLast ? () => {
              lastSyllableDoneRef.current = true;
              startCompletionVo();
            } : undefined);
          }}
        />

        <Animal animalState={effAnimalState} style={{ left: `${fawnPos.l}%`, top: `${fawnPos.t}%` }} />

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

        <div className="sama-mystery-group" aria-hidden="true">
          {CLUES.map((clue, index) => {
            const piece = activeLayout.shadowPieces[clue.shadowPieceKey];
            return (
              <div
                key={clue.id}
                className="sama-mystery-piece"
                style={{
                  left: `${piece.l}%`,
                  top: `${piece.t}%`,
                  width: `${piece.w}vw`,
                }}
              >
                <TruthLayer
                  clue={clue}
                  isRevealed={index < effLit}
                  isBeingSeen={index === lit && isHoldingClue}
                  isNew={revealPulse === index}
                />
              </div>
            );
          })}
        </div>

        {/* FIND L1 — "notice this shadow", not the full action. */}
        {activeClue && hintMode === 'find' && hintLevel === 1 && (
          <div
            className="sama-hint-area"
            style={{
              left: `${activeClue.cx}%`,
              top: `${activeClue.cy}%`,
              width: `${activeClue.hintW}%`,
              height: `${activeClue.hintH}%`,
            }}
          />
        )}

        {/* HOLD L1 — "stay here", not "go somewhere else". */}
        {activeClue && hintMode === 'hold' && hintLevel === 1 && (
          <div
            className="sama-hold-hint"
            style={{ left: `${activeClue.cx}%`, top: `${activeClue.cy}%` }}
          />
        )}

        {rescueDots.map((dot, index) => (
          <span
            key={`rescue-${index}`}
            className="sama-rescue-dot"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              animationDelay: `${index * 0.13}s`,
            }}
          />
        ))}

        <div
          className={[
            'sama-inspection-light',
            isDraggingLight ? 'is-moving' : '',
            isHoldingClue ? 'is-holding' : '',
          ].filter(Boolean).join(' ')}
          style={{ left: `${beamPos.x}%`, top: `${beamPos.y}%` }}
          aria-hidden="true"
        >
          <div className="sama-light-core" />
          {isHoldingClue && (
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
          )}
        </div>

        {/* Teaching, first clue only — teaches BOTH halves of the mechanic:
            drag the light to the real first shadow, then hold it there.
            scene11_sama_intro has a short setup clause before "Move the
            light..." — GMB gesture-timing preset B (~750ms), with the hold
            demo staggered to start after the drag has landed. */}
        <GestureDemo
          type="drag"
          from={START_BEAM}
          to={{ x: firstClue.cx, y: firstClue.cy }}
          active={phase === 'play' && lit === 0 && !hasInteracted}
          idleDelay={750}
          iterations={1}
        />
        <GestureDemo
          type="hold"
          from={{ x: firstClue.cx, y: firstClue.cy }}
          to={{ x: firstClue.cx, y: firstClue.cy }}
          active={phase === 'play' && lit === 0 && !hasInteracted}
          idleDelay={1800}
          iterations={1}
        />

        {/* HOLD L2 — VO says "keep the light there"; a brief hold demo shows it. */}
        {activeClue && hintMode === 'hold' && hintLevel === 2 && (
          <GestureDemo
            key={`sama-hold-partial-${lit}`}
            type="hold-progress-l2"
            from={{ x: activeClue.cx, y: activeClue.cy }}
            to={{ x: activeClue.cx, y: activeClue.cy }}
            active
            idleDelay={0}
            iterations={1}
          />
        )}

        {/* HOLD L3 — the complete idea: beam moves to the shadow, then holds. */}
        {activeClue && hintMode === 'hold' && hintLevel >= 3 && (
          <>
            <GestureDemo
              key={`sama-hold-full-drag-${lit}`}
              type="drag"
              from={beamPos}
              to={{ x: activeClue.cx, y: activeClue.cy }}
              active
              idleDelay={0}
              iterations={1}
            />
            <GestureDemo
              key={`sama-hold-full-hold-${lit}`}
              type="hold-progress-l3"
              from={{ x: activeClue.cx, y: activeClue.cy }}
              to={{ x: activeClue.cx, y: activeClue.cy }}
              active
              idleDelay={900}
              iterations={1}
            />
          </>
        )}

        {effShowDoneline && (
          <p className="sama-doneline is-visible">Now you can see clearly.</p>
        )}

        {debugEnabled && showDebugPanel && activeLayout.clues.map((clue, index) => {
          // Reference layer: every clue placed so far, dimmed, so
          // positioning the next one doesn't lose sight of the ones
          // already done — only the selected clue (rendered separately
          // below, full strength + handles) needs to stand out.
          if (selectedDebugKey === `clue-${index}`) return null;
          const d = Math.max(clue.rx, clue.ry) * 2;
          return (
            <img
              key={`clue-ref-${index}`}
              src={CLUE_META[index]?.img}
              alt=""
              className="sama-debug-clue-preview sama-debug-clue-preview--dim"
              style={{ left: `${clue.cx - d / 2}%`, top: `${clue.cy - d / 2}%`, width: `${d}%`, height: `${d}%` }}
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

          // Clue tap-zones have no visible art of their own at cx/cy (the
          // actual reveal image lives in the mystery-object stack,
          // positioned separately) — so there's nothing to see while
          // dragging, just an invisible ellipse. Show the real clue artwork
          // (branch/reeds/stump/rocks) right at the tap-zone instead of an
          // abstract outline, so it's obvious what you're actually placing.
          let outline = null;
          let clueImg = null;
          if (option.type === 'clue') {
            const rx = Number(getDebugValue('rx')) || 8;
            const ry = Number(getDebugValue('ry')) || 8;
            outline = {
              left: `${cx - rx}%`, top: `${cy - ry}%`,
              width: `${rx * 2}%`, height: `${ry * 2}%`,
              borderRadius: '50%',
            };
            // The clue art is a square canvas with a lot of transparent
            // padding around the actual glyph — object-fit: contain inside
            // the (non-square) ellipse box was scaling to whichever of
            // rx/ry was smaller, so dragging just one axis barely moved it.
            // Size it as a square from the larger of the two instead, so it
            // visibly tracks the resize handle either way.
            const d = Math.max(rx, ry) * 2;
            clueImg = {
              src: CLUE_META[option.index]?.img,
              style: { left: `${cx - d / 2}%`, top: `${cy - d / 2}%`, width: `${d}%`, height: `${d}%` },
            };
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
