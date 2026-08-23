// src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx
//
// MAHAKAYA - attach rope, pull logs into the raft, make room for everyone.
// Each completed pull adds one log, welcomes one animal, and locks one syllable.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './MahakayaRescueGame.css';

import logHeavy from './assets/images/mahakaya/log-heavy.webp';
import frogHappy from './assets/images/vakratunda/frog-happy.webp';
import duckling from './assets/images/vakratunda/duckling.png';
import bunnyHappy from '../Scene2/assets/images/Samaprabha/bunny-happy.png';
import birdHappy from '../Scene2/assets/images/Samaprabha/bird-happy.png';

const SYLLABLES = ['Ma', 'ha', 'ka', 'ya'];
const AUDIO = { syllables: ['ma', 'ha', 'ka', 'ya'] };
const TOTAL_LOGS = 3;
const TOTAL_SYLLABLES = 4;
const ATTACH_DIST = 10;

const DEFAULT_LAYOUT = {
  pulley: { l: 56, t: 12, w: 4.5 },
  handleStart: { l: 45, t: 36, w: 6.6 },
  pullTop: { l: 56, t: 24, w: 6.6 },
  pullBottom: { l: 56, t: 78, w: 6.6 },
  raft: { l: 49, t: 59, w: 47, h: 14 },
  raftLog0: { l: 34, t: 59, w: 16 },
  raftLog1: { l: 44, t: 59, w: 16 },
  raftLog2: { l: 54, t: 59, w: 16 },
  raftLog3: { l: 64, t: 59, w: 16 },
  waitingLog0: { l: 23, t: 75, w: 15 },
  waitingLog1: { l: 38, t: 78, w: 15 },
  waitingLog2: { l: 53, t: 76, w: 15 },
  animal0: { l: 34, t: 51, w: 8 },
  animal1: { l: 44, t: 50, w: 7.5 },
  animal2: { l: 54, t: 50, w: 7.5 },
  animal3: { l: 64, t: 50, w: 7.5 },
  waitingAnimal1: { l: 73, t: 68, w: 7.5 },
  waitingAnimal2: { l: 82, t: 70, w: 7.5 },
  waitingAnimal3: { l: 91, t: 67, w: 7.5 },
};

const DEBUG_KEYS = [
  'pulley',
  'handleStart',
  'pullTop',
  'pullBottom',
  'raft',
  'raftLog0',
  'raftLog1',
  'raftLog2',
  'raftLog3',
  'waitingLog0',
  'waitingLog1',
  'waitingLog2',
  'animal0',
  'animal1',
  'animal2',
  'animal3',
  'waitingAnimal1',
  'waitingAnimal2',
  'waitingAnimal3',
];

const ANIMALS = [
  { id: 'frog', img: frogHappy, name: 'Frog' },
  { id: 'duckling', img: duckling, name: 'Duckling' },
  { id: 'bunny', img: bunnyHappy, name: 'Bunny' },
  { id: 'bird', img: birdHappy, name: 'Bird' },
];

const lerp = (a, b, t) => a + (b - a) * t;
const mixPos = (from, to, t) => ({
  l: lerp(from.l, to.l, t),
  t: lerp(from.t, to.t, t),
  w: lerp(from.w, to.w, t),
});

