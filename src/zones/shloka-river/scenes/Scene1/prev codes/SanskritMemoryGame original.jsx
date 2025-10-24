// zones/shloka-river/scenes/Scene1/components/SanskritMemoryGame.jsx
// Sanskrit memory game - listen to syllables, repeat by clicking elephants

import React, { useState, useEffect, useRef } from 'react';

// Sanskrit syllable sequences for each phase and round
const SYLLABLE_SEQUENCES = {
  vakratunda: {
    1: ['va', 'kra'],
    2: ['va', 'kra', 'tun'],
    3: ['va', 'kra', 'tun', 'da']
  },
  mahakaya: {
    1: ['ma', 'ha'],
    2: ['ma', 'ha', 'ka'], 
    3: ['ma', 'ha', 'ka', 'ya']
  }
};

// Element data for display and interaction
const ELEMENT_DATA = {
  vakratunda: {
    singers: ['lotus-va', 'lotus-kra', 'lotus-tun', 'lotus-da'],
    clickers: ['baby-elephant-va', 'baby-elephant-kra', 'baby-elephant-tun', 'baby-elephant-da'],
    positions: {
      singers: [
        { left: '25%', top: '55%' },  // Va lotus
        { left: '40%', top: '60%' },  // Kra lotus  
        { left: '55%', top: '55%' },  // Tun lotus
        { left: '70%', top: '60%' }   // Da lotus
      ],
      clickers: [
        { left: '15%', top: '45%' },  // Va baby elephant
        { left: '30%', top: '40%' },  // Kra baby elephant
        { left: '45%', top: '45%' },  // Tun baby elephant  
        { left: '60%', top: '40%' }   // Da baby elephant
      ]
    }
  },
  mahakaya: {
    singers: ['stone-ma', 'stone-ha', 'stone-ka', 'stone-ya'],
    clickers: ['adult-elephant-ma', 'adult-elephant-ha', 'adult-elephant-ka', 'adult-elephant-ya'],
    positions: {
      singers: [
        { left: '25%', top: '55%' },  // Ma stone
        { left: '40%', top: '60%' },  // Ha stone
        { left: '55%', top: '55%' },  // Ka stone
        { left: '70%', top: '60%' }   // Ya stone
      ],
      clickers: [
        { left: '15%', top: '45%' },  // Ma adult elephant
        { left: '30%', top: '40%' },  // Ha adult elephant
        { left: '45%', top: '45%' },  // Ka adult elephant
        { left: '60%', top: '40%' }   // Ya adult elephant
      ]
    }
  }
};

