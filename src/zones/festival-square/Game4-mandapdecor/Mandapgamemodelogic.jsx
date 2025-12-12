// ===============================================
// MANDAP DECORATION GAME - MODE LOGIC FUNCTIONS
// ===============================================
// Add these functions to your MandapDecorationGame.jsx

// ============================================
// 1. FIX THE MANDAP MODE
// ============================================

/**
 * Initialize Fix the Mandap mode
 * Pre-places decorations in wrong positions/rotations
 */
export const initializeFixMandapMode = (setGameState, setWrongPlacements) => {
  console.log('🔧 Initializing Fix the Mandap mode');
  
  const wrongItems = [
    { 
      id: 'marigold_bunch', 
      wrongZone: 'base-floor', // Should be on pillar
      wrongRotation: 180, 
      correctZone: 'pillar-left',
      correctRotation: 0,
      errorType: 'wrong-zone'
    },
    { 
      id: 'clay_traditional', 
      wrongZone: 'altar-center',
      wrongRotation: 90, // Upside down
      correctZone: 'altar-center',
      correctRotation: 0,
      errorType: 'wrong-rotation'
    },
    { 
      id: 'coconut', 
      wrongZone: 'roof-center', // Too high
      wrongRotation: 0,
      correctZone: 'altar-right',
      correctRotation: 0,
      errorType: 'wrong-zone'
    },
    { 
      id: 'jasmine_garland', 
      wrongZone: 'base-floor', // On ground
      wrongRotation: 270,
      correctZone: 'entrance-arch',
      correctRotation: 0,
      errorType: 'wrong-zone'
    },
    { 
      id: 'rangoli_base', 
      wrongZone: 'pillar-right', // Should be on floor
      wrongRotation: 45,
      correctZone: 'base-floor',
      correctRotation: 0,
      errorType: 'wrong-zone'
    }
  ];

  // Create Map of wrong placements
  const wrongMap = new Map();
  wrongItems.forEach(item => {
    wrongMap.set(item.id, {
      currentZone: item.wrongZone,
      currentRotation: item.wrongRotation,
      correctZone: item.correctZone,
      correctRotation: item.correctRotation,
      isFixed: false,
      errorType: item.errorType
    });
  });

  setWrongPlacements(wrongMap);
  
  setGameState(prev => ({
    ...prev,
    phase: 'decoration',
    fixedCount: 0,
    totalToFix: wrongItems.length
  }));
};

/**
 * Handle decoration click in Fix mode
 * Returns true if decoration can be fixed, false otherwise
 */
export const handleFixModeClick = (decorationId, wrongPlacements, setWrongPlacements, setGameState, playSound) => {
  const wrongItem = wrongPlacements.get(decorationId);
  
  if (!wrongItem || wrongItem.isFixed) {
    return false;
  }

  console.log(`🔧 Attempting to fix: ${decorationId}`);
  
  // Mark as fixed
  const updatedMap = new Map(wrongPlacements);
  updatedMap.set(decorationId, { ...wrongItem, isFixed: true });
  setWrongPlacements(updatedMap);

  // Update game state
  setGameState(prev => ({
    ...prev,
    fixedCount: prev.fixedCount + 1,
    stars: prev.stars + 1
  }));

  // Play success sound
  if (playSound) playSound('fix-success');

  // Check if all fixed
  const allFixed = Array.from(updatedMap.values()).every(item => item.isFixed);
  if (allFixed) {
    console.log('🎉 All decorations fixed!');
    setTimeout(() => {
      setGameState(prev => ({ ...prev, completed: true }));
    }, 1000);
  }

  return true;
};

/**
 * Render fix indicators on decorations
 */
export const renderFixIndicators = (wrongPlacements) => {
  return Array.from(wrongPlacements.entries()).map(([id, item]) => {
    if (item.isFixed) return null;

    return (
      <div key={`fix-indicator-${id}`} className="fix-indicator">
        <span className="fix-icon">⚠️</span>
        {item.errorType === 'wrong-rotation' && <span className="fix-hint">Rotate me!</span>}
        {item.errorType === 'wrong-zone' && <span className="fix-hint">Move me!</span>}
      </div>
    );
  });
};