function RopeGripSvg() {
  return (
    <svg className="maha-grip-svg" viewBox="0 0 120 44" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mahaGripWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d49a66" />
          <stop offset="22%" stopColor="#ebbc8b" />
          <stop offset="48%" stopColor="#d49a66" />
          <stop offset="74%" stopColor="#ebbc8b" />
          <stop offset="100%" stopColor="#bc7f4f" />
        </linearGradient>
        <linearGradient id="mahaGripCap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cf9560" />
          <stop offset="100%" stopColor="#a96f45" />
        </linearGradient>
      </defs>
      <rect x="18" y="12" width="84" height="20" rx="10" fill="url(#mahaGripWood)" />
      <rect x="8" y="6" width="16" height="32" rx="8" fill="url(#mahaGripCap)" />
      <rect x="96" y="6" width="16" height="32" rx="8" fill="url(#mahaGripCap)" />
      <path d="M26 16 H94" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 28 H94" stroke="rgba(120,72,34,0.18)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RopeLine({ x1, y1, x2, y2, zIndex = 14 }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const controlX = midX + (x2 - x1) * 0.04;
  const controlY = midY + Math.min(14, Math.max(4, distance * 0.12));
  const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

  return (
    <svg
      className="maha-rope-svg"
      style={{ zIndex }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="#d19159" strokeWidth="0.95" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="#efc392"
        strokeWidth="0.48"
        strokeLinecap="round"
        strokeDasharray="0.01 2.2"
        opacity="0.82"
      />
    </svg>
  );
}

export default function MahakayaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playSyllable, playWord, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [ropeStage, setRopeStage] = useState('detached');
  const [activeLog, setActiveLog] = useState(0);
  const [completedLogs, setCompletedLogs] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const [pullProgress, setPullProgress] = useState(0);
  const [knobPos, setKnobPos] = useState({ l: DEFAULT_LAYOUT.handleStart.l, t: DEFAULT_LAYOUT.handleStart.t });
  const [dragging, setDragging] = useState(null);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('waitingLog0');
  const [debugDrag, setDebugDrag] = useState(null);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const phaseRef = useRef('intro');
  const ropeStageRef = useRef('detached');
  const draggingRef = useRef(null);
  const completedLogsRef = useRef(0);
  const completionStartedRef = useRef(false);

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !debugMode,
    stageKey: `${ropeStage}-${activeLog}`,
    initialDelay: ropeStage === 'detached' ? 8000 : 6500,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: ropeStage === 'detached' ? 15000 : 13000,
    level3Delay: ropeStage === 'detached' ? 22000 : 20000,
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms, fn) => {
    const runWhenReady = () => {
      if (isPausedRef.current) {
        const retryId = setTimeout(runWhenReady, 150);
        timers.current.push(retryId);
        return;
      }
      fn();
    };
    const id = setTimeout(runWhenReady, ms);
    timers.current.push(id);
  }, []);

  const pointFromEvent = useCallback((e) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      l: ((e.clientX - rect.left) / rect.width) * 100,
      t: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setPhase('intro');
    phaseRef.current = 'intro';
    setRopeStage('detached');
    ropeStageRef.current = 'detached';
    setActiveLog(0);
    setCompletedLogs(0);
    completedLogsRef.current = 0;
    setLitCount(0);
    setPullProgress(0);
    setKnobPos({ l: layout.handleStart.l, t: layout.handleStart.t });
    setDragging(null);
    draggingRef.current = null;
    completionStartedRef.current = false;
  }, [clearTimers, layout.handleStart.l, layout.handleStart.t]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      draggingRef.current = null;
      setDragging(null);
      setDebugDrag(null);
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isActive) return undefined;
    resetState();
    playSceneLine?.('scene10_maha_intro');
    after(2600, () => {
      setPhase('play');
      phaseRef.current = 'play';
      playSceneLine?.('scene10_maha_drag_rope');
    });
    return clearTimers;
    // Voice and timer helpers are stable enough for this scene lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (!debugMode) return;
    setKnobPos({ l: layout.handleStart.l, t: layout.handleStart.t });
  }, [debugMode, layout.handleStart.l, layout.handleStart.t]);

  if (!isActive) return null;

  const updateLayout = (key, patch) => {
    setLayout((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  };

  const nudgeSize = (delta) => {
    updateLayout(selectedDebugKey, {
      w: Math.max(2, Number(((layout[selectedDebugKey].w || 4) + delta).toFixed(1))),
    });
  };

  const startDebugDrag = (e, key) => {
    if (!debugMode) return false;
    e.preventDefault();
    e.stopPropagation();
    const point = pointFromEvent(e);
    if (!point) return true;
    setSelectedDebugKey(key);
    setDebugDrag({
      key,
      offsetL: point.l - layout[key].l,
      offsetT: point.t - layout[key].t,
    });
    return true;
  };

  const placeStyle = (pos, extra = {}) => ({
    left: `${pos.l}%`,
    top: `${pos.t}%`,
    width: `${pos.w}%`,
    ...(pos.h ? { height: `${pos.h}%` } : {}),
    ...extra,
  });

  const waitingLogKey = `waitingLog${activeLog}`;
  const targetLogKey = `raftLog${activeLog + 1}`;
  const currentWaitingLog = layout[waitingLogKey];
  const currentTargetLog = layout[targetLogKey];
  const currentMovingLog = mixPos(currentWaitingLog, currentTargetLog, pullProgress);
  const pullHandleTop = lerp(layout.pullTop.t, layout.pullBottom.t, pullProgress);
  const activePullHandle = { ...layout.pullTop, t: pullHandleTop };
  const allDone = litCount >= TOTAL_SYLLABLES;

  const completeRound = () => {
    if (ropeStageRef.current !== 'attached') return;
    const nextCompleted = Math.min(TOTAL_LOGS, completedLogsRef.current + 1);
    completedLogsRef.current = nextCompleted;
    setCompletedLogs(nextCompleted);
    setLitCount(nextCompleted);
    onMicroWin?.();
    playSfx?.('chime');
    setPullProgress(0);
    draggingRef.current = null;
    setDragging(null);

    if (nextCompleted >= TOTAL_LOGS) {
      ropeStageRef.current = 'done';
      setRopeStage('done');
      after(700, () => {
        setLitCount(TOTAL_SYLLABLES);
        playWord?.('mahakaya');
      });
      after(1500, () => {
        setPhase('complete');
        phaseRef.current = 'complete';
        playSceneLine?.('scene10_maha_success');
      });
      after(4300, () => {
        if (completionStartedRef.current) return;
        completionStartedRef.current = true;
        onGameComplete?.();
        onPhaseComplete();
      });
      return;
    }

    const nextLog = nextCompleted;
    setActiveLog(nextLog);
    ropeStageRef.current = 'detached';
    setRopeStage('detached');
    setKnobPos({ l: layout.handleStart.l, t: layout.handleStart.t });
    after(350, () => playSceneLine?.('scene10_maha_drag_rope'));
  };

  const onKnobDown = (e) => {
    if (debugMode || isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'detached') return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    markInteraction();
    draggingRef.current = 'knob';
    setDragging('knob');
  };

  const onPullDown = (e) => {
    if (debugMode || isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'attached') return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    markInteraction();
    draggingRef.current = 'pull';
    setDragging('pull');
  };

  const onPointerMove = (e) => {
    if (debugDrag && !isPaused) {
      const point = pointFromEvent(e);
      if (!point) return;
      updateLayout(debugDrag.key, {
        l: Number((point.l - debugDrag.offsetL).toFixed(1)),
        t: Number((point.t - debugDrag.offsetT).toFixed(1)),
      });
      return;
    }

    if (!draggingRef.current || isPaused) return;
    const point = pointFromEvent(e);
    if (!point) return;

    if (draggingRef.current === 'knob') {
      setKnobPos(point);
      return;
    }

    if (draggingRef.current === 'pull') {
      const np = Math.max(0, Math.min(1, (point.t - layout.pullTop.t) / (layout.pullBottom.t - layout.pullTop.t)));
      setPullProgress(np);
      if (np >= 1) completeRound();
    }
  };

  const onPointerUp = (e) => {
    if (debugDrag) {
      setDebugDrag(null);
      return;
    }

    if (!draggingRef.current) return;
    if (draggingRef.current === 'knob') {
      const point = pointFromEvent(e) || knobPos;
      const dist = Math.hypot(point.l - currentWaitingLog.l, point.t - currentWaitingLog.t);
      if (dist < ATTACH_DIST) {
        ropeStageRef.current = 'attached';
        setRopeStage('attached');
        setKnobPos({ l: currentWaitingLog.l, t: currentWaitingLog.t });
        playSfx?.('chime');
        playSceneLine?.('scene10_maha_pull_down');
      } else {
        setKnobPos({ l: layout.handleStart.l, t: layout.handleStart.t });
      }
    } else if (draggingRef.current === 'pull') {
      setPullProgress(0);
    }
    draggingRef.current = null;
    setDragging(null);
  };

  const renderLog = (key, className, pos, zIndex, options = {}) => (
    <div
      key={key}
      className={`maha-layer maha-log-piece ${className || ''} ${debugMode && selectedDebugKey === key ? 'is-debug-selected' : ''}`}
      style={placeStyle(pos, {
        zIndex,
        opacity: options.hidden ? 0 : 1,
        pointerEvents: options.hidden ? 'none' : undefined,
      })}
      onPointerDown={(e) => startDebugDrag(e, key)}
    >
      <img src={logHeavy} alt="" />
    </div>
  );

  const renderAnimal = (animalIndex, joined) => {
    const animal = ANIMALS[animalIndex];
    const key = joined ? `animal${animalIndex}` : `waitingAnimal${animalIndex}`;
    const pos = layout[key];
    return (
      <div
        key={`${animal.id}-${joined ? 'raft' : 'wait'}`}
        className={`maha-layer maha-animal ${joined ? 'is-joined' : 'is-waiting'} ${debugMode && selectedDebugKey === key ? 'is-debug-selected' : ''}`}
        style={placeStyle(pos, { zIndex: joined ? 22 : 9 })}
        onPointerDown={(e) => startDebugDrag(e, key)}
        title={animal.name}
      >
        <img src={animal.img} alt="" />
      </div>
    );
  };

  return (
    <div
      ref={stageRef}
      className={`maha-game ${hideElements ? 'is-hidden' : ''} ${debugMode ? 'is-debugging' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopVoice?.();
            playSyllable?.(syllable);
          }}
        />
      )}

      <button
        type="button"
        className="maha-debug-toggle"
        onClick={() => setDebugMode((show) => !show)}
      >
        {debugMode ? 'Done layout' : 'Layout'}
      </button>

      {phase === 'play' && (
        <p className={`maha-hint ${hintLevel >= 1 ? 'is-visible' : ''}`}>
          {ropeStage === 'detached' && hintLevel === 1 && 'Try the glowing rope.'}
          {ropeStage === 'detached' && hintLevel === 2 && 'Attach the rope to a log.'}
          {ropeStage === 'detached' && hintLevel >= 3 && 'Drag the handle to the next log.'}
          {ropeStage === 'attached' && hintLevel === 1 && 'Pull the handle down.'}
          {ropeStage === 'attached' && hintLevel === 2 && 'Pull to add the log.'}
          {ropeStage === 'attached' && hintLevel >= 3 && 'Pull all the way down.'}
        </p>
      )}

      {phase === 'complete' && <p className="maha-doneline">There&apos;s room for everyone.</p>}

      <div
        className={`maha-layer maha-raft-glow ${allDone ? 'is-complete' : ''}`}
        style={placeStyle(layout.raft, { zIndex: 10 })}
        onPointerDown={(e) => startDebugDrag(e, 'raft')}
      />

      {renderLog('raftLog0', 'maha-raft-log', layout.raftLog0, 18)}
      {[0, 1, 2].map((index) => {
        if (index < completedLogs) {
          return renderLog(`raftLog${index + 1}`, 'maha-raft-log is-attached', layout[`raftLog${index + 1}`], 18 + index);
        }
        if (index === activeLog && ropeStage === 'attached') {
          return renderLog(`movingLog${index}`, 'is-moving', currentMovingLog, 20);
        }
        return renderLog(`waitingLog${index}`, index === activeLog ? 'is-current' : '', layout[`waitingLog${index}`], 8);
      })}

      {ANIMALS.map((_, index) => renderAnimal(index, index === 0 || index <= completedLogs))}

      <div
        className={`maha-layer maha-pulley ${debugMode && selectedDebugKey === 'pulley' ? 'is-debug-selected' : ''}`}
        style={placeStyle(layout.pulley, { zIndex: 16 })}
        onPointerDown={(e) => startDebugDrag(e, 'pulley')}
        aria-hidden="true"
      />

      {ropeStage === 'detached' && phase === 'play' && (
        <>
          <RopeLine x1={layout.pulley.l} y1={layout.pulley.t} x2={knobPos.l} y2={knobPos.t} />
          <div
            className={`maha-layer maha-knob ${dragging === 'knob' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''} ${debugMode && selectedDebugKey === 'handleStart' ? 'is-debug-selected' : ''}`}
            style={placeStyle({ ...layout.handleStart, l: knobPos.l, t: knobPos.t }, { zIndex: 24 })}
            onPointerDown={(e) => (debugMode ? startDebugDrag(e, 'handleStart') : onKnobDown(e))}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      {ropeStage === 'attached' && phase === 'play' && (
        <>
          <RopeLine x1={layout.pulley.l} y1={layout.pulley.t} x2={currentMovingLog.l} y2={currentMovingLog.t} />
          <RopeLine x1={layout.pulley.l} y1={layout.pulley.t} x2={layout.pullTop.l} y2={activePullHandle.t} />
          <div
            className={`maha-layer maha-pull ${dragging === 'pull' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''} ${debugMode && selectedDebugKey === 'pullTop' ? 'is-debug-selected' : ''}`}
            style={placeStyle(activePullHandle, { zIndex: 24 })}
            onPointerDown={(e) => (debugMode ? startDebugDrag(e, 'pullTop') : onPullDown(e))}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      <GestureDemo
        type="drag"
        from={{ x: layout.handleStart.l, y: layout.handleStart.t }}
        to={{ x: currentWaitingLog.l, y: currentWaitingLog.t }}
        active={!debugMode && ropeStage === 'detached' && phase === 'play'}
        idleDelay={3000}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: layout.pullTop.l, y: layout.pullTop.t }}
        to={{ x: layout.pullBottom.l, y: layout.pullBottom.t }}
        active={!debugMode && ropeStage === 'attached' && phase === 'play'}
        idleDelay={3000}
      />

      {debugMode && (
        <div className="maha-debug-panel">
          <label>
            Object
            <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
              {DEBUG_KEYS.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </label>
          <div className="maha-debug-actions">
            <button type="button" onClick={() => nudgeSize(-0.5)}>- size</button>
            <button type="button" onClick={() => nudgeSize(0.5)}>+ size</button>
          </div>
          <pre>{JSON.stringify(layout[selectedDebugKey], null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
