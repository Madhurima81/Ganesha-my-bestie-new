import React from 'react';
import BeatPlayerGame from '../../../lib/beatPlayer/BeatPlayerGame';
import { getTuskNestFlow } from '../../../zones/symbol-mountain/scenes/tusk/tuskNestFlowSelect';
import '../../../zones/symbol-mountain/scenes/tusk/TuskPathGame.css'; // .tusk-giving-game stage sizing

// Layout-debug harness for the new nest-rebuild Tusk flow — drag any
// element, edit its exact x/y/scale/rotation in the panel, and copy the
// updated beat JSON back into tuskNestFlow.json. Not wired into any live
// scene; reach it via `?game=sm-tusk-nest-debug` in game-test.

import monkeyIdle from '../../../zones/symbol-mountain/scenes/tusk/assets/images/monkey-new.webp';
import cowIdle from '../../../zones/symbol-mountain/scenes/tusk/assets/images/cow-new.webp';
import elephantIdle from '../../../zones/symbol-mountain/scenes/tusk/assets/images/elephant-new1.webp';
import peacockIdle from '../../../zones/symbol-mountain/scenes/tusk/assets/images/peacock-new.webp';
import bunnyHelping from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/bunny-helping.webp';
import bgImg from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/symbol_mountain_3_bg.webp';

import brokenTwig from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/broken-twig.webp';
import grassBundle from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/grass-bundle.webp';
import tornLeaf from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/leaf.webp';
import bentFeather from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/feather.webp';
import nest0 from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/nest-0.webp';
import nest1 from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/nest-1.webp';
import nest2 from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/nest-2.webp';
import nest3 from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/nest-3.webp';
import nest4 from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/nest-4.webp';
import babyBirdSad from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/baby-bird-sad.webp';
import babyBirdHappy from '../../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-nest/baby-bird-happy.webp';

const ASSET_MAP = {
  'monkey-idle': monkeyIdle,
  'cow-idle': cowIdle,
  'elephant-idle': elephantIdle,
  'peacock-idle': peacockIdle,
  'bunny-helping': bunnyHelping,
  'broken-twig': brokenTwig,
  'grass-bundle': grassBundle,
  'leaf': tornLeaf,
  'feather': bentFeather,
  'nest-0': nest0,
  'nest-1': nest1,
  'nest-2': nest2,
  'nest-3': nest3,
  'nest-4': nest4,
  'baby-bird-sad': babyBirdSad,
  'baby-bird-happy': babyBirdHappy,
};

function TuskNestBeatPlayerPreview(props) {
  // Phone viewport edits tuskNestFlowPhone.json; iPad/desktop edits tuskNestFlow.json.
  const [flowJson] = React.useState(getTuskNestFlow);
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [layoutDebug, setLayoutDebug] = React.useState(true);

  return (
    // Same wrapper class as the live scene (TuskBeatPlayerLive) so this harness
    // gets the same sizing — 4:3 normally, fills the stage on phone landscape.
    <div className="tusk-giving-game" style={{ background: '#333', borderRadius: 0 }}>
      <img src={bgImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <button
        type="button"
        onClick={() => setIsAudioOn((v) => !v)}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 100,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 20,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label={isAudioOn ? 'Mute' : 'Unmute'}
        title={isAudioOn ? 'Mute' : 'Unmute'}
      >
        {isAudioOn ? '🔊' : '🔇'}
      </button>
      <button
        type="button"
        onClick={() => setLayoutDebug((v) => !v)}
        style={{
          position: 'absolute', top: 10, right: 62, zIndex: 100,
          height: 44, borderRadius: 22, border: 'none', padding: '0 14px',
          background: layoutDebug ? '#03A9F4' : 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 13,
          fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
        }}
        title="Toggle Layout Debug — drag elements, edit exact position/scale, copy JSON"
      >
        {layoutDebug ? '📐 layout on' : '📐 layout'}
      </button>
      <BeatPlayerGame
        {...props}
        flowJson={flowJson}
        assetMap={ASSET_MAP}
        isAudioOn={isAudioOn}
        layoutDebug={layoutDebug}
        autoAdvanceMs={650}
        movementMs={400}
        reactionPauseMs={550}
      />
    </div>
  );
}

export default TuskNestBeatPlayerPreview;
