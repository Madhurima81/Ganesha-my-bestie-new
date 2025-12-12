// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect } from 'react';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);
  const [showHintArrow, setShowHintArrow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [particleCount, setParticleCount] = useState(12);

  // Track time on screen for analytics
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeOnScreen = Date.now() - startTime;
      console.log(`📊 Welcome screen viewed for ${timeOnScreen}ms`);
      // TODO: Send to analytics when ready
      // trackEvent('welcome_screen_duration', timeOnScreen)
    };
  }, []);

  // Set particle count based on device
  useEffect(() => {
    const updateParticleCount = () => {
      setParticleCount(window.innerWidth < 768 ? 6 : 12);
    };
    
    updateParticleCount();
    window.addEventListener('resize', updateParticleCount);
    
    return () => window.removeEventListener('resize', updateParticleCount);
  }, []);

  // Preload images
  useEffect(() => {
    const images = [
      '/images/welcome-background.png',
      '/images/welcome-board.png',
      '/images/welcome-ganesha.png',
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

  // Show loading state while images load
  if (!imagesLoaded) {
    return (
      <div className="main-welcome-container">
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100
        }}>
          <div style={{
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'Comic Sans MS, cursive',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            Loading Ganesha's World...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-welcome-container">
      {/* Background */}
      <div className="welcome-background">
        <img 
          src="/images/welcome-background.png" 
          alt="Welcome Background"
          className="background-image"
        />
      </div>
      
      {/* WELCOME BOARD */}
      <div className={`welcome-board-container ${showButton ? 'visible' : ''}`}>
        <img 
          src="/images/welcome-board.png" 
          alt="Welcome to Ganesha's World"
          className="welcome-board-image"
        />
      </div>
      
      {/* GANESHA - Now with breathing animation */}
      <div className={`welcome-ganesha-image-container ${showButton ? 'visible' : ''}`}>
        <img 
          src="/images/welcome-ganesha.png" 
          alt="Ganesha"
          className="welcome-ganesha-image"
        />
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
      <div className={`hint-arrow ${showHintArrow ? 'visible' : ''}`}>
        👇
      </div>
      
      {/* BUTTON AT BOTTOM */}
      <div className="welcome-content-overlay">
        <div className={`adventure-button-container ${showButton ? 'visible' : ''}`}>
          <button 
            className={`new-adventure-btn ${pulseButton ? 'pulse-hint' : ''}`}
            onClick={handleStartAdventure}
            disabled={isStarting}
            aria-label="Start your adventure in Ganesha's World"
          >
            <span className="btn-text">
              {isStarting ? 'Starting...' : 'New Adventure'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Particles - Dynamic count based on device */}
      <div className="magical-particles">
        {[...Array(particleCount)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
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