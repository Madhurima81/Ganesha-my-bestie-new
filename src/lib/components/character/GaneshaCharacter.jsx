import React, { useRef, useEffect, useState } from 'react';
import './GaneshaCharacter.css';

// ─── SVG element IDs (new ganesha-final.svg) ──────────────────────────────────
// layer18 → eyes:       g54 (left), g61 (right)
//   ellipse47 / ellipse58  — dark iris (ry = openness)
//   ellipse48 / ellipse59  — white highlight (cy shifts with ry)
// layer27 → eyebrows:   g65 contains both brows (path56 left, path62 right)
//   move both via translateY on g65
// path65  → mouth:      single bezier curve, change control-point Y for expression

// ─── Eye constants (local coordinate space of g54 / g61) ─────────────────────
const EYE_CY              = -133.07025;   // cy of ellipse47 / ellipse58
const DEFAULT_EYE_RY      = 7.5013709;   // default ry
const HIGHLIGHT_CY_DEFAULT = -136.83315; // cy of ellipse48 / ellipse59 at default
// How far highlight sits above eye centre, as a fraction of ry:
const HIGHLIGHT_DY_RATIO  = (EYE_CY - HIGHLIGHT_CY_DEFAULT) / DEFAULT_EYE_RY; // ≈ -0.502

// ─── Eyebrow constants (g65 transform) ───────────────────────────────────────
const BROW_SCALE = 0.50397087;
const BROW_TX    = -120.34402;
const BROW_TY    =  121.60498; // base translateY — decrease to raise brows

// ─── Mouth ────────────────────────────────────────────────────────────────────
// path65 start point stays fixed; only relative bezier controls change.
const MOUTH_START = 'm 278.77597,72.671322 ';
// Each value is the full `c ...` cubic bezier string for that expression.
// Format: c 0,0 [cx1],[cy1] [dx1],[dy1]  [cx2],[cy2] [dx2],[dy2]
// Positive cy1 = smile (curves down), 0 = flat, negative = frown.
const MOUTH_C = {
  happy:       'c 0,0 7.83564,12.05878 25.07835,10.18808 17.10645,-1.85592 21.56854,-10.18995 21.5517,-10.18808',
  excited:     'c 0,0 7.83564,17 25.07835,14.5 17.10645,-2.5 21.56854,-14.5 21.5517,-14.5',
  thinking:    'c 0,0 7.83564,2.5 25.07835,2 17.10645,0 21.56854,-2 21.5517,-2',
  surprised:   'c 0,0 7.83564,7.5 25.07835,6.5 17.10645,-1.2 21.56854,-6.5 21.5517,-6.5',
  encouraging: 'c 0,0 7.83564,12.05878 25.07835,10.18808 17.10645,-1.85592 21.56854,-10.18995 21.5517,-10.18808',
};

const POSE_GROUP_IDS = [
  'hand-fist',
  'hand-victory',
  'hand-thumbsup',
  'hand-ok',
  'hand-blessing',
  'g7',
  'g73',
  'g75',
  'g105',
];
const POSE_GROUP_MAP = {
  blessing: ['hand-blessing'],
  pointing: ['hand-fist', 'g73'],
  walking: ['hand-fist', 'g73'],
  thumbs_up: ['hand-thumbsup', 'g105'],
  okay: ['hand-ok', 'g7'],
  celebration: ['hand-victory', 'g75'],
};

// ─── Expression config ────────────────────────────────────────────────────────
// eyeRy : iris vertical radius (default 7.5, bigger = wider eyes)
// browDY: added to g65's translateY — negative = raise brows, positive = lower
const EXPRESSIONS = {
  happy:       { eyeRy: 7.5,  browDY:  0,  mouth: 'happy'       },
  excited:     { eyeRy: 9.0,  browDY: -4,  mouth: 'excited'     },
  thinking:    { eyeRy: 7.5,  browDY:  0,  mouth: 'thinking'    },
  surprised:   { eyeRy: 10.5, browDY: -6,  mouth: 'surprised'   },
  encouraging: { eyeRy: 6.5,  browDY:  0,  mouth: 'encouraging' },
};

// ─── Module-level SVG cache (fetch once, reuse across all instances) ──────────
let _svgText    = null;
let _svgPromise = null;

function loadSvgOnce() {
  if (_svgText)    return Promise.resolve(_svgText);
  if (_svgPromise) return _svgPromise;
  _svgPromise = fetch('/images/ganesha-final-new.svg')
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('ganesha-final-new.svg not found'))))
    .catch(() => fetch('/images/ganesha-final.svg').then(r => r.text()))
    .then(text => { _svgText = text; return text; });
  return _svgPromise;
}

