// zones/cave-of-secrets/scenes/vakratunda-mahakaya/CaveSceneFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CaveSceneFixed.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Navigation & Reset
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Components
import RescueModal from '../../components/RescueModal';
import { RESCUE_CONFIGS } from '../../config/RescueConfigs';
import SymbolSidebar from '../../components/SymbolSidebar';
import ClickDotsPathGame from './ClickDotsPathGame';
import DoorComponent from '../../components/DoorComponent';

// Images - Assets
import mooshikaTracing from './assets/images/mooshika-tracing.png';
import doorImage from './assets/images/door-image.png';
import ganeshaComplete from './assets/images/ganesha-complete.png';
import caveBackground from './assets/images/cave-background.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png';

// Journal & Apps
import meaningJournal from '../../assets/images/meaning-journal.png';
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';

// Symbols
import vakratundaSymbol from '../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../assets/images/symbols/mahakaya-symbol.png';

// Preload
const preloadedMooshikaImage = new Image();
preloadedMooshikaImage.src = mooshikaTracing;

const CAVE_PHASES = {
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  TRACE_INTRO: 'trace_intro',
  TRACE_ACTIVE: 'trace_active',
  TRACE_COMPLETE: 'trace_complete',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GROW_INTRO: 'grow_intro',
  GROW_ACTIVE: 'grow_active',
  GROW_COMPLETE: 'grow_complete',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { 
    name: 'Curved Trunk Power', 
    image: vakratundaSymbol,
    color: '#FFD700' 
  },
  mahakaya: { 
    name: 'Mighty Form Power', 
    image: mahakayaSymbol,
    color: '#FF8C42' 
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="error-boundary"><button onClick={() => window.location.reload()}>Reload</button></div>;
    return this.props.children;
  }
}

