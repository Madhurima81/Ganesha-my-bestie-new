// zones/symbol-mountain/scenes/modak/NewModakSceneV5.jsx
// ProgressiveHintSystem with visual disabled state

import React, { useState, useEffect, useRef } from 'react';
import './ModakScene.css';
import '../../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';


// Images
import forestBackground from './assets/images/forest-background.png';
import modak1 from './assets/images/modak-1.png';
import modak2 from './assets/images/modak-2.png';
import modak3 from './assets/images/modak-3.png';
import basket from './assets/images/basket.png';
import mooshika from '../../shared/images/icons/symbol-mooshika-new.png';
import mudMound from './assets/images/mud-mound.png';
import rock from './assets/images/rock.png';
import belly from './assets/images/belly.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.png';

// Add these imports near your other image imports
import mooshikaBefore from './assets/images/mooshika-before.png';
import mooshikaAfter from './assets/images/mooshika-after.png';
import modakBefore from './assets/images/modak-before.png';
import modakAfter from './assets/images/modak-after.png';
import bellyBefore from './assets/images/belly-before.png';
import bellyAfter from './assets/images/belly-after.png';
import ganeshaCharacter from './assets/images/ganesha-character.webp';

const PHASES = {
  MOOSHIKA_SEARCH: 'mooshika_search',
  MOOSHIKA_FOUND: 'mooshika_found',
  MODAKS_UNLOCKED: 'modaks_unlocked',
  SOME_COLLECTED: 'some_collected',
  ALL_COLLECTED: 'all_collected',
  BASKET_READY: 'basket_ready',
  ROCK_VISIBLE: 'rock_visible',
  ROCK_FEEDING: 'rock_feeding',
  ROCK_TRANSFORMED: 'rock_transformed',
  COMPLETE: 'complete'
};

const powerConfig = {
  mooshika: { 
    name: 'Divine Guidance', 
    image: symbolMooshikaColored,
    color: '#FF69B4' 
  },
  modak: { 
    name: 'Sweet Blessing', 
    image: symbolModakColored,
    color: '#FFD700' 
  },
  belly: { 
    name: 'Cosmic Container', 
    image: symbolBellyColored,
    color: '#FF8C42' 
  }
};

const missionImages = {
  mooshika: { before: mooshikaBefore, after: mooshikaAfter },
  modak: { before: modakBefore, after: modakAfter },
  belly: { before: bellyBefore, after: bellyAfter }
};


// Error Boundary
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

const NewModakScene = ({ 
  onComplete, 
  onNavigate, 
  zoneId = 'symbol-mountain', 
  sceneId = 'modak' 
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          moundStates: [0, 0, 0, 0, 0],
          correctMound: Math.floor(Math.random() * 5) + 1,
          mooshikaVisible: false,
          mooshikaFound: false,
          mooshikaPosition: { top: '45%', left: '25%' },
          moundsVanished: false,
          moundsVanishing: false,

          modakStates: [0, 0, 0],
          modaksUnlocked: false,
          basketVisible: false,
          basketFull: false,
          basketReady: false,
          collectedModaks: [],
          
          rockVisible: false,
          rockFeedCount: 0,
          rockTransformed: false,
          rockBellySize: 0,
          
          phase: PHASES.MOOSHIKA_SEARCH,
          currentFocus: 'mooshika',
          discoveredSymbols: {},
          
          welcomeShown: false,
          showMooshikaText: false,
          showModakText: false,
          showBellyText: false,
          
          currentPopup: null,
          showingCompletionScreen: false,
          
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <NewModakSceneContent 
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

const NewModakSceneContent = ({ 
  sceneState, 
  sceneActions, 
  isReload, 
  onComplete, 
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState || !sceneActions) {
    return <div>Loading scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.MOOSHIKA_SEARCH });

  const [showHintGlow, setShowHintGlow] = useState(false);


  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showMooshikaSpeech, setShowMooshikaSpeech] = useState(false);
  const [mooshikaSpeechMessage, setMooshikaSpeechMessage] = useState('');
  const [showGaneshaSpeech, setShowGaneshaSpeech] = useState(false);
  const [ganeshaSpeechMessage, setGaneshaSpeechMessage] = useState('');

  const [showPowerMission, setShowPowerMission] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);

  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);

    const [showDiscoveryOverlay, setShowDiscoveryOverlay] = useState(false);

  // ... existing state ...
const [discoveryStep, setDiscoveryStep] = useState('hidden'); 
const [isDiscoveryFading, setIsDiscoveryFading] = useState(false);
const [discoveryItem, setDiscoveryItem] = useState(null); // <--- ADD THIS ('mooshika', 'modak', 'belly')

const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');

// Configuration for the Overlay Text/Images
const discoveryConfig = {
  mooshika: {
    foundTitle: "You Found Mooshika!",
    foundSubtitle: "He has something magical to share...",
    powerName: "Divine Guidance",
    image: symbolMooshikaColored
  },
  modak: {
    foundTitle: "You Collected All Modaks!",
    foundSubtitle: "A sweet reward appears...",
    powerName: "Sweet Blessing",
    image: symbolModakColored
  },
  belly: {
    foundTitle: "Ganesha is Full!",
    foundSubtitle: "His belly glows with cosmic energy...",
    powerName: "Cosmic Container",
    image: symbolBellyColored
  }
};

