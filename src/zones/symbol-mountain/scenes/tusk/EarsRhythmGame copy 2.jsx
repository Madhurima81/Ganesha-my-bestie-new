// zones/symbol-mountain/scenes/symbol/components/EarsRhythmGame.jsx
// 🎵 INLINE rhythm listening game component - WITH RANDOM SEQUENCES

import React, { useState, useEffect, useRef } from 'react';

// Import your actual musical instrument images
import musicalTabla from './assets/images/musical-tabla-colored.png';
import musicalFlute from './assets/images/musical-flute-colored.png';
import musicalBells from './assets/images/musical-bells-colored.png';
import musicalCymbals from './assets/images/musical-cymbals-colored.png';

// Musical instruments data
const musicalInstruments = {
  tabla: { 
    image: musicalTabla, 
    emoji: '🥁', 
    name: 'Tabla',
    frequency: 220,
    color: '#8d6e63'
  },
  flute: { 
    image: musicalFlute, 
    emoji: '🎵', 
    name: 'Flute',
    frequency: 660,
    color: '#8bc34a'
  },
  bells: { 
    image: musicalBells, 
    emoji: '🔔', 
    name: 'Bells',
    frequency: 440,
    color: '#ffd700'
  },
  cymbals: { 
    image: musicalCymbals, 
    emoji: '🎶', 
    name: 'Cymbals',
    frequency: 880,
    color: '#42a5f5'
  }
};

// ✅ NEW: Generate random rhythm sequences
const generateRandomSequence = (discoveredInstruments, noteId) => {
  const availableInstruments = Object.keys(discoveredInstruments);
  
  // Progressive difficulty
  const sequenceConfigs = {
    note1: { length: 2, useInstruments: 2 }, // Easy: 2 beats, 2 different instruments
    note2: { length: 3, useInstruments: 3 }, // Medium: 3 beats, 3 different instruments  
    note3: { length: 4, useInstruments: 4 }  // Hard: 4 beats, all instruments
  };
  
  const config = sequenceConfigs[noteId] || { length: 2, useInstruments: 2 };
  const instrumentPool = availableInstruments.slice(0, Math.min(config.useInstruments, availableInstruments.length));
  
  const sequence = [];
  for (let i = 0; i < config.length; i++) {
    const randomInstrument = instrumentPool[Math.floor(Math.random() * instrumentPool.length)];
    sequence.push(randomInstrument);
  }
  
  console.log(`🎲 Generated random sequence for ${noteId}:`, sequence);
  return sequence;
};

const EarsRhythmGame = ({ 
  isActive = false,
  currentNote = 'note1',
  discoveredInstruments = {},
  onSequenceComplete,
  onGameComplete,
  onClose,
  profileName = 'little explorer',
    isReload = false,                          // Flag indicating reload
  initialGamePhase = 'waiting',              // Restored game phase
  initialPlayerInput = [],                   // Restored player input
  initialCurrentSequence = [],               // ← ADD: Restored sequence
  initialSequenceItemsShown = 0,             // ← ADD: Restored sequence progress
  sequenceJustCompleted = false,             // Post-sequence reload flag
  lastCompletedNote = null                   // Which note was just completed
}) => {
console.log('🎵 EarsRhythmGame inline render:', { 
  isActive, 
  currentNote,
  isReload,                    // ← ADD: Check if reload prop is passed
  initialGamePhase,            // ← ADD: Check if initial state is passed
  initialPlayerInput           // ← ADD: Check if initial input is passed
});  

  // Game states
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'playing', 'listening', 'success', 'error'
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [playingInstrument, setPlayingInstrument] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);

  // Audio context ref
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Clean up timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Safe timeout
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Initialize audio context
  useEffect(() => {
    if (isActive && !audioContextRef.current) {
      const initAudio = async () => {
        try {
          // Create audio context
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          
          console.log('🔊 Audio context created, state:', audioContextRef.current.state);
          
          // Don't try to resume immediately - let user interaction handle it
        } catch (error) {
          console.warn('🔇 Audio context failed:', error);
          audioContextRef.current = null;
        }
      };
      
      initAudio();
    }
    
    // Cleanup when component becomes inactive
    if (!isActive && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
        console.log('🔊 Audio context closed on inactive');
      } catch (error) {
        console.warn('🔇 Error closing audio context on inactive:', error);
      }
      audioContextRef.current = null;
    }
  }, [isActive]);
