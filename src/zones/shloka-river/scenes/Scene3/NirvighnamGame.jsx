// zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx
// Thin wrapper for Nirvighnam game - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

// Nirvighnam game assets - Animals, Objects, Stones
import frogNir from './assets/images/nirvighnam/nir-frog.png';
import snailVigh from './assets/images/nirvighnam/nir-snail.png';
import turtleNam from './assets/images/nirvighnam/nir-turtle.png';

import stone1Nir from './assets/images/nirvighnam/stone1.png';
import stone2Vigh from './assets/images/nirvighnam/stone2.png';
import stone3Nam from './assets/images/nirvighnam/stone3.png';
import stone1NirCol from './assets/images/nirvighnam/stone1-col.png';
import stone2VighCol from './assets/images/nirvighnam/stone2-col.png';
import stone3NamCol from './assets/images/nirvighnam/stone3-col.png';

const NirvighnamGame = ({
  selectedMode, skipModeSelection, isActive, isReload, savedGameState,
  onSaveGameState, onPhaseComplete, onGameComplete, hideElements,
  isAudioOn, playAudio, profileName, RainbowComponent, onMicroWin
}) => {
  const gameConfig = getGameConfig('nirvighnam');

  // Map all asset getters
 const assetGetters = {
    // Clickers
    getFrogNirImage: () => frogNir,
    getSnailVighImage: () => snailVigh,
    getTurtleNamImage: () => turtleNam,

    // Rewards
    getStone1NirImage: () => stone1Nir,
    getStone1NirColImage: () => stone1NirCol,
    getStone2VighImage: () => stone2Vigh,
    getStone2VighColImage: () => stone2VighCol,
    getStone3NamImage: () => stone3Nam,
    getStone3NamColImage: () => stone3NamCol,
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
      onMicroWin={onMicroWin}
    />
  );
};

export default NirvighnamGame;
