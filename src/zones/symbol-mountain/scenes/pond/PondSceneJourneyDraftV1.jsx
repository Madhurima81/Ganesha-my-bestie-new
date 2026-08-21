import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import journeyLotusClosed from './assets/images/journey-lotus-closed.png';
import journeyLotusBloomed from './assets/images/journey-lotus-bloomed.png';
import journeyPondBg from './assets/images/journey-pond-bg.png';
import journeyRock from './assets/images/journey-rock.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.webp';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.webp';

const PHASES = {
  STREAM_BLOCKED: 'stream_blocked',
  STREAM_FLOWING: 'stream_flowing',
  BUD_RISING: 'bud_rising',
  BLOOMED: 'bloomed',
  TRUNK_REVEAL: 'trunk_reveal',
  LOTUS_REVEAL: 'lotus_reveal',
  COMPLETE: 'complete'
};

const SOURCE = { x: 10, y: 59 };
const POND = { x: 66, y: 58 };
const ROCK = { x: 17, y: 60, rx: 8, ry: 11 };
const LOTUS = { x: 77, y: 62 };
const ROCK_CLEAR_PAD = 6;
const HOLD_DURATION_MS = 1800;
const HINT_IDLE_MS = 15000;

const trunkCard = {
  id: 'trunk',
  title: 'Trunk',
  line: 'You found a way around.',
  image: symbolTrunkColored
};

const lotusCard = {
  id: 'lotus',
  title: 'Lotus',
  line: 'And something beautiful grew.',
  image: symbolLotusColored
};

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function intersectsEllipse(point, ellipse, padding = 0) {
  const dx = (point.x - ellipse.x) / (ellipse.rx + padding);
  const dy = (point.y - ellipse.y) / (ellipse.ry + padding);
  return (dx * dx) + (dy * dy) <= 1;
}

function quadraticPoint(start, control, end, t) {
  const oneMinus = 1 - t;
  return {
    x: (oneMinus * oneMinus * start.x) + (2 * oneMinus * t * control.x) + (t * t * end.x),
    y: (oneMinus * oneMinus * start.y) + (2 * oneMinus * t * control.y) + (t * t * end.y)
  };
}

function pctStyle(point) {
  return {
    left: `${point.x}%`,
    top: `${point.y}%`
  };
}

