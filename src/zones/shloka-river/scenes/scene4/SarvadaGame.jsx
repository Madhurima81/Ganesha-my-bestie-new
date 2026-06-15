import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import './SarvadaGame.css';

import morningBg from './assets/images/sarvada/morning.png';
import afternoonBg from './assets/images/sarvada/afternoon.png';
import nightBg from './assets/images/sarvada/night.png';

import boatImg from './assets/images/sarvada/boat.png';

import puzzleBubbleImg from './assets/images/sarvada/puzzle-bubble.png';
import sportsBubbleImg from './assets/images/sarvada/sports-bubble.png';
import groceryBubbleImg from './assets/images/sarvada/gocery-bubble.png';

import puzzleBeforeImg from './assets/images/sarvakaryeshu/puzzle-before.png';
import puzzleAfterImg from './assets/images/sarvakaryeshu/after-puzzle.png';
import sportsBeforeImg from './assets/images/sarvakaryeshu/before-sports.png';
import sportsAfterImg from './assets/images/sarvakaryeshu/after-sports.png';
import grandmaBeforeImg from './assets/images/sarvakaryeshu/before-grandma.png';
import grandmaAfterImg from './assets/images/sarvakaryeshu/after-grandma.png';

const SYLLABLES = ['Sar', 'va', 'da'];

const PHASES_CONFIG = [
  {
    id: 'morning',
    bg: morningBg,
    bubble: puzzleBubbleImg,
    before: puzzleBeforeImg,
    after: puzzleAfterImg,
    label: 'Morning',
    syllable: 'SAR',
    litCount: 1,
    timeColor: '#FFE066',
  },
  {
    id: 'afternoon',
    bg: afternoonBg,
    bubble: sportsBubbleImg,
    before: sportsBeforeImg,
    after: sportsAfterImg,
    label: 'Afternoon',
    syllable: 'VA',
    litCount: 2,
    timeColor: '#FFB347',
  },
  {
    id: 'night',
    bg: nightBg,
    bubble: groceryBubbleImg,
    before: grandmaBeforeImg,
    after: grandmaAfterImg,
    label: 'Night',
    syllable: 'DA',
    litCount: 3,
    timeColor: '#B39DDB',
  },
];

export default function SarvadaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [bubbleState, setBubbleState] = useState('idle');
  const [showMemory, setShowMemory] = useState(false);
  const [memoryFlipped, setMemoryFlipped] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [revealedSyls, setRevealedSyls] = useState([]);
  const [gamePhase, setGamePhase] = useState('intro');
  const [bgOpacity, setBgOpacity] = useState(1);
  const [nextBgIndex, setNextBgIndex] = useState(null);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);

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
    setBgOpacity(0);
    safeAfter(400, () => {
      setBgOpacity(1);
      setBubbleState('pulsing');
    });
  }, [safeAfter]);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setPhaseIndex(0);
      setBubbleState('idle');
      setShowMemory(false);
      setMemoryFlipped(false);
      setLitCount(0);
      setRevealedSyls([]);
      setGamePhase('intro');
      setBgOpacity(1);
      setNextBgIndex(null);
      doneCalledRef.current = false;
    }
  }, [isActive, clearTimers]);

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

    setBubbleState('expanding');
    safeAfter(300, () => {
      setShowMemory(true);
      setBubbleState('memory');
      safeAfter(1200, () => {
        setMemoryFlipped(true);
        safeAfter(1200, () => {
          setBubbleState('bursting');
          setShowMemory(false);
          setMemoryFlipped(false);

          const cfg = PHASES_CONFIG[phaseIndex];
          setLitCount(cfg.litCount);
          window.setTimeout(() => onMicroWin?.(), 0);
          setRevealedSyls((prev) => [...prev, cfg.syllable]);

          const nextIndex = phaseIndex + 1;

          if (nextIndex >= PHASES_CONFIG.length) {
            safeAfter(1000, () => {
              setGamePhase('sarvada');
              safeAfter(2200, () => {
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
              setGamePhase('transition');
              setNextBgIndex(nextIndex);
              setBgOpacity(0);
              safeAfter(500, () => {
                setPhaseIndex(nextIndex);
                setBgOpacity(1);
                setNextBgIndex(null);
                setBubbleState('idle');
                setGamePhase('playing');
                startPhase();
              });
            });
          }
        });
      });
    });
  }, [
    bubbleState,
    isPaused,
    onMicroWin,
    onGameComplete,
    onPhaseComplete,
    phaseIndex,
    safeAfter,
    startPhase,
  ]);

  if (!isActive) return null;

  const cfg = PHASES_CONFIG[phaseIndex];
  const isPlaying = gamePhase === 'playing' || gamePhase === 'transition';
  const showSarvada = gamePhase === 'sarvada' || gamePhase === 'done';

  return (
    <div className={`sarvada-game${hideElements ? ' is-hidden' : ''}`}>
      <div
        className="sarvada-bg"
        style={{
          backgroundImage: `url(${cfg.bg})`,
          opacity: bgOpacity,
          transition: 'opacity 0.4s ease',
        }}
      />

      <div className="sarvada-syl-wrap">
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />
      </div>

      {isPlaying && (
        <div className="sarvada-time-label" style={{ color: cfg.timeColor }} key={cfg.id}>
          {cfg.label}
        </div>
      )}

      {isPlaying && bubbleState !== 'done' && !showMemory && (
        <div
          className={`sarvada-bubble ${bubbleState}`}
          onPointerDown={handleBubbleTap}
          key={`bubble-${phaseIndex}`}
        >
          <img src={cfg.bubble} alt="memory bubble" draggable={false} />
          {bubbleState === 'pulsing' && <div className="sarvada-bubble-hint">Tap!</div>}
        </div>
      )}

      {showMemory && (
        <div className="sarvada-memory" key={`memory-${phaseIndex}`}>
          <div className="sarvada-memory-inner">
            <img
              className={`sarvada-memory-img${memoryFlipped ? ' is-after' : ''}`}
              src={memoryFlipped ? cfg.after : cfg.before}
              alt="memory"
              draggable={false}
            />
            {!memoryFlipped && <div className="sarvada-memory-arrow">↓</div>}
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
      </div>
    </div>
  );
}
