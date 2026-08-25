import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvadaGame.css';

import morningBg from './assets/images/sarvada/morning.png';
import afternoonBg from './assets/images/sarvada/afternoon.png';
import nightBg from './assets/images/sarvada/night.png';

import boatImg from './assets/images/sarvada/boat.png';
import ganeshaPopImg from '/images/ganesha-hi-stand.png';
import mooshikaSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-mooshika-new.png';
import trunkSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import lotusSymbolImg from '../../../../zones/symbol-mountain/shared/images/icons/symbol-lotus-new.png';

import morningBubbleImg from './assets/images/sarvada/puzzle-bubble.png';
import afternoonBubbleImg from './assets/images/sarvada/sports-bubble.png';
import nightBubbleImg from './assets/images/sarvada/gocery-bubble.png';

import morningSceneImg from './assets/images/sarvada/morning-scene.png';
import afternoonSceneImg from './assets/images/sarvada/afternoon-scene.png';
import nightSceneImg from './assets/images/sarvada/night-scene.png';

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
    ganeshaSpot: { l: 89, t: 56, w: 14 },
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
    ganeshaSpot: { l: 50, t: 22, w: 14 },
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
    ganeshaSpot: { l: 60, t: 17, w: 14 },
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
  const [ganeshaFound, setGaneshaFound] = useState(false);
  const [popOut, setPopOut] = useState(false);
  const [rescueHintActive, setRescueHintActive] = useState(false);
  const [boatGaneshaVisible, setBoatGaneshaVisible] = useState(false);
  const [boatGaneshaJoining, setBoatGaneshaJoining] = useState(false);
  const [boatGaneshaCelebrating, setBoatGaneshaCelebrating] = useState(false);
  const lastHintVoiceKeyRef = useRef(null);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && findMode && !ganeshaFound,
    stageKey: isActive && findMode ? `find-${phaseIndex}` : null,
    initialDelay: 7000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1400,
    level2Delay: 14000,
    level3Delay: 21000,
  });

  useEffect(() => {
    if (!isActive || !findMode || ganeshaFound) {
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
  }, [findMode, ganeshaFound, hintLevel, isActive, phaseIndex, playSceneLine]);

  useEffect(() => {
    if (!isActive || !findMode || ganeshaFound || hintLevel < 3) {
      setRescueHintActive(false);
      return undefined;
    }

    const id = window.setTimeout(() => {
      setRescueHintActive(true);
    }, 7000);

    return () => window.clearTimeout(id);
  }, [findMode, ganeshaFound, hintLevel, isActive]);

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
      setGaneshaFound(false);
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
        setClueMessage('');
        setRescueHintActive(false);
        lastHintVoiceKeyRef.current = null;
        playSceneLine?.('scene14_find_ganesha');
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

  const handleGaneshaFound = useCallback(() => {
    if (!findMode || ganeshaFound || isPaused) return;

    const cfg = PHASES_CONFIG[phaseIndex];

    setGaneshaFound(true);
    setPopOut(true);
    markInteraction();
    playSceneLine?.(`scene14_found_${cfg.id}`);
    setLitCount(cfg.litCount);
    window.setTimeout(() => onMicroWin?.(), 0);
    setRevealedSyls((prev) => [...prev, cfg.syllable]);

    if (phaseIndex === 0) {
      safeAfter(650, () => {
        setBoatGaneshaVisible(true);
        setBoatGaneshaJoining(true);
      });
      safeAfter(1650, () => {
        setBoatGaneshaJoining(false);
        setBoatGaneshaCelebrating(true);
      });
      safeAfter(2550, () => setBoatGaneshaCelebrating(false));
    } else {
      setBoatGaneshaVisible(true);
      safeAfter(450, () => setBoatGaneshaCelebrating(true));
      safeAfter(1700, () => setBoatGaneshaCelebrating(false));
    }

    safeAfter(2200, () => {
      setPopOut(false);
      setBubbleState('bursting');
      setFlash(true);
      safeAfter(650, () => setFlash(false));
      setShowMemory(false);
      setFindMode(false);
      setGaneshaFound(false);
      setClueMessage('');
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;

      const nextIndex = phaseIndex + 1;

      if (nextIndex >= PHASES_CONFIG.length) {
        safeAfter(1000, () => {
          setGamePhase('sarvada');
          const playMeaningLine = () => {
            playSceneLine?.('scene14_meaning', () => {
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
          };
          if (playWord) {
            playWord('sarvada', playMeaningLine);
          } else {
            playMeaningLine();
          }
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
    ganeshaFound,
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
            playSyllable?.('sarvada', syllable);
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
                {!ganeshaFound && (
                  <img
                    className={`sarvada-ganesha-hidden${hintLevel >= 3 ? ' is-guided hint-glow' : ''}`}
                    src={cfg.hiddenSymbol}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      left: `${cfg.ganeshaSpot.l}%`,
                      top: `${cfg.ganeshaSpot.t}%`,
                      width: `${cfg.ganeshaSpot.w}%`,
                    }}
                  />
                )}
                <button
                  className={`sarvada-ganesha-target${ganeshaFound ? ' is-found' : ''}`}
                  style={{
                    left: `${cfg.ganeshaSpot.l}%`,
                    top: `${cfg.ganeshaSpot.t}%`,
                    width: `${cfg.ganeshaSpot.w}%`,
                  }}
                  onPointerDown={handleGaneshaFound}
                  aria-label={`Find the hidden ${cfg.id} symbol`}
                />
                {popOut && (
                  <>
                    <div
                      className="sarvada-found-burst"
                      style={{ left: `${cfg.ganeshaSpot.l}%`, top: `${cfg.ganeshaSpot.t}%` }}
                    />
                    <img
                      className="sarvada-ganesha-pop"
                      src={cfg.hiddenSymbol}
                      alt=""
                      style={{ left: `${cfg.ganeshaSpot.l}%`, top: `${cfg.ganeshaSpot.t}%` }}
                    />
                    <div
                      className="sarvada-found-label"
                      style={{ left: `${cfg.ganeshaSpot.l}%`, top: `${cfg.ganeshaSpot.t}%` }}
                    >
                      {cfg.foundLabel}
                    </div>
                  </>
                )}
                {rescueHintActive && !ganeshaFound && (
                  <div
                    className="sarvada-ganesha-ring hint-glow"
                    style={{
                      left: `${cfg.ganeshaSpot.l}%`,
                      top: `${cfg.ganeshaSpot.t}%`,
                      width: `${cfg.ganeshaSpot.w}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
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
