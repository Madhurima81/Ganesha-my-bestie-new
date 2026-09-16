// DEV-ONLY preview of the redesigned Modak Game 2 ("Belly Feeding" / Lambodara
// flower journey) — Bush (swipe) -> Branch (pull+hold) -> Marsh (guide) ->
// Belly Recognition. Self-contained (no SceneManager/ProgressManager), so it
// can be tuned and tested at /dev/game-test?game=modak-game2-new without
// touching the live NewModakSceneV7.jsx. Once approved, this logic gets
// ported into the real scene file; garland-build wiring is a separate pass.
//
// Spec source: Madhurima's Game 2 dev brief (2026-09-16) + game 2 start/end
// layout references. Locked interaction vocabulary: swipe, pull+hold, guide.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ModakGame2Preview.css';

import forestBackground from '../../zones/symbol-mountain/scenes/modak/assets/images/modak-fj-bg.webp';
import mooshikaCalm from '../../zones/symbol-mountain/scenes/modak/assets/images/mushika-calm-game2.webp';
import bushClosed from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-bush-closed-new.webp';
import bushOpen from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-bush-open-new.webp';
import branchArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-branch-new.webp';
import treeArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-tree-new.webp';
import marshArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-mud-crossing.webp';
import flowerPink from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-flower-coral.webp';
import flowerCream from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-flower-cream.webp';
import emotionAngry from '../../zones/symbol-mountain/scenes/modak/assets/images/emotion-angry-game3.webp';
import emotionSad from '../../zones/symbol-mountain/scenes/modak/assets/images/emotion-sad-game3.webp';
import emotionWorried from '../../zones/symbol-mountain/scenes/modak/assets/images/emotion-worried-game3.webp';
import ganeshaArt from '../../zones/symbol-mountain/scenes/modak/assets/images/ganesha-game3-new.webp';
import bellySymbol from '../../zones/symbol-mountain/shared/images/icons/symbol-belly-new.webp';

const PHASES = {
  FLOWER_BUSH: 'flower_bush',
  FLOWER_BRANCH: 'flower_branch',
  FLOWER_MARSH: 'flower_marsh',
  BELLY_RECOGNITION: 'belly_recognition',
  DONE: 'done', // hand-off point to Garland Build (not built here)
};

// Marsh stepping-stone waypoints, percent within the marsh wrapper. These
// are the *live* (debug-tunable) defaults — see LAYOUT_DEFAULTS below, which
// duplicates them as the debug panel's starting point.
const MARSH_START = { x: 4, y: 67 };
const MARSH_STOPS = [
  { x: 20, y: 57 },
  { x: 42, y: 39 },
  { x: 66, y: 56 },
  { x: 87, y: 39 },
];

// ---------------------------------------------------------------------
// LAYOUT DEBUG — positions of every stage element, draggable live via the
// "Layout Debug" panel (same pattern as KurumedevaGame.jsx / NewModakSceneV7's
// debug panels). {l,t} = left/top percent of the stage. Persisted to
// localStorage so tuning survives reload.
// ---------------------------------------------------------------------
const LAYOUT_STORAGE_KEY = 'modakGame2PreviewLayout';
const LAYOUT_DEFAULTS = {
  bush: { l: 25, t: 48 },
  tree: { l: 80, t: 41 },
  branch: { l: 82, t: 53 },
  marsh: { l: 61, t: 35 },
  mooshikaBush: { l: 17, t: 61 },
  mooshikaBranch: { l: 68, t: 57 },
  mooshikaBelly: { l: 50, t: 56 },
  marshStart: { l: MARSH_START.x, t: MARSH_START.y },
  marshStop1: { l: MARSH_STOPS[0].x, t: MARSH_STOPS[0].y },
  marshStop2: { l: MARSH_STOPS[1].x, t: MARSH_STOPS[1].y },
  marshStop3: { l: MARSH_STOPS[2].x, t: MARSH_STOPS[2].y },
  marshStop4: { l: MARSH_STOPS[3].x, t: MARSH_STOPS[3].y },
};
const LAYOUT_LABELS = {
  bush: 'Bush', tree: 'Tree', branch: 'Branch', marsh: 'Marsh area',
  mooshikaBush: 'Mooshika (bush phase)',
  mooshikaBranch: 'Mooshika (branch phase)',
  mooshikaBelly: 'Mooshika (belly phase)',
  marshStart: 'Marsh start', marshStop1: 'Marsh stone 1', marshStop2: 'Marsh stone 2',
  marshStop3: 'Marsh stone 3', marshStop4: 'Marsh stone 4',
};
function loadLayout() {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return { ...LAYOUT_DEFAULTS };
    const saved = JSON.parse(raw);
    const merged = {};
    Object.keys(LAYOUT_DEFAULTS).forEach((k) => { merged[k] = { ...LAYOUT_DEFAULTS[k], ...(saved[k] || {}) }; });
    return merged;
  } catch { return { ...LAYOUT_DEFAULTS }; }
}

