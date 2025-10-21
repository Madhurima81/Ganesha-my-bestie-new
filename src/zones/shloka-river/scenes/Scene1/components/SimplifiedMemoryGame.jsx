// SimplifiedMemoryGame.jsx - Enhanced with thorough state cleanup and improved UI
// Pattern: Elephants sing → Player clicks same elephants → Visual rewards transform

import React, { useState, useEffect, useRef } from 'react';

// Game configuration - syllable sequences for each phase and round
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

// Element positioning for both phases
const ELEMENT_POSITIONS = {
  vakratunda: {
    elephants: [
      { left: '20%', top: '60%' },  // Baby elephant va
      { left: '40%', top: '65%' },  // Baby elephant kra
      { left: '60%', top: '58%' },  // Baby elephant tun
      { left: '80%', top: '62%' }   // Baby elephant da
    ],
    visuals: [
      { left: '25%', top: '30%' },  // Bud/Lotus va
      { left: '45%', top: '35%' },  // Bud/Lotus kra
      { left: '65%', top: '28%' },  // Bud/Lotus tun
      { left: '85%', top: '32%' }   // Bud/Lotus da
    ]
  },
  mahakaya: {
    elephants: [
      { left: '20%', top: '60%' },  // Adult elephant ma
      { left: '40%', top: '65%' },  // Adult elephant ha
      { left: '60%', top: '58%' },  // Adult elephant ka
      { left: '80%', top: '62%' }   // Adult elephant ya
    ],
    visuals: [
      { left: '25%', top: '30%' },  // Seed/Flower ma
      { left: '45%', top: '35%' },  // Seed/Flower ha
      { left: '65%', top: '28%' },  // Seed/Flower ka
      { left: '85%', top: '32%' }   // Seed/Flower ya
    ]
  }
};

