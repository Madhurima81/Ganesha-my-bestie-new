import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

// Sarvakaryeshu game assets
import sarSquirrelHappy from './assets/images/sarvakaryeshu/sar-squirrel-happy.png';
import sarSquirrelHelper from './assets/images/sarvakaryeshu/sar-squirrel-helper.png';
import sarSquirrelSad from './assets/images/sarvakaryeshu/sar-squirrel-sad.png';
import vaBirdHappy from './assets/images/sarvakaryeshu/va-bird-happy.png';
import vaBirdHelper from './assets/images/sarvakaryeshu/va-bird-helper.png';
import vaBirdSad from './assets/images/sarvakaryeshu/va-bird-sad.png';
import karDuckHappy from './assets/images/sarvakaryeshu/kar-duck-happy.png';
import karDuckHelper from './assets/images/sarvakaryeshu/kar-duck-helper.png';
import karDuckSad from './assets/images/sarvakaryeshu/kar-duck-sad.png';
import yeshuRabbitHappy from './assets/images/sarvakaryeshu/yeshu-rabbit-happy.png';
import yeshuRabbitHelper from './assets/images/sarvakaryeshu/yeshu-rabbit-helper.png';
import yeshuRabbitSad from './assets/images/sarvakaryeshu/yeshu-rabbit-sad.png';

const SarvakaryeshuGame = ({
  selectedMode, skipModeSelection, isActive, isReload, savedGameState,
  onSaveGameState, onPhaseComplete, onGameComplete, hideElements,
  isAudioOn, playAudio, profileName, RainbowComponent
}) => {
  const gameConfig = getGameConfig('sarvakaryeshu');

  // 2. MAP
  const assetGetters = {
    // Clickers (Helpers)
    getSquirrelHelper: () => sarSquirrelHelper,
    getBirdHelper:     () => vaBirdHelper,
    getDuckHelper:     () => karDuckHelper,
    getRabbitHelper:   () => yeshuRabbitHelper,

    // Rewards (Sad -> Happy)
    getSquirrelSad:   () => sarSquirrelSad,
    getSquirrelHappy: () => sarSquirrelHappy,
    getBirdSad:       () => vaBirdSad,
    getBirdHappy:     () => vaBirdHappy,
    getDuckSad:       () =>karDuckSad,
    getDuckHappy:     () => karDuckHappy,
    getRabbitSad:     () => yeshuRabbitSad,
    getRabbitHappy:   () => yeshuRabbitHappy
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
    />
  );
};

export default SarvakaryeshuGame;