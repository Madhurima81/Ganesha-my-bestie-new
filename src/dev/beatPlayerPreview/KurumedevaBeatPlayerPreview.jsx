import React, { useMemo } from 'react';
import BeatPlayerGame from '../../lib/beatPlayer/BeatPlayerGame';
import flowJson from './kurumedevaFlowSample.json';

// Verification harness for adapting Kurumedeva onto BeatPlayerGame — same
// pattern as TuskBeatPlayerPreview.jsx (step 1 of that rebuild). This is a
// SCAFFOLD, not a 1:1 port: the live KurumedevaGame.jsx has two mechanics
// this engine doesn't have a dedicated primitive for yet (a drag that always
// fails regardless of where it's released; an automatic multi-waypoint idle
// walk). Both are approximated here and flagged inline in
// kurumedevaFlowSample.json's `notes` fields — see those before treating this
// as final. Everything else (try+ask+place per helper, the 3-log/1-knot/
// 1-plank placements) maps onto the existing interaction vocabulary
// (press-hold, drag-drop, drag-path) with no engine changes.
// Not wired into any live scene; for `?game=shloka-kuru-beatplayer` in
// game-test only.

import bgImg from '../../zones/shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.png';

import bridgeBrokenImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-broken.png';
import bridgeSupportedImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-before-tying.png';
import bridgeCompleteImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-complete.png';

import elephantPullImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-pulling.png';
import elephantIdleBananaImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-idle-banana.png';
import elephantApproachingImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-approaching-walking.png';
import helpBubbleElephantImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-elephant-logs.png';

import monkeyTyingImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-tying.png';
import monkeyPlayingTwigImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-playing-twig.png';
import monkeyIdleImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-idle.png';
import helpBubbleMonkeyImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-monkey-knot.png';

import supportLogsObj from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-support-logs.png';
import shortLogObj from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/short-single-support-log.png';
import ropeObj from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/rope-knot.png';
import plankObj from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-single-plank.png';

import beaverAskingImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-asking.png';
import beaverIdleWorriedImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.png';
import beaverTryingPushImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-trying-push.png';
import beaverPlacingPlankImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-placing-plank.png';
import beaverCrossingImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-crossing.png';
import babyBeaverWavingImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/baby-beaver-waving.png';
import beaverBabyReunionImg from '../../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-baby-reunion.png';

// Flat "which asset is this" lookup, keyed by the editor-style path strings
// used in kurumedevaFlowSample.json. Same one-time manual step Tusk needed —
// once a real visual-editor export exists for Kurumedeva, these become real
// `upload://N` / repo-relative paths instead of hand-picked ones.
const ASSET_MAP = {
  'Bridge/bridge-broken.png': bridgeBrokenImg,
  'Bridge/bridge-before-tying.png': bridgeSupportedImg,
  'Bridge/bridge-complete.png': bridgeCompleteImg,
  'Characters/elephant-pulling.png': elephantPullImg,
  'Characters/elephant-idle-banana.png': elephantIdleBananaImg,
  'Characters/elephant-approaching-walking.png': elephantApproachingImg,
  'Characters/help-bubble-elephant-logs.png': helpBubbleElephantImg,
  'Characters/monkey-tying.png': monkeyTyingImg,
  'Characters/monkey-playing-twig.png': monkeyPlayingTwigImg,
  'Characters/monkey-idle.png': monkeyIdleImg,
  'Characters/help-bubble-monkey-knot.png': helpBubbleMonkeyImg,
  'Bridge/bridge-support-logs.png': supportLogsObj,
  'Bridge/short-single-support-log.png': shortLogObj,
  'Bridge/rope-knot.png': ropeObj,
  'Bridge/bridge-single-plank.png': plankObj,
  'Characters/beaver-asking.png': beaverAskingImg,
  'Characters/beaver-idle-worried.png': beaverIdleWorriedImg,
  'Characters/beaver-trying-push.png': beaverTryingPushImg,
  'Characters/beaver-placing-plank.png': beaverPlacingPlankImg,
  'Characters/beaver-crossing.png': beaverCrossingImg,
  'Characters/baby-beaver-waving.png': babyBeaverWavingImg,
  'Characters/beaver-baby-reunion.png': beaverBabyReunionImg,
};

export { ASSET_MAP, flowJson, bgImg };

function KurumedevaBeatPlayerPreview(props) {
  const missing = useMemo(() => new Set(), []);
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 22, overflow: 'hidden', background: '#d7ecff' }}>
      <img src={bgImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <BeatPlayerGame
        {...props}
        flowJson={flowJson}
        assetMap={ASSET_MAP}
        onMissingAsset={(path) => missing.add(path)}
      />
    </div>
  );
}

export default KurumedevaBeatPlayerPreview;
