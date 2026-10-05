import PoseImage, { usePreloadPoses } from '../../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../../lib/components/feedback/GestureDemo';
import usePausableTimers from '../../../../../lib/hooks/usePausableTimers';
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

// Four broad, overlapping progress regions. The child can rub anywhere on the
// dark canvas and see darkness disappear; these invisible regions only decide
// when each Suryakoti syllable is earned.
const RUB_ZONES = [
  { id: 'sur', x1: 0.00, x2: 0.30, y1: 0.00, y2: 0.90 },
  { id: 'ya',  x1: 0.20, x2: 0.50, y1: 0.00, y2: 0.90 },
  { id: 'ko',  x1: 0.45, x2: 0.75, y1: 0.00, y2: 0.90 },
  { id: 'ti',  x1: 0.70, x2: 1.00, y1: 0.00, y2: 0.90 },
];
const SCRATCH_R = 0.06;     // visible rub brush, fraction of canvas width
const ZONE_GRID_X = 10;
const ZONE_GRID_Y = 16;
const ZONE_CLEAR = 0.42;    // forgiving completion threshold

const POSE_ASSETS = [
  sharedSceneBg,
  sunImg,
  bunnySadImg,
  bunnyHappyImg,
  burrowImg,
];

export default function SuryakotiGame({
  isActive = false,
  introComplete = true,
  introVoStarted = true,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  onFirstInteraction = () => {},
  voiceGuidance = {},
  isPaused = false,
  // Sidebar actually open (isPaused also covers the short replay hold after it closes): drives the
  // hand demo, the animation freeze and the hint pin, so the hand can play WITH the replayed line.
  isSidebarOpen,
}) {
  const handPaused = isSidebarOpen ?? isPaused;
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playWord, playSyllable, stopVoice } = voiceGuidance;
  const [phase, setPhase] = useState('play');
  const [litCount, setLitCount] = useState(0);
  const [activeZone, setActiveZone] = useState(0);
  const [bunnyPos, setBunnyPos] = useState(POS.bunny);
  const [bunnyHopping, setBunnyHopping] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [initialTeachingDone, setInitialTeachingDone] = useState(false);
  const [spotHasProgress, setSpotHasProgress] = useState(false);
  const [remainingCueVersion, setRemainingCueVersion] = useState(0);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);            // flat list of cells: { px, py, cleared, zone }
  const zoneTotalRef = useRef([0, 0, 0, 0]);
  const zoneDoneRef = useRef([0, 0, 0, 0]);
  const activeZoneRef = useRef(0);
  const drawingRef = useRef(false);
  // State mirror of drawingRef. The hint clock's `enabled` flag is read at render time: with only the
  // ref, lifting the finger changed nothing the component could see, no re-render happened, and the
  // clock stayed disabled (computed while rubbing) — so the hint never restarted after a partial rub.
  const [isRubbing, setIsRubbing] = useState(false);
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
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable } = usePausableTimers(isPaused);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Back from the sidebar before the first patch is cleared: the teaching hand plays again
  // with the replayed intro line.
  // Not when the child left during an L2/L3 hint: the hint hand only shows once the first
  // teaching is marked done, so re-arming teaching would switch the hint hand off.
  const wasPausedForTeachRef = useRef(false);
  const hintWasActiveRef = useRef(false);
  useEffect(() => {
    if (handPaused && !wasPausedForTeachRef.current) hintWasActiveRef.current = hintLevel >= 2;
    if (wasPausedForTeachRef.current && !handPaused && !hintWasActiveRef.current && activeZoneRef.current === 0) setInitialTeachingDone(false);
    wasPausedForTeachRef.current = handPaused;
  }, [handPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
    onPhaseCompleteRef.current = onPhaseComplete;
  }, [onGameComplete, onPhaseComplete]);

  const {
    hintLevel,
    markContinuousProgress,
    markLevel2VoiceStarted,
    markLevel2VoiceEnded,
  } = useRepeatedHintCycle({
    // Gated on the instruction VO (introComplete), not on the teaching
    // gesture finishing — the gesture and VO can overlap; teaching disappears
    // as soon as the child actually starts scratching (see onPointerDown).
    enabled: isActive && !isPaused && phase === 'play' && introComplete && !isRubbing,
    stageKey: phase === 'play' ? `rub-zone-${activeZone}` : phase,
    // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
    initialDelay: 10000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
    paused: handPaused,
  });

  useEffect(() => {
    setSpotHasProgress(false);
    setRemainingCueVersion((version) => version + 1);
  }, [activeZone]);

  // L2 spoken hint: "Rub the glowing spot" / "Keep rubbing" — once per spot
  // per level-2 escalation, not repeated every render.
  const lastHintVoRef = useRef('');
  const continuationCuePlayedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'play' || hintLevel !== 2 || isPaused) return;

    const voiceKey = spotHasProgress ? 'surya_hint_keep' : 'surya_hint_rub';
    const onceKey = `${activeZone}-${voiceKey}`;
    if (lastHintVoRef.current === onceKey) return;
    lastHintVoRef.current = onceKey;

    stopVoice?.();
    if (playSceneLine) markLevel2VoiceStarted();
    playSceneLine?.(voiceKey, markLevel2VoiceEnded);
  }, [activeZone, hintLevel, isPaused, phase, playSceneLine, spotHasProgress, stopVoice, markLevel2VoiceStarted, markLevel2VoiceEnded]);

  // L1 on a LATER patch with nothing rubbed on it yet = the child finished a patch and stopped:
  // just say "Continue rubbing." (no glow spot). Once per patch.
  const lastL1VoRef = useRef('');
  const l1ContinueNudge = activeZone > 0 && !spotHasProgress;
  useEffect(() => {
    if (phase !== 'play' || hintLevel !== 1 || !l1ContinueNudge || isPaused) return;
    const onceKey = `${activeZone}-surya_hint_continue`;
    if (lastL1VoRef.current === onceKey) return;
    lastL1VoRef.current = onceKey;
    stopVoice?.();
    playSceneLine?.('surya_hint_continue');
  }, [activeZone, hintLevel, isPaused, l1ContinueNudge, phase, playSceneLine, stopVoice]);

  // L3 spoken hint: ONE short line that points at the exact spot while the L3 hand plays
  // ("Rub right here."), like Mahakaya's L3 "Put the log here." Once per spot.
  const lastL3VoRef = useRef('');
  useEffect(() => {
    if (phase !== 'play' || hintLevel < 3 || isPaused) return;
    const onceKey = `${activeZone}-surya_hint_here`;
    if (lastL3VoRef.current === onceKey) return;
    lastL3VoRef.current = onceKey;
    stopVoice?.();
    playSceneLine?.('surya_hint_here');
  }, [activeZone, hintLevel, isPaused, phase, playSceneLine, stopVoice]);

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
    // Dark enough to feel gloomy, but Bunny/home are faintly perceptible.
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.90)');
    gradient.addColorStop(1, 'rgba(42, 42, 62, 0.92)');
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

    const grid = [];
    const totals = [0, 0, 0, 0];
    const dones = [0, 0, 0, 0];
    const scratchRadius = cv.width * SCRATCH_R;

    RUB_ZONES.forEach((zone, zi) => {
      for (let gy = 0; gy < ZONE_GRID_Y; gy += 1) {
        for (let gx = 0; gx < ZONE_GRID_X; gx += 1) {
          const nx = zone.x1 + (gx / Math.max(ZONE_GRID_X - 1, 1)) * (zone.x2 - zone.x1);
          const ny = zone.y1 + (gy / Math.max(ZONE_GRID_Y - 1, 1)) * (zone.y2 - zone.y1);
          const px = nx * cv.width;
          const py = ny * cv.height;
          const idx = grid.length;
          const cleared = Boolean(prevCleared?.[idx]);
          grid.push({
            px,
            py,
            nx,
            ny,
            zone: zi,
            cleared,
          });
          totals[zi] += 1;
          if (cleared) {
            dones[zi] += 1;
            // Re-punch previously cleared cells at the new geometry
            ctx.beginPath();
            ctx.arc(px, py, scratchRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    gridRef.current = grid;
    zoneTotalRef.current = totals;
    zoneDoneRef.current = dones;

    if (!preserve) {
      completedRef.current = false;
      doneAnnouncedRef.current = false;
      firstInteractionSentRef.current = false;
      successVoDoneRef.current = false;
      hopDoneRef.current = false;
      completionScheduledRef.current = false;
      lastSyllableDoneRef.current = false;
      completionVoStartedRef.current = false;
      activeZoneRef.current = 0;
      setActiveZone(0);
      setInitialTeachingDone(false);
      setBunnyPos(POS.bunny);
      setBunnyHopping(false);
      setPhase('play');
      setLitCount(0);
    } else {
      // Recover how far the player had gotten from the restored cleared cells.
      let lit = 0;
      while (lit < RUB_ZONES.length && totals[lit] > 0 && dones[lit] / totals[lit] >= ZONE_CLEAR) lit += 1;
      activeZoneRef.current = lit;
      setActiveZone(lit);
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
    let opacity = 0.92; // matches the canvas's own painted darkness — no re-darken flash
    const fade = window.setInterval(() => {
      if (isPausedRef.current) return; // freeze mid-fade behind the sidebar
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

    // Every rub clears darkness. Only cells in the current broad region count
    // toward syllable progress, keeping Sur → ya → ko → ti in order.
    const active = activeZoneRef.current;
    let newlyCleared = 0;
    for (const cell of gridRef.current) {
      if (cell.cleared || cell.zone !== active) continue;
      if (Math.hypot(cell.px - x, cell.py - y) < radius) {
        cell.cleared = true;
        zoneDoneRef.current[cell.zone] += 1;
        newlyCleared += 1;
      }
    }

    if (newlyCleared > 0) {
      setSpotHasProgress(true);
      setRemainingCueVersion((version) => version + 1);
      markContinuousProgress();
    }

    let next = activeZoneRef.current;
    while (
      next < RUB_ZONES.length
      && zoneTotalRef.current[next] > 0
      && zoneDoneRef.current[next] / zoneTotalRef.current[next] >= ZONE_CLEAR
    ) {
      next += 1;
      onMicroWin?.();
    }

    if (next !== activeZoneRef.current) {
      const wasFirstZone = activeZoneRef.current === 0;
      activeZoneRef.current = next;
      setActiveZone(next);
      setLitCount(next); // lighting syllable `next-1`; SyllableHighlight plays its clip

      // One-time continuation cue after the very first patch only — later
      // patches rely on the darkness visibly shrinking, not a repeated line.
      if (wasFirstZone && next === 1 && !continuationCuePlayedRef.current) {
        continuationCuePlayedRef.current = true;
        pausableAfter(500, () => playSceneLine?.('scene11_surya_keep_rubbing'));
      }
    }

    if (next >= RUB_ZONES.length && !completedRef.current) {
      completedRef.current = true;
      setLitCount(RUB_ZONES.length); // TI lights first — give it a beat before the fade/hop
      pausableAfter(500, () => {
        setPhase('hop');
        fadeOverlay(cv);
      });
    }
  }, [fadeOverlay, isPaused, markContinuousProgress, onMicroWin, pausableAfter, playSceneLine]);

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
    stopVoice?.();
    if (!firstInteractionSentRef.current) {
      firstInteractionSentRef.current = true;
      onFirstInteraction?.();
    }
    // The child understood the mechanic — dismiss the teaching hand
    // immediately instead of waiting for its animation to finish.
    if (activeZoneRef.current === 0 && !initialTeachingDone) {
      setInitialTeachingDone(true);
    }
    drawingRef.current = true;
    setIsRubbing(true);
    const [x, y] = getPos(e);
    mark(x, y);
  }, [getPos, initialTeachingDone, isPaused, mark, onFirstInteraction, stopVoice]);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current || isPaused) return;
    e.preventDefault();
    const [x, y] = getPos(e);
    mark(x, y);
  }, [getPos, isPaused, mark]);

  const onPointerUp = useCallback(() => {
    drawingRef.current = false;
    setIsRubbing(false);
  }, []);

  // Pause-triggered cleanup: clears an in-progress scratch-drag if isPaused
  // flips true mid-gesture (pause button, tab switch, etc.), mirroring
  // MahakayaRescueGame's pattern.
  useEffect(() => {
    if (isPaused) {
      drawingRef.current = false;
      setIsRubbing(false);
    }
  }, [isPaused]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !hopDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    pausableAfter(500, () => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    });
  }, [pausableAfter]);

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
      cancelPausable(sylEndFallbackRef.current);
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
    // Pausable, so the sidebar can't let it complete the game behind the panel.
    voFallbackRef.current = pausableAfter(10000, () => {
      if (!successVoDoneRef.current) {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }
    });
  }, [cancelPausable, completeAfterSuccess, pausableAfter, playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'hop' || doneAnnouncedRef.current) return undefined;
    doneAnnouncedRef.current = true;
    const timers = [];

    // Hold the word/ending line until the final "ti" syllable clip has
    // finished (its onSyllableLit onEnded sets lastSyllableDoneRef). Fallback
    // covers a dropped callback (audio error / iOS / test mock).
    sylEndFallbackRef.current = pausableAfter(1600, () => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    });
    startCompletionVo();

    const hopAfter = (ms, fn) => {
      timers.push(pausableAfter(ms, fn));
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
      timers.forEach(cancelPausable);
    };
  }, [cancelPausable, completeAfterSuccess, pausableAfter, phase, startCompletionVo]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      cancelPausable(voFallbackRef.current);
      voFallbackRef.current = null;
    }
    if (sylEndFallbackRef.current) {
      cancelPausable(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }
    if (fadeOverlayRef.current) {
      window.clearInterval(fadeOverlayRef.current);
      fadeOverlayRef.current = null;
    }
  }, [cancelPausable]);

  if (!isActive) return null;

  // Sun brightens one step per syllable lit (0→4) — every successful reveal
  // adds visibly more radiance, starting from the very first rub.
  const litFrac = litCount / RUB_ZONES.length;
  const sunOp = Math.min(1, 0.08 + litFrac * 0.92);
  const showSun = litCount >= 1;
  const sunFadeOp = showSun ? Math.min(0.95, 0.18 + litCount * 0.19) : 0;
  const cueZone = RUB_ZONES[Math.min(activeZone, RUB_ZONES.length - 1)];
  const cueX = ((cueZone.x1 + cueZone.x2) / 2) * 100;
  const cueY = ((cueZone.y1 + cueZone.y2) / 2) * 100;
  const cueW = (cueZone.x2 - cueZone.x1) * 100;
  const remainingCue = (() => {
    // The target follows uncleared cells, so hints point at the work still
    // left to do.
    const cv = canvasRef.current;
    if (!cv?.width || !cv?.height) {
      return { x: cueX, y: cueY };
    }
    const zoneCells = gridRef.current.filter((cell) => cell.zone === activeZone);
    const remaining = zoneCells.filter((cell) => !cell.cleared);
    // Nothing rubbed yet (or nothing left): the band centre.
    if (!remaining.length || remaining.length === zoneCells.length) {
      return { x: cueX, y: cueY };
    }
    // Aim at the middle of the largest uncleared (dark) pocket. The old average of ALL remaining
    // cells could land inside an area already rubbed clear once the bands became broad (dark patches
    // around a cleared hole average out to the hole), so the hint pointed at light, not at dark.
    // "Neighbour" = within ~2 grid cells (the grid is ZONE_GRID_X x ZONE_GRID_Y inside the band).
    const stepX = ((cueZone.x2 - cueZone.x1) * cv.width) / Math.max(ZONE_GRID_X - 1, 1);
    const stepY = ((cueZone.y2 - cueZone.y1) * cv.height) / Math.max(ZONE_GRID_Y - 1, 1);
    const radius = Math.max(stepX, stepY) * 2.2;
    const r2 = radius * radius;
    // Score every dark cell by how many dark neighbours it has. Many cells tie for the top score, and
    // the first of them is the band's top-left corner (cut off by the canvas edge) — so break ties by
    // distance to the centroid of the dark cells, which keeps the pick in the middle of the dark pocket.
    const centroid = remaining.reduce((acc, cell) => ({
      x: acc.x + cell.px / remaining.length,
      y: acc.y + cell.py / remaining.length,
    }), { x: 0, y: 0 });
    let best = remaining[0];
    let bestScore = -1;
    let bestDist = Infinity;
    remaining.forEach((cellA) => {
      let score = 0;
      remaining.forEach((cellB) => {
        const dx = cellA.px - cellB.px;
        const dy = cellA.py - cellB.py;
        if (dx * dx + dy * dy <= r2) score += 1;
      });
      const dist = (cellA.px - centroid.x) ** 2 + (cellA.py - centroid.y) ** 2;
      if (score > bestScore || (score === bestScore && dist < bestDist)) {
        bestScore = score;
        bestDist = dist;
        best = cellA;
      }
    });
    return {
      x: (best.px / cv.width) * 100,
      y: (best.py / cv.height) * 100,
    };
  })();

  return (
    <div className={`surya-game ${hideElements ? 'is-hidden' : ''} ${handPaused ? 'is-paused' : ''}`} onContextMenu={(e) => e.preventDefault()}>
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
          <PoseImage src={phase === 'play' ? bunnySadImg : bunnyHappyImg} alt="bunny" draggable={false} />
        </div>

        <div
          className="surya-layer surya-burrow"
          style={{ left: `${POS.burrow.l}%`, top: `${POS.burrow.t}%`, width: `${POS.burrow.w}%`, zIndex: 6 }}
        >
          <img src={burrowImg} alt="burrow" draggable={false} />
        </div>

        <div className={`surya-dark-wrap ${canvasReady ? 'is-ready' : ''}`} style={{ pointerEvents: phase === 'play' && !isPaused ? 'auto' : 'none' }}>
          {/* L1 only: a soft area glow suggests where progress is most useful.
              Free rubbing still clears darkness anywhere on the canvas. */}
          {phase === 'play' && canvasReady && !completedRef.current && hintLevel === 1 && !l1ContinueNudge && (
            <div
              key={`surya-rub-zone-${activeZone}-${remainingCueVersion}`}
              className="surya-rub-hint"
              // A small round spot (about half the band's width, never larger than 16% of the
              // canvas) centred where rubbing is still needed — not the whole band.
              style={{
                left: `${remainingCue.x}%`,
                top: `${remainingCue.y}%`,
                width: `${Math.min(cueW * 0.5, 16)}%`,
                aspectRatio: '1 / 1',
              }}
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

        {/* Initial teaching demo — Spot 1 only, one pass, then hands off to the
            hint ladder. scene11_surya_intro has a short setup clause before
            "Rub the glow..." — GMB gesture-timing preset B. Waits for the
            intro VO to actually start speaking (introVoStarted) before its
            own short buffer, instead of a blind fixed delay from mount that
            could show the demo before the VO even started. */}
        {phase === 'play' && activeZone === 0 && !initialTeachingDone && (
          <GestureDemo
            key="surya-initial-teaching"
            type="scratch"
            from={{ x: cueX - 7, y: cueY - 4 }}
            to={{ x: cueX + 7, y: cueY + 4 }}
            active={introVoStarted}
            idleDelay={150}
            iterations={1}
            onComplete={() => setInitialTeachingDone(true)}
            onDismiss={() => setInitialTeachingDone(true)}
            paused={handPaused}
            zIndex={46}
          />
        )}

        {/* L2 — a short scratch, not the full demo: shows the kind of action
            without giving the whole answer away. VO carries "rub"/"keep rubbing". */}
        {phase === 'play' && hintLevel === 2 && (activeZone > 0 || initialTeachingDone) && (
          <GestureDemo
            key={`surya-partial-${activeZone}`}
            type="scratch"
            from={{ x: remainingCue.x - 7, y: remainingCue.y - 4 }}
            to={{ x: remainingCue.x + 7, y: remainingCue.y + 4 }}
            active
            idleDelay={0}
            iterations={1}
            paused={handPaused}
            zIndex={46}
          />
        )}

        {/* L3 rescue demo — every spot, one full pass */}
        {phase === 'play' && hintLevel >= 3 && (activeZone > 0 || initialTeachingDone) && (
          <GestureDemo
            key={`surya-rescue-${activeZone}`}
            type="scratch"
            from={{ x: remainingCue.x - 8, y: remainingCue.y - 6 }}
            to={{ x: remainingCue.x + 8, y: remainingCue.y + 6 }}
            active
            idleDelay={0}
            iterations={2}
            paused={handPaused}
            zIndex={46}
          />
        )}

      </div>
    </div>
  );
}
