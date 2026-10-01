import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
// zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx
// Eyes investigation game: a single story-led search — Monkey is hungry,
// Peacock is missing a feather. Find both camouflaged things at once.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import './EyesPopUpGame.css';

import bgImg from './assets/images/eyes-game/symbol_mountain_3_bg.webp';
import monkeyWorriedImg from './assets/images/eyes-game-v2/monkey_hungry_worried.webp';
import peacockWorriedImg from './assets/images/eyes-game-v2/peacock_worried_missing_feather.webp';
import monkeyHappyImg from './assets/images/eyes-game/monkey_04_smiles_holds_close.webp';
import peacockHappyImg from './assets/images/eyes-game/peacock_04_feather_highlight.webp';
import newFeatherBushImg from './assets/images/eyes-game-v2/new_feather_bush.webp';
import newMangoBushImg from './assets/images/eyes-game-v2/new_mango_bush.webp';
import featherFoundImg from './assets/images/eyes-game-v2/peacock_feather_single.webp';
import mangoFoundImg from './assets/images/eyes-game/mango.webp';
import yellowFlowerClusterImg from './assets/images/eyes-game-v2/yellow_flower_cluster.webp';
import { ANIMAL_POSITIONS } from './animalPositions';

const FLOW = {
  SEARCH: 'search',
  COMPLETE: 'complete'
};

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugEyes'));
const LAYOUT_STORAGE_KEY = 'symbol_mountain_eyes_layout_v2';
const LAYOUT_PRESET_VERSION = '2026-09-10-eyes-visual-flow-editor-layout-7';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52, z: 40 },
  feedback: { x: 50, y: 84, w: 40, z: 44 },
  tray: { x: 50, y: 93, w: 22, z: 42 },
  // Positions below (monkey/peacock/feather/mango/yellow-flowers) ported from
  // Madhurima's Visual Flow Editor layout (Beat 1 — "Search begins"). Both the
  // editor and this game center-anchor sprites (translate(-50%,-50%)), so the
  // editor's x/y/effective-width copy over directly — no top-left conversion
  // needed. The hidden-state (bush) sizes use the editor's "New feather/mango
  // bush" item widths, NOT the tiny "found" item widths — that mismatch is
  // what made the bushes render too small the first time. Butterfly and
  // cream-flowers were dropped from the authored layout entirely, so they're
  // removed below rather than kept in their old spots.
  monkeyCharacter: { x: 17.58, y: 38.74, w: 12, z: 15 },
  peacockCharacter: { x: 67.78, y: 43.58, w: 20.16, z: 15 },
  // The bushes are permanent scenery — they never disappear. Only the
  // feather/mango icon itself (rendered separately, invisible until tapped)
  // flies out to the peacock/monkey. targetFeather/targetMango below are
  // just the invisible tap hit-areas, sized to cover their bush.
  // Layering (back to front): bush1 (z12) -> the item itself (z13) -> the
  // front bush/flower (z14) that partially covers it. bush2/yellow-flowers
  // are pointer-events:none, so this doesn't block tapping the item.
  targetFeatherBush1: { x: 62.08, y: 66.76, w: 24, z: 12 },
  targetFeatherBush2: { x: 71.32, y: 66.9, w: 21.6, z: 14 },
  targetMangoBush: { x: 45.48, y: 45.81, w: 24, z: 12 },
  targetFeather: { x: 62.08, y: 66.76, w: 9.84, z: 13 },
  targetFeatherFound: { x: 62.08, y: 66.76, w: 9.84, z: 13 },
  targetMango: { x: 45.48, y: 45.81, w: 6, z: 13 },
  targetMangoFound: { x: 45.48, y: 45.81, w: 6, z: 13 },
  distractorYellowFlowers: { x: 46.07, y: 48.95, w: 11.28, z: 15 },
  // Open path space between monkey and peacock — NOT the mango bush's own
  // spot, which is what it overlapped before. Tunable so it can be nudged
  // to wherever reads as clearly "empty" on the actual background art.
  travelCenter: { x: 50, y: 64, w: 0, z: 29 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'monkeyCharacter', label: 'Monkey (worried)' },
  { key: 'peacockCharacter', label: 'Peacock (worried)' },
  { key: 'targetFeatherBush1', label: 'Feather bush (permanent)' },
  { key: 'targetFeatherBush2', label: 'Feather bush 2 (permanent)' },
  { key: 'targetFeather', label: 'Target - feather tap area (invisible)' },
  { key: 'targetFeatherFound', label: 'Target - feather found (small)' },
  { key: 'targetMangoBush', label: 'Mango bush (permanent)' },
  { key: 'targetMango', label: 'Target - mango tap area (invisible)' },
  { key: 'targetMangoFound', label: 'Target - mango found (small)' },
  { key: 'distractorYellowFlowers', label: 'Yellow flowers cover (permanent)' },
  { key: 'travelCenter', label: 'Travel pause point (open space)' }
];

