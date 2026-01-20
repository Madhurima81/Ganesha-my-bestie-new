import React from 'react';
import MemoryGameEngine from '../../../core/MemoryGameEngine';
import { getGameConfig } from '../../../configs/gameConfigs';

// 1. IMPORTS
import sunflowerClose from '../assets/images/Suryakoti/sunflower-close.png';
import sunflowerOpen from '../assets/images/Suryakoti/sunflower-open.png';
import daisyClose from '../assets/images/Suryakoti/daisy-close.png';
import daisyOpen from '../assets/images/Suryakoti/daisy-open.png';
import roseClose from '../assets/images/Suryakoti/rose-close.png';
import roseOpen from '../assets/images/Suryakoti/rose-open.png';
import tulipClose from '../assets/images/Suryakoti/tulip-close.png';
import tulipOpen from '../assets/images/Suryakoti/tulip-open.png';
import sunOrb from '../assets/images/Suryakoti/suryakoti-sun.png';

const SuryakotiGame = ({
  selectedMode, skipModeSelection, isActive, isReload, savedGameState,
  onSaveGameState, onPhaseComplete, onGameComplete, hideElements,
  isAudioOn, playAudio, profileName, RainbowComponent
}) => {
  const gameConfig = getGameConfig('suryakoti');

  // 2. MAP
  const assetGetters = {
    // Clickers (Same image for all)
    getSunOrbImage: () => sunOrb,

    // Rewards
    getSunflowerClose: () => sunflowerClose,
    getSunflowerOpen: () => sunflowerOpen,
    getDaisyClose: () => daisyClose,
    getDaisyOpen: () => daisyOpen,
    getRoseClose: () => roseClose,
    getRoseOpen: () => roseOpen,
    getTulipClose: () => tulipClose,
    getTulipOpen: () => tulipOpen,
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
            //gamePrefix="suryakoti"  

    />
  );
};

export default SuryakotiGame;