// ============================================
// 2. LIGHT-UP CHALLENGE MODE
// ============================================

/**
 * Initialize Light-Up Challenge mode
 */
export const initializeLightChallenge = (setGameState, setTimer, setBrightness, setLightItems) => {
  console.log('🪔 Initializing Light-Up Challenge');
  
  const lightItemsNeeded = [
    { id: 'clay_traditional', placed: false },
    { id: 'painted_decorative', placed: false },
    { id: 'golden_ornate', placed: false },
    { id: 'string_festival', placed: false },
    { id: 'paper_lanterns', placed: false }
  ];

  setLightItems(lightItemsNeeded);
  setTimer(60); // 60 seconds
  setBrightness(0); // Start dark
  
  setGameState(prev => ({
    ...prev,
    phase: 'decoration',
    lightsPlaced: 0,
    totalLights: lightItemsNeeded.length,
    challengeFailed: false
  }));
};

/**
 * Start countdown timer for Light Challenge
 */
export const startLightChallengeTimer = (timer, setTimer, setGameState, playSound) => {
  const interval = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        // Time's up!
        setGameState(prevState => ({ 
          ...prevState, 
          challengeFailed: true 
        }));
        if (playSound) playSound('time-up');
        return 0;
      }
      
      // Warning sounds at 10, 5 seconds
      if (prev === 10 || prev === 5) {
        if (playSound) playSound('timer-warning');
      }
      
      return prev - 1;
    });
  }, 1000);

  return interval;
};

/**
 * Handle light placement in Light Challenge
 */
export const handleLightPlacement = (decorationId, lightItems, setLightItems, setBrightness, setGameState, playSound) => {
  // Check if this decoration has light effect
  const isLightItem = lightItems.some(item => item.id === decorationId);
  
  if (!isLightItem) {
    console.log('❌ Not a light item');
    return false;
  }

  // Mark light as placed
  const updatedLights = lightItems.map(item => 
    item.id === decorationId ? { ...item, placed: true } : item
  );
  setLightItems(updatedLights);

  // Increase brightness (each light = 20% brightness)
  setBrightness(prev => Math.min(prev + 0.2, 1));

  // Update game state
  const lightsPlaced = updatedLights.filter(item => item.placed).length;
  setGameState(prev => ({
    ...prev,
    lightsPlaced,
    stars: prev.stars + 1
  }));

  // Play light-up sound
  if (playSound) playSound('light-up');

  // Check if all lights placed
  if (lightsPlaced === lightItems.length) {
    console.log('🎉 All lights placed! Challenge complete!');
    setTimeout(() => {
      setGameState(prev => ({ ...prev, completed: true }));
    }, 500);
  }

  return true;
};

/**
 * Render timer display
 */
export const renderTimerDisplay = (timer, totalTime = 60) => {
  const percentage = (timer / totalTime) * 100;
  const isWarning = timer <= 10;
  const isCritical = timer <= 5;

  return (
    <div className={`timer-display ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
      <div className="timer-circle">
        <svg width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#ddd"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={isCritical ? '#f44336' : isWarning ? '#ff9800' : '#4caf50'}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 35}`}
            strokeDashoffset={`${2 * Math.PI * 35 * (1 - percentage / 100)}`}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="timer-text">{timer}s</span>
      </div>
    </div>
  );
};

/**
 * Apply darkness overlay based on brightness level
 */
export const renderDarknessOverlay = (brightness) => {
  const opacity = 1 - brightness; // 1 = completely dark, 0 = fully bright

  return (
    <div 
      className="darkness-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 20, 0.9)',
        opacity: opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.5s ease',
        zIndex: 5
      }}
    />
  );
};

// ============================================
// 3. ECO MANDAP MODE
// ============================================

/**
 * Initialize Eco Mandap mode
 */
