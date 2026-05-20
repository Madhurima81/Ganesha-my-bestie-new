import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import './EyesPopUpGame.css';

import peacockImage from './assets/images/peacock-new.png';
import monkeyImage from './assets/images/monkey-new.png';
import elephantImage from './assets/images/elephant-new1.png';
import cowImage from './assets/images/cow-new.png';

const POP_VISIBLE_MS = 2000;
const POP_COOLDOWN_MS = 1200;
const IDLE_HINT_MS = 8000;
const FADE_IN_OPACITY = 0.15;

const HIDE_SPOTS = [
  { x: 22, y: 40 },
  { x: 35, y: 60 },
  { x: 47, y: 34 },
  { x: 60, y: 56 },
  { x: 72, y: 41 },
  { x: 30, y: 74 },
  { x: 53, y: 72 },
  { x: 76, y: 68 }
];

const ANIMALS = [
  { key: 'peacock', label: 'Peacock', image: peacockImage },
  { key: 'monkey', label: 'Monkey', image: monkeyImage },
  { key: 'elephant', label: 'Elephant', image: elephantImage },
  { key: 'cow', label: 'Cow', image: cowImage }
];

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const EyesPopUpGame = ({
  isActive = false,
  onGameComplete,
  onInstrumentFound,
  onAllInstrumentsFound
}) => {
  const { isAudioOn } = useAudioPreference();
  const { speak, stop } = useGaneshaVoice();
  const timeoutsRef = useRef([]);
  const lastInteractionAtRef = useRef(Date.now());
  const [animalSpots, setAnimalSpots] = useState([]);
  const [activeAnimal, setActiveAnimal] = useState(null);
  const [discoveredAnimals, setDiscoveredAnimals] = useState({});
  const [sparkleAt, setSparkleAt] = useState(null);
  const [shimmerAt, setShimmerAt] = useState(null);
  const [hintAnimal, setHintAnimal] = useState(null);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  const safeSetTimeout = useCallback((callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  const foundKeys = useMemo(
    () => ANIMALS.map((animal) => animal.key).filter((key) => discoveredAnimals[key]),
    [discoveredAnimals]
  );

  const nextUndiscovered = useMemo(
    () => animalSpots.filter((animal) => !discoveredAnimals[animal.key]),
    [animalSpots, discoveredAnimals]
  );

  const schedulePop = useCallback(() => {
    if (!isActive || nextUndiscovered.length === 0) return;
    const target = nextUndiscovered[Math.floor(Math.random() * nextUndiscovered.length)];
    setActiveAnimal(target.key);
    safeSetTimeout(() => {
      setActiveAnimal((current) => (current === target.key ? null : current));
      safeSetTimeout(schedulePop, POP_COOLDOWN_MS);
    }, POP_VISIBLE_MS);
  }, [isActive, nextUndiscovered, safeSetTimeout]);

  const markInteraction = () => {
    lastInteractionAtRef.current = Date.now();
    setHintAnimal(null);
  };

  const finalizeGame = useCallback((nextDiscovered) => {
    const discoveredArray = ANIMALS.map((animal) => animal.key).filter((key) => nextDiscovered[key]);
    onAllInstrumentsFound?.(discoveredArray, nextDiscovered);
    onGameComplete?.({
      discoveredAnimals: discoveredArray,
      totalDiscovered: discoveredArray.length
    });
  }, [onAllInstrumentsFound, onGameComplete]);

  const handleAnimalTap = (animal) => {
    markInteraction();
    if (activeAnimal !== animal.key || discoveredAnimals[animal.key]) return;

    const nextDiscovered = { ...discoveredAnimals, [animal.key]: true };
    setDiscoveredAnimals(nextDiscovered);
    setSparkleAt({ x: animal.x, y: animal.y, key: animal.key });
    setActiveAnimal(null);

    if (isAudioOn) {
      speak(animal.label, { age: 11, moment: 'default' });
    }

    const nextFound = ANIMALS.map((item) => item.key).filter((key) => nextDiscovered[key]);
    onInstrumentFound?.(animal.key, nextFound, nextDiscovered);

    safeSetTimeout(() => setSparkleAt(null), 700);
    if (nextFound.length === ANIMALS.length) {
      safeSetTimeout(() => finalizeGame(nextDiscovered), 450);
    } else {
      safeSetTimeout(schedulePop, 500);
    }
  };

  const handleMissTap = (event) => {
    if (!isActive) return;
    markInteraction();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setShimmerAt({ x, y, key: Date.now() });
    safeSetTimeout(() => setShimmerAt(null), 500);
  };

  useEffect(() => {
    if (!isActive) return;
    clearAllTimers();
    const spots = shuffle(HIDE_SPOTS).slice(0, ANIMALS.length);
    const setup = ANIMALS.map((animal, index) => ({
      ...animal,
      x: spots[index].x,
      y: spots[index].y
    }));
    setAnimalSpots(setup);
    setActiveAnimal(null);
    setDiscoveredAnimals({});
    setSparkleAt(null);
    setShimmerAt(null);
    setHintAnimal(null);
    lastInteractionAtRef.current = Date.now();
  }, [isActive, clearAllTimers]);

  useEffect(() => {
    if (!isActive || animalSpots.length === 0) return;
    safeSetTimeout(schedulePop, 650);
  }, [isActive, animalSpots, schedulePop, safeSetTimeout]);

  useEffect(() => {
    if (!isActive) return undefined;
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionAtRef.current < IDLE_HINT_MS) return;
      const firstUndiscovered = animalSpots.find((animal) => !discoveredAnimals[animal.key]);
      if (firstUndiscovered) setHintAnimal(firstUndiscovered.key);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, animalSpots, discoveredAnimals]);

  useEffect(() => () => {
    clearAllTimers();
    stop();
  }, [clearAllTimers, stop]);

  if (!isActive) return null;

  return (
    <div className="eyes-popup-game" onClick={handleMissTap} role="button" tabIndex={-1}>
      {animalSpots.map((animal) => {
        const isFound = Boolean(discoveredAnimals[animal.key]);
        const isPopping = activeAnimal === animal.key;
        const isHinted = hintAnimal === animal.key && !isFound;
        return (
          <button
            key={animal.key}
            type="button"
            className={`eyes-popup-animal ${isPopping ? 'is-popping' : ''} ${isFound ? 'is-found' : ''} ${isHinted ? 'is-hinted' : ''}`}
            style={{ left: `${animal.x}%`, top: `${animal.y}%`, '--animal-opacity': isPopping || isFound ? 1 : FADE_IN_OPACITY }}
            onClick={(event) => {
              event.stopPropagation();
              handleAnimalTap(animal);
            }}
            aria-label={animal.label}
          >
            <img src={animal.image} alt={animal.label} />
          </button>
        );
      })}

      {sparkleAt && (
        <div className="eyes-popup-sparkle" style={{ left: `${sparkleAt.x}%`, top: `${sparkleAt.y}%` }}>
          <SparkleAnimation type="magic" count={18} color="#ffd700" size={14} duration={700} fadeOut />
        </div>
      )}

      {shimmerAt && <div className="eyes-popup-shimmer" style={{ left: `${shimmerAt.x}%`, top: `${shimmerAt.y}%` }} />}

      <div className="eyes-popup-progress">
        {ANIMALS.map((animal) => (
          <div key={animal.key} className={`eyes-popup-slot ${foundKeys.includes(animal.key) ? 'is-filled' : ''}`}>
            {foundKeys.includes(animal.key) ? animal.label : '?'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EyesPopUpGame;
