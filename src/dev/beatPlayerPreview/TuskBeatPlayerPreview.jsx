import React, { useMemo } from 'react';
import BeatPlayerGame from '../../lib/beatPlayer/BeatPlayerGame';
import flowJson from './tuskFlowSample.json';

// Verification harness for BeatPlayerGame, step 1 of the data-driven rebuild.
// This proves the SAME real export from the visual editor
// (tuskFlowSample.json, unedited) renders and plays correctly through the
// generic engine. The only hand-written thing here is the assetMap — a flat
// "which asset is this" lookup, not position transcription. Not wired into
// any live scene; for `?game=sm-tusk-beatplayer` in game-test only.

import monkeyIdleShared from '../../zones/symbol-mountain/scenes/tusk/assets/images/monkey-new.webp';
import elephantIdleShared from '../../zones/symbol-mountain/scenes/tusk/assets/images/elephant-new1.webp';
import elephantSpraying from '../../zones/symbol-mountain/scenes/tusk/assets/images/ears-game/elephant_04_sprays_water.png';
import elephantDrinking from '../../zones/symbol-mountain/scenes/tusk/assets/images/ears-game-v2/elephant_drinking.png';
import cowIdleShared from '../../zones/symbol-mountain/scenes/tusk/assets/images/cow-new.webp';
import cowEatingGrass from '../../zones/symbol-mountain/scenes/tusk/assets/images/ears-game-v2/cow_eating_grass.png';
import peacockIdleShared from '../../zones/symbol-mountain/scenes/tusk/assets/images/peacock-new.webp';
import mango from '../../zones/symbol-mountain/scenes/tusk/assets/images/eyes-game/mango.png';
import feather from '../../zones/symbol-mountain/scenes/tusk/assets/images/eyes-game/peacock_feather.png';
import grassBundle from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/grass_bundle.webp';
import grassBed from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/grass_bed_spread.webp';
import bowlEmpty from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bowl_empty.webp';
import bowlFilled from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bowl_filled.webp';
import bunnyTired from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bunny_01_tired.webp';
import bunnyEat from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bunny_eat_mango.png';
import bunnyDrink from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bunny_drink_water.png';
import bunnyRest from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/bunny_rest_on_grass.png';
import bgImg from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/symbol_mountain_3_bg.webp';
import needBubbleMango from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/need_bubble_hungry_mango.png';
import needBubbleWater from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/need_bubble_thirsty_water.png';
import needBubbleGrass from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/need_bubble_soft_rest_grass.png';
import needBubbleFeather from '../../zones/symbol-mountain/scenes/tusk/assets/images/tusk-giving/need_bubble_comfort_feather.png';

// Water is now a plain drag-drop item like mango/grass/feather (dragging
// the whole elephant was rejected earlier this session as a worse pattern;
// the tap-then-drag-path mechanic was rejected next for breaking rhythm
// with the other 3 beats). Its icon is the same droplet SVG used for
// drag-path — not a raster image — so it stays visually consistent with
// that mechanic's look even though the interaction itself is now simple.
const WATER_DROP_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 52">
    <defs>
      <radialGradient id="g" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#B8E5FB" />
        <stop offset="60%" stop-color="#5BB3E8" />
        <stop offset="100%" stop-color="#3A8FCB" />
      </radialGradient>
    </defs>
    <path d="M 23 4 C 23 4, 8 22, 8 34 C 8 44, 15 50, 23 50 C 31 50, 38 44, 38 34 C 38 22, 23 4, 23 4 Z" fill="url(#g)" stroke="#5BB3E8" stroke-width="1.5" />
    <ellipse cx="18" cy="22" rx="4" ry="6" fill="#FFFFFF" opacity="0.7" />
  </svg>
`)}`;

// One-time "which asset is this" lookup, keyed by the editor's own path
// strings (repo-relative paths kept as-is; upload://N resolved to the real
// file we tracked down earlier this session). This is the only manual
// per-game step this architecture still needs — no positions, no re-coding
// per beat.
const ASSET_MAP = {
  'synthetic/water-drop.svg': WATER_DROP_SVG,
  'Characters/monkey-new.webp': monkeyIdleShared,
  'Characters/bunny_01_tired.webp': bunnyTired,
  'Characters/cow-new.webp': cowIdleShared,
  'Characters/elephant-new1.webp': elephantIdleShared,
  'Characters/elephant_final_sprays_water.png': elephantSpraying,
  'Interactions/grass_bundle.webp': grassBundle,
  'Interactions/grass_bed_spread.webp': grassBed,
  'Interactions/bowl_empty.webp': bowlEmpty,
  'Interactions/bowl_filled.webp': bowlFilled,
  'Bubbles/need_bubble_hungry_mango.png': needBubbleMango,
  'Bubbles/need_bubble_thirsty_water.png': needBubbleWater,
  'Bubbles/need_bubble_soft_rest_grass.png': needBubbleGrass,
  'Bubbles/need_bubble_comfort_feather.png': needBubbleFeather,
  'upload://5': mango,
  'upload://6': elephantDrinking,
  'upload://7': cowEatingGrass,
  'upload://8': peacockIdleShared,
  'upload://9': feather,
  'upload://10': bunnyEat,
  'upload://11': bunnyDrink,
  'upload://12': bunnyRest,
};

// Interaction is now baked directly into tuskFlowSample.json as
// `beat.interaction` (added by hand here — a real editor "mechanic"
// dropdown would write the same shape). No separate interactions prop
// needed; this proves the JSON-only path end to end.

export { ASSET_MAP, flowJson, bgImg };

function TuskBeatPlayerPreview(props) {
  const missing = useMemo(() => new Set(), []);
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 22, overflow: 'hidden', background: '#d7d4ff' }}>
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

export default TuskBeatPlayerPreview;
