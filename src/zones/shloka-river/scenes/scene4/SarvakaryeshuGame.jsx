import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import './SarvakaryeshuGame.css';

import bgImg from './assets/images/sarvakaryeshu-bg.webp';

import mooshikaBeforeImg from './assets/images/sarvakaryeshu/mooshika-before.png';
import mooshikaAfterImg from './assets/images/sarvakaryeshu/mooshika-after.png';
import eyesBeforeImg from './assets/images/sarvakaryeshu/eyes-before.png';
import eyesAfterImg from './assets/images/sarvakaryeshu/eyes-after.png';
import trunkBeforeImg from './assets/images/sarvakaryeshu/trunk-before.png';
import trunkAfterImg from './assets/images/sarvakaryeshu/trunk-after.png';
import tuskBeforeImg from './assets/images/sarvakaryeshu/tusk-before.png';
import tuskAfterImg from './assets/images/sarvakaryeshu/tusk-after.png';
import boatImg from './assets/images/boat.webp';

import trunkIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import tuskIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-tusk-new.png';
import modakIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-modak-new.png';
import mooshikaIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-mooshika-new.png';
import eyesIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-eyes-new.png';
import earsIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-ears-new.png';

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
    id: 'mooshika',
    before: mooshikaBeforeImg,
    after: mooshikaAfterImg,
    beforeLine: 'So much to do.',
    afterLine: 'Mooshika helped him begin with one small thing.',
    question: 'Which Ganesha power can help?',
    voKeyBefore: 'scene13_puzzle',
    voKeyAfter: 'scene13_puzzle_after',
    correct: 'mooshika',
    feedback: 'Mooshika helped him begin with one small thing.',
    syllableChunk: 'SAR',
    options: ['mooshika', 'modak', 'eyes'],
    clues: [
      'Which symbol can help him start small?',
      'Which symbol reminds us to begin with one small thing?',
      'Which tiny friend takes one small step at a time?',
    ],
  },
  {
    id: 'eyes',
    before: eyesBeforeImg,
    after: eyesAfterImg,
    beforeLine: 'So many distractions.',
    afterLine: 'The Eyes helped him focus on what mattered.',
    question: 'Which Ganesha power can help?',
    voKeyBefore: 'scene13_sports',
    voKeyAfter: 'scene13_sports_after',
    correct: 'eyes',
    feedback: 'The Eyes helped him focus on what mattered.',
    syllableChunk: 'VA',
    options: ['eyes', 'mooshika', 'ears'],
    clues: [
      'Which symbol can help him focus?',
      'Which symbol helps us notice what matters?',
      'Which part of Ganesha helps him see clearly?',
    ],
  },
  {
    id: 'trunk',
    before: trunkBeforeImg,
    after: trunkAfterImg,
    beforeLine: 'Heavy here, gentle there.',
    afterLine: 'The Trunk helped him use strength, then gentleness.',
    question: 'Which Ganesha power can help?',
    voKeyBefore: 'scene13_bike',
    voKeyAfter: 'scene13_bike_after',
    correct: 'trunk',
    feedback: 'The Trunk helped him use strength, then gentleness.',
    syllableChunk: 'KAR',
    options: ['trunk', 'tusk', 'mooshika'],
    clues: [
      'Which symbol can help with strength and gentleness?',
      'Which symbol can be strong here and gentle there?',
      'Which long, bendy part of Ganesha can move with care?',
    ],
  },
  {
    id: 'tusk',
    before: tuskBeforeImg,
    after: tuskAfterImg,
    beforeLine: 'The crayon is broken.',
    afterLine: 'The Tusk reminded her that something broken can still help.',
    question: 'Which Ganesha power can help?',
    voKeyBefore: 'scene13_grandma',
    voKeyAfter: 'scene13_grandma_after',
    correct: 'tusk',
    feedback: 'The Tusk reminded her that something broken can still help.',
    syllableChunk: 'YESHU',
    options: ['tusk', 'modak', 'trunk'],
    clues: [
      'Which symbol reminds us broken things can still help?',
      'Which symbol helps when something broken can still be useful?',
      'Which part of Ganesha is broken but important?',
    ],
  },
];

