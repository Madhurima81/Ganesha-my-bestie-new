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
      console.log('🆕 Fresh start - showing mode selection');
      setSelectedMode(null);
      setShowModeModal(true);
    }
  }, [isActive, isReload, savedGameState]);

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

  if (!isActive || !gameConfig) {
    return null;
  }

  // Common props for both modes
  const commonProps = {
    gameConfig,
    isActive,
    hideElements,
    powerGained,
    onPhaseComplete,
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
      {/* Mode Selection Modal - themed with game colors */}
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
          isReload={isReload}
          savedGameState={savedGameState}
        />
      )}
    </>
  );
};

// ⭐ CRITICAL: Default export (not named export)
export default MemoryGameEngine;