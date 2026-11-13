// Animated pictures for the Symbol Mountain symbols (Modak still uses its old picture until its transparent GIF arrives).
// One source of truth: the symbol auto-reveal, mandala, closing modal, sidebar/mandala cards and For Parents all
// import from here. Each GIF plays once and rests on its last frame.
import mooshika from './images/symbol-gifs/mooshika.gif';
import trunk from './images/symbol-gifs/trunk.gif';
import belly from './images/symbol-gifs/belly.gif';
import eyes from './images/symbol-gifs/eyes.gif';
import ears from './images/symbol-gifs/ears.gif';
import tusk from './images/symbol-gifs/tusk.gif';
import lotus from './images/symbol-gifs/lotus.gif';

// Same names the scenes already use for their coloured symbol pictures, so a scene only changes its import line.
export const symbolMooshikaColored = mooshika;
export const symbolTrunkColored = trunk;
export const symbolBellyColored = belly;
export const symbolEyesColored = eyes;
export const symbolEarsColored = ears;
export const symbolTuskColored = tusk;
export const symbolLotusColored = lotus;

// Lookup by symbol id (the sidebar card normalises ears/eyes to ear/eye).
export const SYMBOL_MOUNTAIN_GIFS = {
  mooshika, trunk, belly, bigbelly: belly, bigBelly: belly, eyes, eye: eyes, ears, ear: ears, tusk, lotus,
};
