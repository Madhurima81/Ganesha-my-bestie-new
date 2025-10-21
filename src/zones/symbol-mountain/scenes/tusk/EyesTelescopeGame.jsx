// zones/symbol-mountain/scenes/symbol/components/EyesTelescopeGame.jsx
// 🔭 INLINE telescope game with accessibility fallback

import React, { useState, useEffect, useRef } from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';

// Import your actual musical instrument images
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

// Musical instruments data
const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla', emoji: '🥁' },
  flute: { image: musicalFlute, name: 'Flute', emoji: '🎵' },
  bells: { image: musicalBells, name: 'Bells', emoji: '🔔' },
  cymbals: { image: musicalCymbals, name: 'Cymbals', emoji: '🎶' }
};

// Default instrument positions
const defaultInstrumentPositions = {
  1: { x: 15, y: 35, type: 'tabla' },
  2: { x: 75, y: 25, type: 'flute' },
  3: { x: 45, y: 45, type: 'bells' },
  4: { x: 25, y: 70, type: 'cymbals' }
};

const EyesTelescopeGame = ({ 
  isActive = false,
  instrumentPositions = defaultInstrumentPositions,
  discoveryRadius = 15,
  onInstrumentFound,
  onAllInstrumentsFound,
  onClose,
  profileName = 'little explorer',
  initialDiscoveredInstruments = {},
  initialFoundInstruments = [],
  isReload = false
}) => {
  console.log('🔭 EyesTelescopeGame inline render:', { isActive });

  // Game states
  const [telescopePosition, setTelescopePosition] = useState({ top: '50%', left: '50%' });
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [foundInstruments, setFoundInstruments] = useState(initialFoundInstruments);
  const [discoveredInstruments, setDiscoveredInstruments] = useState(initialDiscoveredInstruments);
  const [showSparkle, setShowSparkle] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Stuck detection states
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState(Date.now());
  const [showInstrumentGlow, setShowInstrumentGlow] = useState(false);
  
  // Accessibility fallback states
  const [clickableFallbackEnabled, setClickableFallbackEnabled] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  // Safe timeout
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Reset game when activated - WITH RELOAD SUPPORT
  useEffect(() => {
    if (isActive) {
      if (isReload && initialFoundInstruments.length > 0) {
        console.log('🔄 RELOAD: Restoring telescope progress:', initialFoundInstruments);
        setFoundInstruments(initialFoundInstruments);
        setDiscoveredInstruments(initialDiscoveredInstruments);
        setGameComplete(initialFoundInstruments.length === 4);
        setShowSparkle(null);
        setLastDiscoveryTime(Date.now());
        setShowInstrumentGlow(false);
        setGameStartTime(Date.now());
        setClickableFallbackEnabled(false);
      } else {
        console.log('🔭 Resetting inline telescope game');
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

  // Stuck detection - show glow after 20 seconds of no discoveries
  useEffect(() => {
    if (gameComplete || foundInstruments.length === 0 || foundInstruments.length === 4) {
      setShowInstrumentGlow(false);
      return;
    }
    
    const checkStuckTimer = setInterval(() => {
      const timeSinceLastDiscovery = Date.now() - lastDiscoveryTime;
      
      // If stuck for 20 seconds and haven't found all instruments
      if (timeSinceLastDiscovery > 20000 && foundInstruments.length > 0 && foundInstruments.length < 4) {
        console.log('🌟 Kid might be stuck - showing instrument glow');
        setShowInstrumentGlow(true);
      }
    }, 1000);
    
    return () => clearInterval(checkStuckTimer);
  }, [lastDiscoveryTime, foundInstruments.length, gameComplete]);

  // Accessibility fallback - enable click after 60 seconds with no progress
  useEffect(() => {
    if (gameComplete || foundInstruments.length === 4) {
      return;
    }
    
    const fallbackTimer = setInterval(() => {
      const timeSinceGameStart = Date.now() - gameStartTime;
      
      // Enable click fallback after 60 seconds with zero progress
      if (timeSinceGameStart > 60000 && foundInstruments.length === 0 && !clickableFallbackEnabled) {
        console.log('♿ Enabling accessibility fallback - instruments now clickable');
        setClickableFallbackEnabled(true);
        setShowInstrumentGlow(true); // Show glow to indicate they're now clickable
        
        // Update hint to reflect new interaction method
        if (progressiveHintRef.current?.hideHint) {
          progressiveHintRef.current.hideHint();
        }
      }
    }, 1000);
    
    return () => clearInterval(fallbackTimer);
  }, [gameStartTime, foundInstruments.length, gameComplete, clickableFallbackEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Check for instrument discovery (via telescope drag)
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

  // Discover a musical instrument
  const discoverInstrument = (instrumentType, instrumentId) => {
    console.log(`🎵 Instrument ${instrumentType} discovered!`);
    
    // Reset stuck timer
    setLastDiscoveryTime(Date.now());
    //setShowInstrumentGlow(false);
    
    const newFoundInstruments = [...foundInstruments, instrumentType];
    const newDiscoveredInstruments = {
      ...discoveredInstruments,
      [instrumentType]: true
    };
    
    setFoundInstruments(newFoundInstruments);
    setDiscoveredInstruments(newDiscoveredInstruments);
    setShowSparkle(`instrument-${instrumentType}-found`);
    
    // Hide hint when first instrument found
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    
    // Clear sparkle after animation
    safeSetTimeout(() => {
      setShowSparkle(null);
    }, 2000);
    
    // Callback to parent
    if (onInstrumentFound) {
      onInstrumentFound(instrumentType, newFoundInstruments, newDiscoveredInstruments);
    }
    
    // Check if all instruments found
    if (newFoundInstruments.length === 4) {
      setShowInstrumentGlow(false);
      safeSetTimeout(() => {
        handleGameComplete(newFoundInstruments, newDiscoveredInstruments);
      }, 1500);
    }
  };

  // Handle game completion
  const handleGameComplete = (finalFoundInstruments, finalDiscoveredInstruments) => {
    console.log('🔭 All instruments discovered - game complete!');
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

  // Hint configuration for ProgressiveHintSystem
  const getHintConfigs = () => [
    {
      id: 'telescope-drag-hint',
      message: clickableFallbackEnabled 
        ? 'Click the instruments to discover them!' 
        : 'Drag the telescope to explore!',
      position: { bottom: '25%', left: '50%', transform: 'translateX(-50%)' },
      condition: (state) => {
        return state?.foundInstruments?.length === 0;
      }
    }
  ];

  if (!isActive) {
    return null;
  }

  return (
    <div className="eyes-telescope-game-inline" style={inlineContainerStyle}>
      
      {/* Progress counter in scene */}
      <div style={inlineProgressStyle}>
        🎵 Instruments Found: {foundInstruments.length} / 4
      </div>
      
      {/* Accessibility fallback notice */}
      {clickableFallbackEnabled && foundInstruments.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(76, 175, 80, 0.95)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 30,
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Click the glowing instruments to discover them!
        </div>
      )}
      
      {/* Draggable Telescope - Main game element */}
      <FreeDraggableItem
        id="divine-telescope"
        position={telescopePosition}
        onPositionChange={(newPosition) => {
          setTelescopePosition(newPosition);
          
          // Convert position to percentage for instrument discovery
          const percentX = parseFloat(newPosition.left);
          const percentY = parseFloat(newPosition.top);
          
          // Check for instrument discovery
          checkInstrumentDiscovery(percentX, percentY);
        }}
        onDragStart={() => {
          console.log('🔭 Telescope drag started');
          setTelescopeDragging(true);
          
          // Hide hint when user starts dragging
          if (progressiveHintRef.current?.hideHint) {
            progressiveHintRef.current.hideHint();
          }
        }}
        onDragEnd={() => {
          console.log('🔭 Telescope drag ended');
          setTelescopeDragging(false);
        }}
        disabled={gameComplete}
        className={`telescope-container ${telescopeDragging ? 'dragging' : ''}`}
        style={{
          width: '80px',
          height: '80px',
          zIndex: 25,
          opacity: clickableFallbackEnabled ? 0.5 : 1 // Fade telescope when fallback active
        }}
        bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
      >
        <img 
          src={telescope} 
          alt="Divine Telescope - Drag to explore!" 
          style={{ 
            width: '100%', 
            height: '100%',
            filter: telescopeDragging 
              ? 'brightness(1.2) drop-shadow(0 0 12px rgba(135, 206, 235, 0.6))' 
              : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'filter 0.2s ease'
          }}
        />
        
        {/* Discovery range indicator when dragging */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '160px',
          height: '160px',
          border: telescopeDragging ? '2px dashed rgba(135, 206, 235, 0.6)' : 'none',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'border 0.3s ease'
        }} />
      </FreeDraggableItem>
      
      {/* Discovered Instruments Display */}
      <div className="discovered-instruments-container">
        {Object.keys(instrumentPositions).map(instrumentId => {
          const instrumentData = instrumentPositions[instrumentId];
          const isDiscovered = foundInstruments.includes(instrumentData.type);
          const shouldGlow = !isDiscovered && showInstrumentGlow;
          const isClickable = !isDiscovered && clickableFallbackEnabled;
          
          return (
            <div 
              key={instrumentId}
              className={`discovered-instrument instrument-${instrumentData.type} ${isDiscovered ? 'discovered' : ''} ${shouldGlow ? 'glowing-hint' : ''} ${isClickable ? 'clickable-fallback' : ''}`}
              style={{
                position: 'absolute',
                top: `${instrumentData.y}%`,
                left: `${instrumentData.x}%`,
                width: isDiscovered ? '90px' : (shouldGlow ? '50px' : '40px'),
                height: isDiscovered ? '90px' : (shouldGlow ? '50px' : '40px'),
                opacity: isDiscovered ? 1 : (shouldGlow ? 0.4 : 0),
                transition: 'all 0.5s ease',
                transform: 'translate(-50%, -50%) rotate(0deg)',
                zIndex: 15,
                pointerEvents: isClickable ? 'auto' : 'none',
                cursor: isClickable ? 'pointer' : 'default'
              }}
              onClick={isClickable ? () => {
                console.log(`♿ Accessibility click: ${instrumentData.type}`);
                discoverInstrument(instrumentData.type, parseInt(instrumentId));
              } : undefined}
            >
              <img 
                src={musicalInstruments[instrumentData.type].image} 
                alt={`${instrumentData.type} instrument`}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  filter: isDiscovered 
                    ? 'brightness(1.2) drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))'
                    : shouldGlow 
                    ? 'brightness(1.3) drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))'
                    : 'none',
                  transform: isClickable ? 'rotate(0deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                  objectFit: 'contain',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation
                  type="star"
                  count={15}
                  color="rgba(135, 206, 235, 0.8)"
                  size={8}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* All instruments found sparkle */}
      {showSparkle === 'all-instruments-found' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SparkleAnimation
            type="glitter"
            count={40}
            color="rgba(135, 206, 235, 0.8)"
            size={12}
            duration={3000}
            fadeOut={true}
            area="full"
          />
        </div>
      )}

      {/* Persistent instruction header */}
<div style={{
  position: 'absolute',
  top: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '12px 24px',
  borderRadius: '20px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  zIndex: 30,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  textAlign: 'center'
}}>
  🔭 Drag the telescope to find instruments!
</div>

      {/* Progressive Hint System 
      <ProgressiveHintSystem
        ref={progressiveHintRef}
        sceneId="telescope-game"
        sceneState={{ foundInstruments }}
        hintConfigs={getHintConfigs()}
        characterImage={mooshikaCoach}
        initialDelay={0}
        hintDisplayTime={99999}
        position="bottom-center"
        iconSize={60}
        zIndex={30}
        enabled={!gameComplete && foundInstruments.length === 0}
        disabledMessage="Great exploring!"
        onHintShown={() => console.log('Telescope hint shown')}
      />
      
      {/* Close Button */}
      {onClose && (
        <button 
          style={inlineCloseStyle}
          onClick={onClose}
        >
          ✕
        </button>
      )}
      
      {/* CSS Animations */}
      <style>{`
        .telescope-container {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
          transition: all 0.3s ease;
        }
        
        .telescope-container.dragging {
          filter: drop-shadow(0 0 12px rgba(135, 206, 235, 0.6)) brightness(1.2);
          animation: telescopePulse 1s ease-in-out infinite;
        }
        
        @keyframes telescopePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .discovered-instrument.discovered {
          animation: instrumentGlow 2s infinite;
        }
        
        @keyframes instrumentGlow {
          0%, 100% { 
            filter: brightness(1.2) drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
          }
        }
        
        /* Stuck help - subtle golden glow for undiscovered instruments */
        .discovered-instrument.glowing-hint {
          animation: undiscoveredGlow 2s ease-in-out infinite;
        }
        
        @keyframes undiscoveredGlow {
          0%, 100% { 
            opacity: 0.3;
            filter: brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
          }
          50% { 
            opacity: 0.5;
            filter: brightness(1.4) drop-shadow(0 0 16px rgba(255, 215, 0, 1));
          }
        }
        
        /* Clickable fallback - stronger pulse to indicate clickability */
        .discovered-instrument.clickable-fallback {
          animation: clickablePulse 1.5s ease-in-out infinite;
        }
        
        @keyframes clickablePulse {
          0%, 100% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
            filter: brightness(1.3) drop-shadow(0 0 12px rgba(76, 175, 80, 0.8));
          }
          50% { 
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.15);
            filter: brightness(1.5) drop-shadow(0 0 20px rgba(76, 175, 80, 1));
          }
        }
        
        .discovered-instrument.clickable-fallback:hover {
          transform: translate(-50%, -50%) scale(1.2) !important;
          filter: brightness(1.6) drop-shadow(0 0 25px rgba(76, 175, 80, 1)) !important;
        }

        .telescope-container {
  animation: gentlePulse 2s ease-in-out infinite;
}

@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
      `}</style>
    </div>
  );
};

// INLINE STYLES - No overlays, renders within scene bounds
const inlineContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

const inlineProgressStyle = {
  position: 'absolute',
  top: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 215, 0, 0.9)',
  color: '#333',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '16px',
  fontWeight: 'bold',
  zIndex: 30
};

const inlineCloseStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#666',
  zIndex: 35
};

export default EyesTelescopeGame;