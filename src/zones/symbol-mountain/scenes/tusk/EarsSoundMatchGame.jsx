// zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx
// Ear listening game: hear all sources first, then choose the animal sound.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './EarsSoundMatchGame.css';

import bgImg from './assets/images/ears-game/symbol_mountain_3_bg.png';
import leftBushImg from './assets/images/ears-game/left_bush.png';
import centerRockImg from './assets/images/ears-game/center_rock_cluster.png';
import pondPatchImg from './assets/images/ears-game/right_pond_water_patch.png';
import caveNookImg from './assets/images/ears-game/right_cave_nook.png';
import cowRestingImg from './assets/images/ears-game/cow_01_resting.png';
import cowLooksImg from './assets/images/ears-game/cow_02_looks_toward_grass.png';
import cowNibblesImg from './assets/images/ears-game/cow_03_starts_nibbling.png';
import cowChewsImg from './assets/images/ears-game/cow_04_chews_happily.png';
import cowIdleImg from './assets/images/ears-game/cow_05_idle_with_grass.png';
import elephantRestingImg from './assets/images/ears-game/elephant_01_resting.png';
import elephantNoticesImg from './assets/images/ears-game/elephant_02_notices_water.png';
import elephantDrinksImg from './assets/images/ears-game/elephant_03_drinks_or_dips_trunk.png';
import elephantSpraysImg from './assets/images/ears-game/elephant_04_sprays_water.png';
import elephantIdleImg from './assets/images/ears-game/elephant_05_idle_with_water.png';
import soundElephant from './assets/audio/sound-elephant.webm';
import soundCow from './assets/audio/sound-cow.webm';
import decoyWind from './assets/audio/dragon-studio-wind-gust-386158.mp3';
import decoyRustle from './assets/audio/dragon-studio-dry-grass-rustling-478361.mp3';
import { ANIMAL_POSITIONS } from './animalPositions';

const PHASE = {
  LISTENING: 'listening',
  CHOOSING: 'choosing',
  REVEALING: 'revealing',
  COMPLETE: 'complete'
};

const BASE_SOURCES = {
  leftBush: { id: 'leftBush', label: 'Left bush', img: leftBushImg, x: 24, y: 62, w: 20 },
  centerRock: { id: 'centerRock', label: 'Center rock', img: centerRockImg, x: 49, y: 72, w: 21 },
  rightPond: { id: 'rightPond', label: 'Water patch', img: pondPatchImg, x: 75, y: 75, w: 21 },
  rightCave: { id: 'rightCave', label: 'Cave nook', img: caveNookImg, x: 78, y: 56, w: 20 }
};

const ROUNDS = [
  {
    id: 'elephant',
    label: 'Elephant',
    prompt: 'Listen for the animal near the water.',
    targetSourceId: 'rightPond',
    sources: [
      { ...BASE_SOURCES.leftBush, sound: decoyRustle, kind: 'decoy' },
      { ...BASE_SOURCES.centerRock, sound: decoyWind, kind: 'decoy' },
      { ...BASE_SOURCES.rightPond, sound: soundElephant, kind: 'target' }
    ],
    frames: [elephantRestingImg, elephantNoticesImg, elephantDrinksImg, elephantSpraysImg, elephantIdleImg],
    revealX: 73,
    revealY: 59,
    revealW: 27
  },
  {
    id: 'cow',
    label: 'Cow',
    prompt: 'Listen for the animal near the grass.',
    targetSourceId: 'rightCave',
    sources: [
      { ...BASE_SOURCES.leftBush, sound: decoyWind, kind: 'decoy' },
      { ...BASE_SOURCES.centerRock, sound: decoyRustle, kind: 'decoy' },
      { ...BASE_SOURCES.rightCave, sound: soundCow, kind: 'target' }
    ],
    frames: [cowRestingImg, cowLooksImg, cowNibblesImg, cowChewsImg, cowIdleImg],
    revealX: 41,
    revealY: 67,
    revealW: 18
  }
];

const VO_TEXTS = {
  intro: 'Listen closely. Hear each place first. Then choose the animal sound.',
  choose: 'Now choose the animal sound.',
  neutral: 'Good listening. Try another sound source.',
  hint: 'Listen for the animal sound.',
  complete: 'You listened carefully and found what mattered.',
  elephant: 'Elephant',
  cow: 'Cow'
};

const BETWEEN_SOUND_MS = 560;
const INTRO_DELAY_MS = 700;
const REVEAL_FRAME_MS = 420;
const NEXT_ROUND_DELAY_MS = 1350;
const COMPLETE_DELAY_MS = 1500;
const HINT_REPLAY_MS = 10000;
const HINT_TEXT_MS = 18000;
const HINT_TARGET_MS = 26000;

const speakFallback = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis is optional.
  }
};

const EarsSoundMatchGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  onAnimalPositionsChange,
  hideElements = false,
  className = ''
}) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.LISTENING);
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [wrongSourceId, setWrongSourceId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [revealFrameByAnimal, setRevealFrameByAnimal] = useState({});
  const [hintSourceId, setHintSourceId] = useState(null);

  const audioRef = useRef(null);
  const timersRef = useRef([]);
  const runIdRef = useRef(0);
  const chooseStartedAtRef = useRef(Date.now());
  const hintStageRef = useRef(0);
  const completedRef = useRef(false);

  const round = ROUNDS[roundIndex];
  const completedIds = useMemo(() => new Set(completedRounds), [completedRounds]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter((item) => item !== timer);
      fn();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // Audio cleanup is best-effort.
      }
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text) => {
    if (!isAudioOn) return;
    speakFallback(text);
  }, [isAudioOn]);

  const playSound = useCallback((src, fallbackText = '', onDone = null, volume = 0.72) => {
    stopAudio();

    const finish = (() => {
      let done = false;
      return () => {
        if (done) return;
        done = true;
        audioRef.current = null;
        onDone?.();
      };
    })();

    if (!isAudioOn || !src) {
      if (fallbackText) speakFallback(fallbackText);
      schedule(finish, 850);
      return;
    }

    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.onended = finish;
      audio.onerror = finish;
      audio.play().catch(finish);
      audioRef.current = audio;
    } catch {
      finish();
    }
  }, [isAudioOn, schedule, stopAudio]);

  const showFeedback = useCallback((message) => {
    setFeedback(message);
    schedule(() => setFeedback(''), 1500);
  }, [schedule]);

  const playSequence = useCallback((targetRound, afterSequence = null) => {
    if (!isActive || !targetRound) return;
    runIdRef.current += 1;
    const runId = runIdRef.current;
    clearTimers();
    stopAudio();
    setPhase(PHASE.LISTENING);
    setHintSourceId(null);
    setWrongSourceId(null);
    setFeedback(targetRound.prompt);

    let index = 0;
    const playNext = () => {
      if (runId !== runIdRef.current) return;
      if (index >= targetRound.sources.length) {
        setActiveSourceId(null);
        setPhase(PHASE.CHOOSING);
        chooseStartedAtRef.current = Date.now();
        hintStageRef.current = 0;
        setFeedback(VO_TEXTS.choose);
        speak(VO_TEXTS.choose);
        afterSequence?.();
        return;
      }

      const source = targetRound.sources[index];
      setActiveSourceId(source.id);
      playSound(source.sound, '', () => {
        if (runId !== runIdRef.current) return;
        setActiveSourceId(null);
        index += 1;
        schedule(playNext, BETWEEN_SOUND_MS);
      }, source.kind === 'target' ? 0.68 : 0.42);
    };

    schedule(playNext, index === 0 ? 240 : BETWEEN_SOUND_MS);
  }, [clearTimers, isActive, playSound, schedule, speak, stopAudio]);

  const resetGame = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
    completedRef.current = false;
    setRoundIndex(0);
    setPhase(PHASE.LISTENING);
    setActiveSourceId(null);
    setCompletedRounds([]);
    setWrongSourceId(null);
    setFeedback('');
    setRevealFrameByAnimal({});
    setHintSourceId(null);
    chooseStartedAtRef.current = Date.now();
    hintStageRef.current = 0;
  }, [clearTimers, stopAudio]);

  useEffect(() => {
    if (!isActive) return;
    resetGame();
    speak(VO_TEXTS.intro);
    schedule(() => playSequence(ROUNDS[0]), INTRO_DELAY_MS);
  }, [isActive, playSequence, resetGame, schedule, speak]);

  useEffect(() => {
    if (!isActive || phase !== PHASE.CHOOSING || !round) return;

    const tick = () => {
      const waitingMs = Date.now() - chooseStartedAtRef.current;
      if (waitingMs >= HINT_TARGET_MS && hintStageRef.current < 3) {
        hintStageRef.current = 3;
        const targetSource = round.sources.find((source) => source.id === round.targetSourceId);
        setHintSourceId(targetSource?.id || null);
        if (targetSource) {
          playSound(targetSource.sound, VO_TEXTS[round.id], () => {
            schedule(() => playSequence(round), BETWEEN_SOUND_MS);
          }, 0.68);
        }
        chooseStartedAtRef.current = Date.now();
      } else if (waitingMs >= HINT_TEXT_MS && hintStageRef.current < 2) {
        hintStageRef.current = 2;
        showFeedback(VO_TEXTS.hint);
        speak(VO_TEXTS.hint);
      } else if (waitingMs >= HINT_REPLAY_MS && hintStageRef.current < 1) {
        hintStageRef.current = 1;
        playSequence(round);
      }
    };

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isActive, phase, playSequence, playSound, round, schedule, showFeedback, speak]);

  useEffect(() => () => {
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
  }, [clearTimers, stopAudio]);

  const startReveal = useCallback((animalRound) => {
    if (!animalRound) return;
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
    setPhase(PHASE.REVEALING);
    setActiveSourceId(null);
    setHintSourceId(null);
    setWrongSourceId(null);
    setRevealFrameByAnimal((prev) => ({ ...prev, [animalRound.id]: 0 }));
    speak(VO_TEXTS[animalRound.id]);

    let frame = 0;
    const advanceFrame = () => {
      frame += 1;
      setRevealFrameByAnimal((prev) => ({
        ...prev,
        [animalRound.id]: Math.min(frame, animalRound.frames.length - 1)
      }));
      if (frame < animalRound.frames.length - 1) {
        schedule(advanceFrame, REVEAL_FRAME_MS);
      }
    };

    schedule(advanceFrame, REVEAL_FRAME_MS);
    schedule(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex >= ROUNDS.length) {
        setPhase(PHASE.COMPLETE);
        showFeedback(VO_TEXTS.complete);
        speak(VO_TEXTS.complete);

        const positions = {
          elephant: ANIMAL_POSITIONS.elephant,
          cow: ANIMAL_POSITIONS.cow
        };
        onAnimalPositionsChange?.(positions);

        schedule(() => {
          if (completedRef.current) return;
          completedRef.current = true;
          onGameComplete?.({
            matchedAnimals: ROUNDS.map((item) => item.id),
            totalMatched: ROUNDS.length,
            animalPositions: positions
          });
        }, COMPLETE_DELAY_MS);
        return;
      }

      setRoundIndex(nextIndex);
      playSequence(ROUNDS[nextIndex]);
    }, (animalRound.frames.length * REVEAL_FRAME_MS) + NEXT_ROUND_DELAY_MS);
  }, [clearTimers, onAnimalPositionsChange, onGameComplete, playSequence, roundIndex, schedule, showFeedback, speak, stopAudio]);

  const handleSourceTap = useCallback((source, e) => {
    e.stopPropagation();
    if (!round || phase !== PHASE.CHOOSING) return;

    if (source.id !== round.targetSourceId) {
      setWrongSourceId(source.id);
      showFeedback(VO_TEXTS.neutral);
      speak(VO_TEXTS.neutral);
      schedule(() => setWrongSourceId(null), 520);
      return;
    }

    setCompletedRounds((prev) => [...prev, round.id]);
    showFeedback(`${round.label} found.`);
    startReveal(round);
  }, [phase, round, schedule, showFeedback, speak, startReveal]);

  if (hideElements || !isActive) return null;

  return (
    <div className={`ears-sound-game ${className}`}>
      <img className="ears-game-bg" src={bgImg} alt="" draggable={false} />

      <div className="ears-game-prompt">
        <span>
          {phase === PHASE.LISTENING
            ? 'Listen to each sound'
            : phase === PHASE.CHOOSING
              ? 'Choose the animal sound'
              : phase === PHASE.REVEALING
                ? 'You found it'
                : 'You listened carefully'}
        </span>
        <strong>{completedRounds.length}/{ROUNDS.length}</strong>
      </div>

      {round?.sources.map((source, index) => {
        const isPlaying = activeSourceId === source.id;
        const isWrong = wrongSourceId === source.id;
        const isHinted = hintSourceId === source.id;
        const locked = phase !== PHASE.CHOOSING;

        return (
          <button
            key={`${round.id}-${source.id}`}
            type="button"
            className={`ears-source ${locked ? 'locked' : 'ready'} ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''}`}
            style={{ left: `${source.x}%`, top: `${source.y}%`, width: `${source.w}%`, '--source-index': index + 1 }}
            onClick={(e) => handleSourceTap(source, e)}
            disabled={locked}
            aria-label={source.label}
          >
            <span className="ears-source-number">{index + 1}</span>
            <span className="ears-source-pulse" aria-hidden="true" />
            <img src={source.img} alt="" draggable={false} />
          </button>
        );
      })}

      {ROUNDS.map((animalRound) => {
        if (!completedIds.has(animalRound.id)) return null;
        const frameIndex = revealFrameByAnimal[animalRound.id] ?? animalRound.frames.length - 1;
        return (
          <div
            key={`reveal-${animalRound.id}`}
            className={`ears-animal-reveal ${animalRound.id}`}
            style={{
              left: `${animalRound.revealX}%`,
              top: `${animalRound.revealY}%`,
              width: `${animalRound.revealW}%`
            }}
          >
            <img src={animalRound.frames[frameIndex] || animalRound.frames[animalRound.frames.length - 1]} alt="" draggable={false} />
            <span className="ears-animal-sparkle" aria-hidden="true" />
          </div>
        );
      })}

      <div className="ears-found-tray" aria-hidden="true">
        {ROUNDS.map((animalRound) => (
          <div key={animalRound.id} className={`ears-found-slot ${completedIds.has(animalRound.id) ? 'filled' : ''}`}>
            {completedIds.has(animalRound.id) ? (
              <img src={animalRound.frames[animalRound.frames.length - 1]} alt="" />
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      {feedback && <div className="ears-soft-feedback">{feedback}</div>}
    </div>
  );
};

export default EarsSoundMatchGame;
