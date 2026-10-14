import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
// zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx
// Ear listening game: one continuous scene. Elephant (thirsty) is active
// first while Cow (hungry) waits faded; after Elephant is solved, Cow
// becomes the focal animal. Same 3 listening zones serve both rounds.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { createSpeechStartWatcher } from '../../../../lib/utils/speechStartWatch';
import { logSceneEvent } from '../../../../lib/utils/sceneEventLog';
import './EarsSoundMatchGame.css';

// Reuse the shared scene-3 Symbol Mountain background across Eyes, Ears, and Tusk.
import bgImg from './assets/images/eyes-game/symbol_mountain_3_bg.webp';
import leafyBushImg from './assets/images/ears-game-v2/leafy_bush.webp';
import hiddenSpringImg from './assets/images/ears-game-v2/hidden_spring.webp';
import revealedSpringImg from './assets/images/ears-game-v2/revealed_spring.webp';
import hiddenGrassBushImg from './assets/images/ears-game-v2/hidden_grass_bush.webp';
import revealedGrassBushImg from './assets/images/ears-game-v2/revealed_grass_bush.webp';
import elephantThirstyImg from './assets/images/ears-game-v2/elephant_thirsty.webp';
import elephantDrinkingImg from './assets/images/ears-game-v2/elephant_drinking.webp';
import elephantHappyWaterImg from './assets/images/ears-game-v2/elephant_happy_water.webp';
import cowTiredImg from './assets/images/ears-game-v2/cow_tired.webp';
import cowHungryImg from './assets/images/ears-game-v2/cow_hungry.webp';
import cowEatingGrassImg from './assets/images/ears-game-v2/cow_eating_grass.webp';
import cowHappyChewingImg from './assets/images/ears-game-v2/cow_happy_chewing_new.png';
import soundWaterDrip from './assets/audio/ear_water_drip.wav';
import soundGrassRustle from './assets/audio/ear_grass_rustle.wav';
import soundBirdAmbient from './assets/audio/ear_bird_forest_ambient.wav';
import decoyWind from './assets/audio/dragon-studio-wind-gust-386158.mp3';
import decoyRustle from './assets/audio/dragon-studio-dry-grass-rustling-478361.mp3';
import { ANIMAL_POSITIONS } from './animalPositions';

const PHASE = {
  LISTENING: 'listening',
  CHOOSING: 'choosing',
  REVEALING: 'revealing',
  COMPLETE: 'complete'
};

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugEars'));
const SHOW_HIT_ZONES =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('hitzones');
const LAYOUT_STORAGE_KEY = 'symbol_mountain_ears_layout_v2';
const LAYOUT_PRESET_VERSION = '2026-09-10-ears-visual-flow-editor-layout';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52 },
  feedback: { x: 50, y: 84, w: 42 },
  tray: { x: 50, y: 93, w: 18 },
  // Positions ported from Madhurima's Visual Flow Editor layout (tagged
  // items). Cow's position varies noticeably across its 3 poses in the
  // editor (tired/eating/happy) but this game only supports one fixed spot
  // per sprite (poses swap in place, not travel) — used the eating-grass
  // spot as the representative middle-ground; flag if it needs adjusting.
  leftBush: { x: 23.08, y: 46.99, w: 24, z: 16 },
  centerRock: { x: 50, y: 47.75, w: 24, z: 16 },
  rightSource: { x: 79.32, y: 52.19, w: 24, z: 16 },
  leftBushHit: { x: 23.08, y: 46.99, w: 24, h: 21.75, z: 35 },
  centerRockHit: { x: 50.52, y: 48.83, w: 24, h: 16.5, z: 35 },
  rightSourceHit: { x: 80.31, y: 52.77, w: 23.5, h: 19.5, z: 33 },
  // Hierarchy tune: elephant -12.5% (24 -> 21), nudged left/down; cow keeps its
  // size and moves 3% right for separation. Sprites are non-interactive (taps
  // go to the *Hit zones above), so shrinking them doesn't affect touch targets.
  elephantSprite: { x: 28.5, y: 75, w: 21, z: 20 },
  cowSprite: { x: 60.5, y: 68.5, w: 18.75, z: 20 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'leftBush', label: 'Zone - left bush' },
  { key: 'centerRock', label: 'Zone - center rock' },
  { key: 'rightSource', label: 'Zone - right water/grass' },
  { key: 'leftBushHit', label: 'Hit-zone - left bush' },
  { key: 'centerRockHit', label: 'Hit-zone - center rock' },
  { key: 'rightSourceHit', label: 'Hit-zone - right water/grass' },
  { key: 'elephantSprite', label: 'Elephant' },
  { key: 'cowSprite', label: 'Cow' }
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
  ...(layoutItem.h ? { height: `${layoutItem.h}%` } : {}),
  zIndex: layoutItem.z
});

const isPointerInsideSourceOval = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  const nx = (event.clientX - rect.left) / rect.width;
  const ny = (event.clientY - rect.top) / rect.height;
  const dx = (nx - 0.5) / 0.5;
  const dy = (ny - 0.5) / 0.5;
  return (dx * dx) + (dy * dy) <= 1;
};

