// zones/shloka-river/scenes/Scene3/components/NirvighnamGame.jsx
// Stone clearing game - Animals click to move objects off stones

import React, { useState, useEffect, useRef } from 'react';

// Nirvighnam syllable sequences for each round
const SYLLABLE_SEQUENCES = {
  nirvighnam: {
    1: ['nir', 'vigh'],
    2: ['nir', 'vigh', 'nam']
  }
};

const ELEMENT_DATA = {
  nirvighnam: {
    animals: ['frog-nir', 'snail-vigh', 'turtle-nam'],
    objects: ['leaf-nir', 'drum-vigh', 'feather-nam'],
    stones: ['stone1-nir', 'stone2-vigh', 'stone3-nam'],
    positions: {
      animals: [
        { left: '20%', top: '25%' },  // Animal nir
        { left: '40%', top: '20%' },  // Animal vigh
        { left: '60%', top: '25%' }   // Animal nam
      ],
      objects: [
        { left: '20%', top: '50%' },  // Object nir - ALIGNED with animal
        { left: '40%', top: '45%' },  // Object vigh - ALIGNED with animal
        { left: '60%', top: '50%' }   // Object nam - ALIGNED with animal
      ],
      stones: [
        { left: '18%', top: '75%' },  // Stone nir - NEXT TO object
        { left: '38%', top: '70%' },  // Stone vigh - NEXT TO object
        { left: '58%', top: '75%' }   // Stone nam - NEXT TO object
      ]
    }
  }
};