const VO = {
  open: 'Mooshika wants to bring Ganesha six flowers. But getting there will not be easy.',
  bushStart: 'Two flowers are hiding in the leaves. Swipe them apart.',
  bushFail: 'Oh! They closed again. Try once more.',
  bushSuccess: 'You kept trying!',
  branchStart: 'Oh no, Mooshika cannot reach those flowers.',
  branchGesture: 'Pull the branch down, and hold it.',
  branchEarly: 'Almost! Keep holding.',
  branchSuccess: 'You stayed with it!',
  marshStart: 'The last flowers are across the mud. Guide Mooshika over the grass.',
  marshWobble: 'Ooh, it feels wobbly.',
  marshWrong: 'Back to the safe spot. Try again.',
  marshDone: 'You made it! Six flowers!',
  bellyFrustrated: 'Mooshika felt frustrated...',
  bellyDisappointed: '...disappointed...',
  bellyWorried: '...and worried.',
  bellyKeptGoing: 'And he kept going.',
  bellyReveal: 'Lambodara!',
  bellyMeaning: "Ganesha's big belly reminds us — there's room for every feeling.",
};

let VO_MUTED = false;
function speak(text) {
  try {
    if (VO_MUTED) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* no-op in unsupported browsers */ }
}

export default function ModakGame2Preview({ isActive = true, isPaused = false, hideElements = false, onPhaseComplete, onMicroWin }) {
  const [phase, setPhase] = useState(PHASES.FLOWER_BUSH);
  const [flowerCount, setFlowerCount] = useState(0);
  const [emotion, setEmotion] = useState(null);

  // ---- BUSH ----
  const [bushAttempted, setBushAttempted] = useState(false);
  const [bushOpenState, setBushOpenState] = useState(false);
  const [bushSpringing, setBushSpringing] = useState(false);
  const bushSwipeStartRef = useRef(null);

  // ---- BRANCH ----
  const [branchIntroFailed, setBranchIntroFailed] = useState(false);
  const [branchComplete, setBranchComplete] = useState(false);
  const [branchPull, setBranchPull] = useState(0);
  const branchDragRef = useRef({ active: false, startY: 0 });
  const branchHoldTimerRef = useRef(null);

  // ---- MARSH ----
  const marshRef = useRef(null);
  const [marshStep, setMarshStep] = useState(0);
  const [marshDrag, setMarshDrag] = useState({ active: false, x: 0, y: 0 });
  const [marshWobble, setMarshWobble] = useState(false);
  const [marshSlip, setMarshSlip] = useState(false);

  // ---- flying-flower + basket ----
  const basketTargetRef = useRef(null);
  const [flyingFlowers, setFlyingFlowers] = useState([]);

  // ---- belly recognition ----
  const [bellyBeat, setBellyBeat] = useState(0);

  // ---- mute ----
  const [muted, setMuted] = useState(false);
  useEffect(() => { VO_MUTED = muted; }, [muted]);

  // ---- layout debug — BeatPlayerGame-style: click/drag the REAL element
  // directly to select + move it (no separate ghost markers), with a small
  // fixed readout panel bottom-right (matches the "DEV — KurumeDeva via
  // BeatPlayerGame" pattern, not the older marker-overlay one). ----
  const [debugMode, setDebugMode] = useState(false);
  const [layout, setLayout] = useState(loadLayout);
  const [selectedLayoutKey, setSelectedLayoutKey] = useState(null);
  const [debugCopyStatus, setDebugCopyStatus] = useState('');
  const stageRef = useRef(null);
  const layoutDragRef = useRef(null);

  const safeTimeout = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    return id;
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout)); } catch { /* ignore */ }
  }, [layout]);

  const updateLayoutKey = useCallback((key, patch) => {
    setLayout((cur) => ({ ...cur, [key]: { ...cur[key], ...patch } }));
  }, []);

  const startLayoutDrag = useCallback((e, key) => {
    if (!debugMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedLayoutKey(key);
    layoutDragRef.current = key;
  }, [debugMode]);

  const onStagePointerMove = useCallback((e) => {
    const key = layoutDragRef.current;
    if (!key) return;
    // Marsh waypoints are percent-of-the-marsh-box (that's how the real
    // marsh mechanic reads them), everything else is percent-of-the-stage.
    const isMarshWaypoint = key === 'marshStart' || key.startsWith('marshStop');
    const container = isMarshWaypoint ? marshRef.current : stageRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const l = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const t = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    updateLayoutKey(key, { l: Math.round(l * 10) / 10, t: Math.round(t * 10) / 10 });
  }, [updateLayoutKey]);

  const endLayoutDrag = useCallback(() => { layoutDragRef.current = null; }, []);

  const copyLayoutJson = useCallback(async () => {
    const text = JSON.stringify(layout, null, 2);
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); setDebugCopyStatus('Copied'); }
      else { window.prompt('Copy layout JSON', text); setDebugCopyStatus('Shown'); }
    } catch { window.prompt('Copy layout JSON', text); setDebugCopyStatus('Shown'); }
    setTimeout(() => setDebugCopyStatus(''), 2000);
  }, [layout]);

  const resetLayout = useCallback(() => { setLayout({ ...LAYOUT_DEFAULTS }); setSelectedLayoutKey(null); }, []);

  // Jump directly into a phase for testing, seeding whatever state that
  // phase's render depends on (mirrors jumpToDebugPhase in NewModakSceneV7).
  const jumpToPhase = useCallback((target) => {
    if (target === PHASES.FLOWER_BUSH) {
      setPhase(PHASES.FLOWER_BUSH); setFlowerCount(0); setEmotion(null);
      setBushAttempted(false); setBushOpenState(false); setBushSpringing(false);
      setBranchIntroFailed(false); setBranchComplete(false); setBranchPull(0);
      setMarshStep(0); setMarshDrag({ active: false, x: 0, y: 0 }); setBellyBeat(0);
    } else if (target === PHASES.FLOWER_BRANCH) {
      setPhase(PHASES.FLOWER_BRANCH); setFlowerCount(2); setEmotion(null);
      setBushAttempted(true); setBushOpenState(true);
      setBranchIntroFailed(false); setBranchComplete(false); setBranchPull(0);
      setMarshStep(0); setBellyBeat(0);
    } else if (target === PHASES.FLOWER_MARSH) {
      setPhase(PHASES.FLOWER_MARSH); setFlowerCount(4); setEmotion(null);
      setBushAttempted(true); setBushOpenState(true);
      setBranchIntroFailed(true); setBranchComplete(true); setBranchPull(1);
      setMarshStep(0); setMarshDrag({ active: false, x: 0, y: 0 }); setBellyBeat(0);
    } else if (target === PHASES.BELLY_RECOGNITION) {
      setPhase(PHASES.BELLY_RECOGNITION); setFlowerCount(6); setEmotion(null);
      setBushAttempted(true); setBushOpenState(true);
      setBranchIntroFailed(true); setBranchComplete(true); setBranchPull(1);
      setMarshStep(4); setBellyBeat(0);
    }
  }, []);

  useEffect(() => { if (phase === PHASES.FLOWER_BUSH) speak(VO.open); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------
  // Flying-flower animation -> updates flowerCount once flowers "arrive"
  // -----------------------------------------------------------------
  const flyFlowerToBasket = useCallback(({ src, startX, startY, delay = 0 }) => {
    const basket = basketTargetRef.current;
    if (!basket) return;
    const rect = basket.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 55;
    const id = `${Date.now()}-${Math.random()}`;
    setFlyingFlowers((prev) => [...prev, { id, src, startX, startY, endX, endY, midX, midY, delay }]);
    window.setTimeout(() => {
      setFlyingFlowers((prev) => prev.filter((f) => f.id !== id));
    }, 900 + delay);
  }, []);

  const collectChallengeFlowers = useCallback(({ firstEl, secondEl, newFlowerCount }) => {
    if (!firstEl || !secondEl) { setFlowerCount(newFlowerCount); return; }
    const r1 = firstEl.getBoundingClientRect();
    const r2 = secondEl.getBoundingClientRect();
    flyFlowerToBasket({ src: flowerPink, startX: r1.left + r1.width / 2, startY: r1.top + r1.height / 2, delay: 0 });
    flyFlowerToBasket({ src: flowerCream, startX: r2.left + r2.width / 2, startY: r2.top + r2.height / 2, delay: 120 });
    window.setTimeout(() => {
      setFlowerCount(newFlowerCount);
      onMicroWin?.(`flowers-${newFlowerCount}`);
    }, 760);
  }, [flyFlowerToBasket, onMicroWin]);

  // -----------------------------------------------------------------
  // BUSH — swipe apart. First valid swipe resists, second opens.
  // -----------------------------------------------------------------
  const bushFlowerOneRef = useRef(null);
  const bushFlowerTwoRef = useRef(null);

  const handleBushPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BUSH) return;
    e.preventDefault();
    bushSwipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, [phase]);

  const handleBushPointerUp = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BUSH) return;
    const start = bushSwipeStartRef.current;
    bushSwipeStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const validSwipe = Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy);
    if (!validSwipe) return;

    if (!bushAttempted) {
      setBushAttempted(true);
      setEmotion('angry');
      setBushSpringing(true);
      speak(VO.bushFail);
      safeTimeout(() => setBushSpringing(false), 650);
      return;
    }

    setBushOpenState(true);
    setEmotion(null);
    speak(VO.bushSuccess);
    safeTimeout(() => {
      collectChallengeFlowers({ firstEl: bushFlowerOneRef.current, secondEl: bushFlowerTwoRef.current, newFlowerCount: 2 });
      safeTimeout(() => {
        setPhase(PHASES.FLOWER_BRANCH);
        onPhaseComplete?.(PHASES.FLOWER_BUSH);
      }, 800);
    }, 500);
  }, [phase, bushAttempted, collectChallengeFlowers, onPhaseComplete, safeTimeout]);

  // -----------------------------------------------------------------
  // BRANCH — scripted failed reach, then pull + hold.
  // -----------------------------------------------------------------
  const branchFlowerOneRef = useRef(null);
  const branchFlowerTwoRef = useRef(null);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BRANCH || branchIntroFailed) return;
    speak(VO.branchStart);
    const t = safeTimeout(() => {
      setBranchIntroFailed(true);
      setEmotion('sad');
      safeTimeout(() => speak(VO.branchGesture), 600);
    }, 850);
    return () => clearTimeout(t);
  }, [phase, branchIntroFailed, safeTimeout]);

  const clearBranchHold = useCallback(() => {
    if (branchHoldTimerRef.current) { clearTimeout(branchHoldTimerRef.current); branchHoldTimerRef.current = null; }
  }, []);

  const finishBranchChallenge = useCallback(() => {
    clearBranchHold();
    setBranchPull(1);
    setBranchComplete(true);
    setEmotion(null);
    speak(VO.branchSuccess);
    safeTimeout(() => {
      collectChallengeFlowers({ firstEl: branchFlowerOneRef.current, secondEl: branchFlowerTwoRef.current, newFlowerCount: 4 });
      safeTimeout(() => {
        setPhase(PHASES.FLOWER_MARSH);
        onPhaseComplete?.(PHASES.FLOWER_BRANCH);
      }, 800);
    }, 400);
  }, [clearBranchHold, collectChallengeFlowers, onPhaseComplete, safeTimeout]);

  const handleBranchPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BRANCH || branchComplete) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    branchDragRef.current = { active: true, startY: e.clientY };
    clearBranchHold();
  }, [phase, branchComplete, clearBranchHold]);

  const handleBranchPointerMove = useCallback((e) => {
    if (!branchDragRef.current.active) return;
    const dy = e.clientY - branchDragRef.current.startY;
    const progress = Math.max(0, Math.min(1, dy / 120));
    setBranchPull(progress);
    if (progress >= 0.72) {
      if (!branchHoldTimerRef.current) branchHoldTimerRef.current = setTimeout(finishBranchChallenge, 900);
    } else {
      clearBranchHold();
    }
  }, [finishBranchChallenge, clearBranchHold]);

  const handleBranchPointerEnd = useCallback(() => {
    if (!branchDragRef.current.active) return;
    branchDragRef.current.active = false;
    if (branchComplete) return;
    clearBranchHold();
    if (branchPull > 0.15) {
      setEmotion('sad');
      speak(VO.branchEarly);
    }
    setBranchPull(0);
  }, [branchComplete, branchPull, clearBranchHold]);

  // -----------------------------------------------------------------
  // MARSH — guide across stepping stones, snap to nearest, soft-fail.
  // -----------------------------------------------------------------
  const marshStopsLive = [layout.marshStop1, layout.marshStop2, layout.marshStop3, layout.marshStop4].map((s) => ({ x: s.l, y: s.t }));
  const marshStartLive = { x: layout.marshStart.l, y: layout.marshStart.t };
  const getCurrentMarshPosition = useCallback(
    () => (marshStep === 0 ? marshStartLive : (marshStopsLive[marshStep - 1] || marshStartLive)),
    [marshStep, layout] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (phase === PHASES.FLOWER_MARSH && marshStep === 0) speak(VO.marshStart);
  }, [phase, marshStep]);

  const handleMarshPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_MARSH) return;
    e.preventDefault();
    if (!marshRef.current) return;
    const current = getCurrentMarshPosition();
    setMarshDrag({ active: true, x: current.x, y: current.y });
  }, [phase, getCurrentMarshPosition]);

  const handleMarshPointerMove = useCallback((e) => {
    if (!marshDrag.active) return;
    const rect = marshRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarshDrag({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [marshDrag.active]);

  const marshFlowerOneRef = useRef(null);
  const marshFlowerTwoRef = useRef(null);

  const handleMarshPointerEnd = useCallback(() => {
    if (!marshDrag.active) return;
    const target = marshStopsLive[marshStep];
    if (!target) { setMarshDrag((d) => ({ ...d, active: false })); return; }
    const dx = marshDrag.x - target.x;
    const dy = marshDrag.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 13) {
      const nextStep = marshStep + 1;
      if (nextStep === 1) {
        setMarshWobble(true);
        setEmotion('worried');
        speak(VO.marshWobble);
        safeTimeout(() => setMarshWobble(false), 700);
      }
      setMarshStep(nextStep);
      setMarshDrag({ active: false, x: target.x, y: target.y });

      if (nextStep === 3) {
        safeTimeout(() => collectChallengeFlowers({ firstEl: marshFlowerOneRef.current, secondEl: marshFlowerTwoRef.current, newFlowerCount: 5 }), 100);
      }
      if (nextStep === 4) {
        speak(VO.marshDone);
        safeTimeout(() => {
          setFlowerCount(6);
          setEmotion(null);
          onPhaseComplete?.(PHASES.FLOWER_MARSH);
          safeTimeout(() => setPhase(PHASES.BELLY_RECOGNITION), 700);
        }, 500);
      }
      return;
    }

    // wrong drop — soft fail, snap back to last safe stone
    setMarshSlip(true);
    setEmotion('worried');
    speak(VO.marshWrong);
    const safePosition = getCurrentMarshPosition();
    setMarshDrag({ active: false, x: safePosition.x, y: safePosition.y });
    safeTimeout(() => setMarshSlip(false), 500);
  }, [marshDrag, marshStep, marshStopsLive, collectChallengeFlowers, getCurrentMarshPosition, onPhaseComplete, safeTimeout]);

  // -----------------------------------------------------------------
  // BELLY RECOGNITION — non-interactive payoff.
  // 0 settle / 1 frustrated / 2 disappointed / 3 worried / 4 belly glow
  // / 5 belly reveal / 6 fade+done
  // -----------------------------------------------------------------
  useEffect(() => {
    if (phase !== PHASES.BELLY_RECOGNITION) { setBellyBeat(0); return undefined; }
    const timers = [];
    timers.push(safeTimeout(() => setBellyBeat(1), 350));
    timers.push(safeTimeout(() => { setBellyBeat(2); speak(VO.bellyFrustrated); }, 750));
    timers.push(safeTimeout(() => { setBellyBeat(3); speak(VO.bellyDisappointed); }, 1150));
    timers.push(safeTimeout(() => { setBellyBeat(4); speak(VO.bellyWorried); safeTimeout(() => speak(VO.bellyKeptGoing), 700); }, 1650));
    timers.push(safeTimeout(() => { setBellyBeat(5); speak(VO.bellyReveal); safeTimeout(() => speak(VO.bellyMeaning), 700); }, 2900));
    timers.push(safeTimeout(() => {
      setBellyBeat(6);
      onPhaseComplete?.(PHASES.BELLY_RECOGNITION);
    }, 4700));
    timers.push(safeTimeout(() => {
      setPhase(PHASES.DONE);
    }, 5500));
    return () => timers.forEach(clearTimeout);
  }, [phase, onPhaseComplete, safeTimeout]);

  if (!isActive) return null;

  const isBushPhase = phase === PHASES.FLOWER_BUSH;
  const isBranchPhase = phase === PHASES.FLOWER_BRANCH;
  const isMarshPhase = phase === PHASES.FLOWER_MARSH;
  const isBellyPhase = phase === PHASES.BELLY_RECOGNITION;
  const isDonePhase = phase === PHASES.DONE;

  // Progressive reveal: once shown, an object stays as completed scenery
  // instead of unmounting — so the world visibly builds up (Bush alone ->
  // Bush+Tree -> Bush+Tree+Marsh -> all three as backdrop for Belly).
  const showBush = !isDonePhase;
  const showTree = isBranchPhase || isMarshPhase || isBellyPhase;
  const showMarsh = isMarshPhase || isBellyPhase;
  const bushSceneryComplete = showBush && !isBushPhase;
  const treeSceneryComplete = showTree && !isBranchPhase;
  const marshSceneryComplete = showMarsh && !isMarshPhase;

  // The shared, walking Mooshika — used for Bush and Branch (Marsh has its
  // own draggable sprite; Belly Recognition renders its own too).
  const mooshikaPhaseKey = isBushPhase ? 'mooshikaBush' : isBranchPhase ? 'mooshikaBranch' : null;
  const showSharedMooshika = !!mooshikaPhaseKey;

  return (
    <div
      ref={stageRef}
      className={`mg2 ${isPaused ? 'mg2--paused' : ''} ${debugMode ? 'mg2--debugging' : ''}`}
      style={{ backgroundImage: `url(${forestBackground})` }}
      onPointerMove={debugMode ? onStagePointerMove : undefined}
      onPointerUp={debugMode ? endLayoutDrag : undefined}
      onPointerCancel={debugMode ? endLayoutDrag : undefined}
    >

      {!hideElements && !isBellyPhase && !isDonePhase && (
        <div className="mg2-hud">
          <span>Flowers: {flowerCount} / 6</span>
          <span className="mg2-hud-phase">{phase.replace('flower_', '').toUpperCase()}</span>
          <button type="button" className="mg2-mute-btn" onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Unmute' : 'Mute'} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
      {(isBellyPhase || isDonePhase) && (
        <button type="button" className="mg2-mute-btn mg2-mute-btn--floating" onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Unmute' : 'Mute'} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      {/* ---------------- BUSH ---------------- */}
      {showBush && (
        <div
          className={`mg2-bush-area ${isBushPhase ? 'is-active' : ''} ${bushSceneryComplete ? 'is-complete' : ''}`}
          style={{ left: `${layout.bush.l}%`, top: `${layout.bush.t}%` }}
        >
          <button
            type="button"
            className={`mg2-bush ${bushSpringing ? 'mg2-bush--springing' : ''} ${bushOpenState ? 'mg2-bush--open' : ''}`}
            style={debugMode && selectedLayoutKey === 'bush' ? { outline: '2px dashed #03A9F4', outlineOffset: 3 } : undefined}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'bush') : (isBushPhase ? handleBushPointerDown : undefined)}
            onPointerUp={!debugMode && isBushPhase ? handleBushPointerUp : undefined}
            onPointerCancel={() => { bushSwipeStartRef.current = null; }}
            disabled={!debugMode && !isBushPhase}
          >
            <img src={bushOpenState ? bushOpen : bushClosed} alt="" />
          </button>

          {bushOpenState && flowerCount < 2 && (
            <div className="mg2-bush-flowers">
              <img ref={bushFlowerOneRef} src={flowerPink} alt="" />
              <img ref={bushFlowerTwoRef} src={flowerCream} alt="" />
            </div>
          )}
        </div>
      )}

      {/* ---------------- BRANCH / TREE ---------------- */}
      {showTree && (
        <div className={`mg2-tree-area ${isBranchPhase ? 'is-active' : ''} ${treeSceneryComplete ? 'is-complete' : ''}`}>
          <img
            src={treeArt} alt="" className="mg2-tree"
            style={{ left: `${layout.tree.l}%`, top: `${layout.tree.t}%`, outline: debugMode && selectedLayoutKey === 'tree' ? '2px dashed #03A9F4' : undefined, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : 'none' }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'tree') : undefined}
          />

          <button
            type="button"
            className="mg2-branch"
            style={{ '--pull': branchComplete ? 1 : branchPull, left: `${layout.branch.l}%`, top: `${layout.branch.t}%`, outline: debugMode && selectedLayoutKey === 'branch' ? '2px dashed #03A9F4' : undefined, outlineOffset: debugMode && selectedLayoutKey === 'branch' ? 3 : undefined }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'branch') : (isBranchPhase ? handleBranchPointerDown : undefined)}
            onPointerMove={!debugMode && isBranchPhase ? handleBranchPointerMove : undefined}
            onPointerUp={!debugMode && isBranchPhase ? handleBranchPointerEnd : undefined}
            onPointerCancel={!debugMode && isBranchPhase ? handleBranchPointerEnd : undefined}
            disabled={!debugMode && !isBranchPhase}
          >
            <img src={branchArt} alt="" />
            {!branchComplete && flowerCount < 4 && (
              <>
                <img ref={branchFlowerOneRef} src={flowerPink} alt="" className="mg2-branch-flower mg2-branch-flower--1" />
                <img ref={branchFlowerTwoRef} src={flowerCream} alt="" className="mg2-branch-flower mg2-branch-flower--2" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ---------------- MARSH ---------------- */}
      {showMarsh && (
        <div
          ref={marshRef}
          className={`mg2-marsh-area ${isMarshPhase ? 'is-active' : ''} ${marshSceneryComplete ? 'is-complete' : ''}`}
          style={{ left: `${layout.marsh.l}%`, top: `${layout.marsh.t}%`, outline: debugMode && selectedLayoutKey === 'marsh' ? '2px dashed #03A9F4' : undefined, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : undefined }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'marsh') : undefined}
        >
          <img src={marshArt} alt="" className="mg2-marsh" />

          {flowerCount < 5 && <img ref={marshFlowerOneRef} src={flowerPink} alt="" className="mg2-marsh-flower mg2-marsh-flower--1" />}
          {flowerCount < 6 && <img ref={marshFlowerTwoRef} src={flowerCream} alt="" className="mg2-marsh-flower mg2-marsh-flower--2" />}

          {isMarshPhase && (() => {
            const safePosition = getCurrentMarshPosition();
            const position = marshDrag.active ? marshDrag : safePosition;
            return (
              <button
                type="button"
                className={`mg2-marsh-mooshika ${marshWobble ? 'mg2-marsh-mooshika--wobble' : ''} ${marshSlip ? 'mg2-marsh-mooshika--slip' : ''}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onPointerDown={debugMode ? undefined : handleMarshPointerDown}
                onPointerMove={debugMode ? undefined : handleMarshPointerMove}
                onPointerUp={debugMode ? undefined : handleMarshPointerEnd}
                onPointerCancel={debugMode ? undefined : handleMarshPointerEnd}
              >
                <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
                {emotion === 'worried' && (
                  <img src={emotionWorried} alt="Worried" className="mg2-emotion mg2-emotion--anchored" />
                )}
              </button>
            );
          })()}

          {debugMode && ['marshStart', 'marshStop1', 'marshStop2', 'marshStop3', 'marshStop4'].map((key) => (
            <div
              key={key}
              className={`mg2-debug-waypoint ${selectedLayoutKey === key ? 'is-selected' : ''}`}
              style={{ left: `${layout[key].l}%`, top: `${layout[key].t}%` }}
              onPointerDown={(e) => startLayoutDrag(e, key)}
              title={LAYOUT_LABELS[key]}
            />
          ))}
        </div>
      )}

      {/* ---------------- Shared Mooshika (Bush + Branch phases) — walks
          between fixed spots instead of standing in one corner all game.
          Emotion bubbles live right on it, not floating off in the scenery. ---------------- */}
      {showSharedMooshika && (
        <div
          className={`mg2-mooshika-shared ${branchIntroFailed && isBranchPhase ? 'mg2-mooshika-shared--failed' : ''}`}
          style={{
            left: `${layout[mooshikaPhaseKey].l}%`, top: `${layout[mooshikaPhaseKey].t}%`,
            outline: debugMode && selectedLayoutKey === mooshikaPhaseKey ? '2px dashed #03A9F4' : undefined,
            outlineOffset: 3, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : undefined,
          }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, mooshikaPhaseKey) : undefined}
        >
          <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
          {isBushPhase && emotion === 'angry' && (
            <img src={emotionAngry} alt="Frustrated" className="mg2-emotion mg2-emotion--anchored" />
          )}
          {isBranchPhase && emotion === 'sad' && (
            <img src={emotionSad} alt="Disappointed" className="mg2-emotion mg2-emotion--anchored" />
          )}
        </div>
      )}

      {/* ---------------- BELLY RECOGNITION ---------------- */}
      {phase === PHASES.BELLY_RECOGNITION && (
        <div className="mg2-belly">
          <div className="mg2-belly-ganesha">
            <img src={ganeshaArt} alt="Ganesha" />
            {bellyBeat >= 4 && <div className={`mg2-belly-glow ${bellyBeat >= 5 ? 'mg2-belly-glow--strong' : ''}`} aria-hidden="true" />}
          </div>

          <div
            className="mg2-belly-mooshika"
            style={{
              left: `${layout.mooshikaBelly.l}%`, top: `${layout.mooshikaBelly.t}%`,
              outline: debugMode && selectedLayoutKey === 'mooshikaBelly' ? '2px dashed #03A9F4' : undefined,
              outlineOffset: 3, cursor: debugMode ? 'grab' : undefined,
            }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'mooshikaBelly') : undefined}
          >
            <img src={mooshikaCalm} alt="Mooshika" />
            {bellyBeat >= 1 && bellyBeat < 6 && <img src={emotionAngry} alt="Frustrated" className="mg2-belly-emotion mg2-belly-emotion--angry" />}
            {bellyBeat >= 2 && bellyBeat < 6 && <img src={emotionSad} alt="Disappointed" className="mg2-belly-emotion mg2-belly-emotion--sad" />}
            {bellyBeat >= 3 && bellyBeat < 6 && <img src={emotionWorried} alt="Worried" className="mg2-belly-emotion mg2-belly-emotion--worried" />}

            <div className="mg2-belly-basket">
              <MooshikaWithBasket flowerCount={6} basketRef={basketTargetRef} standalone />
            </div>
          </div>

          {bellyBeat >= 5 && (
            <div className="mg2-belly-symbol">
              <img src={bellySymbol} alt="" />
              <span>Belly</span>
            </div>
          )}
        </div>
      )}

      {phase === PHASES.DONE && (
        <div className="mg2-done">
          <h2>Belly recognized — hand-off to Garland Build ↓</h2>
          <p>Game 2 preview ends here. The real Garland Build wiring is a separate pass.</p>
        </div>
      )}

      {/* ---------------- flying flowers ---------------- */}
      <div className="mg2-flight-layer">
        {flyingFlowers.map((f) => (
          <img
            key={f.id}
            src={f.src}
            alt=""
            className="mg2-flying-flower"
            style={{
              '--start-x': `${f.startX}px`,
              '--start-y': `${f.startY}px`,
              '--mid-x': `${f.midX}px`,
              '--mid-y': `${f.midY}px`,
              '--end-x': `${f.endX}px`,
              '--end-y': `${f.endY}px`,
              '--delay': `${f.delay}ms`,
            }}
          />
        ))}
      </div>

      {/* ---------------- LAYOUT DEBUG — BeatPlayerGame style: toggle pill
          top-right, click/drag the real sprites directly to select+move
          them, small readout panel bottom-right. ---------------- */}
      <button type="button" className={`mg2-debug-pill ${debugMode ? 'is-on' : ''}`} onClick={() => { setDebugMode((v) => !v); setSelectedLayoutKey(null); }}>
        {debugMode ? 'layout on' : 'layout off'}
      </button>

      {debugMode && (
        <div className="mg2-debug-panel">
          <div className="mg2-debug-panel-row">
            <strong>Layout Debug</strong> — {phase.replace('flower_', '')}
          </div>

          <label className="mg2-debug-row">
            <span>Jump to</span>
            <select onChange={(e) => { if (e.target.value) jumpToPhase(e.target.value); e.target.value = ''; }} defaultValue="">
              <option value="" disabled>pick a phase…</option>
              <option value={PHASES.FLOWER_BUSH}>1. Bush</option>
              <option value={PHASES.FLOWER_BRANCH}>2. Branch</option>
              <option value={PHASES.FLOWER_MARSH}>3. Marsh</option>
              <option value={PHASES.BELLY_RECOGNITION}>4. Belly Recognition</option>
            </select>
          </label>

          {selectedLayoutKey ? (
            <>
              <div className="mg2-debug-panel-row">{LAYOUT_LABELS[selectedLayoutKey]}</div>
              <label>X <input type="number" step="0.5" value={layout[selectedLayoutKey].l} onChange={(e) => updateLayoutKey(selectedLayoutKey, { l: Number(e.target.value) })} /></label>
              <label>Y <input type="number" step="0.5" value={layout[selectedLayoutKey].t} onChange={(e) => updateLayoutKey(selectedLayoutKey, { t: Number(e.target.value) })} /></label>
            </>
          ) : (
            <div className="mg2-debug-panel-row">Drag any element to select it.</div>
          )}

          <div className="mg2-debug-panel-row mg2-debug-panel-actions">
            <button type="button" onClick={copyLayoutJson}>{debugCopyStatus || 'Copy layout JSON'}</button>
            <button type="button" onClick={resetLayout}>Reset layout</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MooshikaWithBasket({ flowerCount = 0, basketRef, standalone }) {
  return (
    <div className={`mg2-basket-character ${standalone ? 'mg2-basket-character--standalone' : ''}`}>
      <img src={mooshikaCalm} alt="Mooshika" className="mg2-basket-character__mouse" />
      <div ref={basketRef} className={`mg2-basket-flowers mg2-basket-flowers--${flowerCount}`} aria-hidden="true">
        {flowerCount >= 2 && (
          <>
            <img src={flowerPink} className="mg2-basket-flower mg2-basket-flower--1" alt="" />
            <img src={flowerCream} className="mg2-basket-flower mg2-basket-flower--2" alt="" />
          </>
        )}
        {flowerCount >= 4 && <img src={flowerPink} className="mg2-basket-flower mg2-basket-flower--3" alt="" />}
        {flowerCount >= 6 && (
          <>
            <img src={flowerCream} className="mg2-basket-flower mg2-basket-flower--4" alt="" />
            <img src={flowerPink} className="mg2-basket-flower mg2-basket-flower--5" alt="" />
          </>
        )}
      </div>
    </div>
  );
}
