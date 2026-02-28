// RotatingOrbsEffect.jsx - With Integrated Fireworks
import React, { useState, useEffect } from 'react';
import './RotatingOrbsEffect.css';
import Fireworks from './Fireworks';  // ← ADD FIREWORKS IMPORT

const RotatingOrbsEffect = ({
  show = false,
  duration = 6000,
  symbolImages = {},
  onComplete,
  ganeshaImage,
  playerName = 'little explorer'
}) => {
  const [currentPhase, setCurrentPhase] = useState('hidden');
  const [orbsVisible, setOrbsVisible] = useState(false);
  const [ganeshaAwakened, setGaneshaAwakened] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);  // ← ADD FIREWORKS STATE

  // Sacred symbols for orbs
  /*const SACRED_SYMBOLS = [
    { id: 'mooshika', image: symbolImages.mooshika, position: 0, blessing: 'Divine Vehicle' },
    { id: 'modak', image: symbolImages.modak, position: 45, blessing: 'Sweet Blessings' },
    { id: 'belly', image: symbolImages.belly, position: 90, blessing: 'Universe Within' },
    { id: 'lotus', image: symbolImages.lotus, position: 135, blessing: 'Pure Wisdom' },
    { id: 'trunk', image: symbolImages.trunk, position: 180, blessing: 'Obstacle Remover' },
    { id: 'eyes', image: symbolImages.eyes, position: 225, blessing: 'Divine Sight' },
    { id: 'ears', image: symbolImages.ears, position: 270, blessing: 'Sacred Listening' },
    { id: 'tusk', image: symbolImages.tusk, position: 315, blessing: 'Breaking Barriers' }
  ];*/

  // Dynamic symbols based on what's passed
const SACRED_SYMBOLS = Object.keys(symbolImages).map((key, index) => ({
  id: key,
  image: symbolImages[key],
  position: index * 45, // 360/8 = 45 degrees apart
  blessing: {
    vakratunda: 'Obstacle Remover',
    mahakaya: 'Great Strength', 
    samaprabha: 'Equal Light',
    suryakoti: 'Solar Power',
    nirvighnam: 'Unobstructed',
    kurumedeva: 'Divine Action',
    sarvakaryeshu: 'All Tasks',
    sarvada: 'Always',
    // Mountain symbols (for backwards compatibility)
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
      setShowFireworks(false);  // ← ADD FIREWORKS CLEANUP
      return;
    }

    console.log('🌟 Starting Slow Rotating Orbs Effect with Fireworks');

    // Phase 1: Orbs appear immediately (no blessing text)
    setCurrentPhase('orbs-appearing');
    setOrbsVisible(true);
    
    // Phase 2: Ganesha awakens in center (longer delay for slower pace)
    setTimeout(() => {
      setCurrentPhase('ganesha-awakening');
      setGaneshaAwakened(true);
    }, 2000);

    // Phase 3: Convergence + FIREWORKS! (much longer for meditative effect)
    setTimeout(() => {
      setCurrentPhase('convergence');
      setShowFireworks(true);  // ← START FIREWORKS DURING CONVERGENCE
    }, 4000);

    // Complete after duration (longer total duration)
    setTimeout(() => {
      console.log('🎆 Slow orb effect with fireworks complete');
      setShowFireworks(false);  // ← STOP FIREWORKS BEFORE COMPLETION
      onComplete?.();
    }, duration);

  }, [show, duration, onComplete]);

  if (!show || currentPhase === 'hidden') return null;

  return (
    <div className="rotating-orbs-effect">
      
      {/* Cosmic background effect */}
      <div className="cosmic-background">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="cosmic-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Rotating orbs container */}
      {orbsVisible && (
        <div className="orbs-container">
          <div className={`orb-circle ${ganeshaAwakened ? 'converging' : ''}`}>
            {SACRED_SYMBOLS.map((symbol, index) => (
              <div
                key={symbol.id}
                className={`sacred-orb orb-${index} ${currentPhase}`}
                style={{
                  '--rotation': `${symbol.position}deg`,
                  '--delay': `${index * 0.1}s`
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
                
                {/* Blessing text that appears on hover/touch */}
                <div className="orb-blessing">
                  {symbol.blessing}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Central Ganesha manifestation - Pure visual, no text */}
      {ganeshaAwakened && (
        <div className="central-ganesha-container">
          <div className="divine-aura">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className={`aura-ring ring-${i + 1}`}
              />
            ))}
          </div>
          
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

      {/* Integrated Fireworks Effect */}
      {showFireworks && (
        <Fireworks
          show={true}
          duration={6000}  // 6 seconds of fireworks during final phase
          count={20}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,  // Above orbs but below Ganesha
            pointerEvents: 'none'
          }}
          onComplete={() => {
            console.log('🎆 Fireworks completed within orb effect');
            // Don't call main onComplete here - let the main timer handle it
          }}
        />
      )}

      {/* Particle effects for extra magic */}
      {currentPhase === 'convergence' && (
        <div className="particle-effects">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="magic-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RotatingOrbsEffect;