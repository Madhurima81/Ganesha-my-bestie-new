// zones/symbol-mountain/scenes/modak/NewModakSceneV7_MVP.jsx
// MVP Version: Voice-guided, minimal UI (no header, no help menu)
// Like Khan Academy Kids / Lingokids approach

import React, { useState, useEffect, useRef } from 'react';
import './ModakScene.css';
import '../../../shared/components/OpeningModal.css';
import '../../../../lib/styles/zone-themes.css';

// Unified Components (keep buttons/modals, remove header)
import UnifiedButtonV2 from '../../../../lib/components/ui/Button/UnifiedButtonV2';
import UnifiedModal from '../../../../lib/components/ui/Modal/UnifiedModal';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';

// Content Configs
import {
  getOpeningModal
} from '../../../../lib/config/content';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay';
import { PauseButton, PauseMenu } from '../../../../lib/components/ui/PauseMenu'; // ✅ Shared Pause Components

// Images
import forestBackground from './assets/images/forest-background.png';
import modak1 from './assets/images/modak-1.png';
import modak2 from './assets/images/modak-2.png';
import modak3 from './assets/images/modak-3.png';
import basket from './assets/images/basket.png';
import mooshika from '../../shared/images/icons/symbol-mooshika-colored.png';
import mudMound from './assets/images/mud-mound.png';
import rock from './assets/images/rock.png';
import belly from './assets/images/belly.png';
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
import mooshikaBefore from './assets/images/mooshika-before.png';
import mooshikaAfter from './assets/images/mooshika-after.png';
import modakBefore from './assets/images/modak-before.png';
import modakAfter from './assets/images/modak-after.png';
import bellyBefore from './assets/images/belly-before.png';
import bellyAfter from './assets/images/belly-after.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

