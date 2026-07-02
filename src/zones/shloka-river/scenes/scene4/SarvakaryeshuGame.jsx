import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvakaryeshuGame.css';

import bgImg from './assets/images/sarvakaryeshu-bg.png';

import puzzleBeforeImg from './assets/images/sarvakaryeshu/puzzle-before.png';
import puzzleAfterImg from './assets/images/sarvakaryeshu/after-puzzle.png';
import sportsBeforeImg from './assets/images/sarvakaryeshu/before-sports.png';
import sportsAfterImg from './assets/images/sarvakaryeshu/after-sports.png';
import bikeBeforeImg from './assets/images/sarvakaryeshu/after-ride.png';
import bikeAfterImg from './assets/images/sarvakaryeshu/before-ride.png';
import grandmaBeforeImg from './assets/images/sarvakaryeshu/before-grandma.png';
import grandmaAfterImg from './assets/images/sarvakaryeshu/after-grandma.png';
import boatImg from './assets/images/boat.png';

import vakratundaIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import mahakayaIcon from '../../../../zones/meaning cave/assets/images/symbols/mahakaya-symbol.png';
import samaprabhaIcon from '../../../../zones/meaning cave/assets/images/symbols/samaprabha-symbol.png';
import kurumedevaIcon from '../../../../zones/meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import nirvighnamIcon from '../../../../zones/meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import suryakotiIcon from '../../../../zones/meaning cave/assets/images/symbols/suryakoti-symbol.png';

const SYLLABLES = ['Sar', 'va', 'kar', 'ye', 'shu'];

const SITUATIONS = [
  {
    id: 'puzzle',
    before: puzzleBeforeImg,
    after: puzzleAfterImg,
    situation: "The puzzle piece won't fit.",
    voKey: 'scene13_puzzle',
    correct: 'vakratunda',
    feedback: 'You tried another way and it fit!',
    syllableChunk: 'SAR',
    options: ['vakratunda', 'mahakaya', 'samaprabha', 'kurumedeva'],
  },
  {
    id: 'sports',
    before: sportsBeforeImg,
    after: sportsAfterImg,
    situation: 'I want to give up.',
    voKey: 'scene13_sports',
    correct: 'mahakaya',
    feedback: 'You stayed strong and kept trying!',
    syllableChunk: 'VA',
    options: ['vakratunda', 'mahakaya', 'nirvighnam', 'kurumedeva'],
  },
  {
    id: 'bike',
    before: bikeBeforeImg,
    after: bikeAfterImg,
    situation: 'We both want the bike.',
    voKey: 'scene13_bike',
    correct: 'samaprabha',
    feedback: 'You shared and both were happy!',
    syllableChunk: 'KAR',
    options: ['mahakaya', 'samaprabha', 'suryakoti', 'kurumedeva'],
  },
  {
    id: 'grandma',
    before: grandmaBeforeImg,
    after: grandmaAfterImg,
    situation: 'Grandma needs help with the bags.',
    voKey: 'scene13_grandma',
    correct: 'kurumedeva',
    feedback: 'You helped and Grandma smiled!',
    syllableChunk: 'YESHU',
    options: ['vakratunda', 'mahakaya', 'samaprabha', 'kurumedeva'],
  },
];