export const initializeEcoMandap = (setGameState, setEcoHearts) => {
  console.log('🌱 Initializing Eco Mandap mode');
  
  const ecoItems = [
    'marigold_bunch', 'rose_petals', 'lotus_single', 'flower_petals',
    'flower_leaf_mix', 'jasmine_garland', 'coconut', 'fruits_plate',
    'sweets_modak', 'kalash_pot', 'peacock_feathers', 'rangoli_base'
  ];

  const nonEcoItems = [
    'balloons_cluster', 'streamers_flowing', 'bunting_colorful',
    'string_festival', 'paper_lanterns', 'confetti_scatter'
  ];

  setEcoHearts(0);
  
  setGameState(prev => ({
    ...prev,
    phase: 'intro',
    ecoItems,
    nonEcoItems,
    targetEcoHearts: 5,
    warningCount: 0
  }));
};

/**
 * Handle decoration selection in Eco mode
 */
export const handleEcoModeSelection = (decorationId, gameState, setEcoHearts, setGameState, showGaneshaReaction, playSound) => {
  const isEco = gameState.ecoItems.includes(decorationId);
  const isNonEco = gameState.nonEcoItems.includes(decorationId);

  if (isEco) {
    // Good choice! Eco item
    setEcoHearts(prev => prev + 1);
    setGameState(prev => ({
      ...prev,
      stars: prev.stars + 1
    }));

    // Show Ganesha happy
    showGaneshaReaction('happy', 'Great choice! Nature loves this! 🌱');
    if (playSound) playSound('eco-success');

    // Check if target reached
    if ((gameState.ecoHearts || 0) + 1 >= gameState.targetEcoHearts) {
      console.log('🎉 Eco target reached!');
      setTimeout(() => {
        setGameState(prev => ({ ...prev, completed: true }));
      }, 1000);
    }

    return 'eco';
  } else if (isNonEco) {
    // Not eco-friendly
    setGameState(prev => ({
      ...prev,
      warningCount: prev.warningCount + 1
    }));

    // Show Ganesha gentle concern
    showGaneshaReaction('concerned', 'Hmm... try something from nature instead? 🌿');
    if (playSound) playSound('eco-warning');

    return 'non-eco';
  }

  return 'neutral';
};

/**
 * Render eco hearts display
 */
export const renderEcoHearts = (ecoHearts, targetHearts) => {
  return (
    <div className="eco-hearts-display">
      <div className="eco-hearts-container">
        <span className="eco-icon">🌱</span>
        <div className="hearts-earned">
          {Array.from({ length: targetHearts }, (_, i) => (
            <span key={i} className={`heart ${i < ecoHearts ? 'filled' : 'empty'}`}>
              {i < ecoHearts ? '💚' : '🤍'}
            </span>
          ))}
        </div>
        <span className="eco-count">{ecoHearts}/{targetHearts}</span>
      </div>
    </div>
  );
};

/**
 * Filter and highlight eco items in decoration palette
 */
export const highlightEcoItems = (decorations, ecoItems, nonEcoItems) => {
  return decorations.map(decoration => ({
    ...decoration,
    isEco: ecoItems.includes(decoration.id),
    isNonEco: nonEcoItems.includes(decoration.id),
    className: ecoItems.includes(decoration.id) 
      ? 'decoration-item eco-friendly' 
      : nonEcoItems.includes(decoration.id)
      ? 'decoration-item non-eco'
      : 'decoration-item'
  }));
};

// ============================================
// 4. PUJA PREPARATION MODE
// ============================================

/**
 * Initialize Puja Preparation mode
 */
