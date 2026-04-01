import React, { useEffect, useRef, useState } from 'react';

const ZONE_TO_SVG_ID = {
  eyes: 'ganesha-eyes',
  ears: 'ganesha-ears',
  trunk: 'ganesha-trunk',
  tusk: 'ganesha-tusk',
  belly: 'ganesha-belly',
  'left-hand': 'ganesha-modaks',
  'right-hand': 'ganesha-lotus-pink',
  base: 'ganesha-mooshika'
};

const ZONE_FILL_BY_STATE = {
  idle: 'rgba(255,255,255,0.001)',
  hint: 'rgba(255, 215, 64, 0.22)',
  wrong: 'rgba(255, 122, 122, 0.26)',
  correct: 'rgba(127, 233, 163, 0.28)',
  placed: 'rgba(255,255,255,0.001)'
};

const GaneshaInteractiveIllustration = ({ zoneStates = {}, onZoneClick }) => {
  const wrapperRef = useRef(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  useEffect(() => {
    fetch('/images/ganesha-sit-interactive.svg')
      .then(r => r.text())
      .then(svgText => {
        if (!wrapperRef.current) return;

        wrapperRef.current.innerHTML = svgText;
        const svgEl = wrapperRef.current.querySelector('svg');
        if (!svgEl) return;

        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
        svgEl.style.display = 'block';

        Object.values(ZONE_TO_SVG_ID).forEach((svgId) => {
          const el = wrapperRef.current.querySelector(`#${svgId}`);
          if (!el) {
            console.warn(`GaneshaInteractiveIllustration: missing zone id ${svgId}`);
            return;
          }
          el.style.transformBox = 'fill-box';
          el.style.transformOrigin = 'center';
          el.style.transition = 'fill 0.2s ease, opacity 0.2s ease';
          el.style.cursor = 'pointer';
          el.style.fill = ZONE_FILL_BY_STATE.idle;
        });

        setSvgLoaded(true);
      })
      .catch(err => console.error('GaneshaInteractiveIllustration: failed to load SVG', err));
  }, []);

  useEffect(() => {
    if (!svgLoaded || !wrapperRef.current) return;

    const ANIM_CLASSES = ['svg-zone-wrong', 'svg-zone-correct'];

    Object.entries(ZONE_TO_SVG_ID).forEach(([zoneId, svgId]) => {
      const el = wrapperRef.current.querySelector(`#${svgId}`);
      if (!el) return;

      const state = zoneStates[zoneId] || 'idle';
      el.classList.remove(...ANIM_CLASSES);
      el.style.fill = ZONE_FILL_BY_STATE[state] || ZONE_FILL_BY_STATE.idle;

      if (state === 'wrong') el.classList.add('svg-zone-wrong');
      if (state === 'correct') el.classList.add('svg-zone-correct');

      if (state === 'placed') {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'default';
        el.onclick = null;
      } else {
        el.style.pointerEvents = 'all';
        el.style.cursor = 'pointer';
        el.onclick = (e) => {
          e.stopPropagation();
          onZoneClick?.(zoneId);
        };
      }
    });
  }, [svgLoaded, zoneStates, onZoneClick]);

  return <div ref={wrapperRef} style={{ width: '100%', height: '100%' }} />;
};

export default GaneshaInteractiveIllustration;