const POWER_ICONS = {
  trunk: { img: trunkIcon, label: 'Trunk', color: '#9C6FD6' },
  tusk: { img: tuskIcon, label: 'Tusk', color: '#F2B94B' },
  modak: { img: modakIcon, label: 'Modak', color: '#E07B3A' },
  mooshika: { img: mooshikaIcon, label: 'Mooshika', color: '#8D6E63' },
  eyes: { img: eyesIcon, label: 'Eyes', color: '#57A6D9' },
  ears: { img: earsIcon, label: 'Ears', color: '#7CB342' },
};

const POSE_ASSETS = [
  bgImg,
  mooshikaBeforeImg,
  mooshikaAfterImg,
  eyesBeforeImg,
  eyesAfterImg,
  trunkBeforeImg,
  trunkAfterImg,
  tuskBeforeImg,
  tuskAfterImg,
  boatImg,
  trunkIcon,
  tuskIcon,
  modakIcon,
  mooshikaIcon,
  eyesIcon,
  earsIcon,
];

export default function SarvakaryeshuGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
  voiceGuidance = {},
}) {
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
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
  const [activeSyllableHit, setActiveSyllableHit] = useState(null);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const phaseRef = useRef('play');
  const resolvingRef = useRef(false);
  const optionRefs = useRef({});
  const imageWrapRef = useRef(null);
  const syllableAnchorRefs = useRef({});
  const syllableWrapRef = useRef(null);
  const lastHintVoiceKeyRef = useRef(null);
  phaseRef.current = phase;

  const getRectCenter = (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });

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
      setActiveSyllableHit(null);
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
    setPicked(null);
    setIsCorrect(null);
    setGuidanceMessage('');
    setGuidedPowerId(null);
    setRescueHintActive(false);
    setFlyingPower(null);
    setImageHit(false);
    setActiveSyllableHit(null);

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

    if (!correct) {
      setIsCorrect(null);
      setGuidanceMessage('Try another symbol.');
      playSceneLine?.('scene13_try_again');
      return;
    }

    // Only successful understanding resets the hint cycle — a wrong guess
    // must not let the child keep postponing the clues.
    markInteraction();
    resolvingRef.current = true;
    setIsCorrect(true);
    setGuidanceMessage('');
    setGuidedPowerId(null);

    const syllableIndex = SYLLABLE_INDEX_BY_CHUNK[situation.syllableChunk] ?? (cardIndex + 1);

    const optionRect = optionRefs.current[powerId]?.getBoundingClientRect?.();
    const syllableRect = syllableAnchorRefs.current[syllableIndex]?.getBoundingClientRect?.();
    const imageRect = imageWrapRef.current?.getBoundingClientRect?.();

    // Two-stage journey: chosen symbol → syllable (earns the sound) →
    // scene image (applies the lesson) → After reveal. Gives each correct
    // answer a clear choose → syllable → result rhythm instead of flying
    // straight into the image.
    if (optionRect && syllableRect && imageRect) {
      const optionCenter = getRectCenter(optionRect);
      const syllableCenter = getRectCenter(syllableRect);
      const imageCenter = getRectCenter(imageRect);

      setFlyingPower({
        img: POWER_ICONS[powerId].img,
        left: optionCenter.x,
        top: optionCenter.y,
        syllableX: syllableCenter.x - optionCenter.x,
        syllableY: syllableCenter.y - optionCenter.y,
        sceneX: imageCenter.x - optionCenter.x,
        sceneY: imageCenter.y - optionCenter.y,
      });
    }

    // 1) Symbol reaches the syllable — it lights up and plays. Matches the
    // ~1080ms arrival point of the (now 2400ms) flight, with a long dwell
    // afterward so the syllable's own audio clip has time to actually play
    // before anything moves on. Play the syllable audio directly here
    // (rather than relying on SyllableHighlight's own litCount-triggered
    // side effect) so it's guaranteed to fire at this exact beat.
    safeAfter(1080, () => {
      setActiveSyllableHit(syllableIndex);
      setLitCount(syllableIndex);
      stopSceneVoice?.();
      playSyllable?.(AUDIO[syllableIndex - 1]);
    });

    // 2) Symbol reaches the image — a quick power-hit glow.
    safeAfter(2350, () => {
      setImageHit(true);
      window.setTimeout(() => onMicroWin?.(), 0);
    });

    // 3) After image reveals, flying icon clears.
    safeAfter(2400, () => {
      setShowAfter(true);
      setFlyingPower(null);
    });

    const nextIndex = cardIndex + 1;

    let advanceCalled = false;
    const advance = () => {
      if (advanceCalled) return;
      advanceCalled = true;

      if (nextIndex >= SITUATIONS.length) {
        setLitCount(SITUATIONS.length);
        if (doneCalledRef.current) return;
        doneCalledRef.current = true;
        setPhase('done');
        // Ending VO: full word "sarvakaryeshu" → the completion line.
        // Previously the game just ended silently after the last card's VO.
        stopSceneVoice?.();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          onGameComplete?.();
          onPhaseComplete?.();
        };
        const voFallback = window.setTimeout(finish, 9000);
        timersRef.current.push(voFallback);
        safeAfter(500, () => {
          playWord?.('sarvakaryeshu', () => {
            playSceneLine?.('scene13_success', () => {
              clearTimeout(voFallback);
              finish();
            }, { stripLeadingText: 'Sarva-Karyeshu' });
          });
        });
        return;
      }

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
      setActiveSyllableHit(null);
      lastHintVoiceKeyRef.current = null;
      resolvingRef.current = false;
    };

    // Advance only once the After VO has actually finished playing, then
    // hold a further ~2.5s of calm silence before moving on — a fixed
    // guessed delay was cutting the VO off / rushing straight to the next
    // card while it was still talking. A generous fallback timer covers
    // the case where the VO fails to fire its completion callback at all.
    safeAfter(2700, () => {
      playSceneLine?.(situation.voKeyAfter, () => {
        safeAfter(2500, advance);
      });
      safeAfter(9000, advance);
    });
  }, [canPick, cardIndex, isPaused, markInteraction, onGameComplete, onMicroWin, onPhaseComplete, playSceneLine, playSyllable, playWord, safeAfter, stopSceneVoice]);

  if (!isActive) return null;

  const situation = SITUATIONS[cardIndex];
  return (
    <div className={`sarva-game${hideElements ? ' is-hidden' : ''}`} onContextMenu={(e) => e.preventDefault()}>
      <div className="sarva-stage" style={{ backgroundImage: `url(${bgImg})` }}>
        <div className="sarva-boat" aria-hidden="true">
          <img src={boatImg} alt="" draggable={false} />
        </div>

        <div className="sarva-syllable-wrap" ref={syllableWrapRef}>
          <SyllableHighlight
            syllables={SYLLABLES}
            litCount={litCount}
            audioSyllables={AUDIO}
          />

          <div className="sarva-syllable-anchors" aria-hidden="true">
            {SYLLABLES.map((_, idx) => {
              const oneBased = idx + 1;
              return (
                <span
                  key={oneBased}
                  ref={(node) => { syllableAnchorRefs.current[oneBased] = node; }}
                  className={`sarva-syllable-anchor${activeSyllableHit === oneBased ? ' is-hit' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {phase === 'done' && (
          <p className="sarva-doneline">Ganesha's wisdom can help in every task!</p>
        )}

        {phase === 'play' && (
          <div className={`sarva-card${isCorrect ? ' is-correct' : ''}`} key={situation.id}>
            <div
              ref={imageWrapRef}
              className={`sarva-card-img-wrap${imageHit ? ' power-hit' : ''}${showAfter ? ' is-after-reveal' : ''}`}
            >
              {showAfter && <div className="sarva-after-badge">After</div>}
              <PoseImage
                className="sarva-card-img"
                imageStyle={{ height: '100%', objectFit: 'contain' }}
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
              '--syllable-x': `${flyingPower.syllableX}px`,
              '--syllable-y': `${flyingPower.syllableY}px`,
              '--scene-x': `${flyingPower.sceneX}px`,
              '--scene-y': `${flyingPower.sceneY}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}
