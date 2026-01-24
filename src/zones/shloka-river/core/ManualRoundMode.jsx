// zones/shloka-river/core/ManualRoundMode.jsx
// FIXED: Initialize state directly from props to prevent losing progress

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';

import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';
import UnifiedButtonV2 from '../../../lib/components/ui/Button/UnifiedButtonV2';

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

// Helper: Get round word name from syllables
const getRoundWord = (gameConfig, roundNumber) => {
  const syllables = gameConfig.syllables[roundNumber];
  if (!syllables) return '';
  return syllables.join('').toUpperCase();
};

const ManualRoundMode = ({
  gameConfig,
  assetGetters,
  gamePrefix = 'default',
  isActive,
  hideElements,
  powerGained,
  profileName,
  WaterSprayComponent,
  onSaveGameState,
  onPhaseComplete,
  onGameComplete,
  onSwitchToAuto,
  isReload,
  savedGameState,
  onExit
}) => {

  const { safeClick } = useSafeClick(300);

  // ⭐ RELOAD LOGIC: Only auto-restart if we were actively playing
  /*const shouldReloadRound = isReload && 
    savedGameState?.currentRound && 
    savedGameState?.gameMode === 'manual' &&
    (savedGameState?.gameState === 'playing' || 
     savedGameState?.gameState === 'listening' || 
     savedGameState?.gameState === 'countdown') &&
    !savedGameState?.completedRounds?.includes(savedGameState.currentRound);

  // ⭐ INITIALIZATION: Initialize DIRECTLY from savedGameState to prevent data loss
  const [gameState, setGameState] = useState(shouldReloadRound ? 'initializing' : 'roundSelection');
  const [selectedRound, setSelectedRound] = useState(shouldReloadRound ? savedGameState.currentRound : null);
  const [currentSequence, setCurrentSequence] = useState(
    shouldReloadRound ? (gameConfig.syllables[savedGameState.currentRound] || []) : []
  );*/

  // DELETE lines 29-36 (the const shouldReloadRound)
// DELETE lines 39-43 (conditional initialization)


  // ⭐ INITIAL CHECK: Calculate once for useState initialization
  const shouldReloadRoundInitial = isReload && 
    savedGameState?.currentRound && 
    savedGameState?.gameMode === 'manual' &&
    (savedGameState?.gameState === 'playing' || 
     savedGameState?.gameState === 'listening' || 
     savedGameState?.gameState === 'countdown');

  // ⭐ INITIALIZATION: Initialize directly to prevent Choose Modal flash
  const [gameState, setGameState] = useState(shouldReloadRoundInitial ? 'initializing' : 'roundSelection');
  const [selectedRound, setSelectedRound] = useState(shouldReloadRoundInitial ? savedGameState.currentRound : null);
  const [currentSequence, setCurrentSequence] = useState(
    shouldReloadRoundInitial ? (gameConfig.syllables[savedGameState.currentRound] || []) : []
  );
  
  // ✅ FIX: Initialize Progress directly so it never flashes empty
  const [completedRounds, setCompletedRounds] = useState(savedGameState?.completedRounds || []);
  const [learnedSyllables, setLearnedSyllables] = useState(savedGameState?.learnedSyllables || []);
  const [visualRewards, setVisualRewards] = useState(savedGameState?.visualRewards || {});
  const [activatedElephants, setActivatedElephants] = useState(savedGameState?.activatedElephants || {});

  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  const [roundClicks, setRoundClicks] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // ⭐ NEW: Central synthesis states
  const [centralElementGlowing, setCentralElementGlowing] = useState(false);
  const [centralBloomProgress, setCentralBloomProgress] = useState(0); // 0 to 100

  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  // ⭐ RESTORE PROGRESS (Double check on updates)
  useEffect(() => {
    if (savedGameState) {
      console.log('📂 [Manual] Syncing state:', savedGameState);
      
      // Update state if props are newer (prevents stale closures)
      if (savedGameState.completedRounds) setCompletedRounds(savedGameState.completedRounds);
      if (savedGameState.learnedSyllables) setLearnedSyllables(savedGameState.learnedSyllables);
      if (savedGameState.visualRewards) setVisualRewards(savedGameState.visualRewards);
      if (savedGameState.activatedElephants) setActivatedElephants(savedGameState.activatedElephants);

      // ⭐ RECALCULATE: Fresh calculation with updated savedGameState
     // ⭐ RECALCULATE: Fresh calculation with updated savedGameState
const shouldReloadRound = isReload && 
  savedGameState?.gameId === gameConfig.id &&  // ⭐ ADDED: Validate game ID
  savedGameState?.currentRound && 
  savedGameState?.gameMode === 'manual' &&
  (savedGameState?.gameState === 'playing' || 
   savedGameState?.gameState === 'listening' || 
   savedGameState?.gameState === 'countdown');

      // Handle Gameplay Reload
      if (shouldReloadRound) {
        console.log('🔄 [Manual] Reloading directly into round:', savedGameState.currentRound);
        setPlayerInput([]);
        setRoundClicks({});
        
        safeSetTimeout(() => {
          startCountdown(gameConfig.syllables[savedGameState.currentRound]);
        }, 500);
      } else if (isReload) {
        // Force Menu if we shouldn't be playing
        setGameState('roundSelection');
        setSelectedRound(null);
      }
    }
  }, [savedGameState, isReload]);

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
      timeoutsRef.current.forEach(t => clearTimeout(t));
      intervalsRef.current.forEach(i => clearInterval(i));
    };
  }, []);

  useEffect(() => {
    if (showPauseModal) {
      clearAllTimers();
    }
  }, [showPauseModal]);

  const playSyllableAudio = (syllable) => {
    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) return;
      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const startCountdown = (sequence) => {
    setIsCountingDown(true);
    setCountdown(3);
    setGameState('countdown');

    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          playSequence(sequence);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    intervalsRef.current.forEach(i => clearInterval(i));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

 const handleRoundSelect = (round) => {
  safeClick(() => {
    console.log('🎯 Round select clicked:', { round, gameState, currentState: gameState });
    if (gameState !== 'roundSelection') {
      console.warn('⚠️ Cannot select round - gameState is', gameState, 'not roundSelection');
      return;
    }
    setSelectedRound(round);
    console.log('✅ Round selected:', round);
  });
};

const handleStartRound = () => {
  safeClick(() => {
    console.log('▶️ Start round clicked:', { selectedRound, gameState });
    if (!selectedRound) {
      console.warn('⚠️ No round selected!');
      return;
    }
      const sequence = gameConfig.syllables[selectedRound] || [];
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setRoundClicks({});
      
      // ⭐ NEW: Reset central synthesis states
      setCentralElementGlowing(false);
      setCentralBloomProgress(0);
      
      safeSetTimeout(() => {
        startCountdown(sequence);
      }, 500);

      // Save "Playing" state
      if (onSaveGameState) {
        onSaveGameState({
          currentRound: selectedRound,
          gameMode: 'manual',
          gameId: gameConfig.id,
          gameState: 'playing', 
          completedRounds,
          learnedSyllables,
          visualRewards,
          activatedElephants
        });
      }
    });
  };

  const playSequence = (sequence) => {
    setIsSequencePlaying(true);
    setGameState('playing');
    setPlayerInput([]);
    setRoundClicks({});
    setSingingSyllable(null);

    sequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        safeSetTimeout(() => { setSingingSyllable(null); }, 600);
        if (index === sequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGameState('listening');
          }, 800);
        }
      }, index * 1200);
    });
  };

  /*const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (gameState !== 'listening' || isSequencePlaying) return;
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (roundClicks[`elephant-${clickedSyllable}`]) return;
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) return;

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

      if (!learnedSyllables.includes(clickedSyllable)) {
        setLearnedSyllables(prev => [...prev, clickedSyllable]);
      }

      if (newPlayerInput.length === currentSequence.length) {
        handleRoundSuccess();
      }
    });
  };*/

  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      // ... (existing validation checks) ...
      if (gameState !== 'listening' || isSequencePlaying) return;
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (roundClicks[`elephant-${clickedSyllable}`]) return;
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) return;

      // Play audio & animation
      playSyllableAudio(clickedSyllable);

      // Trigger Water Spray
      if (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') {
        const position = gameConfig.elements.clicker.positions[syllableIndex];
        setWaterSprayPosition({ left: position.left, top: position.top });
        safeSetTimeout(() => setWaterSprayPosition(null), 1000);
      }

      // Update State (Inputs, Visuals, Crowns)
      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));

      // Update learned list
      if (!learnedSyllables.includes(clickedSyllable)) {
        setLearnedSyllables(prev => [...prev, clickedSyllable]);
      }

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
    setGameState('success');

    let newCompletedRounds = completedRounds;
    if (!completedRounds.includes(selectedRound)) {
      newCompletedRounds = [...completedRounds, selectedRound];
      setCompletedRounds(newCompletedRounds);
    }

    if (onSaveGameState) {
      onSaveGameState({
        gameMode: 'manual',
        gameId: gameConfig.id,
        gameState: 'success', 
        completedRounds: newCompletedRounds,
        learnedSyllables,
        visualRewards,
        activatedElephants
      });
    }

    safeSetTimeout(() => {
      setWaterSprayPosition(null);
      setGameState('roundSelection');
      setSelectedRound(null);
      setPlayerInput([]);
      setRoundClicks({});
      
      // ⭐ SAVE "AT MENU" STATE
      if (onSaveGameState) {
        onSaveGameState({
          gameMode: 'manual',
          gameId: gameConfig.id,
          gameState: 'roundSelection', 
          currentRound: null,
          completedRounds: newCompletedRounds,
          learnedSyllables,
          visualRewards,
          activatedElephants
        });
      }
    }, 2500);
  };

