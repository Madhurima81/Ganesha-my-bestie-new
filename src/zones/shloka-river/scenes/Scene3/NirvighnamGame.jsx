import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import './NirvighnamGame.css';

import sharedSceneBg from './assets/images/saurakoti-bg.png';
import turtleSadImg from './assets/images/Nirvighnam/nir-turtle-sad.png';
import turtleHappyImg from './assets/images/Nirvighnam/nir-turtle-happy.png';
import nestImg from './assets/images/Nirvighnam/nest.png';
import stoneImg from './assets/images/Nirvighnam/stone.png';
import branchImg from './assets/images/Nirvighnam/branch.png';
import reedImg from './assets/images/Nirvighnam/reed.png';
import { NIRVIGHNAM_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Nir', 'vigh', 'nam'];

const TURTLE_START = NIRVIGHNAM_LAYOUT.turtleStart;
const NEST_POS = NIRVIGHNAM_LAYOUT.nest;

const OBSTACLES = [
  { ...NIRVIGHNAM_LAYOUT.obstacles[0], img: stoneImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[1], img: branchImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[2], img: reedImg },
];

const SWIM_PATH = NIRVIGHNAM_LAYOUT.swimPath;

const DRAG_THRESHOLD = 0.12; // 12% of container width/height to clear

export default function NirvighnamGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
}) {
  const [phase, setPhase] = useState('play');
  const [cleared, setCleared] = useState([]); // array of cleared obstacle ids
  const [litCount, setLitCount] = useState(0);
  const [turtlePos, setTurtlePos] = useState(TURTLE_START);
  const [isSwimming, setIsSwimming] = useState(false);

  // Drag state
  const [dragging, setDragging] = useState(null); // obstacle id being dragged
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // offset in % from original pos

  const stageRef = useRef(null);
  const dragStartRef = useRef(null); // { clientX, clientY, obstacleId }
  const phaseRef = useRef('play');
  const doneAnnouncedRef = useRef(false);
  const previousClearedCountRef = useRef(0);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);

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
      setTurtlePos(TURTLE_START);
      setIsSwimming(false);
      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      phaseRef.current = 'play';
      doneAnnouncedRef.current = false;
      previousClearedCountRef.current = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (phase === 'play' && cleared.length === 0 && !dragging) {
      setTurtlePos(TURTLE_START);
    }
  }, [phase, cleared.length, dragging]);

  useEffect(() => {
    const previousCount = previousClearedCountRef.current;
    const currentCount = cleared.length;

    setLitCount(Math.min(SYLLABLES.length, currentCount));

    if (currentCount > previousCount) {
      window.setTimeout(() => onMicroWin?.(), 0);
    }

    if (
      currentCount >= OBSTACLES.length &&
      phaseRef.current === 'play'
    ) {
      setPhase('swim');
    }

    previousClearedCountRef.current = currentCount;
  }, [cleared, onMicroWin]);

  const getStageRect = useCallback(() => {
    return stageRef.current?.getBoundingClientRect();
  }, []);

  // Start drag
  const handlePointerDown = useCallback((e, obstacleId) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (cleared.includes(obstacleId)) return;
    e.preventDefault();
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      obstacleId,
    };
    setDragging(obstacleId);
    setDragOffset({ x: 0, y: 0 });
  }, [cleared, isPaused]);

  // Move drag
  useEffect(() => {
    if (!dragging || !isActive) return;

    const handleMove = (e) => {
      if (!dragStartRef.current) return;
      const rect = getStageRect();
      if (!rect) return;
      const dx = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dy = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      setDragOffset({ x: dx, y: dy });
    };

    const handleUp = () => {
      if (!dragStartRef.current) return;
      const rect = getStageRect();
      if (!rect) { setDragging(null); return; }

      const dx = Math.abs(dragOffset.x) / 100;
      const dy = Math.abs(dragOffset.y) / 100;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > DRAG_THRESHOLD) {
        // Cleared!
        const obstacleId = dragStartRef.current.obstacleId;
        setCleared(prev => [...prev, obstacleId]);
      }

      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
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
  }, [dragging, dragOffset, getStageRect, isActive, onMicroWin]);

  // Turtle hop sequence
  useEffect(() => {
    if (phase !== 'swim' || doneAnnouncedRef.current) return;
    doneAnnouncedRef.current = true;
    const timers = [];

    setIsSwimming(true);

    SWIM_PATH.forEach((waypoint, index) => {
      const hopTimer = window.setTimeout(() => {
        setTurtlePos(waypoint);
        if (index === SWIM_PATH.length - 1) {
          const settleTimer = window.setTimeout(() => {
            setIsSwimming(false);
            setPhase('done');
          }, 550);
          timers.push(settleTimer);
        }
      }, index * 580);
      timers.push(hopTimer);
    });

    return () => timers.forEach(t => window.clearTimeout(t));
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;

    const completionTimer = window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 800);

    return () => window.clearTimeout(completionTimer);
  }, [phase]);

  if (!isActive) return null;

  const activeObstacles = OBSTACLES.filter(o => !cleared.includes(o.id));
  const isDone = phase === 'done';

  return (
    <div className={`nirv-game ${hideElements ? 'is-hidden' : ''}`}>
      <div ref={stageRef} className="nirv-stage" style={{ backgroundImage: `url(${sharedSceneBg})` }}>

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />

        {phase === 'play' && (
          <p className="nirv-hint">
            {cleared.length === 0
              ? 'Drag each obstacle away so the turtle can reach her nest'
              : `${OBSTACLES.length - cleared.length} left — keep clearing!`}
          </p>
        )}

        {isDone && (
          <p className="nirv-doneline">
            The path is clear!
          </p>
        )}

        {/* Nest — always visible */}
        <div
          className="nirv-layer nirv-nest"
          style={{
            left: `${NEST_POS.l}%`,
            top: `${NEST_POS.t}%`,
            width: `${NEST_POS.w}%`,
            zIndex: 5,
            scale: NEST_POS.flip ? '-1 1' : '1 1',
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
            width: `${NIRVIGHNAM_LAYOUT.turtleWidth}%`,
            zIndex: 15,
            scale: NIRVIGHNAM_LAYOUT.turtleFlip ? '-1 1' : '1 1',
          }}
        >
          <img
            src={phase === 'play' ? turtleSadImg : turtleHappyImg}
            alt="turtle"
            draggable={false}
          />
        </div>

        {/* Obstacles */}
        {OBSTACLES.map((obs) => {
          const isCleared = cleared.includes(obs.id);
          const isBeingDragged = dragging === obs.id;
          const offsetX = isBeingDragged ? dragOffset.x : 0;
          const offsetY = isBeingDragged ? dragOffset.y : 0;

          return (
            <div
              key={obs.id}
              className={`nirv-layer nirv-obstacle ${isCleared ? 'is-cleared' : ''} ${isBeingDragged ? 'is-dragging' : ''} ${phase === 'play' && !isCleared ? 'is-tappable' : ''}`}
              style={{
                left: `${obs.l + offsetX}%`,
                top: `${obs.t + offsetY}%`,
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
            x1={NIRVIGHNAM_LAYOUT.pathLine.x1}
            y1={NIRVIGHNAM_LAYOUT.pathLine.y1}
            x2={NIRVIGHNAM_LAYOUT.pathLine.x2}
            y2={NIRVIGHNAM_LAYOUT.pathLine.y2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.6"
            strokeDasharray="1.5 2"
          />
        </svg>

      </div>
    </div>
  );
}
