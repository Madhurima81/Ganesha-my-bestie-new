import PoseImage, { preparePose, usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import useWarmSanskritAudio from '../../../../lib/hooks/useWarmSanskritAudio';
import { logSceneEvent } from '../../../../lib/utils/sceneEventLog';
import './SarvadaGame.css';

import morningBg from './assets/images/sarvada/morning.webp';
import afternoonBg from './assets/images/sarvada/afternoon.webp';
import nightBg from './assets/images/sarvada/night-phase.webp';

import boatImg from './assets/images/sarvada/boat.webp';
import ganeshaPopImg from '/images/ganesha-hi-stand.webp';
import earsSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-ears-new-opt.webp';
import bellySymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-belly-new-opt.webp';
import modakSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-modak-new.webp';

import morningSceneImg from './assets/images/sarvada/morning-scene.webp';
import afternoonSceneImg from './assets/images/sarvada/afternoon-scene.webp';
import nightSceneImg from './assets/images/sarvada/night-scene.webp';

const SYLLABLES = ['Sar', 'va', 'da'];
const AUDIO = ['sar', 'va', 'da'];
const PHASE_VO_KEYS = ['scene14_morning', 'scene14_afternoon', 'scene14_night'];
const PHASE_AFTER_VO_KEYS = ['scene14_morning_after', 'scene14_afternoon_after', 'scene14_night_after'];
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

const PHASES_CONFIG = [
  {
    id: 'morning',
    bg: morningBg,
    scene: morningSceneImg,
    label: 'Morning',
    syllable: 'SAR',
    litCount: 1,
    timeColor: '#FFE066',
    hiddenSymbol: earsSymbolImg,
    foundLabel: 'You found the Ears!',
    hintVoKey: 'scene14_hint_morning_clue',
    symbolSpot: { l: 40.5, t: 50.0, w: 10.5 },
  },
  {
    id: 'afternoon',
    bg: afternoonBg,
    scene: afternoonSceneImg,
    label: 'Afternoon',
    syllable: 'VA',
    litCount: 2,
    timeColor: '#FFB347',
    hiddenSymbol: bellySymbolImg,
    foundLabel: 'You found the Big Belly!',
    hintVoKey: 'scene14_hint_afternoon_clue',
    symbolSpot: { l: 89.5, t: 48.5, w: 18.0 },
  },
  {
    id: 'night',
    bg: nightBg,
    scene: nightSceneImg,
    label: 'Night',
    syllable: 'DA',
    litCount: 3,
    timeColor: '#B39DDB',
    hiddenSymbol: modakSymbolImg,
    foundLabel: 'You found the Modak!',
    hintVoKey: 'scene14_hint_night_clue',
    symbolSpot: { l: 34.0, t: 31.5, w: 13.5 },
  },
];

const POSE_ASSETS = [
  morningBg,
  afternoonBg,
  nightBg,
  boatImg,
  ganeshaPopImg,
  earsSymbolImg,
  bellySymbolImg,
  modakSymbolImg,
  morningSceneImg,
  afternoonSceneImg,
  nightSceneImg,
];

const NO_PRELOAD_IMAGES = [];

export default function SarvadaGame({
  isActive = false,
  warmImages = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  onReplayKeyChange = () => {},
  isPaused = false,
  voiceGuidance = {},
  // Resume: times of day already found (0-2). Applied only when the game mounts active (Continue).
  initialTimes = 0,
  initialTimesVoDone = true,
  // Fired with the finished count when the game moves on to the next time of day (checkpoint).
  onBeatComplete = () => {},
  onTimesVoDone = () => {},
}) {
  usePreloadPoses(isActive ? POSE_ASSETS : NO_PRELOAD_IMAGES);
  useEffect(() => {
    if (!warmImages || isActive) return undefined;
    let timer;
    const warm = () => {
      const images = [...document.querySelectorAll('.sarva-game:not(.is-hidden) img')];
      if (!images.length || images.some((image) => !image.complete || !image.naturalWidth)) {
        timer = setTimeout(warm, 250);
        return;
      }
      POSE_ASSETS.forEach((src) => { preparePose(src).catch(() => {}); });
    };
    timer = setTimeout(warm, 2500);
    return () => clearTimeout(timer);
  }, [warmImages, isActive]);
  const { playVoice: playSceneLine, stopVoice: stopSceneVoice, playWord, playSyllable, setBeat } = voiceGuidance;
  useWarmSanskritAudio('sarvada', AUDIO); // first tap plays instantly
  const [seedTimes] = useState(() => (
    // PHASES_CONFIG.length = left after the last time of day: resume into the boat + word + success line.
    isActive ? Math.max(0, Math.min(PHASES_CONFIG.length, Number(initialTimes) || 0)) : 0
  ));
  const [phaseIndex, setPhaseIndex] = useState(
    seedTimes > 0 && seedTimes < PHASES_CONFIG.length && initialTimesVoDone === false
      ? seedTimes - 1
      : Math.min(seedTimes, PHASES_CONFIG.length - 1)
  );
  const [showMemory, setShowMemory] = useState(false);
  const [litCount, setLitCount] = useState(seedTimes);
  const [gamePhase, setGamePhase] = useState('intro');
  const [flash, setFlash] = useState(false);
  const [findMode, setFindMode] = useState(false);
  // GMB Hint Standard v1: gates the ladder below until the "find the symbol"
  // VO (scene14_find_symbol) has actually finished, not just findMode flipping.
  const [findVoComplete, setFindVoComplete] = useState(true);
  const [afterVoPlaying, setAfterVoPlaying] = useState(false);
  const [symbolFound, setSymbolFound] = useState(false);
  const [popOut, setPopOut] = useState(false);
  const [boatGaneshaVisible, setBoatGaneshaVisible] = useState(false);
  const [boatGaneshaJoining, setBoatGaneshaJoining] = useState(false);
  const [boatGaneshaCelebrating, setBoatGaneshaCelebrating] = useState(false);
  const lastHintVoiceKeyRef = useRef(null);
  const symbolFoundRef = useRef(false);

  // Tap-to-find: the symbol is hidden — the child taps a spot on the memory
  // image. A tap inside the (invisible) circular zone flies the symbol up to
  // the syllable tile. Zones are tunable per phase via the debug panel below.
  const [spots, setSpots] = useState(() =>
    PHASES_CONFIG.map((p) => ({ ...p.symbolSpot })),
  );
  const [flySymbol, setFlySymbol] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const [missRipple, setMissRipple] = useState(null);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const completeCalledRef = useRef(false);
  const initialTimesVoDoneRef = useRef(initialTimesVoDone);
  initialTimesVoDoneRef.current = initialTimesVoDone;
  const onTimesVoDoneRef = useRef(onTimesVoDone);
  onTimesVoDoneRef.current = onTimesVoDone;
  const onBeatCompleteRef = useRef(onBeatComplete);
  onBeatCompleteRef.current = onBeatComplete;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const lastSyllableDoneRef = useRef(true);
  const introPlayedRef = useRef(false);
  const runStartedRef = useRef(false);
  const searchVoiceTokenRef = useRef(0);
  symbolFoundRef.current = symbolFound;

  // Two-step search support (no hand, no L3 behaviour):
  //   L1 (~12s) = one meaning clue (VO) + the broad search-area glow
  //   L2 (~25s) = broad glow off, exact ring on (no VO) and it stays until found
  // The hook may reach L3 at 40s; L2 and L3 render identically.
  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && findMode && findVoComplete && !symbolFound && !afterVoPlaying && !showDebugPanel,
    stageKey: isActive && findMode ? `find-${phaseIndex}` : null,
    initialDelay: 12000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1400,
    level2Delay: 25000,
    level3Delay: 40000,
  });

  // The clue is spoken once, at L1 only.
  useEffect(() => {
    if (!isActive || !findMode || symbolFound || hintLevel !== 1) return undefined;

    const hintVoiceKey = PHASES_CONFIG[phaseIndex].hintVoKey;
    if (lastHintVoiceKeyRef.current === hintVoiceKey) return undefined;

    lastHintVoiceKeyRef.current = hintVoiceKey;
    const timerId = window.setTimeout(() => {
      playSceneLine?.(hintVoiceKey, undefined, { replayOnReturn: false });
    }, 120);
    return () => window.clearTimeout(timerId);
  }, [findMode, symbolFound, hintLevel, isActive, phaseIndex, playSceneLine, afterVoPlaying]);

  // Pausable timers: while the sidebar is open (isPaused) every pending timer
  // is frozen with its remaining time, and resumes from there — so a reveal or
  // auto-advance never runs behind the sidebar or jumps ahead when it closes.
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const runTimer = useCallback((t) => {
    t.startedAt = Date.now();
    t.id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((x) => x !== t);
      t.fn();
    }, t.remaining);
  }, []);

  const safeAfter = useCallback((ms, fn) => {
    const t = { fn, remaining: ms, startedAt: 0, id: null };
    timersRef.current.push(t);
    if (!isPausedRef.current) runTimer(t);
    return t;
  }, [runTimer]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t.id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    timersRef.current.forEach((t) => {
      if (isPaused) {
        if (t.id === null) return;
        window.clearTimeout(t.id);
        t.id = null;
        t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
      } else if (t.id === null) {
        runTimer(t);
      }
    });
  }, [isPaused, runTimer]);

  const startPhase = useCallback((index, options = {}) => {
    const promptDelayMs = options.promptDelayMs ?? 300;
    setShowMemory(true);
    setFindMode(false);
    setFindVoComplete(false);
    setSymbolFound(false);
    setPopOut(false);
    setMissRipple(null);
    lastHintVoiceKeyRef.current = null;
    setBeat?.(`round-${index}`);
    safeAfter(300, () => {
      setBeat?.(`find-${index}`);
      setFindMode(true);
    });

    const startSearchPrompts = () => {
      const voiceToken = searchVoiceTokenRef.current + 1;
      searchVoiceTokenRef.current = voiceToken;

      let findVoFinished = false;
      const finishFindVo = () => {
        if (findVoFinished) return;
        findVoFinished = true;
        setFindVoComplete(true);
      };

      const playFindPrompt = () => {
        if (searchVoiceTokenRef.current !== voiceToken || symbolFoundRef.current) {
          finishFindVo();
          return;
        }
        if (playSceneLine) {
          playSceneLine('scene14_find_symbol', finishFindVo);
          safeAfter(4500, finishFindVo);
        } else {
          finishFindVo();
        }
      };

      const phaseVoKey = PHASE_VO_KEYS[index];
      if (phaseVoKey && playSceneLine) {
        let phaseVoDone = false;
        const finishPhaseVo = () => {
          if (phaseVoDone) return;
          phaseVoDone = true;
          playFindPrompt();
        };
        playSceneLine(phaseVoKey, finishPhaseVo);
        safeAfter(4500, finishPhaseVo);
      } else {
        playFindPrompt();
      }
    };

    // The search target is live as soon as the phase starts. VO is guidance,
    // not a gate; a child tap stops it in handleImageTap/triggerFound.
    safeAfter(promptDelayMs, startSearchPrompts);
  }, [playSceneLine, safeAfter, setBeat]);

  const runApiRef = useRef({});
  runApiRef.current = { safeAfter, playSceneLine, setBeat, startPhase };

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setPhaseIndex(0);
      setShowMemory(false);
      setLitCount(0);
      setGamePhase('intro');
      setFlash(false);
      setFindMode(false);
      setSymbolFound(false);
      setAfterVoPlaying(false);
      setPopOut(false);
      setFlySymbol(null);
      setBoatGaneshaVisible(false);
      setBoatGaneshaJoining(false);
      setBoatGaneshaCelebrating(false);
      lastHintVoiceKeyRef.current = null;
      doneCalledRef.current = false;
      completeCalledRef.current = false;
      introPlayedRef.current = false;
      runStartedRef.current = false;
      return;
    }
    if (runStartedRef.current) return undefined;
    // Latest callbacks come from a ref: the parent passes inline props that change on every render
    // (a checkpoint() re-renders it), and listing them as deps would cancel the pending timers below.
    const run = runApiRef.current;
    // The flag is set when a timer FIRES, never before one is scheduled: StrictMode (dev) mounts,
    // cleans up and mounts again, and a flag set up front would stop the second run from scheduling.
    // Resumed after finished times of day: skip the scene intro and start straight at the next one,
    // after ~500ms (speech at the very first instant after mount is silent on Continue).
    if (seedTimes > 0) {
      introPlayedRef.current = true;
      setGamePhase('playing');
      runStartedRef.current = true;
      // Includes the LAST time of day (seedTimes === PHASES_CONFIG.length): if its success line was cut off, show it
      // finished, replay that line, and only then run the final sequence.
      if (!initialTimesVoDoneRef.current && seedTimes <= PHASES_CONFIG.length) {
        const afterKey = PHASE_AFTER_VO_KEYS[seedTimes - 1];
        let finished = false;
        const finishAfter = (voiceFinished = false) => {
          if (finished) return;
          finished = true;
          if (voiceFinished) onTimesVoDoneRef.current?.();
          // Same moves as the live advance: show the NEXT time of day's picture, then start its question.
          setAfterVoPlaying(false);
          if (seedTimes >= PHASES_CONFIG.length) {
            runApiRef.current.runFinal();
            return;
          }
          setPhaseIndex(seedTimes);
          setGamePhase('playing');
          runApiRef.current.startPhase(seedTimes);
        };
        setPhaseIndex(seedTimes - 1);
        setShowMemory(true);
        setLitCount(seedTimes);
        setFindMode(false);
        setSymbolFound(true);
        setAfterVoPlaying(true);
        // ~500 ms after mount: speech requested in the very first instant after a Continue mount is dropped
        // (silent), which left this beat with no voice until the child tapped. Plain timer callback reads the
        // latest playSceneLine from the ref.
        safeAfter(500, () => {
          runApiRef.current.playSceneLine?.(afterKey, () => {
            setAfterVoPlaying(false);
            safeAfter(2500, () => finishAfter(true));
          });
        });
        safeAfter(8000, () => {
          setAfterVoPlaying(false);
          finishAfter();
        });
      } else if (seedTimes >= PHASES_CONFIG.length) runApiRef.current.runFinal();
      else runApiRef.current.startPhase(seedTimes);
      return () => { clearTimers(); runStartedRef.current = false; };
    }
    run.setBeat?.('intro');
    setGamePhase('playing');
    runStartedRef.current = true;
    run.startPhase(0, { promptDelayMs: 6200 });
    if (run.playSceneLine && !introPlayedRef.current) {
      introPlayedRef.current = true;
      run.playSceneLine('scene14_intro', undefined, { replayOnReturn: false });
    } else {
      introPlayedRef.current = true;
    }
    return () => { clearTimers(); runStartedRef.current = false; };
  }, [isActive, clearTimers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!isActive) {
      onReplayKeyChange(null);
      return;
    }

    // gamePhase flips to 'playing' as soon as the run starts, so it can't mark
    // the intro; showMemory only turns on once startPhase(0) begins.
    if (!showMemory) {
      onReplayKeyChange('scene14_intro');
      return;
    }

    if (findMode) {
      onReplayKeyChange('scene14_find_symbol');
      return;
    }

    onReplayKeyChange(PHASE_VO_KEYS[phaseIndex] || 'scene14_intro');
  }, [findMode, isActive, onReplayKeyChange, phaseIndex, showMemory]);


  // Final beat (also when Continue resumes after the last time of day): Ganesha joins the boat, then the full
  // word "sarvada" -> closing line -> hand off.
  const runFinal = useCallback(() => {
    if (!isActiveRef.current) return;
    setShowMemory(false);
    // Final beat: reveal Ganesha on the boat, then hand off to the shared
    // Sarvada completion reveal. The mini-game does not show its own word
    // or all-three-symbol summary.
    safeAfter(1000, () => {
      setBeat?.('final');
      setGamePhase('done');
      safeAfter(1300, () => {
        setBoatGaneshaVisible(true);
        setBoatGaneshaJoining(true);
      });
      safeAfter(2300, () => {
        setBoatGaneshaJoining(false);
        setBoatGaneshaCelebrating(true);
      });
      safeAfter(3200, () => setBoatGaneshaCelebrating(false));
      safeAfter(3100, () => {
        if (!isActiveRef.current) return;
        if (doneCalledRef.current) return;
        doneCalledRef.current = true;

        const finish = () => {
          if (!isActiveRef.current) return;
          if (completeCalledRef.current) return;
          completeCalledRef.current = true;
          onGameComplete?.();
          onPhaseComplete?.();
        };

        // Full word "sarvada" → closing line (meaning is embedded in the
        // line itself), then hand off. Fallback timer covers muted
        // audio / missing callbacks.
        const playFinalWord = () => {
          playWord?.('sarvada', () => {
            playSceneLine?.('scene14_success', finish);
          });
        };
        if (lastSyllableDoneRef.current) playFinalWord();
        else {
          const waitForSyllable = () => {
            if (lastSyllableDoneRef.current) {
              playFinalWord();
              return;
            }
            safeAfter(120, waitForSyllable);
          };
          waitForSyllable();
        }
        safeAfter(9000, finish);
      });
    });
  }, [onGameComplete, onPhaseComplete, playSceneLine, playWord, safeAfter, setBeat]);

  runApiRef.current.runFinal = runFinal;

  const triggerFound = useCallback((clientX, clientY) => {
    if (!findMode || symbolFound || isPaused) return;

    const cfg = PHASES_CONFIG[phaseIndex];

    // Fly the found symbol from the tap point to *this phase's* syllable tile
    // (Sar / va / da), not just the top of the screen.
    const tiles = document.querySelectorAll('.sarvada-syl-wrap .syl');
    const tileEl = tiles[phaseIndex] || document.querySelector('.sarvada-syl-wrap');
    const tRect = tileEl?.getBoundingClientRect();
    const targetX = tRect ? tRect.left + tRect.width / 2 : window.innerWidth / 2;
    const targetY = tRect ? tRect.top + tRect.height / 2 : 48;
    setFlySymbol({
      key: Date.now(),
      src: cfg.hiddenSymbol,
      startX: clientX,
      startY: clientY,
      dx: targetX - clientX,
      dy: targetY - clientY,
    });

    setBeat?.(`found-${phaseIndex}`);
    searchVoiceTokenRef.current += 1;
    setSymbolFound(true);
    setPopOut(true);
    markInteraction();
    window.setTimeout(() => onMicroWin?.(), 0);
    // Checkpoint at the find (not after the long reveal), so leaving mid-reveal resumes at the NEXT time of day;
    // after the last one it resumes into the ending.
    onBeatCompleteRef.current?.(phaseIndex + 1);

    // The syllable lights (and its audio fires via SyllableHighlight's
    // onSyllableLit) the moment the flying symbol reaches the tile — see
    // the .sarvada-fly-symbol onAnimationEnd handler. Fly runs ~1.5s.

    safeAfter(3400, () => {
      setPopOut(false);
      setFlash(true);
      safeAfter(650, () => setFlash(false));
      const nextIndex = phaseIndex + 1;
      setFindMode(false);
      setSymbolFound(false);
      lastHintVoiceKeyRef.current = null;
      let afterFinished = false;
      const finishAfter = (voiceFinished = false) => {
        if (afterFinished) return;
        afterFinished = true;
        if (voiceFinished) onTimesVoDoneRef.current?.();
        setAfterVoPlaying(false);
        safeAfter(2500, () => {
          if (nextIndex >= PHASES_CONFIG.length) {
            runFinal();
          } else {
            setPhaseIndex(nextIndex);
            setGamePhase('playing');
            startPhase(nextIndex);
          }
        });
      };
      const startAfterLine = () => {
        setAfterVoPlaying(true);
        playSceneLine?.(PHASE_AFTER_VO_KEYS[phaseIndex], () => finishAfter(true));
        safeAfter(7000, finishAfter);
      };
      if (lastSyllableDoneRef.current) startAfterLine();
      else {
        const waitForSyllable = () => {
          if (lastSyllableDoneRef.current) startAfterLine();
          else safeAfter(120, waitForSyllable);
        };
        waitForSyllable();
      }
    });
  }, [
    findMode,
    symbolFound,
    isPaused,
    markInteraction,
    onGameComplete,
    onMicroWin,
    onPhaseComplete,
    phaseIndex,
    playSceneLine,
    playWord,
    safeAfter,
    setBeat,
    startPhase,
    runFinal,
  ]);

  const handleImageTap = useCallback(
    (event) => {
      if (!findMode || symbolFound || isPaused) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      const s = spots[phaseIndex] || PHASES_CONFIG[phaseIndex].symbolSpot;
      // Frame is 4:3 — convert the vertical %-of-height delta into %-of-width
      // units so the hit zone is a true circle, not an ellipse.
      const dx = px - s.l;
      const dy = (py - s.t) * (3 / 4);
      // A miss gets a tiny neutral ripple at the tap point only — no shake,
      // VO, red, or penalty. For a visual-search game, punishing exploration
      // is too much; but silence also can't tell the child their tap
      // registered, so a small ripple confirms it landed without judging it.
      if (Math.hypot(dx, dy) <= s.w / 2) {
        // Only a real find cuts the voice - a wrong exploratory tap must not interrupt the clue.
        stopSceneVoice?.();
        triggerFound(event.clientX, event.clientY);
      } else {
        setMissRipple({ key: Date.now(), left: px, top: py });
      }
    },
    [findMode, symbolFound, isPaused, spots, phaseIndex, stopSceneVoice, triggerFound],
  );

  const updateSpot = useCallback((index, key, value) => {
    setSpots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: Number(value) } : s)),
    );
  }, []);

  const copyZoneConfig = useCallback(() => {
    const text = spots
      .map((s, i) => {
        const n = (v) => Number(v).toFixed(1);
        return `    // ${PHASES_CONFIG[i].id}\n    symbolSpot: { l: ${n(s.l)}, t: ${n(s.t)}, w: ${n(s.w)} },`;
      })
      .join('\n');
    try {
      navigator.clipboard?.writeText(text);
      setCopyStatus('Copied!');
    } catch {
      setCopyStatus('Copy failed');
    }
    window.setTimeout(() => setCopyStatus(''), 1500);
  }, [spots]);

  if (!isActive) return null;

  const cfg = PHASES_CONFIG[phaseIndex];
  const spot = spots[phaseIndex] || cfg.symbolSpot;
  const zoneStyle = (s) => ({
    left: `${s.l}%`,
    top: `${s.t}%`,
    width: `${s.w}%`,
  });
  // L1 = broad vicinity (with the clue), L2+ = exact ring (rendered separately below) — a
  // visual-search game needs a search AREA, not a brighter symbol (the hidden symbol is baked
  // into the scene image, not its own element).
  const searchHintStyle = (() => {
    if (!findMode || symbolFound || hintLevel !== 1) return null;
    return {
      left: `${spot.l}%`,
      top: `${spot.t}%`,
      width: `${Math.min(38, spot.w * 2.8)}%`,
      height: `${Math.min(34, spot.w * 2.8)}%`,
    };
  })();
  return (
    <div className={`sarvada-game${hideElements ? ' is-hidden' : ''}${flash ? ' flash' : ''}${isPaused ? ' is-paused' : ''}`} onContextMenu={(e) => e.preventDefault()}>
      <PoseImage
        className="sarvada-bg"
        src={cfg.bg}
        alt=""
        aria-hidden="true"
        style={{ height: '100%', zIndex: 0 }}
        imageStyle={{ height: '100%', objectFit: 'cover' }}
      />

      <div className="sarvada-syl-wrap">
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            lastSyllableDoneRef.current = false;
            logSceneEvent('sarvada', 'syllable:started', { key: syllable });
            playSyllable?.(syllable, () => {
              lastSyllableDoneRef.current = true;
              logSceneEvent('sarvada', 'syllable:finished', { key: syllable });
            });
            safeAfter(4500, () => {
              lastSyllableDoneRef.current = true;
              logSceneEvent('sarvada', 'syllable:finished', { key: syllable, fallback: true });
            });
          }}
        />
      </div>

      {showMemory && (
        <div className="sarvada-memory" key={`memory-${phaseIndex}`}>
          <div className="sarvada-memory-inner">
            <div className="sarvada-find-frame">
              <img
                className="sarvada-memory-img"
                src={cfg.scene}
                alt="memory"
                draggable={false}
              />
              {findMode && !symbolFound && (
                <button
                  className="sarvada-image-tap"
                  onPointerDown={handleImageTap}
                  aria-label="Tap where you think the symbol is hiding"
                />
              )}
              {missRipple && (
                <div
                  key={missRipple.key}
                  className="sarvada-miss-ripple"
                  style={{ left: `${missRipple.left}%`, top: `${missRipple.top}%` }}
                  onAnimationEnd={() => setMissRipple(null)}
                />
              )}
              {findMode && (SHOW_HIT_ZONES || (showDebugPanel && showZones)) && (
                <div className="sarvada-zone-outline" style={zoneStyle(spot)} />
              )}
              {/* Step 1 — meaning clue + broad search area (not the exact location).
                  Step 2 — the exact ring, which stays until found. */}
              {searchHintStyle && (
                <div className="sarvada-search-hint" style={searchHintStyle} />
              )}
              {findMode && hintLevel >= 2 && !symbolFound && (
                <div className="sarvada-symbol-ring hint-glow" style={zoneStyle(spot)} />
              )}
              {findMode && popOut && (
                <>
                  <div
                    className="sarvada-found-burst"
                    style={{ left: `${spot.l}%`, top: `${spot.t}%` }}
                  />
                  <div
                    className="sarvada-found-label"
                    style={{ left: `${spot.l}%`, top: `${spot.t}%` }}
                  >
                    {cfg.foundLabel}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sarvada-boat">
        <img src={boatImg} alt="boat with kids" draggable={false} />
        {boatGaneshaVisible && (
          <img
            className={`sarvada-boat-ganesha${boatGaneshaJoining ? ' is-joining' : ''}${boatGaneshaCelebrating ? ' is-celebrating' : ''}`}
            src={ganeshaPopImg}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        )}
      </div>

      {flySymbol && (
        <img
          key={flySymbol.key}
          className="sarvada-fly-symbol"
          src={flySymbol.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            left: `${flySymbol.startX}px`,
            top: `${flySymbol.startY}px`,
            '--fly-dx': `${flySymbol.dx}px`,
            '--fly-dy': `${flySymbol.dy}px`,
          }}
          onAnimationEnd={() => {
            // Symbol has reached the syllable tile — light it now so the
            // syllable sound lands on contact (matches Sarvakaryeshu).
            const cfgNow = PHASES_CONFIG[phaseIndex];
            setLitCount(cfgNow.litCount);
            window.setTimeout(() => setFlySymbol(null), 120);
          }}
        />
      )}

      <div className={`sarvada-debug ${showDebugPanel ? 'is-open' : ''}`}>
        <button
          type="button"
          className="sarvada-debug-toggle"
          onClick={() => setShowDebugPanel((v) => !v)}
        >
          {showDebugPanel ? 'Hide Tap Zone Debug' : 'Tap Zone Debug'}
        </button>

        {showDebugPanel && (
          <div className="sarvada-debug-body">
            <div className="sarvada-debug-copy-row">
              <button type="button" className="sarvada-debug-copy" onClick={copyZoneConfig}>
                Copy symbolSpot config
              </button>
              {copyStatus && <span>{copyStatus}</span>}
            </div>

            <label className="sarvada-debug-check">
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
              />
              <span>Show tap zones on image</span>
            </label>

            <p className="sarvada-debug-note">
              {findMode
                ? `Editing: ${cfg.label}. Tap the image to test and line up its zone.`
                : 'Each image opens directly for hidden-symbol search.'}
            </p>

            {PHASES_CONFIG.map((p, i) => (
              <div key={p.id} className="sarvada-debug-group">
                <div className="sarvada-debug-section-title">
                  {p.label}
                  {i === phaseIndex && findMode ? ' — live' : ''}
                </div>
                {[
                  ['X', 'l', 0, 100, 0.5],
                  ['Y', 't', 0, 100, 0.5],
                  ['Size', 'w', 4, 40, 0.5],
                ].map(([label, key, min, max, step]) => (
                  <label key={key} className="sarvada-debug-row">
                    <span>{label}</span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={spots[i][key]}
                      onChange={(e) => updateSpot(i, key, e.target.value)}
                    />
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={spots[i][key]}
                      onChange={(e) => updateSpot(i, key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            ))}

            <div className="sarvada-debug-actions">
              <button
                type="button"
                className="sarvada-debug-reset"
                onClick={() => setSpots(PHASES_CONFIG.map((p) => ({ ...p.symbolSpot })))}
              >
                Reset zones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
