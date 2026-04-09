// zones/shloka-river/scenes/Scene3/KurumeDevaGame.jsx
// Thin wrapper for KurumeDeva game - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

// Kurumedeva game assets - Animals, Items, Decorations (4 syllables: kuru, me, de, va)
import animal1Ku from './assets/images/Kurumedeva/animal1-ku.png';
import animal2Ru from './assets/images/Kurumedeva/animal2-ru.png';
import animal3Me from './assets/images/Kurumedeva/animal3-me.png';
import animal4De from './assets/images/Kurumedeva/animal4-de.png';

import decor1Ku from './assets/images/Kurumedeva/decor1-ku.png';
import decor2Ru from './assets/images/Kurumedeva/decor2-ru.png';
import decor3Me from './assets/images/Kurumedeva/decor3-me.png';
import decor4De from './assets/images/Kurumedeva/decor4-de.png';

const KurumeDevaGame = ({
  selectedMode, skipModeSelection, isActive, isReload, savedGameState,
  onSaveGameState, onPhaseComplete, onGameComplete, hideElements,
  isAudioOn, playAudio, profileName, RainbowComponent, onMicroWin
}) => {

  // Get KurumeDeva config
  const gameConfig = getGameConfig('kurumedeva');

  // Map all asset getters
 const assetGetters = {
    // Clickers -> Animals
    getAnimalKuImage: () => animal1Ku,
    getAnimalRuImage: () => animal2Ru,
    getAnimalMeImage: () => animal3Me,
    getAnimalDeImage: () => animal4De,
    
    // ✅ Added VA (Mapped to Ru image for now, or change to whatever image you want)
    getAnimalVaImage: () => animal2Ru, 

    // Rewards -> Decors
    getDecorKuImage: () => decor1Ku,
    getDecorRuImage: () => decor2Ru,
    getDecorMeImage: () => decor3Me,
    getDecorDeImage: () => decor4De,
  };

  // Validation
  if (!gameConfig) {
    console.error('❌ KurumeDevaGame: Config not found for "kurumedeva"');
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
export default KurumeDevaGame;