const NirvighnamGame = ({
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Reload support props
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialSequenceItemsShown = 0,
  initialPermanentTransformations = {},
  initialPermanentlyActivatedAnimals = {},
  initialComboStreak = 0,
  initialMistakeCount = 0,
  phaseJustCompleted = false,
  lastCompletedPhase = null,
  gameJustCompleted = false,
  initialIsCountingDown = false,
  initialCountdown = 0,
  
  // Assets - passed from parent component
  getAnimalImage,      // (index) -> frog/snail/turtle images (clickers)
  getObjectImage,      // (index, singing) -> leaf/drum/feather images (singers)
  getStoneImage,       // (index, golden) -> stone color states (rewards)
  
  // Audio functions
  isAudioOn,
  playAudio,
  
  // State saving for reload support
  onSaveGameState,
  
  // Cleanup callback
  onCleanup

}) => {
  console.log('🌿 NirvighnamGame render:', { 
    isActive, 
    hideElements,
    isReload,
    initialCurrentRound,
    phaseJustCompleted,
    gameJustCompleted
  });

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingObject, setSingingObject] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);

  const [currentPhase, setCurrentPhase] = useState('nirvighnam');
  

  // Enhanced state for automatic flow and animations
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [roundTransition, setRoundTransition] = useState(false);
  const [animalMoods, setAnimalMoods] = useState({});
  const [objectGlow, setObjectGlow] = useState({});
  const [mistakeCount, setMistakeCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const [hasGameStarted, setHasGameStarted] = useState(false);

  // FIXED: Separate states for visual persistence vs clicking
  const [permanentTransformations, setPermanentTransformations] = useState({}); // Visual state - persists across rounds
  const [permanentlyActivatedAnimals, setPermanentlyActivatedAnimals] = useState({});

  const [currentRoundClicks, setCurrentRoundClicks] = useState({}); // Click state - resets each round
  const [activeSparkles, setActiveSparkles] = useState({});
  const elementsRef = useRef({});

  // Refs for better cleanup and state management
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);
  const currentStateRef = useRef(null);

  // Safe timeout function with component mount check
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Safe interval function with component mount check
  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  // Clear all timeouts and intervals
  const clearAllTimers = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // Cleanup on unmount/hide with callback
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      console.log('🧹 NirvighnamGame: Component unmounting - cleaning up');
      isComponentMountedRef.current = false;
      clearAllTimers();
      
      // Cleanup global references
      if (window.nirvighnamGame) {
        window.nirvighnamGame.isReady = false;
        delete window.nirvighnamGame.startGame;
        delete window.nirvighnamGame.clearCompletionState;
      }
      
      // Call cleanup callback if provided
      if (onCleanup) {
        onCleanup();
      }
    };
  }, []);

  // Cleanup when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      console.log('🛑 NirvighnamGame: Component deactivated - clearing timers');
      clearAllTimers();
      setIsCountingDown(false);
      setIsSequencePlaying(false);
      
      if (window.nirvighnamGame) {
        window.nirvighnamGame.isReady = false;
      }
    } else {
      if (window.nirvighnamGame) {
        window.nirvighnamGame.isReady = true;
      }
    }
  }, [isActive]);

  // Save state for reload support
  const saveGameState = (additionalState = {}) => {
    const currentState = {
      gamePhase,
      currentRound,
      playerInput,
      currentSequence,
      sequenceItemsShown,
      permanentTransformations,
      permanentlyActivatedAnimals,
      comboStreak,
      mistakeCount,
      hasGameStarted,
      isCountingDown,
      countdown,
      timestamp: Date.now(),
      ...additionalState
    };
    
    // Update ref for quick access
    currentStateRef.current = currentState;
    
    if (onSaveGameState) {
      onSaveGameState(currentState);
    }
  };

  // Register element positions for sparkle targeting
  const registerElementPosition = (id, element) => {
    if (element && isComponentMountedRef.current) {
      const rect = element.getBoundingClientRect();
      const container = element.closest('.nirvighnam-bank-container');
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
    if (!isAudioOn) return;
    
    try {
      console.log(`🔊 Playing syllable: ${syllable}`);
      
      const syllableFileMap = {
        'nir': 'nirvighnam-nir',
        'vigh': 'nirvighnam-vigh', 
        'nam': 'nirvighnam-nam'
      };
      
      const fileName = syllableFileMap[syllable];
      if (!fileName) {
        console.log(`No file mapping found for syllable: ${syllable}`);
        return;
      }
      
      const playbackRate = Math.max(0.7, 1 - (mistakeCount * 0.1));
      playAudio(`/audio/syllables/${fileName}.mp3`, playbackRate);
      
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  const playCompleteWord = () => {
    if (!isAudioOn) return;
    
    try {
      playAudio('/audio/words/nirvighnam.mp3', 0.9);
    } catch (error) {
      console.log('Word audio not available:', error);
    }
  };

  // Get sequence for current round
  const getSequenceForRound = (round) => {
    return SYLLABLE_SEQUENCES.nirvighnam[round] || [];
  };

  // FIXED: Reset clicking state at start of each round
  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setCurrentRoundClicks({}); // FIXED: Reset click state each round
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    
    console.log(`🌿 Starting Nirvighnam Round ${roundNumber} with sequence:`, sequence);
    console.log('🔄 Click state reset - all animals clickable again');
    
    saveGameState({
      currentRound: roundNumber,
      currentSequence: sequence,
      gamePhase: 'waiting',
      playerInput: []
    });
  };

  // Start countdown to sequence
  const startCountdownToSequence = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('⏰ Starting automatic countdown to sequence');
    setIsCountingDown(true);
    setCountdown(3);
    
    saveGameState({ isCountingDown: true, countdown: 3 });
    
    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        saveGameState({ isCountingDown: newCount > 0, countdown: newCount });
        
        if (newCount <= 0) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          if (isComponentMountedRef.current) {
            handlePlaySequence(); // Auto-start sequence
          }
          return 0;
        }
        return newCount;
      });
    }, 800);
  };

