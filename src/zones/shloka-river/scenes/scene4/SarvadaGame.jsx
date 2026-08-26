import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvadaGame.css';

import morningBg from './assets/images/sarvada/morning.webp';
import afternoonBg from './assets/images/sarvada/afternoon.webp';
import nightBg from './assets/images/sarvada/night-phase.webp';

import boatImg from './assets/images/sarvada/boat.png';
import ganeshaPopImg from '/images/ganesha-hi-stand.png';
import mooshikaSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-mooshika-new.png';
import trunkSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import lotusSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-lotus-new.png';

import morningBubbleImg from './assets/images/sarvada/puzzle-bubble.png';
import afternoonBubbleImg from './assets/images/sarvada/sports-bubble.png';
import nightBubbleImg from './assets/images/sarvada/gocery-bubble.png';

import morningSceneImg from './assets/images/sarvada/morning-scene.webp';
import afternoonSceneImg from './assets/images/sarvada/afternoon-scene.webp';
import nightSceneImg from './assets/images/sarvada/night-scene.webp';

const SYLLABLES = ['Sar', 'va', 'da'];
const AUDIO = ['sar', 'va', 'da'];
const PHASE_VO_KEYS = ['scene14_morning', 'scene14_afternoon', 'scene14_night'];

const PHASES_CONFIG = [
  {
    id: 'morning',
    bg: morningBg,
    bubble: morningBubbleImg,
    scene: morningSceneImg,
    label: 'Morning',
    syllable: 'SAR',
    litCount: 1,
    timeColor: '#FFE066',
    hiddenSymbol: mooshikaSymbolImg,
    foundLabel: 'Mooshika found!',
    clues: [
      'Look for a small friend who can be quick and busy.',
      'He may be hiding near something you take with you in the morning.',
      'Look near the school bag for a tiny mouse.',
    ],
    symbolSpot: { l: 6, t: 65, w: 12 },
  },
  {
    id: 'afternoon',
    bg: afternoonBg,
    bubble: afternoonBubbleImg,
    scene: afternoonSceneImg,
    label: 'Afternoon',
    syllable: 'VA',
    litCount: 2,
    timeColor: '#FFB347',
    hiddenSymbol: trunkSymbolImg,
    foundLabel: 'Trunk symbol found!',
    clues: [
      'Look for a symbol that can bend and curve.',
      'Something flying in the sky has a long curving shape.',
      "Look closely at the kite's tail.",
    ],
    symbolSpot: { l: 78, t: 54, w: 12 },
  },
  {
    id: 'night',
    bg: nightBg,
    bubble: nightBubbleImg,
    scene: nightSceneImg,
    label: 'Night',
    syllable: 'DA',
    litCount: 3,
    timeColor: '#B39DDB',
    hiddenSymbol: lotusSymbolImg,
    foundLabel: 'Lotus found!',
    clues: [
      'Look for a symbol that stays peaceful even when things around it are messy.',
      'A flower shape is hiding somewhere near the bed.',
      'Look at the bedside lamp for the lotus.',
    ],
    symbolSpot: { l: 86, t: 46, w: 10 },
  },
];

