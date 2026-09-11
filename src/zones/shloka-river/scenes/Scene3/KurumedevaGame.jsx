import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './KurumedevaGame.css';

import bgImg from './assets/images/nirvighnam/bg.png';

// Bridge redesign (Kurume Deva asset pack) — "asking for help" told through
// 3 helper moments: Elephant pulls the heavy support logs, Monkey ties the
// ropes, then Monkey helps again while Beaver herself lays the planks.
import elephantPullImg from './assets/images/bridge/Characters/elephant-pulling.png';
import elephantHappyImg from './assets/images/bridge/Characters/elephant-happy.png';
import elephantIdleBananaImg from './assets/images/bridge/Characters/elephant-idle-banana.png';
import elephantApproachingImg from './assets/images/bridge/Characters/elephant-approaching-walking.png';
import helpBubbleElephantImg from './assets/images/bridge/Characters/help-bubble-elephant-logs.png';
import monkeyTyingImg from './assets/images/bridge/Characters/monkey-tying.png';
import monkeyHappyImg from './assets/images/bridge/Characters/monkey-happy.png';
import monkeyPlayingTwigImg from './assets/images/bridge/Characters/monkey-playing-twig.png';
import monkeyIdleImg from './assets/images/bridge/Characters/monkey-idle.png';
import helpBubbleMonkeyImg from './assets/images/bridge/Characters/help-bubble-monkey-knot.png';

import supportLogsObj from './assets/images/bridge/Bridge/bridge-support-logs.png';
import shortLogObj from './assets/images/bridge/Bridge/short-single-support-log.png';
// Cropped from the broken-bridge asset's own loose rope tail — the pack has
// no standalone rope glyph, and using the Monkey sprite here duplicated him
// mid-river during the trace.
import ropeObj from './assets/images/bridge/Bridge/rope-knot.png';
import plankObj from './assets/images/bridge/Bridge/bridge-single-plank.png';

import bridgeBrokenImg from './assets/images/bridge/Bridge/bridge-broken.png';
import bridgeSupportedImg from './assets/images/bridge/Bridge/bridge-before-tying.png';
import bridgeCompleteImg from './assets/images/bridge/Bridge/bridge-complete.png';

import beaverAskingImg from './assets/images/bridge/Characters/beaver-asking.png';
import beaverIdleWorriedImg from './assets/images/bridge/Characters/beaver-idle-worried.png';
import beaverTryingPushImg from './assets/images/bridge/Characters/beaver-trying-push.png';
import beaverPlacingPlankImg from './assets/images/bridge/Characters/beaver-placing-plank.png';
import beaverCrossingImg from './assets/images/bridge/Characters/beaver-crossing.png';
import babyBeaverWavingImg from './assets/images/bridge/Characters/baby-beaver-waving.png';
import beaverBabyReunionImg from './assets/images/bridge/Characters/beaver-baby-reunion.png';
import helpHandIconImg from './assets/images/Kurumedeva/help-hand-icon.png';

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Ku', 'ru', 'me', 'deva'];
const BRIDGE_TARGET = {
  l: KURUMEDEVA_LAYOUT.bridge.l,
  t: KURUMEDEVA_LAYOUT.bridge.t,
};
const HELP_TOKEN_HOME = { l: 77.2, t: 60.7 };

// Play order = build order: Elephant's logs span the gap, Monkey ties the
// ropes, then Monkey (with Beaver herself) lays the planks. `bridgeImg` is
// POSITIONAL — it matches the slot in this array, not the animal. The
// `...KURUMEDEVA_LAYOUT.friends[N]` spread points each helper at its own
// start position.
// Locked rhythm (per GMB_KurumeDeva_New_Assets README): exactly two
// "I tried -> I need help -> I ask -> we succeed" loops (Elephant for the
// support logs, Monkey for the rope), then one simple non-gated finishing
// action (Beaver lays the planks alone — no third helper).
const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    label: 'Elephant',
    brings: 'support',
    carryImg: elephantIdleBananaImg, // idle, eating a banana, before being asked
    walkingImg: elephantApproachingImg, // walking over after the ask
    helpingImg: elephantPullImg, // pushing the logs together with Beaver
    emptyImg: elephantHappyImg,
    helpBubbleImg: helpBubbleElephantImg,
    objectImg: shortLogObj,
    bridgeImg: bridgeSupportedImg,
    objectAnim: 'kuru-obj-roll',
    objectW: 9,
    objectOffset: { l: 3.2, t: 1.8 },
    doneSpot: { l: 76, t: 70 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    label: 'Monkey',
    brings: 'ropes',
    carryImg: monkeyPlayingTwigImg, // idle, playing with a twig, before being asked
    walkingImg: monkeyIdleImg, // calm transition pose while responding/approaching
    helpingImg: monkeyTyingImg, // tying the knot
    emptyImg: monkeyHappyImg,
    helpBubbleImg: helpBubbleMonkeyImg,
    objectImg: ropeObj,
    // No dedicated "just tied" bridge state in the asset pack — the support
    // art stands until the planks stage supplies the next visible change.
    bridgeImg: bridgeSupportedImg,
    objectAnim: 'kuru-obj-swoop',
    objectW: 6,
    objectOffset: { l: 4.4, t: -4.4 },
    doneSpot: { l: 82, t: 59 },
  },
];

