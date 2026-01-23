// zones/shloka-river/core/AutoPlayMode.jsx
// FIXED: Preserves Manual Mode progress (completedRounds) and passes it back on exit

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';
import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';
import UnifiedHeader from './UnifiedHeader';

const getHeaderClassName = (gameConfig) => {
  const classNames = {
    'vakratunda': 'vakratunda-game-phase-header',
    'mahakaya': 'mahakaya-game-phase-header',
    'suryakoti': 'suryakoti-game-phase-header',
    'samaprabha': 'samaprabha-game-phase-header',
    'nirvighnam': 'nirvighnam-game-phase-header',
    'kurumedeva': 'kurumedeva-game-phase-header',
    'sarvakaryeshu': 'sarvakaryeshu-game-phase-header',
    'sarvada': 'sarvada-game-phase-header'
  };
  return classNames[gameConfig.id] || 'vakratunda-game-phase-header';
};

// Helper: Get dynamic instruction text based on clicker type
const getClickInstruction = (clickerType) => {
  const instructions = {
    'baby-elephant': 'Click the baby elephants!',
    'adult-elephant': 'Click the elephants!',
    'sun-orb': 'Click the suns!',
    'rainbow': 'Click the rainbows!',
    'animal': 'Click the animals!',
    'helper-animal': 'Click the helpers!'
  };
  return instructions[clickerType] || 'Click to play!';
};

// Helper: Get round word name from syllables
const getRoundWord = (gameConfig, roundNumber) => {
  const syllables = gameConfig.syllables[roundNumber];
  if (!syllables) return '';
  return syllables.join('').toUpperCase();
};

