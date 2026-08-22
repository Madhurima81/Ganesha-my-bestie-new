import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import './SuryakotiGame.css';

import sharedSceneBg from '../assets/images/saurakoti-bg.png';
import sunImg from '../assets/images/Suryakoti/sun-zip.png';
import bunnySadImg from '../assets/images/Suryakoti/bunny-sad-zip.png';
import bunnyHappyImg from '../assets/images/Suryakoti/bunny-happy-zip.png';
import burrowImg from '../assets/images/Suryakoti/burrow-zip.png';

const POS = {
  bunny: { l: 44, t: 43, w: 8 },
  burrow: { l: 10, t: 63.5, w: 14 },
};
const HOP_PATH = [
  { l: 37.5, t: 48.5 },
  { l: 32, t: 54.5 },
  { l: 23, t: 60 },
  { l: 11, t: 67.5 },
];

const SYLLABLES = ['Su', 'rya', 'ko', 'ti'];
const AUDIO = { syllables: ['su', 'ya', 'ko', 'ti'] };
const SUN_CX = 0.65;
const SUN_CY = 0.18;
const SUN_R = 0.17;
const SCRATCH_R = 0.09;
const GRID = 10;
const CLEAR_THRESHOLD = 0.7;

export default function SuryakotiGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  onFirstInteraction = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playWord, playSyllable, stopVoice } = voiceGuidance;
  const [phase, setPhase] = useState('play');
  const [litCount, setLitCount] = useState(0);
  const [bunnyPos, setBunnyPos] = useState(POS.bunny);
  const [bunnyHopping, setBunnyHopping] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const totalRef = useRef(0);
  const doneRef = useRef(0);
  const drawingRef = useRef(false);
  const phaseRef = useRef('play');
  const completedRef = useRef(false);
  const doneAnnouncedRef = useRef(false);
  const firstInteractionSentRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const hopDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const voFallbackRef = useRef(null);
  const fadeOverlayRef = useRef(null);
  const onGameCompleteRef = useRef(onGameComplete);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
    onPhaseCompleteRef.current = onPhaseComplete;
  }, [onGameComplete, onPhaseComplete]);

  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? 'play' : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15500,
    level3Delay: 22500,
  });

  // preserve=true (resize/rotation mid-play): rebuild the overlay at the new
  // geometry but keep cleared cells and game phase instead of restarting.
  const initCanvas = useCallback((preserve = false) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (preserve && completedRef.current) {
      // Already cleared — keep the overlay gone, don't repaint darkness
      cv.width = rect.width;
      cv.height = rect.height;
      cv.style.pointerEvents = 'none';
      cv.getContext('2d')?.clearRect(0, 0, cv.width, cv.height);
      return;
    }

    const prevCleared = preserve && gridRef.current.length
      ? gridRef.current.map((cell) => cell.cleared)
      : null;

    cv.width = rect.width;
    cv.height = rect.height;
    cv.style.pointerEvents = 'auto';

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, cv.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a3e');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cv.width, cv.height);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 50; i += 1) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * cv.width,
        Math.random() * cv.height * 0.5,
        Math.random() * 1.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'destination-out';

    const szx = cv.width * SUN_CX;
    const szy = cv.height * SUN_CY;
    const szr = cv.width * SUN_R;

    // Scratch-target ring cue is the animated .surya-scratch-ring overlay
    // (see render) — not painted here to avoid a duplicate static ring.

    let total = 0;
    let done = 0;
    const grid = [];
    const scratchRadius = cv.width * SCRATCH_R;
    for (let gy = 0; gy < GRID; gy += 1) {
      for (let gx = 0; gx < GRID; gx += 1) {
        const px = szx - szr + gx * ((szr * 2) / GRID);
        const py = szy - szr + gy * ((szr * 2) / GRID);
        const inside = Math.hypot(px - szx, py - szy) < szr;
        const cleared = Boolean(prevCleared?.[grid.length]) && inside;
        grid.push({ px, py, cleared, inside });
        if (inside) total += 1;
        if (cleared) {
          done += 1;
          // Re-punch previously cleared cells at the new geometry
          ctx.beginPath();
          ctx.arc(px, py, scratchRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    gridRef.current = grid;
    totalRef.current = total;
    doneRef.current = done;

    if (!preserve) {
      completedRef.current = false;
      doneAnnouncedRef.current = false;
      firstInteractionSentRef.current = false;
      successVoDoneRef.current = false;
      hopDoneRef.current = false;
      completionScheduledRef.current = false;
      setBunnyPos(POS.bunny);
      setBunnyHopping(false);
      setPhase('play');
      setLitCount(0);
    }
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    const timer = window.setTimeout(() => initCanvas(false), 80);
    const onResize = () => window.setTimeout(() => initCanvas(true), 0);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      drawingRef.current = false;
      setCanvasReady(false);
    };
  }, [initCanvas, isActive]);

  const fadeOverlay = useCallback((cv) => {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let opacity = 1;
    const fade = window.setInterval(() => {
      opacity -= 0.06;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(26,26,46,${Math.max(0, opacity)})`;
      ctx.fillRect(0, 0, cv.width, cv.height);
      if (opacity <= 0) {
        window.clearInterval(fade);
        fadeOverlayRef.current = null;
        cv.style.pointerEvents = 'none';
      }
    }, 30);
    fadeOverlayRef.current = fade;
  }, []);

  const mark = useCallback((x, y) => {
    if (phaseRef.current !== 'play' || isPaused || completedRef.current) return;

    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const radius = cv.width * SCRATCH_R;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    let newClears = 0;
    for (const cell of gridRef.current) {
      if (cell.cleared || !cell.inside) continue;
      if (Math.hypot(cell.px - x, cell.py - y) < radius) {
        cell.cleared = true;
        doneRef.current += 1;
        newClears += 1;
      }
    }

    const light = totalRef.current > 0 ? doneRef.current / totalRef.current : 0;
    const nextLit = Math.min(4, Math.floor(light / 0.25 + 1e-6));
    setLitCount((prev) => {
      if (nextLit > prev) {
        window.setTimeout(() => {
          for (let i = prev; i < nextLit; i += 1) onMicroWin?.();
        }, 0);
        return nextLit;
      }
      return prev;
    });

    if (light >= CLEAR_THRESHOLD) {
      completedRef.current = true;
      setPhase('hop');
      setLitCount(4);
      fadeOverlay(cv);
    }
  }, [fadeOverlay, isPaused, onMicroWin]);

  const getPos = useCallback((e) => {
    const cv = canvasRef.current;
    const rect = cv?.getBoundingClientRect();
    if (!cv || !rect || !rect.width || !rect.height) return [0, 0];
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    return [cx * cv.width / rect.width, cy * cv.height / rect.height];
  }, []);

  const onPointerDown = useCallback((e) => {
    if (isPaused) return;
    if (!firstInteractionSentRef.current) {
      firstInteractionSentRef.current = true;
      onFirstInteraction?.();
    }
    markInteraction();
    drawingRef.current = true;
    const [x, y] = getPos(e);
    mark(x, y);
  }, [getPos, isPaused, mark, markInteraction, onFirstInteraction]);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current || isPaused) return;
    e.preventDefault();
    const [x, y] = getPos(e);
    mark(x, y);
  }, [getPos, isPaused, mark]);

  const onPointerUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  // Pause-triggered cleanup: clears an in-progress scratch-drag if isPaused
  // flips true mid-gesture (pause button, tab switch, etc.), mirroring
  // MahakayaRescueGame's pattern.
  useEffect(() => {
    if (isPaused) {
      drawingRef.current = false;
    }
  }, [isPaused]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !hopDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 500);
  }, []);

  useEffect(() => {
    if (phase !== 'hop' || doneAnnouncedRef.current) return undefined;
    doneAnnouncedRef.current = true;
    const timers = [];

    if (playSceneLine) {
      stopVoice?.();
      playWord?.('suryakoti');
      playSceneLine('scene11_surya_success', () => {
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

    const hopAfter = (ms, fn) => {
      const runWhenReady = () => {
        if (isPausedRef.current) {
          const retryId = window.setTimeout(runWhenReady, 150);
          timers.push(retryId);
          return;
        }
        fn();
      };
      const id = window.setTimeout(runWhenReady, ms);
      timers.push(id);
    };

    HOP_PATH.forEach((waypoint, index) => {
      hopAfter(index * 500, () => {
        setBunnyHopping(true);
        setBunnyPos(waypoint);
        hopAfter(350, () => {
          setBunnyHopping(false);
          if (index === HOP_PATH.length - 1) {
            hopDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          }
        });
      });
    });

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [completeAfterSuccess, phase, playSceneLine, playWord, stopVoice]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
    if (fadeOverlayRef.current) {
      window.clearInterval(fadeOverlayRef.current);
      fadeOverlayRef.current = null;
    }
  }, []);

  if (!isActive) return null;

  const progress = totalRef.current > 0 ? doneRef.current / totalRef.current : 0;
  const sunOp = Math.max(0, progress * 1.2 - 0.1);
  const showSun = progress > 0.4;
  const sunFadeOp = showSun ? Math.min(1, (progress - 0.4) * 2.5) : 0;

  return (
    <div className={`surya-game ${hideElements ? 'is-hidden' : ''}`}>
      <div className="surya-stage" style={{ backgroundImage: `url(${sharedSceneBg})` }}>

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopVoice?.();
            playSyllable?.(syllable);
          }}
        />

        {phase === 'play' && (
          <p className="surya-hint">
            {hintLevel === 0 && 'Swipe the dark patch.'}
            {hintLevel === 1 && 'Swipe the dark patch.'}
            {hintLevel === 2 && 'Keep swiping to find the bunny.'}
            {hintLevel >= 3 && 'Swipe all the way across.'}
          </p>
        )}

        {phase === 'done' && (
          <p className="surya-doneline">
            You did it! The bunny found its way home!
          </p>
        )}

        <div className="surya-reveal-layer">
          <svg className="surya-reveal-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="sg" cx="65%" cy="18%" r="30%">
                <stop offset="0%" stopColor="#FFD36B" stopOpacity={sunOp} />
                <stop offset="100%" stopColor="#FFD36B" stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#sg)" />
          </svg>

          {showSun && (
            <div className="surya-sun-img" style={{ opacity: sunFadeOp }}>
              <img src={sunImg} alt="sun" draggable={false} />
            </div>
          )}
        </div>

        <div
          className={`surya-layer surya-bunny surya-breathe ${bunnyHopping ? 'is-hopping' : ''} ${phase === 'done' ? 'at-burrow' : ''}`}
          style={{
            left: `${bunnyPos.l}%`,
            top: `${bunnyPos.t}%`,
            width: `${POS.bunny.w}%`,
            zIndex: 15,
          }}
        >
          <img src={phase === 'play' ? bunnySadImg : bunnyHappyImg} alt="bunny" draggable={false} />
        </div>

        <div
          className="surya-layer surya-burrow"
          style={{ left: `${POS.burrow.l}%`, top: `${POS.burrow.t}%`, width: `${POS.burrow.w}%`, zIndex: 6 }}
        >
          <img src={burrowImg} alt="burrow" draggable={false} />
        </div>

        <div className={`surya-dark-wrap ${canvasReady ? 'is-ready' : ''}`} style={{ pointerEvents: phase === 'play' && !isPaused ? 'auto' : 'none' }}>
          {/* Pulsing ring cue over scratch area — hides once scratching starts */}
          {phase === 'play' && canvasReady && litCount === 0 && (
            <div className="surya-scratch-ring" />
          )}
          <canvas
            ref={canvasRef}
            className="surya-dark-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>

        <GestureDemo
          type="scratch"
          from={{ x: 58, y: 14 }}
          to={{ x: 74, y: 24 }}
          active={phase === 'play' && litCount === 0}
          idleDelay={3000}
        />

      </div>
    </div>
  );
}
