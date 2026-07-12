import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TuskPathGame.css';
import { ANIMAL_SIZES } from './animalConfig';
import { TUSK_ANIMAL_POSITIONS, TUSK_OBSTACLE_POSITION } from './tuskPathLayout';

import peacockImg from '../tusk/assets/images/peacock-new.png';
import monkeyImg from '../tusk/assets/images/monkey-new.png';
import elephantImg from '../tusk/assets/images/elephant-new1.png';
import cowImg from '../tusk/assets/images/cow-new.png';
import bgBackImg from './assets/images/tusk-bg-new.png';

import blockageFull from './assets/images/full-obtacle-new.png';
import blockageNoVines from './assets/images/sand-boulder-new.png';
import blockageNoRocks from './assets/images/sand new.png';
import blockageNoMud from './assets/images/boulder new.png';
import blockageCleared from './assets/images/final obstacle.png';

import tuskImg from '../../shared/images/icons/broken-tusk-symbol.png';

// VO — recorded files do not exist yet (the old '/audio/...' paths 404'd).
// Null paths fall back to Web Speech so the new stage guidance still plays.
const VO_PATHS = {
  intro: null,
  elephantHint: null,
  monkeyHint: null,
  peacockHint: null,
  cowHint: null,
  finale: null,
  keepPushing: null
};

const VO_TEXTS = {
  intro: 'My tusk is hidden beyond this blocked path. Let us work together to clear the way!',
  vinesPrompt: 'Who can help with these tangled vines?',
  vinesSelected: 'Great choice! Now rub the vines away!',
  vinesDone: 'Wonderful! The vines are cleared.',
  rocksPrompt: 'Which friend can clear the loose rocks?',
  rocksSelected: 'Great choice! Now rub the rocks away!',
  rocksDone: 'Excellent! The rocks are gone.',
  mudPrompt: 'Who can help clean this muddy path?',
  mudSelected: 'Great choice! Now rub the mud away!',
  mudDone: 'Fantastic! The path is almost clear.',
  boulderPrompt: 'Who is strong enough to move this giant boulder?',
  boulderSelected: 'Great choice! Press and hold to push the boulder!',
  keepPushing: 'Keep pushing... You are doing great!',
  finale: 'Hooray! You did it! The tusk has appeared! Every friend used their special gift. Working together helped clear the path. Wonderful teamwork!'
};

// Debug layout editor — only with ?debug in the URL, never for children in prod.
const SHOW_TUSK_DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');

const ANIMALS = [
  { id: 'elephant', name: 'Elephant', img: elephantImg },
  { id: 'monkey', name: 'Monkey', img: monkeyImg },
  { id: 'peacock', name: 'Peacock', img: peacockImg },
  { id: 'cow', name: 'Cow', img: cowImg }
];

const LAYERS = [
  { id: 'vines', correctAnimal: 'peacock', img: blockageFull, hintVo: VO_PATHS.peacockHint, feedback: 'sweep' },
  { id: 'rocks', correctAnimal: 'monkey', img: blockageNoVines, hintVo: VO_PATHS.monkeyHint, feedback: 'pluck' },
  { id: 'mud', correctAnimal: 'cow', img: blockageNoRocks, hintVo: VO_PATHS.cowHint, feedback: 'walk' },
  { id: 'rock', correctAnimal: 'elephant', img: blockageNoMud, hintVo: VO_PATHS.elephantHint, feedback: 'shake' }
];

const LAYER_PROMPTS = {
  vines: VO_TEXTS.vinesPrompt,
  rocks: VO_TEXTS.rocksPrompt,
  mud: VO_TEXTS.mudPrompt,
  rock: VO_TEXTS.boulderPrompt
};

const LAYER_SUCCESS_LINES = {
  vines: VO_TEXTS.vinesDone,
  rocks: VO_TEXTS.rocksDone,
  mud: VO_TEXTS.mudDone
};

const LAYER_ACTION_LINES = {
  vines: VO_TEXTS.vinesSelected,
  rocks: VO_TEXTS.rocksSelected,
  mud: VO_TEXTS.mudSelected,
  rock: VO_TEXTS.boulderSelected
};

