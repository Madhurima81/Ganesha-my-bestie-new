// zones/shloka-river/scenes/Scene1/components/SanskritMemoryGame.jsx
// ENHANCED: Improved reload functionality with better state management and cleanup

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
  
  // ENHANCED: Reload support props with better state management
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentPhase = 'vakratunda',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialSequenceItemsShown = 0,
  initialPermanentlyBloomed = {},
  initialComboStreak = 0,
  initialMistakeCount = 0,
  phaseJustCompleted = false,
  lastCompletedPhase = null,
  gameJustCompleted = false,
    initialIsCountingDown = false,    // ADD THIS
  initialCountdown = 0,             // ADD THIS

    // ADD THIS LINE:
  forcePhase = null,
  

  // Assets - passed from parent component
  getLotusImage,
  getStoneImage, 
  getBabyElephantImage,
  getAdultElephantImage,
  
  // ENHANCED: Callback to save state for reload support
  onSaveGameState,
  
  // NEW: Callback for cleanup on component hide/unmount
  onCleanup

}) => {
  console.log('🎮 Enhanced SanskritMemoryGame render:', { 
    isActive, 
    hideElements,
    isReload,
    initialCurrentPhase,
    initialCurrentRound,
    powerGained,
    phaseJustCompleted,
    gameJustCompleted
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
  const [lastClickTime, setLastClickTime] = useState(0);

  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showInitialPlayButton, setShowInitialPlayButton] = useState(false);

  // Water spray state
  const [activeWaterSpray, setActiveWaterSpray] = useState(null);
  const [permanentlyBloomed, setPermanentlyBloomed] = useState({});
  const elementsRef = useRef({});

  // ENHANCED: Refs for better cleanup and state management
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

  // ENHANCED: Clear all timeouts and intervals
  const clearAllTimers = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // ENHANCED: Cleanup on unmount/hide with callback
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      console.log('🧹 SanskritMemoryGame: Component unmounting - cleaning up');
      isComponentMountedRef.current = false;
      clearAllTimers();
      
      // Cleanup global references
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
        delete window.sanskritMemoryGame.startMahakayaPhase;
        delete window.sanskritMemoryGame.clearCompletionState;
      }
      
      // Call cleanup callback if provided
      if (onCleanup) {
        onCleanup();
      }
    };
  }, []);

  // ENHANCED: Cleanup when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      console.log('🛑 SanskritMemoryGame: Component deactivated - clearing timers');
      clearAllTimers();
      setIsCountingDown(false);
      setIsSequencePlaying(false);
      
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
      }
    } else {
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = true;
      }
    }
  }, [isActive]);

  // ENHANCED: Save state for reload support with better data structure
  const saveGameState = (additionalState = {}) => {
    const currentState = {
      gamePhase,
      currentPhase,
      currentRound,
      playerInput,
      currentSequence,
      sequenceItemsShown,
      permanentlyBloomed,
      comboStreak,
      mistakeCount,
      hasGameStarted,
       isCountingDown,        // ADD THIS
    countdown,             // ADD THIS
      timestamp: Date.now(),
      ...additionalState
    };
    
    // Update ref for quick access
    currentStateRef.current = currentState;
    
    if (onSaveGameState) {
      onSaveGameState(currentState);
    }
  };

  // Register element positions for water spray targeting
  const registerElementPosition = (id, element) => {
    if (element && isComponentMountedRef.current) {
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
      console.log(`🔊 Playing syllable: ${syllable}`);
      
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

const startCountdownToSequence = () => {
  if (!isComponentMountedRef.current) return;
  
  console.log('⏱️ Starting automatic countdown to sequence');
  setIsCountingDown(true);
  setCountdown(3);
  
  // ADD THIS LINE:
  saveGameState({ isCountingDown: true, countdown: 3 });
  
  const countdownInterval = safeSetInterval(() => {
    setCountdown(prev => {
      const newCount = prev - 1;
      // ADD THIS LINE:
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

  // Dynamic elephant moods
  const updateElephantMoods = () => {
    if (!isComponentMountedRef.current) return;
    
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
    if (!isComponentMountedRef.current) return;
    
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

  // ENHANCED: Initialize game when activated or on reload with better state restoration
  useEffect(() => {
    if (!isActive) return;

if (isReload && (initialCurrentSequence.length > 0 || forcePhase)) {      
  console.log('🔄 RELOAD: Restoring Sanskrit game state');
      
      // Restore all state
      setCurrentPhase(initialCurrentPhase);
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);

      // FIXED: Better handling of celebration phase reload
if (initialGamePhase === 'celebration') {
  console.log('🎉 RELOAD: Was celebrating - resuming auto-continuation');
  setGamePhase('celebration');
  setCanPlayerClick(false);
  
  // Trigger auto-continuation after 2 seconds
  safeSetTimeout(() => {
    if (!isComponentMountedRef.current) return;
    
    if (initialCurrentRound < 3) {
      console.log(`➡️ AUTO-RESUME: Continuing to round ${initialCurrentRound + 1} of ${initialCurrentPhase}`);
      
      setRoundTransition(true);
      
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        const nextRound = initialCurrentRound + 1;
        const nextSequence = getSequenceForRound(initialCurrentPhase, nextRound);
        
        setCurrentRound(nextRound);
        setCurrentSequence(nextSequence);
        setPlayerInput([]);
        setGamePhase('waiting');
        setCanPlayerClick(false);
        setSequenceItemsShown(0);
        setRoundTransition(false);
        
        saveGameState({
          currentRound: nextRound,
          currentSequence: nextSequence,
          gamePhase: 'waiting',
          playerInput: []
        });
      }, 1500);
      
    } else {
      console.log('🏆 AUTO-RESUME: Completing phase after reload');
      handlePhaseComplete(initialCurrentPhase);
    }
  }, 2000);
  
} else {
  // Handle other phases normally  
  setGamePhase(initialGamePhase);
  setCanPlayerClick(initialGamePhase === 'listening');
}

      setPermanentlyBloomed(initialPermanentlyBloomed || {});
      setComboStreak(initialComboStreak || 0);
      setMistakeCount(initialMistakeCount || 0);
      setHasGameStarted(true); // Always true on reload

        // ADD THESE LINES FOR COUNTDOWN RELOAD:
  setIsCountingDown(initialIsCountingDown);
  setCountdown(initialCountdown);

    // IF WE WERE COUNTING DOWN, RESTART THE COUNTDOWN
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
          handlePhaseComplete(lastCompletedPhase);
        }, 1000);
      }
      
    } else {
      console.log('🆕 NEW GAME: Starting Vakratunda phase immediately');
      const sequence = getSequenceForRound('vakratunda', 1);
      setCurrentPhase('vakratunda');
      setCurrentRound(1);
      setCurrentSequence(sequence);
      setHasGameStarted(true);
      setPermanentlyBloomed({});
      setComboStreak(0);
      setMistakeCount(0);
      
      // Save initial state
      saveGameState({
        gamePhase: 'waiting',
        currentPhase: 'vakratunda',
        currentRound: 1,
        currentSequence: sequence,
        playerInput: [],
        sequenceItemsShown: 0,
        permanentlyBloomed: {},
        comboStreak: 0,
        mistakeCount: 0,
        hasGameStarted: true
      });
    }
}, [isActive, isReload, forcePhase]);

  // ENHANCED: Auto-start logic with better state management
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

  // ENHANCED: Mahakaya phase starter with better integration
  const startMahakayaPhase = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('🐘 Starting Mahakaya phase - direct game start');
    
    const nextSequence = getSequenceForRound('mahakaya', 1);
    
    // Clear all timers before phase transition
    clearAllTimers();
    
    // Update state
    setCurrentPhase('mahakaya');
    setCurrentRound(1);
    setCurrentSequence(nextSequence);
    setPlayerInput([]);
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    setComboStreak(0);
    setPermanentlyBloomed({});
    
    saveGameState({
      currentPhase: 'mahakaya',
      currentRound: 1,
      currentSequence: nextSequence,
      gamePhase: 'waiting',
      playerInput: [],
      phaseJustCompleted: false
    });
  };

  // ENHANCED: Global function exposure with better lifecycle management
  useEffect(() => {
    if (!isActive) return;
    
    // Ensure the global object exists
    if (!window.sanskritMemoryGame) {
      window.sanskritMemoryGame = {};
    }
    
    // Expose functions and set ready flag
    window.sanskritMemoryGame.startMahakayaPhase = startMahakayaPhase;
    window.sanskritMemoryGame.isReady = true;
    window.sanskritMemoryGame.clearCompletionState = () => {
      if (isComponentMountedRef.current) {
        setGamePhase('waiting');
        setSequenceItemsShown(0);
        console.log('🧹 Memory game completion state cleared');
      }
    };
    
    console.log('🌐 SanskritMemoryGame: Global functions exposed and ready flag set');
    
    // Cleanup on unmount or deactivation
    return () => {
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
        delete window.sanskritMemoryGame.startMahakayaPhase;
        delete window.sanskritMemoryGame.clearCompletionState;
        console.log('🧹 SanskritMemoryGame: Global functions cleaned up');
      }
    };
  }, [isActive]);

  // Play the syllable sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0 || !isComponentMountedRef.current) return;

    console.log('🎵 Playing syllable sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    setSingingSyllable(null);
    
    saveGameState({ gamePhase: 'playing' });
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        console.log(`🔊 Playing syllable ${index + 1}/${currentSequence.length}: ${syllable}`);
        
        setSequenceItemsShown(index + 1);
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            setSingingSyllable(null);
          }
        }, 600);
        
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            if (isComponentMountedRef.current) {
              setIsSequencePlaying(false);
              setGamePhase('listening');
              setCanPlayerClick(true);
              saveGameState({ gamePhase: 'listening' });
              console.log('👂 Sequence complete, player can now click elephants');
            }
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Trigger water spray effect on correct click
  const triggerWaterSpray = (syllableIndex) => {
    if (!WaterSprayComponent || !isComponentMountedRef.current) return;
    
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
        if (isComponentMountedRef.current) {
          setActiveWaterSpray(null);
        }
      }, 1500);
      
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setPermanentlyBloomed(prev => ({ ...prev, [targetId]: true }));
        }
      }, 800);
    }
  };

  // Success celebration with multiple effects
  const triggerSuccessCelebration = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('🎉 Triggering success celebration');
    
    // Water spray celebration for all syllables
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          triggerWaterSpray(index);
        }
      }, index * 200);
    });
    
    // Set celebration phase for animations
    setGamePhase('celebration');
    
    // Reset mistake count on success
    setMistakeCount(0);
    
    // Increment combo streak
    setComboStreak(prev => prev + 1);
  };

  // ENHANCED: Handle elephant click with better state management
  const handleElephantClick = (syllableIndex) => {
    const currentTime = Date.now();
    
    // Prevent rapid clicking and ensure component is active
    if (currentTime - lastClickTime < 300 || !isComponentMountedRef.current) {
      console.log('Click ignored - too fast or component unmounted!');
      return;
    }
    
    if (!canPlayerClick || isSequencePlaying) {
      console.log('Elephant click ignored - not ready');
      return;
    }

    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;

    // Sequential clicking validation
    const expectedIndex = playerInput.length;
    
    if (syllableIndex !== expectedIndex) {
      const expectedSyllable = currentSequence[expectedIndex];
      console.log(`❌ Wrong order! Expected syllable ${expectedIndex + 1} (${expectedSyllable}), but clicked syllable ${syllableIndex + 1} (${clickedSyllable})`);
      
      setGamePhase('order_error');
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setGamePhase('listening');
        }
      }, 1500);
      
      return;
    }

    setLastClickTime(currentTime);

    console.log(`✅ Player clicked elephant for syllable: ${clickedSyllable} (position ${syllableIndex + 1})`);
    
    playSyllableAudio(clickedSyllable);
    
    const newPlayerInput = [...playerInput, clickedSyllable];
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
  };

  // ENHANCED: Automatic sequence success with better flow control
  const handleSequenceSuccess = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log(`🎊 Round ${currentRound} of ${currentPhase} completed successfully!`);
    
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
      if (!isComponentMountedRef.current) return;
      
      if (currentRound < 3) {
        console.log(`➡️ AUTO-ADVANCE: Starting round ${currentRound + 1} of ${currentPhase}`);
        
        setRoundTransition(true);
        
        safeSetTimeout(() => {
          if (!isComponentMountedRef.current) return;
          
          const nextRound = currentRound + 1;
          const nextSequence = getSequenceForRound(currentPhase, nextRound);
          
          setCurrentRound(nextRound);
          setCurrentSequence(nextSequence);
          setPlayerInput([]);
          setGamePhase('waiting');
          setCanPlayerClick(false);
          setSequenceItemsShown(0);
          setRoundTransition(false);
          
          saveGameState({
            currentRound: nextRound,
            currentSequence: nextSequence,
            gamePhase: 'waiting',
            playerInput: []
          });
        }, 1500);
        
      } else {
        handlePhaseComplete(currentPhase);
      }
    }, 2000);
  };

  // ENHANCED: Handle phase completion with better state tracking
  const handlePhaseComplete = (completedPhase) => {
    if (!isComponentMountedRef.current) return;
    
    console.log(`🏆 Phase ${completedPhase} completed!`);
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
    
    // Only auto-advance for Mahakaya completion
    if (completedPhase === 'mahakaya') {
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        console.log('🎯 Game complete!');
        saveGameState({
          gameJustCompleted: true
        });
        
        if (onGameComplete) {
          onGameComplete();
        }
      }, 3000);
    }
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

  const shouldHighlightElephant = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const isElephantDisabled = (syllableIndex) => {
    if (!canPlayerClick) return true;
    const expectedIndex = playerInput.length;
    return syllableIndex !== expectedIndex;
  };

  const hasBeenClicked = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };

  // Dynamic status messages
  const getStatusMessage = () => {
    if (roundTransition) return `Preparing Round ${currentRound + 1}...`;
    if (gamePhase === 'transition') return 'Starting new phase...';
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen carefully to the sacred sounds...';
    if (gamePhase === 'listening') return `Repeat the sequence! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return comboStreak >= 3 ? 'Amazing streak! Perfect!' : 'Excellent! Well done!';
    if (gamePhase === 'phase_complete') return '';
    if (gamePhase === 'error') return mistakeCount >= 3 ? 'Take your time, listen more carefully...' : 'Try again!';
    if (gamePhase === 'order_error') return 'Click the elephants in order!';
    return `Round ${currentRound} - ${currentPhase.toUpperCase()}`;
  };

  // Quick jump to round (for testing/development)
  const jumpToRound = (phase, round) => {
    if (!isComponentMountedRef.current) return;
    
    const newSequence = getSequenceForRound(phase, round);
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

  // Integrated progress bar component
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
      
      {/* Reload Indicator */}
      {isReload && (
        <div style={{
          fontSize: '10px',
          color: '#2196F3',
          fontWeight: 'bold',
          background: 'rgba(33, 150, 243, 0.15)',
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

  // Render functions for elephants and lotus/stones (implementation continues as before...)
  const renderElephant = (syllable, index) => {
    const mood = elephantMoods[syllable] || 'idle';
    const position = phaseData.positions.clickers[index];
    const clickable = isClickable(index);
    const getImage = currentPhase === 'vakratunda' ? getBabyElephantImage : getAdultElephantImage;
    
    const isNextExpected = shouldHighlightElephant(index);
    const isDisabled = isElephantDisabled(index);
    const alreadyClicked = hasBeenClicked(index);
    
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

    let finalStyle = { ...moodStyles[mood] };
    
    if (alreadyClicked) {
      finalStyle.filter = 'brightness(0.8)';
      finalStyle.opacity = 1;
    } else if (isNextExpected) {
      finalStyle.filter = 'brightness(1.05) drop-shadow(0 0 3px #e6c715ff)';
      finalStyle.animation = 'none';
    } else if (isDisabled) {
      finalStyle.filter = 'brightness(0.75) saturate(0.7) grayscale(0.2)';
      finalStyle.opacity = 0.65;
    }

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
          cursor: (clickable && !isDisabled) ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          zIndex: 20,
          ...finalStyle
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable || isDisabled}
      >
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${currentPhase === 'vakratunda' ? 'Baby' : 'Adult'} Elephant ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        <div style={{
          position: 'absolute',
          bottom: '85px',
          left: '60%',
          transform: 'translateX(-50%)',
          background: alreadyClicked 
            ? 'rgba(76, 175, 80, 0.9)' 
            : isNextExpected 
            ? 'rgba(255, 215, 0, 0.9)' 
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
            fontSize: '24px',
            color: '#4CAF50'
          }}>
            ✓
          </div>
        )}
        
        {isNextExpected && !alreadyClicked && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(208, 148, 29, 0.8)',
            color: '#fefcf0ff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            Click me next!
          </div>
        )}
        
        {isDisabled && !alreadyClicked && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '10px'
          }}>
            Wait...
          </div>
        )}
      </button>
    );
  };

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
      
      {/* Progress Bar */}
      {!hideElements && renderIntegratedProgressBar()}
      
      {/* Status Display */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isCountingDown 
            ? 'rgba(255, 152, 0, 0.95)' 
            : gamePhase === 'celebration'
            ? 'rgba(76, 175, 80, 0.95)'
            : gamePhase === 'error' || gamePhase === 'order_error'
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

      {/* Countdown Display */}
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

      {/* Development Round Selector */}
      {!hideElements && (gamePhase === 'waiting' || gamePhase === 'listening') && process.env.NODE_ENV === 'development' && (
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
          <button onClick={() => jumpToRound(currentPhase, 3)}
                  style={{fontSize: '10px', padding: '4px 8px', borderRadius: '10px'}}>
            Round 3
          </button>
        </div>
      )}

      {/* Game Elements */}
      {!hideElements && ((currentPhase === 'vakratunda') || (currentPhase === 'mahakaya' && powerGained)) && (
        <>
          {/* Singing Elements */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderLotusOrStone(syllable, index);
          })}
          
          {/* Clickable Elephants */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderElephant(syllable, index);
          })}

          {/* Player Progress */}
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

export default SanskritMemoryGame;