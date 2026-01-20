// zones/symbol-mountain/scenes/symbol/EarsRhythmGame.jsx
// 🎵 UPDATED: Clean UI with dynamic header and improved visual feedback

import React, { useState, useEffect, useRef } from 'react';

// Import musical instrument images
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

// Generate random rhythm sequences
const generateRandomSequence = (discoveredInstruments, noteId) => {
  const availableInstruments = Object.keys(discoveredInstruments);
  
  // Progressive difficulty
  const sequenceConfigs = {
    note1: { length: 2, useInstruments: 2 }, // Easy: 2 beats, 2 instruments
    note2: { length: 3, useInstruments: 3 }, // Medium: 3 beats, 3 instruments  
    note3: { length: 3, useInstruments: 4 }  // Hard: 3 beats, all 4 instruments (FIXED!)
  };
  
  const config = sequenceConfigs[noteId] || { length: 2, useInstruments: 2 };
  const instrumentPool = availableInstruments.slice(0, Math.min(config.useInstruments, availableInstruments.length));
  
  const sequence = [];
  for (let i = 0; i < config.length; i++) {
    const randomInstrument = instrumentPool[Math.floor(Math.random() * instrumentPool.length)];
    sequence.push(randomInstrument);
  }
  
  console.log(`🎲 Generated sequence for ${noteId}:`, sequence);
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
  isReload = false,
  initialGamePhase = 'waiting',
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialSequenceItemsShown = 0,
  sequenceJustCompleted = false,
  lastCompletedNote = null
}) => {
  // Game states
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [playingInstrument, setPlayingInstrument] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showHintGlow, setShowHintGlow] = useState(false);

  // Audio context ref
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);
  const hintTimerRef = useRef(null);

  // Clean up timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
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
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          console.log('🔊 Audio context created');
        } catch (error) {
          console.warn('🔇 Audio context failed:', error);
          audioContextRef.current = null;
        }
      };
      initAudio();
    }
    
    if (!isActive && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
        console.log('🔊 Audio context closed');
      } catch (error) {
        console.warn('🔇 Error closing audio context:', error);
      }
      audioContextRef.current = null;
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.warn('🔇 Error closing audio context on cleanup:', error);
        }
        audioContextRef.current = null;
      }
    };
  }, [isActive]);

  // Set up sequence when note changes or on reload
  useEffect(() => {
    if (isActive && currentNote && Object.keys(discoveredInstruments).length > 0) {
      if (isReload && initialCurrentSequence && initialCurrentSequence.length > 0) {
        console.log('🔄 RELOAD: Restoring game state');
        setCurrentSequence(initialCurrentSequence);
        setPlayerInput(initialPlayerInput);
        setGamePhase(initialGamePhase);
        setCanPlayerClick(initialGamePhase === 'listening');
        setSequenceItemsShown(initialSequenceItemsShown);
      } else {
        console.log('🎵 NEW GAME: Generating sequence');
        const sequence = generateRandomSequence(discoveredInstruments, currentNote);
        setCurrentSequence(sequence);
        setPlayerInput([]);
        setGamePhase('waiting');
        setCanPlayerClick(false);
        setSequenceItemsShown(0);
        setShowHintGlow(false);
        clearAllTimeouts();
      }
    }
  }, [isActive, currentNote, discoveredInstruments, isReload]);

  // Auto-countdown after waiting
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => {
        startCountdown();
      }, 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // 20-second hint timer
  useEffect(() => {
    if (gamePhase === 'listening' && canPlayerClick) {
      hintTimerRef.current = setTimeout(() => {
        console.log('💡 20 seconds passed - showing hint glow');
        setShowHintGlow(true);
      }, 20000);
    } else {
      setShowHintGlow(false);
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    }
    
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [gamePhase, canPlayerClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Play sound function
  const playInstrumentSound = async (instrumentType) => {
    if (!audioContextRef.current) {
      console.log('🔇 No audio context available');
      return;
    }

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const instrument = musicalInstruments[instrumentType];
      if (!instrument) return;

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = instrument.frequency;
      oscillator.type = 'sine';
      
      const currentTime = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);
    } catch (error) {
      console.warn('🔇 Sound playback failed:', error);
    }
  };

  // Countdown
  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    safeSetTimeout(() => {
      setCountdown(2);
      safeSetTimeout(() => {
        setCountdown(1);
        safeSetTimeout(() => {
          setCountdown(0);
          setIsCountingDown(false);
          handlePlaySequence();
        }, 800);
      }, 800);
    }, 800);
  };

  // Play the sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0) return;

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
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
        setSequenceItemsShown(index + 1);
        setPlayingInstrument(instrument);
        playInstrumentSound(instrument);
        
        safeSetTimeout(() => {
          setPlayingInstrument(null);
        }, 600);
        
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            console.log('🎵 Sequence complete, player can input');
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

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('🔇 Failed to resume audio context:', error);
      }
    }

    console.log(`🎵 Player clicked: ${instrumentType}`);
    
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

      // Save state
      if (window.saveEarsGameState) {
        window.saveEarsGameState({
          gamePhase: 'listening',
          playerInput: newPlayerInput,
          currentSequence: currentSequence,
          sequenceItemsShown: sequenceItemsShown
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
    console.log(`🎉 Round ${currentNote} completed!`);
    setGamePhase('success');
    setCanPlayerClick(false);
    setShowHintGlow(false);

    // Save state
    if (window.saveEarsGameState) {
      window.saveEarsGameState({
        gamePhase: 'success',
        playerInput: playerInput,
        currentSequence: currentSequence,
        sequenceItemsShown: sequenceItemsShown,
        sequenceJustCompleted: true,
        readyForNextNote: true,
        lastCompletedNote: currentNote
      });
    }
    
    // Quick celebration (1 second), then notify parent
    safeSetTimeout(() => {
      if (onSequenceComplete) {
        onSequenceComplete(currentNote);
      }
    }, 1000);
  };

  // Handle wrong input
  const handleSequenceError = () => {
    setGamePhase('error');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setShowHintGlow(false);
    
    safeSetTimeout(() => {
      console.log('🔄 Replaying sequence after error');
      setSequenceItemsShown(0);
      handlePlaySequence();
    }, 2000);
  };

  if (!isActive) {
    return null;
  }

  // Get unique instruments needed for current sequence
  const neededInstruments = [...new Set(currentSequence)];
  const isPlayerTurn = gamePhase === 'listening';

  // Render pattern display in header
  const renderPatternDisplay = () => {
    if (currentSequence.length === 0) return null;
    
    return (
      <div style={{
        display: 'inline-flex',
        gap: '8px',
        marginLeft: '10px',
        alignItems: 'center'
      }}>
        {currentSequence.map((inst, i) => {
          const isDone = i < playerInput.length;
          return (
            <div
              key={i}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isDone ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <img 
                src={musicalInstruments[inst].image}
                alt={inst}
                style={{
                  width: '28px',
                  height: '28px',
                  opacity: isDone ? 0.5 : 1,
                  filter: isDone ? 'grayscale(100%)' : 'none'
                }}
              />
              {isDone && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get header text
  const getHeaderText = () => {
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'waiting') return 'Ready to learn the pattern?';
    if (gamePhase === 'playing') return '👀 Watch & Listen';
    if (gamePhase === 'listening') return '👆 Tap the Instruments';
    if (gamePhase === 'success') return '🎉 Perfect!';
    if (gamePhase === 'error') return '💫 Try Again!';
    return '';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      pointerEvents: 'none'
    }}>
      
      {/* DYNAMIC HEADER */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #8B6F47 0%, #D4A76A 100%)',
        border: '4px solid #5D4037',
        borderRadius: '20px',
        padding: '12px 24px',
        fontFamily: "'Baloo', cursive",
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 60,
        minWidth: '300px',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <span>{getHeaderText()}</span>
        {(gamePhase === 'playing' || gamePhase === 'listening') && renderPatternDisplay()}
      </div>

      {/* ROUND PROGRESS DOTS */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 60,
        pointerEvents: 'none'
      }}>
        {['note1', 'note2', 'note3'].map((note, index) => {
          const isCompleted = note < currentNote;
          const isCurrent = note === currentNote;
          
          return (
            <div
              key={note}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCompleted
                  ? '#4CAF50'
                  : isCurrent 
                    ? '#FFD700'
                    : '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: isCompleted || isCurrent ? 'white' : '#999',
                border: isCurrent ? '3px solid #FF9800' : 'none',
                boxShadow: isCurrent ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
          );
        })}
      </div>

      {/* INSTRUMENT HIGHLIGHTS (on actual instruments in mountain) */}
      {/* This CSS is injected to highlight instruments when needed */}
      <style>{`
        ${isPlayerTurn && showHintGlow ? neededInstruments.map(inst => `
          .instrument-${inst} {
            animation: hintPulse 2s ease-in-out infinite !important;
            filter: drop-shadow(0 0 15px ${musicalInstruments[inst].color}) !important;
          }
        `).join('\n') : ''}
        
        @keyframes hintPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default EarsRhythmGame;