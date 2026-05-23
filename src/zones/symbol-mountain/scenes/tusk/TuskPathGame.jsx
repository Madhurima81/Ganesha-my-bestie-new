// zones/symbol-mountain/scenes/symbol/TuskPathGame.jsx
// 🎯 Tusk Path Game — 4 animals clear 4 obstacles to reveal the sacred tusk
// Lesson: "Even when the path was blocked, you did not quit."

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TuskPathGame.css';

// Animals
import peacockImg from '../tusk/assets/images/peacock-new.png';
import monkeyImg from '../tusk/assets/images/monkey-new.png';
import elephantImg from '../tusk/assets/images/elephant-new1.png';
import cowImg from '../tusk/assets/images/cow-new.png';

// Obstacles
import boulderImg from '../tusk/assets/images/obstacle-boulder.png';
import boulderCrackedImg from '../tusk/assets/images/obstacle-boulder-cracked.png';
import thornBushImg from '../tusk/assets/images/obstacle-thorn-bush.png';
import leavesImg from '../tusk/assets/images/obstacle-leaves.png';
import mudImg from '../tusk/assets/images/obstacle-mud.png';
import steppingStonesImg from '../tusk/assets/images/obstacle-stepping-stones.png';

// Final reveal
import tuskImg from '../../shared/images/icons/broken-tusk-symbol.png';

// VO paths
const VO_PATHS = {
  intro: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-intro.webm',
  elephantHint: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-elephant.webm',
  monkeyHint: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-monkey.webm',
  peacockHint: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-peacock.webm',
  cowHint: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-cow.webm',
  finale: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-tusk-finale.webm'
};

// ─────────────────────────────────────────────
// CONFIG — 4 steps in order
// ─────────────────────────────────────────────

const STEPS = [
  {
    id: 'elephant',
    animal: { img: elephantImg, name: 'Elephant', x: 12, y: 65 },
    obstacle: {
      x: 24, y: 65,
      img: boulderImg,
      imgProgress: boulderCrackedImg
    },
    tapsRequired: 2,
    hintVo: VO_PATHS.elephantHint,
    feedback: 'shake'
  },
  {
    id: 'monkey',
    animal: { img: monkeyImg, name: 'Monkey', x: 30, y: 67 },
    obstacle: {
      x: 42, y: 67,
      img: thornBushImg
    },
    tapsRequired: 2,
    hintVo: VO_PATHS.monkeyHint,
    feedback: 'pluck'
  },
  {
    id: 'peacock',
    animal: { img: peacockImg, name: 'Peacock', x: 48, y: 63 },
    obstacle: {
      x: 60, y: 67,
      img: leavesImg
    },
    tapsRequired: 1,
    hintVo: VO_PATHS.peacockHint,
    feedback: 'sweep'
  },
  {
    id: 'cow',
    animal: { img: cowImg, name: 'Cow', x: 66, y: 65 },
    obstacle: {
      x: 78, y: 67,
      img: mudImg,
      imgProgress: steppingStonesImg
    },
    tapsRequired: 1,
    hintVo: VO_PATHS.cowHint,
    feedback: 'walk'
  }
];

