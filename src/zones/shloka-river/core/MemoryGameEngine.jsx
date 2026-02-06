// zones/shloka-river/core/MemoryGameEngine.jsx
// FIXED: Receives progress data from Auto mode properly

import React, { useState, useEffect } from 'react';
import ModeSelectionModal from './ModeSelectionModal';
import AutoPlayMode from './AutoPlayMode';
import ManualRoundMode from './ManualRoundMode';

const MemoryGameEngine = ({
  gameConfig,
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  WaterSprayComponent,
  assetGetters = {},
  selectedMode: preSelectedMode = null,
  skipModeSelection = false,
  isReload = false,
  savedGameState = null,
  onSaveGameState,
  gamePrefix = 'default',
  voiceGuidance = null  // ⭐ VOICE GUIDANCE
}) => {

  useEffect(() => {
    if (isActive && !gameConfig) {
      console.error('❌ MemoryGameEngine: No gameConfig provided!');
    }
  }, [isActive, gameConfig]);

  const [selectedMode, setSelectedMode] = useState(preSelectedMode);
  const [showModeModal, setShowModeModal] = useState(!skipModeSelection && !preSelectedMode);
  const [manualModeKey, setManualModeKey] = useState(0);

// Initialize mode
useEffect(() => {
  if (!isActive) return;

  console.log('🔍 DEBUG saved state:', {
  gameMode: savedGameState?.gameMode,
  savedGameMode: savedGameState?.savedGameMode,
  gameId: savedGameState?.gameId,
  gameState: savedGameState?.gameState
});

  // Priority 1: Use gameMode from saved state (primary source of truth)
  if (savedGameState?.gameMode) {
    console.log('🔄 [Engine] Using saved gameMode:', savedGameState.gameMode);
    setSelectedMode(savedGameState.gameMode);
    setShowModeModal(false);
    return;
  }

  // Priority 2: Fallback to savedGameMode (legacy support)
  if (savedGameState?.savedGameMode) {
    console.log('🔄 [Engine] Using legacy savedGameMode:', savedGameState.savedGameMode);
    setSelectedMode(savedGameState.savedGameMode);
    setShowModeModal(false);
    return;
  }

  // Priority 3: Safety net - infer mode from mid-game state (if mode somehow missing)
  if (isReload && savedGameState) {
    // ⭐ ADDED: Validate this state belongs to THIS game
    if (savedGameState.gameId !== gameConfig.id) {
      console.log('⚠️ [Engine] Ignoring state from different game:', savedGameState.gameId, '(expected:', gameConfig.id + ')');
      // Treat as fresh start
      setSelectedMode(null);
      setShowModeModal(!skipModeSelection && !preSelectedMode);
      return;
    }
    
    const hasMidGameState = 
      savedGameState.gameState === 'playing' ||
      savedGameState.currentRound ||
      savedGameState.currentSequence?.length > 0;
    
    if (hasMidGameState) {
      console.log('⚠️ [Engine] Reload mid-game without saved mode - defaulting to manual');
      setSelectedMode('manual');
      setShowModeModal(false);
      return;
    }
  }

  // Priority 4: Pre-selected or skip mode selection
  if (skipModeSelection || preSelectedMode) {
    console.log('🎮 [Engine] Mode pre-selected or skipped:', preSelectedMode);
    setSelectedMode(preSelectedMode);
    setShowModeModal(false);
    return;
  }

  // Priority 5: Fresh start - show mode selection
  console.log('🆕 [Engine] Fresh start - showing mode selection');
  setSelectedMode(null);
  setShowModeModal(true);
}, [isActive, isReload, savedGameState, skipModeSelection, preSelectedMode]);

  const handleModeSelection = (mode) => {
    console.log(`🎮 ${gameConfig.displayName}: Mode selected: ${mode}`);
    setSelectedMode(mode);
    setShowModeModal(false);

    if (onSaveGameState) {
      onSaveGameState({
        savedGameMode: mode,
        gameId: gameConfig.id
      });
    }
  };

  const handleSwitchToAuto = (manualState) => {
    console.log('[Mode] Switching from Manual to Auto mode');
    setSelectedMode('auto');

    if (onSaveGameState) {
      onSaveGameState({
        savedGameMode: 'auto',
        gameId: gameConfig.id,
        visualRewards: manualState?.visualRewards,
        activatedElephants: manualState?.activatedElephants,
        completedRounds: manualState?.completedRounds, // PASSING BATON
        learnedSyllables: manualState?.learnedSyllables
      });
    }
  };

  if (!isActive || !gameConfig) {
    return null;
  }

  // ✅ UPDATED: Handle data from Auto Mode exit
  const handleEarlyExit = (autoData) => {
    console.log('[Engine] Early exit - switching to Manual mode');
    
    setSelectedMode('manual');
    setShowModeModal(false);
    setManualModeKey(prev => prev + 1); // Force remount
    
    // ⭐ Prefer data from Auto if available
    const preservedRounds = autoData?.completedRounds || savedGameState?.completedRounds || [];
    const preservedSyllables = autoData?.learnedSyllables || savedGameState?.learnedSyllables || [];
    const preservedRewards = autoData?.visualRewards || savedGameState?.visualRewards || {};
    const preservedElephants = autoData?.activatedElephants || savedGameState?.activatedElephants || {};
    
    console.log('[Engine] Restoring manual progress:', preservedRounds);

    if (onSaveGameState) {
      const nextState = {
        savedGameMode: 'manual',
        gameId: gameConfig.id,
        gameState: 'roundSelection', // Force menu
        completedRounds: preservedRounds,
        learnedSyllables: preservedSyllables,
        visualRewards: preservedRewards,
        activatedElephants: preservedElephants,
        selectedRound: null,
        currentRound: null,
        currentSequence: [],
        playerInput: [],
        gamePhase: null
      };
      
      console.log('[Engine] Saving state for manual mode:', nextState);
      onSaveGameState(nextState);
    }
  };

  const commonProps = {
  gameConfig,
  isActive,
  hideElements,
  powerGained,
  assetGetters,
  gamePrefix,
  voiceGuidance,  // ⭐ VOICE GUIDANCE

  onPhaseComplete: (data) => {
    if (data?.isEarlyExit) {
      handleEarlyExit(data);
      return;
    }
    if (onPhaseComplete) {
      onPhaseComplete(data);
    }
  },
  onGameComplete,
  profileName,
  WaterSprayComponent,
onSaveGameState: (state) => {
  if (onSaveGameState) {
    onSaveGameState({ 
      ...state, 
      savedGameMode: selectedMode,
      gameId: gameConfig.id 
    });
  }
}
};

  return (
    <>
      <ModeSelectionModal
        isOpen={showModeModal}
        onSelectMode={handleModeSelection}
        profileName={profileName}
        gameName={gameConfig.displayName}
        theme={gameConfig.theme}
      />

      {selectedMode === 'auto' && (
        <AutoPlayMode
          {...commonProps}
          isReload={isReload}
          savedGameState={savedGameState}
        />
      )}

      {selectedMode === 'manual' && (
        <ManualRoundMode
          key={manualModeKey}
          {...commonProps}
          onSwitchToAuto={handleSwitchToAuto}
          isReload={isReload}
          savedGameState={savedGameState}
          onExit={() => handleEarlyExit()} 
        />
      )}
    </>
  );
};

export default MemoryGameEngine;