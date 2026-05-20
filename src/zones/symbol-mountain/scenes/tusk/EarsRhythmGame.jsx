
// zones/symbol-mountain/scenes/symbol/components/EarsRhythmGame.jsx
// 🎵 INLINE rhythm listening game component - WITH RANDOM SEQUENCES

import React, { useState, useEffect, useRef } from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';

// Import your actual musical instrument images
import musicalTabla from './assets/images/tabla-new.png';
import musicalDholak from './assets/images/dholak-new.png';
import musicalHarmonium from './assets/images/harmonium-new.png';
import musicalTanpura from './assets/images/tanpura-new.png';
import replayIcon from './assets/images/replay.png';
import tablaSample from './assets/audio/Tabla.wav';
import dholSample from './assets/audio/dhol.mp3';
import harmoniumSample from './assets/audio/harmonium.mp3';
import tanpuraSample from './assets/audio/tanpra.mp3';

// Musical instruments data
const musicalInstruments = {
  tabla: {
    image: musicalTabla,
    emoji: '🥁',
    name: 'Tabla',
    frequency: 220,
    color: '#8d6e63'
  },
  dholak: {
    image: musicalDholak,
    emoji: '🥁',
    name: 'Dholak',
    frequency: 660,
    color: '#8bc34a'
  },
  harmonium: {
    image: musicalHarmonium,
    emoji: '🎹',
    name: 'Harmonium',
    frequency: 440,
    color: '#ffd700'
  },
  tanpura: {
    image: musicalTanpura,
    emoji: '🎸',
    name: 'Tanpura',
    frequency: 880,
    color: '#42a5f5'
  }
};

const defaultEarInstrumentPositions = {
  tabla: { x: 39, y: 44 },
  dholak: { x: 64, y: 72 },
  harmonium: { x: 23, y: 71 },
  tanpura: { x: 86, y: 47 }
};

const instrumentAudioSources = {
  tabla: tablaSample,
  dholak: dholSample,
  harmonium: harmoniumSample,
  tanpura: tanpuraSample
};

// ✅ Generate random rhythm sequences with constraints:
//   - No more than 2 of the same instrument in a row
//   - At least 2 different instruments must appear
const generateRandomSequence = (discoveredInstruments, noteId) => {
  const discoveredKeys = Object.keys(discoveredInstruments || {});
  const truthyKeys = discoveredKeys.filter((key) => Boolean(discoveredInstruments[key]));
  const availableInstruments = truthyKeys.length > 0 ? truthyKeys : discoveredKeys;

  const sequenceConfigs = {
    note1: { length: 2, useInstruments: 2 },
    note2: { length: 3, useInstruments: 3 },
    note3: { length: 4, useInstruments: 4 }
  };

  const config = sequenceConfigs[noteId] || { length: 2, useInstruments: 2 };
  const poolSize = Math.min(config.useInstruments, availableInstruments.length);

  const fisherYates = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const instrumentPool = fisherYates(availableInstruments).slice(0, poolSize);
  if (instrumentPool.length === 0) return [];

  // Keep only minimum variety guarantee (2 unique), allowing repeats in longer rounds.
  const requiredUnique = Math.min(2, config.length, instrumentPool.length);
  const guaranteed = fisherYates(instrumentPool).slice(0, requiredUnique);

  const sequence = [...guaranteed];
  while (sequence.length < config.length) {
    const candidate = instrumentPool[Math.floor(Math.random() * instrumentPool.length)];
    const wouldBe3InRow =
      sequence.length >= 2 &&
      sequence[sequence.length - 1] === candidate &&
      sequence[sequence.length - 2] === candidate;
    if (!wouldBe3InRow) sequence.push(candidate);
  }

  const finalSequence = fisherYates(sequence);
  console.log(`Generated random sequence for ${noteId}:`, finalSequence);
  return finalSequence;
};
const EarsRhythmGame = ({ 
  isActive = false,
  currentNote = 'note1',
  discoveredInstruments = {},
  instrumentPositions = defaultEarInstrumentPositions,
  instrumentSizes = {},
  onSequenceComplete,
  onGameComplete,
  onGuidanceEvent,
  onClose,
  isReload = false,                          // Flag indicating reload
  initialGamePhase = 'waiting',              // Restored game phase
  initialPlayerInput = [],                   // Restored player input
  initialCurrentSequence = [],               // ← ADD: Restored sequence
  initialSequenceItemsShown = 0,             // ← ADD: Restored sequence progress
  sequenceJustCompleted = false,             // Post-sequence reload flag
  lastCompletedNote = null                   // Which note was just completed
}) => {
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
console.log('🎵 EarsRhythmGame inline render:', { 
  isActive, 
  currentNote,
  isReload,                    // ← ADD: Check if reload prop is passed
  initialGamePhase,            // ← ADD: Check if initial state is passed
  initialPlayerInput           // ← ADD: Check if initial input is passed
});  

  // Game states
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'playing', 'listening', 'success', 'error'
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [playingInstrument, setPlayingInstrument] = useState(null);
  const [tapSparkleOn, setTapSparkleOn] = useState(null);
  const [tapGestureOn, setTapGestureOn] = useState(null);
  // 🔧 Counter forces React to re-render even when same instrument is tapped twice in a row
  const [tapTick, setTapTick] = useState(0);
  // 🔧 Which tracker slot is currently being played during sequence playback (position-only, no reveal)
  const [activePlaybackSlot, setActivePlaybackSlot] = useState(null);
  // 🔧 Wrong shake: which scene instrument should shake (NOT the tracker)
  const [wrongShakeInstrument, setWrongShakeInstrument] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);
  const [patternTapFeedback, setPatternTapFeedback] = useState({});
  const wrongTapsThisRoundRef = useRef(0);
  const replayHintGivenRef = useRef(false);
  const [replayHintPulseOn, setReplayHintPulseOn] = useState(false);
  const [trackerCelebrateOn, setTrackerCelebrateOn] = useState(false);
  const roundStartVoPlayedRef = useRef({ note1: false, note2: false, note3: false });
  const roundTapVoPlayedRef = useRef({ note1: false, note2: false, note3: false });
  const roundSequenceStartedRef = useRef({ note1: false, note2: false, note3: false });
  const [gameIntroDelayActive, setGameIntroDelayActive] = useState(false);

  // Add these to your state declarations at the top:
