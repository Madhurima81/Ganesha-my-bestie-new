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
  // ✅ NEW: Audio and button states
const [wordAudioComplete, setWordAudioComplete] = useState(false);
const [showStartButton, setShowStartButton] = useState(false);
const audioRef = useRef(null);
const hasPlayedWordAudioRef = useRef(false);  // ✅ ADD THIS LINE
  
  // Track if initial setup is done to prevent useEffect conflicts
  const [initialSetupDone, setInitialSetupDone] = useState(false);

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

useEffect(() => {
  if (initialSetupDone) {
    console.log('🔄 Syllables changed - resetting audio states');
    setAllSyllablesPlaced(false);
    setWordAudioComplete(false);
    setShowStartButton(false);
    hasPlayedWordAudioRef.current = false;  // ✅ ADD THIS LINE
  }
}, [syllables, initialSetupDone]);

// ✅ FIXED: Completion check with DELAYED word audio
useEffect(() => {
  const allPlaced = floatingSyllables.every(s => s.placed);
  
if (allPlaced && !allSyllablesPlaced && !isCompleted && syllables.length > 0 && !hasPlayedWordAudioRef.current) {
      console.log('🎯 DoorComponent: All syllables placed');
    
    hasPlayedWordAudioRef.current = true;  // ✅ SET IMMEDIATELY FIRST
    setAllSyllablesPlaced(true);
    setSparkleType('completion');
    setShowSparkles(true);

    // ✅ WAIT 1.5 seconds before playing word - STORE the timeout
    const wordAudioTimeout = setTimeout(() => {
      // ✅ DOUBLE-CHECK guard inside setTimeout
      if (!hasPlayedWordAudioRef.current) {
        console.log('⚠️ Guard failed in setTimeout - skipping');
        return;
      }
      
      console.log('🎵 Now playing word audio after syllable finished');
      
      if (completedWord) {
      // ✅ SAFETY: Stop any existing audio before creating new one
      if (audioRef.current) {
        console.log('⚠️ Stopping existing audio before playing');
        audioRef.current.pause();
        audioRef.current = null;
      }

        const wordMap = {
          'Vakratunda': 'vakratunda',
          'Mahakaya': 'mahakaya',
          'Suryakoti': 'suryakoti',
          'Samaprabha': 'samaprabha',
          'Nirvighnam': 'nirvighnam',
          'Kurume Deva': 'kurumedeva'
        };
        const audioFile = wordMap[completedWord] || completedWord.toLowerCase();
        
        audioRef.current = new Audio(`/audio/words/${audioFile}.mp3`);
        
        audioRef.current.addEventListener('ended', () => {
          console.log('🎵 Word audio finished - showing Start Challenge button');
          setWordAudioComplete(true);
          setShowStartButton(true);
        });
        
        audioRef.current.addEventListener('error', () => {
          console.warn('⚠️ Word audio failed to load - showing button anyway');
          setWordAudioComplete(true);
          setShowStartButton(true);
        });
        
        audioRef.current.play().catch((error) => {
          console.warn('⚠️ Audio playback failed:', error);
          setWordAudioComplete(true);
          setShowStartButton(true);
        });
      } else {
        setWordAudioComplete(true);
        setShowStartButton(true);
      }
    }, 1500); // ✅ KEY FIX: Wait 1.5 seconds for syllable audio to finish completely
    
    // ✅ CRITICAL: Store timeout so it can be cleaned up on unmount
    timersRef.current.push(wordAudioTimeout);
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

  // ✅ NEW: Handle Start Challenge button click
const handleStartChallenge = () => {
  console.log('🚀 Start Challenge clicked - dissolving door');
  
  setShowStartButton(false);
  setIsCompleting(true);
  
  // Wait a moment then dissolve door
  const timer = setTimeout(() => {
    handleDoorComplete();
  }, 500);
  
  timersRef.current.push(timer);
};

 const handleSyllableClick = (syllableId) => {
  // ========== 🛡️ PROTECTION CHECKS ==========
  
  // Check if already processing (prevent double-clicks)
  if (isProcessingClickRef.current) {
    console.log('🚫 Already processing a syllable click');
    return;
  }
  
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

  // ✅ LOCK processing to prevent next click
  isProcessingClickRef.current = true;

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
        isProcessingClickRef.current = false; // ✅ Unlock after error
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

  // ✅ NEW: Play syllable audio using parent's callback AND wait before unlocking
  if (onSyllableAudio) {
    // Call parent's audio function
    onSyllableAudio(syllable.text.toLowerCase());
    
    // Estimate audio duration and wait before unlocking
    // Most syllable audios are ~0.5-1 second
    const audioDelay = 500; // 1 second for audio to play
    const bufferDelay = 200;  // Additional 500ms buffer
    
    setTimeout(() => {
      setShowSparkles(false);
      isProcessingClickRef.current = false; // ✅ Unlock next syllable
      console.log('🔓 Next syllable unlocked after audio delay');
    }, audioDelay + bufferDelay);
  } else {
    // No audio callback provided - unlock after sparkles
    setTimeout(() => {
      setShowSparkles(false);
      isProcessingClickRef.current = false;
    }, 800);
  }
};

  const handleDoorComplete = () => {
    if (isCompleted) {
      console.log('🚪 Door already completed - skipping completion animation');
      return;
    }
    
    console.log('🚪 Door complete - all syllables placed!');
    
    playAudio('/audio/door-opening.mp3');

    const timer1 = setTimeout(() => {
      setDoorState('opening');
      
      const timer2 = setTimeout(() => {
        setDoorState('dissolved');
        setShowSparkles(false);
        
        if (onDoorComplete) {
          onDoorComplete();
        }
      }, 1000);
      
      timersRef.current.push(timer2);
    }, 800);
    
    timersRef.current.push(timer1);
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
    // ✅ Cleanup audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);

  if (doorState === 'dissolved' || isCompleted) {
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

        {/* ✅ SIMPLIFIED: Just show button without word */}
{allSyllablesPlaced && showStartButton && doorState !== 'dissolved' && (
  <div className="start-challenge-container" style={{
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 100
  }}>
    <button
      onClick={handleStartChallenge}
      className="start-challenge-button"
      style={{
        padding: '10px 25px',  // ✅ Thinner - reduced from 20px 40px
        fontSize: '22px',       // ✅ Slightly smaller text
        fontWeight: 'bold',
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        border: `4px solid ${primaryColor}`,
        borderRadius: '10px',
        color: '#2C1810',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        animation: 'fadeInBounce 0.6s ease-out'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
      }}
    >
      🚀 Start Challenge!
    </button>
  </div>
)}

{/* ✅ NEW: Completed Word Display - shows while audio plays 
{allSyllablesPlaced && !showStartButton && (
  <div className="completed-word-display">
    <div className="sanskrit-word" style={{ 
      color: primaryColor,
      textShadow: `0 0 15px ${primaryColor}, 0 0 30px ${primaryColor}80`
    }}>
      {completedWord}
    </div>
    <div className="word-meaning">🎵 Listen to the word...</div>
  </div>
)}

{/* ✅ NEW: START CHALLENGE BUTTON - appears after audio completes 
{showStartButton && (
  <div className="start-challenge-container" style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 100,
    animation: 'bounceIn 0.6s ease-out'
  }}>
    <div className="completed-word-display" style={{ marginBottom: '20px' }}>
      <div className="sanskrit-word" style={{ 
        color: primaryColor,
        textShadow: `0 0 15px ${primaryColor}, 0 0 30px ${primaryColor}80`,
        fontSize: '48px',
        marginBottom: '10px'
      }}>
        {completedWord}
      </div>
    </div>
    
    <button
      onClick={handleStartChallenge}
      className="start-challenge-button"
      style={{
        padding: '20px 40px',
        fontSize: '24px',
        fontWeight: 'bold',
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        border: `4px solid ${primaryColor}`,
        borderRadius: '20px',
        color: '#2C1810',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        animation: 'pulse 1.5s infinite'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
      }}
    >
      🚀 Start Challenge!
    </button>
  </div>
)}*/}

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

      {/* ✅ NEW: Add animations for button */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 30px rgba(255, 215, 0, 0.6);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .start-challenge-button:active {
          transform: scale(0.95) !important;
        }
      `}</style>
    </div>
  );
    
  
};

export default DoorComponent;