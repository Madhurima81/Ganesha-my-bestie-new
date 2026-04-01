import React, { useState, useEffect } from 'react';
import './RotatingOrbsEffect.css';
import Fireworks from './Fireworks';

const RotatingOrbsEffect = ({
  show = false,
  duration = 6000,
  symbolImages = {},
  onComplete,
  ganeshaImage,
  playerName = 'little explorer',
  orbitCenter = { top: '50%', left: '50%' },
  orbSize = 500,
  orbRadius = 200,
  showCentralGanesha = true,
  showBuiltInFireworks = true
}) => {
  const [currentPhase, setCurrentPhase] = useState('hidden');
  const [orbsVisible, setOrbsVisible] = useState(false);
  const [ganeshaAwakened, setGaneshaAwakened] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const SACRED_SYMBOLS = Object.keys(symbolImages).map((key, index) => ({
    id: key,
    image: symbolImages[key],
    position: index * 45,
    blessing: {
      vakratunda: 'Obstacle Remover',
      mahakaya: 'Great Strength',
      samaprabha: 'Equal Light',
      suryakoti: 'Solar Power',
      nirvighnam: 'Unobstructed',
      kurumedeva: 'Divine Action',
      sarvakaryeshu: 'All Tasks',
      sarvada: 'Always',
      mooshika: 'Divine Vehicle',
      modak: 'Sweet Blessings',
      belly: 'Universe Within',
      lotus: 'Pure Wisdom',
      trunk: 'Obstacle Remover',
      eyes: 'Divine Sight',
      ears: 'Sacred Listening',
      tusk: 'Breaking Barriers'
    }[key] || 'Sacred Power'
  }));

  useEffect(() => {
    if (!show) {
      setCurrentPhase('hidden');
      setOrbsVisible(false);
      setGaneshaAwakened(false);
      setShowFireworks(false);
      return;
    }

    setCurrentPhase('orbs-appearing');
    setOrbsVisible(true);

    setTimeout(() => {
      setCurrentPhase('ganesha-awakening');
      setGaneshaAwakened(true);
    }, 2000);

    setTimeout(() => {
      setCurrentPhase('convergence');
    }, 4000);

    setTimeout(() => {
      setShowFireworks(true);
    }, 6000);

    setTimeout(() => {
      setShowFireworks(false);
      onComplete?.();
    }, duration);
  }, [show, duration, onComplete]);

  if (!show || currentPhase === 'hidden') return null;

  return (
    <div className="rotating-orbs-effect">
      {orbsVisible && (
        <div
          className="orbs-container"
          style={{
            top: orbitCenter.top,
            left: orbitCenter.left,
            width: `${orbSize}px`,
            height: `${orbSize}px`
          }}
        >
          <div className={`orb-circle ${ganeshaAwakened ? 'converging' : ''}`}>
            {SACRED_SYMBOLS.map((symbol, index) => (
              <div
                key={symbol.id}
                className={`sacred-orb orb-${index} ${currentPhase}`}
                style={{
                  '--rotation': `${symbol.position}deg`,
                  '--delay': `${index * 0.1}s`,
                  '--orb-radius': `${orbRadius}px`
                }}
              >
                <div className="orb-inner">
                  <img
                    src={symbol.image}
                    alt={symbol.id}
                    className="orb-symbol"
                  />
                  <div className="orb-glow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCentralGanesha && ganeshaAwakened && (
        <div
          className="central-ganesha-container"
          style={{ top: orbitCenter.top, left: orbitCenter.left }}
        >
          <div className="divine-aura" />
          <div className="ganesha-manifestation">
            {ganeshaImage ? (
              <img
                src={ganeshaImage}
                alt="Divine Ganesha"
                className="ganesha-divine-image"
              />
            ) : (
              <div className="ganesha-emoji">🐘</div>
            )}
          </div>
        </div>
      )}

      {showBuiltInFireworks && showFireworks && (
        <Fireworks
          show={true}
          variant="zone"
          duration={6000}
          count={20}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,
            pointerEvents: 'none'
          }}
          onComplete={() => {}}
        />
      )}
    </div>
  );
};

export default RotatingOrbsEffect;