const handleFinishGame = () => {
  if (onPhaseComplete) {
    onPhaseComplete(gameConfig.id);
  } else if (onGameComplete) {
    onGameComplete();
  }
};

  const handleSwitchToAutoMode = () => {
    if (onSwitchToAuto) {
      onSwitchToAuto({
        learnedSyllables,
        visualRewards,
        activatedElephants,
        completedRounds // ✅ PASS PROGRESS
      });
    }
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const handleContinue = () => {
    setShowPauseModal(false);
    if (gameState === 'countdown') {
      startCountdown(currentSequence);
    } else if (gameState === 'playing') {
      playSequence(currentSequence);
    } else if (gameState === 'success') {
      safeSetTimeout(() => {
        setGameState('roundSelection');
        setSelectedRound(null);
        setPlayerInput([]);
        setRoundClicks({});
      }, 500);
    }
  };

  const handleExitToMenu = () => {
    setShowPauseModal(false);
    clearAllTimers();
    setIsCountingDown(false);
    setCountdown(0);
    setWaterSprayPosition(null);

    setGameState('roundSelection');
    setSelectedRound(null);
    setPlayerInput([]);
    setRoundClicks({});
    setSingingSyllable(null);
    setIsSequencePlaying(false);

    // ⭐ KEY: Trigger exit via Engine (which handles save)
    if (onExit) {
      onExit();
    } else if (onSaveGameState) {
      // Fallback save if Engine handler missing
      onSaveGameState({
        gameMode: 'manual',
        gameId: gameConfig.id,
        gameState: 'roundSelection',
        currentRound: null,
        completedRounds, // ✅ Keep current progress
        learnedSyllables,
        visualRewards,
        activatedElephants
      });
    }
  };

  // ... Render functions (Elephant, Singer, Duals) ...
  // (Paste the exact same render functions from previous response here)
  // Included below for completeness

const renderElephant = (syllable, index) => {
    // --- 🔍 DEBUG START ---
    console.group(`🐘 Rendering Elephant: ${syllable} (Index: ${index})`);
    
    // 1. Check if we have the specific map
    const specificMap = gameConfig.elements.clicker.assetGetters;
    console.log('1. Specific Map exists?', !!specificMap, specificMap);

    let getImage;
    let lookupKey;

    if (specificMap) {
      // 2. Try to find the function name for this syllable
      // Try exact match first, then lowercase
      lookupKey = specificMap[syllable] || specificMap[syllable.toLowerCase()];
      console.log(`2. Looking for syllable '${syllable}' -> Found Key name:`, lookupKey);
      
      if (lookupKey) {
        // 3. Try to find the actual function in the props
        getImage = assetGetters[lookupKey];
        console.log(`3. Looking for function '${lookupKey}' in props -> Found?`, !!getImage);
      } else {
        console.error(`❌ Mismatch! Config has keys [${Object.keys(specificMap)}] but Game asked for '${syllable}'`);
      }
    } else if (gameConfig.elements.clicker.assetGetter) {
        // Fallback logic
        console.log('Using generic assetGetter:', gameConfig.elements.clicker.assetGetter);
        getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
    }
    
    console.groupEnd();
  

const position = gameConfig.elements.clicker?.positions?.[index] || { left: '50%', top: '50%' };
  

    const clickable = gameState === 'listening' && !isSequencePlaying && index === playerInput.length;
    const clicked = index < playerInput.length;
    const isSinging = singingSyllable === syllable;
    const isNext = clickable;

    return (
      <button
        key={`clicker-${syllable}-${index}`}
          className={`${gamePrefix}-clicker-element`}  // ← ADD THIS

        style={{
          position: 'absolute',
          //left: position.left,
          //top: position.top,
          //width: '120px', height: '120px',
          border: 'none', background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          zIndex: 20, borderRadius: '50%',
          opacity: clickable ? 1 : 0.7,
          transition: 'all 0.3s ease',
          filter: isSinging ? 'brightness(1.4)' : 'brightness(1)',
transform: isSinging ? 'scale(1.1)' : 'scale(1)'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable}
      >
        {getImage && <img src={getImage(index)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
        {activatedElephants[`elephant-${syllable}`] && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px', animation: 'crownFloat 2s infinite', zIndex: 10 }}>👑</div>}
        {isNext && !clicked && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', height: '85%', border: '3px solid #FFD700', borderRadius: '50%', animation: 'goldenPulse 2s infinite', zIndex: -1 }} />}
        {isNext && !clicked && <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#FFD700', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', zIndex: 30 }}>👆 Tap Here</div>}
        <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', background: clicked ? '#4CAF50' : clickable ? '#FF9800' : '#999', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{syllable.toUpperCase()}</div>
      </button>
    );
  };

  const renderSinger = (syllable, index) => {
    if (!gameConfig.elements.singer?.positions) return null;
    let position;
    const isReward = visualRewards[`visual-${syllable}`];
    position = (isReward && gameConfig.elements.singer.positionsReward) ? gameConfig.elements.singer.positionsReward[index] : gameConfig.elements.singer.positions[index];
    const isSinging = singingSyllable === syllable;
    let getImage;
    if (isReward) {
        if (gameConfig.elements.singer.assetGetterReward) getImage = assetGetters[gameConfig.elements.singer.assetGetterReward];
        else if (gameConfig.elements.singer.assetGettersReward) getImage = assetGetters[gameConfig.elements.singer.assetGettersReward[syllable]];
    } else {
        if (gameConfig.elements.singer.assetGetterInitial) getImage = assetGetters[gameConfig.elements.singer.assetGetterInitial];
        else if (gameConfig.elements.singer.assetGettersInitial) getImage = assetGetters[gameConfig.elements.singer.assetGettersInitial[syllable]];
    }
    if (!getImage) return null;

    return (
      <div key={`singer-${syllable}-${index}`} style={{ position: 'absolute', left: position.left, top: position.top, width: isReward ? '80px' : '60px', height: isReward ? '80px' : '60px', transition: 'all 0.3s ease', zIndex: 10, transform: 'translate(-50%, -50%)', filter: isSinging ? 'brightness(1.6)' : isReward ? 'brightness(1.3)' : 'brightness(0.8)', opacity: isReward ? 1 : 0.7 }}>
        <img src={getImage(index)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {isReward && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px' }}>✨</div>}
      </div>
    );
  };

  const renderDualInitials = (syllable, index) => {
    if (visualRewards[`visual-${syllable}`]) return null;
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
    if (!visualRewards[`visual-${syllable}`]) return null;
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
  if (!selectedRound || selectedRound === 1) return null;
  
  const previousElements = [];
  
  for (let round = 1; round < selectedRound; round++) {
    const position = gameConfig.elements.centralSynthesis.positions[round - 1];
    
    // Get the reward image for this round
    let getRewardImage;
    const rewardGetters = gameConfig.elements.centralSynthesis.assetGettersReward;
    
    if (typeof rewardGetters === 'object' && rewardGetters[round]) {
      // Round-specific getter (Kurumedeva)
      getRewardImage = assetGetters[rewardGetters[round]];
    } else if (typeof rewardGetters === 'string') {
      // Single getter for all (other games)
      getRewardImage = assetGetters[rewardGetters];
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
    if (!selectedRound || gameState === 'roundSelection' || gameState === 'initializing') return null;

    const position = gameConfig.elements.centralSynthesis.positions[selectedRound - 1];
    if (!position) return null;

    // Get asset getters
// Get asset getters (Check for Round Specifics first)
    let initialKey = gameConfig.elements.centralSynthesis.assetGetterInitial;
    let rewardKey = gameConfig.elements.centralSynthesis.assetGetterReward;

    // ⭐ If this round has specific assets, use them!
    if (gameConfig.elements.centralSynthesis.assetGettersByRound && 
        gameConfig.elements.centralSynthesis.assetGettersByRound[selectedRound]) {
        
        initialKey = gameConfig.elements.centralSynthesis.assetGettersByRound[selectedRound].initial;
        rewardKey = gameConfig.elements.centralSynthesis.assetGettersByRound[selectedRound].reward;
    }

    const getInitialImage = assetGetters[initialKey];
    const getRewardImage = assetGetters[rewardKey];
    if (!getInitialImage || !getRewardImage) return null;

    // Determine which image to show based on bloom progress
    const isFullyBloomed = centralBloomProgress === 100;
    const isPartiallyBloomed = centralBloomProgress > 0 && centralBloomProgress < 100;
    
    // Use first index (0) for central element
    const budImage = getInitialImage(0);
    const bloomImage = getRewardImage(0);

    return (
      <div
        className={`${gamePrefix}-central-synthesis`}  // ← ADD THIS

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
      {!hideElements && gameState !== 'roundSelection' && gameState !== 'initializing' && (
        <UniversalPauseButton onPause={handlePause} />
      )}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />

      {!hideElements && gameState === 'roundSelection' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div style={{ background: 'white', borderRadius: '30px', padding: '50px', maxWidth: '520px', width: '90%', textAlign: 'center', boxShadow: '0 25px 70px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '25px' }}>Choose Round:</h2>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
              {Array.from({ length: Object.keys(gameConfig.syllables).length }, (_, i) => i + 1).map(round => {
                const isCompleted = completedRounds.includes(round);
                return (
                  <button key={round} onClick={() => handleRoundSelect(round)}
                    style={{ width: '80px', height: '80px', borderRadius: '15px', border: isCompleted ? '3px solid #4CAF50' : selectedRound === round ? `4px solid ${gameConfig.theme.primaryColor}` : `2px solid ${gameConfig.theme.primaryColor}`, background: isCompleted ? '#4CAF50' : selectedRound === round ? `${gameConfig.theme.primaryColor}15` : 'white', color: isCompleted ? 'white' : gameConfig.theme.primaryColor, fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {round}
                    {isCompleted && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '24px', height: '24px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>✓</div>}
                  </button>
                );
              })}
            </div>
            {selectedRound && (
              <div style={{ marginTop: '20px' }}>
                <UnifiedButtonV2
                  variant="success"
                  size="large"
                  heartbeat={true}
                  onClick={handleStartRound}
                >
                  ▶️ START ROUND {selectedRound}
                </UnifiedButtonV2>
              </div>
            )}
            <div style={{ borderTop: '2px solid #E0E0E0', paddingTop: '25px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <UnifiedButtonV2
                variant="primary"
                onClick={handleFinishGame}
              >
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800' }}>
                    🏁 Finish & Return
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
                    Save progress and return to scene
                  </div>
                </div>
              </UnifiedButtonV2>

              <UnifiedButtonV2
                variant="secondary"
                onClick={handleSwitchToAutoMode}
              >
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800' }}>
                    🎵 Hear Full Mantra
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
                    Switch to Auto Play from Round 1
                  </div>
                </div>
              </UnifiedButtonV2>
            </div>
          </div>
        </div>
      )}

      {/* Other render elements (status bar, countdown, etc.) */}
      {!hideElements && isCountingDown && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '100px', fontWeight: 'bold', color: gameConfig.theme.primaryColor, textShadow: `0 0 30px ${gameConfig.theme.primaryColor}80`, zIndex: 100, animation: 'countdownPulse 0.8s ease-in-out' }}>{countdown}</div>
      )}
      {!hideElements && waterSprayPosition && <div style={{ position: 'absolute', left: waterSprayPosition.left, top: waterSprayPosition.top, transform: 'translate(-50%, -100%)', fontSize: '48px', animation: 'waterSplash 1s ease-out', zIndex: 100, pointerEvents: 'none' }}>💦</div>}

      {!hideElements && gameState !== 'roundSelection' && gameState !== 'countdown' && gameState !== 'initializing' && (
<div className={getHeaderClassName(gameConfig)}>
          <div style={{ 
            fontSize: '28px', 
            marginBottom: gameState === 'listening' ? '8px' : '0',
            color: (centralElementGlowing || playerInput.length >= currentSequence.length) ? '#FFD700' : 'white'
          }}>
            {gameState === 'playing' ? 'Listen carefully...' : 
gameState === 'listening' && (centralElementGlowing || playerInput.length >= currentSequence.length) ? gameConfig.uiText.finalInstruction :
             gameState === 'listening' ? `${getRoundWord(gameConfig, selectedRound)}! ${getClickInstruction(gameConfig.elements.clicker.type)}` : 
             gameState === 'success' ? 'Awesome! Choose another round!' : ''}
          </div>
          
          {gameState === 'listening' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '200px',
                height: '20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                border: '2px solid #8B4513',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(playerInput.length / (currentSequence.length + 1)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4ECDC4, #FFD700)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {playerInput.length}/{currentSequence.length + 1}
              </div>
            </div>
          )}
        </div>
      )}

      {!hideElements && gameState !== 'roundSelection' && gameState !== 'initializing' && (
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
      <style>{`@keyframes goldenPulse { 0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); } } @keyframes countdownPulse { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } } @keyframes waterSplash { 0% { transform: translate(-50%, -100%) scale(0.5); opacity: 1; } 50% { transform: translate(-50%, -150%) scale(1.2); opacity: 0.8; } 100% { transform: translate(-50%, -200%) scale(1.5); opacity: 0; } } @keyframes rewardAppear { 0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; } } @keyframes sparkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } } @keyframes pulseButton { 0%, 100% { transform: scale(1); box-shadow: 0 6px 20px ${gameConfig.theme.primaryColor}40; } 50% { transform: scale(1.05); box-shadow: 0 8px 25px ${gameConfig.theme.primaryColor}60; } }`}</style>
    </div>
  );
};

export default ManualRoundMode;