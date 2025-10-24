// zones/shloka-river/scenes/Scene5/SarvakaryeshuGame.jsx
// Thin wrapper for Game 7 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const SarvakaryeshuGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ⭐ CHANGED: Assets specific to Sarvakaryeshu game
  getSarvakaryeshuSadAnimalImage,    // Initial state (sad animal)
  getSarvakaryeshuHappyAnimalImage,  // Reward state (happy animal)
  getSarvakaryeshuHelperImage,       // Clicker (helper animal)

  // Mode control
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState
}) => {

  // ⭐ CHANGED: Get Sarvakaryeshu config
  const gameConfig = getGameConfig('sarvakaryeshu');

  // ⭐ CHANGED: Map asset getters to config names
  const assetGetters = {
    getSarvakaryeshuSadAnimalImage,   // matches: gameConfig.elements.singer.assetGetterInitial
    getSarvakaryeshuHappyAnimalImage, // matches: gameConfig.elements.singer.assetGetterReward
    getSarvakaryeshuHelperImage       // matches: gameConfig.elements.clicker.assetGetter
  };

  if (!gameConfig) {
    console.error('❌ SarvakaryeshuGame: Config not found for "sarvakaryeshu"');
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

export default SarvakaryeshuGame;