export const initializePujaPrep = (setGameState, setCurrentStep) => {
  console.log('🙏 Initializing Puja Preparation mode');
  
  const pujaSteps = [
    { 
      step: 1, 
      prompt: 'First, place fresh flowers on the altar 🌸',
      item: 'marigold_bunch',
      zone: 'altar-left',
      culturalNote: 'Flowers represent beauty and devotion'
    },
    { 
      step: 2, 
      prompt: 'Now add a coconut for blessings 🥥',
      item: 'coconut',
      zone: 'altar-center',
      culturalNote: 'Coconut symbolizes selfless offering'
    },
    { 
      step: 3, 
      prompt: 'Light the sacred diya 🪔',
      item: 'clay_traditional',
      zone: 'altar-center',
      culturalNote: 'Light removes darkness and ignorance'
    },
    { 
      step: 4, 
      prompt: 'Offer sweet modaks to Ganesha 🍬',
      item: 'sweets_modak',
      zone: 'altar-right',
      culturalNote: 'Modaks are Ganesha\'s favorite!'
    },
    { 
      step: 5, 
      prompt: 'Complete with beautiful rangoli 🌈',
      item: 'rangoli_base',
      zone: 'base-floor',
      culturalNote: 'Rangoli welcomes good fortune'
    }
  ];

  setCurrentStep(0);
  
  setGameState(prev => ({
    ...prev,
    phase: 'decoration',
    pujaSteps,
    completedSteps: 0
  }));
};

/**
 * Handle step completion in Puja Prep mode
 */
export const handlePujaStepPlacement = (decorationId, zone, currentStep, pujaSteps, setCurrentStep, setGameState, playSound, showStepFeedback) => {
  const currentStepData = pujaSteps[currentStep];

  // Check if correct item and zone
  const isCorrectItem = decorationId === currentStepData.item;
  const isCorrectZone = zone === currentStepData.zone;

  if (isCorrectItem && isCorrectZone) {
    // Correct placement!
    console.log(`✅ Step ${currentStep + 1} completed correctly`);

    // Show cultural note
    showStepFeedback(currentStepData.culturalNote, 'success');
    if (playSound) playSound('step-complete');

    // Move to next step
    setCurrentStep(prev => prev + 1);
    setGameState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps + 1,
      stars: prev.stars + 1
    }));

    // Check if all steps complete
    if (currentStep + 1 >= pujaSteps.length) {
      console.log('🎉 Puja preparation complete!');
      setTimeout(() => {
        setGameState(prev => ({ ...prev, completed: true }));
      }, 1500);
    }

    return true;
  } else {
    // Wrong item or zone
    let feedbackMessage = '';
    if (!isCorrectItem) {
      feedbackMessage = `Not quite! Look for: ${currentStepData.item.replace('_', ' ')}`;
    } else if (!isCorrectZone) {
      feedbackMessage = 'Try placing it in a different spot!';
    }
    
    showStepFeedback(feedbackMessage, 'error');
    if (playSound) playSound('step-error');

    return false;
  }
};

/**
 * Render step progress indicator
 */
