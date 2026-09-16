import React from 'react';
import BeatPlayerGame from '../../../lib/beatPlayer/BeatPlayerGame';
import flowJson from './kurumedevaFlowSample.json';

// Verification preview for Madhurima's real KurumeDeva editor export.
// Not wired into any live scene.

import bg from '../../../zones/shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.png';
import bridgeBroken from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-broken.webp';
import shortLog from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/short-single-support-log.webp';
import supportLogsPair from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-support-logs.webp';
import logsBare from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/logs-bare.webp';
import monkeyPlayingTwig from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-playing-twig.webp';
import beaverIdleWorried from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.webp';
import beaverAsking from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-asking.webp';
import beaverTired from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-tired.webp';
import babyBeaverWaving from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/baby-beaver-waving.webp';
import elephantIdleBanana from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-idle-banana.webp';
import helpBubbleElephantLogs from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-elephant-logs.webp';
import helpBubbleMonkeyKnot from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-monkey-knot.webp';
import ropeKnot from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/rope-knot.webp';
import beaverCrossing from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-crossing.webp';
import beaverPlacingPlank from '../../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-placing-plank.webp';
import beaverLiftUpload from './uploads/beaver-lift.webp';
import elephantLiftUpload from './uploads/elephant-lift.webp';
import beaverTieUpload from './uploads/beaver-tie.webp';
import monkeyTieUpload from './uploads/monkey-tie.webp';
import logTieUpload from './uploads/log-tie.webp';
import plankUpload from './uploads/plank.webp';

const ASSET_MAP = {
  'Bridge/bridge-broken.png': bridgeBroken,
  'Bridge/short-single-support-log.png': shortLog,
  'Bridge/bridge-support-logs.png': supportLogsPair,
  'Bridge/logs-bare.png': logsBare,
  'Bridge/rope-knot.png': ropeKnot,
  'Characters/monkey-playing-twig.png': monkeyPlayingTwig,
  'Characters/beaver-idle-worried.png': beaverIdleWorried,
  'Characters/beaver-asking.png': beaverAsking,
  'Characters/beaver-tired.png': beaverTired,
  'Characters/beaver-crossing.png': beaverCrossing,
  'Characters/beaver-placing-plank.png': beaverPlacingPlank,
  'Characters/baby-beaver-waving.png': babyBeaverWaving,
  'Characters/elephant-idle-banana.png': elephantIdleBanana,
  'Characters/help-bubble-elephant-logs.png': helpBubbleElephantLogs,
  'Characters/help-bubble-monkey-knot.png': helpBubbleMonkeyKnot,
  'assets/upload_1.png': beaverLiftUpload,
  'assets/upload_2.png': elephantLiftUpload,
  'assets/upload_3.png': beaverTieUpload,
  'assets/upload_4.png': monkeyTieUpload,
  'assets/upload_6.png': logTieUpload,
  'assets/upload_7.png': plankUpload,
};

function KurumeDevaBeatPlayerPreview(props) {
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [layoutDebug, setLayoutDebug] = React.useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: '#333' }}>
      <img src={bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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
        movementMs={1000}
        reactionPauseMs={900}
      />
    </div>
  );
}

export default KurumeDevaBeatPlayerPreview;
