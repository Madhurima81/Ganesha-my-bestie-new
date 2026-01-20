// zones/shloka-river/core/MemoryGameEngine.jsx
// THE ONE ENGINE - All games use this (Router/Wrapper)

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
  onSaveGameState
}) => {

  useEffect(() => {
    if (isActive && !gameConfig) {
      console.error('❌ MemoryGameEngine: No gameConfig provided!');
    }
  }, [isActive, gameConfig]);

  const [selectedMode, setSelectedMode] = useState(preSelectedMode);
  const [showModeModal, setShowModeModal] = useState(!skipModeSelection && !preSelectedMode);
  const [manualModeKey, setManualModeKey] = useState(0);

  // Initialize mode with fix for priority logic
  useEffect(() => {
    if (!isActive) return;

    // 1. Dynamic Mode Switch: TRUST SAVED STATE
    if (savedGameState?.savedGameMode) {
      console.log('🔄 [Engine] Enforcing saved mode:', savedGameState.savedGameMode);
      setSelectedMode(savedGameState.savedGameMode);
      setShowModeModal(false);
      return;
    }

    // 2. Reload Logic
    if (isReload && savedGameState?.savedGameMode) {
      console.log('🔄 [Engine] Restoring saved mode (reload):', savedGameState.savedGameMode);
      setSelectedMode(savedGameState.savedGameMode);
      setShowModeModal(false);
    } 
    // 3. Fresh Start Logic
    else {
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

  // ✅ UPDATED: Save completed rounds when switching to Auto
  const handleSwitchToAuto = (manualState) => {
    console.log('[Mode] Switching from Manual to Auto mode');
    setSelectedMode('auto');

    if (onSaveGameState) {
      onSaveGameState({
        savedGameMode: 'auto',
        gameId: gameConfig.id,
        // Preserve all manual progress
        visualRewards: manualState?.visualRewards,
        activatedElephants: manualState?.activatedElephants,
        completedRounds: manualState?.completedRounds, // ⭐ PASSING BATON
        learnedSyllables: manualState?.learnedSyllables
      });
    }
  };

  if (!isActive || !gameConfig) {
    return null;
  }

  // ✅ UPDATED: Restore progress when exiting back to Manual
const handleEarlyExit = (autoData) => {
  console.log('[Engine] Early exit - switching to Manual mode (round selection)');
  console.log('[Engine] Auto mode passed this data:', autoData);
  
  setSelectedMode('manual');
  setShowModeModal(false);
  setManualModeKey(prev => prev + 1);
  
 // ⭐ Don't use autoData.completedRounds (it's not reliable)
// Use savedGameState which has the real manual progress
const preservedRounds = savedGameState?.completedRounds || [];
const preservedSyllables = autoData?.learnedSyllables || savedGameState?.learnedSyllables || [];
const preservedRewards = autoData?.visualRewards || savedGameState?.visualRewards || {};
const preservedElephants = autoData?.activatedElephants || savedGameState?.activatedElephants || {};
  
  console.log('[Engine] Preserving progress for manual return:', {
    rounds: preservedRounds,
    rewards: Object.keys(preservedRewards)
  });

  if (onSaveGameState) {
    const nextState = {
      savedGameMode: 'manual',
      gameId: gameConfig.id,
      gameState: 'roundSelection',
      
      // ⭐ Save the preserved progress
      completedRounds: preservedRounds,
      learnedSyllables: preservedSyllables,
      visualRewards: preservedRewards,
      activatedElephants: preservedElephants,
      
      // Clear active round data
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
  onPhaseComplete: (data) => {
    if (data?.isEarlyExit) {
      handleEarlyExit(data);  // ⭐ Pass the data from Auto mode!
      return;
    }
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
        />
      )}
    </>
  );
};

export default MemoryGameEngine;