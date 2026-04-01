// zones/symbol-mountain/scenes/symbol/components/EyesTelescopeGame.jsx
// 🔭 INLINE telescope game - Header updates automatically on fallback

import React, { useState, useEffect, useRef } from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';

// Unified Header
import UnifiedHeaderV2 from '../../../../lib/components/ui/Header/UnifiedHeaderV2';

// Import images
import musicalTabla from './assets/images/musical-tabla-colored.png';
import musicalFlute from './assets/images/musical-flute-colored.png';
import musicalBells from './assets/images/musical-bells-colored.png';
import musicalCymbals from './assets/images/musical-cymbals-colored.png';
import mooshikaCoach from './assets/images/mooshika-coach.png';

// Enhanced Divine Telescope SVG
const telescope = `data:image/svg+xml;base64,${btoa(`
<svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="70" fill="none" stroke="#8B4513" stroke-width="8"/>
  <circle cx="75" cy="75" r="62" fill="url(#lensGradient)"/>
  <circle cx="75" cy="75" r="55" fill="url(#glassGradient)" opacity="0.9"/>
  <ellipse cx="60" cy="60" rx="20" ry="25" fill="url(#reflectionGradient)" opacity="0.6"/>
  <line x1="75" y1="35" x2="75" y2="115" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <line x1="35" y1="75" x2="115" y2="75" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <circle cx="75" cy="75" r="15" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <circle cx="75" cy="75" r="68" fill="none" stroke="url(#glowGradient)" stroke-width="4" opacity="0.7"/>
  <defs>
    <radialGradient id="lensGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
      <stop offset="70%" stop-color="rgba(0,0,0,0.3)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.8)"/>
    </radialGradient>
    <radialGradient id="glassGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="rgba(135,206,235,0.2)"/>
      <stop offset="50%" stop-color="rgba(135,206,235,0.1)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
    </radialGradient>
    <radialGradient id="reflectionGradient" cx="0.3" cy="0.3">
      <stop offset="0%" stop-color="rgba(255,255,255,0.8)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,0.3)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="glowGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#FFA500"/>
      <stop offset="100%" stop-color="#FF8C00"/>
    </radialGradient>
  </defs>
</svg>
`)}`;

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla', emoji: '🥁' },
  flute: { image: musicalFlute, name: 'Flute', emoji: '🎵' },
  bells: { image: musicalBells, name: 'Bells', emoji: '🔔' },
  cymbals: { image: musicalCymbals, name: 'Cymbals', emoji: '🎶' }
};

const defaultInstrumentPositions = {
  1: { x: 75, y: 35, type: 'tabla' },
  2: { x: 75, y: 25, type: 'flute' },
  3: { x: 45, y: 45, type: 'bells' },
  4: { x: 25, y: 70, type: 'cymbals' }
};

