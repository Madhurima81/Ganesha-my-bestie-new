// zones/shloka-river/scenes/Scene2/SuryakotiGame.jsx
// Thin wrapper for Game 3 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const SuryakotiGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ⭐ CHANGED: Assets specific to Suryakoti game (must match assetGetter names in gameConfigs.js)
  getClosedFlowerImage,   // Initial state (closed flower) -> matches assetGetterInitial
  getOpenFlowerImage,     // Reward state (open flower) -> matches assetGetterReward
  getSunOrbImage,         // Clicker (sun orb) -> matches assetGetter

  // Mode control
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState
}) => {

  // ⭐ CHANGED: Get Suryakoti config
  const gameConfig = getGameConfig('suryakoti');

  // ⭐ CHANGED: Map asset getters to config names
  const assetGetters = {
    getClosedFlowerImage,  // matches: gameConfig.elements.singer.assetGetterInitial
    getOpenFlowerImage,    // matches: gameConfig.elements.singer.assetGetterReward
    getSunOrbImage         // matches: gameConfig.elements.clicker.assetGetter
  };

  if (!gameConfig) {
    console.error('❌ SuryakotiGame: Config not found for "suryakoti"');
    return null;
  }
  
  // Note: The visibility logic (like if (!powerGained)) should ideally be handled 
  // by the parent scene if this component is part of a combined game flow.
  // We rely on isActive here.

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

export default SuryakotiGame;