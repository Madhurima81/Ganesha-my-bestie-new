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
  const [manualModeKey, setManualModeKey] = useState(0); // ⭐ Force remount on exit

  // Initialize mode
  /*useEffect(() => {
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
  }, [isActive, isReload, savedGameState, skipModeSelection, preSelectedMode]);*/

  // Initialize mode
  useEffect(() => {
    if (!isActive) return;

    // ✅ FIX: Priority Logic for Mode Selection
    
    // 1. Dynamic Mode Switch: If we just saved a mode (like switching Manual->Auto), TRUST IT.
    // This allows the internal state to override the parent's initial prop.
    if (savedGameState?.savedGameMode) {
      console.log('🔄 [Engine] Enforcing saved mode:', savedGameState.savedGameMode);
      setSelectedMode(savedGameState.savedGameMode);
      setShowModeModal(false);
      return; // Stop here so we don't overwrite it below
    }

    // 2. Reload Logic
    if (isReload && savedGameState?.savedGameMode) {
      console.log('🔄 [Engine] Restoring saved mode (reload):', savedGameState.savedGameMode);
      setSelectedMode(savedGameState.savedGameMode);
      setShowModeModal(false);
    } 
    // 3. Fresh Start Logic
    else {
      // If parent forced a mode (e.g. via VakratundaGroveSimplified prop), use it
      if (skipModeSelection || preSelectedMode) {
        console.log('🎮 [Engine] Mode pre-selected or skipped:', preSelectedMode);
        setSelectedMode(preSelectedMode);
        setShowModeModal(false);
      } else {
        console.log('🆕 [Engine] Fresh start - showing mode selection');
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
  console.log('[Engine] Early exit - switching to Manual mode (round selection)');
  console.log('[Engine] Before clear - selectedMode:', selectedMode, 'showModeModal:', showModeModal);
  
  // Switch to manual mode (shows round selection - Image 1)
  setSelectedMode('manual');
  setShowModeModal(false);
  setManualModeKey(prev => prev + 1); // ⭐ Force ManualRoundMode to remount
  
  console.log('[Engine] Switched to manual mode with fresh mount');
  
  // ⭐ KEY: Clear saved state so Manual mode resets to round selection
  if (onSaveGameState) {
    const clearedState = {
      savedGameMode: 'manual',
      gameId: gameConfig.id,
      // ⭐ CRITICAL: Set gameState to roundSelection so Manual knows what to show
      gameState: 'roundSelection',
      selectedRound: null,
      currentRound: null,
      gamePhase: null,
      playerInput: [],
      visualRewards: {},
      activatedElephants: {},
      completedRounds: [],
      learnedSyllables: []
    };
    console.log('[Engine] Saving manual round selection state:', clearedState);
    onSaveGameState(clearedState);
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
        key={manualModeKey}  // ⭐ Remounts when key changes (on early exit)
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