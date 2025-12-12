// FestivalPianoGame.jsx - UPDATED with Festival Challenge Mode
import React, { useState, useEffect, useRef } from 'react';
import './FestivalPianoGame.css';

// Import scene management components
import SceneManager from "../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../lib/components/scenes/MessageManager";
import InteractionManager, { ClickableElement } from "../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../lib/services/GameStateManager";
import ProgressManager from '../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../lib/services/SimpleSceneManager';

import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import GamePauseMenu from '../components/GamePauseMenu';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

import musicBadge from './assets/images/music-badge.png';
import ganeshaCompletion from './assets/images/ganesha-musician.png';
import ganeshaGameScene from './assets/images/ganesha-musician.png';

// Game modes
const GAME_MODES = {
  SELECTION: 'selection',
  FREE_PLAY: 'freePlay',
  CHALLENGE: 'challenge'
};

// Game phases for progression
const PHASES = {
  DISCOVERY: 'discovery',
  CELEBRATION: 'celebration',
  COMPLETE: 'complete'
};

// Animal to instrument mapping
const ANIMAL_INSTRUMENT_MAP = {
  'dhol': 'monkey',
  'cymbals': 'peacock',
  'bells': 'elephant',
  'shehnai': 'squirrel',
  'drum': 'bunny'
};

// Instrument configuration with Indian classical note names
const INSTRUMENTS = [
  {
    id: 'bells',
    name: 'Sa (C)',
    indianName: 'सा',
    color: '#4169E1',
    culturalNote: 'Base note - like the foundation of a house!',
    keyPosition: { x: 20, y: 65 },
    soundFreq: { base: 261.63, harmonics: [523.25, 1046.50] }  // C4, C5, C6
  },
  {
    id: 'cymbals',
    name: 'Re (D)', 
    indianName: 'रे',
    color: '#FFD700',
    culturalNote: 'Second note - adds rhythm to the melody!',
    keyPosition: { x: 35, y: 65 },
    soundFreq: { base: 293.66, harmonics: [587.33, 1174.66] }  // D4, D5, D6
  },
  {
    id: 'shehnai',
    name: 'Ga (E)',
    indianName: 'ग',
    color: '#FF8C00',
    culturalNote: 'Third note - brings joy to celebrations!',
    keyPosition: { x: 50, y: 65 },
    soundFreq: { base: 329.63, harmonics: [659.25, 1318.51] }  // E4, E5, E6
  },
  {
    id: 'dhol',
    name: 'Ma (F)',
    indianName: 'म',
    color: '#DC143C',
    culturalNote: 'Fourth note - powerful like a drum!',
    keyPosition: { x: 65, y: 65 },
    soundFreq: { base: 349.23, harmonics: [698.46, 1396.91] }  // F4, F5, F6
  },
  {
    id: 'drum',
    name: 'Pa (G)',
    indianName: 'प',
    color: '#32CD32',
    culturalNote: 'Fifth note - perfect harmony!',
    keyPosition: { x: 80, y: 65 },
    soundFreq: { base: 392.00, harmonics: [784.00, 1568.00] }  // G4, G5, G6
  }
];