const SimplifiedMemoryGame = ({
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Asset functions for both phases
  getBabyElephantImage,    // (index) -> baby elephant images (vakratunda)
  getAdultElephantImage,   // (index) -> adult elephant images (mahakaya)
  getBudImage,             // (index) -> bud images (vakratunda initial)
  getLotusImage,           // (index) -> lotus images (vakratunda reward)
  getSeedImage,            // (index) -> seed images (mahakaya initial)
  getFlowerImage,          // (index) -> flower images (mahakaya reward)
  
  // Audio functions
  isAudioOn = true,
  playAudio,
  
  // State saving
  onSaveGameState,
  
  // Reload support
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentPhase = 'vakratunda',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialVisualRewards = {},
  initialActivatedElephants = {},
  
  // Phase control
  powerGained = false, // For mahakaya phase activation
forceReset = false // ADD THIS LINE
}) => {

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentPhase, setCurrentPhase] = useState('vakratunda');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  
  // Visual state - handles both bud→lotus and seed→flower
  const [visualRewards, setVisualRewards] = useState({});           // Which rewards have appeared
  const [activatedElephants, setActivatedElephants] = useState({}); // Which elephants are permanently learned
  const [roundClicks, setRoundClicks] = useState({});              // Current round click tracking
  
  // Animation state
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Refs for cleanup
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  // ENHANCED: Comprehensive timer cleanup - CRITICAL for phase transitions
  const clearAllTimers = () => {
    console.log('🧹 Clearing all timers for clean state transition');
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // Safe timeout with cleanup
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Safe interval with cleanup
  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  // ENHANCED: Cleanup on unmount with thorough timer clearing
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      console.log('🧹 SimplifiedMemoryGame: Component unmounting - cleaning up thoroughly');
      isComponentMountedRef.current = false;
      clearAllTimers();
      
      // Cleanup global references
      if (window.simplifiedMemoryGame) {
        window.simplifiedMemoryGame.isReady = false;
        delete window.simplifiedMemoryGame.startMahakayaPhase;
      }
    };
  }, []);

  // Audio functions for both phases
  const playSyllableAudio = (syllable) => {
    if (!isAudioOn || !playAudio) return;
    
    const syllableFiles = {
      // Vakratunda syllables
      'va': 'vakratunda-va',
      'kra': 'vakratunda-kra', 
      'tun': 'vakratunda-tun',
      'da': 'vakratunda-da',
      // Mahakaya syllables
      'ma': 'mahakaya-ma',
      'ha': 'mahakaya-ha',
      'ka': 'mahakaya-ka',
      'ya': 'mahakaya-ya'
    };
    
    const fileName = syllableFiles[syllable];
    if (fileName) {
      playAudio(`/audio/syllables/${fileName}.mp3`);
    }
  };

  // Game logic functions
  const getSequenceForRound = (phase, round) => {
    return SYLLABLE_SEQUENCES[phase][round] || [];
  };

  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(currentPhase, roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({}); // Reset round clicks but keep permanent state
    setGamePhase('waiting');
    setCanPlayerClick(false);
    
    console.log(`Starting ${currentPhase} round ${roundNumber}:`, sequence);
    
    // Save state
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase: 'waiting',
        currentPhase,
        currentRound: roundNumber,
        currentSequence: sequence,
        playerInput: [],
        visualRewards,
        activatedElephants
      });
    }
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          playSequence();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  const playSequence = () => {
    if (currentSequence.length === 0) return;
    
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSingingSyllable(null);
    
    // Play each syllable with timing
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        // Clear singing state after syllable
        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);
        
        // After last syllable, enable clicking
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            console.log('Sequence complete - ready for clicks');
          }, 800);
        }
      }, index * 1200);
    });
  };

  const handleElephantClick = (syllableIndex) => {
    if (!canPlayerClick || isSequencePlaying) return;
    
    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;
    
    // Check if already clicked this round
    if (roundClicks[`elephant-${clickedSyllable}`]) {
      console.log('Already clicked this round');
      return;
    }
    
    // Sequential clicking - must click in order
    const expectedIndex = playerInput.length;
    if (syllableIndex !== expectedIndex) {
      console.log(`Wrong order! Expected index ${expectedIndex}, clicked ${syllableIndex}`);
      return;
    }
    
    console.log(`Clicked ${currentPhase} elephant: ${clickedSyllable}`);
    
    // Play audio
    playSyllableAudio(clickedSyllable);
    
    // Update state
    const newPlayerInput = [...playerInput, clickedSyllable];
    setPlayerInput(newPlayerInput);
    setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
    setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
    
    // Transform visual reward (bud→lotus or seed→flower)
    setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));
    
    // Check if round complete
    if (newPlayerInput.length === currentSequence.length) {
      handleRoundSuccess();
    }
  };

  const handleRoundSuccess = () => {
    setCanPlayerClick(false);
    setGamePhase('celebration');
    
    console.log(`${currentPhase} round ${currentRound} complete!`);
    
    // Auto-advance to next round or complete phase
    safeSetTimeout(() => {
      if (currentRound < 3) {
        startNewRound(currentRound + 1);
      } else {
        handlePhaseComplete();
      }
    }, 2000);
  };

  const handlePhaseComplete = () => {
    setGamePhase('phase_complete');
    console.log(`${currentPhase} phase completed!`);
    
    if (onPhaseComplete) {
      onPhaseComplete(currentPhase);
    }
    
    // Auto-start Mahakaya if Vakratunda is complete and power gained
    if (currentPhase === 'vakratunda' && onGameComplete) {
      // Let parent handle phase transition
    } else if (currentPhase === 'mahakaya' && onGameComplete) {
      onGameComplete();
    }
  };

  // ENHANCED: Start Mahakaya phase with comprehensive state cleanup
  const startMahakayaPhase = () => {
    console.log('🔥 STARTING MAHAKAYA PHASE - COMPREHENSIVE RESET 🔥');
    
    // CRITICAL: Clear all timers first to prevent interference
    clearAllTimers();
    
    // Complete state reset - more thorough than before
    setCurrentPhase('mahakaya');
    setCurrentRound(1);
    setPlayerInput([]);
    setRoundClicks({});
    setVisualRewards({});
    setActivatedElephants({});
    setIsSequencePlaying(false);
    setCanPlayerClick(false);
    setSingingSyllable(null);
    setCountdown(0);
    setIsCountingDown(false);
    setGamePhase('waiting');
    
    // Get sequence and set it
    const sequence = getSequenceForRound('mahakaya', 1);
    console.log('Mahakaya sequence:', sequence);
    setCurrentSequence(sequence);
    
    // Immediate state save with complete clean state
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase: 'waiting',
        currentPhase: 'mahakaya',
        currentRound: 1,
        currentSequence: sequence,
        playerInput: [],
        visualRewards: {},
        activatedElephants: {}
      });
    }
    
    console.log('✅ Mahakaya phase initialized with clean state');
  };

  // Expose global function for parent to call
  useEffect(() => {
    if (!isActive) return;
    
    console.log('🎮 Setting up global functions for SimplifiedMemoryGame');
    
    if (!window.simplifiedMemoryGame) {
      window.simplifiedMemoryGame = {};
    }
    
    window.simplifiedMemoryGame.startMahakayaPhase = startMahakayaPhase;
    window.simplifiedMemoryGame.isReady = true;
    
    console.log('✅ Global function registered:', typeof window.simplifiedMemoryGame.startMahakayaPhase);
    
    return () => {
      console.log('🧹 Cleaning up global functions');
      if (window.simplifiedMemoryGame) {
        window.simplifiedMemoryGame.isReady = false;
        delete window.simplifiedMemoryGame.startMahakayaPhase;
      }
    };
  }, [isActive, startMahakayaPhase]);

  // Expose game phase for parent UI updates (like EarsRhythmGame)
useEffect(() => {
  if (!isActive) return;
  
  if (!window.simplifiedMemoryGame) {
    window.simplifiedMemoryGame = {};
  }
  
  // Expose current game phase
  window.simplifiedMemoryGame.gamePhase = gamePhase;
  
  console.log('📊 Game phase exposed:', gamePhase);
}, [isActive, gamePhase]);

// Initialize game
useEffect(() => {
  if (!isActive) return;
  
  // CHECK FOR FORCE RESET FIRST
  if (forceReset || (window.simplifiedMemoryGame && window.simplifiedMemoryGame.isForceReset)) {
    console.log('🔥 FORCE RESET: Starting completely fresh, clearing all visual rewards');
    
    // Clear the force reset flag
    if (window.simplifiedMemoryGame) {
      window.simplifiedMemoryGame.isForceReset = false;
    }
    
    // COMPLETE STATE RESET
    setCurrentPhase('vakratunda');
    setCurrentRound(1);
    setPlayerInput([]);
    setRoundClicks({});
    setVisualRewards({}); // CLEAR ALL REWARDS - this makes buds show instead of lotus
    setActivatedElephants({});
    setIsSequencePlaying(false);
    setCanPlayerClick(false);
    setSingingSyllable(null);
    setCountdown(0);
    setIsCountingDown(false);
    setGamePhase('waiting');
    
    const sequence = getSequenceForRound('vakratunda', 1);
    setCurrentSequence(sequence);
    
    console.log('🔥 FORCE RESET COMPLETE: All visual rewards cleared, buds will show');
    return;
  }
  
  console.log('🎯 INITIALIZING SimplifiedMemoryGame:', { 
    isReload, 
    initialCurrentPhase, 
    initialCurrentRound,
    hasValidReloadData: !!(isReload && initialCurrentPhase && initialCurrentSequence?.length > 0)
  });
  
  if (isReload && initialCurrentPhase && initialCurrentSequence?.length > 0) {
    // Only restore state if we have valid reload data
    console.log('📂 Restoring game state:', { initialCurrentPhase, initialCurrentRound });
    setCurrentPhase(initialCurrentPhase);
    setCurrentRound(initialCurrentRound);
    setCurrentSequence(initialCurrentSequence);
    setPlayerInput(initialPlayerInput);
    setGamePhase(initialGamePhase);
    setVisualRewards(initialVisualRewards || {});
    setActivatedElephants(initialActivatedElephants || {});
    
    // Rebuild round clicks from player input
    const clicks = {};
    initialPlayerInput.forEach(syllable => {
      clicks[`elephant-${syllable}`] = true;
    });
    setRoundClicks(clicks);
    
  } else {
    // Start new game - always start with Vakratunda
    console.log('🆕 Starting fresh game - Vakratunda phase');
    setCurrentPhase('vakratunda');
    startNewRound(1);
  }
}, [isActive, isReload, forceReset]); // ADD forceReset to dependencies

  // Auto-start countdown when waiting
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => {
        startCountdown();
      }, 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // Helper functions
  const isElephantSinging = (syllable) => {
    return singingSyllable === syllable;
  };

  const isElephantClickable = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const hasElephantBeenClicked = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };

  const isElephantActivated = (syllable) => {
    return activatedElephants[`elephant-${syllable}`];
  };

  const isVisualRewardActive = (syllable) => {
    return visualRewards[`visual-${syllable}`];
  };

  const isNextExpected = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  // Round jumping function
  const jumpToRound = (round) => {
    console.log(`Jumping to ${currentPhase} round ${round}`);
    startNewRound(round);
  };

  // Get current positions based on phase
  const getCurrentPositions = () => {
    return ELEMENT_POSITIONS[currentPhase];
  };

  // Render functions
  const renderElephant = (syllable, index) => {
    const positions = getCurrentPositions();
    const position = positions.elephants[index];
    const isSinging = isElephantSinging(syllable);
    const isClickable = isElephantClickable(index);
    const hasBeenClicked = hasElephantBeenClicked(index);
    const isActivated = isElephantActivated(syllable);
    const isNext = isNextExpected(index);
    
    // Enhanced visual states with glow effects
    let elephantStyle = {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'all 0.3s ease'
    };
    
    if (isSinging) {
      elephantStyle.transform = 'translate(-50%, -50%) scale(1.15)';
      elephantStyle.filter = 'brightness(1.4) drop-shadow(0 0 15px #FFD700)';
      elephantStyle.animation = 'sing 0.6s ease-in-out';
    } else if (isNext && !hasBeenClicked) {
      elephantStyle.filter = 'brightness(1.2) drop-shadow(0 0 8px #FF9800)';
      elephantStyle.animation = 'nextToClick 1.5s ease-in-out infinite';
    } else if (hasBeenClicked) {
      elephantStyle.opacity = 1;
      elephantStyle.filter = 'brightness(1.1) saturate(1.2)';
    } else if (isActivated && !hasBeenClicked) {
      elephantStyle.filter = 'brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(255, 183, 77, 0.4))';
      elephantStyle.animation = 'gentleGlow 3s ease-in-out infinite';
    } else if (!canPlayerClick) {
      elephantStyle.opacity = 0.6;
    }

    // Get correct elephant image based on phase
    const getElephantImage = () => {
      if (currentPhase === 'vakratunda') {
        return getBabyElephantImage ? getBabyElephantImage(index) : null;
      } else {
        return getAdultElephantImage ? getAdultElephantImage(index) : null;
      }
    };

    return (
      <button
        key={`elephant-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '120px',
          height: '120px',
          border: 'none',
          background: 'transparent',
          cursor: isClickable ? 'pointer' : 'default',
          zIndex: 20,
          borderRadius: '50%',
          ...elephantStyle
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!isClickable}
      >
        <img
          src={getElephantImage()}
          alt={`${currentPhase} elephant ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
        {/* Singing indicator */}
        {isSinging && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'musicNote 0.6s ease-in-out'
          }}>
            🎵
          </div>
        )}
        
        {/* ENHANCED: Golden circle for next click */}
        {isNext && !hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '85%',
            border: '2px solid #FFD700',
            borderRadius: '50%',
            animation: 'goldenPulse 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Golden crown for permanently learned */}
        {isActivated && !hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'crownFloat 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
          }}>
            👑
          </div>
        )}
        
        {/* Syllable label */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: hasBeenClicked 
            ? 'rgba(76, 175, 80, 0.9)' 
            : isNext
            ? 'rgba(255, 193, 7, 0.9)'
            : isActivated
            ? 'rgba(255, 183, 77, 0.9)'
            : (currentPhase === 'vakratunda' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(156, 39, 176, 0.9)'),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          {syllable.toUpperCase()}
        </div>
        
        {/* Success checkmark */}
        {hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
            animation: 'checkmarkAppear 0.5s ease-out'
          }}>
            ✓
          </div>
        )}
      </button>
    );
  };

  const renderInitialVisual = (syllable, index) => {
    const positions = getCurrentPositions();
    const position = positions.visuals[index];
    const isTransformed = isVisualRewardActive(syllable);
    
    // Don't show initial if already transformed
    if (isTransformed) return null;
    
    // Get correct initial image based on phase
    const getInitialImage = () => {
      if (currentPhase === 'vakratunda') {
        return getBudImage ? getBudImage(index) : null;
      } else {
        return getSeedImage ? getSeedImage(index) : null;
      }
    };

    return (
      <div
        key={`initial-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '60px',
          height: '60px',
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
          opacity: 0.7
        }}
      >
        <img
          src={getInitialImage()}
          alt={`${currentPhase === 'vakratunda' ? 'Bud' : 'Seed'} ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  };

  const renderVisualReward = (syllable, index) => {
    const positions = getCurrentPositions();
    const position = positions.visuals[index];
    const isVisible = isVisualRewardActive(syllable);
    
    if (!isVisible) return null;
    
    // Get correct reward image based on phase
    const getRewardImage = () => {
      if (currentPhase === 'vakratunda') {
        return getLotusImage ? getLotusImage(index) : null;
      } else {
        return getFlowerImage ? getFlowerImage(index) : null;
      }
    };
    
    return (
      <div
        key={`reward-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '80px',
          height: '80px',
          zIndex: 15,
          animation: 'rewardAppear 1s ease-out, rewardGlow 2s ease-in-out infinite 1s',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <img
          src={getRewardImage()}
          alt={`${currentPhase === 'vakratunda' ? 'Lotus' : 'Flower'} ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
        {/* Sparkle effect */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '18px',
          animation: 'sparkle 2s ease-in-out infinite'
        }}>
          ✨
        </div>
      </div>
    );
  };

  const getStatusMessage = () => {
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen carefully...';
    if (gamePhase === 'listening') return `Click the elephants! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return 'Beautiful! Well done!';
    if (gamePhase === 'phase_complete') return 'Phase Complete!';
    return `Round ${currentRound} - ${currentPhase.toUpperCase()}`;
  };

  if (!isActive) return null;

  // Don't show Mahakaya elements if power not gained
  const shouldShowElements = currentPhase === 'vakratunda' || (currentPhase === 'mahakaya' && powerGained);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 20
    }}>
      
      {/* ENHANCED: Progress indicator with better styling */}
      {!hideElements && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 40,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,215,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: currentPhase === 'vakratunda' ? '#FF9800' : '#9C27B0',
            letterSpacing: '0.3px'
          }}>
            {currentPhase.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3].map(round => (
              <div
                key={round}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: round <= currentRound 
                    ? (round < currentRound ? '#4CAF50' : (currentPhase === 'vakratunda' ? '#FF9800' : '#9C27B0'))
                    : '#E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: round <= currentRound ? 'white' : '#666',
                  boxShadow: round === currentRound ? '0 0 8px rgba(255, 152, 0, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {round}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENHANCED: Round Selector - Horizontal below status bar */}
      {!hideElements && (gamePhase === 'waiting' || gamePhase === 'listening') && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '20%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          zIndex: 45
        }}>
        
          {[1, 2, 3].map(round => (
            <button 
              key={round} 
              onClick={() => jumpToRound(round)} 
              style={{
                fontSize: '14px', 
                padding: '8px 12px', 
                borderRadius: '10px',
                background: round === currentRound 
                  ? (currentPhase === 'vakratunda' ? '#FF9800' : '#9C27B0')
                  : (currentPhase === 'vakratunda' ? 'rgba(255, 152, 0, 0.7)' : 'rgba(156, 39, 176, 0.7)'), 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '44px',
                minHeight: '44px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {round}
            </button>
          ))}
        </div>
      )}
      
      {/* Status message */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20%',
          transform: 'translateX(-50%)',
          background: currentPhase === 'vakratunda' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(156, 39, 176, 0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 50
        }}>
          {getStatusMessage()}
        </div>
      )}

      {/* Countdown */}
      {!hideElements && isCountingDown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '100px',
          fontWeight: 'bold',
          color: currentPhase === 'vakratunda' ? '#FF9800' : '#9C27B0',
          textShadow: '0 0 30px rgba(255, 152, 0, 0.8)',
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Game elements */}
      {!hideElements && shouldShowElements && (
        <>
          {/* Initial visual elements (buds/seeds) - show before transformation */}
          {currentSequence.map((syllable, index) => 
            renderInitialVisual(syllable, index)
          )}
          
          {/* Elephants - phase-specific with enhanced styling */}
          {currentSequence.map((syllable, index) => 
            renderElephant(syllable, index)
          )}
          
          {/* Visual rewards (lotus/flowers) - show after transformation */}
          {currentSequence.map((syllable, index) => 
            renderVisualReward(syllable, index)
          )}
        </>
      )}

      {/* ENHANCED: CSS Animations with golden effects */}
      <style>{`
        @keyframes sing {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes nextToClick {
          0%, 100% { 
            filter: brightness(1.2) drop-shadow(0 0 8px #FF9800);
          }
          50% { 
            filter: brightness(1.4) drop-shadow(0 0 15px #FFB74D);
          }
        }
        
        @keyframes gentleGlow {
          0%, 100% { 
            filter: brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(255, 183, 77, 0.4));
          }
          50% { 
            filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 12px rgba(255, 183, 77, 0.6));
          }
        }
        
        @keyframes goldenPulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        
        @keyframes crownFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
        
        @keyframes musicNote {
          0% { transform: translateX(-50%) translateY(0); opacity: 0; }
          50% { transform: translateX(-50%) translateY(-10px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        
        @keyframes checkmarkAppear {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes rewardAppear {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes rewardGlow {
          0%, 100% { 
            filter: brightness(1.3) saturate(1.4) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
          }
          50% { 
            filter: brightness(1.5) saturate(1.6) drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
          }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default SimplifiedMemoryGame;