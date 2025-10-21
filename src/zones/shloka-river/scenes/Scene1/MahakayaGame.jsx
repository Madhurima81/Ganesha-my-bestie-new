// zones/shloka-river/scenes/Scene1/MahakayaGame.jsx
// ✅ BUG 9 FIX: Apply same skipModeSelection pattern as VakratundaGame

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const MahakayaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ✅ BUG 6 & 8 FIX: Assets specific to Mahakaya game (BOTH initial and reward)
  getSeedImage,           // Initial state (seed)
  getFlowerImage,         // Reward state (flower)
  getAdultElephantImage,

  // ✅ BUG 9 FIX: Mode control props (same as VakratundaGame)
  selectedMode,
  skipModeSelection,

  isReload,
  savedGameState,
  onSaveGameState
}) => {

  const gameConfig = getGameConfig('mahakaya');

  // ✅ BUG 6 & 8: Map BOTH initial and reward asset getters
  const assetGetters = {
    getSeedImage,          // matches: gameConfig.elements.singer.assetGetterInitial
    getFlowerImage,        // matches: gameConfig.elements.singer.assetGetterReward
    getAdultElephantImage  // matches: gameConfig.elements.clicker.assetGetter
  };

  if (!gameConfig) {
    console.error('❌ MahakayaGame: Config not found');
    return null;
  }

  if (!powerGained) {
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
      selectedMode={selectedMode}          // ✅ BUG 9: Pass through
      skipModeSelection={skipModeSelection} // ✅ BUG 9: Pass through
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
    />
  );
};

export default MahakayaGame;