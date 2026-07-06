// zones/symbol-mountain/scenes/symbol/EarsSoundMatchGame.jsx
// 🎯 Ears Sound Match Game — hear an animal's sound, tap the right one
// Replaces EarsRhythmGame (musical instrument mechanic)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EarsSoundMatchGame.css';

// Animals
import peacockImg from './assets/images/peacock-new.png';
import monkeyImg from './assets/images/monkey-new.png';
import elephantImg from './assets/images/elephant-new1.png';
import cowImg from './assets/images/cow-new.png';
import replayIcon from './assets/images/replay.png';
import bgBackImg from './assets/images/trail-bg.png';
import backRocksImg from './assets/images/trail-back.png';
import middleRocksImg from './assets/images/trail-mid.png';
import frontRocksImg from './assets/images/trail-front.png';
import { ANIMAL_SIZES } from './animalConfig';
import { ANIMAL_POSITIONS_ARRAY } from './animalPositions';

// Animal sounds — imported through Vite so they are bundled and work in
// production (the old '/src/...' string paths 404'd on Netlify, leaving the
// sound-match game silent).
import soundPeacock from './assets/audio/sound-peacock.webm';
import soundMonkey from './assets/audio/sound-monkey.webm';
import soundElephant from './assets/audio/sound-elephant.webm';
import soundCow from './assets/audio/sound-cow.webm';

const SOUND_PATHS = {
  peacock: soundPeacock,
  monkey: soundMonkey,
  elephant: soundElephant,
  cow: soundCow
};

// VO — recorded files do not exist yet; null paths make the Web Speech
// fallback fire immediately instead of after a 404.
const VO_PATHS = {
  intro: null,
  peacock: null,
  monkey: null,
  elephant: null,
  cow: null,
  hintPeacock: null,
  hintMonkey: null,
  hintElephant: null,
  hintCow: null
};
const VO_TEXTS = {
  intro: 'Now use your ears. Tap the animal making that sound.',
  peacock: 'Peacock',
  monkey: 'Monkey',
  elephant: 'Elephant',
  cow: 'Cow',
  hintPeacock: 'The colorful bird.',
  hintMonkey: 'The one who loves bananas.',
  hintElephant: 'The one with a long trunk.',
  hintCow: 'The gentle one in the field.'
};

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const ANIMALS = [
  { id: 'peacock', name: 'Peacock', img: peacockImg, sound: SOUND_PATHS.peacock, vo: VO_PATHS.peacock },
  { id: 'monkey', name: 'Monkey', img: monkeyImg, sound: SOUND_PATHS.monkey, vo: VO_PATHS.monkey },
  { id: 'elephant', name: 'Elephant', img: elephantImg, sound: SOUND_PATHS.elephant, vo: VO_PATHS.elephant },
  { id: 'cow', name: 'Cow', img: cowImg, sound: SOUND_PATHS.cow, vo: VO_PATHS.cow }
];

const PLAY_DELAY_MS = 1500;        // delay before sound plays each round
const WRONG_FEEDBACK_MS = 900;     // wobble + replay delay
const IDLE_HINT_1_MS = 8000;       // first idle hint
const IDLE_HINT_2_MS = 14000;      // second idle hint (voice clue)
const ANIMAL_SOUND_VOLUME = 0.55;  // softer animal SFX volume

const IDLE_HINT_VO_BY_ANIMAL = {
  peacock: VO_PATHS.hintPeacock,
  monkey: VO_PATHS.hintMonkey,
  elephant: VO_PATHS.hintElephant,
  cow: VO_PATHS.hintCow
};
const POSITION_STORAGE_KEY = 'symbol_mountain_eyes_animal_positions_v2';

// Debug position editor — only with ?debug in the URL, never for children in prod.
const SHOW_EARS_DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
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

const playAudio = (src, volume = 0.9, fallbackText = '') => {
  if (!src) {
    speakFallback(fallbackText);
    return null;
  }
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.onerror = () => speakFallback(fallbackText);
    audio.play().catch(() => speakFallback(fallbackText));
    return audio;
  } catch {
    speakFallback(fallbackText);
    return null;
  }
};

