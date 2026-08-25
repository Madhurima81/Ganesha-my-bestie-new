import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvakaryeshuGame.css';

import bgImg from './assets/images/sarvakaryeshu-bg.png';

import puzzleBeforeImg from './assets/images/sarvakaryeshu/puzzle-before.png';
import puzzleAfterImg from './assets/images/sarvakaryeshu/after-puzzle.png';
import sportsBeforeImg from './assets/images/sarvakaryeshu/before-sports.png';
import sportsAfterImg from './assets/images/sarvakaryeshu/after-sports.png';
import bikeBeforeImg from './assets/images/sarvakaryeshu/before-ride.png';
import bikeAfterImg from './assets/images/sarvakaryeshu/after-ride.png';
import grandmaBeforeImg from './assets/images/sarvakaryeshu/before-grandma.png';
import grandmaAfterImg from './assets/images/sarvakaryeshu/after-grandma.png';
import boatImg from './assets/images/boat.png';

import trunkIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import tuskIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-tusk-new.png';
import modakIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-modak-new.png';
import bellyIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-belly-new.png';
import lotusIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-lotus-new.png';
import eyesIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-eyes-new.png';

const SYLLABLES = ['Sar', 'va', 'kar', 'yeshu'];
const AUDIO = ['sar', 'va', 'kar', 'yeshu'];
const SYLLABLE_INDEX_BY_CHUNK = {
  SAR: 1,
  VA: 2,
  KAR: 3,
  YESHU: 4,
};

const SITUATIONS = [
  {
    id: 'trunk',
    before: puzzleBeforeImg,
    after: puzzleAfterImg,
    beforeLine: 'Oops! The painting went splat.',
    afterLine: 'The splat became something new!',
    question: 'Which symbol fits best?',
    voKeyBefore: 'scene13_puzzle',
    voKeyAfter: 'scene13_puzzle_after',
    correct: 'trunk',
    feedback: 'The Trunk helped him try another way!',
    syllableChunk: 'SAR',
    options: ['trunk', 'tusk', 'modak'],
    clues: [
      "Which symbol helps when one way doesn't work?",
      'Which symbol reminds you to bend, change, and try another way?',
      'Which long, bendy part of Ganesha can twist and turn?',
    ],
  },
  {
    id: 'belly',
    before: sportsBeforeImg,
    after: sportsAfterImg,
    beforeLine: 'Her feelings feel too big.',
    afterLine: 'She feels calmer inside.',
    question: 'Which symbol fits best?',
    voKeyBefore: 'scene13_sports',
    voKeyAfter: 'scene13_sports_after',
    correct: 'belly',
    feedback: 'The Belly helped her make room for her feelings!',
    syllableChunk: 'VA',
    options: ['belly', 'lotus', 'modak'],
    clues: [
      'Which symbol reminds you there is room for all your feelings?',
      'Which symbol can hold happy, sad, worried, and angry feelings too?',
      'Which big part of Ganesha can hold so much inside?',
    ],
  },
  {
    id: 'eyes',
    before: bikeBeforeImg,
    after: bikeAfterImg,
    beforeLine: 'Where did the toy go?',
    afterLine: 'She spotted the clue!',
    question: 'Which symbol fits best?',
    voKeyBefore: 'scene13_bike',
    voKeyAfter: 'scene13_bike_after',
    correct: 'eyes',
    feedback: 'The Eyes helped her notice what others missed!',
    syllableChunk: 'KAR',
    options: ['eyes', 'modak', 'belly'],
    clues: [
      'Which symbol helps you notice what matters?',
      'Which symbol reminds you to look carefully and spot what others may miss?',
      'Which part of Ganesha helps him see?',
    ],
  },
  {
    id: 'tusk',
    before: grandmaBeforeImg,
    after: grandmaAfterImg,
    beforeLine: 'So many things are distracting him.',
    afterLine: 'He stayed with what mattered.',
    question: 'Which symbol fits best?',
    voKeyBefore: 'scene13_grandma',
    voKeyAfter: 'scene13_grandma_after',
    correct: 'tusk',
    feedback: 'The Tusk helped him stay focused on what mattered!',
    syllableChunk: 'YESHU',
    options: ['tusk', 'eyes', 'trunk'],
    clues: [
      'Which symbol reminds you to stay with what is important?',
      'Which symbol reminds you to stay strong and focused, even when something is difficult?',
      'Which strong white part does Ganesha have only one of?',
    ],
  },
];