const AUDIO = { syllables: ['ku', 'ru', 'me', 'deva'] };
// 4 syllables spread across the 2 ask-for-help loops + the plank finish —
// Elephant's support lights 2.
const SYLLABLES_LIT_AFTER_STEP = [2, 3, 4];
// Two helper loops (Elephant, Monkey) + one non-gated finishing action
// (Beaver lays the planks alone) = 3 rounds total.
const TOTAL_ROUNDS = 3;
const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;
const TURTLE_RIVER_SHIFT = 0;
// Friend tap hitbox is enlarged vs. the visible sprite for touch forgiveness —
// KurumedevaGame.css compensates by sizing the <img> at 1/KURU_HIT_SCALE (62.5%).
const KURU_HIT_SCALE = 1.6;
const WAIT_SPOTS = [
  { l: 18, t: 62 },
  { l: 24, t: 68 },
  { l: 14, t: 70 },
];
// When a friend is asked, it walks from its start spot to a delivery spot at the
// near (left) end of the bridge gap, sets its material down, then walks to the
// bank line. Slight per-friend stagger so consecutive drops don't stack.
const DELIVERY_SPOTS = [
  { l: 30.8, t: 73.6 },
  { l: 47, t: 66.5 },
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
// Where the logs rest before anyone's been asked — Beaver's own side of the
// gap, clear of Elephant's start spot (which sits right on top of LOG_PILE).
const TRY_LOG_SPOT = { l: 66, t: 68 };
// Same idea for the rope loop — near the tie point, clear of Monkey's spot.
const TRY_ROPE_SPOT = { l: 70, t: 74 };
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

// Rope ties — one trace stroke from post to post lashes the joins Monkey
// is working on (reuses the same rail geometry the old vine step tuned).
const ROPE_ROWS = [
  [{ l: 39.9, t: 78.1, r: 0 }, { l: 51.6, t: 81.2, r: 0 }, { l: 64.7, t: 83.4, r: 0 }], // near (trace path)
  [{ l: 47.4, t: 67.1, r: 0 }, { l: 59.1, t: 68.3, r: 0 }, { l: 69.7, t: 71.3, r: 0 }], // far
];
const ROPE_SLOT_W = 13;
const ROPE_TRACE_START = ROPE_ROWS[0][0];
const ROPE_TRACE_END = ROPE_ROWS[0][2];
const TRACE_BAND_T = 9; // vertical tolerance (% of stage) around the rail
const TRACE_LEAD = 2; // wrap snaps on slightly before the finger reaches it
// One end of the rope is fixed to the near post; the child drags the loose
// end across to the knot at the far post — a real bendable SVG curve, not a
// PNG dragged around like a rigid noodle (matches the Mahakaya rope rig).
const ROPE_FIXED_POINT = ROPE_ROWS[0][0];
const ROPE_KNOT_TARGET = ROPE_TRACE_END;

const LOG_DROP_RADIUS = 18; // forgiving snap to the active slot
// Anywhere over the gap counts as "close enough" for little hands.
const GAP_ZONE = { l0: 40, l1: 84, t0: 58, t1: 84 };

// friendStep -> piece-placing config. ONE cooperative action per helper —
// ask, friend comes and helps, one action, bridge advances. `helperSpot` is
// where the friend stands while helping (beside the piece, not just "at the
// gap"); `farExit` is where it goes once done.
const PLACE_ROUNDS = {
  // mode 'drag' — Elephant + Beaver push the two-log support together.
  // The pack ships one plain short log with no rope; per its README we
  // duplicate it (farSlots) so one drag visually seats both logs at once.
  0: {
    kind: 'log', mode: 'drag', img: shortLogObj,
    slots: [LOG_SLOTS[1]], farSlots: [[LOG_SLOTS[2]]], pile: LOG_PILE, slotW: LOG_SLOT_W,
    helperSpot: { l: LOG_SLOTS[1].l - 10, t: LOG_SLOTS[1].t - 5 },
  },
  // mode 'ropeDrag' — with Monkey's help, drag the same rope's free end (now
  // starting from its loose resting spot) across to the knot; it snaps taut
  // instead of slipping this time.
  1: {
    kind: 'rope', mode: 'ropeDrag', img: ropeObj,
    fixedPoint: ROPE_FIXED_POINT, start: TRY_ROPE_SPOT, target: ROPE_KNOT_TARGET,
    slots: [{ ...ROPE_KNOT_TARGET, r: 0 }], farSlots: [[ROPE_ROWS[1][1]]],
    pile: TRY_ROPE_SPOT,
    slotW: ROPE_SLOT_W,
    helperSpot: { l: ROPE_TRACE_END.l + 5, t: ROPE_TRACE_END.t - 14 },
  },
  // mode 'drag' — Beaver alone lays one plank; the rest complete with it
  // (standalone, non-ask-gated finishing action — no third helper).
  2: {
    kind: 'plank', mode: 'drag', img: plankObj,
    slots: [PLANK_SLOTS[1]], pile: PLANK_PILE, slotW: PLANK_SLOT_W,
    helperSpot: { l: PLANK_SLOTS[1].l - 8, t: PLANK_SLOTS[1].t - 7 },
    farExit: { l: 88, t: 70.2 },
  },
};
const LAST_PLACE_ROUND = 2; // highest step index that uses PLACE_ROUNDS
const getRoundActionCount = (step) => PLACE_ROUNDS[step]?.slots?.length || 0;

// ---------------------------------------------------------------------------
// Layout Debug panel (ported from MahakayaRescueGame). Drag any marker on the
// scene to place it, fine-tune with the sliders, then "Copy Layout JSON" to
// paste the values back into scene3LayoutConfig.js / the consts above.
// ---------------------------------------------------------------------------
const DEBUG_PANEL_KEYS = [
  ['friend0', 'Elephant (start)'],
  ['friend1', 'Monkey (start, ropes)'],
  ['helpTokenHome', 'Help bubble home'],
  ['wait0', 'Elephant wait spot'],
  ['wait1', 'Monkey wait spot (ropes)'],
  ['delivery0', 'Elephant walk-to (round 1)'],
  ['delivery1', 'Monkey walk-to (round 2, ropes)'],
  ['bridge', 'Bridge'],
  ['beaverBaby', 'Baby beaver'],
  ['logPile', 'Log pile (round 1)'],
  ['logSlot0', 'Log slot 1  (+ log size)'],
  ['logSlot1', 'Log slot 2'],
  ['logSlot2', 'Log slot 3'],
  ['plankPile', 'Plank pile (round 3)'],
  ['plankSlot0', 'Plank slot 1  (+ plank size)'],
  ['plankSlot1', 'Plank slot 2'],
  ['plankSlot2', 'Plank slot 3'],
  ['rope0_0', 'Rope near 1  (+ rope size)'], ['rope0_1', 'Rope near 2'], ['rope0_2', 'Rope near 3'],
  ['rope1_0', 'Rope far 1'], ['rope1_1', 'Rope far 2'], ['rope1_2', 'Rope far 3'],
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
  if (key.startsWith('farExit')) return { src: FRIENDS[tail]?.emptyImg, w: 10, r: 0, flip };
  if (key.startsWith('delivery')) return { src: FRIENDS[tail]?.carryImg, w: 10, r: 0, flip };
  if (key === 'helpTokenHome') return { src: helpHandIconImg, w: 8, r: 0 };
  if (key === 'beaverBaby') return { src: babyBeaverWavingImg, w: KURUMEDEVA_LAYOUT.beaverBaby.w, r: 0, flip };
  if (key.startsWith('beaverPath')) return { src: beaverIdleWorriedImg, w: KURUMEDEVA_LAYOUT.beaver.w, r: 0, flip };
  if (key === 'logPile' || key.startsWith('logSlot')) return { src: supportLogsObj, w: wOf('logSlot0', LOG_SLOT_W), r };
  if (key === 'plankPile' || key.startsWith('plankSlot')) return { src: plankObj, w: wOf('plankSlot0', PLANK_SLOT_W), r };
  if (key.startsWith('rope')) return { src: ropeObj, w: wOf('rope0_0', ROPE_SLOT_W), r };
  if (key === 'bridge') return { src: bridgeBrokenImg, w: KURUMEDEVA_LAYOUT.bridge.w, r: 0, flip };
  return null; // other anchors → dot
}

// Only the markers for one phase show at a time — keeps the scene readable.
const DEBUG_PHASES = [
  { label: 'Phase 0 — Setup', keys: ['friend0', 'friend1', 'friend2', 'helpTokenHome', 'beaverBaby', 'bridge'] },
  { label: 'Phase 1 — Support (Elephant)', keys: ['delivery0', 'wait0', 'logPile', 'logSlot0', 'logSlot1', 'logSlot2'] },
  { label: 'Phase 2 — Ropes (Monkey)', keys: ['delivery1', 'wait1', 'rope0_0', 'rope0_1', 'rope0_2', 'rope1_0', 'rope1_1', 'rope1_2'] },
  { label: 'Phase 3 — Planks (Beaver alone)', keys: ['plankPile', 'plankSlot0', 'plankSlot1', 'plankSlot2'] },
  { label: 'Phase 4 — Crossing', keys: ['beaverPath0', 'beaverPath1', 'beaverPath2', 'beaverPath3', 'beaverPath4', 'beaverPath5', 'beaverPath6'] },
];

function buildDebugLayout() {
  const layout = {};
  FRIENDS.forEach((friend, index) => {
    layout[`friend${index}`] = { l: friend.l, t: friend.t, w: friend.w, flip: !!friend.flip };
  });
  WAIT_SPOTS.forEach((spot, index) => {
    layout[`wait${index}`] = { l: spot.l, t: spot.t };
  });
  DELIVERY_SPOTS.forEach((spot, index) => {
    layout[`delivery${index}`] = { l: spot.l, t: spot.t };
  });
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
  ROPE_ROWS.forEach((row, r) => row.forEach((slot, index) => {
    layout[`rope${r}_${index}`] = r === 0 && index === 0
      ? { l: slot.l, t: slot.t, w: ROPE_SLOT_W, r: slot.r ?? 0 }
      : { l: slot.l, t: slot.t, r: slot.r ?? 0 };
  }));
  KURUMEDEVA_LAYOUT.beaverPath.forEach((point, index) => {
    layout[`beaverPath${index}`] = { l: point.l, t: point.t };
  });
  return layout;
}

const round1 = (n) => Number(Number(n).toFixed(1));

// One bendable SVG rope, reused for both the failed solo try and the
// Monkey-assisted tie — a real curve between a fixed post and the child's
// dragged finger, not a rigid PNG. `state` only changes the stroke color/
// thickness (loose vs. mid-pull vs. tied); the curve math is the same.
function KuruRopeSvg({ x1, y1, x2, y2, state = 'loose' }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  // Bow the curve perpendicular to the fixed->free line so it reads as rope
  // sag/tension rather than a straight rubber band.
  const bow = Math.min(16, Math.max(6, dist * 0.22));
  const nx = dist ? -dy / dist : 0;
  const ny = dist ? dx / dist : 1;
  const controlX = midX + nx * bow;
  const controlY = midY + ny * bow;
  const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  const outer = state === 'tied' ? '#7a4a22' : state === 'slipping' ? '#8a5a30' : '#9a6735';
  const inner = state === 'tied' ? '#f0c98a' : state === 'slipping' ? '#e2ac72' : '#e6b873';
  const outerW = state === 'pulling' ? 3.2 : 2.8;
  const innerW = state === 'pulling' ? 2.2 : 2;

  return (
    <svg
      className={`kuru-rope-svg is-${state}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke={outer} strokeWidth={outerW} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke={inner} strokeWidth={innerW} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

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
  // Beaver tries to move the support logs alone first and fails — only then
  // does the "ask for help" bubble unlock. Matches the asset pack's README
  // ("Mother Beaver tries to move the heavy two-log support piece and
  // cannot do it alone") and the approved game-flow doc's step 2.
  const [triedPush, setTriedPush] = useState(false);
  const [tryShake, setTryShake] = useState(false);
  // Beat 0: the logs wiggle while Beaver is pressing-and-holding them, before
  // the hold completes into the "can't budge them" shake+fail.
  const [isPushingLogs, setIsPushingLogs] = useState(false);
  const pushHoldTimerRef = useRef(null);
  const pushHoldPointerRef = useRef(null);
  // Beat 5-6: mirrors triedPush/tryShake for the rope loop — Beaver tries to
  // knot it herself, it slips, and only then can she ask Monkey.
  const [triedRope, setTriedRope] = useState(false);
  const [tryRopeShake, setTryRopeShake] = useState(false);
  // Beat 5: the rope's free end during the solo try — a real SVG drag, not a
  // tap. Always slips on release (before Monkey is asked) into the shake+fail.
  const [ropeTryDragPos, setRopeTryDragPos] = useState(null);
  const [ropeTryDragActive, setRopeTryDragActive] = useState(false);
  const ropeTryDragRef = useRef(null);
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
  // Each helper loop is gated behind its own "try and fail" beat — Beaver
  // must try (and fail) the logs before asking Elephant, and try (and fail)
  // the rope before asking Monkey.
  const canAsk = (friendStep === 0 && triedPush) || (friendStep === 1 && triedRope);

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
      setTriedPush(false);
      setTryShake(false);
      setIsPushingLogs(false);
      pushHoldTimerRef.current = null;
      pushHoldPointerRef.current = null;
      setTriedRope(false);
      setTryRopeShake(false);
      setRopeTryDragActive(false);
      setRopeTryDragPos(null);
      ropeTryDragRef.current = null;
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

  // Beat 0: Beaver tries the logs herself first — press and hold them; they
  // wiggle while held, then don't budge (shake+fail) once the hold lands.
  // Letting go early just stops the wiggle — no penalty, try again anytime.
  const PUSH_HOLD_MS = 900;

  const cancelPushHold = useCallback(() => {
    if (pushHoldTimerRef.current) {
      clearTimeout(pushHoldTimerRef.current);
      pushHoldTimerRef.current = null;
    }
    pushHoldPointerRef.current = null;
    setIsPushingLogs(false);
  }, []);

  const handleTryPushLogsDown = useCallback((event) => {
    if (isPaused || phaseRef.current !== 'play' || friendStep !== 0 || placeActive || triedPush) return;
    event?.preventDefault?.();
    markInteraction();
    stopSceneVoice?.();
    pushHoldPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsPushingLogs(true);
    pushHoldTimerRef.current = safeAfter(PUSH_HOLD_MS, () => {
      pushHoldTimerRef.current = null;
      setIsPushingLogs(false);
      setTryShake(true);
      safeAfter(700, () => {
        setTryShake(false);
        setTriedPush(true);
      });
    });
  }, [friendStep, isPaused, markInteraction, placeActive, safeAfter, stopSceneVoice, triedPush]);

  const handleTryPushLogsUp = useCallback((event) => {
    if (pushHoldPointerRef.current !== event.pointerId) return;
    event?.preventDefault?.();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    cancelPushHold();
  }, [cancelPushHold]);

  // Beat 5: Beaver tries to knot the rope herself first — drag the free end
  // toward the post; no matter where it's released it slips (the "try and
  // fail" beat), and only then does asking Monkey for help make sense.
  const handleRopeTryPointerDown = useCallback((event) => {
    if (isPaused || phaseRef.current !== 'play' || friendStep !== 1 || placeActive || triedRope) return;
    event.preventDefault();
    event.stopPropagation();
    markInteraction();
    stopSceneVoice?.();
    ropeTryDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setRopeTryDragActive(true);
    setRopeTryDragPos(getStagePoint(event));
  }, [friendStep, getStagePoint, isPaused, markInteraction, placeActive, stopSceneVoice, triedRope]);

  const handleRopeTryPointerMove = useCallback((event) => {
    if (ropeTryDragRef.current !== event.pointerId || !ropeTryDragActive) return;
    event.preventDefault();
    setRopeTryDragPos(getStagePoint(event));
  }, [getStagePoint, ropeTryDragActive]);

  const handleRopeTryPointerUp = useCallback((event) => {
    if (ropeTryDragRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    ropeTryDragRef.current = null;
    setRopeTryDragActive(false);
    setRopeTryDragPos(null);
    setTryRopeShake(true);
    safeAfter(700, () => {
      setTryRopeShake(false);
      setTriedRope(true);
    });
  }, [safeAfter]);

  const askFriendForHelp = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (placeActive) return;
    if (friendIndex !== friendStep) return;
    if (friendIndex === 0 && !triedPush) return;
    if (friendIndex === 1 && !triedRope) return;
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

    // --- Per-piece round: friend walks beside the piece, stays and helps, the
    //     child does ONE cooperative action. No auto-advance — the effect below
    //     finishes it once that action lands. ---
    if (PLACE_ROUNDS[friendIndex]) {
      const cfg = PLACE_ROUNDS[friendIndex];
      placeDoneRef.current = false;
      setPlacedCount(0);
      setWalkingIndex(friendIndex);
      setFriendPositions((prev) => {
        const next = [...prev];
        next[friendIndex] = cfg.helperSpot || DELIVERY_SPOTS[friendIndex];
        return next;
      });
      safeAfter(WALK_TO_MS, () => {
        setWalkingIndex(null);
        // Friend stays and visibly helps — not just a delivery.
        setFriendImgStates((prev) => {
          const next = [...prev];
          next[friendIndex] = 'helping';
          return next;
        });
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
      setLitCount(SYLLABLES_LIT_AFTER_STEP[friendIndex] ?? friendIndex + 1);
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
          setLitCount(SYLLABLES.length);
        });
        return;
      }

      setHelpDelivered(false);
      setHelpTokenPos(HELP_TOKEN_HOME);
      setIsRoundSettling(false);
    });
  }, [friendPositions, friendStep, friendImgStates, isPaused, markInteraction, moveFriendToWait, onMicroWin, placeActive, safeAfter, stopSceneVoice, triedPush, triedRope]);

  // --- Per-piece drag handlers: pull a piece from the pile into the gap ------
  const placeNextPiece = useCallback(() => {
    const target = getRoundActionCount(friendStep);
    setPlacedCount((n) => Math.min(target, n + 1));
  }, [friendStep]);

  // Tap-mode: tap the glowing slot and the piece drops in.
  const handleSlotTap = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= getRoundActionCount(friendStep)) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    markInteraction();
    placeNextPiece();
  }, [friendStep, isPaused, markInteraction, placeActive, placedCount, placeNextPiece, stopSceneVoice]);

  // Trace-mode: one sweep from the start post to the end post lays the wrap(s).
  const traceStartLRef = useRef(null);
  const maybePlaceAlongTrace = useCallback((point) => {
    const cfg = PLACE_ROUNDS[friendStep];
    if (!cfg || cfg.mode !== 'trace') return;
    const start = cfg.traceStart || cfg.slots[0];
    const end = cfg.traceEnd || cfg.slots[cfg.slots.length - 1];
    // A stroke that began at/left of the start post is a genuine left-to-right
    // trace — accept it generously (fast flicks included). One that began
    // further in must actually sweep through the end post's neighbourhood.
    const cleanStart = traceStartLRef.current != null
      && traceStartLRef.current <= start.l + 6;
    const onBand = Math.abs(point.t - end.t) <= TRACE_BAND_T;
    const reached = cleanStart
      ? point.l >= end.l - TRACE_LEAD
      : point.l >= end.l - TRACE_LEAD && point.l <= end.l + 14;
    if (onBand && reached) {
      setPlacedCount((n) => Math.min(cfg.slots.length, n + 1));
    }
  }, [friendStep]);

  const handleTracePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= getRoundActionCount(friendStep)) return;
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
  }, [friendStep, getStagePoint, isPaused, markInteraction, maybePlaceAlongTrace, placeActive, placedCount, stopSceneVoice]);

  const handleTracePointerMove = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId || !pieceDragActive) return;
    event.preventDefault();
    const point = getStagePoint(event);
    setPieceDragPos(point);
    maybePlaceAlongTrace(point);
  }, [getStagePoint, maybePlaceAlongTrace, pieceDragActive]);

  const handlePiecePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= getRoundActionCount(friendStep)) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    markInteraction();
    pieceDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPieceDragActive(true);
    setPieceDragPos(getStagePoint(event));
  }, [friendStep, getStagePoint, isPaused, placeActive, placedCount, markInteraction, stopSceneVoice]);

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

  // A round completes once its one cooperative action lands — light its
  // syllable, walk the friend to the bank line, then hand over to the next round.
  useEffect(() => {
    const target = getRoundActionCount(friendStep);
    if (!placeActive || placedCount < target || placeDoneRef.current) return;
    placeDoneRef.current = true;

    const idx = friendStep;
    setLitCount(SYLLABLES_LIT_AFTER_STEP[idx] ?? idx + 1);
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

      if (idx + 1 >= TOTAL_ROUNDS) {
        // Last round done — the bridge is fully built. Start the crossing.
        safeAfter(420, () => {
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(SYLLABLES.length);
        });
        return;
      }

      setIsRoundSettling(false);
    });
  }, [placeActive, placedCount, friendStep, onMicroWin, safeAfter]);

  // Beat 9: once both helper loops are done, Beaver lays the plank(s) alone —
  // a simple, non-ask-gated finishing action (no third helper).
  useEffect(() => {
    if (!isActive || phase !== 'play' || placeActive || isRoundSettling) return;
    if (friendStep === FRIENDS.length && bridgeStep === FRIENDS.length) {
      placeDoneRef.current = false;
      setPlacedCount(0);
      setPlaceActive(true);
    }
  }, [isActive, phase, placeActive, isRoundSettling, friendStep, bridgeStep]);

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
          brings: friend.brings,
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
        DELIVERY_SPOTS: DELIVERY_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`delivery${index}`].l),
          t: round1(debugLayout[`delivery${index}`].t),
        })),
        LOG_SLOT_W: round1(debugLayout.logSlot0.w),
        PLANK_SLOT_W: round1(debugLayout.plankSlot0.w),
        ROPE_SLOT_W: round1(debugLayout.rope0_0.w),
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
        ROPE_ROWS: ROPE_ROWS.map((row, r) => row.map((slot, index) => ({
          l: round1(debugLayout[`rope${r}_${index}`].l),
          t: round1(debugLayout[`rope${r}_${index}`].t),
          r: round1(debugLayout[`rope${r}_${index}`].r ?? 0),
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

  // Each round's success swaps in that stage's bridge artwork, cumulative:
  // Elephant -> support logs, Monkey -> ropes (no dedicated art), Monkey +
  // Beaver -> planks. Once the bridge is fully built the crossing begins on the crisp final
  // art (matches the asset pack's "transition to 06_final_completed_bridge"
  // beat) rather than the last round's in-progress state.
  const bridgeImg = (phase === 'crossing' || phase === 'done' || bridgeStep >= TOTAL_ROUNDS)
    ? bridgeCompleteImg
    : bridgeStep > 0 ? FRIENDS[bridgeStep - 1]?.bridgeImg : bridgeBrokenImg;
  // The loose piece only shows for the round currently being helped with — once
  // it succeeds, the bridge artwork above represents it instead (no clutter).
  const showPlacedPieces = debugMode || placeActive;
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
      if (placeCfg.mode === 'ropeDrag') {
        return { type: 'drag', from: { x: placeCfg.start.l, y: placeCfg.start.t }, to: { x: placeCfg.target.l, y: placeCfg.target.t }, k: `rope-${placedCount}` };
      }
      if (placeCfg.mode === 'tap') {
        return { type: 'tap', from: { x: s.l, y: s.t }, to: { x: s.l, y: s.t }, k: `tap-${placedCount}` };
      }
      if (placeCfg.mode === 'trace') {
        const a = placeCfg.traceStart || placeCfg.slots[0];
        const b = placeCfg.traceEnd || placeCfg.slots[placeCfg.slots.length - 1];
        return { type: 'scratch', from: { x: a.l, y: a.t }, to: { x: b.l, y: b.t }, k: `trace-${placedCount}` };
      }
    }
    if (currentFriend && !placeActive && canAsk) {
      const fp = friendPositions[friendStep] || currentFriend;
      return { type: 'drag', from: { x: HELP_TOKEN_HOME.l, y: HELP_TOKEN_HOME.t }, to: { x: fp.l, y: fp.t }, k: `ask-${friendStep}` };
    }
    if (friendStep === 0 && !placeActive && !canAsk) {
      return { type: 'hold', from: { x: TRY_LOG_SPOT.l, y: TRY_LOG_SPOT.t }, to: { x: TRY_LOG_SPOT.l, y: TRY_LOG_SPOT.t }, k: 'try-logs' };
    }
    if (friendStep === 1 && !placeActive && !canAsk) {
      return { type: 'drag', from: { x: TRY_ROPE_SPOT.l, y: TRY_ROPE_SPOT.t }, to: { x: ROPE_FIXED_POINT.l, y: ROPE_FIXED_POINT.t }, k: 'try-rope' };
    }
    return null;
  })();
  const beaverImg = phase === 'done'
    ? beaverBabyReunionImg
    : phase === 'crossing'
      ? beaverCrossingImg
      : (placeActive && friendStep === 2)
        ? beaverPlacingPlankImg
        : (tryShake || tryRopeShake)
          ? beaverTryingPushImg
          : (phase === 'play' && !placeActive && canAsk)
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

        {/* Building-hint copy removed for this pass — one cooperative action per
            helper needs no "N to go" count. Gesture demo + hint levels 1-3
            already carry the "who to ask" guidance below. */}

        {phase === 'play' && currentFriend && !isRoundSettling && !debugMode && !placeActive && (
          <p className="kuru-hint">
            {!canAsk
              ? (friendStep === 0
                ? 'Beaver is trying to move the logs. Press and hold them to help her try!'
                : 'The bridge is still loose. Drag the rope to help her try!')
              : <>
                  {(hintLevel === 0 || hintLevel === 1) && 'Who can Beaver ask for help?'}
                  {hintLevel === 2 && `Ask ${currentFriend.label} for help.`}
                  {hintLevel >= 3 && `Drag the help bubble to ${currentFriend.label}.`}
                </>}
          </p>
        )}

        {/* Beat 0: the resting pile of support logs, tappable so Beaver can
            try (and fail) to move them before asking Elephant for help. */}
        {phase === 'play' && friendStep === 0 && !placeActive && !debugMode && (
          <button
            type="button"
            className={`kuru-log-piece is-log is-top${tryShake ? ' is-shake' : ''}${isPushingLogs ? ' is-holding' : ''}${!triedPush && hintLevel >= 1 ? ' pulse' : ''}`}
            style={{
              left: `${TRY_LOG_SPOT.l}%`,
              top: `${TRY_LOG_SPOT.t}%`,
              width: `${LOG_SLOT_W * 0.6}%`,
            }}
            aria-label="Press and hold to help Beaver try the logs"
            onPointerDown={handleTryPushLogsDown}
            onPointerUp={handleTryPushLogsUp}
            onPointerCancel={handleTryPushLogsUp}
            onPointerLeave={handleTryPushLogsUp}
          >
            <img src={supportLogsObj} alt="" draggable={false} />
          </button>
        )}

        {/* Beat 5: the loose rope's free end, draggable so Beaver can try
            (and fail) to knot it before asking Monkey for help. One end is
            fixed to the post; the other follows the child's finger. */}
        {phase === 'play' && friendStep === 1 && !placeActive && !debugMode && (
          <>
            <KuruRopeSvg
              x1={ROPE_FIXED_POINT.l}
              y1={ROPE_FIXED_POINT.t}
              x2={ropeTryDragActive && ropeTryDragPos ? ropeTryDragPos.l : TRY_ROPE_SPOT.l}
              y2={ropeTryDragActive && ropeTryDragPos ? ropeTryDragPos.t : TRY_ROPE_SPOT.t}
              state={tryRopeShake ? 'slipping' : ropeTryDragActive ? 'pulling' : 'loose'}
            />
            <button
              type="button"
              className={`kuru-rope-handle${tryRopeShake ? ' is-shake' : ''}${!triedRope && hintLevel >= 1 ? ' pulse' : ''}`}
              style={{
                left: `${ropeTryDragActive && ropeTryDragPos ? ropeTryDragPos.l : TRY_ROPE_SPOT.l}%`,
                top: `${ropeTryDragActive && ropeTryDragPos ? ropeTryDragPos.t : TRY_ROPE_SPOT.t}%`,
              }}
              aria-label="Drag to help Beaver try tying the rope"
              onPointerDown={handleRopeTryPointerDown}
              onPointerMove={handleRopeTryPointerMove}
              onPointerUp={handleRopeTryPointerUp}
              onPointerCancel={handleRopeTryPointerUp}
            />
          </>
        )}

        {phase === 'done' && (
          <p className="kuru-doneline">You asked for help. Together, you made a way!</p>
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
            <img
              key={`bridge-${bridgeStep}`}
              className="kuru-bridge-img is-cur"
              src={bridgeImg}
              alt="bridge"
              draggable={false}
            />
          </div>
        )}

        {/* The piece the child is currently helping place. Once it succeeds the
            bridge artwork above takes over — no loose pieces linger. */}
        {showPlacedPieces && Array.from({ length: LAST_PLACE_ROUND + 1 }, (_, r) => r).map((roundIndex) => {
          const cfg = PLACE_ROUNDS[roundIndex];
          if (!cfg) return null;
          // In debug: preview earlier phases fully built so the current one can
          // be positioned against them.
          const debugDone = debugMode && roundIndex <= debugPhase - 2;
          const roundCurrent = placeActive && friendStep === roundIndex;
          if (!debugDone && !roundCurrent) return null;
          const count = debugDone ? cfg.slots.length : placedCount;
          return cfg.slots.slice(0, count).flatMap((slot, i) => {
            const isNewest = !debugDone && i === count - 1;
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
        {placeActive && placeCfg && placeCfg.mode === 'tap' && phase === 'play' && placedCount < placeCfg.slots.length && (
          <>
            {/* Small non-interactive supply pile that shrinks as pieces are placed. */}
            {placeCfg.pile && Array.from({ length: placeCfg.slots.length - placedCount }).map((_, i) => (
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
        {placeActive && placeCfg && placeCfg.mode === 'trace' && phase === 'play' && placedCount < placeCfg.slots.length && (
          <>
            <svg className="kuru-trace-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={`${placeCfg.traceStart.l},${placeCfg.traceStart.t} ${placeCfg.traceEnd.l},${placeCfg.traceEnd.t}`} />
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
                left: `${(placeCfg.traceStart.l + placeCfg.traceEnd.l) / 2}%`,
                top: `${placeCfg.traceStart.t}%`,
                width: `${Math.abs(placeCfg.traceEnd.l - placeCfg.traceStart.l) + 26}%`,
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

        {/* Active round, ROPE DRAG mode — same bendable SVG rope as the solo
            try, now anchored + reused: drag the free end to the knot and it
            snaps taut. Reuses the generic piece drag handlers verbatim. */}
        {placeActive && placeCfg && placeCfg.mode === 'ropeDrag' && phase === 'play' && placedCount < placeCfg.slots.length && (
          <>
            <div
              className="kuru-drop-zone"
              style={{
                left: `${placeCfg.target.l}%`,
                top: `${placeCfg.target.t}%`,
                width: `${placeCfg.slotW * 1.35}%`,
              }}
              aria-hidden="true"
            />
            <KuruRopeSvg
              x1={placeCfg.fixedPoint.l}
              y1={placeCfg.fixedPoint.t}
              x2={pieceDragActive && pieceDragPos ? pieceDragPos.l : placeCfg.start.l}
              y2={pieceDragActive && pieceDragPos ? pieceDragPos.t : placeCfg.start.t}
              state={pieceDragActive ? 'pulling' : 'loose'}
            />
            <button
              type="button"
              className={`kuru-rope-handle is-tie${pieceDragActive ? ' is-dragging' : ''}${hintLevel >= 1 && !pieceDragActive ? ' pulse' : ''}`}
              style={{
                left: `${pieceDragActive && pieceDragPos ? pieceDragPos.l : placeCfg.start.l}%`,
                top: `${pieceDragActive && pieceDragPos ? pieceDragPos.t : placeCfg.start.t}%`,
              }}
              aria-label="Drag the rope end to tie the knot"
              onPointerDown={handlePiecePointerDown}
              onPointerMove={handlePiecePointerMove}
              onPointerUp={handlePiecePointerUp}
              onPointerCancel={endPieceDrag}
            />
          </>
        )}

        {/* Active round, DRAG mode — ghost slot + draggable pile at the friend's feet. */}
        {placeActive && placeCfg && placeCfg.mode === 'drag' && phase === 'play' && placedCount < placeCfg.slots.length && (
          <>
            {/* Drop zone — a clear dashed landing pad, not just the faint ghost
                piece, so little hands can see exactly where to drag to. */}
            <div
              className="kuru-drop-zone"
              style={{
                left: `${placeCfg.slots[placedCount].l}%`,
                top: `${placeCfg.slots[placedCount].t}%`,
                width: `${placeCfg.slotW * 1.35}%`,
              }}
              aria-hidden="true"
            />
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

            {Array.from({ length: placeCfg.slots.length - placedCount }).map((_, i) => {
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
          <img src={beaverImg} alt="Beaver" draggable={false} />
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

        {FRIENDS.map((friend, index) => {
          // Monkey (and his rope) stay off-scene until Elephant's loop is
          // done and it's his turn — no more both-helpers-visible-at-once.
          if (index > friendStep && phase === 'play') return null;
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
          // Same rule as the object layer above — a helper is invisible
          // until his own loop begins.
          if (index > friendStep && phase === 'play') return null;
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
    </div>
  );
}