const AutoPlayMode = ({
  gameConfig,
  assetGetters,
  gamePrefix = 'default',
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  WaterSprayComponent,
  isReload = false,
  savedGameState = null,
  onSaveGameState
}) => {

  const { safeClick } = useSafeClick(300);

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  
  // Visual state
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});
  
  // Animation state
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);
  const [waitBannerMessage, setWaitBannerMessage] = useState('');
  const [showWaitBanner, setShowWaitBanner] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  
  // ⭐ NEW: Central synthesis states
  const [centralElementGlowing, setCentralElementGlowing] = useState(false);
  const [centralBloomProgress, setCentralBloomProgress] = useState(0); // 0 to 100
  
  // Refs
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // ⭐ NEW: Ref to hold Manual Mode progress so it doesn't get lost
  const manualProgressRef = useRef({
    completedRounds: [],
    learnedSyllables: []
  });

  // ⭐ NEW: Centralized Save Helper
  // This ensures we NEVER wipe out the completedRounds when saving Auto Mode state
  const saveGameStateHelper = (updates = {}) => {
    if (!onSaveGameState) return;

    const stateToSave = {
      gamePhase,
      currentRound,
      currentSequence,
      playerInput,
      visualRewards,
      activatedElephants,
      gameId: gameConfig.id,
      // ⭐ PASSTHROUGH: Always include the manual progress we captured
      completedRounds: manualProgressRef.current.completedRounds,
      learnedSyllables: manualProgressRef.current.learnedSyllables,
      ...updates
    };

    onSaveGameState(stateToSave);
  };

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) callback();
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) callback();
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  // Audio
  const playSyllableAudio = (syllable) => {
    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) return;
      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      audio.play().catch(e => console.log('Audio fallback:', e));
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const getSequenceForRound = (round) => gameConfig.syllables[round] || [];

  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({});
    setGamePhase('waiting');
    setCanPlayerClick(false);
    
    // ⭐ NEW: Reset central synthesis states
    setCentralElementGlowing(false);
    setCentralBloomProgress(0);
    
    // ⭐ UPDATED: Use helper to save
    saveGameStateHelper({
      gamePhase: 'waiting',
      currentRound: roundNumber,
      currentSequence: sequence,
      playerInput: [],
    });
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
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        safeSetTimeout(() => setSingingSyllable(null), 600);
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
          }, 800);
        }
      }, index * 1200);
    });
  };

  const triggerWaitBanner = (message) => {
    setWaitBannerMessage(message);
    setShowWaitBanner(true);
    safeSetTimeout(() => setShowWaitBanner(false), 1500);
  };

  const handlePause = () => {
    setShowPauseModal(true);
    clearAllTimers();
  };

  const handleContinue = () => {
    setShowPauseModal(false);
    if (gamePhase === 'listening') {
      setCanPlayerClick(true);
      setIsSequencePlaying(false);
    } else if (gamePhase === 'waiting') {
      startCountdown();
    } else if (gamePhase === 'playing') {
      playSequence();
    } else if (gamePhase === 'celebration' || gamePhase === 'success') {
       if (currentRound < Object.keys(gameConfig.syllables).length) {
          startNewRound(currentRound + 1);
          safeSetTimeout(() => startCountdown(), 500);
       } else {
          handlePhaseComplete();
       }
    }
  };

  const handleExitToMenu = () => {
    console.log('🎮 Exiting auto-play - returning progress:', manualProgressRef.current.completedRounds);
    
    setShowPauseModal(false);
    clearAllTimers();
    
    // Reset local auto state
    setGamePhase('waiting');
    setCurrentRound(1);
    setCurrentSequence([]);
    setPlayerInput([]);
    
    if (onPhaseComplete) {
      onPhaseComplete({
        // Return everything current
        learnedSyllables: Object.keys(visualRewards).map(key => key.replace('visual-', '')),
        visualRewards: visualRewards,
        activatedElephants: activatedElephants,
        // ⭐ CRITICAL: Pass the manual rounds back!
        completedRounds: manualProgressRef.current.completedRounds,
        isEarlyExit: true 
      });
    }
  };

  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (isCountingDown) { triggerWaitBanner('Wait! Get ready... ⏰'); return; }
      if (!canPlayerClick || isSequencePlaying) { triggerWaitBanner('Listen first! 👂'); return; }
      
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (roundClicks[`elephant-${clickedSyllable}`]) { triggerWaitBanner('Already clicked! 🐘'); return; }
      
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) { triggerWaitBanner('Click in order! 🎯'); return; }
      
      playSyllableAudio(clickedSyllable);

      if (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') {
        const position = gameConfig.elements.clicker.positions[syllableIndex];
        setWaterSprayPosition({ left: position.left, top: position.top });
        safeSetTimeout(() => setWaterSprayPosition(null), 1000);
      }

      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));
      
      // ⭐ NEW: Update central bloom progress instead of auto-completing
      if (newPlayerInput.length === currentSequence.length) {
        // Calculate final bloom percentage (just before glow state)
        const totalSyllables = currentSequence.length;
        const finalBloomBeforeGlow = totalSyllables === 2 ? 75 : 
                                      totalSyllables === 3 ? 75 : 
                                      90; // For 4 syllables
        
        setCentralBloomProgress(finalBloomBeforeGlow);
        
        // Make it glow and clickable
        safeSetTimeout(() => {
          setCentralElementGlowing(true);
        }, 500);
      } else {
        // Incremental bloom progress for each elephant click
        const totalSyllables = currentSequence.length;
        const progressPerClick = totalSyllables === 2 ? 50 : 
                                  totalSyllables === 3 ? 33 : 
                                  25; // For 4 syllables
        setCentralBloomProgress(newPlayerInput.length * progressPerClick);
      }
    });
  };

  // ⭐ NEW: Handle central synthesis element click
  const handleCentralElementClick = () => {
    safeClick(() => {
      if (!centralElementGlowing) return; // Only clickable when glowing
      
      console.log('🌸 Central element clicked - playing complete word audio');
      
      // ✅ Update playerInput to include lotus click (shows X/X progress)
      setPlayerInput([...currentSequence, 'lotus']);
      
      // Play complete word audio
      const completeWordAudio = gameConfig.audio.completeWordFile;
      if (completeWordAudio) {
        const audio = new Audio(completeWordAudio);
        audio.play().catch(e => console.error('Audio play error:', e));
      }
      
      // Bloom to 100%
      setCentralBloomProgress(100);
      setCentralElementGlowing(false);
      
      // Wait for audio/animation, then complete round
      safeSetTimeout(() => {
        handleRoundSuccess();
      }, 1500);
    });
  };

  const handleRoundSuccess = () => {
    setCanPlayerClick(false);
    setGamePhase('celebration');
    
    // Save progress on success (using helper)
    saveGameStateHelper({
        gamePhase: 'celebration',
        visualRewards,
        activatedElephants
    });

    safeSetTimeout(() => {
      const maxRound = Object.keys(gameConfig.syllables).length;
      if (currentRound < maxRound) {
        startNewRound(currentRound + 1);
      } else {
        handlePhaseComplete();
      }
    }, 2000);
  };