const [countdown, setCountdown] = useState(0);
const [isCountingDown, setIsCountingDown] = useState(false);

  const emitGuidance = (eventKey, payload = {}) => {
    if (onGuidanceEvent) onGuidanceEvent(eventKey, payload);
  };

  // Audio context ref
  const audioContextRef = useRef(null);
  const instrumentAudioRefs = useRef({});
  const timeoutsRef = useRef([]);

  // Clean up timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Safe timeout
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const resetIdleHints = () => {};



  // Initialize audio context
  useEffect(() => {
    if (isActive && !audioContextRef.current) {
      const initAudio = async () => {
        try {
          // Create audio context
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          
          console.log('🔊 Audio context created, state:', audioContextRef.current.state);
          
          // Don't try to resume immediately - let user interaction handle it
        } catch (error) {
          console.warn('🔇 Audio context failed:', error);
          audioContextRef.current = null;
        }
      };
      
      initAudio();
    }
    
    // Cleanup when component becomes inactive
    if (!isActive && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
        console.log('🔊 Audio context closed on inactive');
      } catch (error) {
        console.warn('🔇 Error closing audio context on inactive:', error);
      }
      audioContextRef.current = null;
    }
  }, [isActive]);

  // Preload real instrument samples
  useEffect(() => {
    if (!isActive) return;
    Object.entries(instrumentAudioSources).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      instrumentAudioRefs.current[key] = audio;
    });

    return () => {
      Object.values(instrumentAudioRefs.current).forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
      });
      instrumentAudioRefs.current = {};
    };
  }, [isActive]);
