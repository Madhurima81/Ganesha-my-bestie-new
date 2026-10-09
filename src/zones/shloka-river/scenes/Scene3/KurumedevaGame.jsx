import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './KurumedevaGame.css';

import bgImg from './assets/images/nirvighnam/bg.webp';

// Bridge redesign v2 (Kurume Deva) — no more solo try/fail beats. The child
// asks Elephant for help (logs appear), asks Monkey for help (rope appears,
// same image — the pack has no separate "tied" art), then Beaver alone lays
// 3 planks on top to finish the bridge.
import elephantIdleBananaImg from './assets/images/bridge/Characters/elephant-idle-banana.webp';
import elephantHelpingImg from './assets/images/bridge/Characters/elephant-lift.webp';
import elephantHappyImg from './assets/images/bridge/Characters/elephant-happy.webp';
import helpBubbleElephantImg from './assets/images/bridge/Characters/help-bubble-elephant-logs.webp';
import monkeyPlayingTwigImg from './assets/images/bridge/Characters/monkey-playing-twig.webp';
import monkeyHelpingImg from './assets/images/bridge/Characters/monkey-tie.webp';
import monkeyHappyImg from './assets/images/bridge/Characters/monkey-happy.webp';
import helpBubbleMonkeyImg from './assets/images/Kurumedeva/help-vine.webp';

import plankObj from './assets/images/Kurumedeva/plank-bunny.webp';
// Resting logs shown near Elephant BEFORE he helps — a visual cue for what
// he's about to bring. 3 single logs, each independently positionable in the
// Layout Debug panel, sharing one size.
import logPieceObj from './assets/images/Kurumedeva/log-turtle.webp';

// Explicit bridge-state images: step1 = bare support logs (after Elephant),
// step2 = logs + rope tied (after Monkey) — this stays as the base art while
// the 3 planks are dragged on top of it, right through to the finished bridge.
import bridgeStep1Img from './assets/images/Kurumedeva/step1.webp';
import bridgeStep2Img from './assets/images/Kurumedeva/step2.webp';

import beaverAskingImg from './assets/images/bridge/Characters/beaver-asking.webp';
import beaverIdleWorriedImg from './assets/images/bridge/Characters/beaver-idle-worried.webp';
// Beaver's own helping pose differs per round — matches the beat player's
// beaver-lift (with Elephant) vs beaver-tie (with Monkey).
import beaverLiftImg from './assets/images/bridge/Characters/beaver-lift.webp';
import beaverTieImg from './assets/images/bridge/Characters/beaver-tie.webp';
import beaverPlacingPlankImg from './assets/images/bridge/Characters/beaver-placing-plank.webp';
import beaverCrossingImg from './assets/images/bridge/Characters/beaver-crossing.webp';
import babyBeaverWavingImg from './assets/images/bridge/Characters/baby-beaver-waving.webp';
import beaverBabyReunionImg from './assets/images/bridge/Characters/beaver-baby-reunion.webp';
import helpHandIconImg from './assets/images/Kurumedeva/help-hand-icon.webp';
// Shows next to Beaver once Elephant's logs land — a small growing-things
// touch on her side of the bank.
import vineObj from './assets/images/Kurumedeva/vine.webp';

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugKuru'));

const SYLLABLES = ['Kuru', 'me', 'deva'];
// Near Mother Beaver's new left-side starting spot (BEAVER_PATH[0]).
const HELP_TOKEN_HOME = { l: 44.7, t: 55.7 };

// Play order = build order: ask Elephant (logs appear), ask Monkey (rope
// appears), then Beaver alone lays the planks — no third helper.
const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    label: 'Elephant',
    carryImg: elephantIdleBananaImg, // idle, eating a banana, before being asked and while moving
    helpingImg: elephantHelpingImg, // helping settle the logs into place
    emptyImg: elephantHappyImg,
    helpBubbleImg: helpBubbleElephantImg,
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    label: 'Monkey',
    carryImg: monkeyPlayingTwigImg, // idle/waiting pose before being asked and while moving
    helpingImg: monkeyHelpingImg, // tying the rope
    emptyImg: monkeyHappyImg,
    helpBubbleImg: helpBubbleMonkeyImg,
  },
];

const AUDIO = { syllables: ['kuru', 'me', 'deva'] };
// One word-group lit per game step: Elephant lights "Kuru", Monkey lights
// "Me", the finished plank round lights "Deva" — matches the child's rhythm
// of two "ask for help" beats followed by one "finish it yourself" beat.
const SYLLABLES_LIT_AFTER_STEP = [1, 2, 3];
// 2 ask-for-help rounds (Elephant, Monkey) + 1 non-gated finishing round
// (Beaver lays the planks alone) = 3 stages total.
const TOTAL_ROUNDS = 3;
const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;
// Friend tap hitbox is enlarged vs. the visible sprite for touch forgiveness —
// KurumedevaGame.css compensates by sizing the <img> at 1/KURU_HIT_SCALE.
const KURU_HIT_SCALE = 1.18;
const FRIEND_DROP_RADIUS = {
  elephant: 6,
  monkey: 7,
};
const getFriendDropRadius = (friend) => FRIEND_DROP_RADIUS[friend.id] ?? Math.max(6, friend.w * 0.55);
const BEAVER_CROSSING_W = 6.5;
const BEAVER_REUNION_W = 8.5;
// Where each friend walks when asked for help. Elephant arrives beside the
// bridge/logs; Monkey arrives on the bridge for the tying beat.
const HELPER_SPOTS = [
  { l: 24, t: 68 },
  { l: 56.6, t: 68 },
];
const WAIT_SPOTS = [
  { l: 18, t: 62 },
  { l: 7.7, t: 62.2 },
];
const WALK_TO_MS = 1000; // amble to the bridge
const LOG_FLY_MS = 650; // logs sliding from the pile onto the bridge
const VINE_REVEAL_DELAY_MS = 950;
// Pause after Elephant's logs land — long enough for the vine reveal to
// read as a beat before "ask Monkey" — but the swap itself is instant
// (single crossfade), no sliding/wobbling.
const POST_LOG_PAUSE_MS = 900;
const HELP_SETTLE_MS = 900; // stand and help before the bridge art updates