/*const handlePhaseComplete = () => {
  setGamePhase('phase_complete');
  if (onPhaseComplete) onPhaseComplete(gameConfig.id);
  if (onGameComplete) onGameComplete();
  
  // Keep completion data for CulturalProgressExtractor
  if (onSaveGameState) {
    onSaveGameState({
      gameId: gameConfig.id,
      gameMode: 'auto',
      gameState: null,
      currentRound: null,
      completedRounds: completedRounds,  // ⭐ KEEP
      learnedSyllables: learnedSyllables,  // ⭐ KEEP
      visualRewards: visualRewards  // ⭐ KEEP
    });
  }
};*/

const handlePhaseComplete = () => {
  setGamePhase('phase_complete');
  if (onPhaseComplete) onPhaseComplete(gameConfig.id);
  if (onGameComplete) onGameComplete();
};

// Initialization Effect
  useEffect(() => {
    if (!isActive || !gameConfig) return;
    if (hasInitializedRef.current) return;

    // ⭐ KEY: Capture manual progress immediately on mount!
    if (savedGameState) {
        if (savedGameState.completedRounds) {
            manualProgressRef.current.completedRounds = savedGameState.completedRounds;
            console.log('📥 [Auto] Captured manual rounds:', savedGameState.completedRounds);
        }
        if (savedGameState.learnedSyllables) {
            manualProgressRef.current.learnedSyllables = savedGameState.learnedSyllables;
        }
    }

 if (isReload && savedGameState && savedGameState.gameId === gameConfig.id && savedGameState.currentRound) {
      console.log('🔄 [Auto] Restoring saved auto state');
      
      // ⭐ SMART RELOAD: Only advance to next round if we're in celebration (between rounds)
      const isCurrentRoundComplete = savedGameState.gamePhase === 'celebration';
      
      const maxRound = Object.keys(gameConfig.syllables).length;
      const roundToStart = isCurrentRoundComplete && savedGameState.currentRound < maxRound
        ? savedGameState.currentRound + 1
        : savedGameState.currentRound;
      
      if (isCurrentRoundComplete && roundToStart > savedGameState.currentRound) {
        console.log(`🎯 [Auto] Round ${savedGameState.currentRound} complete - advancing to Round ${roundToStart}`);
        hasInitializedRef.current = true;
        startNewRound(roundToStart);
      } else {
        // Normal reload - restore exact state
        if (savedGameState.currentRound) setCurrentRound(savedGameState.currentRound);
        if (savedGameState.currentSequence) setCurrentSequence(savedGameState.currentSequence);
        if (savedGameState.playerInput) setPlayerInput(savedGameState.playerInput);
        if (savedGameState.gamePhase) setGamePhase(savedGameState.gamePhase);
        if (savedGameState.visualRewards) setVisualRewards(savedGameState.visualRewards);
        if (savedGameState.activatedElephants) setActivatedElephants(savedGameState.activatedElephants);
        
        const clicks = {};
        (savedGameState.playerInput || []).forEach(syllable => {
          clicks[`elephant-${syllable}`] = true;
        });
        setRoundClicks(clicks);
        
        hasInitializedRef.current = true;
      }
    } else {
      console.log('🆕 [Auto] Starting fresh from Round 1');
      hasInitializedRef.current = true;
      startNewRound(1); 
    }
  }, [isActive, gameConfig]);
  
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => startCountdown(), 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // Renderers & UI Helpers...
  const isElephantSinging = (syllable) => singingSyllable === syllable;
  const isElephantClickable = (index) => canPlayerClick && index === playerInput.length;
  const hasElephantBeenClicked = (index) => index < playerInput.length;
  const isElephantActivated = (syllable) => activatedElephants[`elephant-${syllable}`];
  const isVisualRewardActive = (syllable) => visualRewards[`visual-${syllable}`];
  const isNextExpected = (index) => canPlayerClick && index === playerInput.length;

  /*const getPosition = (type, index) => {
    return type === 'elephant' ? gameConfig.elements.clicker.positions[index] : gameConfig.elements.singer.positions[index];
  };*/