const FINAL_IMAGE = blockageCleared;
const IDLE_HINT_MS = 6000;
const GRID = 8;
const CLEAR_THRESHOLD = 0.6;
const SCRATCH_R_FRAC = 0.12;   // of canvas width
const ELEPHANT_HOLD_MS = 2000; // unchanged
const ANIMAL_POSITION_STORAGE_KEY = 'symbol_mountain_tusk_animal_positions_v1';
const OBSTACLE_POSITION_STORAGE_KEY = 'symbol_mountain_tusk_obstacle_position_v1';
const DEBUG_DEPTHS = ['behind-middle', 'between-middle-front', 'in-front'];
const OBSTACLE_SCALE_STEPS = [1, 1.25, 1.5, 1.75, 2];
const WORK_HINT_TEXT = {
  sweep: 'Rub the vines away! ✋',
  pluck: 'Rub the rocks away! ✋',
  walk: 'Rub the mud away! ✋',
  shake: 'Press and hold to push! 💪'
};
const DEPTH_Z_INDEX = {
  'behind-back': 2,
  'behind-middle': 4,
  'between-middle-front': 6,
  'in-front': 12
};

const speakFallback = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const TuskPathGame = ({
  isActive = true,
  isAudioOn = true,
  showObstacleOnly = false,
  animalPositions = null,
  obstaclePosition = null,
  onAnimalPositionsChange,
  onObstaclePositionChange,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const sceneRef = useRef(null);
  const lastTapRef = useRef(Date.now());
  const idleTimerRef = useRef(null);
  const dragTargetRef = useRef(null);
  const activeAudioRef = useRef(null);
  const idleHintPlayedRef = useRef(false);
  const wrongAnimalTimerRef = useRef(null);
  const leaningTimerRef = useRef(null);
  const layerAdvanceTimerRef = useRef(null);

  const [currentLayerIdx, setCurrentLayerIdx] = useState(0);
  const [peeling, setPeeling] = useState(false);
  const [wrongAnimal, setWrongAnimal] = useState(null);
  const [leaningAnimal, setLeaningAnimal] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [helperAnimal, setHelperAnimal] = useState(null); // latched animal
  const [workProgress, setWorkProgress] = useState(0);    // 0..1
  const [isHolding, setIsHolding] = useState(false);
  const scrubCanvasRef = useRef(null);
  const scrubGridRef = useRef([]);
  const scrubTotalRef = useRef(0);
  const scrubDoneRef = useRef(0);
  const scrubbingRef = useRef(false);
  const holdRafRef = useRef(null);
  const holdStartRef = useRef(0);
  const stagePromptedRef = useRef(-1);
  const keepPushingTimerRef = useRef(null);
  // CRITICAL: these defaulted to true, which shipped the game in editor mode —
  // animal taps were ignored and children could not clear a single obstacle.
  const [debugMode, setDebugMode] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedEditorItem, setSelectedEditorItem] = useState(() => ANIMALS[0]?.id || 'obstacle');
  const [editableAnimalPositions, setEditableAnimalPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(ANIMAL_POSITION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...TUSK_ANIMAL_POSITIONS, ...parsed };
        }
      }
    } catch {}

    if (animalPositions && typeof animalPositions === 'object' && !Array.isArray(animalPositions)) {
      return { ...TUSK_ANIMAL_POSITIONS, ...animalPositions };
    }

    return { ...TUSK_ANIMAL_POSITIONS };
  });
  const [editableObstaclePosition, setEditableObstaclePosition] = useState(() => {
    try {
      const raw = localStorage.getItem(OBSTACLE_POSITION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { scale: 1, ...TUSK_OBSTACLE_POSITION, ...parsed };
        }
      }
    } catch {}

    if (obstaclePosition && typeof obstaclePosition === 'object' && !Array.isArray(obstaclePosition)) {
      return { scale: 1, ...TUSK_OBSTACLE_POSITION, ...obstaclePosition };
    }

    return { scale: 1, ...TUSK_OBSTACLE_POSITION };
  });

  const currentLayer = LAYERS[currentLayerIdx];
  const allCleared = currentLayerIdx >= LAYERS.length;

  const stopGameAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }
  }, []);

  const playGameAudio = useCallback((src, volume = 0.9) => {
    if (!isAudioOn) return null;
    stopGameAudio();
    const audio = playAudio(src, volume) || null;
    activeAudioRef.current = audio;
    return audio;
  }, [isAudioOn, stopGameAudio]);

  const playGameVoice = useCallback((src, fallbackText = '', volume = 0.9) => {
    if (!isAudioOn) return null;
    stopGameAudio();
    const audio = playAudio(src, volume, fallbackText) || null;
    activeAudioRef.current = audio;
    return audio;
  }, [isAudioOn, stopGameAudio]);

  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playGameVoice(VO_PATHS.intro, VO_TEXTS.intro);
  }, [isActive, introShown, playGameVoice]);

  useEffect(() => {
    if (!isActive || !currentLayer || peeling || showFinale || allCleared) return;
    if (helperAnimal) return;
    if (stagePromptedRef.current === currentLayerIdx) return;

    const delayMs = currentLayerIdx === 0 && introShown ? 2000 : 400;
    const timeoutId = setTimeout(() => {
      playGameVoice(currentLayer.hintVo, LAYER_PROMPTS[currentLayer.id] || '');
      stagePromptedRef.current = currentLayerIdx;
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [allCleared, currentLayer, currentLayerIdx, helperAnimal, introShown, isActive, peeling, playGameVoice, showFinale]);

  useEffect(() => {
    if (!isActive || showFinale || peeling || allCleared) return;
    const check = () => {
      if (Date.now() - lastTapRef.current >= IDLE_HINT_MS) {
        setShowIdleHint(true);
        if (!idleHintPlayedRef.current) {
          playGameVoice(currentLayer?.hintVo, LAYER_PROMPTS[currentLayer?.id] || '');
          idleHintPlayedRef.current = true;
        }
      }
    };
    idleTimerRef.current = setInterval(check, 1000);
    return () => clearInterval(idleTimerRef.current);
  }, [allCleared, currentLayer, isActive, peeling, playGameVoice, showFinale]);

  useEffect(() => {
    if (!allCleared) return;
    setShowFinale(true);
    playGameVoice(VO_PATHS.finale, VO_TEXTS.finale);
    const timeoutId = setTimeout(() => {
      onGameComplete?.({ layersCleared: LAYERS.length, totalCleared: 4 });
    }, 3800);
    return () => clearTimeout(timeoutId);
  }, [allCleared, onGameComplete, playGameVoice]);

  useEffect(() => {
    idleHintPlayedRef.current = false;
    setShowIdleHint(false);
    setHelperAnimal(null);
    setWorkProgress(0);
    setIsHolding(false);
  }, [currentLayerIdx, isActive]);

  useEffect(() => {
    if (debugMode || !animalPositions || typeof animalPositions !== 'object' || Array.isArray(animalPositions)) return;
    setEditableAnimalPositions((prev) => ({ ...prev, ...animalPositions }));
  }, [animalPositions, debugMode]);

  useEffect(() => {
    if (debugMode || !obstaclePosition || typeof obstaclePosition !== 'object' || Array.isArray(obstaclePosition)) return;
    setEditableObstaclePosition((prev) => ({ ...prev, ...obstaclePosition }));
  }, [obstaclePosition, debugMode]);

  const saveLayout = useCallback((positions = editableAnimalPositions, obstacle = editableObstaclePosition) => {
    try {
      localStorage.setItem(ANIMAL_POSITION_STORAGE_KEY, JSON.stringify(positions));
      localStorage.setItem(OBSTACLE_POSITION_STORAGE_KEY, JSON.stringify(obstacle));
    } catch {}
    onAnimalPositionsChange?.(positions);
    onObstaclePositionChange?.(obstacle);
  }, [editableAnimalPositions, editableObstaclePosition, onAnimalPositionsChange, onObstaclePositionChange]);

  const copyLayout = useCallback(async () => {
    const exportText = `export const ANIMAL_POSITIONS = ${JSON.stringify(editableAnimalPositions, null, 2)};\n\nexport const TUSK_OBSTACLE_POSITION = ${JSON.stringify(editableObstaclePosition, null, 2)};`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportText);
      }
    } catch {}
  }, [editableAnimalPositions, editableObstaclePosition]);

  const handleAnimalTap = useCallback((animalId, event) => {
    event?.stopPropagation();
    if (debugMode || !isActive || !currentLayer || peeling || showFinale || allCleared) return;

    lastTapRef.current = Date.now();
    setShowIdleHint(false);
    idleHintPlayedRef.current = false;

    if (animalId !== currentLayer.correctAnimal) {
      setWrongAnimal(animalId);
      if (wrongAnimalTimerRef.current) clearTimeout(wrongAnimalTimerRef.current);
      wrongAnimalTimerRef.current = setTimeout(() => {
        setWrongAnimal(null);
        wrongAnimalTimerRef.current = null;
      }, 700);
      return;
    }

    // Correct animal: latch on, but the CHILD must now do the work
    setLeaningAnimal(animalId);
    if (leaningTimerRef.current) clearTimeout(leaningTimerRef.current);
    leaningTimerRef.current = setTimeout(() => {
      setLeaningAnimal(null);
      leaningTimerRef.current = null;
    }, 500);
    setHelperAnimal(animalId);
    setWorkProgress(0);
    playGameVoice(null, LAYER_ACTION_LINES[currentLayer.id] || '');
  }, [allCleared, currentLayer, debugMode, isActive, peeling, playGameVoice, showFinale]);

  const clearCurrentLayer = useCallback(() => {
    const completionLine = LAYER_SUCCESS_LINES[currentLayer?.id];
    if (completionLine) {
      playGameVoice(null, completionLine);
    }
    setHelperAnimal(null);
    setWorkProgress(0);
    setIsHolding(false);
    setPeeling(true);
    if (layerAdvanceTimerRef.current) clearTimeout(layerAdvanceTimerRef.current);
    layerAdvanceTimerRef.current = setTimeout(() => {
      setPeeling(false);
      setCurrentLayerIdx((v) => v + 1);
      layerAdvanceTimerRef.current = null;
    }, 900);
  }, [currentLayer?.id, playGameVoice]);

  const isElephantLayer = currentLayer?.correctAnimal === 'elephant';

  // Paint the current layer PNG onto the scrub canvas whenever a helper latches on a scrub layer
  useEffect(() => {
    if (!helperAnimal || isElephantLayer || peeling) return;
    const cv = scrubCanvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    if (!rect.width) return;
    cv.width = rect.width;
    cv.height = rect.height;
    const ctx = cv.getContext('2d');
    const img = new Image();
    img.src = currentLayer.img;
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      // draw current layer to fill canvas, matching object-fit: contain
      const s = Math.min(cv.width / img.width, cv.height / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);

      // Build grid ONLY over visible (opaque) pixels — the art doesn't fill the
      // full square canvas, so cells over transparent corners could never be
      // "cleared", soft-locking the game below CLEAR_THRESHOLD.
      // Bundled imports are same-origin, so getImageData is safe here; if art
      // ever moves to a CDN this will throw a canvas-taint SecurityError.
      const grid = [];
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      for (let gy = 0; gy < GRID; gy += 1) {
        for (let gx = 0; gx < GRID; gx += 1) {
          const px = (gx + 0.5) * (cv.width / GRID);
          const py = (gy + 0.5) * (cv.height / GRID);
          const alpha = data[(Math.floor(py) * cv.width + Math.floor(px)) * 4 + 3];
          if (alpha > 40) grid.push({ px, py, cleared: false });
        }
      }
      scrubGridRef.current = grid;
      scrubTotalRef.current = grid.length || 1;
      scrubDoneRef.current = 0;

      ctx.globalCompositeOperation = 'destination-out';
    };
  }, [helperAnimal, isElephantLayer, peeling, currentLayer]);

  const scrubAt = useCallback((clientX, clientY) => {
    const cv = scrubCanvasRef.current;
    if (!cv || peeling) return;
    if (scrubGridRef.current.length === 0) {
      // Image failed to load or was entirely transparent — don't strand the child
      clearCurrentLayer();
      return;
    }
    const rect = cv.getBoundingClientRect();
    const x = (clientX - rect.left) * (cv.width / rect.width);
    const y = (clientY - rect.top) * (cv.height / rect.height);
    const ctx = cv.getContext('2d');
    const r = cv.width * SCRATCH_R_FRAC;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    for (const cell of scrubGridRef.current) {
      if (!cell.cleared && Math.hypot(cell.px - x, cell.py - y) < r) {
        cell.cleared = true;
        scrubDoneRef.current += 1;
      }
    }
    const p = scrubDoneRef.current / scrubTotalRef.current;
    setWorkProgress(p / CLEAR_THRESHOLD); // bar hits full at threshold
    // no setFeedbackKey here — the obstacle div's key includes feedbackKey and
    // remounts on change (needed for elephant shake), which would wipe the
    // canvas + reset its backing-store size on every scrub tick
    if (p >= CLEAR_THRESHOLD) clearCurrentLayer();
  }, [clearCurrentLayer, peeling]);

  const handleObstacleDown = useCallback((event) => {
    if (debugMode || !helperAnimal || peeling || allCleared) return;
    event.stopPropagation();
    lastTapRef.current = Date.now();
    setShowIdleHint(false);

    if (isElephantLayer) {
      // Press-and-hold push
      setIsHolding(true);
      holdStartRef.current = Date.now();
      if (keepPushingTimerRef.current) clearTimeout(keepPushingTimerRef.current);
      keepPushingTimerRef.current = setTimeout(() => {
        if (holdStartRef.current && !peeling) {
          playGameVoice(VO_PATHS.keepPushing, VO_TEXTS.keepPushing);
        }
      }, 900);
      const tick = () => {
        const p = Math.min(1, (Date.now() - holdStartRef.current) / ELEPHANT_HOLD_MS);
        setWorkProgress(p);
        setFeedbackKey((v) => v + 1); // keeps shake alive
        if (p >= 1) { clearCurrentLayer(); return; }
        holdRafRef.current = requestAnimationFrame(tick);
      };
      holdRafRef.current = requestAnimationFrame(tick);
    } else {
      scrubbingRef.current = true;
      scrubAt(event.clientX, event.clientY);
    }
  }, [allCleared, clearCurrentLayer, debugMode, helperAnimal, isElephantLayer, peeling, scrubAt]);

  const handleObstacleMove = useCallback((event) => {
    if (!scrubbingRef.current || isElephantLayer) return;
    scrubAt(event.clientX, event.clientY);
  }, [isElephantLayer, scrubAt]);

  const handleObstacleUp = useCallback(() => {
    scrubbingRef.current = false;
    if (isElephantLayer) {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
      if (keepPushingTimerRef.current) clearTimeout(keepPushingTimerRef.current);
      setIsHolding(false);
      setWorkProgress(0);
    }
    // scrub progress persists — no reset, unlike swipes
  }, [isElephantLayer]);

  const beginDrag = useCallback((event, target) => {
    if (!debugMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget?.setPointerCapture?.(event.pointerId);
    dragTargetRef.current = target;
  }, [debugMode]);

  const handlePointerMove = useCallback((event) => {
    const dragTarget = dragTargetRef.current;
    const scene = sceneRef.current;
    if (!dragTarget || !scene) return;

    const rect = scene.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

    if (dragTarget.type === 'animal') {
      setEditableAnimalPositions((prev) => ({
        ...prev,
        [dragTarget.id]: {
          ...(prev[dragTarget.id] || TUSK_ANIMAL_POSITIONS[dragTarget.id] || {}),
          x,
          y
        }
      }));
      return;
    }

    if (dragTarget.type === 'obstacle') {
      setEditableObstaclePosition((prev) => ({
        ...prev,
        x,
        y
      }));
    }
  }, []);

  const stopDrag = useCallback(() => {
    dragTargetRef.current = null;
  }, []);

  useEffect(() => () => {
    stopGameAudio();
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (wrongAnimalTimerRef.current) clearTimeout(wrongAnimalTimerRef.current);
    if (leaningTimerRef.current) clearTimeout(leaningTimerRef.current);
    if (layerAdvanceTimerRef.current) clearTimeout(layerAdvanceTimerRef.current);
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    if (keepPushingTimerRef.current) clearTimeout(keepPushingTimerRef.current);
  }, [stopGameAudio]);

  if (hideElements || (!isActive && !showObstacleOnly)) return null;

  const staticPreview = !isActive && showObstacleOnly;
  const activeAnimalPositions = { ...TUSK_ANIMAL_POSITIONS, ...editableAnimalPositions };
  const activeObstaclePosition = { scale: 1, ...TUSK_OBSTACLE_POSITION, ...editableObstaclePosition };
  const obstacleZIndex = DEPTH_Z_INDEX[activeObstaclePosition.depth] ?? DEPTH_Z_INDEX['between-middle-front'];

  let displayImg;
  if (allCleared) {
    displayImg = FINAL_IMAGE;
  } else if (peeling) {
    const nextIdx = currentLayerIdx + 1;
    displayImg = nextIdx < LAYERS.length ? LAYERS[nextIdx].img : FINAL_IMAGE;
  } else {
    displayImg = currentLayer.img;
  }

  return (
    <div
      ref={sceneRef}
      className={`tusk-path-game ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onPointerLeave={stopDrag}
    >
      {SHOW_TUSK_DEBUG && !staticPreview && (
        <button
          type="button"
          className="tusk-debug-panel-toggle"
          onClick={() => setShowDebugPanel((prev) => !prev)}
        >
          {showDebugPanel ? 'Hide Panel' : 'Show Panel'}
        </button>
      )}

      {SHOW_TUSK_DEBUG && !staticPreview && showDebugPanel && (
        <div className="tusk-edit-bar">
          <div className="tusk-edit-help">
            Drag the real animals or obstacle on screen, then press Save.
          </div>
          <button
            type="button"
            className={`tusk-edit-toggle ${debugMode ? 'active' : ''}`}
            onClick={() => setDebugMode((prev) => !prev)}
          >
            {debugMode ? 'Editing On' : 'Editing Off'}
          </button>
          {ANIMALS.map((animal) => (
            <button
              key={animal.id}
              type="button"
              className={`tusk-edit-item-btn ${selectedEditorItem === animal.id ? 'active' : ''}`}
              onClick={() => setSelectedEditorItem(animal.id)}
            >
              {animal.name}
            </button>
          ))}
          <button
            type="button"
            className={`tusk-edit-item-btn ${selectedEditorItem === 'obstacle' ? 'active' : ''}`}
            onClick={() => setSelectedEditorItem('obstacle')}
          >
            Obstacle
          </button>
          {selectedEditorItem === 'obstacle' && (
            <>
              <div className="tusk-edit-section-label">Depth</div>
              <div className="tusk-edit-depths">
                {DEBUG_DEPTHS.map((depth) => (
                  <button
                    key={depth}
                    type="button"
                    className={`tusk-edit-depth-btn ${activeObstaclePosition.depth === depth ? 'active' : ''}`}
                    onClick={() => setEditableObstaclePosition((prev) => ({ ...prev, depth }))}
                  >
                    {depth}
                  </button>
                ))}
              </div>
              <div className="tusk-edit-section-label">Scale</div>
              <div className="tusk-edit-depths">
                {OBSTACLE_SCALE_STEPS.map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    className={`tusk-edit-depth-btn ${Number(activeObstaclePosition.scale || 1) === scale ? 'active' : ''}`}
                    onClick={() => setEditableObstaclePosition((prev) => ({ ...prev, scale }))}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </>
          )}
          <button type="button" className="tusk-edit-copy-btn" onClick={copyLayout}>Copy</button>
          <button type="button" className="tusk-edit-save-btn" onClick={() => saveLayout()}>Save</button>
        </div>
      )}

      <img className="tusk-path-layer tusk-path-layer-back" src={bgBackImg} alt="" />

      <div
        key={`boulder-${feedbackKey}`}
        className={`tusk-path-obstacle boulder active
          ${peeling ? 'peeling' : ''}
          ${peeling && currentLayerIdx === LAYERS.length - 1 ? 'final-reveal' : ''}
          ${showIdleHint && !peeling ? 'hint' : ''}
          ${!peeling && currentLayer && helperAnimal && isElephantLayer ? `feedback-${currentLayer.feedback}` : ''}
          ${helperAnimal && !peeling ? 'workable' : ''}
          ${allCleared ? 'cleared' : ''}`}
        style={{
          left: `${activeObstaclePosition.x}%`,
          top: `${activeObstaclePosition.y}%`,
          zIndex: obstacleZIndex,
          '--obstacle-scale': activeObstaclePosition.scale || 1
        }}
        onPointerDown={debugMode ? (event) => {
          setSelectedEditorItem('obstacle');
          beginDrag(event, { type: 'obstacle' });
        } : handleObstacleDown}
        onPointerMove={debugMode ? undefined : handleObstacleMove}
        onPointerUp={debugMode ? undefined : handleObstacleUp}
      >
        <img
          src={helperAnimal && !isElephantLayer && !peeling
            ? (currentLayerIdx + 1 < LAYERS.length ? LAYERS[currentLayerIdx + 1].img : FINAL_IMAGE)
            : displayImg}
          alt="" draggable={false}
        />
        {helperAnimal && !isElephantLayer && !peeling && !allCleared && (
          <canvas
            ref={scrubCanvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
          />
        )}
        {debugMode && (
          <div className={`tusk-debug-label ${selectedEditorItem === 'obstacle' ? 'selected' : ''}`}>
            Obstacle ({Math.round(activeObstaclePosition.x)}, {Math.round(activeObstaclePosition.y)}) {activeObstaclePosition.scale || 1}x
          </div>
        )}
      </div>

      {ANIMALS.map((animal) => {
        const isWrong = wrongAnimal === animal.id;
        const isCorrect = currentLayer?.correctAnimal === animal.id;
        const isHinted = showIdleHint && isCorrect && !peeling && !showFinale && !allCleared;
        const isLeaning = leaningAnimal === animal.id;
        const isHelping = helperAnimal === animal.id;
        const pos = activeAnimalPositions[animal.id] || TUSK_ANIMAL_POSITIONS[animal.id];

        return (
          <div
            key={animal.id}
            className={`tusk-path-animal ${staticPreview ? 'static-preview' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isLeaning ? 'leaning' : ''} ${isHelping ? 'helping' : ''} ${showFinale ? 'celebrate' : ''} ${debugMode ? 'debug-draggable' : ''}`}
            style={{
              left: `${isHelping ? activeObstaclePosition.x - 16 : pos.x}%`,
              top: `${isHelping ? activeObstaclePosition.y + 12 : pos.y}%`,
              '--animal-scale': ANIMAL_SIZES[animal.id] || 1
            }}
            onPointerDown={debugMode ? (event) => {
              setSelectedEditorItem(animal.id);
              beginDrag(event, { type: 'animal', id: animal.id });
            } : undefined}
            onClick={staticPreview ? undefined : (event) => handleAnimalTap(animal.id, event)}
          >
            <img src={animal.img} alt={animal.name} draggable={false} />
            {debugMode && (
              <div className={`tusk-debug-label ${selectedEditorItem === animal.id ? 'selected' : ''}`}>
                {animal.name} ({Math.round(pos.x)}, {Math.round(pos.y)})
              </div>
            )}
          </div>
        );
      })}

      {!staticPreview && helperAnimal && !peeling && !allCleared && (
        <>
          <div
            className="tusk-path-progress-bar"
            style={{ left: `${activeObstaclePosition.x}%`, top: `${activeObstaclePosition.y - 14}%` }}
          >
            <div className="tusk-path-progress-fill" style={{ width: `${workProgress * 100}%` }} />
          </div>
          <div className="tusk-path-tap-hint">
            {WORK_HINT_TEXT[currentLayer?.feedback] || 'Help clear the obstacle!'}
          </div>
        </>
      )}

      {!staticPreview && (
        <div className="tusk-path-progress">
          {LAYERS.map((layer, idx) => (
            <div
              key={layer.id}
              className={`tusk-path-dot ${idx < currentLayerIdx ? 'done' : ''} ${idx === currentLayerIdx && !showFinale ? 'current' : ''}`}
            />
          ))}
        </div>
      )}

      {!staticPreview && (
        <div className="tusk-path-counter">
          Path: <span>{Math.min(currentLayerIdx, 4)}</span> / 4
        </div>
      )}

      {!staticPreview && showFinale && (
        <div className="tusk-path-finale">
          <div className="tusk-path-finale-glow" />
          <img src={tuskImg} alt="Sacred Tusk" className="tusk-path-finale-tusk" draggable={false} />
        </div>
      )}
    </div>
  );
};

export default TuskPathGame;
