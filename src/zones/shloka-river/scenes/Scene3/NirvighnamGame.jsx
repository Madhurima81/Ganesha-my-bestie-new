import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
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
const AUDIO = { syllables: ['nir', 'vigh', 'nam'] };

const TURTLE_START = NIRVIGHNAM_LAYOUT.turtleStart;
const NEST_POS = NIRVIGHNAM_LAYOUT.nest;

const OBSTACLES = [
  { ...NIRVIGHNAM_LAYOUT.obstacles[0], img: stoneImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[1], img: branchImg },
  { ...NIRVIGHNAM_LAYOUT.obstacles[2], img: reedImg },
];

// One "ground" drop spot per obstacle, just below its starting position —
// drag the obstacle there (any direction of travel) to clear it.
const DROP_ZONES = Object.fromEntries(
  OBSTACLES.map((obs) => [obs.id, { l: obs.l, t: obs.t + 14 }])
);

const SWIM_PATH = NIRVIGHNAM_LAYOUT.swimPath;

const DROP_RADIUS = 12; // % distance to snap into the drop zone

export default function NirvighnamGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSyllable, stopVoice: stopSceneVoice } = voiceGuidance;
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
      dragOffsetRef.current = { x: 0, y: 0 };
      phaseRef.current = 'play';
      doneAnnouncedRef.current = false;
      successVoDoneRef.current = false;
      swimDoneRef.current = false;
      completionScheduledRef.current = false;
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
      const obstacle = OBSTACLES.find((o) => o.id === obstacleId);
      const latestOffset = dragOffsetRef.current;
      const currentL = obstacle.l + latestOffset.x;
      const currentT = obstacle.t + latestOffset.y;
      const zone = DROP_ZONES[obstacleId];
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
  }, [dragging, getStageRect, isActive, onMicroWin]);

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
      playSceneLine('nirv_done', () => {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      });
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

    SWIM_PATH.forEach((waypoint, index) => {
      const hopTimer = window.setTimeout(() => {
        setTurtlePos(waypoint);
        if (index === SWIM_PATH.length - 1) {
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
  }, [completeAfterSuccess, phase, playSceneLine]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
  }, []);

  if (!isActive) return null;

  const nextObstacleId = OBSTACLES.find((obs) => !cleared.some((entry) => entry.id === obs.id))?.id;

  const activeObstacles = OBSTACLES.filter(o => !cleared.some(c => c.id === o.id));
  const isDone = phase === 'done';

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

        {/* Drop zones — one ground spot per obstacle */}
        {OBSTACLES.map((obs) => {
          if (cleared.some((c) => c.id === obs.id)) return null;
          const zone = DROP_ZONES[obs.id];
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
        {OBSTACLES.map((obs) => {
          const isCleared = cleared.some(c => c.id === obs.id);
          const isBeingDragged = dragging === obs.id;
          const zone = DROP_ZONES[obs.id];
          const offsetX = isBeingDragged ? dragOffset.x : 0;
          const offsetY = isBeingDragged ? dragOffset.y : 0;

          return (
            <div
              key={obs.id}
              className={`nirv-layer nirv-obstacle ${isCleared ? 'is-cleared' : ''} ${isBeingDragged ? 'is-dragging' : ''} ${phase === 'play' && !isCleared ? 'is-tappable' : ''} ${phase === 'play' && !isCleared && obs.id === nextObstacleId && hintLevel >= 1 ? 'pulse' : ''} ${phase === 'play' && !isCleared && obs.id === nextObstacleId && hintLevel >= 2 ? 'hint-glow' : ''}`}
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
            x1={NIRVIGHNAM_LAYOUT.pathLine.x1}
            y1={NIRVIGHNAM_LAYOUT.pathLine.y1}
            x2={NIRVIGHNAM_LAYOUT.pathLine.x2}
            y2={NIRVIGHNAM_LAYOUT.pathLine.y2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.6"
            strokeDasharray="1.5 2"
          />
        </svg>

        <GestureDemo
          type="drag"
          from={{ x: OBSTACLES[0].l, y: OBSTACLES[0].t }}
          to={{ x: DROP_ZONES[OBSTACLES[0].id].l, y: DROP_ZONES[OBSTACLES[0].id].t }}
          active={phase === 'play' && cleared.length === 0}
          idleDelay={3000}
        />

      </div>
    </div>
  );
}
