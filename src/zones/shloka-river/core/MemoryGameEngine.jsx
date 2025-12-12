// zones/shloka-river/core/MemoryGameEngine.jsx
// THE ONE ENGINE - All games use this (Router/Wrapper)

import React, { useState, useEffect } from 'react';
import ModeSelectionModal from './ModeSelectionModal';
import AutoPlayMode from './AutoPlayMode';
import ManualRoundMode from './ManualRoundMode';

const MemoryGameEngine = ({
  // Core props
  gameConfig,           // ⭐ THE CONFIG OBJECT
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Components
  WaterSprayComponent,
  
  // Asset getters (passed dynamically based on config)
  assetGetters = {},
  
  // Mode control - ⭐ NEW
  selectedMode: preSelectedMode = null,  // Pre-selected mode from parent
  skipModeSelection = false,             // Skip modal if mode already chosen
  
  // Reload support
  isReload = false,
  savedGameState = null,
  onSaveGameState
}) => {

  // Validate config
  useEffect(() => {
    if (isActive && !gameConfig) {
      console.error('❌ MemoryGameEngine: No gameConfig provided!');
    }
  }, [isActive, gameConfig]);

  // Mode management
  const [selectedMode, setSelectedMode] = useState(preSelectedMode);
  const [showModeModal, setShowModeModal] = useState(!skipModeSelection && !preSelectedMode);

  // Initialize mode
  useEffect(() => {
    if (!isActive) return;

    if (isReload && savedGameState?.savedGameMode) {
      console.log('🔄 Restoring saved mode:', savedGameState.savedGameMode);
      setSelectedMode(savedGameState.savedGameMode);
      setShowModeModal(false);
    } else if (!isReload) {
      // ⭐ FIX: Respect skipModeSelection and preSelectedMode flags
      if (skipModeSelection || preSelectedMode) {
        console.log('🎮 Mode pre-selected or skipped:', preSelectedMode);
        setSelectedMode(preSelectedMode);
        setShowModeModal(false);
      } else {
        console.log('🆕 Fresh start - showing mode selection');
        setSelectedMode(null);
        setShowModeModal(true);
      }
    }
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

  // ✅ BUG 1 FIX: Handle mode switching from Manual to Auto
  const handleSwitchToAuto = (manualState) => {
    console.log('[Mode] Switching from Manual to Auto mode');
    console.log('[Mode] Preserving learned syllables:', manualState?.learnedSyllables);
    setSelectedMode('auto');

    if (onSaveGameState) {
      onSaveGameState({
        savedGameMode: 'auto',
        gameId: gameConfig.id,
        // Preserve learned syllables from manual mode
        visualRewards: manualState?.visualRewards,
        activatedElephants: manualState?.activatedElephants
      });
    }
  };

  if (!isActive || !gameConfig) {
    return null;
  }

const handleEarlyExit = () => {
  console.log('[Engine] Early exit from auto - switching to manual mode');
  
  // Switch to manual mode (which shows round selection)
  setSelectedMode('manual');
  setShowModeModal(false);
  
  // ⭐ CLEAR saved game state to prevent auto-restart
  if (onSaveGameState) {
    onSaveGameState({
      savedGameMode: 'manual',
      gameId: gameConfig.id,
      // ⭐ Clear all game state
      currentRound: null,
      gamePhase: null,
      playerInput: [],
      visualRewards: {},
      activatedElephants: {}
    });
  }
};

// Common props for both modes
const commonProps = {
  gameConfig,
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete: (data) => {
    // Handle early exit from pause
    if (data?.isEarlyExit) {
      handleEarlyExit();
      return;
    }
    // Normal completion
    if (onPhaseComplete) {
      onPhaseComplete(data);
    }
  },
  onGameComplete,
  profileName,
  WaterSprayComponent,
  assetGetters,
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
    {/* Mode Selection Modal */}
    <ModeSelectionModal
      isOpen={showModeModal}
      onSelectMode={handleModeSelection}
      profileName={profileName}
      gameName={gameConfig.displayName}
      theme={gameConfig.theme}
    />

    {/* Auto Play Mode */}
    {selectedMode === 'auto' && (
      <AutoPlayMode
        {...commonProps}
        isReload={isReload}
        savedGameState={savedGameState}
      />
    )}

    {/* Manual Round Mode */}
    {selectedMode === 'manual' && (
      <ManualRoundMode
        {...commonProps}
        onSwitchToAuto={handleSwitchToAuto}
        isReload={isReload}
        savedGameState={savedGameState}
      />
    )}
  </>
);
};

// ⭐ CRITICAL: Default export (not named export)
export default MemoryGameEngine;