// 🐘 GANESHA SONGS - 4 Authentic prayers and bhajans
const FESTIVAL_SONGS = [
  {
    id: 'jai-ganesh-aarti',
    name: 'Jai Ganesh Deva',
    festival: 'Ganesh Aarti',
    difficulty: 1,
    icon: '🐘',
    description: 'The most famous prayer to Lord Ganesha',
    melody: ['bells', 'cymbals', 'shehnai', 'bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells'],
    // Musical notes: C D E C D E E D C - "Jai Ganesh, Jai Ganesh, Jai Ganesh Deva"
    culturalNote: 'This aarti is sung daily in millions of homes across India',
    unlocked: true
  },
  {
    id: 'gajanana-ganaraya',
    name: 'Gajanana Shri Ganaraya',
    festival: 'Ganesh Bhajan',
    difficulty: 2,
    icon: '🙏',
    description: 'Beautiful prayer praising Ganesh as the elephant-faced god',
    melody: ['bells', 'cymbals', 'shehnai', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells', 'cymbals', 'bells'],
    // Musical notes: C D E D E E D C D C - "Gajanana Shri Ganaraya"
    culturalNote: 'Sung during Ganesh Chaturthi processions - "Gajanana" means elephant-faced',
    unlocked: false
  },
  {
    id: 'shendur-lal',
    name: 'Shendur Lal Chadhayo',
    festival: 'Ganesh Visarjan',
    difficulty: 2,
    icon: '🟠',
    description: 'Sung during Ganesh immersion ceremonies',
    melody: ['shehnai', 'cymbals', 'bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells'],
    // Musical notes: E D C D E E D C - "Shendur lal chadhayo"
    culturalNote: 'About offering red sindoor to Ganesha - played during visarjan processions',
    unlocked: false
  },
  {
    id: 'sukh-karta',
    name: 'Sukh Karta Dukh Harta',
    festival: 'Ganesh Aarti',
    difficulty: 3,
    icon: '✨',
    description: 'Prayer praising Ganesha as the giver of happiness',
    melody: ['bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'shehnai', 'bells', 'cymbals', 'shehnai', 'cymbals', 'bells', 'bells', 'bells'],
    // Musical notes: C D E E D E C D E D C C C - "Sukh karta dukh harta"
    culturalNote: 'Means "Giver of joy, remover of sorrow, destroyer of obstacles"',
    unlocked: false
  }
];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Game</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🎯 WRAPPER COMPONENT
const FestivalPianoGame = ({
  onComplete,
  onNavigate,
  zoneId = 'festival-square',
  sceneId = 'game1'
}) => {
  console.log('FestivalPianoGame props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Game mode state
          currentMode: GAME_MODES.SELECTION,
          
          // Free Play state
          phase: PHASES.DISCOVERY,
          tapCount: 0,
          discoveredInstruments: {},
          celebrationStarted: false,
          gameStartTime: Date.now(),
          
          // Challenge Mode state
          unlockedSongs: { 'jai-ganesh-aarti': true },
          completedSongs: {},
          challengeStars: 0,
          currentSong: null,
          currentStep: 0,
          challengeAttempts: 0,
          
          // Demo and Recording state
          isDemoPlaying: false,
          demoStep: 0,
          isRecording: false,
          recordedNotes: [],
          hasRecording: false,
          isPlayingRecording: false,
          
          // Progress tracking
          stars: 0,
          completed: false,
          showDoneButton: false,
          
          // UI state
          activeKey: null,
          showSparkle: null,
          showCulturalNote: null,
          showCompletionBadge: false,
          showSceneCompletion: false,
          showPauseMenu: false,
          
          // Dancing animals state
          dancingAnimals: {},
          showDanceFloor: false,
          danceParticles: [],
          
          // Completion tracking
          currentPopup: null,
          showingCompletionScreen: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <FestivalPianoContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

// 🎮 CONTENT COMPONENT
const FestivalPianoContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('FestivalPianoContent render', { sceneState, isReload, zoneId, sceneId });

  // Local UI state
  const [localUIState, setLocalUIState] = useState({
    activeKey: null,
    showSparkle: null,
    showCulturalNote: null,
    danceParticles: []
  });

  // Audio context and refs
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);
  const particleCounterRef = useRef(0);

  // Initialize Web Audio API
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

  // Handle reload scenarios
  useEffect(() => {
    if (!isReload || !sceneState) return;

    console.log('🔄 FESTIVAL RELOAD: Starting reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase
    });

    if (sceneState.showingCompletionScreen) {
      console.log('🔄 Resuming completion screen');
      sceneActions.updateState({ showSceneCompletion: true });
      return;
    }

    console.log('🔄 Normal reload, continuing game');
  }, [isReload]);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Play sound function
  const playSound = (instrument, duration = 0.3) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create oscillators for harmonics
    instrument.soundFreq.harmonics.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = index === 0 ? 'sine' : 'sine';

      const baseGain = 0.15 / (index + 1);
      gainNode.gain.setValueAtTime(baseGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  };

  // 🎯 MODE SELECTION HANDLERS
  const handleModeSelect = (mode) => {
    sceneActions.updateState({ currentMode: mode });
    
    if (mode === GAME_MODES.FREE_PLAY) {
      // Reset free play state
      sceneActions.updateState({
        tapCount: 0,
        discoveredInstruments: {},
        stars: 0,
        phase: PHASES.DISCOVERY
      });
    }
  };

  // 🎵 DEMO PLAYBACK: Auto-play the song for kids to hear
  const playDemo = () => {
    if (!sceneState.currentSong) return;

    sceneActions.updateState({ 
      isDemoPlaying: true, 
      demoStep: 0,
      currentStep: 0 
    });

    const melody = sceneState.currentSong.melody;
    
    // Play each note in sequence
    melody.forEach((instrumentId, index) => {
      safeSetTimeout(() => {
        const instrument = INSTRUMENTS.find(i => i.id === instrumentId);
        if (instrument) {
          playSound(instrument, 0.5);
          
          // Visual feedback
          setLocalUIState(prev => ({
            ...prev,
            activeKey: instrumentId,
            showSparkle: instrumentId
          }));

          sceneActions.updateState({ demoStep: index + 1 });

          // Clear visual after delay
          safeSetTimeout(() => {
            setLocalUIState(prev => ({
              ...prev,
              activeKey: null,
              showSparkle: null
            }));
          }, 400);
        }

        // Demo complete
        if (index === melody.length - 1) {
          safeSetTimeout(() => {
            sceneActions.updateState({ 
              isDemoPlaying: false, 
              demoStep: 0 
            });
          }, 800);
        }
      }, index * 600); // 600ms between notes
    });
  };

  // 🎙️ RECORDING: Start/Stop recording
  const toggleRecording = () => {
    if (sceneState.isRecording) {
      // Stop recording
      sceneActions.updateState({ 
        isRecording: false,
        hasRecording: sceneState.recordedNotes.length > 0
      });
    } else {
      // Start recording
      sceneActions.updateState({ 
        isRecording: true,
        recordedNotes: [],
        hasRecording: false
      });
    }
  };

  // 🔊 PLAYBACK: Play back the recording
  const playRecording = () => {
    if (sceneState.recordedNotes.length === 0) return;

    sceneActions.updateState({ isPlayingRecording: true });

    sceneState.recordedNotes.forEach((note, index) => {
      safeSetTimeout(() => {
        const instrument = INSTRUMENTS.find(i => i.id === note.instrumentId);
        if (instrument) {
          playSound(instrument, 0.5);
          
          setLocalUIState(prev => ({
            ...prev,
            activeKey: note.instrumentId,
            showSparkle: note.instrumentId
          }));

          safeSetTimeout(() => {
            setLocalUIState(prev => ({
              ...prev,
              activeKey: null,
              showSparkle: null
            }));
          }, 400);
        }

        // Playback complete
        if (index === sceneState.recordedNotes.length - 1) {
          safeSetTimeout(() => {
            sceneActions.updateState({ isPlayingRecording: false });
          }, 800);
        }
      }, index * 600);
    });
  };

  // 🗑️ Clear recording
  const clearRecording = () => {
    sceneActions.updateState({ 
      recordedNotes: [],
      hasRecording: false
    });
  };
  // 🎵 CHALLENGE MODE: Song Selection
  const handleSongSelect = (song) => {
    if (!song.unlocked && !sceneState.unlockedSongs[song.id]) {
      return; // Can't select locked songs
    }

    sceneActions.updateState({
      currentSong: song,
      currentStep: 0,
      challengeAttempts: 0,
      recordedNotes: [],
      hasRecording: false,
      isRecording: false
    });

    // Auto-play demo after short delay
    safeSetTimeout(() => {
      playDemo();
      
      // After demo finishes, auto-start recording
      const demoLength = song.melody.length * 600 + 1000; // Calculate total demo time
      safeSetTimeout(() => {
        sceneActions.updateState({ 
          isRecording: true,
          recordedNotes: []
        });
      }, demoLength);
    }, 1000);
  };

  // 🎵 CHALLENGE MODE: Key Press Handler
  const handleChallengeKeyPress = (instrument) => {
    const { currentSong, currentStep, isDemoPlaying, isPlayingRecording } = sceneState;
    
    if (!currentSong || isDemoPlaying || isPlayingRecording) return;

    const expectedKey = currentSong.melody[currentStep];
    const isCorrect = instrument.id === expectedKey;

    // Play sound
    playSound(instrument, 0.3);

    // ALWAYS record the note during challenge mode
    const newRecording = [
      ...sceneState.recordedNotes,
      { 
        instrumentId: instrument.id, 
        timestamp: Date.now(),
        wasCorrect: isCorrect,
        step: currentStep
      }
    ];
    sceneActions.updateState({ recordedNotes: newRecording });

    // Visual feedback
    setLocalUIState(prev => ({
      ...prev,
      activeKey: instrument.id,
      showSparkle: isCorrect ? instrument.id : null
    }));

    if (isCorrect) {
      // Correct key pressed!
      const nextStep = currentStep + 1;
      
      if (nextStep >= currentSong.melody.length) {
        // Song completed! 🎉
        // Stop recording and enable playback
        sceneActions.updateState({ 
          isRecording: false,
          hasRecording: true
        });
        handleSongComplete(currentSong);
      } else {
        // Move to next note
        sceneActions.updateState({ currentStep: nextStep });
      }
    } else {
      // Wrong key - gentle shake feedback
      setLocalUIState(prev => ({
        ...prev,
        showSparkle: 'wrong'
      }));
      
      sceneActions.updateState({ 
        challengeAttempts: sceneState.challengeAttempts + 1 
      });
    }

    // Clear visual feedback
    safeSetTimeout(() => {
      setLocalUIState(prev => ({
        ...prev,
        activeKey: null,
        showSparkle: null
      }));
    }, 300);
  };

  // 🎉 CHALLENGE MODE: Song Completion
  const handleSongComplete = (song) => {
    const newStars = sceneState.challengeStars + (song.difficulty * 2);
    const completedSongs = { ...sceneState.completedSongs, [song.id]: true };
    
    // Unlock next song
    const songIndex = FESTIVAL_SONGS.findIndex(s => s.id === song.id);
    const nextSong = FESTIVAL_SONGS[songIndex + 1];
    const unlockedSongs = { ...sceneState.unlockedSongs };
    
    if (nextSong) {
      unlockedSongs[nextSong.id] = true;
    }

    sceneActions.updateState({
      challengeStars: newStars,
      stars: Math.max(sceneState.stars, newStars),
      completedSongs,
      unlockedSongs,
      currentSong: null,
      currentStep: 0
    });

    // Show celebration
    setLocalUIState(prev => ({
      ...prev,
      showSparkle: 'celebration'
    }));

    safeSetTimeout(() => {
      setLocalUIState(prev => ({
        ...prev,
        showSparkle: null
      }));
    }, 2000);
  };

  // 🎹 FREE PLAY: Key Press Handler (original logic)
  const handleFreePlayKeyPress = (instrument) => {
    playSound(instrument, 0.5);

    const newTapCount = sceneState.tapCount + 1;
    const wasDiscovered = sceneState.discoveredInstruments[instrument.id];
    const newDiscoveredInstruments = {
      ...sceneState.discoveredInstruments,
      [instrument.id]: true
    };

    setLocalUIState(prev => ({
      ...prev,
      activeKey: instrument.id,
      showSparkle: instrument.id,
      showCulturalNote: !wasDiscovered ? {
        instrument,
        position: instrument.keyPosition
      } : prev.showCulturalNote
    }));

    const totalDiscovered = Object.keys(newDiscoveredInstruments).length;
    let newStars = sceneState.stars;

    if (!wasDiscovered) {
      newStars += 1;
      
      const animal = ANIMAL_INSTRUMENT_MAP[instrument.id];
      if (animal) {
        const newDancingAnimals = {
          ...sceneState.dancingAnimals,
          [animal]: true
        };
        sceneActions.updateState({ dancingAnimals: newDancingAnimals });
      }
    }

    if (newTapCount % 5 === 0) {
      newStars += 1;
    }

    sceneActions.updateState({
      tapCount: newTapCount,
      discoveredInstruments: newDiscoveredInstruments,
      stars: newStars,
      showDanceFloor: totalDiscovered >= 3
    });

    if (totalDiscovered === 5 && !sceneState.celebrationStarted) {
      sceneActions.updateState({
        celebrationStarted: true,
        phase: PHASES.CELEBRATION,
        showDoneButton: true
      });
      
      setLocalUIState(prev => ({
        ...prev,
        showSparkle: 'gentle-celebration'
      }));
    }

    safeSetTimeout(() => {
      setLocalUIState(prev => ({
        ...prev,
        activeKey: null,
        showSparkle: null,
        showCulturalNote: null
      }));
    }, 2000);
  };

  // Determine which handler to use
  const handleKeyPress = (instrument) => {
    if (sceneState.currentMode === GAME_MODES.FREE_PLAY) {
      handleFreePlayKeyPress(instrument);
    } else if (sceneState.currentMode === GAME_MODES.CHALLENGE) {
      handleChallengeKeyPress(instrument);
    }
  };

  // Get current song's next expected key
  const getNextExpectedKey = () => {
    if (sceneState.currentMode !== GAME_MODES.CHALLENGE || !sceneState.currentSong) {
      return null;
    }
    return sceneState.currentSong.melody[sceneState.currentStep];
  };

  // Check if sceneState exists
  if (!sceneState) {
    return <div className="loading">Loading game state...</div>;
  }

  // 🎨 RENDER MODE SELECTION SCREEN
  if (sceneState.currentMode === GAME_MODES.SELECTION) {
    return (
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager
          sceneState={sceneState}
          sceneActions={sceneActions}
          zoneId={zoneId}
          sceneId={sceneId}
        >
          <div className="festival-piano-game">
            <div className="mode-selection-screen">
              <h1 className="mode-title">🎹 Festival Piano 🎹</h1>
              <p className="mode-subtitle">Choose your musical adventure!</p>
              
              <div className="mode-cards">
                {/* Free Play Card */}
                <div 
                  className="mode-card free-play-card"
                  onClick={() => handleModeSelect(GAME_MODES.FREE_PLAY)}
                >
                  <div className="mode-icon">🎵</div>
                  <h2>Free Play</h2>
                  <p>Explore and create your own melodies</p>
                  <div className="mode-features">
                    {/*<span>✨ Discover instruments</span>
                    <span>🎨 Make dancing animals appear</span>
                    <span>🎶 Play whatever you like!</span>*/}
                  </div>
                  <button className="mode-button">Let's Play!</button>
                </div>

                {/* Challenge Mode Card */}
                <div 
                  className="mode-card challenge-card"
                  onClick={() => handleModeSelect(GAME_MODES.CHALLENGE)}
                >
                  <div className="mode-icon">🎯</div>
                  <h2>Festival Challenge</h2>
                  <p>Learn traditional ganesha songs</p>
                  <div className="mode-features">
                    {/*<span>🪔 Play Diwali melodies</span>
                    <span>🎨 Learn Holi rhythms</span>
                    <span>⭐ Unlock new songs!</span>*/}
                  </div>
                  <button className="mode-button challenge-button">Start Challenge!</button>
                </div>
              </div>

              <div className="progress-summary">
                <div className="summary-stat">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">{sceneState.stars}</span>
                  <span className="stat-label">Total Stars</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-icon">🎵</span>
                  <span className="stat-value">{Object.keys(sceneState.completedSongs).length}</span>
                  <span className="stat-label">Songs Mastered</span>
                </div>
              </div>
            </div>

            <TocaBocaNav
              onHome={() => {
                if (onNavigate) onNavigate('home');
              }}
              onProgress={() => {
                console.log('Show festival progress');
              }}
              onHelp={() => console.log('Show help')}
              onParentMenu={() => console.log('Parent menu')}
              isAudioOn={true}
              onAudioToggle={() => console.log('Toggle audio')}
              onZonesClick={() => {
                if (onNavigate) onNavigate('zones');
              }}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
                total: 1
              }}
            />
          </div>
        </MessageManager>
      </InteractionManager>
    );
  }

  // 🎯 RENDER CHALLENGE MODE - SONG SELECTION
  if (sceneState.currentMode === GAME_MODES.CHALLENGE && !sceneState.currentSong) {
    return (
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager
          sceneState={sceneState}
          sceneActions={sceneActions}
          zoneId={zoneId}
          sceneId={sceneId}
        >
          <div className="festival-piano-game simple-song-selection">
            {/* Simple header */}
            <div className="simple-header">
              <button 
                className="simple-back"
                onClick={() => handleModeSelect(GAME_MODES.SELECTION)}
              >
                ← Back
              </button>
              <h1 className="simple-title">🎵 Ganesha Songs</h1>
              <div className="simple-stars">⭐ {sceneState.challengeStars}</div>
            </div>

            {/* 2x2 Grid - 4 songs, no scroll */}
            <div className="songs-grid-simple">
              {FESTIVAL_SONGS.map((song) => {
                const isUnlocked = song.unlocked || sceneState.unlockedSongs[song.id];
                const isCompleted = sceneState.completedSongs[song.id];

                return (
                  <div
                    key={song.id}
                    className={`song-card-simple ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => isUnlocked && handleSongSelect(song)}
                  >
                    <div className="song-icon-big">{song.icon}</div>
                    <h3 className="song-name-simple">{song.name}</h3>
                    <p className="song-type-simple">{song.festival}</p>
                    
                    <div className="song-difficulty-simple">
                      {Array.from({ length: song.difficulty }).map((_, i) => (
                        <span key={i} className="star-filled">⭐</span>
                      ))}
                    </div>

                    {isCompleted && <div className="completed-badge">✓</div>}
                    {!isUnlocked && (
                      <div className="locked-badge">
                        <span className="lock">🔒</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <TocaBocaNav
              onHome={() => {
                if (onNavigate) onNavigate('home');
              }}
              onZonesClick={() => {
                if (onNavigate) onNavigate('zones');
              }}
              currentProgress={{
                stars: sceneState.challengeStars || 0,
                completed: Object.keys(sceneState.completedSongs).length,
                total: FESTIVAL_SONGS.length
              }}
            />
          </div>
        </MessageManager>
      </InteractionManager>
    );
  }

  // 🎹 RENDER PIANO INTERFACE (Free Play or Challenge Playing)
  const nextExpectedKey = getNextExpectedKey();
  const isChallengePlaying = sceneState.currentMode === GAME_MODES.CHALLENGE && sceneState.currentSong;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        sceneState={sceneState}
        sceneActions={sceneActions}
        zoneId={zoneId}
        sceneId={sceneId}
      >
        <div className="festival-piano-game">
          {/* Header with mode info */}
          <div className="game-header">
            <button 
              className="back-button"
              onClick={() => {
                if (isChallengePlaying) {
                  sceneActions.updateState({ 
                    currentSong: null, 
                    currentStep: 0,
                    recordedNotes: [],
                    hasRecording: false,
                    isRecording: false
                  });
                } else {
                  handleModeSelect(GAME_MODES.SELECTION);
                }
              }}
            >
              ← {isChallengePlaying ? 'Songs' : 'Menu'}
            </button>

            {isChallengePlaying && (
              <div className="challenge-header-simple">
                <h2 className="song-title-simple">{sceneState.currentSong.icon} {sceneState.currentSong.name}</h2>
                
                {/* Simple 2-button control */}
                <div className="simple-controls">
                  <button 
                    className="simple-play-button"
                    onClick={playDemo}
                    disabled={sceneState.isDemoPlaying || sceneState.isPlayingRecording}
                  >
                    ▶️ Play Song
                  </button>

                  <button 
                    className={`simple-record-button ${sceneState.isRecording ? 'recording' : ''}`}
                    onClick={() => {
                      if (sceneState.isRecording) {
                        // Stop and show playback
                        sceneActions.updateState({ 
                          isRecording: false,
                          hasRecording: true
                        });
                        // Auto-play the recording
                        setTimeout(() => playRecording(), 500);
                      } else {
                        // Start recording
                        sceneActions.updateState({ 
                          isRecording: true,
                          recordedNotes: [],
                          currentStep: 0
                        });
                      }
                    }}
                    disabled={sceneState.isDemoPlaying || sceneState.isPlayingRecording}
                  >
                    {sceneState.isRecording ? '⏹️ Stop & Hear' : '⏺️ Record Me'}
                  </button>
                </div>

                {/* Progress dots only */}
                <div className="progress-dots-simple">
                  {sceneState.currentSong.melody.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index < sceneState.currentStep ? 'done' : ''} ${index === sceneState.currentStep ? 'now' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Piano Keys */}
     {/* Piano Base */}
<div className="piano-base">
  <div className="piano-keys-frame-simple" />
  
  {INSTRUMENTS.map((instrument) => (
              <div
                key={instrument.id}
                className="instrument-key-wrapper"
                style={{
                  left: `${instrument.keyPosition.x}%`,
                  top: `${instrument.keyPosition.y}%`
                }}
              >
                <div
                  className={`instrument-key ${localUIState.activeKey === instrument.id ? 'active' : ''} ${nextExpectedKey === instrument.id ? 'highlighted-next' : ''}`}
                  style={{
                    backgroundColor: instrument.color,
                    transform: localUIState.activeKey === instrument.id ? 'scale(0.95)' : 'scale(1)'
                  }}
                  onClick={() => handleKeyPress(instrument)}
                >
                  <div className="key-label-indian">{instrument.indianName}</div>
                  <div className="key-label-english">{instrument.name}</div>
                  {sceneState.discoveredInstruments[instrument.id] && (
                    <div className="discovery-badge">✨</div>
                  )}
                  
                  {/* Highlight glow for next expected key in challenge mode */}
                  {nextExpectedKey === instrument.id && (
                    <div className="next-key-glow" />
                  )}
                </div>

             {/* Dancing Animals Container */}
              <div className="dancing-animals">
                {Object.keys(ANIMAL_INSTRUMENT_MAP).map(instrumentId => {
                  const animalType = ANIMAL_INSTRUMENT_MAP[instrumentId];
                  const isDancing = sceneState.dancingAnimals?.[animalType];
                  
                  return (
                    <div key={animalType} className={`animal-character animal-${animalType} ${
                      isDancing ? 'animal-dancing' : ''
                    }`}>
                      {isDancing && (
                        <div className="animal-sparkles">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="animal-sparkle"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                {/* Sparkle effect */}
                {localUIState.showSparkle === instrument.id && (
                  <div className="sparkle-container">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="sparkle"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cultural Note Popup */}
          {localUIState.showCulturalNote && (
            <div 
              className="cultural-note"
              style={{
                left: `${localUIState.showCulturalNote.position.x}%`,
                top: `${localUIState.showCulturalNote.position.y - 15}%`
              }}
            >
              {localUIState.showCulturalNote.instrument.culturalNote}
            </div>
          )}

          {/* Progress Counter */}
          <div className="progress-counter">
            <div className="stars">⭐ {sceneState.stars}</div>
            {sceneState.currentMode === GAME_MODES.FREE_PLAY && (
              <>
                <div className="taps">🎵 {sceneState.tapCount}</div>
                <div className="instruments">🎼 {Object.keys(sceneState.discoveredInstruments).length}/5</div>
              </>
            )}
            {isChallengePlaying && !sceneState.isRecording && (
              <div className="challenge-progress">
                🎯 {sceneState.currentStep}/{sceneState.currentSong.melody.length}
              </div>
            )}
            {sceneState.isRecording && (
              <div className="recording-indicator">
                ⏺️ Recording... ({sceneState.recordedNotes.length} notes)
              </div>
            )}
          </div>

          {/* Celebration Effects */}
          {localUIState.showSparkle === 'celebration' && (
            <div className="celebration-overlay">
              <div className="celebration-message">
                <h2>🎉 Song Complete! 🎉</h2>
                <p>You earned {sceneState.currentSong?.difficulty * 2} stars!</p>
              </div>
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="celebration-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)].color
                  }}
                />
              ))}
            </div>
          )}

          {/* Wrong key feedback */}
          {localUIState.showSparkle === 'wrong' && (
            <div className="wrong-feedback">
              <span className="shake">Try again! 🎵</span>
            </div>
          )}

          <TocaBocaNav
            onHome={() => {
              if (onNavigate) onNavigate('home');
            }}
            onProgress={() => {
              console.log('Show festival progress');
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              if (onNavigate) onNavigate('zones');
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
              total: 1
            }}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default FestivalPianoGame;