export const renderPujaStepProgress = (currentStep, totalSteps) => {
  return (
    <div className="puja-step-progress">
      <div className="step-dots">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div 
            key={i} 
            className={`step-dot ${i < currentStep ? 'completed' : i === currentStep ? 'current' : 'pending'}`}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Render current step banner with prompt
 */
export const renderStepBanner = (currentStep, pujaSteps) => {
  if (currentStep >= pujaSteps.length) {
    return (
      <div className="step-banner complete">
        <span className="banner-icon">🎉</span>
        <p>Puja is ready! Ganesha is pleased!</p>
      </div>
    );
  }

  const step = pujaSteps[currentStep];
  
  return (
    <div className="step-banner">
      <span className="banner-icon">🙏</span>
      <p>{step.prompt}</p>
      <div className="step-indicator">Step {currentStep + 1} of {pujaSteps.length}</div>
    </div>
  );
};

/**
 * Show only required item for current step
 */
export const filterDecorationsForStep = (allDecorations, currentStep, pujaSteps) => {
  if (currentStep >= pujaSteps.length) {
    return []; // All steps complete
  }

  const requiredItemId = pujaSteps[currentStep].item;
  return allDecorations.filter(dec => dec.id === requiredItemId);
};

// ============================================
// SHARED UTILITY FUNCTIONS
// ============================================

/**
 * Show Ganesha reaction with speech bubble
 */
export const showGaneshaReaction = (emotion, message, setGaneshaState) => {
  setGaneshaState({
    emotion, // 'happy', 'concerned', 'excited', 'neutral'
    message,
    showSpeech: true
  });

  // Hide after 3 seconds
  setTimeout(() => {
    setGaneshaState(prev => ({ ...prev, showSpeech: false }));
  }, 3000);
};

/**
 * Calculate mission completion stats
 */
export const calculateMissionStats = (gameMode, gameState) => {
  const stats = {
    mode: gameMode,
    completed: gameState.completed,
    stars: gameState.stars,
    timeSpent: Math.floor((Date.now() - gameState.gameStartTime) / 1000)
  };

  switch(gameMode) {
    case 'fix-mandap':
      stats.itemsFixed = gameState.fixedCount || 0;
      stats.totalItems = gameState.totalToFix || 5;
      stats.badge = 'Fix Master 🔧';
      break;

    case 'light-challenge':
      stats.lightsPlaced = gameState.lightsPlaced || 0;
      stats.totalLights = gameState.totalLights || 5;
      stats.timeRemaining = gameState.timer || 0;
      stats.badge = 'Light Bringer 🪔';
      break;

    case 'eco-mandap':
      stats.ecoHearts = gameState.ecoHearts || 0;
      stats.warnings = gameState.warningCount || 0;
      stats.badge = 'Nature\'s Blessing 🌱';
      break;

    case 'puja-prep':
      stats.stepsCompleted = gameState.completedSteps || 0;
      stats.totalSteps = gameState.pujaSteps?.length || 5;
      stats.badge = 'Puja Master 🙏';
      break;

    default:
      stats.badge = 'Decorator ✨';
  }

  return stats;
};

/**
 * Get completion message based on mode
 */
export const getCompletionMessage = (gameMode, stats) => {
  const messages = {
    'fix-mandap': `Amazing! You fixed all ${stats.itemsFixed} decorations perfectly! The mandap looks beautiful now! 🔧✨`,
    'light-challenge': `Wonderful! You lit all ${stats.lightsPlaced} lights with ${stats.timeRemaining} seconds to spare! 🪔💫`,
    'eco-mandap': `Fantastic! You earned ${stats.ecoHearts} eco hearts and helped protect nature! 🌱💚`,
    'puja-prep': `Perfect! You completed all ${stats.stepsCompleted} puja steps correctly! Ganesha is so happy! 🙏🎉`,
    'free-play': `Beautiful work! Your mandap is ready for the celebration! 🎨✨`
  };

  return messages[gameMode] || messages['free-play'];
};

/**
 * Save mission progress to localStorage
 */
export const saveMissionProgress = (profileId, missionId, stats) => {
  try {
    const key = `mandap_mission_${profileId}_${missionId}`;
    const progressData = {
      ...stats,
      completedAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(progressData));
    console.log(`💾 Mission progress saved: ${missionId}`);
  } catch (error) {
    console.warn('Failed to save mission progress:', error);
  }
};

/**
 * Load best score for a mission
 */
export const loadMissionBestScore = (profileId, missionId) => {
  try {
    const key = `mandap_mission_${profileId}_${missionId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load mission score:', error);
    return null;
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  // Fix the Mandap
  initializeFixMandapMode,
  handleFixModeClick,
  renderFixIndicators,
  
  // Light-Up Challenge
  initializeLightChallenge,
  startLightChallengeTimer,
  handleLightPlacement,
  renderTimerDisplay,
  renderDarknessOverlay,
  
  // Eco Mandap
  initializeEcoMandap,
  handleEcoModeSelection,
  renderEcoHearts,
  highlightEcoItems,
  
  // Puja Preparation
  initializePujaPrep,
  handlePujaStepPlacement,
  renderPujaStepProgress,
  renderStepBanner,
  filterDecorationsForStep,
  
  // Shared utilities
  showGaneshaReaction,
  calculateMissionStats,
  getCompletionMessage,
  saveMissionProgress,
  loadMissionBestScore
};