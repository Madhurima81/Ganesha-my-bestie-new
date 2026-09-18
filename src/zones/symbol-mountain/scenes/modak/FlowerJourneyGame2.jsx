import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
// FlowerJourneyGame2 — Bush (swipe) -> Branch (pull+hold) -> Marsh (guide
// across stepping stones) -> Belly-feeling storytelling beat, then hands off
// to the live scene's existing SymbolAutoReveal for the real "belly" symbol
// card via the onComplete callback (this component owns NO card-flip UI).
//
// Ported from the approved dev preview at
// src/dev/modakGame2Preview/ModakGame2Preview.jsx (see SESSION_NOTES.md for
// the tuned layout/pacing this is based on). Debug/layout-tuning UI has been
// stripped for production; the locked LAYOUT_DEFAULTS from that session are
// baked in as constants below. No "Lambodara" name anywhere — the belly
// symbol keeps whatever name the live scene's SymbolAutoReveal already uses.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './FlowerJourneyGame2.css';

import forestBackground from './assets/images/modak-fj-bg.webp';
import mooshikaTurned from './assets/images/mooshika-turned-game2.webp';
import bushClosed from './assets/images/fj-bush-closed-new.webp';
import bushOpen from './assets/images/fj-bush-open-new.webp';
import branchArt from './assets/images/fj-branch-new.webp';
import treeArt from './assets/images/fj-tree-new.webp';
import marshArt from './assets/images/fj-mud-plain.webp';
import marshClumpArt from './assets/images/fj-marsh-clump.webp';
import flowerPink from './assets/images/fj-flower-coral.webp';
import flowerCream from './assets/images/fj-flower-cream.webp';
import emotionAngry from './assets/images/emotion-angry-game3.webp';
import emotionSad from './assets/images/emotion-sad-game3.webp';
import emotionWorried from './assets/images/emotion-worried-game3.webp';
import ganeshaArt from './assets/images/ganesha-game3-new.webp';

const PHASES = {
  FLOWER_BUSH: 'flower_bush',
  FLOWER_BRANCH: 'flower_branch',
  FLOWER_MARSH: 'flower_marsh',
  BELLY_RECOGNITION: 'belly_recognition',
};
const WORKING_PHASES = [PHASES.FLOWER_BUSH, PHASES.FLOWER_BRANCH, PHASES.FLOWER_MARSH];

// Locked tuning from the dev-preview session (SESSION_NOTES.md "current tuned
// layout") — percent-of-stage positions for every element.
const LAYOUT = {
  marshExit: { l: 86.3, t: 4.1 },
  ganesha: { l: 55.9, t: 30.4, s: 100 },
  emojiBush: { l: 80, t: -38, s: 100 },
  emojiBranch: { l: 80, t: -38, s: 100 },
  emojiMarsh: { l: 80, t: -38, s: 100 },
  emojiAngry: { l: -1.9, t: -30.8, s: 100 },
  emojiSad: { l: 86.9, t: 59.2, s: 100 },
  emojiWorried: { l: 90.2, t: -18.7, s: 100 },
  bush: { l: 26.9, t: 74.3, s: 100 },
  tree: { l: 76, t: 47.9, s: 120 },
  branch: { l: 67.6, t: 44.8, s: 100 },
  marsh: { l: 58.3, t: 63.4, s: 200 },
  mooshikaBush: { l: 26, t: 75, s: 100 },
  mooshikaBranch: { l: 66.3, t: 72.8, s: 100 },
  mooshikaBelly: { l: 67.6, t: 40.4, s: 100 },
  branchFlower1: { l: 49.1, t: 34.4, s: 100 },
  branchFlower2: { l: 20.3, t: 48.1, s: 100 },
  marshFlower1: { l: 58, t: 49.9, s: 100 },
  marshFlower2: { l: 88, t: 43.7, s: 100 },
};
const MARSH_START = { x: 2, y: 80 };
const MARSH_STOPS = [
  { x: 19.8, y: 47.2 },
  { x: 41.8, y: 39.2 },
  { x: 56, y: 57 },
  { x: 84.9, y: 55.4 },
];

