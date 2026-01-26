// lib/components/cave/DoorComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import './DoorComponentV1.css';

const DoorComponent = ({
  syllables = ['Va', 'kra'],
  completedWord = 'Vakratunda',
  onDoorComplete,
  onSyllablePlaced,
  sceneTheme = 'cave-of-secrets',
  doorImage,
  className = '',
  // ✅ Educational props
  educationalMode = true,          // Enable sequential learning
  showTargetWord = true,           // Show word above door
  currentStep = 0,                 // Which syllable is expected next
  expectedSyllable = null,         // Current expected syllable
  onCorrectClick = null,           // Callback for correct clicks
  onWrongClick = null,             // Callback for wrong clicks
  // ✅ Customization props
  targetWordTitle = '',            // Custom title (e.g., " VAKRATUNDA ")
  successMessage = "Perfect!",     // Custom success message
  errorMessage = "Try the highlighted syllable!",
  // ✅ Visual customization
  primaryColor = '#FFD700',        // Golden color for cave theme
  secondaryColor = '#FF8C42',      // Orange accent
  errorColor = '#FF4444'           // Red for errors
}) => {
  const [floatingSyllables, setFloatingSyllables] = useState(
    syllables.map((syllable, index) => ({
      id: index,
      text: syllable,
      placed: false,
      floating: true,
      position: { x: 30 + (index * 40), y: 20 + (index * 15) }
    }))
  );
  
  const [doorState, setDoorState] = useState('waiting');
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparkleType, setSparkleType] = useState('gentle');
  const [allSyllablesPlaced, setAllSyllablesPlaced] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const doorRef = useRef(null);
  const syllableRefs = useRef({});
  const timersRef = useRef([]); // ✅ NEW: Timer cleanup reference

  // Floating animation positions
  const floatingPositions = [
    { x: 25, y: 40 }, { x: 75, y: 40 },
    { x: 40, y: 45 }, { x: 60, y: 40 }
  ];

  // Initialize floating syllables
  useEffect(() => {
    const timer = setTimeout(() => {
      setFloatingSyllables(prev => prev.map((syllable, index) => ({
        ...syllable,
        position: floatingPositions[index % floatingPositions.length]
      })));
    }, 500);
    
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, []);

  // ✅ FIXED: Check if all syllables are placed (batched state updates)
  useEffect(() => {
    const allPlaced = floatingSyllables.every(s => s.placed);
    if (allPlaced && !allSyllablesPlaced) {
      // ✅ Batch completion states together
      setAllSyllablesPlaced(true);
      
      // ✅ Small delay to batch updates and prevent flicker
      const timer = setTimeout(() => {
        setIsCompleting(true);
        setSparkleType('completion');
        setShowSparkles(true);
        handleDoorComplete();
      }, 100);
      
      timersRef.current.push(timer);
    }
  }, [floatingSyllables, allSyllablesPlaced]);

  const handleSyllableClick = (syllableId) => {
    const syllable = floatingSyllables.find(s => s.id === syllableId);
    if (!syllable || syllable.placed) return;

    // ✅ Educational mode logic
    if (educationalMode) {
      const expectedSyllableText = expectedSyllable || syllables[currentStep];
      const isCorrect = syllable.text === expectedSyllableText;
      
      if (!isCorrect) {
        // ❌ WRONG syllable clicked
        console.log(`❌ Wrong! Expected "${expectedSyllableText}", got "${syllable.text}"`);
        
        // Show error feedback
        setErrorFeedback(true);
        setSparkleType('error');
        setShowSparkles(true);
        
        // Clear error feedback
        const timer = setTimeout(() => {
          setErrorFeedback(false);
          setShowSparkles(false);
        }, 1000);
        timersRef.current.push(timer);
        
        // Notify parent of wrong click
        if (onWrongClick) {
          onWrongClick(syllable.text, expectedSyllableText);
        }
        
        return; // Don't place the syllable
      }
      
      // ✅ CORRECT syllable clicked
      console.log(`✅ Correct! Expected "${expectedSyllableText}", got "${syllable.text}"`);
      
      // Notify parent of correct click
      if (onCorrectClick) {
        onCorrectClick(syllable.text, currentStep);
      }
    }

    // Play pronunciation sound
    playAudio(`/audio/syllables/${syllable.text.toLowerCase()}.mp3`);

    // Place syllable on door
    setFloatingSyllables(prev => prev.map(s => 
      s.id === syllableId 
        ? { ...s, placed: true, floating: false }
        : s
    ));

    // Show placement sparkles
    setSparkleType('placement');
    setShowSparkles(true);
    
    // ✅ FIXED: Use timersRef for cleanup
    const timer = setTimeout(() => {
      setShowSparkles(false);
    }, 800);
    timersRef.current.push(timer);

    // Notify parent component
    if (onSyllablePlaced) {
      onSyllablePlaced(syllable.text);
    }
  };

  // ✅ FIXED: Simplified - no immediate state updates
  const handleDoorComplete = () => {
    console.log('🚪 Door complete - all syllables placed!');
    
    // ✅ State updates moved to useEffect - no immediate updates here
    
    // Play completion sound
    playAudio('/audio/door-opening.mp3');

    // Start door opening animation
    const timer1 = setTimeout(() => {
      setDoorState('opening');
      
      // Dissolve door after opening animation
      const timer2 = setTimeout(() => {
        setDoorState('dissolved');
        setShowSparkles(false);
        
        // Notify parent that door is complete
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

  // ✅ Check if syllable should be highlighted (educational mode)
  const shouldHighlightSyllable = (syllable) => {
    if (!educationalMode) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text === expectedSyllableText;
  };

  // ✅ Check if syllable should be disabled (educational mode)
  const isSyllableDisabled = (syllable) => {
    if (!educationalMode) return false;
    const expectedSyllableText = expectedSyllable || syllables[currentStep];
    return syllable.text !== expectedSyllableText && !syllable.placed;
  };

  // ✅ NEW: Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Don't render if door is dissolved
  if (doorState === 'dissolved') {
    return null;
  }

  return (
    <div className={`door-component ${sceneTheme} ${className}`}>
      {/* ✅ Target Word Display */}
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

      {/* ✅ Progress Indicators */}
      {educationalMode && (
        <div className="door-progress">
          {syllables.map((syllable, index) => (
            <div 
              key={index}
              className={`progress-syllable ${
                index < currentStep ? 'completed' : 
                index === currentStep ? 'current' : 'pending'
              }`}
              style={{
                '--primary-color': primaryColor,
                '--secondary-color': secondaryColor,
                '--completed-color': '#00ff88'
              }}
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
        {/* Door Image */}
        <img 
          src={doorImage} 
          alt="Mystical Sanskrit Door" 
          className="door-image"
        />

        {/* Floating Syllables */}
        {floatingSyllables.map((syllable) => (
          <div
            key={syllable.id}
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
              '--primary-color': primaryColor,
              '--secondary-color': secondaryColor,
              '--error-color': errorColor
            }}
            onClick={() => handleSyllableClick(syllable.id)}
          >
            <div className="syllable-text">
              {syllable.text}
            </div>
            
            {/* Individual syllable sparkles */}
            {showSparkles && sparkleType === 'placement' && (
              <SparkleAnimation
                type="magic"
                count={8}
                color={primaryColor}
                size={6}
                duration={800}
                fadeOut={true}
                area="full"
              />
            )}
          </div>
        ))}

        {/* Placed Syllables Display */}
        <div className="placed-syllables-display">
          {floatingSyllables.filter(s => s.placed).map((syllable, index) => (
            <div 
              key={`placed-${syllable.id}`}
              className={`placed-syllable placed-${index + 1}`}
              style={{ 
                color: primaryColor,
                textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80, 0 0 30px ${primaryColor}60`
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