const SanskritMemoryGame = ({
  isActive = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Reload support props
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentPhase = 'vakratunda',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialSequenceItemsShown = 0,
  phaseJustCompleted = false,
  lastCompletedPhase = null,

  // Assets - passed from parent component
  getLotusImage,
  getStoneImage, 
  getBabyElephantImage,
  getAdultElephantImage,
  
  // Callback to save state for reload support
  onSaveGameState
}) => {
  console.log('SanskritMemoryGame render:', { 
    isActive, 
    isReload,
    initialCurrentPhase,
    initialCurrentRound,
    initialPlayerInput
  });

  // Game state
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'playing', 'listening', 'success', 'error', 'phase_complete'
  const [currentPhase, setCurrentPhase] = useState('vakratunda'); // 'vakratunda' | 'mahakaya'
  const [currentRound, setCurrentRound] = useState(1); // 1, 2, 3
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null); // Which syllable is currently "singing"
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);

  // Refs for cleanup
  const timeoutsRef = useRef([]);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Web Speech API for syllable pronunciation
  const playSyllableAudio = (syllable) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      console.log(`Playing syllable: ${syllable}`);
      speechSynthesis.speak(utterance);
    }
  };

  // Play complete word
  const playCompleteWord = (word) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.6;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Get sequence for current phase and round
  const getSequenceForRound = (phase, round) => {
    return SYLLABLE_SEQUENCES[phase][round] || [];
  };

  // Initialize game when activated or on reload
  useEffect(() => {
    if (!isActive) return;

    if (isReload && initialCurrentSequence.length > 0) {
      // Reload case: restore previous state
      console.log('RELOAD: Restoring Sanskrit game state:', {
        initialGamePhase,
        initialCurrentPhase,
        initialCurrentRound,
        initialPlayerInput,
        initialCurrentSequence,
        phaseJustCompleted
      });
      
      setCurrentPhase(initialCurrentPhase);
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setSequenceItemsShown(initialCurrentSequence.length);
      setCanPlayerClick(initialGamePhase === 'listening');
      
      // Auto-continue if phase was just completed
      if (phaseJustCompleted && lastCompletedPhase) {
        console.log('POST-PHASE COMPLETION: Auto-continuing');
        safeSetTimeout(() => {
          handlePhaseComplete(lastCompletedPhase);
        }, 1000);
      }
      
    } else {
      // New game: start fresh
      console.log('NEW GAME: Starting Vakratunda phase');
      const sequence = getSequenceForRound('vakratunda', 1);
      setCurrentPhase('vakratunda');
      setCurrentRound(1);
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setGamePhase('waiting');
      setCanPlayerClick(false);
      setSequenceItemsShown(0);
      clearAllTimeouts();
    }
  }, [isActive, isReload]);

  // Save state for reload support
  const saveGameState = (additionalState = {}) => {
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase,
        currentPhase,
        currentRound,
        playerInput,
        currentSequence,
        sequenceItemsShown,
        ...additionalState
      });
    }
  };

  // Play the syllable sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0) return;

    console.log('Playing syllable sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    setSingingSyllable(null);
    
    // Save state before playing
    saveGameState({ gamePhase: 'playing' });
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        console.log(`Playing syllable ${index + 1}/${currentSequence.length}: ${syllable}`);
        
        // Show this sequence item
        setSequenceItemsShown(index + 1);
        
        // Visual and audio feedback
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        // Clear singing visual
        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);
        
        // After last syllable
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            saveGameState({ gamePhase: 'listening' });
            console.log('Sequence complete, player can now click elephants');
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Handle elephant click
  const handleElephantClick = (syllableIndex) => {
    if (!canPlayerClick || isSequencePlaying) {
      console.log('Elephant click ignored - not ready');
      return;
    }

    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;

    console.log(`Player clicked elephant for syllable: ${clickedSyllable}`);
    
    // Play syllable audio for feedback
    playSyllableAudio(clickedSyllable);
    
    const newPlayerInput = [...playerInput, clickedSyllable];
    const currentIndex = newPlayerInput.length - 1;
    
    // Check if correct
    if (newPlayerInput[currentIndex] === currentSequence[currentIndex]) {
      console.log(`Correct! Position ${currentIndex + 1}/${currentSequence.length}`);
      setPlayerInput(newPlayerInput);
      
      // Save progress
      saveGameState({
        gamePhase: 'listening',
        playerInput: newPlayerInput,
        currentSequence: currentSequence,
        sequenceItemsShown: sequenceItemsShown
      });
      
      // Check if sequence complete
      if (newPlayerInput.length === currentSequence.length) {
        handleSequenceSuccess();
      }
    } else {
      console.log(`Wrong! Expected: ${currentSequence[currentIndex]}, Got: ${clickedSyllable}`);
      handleSequenceError();
    }
  };

  // Handle correct sequence completion
  const handleSequenceSuccess = () => {
    console.log(`Round ${currentRound} of ${currentPhase} completed successfully!`);
    setGamePhase('success');
    setCanPlayerClick(false);
    
    // Save post-sequence state
    saveGameState({
      gamePhase: 'success',
      playerInput: playerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown
    });
    
    safeSetTimeout(() => {
      if (currentRound < 3) {
        // Next round in same phase
        console.log(`Starting round ${currentRound + 1} of ${currentPhase}`);
        const nextRound = currentRound + 1;
        const nextSequence = getSequenceForRound(currentPhase, nextRound);
        
        setCurrentRound(nextRound);
        setCurrentSequence(nextSequence);
        setPlayerInput([]);
        setGamePhase('waiting');
        setCanPlayerClick(false);
        setSequenceItemsShown(0);
        
        saveGameState({
          currentRound: nextRound,
          currentSequence: nextSequence,
          gamePhase: 'waiting',
          playerInput: []
        });
        
      } else {
        // Phase complete
        handlePhaseComplete(currentPhase);
      }
    }, 1500);
  };

  // Handle phase completion
  const handlePhaseComplete = (completedPhase) => {
    console.log(`Phase ${completedPhase} completed!`);
    setGamePhase('phase_complete');
    
    // Play complete word
    playCompleteWord(completedPhase);
    
    // Save phase completion state
    saveGameState({
      gamePhase: 'phase_complete',
      phaseJustCompleted: true,
      lastCompletedPhase: completedPhase
    });
    
    // Notify parent
    if (onPhaseComplete) {
      onPhaseComplete(completedPhase);
    }
    
    safeSetTimeout(() => {
      if (completedPhase === 'vakratunda') {
        // Start Mahakaya phase
        console.log('Starting Mahakaya phase');
        const nextSequence = getSequenceForRound('mahakaya', 1);
        
        setCurrentPhase('mahakaya');
        setCurrentRound(1);
        setCurrentSequence(nextSequence);
        setPlayerInput([]);
        setGamePhase('waiting');
        setCanPlayerClick(false);
        setSequenceItemsShown(0);
        
        saveGameState({
          currentPhase: 'mahakaya',
          currentRound: 1,
          currentSequence: nextSequence,
          gamePhase: 'waiting',
          playerInput: [],
          phaseJustCompleted: false
        });
        
      } else {
        // Game complete
        console.log('Game complete!');
        if (onGameComplete) {
          onGameComplete();
        }
      }
    }, 3000);
  };

  // Handle wrong input
  const handleSequenceError = () => {
    setGamePhase('error');
    setCanPlayerClick(false);
    setPlayerInput([]);
    
    safeSetTimeout(() => {
      console.log('Replaying sequence after error');
      setSequenceItemsShown(0);
      handlePlaySequence();
    }, 2000);
  };

  // Get syllable index from syllable name
  const getSyllableIndex = (syllable) => {
    return currentSequence.indexOf(syllable);
  };

  // Check if element should be highlighted during singing
  const isSinging = (syllable) => {
    return singingSyllable === syllable;
  };

  // Check if element is clickable
  const isClickable = (syllableIndex) => {
    return canPlayerClick && syllableIndex < currentSequence.length;
  };

  // Check if player got this syllable correct
  const isCorrect = (syllableIndex) => {
    return playerInput[syllableIndex] === currentSequence[syllableIndex];
  };

  // Check if player got this syllable wrong
  const isWrong = (syllableIndex) => {
    return playerInput.length > syllableIndex && playerInput[syllableIndex] !== currentSequence[syllableIndex];
  };

  if (!isActive) {
    return null;
  }

  const phaseData = ELEMENT_DATA[currentPhase];

  return (
    <div className="sanskrit-memory-game" style={containerStyle}>
      
      {/* Game Status */}
      <div style={statusStyle}>
        {gamePhase === 'waiting' && `Ready to learn ${currentPhase.toUpperCase()} - Round ${currentRound}`}
        {gamePhase === 'playing' && 'Listen to the sacred sounds...'}
        {gamePhase === 'listening' && `Repeat the sequence! (${playerInput.length}/${currentSequence.length})`}
        {gamePhase === 'success' && 'Perfect! Moving to next round...'}
        {gamePhase === 'phase_complete' && `${currentPhase.toUpperCase()} learned! Sacred word mastered!`}
        {gamePhase === 'error' && 'Try again, listen more carefully...'}
      </div>
      
      {/* Play Sequence Button */}
      {(gamePhase === 'waiting' || gamePhase === 'error') && (
        <button 
          style={playButtonStyle}
          onClick={handlePlaySequence}
          disabled={isSequencePlaying}
        >
          Play Sacred Sequence
        </button>
      )}
      
      {/* Sequence Display - Progressive revelation */}
      {sequenceItemsShown > 0 && (
        <div style={sequenceDisplayStyle}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
            Sacred Sequence:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentSequence.slice(0, sequenceItemsShown).map((syllable, index) => (
              <div 
                key={index}
                style={{
                  ...sequenceItemStyle,
                  backgroundColor: index < playerInput.length 
                    ? (isCorrect(index) ? '#4caf50' : '#f44336')
                    : '#e0e0e0'
                }}
              >
                {syllable.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Singing Elements (Lotus/Stones) */}
      {currentSequence.map((syllable, index) => {
        const position = phaseData.positions.singers[index];
        if (!position) return null;
        
        const getImage = currentPhase === 'vakratunda' ? getLotusImage : getStoneImage;
        
        return (
          <div
            key={`singer-${syllable}-${index}`}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: '80px',
              height: '80px',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease',
              filter: isSinging(syllable) ? 'brightness(1.5) drop-shadow(0 0 20px #ffd700)' : 'brightness(1)',
              zIndex: 10
            }}
          >
            {getImage && (
              <img
                src={getImage(index)}
                alt={`${currentPhase === 'vakratunda' ? 'Lotus' : 'Stone'} ${syllable}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
            
            {/* Syllable label */}
            <div style={{
              position: 'absolute',
              bottom: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {syllable.toUpperCase()}
            </div>
            
            {/* Singing indicator */}
            {isSinging(syllable) && (
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 215, 0, 0.9)',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 'bold',
                animation: 'singPulse 1s infinite'
              }}>
              </div>
            )}
          </div>
        );
      })}

      {/* Clickable Elements (Elephants) */}
      {currentSequence.map((syllable, index) => {
        const position = phaseData.positions.clickers[index];
        if (!position) return null;
        
        const getImage = currentPhase === 'vakratunda' ? getBabyElephantImage : getAdultElephantImage;
        const clickable = isClickable(index);
        
        return (
          <button
            key={`clicker-${syllable}-${index}`}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: '90px',
              height: '90px',
              transform: 'translate(-50%, -50%)',
              border: clickable ? '3px solid #ffd700' : '2px solid #ccc',
              borderRadius: '15px',
              background: 'rgba(255, 255, 255, 0.9)',
              cursor: clickable ? 'pointer' : 'default',
              opacity: clickable ? 1 : 0.7,
              transition: 'all 0.3s ease',
              boxShadow: clickable ? '0 0 15px #ffd700' : '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 20
            }}
            onClick={() => handleElephantClick(index)}
            disabled={!clickable}
          >
            {getImage && (
              <img
                src={getImage(index)}
                alt={`${currentPhase === 'vakratunda' ? 'Baby' : 'Adult'} Elephant ${syllable}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
            
            {/* Elephant label */}
            <div style={{
              position: 'absolute',
              bottom: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {syllable.toUpperCase()}
            </div>
            
            {/* Click indicator */}
            {clickable && (
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(33, 150, 243, 0.9)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                animation: 'clickPulse 2s infinite'
              }}>
                Click!
              </div>
            )}
          </button>
        );
      })}
      
      {/* Player Progress Indicator */}
      {canPlayerClick && (
        <div style={progressIndicatorStyle}>
          Progress: {playerInput.length} / {currentSequence.length}
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes clickPulse {
          0%, 100% { 
            opacity: 0.7;
            transform: translateX(-50%) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateX(-50%) scale(1.1);
          }
        }
        
        @keyframes singPulse {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
          }
          50% { 
            transform: translateX(-50%) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

// Inline styles
const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

const statusStyle = {
  position: 'absolute',
  top: '120px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#FFD700',
  background: 'rgba(139, 69, 19, 0.9)',
  padding: '8px 16px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  minWidth: '250px'
};

const playButtonStyle = {
  position: 'absolute',
  top: '160px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 248, 220, 0.95)',
  color: '#8B4513',
  border: '2px solid #D2B48C',
  padding: '12px 25px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  zIndex: 30,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
};

const sequenceDisplayStyle = {
  position: 'absolute',
  top: '200px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '15px 20px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const sequenceItemStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'white',
  transition: 'all 0.3s ease'
};

const progressIndicatorStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(76, 175, 80, 0.9)',
  color: 'white',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  zIndex: 30
};

export default SanskritMemoryGame;