const arrayToPositionMap = (positions) => Object.fromEntries(
  (positions || []).map((pos) => [pos.id, { x: pos.x, y: pos.y, ...(pos.depth ? { depth: pos.depth } : {}) }])
);

const defaultPositionMap = arrayToPositionMap(ANIMAL_POSITIONS_ARRAY);

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const EarsSoundMatchGame = ({
  isActive = true,
  onGameComplete,
  animalPositions = null,
  onAnimalPositionsChange,
  hideElements = false,
  className = ''
}) => {
  const [debugMode, setDebugMode] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(() => ANIMALS[0]?.id || null);
  // Randomized order of which animal to play each round (1 of each, 4 rounds)
  const [roundOrder, setRoundOrder] = useState(() => shuffle(ANIMALS.map(a => a.id)));
  const [currentRound, setCurrentRound] = useState(0); // 0..3
  const [matched, setMatched] = useState(new Set());
  const [wrongAnimal, setWrongAnimal] = useState(null); // animal id being shaken
  const [waitingForTap, setWaitingForTap] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [hintAnimalIds, setHintAnimalIds] = useState([]);
  const [idleHintStage, setIdleHintStage] = useState(0);
  const playTimerRef = useRef(null);
  const currentSoundRef = useRef(null);
  const idleHintTimerRef = useRef(null);
  const lastInteractionAtRef = useRef(Date.now());
  const dragTargetRef = useRef(null);
  const [editableAnimalPositions, setEditableAnimalPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(POSITION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...defaultPositionMap, ...parsed };
        }
      }
    } catch {}

    if (Array.isArray(animalPositions)) {
      return { ...defaultPositionMap, ...arrayToPositionMap(animalPositions) };
    }

    if (animalPositions && typeof animalPositions === 'object') {
      return { ...defaultPositionMap, ...animalPositions };
    }

    return defaultPositionMap;
  });

  const currentTargetId = roundOrder[currentRound];
  const currentTarget = ANIMALS.find(a => a.id === currentTargetId);

  const savePositions = useCallback((positions) => {
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
    } catch {}
    onAnimalPositionsChange?.(positions);
  }, [onAnimalPositionsChange]);

  const playIdleHintVo = useCallback((animalId) => {
    const src = IDLE_HINT_VO_BY_ANIMAL[animalId];
    if (!src) return;
    playAudio(src, 0.95, VO_TEXTS[`hint${animalId.charAt(0).toUpperCase()}${animalId.slice(1)}`]);
  }, []);

  const stopClueSpeech = useCallback(() => {
    // no-op: hints now use VO files, keeping this for existing call sites
  }, []);

  // New active session => reshuffle order and reset round state.
  useEffect(() => {
    if (!isActive) return;
    setRoundOrder(shuffle(ANIMALS.map(a => a.id)));
    setCurrentRound(0);
    setMatched(new Set());
    setWrongAnimal(null);
    setWaitingForTap(false);
    setShowReplay(false);
    setIntroShown(false);
    setHintAnimalIds([]);
    setIdleHintStage(0);
    lastInteractionAtRef.current = Date.now();
    stopClueSpeech();
  }, [isActive, stopClueSpeech]);

  // Intro VO + start first round
  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playAudio(VO_PATHS.intro, 0.95, VO_TEXTS.intro);
  }, [isActive, introShown]);

  // Play the target sound at the start of each round
  useEffect(() => {
    if (!isActive) return;
    if (currentRound >= 4) return;
    if (!currentTarget) return;

    setWaitingForTap(false);
    setShowReplay(false);
    setHintAnimalIds([]);
    setIdleHintStage(0);
    stopClueSpeech();

    playTimerRef.current = setTimeout(() => {
      currentSoundRef.current = playAudio(currentTarget.sound, ANIMAL_SOUND_VOLUME);
      setWaitingForTap(true);
      setShowReplay(true);
      lastInteractionAtRef.current = Date.now();
      setIdleHintStage(0);
    }, PLAY_DELAY_MS);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isActive, currentRound, currentTarget, stopClueSpeech]);

  // Win condition
  useEffect(() => {
    if (matched.size === 4 && onGameComplete) {
      const t = setTimeout(() => {
        onGameComplete({
          matchedAnimals: Array.from(matched),
          totalMatched: 4
        });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [matched, onGameComplete]);

  useEffect(() => {
    if (!isActive || !waitingForTap || !currentTargetId) return;
    if (matched.size >= 4) return;

    const runIdleHint1 = () => {
      const now = Date.now();
      if (now - lastInteractionAtRef.current < IDLE_HINT_1_MS) return;
      if (idleHintStage > 0) return;

      const unmatched = ANIMALS
        .map((a) => a.id)
        .filter((id) => !matched.has(id));
      const wrongPool = unmatched.filter((id) => id !== currentTargetId);
      if (wrongPool.length === 0) return;

      const wrongId = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      setHintAnimalIds([currentTargetId, wrongId]);
      setIdleHintStage(1);
    };

    idleHintTimerRef.current = setInterval(runIdleHint1, 500);

    return () => {
      if (idleHintTimerRef.current) clearInterval(idleHintTimerRef.current);
    };
  }, [isActive, waitingForTap, currentTargetId, matched, idleHintStage]);

  useEffect(() => {
    if (!isActive || !waitingForTap || !currentTargetId) return;
    if (matched.size >= 4) return;

    const runIdleHint2 = () => {
      const now = Date.now();
      if (now - lastInteractionAtRef.current < IDLE_HINT_2_MS) return;
      if (idleHintStage >= 2) return;
      playIdleHintVo(currentTargetId);
      setIdleHintStage(2);
    };

    const hint2Timer = setInterval(runIdleHint2, 500);
    return () => clearInterval(hint2Timer);
  }, [isActive, waitingForTap, currentTargetId, matched, idleHintStage, playIdleHintVo]);

  useEffect(() => () => {
    stopClueSpeech();
  }, [stopClueSpeech]);

  useEffect(() => {
    if (debugMode) return;

    if (Array.isArray(animalPositions)) {
      setEditableAnimalPositions((prev) => ({ ...prev, ...arrayToPositionMap(animalPositions) }));
      return;
    }

    if (animalPositions && typeof animalPositions === 'object') {
      setEditableAnimalPositions((prev) => ({ ...prev, ...animalPositions }));
    }
  }, [animalPositions, debugMode]);

  const handleReplay = useCallback(() => {
    if (!currentTarget || !waitingForTap) return;
    lastInteractionAtRef.current = Date.now();
    setHintAnimalIds([]);
    setIdleHintStage(0);
    stopClueSpeech();
    currentSoundRef.current = playAudio(currentTarget.sound, ANIMAL_SOUND_VOLUME);
  }, [currentTarget, waitingForTap, stopClueSpeech]);

  const handleAnimalTap = useCallback((animalId, e) => {
    e?.stopPropagation();
    if (!waitingForTap) return;
    if (matched.has(animalId)) return;
    lastInteractionAtRef.current = Date.now();
    setHintAnimalIds([]);
    setIdleHintStage(0);
    stopClueSpeech();

    if (animalId === currentTargetId) {
      // Correct
      setWaitingForTap(false);
      setShowReplay(false);
      playAudio(currentTarget.vo, 0.95, VO_TEXTS[currentTarget.id]);
      setMatched(prev => new Set([...prev, animalId]));

      setTimeout(() => {
        setCurrentRound(r => r + 1);
      }, 1400);
    } else {
      // Wrong — wobble + replay
      setWrongAnimal(animalId);
      setTimeout(() => setWrongAnimal(null), WRONG_FEEDBACK_MS);
      setTimeout(() => {
        if (currentTarget) playAudio(currentTarget.sound, ANIMAL_SOUND_VOLUME);
      }, WRONG_FEEDBACK_MS + 200);
    }
  }, [waitingForTap, matched, currentTargetId, currentTarget, stopClueSpeech]);

  const activeAnimalPositions = ANIMALS.map((animal) => ({
    id: animal.id,
    ...(editableAnimalPositions[animal.id] || defaultPositionMap[animal.id] || {})
  }));

  if (hideElements || !isActive) return null;

  return (
    <div
      className={`ears-sound-game ${className}`}
      onPointerMove={(e) => {
        const dragTarget = dragTargetRef.current;
        if (!dragTarget?.id) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(99.5, Math.max(0.5, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(99.5, Math.max(0.5, ((e.clientY - rect.top) / rect.height) * 100));
        setEditableAnimalPositions((prev) => ({
          ...prev,
          [dragTarget.id]: {
            ...(prev[dragTarget.id] || {}),
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2))
          }
        }));
      }}
      onPointerUp={() => {
        dragTargetRef.current = null;
      }}
      onPointerLeave={() => {
        dragTargetRef.current = null;
      }}
    >
      {SHOW_EARS_DEBUG && (
      <div className="ears-edit-bar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`ears-edit-toggle ${debugMode ? 'on' : ''}`}
          onClick={() => setDebugMode((prev) => !prev)}
        >
          {debugMode ? 'Editing' : 'Play'}
        </button>
        {debugMode && (
          <>
            {ANIMALS.map((animal) => (
              <button
                key={animal.id}
                type="button"
                className={`ears-edit-animal-btn ${selectedAnimalId === animal.id ? 'active' : ''}`}
                onClick={() => setSelectedAnimalId(animal.id)}
              >
                {animal.name}
              </button>
            ))}
            <button
              type="button"
              className="ears-edit-copy-btn"
              onClick={() => {
                const lines = [
                  'export const ANIMAL_POSITIONS = {',
                  ...Object.entries(editableAnimalPositions).map(([id, pos]) => `  ${id}: { x: ${pos.x}, y: ${pos.y} },`),
                  '};'
                ];
                navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
              }}
            >
              Copy
            </button>
            <button
              type="button"
              className="ears-edit-save-btn"
              onClick={() => savePositions(editableAnimalPositions)}
            >
              Save
            </button>
          </>
        )}
      </div>
      )}

      <img className="ears-sound-layer ears-sound-layer-back" src={bgBackImg} alt="" />
      <img className="ears-sound-layer ears-sound-layer-back-rocks" src={backRocksImg} alt="" />
      <img className="ears-sound-layer ears-sound-layer-middle" src={middleRocksImg} alt="" />

      {/* Animals (all visible, fixed positions) */}
      {activeAnimalPositions.map(pos => {
        const animal = ANIMALS.find(a => a.id === pos.id);
        const isMatched = matched.has(animal.id);
        const isWrong = wrongAnimal === animal.id;
        const isHinted = hintAnimalIds.includes(animal.id);

        return (
          <div
            key={animal.id}
            className={`ears-sound-animal ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''} ${waitingForTap && !isMatched ? 'tappable' : ''} ${isHinted ? 'idle-hint' : ''} ${debugMode && selectedAnimalId === animal.id ? 'debug-selected' : ''} ${debugMode ? 'debug-draggable' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, '--animal-scale': ANIMAL_SIZES[animal.id] || 1 }}
            onClick={(e) => handleAnimalTap(animal.id, e)}
            onPointerDown={(e) => {
              if (!debugMode) return;
              e.stopPropagation();
              setSelectedAnimalId(animal.id);
              dragTargetRef.current = { id: animal.id };
              if (typeof e.currentTarget.setPointerCapture === 'function') {
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            }}
            onPointerUp={(e) => {
              if (!debugMode) return;
              e.stopPropagation();
              dragTargetRef.current = null;
            }}
            onPointerCancel={() => {
              dragTargetRef.current = null;
            }}
          >
            <img src={animal.img} alt={animal.name} draggable={false} />
            {debugMode && (
              <span className="ears-debug-label">
                {animal.name} ({Math.round(pos.x)}, {Math.round(pos.y)})
              </span>
            )}
          </div>
        );
      })}

      {/* Replay button */}
      {showReplay && (
        <button
          className="ears-sound-replay"
          onClick={handleReplay}
          aria-label="Play sound again"
        >
          <img src={replayIcon} alt="" aria-hidden="true" />
          <span>Hear again</span>
        </button>
      )}

      <img className="ears-sound-layer ears-sound-layer-front" src={frontRocksImg} alt="" />
    </div>
  );
};

export default EarsSoundMatchGame;
