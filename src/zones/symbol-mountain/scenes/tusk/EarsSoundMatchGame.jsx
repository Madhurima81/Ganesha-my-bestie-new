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

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugEars'));
const LAYOUT_STORAGE_KEY = 'symbol_mountain_ears_layout_v1';
const LAYOUT_PRESET_VERSION = '2026-09-07-ear-listening-layout-1';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52 },
  feedback: { x: 50, y: 84, w: 42 },
  tray: { x: 50, y: 93, w: 18 },
  elephantLeftBush: { x: 24, y: 62, w: 20, z: 16 },
  elephantCenterRock: { x: 49, y: 72, w: 21, z: 16 },
  elephantRightPond: { x: 75, y: 75, w: 21, z: 16 },
  cowLeftBush: { x: 24, y: 62, w: 20, z: 16 },
  cowCenterRock: { x: 49, y: 72, w: 21, z: 16 },
  cowRightCave: { x: 78, y: 56, w: 20, z: 16 },
  elephantReveal: { x: 73, y: 59, w: 27, z: 31 },
  cowReveal: { x: 41, y: 67, w: 18, z: 32 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'elephantLeftBush', label: 'Elephant - left bush' },
  { key: 'elephantCenterRock', label: 'Elephant - center rock' },
  { key: 'elephantRightPond', label: 'Elephant - water patch' },
  { key: 'cowLeftBush', label: 'Cow - left bush' },
  { key: 'cowCenterRock', label: 'Cow - center rock' },
  { key: 'cowRightCave', label: 'Cow - cave nook' },
  { key: 'elephantReveal', label: 'Elephant reveal' },
  { key: 'cowReveal', label: 'Cow reveal' }
];

const loadSavedLayout = () => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    if (saved.version !== LAYOUT_PRESET_VERSION || !saved.layout) return DEFAULT_LAYOUT;
    return Object.fromEntries(
      Object.entries(DEFAULT_LAYOUT).map(([key, fallback]) => [
        key,
        { ...fallback, ...(saved.layout[key] || {}) }
      ])
    );
  } catch {
    return DEFAULT_LAYOUT;
  }
};

const styleFromLayout = (layoutItem) => ({
  left: `${layoutItem.x}%`,
  top: `${layoutItem.y}%`,
  bottom: 'auto',
  width: `${layoutItem.w}%`,
  zIndex: layoutItem.z
});

const BASE_SOURCES = {
  leftBush: { id: 'leftBush', label: 'Left bush', img: leftBushImg },
  centerRock: { id: 'centerRock', label: 'Center rock', img: centerRockImg },
  rightPond: { id: 'rightPond', label: 'Water patch', img: pondPatchImg },
  rightCave: { id: 'rightCave', label: 'Cave nook', img: caveNookImg }
};

