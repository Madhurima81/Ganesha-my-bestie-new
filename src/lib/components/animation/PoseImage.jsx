import React, { useEffect, useState } from 'react';
import './PoseImage.css';

// Share downloads/decodes between preloading and individual pose changes.
const images = new Map();
export function preparePose(src) {
  if (!images.has(src)) {
    const ready = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        try {
          if (image.decode) await image.decode();
          resolve();
        } catch (error) { reject(error); }
      };
      image.onerror = reject;
      image.src = src;
    }).catch((error) => {
      images.delete(src);
      throw error;
    });
    images.set(src, ready);
  }
  return images.get(src);
}

export function usePreloadPoses(sources) {
  useEffect(() => {
    sources.forEach((src) => { preparePose(src).catch(() => {}); });
  }, [sources]);
}

export default function PoseImage({ src, alt = '', className = '', style, imageStyle, ...props }) {
  const [frames, setFrames] = useState({ current: src, previous: null });

  useEffect(() => {
    let cancelled = false;
    if (src !== frames.current) {
      preparePose(src).then(() => {
        if (!cancelled) {
          setFrames((old) => ({ current: src, previous: old.current }));
        }
      }).catch(() => {}); // A failed replacement must not erase the visible pose.
    }
    return () => { cancelled = true; };
  }, [src, frames.current]);

  useEffect(() => {
    if (!frames.previous) return undefined;
    const timer = setTimeout(() => setFrames((old) => ({ ...old, previous: null })), 300);
    return () => clearTimeout(timer);
  }, [frames.current, frames.previous]);

  return (
    <span {...props} className={`pose-image ${className}`} style={style}>
      <img
        key={frames.current}
        className={`pose-image-current${frames.previous ? ' pose-image-entering' : ''}`}
        style={imageStyle} src={frames.current} alt={alt} draggable={false}
      />
      {frames.previous && (
        <img key={frames.previous} className="pose-image-previous" style={imageStyle} src={frames.previous} alt="" aria-hidden="true" draggable={false} />
      )}
    </span>
  );
}
