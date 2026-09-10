// zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx
// Ear listening game: one continuous scene. Elephant (thirsty) is active
// first while Cow (hungry) waits faded; after Elephant is solved, Cow
// becomes the focal animal. Same 3 listening zones serve both rounds.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './EarsSoundMatchGame.css';

// Reuses the Eyes game's background (the delivered ear_game_background.png
// was a captured screenshot of the Eyes-game dev harness, not usable art).
import bgImg from './assets/images/ears-game/symbol_mountain_3_bg.png';
import leafyBushImg from './assets/images/ears-game-v2/leafy_bush.png';
import hiddenSpringImg from './assets/images/ears-game-v2/hidden_spring.png';
import revealedSpringImg from './assets/images/ears-game-v2/revealed_spring.png';
import hiddenGrassBushImg from './assets/images/ears-game-v2/hidden_grass_bush.png';
import revealedGrassBushImg from './assets/images/ears-game-v2/revealed_grass_bush.png';
import elephantThirstyImg from './assets/images/ears-game-v2/elephant_thirsty.png';
import elephantDrinkingImg from './assets/images/ears-game-v2/elephant_drinking.png';
import elephantHappyWaterImg from './assets/images/ears-game-v2/elephant_happy_water.png';
import cowTiredImg from './assets/images/ears-game-v2/cow_tired.png';
import cowHungryImg from './assets/images/ears-game-v2/cow_hungry.png';
import cowEatingGrassImg from './assets/images/ears-game-v2/cow_eating_grass.png';
import cowHappyChewingImg from './assets/images/ears-game-v2/cow_happy_chewing.png';
import soundWaterDrip from './assets/audio/ear_water_drip.wav';
import soundGrassRustle from './assets/audio/ear_grass_rustle.wav';
import soundBirdAmbient from './assets/audio/ear_bird_forest_ambient.wav';
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
const LAYOUT_STORAGE_KEY = 'symbol_mountain_ears_layout_v2';
const LAYOUT_PRESET_VERSION = '2026-09-10-ears-visual-flow-editor-layout';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52 },
  feedback: { x: 50, y: 84, w: 42 },
  tray: { x: 50, y: 93, w: 18 },
  // Positions ported from Madhurima's Visual Flow Editor layout (tagged
  // items). Cow's position varies noticeably across its 3 poses in the
  // editor (tired/eating/happy) but this game only supports one fixed spot
  // per sprite (poses swap in place, not travel) — used the eating-grass
  // spot as the representative middle-ground; flag if it needs adjusting.
  leftBush: { x: 23.08, y: 46.99, w: 24, z: 16 },
  centerRock: { x: 58.94, y: 55.5, w: 24, z: 16 },
  rightSource: { x: 83.69, y: 66.11, w: 24, z: 16 },
  elephantSprite: { x: 35.17, y: 61.53, w: 24, z: 20 },
  cowSprite: { x: 76.03, y: 65.72, w: 24, z: 20 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'leftBush', label: 'Zone - left bush' },
  { key: 'centerRock', label: 'Zone - center rock' },
  { key: 'rightSource', label: 'Zone - right water/grass' },
  { key: 'elephantSprite', label: 'Elephant' },
  { key: 'cowSprite', label: 'Cow' }
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

// Left stays a plain decorative bush throughout — no hidden/revealed swap.
// Center and right swap from a hidden to a revealed source once that
// round's animal is solved, per Madhurima's Visual Flow Editor design.
const ZONES = {
  left: { id: 'left', label: 'Bush', img: leafyBushImg, layoutKey: 'leftBush' },
  center: { id: 'center', label: 'Spring', hiddenImg: hiddenSpringImg, revealedImg: revealedSpringImg, layoutKey: 'centerRock' },
  right: { id: 'right', label: 'Grass', hiddenImg: hiddenGrassBushImg, revealedImg: revealedGrassBushImg, layoutKey: 'rightSource' }
};

