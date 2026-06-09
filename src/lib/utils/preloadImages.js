const _warmed = new Set();

export function preloadImages(paths = []) {
  paths.forEach((src) => {
    if (!src || _warmed.has(src)) return;
    _warmed.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}

export function avatarImagePaths(ids = []) {
  return ids.flatMap((id) => [
    `/images/new-explorer-${id}.webp`,
    `/images/new-explorer-${id}.png`,
  ]);
}
