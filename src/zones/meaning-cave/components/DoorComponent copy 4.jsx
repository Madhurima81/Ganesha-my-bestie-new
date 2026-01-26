// lib/components/cave/DoorComponent.jsx - COMPLETE PROTECTED VERSION
import React, { useState, useEffect, useRef } from 'react';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import './DoorComponentV1.css';

const getSyllablePosition = (index) => {
  // Floating around like leaves in the wind - but consistent
  const positions = [
    { x: 18, y: 38 },   // Va - gentle floating
    { x: 72, y: 52 },   // kra - gentle floating
    { x: 45, y: 28 },   // Third syllable
    { x: 82, y: 35 },   // Fourth syllable  
    { x: 28, y: 68 },   // Fifth syllable
    { x: 65, y: 72 },   // Sixth syllable
    { x: 55, y: 45 },   // Seventh syllable
    { x: 15, y: 58 }    // Eighth syllable
  ];
  return positions[index] || positions[0];
};

const DoorComponent = ({
  syllables = ['Va', 'kra'],
  completedWord = 'Vakratunda',
  onDoorComplete,
  onSyllablePlaced,
  sceneTheme = 'cave-of-secrets',
  doorImage,
  className = '',
  
  // Educational props
  educationalMode = true,
  showTargetWord = true,
  currentStep = 0,
  expectedSyllable = null,
  onCorrectClick = null,
  onWrongClick = null,
  
  // Reload/Resume props
  isCompleted = false,
  placedSyllables = [],
  isResuming = false,
  
  // Customization props
  targetWordTitle = '',
  successMessage = "Perfect!",
  errorMessage = "Try the highlighted syllable!",
  
  // Visual customization
  primaryColor = '#FFD700',
  secondaryColor = '#FF8C42',
  errorColor = '#FF4444',

    onSyllableAudio = null,  // ← ADD THIS LINE

  
  // 🛡️ Protection props
  modalOpen = false  // ✅ NEW: Blocks clicks when modals open
}) => {

  // ========== 🛡️ CLICK PROTECTION STATE ==========
  const lastClickTimeRef = useRef(0);        // Track last click time for cooldown
  const isProcessingClickRef = useRef(false); // Prevent race conditions
  const activeTouchesRef = useRef(0);        // Track iPad multi-touch

  // ✅ FIXED: Initialize syllables with CONSISTENT positions using helper function
  const [floatingSyllables, setFloatingSyllables] = useState(() => {
    console.log('🔄 DoorComponent: Initializing syllables', { syllables, placedSyllables, isResuming });
    
    return syllables.map((syllable, index) => {
      const wasPlaced = placedSyllables.includes(syllable);
      
      return {
        id: index,
        text: syllable,
        placed: wasPlaced,
        floating: !wasPlaced,
        position: getSyllablePosition(index)  // ✅ CONSISTENT: Use helper function
      };
    });
  });
  
  // Initialize door state based on completion
  const [doorState, setDoorState] = useState(() => {
    if (isCompleted) {
      return 'dissolved';
    }
    return 'waiting';
  });
  
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparkleType, setSparkleType] = useState('gentle');
  const [allSyllablesPlaced, setAllSyllablesPlaced] = useState(isCompleted);
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Track if initial setup is done to prevent useEffect conflicts
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);


  const doorRef = useRef(null);
  const syllableRefs = useRef({});
  const timersRef = useRef([]);

  // Only run resume logic if NOT already handled in initial state
  useEffect(() => {
    // Prevent double-setup during initial load
    if (!isResuming || initialSetupDone) {
      setInitialSetupDone(true);
      return;
    }
    
    console.log('🔄 DoorComponent: Resume useEffect triggered', { 
      isCompleted, 
      placedSyllables,
      currentSyllables: floatingSyllables.map(s => ({ text: s.text, placed: s.placed }))
    });
    
    // Only update if there's a mismatch between current state and expected state
    const needsUpdate = floatingSyllables.some(syllable => {
      const shouldBePlaced = placedSyllables.includes(syllable.text);
      return syllable.placed !== shouldBePlaced;
    });
    
    if (needsUpdate) {
      console.log('🔧 DoorComponent: Updating syllable states to match saved progress');
      
      setFloatingSyllables(prev => prev.map(syllable => {
        const shouldBePlaced = placedSyllables.includes(syllable.text);
        return {
          ...syllable,
          placed: shouldBePlaced,
          floating: !shouldBePlaced
        };
      }));
    }
    
    setInitialSetupDone(true);
  }, [isResuming, placedSyllables]);

  // ✅ FIXED: Position animation uses SAME positions as initial state
  useEffect(() => {
    // Only animate on NEW games, not reloads - but use SAME final positions
    if (initialSetupDone && !isResuming && !isCompleted) {
      const timer = setTimeout(() => {
        setFloatingSyllables(prev => prev.map((syllable, index) => {
          if (syllable.placed) return syllable;  // Don't move placed syllables
          
          // ✅ CRITICAL: Use the SAME position function as initial state
          return {
            ...syllable,
            position: getSyllablePosition(index)  // Consistent with initial state
          };
        }));
      }, 300); // Reduced from 500ms for faster feel
      
      timersRef.current.push(timer);
      return () => clearTimeout(timer);
    }
  }, [initialSetupDone, isResuming, isCompleted]);

