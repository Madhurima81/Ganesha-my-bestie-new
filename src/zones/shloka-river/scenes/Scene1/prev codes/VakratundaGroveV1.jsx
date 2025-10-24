// zones/shloka-river/scenes/Scene1/VakratundaGrove.jsx - V1 Audio Memory Game
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGrove.css';

// Import scene management components
import SceneManager from "../../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../../lib/components/celebration/SceneCompletionCelebration';

// Images - River scene assets
import riverBackground from './assets/images/elephant-grove-bg.png';
import lotusVa from './assets/images/lotus-va.png';
import lotusKra from './assets/images/lotus-kra.png';
import lotusTun from './assets/images/lotus-tun.png';
import lotusDa from './assets/images/lotus-da.png';
import stoneMa from './assets/images/stone-ma.png';
import stoneHa from './assets/images/stone-ha.png';
import stoneKa from './assets/images/stone-ka.png';
import stoneYa from './assets/images/stone-ya.png';
import elephantBabyVa from './assets/images/elephant-baby-va.png';
import elephantBabyKra from './assets/images/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/elephant-baby-da.png';
import elephantHa from './assets/images/elephant-ha.png';
import elephantKa from './assets/images/elephant-ka.png';
import elephantMa from './assets/images/elephant-ma.png';
import elephantYa from './assets/images/elephant-ya.png';
import ganeshaCoach from "./assets/images/ganesha-coach.png";

const PHASES = {
  INITIAL: 'initial',
  MEMORY_GAME: 'memory_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  MAHAKAYA_GAME: 'mahakaya_game', 
  SCENE_COMPLETE: 'scene_complete'
};

