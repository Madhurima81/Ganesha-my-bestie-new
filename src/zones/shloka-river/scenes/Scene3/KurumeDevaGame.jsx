import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
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

import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Ku', 'ru', 'me', 'de', 'va'];
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
    objectOffset: { l: 6.5, t: 1.8 },
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

const BEAVER_PATH = KURUMEDEVA_LAYOUT.beaverPath;

export default function KurumedevaGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  isPaused = false,
}) {
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
  const phaseRef = useRef('play');
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete;
    onGameCompleteRef.current = onGameComplete;
  }, [onPhaseComplete, onGameComplete]);

  phaseRef.current = phase;

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
      phaseRef.current = 'play';
    }
  }, [isActive, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const moveFriendToDoneSpot = useCallback((friendIndex) => {
    setFriendPositions((prev) => {
      const next = [...prev];
      next[friendIndex] = { ...FRIENDS[friendIndex].doneSpot };
      return next;
    });
  }, []);

  const handleFriendTap = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (friendIndex !== friendStep) return;
    if (friendImgStates[friendIndex] !== 'carry') return;

    const friend = FRIENDS[friendIndex];

    setTappedId(friend.id);
    safeAfter(350, () => setTappedId(null));

    safeAfter(180, () => {
      setObjectPhases((prev) => {
        const next = [...prev];
        next[friendIndex] = 'flying';
        return next;
      });
      setFriendImgStates((prev) => {
        const next = [...prev];
        next[friendIndex] = 'empty';
        return next;
      });
    });

    safeAfter(820, () => {
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
      moveFriendToDoneSpot(friendIndex);
    });

    safeAfter(1550, () => {
      const nextStep = friendIndex + 1;
      setFriendStep(nextStep);

      if (nextStep >= FRIENDS.length) {
        safeAfter(420, () => {
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(5);
        });
      }
    });
  }, [friendStep, friendImgStates, isPaused, moveFriendToDoneSpot, onMicroWin, safeAfter]);

  useEffect(() => {
    if (phase !== 'crossing' || doneCalledRef.current) return;
    doneCalledRef.current = true;

    BEAVER_PATH.forEach((pos, index) => {
      safeAfter(index * 520, () => {
        setBeaverPos(pos);
        if (index === BEAVER_PATH.length - 1) {
          safeAfter(600, () => setPhase('done'));
        }
      });
    });
  }, [phase, safeAfter]);

  useEffect(() => {
    if (phase !== 'done') return;
    const t = window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 800);
    return () => window.clearTimeout(t);
  }, [phase]);

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
          audioSyllables={SYLLABLES}
          onSyllableLit={() => {}}
        />

        {phase === 'play' && currentFriend && (
          <p className="kuru-hint">
            Tap {currentFriend.label} to send the {currentFriend.brings}!
          </p>
        )}

        {phase === 'done' && (
          <p className="kuru-doneline">The bridge is ready! Everyone helped!</p>
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

        {FRIENDS.map((friend, index) => {
          const objPhase = objectPhases[index];
          if (objPhase === 'gone') return null;

          const isFlying = objPhase === 'flying';
          const startL = friend.l + friend.objectOffset.l;
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
              `}
              style={{
                left: `${pos.l}%`,
                top: `${pos.t}%`,
                width: `${friend.w}%`,
                scale: friend.flip ? '-1 1' : '1 1',
              }}
              onPointerDown={() => handleFriendTap(index)}
            >
              <img
                src={imgState === 'carry' ? friend.carryImg : friend.emptyImg}
                alt={friend.label}
                draggable={false}
              />
              {isCurrent && imgState === 'carry' && <div className="kuru-tap-ring" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
