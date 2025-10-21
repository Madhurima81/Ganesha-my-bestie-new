// zones/shloka-river/scenes/Scene3/KurumeDevaGame.jsx
// Thin wrapper for KurumeDeva game - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

const KurumeDevaGame = ({
  isActive,
  hideElements,
  onPhaseComplete,
  onGameComplete,
  profileName,

  // Assets for KurumeDeva (singers: animals, clickers: items, rewards: decorations)
  getAnimal1KuImage,    // Singer for 'kuru'
  getAnimal3MeImage,    // Singer for 'me'
  getAnimal4DeImage,    // Singer for 'de'
  getAnimal2RuImage,    // Singer for 'va'
  getItem1KuImage,      // Clicker/initial for 'kuru'
  getItem3MeImage,      // Clicker/initial for 'me'
  getItem4DeImage,      // Clicker/initial for 'de'
  getItem2RuImage,      // Clicker/initial for 'va'
  getDecor1KuImage,     // Reward for 'kuru'
  getDecor3MeImage,     // Reward for 'me'
  getDecor4DeImage,     // Reward for 'de'
  getDecor2RuImage,     // Reward for 'va'

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

  // Get KurumeDeva config
  const gameConfig = getGameConfig('kurumedeva');

  // Map all asset getters
  const assetGetters = {
    getAnimal1KuImage,
    getAnimal3MeImage,
    getAnimal4DeImage,
    getAnimal2RuImage,
    getItem1KuImage,
    getItem3MeImage,
    getItem4DeImage,
    getItem2RuImage,
    getDecor1KuImage,
    getDecor3MeImage,
    getDecor4DeImage,
    getDecor2RuImage
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

export default KurumeDevaGame;