// ========================================
// VO-GATED BUTTON COMPONENT
// ========================================
const VOGatedButton = ({
  visible,
  onClick,
  children,
  className = '',
  style = {}
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...style,
        animation: 'buttonFadeIn 0.35s ease-out',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {children}
      <style>{`
        @keyframes buttonFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </button>
  );
};

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

const NewModakSceneMVP = ({
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
          <NewModakSceneMVPContent
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

const NewModakSceneMVPContent = ({
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

  // ========================================
  // VOICE GUIDANCE HOOK
  // ========================================
  const {
    playVoice,
    stopVoice,
    playSfx,
    playTap,
    playCorrect,
    playWrong,
    playCelebration,
    playPowerUnlock,
    startMusic,
    stopMusic,
    startIdleTimer,
    stopIdleTimer,
    setCurrentPhase,
    recordInteraction
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: true,
    musicVolume: 0.2,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 10
  });

  // Get content from configs
  const openingModalContent = getOpeningModal(zoneId, sceneId);

  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showMooshikaSpeech, setShowMooshikaSpeech] = useState(false);
  const [mooshikaSpeechMessage, setMooshikaSpeechMessage] = useState('');

  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);
  const [showDiscoveryFlip3, setShowDiscoveryFlip3] = useState(false);

  // ========================================
  // PAUSE MENU STATE
  // ========================================
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // ========================================
  // VO-GATED STATE MACHINE
  // Listen = VO playing, no button
  // Ready = VO done, button visible
  // ========================================
  const [appState, setAppState] = useState('listen'); // 'listen' | 'ready' | 'play'
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [discoveryButtonVisible, setDiscoveryButtonVisible] = useState(false);

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

  const timeoutsRef = useRef([]);

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
      stopMusic();
      stopIdleTimer();
    };
  }, []);

  // ========================================
  // RELOAD / RESUME LOGIC
  // Handles resetting partial progress or restoring popups
  // ========================================
  useEffect(() => {
    if (!sceneState) return;

    // 1. RESET PARTIAL MOUND SEARCH
    // If user clicked some mounds but didn't find Mooshika, reset to start.
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH && sceneState.welcomeShown) {
      const hasClicks = sceneState.moundStates?.some(state => state === 1);
      if (hasClicks) {
        sceneActions.updateState({
          moundStates: [0, 0, 0, 0, 0] // Reset all mounds
        });
      }
    }

    // 2. RESTORE MOOSHIKA POPUP (Power Unlock 1)
    // If Mooshika is found but we haven't unlocked modaks yet, show the popup again.
    if (sceneState.phase === PHASES.MOOSHIKA_FOUND) {
      setShowDiscoveryFlip1(true);
    }

    // 3. RESET PARTIAL MODAK COLLECTION
    // If user collected 1 or 2 modaks (but not 3), reset them to the forest.
    if (sceneState.phase === PHASES.SOME_COLLECTED) {
      sceneActions.updateState({
        phase: PHASES.MODAKS_UNLOCKED,
        collectedModaks: [],
        modakStates: [0, 0, 0], // All visible in forest
        basketFull: false,
        progress: { percentage: 30 } // Reset progress bar visual
      });
      // Replay collect instruction VO on reload
      setTimeout(() => {
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        startIdleTimer();
      }, 500);
    }

    // 3b. REPLAY VO for modak collection phase on reload
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED && sceneState.modaksUnlocked) {
      setTimeout(() => {
        playVoice('collectStart');
        setCurrentPhase('collectModaks');
        startIdleTimer();
      }, 500);
    }

    // 4. RESTORE MODAK POPUP (Power Unlock 2)
    // If all modaks collected but rock isn't visible yet, show the popup again.
    if (sceneState.phase === PHASES.ALL_COLLECTED && !sceneState.rockVisible) {
      setShowDiscoveryFlip2(true);
    }

    // 5. RESET PARTIAL FEEDING
    // If user fed 1 or 2 modaks to the rock, refill the basket to start feeding over.
    if (sceneState.phase === PHASES.ROCK_FEEDING) {
      sceneActions.updateState({
        phase: PHASES.ROCK_VISIBLE, // Go back to step before feeding
        rockFeedCount: 0,
        rockBellySize: 0,
        collectedModaks: [0, 1, 2], // Refill basket with 3 modaks
        basketFull: true
      });
      // Replay feed instruction VO on reload
      setTimeout(() => {
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        startIdleTimer();
      }, 500);
    }

    // 5b. REPLAY VO for feeding phase on reload
    if (sceneState.phase === PHASES.ROCK_VISIBLE && sceneState.rockVisible) {
      setTimeout(() => {
        playVoice('feedGanesha');
        setCurrentPhase('shareWithGanesha');
        startIdleTimer();
      }, 500);
    }

    // 6. RESTORE BELLY POPUP & FIREWORKS (Power Unlock 3)
    // If rock is transformed but scene isn't marked 'completed', user was likely
    // watching fireworks or the final popup. Show popup again to replay the ending.
    if (sceneState.phase === PHASES.ROCK_TRANSFORMED && !sceneState.completed) {
      setShowDiscoveryFlip3(true);
    }

  }, []); // Empty dependency array ensures this runs only ONCE on reload

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button appears only after VO finishes
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is MOOSHIKA_SEARCH and not yet started)
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown) {
      // Small delay before starting welcome VO
      const timer = setTimeout(() => {
        playVoice('welcome', () => {
          // VO finished - show the button with fade-in
          playSfx('chime'); // Ready cue sound
          setOpeningButtonVisible(true);
          setAppState('ready');
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown]);

  // ========================================
  // VOICE: Play instruction after game starts
  // ========================================
  useEffect(() => {
    if (sceneState.welcomeShown && sceneState.phase === PHASES.MOOSHIKA_SEARCH) {
      // Start background music
      startMusic();
      // Play find mooshika instruction
      setTimeout(() => {
        playVoice('findMooshika');
        setCurrentPhase('findMooshika');
        setAppState('play');
        startIdleTimer();
      }, 500);
    }
  }, [sceneState.welcomeShown]);

  // Update phase for idle hints AND restart idle timer
  useEffect(() => {
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED || sceneState.phase === PHASES.SOME_COLLECTED) {
      setCurrentPhase('collectModaks');
      // Restart idle timer for this phase
      stopIdleTimer();
      startIdleTimer();
    } else if (sceneState.phase === PHASES.ROCK_VISIBLE || sceneState.phase === PHASES.ROCK_FEEDING) {
      setCurrentPhase('shareWithGanesha');
      // Restart idle timer for this phase
      stopIdleTimer();
      startIdleTimer();
    } else if (sceneState.phase === PHASES.ROCK_TRANSFORMED || sceneState.phase === PHASES.COMPLETE) {
      // Scene is ending - stop idle timer and clear phase
      stopIdleTimer();
      setCurrentPhase(null);
    }
  }, [sceneState.phase]);

  // Repeating auto-glow hint — first glow at 20s, then pulse off/on every 12-15s
  useEffect(() => {
    let firstTimer;
    let repeatTimer;

    const glowPhases = [
      PHASES.MOOSHIKA_SEARCH,
      PHASES.MODAKS_UNLOCKED,
      PHASES.ROCK_VISIBLE
    ];

    if (glowPhases.includes(sceneState?.phase) && sceneState?.welcomeShown) {
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
  }, [sceneState?.phase, sceneState?.welcomeShown]);

  // ========================================
  // FIX: Handle Discovery Overlay Logic via useEffect
  // ========================================
  
  // 1. Handle Focus Power (Mooshika) Overlay
  useEffect(() => {
    if (showDiscoveryFlip1) {
      // Ensure button is hidden initially
      setDiscoveryButtonVisible(false);
      
      // Add a small delay to allow modal to animate in, then play VO
      const timer = setTimeout(() => {
        playVoice('focusPower', () => {
          playSfx('chime');
          setDiscoveryButtonVisible(true); // Show button when VO ends
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip1]);

  // 2. Handle Sharing Power (Modak) Overlay
  useEffect(() => {
    if (showDiscoveryFlip2) {
      setDiscoveryButtonVisible(false);
      
      const timer = setTimeout(() => {
        playVoice('sharingPower', () => {
          playSfx('chime');
          setDiscoveryButtonVisible(true);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip2]);

  // 3. Handle Gratitude Power (Belly) Overlay
  useEffect(() => {
    if (showDiscoveryFlip3) {
      // Stop idle timer - scene is essentially complete
      stopIdleTimer();
      setDiscoveryButtonVisible(false);

      const timer = setTimeout(() => {
        playVoice('gratitudePower', () => {
          playSfx('chime');
          setDiscoveryButtonVisible(true);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryFlip3]);


 const handleMoundClick = (moundIndex) => {
    recordInteraction();
    playTap(); // SFX only

    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.MOOSHIKA_SEARCH) return;

    const moundStates = [...(sceneState.moundStates || [0, 0, 0, 0, 0])];
    moundStates[moundIndex - 1] = 1;

    if (moundIndex === sceneState.correctMound) {
      // 1. STOP THE SEARCH VOICE IMMEDIATELY
      stopVoice(); // Cut any playing VO so it doesn't overlap with success sound
      stopIdleTimer();
      stopMusic(); // Optional: Dip music volume if you have that capability, or stop it

      // 2. PLAY SUCCESS VOICE (The "Yay" moment)
      playCorrect('mooshikaFound'); 
      setShowSparkle('mooshika-found');

      const moundPositions = { 1: { top: '45%', left: '25%' }, 2: { top: '55%', left: '75%' }, 3: { top: '60%', left: '30%' }, 4: { top: '60%', left: '50%' }, 5: { top: '60%', left: '60%' } };

      sceneActions.updateState({
        mooshikaVisible: true,
        mooshikaFound: true,
        mooshikaPosition: moundPositions[moundIndex],
        moundStates,
        phase: PHASES.MOOSHIKA_FOUND,
        moundsVanishing: true
      });

      // AUTO-PARK VISUALS
      setTimeout(() => {
        sceneActions.updateState({
          mooshikaPosition: { top: '48%', left: '45%' }
        });
        // Tiny speech bubble for visual flavor
        setTimeout(() => {
          //setMooshikaSpeechMessage("I'll wait here! Find the Modaks!");
          setShowMooshikaSpeech(true);
          setTimeout(() => setShowMooshikaSpeech(false), 3000);
        }, 500);
      }, 1500);

      // 3. THE GAP: INCREASE DELAY TO 4000ms (4 seconds)
      // This allows "Yay found him" to finish before "Focus Power" starts
      setTimeout(() => {
        setShowDiscoveryFlip1(true);
      }, 6000); 

    } else {
      // Wrong mound - stop any idle hint VO, then play SFX + VO
      stopVoice();
      playWrong();
      playVoice('wrongTap'); // Add voice feedback
      setShowSparkle(`mound-${moundIndex}`);
      sceneActions.updateState({ moundStates });
      setTimeout(() => setShowSparkle(null), 1000);
    }
  };

  const handleModakClick = (modakIndex) => {
    recordInteraction();
    stopVoice(); // Cut any playing VO (idle hint / collect instruction) before tap SFX
    playTap();

    if (!sceneState.modaksUnlocked) return;
    if (sceneState.modakStates[modakIndex] === 1) return;

    const modakStates = [...sceneState.modakStates];
    modakStates[modakIndex] = 1;

    const collectedModaks = [...(sceneState.collectedModaks || [])];
    collectedModaks.push(modakIndex);

    setShowSparkle(`modak-${modakIndex}`);
    setTimeout(() => setShowSparkle(null), 1000);

    const collectedCount = collectedModaks.length;

    // Play progress voice
    if (collectedCount === 1) {
      playCorrect('collectProgress1');
    } else if (collectedCount === 2) {
      playCorrect('collectProgress2');
    }

    if (collectedCount === 3) {
      // Stop idle timer during transition
      stopIdleTimer();

      playSfx('celebration');
      // Show celebration sparkles immediately
      setShowSparkle('modaks-complete');

      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 50, starsEarned: 4 }
      });

      setTimeout(() => {
        sceneActions.updateState({
          basketFull: true,
          phase: PHASES.ALL_COLLECTED
        });
        // Play collect complete voice
        playVoice('collectComplete');
      }, 1000);

      // Clear sparkle before overlay
      setTimeout(() => {
        setShowSparkle(null);
      }, 4000);

      // Trigger Discovery Flip 2 (after VO finishes ~5s)
      setTimeout(() => {
        setShowDiscoveryFlip2(true);
      }, 5500);
    } else {
      sceneActions.updateState({
        modakStates,
        collectedModaks,
        phase: PHASES.SOME_COLLECTED,
        progress: { percentage: 30 + (10 * collectedCount) }
      });
    }
  };

  // Handle drop on rock/belly - DropZone callback
  const handleRockFeed = ({ id, data }) => {
    console.log('🎯 Modak dropped on rock:', id, data);

    if (!sceneState.rockVisible || sceneState.rockFeedCount >= 3) return;
    if (!data || data.type !== 'basket-modak') return;

    const modakIndex = data.index;
    recordInteraction();
    stopVoice(); // Cut any playing VO (idle hint / feed instruction) before feed SFX
    playTap();

    const newCollectedModaks = sceneState.collectedModaks.filter(i => i !== modakIndex);
    const newFeedCount = sceneState.rockFeedCount + 1;
    const newBellySize = newFeedCount * 33.33;

    setShowSparkle('rock-feeding');
    playSfx('pop');

    sceneActions.updateState({
      collectedModaks: newCollectedModaks,
      rockFeedCount: newFeedCount,
      rockBellySize: newBellySize,
      phase: PHASES.ROCK_FEEDING,
      progress: { percentage: 60 + (10 * newFeedCount) }
    });

    // Play feeding progress VO
    if (newFeedCount === 1) {
      playVoice('feedProgress1');
    } else if (newFeedCount === 2) {
      playVoice('feedProgress2');
    }

    if (newFeedCount >= 3) {
      setTimeout(() => {
        setShowSparkle('belly-transform');
        // Play feed complete then belly happy
        playVoice('feedComplete', () => {
          playCelebration('bellyHappy');
        });

        sceneActions.updateState({
          rockTransformed: true,
          phase: PHASES.ROCK_TRANSFORMED
        });

        // Trigger Discovery Flip 3
        setTimeout(() => {
          setShowDiscoveryFlip3(true);
        }, 3500);

      }, 1500);
    } else {
      setTimeout(() => setShowSparkle(null), 1500);
    }
  };

  const resetScene = () => {
    stopIdleTimer();

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
    setShowHintGlow(false);
    setShowDiscoveryFlip1(false);
    setShowDiscoveryFlip2(false);
    setShowDiscoveryFlip3(false);
    setShowSceneCompletion(false);
  };

  const getModakImage = (index) => {
    const modakImages = [modak1, modak2, modak3];
    return modakImages[index] || modak1;
  };

  // ========================================
  // MVP RENDER - No GameLayout, No Header
  // ========================================
  return (
    <div data-zone="symbol-mountain">
      {/* Pause Button - Always visible after welcome screen */}
      <PauseButton
        visible={sceneState.welcomeShown}
        onClick={() => setShowPauseMenu(true)}
      />

      {/* Pause Menu */}
      <PauseMenu
        show={showPauseMenu}
        onResume={() => setShowPauseMenu(false)}
        onBackToMap={() => {
          setShowPauseMenu(false);
          stopMusic();
          onNavigate?.('zones');
        }}
        isSoundOn={isSoundOn}
        onSoundToggle={() => {
          setIsSoundOn(!isSoundOn);
          if (isSoundOn) {
            stopMusic();
          } else {
            startMusic();
          }
        }}
        zoneName="Symbol Mountain"
      />

      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="modak-game-container">
            <div className="modak-game-background" style={{ backgroundImage: `url(${forestBackground})` }}>

              {/* --- OPENING MODAL --- */}
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
                  <div className="modak-game-sparkles">
                    <div className="modak-game-sparkle"></div>
                    <div className="modak-game-sparkle"></div>
                    <div className="modak-game-sparkle"></div>
                    <div className="modak-game-sparkle"></div>
                  </div>

                  <div className="game-modal-content">
                    <div className="game-modal-character">
                      <img
                        src={ganeshaCharacter}
                        alt="Ganesha Character"
                      />
                    </div>

                    <div className="game-modal-card">
                      <h1 className="game-modal-title">
                        {openingModalContent?.title || 'Help Ganesha Save the Forest!'}
                      </h1>

                      <p className="game-modal-subtitle">
                        {openingModalContent?.subtitle || '3 magical friends are hiding — let us find them!'}
                      </p>

                      <div className="game-modal-icons">
                        <div className="game-modal-icon-item">
                          <img
                            src={symbolMooshikaColored}
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

                      {/* VO-Gated Button - Only visible after welcome VO finishes */}
                      <VOGatedButton
                        visible={openingButtonVisible}
                        onClick={() => {
                          playSfx('tap');
                          setOpeningButtonVisible(false);
                          sceneActions.updateState({ welcomeShown: true });
                        }}
                        className="game-modal-button"
                      >
                        {openingModalContent?.buttonText || 'Begin Adventure!'}
                      </VOGatedButton>
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

              {/* MODAKS COMPLETE CELEBRATION SPARKLES */}
              {showSparkle === 'modaks-complete' && (
                <>
                  <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', zIndex: 20 }}>
                    <SparkleAnimation type="glitter" count={30} color="#ffd700" size={14} duration={3500} fadeOut={true} area="full" />
                  </div>
                  <div style={{ position: 'absolute', top: '35%', left: '20%', width: '100px', height: '100px', zIndex: 20 }}>
                    <SparkleAnimation type="star" count={20} color="#FFD700" size={12} duration={3000} fadeOut={true} area="full" />
                  </div>
                  <div style={{ position: 'absolute', top: '35%', right: '20%', width: '100px', height: '100px', zIndex: 20 }}>
                    <SparkleAnimation type="star" count={20} color="#FFD700" size={12} duration={3000} fadeOut={true} area="full" />
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
                  </div>
                </div>
              )}

              {sceneState.collectedModaks?.map((modakIndex, displayIndex) => {
                const canDrag = sceneState.rockVisible && sceneState.rockFeedCount < 3;

                return (
                  <div
                    key={`collected-${modakIndex}-${displayIndex}`}
                    className={`modak-game-modak modak-game-modak-collected-${displayIndex + 1}
                      ${showHintGlow && sceneState.rockVisible ? 'modak-game-hint-glow' : ''}`}
                    style={{
                      position: 'absolute',
                      top: `${42 + displayIndex * 3}%`,
                      left: `${14 + displayIndex * 2}%`,
                      zIndex: 15,
                      animation: 'modak-game-modakToBasket 0.8s ease-out'
                    }}
                  >
                    <DraggableItem
                      id={`basket-modak-${modakIndex}`}
                      data={{ type: 'basket-modak', index: modakIndex }}
                      disabled={!canDrag}
                      onDragStart={(id, data) => {
                        console.log('Dragging from basket:', id, data);
                        recordInteraction();
                      }}
                      onDragEnd={(id) => console.log('Basket drag ended:', id)}
                    >
                      <img
                        src={getModakImage(modakIndex)}
                        alt={`Collected Modak ${modakIndex + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          filter: 'brightness(1.1) saturate(1.2)',
                          cursor: canDrag ? 'grab' : 'default'
                        }}
                      />
                    </DraggableItem>
                    <SparkleAnimation type="star" count={8} color="#ffd700" size={6} duration={1500} fadeOut={true} area="full" />
                  </div>
                );
              })}

              {/* ROCK/BELLY - Drop zone for feeding */}
              {sceneState.rockVisible && (
                <div className="modak-game-rock-container breathing">
                  <DropZone
                    id="feeding-rock"
                    acceptTypes={['basket-modak']}
                    onDrop={handleRockFeed}
                    disabled={sceneState.rockFeedCount >= 3}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%'
                    }}
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
                  </DropZone>

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
                <div style={{ position: 'absolute', top: '25%', left: '30%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FF69B4" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}
              {showSparkle === 'modak-to-sidebar' && (
                <div style={{ position: 'absolute', top: '40%', right: '25%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FFD700" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}
              {showSparkle === 'belly-to-sidebar' && (
                <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FF8C42" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
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
                sceneName="Mooshika's Modak Mission"
                sceneNumber={1}
                totalScenes={4}
                starsEarned={3}
                totalStars={3}
                discoveredSymbols={['mooshika', 'modak', 'belly']}
                symbolImages={{
                  mooshika: symbolMooshikaColored,
                  modak: symbolModakColored,
                  belly: symbolBellyColored
                }}
                nextSceneName="Next Symbol Mountain Adventure"
                sceneId="modak"
                completionData={{
                  stars: 3,
                  symbols: { mooshika: true, modak: true, belly: true },
                  completed: true
                }}
                showFireworks={true}
                onComplete={onComplete}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onNextScene={() => {
                  console.log("Next scene clicked");
                  onNavigate?.('zones');
                }}
              />
            )}

          {/* DISCOVERY 1: Found Mooshika */}
            {/* POWER UNLOCK 1: Focus Power (Mooshika) */}
            {showDiscoveryFlip1 && (
              <PowerUnlockOverlay
                title="Focus Power Unlocked!"
         description={{
      main: [
        "Sometimes our mind runs everywhere like a tiny mouse!",
        "But when it's time to learn or play, we can bring it back."
      ],
      emphasis: "Say with me: I can focus!"
    }}
                icon={symbolMooshikaColored}
                iconColor="#FF69B4"
                buttonText="Let's Collect Modaks!"
                showButton={discoveryButtonVisible} 
                // onShow removed - handled by useEffect
                onComplete={() => {
                  console.log("Power 1: Focus Power unlocked");
                  setShowDiscoveryFlip1(false);
                  setDiscoveryButtonVisible(false);
                  playVoice('collectStart');
                  setShowSparkle('modaks-appearing');
                  setTimeout(() => {
                    sceneActions.updateState({
                      phase: PHASES.MODAKS_UNLOCKED,
                      modaksUnlocked: true,
                      basketVisible: true,
                      discoveredSymbols: { ...sceneState.discoveredSymbols, mooshika: true }
                    });
                    setTimeout(() => setShowSparkle(null), 2000);
                  }, 500);
                }}
              />
            )}

            {/* DISCOVERY 2: Collected Modaks */}
            {/* POWER UNLOCK 2: Sharing Power (Modak) */}
            {showDiscoveryFlip2 && (
              <PowerUnlockOverlay
                title="Sweet Reward Earned!"
                
                description="You searched carefully and found all the modaks!

Sweet rewards come when we try our best."
                icon={symbolModakColored}
                iconColor="#FFD700"
                buttonText="Let’s Share Them"
                showButton={discoveryButtonVisible}
                // onShow removed - handled by useEffect
                onComplete={() => {
                  console.log("Power 2: Sharing Power unlocked");
                  setShowDiscoveryFlip2(false);
                  setDiscoveryButtonVisible(false);
                  // Play feeding intro VO
                  playVoice('feedGanesha');
                  sceneActions.updateState({
                    phase: PHASES.ROCK_VISIBLE,
                    basketReady: true,
                    rockVisible: true,
                    discoveredSymbols: { ...sceneState.discoveredSymbols, modak: true }
                  });
                }}
              />
            )}

            {/* POWER UNLOCK 3: Gratitude Power (Belly) */}
            {showDiscoveryFlip3 && (
              <PowerUnlockOverlay
                title="Sharing Power Unlocked!"
              description={{
      main: [
        "You chose to share your sweets with me.",
        "That shows a kind heart."
      ],
      emphasis: "Say with me: I am kind!"
    }}
                icon={symbolBellyColored}
                iconColor="#FF8C42"
                buttonText="Celebrate!"
                showButton={discoveryButtonVisible}
                // onShow removed - handled by useEffect
                onComplete={() => {
                  console.log("Power 3: Gratitude Power unlocked");
                  setShowDiscoveryFlip3(false);
                  setDiscoveryButtonVisible(false);
                  playVoice('sceneComplete');
                  sceneActions.updateState({
                    discoveredSymbols: { ...sceneState.discoveredSymbols, belly: true }
                  });
                  setShowSparkle('final-fireworks');
                }}
              />
            )}

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
    </div>
  );
};

export default NewModakSceneMVP;
