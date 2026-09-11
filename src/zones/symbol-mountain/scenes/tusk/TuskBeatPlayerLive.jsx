import React from 'react';
import BeatPlayerGame from '../../../../lib/beatPlayer/BeatPlayerGame';
import { ASSET_MAP, flowJson, bgImg } from '../../../../dev/beatPlayerPreview/TuskBeatPlayerPreview';
import './TuskPathGame.css'; // reuse the existing stage/background sizing rules

// Data-driven replacement for TuskPathGame — same props, but every position,
// pose, and VO line comes straight from the visual editor's own export
// (tuskFlowSample.json) instead of hand-transcribed JSX. See
// src/lib/beatPlayer/BeatPlayerGame.jsx for the engine and
// src/dev/beatPlayerPreview/ for the verification harness this was proven
// against first. TuskPathGame.jsx is kept as-is (still reachable via
// game-test's `sm-tusk` key) as a rollback path.
function TuskBeatPlayerLive({ isActive = true, isAudioOn = true, onGameComplete, className = '' }) {
  return (
    <div className={`tusk-giving-game ${className}`}>
      <img className="tusk-bg" src={bgImg} alt="" />
      <BeatPlayerGame
        flowJson={flowJson}
        assetMap={ASSET_MAP}
        isActive={isActive}
        isAudioOn={isAudioOn}
        autoAdvanceMs={650}
        movementMs={400}
        reactionPauseMs={550}
        onComplete={onGameComplete}
      />
    </div>
  );
}

export default TuskBeatPlayerLive;
