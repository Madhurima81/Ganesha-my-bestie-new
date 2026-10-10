import { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ShlokaRiverFinale.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import MessageManager from '../../../../lib/components/scenes/MessageManager';
import InteractionManager from '../../../../lib/components/scenes/InteractionManager';
import GameStateManager from '../../../../lib/services/GameStateManager';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';

import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import ZoneCompletionFireworks from '../../../../lib/components/feedback/ZoneCompletionFireworks';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import OpeningModal from '../../../shared/components/OpeningModal';

import { getCompletionModal } from '../../../../lib/config/content';

import riverBg from './assets/images/river-finale-bg.webp';
import neutralBoat from './assets/images/choice-boat.png';
import revealVakratunda from '../../../symbol-mountain/shared/images/icons/symbol-trunk-new.webp';
import revealMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.webp';
import revealSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.webp';
import revealSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.webp';
import revealNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.webp';
import revealKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.webp';
import revealSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.webp';
import revealSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.webp';

const ORB_APP_IMAGES = {
  vakratunda: revealVakratunda,
  mahakaya: revealMahakaya,
  suryakoti: revealSuryakoti,
  samaprabha: revealSamaprabha,
  nirvighnam: revealNirvighnam,
  kurumedeva: revealKurumedeva,
  sarvakaryeshu: revealSarvakaryeshu,
  sarvada: revealSarvada,
};

const OPENING_SCENE_GANESHA = '/images/new-ganesha-sit-modak.webp';
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

const SHLOKA_WORDS = [
  { id: 'vakratunda', label: 'Vakratunda', icon: ORB_APP_IMAGES.vakratunda, color: '#FF5722' },
  { id: 'mahakaya', label: 'Mahakaya', icon: ORB_APP_IMAGES.mahakaya, color: '#1565C0' },
  { id: 'suryakoti', label: 'Suryakoti', icon: ORB_APP_IMAGES.suryakoti, color: '#FF9800' },
  { id: 'samaprabha', label: 'Samaprabha', icon: ORB_APP_IMAGES.samaprabha, color: '#E91E63' },
  { id: 'nirvighnam', label: 'Nirvighnam', icon: ORB_APP_IMAGES.nirvighnam, color: '#009688' },
  { id: 'kurumedeva', label: 'Kurumedeva', icon: ORB_APP_IMAGES.kurumedeva, color: '#7B1FA2' },
  { id: 'sarvakaryeshu', label: 'Sarvakaryeshu', icon: ORB_APP_IMAGES.sarvakaryeshu, color: '#3F51B5' },
  { id: 'sarvada', label: 'Sarvada', icon: ORB_APP_IMAGES.sarvada, color: '#689F38' },
];

const FULL_SHLOKA_WORD_AUDIO = SHLOKA_WORDS.map((word) => `/audio/words/${word.id}.mp3`);

const FINALE_HINT_VO_KEY = {
  vakratunda: { l2: 'finaleVakratundaHintL2', l3: 'finaleVakratundaHintL3' },
  mahakaya: { l2: 'finaleMahakayaHintL2', l3: 'finaleMahakayaHintL3' },
  suryakoti: { l2: 'finaleSuryakotiHintL2', l3: 'finaleSuryakotiHintL3' },
  samaprabha: { l2: 'finaleSamaprabhaHintL2', l3: 'finaleSamaprabhaHintL3' },
  nirvighnam: { l2: 'finaleNirvighnamHintL2', l3: 'finaleNirvighnamHintL3' },
  kurumedeva: { l2: 'finaleKurumedevaHintL2', l3: 'finaleKurumedevaHintL3' },
  sarvakaryeshu: { l2: 'finaleSarvakaryeshuHintL2', l3: 'finaleSarvakaryeshuHintL3' },
  sarvada: { l2: 'finaleSarvadaHintL2', l3: 'finaleSarvadaHintL3' },
};

function BoatSvg({ className = '', style = {} }) {
  return (
    <svg
      className={`boat-svg ${className}`}
      style={style}
      viewBox="0 0 79.375 79.375"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="m 33.186,6.159 c 0,0 2.371,-0.666 3.476,-0.302 1.085,0.357 1.464,1.98 2.569,2.267 1.148,0.298 3.476,-0.756 3.476,-0.756 0,0 -2.594,2.944 -4.383,3.174 -0.965,0.124 -1.748,-1.013 -2.72,-1.058 -1.466,-0.068 -4.232,1.209 -4.232,1.209 z"
      />
      <rect
        fill="#f9bd66"
        width="2.325"
        height="9.588"
        x="33.069"
        y="-8.929"
        ry="1.498"
        transform="matrix(0.93,0.367,-0.262,0.965,0,0)"
      />
      <path
        fill="currentColor"
        d="M 19.735,46.965 30.768,10.693 c 0,0 18.198,7.422 23.728,14.962 4.682,6.385 6.045,22.972 6.045,22.972 l -0.302,-0.302 -24.785,3.023 z"
      />
      <path
        fill="#d28035"
        d="m 4.924,44.093 c 0,0 0.448,11.166 2.872,16.02 1.752,3.508 4.517,6.832 8.01,8.614 6.646,3.391 14.756,2.679 22.216,2.72 7.755,0.043 16.233,0.991 23.123,-2.569 3.836,-1.982 6.877,-5.72 8.614,-9.672 2.017,-4.589 1.511,-14.962 1.511,-14.962 0,0 -21.962,4.555 -33.098,4.534 C 26.981,48.756 4.924,44.093 4.924,44.093 Z"
      />
      <path
        fill="#692f15"
        d="m 5.076,47.685 c 0,0 0.085,2.166 0.386,5.004 1.495,0.282 21.751,4.067 32.19,4.064 11.195,-0.002 33.323,-4.232 33.323,-4.232 0,0 -0.275,5.619 -1.379,9.241 1.736,-4.979 1.827,-14.078 1.827,-14.078 0,0 -22.209,4.7 -33.472,4.686 C 26.883,52.357 5.076,47.685 5.076,47.685 Z"
      />
      <path
        fill="#83431e"
        d="m 5.227,49.08 c 0,0 -0.121,8.148 1.662,11.637 1.848,3.617 5.129,6.655 8.766,8.463 6.711,3.338 14.721,3.43 22.216,3.476 7.787,0.048 16.133,0.107 23.123,-3.325 4.157,-2.041 8.05,-5.46 9.975,-9.672 1.489,-3.258 0.605,-10.73 0.605,-10.73 0,0 -22.38,4.228 -33.702,4.232 -10.966,0.002 -32.644,-4.081 -32.644,-4.081 z"
      />
    </svg>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASES = {
  INITIAL: 'initial',
  ARRANGE: 'arrange',
  SUCCESS: 'success',
  FINALE: 'finale',
  COMPLETE: 'complete',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="srf-error">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ShlokaRiverFinale = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'shloka-river-finale',
}) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        completed: false,
        stars: 0,
        welcomeShown: false,
        wordsPlaced: 0,
        currentPopup: null,
        showingCompletionScreen: false,
      }}
    >
      {({ sceneState, sceneActions }) => (
        <ShlokaRiverFinaleContent
          sceneState={sceneState}
          sceneActions={sceneActions}
          onComplete={onComplete}
          onNavigate={onNavigate}
          zoneId={zoneId}
          sceneId={sceneId}
        />
      )}
    </SceneManager>
  </ErrorBoundary>
);