// ✅ ENHANCED: Handle both new games and reloads (Eyes game pattern)
useEffect(() => {
  console.log('🔍 USEEFFECT DEBUG:', {
    isActive,
    currentNote,
    discoveredInstruments: Object.keys(discoveredInstruments),
    isReload,                           // ← Check this value
    'initialCurrentSequence.length': initialCurrentSequence.length,
    initialCurrentSequence,             // ← Check this array
    initialPlayerInput,
    'condition1': isActive && currentNote && Object.keys(discoveredInstruments).length > 0,
    'condition2': isReload && initialCurrentSequence.length > 0
  })
  
  if (isActive && currentNote && Object.keys(discoveredInstruments).length > 0) {
    
    if (isReload && initialCurrentSequence.length > 0) {
      // ✅ RELOAD CASE: Restore progress (like Eyes game)
      console.log('🔄 EARS RELOAD: Restoring rhythm game progress:', {
        initialGamePhase,
        initialPlayerInput,
        initialCurrentSequence,
        initialSequenceItemsShown,
        sequenceJustCompleted,
        lastCompletedNote
      });
      
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
setSequenceItemsShown(initialCurrentSequence.length); // Show full sequence during reload
setCanPlayerClick(initialGamePhase === 'listening');
      wrongTapsThisRoundRef.current = 0;
      
      // ✅ POST-SEQUENCE RELOAD: Auto-continue if sequence was just completed
      if (sequenceJustCompleted && lastCompletedNote) {
        console.log('🔄 POST-SEQUENCE: Auto-continuing from completed sequence');
        setTimeout(() => {
          handleSequenceSuccess(); // Trigger the completion flow
        }, 1000);
      }
      
    } else {
      // ✅ NEW GAME: Original logic (like Eyes game)
      console.log('🎵 NEW EARS GAME: Generating fresh sequence');
      const sequence = generateRandomSequence(discoveredInstruments, currentNote);
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setGamePhase('waiting');
      setCanPlayerClick(false);
      setSequenceItemsShown(0);
      setPatternTapFeedback({});
      wrongTapsThisRoundRef.current = 0;
      replayHintGivenRef.current = false;
      roundTapVoPlayedRef.current[currentNote] = false;
      roundSequenceStartedRef.current[currentNote] = false;
      setReplayHintPulseOn(false);
      setActivePlaybackSlot(null);
      setWrongShakeInstrument(null);
      clearAllTimeouts();
    }
  }
}, [isActive, currentNote, discoveredInstruments, isReload]); // ← Added isReload dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
          console.log('🔊 Audio context closed');
        } catch (error) {
          console.warn('🔇 Error closing audio context:', error);
        }
        audioContextRef.current = null;
      }
    };
  }, []);

// Add this useEffect after your other useEffects:
useEffect(() => {
  if (gamePhase !== 'waiting' || currentSequence.length === 0 || isCountingDown || gameIntroDelayActive) return;

  const startRoundSequenceOnce = () => {
    if (roundSequenceStartedRef.current[currentNote]) return;
    roundSequenceStartedRef.current[currentNote] = true;
    setGameIntroDelayActive(false);
    handlePlaySequence();
  };

  const startKeyByRound = {
    note1: 'startRound1',
    note2: 'startRound2',
    // Round 3: no extra start VO (prevents overlap/cut with completion lines)
    note3: null
  };
  const startKey = startKeyByRound[currentNote];

  if (startKey && !roundStartVoPlayedRef.current[currentNote]) {
    roundStartVoPlayedRef.current[currentNote] = true;
    setGameIntroDelayActive(true);
    emitGuidance(startKey, {
      onEnd: () => {
        safeSetTimeout(() => {
          startRoundSequenceOnce();
        }, 1200);
      }
    });
    // Failsafe in case onEnd never fires on some device/browser.
    safeSetTimeout(() => {
      startRoundSequenceOnce();
    }, 12000);
    return;
  }

  safeSetTimeout(() => {
    startRoundSequenceOnce();
  }, 300);
}, [gamePhase, currentSequence, isCountingDown, gameIntroDelayActive, currentNote]);

useEffect(() => {
  if (gamePhase === 'waiting') emitGuidance('waiting');
}, [gamePhase, currentNote]);
  // Play instrument sample only (no legacy synth fallback).
  const playInstrumentSound = async (instrumentType, volume = 0.85) => {
    try {
      const sampleAudio = instrumentAudioRefs.current[instrumentType];
      if (sampleAudio) {
        // Clone per trigger to avoid missed playback when sounds fire quickly in sequence.
        const shot = sampleAudio.cloneNode(true);
        shot.volume = volume;
        await shot.play();
        return true;
      }
    } catch (error) {
      console.warn('Sample playback failed:', error);
    }
    return false;
  };