// Simple Error Boundary Component
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
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const VakratundaGrove = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'vakratunda-grove'
}) => {
  console.log('VakratundaGrove props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Memory game state
          currentSequence: [], // Audio sequence to match
          playerSequence: [], // Player's clicked sequence
          currentRound: 1, // 1-3 rounds of increasing difficulty
          isPlayingSequence: false,
          isPlayerTurn: false,
          currentStep: 0,
          
          // Scene progression
          vakratundaComplete: false,
          mahakayaComplete: false,
          currentSection: 'vakratunda', // 'vakratunda' | 'mahakaya' | 'complete'
          
          // Element states
          lotusStates: [0, 0, 0, 0], // 0: bud, 1: blooming, 2: bloomed
          babyElephantStates: [0, 0, 0, 0], // 0: sleeping, 1: ready, 2: celebrating
          stoneStates: [0, 0, 0, 0],
          adultElephantStates: [0, 0, 0, 0],
          
          // Learning progress
          learnedSyllables: {
            va: false, kra: false, tun: false, da: false,
            ma: false, ha: false, ka: false, ya: false
          },
          learnedWords: {
            vakratunda: false,
            mahakaya: false
          },
          
          // Visual effects
          waterDrops: [],
          highlightedLotus: null, // Which lotus is "singing"
          celebrationStars: 0,
          phase: PHASES.INITIAL,
          
          // Message flags
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          
          // System state
          currentPopup: null,
          showingCompletionScreen: false,
          gameCoachState: null,
          isReloadingGameCoach: false,
          
          // Progress
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <VakratundaGroveContent
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

const VakratundaGroveContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('VakratundaGroveContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  
  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);
  const activeDropsRef = useRef(new Set());
  const MAX_WATER_DROPS = 20;

  // Better positioning - Lotus in water, elephants on banks
  const elementPositions = {
    // Lotus flowers floating in water
    lotuses: [
      { left: '25%', top: '55%' },  // Va - in water
      { left: '40%', top: '60%' },  // Kra - in water  
      { left: '55%', top: '55%' },  // Tun - in water
      { left: '70%', top: '60%' }   // Da - in water
    ],
    // Baby elephants on left bank
    babyElephants: [
      { left: '15%', top: '45%' },  // Va - bank
      { left: '30%', top: '40%' },  // Kra - bank
      { left: '45%', top: '45%' },  // Tun - bank  
      { left: '60%', top: '40%' }   // Da - bank
    ],
    
    // Stones in water (for mahakaya scene)
    stones: [
      { left: '25%', top: '55%' },  // Ma - in water
      { left: '40%', top: '60%' },  // Ha - in water
      { left: '55%', top: '55%' },  // Ka - in water
      { left: '70%', top: '60%' }   // Ya - in water
    ],
    // Adult elephants on banks
    adultElephants: [
      { left: '15%', top: '45%' },  // Ma - bank
      { left: '30%', top: '40%' },  // Ha - bank
      { left: '45%', top: '45%' },  // Ka - bank
      { left: '60%', top: '40%' }   // Ya - bank
    ]
  };

  // Syllable data
  const syllableData = {
    vakratunda: [
      { syllable: 'va', index: 0 },
      { syllable: 'kra', index: 1 },
      { syllable: 'tun', index: 2 },
      { syllable: 'da', index: 3 }
    ],
    mahakaya: [
      { syllable: 'ma', index: 0 },
      { syllable: 'ha', index: 1 },
      { syllable: 'ka', index: 2 },
      { syllable: 'ya', index: 3 }
    ]
  };

  // Get profile name for messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      activeDropsRef.current.clear();
    };
  }, []);

  // Web Speech API for syllable pronunciation
  const playSyllableAudio = (syllable) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      console.log(`Playing syllable: ${syllable}`);
      speechSynthesis.speak(utterance);
    }
  };

  // Play complete word
  const playCompleteWord = (word) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.6;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // MEMORY GAME: Generate sequence for current round
  const generateSequence = (section, round) => {
    const syllables = section === 'vakratunda' 
      ? syllableData.vakratunda 
      : syllableData.mahakaya;
    
    // Round 1: 2 syllables, Round 2: 3 syllables, Round 3: 4 syllables
    const sequenceLength = Math.min(round + 1, 4);
    const sequence = syllables.slice(0, sequenceLength);
    
    console.log(`Generated sequence for round ${round}:`, sequence);
    return sequence;
  };

  // MEMORY GAME: Play audio sequence - Better state management
  const playSequence = async (sequence) => {
    console.log('PLAY SEQUENCE: Starting with sequence:', sequence);
    
    sceneActions.updateState({ 
      isPlayingSequence: true,
      isPlayerTurn: false,
      highlightedLotus: null,
      currentStep: 0,  // CRITICAL: Reset step counter
      playerSequence: []  // CRITICAL: Reset player sequence
    });

    for (let i = 0; i < sequence.length; i++) {
      const item = sequence[i];
      console.log(`PLAY SEQUENCE: Playing syllable ${i}: ${item.syllable} (index ${item.index})`);
      
      // Highlight lotus and play audio
      sceneActions.updateState({ highlightedLotus: item.index });
      playSyllableAudio(item.syllable);
      
      // Wait before next syllable
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Finished playing - player's turn
    console.log('PLAY SEQUENCE: Finished, now player turn');
    sceneActions.updateState({ 
      isPlayingSequence: false,
      isPlayerTurn: true,
      highlightedLotus: null
    });
  };

  // MEMORY GAME: Start round - Better state cleanup
  const startMemoryRound = (section, round) => {
    console.log(`Starting memory round ${round} for ${section}`);
    
    const sequence = generateSequence(section, round);
    console.log('Generated sequence:', sequence);
    
    // CRITICAL: Reset all memory game state first
    sceneActions.updateState({
      currentSequence: sequence,
      playerSequence: [],
      currentRound: round,
      currentStep: 0,
      isPlayingSequence: false,
      isPlayerTurn: false,
      highlightedLotus: null,
      phase: section === 'vakratunda' ? PHASES.MEMORY_GAME : PHASES.MAHAKAYA_GAME
    });
    
    // Show instruction, then play sequence
    safeSetTimeout(() => {
      console.log('About to play sequence:', sequence);
      playSequence(sequence);
    }, 1500);
  };

// Dedicated Water Spray Component
const WaterSpray = ({ elephantIndex, section, isActive, targetPosition }) => {
  if (!isActive) return null;
  
  const isAdult = section === 'mahakaya';
  const dropCount = isAdult ? 20 : 12;
  
  // Calculate spray direction from elephant to lotus/stone
  const elephantPos = isAdult 
    ? elementPositions.adultElephants[elephantIndex]
    : elementPositions.babyElephants[elephantIndex];
    
  const targetPos = isAdult
    ? elementPositions.stones[elephantIndex] 
    : elementPositions.lotuses[elephantIndex];
  
  return (
    <div className="water-spray-container">
      {Array.from({ length: dropCount }).map((_, i) => {
        const delay = i * 50; // Stagger drops
        const spread = (Math.random() - 0.5) * 20; // Random spread
        
        return (
          <div
            key={i}
            className="spray-drop"
            style={{
              left: elephantPos.left,
              top: elephantPos.top,
              '--target-x': targetPos.left,
              '--target-y': targetPos.top,
              '--delay': `${delay}ms`,
              '--spread': `${spread}px`,
              animationDelay: `${delay}ms`
            }}
          >
            💧
          </div>
        );
      })}
    </div>
  );
};

  // Enhanced elephant spray with better targeting
  const triggerElephantSpray = (elephantIndex, section) => {
    setShowSparkle(`spray-${section}-${elephantIndex}`);
    
    // Remove spray effect after animation
    safeSetTimeout(() => {
      setShowSparkle(null);
    }, 2000);
  };

  // MEMORY GAME: Handle elephant click - FIXED
  const handleElephantClick = (elephantIndex, section) => {
    if (!sceneState || !sceneActions) return;
    
    // Only accept clicks during player turn
    if (!sceneState.isPlayerTurn) {
      console.log('Not player turn, ignoring click');
      return;
    }
    
    const currentSequence = sceneState.currentSequence || [];
    const currentStep = sceneState.currentStep || 0;
    
    console.log(`Elephant ${elephantIndex} clicked at step ${currentStep}`);
    console.log('Current sequence:', currentSequence);
    console.log(`Expecting index: ${currentSequence[currentStep]?.index}`);
    
    // Check if this matches the expected step
    const expectedIndex = currentSequence[currentStep]?.index;
    
    if (elephantIndex === expectedIndex) {
      // CORRECT!
      const syllable = currentSequence[currentStep].syllable;
      console.log(`Correct! Playing syllable: ${syllable}`);
      
      // Play syllable
      playSyllableAudio(syllable);
      
      // Trigger spray and bloom
      triggerElephantSpray(elephantIndex, section);
      bloomLotus(elephantIndex, section);
      
      // Update learning progress
      const newLearnedSyllables = {
        ...sceneState.learnedSyllables,
        [syllable]: true
      };
      
      const newPlayerSequence = [...(sceneState.playerSequence || []), elephantIndex];
      const nextStep = currentStep + 1;
      
      // CRITICAL FIX: Update state in single call
      sceneActions.updateState({
        playerSequence: newPlayerSequence,
        currentStep: nextStep,
        learnedSyllables: newLearnedSyllables
      });
      
      // Check if sequence complete
      if (nextStep >= currentSequence.length) {
        console.log('Sequence complete!');
        // CRITICAL FIX: Prevent further clicks immediately
        sceneActions.updateState({ 
          isPlayerTurn: false,
          canPlayerClick: false 
        });
        
        safeSetTimeout(() => {
          completeMemoryRound(section);
        }, 1500);
      }
      
    } else {
      // WRONG - gentle feedback and reset
      console.log(`Wrong elephant clicked. Expected ${expectedIndex}, got ${elephantIndex}`);
      resetMemoryRound(section);
    }
  };

  // Bloom lotus with animation
  const bloomLotus = (lotusIndex, section) => {
    if (section === 'vakratunda') {
      const lotusStates = [...sceneState.lotusStates];
      lotusStates[lotusIndex] = 2; // Bloomed
      sceneActions.updateState({ lotusStates });
    } else {
      const stoneStates = [...sceneState.stoneStates];
      stoneStates[lotusIndex] = 2; // Activated
      sceneActions.updateState({ stoneStates });
    }
    
    setShowSparkle(`${section}-bloom-${lotusIndex}`);
    safeSetTimeout(() => setShowSparkle(null), 1500);
  };

  // Complete memory round - SIMPLIFIED
  const completeMemoryRound = (section) => {
    const currentRound = sceneState.currentRound || 1;
    
    console.log(`Round ${currentRound} complete for ${section}`);
    
    if (currentRound < 3) {
      // Next round - IMMEDIATE state update
      console.log(`Starting round ${currentRound + 1}`);
      
      safeSetTimeout(() => {
        sceneActions.updateState({
          currentRound: currentRound + 1,
          currentSequence: [],
          playerSequence: [],
          currentStep: 0,
          isPlayerTurn: false,
          canPlayerClick: false
        });
        
        // Start next round
        safeSetTimeout(() => {
          startMemoryRound(section, currentRound + 1);
        }, 500);
      }, 1000);
      
    } else {
      // Section complete
      console.log(`${section} section complete!`);
      completeSectionLearning(section);
    }
  };

  // Reset memory round - SIMPLIFIED
  const resetMemoryRound = (section) => {
    console.log('RESET: Wrong answer, restarting current round');
    
    // CRITICAL: Stop all player interaction immediately
    sceneActions.updateState({
      playerSequence: [],
      currentStep: 0,
      isPlayerTurn: false,
      canPlayerClick: false,
      highlightedLotus: null
    });
    
    // Replay sequence after delay
    safeSetTimeout(() => {
      console.log('RESET: Replaying sequence');
      playSequence(sceneState.currentSequence);
    }, 1500);
  };

  // Complete section learning
  const completeSectionLearning = (section) => {
    if (section === 'vakratunda') {
      playCompleteWord('vakratunda');
      sceneActions.updateState({
        vakratundaComplete: true,
        currentSection: 'mahakaya',
        learnedWords: { ...sceneState.learnedWords, vakratunda: true },
        phase: PHASES.VAKRATUNDA_COMPLETE,
        progress: { ...sceneState.progress, percentage: 50, starsEarned: 3 }
      });
      
      setShowSparkle('vakratunda-complete');
      safeSetTimeout(() => {
        setShowSparkle(null);
        startMemoryRound('mahakaya', 1);
      }, 3000);
      
    } else {
      playCompleteWord('mahakaya');
      sceneActions.updateState({
        mahakayaComplete: true,
        currentSection: 'complete',
        learnedWords: { ...sceneState.learnedWords, mahakaya: true },
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: { percentage: 100, starsEarned: 5, completed: true }
      });
      
      setShowSparkle('scene-complete');
      safeSetTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 2000);
    }
  };

  // Auto-start first memory game
  useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && sceneState?.welcomeShown) {
      console.log('Starting first memory game');
      safeSetTimeout(() => {
        startMemoryRound('vakratunda', 1);
      }, 2000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // GameCoach messages
  useEffect(() => {
    if (!sceneState || !showMessage || sceneState.isReloadingGameCoach) return;
    
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      const timer = setTimeout(() => {
        showMessage(`Welcome to the sacred river, ${profileName}! Listen to the lotus flowers sing, then click the elephants in the same order!`, {
          duration: 6000,
          animation: 'bounce',
          position: 'top-right'
        });
        sceneActions.updateState({ welcomeShown: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, showMessage]);

  // Render progress counter
  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;
    
    return (
      <div className="syllable-counter">
        <div className="counter-icon">🌸</div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{width: `${(learnedCount / totalSyllables) * 100}%`}}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
      </div>
    );
  };

  // Get element images
  const getLotusImage = (index) => {
    const images = [lotusVa, lotusKra, lotusTun, lotusDa];
    return images[index];
  };

  const getStoneImage = (index) => {
    const images = [stoneMa, stoneHa, stoneKa, stoneYa];
    return images[index];
  };

  const getBabyElephantImage = (index) => {
    const images = [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa];
    return images[index];
  };

  const getAdultElephantImage = (index) => {
    const images = [elephantMa, elephantHa, elephantKa, elephantYa];
    return images[index];
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-grove-container">
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>
            {renderProgressCounter()}
            
            {/* Game Instructions */}
            {sceneState.isPlayingSequence && (
              <div className="game-instruction">
                Listen to the lotus flowers...
              </div>
            )}
            
            {sceneState.isPlayerTurn && (
              <div className="game-instruction">
                Now click the elephants in the same order!
              </div>
            )}
            
            {/* SCENE 1A: Vakratunda Memory Game */}
            {sceneState.currentSection === 'vakratunda' && (
              <div className="scene-1a-container">
                {/* Lotus Flowers */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`lotus-${index}`}
                    className={`lotus lotus-${index} 
                      ${sceneState.lotusStates?.[index] === 2 ? 'bloomed' : 'bud'}
                      ${sceneState.highlightedLotus === index ? 'singing' : ''}
                    `}
                    style={{
                      position: 'absolute',
                      left: elementPositions.lotuses[index].left,
                      top: elementPositions.lotuses[index].top
                    }}
                  >
                    <img
                      src={getLotusImage(index)}
                      alt={`Lotus ${syllableData.vakratunda[index].syllable}`}
                      style={{ width: '100%', height: '100%' }}
                    />
                    {sceneState.lotusStates?.[index] === 2 && (
                      <div className="syllable-label">
                        {syllableData.vakratunda[index].syllable.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Baby Elephants */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`baby-elephant-${index}`}
                    className={`baby-elephant baby-elephant-${index} ${sceneState.isPlayerTurn ? 'clickable' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.babyElephants[index].left,
                      top: elementPositions.babyElephants[index].top
                    }}
                  >
                    <ClickableElement
                      id={`baby-elephant-${index}`}
                      onClick={() => handleElephantClick(index, 'vakratunda')}
                      completed={false}
                      zone="baby-elephant-zone"
                    >
                      <img
                        src={getBabyElephantImage(index)}
                        alt={`Baby Elephant ${syllableData.vakratunda[index].syllable}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="elephant-label">
                      {syllableData.vakratunda[index].syllable.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* SCENE 1B: Mahakaya Memory Game */}
            {sceneState.currentSection === 'mahakaya' && (
              <div className="scene-1b-container">
                {/* Stones */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`stone-${index}`}
                    className={`stone stone-${index} 
                      ${sceneState.stoneStates?.[index] === 2 ? 'activated' : 'inactive'}
                      ${sceneState.highlightedLotus === index ? 'singing' : ''}
                    `}
                    style={{
                      position: 'absolute',
                      left: elementPositions.stones[index].left,
                      top: elementPositions.stones[index].top
                    }}
                  >
                    <img
                      src={getStoneImage(index)}
                      alt={`Stone ${syllableData.mahakaya[index].syllable}`}
                      style={{ width: '100%', height: '100%' }}
                    />
                    {sceneState.stoneStates?.[index] === 2 && (
                      <div className="syllable-label">
                        {syllableData.mahakaya[index].syllable.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Adult Elephants */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`adult-elephant-${index}`}
                    className={`adult-elephant adult-elephant-${index} ${sceneState.isPlayerTurn ? 'clickable' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.adultElephants[index].left,
                      top: elementPositions.adultElephants[index].top
                    }}
                  >
                    <ClickableElement
                      id={`adult-elephant-${index}`}
                      onClick={() => handleElephantClick(index, 'mahakaya')}
                      completed={false}
                      zone="adult-elephant-zone"
                    >
                      <img
                        src={getAdultElephantImage(index)}
                        alt={`Adult Elephant ${syllableData.mahakaya[index].syllable}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="elephant-label">
                      {syllableData.mahakaya[index].syllable.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            
            {/* Water Spray Effects */}
            {showSparkle?.includes('spray') && (
              <WaterSpray
                elephantIndex={parseInt(showSparkle.split('-')[2])}
                section={showSparkle.split('-')[1]}
                isActive={true}
              />
            )}
            
            {/* Old Water Drops - Remove these */}
            {(sceneState.waterDrops || []).map(drop => (
              <div
                key={drop.id}
                className="water-drop enhanced-arc"
                style={{
                  fontSize: `${drop.size * 1.5 + 2}vh`,
                  right: `${drop.startRight}%`,
                  bottom: `${drop.startBottom}%`,
                  transform: `rotate(${drop.rotation}deg)`,
                  opacity: drop.opacity,
                  '--delta-x': `${drop.deltaX}vw`,
                  '--delta-y': `${drop.deltaY}vh`,
                  '--arc-height': `${drop.arcHeight}vh`,
                  '--duration': `${drop.duration}s`,
                  animation: `riverWaterArc var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
                }}
              >
                💧
              </div>
            ))}
            
            {/* Sparkle Effects */}
            {showSparkle === 'vakratunda-complete' && (
              <SparkleAnimation
                type="glitter"
                count={30}
                color="#4ECDC4"
                size={15}
                duration={3000}
                fadeOut={true}
                area="full"
              />
            )}
            
            {showSparkle === 'scene-complete' && (
              <SparkleAnimation
                type="magic"
                count={50}
                color="gold"
                size={20}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}
            
            {showSparkle?.includes('bloom') && (
              <SparkleAnimation
                type="star"
                count={15}
                color="#ff9ebd"
                size={12}
                duration={1500}
                fadeOut={true}
                area="full"
              />
            )}
          </div>
          
          {/* Final Fireworks */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              count={20}
              colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
              onComplete={() => {
                setShowSparkle(null);
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                    completed: true,
                    stars: 5,
                    syllables: sceneState.learnedSyllables,
                    words: sceneState.learnedWords,
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                  SimpleSceneManager.clearCurrentScene();
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}
          
          {/* Scene Completion */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Vakratunda Grove"
            sceneNumber={1}
            totalScenes={5}
            starsEarned={5}
            totalStars={5}
            discoveredSymbols={Object.keys(sceneState.learnedSyllables || {}).filter(syl =>
              sceneState.learnedSyllables?.[syl]
            )}
            nextSceneName="Firefly Garden"
            sceneId="vakratunda-grove"
            completionData={{
              stars: 5,
              syllables: sceneState.learnedSyllables,
              words: sceneState.learnedWords,
              completed: true
            }}
            onComplete={onComplete}
            onReplay={() => {
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                SimpleSceneManager.setCurrentScene('shloka-river', 'vakratunda-grove', false, false);
              }
              setTimeout(() => window.location.reload(), 100);
            }}
            onContinue={() => {
              if (clearManualCloseTracking) clearManualCloseTracking();
              if (hideCoach) hideCoach();
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'vakratunda-grove', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
              }
              
              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'firefly-garden', false, false);
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          />
          
          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`Memory game progress, ${profileName}!`);
              if (hideCoach) hideCoach();
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaGrove;