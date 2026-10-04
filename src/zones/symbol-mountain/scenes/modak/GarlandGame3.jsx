import { usePreloadPoses, preparePose } from '../../../../lib/components/animation/PoseImage';
// GarlandGame3 — thread 6 flowers into a garland, then carry/drop it onto
// Ganesha. Ends by calling the onComplete callback, which hands off to the
// live scene's existing SymbolAutoReveal for the real "modak" symbol card
// (this component owns NO reveal UI of its own).
//
// Ported from the approved dev preview at
// src/dev/modakGame3Preview/Game3Garland.jsx. Debug/layout-tuning UI has
// been stripped for production; the tuned LAYOUT_DEFAULTS from that preview
// are baked in as constants below. Locked rules preserved: flower slots are
// invisible (no placement-circle hints), flower colour/order is never a
// puzzle, flowers auto-thread onto the next spot.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
import { attachSpeechCue, startCueTimer } from '../../../../lib/utils/speechCue';
import './GarlandGame3.css';

import flowerPink from './assets/images/fj-flower-coral.webp';
import flowerCream from './assets/images/fj-flower-cream.webp';
import garlandString from './assets/images/fj-garland-empty.webp';
import completedGarland from './assets/images/fj-garland-complete.webp';
import mooshikaBasket from './assets/images/mooshika-turned-game2.webp';
import ganesha from './assets/images/ganesha-game3-new.webp';
import forestBackground from './assets/images/modak-fj-bg.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';

const PHASES = { BUILD: 'GARLAND_BUILD', READY: 'GARLAND_READY', OFFERED: 'GARLAND_OFFERED' };
const SHOW_HIT_ZONES =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('hitzones');
const GANESHA_DROP_PAD = { x: 16, top: 18, bottom: 22 };

const FLOWERS = [
  { id: 'flower-1', src: flowerPink, x: 18, y: 23 },
  { id: 'flower-2', src: flowerCream, x: 11, y: 52 },
  { id: 'flower-3', src: flowerPink, x: 22, y: 79 },
  { id: 'flower-4', src: flowerCream, x: 82, y: 23 },
  { id: 'flower-5', src: flowerPink, x: 89, y: 52 },
  { id: 'flower-6', src: flowerCream, x: 78, y: 79 },
];

// Hidden placement positions — child never sees these; any successful drop
// on the string fills the next one, regardless of which flower it was.
const GARLAND_SLOTS = [
  { x: 29, y: 43 }, { x: 36, y: 60 }, { x: 45, y: 68 },
  { x: 55, y: 68 }, { x: 64, y: 60 }, { x: 71, y: 43 },
];

const LAYOUT = {
  ganesha: { l: 50, t: 29 },
  mooshika: { l: 30, t: 50 },
  workspace: { l: 50, t: 72 },
};

const VO = {
  open: 'You found all six flowers. Tap them to make a garland for Ganesha.',
  // L2 build hint: a child who has not tapped any flower yet must not hear "another".
  tapIdle: 'Tap any flower.',
  // L3 build hint: points at the one flower the hand is tapping.
  tapDirect: 'Tap this flower.',
  ready: 'The garland is ready! Drag it to Ganesha.',
  carry: 'Drag the garland to Ganesha.',
  carryDirect: 'Drag the garland onto Ganesha.',
  offered: 'You brought the garland to Ganesha — and look, a sweet Modak!',
};

const SCENE_IMAGES = [
  flowerPink,
  flowerCream,
  garlandString,
  completedGarland,
  mooshikaBasket,
  ganesha,
  forestBackground,
  symbolModakColored,
];

const isPointInsideExpandedOval = (event, rect, pad = { x: 0, top: 0, bottom: 0 }) => {
  const left = rect.left - pad.x;
  const top = rect.top - pad.top;
  const width = rect.width + (pad.x * 2);
  const height = rect.height + pad.top + pad.bottom;
  if (!width || !height) return false;
  const cx = left + width / 2;
  const cy = top + height / 2;
  const dx = (event.clientX - cx) / (width / 2);
  const dy = (event.clientY - cy) / (height / 2);
  return (dx * dx) + (dy * dy) <= 1;
};