// Vine — appears next to Beaver once Elephant's logs land, near her own
// starting spot (BEAVER_PATH[0]).
const VINE_SPOT = { l: 29.1, t: 55.4, w: 10 };

// --- Plank round: the child drags 3 planks onto the finished-logs bridge ----
const PLANK_PILE = { l: 31.7, t: 56.9 };
// 3 deck sections — Canva planks 513.5x324.6 px on the 2048x1536 page.
const PLANK_SLOTS = [
  { l: 43.6, t: 69.1, r: 0 },
  { l: 58.4, t: 72.5, r: 0 },
  { l: 72.3, t: 75, r: -1 },
];
const PLANK_SLOT_W = 10.5;
const PLANK_DROP_RX = 4.2; // snap near the active plank slot, not anywhere in the river gap
const PLANK_DROP_RY = 3.2;

const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

// Resting logs — 3 single logs visible from scene start next to Elephant.
// Disappear once he helps (the bridge art takes over). Each is independently
// positioned (fine-tune in the Layout Debug panel); all 3 share one size.
const LOG_PILE_SLOTS = [
  { l: 17.3, t: 72.9 },
  { l: 17.7, t: 71.8 },
  { l: 17.4, t: 72.1 },
];
const LOG_PILE_W = 16;

// ---------------------------------------------------------------------------
// Layout Debug panel (ported from MahakayaRescueGame). Drag any marker on the
// scene to place it, fine-tune with the sliders, then "Copy Layout JSON" to
// paste the values back into scene3LayoutConfig.js / the consts above.
// ---------------------------------------------------------------------------
const DEBUG_PANEL_KEYS = [
  ['friend0', 'Elephant (start)'],
  ['friend1', 'Monkey (start)'],
  ['helper0', 'Elephant final/help position'],
  ['helper1', 'Monkey final/help position'],
  ['wait0', 'Elephant final wait position'],
  ['wait1', 'Monkey final wait position'],
  ['helpTokenHome', 'Help bubble home'],
  ['logPile0', 'Log 1 (before Elephant helps)  (+ size)'],
  ['logPile1', 'Log 2'],
  ['logPile2', 'Log 3'],
  ['bridge', 'Bridge'],
  ['beaverBaby', 'Baby beaver'],
  ['vineSpot', 'Helper vine near Beaver  (+ size)'],
  ['plankPile', 'Plank wait pile'],
  ['plankSlot0', 'Plank place 1  (+ plank size)'],
  ['plankSlot1', 'Plank place 2'],
  ['plankSlot2', 'Plank place 3'],
  ['beaverPath0', 'Beaver walk 0 / start'],
  ['beaverPath1', 'Beaver walk 1'],
  ['beaverPath2', 'Beaver walk 2'],
  ['beaverPath3', 'Beaver walk 3'],
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
  if (key.startsWith('helper')) return { src: FRIENDS[tail]?.emptyImg, w: FRIENDS[tail]?.w || 10, r: 0, flip };
  if (key.startsWith('wait')) return { src: FRIENDS[tail]?.emptyImg, w: FRIENDS[tail]?.w || 10, r: 0, flip };
  if (key.startsWith('logPile')) return { src: logPieceObj, w: wOf('logPile0', LOG_PILE_W), r: 0 };
  if (key === 'vineSpot') return { src: vineObj, w: wOf('vineSpot', VINE_SPOT.w), r: 0 };
  if (key === 'helpTokenHome') return { src: helpHandIconImg, w: 8, r: 0 };
  if (key === 'beaverBaby') return { src: babyBeaverWavingImg, w: KURUMEDEVA_LAYOUT.beaverBaby.w, r: 0, flip };
  if (key.startsWith('beaverPath')) return { src: beaverIdleWorriedImg, w: KURUMEDEVA_LAYOUT.beaver.w, r: 0, flip };
  if (key === 'plankPile' || key.startsWith('plankSlot')) return { src: plankObj, w: wOf('plankSlot0', PLANK_SLOT_W), r };
  if (key === 'bridge') return { src: bridgeStep2Img, w: KURUMEDEVA_LAYOUT.bridge.w, r: 0, flip };
  return null; // other anchors → dot
}

