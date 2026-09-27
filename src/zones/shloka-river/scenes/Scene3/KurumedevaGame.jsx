import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './KurumedevaGame.css';

import bgImg from './assets/images/nirvighnam/bg.png';

// Bridge redesign v2 (Kurume Deva) — no more solo try/fail beats. The child
// asks Elephant for help (logs appear), asks Monkey for help (rope appears,
// same image — the pack has no separate "tied" art), then Beaver alone lays
// 3 planks on top to finish the bridge.
import elephantPullImg from './assets/images/bridge/Characters/elephant-pulling.webp';
import elephantHappyImg from './assets/images/bridge/Characters/elephant-happy.webp';
import elephantIdleBananaImg from './assets/images/bridge/Characters/elephant-idle-banana.webp';
import elephantApproachingImg from './assets/images/bridge/Characters/elephant-approaching-walking.webp';
import helpBubbleElephantImg from './assets/images/bridge/Characters/help-bubble-elephant-logs.webp';
import monkeyTyingImg from './assets/images/bridge/Characters/monkey-tying.webp';
import monkeyHappyImg from './assets/images/bridge/Characters/monkey-happy.webp';
import monkeyPlayingTwigImg from './assets/images/bridge/Characters/monkey-playing-twig.webp';
import monkeyIdleImg from './assets/images/bridge/Characters/monkey-idle.webp';
import helpBubbleMonkeyImg from './assets/images/bridge/Characters/help-bubble-monkey-knot.webp';

import plankObj from './assets/images/bridge/Bridge/bridge-single-plank.webp';
// Small resting piles shown near each friend BEFORE they help — a visual cue
// for what they're about to bring, since nothing else hints "logs" vs "rope".
import logPileObj from './assets/images/bridge/Bridge/bridge-support-logs.webp';
import ropePileObj from './assets/images/bridge/Bridge/rope-knot.webp';

// Explicit bridge-state images: step1 = bare support logs (after Elephant),
// step2 = logs + rope tied (after Monkey) — this stays as the base art while
// the 3 planks are dragged on top of it, right through to the finished bridge.
import bridgeStep1Img from './assets/images/Kurumedeva/step1.png';
import bridgeStep2Img from './assets/images/Kurumedeva/step2.png';

import beaverAskingImg from './assets/images/bridge/Characters/beaver-asking.webp';
import beaverIdleWorriedImg from './assets/images/bridge/Characters/beaver-idle-worried.webp';
import beaverPlacingPlankImg from './assets/images/bridge/Characters/beaver-placing-plank.webp';
import beaverCrossingImg from './assets/images/bridge/Characters/beaver-crossing.webp';
import babyBeaverWavingImg from './assets/images/bridge/Characters/baby-beaver-waving.webp';
import beaverBabyReunionImg from './assets/images/bridge/Characters/beaver-baby-reunion.webp';
import helpHandIconImg from './assets/images/Kurumedeva/help-hand-icon.png';

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugKuru'));

const SYLLABLES = ['Ku', 'ru', 'me', 'deva'];
const HELP_TOKEN_HOME = { l: 77.2, t: 60.7 };

// Play order = build order: ask Elephant (logs appear), ask Monkey (rope
// appears), then Beaver alone lays the planks — no third helper.
const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    label: 'Elephant',
    carryImg: elephantIdleBananaImg, // idle, eating a banana, before being asked
    walkingImg: elephantApproachingImg, // walking over after the ask
    helpingImg: elephantPullImg, // helping settle the logs into place
    emptyImg: elephantHappyImg,
    helpBubbleImg: helpBubbleElephantImg,
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    label: 'Monkey',
    carryImg: monkeyPlayingTwigImg, // idle, playing with a twig, before being asked
    walkingImg: monkeyIdleImg, // calm transition pose while responding/approaching
    helpingImg: monkeyTyingImg, // tying the rope
    emptyImg: monkeyHappyImg,
    helpBubbleImg: helpBubbleMonkeyImg,
  },
];

const AUDIO = { syllables: ['ku', 'ru', 'me', 'deva'] };
// Elephant lights 1 syllable (Ku), Monkey lights the 2nd (Ru), the finished
// plank round lights the rest (me + deva) — matches the child's rhythm of
// two "ask for help" beats followed by one "finish it yourself" beat.
const SYLLABLES_LIT_AFTER_STEP = [1, 2, 4];
// 2 ask-for-help rounds (Elephant, Monkey) + 1 non-gated finishing round
// (Beaver lays the planks alone) = 3 stages total.
const TOTAL_ROUNDS = 3;
const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;
// Friend tap hitbox is enlarged vs. the visible sprite for touch forgiveness —
// KurumedevaGame.css compensates by sizing the <img> at 1/KURU_HIT_SCALE (62.5%).
const KURU_HIT_SCALE = 1.6;
const WAIT_SPOTS = [
  { l: 18, t: 62 },
  { l: 24, t: 68 },
];
// Where each friend stands while it "helps" (beside the bridge, not just at
// the gap), and where it walks to once its part is done.
const HELPER_SPOTS = [
  { l: 40.7, t: 66 },
  { l: 56.6, t: 68 },
];
const WALK_TO_MS = 1000; // amble to the bridge
const HELP_SETTLE_MS = 900; // stand and help before the bridge art updates
const WALK_BACK_MS = 1050; // amble to the bank line

// --- Plank round: the child drags 3 planks onto the finished-logs bridge ----
const PLANK_PILE = { l: 31.7, t: 56.9 };
// 3 deck sections — Canva planks 513.5x324.6 px on the 2048x1536 page.
const PLANK_SLOTS = [
  { l: 40.7, t: 72.4, r: 0 },
  { l: 56.6, t: 75.5, r: 0 },
  { l: 70.6, t: 78.2, r: -1 },
];
const PLANK_SLOT_W = 18.9;
const PLANK_DROP_RADIUS = 18; // forgiving snap to the active slot
// Anywhere over the gap counts as "close enough" for little hands.
const GAP_ZONE = { l0: 40, l1: 84, t0: 58, t1: 84 };

// Resting piles — visible from scene start next to each friend, so a child
// can see "logs" vs "rope" before ever asking for help. Each disappears once
// that friend actually helps (its material becomes the bridge art instead).
const LOG_PILE_SPOT = { l: 38, t: 66, w: 11 };
const ROPE_PILE_SPOT = { l: 29, t: 45, w: 8 };

