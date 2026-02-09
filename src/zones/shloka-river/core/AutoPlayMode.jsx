// zones/shloka-river/core/AutoPlayMode.jsx
// FIXED: Removed "Tap Here"/Circles/Crowns. Added Pulse + Hint Glow.

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';
import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';

const AutoPlayMode = ({
  gameConfig,
  assetGetters,
  gamePrefix = 'default',
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  voiceGuidance = null,  // ⭐ VOICE GUIDANCE
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
  
  // Hint State
  const [showIdleHint, setShowIdleHint] = useState(false);
  
  // Central synthesis states
  const [centralElementGlowing, setCentralElementGlowing] = useState(false);
  const [centralBloomProgress, setCentralBloomProgress] = useState(0); // 0 to 100
  
  // Refs
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const sequencePlayingRef = useRef(false); // Guard against double playSequence calls

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

  // Store voiceGuidance in a ref so effects don't re-fire when the prop object changes identity
  const voiceGuidanceRef = useRef(voiceGuidance);
  useEffect(() => {
    voiceGuidanceRef.current = voiceGuidance;
  }, [voiceGuidance]);

  // 10-Second Idle Hint Timer (triggers during player's turn - 'listening' phase)
  useEffect(() => {
    let idleTimer;
    console.log(`[IdleTimer Check] Phase: ${gamePhase}, CanClick: ${canPlayerClick}, SeqPlaying: ${isSequencePlaying}, Countdown: ${isCountingDown}`);
    if (gamePhase === 'listening' && canPlayerClick && !isSequencePlaying && !isCountingDown) {
      console.log('⏳ Idle Timer Started (10s)...');
      idleTimer = setTimeout(() => {
        console.log('💡 Idle Hint Triggered!');
        setShowIdleHint(true);
        // Play hint VO
        if (voiceGuidanceRef.current?.playVoice) {
          voiceGuidanceRef.current.playVoice('hintTapTheShiny');
        }
      }, 10000); // 10 seconds like Modak scene
    } else {
      setShowIdleHint(false);
    }
    return () => clearTimeout(idleTimer);
  }, [gamePhase, canPlayerClick, playerInput, isSequencePlaying, isCountingDown]);

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
    clearAllTimers();
    sequencePlayingRef.current = false;
    const sequence = getSequenceForRound(roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({});
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setShowIdleHint(false);
    countdownTriggeredRef.current = false; // Reset so next round can trigger countdown
    sequencePlayingRef.current = false; // Reset so next round can play sequence

    setCentralElementGlowing(false);
    setCentralBloomProgress(0);
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
    // Guard: prevent playSequence from running twice for the same round
    if (sequencePlayingRef.current) {
      console.log('[playSequence] Already playing, skipping duplicate call');
      return;
    }
    if (sequencePlayingRef.current) return;
    
    sequencePlayingRef.current = true;

    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSingingSyllable(null);
    setShowIdleHint(false);

    // Helper to play syllables after VO finishes
    let syllablesStarted = false;
    const playSyllables = () => {
      if (syllablesStarted) return;
      syllablesStarted = true;

      currentSequence.forEach((syllable, index) => {
        safeSetTimeout(() => {
          setSingingSyllable(syllable);
          playSyllableAudio(syllable);
          safeSetTimeout(() => setSingingSyllable(null), 600);
          if (index === currentSequence.length - 1) {
            safeSetTimeout(() => {
              sequencePlayingRef.current = false; // Reset for next round
              setIsSequencePlaying(false);
              sequencePlayingRef.current = false;
              setGamePhase('listening');
              setCanPlayerClick(true);
              // Play "Your turn" VO when player can click
              if (voiceGuidanceRef.current?.playVoice) {
                voiceGuidanceRef.current.playVoice('instructionYourTurn');
              }
            }, 800);
          }
        }, index * 1200);
      });
    };

    // Play "Listen carefully" VO first, then play syllables after it finishes
    if (voiceGuidanceRef.current?.playVoice) {
      voiceGuidanceRef.current.playVoice('instructionListen', () => {
        // VO finished - now play syllables
        safeSetTimeout(playSyllables, 300);
      });
    } else {
      // No voice guidance - play syllables immediately
      playSyllables();
    }
  };

  const triggerWaitBanner = (message, playErrorVO = false) => {
    setWaitBannerMessage(message);
    setShowWaitBanner(true);
    safeSetTimeout(() => setShowWaitBanner(false), 1500);

    // Play error VO for wrong clicks
    if (playErrorVO && voiceGuidanceRef.current?.playVoice) {
      const errorVOs = ['errorOops', 'errorNotQuite', 'errorLetsTryAgain'];
      const randomError = errorVOs[Math.floor(Math.random() * errorVOs.length)];
      voiceGuidanceRef.current.playVoice(randomError);
    }
  };

  const handlePause = () => {
    setShowPauseModal(true);
    clearAllTimers();
    sequencePlayingRef.current = false; // Reset so sequence can replay on resume
    sequencePlayingRef.current = false;
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
    setShowPauseModal(false);
    clearAllTimers();
    sequencePlayingRef.current = false;
    setGamePhase('waiting');
    setCurrentRound(1);
  };

  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (isCountingDown) { triggerWaitBanner('Wait! Get ready... ⏰'); return; }
      if (!canPlayerClick || isSequencePlaying) { triggerWaitBanner('Listen first! 👂'); return; }
      // Stop any lingering VO (Listen/Your turn) on tap
      if (voiceGuidanceRef.current?.stopVoice) {
        voiceGuidanceRef.current.stopVoice();
      }
      
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (roundClicks[`elephant-${clickedSyllable}`]) { triggerWaitBanner('Already clicked! 🐘'); return; }
      
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) { triggerWaitBanner('Click in order! 🎯', true); return; }
      
      setShowIdleHint(false); // Reset idle hint
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
        const totalSyllables = currentSequence.length;
        const finalBloomBeforeGlow = totalSyllables === 2 ? 75 : 
                                      totalSyllables === 3 ? 75 : 
                                      90; 
        setCentralBloomProgress(finalBloomBeforeGlow);
        safeSetTimeout(() => {
          setCentralElementGlowing(true);
        }, 500);
      } else {
        const totalSyllables = currentSequence.length;
        const progressPerClick = totalSyllables === 2 ? 50 : 
                                  totalSyllables === 3 ? 33 : 
                                  25;
        setCentralBloomProgress(newPlayerInput.length * progressPerClick);
      }
    });
  };

  const handleCentralElementClick = () => {
    safeClick(() => {
      if (!centralElementGlowing) return;
      // Stop any lingering VO before celebration
      if (voiceGuidanceRef.current?.stopVoice) {
        voiceGuidanceRef.current.stopVoice();
      }
      
      setShowIdleHint(false);
      setPlayerInput([...currentSequence, 'lotus']);
      
      const completeWordAudio = gameConfig.audio.completeWordFile;
      if (completeWordAudio) {
        const audio = new Audio(completeWordAudio);
        audio.play().catch(e => console.error('Audio play error:', e));
      }
      
      setCentralBloomProgress(100);
      setCentralElementGlowing(false);
      
      safeSetTimeout(() => {
        handleRoundSuccess();
      }, 1500);
    });
  };

  const handleRoundSuccess = () => {
    setCanPlayerClick(false);
    setGamePhase('celebration');

    // Play random encouragement VO
    if (voiceGuidanceRef.current?.playVoice) {
      const encouragements = ['encourageAmazing', 'encourageFantastic', 'encourageGreatJob', 'encouragePerfect', 'encourageWellDone', 'encourageWonderful'];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      voiceGuidanceRef.current.playVoice(randomEncouragement);
    }

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

  // Track if game start VO has been played
  const gameStartVOPlayedRef = useRef(false);
  // Track if we're currently waiting for game start VO to finish (prevents race condition)
  const waitingForGameStartVORef = useRef(false);
  // Track if countdown has already been triggered for current round (prevents duplicate triggers)
  const countdownTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isActive || !gameConfig) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    gameStartVOPlayedRef.current = false; // Reset for new game
    waitingForGameStartVORef.current = false;
    countdownTriggeredRef.current = false;
    startNewRound(1);
  }, [isActive, gameConfig]);

  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      // Guard: Don't re-trigger if VO is still playing or countdown already started
      if (waitingForGameStartVORef.current || countdownTriggeredRef.current) return;

      // Play game start VO first (only once), then start countdown after it finishes
      if (!gameStartVOPlayedRef.current && voiceGuidanceRef.current?.playVoice) {
        gameStartVOPlayedRef.current = true;
        waitingForGameStartVORef.current = true;
        // Determine which VO to play based on game
        const gameStartVOKey = gameConfig.id === 'vakratunda' ? 'vakratundaGameStart' : 'mahakayaGameStart';
        voiceGuidanceRef.current.playVoice(gameStartVOKey, () => {
          // VO finished - now start countdown
          waitingForGameStartVORef.current = false;
          countdownTriggeredRef.current = true;
          safeSetTimeout(() => startCountdown(), 500);
        });
      } else if (gameStartVOPlayedRef.current) {
        // VO already played (subsequent rounds), start countdown immediately
        countdownTriggeredRef.current = true;
        safeSetTimeout(() => startCountdown(), 1000);
      } else {
        // No voice guidance, start countdown immediately
        countdownTriggeredRef.current = true;
        safeSetTimeout(() => startCountdown(), 1000);
      }
    }
  }, [gamePhase, currentSequence, isCountingDown, gameConfig]);

  // --- Render Helpers ---

  const isElephantSinging = (syllable) => singingSyllable === syllable;
  const isElephantClickable = (index) => canPlayerClick && index === playerInput.length;
  const hasElephantBeenClicked = (index) => index < playerInput.length;
  const isElephantActivated = (syllable) => activatedElephants[`elephant-${syllable}`];
  const isVisualRewardActive = (syllable) => visualRewards[`visual-${syllable}`];
  const isNextExpected = (index) => canPlayerClick && index === playerInput.length;

  const renderElephant = (syllable, index) => {
    if (!assetGetters) return null;
    
    const position = gameConfig.elements.clicker?.positions?.[index] || { left: '50%', top: '50%' };
    let getImage;
    if (gameConfig.elements.clicker.assetGetters) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetters[syllable]];
    } else if (gameConfig.elements.clicker.assetGetter) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
    }
    if (!getImage) return null;

    const clickable = isElephantClickable(index);
    const clicked = hasElephantBeenClicked(index);
    const singing = isElephantSinging(syllable);
    const activated = isElephantActivated(syllable);
    const next = isNextExpected(index);

    // Dynamic Class Logic
    let className = `${gamePrefix}-clicker-element`;
    if (singing) className += ' singing';
    const isPlayingPhase = isSequencePlaying || gamePhase === 'playing';
    // If it's the next clickable item, give it a gentle pulse (not during playback)
    if (next && !clicked && !isPlayingPhase) className += ' pulse';
    // If idle time passed, give it the strong glow (not during playback)
    if (showIdleHint && next && !clicked && !isPlayingPhase) className += ' hint-glow';

    return (
      <button
        key={`elephant-${syllable}`}
        className={className}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          transform: 'translate(-50%, -50%)', // ✅ FIX: Match CSS base transform to prevent jumping
          border: 'none',
          background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          zIndex: 20,
          borderRadius: '50%',
          opacity: clickable || clicked ? 1 : 0.6,
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable}
      >
        <img src={getImage(index)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {/* Only the music note when singing - no other clutter */}
        {singing && <div style={{ position: 'absolute', top: '-20px', left: '50%', fontSize: '20px', animation: 'musicNote 0.6s' }}>🎵</div>}
        
        {/* Simple Label */}
      <div style={{
  position: 'absolute',
  bottom: '-34px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: clicked ? '#C8F2C2' : 'rgba(255,255,255,0.85)',
  color: '#2E7D32',
  padding: '6px 10px',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  border: '1px solid rgba(0,0,0,0.08)'
}}>
  {syllable}
</div>
        
        {/* Simple Checkmark when done */}
        {clicked && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', background: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div>}
      </button>
    );
  };

  // ... (renderDualInitials, renderDualRewards, renderPreviousCentralElements omitted - same as before) ...
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

  const renderPreviousCentralElements = () => {
    if (!gameConfig.elements.centralSynthesis?.showPreviousRounds) return null;
    if (!currentRound || currentRound === 1) return null;
    
    const previousElements = [];
    
    for (let round = 1; round < currentRound; round++) {
      const position = gameConfig.elements.centralSynthesis.positions[round - 1];
      let getRewardImage;
      const rewardGetters = gameConfig.elements.centralSynthesis.assetGettersByRound;
      
      if (rewardGetters && rewardGetters[round]) {
        getRewardImage = assetGetters[rewardGetters[round].reward];
      } else {
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

  const renderCentralSynthesis = () => {
    if (!gameConfig.elements.centralSynthesis?.enabled) return null;
    if (!currentRound) return null;

    const position = gameConfig.elements.centralSynthesis.positions[currentRound - 1];
    if (!position) return null;

    let initialKey = gameConfig.elements.centralSynthesis.assetGetterInitial;
    let rewardKey = gameConfig.elements.centralSynthesis.assetGetterReward;

    if (gameConfig.elements.centralSynthesis.assetGettersByRound && 
        gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound]) {
        initialKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].initial;
        rewardKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].reward;
    }

    const getInitialImage = assetGetters[initialKey];
    const getRewardImage = assetGetters[rewardKey];
    if (!getInitialImage || !getRewardImage) return null;

    const isFullyBloomed = centralBloomProgress === 100;
    const budImage = getInitialImage(0);
    const bloomImage = getRewardImage(0);

    let className = `${gamePrefix}-central-synthesis`;
    if (centralElementGlowing) {
      className += ' pulse'; // Pulse when ready
      if (showIdleHint) className += ' hint-glow'; // Strong glow if waiting
    }

    return (
      <div
        className={className}
        onClick={centralElementGlowing ? handleCentralElementClick : undefined}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)', // ✅ FIX: Match CSS base transform to prevent jumping
          zIndex: 20,
          cursor: centralElementGlowing ? 'pointer' : 'default',
          transition: 'all 0.5s ease',
          pointerEvents: centralElementGlowing ? 'auto' : 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: isFullyBloomed ? 0 : (1 - centralBloomProgress / 100),
          transition: 'opacity 0.5s ease'
        }}>
          <img src={budImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bud" />
        </div>

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

        <div
          style={{
            position: 'absolute',
            bottom: '-36px',
            left: '50%',
            transform: `translateX(-50%) scale(${centralElementGlowing ? 1.08 : 1})`,
            transition: 'all 0.2s ease-out',
            background: isFullyBloomed
              ? 'linear-gradient(180deg, #FFF7CC, #FFE082)'
              : 'rgba(255,255,255,0.9)',
            color: '#7A5C00',
            padding: '8px 14px',
            borderRadius: '18px',
            fontSize: currentSequence.length > 8 ? '14px' : '15px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            whiteSpace: 'nowrap',
            border: '2px solid rgba(255,215,0,0.6)',
            boxShadow: isFullyBloomed
              ? '0 4px 14px rgba(255,215,0,0.35)'
              : '0 2px 6px rgba(0,0,0,0.12)',
            textTransform: 'capitalize'
          }}
        >
          {currentSequence.join('')}
        </div>

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
      {/* Pause button hidden per request */}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />

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
              {currentSequence.map((s, i) => renderElephant(s, i))}
            </>
          )}
          {renderPreviousCentralElements()}
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