useEffect(() => {
  const allPlaced = floatingSyllables.every(s => s.placed);
  
  console.log('🔍 DOOR BUTTON DEBUG:', {
    allPlaced,
    allSyllablesPlaced,
    isCompleted,
    syllablesLength: syllables.length,
    completedWord,
    showPlayButton
  });
  
  if (allPlaced && !allSyllablesPlaced && !isCompleted && syllables.length > 0) {
    console.log('🎯 DoorComponent: All syllables placed, triggering completion');
    console.log('🎯 completedWord:', completedWord);
    
    setAllSyllablesPlaced(true);

    const delayTimer = setTimeout(() => {
      console.log('🎵 Playing word audio');
      
      // SIMPLIFIED: Show button first, then try audio
      console.log('✅ SHOWING BUTTON NOW');
      setShowPlayButton(true);
      
      if (completedWord) {
        const wordMap = {
          'Vakratunda': 'vakratunda',
          'Mahakaya': 'mahakaya',
          'Suryakoti': 'suryakoti',
          'Samaprabha': 'samaprabha',
          'Nirvighnam': 'nirvighnam',
          'Kurume Deva': 'kurumedeva'
        };
        const audioFile = wordMap[completedWord] || completedWord.toLowerCase();
        console.log('🎵 Audio file:', audioFile);
        
        // Play audio in background (non-blocking)
        const audio = new Audio(`/audio/words/${audioFile}.mp3`);
        audio.play().catch(err => console.log('⚠️ Audio play error:', err));
      }
    }, 1000);

    timersRef.current.push(delayTimer);
  }
}, [floatingSyllables, allSyllablesPlaced, isCompleted, syllables.length, completedWord]);

  // ========== 🛡️ PROTECTED SYLLABLE CLICK HANDLER ==========
  /*const handleSyllableClick = (syllableId) => {
    const now = Date.now();
    
    // ========== 🛡️ PROTECTION LAYER 1: COOLDOWN ==========
    // Prevents rapid clicking (300ms between clicks)
    if (now - lastClickTimeRef.current < 300) {
      console.log('🚫 DOOR BLOCKED: Click too fast! Wait 300ms between clicks');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 2: RACE CONDITION ==========
    // Prevents simultaneous processing (multi-touch on iPad)
    if (isProcessingClickRef.current) {
      console.log('🚫 DOOR BLOCKED: Already processing another syllable!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 3: MULTI-TOUCH ==========
    // Prevents iPad 2-finger taps
    if (activeTouchesRef.current > 1) {
      console.log('🚫 DOOR BLOCKED: Multi-touch detected! (' + activeTouchesRef.current + ' fingers)');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 4: MODAL CHECK ==========
    // Prevents clicks when modals are open
    if (modalOpen) {
      console.log('🚫 DOOR BLOCKED: Modal is open!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 5: COMPLETION CHECK ==========
    if (isCompleted) {
      console.log('🚫 Door already completed - ignoring syllable click');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 6: SYLLABLE VALIDATION ==========
    const syllable = floatingSyllables.find(s => s.id === syllableId);
    if (!syllable || syllable.placed) {
      console.log('🚫 Syllable not found or already placed:', syllableId);
      return;
    }
    
    // ========== ✅ ALL CHECKS PASSED - PROCESS CLICK ==========
    console.log('✅ Syllable click APPROVED:', syllable.text, 'Expected:', expectedSyllable || syllables[currentStep]);
    
    // Record this click and lock processing
    lastClickTimeRef.current = now;
    isProcessingClickRef.current = true;

    // Educational mode logic
    if (educationalMode) {
      const expectedSyllableText = expectedSyllable || syllables[currentStep];
      const isCorrect = syllable.text === expectedSyllableText;
      
      if (!isCorrect) {
        console.log(`❌ Wrong! Expected "${expectedSyllableText}", got "${syllable.text}"`);
        
        setErrorFeedback(true);
        setSparkleType('error');
        setShowSparkles(true);
        
        const timer = setTimeout(() => {
          setErrorFeedback(false);
          setShowSparkles(false);
          isProcessingClickRef.current = false;  // ✅ Release lock
        }, 1000);
        timersRef.current.push(timer);
        
        if (onWrongClick) {
          onWrongClick(syllable.text, expectedSyllableText);
        }
        
        return;
      }
      
      console.log(`✅ Correct! Expected "${expectedSyllableText}", got "${syllable.text}"`);
      
      if (onCorrectClick) {
        onCorrectClick(syllable.text, currentStep);
      }
    }

    // Play pronunciation sound
    playAudio(`/audio/syllables/${syllable.text.toLowerCase()}.mp3`);

    // Update syllable state
    setFloatingSyllables(prev => prev.map(s => 
      s.id === syllableId 
        ? { ...s, placed: true, floating: false }
        : s
    ));

    // Show placement sparkles
    setSparkleType('placement');
    setShowSparkles(true);
    
    const timer = setTimeout(() => {
      setShowSparkles(false);
      isProcessingClickRef.current = false;  // ✅ Release lock after animation
    }, 800);
    timersRef.current.push(timer);

    // Notify parent component
    if (onSyllablePlaced) {
      onSyllablePlaced(syllable.text);
    }
  };*/

  const handleSyllableClick = (syllableId) => {
  // Basic validation only
  if (isCompleted) {
    console.log('Door already completed');
    return;
  }
  
  const syllable = floatingSyllables.find(s => s.id === syllableId);
  if (!syllable || syllable.placed) {
    console.log('Syllable not found or already placed');
    return;
  }
  
  if (modalOpen) {
    console.log('Modal is open');
    return;
  }
  
  console.log('✅ Processing syllable:', syllable.text);

  // ✅ Play syllable audio
if (onSyllableAudio) {
  onSyllableAudio(syllable.text.toLowerCase());
}

  // Educational mode logic
  if (educationalMode) {
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    const isCorrect = syllable.text === expectedSyllableText;
    
    if (!isCorrect) {
      console.log(`Wrong! Expected "${expectedSyllableText}", got "${syllable.text}"`);
      
      setErrorFeedback(true);
      setSparkleType('error');
      setShowSparkles(true);
      
      if (onWrongClick) {
        onWrongClick(syllable.text, expectedSyllableText);
      }
      
      setTimeout(() => {
        setErrorFeedback(false);
        setShowSparkles(false);
      }, 800);
      
      return;
    }
    
    console.log('✅ Correct syllable clicked!');
    if (onCorrectClick) {
      onCorrectClick(syllable.text);
    }
  }
  
  // Place syllable
  setFloatingSyllables(prev => prev.map(s => 
    s.id === syllableId ? { ...s, placed: true, floating: false } : s
  ));
  
  
  setSparkleType('placement');
  setShowSparkles(true);
  
  if (onSyllablePlaced) {
    onSyllablePlaced(syllable.text);
  }
  
  setTimeout(() => {
    setShowSparkles(false);
  }, 800);
};

