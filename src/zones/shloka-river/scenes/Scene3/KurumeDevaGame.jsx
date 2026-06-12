import { useState, useEffect, useRef, useCallback } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import './KurumedevaGame.css';

import bgImg from './assets/images/Nirvighnam/bg.png';
import turtleImg from './assets/images/Kurumedeva/turtle.png';
import birdImg from './assets/images/Kurumedeva/bird.png';
import squirrelImg from './assets/images/Kurumedeva/squirrel.png';
import bunnyImg from './assets/images/Kurumedeva/bunny.png';
import beaverHappyImg from './assets/images/Kurumedeva/beaver-happy.png';
import beaverSadImg from './assets/images/Kurumedeva/beaver-sad.png';
import step1Img from './assets/images/Kurumedeva/step1.png';
import step2Img from './assets/images/Kurumedeva/step2.png';
import step3Img from './assets/images/Kurumedeva/step3.png';
import step4Img from './assets/images/Kurumedeva/step4.png';
import { KURUMEDEVA_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Ku', 'ru', 'me', 'de', 'va'];

const FRIENDS = [
  {
    ...KURUMEDEVA_LAYOUT.friends[0],
    img: turtleImg,
    bridgeImg: step1Img,
    pos: { l: KURUMEDEVA_LAYOUT.friends[0].l, t: KURUMEDEVA_LAYOUT.friends[0].t },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[1],
    img: birdImg,
    bridgeImg: step2Img,
    pos: { l: KURUMEDEVA_LAYOUT.friends[1].l, t: KURUMEDEVA_LAYOUT.friends[1].t },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[2],
    img: squirrelImg,
    bridgeImg: step3Img,
    pos: { l: KURUMEDEVA_LAYOUT.friends[2].l, t: KURUMEDEVA_LAYOUT.friends[2].t },
  },
  {
    ...KURUMEDEVA_LAYOUT.friends[3],
    img: bunnyImg,
    bridgeImg: step4Img,
    pos: { l: KURUMEDEVA_LAYOUT.friends[3].l, t: KURUMEDEVA_LAYOUT.friends[3].t },
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
  const [beaverStep, setBeaverStep] = useState(0);
  const [tappedId, setTappedId] = useState(null);
  const [litCount, setLitCount] = useState(0);

  const timersRef = useRef([]);
  const doneCalledRef = useRef(false);
  const phaseRef = useRef('play');
  phaseRef.current = phase;

  const safeAfter = useCallback((ms, fn) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
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
      setBeaverStep(0);
      setTappedId(null);
      setLitCount(0);
      doneCalledRef.current = false;
      phaseRef.current = 'play';
    }
  }, [isActive, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleFriendTap = useCallback((friendIndex) => {
    if (isPaused || phaseRef.current !== 'play') return;
    if (friendIndex !== friendStep) return;

    const friend = FRIENDS[friendIndex];

    setTappedId(friend.id);
    safeAfter(400, () => setTappedId(null));

    safeAfter(300, () => {
      setBridgeStep(friendIndex + 1);
      onMicroWin?.();
      setLitCount(friendIndex + 1);

      const nextStep = friendIndex + 1;
      setFriendStep(nextStep);

      if (nextStep === FRIENDS.length) {
        safeAfter(600, () => {
          setPhase('crossing');
          phaseRef.current = 'crossing';
          setLitCount(5);
        });
      }
    });
  }, [friendStep, isPaused, onMicroWin, safeAfter]);

  useEffect(() => {
    if (phase !== 'crossing' || doneCalledRef.current) return;

    BEAVER_PATH.forEach((pos, index) => {
      safeAfter(index * 520, () => {
        setBeaverPos(pos);
        setBeaverStep(index);

        if (index === BEAVER_PATH.length - 1) {
          safeAfter(600, () => {
            if (doneCalledRef.current) return;
            doneCalledRef.current = true;
            setPhase('done');
            safeAfter(800, () => {
              onGameComplete?.();
              onPhaseComplete?.();
            });
          });
        }
      });
    });
  }, [phase, safeAfter, onGameComplete, onPhaseComplete]);

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
            Tap {currentFriend.label} - they&apos;re bringing {currentFriend.brings}!
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
              scale: KURUMEDEVA_LAYOUT.bridge.flip ? '-1 1' : '1 1',
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
          const isCurrent = index === friendStep && phase === 'play';
          const isTapped = tappedId === friend.id;
          const isDone = index < friendStep;

          return (
            <div
              key={friend.id}
              className={`
                kuru-friend
                ${isCurrent ? 'is-active' : ''}
                ${isTapped ? 'is-tapped' : ''}
                ${isDone ? 'is-done' : ''}
                ${index > friendStep ? 'is-waiting' : ''}
              `}
              style={{
                left: `${friend.pos.l}%`,
                top: `${friend.pos.t}%`,
                width: `${friend.w}%`,
                scale: friend.flip ? '-1 1' : '1 1',
              }}
              onPointerDown={() => handleFriendTap(index)}
            >
              <img src={friend.img} alt={friend.label} draggable={false} />
              {isCurrent && <div className="kuru-tap-ring" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