const ROUNDS = [
  {
    id: 'elephant',
    label: 'Elephant',
    prompt: 'Listen for the animal near the water.',
    targetSourceId: 'rightPond',
    sources: [
      { ...BASE_SOURCES.leftBush, layoutKey: 'elephantLeftBush', sound: decoyRustle, kind: 'decoy' },
      { ...BASE_SOURCES.centerRock, layoutKey: 'elephantCenterRock', sound: decoyWind, kind: 'decoy' },
      { ...BASE_SOURCES.rightPond, layoutKey: 'elephantRightPond', sound: soundElephant, kind: 'target' }
    ],
    frames: [elephantRestingImg, elephantNoticesImg, elephantDrinksImg, elephantSpraysImg, elephantIdleImg],
    revealLayoutKey: 'elephantReveal'
  },
  {
    id: 'cow',
    label: 'Cow',
    prompt: 'Listen for the animal near the grass.',
    targetSourceId: 'rightCave',
    sources: [
      { ...BASE_SOURCES.leftBush, layoutKey: 'cowLeftBush', sound: decoyWind, kind: 'decoy' },
      { ...BASE_SOURCES.centerRock, layoutKey: 'cowCenterRock', sound: decoyRustle, kind: 'decoy' },
      { ...BASE_SOURCES.rightCave, layoutKey: 'cowRightCave', sound: soundCow, kind: 'target' }
    ],
    frames: [cowRestingImg, cowLooksImg, cowNibblesImg, cowChewsImg, cowIdleImg],
    revealLayoutKey: 'cowReveal'
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
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('elephantLeftBush');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const audioRef = useRef(null);
  const timersRef = useRef([]);
  const runIdRef = useRef(0);
  const chooseStartedAtRef = useRef(Date.now());
  const hintStageRef = useRef(0);
  const completedRef = useRef(false);
  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const round = ROUNDS[roundIndex];
  const completedIds = useMemo(() => new Set(completedRounds), [completedRounds]);
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];

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

  const saveLayout = useCallback((nextLayout) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({
        version: LAYOUT_PRESET_VERSION,
        layout: nextLayout
      }));
    } catch {
      // Local storage is optional in the dev harness.
    }
  }, []);

  const updateLayout = useCallback((key, patch) => {
    setLayout((current) => {
      const next = {
        ...current,
        [key]: {
          ...(current[key] || DEFAULT_LAYOUT[key]),
          ...patch
        }
      };
      saveLayout(next);
      return next;
    });
  }, [saveLayout]);

  const updateLayoutField = useCallback((key, field, value) => {
    const max = field === 'z' ? 80 : 100;
    const numeric = Math.max(0, Math.min(max, Number(value)));
    updateLayout(key, { [field]: numeric });
  }, [updateLayout]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
      } catch {
        // no-op
      }
    }
  }, []);

  const copyLayoutJson = useCallback(async () => {
    const payload = JSON.stringify({ version: LAYOUT_PRESET_VERSION, layout }, null, 2);
    try {
      await navigator.clipboard?.writeText(payload);
      setLayoutCopyStatus('Copied');
    } catch {
      window.prompt?.('Copy Ear layout JSON', payload);
      setLayoutCopyStatus('Shown');
    }
    console.log('Ear layout JSON:', payload);
    schedule(() => setLayoutCopyStatus(''), 1500);
  }, [layout, schedule]);

  const getPointerPercent = useCallback((event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return null;
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }, []);

  const startDebugDrag = useCallback((event, key) => {
    if (!debugMode) return;
    const point = getPointerPercent(event);
    const item = layout[key] || DEFAULT_LAYOUT[key];
    if (!point || !item) return;
    event.stopPropagation();
    debugDragRef.current = {
      key,
      offsetX: point.x - item.x,
      offsetY: point.y - item.y
    };
    setSelectedDebugKey(key);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugMode, getPointerPercent, layout]);

  const handleDebugPointerMove = useCallback((event) => {
    const drag = debugDragRef.current;
    if (!drag) return;
    const point = getPointerPercent(event);
    if (!point) return;
    event.stopPropagation();
    updateLayout(drag.key, {
      x: Number(Math.max(0, Math.min(100, point.x - drag.offsetX)).toFixed(2)),
      y: Number(Math.max(0, Math.min(100, point.y - drag.offsetY)).toFixed(2))
    });
  }, [getPointerPercent, updateLayout]);

  const stopDebugDrag = useCallback(() => {
    debugDragRef.current = null;
  }, []);

  const startDebugPanelDrag = useCallback((event) => {
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugPanelPosition.x, debugPanelPosition.y]);

  const moveDebugPanelDrag = useCallback((event) => {
    const drag = debugPanelDragRef.current;
    if (!drag) return;
    const panelWidth = Math.min(352, window.innerWidth - 24);
    const panelHeight = debugMode ? Math.min(window.innerHeight * 0.78, 560) : 48;
    setDebugPanelPosition({
      x: Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - drag.offsetX)),
      y: Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - drag.offsetY))
    });
  }, [debugMode]);

  const stopDebugPanelDrag = useCallback(() => {
    debugPanelDragRef.current = null;
  }, []);

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
    if (debugMode || !round || phase !== PHASE.CHOOSING) return;

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
  }, [debugMode, phase, round, schedule, showFeedback, speak, startReveal]);

  if (hideElements || !isActive) return null;

  return (
    <div
      ref={stageRef}
      className={`ears-sound-game ${className} ${debugMode ? 'is-debugging' : ''}`}
      onPointerMove={handleDebugPointerMove}
      onPointerUp={stopDebugDrag}
      onPointerLeave={stopDebugDrag}
    >
      <img className="ears-game-bg" src={bgImg} alt="" draggable={false} />

      <div
        className={`ears-game-prompt ${debugMode && selectedDebugKey === 'prompt' ? 'is-debug-selected' : ''}`}
        style={styleFromLayout(layout.prompt)}
        onPointerDown={(e) => startDebugDrag(e, 'prompt')}
      >
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
            className={`ears-source ${locked ? 'locked' : 'ready'} ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${debugMode && selectedDebugKey === source.layoutKey ? 'is-debug-selected' : ''}`}
            style={{ ...styleFromLayout(layout[source.layoutKey]), '--source-index': index + 1 }}
            onClick={(e) => handleSourceTap(source, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, source.layoutKey)}
            disabled={!debugMode && locked}
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
            className={`ears-animal-reveal ${animalRound.id} ${debugMode && selectedDebugKey === animalRound.revealLayoutKey ? 'is-debug-selected' : ''}`}
            style={styleFromLayout(layout[animalRound.revealLayoutKey])}
            onPointerDown={(e) => startDebugDrag(e, animalRound.revealLayoutKey)}
          >
            <img src={animalRound.frames[frameIndex] || animalRound.frames[animalRound.frames.length - 1]} alt="" draggable={false} />
            <span className="ears-animal-sparkle" aria-hidden="true" />
          </div>
        );
      })}

      {debugMode && ROUNDS.filter((animalRound) => !completedIds.has(animalRound.id)).map((animalRound) => (
        <div
          key={`debug-reveal-${animalRound.id}`}
          className={`ears-animal-reveal ${animalRound.id} debug-preview ${selectedDebugKey === animalRound.revealLayoutKey ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout[animalRound.revealLayoutKey])}
          onPointerDown={(e) => startDebugDrag(e, animalRound.revealLayoutKey)}
        >
          <img src={animalRound.frames[animalRound.frames.length - 1]} alt="" draggable={false} />
        </div>
      ))}

      <div
        className={`ears-found-tray ${debugMode && selectedDebugKey === 'tray' ? 'is-debug-selected' : ''}`}
        style={styleFromLayout(layout.tray)}
        aria-hidden="true"
        onPointerDown={(e) => startDebugDrag(e, 'tray')}
      >
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

      {(feedback || debugMode) && (
        <div
          className={`ears-soft-feedback ${debugMode && selectedDebugKey === 'feedback' ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout.feedback)}
          onPointerDown={(e) => startDebugDrag(e, 'feedback')}
        >
          {feedback || 'Feedback'}
        </div>
      )}

      {DEBUG_UI_ENABLED && (
        <div
          className={`ears-debug-panel ${debugMode ? 'is-open' : ''}`}
          style={{ left: debugPanelPosition.x, top: debugPanelPosition.y }}
          onPointerMove={moveDebugPanelDrag}
          onPointerUp={stopDebugPanelDrag}
          onPointerLeave={stopDebugPanelDrag}
        >
          <button
            type="button"
            className="ears-debug-toggle"
            onClick={() => setDebugMode((value) => !value)}
          >
            {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
          </button>

          {debugMode && (
            <div className="ears-debug-body">
              <button
                type="button"
                className="ears-debug-drag-handle"
                onPointerDown={startDebugPanelDrag}
              >
                Drag panel
              </button>
              <div className="ears-debug-section-title">Scene Objects</div>
              <p className="ears-debug-note">Drag any object in the scene, or tune exact values here.</p>

              <label className="ears-debug-row">
                <span>Element</span>
                <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                  {DEBUG_KEYS.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              {['x', 'y', 'w', 'z'].map((field) => (
                <label key={field} className="ears-debug-row">
                  <span>{field.toUpperCase()}</span>
                  <input
                    type="range"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                </label>
              ))}

              <div className="ears-debug-actions">
                <button type="button" onClick={copyLayoutJson}>
                  {layoutCopyStatus || 'Copy JSON'}
                </button>
                <button type="button" onClick={resetLayout}>Reset</button>
              </div>

              <pre className="ears-debug-readout">{JSON.stringify({ [selectedDebugKey]: selectedDebugLayout }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarsSoundMatchGame;
