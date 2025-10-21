// zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx
// Thin wrapper for Nirvighnam game - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const NirvighnamGame = ({
  isActive,
  hideElements,
  onPhaseComplete,
  onGameComplete,
  profileName,

  // Assets for Nirvighnam (singers, clickers, dual rewards)
  getLeafRirImage,       // Singer for 'nir'
  getDrumVighImage,      // Singer for 'vigh'
  getFeatherNamImage,    // Singer for 'nam'
  getFrogNirImage,       // Clicker/reward for 'nir'
  getSnailVighImage,     // Clicker/reward for 'vigh'
  getTurtleNamImage,     // Clicker/reward for 'nam'
  getStone1NirImage,     // Stone initial for 'nir'
  getStone2VighImage,    // Stone initial for 'vigh'
  getStone3NamImage,     // Stone initial for 'nam'
  getStone1NirColImage,  // Stone reward for 'nir'
  getStone2VighColImage, // Stone reward for 'vigh'
  getStone3NamColImage,  // Stone reward for 'nam'

  // Mode control
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState,

  // Audio
  isAudioOn,
  playAudio
}) => {

  // Get Nirvighnam config
  const gameConfig = getGameConfig('nirvighnam');

  // Map all asset getters
  const assetGetters = {
    getLeafRirImage,
    getDrumVighImage,
    getFeatherNamImage,
    getFrogNirImage,
    getSnailVighImage,
    getTurtleNamImage,
    getStone1NirImage,
    getStone2VighImage,
    getStone3NamImage,
    getStone1NirColImage,
    getStone2VighColImage,
    getStone3NamColImage
  };

  // Validation
  if (!gameConfig) {
    console.error('❌ NirvighnamGame: Config not found for "nirvighnam"');
    return null;
  }

  return (
    <MemoryGameEngine
      gameConfig={gameConfig}
      assetGetters={assetGetters}
      isActive={isActive}
      hideElements={hideElements}
      onPhaseComplete={onPhaseComplete}
      onGameComplete={onGameComplete}
      profileName={profileName}
      selectedMode={selectedMode}
      skipModeSelection={skipModeSelection}
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
      isAudioOn={isAudioOn}
      playAudio={playAudio}
    />
  );
};

export default NirvighnamGame;
