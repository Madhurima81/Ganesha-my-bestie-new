// zones/shloka-river/scenes/Scene1/MahakayaGame.jsx
// ✅ BUG 9 FIX: Apply same skipModeSelection pattern as VakratundaGame

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

import elephantSvg from './assets/images/elephant.svg';

import banyanSprout from './assets/images/banyan-sprout.svg';
import banyanSapling from './assets/images/banyan-sapling.svg';
import banyanHalf from './assets/images/banyan-half.svg';
import banyanFull from './assets/images/banyan-full.svg';


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

  voiceGuidance,
  isPaused,
  onMicroWin,
}) => {

  const gameConfig = getGameConfig('mahakaya');

  // ✅ BUG 6 & 8: Map BOTH initial and reward asset getters
const assetGetters = {
    // Clickers - single elephant for all
    getElephantMaImage: () => elephantSvg,
    getElephantHaImage: () => elephantSvg,
    getElephantKaImage: () => elephantSvg,
    getElephantYaImage: () => elephantSvg,

    // Rewards - banyan tree growth progression
    getBanyanSproutImage:  () => banyanSprout,
    getBanyanSaplingImage: () => banyanSapling,
    getBanyanHalfImage:    () => banyanHalf,
    getBanyanFullImage:    () => banyanFull,
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
      voiceGuidance={voiceGuidance}
      isPaused={isPaused}
      onMicroWin={onMicroWin}
    />
  );
};

export default MahakayaGame;