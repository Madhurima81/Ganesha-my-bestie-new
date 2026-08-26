import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './NirvighnamGame.css';

import sharedSceneBg from './assets/images/saurakoti-bg.png';
import turtleSadImg from './assets/images/nirvighnam/nir-turtle-sad.png';
import turtleHappyImg from './assets/images/nirvighnam/nir-turtle-happy.png';
import nestImg from './assets/images/nirvighnam/nest.png';
import stoneImg from './assets/images/nirvighnam/stone.png';
import branchImg from './assets/images/nirvighnam/branch.png';
import reedImg from './assets/images/nirvighnam/reed.png';
import { NIRVIGHNAM_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Nir', 'vigh', 'nam'];
const AUDIO = { syllables: ['nir', 'vigh', 'nam'] };

const OBSTACLES = [
  { ...NIRVIGHNAM_LAYOUT.obstacles[0], img: stoneImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[1], img: branchImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[2], img: reedImg },
];

// One "ground" drop spot per obstacle, up on the grass bank above the river —
// drag the obstacle there (any direction of travel) to clear it.
const DROP_ZONES = Object.fromEntries(
  OBSTACLES.map((obs) => [obs.id, { l: obs.l, t: obs.t - 22 }])
);

const DROP_RADIUS = 12; // % distance to snap into the drop zone
const NIRV_DEBUG_STORAGE_KEY = 'shloka_nirvighnam_layout_debug_v1';

const getDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debug');
};

const cloneLayout = (layout) => JSON.parse(JSON.stringify(layout));

const createDebugLayout = () => ({
  ...cloneLayout(NIRVIGHNAM_LAYOUT),
  dropZones: cloneLayout(DROP_ZONES),
});

const loadDebugLayout = () => {
  const fallback = createDebugLayout();
  if (!getDebugEnabled()) return fallback;

  try {
    const saved = window.localStorage.getItem(NIRV_DEBUG_STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      turtleStart: { ...fallback.turtleStart, ...parsed.turtleStart },
      nest: { ...fallback.nest, ...parsed.nest },
      obstacles: fallback.obstacles.map((obstacle, index) => ({
        ...obstacle,
        ...(parsed.obstacles?.[index] || {}),
      })),
      dropZones: {
        ...fallback.dropZones,
        ...parsed.dropZones,
      },
      swimPath: fallback.swimPath.map((waypoint, index) => ({
        ...waypoint,
        ...(parsed.swimPath?.[index] || {}),
      })),
      pathLine: { ...fallback.pathLine, ...parsed.pathLine },
    };
  } catch (error) {
    console.warn('Unable to load Nirvighnam layout debug values:', error);
    return fallback;
  }
};

const obstacleImageById = {
  stone: stoneImg,
  branch: branchImg,
  reed: reedImg,
};

const debugOptions = [
  { type: 'object', key: 'turtleStart', label: 'Turtle Start', fields: ['l', 't'] },
  { type: 'root', key: 'turtleWidth', label: 'Turtle Width', fields: ['turtleWidth'] },
  { type: 'object', key: 'nest', label: 'Nest', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 0, key: 'obstacle-0', label: 'Obstacle Stone', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 1, key: 'obstacle-1', label: 'Obstacle Branch', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 2, key: 'obstacle-2', label: 'Obstacle Reeds', fields: ['l', 't', 'w'] },
  { type: 'dropZone', id: 'stone', key: 'drop-stone', label: 'Drop Zone Stone', fields: ['l', 't'] },
  { type: 'dropZone', id: 'branch', key: 'drop-branch', label: 'Drop Zone Branch', fields: ['l', 't'] },
  { type: 'dropZone', id: 'reed', key: 'drop-reed', label: 'Drop Zone Reeds', fields: ['l', 't'] },
  { type: 'swimPath', index: 0, key: 'swim-0', label: 'Swim Waypoint 1', fields: ['l', 't'] },
  { type: 'swimPath', index: 1, key: 'swim-1', label: 'Swim Waypoint 2', fields: ['l', 't'] },
  { type: 'swimPath', index: 2, key: 'swim-2', label: 'Swim Waypoint 3', fields: ['l', 't'] },
  { type: 'swimPath', index: 3, key: 'swim-3', label: 'Swim Waypoint 4', fields: ['l', 't'] },
  { type: 'pathLine', key: 'pathLine', label: 'Path Line', fields: ['x1', 'y1', 'x2', 'y2'] },
];

