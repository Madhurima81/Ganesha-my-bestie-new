// gifDuration.js - how long one play of an animated GIF or animated WebP lasts (sum of its frame delays), so a
// screen can wait for a play-once animation to finish before moving on. Resolves 0 for anything else (a still
// WebP, a PNG ...) or if the file can't be read.
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

// Animated WebP: RIFF 'WEBP', then chunks; every 'ANMF' (frame) chunk holds a 24-bit frame duration in ms at byte 12.
export function parseWebpDurationMs(bytes) {
  const tag = (i) => String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
  if (bytes.length < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WEBP') return 0;
  let total = 0;
  let i = 12;
  while (i + 8 <= bytes.length) {
    const size = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
    if (tag(i) === 'ANMF' && i + 8 + 16 <= bytes.length) {
      const d = bytes[i + 8 + 12] | (bytes[i + 8 + 13] << 8) | (bytes[i + 8 + 14] << 16);
      total += d < 20 ? 100 : d; // browsers treat very short delays as 100 ms
    }
    i += 8 + size + (size & 1);
  }
  return total;
}

export function getGifDurationMs(src) {
  if (!src || !/\.(gif|webp)($|\?)/i.test(src)) return Promise.resolve(0);
  if (!cache.has(src)) {
    cache.set(
      src,
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          const bytes = new Uint8Array(buf);
          return /\.webp($|\?)/i.test(src) ? parseWebpDurationMs(bytes) : parseGifDurationMs(bytes);
        })
        .catch(() => 0)
    );
  }
  return cache.get(src);
}
