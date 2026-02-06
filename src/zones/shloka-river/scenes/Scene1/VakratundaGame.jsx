// zones/shloka-river/scenes/Scene1/VakratundaGame.jsx
// Thin wrapper for Game 1 - connects config to engine

import React from 'react';
import MemoryGameEngine from '../../core/MemoryGameEngine';
import { getGameConfig } from '../../configs/gameConfigs';

import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantBabyKra from './assets/images/vakratunda/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/vakratunda/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/vakratunda/elephant-baby-da.png';

import budVa from './assets/images/vakratunda/va-bud.png';
import budKra from './assets/images/vakratunda/kra-bud.png';
import budTun from './assets/images/vakratunda/tun-bud.png';
import budDa from './assets/images/vakratunda/da-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import lotusKra from './assets/images/vakratunda/kra-lotus.png';
import lotusTun from './assets/images/vakratunda/tun-lotus.png';
import lotusDa from './assets/images/vakratunda/da-lotus.png';

const VakratundaGame = ({
  isActive,
  hideElements,
  powerGained,
  onPhaseComplete,
  onGameComplete,
  profileName,
  WaterSprayComponent,

  // ✅ BUG 6 & 8 FIX: Assets specific to Vakratunda game (BOTH initial and reward)
  getBudImage,              // Initial state (bud)
  getLotusImage,            // Reward state (lotus)
  getBabyElephantImage,

  // Mode control - ⭐ NEW
  selectedMode,
  skipModeSelection,

  // Reload support
  isReload,
  savedGameState,
  onSaveGameState,

  // Voice Guidance - ⭐ NEW
  voiceGuidance
}) => {

  // Get Vakratunda config from your gameConfigs.js
  const gameConfig = getGameConfig('vakratunda');

  // ✅ BUG 6 & 8: Map BOTH initial and reward asset getters
  // These names MUST match gameConfig's assetGetterInitial and assetGetterReward fields
const assetGetters = {
    // Clickers
    getElephantVaImage: () => elephantBabyVa,
    getElephantKraImage: () => elephantBabyKra,
    getElephantTunImage: () => elephantBabyTun,
    getElephantDaImage: () => elephantBabyDa,

    // Round Rewards
    getBudVaImage: () => budVa,
    getLotusVaImage: () => lotusVa,
    getBudTunImage: () => budTun,
    getLotusTunImage: () => lotusTun,
    getBudKraImage: () => budKra,
    getLotusKraImage: () => lotusKra,
  };

  // Validation: Make sure config exists
  if (!gameConfig) {
    console.error('❌ VakratundaGame: Config not found for "vakratunda"');
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
      selectedMode={selectedMode}          // ⭐ PASS THROUGH
      skipModeSelection={skipModeSelection} // ⭐ PASS THROUGH
      isReload={isReload}
      savedGameState={savedGameState}
      onSaveGameState={onSaveGameState}
      gamePrefix="vakratunda"
      voiceGuidance={voiceGuidance}        // ⭐ VOICE GUIDANCE
    />
  );
};

export default VakratundaGame;