const handleDoorComplete = () => {
  if (doorState === 'dissolved' || isCompleted) {
    console.log('🚪 Door already completed - skipping completion animation');
    return;
  }
  
  console.log('🚪 Door complete - all syllables placed!');
  
  // Don't play door audio or animate yet - parent will control timing
  setDoorState('opening');
  
  const timer = setTimeout(() => {
    setDoorState('dissolved');
    setShowSparkles(false);
    
    if (onDoorComplete) {
      onDoorComplete();
    }
  }, 2000);
  
  timersRef.current.push(timer);
};

  const playAudio = (audioPath) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.7;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const shouldHighlightSyllable = (syllable) => {
    if (!educationalMode || isCompleted) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text === expectedSyllableText;
  };

  const isSyllableDisabled = (syllable) => {
    if (!educationalMode || isCompleted) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text !== expectedSyllableText && !syllable.placed;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

 if (doorState === 'dissolved') {
  return null;
}

  // Debug log current syllable state
  console.log('🔍 DoorComponent render:', {
    syllables: syllables,
    floatingSyllables: floatingSyllables.map(s => ({ text: s.text, placed: s.placed, position: s.position })),
    placedSyllables,
    isResuming,
    initialSetupDone,
    modalOpen
  });

  return (
    <div className={`door-component ${sceneTheme} ${className}`}>
      {/* Target Word Display */}
      {showTargetWord && (
        <div className="door-target-word" style={{ 
          background: `linear-gradient(135deg, ${primaryColor}E6, ${secondaryColor}E6)`,
          borderColor: primaryColor 
        }}>
          <h2 style={{ color: sceneTheme === 'cave-of-secrets' ? '#8B4513' : '#2C3E50' }}>
            {targetWordTitle || `${completedWord.toUpperCase()}`}
          </h2>
        </div>
      )}

      {/* Progress Indicators */}
      {educationalMode && (
        <div className="door-progress">
          {syllables.map((syllable, index) => (
            <div 
              key={index}
              className={`progress-syllable ${
                index < currentStep ? 'completed' : 
                index === currentStep ? 'current' : 'pending'
              }`}
            >
              {syllable}
            </div>
          ))}
        </div>
      )}
      
      <div 
        ref={doorRef}
        className={`door-container ${doorState} ${errorFeedback ? 'error-shake' : ''}`}
      >
        <img 
          src={doorImage} 
          alt="Mystical Sanskrit Door" 
          className="door-image"
        />

        {/* ========== 🛡️ PROTECTED FLOATING SYLLABLES CONTAINER ========== */}
        <div
          className="syllables-container"
          // ✅ Multi-touch protection for iPad
          onTouchStart={(e) => {
            activeTouchesRef.current = e.touches.length;
            if (e.touches.length > 1) {
              console.log('🚫 DOOR MULTI-TOUCH BLOCKED: Detected ' + e.touches.length + ' fingers');
              e.preventDefault();
            }
          }}
          onTouchEnd={() => {
            activeTouchesRef.current = 0;
          }}
        >
          {/* Floating Syllables - All should render with CONSISTENT positions */}
          {floatingSyllables.map((syllable) => (
            <div
              key={`syllable-${syllable.id}`}
              ref={el => syllableRefs.current[syllable.id] = el}
              className={`floating-syllable ${syllable.placed ? 'placed' : 'floating'} ${
                shouldHighlightSyllable(syllable) ? 'highlighted' : ''
              } ${
                isSyllableDisabled(syllable) ? 'disabled' : ''
              }`}
              style={{
                left: `${syllable.position.x}%`,
                top: `${syllable.position.y}%`,
                animationDelay: `${syllable.id * 0.5}s`,
                display: syllable.placed ? 'none' : 'block'
              }}
       onClick={() => handleSyllableClick(syllable.id)}

            >
              <div className="syllable-text">
                {syllable.text}
              </div>
            </div>
          ))}
        </div>

        {/* Placed Syllables Display */}
        <div className="placed-syllables-display">
          {floatingSyllables
            .filter(s => s.placed)
            .sort((a, b) => syllables.indexOf(a.text) - syllables.indexOf(b.text))
            .map((syllable, index) => (
              <div 
                key={`placed-${syllable.text}`}
                className={`placed-syllable placed-${index + 1}`}
                style={{ 
                  color: primaryColor,
                  textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80`
                }}
              >
                {syllable.text}
              </div>
            ))}
        </div>

        {/* Completed Word Display */}
        {allSyllablesPlaced && (
          <div className="completed-word-display">
            <div className="sanskrit-word" style={{ 
              color: primaryColor,
              textShadow: `0 0 15px ${primaryColor}, 0 0 30px ${primaryColor}80`
            }}>
              {completedWord}
            </div>
            <div className="word-meaning">The door recognizes your wisdom!</div>
          </div>
        )}

        {/* Play Game Button */}
{console.log('🔍 RENDER CHECK - showPlayButton:', showPlayButton)}
{showPlayButton && (
  <div className="play-game-button-container" style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    pointerEvents: 'auto'
  }}>
    <button 
      className="play-game-button"
      style={{
        padding: '20px 40px',
        fontSize: '24px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        color: '#fff',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)',
        animation: 'pulse 2s infinite'
      }}
   onClick={() => {
  console.log('🎮 START CHALLENGE CLICKED!');
  setShowPlayButton(false);
  playAudio('/audio/door-opening.mp3');
  setDoorState('opening');
  
  const timer = setTimeout(() => {
    setDoorState('dissolved');
    if (onDoorComplete) {
      onDoorComplete();
    }
  }, 2000);
  
  timersRef.current.push(timer);
}}
    >
      🎮 Start Challenge!
    </button>
  </div>
)}

{/* TEST BUTTON - ALWAYS VISIBLE FOR DEBUGGING */}
<div style={{
  position: 'absolute',
  top: '70%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10000,
  pointerEvents: 'auto',
  background: 'red',
  padding: '10px 20px',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '8px',
  cursor: 'pointer'
}} onClick={() => {
  console.log('🧪 TEST BUTTON CLICKED');
  console.log('🧪 Current showPlayButton state:', showPlayButton);
  console.log('🧪 Current allSyllablesPlaced:', allSyllablesPlaced);
  setShowPlayButton(true);
}}>
  🧪 DEBUG: Force Button Show
</div>

        {/* Success Sparkles */}
        {showSparkles && sparkleType === 'placement' && (
          <SparkleAnimation
            type="star"
            count={15}
            color={primaryColor}
            size={8}
            duration={800}
            fadeOut={true}
            area="full"
          />
        )}

        {/* Error Sparkles */}
        {showSparkles && sparkleType === 'error' && (
          <SparkleAnimation
            type="firework"
            count={8}
            color={errorColor}
            size={6}
            duration={1000}
            fadeOut={true}
            area="full"
          />
        )}

        {/* Door Completion Sparkles */}
        {showSparkles && sparkleType === 'completion' && (
          <SparkleAnimation
            type="firework"
            count={25}
            color={primaryColor}
            size={10}
            duration={2000}
            fadeOut={true}
            area="full"
          />
        )}

        {/* Door Opening Effect */}
        {doorState === 'opening' && (
          <div className="door-opening-effect">
            <SparkleAnimation
              type="glitter"
              count={50}
              color={secondaryColor}
              size={4}
              duration={2000}
              fadeOut={true}
              area="full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoorComponent;