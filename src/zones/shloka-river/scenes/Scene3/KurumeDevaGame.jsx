import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './KurumedevaGame.css';

import bgImg from './assets/images/Nirvighnam/bg.png';

import turtleCarryImg from './assets/images/Kurumedeva/turtle.png';
import birdCarryImg from './assets/images/Kurumedeva/bird.png';
import squirrelCarryImg from './assets/images/Kurumedeva/squirrel.png';
import bunnyCarryImg from './assets/images/Kurumedeva/bunny.png';

import turtleEmptyImg from './assets/images/Kurumedeva/turtle-empty.png';
import birdEmptyImg from './assets/images/Kurumedeva/bird-empty.png';
import squirrelEmptyImg from './assets/images/Kurumedeva/squirrel-empty.png';
import bunnyEmptyImg from './assets/images/Kurumedeva/bunny-empty.png';

import logObj from './assets/images/Kurumedeva/log-turtle.png';
import vineObj from './assets/images/Kurumedeva/vine.png';
import pegObj from './assets/images/Kurumedeva/peg-squirrel.png';
import plankObj from './assets/images/Kurumedeva/plank-bunny.png';

import step1Img from './assets/images/Kurumedeva/step1.png';
import step2Img from './assets/images/Kurumedeva/step2.png';
import step3Img from './assets/images/Kurumedeva/step3.png';
import step4Img from './assets/images/Kurumedeva/step4.png';
import beaverHappyImg from './assets/images/Kurumedeva/beaver-happy.png';
import beaverSadImg from './assets/images/Kurumedeva/beaver-sad.png';
import beaverBabyImg from './assets/images/Kurumedeva/beaver-baby.png';

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Ku', 'ru', 'me', 'deva'];
const BRIDGE_TARGET = {
  l: KURUMEDEVA_LAYOUT.bridge.l,
  t: KURUMEDEVA_LAYOUT.bridge.t,
};

const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    label: 'Turtle',
    brings: 'log',
    carryImg: turtleCarryImg,
    emptyImg: turtleEmptyImg,
    objectImg: logObj,
    bridgeImg: step1Img,
    objectAnim: 'kuru-obj-roll',
    objectW: 8,
    objectOffset: { l: 3.2, t: 1.8 },
    doneSpot: { l: 76, t: 70 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    label: 'Bird',
    brings: 'vine',
    carryImg: birdCarryImg,
    emptyImg: birdEmptyImg,
    objectImg: vineObj,
    bridgeImg: step2Img,
    objectAnim: 'kuru-obj-swoop',
    objectW: 5,
    objectOffset: { l: 4.4, t: -4.4 },
    doneSpot: { l: 82, t: 59 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[2],
    label: 'Squirrel',
    brings: 'pegs',
    carryImg: squirrelCarryImg,
    emptyImg: squirrelEmptyImg,
    objectImg: pegObj,
    bridgeImg: step3Img,
    objectAnim: 'kuru-obj-tumble',
    objectW: 6,
    objectOffset: { l: 5.5, t: 1.4 },
    doneSpot: { l: 82, t: 79 },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[3],
    label: 'Bunny',
    brings: 'planks',
    carryImg: bunnyCarryImg,
    emptyImg: bunnyEmptyImg,
    objectImg: plankObj,
    bridgeImg: step4Img,
    objectAnim: 'kuru-obj-flip',
    objectW: 7,
    objectOffset: { l: 4.8, t: 1.3 },
    doneSpot: { l: 87, t: 63 },
  },
];

const AUDIO = { syllables: ['ku', 'ru', 'me', 'deva'] };
const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;
const TURTLE_RIVER_SHIFT = 0;
// Friend tap hitbox is enlarged vs. the visible sprite for touch forgiveness —
// KurumedevaGame.css compensates by sizing the <img> at 1/KURU_HIT_SCALE (62.5%).
const KURU_HIT_SCALE = 1.6;
const WAIT_SPOTS = [
  { l: 18, t: 62 },
  { l: 24, t: 68 },
  { l: 14, t: 70 },
  { l: 20, t: 74 },
];

export default function KurumedevaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSyllable, stopVoice: stopSceneVoice } = voiceGuidance;
  const [friendStep, setFriendStep] = useState(0);
  const [bridgeStep, setBridgeStep] = useState(0);
  const [phase, setPhase] = useState('play');
  const [beaverPos, setBeaverPos] = useState(BEAVER_PATH[0]);
  const [litCount, setLitCount] = useState(0);
  const [tappedId, setTappedId] = useState(null);
  const [friendImgStates, setFriendImgStates] = useState(() => FRIENDS.map(() => 'carry'));
  const [objectPhases, setObjectPhases] = useState(() => FRIENDS.map(() => 'idle'));
  const [friendPositions, setFriendPositions] = useState(() => FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const crossingDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const voFallbackRef = useRef(null);
  const phaseRef = useRef('play');
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);
  const isPausedRef = useRef(isPaused);
  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? `friend-${friendStep}` : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15000,
    level3Delay: 22000,
  });

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete;
    onGameCompleteRef.current = onGameComplete;
  }, [onPhaseComplete, onGameComplete]);

  phaseRef.current = phase;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const safeAfter = useCallback((ms, fn) => {
    const runWhenReady = () => {
      if (isPausedRef.current) {
        const retryId = window.setTimeout(runWhenReady, 150);
        timersRef.current.push(retryId);
        return;
      }
      fn();
    };
    const id = window.setTimeout(runWhenReady, ms);
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
      setFriendStep(0);
      setBridgeStep(0);
      setPhase('play');
      setBeaverPos(BEAVER_PATH[0]);
      setLitCount(0);
      setTappedId(null);
      setFriendImgStates(FRIENDS.map(() => 'carry'));
      setObjectPhases(FRIENDS.map(() => 'idle'));
      setFriendPositions(FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
      doneCalledRef.current = false;
      successVoDoneRef.current = false;
      crossingDoneRef.current = false;
      completionScheduledRef.current = false;
      phaseRef.current = 'play';
    }
  }, [isActive, clearTimers]);

  useEffect(() => {
    if (isActive && phase === 'play' && friendStep === 0) {
      setFriendPositions(FRIENDS.map((friend) => ({ l: friend.l, t: friend.t })));
    }
  }, [friendStep, isActive, phase]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return;
    setFriendPositions((prev) => prev.map((pos, index) => (
      index >= friendStep ? { l: FRIENDS[index].l, t: FRIENDS[index].t } : pos
    )));
  }, [friendStep, isActive, phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const moveFriendToWait = useCallback((friendIndex) => {
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendIndex] = WAIT_SPOTS[friendIndex];
      return next;
    });
  }, []);

  const handleFriendTap = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (friendIndex !== friendStep) return;
    if (friendImgStates[friendIndex] !== 'carry') return;
    stopSceneVoice?.();
    markInteraction();

    const friend = FRIENDS[friendIndex];

    setTappedId(friend.id);
    safeAfter(350, () => setTappedId(null));

    safeAfter(180, () => {
      setObjectPhases((prev) => {
        const next = [...prev];
        next[friendIndex] = 'flying';
        return next;
      });
    });

    safeAfter(820, () => {
      // Let the bridge piece land before the helper switches to the empty pose.
      setFriendImgStates((prev) => {
        const next = [...prev];
        next[friendIndex] = 'empty';
        return next;
      });
      setObjectPhases((prev) => {
        const next = [...prev];
        next[friendIndex] = 'gone';
        return next;
      });
      setBridgeStep(friendIndex + 1);
      window.setTimeout(() => onMicroWin?.(), 0);
      setLitCount(friendIndex + 1);
    });

    safeAfter(1220, () => {
      moveFriendToWait(friendIndex);
    });

    safeAfter(1550, () => {
      const nextStep = friendIndex + 1;
      setFriendStep(nextStep);

      if (nextStep >= FRIENDS.length) {
        safeAfter(420, () => {
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(4);
        });
      }
    });
  }, [friendStep, friendImgStates, isPaused, markInteraction, moveFriendToWait, onMicroWin, safeAfter, stopSceneVoice]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !crossingDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 500);
  }, []);

  useEffect(() => {
    if (phase !== 'crossing' || doneCalledRef.current) return;
    doneCalledRef.current = true;

    if (playSceneLine) {
      playSceneLine('kuru_done', () => {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      });
      // iOS Safari can silently drop utterance onend/onerror — don't let completion hang on VO
      voFallbackRef.current = window.setTimeout(() => {
        if (!successVoDoneRef.current) {
          successVoDoneRef.current = true;
          completeAfterSuccess();
        }
      }, 8000);
    } else {
      successVoDoneRef.current = true;
    }

    BEAVER_PATH.forEach((pos, index) => {
      safeAfter(index * 520, () => {
        setBeaverPos(pos);
        if (index === BEAVER_PATH.length - 1) {
          FRIENDS.forEach((friend, friendIndex) => {
            safeAfter(700 + friendIndex * 400, () => {
              setFriendPositions((prev) => {
                const next = [...prev];
                next[friendIndex] = friend.doneSpot;
                return next;
              });
            });
          });
          safeAfter(700 + FRIENDS.length * 400 + 600, () => {
            crossingDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          });
        }
      });
    });
  }, [completeAfterSuccess, phase, playSceneLine, safeAfter]);

  useEffect(() => () => {
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
  }, []);

  if (!isActive) return null;

  const currentFriend = friendStep < FRIENDS.length ? FRIENDS[friendStep] : null;
  const bridgeImg = bridgeStep > 0 ? FRIENDS[bridgeStep - 1].bridgeImg : null;
  const beaverImg = phase === 'crossing' || phase === 'done' ? beaverHappyImg : beaverSadImg;

  return (
    <div className={`kuru-game${hideElements ? ' is-hidden' : ''}`}>
      <div className="kuru-stage" style={{ backgroundImage: `url(${bgImg})` }}>
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopSceneVoice?.();
            playSyllable?.(syllable);
          }}
        />

        {phase === 'play' && currentFriend && (
          <p className="kuru-hint">
            {(hintLevel === 0 || hintLevel === 1) && 'Tap the glowing friend.'}
            {hintLevel === 2 && 'Each friend brings a bridge piece.'}
            {hintLevel >= 3 && 'Keep asking your friends for help.'}
          </p>
        )}

        {phase === 'done' && (
          <p className="kuru-doneline">You asked for help! The bridge is ready!</p>
        )}

        {bridgeImg && (
          <div
            className={`kuru-bridge${bridgeStep === 4 ? ' is-complete' : ''}`}
            key={bridgeStep}
            style={{
              left: `${KURUMEDEVA_LAYOUT.bridge.l}%`,
              top: `${KURUMEDEVA_LAYOUT.bridge.t}%`,
              width: `${KURUMEDEVA_LAYOUT.bridge.w}%`,
              transform: `translate(-50%, -50%) rotate(${KURUMEDEVA_LAYOUT.bridge.r || 0}deg) scaleX(${KURUMEDEVA_LAYOUT.bridge.flip ? -1 : 1})`,
              opacity: 0.3 + (bridgeStep / 4) * 0.7,
              transition: 'opacity 0.6s ease',
            }}
          >
            <img src={bridgeImg} alt="bridge" draggable={false} />
          </div>
        )}

        <div
          className={`kuru-beaver${phase === 'crossing' || phase === 'done' ? ' is-walking' : ''}`}
          style={{
            left: `${beaverPos.l}%`,
            top: `${beaverPos.t}%`,
            width: `${KURUMEDEVA_LAYOUT.beaver.w}%`,
            scale: KURUMEDEVA_LAYOUT.beaver.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={beaverImg} alt="Beaver" draggable={false} />
        </div>

        <div
          className="kuru-beaver-baby"
          style={{
            left: `${KURUMEDEVA_LAYOUT.beaverBaby.l}%`,
            top: `${KURUMEDEVA_LAYOUT.beaverBaby.t}%`,
            width: `${KURUMEDEVA_LAYOUT.beaverBaby.w}%`,
            scale: KURUMEDEVA_LAYOUT.beaverBaby.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={beaverBabyImg} alt="Baby beaver" draggable={false} />
        </div>

        {FRIENDS.map((friend, index) => {
          const objPhase = objectPhases[index];
          if (objPhase === 'gone') return null;

          const isFlying = objPhase === 'flying';
          const startL = friend.l + friend.objectOffset.l + (index === 0 ? TURTLE_RIVER_SHIFT : 0);
          const startT = friend.t + friend.objectOffset.t;

          return (
            <div
              key={`obj-${friend.id}`}
              className={`kuru-object ${isFlying ? `kuru-object--flying ${friend.objectAnim}` : 'kuru-object--idle'}`}
              style={{
                left: isFlying ? `${BRIDGE_TARGET.l}%` : `${startL}%`,
                top: isFlying ? `${BRIDGE_TARGET.t}%` : `${startT}%`,
                width: `${friend.objectW}%`,
              }}
            >
              <img src={friend.objectImg} alt={friend.brings} draggable={false} />
            </div>
          );
        })}

        {FRIENDS.map((friend, index) => {
          const imgState = friendImgStates[index];
          const pos = friendPositions[index];
          const isCurrent = index === friendStep && phase === 'play';
          const isTapped = tappedId === friend.id;
          const isWaiting = index > friendStep;
          const isHelped = imgState === 'empty' && index <= friendStep;
          const isCrossing = phase === 'crossing' || phase === 'done';

          return (
            <div
              key={friend.id}
              className={`
                kuru-friend
                ${isCurrent && imgState === 'carry' ? 'is-active' : ''}
                ${isTapped ? 'is-tapped' : ''}
                ${isWaiting ? 'kuru-friend--waiting' : ''}
                ${isHelped ? 'kuru-friend--helped' : ''}
                ${isCrossing ? 'kuru-friend--crossing' : ''}
                ${isCurrent && imgState === 'carry' && hintLevel >= 1 ? 'pulse' : ''}
                ${isCurrent && imgState === 'carry' && hintLevel >= 2 ? 'hint-glow' : ''}
              `}
              style={{
                left: `${pos.l + (index === 0 ? TURTLE_RIVER_SHIFT : 0)}%`,
                top: `${pos.t}%`,
                width: `${friend.w * KURU_HIT_SCALE}%`,
                scale: friend.flip ? '-1 1' : '1 1',
              }}
              onPointerDown={() => handleFriendTap(index)}
            >
              <img
                src={imgState === 'carry' ? friend.carryImg : friend.emptyImg}
                alt={friend.label}
                draggable={false}
              />
            </div>
          );
        })}
        <GestureDemo
          type="tap"
          from={{ x: FRIENDS[0].l, y: FRIENDS[0].t }}
          to={{ x: FRIENDS[0].l, y: FRIENDS[0].t }}
          active={phase === 'play' && friendStep === 0}
          idleDelay={3000}
        />
      </div>
    </div>
  );
}
