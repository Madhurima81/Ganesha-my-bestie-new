// lib/components/cave/DoorComponent.jsx - IMPROVED VERSION
import React, { useState, useEffect, useRef } from 'react';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import './DoorComponentV1.css';

const getSyllablePosition = (index) => {
  const positions = [
    { x: 18, y: 38 },
    { x: 72, y: 52 },
    { x: 45, y: 28 },
    { x: 82, y: 35 },
    { x: 28, y: 68 },
    { x: 65, y: 72 },
    { x: 55, y: 45 },
    { x: 15, y: 58 }
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

  // ✅ IMPROVEMENT 1: Better initial state with reset detection
  const isFreshStart = !isCompleted && placedSyllables.length === 0 && !isResuming;
  
  const [floatingSyllables, setFloatingSyllables] = useState(() => {
    console.log('🚪 DoorComponent: Initializing', { syllables, placedSyllables, isResuming, isFreshStart });
    
    return syllables.map((syllable, index) => {
      const wasPlaced = placedSyllables.includes(syllable);
      
      return {
        id: index,
        text: syllable,
        placed: wasPlaced,
        floating: !wasPlaced,
        position: getSyllablePosition(index)
      };
    });
  });
  
  const [doorState, setDoorState] = useState(() => {
    if (isCompleted) return 'dissolved';
    return 'waiting';
  });
  
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparkleType, setSparkleType] = useState('gentle');
  const [allSyllablesPlaced, setAllSyllablesPlaced] = useState(isCompleted);
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [initialSetupDone, setInitialSetupDone] = useState(false);

  const doorRef = useRef(null);
  const syllableRefs = useRef({});
  const timersRef = useRef([]);
  const mountedRef = useRef(true);

  // ✅ IMPROVEMENT 2: Fresh start detection and reset
  useEffect(() => {
    if (isFreshStart && initialSetupDone) {
      console.log('🔄 DoorComponent: Fresh start detected, resetting all state');
      
      // Clear all timers first
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      
      // Reset all internal state
      setDoorState('waiting');
      setAllSyllablesPlaced(false);
      setShowSparkles(false);
      setErrorFeedback(false);
      setIsCompleting(false);
      setSparkleType('gentle');
      
      // Reset syllables to fresh state
      setFloatingSyllables(syllables.map((syllable, index) => ({
        id: index,
        text: syllable,
        placed: false,
        floating: true,
        position: getSyllablePosition(index)
      })));
      
      console.log('✅ DoorComponent: Fresh start reset complete');
    }
  }, [isFreshStart, initialSetupDone, syllables]);

  // ✅ IMPROVEMENT 3: Better resume logic with conflict prevention
  useEffect(() => {
    if (!isResuming || initialSetupDone || isFreshStart) {
      setInitialSetupDone(true);
      return;
    }
    
    console.log('🔄 DoorComponent: Resume logic triggered', { 
      isCompleted, 
      placedSyllables,
      currentSyllables: floatingSyllables.map(s => ({ text: s.text, placed: s.placed }))
    });
    
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
  }, [isResuming, placedSyllables, isFreshStart]);

  // ✅ IMPROVEMENT 4: Safe timer management with cleanup
  const safeSetTimeout = (callback, delay) => {
    if (!mountedRef.current) return;
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    
    timersRef.current.push(timer);
    return timer;
  };

  // ✅ IMPROVEMENT 5: Position animation with better timing
  useEffect(() => {
    if (initialSetupDone && !isResuming && !isCompleted && !isFreshStart) {
      safeSetTimeout(() => {
        if (!mountedRef.current) return;
        
        setFloatingSyllables(prev => prev.map((syllable, index) => {
          if (syllable.placed) return syllable;
          
          return {
            ...syllable,
            position: getSyllablePosition(index)
          };
        }));
      }, 300);
    }
  }, [initialSetupDone, isResuming, isCompleted, isFreshStart]);

  // ✅ IMPROVEMENT 6: Completion check with better state management
  useEffect(() => {
    if (isCompleting || isCompleted || isFreshStart) return;
    
    const allPlaced = floatingSyllables.every(s => s.placed);
    const hasValidSyllables = syllables.length > 0;
    
    if (allPlaced && !allSyllablesPlaced && hasValidSyllables) {
      console.log('🎯 DoorComponent: All syllables placed, triggering completion');
      
      setAllSyllablesPlaced(true);
      
      safeSetTimeout(() => {
        setIsCompleting(true);
        setSparkleType('completion');
        setShowSparkles(true);
        handleDoorComplete();
      }, 100);
    }
  }, [floatingSyllables, allSyllablesPlaced, isCompleted, syllables.length, isCompleting, isFreshStart]);

  const handleSyllableClick = (syllableId) => {
    if (isCompleted || isCompleting || isFreshStart) {
      console.log('🚫 Click blocked: Door state prevents interaction');
      return;
    }
    
    const syllable = floatingSyllables.find(s => s.id === syllableId);
    if (!syllable || syllable.placed) {
      console.log('🚫 Syllable not found or already placed:', syllableId);
      return;
    }

    console.log('🎯 Syllable clicked:', syllable.text, 'Expected:', expectedSyllable || syllables[currentStep]);

    if (educationalMode) {
      const expectedSyllableText = expectedSyllable || syllables[currentStep];
      const isCorrect = syllable.text === expectedSyllableText;
      
      if (!isCorrect) {
        console.log(`❌ Wrong! Expected "${expectedSyllableText}", got "${syllable.text}"`);
        
        setErrorFeedback(true);
        setSparkleType('error');
        setShowSparkles(true);
        
        safeSetTimeout(() => {
          setErrorFeedback(false);
          setShowSparkles(false);
        }, 1000);
        
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

    playAudio(`/audio/syllables/${syllable.text.toLowerCase()}.mp3`);

    setFloatingSyllables(prev => prev.map(s => 
      s.id === syllableId 
        ? { ...s, placed: true, floating: false }
        : s
    ));

    setSparkleType('placement');
    setShowSparkles(true);
    
    safeSetTimeout(() => {
      setShowSparkles(false);
    }, 800);

    if (onSyllablePlaced) {
      onSyllablePlaced(syllable.text);
    }
  };

  const handleDoorComplete = () => {
    if (isCompleted || !mountedRef.current) {
      console.log('🚪 Door completion blocked: already completed or unmounted');
      return;
    }
    
    console.log('🚪 Door complete - all syllables placed!');
    
    playAudio('/audio/door-opening.mp3');

    safeSetTimeout(() => {
      setDoorState('opening');
      
      safeSetTimeout(() => {
        setDoorState('dissolved');
        setShowSparkles(false);
        
        if (onDoorComplete) {
          onDoorComplete();
        }
      }, 1500);
    }, 1000);
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
    if (!educationalMode || isCompleted || isFreshStart) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text === expectedSyllableText;
  };

  const isSyllableDisabled = (syllable) => {
    if (!educationalMode || isCompleted || isFreshStart) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text !== expectedSyllableText && !syllable.placed;
  };

  // ✅ IMPROVEMENT 7: Better cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      console.log('🚪 DoorComponent: Cleaning up timers and references');
      mountedRef.current = false;
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      syllableRefs.current = {};
    };
  }, []);

  // ✅ IMPROVEMENT 8: Early return for dissolved state
  if (doorState === 'dissolved' || (isCompleted && !isCompleting)) {
    return null;
  }

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
      {educationalMode && !isFreshStart && (
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

        {/* Floating Syllables */}
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
        {allSyllablesPlaced && !isFreshStart && (
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

        {/* Sparkle Effects */}
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