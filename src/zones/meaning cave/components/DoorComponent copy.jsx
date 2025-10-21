// lib/components/cave/DoorComponent.jsx - COMPLETE FIXED VERSION
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
  errorColor = '#FF4444'
}) => {

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

  // Completion check
  useEffect(() => {
    const allPlaced = floatingSyllables.every(s => s.placed);
    
    if (allPlaced && !allSyllablesPlaced && !isCompleted && syllables.length > 0) {
      console.log('🎯 DoorComponent: All syllables placed, triggering completion');
      
      setAllSyllablesPlaced(true);
      
      const timer = setTimeout(() => {
        setIsCompleting(true);
        setSparkleType('completion');
        setShowSparkles(true);
        handleDoorComplete();
      }, 100);
      
      timersRef.current.push(timer);
    }
  }, [floatingSyllables, allSyllablesPlaced, isCompleted, syllables.length]);

  // Handle syllable clicks
  const handleSyllableClick = (syllableId) => {
    if (isCompleted) {
      console.log('🚫 Door already completed - ignoring syllable click');
      return;
    }
    
    const syllable = floatingSyllables.find(s => s.id === syllableId);
    if (!syllable || syllable.placed) {
      console.log('🚫 Syllable not found or already placed:', syllableId);
      return;
    }

    console.log('🎯 Syllable clicked:', syllable.text, 'Expected:', expectedSyllable || syllables[currentStep]);

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
    }, 800);
    timersRef.current.push(timer);

    // Notify parent component
    if (onSyllablePlaced) {
      onSyllablePlaced(syllable.text);
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
      }, 1500);
      
      timersRef.current.push(timer2);
    }, 1000);
    
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
    initialSetupDone
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