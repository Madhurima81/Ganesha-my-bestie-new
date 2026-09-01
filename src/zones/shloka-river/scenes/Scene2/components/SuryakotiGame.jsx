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

// Chanted as sur-ya-ko-ti — display labels match the audio segmentation below.
const SYLLABLES = ['Sur', 'ya', 'ko', 'ti'];
// audio keys must match /audio/syllables/suryakoti-<key>.mp3 → sur, ya, ko, ti
// ('su' had no file, so the first syllable silently 404'd)
const AUDIO = { syllables: ['sur', 'ya', 'ko', 'ti'] };

// Four discrete dark spots to rub, one per syllable, revealed in order
// (Sur → ya → ko → ti). Rubbing the active spot clear enough lights that
// syllable and advances to the next — mirrors the one-target-at-a-time
// 4-step reveal in Mahakaya/Kurumedeva. cx/cy are fractions of the stage box.
const SPOTS = [
  { cx: 0.24, cy: 0.31 }, // Sur
  { cx: 0.44, cy: 0.20 }, // ya
  { cx: 0.63, cy: 0.15 }, // ko
  { cx: 0.80, cy: 0.27 }, // ti
];
const SPOT_R = 0.10;        // spot radius, fraction of canvas width
const SCRATCH_R = 0.055;    // brush radius, fraction of canvas width
const SPOT_GRID = 8;        // cells per axis inside each spot
const SPOT_CLEAR = 0.6;     // fraction of a spot's cells cleared to light its syllable

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
  const [activeSpot, setActiveSpot] = useState(0);
  const [bunnyPos, setBunnyPos] = useState(POS.bunny);
  const [bunnyHopping, setBunnyHopping] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);            // flat list of cells: { px, py, cleared, spot }
  const spotTotalRef = useRef([0, 0, 0, 0]);
  const spotDoneRef = useRef([0, 0, 0, 0]);
  const activeSpotRef = useRef(0);
  const drawingRef = useRef(false);
  const phaseRef = useRef('play');
  const completedRef = useRef(false);
  const doneAnnouncedRef = useRef(false);
  const firstInteractionSentRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const hopDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const lastSyllableDoneRef = useRef(false);
  const completionVoStartedRef = useRef(false);
  const sylEndFallbackRef = useRef(null);
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

    // Scratch-target ring cue is the animated .surya-scratch-ring overlay
    // (see render) — not painted here to avoid a duplicate static ring.

    const grid = [];
    const totals = [0, 0, 0, 0];
    const dones = [0, 0, 0, 0];
    const scratchRadius = cv.width * SCRATCH_R;
    const spotRadius = cv.width * SPOT_R;

    SPOTS.forEach((spot, si) => {
      const scx = cv.width * spot.cx;
      const scy = cv.height * spot.cy;
      for (let gy = 0; gy < SPOT_GRID; gy += 1) {
        for (let gx = 0; gx < SPOT_GRID; gx += 1) {
          const px = scx - spotRadius + gx * ((spotRadius * 2) / SPOT_GRID);
          const py = scy - spotRadius + gy * ((spotRadius * 2) / SPOT_GRID);
          if (Math.hypot(px - scx, py - scy) >= spotRadius) continue;
          const idx = grid.length;
          const cleared = Boolean(prevCleared?.[idx]);
          grid.push({ px, py, cleared, spot: si });
          totals[si] += 1;
          if (cleared) {
            dones[si] += 1;
            // Re-punch previously cleared cells at the new geometry
            ctx.beginPath();
            ctx.arc(px, py, scratchRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    gridRef.current = grid;
    spotTotalRef.current = totals;
    spotDoneRef.current = dones;

    if (!preserve) {
      completedRef.current = false;
      doneAnnouncedRef.current = false;
      firstInteractionSentRef.current = false;
      successVoDoneRef.current = false;
      hopDoneRef.current = false;
      completionScheduledRef.current = false;
      lastSyllableDoneRef.current = false;
      completionVoStartedRef.current = false;
      activeSpotRef.current = 0;
      setActiveSpot(0);
      setBunnyPos(POS.bunny);
      setBunnyHopping(false);
      setPhase('play');
      setLitCount(0);
    } else {
      // Recover how far the player had gotten from the restored cleared cells.
      let lit = 0;
      while (lit < 4 && totals[lit] > 0 && dones[lit] / totals[lit] >= SPOT_CLEAR) lit += 1;
      activeSpotRef.current = lit;
      setActiveSpot(lit);
      setLitCount(lit);
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

    // Only cells belonging to the spot the player is meant to be on right now
    // count toward progress — keeps the syllables lighting in order.
    const active = activeSpotRef.current;
    for (const cell of gridRef.current) {
      if (cell.cleared || cell.spot !== active) continue;
      if (Math.hypot(cell.px - x, cell.py - y) < radius) {
        cell.cleared = true;
        spotDoneRef.current[cell.spot] += 1;
      }
    }

    // Advance through any spots that are now clear enough (handles a spot the
    // player scrubbed past in one stroke).
    let next = activeSpotRef.current;
    while (
      next < 4
      && spotTotalRef.current[next] > 0
      && spotDoneRef.current[next] / spotTotalRef.current[next] >= SPOT_CLEAR
    ) {
      next += 1;
      onMicroWin?.();
    }

    if (next !== activeSpotRef.current) {
      activeSpotRef.current = next;
      setActiveSpot(next);
      setLitCount(next); // lighting syllable `next-1`; SyllableHighlight plays its clip
    }

    if (next >= 4 && !completedRef.current) {
      completedRef.current = true;
      setLitCount(4); // TI lights first — give it a beat before the fade/hop
      window.setTimeout(() => {
        setPhase('hop');
        fadeOverlay(cv);
      }, 500);
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

  // Completion audio plays strictly in sequence, no overlap:
  //   final syllable "ti"  ->  full word "suryakoti"  ->  ending line
  // Fires only once the last syllable has finished AND the hop has begun.
  // (Mirrors NirvighnamGame — the earlier parallel playWord/playSceneLine here
  //  drowned out "ti".)
  const startCompletionVo = useCallback(() => {
    if (completionVoStartedRef.current) return;
    if (!lastSyllableDoneRef.current || !doneAnnouncedRef.current) return;
    completionVoStartedRef.current = true;

    if (sylEndFallbackRef.current) {
      window.clearTimeout(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }

    if (!playSceneLine) {
      successVoDoneRef.current = true;
      return;
    }

    const afterWord = () => {
      playSceneLine('scene11_surya_success', () => {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }, { stripLeadingText: 'Suryakoti' });
    };

    if (playWord) playWord('suryakoti', afterWord);
    else afterWord();

    // iOS Safari can silently drop utterance onend/onerror — don't hang.
    voFallbackRef.current = window.setTimeout(() => {
      if (!successVoDoneRef.current) {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }
    }, 10000);
  }, [completeAfterSuccess, playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'hop' || doneAnnouncedRef.current) return undefined;
    doneAnnouncedRef.current = true;
    const timers = [];

    // Hold the word/ending line until the final "ti" syllable clip has
    // finished (its onSyllableLit onEnded sets lastSyllableDoneRef). Fallback
    // covers a dropped callback (audio error / iOS / test mock).
    sylEndFallbackRef.current = window.setTimeout(() => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    }, 1600);
    startCompletionVo();

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
  }, [completeAfterSuccess, phase, startCompletionVo]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
    if (sylEndFallbackRef.current) {
      window.clearTimeout(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }
    if (fadeOverlayRef.current) {
      window.clearInterval(fadeOverlayRef.current);
      fadeOverlayRef.current = null;
    }
  }, []);

  if (!isActive) return null;

  // Sun brightens one step per syllable lit (0→4).
  const litFrac = litCount / SPOTS.length;
  const sunOp = Math.max(0, litFrac * 1.1 - 0.1);
  const showSun = litCount >= 2;
  const sunFadeOp = showSun ? Math.min(1, (litCount - 1) / 3) : 0;
  const cueSpot = SPOTS[Math.min(activeSpot, SPOTS.length - 1)];

  return (
    <div className={`surya-game ${hideElements ? 'is-hidden' : ''}`}>
      <div className="surya-stage" style={{ backgroundImage: `url(${sharedSceneBg})` }}>

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable, index) => {
            stopVoice?.();
            const isLast = index === SYLLABLES.length - 1;
            playSyllable?.(syllable, isLast ? () => {
              lastSyllableDoneRef.current = true;
              startCompletionVo();
            } : undefined);
          }}
        />

        {phase === 'play' && (
          <p className="surya-hint">
            {hintLevel <= 1 && `Rub the glowing spot — ${litCount}/4 lit.`}
            {hintLevel === 2 && 'Keep rubbing inside the ring.'}
            {hintLevel >= 3 && 'Rub the glowing spot to light each sound.'}
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
          {/* Pulsing ring cue over the spot the player should rub next */}
          {phase === 'play' && canvasReady && !completedRef.current && (
            <div
              className="surya-scratch-ring"
              style={{ left: `${cueSpot.cx * 100}%`, top: `${cueSpot.cy * 100}%`, width: '20%' }}
            />
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
          from={{ x: cueSpot.cx * 100 - 6, y: cueSpot.cy * 100 - 5 }}
          to={{ x: cueSpot.cx * 100 + 6, y: cueSpot.cy * 100 + 5 }}
          active={phase === 'play' && !completedRef.current}
          idleDelay={3000}
        />

      </div>
    </div>
  );
}
