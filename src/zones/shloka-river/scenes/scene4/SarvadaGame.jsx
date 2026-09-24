import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
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
    foundLabel: 'You found Mooshika!',
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
    foundLabel: 'You found the Trunk!',
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
    foundLabel: 'You found the Lotus!',
    clues: [
      'Look for a symbol that stays peaceful even when things around it are messy.',
      'A flower shape is hiding somewhere near the bed.',
      'Look at the bedside lamp for the lotus.',
    ],
    symbolSpot: { l: 86, t: 46, w: 10 },
  },
];

const POSE_ASSETS = [
  morningBg,
  afternoonBg,
  nightBg,
  boatImg,
  ganeshaPopImg,
  mooshikaSymbolImg,
  trunkSymbolImg,
  lotusSymbolImg,
  morningBubbleImg,
  afternoonBubbleImg,
  nightBubbleImg,
  morningSceneImg,
  afternoonSceneImg,
  nightSceneImg,
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
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, stopVoice: stopSceneVoice, playWord, playSyllable } = voiceGuidance;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [bubbleState, setBubbleState] = useState('idle');
  const [showMemory, setShowMemory] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [revealedSyls, setRevealedSyls] = useState([]);
  const [gamePhase, setGamePhase] = useState('intro');
  const [flash, setFlash] = useState(false);
  const [findMode, setFindMode] = useState(false);
  // GMB Hint Standard v1: gates the ladder below until the "find the symbol"
  // VO (scene14_find_symbol) has actually finished, not just findMode flipping.
  const [findVoComplete, setFindVoComplete] = useState(true);
  const [symbolFound, setSymbolFound] = useState(false);
  const [popOut, setPopOut] = useState(false);
  const [boatGaneshaVisible, setBoatGaneshaVisible] = useState(false);
  const [boatGaneshaJoining, setBoatGaneshaJoining] = useState(false);
  const [boatGaneshaCelebrating, setBoatGaneshaCelebrating] = useState(false);
  const lastHintVoiceKeyRef = useRef(null);

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

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const completeCalledRef = useRef(false);

  // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
  // The 8s gap between L2 and L3 still clears playSceneLine's own
  // minDelayAfterVoiceMs: 5000 spacing between hint VO lines.
  const { hintLevel, markInteraction, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && findMode && findVoComplete && !symbolFound && !showDebugPanel,
    stageKey: isActive && findMode ? `find-${phaseIndex}` : null,
    initialDelay: 10000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1400,
    level2Delay: 18000,
    level3Delay: 26000,
  });

  // L1 is visual-only (a broad search-area cue — see sarvada-search-hint
  // below). Only L2 (narrower area + clue) and L3 (exact ring + final clue)
  // speak.
  useEffect(() => {
    if (!isActive || !findMode || symbolFound || hintLevel < 2) {
      lastHintVoiceKeyRef.current = null;
      return;
    }

    const cfg = PHASES_CONFIG[phaseIndex];
    const hintVoiceKey = `scene14_hint_${cfg.id}_${hintLevel}`;
    if (lastHintVoiceKeyRef.current === hintVoiceKey) return;

    lastHintVoiceKeyRef.current = hintVoiceKey;
    const timerId = window.setTimeout(() => {
      playSceneLine?.(hintVoiceKey, hintLevel === 2 ? markLevel2VoiceEnded : undefined, {
        replayOnReturn: false,
        minDelayAfterVoiceMs: 5000,
      });
    }, 120);
    return () => window.clearTimeout(timerId);
  }, [findMode, symbolFound, hintLevel, isActive, phaseIndex, playSceneLine, markLevel2VoiceEnded]);

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
      setFlash(false);
      setFindMode(false);
      setSymbolFound(false);
      setPopOut(false);
      setFlySymbol(null);
      setBoatGaneshaVisible(false);
      setBoatGaneshaJoining(false);
      setBoatGaneshaCelebrating(false);
      lastHintVoiceKeyRef.current = null;
      doneCalledRef.current = false;
      completeCalledRef.current = false;
      return;
    }
    safeAfter(700, () => {
      playSceneLine?.('scene14_intro');
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
        setFindVoComplete(false);
        lastHintVoiceKeyRef.current = null;

        // Defensive: if audio is off, playSceneLine is missing, or its
        // completion callback is dropped, findVoComplete must not stay
        // false forever — that would permanently block the hint ladder.
        let findVoFinished = false;
        const finishFindVo = () => {
          if (findVoFinished) return;
          findVoFinished = true;
          setFindVoComplete(true);
        };

        if (playSceneLine) {
          playSceneLine('scene14_find_symbol', finishFindVo);
          safeAfter(4500, finishFindVo);
        } else {
          finishFindVo();
        }
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

    setSymbolFound(true);
    setPopOut(true);
    markInteraction();
    window.setTimeout(() => onMicroWin?.(), 0);

    // The syllable lights (and its audio fires via SyllableHighlight's
    // onSyllableLit) the moment the flying symbol reaches the tile — see
    // the .sarvada-fly-symbol onAnimationEnd handler. Fly runs ~1.5s.

    safeAfter(3400, () => {
      setPopOut(false);
      setBubbleState('bursting');
      setFlash(true);
      safeAfter(650, () => setFlash(false));
      setShowMemory(false);
      setFindMode(false);
      setSymbolFound(false);
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
            if (doneCalledRef.current) return;
            doneCalledRef.current = true;
            setGamePhase('done');

            const finish = () => {
              if (completeCalledRef.current) return;
              completeCalledRef.current = true;
              onGameComplete?.();
              onPhaseComplete?.();
            };

            // Full word "sarvada" → closing line (meaning is embedded in the
            // line itself), then hand off. Fallback timer covers muted
            // audio / missing callbacks.
            playWord?.('sarvada', () => {
              playSceneLine?.('scene14_success', finish);
            });
            safeAfter(9000, finish);
          });
        });
      } else {
        safeAfter(600, () => {
          setPhaseIndex(nextIndex);
          setGamePhase('transition');
          setBubbleState('idle');
          safeAfter(500, () => {
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
      // A miss simply does nothing — for a visual-search game, a whole-image
      // shake on every wrong guess is too much punishment for exploring.
      if (Math.hypot(dx, dy) <= s.w / 2) {
        triggerFound(event.clientX, event.clientY);
      }
    },
    [findMode, symbolFound, isPaused, spots, phaseIndex, triggerFound],
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
  const isPlaying = gamePhase === 'playing' || gamePhase === 'transition';
  const showSarvada = gamePhase === 'sarvada' || gamePhase === 'done';

  // L1 = broad vicinity, L2 = narrower vicinity, L3 = exact ring (rendered
  // separately below) — a visual-search game needs a search AREA, not a
  // brighter symbol (the hidden symbol is baked into the scene image, not
  // its own element).
  const searchHintStyle = (() => {
    if (!findMode || symbolFound || hintLevel < 1 || hintLevel >= 3) return null;
    const scale = hintLevel === 1 ? 2.8 : 1.8;
    return {
      left: `${spot.l}%`,
      top: `${spot.t}%`,
      width: `${Math.min(38, spot.w * scale)}%`,
      height: `${Math.min(34, spot.w * scale)}%`,
    };
  })();
  return (
    <div className={`sarvada-game${hideElements ? ' is-hidden' : ''}${flash ? ' flash' : ''}`} onContextMenu={(e) => e.preventDefault()}>
      <PoseImage
        className={`sarvada-bg${gamePhase === 'transition' ? ' zoom-in' : ''}`}
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
              {findMode && showDebugPanel && showZones && (
                <div className="sarvada-zone-outline" style={zoneStyle(spot)} />
              )}
              {/* L1/L2 — a broad, then narrower search area, not the exact
                  location. L3 — the exact ring, which stays until found. */}
              {searchHintStyle && (
                <div
                  className={`sarvada-search-hint${hintLevel === 2 ? ' is-narrower' : ''}`}
                  style={searchHintStyle}
                />
              )}
              {findMode && hintLevel >= 3 && !symbolFound && (
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
          <div className="sarvada-story">Morning, afternoon, night — always.</div>
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
            setRevealedSyls((prev) =>
              prev.includes(cfgNow.syllable) ? prev : [...prev, cfgNow.syllable],
            );
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
                ? `Editing: ${cfg.label}. Tap the memory bubble on each phase to line up its zone.`
                : 'Tap the memory bubble to open the image and see the zone.'}
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
