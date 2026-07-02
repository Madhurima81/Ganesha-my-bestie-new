// src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx
//
// MAHAKAYA - rope-pulley mechanic
// Stage 1 (detached): drag rope knob -> drop near log -> attaches
// Stage 2 (attached): drag pull-handle DOWN (p 0->1) -> log rises, syllables lock
//                      let go -> smooth sink back
// Stage 3 (free): p>=1 -> calf free, game complete
//
// Layer model, %-positioned, positions from editor.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './MahakayaRescueGame.css';

import calfPinned from './assets/images/mahakaya/calf-pinned.webp';
import calfFree from './assets/images/mahakaya/calf-free.webp';
import logHeavy from './assets/images/mahakaya/log-heavy.webp';

const SYLLABLES = ['Ma', 'ha', 'ka', 'ya'];
const TOTAL = 4;

const AUDIO = {
  syllables: ['ma', 'ha', 'ka', 'ya'],
};

// Positions from editor (% of stage)
const POS = {
  ropeAnchor: { l: 56, t: 12 },
  logRest: { l: 34, t: 54, w: 18 },
  logGround: { l: 52.9, t: 17.9, w: 18 },
  cueTarget: { l: 38, t: 52, w: 10 },
  logLiftY: 34,
  calfPinned: { l: 31.2, t: 63.9, w: 17 },
  calfFree: { l: 32.5, t: 66, w: 17 },
  ropeKnob: { l: 45, t: 38, w: 6.6 },
  pullBottom: 78,
};

const ATTACH_DIST = 14;
const lerp = (a, b, t) => a + (b - a) * t;