// ---------------------------------------------------------------------------
// Layout Debug panel (ported from MahakayaRescueGame). Drag any marker on the
// scene to place it, fine-tune with the sliders, then "Copy Layout JSON" to
// paste the values back into scene3LayoutConfig.js / the consts above.
// ---------------------------------------------------------------------------
const DEBUG_PANEL_KEYS = [
  ['friend0', 'Elephant (start)'],
  ['friend1', 'Monkey (start)'],
  ['helpTokenHome', 'Help bubble home'],
  ['wait0', 'Elephant wait spot'],
  ['wait1', 'Monkey wait spot'],
  ['helper0', 'Elephant helper spot'],
  ['helper1', 'Monkey helper spot'],
  ['logPile', 'Log pile (before Elephant helps)  (+ size)'],
  ['ropePile', 'Rope pile (before Monkey helps)  (+ size)'],
  ['bridge', 'Bridge'],
  ['beaverBaby', 'Baby beaver'],
  ['plankPile', 'Plank pile'],
  ['plankSlot0', 'Plank slot 1  (+ plank size)'],
  ['plankSlot1', 'Plank slot 2'],
  ['plankSlot2', 'Plank slot 3'],
  ['beaverPath0', 'Beaver path 0'],
  ['beaverPath1', 'Beaver path 1'],
  ['beaverPath2', 'Beaver path 2'],
  ['beaverPath3', 'Beaver path 3'],
  ['beaverPath4', 'Beaver path 4'],
  ['beaverPath5', 'Beaver path 5'],
  ['beaverPath6', 'Beaver path 6'],
];

const DEBUG_LABELS = Object.fromEntries(DEBUG_PANEL_KEYS);

// Ghost art for a debug marker: the actual sprite it positions, at the live
// size + rotation. Returns { src, w, r } or null → fall back to a plain dot.
function debugArtFor(key, pos, layout) {
  const tail = Number(key.replace(/^\D+/, ''));
  const r = pos.r || 0;
  const flip = !!pos.flip;
  const wOf = (k, fallback) => (layout && layout[k] && layout[k].w != null ? layout[k].w : fallback);
  if (key.startsWith('friend')) return { src: FRIENDS[tail]?.carryImg, w: pos.w || 10, r: 0, flip };
  if (key.startsWith('wait')) return { src: FRIENDS[tail]?.emptyImg, w: 10, r: 0, flip };
  if (key.startsWith('helper')) return { src: FRIENDS[tail]?.helpingImg, w: 10, r: 0, flip };
  if (key === 'logPile') return { src: logPileObj, w: wOf('logPile', LOG_PILE_SPOT.w), r: 0 };
  if (key === 'ropePile') return { src: ropePileObj, w: wOf('ropePile', ROPE_PILE_SPOT.w), r: 0 };
  if (key === 'helpTokenHome') return { src: helpHandIconImg, w: 8, r: 0 };
  if (key === 'beaverBaby') return { src: babyBeaverWavingImg, w: KURUMEDEVA_LAYOUT.beaverBaby.w, r: 0, flip };
  if (key.startsWith('beaverPath')) return { src: beaverIdleWorriedImg, w: KURUMEDEVA_LAYOUT.beaver.w, r: 0, flip };
  if (key === 'plankPile' || key.startsWith('plankSlot')) return { src: plankObj, w: wOf('plankSlot0', PLANK_SLOT_W), r };
  if (key === 'bridge') return { src: bridgeStep2Img, w: KURUMEDEVA_LAYOUT.bridge.w, r: 0, flip };
  return null; // other anchors → dot
}

// Only the markers for one phase show at a time — keeps the scene readable.
const DEBUG_PHASES = [
  { label: 'Phase 0 — Setup', keys: ['friend0', 'friend1', 'helpTokenHome', 'beaverBaby', 'bridge'] },
  { label: 'Phase 1 — Ask (Elephant / Monkey)', keys: ['helper0', 'helper1', 'wait0', 'wait1', 'logPile', 'ropePile'] },
  { label: 'Phase 2 — Planks (Beaver alone)', keys: ['plankPile', 'plankSlot0', 'plankSlot1', 'plankSlot2'] },
  { label: 'Phase 3 — Crossing', keys: ['beaverPath0', 'beaverPath1', 'beaverPath2', 'beaverPath3', 'beaverPath4', 'beaverPath5', 'beaverPath6'] },
];