const startCountdown = () => {
  resetIdleHints();
  setIsCountingDown(true);
  setCountdown(3);
  
  // Countdown: 3
  safeSetTimeout(() => {
    setCountdown(2);
    
    // Countdown: 2
    safeSetTimeout(() => {
      setCountdown(1);
      
      // Countdown: 1
      safeSetTimeout(() => {
        setCountdown(0);
        setIsCountingDown(false);
        handlePlaySequence(); // Auto-play after countdown
      }, 800);
    }, 800);
  }, 800);
};

  // Play the sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0) return;
    resetIdleHints();

    // Ensure audio context is running on user interaction
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('🔊 Audio context resumed on user interaction');
      } catch (error) {
        console.warn('🔇 Failed to resume audio context:', error);
      }
    }
    
    console.log('🎵 Playing sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    setPatternTapFeedback({});
    setActivePlaybackSlot(null);
    setWrongShakeInstrument(null);
    wrongTapsThisRoundRef.current = 0;
    replayHintGivenRef.current = false;
    roundTapVoPlayedRef.current[currentNote] = false;
    setReplayHintPulseOn(false);
    
    currentSequence.forEach((instrument, index) => {
      safeSetTimeout(() => {
        console.log(`🎵 Playing instrument ${index + 1}/${currentSequence.length}: ${instrument}`);
        
        // 🔧 Track WHICH slot is playing (position only — tracker stays mystery, no instrument reveal)
        setActivePlaybackSlot(index);
        // Keep sequenceItemsShown for legacy reload compatibility, but tracker no longer reveals from it
        setSequenceItemsShown(index + 1);
        
        // Scene instrument pulses (this is fine — kid sees which instrument made which sound = teaching)
        setPlayingInstrument(instrument);
        playInstrumentSound(instrument);
        
        // Clear scene instrument pulse
        safeSetTimeout(() => {
          setPlayingInstrument(null);
        }, 700);
        
        // After last instrument
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            // 🔧 Brief "your turn" pause — clear active slot, all mystery circles pulse together
            setActivePlaybackSlot(null);
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            if (currentNote === 'note1' && !roundTapVoPlayedRef.current.note1) {
              roundTapVoPlayedRef.current.note1 = true;
              safeSetTimeout(() => {
                emitGuidance('round1TapNow');
              }, 500);
            }
            console.log('🎵 Sequence complete, player can now tap');
          }, 900); // Slightly longer breath before "your turn"
        }
      }, index * 1100); // 1100ms between beats (was 1200) — feels more musical
    });
  };

  const playRemainingSequence = (fromIndex, volume = 0.55) => {
    if (isSequencePlaying || fromIndex >= currentSequence.length) return;
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);

    currentSequence.slice(fromIndex).forEach((instrument, relativeIndex) => {
      const absoluteIndex = fromIndex + relativeIndex;
      safeSetTimeout(() => {
        setActivePlaybackSlot(absoluteIndex);
        setPlayingInstrument(instrument);
        playInstrumentSound(instrument, volume);

        safeSetTimeout(() => {
          setPlayingInstrument(null);
        }, 650);

        if (absoluteIndex === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setActivePlaybackSlot(null);
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
          }, 850);
        }
      }, relativeIndex * 1000);
    });
  };

  // Handle player instrument click
  const handleInstrumentClick = async (instrumentType) => {
    if (!canPlayerClick || isSequencePlaying) {
      console.log('🚫 Player click ignored - not ready');
      return;
    }
    resetIdleHints();

    // Ensure audio context is running on user interaction
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('🔊 Audio context resumed on instrument click');
      } catch (error) {
        console.warn('🔇 Failed to resume audio context:', error);
      }
    }

    console.log(`🎵 Player clicked: ${instrumentType}`);
    
    // 🔧 Bump tapTick FIRST to force React re-render even on same-instrument repeat tap
    setTapTick((t) => t + 1);
    
    // Play sound + scene instrument pulse
    playInstrumentSound(instrumentType);
    setPlayingInstrument(instrumentType);
    
    safeSetTimeout(() => {
      setPlayingInstrument(null);
    }, 400);
    
    const newPlayerInput = [...playerInput, instrumentType];
    const currentIndex = newPlayerInput.length - 1;
    const expected = currentSequence[currentIndex];
    
    // ✅ Check if correct
    if (instrumentType === expected) {
      console.log(`✅ Correct! Position ${currentIndex + 1}/${currentSequence.length}`);
      setPlayerInput(newPlayerInput);
      // Sparkle + thumbs-up gesture on the tapped instrument
      setTapSparkleOn(instrumentType);
      setTapGestureOn(instrumentType);
      // Lock this slot in green — STAYS for the rest of the round
      setPatternTapFeedback((prev) => ({
        ...prev,
        [currentIndex]: 'correct'
      }));
      // Clear sparkle/gesture after animation completes (700ms matches SparkleAnimation duration)
      safeSetTimeout(() => {
        setTapSparkleOn(null);
        setTapGestureOn(null);
      }, 750);
      // Clear any leftover wrong-shake from previous attempt on this slot
      setWrongShakeInstrument(null);

      // Save state for reload
      if (window.saveEarsGameState) {
        window.saveEarsGameState({
          gamePhase: 'listening',
          playerInput: newPlayerInput,
          currentSequence: currentSequence,
          sequenceItemsShown: sequenceItemsShown
        });
      }

      // Check if sequence complete
      if (newPlayerInput.length === currentSequence.length) {
        handleSequenceSuccess();
      }
    } else {
      // ❌ Wrong tap — DON'T wipe progress. Just shake the scene instrument and let kid retry this slot.
      console.log(`❌ Wrong! Expected: ${expected}, Got: ${instrumentType} at slot ${currentIndex}`);
      
      // Shake the scene instrument they tapped (NOT the tracker)
      setWrongShakeInstrument(instrumentType);
      safeSetTimeout(() => {
        setWrongShakeInstrument(null);
      }, 550);

      wrongTapsThisRoundRef.current += 1;
      if (wrongTapsThisRoundRef.current >= 3 && !replayHintGivenRef.current) {
        replayHintGivenRef.current = true;
        safeSetTimeout(() => {
          emitGuidance('replayHint');
          setReplayHintPulseOn(true);
          safeSetTimeout(() => setReplayHintPulseOn(false), 2400);
        }, 900);
      }
      
      // playerInput is NOT updated — kid retries the same slot with previous correct taps locked in
    }
  };

