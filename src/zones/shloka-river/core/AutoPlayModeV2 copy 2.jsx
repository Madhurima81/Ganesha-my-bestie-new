// zones/shloka-river/core/AutoPlayModeV2.jsx
// V2: One-syllable-at-a-time flow
// Round 1 & 2: Listen → auto-play syllable → "Tap it" → kid taps → next syllable → lotus tap
// Round 3: No auto-play, kid taps known chunks → lotus tap

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';
import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';

const AutoPlayModeV2 = ({
  gameConfig,
  assetGetters,
  gamePrefix = 'default',
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  voiceGuidance = null,
}) => {

  const { safeClick } = useSafeClick(300);

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  // Phases: 'waiting' | 'playing_syllable' | 'listening_syllable' | 'waiting_lotus' | 'celebration' | 'phase_complete'
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0); // Which syllable we're on
  const [playerInput, setPlayerInput] = useState([]);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);

  // Visual state
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});

  // Animation state
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);
  const [waitBannerMessage, setWaitBannerMessage] = useState('');
  const [showWaitBanner, setShowWaitBanner] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Hint State
  const [showIdleHint, setShowIdleHint] = useState(false);

  // Central synthesis states
  const [centralElementGlowing, setCentralElementGlowing] = useState(false);
  const [centralBloomProgress, setCentralBloomProgress] = useState(0);
    const [showLotusSparkles, setShowLotusSparkles] = useState(false);
  

  // Refs
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const flowInProgressRef = useRef(false);

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

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  // Store voiceGuidance in a ref to avoid effect re-fires
  const voiceGuidanceRef = useRef(voiceGuidance);
  useEffect(() => {
    voiceGuidanceRef.current = voiceGuidance;
  }, [voiceGuidance]);

  // 10-Second Idle Hint Timer
  useEffect(() => {
    let idleTimer;
    if ((gamePhase === 'listening_syllable' || gamePhase === 'waiting_lotus') && canPlayerClick) {
      idleTimer = setTimeout(() => {
        setShowIdleHint(true);
        if (voiceGuidanceRef.current?.playVoice) {
          // Alternate between hints randomly
          const hints = ['hintTapTheShiny', 'hintLookForGlow'];
          const randomHint = hints[Math.floor(Math.random() * hints.length)];
          voiceGuidanceRef.current.playVoice(randomHint);
        }
      }, 10000);
    } else {
      setShowIdleHint(false);
    }
    return () => clearTimeout(idleTimer);
  }, [gamePhase, canPlayerClick, playerInput]);

  // Audio
  const playSyllableAudio = (syllable, onEnded) => {
    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) {
        if (onEnded) onEnded();
        return;
      }
      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      if (onEnded) {
        audio.onended = onEnded;
        audio.onerror = () => onEnded();
      }
      audio.play().catch(e => {
        console.log('Audio fallback:', e);
        if (onEnded) onEnded();
      });
    } catch (error) {
      console.log('Audio error:', error);
      if (onEnded) onEnded();
    }
  };

  const maxRound = gameConfig ? Object.keys(gameConfig.syllables).length : 3;
  const isRound3 = currentRound === maxRound; // Last round = chunk round

  const getSequenceForRound = (round) => gameConfig.syllables[round] || [];

  // ==========================================
  // START NEW ROUND
  // ==========================================
  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({});
    setCurrentSyllableIndex(0);
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setShowIdleHint(false);
    flowInProgressRef.current = false;

    setCentralElementGlowing(false);
    setCentralBloomProgress(0);
        setShowLotusSparkles(false);
    setActivatedElephants({});
    setVisualRewards({});
  };

  // ==========================================
  // VO HELPER: Get the correct "tap lotus/lily" VO per round & game
  // ==========================================
  const getCentralTapVO = () => {
    const isMahakaya = gameConfig.id === 'mahakaya';
    const isLastRound = currentRound === maxRound;

    if (isMahakaya) {
      // Mahakaya uses lily
      if (isLastRound) return 'instructionTapLilyUnlock';   // Round 3: "Tap the lily to unlock"
      if (currentRound === 2) return 'instructionTapLily';  // Round 2: "Tap the lily"
      return 'instructionTapLilyWord';                       // Round 1: "Tap the lily to hear the word"
    } else {
      // Vakratunda (and others) uses lotus
      if (isLastRound) return 'instructionTapLotusUnlock';   // Round 3: "Tap the lotus to unlock"
      if (currentRound === 2) return 'instructionTapLotus';  // Round 2: "Tap the lotus"
      return 'instructionTapLotusWord';                       // Round 1: "Tap the lotus to hear the word"
    }
  };

  // ==========================================
  // CORE FLOW: One syllable at a time
  // ==========================================

  // Natural random delay helper (between min and max ms)
  const naturalDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Start the flow for current syllable index
  const startSyllableFlow = (syllableIdx) => {
    if (flowInProgressRef.current) return;
    flowInProgressRef.current = true;

    const syllable = currentSequence[syllableIdx];
    if (!syllable) return;

    const isLastRound = currentRound === maxRound;

    if (isLastRound) {
      // ROUND 3: No auto-play — just VO prompt and wait for tap
      setGamePhase('listening_syllable');
      setCanPlayerClick(true);

      // VO: "Tap the elephant"
      if (voiceGuidanceRef.current?.playVoice) {
        voiceGuidanceRef.current.playVoice('instructionTapTheElephant');
      }
    } else {
      // ROUND 1 & 2: Listen → auto-play → "Tap it" → wait for tap
      setGamePhase('playing_syllable');
      setCanPlayerClick(false);

      // Step 1: VO "Listen"
      if (voiceGuidanceRef.current?.playVoice) {
        voiceGuidanceRef.current.playVoice('instructionListen', () => {
          // Step 2: Auto-play the syllable (natural pause after "Listen")
          safeSetTimeout(() => {
            setSingingSyllable(syllable);
            playSyllableAudio(syllable, () => {
              setSingingSyllable(null);
              // Step 3: VO "Tap and repeat" — enable tap at START of VO, not after it ends
              safeSetTimeout(() => {
                setGamePhase('listening_syllable');
                setCanPlayerClick(true); // Enable tap NOW — VO is the go-signal
                flowInProgressRef.current = false;
                if (voiceGuidanceRef.current?.playVoice) {
                  voiceGuidanceRef.current.playVoice('instructionTapAndRepeat');
                  // VO plays in background; child can tap immediately and stopVoice() cuts it
                }
              }, naturalDelay(400, 700)); // Breathe after syllable sound
            });
          }, naturalDelay(500, 800)); // Anticipation gap after "Listen"
        });
      } else {
        // No voice guidance — just auto-play
        setSingingSyllable(syllable);
        playSyllableAudio(syllable, () => {
          setSingingSyllable(null);
          setGamePhase('listening_syllable');
          setCanPlayerClick(true);
          flowInProgressRef.current = false;
        });
      }
    }
  };



  // ==========================================
  // HANDLE ELEPHANT TAP
  // ==========================================
  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (!canPlayerClick) {
        triggerWaitBanner('Listen first! 👂');
        return;
      }

      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;

      // Must tap the CURRENT syllable (one at a time)
      if (syllableIndex !== currentSyllableIndex) {
        triggerWaitBanner('Not this one! 🎯', true);
        return;
      }

      if (roundClicks[`elephant-${clickedSyllable}`]) {
        triggerWaitBanner('Already tapped! 🐘');
        return;
      }
       // Stop any playing VO ("Tap and repeat" / "Listen") so it doesn't overlap with syllable audio
      if (voiceGuidanceRef.current?.stopVoice) {
        voiceGuidanceRef.current.stopVoice();
      }

      setShowIdleHint(false);
      setCanPlayerClick(false);

      // Water spray effect (visual — runs in parallel, no audio conflict)
      if (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') {
        const position = gameConfig.elements.clicker.positions[syllableIndex];
        if (position) {
          setWaterSprayPosition({ left: position.left, top: position.top });
          safeSetTimeout(() => setWaterSprayPosition(null), 1000);
        }
      }

      // Mark this syllable as done (visual updates — immediate)
      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));

      // Bloom progress
      const totalSyllables = currentSequence.length;
      const progressPerClick = Math.floor(80 / totalSyllables);
      setCentralBloomProgress(newPlayerInput.length * progressPerClick);

      // Play syllable audio — EVERYTHING else waits until this finishes
      setSingingSyllable(clickedSyllable);
      playSyllableAudio(clickedSyllable, () => {
        setSingingSyllable(null);

        // Syllable audio done → beat of silence → then proceed
        const nextIdx = currentSyllableIndex + 1;
        if (nextIdx >= currentSequence.length) {
          // All syllables done → breathe → lotus phase
          safeSetTimeout(() => {
            setCentralElementGlowing(true);
            setGamePhase('waiting_lotus');
            setCanPlayerClick(true);
            flowInProgressRef.current = false;

            // VO plays in background; stopVoice() cuts it if child taps fast
            if (voiceGuidanceRef.current?.playVoice) {
              const centralVO = getCentralTapVO();
              voiceGuidanceRef.current.playVoice(centralVO);
            }
          }, naturalDelay(400, 700)); // Breathe after syllable before lotus glows
        } else {
          // More syllables → breathe → next syllable flow
          setCurrentSyllableIndex(nextIdx);
          safeSetTimeout(() => {
            flowInProgressRef.current = false;
            startSyllableFlow(nextIdx);
          }, naturalDelay(600, 1000)); // Breathe between syllables
        }
      });
    });
  };

  // ==========================================
  // HANDLE LOTUS TAP
  // ==========================================
  const handleCentralElementClick = () => {
    safeClick(() => {
      if (!centralElementGlowing || !canPlayerClick) return;

      // Stop any lingering VO (lotus instruction) before playing word audio
      if (voiceGuidanceRef.current?.stopVoice) {
        voiceGuidanceRef.current.stopVoice();
      }

      setShowIdleHint(false);
      setCanPlayerClick(false);
      setPlayerInput([...currentSequence, 'lotus']);
      setShowLotusSparkles(true);
      setCentralBloomProgress(100);
      setCentralElementGlowing(false);

      // Play complete word audio — chain celebration AFTER it finishes
      const completeWordAudio = gameConfig.audio.completeWordByRound?.[currentRound]
        || gameConfig.audio.completeWordFile;

      const proceedAfterAudio = () => {
        // Word audio done → beat of silence → celebration
        safeSetTimeout(() => {
          setShowLotusSparkles(false);
          handleRoundSuccess();
        }, naturalDelay(400, 700)); // Breathe after word before celebration
      };

      if (completeWordAudio) {
        const audio = new Audio(completeWordAudio);
        audio.onended = proceedAfterAudio;
        audio.onerror = () => proceedAfterAudio();
        audio.play().catch(e => {
          console.error('Audio play error:', e);
          proceedAfterAudio();
        });
      } else {
        // No audio file — proceed after a short pause
        safeSetTimeout(proceedAfterAudio, 500);
      }
    });
  };

  // ==========================================
  // ROUND SUCCESS
  // ==========================================
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

  // ==========================================
  // WAIT BANNER
  // ==========================================
  const triggerWaitBanner = (message, playErrorVO = false) => {
    setWaitBannerMessage(message);
    setShowWaitBanner(true);
    safeSetTimeout(() => setShowWaitBanner(false), 1500);

    if (playErrorVO && voiceGuidanceRef.current?.playVoice) {
      const errorVOs = ['errorOops', 'errorNotQuite', 'errorLetsTryAgain'];
      const randomError = errorVOs[Math.floor(Math.random() * errorVOs.length)];
      voiceGuidanceRef.current.playVoice(randomError);
    }
  };

  // ==========================================
  // PAUSE / CONTINUE
  // ==========================================
  const handlePause = () => {
    setShowPauseModal(true);
    clearAllTimers();
    flowInProgressRef.current = false;
  };

  const handleContinue = () => {
    setShowPauseModal(false);
    if (gamePhase === 'listening_syllable' || gamePhase === 'waiting_lotus') {
      setCanPlayerClick(true);
    } else if (gamePhase === 'waiting') {
      // Restart the syllable flow
      startSyllableFlow(currentSyllableIndex);
    } else if (gamePhase === 'playing_syllable') {
      startSyllableFlow(currentSyllableIndex);
    } else if (gamePhase === 'celebration') {
      if (currentRound < maxRound) {
        startNewRound(currentRound + 1);
      } else {
        handlePhaseComplete();
      }
    }
  };

  const handleExitToMenu = () => {
    setShowPauseModal(false);
    clearAllTimers();
    setGamePhase('waiting');
    setCurrentRound(1);
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  const gameStartVOPlayedRef = useRef(false);
  const waitingForGameStartVORef = useRef(false);

  useEffect(() => {
    if (!isActive || !gameConfig) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    gameStartVOPlayedRef.current = false;
    waitingForGameStartVORef.current = false;
    startNewRound(1);
  }, [isActive, gameConfig]);

  // When round starts (gamePhase='waiting'), play game start VO then begin syllable flow
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0) {
      if (waitingForGameStartVORef.current) return;

      if (!gameStartVOPlayedRef.current && voiceGuidanceRef.current?.playVoice) {
        gameStartVOPlayedRef.current = true;
        waitingForGameStartVORef.current = true;
        const gameStartVOKey = gameConfig.id === 'vakratunda' ? 'vakratundaGameStart' : 'mahakayaGameStart';
        voiceGuidanceRef.current.playVoice(gameStartVOKey, () => {
          waitingForGameStartVORef.current = false;
          safeSetTimeout(() => startSyllableFlow(0), 500);
        });
      } else {
        // Subsequent rounds — start syllable flow directly (small delay)
        safeSetTimeout(() => startSyllableFlow(0), 800);
      }
    }
  }, [gamePhase, currentSequence, gameConfig]);

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const isElephantSinging = (syllable) => singingSyllable === syllable;
  const hasElephantBeenClicked = (syllable) => roundClicks[`elephant-${syllable}`];
  const isCurrentTarget = (index) => canPlayerClick && index === currentSyllableIndex && !roundClicks[`elephant-${currentSequence[index]}`];
  const isVisualRewardActive = (syllable) => visualRewards[`visual-${syllable}`];

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

    const clicked = hasElephantBeenClicked(syllable);
    const singing = isElephantSinging(syllable);
    const isTarget = isCurrentTarget(index);

    let className = `${gamePrefix}-clicker-element`;
    if (singing) className += ' singing';
    if (isTarget && !clicked) className += ' pulse';
    if (showIdleHint && isTarget && !clicked) className += ' hint-glow';

    return (
      <button
        key={`elephant-${syllable}`}
        className={className}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          transform: 'translate(-50%, -50%)',
          border: 'none',
          background: 'transparent',
          cursor: isTarget ? 'pointer' : 'default',
          zIndex: 20,
          borderRadius: '50%',
          opacity: isTarget || clicked ? 1 : 0.4,
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!isTarget}
      >
        <img src={getImage(index)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {singing && <div style={{ position: 'absolute', top: '-20px', left: '50%', fontSize: '20px', animation: 'musicNote 0.6s' }}>🎵</div>}

   <div
  style={{
    position: 'absolute',
    bottom: '-34px',
    left: '50%',
    transform: clicked
      ? 'translateX(-50%) scale(1.08)'
      : 'translateX(-50%) scale(1)',
    transition: 'all 0.18s ease-out',
    background: clicked ? '#C8F2C2' : 'rgba(255,255,255,0.85)',
    color: '#2E7D32',
    padding: '6px 10px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    border: '1px solid rgba(0,0,0,0.08)'
  }}
>
  {syllable}
</div>


        {clicked && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', background: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div>}
      </button>
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
        if (singleGetter) getRewardImage = assetGetters[singleGetter];
      }
      if (!getRewardImage || !position) continue;

      previousElements.push(
        <div key={`prev-reward-${round}`} style={{ position: 'absolute', left: position.left, top: position.top, width: '100px', height: '100px', transform: 'translate(-50%, -50%)', zIndex: 18, opacity: 0.9 }}>
          <img src={getRewardImage(0)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={`Round ${round} reward`} />
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
      className += ' pulse';
      if (showIdleHint) className += ' hint-glow';
    }

    return (
      <div
        className={className}
        onClick={centralElementGlowing ? handleCentralElementClick : undefined}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          cursor: centralElementGlowing ? 'pointer' : 'default',
          transition: 'all 0.5s ease',
          pointerEvents: centralElementGlowing ? 'auto' : 'none',
        }}
      >
        <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: isFullyBloomed ? 0 : (1 - centralBloomProgress / 100), transition: 'opacity 0.5s ease' }}>
          <img src={budImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bud" />
        </div>
        <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: centralBloomProgress / 100, transform: `scale(${0.6 + (centralBloomProgress / 100) * 0.4})`, transition: 'all 0.5s ease' }}>
          <img src={bloomImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bloom" />
        </div>
    <div
  style={{
    position: 'absolute',
    bottom: '-36px',
    left: '50%',
    transform: 'translateX(-50%) scale(' + (centralElementGlowing ? 1.08 : 1) + ')',
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
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '24px', animation: 'sparkle 1s ease-in-out infinite' }}>✨</div>
        )}
        {showLotusSparkles && (
  <>
    <div style={{ position: 'absolute', top: '-18px', left: '50%', fontSize: '20px', animation: 'sparkleBurst1 1.2s ease-out forwards', pointerEvents: 'none' }}>✨</div>
    <div style={{ position: 'absolute', top: '10%', right: '-16px', fontSize: '18px', animation: 'sparkleBurst2 1s ease-out forwards', pointerEvents: 'none' }}>✨</div>
    <div style={{ position: 'absolute', bottom: '-12px', left: '20%', fontSize: '16px', animation: 'sparkleBurst3 1.1s ease-out forwards', pointerEvents: 'none' }}>✨</div>
    <div style={{ position: 'absolute', top: '20%', left: '-14px', fontSize: '18px', animation: 'sparkleBurst4 0.9s ease-out forwards', pointerEvents: 'none' }}>✨</div>
    <div style={{ position: 'absolute', bottom: '10%', right: '-10px', fontSize: '14px', animation: 'sparkleBurst5 1.3s ease-out forwards', pointerEvents: 'none' }}>✨</div>
  </>
)}
      </div>
    );
  };

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      {!hideElements && <UniversalPauseButton onPause={handlePause} disabled={gamePhase === 'phase_complete'} />}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />

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
        @keyframes countdownPulse { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0; } 50% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; } }
        @keyframes musicNote { 0% { transform: translateX(-50%) translateY(0); opacity: 0; } 50% { transform: translateX(-50%) translateY(-10px); opacity: 1; } 100% { transform: translateX(-50%) translateY(-20px); opacity: 0; } }
        @keyframes rewardAppear { 0% { transform: translate(-50%,-50%) scale(0) rotate(-180deg); opacity: 0; } 100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 1; } }
        @keyframes sparkle { 0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); } 50% { opacity: 0.5; transform: translateX(-50%) scale(1.2); } }
        @keyframes waterSplash { 0% { transform: translate(-50%,-100%) scale(0.5); opacity: 1; } 50% { transform: translate(-50%,-150%) scale(1.2); opacity: 0.8; } 100% { transform: translate(-50%,-200%) scale(1.5); opacity: 0; } }
        @keyframes sparkleBurst1 { 0% { opacity: 1; transform: translate(-50%, 0) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -30px) scale(1.3); } }
@keyframes sparkleBurst2 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(15px, -20px) scale(1.2); } }
@keyframes sparkleBurst3 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(-10px, 20px) scale(1.1); } }
@keyframes sparkleBurst4 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(-20px, -10px) scale(1.2); } }
@keyframes sparkleBurst5 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; 
      `}</style>
    </div>
  );
};

export default AutoPlayModeV2;