const SCENE_IMAGES = [
  riverBg,
  neutralBoat,
  revealVakratunda,
  revealMahakaya,
  revealSuryakoti,
  revealSamaprabha,
  revealNirvighnam,
  revealKurumedeva,
  revealSarvakaryeshu,
  revealSarvada,
  OPENING_SCENE_GANESHA,
];

const DEFAULT_SYMBOL_TUNE = {
  left: 61,
  top: 34,
  width: 40,
  height: 44,
  scale: 1,
};

// Locked in from the finale boat tuner (Copy Tune JSON) — per-word symbol
// left/top/width/height come from Madhurima's on-scene drag pass, 2026-09-30.
// Same landscape-phone query the rest of the app uses (checked once at load).
const IS_PHONE_FINALE = typeof window !== 'undefined'
  && !!window.matchMedia?.('(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)').matches;
const DEFAULT_FINALE_TUNE = {
  choiceBottom: 11,
  choiceWidth: 180,
  choiceSymbol: DEFAULT_SYMBOL_TUNE,
  // Horseshoe fleet: the 8 boats arc across the river (rising to the middle, then
  // descending) so the centre stays open for the chanted word's recap symbol.
  // Percentages are of .srf-boat-parade. iPad/desktop: outer two pairs pulled ~5% inward
  // (river is much wider there); phone: only the bottom two boats ~2.5% inward.
  placed: IS_PHONE_FINALE ? [
    { left: 14.5, top: 80 }, // Vakratunda
    { left: 23, top: 58 },   // Mahakaya
    { left: 35, top: 40 },   // Suryakoti
    { left: 45, top: 25 },   // Samaprabha
    { left: 55, top: 25 },   // Nirvighnam
    { left: 65, top: 40 },   // Kurumedeva
    { left: 77, top: 58 },   // Sarvakaryeshu
    { left: 85.5, top: 80 }, // Sarvada
  ] : [
    { left: 17, top: 80 },   // Vakratunda
    { left: 28, top: 58 },   // Mahakaya
    { left: 35, top: 40 },   // Suryakoti
    { left: 45, top: 25 },   // Samaprabha
    { left: 55, top: 25 },   // Nirvighnam
    { left: 65, top: 40 },   // Kurumedeva
    { left: 72, top: 58 },   // Sarvakaryeshu
    { left: 83, top: 80 },   // Sarvada
  ],
  wordSymbol: {
    vakratunda: { left: 58.1, top: 48.4, width: 26, height: 30, scale: 1.18 },
    // Mahakaya + Sarvakaryeshu sized up on request — bigger scale than the
    // rest, everyone else untouched.
    mahakaya: { left: 59, top: 49, width: 26, height: 30, scale: 1.35 },
    suryakoti: { left: 60.2, top: 49.6, width: 40, height: 44, scale: 1 },
    samaprabha: { left: 59.4, top: 48, width: 40, height: 44, scale: 1 },
    nirvighnam: { left: 61.2, top: 47.5, width: 40, height: 44, scale: 1 },
    kurumedeva: { left: 57.6, top: 50.8, width: 40, height: 44, scale: 1 },
    sarvakaryeshu: { left: 59.1, top: 47.9, width: 26, height: 30, scale: 1.35 },
    sarvada: { left: 60.1, top: 50.9, width: 40, height: 44, scale: 1 },
  },
};

const clampTune = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

const CHOICE_BOAT_HIT_POLYGON = [
  [0.1, 0.72],
  [0.25, 0.5],
  [0.43, 0.08],
  [0.58, 0.08],
  [0.82, 0.5],
  [0.94, 0.72],
  [0.82, 0.94],
  [0.18, 0.94],
];

const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
};

const isPointerInsideElementPolygon = (event, polygon) => {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  return isPointInPolygon({
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  }, polygon);
};

