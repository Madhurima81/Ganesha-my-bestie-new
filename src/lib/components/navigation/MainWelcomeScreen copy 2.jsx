// MainWelcomeScreen.jsx
import React, { useState, useEffect } from 'react';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);

  // Animate entrance
  useEffect(() => {
    // We only need to wait for the button animation now
    const timer = setTimeout(() => setShowButton(true), 1500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleStartAdventure = () => {
    console.log('🌟 Starting new adventure from main welcome');
    onStartAdventure();
  };

  return (
    <div className="main-welcome-container">
      {/* Background Image */}
      <div className="welcome-background">
        <img 
          src="/images/welcome-background.png" 
          alt="Welcome Background"
          className="background-image"
        />
      </div>
      
      {/* Main Content Overlay - NOW JUST THE BUTTON */}
      <div className="welcome-content-overlay">
        
        {/* Adventure Button */}
        <div className={`adventure-button-container ${showButton ? 'visible' : ''}`}>
          <button 
            className="new-adventure-btn"
            onClick={handleStartAdventure}
          >
            <span className="btn-glow"></span>
            <span className="btn-text">New Adventure</span>
            <div className="btn-sparkles">
              <div className="sparkle sparkle-1">✨</div>
              <div className="sparkle sparkle-2">⭐</div>
              <div className="sparkle sparkle-3">💫</div>
              <div className="sparkle sparkle-4">✨</div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Floating magical particles */}
      <div className="magical-particles">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`particle particle-${i + 1}`}
            style={{
              animationDelay: `${i * 0.8}s`,
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MainWelcomeScreen;