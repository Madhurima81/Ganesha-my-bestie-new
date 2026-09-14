import React from 'react';
import BeatPlayerGame from '../../../lib/beatPlayer/BeatPlayerGame';
import flowJson from './kurumedevaFlowSample.json';

// Verification preview for Madhurima's real KurumeDeva editor export
// (Beat 1 only so far) — proves it plays through BeatPlayerGame unedited.
// Not wired into any live scene.

import bg from '../../../zones/shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.png';
import bridgeBroken from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-broken.png';
import monkeyPlayingTwig from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-playing-twig.png';
import beaverIdleWorried from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.png';
import babyBeaverWaving from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/baby-beaver-waving.png';
import elephantIdleBanana from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-idle-banana.png';

const ASSET_MAP = {
  'Bridge/bridge-broken.png': bridgeBroken,
  'Characters/monkey-playing-twig.png': monkeyPlayingTwig,
  'Characters/beaver-idle-worried.png': beaverIdleWorried,
  'Characters/baby-beaver-waving.png': babyBeaverWaving,
  'Characters/elephant-idle-banana.png': elephantIdleBanana,
};

function KurumeDevaBeatPlayerPreview(props) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: '#333' }}>
      <img src={bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <BeatPlayerGame {...props} flowJson={flowJson} assetMap={ASSET_MAP} />
    </div>
  );
}

export default KurumeDevaBeatPlayerPreview;
