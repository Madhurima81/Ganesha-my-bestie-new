// zones/shloka-river/scenes/Scene5/SarvadaGame.jsx
// Thin wrapper for Game 8 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const SarvadaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ⭐ CHANGED: Assets specific to Sarvada game
  getSarvadaSadAnimalImage,    // Initial state (sad animal)
  getSarvadaHappyAnimalImage,  // Reward state (happy animal)
  getSarvadaHelperImage,       // Clicker (helper animal)

  // Mode control
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState
}) => {

  // ⭐ CHANGED: Get Sarvada config
  const gameConfig = getGameConfig('sarvada');

  // ⭐ CHANGED: Map asset getters to config names
  const assetGetters = {
    getSarvadaSadAnimalImage,   // matches: gameConfig.elements.singer.assetGetterInitial
    getSarvadaHappyAnimalImage, // matches: gameConfig.elements.singer.assetGetterReward
    getSarvadaHelperImage       // matches: gameConfig.elements.clicker.assetGetter
  };

  if (!gameConfig) {
    console.error('❌ SarvadaGame: Config not found for "sarvada"');
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

export default SarvadaGame;