const updateAnimalMoods = () => {
  if (!isComponentMountedRef.current) return;
  
  const moods = {};
  currentSequence.forEach((syllable, index) => {
    const animalId = `animal-${syllable}`;
    
    // NEW: Check if permanently activated first
    if (permanentlyActivatedAnimals[animalId]) {
      moods[syllable] = 'permanently_activated';
    } else if (gamePhase === 'animal_clicking' && currentRoundClicks[animalId]) {
      moods[syllable] = 'activated';
    } else if (gamePhase === 'animal_clicking') {
      moods[syllable] = 'ready';
    } else if (gamePhase === 'celebration') {
      moods[syllable] = 'celebrating';
    } else if (isCountingDown) {
      moods[syllable] = 'ready';
    } else {
      moods[syllable] = 'dim';
    }
  });
  setAnimalMoods(moods);
};

  // Progressive object glow effects (objects are singers)
  const updateObjectGlow = () => {
    if (!isComponentMountedRef.current) return;
    
    const glowStates = {};
    currentSequence.forEach((syllable, index) => {
      const objectId = `object-${syllable}`;
      
      if (permanentTransformations[objectId]) {
        glowStates[syllable] = 'transformed'; // moved off stone (persists)
      } else if (gamePhase === 'celebration') {
        glowStates[syllable] = 'victory';
      } else if (gamePhase === 'playing' && singingObject === syllable) {
        glowStates[syllable] = 'singing';
      } else {
        glowStates[syllable] = 'on_stone'; // initial state
      }
    });
    setObjectGlow(glowStates);
  };

  // Update animations based on game state
  useEffect(() => {
    updateAnimalMoods();
    updateObjectGlow();
  }, [gamePhase, playerInput, sequenceItemsShown, singingObject, isCountingDown, currentRoundClicks, permanentTransformations]);

  // Initialize game when activated or on reload
  useEffect(() => {
    if (!isActive) return;

    if (isReload && initialCurrentSequence.length > 0) {      
      console.log('🔄 RELOAD: Restoring Nirvighnam game state');
            
      // Restore all state
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setPermanentTransformations(initialPermanentTransformations || {});
      setComboStreak(initialComboStreak || 0);
      setMistakeCount(initialMistakeCount || 0);
      setHasGameStarted(true); // Always true on reload
      setIsCountingDown(initialIsCountingDown);
      setCountdown(initialCountdown);

      // FIXED: Rebuild current round click state from playerInput
      const clickState = {};
      initialPlayerInput.forEach(syllable => {
        clickState[`animal-${syllable}`] = true;
      });
      setCurrentRoundClicks(clickState);

      // Handle celebration phase reload
      if (initialGamePhase === 'celebration') {
        console.log('🎉 RELOAD: Was celebrating - resuming auto-continuation');
        setGamePhase('celebration');
        setCanPlayerClick(false);
        
        // Trigger auto-continuation after 2 seconds
        safeSetTimeout(() => {
          if (!isComponentMountedRef.current) return;
          
          if (initialCurrentRound < 2) {
            console.log(`➡️ AUTO-RESUME: Continuing to round ${initialCurrentRound + 1}`);
            
            setRoundTransition(true);
            
            safeSetTimeout(() => {
              if (!isComponentMountedRef.current) return;
              
              startNewRound(initialCurrentRound + 1);
              setRoundTransition(false);
            }, 1500);
            
          } else {
            console.log('🏆 AUTO-RESUME: Completing phase after reload');
            handlePhaseComplete();
          }
        }, 2000);
        
      } else {
        // Handle other phases normally  
        setGamePhase(initialGamePhase);
        setCanPlayerClick(initialGamePhase === 'animal_clicking');
      }

      // If we were counting down, restart the countdown
      if (initialIsCountingDown && initialCountdown > 0) {
        console.log('🔄 RELOAD: Restarting countdown from', initialCountdown);
        
        const countdownInterval = safeSetInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsCountingDown(false);
              if (isComponentMountedRef.current) {
                handlePlaySequence(); // This will play the audio
              }
              return 0;
            }
            return prev - 1;
          });
        }, 800);
      }
      
      // Handle special reload scenarios
      if (gameJustCompleted) {
        console.log('🎉 Game just completed during reload - calling onGameComplete');
        safeSetTimeout(() => {
          if (onGameComplete) {
            onGameComplete();
          }
        }, 1000);
      } else if (phaseJustCompleted && lastCompletedPhase) {
        console.log('✅ Phase just completed during reload - auto-continuing');
        safeSetTimeout(() => {
          handlePhaseComplete();
        }, 1000);
      }
      
    } else {
      console.log('🆕 NEW GAME: Starting Nirvighnam phase immediately');
      startNewRound(1);
      setHasGameStarted(true);
      setPermanentTransformations({});
      setComboStreak(0);
      setMistakeCount(0);
    }
  }, [isActive, isReload]);

  // Auto-start logic
  useEffect(() => {
    if (!isActive || !isComponentMountedRef.current) return;
    
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      if (!hasGameStarted && !isReload) {
        console.log('🎮 FIRST TIME: Auto-starting for new game');
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            startCountdownToSequence();
          }
        }, 1200);
      } else if (hasGameStarted) {
        console.log('🔄 AUTO-FLOW: Starting countdown automatically for subsequent round');
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            startCountdownToSequence();
          }
        }, 1200);
      }
    }
  }, [gamePhase, isActive, currentSequence, isCountingDown, hasGameStarted, isReload]);

  // Global function exposure
  useEffect(() => {
    if (!isActive) return;
    
    // Ensure the global object exists
    if (!window.nirvighnamGame) {
      window.nirvighnamGame = {};
    }
    
    // Expose functions and set ready flag
    window.nirvighnamGame.isReady = true;
    window.nirvighnamGame.clearCompletionState = () => {
      if (isComponentMountedRef.current) {
        setGamePhase('waiting');
        setSequenceItemsShown(0);
        console.log('🧹 Nirvighnam game completion state cleared');
      }
    };
    
    console.log('🌐 NirvighnamGame: Global functions exposed and ready flag set');
    
    // Cleanup on unmount or deactivation
    return () => {
      if (window.nirvighnamGame) {
        window.nirvighnamGame.isReady = false;
        delete window.nirvighnamGame.clearCompletionState;
        console.log('🧹 NirvighnamGame: Global functions cleaned up');
      }
    };
  }, [isActive]);

  // Play the object sequence (objects are singers)
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0 || !isComponentMountedRef.current) return;

    console.log('🎵 Playing object sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    setSingingObject(null);
    
    saveGameState({ gamePhase: 'playing' });
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        console.log(`🔊 Playing syllable ${index + 1}/${currentSequence.length}: ${syllable}`);
        
        setSequenceItemsShown(index + 1);
        setSingingObject(syllable);
        playSyllableAudio(syllable);
        
        // Trigger object glow (objects are singers)
        triggerObjectGlow(index);
        
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            setSingingObject(null);
          }
        }, 600);
        
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            if (isComponentMountedRef.current) {
              setIsSequencePlaying(false);
              setGamePhase('animal_clicking');
              setCanPlayerClick(true);
              saveGameState({ gamePhase: 'animal_clicking' });
              console.log('🐸 Sequence complete, player can now click animals');
            }
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Trigger object glow effect (during singing phase)
  const triggerObjectGlow = (syllableIndex) => {
    if (!isComponentMountedRef.current) return;
    
    const syllable = currentSequence[syllableIndex];
    const objectId = `object-${syllable}`;
    
    setActiveSparkles(prev => ({ ...prev, [objectId]: true }));
    
    safeSetTimeout(() => {
      if (isComponentMountedRef.current) {
        setActiveSparkles(prev => ({ ...prev, [objectId]: false }));
      }
    }, 1000);
  };

  // Handle animal click (animals are clickers)
  const handleAnimalClick = (syllableIndex) => {
    const currentTime = Date.now();
    
    // Prevent rapid clicking and ensure component is active
    if (currentTime - lastClickTime < 300 || !isComponentMountedRef.current) {
      console.log('Click ignored - too fast or component unmounted!');
      return;
    }
    
    if (!canPlayerClick || isSequencePlaying) {
      console.log('Animal click ignored - not ready');
      return;
    }

    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;

    // FIXED: Check current round clicks instead of permanent state
    const animalId = `animal-${clickedSyllable}`;
    if (currentRoundClicks[animalId]) {
      console.log('Animal already clicked this round!');
      return;
    }

    // FIXED: Sequential clicking validation
    const expectedIndex = playerInput.length;
    if (syllableIndex !== expectedIndex) {
      const expectedSyllable = currentSequence[expectedIndex];
      console.log(`❌ Wrong order! Expected syllable ${expectedIndex + 1} (${expectedSyllable}), but clicked syllable ${syllableIndex + 1} (${clickedSyllable})`);
      
      setGamePhase('order_error');
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setGamePhase('animal_clicking');
        }
      }, 1500);
      
      return;
    }

    setLastClickTime(currentTime);

    console.log(`✅ Player clicked animal for syllable: ${clickedSyllable} (position ${syllableIndex + 1})`);
    
    playSyllableAudio(clickedSyllable);
    
    // FIXED: Mark as clicked in current round + transform permanently
    const objectId = `object-${clickedSyllable}`;
    const stoneId = `stone-${clickedSyllable}`;
    
    // Update current round clicks (for preventing re-clicks this round)
    setCurrentRoundClicks(prev => ({ ...prev, [animalId]: true }));
    setPermanentlyActivatedAnimals(prev => ({ ...prev, [animalId]: true }));

    
    // Update permanent transformations (for visual persistence)
    setPermanentTransformations(prev => ({ 
      ...prev, 
      [objectId]: true,
      [stoneId]: true 
    }));
    
    // Trigger sparkles from animal to object
    triggerAnimalToObjectSparkles(syllableIndex);
    
    const newPlayerInput = [...playerInput, clickedSyllable];
    setPlayerInput(newPlayerInput);
    
    saveGameState({
      gamePhase: 'animal_clicking',
      playerInput: newPlayerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown,
      permanentTransformations: {
        ...permanentTransformations,
        [objectId]: true,
        [stoneId]: true
      }
    });
    
    if (newPlayerInput.length === currentSequence.length) {
      handleSequenceSuccess();
    }
  };

  // Trigger sparkles from animal to object
  const triggerAnimalToObjectSparkles = (syllableIndex) => {
    if (!isComponentMountedRef.current) return;
    
    const syllable = currentSequence[syllableIndex];
    const animalId = `animal-${syllable}`;
    const objectId = `object-${syllable}`;
    
    // Activate animal sparkles
    setActiveSparkles(prev => ({ ...prev, [animalId]: true }));
    
    // After delay, activate object transformation with PERMANENT sparkles
    safeSetTimeout(() => {
      if (isComponentMountedRef.current) {
        setActiveSparkles(prev => ({ 
          ...prev, 
          [animalId]: false,
          [objectId]: 'permanent' // FIXED: Permanent sparkles for moved objects
        }));
      }
    }, 800);
  };

  // Automatic sequence success
  const handleSequenceSuccess = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log(`🎊 Round ${currentRound} of Nirvighnam completed successfully!`);
    
    setCanPlayerClick(false);
    setGamePhase('celebration');
    
    // Reset mistake count on success
    setMistakeCount(0);
    
    // Increment combo streak
    setComboStreak(prev => prev + 1);
    
    saveGameState({
      gamePhase: 'celebration',
      playerInput: playerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown
    });
    
    // Automatic progression with smooth transitions
    safeSetTimeout(() => {
      if (!isComponentMountedRef.current) return;
      
      if (currentRound < 2) {
        console.log(`➡️ AUTO-ADVANCE: Starting round ${currentRound + 1} of Nirvighnam`);
        
        setRoundTransition(true);
        
        safeSetTimeout(() => {
          if (!isComponentMountedRef.current) return;
          
          startNewRound(currentRound + 1);
          setRoundTransition(false);
        }, 1500);
        
      } else {
        handlePhaseComplete();
      }
    }, 2000);
  };

  // Handle phase completion
  const handlePhaseComplete = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('🏆 Nirvighnam phase completed!');
    setGamePhase('phase_complete');
    
    playCompleteWord();
    
    saveGameState({
      gamePhase: 'phase_complete',
      phaseJustCompleted: true,
      lastCompletedPhase: 'nirvighnam'
    });
    
    if (onPhaseComplete) {
      onPhaseComplete('nirvighnam');
    }
  };

  // Helper functions
  const getSyllableIndex = (syllable) => {
    return currentSequence.indexOf(syllable);
  };

  const isSinging = (syllable) => {
    return singingObject === syllable;
  };

  const isAnimalClickable = (syllableIndex) => {
    if (!canPlayerClick || syllableIndex >= currentSequence.length) return false;
    
    // FIXED: Sequential clicking - only the next expected animal is clickable
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const isAnimalActivated = (syllable) => {
    const animalId = `animal-${syllable}`;
    return currentRoundClicks[animalId]; // FIXED: Use current round state
  };

  const isObjectTransformed = (syllable) => {
    const objectId = `object-${syllable}`;
    return permanentTransformations[objectId]; // Visual state persists
  };

  const isStoneGolden = (syllable) => {
    const stoneId = `stone-${syllable}`;
    return permanentTransformations[stoneId]; // Visual state persists
  };

  const hasBeenClickedThisRound = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };

  // Dynamic status messages
  const getStatusMessage = () => {
    if (roundTransition) return `Preparing Round ${currentRound + 1}...`;
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen to the magical object sounds...';
    if (gamePhase === 'animal_clicking') return `Click the animals! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return comboStreak >= 3 ? 'Stone clearing streak! Magical!' : 'Brilliant! Path cleared!';
    if (gamePhase === 'phase_complete') return '';
    if (gamePhase === 'error') return mistakeCount >= 3 ? 'Listen carefully to clear the path...' : 'Try again!';
    if (gamePhase === 'order_error') return 'Click the animals in order!';
    return `Round ${currentRound} - NIRVIGHNAM`;
  };

  // Quick jump to round (for testing/development)
  const jumpToRound = (phase, round) => {
    if (!isComponentMountedRef.current) return;
    
    const newSequence = getSequenceForRound(round);
    setCurrentRound(round);
    setCurrentSequence(newSequence);
    setPlayerInput([]);
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    
    saveGameState({
      currentRound: round,
      currentSequence: newSequence,
      gamePhase: 'waiting',
      playerInput: []
    });
  };

  // Render animal (clickers - sitting ON stones)
  const renderAnimal = (syllable, index) => {
    const mood = animalMoods[syllable] || 'dim';
    const position = ELEMENT_DATA.nirvighnam.positions.animals[index]; // Same as stone position
    const hasSparkles = activeSparkles[`animal-${syllable}`];
    const activated = isAnimalActivated(syllable);
    const clickable = isAnimalClickable(index);
    const isNextExpected = isAnimalClickable(index);
    const alreadyClicked = hasBeenClickedThisRound(index);
    
    // Simple animal styles - no glow backgrounds
    let finalStyle = {
      filter: 'brightness(1)',
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
      transition: 'all 0.3s ease'
    };
    
    if (alreadyClicked) {
      finalStyle.filter = 'brightness(0.8) saturate(0.7)';
      finalStyle.opacity = 0.8;
    } else if (isNextExpected) {
      finalStyle.filter = 'brightness(1.2)';
      finalStyle.animation = 'animalPulse 1s ease-in-out infinite';
    } else if (!clickable && canPlayerClick) {
      finalStyle.filter = 'brightness(0.7) saturate(0.5)';
      finalStyle.opacity = 0.6;
    }

    return (
      <button
        key={`animal-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`animal-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '100px',          // Animal size - fits on big stone
          height: '100px',         // Animal size - fits on big stone
          border: 'none',
          background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          zIndex: 25,             // ON TOP of stones (stones are z-index 5)
          ...finalStyle
        }}
        onClick={() => handleAnimalClick(index)}
        disabled={!clickable}
      >
        {getAnimalImage && (
          <img
            src={getAnimalImage(index)}
            alt={`Animal ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {hasSparkles && (
          <div className="animal-sparkles">
            {Array.from({length: 6}).map((_, i) => (
              <div 
                key={i} 
                className="animal-sparkle"
                style={{ 
                  '--delay': `${i * 0.1}s`,
                  '--color': ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'][i]
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        {/* Syllable label */}
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: alreadyClicked 
            ? 'rgba(76, 175, 80, 0.9)' 
            : isNextExpected 
            ? 'rgba(76, 175, 80, 0.9)' 
            : 'rgba(255, 255, 255, 0.95)',
          color: alreadyClicked || isNextExpected ? 'white' : '#333',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}>
          {syllable.toUpperCase()}
        </div>
        
        {alreadyClicked && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            color: '#4CAF50'
          }}>
            ✓
          </div>
        )}
        
        {isNextExpected && !alreadyClicked && (
          <div style={{
            position: 'absolute',
            bottom: '-45px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            Click me next!
          </div>
        )}
      </button>
    );
  };

  // Render object (singers - not clickable)
  const renderObject = (syllable, index) => {
    const glowState = objectGlow[syllable] || 'on_stone';
    const position = ELEMENT_DATA.nirvighnam.positions.objects[index];
    const transformed = isObjectTransformed(syllable);
    const hasSparkles = activeSparkles[`object-${syllable}`];
    const hasPermanentSparkles = activeSparkles[`object-${syllable}`] === 'permanent';
    
    const glowStyles = {
      on_stone: { 
        filter: 'brightness(0.9)', 
        opacity: 0.8,
        transform: 'translate(-50%, -50%) scale(1)'
      },
      singing: { 
        filter: 'brightness(1.4) drop-shadow(0 0 15px #FFD700)', 
        animation: 'objectGlow 0.6s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.1)',
        opacity: 1
      },
      transformed: {
        filter: 'brightness(1.3) saturate(1.4) drop-shadow(0 0 12px #8BC34A)',
        transform: 'translate(-50%, -50%) scale(1.05)',
        opacity: 1,
        animation: 'objectTransform 0.5s ease-out'
      },
      victory: { 
        filter: 'brightness(1.4) saturate(1.4) drop-shadow(0 0 15px #FFD700)',
        animation: 'objectVictory 1s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.1)',
        opacity: 1
      }
    };

    return (
      <div
        key={`object-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`object-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '60px',
          height: '60px',
          transition: 'all 0.3s ease',
          zIndex: 15,
          ...glowStyles[glowState]
        }}
      >
        {getObjectImage && (
          <img
            src={getObjectImage(index, transformed ? 1 : 0)}
            alt={`Object ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {/* FIXED: Permanent sparkles for transformed objects */}
        {(hasSparkles || hasPermanentSparkles) && (
          <div className="object-sparkles">
            {Array.from({length: 4}).map((_, i) => (
              <div 
                key={i} 
                className="object-sparkle"
                style={{ 
                  '--delay': `${i * 0.15}s`,
                  '--color': '#8BC34A',
                  animation: hasPermanentSparkles 
                    ? 'sparkleFloat 2s ease-in-out infinite' 
                    : 'sparkleFloat 1s ease-out forwards'
                }}
              >
                ✨
              </div>
            ))}
          </div>
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
        
        {transformed && (
          <div style={{
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#8BC34A',
            fontWeight: 'bold'
          }}>
            Moved!
          </div>
        )}
      </div>
    );
  };

  // Render stone
  const renderStone = (syllable, index) => {
    const position = ELEMENT_DATA.nirvighnam.positions.stones[index];
    const golden = isStoneGolden(syllable);
    
   const stoneStyle = {
  filter: 'none',
  animation: 'none',  // Remove animation completely
  transform: 'none'
};

    return (
      <div
        key={`stone-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`stone-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '180px',
          height: '180px',
          transition: 'all 0.3s ease',
          zIndex: 10,
          ...stoneStyle
        }}
      >
        {getStoneImage && (
          <img
            src={getStoneImage(index, golden ? 1 : 0)}
            alt={`${golden ? 'Golden' : 'Gray'} stone ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {golden && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'sparkleFloat 1s ease-in-out infinite'
          }}>
            ✨
          </div>
        )}
      </div>
    );
  };

  // Progress bar component
  const renderProgressBar = () => (
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
      
      {/* Reload Indicator */}
      {isReload && (
        <div style={{
          fontSize: '10px',
          color: '#4CAF50',
          fontWeight: 'bold',
          background: 'rgba(76, 175, 80, 0.15)',
          padding: '2px 6px',
          borderRadius: '8px',
          animation: 'fadeOut 4s ease-out forwards'
        }}>
          RESTORED
        </div>
      )}
      
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
          NIRVIGHNAM
        </div>
        
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2].map(round => (
            <div
              key={round}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: round <= currentRound 
                  ? (round < currentRound ? '#4CAF50' : '#8BC34A')
                  : '#ddd',
                transition: 'all 0.3s ease',
                boxShadow: round === currentRound ? '0 0 6px rgba(139, 195, 74, 0.4)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Sequence Syllables */}
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
                  ? '#4CAF50'
                  : 'linear-gradient(135deg, #8BC34A 0%, #4CAF50 100%)',
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

      {/* Progress Bar */}
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
            background: 'linear-gradient(90deg, #8BC34A 0%, #4CAF50 100%)',
            borderRadius: '2px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      )}

      {/* Golden Stones Counter */}
      {Object.values(permanentTransformations).filter(Boolean).length > 0 && (
        <div style={{
          fontSize: '10px',
          color: '#8BC34A',
          fontWeight: 'bold',
          background: 'rgba(139, 195, 74, 0.15)',
          padding: '3px 8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ✨ {Math.floor(Object.values(permanentTransformations).filter(Boolean).length / 2)} Cleared
        </div>
      )}
    </div>
  );

  if (!isActive) {
    return null;
  }

  return (
    <div className="nirvighnam-game" style={containerStyle}>
      
      {/* Progress Bar */}
      {!hideElements && renderProgressBar()}
      
      {/* Status Display */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isCountingDown 
            ? 'rgba(76, 175, 80, 0.95)' 
            : gamePhase === 'celebration'
            ? 'rgba(139, 195, 74, 0.95)'
            : gamePhase === 'error' || gamePhase === 'order_error'
            ? 'rgba(244, 67, 54, 0.95)'
            : 'rgba(76, 175, 80, 0.95)',
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

      {/* Countdown Display */}
      {!hideElements && isCountingDown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#4CAF50',
          textShadow: '0 0 30px rgba(76, 175, 80, 0.8)',
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Development Round Selector */}
      {!hideElements && (gamePhase === 'waiting' || gamePhase === 'animal_clicking') && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 45
        }}>
          <button onClick={() => jumpToRound(currentPhase, 1)} 
                  style={{fontSize: '10px', padding: '4px 8px', borderRadius: '10px'}}>
            Round 1
          </button>
          <button onClick={() => jumpToRound(currentPhase, 2)}
                  style={{fontSize: '10px', padding: '4px 8px', borderRadius: '10px'}}>
            Round 2
          </button>
        </div>
      )}

      {/* Game Elements */}
      {!hideElements && (
        <>
          {/* Animals (Clickable after sequence) */}
          {currentSequence.map((syllable, index) => {
            return renderAnimal(syllable, index);
          })}
          
          {/* Singing Objects (Display only) */}
          {currentSequence.map((syllable, index) => {
            return renderObject(syllable, index);
          })}
          
          {/* Stones */}
          {currentSequence.map((syllable, index) => {
            return renderStone(syllable, index);
          })}

          {/* Player Progress */}
          {canPlayerClick && (
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
              Animals Clicked: {playerInput.length} / {currentSequence.length}
              {comboStreak >= 2 && (
                <div style={{ fontSize: '10px', marginTop: '2px', color: '#C8E6C9' }}>
                  Path Clearing Combo: {comboStreak}x
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
        
        @keyframes animalBreath {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.02); }
        }
        
        @keyframes animalPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1.02); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes animalCelebrate {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1.08); }
          25% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.1); }
          75% { transform: translate(-50%, -50%) rotate(2deg) scale(1.1); }
        }
        
        @keyframes animalShimmer {
          0%, 100% { transform: translate(-50%, -50%) scale(1.05); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
        }
        
        @keyframes animalGlow {
          0%, 100% { 
            filter: brightness(1.2) saturate(1.4) drop-shadow(0 0 10px #4CAF50);
          }
          50% { 
            filter: brightness(1.4) saturate(1.6) drop-shadow(0 0 15px #8BC34A);
          }
        }
        
        @keyframes objectGlow {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes objectTransform {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes objectVictory {
          0%, 100% { transform: translate(-50%, -50%) scale(1.1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes stoneGolden {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes stoneDim {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(0.98); }
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
        
        .animal-sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .animal-sparkle {
          position: absolute;
          animation: sparkleFloat 1s ease-out forwards;
          animation-delay: var(--delay);
          color: var(--color);
          font-size: 16px;
          opacity: 0;
          left: 50%;
          top: 50%;
        }

        .object-sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .object-sparkle {
          position: absolute;
          animation-delay: var(--delay);
          color: var(--color);
          font-size: 12px;
          opacity: 0;
          left: 50%;
          top: 50%;
        }
        
        @keyframes sparkleFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + ${Math.random() * 60 - 30}px), 
              calc(-50% - ${Math.random() * 40 + 20}px)
            ) scale(1.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

// Container styles
const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

export default NirvighnamGame;