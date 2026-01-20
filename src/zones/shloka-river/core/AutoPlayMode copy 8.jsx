// zones/shloka-river/core/AutoPlayMode.jsx
// Fixed to preserve Manual Mode progress (completedRounds)

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';
import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';

const AutoPlayMode = ({
  gameConfig,
  assetGetters,
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

    console.log('💾 [Auto] Saving state (preserving manual progress):', stateToSave.completedRounds);
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
    
    console.log(`Starting ${gameConfig.displayName} round ${roundNumber}:`, sequence);
    
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
  console.log('🎮 Exiting auto-play - preserving progress');
  
  setShowPauseModal(false);
  clearAllTimers();
  
  setGamePhase('waiting');
  setCurrentRound(1);
  setCurrentSequence([]);
  setPlayerInput([]);
  setCanPlayerClick(false);
  setIsSequencePlaying(false);
  
  // ⭐ IMPORTANT: Auto mode plays through ALL syllables, but doesn't track "rounds"
  // We should preserve whatever completedRounds came from Manual mode!
  // Don't override with [1,2,3]
  
  if (onPhaseComplete) {
    onPhaseComplete({
      learnedSyllables: Object.keys(visualRewards).map(key => key.replace('visual-', '')),
      visualRewards: visualRewards,
      activatedElephants: activatedElephants,
      // ⭐ DON'T send completedRounds here - let it preserve from savedGameState
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
      
      if (newPlayerInput.length === currentSequence.length) {
        handleRoundSuccess();
      }
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

    if (isReload && savedGameState && savedGameState.currentRound) {
      console.log('🔄 [Auto] Restoring saved auto state');
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
    } else {
      console.log('🆕 [Auto] Starting fresh from Round 1');
      hasInitializedRef.current = true;
      startNewRound(1); // This will trigger the first save with the captured manual progress
    }
  }, [isActive, gameConfig]);
  
  // Auto-start countdown
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => startCountdown(), 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // Helpers & Renderers
  const isElephantSinging = (syllable) => singingSyllable === syllable;
  const isElephantClickable = (index) => canPlayerClick && index === playerInput.length;
  const hasElephantBeenClicked = (index) => index < playerInput.length;
  const isElephantActivated = (syllable) => activatedElephants[`elephant-${syllable}`];
  const isVisualRewardActive = (syllable) => visualRewards[`visual-${syllable}`];
  const isNextExpected = (index) => canPlayerClick && index === playerInput.length;

  const getPosition = (type, index) => {
    return type === 'elephant' ? gameConfig.elements.clicker.positions[index] : gameConfig.elements.singer.positions[index];
  };

  const renderElephant = (syllable, index) => {
    const position = getPosition('elephant', index);
    let getImage;
    if (gameConfig.elements.clicker.assetGetter) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
    } else if (gameConfig.elements.clicker.assetGetters) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetters[syllable]];
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
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '120px', height: '120px',
          border: 'none', background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          zIndex: 20, borderRadius: '50%',
          opacity: clickable || clicked ? 1 : 0.6,
          transform: 'translate(-50%, -50%) ' + (singing ? 'scale(1.15)' : 'scale(1)'),
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

  // Support for Dual Rewards (Nirvighnam) - Same logic, updated to use correct asset getters
  const renderDualInitials = (syllable, index) => {
    if (isVisualRewardActive(syllable)) return null;
    if (!gameConfig.elements.rewards?.animals) return null;
    
    const stonePos = gameConfig.elements.rewards.stones.positionsInitial[index];
    const getStone = assetGetters[gameConfig.elements.rewards.stones.assetGettersInitial[syllable]];
    const getAnimal = assetGetters[gameConfig.elements.rewards.animals.assetGetters[syllable]];
    
    return (
      <React.Fragment key={`dual-init-${syllable}`}>
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 10, transform: 'translate(-50%,-50%)', opacity: 0.8 }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
        {getAnimal && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '70px', height: '70px', zIndex: 11, transform: 'translate(-50%,-50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /></div>}
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
        {getAnimal && <div style={{ position: 'absolute', left: animalPos.left, top: animalPos.top, width: '80px', height: '80px', zIndex: 15, animation: 'rewardAppear 1s', transform: 'translate(-50%,-50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /><div style={{position:'absolute',top:'-10px',right:'-10px'}}>✨</div></div>}
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 12, animation: 'rewardAppear 1s', transform: 'translate(-50%,-50%)' }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
      </React.Fragment>
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
        <div style={{ position: 'absolute', top: '20px', left: '20%', transform: 'translateX(-50%)', background: `${gameConfig.theme.primaryColor}E6`, color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', zIndex: 50 }}>
          {isCountingDown ? `Get Ready... ${countdown}` : gamePhase === 'playing' ? 'Listen carefully...' : gamePhase === 'celebration' ? 'Beautiful! Well done!' : `Click the elephants! (${playerInput.length}/${currentSequence.length})`}
        </div>
      )}

      {!hideElements && isCountingDown && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '100px', fontWeight: 'bold', color: gameConfig.theme.primaryColor, zIndex: 100, animation: 'countdownPulse 0.8s' }}>{countdown}</div>}
      {!hideElements && showWaitBanner && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 152, 0, 0.95)', color: 'white', padding: '20px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', zIndex: 100, animation: 'fadeInOut 1.5s' }}>{waitBannerMessage}</div>}
      {!hideElements && waterSprayPosition && <div style={{ position: 'absolute', left: waterSprayPosition.left, top: waterSprayPosition.top, transform: 'translate(-50%, -100%)', fontSize: '48px', animation: 'waterSplash 1s', zIndex: 100, pointerEvents: 'none' }}>💦</div>}

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
              {currentSequence.map((s, i) => renderInitialVisual(s, i))}
              {currentSequence.map((s, i) => renderElephant(s, i))}
              {currentSequence.map((s, i) => renderVisualReward(s, i))}
            </>
          )}
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