function RopeGripSvg() {
  return (
    <svg
      className="maha-grip-svg"
      viewBox="0 0 120 44"
      aria-hidden="true"
      focusable="false"
    >
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

export default function MahakayaRescueGame({
  isActive = false,
  hideElements = false,
  powerGained = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  profileName = '',
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playWord, playSyllable, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [ropeStage, setRopeStage] = useState('detached');
  const [knobPos, setKnobPos] = useState({ l: POS.ropeKnob.l, t: POS.ropeKnob.t });
  const [p, setP] = useState(0);
  const [locked, setLocked] = useState(0);
  const [dragging, setDragging] = useState(null);

  const pRef = useRef(0);
  const lockedRef = useRef(0);
  const draggingRef = useRef(null);
  const ropeStageRef = useRef('detached');
  const phaseRef = useRef('intro');
  const timers = useRef([]);
  const slip = useRef(null);
  const stageRef = useRef(null);
  const {
    hintLevel,
    pulseTick,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive,
    stageKey: ropeStage === 'detached' ? 'detached' : 'attached',
    initialDelay: ropeStage === 'detached' ? 8000 : 7000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: ropeStage === 'detached' ? 15000 : 14000,
    level3Delay: ropeStage === 'detached' ? 22000 : 21000,
  });

  const after = useCallback((ms, fn) => {
    if (isPaused) return;
    const id = setTimeout(() => {
      if (!isPaused) fn();
    }, ms);
    timers.current.push(id);
  }, [isPaused]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const resetState = () => {
    setPhase('intro');
    phaseRef.current = 'intro';
    setRopeStage('detached');
    ropeStageRef.current = 'detached';
    setKnobPos({ l: POS.ropeKnob.l, t: POS.ropeKnob.t });
    setP(0);
    pRef.current = 0;
    setLocked(0);
    lockedRef.current = 0;
    setDragging(null);
    draggingRef.current = null;
    if (slip.current) {
      clearInterval(slip.current);
      slip.current = null;
    }
  };

  useEffect(() => {
    if (!isActive) return;
    resetState();
    playSceneLine?.('scene10_maha_intro');
    after(2800, () => playSceneLine?.('scene10_maha_blocking'));
    after(4600, () => playSceneLine?.('scene10_maha_drag_rope'));
    after(4600, () => {
      setPhase('play');
      phaseRef.current = 'play';
    });
    return () => {
      clearTimers();
      if (slip.current) clearInterval(slip.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, after, playSceneLine]);

  function startSink() {
    if (slip.current) return;
    slip.current = setInterval(() => {
      if (draggingRef.current === 'pull') {
        clearInterval(slip.current);
        slip.current = null;
        return;
      }
      const np = Math.max(0, pRef.current - 0.04);
      pRef.current = np;
      setP(np);
      lockedRef.current = Math.floor(np * TOTAL + 1e-6);
      setLocked(lockedRef.current);
      if (np <= 0) {
        clearInterval(slip.current);
        slip.current = null;
      }
    }, 60);
  }

  useEffect(() => {
    if (isPaused) {
      draggingRef.current = null;
      setDragging(null);
      startSink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  if (!isActive) return null;

  const onKnobDown = (e) => {
    if (isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'detached') return;
    e.preventDefault();
    e.stopPropagation();
    markInteraction();
    draggingRef.current = 'knob';
    setDragging('knob');
  };

  const onPullDown = (e) => {
    if (isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'attached') return;
    e.preventDefault();
    e.stopPropagation();
    markInteraction();
    if (slip.current) {
      clearInterval(slip.current);
      slip.current = null;
    }
    draggingRef.current = 'pull';
    setDragging('pull');
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || isPaused) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const lPct = ((e.clientX - rect.left) / rect.width) * 100;
    const tPct = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingRef.current === 'knob') {
      setKnobPos({ l: lPct, t: tPct });
    } else if (draggingRef.current === 'pull') {
      const topPct = POS.ropeAnchor.t + 10;
      const botPct = POS.pullBottom;
      const np = Math.max(0, Math.min(1, (tPct - topPct) / (botPct - topPct)));
      pRef.current = np;
      setP(np);

      const sl = Math.min(TOTAL, Math.floor(np * TOTAL + 1e-6));
      if (sl > lockedRef.current) {
        lockedRef.current = sl;
        setLocked(sl);
        onMicroWin?.();
      }
      if (np >= 1) {
        draggingRef.current = null;
        setDragging(null);
        after(400, () => { playSceneLine?.('scene10_maha_success'); });
        after(1200, () => {
          setPhase('free');
          phaseRef.current = 'free';
        });
        after(4700, () => onPhaseComplete());
      }
    }
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    if (draggingRef.current === 'knob') {
      const rect = stageRef.current?.getBoundingClientRect();
      const lPct = rect ? ((e.clientX - rect.left) / rect.width) * 100 : knobPos.l;
      const tPct = rect ? ((e.clientY - rect.top) / rect.height) * 100 : knobPos.t;
      const dist = Math.hypot(lPct - POS.cueTarget.l, tPct - POS.cueTarget.t);
      if (dist < ATTACH_DIST) {
        ropeStageRef.current = 'attached';
        setRopeStage('attached');
        playSfx?.('chime');
        playSceneLine?.('scene10_maha_pull_down');
      } else {
        setKnobPos({ l: POS.ropeKnob.l, t: POS.ropeKnob.t });
      }
    } else if (draggingRef.current === 'pull') {
      startSink();
    }
    draggingRef.current = null;
    setDragging(null);
  };

  const freed = phase === 'free';
  const logPos = freed
    ? POS.logGround
    : { l: POS.logRest.l, t: lerp(POS.logRest.t, POS.logLiftY, p), w: POS.logRest.w };
  const pullT = lerp(POS.ropeAnchor.t + 10, POS.pullBottom, p);
  const calfPos = freed ? POS.calfFree : POS.calfPinned;
  const lyr = (pos) => ({ left: `${pos.l}%`, top: `${pos.t}%`, width: `${pos.w}%` });

  const RopeLine = ({ x1, y1, x2, y2, sag = 0 }) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    const sagY = sag || Math.min(14, Math.max(4, distance * 0.12));
    const controlX = midX + dx * 0.04;
    const controlY = midY + sagY;
    const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

    return (
      <svg
        className="maha-layer"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transform: 'none',
          zIndex: 14,
          pointerEvents: 'none'
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          stroke="#d19159"
          strokeWidth="0.95"
          strokeLinecap="round"
        />
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
  };

  return (
    <div
      ref={stageRef}
      className={`maha-game ${hideElements ? 'is-hidden' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={locked}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopVoice?.();
            playSyllable?.(syllable);
          }}
        />
      )}
      {freed && <p className="maha-doneline">The calf is free!</p>}

      <div className="maha-layer maha-calf" style={{ ...lyr(calfPos), zIndex: 8 }}>
        <img src={freed ? calfFree : calfPinned} alt="" />
      </div>

      <div
        className="maha-layer maha-log"
        style={{
          left: `${logPos.l}%`,
          top: `${logPos.t}%`,
          width: `${logPos.w}%`,
          zIndex: 12,
          transition: dragging === 'pull' ? 'none' : 'left .45s ease-out, top .45s ease-out'
        }}
      >
        <img src={logHeavy} alt="" />
      </div>

      {ropeStage === 'detached' && phase === 'play' && (
        <>
          <p className={`maha-hint ${hintLevel >= 1 ? 'is-visible' : ''}`}>
            {hintLevel === 1 && 'Try the glowing rope.'}
            {hintLevel === 2 && 'Drag the rope to the log.'}
            {hintLevel >= 3 && 'Drag the rope knob to the target.'}
          </p>
          {/* Inline drag cue replaced by GestureDemo
          <svg
            className={`maha-cue-line ${hintLevel >= 1 ? 'maha-hint-glow' : ''}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={`M ${POS.ropeKnob.l - (POS.ropeKnob.w * 0.34)} ${POS.ropeKnob.t + 0.2} Q ${POS.ropeKnob.l - 1.4} ${POS.ropeKnob.t + 5.5} ${POS.logRest.l} ${POS.logRest.t}`} />
          </svg>
          <div
            className={`maha-cue-target ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''}`}
            key={`maha-cue-target-${pulseTick}`}
            style={{ left: `${POS.cueTarget.l}%`, top: `${POS.cueTarget.t}%`, width: `${POS.cueTarget.w}%` }}
            aria-hidden="true"
          />
          <div
            className="maha-cue-arrow"
            style={{ left: `${POS.cueTarget.l}%`, top: `${POS.cueTarget.t - 8}%` }}
            aria-hidden="true"
          >
            {'\u2193'}
          </div>
          */}
          <RopeLine
            x1={POS.ropeAnchor.l}
            y1={POS.ropeAnchor.t}
            x2={knobPos.l}
            y2={knobPos.t}
          />
          <div
            className={`maha-layer maha-knob ${dragging === 'knob' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''}`}
            style={{
              left: `${knobPos.l}%`,
              top: `${knobPos.t}%`,
              width: `${POS.ropeKnob.w}%`,
              zIndex: 16
            }}
            onPointerDown={onKnobDown}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      {ropeStage === 'attached' && phase === 'play' && (
        <>
          <p className={`maha-hint ${hintLevel >= 1 ? 'is-visible' : ''}`}>
            {hintLevel === 1 && 'Pull the handle down.'}
            {hintLevel === 2 && 'Keep pulling to lift the log.'}
            {hintLevel >= 3 && 'Pull all the way down!'}
          </p>
          {/* Inline pull-down cue replaced by GestureDemo
          {locked === 0 && (
            <div
              className={`maha-cue-arrow maha-cue-arrow-down ${hintLevel >= 1 ? 'maha-hint-pulse' : ''}`}
              style={{ left: `${POS.ropeAnchor.l}%`, top: `${pullT - 12}%` }}
              aria-hidden="true"
            >
              {'\u2193'}
            </div>
          )}
          */}
          <RopeLine
            x1={POS.ropeAnchor.l}
            y1={POS.ropeAnchor.t}
            x2={POS.logRest.l}
            y2={logPos.t}
          />
          <RopeLine
            x1={POS.ropeAnchor.l}
            y1={POS.ropeAnchor.t}
            x2={POS.ropeAnchor.l}
            y2={pullT}
          />
          <div
            className={`maha-layer maha-pull ${dragging === 'pull' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''}`}
            style={{
              left: `${POS.ropeAnchor.l}%`,
              top: `${pullT}%`,
              width: '6%',
              zIndex: 16
            }}
            onPointerDown={onPullDown}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      {freed && (
        <RopeLine
          x1={POS.ropeAnchor.l}
          y1={POS.ropeAnchor.t}
          x2={logPos.l}
          y2={logPos.t}
        />
      )}

      <GestureDemo
        type="drag"
        from={{ x: POS.ropeKnob.l, y: POS.ropeKnob.t }}
        to={{ x: POS.cueTarget.l, y: POS.cueTarget.t }}
        active={ropeStage === 'detached' && phase === 'play' && locked === 0}
        idleDelay={3000}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: POS.ropeAnchor.l, y: POS.ropeAnchor.t + 10 }}
        to={{ x: POS.ropeAnchor.l, y: POS.pullBottom }}
        active={ropeStage === 'attached' && phase === 'play' && locked === 0}
        idleDelay={3000}
      />
    </div>
  );
}