const ShlokaRiverFinaleContent = ({
  sceneState,
  sceneActions,
  onComplete,
  onNavigate,
  zoneId,
  sceneId,
}) => {
  usePreloadPoses(SCENE_IMAGES);
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { stopVoice, playVoice, playSfx, playWord: playWordAudio, setCurrentPhase, setVoiceVolume } = useVoiceGuidance(
    zoneId,
    sceneId,
    { enableMusic: false, idleTimeout: 999999 }
  );
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({});
  const { playUiTap, playSparkle } = useGameSounds();

  // Resume: words already placed correctly (checkpointed per word). Only honoured when
  // the saved phase is ARRANGE; a fresh game / replay has no wordsPlaced.
  const [resumeWords] = useState(() => (
    sceneState.phase === PHASES.ARRANGE
      ? Math.max(0, Math.min(SHLOKA_WORDS.length - 1, Number(sceneState.wordsPlaced) || 0))
      : 0
  ));
  const [scrambledWords, setScrambledWords] = useState(() => shuffle(SHLOKA_WORDS));
  const [slots, setSlots] = useState(() => Array(8).fill(null).map((_, i) => (i < resumeWords ? SHLOKA_WORDS[i].id : null)));
  const [wrongWordId, setWrongWordId] = useState(null);
  const [correctSlots, setCorrectSlots] = useState(() => new Set(Array.from({ length: resumeWords }, (_, i) => i)));
  const [draggingWord, setDraggingWord] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [missDrop, setMissDrop] = useState(null);
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(resumeWords);
  const [rippleSlot, setRippleSlot] = useState(null);
  const [showOrbsCelebration, setShowOrbsCelebration] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [sailingWordId, setSailingWordId] = useState(null);
  const [introTeaching, setIntroTeaching] = useState(false);
  const [introSymbolIndex, setIntroSymbolIndex] = useState(null);
  const [choiceWords, setChoiceWords] = useState([]);
  const [debugTune, setDebugTune] = useState(DEFAULT_FINALE_TUNE);
  const [debugWordId, setDebugWordId] = useState(SHLOKA_WORDS[0].id);
  const [debugPlacedIndex, setDebugPlacedIndex] = useState(0);
  // Dev tuner extras: on-scene drag mode, "preview all 8 placed boats", a
  // draggable/collapsible panel, and a copy-JSON status.
  const [debugDragOn, setDebugDragOn] = useState(false);
  const [debugShowAll, setDebugShowAll] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(true);
  const [debugPanelPos, setDebugPanelPos] = useState({ x: 12, y: 96 });
  // Drag mode only actually engages while the panel is open, so collapsing
  // it (or leaving it checked from a previous session) can never leave
  // gameplay hijacked by tuner handlers.
  const tunerDragActive = debugDragOn && debugPanelOpen;
  const [debugCopyStatus, setDebugCopyStatus] = useState('');
  const paradeRef = useRef(null);

  // buildReady/hintReadySlot gate the hint ladder: it must never start while
  // the opening whole-Shloka listen or a pair-reinforcement playback is
  // talking, only once the child is actually waiting on a specific slot.
  const [buildReady, setBuildReady] = useState(false);
  const [hintReadySlot, setHintReadySlot] = useState(null);
  // Highlights each placed boat as the completed board's own Shloka plays —
  // this replaces the old moving recap-boat sequence as the "hear it back"
  // payoff, without taking the child away from the board they just built.
  const [chantHighlightIndex, setChantHighlightIndex] = useState(null);
  // Tiny completion beat after the 8th boat lands: all 8 boats bob/sparkle
  // once, before the "let's say it together" recap begins.
  const [allBoatsCelebrate, setAllBoatsCelebrate] = useState(false);

  const stageRef = useRef(null);
  const fullShlokaAudioRef = useRef(null);
  const fullShlokaPlaybackTokenRef = useRef(0);
  const resumeHandledRef = useRef(false);
  const dragMovedRef = useRef(false);
  const finalChantStartedRef = useRef(false);
  const chantRecapStartedRef = useRef(false);
  const lastFinaleHintVoRef = useRef(null);
  // Guards triggerSuccessFlow (declared below) against double-firing when
  // both the live placeWord path and the SUCCESS resume-effect can call it.
  const successFlowStartedRef = useRef(false);

  const phase = sceneState.phase || PHASES.INITIAL;
  const usedWords = new Set(slots.filter(Boolean));
  const currentTargetWord = SHLOKA_WORDS[activeSlotIndex] || null;
  const trayWords = scrambledWords.length ? scrambledWords : SHLOKA_WORDS;
  const selectedSymbolTune = debugTune.wordSymbol[debugWordId] || debugTune.choiceSymbol;

  const updateDebugTune = useCallback((updater) => {
    setDebugTune((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return {
        ...next,
        choiceSymbol: { ...DEFAULT_SYMBOL_TUNE, ...next.choiceSymbol },
        placed: DEFAULT_FINALE_TUNE.placed.map((fallback, index) => ({
          ...fallback,
          ...(next.placed?.[index] || {}),
        })),
        wordSymbol: next.wordSymbol || {},
      };
    });
  }, []);

  const updateChoiceSymbolTune = useCallback((key, value) => {
    updateDebugTune((prev) => ({
      ...prev,
      choiceSymbol: {
        ...prev.choiceSymbol,
        [key]: value,
      },
    }));
  }, [updateDebugTune]);

  const updateWordSymbolTune = useCallback((wordId, key, value) => {
    updateDebugTune((prev) => ({
      ...prev,
      wordSymbol: {
        ...prev.wordSymbol,
        [wordId]: {
          ...prev.choiceSymbol,
          ...(prev.wordSymbol[wordId] || {}),
          [key]: value,
        },
      },
    }));
  }, [updateDebugTune]);

  const patchWordSymbolTune = useCallback((wordId, patch) => {
    updateDebugTune((prev) => ({
      ...prev,
      wordSymbol: {
        ...prev.wordSymbol,
        [wordId]: {
          ...prev.choiceSymbol,
          ...(prev.wordSymbol[wordId] || {}),
          ...patch,
        },
      },
    }));
  }, [updateDebugTune]);

  const resetWordSymbolTune = useCallback((wordId) => {
    updateDebugTune((prev) => {
      const nextWordSymbol = { ...prev.wordSymbol };
      delete nextWordSymbol[wordId];
      return { ...prev, wordSymbol: nextWordSymbol };
    });
  }, [updateDebugTune]);

  const updatePlacedTune = useCallback((index, key, value) => {
    updateDebugTune((prev) => {
      const placed = prev.placed.map((position, idx) => (
        idx === index ? { ...position, [key]: value } : position
      ));
      return { ...prev, placed };
    });
  }, [updateDebugTune]);

  const getSymbolStyle = useCallback((wordId) => {
    const tune = debugTune.wordSymbol[wordId] || debugTune.choiceSymbol;
    return {
      '--srf-symbol-left': `${tune.left}%`,
      '--srf-symbol-top': `${tune.top}%`,
      '--srf-symbol-width': `${tune.width}%`,
      '--srf-symbol-height': `${tune.height}%`,
      '--srf-symbol-scale': tune.scale,
    };
  }, [debugTune.choiceSymbol, debugTune.wordSymbol]);

  const getPlacedBoatStyle = useCallback((idx, wordData) => ({
    color: wordData.color,
    left: `${debugTune.placed[idx]?.left ?? DEFAULT_FINALE_TUNE.placed[idx].left}%`,
    top: `${debugTune.placed[idx]?.top ?? DEFAULT_FINALE_TUNE.placed[idx].top}%`,
    '--srf-placed-scale': debugTune.placed[idx]?.scale ?? 1,
    ...getSymbolStyle(wordData.id),
  }), [debugTune.placed, getSymbolStyle]);

  useEffect(() => {
    if (phase !== PHASES.ARRANGE || !buildReady || introTeaching || !currentTargetWord) {
      setChoiceWords([]);
      return;
    }

    const usedIds = new Set(slots.filter(Boolean));
    const remaining = trayWords.filter((word) => !usedIds.has(word.id));
    if (remaining.length <= 3) {
      setChoiceWords(remaining);
      return;
    }

    // `currentTargetWord` (from activeSlotIndex) lags one tick behind
    // `slots` right when a boat lands — placeWord updates slots immediately,
    // but activeSlotIndex only advances after the placement VO finishes.
    // Deriving the target from `remaining` itself (still in shloka order)
    // keeps this correct at that instant, instead of briefly re-adding the
    // boat that was just placed back into the choice tray.
    const nextTarget = SHLOKA_WORDS.find((word) => !usedIds.has(word.id)) || currentTargetWord;
    // Random 2 of whatever's left each time the tray rebuilds — not just
    // "next 2 in the shuffled queue" — so the distractor pair itself varies
    // turn to turn, not only the left/mid/right position.
    const distractors = shuffle(remaining.filter((word) => word.id !== nextTarget.id)).slice(0, 2);
    setChoiceWords(shuffle([nextTarget, ...distractors]));
  }, [activeSlotIndex, buildReady, currentTargetWord, introTeaching, phase, slots, trayWords]);

  const fillCompletedBoard = useCallback(() => {
    setSlots(SHLOKA_WORDS.map((word) => word.id));
    setCorrectSlots(new Set(SHLOKA_WORDS.map((_, index) => index)));
    setWrongWordId(null);
    setActiveSlotIndex(SHLOKA_WORDS.length - 1);
    setRippleSlot(null);
    setIntroTeaching(false);
    setIntroSymbolIndex(null);
  }, []);

  useEffect(() => {
    setCurrentPhase?.(phase);
  }, [phase, setCurrentPhase]);

  useEffect(() => () => {
    clearAllTimeouts();
    fullShlokaPlaybackTokenRef.current += 1;
    fullShlokaAudioRef.current?.pause();
    fullShlokaAudioRef.current = null;
  }, []);

  const stopAllVoice = useCallback(() => {
    fullShlokaPlaybackTokenRef.current += 1;
    stopVoice?.();
    fullShlokaAudioRef.current?.pause();
    fullShlokaAudioRef.current = null;
  }, [stopVoice]);

  const handleAudioToggle = useCallback(() => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn) {
      stopAllVoice();
    }
    toggleAudio();
  }, [isAudioOn, setVoiceVolume, stopAllVoice, toggleAudio]);

  const playFullShloka = useCallback(({ onWordStart, onComplete } = {}) => {
    if (!isAudioOn) {
      onComplete?.();
      return;
    }

    fullShlokaPlaybackTokenRef.current += 1;
    const playbackToken = fullShlokaPlaybackTokenRef.current;
    fullShlokaAudioRef.current?.pause();
    fullShlokaAudioRef.current = null;

    const playWordAtIndex = (index) => {
      if (fullShlokaPlaybackTokenRef.current !== playbackToken) return;
      if (index >= FULL_SHLOKA_WORD_AUDIO.length) {
        fullShlokaAudioRef.current = null;
        onComplete?.();
        return;
      }

      onWordStart?.(index);
      const audio = new Audio(FULL_SHLOKA_WORD_AUDIO[index]);
      audio.volume = 0.95;
      audio.onended = () => playWordAtIndex(index + 1);
      audio.onerror = () => playWordAtIndex(index + 1);
      fullShlokaAudioRef.current = audio;
      audio.play().catch(() => playWordAtIndex(index + 1));
    };

    playWordAtIndex(0);
  }, [isAudioOn]);

  useEffect(() => {
    if (phase !== PHASES.INITIAL) return;
    resumeHandledRef.current = false;
    finalChantStartedRef.current = false;
    chantRecapStartedRef.current = false;
    successFlowStartedRef.current = false;
    setOpeningButtonVisible(!isAudioOn);
    setScrambledWords(shuffle(SHLOKA_WORDS));
    setSlots(Array(8).fill(null));
    setWrongWordId(null);
    setCorrectSlots(new Set());
    setActiveSlotIndex(0);
    setRippleSlot(null);
    setBuildReady(false);
    setHintReadySlot(null);
    setChantHighlightIndex(null);
    setSailingWordId(null);
    setIntroTeaching(false);
    setIntroSymbolIndex(null);
    if (!isAudioOn) {
      return undefined;
    }

    const revealButton = () => setOpeningButtonVisible(true);
    const revealFallback = safeSetTimeout(revealButton, 9000);
    playVoice?.('openingModalPrompt', () => {
      revealFallback?.();
      revealButton();
    }, { replayOnReturn: false });

    return () => revealFallback?.();
  }, [isAudioOn, phase, playVoice, safeSetTimeout]);

  // Finale hint = a 2-step recall system (the boats are already in front of the child, so no
  // "look at the boats" nudge):
  //   hintLevel 1 (~13s idle) → meaning-clue VO (never the word/boat itself)
  //   hintLevel >=2 (~25s idle) → correct boat glows and STAYS lit; the word is spoken once
  // A 2nd wrong answer plays the meaning clue early (handled below, not by the hook's escalation,
  // which would jump straight to the rescue). Enabled only once the child is actually waiting on a
  // specific slot — never while the opening whole-Shloka listen or a pair-reinforcement replay
  // is still talking.
  const {
    hintLevel,
    markInteraction,
    markAttempt,
  } = useRepeatedHintCycle({
    enabled: phase === PHASES.ARRANGE
      && buildReady
      && !introTeaching
      && !sailingWordId
      && hintReadySlot === activeSlotIndex,
    stageKey: phase === PHASES.ARRANGE ? `finale-slot-${activeSlotIndex}` : phase,
    initialDelay: 13000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1800,
    level2Delay: 25000,
    level3Delay: 40000, // no new behaviour at L3 — the rescue stays as-is
  });

  const clueSpokenSlotRef = useRef(null);
  const wrongCountRef = useRef(0);

  useEffect(() => {
    lastFinaleHintVoRef.current = null;
    clueSpokenSlotRef.current = null;
    wrongCountRef.current = 0;
  }, [activeSlotIndex]);

  // Meaning clue, once per slot — from the idle ladder (L1) or an early 2nd wrong answer.
  const playMeaningClue = useCallback(() => {
    if (clueSpokenSlotRef.current === activeSlotIndex) return;
    const meaningKey = FINALE_HINT_VO_KEY[SHLOKA_WORDS[activeSlotIndex]?.id]?.l2;
    if (!meaningKey) return;
    clueSpokenSlotRef.current = activeSlotIndex;
    playVoice?.(meaningKey, undefined, { replayOnReturn: false, minDelayAfterVoiceMs: 5000 });
  }, [activeSlotIndex, playVoice]);

  useEffect(() => {
    if (
      phase !== PHASES.ARRANGE
      || !buildReady
      || hintReadySlot !== activeSlotIndex
      || hintLevel < 1
    ) {
      return;
    }

    if (hintLevel === 1) {
      playMeaningClue();
      return;
    }

    const target = SHLOKA_WORDS[activeSlotIndex];
    if (!target) return;

    const onceKey = `${activeSlotIndex}-rescue`;
    if (lastFinaleHintVoRef.current === onceKey) return;
    lastFinaleHintVoRef.current = onceKey;

    const revealKey = FINALE_HINT_VO_KEY[target.id]?.l3;
    if (revealKey) {
      playVoice?.(revealKey, undefined, { replayOnReturn: false, minDelayAfterVoiceMs: 5000 });
    }
  }, [activeSlotIndex, buildReady, hintLevel, hintReadySlot, introTeaching, phase, playVoice, playMeaningClue]);

  // A wrong answer is feedback only: it never resets or postpones the ladder and never cuts a
  // playing clue. The 2nd wrong on a slot earns the meaning clue early.
  const noteWrongAnswer = useCallback(() => {
    wrongCountRef.current += 1;
    if (wrongCountRef.current >= 2) playMeaningClue();
  }, [playMeaningClue]);

  // Resume case: the component can mount directly into ARRANGE (reload)
  // without ever going through handleStartGame's opening listen. Replay the
  // current target word's audio once and arm hints only after it ends, same
  // as the normal flow — never on mount alone.
  const armedOnMountRef = useRef(false);
  useEffect(() => {
    if (armedOnMountRef.current) return;
    armedOnMountRef.current = true;
    if (phase !== PHASES.ARRANGE) return;
    if (resumeWords > 0) {
      // Resuming after finished words: no target-word audio (it would give the answer away).
      setBuildReady(true);
      setHintReadySlot(activeSlotIndex);
      return;
    }
    setBuildReady(false);
    playWordAudio?.(SHLOKA_WORDS[activeSlotIndex]?.id, () => {
      setBuildReady(true);
      setHintReadySlot(activeSlotIndex);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartGame = () => {
    sceneActions.checkpoint({ phase: PHASES.ARRANGE, welcomeShown: true, wordsPlaced: 0 });
    setBuildReady(false);
    setHintReadySlot(null);
    setIntroTeaching(true);
    setIntroSymbolIndex(null);
    playVoice?.('arrangeStart', () => {
      playFullShloka({
        onWordStart: (index) => setIntroSymbolIndex(index),
        onComplete: () => {
          setIntroSymbolIndex(null);
          const makePlayable = () => {
            setIntroTeaching(false);
            setBuildReady(true);
            setHintReadySlot(0);
          };
          safeSetTimeout(() => {
            playVoice?.('finaleChooseFirst', makePlayable, { replayOnReturn: false });
            if (!playVoice) makePlayable();
          }, 450);
        },
      });
    }, { replayOnReturn: false });
  };

  const makeArrangePlayableNow = useCallback(() => {
    if (phase !== PHASES.ARRANGE || buildReady) return;
    stopAllVoice();
    setBuildReady(true);
    setHintReadySlot(activeSlotIndex);
  }, [activeSlotIndex, buildReady, phase, stopAllVoice]);

  const triggerSuccessFlow = useCallback(() => {
    if (successFlowStartedRef.current) return;
    successFlowStartedRef.current = true;

    setHintReadySlot(null);
    sceneActions.checkpoint({ phase: PHASES.SUCCESS, wordsPlaced: SHLOKA_WORDS.length });

    const startRecap = () => {
      if (chantRecapStartedRef.current) return;
      chantRecapStartedRef.current = true;

      setChantHighlightIndex(null);
      playFullShloka({
        onWordStart: (index) => setChantHighlightIndex(index),
        onComplete: () => {
          setChantHighlightIndex(null);
          safeSetTimeout(() => {
            sceneActions.updateState({ phase: PHASES.FINALE });
          }, 700);
        },
      });
    };

    const playCompletedShloka = () => {
      if (finalChantStartedRef.current) return;
      finalChantStartedRef.current = true;

      // Let the "Sarvada" landing breathe, then give the finished parade one
      // shared celebratory bob/sparkle before inviting the recap — not
      // another completion card, just the built boats being seen.
      safeSetTimeout(() => {
        setAllBoatsCelebrate(true);
        playSparkle?.();

        safeSetTimeout(() => {
          setAllBoatsCelebrate(false);

          playVoice?.('finaleWholeShlokaIntro', () => {
            safeSetTimeout(startRecap, 300);
          }, { replayOnReturn: false });

          // VO callbacks can fail to fire — never strand SUCCESS.
          safeSetTimeout(startRecap, 3500);
        }, 700);
      }, 700);
    };

    playVoice?.('sceneComplete', () => {
      safeSetTimeout(playCompletedShloka, 400);
    }, { replayOnReturn: false });

    // VO callbacks can fail to fire (missing file, iOS dropping events) —
    // don't strand SUCCESS on a dropped callback.
    safeSetTimeout(playCompletedShloka, 5000);
  }, [playFullShloka, playSparkle, playVoice, safeSetTimeout, sceneActions]);

  // Resume case: mounting directly into SUCCESS (reload) should fill the
  // board and continue into the completed-Shloka playback. Idempotent with
  // the live placeWord path via successFlowStartedRef, so this never
  // double-fires the completion VO for a child who just finished live.
  useEffect(() => {
    if (phase !== PHASES.SUCCESS) return undefined;
    fillCompletedBoard();

    if (resumeHandledRef.current) return undefined;
    resumeHandledRef.current = true;

    const resumeTimer = safeSetTimeout(() => triggerSuccessFlow(), 500);
    return () => resumeTimer?.();
  }, [phase, fillCompletedBoard, safeSetTimeout, triggerSuccessFlow]);

  const placeWord = useCallback((wordData, slotIdx) => {
    const isCorrect = SHLOKA_WORDS[slotIdx].id === wordData.id;

    if (!isCorrect) {
      // Only a correct placement counts as real progress. A wrong guess never clears a visible
      // hint or cuts a playing clue, and a 2nd wrong one earns the meaning clue early.
      setWrongWordId(wordData.id);
      playSfx?.('softWrong');
      noteWrongAnswer();
      safeSetTimeout(() => setWrongWordId(null), 500);
      return;
    }

    stopAllVoice();
    markInteraction();

    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = wordData.id;
      return next;
    });

    setCorrectSlots((prev) => {
      const next = new Set(prev);
      next.add(slotIdx);
      return next;
    });
    setRippleSlot(slotIdx);
    safeSetTimeout(() => setRippleSlot(null), 650);
    setHintReadySlot(null);
    // Stable beat: this word is placed. Write it now (not via the 1s autosave).
    if (slotIdx < SHLOKA_WORDS.length - 1) sceneActions.checkpoint({ wordsPlaced: slotIdx + 1 });

    // No sparkle here: the word's own pronunciation (playWordAudio below) is the reward for placing it.
    // A sparkle fired in the same instant, on top of the Sanskrit.

    const isFinalSlot = slotIdx === SHLOKA_WORDS.length - 1;
    const advanceToNextStep = () => {
      if (isFinalSlot) {
        setSailingWordId(null);
        triggerSuccessFlow();
        return;
      }
      const nextSlot = slotIdx + 1;
      setActiveSlotIndex(nextSlot);
      setSailingWordId(null);
      safeSetTimeout(() => setHintReadySlot(nextSlot), 250);
    };

    // The next boat becomes tappable right away — the little "keep
    // choosing" encouragement line plays alongside it, not as a gate. Only
    // slots 0/1 get that extra line; from slot 2 on it was already just the
    // word audio, so this makes every slot equally responsive.
    const advance = () => {
      advanceToNextStep();
      if (slotIdx === 0) {
        playVoice?.('finaleChooseNext', undefined, { replayOnReturn: false });
      } else if (slotIdx === 1) {
        playVoice?.('finaleKeepChoosing', undefined, { replayOnReturn: false });
      }
    };

    // (No chime on the final word either: the full-word audio plays alone, then the success flow runs.)
    if (playWordAudio) {
      playWordAudio(wordData.id, advance);
    } else {
      safeSetTimeout(advance, 250);
    }
  }, [sceneActions, markInteraction, noteWrongAnswer, stopAllVoice, playSfx, playVoice, playWordAudio, safeSetTimeout, triggerSuccessFlow]);

  const handleTrayPointerDown = (e, wordData) => {
    if (phase !== PHASES.ARRANGE || usedWords.has(wordData.id)) return;
    e.preventDefault();
    dragMovedRef.current = false;
    // Don't cut a playing clue on pointer-down: a wrong drop must not silence it. Voice is
    // stopped when the drop is correct (placeWord). Skipping the opening listen stops it itself.
    makeArrangePlayableNow();
    playUiTap();
    // Grabbing the correct boat is an attempt, not progress: a visible hint stays up, and the
    // idle clock restarts only if none is showing. Placing it is what counts as progress.
    if (wordData.id === currentTargetWord?.id) {
      markAttempt();
    }
    setDraggingWord(wordData);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingWord) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    dragMovedRef.current = true;
  };

  const handlePointerUp = (e) => {
    if (!draggingWord) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      setDraggingWord(null);
      setDragPos(null);
      return;
    }

    const activeSlotEl = stageRef.current.querySelector(`.srf-slot[data-index="${activeSlotIndex}"]`);
    let placed = false;
    if (activeSlotEl && !slots[activeSlotIndex]) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const slotRect = activeSlotEl.getBoundingClientRect();
      const sx = ((slotRect.left + slotRect.width / 2 - rect.left) / rect.width) * 100;
      const sy = ((slotRect.top + slotRect.height / 2 - rect.top) / rect.height) * 100;
      if (Math.hypot(x - sx, y - sy) < 16) {
        placeWord(draggingWord, activeSlotIndex);
        placed = true;
      }
    }

    // Drop landed outside the target slot — this is a memory-order game, not
    // a failure state, so it just lands with a tiny bounce and settles back
    // to the tray. No VO, no red, no penalty.
    if (!placed && dragPos) {
      setMissDrop({ key: Date.now(), word: draggingWord, x: dragPos.x, y: dragPos.y });
    }

    setDraggingWord(null);
    setDragPos(null);
  };

  const handleWordChipTap = (wordData) => {
    if (phase !== PHASES.ARRANGE || !buildReady || introTeaching || usedWords.has(wordData.id) || sailingWordId) return;
    playUiTap();

    const isCorrect = currentTargetWord?.id === wordData.id;
    if (!isCorrect) {
      // A wrong boat makes a playful little false start, then floats back. The playing clue
      // (if any) keeps going; the hint state is untouched.
      setWrongWordId(wordData.id);
      playSfx?.('softWrong');
      noteWrongAnswer();
      safeSetTimeout(() => setWrongWordId(null), 650);
      return;
    }

    stopAllVoice();

    // Let the child SEE the success: the boat sails toward the glowing ripple
    // before the existing placement/audio/reinforcement logic takes over.
    setSailingWordId(wordData.id);
    markInteraction();
    safeSetTimeout(() => {
      placeWord(wordData, activeSlotIndex);
    }, 650);
  };

  const handleChoiceBoatTap = (event, wordData) => {
    if (import.meta.env.DEV && tunerDragActive) return;
    if (!isPointerInsideElementPolygon(event, CHOICE_BOAT_HIT_POLYGON)) return;
    handleWordChipTap(wordData);
  };

  useEffect(() => {
    if (phase === PHASES.FINALE) {
      setShowOrbsCelebration(true);
      // Was firing in handleOrbsComplete (celebration END) — landed right
      // as the orbs closed and the completion modal opened, so it read as
      // "plays while closing" instead of during the celebration itself.
      playVoice?.('finalCelebration', undefined, { replayOnReturn: false });
    }
  }, [phase, playVoice]);

  // Re-plays whatever line belongs to the current phase — same "one replay
  // button per scene" pattern as every other live scene.
  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (phase === PHASES.INITIAL) {
      playVoice?.('openingModalPrompt', undefined, { replayOnReturn: false });
    } else if (phase === PHASES.ARRANGE) {
      playVoice?.('arrangeStart', undefined, { replayOnReturn: false });
    } else if (phase === PHASES.SUCCESS) {
      playVoice?.('sceneComplete', undefined, { replayOnReturn: false });
    } else if (phase === PHASES.FINALE || phase === PHASES.COMPLETE) {
      playVoice?.('finalCelebration', undefined, { replayOnReturn: false });
    }
  }, [isAudioOn, phase, playVoice]);

  const handleOrbsComplete = useCallback(() => {
    setShowOrbsCelebration(false);

    const profileId = activeProfile?.id || localStorage.getItem('activeProfileId');
    if (profileId) {
      const tempKey = `temp_session_${profileId}_${zoneId}_${sceneId}`;

      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 8,
        phase: PHASES.COMPLETE,
        timestamp: Date.now(),
      });
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 8,
      });

      localStorage.removeItem(tempKey);
      SimpleSceneManager.clearCurrentScene();
    }

    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      completed: true,
      stars: 8,
      showingCompletionScreen: true,
    });

    setShowSceneCompletion(true);
  }, [activeProfile?.id, playVoice, sceneActions, sceneId, zoneId]);

  // --- Dev tuner: on-scene drag helpers (DEV only) ---------------------------
  const beginDebugDrag = (event, onMove) => {
    event.preventDefault();
    event.stopPropagation();
    const up = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const pctIn = (event, rect) => ({
    x: clampTune(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    y: clampTune(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
  });

  const startSymbolDrag = (event, wordId) => {
    if (!tunerDragActive) return;
    const artEl = event.currentTarget.parentElement;
    setDebugWordId(wordId);
    beginDebugDrag(event, (e) => {
      const p = pctIn(e, artEl.getBoundingClientRect());
      patchWordSymbolTune(wordId, { left: Number(p.x.toFixed(1)), top: Number(p.y.toFixed(1)) });
    });
  };

  const wheelSymbol = (event, wordId) => {
    if (!tunerDragActive) return;
    event.stopPropagation();
    const cur = (debugTune.wordSymbol[wordId] || debugTune.choiceSymbol).scale ?? 1;
    patchWordSymbolTune(wordId, { scale: Number(clampTune(cur - Math.sign(event.deltaY) * 0.05, 0.3, 2.5).toFixed(2)) });
  };

  const startPlacedDrag = (event, idx) => {
    if (!tunerDragActive || !paradeRef.current) return;
    const parade = paradeRef.current;
    setDebugPlacedIndex(idx);
    beginDebugDrag(event, (e) => {
      const p = pctIn(e, parade.getBoundingClientRect());
      updatePlacedTune(idx, 'left', Number(p.x.toFixed(1)));
      updatePlacedTune(idx, 'top', Number(p.y.toFixed(1)));
    });
  };

  const wheelPlaced = (event, idx) => {
    if (!tunerDragActive) return;
    const cur = debugTune.placed[idx]?.scale ?? 1;
    updatePlacedTune(idx, 'scale', Number(clampTune(cur - Math.sign(event.deltaY) * 0.05, 0.4, 3).toFixed(2)));
  };

  const startPanelDrag = (event) => {
    const ox = event.clientX - debugPanelPos.x;
    const oy = event.clientY - debugPanelPos.y;
    beginDebugDrag(event, (e) => {
      setDebugPanelPos({
        x: clampTune(e.clientX - ox, 0, window.innerWidth - 60),
        y: clampTune(e.clientY - oy, 0, window.innerHeight - 40),
      });
    });
  };

  const copyTuneJson = async () => {
    const payload = JSON.stringify(debugTune, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setDebugCopyStatus('Copied');
    } catch {
      window.prompt('Copy finale tune JSON', payload);
      setDebugCopyStatus('Shown');
    }
  };

  const renderDebugRange = (label, value, min, max, step, onChange) => (
    <label className="srf-debug-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <b>{value}</b>
    </label>
  );

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div
          ref={stageRef}
          className="srf-container"
          style={{ backgroundImage: `url(${riverBg})` }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ZoneBadgeButton variant="gameplay" zoneId="shloka-river" onBack={() => { stopAllVoice(); onNavigate?.('zone-welcome'); }} />
          {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={handleAudioToggle} /> */}
          <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />

          {phase === PHASES.INITIAL && (
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              onStart={handleStartGame}
              showButton={openingButtonVisible}
            />
          )}

          {(phase === PHASES.ARRANGE || phase === PHASES.SUCCESS) && (
            <div className="srf-arrange">
              <div className="srf-river-area srf-river-journey">
                {introTeaching && introSymbolIndex !== null && SHLOKA_WORDS[introSymbolIndex] && (
                  <div
                    key={`intro-${SHLOKA_WORDS[introSymbolIndex].id}`}
                    className="srf-intro-symbol"
                  >
                    <div className="srf-intro-symbol-glow" />
                    <img
                      src={SHLOKA_WORDS[introSymbolIndex].icon}
                      alt=""
                      className="srf-intro-symbol-img"
                      draggable="false"
                    />
                    <div className="srf-intro-ripple" />
                  </div>
                )}

                {phase === PHASES.SUCCESS && chantHighlightIndex !== null && SHLOKA_WORDS[chantHighlightIndex] && (
                  <div
                    key={`recap-${SHLOKA_WORDS[chantHighlightIndex].id}`}
                    className="srf-intro-symbol is-recap"
                  >
                    <div className="srf-intro-symbol-glow" />
                    <img
                      src={SHLOKA_WORDS[chantHighlightIndex].icon}
                      alt=""
                      className="srf-intro-symbol-img"
                      draggable="false"
                    />
                    <div className="srf-intro-ripple" />
                  </div>
                )}

                <div className="srf-boat-parade" ref={paradeRef}>
                  {(import.meta.env.DEV && debugShowAll
                    ? SHLOKA_WORDS.map((w) => w.id)
                    : slots
                  ).map((placedWordId, idx) => {
                    if (!placedWordId) return null;
                    const wordData = SHLOKA_WORDS.find((w) => w.id === placedWordId);
                    const isChanting = chantHighlightIndex === idx;
                    const isDebugSelected = import.meta.env.DEV && tunerDragActive && debugPlacedIndex === idx;
                    return (
                      <div
                        key={placedWordId}
                        className={`srf-journey-boat srf-journey-${idx} ${isChanting ? 'is-chanting' : ''}${allBoatsCelebrate ? ' is-all-celebrate' : ''}${isDebugSelected ? ' srf-debug-selected' : ''}`}
                        style={{ ...getPlacedBoatStyle(idx, wordData), ...(import.meta.env.DEV && tunerDragActive ? { cursor: 'grab', pointerEvents: 'auto' } : null) }}
                        onPointerDown={import.meta.env.DEV && tunerDragActive ? (e) => startPlacedDrag(e, idx) : undefined}
                        onWheel={import.meta.env.DEV && tunerDragActive ? (e) => wheelPlaced(e, idx) : undefined}
                      >
                        <div className="srf-boat-art">
                          <img src={neutralBoat} alt="" className="srf-neutral-boat" draggable="false" />
                          <img
                            src={wordData.icon}
                            alt=""
                            className={`srf-choice-symbol${import.meta.env.DEV && tunerDragActive ? ' srf-debug-draggable' : ''}`}
                            draggable="false"
                            onPointerDown={import.meta.env.DEV && tunerDragActive ? (e) => startSymbolDrag(e, wordData.id) : undefined}
                            onWheel={import.meta.env.DEV && tunerDragActive ? (e) => wheelSymbol(e, wordData.id) : undefined}
                          />
                        </div>
                        <span className="srf-completed-word">{wordData.label}</span>
                      </div>
                    );
                  })}

                  {phase === PHASES.ARRANGE && activeSlotIndex < SHLOKA_WORDS.length && (
                    <div
                      className={`srf-next-ripple srf-ripple-${activeSlotIndex}`}
                      data-index={activeSlotIndex}
                    >
                      <span className="srf-ripple-ring" />
                      <span className="srf-ripple-spark">✦</span>
                    </div>
                  )}
                </div>
              </div>

              {phase === PHASES.ARRANGE && buildReady && !introTeaching && (
                <div
                  className="srf-choice-boats"
                  style={{ '--srf-choice-bottom': `${debugTune.choiceBottom}%`, '--srf-choice-width': `${debugTune.choiceWidth}px` }}
                >
                    {choiceWords.map((w, choiceIdx) => {
                      const isTargetBoat = currentTargetWord?.id === w.id;
                      const hintClass = hintLevel >= 2 && isTargetBoat ? 'is-l3-target' : '';
                      return (
                        <button
                          type="button"
                          key={w.id}
                          className={`srf-choice-boat srf-choice-${choiceIdx} ${hintClass}${wrongWordId === w.id ? ' is-wrong-try' : ''}${sailingWordId === w.id ? ' is-sailing' : ''}`}
                          style={{ color: w.color, ...getSymbolStyle(w.id) }}
                          onClick={(event) => handleChoiceBoatTap(event, w)}
                          disabled={Boolean(sailingWordId)}
                          aria-label={`Choose ${w.label} boat`}
                        >
                          {SHOW_HIT_ZONES && (
                            <svg className="srf-choice-hit-outline" viewBox="0 0 100 100" aria-hidden="true">
                              <polygon points={CHOICE_BOAT_HIT_POLYGON.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')} />
                            </svg>
                          )}
                          <div className="srf-boat-art">
                            <img src={neutralBoat} alt="" className="srf-neutral-boat" draggable="false" />
                            <img
                              src={w.icon}
                              alt=""
                              className={`srf-choice-symbol${import.meta.env.DEV && tunerDragActive ? ' srf-debug-draggable' : ''}`}
                              draggable="false"
                              onPointerDown={import.meta.env.DEV && tunerDragActive ? (e) => startSymbolDrag(e, w.id) : undefined}
                              onWheel={import.meta.env.DEV && tunerDragActive ? (e) => wheelSymbol(e, w.id) : undefined}
                            />
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}

              {import.meta.env.DEV && phase === PHASES.ARRANGE && (
                <div
                  className={`srf-debug-panel${debugPanelOpen ? '' : ' is-collapsed'}`}
                  style={{ left: `${debugPanelPos.x}px`, top: `${debugPanelPos.y}px` }}
                >
                  <div
                    className="srf-debug-drag-handle"
                    onPointerDown={startPanelDrag}
                  >
                    <span>⠿ Finale boat tuner</span>
                    <button type="button" className="srf-debug-collapse" onClick={() => setDebugPanelOpen((v) => !v)}>
                      {debugPanelOpen ? '—' : '+'}
                    </button>
                  </div>

                  {debugPanelOpen && (
                    <>
                      <div className="srf-debug-split">
                        <label className="srf-debug-toggle-label">
                          <input type="checkbox" checked={debugDragOn} onChange={(e) => setDebugDragOn(e.target.checked)} />
                          drag-on-scene
                        </label>
                        <label className="srf-debug-toggle-label">
                          <input type="checkbox" checked={debugShowAll} onChange={(e) => setDebugShowAll(e.target.checked)} />
                          preview all 8 boats
                        </label>
                      </div>
                      <p className="srf-debug-note">
                        Drag a symbol on a choice/placed boat to set left/top. Scroll-wheel over a
                        symbol to scale it. Drag a placed boat itself to move its river position.
                      </p>

                      <div className="srf-debug-grid">
                        {renderDebugRange('row bottom', debugTune.choiceBottom, 2, 20, 1, (value) => updateDebugTune((prev) => ({ ...prev, choiceBottom: value })))}
                        {renderDebugRange('boat px', debugTune.choiceWidth, 120, 210, 1, (value) => updateDebugTune((prev) => ({ ...prev, choiceWidth: value })))}
                        {renderDebugRange('symbol left', debugTune.choiceSymbol.left, 45, 75, 1, (value) => updateChoiceSymbolTune('left', value))}
                        {renderDebugRange('symbol top', debugTune.choiceSymbol.top, 20, 50, 1, (value) => updateChoiceSymbolTune('top', value))}
                        {renderDebugRange('symbol width', debugTune.choiceSymbol.width, 16, 40, 1, (value) => updateChoiceSymbolTune('width', value))}
                        {renderDebugRange('symbol height', debugTune.choiceSymbol.height, 16, 44, 1, (value) => updateChoiceSymbolTune('height', value))}
                      </div>

                      <div className="srf-debug-split">
                        <label>
                          symbol
                          <select value={debugWordId} onChange={(event) => setDebugWordId(event.target.value)}>
                            {SHLOKA_WORDS.map((word) => (
                              <option key={word.id} value={word.id}>{word.label}</option>
                            ))}
                          </select>
                        </label>
                        <button type="button" onClick={() => resetWordSymbolTune(debugWordId)}>reset symbol</button>
                      </div>

                      <div className="srf-debug-grid">
                        {renderDebugRange('word left', selectedSymbolTune.left, 45, 75, 1, (value) => updateWordSymbolTune(debugWordId, 'left', value))}
                        {renderDebugRange('word top', selectedSymbolTune.top, 20, 50, 1, (value) => updateWordSymbolTune(debugWordId, 'top', value))}
                        {renderDebugRange('word scale', selectedSymbolTune.scale, 0.7, 1.35, 0.01, (value) => updateWordSymbolTune(debugWordId, 'scale', value))}
                      </div>

                      <div className="srf-debug-split">
                        <label>
                          placed boat
                          <select value={debugPlacedIndex} onChange={(event) => setDebugPlacedIndex(Number(event.target.value))}>
                            {SHLOKA_WORDS.map((word, index) => (
                              <option key={word.id} value={index}>{index + 1}. {word.label}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="srf-debug-grid">
                        {renderDebugRange('placed left', debugTune.placed[debugPlacedIndex].left, 20, 80, 1, (value) => updatePlacedTune(debugPlacedIndex, 'left', value))}
                        {renderDebugRange('placed top', debugTune.placed[debugPlacedIndex].top, 2, 92, 1, (value) => updatePlacedTune(debugPlacedIndex, 'top', value))}
                        {renderDebugRange('placed scale', debugTune.placed[debugPlacedIndex]?.scale ?? 1, 0.4, 3, 0.05, (value) => updatePlacedTune(debugPlacedIndex, 'scale', value))}
                      </div>

                      <div className="srf-debug-split">
                        <button type="button" onClick={copyTuneJson}>Copy Tune JSON</button>
                        {debugCopyStatus && <span className="srf-debug-copy-status">{debugCopyStatus}</span>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {draggingWord && dragPos && (
                <div
                  className="srf-drag-ghost"
                  style={{
                    left: `${dragPos.x}%`,
                    top: `${dragPos.y}%`,
                    color: draggingWord.color,
                  }}
                >
                  <BoatSvg />
                  <img src={draggingWord.icon} alt="" className="srf-boat-icon" />
                  <span className="srf-boat-label">{draggingWord.label}</span>
                </div>
              )}

              {missDrop && (
                <div
                  key={missDrop.key}
                  className="srf-drag-ghost srf-miss-drop"
                  style={{
                    left: `${missDrop.x}%`,
                    top: `${missDrop.y}%`,
                    color: missDrop.word.color,
                  }}
                  onAnimationEnd={() => setMissDrop(null)}
                >
                  <BoatSvg />
                  <img src={missDrop.word.icon} alt="" className="srf-boat-icon" />
                  <span className="srf-boat-label">{missDrop.word.label}</span>
                </div>
              )}
            </div>
          )}

          {showOrbsCelebration && (
            <>
              <ZoneCompletionFireworks
                show={true}
                burstsPerWave={5}
                particles={24}
                radius={140}
                duration={2600}
              />
              <RotatingOrbsEffect
                show={true}
                duration={7000}
                rotationDuration={7000}
                symbolImages={ORB_APP_IMAGES}
                ganeshaImage={OPENING_SCENE_GANESHA}
                playerName={profileName}
                showCentralGanesha={true}
                showBuiltInFireworks={false}
                onComplete={handleOrbsComplete}
              />
            </>
          )}

          <SceneCompletionCelebration
            show={showSceneCompletion}
            zoneId={zoneId}
            sceneName="Build the Shloka!"
            completionTitle="The Shloka River Is Complete!"
            completionSubtitle="Vakratunda Mahakaya Suryakoti Samaprabha · Nirvighnam Kurumedeva Sarvakaryeshu Sarvada"
            sceneNumber={5}
            totalScenes={5}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={[]}
            containerType="backpack"
            symbolImages={{}}
            sceneId={sceneId}
            completionData={{ stars: 8, completed: true }}
            onComplete={() => {
              onNavigate?.('zone-welcome');
              onComplete?.();
            }}
            childName={profileName}
            isFinalScene={true}
            onExploreZones={() => onNavigate?.('zones')}
            onHome={() => onNavigate?.('home')}
            onReplay={() => {
              setShowSceneCompletion(false);
              setShowOrbsCelebration(false);
              stopAllVoice();
              resetScene();
            }}
            onContinue={() => { stopAllVoice(); onNavigate?.('scene-complete-continue'); }}
          />

          <TocaBocaNav
            onHome={() => safeSetTimeout(() => {
              stopAllVoice();
              SimpleSceneManager.clearCurrentScene();
              onNavigate?.('home');
            }, 100)}
            onZonesClick={() => safeSetTimeout(() => {
              stopAllVoice();
              SimpleSceneManager.clearCurrentScene();
              onNavigate?.('zones');
            }, 100)}
            onStartFresh={() => {
              setShowSceneCompletion(false);
              setShowOrbsCelebration(false);
              stopAllVoice();
              resetScene();
            }}
            currentProgress={{ stars: sceneState.stars || 0, completed: sceneState.completed ? 1 : 0, total: 1 }}
            isAudioOn={isAudioOn}
            onAudioToggle={handleAudioToggle}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default ShlokaRiverFinale;
