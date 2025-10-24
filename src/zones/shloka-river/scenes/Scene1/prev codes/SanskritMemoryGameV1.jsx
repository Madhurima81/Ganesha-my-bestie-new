// zones/shloka-river/scenes/Scene1/components/SanskritMemoryGame.jsx
// Enhanced Sanskrit memory game with automatic flow, sleek progress bar, and engaging animations

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

const ELEMENT_DATA = {
  vakratunda: {
    singers: ['lotus-va', 'lotus-kra', 'lotus-tun', 'lotus-da'],
    clickers: ['baby-elephant-va', 'baby-elephant-kra', 'baby-elephant-tun', 'baby-elephant-da'],
    positions: {
      singers: [
        { left: '25%', top: '45%' },
        { left: '35%', top: '55%' },
        { left: '45%', top: '60%' },
        { left: '75%', top: '50%' }
      ],
      clickers: [
        { left: '18%', top: '65%' },
        { left: '38%', top: '35%' },
        { left: '58%', top: '30%' },
        { left: '68%', top: '28%' }
      ]
    }
  },
  mahakaya: {
    singers: ['stone-ma', 'stone-ha', 'stone-ka', 'stone-ya'],
    clickers: ['adult-elephant-ma', 'adult-elephant-ha', 'adult-elephant-ka', 'adult-elephant-ya'],
    positions: {
      singers: [
        { left: '20%', top: '60%' },
        { left: '40%', top: '65%' },
        { left: '60%', top: '58%' },
        { left: '80%', top: '62%' }
      ],
      clickers: [
        { left: '12%', top: '70%' },
        { left: '32%', top: '75%' },
        { left: '52%', top: '72%' },
        { left: '72%', top: '78%' }
      ]
    }
  }
};