// Only the markers for one phase show at a time — keeps the scene readable.
const DEBUG_PHASES = [
  { label: 'Phase 0 — Setup + vine', keys: ['friend0', 'friend1', 'beaverPath0', 'helpTokenHome', 'beaverBaby', 'bridge', 'logPile0', 'logPile1', 'logPile2', 'vineSpot'] },
  { label: 'Phase 1 — Helper positions on bridge', keys: ['helper0', 'helper1'] },
  { label: 'Phase 1b — Final wait positions', keys: ['wait0', 'wait1'] },
  { label: 'Phase 2 — Plank wait/place positions', keys: ['plankPile', 'plankSlot0', 'plankSlot1', 'plankSlot2'] },
  { label: 'Phase 3 — Beaver bridge-side walk', keys: ['beaverPath0', 'beaverPath1', 'beaverPath2', 'beaverPath3'] },
  { label: 'Phase 4 — Final Beaver walk only', keys: ['wait0', 'wait1', 'beaverPath0', 'beaverPath1', 'beaverPath2', 'beaverPath3'] },
];

function buildDebugLayout() {
  const layout = {};
  FRIENDS.forEach((friend, index) => {
    layout[`friend${index}`] = { l: friend.l, t: friend.t, w: friend.w, flip: !!friend.flip };
  });
  HELPER_SPOTS.forEach((spot, index) => {
    layout[`helper${index}`] = { l: spot.l, t: spot.t };
  });
  WAIT_SPOTS.forEach((spot, index) => {
    layout[`wait${index}`] = { l: spot.l, t: spot.t };
  });
  LOG_PILE_SLOTS.forEach((slot, index) => {
    layout[`logPile${index}`] = index === 0
      ? { l: slot.l, t: slot.t, w: LOG_PILE_W }
      : { l: slot.l, t: slot.t };
  });
  layout.vineSpot = { l: VINE_SPOT.l, t: VINE_SPOT.t, w: VINE_SPOT.w };
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
  elephantIdleBananaImg,
  elephantHelpingImg,
  elephantHappyImg,
  helpBubbleElephantImg,
  monkeyPlayingTwigImg,
  monkeyHelpingImg,
  monkeyHappyImg,
  helpBubbleMonkeyImg,
  plankObj,
  logPieceObj,
  vineObj,
  bridgeStep1Img,
  bridgeStep2Img,
  beaverAskingImg,
  beaverIdleWorriedImg,
  beaverLiftImg,
  beaverTieImg,
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
  // Resume: ask-for-help rounds already finished (0-2). Applied only when the game mounts active (Continue).
  initialRounds = 0,
  // Fired with the finished-round count after round 1 and round 2 (checkpoint).
  onBeatComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
  // Sidebar actually open (isPaused also covers the short replay hold after it closes): drives the
  // hand demo, the animation freeze and the hint pin, so the hand can play WITH the replayed line.
  isSidebarOpen,
}) {
  const handPaused = isSidebarOpen ?? isPaused;
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const [seedRounds] = useState(() => (
    isActive ? Math.max(0, Math.min(TOTAL_ROUNDS - 1, Number(initialRounds) || 0)) : 0
  ));
  const [friendStep, setFriendStep] = useState(seedRounds);
  const [bridgeStep, setBridgeStep] = useState(seedRounds);
  const [phase, setPhase] = useState('play');
  const [beaverPos, setBeaverPos] = useState(BEAVER_PATH[0]);
  const [litCount, setLitCount] = useState(seedRounds > 0 ? SYLLABLES_LIT_AFTER_STEP[seedRounds - 1] : 0);
  const [tappedId, setTappedId] = useState(null);
  // Finished rounds: Elephant stays in his helping pose at the helper spot; Monkey waits to be asked.
  const [friendImgStates, setFriendImgStates] = useState(() => FRIENDS.map((_, i) => (i === 0 && seedRounds >= 1 ? 'helping' : 'carry')));
  const [friendPositions, setFriendPositions] = useState(() => FRIENDS.map((friend, i) => {
    if (i === 0 && seedRounds >= 1) return { l: HELPER_SPOTS[0].l, t: HELPER_SPOTS[0].t };
    if (i === 1 && seedRounds >= 2) return { l: WAIT_SPOTS[1].l, t: WAIT_SPOTS[1].t };
    return { l: friend.l, t: friend.t };
  }));
  const [helpTokenPos, setHelpTokenPos] = useState(HELP_TOKEN_HOME);
  const [isDraggingHelp, setIsDraggingHelp] = useState(false);
  const [helpDelivered, setHelpDelivered] = useState(false);
  const [isRoundSettling, setIsRoundSettling] = useState(false);
  const [walkingIndex, setWalkingIndex] = useState(null);
  const [logsFlying, setLogsFlying] = useState(false);
  const [bridgeWobbling, setBridgeWobbling] = useState(false);
  const [vineReady, setVineReady] = useState(seedRounds === 1);

  // Plank round — drag 3 planks onto the finished bridge.
  const [placeActive, setPlaceActive] = useState(seedRounds >= 2);
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
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable, clear: clearPausable } = usePausableTimers(isPaused);

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

  // Two beats TEACH a mechanic: the first help bubble (ask Elephant) and the first plank. They keep
  // the full 10/18/26 ladder. Every other beat (ask Monkey, planks 2-3) is the child working
  // independently: a ~12s nudge, then at ~25s the target glows quietly and stays. No hand, no L3.
  const isTeachableBeat = hintBeat === 'ask-elephant' || hintBeat === 'plank-0';
  // Set once the child has really MOVED a bubble / plank (not just pointer-down). After that the
  // hand for that mechanic never appears again, even after the sidebar.
  const [helpDragLearned, setHelpDragLearned] = useState(false);
  const [plankDragLearned, setPlankDragLearned] = useState(false);
  const learnedForBeat = (hintBeat === 'ask-elephant' && helpDragLearned) || (hintBeat === 'plank-0' && plankDragLearned);
  // A real wrong drop makes the TARGET clearer (helper / slot glow) for the rest of that beat.
  const [clarifyBeat, setClarifyBeat] = useState(null);
  const dragStartRef = useRef(null);

  const {
    hintLevel,
    markInteraction,
    markAttempt,
    markWrongAttempt,
    markLevel2VoiceStarted,
    markLevel2VoiceEnded,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !isRoundSettling && !debugMode && introComplete,
    stageKey: hintBeat,
    initialDelay: isTeachableBeat ? 10000 : 12000,
    pulseCountBeforeEscalation: isTeachableBeat ? 3 : 2,
    pulseInterval: 1800,
    level2Delay: isTeachableBeat ? 18000 : 25000,
    level3Delay: isTeachableBeat ? 26000 : 3600000,
    paused: handPaused,
  });
  // Target glow: L3 on a teaching beat, L2 (~25s) on the independent beats, or after a real miss.
  const targetGlow = hintLevel >= (isTeachableBeat ? 3 : 2) || clarifyBeat === hintBeat;

  // Teaching gesture appears for the first help bubble and the first plank, until learned.
  const kuruStageKey = hintBeat;
  const [kuruIntroGesture, setKuruIntroGesture] = useState(false);
  // Tracks whether this beat's own instruction VO (kuru_ask_elephant /
  // kuru_plank_instruction) has actually started speaking — the teaching
  // gesture below waits for that instead of a fixed delay from the beat
  // transition, since browser TTS startup lag is variable.
  const [introGestureVoStarted, setIntroGestureVoStarted] = useState(false);
  useEffect(() => {
    if (!isActive || !introComplete || phase !== 'play' || isRoundSettling || debugMode || !isTeachableBeat || learnedForBeat) { setKuruIntroGesture(false); return undefined; }
    setKuruIntroGesture(true);
    setIntroGestureVoStarted(false);
    const t = pausableAfter(6000, () => setKuruIntroGesture(false));
    return () => cancelPausable(t);
  }, [isActive, introComplete, kuruStageKey, phase, isRoundSettling, debugMode, isTeachableBeat, learnedForBeat, pausableAfter, cancelPausable]);

  // Back from the sidebar during a teachable beat: the teaching hand plays again with the
  // replayed instruction line.
  const wasPausedForTeachRef = useRef(false);
  useEffect(() => {
    if (wasPausedForTeachRef.current && !handPaused && isActive && introComplete && phase === 'play' && !isRoundSettling && !debugMode && isTeachableBeat && !learnedForBeat) {
      setKuruIntroGesture(true);
      // The replayed instruction's cue re-times it: the hand waits for the action word again.
      setIntroGestureVoStarted(false);
      const t = pausableAfter(8000, () => setKuruIntroGesture(false));
      wasPausedForTeachRef.current = handPaused;
      return () => cancelPausable(t);
    }
    wasPausedForTeachRef.current = handPaused;
    return undefined;
  }, [handPaused, isActive, introComplete, phase, isRoundSettling, debugMode, isTeachableBeat, learnedForBeat, pausableAfter, cancelPausable]);
  const currentFriend = friendStep < FRIENDS.length ? FRIENDS[friendStep] : null;

  // Round-start question — once per ask round: "Who can help with the heavy
  // logs?" / "Who can help tie the rope?" Not gated on anything (no more
  // solo try/fail beat to wait out).
  const lastRoundQuestionRef = useRef(null);
  useEffect(() => {
    if (!isActive || !introComplete || isPaused || phase !== 'play' || isRoundSettling || debugMode || placeActive) return;
    if (friendStep >= FRIENDS.length) return;
    const key = friendStep === 0 ? 'kuru_ask_elephant' : 'kuru_ask_monkey';
    if (lastRoundQuestionRef.current === key) return;
    lastRoundQuestionRef.current = key;
    stopSceneVoice?.();
    // Delay matches the story-clause-then-action-clause shape of these lines
    // ("Everyone wants to cross... drag the logs...") — showing the gesture
    // right as the VO starts lands it on "story", not "action".
    // The hand is cued to the action word ("drag") of the line, not a guessed delay.
    playSceneLine?.(key, undefined, { cue: getLineCue(key, () => setIntroGestureVoStarted(true)) });
  }, [isActive, introComplete, isPaused, friendStep, phase, isRoundSettling, debugMode, placeActive, playSceneLine, stopSceneVoice]);

  // Plank round instruction — once, right as the plank round begins.
  const plankInstructionPlayedRef = useRef(false);
  useEffect(() => {
    if (!placeActive) { plankInstructionPlayedRef.current = false; return; }
    if (plankInstructionPlayedRef.current) return;
    plankInstructionPlayedRef.current = true;
    stopSceneVoice?.();
    playSceneLine?.('kuru_plank_instruction', undefined, { cue: getLineCue('kuru_plank_instruction', () => setIntroGestureVoStarted(true)) });
  }, [placeActive, playSceneLine, stopSceneVoice]);

  // Idle hint VO — L1 is visual only. L2 is soft/partial guidance; L3 gives
  // the direct target/full action.
  const lastKuruHintRef = useRef('');
  useEffect(() => {
    if (phase !== 'play' || isRoundSettling || debugMode || helpDelivered) return;
    if (!isTeachableBeat) {
      // Independent beats: one spoken clue at the first nudge when asking Monkey (which helper,
      // not how to drag). Planks 2-3 already had "Good. Continue dragging the planks."
      if (hintBeat === 'ask-monkey' && hintLevel === 1 && lastKuruHintRef.current !== hintBeat) {
        lastKuruHintRef.current = hintBeat;
        stopSceneVoice?.();
        playSceneLine?.('kuru_hint_monkey_clue');
      }
      return;
    }
    if (hintLevel !== 2 && hintLevel !== 3) return;
    // The child has shown they can drag: the L2 line would only re-teach dragging.
    if (hintLevel === 2 && learnedForBeat) return;

    let key = null;
    if (placeActive) {
      key = hintLevel === 2 ? 'kuru_hint_plank_soft' : 'kuru_hint_plank_direct';
    } else if (canAsk) {
      key = hintLevel === 2
        ? 'kuru_hint_ask'
        : (friendStep === 0 ? 'kuru_hint_elephant' : 'kuru_hint_monkey');
    }
    if (!key) return;

    const onceKey = `${hintBeat}-${key}`;
    if (lastKuruHintRef.current === onceKey) return;
    lastKuruHintRef.current = onceKey;
    stopSceneVoice?.();
    if (hintLevel === 2 && playSceneLine) markLevel2VoiceStarted();
    playSceneLine?.(key, hintLevel === 2 ? markLevel2VoiceEnded : undefined);
  }, [hintLevel, hintBeat, isTeachableBeat, learnedForBeat, phase, isRoundSettling, debugMode, placeActive, canAsk, helpDelivered, friendStep, playSceneLine, stopSceneVoice, markLevel2VoiceStarted, markLevel2VoiceEnded]);

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

  const safeAfter = pausableAfter;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    clearPausable();
  }, [clearPausable]);

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
      setLogsFlying(false);
      setBridgeWobbling(false);
      setVineReady(false);
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
      lastRoundQuestionRef.current = null;
      setHelpDragLearned(false);
      setPlankDragLearned(false);
      setClarifyBeat(null);
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

    // Friend walks over to the bridge/helper spot, then swaps into the
    // helping pose there.
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
      // ELEPHANT — logs appear. He stays in his "helping" pose (no happy
      // pose yet) — only Ganesha's "wait → help → happy" 3-state rule, and
      // "happy" is reserved for once the whole bridge is finished.
      // ---------------------------------------------------------------
      if (friendIndex === 0) {
        // The loose logs slide toward the bridge, then the bridge art
        // crossfades in so the child can see those logs became the bridge.
        // kuru_logs_after is NOT played here — it races the "Kuru" syllable
        // VO that fires moments later off the same litCount change, sharing
        // one audio channel (whichever started second cut the other off).
        // It's chained after that syllable finishes instead (onSyllableLit
        // below), same fix as Nirvighnam's obstacle-intro race.
        setLogsFlying(true);
        safeAfter(LOG_FLY_MS, () => {
          setLogsFlying(false);
          setBridgeStep(1);
          setBridgeWobbling(true);
          setLitCount(SYLLABLES_LIT_AFTER_STEP[0]);
          window.setTimeout(() => onMicroWin?.(), 0);
        });

        safeAfter(LOG_FLY_MS + VINE_REVEAL_DELAY_MS, () => {
          setVineReady(true);
        });

        safeAfter(LOG_FLY_MS + VINE_REVEAL_DELAY_MS + POST_LOG_PAUSE_MS, () => {
          setFriendStep(1);
          setHelpDelivered(false);
          setHelpTokenPos(HELP_TOKEN_HOME);
          setIsRoundSettling(false);
          onBeatComplete?.(1);
        });
        return;
      }

      // ---------------------------------------------------------------
      // MONKEY — rope appears, then the plank round begins. Same rule —
      // stays in "helping" pose until the bridge is fully done.
      // ---------------------------------------------------------------
      setBridgeWobbling(false);
      setVineReady(false);
      setBridgeStep(2);
      setLitCount(SYLLABLES_LIT_AFTER_STEP[1]);
      window.setTimeout(() => onMicroWin?.(), 0);
      // kuru_rope_after is chained after the "me" syllable finishes (see
      // onSyllableLit below) — same race as kuru_logs_after above.

      safeAfter(HELP_SETTLE_MS, () => {
        setFriendImgStates((prev) => {
          const next = [...prev];
          next[1] = 'carry';
          return next;
        });
        setFriendPositions((prev) => {
          const next = [...prev];
          next[1] = WAIT_SPOTS[1];
          return next;
        });
        setFriendStep(2);
        setHelpDelivered(false);
        setHelpTokenPos(HELP_TOKEN_HOME);

        placeDoneRef.current = false;
        setPlacedCount(0);
        setPlaceActive(true);
        setIsRoundSettling(false);
        onBeatComplete?.(2);
      });
    });
  }, [onBeatComplete, friendImgStates, friendPositions, friendStep, isPaused, isRoundSettling, markInteraction, onMicroWin, placeActive, playSceneLine, safeAfter, stopSceneVoice]);

  // --- Plank drag handlers: pull a plank from the pile into the gap --------
  const placeNextPiece = useCallback(() => {
    setPlacedCount((n) => Math.min(PLANK_SLOTS.length, n + 1));
  }, []);

  const handlePiecePointerDown = useCallback((event) => {
    if (isPaused || !placeActive || placedCount >= PLANK_SLOTS.length) return;
    event.preventDefault();
    event.stopPropagation();
    stopSceneVoice?.();
    // Grabbing the plank is an attempt, not progress: a visible hint stays; placing it is progress.
    markAttempt();
    pieceDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPieceDragActive(true);
    const grab = getStagePoint(event);
    dragStartRef.current = grab;
    setPieceDragPos(grab);
  }, [getStagePoint, isPaused, placeActive, placedCount, markAttempt, stopSceneVoice]);

  const handlePiecePointerMove = useCallback((event) => {
    if (pieceDragRef.current !== event.pointerId || !pieceDragActive) return;
    event.preventDefault();
    const p = getStagePoint(event);
    setPieceDragPos(p);
    const g = dragStartRef.current;
    if (!plankDragLearned && g && Math.hypot(p.l - g.l, p.t - g.t) > 3) setPlankDragLearned(true);
  }, [getStagePoint, pieceDragActive, plankDragLearned]);

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
    const dx = (drop.l - slot.l) / PLANK_DROP_RX;
    const dy = (drop.t - slot.t) / PLANK_DROP_RY;
    const near = dx * dx + dy * dy <= 1;
    endPieceDrag();
    if (near) {
      const isFirstPlank = placedCount === 0;
      markInteraction(); // plank placed = real progress
      placeNextPiece();
      if (isFirstPlank) playSceneLine?.('kuru_plank_continue');
    } else {
      markWrongAttempt(); // genuine drag, missed the gap
      setClarifyBeat(hintBeat); // show the slot more clearly
    }
  }, [endPieceDrag, getStagePoint, hintBeat, markInteraction, markWrongAttempt, placeNextPiece, placedCount, playSceneLine]);

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
    // Bridge is fully done — only now do Elephant and Monkey switch from
    // their "helping" pose to happy.
    setFriendImgStates(['empty', 'empty']);
    setFriendPositions(WAIT_SPOTS.map((spot) => ({ l: spot.l, t: spot.t })));

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
    const grab = getStagePoint(event);
    dragStartRef.current = grab;
    setHelpTokenPos(grab);
  }, [currentFriend, getStagePoint, isPaused, stopSceneVoice]);

  const handleHelpPointerMove = useCallback((event) => {
    if (!isDraggingHelp || dragPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    const p = getStagePoint(event);
    setHelpTokenPos(p);
    const g = dragStartRef.current;
    if (!helpDragLearned && g && Math.hypot(p.l - g.l, p.t - g.t) > 3) setHelpDragLearned(true);
  }, [getStagePoint, isDraggingHelp, helpDragLearned]);

  const handleHelpPointerUp = useCallback((event) => {
    if (!isDraggingHelp || dragPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const dropPoint = getStagePoint(event);
    const friend = FRIENDS[friendStep];
    const friendPos = friendPositions[friendStep] || friend;
    const distance = Math.hypot(dropPoint.l - friendPos.l, dropPoint.t - friendPos.t);
    const dropRadius = getFriendDropRadius(friend);

    if (distance <= dropRadius) {
      askFriendForHelp(friendStep);
    } else {
      resetHelpToken();
      markWrongAttempt(); // dragged the help token and dropped it away from the friend
      setClarifyBeat(hintBeat); // make the right helper clearer
    }
  }, [askFriendForHelp, friendPositions, friendStep, getStagePoint, hintBeat, isDraggingHelp, markWrongAttempt, resetHelpToken]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !crossingDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    pausableAfter(500, () => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    });
  }, [pausableAfter]);

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
        }, { stripLeadingText: 'Kuru Me Deva' });
      };
      if (playWord) playWord('kurumedeva', afterWord);
      else afterWord();
      // iOS Safari can silently drop utterance onend/onerror — don't let completion hang on VO
      // Pausable, so the sidebar can't let it complete the game behind the panel.
      voFallbackRef.current = pausableAfter(10000, () => {
        if (!successVoDoneRef.current) {
          successVoDoneRef.current = true;
          completeAfterSuccess();
        }
      });
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
  }, [completeAfterSuccess, pausableAfter, phase, playSceneLine, playWord, stopSceneVoice, safeAfter]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      cancelPausable(voFallbackRef.current);
      voFallbackRef.current = null;
    }
  }, [cancelPausable]);

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

  const selectDebugPhase = (phaseIndex) => {
    setDebugPhase(phaseIndex);
    const nextKey = DEBUG_PHASES[phaseIndex]?.keys?.[0];
    if (nextKey) setSelectedDebugKey(nextKey);
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
        HELPER_SPOTS: HELPER_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`helper${index}`].l),
          t: round1(debugLayout[`helper${index}`].t),
        })),
        WAIT_SPOTS: WAIT_SPOTS.map((_, index) => ({
          l: round1(debugLayout[`wait${index}`].l),
          t: round1(debugLayout[`wait${index}`].t),
        })),
        LOG_PILE_W: round1(debugLayout.logPile0.w),
        LOG_PILE_SLOTS: LOG_PILE_SLOTS.map((slot, index) => ({
          l: round1(debugLayout[`logPile${index}`].l),
          t: round1(debugLayout[`logPile${index}`].t),
        })),
        VINE_SPOT: {
          l: round1(debugLayout.vineSpot.l),
          t: round1(debugLayout.vineSpot.t),
          w: round1(debugLayout.vineSpot.w),
        },
        BEAVER_HOME: {
          l: round1(debugLayout.beaverPath0.l),
          t: round1(debugLayout.beaverPath0.t),
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
  // Stays true once the bridge is fully done too — placeActive flips false
  // the instant the last plank lands, but the placed planks must stay put
  // through crossing/done, not vanish.
  const debugShowsPlanks = debugMode && DEBUG_PHASES[debugPhase].keys.some((key) => key.startsWith('plankSlot'));
  const showPlacedPieces = debugShowsPlanks || placeActive || bridgeStep === TOTAL_ROUNDS;

  // One idle gesture hint, keyed to the current piece/friend. pointer-events:none overlay.
  const gestureHint = (() => {
    if (phase !== 'play' || debugMode || isRoundSettling) return null;
    // Teaching beats only, and only until the child has really dragged one.
    if (!isTeachableBeat || learnedForBeat) return null;
    if (placeActive) {
      const s = PLANK_SLOTS[Math.min(placedCount, PLANK_SLOTS.length - 1)];
      const from = { x: PLANK_PILE.l, y: PLANK_PILE.t };
      const full = hintLevel >= 3 || (kuruIntroGesture && hintBeat === 'plank-0');
      const to = full
        ? { x: s.l, y: s.t }
        : {
          x: from.x + (s.l - from.x) * 0.48,
          y: from.y + (s.t - from.y) * 0.48,
        };
      return { type: 'drag', from, to, k: `plank-${placedCount}-${full ? 'full' : 'partial'}` };
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

  // While a friend is walking over/helping (after the ask, before the next
  // round starts), Beaver's own pose matches which friend it is — lift with
  // Elephant, tie with Monkey — not just a generic worried/idle look.
  const isHelpingInProgress = isRoundSettling && helpDelivered && !placeActive;
  const beaverImg = phase === 'done'
    ? beaverBabyReunionImg
    : phase === 'crossing'
      ? beaverCrossingImg
      : placeActive
        ? beaverPlacingPlankImg
        : isHelpingInProgress
          ? (friendStep === 0 ? beaverLiftImg : beaverTieImg)
          : canAsk
            ? beaverAskingImg
            : beaverIdleWorriedImg;

  return (
    <div className={`kuru-game${hideElements ? ' is-hidden' : ''}${debugMode ? ' is-debugging' : ''}${handPaused ? ' is-paused' : ''}`}>
      <div
        ref={stageRef}
        className="kuru-stage"
        style={{ backgroundImage: `url(${bgImg})` }}
        onPointerMove={debugMode ? applyDebugDrag : undefined}
        onPointerUp={debugMode ? endDebugDrag : undefined}
        onPointerCancel={debugMode ? endDebugDrag : undefined}
        onContextMenu={(event) => event.preventDefault()}
      >
        {/* Dev aid: add ?hitzones to the URL to see help-token and plank drop zones. */}
        {SHOW_HIT_ZONES && (
          <>
            {FRIENDS.map((friend, index) => {
              const pos = friendPositions[index] || friend;
              const dropRadius = getFriendDropRadius(friend);
              const isCurrent = index === friendStep && canAsk;
              return (
                <div key={`hitzone-friend-${friend.id}`}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${pos.l - dropRadius}%`,
                      top: `${pos.t - dropRadius}%`,
                      width: `${dropRadius * 2}%`,
                      height: `${dropRadius * 2}%`,
                      borderRadius: '50%',
                      border: `2px ${isCurrent ? 'solid' : 'dashed'} rgba(0, 170, 90, 0.82)`,
                      background: isCurrent ? 'rgba(0, 170, 90, 0.1)' : 'rgba(0, 170, 90, 0.04)',
                      pointerEvents: 'none',
                      zIndex: 61,
                    }}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
            {PLANK_SLOTS.map((slot, i) => (
              <div
                key={`hitzone-slot-${i}`}
                style={{
                  position: 'absolute',
                  left: `${slot.l - PLANK_DROP_RX}%`,
                  top: `${slot.t - PLANK_DROP_RY}%`,
                  width: `${PLANK_DROP_RX * 2}%`,
                  height: `${PLANK_DROP_RY * 2}%`,
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 120, 255, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 60,
                }}
              />
            ))}
          </>
        )}
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable, index) => {
            stopSceneVoice?.();
            // Kuru (0) -> "Elephant helped..."; me (1) -> "Monkey helped...".
            // Chained after the syllable finishes, not played in parallel —
            // see the notes at the elephant/monkey help beats above.
            const afterKey = index === 0 ? 'kuru_logs_after' : index === 1 ? 'kuru_rope_after' : null;
            playSyllable?.(syllable, afterKey ? () => playSceneLine?.(afterKey) : undefined);
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

        {/* Resting logs — visible before Elephant helps. During the help beat,
            they slide toward the bridge and fade just before step1 appears. */}
        {!debugMode && phase === 'play' && (bridgeStep === 0 || logsFlying) && LOG_PILE_SLOTS.map((slot, i) => {
          const target = logsFlying
            ? {
              l: KURUMEDEVA_LAYOUT.bridge.l - 7 + i * 6,
              t: KURUMEDEVA_LAYOUT.bridge.t - 1 + i * 1.2,
            }
            : slot;
          return (
            <div
              key={`log-pile-${i}`}
              className="kuru-log-piece is-log"
              style={{
                left: `${target.l}%`,
                top: `${target.t}%`,
                width: `${LOG_PILE_W}%`,
                pointerEvents: 'none',
                opacity: logsFlying ? 0.25 : 1,
                transition: logsFlying
                  ? `left ${LOG_FLY_MS}ms ease-in, top ${LOG_FLY_MS}ms ease-in, opacity ${LOG_FLY_MS}ms ease-in`
                  : undefined,
              }}
            >
              <img src={logPieceObj} alt="" draggable={false} />
            </div>
          );
        })}

        {bridgeImg && (
          <div
            className={`kuru-bridge${bridgeStep === TOTAL_ROUNDS ? ' is-complete' : ''}${bridgeWobbling ? ' is-wobbling' : ''}`}
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

        {/* Vine — appears next to Beaver once Elephant's logs land, and
            disappears again once Monkey shows up on the bridge. */}
        {!debugMode && phase === 'play' && bridgeStep === 1 && vineReady && (
          <div
            className="kuru-vine"
            style={{
              left: `${VINE_SPOT.l}%`,
              top: `${VINE_SPOT.t}%`,
              width: `${VINE_SPOT.w}%`,
              pointerEvents: 'none',
            }}
          >
            <img src={vineObj} alt="" draggable={false} />
          </div>
        )}

        {/* Planks already placed (and, in debug, a full preview). Once the
            round succeeds these stay put — no loose pieces linger. */}
        {showPlacedPieces && (() => {
          const debugDone = debugShowsPlanks;
          const bridgeDone = bridgeStep === TOTAL_ROUNDS;
          const roundCurrent = placeActive || bridgeDone;
          if (!debugDone && !roundCurrent) return null;
          const count = (debugDone || bridgeDone) ? PLANK_SLOTS.length : placedCount;
          return PLANK_SLOTS.slice(0, count).map((slot, i) => {
            const isNewest = !debugDone && !bridgeDone && i === count - 1;
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

        {/* Active plank round — simple drag and drop: a faint ghost plank at
            the target slot (no dashed drop-zone oval) plus the draggable
            pile at the friend's feet. */}
        {placeActive && phase === 'play' && placedCount < PLANK_SLOTS.length && (
          <>
            <div
              className={`kuru-span-log is-plank is-ghost${targetGlow ? ' is-hint-glow' : ''}`}
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
                  className={`kuru-log-piece is-plank${isTop ? ' is-top' : ''}${dragging ? ' is-dragging' : ''}${isTop && hintLevel === 1 && !pieceDragActive ? ' pulse' : ''}`}
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
            // beaver-baby-reunion.png already draws both beavers hugging;
            // keep crossing/reunion smaller so they sit beside the bridge.
            width: `${phase === 'done' ? BEAVER_REUNION_W : phase === 'crossing' ? BEAVER_CROSSING_W : KURUMEDEVA_LAYOUT.beaver.w}%`,
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
            ? friend.carryImg
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
                ${isCurrent && imgState === 'carry' && canAsk && targetGlow ? 'hint-glow' : ''}
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
            active={
              hintLevel >= 2
              || (kuruIntroGesture && gestureHint.type !== 'tap' && introGestureVoStarted)
            }
            // Teaching-pass delay is per-beat (GMB gesture-timing presets,
            // matched to each beat's VO lead-in); a rescue triggered by the
            // idle ladder keeps the shorter 400ms — there's no fresh
            // instruction VO to wait out at that point. The teaching pass
            // also waits for its own beat's VO to actually start speaking
            // (introGestureVoStarted) rather than a fixed delay from the
            // beat transition, since TTS startup lag is variable.
            idleDelay={
              kuruIntroGesture && hintLevel < 1
                ? ({ 'ask-elephant': 750, 'plank-0': 750 }[hintBeat] ?? 400)
                : 400
            }
            iterations={1}
            paused={handPaused}
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
              <select value={debugPhase} onChange={(e) => selectDebugPhase(Number(e.target.value))}>
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
