// zones/symbol-mountain/scenes/symbol/TuskPathGame.jsx
// 🎯 Tusk Path Game V4 — ONE boulder, 4 layers peeled in sequence
// Order: peacock removes leaves → monkey removes moss → cow removes mud → elephant removes rock
// Wrong animal = wobble. Lesson: don't quit, work together.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TuskPathGame.css';
import { ANIMAL_SIZES } from './animalConfig';

// Animals
import peacockImg from '../tusk/assets/images/peacock-new.png';
import monkeyImg from '../tusk/assets/images/monkey-new.png';
import elephantImg from '../tusk/assets/images/elephant-new1.png';
import cowImg from '../tusk/assets/images/cow-new.png';

// Obstacle layered states (single boulder, 5 visual states)
import obstacleFull from '../tusk/assets/images/tusk-obstacle-full.png';
import obstacleNoLeaves from '../tusk/assets/images/tusk-obstacle-no-leaves.png';
import obstacleNoMoss from '../tusk/assets/images/tusk-obstacle-no-moss.png';
import obstacleNoMud from '../tusk/assets/images/obstacle-boulder.png';
import obstacleCleared from '../tusk/assets/images/obstacle-boulder-broken.png';

// Final reveal
import tuskImg from '../../shared/images/icons/broken-tusk-symbol.png';

const VO_PATHS = {
  intro: '/audio/vo-tusk-intro.webm',
  elephantHint: '/audio/vo-tusk-elephant.webm',
  monkeyHint: '/audio/vo-tusk-monkey.webm',
  peacockHint: '/audio/vo-tusk-peacock.webm',
  cowHint: '/audio/vo-tusk-cow.webm',
  finale: '/audio/vo-tusk-finale.webm'
};

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

// Animal herd — positioned in front of the boulder
const ANIMALS = [
  { id: 'elephant', name: 'Elephant', img: elephantImg, x: 35, y: 76 },
  { id: 'monkey',   name: 'Monkey',   img: monkeyImg,   x: 44, y: 78 },
  { id: 'peacock',  name: 'Peacock',  img: peacockImg,  x: 56, y: 78 },
  { id: 'cow',      name: 'Cow',      img: cowImg,      x: 65, y: 73 }
];

// Single boulder position
const OBSTACLE_POSITION = { x: 50, y: 68 };

// 4 layers — peeled in this order. Each step has its BEFORE image (current state)
// and an animal that removes that layer.
const LAYERS = [
  { id: 'leaves', correctAnimal: 'peacock',  img: obstacleFull,     hintVo: VO_PATHS.peacockHint,  feedback: 'sweep' },
  { id: 'moss',   correctAnimal: 'monkey',   img: obstacleNoLeaves, hintVo: VO_PATHS.monkeyHint,   feedback: 'pluck' },
  { id: 'mud',    correctAnimal: 'cow',      img: obstacleNoMoss,   hintVo: VO_PATHS.cowHint,      feedback: 'walk'  },
  { id: 'rock',   correctAnimal: 'elephant', img: obstacleNoMud,    hintVo: VO_PATHS.elephantHint, feedback: 'shake' }
];

// Image shown after ALL layers cleared (boulder gone)
const FINAL_IMAGE = obstacleCleared;

const IDLE_HINT_MS = 6000;