// Handle correct sequence completion
const handleSequenceSuccess = () => {
  console.log('✅ Sequence matched!');
  resetIdleHints();
  wrongTapsThisRoundRef.current = 0;
  setGamePhase('success');
  setCanPlayerClick(false);
  setReplayHintPulseOn(false);
  // Celebration beat: tracker bounces while scene instruments are dimmed.
  safeSetTimeout(() => setTrackerCelebrateOn(true), 600);
  safeSetTimeout(() => setTrackerCelebrateOn(false), 1400);

  // Hand off to parent for note light-up sequence.
  safeSetTimeout(() => {
    if (onSequenceComplete) {
      onSequenceComplete(currentNote);
    }
    if (currentNote === 'note3' && onGameComplete) {
      onGameComplete();
    }
  }, 1200);
};

  // 🔧 handleSequenceError REMOVED — wrong taps no longer wipe progress or replay sequence.
  // Wrong tap handling now lives inline in handleInstrumentClick (shake + per-slot wrong tracking).

  if (!isActive) {
    return null;
  }

  const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
  const isCompact = typeof window !== 'undefined' && isLandscape && window.innerWidth <= 1366 && window.innerHeight <= 900;
  const trackerSize = isCompact ? 80 : 128;
  const imageSize = isCompact ? 62 : 98;

  return (
    <div className="ears-rhythm-game-inline" style={inlineContainerStyle}>
      {/* Header removed: guidance is VO-driven */}
      

{/* 🎵 Sequence Tracker — Mystery circles during playback, reveal on correct tap */}
{(gamePhase === 'playing' || gamePhase === 'listening' || gamePhase === 'success') && currentSequence.length > 0 && (
  <div style={{
    position: 'absolute',
    top: '165px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    padding: '14px 22px',
    background: 'rgba(74, 47, 110, 0.35)',  // Soft purple-tinted strip — pops against sky
    backdropFilter: 'blur(6px)',
    borderRadius: '70px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
    zIndex: 31
  }}>
    {currentSequence.map((inst, idx) => {
      const instrument = musicalInstruments[inst];
      const feedbackState = patternTapFeedback[idx] || null;
      const isLockedCorrect = feedbackState === 'correct'; // ✅ Revealed + locked green
      const isPlayingThisSlot = gamePhase === 'playing' && activePlaybackSlot === idx; // Position pulse only
      // Next-expected slot during listening phase: pulses gently to guide kid
      const isNextExpected = gamePhase === 'listening' && idx === playerInput.length;
      
      return (
        <div
          key={`${idx}-${isLockedCorrect ? 'locked' : 'mystery'}`}
          style={{
            position: 'relative',
            width: `${trackerSize}px`,
            height: `${trackerSize}px`,
            borderRadius: '50%',
            background: isLockedCorrect
              ? 'rgba(210, 190, 240, 0.38)' // Revealed: same purple family, slightly brighter
              : isPlayingThisSlot
                ? 'rgba(255, 215, 0, 0.35)' // Soft gold during this beat's playback
                : isNextExpected
                  ? 'rgba(255, 215, 0, 0.18)' // Subtle gold tint for next expected
                  : 'rgba(255,255,255,0.12)', // Mystery: dim translucent
            border: isLockedCorrect
              ? '4px solid #f4c430' // ✅ Yellow completion ring
              : isPlayingThisSlot
                ? '3px solid #FFD700'
                : isNextExpected
                  ? '3px dashed rgba(255, 215, 0, 0.7)'
                  : '2px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.4s ease',
            boxShadow: isLockedCorrect
              ? '0 0 22px rgba(244,196,48,0.6), 0 4px 12px rgba(0,0,0,0.15)'
              : isPlayingThisSlot
                ? '0 0 18px rgba(255,215,0,0.7)'
                : 'none',
            transform: isLockedCorrect ? 'scale(1.05)' : 'scale(1)',
            animation: isPlayingThisSlot
              ? 'beatPulse 0.6s ease-out'
              : isNextExpected
                ? 'nextSlotBreathe 1.6s ease-in-out infinite'
                : trackerCelebrateOn
                  ? 'trackerCelebrate 0.7s ease-in-out'
                  : 'mysteryBreathe 2.4s ease-in-out infinite'
          }}
        >
          {isLockedCorrect ? (
            // ✅ REVEALED: instrument image + checkmark
            <>
              <img
                src={instrument.image}
                alt={instrument.name}
                style={{
                  width: `${imageSize}px`,
                  height: `${imageSize}px`,
                  objectFit: 'contain',
                  filter: 'brightness(1.1) saturate(1.15)',
                  animation: 'revealPop 0.5s ease-out'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#f4c430',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                animation: 'revealPop 0.5s ease-out 0.1s both'
              }}>✓</div>
            </>
          ) : (
            // ❓ MYSTERY: just an empty translucent circle, no icon (round-progress notes already exist at top)
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isPlayingThisSlot
                ? 'rgba(255,215,0,0.95)'
                : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease'
            }} />
          )}
        </div>
      );
    })}

    <div
      aria-hidden="true"
      style={{
        width: '1px',
        height: '60px',
        background: 'rgba(255,255,255,0.28)'
      }}
    />

    <button
      type="button"
      onClick={() => playRemainingSequence(0, 0.75)}
      disabled={isSequencePlaying || gamePhase !== 'listening'}
      className={replayHintPulseOn ? 'replay-hint-pulse' : ''}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        width: `${trackerSize}px`,
        height: `${trackerSize}px`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: (isSequencePlaying || gamePhase !== 'listening') ? 'default' : 'pointer',
        opacity: (isSequencePlaying || gamePhase !== 'listening') ? 0.65 : 1
      }}
      aria-label="Replay pattern"
    >
      <img
        src={replayIcon}
        alt="Replay"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: 'scale(1.6)',
          transformOrigin: 'center',
          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.25))'
        }}
      />
    </button>
  </div>
)}

