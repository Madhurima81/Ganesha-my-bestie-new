import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import useWarmSanskritAudio from '../../../../lib/hooks/useWarmSanskritAudio';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import './SarvakaryeshuGame.css';

import bgImg from './assets/images/sarvakaryeshu-bg.webp';

import mooshikaBeforeImg from './assets/images/sarvakaryeshu/mooshika-before.webp';
import mooshikaAfterImg from './assets/images/sarvakaryeshu/mooshika-after.webp';
import eyesBeforeImg from './assets/images/sarvakaryeshu/eyes-before.webp';
import eyesAfterImg from './assets/images/sarvakaryeshu/eyes-after.webp';
import trunkBeforeImg from './assets/images/sarvakaryeshu/trunk-before.webp';
import trunkAfterImg from './assets/images/sarvakaryeshu/trunk-after.webp';
import tuskBeforeImg from './assets/images/sarvakaryeshu/tusk-before.webp';
import tuskAfterImg from './assets/images/sarvakaryeshu/tusk-after.webp';
import boatImg from './assets/images/boat.webp';

import trunkIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.webp';
import tuskIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-tusk-new.webp';
import modakIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-modak-new.webp';
import mooshikaIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-mooshika-new.webp';
import eyesIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-eyes-new.webp';
import earsIcon from '../../../../zones/symbol-mountain/shared/images/icons/symbol-ears-new.webp';

const SYLLABLES = ['Sar', 'va', 'kar', 'yeshu'];
const AUDIO = ['sar', 'va', 'kar', 'yeshu'];
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