function buildDebugLayout() {
  const layout = {};
  FRIENDS.forEach((friend, index) => {
    layout[`friend${index}`] = { l: friend.l, t: friend.t, w: friend.w, flip: !!friend.flip };
  });
  WAIT_SPOTS.forEach((spot, index) => {
    layout[`wait${index}`] = { l: spot.l, t: spot.t };
  });
  HELPER_SPOTS.forEach((spot, index) => {
    layout[`helper${index}`] = { l: spot.l, t: spot.t };
  });
  layout.logPile = { l: LOG_PILE_SPOT.l, t: LOG_PILE_SPOT.t, w: LOG_PILE_SPOT.w };
  layout.ropePile = { l: ROPE_PILE_SPOT.l, t: ROPE_PILE_SPOT.t, w: ROPE_PILE_SPOT.w };
  layout.helpTokenHome = { ...HELP_TOKEN_HOME };
  layout.bridge = {
    l: KURUMEDEVA_LAYOUT.bridge.l,
    t: KURUMEDEVA_LAYOUT.bridge.t,
    w: KURUMEDEVA_LAYOUT.bridge.w,
    flip: !!KURUMEDEVA_LAYOUT.bridge.flip,
  };
  layout.beaverBaby = {
    l: KURUMEDEVA_LAYOUT.beaverBaby.l,
    t: KURUMEDEVA_LAYOUT.beaverBaby.t,
    w: KURUMEDEVA_LAYOUT.beaverBaby.w,
    flip: !!KURUMEDEVA_LAYOUT.beaverBaby.flip,
  };
  // Slot 0 also carries `w` = the plank's on-screen size, so the panel
  // exposes a width slider for it; every slot carries `r` = its rotation.
  layout.plankPile = { ...PLANK_PILE };
  PLANK_SLOTS.forEach((slot, index) => {
    layout[`plankSlot${index}`] = index === 0
      ? { l: slot.l, t: slot.t, w: PLANK_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  });
  KURUMEDEVA_LAYOUT.beaverPath.forEach((point, index) => {
    layout[`beaverPath${index}`] = { l: point.l, t: point.t };
  });
  return layout;
}

const round1 = (n) => Number(Number(n).toFixed(1));

const POSE_ASSETS = [
  bgImg,
  elephantPullImg,
  elephantHappyImg,
  elephantIdleBananaImg,
  elephantApproachingImg,
  helpBubbleElephantImg,
  monkeyTyingImg,
  monkeyHappyImg,
  monkeyPlayingTwigImg,
  monkeyIdleImg,
  helpBubbleMonkeyImg,
  plankObj,
  logPileObj,
  ropePileObj,
  bridgeStep1Img,
  bridgeStep2Img,
  beaverAskingImg,
  beaverIdleWorriedImg,
  beaverPlacingPlankImg,
  beaverCrossingImg,
  babyBeaverWavingImg,
  beaverBabyReunionImg,
  helpHandIconImg,
];

export default function KurumedevaGame({
  isActive = false,
  introComplete = true,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const [friendStep, setFriendStep] = useState(0);
  const [bridgeStep, setBridgeStep] = useState(0);
  const [phase, setPhase] = useState('play');
  const [beaverPos, setBeaverPos] = useState(BEAVER_PATH[0]);
  const [litCount, setLitCount] = useState(0);
  const [tappedId, setTappedId] = useState(null);
  const [friendImgStates, setFriendImgStates] = useState(() => FRIENDS.map(() => 'carry'));
  const [friendPositions, setFriendPositions] = useState(() => FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
  const [helpTokenPos, setHelpTokenPos] = useState(HELP_TOKEN_HOME);
  const [isDraggingHelp, setIsDraggingHelp] = useState(false);
  const [helpDelivered, setHelpDelivered] = useState(false);
  const [isRoundSettling, setIsRoundSettling] = useState(false);
  const [walkingIndex, setWalkingIndex] = useState(null);

  // Plank round — drag 3 planks onto the finished bridge.
  const [placeActive, setPlaceActive] = useState(false);
  const [placedCount, setPlacedCount] = useState(0);
  const [pieceDragActive, setPieceDragActive] = useState(false);
  const [pieceDragPos, setPieceDragPos] = useState(null);
  const pieceDragRef = useRef(null);
  const placeDoneRef = useRef(false);

  const [debugMode, setDebugMode] = useState(false);
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugLayout, setDebugLayout] = useState(buildDebugLayout);
  const [selectedDebugKey, setSelectedDebugKey] = useState('friend0');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const stageRef = useRef(null);
  const dragPointerRef = useRef(null);
  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const crossingDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const voFallbackRef = useRef(null);
  const phaseRef = useRef('play');
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);
  const isPausedRef = useRef(isPaused);

  // No more solo try/fail gate — the child can ask for help as soon as it's
  // that friend's turn.
  const canAsk = phase === 'play' && friendStep < FRIENDS.length && !placeActive && !isRoundSettling;

  // The hint key represents the child's CURRENT PROBLEM — asking Elephant,
  // asking Monkey, or placing a plank — so the idle timer and cue reset
  // correctly between them.
  const hintBeat = (() => {
    if (phase !== 'play') return phase;
    if (placeActive) return `plank-${placedCount}`;
    if (friendStep === 0) return 'ask-elephant';
    if (friendStep === 1) return 'ask-monkey';
    return `play-${friendStep}`;
  })();

  const {
    hintLevel,
    markInteraction,
    markLevel2VoiceEnded,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !isRoundSettling && !debugMode && introComplete,
    stageKey: hintBeat,
    // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
    initialDelay: 10000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
  });

  // Only the very first "ask for help" (Elephant) gets a teaching gesture —
  // asking Monkey and placing planks both reuse mechanics the child has
  // already learned this game.
  const kuruStageKey = hintBeat;
  const isTeachableBeat = hintBeat === 'ask-elephant';
  const [kuruIntroGesture, setKuruIntroGesture] = useState(false);
  useEffect(() => {
    if (phase !== 'play' || isRoundSettling || debugMode || !isTeachableBeat) { setKuruIntroGesture(false); return undefined; }
    setKuruIntroGesture(true);
    const t = window.setTimeout(() => setKuruIntroGesture(false), 6000);
    return () => window.clearTimeout(t);
  }, [kuruStageKey, phase, isRoundSettling, debugMode, isTeachableBeat]);
  const currentFriend = friendStep < FRIENDS.length ? FRIENDS[friendStep] : null;

  // Round-start question — once per ask round: "Who can help with the heavy
  // logs?" / "Who can help tie the rope?" Not gated on anything (no more
  // solo try/fail beat to wait out).
  const lastRoundQuestionRef = useRef(null);
  useEffect(() => {
    if (phase !== 'play' || isRoundSettling || debugMode || placeActive) return;
    if (friendStep >= FRIENDS.length) return;
    const key = friendStep === 0 ? 'kuru_ask_elephant' : 'kuru_ask_monkey';
    if (lastRoundQuestionRef.current === key) return;
    lastRoundQuestionRef.current = key;
    stopSceneVoice?.();
    playSceneLine?.(key);
  }, [friendStep, phase, isRoundSettling, debugMode, placeActive, playSceneLine, stopSceneVoice]);

  // Plank round instruction — once, right as the plank round begins.
  const plankInstructionPlayedRef = useRef(false);
  useEffect(() => {
    if (!placeActive) { plankInstructionPlayedRef.current = false; return; }
    if (plankInstructionPlayedRef.current) return;
    plankInstructionPlayedRef.current = true;
    stopSceneVoice?.();
    playSceneLine?.('kuru_plank_instruction');
  }, [placeActive, playSceneLine, stopSceneVoice]);

  // Idle hint VO — level 2 is a generic "someone can help" nudge (same for
  // both rounds), level 3 names the correct friend.
  const lastKuruHintRef = useRef('');
  useEffect(() => {
    if (phase !== 'play' || isRoundSettling || debugMode || placeActive || !canAsk || helpDelivered) return;
    if (hintLevel !== 2 && hintLevel !== 3) return;
    const key = hintLevel === 2
      ? 'kuru_hint_ask'
      : (friendStep === 0 ? 'kuru_hint_elephant' : 'kuru_hint_monkey');
    const onceKey = `${friendStep}-${key}`;
    if (lastKuruHintRef.current === onceKey) return;
    lastKuruHintRef.current = onceKey;
    stopSceneVoice?.();
    playSceneLine?.(key, hintLevel === 2 ? markLevel2VoiceEnded : undefined);
  }, [hintLevel, phase, isRoundSettling, debugMode, placeActive, canAsk, helpDelivered, friendStep, playSceneLine, stopSceneVoice, markLevel2VoiceEnded]);

  // Keep the selected debug marker inside the current phase's group.
  useEffect(() => {
    const keys = DEBUG_PHASES[debugPhase].keys;
    setSelectedDebugKey((cur) => (keys.includes(cur) ? cur : keys[0]));
  }, [debugPhase]);

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete;
    onGameCompleteRef.current = onGameComplete;
  }, [onPhaseComplete, onGameComplete]);

  phaseRef.current = phase;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const safeAfter = useCallback((ms, fn) => {
    const runWhenReady = () => {
      if (isPausedRef.current) {
        const retryId = window.setTimeout(runWhenReady, 150);
        timersRef.current.push(retryId);
        return;
      }
      fn();
    };
    const id = window.setTimeout(runWhenReady, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setFriendStep(0);
      setBridgeStep(0);
      setPhase('play');
      setBeaverPos(BEAVER_PATH[0]);
      setLitCount(0);
      setTappedId(null);
      setFriendImgStates(FRIENDS.map(() => 'carry'));
      setFriendPositions(FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
      setHelpTokenPos(HELP_TOKEN_HOME);
      setIsDraggingHelp(false);
      setHelpDelivered(false);
      setIsRoundSettling(false);
      setWalkingIndex(null);
      setPlaceActive(false);
      setPlacedCount(0);
      setPieceDragActive(false);
      setPieceDragPos(null);
      pieceDragRef.current = null;
      placeDoneRef.current = false;
      dragPointerRef.current = null;
      doneCalledRef.current = false;
      successVoDoneRef.current = false;
      crossingDoneRef.current = false;
      completionScheduledRef.current = false;
      phaseRef.current = 'play';
    }
  }, [isActive, clearTimers]);

  useEffect(() => {
    if (isActive && phase === 'play' && friendStep === 0) {
      setFriendPositions(FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
    }
  }, [friendStep, isActive, phase]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return;
    setFriendPositions((prev) => prev.map((pos, index) => (
      index >= friendStep ? { l: FRIENDS[index].l, t: FRIENDS[index].t } : pos
    )));
  }, [friendStep, isActive, phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const moveFriendToWait = useCallback((friendIndex) => {
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendIndex] = WAIT_SPOTS[friendIndex];
      return next;
    });
  }, []);

  const resetHelpToken = useCallback(() => {
    setIsDraggingHelp(false);
    setHelpDelivered(false);
    setHelpTokenPos(HELP_TOKEN_HOME);
    dragPointerRef.current = null;
  }, []);

  const getStagePoint = useCallback((event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return HELP_TOKEN_HOME;
    const l = ((event.clientX - rect.left) / rect.width) * 100;
    const t = ((event.clientY - rect.top) / rect.height) * 100;
    return {
      l: Math.max(4, Math.min(96, l)),
      t: Math.max(6, Math.min(94, t)),
    };
  }, []);

  // Ask a friend for help — it walks over, helps, and the bridge advances.
  // Elephant's logs and Monkey's rope are both just bridge-art swaps (the
  // asset pack has no separate "just tied" state); the plank round after
  // Monkey is the only stage where the child does the placing.
  const askFriendForHelp = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (placeActive || isRoundSettling) return;
    if (friendIndex !== friendStep) return;
    if (friendImgStates[friendIndex] !== 'carry') return;

    stopSceneVoice?.();
    markInteraction();

    const friend = FRIENDS[friendIndex];
    const friendPos = friendPositions[friendIndex] || friend;

    setIsDraggingHelp(false);
    setHelpTokenPos({ l: friendPos.l, t: friendPos.t });
    setHelpDelivered(true);
    dragPointerRef.current = null;
    setIsRoundSettling(true);

    setTappedId(friend.id);
    safeAfter(250, () => setTappedId(null));

    // Friend walks over to the bridge.
    setWalkingIndex(friendIndex);
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendIndex] = HELPER_SPOTS[friendIndex];
      return next;
    });

    safeAfter(WALK_TO_MS, () => {
      setWalkingIndex(null);
      setFriendImgStates((prev) => {
        const next = [...prev];
        next[friendIndex] = 'helping';
        return next;
      });

      // ---------------------------------------------------------------
      // ELEPHANT — logs appear.
      // ---------------------------------------------------------------
      if (friendIndex === 0) {
        setBridgeStep(1);
        setLitCount(SYLLABLES_LIT_AFTER_STEP[0]);
        window.setTimeout(() => onMicroWin?.(), 0);
        playSceneLine?.('kuru_logs_after');

        safeAfter(HELP_SETTLE_MS, () => {
          setFriendImgStates((prev) => {
            const next = [...prev];
            next[0] = 'empty';
            return next;
          });
          moveFriendToWait(0);
          setFriendStep(1);
          setHelpDelivered(false);
          setHelpTokenPos(HELP_TOKEN_HOME);
          setIsRoundSettling(false);
        });
        return;
      }

      // ---------------------------------------------------------------
      // MONKEY — rope appears, then the plank round begins.
      // ---------------------------------------------------------------
      setBridgeStep(2);
      setLitCount(SYLLABLES_LIT_AFTER_STEP[1]);
      window.setTimeout(() => onMicroWin?.(), 0);
      playSceneLine?.('kuru_rope_after');

      safeAfter(HELP_SETTLE_MS, () => {
        setFriendImgStates((prev) => {
          const next = [...prev];
          next[1] = 'empty';
          return next;
        });
        moveFriendToWait(1);
        setFriendStep(2);
        setHelpDelivered(false);
        setHelpTokenPos(HELP_TOKEN_HOME);

        placeDoneRef.current = false;
        setPlacedCount(0);
        setPlaceActive(true);
        setIsRoundSettling(false);
      });
    });
  }, [friendImgStates, friendPositions, friendStep, isPaused, isRoundSettling, markInteraction, moveFriendToWait, onMicroWin, placeActive, playSceneLine, safeAfter, stopSceneVoice]);

  // --- Plank drag handlers: pull a plank from the pile into the gap --------
  const placeNextPiece = useCallback(() => {
    setPlacedCount((n) => Math.min(PLANK_SLOTS.length, n + 1));
  }, []);

  const handlePiecePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= PLANK_SLOTS.length) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    markInteraction();
    pieceDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPieceDragActive(true);
    setPieceDragPos(getStagePoint(event));
  }, [getStagePoint, isPaused, placeActive, placedCount, markInteraction, stopSceneVoice]);

  const handlePiecePointerMove = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId || !pieceDragActive) return;
    event.preventDefault();
    setPieceDragPos(getStagePoint(event));
  }, [getStagePoint, pieceDragActive]);

  const endPieceDrag = useCallback(() => {
    pieceDragRef.current = null;
    setPieceDragActive(false);
    setPieceDragPos(null);
  }, []);

  // Pause-triggered cleanup: a tap-to-pause mid-drag must not leave
  // pieceDragActive / isDraggingHelp stuck true (it would silently resume
  // from wherever it left off on unpause). Never touches helpDelivered — a
  // completed help-token delivery must survive a pause.
  useEffect(() => {
    if (!isPaused) return;
    if (pieceDragActive) endPieceDrag();
    if (isDraggingHelp) {
      setIsDraggingHelp(false);
      setHelpTokenPos(HELP_TOKEN_HOME);
      dragPointerRef.current = null;
    }
  }, [isPaused, pieceDragActive, isDraggingHelp, endPieceDrag]);

  const handlePiecePointerUp = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const drop = getStagePoint(event);

    const slot = PLANK_SLOTS[placedCount] || PLANK_SLOTS[PLANK_SLOTS.length - 1];
    const near = Math.hypot(drop.l - slot.l, drop.t - slot.t) <= PLANK_DROP_RADIUS;
    const overGap = drop.l >= GAP_ZONE.l0 && drop.l <= GAP_ZONE.l1
      && drop.t >= GAP_ZONE.t0 && drop.t <= GAP_ZONE.t1;
    endPieceDrag();
    if (near || overGap) placeNextPiece();
  }, [endPieceDrag, getStagePoint, placeNextPiece, placedCount]);

  // Plank round completes once all 3 land — light the last syllables, then
  // start the crossing.
  useEffect(() => {
    if (!placeActive || placedCount < PLANK_SLOTS.length || placeDoneRef.current) return;
    placeDoneRef.current = true;

    setLitCount(SYLLABLES_LIT_AFTER_STEP[2]);
    window.setTimeout(() => onMicroWin?.(), 0);
    setBridgeStep(TOTAL_ROUNDS);
    setPlaceActive(false);
    setIsRoundSettling(true);

    safeAfter(420, () => {
      setIsRoundSettling(false);
      setPhase('crossing');
      phaseRef.current = 'crossing';
      setLitCount(SYLLABLES.length);
    });
  }, [placeActive, placedCount, onMicroWin, safeAfter]);

  const handleHelpPointerDown = useCallback((event) => {
    if (isPaused || phaseRef.current !== 'play' || !currentFriend) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    dragPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDraggingHelp(true);
    setHelpTokenPos(getStagePoint(event));
  }, [currentFriend, getStagePoint, isPaused, stopSceneVoice]);

  const handleHelpPointerMove = useCallback((event) => {
    if (!isDraggingHelp || dragPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    setHelpTokenPos(getStagePoint(event));
  }, [getStagePoint, isDraggingHelp]);

  const handleHelpPointerUp = useCallback((event) => {
    if (!isDraggingHelp || dragPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const dropPoint = getStagePoint(event);
    const friend = FRIENDS[friendStep];
    const friendPos = friendPositions[friendStep] || friend;
    const distance = Math.hypot(dropPoint.l - friendPos.l, dropPoint.t - friendPos.t);
    const dropRadius = Math.max(18, friend.w * 1.6);

    // Also accept the drop if the pointer was released directly over the
    // current friend's element (generous touch target for young kids).
    let overFriend = false;
    if (typeof document !== 'undefined') {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      overFriend = !!el?.closest?.(`[data-friend-id="${friend.id}"]`);
    }

    if (distance <= dropRadius || overFriend) {
      askFriendForHelp(friendStep);
    } else {
      resetHelpToken();
    }
  }, [askFriendForHelp, friendPositions, friendStep, getStagePoint, isDraggingHelp, resetHelpToken]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !crossingDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 500);
  }, []);

  useEffect(() => {
    if (phase !== 'crossing' || doneCalledRef.current) return;
    doneCalledRef.current = true;

    if (playSceneLine) {
      // Stop any still-playing last-syllable clip first (it was overlapping the
      // success VO — "two voices"), then: full word "kurumedeva" → completion line.
      stopSceneVoice?.();
      const afterWord = () => {
        playSceneLine('scene12KuruDone', () => {
          successVoDoneRef.current = true;
          completeAfterSuccess();
        }, { stripLeadingText: 'Kurume Deva' });
      };
      if (playWord) playWord('kurumedeva', afterWord);
      else afterWord();
      // iOS Safari can silently drop utterance onend/onerror — don't let completion hang on VO
      voFallbackRef.current = window.setTimeout(() => {
        if (!successVoDoneRef.current) {
          successVoDoneRef.current = true;
          completeAfterSuccess();
        }
      }, 10000);
    } else {
      successVoDoneRef.current = true;
    }

    // Slow, calm crossing. The friend animals stay on the near bank — only
    // Beaver walks the finished bridge back to the baby.
    BEAVER_PATH.forEach((pos, index) => {
      safeAfter(index * 950, () => {
        setBeaverPos(pos);
        if (index === BEAVER_PATH.length - 1) {
          // Off the bridge — one last step to reunite with the baby. Lands
          // exactly on the baby's spot: the reunion art already draws both
          // beavers together, so the baby's own sprite is hidden at 'done'
          // (see the `phase === 'done'` check below) rather than doubling up.
          safeAfter(700, () => {
            setBeaverPos({
              l: KURUMEDEVA_LAYOUT.beaverBaby.l,
              t: KURUMEDEVA_LAYOUT.beaverBaby.t,
            });
          });
          safeAfter(1700, () => {
            crossingDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          });
        }
      });
    });
  }, [completeAfterSuccess, phase, playSceneLine, playWord, stopSceneVoice, safeAfter]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
  }, []);

  // --- Layout Debug helpers -------------------------------------------------
  const startDebugDrag = (event, key) => {
    event.preventDefault();
    event.stopPropagation();
    const point = getStagePoint(event);
    setSelectedDebugKey(key);
    debugDragRef.current = {
      key,
      offsetL: point.l - debugLayout[key].l,
      offsetT: point.t - debugLayout[key].t,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const applyDebugDrag = (event) => {
    const drag = debugDragRef.current;
    if (!drag) return;
    const point = getStagePoint(event);
    setDebugLayout((current) => ({
      ...current,
      [drag.key]: {
        ...current[drag.key],
        l: Number((point.l - drag.offsetL).toFixed(2)),
        t: Number((point.t - drag.offsetT).toFixed(2)),
      },
    }));
  };

  const endDebugDrag = () => {
    debugDragRef.current = null;
  };

  const updateDebugField = (field, value) => {
    const next = Number(value);
    if (Number.isNaN(next)) return;
    setDebugLayout((current) => ({
      ...current,
      [selectedDebugKey]: { ...current[selectedDebugKey], [field]: next },
    }));
  };

  const nudgeDebug = (axis, delta) => {
    setDebugLayout((current) => ({
      ...current,
      [selectedDebugKey]: {
        ...current[selectedDebugKey],
        [axis]: Number(((current[selectedDebugKey][axis] || 0) + delta).toFixed(1)),
      },
    }));
  };

  const toggleDebugFlip = () => {
    setDebugLayout((current) => ({
      ...current,
      [selectedDebugKey]: { ...current[selectedDebugKey], flip: !current[selectedDebugKey].flip },
    }));
  };

  const copyLayoutJson = async () => {
    const payload = JSON.stringify(
      {
        friends: FRIENDS.map((friend, index) => ({
          id: friend.id,
          label: friend.label,
          l: round1(debugLayout[`friend${index}`].l),
          t: round1(debugLayout[`friend${index}`].t),
          w: round1(debugLayout[`friend${index}`].w),
          flip: !!debugLayout[`friend${index}`].flip,
        })),
        beaverPath: KURUMEDEVA_LAYOUT.beaverPath.map((_, index) => ({
          l: round1(debugLayout[`beaverPath${index}`].l),
          t: round1(debugLayout[`beaverPath${index}`].t),
        })),
        bridge: {
          ...KURUMEDEVA_LAYOUT.bridge,
          l: round1(debugLayout.bridge.l),
          t: round1(debugLayout.bridge.t),
          w: round1(debugLayout.bridge.w),
          flip: !!debugLayout.bridge.flip,
        },
        beaverBaby: {
          ...KURUMEDEVA_LAYOUT.beaverBaby,
          l: round1(debugLayout.beaverBaby.l),
          t: round1(debugLayout.beaverBaby.t),
          w: round1(debugLayout.beaverBaby.w),
          flip: !!debugLayout.beaverBaby.flip,
        },
        HELP_TOKEN_HOME: {
          l: round1(debugLayout.helpTokenHome.l),
          t: round1(debugLayout.helpTokenHome.t),
        },
        WAIT_SPOTS: WAIT_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`wait${index}`].l),
          t: round1(debugLayout[`wait${index}`].t),
        })),
        HELPER_SPOTS: HELPER_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`helper${index}`].l),
          t: round1(debugLayout[`helper${index}`].t),
        })),
        LOG_PILE_SPOT: {
          l: round1(debugLayout.logPile.l),
          t: round1(debugLayout.logPile.t),
          w: round1(debugLayout.logPile.w),
        },
        ROPE_PILE_SPOT: {
          l: round1(debugLayout.ropePile.l),
          t: round1(debugLayout.ropePile.t),
          w: round1(debugLayout.ropePile.w),
        },
        PLANK_SLOT_W: round1(debugLayout.plankSlot0.w),
        PLANK_PILE: {
          l: round1(debugLayout.plankPile.l),
          t: round1(debugLayout.plankPile.t),
        },
        PLANK_SLOTS: PLANK_SLOTS.map((slot, index) => ({
          l: round1(debugLayout[`plankSlot${index}`].l),
          t: round1(debugLayout[`plankSlot${index}`].t),
          r: round1(debugLayout[`plankSlot${index}`].r ?? 0),
        })),
      },
      null,
      2,
    );
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setLayoutCopyStatus('Copied');
      } else if (typeof window !== 'undefined' && window.prompt) {
        window.prompt('Copy layout JSON', payload);
        setLayoutCopyStatus('Shown');
      }
    } catch {
      if (typeof window !== 'undefined' && window.prompt) {
        window.prompt('Copy layout JSON', payload);
        setLayoutCopyStatus('Shown');
      } else {
        if (import.meta.env.DEV) console.log('Kurumedeva layout JSON:', payload);
        setLayoutCopyStatus('Logged');
      }
    }
  };

  const startDebugPanelDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDebugPanelDrag = (event) => {
    const drag = debugPanelDragRef.current;
    if (!drag) return;
    event.preventDefault();
    event.stopPropagation();
    const panelWidth = Math.min(352, window.innerWidth - 24);
    const panelHeight = debugMode ? Math.min(window.innerHeight * 0.78, 560) : 48;
    const nextX = Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - drag.offsetX));
    const nextY = Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - drag.offsetY));
    setDebugPanelPosition({ x: nextX, y: nextY });
  };

  const endDebugPanelDrag = (event) => {
    if (!debugPanelDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    debugPanelDragRef.current = null;
  };

  if (!isActive) return null;

  // step0 = bare bank (nothing yet), step1 = Elephant's logs, step2+ = Monkey's
  // rope — step2 stays as the base art while the planks are dragged onto it,
  // right through crossing/done.
  const bridgeImg = bridgeStep === 0 ? null : bridgeStep === 1 ? bridgeStep1Img : bridgeStep2Img;
  const showPlacedPieces = debugMode || placeActive;

  // One idle gesture hint, keyed to the current piece/friend. pointer-events:none overlay.
  const gestureHint = (() => {
    if (phase !== 'play' || debugMode || isRoundSettling) return null;
    if (placeActive) {
      const s = PLANK_SLOTS[Math.min(placedCount, PLANK_SLOTS.length - 1)];
      return { type: 'drag', from: { x: PLANK_PILE.l, y: PLANK_PILE.t }, to: { x: s.l, y: s.t }, k: `plank-${placedCount}` };
    }
    if (currentFriend && canAsk) {
      const fp = friendPositions[friendStep] || currentFriend;
      // L2 and below: a short neutral nudge that only teaches "drag the
      // bubble" — it does NOT point at the answer. Only L3 draws the full
      // path to the correct friend.
      const full = hintLevel >= 3;
      const to = full ? { x: fp.l, y: fp.t } : { x: HELP_TOKEN_HOME.l - 7, y: HELP_TOKEN_HOME.t - 3 };
      return { type: 'drag', from: { x: HELP_TOKEN_HOME.l, y: HELP_TOKEN_HOME.t }, to, k: `ask-${friendStep}-${full ? 'full' : 'nudge'}` };
    }
    return null;
  })();

  const beaverImg = phase === 'done'
    ? beaverBabyReunionImg
    : phase === 'crossing'
      ? beaverCrossingImg
      : placeActive
        ? beaverPlacingPlankImg
        : canAsk
          ? beaverAskingImg
          : beaverIdleWorriedImg;

  return (
    <div className={`kuru-game${hideElements ? ' is-hidden' : ''}${debugMode ? ' is-debugging' : ''}`}>
      <div
        ref={stageRef}
        className="kuru-stage"
        style={{ backgroundImage: `url(${bgImg})` }}
        onPointerMove={debugMode ? applyDebugDrag : undefined}
        onPointerUp={debugMode ? endDebugDrag : undefined}
        onPointerCancel={debugMode ? endDebugDrag : undefined}
        onContextMenu={(event) => event.preventDefault()}
      >
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            playSyllable?.(syllable);
          }}
        />

        {/* Production copy removed — VO + gesture + visual cue (help-bubble
            wiggle, glow) carry the hint ladder. Kept as a debug-only readout,
            gated with the rest of the debug UI. */}
        {DEBUG_UI_ENABLED && phase === 'play' && currentFriend && !isRoundSettling && !debugMode && !placeActive && (
          <p className="kuru-hint">
            {`[debug] ask ${currentFriend.label} — hintLevel ${hintLevel}`}
          </p>
        )}

        {phase === 'done' && (
          <p className="kuru-doneline">You asked for help. Together, you made a way!</p>
        )}

        {/* Resting piles — visible before each friend helps, so the child
            can see what they're about to bring. Each vanishes once that
            friend's help lands (its material becomes the bridge art). */}
        {!debugMode && phase === 'play' && bridgeStep === 0 && (
          <div
            className="kuru-log-piece is-log"
            style={{
              left: `${LOG_PILE_SPOT.l}%`,
              top: `${LOG_PILE_SPOT.t}%`,
              width: `${LOG_PILE_SPOT.w}%`,
              pointerEvents: 'none',
            }}
          >
            <img src={logPileObj} alt="" draggable={false} />
          </div>
        )}
        {!debugMode && phase === 'play' && friendStep === 1 && bridgeStep === 1 && (
          <div
            className="kuru-log-piece is-rope"
            style={{
              left: `${ROPE_PILE_SPOT.l}%`,
              top: `${ROPE_PILE_SPOT.t}%`,
              width: `${ROPE_PILE_SPOT.w}%`,
              transform: 'translate(-50%, -50%) rotate(0deg)',
              pointerEvents: 'none',
            }}
          >
            <img src={ropePileObj} alt="" draggable={false} />
          </div>
        )}

        {bridgeImg && (
          <div
            className={`kuru-bridge${bridgeStep === TOTAL_ROUNDS ? ' is-complete' : ''}`}
            style={{
              left: `${KURUMEDEVA_LAYOUT.bridge.l}%`,
              top: `${KURUMEDEVA_LAYOUT.bridge.t}%`,
              width: `${KURUMEDEVA_LAYOUT.bridge.w}%`,
              transform: `translate(-50%, -50%) rotate(${KURUMEDEVA_LAYOUT.bridge.r || 0}deg) scaleX(${KURUMEDEVA_LAYOUT.bridge.flip ? -1 : 1}) scale(1.3)`,
            }}
          >
            <PoseImage
              className="kuru-bridge-img is-cur"
              src={bridgeImg}
              alt="bridge"
              draggable={false}
            />
          </div>
        )}

        {/* Planks already placed (and, in debug, a full preview). Once the
            round succeeds these stay put — no loose pieces linger. */}
        {showPlacedPieces && (() => {
          const debugDone = debugMode && debugPhase > 2;
          const roundCurrent = placeActive;
          if (!debugDone && !roundCurrent) return null;
          const count = debugDone ? PLANK_SLOTS.length : placedCount;
          return PLANK_SLOTS.slice(0, count).map((slot, i) => {
            const isNewest = !debugDone && i === count - 1;
            const dropCls = isNewest ? ' is-newest is-roll' : '';
            return (
              <div
                key={`piece-plank-${i}`}
                className={`kuru-span-log is-plank${dropCls}`}
                style={{
                  left: `${slot.l}%`,
                  top: `${slot.t}%`,
                  width: `${PLANK_SLOT_W}%`,
                  transform: `translate(-50%, -50%) rotate(${slot.r || 0}deg)`,
                }}
              >
                <img src={plankObj} alt="" draggable={false} />
              </div>
            );
          });
        })()}

        {/* Active plank round — ghost slot + draggable pile at the friend's feet. */}
        {placeActive && phase === 'play' && placedCount < PLANK_SLOTS.length && (
          <>
            {/* Drop zone — a clear dashed landing pad, not just the faint ghost
                piece, so little hands can see exactly where to drag to. */}
            <div
              className="kuru-drop-zone"
              style={{
                left: `${PLANK_SLOTS[placedCount].l}%`,
                top: `${PLANK_SLOTS[placedCount].t}%`,
                width: `${PLANK_SLOT_W * 1.35}%`,
              }}
              aria-hidden="true"
            />
            <div
              className="kuru-span-log is-plank is-ghost"
              style={{
                left: `${PLANK_SLOTS[placedCount].l}%`,
                top: `${PLANK_SLOTS[placedCount].t}%`,
                width: `${PLANK_SLOT_W}%`,
                transform: `translate(-50%, -50%) rotate(${PLANK_SLOTS[placedCount].r || 0}deg)`,
              }}
            >
              <img src={plankObj} alt="" draggable={false} />
            </div>

            {Array.from({ length: PLANK_SLOTS.length - placedCount }).map((_, i) => {
              const isTop = i === 0;
              const dragging = isTop && pieceDragActive;
              const pileL = PLANK_PILE.l + i * 0.5;
              const pileT = PLANK_PILE.t - i * 2.6;
              // Pile pieces sit small; the one being dragged grows to slot size.
              const pieceW = dragging ? PLANK_SLOT_W : PLANK_SLOT_W * 0.6;
              return (
                <button
                  key={`pile-plank-${placedCount}-${i}`}
                  type="button"
                  className={`kuru-log-piece is-plank${isTop ? ' is-top' : ''}${dragging ? ' is-dragging' : ''}${isTop && hintLevel >= 1 && !pieceDragActive ? ' pulse' : ''}`}
                  style={{
                    left: `${dragging && pieceDragPos ? pieceDragPos.l : pileL}%`,
                    top: `${dragging && pieceDragPos ? pieceDragPos.t : pileT}%`,
                    width: `${pieceW}%`,
                    transition: 'width 0.15s ease',
                  }}
                  aria-label="Drag a plank across the gap"
                  onPointerDown={isTop ? handlePiecePointerDown : undefined}
                  onPointerMove={isTop ? handlePiecePointerMove : undefined}
                  onPointerUp={isTop ? handlePiecePointerUp : undefined}
                  onPointerCancel={isTop ? endPieceDrag : undefined}
                >
                  <img src={plankObj} alt="" draggable={false} />
                </button>
              );
            })}
          </>
        )}

        <div
          className={`kuru-beaver${phase === 'crossing' ? ' is-walking' : ''}`}
          style={{
            left: `${beaverPos.l}%`,
            top: `${beaverPos.t}%`,
            // beaver-baby-reunion.png already draws both beavers hugging —
            // render it a little larger, unmirrored, and drop the baby's own
            // sprite below so the pair don't double up.
            width: `${phase === 'done' ? KURUMEDEVA_LAYOUT.beaverBaby.w * 1.3 : KURUMEDEVA_LAYOUT.beaver.w}%`,
            scale: (phase !== 'done' && KURUMEDEVA_LAYOUT.beaver.flip) ? '-1 1' : '1 1',
          }}
        >
          <PoseImage src={beaverImg} alt="Beaver" draggable={false} />
        </div>

        {phase !== 'done' && (
        <div
          className="kuru-beaver-baby"
          style={{
            left: `${KURUMEDEVA_LAYOUT.beaverBaby.l}%`,
            top: `${KURUMEDEVA_LAYOUT.beaverBaby.t}%`,
            width: `${KURUMEDEVA_LAYOUT.beaverBaby.w}%`,
            scale: KURUMEDEVA_LAYOUT.beaverBaby.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={babyBeaverWavingImg} alt="Baby beaver" draggable={false} />
        </div>
        )}

        {!debugMode && FRIENDS.map((friend, index) => {
          // Both helpers stay visible from the start (via
          // .kuru-friend--waiting below) — so "who can help?" is a real
          // choice for the child, not a reveal-one-at-a-time.
          const imgState = friendImgStates[index];
          const pos = friendPositions[index];
          const isCurrent = index === friendStep && phase === 'play';
          const isTapped = tappedId === friend.id;
          const isWaiting = index > friendStep;
          const isHelping = imgState === 'helping';
          const isHelped = imgState === 'empty' && index <= friendStep;
          const isCrossing = phase === 'crossing' || phase === 'done';
          const isWalking = walkingIndex === index;
          const friendSprite = imgState === 'carry'
            ? (isWalking && friend.walkingImg ? friend.walkingImg : friend.carryImg)
            : isHelping ? friend.helpingImg : friend.emptyImg;

          return (
            <div
              key={friend.id}
              data-friend-id={friend.id}
              className={`
                kuru-friend
                ${isCurrent && imgState === 'carry' ? 'is-active' : ''}
                ${isTapped ? 'is-tapped' : ''}
                ${isWaiting ? 'kuru-friend--waiting' : ''}
                ${isHelping ? 'kuru-friend--helping' : ''}
                ${isHelped ? 'kuru-friend--helped' : ''}
                ${isCrossing ? 'kuru-friend--crossing' : ''}
                ${isWalking ? 'is-walking' : ''}
                ${isCurrent && imgState === 'carry' && canAsk && hintLevel >= 3 ? 'hint-glow' : ''}
              `}
              style={{
                left: `${pos.l}%`,
                top: `${pos.t}%`,
                width: `${friend.w * KURU_HIT_SCALE}%`,
                scale: friend.flip ? '-1 1' : '1 1',
              }}
            >
              <PoseImage
                src={friendSprite}
                alt={friend.label}
                draggable={false}
              />
            </div>
          );
        })}

        {phase === 'play' && currentFriend && !debugMode && !placeActive && canAsk && (
          <>
            <button
              type="button"
              className={`kuru-help-token${isDraggingHelp ? ' is-dragging' : ''}${helpDelivered ? ' is-delivered' : ''}${hintLevel === 1 && !isDraggingHelp && !helpDelivered ? ' is-hint-wiggle' : ''}`}
              style={{
                left: `${helpTokenPos.l}%`,
                top: `${helpTokenPos.t}%`,
              }}
              aria-label={`Ask ${currentFriend.label} for help`}
              onPointerDown={handleHelpPointerDown}
              onPointerMove={handleHelpPointerMove}
              onPointerUp={handleHelpPointerUp}
              onPointerCancel={resetHelpToken}
            >
              <img src={currentFriend.helpBubbleImg || helpHandIconImg} alt="" draggable={false} />
            </button>
          </>
        )}

        {gestureHint && (
          <GestureDemo
            key={gestureHint.k}
            type={gestureHint.type}
            from={gestureHint.from}
            to={gestureHint.to}
            active={hintLevel >= 1 || (kuruIntroGesture && gestureHint.type !== 'tap')}
            // Teaching-pass delay is per-beat (GMB gesture-timing presets,
            // matched to each beat's VO lead-in); a rescue triggered by the
            // idle ladder keeps the shorter 400ms — there's no fresh
            // instruction VO to wait out at that point.
            idleDelay={
              kuruIntroGesture && hintLevel < 1
                ? ({ 'ask-elephant': 750 }[hintBeat] ?? 400)
                : 400
            }
            iterations={1}
            zIndex={46}
          />
        )}

        {debugMode && (
          <div className="kuru-debug-overlay">
            {DEBUG_PHASES[debugPhase].keys.map((key) => {
              const label = DEBUG_LABELS[key] || key;
              const pos = debugLayout[key];
              if (!pos) return null;
              const art = debugArtFor(key, pos, debugLayout);
              return (
                <div
                  key={key}
                  className={`kuru-debug-marker${art ? ' has-art' : ''}${selectedDebugKey === key ? ' is-debug-selected' : ''}`}
                  style={{
                    left: `${pos.l}%`,
                    top: `${pos.t}%`,
                    width: art ? `${art.w}%` : undefined,
                    transform: art ? `translate(-50%, -50%) rotate(${art.r || 0}deg) scaleX(${art.flip ? -1 : 1})` : undefined,
                  }}
                  onPointerDown={(event) => startDebugDrag(event, key)}
                >
                  {art && art.src ? (
                    <img src={art.src} alt="" draggable={false} />
                  ) : (
                    <span className="kuru-debug-dot" />
                  )}
                  <span className="kuru-debug-label">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {DEBUG_UI_ENABLED && (
      <div
        className={`kuru-debug-panel${debugMode ? ' is-open' : ''}`}
        style={{ left: `${debugPanelPosition.x}px`, top: `${debugPanelPosition.y}px` }}
      >
        <button
          type="button"
          className="kuru-debug-toggle"
          onClick={() => setDebugMode((show) => !show)}
        >
          {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
        </button>

        {debugMode && (
          <div className="kuru-debug-body">
            <div
              className="kuru-debug-drag-handle"
              onPointerDown={startDebugPanelDrag}
              onPointerMove={continueDebugPanelDrag}
              onPointerUp={endDebugPanelDrag}
              onPointerCancel={endDebugPanelDrag}
            >
              Drag layout panel
            </div>

            <div className="kuru-debug-actions" style={{ alignItems: 'center' }}>
              <button type="button" onClick={copyLayoutJson}>Copy Layout JSON</button>
              {layoutCopyStatus && <span style={{ fontSize: 12, opacity: 0.8 }}>{layoutCopyStatus}</span>}
            </div>

            <p className="kuru-debug-note">
              One phase at a time. Drag a marker on the scene, or fine-tune the
              selected one below. Copy Layout JSON always exports every phase.
            </p>

            <label className="kuru-debug-row">
              <span>Phase</span>
              <select value={debugPhase} onChange={(e) => setDebugPhase(Number(e.target.value))}>
                {DEBUG_PHASES.map((p, i) => (
                  <option key={p.label} value={i}>{p.label}</option>
                ))}
              </select>
              <span />
            </label>

            <label className="kuru-debug-row">
              <span>Object</span>
              <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                {DEBUG_PHASES[debugPhase].keys.map((key) => (
                  <option key={key} value={key}>{DEBUG_LABELS[key] || key}</option>
                ))}
              </select>
              <span />
            </label>

            {['l', 't', 'w', 'r'].map((field) => {
              const value = debugLayout[selectedDebugKey][field];
              if ((field === 'w' || field === 'r') && value == null) return null;
              const isRot = field === 'r';
              const isW = field === 'w';
              const min = isRot ? -180 : isW ? 2 : 0;
              const max = isRot ? 180 : isW ? 80 : 100;
              return (
                <label key={field} className="kuru-debug-row">
                  <span>{field === 'l' ? 'left' : field === 't' ? 'top' : isW ? 'width' : 'rotate'}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={isRot ? 1 : 0.1}
                    value={value ?? 0}
                    onChange={(e) => updateDebugField(field, e.target.value)}
                  />
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={isRot ? 1 : 0.1}
                    value={value ?? ''}
                    onChange={(e) => updateDebugField(field, e.target.value)}
                  />
                </label>
              );
            })}

            <div className="kuru-debug-grid">
              <button type="button" onClick={() => nudgeDebug('t', -0.5)}>up</button>
              <button type="button" onClick={() => nudgeDebug('l', -0.5)}>left</button>
              <button type="button" onClick={() => nudgeDebug('l', 0.5)}>right</button>
              <button type="button" onClick={() => nudgeDebug('t', 0.5)}>down</button>
            </div>

            {debugLayout[selectedDebugKey].r != null && (
              <div className="kuru-debug-grid">
                <button type="button" onClick={() => nudgeDebug('r', -5)}>rot −5°</button>
                <button type="button" onClick={() => nudgeDebug('r', 5)}>rot +5°</button>
              </div>
            )}

            {debugLayout[selectedDebugKey].flip !== undefined && (
              <div className="kuru-debug-grid">
                <button type="button" onClick={toggleDebugFlip}>
                  {debugLayout[selectedDebugKey].flip ? 'Un-flip' : 'Flip horizontal'}
                </button>
              </div>
            )}

            <div className="kuru-debug-grid">
              <button type="button" onClick={() => setDebugLayout(buildDebugLayout())}>reset all</button>
            </div>

            <pre className="kuru-debug-readout">{JSON.stringify(debugLayout[selectedDebugKey], null, 2)}</pre>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
