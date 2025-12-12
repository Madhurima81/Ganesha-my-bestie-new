// FestivalPianoMusicalChallenge.jsx
// Musical Challenge Mode - Pattern matching rhythm game with dancing animals

import React, { useState, useEffect, useRef } from 'react';
import './FestivalPianoMusicalChallenge.css';

// Game phases
const CHALLENGE_PHASES = {
  WELCOME: 'welcome',
  COUNTDOWN: 'countdown',
  WATCHING: 'watching',
  YOUR_TURN: 'your_turn',
  ROUND_COMPLETE: 'round_complete',
  CHALLENGE_COMPLETE: 'challenge_complete'
};

// Round configuration with progressive difficulty
const ROUNDS = [
  { 
    id: 1, 
    name: 'Beginner Beat',
    beats: 2, 
    instrumentCount: 2,
    stars: 2,
    ganeshaMessage: "Let's start with an easy rhythm!"
  },
  { 
    id: 2, 
    name: 'Festival Rhythm',
    beats: 3, 
    instrumentCount: 3,
    stars: 3,
    ganeshaMessage: "Great! Now try this festival beat!"
  },
  { 
    id: 3, 
    name: 'Master Pattern',
    beats: 4, 
    instrumentCount: 4,
    stars: 3,
    ganeshaMessage: "Final challenge - you've got this!"
  }
];

// Instruments configuration (from your FestivalPianoGame)
const INSTRUMENTS = [
  {
    id: 'dhol',
    name: 'Festival Drums',
    color: '#DC143C',
    keyPosition: { x: 15, y: 65 },
    soundFreq: { base: 100, harmonics: [150, 200] }
  },
  {
    id: 'cymbals',
    name: 'Rhythm Cymbals', 
    color: '#FFD700',
    keyPosition: { x: 30, y: 65 },
    soundFreq: { base: 800, harmonics: [1200, 1600] }
  },
  {
    id: 'bells',
    name: 'Temple Bells',
    color: '#4169E1', 
    keyPosition: { x: 45, y: 65 },
    soundFreq: { base: 1000, harmonics: [2000, 3000] }
  },
  {
    id: 'shehnai',
    name: 'Celebration Horn',
    color: '#FF8C00',
    keyPosition: { x: 60, y: 65 },
    soundFreq: { base: 440, harmonics: [660, 880] }
  },
  {
    id: 'drum',
    name: 'Sacred Drum',
    color: '#32CD32',
    keyPosition: { x: 75, y: 65 },
    soundFreq: { base: 80, harmonics: [120, 160] }
  }
];

// Animal to instrument mapping
const ANIMAL_INSTRUMENT_MAP = {
  'dhol': 'monkey',
  'cymbals': 'peacock',
  'bells': 'elephant',
  'shehnai': 'squirrel',
  'drum': 'bunny'
};