const SanskritMemoryGame = ({
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Water spray component prop
  WaterSprayComponent,
  
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
  console.log('Enhanced SanskritMemoryGame render:', { 
    isActive, 
    hideElements,
    isReload,
    initialCurrentPhase,
    initialCurrentRound,
    powerGained
  });

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentPhase, setCurrentPhase] = useState('vakratunda');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);

  // Enhanced state for automatic flow and animations
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [roundTransition, setRoundTransition] = useState(false);
  const [elephantMoods, setElephantMoods] = useState({});
  const [lotusGlow, setLotusGlow] = useState({});
  const [mistakeCount, setMistakeCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);

  // Water spray state
  const [activeWaterSpray, setActiveWaterSpray] = useState(null);
  const [permanentlyBloomed, setPermanentlyBloomed] = useState({});
  const elementsRef = useRef({});
  const [lastClickTime, setLastClickTime] = useState(0);


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

  // Register element positions for water spray targeting
  const registerElementPosition = (id, element) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const container = element.closest('.vakratunda-grove-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        
        elementsRef.current[id] = {
          left: ((rect.left - containerRect.left + rect.width / 2) / containerRect.width * 100) + '%',
          top: ((rect.top - containerRect.top + rect.height / 2) / containerRect.height * 100) + '%'
        };
      }
    }
  };

  // Audio playback functions
  const playSyllableAudio = (syllable) => {
    try {
      console.log(`Playing syllable: ${syllable}`);
      
      const syllableFileMap = {
        'va': 'vakratunda-va',
        'kra': 'vakratunda-kra', 
        'tun': 'vakratunda-tun',
        'da': 'vakratunda-da',
        'ma': 'mahakaya-ma',
        'ha': 'mahakaya-ha',
        'ka': 'mahakaya-ka',
        'ya': 'mahakaya-ya'
      };
      
      const fileName = syllableFileMap[syllable];
      if (!fileName) {
        console.log(`No file mapping found for syllable: ${syllable}`);
        return;
      }
      
      // Adjust playback speed based on mistake count for adaptive difficulty
      const playbackRate = Math.max(0.7, 1 - (mistakeCount * 0.1));
      
      const audio = new Audio(`/audio/syllables/${fileName}.mp3`);
      audio.volume = 0.8;
      audio.playbackRate = playbackRate;
      audio.play().catch(e => {
        console.log('Audio file not found, using speech synthesis fallback:', e);
        
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(syllable);
          utterance.rate = 0.7 * playbackRate;
          utterance.pitch = 1.2;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';
          speechSynthesis.speak(utterance);
        }
      });
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  const playCompleteWord = (word) => {
    try {
      const wordFileMap = {
        'vakratunda': 'Vakratunda',
        'mahakaya': 'Mahakaya'
      };
      
      const fileName = wordFileMap[word];
      if (!fileName) {
        console.log(`No file mapping found for word: ${word}`);
        return;
      }
      
      const audio = new Audio(`/audio/words/${fileName}.mp3`);
      audio.volume = 0.9;
      audio.play().catch(e => {
        console.log('Word audio not found, using speech synthesis:', e);
        
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.rate = 0.6;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          speechSynthesis.speak(utterance);
        }
      });
    } catch (error) {
      console.log('Word audio not available:', error);
    }
  };

  // Get sequence for current phase and round
  const getSequenceForRound = (phase, round) => {
    return SYLLABLE_SEQUENCES[phase][round] || [];
  };

  // Automatic countdown system
  const startCountdownToSequence = () => {
    console.log('Starting automatic countdown to sequence');
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          handlePlaySequence(); // Auto-start sequence
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Dynamic elephant moods
  const updateElephantMoods = () => {
    const moods = {};
    currentSequence.forEach((syllable, index) => {
      if (gamePhase === 'listening' && index < playerInput.length) {
        moods[syllable] = playerInput[index] === currentSequence[index] ? 'happy' : 'sad';
      } else if (gamePhase === 'playing' || singingSyllable === syllable) {
        moods[syllable] = 'excited';
      } else if (gamePhase === 'celebration') {
        moods[syllable] = 'celebrating';
      } else if (isCountingDown) {
        moods[syllable] = 'ready';
      } else {
        moods[syllable] = 'idle';
      }
    });
    setElephantMoods(moods);
  };

  // Progressive lotus/stone glow effects
  const updateLotusGlow = () => {
    const glowStates = {};
    currentSequence.forEach((syllable, index) => {
      const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
      
      if (permanentlyBloomed[targetId]) {
        glowStates[syllable] = 'bloomed';
      } else if (gamePhase === 'celebration') {
        glowStates[syllable] = 'victory';
      } else if (index < playerInput.length) {
        glowStates[syllable] = playerInput[index] === syllable ? 'success' : 'error';
      } else if (gamePhase === 'playing' && singingSyllable === syllable) {
        glowStates[syllable] = 'singing';
      } else {
        glowStates[syllable] = 'dormant';
      }
    });
    setLotusGlow(glowStates);
  };

  // Update animations based on game state
  useEffect(() => {
    updateElephantMoods();
    updateLotusGlow();
  }, [gamePhase, playerInput, sequenceItemsShown, singingSyllable, isCountingDown, permanentlyBloomed]);

  // Initialize game when activated or on reload
  useEffect(() => {
    if (!isActive) return;

    if (isReload && initialCurrentSequence.length > 0) {
      console.log('RELOAD: Restoring Sanskrit game state');
      
      setCurrentPhase(initialCurrentPhase);
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setSequenceItemsShown(initialCurrentSequence.length);
      setCanPlayerClick(initialGamePhase === 'listening');
      
      if (phaseJustCompleted && lastCompletedPhase) {
        console.log('POST-PHASE COMPLETION: Auto-continuing');
        safeSetTimeout(() => {
          handlePhaseComplete(lastCompletedPhase);
        }, 1000);
      }
      
    } else {
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

  // Automatic sequence start when entering waiting phase
  useEffect(() => {
    if (!isActive) return;
    
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      console.log('AUTO-FLOW: Starting countdown automatically');
      // Brief pause before countdown starts
      const timer = safeSetTimeout(() => {
        startCountdownToSequence();
      }, 1200); // 1.2 second pause before countdown
      
      return () => clearTimeout(timer);
    }
  }, [gamePhase, isActive, currentSequence]);

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
        permanentlyBloomed,
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
    
    saveGameState({ gamePhase: 'playing' });
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        console.log(`Playing syllable ${index + 1}/${currentSequence.length}: ${syllable}`);
        
        setSequenceItemsShown(index + 1);
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);
        
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

  // Trigger water spray effect on correct click
  const triggerWaterSpray = (syllableIndex) => {
    if (!WaterSprayComponent) return;
    
    const syllable = currentSequence[syllableIndex];
    const sourceId = `${currentPhase === 'vakratunda' ? 'baby' : 'adult'}-elephant-${syllable}`;
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
    
    const sourcePos = elementsRef.current[sourceId];
    const targetPos = elementsRef.current[targetId];
    
    if (sourcePos && targetPos) {
      setActiveWaterSpray({
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        phase: currentPhase,
        syllableIndex: syllableIndex,
        timestamp: Date.now()
      });
      
      safeSetTimeout(() => {
        setActiveWaterSpray(null);
      }, 1500);
      
      safeSetTimeout(() => {
        setPermanentlyBloomed(prev => ({ ...prev, [targetId]: true }));
      }, 800);
    }
  };

  // Success celebration with multiple effects
  const triggerSuccessCelebration = () => {
    console.log('Triggering success celebration');
    
    // Water spray celebration for all syllables
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        triggerWaterSpray(index);
      }, index * 200);
    });
    
    // Set celebration phase for animations
    setGamePhase('celebration');
    
    // Reset mistake count on success
    setMistakeCount(0);
    
    // Increment combo streak
    setComboStreak(prev => prev + 1);
  };

 const handleElephantClick = (syllableIndex) => {
  const currentTime = Date.now();
  
  // Prevent rapid clicking (300ms minimum between clicks)
  if (currentTime - lastClickTime < 300) {
    console.log('Click ignored - too fast!');
    return;
  }
  
  if (!canPlayerClick || isSequencePlaying) {
    console.log('Elephant click ignored - not ready');
    return;
  }
  
  setLastClickTime(currentTime);

    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;

    console.log(`Player clicked elephant for syllable: ${clickedSyllable}`);
    
    playSyllableAudio(clickedSyllable);
    
    const newPlayerInput = [...playerInput, clickedSyllable];
    const currentIndex = newPlayerInput.length - 1;
    
    if (newPlayerInput[currentIndex] === currentSequence[currentIndex]) {
      console.log(`Correct! Position ${currentIndex + 1}/${currentSequence.length}`);
      setPlayerInput(newPlayerInput);
      
      triggerWaterSpray(syllableIndex);
      
      saveGameState({
        gamePhase: 'listening',
        playerInput: newPlayerInput,
        currentSequence: currentSequence,
        sequenceItemsShown: sequenceItemsShown
      });
      
      if (newPlayerInput.length === currentSequence.length) {
        handleSequenceSuccess();
      }
    } else {
      console.log(`Wrong! Expected: ${currentSequence[currentIndex]}, Got: ${clickedSyllable}`);
      handleSequenceError();
    }
  };

  // Automatic sequence success with celebration
  const handleSequenceSuccess = () => {
    console.log(`Round ${currentRound} of ${currentPhase} completed successfully!`);
    
    setCanPlayerClick(false);
    triggerSuccessCelebration();
    
    saveGameState({
      gamePhase: 'celebration',
      playerInput: playerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown
    });
    
    // Automatic progression with smooth transitions
    safeSetTimeout(() => {
      if (currentRound < 3) {
  const nextRoundNumber = currentRound + 1;
  console.log(`AUTO-ADVANCE: Starting round ${nextRoundNumber} of ${currentPhase}`);        
        setRoundTransition(true);
        
        safeSetTimeout(() => {
          const nextRound = currentRound + 1;
          const nextSequence = getSequenceForRound(currentPhase, nextRound);
          
          setCurrentRound(nextRound);
          setCurrentSequence(nextSequence);
          setPlayerInput([]);
          setGamePhase('waiting'); // Will trigger auto-countdown
          setCanPlayerClick(false);
          setSequenceItemsShown(0);
          setRoundTransition(false);
          
          saveGameState({
            currentRound: nextRound,
            currentSequence: nextSequence,
            gamePhase: 'waiting',
            playerInput: []
          });
        }, 1500); // Smooth transition time
        
      } else {
        // Phase completion
        handlePhaseComplete(currentPhase);
      }
    }, 2000); // Celebration duration
  };

  // Handle phase completion
  const handlePhaseComplete = (completedPhase) => {
    console.log(`Phase ${completedPhase} completed!`);
    setGamePhase('phase_complete');
    
    playCompleteWord(completedPhase);
    
    saveGameState({
      gamePhase: 'phase_complete',
      phaseJustCompleted: true,
      lastCompletedPhase: completedPhase
    });
    
    if (onPhaseComplete) {
      onPhaseComplete(completedPhase);
    }
    
    // CHANGED: Only auto-advance for Mahakaya completion, not Vakratunda
    if (completedPhase === 'mahakaya') {
      safeSetTimeout(() => {
        console.log('Game complete!');
        if (onGameComplete) {
          onGameComplete();
        }
      }, 3000);
    }
    // For Vakratunda completion, wait for external signal (Continue Learning button)
  };

  // Function to start Mahakaya phase (called from parent when Continue Learning clicked)
  const startMahakayaPhase = () => {
    console.log('Starting Mahakaya phase after Continue Learning clicked');
    const nextSequence = getSequenceForRound('mahakaya', 1);
    
    // IMPORTANT: Clear phase_complete state first
    setGamePhase('transition');
    
    // Use setTimeout to ensure state updates happen in correct order
    setTimeout(() => {
      setCurrentPhase('mahakaya');
      setCurrentRound(1);
      setCurrentSequence(nextSequence);
      setPlayerInput([]);
      setGamePhase('waiting'); // Will trigger auto-countdown
      setCanPlayerClick(false);
      setSequenceItemsShown(0);
      setComboStreak(0);
      setPermanentlyBloomed({});
      
      console.log('Mahakaya phase state updated - should show waiting phase');
      
      saveGameState({
        currentPhase: 'mahakaya',
        currentRound: 1,
        currentSequence: nextSequence,
        gamePhase: 'waiting',
        playerInput: [],
        phaseJustCompleted: false
      });
    }, 100);
  };

