// zones/cave-of-secrets/scenes/sarvakaryeshu-sarvada/HelperSpinWheel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './HelperSpinWheel.css';

const HelperSpinWheel = ({ 
  helpers, // Array of 4 helpers: [{ id, image, name }, ...]
  onHelperSelected, // Callback when wheel lands on a helper
  disabled = false 
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const [wheelVisible, setWheelVisible] = useState(true); // ✨ NEW: Control wheel visibility
  
  const wheelRef = useRef(null);
  const sliceAngle = 360 / helpers.length; // 90 degrees per slice for 4 helpers

  // Play tick sound during spin
  const playTickSound = () => {
    try {
      const audio = new Audio('/audio/effects/wheel-tick.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Tick sound failed:', error);
    }
  };

  // Play landing sound
  const playLandingSound = () => {
    try {
      const audio = new Audio('/audio/effects/wheel-land.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Landing sound failed:', error);
    }
  };

  // Play selection celebration sound
  const playCelebrationSound = () => {
    try {
      const audio = new Audio('/audio/effects/helper-selected.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Celebration sound failed:', error);
    }
  };

  // Handle spin
  const handleSpin = () => {
    if (spinning || disabled) return;

    setSpinning(true);
    setShowInstruction(false);
    setSelectedHelper(null);

    // Random selection from 4 helpers
    const randomIndex = Math.floor(Math.random() * helpers.length);
    const selectedHelperData = helpers[randomIndex];

    // Calculate final rotation
    const baseSpins = 3 + Math.random() * 2; // 3-5 full rotations
    const fullRotations = baseSpins * 360;
    
    // Land on selected slice (pointing up)
    const sliceOffset = (randomIndex * sliceAngle) + (sliceAngle / 2);
    const targetAngle = 360 - sliceOffset;
    
    const finalRotation = rotation + fullRotations + targetAngle;
    setRotation(finalRotation);

    // Calculate where this helper is positioned on screen for animation
    // Wheel is on RIGHT side of screen
    const wheelCenterX = 75; // Right side (75% from left)
    const wheelCenterY = 50; // Middle (50% from top)
    const wheelRadius = 12;  // Approximate radius in % units
    
    // Calculate position of selected slice (after landing, it's at TOP)
    // When wheel stops, selected helper is at 12 o'clock position
    const helperScreenPosition = {
      x: wheelCenterX, // Center horizontally
      y: wheelCenterY - wheelRadius // Top of wheel
    };

    // Tick sounds during spin
    const tickInterval = setInterval(() => {
      playTickSound();
    }, 100);

    // ✨ MODIFIED: After spin completes (4 seconds)
    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      playLandingSound();
      
      // Show selected helper
      setTimeout(() => {
        setSelectedHelper(selectedHelperData);
        playCelebrationSound();
        
        // ✨ NEW: Wheel vanishes after 1 second
        setTimeout(() => {
          setWheelVisible(false); // Wheel disappears!
          
          // Notify parent immediately (wheel is gone, helper visible)
          setTimeout(() => {
            onHelperSelected({
              ...selectedHelperData,
              screenPosition: helperScreenPosition
            });
          }, 300);
        }, 1000);
      }, 500);
    }, 4000);
  };

  return (
    <div className="helper-spin-wheel-container">
      
      {/* Instruction Banner */}
      {showInstruction && !spinning && wheelVisible && (
        <div className="wheel-instruction-banner">
          <h3 className="baloo-heading">🌟 Spin to Choose Your Helper! 🌟</h3>
        </div>
      )}

      {/* ✨ MODIFIED: Wheel wrapper now conditional */}
      {wheelVisible && (
        <div className={`wheel-wrapper ${!wheelVisible ? 'vanishing' : ''}`}>
          
          {/* Pointer Arrow at Top */}
          <div className="wheel-pointer">▼</div>

          {/* Spin Button (center of wheel) */}
          {!spinning && !selectedHelper && (
            <button 
              className="spin-button"
              onClick={handleSpin}
              disabled={disabled}
            >
              <div className="spin-button-content">
                <span className="spin-icon">🎡</span>
                <span className="spin-text baloo-heading">SPIN</span>
              </div>
            </button>
          )}

          {/* Wheel Circle */}
          <div 
            ref={wheelRef}
            className={`wheel-circle ${spinning ? 'spinning' : ''}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              // Create perfect round pie slices with conic-gradient
              background: `conic-gradient(
                from 0deg,
                #FFD700 0deg 90deg,
                #4ECDC4 90deg 180deg,
                #FF6B9D 180deg 270deg,
                #95E1D3 270deg 360deg
              )`
            }}
          >
            {/* Slice borders for definition */}
            <div className="wheel-slice-borders">
              <div className="slice-border" style={{ transform: 'rotate(0deg)' }} />
              <div className="slice-border" style={{ transform: 'rotate(90deg)' }} />
              <div className="slice-border" style={{ transform: 'rotate(180deg)' }} />
              <div className="slice-border" style={{ transform: 'rotate(270deg)' }} />
            </div>

            {/* Helper Content - positioned INSIDE each triangle slice */}
            {helpers.map((helper, index) => {
              // Each helper rotates to their slice position: 0°, 90°, 180°, 270°
              const sliceRotation = index * 90;
              
              // Position each helper in the MIDDLE of their slice
              const helperAngle = sliceRotation + 45;
              
              // Distance from center (in percentage of wheel radius)
              const distanceFromCenter = 55; // 55% from center
              
              // Convert polar to cartesian coordinates
              const angleInRadians = (helperAngle - 90) * (Math.PI / 180); // -90 to start from top
              const x = 50 + (distanceFromCenter * Math.cos(angleInRadians)); // 50% = center
              const y = 50 + (distanceFromCenter * Math.sin(angleInRadians));
              
              return (
                <div
                  key={helper.id}
                  className="slice-content"
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`, // Counter-rotate to keep upright
                    transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  }}
                >
                  <img 
                    src={helper.image} 
                    alt={helper.name}
                    className="slice-helper-image"
                  />
                  <p className="slice-helper-name nunito-text">{helper.name}</p>
                </div>
              );
            })}

            {/* Ganesha Icon in Center */}
            <div className="wheel-center-icon">
              🐘
            </div>
          </div>

          {/* Spinning Status */}
          {spinning && (
            <div className="spinning-message">
              <p className="baloo-heading">✨ Spinning... ✨</p>
            </div>
          )}

        </div>
      )}
      
      {/* ✨ NOTE: Removed persistent helper card - parent will handle helper display */}
    </div>
  );
};

export default HelperSpinWheel;