// ✅ ENHANCED: Handle both new games and reloads (Eyes game pattern)
useEffect(() => {
  console.log('🔍 USEEFFECT DEBUG:', {
    isActive,
    currentNote,
    discoveredInstruments: Object.keys(discoveredInstruments),
    isReload,                           // ← Check this value
    'initialCurrentSequence.length': initialCurrentSequence.length,
    initialCurrentSequence,             // ← Check this array
    initialPlayerInput,
    'condition1': isActive && currentNote && Object.keys(discoveredInstruments).length > 0,
    'condition2': isReload && initialCurrentSequence.length > 0
  })
  
  if (isActive && currentNote && Object.keys(discoveredInstruments).length > 0) {
    
    if (isReload && initialCurrentSequence.length > 0) {
      // ✅ RELOAD CASE: Restore progress (like Eyes game)
      console.log('🔄 EARS RELOAD: Restoring rhythm game progress:', {
        initialGamePhase,
        initialPlayerInput,
        initialCurrentSequence,
        initialSequenceItemsShown,
        sequenceJustCompleted,
        lastCompletedNote
      });
      
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
setSequenceItemsShown(initialCurrentSequence.length); // Show full sequence during reload
setCanPlayerClick(initialGamePhase === 'listening');
      
      // ✅ POST-SEQUENCE RELOAD: Auto-continue if sequence was just completed
      if (sequenceJustCompleted && lastCompletedNote) {
        console.log('🔄 POST-SEQUENCE: Auto-continuing from completed sequence');
        setTimeout(() => {
          handleSequenceSuccess(); // Trigger the completion flow
        }, 1000);
      }
      
    } else {
      // ✅ NEW GAME: Original logic (like Eyes game)
      console.log('🎵 NEW EARS GAME: Generating fresh sequence');
      const sequence = generateRandomSequence(discoveredInstruments, currentNote);
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setGamePhase('waiting');
      setCanPlayerClick(false);
      setSequenceItemsShown(0);
      clearAllTimeouts();
    }
  }
}, [isActive, currentNote, discoveredInstruments, isReload]); // ← Added isReload dependency

// ✅ UPDATED: Set up random sequence when note changes

