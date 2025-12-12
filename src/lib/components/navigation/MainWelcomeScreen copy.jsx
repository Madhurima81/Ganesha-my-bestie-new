// MainWelcomeScreen.jsx - Using your beautiful images
import React, { useState, useEffect } from 'react';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showCharacters, setShowCharacters] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Animate entrance
  useEffect(() => {
    const timer1 = setTimeout(() => setShowCharacters(true), 500);
    const timer2 = setTimeout(() => setShowButton(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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
      
      {/* Main Content Overlay */}
      <div className="welcome-content-overlay">
        {/* Welcome Title */}
        <div className="welcome-title-container">
          <h1 className="main-welcome-title">Welcome to Ganesha's World</h1>
        </div>
        
        {/* Character Images */}
        <div className={`character-images ${showCharacters ? 'visible' : ''}`}>
          {/* Ganesha Character */}
          <div className="ganesha-image-container">
            <img 
              src="/images/ganesha-character.png" 
              alt="Lord Ganesha"
              className="ganesha-image"
            />
            <div className="character-glow ganesha-glow"></div>
          </div>
          
          {/* Mooshika Character */}
          <div className="mooshika-image-container">
            <img 
              src="/images/welcome-mooshika.png" 
              alt="Mooshika"
              className="mooshika-image"
            />
            <div className="character-glow mooshika-glow"></div>
          </div>
        </div>
        
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