const playAudio = (src, volume = 0.9) => {
  if (!src) return null;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
  } catch (e) { return null; }
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const TuskPathGame = ({
  isActive = true,
  showObstacleOnly = false,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [currentLayerIdx, setCurrentLayerIdx] = useState(0); // 0..3, then 4 = all cleared
  const [peeling, setPeeling] = useState(false);
  const [wrongAnimal, setWrongAnimal] = useState(null);
  const [leaningAnimal, setLeaningAnimal] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  const lastTapRef = useRef(Date.now());
  const idleTimerRef = useRef(null);

  const currentLayer = LAYERS[currentLayerIdx];
  const allCleared = currentLayerIdx >= LAYERS.length;

  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playAudio(VO_PATHS.intro);
  }, [isActive, introShown]);

  useEffect(() => {
    if (!isActive || showFinale || peeling || allCleared) return;
    const check = () => {
      if (Date.now() - lastTapRef.current >= IDLE_HINT_MS) {
        setShowIdleHint(true);
        if (currentLayer?.hintVo) {
          playAudio(currentLayer.hintVo);
          lastTapRef.current = Date.now();
        }
      }
    };
    idleTimerRef.current = setInterval(check, 1000);
    return () => clearInterval(idleTimerRef.current);
  }, [isActive, currentLayerIdx, peeling, showFinale, currentLayer, allCleared]);

  useEffect(() => {
    if (!allCleared) return;
    setShowFinale(true);
    playAudio(VO_PATHS.finale);
    const t = setTimeout(() => {
      if (onGameComplete) {
        onGameComplete({ layersCleared: LAYERS.length, totalCleared: 4 });
      }
    }, 3800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCleared]);

  const handleAnimalTap = useCallback((animalId, e) => {
    e?.stopPropagation();
    if (!isActive) return;
    if (!currentLayer || peeling || showFinale || allCleared) return;

    lastTapRef.current = Date.now();
    setShowIdleHint(false);

    if (animalId !== currentLayer.correctAnimal) {
      setWrongAnimal(animalId);
      setTimeout(() => setWrongAnimal(null), 700);
      return;
    }

    // Correct animal tapped — peel this layer
    setFeedbackKey(k => k + 1);
    setLeaningAnimal(animalId);
    setTimeout(() => setLeaningAnimal(null), 500);

    setPeeling(true);
    setTimeout(() => {
      setPeeling(false);
      setCurrentLayerIdx(i => i + 1);
    }, 900);
  }, [currentLayer, peeling, showFinale, allCleared, isActive]);

  if (hideElements || (!isActive && !showObstacleOnly)) return null;
  const staticPreview = !isActive && showObstacleOnly;

  // Which image to display on the boulder
  // - During peel: show NEXT image (the reveal)
  // - Normal: show current layer's image
  // - All cleared: show final cleared image
  let displayImg;
  if (allCleared) {
    displayImg = FINAL_IMAGE;
  } else if (peeling) {
    // Show the next layer's "before" image, which IS this layer's "after"
    const nextIdx = currentLayerIdx + 1;
    displayImg = nextIdx < LAYERS.length ? LAYERS[nextIdx].img : FINAL_IMAGE;
  } else {
    displayImg = currentLayer.img;
  }

  return (
    <div className={`tusk-path-game ${className}`}>

      {/* Single boulder — image changes as layers peel */}
      <div
        key={`boulder-${feedbackKey}`}
        className={`tusk-path-obstacle boulder active
          ${peeling ? 'peeling' : ''}
          ${peeling && currentLayerIdx === LAYERS.length - 1 ? 'final-reveal' : ''}
          ${showIdleHint && !peeling ? 'hint' : ''}
          ${!peeling && currentLayer ? `feedback-${currentLayer.feedback}` : ''}
          ${allCleared ? 'cleared' : ''}`}
        style={{ left: `${OBSTACLE_POSITION.x}%`, top: `${OBSTACLE_POSITION.y}%` }}
      >
        <img src={displayImg} alt="" draggable={false} />
      </div>

      {/* Animal Herd — fixed position, no shifting (they stay in front of boulder) */}
      {ANIMALS.map(animal => {
        const isWrong = wrongAnimal === animal.id;
        const isCorrect = currentLayer?.correctAnimal === animal.id;
        const isHinted = showIdleHint && isCorrect && !peeling && !showFinale && !allCleared;
        const isLeaning = leaningAnimal === animal.id;

        return (
          <div
            key={animal.id}
            className={`tusk-path-animal ${staticPreview ? 'static-preview' : ''} ${isWrong ? 'wrong' : ''} ${isHinted ? 'hinted' : ''} ${isLeaning ? 'leaning' : ''} ${showFinale ? 'celebrate' : ''}`}
            style={{
              left: `${animal.x}%`,
              top: `${animal.y}%`,
              '--animal-scale': ANIMAL_SIZES[animal.id] || 1
            }}
            onClick={staticPreview ? undefined : (e) => handleAnimalTap(animal.id, e)}
          >
            <img src={animal.img} alt={animal.name} draggable={false} />
          </div>
        );
      })}

      {/* Progress dots — 4 layers */}
      {!staticPreview && <div className="tusk-path-progress">
        {LAYERS.map((layer, idx) => (
          <div
            key={layer.id}
            className={`tusk-path-dot ${idx < currentLayerIdx ? 'done' : ''} ${idx === currentLayerIdx && !showFinale ? 'current' : ''}`}
          />
        ))}
      </div>}

      {/* Counter */}
      {!staticPreview && <div className="tusk-path-counter">
        Path: <span>{Math.min(currentLayerIdx, 4)}</span> / 4
      </div>}

      {/* Finale */}
      {!staticPreview && showFinale && (
        <div className="tusk-path-finale">
          <div className="tusk-path-finale-glow" />
          <img src={tuskImg} alt="Sacred Tusk" className="tusk-path-finale-tusk" draggable={false} />
        </div>
      )}
    </div>
  );
};

export default TuskPathGame;
