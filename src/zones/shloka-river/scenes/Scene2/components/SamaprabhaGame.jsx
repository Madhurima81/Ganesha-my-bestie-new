import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import './SamaprabhaGame.css';

import bgImg from '../assets/images/Samaprabha/samaprabha-bg.webp';
import fawnWorriedImg from '../assets/images/Samaprabha/fawn-worried.webp';
import fawnHappyImg from '../assets/images/Samaprabha/fawn-happy.webp';
import fawnWalkImg from '../assets/images/Samaprabha/fawn-walk.webp';
import shadowImg from '../assets/images/Samaprabha/shadow.png';
import mysterySourceFullImg from '../assets/images/Samaprabha/mystery-source-full.png';
import branchImg from '../assets/images/Samaprabha/reveal-branch.png';
import reedsLeavesImg from '../assets/images/Samaprabha/reveal-reeds-leaves.png';
import stumpImg from '../assets/images/Samaprabha/reveal-stump.png';
import rocksGrassImg from '../assets/images/Samaprabha/reveal-rocks-grass.png';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];
const AUDIO = { syllables: ['sa', 'ma', 'pra', 'bha'] };
const HOLD_MS = 1150;

// Static metadata for each clue (id/label/art) -- positions live in
// SAMA_DEFAULT_LAYOUT below so they can be tuned via the Layout Debug panel.
const CLUE_META = [
  { id: 'branch', label: 'branch', img: branchImg, hintW: 18, hintH: 20 },
  { id: 'reeds-leaves', label: 'reeds and leaves', img: reedsLeavesImg, hintW: 18, hintH: 24 },
  { id: 'stump', label: 'stump', img: stumpImg, hintW: 19, hintH: 21 },
  { id: 'rocks', label: 'rocks and grass', img: rocksGrassImg, hintW: 21, hintH: 17 },
];

