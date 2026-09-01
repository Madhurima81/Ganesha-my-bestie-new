import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import './SamaprabhaGame.css';

import sharedSceneBg from '../assets/images/saurakoti-bg.png';
import sunImg from '../assets/images/Suryakoti/sun-zip.png';
import birdColdImg from '../assets/images/Samaprabha/bird-cold.png';
import birdFlyImg from '../assets/images/Samaprabha/bird-fly.png';
import birdHappyImg from '../assets/images/Samaprabha/bird-happy.png';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];
const AUDIO = { syllables: ['sa', 'ma', 'pra', 'bha'] };

// One tappable circle per syllable sound (4 total). The child taps the next
// circle in sequence; each tap slides the sun onto it and plays that syllable.
const SYLLABLE_STOPS = [
  { balance: 0.80 },
  { balance: 0.70 },
  { balance: 0.60 },
  { balance: 0.50 },
];
const START_BALANCE = 0.92;

const TRACK_START = 22;
const TRACK_END = 78;
const SUN_TOP_PCT = 19;

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function sunLeftPct(balance) { return TRACK_START + balance * (TRACK_END - TRACK_START); }
function balanceForLit(lit) {
  return lit <= 0 ? START_BALANCE : SYLLABLE_STOPS[lit - 1].balance;
}

