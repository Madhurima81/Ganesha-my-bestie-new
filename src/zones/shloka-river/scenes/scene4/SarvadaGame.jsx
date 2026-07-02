import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvadaGame.css';

import morningBg from './assets/images/sarvada/morning.png';
import afternoonBg from './assets/images/sarvada/afternoon.png';
import nightBg from './assets/images/sarvada/night.png';

import boatImg from './assets/images/sarvada/boat.png';
import ganeshaImg from './assets/images/ganesha-hi-stand.png';

import puzzleBubbleImg from './assets/images/sarvada/puzzle-bubble.png';
import sportsBubbleImg from './assets/images/sarvada/sports-bubble.png';
import groceryBubbleImg from './assets/images/sarvada/gocery-bubble.png';

import morningSceneImg from './assets/images/sarvada/morning-scene.png';
import afternoonSceneImg from './assets/images/sarvada/afternoon-scene.png';
import nightSceneImg from './assets/images/sarvada/night-scene.png';

const SYLLABLES = ['Sar', 'va', 'da'];
const PHASE_VO_KEYS = ['scene14_morning', 'scene14_afternoon', 'scene14_night'];

const PHASES_CONFIG = [
  {
    id: 'morning',
    bg: morningBg,
    bubble: puzzleBubbleImg,
    scene: morningSceneImg,
    label: 'Morning',
    syllable: 'SAR',
    litCount: 1,
    timeColor: '#FFE066',
  },
  {
    id: 'afternoon',
    bg: afternoonBg,
    bubble: sportsBubbleImg,
    scene: afternoonSceneImg,
    label: 'Afternoon',
    syllable: 'VA',
    litCount: 2,
    timeColor: '#FFB347',
  },
  {
    id: 'night',
    bg: nightBg,
    bubble: groceryBubbleImg,
    scene: nightSceneImg,
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
  voiceGuidance = {},
}) {
  const { playVoice: playSceneLine } = voiceGuidance;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [bubbleState, setBubbleState] = useState('idle');
  const [showMemory, setShowMemory] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [revealedSyls, setRevealedSyls] = useState([]);
  const [gamePhase, setGamePhase] = useState('intro');
  const [prevBgSrc, setPrevBgSrc] = useState(null);
  const [prevBgOpacity, setPrevBgOpacity] = useState(1);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);

  const { markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && gamePhase !== 'done' && gamePhase !== 'sarvada',
    stageKey: isActive ? `bubble-${phaseIndex}` : null,
    initialDelay: 7000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1400,
    level2Delay: 15000,
    level3Delay: 22000,
  });

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

    markInteraction();
    setBubbleState('expanding');
    safeAfter(300, () => {
      setShowMemory(true);
      setBubbleState('memory');
      safeAfter(1500, () => {
        setBubbleState('bursting');
        setShowMemory(false);

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
            // Crossfade: capture outgoing bg, instantly switch to incoming bg behind it
            const outgoingSrc = PHASES_CONFIG[phaseIndex].bg;
            setPrevBgSrc(outgoingSrc);
            setPrevBgOpacity(1);
            setPhaseIndex(nextIndex);
            setGamePhase('transition');
            setBubbleState('idle');
            // Next frame: fade out the outgoing layer
            safeAfter(16, () => setPrevBgOpacity(0));
            // After fade, clean up and start next bubble
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
    startPhase,
  ]);

  if (!isActive) return null;

  const cfg = PHASES_CONFIG[phaseIndex];
  const isPlaying = gamePhase === 'playing' || gamePhase === 'transition';
  const showSarvada = gamePhase === 'sarvada' || gamePhase === 'done';
  return (
    <div className={`sarvada-game${hideElements ? ' is-hidden' : ''}`}>
      {/* Incoming bg — always fully visible */}
      <div
        className="sarvada-bg"
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
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />
      </div>

      {isPlaying && bubbleState !== 'done' && !showMemory && (
        <div
          className={`sarvada-bubble ${bubbleState}`}
          onPointerDown={handleBubbleTap}
          key={`bubble-${phaseIndex}`}
        >
          <img src={cfg.bubble} alt="memory bubble" draggable={false} />
        </div>
      )}

      {showMemory && (
        <div className="sarvada-memory" key={`memory-${phaseIndex}`}>
          <div className="sarvada-memory-inner">
            <img
              className="sarvada-memory-img"
              src={cfg.scene}
              alt="memory"
              draggable={false}
            />
            <img className="sarvada-ganesha-peek" src={ganeshaImg} alt="" draggable={false} />
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
