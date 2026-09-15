import React from 'react';
import BeatPlayerGame from '../../../lib/beatPlayer/BeatPlayerGame';
import flowJson from './kurumedevaFlowSample.json';

// Verification preview for Madhurima's real KurumeDeva editor export.
// Not wired into any live scene.

import bg from '../../../zones/shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.png';
import bridgeBroken from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-broken.png';
import shortLog from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/short-single-support-log.png';
import monkeyPlayingTwig from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-playing-twig.png';
import beaverIdleWorried from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.png';
import beaverAsking from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-asking.png';
import babyBeaverWaving from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/baby-beaver-waving.png';
import elephantIdleBanana from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-idle-banana.png';
import helpBubbleElephantLogs from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-elephant-logs.png';
import beaverLiftUpload from './uploads/beaver-lift.png';
import elephantLiftUpload from './uploads/elephant-lift.png';

const ASSET_MAP = {
  'Bridge/bridge-broken.png': bridgeBroken,
  'Bridge/short-single-support-log.png': shortLog,
  'Characters/monkey-playing-twig.png': monkeyPlayingTwig,
  'Characters/beaver-idle-worried.png': beaverIdleWorried,
  'Characters/beaver-asking.png': beaverAsking,
  'Characters/baby-beaver-waving.png': babyBeaverWaving,
  'Characters/elephant-idle-banana.png': elephantIdleBanana,
  'Characters/help-bubble-elephant-logs.png': helpBubbleElephantLogs,
  'assets/upload_1.png': beaverLiftUpload,
  'assets/upload_2.png': elephantLiftUpload,
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
