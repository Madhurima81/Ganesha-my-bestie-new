// SunCollectionGame.jsx - Scene Integrated Version (GAME 1 ONLY)
// 🎯 GAME 1: Collect floating suns INTO central orb
// 🎯 GAME 2: Will be handled in SuryakotiScene.jsx - spawn draggable suns FROM orb to children
// 📡 INTEGRATION: Passes orb position + collected suns data to parent for Game 2
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
  autoStart = true,  // Auto-start for scene integration
  onOrbPositionReady = () => {}, // NEW: Callback to share orb position for Game 2
  
  // ✅ ADD: Resume props for reload handling
  isResuming = false,
  resumeCollectedSuns = 0,
  resumeIllumination = 0,
  resumeStarted = false
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

  // Game state (simplified)
  const [floatingObjects, setFloatingObjects] = useState([]);
  const [collectedSuns, setCollectedSuns] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [caveIllumination, setCaveIllumination] = useState(0);
  const [orbSuns, setOrbSuns] = useState([]); // Track visual suns in orb
  const gameAreaRef = useRef(null);

  // Target: Collect 5 suns to win
  const TARGET_SUNS = 3;
  

  // Debug logs
  useEffect(() => {
    console.log('🔍 SunCollectionGame - orbSuns updated:', orbSuns);
    console.log('🔍 SunCollectionGame - collectedSuns:', collectedSuns);
  }, [orbSuns, collectedSuns]);

// ✅ FIXED - useEffect #1: Resume Logic FIRST (prevent auto-start conflict)
useEffect(() => {
  if (isResuming && resumeStarted) {
    console.log('☀️ SUN COLLECTION: RESUMING with', resumeCollectedSuns, 'suns');
    
    // Set all states at once to prevent conflicts
    setCollectedSuns(resumeCollectedSuns);
    setCaveIllumination(resumeIllumination);
    setGameActive(true);
    setGameWon(false);
    setLevel(Math.max(1, Math.floor(resumeCollectedSuns / 2) + 1));
    
    // Handle orb suns
    if (resumeCollectedSuns > 0) {
      const resumeOrbSuns = [];
      for (let i = 1; i <= resumeCollectedSuns; i++) {
        resumeOrbSuns.push({
          id: `orb-sun-${i}`,
          angle: (i - 1) * (360 / TARGET_SUNS),
          delay: 0
        });
      }
      setOrbSuns(resumeOrbSuns);
    } else {
      setOrbSuns([]);
    }
    
    console.log('✅ SUN COLLECTION: Resume complete - game active');
    return; // CRITICAL: Exit early to prevent other useEffects
  }
}, [isResuming, resumeCollectedSuns, resumeIllumination, resumeStarted]);

// ✅ FIXED - useEffect #2: Auto-start ONLY if not resuming
useEffect(() => {
  if (autoStart && !isResuming && !gameActive) {
    console.log('🌞 Auto-starting sun collection (not resuming)');
    setGameActive(true);
  }
}, [autoStart, isResuming, gameActive]); // ← Add gameActive dependency

// ✅ FIXED - useEffect #3: Orb position (safe)
useEffect(() => {
  const orbPosition = { top: '20%', right: '10%' };
  onOrbPositionReady(orbPosition);
}, [onOrbPositionReady]);

// ✅ FIXED - useEffect #4: Game spawning (add safety checks)
useEffect(() => {
  let objectTimer;
  
  if (gameActive && !gameWon && !isResuming) { // ← Add !isResuming
    console.log('🎮 Starting object spawning interval');
    objectTimer = setInterval(spawnObject, 2000 / level);
  }
  
  return () => {
    if (objectTimer) {
      clearInterval(objectTimer);
      console.log('🛑 Cleared object spawning interval');
    }
  };
}, [gameActive, level, gameWon, isResuming]); // ← Add isResuming

// ✅ FIXED - useEffect #5: Animation (add safety checks)
useEffect(() => {
  if (!gameActive || gameWon || isResuming) return; // ← Add isResuming check
  
  const animationFrame = requestAnimationFrame(() => {
    setFloatingObjects(prevObjects => 
      prevObjects
        .map(obj => ({
          ...obj,
          y: obj.y - obj.speed
        }))
        .filter(obj => obj.y > -100)
    );
  });
  
  return () => cancelAnimationFrame(animationFrame);
}, [floatingObjects, gameActive, gameWon, isResuming]); // ← Add isResuming

