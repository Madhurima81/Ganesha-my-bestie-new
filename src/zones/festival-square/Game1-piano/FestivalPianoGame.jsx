// FestivalPianoGame.jsx - FINAL VERSION with Intro Scene, Restyled UI, and All Game Modes + SONG COMPLETION MODAL
import React, { useState, useEffect, useRef } from 'react';
import './FestivalPianoGame.css';
import OpeningModal from '../../shared/components/OpeningModal.jsx';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../lib/config/content/openingModals';

// Import scene management components
import SceneManager from "../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../lib/services/GameStateManager";
import ProgressManager from '../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../lib/services/SimpleSceneManager';

import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import GamePauseMenu from '../components/GamePauseMenu';
import HomeButton from '../../../lib/components/ui/HomeButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';
import GameLayout from '../../../lib/components/layout/GameLayout';

import musicBadge from './assets/images/music-badge.png';
import ganeshaCompletion from './assets/images/ganesha-musician.png';
import ganeshaGameScene from './assets/images/ganesha-musician.png';
import listenIcon from '../assets/images/icons/listen-icon.png';
import playIcon from '../assets/images/icons/play-icon.png';
import createIcon from '../assets/images/icons/create-icon.png';
import { getCompletionModal } from "../../../lib/config/content";

// Game modes
const GAME_MODES = {
  INTRO: 'intro',
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

// Animal to instrument mapping (ENSURE IDs MATCH INSTRUMENTS)
const ANIMAL_INSTRUMENT_MAP = {
  'dhol': 'monkey',
  'cymbals': 'peacock',
  'bells': 'elephant',
  'shehnai': 'squirrel',
  'drum': 'bunny'
};

// Instrument configuration
const INSTRUMENTS = [
  { id: 'bells', name: 'Sa (C)', indianName: 'सा', color: '#4169E1', culturalNote: 'Base note - like the foundation of a house!', keyPosition: { x: 20, y: 65 }, soundFreq: { base: 261.63, harmonics: [523.25, 1046.50] } },
  { id: 'cymbals', name: 'Re (D)', indianName: 'रे', color: '#FFD700', culturalNote: 'Second note - adds rhythm to the melody!', keyPosition: { x: 35, y: 65 }, soundFreq: { base: 293.66, harmonics: [587.33, 1174.66] } },
  { id: 'shehnai', name: 'Ga (E)', indianName: 'ग', color: '#FF8C00', culturalNote: 'Third note - brings joy to celebrations!', keyPosition: { x: 50, y: 65 }, soundFreq: { base: 329.63, harmonics: [659.25, 1318.51] } },
  { id: 'dhol', name: 'Ma (F)', indianName: 'म', color: '#DC143C', culturalNote: 'Fourth note - powerful like a drum!', keyPosition: { x: 65, y: 65 }, soundFreq: { base: 349.23, harmonics: [698.46, 1396.91] } },
  { id: 'drum', name: 'Pa (G)', indianName: 'प', color: '#32CD32', culturalNote: 'Fifth note - perfect harmony!', keyPosition: { x: 80, y: 65 }, soundFreq: { base: 392.00, harmonics: [784.00, 1568.00] } }
];

// Ganesha Songs
const FESTIVAL_SONGS = [
  { id: 'jai-ganesh-aarti', name: 'Jai Ganesh Deva', festival: 'Ganesh Aarti', difficulty: 1, icon: '🐘', description: 'The most famous prayer to Lord Ganesha', melody: ['bells', 'cymbals', 'shehnai', 'bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells'], culturalNote: 'This aarti is sung daily in millions of homes across India', unlocked: true },
  { id: 'gajanana-ganaraya', name: 'Gajanana Shri Ganaraya', festival: 'Ganesh Bhajan', difficulty: 2, icon: '🙏', description: 'Beautiful prayer praising Ganesh as the elephant-faced god', melody: ['bells', 'cymbals', 'shehnai', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells', 'cymbals', 'bells'], culturalNote: 'Sung during Ganesh Chaturthi processions - "Gajanana" means elephant-faced', unlocked: false },
  { id: 'shendur-lal', name: 'Shendur Lal Chadhayo', festival: 'Ganesh Visarjan', difficulty: 2, icon: '🟠', description: 'Sung during Ganesh immersion ceremonies', melody: ['shehnai', 'cymbals', 'bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'bells'], culturalNote: 'About offering red sindoor to Ganesha - played during visarjan processions', unlocked: false },
  { id: 'sukh-karta', name: 'Sukh Karta Dukh Harta', festival: 'Ganesh Aarti', difficulty: 3, icon: '✨', description: 'Prayer praising Ganesha as the giver of happiness', melody: ['bells', 'cymbals', 'shehnai', 'shehnai', 'cymbals', 'shehnai', 'bells', 'cymbals', 'shehnai', 'cymbals', 'bells', 'bells', 'bells'], culturalNote: 'Means "Giver of joy, remover of sorrow, destroyer of obstacles"', unlocked: false }
];

const SongCompletionOverlay = ({
  show,
  songName,
  starsEarned,
  isPlayingMySong,
  onPlayAgain,
  onHearMySong,
  onTryAnother
}) => {
  if (!show) return null;

  return (
    <div className="mission-completion-overlay">
      <div className="completion-sparkles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="completion-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      <div className="completion-card">
        <div
          className="completion-ganesha"
          style={{ backgroundImage: `url(${ganeshaCompletion})` }}
        />

        <div className="completion-message">
          <h1 className="completion-title">🎵 Song Complete! 🎵</h1>
          <p className="completion-subtitle">{songName}</p>

          <div className="completion-stars">
            {Array.from({ length: starsEarned }).map((_, i) => (
              <span key={i} className="star-earned">⭐</span>
            ))}
          </div>

          <p className="completion-blessing">
            {isPlayingMySong
              ? "🔊 Listen to your beautiful music!"
              : "Beautiful music, little musician! Ganesha is smiling!"
            }
          </p>
        </div>

        <div className="completion-buttons-three">
          <button
            className="completion-btn play-again"
            onClick={onPlayAgain}
            disabled={isPlayingMySong}
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Play Again!</span>
          </button>

          <button
            className="completion-btn hear-my-song"
            onClick={onHearMySong}
            disabled={isPlayingMySong}
          >
            <span className="btn-icon">{isPlayingMySong ? '🔊' : '🎵'}</span>
            <span className="btn-text">{isPlayingMySong ? 'Playing...' : 'Hear My Song!'}</span>
          </button>

          <button
            className="completion-btn try-another"
            onClick={onTryAnother}
            disabled={isPlayingMySong}
          >
            <span className="btn-icon">🎯</span>
            <span className="btn-text">Try Another!</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error caught:", error, errorInfo); this.setState({ error, errorInfo }); }
  render() { if (this.state.hasError) { return (<div className="error-boundary"><h2>Something went wrong.</h2><button onClick={() => window.location.reload()}>Reload</button></div>); } return this.props.children; }
}

// 🎯 WRAPPER COMPONENT
const FestivalPianoGame = ({ onComplete, onNavigate, zoneId = 'festival-square', sceneId = 'game1' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          currentMode: GAME_MODES.INTRO,
          phase: PHASES.DISCOVERY, tapCount: 0, discoveredInstruments: {}, celebrationStarted: false, gameStartTime: Date.now(),
          unlockedSongs: { 'jai-ganesh-aarti': true }, completedSongs: {}, challengeStars: 0, currentSong: null, currentStep: 0, challengeAttempts: 0,
          isDemoPlaying: false, demoStep: 0, isRecording: false, recordedNotes: [], hasRecording: false, isPlayingRecording: false,
          stars: 0, completed: false, showDoneButton: false, activeKey: null, showSparkle: null, showCulturalNote: null, showCompletionBadge: false, showSceneCompletion: false, showPauseMenu: false,
          showSongComplete: false, completedSongData: null,
          dancingAnimals: {}, showDanceFloor: false, danceParticles: [], currentPopup: null, showingCompletionScreen: false,
          progress: { percentage: 0, starsEarned: 0, completed: false },

        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <FestivalPianoContent sceneState={sceneState} sceneActions={sceneActions} isReload={isReload} onComplete={onComplete} onNavigate={onNavigate} zoneId={zoneId} sceneId={sceneId} />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

// 🎮 CONTENT COMPONENT
const FestivalPianoContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId }) => {
  const [localUIState, setLocalUIState] = useState({ activeKey: null, showSparkle: null, showCulturalNote: null, danceParticles: [] });
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);
  const completionModalContent = getCompletionModal('festival-square', 'game1');
  const completionIcons = ['listen-icon', 'play-icon', 'create-icon'];

  const [freePlayRecording, setFreePlayRecording] = useState({
    isRecording: false,
    recordedNotes: [],
    hasRecording: false
  });

  useEffect(() => {
    const initAudio = async () => { try { audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.warn('Web Audio API not supported.'); } };
    initAudio();
    return () => { timeoutsRef.current.forEach(clearTimeout); audioContextRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (isReload && sceneState?.showingCompletionScreen) { sceneActions.updateState({ showSceneCompletion: true }); }
  }, [isReload, sceneState]);

  const safeSetTimeout = (callback, delay) => { const id = setTimeout(callback, delay); timeoutsRef.current.push(id); return id; };

  const playSound = (instrument, duration = 0.3) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current, now = ctx.currentTime;
    instrument.soundFreq.harmonics.forEach((freq, index) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.15 / (index + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.start(now); osc.stop(now + duration);
    });
  };

  const triggerAnimalDance = (instrumentId) => {
    const animalType = ANIMAL_INSTRUMENT_MAP[instrumentId];
    if (!animalType) return;
    sceneActions.updateState({ dancingAnimals: { ...sceneState.dancingAnimals, [animalType]: true } });
    safeSetTimeout(() => {
      const newDancing = { ...sceneState.dancingAnimals };
      delete newDancing[animalType];
      sceneActions.updateState({ dancingAnimals: newDancing });
    }, 1200);
  };

  const handleModeSelect = (mode) => {
    sceneActions.updateState({ currentMode: mode });
    if (mode === GAME_MODES.FREE_PLAY) {
      sceneActions.updateState({ tapCount: 0, discoveredInstruments: {}, stars: 0, phase: PHASES.DISCOVERY });
      // Clear any previous recording when entering free play
      setFreePlayRecording({ isRecording: false, recordedNotes: [], hasRecording: false });
    } else if (mode === GAME_MODES.CHALLENGE) {
      // Clear free play recording when switching to challenge
      setFreePlayRecording({ isRecording: false, recordedNotes: [], hasRecording: false });
    }
  };

  const playDemo = () => {
    if (!sceneState.currentSong || sceneState.isDemoPlaying) return;
    sceneActions.updateState({ isDemoPlaying: true, demoStep: 0, currentStep: 0 });
    const melody = sceneState.currentSong.melody;
    melody.forEach((id, index) => {
      safeSetTimeout(() => {
        const instrument = INSTRUMENTS.find(i => i.id === id);
        if (instrument) {
          playSound(instrument, 0.5);
          setLocalUIState(prev => ({ ...prev, activeKey: id, showSparkle: id }));
          sceneActions.updateState({ demoStep: index + 1 });
          safeSetTimeout(() => setLocalUIState(prev => ({ ...prev, activeKey: null, showSparkle: null })), 400);
        }
        if (index === melody.length - 1) {
          safeSetTimeout(() => sceneActions.updateState({ isDemoPlaying: false, demoStep: 0 }), 800);
        }
      }, index * 600);
    });
  };

  const playRecording = () => {
    if (!sceneState.recordedNotes.length || sceneState.isPlayingRecording) return;
    sceneActions.updateState({ isPlayingRecording: true });
    sceneState.recordedNotes.forEach((note, index) => {
      safeSetTimeout(() => {
        const instrument = INSTRUMENTS.find(i => i.id === note.instrumentId);
        if (instrument) {
          playSound(instrument, 0.5);
          setLocalUIState(prev => ({ ...prev, activeKey: note.instrumentId, showSparkle: note.instrumentId }));
          safeSetTimeout(() => setLocalUIState(prev => ({ ...prev, activeKey: null, showSparkle: null })), 400);
        }
        if (index === sceneState.recordedNotes.length - 1) {
          safeSetTimeout(() => sceneActions.updateState({ isPlayingRecording: false }), 800);
        }
      }, index * 600);
    });
  };

  const handleSongSelect = (song) => {
    if (!song.unlocked && !sceneState.unlockedSongs[song.id]) return;
    sceneActions.updateState({ currentSong: song, currentStep: 0, recordedNotes: [], isRecording: false });
    safeSetTimeout(playDemo, 1000);
  };

  const handleChallengeKeyPress = (instrument) => {
    const { currentSong, currentStep, isDemoPlaying, isPlayingRecording, isRecording } = sceneState;
    if (!currentSong || isDemoPlaying || isPlayingRecording || !isRecording) return;
    const expectedKey = currentSong.melody[currentStep];
    const isCorrect = instrument.id === expectedKey;
    playSound(instrument, 0.3);
    sceneActions.updateState({ recordedNotes: [...sceneState.recordedNotes, { instrumentId: instrument.id }] });
    setLocalUIState(prev => ({ ...prev, activeKey: instrument.id, showSparkle: isCorrect ? instrument.id : 'wrong' }));
    if (isCorrect) {
      const nextStep = currentStep + 1;
      if (nextStep >= currentSong.melody.length) {
        sceneActions.updateState({ isRecording: false, hasRecording: true });
        handleSongComplete(currentSong);
      } else {
        sceneActions.updateState({ currentStep: nextStep });
      }
    } else {
      sceneActions.updateState({ challengeAttempts: sceneState.challengeAttempts + 1 });
    }
    safeSetTimeout(() => setLocalUIState(prev => ({ ...prev, activeKey: null, showSparkle: null })), 300);
  };

  const handleSongComplete = (song) => {
    const starsEarned = song.difficulty * 2;
    const newStars = sceneState.challengeStars + starsEarned;
    const completedSongs = { ...sceneState.completedSongs, [song.id]: true };
    const songIndex = FESTIVAL_SONGS.findIndex(s => s.id === song.id);
    const nextSong = FESTIVAL_SONGS[songIndex + 1];
    const unlockedSongs = { ...sceneState.unlockedSongs, ...(nextSong && { [nextSong.id]: true }) };

    // Update state and show completion modal
    sceneActions.updateState({
      challengeStars: newStars,
      stars: Math.max(sceneState.stars, newStars),
      completedSongs,
      unlockedSongs,
      showSongComplete: true,
      completedSongData: {
        name: song.name,
        starsEarned: starsEarned,
        song: song
      }
    });
  };

  const handleFreePlayKeyPress = (instrument) => {
    playSound(instrument, 0.5);
    triggerAnimalDance(instrument.id);

    if (freePlayRecording.isRecording) {
      setFreePlayRecording(prev => ({
        ...prev,
        recordedNotes: [...prev.recordedNotes, {
          instrumentId: instrument.id,
          timestamp: Date.now()
        }]
      }));
    }

    const newTapCount = sceneState.tapCount + 1;
    const wasDiscovered = !!sceneState.discoveredInstruments[instrument.id];
    const newDiscovered = { ...sceneState.discoveredInstruments, [instrument.id]: true };
    setLocalUIState(prev => ({ ...prev, activeKey: instrument.id, showSparkle: instrument.id, showCulturalNote: !wasDiscovered ? { instrument, position: instrument.keyPosition } : null }));
    const totalDiscovered = Object.keys(newDiscovered).length;
    let newStars = sceneState.stars;
    if (!wasDiscovered) newStars += 1;
    if (newTapCount % 5 === 0) newStars += 1;
    sceneActions.updateState({ tapCount: newTapCount, discoveredInstruments: newDiscovered, stars: newStars });
    if (totalDiscovered >= 3 && !sceneState.celebrationStarted) {
      sceneActions.updateState({ celebrationStarted: true, showDoneButton: true });
    }
    safeSetTimeout(() => setLocalUIState(prev => ({ ...prev, activeKey: null, showSparkle: null, showCulturalNote: null })), 400);
  };

  const handleKeyPress = (instrument) => {
    if (sceneState.currentMode === GAME_MODES.FREE_PLAY) handleFreePlayKeyPress(instrument);
    else if (sceneState.currentMode === GAME_MODES.CHALLENGE) handleChallengeKeyPress(instrument);
  };

  const handleManualCompletion = () => {
    sceneActions.updateState({ phase: PHASES.COMPLETE, completed: true, stars: Math.max(8, sceneState.stars), showingCompletionScreen: true });
    safeSetTimeout(() => sceneActions.updateState({ showSceneCompletion: true }), 500);
  };

  const getNextExpectedKey = () => (sceneState.currentMode === GAME_MODES.CHALLENGE && sceneState.currentSong) ? sceneState.currentSong.melody[sceneState.currentStep] : null;

  const toggleFreePlayRecording = () => {
    if (freePlayRecording.isRecording) {
      setFreePlayRecording(prev => ({
        ...prev,
        isRecording: false,
        hasRecording: prev.recordedNotes.length > 0
      }));
    } else {
      setFreePlayRecording({
        isRecording: true,
        recordedNotes: [],
        hasRecording: false
      });
    }
  };

  const playFreePlayRecording = () => {
    if (sceneState.isPlayingRecording) return;
    sceneActions.updateState({ isPlayingRecording: true });

    freePlayRecording.recordedNotes.forEach((note, index) => {
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

        // Auto-stop when finished
        if (index === freePlayRecording.recordedNotes.length - 1) {
          safeSetTimeout(() => {
            sceneActions.updateState({ isPlayingRecording: false });
          }, 800);
        }
      }, index * 600);
    });
  };

  const stopFreePlayRecording = () => {
    // Clear all pending timeouts to stop playback
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];

    // Reset playing state
    sceneActions.updateState({ isPlayingRecording: false });
    setLocalUIState(prev => ({
      ...prev,
      activeKey: null,
      showSparkle: null
    }));
  };

  const downloadRecording = () => {
    const data = {
      notes: freePlayRecording.recordedNotes.map(n => n.instrumentId),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-melody-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle restart
  const handleRestart = () => {
    console.log('Restarting game');

    sceneActions.updateState({
      phase: PHASES.DISCOVERY,
      tapCount: 0,
      discoveredInstruments: {},
      celebrationStarted: false,
      gameStartTime: Date.now(),
      stars: 0,
      completed: false,
      showDoneButton: false,
      showCompletionBadge: false,
      showSceneCompletion: false,
      showingCompletionScreen: false,
      dancingAnimals: {},
      showDanceFloor: false,
      progress: {
        percentage: 0,
        starsEarned: 0,
        completed: false
      }
    });

    setLocalUIState({
      activeKey: null,
      showSparkle: null,
      showCulturalNote: null,
      danceParticles: []
    });

    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };


  if (!sceneState) return <div className="loading">Loading...</div>;

  if (sceneState.currentMode === GAME_MODES.INTRO) {
    return (
      <>
        <div className="festival-piano-game">
          {/* Piano background will show through */}
        </div>
        <OpeningModal
          zoneId={zoneId}
          sceneId={sceneId}
          onStart={() => sceneActions.updateState({ currentMode: GAME_MODES.SELECTION })}
          characterImg={ganeshaGameScene}
          showButton={true}
        />
        <TocaBocaNav onHome={() => onNavigate?.('home')} onZonesClick={() => onNavigate?.('zones')} />
      </>
    );
  }

  if (sceneState.currentMode === GAME_MODES.SELECTION) {
    return (
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager sceneState={sceneState} sceneActions={sceneActions} zoneId={zoneId} sceneId={sceneId}>
          <div className="festival-piano-game">


            <div className="mode-selection-screen">
              <h2 className="mode-subtitle">Choose Your Musical Adventure!</h2>
              <h1 className="mode-title">🎹 Festival Piano 🎹</h1>

              <div className="mode-cards">
                <div className="mode-card" onClick={() => handleModeSelect(GAME_MODES.FREE_PLAY)}>
                  <div className="mode-icon">🎵</div>
                  <h2>Free Play</h2>
                  <p>Explore and create your own melodies</p>
                  <button className="mode-button free-play-card">Let's Play!</button>
                </div>
                <div className="mode-card" onClick={() => handleModeSelect(GAME_MODES.CHALLENGE)}>
                  <div className="mode-icon">🎯</div>
                  <h2>Festival Challenge</h2>
                  <p>Learn traditional ganesha songs</p>
                  <button className="mode-button challenge-button">Start Challenge!</button>
                </div>
              </div>
              <div className="progress-summary"></div>
            </div>
            <TocaBocaNav onHome={() => onNavigate?.('home')} onZonesClick={() => onNavigate?.('zones')} currentProgress={{ stars: sceneState.stars || 0, completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0, total: 1 }} />
          </div>
        </MessageManager>
      </InteractionManager>
    );
  }

  if (sceneState.currentMode === GAME_MODES.CHALLENGE && !sceneState.currentSong) {
    return (
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager sceneState={sceneState} sceneActions={sceneActions} zoneId={zoneId} sceneId={sceneId}>
          <div className="festival-piano-game simple-song-selection">
            <div className="simple-header">
              <button className="simple-back" onClick={() => handleModeSelect(GAME_MODES.SELECTION)}>← Back</button><h1 className="simple-title">🎵 Ganesha Songs</h1><div className="simple-stars">⭐ {sceneState.challengeStars}</div>
            </div>
            <div className="songs-grid-simple">
              {FESTIVAL_SONGS.map(song => {
                const isUnlocked = song.unlocked || sceneState.unlockedSongs[song.id], isCompleted = sceneState.completedSongs[song.id];
                return (
                  <div key={song.id} className={`song-card-simple ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => isUnlocked && handleSongSelect(song)}>
                    <div className="song-icon-big">{song.icon}</div><h3 className="song-name-simple">{song.name}</h3><p className="song-type-simple">{song.festival}</p>
                    <div className="song-difficulty-simple">{Array.from({ length: song.difficulty }).map((_, i) => <span key={i} className="star-filled">⭐</span>)}</div>
                    {isCompleted && <div className="completed-badge">✓</div>} {!isUnlocked && <div className="locked-badge"><span className="lock">🔒</span></div>}
                  </div>
                );
              })}
            </div>
            <TocaBocaNav onHome={() => onNavigate?.('home')} onZonesClick={() => onNavigate?.('zones')} currentProgress={{ stars: sceneState.challengeStars || 0, completed: Object.keys(sceneState.completedSongs).length, total: FESTIVAL_SONGS.length }} />
          </div>
        </MessageManager>
      </InteractionManager>
    );
  }

  const isChallengePlaying = sceneState.currentMode === GAME_MODES.CHALLENGE && sceneState.currentSong;
  const nextExpectedKey = getNextExpectedKey();

  return (
    <GameLayout
      zoneId={zoneId}
      sceneState={sceneState}
      onHome={() => onNavigate?.('home')}
      onReplay={() => {
        if (sceneState.currentMode === GAME_MODES.FREE_PLAY) {
          handleRestart();
          setFreePlayRecording({ isRecording: false, recordedNotes: [], hasRecording: false });
        } else if (sceneState.currentMode === GAME_MODES.CHALLENGE && sceneState.currentSong) {
          sceneActions.updateState({
            currentStep: 0,
            recordedNotes: [],
            isRecording: false,
            isDemoPlaying: false,
            isPlayingRecording: false
          });
        }
      }}
      showMenuLabel={true}
      showPauseButton={true}
      onPause={() => sceneActions.updateState({ showPauseMenu: true })}
    >
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager sceneState={sceneState} sceneActions={sceneActions} zoneId={zoneId} sceneId={sceneId}>
          <div className="festival-piano-game">
            {/*<div className="game-header">
            <button className="back-button" onClick={() => isChallengePlaying ? sceneActions.updateState({ currentSong: null }) : handleModeSelect(GAME_MODES.SELECTION)}>← {isChallengePlaying ? 'Songs' : 'Menu'}</button>
          </div>*/}

            {isChallengePlaying && (
              <div className="challenge-header-simple">
                <h2 className="song-title-simple">{sceneState.currentSong.icon} {sceneState.currentSong.name}</h2>
                <div className="simple-controls">
                  <button className="simple-play-button" onClick={playDemo} disabled={sceneState.isDemoPlaying || sceneState.isPlayingRecording || sceneState.isRecording}>▶️ Hear Song</button>
                  <button className={`simple-record-button ${sceneState.isRecording ? 'recording' : ''}`} onClick={() => sceneActions.updateState({ isRecording: !sceneState.isRecording, recordedNotes: [] })} disabled={sceneState.isDemoPlaying || sceneState.isPlayingRecording}>
                    {sceneState.isRecording ? '⏹️ Playing...' : '⏺️ Your Turn!'}
                  </button>
                </div>
                <div className="progress-dots-simple">
                  {sceneState.currentSong.melody.map((_, i) => <span key={i} className={`dot ${i < sceneState.currentStep ? 'done' : ''} ${i === sceneState.currentStep && sceneState.isRecording ? 'now' : ''}`} />)}
                </div>
              </div>
            )}

            {sceneState.currentMode === GAME_MODES.FREE_PLAY && (<div className="ganesha-simple"><div className="ganesha-simple-image" style={{ backgroundImage: `url(${ganeshaGameScene})` }} /></div>)}

            <div className="dancing-animals">
              {Object.keys(ANIMAL_INSTRUMENT_MAP).map(id => {
                const type = ANIMAL_INSTRUMENT_MAP[id], isDancing = sceneState.dancingAnimals?.[type];
                return (<div key={type} className={`animal-character animal-${type} ${isDancing ? 'animal-dancing' : ''}`}>{isDancing && <div className="animal-sparkles">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animal-sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />)}</div>}</div>);
              })}
            </div>

            <div className="piano-base">
              <div className="piano-keys-frame-simple" />
              {INSTRUMENTS.map(instrument => (
                <div key={instrument.id} className={`piano-key key-${instrument.id} ${localUIState.activeKey === instrument.id ? 'active' : ''} ${sceneState.discoveredInstruments[instrument.id] ? 'discovered' : ''} ${nextExpectedKey === instrument.id && sceneState.isRecording ? 'highlighted-next' : ''}`} style={{ left: `${instrument.keyPosition.x}%`, top: `${instrument.keyPosition.y}%` }} onClick={() => handleKeyPress(instrument)}>
                  <div className={`instrument-icon icon-${instrument.id}`} />
                  {localUIState.showSparkle === instrument.id && <div className="key-sparkles">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />)}</div>}
                </div>
              ))}
            </div>

            {localUIState.showCulturalNote && (<div className="cultural-note" style={{ left: `${localUIState.showCulturalNote.position.x}%`, top: `${localUIState.showCulturalNote.position.y - 15}%` }}>{localUIState.showCulturalNote.instrument.culturalNote}</div>)}

            {/*<div className="progress-counter">
            <div className="stars">⭐ {sceneState.stars}</div>
            {sceneState.currentMode === GAME_MODES.FREE_PLAY && (<><div className="taps">🎵 {sceneState.tapCount}</div><div className="instruments">🎼 {Object.keys(sceneState.discoveredInstruments).length}/5</div></>)}
          </div>*/}

            {sceneState.currentMode === GAME_MODES.FREE_PLAY && (
              <div className="free-play-recording-controls">
                <button
                  className={`free-record-btn ${freePlayRecording.isRecording ? 'recording' : ''}`}
                  onClick={toggleFreePlayRecording}
                >
                  {freePlayRecording.isRecording ? '⏹️ Stop' : '⏺️ Record'}
                </button>

                {freePlayRecording.hasRecording && !freePlayRecording.isRecording && (
                  <>
                    <button
                      className="free-play-btn"
                      onClick={sceneState.isPlayingRecording ? stopFreePlayRecording : playFreePlayRecording}
                      disabled={freePlayRecording.isRecording}
                    >
                      {sceneState.isPlayingRecording ? '⏹️ Stop' : '▶️ Hear'}
                    </button>
                    <button className="free-download-btn" onClick={downloadRecording}>
                      ⬇️ Save
                    </button>
                  </>
                )}
              </div>
            )}


            {localUIState.showSparkle === 'wrong' && (<div className="wrong-feedback">❌ Try again!</div>)}

            <SongCompletionOverlay
              show={sceneState.showSongComplete}
              songName={sceneState.completedSongData?.name}
              starsEarned={sceneState.completedSongData?.starsEarned}
              isPlayingMySong={sceneState.isPlayingRecording}

              onPlayAgain={() => {
                // Stop any playing recording first
                if (sceneState.isPlayingRecording) {
                  timeoutsRef.current.forEach(id => clearTimeout(id));
                  timeoutsRef.current = [];
                }

                const songToReplay = sceneState.completedSongData?.song;
                sceneActions.updateState({
                  showSongComplete: false,
                  completedSongData: null,
                  currentSong: songToReplay,
                  currentStep: 0,
                  recordedNotes: [],
                  isRecording: false,
                  isDemoPlaying: false,
                  isPlayingRecording: false
                });
              }}

              onHearMySong={() => {
                // Don't close modal, just play recording
                if (!sceneState.isPlayingRecording) {
                  playRecording();
                }
              }}

              onTryAnother={() => {
                // Stop any playing recording first
                if (sceneState.isPlayingRecording) {
                  timeoutsRef.current.forEach(id => clearTimeout(id));
                  timeoutsRef.current = [];
                }

                sceneActions.updateState({
                  showSongComplete: false,
                  completedSongData: null,
                  currentSong: null,
                  currentStep: 0,
                  recordedNotes: [],
                  isPlayingRecording: false,
                  currentMode: GAME_MODES.SELECTION  // ← Go to mode selection!
                });
              }}
            />

            <HomeButton onNavigate={onNavigate} />

            <GamePauseMenu
              show={sceneState.showPauseMenu}
              gameName={sceneState.currentMode === GAME_MODES.CHALLENGE ? "Festival Challenge" : "Piano Free Play"}
              onResume={() => sceneActions.updateState({ showPauseMenu: false })}
              onRestart={() => {
                sceneActions.updateState({ showPauseMenu: false });
                if (sceneState.currentMode === GAME_MODES.FREE_PLAY) {
                  handleRestart();
                  setFreePlayRecording({ isRecording: false, recordedNotes: [], hasRecording: false });
                } else if (sceneState.currentMode === GAME_MODES.CHALLENGE && sceneState.currentSong) {
                  sceneActions.updateState({ currentStep: 0, recordedNotes: [], isRecording: false, isDemoPlaying: false, isPlayingRecording: false });
                }
              }}
              onBackToModes={() => {
                sceneActions.updateState({ showPauseMenu: false, currentMode: GAME_MODES.SELECTION, currentSong: null });
              }}
              onComplete={() => {
                sceneActions.updateState({ showPauseMenu: false });
                handleManualCompletion();
              }}
            />

            {sceneState.showSceneCompletion && (
              <SceneCompletionCelebration
                show={sceneState.showSceneCompletion}
                zoneId="festival-square"
                sceneId="game1"
                sceneName="Piano Mastery"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                discoveredSymbols={completionIcons}
                symbolImages={{
                  'listen-icon': listenIcon,
                  'play-icon': playIcon,
                  'create-icon': createIcon
                }}
                starsEarned={sceneState.stars || 0}
                totalStars={8}
                onContinue={() => onNavigate?.('scene-complete-continue')}
                onReplay={() => {
                  console.log('PIANO REPLAY: Play Again');
                  sceneActions.updateState({
                    phase: PHASES.DISCOVERY,
                    tapCount: 0,
                    discoveredInstruments: {},
                    celebrationStarted: false,
                    gameStartTime: Date.now(),
                    stars: 0,
                    completed: false,
                    showDoneButton: false,
                    showCompletionBadge: false,
                    showSceneCompletion: false,
                    showingCompletionScreen: false,
                    dancingAnimals: {},
                    showDanceFloor: false,
                    progress: { percentage: 0, starsEarned: 0, completed: false }
                  });
                }}
                onBackToMap={() => onNavigate?.('zone-welcome')}
              />
            )}
          </div>
        </MessageManager>
      </InteractionManager>
    </GameLayout>
  );
};

export default FestivalPianoGame;
