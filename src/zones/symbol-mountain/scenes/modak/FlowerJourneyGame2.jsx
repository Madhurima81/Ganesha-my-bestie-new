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
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
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
import emotionPleased from './assets/images/emotion-pleased-game3.webp';
import emotionExcited from './assets/images/emotion-excited-game3.webp';
import emotionRelieved from './assets/images/emotion-relieved-game3.webp';
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
  bushStart: 'Two flowers are hiding in the leaves. Swipe them apart.',
  bushSuccess: 'There they are! Two flowers.',
  // Timed hints
  bushIdle: 'Swipe the branches apart.',
  bushDirect: 'Swipe all the way to open the branches.',

  branchStart: 'Two flowers are too high for Mooshika. Pull the branch down.',
  branchGesture: 'Pull the branch down and hold it.',
  branchDirect: 'Pull the branch down and keep holding.',
  branchSuccess: 'Got them! Two more flowers.',
  // Per-error-type tiered feedback (1st = corrective VO, 2nd = physical
  // only, 3rd = gesture demo + VO again) — see registerBushMistake /
  // registerBranchMistake below.
  branchWrongDir1: 'Pull it downward.',
  branchWrongDir3: 'Pull downward.',
  branchEarly1: 'Keep pulling down.',
  branchEarly3: 'Keep pulling down.',

  bushWrongDir1: 'Try swiping sideways.',
  bushWrongDir3: 'Swipe sideways.',
  bushTooShort1: 'Swipe a little farther.',
  bushTooShort3: 'Swipe farther.',

  marshStart: 'The last two flowers are across the mud. Guide Mooshika from safe spot to safe spot.',
  marshIdle: 'Guide Mooshika to the next safe spot.',
  marshDirect: 'Drag Mooshika to the glowing safe spot.',
  marshWobble: 'Ooh… that’s wobbly.',
  marshWrong: 'Back to the safe spot. Try again.',
  marshDone: 'You made it! All six flowers.',

  bellyReflection: 'Mooshika felt upset, sad, nervous, pleased, happy, and excited.',
  bellyHeld: 'His big belly held all those feelings.',
  bellyAffirmation: 'I can have lots of feelings and keep going.',
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
  emotionPleased,
  emotionExcited,
  emotionRelieved,
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
  // Small persistent "emotion trace" left near each challenge once it's
  // solved — a quiet visual recap (bush→pleased, branch→excited,
  // marsh→relieved), not a collectible/badge. Stays visible through the
  // rest of the game so the belly-reflection VO ("lots of feelings came
  // and went") has something to point back to.
  const [emotionTraces, setEmotionTraces] = useState({ bush: null, branch: null, marsh: null });

  const mutedRef = useRef(!isAudioOn);
  useEffect(() => { mutedRef.current = !isAudioOn; }, [isAudioOn]);

  // Tab-hide safety for this game's direct speechSynthesis use (it bypasses the
  // scene's useVoiceGuidance hook). On hide: detach the active utterance's
  // handlers BEFORE cancel() so a story beat awaiting speakAsync doesn't resolve
  // and advance while nobody is watching; remember it. On return: re-speak the
  // interrupted line from the start after 2s, resolving the same promise so the
  // awaiting sequence continues naturally.
  const activeSpeechRef = useRef(null); // { text, resolve } — resolve is null for fire-and-forget
  const interruptedSpeechRef = useRef(null);
  const replayTimerRef = useRef(null);

  const startUtterance = useCallback((text, resolve) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    const entry = { text, resolve, utterance: u };
    const done = () => {
      if (activeSpeechRef.current === entry) activeSpeechRef.current = null;
      resolve?.();
    };
    u.onend = done;
    u.onerror = done;
    activeSpeechRef.current = entry;
    window.speechSynthesis.speak(u);
  }, []);

  const speak = useCallback((text) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
      startUtterance(text, null);
    } catch { /* no-op */ }
  }, [startUtterance]);

  const speakAsync = useCallback((text) => new Promise((resolve) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) {
        window.setTimeout(resolve, Math.max(700, text.length * 45));
        return;
      }
      startUtterance(text, resolve);
    } catch { resolve(); }
  }), [startUtterance]);

  useAppVisibility(
    useCallback(() => {
      if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; }
      const entry = activeSpeechRef.current;
      activeSpeechRef.current = null;
      if (entry) {
        entry.utterance.onend = null;
        entry.utterance.onerror = null;
        interruptedSpeechRef.current = { text: entry.text, resolve: entry.resolve };
      }
      try { window.speechSynthesis?.cancel(); } catch { /* no-op */ }
    }, []),
    useCallback(() => {
      const entry = interruptedSpeechRef.current;
      interruptedSpeechRef.current = null;
      if (!entry) return;
      replayTimerRef.current = setTimeout(() => {
        replayTimerRef.current = null;
        try {
          if (mutedRef.current || !window.speechSynthesis) { entry.resolve?.(); return; }
          startUtterance(entry.text, entry.resolve);
        } catch { entry.resolve?.(); }
      }, 2000);
    }, [startUtterance])
  );

  // Unmount: only drop the pending replay. Don't cancel() here — the parent scene
  // may already have started its next VO line in the same commit, and the scene's
  // own navigation teardown cancels speech globally anyway.
  useEffect(() => () => {
    if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    replayTimerRef.current = null;
    interruptedSpeechRef.current = null;
    if (teachingTimerRef.current) {
      clearTimeout(teachingTimerRef.current);
      teachingTimerRef.current = null;
    }
  }, []);
  const wait = useCallback((ms) => new Promise((resolve) => window.setTimeout(resolve, ms)), []);

  const safeTimeout = useCallback((fn, ms) => window.setTimeout(fn, ms), []);

  // ---------------------------------------------------------
  // HINT SYSTEM
  // VO finishes -> arm -> 10s / 18s / 26s.
  // Meaningful interaction resets the idle clock.
  // Repeated genuine failures can promote help early.
  // ---------------------------------------------------------
  const [teachingGesture, setTeachingGesture] = useState(false);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const [forcedHintLevel, setForcedHintLevel] = useState(0);

  const idleArmedAtRef = useRef(null);
  const teachingTimerRef = useRef(null);
  const spokenHintRef = useRef(new Set());
  const failureCountsRef = useRef({});
  // When the L2 hint line finished speaking — L3's 8s gap counts from THIS,
  // not from the original arm point. Without it, L3 was a fixed 26s-from-arm
  // regardless of how long the L2 line took to speak, so a slow L2 line could
  // leave only a few real seconds between "hearing L2 finish" and L3 firing.
  const l2VoiceEndedAtRef = useRef(null);

  const effectiveHintLevel = Math.max(idleHintLevel, forcedHintLevel);

  const armIdleHints = useCallback((showTeaching = true) => {
    idleArmedAtRef.current = Date.now();
    l2VoiceEndedAtRef.current = null;
    setIdleHintLevel(0);
    setForcedHintLevel(0);
    failureCountsRef.current[phase] = 0;

    if (teachingTimerRef.current) clearTimeout(teachingTimerRef.current);
    setTeachingGesture(showTeaching);
    if (showTeaching) {
      teachingTimerRef.current = window.setTimeout(() => {
        teachingTimerRef.current = null;
        setTeachingGesture(false);
      }, 3800);
    }
  }, [phase]);

  const resetIdleBaseline = useCallback((clearEscalation = false) => {
    if (!idleArmedAtRef.current) return;
    idleArmedAtRef.current = Date.now();
    l2VoiceEndedAtRef.current = null;
    setIdleHintLevel(0);
    setTeachingGesture(false);
    if (clearEscalation) {
      setForcedHintLevel(0);
      failureCountsRef.current[phase] = 0;
    }
  }, [phase]);

  // First mistake: normal feedback only. Second: promote to L2. Third: L3.
  const registerFailedAttempt = useCallback(() => {
    if (!WORKING_PHASES.includes(phase)) return;
    const next = (failureCountsRef.current[phase] || 0) + 1;
    failureCountsRef.current[phase] = next;
    if (next === 2) setForcedHintLevel((level) => Math.max(level, 2));
    if (next >= 3) setForcedHintLevel(3);
  }, [phase]);

  useEffect(() => {
    idleArmedAtRef.current = null;
    l2VoiceEndedAtRef.current = null;
    setIdleHintLevel(0);
    setForcedHintLevel(0);
    setTeachingGesture(false);
    failureCountsRef.current[phase] = 0;
    if (teachingTimerRef.current) {
      clearTimeout(teachingTimerRef.current);
      teachingTimerRef.current = null;
    }
  }, [phase]);

  useEffect(() => {
    if (!isActive || isPaused || !WORKING_PHASES.includes(phase)) return undefined;

    const tick = window.setInterval(() => {
      const startedAt = idleArmedAtRef.current;
      // Intro / VO not finished yet — clock isn't armed.
      if (!startedAt) return;

      const idleFor = Date.now() - startedAt;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;

      // L3 is an 8s gap AFTER the L2 line finishes speaking, not a fixed
      // 26s-from-arm mark — otherwise a slow L2 line eats into the gap the
      // child actually gets to try again before L3 fires.
      if (nextLevel === 2 && l2VoiceEndedAtRef.current) {
        const sinceL2Voice = Date.now() - l2VoiceEndedAtRef.current;
        if (sinceL2Voice >= (IDLE_HINT_L3_MS - IDLE_HINT_L2_MS)) nextLevel = 3;
      }

      setIdleHintLevel((current) => (current === nextLevel ? current : nextLevel));
    }, 250);

    return () => window.clearInterval(tick);
  }, [phase, isActive, isPaused]);

  // L2/L3 spoken once per (phase, level) pair. L2's line is awaited so L3's
  // 8s gap (above) can start counting from when the child actually hears it
  // finish, not from the fixed idle-arm timestamp.
  useEffect(() => {
    if (!WORKING_PHASES.includes(phase) || !idleArmedAtRef.current) return;

    let level = 0;
    if (effectiveHintLevel >= 3) level = 3;
    else if (effectiveHintLevel >= 2) level = 2;
    if (!level) return;

    const key = `${phase}:${level}`;
    if (spokenHintRef.current.has(key)) return;

    let line = null;
    if (phase === PHASES.FLOWER_BUSH) line = level === 3 ? VO.bushDirect : VO.bushIdle;
    if (phase === PHASES.FLOWER_BRANCH) line = level === 3 ? VO.branchDirect : VO.branchGesture;
    if (phase === PHASES.FLOWER_MARSH) line = level === 3 ? VO.marshDirect : VO.marshIdle;
    if (!line) return;

    spokenHintRef.current.add(key);
    if (level === 2) {
      speakAsync(line).then(() => { l2VoiceEndedAtRef.current = Date.now(); });
    } else {
      speak(line);
    }
  }, [effectiveHintLevel, phase, speak, speakAsync]);

  // ---- BUSH ----
  const [bushIntroReaction, setBushIntroReaction] = useState(false);
  const [bushIntroDone, setBushIntroDone] = useState(false);
  // Teaching gesture is tied to the ACTION WORD inside the instruction VO,
  // not to the VO finishing. This flag lets the GestureDemo appear mid-VO
  // (aligned with "Swipe...") while bushIntroDone (which still gates real
  // interaction) only flips once the whole line has finished.
  const [bushTeachingReady, setBushTeachingReady] = useState(false);
  const [bushOpenState, setBushOpenState] = useState(false);
  const [bushSpringing, setBushSpringing] = useState(false);
  const bushSwipeStartRef = useRef(null);
  // Per-error-type tiered feedback counters — 1st occurrence of a given
  // mistake gets a corrective VO, 2nd is physical-only, 3rd repeats the VO
  // and re-shows the teaching gesture. Two distinct error types for Bush
  // (wrong direction vs. correct direction but too short) each get their
  // own count, so a child who fixed one problem doesn't get penalized on
  // the other's counter.
  const bushWrongDirCountRef = useRef(0);
  const bushTooShortCountRef = useRef(0);

  // ---- BRANCH ----
  const [branchIntroReaction, setBranchIntroReaction] = useState(false);
  const [branchIntroDone, setBranchIntroDone] = useState(false);
  const [branchTeachingReady, setBranchTeachingReady] = useState(false);
  const [branchComplete, setBranchComplete] = useState(false);
  const [branchPull, setBranchPull] = useState(0);
  const [branchHolding, setBranchHolding] = useState(false);
  const branchDragRef = useRef({ active: false, startY: 0 });
  const branchHoldTimerRef = useRef(null);
  // Same per-error-type tiering as Bush — wrong direction (pulling up) vs.
  // correct direction but released too early are tracked separately.
  const branchWrongDirCountRef = useRef(0);
  const branchEarlyCountRef = useRef(0);
  const branchWrongDirectionRef = useRef(false);
  const branchMeaningfulPullRef = useRef(false);
  const branchCompletedRef = useRef(false);

  // ---- MARSH ----
  const marshRef = useRef(null);
  const [marshStep, setMarshStep] = useState(0);
  const [marshIntroDone, setMarshIntroDone] = useState(false);
  const [marshTeachingReady, setMarshTeachingReady] = useState(false);
  const [marshExiting, setMarshExiting] = useState(false);
  useEffect(() => { setMarshExiting(false); setMarshWakeStep(null); }, [phase]);
  const [marshDrag, setMarshDrag] = useState({ active: false, x: 0, y: 0 });
  const [marshWobble, setMarshWobble] = useState(false);
  const [marshSlip, setMarshSlip] = useState(false);
  const marshMeaningfulMoveRef = useRef(false);
  // Index of the safe-spot clump currently doing its brief "wake-up" pulse
  // (tiny lift/glow, ~500ms) right after Mooshika lands on the spot before
  // it — this is what tells the child which spot is next, instead of
  // printing 1/2/3/4 on the clumps. It's a normal game-state change, not
  // part of the L1/L2/L3 idle-hint ladder.
  const [marshWakeStep, setMarshWakeStep] = useState(null);

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

  const bushIntroStartedRef = useRef(false);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BUSH || !isActive || bushIntroStartedRef.current) return undefined;
    bushIntroStartedRef.current = true;
    let cancelled = false;
    (async () => {
      await wait(350);
      if (cancelled) return;
      // Tiny physical approach + recoil from the thorns — a wordless beat,
      // not tied to VO timing.
      setBushIntroReaction(true);
      await wait(430);
      if (cancelled) return;
      await wait(470);
      if (cancelled) return;
      setBushIntroReaction(false);
      await wait(150);
      if (cancelled) return;

      // VO.bushStart = "Two flowers are hiding in the leaves. Swipe them
      // apart." — two short sentences, no named emotion word anymore. At
      // this scene's TTS rate (~142 wpm + sentence-end pause), the first
      // sentence (7 words) runs ~3.3s before "Swipe" (word 8, the action
      // word) begins, so the teaching hand is synced there. The reaction
      // emoji has no word to sync to, so it just follows the wordless
      // approach beat immediately.
      const emotionTimer = window.setTimeout(() => {
        if (cancelled) return;
        setEmotion('angry');
      }, 200);
      const teachTimer = window.setTimeout(() => {
        if (cancelled) return;
        setBushTeachingReady(true);
        window.setTimeout(() => { if (!cancelled) setBushTeachingReady(false); }, 3800);
      }, 3300);

      await speakAsync(VO.bushStart);
      clearTimeout(emotionTimer);
      clearTimeout(teachTimer);
      if (cancelled) return;
      setBushIntroDone(true);
      // Teaching already shown mid-VO above — just arm the 10/18/26 idle ladder.
      armIdleHints(false);
    })();
    return () => { cancelled = true; };
  }, [phase, isActive, wait, speakAsync, armIdleHints]);

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
    if (phase !== PHASES.FLOWER_BUSH || !bushIntroDone || isPaused) return;
    e.preventDefault();
    bushSwipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, [phase, bushIntroDone, isPaused]);

  const handleBushPointerUp = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BUSH || !bushIntroDone || isPaused) return;
    const start = bushSwipeStartRef.current;
    bushSwipeStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const horizontalEnough = Math.abs(dx) > Math.abs(dy);
    const totalDistance = Math.hypot(dx, dy);
    // Any real drag counts as a genuine attempt now, not just a horizontal
    // one — a vertical swipe used to be silently ignored (same as a stray
    // tap), which left the child with zero feedback for a real-but-wrong
    // attempt.
    const meaningfulSwipe = totalDistance >= 15;
    const successfulSwipe = horizontalEnough && Math.abs(dx) >= 45;

    // Tiny tap / accidental movement: do nothing, don't reset the clock.
    if (!meaningfulSwipe) return;

    // A genuine attempt happened.
    resetIdleBaseline();

    // Genuine but insufficient or wrong-direction swipe — bush resists and
    // springs back. Two distinct error types, each with its own 1st-VO /
    // 2nd-silent / 3rd-VO+demo ladder, so the correction is specific to
    // what actually went wrong.
    if (!successfulSwipe) {
      setBushSpringing(true);
      safeTimeout(() => setBushSpringing(false), 650);
      registerFailedAttempt();

      const countRef = horizontalEnough ? bushTooShortCountRef : bushWrongDirCountRef;
      countRef.current += 1;
      const [voFirst, voThird] = horizontalEnough
        ? [VO.bushTooShort1, VO.bushTooShort3]
        : [VO.bushWrongDir1, VO.bushWrongDir3];

      if (countRef.current === 1) {
        speak(voFirst);
      } else if (countRef.current >= 3) {
        speak(voThird);
        setBushTeachingReady(true);
        safeTimeout(() => setBushTeachingReady(false), 3800);
      }
      // 2nd occurrence: physical spring-back only, no VO.
      return;
    }

    // First correct swipe succeeds.
    setEmotion(null);
    setBushOpenState(true);
    setEmotion('pleased');
    speak(VO.bushSuccess);
    safeTimeout(() => {
      setEmotion(null);
      setEmotionTraces((prev) => ({ ...prev, bush: 'pleased' }));
      collectChallengeFlowers({ firstEl: bushFlowerOneRef.current, secondEl: bushFlowerTwoRef.current, newFlowerCount: 2 });
      safeTimeout(() => setPhase(PHASES.FLOWER_BRANCH), 2200);
    }, 1350);
  }, [phase, bushIntroDone, isPaused, resetIdleBaseline, registerFailedAttempt, safeTimeout, speak, collectChallengeFlowers]);

  const branchFlowerOneRef = useRef(null);
  const branchFlowerTwoRef = useRef(null);
  const branchRef = useRef(null);
  const branchIntroStartedRef = useRef(false);

  useEffect(() => {
    if (phase !== PHASES.FLOWER_BRANCH || !isActive || branchIntroStartedRef.current) return undefined;
    branchIntroStartedRef.current = true;
    let cancelled = false;
    (async () => {
      await wait(500);
      if (cancelled) return;
      // Mooshika stretches upward, but the flowers are simply too high.
      setBranchIntroReaction(true);
      await wait(900);
      if (cancelled) return;
      setBranchIntroReaction(false);
      await wait(200);
      if (cancelled) return;

      // VO.branchStart = "Two flowers are too high for Mooshika. Pull the
      // branch down." — one sentence before the action word, no named
      // emotion word anymore. At this scene's TTS rate, the first sentence
      // (7 words) runs ~3.3s before "Pull" (word 8, the action word)
      // begins, so the teaching hand is synced there. The reaction emoji
      // has no word to sync to, so it just follows the wordless stretch
      // beat immediately.
      const emotionTimer = window.setTimeout(() => {
        if (cancelled) return;
        setEmotion('sad');
      }, 200);
      const teachTimer = window.setTimeout(() => {
        if (cancelled) return;
        setBranchTeachingReady(true);
        window.setTimeout(() => { if (!cancelled) setBranchTeachingReady(false); }, 3800);
      }, 3300);

      await speakAsync(VO.branchStart);
      clearTimeout(emotionTimer);
      clearTimeout(teachTimer);
      if (cancelled) return;
      setBranchIntroDone(true);
      armIdleHints(false);
    })();
    return () => { cancelled = true; };
  }, [phase, isActive, wait, speakAsync, armIdleHints]);

  const clearBranchHold = useCallback(() => {
    if (branchHoldTimerRef.current) { clearTimeout(branchHoldTimerRef.current); branchHoldTimerRef.current = null; }
    setBranchHolding(false);
  }, []);

  const finishBranchChallenge = useCallback(() => {
    clearBranchHold();
    // First correct pull + hold succeeds.
    setBranchPull(1);
    setBranchComplete(true);
    branchCompletedRef.current = true;
    setEmotion('relieved');
    speak(VO.branchSuccess);
    safeTimeout(() => {
      setEmotion(null);
      setEmotionTraces((prev) => ({ ...prev, branch: 'relieved' }));
      collectChallengeFlowers({ firstEl: branchFlowerOneRef.current, secondEl: branchFlowerTwoRef.current, newFlowerCount: 4 });
      safeTimeout(() => setPhase(PHASES.FLOWER_MARSH), 2200);
    }, 1350);
  }, [clearBranchHold, collectChallengeFlowers, safeTimeout, speak]);

  const handleBranchPointerDown = useCallback((e) => {
    if (phase !== PHASES.FLOWER_BRANCH || !branchIntroDone || branchComplete || isPaused) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    branchMeaningfulPullRef.current = false;
    branchWrongDirectionRef.current = false;
    branchDragRef.current = { active: true, startY: e.clientY };
    clearBranchHold();
  }, [phase, branchIntroDone, branchComplete, isPaused, clearBranchHold]);

  const handleBranchPointerMove = useCallback((e) => {
    if (!branchDragRef.current.active) return;
    const dy = e.clientY - branchDragRef.current.startY;
    const progress = Math.max(0, Math.min(1, dy / 120));
    setBranchPull(progress);

    // Only a real pull resets the timer — touching the branch does not.
    if (!branchMeaningfulPullRef.current && progress >= 0.18) {
      branchMeaningfulPullRef.current = true;
      resetIdleBaseline();
      // Intro disappointment has done its job.
      setEmotion(null);
    }

    // A genuine pull the wrong way (up, not down) used to just clamp to 0
    // and go completely unnoticed — same silent-ignore gap as Bush's
    // vertical swipe. Flag it so pointer-up can give real feedback.
    if (!branchMeaningfulPullRef.current && dy <= -15) {
      branchWrongDirectionRef.current = true;
    }

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
  }, [finishBranchChallenge, clearBranchHold, resetIdleBaseline]);

  const handleBranchPointerEnd = useCallback(() => {
    if (!branchDragRef.current.active) return;
    branchDragRef.current.active = false;
    if (branchComplete) return;
    clearBranchHold();
    if (branchPull > 0.15) {
      // Correct direction, released too early — its own error-type ladder.
      setEmotion('sad');
      registerFailedAttempt();
      branchEarlyCountRef.current += 1;
      if (branchEarlyCountRef.current === 1) {
        speak(VO.branchEarly1);
      } else if (branchEarlyCountRef.current >= 3) {
        speak(VO.branchEarly3);
        setBranchTeachingReady(true);
        safeTimeout(() => setBranchTeachingReady(false), 3800);
      }
      // 2nd occurrence: sad emotion + physical only, no VO.
    } else if (branchWrongDirectionRef.current) {
      // A real attempt happened, it just went the wrong way — give it the
      // same "genuine attempt" treatment as an insufficient pull, instead
      // of leaving it completely unacknowledged. Own error-type ladder.
      resetIdleBaseline();
      registerFailedAttempt();
      branchWrongDirCountRef.current += 1;
      if (branchWrongDirCountRef.current === 1) {
        speak(VO.branchWrongDir1);
      } else if (branchWrongDirCountRef.current >= 3) {
        speak(VO.branchWrongDir3);
        setBranchTeachingReady(true);
        safeTimeout(() => setBranchTeachingReady(false), 3800);
      }
    }
    branchWrongDirectionRef.current = false;
    setBranchPull(0);
  }, [branchComplete, branchPull, clearBranchHold, registerFailedAttempt, resetIdleBaseline, safeTimeout, speak]);

  const marshStopsLive = MARSH_STOPS;
  const marshStartLive = MARSH_START;
  const getCurrentMarshPosition = useCallback(
    () => (marshStep === 0 ? marshStartLive : (marshStopsLive[marshStep - 1] || marshStartLive)),
    [marshStep]
  );

  const marshIntroStartedRef = useRef(false);

  useEffect(() => {
    if (
      phase !== PHASES.FLOWER_MARSH ||
      !isActive ||
      !branchCompletedRef.current ||
      marshIntroStartedRef.current
    ) return undefined;

    marshIntroStartedRef.current = true;
    let cancelled = false;
    (async () => {
      await wait(350);
      if (cancelled) return;

      // "The last two flowers are across the mud. Guide Mooshika from safe
      // spot to safe spot." — only one short setup clause before "Guide",
      // so the teaching hand appears sooner than Bush/Branch's ~1.1s.
      // Unlike Bush/Branch, no nervous emoji here at the start — Marsh
      // already has its own wobble/wrong-attempt moment mid-crossing where
      // that emotion actually reads as caused by something.
      const teachTimer = window.setTimeout(() => {
        if (cancelled) return;
        setMarshTeachingReady(true);
        window.setTimeout(() => { if (!cancelled) setMarshTeachingReady(false); }, 3800);
      }, 800);

      await speakAsync(VO.marshStart);
      clearTimeout(teachTimer);
      if (cancelled) return;
      setMarshIntroDone(true);
      armIdleHints(false);
    })();
    return () => { cancelled = true; };
  }, [phase, isActive, wait, speakAsync, armIdleHints]);

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
    if (phase !== PHASES.FLOWER_MARSH || !marshIntroDone || marshStep >= 4 || marshPointerRef.current || isPaused) return;
    e.preventDefault();
    const point = marshPointFromEvent(e);
    if (!point) return;
    const current = getCurrentMarshPosition();
    marshMeaningfulMoveRef.current = false;
    marshPointerRef.current = { id: e.pointerId, offsetX: current.x - point.x, offsetY: current.y - point.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setMarshDrag({ active: true, x: current.x, y: current.y });
  }, [phase, marshIntroDone, marshStep, isPaused, getCurrentMarshPosition]);

  const handleMarshPointerMove = useCallback((e) => {
    const position = marshLandingFromEvent(e);
    if (!position) return;
    setMarshDrag({ active: true, ...position });

    if (!marshMeaningfulMoveRef.current) {
      const start = getCurrentMarshPosition();
      const distance = Math.hypot(position.x - start.x, position.y - start.y);
      if (distance >= 6) {
        marshMeaningfulMoveRef.current = true;
        resetIdleBaseline();
      }
    }
  }, [getCurrentMarshPosition, resetIdleBaseline]);

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

    const meaningfulAttempt = marshMeaningfulMoveRef.current;
    marshMeaningfulMoveRef.current = false;

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

      // A new safe spot is effectively a new mini-round — fresh clock.
      if (nextStep < MARSH_STOPS.length) {
        resetIdleBaseline(true);
        // Wake up the next safe spot so it's visually obvious where to go
        // next, without labeling it — a short pulse, then it settles into
        // its normal look same as every other still-ahead spot.
        setMarshWakeStep(nextStep);
        safeTimeout(() => setMarshWakeStep((cur) => (cur === nextStep ? null : cur)), 550);
      }

      if (nextStep === 3) {
        safeTimeout(() => flyOneFlowerToBasket(marshFlowerOneRef.current, flowerPink, 5), 100);
      }
      if (nextStep === 4) {
        safeTimeout(async () => {
          flyOneFlowerToBasket(marshFlowerTwoRef.current, flowerCream, 6);
          setEmotion('excited');
          await wait(2000);
          setEmotion(null);
          setEmotionTraces((prev) => ({ ...prev, marsh: 'excited' }));
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

    const safePosition = getCurrentMarshPosition();
    setMarshDrag({ active: false, x: safePosition.x, y: safePosition.y });

    // A tap without real movement doesn't count as a failure.
    if (meaningfulAttempt) {
      setEmotion('worried');
      registerFailedAttempt();
      if (!marshWrongWarnedRef.current) {
        marshWrongWarnedRef.current = true;
        speak(VO.marshWrong);
      }
    }

    safeTimeout(() => setMarshSlip(false), 500);
  }, [marshStep, marshStopsLive, flyOneFlowerToBasket, getCurrentMarshPosition, resetIdleBaseline, registerFailedAttempt, safeTimeout, speak, speakAsync, wait]);

  // ---- BELLY beats -> hand off to live SymbolAutoReveal via onComplete ----
  // bellyBeat 1-6 = that many feeling emojis visible (upset, sad, nervous,
  // pleased, happy, excited — VO.bellyReflection's naming order, harder
  // feelings on the left, lighter feelings on the right).
  // bellyBeat 7 = belly glow on. bellyBeat 8 = glow strong / settled, held
  // through VO.bellyAffirmation's handoff.
  useEffect(() => {
    if (phase !== PHASES.BELLY_RECOGNITION || !isActive) { setBellyBeat(0); return undefined; }
    let cancelled = false;
    const beatTimers = [];
    (async () => {
      await wait(600);
      if (cancelled) return;

      // All 6 emojis pop in one by one while VO.bellyReflection names them,
      // ~320ms apart so all six are up by ~2s into the line.
      for (let i = 1; i <= 6; i++) {
        beatTimers.push(window.setTimeout(() => { if (!cancelled) setBellyBeat(i); }, i * 320));
      }
      await speakAsync(VO.bellyReflection);
      if (cancelled) return;
      setBellyBeat(6);

      await wait(300);
      if (cancelled) return;
      setBellyBeat(7);
      await speakAsync(VO.bellyHeld);

      await wait(450);
      if (cancelled) return;
      setBellyBeat(8);
      // Don't speak VO.bellyAffirmation here — it's the exact same line the
      // parent scene's SymbolAutoReveal card says next ("Say with me, I can
      // have lots of feelings and keep going.") once onComplete hands off.
      // Speaking it here too made the child hear the identical sentence
      // twice in a row with no "say it with me" framing on the first one.
      await wait(1400);
      if (cancelled) return;
      onComplete?.();
    })();
    return () => { cancelled = true; beatTimers.forEach(clearTimeout); };
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

      {/* Small "memory" marker left near a challenge right after it's solved
          — but only for as long as that challenge's own phase is still on
          screen. Each one is gated to its own phase so it doesn't keep
          floating above the bush/tree once the game has moved on to the
          next challenge (e.g. the branch's emoji staying up once marsh
          starts looked like a stuck/stale emotion). */}
      {emotionTraces.bush && isBushPhase && (
        <img
          src={emotionPleased}
          alt="Pleased"
          className="fjg2-emotion-trace"
          style={{ left: `${LAYOUT.bush.l + 11}%`, top: `${LAYOUT.bush.t - 6}%` }}
        />
      )}
      {emotionTraces.branch && isBranchPhase && (
        <img
          src={emotionRelieved}
          alt="Happy"
          className="fjg2-emotion-trace"
          style={{ left: `${LAYOUT.branch.l + 10}%`, top: `${LAYOUT.branch.t - 6}%` }}
        />
      )}
      {emotionTraces.marsh && isMarshPhase && (
        <img
          src={emotionExcited}
          alt="Excited"
          className="fjg2-emotion-trace"
          style={{ left: `${LAYOUT.marsh.l + 9}%`, top: `${LAYOUT.marsh.t - 10}%` }}
        />
      )}

      {/* ---------------- BUSH ---------------- */}
      {showBush && (
        <div
          className={`fjg2-bush-area ${isBushPhase ? 'is-active' : ''} ${bushSceneryComplete ? 'is-complete' : ''}`}
          style={{ left: `${LAYOUT.bush.l}%`, top: `${LAYOUT.bush.t}%`, '--layout-scale': (LAYOUT.bush.s || 100) / 100 }}
        >
          <button
            type="button"
            className={`fjg2-bush ${bushSpringing ? 'fjg2-bush--springing' : ''} ${bushOpenState ? 'fjg2-bush--open' : ''} ${isBushPhase && bushIntroDone && effectiveHintLevel === 1 ? 'fjg2-bush--hint-l1' : ''} ${isBushPhase && bushIntroDone && effectiveHintLevel >= 3 ? 'fjg2-bush--hint-l3' : ''}`}
            onPointerDown={isBushPhase && bushIntroDone ? handleBushPointerDown : undefined}
            onPointerUp={isBushPhase && bushIntroDone ? handleBushPointerUp : undefined}
            onPointerCancel={() => { bushSwipeStartRef.current = null; }}
            disabled={!isBushPhase || !bushIntroDone}
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
            className={`fjg2-branch ${isBranchPhase && branchIntroDone && !branchComplete && effectiveHintLevel === 1 ? 'fjg2-branch--hint-l1' : ''}`}
            style={{ '--pull': branchComplete ? 1 : branchPull, '--layout-scale': (LAYOUT.branch.s || 100) / 100, left: `${LAYOUT.branch.l}%`, top: `${LAYOUT.branch.t}%` }}
            onPointerDown={isBranchPhase ? handleBranchPointerDown : undefined}
            onPointerMove={isBranchPhase ? handleBranchPointerMove : undefined}
            onPointerUp={isBranchPhase ? handleBranchPointerEnd : undefined}
            onPointerCancel={isBranchPhase ? handleBranchPointerEnd : undefined}
            onContextMenu={(e) => e.preventDefault()}
            disabled={!isBranchPhase || !branchIntroDone || branchComplete}
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
              src={marshClumpArt}
              alt=""
              className={`fjg2-marsh-clump ${isMarshPhase && marshIntroDone && effectiveHintLevel >= 3 && i === marshStep ? 'fjg2-marsh-clump--hint-target' : ''} ${isMarshPhase && i === marshWakeStep ? 'fjg2-marsh-clump--wake' : ''}`}
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
                className={`fjg2-marsh-mooshika ${marshExiting ? 'fjg2-marsh-mooshika--exiting' : ''} ${marshWobble ? 'fjg2-marsh-mooshika--wobble' : ''} ${marshSlip ? 'fjg2-marsh-mooshika--slip' : ''} ${marshIntroDone && effectiveHintLevel === 1 ? 'fjg2-marsh-mooshika--hint-l1' : ''}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                disabled={!marshIntroDone}
                onPointerDown={marshIntroDone ? handleMarshPointerDown : undefined}
                onPointerMove={marshIntroDone ? handleMarshPointerMove : undefined}
                onPointerUp={marshIntroDone ? handleMarshPointerEnd : undefined}
                onPointerCancel={marshIntroDone ? handleMarshPointerCancel : undefined}
                aria-label="Guide Mooshika across the stepping stones"
              >
                <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
                {emotion === 'worried' && (
                  <img src={emotionWorried} alt="Nervous" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiMarsh.l}%`, top: `${LAYOUT.emojiMarsh.t}%` }} />
                )}
                {emotion === 'excited' && (
                  <img src={emotionExcited} alt="Excited" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiMarsh.l}%`, top: `${LAYOUT.emojiMarsh.t}%` }} />
                )}
              </button>
            );
          })()}

          {isMarshPhase && (marshIntroDone || marshTeachingReady) && (() => {
            const from = getCurrentMarshPosition();
            const target = marshStopsLive[marshStep] || from;
            const isTeaching = (teachingGesture || marshTeachingReady) && effectiveHintLevel < 2;

            // L2 shows direction but stops short; L3 / teaching reaches the
            // actual next safe spot.
            let to = target;
            if (!isTeaching && effectiveHintLevel === 2) {
              to = {
                x: from.x + (target.x - from.x) * 0.55,
                y: from.y + (target.y - from.y) * 0.55,
              };
            }

            const showDemo = !isPaused && !marshDrag.active && (teachingGesture || marshTeachingReady || effectiveHintLevel >= 2);

            return (
              <GestureDemo
                type="drag"
                from={{ x: from.x, y: from.y }}
                to={{ x: to.x, y: to.y }}
                active={showDemo}
                idleDelay={0}
                replayKey={effectiveHintLevel}
                iterations={2}
                zIndex={30}
              />
            );
          })()}
        </div>
      )}

      {/* ---------------- Shared Mooshika (Bush + Branch) ---------------- */}
      {showSharedMooshika && (
        <div
          className={`fjg2-mooshika-shared ${isBushPhase && bushIntroReaction ? 'fjg2-mooshika-shared--thorn-reaction' : ''} ${isBranchPhase && branchIntroReaction ? 'fjg2-mooshika-shared--reach-high' : ''}`}
          style={{ left: `${LAYOUT[mooshikaPhaseKey].l}%`, top: `${LAYOUT[mooshikaPhaseKey].t}%`, '--layout-scale': (LAYOUT[mooshikaPhaseKey].s || 100) / 100 }}
        >
          <MooshikaWithBasket flowerCount={flowerCount} basketRef={basketTargetRef} />
          {isBushPhase && emotion === 'angry' && (
            <img src={emotionAngry} alt="Upset" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBush.l}%`, top: `${LAYOUT.emojiBush.t}%` }} />
          )}
          {isBushPhase && emotion === 'pleased' && (
            <img src={emotionPleased} alt="Pleased" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBush.l}%`, top: `${LAYOUT.emojiBush.t}%` }} />
          )}
          {isBranchPhase && emotion === 'sad' && (
            <img src={emotionSad} alt="Sad" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBranch.l}%`, top: `${LAYOUT.emojiBranch.t}%` }} />
          )}
          {isBranchPhase && emotion === 'relieved' && (
            <img src={emotionRelieved} alt="Happy" className="fjg2-emotion fjg2-emotion--anchored" style={{ left: `${LAYOUT.emojiBranch.l}%`, top: `${LAYOUT.emojiBranch.t}%` }} />
          )}
        </div>
      )}

      {/* ---------------- GESTURE DEMOS (Bush + Branch) ---------------- */}
      {/* swipe-left ignores `to` and always sweeps ±15% (30% of the whole
          scene width) regardless of where it's anchored — far wider than
          the actual bush swipe threshold. An explicit short drag over the
          real bush instead teaches "move sideways through here" without
          sweeping halfway across the screen. */}
      <GestureDemo
        type="drag"
        from={{ x: LAYOUT.bush.l + 6, y: LAYOUT.bush.t }}
        to={{ x: LAYOUT.bush.l - 6, y: LAYOUT.bush.t }}
        active={!isPaused && isBushPhase && !bushOpenState && (bushTeachingReady || (bushIntroDone && (teachingGesture || effectiveHintLevel >= 2)))}
        idleDelay={0}
        replayKey={effectiveHintLevel}
        iterations={2}
        zIndex={30}
      />
      {/* pull-down and hold are two separate animations with no compound
          type — showing both left two overlapping hand graphics on screen.
          pull-down-hold is one hand: press, pull, KEEP HOLDING, release. */}
      {/* Unlike .fjg2-bush / .fjg2-marsh-area, .fjg2-branch has no
          translate(-X%,-Y%) centering transform in CSS — its left/top
          mark the button's TOP-LEFT corner, not the visible branch
          artwork. LAYOUT.branch (67.6, 44.8) is that corner; the actual
          branch/flower cluster renders lower-right of it. (78.9, 57.2) is
          measured from the branch's own rendered box using the same
          local-percent convention as branchFlower1 (49.1%, 34.4% of the
          branch box) converted to stage percent — verified against the
          live DOM, matches where the flowers actually sit. */}
      <GestureDemo
        type="pull-down-hold"
        from={{ x: 78.9, y: 57.2 }}
        to={{ x: 78.9, y: 72.2 }}
        active={!isPaused && isBranchPhase && !branchComplete && (branchTeachingReady || (branchIntroDone && (teachingGesture || effectiveHintLevel >= 2)))}
        idleDelay={0}
        replayKey={effectiveHintLevel}
        // A hold-type gesture already shows the full press → ring → release
        // cycle in one pass (~3s) — playing it twice looks like two separate
        // presses instead of one sustained hold, so keep this at 1.
        iterations={1}
        zIndex={30}
      />

      {/* ---------------- BELLY-FEELING STORYTELLING BEAT ---------------- */}
      {isBellyPhase && (
        <div className="fjg2-belly">
          <div className="fjg2-belly-ganesha" style={{ left: `${LAYOUT.ganesha.l}%`, top: `${LAYOUT.ganesha.t}%`, transform: `translate(-50%, -50%) scale(${LAYOUT.ganesha.s / 100})` }}>
            <img src={ganeshaArt} alt="Ganesha" />
            {bellyBeat >= 7 && <div className={`fjg2-belly-glow ${bellyBeat >= 8 ? 'fjg2-belly-glow--strong' : ''}`} aria-hidden="true" />}
          </div>

          <div
            className="fjg2-belly-mooshika"
            style={{ left: `${LAYOUT.mooshikaBelly.l}%`, top: `${LAYOUT.mooshikaBelly.t}%`, '--layout-scale': (LAYOUT.mooshikaBelly.s || 100) / 100 }}
          >
            <MooshikaWithBasket flowerCount={6} basketRef={basketTargetRef} />
            {bellyBeat >= 1 && <img src={emotionAngry} alt="Upset" className="fjg2-belly-emotion fjg2-belly-emotion--upset" />}
            {bellyBeat >= 2 && <img src={emotionSad} alt="Sad" className="fjg2-belly-emotion fjg2-belly-emotion--sad" />}
            {bellyBeat >= 3 && <img src={emotionWorried} alt="Nervous" className="fjg2-belly-emotion fjg2-belly-emotion--nervous" />}
            {bellyBeat >= 4 && <img src={emotionPleased} alt="Pleased" className="fjg2-belly-emotion fjg2-belly-emotion--pleased" />}
            {bellyBeat >= 5 && <img src={emotionRelieved} alt="Happy" className="fjg2-belly-emotion fjg2-belly-emotion--happy" />}
            {bellyBeat >= 6 && <img src={emotionExcited} alt="Excited" className="fjg2-belly-emotion fjg2-belly-emotion--excited" />}
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
