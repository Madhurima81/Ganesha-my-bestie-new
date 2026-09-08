import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import './SamaprabhaGame.css';

import bgImg from '../assets/images/Samaprabha/samaprabha-bg.webp';
import fawnWorriedImg from '../assets/images/Samaprabha/fawn-worried.webp';
import fawnHappyImg from '../assets/images/Samaprabha/fawn-happy.webp';
import fawnWalkImg from '../assets/images/Samaprabha/fawn-walk.webp';
import shadowImg from '../assets/images/Samaprabha/shadow.webp';
import mysterySourceFullImg from '../assets/images/Samaprabha/mystery-source-full.webp';
import branchImg from '../assets/images/Samaprabha/reveal-branch.webp';
import reedsLeavesImg from '../assets/images/Samaprabha/reveal-reeds-leaves.webp';
import stumpImg from '../assets/images/Samaprabha/reveal-stump.webp';
import rocksGrassImg from '../assets/images/Samaprabha/reveal-rocks-grass.webp';

const SYLLABLES = ['Sa', 'ma', 'pra', 'bha'];
const AUDIO = { syllables: ['sa', 'ma', 'pra', 'bha'] };
const HOLD_MS = 1150;

// These are invisible discovery zones. Tune cx/cy/rx/ry once final art lands.
const CLUES = [
  { id: 'branch', label: 'branch', img: branchImg, cx: 75, cy: 47, rx: 11, ry: 9, hintW: 18, hintH: 20 },
  { id: 'reeds-leaves', label: 'reeds and leaves', img: reedsLeavesImg, cx: 86, cy: 51, rx: 11, ry: 12, hintW: 18, hintH: 24 },
  { id: 'stump', label: 'stump', img: stumpImg, cx: 82, cy: 62, rx: 11, ry: 10, hintW: 19, hintH: 21 },
  { id: 'rocks', label: 'rocks and grass', img: rocksGrassImg, cx: 76, cy: 67, rx: 12, ry: 8, hintW: 21, hintH: 17 },
];

const START_BEAM = { x: 31, y: 57 };

function pointInsideClue(point, clue) {
  if (!clue) return false;
  const dx = (point.x - clue.cx) / clue.rx;
  const dy = (point.y - clue.cy) / clue.ry;
  return dx * dx + dy * dy <= 1;
}

function Animal({ animalState }) {
  const src =
    animalState === 'walking'
      ? fawnWalkImg
      : animalState === 'worried'
        ? fawnWorriedImg
        : fawnHappyImg;

  return (
    <div className={`sama-animal is-${animalState}`} aria-hidden="true">
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
  const onGameCompleteRef = useRef(onGameComplete);
  const onPhaseCompleteRef = useRef(onPhaseComplete);

  isPausedRef.current = isPaused;

  const activeClue = phase === 'play' && lit < CLUES.length ? CLUES[lit] : null;

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
    if (currentIndex >= CLUES.length) return;

    const next = currentIndex + 1;
    litRef.current = next;
    setLit(next);
    setRevealPulse(currentIndex);

    safeAfter(480, () => setRevealPulse(null));
    window.setTimeout(() => onMicroWin?.(), 0);
    markInteraction();

    if (next === CLUES.length && !doneCalledRef.current) {
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
  }, [cancelHold, markInteraction, phase, revealCurrentClue]);

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
          litCount={lit}
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

        <Animal animalState={animalState} />

        <div className={`sama-shadow${phase !== 'play' ? ' is-understood' : ''}`} aria-hidden="true">
          <img src={shadowImg} alt="" draggable={false} />
        </div>

        <div className={`sama-mystery${phase !== 'play' ? ' is-understood' : ''}`} aria-hidden="true">
          <img className="sama-full-source" src={mysterySourceFullImg} alt="" draggable={false} />
          {CLUES.map((clue, index) => (
            <TruthLayer
              key={clue.id}
              clue={clue}
              isRevealed={index < lit}
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

        {phase === 'done' && (
          <p className="sama-doneline is-visible">Now you can see clearly.</p>
        )}
      </div>
    </div>
  );
}
