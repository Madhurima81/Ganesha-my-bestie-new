// SunCollectionGame.jsx - FINAL POLISHED VERSION
// ✅ Random scatter (no grid!)
// ✅ Glow persists for all remaining suns
// ✅ Victory message auto-hides before celebration

import React, { useState, useEffect, useRef } from 'react';
import './SunCollectionGame.css';

// Import your actual images
import sunImage from '../scenes/suryakoti-samaprabha/assets/images/sun.png';
import moonImage from '../scenes/suryakoti-samaprabha/assets/images/moon.png';
import starImage from '../scenes/suryakoti-samaprabha/assets/images/star.png';
import balloonImage from '../scenes/suryakoti-samaprabha/assets/images/balloon.png';
import cloudImage from '../scenes/suryakoti-samaprabha/assets/images/cloud.png';
import butterflyImage from '../scenes/suryakoti-samaprabha/assets/images/butterfly.png';
import orbEmptyImage from '../scenes/suryakoti-samaprabha/assets/images/orb-empty.png';
import orbGaneshaImage from '../scenes/suryakoti-samaprabha/assets/images/orb-ganesha.png';

const SunCollectionGame = ({ 
  onComplete = () => console.log('Game completed!'),
  onSunCollected = () => {},
  profileName = 'little explorer',
  
  // Resume props for reload handling
  isResuming = false,
  resumeCollectedSuns = 0,
  resumeIllumination = 0,
  resumeStarted = false,
  
  // Cave boundary configuration
  caveBounds = {
    top: '15%',
    left: '15%', 
    width: '70%',
    height: '70%'
  }
}) => {
  // Object types with actual images
  const objectTypes = [
    { type: 'sun', image: sunImage, isTarget: true },
    { type: 'moon', image: moonImage, isTarget: false },
    { type: 'star', image: starImage, isTarget: false },
    { type: 'balloon', image: balloonImage, isTarget: false },
    { type: 'cloud', image: cloudImage, isTarget: false },
    { type: 'butterfly', image: butterflyImage, isTarget: false }
  ];

  // Game state
  const [floatingObjects, setFloatingObjects] = useState([]);
  const [collectedSuns, setCollectedSuns] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [staticObjects, setStaticObjects] = useState([]);
  const [glowActivated, setGlowActivated] = useState(false); // ✅ Persistent glow state
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showVictoryMessage, setShowVictoryMessage] = useState(false); // ✅ NEW: Control victory display
  
  const caveAreaRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const TARGET_SUNS = 3;
  const GLOW_START_TIME = 20;
  const FALLBACK_TIME = 45;

  console.log('🎮 SunCollectionGame State:', { 
    collectedSuns, 
    gameTime, 
    gameActive, 
    fallbackMode,
    gameWon,
    glowActivated,
    isTabVisible,
    floatingCount: floatingObjects.length 
  });

  // Detect tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      console.log('👁️ Tab visibility:', visible ? 'VISIBLE' : 'HIDDEN');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Resume logic for reload handling
  useEffect(() => {
    if (isResuming && resumeStarted && resumeCollectedSuns > 0) {
      console.log('☀️ SUN COLLECTION: Resuming with', resumeCollectedSuns, 'suns collected');
      setCollectedSuns(resumeCollectedSuns);
      setGameActive(true);
      setGameWon(false);
      setFallbackMode(false);
      setGameTime(0);
      setGlowActivated(false);
    }
  }, [isResuming, resumeCollectedSuns, resumeStarted]);

  // Game timer - ONLY runs when tab visible and game active
  useEffect(() => {
    if (!gameActive || gameWon || !isTabVisible) {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      return;
    }

    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev + 1;
        
        // ✅ Activate glow at 20 seconds (persist forever)
        if (newTime >= GLOW_START_TIME && !glowActivated) {
          console.log('✨ GLOW ACTIVATED at', newTime, 'seconds - will persist for all suns!');
          setGlowActivated(true);
        }
        
        // Trigger fallback at 45 seconds if not complete
        if (newTime >= FALLBACK_TIME && !fallbackMode && collectedSuns < TARGET_SUNS) {
          console.log('🎯 FALLBACK MODE TRIGGERED at', newTime, 'seconds');
          triggerFallbackMode();
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [gameActive, gameWon, isTabVisible, fallbackMode, collectedSuns, glowActivated]);

  // Speed calculation: starts fast (3), slows to 1 over 45 seconds
  const getCurrentSpeed = () => {
    if (gameTime < 10) return 3;
    if (gameTime < 20) return 2.5;
    if (gameTime < 30) return 2;
    if (gameTime < 40) return 1.5;
    return 1;
  };

  // Spawn objects - ONLY when tab visible, game active, and NOT complete
  useEffect(() => {
    if (!gameActive || fallbackMode || gameWon || !isTabVisible || collectedSuns >= TARGET_SUNS) {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      return;
    }

    const spawnInterval = setInterval(() => {
      spawnObject();
    }, 2000);

    spawnTimerRef.current = spawnInterval;
    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    };
  }, [gameActive, fallbackMode, gameWon, isTabVisible, collectedSuns]);

  // Animate falling objects - ONLY when tab visible
  useEffect(() => {
    if (!gameActive || fallbackMode || gameWon || !isTabVisible) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const speed = getCurrentSpeed();
    
    const animate = () => {
      setFloatingObjects(prevObjects => 
        prevObjects
          .map(obj => ({
            ...obj,
            y: obj.y + speed
          }))
          .filter(obj => {
            if (!caveAreaRef.current) return true;
            const caveHeight = caveAreaRef.current.offsetHeight;
            return obj.y < caveHeight + 100;
          })
      );
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [floatingObjects, gameActive, fallbackMode, gameWon, isTabVisible, gameTime]);

  // Spawn a new falling object
  const spawnObject = () => {
    if (!caveAreaRef.current) return;

    const caveWidth = caveAreaRef.current.offsetWidth;
    
    const isSun = Math.random() < 0.4;
    const chosenObject = isSun 
      ? objectTypes[0] 
      : objectTypes[Math.floor(Math.random() * (objectTypes.length - 1)) + 1];

    const newObject = {
      id: Date.now() + Math.random(),
      type: chosenObject.type,
      image: chosenObject.image,
      isTarget: chosenObject.isTarget,
      x: Math.random() * (caveWidth - 100),
      y: -100,
      size: 70 + Math.random() * 20
    };

    setFloatingObjects(prev => [...prev, newObject]);
  };

// ✅ SIMPLE & RELIABLE: Zone-based fallback with guaranteed spread!
  const triggerFallbackMode = () => {
    const sunsNeeded = TARGET_SUNS - collectedSuns;
    
    if (sunsNeeded <= 0) {
      console.log('🎯 FALLBACK: No suns needed, already complete');
      return;
    }
    
    // ✅ ALWAYS show 4 suns (fixed number)
    const FALLBACK_SUNS = 3;
    console.log('🎯 FALLBACK MODE: Creating scene with', FALLBACK_SUNS, 'suns (need', sunsNeeded, 'more to win)');
    
    setFallbackMode(true);
    setFloatingObjects([]);
    
    if (!caveAreaRef.current) return;
    
    const caveWidth = caveAreaRef.current.offsetWidth;
    const caveHeight = caveAreaRef.current.offsetHeight;
    
    console.log('📊 Cave size:', caveWidth, 'x', caveHeight);
    
    // ✅ ZONE-BASED PLACEMENT: Divide cave into grid zones
  // ✅ ZONE-BASED PLACEMENT: Divide cave into grid zones
    const cols = 5; // 5 columns for MORE horizontal spread
    const rows = 2; // 2 rows 
    const zoneWidth = caveWidth / cols;
    const zoneHeight = caveHeight / rows;
    const padding = 40; // More padding inside each zone
    
    console.log('🎯 Creating', cols, 'x', rows, 'grid =', cols * rows, 'zones');
    
    // Create all possible zone positions
    const allZones = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        allZones.push({ row, col });
      }
    }
    
    // Shuffle zones for random distribution
    allZones.sort(() => Math.random() - 0.5);
    
    // ✅ Create objects: 4 suns + 6 distractors = 10 total
    const distractorCount = 6;
    const totalObjects = FALLBACK_SUNS + distractorCount;
    
    // Take only as many zones as we need objects
    const selectedZones = allZones.slice(0, totalObjects);
    
    // ✅ Create balanced mix of distractor types
    const nonSunObjects = objectTypes.slice(1); // All except sun
    const distractorTypes = [];
    
    // Ensure variety in distractors
    for (let i = 0; i < distractorCount; i++) {
      const randomType = nonSunObjects[i % nonSunObjects.length];
      distractorTypes.push(randomType);
    }
    
    // Shuffle distractor types
    distractorTypes.sort(() => Math.random() - 0.5);
    
    // ✅ Create objects by placing them in zones
    const newStaticObjects = [];
    
    // Place suns first
    for (let i = 0; i < FALLBACK_SUNS; i++) {
      const zone = selectedZones[i];
      
      // Random position WITHIN the zone (with padding)
      const x = zone.col * zoneWidth + padding + Math.random() * (zoneWidth - padding * 2 - 80);
      const y = zone.row * zoneHeight + padding + Math.random() * (zoneHeight - padding * 2 - 80);
      
      newStaticObjects.push({
        id: `static-sun-${i}`,
        type: 'sun',
        image: sunImage,
        isTarget: true,
        x: Math.max(padding, Math.min(x, caveWidth - 80 - padding)),
        y: Math.max(padding, Math.min(y, caveHeight - 80 - padding)),
        size: 75 + Math.random() * 10
      });
    }
    
    // Place distractors
    for (let i = 0; i < distractorCount; i++) {
      const zone = selectedZones[FALLBACK_SUNS + i];
      const distractor = distractorTypes[i];
      
      // Random position WITHIN the zone (with padding)
      const x = zone.col * zoneWidth + padding + Math.random() * (zoneWidth - padding * 2 - 80);
      const y = zone.row * zoneHeight + padding + Math.random() * (zoneHeight - padding * 2 - 80);
      
      newStaticObjects.push({
        id: `static-distractor-${i}`,
        type: distractor.type,
        image: distractor.image,
        isTarget: false,
        x: Math.max(padding, Math.min(x, caveWidth - 80 - padding)),
        y: Math.max(padding, Math.min(y, caveHeight - 80 - padding)),
        size: 75 + Math.random() * 10
      });
    }
    
    console.log('✨ Created fallback scene:', {
      totalSuns: FALLBACK_SUNS,
      distractors: distractorCount,
      totalObjects: newStaticObjects.length,
      types: distractorTypes.map(d => d.type)
    });
    
    setStaticObjects(newStaticObjects);
  };

  // Handle object click with immediate game stop
  const handleObjectClick = (object, isStatic = false) => {
    if (!object.isTarget) return;

    const newCollected = collectedSuns + 1;
    setCollectedSuns(newCollected);
    
    console.log('☀️ Sun collected!', newCollected, '/', TARGET_SUNS);

    if (isStatic) {
      setStaticObjects(prev => prev.filter(obj => obj.id !== object.id));
    } else {
      setFloatingObjects(prev => prev.filter(obj => obj.id !== object.id));
    }

    onSunCollected(newCollected);

    // Immediately stop game when target reached
    if (newCollected >= TARGET_SUNS) {
      console.log('🎉 Game won! STOPPING ALL TIMERS AND SPAWNING');
      setGameWon(true);
      setGameActive(false);
      
      // Show victory message
      setShowVictoryMessage(true);
      
      // ✅ NEW: Hide victory message after 1.5 seconds (before word celebration)
      setTimeout(() => {
        setShowVictoryMessage(false);
        console.log('👋 Victory message hidden, ready for word celebration');
      }, 1500);
      
      // Clear ALL objects immediately
      setFloatingObjects([]);
      setStaticObjects([]);
      
      // Clear all timers immediately
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      setTimeout(() => {
        onComplete({
          collectedSuns: TARGET_SUNS,
          completionTime: gameTime
        });
      }, 2000);
    }
  };

  // Calculate remaining suns for fallback display
  const remainingSuns = TARGET_SUNS - collectedSuns;
  
  // ✅ Determine if suns should glow (once activated at 20s, persists for ALL remaining suns)
  const shouldGlow = glowActivated || gameTime >= GLOW_START_TIME;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }}>
      {/* Cave play area */}
      <div
        ref={caveAreaRef}
        style={{
          position: 'absolute',
          top: caveBounds.top,
          left: caveBounds.left,
          width: caveBounds.width,
          height: caveBounds.height,
          pointerEvents: 'none',
          zIndex: 8
        }}
      >
        {/* Falling objects with CIRCULAR BORDERS */}
        {!fallbackMode && floatingObjects.map(obj => (
          <div
            key={obj.id}
            onClick={() => handleObjectClick(obj)}
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.size}px`,
              height: `${obj.size}px`,
              cursor: obj.isTarget ? 'pointer' : 'default',
              pointerEvents: 'auto',
              transition: 'transform 0.2s ease',
              zIndex: 9,
              borderRadius: '50%',
              border: obj.isTarget 
                ? '3px solid rgba(218, 165, 32, 0.6)' 
                : '2px solid rgba(200, 200, 200, 0.4)',
              background: obj.isTarget 
                ? 'radial-gradient(circle, rgba(218, 165, 32, 0.15), transparent 70%)'
                : 'radial-gradient(circle, rgba(200, 200, 200, 0.1), transparent 70%)',
              boxShadow: obj.isTarget 
                ? '0 0 15px rgba(218, 165, 32, 0.4)'
                : '0 0 8px rgba(200, 200, 200, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // ✅ Glow persists once activated (for ALL suns)
              filter: obj.isTarget && shouldGlow 
                ? 'brightness(1.3)' 
                : 'brightness(1)',
              animation: obj.isTarget && shouldGlow ? 'sunGlow 1.5s ease-in-out infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              if (obj.isTarget) e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img 
              src={obj.image}
              alt={obj.type}
              style={{
                width: '75%',
                height: '75%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />
          </div>
        ))}

        {/* Static fallback objects with CIRCULAR BORDERS - RANDOM SCATTER */}
        {fallbackMode && staticObjects.map(obj => (
          <div
            key={obj.id}
            onClick={() => handleObjectClick(obj, true)}
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.size}px`,
              height: `${obj.size}px`,
              cursor: obj.isTarget ? 'pointer' : 'default',
              pointerEvents: 'auto',
              transition: 'transform 0.2s ease',
              zIndex: 9,
              borderRadius: '50%',
              border: obj.isTarget 
                ? '4px solid rgba(255, 215, 0, 0.9)' 
                : '2px solid rgba(200, 200, 200, 0.5)',
              background: obj.isTarget 
                ? 'radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent 70%)'
                : 'radial-gradient(circle, rgba(200, 200, 200, 0.1), transparent 70%)',
              boxShadow: obj.isTarget 
                ? '0 0 25px rgba(255, 215, 0, 0.8)'
                : '0 0 10px rgba(200, 200, 200, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: obj.isTarget ? 'brightness(1.4)' : 'brightness(1)',
              animation: obj.isTarget ? 'sunGlowBright 1s ease-in-out infinite, fadeIn 0.5s ease-out' : 'fadeIn 0.5s ease-out'
            }}
            onMouseEnter={(e) => {
              if (obj.isTarget) e.currentTarget.style.transform = 'scale(1.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img 
              src={obj.image}
              alt={obj.type}
              style={{
                width: '70%',
                height: '70%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />
          </div>
        ))}

{/* Fallback hint - SIMPLE & LOWER */}
        {fallbackMode && !gameWon && remainingSuns > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '40%',
            transform: 'translateX(-50%)',
            background: 'rgba(218, 165, 32, 0.95)',
            color: '#2c1810',
            padding: '8px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
            pointerEvents: 'none',
            animation: 'slideUp 0.5s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}>
            ☀️ Click {remainingSuns} sun{remainingSuns > 1 ? 's' : ''}!
          </div>
        )}
      </div>

      {/* Collection orb (side-positioned) */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '150px',
        height: '150px',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img 
            src={collectedSuns >= TARGET_SUNS ? orbGaneshaImage : orbEmptyImage}
            alt="Collection Orb"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 ${2 + (collectedSuns * 3)}px rgba(218, 165, 32, ${0.2 + (collectedSuns * 0.1)}))`,
              transition: 'filter 0.5s ease'
            }}
          />
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}>
            {Array.from({ length: collectedSuns }).map((_, index) => (
              <div
                key={`orb-sun-${index}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '20px',
                  height: '20px',
                  transform: `translate(-50%, -50%) rotate(${index * (360 / TARGET_SUNS)}deg) translateY(-30px)`,
                  zIndex: 4,
                  animation: `simpleSunAppear 0.8s ease-out ${index * 200}ms both`
                }}
              >
                <img src={sunImage} alt="Collected Sun" style={{
                  width: '100%',
                  height: '100%',
                  filter: 'brightness(1.2) drop-shadow(0 0 4px rgba(218, 165, 32, 0.6))',
                  borderRadius: '50%'
                }} />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #DAA520, #CD853F)',
          color: '#2c1810',
          fontWeight: 'bold',
          fontSize: '14px',
          padding: '6px 12px',
          borderRadius: '15px',
          border: '2px solid #B8860B',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          whiteSpace: 'nowrap'
        }}>
          {collectedSuns}/{TARGET_SUNS}
        </div>
      </div>

      {/* ✅ Victory message - AUTO-HIDES after 1.5 seconds */}
      {gameWon && showVictoryMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(218, 165, 32, 0.95)',
          color: '#2c1810',
          padding: '20px 40px',
          borderRadius: '30px',
          fontSize: '32px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          animation: 'victoryPop 0.5s ease-out',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          textAlign: 'center',
          zIndex: 20
        }}>
          <div style={{ marginBottom: '10px' }}>🎉 Amazing, {profileName}! 🎉</div>
          <div style={{ fontSize: '20px' }}>You found all the suns!</div>
        </div>
      )}

      <style>{`
        @keyframes sunGlow {
          0%, 100% { 
            filter: brightness(1.3);
            box-shadow: 0 0 15px rgba(218, 165, 32, 0.4);
          }
          50% { 
            filter: brightness(1.5);
            box-shadow: 0 0 25px rgba(218, 165, 32, 0.6);
          }
        }

        @keyframes sunGlowBright {
          0%, 100% { 
            filter: brightness(1.4);
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
          }
          50% { 
            filter: brightness(1.6);
            box-shadow: 0 0 35px rgba(255, 215, 0, 1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0);
          }
        }


        @keyframes victoryPop {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes simpleSunAppear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SunCollectionGame;