const ROUNDS = [
  {
    id: 'elephant',
    label: 'Elephant',
    prompt: 'Listen for the water.',
    targetZoneId: 'center',
    sounds: {
      left: decoyRustle,
      center: soundWaterDrip,
      right: soundBirdAmbient
    },
    idleImg: elephantThirstyImg,
    revealFrames: [elephantDrinkingImg, elephantHappyWaterImg]
  },
  {
    id: 'cow',
    label: 'Cow',
    prompt: 'Listen for the grass.',
    targetZoneId: 'right',
    sounds: {
      left: decoyWind,
      center: soundBirdAmbient,
      right: soundGrassRustle
    },
    idleImg: cowHungryImg,
    revealFrames: [cowEatingGrassImg, cowHappyChewingImg]
  }
];

const VO_TEXTS = {
  intro: 'Listen closely. Hear each place first. Then choose the sound that matters.',
  choose: 'Now choose the sound.',
  neutral: 'Good listening. Try another sound source.',
  hint: 'Listen for the sound.',
  complete: 'You listened carefully and found what mattered.',
  elephant: 'Elephant found water.',
  cow: 'Cow found grass.'
};

const BETWEEN_SOUND_MS = 560;
const INTRO_DELAY_MS = 700;
// Slower reveal pacing — kids need time to actually see each pose before it
// swaps to the next, and a real pause before the next round begins.
const REVEAL_FRAME_MS = 950;
const NEXT_ROUND_DELAY_MS = 2000;
const COMPLETE_DELAY_MS = 1900;
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
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [wrongZoneId, setWrongZoneId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [revealFrameByAnimal, setRevealFrameByAnimal] = useState({});
  const [hintZoneId, setHintZoneId] = useState(null);
  const [zonesHidden, setZonesHidden] = useState(false);
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('leftBush');
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
    setHintZoneId(null);
    setWrongZoneId(null);
    setFeedback(targetRound.prompt);

    const zoneIds = ['left', 'center', 'right'];
    let index = 0;
    const playNext = () => {
      if (runId !== runIdRef.current) return;
      if (index >= zoneIds.length) {
        setActiveZoneId(null);
        setPhase(PHASE.CHOOSING);
        chooseStartedAtRef.current = Date.now();
        hintStageRef.current = 0;
        setFeedback(VO_TEXTS.choose);
        speak(VO_TEXTS.choose);
        afterSequence?.();
        return;
      }

      const zoneId = zoneIds[index];
      setActiveZoneId(zoneId);
      playSound(targetRound.sounds[zoneId], '', () => {
        if (runId !== runIdRef.current) return;
        setActiveZoneId(null);
        index += 1;
        schedule(playNext, BETWEEN_SOUND_MS);
      }, zoneId === targetRound.targetZoneId ? 0.68 : 0.42);
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
    setActiveZoneId(null);
    setCompletedRounds([]);
    setWrongZoneId(null);
    setFeedback('');
    setRevealFrameByAnimal({});
    setHintZoneId(null);
    setZonesHidden(false);
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
        setHintZoneId(round.targetZoneId);
        playSound(round.sounds[round.targetZoneId], VO_TEXTS[round.id], () => {
          schedule(() => playSequence(round), BETWEEN_SOUND_MS);
        }, 0.68);
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
    setActiveZoneId(null);
    setHintZoneId(null);
    setWrongZoneId(null);
    setRevealFrameByAnimal((prev) => ({ ...prev, [animalRound.id]: 0 }));
    speak(VO_TEXTS[animalRound.id]);

    let frame = 0;
    const advanceFrame = () => {
      frame += 1;
      setRevealFrameByAnimal((prev) => ({
        ...prev,
        [animalRound.id]: Math.min(frame, animalRound.revealFrames.length - 1)
      }));
      if (frame < animalRound.revealFrames.length - 1) {
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
        // Let the listening zones fade, then remove them so the payoff is
        // just the two resolved, happy animals — no leftover clutter.
        schedule(() => setZonesHidden(true), 700);

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
    }, (animalRound.revealFrames.length * REVEAL_FRAME_MS) + NEXT_ROUND_DELAY_MS);
  }, [clearTimers, onAnimalPositionsChange, onGameComplete, playSequence, roundIndex, schedule, showFeedback, speak, stopAudio]);

  const handleZoneTap = useCallback((zoneId, e) => {
    e.stopPropagation();
    if (debugMode || !round || phase !== PHASE.CHOOSING) return;

    if (zoneId !== round.targetZoneId) {
      setWrongZoneId(zoneId);
      showFeedback(VO_TEXTS.neutral);
      speak(VO_TEXTS.neutral);
      schedule(() => setWrongZoneId(null), 520);
      return;
    }

    setCompletedRounds((prev) => [...prev, round.id]);
    showFeedback(VO_TEXTS[round.id]);
    startReveal(round);
  }, [debugMode, phase, round, schedule, showFeedback, speak, startReveal]);

  if (hideElements || !isActive) return null;

  const elephantSolved = completedIds.has('elephant');
  const cowSolved = completedIds.has('cow');
  const cowIsFocal = round?.id === 'cow' || cowSolved;

  const elephantFrame = elephantSolved
    ? ROUNDS[0].revealFrames[revealFrameByAnimal.elephant ?? ROUNDS[0].revealFrames.length - 1]
    : ROUNDS[0].idleImg;
  const elephantOpacityClass = elephantSolved ? 'ears-sprite-softened' : 'ears-sprite-active';

  const cowFrame = cowSolved
    ? ROUNDS[1].revealFrames[revealFrameByAnimal.cow ?? ROUNDS[1].revealFrames.length - 1]
    : cowIsFocal
      ? ROUNDS[1].idleImg
      : cowTiredImg;
  const cowOpacityClass = cowSolved || cowIsFocal ? 'ears-sprite-active' : 'ears-sprite-waiting';

  return (
    <div
      ref={stageRef}
      className={`ears-sound-game ${className} ${debugMode ? 'is-debugging' : ''}`}
      onPointerMove={handleDebugPointerMove}
      onPointerUp={stopDebugDrag}
      onPointerLeave={stopDebugDrag}
    >
      <img className="ears-game-bg" src={bgImg} alt="" draggable={false} />

      <img
        key={elephantFrame}
        className={`ears-story-sprite ${elephantOpacityClass} ${debugMode && selectedDebugKey === 'elephantSprite' ? 'is-debug-selected' : ''}`}
        src={elephantFrame}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.elephantSprite)}
        onPointerDown={(e) => startDebugDrag(e, 'elephantSprite')}
      />
      <img
        key={cowFrame}
        className={`ears-story-sprite ${cowOpacityClass} ${debugMode && selectedDebugKey === 'cowSprite' ? 'is-debug-selected' : ''}`}
        src={cowFrame}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.cowSprite)}
        onPointerDown={(e) => startDebugDrag(e, 'cowSprite')}
      />


      {!zonesHidden && Object.values(ZONES).map((zone, index) => {
        const isPlaying = activeZoneId === zone.id;
        const isWrong = wrongZoneId === zone.id;
        const isHinted = hintZoneId === zone.id;
        const locked = phase !== PHASE.CHOOSING;
        const isComplete = phase === PHASE.COMPLETE;
        // left has no hidden/revealed pair — it's plain decoration throughout.
        // center (spring) reveals once Elephant is solved; right (grass)
        // reveals once Cow is solved.
        const zoneImg = !zone.hiddenImg
          ? zone.img
          : (zone.id === 'center' ? elephantSolved : cowSolved)
            ? zone.revealedImg
            : zone.hiddenImg;

        return (
          <button
            key={zone.id}
            type="button"
            className={`ears-source ${locked ? 'locked' : 'ready'} ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isComplete ? 'resolving' : ''} ${debugMode && selectedDebugKey === zone.layoutKey ? 'is-debug-selected' : ''}`}
            style={{ ...styleFromLayout(layout[zone.layoutKey]), '--source-index': index + 1 }}
            onClick={(e) => handleZoneTap(zone.id, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, zone.layoutKey)}
            disabled={!debugMode && locked}
            aria-label={zone.label}
          >
            <span className="ears-source-number">{index + 1}</span>
            <span className="ears-source-pulse" aria-hidden="true" />
            <img key={zoneImg} src={zoneImg} alt="" draggable={false} />
          </button>
        );
      })}


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
