import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import './SamaprabhaGame.css';

import sharedSceneBg from '../assets/images/saurakoti-bg.png';
import sunImg from '../assets/images/Suryakoti/sun-zip.png';
import birdColdImg from '../assets/images/Samaprabha/bird-cold.png';
import birdFlyImg from '../assets/images/Samaprabha/bird-fly.png';
import birdHappyImg from '../assets/images/Samaprabha/bird-happy.png';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];

const STOPS = [
  { balance: 0.92, litCount: 0 },
  { balance: 0.815, litCount: 1 },
  { balance: 0.71, litCount: 2 },
  { balance: 0.605, litCount: 3 },
  { balance: 0.50, litCount: 3 },
];

const TRACK_START = 22;
const TRACK_END = 78;
const SUN_TOP_PCT = 19;

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function sunLeftPct(balance) { return TRACK_START + balance * (TRACK_END - TRACK_START); }

function SunRays({ balance, stop, isDone }) {
  const sunX = sunLeftPct(balance);
  const sunY = SUN_TOP_PCT;
  const leftBirdX = 22;
  const rightBirdX = 78;
  const progress = stop / (STOPS.length - 1);

  const leftOp = clamp(0.06 + (1 - balance) * 0.88, 0.06, 0.94);
  const leftFan = clamp(2 + (1 - balance) * 18, 2, 20);
  const rightOp = clamp(0.06 + balance * 0.88, 0.06, 0.94);
  const rightFan = clamp(2 + balance * 18, 2, 20);
  const glowR = 5 + progress * 10;
  const glowOp = 0.15 + progress * 0.35;

  return (
    <svg
      className={`sama-rays-svg${isDone ? ' is-done' : ''}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE87A" stopOpacity={glowOp + 0.15} />
          <stop offset="60%" stopColor="#FFD54F" stopOpacity={glowOp} />
          <stop offset="100%" stopColor="#FFD54F" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="rayLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFE87A" stopOpacity={leftOp + 0.1} />
          <stop offset="100%" stopColor="#FFE87A" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="rayRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFE87A" stopOpacity={0} />
          <stop offset="100%" stopColor="#FFE87A" stopOpacity={rightOp + 0.1} />
        </linearGradient>
      </defs>

      <polygon
        points={`${sunX},${sunY} ${leftBirdX - leftFan},58 ${leftBirdX + leftFan},58`}
        fill="url(#rayLeft)"
      />
      <polygon
        points={`${sunX},${sunY} ${rightBirdX - rightFan},57 ${rightBirdX + rightFan},57`}
        fill="url(#rayRight)"
      />
      <ellipse cx={sunX} cy={sunY} rx={glowR} ry={glowR * 0.7} fill="url(#sunGlow)" />

      {isDone && (
        <>
          <circle
            cx={sunX}
            cy={sunY}
            r="12"
            fill="none"
            stroke="#FFE87A"
            strokeWidth="0.6"
            opacity="0.5"
            className="sama-burst-ring sama-burst-ring-1"
          />
          <circle
            cx={sunX}
            cy={sunY}
            r="18"
            fill="none"
            stroke="#FFD54F"
            strokeWidth="0.4"
            opacity="0.35"
            className="sama-burst-ring sama-burst-ring-2"
          />
        </>
      )}
    </svg>
  );
}

function Bird({ side, brightness, birdState }) {
  return (
    <div
      className={`sama-bird ${side} sama-bird--${birdState}`}
      style={{ filter: `brightness(${0.5 + brightness * 0.7}) saturate(${0.6 + brightness * 0.7})` }}
    >
      <div className="sama-bird-halo" style={{ opacity: 0.1 + brightness * 0.6 }} />
      <img
        className="sama-bird-img sama-bird-cold"
        src={birdColdImg}
        alt=""
        style={{ opacity: birdState === 'done' ? 0 : clamp(1.1 - brightness * 1.2, 0, 0.9) }}
      />
      <img
        className="sama-bird-img sama-bird-happy"
        src={birdHappyImg}
        alt=""
        style={{ opacity: birdState === 'done' ? 0 : clamp(brightness * 1.1, 0, 1) }}
      />
      {birdState === 'done' && (
        <img className="sama-bird-img sama-bird-fly" src={birdFlyImg} alt="" />
      )}
    </div>
  );
}

function SunHandle({ balance, isDragging, isBalanced }) {
  return (
    <div
      className={`sama-handle${isDragging ? ' is-dragging' : ''}${isBalanced ? ' is-balanced' : ''}`}
      style={{ left: `${sunLeftPct(balance)}%`, top: `${SUN_TOP_PCT}%` }}
      aria-hidden="true"
    >
      <div className="sama-handle-core">
        <img className="sama-handle-sun-img" src={sunImg} alt="" />
      </div>
    </div>
  );
}

function SnapDots({ currentStop }) {
  return (
    <div className="sama-snap-dots" aria-hidden="true">
      {STOPS.map((s, i) => (
        <div
          key={i}
          className={`sama-snap-dot${i <= currentStop ? ' is-lit' : ''}${i === currentStop ? ' is-current' : ''}`}
          style={{ left: `${sunLeftPct(s.balance)}%` }}
        />
      ))}
    </div>
  );
}

export default function SamaprabhaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
  isReload = false,
  savedGameState = null,
  onSaveGameState = () => {},
}) {
  const containerRef = useRef(null);
  const dragRef = useRef(false);
  const dragStartXRef = useRef(null);
  const hydrateRef = useRef(false);
  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const currentStopRef = useRef(0);
  const lastAdvanceAtRef = useRef(0);
  isPausedRef.current = isPaused;

  const [currentStop, setCurrentStop] = useState(0);
  const [phase, setPhase] = useState('play');
  const [isDragging, setIsDragging] = useState(false);
  const [birdState, setBirdState] = useState('cold');
  const onGameCompleteRef = useRef(onGameComplete);
  const onPhaseCompleteRef = useRef(onPhaseComplete);

  useEffect(() => {
    currentStopRef.current = currentStop;
  }, [currentStop]);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
    onPhaseCompleteRef.current = onPhaseComplete;
  }, [onGameComplete, onPhaseComplete]);

  const balance = STOPS[currentStop].balance;
  const leftBrightness = 1 - balance;
  const rightBrightness = balance;
  const litCount = STOPS[currentStop].litCount + (phase === 'done' ? 1 : 0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const safeAfter = useCallback((ms, fn) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const DRAG_STEP = 56;
  const ADVANCE_COOLDOWN_MS = 380;

  const advanceStop = useCallback((direction) => {
    const prev = currentStopRef.current;
    const next = clamp(prev + (-direction), 0, STOPS.length - 1);
    if (next === prev) return;

    currentStopRef.current = next;
    setCurrentStop(next);

    const newLit = STOPS[next].litCount;
    const prevLit = STOPS[prev].litCount;
    if (newLit > prevLit) {
      window.setTimeout(() => onMicroWin?.(), 0);
    }

    setBirdState(next >= 2 ? 'warm' : 'cold');

    if (next === STOPS.length - 1 && !doneCalledRef.current) {
      doneCalledRef.current = true;
      safeAfter(300, () => {
        setPhase('done');
        setBirdState('done');
        onSaveGameState?.({ phase: 'done', stop: next, completed: true });
      });
      return;
    }

    onSaveGameState?.({ phase: 'play', stop: next });
  }, [onGameComplete, onMicroWin, onPhaseComplete, onSaveGameState, safeAfter]);

  const handlePointerDown = useCallback((e) => {
    if (phase !== 'play' || isPausedRef.current || doneCalledRef.current) return;
    e.preventDefault();
    dragRef.current = true;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
  }, [phase]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handleMove = (e) => {
      if (!dragRef.current || isPausedRef.current) return;
      const now = Date.now();
      if (now - lastAdvanceAtRef.current < ADVANCE_COOLDOWN_MS) return;
      const dx = e.clientX - dragStartXRef.current;
      if (Math.abs(dx) >= DRAG_STEP) {
        advanceStop(dx < 0 ? -1 : 1);
        lastAdvanceAtRef.current = now;
        dragStartXRef.current = e.clientX;
      }
    };

    const handleUp = () => {
      dragRef.current = false;
      dragStartXRef.current = null;
      lastAdvanceAtRef.current = 0;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [isActive, advanceStop]);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      dragRef.current = false;
      setIsDragging(false);
      hydrateRef.current = false;
      doneCalledRef.current = false;
      setCurrentStop(0);
      setPhase('play');
      setBirdState('cold');
      return;
    }
    if (hydrateRef.current && !isReload) return;
    hydrateRef.current = true;

    const savedStop = typeof savedGameState?.stop === 'number' ? savedGameState.stop : 0;
    const savedComplete = Boolean(savedGameState?.completed || savedGameState?.phase === 'done');
    const nextStop = savedComplete ? STOPS.length - 1 : clamp(savedStop, 0, STOPS.length - 1);

    setCurrentStop(nextStop);
    currentStopRef.current = nextStop;
    setPhase(savedComplete ? 'done' : 'play');
    setBirdState(savedComplete ? 'done' : nextStop >= 2 ? 'warm' : 'cold');
    doneCalledRef.current = savedComplete;
  }, [isActive, isReload, savedGameState, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (phase !== 'done') return undefined;
    const timerId = window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 1200);
    return () => window.clearTimeout(timerId);
  }, [phase]);

  if (!isActive) return null;

  return (
    <div className={`sama-game${hideElements ? ' is-hidden' : ''}`}>
      <div
        ref={containerRef}
        className="sama-stage"
        style={{ backgroundImage: `url(${sharedSceneBg})` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="sama-skywash" />
        <div
          className={`sama-stage-glow${phase === 'done' ? ' is-done' : ''}`}
          style={{ opacity: clamp(0.1 + (1 - Math.abs(leftBrightness - rightBrightness)) * 0.85, 0.1, 1) }}
        />

        <SunRays balance={balance} stop={currentStop} isDone={phase === 'done'} />

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />

        {phase === 'done' && (
          <p className="sama-doneline is-visible">Both shine equally now.</p>
        )}

        <div className="sama-beam" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="samaBeamGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="40%" stopColor="rgba(255,223,138,0.32)" />
                <stop offset="60%" stopColor="rgba(255,223,138,0.32)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </linearGradient>
            </defs>
            <line
              x1={TRACK_START}
              y1={SUN_TOP_PCT}
              x2={TRACK_END}
              y2={SUN_TOP_PCT}
              stroke="url(#samaBeamGlow)"
              strokeWidth="0.6"
              strokeDasharray="1 2"
            />
          </svg>
        </div>

        <SnapDots currentStop={currentStop} />

        <Bird side="left" brightness={leftBrightness} birdState={birdState} />
        <Bird side="right" brightness={rightBrightness} birdState={birdState} />

        <SunHandle balance={balance} isDragging={isDragging} isBalanced={phase === 'done'} />

        <div
          className={`sama-handle-hit${phase !== 'play' || isPaused ? ' is-disabled' : ''}`}
          style={{ left: `${sunLeftPct(balance)}%` }}
          onPointerDown={handlePointerDown}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