{/* Countdown display */}
{isCountingDown && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '80px',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
    zIndex: 100,
    animation: 'countdownPulse 0.8s ease-in-out'
  }}>
    {countdown}
  </div>
)}
      





      {/* Musical Instruments in their discovered positions */}

<div className="discovered-instruments-clickable" style={{ 
  pointerEvents: gamePhase === 'playing' ? 'none' : 'auto',
  opacity: gamePhase === 'success' ? 0.45 : 1,
  transition: 'opacity 0.45s ease'
}}>        {Object.keys(discoveredInstruments).map(instrumentType => {
          const instrument = musicalInstruments[instrumentType];
          const isPlaying = playingInstrument === instrumentType;
          const isClickable = canPlayerClick;
          const hintFilter = 'none';
          
          // 🔧 NEW: wrong-tap shake state (per-instrument)
          const isShaking = wrongShakeInstrument === instrumentType;
          const position = instrumentPositions[instrumentType]
            || Object.values(instrumentPositions).find((pos) => pos?.type === instrumentType);
          const earSize = instrumentSizes[instrumentType]?.ears || 290;
          if (!position) return null;
          
          return (
            <button
              key={instrumentType}
              className=""
              data-instrument={instrumentType}
style={{
  position: 'absolute',
  top: `${position.y}%`,
  left: `${position.x}%`,
  width: `${earSize}px`,
  height: `${earSize}px`,
  border: 'none',
  outline: 'none',
  borderRadius: '50%',
  overflow: 'visible',
  transition: 'all 0.3s ease',
  background: 'transparent',
  WebkitTapHighlightColor: 'transparent',
  cursor: isClickable ? 'pointer' : 'default',
  opacity: isClickable || isPlaying ? 1 : 0.55,
  transform: `translate(-50%, -50%) ${isPlaying ? 'scale(1.08)' : 'scale(1)'}`,
  boxShadow: 'none',
  filter: isPlaying
      ? 'drop-shadow(0 0 14px rgba(255, 196, 64, 0.95)) brightness(1.12)'
      : hintFilter,
  animation: isShaking
    ? 'sceneInstrumentShake 0.5s ease'
      : 'none',
  zIndex: isPlaying ? 35 : 30
}}
              onClick={() => handleInstrumentClick(instrumentType)}
              disabled={!isClickable}
            >
              <img 
                src={instrument.image}
                alt={instrument.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2 }}
              />
              {/* 🔧 Key on tapTick forces re-mount on every tap so sparkle/gesture restart cleanly */}
              {tapSparkleOn === instrumentType && (
                <div style={{ position: 'absolute', inset: '-20px', zIndex: 12, pointerEvents: 'none' }}>
                  <SparkleAnimation
                    key={`sparkle-${instrumentType}-${tapTick}`}
                    type="star"
                    count={16}
                    color="#ffd54f"
                    size={11}
                    duration={900}
                    fadeOut={true}
                    area="full"
                  />
                </div>
              )}
              {tapGestureOn === instrumentType && (
                <div
                  key={`gesture-${instrumentType}-${tapTick}`}
                  className="ears-mini-gesture"
                  aria-hidden="true"
                >
                  <img src={MINI_THUMBS_UP_ICON} alt="" />
                </div>
              )}
              
            </button>   
               
          );
        })}
      </div>
      
      