export default function PondSceneJourneyDraftV1() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const draggingRef = useRef(false);
  const dragPathRef = useRef([]);
  const successAnimRef = useRef(null);
  const holdRafRef = useRef(null);
  const holdStartRef = useRef(null);
  const idleTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState(PHASES.STREAM_BLOCKED);
  const [hint, setHint] = useState('Drag the water from the stream, around the rock, to the muddy pond.');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [lotusVisible, setLotusVisible] = useState(false);
  const [lotusBloomedState, setLotusBloomedState] = useState(false);
  const [showLotusBob, setShowLotusBob] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [finalLine, setFinalLine] = useState('');
  const [successCurve, setSuccessCurve] = useState(null);
  const [blockedRipple, setBlockedRipple] = useState(null);
  const [dragTip, setDragTip] = useState(null);

  const revealCards = useMemo(() => ({
    trunk: trunkCard,
    lotus: lotusCard
  }), []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleHint = useCallback(() => {
    clearIdleTimer();
    if (phase !== PHASES.STREAM_BLOCKED) return;
    idleTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setHint('Can the water find another way around?');
      }
    }, HINT_IDLE_MS);
  }, [clearIdleTimer, phase]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const drawRawPath = useCallback((path, blocked = false) => {
    const canvas = canvasRef.current;
    if (!canvas || path.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    if (path.length === 2) {
      ctx.lineTo(path[1].x, path[1].y);
    } else {
      for (let i = 1; i < path.length - 1; i += 1) {
        const midX = (path[i].x + path[i + 1].x) / 2;
        const midY = (path[i].y + path[i + 1].y) / 2;
        ctx.quadraticCurveTo(path[i].x, path[i].y, midX, midY);
      }
      const penultimate = path[path.length - 2];
      const last = path[path.length - 1];
      ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
    }
    ctx.strokeStyle = blocked ? 'rgba(211, 94, 94, 0.95)' : 'rgba(62, 157, 226, 0.92)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = blocked ? 'rgba(255, 204, 204, 0.55)' : 'rgba(201, 239, 255, 0.78)';
    ctx.lineWidth = 7;
    ctx.stroke();
  }, []);

  const animateSuccessCurve = useCallback((curve) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (successAnimRef.current) {
      cancelAnimationFrame(successAnimRef.current);
    }

    const startAt = performance.now();
    const duration = 900;

    const frame = (now) => {
      const t = Math.min((now - startAt) / duration, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(curve.start.x, curve.start.y);

      const segments = Math.max(8, Math.floor(40 * t));
      for (let i = 1; i <= segments; i += 1) {
        const point = quadraticPoint(curve.start, curve.control, curve.end, (i / segments) * t);
        ctx.lineTo(point.x, point.y);
      }

      ctx.strokeStyle = 'rgba(62, 157, 226, 0.95)';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(204, 240, 255, 0.82)';
      ctx.lineWidth = 8;
      ctx.stroke();

      if (t < 1) {
        successAnimRef.current = requestAnimationFrame(frame);
      } else {
        successAnimRef.current = null;
      }
    };

    successAnimRef.current = requestAnimationFrame(frame);
  }, []);

  const handleStreamSuccess = useCallback((path) => {
    const rockCenterY = ROCK.y * 8.2;
    const pointsAbove = path.filter((point) => point.y < rockCenterY).length;
    const pointsBelow = path.length - pointsAbove;
    const useUpperCurve = pointsAbove >= pointsBelow;
    const control = useUpperCurve
      ? { x: ROCK.x * 9.1, y: (ROCK.y - ROCK.ry - 8) * 8.4 }
      : { x: ROCK.x * 9.2, y: (ROCK.y + ROCK.ry + 8) * 8.1 };

    const curve = {
      side: useUpperCurve ? 'upper' : 'lower',
      start: { x: SOURCE.x * 9, y: SOURCE.y * 8.2 },
      control,
      end: { x: POND.x * 8.9, y: POND.y * 8.2 }
    };

    setSuccessCurve(curve);
    setDragTip(null);
    setBlockedRipple(null);
    setPhase(PHASES.STREAM_FLOWING);
    setHint('The water found a way around.');
    animateSuccessCurve(curve);

    setTimeout(() => {
      if (!mountedRef.current) return;
      setLotusVisible(true);
      setShowLotusBob(true);
      setPhase(PHASES.BUD_RISING);
      setHint('Press and hold the lotus gently to help it rise.');
    }, 950);
  }, [animateSuccessCurve]);

  const getCanvasPoint = useCallback((event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return null;
    const scaleX = 900 / rect.width;
    const scaleY = 500 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const beginDrag = useCallback((event) => {
    if (phase !== PHASES.STREAM_BLOCKED) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    const sourcePx = { x: SOURCE.x * 9, y: SOURCE.y * 8.2 };
    if (pointDistance(point, sourcePx) > 62) return;
    draggingRef.current = true;
    dragPathRef.current = [sourcePx, point];
    setDragTip(point);
    setBlockedRipple(null);
    clearIdleTimer();
    setHint('Find a way around the rock to the muddy pond.');
  }, [clearIdleTimer, getCanvasPoint, phase]);

  const continueDrag = useCallback((event) => {
    if (!draggingRef.current || phase !== PHASES.STREAM_BLOCKED) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    if (intersectsEllipse(point, { x: ROCK.x * 9, y: ROCK.y * 8.2, rx: ROCK.rx * 8.8, ry: ROCK.ry * 8.3 })) {
      drawRawPath(dragPathRef.current, true);
      setBlockedRipple(dragPathRef.current[dragPathRef.current.length - 1] || null);
      return;
    }
    dragPathRef.current = [...dragPathRef.current, point];
    setDragTip(point);
    drawRawPath(dragPathRef.current, false);
  }, [drawRawPath, getCanvasPoint, phase]);

  const finishDrag = useCallback(() => {
    if (!draggingRef.current || phase !== PHASES.STREAM_BLOCKED) return;
    draggingRef.current = false;
    const path = dragPathRef.current;
    setDragTip(null);
    const last = path[path.length - 1];
    const pondPx = { x: POND.x * 8.9, y: POND.y * 8.2 };
    const rockPx = { x: ROCK.x * 9, y: ROCK.y * 8.2, rx: ROCK.rx * 8.8, ry: ROCK.ry * 8.3 };
    const reachedPond = last ? pointDistance(last, pondPx) < 118 : false;
    const clearedZone = path.some((point) => !intersectsEllipse(point, rockPx, ROCK_CLEAR_PAD * 8.4));

    if (reachedPond && clearedZone) {
      handleStreamSuccess(path);
      return;
    }

    clearCanvas();
    dragPathRef.current = [];
    setBlockedRipple(null);
    setFailedAttempts((count) => {
      const next = count + 1;
      if (next >= 3) {
        setHint('Can the water find another way around?');
      } else {
        setHint('Try curving more clearly around the rock.');
      }
      return next;
    });
    scheduleIdleHint();
  }, [clearCanvas, handleStreamSuccess, phase, scheduleIdleHint]);

  const finishBloom = useCallback(() => {
    setHoldProgress(1);
    setShowLotusBob(false);
    setLotusBloomedState(true);
    setPhase(PHASES.BLOOMED);
    setHint('You found a way around... and something beautiful grew.');
    setFinalLine('You found a way around... and something beautiful grew.');

    setTimeout(() => {
      if (!mountedRef.current) return;
      setActiveCard(revealCards.trunk);
      setPhase(PHASES.TRUNK_REVEAL);
    }, 700);
  }, [revealCards.trunk]);

  const tickHold = useCallback(() => {
    if (!holdStartRef.current) return;
    const elapsed = performance.now() - holdStartRef.current;
    const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
    setHoldProgress(progress);
    if (progress >= 1) {
      holdStartRef.current = null;
      if (holdRafRef.current) {
        cancelAnimationFrame(holdRafRef.current);
        holdRafRef.current = null;
      }
      finishBloom();
      return;
    }
    holdRafRef.current = requestAnimationFrame(tickHold);
  }, [finishBloom]);

  const startLotusHold = useCallback((event) => {
    if (phase !== PHASES.BUD_RISING) return;
    event.preventDefault();
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
    }
    holdStartRef.current = performance.now() - (holdProgress * HOLD_DURATION_MS);
    setHint('Keep holding gently...');
    holdRafRef.current = requestAnimationFrame(tickHold);
  }, [holdProgress, phase, tickHold]);

  const endLotusHold = useCallback(() => {
    if (phase !== PHASES.BUD_RISING) return;
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    const current = holdProgress;
    holdStartRef.current = null;
    if (current < 1) {
      setHint('Gently hold again when you are ready.');
      setHoldProgress(0);
      setShowLotusBob(true);
    }
  }, [holdProgress, phase]);

  const dismissCard = useCallback(() => {
    if (!activeCard) return;
    if (activeCard.id === 'trunk') {
      setActiveCard(revealCards.lotus);
      setPhase(PHASES.LOTUS_REVEAL);
      return;
    }
    setActiveCard(null);
    setPhase(PHASES.COMPLETE);
  }, [activeCard, revealCards.lotus]);

  const resetDraft = useCallback(() => {
    if (successAnimRef.current) {
      cancelAnimationFrame(successAnimRef.current);
      successAnimRef.current = null;
    }
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    draggingRef.current = false;
    dragPathRef.current = [];
    holdStartRef.current = null;
    setPhase(PHASES.STREAM_BLOCKED);
    setHint('Drag the water from the stream, around the rock, to the muddy pond.');
    setFailedAttempts(0);
    setHoldProgress(0);
    setLotusVisible(false);
    setLotusBloomedState(false);
    setShowLotusBob(false);
    setActiveCard(null);
    setFinalLine('');
    setSuccessCurve(null);
    setBlockedRipple(null);
    setDragTip(null);
    clearCanvas();
    scheduleIdleHint();
  }, [clearCanvas, scheduleIdleHint]);

  useEffect(() => {
    mountedRef.current = true;
    scheduleIdleHint();
    return () => {
      mountedRef.current = false;
      clearIdleTimer();
      if (successAnimRef.current) cancelAnimationFrame(successAnimRef.current);
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, [clearIdleTimer, scheduleIdleHint]);

  useEffect(() => {
    if (successCurve && phase !== PHASES.STREAM_BLOCKED) {
      animateSuccessCurve(successCurve);
    }
  }, [animateSuccessCurve, phase, successCurve]);

  return (
    <div
      data-scene="pond-journey-draft"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #d8f0ff 0%, #b7e0f7 100%)',
        padding: '20px'
      }}
    >
      <h2
        style={{
          margin: '0 0 10px',
          color: '#2b5b69',
          fontFamily: "'Baloo 2', cursive",
          fontSize: '28px'
        }}
      >
        Pond Journey Draft
      </h2>
      <div
        style={{
          minHeight: '24px',
          marginBottom: '10px',
          color: '#3d6170',
          fontWeight: 700,
          textAlign: 'center'
        }}
      >
        {hint}
      </div>

      <div
        ref={sceneRef}
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={finishDrag}
        onPointerLeave={finishDrag}
        onTouchStart={beginDrag}
        onTouchMove={continueDrag}
        onTouchEnd={finishDrag}
        style={{
          position: 'relative',
          width: '900px',
          maxWidth: '95vw',
          height: '500px',
          borderRadius: '22px',
          overflow: 'hidden',
          border: '4px solid #97b87e',
          backgroundColor: '#d9edf7',
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.16)'
        }}
      >
        <img
          src={journeyPondBg}
          alt="Pond journey background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />

        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: `${ROCK.x - 6.2}%`,
            top: `${ROCK.y - 9.2}%`,
            width: '14.5%',
            height: '21%',
            zIndex: 6
          }}
        >
          <img
            src={journeyRock}
            alt="Rock obstacle"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.25))',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: `${ROCK.x - 11.2}%`,
            top: `${ROCK.y - 13.5}%`,
            width: '23%',
            height: '27%',
            borderRadius: '50%',
            border: '2px dashed rgba(106, 126, 142, 0.32)',
            opacity: phase === PHASES.STREAM_BLOCKED ? 0.45 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: `${POND.x - 17}%`,
            top: `${POND.y - 11}%`,
            width: '34%',
            height: '30%',
            borderRadius: '52% 48% 50% 46%',
            background: 'radial-gradient(ellipse at center, #78c7ff 0%, #4a98df 70%, #2d74c7 100%)',
            boxShadow: 'inset 0 10px 18px rgba(255,255,255,0.18)',
            zIndex: 2
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: `${POND.x - 5}%`,
            top: `${POND.y + 5}%`,
            width: '18%',
            height: '10%',
            borderRadius: '48%',
            background: 'radial-gradient(ellipse at center, #9f6f42 0%, #7a502d 100%)',
            opacity: 0.85,
            zIndex: 4
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: `${SOURCE.x - 3.5}%`,
            top: `${SOURCE.y - 6}%`,
            width: '7%',
            height: '12%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #82d8ff 0%, #3b94df 100%)',
            border: '4px solid #2f75b6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            boxShadow: '0 0 10px rgba(67, 164, 236, 0.45)',
            zIndex: 7
          }}
        >
          💧
        </div>

        {lotusVisible && (
          <button
            type="button"
            onPointerDown={startLotusHold}
            onPointerUp={endLotusHold}
            onPointerLeave={endLotusHold}
            onTouchStart={startLotusHold}
            onTouchEnd={endLotusHold}
            style={{
              position: 'absolute',
              ...pctStyle(LOTUS),
              transform: `translate(-50%, -50%) ${showLotusBob && !lotusBloomedState ? 'translateY(-4px)' : 'translateY(0)'}`,
              width: '96px',
              height: '96px',
              border: 0,
              padding: 0,
              background: 'transparent',
              zIndex: 8,
              cursor: 'pointer',
              transition: phase === PHASES.BUD_RISING ? 'transform 0.6s ease' : 'transform 0.2s ease'
            }}
          >
            {!lotusBloomedState && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  border: '5px solid rgba(255, 216, 89, 0.9)',
                  clipPath: `inset(${(1 - holdProgress) * 100}% 0 0 0)`,
                  opacity: holdProgress > 0 ? 1 : 0,
                  pointerEvents: 'none'
                }}
              />
            )}
            <img
              src={lotusBloomedState ? journeyLotusBloomed : journeyLotusClosed}
              alt={lotusBloomedState ? 'Bloomed lotus' : 'Closed lotus'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 16px rgba(90, 59, 29, 0.18))',
                transform: !lotusBloomedState && holdProgress > 0 ? `scale(${1 + holdProgress * 0.08})` : 'scale(1)',
                transition: 'transform 0.12s linear'
              }}
            />
          </button>
        )}

        {dragTip && phase === PHASES.STREAM_BLOCKED && (
          <div
            style={{
              position: 'absolute',
              left: `${(dragTip.x / 900) * 100}%`,
              top: `${(dragTip.y / 500) * 100}%`,
              width: '24px',
              height: '24px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,250,255,0.95) 0%, rgba(94,182,235,0.72) 55%, rgba(94,182,235,0) 100%)',
              boxShadow: '0 0 14px rgba(94, 182, 235, 0.55)',
              zIndex: 9,
              pointerEvents: 'none'
            }}
          />
        )}

        {blockedRipple && phase === PHASES.STREAM_BLOCKED && (
          <div
            style={{
              position: 'absolute',
              left: `${(blockedRipple.x / 900) * 100}%`,
              top: `${(blockedRipple.y / 500) * 100}%`,
              width: '52px',
              height: '52px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '3px solid rgba(255, 234, 234, 0.82)',
              boxShadow: '0 0 16px rgba(211, 94, 94, 0.22)',
              zIndex: 9,
              pointerEvents: 'none',
              animation: 'pondDraftRipple 0.6s ease-out forwards'
            }}
          />
        )}

        {finalLine && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '4%',
              transform: 'translateX(-50%)',
              color: '#3f6443',
              fontSize: '18px',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.76)',
              padding: '8px 14px',
              borderRadius: '999px',
              zIndex: 10
            }}
          >
            {finalLine}
          </div>
        )}

        {activeCard && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(31, 25, 40, 0.52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20
            }}
          >
            <div
              style={{
                width: 'min(420px, 82vw)',
                background: '#fff7e8',
                borderRadius: '28px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 18px 36px rgba(0,0,0,0.2)'
              }}
            >
              <img
                src={activeCard.image}
                alt={activeCard.title}
                style={{ width: '110px', height: '110px', objectFit: 'contain', marginBottom: '12px' }}
              />
              <h3
                style={{
                  margin: '0 0 8px',
                  color: '#6a430e',
                  fontSize: '30px',
                  fontFamily: "'Baloo 2', cursive"
                }}
              >
                {activeCard.title}
              </h3>
              <p
                style={{
                  margin: '0 0 20px',
                  color: '#4f4a42',
                  fontSize: '18px',
                  lineHeight: 1.35,
                  fontWeight: 700
                }}
              >
                {activeCard.line}
              </p>
              <button
                type="button"
                onClick={dismissCard}
                style={{
                  border: 0,
                  borderRadius: '999px',
                  padding: '12px 24px',
                  background: '#f39a2e',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
        <button
          type="button"
          onClick={resetDraft}
          style={{
            border: 0,
            borderRadius: '999px',
            padding: '10px 20px',
            background: '#4a90a4',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Reset Draft
        </button>
        <div style={{ alignSelf: 'center', color: '#48616c', fontWeight: 700 }}>
          Current phase: {phase}
        </div>
      </div>
      <style>{`
        @keyframes pondDraftRipple {
          0% {
            opacity: 0.92;
            transform: translate(-50%, -50%) scale(0.4);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.25);
          }
        }
      `}</style>
    </div>
  );
}
