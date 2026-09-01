import React, { useState, useEffect, useRef } from 'react';
import './SparkleAnimation.css';

/**
 * SparkleAnimation - Adds sparkle effects to elements
 * 
 * @param {Object} props
 * @param {string} props.type - Type of sparkle ("star", "glitter", "firefly", "magic")
 * @param {number} props.count - Number of sparkle particles
 * @param {string} props.color - Color of sparkles
 * @param {number} props.size - Base size of sparkles
 * @param {number} props.duration - Duration of animation in ms
 * @param {boolean} props.fadeOut - Whether sparkles should fade out
 * @param {string} props.area - Where to place sparkles ("full", "top", "bottom", "left", "right")
 * @param {Function} props.onComplete - Function to call when animation completes
 */
const SparkleAnimation = ({ 
  type = "star", 
  count = 20, 
  color = "gold", 
  size = 10,
  duration = 2000,
  fadeOut = true,
  area = "full",
  onComplete = () => {}
}) => {
  const [sparkles, setSparkles] = useState([]);
  const hasInitialized = useRef(false);
  const animationTimeoutRef = useRef(null);
  
  // Generate sparkles on mount - using useEffect with empty deps to run only once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Generate sparkle particles
    const newSparkles = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate random positions based on area
      let xPos, yPos;
      
      switch (area) {
        case 'top':
          xPos = Math.random() * 100;
          yPos = Math.random() * 30;
          break;
        case 'bottom':
          xPos = Math.random() * 100;
          yPos = 70 + Math.random() * 30;
          break;
        case 'left':
          xPos = Math.random() * 30;
          yPos = Math.random() * 100;
          break;
        case 'right':
          xPos = 70 + Math.random() * 30;
          yPos = Math.random() * 100;
          break;
        default: // 'full'
          xPos = Math.random() * 100;
          yPos = Math.random() * 100;
      }
      
      // Random variations for animation
      const delay = Math.random() * 500;
      const animDuration = (Math.random() * 0.5 + 0.75) * duration;
      const sparkleSize = (Math.random() * 0.5 + 0.75) * size;
      
      newSparkles.push({
        id: i,
        x: xPos,
        y: yPos,
        size: sparkleSize,
        delay,
        duration: animDuration,
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
    
    setSparkles(newSparkles);
    
    // Set timeout to run onComplete after animation finishes
    if (fadeOut) {
      animationTimeoutRef.current = setTimeout(() => {
        onComplete();
      }, duration + 500); // Add a small buffer
    }
    
    // Clean up on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [count, area, duration, fadeOut, onComplete, size]);
  
  // Get CSS class based on sparkle type
  const getSparkleClass = () => {
    switch (type) {
      case 'glitter':
        return 'sparkle-glitter';
      case 'firefly':
        return 'sparkle-firefly';
      case 'magic':
        return 'sparkle-magic';
      case 'dust':
        return 'sparkle-dust';
      default:
        return 'sparkle-star';
    }
  };
  
  return (
    <div className="sparkle-container">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className={`sparkle ${getSparkleClass()} ${fadeOut ? 'fade-out' : ''}`}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: color,
            animationDelay: `${sparkle.delay}ms`,
            animationDuration: `${sparkle.duration}ms`,
            transform: `rotate(${sparkle.rotation}deg)`,
            opacity: sparkle.opacity
          }}
        />
      ))}
    </div>
  );
};

export default SparkleAnimation;