/*useEffect(() => {
  console.log('🔍 SEQUENCE SETUP DEBUG:', {
    isActive,
    currentNote,
    discoveredInstruments: Object.keys(discoveredInstruments),
    isReload,                    
    initialGamePhase,            
    initialPlayerInput           
  });
  
  if (isActive && currentNote && Object.keys(discoveredInstruments).length > 0) {
    if (isReload && initialPlayerInput && initialPlayerInput.length > 0) {
      console.log('🔄 RELOAD DETECTED: Restoring game state', {
        initialGamePhase,
        initialPlayerInput
      });
      
      // ✅ RESTORE: Generate sequence and restore state
      const sequence = generateRandomSequence(discoveredInstruments, currentNote);
      setCurrentSequence(sequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setCanPlayerClick(initialGamePhase === 'listening');
setSequenceItemsShown(initialSequenceItemsShown);
      
      console.log(`🔄 RESTORED: Game state - Phase: ${initialGamePhase}, Input: ${initialPlayerInput.length}/${sequence.length}`);
      
    } else {
      console.log('🎵 NEW GAME: Generating fresh sequence');
      const sequence = generateRandomSequence(discoveredInstruments, currentNote);
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setGamePhase('waiting');
      setCanPlayerClick(false);
      setSequenceItemsShown(0);
      clearAllTimeouts();
      
      console.log(`🎵 Set up random sequence for ${currentNote}:`, sequence);
    }
  }
}, [isActive, currentNote, discoveredInstruments, isReload]);*/

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
          console.log('🔊 Audio context closed');
        } catch (error) {
          console.warn('🔇 Error closing audio context:', error);
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  // Play sound function
  const playInstrumentSound = async (instrumentType) => {
    if (!audioContextRef.current) {
      console.log('🔇 No audio context available');
      return;
    }

    try {
      // Resume audio context on user interaction (required by browsers)
      if (audioContextRef.current.state === 'suspended') {
        console.log('🔊 Resuming suspended audio context...');
        await audioContextRef.current.resume();
      }
      
      const instrument = musicalInstruments[instrumentType];
      if (!instrument) {
        console.log('🔇 Instrument not found:', instrumentType);
        return;
      }

      console.log(`🔊 Playing sound for ${instrumentType} at ${instrument.frequency}Hz`);

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = instrument.frequency;
      oscillator.type = 'sine';
      
      // Set volume envelope
      const currentTime = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5); // Decay
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);
      
      console.log(`✅ Sound played successfully for ${instrumentType}`);
    } catch (error) {
      console.warn('🔇 Sound playback failed:', error);
      
      // Fallback: try to create a simple beep
      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = 440; // Simple A note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.3);
        
        console.log('🔊 Fallback beep played');
      } catch (fallbackError) {
        console.warn('🔇 Even fallback sound failed:', fallbackError);
      }
    }
  };

  // Play the sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0) return;

    // Ensure audio context is running on user interaction
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('🔊 Audio context resumed on user interaction');
      } catch (error) {
        console.warn('🔇 Failed to resume audio context:', error);
      }
    }
    
    console.log('🎵 Playing sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    
    currentSequence.forEach((instrument, index) => {
      safeSetTimeout(() => {
        console.log(`🎵 Playing instrument ${index + 1}/${currentSequence.length}: ${instrument}`);
        
        // Show this sequence item
        setSequenceItemsShown(index + 1);
        
        // Visual feedback
        setPlayingInstrument(instrument);
        playInstrumentSound(instrument);
        
        // Clear visual feedback
        safeSetTimeout(() => {
          setPlayingInstrument(null);
        }, 600);
        
        // After last instrument
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            console.log('🎵 Sequence complete, player can now input');
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Handle player instrument click
  const handleInstrumentClick = async (instrumentType) => {
    if (!canPlayerClick || isSequencePlaying) {
      console.log('🚫 Player click ignored - not ready');
      return;
    }

    // Ensure audio context is running on user interaction
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('🔊 Audio context resumed on instrument click');
      } catch (error) {
        console.warn('🔇 Failed to resume audio context:', error);
      }
    }

    console.log(`🎵 Player clicked: ${instrumentType}`);
    
    // Play sound and visual feedback
    playInstrumentSound(instrumentType);
    setPlayingInstrument(instrumentType);
    
    safeSetTimeout(() => {
      setPlayingInstrument(null);
    }, 300);
    
    const newPlayerInput = [...playerInput, instrumentType];
    const currentIndex = newPlayerInput.length - 1;
    
    // Check if correct
    if (newPlayerInput[currentIndex] === currentSequence[currentIndex]) {
      console.log(`✅ Correct! Position ${currentIndex + 1}/${currentSequence.length}`);
      setPlayerInput(newPlayerInput);

// ✅ ENHANCED: Save state AND sequence after each correct input
if (window.saveEarsGameState) {
  window.saveEarsGameState({
    gamePhase: 'listening',
    playerInput: newPlayerInput,
    currentSequence: currentSequence,        // ← ADD: Save the sequence!
    sequenceItemsShown: sequenceItemsShown   // ← ADD: Save the display count!
  });
}
      // Check if sequence complete
      if (newPlayerInput.length === currentSequence.length) {
        handleSequenceSuccess();
      }
    } else {
      console.log(`❌ Wrong! Expected: ${currentSequence[currentIndex]}, Got: ${instrumentType}`);
      handleSequenceError();
    }
  };

  // Handle correct sequence completion
  const handleSequenceSuccess = () => {
    console.log(`🎉 Sequence for ${currentNote} completed successfully!`);
    setGamePhase('success');
    setCanPlayerClick(false);

     // ✅ ENHANCED: Save post-sequence state
  if (window.saveEarsGameState) {
    window.saveEarsGameState({
      gamePhase: 'success',
      playerInput: playerInput,                    
      currentSequence: currentSequence,           
      sequenceItemsShown: sequenceItemsShown,     
      sequenceJustCompleted: true,        // ← ADD: Mark as just completed
      readyForNextNote: true,             // ← ADD: Ready for next
      lastCompletedNote: currentNote      // ← ADD: Which note was completed
    });
  }
    
    safeSetTimeout(() => {
      if (onSequenceComplete) {
        onSequenceComplete(currentNote);
      }
    }, 1500);
  };

  // Handle wrong input
  const handleSequenceError = () => {
    setGamePhase('error');
    setCanPlayerClick(false);
    setPlayerInput([]);
    
    safeSetTimeout(() => {
      console.log('🔄 Replaying sequence after error');
      setSequenceItemsShown(0);
      handlePlaySequence();
    }, 2000);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="ears-rhythm-game-inline" style={inlineContainerStyle}>
      
      {/* Game Status */}
      <div style={inlineStatusStyle}>
        {gamePhase === 'waiting' && '🎵 Ready to play sacred sequence'}
        {gamePhase === 'playing' && '👂 Listen carefully...'}
        {gamePhase === 'listening' && `🎮 Repeat the sequence! (${playerInput.length}/${currentSequence.length})`}
        {gamePhase === 'success' && '🎉 Perfect! Sacred harmony achieved!'}
        {gamePhase === 'error' && '💫 Try again, listen more carefully...'}
      </div>
      
      {/* Play Sequence Button */}
      {(gamePhase === 'waiting' || gamePhase === 'error') && (
        <button 
          style={inlinePlayButtonStyle}
          onClick={handlePlaySequence}
          disabled={isSequencePlaying}
        >
          🔊 Play Sacred Sequence
        </button>
      )}
      
      {/* Sequence Display - Progressive revelation */}
      {sequenceItemsShown > 0 && (
        <div style={inlineSequenceDisplayStyle}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
            Sacred Sequence:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentSequence.slice(0, sequenceItemsShown).map((instrument, index) => (
              <div 
                key={index}
                style={{
                  ...inlineSequenceItemStyle,
                  backgroundColor: index < playerInput.length 
                    ? (playerInput[index] === instrument ? '#4caf50' : '#f44336')
                    : '#e0e0e0'
                }}
              >
                <img 
                  src={musicalInstruments[instrument].image}
                  alt={musicalInstruments[instrument].name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Musical Instruments in their discovered positions */}
      <div className="discovered-instruments-clickable">
        {Object.keys(discoveredInstruments).map(instrumentType => {
          const instrument = musicalInstruments[instrumentType];
          const isPlaying = playingInstrument === instrumentType;
          const isClickable = canPlayerClick;
          
 const instrumentPositions = {
  tabla: { x: 20, y: 30 },     // Top left
  flute: { x: 80, y: 45 },     // Top right  
  bells: { x: 25, y: 55 },     // Bottom left
  cymbals: { x: 90, y: 60 }    // Bottom right
};
          
          const position = instrumentPositions[instrumentType];
          if (!position) return null;
          
          return (
            <button
              key={instrumentType}
              style={{
                position: 'absolute',
                top: `${position.y}%`,
                left: `${position.x}%`,
                width: '70px',
                height: '70px',
                border: isClickable ? '3px solid #ffd700' : '2px solid #ccc',
                borderRadius: '50%',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                background: 'white',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 1 : 0.7,
                transform: `translate(-50%, -50%) ${isPlaying ? 'scale(1.2)' : 'scale(1)'}`,
                boxShadow: isPlaying ? `0 0 25px ${instrument.color}` : isClickable ? '0 0 15px #ffd700' : '0 4px 12px rgba(0,0,0,0.2)',
                filter: isPlaying ? 'brightness(1.3)' : 'brightness(1)',
                zIndex: 30
              }}
              onClick={() => handleInstrumentClick(instrumentType)}
              disabled={!isClickable}
            >
              <img 
                src={instrument.image}
                alt={instrument.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Instrument name label */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-25px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                fontSize: '10px', 
                color: '#333',
                whiteSpace: 'nowrap',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 6px',
                borderRadius: '8px'
              }}>
                {instrument.name}
              </div>
              
              {/* Click indicator when ready */}
              {isClickable && (
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
      </div>
      
      {/* Player Progress Indicator */}
      {canPlayerClick && (
        <div style={inlineProgressIndicatorStyle}>
          Progress: {playerInput.length} / {currentSequence.length}
        </div>
      )}
      
      {/* Close Button */}
      {onClose && (
        <button 
          style={inlineCloseStyle}
          onClick={onClose}
        >
          ✕
        </button>
      )}
      
      {/* CSS Animations */}
      <style>{`
        .ears-rhythm-game-inline button:hover {
          transform: scale(1.05);
        }
        
        .ears-rhythm-game-inline button:active {
          transform: scale(0.98);
        }
        
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
      `}</style>
    </div>
  );
};

// ✅ INLINE STYLES - Positioned within scene bounds
const inlineContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

const inlineStatusStyle = {
  position: 'absolute',
  top: '140px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '14px',
  fontWeight: 'bold',
 color: '#FFD700',                           // ← CHANGE: Golden text
  background: 'rgba(139, 69, 19, 0.9)',       // ← CHANGE: Brown background
  padding: '8px 16px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  minWidth: '200px'
};

const inlinePlayButtonStyle = {
  position: 'absolute',
  top: '180px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 248, 220, 0.95)',     // ← Cream background
  color: '#8B4513',                            // ← Golden brown text
  border: '2px solid #D2B48C',                 // ← Tan border
  padding: '12px 25px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  zIndex: 30,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
};

const inlineSequenceDisplayStyle = {
  position: 'absolute',
  top: '220px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '15px 20px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const inlineSequenceItemStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const inlineProgressIndicatorStyle = {
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

const inlineCloseStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#666',
  zIndex: 35
};

export default EarsRhythmGame;