const CaveSceneFixed = ({ onComplete, onNavigate, zoneId = 'cave-of-secrets', sceneId = 'vakratunda-mahakaya' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          door1State: 'waiting', door1SyllablesPlaced: [], door1Completed: false, door1CurrentStep: 0, door1Syllables: ['Va', 'kra', 'tun', 'da'],
          door2State: 'waiting', door2SyllablesPlaced: [], door2Completed: false, door2CurrentStep: 0, door2Syllables: ['Ma', 'ha', 'ka', 'ya'],
          tracingStarted: false, tracedPoints: [], traceProgress: 0, traceQuality: 'good', tracingCompleted: false, trunkPosition: { x: 50, y: 100 },
          currentPathSegment: 0, segmentsCompleted: [], mustFollowSequence: true,
          ganeshaVisible: false, ganeshaAnimation: 'breathing', ganeshaSize: 0.8, ganeshaGlow: 0.2,
          growingStarted: false, stonesClicked: 0, floatingStones: [{ id: 1, clicked: false, x: 20, y: 30 }, { id: 2, clicked: false, x: 70, y: 20 }, { id: 3, clicked: false, x: 30, y: 60 }, { id: 4, clicked: false, x: 80, y: 50 }], growingCompleted: false,
          learnedWords: { vakratunda: { learned: false, scene: 1 }, mahakaya: { learned: false, scene: 1 } },
          phase: CAVE_PHASES.DOOR1_ACTIVE, currentFocus: 'door1',
          discoveredSymbols: {}, currentPopup: null, symbolDiscoveryState: null, sidebarHighlightState: null,
          welcomeShown: false,
          stars: 0, completed: false, progress: { percentage: 0, starsEarned: 0, completed: false },
          showingCompletionScreen: false, fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <CaveSceneContent
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

const CaveSceneContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId }) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  const hideCoach = () => {};
  const clearManualCloseTracking = () => {};
  
  const { resetScene } = useSceneReset(
    sceneActions, 
    'cave-of-secrets', 
    'vakratunda-mahakaya', 
    getSceneResetConfig('vakratunda-mahakaya') || {}
  );

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [isManualReset, setIsManualReset] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState(null);
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);

  // Mission Intro Modal State
  const [showMissionIntroModal, setShowMissionIntroModal] = useState(false);
  const [missionIntroData, setMissionIntroData] = useState(null);

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const lastClickTime = useRef(0);
  const activeTouches = useRef(0);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => { return () => clearAllTimeouts(); }, []);

  const playAudio = (audioPath) => {
    try { new Audio(audioPath).play().catch(() => {}); } catch (e) {}
  };

  const playSyllable = (syllable) => {
    const map = { 'va': 'vakratunda-va', 'kra': 'vakratunda-kra', 'tun': 'vakratunda-tun', 'da': 'vakratunda-da', 'ma': 'mahakaya-ma', 'ha': 'mahakaya-ha', 'ka': 'mahakaya-ka', 'ya': 'mahakaya-ya' };
    playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
  };

  const stoneImages = [stoneHead, stoneTrunk, stoneBody, stoneLegs];

  const getGaneshaAnimationClass = () => {
    if (!sceneState.ganeshaVisible) return '';
    if (sceneState.ganeshaAnimation === 'happy') return 'happy';
    if (sceneState.ganeshaAnimation === 'growing') return 'growing';
    if (sceneState.ganeshaAnimation === 'mighty') return 'mighty breathing';
    return 'breathing';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      vakratunda: "You chanted 'Vakratunda'!\nIt means 'Curved Trunk' - the power to handle any challenge!",
      mahakaya: "You chanted 'Mahakaya'!\nIt means 'Great Body' - the power of infinite strength!"
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  const getNextDiscoveryText = (currentSymbol) => {
    return currentSymbol === 'vakratunda' ? '🗣️ Learn Mahakaya' : '✨ Complete Scene';
  };

  // DOOR 1 HANDLER
  const handleDoor1SyllablePlaced = (syllable) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    if (sceneState.phase !== CAVE_PHASES.DOOR1_ACTIVE) return;
    lastClickTime.current = now;
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Va';
    
    if (syllable === expectedSyllable) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({ door1SyllablesPlaced: newSyllablesPlaced, door1CurrentStep: newStep });

      if (newStep >= 4) {
        setTimeout(() => {
          setMissionIntroData({
            type: 'trace',
            title: "Door Unlocked!",
            image: vakratundaSymbol,
            description: "You chanted VAKRATUNDA! Now trace the curved trunk to find Ganesha.",
            buttonText: "Start Tracing"
          });
          setShowMissionIntroModal(true);
        }, 1000);
      }
    }
  };

  // DOOR 1 COMPLETE
  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed - starting game!');
    setShowMissionIntroModal(false);
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.TRACE_ACTIVE,
      tracingStarted: true,
      currentPathSegment: 0,
      ganeshaVisible: true,
      ganeshaAnimation: 'breathing'
    });
    
    setShowSparkle('door1-completing');
    setTimeout(() => setShowSparkle(null), 3000);
  };

  // DOOR 2 HANDLER
  const handleDoor2SyllablePlaced = (syllable) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    if (sceneState.phase !== CAVE_PHASES.DOOR2_ACTIVE) return;
    lastClickTime.current = now;
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ma';
    
    if (syllable === expectedSyllable) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({ door2SyllablesPlaced: newSyllablesPlaced, door2CurrentStep: newStep });

      if (newStep >= 4) {
        setTimeout(() => {
          setMissionIntroData({
            type: 'grow',
            title: "Chamber Unlocked!",
            image: mahakayaSymbol,
            description: "You chanted MAHAKAYA! Now tap the floating stones to help Ganesha grow mighty.",
            buttonText: "Start Growing"
          });
          setShowMissionIntroModal(true);
        }, 1000);
      }
    }
  };

  // DOOR 2 COMPLETE
  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed!');
    setShowMissionIntroModal(false);
    setShowSparkle('door2-completing');
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.GROW_ACTIVE,
      growingStarted: true
    });

    setTimeout(() => setShowSparkle(null), 3000);
  };

  const completeTracing = () => {
    sceneActions.updateState({ tracingCompleted: true, phase: CAVE_PHASES.TRACE_COMPLETE });
    safeSetTimeout(() => completeSymbolLearning('vakratunda'), 500);
  };

  const handleStoneClick = (stoneId) => {
    const stone = sceneState.floatingStones.find(s => s.id === stoneId);
    if (!stone || stone.clicked) return;
    
    const updatedStones = sceneState.floatingStones.map(s => s.id === stoneId ? { ...s, clicked: true } : s);
    const newStonesClicked = sceneState.stonesClicked + 1;
    const scalingSizes = [1.1, 1.5, 2.0, 3.2];
    const glowSizes = [0.3, 0.6, 1.0, 1.5];
    
    sceneActions.updateState({
      floatingStones: updatedStones,
      stonesClicked: newStonesClicked,
      ganeshaSize: scalingSizes[newStonesClicked - 1] || 0.8,
      ganeshaGlow: glowSizes[newStonesClicked - 1] || 0.2,
      ganeshaAnimation: 'growing',
    });
    
    setShowSparkle(`stone-${stoneId}-clicked`);
    setTimeout(() => setShowSparkle(null), 800);
    
    if (newStonesClicked >= 4) setTimeout(() => completeGrowing(), 1500);
  };

  const completeGrowing = () => {
    sceneActions.updateState({ growingCompleted: true, phase: CAVE_PHASES.GROW_COMPLETE });
    safeSetTimeout(() => completeSymbolLearning('mahakaya'), 500);
  };

  const completeSymbolLearning = (symbolKey) => {
    setShowCenteredSymbol(symbolKey);
    setTimeout(() => {
      setShowCenteredSymbol(null);
      setShowSparkle(`${symbolKey}-to-sidebar`);
      sceneActions.updateState({ learnedWords: { ...sceneState.learnedWords, [symbolKey]: { learned: true, scene: 1 } } });
      setTimeout(() => {
        setShowSparkle(null);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 2000);
    }, 5000);
  };

  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setCurrentRescueWord(currentMissionSymbol);
    setShowRescueModal(true);
  };

  const handleContinueLearning = () => {
    setShowPowerModal(false);
    if (currentMissionSymbol === 'vakratunda') sceneActions.updateState({ phase: CAVE_PHASES.DOOR2_ACTIVE });
    else if (currentMissionSymbol === 'mahakaya') setTimeout(() => showFinalCelebration(), 500);
  };

  const handleRescueComplete = (success) => {
    if (!success) return;
    setShowRescueModal(false);
    if (currentRescueWord === 'vakratunda') setTimeout(() => sceneActions.updateState({ phase: CAVE_PHASES.DOOR2_ACTIVE }), 500);
    else if (currentRescueWord === 'mahakaya') setTimeout(() => showFinalCelebration(), 500);
    setCurrentRescueWord(null);
  };

  const showFinalCelebration = () => {
    setShowSparkle('final-fireworks');
    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_fireworks',
      phase: CAVE_PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: { percentage: 100, starsEarned: 8, completed: true }
    });
  };

  const getHintConfigs = () => [
    { id: 'door1', message: 'Drag syllables to match the word!', condition: (s) => s.phase === CAVE_PHASES.DOOR1_ACTIVE && !s.door1Completed && !showMissionIntroModal },
    { id: 'trace', message: 'Trace the path!', condition: (s) => s.phase === CAVE_PHASES.TRACE_ACTIVE && !s.tracingCompleted },
    { id: 'door2', message: 'Drag syllables for Mahakaya!', condition: (s) => s.phase === CAVE_PHASES.DOOR2_ACTIVE && !s.door2Completed && !showMissionIntroModal },
    { id: 'grow', message: 'Tap the stones!', condition: (s) => s.phase === CAVE_PHASES.GROW_ACTIVE && s.stonesClicked < 4 }
  ];

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="pond-scene-container" data-phase={sceneState.phase}>
          <div className="pond-background" style={{ backgroundImage: `url(${caveBackground})` }}>

            {/* OPENING INSTRUCTION SCREEN */}
            {sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.welcomeShown && (
              <div className="cave-instructions-overlay">
                <div className="cave-sparkles">
                  <div className="cave-sparkle"></div><div className="cave-sparkle"></div>
                  <div className="cave-sparkle"></div><div className="cave-sparkle"></div>
                </div>
                <div className="cave-instructions-content">
                  <div className="cave-instructions-ganesha"><img src={ganeshaCharacterCave} alt="Ganesha" style={{maxWidth:'450px'}} /></div>
                  <div className="cave-instructions-card">
                    <h1 className="cave-instructions-title">Unlock the Cave of Secrets!</h1>
                    <p className="cave-instructions-subtitle">2 sacred Sanskrit chants are hidden here!</p>
                    <div className="cave-instructions-icons">
                      <div className="cave-instruction-icon-item"><img src={vakratundaSymbol} alt="Vakratunda" /><span className="cave-instruction-icon-label">Curved Trunk</span></div>
                      <div className="cave-instruction-icon-item"><img src={mahakayaSymbol} alt="Mahakaya" /><span className="cave-instruction-icon-label">Great Body</span></div>
                    </div>
                    <button className="cave-instructions-button" onClick={() => sceneActions.updateState({ welcomeShown: true })}>Enter the Cave</button>
                  </div>
                </div>
              </div>
            )}

            {/* MISSION INTRO MODAL */}
            {showMissionIntroModal && (
              <div className="cave-power-overlay">
                <div className="cave-power-card">
                  <h1 className="cave-power-title">{missionIntroData.title}</h1>
                  <img src={missionIntroData.image} alt="icon" className="cave-power-icon" style={{width: '120px', height: '120px'}} />
                  <p className="cave-power-description">{missionIntroData.description}</p>
                  <button 
                    className="cave-power-primary-button"
                    onClick={() => {
                      if (missionIntroData.type === 'trace') handleDoor1Complete();
                      else if (missionIntroData.type === 'grow') handleDoor2Complete();
                    }}
                  >
                    {missionIntroData.buttonText}
                  </button>
                </div>
              </div>
            )}

            {/* DOOR 1 */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent 
                  key="door1-component"  // ✅ FIXED: Static key prevents remount
                  syllables={['Va', 'kra', 'tun', 'da']}
                  completedWord="Vakratunda"
                  onDoorComplete={() => {}} 
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  onSyllableAudio={playSyllable}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="vakratunda-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="VAKRATUNDA "
                  primaryColor="#FFD700" secondaryColor="#FF8C42" errorColor="#FF4444"
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                  isResuming={isReload}
                  modalOpen={showPowerModal || showRescueModal || showMissionIntroModal}
                />
              </div>
            )}

            {/* DOOR 2 */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  key="door2-component"  // ✅ FIXED: Static key prevents remount
                  syllables={['Ma', 'ha', 'ka', 'ya']}
                  completedWord="Mahakaya"
                  onDoorComplete={() => {}}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  onSyllableAudio={playSyllable}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="mahakaya-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle=" MAHAKAYA "
                  primaryColor="#FFD700" secondaryColor="#FF8C42" errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                  modalOpen={showPowerModal || showRescueModal || showMissionIntroModal}
                />
              </div>
            )}

            {/* GAMES */}
            {!showMissionIntroModal && !showPowerModal && !showRescueModal && !showCenteredSymbol && !showSceneCompletion && (
              <>
                {(sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || sceneState.phase === CAVE_PHASES.TRACE_COMPLETE) && (
                  <div className="tracing-area">
                    <ClickDotsPathGame
                      mooshikaImage={mooshikaTracing}
                      ganeshaImage={ganeshaComplete}
                      onComplete={completeTracing}
                      onProgress={(p, d) => sceneActions.updateState({ traceProgress: p, currentPathSegment: d })}
                      disabled={false}
                      showDebug={true}
                      initialDot={sceneState.currentPathSegment || 0}
                      initialProgress={sceneState.traceProgress || 0}
                      isResuming={isReload && sceneState.tracingStarted && !sceneState.tracingCompleted}
                    />
                  </div>
                )}

                {sceneState.growingStarted && (
                  <div className="growing-area">
                    <div className="floating-stones" onTouchStart={(e) => e.touches.length > 1 && e.preventDefault()}>
                      {sceneState.floatingStones.map((stone, i) => (
                        <div key={stone.id} className={`floating-stone ${stone.clicked ? 'clicked' : ''}`}
                          style={{ left: `${stone.x}%`, top: `${stone.y}%`, display: stone.clicked ? 'none' : 'block' }}
                          onClick={() => handleStoneClick(stone.id)}
                        >
                          <img src={stoneImages[i]} alt="stone" />
                          {showSparkle === `stone-${stone.id}-clicked` && <SparkleAnimation type="magic" count={10} color="#ffd700" size={8} duration={1000} fadeOut={true} area="full" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* GANESHA */}
            {sceneState.ganeshaVisible && (
              <div className={`mini-ganesha-container ${getGaneshaAnimationClass()}`}
                style={{ position: 'absolute', top: '40%', left: '55%', transform: `translate(-50%, -50%) scale(${sceneState.ganeshaSize || 0.8})`, zIndex: 8, filter: `brightness(${1 + (sceneState.ganeshaGlow || 0.2)})` }}>
                <img src={ganeshaComplete} alt="Ganesha" style={{ width: '100px', height: '100px', border: 'none', outline: 'none', boxShadow: 'none' }} />
              </div>
            )}

            {/* SIDEBAR & NAV */}
            <BackToMapButton onNavigate={onNavigate} />
            <div style={{ filter: 'none' }}><SymbolSidebar unlockedSymbols={{ vakratunda: sceneState.learnedWords?.vakratunda?.learned, mahakaya: sceneState.learnedWords?.mahakaya?.learned }} /></div>
            <TocaBocaNav onHome={() => onNavigate?.('home')} onProgress={() => setShowCulturalCelebration(true)} onZonesClick={() => onNavigate?.('zones')} onStartFresh={() => resetScene()} currentProgress={{ stars: sceneState.stars, completed: sceneState.completed ? 1 : 0, total: 1 }} />

            {/* MODALS */}
            {showCenteredSymbol && (
              <>
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.7)', zIndex: 199, animation: 'fadeIn 0.3s' }} />
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 200, textAlign: 'center', animation: 'symbolAppear 0.5s' }}>
                  <img src={powerConfig[showCenteredSymbol]?.image} alt={showCenteredSymbol} style={{ width: '180px', animation: 'symbolGlow 2s infinite' }} />
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginTop: '20px' }}>{powerConfig[showCenteredSymbol]?.name}</div>
                </div>
              </>
            )}

            {showPowerModal && (
              <div className="cave-power-overlay">
                <div className="cave-power-card">
                  <h1 className="cave-power-title">{powerConfig[currentMissionSymbol]?.name} Unlocked!</h1>
                  <img src={powerConfig[currentMissionSymbol]?.image} alt="icon" className="cave-power-icon" />
                  <p className="cave-power-description">{getPowerDescription(currentMissionSymbol)}</p>
                  <button className="cave-power-primary-button" onClick={handleSaveAnimal}>Save an Animal</button>
                  <div className="cave-power-secondary-buttons">
                    <button className="cave-power-secondary-button" onClick={() => { setShowPowerModal(false); resetScene(); }}>Play Again</button>
                    <button className="cave-power-secondary-button" onClick={handleContinueLearning}>{getNextDiscoveryText(currentMissionSymbol)}</button>
                  </div>
                </div>
              </div>
            )}

            <RescueModal key={currentRescueWord} show={showRescueModal} wordData={currentRescueWord ? RESCUE_CONFIGS[currentRescueWord] : null} onComplete={handleRescueComplete} profileName={profileName} />
            <CulturalCelebrationModal show={showCulturalCelebration} onClose={() => setShowCulturalCelebration(false)} />
            
            {showSceneCompletion && (
              <SceneCompletionCelebration
                show={true}
                sceneName="Cave of Secrets - Scene 1"
                starsEarned={8}
                totalStars={8}
                discoveredSymbols={['vakratunda', 'mahakaya']}
                containerType="journal"
                containerImage={meaningJournal}
                meaningCards={{ vakratunda: { sanskrit: "वक्रतुण्ड", meaning: "Curved Trunk" }, mahakaya: { sanskrit: "महाकाय", meaning: "Great Body" } }}
                appImages={{ vakratunda: appVakratunda, mahakaya: appMahakaya }}
                nextSceneName="Million Suns Chamber"
                onComplete={onComplete}
                onReplay={() => { setShowSceneCompletion(false); resetScene(); }}
                onContinue={() => {
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'vakratunda-mahakaya', { completed: true, stars: 8 });
                  }
                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'suryakoti-samaprabha', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}
            
            {showSparkle === 'final-fireworks' && <Fireworks show={true} duration={8000} onComplete={() => setShowSceneCompletion(true)} />}
            
            {sceneState.welcomeShown && <ProgressiveHintSystem ref={progressiveHintRef} sceneId={sceneId} sceneState={sceneState} hintConfigs={getHintConfigs()} characterImage={mooshikaCoach} initialDelay={20000} enabled={!showPowerModal && !showRescueModal} />}
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default CaveSceneFixed;