const renderElephant = (syllable, index) => {
  // ⭐ ADD THIS SAFETY CHECK
  if (!assetGetters) {
    console.error('❌ assetGetters is undefined in AutoPlayMode for game:', gameConfig?.id);
    return null;
  }
  
  const position = gameConfig.elements.clicker?.positions?.[index] || { left: '50%', top: '50%' };
  let getImage;
  if (gameConfig.elements.clicker.assetGetters) {
    // Syllable-specific assets
    getImage = assetGetters[gameConfig.elements.clicker.assetGetters[syllable]];
  } else if (gameConfig.elements.clicker.assetGetter) {
    // Single asset for all
    getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
  }
    if (!getImage) return null;

    const clickable = isElephantClickable(index);
    const clicked = hasElephantBeenClicked(index);
    const singing = isElephantSinging(syllable);
    const activated = isElephantActivated(syllable);
    const next = isNextExpected(index);

    return (
      <button
        key={`elephant-${syllable}`}
                className={`${gamePrefix}-clicker-element`}  // ← ADD THIS LINE

        style={{
          position: 'absolute',
          //left: position.left,
          //top: position.top,
          //width: '120px', height: '120px',
          border: 'none', background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          zIndex: 20, borderRadius: '50%',
          opacity: clickable || clicked ? 1 : 0.6,
          transform:  + (singing ? 'scale(1.15)' : 'scale(1)'),
          filter: singing ? 'brightness(1.4) drop-shadow(0 0 15px #FFD700)' : 
                  next && !clicked ? 'brightness(1.2) drop-shadow(0 0 8px #FF9800)' : 
                  'none',
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable}
      >
        <img src={getImage(index)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {singing && <div style={{ position: 'absolute', top: '-20px', left: '50%', fontSize: '20px', animation: 'musicNote 0.6s' }}>🎵</div>}
        {next && !clicked && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '85%', height: '85%', border: '2px solid #FFD700', borderRadius: '50%', animation: 'goldenPulse 2s infinite' }} />}
        {next && !clicked && <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#FFD700', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', zIndex: 30 }}>👆 Tap Here</div>}
        {activated && !clicked && <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', animation: 'crownFloat 2s infinite' }}>👑</div>}
        <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', background: clicked ? '#4CAF50' : next ? '#FFC107' : '#999', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{syllable.toUpperCase()}</div>
        {clicked && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', background: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div>}
      </button>
    );
  };

  const renderInitialVisual = (syllable, index) => {
    if (!gameConfig.elements.singer?.positions) return null;
    if (isVisualRewardActive(syllable)) return null;
    
    let getImage;
    if (gameConfig.elements.singer.assetGetterInitial) getImage = assetGetters[gameConfig.elements.singer.assetGetterInitial];
    else if (gameConfig.elements.singer.assetGettersInitial) getImage = assetGetters[gameConfig.elements.singer.assetGettersInitial[syllable]];
    
    if (!getImage) return null;
    const position = gameConfig.elements.singer.positions[index];
    
    return (
      <div key={`initial-${syllable}`} style={{ position: 'absolute', left: position.left, top: position.top, width: '60px', height: '60px', zIndex: 10, transform: 'translate(-50%, -50%)', opacity: 0.7 }}>
        <img src={getImage(index)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  };

  const renderVisualReward = (syllable, index) => {
    if (!gameConfig.elements.singer?.positions) return null;
    if (!isVisualRewardActive(syllable)) return null;
    
    let getImage;
    if (gameConfig.elements.singer.assetGetterReward) getImage = assetGetters[gameConfig.elements.singer.assetGetterReward];
    else if (gameConfig.elements.singer.assetGettersReward) getImage = assetGetters[gameConfig.elements.singer.assetGettersReward[syllable]];
    
    if (!getImage) return null;
    
    const position = gameConfig.elements.singer.positionsReward ? gameConfig.elements.singer.positionsReward[index] : gameConfig.elements.singer.positions[index];
    
    return (
      <div key={`reward-${syllable}`} style={{ position: 'absolute', left: position.left, top: position.top, width: '80px', height: '80px', zIndex: 15, animation: 'rewardAppear 1s, rewardGlow 2s infinite', transform: 'translate(-50%, -50%)' }}>
        <img src={getImage(index)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        <div style={{ position: 'absolute', top: '-10px', left: '50%', fontSize: '18px', animation: 'sparkle 2s infinite' }}>✨</div>
      </div>
    );
  };

  const renderDualInitials = (syllable, index) => {
    if (isVisualRewardActive(syllable)) return null;
    if (!gameConfig.elements.rewards?.animals) return null;
    const stonePos = gameConfig.elements.rewards.stones.positionsInitial[index];
    const getStone = assetGetters[gameConfig.elements.rewards.stones.assetGettersInitial[syllable]];
    const getAnimal = assetGetters[gameConfig.elements.rewards.animals.assetGetters[syllable]];
    return (
      <React.Fragment key={`dual-init-${syllable}`}>
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 10, transform: 'translate(-50%, -50%)', opacity: 0.8 }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
        {getAnimal && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '70px', height: '70px', zIndex: 11, transform: 'translate(-50%, -50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /></div>}
      </React.Fragment>
    );
  };

  const renderDualRewards = (syllable, index) => {
    if (!isVisualRewardActive(syllable)) return null;
    if (!gameConfig.elements.rewards?.animals) return null;
    const animalPos = gameConfig.elements.rewards.animals.positions[index];
    const getAnimal = assetGetters[gameConfig.elements.rewards.animals.assetGetters[syllable]];
    const stonePos = gameConfig.elements.rewards.stones.positionsReward[index];
    const getStone = assetGetters[gameConfig.elements.rewards.stones.assetGettersReward[syllable]];
    return (
      <React.Fragment key={`dual-rew-${syllable}`}>
        {getAnimal && <div style={{ position: 'absolute', left: animalPos.left, top: animalPos.top, width: '80px', height: '80px', zIndex: 15, animation: 'rewardAppear 1s', transform: 'translate(-50%, -50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /><div style={{position:'absolute',top:'-10px',right:'-10px'}}>✨</div></div>}
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 12, animation: 'rewardAppear 1s', transform: 'translate(-50%, -50%)' }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
      </React.Fragment>
    );
  };

// ⭐ NEW: Render previous completed central elements
const renderPreviousCentralElements = () => {
  if (!gameConfig.elements.centralSynthesis?.showPreviousRounds) return null;
  if (!currentRound || currentRound === 1) return null;  // ⭐ Changed from selectedRound to currentRound
  
  const previousElements = [];
  
  for (let round = 1; round < currentRound; round++) {  // ⭐ Changed from selectedRound to currentRound
    const position = gameConfig.elements.centralSynthesis.positions[round - 1];
    
    // Get the reward image for this round
    let getRewardImage;
    const rewardGetters = gameConfig.elements.centralSynthesis.assetGettersByRound;
    
    if (rewardGetters && rewardGetters[round]) {
      // Round-specific getter (Nirvighnam, Kurumedeva)
      getRewardImage = assetGetters[rewardGetters[round].reward];
    } else {
      // Single getter for all rounds (other games)
      const singleGetter = gameConfig.elements.centralSynthesis.assetGetterReward;
      if (singleGetter) {
        getRewardImage = assetGetters[singleGetter];
      }
    }
    
    if (!getRewardImage || !position) continue;
    
    previousElements.push(
      <div
        key={`prev-reward-${round}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '100px',
          height: '100px',
          transform: 'translate(-50%, -50%)',
          zIndex: 18,
          opacity: 0.9
        }}
      >
        <img 
          src={getRewardImage(0)} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          alt={`Round ${round} reward`} 
        />
      </div>
    );
  }
  
  return previousElements;
};

  // ⭐ NEW: Render central synthesis element
  const renderCentralSynthesis = () => {
    if (!gameConfig.elements.centralSynthesis?.enabled) return null;
  // ✅ NEW: Shows the animal as soon as a Round exists (matches the Clickers)
if (!currentRound) return null;

    const position = gameConfig.elements.centralSynthesis.positions[currentRound - 1];
    if (!position) return null;

    // Get asset getters
   // Get asset getters (Check for Round Specifics first)
    let initialKey = gameConfig.elements.centralSynthesis.assetGetterInitial;
    let rewardKey = gameConfig.elements.centralSynthesis.assetGetterReward;

    // ⭐ If this round has specific assets, use them!
    if (gameConfig.elements.centralSynthesis.assetGettersByRound && 
        gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound]) {
        
        initialKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].initial;
        rewardKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].reward;
    }

    const getInitialImage = assetGetters[initialKey];
    const getRewardImage = assetGetters[rewardKey];
    if (!getInitialImage || !getRewardImage) return null;

    // Determine which image to show based on bloom progress
    const isFullyBloomed = centralBloomProgress === 100;
    
    // Use first index (0) for central element
    const budImage = getInitialImage(0);
    const bloomImage = getRewardImage(0);

    return (
      <div
              className={`${gamePrefix}-central-synthesis`}  // ← ADD THIS LINE

        onClick={centralElementGlowing ? handleCentralElementClick : undefined}
        style={{
          position: 'absolute',
          //left: position.left,
          //top: position.top,
          //width: '120px',
          //height: '120px',
          //transform: 'translate(-50%, -50%)',
          zIndex: 20,
          cursor: centralElementGlowing ? 'pointer' : 'default',
          transition: 'all 0.5s ease',
          pointerEvents: centralElementGlowing ? 'auto' : 'none'
        }}
      >
        {/* Bud layer (fades out as blooms) */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: isFullyBloomed ? 0 : (1 - centralBloomProgress / 100),
          transition: 'opacity 0.5s ease'
        }}>
          <img src={budImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bud" />
        </div>

        {/* Bloom layer (fades in as blooms) */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: centralBloomProgress / 100,
          transform: `scale(${0.6 + (centralBloomProgress / 100) * 0.4})`,
          transition: 'all 0.5s ease'
        }}>
          <img src={bloomImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bloom" />
        </div>

        {/* Glow effect when ready */}
        {centralElementGlowing && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140px',
              height: '140px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${gameConfig.theme.primaryColor}40, transparent)`,
              animation: 'goldenPulse 1.5s ease-in-out infinite',
              zIndex: -1
            }} />
            
            {/* Tap Here indicator */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#FFD700',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              zIndex: 30,
              whiteSpace: 'nowrap'
            }}>
              👆 Tap Here
            </div>

            {/* Golden pulse ring */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '85%',
              height: '85%',
              border: '2px solid #FFD700',
              borderRadius: '50%',
              animation: 'goldenPulse 2s infinite'
            }} />
          </>
        )}

        {/* Word label at bottom */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: centralElementGlowing ? '#FFD700' : isFullyBloomed ? '#4CAF50' : '#999',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {currentSequence.join('').toUpperCase()}
        </div>

        {/* Sparkles when fully bloomed */}
        {isFullyBloomed && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            fontSize: '24px',
            animation: 'sparkle 1s ease-in-out infinite'
          }}>
            ✨
          </div>
        )}
      </div>
    );
  };

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      {!hideElements && <UniversalPauseButton onPause={handlePause} disabled={gamePhase === 'phase_complete'} />}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />
      
      {!hideElements && (
        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: gameConfig.theme.primaryColor }}>{gameConfig.displayName.toUpperCase()}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3].map(round => (
              <div key={round} style={{ width: '28px', height: '28px', borderRadius: '50%', background: round <= currentRound ? (round < currentRound ? '#4CAF50' : gameConfig.theme.primaryColor) : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: round <= currentRound ? 'white' : '#666' }}>{round}</div>
            ))}
          </div>
        </div>
      )}

      {!hideElements && gamePhase !== 'phase_complete' && (
        <UnifiedHeader
          zone="shloka-river"
          title={
            isCountingDown ? `${getRoundWord(gameConfig, currentRound)} - Get Ready... ${countdown}` :
            gamePhase === 'waiting' ? `${getRoundWord(gameConfig, currentRound)}` :
            gamePhase === 'playing' ? `${getRoundWord(gameConfig, currentRound)} - Listen carefully...` :
            gamePhase === 'celebration' ? 'Awesome!' :
            (centralElementGlowing || playerInput.length >= currentSequence.length)
              ? gameConfig.uiText.finalInstruction
              : `${getRoundWord(gameConfig, currentRound)}! ${getClickInstruction(gameConfig.elements.clicker.type)}`
          }
          currentRound={playerInput.length}
          totalRounds={currentSequence.length + 1}
        />
      )}

      {!hideElements && isCountingDown && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '100px', fontWeight: 'bold', color: gameConfig.theme.primaryColor, zIndex: 100, animation: 'countdownPulse 0.8s' }}>{countdown}</div>}
      {!hideElements && showWaitBanner && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 152, 0, 0.95)', color: 'white', padding: '20px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', zIndex: 100, animation: 'fadeInOut 1.5s' }}>{waitBannerMessage}</div>}
      {!hideElements && waterSprayPosition && <div style={{ position: 'absolute', left: waterSprayPosition.left, top: waterSprayPosition.top, transform: 'translateY(-100%)', fontSize: '48px', animation: 'waterSplash 1s', zIndex: 100, pointerEvents: 'none' }}>💦</div>}

      {!hideElements && (
        <>
          {gameConfig.elements.rewards?.animals ? (
            <>
              {currentSequence.map((s, i) => renderDualInitials(s, i))}
              {currentSequence.map((s, i) => renderElephant(s, i))}
              {currentSequence.map((s, i) => renderDualRewards(s, i))}
            </>
          ) : (
            <>
              {/* Don't render individual singers - use central synthesis instead */}
              {currentSequence.map((s, i) => renderElephant(s, i))}
            </>
          )}
   {/* Previous round rewards */}
{renderPreviousCentralElements()}
{/* Current round central synthesis */}
{renderCentralSynthesis()}
        </>
      )}

      <style>{`
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.8); } 20% { opacity: 1; transform: translate(-50%,-50%) scale(1.05); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%,-50%) scale(0.8); } }
        @keyframes goldenPulse { 0%, 100% { opacity: 0.7; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.05); } }
        @keyframes crownFloat { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-3px); } }
        @keyframes countdownPulse { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0; } 50% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; } }
        @keyframes musicNote { 0% { transform: translateX(-50%) translateY(0); opacity: 0; } 50% { transform: translateX(-50%) translateY(-10px); opacity: 1; } 100% { transform: translateX(-50%) translateY(-20px); opacity: 0; } }
        @keyframes rewardAppear { 0% { transform: translate(-50%,-50%) scale(0) rotate(-180deg); opacity: 0; } 100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 1; } }
        @keyframes rewardGlow { 0%, 100% { filter: brightness(1.3) saturate(1.4); } 50% { filter: brightness(1.5) saturate(1.6); } }
        @keyframes sparkle { 0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); } 50% { opacity: 0.5; transform: translateX(-50%) scale(1.2); } }
        @keyframes waterSplash { 0% { transform: translate(-50%,-100%) scale(0.5); opacity: 1; } 50% { transform: translate(-50%,-150%) scale(1.2); opacity: 0.8; } 100% { transform: translate(-50%,-200%) scale(1.5); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default AutoPlayMode;