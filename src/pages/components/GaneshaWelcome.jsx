// GaneshaWelcome.jsx - Welcome message from Ganesha
import React, { useState, useEffect } from 'react';
import GaneshaCharacter from '../../lib/components/character/GaneshaCharacter';
import './GaneshaWelcome.css';

const GaneshaWelcome = ({ onClose, showOnFirstVisit = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('hasSeenGaneshaWelcome');
    
    if (showOnFirstVisit && !hasSeenWelcome) {
      // Show welcome after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showOnFirstVisit]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenGaneshaWelcome', 'true');
    if (onClose) {
      setTimeout(onClose, 300); // Wait for animation to finish
    }
  };

  if (!isVisible) return null;

  return (
    <div className="ganesha-welcome-overlay" onClick={handleClose}>
      <div className="ganesha-welcome-card" onClick={(e) => e.stopPropagation()}>
        {/* Ganesha Character */}
        <div className="ganesha-welcome-character">
          <GaneshaCharacter
            className="ganesha-welcome-avatar"
            expression="happy"
            size={160}
            aria-label="Ganesha"
          />
        </div>

        {/* Decorative Sparkles */}
        <div className="welcome-sparkles">
          <span className="welcome-sparkle">✨</span>
          <span className="welcome-sparkle">⭐</span>
          <span className="welcome-sparkle">✨</span>
          <span className="welcome-sparkle">💫</span>
        </div>

        {/* Welcome Message */}
        <div className="ganesha-speech-bubble">
          <h2 className="ganesha-greeting">Namaste, Little Explorer! 🙏</h2>
          <p className="ganesha-message">
            Welcome to my magical world! I'm Ganesha, your guide on this amazing adventure.
          </p>
          <p className="ganesha-instruction">
            <strong>🗺️ Click on any colorful zone on the map</strong> to start exploring! 
            Each zone has fun games and stories waiting for you.
          </p>
          <div className="ganesha-tips">
            <div className="tip-item">📚 <strong>Learning Zones:</strong> Complete scenes one by one</div>
            <div className="tip-item">🎪 <strong>Fun Zones:</strong> Play anytime you want!</div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="ganesha-welcome-button"
          onClick={handleClose}
        >
          Let's Explore! 🚀
        </button>
      </div>
    </div>
  );
};

export default GaneshaWelcome;