const IDLE_HINT_MS = 6000;
const IDLE_HINT_VO_MS = 12000;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const playAudio = (src, volume = 0.9) => {
  if (!src) return null;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
  } catch (e) {
    return null;
  }
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const TuskPathGame = ({
  isActive = true,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);   // 0..3
  const [stepTaps, setStepTaps] = useState(0);          // taps within current step
  const [cleared, setCleared] = useState(new Set());    // step ids done
  const [feedbackKey, setFeedbackKey] = useState(0);    // bump to re-trigger CSS anim
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [idleHintStage, setIdleHintStage] = useState(0); // 0 none, 1 glow, 2 vo
  const [introShown, setIntroShown] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  const lastTapRef = useRef(Date.now());
  const idleTimerRef = useRef(null);

  const step = STEPS[currentStep];

  // Intro VO
  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playAudio(VO_PATHS.intro);
  }, [isActive, introShown]);

  // Idle hint: glow current obstacle after 6s
  useEffect(() => {
    if (!isActive || showFinale) return;

    const check = () => {
      const idleMs = Date.now() - lastTapRef.current;
      if (idleMs >= IDLE_HINT_VO_MS && idleHintStage < 2) {
        setShowIdleHint(true);
        setIdleHintStage(2);
        if (step?.hintVo) playAudio(step.hintVo);
      } else if (idleMs >= IDLE_HINT_MS && idleHintStage < 1) {
        setShowIdleHint(true);
        setIdleHintStage(1);
      }
    };
    idleTimerRef.current = setInterval(check, 1000);
    return () => clearInterval(idleTimerRef.current);
  }, [isActive, currentStep, showFinale, idleHintStage, step]);

  // Win condition
  useEffect(() => {
    if (cleared.size === 4 && !showFinale) {
      setShowFinale(true);
      playAudio(VO_PATHS.finale);

      const t = setTimeout(() => {
        if (onGameComplete) {
          onGameComplete({
            stepsCleared: Array.from(cleared),
            totalCleared: 4
          });
        }
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [cleared, showFinale, onGameComplete]);

  const handleObstacleTap = useCallback((e) => {
    e?.stopPropagation();
    if (!step || cleared.has(step.id) || showFinale) return;

    lastTapRef.current = Date.now();
    setShowIdleHint(false);
    setIdleHintStage(0);
    setFeedbackKey(k => k + 1);

    const newTaps = stepTaps + 1;

    if (newTaps >= step.tapsRequired) {
      // Step complete
      setStepTaps(0);
      setCleared(prev => new Set([...prev, step.id]));

      setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 900);
    } else {
      setStepTaps(newTaps);
    }
  }, [step, stepTaps, cleared, showFinale]);

  if (hideElements || !isActive) return null;

  return (
    <div className={`tusk-path-game ${className}`}>

      {/* Render all 4 steps (animals + obstacles) — but only current is interactive */}
      {STEPS.map((s, idx) => {
        const isCleared = cleared.has(s.id);
        const isCurrent = idx === currentStep && !showFinale;
        const isFuture = idx > currentStep;

        // Determine obstacle image (progressive state for elephant/cow)
        let obstacleImg = s.obstacle.img;
        if (isCleared && s.obstacle.imgProgress) {
          obstacleImg = s.obstacle.imgProgress;
        } else if (isCurrent && s.id === 'elephant' && stepTaps === 1) {
          obstacleImg = s.obstacle.imgProgress; // cracked after first tap
        }

        return (
          <React.Fragment key={s.id}>
            {/* Animal */}
            <div
              className={`tusk-path-animal ${isCurrent ? 'active' : ''} ${isCleared ? 'cleared' : ''}`}
              style={{ left: `${s.animal.x}%`, top: `${s.animal.y}%` }}
            >
              <img src={s.animal.img} alt={s.animal.name} draggable={false} />
            </div>

            {/* Obstacle */}
            {!isCleared || s.obstacle.imgProgress ? (
              <div
                key={`obstacle-${s.id}-${feedbackKey}`}
                className={`tusk-path-obstacle ${s.id} ${isCurrent ? 'active' : ''} ${isCleared ? 'cleared' : ''} ${isCurrent && showIdleHint ? 'hint' : ''} ${isCurrent && stepTaps > 0 ? `feedback-${s.feedback}` : ''}`}
                style={{ left: `${s.obstacle.x}%`, top: `${s.obstacle.y}%` }}
                onClick={isCurrent ? handleObstacleTap : undefined}
              >
                <img src={obstacleImg} alt="" draggable={false} />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}

      {/* Progress dots */}
      <div className="tusk-path-progress">
        {STEPS.map((s, idx) => (
          <div
            key={s.id}
            className={`tusk-path-dot ${cleared.has(s.id) ? 'done' : ''} ${idx === currentStep && !showFinale ? 'current' : ''}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="tusk-path-counter">
        Path: <span>{cleared.size}</span> / 4
      </div>

      {/* Tap counter (within current step, only if >1 tap needed) */}
      {step && step.tapsRequired > 1 && stepTaps > 0 && stepTaps < step.tapsRequired && !showFinale && (
        <div className="tusk-path-tap-hint">
          Keep going! ({stepTaps}/{step.tapsRequired})
        </div>
      )}

      {/* Finale: glowing tusk reveal */}
      {showFinale && (
        <div className="tusk-path-finale">
          <div className="tusk-path-finale-glow" />
          <img
            src={tuskImg}
            alt="Sacred Tusk"
            className="tusk-path-finale-tusk"
            draggable={false}
          />
          <div className="tusk-path-finale-text">
            You did not quit.
          </div>
        </div>
      )}
    </div>
  );
};

export default TuskPathGame;
