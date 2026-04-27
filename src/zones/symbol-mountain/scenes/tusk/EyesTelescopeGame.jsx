// zones/symbol-mountain/scenes/symbol/components/EyesTelescopeGame.jsx
// 🔭 INLINE telescope game

import React, { useState, useEffect, useRef } from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';

// Import images
import musicalTabla from './assets/images/tabla-new.png';
import musicalFlute from './assets/images/flute-new.png';
import musicalHarmonium from './assets/images/harmonium-new.png';
import musicalTanpura from './assets/images/tanpura-new.png';
import mglass from './assets/images/mglass.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla', emoji: '🥁' },
  flute: { image: musicalFlute, name: 'Flute', emoji: '🎵' },
  harmonium: { image: musicalHarmonium, name: 'Harmonium', emoji: '🎹' },
  tanpura: { image: musicalTanpura, name: 'Tanpura', emoji: '🎸' }
};

const defaultInstrumentPositions = {
  1: { x: 75, y: 35, type: 'tabla' },
  2: { x: 75, y: 25, type: 'flute' },
  3: { x: 45, y: 45, type: 'harmonium' },
  4: { x: 25, y: 70, type: 'tanpura' }
};

const EyesTelescopeGame = ({ 
  isActive = false,
  instrumentPositions = defaultInstrumentPositions,
  instrumentSizes = {},
  discoveryRadius = 15,
  onInstrumentFound,
  onAllInstrumentsFound,
  onClose,
  initialDiscoveredInstruments = {},
  initialFoundInstruments = [],
  isReload = false
}) => {
  const [telescopePosition, setTelescopePosition] = useState({ top: '50%', left: '50%' });
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [proximityState, setProximityState] = useState('cool');
  const [foundInstruments, setFoundInstruments] = useState(initialFoundInstruments);
  const [discoveredInstruments, setDiscoveredInstruments] = useState(initialDiscoveredInstruments);
  const [showSparkle, setShowSparkle] = useState(null);
  const [showGestureOn, setShowGestureOn] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const idleHintVoiceRef = useRef(false);
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
      speak('Drag the magnifying glass to find the instruments.', {
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
        className={`magnifier-container ${telescopeDragging ? 'dragging' : ''}`}
        style={{
          width: '160px', height: '160px', zIndex: 25,
          cursor: 'grab',
          opacity: 1,
          animation: idleHintLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'none'
        }}
        bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
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
      
      {onClose && <button style={inlineCloseStyle} onClick={onClose}>✕</button>}
      
      <style>{`
        @keyframes popIn { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes idleWobble {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .discovered-instrument.discovered { animation: instrumentGlow 3.4s ease-in-out infinite; }
        @keyframes instrumentGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
          50% { filter: brightness(1.08) drop-shadow(0 0 5px rgba(255, 255, 255, 0.35)); }
        }
        .discovered-instrument.hint { animation: undiscoveredHint 1.6s ease-in-out infinite; }
        @keyframes undiscoveredHint {
          0%, 100% { filter: brightness(1.05) drop-shadow(0 0 6px rgba(255, 209, 102, 0.5)); }
          50% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 209, 102, 0.8)); }
        }
        .discovered-instrument.hint-strong { animation: undiscoveredHintStrong 1.25s ease-in-out infinite; }
        @keyframes undiscoveredHintStrong {
          0%, 100% { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255, 196, 0, 0.7)); }
          50% { filter: brightness(1.14) drop-shadow(0 0 14px rgba(255, 196, 0, 0.95)); }
        }
        .discovered-instrument.hint-final { animation: undiscoveredHintFinal 1s ease-in-out infinite; }
        @keyframes undiscoveredHintFinal {
          0%, 100% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 170, 0, 0.85)); }
          50% { filter: brightness(1.18) drop-shadow(0 0 18px rgba(255, 170, 0, 1)); }
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

const inlineCloseStyle = {
  position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 255, 255, 0.9)',
  border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '16px',
  cursor: 'pointer', color: '#666', zIndex: 35
};

export default EyesTelescopeGame;
