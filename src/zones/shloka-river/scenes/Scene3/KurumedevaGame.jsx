import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './KurumedevaGame.css';

import bgImg from './assets/images/nirvighnam/bg.png';

import turtleCarryImg from './assets/images/Kurumedeva/turtle.png';
import birdCarryImg from './assets/images/Kurumedeva/bird.png';
import squirrelCarryImg from './assets/images/Kurumedeva/squirrel.png';
import bunnyCarryImg from './assets/images/Kurumedeva/bunny.png';

import turtleEmptyImg from './assets/images/Kurumedeva/turtle-empty.png';
import birdEmptyImg from './assets/images/Kurumedeva/bird-empty.png';
import squirrelEmptyImg from './assets/images/Kurumedeva/squirrel-empty.png';
import bunnyEmptyImg from './assets/images/Kurumedeva/bunny-empty.png';

import logObj from './assets/images/Kurumedeva/log-turtle.png';
import vineObj from './assets/images/Kurumedeva/vine.png';
import pegObj from './assets/images/Kurumedeva/peg-squirrel.png';
import plankObj from './assets/images/Kurumedeva/plank-bunny.png';

import step1Img from './assets/images/Kurumedeva/step1.png';
import step2Img from './assets/images/Kurumedeva/step2.png';
import step3Img from './assets/images/Kurumedeva/step3.png';
import step4Img from './assets/images/Kurumedeva/step4.png';
import beaverHappyImg from './assets/images/Kurumedeva/beaver-happy.png';
import beaverSadImg from './assets/images/Kurumedeva/beaver-sad.png';
import beaverBabyImg from './assets/images/Kurumedeva/beaver-baby.png';
import helpHandIconImg from './assets/images/Kurumedeva/help-hand-icon.png';

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Ku', 'ru', 'me', 'deva'];
const BRIDGE_TARGET = {
  l: KURUMEDEVA_LAYOUT.bridge.l,
  t: KURUMEDEVA_LAYOUT.bridge.t,
};
const HELP_TOKEN_HOME = { l: 77.2, t: 60.7 };

