// zones/shloka-river/scenes/Scene1/components/WaterSprayArc.jsx
import React from 'react';

const WaterSprayArc = ({ 
  sourcePosition, 
  targetPosition, 
  isActive, 
  dropCount = 15,
  duration = 1500,
  phase = 'vakratunda' // For different spray styles
}) => {
  if (!isActive || !sourcePosition || !targetPosition) return null;

  // Calculate distance and arc parameters
  const sourceX = parseFloat(sourcePosition.left);
  const sourceY = parseFloat(sourcePosition.top);
  const targetX = parseFloat(targetPosition.left);
  const targetY = parseFloat(targetPosition.top);
  
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Arc height based on distance (longer = higher arc)
  const arcHeight = Math.max(12, distance * 0.25);
  
  // Different drop counts for different phases
  const actualDropCount = phase === 'mahakaya' ? dropCount + 5 : dropCount;
  
  // Different drop types for phases
  const dropEmoji = phase === 'mahakaya' ? '💎' : '💧';
  
  return (
    <>
      <div className="water-spray-container">
        {Array.from({ length: actualDropCount }).map((_, i) => {
          const progress = i / actualDropCount;
          const delay = i * 60; // Stagger drops
          const spread = (Math.random() - 0.5) * 12; // Random variance
          const sizeVariation = 0.8 + Math.random() * 0.4; // Size variety
          const rotationVariation = Math.random() * 360; // Random rotation
          
          return (
            <div
              key={i}
              className="water-drop"
              style={{
                '--start-x': `${sourceX}%`,
                '--start-y': `${sourceY}%`,
                '--end-x': `${targetX}%`,
                '--end-y': `${targetY}%`,
                '--arc-height': `${arcHeight}vh`,
                '--duration': `${duration}ms`,
                '--delay': `${delay}ms`,
                '--spread': `${spread}px`,
                '--size': sizeVariation,
                '--rotation': `${rotationVariation}deg`,
                animationDelay: `${delay}ms`,
                fontSize: `${(phase === 'mahakaya' ? 16 : 12) * sizeVariation}px`
              }}
            >
              {dropEmoji}
            </div>
          );
        })}
      </div>
      
      {/* Enhanced water spray trail effect */}
      <div className="water-trail-container">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`trail-${i}`}
            className="water-trail"
            style={{
              '--start-x': `${sourceX}%`,
              '--start-y': `${sourceY}%`,
              '--end-x': `${targetX}%`,
              '--end-y': `${targetY}%`,
              '--arc-height': `${arcHeight}vh`,
              '--duration': `${duration + i * 100}ms`,
              '--delay': `${i * 80}ms`,
              '--opacity': 0.3 - (i * 0.03),
              animationDelay: `${i * 80}ms`
            }}
          />
        ))}
      </div>
      
      {/* CSS Styles */}
      <style jsx>{`
        .water-spray-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 25;
        }
        
        .water-trail-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 24;
        }
        
        .water-drop {
          position: absolute;
          left: var(--start-x);
          top: var(--start-y);
          pointer-events: none;
          z-index: 25;
          animation: waterArc var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform: scale(var(--size)) rotate(var(--rotation));
          filter: drop-shadow(0 2px 4px rgba(0, 100, 200, 0.3));
        }
        
        .water-trail {
          position: absolute;
          left: var(--start-x);
          top: var(--start-y);
          width: 3px;
          height: 3px;
          background: linear-gradient(45deg, #4ECDC4, #44A08D);
          border-radius: 50%;
          pointer-events: none;
          z-index: 24;
          opacity: var(--opacity);
          animation: waterTrail var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes waterArc {
          0% {
            left: var(--start-x);
            top: var(--start-y);
            opacity: 1;
            transform: translateX(var(--spread)) scale(var(--size)) rotate(var(--rotation));
          }
          15% {
            opacity: 0.95;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 1.1)) rotate(calc(var(--rotation) + 30deg));
          }
          25% {
            opacity: 0.9;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 1.15)) rotate(calc(var(--rotation) + 60deg));
          }
          50% {
            left: calc((var(--start-x) + var(--end-x)) / 2);
            top: calc((var(--start-y) + var(--end-y)) / 2 - var(--arc-height));
            opacity: 0.8;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 1.2)) rotate(calc(var(--rotation) + 90deg));
          }
          75% {
            opacity: 0.6;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 1.1)) rotate(calc(var(--rotation) + 120deg));
          }
          90% {
            opacity: 0.3;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 0.9)) rotate(calc(var(--rotation) + 150deg));
          }
          100% {
            left: var(--end-x);
            top: var(--end-y);
            opacity: 0;
            transform: translateX(var(--spread)) scale(calc(var(--size) * 0.7)) rotate(calc(var(--rotation) + 180deg));
          }
        }
        
        @keyframes waterTrail {
          0% {
            left: var(--start-x);
            top: var(--start-y);
            opacity: var(--opacity);
            transform: scale(1);
          }
          25% {
            opacity: calc(var(--opacity) * 0.8);
            transform: scale(1.2);
          }
          50% {
            left: calc((var(--start-x) + var(--end-x)) / 2);
            top: calc((var(--start-y) + var(--end-y)) / 2 - var(--arc-height));
            opacity: calc(var(--opacity) * 0.6);
            transform: scale(1.5);
          }
          75% {
            opacity: calc(var(--opacity) * 0.3);
            transform: scale(1.1);
          }
          100% {
            left: var(--end-x);
            top: var(--end-y);
            opacity: 0;
            transform: scale(0.8);
          }
        }
        
        /* Enhanced sparkle effect on impact */
        .water-drop:nth-child(5n) {
          filter: drop-shadow(0 2px 4px rgba(0, 100, 200, 0.3)) 
                  drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
        }
        
        /* Different trail colors for mahakaya phase */
        .water-trail:nth-child(even) {
          background: linear-gradient(45deg, #FFD700, #FFA500);
        }
      `}</style>
    </>
  );
};

export default WaterSprayArc;