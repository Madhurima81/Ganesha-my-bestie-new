// zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx
// Wrapper for Samaprabha memory game using MemoryGameEngine

import React from 'react';
import MemoryGameEngine from '../../../core/MemoryGameEngine';
import { getGameConfig } from '../../../configs/gameConfigs';

import rainbowRed from '../assets/images/Samaprabha/rainbow-red.png';
import rainbowBlue from '../assets/images/Samaprabha/rainbow-blue.png';
import rainbowGreen from '../assets/images/Samaprabha/rainbow-green.png';
import rainbowPurple from '../assets/images/Samaprabha/rainbow-purple.png';

import bunnySad from '../assets/images/Samaprabha/bunny-sad.png';
import bunnyHappy from '../assets/images/Samaprabha/bunny-happy.png';
import kittenSad from '../assets/images/Samaprabha/kitten-sad.png';
import kittenHappy from '../assets/images/Samaprabha/kitten-happy.png';
import puppySad from '../assets/images/Samaprabha/puppy-sad.png';
import puppyHappy from '../assets/images/Samaprabha/puppy-happy.png';
import squirrelSad from '../assets/images/Samaprabha/squirrel-sad.png';
import squirrelHappy from '../assets/images/Samaprabha/squirrel-happy.png';

const SamaprabhaGame = ({
  // Assets (BOTH initial and reward)
  getSadAnimalImage,         // Initial state (sad animals)
  getHappyAnimalImage,       // Reward state (happy animals)
  getRainbowImage,           // Clickers

  // Mode props from scene
  selectedMode,
  skipModeSelection,

  // Scene integration
  isActive,
  isReload,
  savedGameState,
  onSaveGameState,
  onPhaseComplete,
  onGameComplete,
  hideElements,
  isAudioOn,
  playAudio,
  profileName,

  // Optional components
  RainbowComponent,
  onMicroWin
}) => {
  const gameConfig = getGameConfig('samaprabha');

  // Asset getters object for MemoryGameEngine
  const assetGetters = {

     // Rainbows (Clickers)
    getRainbowSaImage: () => rainbowRed,
    getRainbowMaImage: () => rainbowBlue,
    getRainbowPraImage: () => rainbowGreen,
    getRainbowBhaImage: () => rainbowPurple,

    // Animals (Rewards by Round)
    getSadAnimal1Image: () => bunnySad,
    getHappyAnimal1Image: () => bunnyHappy,
    
    getSadAnimal2Image: () => kittenSad,
    getHappyAnimal2Image: () => kittenHappy,
    
    getSadAnimal3Image: () => puppySad,
    getHappyAnimal3Image: () => puppyHappy,
    
    getSadAnimal4Image: () => squirrelSad,
    getHappyAnimal4Image: () => squirrelHappy,
    
    getSadAnimalImage,        // matches: assetGetterInitial from config
    getHappyAnimalImage,      // matches: assetGetterReward from config
    getRainbowImage
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
            //gamePrefix="samaprabha"  // ← ADD THIS LINE!

    />
  );
};

export default SamaprabhaGame;
