// Enhanced InteractiveElement.jsx with better visual cues and tooltip positioning
import React, { useState, useEffect } from 'react';
import '../../styles/components.css';

const InteractiveElement = ({
  children,
  tooltip,
  onInteract,
  className = '',
  tooltipClassName = 'tooltip',
  tooltipStyle = {},
  glowEffect = true, // Add option for glow effect
  glowColor = 'rgba(255, 255, 255, 0.7)', // Default glow color
  completed = false, // New prop to track if action is completed
  disableTransformFeedback = false,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: '-50px', left: '50%', transform: 'translateX(-50%)' });
  
  // Convert completed to boolean explicitly
  const isCompleted = completed === "true";
  
  // Add pulsing glow effect to attract attention
  useEffect(() => {
    if (glowEffect && !hasInteracted && !isCompleted) {
      // Set up a pulsing glow to attract attention
      const glowInterval = setInterval(() => {
        setShowGlow(prev => !prev);
      }, 1500);
      
      return () => clearInterval(glowInterval);
    }
  }, [glowEffect, hasInteracted, isCompleted]);
  
  // Add this effect to adjust tooltip position if needed
  useEffect(() => {
    if (isHovered && tooltip && !isCompleted) {
      // Wait for tooltip to render
      setTimeout(() => {
        const tooltipElement = document.querySelector(`.${tooltipClassName}`);
        if (tooltipElement) {
          // Get element position and dimensions
          const rect = tooltipElement.getBoundingClientRect();
          
          // Check if tooltip is too far to the right
          if (rect.right > window.innerWidth) {
            setTooltipPosition({
              top: '-50px',
              left: '0',
              transform: 'translateX(0)'
            });
          }
          // Check if tooltip is too far to the left
          else if (rect.left < 0) {
            setTooltipPosition({
              top: '-50px',
              left: '100%',
              transform: 'translateX(-100%)'
            });
          }
          // Otherwise use default centered position
          else {
            setTooltipPosition({
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)'
            });
          }
        }
      }, 50);
    }
  }, [isHovered, tooltip, tooltipClassName, isCompleted]);
  
  const handleInteraction = () => {
    setIsPressed(true);
    
    // Reset pressed state after animation
    setTimeout(() => {
      setIsPressed(false);
    }, 200);
    
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
    if (onInteract) {
      onInteract();
    }
  };
  
  return (
    <div
      className={`interactive-element ${!disableTransformFeedback && isPressed ? 'pressed' : ''} ${!disableTransformFeedback && !hasInteracted && !isCompleted ? 'new' : ''} ${className}`}
      onClick={handleInteraction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => {
        setIsHovered(true);
        // Don't immediately trigger handleInteraction on touch start
      }}
      onTouchEnd={() => {
        // Small delay to allow tooltip to be visible before action
        setTimeout(() => {
          handleInteraction();
        }, 50);
        // Keep hover state for a moment to ensure tooltip visibility
        setTimeout(() => {
          setIsHovered(false);
        }, 300);
      }}
      
      style={{
        ...rest.style,
        // Add a pulsing glow effect for uninteracted elements
        boxShadow: showGlow && !hasInteracted && !isCompleted ? `0 0 20px ${glowColor}` : 'none',
        transition: disableTransformFeedback
          ? 'box-shadow 0.5s ease-in-out'
          : 'box-shadow 0.5s ease-in-out, transform 0.2s ease',
      }}
      {...rest}
    >
      {children}
      
      {/* Only show tooltip when hovered AND not completed */}
      {isHovered && tooltip && !isCompleted && (
        <div 
          className={tooltipClassName} 
          style={{
            ...tooltipStyle,
            ...tooltipPosition
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default InteractiveElement;
