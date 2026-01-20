// zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx
// Wrapper for Suryakoti memory game using MemoryGameEngine

import React from 'react';
import MemoryGameEngine from '../../../core/MemoryGameEngine';
import { getGameConfig } from '../../../configs/gameConfigs';

const SuryakotiGame = ({
  // Assets (BOTH initial and reward)
  getClosedFlowerImage,      // Initial state (wilted)
  getOpenFlowerImage,         // Reward state (bloomed)
  getSunOrbImage,            // Clickers

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

  // Components
  SunRayComponent
}) => {
  const gameConfig = getGameConfig('suryakoti');

  // Asset getters object for MemoryGameEngine
  const assetGetters = {
    getClosedFlowerImage,     // matches: assetGetterInitial from config
    getOpenFlowerImage,        // matches: assetGetterReward from config
    getSunOrbImage
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
      WaterSprayComponent={SunRayComponent}
    />
  );
};

export default SuryakotiGame;
