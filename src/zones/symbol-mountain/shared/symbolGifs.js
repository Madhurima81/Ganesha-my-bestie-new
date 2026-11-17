// Animated pictures for the 8 Symbol Mountain symbols.
// One source of truth: the symbol auto-reveal, mandala, closing modal, sidebar/mandala cards and For Parents all
// import from here. Each GIF plays once and rests on its last frame.
import mooshika from './images/symbol-gifs/mooshika-anim.webp';
import trunk from './images/symbol-gifs/trunk-anim.webp';
import belly from './images/symbol-gifs/belly-anim.webp';
import eyes from './images/symbol-gifs/eyes-anim.webp';
import ears from './images/symbol-gifs/ears-anim.webp';
import tusk from './images/symbol-gifs/tusk-anim.webp';
import lotus from './images/symbol-gifs/lotus-anim.webp';
import modak from './images/symbol-gifs/modak-anim.webp';

// The LAST frame of each GIF as a still picture, so tiles/buttons that cannot animate match the GIF they open.
import mooshikaStill from './images/symbol-gifs/mooshika-still.webp';
import trunkStill from './images/symbol-gifs/trunk-still.webp';
import bellyStill from './images/symbol-gifs/belly-still.webp';
import eyesStill from './images/symbol-gifs/eyes-still.webp';
import earsStill from './images/symbol-gifs/ears-still.webp';
import tuskStill from './images/symbol-gifs/tusk-still.webp';
import lotusStill from './images/symbol-gifs/lotus-still.webp';
import modakStill from './images/symbol-gifs/modak-still.webp';

// Same names the scenes already use for their coloured symbol pictures, so a scene only changes its import line.
export const symbolMooshikaColored = mooshika;
export const symbolTrunkColored = trunk;
export const symbolBellyColored = belly;
export const symbolEyesColored = eyes;
export const symbolEarsColored = ears;
export const symbolTuskColored = tusk;
export const symbolLotusColored = lotus;
export const symbolModakColored = modak;

// Lookup by symbol id (the sidebar card normalises ears/eyes to ear/eye).
export const SYMBOL_MOUNTAIN_GIFS = {
  mooshika, trunk, belly, bigbelly: belly, bigBelly: belly, eyes, eye: eyes, ears, ear: ears, tusk, lotus, modak,
};

export const SYMBOL_MOUNTAIN_STILLS = {
  mooshika: mooshikaStill, trunk: trunkStill, belly: bellyStill, bigbelly: bellyStill, bigBelly: bellyStill,
  eyes: eyesStill, eye: eyesStill, ears: earsStill, ear: earsStill, tusk: tuskStill, lotus: lotusStill, modak: modakStill,
};