// Left stays a plain decorative bush throughout — no hidden/revealed swap.
// Center and right swap from a hidden to a revealed source once that
// round's animal is solved, per Madhurima's Visual Flow Editor design.
const ZONES = {
  left: { id: 'left', label: 'Bush', img: leafyBushImg, layoutKey: 'leftBush', hitLayoutKey: 'leftBushHit' },
  center: { id: 'center', label: 'Spring', hiddenImg: hiddenSpringImg, revealedImg: revealedSpringImg, layoutKey: 'centerRock', hitLayoutKey: 'centerRockHit' },
  right: { id: 'right', label: 'Grass', hiddenImg: hiddenGrassBushImg, revealedImg: revealedGrassBushImg, layoutKey: 'rightSource', hitLayoutKey: 'rightSourceHit' }
};

const ROUNDS = [
  {
    id: 'elephant',
    label: 'Elephant',
    prompt: 'Elephant is thirsty. Listen for water.',
    choosePrompt: 'Where did you hear the water?',
    // L2 — semantic clue, replays this sound alone, no location reveal.
    hintClue: 'Listen for the water drip.',
    targetZoneId: 'center',
    sounds: {
      left: decoyRustle,
      center: soundWaterDrip,
      right: soundBirdAmbient
    },
    idleImg: elephantThirstyImg,
    revealFrames: [elephantDrinkingImg, elephantHappyWaterImg]
  },
  {
    id: 'cow',
    label: 'Cow',
    prompt: 'Cow is hungry. Listen for the grass.',
    choosePrompt: 'Where did you hear the grass?',
    hintClue: 'Listen for the grass rustle.',
    targetZoneId: 'right',
    sounds: {
      left: decoyWind,
      center: soundBirdAmbient,
      right: soundGrassRustle
    },
    idleImg: cowHungryImg,
    revealFrames: [cowEatingGrassImg, cowHappyChewingImg]
  }
];

const VO_TEXTS = {
  // A wrong choice isn't "good listening" — minimal, non-punitive.
  neutral: 'Listen again.',
  complete: 'You listened carefully and found the sounds.',
  elephant: 'Elephant found water.',
  cow: 'Cow found grass.'
};

const BETWEEN_SOUND_MS = 560;
const INTRO_DELAY_MS = 700;
// Slower reveal pacing — kids need time to actually see each pose before it
// swaps to the next, and a real pause before the next round begins.
const REVEAL_FRAME_MS = 950;
const NEXT_ROUND_DELAY_MS = 2000;
const HINT_REPLAY_MS = 10000;
const HINT_TEXT_MS = 18000;
const HINT_TARGET_MS = 26000;
// Repeated wrong choices accelerate help instead of resetting the clock.
const WRONG_COUNT_FOR_L2 = 2;
const WRONG_COUNT_FOR_L3 = 3;
const SUCCESS_LINE_MIN_MS = 1500;
const SCENE_LOG_KEY = 'symbol-mountain-ears';

const POSE_ASSETS = [bgImg, leafyBushImg, hiddenSpringImg, revealedSpringImg, hiddenGrassBushImg, revealedGrassBushImg, elephantThirstyImg, elephantDrinkingImg, elephantHappyWaterImg, cowTiredImg, cowHungryImg, cowEatingGrassImg, cowHappyChewingImg];

const EarsSoundMatchGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  onAnimalPositionsChange,
  hideElements = false,
  className = '',
  stopVoice,
  onLineSpoken,
  isPaused = false,
  initialRound = 0,
  onRoundComplete,
  initialSuccessDone = 0,
  onSuccessDone
}) => {
  const lineSpokenRef = useRef(onLineSpoken);
  lineSpokenRef.current = onLineSpoken;
  // Continue: rounds already solved in an earlier visit (0 = none, 1 = Elephant done).
  // A round left half-played restarts from its own beginning.
  const startRoundRef = useRef(Math.max(0, Math.min(ROUNDS.length, Number(initialRound) || 0)));
  const onRoundCompleteRef = useRef(onRoundComplete);
  onRoundCompleteRef.current = onRoundComplete;
  // How many rounds' success lines had FINISHED before the child left: those are not replayed.
  const startSuccessRef = useRef(Math.max(0, Math.min(ROUNDS.length, Number(initialSuccessDone) || 0)));
  const onSuccessDoneRef = useRef(onSuccessDone);
  onSuccessDoneRef.current = onSuccessDone;
  usePreloadPoses(POSE_ASSETS);
  const [roundIndex, setRoundIndex] = useState(Math.min(startRoundRef.current, ROUNDS.length - 1));
  const [phase, setPhase] = useState(PHASE.LISTENING);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [completedRounds, setCompletedRounds] = useState(() => ROUNDS.slice(0, startRoundRef.current).map((r) => r.id));
  const [wrongZoneId, setWrongZoneId] = useState(null);
  const [correctZoneId, setCorrectZoneId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [revealFrameByAnimal, setRevealFrameByAnimal] = useState({});
  const [hintZoneId, setHintZoneId] = useState(null);
  const [zonesHidden, setZonesHidden] = useState(false);
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('leftBush');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const audioRef = useRef(null);
  const timersRef = useRef([]);
  const runIdRef = useRef(0);
  // False once the game unmounts (StrictMode's mount/cleanup/mount sets it true again). A line
  // cancelled by leaving the scene still fires its end callback; it must not advance the game
  // or save a "success line finished" marker.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);
  const chooseStartedAtRef = useRef(Date.now());
  const hintStageRef = useRef(0);
  // When the L2 clue + sound finished — L3's 8s gap counts from THIS, not
  // from chooseStartedAtRef, so a slow L2 clue doesn't eat into the real
  // gap the child gets before L3 fires.
  const l2FinishedAtRef = useRef(null);
  const wrongCountRef = useRef(0);
  const completedRef = useRef(false);
  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  // Sidebar = true pause: timers freeze (resume with remaining time) and the current
  // line / animal sound is interrupted + replayed — see the isPaused effect below.
  const { after, cancel: cancelTimer } = usePausableTimers(isPaused);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;
  const activeAudioRef = useRef(null);       // { start, onEnd, dead }
  const interruptedAudioRef = useRef(null);
  const sidebarReplayRef = useRef(null);
  const pendingSidebarEntryRef = useRef(null);
  const wasPausedRef = useRef(false);
  const hintHoldRef = useRef(false);
  const speechWatcherRef = useRef(null);
  if (!speechWatcherRef.current) {
    speechWatcherRef.current = createSpeechStartWatcher({
      speechSynthesis: typeof window !== 'undefined' ? window.speechSynthesis : null,
      onDropBeforeStart: ({ attempt }) => logSceneEvent(SCENE_LOG_KEY, 'speak:dropped-before-start', { attempt }),
    });
  }
  const speechTokenRef = useRef(0);
  const speakingTextRef = useRef(null);

  const round = ROUNDS[roundIndex];
  const completedIds = useMemo(() => new Set(completedRounds), [completedRounds]);
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];
  const selectedDebugFields = selectedDebugKey.endsWith('Hit')
    ? ['x', 'y', 'w', 'h', 'z']
    : ['x', 'y', 'w', 'z'];

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => cancelTimer(timer));
    timersRef.current = [];
  }, [cancelTimer]);

  const schedule = useCallback((fn, delay) => {
    const timer = after(delay, () => {
      timersRef.current = timersRef.current.filter((item) => item !== timer);
      fn();
    });
    timersRef.current.push(timer);
    return timer;
  }, [after]);

  // Every spoken line and animal sound runs through track() so this component owns
  // its completion callback: a clip stopped by the sidebar is marked dead (a
  // cancel-triggered end can never advance the game) and is replayed on close.
  const track = useCallback((start, onEnd) => {
    const entry = { start, onEnd, dead: false };
    // Requested while the sidebar is open: queue it, play it (from the start) on close.
    if (pausedRef.current) {
      interruptedAudioRef.current = entry;
      return;
    }
    const done = (result) => {
      if (entry.dead) return;
      if (!aliveRef.current) { entry.dead = true; return; }
      if (pausedRef.current) {
        entry.dead = true;
        interruptedAudioRef.current = entry;
        return;
      }
      entry.dead = true;
      if (activeAudioRef.current === entry) activeAudioRef.current = null;
      onEnd?.(result);
    };
    activeAudioRef.current = entry;
    start(done);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // Audio cleanup is best-effort.
      }
      audioRef.current = null;
    }
    speechWatcherRef.current?.cancelPending({ cancelSpeech: false });
    speakingTextRef.current = null;
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Direct speechSynthesis use (bypasses the scene's useVoiceGuidance hook). Tab-hide and the
  // sidebar both interrupt/replay through track() — see interruptActiveAudio below.
  const speak = useCallback((text, onEnd, options = {}) => {
    // Tell the scene which line is current so its Replay button repeats this game's line.
    if (text) lineSpokenRef.current?.(text);
    const priority = options.priority || 'normal';
    const label = options.label || text;

    const runFollowUp = (result = {}) => {
      onEnd?.(result);
    };

    if (priority === 'hint' && activeAudioRef.current && !activeAudioRef.current.dead) {
      const active = activeAudioRef.current;
      const originalOnEnd = active.onEnd;
      active.onEnd = (result) => {
        originalOnEnd?.(result);
        runFollowUp({ skipped: true, waitedForCurrent: true });
      };
      logSceneEvent(SCENE_LOG_KEY, 'speak:hint-waited-and-skipped', { label });
      return;
    }

    if (!isAudioOn) {
      logSceneEvent(SCENE_LOG_KEY, 'speak:muted', { label });
      runFollowUp({ finished: true, muted: true, elapsedMs: 0 });
      return;
    }
    // Stop the parent scene's own voice engine first — its MP3 audio element
    // is not touched by raw speechSynthesis.cancel(), so without this a
    // still-playing scene VO keeps going under this mini-game's line.
    track((done) => {
      stopVoice?.();
      if (!text || typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
        done({ finished: true, unsupported: true, elapsedMs: 0 });
        return;
      }
      const token = ++speechTokenRef.current;
      let startedAt = 0;
      logSceneEvent(SCENE_LOG_KEY, 'speak:request', { label, priority });
      try {
        window.speechSynthesis.cancel();
        const utterance = speechWatcherRef.current.speak({
          isStillCurrent: () => speechTokenRef.current === token && aliveRef.current,
          buildUtterance: (attempt) => {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.92;
            u.pitch = 1;
            u.onstart = () => {
              startedAt = Date.now();
              speakingTextRef.current = text;
              logSceneEvent(SCENE_LOG_KEY, 'speak:start', { label, attempt });
            };
            u.onend = () => {
              if (speechTokenRef.current !== token || !aliveRef.current) {
                logSceneEvent(SCENE_LOG_KEY, 'speak:stale-end', { label });
                return;
              }
              if (speakingTextRef.current === text) speakingTextRef.current = null;
              const elapsedMs = startedAt ? Date.now() - startedAt : 0;
              logSceneEvent(SCENE_LOG_KEY, 'speak:end', { label, elapsedMs });
              done({ finished: true, elapsedMs });
            };
            u.onerror = (e) => {
              const error = e?.error || 'unknown';
              if (speechTokenRef.current !== token || !aliveRef.current) {
                logSceneEvent(SCENE_LOG_KEY, 'speak:stale-error', { label, error });
                return;
              }
              if (speakingTextRef.current === text) speakingTextRef.current = null;
              const elapsedMs = startedAt ? Date.now() - startedAt : 0;
              if (error === 'canceled' || error === 'interrupted') {
                logSceneEvent(SCENE_LOG_KEY, 'speak:cancel', { label, error, elapsedMs });
                return;
              }
              logSceneEvent(SCENE_LOG_KEY, 'speak:error', { label, error, elapsedMs });
              done({ finished: elapsedMs >= SUCCESS_LINE_MIN_MS, error, elapsedMs });
            };
            return u;
          },
        });
        if (!utterance) done({ finished: true, unsupported: true, elapsedMs: 0 });
      } catch (error) {
        logSceneEvent(SCENE_LOG_KEY, 'speak:exception', { label, error: String(error) });
        done({ finished: true, error: String(error), elapsedMs: 0 });
      }
    }, onEnd);
  }, [isAudioOn, stopVoice, track]);

  const markSuccessDoneIfFinished = useCallback((lineResult, doneCount) => {
    if (!aliveRef.current) return;
    if (!lineResult?.finished || (lineResult.elapsedMs || 0) < SUCCESS_LINE_MIN_MS) {
      logSceneEvent(SCENE_LOG_KEY, 'success:not-marked-done', {
        doneCount,
        elapsedMs: lineResult?.elapsedMs || 0,
        finished: Boolean(lineResult?.finished),
      });
      return;
    }
    logSceneEvent(SCENE_LOG_KEY, 'success:marked-done', { doneCount, elapsedMs: lineResult.elapsedMs });
    onSuccessDoneRef.current?.(doneCount);
  }, []);

  // Shared by sidebar-open and tab-hide: kill the current clip WITHOUT firing its callback
  // (a cancel-triggered end must never advance the game), hold the hint ladder, and remember
  // the clip — with its original callback — so it can be replayed from the start.
  const interruptActiveAudio = useCallback(() => {
    hintHoldRef.current = true;
    const active = activeAudioRef.current;
    if (active && !active.dead) {
      active.dead = true;
      interruptedAudioRef.current = active;
    }
    activeAudioRef.current = null;
    if (sidebarReplayRef.current) {
      clearTimeout(sidebarReplayRef.current);
      sidebarReplayRef.current = null;
      // Reopened inside the settle window: the clip waiting to replay goes back to
      // "interrupted", or its callback never fires and the hint hold is never released.
      if (pendingSidebarEntryRef.current && !interruptedAudioRef.current) {
        interruptedAudioRef.current = pendingSidebarEntryRef.current;
      }
      pendingSidebarEntryRef.current = null;
    }
    stopAudio();
  }, [stopAudio]);

  // Replay the interrupted clip from the start after `settleMs` (its callback fires then, so the
  // round continues), then start a fresh 10/18/26 hint clock.
  const resumeInterruptedAudio = useCallback((settleMs) => {
    const entry = interruptedAudioRef.current;
    interruptedAudioRef.current = null;
    const rearm = () => {
      chooseStartedAtRef.current = Date.now();
      hintStageRef.current = 0;
      l2FinishedAtRef.current = null;
      setHintZoneId(null);
      hintHoldRef.current = false;
    };
    pendingSidebarEntryRef.current = entry;
    sidebarReplayRef.current = setTimeout(() => {
      sidebarReplayRef.current = null;
      pendingSidebarEntryRef.current = null;
      if (entry) {
        track(entry.start, () => { entry.onEnd?.(); rearm(); });
      } else {
        rearm();
      }
    }, settleMs);
  }, [track]);

  // Tab hidden = same as the sidebar: interrupt, then replay with its callback on return.
  // (The sidebar owns the pause while it is open, so tab events are ignored then.)
  useAppVisibility(
    useCallback(() => {
      if (pausedRef.current) return;
      interruptActiveAudio();
    }, [interruptActiveAudio]),
    useCallback(() => {
      if (pausedRef.current) return;
      resumeInterruptedAudio(2000);
    }, [resumeInterruptedAudio])
  );

  useEffect(() => () => {
    if (sidebarReplayRef.current) clearTimeout(sidebarReplayRef.current);
    sidebarReplayRef.current = null;
  }, []);

  const playSound = useCallback((src, fallbackText = '', onDone = null, volume = 0.72) => {
    track((soundDone) => {
      stopAudio();

      const finish = (() => {
        let done = false;
        return () => {
          if (done) return;
          done = true;
          audioRef.current = null;
          soundDone();
        };
      })();

      // The game's own sounds (water drip, rustle, birds, decoys) ARE the question, so they play
      // whether or not voice is muted. Only the spoken fallback line follows the voice mute.
      if (!src) {
        if (fallbackText && isAudioOn) speak(fallbackText, null, { label: `fallback:${fallbackText}` });
        schedule(finish, 850);
        return;
      }

      try {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.onended = finish;
        audio.onerror = finish;
        audio.play().catch(finish);
        audioRef.current = audio;
      } catch {
        finish();
      }
    }, onDone);
  }, [isAudioOn, schedule, speak, stopAudio, track]);

  // Sidebar open = true pause: kill the current clip WITHOUT firing its callback and hold
  // the hint ladder. On close: after a beat, replay the interrupted clip from the start
  // (its callback fires then, so the round continues), and only then start a fresh
  // 10/18/26 clock.
  useEffect(() => {
    if (isPaused) {
      if (!wasPausedRef.current) interruptActiveAudio();
    } else if (wasPausedRef.current) {
      resumeInterruptedAudio(400);
    }
    wasPausedRef.current = isPaused;
  }, [isPaused, interruptActiveAudio, resumeInterruptedAudio]);

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
      window.prompt?.('Copy Ear layout JSON', payload);
      setLayoutCopyStatus('Shown');
    }
    if (import.meta.env.DEV) console.log('Ear layout JSON:', payload);
    schedule(() => setLayoutCopyStatus(''), 1500);
  }, [layout, schedule]);

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

  const playSequence = useCallback((targetRound, afterSequence = null) => {
    if (!isActive || !targetRound) return;
    runIdRef.current += 1;
    const runId = runIdRef.current;
    clearTimers();
    stopAudio();
    setPhase(PHASE.LISTENING);
    setHintZoneId(null);
    setWrongZoneId(null);

    const zoneIds = ['left', 'center', 'right'];
    let index = 0;
    const playNext = () => {
      if (runId !== runIdRef.current) return;
      if (index >= zoneIds.length) {
        setActiveZoneId(null);
        setPhase(PHASE.CHOOSING);
        hintStageRef.current = 0;
        l2FinishedAtRef.current = null;
        wrongCountRef.current = 0;
        // The 10s choosing clock must start only once the round-specific
        // choice prompt finishes, not while it's still speaking. Until
        // then it is null (the hint tick ignores it) — a stale timestamp from
        // the previous round/mount used to make the clue fire the instant this
        // line began, skipping the replay-all step.
        chooseStartedAtRef.current = null;
        const armChooseClock = () => {
          if (runId !== runIdRef.current || chooseStartedAtRef.current) return;
          chooseStartedAtRef.current = Date.now();
        };
        speak(targetRound.choosePrompt, armChooseClock);
        // Speech "ended" events are not always delivered — arm anyway.
        schedule(armChooseClock, 5000);
        afterSequence?.();
        return;
      }

      const zoneId = zoneIds[index];
      setActiveZoneId(zoneId);
      playSound(targetRound.sounds[zoneId], '', () => {
        if (runId !== runIdRef.current) return;
        setActiveZoneId(null);
        index += 1;
        schedule(playNext, BETWEEN_SOUND_MS);
      }, zoneId === targetRound.targetZoneId ? 0.68 : 0.42);
    };

    // Round goal is spoken before the three sources play — a non-reading
    // child needs to hear "Listen for the water" before the sounds start,
    // not just see it as on-screen text.
    speak(targetRound.prompt, () => {
      if (runId !== runIdRef.current) return;
      schedule(playNext, 240);
    });
  }, [clearTimers, isActive, playSound, schedule, speak, stopAudio]);

  const resetGame = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
    completedRef.current = false;
    setRoundIndex(Math.min(startRoundRef.current, ROUNDS.length - 1));
    setPhase(PHASE.LISTENING);
    setActiveZoneId(null);
    setCompletedRounds(ROUNDS.slice(0, startRoundRef.current).map((r) => r.id));
    setWrongZoneId(null);
    setFeedback('');
    setRevealFrameByAnimal({});
    setHintZoneId(null);
    setZonesHidden(false);
    chooseStartedAtRef.current = Date.now();
    hintStageRef.current = 0;
    l2FinishedAtRef.current = null;
    wrongCountRef.current = 0;
  }, [clearTimers, stopAudio]);

  // Guard against the intro (reset + opening VO + round-1 sequence) firing
  // more than once for a single real mount — without this, any double
  // invocation of this effect (e.g. React 18 dev double-invoke, or a parent
  // remount) plays the intro VO and round-1 zone sounds twice, overlapping.
  const introStartedRef = useRef(false);
  useEffect(() => {
    if (!isActive || introStartedRef.current) return undefined;
    if (startRoundRef.current > 0) {
      // Continue after an earlier round was solved: skip the intro, start that round fresh.
      // A plain timer, with the started-flag set when it FIRES: in dev, React StrictMode runs
      // mount -> cleanup -> mount, and a game timer scheduled up front is cancelled by that
      // cleanup while the flag stops the second run from scheduling again (frozen, silent game).
      // The short wait also avoids speaking at the first instant after the scene restores.
      const resumeTimer = setTimeout(() => {
        if (introStartedRef.current) return;
        introStartedRef.current = true;
        resetGame();
        const previousSuccessFinished = startSuccessRef.current >= startRoundRef.current;
        if (startRoundRef.current >= ROUNDS.length) {
          // Every round was already solved (left during the last reveal): run the normal ending,
          // replaying the last success line only if it had not finished.
          startReveal(ROUNDS[ROUNDS.length - 1], { skipSuccess: previousSuccessFinished });
        } else if (previousSuccessFinished) {
          // The previous round's success line had finished: go straight to this round.
          playSequence(ROUNDS[startRoundRef.current]);
        } else {
          // Cut off during the success line: replay it, then start this round fresh.
          speak(VO_TEXTS[ROUNDS[startRoundRef.current - 1].id], (lineResult) => {
            markSuccessDoneIfFinished(lineResult, startRoundRef.current);
            schedule(() => playSequence(ROUNDS[startRoundRef.current]), 600);
          }, { label: `resume-success:${ROUNDS[startRoundRef.current - 1].id}` });
        }
      }, 500);
      return () => clearTimeout(resumeTimer);
    }
    // Fresh start: same rule as the resume branch - set the flag when the timer FIRES, not up front.
    // Setting it first meant StrictMode's mount -> cleanup -> mount cancelled the scheduled intro and
    // the flag then stopped it being scheduled again (silent, frozen game).
    const startTimer = setTimeout(() => {
      if (introStartedRef.current) return;
      introStartedRef.current = true;
      resetGame();
      schedule(() => playSequence(ROUNDS[0]), INTRO_DELAY_MS);
    }, 0);
    return () => clearTimeout(startTimer);
  }, [isActive, markSuccessDoneIfFinished, playSequence, resetGame, schedule, speak]);

  // L1: replay all three sources once (memory aid, no VO, no reveal) — a
  // dedicated replay, not a full round restart (no prompt VO, no phase
  // change, doesn't touch the choosing clock).
  const playHintReplayAll = useCallback((targetRound) => {
    if (!isActive || !targetRound) return;
    const runId = runIdRef.current;
    const zoneIds = ['left', 'center', 'right'];
    let index = 0;
    const playNext = () => {
      if (runId !== runIdRef.current || index >= zoneIds.length) {
        if (runId === runIdRef.current) setActiveZoneId(null);
        return;
      }
      const zoneId = zoneIds[index];
      setActiveZoneId(zoneId);
      playSound(targetRound.sounds[zoneId], '', () => {
        if (runId !== runIdRef.current) return;
        setActiveZoneId(null);
        index += 1;
        schedule(playNext, BETWEEN_SOUND_MS);
      }, zoneId === targetRound.targetZoneId ? 0.68 : 0.42);
    };
    playNext();
  }, [isActive, playSound, schedule]);

  // L3 — exact source revealed and its sound replayed once, no spoken line.
  // This is the final rescue: no loop back into another full round, the cue
  // stays up until the child responds.
  const triggerHintL3 = useCallback((targetRound) => {
    if (hintStageRef.current >= 3) return;
    hintStageRef.current = 3;
    setHintZoneId(targetRound.targetZoneId);
    playSound(targetRound.sounds[targetRound.targetZoneId], '', null, 0.68);
  }, [playSound]);

  // L2 — semantic clue + the target sound alone, no location reveal.
  const triggerHintL2 = useCallback((targetRound) => {
    if (hintStageRef.current >= 2) return;
    hintStageRef.current = 2;
    const runId = runIdRef.current;
    speak(targetRound.hintClue, () => {
      playSound(targetRound.sounds[targetRound.targetZoneId], '', () => {
        l2FinishedAtRef.current = Date.now();
      }, 0.68);
    }, { priority: 'hint', label: `hint:${targetRound.id}` });
    // L3 is gated on L2 "finishing". If the browser never delivers the speech "ended" event the
    // chain above never completes and L3 would never come — so stamp it after a generous limit
    // (the clue line plus the target sound), only if this is still the same round at stage 2.
    after(Math.max(9000, targetRound.hintClue.length * 90 + 6000), () => {
      if (runId === runIdRef.current && hintStageRef.current === 2 && !l2FinishedAtRef.current) {
        l2FinishedAtRef.current = Date.now();
      }
    });
  }, [after, playSound, speak]);

  useEffect(() => {
    if (!isActive || phase !== PHASE.CHOOSING || !round) return;

    const tick = () => {
      if (pausedRef.current || hintHoldRef.current) return;
      if (!chooseStartedAtRef.current) return;
      const waitingMs = Date.now() - chooseStartedAtRef.current;

      // L3 is an 8s gap AFTER the L2 clue + sound finish, not a fixed
      // 26s-from-arm mark — so it never overlaps or cuts off L2's own line.
      if (
        waitingMs >= HINT_TARGET_MS && hintStageRef.current < 3 &&
        l2FinishedAtRef.current && (Date.now() - l2FinishedAtRef.current) >= (HINT_TARGET_MS - HINT_TEXT_MS)
      ) {
        triggerHintL3(round);
        return;
      }
      if (waitingMs >= HINT_TEXT_MS && hintStageRef.current < 2) {
        triggerHintL2(round);
        return;
      }
      // L1 — replay all three sources once, no VO, no reveal.
      if (waitingMs >= HINT_REPLAY_MS && hintStageRef.current < 1) {
        hintStageRef.current = 1;
        playHintReplayAll(round);
      }
    };

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isActive, phase, playHintReplayAll, round, triggerHintL2, triggerHintL3]);

  useEffect(() => () => {
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
  }, [clearTimers, stopAudio]);

  const startReveal = useCallback((animalRound, options = {}) => {
    if (!animalRound) return;
    runIdRef.current += 1;
    clearTimers();
    stopAudio();
    setPhase(PHASE.REVEALING);
    setActiveZoneId(null);
    setHintZoneId(null);
    setWrongZoneId(null);
    // A correct tap used to just sit there silently while the reveal played
    // out elsewhere — nothing acknowledged the zone the child actually got
    // right, which read as an abrupt jump straight to the animal's reveal.
    setCorrectZoneId(animalRound.targetZoneId);
    schedule(() => setCorrectZoneId(null), 1400);
    setRevealFrameByAnimal((prev) => ({ ...prev, [animalRound.id]: 0 }));
    // Report when the success line has finished, so Continue only replays it if it was cut off.
    if (!options.skipSuccess) {
      speak(VO_TEXTS[animalRound.id], (lineResult) => {
        markSuccessDoneIfFinished(lineResult, ROUNDS.indexOf(animalRound) + 1);
      }, { label: `success:${animalRound.id}` });
    }

    let frame = 0;
    const advanceFrame = () => {
      frame += 1;
      setRevealFrameByAnimal((prev) => ({
        ...prev,
        [animalRound.id]: Math.min(frame, animalRound.revealFrames.length - 1)
      }));
      if (frame < animalRound.revealFrames.length - 1) {
        schedule(advanceFrame, REVEAL_FRAME_MS);
      }
    };

    schedule(advanceFrame, REVEAL_FRAME_MS);
    schedule(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex >= ROUNDS.length) {
        setPhase(PHASE.COMPLETE);
        // Let the listening zones fade, then remove them so the payoff is
        // just the two resolved, happy animals — no leftover clutter.
        schedule(() => setZonesHidden(true), 700);

        const positions = {
          elephant: ANIMAL_POSITIONS.elephant,
          cow: ANIMAL_POSITIONS.cow
        };
        onAnimalPositionsChange?.(positions);

        // Wait for the completion line to actually finish before handing off.
        // (~3.3s) to actually finish before handing off — the old fixed
        // COMPLETE_DELAY_MS (1900ms) was cutting it off mid-sentence.
        speak(VO_TEXTS.complete, () => {
          schedule(() => {
            if (completedRef.current) return;
            completedRef.current = true;
            onGameComplete?.({
              matchedAnimals: ROUNDS.map((item) => item.id),
              totalMatched: ROUNDS.length,
              animalPositions: positions
            });
          }, 900);
        });
        return;
      }

      setRoundIndex(nextIndex);
      playSequence(ROUNDS[nextIndex]);
    }, (animalRound.revealFrames.length * REVEAL_FRAME_MS) + NEXT_ROUND_DELAY_MS);
  }, [clearTimers, markSuccessDoneIfFinished, onAnimalPositionsChange, onGameComplete, playSequence, roundIndex, schedule, speak, stopAudio]);

  const handleZoneTap = useCallback((zoneId, e) => {
    e.stopPropagation();
    if (debugMode || !round || phase !== PHASE.CHOOSING) return;

    if (zoneId !== round.targetZoneId) {
      setWrongZoneId(zoneId);
      schedule(() => setWrongZoneId(null), 520);

      // A wrong choice is exploration, not a mistake to punish — help
      // escalates with repeated wrong choices and never resets the choosing
      // clock: 1st = "Listen again." + all three sounds (no answer given),
      // 2nd = clue + target sound, 3rd = exact source glows (no voice).
      wrongCountRef.current += 1;
      if (wrongCountRef.current >= WRONG_COUNT_FOR_L3) {
        triggerHintL3(round);
      } else if (wrongCountRef.current >= WRONG_COUNT_FOR_L2) {
        triggerHintL2(round);
      } else {
        speak(VO_TEXTS.neutral, () => playHintReplayAll(round));
      }
      return;
    }

    setCompletedRounds((prev) => [...prev, round.id]);
    // Save the moment the child gets it right (not when the reveal finishes) so Continue never
    // repeats a solved round; it replays this round's success line and moves on.
    onRoundCompleteRef.current?.(roundIndex + 1);
    startReveal(round);
  }, [debugMode, phase, playHintReplayAll, round, roundIndex, schedule, speak, startReveal, triggerHintL2, triggerHintL3]);

  const handleSourceTap = useCallback((zoneId, e) => {
    if (!isPointerInsideSourceOval(e)) {
      e.stopPropagation();
      return;
    }
    handleZoneTap(zoneId, e);
  }, [handleZoneTap]);

  if (hideElements || !isActive) return null;

  const elephantSolved = completedIds.has('elephant');
  const cowSolved = completedIds.has('cow');
  const cowIsFocal = round?.id === 'cow' || cowSolved;

  const elephantFrame = elephantSolved
    ? ROUNDS[0].revealFrames[revealFrameByAnimal.elephant ?? ROUNDS[0].revealFrames.length - 1]
    : ROUNDS[0].idleImg;
  const elephantOpacityClass = elephantSolved && cowIsFocal ? 'ears-sprite-softened' : 'ears-sprite-active';

  const cowFrame = cowSolved
    ? ROUNDS[1].revealFrames[revealFrameByAnimal.cow ?? ROUNDS[1].revealFrames.length - 1]
    : cowIsFocal
      ? ROUNDS[1].idleImg
      : cowTiredImg;
  const cowOpacityClass = cowSolved || cowIsFocal ? 'ears-sprite-active' : 'ears-sprite-waiting';

  return (
    <div
      ref={stageRef}
      className={`ears-sound-game ${className} ${debugMode ? 'is-debugging' : ''} ${isPaused ? 'is-paused' : ''}`}
      onPointerMove={handleDebugPointerMove}
      onPointerUp={stopDebugDrag}
      onPointerLeave={stopDebugDrag}
    >
      <img className="ears-game-bg" src={bgImg} alt="" draggable={false} />

      <PoseImage
        className={`ears-story-sprite ${elephantOpacityClass} ${debugMode && selectedDebugKey === 'elephantSprite' ? 'is-debug-selected' : ''}`}
        src={elephantFrame}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.elephantSprite)}
        onPointerDown={(e) => startDebugDrag(e, 'elephantSprite')}
      />
      <PoseImage
        className={`ears-story-sprite ${cowOpacityClass} ${debugMode && selectedDebugKey === 'cowSprite' ? 'is-debug-selected' : ''}`}
        src={cowFrame}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.cowSprite)}
        onPointerDown={(e) => startDebugDrag(e, 'cowSprite')}
      />


      {!zonesHidden && Object.values(ZONES).map((zone, index) => {
        const isPlaying = activeZoneId === zone.id;
        const isWrong = wrongZoneId === zone.id;
        const isHinted = hintZoneId === zone.id;
        const isCorrect = correctZoneId === zone.id;
        const locked = phase !== PHASE.CHOOSING;
        const isComplete = phase === PHASE.COMPLETE;
        // left has no hidden/revealed pair — it's plain decoration throughout.
        // center (spring) reveals once Elephant is solved; right (grass)
        // reveals once Cow is solved.
        const zoneImg = !zone.hiddenImg
          ? zone.img
          : (zone.id === 'center' ? elephantSolved : cowSolved)
            ? zone.revealedImg
            : zone.hiddenImg;

        return (
          <div
            key={zone.id}
            className={`ears-source ${locked ? 'locked' : 'ready'} ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isCorrect ? 'correct' : ''} ${isComplete ? 'resolving' : ''} ${debugMode && selectedDebugKey === zone.layoutKey ? 'is-debug-selected' : ''}`}
            style={{ ...styleFromLayout(layout[zone.layoutKey]), '--source-index': index + 1 }}
            onPointerDown={(e) => debugMode && startDebugDrag(e, zone.layoutKey)}
            aria-hidden="true"
          >
            <span className="ears-source-pulse" aria-hidden="true" />
            <PoseImage src={zoneImg} alt="" draggable={false} />
          </div>
        );
      })}

      {!zonesHidden && Object.values(ZONES).map((zone) => {
        const isPlaying = activeZoneId === zone.id;
        const isWrong = wrongZoneId === zone.id;
        const isHinted = hintZoneId === zone.id;
        const isCorrect = correctZoneId === zone.id;
        const locked = phase !== PHASE.CHOOSING;
        const isComplete = phase === PHASE.COMPLETE;

        return (
          <button
            key={`hit-${zone.id}`}
            type="button"
            className={`ears-source-hitbox ${locked ? 'locked' : 'ready'} ${isPlaying ? 'playing' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isCorrect ? 'correct' : ''} ${isComplete ? 'resolving' : ''} ${debugMode && selectedDebugKey === zone.hitLayoutKey ? 'is-debug-selected' : ''}`}
            style={styleFromLayout(layout[zone.hitLayoutKey])}
            onClick={(e) => handleSourceTap(zone.id, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, zone.hitLayoutKey)}
            disabled={!debugMode && locked}
            aria-label={zone.label}
          >
            {SHOW_HIT_ZONES && (
              <span
                className={`ears-hit-zone-outline ears-hit-zone-outline--${zone.id}`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}


      {(feedback || debugMode) && (
        <div
          className={`ears-soft-feedback ${debugMode && selectedDebugKey === 'feedback' ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout.feedback)}
          onPointerDown={(e) => startDebugDrag(e, 'feedback')}
        >
          {feedback || 'Feedback'}
        </div>
      )}

      {DEBUG_UI_ENABLED && (
        <div
          className={`ears-debug-panel ${debugMode ? 'is-open' : ''}`}
          style={{ left: debugPanelPosition.x, top: debugPanelPosition.y }}
          onPointerMove={moveDebugPanelDrag}
          onPointerUp={stopDebugPanelDrag}
          onPointerLeave={stopDebugPanelDrag}
        >
          <button
            type="button"
            className="ears-debug-toggle"
            onClick={() => setDebugMode((value) => !value)}
          >
            {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
          </button>

          {debugMode && (
            <div className="ears-debug-body">
              <button
                type="button"
                className="ears-debug-drag-handle"
                onPointerDown={startDebugPanelDrag}
              >
                Drag panel
              </button>
              <div className="ears-debug-section-title">Scene Objects</div>
              <p className="ears-debug-note">Drag any object in the scene, or tune exact values here.</p>

              <label className="ears-debug-row">
                <span>Element</span>
                <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                  {DEBUG_KEYS.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              {selectedDebugFields.map((field) => {
                const fieldValue = selectedDebugLayout?.[field] ?? (field === 'h' ? (selectedDebugLayout?.w ?? 0) : (field === 'z' ? 20 : 0));
                return (
                <label key={field} className="ears-debug-row">
                  <span>{field.toUpperCase()}</span>
                  <input
                    type="range"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={fieldValue}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={fieldValue}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                </label>
                );
              })}

              <div className="ears-debug-actions">
                <button type="button" onClick={copyLayoutJson}>
                  {layoutCopyStatus || 'Copy JSON'}
                </button>
                <button type="button" onClick={resetLayout}>Reset</button>
              </div>

              <pre className="ears-debug-readout">{JSON.stringify({ [selectedDebugKey]: selectedDebugLayout }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarsSoundMatchGame;