// NEW VERSION - More robust function exposure
useEffect(() => {
  console.log('Setting up sanskritMemoryGame communication...');
  
  // Ensure the global object exists
  window.sanskritMemoryGame = window.sanskritMemoryGame || {};
  
  // Always expose the function
  window.sanskritMemoryGame.startMahakayaPhase = startMahakayaPhase;
  window.sanskritMemoryGame.isReady = true;
  
  console.log('sanskritMemoryGame functions exposed:', {
    startMahakayaPhase: typeof window.sanskritMemoryGame.startMahakayaPhase,
    isReady: window.sanskritMemoryGame.isReady
  });
  
  // Cleanup on unmount
  return () => {
    console.log('Cleaning up sanskritMemoryGame communication...');
    if (window.sanskritMemoryGame) {
      delete window.sanskritMemoryGame.startMahakayaPhase;
      delete window.sanskritMemoryGame.isReady;
    }
  };
}, [startMahakayaPhase]); // Add dependency to ensure function is current

  // Enhanced error handling with adaptive difficulty
  const handleSequenceError = () => {
    setGamePhase('error');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setMistakeCount(prev => prev + 1);
    setComboStreak(0); // Reset combo on error
    
    safeSetTimeout(() => {
      console.log('AUTO-RETRY: Replaying sequence after error');
      setSequenceItemsShown(0);
      
      // Slight delay before replay for adaptive difficulty
      const retryDelay = mistakeCount >= 2 ? 3000 : 2000;
      
      safeSetTimeout(() => {
        setGamePhase('waiting'); // Will trigger auto-countdown
      }, retryDelay);
    }, 1000);
  };

  // Helper functions
  const getSyllableIndex = (syllable) => {
    return currentSequence.indexOf(syllable);
  };

  const isSinging = (syllable) => {
    return singingSyllable === syllable;
  };

  const isClickable = (syllableIndex) => {
    return canPlayerClick && syllableIndex < currentSequence.length;
  };

  const isCorrect = (syllableIndex) => {
    return playerInput[syllableIndex] === currentSequence[syllableIndex];
  };

  const isWrong = (syllableIndex) => {
    return playerInput.length > syllableIndex && playerInput[syllableIndex] !== currentSequence[syllableIndex];
  };

  const isBloomed = (syllable) => {
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
    return permanentlyBloomed[targetId];
  };

  // Dynamic status messages
  const getStatusMessage = () => {
if (roundTransition) return `Preparing Round ${currentRound + 1}...`;
    if (gamePhase === 'transition') return 'Starting new phase...';
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen carefully to the sacred sounds...';
    if (gamePhase === 'listening') return `Repeat the sequence! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return comboStreak >= 3 ? 'Amazing streak! Perfect!' : 'Excellent! Well done!';
    if (gamePhase === 'phase_complete') return `${currentPhase.toUpperCase()} mastered!`;
    if (gamePhase === 'error') return mistakeCount >= 3 ? 'Take your time, listen more carefully...' : 'Try again!';
    return `Round ${currentRound} - ${currentPhase.toUpperCase()}`;
  };

  // Sleek integrated progress bar - replaces both old progress bar and sequence display
  const renderIntegratedProgressBar = () => (
    <div style={{
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      zIndex: 40,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      minWidth: '140px',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Phase Header with Round Dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 'bold', 
          color: '#333',
          letterSpacing: '0.5px'
        }}>
          {currentPhase.toUpperCase()}
        </div>
        
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2, 3].map(round => (
            <div
              key={round}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: round <= currentRound 
                  ? (round < currentRound ? '#4CAF50' : '#2196F3')
                  : '#ddd',
                transition: 'all 0.3s ease',
                boxShadow: round === currentRound ? '0 0 6px rgba(33, 150, 243, 0.4)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Sequence Syllables - Only show when revealed */}
      {sequenceItemsShown > 0 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%'
        }}>
          {currentSequence.slice(0, sequenceItemsShown).map((syllable, index) => (
            <div 
              key={index}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                background: index < playerInput.length 
                  ? (isCorrect(index) ? '#4caf50' : '#f44336')
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'all 0.3s ease',
                animation: index === sequenceItemsShown - 1 ? 'syllableAppear 0.4s ease-out' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {syllable.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar for Current Input */}
      {canPlayerClick && (
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e8e8e8',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(playerInput.length / currentSequence.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
            borderRadius: '2px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      )}

      {/* Combo Streak Indicator */}
      {comboStreak >= 2 && (
        <div style={{
          fontSize: '10px',
          color: '#FF9800',
          fontWeight: 'bold',
          background: 'rgba(255, 152, 0, 0.15)',
          padding: '3px 8px',
          borderRadius: '10px',
          animation: 'comboPulse 1s ease-in-out infinite alternate'
        }}>
          {comboStreak}x COMBO
        </div>
      )}
    </div>
  );

  // Enhanced elephant rendering with mood system
  const renderElephant = (syllable, index) => {
    const mood = elephantMoods[syllable] || 'idle';
    const position = phaseData.positions.clickers[index];
    const clickable = isClickable(index);
    const getImage = currentPhase === 'vakratunda' ? getBabyElephantImage : getAdultElephantImage;
    
    const moodStyles = {
      idle: { 
        filter: 'brightness(0.9)', 
        animation: 'breathe 4s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1)'
      },
      ready: { 
        filter: 'brightness(1)', 
        animation: 'breathe 3s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1)'
      },
      excited: { 
        filter: 'brightness(1.2) saturate(1.3)', 
        animation: 'bounce 0.6s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.02)'
      },
      happy: { 
        filter: 'brightness(1.3) hue-rotate(30deg)', 
        animation: 'wiggle 0.8s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.05)'
      },
      celebrating: { 
        filter: 'brightness(1.4) saturate(1.5) hue-rotate(45deg)', 
        animation: 'celebrate 1s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.08)'
      },
      sad: { 
        filter: 'grayscale(0.5) brightness(0.8)', 
        animation: 'shake 0.5s ease-in-out',
        transform: 'translate(-50%, -50%) scale(0.95)'
      }
    };

    return (
      <button
        key={`elephant-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`${currentPhase === 'vakratunda' ? 'baby' : 'adult'}-elephant-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '170px',
          height: '170px',
          border: 'none',
          background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          opacity: clickable ? 1 : 0.7,
          transition: 'all 0.3s ease',
          zIndex: 20,
          ...moodStyles[mood]
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
        
        {/* Syllable label */}
        <div style={{
          position: 'absolute',
          bottom: '85px',
          left: '60%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}>
          {syllable.toUpperCase()}
        </div>
        
        {/* Dynamic mood indicators */}
        {mood === 'happy' && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '24px',
            animation: 'float 1s ease-in-out infinite'
          }}>
            ✨
          </div>
        )}
        
        {mood === 'celebrating' && (
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'celebrate 0.8s ease-in-out infinite'
          }}>
            🎉
          </div>
        )}
        
        {clickable && gamePhase === 'listening' && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            animation: 'pulse 2s infinite',
            fontWeight: 'bold'
          }}>
            Click me!
          </div>
        )}
      </button>
    );
  };

  // Enhanced lotus/stone rendering with glow states
  const renderLotusOrStone = (syllable, index) => {
    const glowState = lotusGlow[syllable] || 'dormant';
    const position = phaseData.positions.singers[index];
    const getImage = currentPhase === 'vakratunda' ? getLotusImage : getStoneImage;
    
    const glowStyles = {
      dormant: { 
        filter: 'brightness(0.8)', 
        opacity: 0.7,
        transform: 'translate(-50%, -50%) scale(1)'
      },
      singing: { 
        filter: 'brightness(1.6) drop-shadow(0 0 25px #ffd700)', 
        animation: 'sing 0.6s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.15)',
        opacity: 1
      },
      success: { 
        filter: 'brightness(1.3) saturate(1.4) drop-shadow(0 0 15px #4caf50)',
        animation: 'successGlow 0.5s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.05)',
        opacity: 1
      },
      victory: { 
        filter: 'brightness(1.5) saturate(1.6) drop-shadow(0 0 25px #ffd700)',
        animation: 'victory 1s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.1)',
        opacity: 1
      },
      error: { 
        filter: 'brightness(1.2) drop-shadow(0 0 15px #f44336)',
        animation: 'errorShake 0.5s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      bloomed: {
        filter: 'brightness(1.4) saturate(1.6) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
        transform: 'translate(-50%, -50%) scale(1.08)',
        opacity: 1
      }
    };

    return (
      <div
        key={`singer-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '80px',
          height: '80px',
          transition: 'all 0.3s ease',
          zIndex: 10,
          ...glowStyles[glowState]
        }}
      >
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${currentPhase === 'vakratunda' ? 'Lotus' : 'Stone'} ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {isSinging(syllable) && (
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            animation: 'musicalNote 0.6s ease-in-out'
          }}>
            🎵
          </div>
        )}
      </div>
    );
  };

  if (!isActive) {
    return null;
  }

  const phaseData = ELEMENT_DATA[currentPhase];

  return (
    <div className="enhanced-sanskrit-game" style={containerStyle}>
      
      {/* Sleek Integrated Progress Bar - hide when elements are hidden */}
      {!hideElements && renderIntegratedProgressBar()}
      
      {/* Dynamic Status Display - hide when elements are hidden */}
      {!hideElements && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isCountingDown 
            ? 'rgba(255, 152, 0, 0.95)' 
            : gamePhase === 'celebration'
            ? 'rgba(76, 175, 80, 0.95)'
            : gamePhase === 'error'
            ? 'rgba(244, 67, 54, 0.95)'
            : 'rgba(33, 150, 243, 0.95)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '15px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 50,
          minWidth: '300px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          {getStatusMessage()}
        </div>
      )}

      {/* Countdown Display - hide when elements are hidden */}
      {!hideElements && isCountingDown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#FF9800',
          textShadow: '0 0 30px rgba(255, 152, 0, 0.8)',
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Enhanced Game Elements */}
      {!hideElements && ((currentPhase === 'vakratunda') || (currentPhase === 'mahakaya' && powerGained)) && (
        <>
          {/* Singing Elements with Enhanced Effects */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderLotusOrStone(syllable, index);
          })}
          
          {/* Clickable Elephants with Mood System */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderElephant(syllable, index);
          })}

          {/* Player Progress Indicator - moved to bottom and hide when elements are hidden */}
          {!hideElements && canPlayerClick && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 30,
              textAlign: 'center',
              minWidth: '150px'
            }}>
              Progress: {playerInput.length} / {currentSequence.length}
              {comboStreak >= 2 && (
                <div style={{ fontSize: '10px', marginTop: '2px', color: '#FFD700' }}>
                  Combo: {comboStreak}x
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Water Spray Animation */}
      {activeWaterSpray && WaterSprayComponent && (
        <WaterSprayComponent
          sourcePosition={activeWaterSpray.sourcePosition}
          targetPosition={activeWaterSpray.targetPosition}
          isActive={true}
          dropCount={activeWaterSpray.phase === 'mahakaya' ? 20 : 15}
          duration={1500}
          phase={activeWaterSpray.phase}
        />
      )}
      
<button 
  style={{
    position: 'fixed',
    top: '100px',
    right: '20px',
    background: 'orange',
    padding: '10px',
    zIndex: 9999
  }}
  onClick={() => {
    console.log('Testing rapid clicks...');
    // Simulate rapid clicks
    for(let i = 0; i < 5; i++) {
      setTimeout(() => {
        handleElephantClick(0);
      }, i * 50); // 50ms apart - should be blocked
    }
  }}
>
  Test Rapid Clicks
</button>

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
        
        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.02); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1.02); }
          50% { transform: translate(-50%, -50%) translateY(-8px) scale(1.02); }
        }
        
        @keyframes celebrate {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1.08); }
          25% { transform: translate(-50%, -50%) rotate(-3deg) scale(1.1); }
          75% { transform: translate(-50%, -50%) rotate(3deg) scale(1.1); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1.05); }
          25% { transform: translate(-50%, -50%) rotate(2deg) scale(1.05); }
          75% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0) scale(0.95); }
          25% { transform: translate(-50%, -50%) translateX(-3px) scale(0.95); }
          75% { transform: translate(-50%, -50%) translateX(3px) scale(0.95); }
        }
        
        @keyframes sing {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes victory {
          0%, 100% { transform: translate(-50%, -50%) scale(1.1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes successGlow {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
          100% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-5px); }
          75% { transform: translate(-50%, -50%) translateX(5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        
        @keyframes musicalNote {
          0% { transform: translateX(-50%) translateY(0) scale(0.8); opacity: 0; }
          50% { transform: translateX(-50%) translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px) scale(0.8); opacity: 0; }
        }
        
        @keyframes syllableAppear {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes comboPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Enhanced inline styles
const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

export default SanskritMemoryGame;