const FestivalPianoMusicalChallenge = ({ 
  onComplete, 
  onBackToModeSelect,
  ganeshaImage 
}) => {
  // Game state
  const [phase, setPhase] = useState(CHALLENGE_PHASES.WELCOME);
  const [currentRound, setCurrentRound] = useState(0);
  const [pattern, setPattern] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [totalStars, setTotalStars] = useState(0);
  const [completedRounds, setCompletedRounds] = useState([]);
  
  // Visual state
  const [activeInstrument, setActiveInstrument] = useState(null);
  const [dancingAnimal, setDancingAnimal] = useState(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const [patternDisplay, setPatternDisplay] = useState([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  const [ganeshaMessage, setGaneshaMessage] = useState('');
  
  // Audio and refs
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    };
    initAudio();

    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Play instrument sound
  const playInstrumentSound = async (instrument) => {
    if (!audioContextRef.current) return;

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillators = [instrument.soundFreq.base, ...instrument.soundFreq.harmonics].map((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now);
      osc.type = index === 0 ? 'sine' : 'triangle';
      
      const volume = index === 0 ? 0.3 : 0.1;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      return { osc, gain };
    });

    oscillators.forEach(({ osc }) => {
      osc.start(now);
      osc.stop(now + 0.8);
    });
  };

  // Generate random pattern for current round
  const generatePattern = () => {
    const round = ROUNDS[currentRound];
    const availableInstruments = INSTRUMENTS.slice(0, round.instrumentCount);
    const newPattern = [];
    
    for (let i = 0; i < round.beats; i++) {
      const randomInstrument = availableInstruments[Math.floor(Math.random() * availableInstruments.length)];
      newPattern.push(randomInstrument);
    }
    
    console.log('Generated pattern:', newPattern.map(i => i.id));
    return newPattern;
  };

  // Start challenge
  const startChallenge = () => {
    setGaneshaMessage(ROUNDS[0].ganeshaMessage);
    safeSetTimeout(() => {
      startCountdown();
    }, 2000);
  };

  // Countdown before showing pattern
  const startCountdown = () => {
    setPhase(CHALLENGE_PHASES.COUNTDOWN);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          safeSetTimeout(() => {
            const newPattern = generatePattern();
            setPattern(newPattern);
            playPattern(newPattern);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Play pattern to player
  const playPattern = (patternToPlay) => {
    setPhase(CHALLENGE_PHASES.WATCHING);
    setPatternDisplay([]);
    setCurrentBeatIndex(0);
    
    patternToPlay.forEach((instrument, index) => {
      safeSetTimeout(() => {
        // Visual feedback
        setActiveInstrument(instrument.id);
        setPatternDisplay(prev => [...prev, instrument]);
        setCurrentBeatIndex(index);
        
        // Play sound
        playInstrumentSound(instrument);
        
        // Trigger animal dance
        const animalType = ANIMAL_INSTRUMENT_MAP[instrument.id];
        setDancingAnimal(animalType);
        
        safeSetTimeout(() => {
          setActiveInstrument(null);
          setDancingAnimal(null);
        }, 800);
        
        // After last beat
        if (index === patternToPlay.length - 1) {
          safeSetTimeout(() => {
            setPhase(CHALLENGE_PHASES.YOUR_TURN);
            setGaneshaMessage("Now you try! Click the instruments!");
          }, 1200);
        }
      }, index * 1200);
    });
  };

  // Handle player clicking instrument
  const handleInstrumentClick = async (instrumentId) => {
    if (phase !== CHALLENGE_PHASES.YOUR_TURN) return;

    const instrument = INSTRUMENTS.find(i => i.id === instrumentId);
    if (!instrument) return;

    // Play sound and animate
    setActiveInstrument(instrumentId);
    playInstrumentSound(instrument);
    
    // Trigger animal dance
    const animalType = ANIMAL_INSTRUMENT_MAP[instrumentId];
    setDancingAnimal(animalType);
    
    safeSetTimeout(() => {
      setActiveInstrument(null);
      setDancingAnimal(null);
    }, 600);

    const newInput = [...playerInput, instrument];
    const currentIndex = newInput.length - 1;

    // Check if correct
    if (newInput[currentIndex].id === pattern[currentIndex].id) {
      console.log('✓ Correct!');
      setPlayerInput(newInput);
      
      // Sparkle effect
      setShowSparkle(true);
      safeSetTimeout(() => setShowSparkle(false), 500);

      // Check if round complete
      if (newInput.length === pattern.length) {
        handleRoundComplete();
      }
    } else {
      console.log('✗ Wrong!');
      handleError();
    }
  };

  // Handle correct round completion
  const handleRoundComplete = () => {
    const round = ROUNDS[currentRound];
    setPhase(CHALLENGE_PHASES.ROUND_COMPLETE);
    setTotalStars(prev => prev + round.stars);
    setCompletedRounds(prev => [...prev, currentRound]);
    setGaneshaMessage(`🎉 Excellent! You earned ${round.stars} stars!`);

    safeSetTimeout(() => {
      if (currentRound < ROUNDS.length - 1) {
        // Next round
        setCurrentRound(prev => prev + 1);
        setPlayerInput([]);
        setPattern([]);
        setPatternDisplay([]);
        setGaneshaMessage(ROUNDS[currentRound + 1].ganeshaMessage);
        
        safeSetTimeout(() => {
          startCountdown();
        }, 2000);
      } else {
        // Challenge complete!
        handleChallengeComplete();
      }
    }, 3000);
  };

  // Handle error
  const handleError = () => {
    setShowError(true);
    setPlayerInput([]);
    setGaneshaMessage("Oops! Listen again carefully...");
    
    safeSetTimeout(() => {
      setShowError(false);
      playPattern(pattern);
    }, 2000);
  };

  // Handle full challenge completion
  const handleChallengeComplete = () => {
    setPhase(CHALLENGE_PHASES.CHALLENGE_COMPLETE);
    setGaneshaMessage("🎉 Amazing! You're a rhythm master!");
    
    if (onComplete) {
      onComplete({
        stars: totalStars,
        completed: true,
        mode: 'challenge'
      });
    }
  };

  return (
    <div className="musical-challenge-container">
      {/* Ganesha Character */}
      <div className="ganesha-challenge">
        <div 
          className="ganesha-challenge-image"
          style={{ backgroundImage: `url(${ganeshaImage})` }}
        />
        {ganeshaMessage && (
          <div className="ganesha-message-bubble">
            {ganeshaMessage}
          </div>
        )}
      </div>

      {/* Welcome Screen */}
      {phase === CHALLENGE_PHASES.WELCOME && (
        <div className="challenge-welcome">
          <h2>🎵 Musical Challenge</h2>
          <p>Watch Ganesha play a pattern, then play it back!</p>
          <div className="rounds-preview">
            {ROUNDS.map((round, index) => (
              <div key={round.id} className="round-preview">
                <div className="round-icon">🎵</div>
                <div className="round-info">
                  <strong>Round {round.id}</strong>
                  <span>{round.beats} beats • {round.stars} ⭐</span>
                </div>
              </div>
            ))}
          </div>
          <button className="start-challenge-btn" onClick={startChallenge}>
            🎵 Start Challenge
          </button>
          <button className="back-to-modes-btn" onClick={onBackToModeSelect}>
            ← Back to Mode Selection
          </button>
        </div>
      )}

      {/* Round Progress Indicator */}
      {phase !== CHALLENGE_PHASES.WELCOME && phase !== CHALLENGE_PHASES.CHALLENGE_COMPLETE && (
        <div className="round-progress">
          {ROUNDS.map((round, index) => (
            <div 
              key={round.id}
              className={`round-indicator ${
                completedRounds.includes(index) ? 'completed' :
                currentRound === index ? 'active' : 'locked'
              }`}
            >
              {completedRounds.includes(index) ? '✓' : round.id}
            </div>
          ))}
          <div className="stars-display">⭐ {totalStars}/8</div>
        </div>
      )}

      {/* Countdown */}
      {phase === CHALLENGE_PHASES.COUNTDOWN && countdown > 0 && (
        <div className="countdown-display">{countdown}</div>
      )}

      {/* Pattern Display */}
      {(phase === CHALLENGE_PHASES.WATCHING || phase === CHALLENGE_PHASES.YOUR_TURN) && (
        <div className="pattern-display">
          <div className="pattern-label">
            {phase === CHALLENGE_PHASES.WATCHING ? '👀 Watch & Listen' : '👆 Your Turn!'}
          </div>
          <div className="pattern-beats">
            {pattern.map((instrument, index) => {
              const isRevealed = index < patternDisplay.length;
              const isCompleted = index < playerInput.length;
              const isCorrect = playerInput[index]?.id === pattern[index].id;
              const isCurrent = index === playerInput.length && phase === CHALLENGE_PHASES.YOUR_TURN;
              
              return (
                <div 
                  key={index}
                  className={`beat-slot ${
                    isRevealed ? 'revealed' : 'hidden'
                  } ${
                    isCurrent ? 'current' : ''
                  } ${
                    isCompleted ? (isCorrect ? 'correct' : 'wrong') : ''
                  }`}
                  style={{ 
                    backgroundColor: isRevealed ? instrument.color : '#ccc',
                    opacity: isRevealed ? 1 : 0.3
                  }}
                >
                  <div className="beat-number">{index + 1}</div>
                  {isCompleted && (
                    <div className="beat-status">{isCorrect ? '✓' : '✗'}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="error-message">
          ❌ Not quite! Listen again...
        </div>
      )}

      {/* Dancing Animals */}
      <div className="dancing-animals-challenge">
        {Object.keys(ANIMAL_INSTRUMENT_MAP).map(instrumentId => {
          const animalType = ANIMAL_INSTRUMENT_MAP[instrumentId];
          const isDancing = dancingAnimal === animalType;
          
          return (
            <div
              key={animalType}
              className={`challenge-animal ${animalType} ${isDancing ? 'dancing' : ''}`}
            >
              {/* Animal emoji/image */}
              <span className="animal-emoji">
                {animalType === 'monkey' && '🐒'}
                {animalType === 'peacock' && '🦚'}
                {animalType === 'elephant' && '🐘'}
                {animalType === 'squirrel' && '🐿️'}
                {animalType === 'bunny' && '🐰'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Instrument Keys (clickable during YOUR_TURN) */}
      <div className="challenge-instruments">
        {INSTRUMENTS.slice(0, ROUNDS[currentRound]?.instrumentCount || 5).map(instrument => (
          <button
            key={instrument.id}
            className={`challenge-key ${activeInstrument === instrument.id ? 'active' : ''}`}
            style={{ 
              backgroundColor: instrument.color,
              left: `${instrument.keyPosition.x}%`,
              top: `${instrument.keyPosition.y}%`
            }}
            onClick={() => handleInstrumentClick(instrument.id)}
            disabled={phase !== CHALLENGE_PHASES.YOUR_TURN}
          >
            <span className="instrument-icon">
              {instrument.id === 'dhol' && '🥁'}
              {instrument.id === 'cymbals' && '🎶'}
              {instrument.id === 'bells' && '🔔'}
              {instrument.id === 'shehnai' && '🎺'}
              {instrument.id === 'drum' && '🪘'}
            </span>
          </button>
        ))}
      </div>

      {/* Sparkle Effect */}
      {showSparkle && (
        <div className="sparkle-burst">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="sparkle-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Challenge Complete Screen */}
      {phase === CHALLENGE_PHASES.CHALLENGE_COMPLETE && (
        <div className="challenge-complete-overlay">
          <div className="challenge-complete-content">
            <h2>🎉 Challenge Complete!</h2>
            <div className="final-stars">
              ⭐ {totalStars}/8 Stars Earned!
            </div>
            <p>You've mastered the festival rhythms!</p>
            <div className="complete-buttons">
              <button className="play-again-btn" onClick={() => {
                setCurrentRound(0);
                setTotalStars(0);
                setCompletedRounds([]);
                setPlayerInput([]);
                setPattern([]);
                setPhase(CHALLENGE_PHASES.WELCOME);
              }}>
                🔄 Play Again
              </button>
              <button className="back-to-modes-btn" onClick={onBackToModeSelect}>
                🎨 Try Free Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalPianoMusicalChallenge;