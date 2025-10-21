// zones/symbol-mountain/scenes/symbol/components/EyesTelescopeGame.jsx
// 🔭 INLINE telescope instrument discovery game component

import React, { useState, useEffect, useRef } from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';

// Import your actual musical instrument images
import musicalTabla from './assets/images/musical-tabla-colored.png';
import musicalFlute from './assets/images/musical-flute-colored.png';
import musicalBells from './assets/images/musical-bells-colored.png';
import musicalCymbals from './assets/images/musical-cymbals-colored.png';

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
  // ✅ ADD THESE 3 LINES:
  initialDiscoveredInstruments = {},
  initialFoundInstruments = [],
  isReload = false,
    hintRef  // ← ADD THIS PROP

}) => {
  console.log('🔭 EyesTelescopeGame inline render:', { isActive });

  // Game states
  const [telescopePosition, setTelescopePosition] = useState({ top: '50%', left: '50%' });
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [foundInstruments, setFoundInstruments] = useState([]);
  const [discoveredInstruments, setDiscoveredInstruments] = useState({});
  const [showSparkle, setShowSparkle] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  // Refs
  const timeoutsRef = useRef([]);

  // Safe timeout
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // EyesTelescopeGame.jsx - Add these props
const EyesTelescopeGame = ({ 
  isActive, 
  instrumentPositions, 
  discoveryRadius,
  profileName,
  // ✅ ADD THESE RELOAD PROPS:
  initialDiscoveredInstruments = {},  // Reload discovered state
  initialFoundInstruments = [],       // Reload found list
  onInstrumentFound, 
  onAllInstrumentsFound, 
  onClose 
}) => {

  // ✅ INITIALIZE WITH RELOAD DATA:
  const [discoveredInstruments, setDiscoveredInstruments] = useState(initialDiscoveredInstruments);
  const [foundInstruments, setFoundInstruments] = useState(initialFoundInstruments);

  // ✅ ADD RELOAD EFFECT:
  useEffect(() => {
    // If we have initial data, we're reloading mid-game
    if (Object.keys(initialDiscoveredInstruments).length > 0) {
      console.log('🔄 EYES GAME RELOAD: Restoring progress', {
        discovered: initialDiscoveredInstruments,
        found: initialFoundInstruments
      });
      
      setDiscoveredInstruments(initialDiscoveredInstruments);
      setFoundInstruments(initialFoundInstruments);
    }
  }, []);

  // Rest of your EyesTelescopeGame logic...
}

  // Reset game when activated
// Reset game when activated - WITH RELOAD SUPPORT
useEffect(() => {
  if (isActive) {
    if (isReload && initialFoundInstruments.length > 0) {
      // Reload case - restore progress but don't reset position
      console.log('🔄 RELOAD: Restoring telescope progress:', initialFoundInstruments);
      setFoundInstruments(initialFoundInstruments);
      setDiscoveredInstruments(initialDiscoveredInstruments);
      setGameComplete(initialFoundInstruments.length === 4);
      setShowSparkle(null); // Clear any sparkles
    } else {
      // Your original working logic - UNCHANGED
      console.log('🔭 Resetting inline telescope game');
      setFoundInstruments([]);
      setDiscoveredInstruments({});
      setGameComplete(false);
      setShowSparkle(null);
      setTelescopePosition({ top: '50%', left: '50%' });
    }
  }
}, [isActive, isReload]); // ✅ Add isReload to dependency array

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Check for instrument discovery
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
    
    const newFoundInstruments = [...foundInstruments, instrumentType];
    const newDiscoveredInstruments = {
      ...discoveredInstruments,
      [instrumentType]: true
    };
    
    setFoundInstruments(newFoundInstruments);
    setDiscoveredInstruments(newDiscoveredInstruments);
    setShowSparkle(`instrument-${instrumentType}-found`);
    
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
    
    safeSetTimeout(() => {
      if (onAllInstrumentsFound) {
        onAllInstrumentsFound(finalFoundInstruments, finalDiscoveredInstruments);
      }
    }, 2000);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="eyes-telescope-game-inline" style={inlineContainerStyle}>
      
    
      
      {/* Progress counter in scene */}
      <div style={inlineProgressStyle}>
        🎵 Instruments Found: {foundInstruments.length} / 4
      </div>
      
      {/* Game status message 
      <div style={inlineStatusStyle}>
        {foundInstruments.length === 0 && '🔍 Start exploring with the telescope!'}
        {foundInstruments.length > 0 && foundInstruments.length < 4 && `✨ Great! Found: ${foundInstruments.join(', ')}`}
        {foundInstruments.length === 4 && '🎉 All instruments discovered! Divine vision achieved!'}
      </div>
      
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
          zIndex: 25
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
border: telescopeDragging ? '2px dashed rgba(135, 206, 235, 0.6)' : 'none',          borderRadius: '50%',
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
          
          return (
            <div 
              key={instrumentId}
              className={`discovered-instrument instrument-${instrumentData.type} ${isDiscovered ? 'discovered' : ''}`}
              style={{
                position: 'absolute',
                top: `${instrumentData.y}%`,
                left: `${instrumentData.x}%`,
              width: isDiscovered ? '90px' : '40px',
height: isDiscovered ? '90px' : '40px',
                opacity: isDiscovered ? 1 : 0,
                transition: 'all 0.5s ease',
  transform: 'translate(-50%, -50%) rotate(0deg)',  // ← CHANGE THIS LINE
                zIndex: 15,
                pointerEvents: 'none'
              }}
            >
              <img 
                src={musicalInstruments[instrumentData.type].image} 
                alt={`${instrumentData.type} instrument`}
                style={{ 
                  width: '100%', 
                  height: '100%',
filter: 'brightness(1.2) drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))',
  transform: 'rotate(0deg) scale(1)',  // ← ADD THIS LINE
    objectFit: 'contain'  // ← AND THIS LINE               
     }}
              />
              
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation
                  type="star"
                  count={15}
color="rgba(135, 206, 235, 0.8)"                  size={8}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Found Instruments Summary 
      {foundInstruments.length > 0 && (
        <div style={foundInstrumentsSummaryStyle}>
          <div style={{ marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>✨ Discovered:</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {foundInstruments.map(instrumentType => (
              <div key={instrumentType} style={foundInstrumentItemStyle}>
                <img 
                  src={musicalInstruments[instrumentType].image}
                  alt={musicalInstruments[instrumentType].name}
                  style={{ width: '24px', height: '24px', marginBottom: '2px' }}
                />
                <div style={{ fontSize: '10px' }}>{musicalInstruments[instrumentType].name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* All instruments found sparkle */}
      {showSparkle === 'all-instruments-found' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SparkleAnimation
            type="glitter"
            count={40}
color="rgba(135, 206, 235, 0.8)"            size={12}
            duration={3000}
            fadeOut={true}
            area="full"
          />
        </div>
      )}
      
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
`}</style>
    </div>
  );
};

// ✅ INLINE STYLES - No overlays, renders within scene bounds
const inlineContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

const inlineInstructionsStyle = {
  position: 'absolute',
  top: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '12px 20px',
  borderRadius: '15px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#01579b',
  zIndex: 30,
  maxWidth: '400px',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
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

const inlineStatusStyle = {
  position: 'absolute',
  top: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(76, 175, 80, 0.9)',
  color: 'white',
  padding: '6px 14px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  zIndex: 30,
  maxWidth: '350px',
  textAlign: 'center'
};

const foundInstrumentsSummaryStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(76, 175, 80, 0.9)',
  color: 'white',
  padding: '10px 15px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center'
};

const foundInstrumentItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '6px',
  borderRadius: '8px',
  minWidth: '40px',
  color: '#333'
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