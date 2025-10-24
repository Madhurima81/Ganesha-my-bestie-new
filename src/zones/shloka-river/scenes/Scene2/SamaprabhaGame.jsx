
// zones/shloka-river/scenes/Scene2/SamaprabhaGame.jsx
// Thin wrapper for Game 4 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const SamaprabhaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ⭐ CHANGED: Assets specific to Samaprabha game (must match assetGetter names in gameConfigs.js)
  getSadAnimalImage,      // Initial state (sad animal) -> matches assetGetterInitial
  getHappyAnimalImage,    // Reward state (happy animal) -> matches assetGetterReward
  getRainbowImage,        // Clicker (rainbow) -> matches assetGetter

  // Mode control
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState
}) => {

  // ⭐ CHANGED: Get Samaprabha config
  const gameConfig = getGameConfig('samaprabha');

  // ⭐ CHANGED: Map asset getters to config names
  const assetGetters = {
    getSadAnimalImage,      // matches: gameConfig.elements.singer.assetGetterInitial
    getHappyAnimalImage,    // matches: gameConfig.elements.singer.assetGetterReward
    getRainbowImage         // matches: gameConfig.elements.clicker.assetGetter
  };

  if (!gameConfig) {
    console.error('❌ SamaprabhaGame: Config not found for "samaprabha"');
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
      selectedMode={selectedMode}          
      skipModeSelection={skipModeSelection} 
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
    />
  );
};

export default SamaprabhaGame;