// Reusable function to run the "Overlay Movie"
  const triggerDiscoverySequence = (itemKey, delay = 500) => {
    // 1. Setup
    setDiscoveryItem(itemKey);
    
    // 2. Start (Allow time for previous animations like 'poof' or 'transform')
    setTimeout(() => {
      setDiscoveryStep('found'); 
    }, delay);

    // 3. Transform to Symbol (3s later)
    setTimeout(() => {
      setDiscoveryStep('symbol'); 
      setShowSparkle('symbol-reveal');
    }, delay + 3000);

    // 4. Finish & Open Power Modal (3s later)
    setTimeout(() => {
      setIsDiscoveryFading(true);
      
      setTimeout(() => {
        setDiscoveryStep('hidden');
        setIsDiscoveryFading(false);
        
        // Trigger the collection logic
        completeSymbolLearning(itemKey, { name: discoveryConfig[itemKey].powerName });
      }, 500); 
    }, delay + 6000);
  };

  
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const reloadHandledRef = useRef(false); // 🔧 ADD THIS LINE


  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

useEffect(() => {
  return () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    reloadHandledRef.current = false; // 🔧 ADD THIS LINE
  };
}, []);

// 🔧 Handle reload continuation - WITH DEBUG LOGS
useEffect(() => {
  console.log('🔍 Reload useEffect triggered');
  console.log('📊 isReload:', isReload);
  console.log('📊 reloadHandled:', reloadHandledRef.current);
  console.log('📊 welcomeShown:', sceneState.welcomeShown);
  console.log('📊 phase:', sceneState.phase);

  if (!isReload) {
    console.log('❌ Skipping: isReload is false');
    return;
  }
  
  if (reloadHandledRef.current) {
    console.log('❌ Skipping: Already handled');
    return;
  }
  
  if (!sceneState.welcomeShown) {
    console.log('❌ Skipping: Welcome not shown');
    return;
  }

  console.log('✅ RELOAD DETECTED - Resuming from phase:', sceneState.phase);
  reloadHandledRef.current = true;

const shouldShowMooshikaModal = 
  sceneState.phase === PHASES.MOOSHIKA_FOUND;

const shouldShowModakModal = 
  sceneState.phase === PHASES.ALL_COLLECTED;

const shouldShowBellyModal = 
  sceneState.phase === PHASES.ROCK_TRANSFORMED;

  if (shouldShowMooshikaModal) {
    console.log('📌 Showing Mooshika modal');
    setTimeout(() => {
      setCurrentMissionSymbol('mooshika');
      setShowPowerModal(true);
    }, 500);
  } 
  else if (shouldShowModakModal) {
    console.log('📌 Showing Modak modal');
    setTimeout(() => {
      setCurrentMissionSymbol('modak');
      setShowPowerModal(true);
    }, 500);
  } 
  else if (shouldShowBellyModal) {
    console.log('📌 Showing Belly modal');
    setTimeout(() => {
      setCurrentMissionSymbol('belly');
      setShowPowerModal(true);
    }, 500);
  }
else if (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) {
  console.log('📌 TRIGGERING POPUP for modak collection');
  const collected = sceneState.collectedModaks?.length || 0;
  setResumeMessage(`Continue collecting modaks! You have ${collected}/3 in the basket!`);
  setShowResumePopup(true);
  console.log('Popup state set!');
  setTimeout(() => setShowResumePopup(false), 5000);
}
else if (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) {
  console.log('📌 TRIGGERING POPUP for rock feeding');
  const fedCount = sceneState.rockFeedCount || 0;
  setResumeMessage(`Keep feeding the rock with modaks! You have fed ${fedCount}/3!`);
  setShowResumePopup(true);
  setTimeout(() => setShowResumePopup(false), 5000);
}
  else if (sceneState.phase === PHASES.COMPLETE) {
    console.log('📌 Showing completion');
    if (!sceneState.showingCompletionScreen) {
      setTimeout(() => {
        setShowSceneCompletion(true);
      }, 500);
    }
  }
  else {
    console.log('⚠️ No condition matched for phase:', sceneState.phase);
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown, sceneState.discoveredSymbols]);

// Completion message
useEffect(() => {
  if (!sceneState) return;
  
  if (sceneState.phase === PHASES.COMPLETE && !sceneState.masteryShown) {
    const timer = setTimeout(() => {
      setResumeMessage(`Amazing work, ${profileName}! You've discovered Mooshika, Modaks, and Ganesha's cosmic belly!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 6000);
      
      sceneActions.updateState({ masteryShown: true });
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [sceneState?.phase, sceneState?.masteryShown, profileName]);

  // Repeating auto-glow hint — first glow at 20s, then pulse off/on every 12-15s
  useEffect(() => {
    let firstTimer;
    let repeatTimer;

    const glowPhases = [
      PHASES.MOOSHIKA_SEARCH,
      PHASES.MODAKS_UNLOCKED,
      PHASES.ROCK_VISIBLE
    ];

    // CRITICAL: Only start timer if welcome modal has been dismissed
    if (glowPhases.includes(sceneState?.phase) &&
        sceneState?.welcomeShown &&
        !showPowerModal &&
        !showPowerMission) {

      // First glow after 20s
      firstTimer = setTimeout(() => {
        setShowHintGlow(true);

        // Then pulse off/on every 12-15s to re-catch attention
        repeatTimer = setInterval(() => {
          setShowHintGlow(false);
          // Brief off-period (600ms) then glow back on
          setTimeout(() => setShowHintGlow(true), 600);
        }, 12000 + Math.floor(Math.random() * 3000)); // 12-15s
      }, 20000);

      return () => {
        clearTimeout(firstTimer);
        clearInterval(repeatTimer);
      };
    } else {
      setShowHintGlow(false);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, showPowerModal, showPowerMission]);

  const handleMoundClick = (moundIndex) => {
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.MOOSHIKA_SEARCH) return;

    const moundStates = [...(sceneState.moundStates || [0, 0, 0, 0, 0])];
    moundStates[moundIndex - 1] = 1;

    if (moundIndex === sceneState.correctMound) {
      // 1. Immediate visual feedback (Sparkles on mound)
      setShowSparkle('mooshika-found');
      
      // ... (Keep existing moundPositions logic and sceneActions.updateState) ...
      const moundPositions = { 1: { top: '45%', left: '25%' }, 2: { top: '55%', left: '75%' }, 3: { top: '60%', left: '30%' }, 4: { top: '60%', left: '50%' }, 5: { top: '60%', left: '60%' } };
      
      sceneActions.updateState({ 
        mooshikaVisible: true,
        mooshikaFound: true,
        mooshikaPosition: moundPositions[moundIndex],
        moundStates,
        phase: PHASES.MOOSHIKA_FOUND,
        moundsVanishing: true
      });

      // --- NEW 2-STAGE SEQUENCE ---

triggerDiscoverySequence('mooshika', 800);


    } else {
      // ... (Keep wrong mound logic) ...
      setShowSparkle(`mound-${moundIndex}`);
      sceneActions.updateState({ moundStates });
      setTimeout(() => setShowSparkle(null), 1000);
    }
  };

  const handleModakClick = (modakIndex) => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    if (!sceneState.modaksUnlocked) return;
    if (sceneState.modakStates[modakIndex] === 1) return;
    
   
    
    const modakStates = [...sceneState.modakStates];
    modakStates[modakIndex] = 1;
    
    const collectedModaks = [...(sceneState.collectedModaks || [])];
    collectedModaks.push(modakIndex);
    
    setShowSparkle(`modak-${modakIndex}`);
    setTimeout(() => setShowSparkle(null), 1000);
    
    const collectedCount = collectedModaks.length;
    
if (collectedCount === 3) {
  // First update - show 3/3 in header
  sceneActions.updateState({ 
    modakStates,
    collectedModaks,
    phase: PHASES.SOME_COLLECTED, // Keep header visible
    progress: { percentage: 50, starsEarned: 4 }
  });
  
  // Then after 1 second, mark basket as full (header disappears)
  setTimeout(() => {
    sceneActions.updateState({ 
      basketFull: true,
      phase: PHASES.ALL_COLLECTED
    });
    
    triggerDiscoverySequence('modak', 1000);
  }, 1000); // Give 1 second to see 3/3


      
    } else {
      sceneActions.updateState({ 
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 30 + (10 * collectedCount) }
      });
    }
  };

  const handleModakInBasketClick = (modakIndex) => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    if (!sceneState.rockVisible) return;
    if (sceneState.rockFeedCount >= 3) return;
    
    
    const newCollectedModaks = sceneState.collectedModaks.filter(i => i !== modakIndex);
    const newFeedCount = sceneState.rockFeedCount + 1;
    const newBellySize = newFeedCount * 33.33;
    
    setShowSparkle('rock-feeding');
    
    sceneActions.updateState({
      collectedModaks: newCollectedModaks,
      rockFeedCount: newFeedCount,
      rockBellySize: newBellySize,
      phase: PHASES.ROCK_FEEDING,
      progress: { percentage: 60 + (10 * newFeedCount) }
    });
    
if (newFeedCount >= 3) {
  // Keep showing 3/3 for 1 second before transformation
  setTimeout(() => {
    setShowSparkle('belly-transform');
    
    // Now hide header and transform
    sceneActions.updateState({ 
      rockTransformed: true,
      phase: PHASES.ROCK_TRANSFORMED
    });
    
    triggerDiscoverySequence('belly', 2000);
  }, 1500); // Total 1.5s delay is good here


    } else {
      setTimeout(() => setShowSparkle(null), 1500);
    }
  };
  // ... (Rest of handlers: getNextDiscoveryText, getPowerDescription, completeSymbolLearning, handleSaveAnimal, etc.) ...
  
  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      mooshika: '🍬 Discover Modak',
      modak: '🌟 Discover Belly',
      belly: '✨ End Scene'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      mooshika: 'Mooshika is ready to help you rescue animals.\nLet\'s see who needs help!',
      modak: 'Sweet blessings are ready to nourish those in need.\nLet\'s spread joy!',
      belly: 'The cosmic container can hold anything!\nTime to help someone carry their load!'
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

const completeSymbolLearning = (symbolKey, symbolData) => {
    console.log(`${symbolKey} symbol learned`);
    
    // 1. Immediately update state (Add to inventory)
    sceneActions.updateState({
      discoveredSymbols: {
        ...sceneState.discoveredSymbols,
        [symbolKey]: true
      }
    });

    // 2. Trigger Sidebar Sparkles (Visual feedback for "Collection")
    setShowSparkle(`${symbolKey}-to-sidebar`);
    
    // 3. Open the Power Modal almost immediately 
    // (Just enough delay for the Overlay to finish fading out)
    setTimeout(() => {
      setShowSparkle(null);
      setCurrentMissionSymbol(symbolKey);
      setShowPowerModal(true);
    }, 800); // Reduced from 5000ms+ sequence to 0.8s
  };

  const handleSaveAnimal = () => {
    setShowChoiceButtons(false);
    setShowPowerModal(false); 
    setShowPowerMission(true);
  };

  const handleContinueLearning = () => {
    setShowChoiceButtons(false);
      setShowPowerModal(false); // 🔧 ADD THIS LINE - Close modal immediately

    const symbolKey = currentMissionSymbol;
    
    if (symbolKey === 'mooshika') {
      setTimeout(() => {
        setShowSparkle('modaks-appearing');
      }, 500);
      setTimeout(() => {
        sceneActions.updateState({
          modaksUnlocked: true,
          basketVisible: true,
          phase: PHASES.MODAKS_UNLOCKED
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
    } else if (symbolKey === 'modak') {
      sceneActions.updateState({
        rockVisible: true,
        phase: PHASES.ROCK_VISIBLE
      });
} else if (symbolKey === 'belly') {
  setResumeMessage(`Amazing work! You've discovered all 3 symbols!`);
  setShowResumePopup(true);
  setTimeout(() => setShowResumePopup(false), 4000);
  
  sceneActions.updateState({
        phase: PHASES.COMPLETE,
        stars: 8,
        completed: true,
        progress: { percentage: 100, starsEarned: 8, completed: true }
      });
      setTimeout(() => setShowSparkle('final-fireworks'), 500);
    }
  };

  const handleMissionComplete = (symbolKey) => {
    console.log('Mission complete for:', symbolKey);
    setShowPowerMission(false);
    
    if (symbolKey === 'mooshika') {
      setTimeout(() => {
        setShowSparkle('modaks-appearing');
      }, 500);
      setTimeout(() => {
        sceneActions.updateState({
          modaksUnlocked: true,
          basketVisible: true,
          phase: PHASES.MODAKS_UNLOCKED
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
    } else if (symbolKey === 'modak') {
      sceneActions.updateState({
        rockVisible: true,
        phase: PHASES.ROCK_VISIBLE
      });
    } else if (symbolKey === 'belly') {
      sceneActions.updateState({
        phase: PHASES.COMPLETE,
        stars: 8,
        completed: true,
        progress: { percentage: 100, starsEarned: 8, completed: true }
      });
      setTimeout(() => setShowSparkle('final-fireworks'), 500);
    }
  };

  const resetScene = () => {
    sceneActions.updateState({
      moundStates: [0, 0, 0, 0, 0],
      correctMound: Math.floor(Math.random() * 5) + 1,
      mooshikaVisible: false,
      mooshikaFound: false,
      mooshikaPosition: { top: '45%', left: '25%' },
      moundsVanished: false,
      moundsVanishing: false,
      modakStates: [0, 0, 0],
      modaksUnlocked: false,
      basketVisible: false,
      basketFull: false,
      basketReady: false,
      collectedModaks: [],
      rockVisible: false,
      rockFeedCount: 0,
      rockTransformed: false,
      rockBellySize: 0,
      phase: PHASES.MOOSHIKA_SEARCH,
      currentFocus: 'mooshika',
      discoveredSymbols: {},
      welcomeShown: false,
      showMooshikaText: false,
      showModakText: false,
      showBellyText: false,
      currentPopup: null,
      showingCompletionScreen: false,
      stars: 0,
      completed: false,
      progress: {
        percentage: 0,
        starsEarned: 0,
        completed: false
      }
    });
    
    setShowSparkle(null);
    setShowMooshikaSpeech(false);
    setShowGaneshaSpeech(false);
    setShowHintGlow(false);
    
    if (progressiveHintRef.current?.resetHintSystem) {
      progressiveHintRef.current.resetHintSystem();
    }
  };

  const shouldEnableHints = () => {
    const disabledPhases = [
      PHASES.COMPLETE,
      PHASES.MOOSHIKA_FOUND,
      PHASES.ALL_COLLECTED,
      PHASES.ROCK_TRANSFORMED
    ];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'mooshika-hint',
      message: 'Click the mounds!', 
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.mooshikaFound
    },
    {
      id: 'modak-hint',
      message: 'Click the modaks!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => sceneState.modaksUnlocked && sceneState.modakStates?.some(state => state === 0)
    },
    {
      id: 'rock-hint',
      message: 'Click the modaks to feed!',
      position: { bottom: '60%', left: '65%', transform: 'translateX(-50%)' },
      condition: (sceneState) => sceneState.rockVisible && !sceneState.rockTransformed && sceneState.rockFeedCount < 3
    }
  ];

  const getModakImage = (index) => {
    const modakImages = [modak1, modak2, modak3];
    return modakImages[index] || modak1;
  };

  const renderCounter = () => {
    if (!sceneState.modaksUnlocked || !sceneState.welcomeShown) return null;
    const collectedCount = sceneState?.collectedModaks?.length || 0;
    
    return (
      <div className="modak-game-counter">
        <div className="modak-game-counter-icon">
          <img src={modak1} alt="Modak" />
        </div>
        <div className="modak-game-counter-progress">
          <div 
            className="modak-game-counter-progress-fill"
            style={{width: `${(collectedCount / 3) * 100}%`}}
          />
        </div>
        <div className="modak-game-counter-display">{collectedCount}/3</div>
      </div>
    );
  };

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="modak-game-container">
          <div className="modak-game-background" style={{ backgroundImage: `url(${forestBackground})` }}>
            {renderCounter()}

            {/* Phase Headers */}
            {!showChoiceButtons && !showPowerMission && sceneState.welcomeShown && ( 
              <>
                {sceneState.phase === PHASES.MOOSHIKA_SEARCH && (
                  <div className="modak-game-phase-header">
                    WHERE IS MOOSHIKA? Click the mounds!
                  </div>
                )}
                
         {/* Modak Collection Header - stays visible throughout collection */}
{(sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) && !sceneState.basketFull && (
  <div className="modak-game-phase-header">
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
      HELP MOOSHIKA! Click modaks to collect!
    </div>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      justifyContent: 'center'
    }}>
      {/* Progress Bar */}
      <div style={{
        width: '200px',
        height: '20px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '10px',
        border: '2px solid #8B4513',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((sceneState.collectedModaks?.length || 0) / 3) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #FF1493, #FFD700)',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
      {/* Counter */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        {sceneState.collectedModaks?.length || 0}/3
      </div>
    </div>
  </div>
)}

{/* Rock Feeding Header - stays visible throughout feeding */}
{(sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) && !sceneState.rockTransformed && (
  <div className="modak-game-phase-header">
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
      FEED GANESHA! Click modaks from basket!
    </div>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      justifyContent: 'center'
    }}>
      {/* Progress Bar */}
      <div style={{
        width: '200px',
        height: '20px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '10px',
        border: '2px solid #8B4513',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((sceneState.rockFeedCount || 0) / 3) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #FF8C00, #FFD700)',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
      {/* Counter */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        {sceneState.rockFeedCount || 0}/3
      </div>
    </div>
  </div>
)}
              </>
            )}

            {/* --- UPDATED OPENING MODAL USING SHARED CSS AND VARIABLES --- */}
            {sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown && (
              <div 
                className="game-modal-overlay"
                style={{
                  '--modal-card-bg': '#FFF9E6',
                  '--modal-text-primary': '#5D2E0F',
                  '--modal-btn-bg': 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                  '--modal-btn-shadow': 'rgba(255, 140, 0, 0.4)'
                }}
              >
                {/* Sparkles kept from original scene if needed, or remove if modal has them */}
                <div className="modak-game-sparkles">
                  <div className="modak-game-sparkle"></div>
                  <div className="modak-game-sparkle"></div>
                  <div className="modak-game-sparkle"></div>
                  <div className="modak-game-sparkle"></div>
                </div>

                <div className="game-modal-content">
                  {/* Character Left */}
                  <div className="game-modal-character">
                    <img 
                      src={ganeshaCharacter} 
                      alt="Ganesha Character"
                    />
                  </div>
                  
                  {/* Card Right */}
                  <div className="game-modal-card">
                    <h1 className="game-modal-title">
                      Help Ganesha Save the Forest!
                    </h1>
                    
                    <p className="game-modal-subtitle">
                      3 magical friends are hiding — let's find them!
                    </p>
                    
                    <div className="game-modal-icons">
                      <div className="game-modal-icon-item">
                  
<img 
  src={symbolMooshikaColored} /* <--- Use the cute brown one here! */
  alt="Mooshika Found" 
  className="discovery-hero-img" 
/>
                        <span className="game-modal-icon-label">Mooshika</span>
                      </div>
                      <div className="game-modal-icon-item">
                        <img src={symbolModakColored} alt="Modak" />
                        <span className="game-modal-icon-label">Modak</span>
                      </div>
                      <div className="game-modal-icon-item">
                        <img src={symbolBellyColored} alt="Belly Badge" />
                        <span className="game-modal-icon-label">Belly Badge</span>
                      </div>
                    </div>
                    
                    <button
                      className="game-modal-button"
                      onClick={() => {
                        sceneActions.updateState({ welcomeShown: true });
                      }}
                    >
                      Begin Adventure!
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* MUD MOUNDS */}
            {sceneState.welcomeShown && !sceneState.moundsVanished && [1, 2, 3, 4, 5].map((index) => (
              <div 
                className={`modak-game-mud-mound modak-game-mound-${index} 
                  ${sceneState.moundsVanishing ? 'fade-out' : ''} 
                  ${showHintGlow && sceneState.phase === PHASES.MOOSHIKA_SEARCH ? 'modak-game-hint-glow' : ''}`}
                key={`mound-${index}`}
              >

                <ClickableElement
                  id={`mound-${index}`}
                  onClick={() => handleMoundClick(index)}
                  completed={(sceneState.moundStates || [])[index - 1] === 1}
                  zone="mound-zone"
                >
                  <img 
                    src={mudMound}
                    alt={`Mud Mound ${index}`}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      opacity: (sceneState.moundStates || [])[index - 1] === 1 ? 0.7 : 1
                    }}
                  />
                </ClickableElement>
                {showSparkle === `mound-${index}` && (
                  <SparkleAnimation
                    type="firefly"
                    count={10}
                    color="#8B4513"
                    size={8}
                    duration={1000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            ))}

            {/* MOOSHIKA - FREE DRAGGABLE */}
            {sceneState.mooshikaVisible && (
              <FreeDraggableItem
                id="mooshika-companion"
                position={sceneState.mooshikaPosition || { top: '45%', left: '25%' }}
                onPositionChange={(newPosition) => {
                  sceneActions.updateState({
                    mooshikaPosition: newPosition
                  });
                }}
                onDragStart={() => {
                  setShowMooshikaSpeech(false);
                }}
                onDragEnd={() => {
                  setTimeout(() => {
                    setMooshikaSpeechMessage("Wheee! I love exploring!");
                    setShowMooshikaSpeech(true);
                    
                    const hideTimer = setTimeout(() => {
                      setShowMooshikaSpeech(false);
                    }, 3000);
                    timeoutsRef.current.push(hideTimer);
                  }, 500);
                }}
                disabled={showPowerModal || showPowerMission} 
                className="modak-game-mooshika-container breathing"
                style={{
                  width: '60px',
                  height: '60px'
                }}
                bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
              >
                <img 
                  src={mooshika}
                  alt="Mooshika - Drag me around!"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                />
                
                {showSparkle === 'mooshika-found' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#ff69b4"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}

                {showMooshikaSpeech && (
                  <div className="modak-game-mooshika-speech-bubble">
                    <div className="modak-game-speech-content">
                      {mooshikaSpeechMessage}
                    </div>
                    <div className="modak-game-speech-arrow"></div>
                  </div>
                )}
              </FreeDraggableItem>
            )}

            {/* MODAKS APPEARING SPARKLES */}
            {showSparkle === 'modaks-appearing' && (
              <>
                <div style={{ position: 'absolute', top: '45%', left: '70%', width: '80px', height: '80px', zIndex: 11 }}>
                  <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
                </div>
                <div style={{ position: 'absolute', top: '45%', left: '30%', width: '80px', height: '80px', zIndex: 11 }}>
                  <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
                </div>
                <div style={{ position: 'absolute', top: '55%', left: '75%', width: '80px', height: '80px', zIndex: 11 }}>
                  <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
                </div>
              </>
            )}

            {/* MODAKS */}
            {sceneState.modaksUnlocked && [0, 1, 2].map((index) => {
              if (sceneState.modakStates[index] === 1) return null;
              
              return (
                <div 
                  className={`modak-game-modak modak-game-modak-${index + 1} 
                    ${showHintGlow && sceneState.modaksUnlocked ? 'modak-game-hint-glow' : ''}`}
                  key={`modak-${index}`}
                >
                  <ClickableElement
                    id={`modak-${index}`}
                    onClick={() => handleModakClick(index)}
                    completed={false}
                    zone="modak-zone"
                  >
                    <img 
                      src={getModakImage(index)}
                      alt={`Modak ${index + 1}`}
                      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </ClickableElement>
                  
                  {showSparkle === `modak-${index}` && (
                    <SparkleAnimation
                      type="star"
                      count={15}
                      color="#ffd700"
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              );
            })}

            {/* BASKET */}
            {sceneState.basketVisible && (
              <div className="modak-game-basket-container">
                <div className="modak-game-basket-main">
                  <img 
                    src={basket}
                    alt="Collection Basket"
                    style={{ width: '100%', height: '100%' }}
                  />
                  
                  <div className="modak-game-basket-counter">
                    {sceneState.collectedModaks?.length || 0}/3
                  </div>
                </div>
              </div>
            )}

            {sceneState.collectedModaks?.map((modakIndex, displayIndex) => (
              <div 
                key={`collected-${modakIndex}-${displayIndex}`}
                className={`modak-game-modak modak-game-modak-collected-${displayIndex + 1} 
                  ${showHintGlow && sceneState.rockVisible ? 'modak-game-hint-glow' : ''}`}
                style={{
                  position: 'absolute',
                  width: '64px',
                  height: '64px',
                  top: `${42 + displayIndex * 3}%`,
                  left: `${14 + displayIndex * 2}%`,
                  zIndex: 15,
                  cursor: sceneState.rockVisible ? 'pointer' : 'default',
                  animation: 'modak-game-modakToBasket 0.8s ease-out'
                }}
                onClick={() => {
                  if (sceneState.rockVisible && sceneState.rockFeedCount < 3) {
                    handleModakInBasketClick(modakIndex);
                  }
                }}
              >
                <img 
                  src={getModakImage(modakIndex)} 
                  alt={`Collected Modak ${modakIndex + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    filter: 'brightness(1.1) saturate(1.2)'
                  }}
                />
                
                {/* ADD SPARKLES FOR EACH COLLECTED MODAK */}
                <SparkleAnimation
                  type="star"
                  count={8}
                  color="#ffd700"
                  size={6}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            ))}

            {/* ROCK/BELLY */}
            {sceneState.rockVisible && (
              <div className="modak-game-rock-container breathing">
                <ClickableElement
                  id="feeding-rock"
                  onClick={() => {}}
                  completed={sceneState.rockTransformed}
                  zone="rock-zone"
                >
                  <img 
                    src={sceneState.rockTransformed ? belly : rock}
                    alt={sceneState.rockTransformed ? "Ganesha's Belly" : "Sacred Rock"}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      cursor: 'default',
                      transform: `scale(${1 + (sceneState.rockBellySize / 100) * 0.3})`,
                      transition: 'transform 0.8s ease-out'
                    }}
                  />

                  <div className="modak-game-rock-feed-count">
                    {sceneState.rockFeedCount || 0}/3
                  </div>
                </ClickableElement>

                {(showSparkle === 'rock-feeding' || showSparkle === 'belly-transform') && (
                  <SparkleAnimation
                    type={showSparkle === 'belly-transform' ? 'glitter' : 'magic'}
                    count={25}
                    color={showSparkle === 'belly-transform' ? 'gold' : '#ff6347'}
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* SYMBOL LEARNING SPARKLES */}
            {showSparkle === 'mooshika-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '30%',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FF69B4"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {showSparkle === 'modak-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '25%',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FFD700"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {showSparkle === 'belly-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FF8C42"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

{/* --- DYNAMIC DISCOVERY OVERLAY --- */}
            {discoveryStep !== 'hidden' && discoveryItem && (
              <div className={`discovery-overlay ${isDiscoveryFading ? 'fading-out' : ''}`}>
                
                {/* DYNAMIC TITLE */}
                <h1 className="discovery-title" style={{
                  textShadow: discoveryStep === 'symbol' 
                    ? '0 0 30px #FFD700, 0 4px 0 #fff' 
                    : '0 4px 0 #fff, 0 0 20px rgba(255, 255, 255, 0.8)'
                }}>
                  {discoveryStep === 'found' 
                    ? discoveryConfig[discoveryItem].foundTitle 
                    : discoveryConfig[discoveryItem].powerName}
                </h1>

                {/* DYNAMIC SUBTITLE */}
                <p className="discovery-subtitle">
                  {discoveryStep === 'found' 
                    ? discoveryConfig[discoveryItem].foundSubtitle 
                    : 'Power Unlocked!'}
                </p>

                {/* HERO IMAGE */}
                <img 
                  src={discoveryConfig[discoveryItem].image} 
                  alt={discoveryItem} 
                  className="discovery-hero-img"
                  style={{
                    animation: discoveryStep === 'symbol' 
                      ? 'modak-game-powerPulse 2s infinite' 
                      : 'heroFloat 3s infinite ease-in-out',
                    filter: discoveryStep === 'symbol'
                      ? 'drop-shadow(0 0 50px gold)'
                      : 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))'
                  }}
                />
              </div>
            )}

            {/* Resume Popup */}
{showResumePopup && (
  <div style={{
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    padding: '30px 50px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 9999,
    fontFamily: "'Baloo 2', cursive",
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#5D2E0F',
    textAlign: 'center',
    maxWidth: '80%',
    border: '4px solid #FF8C00'
  }}>
    {resumeMessage}
  </div>
)}

{/* TEST BUTTON */}
<button
  onClick={() => {
    console.log('🧪 Test clicked');
    setResumeMessage("TEST - If you see this, popup works!");
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }}
  style={{
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 10000,
    padding: '15px 30px',
    background: 'red',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold'
  }}
>
  TEST POPUP
</button>

            {sceneState.welcomeShown && (
              <BackToMapButton onNavigate={onNavigate}  />
            )}
            {/* COMPLETION TEST BUTTON 
            <div style={{
              position: 'fixed',
              top: '170px',
              right: '10px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              sceneActions.updateState({
                discoveredSymbols: { mooshika: true, modak: true, belly: true },
                phase: PHASES.COMPLETE,
                completed: true,
                stars: 8,
                progress: { percentage: 100, starsEarned: 8, completed: true }
              });
              setTimeout(() => setShowSparkle('final-fireworks'), 1000);
            }}>
              COMPLETE
            </div>

            {/* START FRESH BUTTON 
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#FF4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
              border: '2px solid white'
            }} onClick={() => {
              if (confirm('Start this scene from the beginning?')) {
                resetScene();
              }
            }}>
              Start Fresh
            </div>

            {/* PROGRESSIVE HINT SYSTEM with disabled state */}
            {sceneState.welcomeShown && ( 
              <ProgressiveHintSystem
                ref={progressiveHintRef}
                sceneId={sceneId}
                sceneState={sceneState}
                hintConfigs={getHintConfigs()}
                characterImage={mooshikaCoach}
                initialDelay={12000}
                hintDisplayTime={10000}
                position="bottom-right"
                iconSize={60}
                zIndex={2000}
                enabled={shouldEnableHints()}
                disabledMessage="Great job!"
                onHintShown={() => setShowHintGlow(true)} 
                onHintHidden={() => setShowHintGlow(false)} 
              />             
            )}

          </div>

          {/* FIREWORKS */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              onComplete={() => {
                setShowSparkle(null);
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('symbol-mountain', 'modak', {
                    completed: true,
                    stars: 8,
                    symbols: { mooshika: true, modak: true, belly: true },
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_modak`);
                  SimpleSceneManager.clearCurrentScene();
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}

          {/* SCENE COMPLETION */}
          {showSceneCompletion && (
            <SceneCompletionCelebration
              show={true}
              sceneName="Garden Adventure"
              sceneNumber={1}
              totalScenes={4}
              starsEarned={8}
              totalStars={8}
              discoveredSymbols={['mooshika', 'modak', 'belly']}
              symbolImages={{
                mooshika: symbolMooshikaColored,
                modak: symbolModakColored,
                belly: symbolBellyColored
              }}
              nextSceneName="Pond Discovery"
              sceneId="modak"
              completionData={{
                stars: 8,
                symbols: { mooshika: true, modak: true, belly: true },
                completed: true
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                resetScene();
              }}
              onContinue={() => {
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'modak', {
                    completed: true,
                    stars: 8,
                    symbols: { mooshika: true, modak: true, belly: true }
                  });
                }

                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('symbol-mountain', 'pond', false, false);
                  onNavigate?.('scene-complete-continue');
                }, 100);
              }}
            />
          )}

          {/* Centered Symbol Celebration - Faded BG + Symbol + Label + SPARKLES 
          {showCenteredSymbol && (
            <>
              {/* Dark background overlay 
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(86, 84, 79, 0.7)',
                backdropFilter: 'blur(3px)',
                zIndex: 199,
                animation: 'modak-game-fadeIn 0.3s ease-out'
              }} />
              
              {/* Symbol + Text + Sparkles 
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 200,
                textAlign: 'center',
                animation: 'modak-game-scaleIn 0.5s ease-out'
              }}>
                {/* Symbol Image 
                <img 
                  src={powerConfig[showCenteredSymbol]?.image}
                  alt={showCenteredSymbol}
                  style={{
                    width: '180px',
                    height: '180px',
                    filter: `drop-shadow(0 0 40px ${powerConfig[showCenteredSymbol]?.color})`,
                    animation: 'modak-game-powerPulse 2s ease-in-out infinite alternate',
                    marginBottom: '25px'
                  }}
                />
                
                {/* ADD SPARKLES 
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  pointerEvents: 'none'
                }}>
                  <SparkleAnimation
                    type="glitter"
                    count={30}
                    color={powerConfig[showCenteredSymbol]?.color}
                    size={12}
                    duration={3000}
                    fadeOut={true}
                    area="full"
                  />
                </div>
                
                {/* Text Label 
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: `3px 3px 6px ${powerConfig[showCenteredSymbol]?.color}`,
                  animation: 'modak-game-strongPulse 1.5s ease-in-out infinite',
                  letterSpacing: '2px'
                }}>
                  {powerConfig[showCenteredSymbol]?.name}
                </div>
              </div>
            </>
          )}

          {/* Power Modal - Celebration Overlay */}
          {showPowerModal && (
            <div className="modak-game-power-overlay">
              <div className="modak-game-power-card">
                <h1 className="modak-game-power-title">
                  {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
                </h1>

                <img 
                  src={powerConfig[currentMissionSymbol]?.image}
                  alt="power symbol"
                  className="modak-game-power-icon"
                />

                <p className="modak-game-power-description">
                  {getPowerDescription(currentMissionSymbol)}
                </p>

                {/* Primary Action - Save an Animal */}
                <button 
                  className="modak-game-power-primary-button"
                  onClick={() => {
                    setShowPowerModal(false);
                    handleSaveAnimal();
                  }}
                >
                  Save an Animal
                </button>

                {/* Secondary Actions */}
                <div className="modak-game-power-secondary-buttons">
                  <button 
                    className="modak-game-power-secondary-button"
                    onClick={() => {
                      console.log(`🔄 Play Again: Restarting ${currentMissionSymbol} discovery`);
                      setShowPowerModal(false);
                      
                      // Reset to the appropriate phase for the current symbol
                      if (currentMissionSymbol === 'mooshika') {
                        sceneActions.updateState({ 
                          phase: PHASES.MOOSHIKA_SEARCH,
                          moundStates: [0, 0, 0, 0, 0],
                          correctMound: Math.floor(Math.random() * 5) + 1,
                          mooshikaVisible: false,
                          mooshikaFound: false,
                          moundsVanished: false,
                          moundsVanishing: false,
                          showMooshikaText: false
                        });
                      } else if (currentMissionSymbol === 'modak') {
                        sceneActions.updateState({ 
                          phase: PHASES.MODAKS_UNLOCKED,
                          modakStates: [0, 0, 0],
                          collectedModaks: [],
                          basketVisible: true,
                          basketFull: false,
                          basketReady: false,
                          showModakText: false
                        });
                      } else if (currentMissionSymbol === 'belly') {
                        sceneActions.updateState({ 
                          phase: PHASES.ROCK_VISIBLE,
                          rockVisible: true,
                          rockFeedCount: 0,
                          rockTransformed: false,
                          rockBellySize: 0,
                          showBellyText: false,
                          collectedModaks: [0, 1, 2],
                          basketFull: true,
                          basketVisible: true
                        });
                      }
                    }}
                  >
                    Play Again
                  </button>
                  
                  <button 
                    className="modak-game-power-secondary-button"
                    onClick={() => {
                      setShowPowerModal(false);
                      handleContinueLearning();
                    }}
                  >
                    {getNextDiscoveryText(currentMissionSymbol)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* START OF NEW OVERLAY BLOCK for SymbolPowerMission */}
          {showPowerMission && (
            // Dark background overlay for SymbolPowerMission
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(3px)',
              zIndex: 499, // Lower than the Power Modal (500) but higher than the scene (e.g. 200)
              animation: 'modak-game-fadeIn 0.3s ease-out'
            }} />
          )}
          {/* END OF NEW OVERLAY BLOCK */}
              
          <SymbolPowerMission
            show={showPowerMission}
            symbolKey={currentMissionSymbol}
            beforeImage={missionImages[currentMissionSymbol]?.before}
            afterImage={missionImages[currentMissionSymbol]?.after}
            powerConfig={powerConfig[currentMissionSymbol]}
            onComplete={handleMissionComplete}
            onCancel={() => {
              setShowPowerMission(false);
              setShowPowerModal(true); // Return to modal after cancel
            }}
          />

          {/* NAVIGATION */}
          <TocaBocaNav
            onHome={() => {
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
        
              setShowCulturalCelebration(true);
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
            
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            onStartFresh={() => resetScene()}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
              total: 1
            }}
          />

          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
            {...CulturalProgressExtractor.getCulturalProgressData()}
          />

           {sceneState.welcomeShown && (
            <SymbolSidebar 
              discoveredSymbols={sceneState.discoveredSymbols || {}}
              onSymbolClick={(symbolId) => {
                console.log(`Sidebar symbol clicked: ${symbolId}`);
              }}
            />
          )}
        
        </div>       
      </MessageManager>
    </InteractionManager>
  );
};

export default NewModakScene;
