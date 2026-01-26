// MooshikaCharacter.jsx - Animated mouse character for tracing
import React, { useState, useEffect } from 'react';
import './MooshikaCharacter.css';

// Import Mooshika assets
// Import Mooshika assets
import mooshikaTracing from '../scenes/VakratundaMahakaya/assets/images/mooshika-tracing.png';

const MooshikaCharacter = ({
  position,           // Current { x, y } position
  tracedPath,         // Array of all traced points
  pathQuality,        // 'good' or 'off-path'
  isTracing,          // Boolean if currently tracing
  isVisible = true,   // Show/hide character
  size = 40          // Character size in pixels
}) => {
  const [rotation, setRotation] = useState(0);
  const [characterState, setCharacterState] = useState('happy');
  const [trailPoints, setTrailPoints] = useState([]);

  // Calculate rotation based on movement direction
  useEffect(() => {
    if (tracedPath.length > 1) {
      const lastTwo = tracedPath.slice(-2);
      const [prev, curr] = lastTwo;
      
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      
      // Calculate angle in degrees (0 = pointing right)
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      setRotation(angle);
    }
  }, [tracedPath]);

  // Update character state based on path quality
  useEffect(() => {
    if (pathQuality === 'good') {
      setCharacterState('happy');
    } else if (pathQuality === 'off-path') {
      setCharacterState('concerned');
    }
  }, [pathQuality]);

  // Create trail effect behind character
  useEffect(() => {
    if (isTracing && tracedPath.length > 0) {
      // Keep last 8 points for trail
      const newTrail = tracedPath.slice(-8).map((point, index) => ({
        ...point,
        opacity: (index + 1) / 8, // Fade from 0.125 to 1
        size: ((index + 1) / 8) * 12 // Size from 1.5 to 12
      }));
      setTrailPoints(newTrail);
    } else {
      setTrailPoints([]);
    }
  }, [tracedPath, isTracing]);

  if (!isVisible || !position) return null;

  const characterStyles = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size}px`,
    height: `${size}px`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    transition: 'transform 0.1s ease-out',
    zIndex: 20,
    pointerEvents: 'none'
  };

const getCharacterImage = () => {
  // Use same image but different filters for states
  return mooshikaTracing;
};

  const getCharacterFilter = () => {
    switch (characterState) {
      case 'happy':
        return 'brightness(1.1) saturate(1.2)';
      case 'concerned':
        return 'brightness(0.8) saturate(0.7) hue-rotate(15deg)';
      default:
        return 'brightness(1)';
    }
  };

  return (
    <div className="mooshika-container">
      {/* Trail Effect */}
      {trailPoints.map((point, index) => (
        <div
          key={`trail-${index}-${Date.now()}`}
          className={`mooshika-trail ${pathQuality === 'good' ? 'trail-good' : 'trail-offpath'}`}
          style={{
            position: 'absolute',
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${point.size}px`,
            height: `${point.size}px`,
            opacity: point.opacity,
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        />
      ))}

      {/* Main Character */}
      <div
        className={`mooshika-character ${characterState} ${isTracing ? 'tracing' : 'idle'}`}
        style={characterStyles}
      >
        <img
          src={getCharacterImage()}
          alt="Mooshika"
          style={{
            width: '100%',
            height: '100%',
            filter: getCharacterFilter()
          }}
        />
        
        {/* Quality Indicator */}
        {pathQuality === 'good' && (
          <div className="quality-sparkle">✨</div>
        )}
        {pathQuality === 'off-path' && (
          <div className="quality-warning">❓</div>
        )}
      </div>

      {/* Character Speech Bubble 
      {isTracing && (
        <div 
          className="mooshika-speech"
          style={{
            position: 'absolute',
            left: `${position.x + 30}px`,
            top: `${position.y - 50}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 25
          }}
        >
          {pathQuality === 'good' ? (
            <div className="speech-bubble good">🐘 Following the trunk!</div>
          ) : (
            <div className="speech-bubble offpath">🤔 Where's the path?</div>
          )}
        </div>
      )}*/}
    </div>
  );
};

export default MooshikaCharacter;