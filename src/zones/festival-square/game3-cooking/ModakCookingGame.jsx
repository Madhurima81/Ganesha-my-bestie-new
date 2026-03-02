import React, { useState, useEffect, useRef } from 'react';
import OpeningModal from '../../../shared/components/OpeningModal.jsx';
import './ModakCookingGame.css';
import '../../shared/components/OpeningModal.css';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../lib/config/content/openingModals';

// Import scene management components
import SceneManager from '../../../lib/components/scenes/SceneManager';
import useSceneReset from '../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../lib/config/SceneResetConfigs';
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Import completion component
import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import HomeButton from '../../../lib/components/ui/HomeButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

// Import assets
import cookingBg from './assets/images/cooking-bg.png';
import brassMixingBowlEmpty from './assets/images/brass-mixing-bowl-empty.png';
import brassMixingBowlCoconut from './assets/images/brass-mixing-bowl-coconut.png';
import brassMixingBowlCoconutJaggery from './assets/images/brass-mixing-bowl-coconut-jaggery.png';
import brassMixingBowlAllIngredients from './assets/images/brass-mixing-bowl-all-ingredients.png';
import coconutBowl from './assets/images/coconut-bowl.png';
import jaggeryBowl from './assets/images/jaggery-bowl.png';
import riceBowl from './assets/images/rice-bowl.png';
import perfectModakDough from './assets/images/perfect-modak-dough.png';
import woodenMold from './assets/images/wooden-mold.png';
import doughPortion from './assets/images/dough-portion.png';
import shapedModak from './assets/images/shaped-modak.png';
import perfectModak from './assets/images/perfect-modak.png';
import steamerLid from './assets/images/steamer-lid.png';
import cookedModak from './assets/images/cooked-modak.png';

import ganeshaChef from './assets/images/ganesha-chef.png';
import spoon from './assets/images/spoon.png';
import cookingBadge from './assets/images/cooking-badge.png';

// Import additional new assets for enhanced progressions
import brassBowlWithFlour from './assets/images/brass-bowl-with-flour.png';
import brassBowlFlourWater from './assets/images/brass-bowl-flour-water.png';
import doughBall from './assets/images/dough-ball.png';
import flatDough from './assets/images/flat-dough.png';
import doughCup from './assets/images/dough-cup.png';
import coconutJaggeryFilling from './assets/images/coconut-jaggery-filling.png';
import cupWithFilling from './assets/images/cup-with-filling.png';
import sealedModak from './assets/images/sealed-modak.png';
import emptyBrassSteamer from './assets/images/empty-brass-steamer.png';
import steamerWithModak from './assets/images/steamer-with-modak.png';
import steamEffect from './assets/images/steam-effect.png';
import mouseWithModak from './assets/images/mouse-with-modak.png';
import modaksOnPlate from './assets/images/modaks-on-plate.png';
import stepIconMix from './assets/images/step-icon-mix.png';
import stepIconDough from './assets/images/step-icon-dough.png';
import stepIconShape from './assets/images/step-icon-shape.png';
import stepIconFill from './assets/images/step-icon-fill.png';
import stepIconSteam from './assets/images/step-icon-steam.png';
import waterPot from './assets/images/water-pot.png';
import rollingMat from './assets/images/rolling-mat.png';
import helperMouse from './assets/images/helper-mouse.png';

// Game steps
const STEPS = {
  INTRODUCTION: 'introduction',
  MIX_FILLING: 'mix_filling',
  MAKE_DOUGH: 'make_dough',
  SHAPE_DOUGH: 'shape_dough',
  FILL_CLOSE: 'fill_close',
  STEAM_MODAKS: 'steam_modaks',
  COMPLETE: 'complete'
};

