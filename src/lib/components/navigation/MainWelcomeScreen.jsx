// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect } from 'react';
import PrimaryBtn from '../shared/PrimaryBtn';
import GaneshaCharacter from '../character/GaneshaCharacter';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);
  const [showHintArrow, setShowHintArrow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Track time on screen for analytics
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const timeOnScreen = Date.now() - startTime;
      console.log(`📊 Welcome screen viewed for ${timeOnScreen}ms`);
    };
  }, []);

  // Preload images — welcome-ganesha.png removed, now inline SVG
  useEffect(() => {
    const images = [
      '/images/welcome-mooshika.png'
    ];
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    const imagePromises = images.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          console.log(`✅ Loaded ${loadedCount}/${totalImages}: ${src}`);
          resolve();
        };
        img.onerror = () => {
          console.error(`❌ Failed to load: ${src}`);
          reject(new Error(`Failed to load ${src}`));
        };
        img.src = src;
      });
    });
    
    Promise.all(imagePromises)
      .then(() => {
        console.log('🎉 All welcome screen images loaded');
        setImagesLoaded(true);
      })
      .catch(err => {
        console.error('⚠️ Some images failed to load:', err);
        // Still show the screen even if some images fail
        setImagesLoaded(true);
      });
  }, []);

  // Animate entrance (only after images loaded)
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    
    // Add pulse hint after 8 seconds if no click
    const pulseTimer = setTimeout(() => setPulseButton(true), 8000);
    
    // Add arrow hint after 10 seconds if still no click
    const arrowTimer = setTimeout(() => setShowHintArrow(true), 10000);
    
    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(pulseTimer);
      clearTimeout(arrowTimer);
    };
  }, [imagesLoaded]);

  const handleStartAdventure = () => {
    // Prevent double-click spam
    if (isStarting) {
      console.log('⚠️ Already starting adventure, ignoring click');
      return;
    }
    
    setIsStarting(true);
    console.log('🎸 Starting new adventure from main welcome');
    
    // TODO: Play sound effect here when audio system is ready
    // playSound('button-click');
    
    // Add slight delay for visual feedback
    setTimeout(() => {
      onStartAdventure();
    }, 300);
  };

  // Show loading state while Mooshika image loads
  if (!imagesLoaded) {
    return (
      <div className="main-welcome-container">
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <GaneshaCharacter
            expression="happy"
            size={180}
            style={{ animation: 'ganeshaBreathing 2s ease-in-out infinite' }}
          />
          <div style={{
            fontSize: '20px',
            color: '#8e63d9',
            fontFamily: "'Baloo 2', cursive",
            fontWeight: 700,
            opacity: 0.85,
          }}>
            Loading Ganesha's World...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-welcome-container">

      {/* BACKGROUND IMAGE */}
      <img
        src="/images/welcome-background.svg"
        alt=""
        className="welcome-bg-image"
        aria-hidden="true"
      />

      {/* TWINKLING STARS */}
      <div className="twinkle-stars" aria-hidden="true">
        <span/><span/><span/><span/><span/><span/>
        <span/><span/><span/><span/><span/><span/>
      </div>

      {/* FLOATING GOLDEN LIGHT PARTICLES */}
      <div className="floating-lights" aria-hidden="true">
        <span/><span/><span/><span/><span/>
      </div>

      {/* ATMOSPHERIC OVERLAY — center lift + edge depth */}
      <div className="welcome-bg-overlay" aria-hidden="true" />

      {/* CINEMATIC VIGNETTE */}
      <div className="welcome-vignette" aria-hidden="true" />

      {/* TITLE TEXT */}
      <div className={`welcome-title-container ${showButton ? 'visible' : ''}`}>
        <div className="welcome-title-wrapper">
          <h1 className="welcome-title">Ganesha World</h1>
        </div>
      </div>
      
      {/* GANESHA - Inline SVG component with breathing animation */}
      <div className={`welcome-ganesha-image-container ${showButton ? 'visible' : ''}`}>
        <div className="ganesha-wrap">
          <GaneshaCharacter
            expression="happy"
            className="welcome-ganesha-image"
          />
        </div>
      </div>
      
      {/* MOOSHIKA - Now with bounce animation */}
      <div className={`welcome-mooshika-image-container ${showButton ? 'visible' : ''}`}>
        <img 
          src="/images/welcome-mooshika.png" 
          alt="Mooshika"
          className="welcome-mooshika-image"
        />
      </div>
      
      {/* HINT ARROW - Appears after 10 seconds */}
      <div className={`hint-arrow ${showHintArrow ? 'visible' : ''}`} />
      
      {/* BUTTON AT BOTTOM */}
      <div className="welcome-content-overlay">
        <div className={`adventure-button-container ${showButton ? 'visible' : ''}`}>
          <PrimaryBtn
            label={isStarting ? 'Starting...' : 'Start'}
            onClick={handleStartAdventure}
            disabled={isStarting}
            size="lg"
            fullWidth={false}
          />
        </div>
      </div>
      
    </div>
  );
};

export default MainWelcomeScreen;