export default function GarlandGame3({ isActive = true, isPaused = false, isAudioOn = true, onComplete, stopVoice }) {
  usePreloadPoses(SCENE_IMAGES);
  const [phase, setPhase] = useState(PHASES.BUILD);
  const sceneRef = useRef(null);
  const workspaceRef = useRef(null);
  const ganeshaDropRef = useRef(null);
  const mooshikaRef = useRef(null);

  const [placedFlowers, setPlacedFlowers] = useState([]);
  const [threadingFlower, setThreadingFlower] = useState(null);
  const threadingLock = useRef(false);
  const [garlandPosition, setGarlandPosition] = useState({ x: 50, y: 55, active: false });

  const [flowersArrived, setFlowersArrived] = useState(false);
  const [basketPct, setBasketPct] = useState(null);
  const [showModakGlow, setShowModakGlow] = useState(false);

  // Defensive: if the scene pauses (tab-hide) mid-carry, drop the stuck
  // world-drag garland back to its rest position instead of leaving it
  // floating under a pointer that will never fire up/cancel again.
  useEffect(() => {
    if (isPaused) setGarlandPosition((prev) => (prev.active ? { x: 50, y: 55, active: false } : prev));
  }, [isPaused]);

  const mutedRef = useRef(!isAudioOn);
  useEffect(() => { mutedRef.current = !isAudioOn; }, [isAudioOn]);

  // Sidebar = true pause: every game timer freezes (and resumes with its remaining
  // time), and speech is interrupted + replayed — see interruptSpeech/resumeSpeech.
  const { after, cancel: cancelTimer } = usePausableTimers(isPaused);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;
  // Tab-hide safety for this game's direct speechSynthesis use (it bypasses the
  // scene's useVoiceGuidance hook). Mirrors the hook: cancel on hide, replay the
  // interrupted line from the start 2s after return, clear everything on unmount.
  const activeSpeechRef = useRef(null);
  const interruptedSpeechRef = useRef(null);
  const replayTimerRef = useRef(null);
  // The line waiting out resumeSpeech's settle delay. If the sidebar opens again inside that
  // window it must go back into interruptedSpeechRef; otherwise its promise is never resolved,
  // the intro (`await speakAsync(VO.open)`) never finishes, and the hint clock is never armed.
  const pendingReplayRef = useRef(null);

  const startUtterance = useCallback((text, resolve, cue = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve?.();
      return;
    }
    // A line requested while the sidebar is open must not speak behind it —
    // queue it as the interrupted line so it plays, from the start, on close.
    if (pausedRef.current) {
      interruptedSpeechRef.current?.resolve?.();
      interruptedSpeechRef.current = { text, resolve, cue };
      return;
    }
    // Don't let cancel() accidentally resolve the previous instruction as
    // though it had genuinely finished.
    const previous = activeSpeechRef.current;
    if (previous?.utterance) {
      previous.utterance.onend = null;
      previous.utterance.onerror = null;
    }
    // Stop the parent scene's own voice engine first — its MP3 audio element
    // isn't touched by window.speechSynthesis.cancel() below, so without this
    // a still-playing scene VO keeps going under this mini-game's line.
    stopVoice?.();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    const entry = { text, resolve, utterance, cue };
    const done = () => {
      if (activeSpeechRef.current === entry) activeSpeechRef.current = null;
      resolve?.();
    };
    utterance.onend = done;
    utterance.onerror = done;
    // The carry hand (or other cue) fires exactly when the action word is spoken.
    entry.cancelCue = attachSpeechCue(utterance, text, cue);
    activeSpeechRef.current = entry;
    window.speechSynthesis.speak(utterance);
  }, [stopVoice]);

  const speak = useCallback((text) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
      startUtterance(text, null);
    } catch { /* no-op */ }
  }, [startUtterance]);

  const speakAsync = useCallback((text, cue = null) => new Promise((resolve) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) {
        startCueTimer(text, cue);
        resolve();
        return;
      }
      startUtterance(text, resolve, cue);
    } catch { resolve(); }
  }), [startUtterance]);

  // Detach the active utterance's handlers BEFORE cancel() (so nothing awaiting it
  // resolves and advances), and remember it. Shared by tab-hide and sidebar-open.
  const interruptSpeech = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
      if (pendingReplayRef.current) {
        interruptedSpeechRef.current = pendingReplayRef.current;
        pendingReplayRef.current = null;
      }
    }
    const entry = activeSpeechRef.current;
    activeSpeechRef.current = null;
    if (entry) {
      entry.utterance.onend = null;
      entry.utterance.onerror = null;
      entry.cancelCue?.();
      interruptedSpeechRef.current = { text: entry.text, resolve: entry.resolve, cue: entry.cue };
    }
    try { window.speechSynthesis?.cancel(); } catch { /* no-op */ }
  }, []);

  // Grabbing a flower / the garland cuts whatever instruction is still speaking
  // (so it doesn't keep talking behind the action). Detach handlers first, then
  // resolve the awaiting promise so the intro moves on to arming the hint clock.
  const silenceIntroVO = useCallback(() => {
    const entry = activeSpeechRef.current;
    if (!entry) return;
    activeSpeechRef.current = null;
    entry.utterance.onend = null;
    entry.utterance.onerror = null;
    try { window.speechSynthesis?.cancel(); } catch { /* no-op */ }
    entry.resolve?.();
  }, []);

  // Re-speak the interrupted line from the start after `settleMs`, resolving the same
  // promise so the awaiting sequence continues; `onSettled` runs once it has finished
  // (or immediately when nothing was interrupted).
  const resumeSpeech = useCallback((settleMs, onSettled) => {
    const entry = interruptedSpeechRef.current;
    interruptedSpeechRef.current = null;
    if (!entry) { onSettled?.(); return; }
    pendingReplayRef.current = entry;
    replayTimerRef.current = window.setTimeout(() => {
      replayTimerRef.current = null;
      pendingReplayRef.current = null;
      if (mutedRef.current) { entry.resolve?.(); onSettled?.(); return; }
      try {
        startUtterance(entry.text, () => { entry.resolve?.(); onSettled?.(); }, entry.cue);
      } catch { entry.resolve?.(); onSettled?.(); }
    }, settleMs);
  }, [startUtterance]);

  useAppVisibility(
    interruptSpeech,
    useCallback(() => resumeSpeech(2000), [resumeSpeech])
  );
  // Unmount: only drop the pending replay. Don't cancel() here — the parent scene
  // may already have started its next VO line in the same commit, and the scene's
  // own navigation teardown cancels speech globally anyway.
  useEffect(() => () => {
    if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    replayTimerRef.current = null;
    interruptedSpeechRef.current = null;
  }, []);

  const isBuild = phase === PHASES.BUILD;
  const isReady = phase === PHASES.READY;
  const isOffered = phase === PHASES.OFFERED;

  // ---------------------------------------------------------
  // BUILD HINTS — VO end -> 10 / 18 / 26. Every flower is valid, so hints
  // never single out "the correct one" until the L3 example nudge.
  // ---------------------------------------------------------
  const [buildHintLevel, setBuildHintLevel] = useState(0);
  const buildHintStartedAtRef = useRef(null);
  const buildHintVoPlayedRef = useRef({ l2: false, l3: false });
  // L3's 8s gap counts from when the L2 line finishes speaking, not from a
  // fixed 26s-from-arm mark — see the matching fix in FlowerJourneyGame2.jsx.
  const buildL2VoiceEndedAtRef = useRef(null);

  const startBuildHintClock = useCallback(() => {
    buildHintStartedAtRef.current = Date.now();
    buildL2VoiceEndedAtRef.current = null;
    setBuildHintLevel(0);
    buildHintVoPlayedRef.current = { l2: false, l3: false };
  }, []);

  const stopBuildHintClock = useCallback(() => {
    buildHintStartedAtRef.current = null;
    buildL2VoiceEndedAtRef.current = null;
    setBuildHintLevel(0);
    buildHintVoPlayedRef.current = { l2: false, l3: false };
  }, []);

  useEffect(() => {
    if (!isBuild || !isActive || isPaused) return undefined;
    const tick = window.setInterval(() => {
      const startedAt = buildHintStartedAtRef.current;
      if (!startedAt) return;
      const idleMs = Date.now() - startedAt;
      let nextLevel = 0;
      if (idleMs >= 18000) nextLevel = 2;
      else if (idleMs >= 10000) nextLevel = 1;
      if (nextLevel === 2 && buildL2VoiceEndedAtRef.current) {
        if (Date.now() - buildL2VoiceEndedAtRef.current >= 8000) nextLevel = 3;
      }
      setBuildHintLevel((prev) => (prev === nextLevel ? prev : nextLevel));
    }, 250);
    return () => window.clearInterval(tick);
  }, [isBuild, isActive, isPaused]);

  useEffect(() => {
    if (!isBuild) return;
    if (buildHintLevel >= 3 && !buildHintVoPlayedRef.current.l3) {
      buildHintVoPlayedRef.current.l3 = true;
      speak(VO.tapDirect);
      return;
    }
    if (buildHintLevel >= 2 && !buildHintVoPlayedRef.current.l2) {
      buildHintVoPlayedRef.current.l2 = true;
      speakAsync(VO.tapIdle).then(() => { buildL2VoiceEndedAtRef.current = Date.now(); });
    }
  }, [buildHintLevel, isBuild, speak, speakAsync]);

  // ---------------------------------------------------------
  // GARLAND CARRY HINTS — carrying the finished garland to Ganesha is a
  // drag, a new gesture after six tap interactions. Clock starts after the
  // "ready" VO finishes; meaningful drag movement resets it; repeated
  // failed drops accelerate help without waiting the full ladder.
  // ---------------------------------------------------------
  const [garlandHintLevel, setGarlandHintLevel] = useState(0);
  const [forcedGarlandHintLevel, setForcedGarlandHintLevel] = useState(0);
  const [carryTeachingGesture, setCarryTeachingGesture] = useState(false);
  const garlandHintStartedAtRef = useRef(null);
  const garlandHintVoPlayedRef = useRef({ l2: false, l3: false });
  const garlandFailedDropsRef = useRef(0);
  const garlandDragStartRef = useRef(null);
  const garlandMeaningfulDragRef = useRef(false);
  // Same fix as buildL2VoiceEndedAtRef above — L3 waits 8s after the L2
  // line finishes speaking, not a fixed 26s from arm.
  const garlandL2VoiceEndedAtRef = useRef(null);
  const garlandL2SpeakingRef = useRef(false);
  const [garlandL2EndTick, setGarlandL2EndTick] = useState(0);

  const effectiveGarlandHintLevel = Math.max(garlandHintLevel, forcedGarlandHintLevel);

  const startGarlandHintClock = useCallback((clearEscalation = false) => {
    garlandHintStartedAtRef.current = Date.now();
    garlandL2VoiceEndedAtRef.current = null;
    garlandL2SpeakingRef.current = false;
    setGarlandHintLevel(0);
    if (clearEscalation) {
      setForcedGarlandHintLevel(0);
      garlandFailedDropsRef.current = 0;
    }
    garlandHintVoPlayedRef.current = { l2: false, l3: false };
  }, []);

  useEffect(() => {
    if (!isReady || !isActive || isPaused || garlandPosition.active) return undefined;
    const tick = window.setInterval(() => {
      const startedAt = garlandHintStartedAtRef.current;
      if (!startedAt) return;
      const idleMs = Date.now() - startedAt;
      let nextLevel = 0;
      if (idleMs >= 18000) nextLevel = 2;
      else if (idleMs >= 10000) nextLevel = 1;
      if (nextLevel === 2 && garlandL2VoiceEndedAtRef.current) {
        if (Date.now() - garlandL2VoiceEndedAtRef.current >= 8000) nextLevel = 3;
      }
      setGarlandHintLevel((prev) => (prev === nextLevel ? prev : nextLevel));
    }, 250);
    return () => window.clearInterval(tick);
  }, [isReady, isActive, isPaused, garlandPosition.active]);

  useEffect(() => {
    if (!isReady) return;
    if (effectiveGarlandHintLevel >= 3 && !garlandHintVoPlayedRef.current.l3) {
      // Escalating to L3 (e.g. a 3rd failed drop) while the L2 line is still speaking must not
      // cut it off: wait. Finishing L2 bumps garlandL2EndTick, which re-runs this effect.
      if (garlandL2SpeakingRef.current) return;
      garlandHintVoPlayedRef.current.l3 = true;
      speak(VO.carryDirect);
      return;
    }
    if (effectiveGarlandHintLevel >= 2 && !garlandHintVoPlayedRef.current.l2) {
      garlandHintVoPlayedRef.current.l2 = true;
      garlandL2SpeakingRef.current = true;
      // The "ended" event is not always delivered by the browser, which would gate L3 forever —
      // so also stamp it after a time limit (pausable via `after`).
      let stamped = false;
      const stampEnded = () => {
        if (stamped) return;
        stamped = true;
        garlandL2SpeakingRef.current = false;
        garlandL2VoiceEndedAtRef.current = Date.now();
        setGarlandL2EndTick((tick) => tick + 1);
      };
      speakAsync(VO.carry).then(stampEnded);
      after(Math.max(4000, VO.carry.length * 90 + 2500), stampEnded);
    }
  }, [effectiveGarlandHintLevel, isReady, speak, speakAsync, after, garlandL2EndTick]);

  // Sidebar open = true pause: interrupt the line WITHOUT resolving it and disarm both
  // hint clocks. On close, replay it from the start, then start fresh 10/18/26 clocks —
  // but only for a clock that was running (a clock the resumed beat arms itself is left alone).
  const wasPausedRef = useRef(false);
  const wasBuildArmedRef = useRef(false);
  const wasGarlandArmedRef = useRef(false);
  useEffect(() => {
    if (isPaused) {
      if (!wasPausedRef.current) {
        wasBuildArmedRef.current = !!buildHintStartedAtRef.current;
        wasGarlandArmedRef.current = !!garlandHintStartedAtRef.current;
        buildHintStartedAtRef.current = null;
        buildL2VoiceEndedAtRef.current = null;
        garlandHintStartedAtRef.current = null;
        garlandL2VoiceEndedAtRef.current = null;
        setBuildHintLevel(0);
        setGarlandHintLevel(0);
        setForcedGarlandHintLevel(0);
        setCarryTeachingGesture(false);
      }
      interruptSpeech();
    } else if (wasPausedRef.current) {
      // A replayed carry line brings the carry hand back with it (it would otherwise be gone
      // after its first showing even though the instruction is spoken again).
      const replayText = interruptedSpeechRef.current?.text;
      // "ready" re-fires its own cue with the replayed line; only the carry hint lines need this.
      if (replayText && (replayText === VO.carry || replayText === VO.carryDirect)) {
        after(400, () => {
          setCarryTeachingGesture(true);
          after(3200, () => setCarryTeachingGesture(false));
        });
      }
      resumeSpeech(400, () => {
        if (wasBuildArmedRef.current && !buildHintStartedAtRef.current) startBuildHintClock();
        if (wasGarlandArmedRef.current && !garlandHintStartedAtRef.current) startGarlandHintClock(true);
        wasBuildArmedRef.current = false;
        wasGarlandArmedRef.current = false;
      });
    }
    wasPausedRef.current = isPaused;
  }, [isPaused, interruptSpeech, resumeSpeech, startBuildHintClock, startGarlandHintClock, after]);

  const liveSlots = GARLAND_SLOTS;
  const placedIds = useMemo(() => new Set(placedFlowers.map((item) => item.id)), [placedFlowers]);

  const buildIntroStartedRef = useRef(false);
  useEffect(() => {
    if (!isBuild || !isActive || buildIntroStartedRef.current) return undefined;
    buildIntroStartedRef.current = true;
    let cancelled = false;
    (async () => {
      await speakAsync(VO.open);
      if (cancelled) return;
      startBuildHintClock();
    })();
    return () => { cancelled = true; };
  }, [isBuild, isActive, speakAsync, startBuildHintClock]);

  // Measure the basket's position relative to the workspace once both are
  // mounted, then trigger the fly-out-to-loose-positions transition.
  useEffect(() => {
    if (!isBuild || flowersArrived || !isActive) return undefined;
    const t = after(250, () => {
      const basket = mooshikaRef.current;
      const workspace = workspaceRef.current;
      if (basket && workspace) {
        const basketRect = basket.getBoundingClientRect();
        const workspaceRect = workspace.getBoundingClientRect();
        const bx = ((basketRect.left + basketRect.width / 2 - workspaceRect.left) / workspaceRect.width) * 100;
        const by = ((basketRect.top + basketRect.height / 2 - workspaceRect.top) / workspaceRect.height) * 100;
        setBasketPct({ x: Math.max(0, Math.min(100, bx)), y: Math.max(0, Math.min(100, by)) });
      }
      requestAnimationFrame(() => setFlowersArrived(true));
    });
    return () => cancelTimer(t);
  }, [isBuild, flowersArrived, isActive, after, cancelTimer]);

  const threadFlower = (flower) => {
    if (!isBuild || !isActive || isPaused || !flowersArrived
      || threadingLock.current || placedIds.has(flower.id) || placedFlowers.length >= FLOWERS.length) return;
    silenceIntroVO();
    // A flower tap is the meaningful interaction — no wrong flower exists,
    // so every tap earns a fresh 10/18/26 window.
    startBuildHintClock();
    threadingLock.current = true;
    setThreadingFlower({ ...flower, slot: liveSlots[placedFlowers.length], slotIndex: placedFlowers.length });
  };

  useEffect(() => {
    if (!threadingFlower || !isBuild || !isActive) return;
    const timer = after(650, () => {
      setPlacedFlowers((current) => [...current, threadingFlower]);
      setThreadingFlower(null);
      threadingLock.current = false;
    });
    return () => cancelTimer(timer);
  }, [threadingFlower, isBuild, isActive, after, cancelTimer]);

  useEffect(() => {
    if (!isBuild || placedFlowers.length !== FLOWERS.length || !isActive) return;
    let cancelled = false;
    const timer = after(550, () => {
      // Keep the assembled flowers visible while the replacement art decodes.
      preparePose(completedGarland).then(async () => {
        if (cancelled) return;
        stopBuildHintClock();
        setPhase(PHASES.READY);

        // Drag is a new gesture after six tap interactions — teach it once
        // immediately, independent of (and overlapping) the ready VO.
        // The carry hand lands exactly when the action word ("Drag") of the line is spoken.
        await speakAsync(VO.ready, getLineCue('garland:ready', () => {
          setCarryTeachingGesture(true);
          after(3200, () => setCarryTeachingGesture(false));
        }));
        if (cancelled) return;
        // 10 / 18 / 26 begins only once the ready VO actually finishes.
        startGarlandHintClock(true);
      }).catch(() => {});
    });
    return () => { cancelled = true; cancelTimer(timer); };
  }, [isBuild, placedFlowers.length, isActive, speakAsync, stopBuildHintClock, startGarlandHintClock, after, cancelTimer]);

  const getScenePoint = (event) => {
    const scene = sceneRef.current;
    if (!scene) return null;
    const rect = scene.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  };
  const startGarlandDrag = (event) => {
    if (!isReady || isPaused) return;
    event.preventDefault();
    silenceIntroVO();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = getScenePoint(event);
    garlandDragStartRef.current = start;
    garlandMeaningfulDragRef.current = false;
    setCarryTeachingGesture(false);
    setGarlandPosition((prev) => ({ ...prev, active: true }));
  };
  const moveGarland = (event) => {
    if (!garlandPosition.active) return;
    const point = getScenePoint(event);
    if (!point) return;
    setGarlandPosition({ active: true, x: Math.max(5, Math.min(95, point.x)), y: Math.max(8, Math.min(92, point.y)) });

    if (!garlandMeaningfulDragRef.current && garlandDragStartRef.current) {
      const start = garlandDragStartRef.current;
      const distance = Math.hypot(point.x - start.x, point.y - start.y);
      if (distance >= 5) {
        garlandMeaningfulDragRef.current = true;
        // A genuine drag is an attempt, not progress: it restarts the idle window only when no
        // hint is showing — a visible L1/L2/L3 hint (hand + VO) stays until the garland is delivered.
        if (effectiveGarlandHintLevel < 1) startGarlandHintClock();
      }
    }
  };
  const endGarlandDrag = (event) => {
    if (!garlandPosition.active) return;
    const target = ganeshaDropRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const droppedOnGanesha = isPointInsideExpandedOval(event, rect, GANESHA_DROP_PAD);

    if (!droppedOnGanesha) {
      const wasMeaningful = garlandMeaningfulDragRef.current;
      garlandDragStartRef.current = null;
      garlandMeaningfulDragRef.current = false;
      setGarlandPosition({ x: 50, y: 55, active: false });

      if (wasMeaningful) {
        garlandFailedDropsRef.current += 1;
        const failures = garlandFailedDropsRef.current;
        // First real miss: quiet return.
        if (failures === 2) {
          setForcedGarlandHintLevel((level) => Math.max(level, 2));
        }
        if (failures >= 3) {
          setForcedGarlandHintLevel(3);
        }
      }

      // A missed drop is not progress: keep a visible hint; otherwise restart the idle window.
      if (effectiveGarlandHintLevel < 1) startGarlandHintClock();
      return;
    }

    garlandDragStartRef.current = null;
    garlandMeaningfulDragRef.current = false;
    garlandFailedDropsRef.current = 0;
    setGarlandPosition((prev) => ({ ...prev, active: false }));
    setPhase(PHASES.OFFERED);
    speak(VO.offered);
    // Matches the original pre-rework "modak above Mooshika" beat: a short
    // pause after the offering lands, then the golden Modak glows above
    // Mooshika for a moment before the real symbol reveal card takes over.
    after(1100, () => {
      setShowModakGlow(true);
    });
    after(3200, () => { onComplete?.(); });
  };

  if (!isActive) return null;

  const firstRemainingFlowerId = FLOWERS.find((flower) => !placedIds.has(flower.id))?.id;

  return (
    <div
      ref={sceneRef}
      className={`g3g ${isPaused ? 'g3g--paused' : ''} ${SHOW_HIT_ZONES ? 'g3g--show-hit-zones' : ''}`}
      style={{ backgroundImage: `url(${forestBackground})` }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {(() => {
        const carryFrom = { x: LAYOUT.workspace.l, y: LAYOUT.workspace.t };
        const carryTarget = { x: LAYOUT.ganesha.l, y: LAYOUT.ganesha.t };
        const carryPartialTarget = {
          x: carryFrom.x + (carryTarget.x - carryFrom.x) * 0.52,
          y: carryFrom.y + (carryTarget.y - carryFrom.y) * 0.52,
        };
        const carryGestureTarget = effectiveGarlandHintLevel >= 3 ? carryTarget : carryPartialTarget;
        const showCarryGesture = isReady && !garlandPosition.active
          && (carryTeachingGesture || effectiveGarlandHintLevel >= 2);
        return (
          <GestureDemo
            type="drag"
            from={carryFrom}
            to={carryGestureTarget}
            active={!isPaused && showCarryGesture}
            idleDelay={150}
            replayKey={effectiveGarlandHintLevel}
            zIndex={30}
          />
        );
      })()}

      {/* GANESHA */}
      <div
        ref={ganeshaDropRef}
        className={`g3g-ganesha ${isOffered ? 'g3g-ganesha--happy' : ''} ${isReady && effectiveGarlandHintLevel >= 3 ? 'g3g-ganesha--hint-target' : ''}`}
        style={{ left: `${LAYOUT.ganesha.l}%`, top: `${LAYOUT.ganesha.t}%` }}
      >
        {SHOW_HIT_ZONES && isReady && (
          <span className="g3g-ganesha-drop-zone-outline" aria-hidden="true">
            drop
          </span>
        )}
        <img src={ganesha} alt="Ganesha" />
      </div>

      {/* MOOSHIKA — basket empties visually once the 6 flowers have moved
          into the workspace. Stays on screen through the offering so the
          golden Modak has somewhere to glow above. */}
      {(!isOffered || showModakGlow) && (
        <div ref={mooshikaRef} className="g3g-mooshika" style={{ left: `${LAYOUT.mooshika.l}%`, top: `${LAYOUT.mooshika.t}%` }}>
          <img src={mooshikaBasket} alt="Mooshika" />
          {showModakGlow && (
            <div className="g3g-modak-satisfaction">
              <div className="g3g-modak-satisfaction-glow" aria-hidden="true" />
              <img src={symbolModakColored} alt="Golden Modak" className="g3g-modak-satisfaction-icon" />
            </div>
          )}
        </div>
      )}

      {/* GARLAND WORKSPACE */}
      {(isBuild || isReady) && (
        <div ref={workspaceRef} className="g3g-workspace" style={{ left: `${LAYOUT.workspace.l}%`, top: `${LAYOUT.workspace.t}%` }}>
          {isBuild && (
            <>
              <p className="g3g-instruction">Tap a flower to thread it</p>
              <img src={garlandString} alt="" className="g3g-string" />

              {placedFlowers.map((flower, index) => (
                <img
                  key={flower.id} src={flower.src} alt="" className="g3g-placed-flower"
                  style={{ left: `${liveSlots[index].x}%`, top: `${liveSlots[index].y}%` }}
                />
              ))}

              {FLOWERS.map((flower, index) => {
                if (placedIds.has(flower.id)) return null;
                const isThreading = threadingFlower?.id === flower.id;
                const origin = basketPct || { x: flower.x, y: flower.y };
                const x = isThreading ? liveSlots[threadingFlower.slotIndex].x : (flowersArrived ? flower.x : origin.x);
                const y = isThreading ? liveSlots[threadingFlower.slotIndex].y : (flowersArrived ? flower.y : origin.y);
                return (
                  <button
                    key={flower.id}
                    type="button"
                    className={`g3g-loose-flower ${isThreading ? 'is-threading' : ''} ${flowersArrived ? 'has-arrived' : ''} ${buildHintLevel === 1 ? 'g3g-build-hint-l1' : ''} ${buildHintLevel === 2 ? 'g3g-build-hint-l2' : ''} ${buildHintLevel >= 3 && flower.id === firstRemainingFlowerId ? 'g3g-build-hint-example' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%`, '--flower-delay': isThreading ? '0ms' : `${index * 70}ms` }}
                    onClick={() => threadFlower(flower)}
                    disabled={!flowersArrived || !!threadingFlower || isPaused}
                    aria-label={`Thread ${flower.src === flowerCream ? 'cream' : 'pink'} flower ${index + 1}`}
                  >
                    <img src={flower.src} alt="" />
                  </button>
                );
              })}

              {/* L3: a tap hand demonstrates on the first remaining flower (coordinates are the
                  flower's own % inside this workspace; the overlay fills the workspace box). */}
              {(() => {
                const target = FLOWERS.find((flower) => flower.id === firstRemainingFlowerId);
                if (!target || buildHintLevel < 3 || !flowersArrived || threadingFlower) return null;
                return (
                  <GestureDemo
                    type="tap"
                    from={{ x: target.x, y: target.y }}
                    active={!isPaused}
                    idleDelay={0}
                    iterations={2}
                    replayKey={buildHintLevel}
                    zIndex={30}
                  />
                );
              })()}
            </>
          )}

          {isReady && (
            <div className="g3g-completed-garland-stage">
              <button
                type="button"
                className={`g3g-completed-garland ${effectiveGarlandHintLevel === 1 ? 'g3g-hint-nudge' : ''}`}
                onPointerDown={startGarlandDrag}
                onPointerMove={moveGarland}
                onPointerUp={endGarlandDrag}
                onPointerCancel={() => {
                  garlandDragStartRef.current = null;
                  garlandMeaningfulDragRef.current = false;
                  setGarlandPosition({ x: 50, y: 55, active: false });
                  startGarlandHintClock();
                }}
                aria-label="Carry the garland to Ganesha"
              >
                <img src={completedGarland} alt="Garland" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* GARLAND BEING DRAGGED THROUGH THE WORLD */}
      {isReady && garlandPosition.active && (
        <button
          type="button"
          className="g3g-world-drag"
          style={{ left: `${garlandPosition.x}%`, top: `${garlandPosition.y}%` }}
          onPointerMove={moveGarland}
          onPointerUp={endGarlandDrag}
          onPointerCancel={() => {
            garlandDragStartRef.current = null;
            garlandMeaningfulDragRef.current = false;
            setGarlandPosition({ x: 50, y: 55, active: false });
            startGarlandHintClock();
          }}
        >
          <img src={completedGarland} alt="" />
        </button>
      )}

      {/* GARLAND OFFERED */}
      {isOffered && <img src={completedGarland} alt="" className="g3g-on-ganesha" />}
    </div>
  );
}
