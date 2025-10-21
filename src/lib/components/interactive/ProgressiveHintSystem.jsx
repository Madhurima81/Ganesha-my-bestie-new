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
  initialDelay = 8000,
  hintDisplayTime = 5000,
  position = 'bottom-left',
  iconSize = 50,
  zIndex = 1000,
  
  // Callbacks
  onHintShown = () => {},
  onHintHidden = () => {},
  onHintLevelChange = () => {},
  onHintButtonClick = () => {},
  
  // Enable/disable
  enabled = true,
  disabledMessage = "Great job!", // NEW: Message to show when disabled
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
  useEffect(() => {
    if (!enabled || !sceneState || !hintConfigs || !showHint) return;
    
    const matchingHint = hintConfigs.find(hint => 
      typeof hint.condition === 'function' && hint.condition(sceneState, hintLevel)
    );
    
    if (matchingHint) {
      setCurrentHint(matchingHint);
    } else {
      setCurrentHint(null);
    }
  }, [enabled, sceneState, hintConfigs, showHint, hintLevel]);

  // Show hint handler
  const handleShowHint = (level = 0) => {
    if (!enabled) return;
    
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    
    setHintLevel(level);
    setShowHint(true);
    onHintShown(level);
    
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
    if (!enabled) return; // Don't do anything when disabled
    
    onHintButtonClick();
    
    const nextLevel = hintLevel === 0 ? 1 : 0; 
    setHintLevel(nextLevel);
    onHintLevelChange(nextLevel);
    
    handleShowHint(nextLevel);
  };

  // Get hint content based on level
  const renderHintContent = () => {
    if (!currentHint) return null;
    
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
  
  // DISABLED STATE - Show grayed out button with checkmark
  if (!enabled) {
    return (
      <div 
        className="progressive-hint-button disabled"
        style={{
          ...getButtonPositionStyle(),
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          zIndex: zIndex,
          opacity: 0.6,
          cursor: 'not-allowed',
          position: 'fixed',
          background: 'rgba(200, 200, 200, 0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={characterImage} 
            alt="Hint disabled" 
            style={{
              width: '70%',
              height: '70%',
              filter: 'grayscale(100%)',
              opacity: 0.5
            }}
          />
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: '#4CAF50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            ✓
          </div>
        </div>
        
        {/* Optional tooltip */}
        {disabledMessage && (
          <div style={{
            position: 'absolute',
            left: position.includes('left') ? '110%' : 'auto',
            right: position.includes('right') ? '110%' : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#333',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'none'
          }}>
            {disabledMessage}
          </div>
        )}
      </div>
    );
  }
  
  // ENABLED STATE - Normal functioning button
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