// Step configuration
const STEP_CONFIG = [
  {
    id: STEPS.MIX_FILLING,
    icon: stepIconMix,
    title: 'Mix Filling',
    actions: ['Add Coconut', 'Add Jaggery', 'Stir Mixture']
  },
  {
    id: STEPS.MAKE_DOUGH,
    icon: stepIconDough,
    title: 'Make Dough',
    actions: ['Add Rice Flour', 'Add Water', 'Mix Dough']
  },
  {
    id: STEPS.SHAPE_DOUGH,
    icon: stepIconShape,
    title: 'Shape Dough',
    actions: ['Place Dough', 'Flatten Dough', 'Shape Cup']
  },
  {
    id: STEPS.FILL_CLOSE,
    icon: stepIconFill,
    title: 'Fill & Close',
    actions: ['Add Filling', 'Seal Edges']
  },
  {
    id: STEPS.STEAM_MODAKS,
    icon: stepIconSteam,
    title: 'Steam Cook',
    actions: ['Add to Steamer', 'Close Lid', 'Wait for Steam']
  }
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

const ModakCookingGame = ({ onComplete, onNavigate, zoneId = 'festival-square', sceneId = 'game3' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Main phase
          currentStep: STEPS.INTRODUCTION,
          currentAction: 0,
          completedSteps: [],
          stars: 0,
          gameStartTime: Date.now(),
          completed: false,
          showDoneButton: false,
          welcomeShown: false,

          // Sub-states for each phase
          mixingState: {
            coconutAdded: false,
            jaggeryAdded: false,
            stirred: false,
            stirCount: 0
          },
          doughState: {
            flourAdded: false,
            waterAdded: false,
            mixed: false,
            mixCount: 0
          },
          shapingState: {
            doughPlaced: false,
            flattened: false,
            shaped: false
          },
          fillingState: {
            filled: false,
            sealed: false
          },
          steamingState: {
            inSteamer: false,
            lidClosed: false,
            steamed: false,
            timeLeft: 8,
            steamingStartedAt: null
          },

          // UI states
          showStepComplete: false,
          completedStepInfo: null
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <ModakCookingGameContent
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

const ModakCookingGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId }) => {
  if (!sceneState || !sceneActions) return <div className="loading">Loading...</div>;

  const { resetScene } = useSceneReset(sceneActions, 'festival-square', 'game3', getSceneResetConfig('game3'));

  // Local UI state (non-persisted)
  const [activeElement, setActiveElement] = useState(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMouseCelebration, setShowMouseCelebration] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');

  // Local mirrors of sceneState (for UI reactivity)
  const [mixingState, setMixingState] = useState(sceneState.mixingState);
  const [doughState, setDoughState] = useState(sceneState.doughState);
  const [shapingState, setShapingState] = useState(sceneState.shapingState);
  const [fillingState, setFillingState] = useState(sceneState.fillingState);
  const [steamingState, setSteamingState] = useState(sceneState.steamingState);

  // Helper mouse state
  const [helperState, setHelperState] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    message: '',
    celebrating: false
  });

  const timeoutsRef = useRef([]);
  const steamTimerRef = useRef(null);
  const reloadHandledRef = useRef(false);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // NEW: Update helper mouse position and message
  const updateHelper = (elementId, message, celebrate = false) => {
    const element = document.getElementById(elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHelperState({
        visible: true,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 60
        },
        message: message,
        celebrating: celebrate
      });
    }
  };

  const hideHelper = () => {
    setHelperState({
      visible: false,
      position: { x: 0, y: 0 },
      message: '',
      celebrating: false
    });
  };

  const showStepCompletion = (stepId) => {
    const stepIndex = STEP_CONFIG.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      const stepInfo = STEP_CONFIG[stepIndex];
      sceneActions.updateState({
        showStepComplete: true,
        completedStepInfo: {
          number: stepIndex + 1,
          title: stepInfo.title,
          icon: stepInfo.icon
        }
      });
      hideHelper();

      safeSetTimeout(() => {
        sceneActions.updateState({
          showStepComplete: false,
          completedStepInfo: null
        });
      }, 3000);
    }
  };

  // ==================== RELOAD HANDLING ====================
  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;

    console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.currentStep);
    reloadHandledRef.current = true;

    const phase = sceneState.currentStep;

    // INTRODUCTION: Show modal (auto-displays)
    if (phase === STEPS.INTRODUCTION) {
      return;
    }

    // COMPLETION: Show completion screen
    if (phase === STEPS.COMPLETE && sceneState.completed) {
      setShowSceneCompletion(true);
      return;
    }

    // Restore step completion overlay if it was showing
    if (sceneState.showStepComplete && sceneState.completedStepInfo) {
      // Skip overlay, move to next phase
      const currentIndex = STEP_CONFIG.findIndex(s => s.id === phase);
      if (currentIndex < STEP_CONFIG.length - 1) {
        sceneActions.updateState({
          currentStep: STEP_CONFIG[currentIndex + 1].id,
          showStepComplete: false
        });
      }
      return;
    }

    // Restore local state from sceneState
    setMixingState(sceneState.mixingState);
    setDoughState(sceneState.doughState);
    setShapingState(sceneState.shapingState);
    setFillingState(sceneState.fillingState);
    setSteamingState(sceneState.steamingState);

    // Phase-specific resume logic
    let message = "";

    switch (phase) {
      case STEPS.MIX_FILLING:
        if (!sceneState.mixingState.stirred) {
          if (!sceneState.mixingState.coconutAdded) {
            message = "🥥 Tap coconut to start!";
          } else if (!sceneState.mixingState.jaggeryAdded) {
            message = "🍯 Add jaggery next!";
          } else {
            message = `🥄 Stir ${sceneState.mixingState.stirCount}/3!`;
          }
        }
        break;

      case STEPS.MAKE_DOUGH:
        if (!sceneState.doughState.mixed) {
          if (!sceneState.doughState.flourAdded) {
            message = "🌾 Add rice flour!";
          } else if (!sceneState.doughState.waterAdded) {
            message = "💧 Add water next!";
          } else {
            message = `🥄 Mix ${sceneState.doughState.mixCount}/3!`;
          }
        }
        break;

      case STEPS.SHAPE_DOUGH:
        if (!sceneState.shapingState.shaped) {
          if (!sceneState.shapingState.doughPlaced) {
            message = "👆 Place dough on mat!";
          } else if (!sceneState.shapingState.flattened) {
            message = "🙌 Flatten the dough!";
          } else {
            message = "✋ Shape into a cup!";
          }
        }
        break;

      case STEPS.FILL_CLOSE:
        if (!sceneState.fillingState.sealed) {
          if (!sceneState.fillingState.filled) {
            message = "🥥 Add the filling!";
          } else {
            message = "🤏 Seal the edges!";
          }
        }
        break;

      case STEPS.STEAM_MODAKS:
        if (!sceneState.steamingState.steamed) {
          if (!sceneState.steamingState.inSteamer) {
            message = "👆 Place in steamer!";
          } else if (!sceneState.steamingState.lidClosed) {
            message = "🎩 Close the lid!";
          } else {
            // ⚠️ CRITICAL: Resume timer
            const timeLeft = sceneState.steamingState.timeLeft;
            message = `♨️ Steaming! ${timeLeft}s left`;

            // Resume countdown
            const interval = setInterval(() => {
              setSteamingState(prev => {
                const newTime = prev.timeLeft - 1;
                if (newTime <= 0) {
                  clearInterval(interval);
                  return { ...prev, timeLeft: 0, steamed: true };
                }
                return { ...prev, timeLeft: newTime };
              });

              sceneActions.updateState({
                steamingState: {
                  ...sceneState.steamingState,
                  timeLeft: sceneState.steamingState.timeLeft - 1
                }
              });
            }, 1000);
            steamTimerRef.current = interval;

            // Auto-complete after remaining time
            safeSetTimeout(() => {
              sceneActions.updateState({
                completedSteps: [...sceneState.completedSteps, STEPS.STEAM_MODAKS],
                currentStep: STEPS.COMPLETE,
                showDoneButton: true,
                steamingState: { ...sceneState.steamingState, steamed: true, timeLeft: 0 }
              });
            }, timeLeft * 1000);
          }
        }
        break;

      case STEPS.COMPLETE:
        if (sceneState.showDoneButton) {
          message = "🎉 Click 'All Done'!";
        }
        break;
    }

    // Show resume popup
    if (message) {
      setResumeMessage(message);
      setShowResumePopup(true);
      safeSetTimeout(() => setShowResumePopup(false), 5000);
    }

    // Mark welcome as shown after first interaction
    if (!sceneState.welcomeShown && phase !== STEPS.INTRODUCTION) {
      sceneActions.updateState({ welcomeShown: true });
    }

  }, [isReload, sceneState.currentStep]);

  // Update helper based on game state
  useEffect(() => {
    if (sceneState.currentStep === STEPS.INTRODUCTION) {
      hideHelper();
      return;
    }

    switch (sceneState.currentStep) {
      case STEPS.MIX_FILLING:
        if (!mixingState.coconutAdded) {
          updateHelper('coconut-bowl', '🥥 Tap coconut!');
        } else if (!mixingState.jaggeryAdded) {
          updateHelper('jaggery-bowl', '🍯 Add jaggery!');
        } else if (!mixingState.stirred) {
          updateHelper('spoon-tool', `🥄 Stir ${mixingState.stirCount}/3!`);
        } else {
          hideHelper();
        }
        break;

      case STEPS.MAKE_DOUGH:
        if (!doughState.flourAdded) {
          updateHelper('rice-bowl', '🌾 Add flour!');
        } else if (!doughState.waterAdded) {
          updateHelper('water-pot', '💧 Add water!');
        } else if (!doughState.mixed) {
          updateHelper('spoon-tool', `🥄 Mix ${doughState.mixCount}/3!`);
        } else {
          hideHelper();
        }
        break;

      case STEPS.SHAPE_DOUGH:
        if (!shapingState.doughPlaced) {
          updateHelper('dough-ball', '👆 Place dough!');
        } else if (!shapingState.flattened) {
          updateHelper('rolling-mat', '🙌 Flatten it!');
        } else if (!shapingState.shaped) {
          updateHelper('wooden-mold', '✋ Shape cup!');
        } else {
          hideHelper();
        }
        break;

      case STEPS.FILL_CLOSE:
        if (!fillingState.filled) {
          updateHelper('coconut-jaggery-filling', '🥥 Add filling!');
        } else if (!fillingState.sealed) {
          updateHelper('cup-with-filling', '🤏 Seal edges!');
        } else {
          hideHelper();
        }
        break;

      case STEPS.STEAM_MODAKS:
        if (!steamingState.inSteamer) {
          updateHelper('sealed-modak', '👆 Into steamer!');
        } else if (!steamingState.lidClosed) {
          updateHelper('steamer-lid', '🎩 Close lid!');
        } else {
          hideHelper();
        }
        break;

      default:
        hideHelper();
    }
  }, [sceneState.currentStep, mixingState, doughState, shapingState, fillingState, steamingState]);

  // Handle interactions with celebration
  const handleCoconutClick = () => {
    if (!mixingState.coconutAdded) {
      const newMixingState = { ...mixingState, coconutAdded: true };
      setMixingState(newMixingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      // ✅ SYNC TO SCENEMANAGER
      sceneActions.updateState({
        mixingState: newMixingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleJaggeryClick = () => {
    if (mixingState.coconutAdded && !mixingState.jaggeryAdded) {
      const newMixingState = { ...mixingState, jaggeryAdded: true };
      setMixingState(newMixingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        mixingState: newMixingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleStirClick = () => {
    if (mixingState.coconutAdded && mixingState.jaggeryAdded && !mixingState.stirred) {
      const newStirCount = mixingState.stirCount + 1;
      const newMixingState = { ...mixingState, stirCount: newStirCount };
      setMixingState(newMixingState);

      sceneActions.updateState({
        mixingState: newMixingState
      });

      if (newStirCount >= 3) {
        const finalMixingState = { ...newMixingState, stirred: true };
        setMixingState(finalMixingState);
        setHelperState(prev => ({ ...prev, celebrating: true }));

        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));

          sceneActions.updateState({
            mixingState: finalMixingState,
            stars: sceneState.stars + 1,
            completedSteps: [...sceneState.completedSteps, STEPS.MIX_FILLING]
          });

          // Show step completion
          showStepCompletion(STEPS.MIX_FILLING);

          // Move to next step after celebration
          safeSetTimeout(() => {
            sceneActions.updateState({ currentStep: STEPS.MAKE_DOUGH });
          }, 3000);
        }, 500);
      } else {
        setHelperState(prev => ({ ...prev, celebrating: true }));
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
        }, 300);
      }
    }
  };

  const handleFlourClick = () => {
    if (!doughState.flourAdded) {
      const newDoughState = { ...doughState, flourAdded: true };
      setDoughState(newDoughState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        doughState: newDoughState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleWaterClick = () => {
    if (doughState.flourAdded && !doughState.waterAdded) {
      const newDoughState = { ...doughState, waterAdded: true };
      setDoughState(newDoughState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        doughState: newDoughState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleDoughMixClick = () => {
    if (doughState.flourAdded && doughState.waterAdded && !doughState.mixed) {
      const newMixCount = doughState.mixCount + 1;
      const newDoughState = { ...doughState, mixCount: newMixCount };
      setDoughState(newDoughState);

      sceneActions.updateState({
        doughState: newDoughState
      });

      if (newMixCount >= 3) {
        const finalDoughState = { ...newDoughState, mixed: true };
        setDoughState(finalDoughState);
        setHelperState(prev => ({ ...prev, celebrating: true }));

        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));

          sceneActions.updateState({
            doughState: finalDoughState,
            stars: sceneState.stars + 1,
            completedSteps: [...sceneState.completedSteps, STEPS.MAKE_DOUGH]
          });

          // Show step completion
          showStepCompletion(STEPS.MAKE_DOUGH);

          // Move to next step after celebration
          safeSetTimeout(() => {
            sceneActions.updateState({ currentStep: STEPS.SHAPE_DOUGH });
          }, 3000);
        }, 500);
      } else {
        setHelperState(prev => ({ ...prev, celebrating: true }));
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
        }, 300);
      }
    }
  };

  const handleDoughPlaceClick = () => {
    if (!shapingState.doughPlaced) {
      const newShapingState = { ...shapingState, doughPlaced: true };
      setShapingState(newShapingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        shapingState: newShapingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleFlattenClick = () => {
    if (shapingState.doughPlaced && !shapingState.flattened) {
      const newShapingState = { ...shapingState, flattened: true };
      setShapingState(newShapingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        shapingState: newShapingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleShapeClick = () => {
    if (shapingState.flattened && !shapingState.shaped) {
      const finalShapingState = { ...shapingState, shaped: true };
      setShapingState(finalShapingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));

        sceneActions.updateState({
          shapingState: finalShapingState,
          stars: sceneState.stars + 1,
          completedSteps: [...sceneState.completedSteps, STEPS.SHAPE_DOUGH]
        });

        // Show step completion
        showStepCompletion(STEPS.SHAPE_DOUGH);

        // Move to next step after celebration
        safeSetTimeout(() => {
          sceneActions.updateState({ currentStep: STEPS.FILL_CLOSE });
        }, 3000);
      }, 500);
    }
  };

  const handleFillingClick = () => {
    if (!fillingState.filled) {
      const newFillingState = { ...fillingState, filled: true };
      setFillingState(newFillingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        fillingState: newFillingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleSealClick = () => {
    if (fillingState.filled && !fillingState.sealed) {
      const finalFillingState = { ...fillingState, sealed: true };
      setFillingState(finalFillingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));

        sceneActions.updateState({
          fillingState: finalFillingState,
          stars: sceneState.stars + 1,
          completedSteps: [...sceneState.completedSteps, STEPS.FILL_CLOSE]
        });

        // Show step completion
        showStepCompletion(STEPS.FILL_CLOSE);

        // Move to next step after celebration
        safeSetTimeout(() => {
          sceneActions.updateState({ currentStep: STEPS.STEAM_MODAKS });
        }, 3000);
      }, 500);
    }
  };

  const handleSteamerPlaceClick = () => {
    if (!steamingState.inSteamer) {
      const newSteamingState = { ...steamingState, inSteamer: true };
      setSteamingState(newSteamingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        steamingState: newSteamingState,
        stars: sceneState.stars + 1
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
    }
  };

  const handleLidClick = () => {
    if (steamingState.inSteamer && !steamingState.lidClosed) {
      const newSteamingState = { ...steamingState, lidClosed: true, steamingStartedAt: Date.now() };
      setSteamingState(newSteamingState);
      setHelperState(prev => ({ ...prev, celebrating: true }));

      sceneActions.updateState({
        steamingState: newSteamingState
      });

      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);

      // Start timer
      const interval = setInterval(() => {
        setSteamingState(prev => {
          const newTime = prev.timeLeft - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            return { ...prev, timeLeft: 0, steamed: true };
          }

          // Update SceneManager state each second
          sceneActions.updateState({
            steamingState: { ...prev, timeLeft: newTime }
          });

          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
      steamTimerRef.current = interval;

      safeSetTimeout(() => {
        sceneActions.updateState({
          stars: sceneState.stars + 1,
          completedSteps: [...sceneState.completedSteps, STEPS.STEAM_MODAKS],
          currentStep: STEPS.COMPLETE,
          showDoneButton: true,
          steamingState: { ...newSteamingState, steamed: true, timeLeft: 0 }
        });
      }, 8000);
    }
  };

  const completeGame = () => {
    sceneActions.updateState({ completed: true });
    setShowSceneCompletion(true);
  };

  const beginCooking = () => {
    sceneActions.updateState({
      currentStep: STEPS.MIX_FILLING,
      welcomeShown: true
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      if (steamTimerRef.current) clearInterval(steamTimerRef.current);
      reloadHandledRef.current = false;
    };
  }, []);

  return (
    <div className="modak-cooking-container">
      {/* Background */}
      <div className="cooking-background" style={{ backgroundImage: `url(${cookingBg})` }} />

      <HomeButton onNavigate={onNavigate} />

      {/* Progress Board - ICONS ONLY */}
      <div className="progress-board">
        <div className="steps-container">
          {STEP_CONFIG.map((step, index) => (
            <div
              key={step.id}
              className={`step-icon ${sceneState.currentStep === step.id ? 'active' : ''
                } ${sceneState.completedSteps.includes(step.id) ? 'completed' : ''
                }`}
            >
              <img src={step.icon} alt={step.title} />
              <div className="step-number">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HELPER MOUSE - Single guide */}
      {helperState.visible && (
        <div
          className={`floating-helper ${helperState.celebrating ? 'celebrating' : ''}`}
          style={{
            position: 'fixed',
            left: `${helperState.position.x}px`,
            top: `${helperState.position.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 150
          }}
        >
          <div className="helper-bubble">
            {helperState.message}
          </div>
          <img src={helperMouse} alt="Helper" className="helper-mouse-img" />
        </div>
      )}

      {/* STEP COMPLETION CELEBRATION */}
      {sceneState.showStepComplete && sceneState.completedStepInfo && (
        <div className="step-completion-overlay">
          <div className="step-completion-card">
            <div className="step-complete-icon">
              <img src={sceneState.completedStepInfo.icon} alt={sceneState.completedStepInfo.title} />
            </div>
            <div className="step-complete-text">
              Step {sceneState.completedStepInfo.number} - Completed
            </div>
            <div className="step-complete-message">Great Job!</div>
          </div>
        </div>
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


      {/* Opening Modal - Replaces Introduction Scene */}
      {sceneState.currentStep === STEPS.INTRODUCTION && (
        <OpeningModal
          zoneId={zoneId}
          sceneId={sceneId}
          onStart={beginCooking}
          characterImg={ganeshaChef}
          showButton={true}
        />
      )}

      {/* STEP 1: MIX FILLING */}
      {sceneState.currentStep === STEPS.MIX_FILLING && (
        <div className="step-area mixing-area">
          <div className="work-surface">
            {/* Coconut Bowl */}
            <div
              id="coconut-bowl"
              className={`clickable-item ${!mixingState.coconutAdded ? 'available' : 'used'}`}
              onClick={handleCoconutClick}
            >
              <div className="golden-circle" />
              <img src={coconutBowl} alt="Coconut" />
            </div>

            {/* Mixing Bowl */}
            <div className="main-mixing-bowl">
              <img
                src={
                  mixingState.stirred ? brassMixingBowlAllIngredients :
                    mixingState.jaggeryAdded ? brassMixingBowlCoconutJaggery :
                      mixingState.coconutAdded ? brassMixingBowlCoconut :
                        brassMixingBowlEmpty
                }
                alt="Mixing Bowl"
              />
            </div>

            {/* Jaggery Bowl */}
            <div
              id="jaggery-bowl"
              className={`clickable-item ${mixingState.coconutAdded && !mixingState.jaggeryAdded ? 'available' : mixingState.jaggeryAdded ? 'used' : 'inactive'}`}
              onClick={handleJaggeryClick}
            >
              <div className="golden-circle" />
              <img src={jaggeryBowl} alt="Jaggery" />
            </div>

            {/* Spoon */}
            <div
              id="spoon-tool"
              className={`clickable-item spoon-item ${mixingState.coconutAdded && mixingState.jaggeryAdded && !mixingState.stirred ? 'available' : 'inactive'}`}
              onClick={handleStirClick}
            >
              <div className="golden-circle" />
              <img src={spoon} alt="Spoon" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAKE DOUGH */}
      {sceneState.currentStep === STEPS.MAKE_DOUGH && (
        <div className="step-area dough-area">
          <div className="work-surface">
            {/* Rice Bowl */}
            <div
              id="rice-bowl"
              className={`clickable-item ${!doughState.flourAdded ? 'available' : 'used'}`}
              onClick={handleFlourClick}
            >
              <div className="golden-circle" />
              <img src={riceBowl} alt="Rice Flour" />
            </div>

            {/* Dough Bowl */}
            <div className="dough-bowl-area">
              <img
                src={
                  doughState.mixed ? perfectModakDough :
                    doughState.waterAdded ? brassBowlFlourWater :
                      doughState.flourAdded ? brassBowlWithFlour :
                        brassMixingBowlEmpty
                }
                alt="Dough Bowl"
              />
            </div>

            {/* Water Pot */}
            <div
              id="water-pot"
              className={`clickable-item ${doughState.flourAdded && !doughState.waterAdded ? 'available' : doughState.waterAdded ? 'used' : 'inactive'}`}
              onClick={handleWaterClick}
            >
              <div className="golden-circle" />
              <img src={waterPot} alt="Water" />
            </div>

            {/* Spoon */}
            <div
              id="spoon-tool"
              className={`clickable-item spoon-item ${doughState.flourAdded && doughState.waterAdded && !doughState.mixed ? 'available' : 'inactive'}`}
              onClick={handleDoughMixClick}
            >
              <div className="golden-circle" />
              <img src={spoon} alt="Spoon" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SHAPE DOUGH */}
      {sceneState.currentStep === STEPS.SHAPE_DOUGH && (
        <div className="step-area shaping-area">
          <div className="work-surface">
            {/* Dough Ball */}
            <div
              id="dough-ball"
              className={`clickable-item ${!shapingState.doughPlaced ? 'available' : 'used'}`}
              onClick={handleDoughPlaceClick}
            >
              <div className="golden-circle" />
              <img src={doughBall} alt="Dough Ball" />
            </div>

            {/* Rolling Mat */}
            <div
              id="rolling-mat"
              className="shaping-surface"
            >
              <img
                src={
                  shapingState.shaped ? doughCup :
                    shapingState.flattened ? flatDough :
                      shapingState.doughPlaced ? doughPortion :
                        rollingMat
                }
                alt="Shaping Surface"
                className={`${shapingState.doughPlaced && !shapingState.flattened ? 'available clickable-item' : ''}`}
                onClick={handleFlattenClick}
              />
              {shapingState.doughPlaced && !shapingState.flattened && <div className="golden-circle large" />}
            </div>

            {/* Wooden Mold */}
            <div
              id="wooden-mold"
              className={`clickable-item ${shapingState.flattened && !shapingState.shaped ? 'available' : 'inactive'}`}
              onClick={handleShapeClick}
            >
              <div className="golden-circle" />
              <img src={woodenMold} alt="Mold" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: FILL & CLOSE */}
      {sceneState.currentStep === STEPS.FILL_CLOSE && (
        <div className="step-area filling-area">
          <div className="work-surface">
            {/* Coconut-Jaggery Filling */}
            <div
              id="coconut-jaggery-filling"
              className={`clickable-item ${!fillingState.filled ? 'available' : 'used'}`}
              onClick={handleFillingClick}
            >
              <div className="golden-circle" />
              <img src={coconutJaggeryFilling} alt="Filling" />
            </div>

            {/* Dough Cup */}
            <div className="dough-cup-area">
              <img
                src={
                  fillingState.sealed ? sealedModak :
                    fillingState.filled ? cupWithFilling :
                      doughCup
                }
                alt="Modak"
                id="cup-with-filling"
                className={`${fillingState.filled && !fillingState.sealed ? 'available clickable-item' : ''}`}
                onClick={handleSealClick}
              />
              {fillingState.filled && !fillingState.sealed && <div className="golden-circle large" />}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: STEAM */}
      {sceneState.currentStep === STEPS.STEAM_MODAKS && (
        <div className="step-area steaming-area">
          <div className="work-surface">
            {/* Sealed Modak */}
            {!steamingState.inSteamer && (
              <div
                id="sealed-modak"
                className="clickable-item available"
                onClick={handleSteamerPlaceClick}
              >
                <div className="golden-circle" />
                <img src={sealedModak} alt="Modak" />
              </div>
            )}

            {/* Steamer */}
            <div className="steamer-setup">
              <img
                src={steamingState.inSteamer ? steamerWithModak : emptyBrassSteamer}
                alt="Steamer"
              />

              {steamingState.lidClosed && (
                <>
                  <img src={steamerLid} alt="Lid" className="steamer-lid-placed" />
                  {!steamingState.steamed && (
                    <div className="steam-timer">
                      ⏱️ {steamingState.timeLeft}s
                    </div>
                  )}
                  {steamingState.steamed && (
                    <img src={steamEffect} alt="Steam" className="steam-animation" />
                  )}
                </>
              )}
            </div>

            {/* Lid */}
            {steamingState.inSteamer && !steamingState.lidClosed && (
              <div
                id="steamer-lid"
                className="clickable-item available"
                onClick={handleLidClick}
              >
                <div className="golden-circle" />
                <img src={steamerLid} alt="Lid" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLETE */}
      {sceneState.currentStep === STEPS.COMPLETE && (
        <div className="completion-area">
          <div className="final-modak-display">
            <img src={cookedModak} alt="Cooked Modak" className="final-modak" />
            <div className="modak-plate">
              <img src={modaksOnPlate} alt="Modaks" />
            </div>
          </div>

          {sceneState.showDoneButton && (
            <button className="done-cooking-button" onClick={completeGame}>
              🎉 All Done!
            </button>
          )}
        </div>
      )}

      {/* Start Over Button */}
      <div className="start-over-button" onClick={() => resetScene()}>
        <span>🔄</span>
        <span>Start Over</span>
      </div>

      {/* Game Pause Menu */}
      <GamePauseMenu
        show={showPauseMenu}
        gameName="Modak Mastery"
        currentStars={sceneState.stars}
        hasDesignOption={false}

        onResume={() => setShowPauseMenu(false)}

        onRestart={() => {
          setShowPauseMenu(false);
          resetScene();
        }}

        onComplete={() => {
          setShowPauseMenu(false);
          completeGame();
        }}
      />

      {/* Festival Square Completion */}
      {showSceneCompletion && (
        <FestivalSquareCompletion
          show={showSceneCompletion}
          sceneName="Modak Mastery"
          sceneNumber={3}
          totalScenes={4}
          starsEarned={sceneState.stars}
          totalStars={13}
          discoveredBadges={['cooking']}
          badgeImages={{
            cooking: cookingBadge
          }}
          nextSceneName="Mandap Decoration"
          childName="little chef"
          onContinue={() => {
            console.log('🍪 MODAK CONTINUE: Going to next game');
            setTimeout(() => {
              onNavigate?.('scene-complete-continue');
            }, 100);
          }}
          onReplay={() => {
            console.log('🎮 MODAK REPLAY: Play Again');
            resetScene();
            setShowSceneCompletion(false);
          }}
          onBackToMap={() => {
            console.log('🗺️ MODAK MAP: Back to Festival Square');
            if (onNavigate) {
              onNavigate('zone-welcome');
            }
          }}
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
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
        onStartFresh={() => resetScene()}
        currentProgress={{
          stars: sceneState.stars || 0,
          completed: sceneState.completed ? 1 : 0,
          total: 1
        }}
      />

      {/* BackToMapButton */}
      {sceneState.welcomeShown && <BackToMapButton onNavigate={onNavigate} />}
    </div>
  );
};

export default ModakCookingGame;
