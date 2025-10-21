// zones/shloka-river/scenes/Scene1/MahakayaGame.jsx
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
  getStoneImage,
  getAdultElephantImage,
  isReload,
  savedGameState,
  onSaveGameState
}) => {
  
  const gameConfig = getGameConfig('mahakaya');
  
  const assetGetters = {
    getStoneImage,
    getAdultElephantImage
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
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
    />
  );
};

export default MahakayaGame;