<style>{`
  .ears-rhythm-game-inline button[data-instrument]:hover {
    transform: translate(-50%, -50%) scale(1.04);
  }
  
  .ears-rhythm-game-inline button[data-instrument]:active {
    transform: translate(-50%, -50%) scale(0.98);
  }

  .ears-rhythm-game-inline button[data-instrument]:focus,
  .ears-rhythm-game-inline button[data-instrument]:focus-visible {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }
  .ears-rhythm-game-inline .ears-mini-gesture {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 42px;
    height: 42px;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25));
    animation: earsMiniGesturePop 0.8s ease-out;
    pointer-events: none;
    z-index: 5;
  }
  .ears-rhythm-game-inline .ears-mini-gesture img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  @keyframes earsMiniGesturePop {
    0% { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.85); }
    30% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.06); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(1); }
  }
  
  @keyframes clickPulse {
    0%, 100% { 
      opacity: 0.7;
      transform: translateX(-50%) scale(1);
    }
    50% { 
      opacity: 1;
      transform: translateX(-50%) scale(1.1);
    }
  }
  .ears-rhythm-game-inline .replay-hint-pulse {
    animation: replayHintPulse 1.2s ease-in-out 2;
  }
  @keyframes earsPatternWrongShake {
    0% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
    100% { transform: translateX(0); }
  }
  
  /* 🎵 NEW v2 animations for mystery-circle tracker */
  
  /* Mystery circle: gentle breathing, lets kid know it's "alive" but waiting */
  @keyframes mysteryBreathe {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50% { transform: scale(1.025); opacity: 1; }
  }
  
  /* Beat pulse: position-only feedback during sequence playback (no instrument reveal) */
  @keyframes beatPulse {
    0% { transform: scale(1); }
    40% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }
  
  /* Next-expected slot: stronger pulse to guide kid's attention during their turn */
  @keyframes nextSlotBreathe {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
    }
    50% {
      transform: scale(1.06);
      box-shadow: 0 0 22px rgba(255, 215, 0, 0.7);
    }
  }
  
  /* Reveal pop: when a mystery circle reveals its instrument on correct tap */
  @keyframes revealPop {
    0% { transform: scale(0.4) rotate(-15deg); opacity: 0; }
    60% { transform: scale(1.2) rotate(8deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  
  /* Scene-instrument shake on wrong tap (replaces the old tracker-shake) */
  @keyframes sceneInstrumentShake {
    0% { transform: translate(-50%, -50%) translateX(0); }
    15% { transform: translate(-50%, -50%) translateX(-4px) rotate(-1deg); }
    30% { transform: translate(-50%, -50%) translateX(4px) rotate(1deg); }
    45% { transform: translate(-50%, -50%) translateX(-3px) rotate(-0.7deg); }
    60% { transform: translate(-50%, -50%) translateX(3px) rotate(0.7deg); }
    80% { transform: translate(-50%, -50%) translateX(-2px); }
    100% { transform: translate(-50%, -50%) translateX(0); }
  }
  @keyframes trackerCelebrate {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.12); }
  }
  @keyframes replayHintPulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
    }
    50% {
      transform: scale(1.04);
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.55));
    }
  }
  
  @keyframes soundWave {
    0% {
      width: 90px;
      height: 90px;
      opacity: 1;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
  
  /* ⭐ ADD THIS NEW ANIMATION */
  @keyframes bounceHand {
    0%, 100% { 
      transform: translateX(-50%) translateY(0); 
    }
    50% { 
      transform: translateX(-50%) translateY(5px); 
    }
  }

  // Add to your <style> block:
@keyframes countdownPulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
}
`}</style>
    </div>
  );
};

