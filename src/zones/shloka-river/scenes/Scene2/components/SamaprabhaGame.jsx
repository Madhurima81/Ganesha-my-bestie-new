// zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx
// Wrapper for Samaprabha memory game using MemoryGameEngine

import React from 'react';
import MemoryGameEngine from '../../../core/MemoryGameEngine';
import { getGameConfig } from '../../../configs/gameConfigs';

const SamaprabhaGame = ({
  // Assets (BOTH initial and reward)
  getSadAnimalImage,         // Initial state (sad animals)
  getHappyAnimalImage,       // Reward state (happy animals)
  getRainbowImage,           // Clickers

  // Mode props from scene
  selectedMode,
  skipModeSelection,

  // Scene integration
  isActive,
  isReload,
  savedGameState,
  onSaveGameState,
  onPhaseComplete,
  onGameComplete,
  hideElements,
  isAudioOn,
  playAudio,
  profileName,

  // Optional components
  RainbowComponent
}) => {
  const gameConfig = getGameConfig('samaprabha');

  // Asset getters object for MemoryGameEngine
  const assetGetters = {
    getSadAnimalImage,        // matches: assetGetterInitial from config
    getHappyAnimalImage,      // matches: assetGetterReward from config
    getRainbowImage
  };

  return (
    <MemoryGameEngine
      gameConfig={gameConfig}
      assetGetters={assetGetters}
      selectedMode={selectedMode}
      skipModeSelection={skipModeSelection}
      isActive={isActive}
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
      onPhaseComplete={onPhaseComplete}
      onGameComplete={onGameComplete}
      hideElements={hideElements}
      isAudioOn={isAudioOn}
      playAudio={playAudio}
      profileName={profileName}
      WaterSprayComponent={RainbowComponent}
    />
  );
};

export default SamaprabhaGame;
