import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

// 1. IMPORTS
// Sarvada game assets
import savButterflyHappy from './assets/images/sarvada/sav-butterfly-happy.png';
import savButterflyHelper from './assets/images/sarvada/sav-butterfly-helper.png';
import savButterflySad from './assets/images/sarvada/sav-butterfly-sad.png';
import vaFawnHappy from './assets/images/sarvada/va-fawn-happy.png';
import vaFawnHelper from './assets/images/sarvada/va-fawn-helper.png';
import vaFawnSad from './assets/images/sarvada/va-fawn-sad.png';
import daHedgehogHappy from './assets/images/sarvada/da-hedgehog-happy.png';
import daHedgehogHelper from './assets/images/sarvada/da-hedgehog-helper.png';
import daHedgehogSad from './assets/images/sarvada/da-hedgehog-sad.png';

const SarvadaGame = ({
  selectedMode, skipModeSelection, isActive, isReload, savedGameState,
  onSaveGameState, onPhaseComplete, onGameComplete, hideElements,
  isAudioOn, playAudio, profileName, RainbowComponent, onMicroWin
}) => {
  const gameConfig = getGameConfig('sarvada');

  // 2. MAP
  const assetGetters = {
    // Clickers
    getButterflyHelper: () => savButterflyHelper,
    getFawnHelper:      () => vaFawnHelper,
    getHedgehogHelper:  () => daHedgehogHelper,

    // Rewards
    getButterflySad:   () => savButterflySad,
    getButterflyHappy: () => savButterflyHappy,
    getFawnSad:        () => vaFawnSad,
    getFawnHappy:      () => vaFawnHappy,
    getHedgehogSad:    () => daHedgehogSad,
    getHedgehogHappy:  () => daHedgehogHappy
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
      onMicroWin={onMicroWin}
    />
  );
};

export default SarvadaGame;