// ✅ INLINE STYLES - Positioned within scene bounds
const inlineContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

const inlineStatusStyle = {
  position: 'absolute',
  top: '140px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '14px',
  fontWeight: 'bold',
 color: '#FFD700',                           // ← CHANGE: Golden text
  background: 'rgba(139, 69, 19, 0.9)',       // ← CHANGE: Brown background
  padding: '8px 16px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  minWidth: '200px'
};

const inlinePlayButtonStyle = {
  position: 'absolute',
  top: '180px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 248, 220, 0.95)',     // ← Cream background
  color: '#8B4513',                            // ← Golden brown text
  border: '2px solid #D2B48C',                 // ← Tan border
  padding: '12px 25px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  zIndex: 30,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
};

const inlineSequenceDisplayStyle = {
  position: 'absolute',
  top: '220px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '15px 20px',
  borderRadius: '15px',
  zIndex: 30,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const inlineSequenceItemStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const inlineProgressIndicatorStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(76, 175, 80, 0.9)',
  color: 'white',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  zIndex: 30
};

const inlineCloseStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#666',
  zIndex: 35
};

const inlineSequenceTrackerStyle = {
  position: 'absolute',
  top: '220px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '12px 18px',
  borderRadius: '15px',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  boxShadow: '0 3px 15px rgba(0, 0, 0, 0.15)'
};

const inlineTrackerLabelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#654321',
  whiteSpace: 'nowrap'
};

const inlineTrackerItemsStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center'
};

const inlineTrackerItemStyle = {
  position: 'relative',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  overflow: 'visible',  // ← CHANGED to 'visible'
  transition: 'all 0.3s ease',
  background: 'white'
};

export default EarsRhythmGame;