// ✅ FIXED - useEffect #6: Completion check (unchanged)
useEffect(() => {
  if (collectedSuns >= TARGET_SUNS && !gameWon) {
    console.log('🎉 Game won! All suns collected!');
    setGameWon(true);
    setGameActive(false);
    setFloatingObjects([]);
    
    setTimeout(() => {
      onComplete({
        collectedSuns: TARGET_SUNS,
        orbPosition: { top: '20%', right: '10%' },
        orbData: orbSuns
      });
    }, 2000);
  }
}, [collectedSuns, gameWon, onComplete, orbSuns]);

  // Spawn a new object
  const spawnObject = () => {
    if (!gameAreaRef.current) {
      console.log('❌ No game area ref');
      return;
    }
    
    const gameAreaWidth = gameAreaRef.current.offsetWidth;
    const gameAreaHeight = gameAreaRef.current.offsetHeight;
    
    // Create a mix of suns and other objects
    const isSun = Math.random() < 0.4; // 40% chance of sun
    
    let chosenObject;
    if (isSun) {
      chosenObject = objectTypes[0]; // Sun
    } else {
      // Get a random non-sun object
      const nonSuns = objectTypes.slice(1);
      chosenObject = nonSuns[Math.floor(Math.random() * nonSuns.length)];
    }
    
    // Create new floating object
    const newObject = {
      id: Date.now() + Math.random(), // Unique ID
      type: chosenObject.type,
      image: chosenObject.image,
      isTarget: chosenObject.isTarget,
      x: Math.floor(Math.random() * (gameAreaWidth - 80)),
      y: gameAreaHeight + 20, // Start below bottom
      speed: 1 + Math.random() * 2 * level, // Random speed, faster at higher levels
      size: 60 + Math.floor(Math.random() * 20) // Size variation
    };
    
    console.log('✨ Spawning object:', newObject);
    
    setFloatingObjects(prev => [...prev, newObject]);
  };

  // Handle object click
  const handleObjectClick = (object) => {
    console.log(`Clicking object: ${object.type}, isTarget: ${object.isTarget}`);
    
    // Remove the clicked object
    setFloatingObjects(prevObjects => 
      prevObjects.filter(obj => obj.id !== object.id)
    );
    
    // Only suns are targets
    if (object.isTarget && object.type === 'sun') {
      const newCollected = collectedSuns + 1;
      setCollectedSuns(newCollected);
      
      // Add visual sun to orb with proper positioning
      const newSunInOrb = {
        id: `orb-sun-${newCollected}`,
        angle: (newCollected - 1) * (360 / TARGET_SUNS), // Distribute around orb
        delay: newCollected * 200 // Stagger animation
      };
      
      console.log('🌞 Adding sun to orb:', newSunInOrb);
      setOrbSuns(prev => {
        const updated = [...prev, newSunInOrb];
        console.log('🌞 Updated orbSuns:', updated);
        return updated;
      });
      
      // Update cave illumination (visual feedback)
      const newIllumination = Math.min(100, (newCollected / TARGET_SUNS) * 100);
      setCaveIllumination(newIllumination);
      
      // Level up every 2 suns
      if (newCollected % 2 === 0 && newCollected < TARGET_SUNS) {
        setLevel(prev => Math.min(prev + 1, 3));
        console.log('📈 Level up!');
      }
      
      // Call callback
      onSunCollected(newCollected);
      
      console.log('☀️ Sun collected!', newCollected, '/', TARGET_SUNS);
    } else {
      console.log('❌ Wrong object clicked:', object.type);
      // No penalty for wrong clicks
    }
  };

  // ✅ SCENE INTEGRATED RETURN - NO UI CHROME!
  return (
    <div className="scene-integrated-sun-game">
      {/* ✅ SIDE-POSITIONED ORB - Top Right */}
      <div className="side-orb-container" style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '150px',
        height: '150px',
        zIndex: 10
      }}>
        <div className="orb-visual">
          {/* Orb background image - GRADUAL FILTER */}
          <img 
            src={collectedSuns >= TARGET_SUNS ? orbGaneshaImage : orbEmptyImage}
            alt="Collection Orb"
            className={`orb-background ${collectedSuns >= TARGET_SUNS ? 'complete' : (collectedSuns > 0 ? 'collecting' : '')}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
filter: `drop-shadow(0 0 ${2 + (collectedSuns * 1)}px rgba(218, 165, 32, ${0.1 + (collectedSuns * 0.05)}))`            }}
          />
          
          {/* Collected suns inside orb */}
          <div className="orb-suns" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}>
            {orbSuns.map((orbSun, index) => (
              <div
                key={orbSun.id}
                className="orb-sun"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '20px',
                  height: '20px',
                  transform: `translate(-50%, -50%) rotate(${orbSun.angle || (index * 120)}deg) translateY(-30px)`,
                  zIndex: 4,
                  animation: `simpleSunAppear 0.8s ease-out ${orbSun.delay || (index * 200)}ms both`
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
          
          {/* Orb glow effect - REDUCED GLOW */}
          <div 

  className="orb-glow"
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60px',
    height: '60px',
    transform: 'translate(-50%, -50%)',
background: 'radial-gradient(circle, rgba(218, 165, 32, 0.02), transparent 70%)',
opacity: Math.min(0.1, caveIllumination / 800),
    borderRadius: '50%',
    transition: 'all 1s ease'
  }}
></div>
        </div>
        
        {/* Orb counter - REDUCED GLOW */}
        <div className="orb-counter" style={{
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
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
        }}>
          {collectedSuns}/{TARGET_SUNS}
        </div>
      </div>
      
      {/* ✅ JUST THE FLOATING OBJECTS */}
      <div 
        ref={gameAreaRef} 
        className="scene-game-area"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Don't block scene interactions
          zIndex: 8
        }}
      >
        {/* Floating Objects with actual images */}
        {floatingObjects.map(object => (
          <div
            key={object.id}
            className={`floating-object ${object.type} ${object.isTarget ? 'target' : 'distractor'}`}
            style={{
              position: 'absolute',
              left: `${object.x}px`,
              top: `${object.y}px`,
              width: `${object.size}px`,
              height: `${object.size}px`,
              cursor: object.isTarget ? 'pointer' : 'default',
              pointerEvents: 'auto', // Allow clicking on objects
              zIndex: 9
            }}
            onClick={() => handleObjectClick(object)}
          >
            <img 
              src={object.image} 
              alt={object.type}
              className="object-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* ✅ COMPLETION EFFECT - GRADUAL */}
      {gameWon && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            pointerEvents: 'none',
            fontSize: '20px',
            color: '#DAA520',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)',
            animation: 'gentleVictoryGlow 3s ease-in-out infinite'
          }}
        >
        
        </div>
      )}

      {/* ✅ MINIMAL CSS FOR ANIMATIONS - REDUCED YELLOW GLOW */}
      <style>{`
        @keyframes gentleVictoryGlow {
          0%, 100% { 
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.02);
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
        
        .orb-background.collecting {
          animation: orbPulse 2s ease-in-out infinite;
        }
        
        .orb-background.complete {
          filter: drop-shadow(0 0 8px rgba(218, 165, 32, 0.4)) brightness(1.1);
          animation: orbComplete 1s ease-out;
        }
        
        @keyframes orbPulse {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(218, 165, 32, 0.3));
          }
          50% { 
            transform: scale(1.02);
            filter: drop-shadow(0 0 8px rgba(218, 165, 32, 0.4));
          }
        }
        
        @keyframes orbComplete {
          0% { 
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 6px rgba(218, 165, 32, 0.3));
          }
          50% { 
            transform: scale(1.1) rotate(180deg);
            filter: drop-shadow(0 0 12px rgba(218, 165, 32, 0.5)) brightness(1.2);
          }
          100% { 
            transform: scale(1) rotate(360deg);
            filter: drop-shadow(0 0 8px rgba(218, 165, 32, 0.4)) brightness(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default SunCollectionGame;