export default function NirvighnamGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const debugEnabled = getDebugEnabled();
  const [debugLayout, setDebugLayout] = useState(loadDebugLayout);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState(debugOptions[0].key);
  const [phase, setPhase] = useState('play');
  const [cleared, setCleared] = useState([]); // array of cleared obstacle ids
  const [litCount, setLitCount] = useState(0);
  const [turtlePos, setTurtlePos] = useState(() => loadDebugLayout().turtleStart);
  const [isSwimming, setIsSwimming] = useState(false);

  // Drag state
  const [dragging, setDragging] = useState(null); // obstacle id being dragged
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // offset in % from original pos

  const stageRef = useRef(null);
  const dragStartRef = useRef(null); // { clientX, clientY, obstacleId }
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const phaseRef = useRef('play');
  const doneAnnouncedRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const swimDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const previousClearedCountRef = useRef(0);
  const voFallbackRef = useRef(null);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);
  const defaultLayout = useMemo(createDebugLayout, []);
  const activeLayout = debugEnabled ? debugLayout : defaultLayout;
  const obstacles = useMemo(() => activeLayout.obstacles.map((obstacle) => ({
    ...obstacle,
    img: obstacleImageById[obstacle.id],
  })), [activeLayout.obstacles]);
  const dropZones = activeLayout.dropZones;
  const swimPath = activeLayout.swimPath;
  const selectedDebugOption = debugOptions.find((option) => option.key === selectedDebugKey) || debugOptions[0];
  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? `clear-${cleared.length}` : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15000,
    level3Delay: 22000,
  });

  useEffect(() => {
    if (!debugEnabled) return;
    window.localStorage.setItem(NIRV_DEBUG_STORAGE_KEY, JSON.stringify(debugLayout));
  }, [debugEnabled, debugLayout]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete;
    onGameCompleteRef.current = onGameComplete;
  }, [onPhaseComplete, onGameComplete]);

  // Reset on deactivate
  useEffect(() => {
    if (!isActive) {
      setPhase('play');
      setCleared([]);
      setLitCount(0);
      setTurtlePos(activeLayout.turtleStart);
      setIsSwimming(false);
      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };
      phaseRef.current = 'play';
      doneAnnouncedRef.current = false;
      successVoDoneRef.current = false;
      swimDoneRef.current = false;
      completionScheduledRef.current = false;
      previousClearedCountRef.current = 0;
    }
  }, [activeLayout.turtleStart, isActive]);

  useEffect(() => {
    if (phase === 'play' && cleared.length === 0 && !dragging) {
      setTurtlePos(activeLayout.turtleStart);
    }
  }, [activeLayout.turtleStart, phase, cleared.length, dragging]);

  useEffect(() => {
    const previousCount = previousClearedCountRef.current;
    const currentCount = cleared.length;

    setLitCount(Math.min(SYLLABLES.length, currentCount));

    if (currentCount > previousCount) {
      window.setTimeout(() => onMicroWin?.(), 0);
    }

    if (
      currentCount >= obstacles.length &&
      phaseRef.current === 'play'
    ) {
      setPhase('swim');
    }

    previousClearedCountRef.current = currentCount;
  }, [cleared, obstacles.length, onMicroWin]);

  const getStageRect = useCallback(() => {
    return stageRef.current?.getBoundingClientRect();
  }, []);

  // Start drag
  const handlePointerDown = useCallback((e, obstacleId) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (cleared.some(c => c.id === obstacleId)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    stopSceneVoice?.();
    markInteraction();
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      obstacleId,
    };
    setDragging(obstacleId);
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
  }, [cleared, isPaused, markInteraction, stopSceneVoice]);

  // Move drag
  useEffect(() => {
    if (!dragging || !isActive) return;

    const handleMove = (e) => {
      if (!dragStartRef.current) return;
      const rect = getStageRect();
      if (!rect) return;
      const dx = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dy = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });
    };

    const handleUp = () => {
      if (!dragStartRef.current) return;
      const rect = getStageRect();
      if (!rect) { setDragging(null); return; }

      const obstacleId = dragStartRef.current.obstacleId;
      const obstacle = obstacles.find((o) => o.id === obstacleId);
      const latestOffset = dragOffsetRef.current;
      const currentL = obstacle.l + latestOffset.x;
      const currentT = obstacle.t + latestOffset.y;
      const zone = dropZones[obstacleId];
      const distToZone = Math.hypot(currentL - zone.l, currentT - zone.t);

      if (distToZone < DROP_RADIUS) {
        setCleared(prev => [...prev, { id: obstacleId }]);
      } else {
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
      }

      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, dropZones, getStageRect, isActive, obstacles]);

  // Turtle hop sequence
  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !swimDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 500);
  }, []);

  useEffect(() => {
    if (phase !== 'swim' || doneAnnouncedRef.current) return;
    doneAnnouncedRef.current = true;
    const timers = [];

    setIsSwimming(true);

    if (playSceneLine) {
      playWord?.('nirvighnam');
      playSceneLine('nirv_done', () => {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }, { stripLeadingText: 'Nirvighnam' });
      // iOS Safari can silently drop utterance onend/onerror — don't let completion hang on VO
      voFallbackRef.current = window.setTimeout(() => {
        if (!successVoDoneRef.current) {
          successVoDoneRef.current = true;
          completeAfterSuccess();
        }
      }, 8000);
    } else {
      successVoDoneRef.current = true;
    }

    swimPath.forEach((waypoint, index) => {
      const hopTimer = window.setTimeout(() => {
        setTurtlePos(waypoint);
        if (index === swimPath.length - 1) {
          const settleTimer = window.setTimeout(() => {
            setIsSwimming(false);
            swimDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          }, 550);
          timers.push(settleTimer);
        }
      }, index * 580);
      timers.push(hopTimer);
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [completeAfterSuccess, phase, playSceneLine, playWord, swimPath]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
  }, []);

  if (!isActive) return null;

  const nextObstacleId = obstacles.find((obs) => !cleared.some((entry) => entry.id === obs.id))?.id;
  const isDone = phase === 'done';

  const updateDebugValue = (field, rawValue) => {
    const value = Number(rawValue);
    if (Number.isNaN(value)) return;

    setDebugLayout((current) => {
      const next = cloneLayout(current);
      const option = selectedDebugOption;

      if (option.type === 'root') next[field] = value;
      if (option.type === 'object') next[option.key][field] = value;
      if (option.type === 'obstacle') next.obstacles[option.index][field] = value;
      if (option.type === 'dropZone') next.dropZones[option.id][field] = value;
      if (option.type === 'swimPath') next.swimPath[option.index][field] = value;
      if (option.type === 'pathLine') next.pathLine[field] = value;

      return next;
    });
  };

  const getDebugValue = (field) => {
    const option = selectedDebugOption;
    if (option.type === 'root') return activeLayout[field];
    if (option.type === 'object') return activeLayout[option.key][field];
    if (option.type === 'obstacle') return activeLayout.obstacles[option.index][field];
    if (option.type === 'dropZone') return activeLayout.dropZones[option.id][field];
    if (option.type === 'swimPath') return activeLayout.swimPath[option.index][field];
    if (option.type === 'pathLine') return activeLayout.pathLine[field];
    return '';
  };

  const copyDebugLayout = () => {
    const payload = 'export const NIRVIGHNAM_LAYOUT = ' + JSON.stringify({
      turtleStart: activeLayout.turtleStart,
      turtleWidth: activeLayout.turtleWidth,
      turtleFlip: activeLayout.turtleFlip,
      nest: activeLayout.nest,
      obstacles: activeLayout.obstacles,
      swimPath: activeLayout.swimPath,
      pathLine: activeLayout.pathLine,
    }, null, 2) + ';';

    console.log('Nirvighnam layout JSON:', payload);
    window.prompt('Copy Nirvighnam layout', payload);
  };

  return (
    <div className={`nirv-game ${hideElements ? 'is-hidden' : ''}`}>
      <div ref={stageRef} className="nirv-stage" style={{ backgroundImage: `url(${sharedSceneBg})` }}>

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            playSyllable?.(syllable);
          }}
        />

        {phase === 'play' && (
          <p className="nirv-hint">
            {(hintLevel === 0 || hintLevel === 1) && 'Drag the obstacle away.'}
            {hintLevel === 2 && 'Clear the next obstacle.'}
            {hintLevel >= 3 && 'Keep clearing the path.'}
          </p>
        )}

        {isDone && (
          <p className="nirv-doneline">
            You cleared the path! The turtle reached her nest!
          </p>
        )}

        {/* Nest — always visible */}
        <div
          className="nirv-layer nirv-nest"
          style={{
            left: `${activeLayout.nest.l}%`,
            top: `${activeLayout.nest.t}%`,
            width: `${activeLayout.nest.w}%`,
            zIndex: 5,
            scale: activeLayout.nest.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={nestImg} alt="nest" draggable={false} />
        </div>

        {/* Turtle */}
        <div
          className={`nirv-layer nirv-turtle ${isSwimming ? 'is-swimming' : phase === 'play' ? 'nirv-breathe' : ''} ${isDone ? 'at-nest' : ''}`}
          style={{
            left: `${turtlePos.l}%`,
            top: `${turtlePos.t}%`,
            width: `${activeLayout.turtleWidth}%`,
            zIndex: 15,
            scale: activeLayout.turtleFlip ? '-1 1' : '1 1',
          }}
        >
          <img
            src={phase === 'play' ? turtleSadImg : turtleHappyImg}
            alt="turtle"
            draggable={false}
          />
        </div>

        {/* Drop zones — one ground spot per obstacle */}
        {obstacles.map((obs) => {
          if (cleared.some((c) => c.id === obs.id)) return null;
          const zone = dropZones[obs.id];
          const isNext = obs.id === nextObstacleId;
          return (
            <div
              key={`zone-${obs.id}`}
              className={`nirv-drop-zone ${isNext && hintLevel >= 1 ? 'pulse' : ''} ${isNext && hintLevel >= 2 ? 'hint-glow' : ''}`}
              style={{ left: `${zone.l}%`, top: `${zone.t}%`, width: `${obs.w}%` }}
            />
          );
        })}

        {/* Obstacles */}
        {obstacles.map((obs) => {
          const isCleared = cleared.some(c => c.id === obs.id);
          const isBeingDragged = dragging === obs.id;
          const zone = dropZones[obs.id];
          const offsetX = isBeingDragged ? dragOffset.x : 0;
          const offsetY = isBeingDragged ? dragOffset.y : 0;

          return (
            <div
              key={obs.id}
              className={`nirv-layer nirv-obstacle ${isCleared ? 'is-cleared' : ''} ${isBeingDragged ? 'is-dragging' : ''} ${phase === 'play' && !isCleared && !(obs.id === nextObstacleId && hintLevel >= 1) ? 'is-tappable' : ''} ${phase === 'play' && !isCleared && obs.id === nextObstacleId && hintLevel >= 1 ? 'pulse' : ''} ${phase === 'play' && !isCleared && obs.id === nextObstacleId && hintLevel >= 2 ? 'hint-glow' : ''}`}
              style={{
                left: `${isCleared ? zone.l : obs.l + offsetX}%`,
                top: `${isCleared ? zone.t : obs.t + offsetY}%`,
                width: `${obs.w}%`,
                zIndex: isBeingDragged ? 30 : 10,
                scale: obs.flip ? '-1 1' : '1 1',
              }}
              onPointerDown={(e) => handlePointerDown(e, obs.id)}
            >
              <img src={obs.img} alt={obs.label} draggable={false} />
            </div>
          );
        })}

        {/* Faint path line */}
        <svg className="nirv-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={activeLayout.pathLine.x1}
            y1={activeLayout.pathLine.y1}
            x2={activeLayout.pathLine.x2}
            y2={activeLayout.pathLine.y2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.6"
            strokeDasharray="1.5 2"
          />
        </svg>

        <GestureDemo
          type="drag"
          from={{ x: obstacles[0].l, y: obstacles[0].t }}
          to={{ x: dropZones[obstacles[0].id].l, y: dropZones[obstacles[0].id].t }}
          active={phase === 'play' && cleared.length === 0 && !showDebugPanel}
          idleDelay={3000}
        />

        {debugEnabled && (
          <>
            <button
              type="button"
              className="nirv-debug-toggle"
              onClick={() => setShowDebugPanel((prev) => !prev)}
            >
              {showDebugPanel ? 'Hide Layout Debug' : 'Layout Debug'}
            </button>

            {showDebugPanel && (
              <>
                <div className="nirv-debug-marker" style={{ left: `${activeLayout.turtleStart.l}%`, top: `${activeLayout.turtleStart.t}%` }}>
                  turtle start
                </div>
                <div className="nirv-debug-marker" style={{ left: `${activeLayout.nest.l}%`, top: `${activeLayout.nest.t}%` }}>
                  nest
                </div>
                {obstacles.map((obstacle) => (
                  <div
                    key={`debug-obstacle-${obstacle.id}`}
                    className="nirv-debug-marker is-obstacle"
                    style={{ left: `${obstacle.l}%`, top: `${obstacle.t}%` }}
                  >
                    {obstacle.label}
                  </div>
                ))}
                {Object.entries(dropZones).map(([id, zone]) => (
                  <div
                    key={`debug-drop-${id}`}
                    className="nirv-debug-marker is-drop"
                    style={{ left: `${zone.l}%`, top: `${zone.t}%` }}
                  >
                    drop {id}
                  </div>
                ))}
                {swimPath.map((waypoint, index) => (
                  <div
                    key={`debug-swim-${index}`}
                    className="nirv-debug-marker is-swim"
                    style={{ left: `${waypoint.l}%`, top: `${waypoint.t}%` }}
                  >
                    swim {index + 1}
                  </div>
                ))}

                <div className="nirv-debug-panel">
                  <div className="nirv-debug-title">Nirvighnam Placement</div>
                  <label className="nirv-debug-row">
                    <span>Element</span>
                    <select value={selectedDebugKey} onChange={(event) => setSelectedDebugKey(event.target.value)}>
                      {debugOptions.map((option) => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  {selectedDebugOption.fields.map((field) => (
                    <label className="nirv-debug-row" key={field}>
                      <span>{field}</span>
                      <input
                        type="range"
                        min={field === 'turtleWidth' || field === 'w' ? 1 : 0}
                        max={field === 'turtleWidth' || field === 'w' ? 30 : 100}
                        step="0.1"
                        value={getDebugValue(field)}
                        onChange={(event) => updateDebugValue(field, event.target.value)}
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={getDebugValue(field)}
                        onChange={(event) => updateDebugValue(field, event.target.value)}
                      />
                    </label>
                  ))}

                  <div className="nirv-debug-actions">
                    <button type="button" onClick={copyDebugLayout}>Copy Layout</button>
                    <button
                      type="button"
                      onClick={() => {
                        window.localStorage.removeItem(NIRV_DEBUG_STORAGE_KEY);
                        const nextLayout = createDebugLayout();
                        setDebugLayout(nextLayout);
                        setTurtlePos(nextLayout.turtleStart);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                  <pre>{JSON.stringify(activeLayout, null, 2)}</pre>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
