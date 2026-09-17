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
import GestureDemo from '../../lib/components/feedback/GestureDemo';
import './ModakGame2Preview.css';

import forestBackground from '../../zones/symbol-mountain/scenes/modak/assets/images/modak-fj-bg.webp';
import mooshikaCalm from '../../zones/symbol-mountain/scenes/modak/assets/images/mushika-calm-game2.webp';
import mooshikaTurned from '../../zones/symbol-mountain/scenes/modak/assets/images/mooshika-turned-game2.webp';
import bushClosed from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-bush-closed-new.webp';
import bushOpen from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-bush-open-new.webp';
import branchArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-branch-new.webp';
import treeArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-tree-new.webp';
import marshArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-mud-plain.webp';
import marshClumpArt from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-marsh-clump.webp';
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
const MARSH_START = { x: 2, y: 80 };
const MARSH_STOPS = [
  { x: 19.8, y: 47.2 },
  { x: 41.8, y: 39.2 },
  { x: 56, y: 57 },
  { x: 84.9, y: 55.4 },
];

// ---------------------------------------------------------------------
// LAYOUT DEBUG — positions of every stage element, draggable live via the
// "Layout Debug" panel (same pattern as KurumedevaGame.jsx / NewModakSceneV7's
// debug panels). {l,t} = left/top percent of the stage. Persisted to
// localStorage so tuning survives reload.
// ---------------------------------------------------------------------
const LAYOUT_STORAGE_KEY = 'modakGame2PreviewLayout';
const LAYOUT_DEFAULTS = {
  marshExit: { l: 86.3, t: 4.1 },
  ganesha: { l: 55.9, t: 30.4, s: 100 },
  emojiBush: { l: 80, t: -38, s: 100 },
  emojiBranch: { l: 80, t: -38, s: 100 },
  emojiMarsh: { l: 80, t: -38, s: 100 },
  emojiAngry: { l: -1.9, t: -30.8, s: 100 },
  emojiSad: { l: 86.9, t: 59.2, s: 100 },
  emojiWorried: { l: 90.2, t: -18.7, s: 100 },
  bush: { l: 27, t: 75.3, s: 100 },
  tree: { l: 74.8, t: 52.5, s: 100 },
  branch: { l: 62, t: 54.2, s: 100 },
  marsh: { l: 61, t: 35, s: 100 },
  mooshikaBush: { l: 26, t: 75, s: 100 },
  mooshikaBranch: { l: 61.4, t: 83.5, s: 100 },
  mooshikaBelly: { l: 67.6, t: 40.4, s: 100 },
  branchFlower1: { l: 49.1, t: 34.4, s: 100 },
  branchFlower2: { l: 20.3, t: 48.1, s: 100 },
  marshFlower1: { l: 66, t: 48, s: 100 },
  marshFlower2: { l: 87, t: 31, s: 100 },
  marshStart: { l: 4, t: 67 },
  marshStop1: { l: 20, t: 57, s: 100 },
  marshStop2: { l: 42, t: 39, s: 100 },
  marshStop3: { l: 66, t: 56, s: 100 },
  marshStop4: { l: 87, t: 39, s: 100 },
};
const LAYOUT_LABELS = {
  marshExit: 'Mooshika (dry-bank finish)', ganesha: 'Ganesha',
  emojiBush: 'Bush emoji', emojiBranch: 'Branch emoji', emojiMarsh: 'Marsh emoji',
  emojiAngry: 'Belly angry emoji', emojiSad: 'Belly sad emoji', emojiWorried: 'Belly worried emoji',
  bush: 'Bush', tree: 'Tree', branch: 'Branch', marsh: 'Marsh area',
  mooshikaBush: 'Mooshika (bush phase)',
  mooshikaBranch: 'Mooshika (branch phase)',
  mooshikaBelly: 'Mooshika (belly phase)',
  marshStart: 'Marsh start', marshStop1: 'Marsh stone 1', marshStop2: 'Marsh stone 2',
  marshStop3: 'Marsh stone 3', marshStop4: 'Marsh stone 4',
  branchFlower1: 'Branch flower (pink)', branchFlower2: 'Branch flower (cream)',
  marshFlower1: 'Marsh flower (pink)', marshFlower2: 'Marsh flower (cream)',
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
  branchNearMiss: 'So close! Try once more.',
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
  bellyAffirmation: 'I can make room for my feelings and keep going.',
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

// Sequenced VO: waits for the line to actually finish before resolving, so
// scripted sequences (opening, branch intro, belly recognition) can't have
// one line cut off the last one. Falls back to a length-based timer when
// muted / speechSynthesis is unavailable, so dev/mute testing still paces.
function speakAsync(text) {
  return new Promise((resolve) => {
    try {
      if (VO_MUTED || typeof window === 'undefined' || !window.speechSynthesis) {
        window.setTimeout(resolve, Math.max(700, text.length * 45));
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    } catch { resolve(); }
  });
}
function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ModakGame2Preview({ isActive = true, isPaused = false, hideElements = false, onPhaseComplete, onMicroWin }) {
  const [phase, setPhase] = useState(PHASES.FLOWER_BUSH);
  const [flowerCount, setFlowerCount] = useState(0);
  const [emotion, setEmotion] = useState(null);

  // ---- IDLE HINT LADDER (ported from NewModakSceneV7.jsx) ----
  // introGesture: shown briefly (6s) whenever a new working phase begins,
  // regardless of idle. idleHintLevel escalates 0->1->2->3 the longer the
  // child doesn't interact: L1 = subtle glow on the target (.hint CSS class),
  // L2 = one-time nudge VO, L3 = full animated-hand GestureDemo. Any pointer
  // interaction resets the whole ladder back to 0.
  const WORKING_PHASES = [PHASES.FLOWER_BUSH, PHASES.FLOWER_BRANCH, PHASES.FLOWER_MARSH];
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const [introGesture, setIntroGesture] = useState(false);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const idleVoPlayedRef = useRef({});

  const noteInteraction = useCallback(() => {
    lastIdleInteractionAtRef.current = Date.now();
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
    setIntroGesture(false);
  }, []);

  // Intro gesture: 6s window on every phase entry.
  useEffect(() => {
    if (!WORKING_PHASES.includes(phase)) { setIntroGesture(false); return undefined; }
    setIntroGesture(true);
    lastIdleInteractionAtRef.current = Date.now();
    const t = window.setTimeout(() => setIntroGesture(false), 6000);
    return () => window.clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deterministic idle ladder — ticks every 250ms while in a working phase.
  useEffect(() => {
    if (!WORKING_PHASES.includes(phase)) { setIdleHintLevel(0); setShowIdleGestureHint(false); return undefined; }
    const tick = window.setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel((prev) => (prev === nextLevel ? prev : nextLevel));
    }, 250);
    return () => window.clearInterval(tick);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setShowIdleGestureHint(WORKING_PHASES.includes(phase) && idleHintLevel >= 3);
  }, [idleHintLevel, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Idle nudge VO once per phase at level >= 2.
  useEffect(() => {
    if (idleHintLevel < 2 || idleVoPlayedRef.current[phase]) return;
    idleVoPlayedRef.current[phase] = true;
    const line = phase === PHASES.FLOWER_BUSH ? VO.bushStart
      : phase === PHASES.FLOWER_BRANCH ? VO.branchGesture
      : phase === PHASES.FLOWER_MARSH ? VO.marshStart
      : null;
    if (line) speak(line);
  }, [idleHintLevel, phase]);

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
  const branchEarlyWarnedRef = useRef(false);
  const branchAttemptedRef = useRef(false);

  // ---- MARSH ----
  const marshRef = useRef(null);
  const [marshStep, setMarshStep] = useState(0);
  const [marshExiting, setMarshExiting] = useState(false);
  useEffect(() => { setMarshExiting(false); }, [phase]);
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
    if (!debugMode || layoutDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const container = key.startsWith('emoji') ? e.currentTarget.parentElement : key === 'marshExit' || key === 'marshStart' || key.startsWith('marshStop') || key.startsWith('marshFlower')
      ? marshRef.current : key.startsWith('branchFlower') ? branchRef.current : stageRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setSelectedLayoutKey(key);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // Preserve the grab point, regardless of the sprite's CSS anchor or scale.
    layoutDragRef.current = {
      key, pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY,
      l: layout[key].l, t: layout[key].t, width: rect.width, height: rect.height,
    };
  }, [debugMode, layout]);

  const onStagePointerMove = useCallback((e) => {
    const drag = layoutDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const l = Math.max(drag.key.startsWith('emoji') ? -100 : 0, Math.min(drag.key === 'marshExit' || drag.key.startsWith('emoji') ? 200 : 100, drag.l + (e.clientX - drag.clientX) / drag.width * 100));
    const t = Math.max(drag.key.startsWith('emoji') ? -100 : 0, Math.min(drag.key.startsWith('emoji') ? 200 : 100, drag.t + (e.clientY - drag.clientY) / drag.height * 100));
    updateLayoutKey(drag.key, { l: Math.round(l * 10) / 10, t: Math.round(t * 10) / 10 });
  }, [updateLayoutKey]);

  const endLayoutDrag = useCallback((e) => {
    if (!e || layoutDragRef.current?.pointerId === e.pointerId) layoutDragRef.current = null;
  }, []);

  useEffect(() => { if (!debugMode) layoutDragRef.current = null; }, [debugMode]);

  const emojiProps = (key) => ({
    style: { left: `${layout[key].l}%`, top: `${layout[key].t}%`, right: 'auto',
      transform: `scale(${layout[key].s / 100})`, animation: debugMode ? 'none' : undefined,
      pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined },
    onPointerDown: debugMode ? (e) => startLayoutDrag(e, key) : undefined,
  });

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
    branchAttemptedRef.current = false;
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
      branchAttemptedRef.current = true;
      setPhase(PHASES.FLOWER_MARSH); setFlowerCount(4); setEmotion(null);
      setBushAttempted(true); setBushOpenState(true);
      setBranchIntroFailed(true); setBranchComplete(true); setBranchPull(1);
      setMarshStep(0); setMarshDrag({ active: false, x: 0, y: 0 }); setBellyBeat(0);
    } else if (target === PHASES.BELLY_RECOGNITION) {
      branchAttemptedRef.current = true;
      setPhase(PHASES.BELLY_RECOGNITION); setFlowerCount(6); setEmotion(null);
      setBushAttempted(true); setBushOpenState(true);
      setBranchIntroFailed(true); setBranchComplete(true); setBranchPull(1);
      setMarshStep(4); setBellyBeat(0);
    }
  }, []);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BUSH || bushAttempted) return undefined;
    let cancelled = false;
    (async () => {
      await speakAsync(VO.open);
      if (cancelled) return;
      await wait(400);
      if (cancelled) return;
      await speakAsync(VO.bushStart);
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    noteInteraction();
    bushSwipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, [phase, noteInteraction]);

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
      }, 2200);
    }, 700);
  }, [phase, bushAttempted, collectChallengeFlowers, onPhaseComplete, safeTimeout]);

  // -----------------------------------------------------------------
  // BRANCH — scripted failed reach, then pull + hold.
  // -----------------------------------------------------------------
  const branchFlowerOneRef = useRef(null);
  const branchFlowerTwoRef = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BRANCH || branchIntroFailed) return undefined;
    let cancelled = false;
    (async () => {
      // let Mooshika visibly arrive at the branch before anything happens.
      // No emotion bubble here — this is a scripted story beat, not a real
      // failed attempt by the child. Emotion only shows on an actual early
      // release (see handleBranchPointerEnd), matching Bush's pattern.
      await wait(850);
      if (cancelled) return;
      setBranchIntroFailed(true);
      await wait(300);
      if (cancelled) return;
      await speakAsync(VO.branchStart);
      if (cancelled) return;
      await wait(400);
      if (cancelled) return;
      await speakAsync(VO.branchGesture);
    })();
    return () => { cancelled = true; };
  }, [phase, branchIntroFailed]);

  const clearBranchHold = useCallback(() => {
    if (branchHoldTimerRef.current) { clearTimeout(branchHoldTimerRef.current); branchHoldTimerRef.current = null; }
  }, []);

  const finishBranchChallenge = useCallback(() => {
    clearBranchHold();
    // Mirror Bush's pattern: the first successful hold doesn't actually
    // complete the challenge — it springs back with a "so close" beat, and
    // only the second attempt succeeds. Emotion only shows here, after a
    // real (if scripted) failed attempt, not automatically on phase entry.
    if (!branchAttemptedRef.current) {
      branchAttemptedRef.current = true;
      setEmotion('sad');
      speak(VO.branchNearMiss);
      setBranchPull(0.3);
      safeTimeout(() => setBranchPull(0), 450);
      return;
    }
    setBranchPull(1);
    setBranchComplete(true);
    setEmotion(null);
    speak(VO.branchSuccess);
    safeTimeout(() => {
      collectChallengeFlowers({ firstEl: branchFlowerOneRef.current, secondEl: branchFlowerTwoRef.current, newFlowerCount: 4 });
      safeTimeout(() => {
        setPhase(PHASES.FLOWER_MARSH);
        onPhaseComplete?.(PHASES.FLOWER_BRANCH);
      }, 2200);
    }, 700);
  }, [clearBranchHold, collectChallengeFlowers, onPhaseComplete, safeTimeout]);

  const handleBranchPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BRANCH || branchComplete) return;
    e.preventDefault();
    noteInteraction();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    branchDragRef.current = { active: true, startY: e.clientY };
    clearBranchHold();
  }, [phase, branchComplete, clearBranchHold, noteInteraction]);

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
      if (!branchEarlyWarnedRef.current) {
        branchEarlyWarnedRef.current = true;
        speak(VO.branchEarly);
      }
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

  const marshPointerRef = useRef(null);
  const marshPointFromEvent = (e) => {
    const rect = marshRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return null;
    return { x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 };
  };
  const marshLandingFromEvent = (e) => {
    const point = marshPointFromEvent(e);
    const gesture = marshPointerRef.current;
    if (!point || !gesture || gesture.id !== e.pointerId) return null;
    return { x: point.x + gesture.offsetX, y: point.y + gesture.offsetY };
  };

  const handleMarshPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_MARSH || marshStep >= 4 || marshPointerRef.current) return;
    e.preventDefault();
    const point = marshPointFromEvent(e);
    if (!point) return;
    noteInteraction();
    const current = getCurrentMarshPosition();
    marshPointerRef.current = { id: e.pointerId, offsetX: current.x - point.x, offsetY: current.y - point.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setMarshDrag({ active: true, x: current.x, y: current.y });
  }, [phase, marshStep, getCurrentMarshPosition, noteInteraction]);

  const handleMarshPointerMove = useCallback((e) => {
    const position = marshLandingFromEvent(e);
    if (position) setMarshDrag({ active: true, ...position });
  }, []);

  const handleMarshPointerCancel = useCallback(() => {
    marshPointerRef.current = null;
    setMarshDrag({ active: false, ...getCurrentMarshPosition() });
  }, [getCurrentMarshPosition]);

  const marshFlowerOneRef = useRef(null);
  const marshFlowerTwoRef = useRef(null);
  const marshWrongWarnedRef = useRef(false);

  const flyOneFlowerToBasket = useCallback((el, src, newFlowerCount) => {
    if (!el) { setFlowerCount(newFlowerCount); return; }
    const r = el.getBoundingClientRect();
    flyFlowerToBasket({ src, startX: r.left + r.width / 2, startY: r.top + r.height / 2, delay: 0 });
    window.setTimeout(() => {
      setFlowerCount(newFlowerCount);
      onMicroWin?.(`flowers-${newFlowerCount}`);
    }, 600);
  }, [flyFlowerToBasket, onMicroWin]);

  const handleMarshPointerEnd = useCallback((e) => {
    const position = marshLandingFromEvent(e);
    if (!position) return;
    marshPointerRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const target = marshStopsLive[marshStep];
    if (!target) { setMarshDrag((d) => ({ ...d, active: false })); return; }
    const dx = position.x - target.x;
    const dy = position.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 22) {
      const nextStep = marshStep + 1;
      if (nextStep === 2) {
        // Scripted "ooh, wobbly" beat once the crossing is underway (after
        // the 2nd stone) — shows the worried bubble here, same as Branch's
        // near-miss: a real story beat, not on the very first step.
        setMarshWobble(true);
        setEmotion('worried');
        speak(VO.marshWobble);
        safeTimeout(() => setMarshWobble(false), 700);
      }
      setMarshStep(nextStep);
      setMarshDrag({ active: false, x: target.x, y: target.y });

      if (nextStep === 3) {
        safeTimeout(() => flyOneFlowerToBasket(marshFlowerOneRef.current, flowerPink, 5), 100);
      }
      if (nextStep === 4) {
        safeTimeout(async () => {
          flyOneFlowerToBasket(marshFlowerTwoRef.current, flowerCream, 6);
          setEmotion(null);
          await wait(600);
          setMarshExiting(true);
          await wait(1400);
          await speakAsync(VO.marshDone);
          await wait(700);
          onPhaseComplete?.(PHASES.FLOWER_MARSH);
          setPhase(PHASES.BELLY_RECOGNITION);
        }, 100);
      }
      return;
    }

    // wrong drop — soft fail, snap back to last safe stone. Only speak the
    // "back to safe spot" line the first time; repeats just snap back quietly.
    setMarshSlip(true);
    setEmotion('worried');
    if (!marshWrongWarnedRef.current) {
      marshWrongWarnedRef.current = true;
      speak(VO.marshWrong);
    }
    const safePosition = getCurrentMarshPosition();
    setMarshDrag({ active: false, x: safePosition.x, y: safePosition.y });
    safeTimeout(() => setMarshSlip(false), 500);
  }, [marshDrag, marshStep, marshStopsLive, flyOneFlowerToBasket, getCurrentMarshPosition, onPhaseComplete, safeTimeout]);

  // -----------------------------------------------------------------
  // BELLY RECOGNITION — non-interactive payoff.
  // 0 settle / 1 frustrated / 2 disappointed / 3 worried / 4 belly glow
  // / 5 belly reveal / 6 fade+done
  // -----------------------------------------------------------------
  useEffect(() => {
    if (phase !== PHASES.BELLY_RECOGNITION) { setBellyBeat(0); return undefined; }
    let cancelled = false;
    (async () => {
      await wait(600);
      if (cancelled) return;
      setBellyBeat(1);
      await speakAsync(VO.bellyFrustrated);

      await wait(300);
      if (cancelled) return;
      setBellyBeat(2);
      await speakAsync(VO.bellyDisappointed);

      await wait(300);
      if (cancelled) return;
      setBellyBeat(3);
      await speakAsync(VO.bellyWorried);

      await wait(450);
      if (cancelled) return;
      await speakAsync(VO.bellyKeptGoing);

      if (cancelled) return;
      setBellyBeat(4);
      await wait(750);

      if (cancelled) return;
      setBellyBeat(5);
      await speakAsync(VO.bellyReveal);

      await wait(350);
      if (cancelled) return;
      await speakAsync(VO.bellyMeaning);

      await wait(350);
      if (cancelled) return;
      await speakAsync(VO.bellyAffirmation);

      await wait(700);
      if (cancelled) return;
      setBellyBeat(6);
      onPhaseComplete?.(PHASES.BELLY_RECOGNITION);

      await wait(800);
      if (cancelled) return;
      setPhase(PHASES.DONE);
    })();
    return () => { cancelled = true; };
  }, [phase, onPhaseComplete]);

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
          style={{ left: `${layout.bush.l}%`, top: `${layout.bush.t}%`, '--layout-scale': (layout.bush.s || 100) / 100 }}
        >
          <button
            type="button"
            className={`mg2-bush ${bushSpringing ? 'mg2-bush--springing' : ''} ${bushOpenState ? 'mg2-bush--open' : ''} ${isBushPhase && idleHintLevel >= 1 ? 'hint' : ''}`}
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
            style={{ left: `${layout.tree.l}%`, top: `${layout.tree.t}%`, '--layout-scale': (layout.tree.s || 100) / 100, outline: debugMode && selectedLayoutKey === 'tree' ? '2px dashed #03A9F4' : undefined, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : 'none' }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'tree') : undefined}
          />

          <button
            ref={branchRef}
            type="button"
            className={`mg2-branch ${isBranchPhase && branchIntroFailed && !branchComplete && idleHintLevel >= 1 ? 'hint' : ''}`}
            style={{ '--pull': branchComplete ? 1 : branchPull, '--layout-scale': (layout.branch.s || 100) / 100, left: `${layout.branch.l}%`, top: `${layout.branch.t}%`, outline: debugMode && selectedLayoutKey === 'branch' ? '2px dashed #03A9F4' : undefined, outlineOffset: debugMode && selectedLayoutKey === 'branch' ? 3 : undefined }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'branch') : (isBranchPhase ? handleBranchPointerDown : undefined)}
            onPointerMove={!debugMode && isBranchPhase ? handleBranchPointerMove : undefined}
            onPointerUp={!debugMode && isBranchPhase ? handleBranchPointerEnd : undefined}
            onPointerCancel={!debugMode && isBranchPhase ? handleBranchPointerEnd : undefined}
            disabled={!debugMode && !isBranchPhase}
          >
            <img src={branchArt} alt="" />
            {!branchComplete && flowerCount < 4 && (
              <>
                <img
                  ref={branchFlowerOneRef} src={flowerPink} alt="" className="mg2-branch-flower"
                  style={{
                    left: `${layout.branchFlower1.l}%`, top: `${layout.branchFlower1.t}%`,
                    '--layout-scale': (layout.branchFlower1.s || 100) / 100,
                    outline: debugMode && selectedLayoutKey === 'branchFlower1' ? '2px dashed #03A9F4' : undefined,
                    pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined,
                  }}
                  onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'branchFlower1') : undefined}
                />
                <img
                  ref={branchFlowerTwoRef} src={flowerCream} alt="" className="mg2-branch-flower"
                  style={{
                    left: `${layout.branchFlower2.l}%`, top: `${layout.branchFlower2.t}%`,
                    '--layout-scale': (layout.branchFlower2.s || 100) / 100,
                    outline: debugMode && selectedLayoutKey === 'branchFlower2' ? '2px dashed #03A9F4' : undefined,
                    pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined,
                  }}
                  onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'branchFlower2') : undefined}
                />
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
          style={{ left: `${layout.marsh.l}%`, top: `${layout.marsh.t}%`, '--layout-scale': (layout.marsh.s || 100) / 100, outline: debugMode && selectedLayoutKey === 'marsh' ? '2px dashed #03A9F4' : undefined, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : undefined }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'marsh') : undefined}
        >
          <img src={marshArt} alt="" className="mg2-marsh" />

          {['marshStop1', 'marshStop2', 'marshStop3', 'marshStop4'].map((key) => (
            <img
              key={key}
              src={marshClumpArt} alt="" className="mg2-marsh-clump"
              style={{
                left: `${layout[key].l}%`, top: `${layout[key].t}%`,
                '--layout-scale': (layout[key].s || 100) / 100,
                outline: debugMode && selectedLayoutKey === key ? '2px dashed #03A9F4' : undefined,
                pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined,
              }}
              onPointerDown={debugMode ? (e) => startLayoutDrag(e, key) : undefined}
            />
          ))}

          {debugMode && ['marshStop1', 'marshStop2', 'marshStop3', 'marshStop4'].map((key) => (
            <div
              key={`${key}-dropzone`}
              className="mg2-debug-dropzone"
              style={{ left: `${layout[key].l}%`, top: `${layout[key].t}%` }}
              title={`${LAYOUT_LABELS[key]} — drop zone (matches the game's actual snap radius)`}
            />
          ))}

          {flowerCount < 5 && (
            <img
              ref={marshFlowerOneRef} src={flowerPink} alt="" className="mg2-marsh-flower"
              style={{
                left: `${layout.marshFlower1.l}%`, top: `${layout.marshFlower1.t}%`,
                '--layout-scale': (layout.marshFlower1.s || 100) / 100,
                outline: debugMode && selectedLayoutKey === 'marshFlower1' ? '2px dashed #03A9F4' : undefined,
                pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined,
              }}
              onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'marshFlower1') : undefined}
            />
          )}
          {flowerCount < 6 && (
            <img
              ref={marshFlowerTwoRef} src={flowerCream} alt="" className="mg2-marsh-flower"
              style={{
                left: `${layout.marshFlower2.l}%`, top: `${layout.marshFlower2.t}%`,
                '--layout-scale': (layout.marshFlower2.s || 100) / 100,
                outline: debugMode && selectedLayoutKey === 'marshFlower2' ? '2px dashed #03A9F4' : undefined,
                pointerEvents: debugMode ? 'auto' : 'none', cursor: debugMode ? 'grab' : undefined,
              }}
              onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'marshFlower2') : undefined}
            />
          )}

          {isMarshPhase && (() => {
            const safePosition = getCurrentMarshPosition();
            const position = marshExiting ? { x: layout.marshExit.l, y: layout.marshExit.t } : marshDrag.active ? marshDrag : safePosition;
            return (
              <button
                type="button"
                className={`mg2-marsh-mooshika ${marshExiting ? 'mg2-marsh-mooshika--exiting' : ''} ${marshWobble ? 'mg2-marsh-mooshika--wobble' : ''} ${marshSlip ? 'mg2-marsh-mooshika--slip' : ''} ${idleHintLevel >= 1 ? 'hint' : ''}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onPointerDown={debugMode ? undefined : handleMarshPointerDown}
                onPointerMove={debugMode ? undefined : handleMarshPointerMove}
                onPointerUp={debugMode ? undefined : handleMarshPointerEnd}
                onPointerCancel={debugMode ? undefined : handleMarshPointerCancel}
              >
                <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} pose="turned" />
                {(debugMode || emotion === 'worried') && (
                  <img src={emotionWorried} alt="Worried" {...emojiProps('emojiMarsh')} className="mg2-emotion mg2-emotion--anchored" />
                )}
              </button>
            );
          })()}

          {debugMode && ['marshStart', 'marshExit'].map((key) => (
            <div
              key={key}
              className={`mg2-debug-waypoint ${selectedLayoutKey === key ? 'is-selected' : ''}`}
              style={{ left: `${layout[key].l}%`, top: `${layout[key].t}%` }}
              onPointerDown={(e) => startLayoutDrag(e, key)}
              title={LAYOUT_LABELS[key]}
            />
          ))}

          {isMarshPhase && (() => {
            const from = getCurrentMarshPosition();
            const to = marshStopsLive[marshStep] || from;
            return (
              <GestureDemo
                type="drag"
                from={{ x: from.x, y: from.y }}
                to={{ x: to.x, y: to.y }}
                active={(introGesture || showIdleGestureHint) && !marshDrag.active}
                idleDelay={120}
                zIndex={30}
              />
            );
          })()}
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
            '--layout-scale': (layout[mooshikaPhaseKey].s || 100) / 100,
            outline: debugMode && selectedLayoutKey === mooshikaPhaseKey ? '2px dashed #03A9F4' : undefined,
            outlineOffset: 3, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : undefined,
          }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, mooshikaPhaseKey) : undefined}
        >
          <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} pose="turned" />
          {isBushPhase && (debugMode || emotion === 'angry') && (
            <img src={emotionAngry} alt="Frustrated" {...emojiProps('emojiBush')} className="mg2-emotion mg2-emotion--anchored" />
          )}
          {isBranchPhase && (debugMode || emotion === 'sad') && (
            <img src={emotionSad} alt="Disappointed" {...emojiProps('emojiBranch')} className="mg2-emotion mg2-emotion--anchored" />
          )}
        </div>
      )}

      {/* ---------------- GESTURE DEMOS (Bush + Branch) — stage-relative,
          same show-what-to-do pattern as NewModakSceneV7.jsx. ---------------- */}
      <GestureDemo
        type="swipe-left"
        from={{ x: layout.bush.l, y: layout.bush.t }}
        active={(introGesture || showIdleGestureHint) && isBushPhase && !bushOpenState}
        idleDelay={120}
        zIndex={30}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: layout.branch.l, y: layout.branch.t }}
        to={{ x: layout.branch.l, y: layout.branch.t + 15 }}
        active={(introGesture || showIdleGestureHint) && isBranchPhase && branchIntroFailed && !branchComplete}
        idleDelay={120}
        zIndex={30}
      />

      {/* ---------------- BELLY RECOGNITION ---------------- */}
      {phase === PHASES.BELLY_RECOGNITION && (
        <div className="mg2-belly">
          <div className="mg2-belly-ganesha" style={{ left: `${layout.ganesha.l}%`, top: `${layout.ganesha.t}%`, transform: `translate(-50%, -50%) scale(${layout.ganesha.s / 100})`, cursor: debugMode ? 'grab' : undefined }} onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'ganesha') : undefined}>
            <img src={ganeshaArt} alt="Ganesha" />
            {bellyBeat >= 4 && <div className={`mg2-belly-glow ${bellyBeat >= 5 ? 'mg2-belly-glow--strong' : ''}`} aria-hidden="true" />}
          </div>

          <div
            className="mg2-belly-mooshika"
            style={{
              left: `${layout.mooshikaBelly.l}%`, top: `${layout.mooshikaBelly.t}%`,
              '--layout-scale': (layout.mooshikaBelly.s || 100) / 100,
              outline: debugMode && selectedLayoutKey === 'mooshikaBelly' ? '2px dashed #03A9F4' : undefined,
              outlineOffset: 3, cursor: debugMode ? 'grab' : undefined,
            }}
            onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'mooshikaBelly') : undefined}
          >
            <MooshikaWithBasket flowerCount={6} basketRef={basketTargetRef} pose="turned" />
            {(debugMode || (bellyBeat >= 1 && bellyBeat < 6)) && <img src={emotionAngry} alt="Frustrated" {...emojiProps('emojiAngry')} className="mg2-belly-emotion mg2-belly-emotion--angry" />}
            {(debugMode || (bellyBeat >= 2 && bellyBeat < 6)) && <img src={emotionSad} alt="Disappointed" {...emojiProps('emojiSad')} className="mg2-belly-emotion mg2-belly-emotion--sad" />}
            {(debugMode || (bellyBeat >= 3 && bellyBeat < 6)) && <img src={emotionWorried} alt="Worried" {...emojiProps('emojiWorried')} className="mg2-belly-emotion mg2-belly-emotion--worried" />}
          </div>

          {bellyBeat >= 5 && (
            <div className="mg2-belly-symbol">
              <img src={bellySymbol} alt="" />
              <span>Lambodara</span>
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

          <label className="mg2-debug-row">Item
            <select value={selectedLayoutKey || ''} onChange={(e) => setSelectedLayoutKey(e.target.value)}>
              <option value="">Select item…</option>
              {Object.entries(LAYOUT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          {selectedLayoutKey ? (
            <>
              <div className="mg2-debug-panel-row">{LAYOUT_LABELS[selectedLayoutKey]}</div>
              <label>X <input type="number" step="0.5" value={layout[selectedLayoutKey].l} onChange={(e) => updateLayoutKey(selectedLayoutKey, { l: Number(e.target.value) })} /></label>
              <label>Y <input type="number" step="0.5" value={layout[selectedLayoutKey].t} onChange={(e) => updateLayoutKey(selectedLayoutKey, { t: Number(e.target.value) })} /></label>
              {layout[selectedLayoutKey].s !== undefined && (
                <label>Scale % <input type="number" step="5" min="10" value={layout[selectedLayoutKey].s} onChange={(e) => updateLayoutKey(selectedLayoutKey, { s: Number(e.target.value) })} /></label>
              )}
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

function MooshikaWithBasket({ flowerCount = 0, basketRef, standalone, pose = 'calm' }) {
  return (
    <div className={`mg2-basket-character ${standalone ? 'mg2-basket-character--standalone' : ''}`}>
      <img src={pose === 'turned' ? mooshikaTurned : mooshikaCalm} alt="Mooshika" className="mg2-basket-character__mouse" />
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