const loadSavedLayout = () => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    if (saved.version !== LAYOUT_PRESET_VERSION || !saved.layout) return DEFAULT_LAYOUT;
    return Object.fromEntries(
      Object.entries(DEFAULT_LAYOUT).map(([key, fallback]) => [
        key,
        { ...fallback, ...(saved.layout[key] || {}) }
      ])
    );
  } catch {
    return DEFAULT_LAYOUT;
  }
};

const styleFromLayout = (layoutItem) => ({
  left: `${layoutItem.x}%`,
  top: `${layoutItem.y}%`,
  bottom: 'auto',
  width: `${layoutItem.w}%`,
  zIndex: layoutItem.z
});

const SEARCH_TARGETS = [
  {
    id: 'feather',
    label: 'Feather',
    // A small peek of the feather shows against the (permanent) bush — kids
    // need that visual cue to know where to look. Same art before and after
    // tap; only its size/position change (small-in-bush -> flying to Peacock).
    hiddenImg: featherFoundImg,
    foundImg: featherFoundImg,
    layoutKey: 'targetFeather',
    foundLayoutKey: 'targetFeatherFound',
    carryLayoutKey: 'peacockCharacter',
    prompt: 'Feather found! Peacock will be so happy.'
  },
  {
    id: 'mango',
    label: 'Mango',
    // Same idea — a small peek of the mango shows against its (permanent) bush.
    hiddenImg: mangoFoundImg,
    foundImg: mangoFoundImg,
    layoutKey: 'targetMango',
    foundLayoutKey: 'targetMangoFound',
    carryLayoutKey: 'monkeyCharacter',
    prompt: 'Mango found! Monkey is hungry no more.'
  }
];

// Yellow-flowers is decorative cover for the mango (same role as the
// feather's second bush) — NOT a tappable distractor. It used to be
// interactive, which meant raising it in front of the mango made it
// swallow taps meant for the mango underneath. Rendered separately below,
// pointer-events:none, like the bush props.
const DISTRACTORS = [];

const VO_TEXTS = {
  intro: 'Monkey is hungry, and Peacock has lost a special feather. Look carefully. Can you find what they need?',
  complete: 'You looked closely and found them both!',
  neutral: 'That is interesting, but it is not what they are looking for.',
  feather: 'Feather found! Peacock will be so happy.',
  mango: 'Mango found! Monkey is hungry no more.',
  findFeather: 'Now find the feather.',
  findMango: 'Now find the mango.',
  // L2 — narrows the search without naming the object.
  idleHintL2: 'Look near the bushes. Something is peeking out.',
  // L3 — generic direct instruction, points at whichever bushes are still
  // glowing rather than naming one specific remaining object. Monkey and
  // Peacock are both still waiting, so both bushes pulse together.
  idleHintL3: 'Tap the glowing bushes.'
};

const IDLE_HINT_MS = 10000;
const IDLE_HINT_L2_MS = 18000;
const IDLE_HINT_L3_MS = 26000;
// Repeated unsuccessful searching (background taps) accelerates help —
// a child randomly tapping the forest is exactly who needs it, so
// exploration attempts must not just restart the idle clock.
const MISS_COUNT_FOR_L2 = 3;
const MISS_COUNT_FOR_L3 = 6;

const speakFallback = (text, onEnd) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis is optional.
    onEnd?.();
  }
};

const POSE_ASSETS = [bgImg, monkeyWorriedImg, peacockWorriedImg, monkeyHappyImg, peacockHappyImg, newFeatherBushImg, newMangoBushImg, featherFoundImg, mangoFoundImg, yellowFlowerClusterImg];

const EyesPopUpGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  hideElements = false,
  className = '',
  stopVoice,
  isPaused = false
}) => {
  usePreloadPoses(POSE_ASSETS);
  const [flow, setFlow] = useState(FLOW.SEARCH);
  // Self-managed fade so the parent scene's abrupt unmount (swapping to the
  // symbol reveal) never reads as a sudden cut — by the time onGameComplete
  // actually fires, this scene has already faded to transparent on its own.
  const [isExiting, setIsExiting] = useState(false);
  const [foundTargets, setFoundTargets] = useState([]);
  const [centeredTargets, setCenteredTargets] = useState([]);
  const [carriedTargets, setCarriedTargets] = useState([]);
  const [deliveredTargets, setDeliveredTargets] = useState([]);
  const [goneTargets, setGoneTargets] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [softPulse, setSoftPulse] = useState(null);
  // idleHintStage comes from the 10/18/26 clock; forcedHintStage escalates
  // from repeated unsuccessful searching (background taps) so a child who
  // keeps missing doesn't have to wait out the full ladder.
  const [idleHintStage, setIdleHintStage] = useState(0);
  const [forcedHintStage, setForcedHintStage] = useState(0);
  const hintStage = Math.max(idleHintStage, forcedHintStage);
  const lastSpokenHintKeyRef = useRef(null);
  const missCountRef = useRef(0);
  // Idle clock must not start while the intro or a success VO is still
  // speaking — armed only once that VO's onEnd fires.
  const idleClockArmedRef = useRef(false);
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('targetFeather');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const idleTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const carryTimersRef = useRef([]);
  const lastTapTimeRef = useRef(Date.now());
  // When the L2 hint line finished speaking — L3's 8s gap counts from THIS,
  // not from lastTapTimeRef, so a slow L2 line doesn't eat into the real
  // gap the child gets before L3 fires.
  const l2VoiceEndedAtRef = useRef(null);
  const completedRef = useRef(false);
  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  // Sidebar = true pause: game timers freeze (resume with remaining time) and the
  // current line is interrupted + replayed — see the isPaused effect below.
  const { after, cancel: cancelTimer } = usePausableTimers(isPaused);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;
  const activeSpeechRef = useRef(null);       // { text, onEnd, dead }
  const interruptedSpeechRef = useRef(null);
  const replayTimerRef = useRef(null);
  const pendingReplayRef = useRef(null);
  const l2SpeakingRef = useRef(false);
  const [l2EndTick, setL2EndTick] = useState(0);
  const wasPausedRef = useRef(false);
  const wasArmedRef = useRef(false);

  const foundIds = useMemo(() => new Set(foundTargets), [foundTargets]);
  const centeredIds = useMemo(() => new Set(centeredTargets), [centeredTargets]);
  const carriedIds = useMemo(() => new Set(carriedTargets), [carriedTargets]);
  const deliveredIds = useMemo(() => new Set(deliveredTargets), [deliveredTargets]);
  const goneIds = useMemo(() => new Set(goneTargets), [goneTargets]);
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];

  const stopTimers = useCallback(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (completionTimerRef.current) cancelTimer(completionTimerRef.current);
    carryTimersRef.current.forEach((timer) => cancelTimer(timer));
    carryTimersRef.current = [];
    idleTimerRef.current = null;
    feedbackTimerRef.current = null;
    completionTimerRef.current = null;
  }, [cancelTimer]);

  const schedule = useCallback((fn, delay) => {
    const timer = after(delay, () => {
      carryTimersRef.current = carryTimersRef.current.filter((item) => item !== timer);
      fn();
    });
    carryTimersRef.current.push(timer);
    return timer;
  }, [after]);

  const speak = useCallback((text, onEnd) => {
    if (!isAudioOn) {
      onEnd?.();
      return;
    }
    const entry = { text, onEnd, dead: false };
    // A line requested while the sidebar is open must not speak behind it — queue it
    // as the interrupted line so it plays, from the start, when the sidebar closes.
    if (pausedRef.current) {
      interruptedSpeechRef.current = entry;
      return;
    }
    const done = () => {
      if (entry.dead) return;
      // A cancel-triggered end that arrives while paused is an interruption, not a
      // finish: remember the line instead of letting the game advance behind the sidebar.
      if (pausedRef.current) {
        entry.dead = true;
        interruptedSpeechRef.current = entry;
        return;
      }
      entry.dead = true;
      if (activeSpeechRef.current === entry) activeSpeechRef.current = null;
      onEnd?.();
    };
    activeSpeechRef.current = entry;
    // Stop the parent scene's own voice engine first — its MP3 audio element
    // isn't touched by window.speechSynthesis.cancel() below, so without this
    // a still-playing scene VO keeps going under this mini-game's line.
    stopVoice?.();
    speakFallback(text, done);
  }, [isAudioOn, stopVoice]);

  // Sidebar open = true pause: interrupt the current line WITHOUT firing its onEnd and
  // disarm the idle clock. On close: after a beat, replay the interrupted line from the
  // start (its onEnd fires then, so the game continues), then start a fresh 10/18/26 clock.
  useEffect(() => {
    if (isPaused) {
      if (!wasPausedRef.current) {
        wasArmedRef.current = idleClockArmedRef.current;
        idleClockArmedRef.current = false;
        l2VoiceEndedAtRef.current = null;
        setIdleHintStage(0);
        setForcedHintStage(0);
        const active = activeSpeechRef.current;
        if (active && !active.dead) {
          active.dead = true;
          interruptedSpeechRef.current = active;
        }
        activeSpeechRef.current = null;
        if (replayTimerRef.current) {
          clearTimeout(replayTimerRef.current);
          replayTimerRef.current = null;
          // Sidebar reopened inside the 400ms settle window: the line waiting to replay must
          // go back to "interrupted", or its onEnd never fires and the game/hint clock stalls.
          if (pendingReplayRef.current && !interruptedSpeechRef.current) {
            interruptedSpeechRef.current = pendingReplayRef.current;
          }
          pendingReplayRef.current = null;
        }
        try { window.speechSynthesis?.cancel(); } catch { /* no-op */ }
      }
    } else if (wasPausedRef.current) {
      const entry = interruptedSpeechRef.current;
      interruptedSpeechRef.current = null;
      const rearm = () => {
        if (wasArmedRef.current && !idleClockArmedRef.current) {
          idleClockArmedRef.current = true;
          lastTapTimeRef.current = Date.now();
          lastSpokenHintKeyRef.current = null;
        }
        wasArmedRef.current = false;
      };
      if (entry) {
        pendingReplayRef.current = entry;
        replayTimerRef.current = setTimeout(() => {
          replayTimerRef.current = null;
          pendingReplayRef.current = null;
          speak(entry.text, () => { entry.onEnd?.(); rearm(); });
        }, 400);
      } else {
        rearm();
      }
    }
    wasPausedRef.current = isPaused;
  }, [isPaused, speak]);

  const showFeedback = useCallback((message, pulseId = null) => {
    setFeedback(message);
    setSoftPulse(pulseId);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
      setSoftPulse(null);
    }, 1500);
  }, []);

  // A genuine find earns a fresh window and clears the error streak —
  // distinct from a background tap, which must NOT reset the clock.
  const resetIdle = useCallback(() => {
    lastTapTimeRef.current = Date.now();
    setIdleHintStage(0);
    setForcedHintStage(0);
    lastSpokenHintKeyRef.current = null;
    l2SpeakingRef.current = false;
    missCountRef.current = 0;
  }, []);

  const saveLayout = useCallback((nextLayout) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({
        version: LAYOUT_PRESET_VERSION,
        layout: nextLayout
      }));
    } catch {
      // Local storage is optional in the dev harness.
    }
  }, []);

  const updateLayout = useCallback((key, patch) => {
    setLayout((current) => {
      const next = {
        ...current,
        [key]: {
          ...(current[key] || DEFAULT_LAYOUT[key]),
          ...patch
        }
      };
      saveLayout(next);
      return next;
    });
  }, [saveLayout]);

  const updateLayoutField = useCallback((key, field, value) => {
    const max = field === 'z' ? 80 : 100;
    const numeric = Math.max(0, Math.min(max, Number(value)));
    updateLayout(key, { [field]: numeric });
  }, [updateLayout]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
      } catch {
        // no-op
      }
    }
  }, []);

  const copyLayoutJson = useCallback(async () => {
    const payload = JSON.stringify({ version: LAYOUT_PRESET_VERSION, layout }, null, 2);
    try {
      await navigator.clipboard?.writeText(payload);
      setLayoutCopyStatus('Copied');
    } catch {
      window.prompt?.('Copy Eyes layout JSON', payload);
      setLayoutCopyStatus('Shown');
    }
    if (import.meta.env.DEV) console.log('Eyes layout JSON:', payload);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setLayoutCopyStatus(''), 1500);
  }, [layout]);

  const getPointerPercent = useCallback((event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return null;
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }, []);

  const startDebugDrag = useCallback((event, key) => {
    if (!debugMode) return;
    const point = getPointerPercent(event);
    const item = layout[key] || DEFAULT_LAYOUT[key];
    if (!point || !item) return;
    event.stopPropagation();
    debugDragRef.current = {
      key,
      offsetX: point.x - item.x,
      offsetY: point.y - item.y
    };
    setSelectedDebugKey(key);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugMode, getPointerPercent, layout]);

  const handleDebugPointerMove = useCallback((event) => {
    const drag = debugDragRef.current;
    if (!drag) return;
    const point = getPointerPercent(event);
    if (!point) return;
    event.stopPropagation();
    updateLayout(drag.key, {
      x: Number(Math.max(0, Math.min(100, point.x - drag.offsetX)).toFixed(2)),
      y: Number(Math.max(0, Math.min(100, point.y - drag.offsetY)).toFixed(2))
    });
  }, [getPointerPercent, updateLayout]);

  const stopDebugDrag = useCallback(() => {
    debugDragRef.current = null;
  }, []);

  const startDebugPanelDrag = useCallback((event) => {
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugPanelPosition.x, debugPanelPosition.y]);

  const moveDebugPanelDrag = useCallback((event) => {
    const drag = debugPanelDragRef.current;
    if (!drag) return;
    const panelWidth = Math.min(352, window.innerWidth - 24);
    const panelHeight = debugMode ? Math.min(window.innerHeight * 0.78, 560) : 48;
    setDebugPanelPosition({
      x: Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - drag.offsetX)),
      y: Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - drag.offsetY))
    });
  }, [debugMode]);

  const stopDebugPanelDrag = useCallback(() => {
    debugPanelDragRef.current = null;
  }, []);

  useEffect(() => {
    if (!isActive) return;
    stopTimers();
    completedRef.current = false;
    setFlow(FLOW.SEARCH);
    setFoundTargets([]);
    setCenteredTargets([]);
    setCarriedTargets([]);
    setDeliveredTargets([]);
    setGoneTargets([]);
    setFeedback('');
    setSoftPulse(null);
    setIdleHintStage(0);
    setForcedHintStage(0);
    lastSpokenHintKeyRef.current = null;
    missCountRef.current = 0;
    idleClockArmedRef.current = false;
    l2VoiceEndedAtRef.current = null;
    // The 10/18/26 clock starts only once the intro VO actually finishes —
    // never while the child is still being told what to look for.
    speak(VO_TEXTS.intro, () => {
      idleClockArmedRef.current = true;
      lastTapTimeRef.current = Date.now();
    });
  }, [isActive, speak, stopTimers]);

  const nextHintTarget = useMemo(
    () => SEARCH_TARGETS.find((target) => !foundIds.has(target.id)) || null,
    [foundIds]
  );

  useEffect(() => {
    if (!isActive || flow === FLOW.COMPLETE) return;

    idleTimerRef.current = setInterval(() => {
      if (!idleClockArmedRef.current || pausedRef.current) return;

      const idleMs = Date.now() - lastTapTimeRef.current;
      if (idleMs < IDLE_HINT_MS) {
        setIdleHintStage(0);
        return;
      }

      // L3 is an 8s gap AFTER the L2 line finishes speaking, not a fixed
      // 26s-from-arm mark.
      if (idleMs >= IDLE_HINT_L2_MS && l2VoiceEndedAtRef.current && (Date.now() - l2VoiceEndedAtRef.current) >= (IDLE_HINT_L3_MS - IDLE_HINT_L2_MS)) {
        setIdleHintStage(3);
      } else if (idleMs >= IDLE_HINT_L2_MS) {
        setIdleHintStage(2);
      } else {
        setIdleHintStage(1);
      }
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    };
  }, [foundIds, flow, isActive, speak]);

  // L2 = narrow the search area (generic, no object named). L3 = exact
  // object + direct tap instruction. Spoken once per (target, level) pair.
  useEffect(() => {
    if (!isActive || flow === FLOW.COMPLETE || hintStage < 2 || !nextHintTarget) return;

    const key = `${nextHintTarget.id}-${hintStage}`;
    if (lastSpokenHintKeyRef.current === key) return;
    // Escalating to L3 (repeated misses) while the L2 line is still speaking must not cut it off:
    // wait. Finishing L2 bumps l2EndTick, which re-runs this effect.
    if (hintStage >= 3 && l2SpeakingRef.current) return;
    lastSpokenHintKeyRef.current = key;

    if (hintStage === 2) {
      l2SpeakingRef.current = true;
      // The browser does not always deliver the "ended" event, which would gate L3 forever — so
      // also stamp it after a time limit (pausable via `after`).
      let stamped = false;
      const stampEnded = () => {
        if (stamped) return;
        stamped = true;
        l2SpeakingRef.current = false;
        l2VoiceEndedAtRef.current = Date.now();
        setL2EndTick((tick) => tick + 1);
      };
      speak(VO_TEXTS.idleHintL2, stampEnded);
      after(Math.max(4000, VO_TEXTS.idleHintL2.length * 90 + 2500), stampEnded);
    } else {
      speak(VO_TEXTS.idleHintL3);
    }
  }, [hintStage, nextHintTarget, isActive, flow, speak, after, l2EndTick]);

  useAppVisibility(null, useCallback(() => {
    resetIdle();
  }, [resetIdle]));

  useEffect(() => () => {
    stopTimers();
    if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, [stopTimers]);

  useEffect(() => {
    // Wait for the LAST tapped target's own staged journey (hold -> glide to
    // center -> glide to its animal -> pose change, ~3.6s) to actually
    // finish before starting the completion sequence — otherwise a mango
    // tapped as the second/last find gets cut off mid-flight the instant it
    // lands in the center, because foundTargets already satisfied this
    // effect's old condition right when the tap happened.
    if (goneTargets.length !== SEARCH_TARGETS.length || completedRef.current) return;
    completedRef.current = true;
    setFlow(FLOW.COMPLETE);

    // Let the scene sit for a beat after the last animal settles, then
    // speak the completion line and only hand off to onGameComplete once
    // that line has actually finished — a fixed 1500ms timer was cutting
    // "You looked closely and found them both!" (~3.3s) off mid-sentence.
    completionTimerRef.current = after(500, () => {
      speak(VO_TEXTS.complete, () => {
        completionTimerRef.current = after(900, () => {
          setIsExiting(true);
          completionTimerRef.current = after(600, () => {
            const assignedSpots = {
              monkey: ANIMAL_POSITIONS.monkey,
              peacock: ANIMAL_POSITIONS.peacock
            };

            onGameComplete?.({
              discoveredClues: foundTargets,
              discoveredAnimals: foundTargets,
              totalDiscovered: foundTargets.length,
              assignedSpots
            });
          });
        });
      });
    });

    return () => {
      if (completionTimerRef.current) cancelTimer(completionTimerRef.current);
    };
  }, [goneTargets, foundTargets, onGameComplete, speak, after, cancelTimer]);

  // An empty/background tap is exploration, not a mistake to punish — but a
  // child who keeps missing is exactly who needs help sooner, so misses
  // accelerate the hint ladder instead of resetting its clock.
  const registerMiss = useCallback(() => {
    missCountRef.current += 1;
    if (missCountRef.current >= MISS_COUNT_FOR_L3) {
      setForcedHintStage(3);
    } else if (missCountRef.current >= MISS_COUNT_FOR_L2) {
      setForcedHintStage((stage) => Math.max(stage, 2));
    }
  }, []);

  const handleSceneTap = useCallback((e) => {
    if (debugMode || flow === FLOW.COMPLETE) return;
    registerMiss();

    const rect = e.currentTarget.getBoundingClientRect();
    const shimmer = document.createElement('div');
    shimmer.className = 'eyes-popup-shimmer';
    shimmer.style.left = `${e.clientX - rect.left}px`;
    shimmer.style.top = `${e.clientY - rect.top}px`;
    e.currentTarget.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 650);
  }, [debugMode, flow, registerMiss]);

  const handleDistractorTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow === FLOW.COMPLETE) return;
    registerMiss();
    showFeedback(VO_TEXTS.neutral, target.id);
    speak(VO_TEXTS.neutral);
  }, [debugMode, flow, registerMiss, showFeedback, speak]);

  const handleTargetTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow === FLOW.COMPLETE || foundIds.has(target.id)) return;

    // Freeze the idle clock for the found-animation + success VO, then
    // start a fresh 10/18/26 window for whatever's left once that VO ends
    // — never mid-sentence.
    idleClockArmedRef.current = false;
    l2VoiceEndedAtRef.current = null;
    setIdleHintStage(0);
    setForcedHintStage(0);
    missCountRef.current = 0;

    const remainingTarget = SEARCH_TARGETS.find((item) => item.id !== target.id && !foundIds.has(item.id));
    const isFinalFind = !remainingTarget;

    setFoundTargets((prev) => [...prev, target.id]);
    speak(VO_TEXTS[target.id] || target.label, () => {
      if (!isFinalFind) {
        const promptKey = remainingTarget.id === 'feather' ? 'findFeather' : 'findMango';
        speak(VO_TEXTS[promptKey], () => {
          idleClockArmedRef.current = true;
          lastTapTimeRef.current = Date.now();
        });
        return;
      }
      idleClockArmedRef.current = true;
      lastTapTimeRef.current = Date.now();
    });

    // Slower, staged journey so kids can actually follow it: hold in place
    // to register the find -> glide to the center of the scene (900ms,
    // matches the CSS transition) -> pause there -> glide to the animal
    // (another 900ms) -> only once it's actually ARRIVED does the animal's
    // pose change -> brief hold -> icon disappears, leaving just the
    // resolved animal.
    schedule(() => setCenteredTargets((prev) => [...prev, target.id]), 700); // hold, then start gliding to center
    schedule(() => setCarriedTargets((prev) => [...prev, target.id]), 2100); // 700 + 900 glide + 500 pause at center
    schedule(() => setDeliveredTargets((prev) => [...prev, target.id]), 3000); // 2100 + 900 glide to animal
    schedule(() => setGoneTargets((prev) => [...prev, target.id]), 3600); // 3000 + 600 hold after pose change
  }, [debugMode, flow, foundIds, schedule, speak]);

  if (hideElements || !isActive) return null;

  const monkeyImg = deliveredIds.has('mango') ? monkeyHappyImg : monkeyWorriedImg;
  const peacockImg = deliveredIds.has('feather') ? peacockHappyImg : peacockWorriedImg;

  return (
    <div
      ref={stageRef}
      className={`eyes-popup-game ${className} ${debugMode ? 'is-debugging' : ''} ${isExiting ? 'is-exiting' : ''} ${isPaused ? 'is-paused' : ''}`}
      onClick={handleSceneTap}
      onPointerMove={handleDebugPointerMove}
      onPointerUp={stopDebugDrag}
      onPointerLeave={stopDebugDrag}
    >
      <img className="eyes-game-bg" src={bgImg} alt="" draggable={false} />

      <PoseImage
        className={`eyes-story-character ${debugMode && selectedDebugKey === 'monkeyCharacter' ? 'is-debug-selected' : ''}`}
        src={monkeyImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.monkeyCharacter)}
        onPointerDown={(e) => startDebugDrag(e, 'monkeyCharacter')}
      />
      <PoseImage
        className={`eyes-story-character ${debugMode && selectedDebugKey === 'peacockCharacter' ? 'is-debug-selected' : ''}`}
        src={peacockImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.peacockCharacter)}
        onPointerDown={(e) => startDebugDrag(e, 'peacockCharacter')}
      />

      {/* Permanent scenery — the bushes never disappear. Only the feather/
          mango icon itself flies out to the peacock/monkey once tapped.
          L1: remaining hiding areas breathe as a group (no VO, no reveal).
          L2: ALL remaining bushes pulse together (generic "tap the glowing
          bushes" instead of naming one specific object). */}
      <img
        className={`eyes-hiding-prop ${!foundIds.has('feather') && hintStage === 1 ? 'eyes-search-area-hint' : ''} ${!foundIds.has('feather') && hintStage === 2 ? 'eyes-search-area-hint-strong' : ''} ${debugMode && selectedDebugKey === 'targetFeatherBush1' ? 'is-debug-selected' : ''}`}
        src={newFeatherBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetFeatherBush1)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetFeatherBush1')}
      />
      <img
        className={`eyes-hiding-prop ${!foundIds.has('feather') && hintStage === 1 ? 'eyes-search-area-hint' : ''} ${!foundIds.has('feather') && hintStage === 2 ? 'eyes-search-area-hint-strong' : ''} ${debugMode && selectedDebugKey === 'targetFeatherBush2' ? 'is-debug-selected' : ''}`}
        src={newFeatherBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetFeatherBush2)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetFeatherBush2')}
      />
      <img
        className={`eyes-hiding-prop ${!foundIds.has('mango') && hintStage === 1 ? 'eyes-search-area-hint' : ''} ${!foundIds.has('mango') && hintStage === 2 ? 'eyes-search-area-hint-strong' : ''} ${debugMode && selectedDebugKey === 'targetMangoBush' ? 'is-debug-selected' : ''}`}
        src={newMangoBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetMangoBush)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetMangoBush')}
      />
      {/* Decorative flower cover over the mango — pointer-events:none like the
          bushes, so it can sit visually in front without blocking the tap. */}
      <img
        className={`eyes-hiding-prop ${debugMode && selectedDebugKey === 'distractorYellowFlowers' ? 'is-debug-selected' : ''}`}
        src={yellowFlowerClusterImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.distractorYellowFlowers)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'distractorYellowFlowers')}
      />

      {SEARCH_TARGETS.map((target) => {
        const isFound = foundIds.has(target.id);
        const isCentered = centeredIds.has(target.id);
        const isCarried = carriedIds.has(target.id);
        const isGone = goneIds.has(target.id);
        if (isGone) return null;

        // Width/z always come from the found-or-hidden size; only the
        // x/y differ across the found -> centered -> carried journey, so
        // the icon doesn't jump size mid-flight.
        const sizeKey = isFound ? target.foundLayoutKey : target.layoutKey;
        const sizeLayout = layout[sizeKey];
        const pos = isCarried
          ? layout[target.carryLayoutKey]
          : isCentered
            ? layout.travelCenter
            : sizeLayout;

        return (
          <button
            key={target.id}
            type="button"
            className={`eyes-hidden-target clue-target ${isFound ? 'found' : ''} ${isCarried ? 'carried' : ''} ${!isFound && hintStage >= 3 ? 'hinting-strong' : ''} ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === sizeKey ? 'is-debug-selected' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${sizeLayout.w}%`,
              zIndex: sizeLayout.z,
              aspectRatio: '1 / 1'
            }}
            onClick={(e) => handleTargetTap(target, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, sizeKey)}
            aria-label={`Find ${target.label}`}
            disabled={!debugMode && isFound}
          >
            {(isFound ? target.foundImg : target.hiddenImg) && (
              <PoseImage src={isFound ? target.foundImg : target.hiddenImg} alt="" draggable={false} />
            )}
          </button>
        );
      })}

      {DISTRACTORS.map((target) => (
        <button
          key={target.id}
          type="button"
          className={`eyes-hidden-target distractor-target ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === target.layoutKey ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout[target.layoutKey])}
          onClick={(e) => handleDistractorTap(target, e)}
          onPointerDown={(e) => debugMode && startDebugDrag(e, target.layoutKey)}
          aria-label={target.label}
        >
          <img src={target.img} alt="" draggable={false} />
        </button>
      ))}


      {(feedback || debugMode) && (
        <div
          className={`eyes-soft-feedback ${debugMode && selectedDebugKey === 'feedback' ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout.feedback)}
          onPointerDown={(e) => startDebugDrag(e, 'feedback')}
        >
          {feedback || 'Feedback'}
        </div>
      )}

      {DEBUG_UI_ENABLED && (
        <div
          className={`eyes-debug-panel ${debugMode ? 'is-open' : ''}`}
          style={{ left: debugPanelPosition.x, top: debugPanelPosition.y }}
          onPointerMove={moveDebugPanelDrag}
          onPointerUp={stopDebugPanelDrag}
          onPointerLeave={stopDebugPanelDrag}
        >
          <button
            type="button"
            className="eyes-debug-toggle"
            onClick={() => setDebugMode((value) => !value)}
          >
            {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
          </button>

          {debugMode && (
            <div className="eyes-debug-body">
              <button
                type="button"
                className="eyes-debug-drag-handle"
                onPointerDown={startDebugPanelDrag}
              >
                Drag panel
              </button>
              <div className="eyes-debug-section-title">Scene Objects</div>
              <p className="eyes-debug-note">Drag any object in the scene, or tune exact values here.</p>

              <label className="eyes-debug-row">
                <span>Element</span>
                <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                  {DEBUG_KEYS.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              {['x', 'y', 'w', 'z'].map((field) => (
                <label key={field} className="eyes-debug-row">
                  <span>{field.toUpperCase()}</span>
                  <input
                    type="range"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                </label>
              ))}

              <div className="eyes-debug-actions">
                <button type="button" onClick={copyLayoutJson}>
                  {layoutCopyStatus || 'Copy JSON'}
                </button>
                <button type="button" onClick={resetLayout}>Reset</button>
              </div>

              <pre className="eyes-debug-readout">{JSON.stringify({ [selectedDebugKey]: selectedDebugLayout }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EyesPopUpGame;
