// gifDuration.js - how long one play of a GIF lasts (sum of its frame delays), so a screen can wait for
// a play-once GIF to finish before moving on. Resolves 0 for non-GIFs or if the file can't be read.
const cache = new Map();

export function parseGifDurationMs(bytes) {
  let total = 0;
  // Graphic Control Extension: 21 F9 04 <flags> <delay lo> <delay hi> <transparent idx> 00
  for (let i = 0; i < bytes.length - 7; i += 1) {
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04 && bytes[i + 7] === 0x00) {
      const delay = bytes[i + 4] | (bytes[i + 5] << 8); // hundredths of a second
      total += (delay < 2 ? 10 : delay) * 10; // browsers treat 0/1 as 100 ms
      i += 7;
    }
  }
  return total;
}

export function getGifDurationMs(src) {
  if (!src || !/\.gif($|\?)/i.test(src)) return Promise.resolve(0);
  if (!cache.has(src)) {
    cache.set(
      src,
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((buf) => parseGifDurationMs(new Uint8Array(buf)))
        .catch(() => 0)
    );
  }
  return cache.get(src);
}