// ─── Apply expression to an injected SVG DOM node ────────────────────────────
function applyExpression(container, expression) {
  const svg = container.querySelector('svg');
  if (!svg) return;

  const expr  = EXPRESSIONS[expression] || EXPRESSIONS.happy;
  const eyeRy = expr.eyeRy;

  // Highlight cy scales proportionally with ry
  const highlightCy = (EYE_CY + HIGHLIGHT_DY_RATIO * eyeRy).toFixed(5);

  // 1. Eyes — left
  const e47 = svg.querySelector('#ellipse47');
  const e48 = svg.querySelector('#ellipse48');
  if (e47) e47.setAttribute('ry', eyeRy);
  if (e48) e48.setAttribute('cy', highlightCy);

  // 2. Eyes — right (mirrored group, same local coords)
  const e58 = svg.querySelector('#ellipse58');
  const e59 = svg.querySelector('#ellipse59');
  if (e58) e58.setAttribute('ry', eyeRy);
  if (e59) e59.setAttribute('cy', highlightCy);

  // 3. Eyebrows — shift both via g65 translateY
  const g65 = svg.querySelector('#g65');
  if (g65) {
    const newTY = (BROW_TY + expr.browDY).toFixed(5);
    g65.setAttribute('transform',
      `matrix(${BROW_SCALE},0,0,${BROW_SCALE},${BROW_TX},${newTY})`
    );
  }

  // 4. Mouth — swap bezier control curve
  const mouth = svg.querySelector('#path65');
  if (mouth) {
    mouth.setAttribute('d', MOUTH_START + (MOUTH_C[expr.mouth] || MOUTH_C.happy));
  }
}

function applyPose(container, pose = 'blessing') {
  const svg = container.querySelector('svg');
  if (!svg) return;

  const visibleIds = POSE_GROUP_MAP[pose] || POSE_GROUP_MAP.blessing;
  POSE_GROUP_IDS.forEach((id) => {
    const node = svg.querySelector(`#${id}`);
    if (!node) return;
    node.style.display = visibleIds.includes(id) ? 'inline' : 'none';
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GaneshaCharacter({
  expression = 'happy',
  pose       = 'blessing',
  size       = 200,
  breathing  = false,
  blink      = false,
  className  = '',
  style      = {},
  ...rest
}) {
  const containerRef  = useRef(null);
  const injectedRef   = useRef(false);
  const [ready, setReady] = useState(!!_svgText);

  // Inject SVG HTML once on mount
  useEffect(() => {
    loadSvgOnce().then(text => {
      if (!containerRef.current || injectedRef.current) return;
      containerRef.current.innerHTML = text;
      injectedRef.current = true;

      // Make SVG fill the container
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.setAttribute('width',  '100%');
        svg.setAttribute('height', '100%');
      }

      setReady(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply expression whenever it changes (or when SVG first loads)
  useEffect(() => {
    if (!ready || !injectedRef.current || !containerRef.current) return;
    applyExpression(containerRef.current, expression);
    applyPose(containerRef.current, pose);
  }, [expression, pose, ready]);

  useEffect(() => {
    if (!ready || !injectedRef.current || !containerRef.current || !blink) return undefined;

    let resetTimer = null;
    const blinkInterval = setInterval(() => {
      if (!containerRef.current) return;

      const svg = containerRef.current.querySelector('svg');
      if (!svg) return;

      const leftEye = svg.querySelector('#ellipse47');
      const rightEye = svg.querySelector('#ellipse58');
      if (leftEye) leftEye.setAttribute('ry', '0.7');
      if (rightEye) rightEye.setAttribute('ry', '0.7');

      resetTimer = setTimeout(() => {
        if (!containerRef.current) return;
        applyExpression(containerRef.current, expression);
      }, 130);
    }, 3200);

    return () => {
      clearInterval(blinkInterval);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [blink, expression, ready]);

  const breathClass =
    breathing === true
      ? 'ganesha-character--breathing-slow'
      : typeof breathing === 'string' && breathing
        ? `ganesha-character--breathing-${breathing}`
        : '';

  const rootClassName = ['ganesha-character', breathClass, className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      {...rest}
      style={{
        display:     'inline-block',
        width:       size,
        height:      size,
        flexShrink:  0,
        ...style,
      }}
    />
  );
}
