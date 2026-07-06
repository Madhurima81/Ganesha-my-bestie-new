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
// Null paths make playAudio a silent no-op; the scene shell's voice guidance
// ('tusk' / 'idleTusk' prompts) covers instruction until real files land.
const VO_PATHS = {
  intro: null,
  elephantHint: null,
  monkeyHint: null,
  peacockHint: null,
  cowHint: null,
  finale: null
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

const FINAL_IMAGE = blockageCleared;
const IDLE_HINT_MS = 6000;
const ANIMAL_POSITION_STORAGE_KEY = 'symbol_mountain_eyes_animal_positions_v2';
const OBSTACLE_POSITION_STORAGE_KEY = 'symbol_mountain_tusk_obstacle_position_v1';
const DEBUG_DEPTHS = ['behind-middle', 'between-middle-front', 'in-front'];
const OBSTACLE_SCALE_STEPS = [1, 1.25, 1.5, 1.75, 2];
const DEPTH_Z_INDEX = {
  'behind-back': 2,
  'behind-middle': 4,
  'between-middle-front': 6,
  'in-front': 12
};

const playAudio = (src, volume = 0.9) => {
  if (!src) return null;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
};

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const TuskPathGame = ({
  isActive = true,
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

  const [currentLayerIdx, setCurrentLayerIdx] = useState(0);
  const [peeling, setPeeling] = useState(false);
  const [wrongAnimal, setWrongAnimal] = useState(null);
  const [leaningAnimal, setLeaningAnimal] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
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

  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playAudio(VO_PATHS.intro);
  }, [isActive, introShown]);

  useEffect(() => {
    if (!isActive || showFinale || peeling || allCleared) return;
    const check = () => {
      if (Date.now() - lastTapRef.current >= IDLE_HINT_MS) {
        setShowIdleHint(true);
        if (currentLayer?.hintVo) {
          playAudio(currentLayer.hintVo);
          lastTapRef.current = Date.now();
        }
      }
    };
    idleTimerRef.current = setInterval(check, 1000);
    return () => clearInterval(idleTimerRef.current);
  }, [isActive, showFinale, peeling, allCleared, currentLayer]);

  useEffect(() => {
    if (!allCleared) return;
    setShowFinale(true);
    playAudio(VO_PATHS.finale);
    const timeoutId = setTimeout(() => {
      onGameComplete?.({ layersCleared: LAYERS.length, totalCleared: 4 });
    }, 3800);
    return () => clearTimeout(timeoutId);
  }, [allCleared, onGameComplete]);

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

    if (animalId !== currentLayer.correctAnimal) {
      setWrongAnimal(animalId);
      setTimeout(() => setWrongAnimal(null), 700);
      return;
    }

    setFeedbackKey((value) => value + 1);
    setLeaningAnimal(animalId);
    setTimeout(() => setLeaningAnimal(null), 500);

    setPeeling(true);
    setTimeout(() => {
      setPeeling(false);
      setCurrentLayerIdx((value) => value + 1);
    }, 900);
  }, [allCleared, currentLayer, debugMode, isActive, peeling, showFinale]);

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
          ${!peeling && currentLayer ? `feedback-${currentLayer.feedback}` : ''}
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
        } : undefined}
      >
        <img src={displayImg} alt="" draggable={false} />
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
        const pos = activeAnimalPositions[animal.id] || TUSK_ANIMAL_POSITIONS[animal.id];

        return (
          <div
            key={animal.id}
            className={`tusk-path-animal ${staticPreview ? 'static-preview' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isLeaning ? 'leaning' : ''} ${showFinale ? 'celebrate' : ''} ${debugMode ? 'debug-draggable' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
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