export default function SarvadaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
  voiceGuidance = {},
}) {
  const { playVoice: playSceneLine, stopVoice: stopSceneVoice, playWord, playSyllable } = voiceGuidance;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [bubbleState, setBubbleState] = useState('idle');
  const [showMemory, setShowMemory] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [revealedSyls, setRevealedSyls] = useState([]);
  const [gamePhase, setGamePhase] = useState('intro');
  const [prevBgSrc, setPrevBgSrc] = useState(null);
  const [prevBgOpacity, setPrevBgOpacity] = useState(1);
  const [flash, setFlash] = useState(false);
  const [findMode, setFindMode] = useState(false);
  const [symbolFound, setSymbolFound] = useState(false);
  const [popOut, setPopOut] = useState(false);
  const [rescueHintActive, setRescueHintActive] = useState(false);
  const [boatGaneshaVisible, setBoatGaneshaVisible] = useState(false);
  const [boatGaneshaJoining, setBoatGaneshaJoining] = useState(false);
  const [boatGaneshaCelebrating, setBoatGaneshaCelebrating] = useState(false);
  const lastHintVoiceKeyRef = useRef(null);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && findMode && !symbolFound,
    stageKey: isActive && findMode ? `find-${phaseIndex}` : null,
    initialDelay: 7000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1400,
    level2Delay: 14000,
    level3Delay: 21000,
  });

  useEffect(() => {
    if (!isActive || !findMode || symbolFound) {
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;
      return;
    }

    if (hintLevel === 0) {
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;
      return;
    }

    const cfg = PHASES_CONFIG[phaseIndex];
    const hintVoiceKey = `scene14_hint_${cfg.id}_${hintLevel}`;
    if (lastHintVoiceKeyRef.current !== hintVoiceKey) {
      lastHintVoiceKeyRef.current = hintVoiceKey;
      const timerId = window.setTimeout(() => {
        playSceneLine?.(hintVoiceKey, undefined, {
          replayOnReturn: false,
          minDelayAfterVoiceMs: 5000,
        });
      }, 120);
      return () => window.clearTimeout(timerId);
    }
  }, [findMode, symbolFound, hintLevel, isActive, phaseIndex, playSceneLine]);

  useEffect(() => {
    if (!isActive || !findMode || symbolFound || hintLevel < 3) {
      setRescueHintActive(false);
      return undefined;
    }

    const id = window.setTimeout(() => {
      setRescueHintActive(true);
    }, 7000);

    return () => window.clearTimeout(id);
  }, [findMode, symbolFound, hintLevel, isActive]);

  const safeAfter = useCallback((ms, fn) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startPhase = useCallback(() => {
    safeAfter(300, () => {
      setBubbleState('pulsing');
    });
  }, [safeAfter]);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setPhaseIndex(0);
      setBubbleState('idle');
      setShowMemory(false);
      setLitCount(0);
      setRevealedSyls([]);
      setGamePhase('intro');
      setPrevBgSrc(null);
      setPrevBgOpacity(1);
      setFlash(false);
      setFindMode(false);
      setSymbolFound(false);
      setPopOut(false);
      setRescueHintActive(false);
      setBoatGaneshaVisible(false);
      setBoatGaneshaJoining(false);
      setBoatGaneshaCelebrating(false);
      lastHintVoiceKeyRef.current = null;
      doneCalledRef.current = false;
      return;
    }
    safeAfter(700, () => {
      playSceneLine?.('scene14_intro', () => {
        playSceneLine?.('scene14_morning');
      });
    });
    return clearTimers;
  }, [isActive, clearTimers, safeAfter, playSceneLine]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!isActive || gamePhase !== 'intro') return;
    safeAfter(800, () => {
      setGamePhase('playing');
      startPhase();
    });
  }, [isActive, gamePhase, safeAfter, startPhase]);

  const handleBubbleTap = useCallback(() => {
    if (isPaused || bubbleState !== 'pulsing') return;

    stopSceneVoice?.();
    markInteraction();
    setBubbleState('expanding');
    safeAfter(300, () => {
      setShowMemory(true);
      setBubbleState('memory');
      safeAfter(800, () => {
        setFindMode(true);
        setRescueHintActive(false);
        lastHintVoiceKeyRef.current = null;
        playSceneLine?.('scene14_find_symbol');
      });
    });
  }, [
    bubbleState,
    isPaused,
    markInteraction,
    onMicroWin,
    onGameComplete,
    onPhaseComplete,
    phaseIndex,
    playSceneLine,
    safeAfter,
    stopSceneVoice,
  ]);

  const handleSymbolFound = useCallback(() => {
    if (!findMode || symbolFound || isPaused) return;

    const cfg = PHASES_CONFIG[phaseIndex];

    setSymbolFound(true);
    setPopOut(true);
    markInteraction();
    window.setTimeout(() => onMicroWin?.(), 0);

    // Sequence: symbol pops first, syllable lights (and its audio fires via
    // SyllableHighlight's onSyllableLit) a beat after — keeps the two audio
    // cues from firing on top of each other.
    safeAfter(280, () => {
      setLitCount(cfg.litCount);
      setRevealedSyls((prev) => [...prev, cfg.syllable]);
    });

    safeAfter(2200, () => {
      setPopOut(false);
      setBubbleState('bursting');
      setFlash(true);
      safeAfter(650, () => setFlash(false));
      setShowMemory(false);
      setFindMode(false);
      setSymbolFound(false);
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;

      const nextIndex = phaseIndex + 1;

      if (nextIndex >= PHASES_CONFIG.length) {
        // Final beat: let the three found symbols converge toward the boat,
        // THEN reveal Ganesha — the mid-game boat appearance is gone so this
        // is the first time Ganesha shows up, saving the payoff for the end.
        safeAfter(1000, () => {
          setGamePhase('convergence');
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
            setGamePhase('sarvada');
            if (doneCalledRef.current) return;
            doneCalledRef.current = true;
            setGamePhase('done');
            safeAfter(600, () => {
              window.setTimeout(() => {
                onGameComplete?.();
                onPhaseComplete?.();
              }, 0);
            });
          });
        });
      } else {
        safeAfter(600, () => {
          const outgoingSrc = PHASES_CONFIG[phaseIndex].bg;
          setPrevBgSrc(outgoingSrc);
          setPrevBgOpacity(1);
          setPhaseIndex(nextIndex);
          setGamePhase('transition');
          setBubbleState('idle');
          safeAfter(16, () => setPrevBgOpacity(0));
          safeAfter(500, () => {
            setPrevBgSrc(null);
            setPrevBgOpacity(1);
            setGamePhase('playing');
            startPhase();
            playSceneLine?.(PHASE_VO_KEYS[nextIndex]);
          });
        });
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
    startPhase,
  ]);

  if (!isActive) return null;

  const cfg = PHASES_CONFIG[phaseIndex];
  const isPlaying = gamePhase === 'playing' || gamePhase === 'transition';
  const showSarvada = gamePhase === 'sarvada' || gamePhase === 'done';
  return (
    <div className={`sarvada-game${hideElements ? ' is-hidden' : ''}${flash ? ' flash' : ''}`}>
      {/* Incoming bg — always fully visible */}
      <div
        className={`sarvada-bg${gamePhase === 'transition' ? ' zoom-in' : ''}`}
        style={{ backgroundImage: `url(${cfg.bg})`, opacity: 1, zIndex: 0 }}
      />
      {/* Outgoing bg — only present during crossfade, fades out on top */}
      {prevBgSrc && (
        <div
          className="sarvada-bg"
          style={{
            backgroundImage: `url(${prevBgSrc})`,
            opacity: prevBgOpacity,
            transition: 'opacity 0.45s ease',
            zIndex: 1,
          }}
        />
      )}

      <div className="sarvada-syl-wrap">
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            playSyllable?.(syllable);
          }}
        />
      </div>

      {isPlaying && !showMemory && (
        <div
          className={`sarvada-bubble ${bubbleState}`}
          onPointerDown={handleBubbleTap}
          key={`bubble-${phaseIndex}`}
        >
          <img src={cfg.bubble} alt="memory bubble" draggable={false} />
        </div>
      )}

      {bubbleState === 'bursting' && <div className="sarvada-ring-burst" />}

      {showMemory && (
        <div className="sarvada-memory" key={`memory-${phaseIndex}`}>
          <div className="sarvada-memory-inner">
            <img
              className="sarvada-memory-img"
              src={cfg.scene}
              alt="memory"
              draggable={false}
            />
            {findMode && (
              <>
                {!symbolFound && (
                  <img
                    className={`sarvada-hidden-symbol${hintLevel >= 3 ? ' is-guided hint-glow' : ''}`}
                    src={cfg.hiddenSymbol}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      left: `${cfg.symbolSpot.l}%`,
                      top: `${cfg.symbolSpot.t}%`,
                      width: `${cfg.symbolSpot.w}%`,
                    }}
                  />
                )}
                <button
                  className={`sarvada-symbol-target${symbolFound ? ' is-found' : ''}`}
                  style={{
                    left: `${cfg.symbolSpot.l}%`,
                    top: `${cfg.symbolSpot.t}%`,
                    width: `${cfg.symbolSpot.w}%`,
                  }}
                  onPointerDown={handleSymbolFound}
                  aria-label={`Find the hidden ${cfg.id} symbol`}
                />
                {popOut && (
                  <>
                    <div
                      className="sarvada-found-burst"
                      style={{ left: `${cfg.symbolSpot.l}%`, top: `${cfg.symbolSpot.t}%` }}
                    />
                    <img
                      className="sarvada-symbol-pop"
                      src={cfg.hiddenSymbol}
                      alt=""
                      style={{ left: `${cfg.symbolSpot.l}%`, top: `${cfg.symbolSpot.t}%` }}
                    />
                    <div
                      className="sarvada-found-label"
                      style={{ left: `${cfg.symbolSpot.l}%`, top: `${cfg.symbolSpot.t}%` }}
                    >
                      {cfg.foundLabel}
                    </div>
                  </>
                )}
                {rescueHintActive && !symbolFound && (
                  <div
                    className="sarvada-symbol-ring hint-glow"
                    style={{
                      left: `${cfg.symbolSpot.l}%`,
                      top: `${cfg.symbolSpot.t}%`,
                      width: `${cfg.symbolSpot.w}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {gamePhase === 'convergence' && (
        <div className="sarvada-converge">
          {PHASES_CONFIG.map((p, i) => (
            <img
              key={p.id}
              className="sarvada-converge-symbol"
              src={p.hiddenSymbol}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}

      {showSarvada && (
        <div className="sarvada-reveal">
          <div className="sarvada-syllables-row">
            {revealedSyls.map((syl, i) => (
              <span
                key={syl}
                className="sarvada-syl-float"
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                {syl}
              </span>
            ))}
          </div>
          <div className="sarvada-word">SARVADA</div>
          <div className="sarvada-meaning">Always</div>
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
    </div>
  );
}
