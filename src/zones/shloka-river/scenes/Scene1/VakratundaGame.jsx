// zones/shloka-river/scenes/Scene1/VakratundaGame.jsx
// Thin wrapper for Game 1 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const VakratundaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ✅ BUG 6 & 8 FIX: Assets specific to Vakratunda game (BOTH initial and reward)
  getBudImage,              // Initial state (bud)
  getLotusImage,            // Reward state (lotus)
  getBabyElephantImage,

  // Mode control - ⭐ NEW
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState
}) => {

  // Get Vakratunda config from your gameConfigs.js
  const gameConfig = getGameConfig('vakratunda');

  // ✅ BUG 6 & 8: Map BOTH initial and reward asset getters
  // These names MUST match gameConfig's assetGetterInitial and assetGetterReward fields
  const assetGetters = {
    getBudImage,             // matches: gameConfig.elements.singer.assetGetterInitial
    getLotusImage,           // matches: gameConfig.elements.singer.assetGetterReward
    getBabyElephantImage     // matches: gameConfig.elements.clicker.assetGetter
  };

  // Validation: Make sure config exists
  if (!gameConfig) {
    console.error('❌ VakratundaGame: Config not found for "vakratunda"');
    return null;
  }

  return (
    <MemoryGameEngine
      gameConfig={gameConfig}
      assetGetters={assetGetters}
      isActive={isActive}
      hideElements={hideElements}
      powerGained={powerGained}
      onPhaseComplete={onPhaseComplete}
      onGameComplete={onGameComplete}
      profileName={profileName}
      WaterSprayComponent={WaterSprayComponent}
      selectedMode={selectedMode}          // ⭐ PASS THROUGH
      skipModeSelection={skipModeSelection} // ⭐ PASS THROUGH
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
    />
  );
};

export default VakratundaGame;