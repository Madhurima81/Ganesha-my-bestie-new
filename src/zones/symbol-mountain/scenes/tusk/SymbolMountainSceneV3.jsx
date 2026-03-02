// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV3.jsx
// 🎵 Complete Musical Mountain Scene - Final Migration V5

import React, { useState, useEffect, useRef } from 'react';
import './SymbolMountainScene.css';
import '../../../shared/components/OpeningModal.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure themes are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// --- NEW MASTER LAYOUT & CONFIG ---
import GameLayout from '../../../../lib/components/layout/GameLayout';
import { symbolHelpConfig } from './helpConfig';
// ----------------------------------

// Unified Components
import UnifiedHeaderV2 from '../../../../lib/components/ui/Header/UnifiedHeaderV2';
import OpeningModal from '../../shared/components/OpeningModal';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Import game components
import EyesTelescopeGame from './EyesTelescopeGame';
import EarsRhythmGame from './EarsRhythmGame';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';

// Images
import mountainBackground from '../tusk/assets/images/rock-background.png';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Character/Coach images
import eyesCoach from '../tusk/assets/images/mooshika-coach.png';
import ganeshaOutline from '../tusk/assets/images/ganesha-outline.png';
import ganeshaComplete from '../tusk/assets/images/ganesha-complete.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

// Symbol Icons
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-colored.png';
import symbolEarColored from '../../shared/images/icons/symbol-ear-colored.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-colored.png';

// Musical instrument images
import musicalTabla from '../tusk/assets/images/musical-tabla-colored.png';
import musicalFlute from '../tusk/assets/images/musical-flute-colored.png';
import musicalBells from '../tusk/assets/images/musical-bells-colored.png';
import musicalCymbals from '../tusk/assets/images/musical-cymbals-colored.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla' },
  flute: { image: musicalFlute, name: 'Flute' },
  bells: { image: musicalBells, name: 'Bells' },
  cymbals: { image: musicalCymbals, name: 'Cymbals' }
};

// Game phases
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
  TUSK_COMPLETE: 'tusk_complete',
  ALL_COMPLETE: 'all_complete'
};

const NOTE_STATES = {
  LOCKED: 'locked',
  APPEARING: 'appearing',
  ACTIVE: 'active',
  USED: 'used'
};

// Musical instrument positions
const instrumentPositions = {
  1: { x: 20, y: 30, type: 'tabla' },
  2: { x: 80, y: 35, type: 'flute' },
  3: { x: 30, y: 65, type: 'bells' },
  4: { x: 70, y: 70, type: 'cymbals' }
};

// Musical note data
const musicalNoteData = [
  { emoji: '🎵', id: 'note1' },
  { emoji: '🎶', id: 'note2' },
  { emoji: '🎼', id: 'note3' }
];

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <button onClick={() => window.location.reload()}>Reload Scene</button>;
    return this.props.children;
  }
}

const SymbolMountainSceneV3 = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'symbol'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.EYES_GAME,
          activeGame: 'eyes',
          completedGames: [],
          currentFocus: 'eyes',

          eyesGameComplete: false,
          showEyesTelescopeGame: false,
          foundInstruments: [],
          discoveredInstruments: {},
          instrumentsFound: 0,

          earsVisible: false,
          earsGameComplete: false,
          showEarsRhythmGame: false,
          musicalNotesVisible: false,
          currentNote: 'note1',
          musicalNoteStates: { note1: 'gray', note2: 'gray', note3: 'gray' },
          earsGamePhase: 'waiting',
          earsPlayerInput: [],
          earsCurrentSequence: [],
          earsSequenceItemsShown: 0,
          earsSequenceJustCompleted: false,
          earsReadyForNextNote: false,
          earsLastCompletedNote: null,

          showTuskAssemblyGame: false,
          tuskGameActive: false,
          tuskPower: 0,
          tuskFullyPowered: false,
          ganeshaComplete: false,
          showGaneshaOutline: false,

          discoveredSymbols: {
            mooshika: true, modak: true, belly: true, lotus: true, trunk: true
          },

          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <SymbolMountainSceneContent
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

const SymbolMountainSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState || !sceneActions) return <div className="loading">Loading...</div>;

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYES_GAME });

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  // Discovery & Resume States
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // Eyes
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // Ears
  const [showDiscoveryFlip3, setShowDiscoveryFlip3] = useState(false); // Tusk
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [isAudioOn, setIsAudioOn] = useState(true);

  const timeoutsRef = useRef([]);
  const resumePopupTimeoutRef = useRef(null);
  const reloadHandledRef = useRef(false);
  const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const [musicalNoteStates, setMusicalNoteStates] = useState({
    note1: NOTE_STATES.LOCKED,
    note2: NOTE_STATES.LOCKED,
    note3: NOTE_STATES.LOCKED
  });

  // Sync Local State
  useEffect(() => {
    if (sceneState.musicalNoteStates) {
      const syncedState = { ...musicalNoteStates };
      Object.keys(sceneState.musicalNoteStates).forEach(key => {
        if (sceneState.musicalNoteStates[key] === 'golden') {
          syncedState[key] = NOTE_STATES.ACTIVE;
        } else if (sceneState.musicalNoteStates[key] === 'used') {
          syncedState[key] = NOTE_STATES.USED;
        }
      });
      setMusicalNoteStates(syncedState);
    }
  }, [sceneState.musicalNoteStates]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      reloadHandledRef.current = false;
    };
  }, []);

  // Auto-glow effect
  useEffect(() => {
    const glowPhases = [PHASES.EYES_GAME, PHASES.EARS_GAME, PHASES.TUSK_GAME];
    const isActiveGameplay = glowPhases.includes(sceneState?.phase) && sceneState?.welcomeShown &&
      !sceneState?.showEyesTelescopeGame && !sceneState?.showEarsRhythmGame;

    if (isActiveGameplay) {
      const timer = setTimeout(() => setShowHintGlow(true), 20000);
      return () => clearTimeout(timer);
    } else {
      setShowHintGlow(false);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // Reload Handling
  useEffect(() => {
    if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) return;

    console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
    reloadHandledRef.current = true;

    if (sceneState.phase === PHASES.EYES_COMPLETE) {
      setTimeout(() => setShowDiscoveryFlip1(true), 500);
      return;
    }
    if (sceneState.phase === PHASES.EARS_COMPLETE) {
      setTimeout(() => setShowDiscoveryFlip2(true), 500);
      return;
    }
    if (sceneState.phase === PHASES.TUSK_COMPLETE) {
      setTimeout(() => setShowDiscoveryFlip3(true), 500);
      return;
    }

    let message = "";
    if (sceneState.phase === PHASES.EYES_GAME) {
      message = "Tap the Eyes to find hidden instruments!";
    } else if (sceneState.phase === PHASES.EARS_GAME) {
      message = "Tap the Ears to master the rhythm!";
    } else if (sceneState.phase === PHASES.TUSK_GAME) {
      message = "Find Golden Notes to feed the Tusk!";
    } else if (sceneState.phase === PHASES.ALL_COMPLETE) {
      setShowSceneCompletion(true);
      return;
    }

    if (message) {
      setResumeMessage(message);
      setShowResumePopup(true);
      resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
    }

  }, [isReload, sceneState.phase, sceneState.welcomeShown]);

  // ==================== INTERACTION HANDLERS ====================

  const handleSmartDismiss = () => {
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    }
  };

  const handleEyesClick = () => {
    handleSmartDismiss();
    if (sceneState.eyesGameComplete) return;
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });

    sceneActions.updateState({
      showEyesTelescopeGame: true,
      eyesGameActive: true,
      activeGame: 'eyes'
    });
  };

  const handleEarsClick = () => {
    handleSmartDismiss();
    if (!sceneState.earsVisible || sceneState.earsGameComplete) return;

    sceneActions.updateState({
      showEarsRhythmGame: true,
      earsGameActive: true,
      musicalNotesVisible: true,
      activeGame: 'ears',
      currentNote: 'note1'
    });
  };

  const unlockNote = (noteId) => {
    setMusicalNoteStates(prev => ({
      ...prev,
      [noteId]: NOTE_STATES.APPEARING
    }));
    setTimeout(() => {
      setMusicalNoteStates(prev => ({
        ...prev,
        [noteId]: NOTE_STATES.ACTIVE
      }));
    }, 1500);
  };

  const handleNoteClick = (noteId) => {
    setMusicalNoteStates(prev => ({
      ...prev,
      [noteId]: NOTE_STATES.USED
    }));

    const newTuskPower = sceneState.tuskPower + 1;
    sceneActions.updateState({
      tuskPower: newTuskPower,
      tuskFullyPowered: newTuskPower === 3
    });

    setShowSparkle('tusk-feeding');
    setTimeout(() => setShowSparkle(null), 1500);

    if (newTuskPower >= 3) {
      safeSetTimeout(() => {
        sceneActions.updateState({ ganeshaComplete: true, ganeshaAssembling: false });
        setShowSparkle('ganesha-complete');
        safeSetTimeout(() => handleTuskGameComplete(), 1000);
      }, 1000);
    }
  };

  const handleEyesGameComplete = () => {
    sceneActions.updateState({
      eyesGameComplete: true,
      showEyesTelescopeGame: false,
      phase: PHASES.EYES_COMPLETE
    });
    setShowSparkle('eyes-complete');
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowDiscoveryFlip1(true);
    }, 800);
  };

  const handleEarsGameComplete = () => {
    const completedNote = sceneState.currentNote;
    const isLastRound = completedNote === 'note3';

    sceneActions.updateState({
      showEarsRhythmGame: false,
      earsGamePhase: 'waiting',
      earsPlayerInput: [],
      earsCurrentSequence: [],
      earsSequenceItemsShown: 0
    });

    if (isLastRound) setShowSparkle('ears-complete-final');
    else setShowSparkle('ears-round-complete');

    unlockNote(completedNote);

    const allNotesUnlocked = ['note1', 'note2', 'note3'].every(
      note => note <= completedNote || musicalNoteStates[note] === NOTE_STATES.ACTIVE
    );

    if (allNotesUnlocked) {
      setTimeout(() => {
        setShowSparkle(null);
        setShowDiscoveryFlip2(true);
        sceneActions.updateState({
          earsGameComplete: true,
          musicalNotesVisible: true,
          showTuskAssemblyGame: true,
          tuskVisible: true,
          phase: PHASES.EARS_COMPLETE
        });
      }, 3000);
    } else {
      setTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({
          showEarsRhythmGame: true,
          currentNote: completedNote === 'note1' ? 'note2' : 'note3'
        });
      }, 2000);
    }
  };

  const handleTuskGameComplete = () => {
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: true,
      phase: PHASES.TUSK_COMPLETE
    });
    setShowSparkle('tusk-complete');
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowDiscoveryFlip3(true);
    }, 1000);
  };

  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.ALL_COMPLETE, PHASES.EYES_COMPLETE, PHASES.EARS_COMPLETE, PHASES.TUSK_COMPLETE];
    if (sceneState?.showEyesTelescopeGame || sceneState?.showEarsRhythmGame || showDiscoveryFlip1 || showDiscoveryFlip2 || showDiscoveryFlip3) return false;
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'eyes-hint',
      message: 'Click the divine eyes!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (state) => state.phase === PHASES.EYES_GAME && !state.showEyesTelescopeGame && !state.eyesGameComplete
    },
    {
      id: 'ears-hint',
      message: 'Click the sacred ears!',
      position: { bottom: '60%', right: '70%', transform: 'translateX(50%)' },
      condition: (state) => state.earsVisible && !state.showEarsRhythmGame && !state.earsGameComplete
    },
    {
      id: 'tusk-hint',
      message: 'Click notes to tusk!',
      position: { bottom: '40%', left: '50%', transform: 'translateX(-50%)' },
      condition: (state) => state.showTuskAssemblyGame && Object.values(state.musicalNoteStates || {}).includes('golden') && !state.ganeshaComplete
    }
  ];

  // 1. WRAP IN GAMELAYOUT
  return (
    <GameLayout
      zoneId="symbol-mountain"
      helpConfig={symbolHelpConfig}
      sceneState={sceneState}
      onHome={() => onNavigate?.('home')}
      onReplay={resetScene}
      isAudioOn={isAudioOn}
      onAudioToggle={() => setIsAudioOn(!isAudioOn)}
    >
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="symbol-mountain-scene-v2-container">
            <div className="mountain-background" style={{ backgroundImage: `url(${mountainBackground})` }}>

              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                onStart={() => sceneActions.updateState({ welcomeShown: true })}
                characterImg={ganeshaCharacter}
                showButton={true}
              />

              {/* UNIFIED HEADERS FOR PHASES */}
              {!showDiscoveryFlip1 && !showDiscoveryFlip2 && !showDiscoveryFlip3 && sceneState?.welcomeShown && (
                <>
                  {/* Phase 1: Eyes */}
                  {sceneState.phase === PHASES.EYES_GAME && !sceneState.eyesGameComplete && !sceneState.showEyesTelescopeGame && (
                    <UnifiedHeaderV2
                      zone="symbol-mountain"
                      title="DISCOVER DIVINE VISION! Click the sacred eyes!"
                      currentRound={0}
                      totalRounds={1}
                    />
                  )}
                  {/* Phase 2: Ears */}
                  {sceneState.earsVisible && !sceneState.earsGameComplete && !sceneState.showEarsRhythmGame && (
                    <UnifiedHeaderV2
                      zone="symbol-mountain"
                      title="MASTER SACRED RHYTHMS! Click the divine ears!"
                      currentRound={0}
                      totalRounds={1}
                    />
                  )}
                  {/* Phase 3: Tusk */}
                  {sceneState.showTuskAssemblyGame && !sceneState.ganeshaComplete && (
                    <UnifiedHeaderV2
                      zone="symbol-mountain"
                      title="ASSEMBLE GANESHA! Click golden notes!"
                      currentRound={2}
                      totalRounds={3}
                    />
                  )}
                </>
              )}

              {/* EYES SYMBOL */}
              {sceneState.welcomeShown && !sceneState.discoveredSymbols?.eyes && (
                <div
                  className={`eyes-symbol-container ${sceneState.eyesGameComplete ? 'completed' : 'active'} ${showHintGlow && sceneState.phase === PHASES.EYES_GAME ? 'hint-glow' : ''}`}
                  onClick={handleEyesClick}
                >
                  <ClickableElement id="eyes-symbol" onClick={handleEyesClick} completed={sceneState.eyesGameComplete} zone="eyes-zone">
                    <img src={ganeshaEyes} alt="Divine Eyes" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                </div>
              )}

              {/* EYES GAME */}
              {sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes && (
                <EyesTelescopeGame
                  isActive={sceneState.showEyesTelescopeGame}
                  instrumentPositions={instrumentPositions}
                  discoveryRadius={15}
                  profileName={profileName}
                  initialDiscoveredInstruments={sceneState.discoveredInstruments || {}}
                  initialFoundInstruments={sceneState.foundInstruments || []}
                  isReload={isAudioOn && sceneState.showEyesTelescopeGame}
                  onInstrumentFound={(instrumentType, allFound, discovered) => {
                    sceneActions.updateState({ foundInstruments: allFound, discoveredInstruments: discovered, instrumentsFound: allFound.length });
                  }}
                  onAllInstrumentsFound={(allFound, discovered) => {
                    sceneActions.updateState({
                      foundInstruments: allFound,
                      discoveredInstruments: discovered,
                      instrumentsFound: 4,
                      eyesGameComplete: true,
                      showEyesTelescopeGame: false,
                      phase: PHASES.EYES_COMPLETE
                    });
                    setTimeout(() => handleEyesGameComplete(), 1000);
                  }}
                  onClose={() => sceneActions.updateState({ showEyesTelescopeGame: false })}
                />
              )}

              {/* EARS SYMBOL */}
              {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && (
                <div
                  className={`ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized ${showHintGlow && sceneState.earsVisible && !sceneState.earsGameComplete ? 'hint-glow' : ''}`}
                  onClick={handleEarsClick}
                >
                  <ClickableElement id="ears-symbol" onClick={handleEarsClick} completed={sceneState.earsGameComplete} zone="ears-zone">
                    <img src={ganeshaEars} alt="Sacred Ears" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                  {showSparkle === 'ears-materialize' && <SparkleAnimation type="glitter" count={30} color="gold" size={15} duration={2000} fadeOut={true} area="full" />}
                </div>
              )}

              {/* EARS GAME */}
              {sceneState.showEarsRhythmGame && (
                <EarsRhythmGame
                  isActive={sceneState.showEarsRhythmGame}
                  currentNote={sceneState.currentNote || 'note1'}
                  discoveredInstruments={sceneState.discoveredInstruments}
                  profileName={profileName}
                  isReload={isReload && sceneState.showEarsRhythmGame}
                  initialGamePhase={sceneState.earsGamePhase || 'waiting'}
                  initialPlayerInput={sceneState.earsPlayerInput || []}
                  initialCurrentSequence={sceneState.earsCurrentSequence || []}
                  initialSequenceItemsShown={sceneState.earsSequenceItemsShown || 0}
                  sequenceJustCompleted={sceneState.earsSequenceJustCompleted || false}
                  readyForNextNote={sceneState.earsReadyForNextNote || false}
                  lastCompletedNote={sceneState.earsLastCompletedNote || null}
                  onSequenceComplete={(noteId) => {
                    const newNoteStates = { ...sceneState.musicalNoteStates, [noteId]: 'golden' };
                    sceneActions.updateState({
                      musicalNoteStates: newNoteStates,
                      earsGamePhase: 'waiting',
                      earsPlayerInput: [],
                      earsCurrentSequence: [],
                      earsSequenceItemsShown: 0,
                      earsSequenceJustCompleted: false,
                      earsReadyForNextNote: false,
                      earsLastCompletedNote: null
                    });
                    unlockNote(noteId);

                    setShowSparkle(`note-${noteId}-golden`);
                    setTimeout(() => setShowSparkle(null), 2000);

                    const goldenNotes = Object.values(newNoteStates).filter(state => state === 'golden');
                    if (goldenNotes.length === 3) handleEarsGameComplete();
                    else {
                      const nextNote = noteId === 'note1' ? 'note2' : 'note3';
                      setTimeout(() => sceneActions.updateState({ currentNote: nextNote }), 500);
                    }
                  }}
                  onGameComplete={() => handleEarsGameComplete()}
                  onClose={() => sceneActions.updateState({ showEarsRhythmGame: false })}
                />
              )}

              {/* MUSICAL NOTES */}
              {sceneState.musicalNotesVisible && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 40 }}>
                  {musicalNoteData.map((note) => {
                    const state = musicalNoteStates[note.id];
                    return (
                      <div
                        key={note.id}
                        style={{
                          position: 'relative', width: '60px', height: '60px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.5s ease',
                          cursor: state === NOTE_STATES.ACTIVE ? 'pointer' : 'default',
                          background: state === NOTE_STATES.LOCKED ? 'rgba(200, 200, 200, 0.5)' :
                            state === NOTE_STATES.APPEARING ? 'rgba(255, 215, 0, 0.3)' :
                              state === NOTE_STATES.ACTIVE ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                'rgba(150, 150, 150, 0.3)',
                          border: state === NOTE_STATES.ACTIVE ? '3px solid #FF8C00' : '2px solid #999',
                          boxShadow: state === NOTE_STATES.ACTIVE ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none',
                          animation: state === NOTE_STATES.APPEARING ? 'noteAppear 1.5s ease-out' :
                            state === NOTE_STATES.ACTIVE ? 'gentlePulse 2s ease-in-out infinite' : 'none'
                        }}
                        onClick={() => {
                          if (state === NOTE_STATES.ACTIVE && sceneState.showTuskAssemblyGame) {
                            handleNoteClick(note.id);
                          }
                        }}
                      >
                        {state === NOTE_STATES.LOCKED && <span style={{ fontSize: '30px', color: '#666' }}>?</span>}
                        {state === NOTE_STATES.APPEARING && (
                          <>
                            <span style={{ fontSize: '35px' }}>✨</span>
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)', animation: 'sparkleBurst 1.5s ease-out' }} />
                          </>
                        )}
                        {state === NOTE_STATES.ACTIVE && <span style={{ fontSize: '35px' }}>{note.emoji}</span>}
                        {state === NOTE_STATES.USED && <span style={{ fontSize: '30px', color: '#4CAF50' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TUSK ASSEMBLY AREA */}
              {sceneState.showTuskAssemblyGame && (
                <div className="sacred-tusk-assembly-area" style={{
                  position: 'absolute', top: '45%', left: '50%', width: '200px', height: '220px', transform: 'translate(-50%, -50%)', zIndex: 15, pointerEvents: 'none'
                }}>
                  {(sceneState.showGaneshaOutline || sceneState.ganeshaComplete) && (
                    <div style={{ position: 'absolute', bottom: '20px', right: '60%', width: '260px', height: '290px', transform: 'translateX(-50%)', opacity: 0.8, pointerEvents: 'none' }}>
                      <img src={sceneState.ganeshaComplete ? ganeshaComplete : ganeshaOutline} alt="Ganesha" style={{ width: sceneState.ganeshaComplete ? '80%' : '100%', height: sceneState.ganeshaComplete ? '80%' : '100%', transition: 'all 0.8s ease' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '10px', left: '30%', width: '120px', height: '120px', transform: 'translateX(-30%)', zIndex: 30 }}>
                    <img
                      src={ganeshaTusk} alt="Tusk"
                      style={{
                        width: '60px', height: '60px',
                        filter: sceneState.tuskPower > 0 ? `brightness(${1.2 + (sceneState.tuskPower * 0.2)}) drop-shadow(0 0 ${8 + (sceneState.tuskPower * 4)}px #ffd700)` : 'brightness(1.1)',
                        transition: 'all 0.8s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* PROGRESSIVE HINTS */}
              {sceneState.welcomeShown && (
                <ProgressiveHintSystem
                  ref={progressiveHintRef}
                  sceneId={sceneId}
                  sceneState={sceneState}
                  hintConfigs={getHintConfigs()}
                  characterImage={eyesCoach}
                  initialDelay={12000}
                  hintDisplayTime={10000}
                  position="bottom-right"
                  iconSize={60}
                  zIndex={2000}
                  enabled={shouldEnableHints()}
                  disabledMessage="Great job!"
                />
              )}

              {/* REMOVED MANUAL NAV & BACK BUTTON (Handled by GameLayout) */}

              <CulturalCelebrationModal show={showCulturalCelebration} onClose={() => setShowCulturalCelebration(false)} {...CulturalProgressExtractor.getCulturalProgressData()} />
            </div>

            {/* SIDEBAR */}
            {sceneState.welcomeShown && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true, modak: true, belly: true, lotus: true, trunk: true,
                  ...(sceneState.discoveredSymbols || {}),
                  // Keep sidebar alias in sync with game-logic alias.
                  ear: sceneState?.discoveredSymbols?.ear || sceneState?.discoveredSymbols?.ears || false
                }}
                onSymbolClick={(id) => console.log(`Symbol clicked: ${id}`)}
              />
            )}

            {/* RESUME POPUP */}
            {showResumePopup && (
              <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                zIndex: 9999, fontFamily: 'Baloo 2, cursive', fontSize: '28px', fontWeight: 'bold',
                color: '#5D2E0F', textAlign: 'center', maxWidth: '80%', border: '4px solid #FF8C00'
              }}>
                {resumeMessage}
              </div>
            )}

            {/* DISCOVERY OVERLAYS */}
            {showDiscoveryFlip1 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found Ganesha's Eye Magic!"
                celebrationText="His eyes want to share a special skill with you!"
                celebrationImage={ganeshaEyes}
                powerTitle="Laser Focus Unlocked!"
                powerText="Small eyes can spot tiny details! With Laser Focus, you can notice little things that others might miss."
                powerIcon={symbolEyesColored}
                buttonText="Focus On!"
                onComplete={() => {
                  setShowDiscoveryFlip1(false);
                  setTimeout(() => setShowSparkle('ears-materialize'), 500);
                  sceneActions.updateState({
                    discoveredSymbols: { ...sceneState.discoveredSymbols, eyes: true },
                    earsVisible: true,
                    phase: PHASES.EARS_GAME,
                    activeGame: 'ears',
                    currentFocus: 'ears'
                  });
                  setTimeout(() => setShowSparkle(null), 2000);
                }}
                celebrationDuration={2500}
                showSparkles={true}
              />
            )}

            {showDiscoveryFlip2 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found Ganesha's Ear Magic!"
                celebrationText="His big ears have something to teach you!"
                celebrationImage={ganeshaEars}
                powerTitle="Big Ears Unlocked!"
                powerText="Big ears help you listen carefully! With Listening Power, you can catch every sound and every important clue."
                powerIcon={symbolEarColored}
                buttonText="Listen Up!"
                onComplete={() => {
                  setShowDiscoveryFlip2(false);
                  setTimeout(() => setShowSparkle('tusk-activate'), 500);
                  sceneActions.updateState({
                    discoveredSymbols: { ...sceneState.discoveredSymbols, ears: true, ear: true },
                    showTuskAssemblyGame: true,
                    tuskGameActive: true,
                    showGaneshaOutline: true,
                    phase: PHASES.TUSK_GAME,
                    activeGame: 'tusk',
                    currentFocus: 'tusk',
                    musicalNoteStates: { note1: 'golden', note2: 'golden', note3: 'golden' }
                  });
                  setTimeout(() => setShowSparkle(null), 2000);
                }}
                celebrationDuration={2500}
                showSparkles={true}
              />
            )}

            {showDiscoveryFlip3 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found Ganesha's Tusk Magic!"
                celebrationText="This tusk holds a powerful secret!"
                celebrationImage={ganeshaTusk}
                powerTitle="Determination Unlocked!"
                powerText="Ganesha finished writing even with one tusk! With Determination Power, you can finish what you start—even when it gets tough."
                powerIcon={symbolTuskColored}
                buttonText="Get It Done!"
                onComplete={() => {
                  setShowDiscoveryFlip3(false);
                  sceneActions.updateState({
                    discoveredSymbols: { ...sceneState.discoveredSymbols, tusk: true },
                    phase: PHASES.ALL_COMPLETE,
                    completed: true,
                    stars: 9,
                    progress: { percentage: 100, starsEarned: 9, completed: true }
                  });
                  setShowSparkle('final-fireworks');
                }}
                celebrationDuration={2500}
                showSparkles={true}
              />
            )}

            {/* FIREWORKS & COMPLETION */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={15}
                colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
                onComplete={() => {
                  setShowSparkle(null);
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('symbol-mountain', 'symbol', {
                      completed: true, stars: 9, symbols: { eyes: true, ears: true, tusk: true },
                      phase: 'complete', unlocked: true, timestamp: Date.now()
                    });
                    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_symbol`);
                    SimpleSceneManager.clearCurrentScene();
                  }
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {showSceneCompletion && (
              <SceneCompletionCelebration
                show={true}
                sceneName="Musical Mountain Adventure"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={3}
                totalScenes={4}
                starsEarned={9}
                totalStars={9}
                discoveredSymbols={['eyes', 'ears', 'tusk']}
                symbolImages={{
                  eyes: symbolEyesColored,
                  ears: symbolEarColored,
                  tusk: symbolTuskColored
                }}
                symbolData={{
                  eyes: {
                    title: "Eyes — Ganesha's Wise Vision!",
                    description: "Ganesha's eyes see everything clearly — the big picture and the tiny details. They remind us to look carefully before we act!"
                  },
                  ears: {
                    title: "Ears — Ganesha's Super Listeners!",
                    description: "Ganesha's big ears hear every word. They remind us to listen with our whole heart and learn from everything around us."
                  },
                  tusk: {
                    title: "Tusk — Ganesha's Writing Tool!",
                    description: "Ganesha broke his own tusk to write a great story! It shows us that we can turn any challenge into something amazing."
                  }
                }}
                nextSceneName="Final Assembly"
                sceneId="symbol"
                completionData={{ stars: 9, symbols: { eyes: true, ears: true, tusk: true }, completed: true, totalStars: 9 }}
                onComplete={onComplete}
                onReplay={() => { setShowSceneCompletion(false); resetScene(); }}
                onContinue={() => {
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'symbol', {
                      completed: true, stars: 9, symbols: { eyes: true, ears: true, tusk: true }
                    });
                  }
                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('symbol-mountain', 'final-scene', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}
          </div>
        </MessageManager>
      </InteractionManager>
    </GameLayout>
  );
};

export default SymbolMountainSceneV3;
