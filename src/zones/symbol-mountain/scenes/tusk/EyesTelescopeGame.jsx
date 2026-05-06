// zones/symbol-mountain/scenes/symbol/components/EyesTelescopeGame.jsx
// 🔭 INLINE telescope game

import React, { useState, useEffect, useRef } from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';

// Import images
import musicalTabla from './assets/images/tabla-new.png';
import musicalDholak from './assets/images/dholak-new.png';
import musicalHarmonium from './assets/images/harmonium-new.png';
import musicalTanpura from './assets/images/tanpura-new.png';
import mglass from './assets/images/mglass.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla', emoji: '🥁' },
  dholak: { image: musicalDholak, name: 'Dholak', emoji: '🥁' },
  harmonium: { image: musicalHarmonium, name: 'Harmonium', emoji: '🎹' },
  tanpura: { image: musicalTanpura, name: 'Tanpura', emoji: '🎸' }
};

const defaultInstrumentPositions = {
  1: { x: 39, y: 44, type: 'tabla' },
  2: { x: 64, y: 72, type: 'dholak' },
  3: { x: 23, y: 71, type: 'harmonium' },
  4: { x: 86, y: 47, type: 'tanpura' }
};

const EyesTelescopeGame = ({
  isActive = false,
  instrumentPositions = defaultInstrumentPositions,
  instrumentSizes = {},
  discoveryRadius = 18,
  onInstrumentFound,
  onAllInstrumentsFound,
  onClose,
  initialDiscoveredInstruments = {},
  initialFoundInstruments = [],
  isReload = false
}) => {
  const [telescopePosition, setTelescopePosition] = useState({ top: '50%', left: '50%' });
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [proximityState, setProximityState] = useState('cool');
  const [foundInstruments, setFoundInstruments] = useState(initialFoundInstruments);
  const [discoveredInstruments, setDiscoveredInstruments] = useState(initialDiscoveredInstruments);
  const [showSparkle, setShowSparkle] = useState(null);
  const [showGestureOn, setShowGestureOn] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const idleHintVoiceRef = useRef(false);
  const openingVoicePlayedRef = useRef(false);
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const { isAudioOn } = useAudioPreference();
  const { speak, stop } = useGaneshaVoice();

  const timeoutsRef = useRef([]);
  const markIdleInteraction = () => {
    lastIdleInteractionAtRef.current = Date.now();
    setIdleHintLevel(0);
    idleHintVoiceRef.current = false;
  };

  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  useEffect(() => {
    if (isActive) {
      setShowMagnifier(false);
      const showTimer = setTimeout(() => setShowMagnifier(true), 200);
      timeoutsRef.current.push(showTimer);
      openingVoicePlayedRef.current = false;
      if (isReload && initialFoundInstruments.length > 0) {
        setFoundInstruments(initialFoundInstruments);
        setDiscoveredInstruments(initialDiscoveredInstruments);
        setGameComplete(initialFoundInstruments.length === 4);
        setShowSparkle(null);
        setShowGestureOn(null);
        setProximityState('cool');
        lastIdleInteractionAtRef.current = Date.now();
        setIdleHintLevel(0);
        idleHintVoiceRef.current = false;
      } else {
        setFoundInstruments([]);
        setDiscoveredInstruments({});
        setGameComplete(false);
        setShowSparkle(null);
        setShowGestureOn(null);
        setProximityState('cool');
        setTelescopePosition({ top: '50%', left: '50%' });
        lastIdleInteractionAtRef.current = Date.now();
        setIdleHintLevel(0);
        idleHintVoiceRef.current = false;
      }
    }
  }, [isActive, isReload]);

  // Play telescope opening VO once when magnifying glass/game appears.
  useEffect(() => {
    if (!isActive || gameComplete || foundInstruments.length >= 4) return;
    if (openingVoicePlayedRef.current) return;
    if (!isAudioOn) return;

    const timer = setTimeout(() => {
      speak('Drag the magnifying glass... find the instruments.', {
        age: 11,
        moment: 'default'
      });
      openingVoicePlayedRef.current = true;
    }, 450);

    return () => clearTimeout(timer);
  }, [isActive, gameComplete, foundInstruments.length, isAudioOn, speak]);

  useEffect(() => {
    if (!isActive || gameComplete || foundInstruments.length >= 4) {
      setIdleHintLevel(0);
      idleHintVoiceRef.current = false;
      return;
    }

    const tick = setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel(prev => (prev === nextLevel ? prev : nextLevel));
    }, 250);

    return () => clearInterval(tick);
  }, [isActive, gameComplete, foundInstruments.length]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!isActive || gameComplete || foundInstruments.length >= 4) {
      idleHintVoiceRef.current = false;
      return;
    }

    if (idleHintLevel < 2) {
      idleHintVoiceRef.current = false;
      return;
    }

    if (!idleHintVoiceRef.current && isAudioOn) {
      speak('Drag the magnifying glass... look closely.', {
        age: 11,
        moment: 'default'
      });
      idleHintVoiceRef.current = true;
    }
  }, [idleHintLevel, isActive, gameComplete, foundInstruments.length, isAudioOn, speak]);

  const checkInstrumentDiscovery = (telescopeX, telescopeY) => {
    let nearestUndiscoveredDistance = Infinity;

    Object.keys(instrumentPositions).forEach(instrumentId => {
      const instrumentPos = instrumentPositions[instrumentId];
      const distance = Math.sqrt(
        Math.pow(telescopeX - instrumentPos.x, 2) + 
        Math.pow(telescopeY - instrumentPos.y, 2)
      );

      if (!foundInstruments.includes(instrumentPos.type) && distance < nearestUndiscoveredDistance) {
        nearestUndiscoveredDistance = distance;
      }

      if (distance < discoveryRadius && !foundInstruments.includes(instrumentPos.type)) {
        discoverInstrument(instrumentPos.type);
      }
    });

    if (nearestUndiscoveredDistance < discoveryRadius * 1.6 && nearestUndiscoveredDistance >= discoveryRadius) {
      setProximityState('warm');
    } else {
      setProximityState('cool');
    }
  };

  const discoverInstrument = (instrumentType) => {
    markIdleInteraction();
    
    const newFoundInstruments = [...foundInstruments, instrumentType];
    const newDiscoveredInstruments = {
      ...discoveredInstruments,
      [instrumentType]: true
    };
    
    setFoundInstruments(newFoundInstruments);
    setDiscoveredInstruments(newDiscoveredInstruments);
    setShowSparkle(`instrument-${instrumentType}-found`);
    setShowGestureOn(instrumentType);

    if (isAudioOn) {
      const instrumentName = musicalInstruments[instrumentType]?.name || instrumentType;
      speak(instrumentName, {
        age: 11,
        moment: 'default'
      });
    }
    
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowGestureOn(null);
    }, 2000);
    
    if (onInstrumentFound) {
      onInstrumentFound(instrumentType, newFoundInstruments, newDiscoveredInstruments);
    }
    
    if (newFoundInstruments.length === 4) {
      safeSetTimeout(() => {
        handleGameComplete(newFoundInstruments, newDiscoveredInstruments);
      }, 1500);
    }
  };

  const handleGameComplete = (finalFoundInstruments, finalDiscoveredInstruments) => {
    setGameComplete(true);
    setShowSparkle('all-instruments-found');
    
    safeSetTimeout(() => {
      if (onAllInstrumentsFound) {
        onAllInstrumentsFound(finalFoundInstruments, finalDiscoveredInstruments);
      }
    }, 2000);
  };

  if (!isActive) return null;

  return (
    <div className="eyes-telescope-game-inline" style={inlineContainerStyle}>
      
      <FreeDraggableItem
        id="magnifying-glass"
        position={telescopePosition}
        onPositionChange={(newPosition) => {
          setTelescopePosition(newPosition);
          markIdleInteraction();
          const percentX = parseFloat(newPosition.left);
          const percentY = parseFloat(newPosition.top);
          checkInstrumentDiscovery(percentX, percentY);
        }}
        onDragStart={() => {
          setTelescopeDragging(true);
          markIdleInteraction();
        }}
        onDragEnd={() => setTelescopeDragging(false)}
        disabled={gameComplete}
        className={`magnifier magnifier-container ${showMagnifier ? 'show' : ''} ${telescopeDragging ? 'dragging active' : ''}`}
        style={{
          width: 'clamp(140px, 18vw, 240px)', height: 'clamp(140px, 18vw, 240px)', zIndex: 25,
          cursor: 'grab',
          opacity: 1,
          animation:
            idleHintLevel === 1
              ? 'idleWobble 0.5s ease-in-out 1'
              : idleHintLevel === 2
                ? 'idleWobbleStrong 0.6s ease-in-out 2'
                : idleHintLevel >= 3
                  ? 'idleWobbleFinal 0.7s ease-in-out 3'
                  : 'none'
        }}
        bounds={{ top: 8, left: 2, right: 98, bottom: 95 }}
      >
        <img 
          src={mglass}
          alt="Magnifying Glass"
          style={{ 
            width: '100%', height: '100%',
            objectFit: 'contain',
            filter: telescopeDragging 
              ? (proximityState === 'warm'
                  ? 'brightness(1.2) drop-shadow(0 0 16px rgba(255, 215, 0, 0.7))'
                  : 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.3))')
              : 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
            transform: telescopeDragging ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            pointerEvents: 'none'
          }}
        />
      </FreeDraggableItem>
      
      <div className="discovered-instruments-container">
        {Object.keys(instrumentPositions).map(instrumentId => {
          const instrumentData = instrumentPositions[instrumentId];
          const isDiscovered = foundInstruments.includes(instrumentData.type);
          const hintClassName = !isDiscovered && idleHintLevel === 1
            ? 'hint'
            : !isDiscovered && idleHintLevel === 2
              ? 'hint-strong'
              : !isDiscovered && idleHintLevel >= 3
                ? 'hint-final'
                : '';
          const shouldHint = !isDiscovered && idleHintLevel >= 1;
          const hintOpacity = idleHintLevel >= 3 ? 0.68 : idleHintLevel === 2 ? 0.55 : 0.42;
          const sizeConfig = instrumentSizes[instrumentData.type]?.eyes || {};
          const discoveredSize = sizeConfig.discovered || 290;
          const glowSize = sizeConfig.glow || 150;
          const hiddenSize = sizeConfig.hidden || 120;
          
          return (
            <div 
              key={instrumentId}
              className={`discovered-instrument ${isDiscovered ? 'discovered' : ''} ${hintClassName}`}
              style={{
                position: 'absolute',
                top: `${instrumentData.y}%`,
                left: `${instrumentData.x}%`,
                width: `${isDiscovered ? discoveredSize : (shouldHint ? glowSize : hiddenSize)}px`,
                height: `${isDiscovered ? discoveredSize : (shouldHint ? glowSize : hiddenSize)}px`,
                opacity: isDiscovered ? 1 : (shouldHint ? hintOpacity : 0),
                transition: 'all 0.5s ease',
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
                pointerEvents: 'none',
                cursor: 'default'
              }}
            >
              {isDiscovered ? (
                <img
                  src={musicalInstruments[instrumentData.type]?.image}
                  alt={musicalInstruments[instrumentData.type]?.name || instrumentData.type}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25))',
                    transform: 'none'
                  }}
                />
              ) : (
                <div className={`undiscovered-glow ${hintClassName}`} aria-hidden="true" />
              )}
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation type="star" count={15} color="rgba(135, 206, 235, 0.8)" size={8} duration={1500} fadeOut={true} area="full" />
              )}
              {showGestureOn === instrumentData.type && (
                <div className="eyes-mini-gesture" aria-hidden="true">
                  <img src="/images/hand-thumbsup.svg" alt="" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showSparkle === 'all-instruments-found' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SparkleAnimation type="glitter" count={40} color="rgba(135, 206, 235, 0.8)" size={12} duration={3000} fadeOut={true} area="full" />
        </div>
      )}
      
      <style>{`
        @keyframes popIn { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes idleWobble {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes idleWobbleStrong {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes idleWobbleFinal {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .discovered-instrument.discovered { animation: instrumentGlow 3.4s ease-in-out infinite; }
        @keyframes instrumentGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
          50% { filter: brightness(1.08) drop-shadow(0 0 5px rgba(255, 255, 255, 0.35)); }
        }
        .undiscovered-glow {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 181, 246, 0.30) 0%, rgba(100, 181, 246, 0.14) 48%, rgba(100, 181, 246, 0) 72%);
          border: 2px solid rgba(100, 181, 246, 0.58);
          box-shadow: 0 0 0 rgba(100, 181, 246, 0);
        }
        .discovered-instrument.hint .undiscovered-glow { animation: undiscoveredHint 1.6s ease-in-out 1; }
        @keyframes undiscoveredHint {
          0%, 100% {
            box-shadow: 0 0 0 rgba(100, 181, 246, 0);
            border-color: rgba(100, 181, 246, 0.45);
          }
          50% {
            box-shadow: 0 0 14px rgba(100, 181, 246, 0.78);
            border-color: rgba(100, 181, 246, 0.84);
          }
        }
        .discovered-instrument.hint-strong .undiscovered-glow { animation: undiscoveredHintStrong 1.25s ease-in-out 2; }
        @keyframes undiscoveredHintStrong {
          0%, 100% {
            box-shadow: 0 0 0 rgba(100, 181, 246, 0);
            border-color: rgba(100, 181, 246, 0.58);
          }
          50% {
            box-shadow: 0 0 18px rgba(100, 181, 246, 0.88);
            border-color: rgba(100, 181, 246, 0.9);
          }
        }
        .discovered-instrument.hint-final .undiscovered-glow { animation: undiscoveredHintFinal 1s ease-in-out 3; }
        @keyframes undiscoveredHintFinal {
          0%, 100% {
            box-shadow: 0 0 0 rgba(100, 181, 246, 0);
            border-color: rgba(100, 181, 246, 0.62);
          }
          50% {
            box-shadow: 0 0 22px rgba(100, 181, 246, 0.92);
            border-color: rgba(100, 181, 246, 0.92);
          }
        }
        .eyes-mini-gesture {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 42px;
          height: 42px;
          pointer-events: none;
          z-index: 5;
          animation: eyesMiniGesturePop 1.1s ease-out;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
        }
        .eyes-mini-gesture img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        @keyframes eyesMiniGesturePop {
          0% { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.85); }
          25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.08); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(1); }
        }
      `}</style>
    </div>
  );
};

const inlineContainerStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, pointerEvents: 'auto'
};

export default EyesTelescopeGame;