const EyesTelescopeGame = ({ 
  isActive = false,
  instrumentPositions = defaultInstrumentPositions,
  instrumentSizes = {},
  discoveryRadius = 15,
  onInstrumentFound,
  onAllInstrumentsFound,
  onClose,
  profileName = 'little explorer',
  initialDiscoveredInstruments = {},
  initialFoundInstruments = [],
  isReload = false
}) => {
  const [telescopePosition, setTelescopePosition] = useState({ top: '50%', left: '50%' });
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [foundInstruments, setFoundInstruments] = useState(initialFoundInstruments);
  const [discoveredInstruments, setDiscoveredInstruments] = useState(initialDiscoveredInstruments);
  const [showSparkle, setShowSparkle] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState(Date.now());
  const [showInstrumentGlow, setShowInstrumentGlow] = useState(false);
  
  const [clickableFallbackEnabled, setClickableFallbackEnabled] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

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
        setLastDiscoveryTime(Date.now());
        setShowInstrumentGlow(false);
        setGameStartTime(Date.now());
        setClickableFallbackEnabled(false);
      } else {
        setFoundInstruments([]);
        setDiscoveredInstruments({});
        setGameComplete(false);
        setShowSparkle(null);
        setTelescopePosition({ top: '50%', left: '50%' });
        setLastDiscoveryTime(Date.now());
        setShowInstrumentGlow(false);
        setGameStartTime(Date.now());
        setClickableFallbackEnabled(false);
      }
    }
  }, [isActive, isReload]);

  useEffect(() => {
    if (gameComplete || foundInstruments.length === 0 || foundInstruments.length === 4) {
      setShowInstrumentGlow(false);
      return;
    }
    
    const checkStuckTimer = setInterval(() => {
      const timeSinceLastDiscovery = Date.now() - lastDiscoveryTime;
      if (timeSinceLastDiscovery > 20000 && foundInstruments.length > 0 && foundInstruments.length < 4) {
        setShowInstrumentGlow(true);
      }
    }, 1000);
    
    return () => clearInterval(checkStuckTimer);
  }, [lastDiscoveryTime, foundInstruments.length, gameComplete]);

  // Fallback Timer (40s)
  useEffect(() => {
    if (gameComplete || foundInstruments.length === 4) return;
    
    const fallbackTimer = setInterval(() => {
      const timeSinceGameStart = Date.now() - gameStartTime;
      if (timeSinceGameStart > 40000 && foundInstruments.length === 0 && !clickableFallbackEnabled) {
        setClickableFallbackEnabled(true);
        setShowInstrumentGlow(true);
      }
    }, 1000);
    
    return () => clearInterval(fallbackTimer);
  }, [gameStartTime, foundInstruments.length, gameComplete, clickableFallbackEnabled]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const checkInstrumentDiscovery = (telescopeX, telescopeY) => {
    Object.keys(instrumentPositions).forEach(instrumentId => {
      const instrumentPos = instrumentPositions[instrumentId];
      const distance = Math.sqrt(
        Math.pow(telescopeX - instrumentPos.x, 2) + 
        Math.pow(telescopeY - instrumentPos.y, 2)
      );
      
      if (distance < discoveryRadius && !foundInstruments.includes(instrumentPos.type)) {
        discoverInstrument(instrumentPos.type, parseInt(instrumentId));
      }
    });
  };

  const discoverInstrument = (instrumentType, instrumentId) => {
    setLastDiscoveryTime(Date.now());
    
    const newFoundInstruments = [...foundInstruments, instrumentType];
    const newDiscoveredInstruments = {
      ...discoveredInstruments,
      [instrumentType]: true
    };
    
    setFoundInstruments(newFoundInstruments);
    setDiscoveredInstruments(newDiscoveredInstruments);
    setShowSparkle(`instrument-${instrumentType}-found`);
    
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    
    safeSetTimeout(() => {
      setShowSparkle(null);
    }, 2000);
    
    if (onInstrumentFound) {
      onInstrumentFound(instrumentType, newFoundInstruments, newDiscoveredInstruments);
    }
    
    if (newFoundInstruments.length === 4) {
      setShowInstrumentGlow(false);
      safeSetTimeout(() => {
        handleGameComplete(newFoundInstruments, newDiscoveredInstruments);
      }, 1500);
    }
  };

  const handleGameComplete = (finalFoundInstruments, finalDiscoveredInstruments) => {
    setGameComplete(true);
    setShowSparkle('all-instruments-found');
    setShowInstrumentGlow(false);
    setClickableFallbackEnabled(false);
    
    safeSetTimeout(() => {
      if (onAllInstrumentsFound) {
        onAllInstrumentsFound(finalFoundInstruments, finalDiscoveredInstruments);
      }
    }, 2000);
  };

  if (!isActive) return null;

  return (
    <div className="eyes-telescope-game-inline" style={inlineContainerStyle}>
      
      {/* 🟢 UNIFIED HEADER - commented out
      <UnifiedHeaderV2
        zone="symbol-mountain"
        title={clickableFallbackEnabled
          ? "CLICK GLOWING INSTRUMENTS!"
          : "DRAG TELESCOPE! Find hidden instruments!"}
        currentRound={foundInstruments.length}
        totalRounds={4}
      />
      */}
      
      <FreeDraggableItem
        id="divine-telescope"
        position={telescopePosition}
        onPositionChange={(newPosition) => {
          setTelescopePosition(newPosition);
          const percentX = parseFloat(newPosition.left);
          const percentY = parseFloat(newPosition.top);
          checkInstrumentDiscovery(percentX, percentY);
        }}
        onDragStart={() => setTelescopeDragging(true)}
        onDragEnd={() => setTelescopeDragging(false)}
        disabled={gameComplete}
        className={`telescope-container ${telescopeDragging ? 'dragging' : ''}`}
        style={{
          width: '160px', height: '160px', zIndex: 25,
          opacity: clickableFallbackEnabled ? 0.5 : 1
        }}
        bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
      >
        <img 
          src={telescope} 
          alt="Telescope" 
          style={{ 
            width: '100%', height: '100%',
            filter: telescopeDragging ? 'brightness(1.2)' : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
            pointerEvents: 'none'
          }}
        />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '160px', height: '160px',
          border: telescopeDragging ? '2px dashed rgba(135, 206, 235, 0.6)' : 'none',
          borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
        }} />
      </FreeDraggableItem>
      
      <div className="discovered-instruments-container">
        {Object.keys(instrumentPositions).map(instrumentId => {
          const instrumentData = instrumentPositions[instrumentId];
          const isDiscovered = foundInstruments.includes(instrumentData.type);
          const shouldGlow = !isDiscovered && showInstrumentGlow;
          const isClickable = !isDiscovered && clickableFallbackEnabled;
          const sizeConfig = instrumentSizes[instrumentData.type]?.eyes || {};
          const discoveredSize = sizeConfig.discovered || 290;
          const glowSize = sizeConfig.glow || 150;
          const hiddenSize = sizeConfig.hidden || 120;
          
          return (
            <div 
              key={instrumentId}
              className={`discovered-instrument ${isDiscovered ? 'discovered' : ''} ${shouldGlow ? 'glowing-hint' : ''} ${isClickable ? 'clickable-fallback' : ''}`}
              style={{
                position: 'absolute',
                top: `${instrumentData.y}%`,
                left: `${instrumentData.x}%`,
                width: `${isDiscovered ? discoveredSize : (shouldGlow ? glowSize : hiddenSize)}px`,
                height: `${isDiscovered ? discoveredSize : (shouldGlow ? glowSize : hiddenSize)}px`,
                opacity: isDiscovered ? 1 : (shouldGlow ? 0.45 : 0),
                transition: 'all 0.5s ease',
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
                pointerEvents: isClickable ? 'auto' : 'none',
                cursor: isClickable ? 'pointer' : 'default'
              }}
              onClick={isClickable ? () => discoverInstrument(instrumentData.type, parseInt(instrumentId)) : undefined}
            >
              <img 
                src={musicalInstruments[instrumentData.type].image} 
                alt={instrumentData.type}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation type="star" count={15} color="rgba(135, 206, 235, 0.8)" size={8} duration={1500} fadeOut={true} area="full" />
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
        .telescope-container { animation: gentlePulse 3.8s ease-in-out infinite; }
        @keyframes gentlePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        .discovered-instrument.discovered { animation: instrumentGlow 3.4s ease-in-out infinite; }
        @keyframes instrumentGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
          50% { filter: brightness(1.08) drop-shadow(0 0 5px rgba(255, 255, 255, 0.35)); }
        }
        .discovered-instrument.glowing-hint { animation: undiscoveredGlow 3.2s ease-in-out infinite; }
        @keyframes undiscoveredGlow {
          0%, 100% { opacity: 0.42; filter: brightness(1.05) drop-shadow(0 0 4px rgba(255, 215, 0, 0.35)); }
          50% { opacity: 0.6; filter: brightness(1.12) drop-shadow(0 0 8px rgba(255, 215, 0, 0.55)); }
        }
        .discovered-instrument.clickable-fallback { animation: clickablePulse 2.6s ease-in-out infinite; }
        @keyframes clickablePulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1.05) drop-shadow(0 0 5px rgba(76, 175, 80, 0.35)); }
          50% { transform: translate(-50%, -50%) scale(1.05); filter: brightness(1.12) drop-shadow(0 0 8px rgba(76, 175, 80, 0.55)); }
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
