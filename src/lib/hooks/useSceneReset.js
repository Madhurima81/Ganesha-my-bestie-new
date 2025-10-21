// lib/hooks/useSceneReset.js - Enhanced with UI clearing while preserving backward compatibility
const useSceneReset = (sceneActions, zoneId, sceneId, resetConfig = {}, customResetCallbacks = {}) => {
  
  const resetScene = () => {
    console.log(`🔄 SCENE RESET: Starting reset for ${zoneId}/${sceneId}`);
    
    // NEW: Enhanced UI clearing for memory game scenes (if callbacks provided)
    if (customResetCallbacks.clearAllUI) {
      console.log('🧹 Clearing all UI states first');
      customResetCallbacks.clearAllUI();
    }

    // NEW: GameCoach cleanup (if provided)
    if (customResetCallbacks.hideCoach) {
      customResetCallbacks.hideCoach();
    }
    if (customResetCallbacks.clearManualCloseTracking) {
      customResetCallbacks.clearManualCloseTracking();
    }

    // NEW: Clear timeouts (if provided)
    if (customResetCallbacks.clearTimeouts) {
      customResetCallbacks.clearTimeouts();
    }
    
    // Memory game reset logic (enhanced)
    if (resetConfig.memoryGameType) {
      console.log(`🎮 Resetting ${resetConfig.memoryGameType} memory game`);
      
      // Handle different memory game types
      switch (resetConfig.memoryGameType) {
        case 'simplified':
          if (window.simplifiedMemoryGame) {
            window.simplifiedMemoryGame.visualRewards = {};
            window.simplifiedMemoryGame.activatedElephants = {};
            window.simplifiedMemoryGame.isForceReset = true;
          }
          break;

              case 'simplifiedCombined':  // ADD THIS NEW CASE
      if (window.simplifiedCombinedMemoryGame) {
        window.simplifiedCombinedMemoryGame.visualRewards = {};
        window.simplifiedCombinedMemoryGame.activatedSingers = {};
        window.simplifiedCombinedMemoryGame.isForceReset = true;
      }
      break;
          
        case 'sanskrit':
          if (window.sanskritMemoryGame) {
            window.sanskritMemoryGame.permanentTransformations = {};
            window.sanskritMemoryGame.permanentlyActivatedElephants = {};
            window.sanskritMemoryGame.isForceReset = true;
          }
          break;
      }
      
      // Set force reset flag if callback provided
      if (customResetCallbacks.forceMemoryReset) {
        customResetCallbacks.forceMemoryReset(true);
      }
    }
    
    // EXISTING: Step 1: Set play again flag (keep existing logic for backward compatibility)
    const profileId = localStorage.getItem('activeProfileId');
    const tempKey = `temp_session_${profileId}_${zoneId}_${sceneId}`;
    localStorage.setItem(tempKey, JSON.stringify({ playAgainRequested: true }));
    
    // EXISTING: Step 2: Build complete reset using config structure (keep existing logic)
    const completeReset = {
      // Base states from config
      celebrationStars: 0,
      phase: resetConfig.initialPhase || 'initial',
      currentFocus: resetConfig.initialFocus || 'start', 
      discoveredSymbols: resetConfig.keepSymbols || {},
      
      // Common flags
      welcomeShown: false,
      readyForWisdom: false,
      currentPopup: null,
      showingCompletionScreen: false,
      
      // Progress reset
      stars: 0,
      completed: false,
      progress: { percentage: 0, starsEarned: 0, completed: false },
      
      // Merge all scene-specific states from config
      ...(resetConfig.specificResets || {})
    };
    
    // ENHANCED: Apply the reset with timing for UI clearing
    const applyReset = () => {
      sceneActions.updateState(completeReset);
      console.log('✅ Scene state reset applied');
    };

    // If UI clearing was done, wait a bit for it to take effect
    if (customResetCallbacks.clearAllUI) {
      setTimeout(applyReset, 100);
    } else {
      // Immediate for backward compatibility with existing scenes
      applyReset();
    }
    
    // NEW: Clear memory game force reset flag after delay (only for memory game scenes)
    if (resetConfig.memoryGameType && customResetCallbacks.forceMemoryReset) {
      setTimeout(() => {
        customResetCallbacks.forceMemoryReset(false);
        console.log(`🎮 ${resetConfig.memoryGameType} memory game reset completed`);
      }, 1000);
    }
  };

  return { resetScene };
};

export default useSceneReset;