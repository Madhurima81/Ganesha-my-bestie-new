import React, { useState } from 'react';
import BeatPlayerGame from '../../../../lib/beatPlayer/BeatPlayerGame';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import flowJson from './tuskNestFlow.json';
import './TuskPathGame.css'; // reuse the existing stage/background sizing rules

// Shared animal idle art (same source used by Eyes/Ears games)
import monkeyIdle from './assets/images/monkey-new.webp';
import cowIdle from './assets/images/cow-new.webp';
import elephantIdle from './assets/images/elephant-new1.webp';
import peacockIdle from './assets/images/peacock-new.webp';
import bunnySad from './assets/images/tusk-giving/bunny_01_tired.webp';
import bunnyHappy from './assets/images/tusk-giving/bunny_06_happy_recovered.webp';
import bgImg from './assets/images/tusk-giving/symbol_mountain_3_bg.webp';

// Nest-rebuild items — the four imperfect-but-useful things each animal
// keeps beside it, dragged into the nest one at a time.
import brokenTwig from './assets/images/tusk-nest/broken-twig.webp';
import grassBundle from './assets/images/tusk-nest/grass-bundle.webp';
import tornLeaf from './assets/images/tusk-nest/leaf.webp';
import bentFeather from './assets/images/tusk-nest/feather.webp';
import nest0 from './assets/images/tusk-nest/nest-0.webp';
import nest1 from './assets/images/tusk-nest/nest-1.webp';
import nest2 from './assets/images/tusk-nest/nest-2.webp';
import nest3 from './assets/images/tusk-nest/nest-3.webp';
import nest4 from './assets/images/tusk-nest/nest-4.webp';
import babyBird from './assets/images/tusk-nest/baby-bird.webp';

const ASSET_MAP = {
  'monkey-idle': monkeyIdle,
  'cow-idle': cowIdle,
  'elephant-idle': elephantIdle,
  'peacock-idle': peacockIdle,
  'bunny-sad': bunnySad,
  'bunny-happy': bunnyHappy,
  'broken-twig': brokenTwig,
  'grass-bundle': grassBundle,
  'leaf': tornLeaf,
  'feather': bentFeather,
  'nest-0': nest0,
  'nest-1': nest1,
  'nest-2': nest2,
  'nest-3': nest3,
  'nest-4': nest4,
  'baby-bird': babyBird,
};

// Tusk game — Bunny's baby bird lost its nest. Monkey, cow, elephant, and
// peacock each keep one imperfect-but-useful thing beside them (a broken
// twig, short grass, a torn leaf, a bent feather); the child drags each one
// into the nest, which rebuilds visibly (nest-0 through nest-4) until the
// baby bird settles in and Bunny is happy. Replaces the earlier "give Bunny
// something it likes" flow (mango/water/grass/feather), which read as
// generosity rather than the tusk's "broken things can still help" meaning.
// See tuskNestFlow.json for the beat-by-beat story and VO.
function TuskBeatPlayerLive({ isActive = true, isAudioOn = true, onGameComplete, className = '' }) {
  const [isPaused, setIsPaused] = useState(false);
  useAppVisibility(
    () => setIsPaused(true),
    () => setIsPaused(false)
  );

  return (
    <div className={`tusk-giving-game ${className}`}>
      <img className="tusk-bg" src={bgImg} alt="" />
      <BeatPlayerGame
        flowJson={flowJson}
        assetMap={ASSET_MAP}
        isActive={isActive}
        isAudioOn={isAudioOn}
        isPaused={isPaused}
        autoAdvanceMs={650}
        movementMs={400}
        reactionPauseMs={550}
        onComplete={onGameComplete}
      />
    </div>
  );
}

export default TuskBeatPlayerLive;
