// zones/shloka-river/core/AutoPlayModeV2.jsx
// V2: One-syllable-at-a-time flow with Pause Support

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';
import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';
import './SharedGameUI.css';
import SyllableVoiceChallenge from './SyllableVoiceChallenge';

const AutoPlayModeV2 = ({
  gameConfig,
  assetGetters,
  gamePrefix = 'default',
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  voiceGuidance = null,
  isPaused = false, // Receives state from parent
  onMicroWin,      // micro-reward gesture callback
  startRound = 1,
}) => {

  const { safeClick } = useSafeClick(300);

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(startRound);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
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
  const [isPauseButtonLocked, setIsPauseButtonLocked] = useState(false);

  // ── Voice challenge (Duolingo-style) ──────────────────────────────────────
  // Shown after kid taps elephant in non-final rounds.
  // { syllable, displayLabel, onComplete } | null
  const [voiceChallenge, setVoiceChallenge] = useState(null);

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
  
  // Track audio for pausing
  const currentAudioRef = useRef(null);

  // Track last VO and child action state for robust resume
  const lastInterruptibleVORef = useRef(null);
  const wasChildActionPendingRef = useRef(false);
  const syllablePlayingRef = useRef(null); // Track which syllable was playing when paused
  const lotusAudioPlayingRef = useRef(false); // Track if lotus completion audio was interrupted
  const lotusAudioSourceRef = useRef(null);   // Track which lotus audio file to replay on resume
  const pendingLotusTransitionRef = useRef(false); // Final elephant tapped, waiting to enter lotus phase
  const singingSyllableRef = useRef(null);

  // Ref-based pause tracking (avoids stale closures in audio callbacks)
  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { singingSyllableRef.current = singingSyllable; }, [singingSyllable]);

  // Guard against multiple rapid pause/resume cycles causing stacked callbacks
  const isResumingRef = useRef(false);
  const pendingResumeRef = useRef(false);
  const lastResumeTimeRef = useRef(0);
  const pauseButtonCooldownUntilRef = useRef(0);

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

  const lockPauseButton = (durationMs = 450) => {
    const unlockAt = Date.now() + durationMs;
    pauseButtonCooldownUntilRef.current = unlockAt;
    setIsPauseButtonLocked(true);
    safeSetTimeout(() => {
      if (Date.now() >= pauseButtonCooldownUntilRef.current) {
        setIsPauseButtonLocked(false);
      }
    }, durationMs + 30);
  };

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      clearAllTimers();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const voiceGuidanceRef = useRef(voiceGuidance);
  useEffect(() => {
    voiceGuidanceRef.current = voiceGuidance;
  }, [voiceGuidance]);

  // ==========================================
  // ⏸️ PAUSE / RESUME LOGIC
  // ==========================================