// Card order is random for every new game. Syllables light by POSITION (Sar, va, kar, yeshu in order), so
// whichever card comes Nth earns the Nth syllable.
const shuffleIds = () => {
  const ids = SITUATIONS.map((x) => x.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};
// The three symbols on each card are shuffled too, so the right one is not always in the same place.
const shuffleOptions = () => Object.fromEntries(SITUATIONS.map((x) => {
  const o = [...x.options];
  for (let i = o.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return [x.id, o];
}));
const isValidOrder = (o) => Array.isArray(o) && o.length === SITUATIONS.length
  && SITUATIONS.every((x) => o.includes(x.id));

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
  // Resume: cards already finished (0-3). Applied only when the game mounts active (Continue).
  initialCards = 0,
  // Saved card order for a Continue (so already-answered cards are not repeated) and a callback that
  // reports a freshly chosen order so the scene can checkpoint it.
  initialOrder = null,
  onOrderChosen = () => {},
  // Fired with the finished-card count each time the game moves on to the next card (checkpoint).
  onBeatComplete = () => {},
}) {
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  useWarmSanskritAudio('sarvakaryeshu', AUDIO); // first tap plays instantly
  const [seedCards] = useState(() => (
    // SITUATIONS.length = left after the last card: resume straight into the word + success line.
    isActive ? Math.max(0, Math.min(SITUATIONS.length, Number(initialCards) || 0)) : 0
  ));
  const [order, setOrder] = useState(() => (isActive && isValidOrder(initialOrder) ? initialOrder : shuffleIds()));
  const [optionOrders, setOptionOrders] = useState(shuffleOptions);
  const cards = useMemo(() => order.map((id) => SITUATIONS.find((x) => x.id === id)), [order]);
  const [cardIndex, setCardIndex] = useState(Math.min(seedCards, SITUATIONS.length - 1));
  const [picked, setPicked] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAfter, setShowAfter] = useState(seedCards >= SITUATIONS.length);
  const [canPick, setCanPick] = useState(false);
  const [litCount, setLitCount] = useState(seedCards);
  const [phase, setPhase] = useState(seedCards >= SITUATIONS.length ? 'done' : 'play');
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [guidedPowerId, setGuidedPowerId] = useState(null);
  const [flyingPower, setFlyingPower] = useState(null);
  const [imageHit, setImageHit] = useState(false);
  const [activeSyllableHit, setActiveSyllableHit] = useState(null);

  const timersRef = useRef([]);
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable, clear: clearPausable } = usePausableTimers(isPaused);
  const doneCalledRef = useRef(false);
  const phaseRef = useRef('play');
  const resolvingRef = useRef(false);
  const optionRefs = useRef({});
  const imageWrapRef = useRef(null);
  const syllableAnchorRefs = useRef({});
  const syllableWrapRef = useRef(null);
  const lastHintVoiceKeyRef = useRef(null);
  const lastSyllableDoneRef = useRef(true);
  phaseRef.current = phase;

  const getRectCenter = (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });

  // GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction.
  const { hintLevel, markInteraction, markWrongAttempt, markLevel2VoiceStarted, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && canPick,
    stageKey: isActive ? `card-${cardIndex}` : null,
    initialDelay: 10000,
    pulseCountBeforeEscalation: 1,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
  });

  // L1 is visual-only (all options make one neutral lift — see sarva-options
  // below). Only L2 (a meaning clue) and L3 (the final clue, which reveals
  // the correct symbol the moment it finishes) speak.
  useEffect(() => {
    if (!isActive || phase !== 'play' || isCorrect || hintLevel < 2) {
      if (hintLevel < 3) setGuidedPowerId(null);
      return;
    }

    const situation = cards[cardIndex];
    const hintVoiceKey = `scene13_hint_${situation.id}_${hintLevel}`;
    if (lastHintVoiceKeyRef.current === hintVoiceKey) return;

    lastHintVoiceKeyRef.current = hintVoiceKey;
    const timerId = window.setTimeout(() => {
      if (hintLevel === 2 && playSceneLine) markLevel2VoiceStarted();
      playSceneLine?.(
        hintVoiceKey,
        // L3 is the final rescue — reveal the correct symbol the instant
        // the clue finishes, not after a further guessed delay.
        hintLevel === 3 ? () => setGuidedPowerId(situation.correct) : markLevel2VoiceEnded,
        {
          replayOnReturn: false,
          minDelayAfterVoiceMs: 5000,
        }
      );
    }, 120);
    return () => window.clearTimeout(timerId);
  }, [cardIndex, hintLevel, isActive, isCorrect, phase, playSceneLine, markLevel2VoiceStarted, markLevel2VoiceEnded]);

  const safeAfter = pausableAfter;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    clearPausable();
  }, [clearPausable]);

  // Tell the scene which order this game uses (checkpointed, so Continue keeps it).
  const onOrderChosenRef = useRef(onOrderChosen);
  onOrderChosenRef.current = onOrderChosen;
  useEffect(() => {
    if (isActive) onOrderChosenRef.current?.(order);
  }, [isActive, order]);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setOrder(shuffleIds()); // a new game gets a new random order
      setOptionOrders(shuffleOptions());
      setCardIndex(0);
      setPicked(null);
      setIsCorrect(null);
      setShowAfter(false);
      setCanPick(false);
      setLitCount(0);
      setPhase('play');
      setGuidanceMessage('');
      setGuidedPowerId(null);
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
    const s = cards[cardIndex];
    setShowAfter(false);
    setCanPick(false);
    setPicked(null);
    setIsCorrect(null);
    setGuidanceMessage('');
    setGuidedPowerId(null);
    setFlyingPower(null);
    setImageHit(false);
    setActiveSyllableHit(null);

    let cancelled = false;
    const fallbacks = [];
    const addFallback = (ms, fn) => {
      const id = pausableAfter(ms, fn);
      fallbacks.push(id);
      return id;
    };

    const t1 = pausableAfter(500, () => {
      if (cancelled) return;
      // Choices are live while the setup VO speaks. A pick stops the VO in
      // handlePick, matching the Symbol Mountain interaction rhythm.
      setCanPick(true);
      playSceneLine?.(s.voKeyBefore, () => {
        if (!cancelled) setCanPick(true);
      });
    });

    return () => {
      cancelled = true;
      cancelPausable(t1);
      fallbacks.forEach(cancelPausable);
    };
  }, [isActive, cardIndex, phase, playSceneLine, pausableAfter, cancelPausable]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Ending: full word "sarvakaryeshu" -> the completion line -> hand off. Also used when Continue resumes after the last card.
  const runEnding = useCallback(() => {
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
    // Pausable, so the sidebar can't let it complete the game behind the panel.
    const voFallback = pausableAfter(9000, finish);
    safeAfter(500, () => {
      playWord?.('sarvakaryeshu', () => {
        // On a Continue the line can be dropped (it "ends" at once without being heard): if it reports
        // done in well under a second, say it once more before handing off.
        const playSuccess = (retry) => {
          const startedAt = Date.now();
          playSceneLine?.('scene13_success', () => {
            if (retry && Date.now() - startedAt < 800) {
              safeAfter(250, () => playSuccess(false));
              return;
            }
            cancelPausable(voFallback);
            finish();
          }, { stripLeadingText: 'Sarvakaryeshu' });
        };
        playSuccess(true);
      });
    });
  }, [cancelPausable, onGameComplete, onPhaseComplete, pausableAfter, playSceneLine, playWord, safeAfter, stopSceneVoice]);

  // Continue after the last card: say the word + success line, then complete.
  useEffect(() => {
    if (!isActive || seedCards < SITUATIONS.length) return undefined;
    const t = window.setTimeout(runEnding, 500);
    return () => window.clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = useCallback((powerId) => {
    if (isPaused || phaseRef.current !== 'play' || resolvingRef.current || !canPick) return;

    const situation = cards[cardIndex];
    const correct = powerId === situation.correct;
    stopSceneVoice?.();
    if (hintLevel === 2) markLevel2VoiceEnded();
    if (hintLevel >= 3) setGuidedPowerId(situation.correct);

    setPicked(powerId);

    if (!correct) {
      setIsCorrect(null);
      setGuidanceMessage('Try another symbol.');
      // A wrong symbol is a genuine attempt: it never clears a visible hint (so it cannot keep
      // postponing the clues), and a 2nd wrong pick earns L2 help early.
      markWrongAttempt();
      return;
    }

    // Only successful understanding resets the hint cycle.
    markInteraction();
    resolvingRef.current = true;
    setIsCorrect(true);
    setGuidanceMessage('');
    setGuidedPowerId(null);

    const syllableIndex = cardIndex + 1;

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
      lastSyllableDoneRef.current = false;
      playSyllable?.(AUDIO[syllableIndex - 1], () => {
        lastSyllableDoneRef.current = true;
      });
      safeAfter(1600, () => {
        lastSyllableDoneRef.current = true;
      });
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
    // Checkpoint at the correct answer (not after the long reveal/voice), so leaving mid-reveal resumes at the NEXT card;
    // after the last card it resumes into the ending (word + success line).
    onBeatComplete?.(nextIndex);

    let advanceCalled = false;
    const advance = () => {
      if (advanceCalled) return;
      advanceCalled = true;

      if (nextIndex >= SITUATIONS.length) {
        setLitCount(SITUATIONS.length);
        runEnding();
        return;
      }

      setCardIndex(nextIndex);
      setPicked(null);
      setIsCorrect(null);
      setShowAfter(false);
      setCanPick(false);
      setGuidanceMessage('');
      setGuidedPowerId(null);
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
      const playAfterLine = () => {
        playSceneLine?.(situation.voKeyAfter, () => {
          safeAfter(2500, advance);
        });
      };
      if (lastSyllableDoneRef.current) playAfterLine();
      else {
        const waitForSyllable = () => {
          if (lastSyllableDoneRef.current) {
            playAfterLine();
            return;
          }
          safeAfter(120, waitForSyllable);
        };
        waitForSyllable();
      }
      safeAfter(9000, advance);
    });
  }, [runEnding, canPick, cardIndex, hintLevel, isPaused, markInteraction, markLevel2VoiceEnded, markWrongAttempt, onBeatComplete, onGameComplete, onMicroWin, onPhaseComplete, playSceneLine, playSyllable, playWord, safeAfter, pausableAfter, cancelPausable, stopSceneVoice]);

  if (!isActive) return null;

  const situation = cards[cardIndex];
  return (
    <div className={`sarva-game${hideElements ? ' is-hidden' : ''}${isPaused ? ' is-paused' : ''}`} onContextMenu={(e) => e.preventDefault()}>
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
              <div className={`sarva-options${hintLevel === 1 ? ' is-hint-l1' : ''}`}>
                {(optionOrders[situation.id] || situation.options).map((powerId) => {
                  const power = POWER_ICONS[powerId];
                  const isRight = picked === powerId && isCorrect;
                  const isSelected = picked === powerId;
                  const isWrong = picked === powerId && picked !== null && !isCorrect;
                  const isGuided = guidedPowerId === powerId;
                  const isHintGlow = isGuided && hintLevel >= 3;

                  return (
                    <button
                      key={powerId}
                      ref={(node) => { optionRefs.current[powerId] = node; }}
                      className={`sarva-option${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}${isSelected ? ' is-selected' : ''}${isGuided ? ' is-guided' : ''}${isHintGlow ? ' hint-glow' : ''}${isCorrect && picked && !isRight ? ' is-dimmed' : ''}`}
                      style={{ '--power-color': power.color }}
                      onPointerDown={() => handlePick(powerId)}
                      aria-label={power.label}
                    >
                      <div className="sarva-option-circle">
                        {SHOW_HIT_ZONES && <span className="sarva-option-hit-outline" aria-hidden="true" />}
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
