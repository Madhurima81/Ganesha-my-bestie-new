// zones/shloka-river/core/UnifiedHeader.jsx
// Unified header component with star-based progress tracking
// Auto-progresses based on game rounds (3 stars per word - VA, KRA, TUN/DA)

import React, { useEffect, useState } from 'react';
import './UnifiedHeader.css';

const UnifiedHeader = ({
  zone = 'shloka-river',  // 'shloka-river', 'symbol-mountain', 'meaning-cave'
  title,
  currentRound = 0,
  totalRounds = 3,
  className = ''
}) => {
  const [stars, setStars] = useState([]);
  const [prevRound, setPrevRound] = useState(0);

  // Initialize stars based on total rounds
  useEffect(() => {
    const starArray = Array.from({ length: totalRounds }, (_, index) => ({
      id: index,
      state: index < currentRound ? 'filled' : index === currentRound ? 'current' : 'empty',
      justFilled: false
    }));
    setStars(starArray);
  }, [totalRounds]);

  // Update stars when currentRound changes
  useEffect(() => {
    if (currentRound !== prevRound) {
      setStars(prev => prev.map((star, index) => {
        let newState = 'empty';
        let justFilled = false;

        if (index < currentRound) {
          newState = 'filled';
          // Mark as just filled if this star just changed
          if (index === currentRound - 1 && currentRound > prevRound) {
            justFilled = true;
          }
        } else if (index === currentRound) {
          newState = 'current';
        }

        return { ...star, state: newState, justFilled };
      }));

      setPrevRound(currentRound);

      // Clear justFilled animation after it completes
      if (currentRound > prevRound) {
        setTimeout(() => {
          setStars(prev => prev.map(star => ({ ...star, justFilled: false })));
        }, 500);
      }
    }
  }, [currentRound, prevRound]);

  return (
    <>
      {/* SVG Definitions (hidden) */}
      <svg style={{ display: 'none' }}>
        <defs>
          {/* Star shape path */}
          <symbol id="starShape" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </symbol>

          {/* Gradient for current/partial star */}
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      <div className={`unified-zone-header zone-${zone} ${className}`}>
        <div className="header-text">{title}</div>
        <div className="star-progress-container">
          <div className="star-track">
            {stars.map((star) => (
              <div
                key={star.id}
                className={`star ${star.state} ${star.justFilled ? 'just-filled' : ''}`}
              >
                <svg>
                  <use href="#starShape"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedHeader;