// Play order = build order: logs span the gap, planks deck it, pegs lock the
// posts, vines lash it all. `bridgeImg` (step1-4) is POSITIONAL — it matches the
// slot in this array, not the animal. The `...KURUMEDEVA_LAYOUT.friends[N]`
// spread still points each animal at its own start position.
const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    label: 'Turtle',
    brings: 'log',
    carryImg: turtleCarryImg,
    emptyImg: turtleEmptyImg,
    objectImg: logObj,
    bridgeImg: step1Img,
    objectAnim: 'kuru-obj-roll',
    objectW: 8,
    objectOffset: { l: 3.2, t: 1.8 },
    doneSpot: { l: 76, t: 70 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[3],
    label: 'Bunny',
    brings: 'planks',
    carryImg: bunnyCarryImg,
    emptyImg: bunnyEmptyImg,
    objectImg: plankObj,
    bridgeImg: step2Img,
    objectAnim: 'kuru-obj-flip',
    objectW: 7,
    objectOffset: { l: 4.8, t: 1.3 },
    doneSpot: { l: 87, t: 63 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[2],
    label: 'Squirrel',
    brings: 'pegs',
    carryImg: squirrelCarryImg,
    emptyImg: squirrelEmptyImg,
    objectImg: pegObj,
    bridgeImg: step3Img,
    objectAnim: 'kuru-obj-tumble',
    objectW: 6,
    objectOffset: { l: 5.5, t: 1.4 },
    doneSpot: { l: 82, t: 79 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    label: 'Bird',
    brings: 'vine',
    carryImg: birdCarryImg,
    emptyImg: birdEmptyImg,
    objectImg: vineObj,
    bridgeImg: step4Img,
    objectAnim: 'kuru-obj-swoop',
    objectW: 5,
    objectOffset: { l: 4.4, t: -4.4 },
    doneSpot: { l: 82, t: 59 },
  },
];

const AUDIO = { syllables: ['ku', 'ru', 'me', 'deva'] };
const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;
const TURTLE_RIVER_SHIFT = 0;
// Friend tap hitbox is enlarged vs. the visible sprite for touch forgiveness —
// KurumedevaGame.css compensates by sizing the <img> at 1/KURU_HIT_SCALE (62.5%).
const KURU_HIT_SCALE = 1.6;
const WAIT_SPOTS = [
  { l: 18, t: 62 },
  { l: 24, t: 68 },
  { l: 14, t: 70 },
  { l: 20.5, t: 56.1 },
];
// When a friend is asked, it walks from its start spot to a delivery spot at the
// near (left) end of the bridge gap, sets its material down, then walks to the
// bank line. Slight per-friend stagger so consecutive drops don't stack.
const DELIVERY_SPOTS = [
  { l: 30.8, t: 73.6 },
  { l: 47, t: 66.5 },
  { l: 87.5, t: 84.7 },
  { l: 34.6, t: 67.9 },
];
const WALK_TO_MS = 1000; // amble to the gap
const DELIVER_MS = 650; // set the material down / it hops onto the bridge
const WALK_BACK_MS = 1050; // amble to the bank line

// --- Per-piece rounds: the child drags 3 pieces across the gap ---------------
// Each placeable round: friend walks to the gap, a pile of 3 pieces appears,
// the child drags them one by one into slots. Pieces persist and stack —
// they ARE the bridge (no composite art for these stages).
// Each round places pieces in 3 actions. A round can lay MORE than one piece
// per action via `rows`: row 0 is `slots` (the tap/trace target), each extra
// row is a parallel array of 3. Coords seeded from the Canva bridge SVG
// (canvas 1577x1183) — fine-tune per phase in the debug panel.
const LOG_PILE = { l: 30.81, t: 66.22 };
// 3 logs — tuned in the debug panel (these were fine; leave them).
const LOG_SLOTS = [
  { l: 59.9, t: 73, r: 0 },
  { l: 57.9, t: 77.1, r: 0 },
  { l: 54.1, t: 79.9, r: 0 },
];
const LOG_SLOT_W = 38.2;

const PLANK_PILE = { l: 31.7, t: 56.9 };
// 3 deck sections — Canva planks 513.5x324.6 px on the 2048x1536 page.
const PLANK_SLOTS = [
  { l: 40.7, t: 72.4, r: 0 },
  { l: 56.6, t: 75.5, r: 0 },
  { l: 70.6, t: 78.2, r: -1 },
];
const PLANK_SLOT_W = 18.9;

// Pegs — 3 taps, each drives a GROUP OF 4 (2 near + 2 far) → 12 posts.
// Seeded from 3 Canva peg-groups: box X/Y/W/H
//   G1 603.4/925.6/479.1/344.1 · G2 904.9/967.8/508.6/372.9 · G3 1182.6/1026.5/513.5/342.3
const PEG_ROWS = [
  [{ l: 33.8, t: 75.1, r: 0 }, { l: 50.0, t: 78.2, r: 0 }, { l: 63.3, t: 80.7, r: 0 }], // near-left of each group (tap target)
  [{ l: 40.8, t: 76.7, r: 0 }, { l: 56.6, t: 80.2, r: 0 }, { l: 70.9, t: 82.8, r: 0 }], // near-right
  [{ l: 41.0, t: 66.0, r: 0 }, { l: 57.2, t: 68.7, r: 0 }, { l: 71.8, t: 71.7, r: 0 }], // far-left
  [{ l: 46.9, t: 68.0, r: 0 }, { l: 63.5, t: 70.5, r: 0 }, { l: 77.8, t: 73.4, r: 0 }], // far-right
];
const PEG_SLOTS = PEG_ROWS[0];
const PEG_SLOT_W = 2.5;

// Vines — 3 trace strokes, each lays a near + far wrap → 6 segments. One wrap
// per peg-group, centred on that group's near / far post pair.
const VINE_ROWS = [
  [{ l: 39.9, t: 78.1, r: 0 }, { l: 51.6, t: 81.2, r: 0 }, { l: 64.7, t: 83.4, r: 0 }], // near (trace path)
  [{ l: 47.4, t: 67.1, r: 0 }, { l: 59.1, t: 68.3, r: 0 }, { l: 69.7, t: 71.3, r: 0 }], // far
];
const VINE_SLOTS = VINE_ROWS[0];
const VINE_SLOT_W = 13;
const TRACE_BAND_T = 9; // vertical tolerance (% of stage) around the rail
const TRACE_LEAD = 2; // wrap snaps on slightly before the finger reaches it

const LOG_DROP_RADIUS = 18; // forgiving snap to the active slot
// Anywhere over the gap counts as "close enough" for little hands.
const GAP_ZONE = { l0: 40, l1: 84, t0: 58, t1: 84 };

// friendStep -> piece-placing config. Steps not listed keep the older
// walk-and-drop-material flow (pegs / vines, until those rounds are built).
const PLACE_ROUNDS = {
  // mode 'drag' — pull each piece from a pile into a slot.
  0: { kind: 'log', mode: 'drag', img: logObj, slots: LOG_SLOTS, pile: LOG_PILE, slotW: LOG_SLOT_W },
  // mode 'tap' — tap each slot; Bunny hops along the deck between planks and
  // hops to the far bank after the last one.
  1: {
    kind: 'plank', mode: 'tap', img: plankObj, slots: PLANK_SLOTS, pile: PLANK_PILE,
    slotW: PLANK_SLOT_W, hopAlong: true, farExit: { l: 88, t: 70.2 },
  },
  // mode 'tap' — each tap drives a GROUP: the slot + every extra row → 4 posts.
  // Squirrel hops group-to-group, then hops to the far bank.
  2: {
    kind: 'peg', mode: 'tap', img: pegObj, slots: PEG_SLOTS, farSlots: PEG_ROWS.slice(1),
    slotW: PEG_SLOT_W, hopAlong: true, farExit: { l: 78.7, t: 58.2 },
  },
  // mode 'trace' — each stroke lays a near + far wrap.
  3: { kind: 'vine', mode: 'trace', img: vineObj, slots: VINE_SLOTS, farSlots: VINE_ROWS.slice(1), slotW: VINE_SLOT_W },
};
const LAST_PLACE_ROUND = 3; // highest friendStep that uses PLACE_ROUNDS

// ---------------------------------------------------------------------------
// Layout Debug panel (ported from MahakayaRescueGame). Drag any marker on the
// scene to place it, fine-tune with the sliders, then "Copy Layout JSON" to
// paste the values back into scene3LayoutConfig.js / the consts above.
// ---------------------------------------------------------------------------
const DEBUG_PANEL_KEYS = [
  ['friend0', 'Turtle (start)'],
  ['friend1', 'Bunny (start)'],
  ['friend2', 'Squirrel (start)'],
  ['friend3', 'Bird (start)'],
  ['helpTokenHome', 'Help bubble home'],
  ['wait0', 'Turtle wait spot'],
  ['wait1', 'Bunny wait spot'],
  ['wait2', 'Squirrel wait spot'],
  ['wait3', 'Bird wait spot'],
  ['farExit1', 'Bunny final spot'],
  ['farExit2', 'Squirrel final spot'],
  ['delivery0', 'Turtle walk-to (round 1)'],
  ['delivery1', 'Bunny walk-to (round 2)'],
  ['delivery2', 'Squirrel walk-to (round 3)'],
  ['delivery3', 'Bird walk-to (round 4)'],
  ['bridge', 'Bridge'],
  ['beaverBaby', 'Baby beaver'],
  ['logPile', 'Log pile (round 1)'],
  ['logSlot0', 'Log slot 1  (+ log size)'],
  ['logSlot1', 'Log slot 2'],
  ['logSlot2', 'Log slot 3'],
  ['plankPile', 'Plank pile (round 2)'],
  ['plankSlot0', 'Plank slot 1  (+ plank size)'],
  ['plankSlot1', 'Plank slot 2'],
  ['plankSlot2', 'Plank slot 3'],
  ['peg0_0', 'Peg grp1·a  (+ peg size)'], ['peg0_1', 'Peg grp2·a'], ['peg0_2', 'Peg grp3·a'],
  ['peg1_0', 'Peg grp1·b'], ['peg1_1', 'Peg grp2·b'], ['peg1_2', 'Peg grp3·b'],
  ['peg2_0', 'Peg grp1·c'], ['peg2_1', 'Peg grp2·c'], ['peg2_2', 'Peg grp3·c'],
  ['peg3_0', 'Peg grp1·d'], ['peg3_1', 'Peg grp2·d'], ['peg3_2', 'Peg grp3·d'],
  ['vine0_0', 'Vine near 1  (+ vine size)'], ['vine0_1', 'Vine near 2'], ['vine0_2', 'Vine near 3'],
  ['vine1_0', 'Vine far 1'], ['vine1_1', 'Vine far 2'], ['vine1_2', 'Vine far 3'],
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
  const wOf = (k, fallback) => (layout && layout[k] && layout[k].w != null ? layout[k].w : fallback);
  if (key.startsWith('friend')) return { src: FRIENDS[tail]?.carryImg, w: pos.w || 10, r: 0 };
  if (key.startsWith('wait')) return { src: FRIENDS[tail]?.emptyImg, w: 10, r: 0 };
  if (key.startsWith('farExit')) return { src: FRIENDS[tail]?.emptyImg, w: 10, r: 0 };
  if (key.startsWith('delivery')) return { src: FRIENDS[tail]?.carryImg, w: 10, r: 0 };
  if (key === 'helpTokenHome') return { src: helpHandIconImg, w: 8, r: 0 };
  if (key === 'beaverBaby') return { src: beaverBabyImg, w: KURUMEDEVA_LAYOUT.beaverBaby.w, r: 0 };
  if (key.startsWith('beaverPath')) return { src: beaverSadImg, w: KURUMEDEVA_LAYOUT.beaver.w, r: 0 };
  if (key === 'logPile' || key.startsWith('logSlot')) return { src: logObj, w: wOf('logSlot0', LOG_SLOT_W), r };
  if (key === 'plankPile' || key.startsWith('plankSlot')) return { src: plankObj, w: wOf('plankSlot0', PLANK_SLOT_W), r };
  if (key.startsWith('peg')) return { src: pegObj, w: wOf('peg0_0', PEG_SLOT_W), r };
  if (key.startsWith('vine')) return { src: vineObj, w: wOf('vine0_0', VINE_SLOT_W), r };
  return null; // bridge anchor etc. → dot
}

// Only the markers for one phase show at a time — keeps the scene readable.
const DEBUG_PHASES = [
  { label: 'Phase 0 — Setup', keys: ['friend0', 'friend1', 'friend2', 'friend3', 'helpTokenHome', 'beaverBaby', 'bridge'] },
  { label: 'Phase 1 — Logs (Turtle)', keys: ['delivery0', 'wait0', 'logPile', 'logSlot0', 'logSlot1', 'logSlot2'] },
  { label: 'Phase 2 — Planks (Bunny)', keys: ['delivery1', 'farExit1', 'plankPile', 'plankSlot0', 'plankSlot1', 'plankSlot2'] },
  { label: 'Phase 3 — Pegs (Squirrel)', keys: ['delivery2', 'farExit2', 'peg0_0', 'peg0_1', 'peg0_2', 'peg1_0', 'peg1_1', 'peg1_2', 'peg2_0', 'peg2_1', 'peg2_2', 'peg3_0', 'peg3_1', 'peg3_2'] },
  { label: 'Phase 4 — Vines (Bird)', keys: ['delivery3', 'wait3', 'vine0_0', 'vine0_1', 'vine0_2', 'vine1_0', 'vine1_1', 'vine1_2'] },
  { label: 'Phase 5 — Crossing', keys: ['beaverPath0', 'beaverPath1', 'beaverPath2', 'beaverPath3', 'beaverPath4', 'beaverPath5', 'beaverPath6'] },
];

function buildDebugLayout() {
  const layout = {};
  FRIENDS.forEach((friend, index) => {
    layout[`friend${index}`] = { l: friend.l, t: friend.t, w: friend.w };
  });
  WAIT_SPOTS.forEach((spot, index) => {
    layout[`wait${index}`] = { l: spot.l, t: spot.t };
  });
  DELIVERY_SPOTS.forEach((spot, index) => {
    layout[`delivery${index}`] = { l: spot.l, t: spot.t };
  });
  [1, 2].forEach((i) => {
    const fx = PLACE_ROUNDS[i] && PLACE_ROUNDS[i].farExit;
    if (fx) layout[`farExit${i}`] = { l: fx.l, t: fx.t };
  });
  layout.helpTokenHome = { ...HELP_TOKEN_HOME };
  layout.bridge = {
    l: KURUMEDEVA_LAYOUT.bridge.l,
    t: KURUMEDEVA_LAYOUT.bridge.t,
    w: KURUMEDEVA_LAYOUT.bridge.w,
  };
  layout.beaverBaby = {
    l: KURUMEDEVA_LAYOUT.beaverBaby.l,
    t: KURUMEDEVA_LAYOUT.beaverBaby.t,
    w: KURUMEDEVA_LAYOUT.beaverBaby.w,
  };
  // Slot 0 of each round also carries `w` = that piece's on-screen size, so the
  // panel exposes a width slider for it.
  // Slot 0 of each round also carries `w` = that piece's size; every slot
  // carries `r` = its rotation. The panel exposes sliders for both.
  layout.logPile = { ...LOG_PILE };
  LOG_SLOTS.forEach((slot, index) => {
    layout[`logSlot${index}`] = index === 0
      ? { l: slot.l, t: slot.t, w: LOG_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  });
  layout.plankPile = { ...PLANK_PILE };
  PLANK_SLOTS.forEach((slot, index) => {
    layout[`plankSlot${index}`] = index === 0
      ? { l: slot.l, t: slot.t, w: PLANK_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  });
  PEG_ROWS.forEach((row, r) => row.forEach((slot, index) => {
    layout[`peg${r}_${index}`] = r === 0 && index === 0
      ? { l: slot.l, t: slot.t, w: PEG_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  }));
  VINE_ROWS.forEach((row, r) => row.forEach((slot, index) => {
    layout[`vine${r}_${index}`] = r === 0 && index === 0
      ? { l: slot.l, t: slot.t, w: VINE_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  }));
  KURUMEDEVA_LAYOUT.beaverPath.forEach((point, index) => {
    layout[`beaverPath${index}`] = { l: point.l, t: point.t };
  });
  return layout;
}

const round1 = (n) => Number(Number(n).toFixed(1));

export default function KurumedevaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const [friendStep, setFriendStep] = useState(0);
  const [bridgeStep, setBridgeStep] = useState(0);
  const [phase, setPhase] = useState('play');
  const [beaverPos, setBeaverPos] = useState(BEAVER_PATH[0]);
  const [litCount, setLitCount] = useState(0);
  const [tappedId, setTappedId] = useState(null);
  const [friendImgStates, setFriendImgStates] = useState(() => FRIENDS.map(() => 'carry'));
  const [objectPhases, setObjectPhases] = useState(() => FRIENDS.map(() => 'idle'));
  const [friendPositions, setFriendPositions] = useState(() => FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
  const [helpTokenPos, setHelpTokenPos] = useState(HELP_TOKEN_HOME);
  const [isDraggingHelp, setIsDraggingHelp] = useState(false);
  const [helpDelivered, setHelpDelivered] = useState(false);
  const [isRoundSettling, setIsRoundSettling] = useState(false);
  const [walkingIndex, setWalkingIndex] = useState(null);

  // Per-piece rounds — drag 3 pieces into the gap (logs, then planks, ...).
  const [placeActive, setPlaceActive] = useState(false);
  const [placedCount, setPlacedCount] = useState(0);
  const [pieceDragActive, setPieceDragActive] = useState(false);
  const [pieceDragPos, setPieceDragPos] = useState(null);
  const pieceDragRef = useRef(null);
  const placeDoneRef = useRef(false);
  const hopRef = useRef(0);

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
  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !isRoundSettling && !debugMode,
    stageKey: phase === 'play'
      ? (placeActive ? `place-${friendStep}` : `friend-${friendStep}`)
      : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15000,
    level3Delay: 22000,
  });
  const currentFriend = friendStep < FRIENDS.length ? FRIENDS[friendStep] : null;

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
      setObjectPhases(FRIENDS.map(() => 'idle'));
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
      hopRef.current = 0;
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

  const askFriendForHelp = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (placeActive) return;
    if (friendIndex !== friendStep) return;
    if (friendImgStates[friendIndex] !== 'carry') return;
    stopSceneVoice?.();
    markInteraction();
    const friend = FRIENDS[friendIndex];
    const friendPos = friendPositions[friendIndex] || friend;
    const targetL = friendPos.l + (friendIndex === 0 ? TURTLE_RIVER_SHIFT : 0);
    const targetT = friendPos.t;

    setIsDraggingHelp(false);
    setHelpTokenPos({ l: targetL, t: targetT });
    setHelpDelivered(true);
    dragPointerRef.current = null;
    setIsRoundSettling(true);

    setTappedId(friend.id);
    safeAfter(250, () => setTappedId(null));

    // --- Per-piece round: friend carries the pile to the gap, then the child
    //     drags the 3 pieces in one by one. No auto-advance — the effect below
    //     finishes it once placedCount reaches 3. ---
    if (PLACE_ROUNDS[friendIndex]) {
      const cfg = PLACE_ROUNDS[friendIndex];
      placeDoneRef.current = false;
      hopRef.current = 0;
      setPlacedCount(0);
      setWalkingIndex(friendIndex);
      setFriendPositions((prev) => {
        const next = [...prev];
        next[friendIndex] = cfg.hopAlong
          ? { l: cfg.slots[0].l - 4, t: cfg.slots[0].t - 7 }
          : DELIVERY_SPOTS[friendIndex];
        return next;
      });
      safeAfter(WALK_TO_MS, () => {
        setWalkingIndex(null);
        setPlaceActive(true);
        setIsRoundSettling(false); // let the "drag a piece" hint run
      });
      return;
    }

    // 1) Friend picks up its material and walks to the bridge gap.
    setWalkingIndex(friendIndex);
    setObjectPhases((prev) => {
      const next = [...prev];
      next[friendIndex] = 'carrying';
      return next;
    });
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendIndex] = DELIVERY_SPOTS[friendIndex];
      return next;
    });

    // 2) On arrival, the material hops onto the bridge.
    safeAfter(WALK_TO_MS, () => {
      setObjectPhases((prev) => {
        const next = [...prev];
        next[friendIndex] = 'flying';
        return next;
      });
    });

    // 3) Material lands — friend switches to its empty pose, bridge advances,
    //    syllable lights.
    safeAfter(WALK_TO_MS + DELIVER_MS, () => {
      setFriendImgStates((prev) => {
        const next = [...prev];
        next[friendIndex] = 'empty';
        return next;
      });
      setObjectPhases((prev) => {
        const next = [...prev];
        next[friendIndex] = 'gone';
        return next;
      });
      setBridgeStep(friendIndex + 1);
      window.setTimeout(() => onMicroWin?.(), 0);
      setLitCount(friendIndex + 1);
    });

    // 4) Friend walks back to the bank line.
    safeAfter(WALK_TO_MS + DELIVER_MS + 150, () => {
      moveFriendToWait(friendIndex);
    });

    // 5) Round settles — advance to the next friend (or start the crossing).
    safeAfter(WALK_TO_MS + DELIVER_MS + 150 + WALK_BACK_MS, () => {
      setWalkingIndex(null);
      const nextStep = friendIndex + 1;
      setFriendStep(nextStep);

      if (nextStep >= FRIENDS.length) {
        safeAfter(420, () => {
          setHelpDelivered(false);
          setIsRoundSettling(false);
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(4);
        });
        return;
      }

      setHelpDelivered(false);
      setHelpTokenPos(HELP_TOKEN_HOME);
      setIsRoundSettling(false);
    });
  }, [friendPositions, friendStep, friendImgStates, isPaused, markInteraction, moveFriendToWait, onMicroWin, placeActive, safeAfter, stopSceneVoice]);

  // --- Per-piece drag handlers: pull a piece from the pile into the gap ------
  const placeNextPiece = useCallback(() => {
    setPlacedCount((n) => Math.min(3, n + 1));
  }, []);

  // `hopAlong` rounds: friend hops to stand beside the next slot after each
  // placement (the far-bank hop after the 3rd is handled by the completion effect).
  useEffect(() => {
    if (!placeActive) { hopRef.current = 0; return; }
    const cfg = PLACE_ROUNDS[friendStep];
    if (!cfg?.hopAlong || placedCount === hopRef.current) return;
    hopRef.current = placedCount;
    if (placedCount < 1 || placedCount >= 3) return;
    const s = cfg.slots[placedCount];
    setWalkingIndex(friendStep);
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendStep] = { l: s.l - 4, t: s.t - 7 };
      return next;
    });
    safeAfter(650, () => setWalkingIndex(null));
  }, [placeActive, placedCount, friendStep, safeAfter]);

  // Tap-mode: tap the glowing slot and the piece drops in.
  const handleSlotTap = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= 3) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    markInteraction();
    placeNextPiece();
  }, [isPaused, markInteraction, placeActive, placedCount, placeNextPiece, stopSceneVoice]);

  // Trace-mode: one stroke along the rail places each wrap as the finger passes.
  const traceStartLRef = useRef(null);
  const maybePlaceAlongTrace = useCallback((point) => {
    const cfg = PLACE_ROUNDS[friendStep];
    if (!cfg || cfg.mode !== 'trace') return;
    // A stroke that began at/left of the first post is a genuine left-to-right
    // trace — accept it generously (fast flicks included). One that began
    // further in must actually sweep through each post's neighbourhood.
    const cleanStart = traceStartLRef.current != null
      && traceStartLRef.current <= cfg.slots[0].l + 6;
    setPlacedCount((n) => {
      let k = n;
      while (k < 3) {
        const slot = cfg.slots[k];
        const onBand = Math.abs(point.t - slot.t) <= TRACE_BAND_T;
        const reached = cleanStart
          ? point.l >= slot.l - TRACE_LEAD
          : point.l >= slot.l - TRACE_LEAD && point.l <= slot.l + 14;
        if (onBand && reached) k += 1;
        else break;
      }
      return k;
    });
  }, [friendStep]);

  const handleTracePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= 3) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    markInteraction();
    pieceDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPieceDragActive(true);
    const point = getStagePoint(event);
    traceStartLRef.current = point.l;
    setPieceDragPos(point);
    maybePlaceAlongTrace(point);
  }, [getStagePoint, isPaused, markInteraction, maybePlaceAlongTrace, placeActive, placedCount, stopSceneVoice]);

  const handleTracePointerMove = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId || !pieceDragActive) return;
    event.preventDefault();
    const point = getStagePoint(event);
    setPieceDragPos(point);
    maybePlaceAlongTrace(point);
  }, [getStagePoint, maybePlaceAlongTrace, pieceDragActive]);

  const handlePiecePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= 3) return;
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
    traceStartLRef.current = null;
    setPieceDragActive(false);
    setPieceDragPos(null);
  }, []);

  const handlePiecePointerUp = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const cfg = PLACE_ROUNDS[friendStep];
    const drop = getStagePoint(event);
    const slot = cfg ? (cfg.slots[placedCount] || cfg.slots[cfg.slots.length - 1]) : null;
    const near = slot
      && Math.hypot(drop.l - slot.l, drop.t - slot.t) <= LOG_DROP_RADIUS;
    const overGap = drop.l >= GAP_ZONE.l0 && drop.l <= GAP_ZONE.l1
      && drop.t >= GAP_ZONE.t0 && drop.t <= GAP_ZONE.t1;
    endPieceDrag();
    if (near || overGap) placeNextPiece();
  }, [endPieceDrag, friendStep, getStagePoint, placedCount, placeNextPiece]);

  // A per-piece round completes once all 3 pieces are in — light its syllable,
  // walk the friend to the bank line, then hand over to the next round.
  useEffect(() => {
    if (!placeActive || placedCount < 3 || placeDoneRef.current) return;
    placeDoneRef.current = true;

    const idx = friendStep;
    setLitCount(idx + 1);
    window.setTimeout(() => onMicroWin?.(), 0);
    setBridgeStep(idx + 1);
    setPlaceActive(false);
    setIsRoundSettling(true);

    setFriendImgStates((prev) => {
      const next = [...prev];
      next[idx] = 'empty';
      return next;
    });
    setWalkingIndex(idx);
    safeAfter(250, () => {
      setFriendPositions((prev) => {
        const next = [...prev];
        const cfg = PLACE_ROUNDS[idx];
        next[idx] = cfg?.farExit ? cfg.farExit : WAIT_SPOTS[idx];
        return next;
      });
    });
    safeAfter(250 + WALK_BACK_MS, () => {
      setWalkingIndex(null);
      setFriendStep(idx + 1);
      setHelpDelivered(false);
      setHelpTokenPos(HELP_TOKEN_HOME);

      if (idx + 1 >= FRIENDS.length) {
        // Last round done — the bridge is fully built. Start the crossing.
        safeAfter(420, () => {
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(FRIENDS.length);
        });
        return;
      }

      setIsRoundSettling(false);
    });
  }, [placeActive, placedCount, friendStep, onMicroWin, safeAfter]);

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
    const targetL = friendPos.l + (friendStep === 0 ? TURTLE_RIVER_SHIFT : 0);
    const targetT = friendPos.t;
    const distance = Math.hypot(dropPoint.l - targetL, dropPoint.t - targetT);
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
        playSceneLine('kuru_done', () => {
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
          // Off the bridge — one last step to reunite with the baby.
          safeAfter(700, () => {
            setBeaverPos({
              l: KURUMEDEVA_LAYOUT.beaverBaby.l + 5,
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

  const copyLayoutJson = async () => {
    const payload = JSON.stringify(
      {
        friends: FRIENDS.map((friend, index) => ({
          id: friend.id,
          label: friend.label,
          brings: friend.brings,
          l: round1(debugLayout[`friend${index}`].l),
          t: round1(debugLayout[`friend${index}`].t),
          w: round1(debugLayout[`friend${index}`].w),
          flip: friend.flip,
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
        },
        beaverBaby: {
          ...KURUMEDEVA_LAYOUT.beaverBaby,
          l: round1(debugLayout.beaverBaby.l),
          t: round1(debugLayout.beaverBaby.t),
          w: round1(debugLayout.beaverBaby.w),
        },
        HELP_TOKEN_HOME: {
          l: round1(debugLayout.helpTokenHome.l),
          t: round1(debugLayout.helpTokenHome.t),
        },
        WAIT_SPOTS: WAIT_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`wait${index}`].l),
          t: round1(debugLayout[`wait${index}`].t),
        })),
        DELIVERY_SPOTS: DELIVERY_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`delivery${index}`].l),
          t: round1(debugLayout[`delivery${index}`].t),
        })),
        BUNNY_FAR_EXIT: debugLayout.farExit1 && {
          l: round1(debugLayout.farExit1.l),
          t: round1(debugLayout.farExit1.t),
        },
        SQUIRREL_FAR_EXIT: debugLayout.farExit2 && {
          l: round1(debugLayout.farExit2.l),
          t: round1(debugLayout.farExit2.t),
        },
        LOG_SLOT_W: round1(debugLayout.logSlot0.w),
        PLANK_SLOT_W: round1(debugLayout.plankSlot0.w),
        PEG_SLOT_W: round1(debugLayout.peg0_0.w),
        VINE_SLOT_W: round1(debugLayout.vine0_0.w),
        LOG_PILE: {
          l: round1(debugLayout.logPile.l),
          t: round1(debugLayout.logPile.t),
        },
        LOG_SLOTS: LOG_SLOTS.map((slot, index) => ({
          l: round1(debugLayout[`logSlot${index}`].l),
          t: round1(debugLayout[`logSlot${index}`].t),
          r: round1(debugLayout[`logSlot${index}`].r ?? 0),
        })),
        PLANK_PILE: {
          l: round1(debugLayout.plankPile.l),
          t: round1(debugLayout.plankPile.t),
        },
        PLANK_SLOTS: PLANK_SLOTS.map((slot, index) => ({
          l: round1(debugLayout[`plankSlot${index}`].l),
          t: round1(debugLayout[`plankSlot${index}`].t),
          r: round1(debugLayout[`plankSlot${index}`].r ?? 0),
        })),
        PEG_ROWS: PEG_ROWS.map((row, r) => row.map((slot, index) => ({
          l: round1(debugLayout[`peg${r}_${index}`].l),
          t: round1(debugLayout[`peg${r}_${index}`].t),
          r: round1(debugLayout[`peg${r}_${index}`].r ?? 0),
        }))),
        VINE_ROWS: VINE_ROWS.map((row, r) => row.map((slot, index) => ({
          l: round1(debugLayout[`vine${r}_${index}`].l),
          t: round1(debugLayout[`vine${r}_${index}`].t),
          r: round1(debugLayout[`vine${r}_${index}`].r ?? 0),
        }))),
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
        console.log('Kurumedeva layout JSON:', payload);
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

  // Stages 1-2 ARE the pieces the child places (logs, planks) — no image.
  // Stages 3-4 (pegs, vines) still use the placeholder step3-4 art for now; it
  // draws its own logs+deck, so the placed pieces hide once it appears.
  const firstImgStep = LAST_PLACE_ROUND + 2; // bridgeStep at which step-art starts
  const bridgeImg = bridgeStep >= firstImgStep ? FRIENDS[bridgeStep - 1].bridgeImg : null;
  const prevBridgeImg = bridgeStep >= firstImgStep + 1 ? FRIENDS[bridgeStep - 2].bridgeImg : null;
  // Placed pieces ARE the bridge now — keep them through the crossing too, and
  // in debug mode so each phase can be positioned over the layers beneath it.
  const showPlacedPieces = debugMode || bridgeStep < firstImgStep;
  const placeCfg = placeActive ? PLACE_ROUNDS[friendStep] : null;

  // One idle gesture hint, keyed to the current piece/slot (never the friend,
  // so it can't animate toward a walking animal). pointer-events:none overlay.
  const gestureHint = (() => {
    if (phase !== 'play' || debugMode || isRoundSettling) return null;
    if (placeActive && placeCfg) {
      const s = placeCfg.slots[Math.min(placedCount, placeCfg.slots.length - 1)];
      if (placeCfg.mode === 'drag') {
        return { type: 'drag', from: { x: placeCfg.pile.l, y: placeCfg.pile.t }, to: { x: s.l, y: s.t }, k: `drag-${placedCount}` };
      }
      if (placeCfg.mode === 'tap') {
        return { type: 'tap', from: { x: s.l, y: s.t }, to: { x: s.l, y: s.t }, k: `tap-${placedCount}` };
      }
      if (placeCfg.mode === 'trace') {
        const a = placeCfg.slots[0];
        const b = placeCfg.slots[placeCfg.slots.length - 1];
        return { type: 'scratch', from: { x: a.l, y: a.t }, to: { x: b.l, y: b.t }, k: `trace-${placedCount}` };
      }
    }
    if (currentFriend && !placeActive) {
      const fp = friendPositions[friendStep] || currentFriend;
      return { type: 'drag', from: { x: HELP_TOKEN_HOME.l, y: HELP_TOKEN_HOME.t }, to: { x: fp.l, y: fp.t }, k: `ask-${friendStep}` };
    }
    return null;
  })();
  const beaverImg = phase === 'crossing' || phase === 'done' ? beaverHappyImg : beaverSadImg;

  return (
    <div className={`kuru-game${hideElements ? ' is-hidden' : ''}${debugMode ? ' is-debugging' : ''}`}>
      <div
        ref={stageRef}
        className="kuru-stage"
        style={{ backgroundImage: `url(${bgImg})` }}
        onPointerMove={debugMode ? applyDebugDrag : undefined}
        onPointerUp={debugMode ? endDebugDrag : undefined}
        onPointerCancel={debugMode ? endDebugDrag : undefined}
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

        {phase === 'play' && !isRoundSettling && !debugMode && placeCfg && (
          <p className="kuru-hint">
            {hintLevel < 2 && (
              placeCfg.mode === 'trace' ? 'Trace along the rail to wind the vine.'
                : placeCfg.mode === 'tap' ? `Tap each glowing spot to add a ${placeCfg.kind}.`
                  : `Drag a ${placeCfg.kind} across the gap.`)}
            {hintLevel >= 2 && (
              placeCfg.mode === 'trace' ? `Keep tracing along the rail — ${3 - placedCount} to go.`
                : placeCfg.mode === 'tap' ? `Tap each glowing spot — ${3 - placedCount} to go.`
                  : `Drop each ${placeCfg.kind} on a glowing spot — ${3 - placedCount} to go.`)}
          </p>
        )}

        {phase === 'play' && currentFriend && !isRoundSettling && !debugMode && !placeActive && (
          <p className="kuru-hint">
            {(hintLevel === 0 || hintLevel === 1) && 'Who can Beaver ask for help?'}
            {hintLevel === 2 && `Ask ${currentFriend.label} for help.`}
            {hintLevel >= 3 && `Drag the help bubble to ${currentFriend.label}.`}
          </p>
        )}

        {phase === 'done' && (
          <p className="kuru-doneline">You asked for help! The bridge is ready!</p>
        )}

        {bridgeImg && (
          <div
            className={`kuru-bridge${bridgeStep === 4 ? ' is-complete' : ''}`}
            style={{
              left: `${KURUMEDEVA_LAYOUT.bridge.l}%`,
              top: `${KURUMEDEVA_LAYOUT.bridge.t}%`,
              width: `${KURUMEDEVA_LAYOUT.bridge.w}%`,
              transform: `translate(-50%, -50%) rotate(${KURUMEDEVA_LAYOUT.bridge.r || 0}deg) scaleX(${KURUMEDEVA_LAYOUT.bridge.flip ? -1 : 1}) scale(1.3)`,
            }}
          >
            {prevBridgeImg && (
              <img
                key={`bridge-prev-${bridgeStep}`}
                className="kuru-bridge-img is-prev"
                src={prevBridgeImg}
                alt=""
                draggable={false}
              />
            )}
            <img
              key={`bridge-cur-${bridgeStep}`}
              className="kuru-bridge-img is-cur"
              src={bridgeImg}
              alt="bridge"
              draggable={false}
            />
          </div>
        )}

        {/* Per-piece rounds — pieces the child has dropped into the gap. They
            ARE the bridge (logs → planks → pegs, stacking) and persist until
            the round-4 step art covers them. */}
        {showPlacedPieces && Array.from({ length: LAST_PLACE_ROUND + 1 }, (_, r) => r).map((roundIndex) => {
          const cfg = PLACE_ROUNDS[roundIndex];
          if (!cfg) return null;
          // In debug: show every round below the selected phase fully built.
          const debugDone = debugMode && roundIndex <= debugPhase - 2;
          const roundDone = debugDone || bridgeStep > roundIndex;
          const roundCurrent = !debugMode && placeActive && friendStep === roundIndex;
          if (!roundDone && !roundCurrent) return null;
          const count = roundDone ? cfg.slots.length : placedCount;
          return cfg.slots.slice(0, count).flatMap((slot, i) => {
            const isNewest = !roundDone && i === count - 1;
            const dropCls = isNewest
              ? ` is-newest${cfg.mode === 'tap' ? ' is-drop' : cfg.mode === 'drag' ? ' is-roll' : ''}`
              : '';
            const spots = [{ pos: slot, back: false, si: 0 }];
            (cfg.farSlots || []).forEach((row, ri) => {
              const p = row[i];
              if (p) spots.push({ pos: p, back: p.t < slot.t - 3, si: ri + 1 });
            });
            // back-rail pieces render first (lower z), front last
            spots.sort((a, b) => Number(b.back) - Number(a.back));
            const multi = spots.length > 1;
            return spots.map(({ pos, back, si }) => (
              <div
                key={`piece-${cfg.kind}-${si}-${i}`}
                className={`kuru-span-log is-${cfg.kind}${multi ? (back ? ' is-back' : ' is-front') : ''}${dropCls}`}
                style={{
                  left: `${pos.l}%`,
                  top: `${pos.t}%`,
                  width: `${cfg.slotW}%`,
                  transform: `translate(-50%, -50%) rotate(${pos.r || 0}deg)`,
                }}
              >
                <img src={cfg.img} alt="" draggable={false} />
              </div>
            ));
          });
        })}

        {/* Active round, TAP mode — the glowing slot is the tap target, no pile. */}
        {placeActive && placeCfg && placeCfg.mode === 'tap' && phase === 'play' && placedCount < 3 && (
          <>
            {/* Small non-interactive supply pile that shrinks as pieces are placed. */}
            {placeCfg.pile && Array.from({ length: 3 - placedCount }).map((_, i) => (
              <div
                key={`tpile-${placeCfg.kind}-${placedCount}-${i}`}
                className={`kuru-log-piece is-${placeCfg.kind}`}
                style={{
                  left: `${placeCfg.pile.l + i * 0.5}%`,
                  top: `${placeCfg.pile.t - i * 2.6}%`,
                  width: `${placeCfg.slotW * 0.55}%`,
                  pointerEvents: 'none',
                }}
              >
                <img src={placeCfg.img} alt="" draggable={false} />
              </div>
            ))}
            <button
              type="button"
              className={`kuru-span-log is-${placeCfg.kind} is-ghost is-tappable${hintLevel >= 1 ? ' beckon' : ''}`}
              style={{
                left: `${placeCfg.slots[placedCount].l}%`,
                top: `${placeCfg.slots[placedCount].t}%`,
                width: `${placeCfg.slotW}%`,
                transform: `translate(-50%, -50%) rotate(${placeCfg.slots[placedCount].r || 0}deg)`,
              }}
              aria-label={`Tap to lay a ${placeCfg.kind}`}
              onPointerDown={handleSlotTap}
            >
              <img src={placeCfg.img} alt="" draggable={false} />
            </button>
          </>
        )}

        {/* Active round, TRACE mode — dashed rail guide + a stroke band. */}
        {placeActive && placeCfg && placeCfg.mode === 'trace' && phase === 'play' && placedCount < 3 && (
          <>
            <svg className="kuru-trace-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={placeCfg.slots.map((s) => `${s.l},${s.t}`).join(' ')} />
            </svg>
            <div
              className="kuru-span-log is-vine is-ghost beckon"
              style={{
                left: `${placeCfg.slots[placedCount].l}%`,
                top: `${placeCfg.slots[placedCount].t}%`,
                width: `${placeCfg.slotW}%`,
                transform: `translate(-50%, -50%) rotate(${placeCfg.slots[placedCount].r || 0}deg)`,
              }}
            >
              <img src={placeCfg.img} alt="" draggable={false} />
            </div>
            <button
              type="button"
              className="kuru-trace-band"
              style={{
                left: `${(placeCfg.slots[0].l + placeCfg.slots[placeCfg.slots.length - 1].l) / 2}%`,
                top: `${placeCfg.slots[0].t}%`,
                width: `${Math.abs(placeCfg.slots[placeCfg.slots.length - 1].l - placeCfg.slots[0].l) + 26}%`,
                height: `${TRACE_BAND_T * 2}%`,
              }}
              aria-label="Trace along the rail to wind the vine"
              onPointerDown={handleTracePointerDown}
              onPointerMove={handleTracePointerMove}
              onPointerUp={endPieceDrag}
              onPointerCancel={endPieceDrag}
            />
          </>
        )}

        {/* Active round, DRAG mode — ghost slot + draggable pile at the friend's feet. */}
        {placeActive && placeCfg && placeCfg.mode === 'drag' && phase === 'play' && placedCount < 3 && (
          <>
            <div
              className={`kuru-span-log is-${placeCfg.kind} is-ghost`}
              style={{
                left: `${placeCfg.slots[placedCount].l}%`,
                top: `${placeCfg.slots[placedCount].t}%`,
                width: `${placeCfg.slotW}%`,
                transform: `translate(-50%, -50%) rotate(${placeCfg.slots[placedCount].r || 0}deg)`,
              }}
            >
              <img src={placeCfg.img} alt="" draggable={false} />
            </div>

            {Array.from({ length: 3 - placedCount }).map((_, i) => {
              const isTop = i === 0;
              const dragging = isTop && pieceDragActive;
              const pileL = placeCfg.pile.l + i * 0.5;
              const pileT = placeCfg.pile.t - i * 2.6;
              // Pile pieces sit small; the one being dragged grows to slot size.
              const pieceW = dragging ? placeCfg.slotW : placeCfg.slotW * 0.6;
              return (
                <button
                  key={`pile-${placeCfg.kind}-${placedCount}-${i}`}
                  type="button"
                  className={`kuru-log-piece is-${placeCfg.kind}${isTop ? ' is-top' : ''}${dragging ? ' is-dragging' : ''}${isTop && hintLevel >= 1 && !pieceDragActive ? ' pulse' : ''}`}
                  style={{
                    left: `${dragging && pieceDragPos ? pieceDragPos.l : pileL}%`,
                    top: `${dragging && pieceDragPos ? pieceDragPos.t : pileT}%`,
                    width: `${pieceW}%`,
                    transition: 'width 0.15s ease',
                  }}
                  aria-label={`Drag a ${placeCfg.kind} across the gap`}
                  onPointerDown={isTop ? handlePiecePointerDown : undefined}
                  onPointerMove={isTop ? handlePiecePointerMove : undefined}
                  onPointerUp={isTop ? handlePiecePointerUp : undefined}
                  onPointerCancel={isTop ? endPieceDrag : undefined}
                >
                  <img src={placeCfg.img} alt="" draggable={false} />
                </button>
              );
            })}
          </>
        )}

        <div
          className={`kuru-beaver${phase === 'crossing' || phase === 'done' ? ' is-walking' : ''}`}
          style={{
            left: `${beaverPos.l}%`,
            top: `${beaverPos.t}%`,
            width: `${KURUMEDEVA_LAYOUT.beaver.w}%`,
            scale: KURUMEDEVA_LAYOUT.beaver.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={beaverImg} alt="Beaver" draggable={false} />
        </div>

        <div
          className="kuru-beaver-baby"
          style={{
            left: `${KURUMEDEVA_LAYOUT.beaverBaby.l}%`,
            top: `${KURUMEDEVA_LAYOUT.beaverBaby.t}%`,
            width: `${KURUMEDEVA_LAYOUT.beaverBaby.w}%`,
            scale: KURUMEDEVA_LAYOUT.beaverBaby.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={beaverBabyImg} alt="Baby beaver" draggable={false} />
        </div>

        {FRIENDS.map((friend, index) => {
          const objPhase = objectPhases[index];
          if (objPhase === 'gone') return null;

          const isFlying = objPhase === 'flying';
          const isCarrying = objPhase === 'carrying';
          // Rest position tracks the friend so the material rides along the walk.
          const fp = friendPositions[index] || friend;
          const restL = fp.l + friend.objectOffset.l + (index === 0 ? TURTLE_RIVER_SHIFT : 0);
          const restT = fp.t + friend.objectOffset.t;
          const objClass = isFlying
            ? `kuru-object kuru-object--flying ${friend.objectAnim}`
            : isCarrying
              ? 'kuru-object kuru-object--carrying'
              : 'kuru-object kuru-object--idle';

          return (
            <div
              key={`obj-${friend.id}`}
              className={objClass}
              style={{
                left: isFlying ? `${BRIDGE_TARGET.l}%` : `${restL}%`,
                top: isFlying ? `${BRIDGE_TARGET.t}%` : `${restT}%`,
                width: `${friend.objectW}%`,
              }}
            >
              <img src={friend.objectImg} alt={friend.brings} draggable={false} />
            </div>
          );
        })}

        {!debugMode && FRIENDS.map((friend, index) => {
          const imgState = friendImgStates[index];
          const pos = friendPositions[index];
          const isCurrent = index === friendStep && phase === 'play';
          const isTapped = tappedId === friend.id;
          const isWaiting = index > friendStep;
          const isHelped = imgState === 'empty' && index <= friendStep;
          const isCrossing = phase === 'crossing' || phase === 'done';
          const isWalking = walkingIndex === index;

          return (
            <div
              key={friend.id}
              data-friend-id={friend.id}
              className={`
                kuru-friend
                ${isCurrent && imgState === 'carry' ? 'is-active' : ''}
                ${isTapped ? 'is-tapped' : ''}
                ${isWaiting ? 'kuru-friend--waiting' : ''}
                ${isHelped ? 'kuru-friend--helped' : ''}
                ${isCrossing ? 'kuru-friend--crossing' : ''}
                ${isWalking ? 'is-walking' : ''}
                ${isCurrent && imgState === 'carry' && hintLevel >= 2 ? 'pulse' : ''}
              `}
              style={{
                left: `${pos.l + (index === 0 ? TURTLE_RIVER_SHIFT : 0)}%`,
                top: `${pos.t}%`,
                width: `${friend.w * KURU_HIT_SCALE}%`,
                scale: friend.flip ? '-1 1' : '1 1',
              }}
            >
              <img
                src={imgState === 'carry' ? friend.carryImg : friend.emptyImg}
                alt={friend.label}
                draggable={false}
              />
            </div>
          );
        })}

        {phase === 'play' && currentFriend && !debugMode && !placeActive && (
          <>
            <button
              type="button"
              className={`kuru-help-token${isDraggingHelp ? ' is-dragging' : ''}${helpDelivered ? ' is-delivered' : ''}${hintLevel >= 1 && !isDraggingHelp && !helpDelivered ? ' pulse' : ''}`}
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
              <img src={helpHandIconImg} alt="" draggable={false} />
            </button>
          </>
        )}

        {gestureHint && (
          <GestureDemo
            key={gestureHint.k}
            type={gestureHint.type}
            from={gestureHint.from}
            to={gestureHint.to}
            active={hintLevel >= 1}
            idleDelay={400}
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
                    transform: art ? `translate(-50%, -50%) rotate(${art.r || 0}deg)` : undefined,
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

            <div className="kuru-debug-grid">
              <button type="button" onClick={() => setDebugLayout(buildDebugLayout())}>reset all</button>
            </div>

            <pre className="kuru-debug-readout">{JSON.stringify(debugLayout[selectedDebugKey], null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