function SunRays({ balance, lit, isDone }) {
  const sunX = sunLeftPct(balance);
  const sunY = SUN_TOP_PCT;
  const leftBirdX = 22;
  const rightBirdX = 78;
  const progress = lit / SYLLABLE_STOPS.length;

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

function SunHandle({ balance, isBalanced }) {
  return (
    <div
      className={`sama-handle${isBalanced ? ' is-balanced' : ''}`}
      style={{ left: `${sunLeftPct(balance)}%`, top: `${SUN_TOP_PCT}%` }}
      aria-hidden="true"
    >
      <div className="sama-handle-core">
        <img className="sama-handle-sun-img" src={sunImg} alt="" />
      </div>
    </div>
  );
}

function SyllableDots({ lit, enabled, hintLevel = 0, onTap }) {
  return (
    <div className="sama-snap-dots">
      {SYLLABLE_STOPS.map((s, i) => {
        const isNext = enabled && i === lit;
        const isLit = i < lit;
        const isCurrent = i === lit - 1;
        const isHint = isNext && hintLevel >= 2;
        return (
          <button
            key={i}
            type="button"
            className={`sama-snap-dot${isLit ? ' is-lit' : ''}${isCurrent ? ' is-current' : ''}${isNext ? ' is-next' : ''}${isHint ? ' is-hint' : ''}`}
            style={{ left: `${sunLeftPct(s.balance)}%` }}
            aria-label={isNext ? `Play syllable ${SYLLABLES[i]}` : undefined}
            disabled={!isNext}
            onPointerDown={isNext ? () => onTap(i) : undefined}
          />
        );
      })}
    </div>
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
  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const litRef = useRef(0);
  const firstInteractionSentRef = useRef(false);
  const doneAnnouncedRef = useRef(false);
  const lastSyllableDoneRef = useRef(false);
  const completionVoStartedRef = useRef(false);
  const completionFinishedRef = useRef(false);
  const sylEndFallbackRef = useRef(null);
  const voFallbackRef = useRef(null);
  isPausedRef.current = isPaused;

  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState('play');
  const [birdState, setBirdState] = useState('cold');
  const onGameCompleteRef = useRef(onGameComplete);
  const onPhaseCompleteRef = useRef(onPhaseComplete);

  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? `stop-${lit}` : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15000,
    level3Delay: 22000,
  });

  // Escalated idle hint: repeat the spoken cue once per escalation level
  const lastHintVoLevelRef = useRef(0);
  useEffect(() => {
    if (!isActive || phase !== 'play') {
      lastHintVoLevelRef.current = 0;
      return;
    }
    if (hintLevel >= 2 && hintLevel > lastHintVoLevelRef.current) {
      lastHintVoLevelRef.current = hintLevel;
      playSceneLine?.('scene11_sama_hint');
    }
  }, [hintLevel, isActive, phase, playSceneLine]);

  useEffect(() => {
    litRef.current = lit;
  }, [lit]);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
    onPhaseCompleteRef.current = onPhaseComplete;
  }, [onGameComplete, onPhaseComplete]);

  const balance = balanceForLit(lit);
  const leftBrightness = 1 - balance;
  const rightBrightness = balance;
  const litCount = lit;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const safeAfter = useCallback((ms, fn) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  // Tap the next circle -> light that syllable, slide the sun onto it.
  const tapCircle = useCallback((index) => {
    if (phase !== 'play' || isPausedRef.current || doneCalledRef.current) return;
    if (index !== litRef.current) return;

    if (!firstInteractionSentRef.current) {
      firstInteractionSentRef.current = true;
      onFirstInteraction?.();
    }
    markInteraction();

    const next = index + 1;
    litRef.current = next;
    setLit(next);

    window.setTimeout(() => onMicroWin?.(), 0);

    setBirdState(next >= 2 ? 'warm' : 'cold');

    if (next === SYLLABLE_STOPS.length && !doneCalledRef.current) {
      doneCalledRef.current = true;
      safeAfter(300, () => {
        setPhase('done');
        setBirdState('done');
      });
    }
  }, [markInteraction, onFirstInteraction, onMicroWin, phase, safeAfter]);

  // Reset on deactivate
  useEffect(() => {
    if (!isActive) {
      clearTimers();
      doneCalledRef.current = false;
      doneAnnouncedRef.current = false;
      lastSyllableDoneRef.current = false;
      completionVoStartedRef.current = false;
      completionFinishedRef.current = false;
      firstInteractionSentRef.current = false;
      setLit(0);
      litRef.current = 0;
      setPhase('play');
      setBirdState('cold');
    }
  }, [isActive, clearTimers]);

  useEffect(() => () => {
    clearTimers();
    if (sylEndFallbackRef.current) window.clearTimeout(sylEndFallbackRef.current);
    if (voFallbackRef.current) window.clearTimeout(voFallbackRef.current);
  }, [clearTimers]);

  // Completion audio plays strictly in sequence, no overlap:
  //   final syllable "bha"  ->  full word "samaprabha"  ->  ending line
  // Fires only once the last syllable clip has finished AND the win is
  // announced — same pattern as SuryakotiGame / NirvighnamGame. (The earlier
  // version played no word and let the ending line start over "bha".)
  const startCompletionVo = useCallback(() => {
    if (completionVoStartedRef.current) return;
    if (!lastSyllableDoneRef.current || !doneAnnouncedRef.current) return;
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

    // iOS Safari can silently drop utterance onend/onerror — don't hang.
    voFallbackRef.current = window.setTimeout(finish, 10000);
  }, [playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'done' || doneAnnouncedRef.current) return undefined;
    doneAnnouncedRef.current = true;

    // Hold the word/ending line until the final "bha" syllable clip has
    // finished (its onSyllableLit onEnded sets lastSyllableDoneRef). Fallback
    // covers a dropped callback (audio error / iOS / test mock).
    sylEndFallbackRef.current = window.setTimeout(() => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    }, 1600);
    startCompletionVo();

    return undefined;
  }, [phase, startCompletionVo]);

  if (!isActive) return null;

  return (
    <div className={`sama-game${hideElements ? ' is-hidden' : ''}`}>
      <div
        className="sama-stage"
        style={{ backgroundImage: `url(${sharedSceneBg})` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="sama-skywash" />
        <div
          className={`sama-stage-glow${phase === 'done' ? ' is-done' : ''}`}
          style={{ opacity: clamp(0.1 + (1 - Math.abs(leftBrightness - rightBrightness)) * 0.85, 0.1, 1) }}
        />

        <SunRays balance={balance} lit={lit} isDone={phase === 'done'} />

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
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

        {phase === 'play' && (
          <p className="sama-hint">
            {lit <= 1
              ? 'Tap the next glowing dot.'
              : `Tap the next glowing dot — ${SYLLABLE_STOPS.length - lit} to go.`}
          </p>
        )}

        {phase === 'done' && (
          <p className="sama-doneline is-visible">Both shine equally now!</p>
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

        <SyllableDots
          lit={lit}
          enabled={phase === 'play'}
          hintLevel={hintLevel}
          onTap={tapCircle}
        />

        <Bird side="left" brightness={leftBrightness} birdState={birdState} />
        <Bird side="right" brightness={rightBrightness} birdState={birdState} />

        <SunHandle balance={balance} isBalanced={phase === 'done'} />

        <GestureDemo
          type="tap"
          from={{ x: sunLeftPct(SYLLABLE_STOPS[0].balance), y: SUN_TOP_PCT }}
          active={phase === 'play' && lit === 0}
          idleDelay={3000}
        />
      </div>
    </div>
  );
}