const IDLE_HINT_L1_MS = 10000;
const IDLE_HINT_L2_MS = 18000;
const IDLE_HINT_L3_MS = 26000;

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
  bellyMeaning: "Ganesha's big belly reminds us — there's room for every feeling.",
  bellyAffirmation: 'I can make room for my feelings and keep going.',
};

const SCENE_IMAGES = [
  forestBackground,
  mooshikaTurned,
  bushClosed,
  bushOpen,
  branchArt,
  treeArt,
  marshArt,
  marshClumpArt,
  flowerPink,
  flowerCream,
  emotionAngry,
  emotionSad,
  emotionWorried,
  ganeshaArt,
];

export default function FlowerJourneyGame2({
  isActive = true,
  isPaused = false,
  isAudioOn = true,
  onFlowersUpdate,
  onComplete,
}) {
  usePreloadPoses(SCENE_IMAGES);
  const [phase, setPhase] = useState(PHASES.FLOWER_BUSH);
  const [flowerCount, setFlowerCount] = useState(0);
  const [emotion, setEmotion] = useState(null);

  const mutedRef = useRef(!isAudioOn);
  useEffect(() => { mutedRef.current = !isAudioOn; }, [isAudioOn]);

  const speak = useCallback((text) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch { /* no-op */ }
  }, []);

  const speakAsync = useCallback((text) => new Promise((resolve) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) {
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
  }), []);
  const wait = useCallback((ms) => new Promise((resolve) => window.setTimeout(resolve, ms)), []);

  const safeTimeout = useCallback((fn, ms) => window.setTimeout(fn, ms), []);

  // ---- idle-hint ladder ----
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

  useEffect(() => {
    if (!isActive || isPaused || !WORKING_PHASES.includes(phase)) { setIntroGesture(false); return undefined; }
    setIntroGesture(true);
    lastIdleInteractionAtRef.current = Date.now();
    const t = window.setTimeout(() => setIntroGesture(false), 6000);
    return () => window.clearTimeout(t);
  }, [phase, isActive, isPaused]);

  useEffect(() => {
    if (!isActive || isPaused || !WORKING_PHASES.includes(phase)) { setIdleHintLevel(0); setShowIdleGestureHint(false); return undefined; }
    const tick = window.setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel((prev) => (prev === nextLevel ? prev : nextLevel));
    }, 250);
    return () => window.clearInterval(tick);
  }, [phase, isActive, isPaused]);

  useEffect(() => {
    setShowIdleGestureHint(WORKING_PHASES.includes(phase) && idleHintLevel >= 3);
  }, [idleHintLevel, phase]);

  useEffect(() => {
    if (idleHintLevel < 2 || idleVoPlayedRef.current[phase]) return;
    idleVoPlayedRef.current[phase] = true;
    const line = phase === PHASES.FLOWER_BUSH ? VO.bushStart
      : phase === PHASES.FLOWER_BRANCH ? VO.branchGesture
      : phase === PHASES.FLOWER_MARSH ? VO.marshStart
      : null;
    if (line) speak(line);
  }, [idleHintLevel, phase, speak]);

  // ---- BUSH ----
  const [bushAttempted, setBushAttempted] = useState(false);
  const [bushOpenState, setBushOpenState] = useState(false);
  const [bushSpringing, setBushSpringing] = useState(false);
  const bushSwipeStartRef = useRef(null);

  // ---- BRANCH ----
  const [branchIntroFailed, setBranchIntroFailed] = useState(false);
  const [branchComplete, setBranchComplete] = useState(false);
  const [branchPull, setBranchPull] = useState(0);
  const [branchHolding, setBranchHolding] = useState(false);
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

  // ---- belly beats ----
  const [bellyBeat, setBellyBeat] = useState(0);

  // Notify the parent scene of the flower count without re-firing this
  // effect just because the parent re-rendered and handed us a new
  // `onFlowersUpdate` function identity (e.g. because its own callback is
  // rebuilt whenever `sceneActions` changes) - that pattern caused a real
  // infinite-render loop (parent update -> new prop identity -> effect
  // reruns -> parent update -> ...), starving this component's own timers.
  // Only `flowerCount` actually changing should trigger a notification.
  const onFlowersUpdateRef = useRef(onFlowersUpdate);
  useEffect(() => { onFlowersUpdateRef.current = onFlowersUpdate; }, [onFlowersUpdate]);
  useEffect(() => { onFlowersUpdateRef.current?.(flowerCount); }, [flowerCount]);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BUSH || bushAttempted || !isActive) return undefined;
    let cancelled = false;
    (async () => {
      await speakAsync(VO.open);
      if (cancelled) return;
      await wait(400);
      if (cancelled) return;
      await speakAsync(VO.bushStart);
    })();
    return () => { cancelled = true; };
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

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
    window.setTimeout(() => setFlowerCount(newFlowerCount), 760);
  }, [flyFlowerToBasket]);

  const bushFlowerOneRef = useRef(null);
  const bushFlowerTwoRef = useRef(null);

  const handleBushPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BUSH || isPaused) return;
    e.preventDefault();
    noteInteraction();
    bushSwipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, [phase, isPaused, noteInteraction]);

  const handleBushPointerUp = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BUSH || isPaused) return;
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
      safeTimeout(() => setPhase(PHASES.FLOWER_BRANCH), 2200);
    }, 700);
  }, [phase, isPaused, bushAttempted, collectChallengeFlowers, safeTimeout, speak]);

  const branchFlowerOneRef = useRef(null);
  const branchFlowerTwoRef = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BRANCH || branchIntroFailed || !isActive) return undefined;
    let cancelled = false;
    (async () => {
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
  }, [phase, branchIntroFailed, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearBranchHold = useCallback(() => {
    if (branchHoldTimerRef.current) { clearTimeout(branchHoldTimerRef.current); branchHoldTimerRef.current = null; }
    setBranchHolding(false);
  }, []);

  const finishBranchChallenge = useCallback(() => {
    clearBranchHold();
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
      safeTimeout(() => setPhase(PHASES.FLOWER_MARSH), 2200);
    }, 700);
  }, [clearBranchHold, collectChallengeFlowers, safeTimeout, speak]);

  const handleBranchPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BRANCH || branchComplete || isPaused) return;
    e.preventDefault();
    noteInteraction();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    branchDragRef.current = { active: true, startY: e.clientY };
    clearBranchHold();
  }, [phase, branchComplete, isPaused, clearBranchHold, noteInteraction]);

  const handleBranchPointerMove = useCallback((e) => {
    if (!branchDragRef.current.active) return;
    const dy = e.clientY - branchDragRef.current.startY;
    const progress = Math.max(0, Math.min(1, dy / 120));
    setBranchPull(progress);
    // Once the hold has started, give some slack (0.55) so a small finger
    // wobble doesn't silently cancel the timer — only crossing back below
    // that lower bar counts as letting go. Starting the hold still needs
    // the full pull (0.72) so it can't be triggered by accident.
    if (branchHoldTimerRef.current) {
      if (progress < 0.55) clearBranchHold();
    } else if (progress >= 0.72) {
      branchHoldTimerRef.current = setTimeout(finishBranchChallenge, 900);
      setBranchHolding(true);
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
  }, [branchComplete, branchPull, clearBranchHold, speak]);

  const marshStopsLive = MARSH_STOPS;
  const marshStartLive = MARSH_START;
  const getCurrentMarshPosition = useCallback(
    () => (marshStep === 0 ? marshStartLive : (marshStopsLive[marshStep - 1] || marshStartLive)),
    [marshStep]
  );

  useEffect(() => {
    if (phase === PHASES.FLOWER_MARSH && marshStep === 0 && isActive) speak(VO.marshStart);
  }, [phase, marshStep, isActive, speak]);

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
    if (phase !== PHASES.FLOWER_MARSH || marshStep >= 4 || marshPointerRef.current || isPaused) return;
    e.preventDefault();
    const point = marshPointFromEvent(e);
    if (!point) return;
    noteInteraction();
    const current = getCurrentMarshPosition();
    marshPointerRef.current = { id: e.pointerId, offsetX: current.x - point.x, offsetY: current.y - point.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setMarshDrag({ active: true, x: current.x, y: current.y });
  }, [phase, marshStep, isPaused, getCurrentMarshPosition, noteInteraction]);

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
    window.setTimeout(() => setFlowerCount(newFlowerCount), 600);
  }, [flyFlowerToBasket]);

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
          setPhase(PHASES.BELLY_RECOGNITION);
        }, 100);
      }
      return;
    }

    setMarshSlip(true);
    setEmotion('worried');
    if (!marshWrongWarnedRef.current) {
      marshWrongWarnedRef.current = true;
      speak(VO.marshWrong);
    }
    const safePosition = getCurrentMarshPosition();
    setMarshDrag({ active: false, x: safePosition.x, y: safePosition.y });
    safeTimeout(() => setMarshSlip(false), 500);
  }, [marshStep, marshStopsLive, flyOneFlowerToBasket, getCurrentMarshPosition, safeTimeout, speak, speakAsync, wait]);

  // ---- BELLY beats -> hand off to live SymbolAutoReveal via onComplete ----
  useEffect(() => {
    if (phase !== PHASES.BELLY_RECOGNITION || !isActive) { setBellyBeat(0); return undefined; }
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
      await speakAsync(VO.bellyMeaning);

      await wait(350);
      if (cancelled) return;
      await speakAsync(VO.bellyAffirmation);

      await wait(500);
      if (cancelled) return;
      onComplete?.();
    })();
    return () => { cancelled = true; };
  }, [phase, isActive, onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isActive) return null;

  const isBushPhase = phase === PHASES.FLOWER_BUSH;
  const isBranchPhase = phase === PHASES.FLOWER_BRANCH;
  const isMarshPhase = phase === PHASES.FLOWER_MARSH;
  const isBellyPhase = phase === PHASES.BELLY_RECOGNITION;

  const showBush = true;
  const showTree = isBranchPhase || isMarshPhase || isBellyPhase;
  const showMarsh = isMarshPhase || isBellyPhase;
  const bushSceneryComplete = showBush && !isBushPhase;
  const treeSceneryComplete = showTree && !isBranchPhase;
  const marshSceneryComplete = showMarsh && !isMarshPhase;

  const mooshikaPhaseKey = isBushPhase ? 'mooshikaBush' : isBranchPhase ? 'mooshikaBranch' : null;
  const showSharedMooshika = !!mooshikaPhaseKey;

  return (
    <div className={`fjg2 ${isPaused ? 'fjg2--paused' : ''}`} style={{ backgroundImage: `url(${forestBackground})` }}>
      {!isBellyPhase && (
        <div className="fjg2-hud" aria-label={`${flowerCount} of 6 flowers gathered`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`fjg2-hud-dot ${i < flowerCount ? 'filled' : ''}`} />
          ))}
        </div>
      )}

      {/* ---------------- BUSH ---------------- */}
      {showBush && (
        <div
          className={`fjg2-bush-area ${isBushPhase ? 'is-active' : ''} ${bushSceneryComplete ? 'is-complete' : ''}`}
          style={{ left: `${LAYOUT.bush.l}%`, top: `${LAYOUT.bush.t}%`, '--layout-scale': (LAYOUT.bush.s || 100) / 100 }}
        >
          <button
            type="button"
            className={`fjg2-bush ${bushSpringing ? 'fjg2-bush--springing' : ''} ${bushOpenState ? 'fjg2-bush--open' : ''} ${isBushPhase && idleHintLevel >= 1 ? 'hint' : ''}`}
            onPointerDown={isBushPhase ? handleBushPointerDown : undefined}
            onPointerUp={isBushPhase ? handleBushPointerUp : undefined}
            onPointerCancel={() => { bushSwipeStartRef.current = null; }}
            disabled={!isBushPhase}
            aria-label="Swipe the leaves apart"
          >
            <PoseImage src={bushOpenState ? bushOpen : bushClosed} alt="" />
          </button>

          {bushOpenState && flowerCount < 2 && (
            <div className="fjg2-bush-flowers">
              <img ref={bushFlowerOneRef} src={flowerPink} alt="" />
              <img ref={bushFlowerTwoRef} src={flowerCream} alt="" />
            </div>
          )}
        </div>
      )}

      {/* ---------------- BRANCH / TREE ---------------- */}
      {showTree && (
        <div className={`fjg2-tree-area ${isBranchPhase ? 'is-active' : ''} ${treeSceneryComplete ? 'is-complete' : ''}`}>
          <img
            src={treeArt} alt="" className="fjg2-tree"
            style={{ left: `${LAYOUT.tree.l}%`, top: `${LAYOUT.tree.t}%`, '--layout-scale': (LAYOUT.tree.s || 100) / 100 }}
          />
          <button
            ref={branchRef}
            type="button"
            className={`fjg2-branch ${isBranchPhase && branchIntroFailed && !branchComplete && idleHintLevel >= 1 ? 'hint' : ''}`}
            style={{ '--pull': branchComplete ? 1 : branchPull, '--layout-scale': (LAYOUT.branch.s || 100) / 100, left: `${LAYOUT.branch.l}%`, top: `${LAYOUT.branch.t}%` }}
            onPointerDown={isBranchPhase ? handleBranchPointerDown : undefined}
            onPointerMove={isBranchPhase ? handleBranchPointerMove : undefined}
            onPointerUp={isBranchPhase ? handleBranchPointerEnd : undefined}
            onPointerCancel={isBranchPhase ? handleBranchPointerEnd : undefined}
            onContextMenu={(e) => e.preventDefault()}
            disabled={!isBranchPhase}
            aria-label="Pull the branch down and hold"
          >
            <img src={branchArt} alt="" />
            {branchHolding && !branchComplete && (
              <span className="fjg2-branch-hold-ring" aria-hidden="true" />
            )}
            {!branchComplete && flowerCount < 4 && (
              <>
                <img
                  ref={branchFlowerOneRef} src={flowerPink} alt="" className="fjg2-branch-flower"
                  style={{ left: `${LAYOUT.branchFlower1.l}%`, top: `${LAYOUT.branchFlower1.t}%`, '--layout-scale': (LAYOUT.branchFlower1.s || 100) / 100 }}
                />
                <img
                  ref={branchFlowerTwoRef} src={flowerCream} alt="" className="fjg2-branch-flower"
                  style={{ left: `${LAYOUT.branchFlower2.l}%`, top: `${LAYOUT.branchFlower2.t}%`, '--layout-scale': (LAYOUT.branchFlower2.s || 100) / 100 }}
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
          className={`fjg2-marsh-area ${isMarshPhase ? 'is-active' : ''} ${marshSceneryComplete ? 'is-complete' : ''}`}
          style={{ left: `${LAYOUT.marsh.l}%`, top: `${LAYOUT.marsh.t}%`, '--layout-scale': (LAYOUT.marsh.s || 100) / 100 }}
        >
          <img src={marshArt} alt="" className="fjg2-marsh" />

          {MARSH_STOPS.map((stop, i) => (
            <img
              key={i}
              src={marshClumpArt} alt="" className="fjg2-marsh-clump"
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            />
          ))}

          {flowerCount < 5 && (
            <img
              ref={marshFlowerOneRef} src={flowerPink} alt="" className="fjg2-marsh-flower"
              style={{ left: `${LAYOUT.marshFlower1.l}%`, top: `${LAYOUT.marshFlower1.t}%` }}
            />
          )}
          {flowerCount < 6 && (
            <img
              ref={marshFlowerTwoRef} src={flowerCream} alt="" className="fjg2-marsh-flower"
              style={{ left: `${LAYOUT.marshFlower2.l}%`, top: `${LAYOUT.marshFlower2.t}%` }}
            />
          )}

          {isMarshPhase && (() => {
            const safePosition = getCurrentMarshPosition();
            const position = marshExiting ? { x: LAYOUT.marshExit.l, y: LAYOUT.marshExit.t } : marshDrag.active ? marshDrag : safePosition;
            return (
              <button
                type="button"
                className={`fjg2-marsh-mooshika ${marshExiting ? 'fjg2-marsh-mooshika--exiting' : ''} ${marshWobble ? 'fjg2-marsh-mooshika--wobble' : ''} ${marshSlip ? 'fjg2-marsh-mooshika--slip' : ''} ${idleHintLevel >= 1 ? 'hint' : ''}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onPointerDown={handleMarshPointerDown}
                onPointerMove={handleMarshPointerMove}
                onPointerUp={handleMarshPointerEnd}
                onPointerCancel={handleMarshPointerCancel}
                aria-label="Guide Mooshika across the stepping stones"
              >
                <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
                {emotion === 'worried' && (
                  <img src={emotionWorried} alt="Worried" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiMarsh.l}%`, top: `${LAYOUT.emojiMarsh.t}%` }} />
                )}
              </button>
            );
          })()}

          {isMarshPhase && (() => {
            const from = getCurrentMarshPosition();
            const to = marshStopsLive[marshStep] || from;
            return (
              <GestureDemo
                type="drag"
                from={{ x: from.x, y: from.y }}
                to={{ x: to.x, y: to.y }}
                active={!isPaused && (introGesture || showIdleGestureHint) && !marshDrag.active}
                idleDelay={120}
                zIndex={30}
              />
            );
          })()}
        </div>
      )}

      {/* ---------------- Shared Mooshika (Bush + Branch) ---------------- */}
      {showSharedMooshika && (
        <div
          className={`fjg2-mooshika-shared ${branchIntroFailed && isBranchPhase ? 'fjg2-mooshika-shared--failed' : ''}`}
          style={{ left: `${LAYOUT[mooshikaPhaseKey].l}%`, top: `${LAYOUT[mooshikaPhaseKey].t}%`, '--layout-scale': (LAYOUT[mooshikaPhaseKey].s || 100) / 100 }}
        >
          <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
          {isBushPhase && emotion === 'angry' && (
            <img src={emotionAngry} alt="Frustrated" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBush.l}%`, top: `${LAYOUT.emojiBush.t}%` }} />
          )}
          {isBranchPhase && emotion === 'sad' && (
            <img src={emotionSad} alt="Disappointed" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBranch.l}%`, top: `${LAYOUT.emojiBranch.t}%` }} />
          )}
        </div>
      )}

      {/* ---------------- GESTURE DEMOS (Bush + Branch) ---------------- */}
      <GestureDemo
        type="swipe-left"
        from={{ x: LAYOUT.bush.l, y: LAYOUT.bush.t }}
        active={!isPaused && (introGesture || showIdleGestureHint) && isBushPhase && !bushOpenState}
        idleDelay={120}
        zIndex={30}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: LAYOUT.branch.l, y: LAYOUT.branch.t }}
        to={{ x: LAYOUT.branch.l, y: LAYOUT.branch.t + 15 }}
        active={!isPaused && (introGesture || showIdleGestureHint) && isBranchPhase && branchIntroFailed && !branchComplete}
        idleDelay={120}
        zIndex={30}
      />
      {/* Shows the "...and hold" half of the gesture at the pulled-down spot,
          since pull-down's own pause is too brief to read as a hold. */}
      <GestureDemo
        type="hold"
        from={{ x: LAYOUT.branch.l, y: LAYOUT.branch.t + 15 }}
        active={!isPaused && (introGesture || showIdleGestureHint) && isBranchPhase && branchIntroFailed && !branchComplete}
        idleDelay={900}
        zIndex={30}
      />

      {/* ---------------- BELLY-FEELING STORYTELLING BEAT ---------------- */}
      {isBellyPhase && (
        <div className="fjg2-belly">
          <div className="fjg2-belly-ganesha" style={{ left: `${LAYOUT.ganesha.l}%`, top: `${LAYOUT.ganesha.t}%`, transform: `translate(-50%, -50%) scale(${LAYOUT.ganesha.s / 100})` }}>
            <img src={ganeshaArt} alt="Ganesha" />
            {bellyBeat >= 4 && <div className={`fjg2-belly-glow ${bellyBeat >= 5 ? 'fjg2-belly-glow--strong' : ''}`} aria-hidden="true" />}
          </div>

          <div
            className="fjg2-belly-mooshika"
            style={{ left: `${LAYOUT.mooshikaBelly.l}%`, top: `${LAYOUT.mooshikaBelly.t}%`, '--layout-scale': (LAYOUT.mooshikaBelly.s || 100) / 100 }}
          >
            <MooshikaWithBasket flowerCount={6} basketRef={basketTargetRef} />
            {bellyBeat >= 1 && bellyBeat < 6 && (
              <img
                src={emotionAngry} alt="Frustrated" className="fjg2-belly-emotion fjg2-belly-emotion--angry"
                style={{ left: `${LAYOUT.emojiAngry.l}%`, top: `${LAYOUT.emojiAngry.t}%`, right: 'auto', transform: `scale(${LAYOUT.emojiAngry.s / 100})` }}
              />
            )}
            {bellyBeat >= 2 && bellyBeat < 6 && (
              <img
                src={emotionSad} alt="Disappointed" className="fjg2-belly-emotion fjg2-belly-emotion--sad"
                style={{ left: `${LAYOUT.emojiSad.l}%`, top: `${LAYOUT.emojiSad.t}%`, transform: `scale(${LAYOUT.emojiSad.s / 100})` }}
              />
            )}
            {bellyBeat >= 3 && bellyBeat < 6 && (
              <img
                src={emotionWorried} alt="Worried" className="fjg2-belly-emotion fjg2-belly-emotion--worried"
                style={{ left: `${LAYOUT.emojiWorried.l}%`, top: `${LAYOUT.emojiWorried.t}%`, right: 'auto', transform: `scale(${LAYOUT.emojiWorried.s / 100})` }}
              />
            )}
          </div>
        </div>
      )}

      {/* ---------------- flying flowers ---------------- */}
      <div className="fjg2-flight-layer">
        {flyingFlowers.map((f) => (
          <img
            key={f.id}
            src={f.src}
            alt=""
            className="fjg2-flying-flower"
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
    </div>
  );
}

function MooshikaWithBasket({ flowerCount = 0, basketRef }) {
  return (
    <div className="fjg2-basket-character">
      <img src={mooshikaTurned} alt="Mooshika" className="fjg2-basket-character__mouse" />
      <div ref={basketRef} className={`fjg2-basket-flowers fjg2-basket-flowers--${flowerCount}`} aria-hidden="true">
        {flowerCount >= 2 && (
          <>
            <img src={flowerPink} className="fjg2-basket-flower fjg2-basket-flower--1" alt="" />
            <img src={flowerCream} className="fjg2-basket-flower fjg2-basket-flower--2" alt="" />
          </>
        )}
        {flowerCount >= 4 && <img src={flowerPink} className="fjg2-basket-flower fjg2-basket-flower--3" alt="" />}
        {flowerCount >= 6 && (
          <>
            <img src={flowerCream} className="fjg2-basket-flower fjg2-basket-flower--4" alt="" />
            <img src={flowerPink} className="fjg2-basket-flower fjg2-basket-flower--5" alt="" />
          </>
        )}
      </div>
    </div>
  );
}
