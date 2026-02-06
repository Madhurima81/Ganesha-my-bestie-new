// zones/shloka-river/scenes/Scene1/MahakayaGame.jsx
// ✅ BUG 9 FIX: Apply same skipModeSelection pattern as VakratundaGame

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

import elephantHa from './assets/images/mahakaya/elephant-ha.png';
import elephantKa from './assets/images/mahakaya/elephant-ka.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';
import elephantYa from './assets/images/mahakaya/elephant-ya.png';

import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';
import flowerHa from './assets/images/mahakaya/ha-flower.png';
import flowerKa from './assets/images/mahakaya/ka-flower.png';
import flowerYa from './assets/images/mahakaya/ya-flower.png';


const MahakayaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ✅ BUG 6 & 8 FIX: Assets specific to Mahakaya game (BOTH initial and reward)
  getSeedImage,           // Initial state (seed)
  getFlowerImage,         // Reward state (flower)
  getAdultElephantImage,

  // ✅ BUG 9 FIX: Mode control props (same as VakratundaGame)
  selectedMode,
  skipModeSelection,

  isReload,
  savedGameState,
  onSaveGameState,

  // Voice Guidance - ⭐ NEW
  voiceGuidance
}) => {

  const gameConfig = getGameConfig('mahakaya');

  // ✅ BUG 6 & 8: Map BOTH initial and reward asset getters
const assetGetters = {
    // Clickers
    getElephantMaImage: () => elephantMa,
    getElephantHaImage: () => elephantHa,
    getElephantKaImage: () => elephantKa,
    getElephantYaImage: () => elephantYa,

    // Rewards
    getSeedImage: () => seedImage, // Same seed for all
    getFlowerMaImage: () => flowerMa,
    getFlowerHaImage: () => flowerHa,
    getFlowerKaImage: () => flowerKa,
    getFlowerYaImage: () => flowerYa,
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
      selectedMode={selectedMode}          // ✅ BUG 9: Pass through
      skipModeSelection={skipModeSelection} // ✅ BUG 9: Pass through
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
      gamePrefix="mahakaya"
      voiceGuidance={voiceGuidance}        // ⭐ VOICE GUIDANCE
    />
  );
};

export default MahakayaGame;