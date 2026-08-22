// zones/symbol-mountain/scenes/symbol/EarsSoundMatchGame.jsx
// Ears Directional Listening Game: hear a sound from a hidden spot, then tap where it came from.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EarsSoundMatchGame.css';

// Animals found through listening. Eye keeps peacock + monkey.
import elephantImg from './assets/images/elephant-new1.webp';
import cowImg from './assets/images/cow-new.webp';

// Environment layers
import bgBackImg from './assets/images/trail-bg.webp';
import backRocksImg from './assets/images/trail-back.webp';
import middleRocksImg from './assets/images/trail-mid.webp';
import frontRocksImg from './assets/images/trail-front.webp';

// Neutral hiding spot art: these reveal nothing about the animal behind them.
import rockSpotImg from './assets/images/trail-blockage-no-rocks.webp';
import bushSpotImg from './assets/images/obstacle-bush-clean.webp';
import caveSpotImg from './assets/images/rock-background.webp';

import { ANIMAL_SIZES } from './animalConfig';

// Real animal calls
import soundElephant from './assets/audio/sound-elephant.webm';
import soundCow from './assets/audio/sound-cow.webm';

// Decoy / ambient sounds
import decoyWind from './assets/audio/dragon-studio-wind-gust-386158.mp3';
import decoyRustle from './assets/audio/dragon-studio-dry-grass-rustling-478361.mp3';

const SOUND_PATHS = {
  elephant: soundElephant,
  cow: soundCow
};

const VO_PATHS = {
  intro: null,
  elephant: null,
  cow: null
};

const VO_TEXTS = {
  intro: 'Now listen closely. Tap where you hear the sound.',
  elephant: 'Elephant',
  cow: 'Cow'
};

const ANIMALS = [
  { id: 'elephant', name: 'Elephant', img: elephantImg, sound: SOUND_PATHS.elephant, vo: VO_PATHS.elephant },
  { id: 'cow', name: 'Cow', img: cowImg, sound: SOUND_PATHS.cow, vo: VO_PATHS.cow }
];

const HIDE_SPOTS = [
  { id: 'left-rocks', x: 23, y: 61, img: rockSpotImg, scale: 1.15 },
  { id: 'middle-bush', x: 54, y: 59, img: bushSpotImg, scale: 0.95 },
  { id: 'right-cave', x: 80, y: 64, img: caveSpotImg, scale: 0.82 }
];

const DECOY_SOUNDS = [decoyWind, decoyRustle];
const ROUND_STEP_GAP_MS = 520;
const WRONG_FEEDBACK_MS = 420;
const INTRO_TO_SEQUENCE_DELAY_MS = 900;
const ANIMAL_SOUND_VOLUME = 0.65;
const DECOY_VOLUME = 0.42;

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const speakFallback = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
};

const EarsSoundMatchGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [spotAssignments, setSpotAssignments] = useState(() => {
    const shuffledSpots = shuffle(HIDE_SPOTS);
    return ANIMALS.map((animal, index) => ({ animal, spot: shuffledSpots[index] }));
  });
  const [roundOrder, setRoundOrder] = useState(() => shuffle(ANIMALS.map((a) => a.id)));
  const [currentRound, setCurrentRound] = useState(0);
  const [found, setFound] = useState(new Set());
  const [revealedAnimalIds, setRevealedAnimalIds] = useState(new Set());
  const [introShown, setIntroShown] = useState(false);
  const [playingSpotId, setPlayingSpotId] = useState(null);
  const [currentStepIsTarget, setCurrentStepIsTarget] = useState(false);
  const [wrongSpotId, setWrongSpotId] = useState(null);

  const currentSoundRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const wrongResetTimerRef = useRef(null);
  const audioFallbackTimerRef = useRef(null);
  const sequenceRunIdRef = useRef(0);

  const currentTargetId = roundOrder[currentRound];
  const currentAssignment = spotAssignments.find((assignment) => assignment.animal.id === currentTargetId);

  const clearSequenceTimer = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, []);

  const clearAudioFallbackTimer = useCallback(() => {
    if (audioFallbackTimerRef.current) {
      clearTimeout(audioFallbackTimerRef.current);
      audioFallbackTimerRef.current = null;
    }
  }, []);

  const stopCurrentAudio = useCallback(() => {
    clearAudioFallbackTimer();
    if (currentSoundRef.current) {
      try {
        currentSoundRef.current.onended = null;
        currentSoundRef.current.onerror = null;
        currentSoundRef.current.pause();
        currentSoundRef.current.currentTime = 0;
      } catch {}
      currentSoundRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, [clearAudioFallbackTimer]);

  const playGameAudio = useCallback((src, volume = 0.9, fallbackText = '', onEnded = null) => {
    stopCurrentAudio();

    const finishOnce = (() => {
      let finished = false;
      return () => {
        if (finished) return;
        finished = true;
        clearAudioFallbackTimer();
        currentSoundRef.current = null;
        onEnded?.();
      };
    })();

    if (!isAudioOn) {
      if (onEnded) {
        audioFallbackTimerRef.current = setTimeout(finishOnce, 900);
      }
      return null;
    }

    if (!src) {
      speakFallback(fallbackText);
      if (onEnded) {
        audioFallbackTimerRef.current = setTimeout(finishOnce, 900);
      }
      return null;
    }

    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.onended = finishOnce;
      audio.onerror = () => {
        speakFallback(fallbackText);
        finishOnce();
      };
      audio.play().catch(() => {
        speakFallback(fallbackText);
        finishOnce();
      });
      currentSoundRef.current = audio;
      return audio;
    } catch {
      speakFallback(fallbackText);
      finishOnce();
      return null;
    }
  }, [clearAudioFallbackTimer, isAudioOn, stopCurrentAudio]);

  const playIntro = useCallback(() => {
    playGameAudio(VO_PATHS.intro, 0.95, VO_TEXTS.intro);
  }, [playGameAudio]);

  const resetSession = useCallback(() => {
    stopCurrentAudio();
    clearSequenceTimer();
    const shuffledSpots = shuffle(HIDE_SPOTS);
    setSpotAssignments(ANIMALS.map((animal, index) => ({ animal, spot: shuffledSpots[index] })));
    setRoundOrder(shuffle(ANIMALS.map((a) => a.id)));
    setCurrentRound(0);
    setFound(new Set());
    setRevealedAnimalIds(new Set());
    setIntroShown(false);
    setPlayingSpotId(null);
    setCurrentStepIsTarget(false);
    setWrongSpotId(null);
    sequenceRunIdRef.current += 1;
  }, [clearSequenceTimer, stopCurrentAudio]);

  useEffect(() => {
    if (!isActive) return;
    resetSession();
  }, [isActive, resetSession]);

  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playIntro();
  }, [isActive, introShown, playIntro]);

  const playRoundSequence = useCallback(() => {
    if (!isActive || !currentAssignment || found.has(currentTargetId)) return;

    const runId = sequenceRunIdRef.current;
    const targetSpotId = currentAssignment.spot.id;
    const otherSpotIds = HIDE_SPOTS.filter((spot) => spot.id !== targetSpotId).map((spot) => spot.id);
    const decoySteps = shuffle(otherSpotIds).slice(0, 2).map((spotId) => ({
      spotId,
      isTarget: false,
      sound: DECOY_SOUNDS[Math.floor(Math.random() * DECOY_SOUNDS.length)],
      volume: DECOY_VOLUME
    }));
    const sequence = shuffle([
      ...decoySteps,
      {
        spotId: targetSpotId,
        isTarget: true,
        sound: currentAssignment.animal.sound,
        volume: ANIMAL_SOUND_VOLUME
      }
    ]);

    let stepIndex = 0;
    const runStep = () => {
      if (runId !== sequenceRunIdRef.current) return;

      if (stepIndex >= sequence.length) {
        setPlayingSpotId(null);
        setCurrentStepIsTarget(false);
        sequenceTimerRef.current = setTimeout(() => {
          if (runId === sequenceRunIdRef.current && !found.has(currentTargetId)) {
            playRoundSequence();
          }
        }, ROUND_STEP_GAP_MS);
        return;
      }

      const step = sequence[stepIndex];
      setPlayingSpotId(step.spotId);
      setCurrentStepIsTarget(step.isTarget);

      const advance = () => {
        if (runId !== sequenceRunIdRef.current) return;
        setPlayingSpotId(null);
        setCurrentStepIsTarget(false);
        stepIndex += 1;
        sequenceTimerRef.current = setTimeout(runStep, ROUND_STEP_GAP_MS);
      };

      playGameAudio(step.sound, step.volume, '', advance);
    };

    runStep();
  }, [currentAssignment, currentTargetId, found, isActive, playGameAudio]);

  useEffect(() => {
    if (!isActive || !introShown || currentRound >= ANIMALS.length) return;
    clearSequenceTimer();
    setPlayingSpotId(null);
    setCurrentStepIsTarget(false);
    sequenceRunIdRef.current += 1;

    sequenceTimerRef.current = setTimeout(playRoundSequence, INTRO_TO_SEQUENCE_DELAY_MS);

    return () => {
      clearSequenceTimer();
    };
  }, [clearSequenceTimer, currentRound, introShown, isActive, playRoundSequence]);

  useEffect(() => {
    if (found.size === ANIMALS.length && onGameComplete) {
      const completionTimer = setTimeout(() => {
        onGameComplete({
          matchedAnimals: Array.from(found),
          totalMatched: ANIMALS.length
        });
      }, 1500);
      return () => clearTimeout(completionTimer);
    }
  }, [found, onGameComplete]);

  const handleSpotTap = useCallback((spotId, e) => {
    e?.stopPropagation();
    if (!isActive || currentRound >= ANIMALS.length || !currentAssignment) return;

    const isCorrect = playingSpotId === spotId && currentStepIsTarget;

    if (isCorrect) {
      sequenceRunIdRef.current += 1;
      clearSequenceTimer();
      setPlayingSpotId(null);
      setCurrentStepIsTarget(false);
      playGameAudio(currentAssignment.animal.vo, 0.95, VO_TEXTS[currentAssignment.animal.id]);
      setFound((prev) => new Set([...prev, currentTargetId]));
      setRevealedAnimalIds((prev) => new Set([...prev, currentTargetId]));

      sequenceTimerRef.current = setTimeout(() => {
        setCurrentRound((round) => round + 1);
      }, 1200);
      return;
    }

    if (playingSpotId) {
      setWrongSpotId(spotId);
      if (wrongResetTimerRef.current) clearTimeout(wrongResetTimerRef.current);
      wrongResetTimerRef.current = setTimeout(() => {
        setWrongSpotId(null);
        wrongResetTimerRef.current = null;
      }, WRONG_FEEDBACK_MS);
    }
  }, [
    clearSequenceTimer,
    currentAssignment,
    currentRound,
    currentStepIsTarget,
    currentTargetId,
    isActive,
    playGameAudio,
    playingSpotId
  ]);

  useEffect(() => () => {
    sequenceRunIdRef.current += 1;
    stopCurrentAudio();
    clearSequenceTimer();
    if (wrongResetTimerRef.current) clearTimeout(wrongResetTimerRef.current);
  }, [clearSequenceTimer, stopCurrentAudio]);

  if (hideElements || !isActive) return null;

  return (
    <div className={`ears-sound-game ${className}`}>
      <img className="ears-sound-layer ears-sound-layer-back" src={bgBackImg} alt="" />
      <img className="ears-sound-layer ears-sound-layer-back-rocks" src={backRocksImg} alt="" />
      <img className="ears-sound-layer ears-sound-layer-middle" src={middleRocksImg} alt="" />

      {HIDE_SPOTS.map((spot) => {
        const assignment = spotAssignments.find((item) => item.spot.id === spot.id);
        const animal = assignment?.animal;
        const isFound = animal && revealedAnimalIds.has(animal.id);
        const isPlaying = playingSpotId === spot.id;
        const isWrong = wrongSpotId === spot.id;

        return (
          <button
            key={spot.id}
            type="button"
            className={`ears-hide-spot ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isFound ? 'found' : ''}`}
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              '--spot-scale': spot.scale,
              '--animal-scale': animal ? ANIMAL_SIZES[animal.id] || 1 : 1
            }}
            onClick={(e) => handleSpotTap(spot.id, e)}
            aria-label={isFound && animal ? `${animal.name} found` : 'Hidden listening spot'}
          >
            <span className="ears-hide-spot-pulse-ring" aria-hidden="true" />
            <img src={spot.img} alt="" className="ears-hide-spot-art" draggable={false} />
            {isFound && animal && (
              <img
                src={animal.img}
                alt={animal.name}
                className="ears-hide-spot-animal-reveal"
                draggable={false}
              />
            )}
          </button>
        );
      })}

      <img className="ears-sound-layer ears-sound-layer-front" src={frontRocksImg} alt="" />
    </div>
  );
};

export default EarsSoundMatchGame;