const SAMA_DEFAULT_LAYOUT = {
  fawnStart: { l: 20, t: 69 },
  fawnWalk: { l: 40, t: 63 },
  shadow: { l: 58, t: 63, w: 28, rotate: 0, scaleX: 1, scaleY: 1, skewX: 0 },
  mystery: { l: 72, t: 58 },
  clues: [
    { cx: 75, cy: 47, rx: 11, ry: 9 },
    { cx: 86, cy: 51, rx: 11, ry: 12 },
    { cx: 82, cy: 62, rx: 11, ry: 10 },
    { cx: 76, cy: 67, rx: 12, ry: 8 },
  ],
};

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
  { type: 'object', key: 'shadow', label: 'Shadow', fields: ['l', 't', 'w', 'rotate', 'scaleX', 'scaleY', 'skewX'] },
  { type: 'object', key: 'mystery', label: 'Mystery Object', fields: ['l', 't'] },
  { type: 'clue', index: 0, key: 'clue-0', label: 'Clue: Branch', fields: ['cx', 'cy', 'rx', 'ry'] },
  { type: 'clue', index: 1, key: 'clue-1', label: 'Clue: Reeds/Leaves', fields: ['cx', 'cy', 'rx', 'ry'] },
  { type: 'clue', index: 2, key: 'clue-2', label: 'Clue: Stump', fields: ['cx', 'cy', 'rx', 'ry'] },
  { type: 'clue', index: 3, key: 'clue-3', label: 'Clue: Rocks', fields: ['cx', 'cy', 'rx', 'ry'] },
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
      shadow: { ...fallback.shadow, ...parsed.shadow },
      mystery: { ...fallback.mystery, ...parsed.mystery },
      clues: fallback.clues.map((clue, index) => ({
        ...clue,
        ...(parsed.clues?.[index] || {}),
      })),
    };
  } catch (error) {
    console.warn('Unable to load Samaprabha layout debug values:', error);
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
      : animalState === 'worried'
        ? fawnWorriedImg
        : fawnHappyImg;

  return (
    <div className={`sama-animal is-${animalState}`} style={style} aria-hidden="true">
      <img src={src} alt="" draggable={false} />
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

export default function SamaprabhaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  onFirstInteraction = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
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

  const stageRef = useRef(null);
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
  const CLUES = useMemo(
    () => CLUE_META.map((meta, index) => ({ ...meta, ...activeLayout.clues[index] })),
    [activeLayout.clues]
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

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? `clue-${lit}` : phase,
    initialDelay: lit === 0 ? 10500 : 8500,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: lit === 0 ? 17500 : 15500,
    level3Delay: lit === 0 ? 25000 : 22500,
  });

  useEffect(() => {
    if (!isActive || isPaused || phase !== 'play' || hintLevel !== 2) return;

    const onceKey = `${lit}-look`;
    if (lastHintVoKeyRef.current === onceKey) return;

    lastHintVoKeyRef.current = onceKey;
    stopVoice?.();
    playSceneLine?.('scene11_sama_hint_look', undefined, { replayOnReturn: false });
  }, [hintLevel, isActive, isPaused, lit, phase, playSceneLine, stopVoice]);

  useEffect(() => {
    lastHintVoKeyRef.current = null;
  }, [lit]);

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

    safeAfter(480, () => setRevealPulse(null));
    window.setTimeout(() => onMicroWin?.(), 0);
    markInteraction();

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
  }, [getStagePoint, isPaused, onFirstInteraction, phase, startHoldAtPoint]);

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

  const rescueDots = activeClue && hintLevel >= 3
    ? [0.34, 0.52, 0.70].map((amount) => ({
      x: beamPos.x + (activeClue.cx - beamPos.x) * amount,
      y: beamPos.y + (activeClue.cy - beamPos.y) * amount,
    }))
    : [];

  // Debug Phase selector previews the scene at a given phase without running
  // gameplay: clues revealed, fawn moved/re-posed, shadow/mystery understood.
  const debugPreview = debugEnabled && showDebugPanel;
  const effLit = debugPreview ? Math.min(debugPhase, CLUE_META.length) : lit;
  const effAnimalState = debugPreview
    ? (debugPhase <= 3 ? 'worried' : debugPhase === 4 ? 'relieved' : 'walking')
    : animalState;
  const effUnderstood = debugPreview ? debugPhase >= 4 : phase !== 'play';
  const effShowDoneline = debugPreview ? debugPhase === 6 : phase === 'done';
  const fawnPos = effAnimalState === 'walking' ? activeLayout.fawnWalk : activeLayout.fawnStart;

  const getDebugValue = (field) => {
    const option = samaDebugOptions.find((opt) => opt.key === selectedDebugKey) || samaDebugOptions[0];
    if (option.type === 'object') return activeLayout[option.key][field];
    if (option.type === 'clue') return activeLayout.clues[option.index][field];
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
      return next;
    });
  };

  const nudgeDebugField = (field, delta) => {
    const current = Number(getDebugValue(field)) || 0;
    updateDebugValue(field, current + delta);
  };

  const copyDebugLayout = () => {
    const payload = 'const SAMA_DEFAULT_LAYOUT = ' + JSON.stringify(activeLayout, null, 2) + ';';
    console.log('Samaprabha layout JSON:', payload);
    window.prompt('Copy Samaprabha layout', payload);
  };

  const startDebugPanelDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y,
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

        <div
          className={`sama-shadow${effUnderstood ? ' is-understood' : ''}`}
          style={{
            left: `${activeLayout.shadow.l}%`,
            top: `${activeLayout.shadow.t}%`,
            width: `${activeLayout.shadow.w}vw`,
            transform: `translate(-50%, -50%) rotate(${activeLayout.shadow.rotate}deg) scaleX(${activeLayout.shadow.scaleX}) scaleY(${activeLayout.shadow.scaleY}) skewX(${activeLayout.shadow.skewX}deg)`,
          }}
          aria-hidden="true"
        >
          <img src={shadowImg} alt="" draggable={false} />
        </div>

        <div
          className={`sama-mystery${effUnderstood ? ' is-understood' : ''}`}
          style={{ left: `${activeLayout.mystery.l}%`, top: `${activeLayout.mystery.t}%` }}
          aria-hidden="true"
        >
          <img className="sama-full-source" src={mysterySourceFullImg} alt="" draggable={false} />
          {CLUES.map((clue, index) => (
            <TruthLayer
              key={clue.id}
              clue={clue}
              isRevealed={index < effLit}
              isBeingSeen={index === lit && isHoldingClue}
              isNew={revealPulse === index}
            />
          ))}
        </div>

        {activeClue && hintLevel >= 1 && (
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

        {activeClue && hintLevel === 2 && (
          <div
            className="sama-hint-bubble"
            style={{
              left: `${activeClue.cx}%`,
              top: `${Math.min(82, activeClue.cy + 16)}%`,
            }}
          >
            Look closely.
          </div>
        )}

        <GestureDemo
          type="drag"
          from={START_BEAM}
          to={{ x: 43, y: 50 }}
          active={phase === 'play' && lit === 0 && !hasInteracted}
          idleDelay={1000}
        />

        {effShowDoneline && (
          <p className="sama-doneline is-visible">Now you can see clearly.</p>
        )}

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