// ==========================================
  // ⏸️ PAUSE / RESUME LOGIC
  // ==========================================
  useEffect(() => {
    if (isPaused) {
      console.log('⏸️ AutoPlayModeV2: PAUSED');

      clearAllTimers();
      flowInProgressRef.current = false;
      isResumingRef.current = false;
      pendingResumeRef.current = false;

      if (voiceGuidanceRef.current?.stopVoice) {
        voiceGuidanceRef.current.stopVoice();
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setCanPlayerClick(false);

      // Clear water spray animation if active
      setWaterSprayPosition(null);

      // Store which syllable was singing (if any) before pause
      if (singingSyllable) {
        syllablePlayingRef.current = singingSyllable;
        console.log('⏸️ Paused during syllable:', singingSyllable);
      }
      setSingingSyllable(null);
      
    } else {
      // === RESUME LOGIC ===
      if (isActive && hasInitializedRef.current) {
        // GUARD: Prevent multiple simultaneous resumes (but allow retries after short delay)
        if (isResumingRef.current) {
          pendingResumeRef.current = true;
          console.log('⚠️ Skipping resume - already resuming');
          return;
        }

        isResumingRef.current = true;
        lastResumeTimeRef.current = Date.now();
        pendingResumeRef.current = false;

        const releaseResumeLock = () => {
          safeSetTimeout(() => {
            isResumingRef.current = false;
            if (!isPausedRef.current && pendingResumeRef.current) {
              pendingResumeRef.current = false;
              handleContinue();
            }
          }, 100);
        };

        console.log('▶️ AutoPlayModeV2: RESUMING from phase:', gamePhase);

        // Don't resume if game is already complete
        if (gamePhase === 'phase_complete') {
          releaseResumeLock();
          return;
        }

        // SPECIAL CASE: If paused during syllable audio playback (child clicked elephant)
        if (syllablePlayingRef.current) {
          console.log('▶️ Resuming syllable playback:', syllablePlayingRef.current);
          const syllableToReplay = syllablePlayingRef.current;
          syllablePlayingRef.current = null; // Clear the flag

          // Replay the syllable audio and continue flow
          setSingingSyllable(syllableToReplay);
          const started = playSyllableAudio(syllableToReplay, () => {
            if (isPausedRef.current) return;

            setSingingSyllable(null);
            const nextIdx = currentSyllableIndex + 1;

            if (nextIdx >= currentSequence.length) {
              safeSetTimeout(() => {
                if (isPausedRef.current) return;
                setCentralElementGlowing(true);
                setGamePhase('waiting_lotus');
                setCanPlayerClick(true);
                wasChildActionPendingRef.current = true;
                flowInProgressRef.current = false;
                if (voiceGuidanceRef.current?.playVoice) {
                  const centralVO = getCentralTapVO();
                  lastInterruptibleVORef.current = centralVO;
                  voiceGuidanceRef.current.playVoice(centralVO);
                }
              }, naturalDelay(400, 700));
            } else {
              setCurrentSyllableIndex(nextIdx);
              safeSetTimeout(() => {
                if (isPausedRef.current) return;
                flowInProgressRef.current = false;
                startSyllableFlow(nextIdx);
              }, naturalDelay(600, 1000));
            }
          });
          if (!started) {
            setSingingSyllable(null);
            flowInProgressRef.current = false;
            releaseResumeLock();
            return;
          }
          releaseResumeLock();
          return; // Early return - don't execute other resume logic
        }

        // SPECIAL CASE: If paused during lotus completion audio, replay it and continue flow
        if (gamePhase === 'waiting_lotus' && lotusAudioPlayingRef.current) {
          replayLotusAudioAfterPause();
          releaseResumeLock();
          return;
        }

        // SPECIAL CASE: Final elephant was already completed before pause.
        // Resume into lotus phase instead of replaying "tap elephant".
        if (
          gamePhase === 'listening_syllable' &&
          (pendingLotusTransitionRef.current || playerInput.length >= currentSequence.length)
        ) {
          pendingLotusTransitionRef.current = false;
          setCentralElementGlowing(true);
          setGamePhase('waiting_lotus');
          setCanPlayerClick(true);
          wasChildActionPendingRef.current = true;
          flowInProgressRef.current = false;
          if (voiceGuidanceRef.current?.playVoice) {
            const centralVO = getCentralTapVO();
            lastInterruptibleVORef.current = centralVO;
            voiceGuidanceRef.current.playVoice(centralVO);
          }
          releaseResumeLock();
          return;
        }

        if (gamePhase === 'playing_syllable') {
           // Paused during "Listen" VO or syllable audio → restart flow
           startSyllableFlow(currentSyllableIndex);

        } else if (gamePhase === 'listening_syllable') {
           // Paused while waiting for child to tap elephant → re-enable + replay last VO
           // Round 3 uses 'instructionTapTheElephant', other rounds use 'instructionTapAndRepeat'
           setCanPlayerClick(true);
           wasChildActionPendingRef.current = true;
           if (voiceGuidanceRef.current?.playVoice) {
              const replayVO = lastInterruptibleVORef.current || 'instructionTapAndRepeat';
              voiceGuidanceRef.current.playVoice(replayVO);
           }

        } else if (gamePhase === 'waiting_lotus') {
           // Skip if syllable was playing (handled by special case above)
           if (syllablePlayingRef.current) {
             // Do nothing - syllable resume logic already handled this
           } else {
             const lotusAlreadyTapped = playerInput.includes('lotus');
             if (lotusAlreadyTapped) {
               setCentralElementGlowing(false);
               setCanPlayerClick(false);
               wasChildActionPendingRef.current = false;
               safeSetTimeout(() => {
                 if (isPausedRef.current) return;
                 setShowLotusSparkles(false);
                 handleRoundSuccess();
               }, naturalDelay(300, 500));
             } else {
               setCentralElementGlowing(true);
               setCanPlayerClick(true);
               wasChildActionPendingRef.current = true;
               if (voiceGuidanceRef.current?.playVoice) {
                 const centralVO = getCentralTapVO();
                 voiceGuidanceRef.current.playVoice(centralVO);
               }
             }
           }

        } else if (gamePhase === 'celebration') {
           // Paused during celebration → resume round transition timer
           safeSetTimeout(() => {
             if (currentRound < maxRound) {
               startNewRound(currentRound + 1);
             } else {
               handlePhaseComplete();
             }
           }, 1500);

        } else if (gamePhase === 'waiting' && currentSequence.length > 0) {
           startSyllableFlow(currentSyllableIndex);

        } else {
           // Fallback: if child action was pending, replay last VO
           if (wasChildActionPendingRef.current) {
             setCanPlayerClick(true);
             if (lastInterruptibleVORef.current && voiceGuidanceRef.current?.playVoice) {
               voiceGuidanceRef.current.playVoice(lastInterruptibleVORef.current);
             }
           }
        }

        releaseResumeLock();
      }
    }
  }, [isPaused, isActive]);

  // Idle Hints
  useEffect(() => {
    let firstTimer;
    let repeatTimer;
    const firstHintDelayMs = 20000;
    const repeatHintBaseMs = 20000;
    const repeatHintJitterMs = 4000;

    if ((gamePhase === 'listening_syllable' || gamePhase === 'waiting_lotus') && canPlayerClick && !isPaused) {
      const playIdleHint = () => {
        // Don't interrupt active audio flows with idle hints
        if (isPausedRef.current || singingSyllableRef.current || lotusAudioPlayingRef.current || currentAudioRef.current) return;
        setShowIdleHint(true);
        if (voiceGuidanceRef.current?.playVoice) {
          const hints = ['hintTapTheShiny', 'hintLookForGlow'];
          const randomHint = hints[Math.floor(Math.random() * hints.length)];
          voiceGuidanceRef.current.playVoice(randomHint);
        }
      };

      firstTimer = setTimeout(() => {
        playIdleHint();
        repeatTimer = setInterval(() => {
          playIdleHint();
        }, repeatHintBaseMs + Math.floor(Math.random() * repeatHintJitterMs));
      }, firstHintDelayMs);
    } else {
      setShowIdleHint(false);
    }

    return () => {
      clearTimeout(firstTimer);
      clearInterval(repeatTimer);
    };
  }, [gamePhase, canPlayerClick, playerInput, isPaused]);

  // Audio Player
  const playSyllableAudio = (syllable, onEnded) => {
    if (isPausedRef.current) return false;

    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) {
        if (onEnded) onEnded();
        return false;
      }
      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      
      currentAudioRef.current = audio;
      audio.volume = 0.8;
      
      const handleEnd = () => {
        currentAudioRef.current = null;
        if (onEnded) onEnded();
      };

      audio.onended = handleEnd;
      audio.onerror = handleEnd;
      
      audio.play().catch(e => {
        console.log('Audio fallback:', e);
        handleEnd();
      });
      return true;
    } catch (error) {
      console.log('Audio error:', error);
      if (onEnded) onEnded();
      return false;
    }
  };

  const maxRound = gameConfig ? Object.keys(gameConfig.syllables).length : 3;
  const effectiveStartRound = Math.min(Math.max(startRound || 1, 1), maxRound);
  
  const getSequenceForRound = (round) => gameConfig.syllables[round] || [];

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
    wasChildActionPendingRef.current = false;
    lastInterruptibleVORef.current = null;
    lotusAudioPlayingRef.current = false;
    lotusAudioSourceRef.current = null;
    pendingLotusTransitionRef.current = false;

    setCentralElementGlowing(false);
    setCentralBloomProgress(0);
    setShowLotusSparkles(false);
    setActivatedElephants({});
    setVisualRewards({});
  };

  const getCentralTapVO = () => {
    const isMahakaya = gameConfig.id === 'mahakaya';
    const isLastRound = currentRound === maxRound;

    if (isMahakaya) {
      if (isLastRound) return 'instructionTapLilyUnlock';
      if (currentRound === 2) return 'instructionTapLily';
      return 'instructionTapLilyWord';
    } else {
      if (isLastRound) return 'instructionTapLotusUnlock';
      if (currentRound === 2) return 'instructionTapLotus';
      return 'instructionTapLotusWord';
    }
  };

  const naturalDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const continueAfterLotusAudio = () => {
    if (isPausedRef.current) return;
    safeSetTimeout(() => {
      if (isPausedRef.current) return;
      setShowLotusSparkles(false);
      // Voice challenge: say the assembled word before advancing to next round
      const fullWord = currentSequence.join('');
      const wordAudioFile = gameConfig.audio.completeWordByRound?.[currentRound] || gameConfig.audio.completeWordFile;
      setVoiceChallenge({
        syllable: fullWord,
        displayLabel: fullWord.toUpperCase(),
        replayAudio: wordAudioFile ? () => { const a = new Audio(wordAudioFile); a.play().catch(() => {}); } : undefined,
        stopAudio: () => {
          if (voiceGuidanceRef.current?.stopVoice) voiceGuidanceRef.current.stopVoice();
          if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
        },
        onComplete: () => {
          setVoiceChallenge(null);
          handleRoundSuccess();
        },
      });
    }, naturalDelay(400, 700));
  };

  const replayLotusAudioAfterPause = () => {
    const completeWordAudio =
      lotusAudioSourceRef.current ||
      gameConfig.audio.completeWordByRound?.[currentRound] ||
      gameConfig.audio.completeWordFile;

    if (!completeWordAudio) {
      lotusAudioPlayingRef.current = false;
      lotusAudioSourceRef.current = null;
      continueAfterLotusAudio();
      return;
    }

    lotusAudioPlayingRef.current = true;
    lotusAudioSourceRef.current = completeWordAudio;

    const audio = new Audio(completeWordAudio);
    currentAudioRef.current = audio;

    const finishLotusAudio = () => {
      currentAudioRef.current = null;
      lotusAudioPlayingRef.current = false;
      lotusAudioSourceRef.current = null;
      continueAfterLotusAudio();
    };

    audio.onended = finishLotusAudio;
    audio.onerror = finishLotusAudio;
    audio.play().catch(finishLotusAudio);
  };

  // ==========================================
  // CORE FLOW 
  // ==========================================
  const startSyllableFlow = (syllableIdx) => {
    if (flowInProgressRef.current || isPausedRef.current) return;
    
    flowInProgressRef.current = true;
    const syllable = currentSequence[syllableIdx];
    if (!syllable) {
      flowInProgressRef.current = false;
      return;
    }

    setGamePhase('playing_syllable');
    setCanPlayerClick(false);
    wasChildActionPendingRef.current = false;

    // Only play intro guidance once at the first tappable elephant of the configured start round.
    const isFirstElephantOfGame = currentRound === effectiveStartRound && syllableIdx === 0;

    const runAudioSequence = () => {
        if (isPausedRef.current) { flowInProgressRef.current = false; return; }

        setSingingSyllable(syllable);
        const started = playSyllableAudio(syllable, () => {
            setSingingSyllable(null);

            if (isPausedRef.current) { flowInProgressRef.current = false; return; }

              const postAudioDelay = isFirstElephantOfGame ? 1000 : naturalDelay(400, 700);
              safeSetTimeout(() => {
                if (isPausedRef.current) { flowInProgressRef.current = false; return; }
                setGamePhase('listening_syllable');
                setCanPlayerClick(true);
                wasChildActionPendingRef.current = true;
                flowInProgressRef.current = false;
                if (voiceGuidanceRef.current?.playVoice && !isPausedRef.current && isFirstElephantOfGame) {
                  lastInterruptibleVORef.current = 'instructionTapAndRepeat';
                  voiceGuidanceRef.current.playVoice('instructionTapAndRepeat');
                }
              }, postAudioDelay);
            });
        if (!started) {
          setSingingSyllable(null);
          flowInProgressRef.current = false;
          return;
        }
    };

    if (voiceGuidanceRef.current?.playVoice && isFirstElephantOfGame) {
      lastInterruptibleVORef.current = 'instructionListen';
      voiceGuidanceRef.current.playVoice('instructionListen', () => {
           if (isPausedRef.current) { flowInProgressRef.current = false; return; }
           safeSetTimeout(runAudioSequence, naturalDelay(500, 800));
      });
    } else {
      runAudioSequence();
    }
  };

  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (!canPlayerClick) { triggerWaitBanner('Listen first! 👂'); return; }

      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (syllableIndex !== currentSyllableIndex) { triggerWaitBanner('Not this one! 🎯', true); return; }
      if (roundClicks[`elephant-${clickedSyllable}`]) { triggerWaitBanner('Already tapped! 🐘'); return; }
      
      if (voiceGuidanceRef.current?.stopVoice) voiceGuidanceRef.current.stopVoice();

      setShowIdleHint(false);
      setCanPlayerClick(false);
      wasChildActionPendingRef.current = false;

      const isCustomElephantFlow =
        (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') &&
        currentRound === effectiveStartRound &&
        (syllableIndex === 0 || syllableIndex === 1);

      const triggerSprayForTap = () => {
        if (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') {
          const srcPos = gameConfig.elements.clicker?.positionsByRound?.[currentRound]?.[syllableIndex]
                      || gameConfig.elements.clicker.positions[syllableIndex];
          const tgtPos = gameConfig.elements.centralSynthesis?.positions?.[currentRound - 1];
          if (srcPos) {
            setWaterSprayPosition({ source: srcPos, target: tgtPos || null });
            safeSetTimeout(() => setWaterSprayPosition(null), 1300);
          }
        }
      };

      if (!isCustomElephantFlow) {
        triggerSprayForTap();
      }

      const totalSyllables = currentSequence.length;
      const progressPerClick = Math.floor(80 / totalSyllables);

      // Custom Vakratunda flow:
      // - no second syllable replay on tap
      // - no instant bloom on tap
      // - proceed only after SVC completes/closes/fallbacks
      if (isCustomElephantFlow) {
        const nextIdx = syllableIndex + 1;
        const newPlayerInput = [...playerInput, clickedSyllable];

        const applyTapSuccess = () => {
          setPlayerInput(newPlayerInput);
          setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
          setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
          setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));
          onMicroWin?.();
          triggerSprayForTap();
          if (gameConfig.id !== 'mahakaya') {
            setCentralBloomProgress(newPlayerInput.length * progressPerClick);
          }
        };

        const proceedToNext = () => {
          applyTapSuccess();
          if (nextIdx >= currentSequence.length) {
            pendingLotusTransitionRef.current = true;
            safeSetTimeout(() => {
              if (isPausedRef.current) return;
              pendingLotusTransitionRef.current = false;
              setCentralElementGlowing(true);
              setGamePhase('waiting_lotus');
              setCanPlayerClick(true);
              wasChildActionPendingRef.current = true;
              flowInProgressRef.current = false;
              if (voiceGuidanceRef.current?.playVoice) {
                const centralVO = getCentralTapVO();
                lastInterruptibleVORef.current = centralVO;
                voiceGuidanceRef.current.playVoice(centralVO);
              }
            }, naturalDelay(400, 700));
          } else {
            pendingLotusTransitionRef.current = false;
            setCurrentSyllableIndex(nextIdx);
            safeSetTimeout(() => {
              if (isPausedRef.current) return;
              flowInProgressRef.current = false;
              startSyllableFlow(nextIdx);
            }, naturalDelay(600, 1000));
          }
        };

        setVoiceChallenge({
          syllable: clickedSyllable,
          displayLabel: clickedSyllable.toUpperCase(),
          replayAudio: () => {},
          stopAudio: () => {
            if (voiceGuidanceRef.current?.stopVoice) voiceGuidanceRef.current.stopVoice();
            if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
          },
          inline: false,
          simpleMode: true,
          autoContinueOnSuccessMs: 0,
          onComplete: () => {
            setVoiceChallenge(null);
            proceedToNext();
          },
        });
        return;
      }

      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));

      // micro-reward: correct syllable tapped
      onMicroWin?.();

      // Mahakaya uses instant pop reveal — keep progress at 0 until the central tree tap
      if (gameConfig.id !== 'mahakaya') {
        setCentralBloomProgress(newPlayerInput.length * progressPerClick);
      }

      setSingingSyllable(clickedSyllable);
      playSyllableAudio(clickedSyllable, () => {
        // Guard: if paused while audio was playing, don't continue the flow
        if (isPausedRef.current) return;

        setSingingSyllable(null);

        // ── Voice challenge insertion point ──────────────────────────────
        // Capture the next-flow as a closure so we can defer it until after
        // the child has had a chance to repeat the syllable (or skip).
        //
        // Use syllableIndex (the verified click parameter) rather than
        // currentSyllableIndex (React state) so the closure can never read
        // a stale state value — the guard on line 592 already proved they
        // are equal, but state reads inside an async audio callback can
        // lag behind committed renders.
        const nextIdx = syllableIndex + 1;

        const proceedToNext = () => {
          if (isCustomElephantFlow) {
            triggerSprayForTap();
            if (gameConfig.id !== 'mahakaya') {
              setCentralBloomProgress(newPlayerInput.length * progressPerClick);
            }
          }
          if (nextIdx >= currentSequence.length) {
            pendingLotusTransitionRef.current = true;
            safeSetTimeout(() => {
              if (isPausedRef.current) return;
              pendingLotusTransitionRef.current = false;
              setCentralElementGlowing(true);
              setGamePhase('waiting_lotus');
              setCanPlayerClick(true);
              wasChildActionPendingRef.current = true;
              flowInProgressRef.current = false;
              if (voiceGuidanceRef.current?.playVoice) {
                const centralVO = getCentralTapVO();
                lastInterruptibleVORef.current = centralVO;
                voiceGuidanceRef.current.playVoice(centralVO);
              }
            }, naturalDelay(400, 700));
          } else {
            pendingLotusTransitionRef.current = false;
            setCurrentSyllableIndex(nextIdx);
            safeSetTimeout(() => {
              if (isPausedRef.current) return;
              flowInProgressRef.current = false;
              startSyllableFlow(nextIdx);
            }, naturalDelay(600, 1000));
          }
        };

        // Show voice challenge only in learning rounds (not the final assembly round)
        const isLastRound = currentRound === maxRound;
        if (!isLastRound || isCustomElephantFlow) {
          setVoiceChallenge({
            syllable: clickedSyllable,
            displayLabel: clickedSyllable.toUpperCase(),
            replayAudio: () => playSyllableAudio(clickedSyllable, () => {}),
            stopAudio: () => {
              if (voiceGuidanceRef.current?.stopVoice) voiceGuidanceRef.current.stopVoice();
              if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
            },
            inline: false,
            simpleMode: false,
            autoContinueOnSuccessMs: 0,
            onComplete: () => {
              setVoiceChallenge(null);
              proceedToNext();
            },
          });
        } else {
          proceedToNext();
        }
      });
    });
  };

  const handleCentralElementClick = () => {
    safeClick(() => {
      if (!centralElementGlowing || !canPlayerClick) return;
      if (voiceGuidanceRef.current?.stopVoice) voiceGuidanceRef.current.stopVoice();

      setShowIdleHint(false);
      setCanPlayerClick(false);
      wasChildActionPendingRef.current = false;
      setPlayerInput([...currentSequence, 'lotus']);
      setShowLotusSparkles(true);
      setCentralBloomProgress(100);
      setCentralElementGlowing(false);

      const completeWordAudio = gameConfig.audio.completeWordByRound?.[currentRound] || gameConfig.audio.completeWordFile;

      if (completeWordAudio) {
        lotusAudioPlayingRef.current = true;
        lotusAudioSourceRef.current = completeWordAudio;

        const audio = new Audio(completeWordAudio);
        currentAudioRef.current = audio; // Track so pause can stop it

        const finishLotusAudio = () => {
          currentAudioRef.current = null;
          lotusAudioPlayingRef.current = false;
          lotusAudioSourceRef.current = null;
          continueAfterLotusAudio();
        };

        audio.onended = finishLotusAudio;
        audio.onerror = finishLotusAudio;
        audio.play().catch(finishLotusAudio);
      } else {
        lotusAudioPlayingRef.current = false;
        lotusAudioSourceRef.current = null;
        safeSetTimeout(continueAfterLotusAudio, 500);
      }
    });
  };

  const handleRoundSuccess = () => {
    lotusAudioPlayingRef.current = false;
    lotusAudioSourceRef.current = null;
    pendingLotusTransitionRef.current = false;
    flowInProgressRef.current = false;
    setCanPlayerClick(false);
    setGamePhase('celebration');

    if (voiceGuidanceRef.current?.playVoice) {
      const roundVOKey = `${gamePrefix}Round${currentRound}`;
      lastInterruptibleVORef.current = roundVOKey;
      voiceGuidanceRef.current.playVoice(roundVOKey);
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

  const triggerWaitBanner = (message, playErrorVO = false) => {
    setWaitBannerMessage(message);
    setShowWaitBanner(true);
    safeSetTimeout(() => setShowWaitBanner(false), 1500);
    if (playErrorVO && voiceGuidanceRef.current?.playVoice) {
      const errorVOs = ['errorOops', 'errorNotQuite', 'errorLetsTryAgain'];
      voiceGuidanceRef.current.playVoice(errorVOs[Math.floor(Math.random() * errorVOs.length)]);
    }
  };

  const handlePause = () => {
    if (showPauseModal) return;
    if (isResumingRef.current) return;
    if (Date.now() < pauseButtonCooldownUntilRef.current) return;
    setShowPauseModal(true);
    clearAllTimers();
    flowInProgressRef.current = false;
  };
  const handleContinue = () => {
    if (isResumingRef.current) {
      pendingResumeRef.current = true;
      return;
    }
    setShowPauseModal(false);
    lockPauseButton(450);
    if (gamePhase === 'playing_syllable') {
      startSyllableFlow(currentSyllableIndex);
    } else if (gamePhase === 'listening_syllable') {
      if (pendingLotusTransitionRef.current || playerInput.length >= currentSequence.length) {
        pendingLotusTransitionRef.current = false;
        setCentralElementGlowing(true);
        setGamePhase('waiting_lotus');
        setCanPlayerClick(true);
        wasChildActionPendingRef.current = true;
        flowInProgressRef.current = false;
        if (voiceGuidanceRef.current?.playVoice) {
          const centralVO = getCentralTapVO();
          lastInterruptibleVORef.current = centralVO;
          voiceGuidanceRef.current.playVoice(centralVO);
        }
        return;
      }

      setCanPlayerClick(true);
      wasChildActionPendingRef.current = true;
      if (voiceGuidanceRef.current?.playVoice) {
        const replayVO = lastInterruptibleVORef.current || 'instructionTapAndRepeat';
        voiceGuidanceRef.current.playVoice(replayVO);
      }
    } else if (gamePhase === 'waiting_lotus') {
      if (lotusAudioPlayingRef.current) {
        replayLotusAudioAfterPause();
        return;
      }

      const lotusAlreadyTapped = playerInput.includes('lotus');
      if (lotusAlreadyTapped) {
        setCentralElementGlowing(false);
        setCanPlayerClick(false);
        wasChildActionPendingRef.current = false;
        safeSetTimeout(() => {
          if (isPausedRef.current) return;
          setShowLotusSparkles(false);
          handleRoundSuccess();
        }, naturalDelay(300, 500));
      } else {
        setCentralElementGlowing(true);
        setCanPlayerClick(true);
        wasChildActionPendingRef.current = true;
        if (voiceGuidanceRef.current?.playVoice) {
          const centralVO = getCentralTapVO();
          voiceGuidanceRef.current.playVoice(centralVO);
        }
      }

    } else if (gamePhase === 'celebration') {
      safeSetTimeout(() => {
        if (currentRound < maxRound) {
          startNewRound(currentRound + 1);
        } else {
          handlePhaseComplete();
        }
      }, 1500);
    } else if (gamePhase === 'waiting') {
      startSyllableFlow(currentSyllableIndex);
    } else if (wasChildActionPendingRef.current) {
      setCanPlayerClick(true);
      if (lastInterruptibleVORef.current && voiceGuidanceRef.current?.playVoice) {
        voiceGuidanceRef.current.playVoice(lastInterruptibleVORef.current);
      }
    }
  };
  const handleExitToMenu = () => { setShowPauseModal(false); clearAllTimers(); setGamePhase('waiting'); setCurrentRound(effectiveStartRound); };

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
    startNewRound(effectiveStartRound);
  }, [isActive, gameConfig, effectiveStartRound]);

  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0) {
      if (waitingForGameStartVORef.current) return;
      if (isPaused) return;

      if (!gameStartVOPlayedRef.current && voiceGuidanceRef.current?.playVoice) {
        gameStartVOPlayedRef.current = true;
        waitingForGameStartVORef.current = true;
        const gameStartVOKey = gameConfig.id === 'vakratunda' ? 'vakratundaGameStart' : 'mahakayaGameStart';
        voiceGuidanceRef.current.playVoice(gameStartVOKey, () => {
          waitingForGameStartVORef.current = false;
          safeSetTimeout(() => startSyllableFlow(0), 500);
        });
      } else {
        safeSetTimeout(() => startSyllableFlow(0), 800);
      }
    }
  }, [gamePhase, currentSequence, gameConfig, isPaused]);

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const isElephantSinging = (syllable) => singingSyllable === syllable;
  const hasElephantBeenClicked = (syllable) => roundClicks[`elephant-${syllable}`];
  const isCurrentTarget = (index) => canPlayerClick && index === currentSyllableIndex && !roundClicks[`elephant-${currentSequence[index]}`];
  const isVisualRewardActive = (syllable) => visualRewards[`visual-${syllable}`];

  const renderElephant = (syllable, index) => {
    if (!assetGetters) return null;
    // Use round-aware positions if available, otherwise fall back to flat positions
    const positionsByRound = gameConfig.elements.clicker?.positionsByRound;
    const position = (positionsByRound?.[currentRound]?.[index])
      || gameConfig.elements.clicker?.positions?.[index]
      || { left: '50%', top: '50%' };
    let getImage;
    if (gameConfig.elements.clicker.assetGetters) getImage = assetGetters[gameConfig.elements.clicker.assetGetters[syllable]];
    else if (gameConfig.elements.clicker.assetGetter) getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
    if (!getImage) return null;
    const clicked = hasElephantBeenClicked(syllable);
    const singing = isElephantSinging(syllable);
    const isTarget = isCurrentTarget(index);
    const isCustomBubble =
      (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') &&
      currentRound === effectiveStartRound &&
      (index === 0 || index === 1);
    const showSayPromptBubble =
      isCustomBubble &&
      canPlayerClick &&
      isTarget &&
      !clicked &&
      !voiceChallenge;
    const bubbleText = showSayPromptBubble ? `Say ${syllable}` : syllable;
    // Read size and flip from config — fallback to CSS class size if not set
    const elephantSize = position.size || undefined;
    const shouldFlip = position.flip === true;
    let className = `${gamePrefix}-clicker-element`;
    if (singing) className += ' singing';
    if (isTarget && !clicked) className += ' pulse';
    if (showIdleHint && isTarget && !clicked) className += ' hint-glow';
    return (
      <button key={`elephant-${syllable}`} className={className} style={{ position: 'absolute', left: position.left, top: position.top, transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent', cursor: isTarget ? 'pointer' : 'default', zIndex: 20, borderRadius: '50%', opacity: isTarget || clicked ? 1 : 0.6, transition: 'all 0.3s ease', ...(elephantSize && { width: elephantSize, height: elephantSize, minWidth: elephantSize, minHeight: elephantSize }) }} onClick={() => handleElephantClick(index)} disabled={!isTarget}>
        <img
          src={getImage(index)}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: shouldFlip ? 'scaleX(-1)' : 'none'
          }}
        />
        {/* Speech bubble above elephant */}
        <div style={{ position: 'absolute', top: '-52px', left: '50%', transform: 'translateX(-50%)', background: clicked ? '#C8F2C2' : 'white', color: '#2E7D32', padding: '8px 16px', borderRadius: '14px', fontSize: 'clamp(14px, 1.8vw, 20px)', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', border: `2px solid ${clicked ? '#81C784' : 'rgba(76,175,80,0.3)'}`, whiteSpace: 'nowrap', zIndex: 25, transition: 'all 0.18s ease-out' }}>
          {bubbleText}
          {/* Tail pointing down */}
          <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid ${clicked ? '#C8F2C2' : 'white'}` }} />
        </div>
        {singing && <div style={{ position: 'absolute', top: '-20px', left: '50%', fontSize: '20px', animation: 'musicNote 0.6s' }}>🎵</div>}
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
    if (effectiveStartRound > 1) return null;
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
    if (gameConfig.elements.centralSynthesis.assetGettersByRound && gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound]) {
        initialKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].initial;
        rewardKey = gameConfig.elements.centralSynthesis.assetGettersByRound[currentRound].reward;
    }
    const getInitialImage = assetGetters[initialKey];
    const getRewardImage = assetGetters[rewardKey];
    if (!getInitialImage || !getRewardImage) return null;
    const isFullyBloomed = centralBloomProgress === 100;
    const isMahakaya = gamePrefix === 'mahakaya';
    const isVakratundaStartRoundCustom =
      gameConfig.id === 'vakratunda' && currentRound === effectiveStartRound && effectiveStartRound > 1;
    const isMahakayaStartRoundCustom =
      gameConfig.id === 'mahakaya' && currentRound === effectiveStartRound && effectiveStartRound > 1;

    const budImage = isVakratundaStartRoundCustom
      ? (assetGetters.getLotusBudImage ? assetGetters.getLotusBudImage(0) : getInitialImage(0))
      : getInitialImage(0);
    const bloomImage = isVakratundaStartRoundCustom
      ? (assetGetters.getLotusFullBloomImage ? assetGetters.getLotusFullBloomImage(0) : getRewardImage(0))
      : getRewardImage(0);
    const banyanSproutImage = isMahakayaStartRoundCustom
      ? (assetGetters.getBanyanSproutImage ? assetGetters.getBanyanSproutImage(0) : getInitialImage(0))
      : budImage;
    const banyanSaplingImage = isMahakayaStartRoundCustom
      ? (assetGetters.getBanyanSaplingImage ? assetGetters.getBanyanSaplingImage(0) : getInitialImage(0))
      : budImage;
    const banyanHalfImage = isMahakayaStartRoundCustom
      ? (assetGetters.getBanyanHalfImage ? assetGetters.getBanyanHalfImage(0) : getRewardImage(0))
      : bloomImage;
    const banyanFullImage = isMahakayaStartRoundCustom
      ? (assetGetters.getBanyanFullImage ? assetGetters.getBanyanFullImage(0) : getRewardImage(0))
      : bloomImage;
    let className = `${gamePrefix}-central-synthesis`;
    if (centralElementGlowing) {
      className += ' pulse';
      if (showIdleHint) className += ' hint-glow';
    }
    return (
      <div className={className} onClick={centralElementGlowing ? handleCentralElementClick : undefined} style={{ position: 'absolute', left: position.left, top: position.top, transform: isMahakaya ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)', zIndex: 20, cursor: centralElementGlowing ? 'pointer' : 'default', transition: isMahakaya ? 'filter 0.3s ease, opacity 0.3s ease' : 'all 0.5s ease', pointerEvents: centralElementGlowing ? 'auto' : 'none', ...(position.size && { width: position.size, height: position.size, minWidth: position.size, minHeight: position.size }) }}>
        {isMahakayaStartRoundCustom ? (
          <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <img
              src={
                playerInput.includes('lotus')
                  ? banyanFullImage
                  : playerInput.length >= 2
                    ? banyanHalfImage
                    : playerInput.length >= 1
                      ? banyanSaplingImage
                      : banyanSproutImage
              }
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }}
              alt="banyan stage"
            />
          </div>
        ) : isMahakaya ? (
          <>
            <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: isFullyBloomed ? 0 : 1 }}>
              <img src={budImage} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }} alt="tree" />
            </div>
            <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: isFullyBloomed ? 1 : 0, animation: isFullyBloomed ? 'mahakayaPopIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none' }}>
              <img src={bloomImage} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }} alt="grown tree" />
            </div>
          </>
        ) : isVakratundaStartRoundCustom ? (
          <>
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
              <img
                src={
                  playerInput.includes('lotus')
                    ? (assetGetters.getLotusFullBloomImage ? assetGetters.getLotusFullBloomImage(0) : bloomImage)
                    : playerInput.length >= 2
                      ? (assetGetters.getLotusHalfBloomImage ? assetGetters.getLotusHalfBloomImage(0) : bloomImage)
                      : playerInput.length >= 1
                        ? (assetGetters.getLotusbitBloomImage ? assetGetters.getLotusbitBloomImage(0) : bloomImage)
                        : budImage
                }
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                alt="lotus stage"
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: isFullyBloomed ? 0 : (1 - centralBloomProgress / 100), transition: 'opacity 0.5s ease' }}>
              <img src={budImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bud" />
            </div>
            <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: centralBloomProgress / 100, transition: 'opacity 0.5s ease' }}>
              <img src={bloomImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bloom" />
            </div>
          </>
        )}
        <div style={{ position: 'absolute', bottom: '-36px', left: '50%', transform: 'translateX(-50%) scale(' + (centralElementGlowing ? 1.08 : 1) + ')', transition: 'all 0.2s ease-out', background: isFullyBloomed ? 'linear-gradient(180deg, #FFF7CC, #FFE082)' : 'rgba(255,255,255,0.9)', color: '#7A5C00', padding: '8px 14px', borderRadius: '16px', fontSize: 'clamp(14px, 1.8vw, 20px)', fontWeight: 700, letterSpacing: '0.6px', whiteSpace: 'nowrap', border: '2px solid rgba(255,215,0,0.6)', boxShadow: isFullyBloomed ? '0 4px 14px rgba(255,215,0,0.35)' : '0 2px 6px rgba(0,0,0,0.12)', textTransform: 'capitalize' }}>
          {currentSequence.join('')}
        </div>
        {isFullyBloomed && ( <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '24px', animation: 'sparkle 1s ease-in-out infinite' }}>✨</div> )}
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

  const getClickerPosition = (round, index) => {
    const positionsByRound = gameConfig.elements.clicker?.positionsByRound;
    return (positionsByRound?.[round]?.[index])
      || gameConfig.elements.clicker?.positions?.[index]
      || { left: '50%', top: '50%' };
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      {!hideElements && (
        <UniversalPauseButton
          onPause={handlePause}
          disabled={gamePhase === 'phase_complete' || isPauseButtonLocked || showPauseModal}
        />
      )}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />

      {/* ⭐ Round reward stars — one star pops in after each round's lotus is tapped */}
      {!hideElements && gamePhase !== 'phase_complete' && effectiveStartRound <= 1 && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          zIndex: 50,
          pointerEvents: 'none',
          minHeight: '44px',
        }}>
          {Array.from({ length: currentRound - 1 + (gamePhase === 'celebration' ? 1 : 0) }).map((_, i) => (
            <svg key={i} width="40" height="40" viewBox="0 0 24 24" style={{
              filter: 'drop-shadow(1px 2px 0px rgba(0,0,0,0.25))',
              animation: i === (currentRound - 2 + (gamePhase === 'celebration' ? 1 : 0)) ? 'starPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none',
            }}>
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#FFD700"
                stroke="#FFA000"
                strokeWidth="1.5"
              />
            </svg>
          ))}
        </div>
      )}

      {!hideElements && showWaitBanner && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 152, 0, 0.95)', color: 'white', padding: '20px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', zIndex: 100, animation: 'fadeInOut 1.5s' }}>{waitBannerMessage}</div>}
      {!hideElements && waterSprayPosition?.source && (() => {
        const src = waterSprayPosition.source;
        const tgt = waterSprayPosition.target;
        const sx = parseFloat(src.left);
        const sy = parseFloat(src.top);
        const tx = tgt ? parseFloat(tgt.left) : sx;
        const ty = tgt ? parseFloat(tgt.top) : sy - 20;
        const dx = tx - sx;   // delta in vw (container = 100vw)
        const dy = ty - sy;   // delta in vh (container = 100vh)
        const arcLift = -22;  // vh lift at arc peak
        const name = `wArc_${Math.round(sx)}_${Math.round(sy)}`;
        return (
          <div key={name} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
            <style>{`
              @keyframes ${name} {
                0%   { transform: translate(0vw,              0vh)                  scale(1);    opacity: 1;   }
                45%  { transform: translate(${dx*0.45}vw,    ${dy*0.45+arcLift}vh) scale(1.15); opacity: 0.9; }
                100% { transform: translate(${dx}vw,         ${dy}vh)              scale(0.5);  opacity: 0;   }
              }
            `}</style>
            {Array.from({ length: 8 }).map((_, i) => {
              const spread = (i - 3.5) * 1.8;
              const size   = 9 + (i % 3) * 3;
              return (
                <div key={i} style={{ position: 'absolute', left: `${sx}%`, top: `${sy}%`, transform: `translate(calc(-50% + ${spread}px), -50%)`, pointerEvents: 'none' }}>
                  <div style={{ fontSize: `${size}px`, animation: `${name} ${660 + i*38}ms cubic-bezier(0.2,0.8,0.6,1) ${i*72}ms both`, display: 'inline-block' }}>💧</div>
                </div>
              );
            })}
          </div>
        );
      })()}
      
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
@keyframes sparkleBurst1 { 0% { opacity: 1; transform: translate(-50%, 0) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -30px) scale(1.3); } }
        @keyframes sparkleBurst2 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(15px, -20px) scale(1.2); } }
        @keyframes sparkleBurst3 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(-10px, 20px) scale(1.1); } }
        @keyframes sparkleBurst4 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: translate(-20px, -10px) scale(1.2); } }
        @keyframes sparkleBurst5 { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; } }
        @keyframes starGlowV2 { 0%, 100% { filter: drop-shadow(0 0 4px rgba(255,215,0,0.6)); } 50% { filter: drop-shadow(0 0 12px rgba(255,215,0,1)); } }
        @keyframes starPopIn { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 60% { transform: scale(1.3) rotate(10deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes mahakayaPopIn { 0% { transform: scale(0.2); opacity: 0; } 55% { transform: scale(1.18); opacity: 1; } 75% { transform: scale(0.93); } 100% { transform: scale(1.0); opacity: 1; } }
      `}</style>

      {/* ── Duolingo-style syllable voice challenge ── */}
      {voiceChallenge && (
        <SyllableVoiceChallenge
          syllable={voiceChallenge.syllable}
          displayLabel={voiceChallenge.displayLabel}
          onComplete={voiceChallenge.onComplete}
          replayAudio={voiceChallenge.replayAudio}
          stopAudio={voiceChallenge.stopAudio}
          mooshikaImage={voiceGuidance?.characterImage}
          inline={false}
          simpleMode={!!voiceChallenge.simpleMode}
          autoContinueOnSuccessMs={voiceChallenge.autoContinueOnSuccessMs || 0}
        />
      )}
    </div>
  );
};

export default AutoPlayModeV2;