const POWER_ICONS = {
  vakratunda: { img: vakratundaIcon, label: 'Vakratunda', color: '#9C6FD6' },
  mahakaya: { img: mahakayaIcon, label: 'Mahakaya', color: '#E07B3A' },
  samaprabha: { img: samaprabhaIcon, label: 'Samaprabha', color: '#F9B7D2' },
  kurumedeva: { img: kurumedevaIcon, label: 'Kurumedeva', color: '#7B9ED9' },
  nirvighnam: { img: nirvighnamIcon, label: 'Nirvighnam', color: '#6DBF67' },
  suryakoti: { img: suryakotiIcon, label: 'Suryakoti', color: '#EF9F27' },
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
  const { playVoice: playSceneLine } = voiceGuidance;
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAfter, setShowAfter] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [phase, setPhase] = useState('play');
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [guidedPowerId, setGuidedPowerId] = useState(null);
  const [flyingPower, setFlyingPower] = useState(null);
  const [imageHit, setImageHit] = useState(false);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const phaseRef = useRef('play');
  const resolvingRef = useRef(false);
  const optionRefs = useRef({});
  const imageWrapRef = useRef(null);
  phaseRef.current = phase;

  const { hintLevel, pulseTick, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: isActive ? `card-${cardIndex}` : null,
    initialDelay: 8500,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1500,
    level2Delay: 16000,
    level3Delay: 23000,
  });

  useEffect(() => {
    if (!isActive || phase !== 'play' || isCorrect) {
      setGuidedPowerId(null);
      return;
    }

    if (hintLevel === 0 && picked === null) {
      setGuidedPowerId(null);
      return;
    }

    setGuidedPowerId(SITUATIONS[cardIndex].correct);
  }, [cardIndex, hintLevel, isActive, isCorrect, phase, picked, guidanceMessage]);

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
      setLitCount(0);
      setPhase('play');
      setGuidanceMessage('');
      setGuidedPowerId(null);
      setFlyingPower(null);
      setImageHit(false);
      doneCalledRef.current = false;
      resolvingRef.current = false;
      phaseRef.current = 'play';
      return;
    }
    return clearTimers;
  }, [isActive, clearTimers, safeAfter, playSceneLine]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return undefined;
    const currentSituation = SITUATIONS[cardIndex];
    if (!currentSituation?.voKey) return undefined;

    const timer = window.setTimeout(() => {
      playSceneLine?.(currentSituation.voKey);
    }, 700);

    return () => clearTimeout(timer);
  }, [isActive, cardIndex, phase, playSceneLine]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handlePick = useCallback((powerId) => {
    if (isPaused || phaseRef.current !== 'play' || resolvingRef.current) return;

    const situation = SITUATIONS[cardIndex];
    const correct = powerId === situation.correct;

    setPicked(powerId);
    markInteraction();

    if (!correct) {
      setIsCorrect(null);
      setGuidanceMessage('That power could help too...');
      return;
    }

    resolvingRef.current = true;
    setIsCorrect(true);
    setGuidanceMessage('');
    setGuidedPowerId(null);

    const optionRect = optionRefs.current[powerId]?.getBoundingClientRect?.();
    const imageRect = imageWrapRef.current?.getBoundingClientRect?.();

    if (optionRect && imageRect) {
      setFlyingPower({
        img: POWER_ICONS[powerId].img,
        left: optionRect.left + (optionRect.width / 2),
        top: optionRect.top + (optionRect.height / 2),
        flyX: (imageRect.left + (imageRect.width / 2)) - (optionRect.left + (optionRect.width / 2)),
        flyY: (imageRect.top + (imageRect.height / 2)) - (optionRect.top + (optionRect.height / 2)),
      });
    }

    safeAfter(420, () => {
      setImageHit(true);
      window.setTimeout(() => onMicroWin?.(), 0);
    });

    safeAfter(1800, () => {
      setFlyingPower(null);
    });

    safeAfter(1950, () => {
      setShowAfter(true);
    });

    const nextLit = cardIndex + 1;
    safeAfter(2200, () => setLitCount(nextLit));

    const nextIndex = cardIndex + 1;

    if (nextIndex >= SITUATIONS.length) {
      safeAfter(3100, () => {
        setLitCount(SITUATIONS.length);
        safeAfter(600, () => {
          if (doneCalledRef.current) return;
          doneCalledRef.current = true;
          setPhase('done');
          safeAfter(700, () => {
            window.setTimeout(() => {
              onGameComplete?.();
              onPhaseComplete?.();
            }, 0);
          });
        });
      });
      return;
    }

    safeAfter(3300, () => {
      setCardIndex(nextIndex);
      setPicked(null);
      setIsCorrect(null);
      setShowAfter(false);
      setGuidanceMessage('');
      setGuidedPowerId(null);
      setFlyingPower(null);
      setImageHit(false);
      resolvingRef.current = false;
    });
  }, [cardIndex, isPaused, markInteraction, onGameComplete, onMicroWin, onPhaseComplete, safeAfter]);

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
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />

        {phase === 'done' && (
          <p className="sarva-doneline">Ganesha helps in all things!</p>
        )}

        {phase === 'play' && (
          <div className={`sarva-card${isCorrect ? ' is-correct' : ''}`} key={situation.id}>
            <div ref={imageWrapRef} className={`sarva-card-img-wrap${imageHit ? ' power-hit' : ''}`}>
              <img
                className={`sarva-card-img${showAfter ? ' is-after' : ''}`}
                src={showAfter ? situation.after : situation.before}
                alt={situation.id}
                draggable={false}
              />
            </div>

            <p className="sarva-situation">{situation.situation}</p>
            <div className="sarva-options">
              {situation.options.map((powerId) => {
                const power = POWER_ICONS[powerId];
                const isRight = picked === powerId && isCorrect;
                const isSelected = picked === powerId;
                const isWrong = picked === powerId && picked !== null && !isCorrect;
                const isGuided = guidedPowerId === powerId;
                const isHintPulse = isGuided && hintLevel === 1;
                const isHintGlow = isGuided && (hintLevel >= 2 || (picked !== null && !isCorrect));

                return (
                  <button
                    key={powerId}
                    ref={(node) => { optionRefs.current[powerId] = node; }}
                    className={`sarva-option${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}${isSelected ? ' is-selected' : ''}${isGuided ? ' is-guided' : ''}${isHintPulse ? ` pulse pulse-${pulseTick}` : ''}${isHintGlow ? ' hint-glow' : ''}${isCorrect && picked && !isRight ? ' is-dimmed' : ''}`}
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