const POWER_ICONS = {
  trunk: { img: trunkIcon, label: 'Trunk', color: '#9C6FD6' },
  tusk: { img: tuskIcon, label: 'Tusk', color: '#F2B94B' },
  modak: { img: modakIcon, label: 'Modak', color: '#E07B3A' },
  belly: { img: bellyIcon, label: 'Belly', color: '#F48FB1' },
  lotus: { img: lotusIcon, label: 'Lotus', color: '#D86ACB' },
  eyes: { img: eyesIcon, label: 'Eyes', color: '#57A6D9' },
};

export default function SarvakaryeshuGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
  voiceGuidance = {},
}) {
  const { playVoice: playSceneLine, playSyllable, stopVoice: stopSceneVoice } = voiceGuidance;
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAfter, setShowAfter] = useState(false);
  const [canPick, setCanPick] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [phase, setPhase] = useState('play');
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [guidedPowerId, setGuidedPowerId] = useState(null);
  const [rescueHintActive, setRescueHintActive] = useState(false);
  const [flyingPower, setFlyingPower] = useState(null);
  const [imageHit, setImageHit] = useState(false);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const phaseRef = useRef('play');
  const resolvingRef = useRef(false);
  const optionRefs = useRef({});
  const imageWrapRef = useRef(null);
  const lastHintVoiceKeyRef = useRef(null);
  phaseRef.current = phase;

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && canPick,
    stageKey: isActive ? `card-${cardIndex}` : null,
    initialDelay: 7000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1800,
    level2Delay: 14000,
    level3Delay: 21000,
  });

  useEffect(() => {
    if (!isActive || phase !== 'play' || isCorrect) {
      setGuidedPowerId(null);
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;
      return;
    }

    if (hintLevel === 0) {
      setGuidedPowerId(null);
      setRescueHintActive(false);
      lastHintVoiceKeyRef.current = null;
      return;
    }

    const situation = SITUATIONS[cardIndex];

    if (hintLevel < 3) {
      setGuidedPowerId(null);
    }

    const hintVoiceKey = `scene13_hint_${situation.id}_${hintLevel}`;
    if (lastHintVoiceKeyRef.current !== hintVoiceKey) {
      lastHintVoiceKeyRef.current = hintVoiceKey;
      let glowTimerId = null;
      const timerId = window.setTimeout(() => {
        playSceneLine?.(
          hintVoiceKey,
          // At hint level 3, wait until the VO actually finishes, then glow
          // the correct symbol 1.8s after that — not on a guessed delay.
          hintLevel >= 3
            ? () => {
                glowTimerId = window.setTimeout(() => {
                  setGuidedPowerId(situation.correct);
                }, 1800);
              }
            : undefined,
          {
            replayOnReturn: false,
            minDelayAfterVoiceMs: 5000,
          }
        );
      }, 120);
      return () => {
        window.clearTimeout(timerId);
        if (glowTimerId) window.clearTimeout(glowTimerId);
      };
    }
  }, [cardIndex, hintLevel, isActive, isCorrect, phase, playSceneLine]);

  useEffect(() => {
    if (!isActive || phase !== 'play' || hintLevel < 3 || isCorrect) {
      setRescueHintActive(false);
      return undefined;
    }

    const id = window.setTimeout(() => {
      setRescueHintActive(true);
    }, 7000);

    return () => window.clearTimeout(id);
  }, [cardIndex, hintLevel, isActive, isCorrect, phase]);

  const safeAfter = useCallback((ms, fn) => {
    const id = window.setTimeout(fn, ms);
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
      setCardIndex(0);
      setPicked(null);
      setIsCorrect(null);
      setShowAfter(false);
      setCanPick(false);
      setLitCount(0);
      setPhase('play');
      setGuidanceMessage('');
      setGuidedPowerId(null);
      setRescueHintActive(false);
      setFlyingPower(null);
      setImageHit(false);
      lastHintVoiceKeyRef.current = null;
      doneCalledRef.current = false;
      resolvingRef.current = false;
      phaseRef.current = 'play';
      return;
    }
    return clearTimers;
  }, [isActive, clearTimers, safeAfter, playSceneLine]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return undefined;
    const s = SITUATIONS[cardIndex];
    setShowAfter(false);
    setCanPick(false);

    let cancelled = false;
    const fallbacks = [];
    const addFallback = (ms, fn) => {
      const id = window.setTimeout(fn, ms);
      fallbacks.push(id);
      return id;
    };

    const t1 = window.setTimeout(() => {
      if (cancelled) return;
      const pickFallback = addFallback(2500, () => {
        if (!cancelled) setCanPick(true);
      });
      playSceneLine?.(s.voKeyBefore, () => {
        window.clearTimeout(pickFallback);
        if (!cancelled) setCanPick(true);
      });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      fallbacks.forEach((id) => window.clearTimeout(id));
    };
  }, [isActive, cardIndex, phase, playSceneLine]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handlePick = useCallback((powerId) => {
    if (isPaused || phaseRef.current !== 'play' || resolvingRef.current || !canPick) return;

    const situation = SITUATIONS[cardIndex];
    const correct = powerId === situation.correct;

    stopSceneVoice?.();
    setPicked(powerId);
    markInteraction();

    if (!correct) {
      setIsCorrect(null);
      setGuidanceMessage('Try another symbol.');
      playSceneLine?.('scene13_try_again');
      return;
    }

    resolvingRef.current = true;
    setIsCorrect(true);
    setGuidanceMessage('');
    setGuidedPowerId(null);

    const nextLit = SYLLABLE_INDEX_BY_CHUNK[situation.syllableChunk] ?? (cardIndex + 1);
    safeAfter(250, () => setLitCount(nextLit));

    const optionRect = optionRefs.current[powerId]?.getBoundingClientRect?.();
    const imageRect = imageWrapRef.current?.getBoundingClientRect?.();

    // Symbol flies to the centre of the card (the image area) — the flight
    // itself takes ~1000ms (see .flying-power in the CSS), so the After
    // reveal is timed to land right as the symbol arrives, not before.
    safeAfter(500, () => {
      if (optionRect && imageRect) {
        setFlyingPower({
          img: POWER_ICONS[powerId].img,
          left: optionRect.left + (optionRect.width / 2),
          top: optionRect.top + (optionRect.height / 2),
          flyX: (imageRect.left + (imageRect.width / 2)) - (optionRect.left + (optionRect.width / 2)),
          flyY: (imageRect.top + (imageRect.height / 2)) - (optionRect.top + (optionRect.height / 2)),
        });
      }
    });

    safeAfter(1500, () => {
      setImageHit(true);
      setShowAfter(true);
      setFlyingPower(null);
      window.setTimeout(() => onMicroWin?.(), 0);
    });

    safeAfter(1750, () => {
      playSceneLine?.(situation.voKeyAfter);
    });

    // Hold on the After image for a couple of seconds before advancing —
    // gives the child time to actually see and register the result.
    const nextIndex = cardIndex + 1;

    if (nextIndex >= SITUATIONS.length) {
      safeAfter(4200, () => {
        setLitCount(SITUATIONS.length);
        const finishPhase = () => {
          if (doneCalledRef.current) return;
          doneCalledRef.current = true;
          setPhase('done');
          safeAfter(700, () => {
            window.setTimeout(() => {
              onGameComplete?.();
              onPhaseComplete?.();
            }, 0);
          });
        };
        finishPhase();
      });
      return;
    }

    safeAfter(4200, () => {
      setCardIndex(nextIndex);
      setPicked(null);
      setIsCorrect(null);
      setShowAfter(false);
      setCanPick(false);
      setGuidanceMessage('');
      setGuidedPowerId(null);
      setRescueHintActive(false);
      setFlyingPower(null);
      setImageHit(false);
      lastHintVoiceKeyRef.current = null;
      resolvingRef.current = false;
    });
  }, [canPick, cardIndex, isPaused, markInteraction, onGameComplete, onMicroWin, onPhaseComplete, playSceneLine, safeAfter, stopSceneVoice]);

  if (!isActive) return null;

  const situation = SITUATIONS[cardIndex];
  return (
    <div className={`sarva-game${hideElements ? ' is-hidden' : ''}`}>
      <div className="sarva-stage" style={{ backgroundImage: `url(${bgImg})` }}>
        <div className="sarva-boat" aria-hidden="true">
          <img src={boatImg} alt="" draggable={false} />
        </div>

        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            playSyllable?.('sarvakaryeshu', syllable);
          }}
        />

        {phase === 'done' && (
          <p className="sarva-doneline">Ganesha's lessons can help in many moments!</p>
        )}

        {phase === 'play' && (
          <div className={`sarva-card${isCorrect ? ' is-correct' : ''}`} key={situation.id}>
            <div
              ref={imageWrapRef}
              className={`sarva-card-img-wrap${imageHit ? ' power-hit' : ''}${showAfter ? ' is-after-reveal' : ''}`}
            >
              {showAfter && <div className="sarva-after-badge">After</div>}
              <img
                className={`sarva-card-img${showAfter ? ' is-after' : ''}`}
                src={showAfter ? situation.after : situation.before}
                alt={situation.id}
                draggable={false}
              />
            </div>

            <p className="sarva-situation">{showAfter ? situation.afterLine : situation.beforeLine}</p>
            {situation.question && !showAfter && (
              <p className="sarva-question">{situation.question}</p>
            )}
            {canPick && (
              <div className="sarva-options">
                {situation.options.map((powerId) => {
                  const power = POWER_ICONS[powerId];
                  const isRight = picked === powerId && isCorrect;
                  const isSelected = picked === powerId;
                  const isWrong = picked === powerId && picked !== null && !isCorrect;
                  const isGuided = guidedPowerId === powerId;
                  const isHintGlow = isGuided && hintLevel >= 3;
                  const isRescueDimmed = rescueHintActive && guidedPowerId && powerId !== guidedPowerId;

                  return (
                    <button
                      key={powerId}
                      ref={(node) => { optionRefs.current[powerId] = node; }}
                      className={`sarva-option${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}${isSelected ? ' is-selected' : ''}${isGuided ? ' is-guided' : ''}${isHintGlow ? ' hint-glow' : ''}${isRescueDimmed ? ' is-rescue-dimmed' : ''}${isCorrect && picked && !isRight ? ' is-dimmed' : ''}`}
                      style={{ '--power-color': power.color }}
                      onPointerDown={() => handlePick(powerId)}
                      aria-label={power.label}
                    >
                      <div className="sarva-option-circle">
                        <img src={power.img} alt={power.label} draggable={false} />
                      </div>
                      <span className="sarva-option-label">{power.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {guidanceMessage && !isCorrect && (
              <p className="sarva-feedback is-visible is-gentle">{guidanceMessage}</p>
            )}

            {isCorrect && (
              <p className="sarva-feedback is-visible">{situation.feedback}</p>
            )}
          </div>
        )}

        {flyingPower && (
          <img
            className="flying-power"
            src={flyingPower.img}
            alt=""
            aria-hidden="true"
            style={{
              left: `${flyingPower.left}px`,
              top: `${flyingPower.top}px`,
              '--fly-x': `${flyingPower.flyX}px`,
              '--fly-y': `${flyingPower.flyY}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}
