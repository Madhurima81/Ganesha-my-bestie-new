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
  
  // Assets specific to Vakratunda game
  getLotusImage,
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
  
  // Map your asset getters to match config expectations
  // These names MUST match what's in your gameConfig's assetGetter fields
  const assetGetters = {
    getLotusImage,           // matches: gameConfig.elements.singer.assetGetter = 'getLotusImage'
    getBabyElephantImage     // matches: gameConfig.elements.clicker.assetGetter = 'getBabyElephantImage'
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