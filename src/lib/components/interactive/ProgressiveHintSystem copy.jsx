// lib/components/interactive/ProgressiveHintSystem.jsx

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './ProgressiveHintSystem.css';

const ProgressiveHintSystem = forwardRef(({ 
  // Basic configuration
  sceneId,
  sceneState,
  hintConfigs,
  characterImage,
  
  // Customization options
  initialDelay = 8000,       // Time before button starts pulsing (ms)
  hintDisplayTime = 5000,    // How long hints stay visible (ms)
  position = 'bottom-left',  // Button position
  iconSize = 50,             // Button size in pixels
  zIndex = 1000,             // Z-index for layering
  
  // Callbacks
  onHintShown = () => {},
  onHintHidden = () => {},
  onHintLevelChange = () => {},
  onHintButtonClick = () => {},
  
  // Enable/disable
  enabled = true,
}, ref) => {
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentHint, setCurrentHint] = useState(null);
  const [inactivityTime, setInactivityTime] = useState(0);
  const inactivityTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    showHint: (level = 0) => {
      handleShowHint(level);
    },
    hideHint: () => {
      handleHideHint();
    },
    resetHintLevel: () => {
      setHintLevel(0);
    },
    setHintPulsing: (isPulsing) => {
      setIsPulsing(isPulsing);
    }
  }));
  
  // Track inactivity
  useEffect(() => {
    if (!enabled) return;
    
    const checkInactivity = () => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityRef.current;
      
      setInactivityTime(inactiveTime);
      
      if (inactiveTime >= initialDelay && !isPulsing) {
        setIsPulsing(true);
      }
      
      inactivityTimerRef.current = requestAnimationFrame(checkInactivity);
    };
    
    inactivityTimerRef.current = requestAnimationFrame(checkInactivity);
    
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      setInactivityTime(0);
      setIsPulsing(false);
    };
    
    // Listen for user interaction
    window.addEventListener('click', resetActivity);
    window.addEventListener('touchstart', resetActivity);
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    
    return () => {
      cancelAnimationFrame(inactivityTimerRef.current);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
    };
  }, [enabled, initialDelay, isPulsing]);
  
  // Find the appropriate hint based on scene state
  // Find the appropriate hint based on scene state
useEffect(() => {
  if (!enabled || !sceneState || !hintConfigs || !showHint) return;
  
  // Find matching hint based on current scene state
  const matchingHint = hintConfigs.find(hint => 
    typeof hint.condition === 'function' && hint.condition(sceneState, hintLevel)
  );
  
  if (matchingHint) {
    setCurrentHint(matchingHint);
  } else {
    // Default hint if no condition matches
    setCurrentHint(null);
  }
}, [enabled, sceneState, hintConfigs, showHint, hintLevel]);

  // Show hint handler
  // Show hint handler
const handleShowHint = (level = 0) => {  // DEFAULT TO 0, NOT hintLevel
  if (!enabled) return;
  
  // Clear any existing hide timer
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
  }
  
  setHintLevel(level);
  setShowHint(true);
  onHintShown(level);
  
  // Auto-hide hint after display time
  hideTimerRef.current = setTimeout(() => {
    handleHideHint();
  }, hintDisplayTime);
};
  
  // Hide hint handler
  const handleHideHint = () => {
    setShowHint(false);
    onHintHidden();
    
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  
  // Handle hint button click
const handleHintButtonClick = () => {
  onHintButtonClick();
  
  // Start at level 0, then progress to level 1, then cycle back
  const nextLevel = hintLevel === 0 ? 1 : 0; 
  setHintLevel(nextLevel);
  onHintLevelChange(nextLevel);
  
  // Show hint
  handleShowHint(nextLevel);
};
  
  // Get hint content based on level
  /*const renderHintContent = () => {
    if (!currentHint) return null;
    
    switch (hintLevel) {
      case 0: // Visual arrow hint
        return (
          <div className="visual-hint">
            <div 
              className="hint-arrow"
              style={{
                transform: `rotate(${getArrowRotation(currentHint.position)}deg)`
              }}
            />
          </div>
        );
        
      case 1: // Character with simple hint
        return (
          <div className="character-hint">
            <img src={characterImage} alt="Hint" className="hint-character" />
            <div className="hint-bubble">
              <p>{currentHint.message || "Try exploring!"}</p>
            </div>
          </div>
        );
        
      case 2: // Explicit guidance
        return (
          <div className="explicit-hint">
            <img src={characterImage} alt="Hint" className="hint-character" />
            <div className="hint-bubble">
              <p>{currentHint.explicitMessage || currentHint.message || "Click here to proceed!"}</p>
            </div>
            {currentHint.element && (
              <div className="hint-target-highlight" />
            )}
          </div>
        );
        
      default:
        return null;
    }
  };*/

  // Get hint content based on level
const renderHintContent = () => {
  if (!currentHint) return null;
  
  // Always show character with speech bubble (remove arrow level)
  return (
    <div className="character-hint">
      <img src={characterImage} alt="Hint" className="hint-character" />
      <div className="hint-bubble">
        <p>
          {hintLevel === 0 
            ? currentHint.message || "Try exploring!"
            : currentHint.explicitMessage || currentHint.message || "Click here to proceed!"
          }
        </p>
      </div>
    </div>
  );
};
  
  // Helper to calculate arrow rotation based on position
  const getArrowRotation = (position) => {
    if (!position) return 0;
    
    // Calculate rotation based on position props
    if (position.top && position.left) {
      const top = typeof position.top === 'string' 
        ? parseInt(position.top) 
        : position.top;
        
      const left = typeof position.left === 'string'
        ? parseInt(position.left)
        : position.left;
      
      // Return angle based on position
      if (top < 50 && left < 50) return 135; // top-left
      if (top < 50 && left > 50) return 225; // top-right
      if (top > 50 && left < 50) return 45;  // bottom-left
      if (top > 50 && left > 50) return 315; // bottom-right
    }
    
    return 0; // default
  };
  
  // Get button position styles
  const getButtonPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
      default:
        return { bottom: '20px', left: '20px' };
    }
  };
  
  // Get hint position styles
  const getHintPositionStyle = () => {
    if (!currentHint || !currentHint.position) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    return currentHint.position;
  };
  
  if (!enabled) return null;
  
  return (
    <>
      {/* Hint Button */}
      <button 
        className={`progressive-hint-button ${isPulsing ? 'pulsing' : ''}`}
        style={{
          ...getButtonPositionStyle(),
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          zIndex: zIndex
        }}
        onClick={handleHintButtonClick}
        aria-label="Get a hint"
      >
        <div className="hint-button-content">
          <img 
            src={characterImage} 
            alt="Hint" 
            className="hint-button-icon"
          />
          <span className="hint-button-question">?</span>
        </div>
      </button>
      
      {/* Hint Display */}
      {showHint && currentHint && (
        <div 
          className="progressive-hint-container"
          style={{
            ...getHintPositionStyle(),
            zIndex: zIndex - 1
          }}
        >
          {renderHintContent()}
        </div>
      )}
    </>
  );
});

export default ProgressiveHintSystem;