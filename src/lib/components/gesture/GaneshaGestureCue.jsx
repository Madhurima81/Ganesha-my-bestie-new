import { useEffect, useRef, useState } from 'react';
import './GaneshaGestureCue.css';

/**
 * GaneshaGestureCue
 *
 * Renders the full Ganesha SVG (ganesha-final-new.svg) with exactly one
 * hand-gesture layer visible.  All other hand layers are hidden via DOM refs
 * so the inline SVG style attributes are cleanly overridden.
 *
 * Props:
 *   gestureType  'thumbsup' | 'ok' | 'fist' | 'victory' | 'blessing'
 *   position     'item' | 'center'   (maps to CSS class for placement)
 *   size         px width+height (default 120)
 *
 * Usage:
 *   const { miniGesture, triggerMiniGesture } = useMiniGesture();
 *
 *   // In handlers:
 *   triggerMiniGesture('thumbsup', 'item',   1200);  // micro win
 *   triggerMiniGesture('ok',       'center', 2000);  // phase win
 *   triggerMiniGesture('fist',     'center', 2000);  // scene win
 *   triggerMiniGesture('blessing', 'center', 2500);  // Sanskrit moment
 *   triggerMiniGesture('victory',  'center', 2500);  // zone win
 *
 *   // In JSX:
 *   {miniGesture.show && (
 *     <GaneshaGestureCue
 *       key={miniGesture.key}
 *       gestureType={miniGesture.type}
 *       position={miniGesture.position}
 *       size={120}
 *     />
 *   )}
 */

const HAND_IDS = [
  'hand-blessing',
  'hand-ok',
  'hand-thumbsup',
  'hand-victory',
  'hand-fist',
];

const SVG_PATH = '/images/ganesha-final-new.svg';

// Module-level cache — fetch once, reuse across all component instances
let _svgContent = null;
let _fetchPromise = null;

/**
 * Pre-process the raw SVG text:
 * Force ALL hand-* layers to display:none so there is zero flash
 * when the SVG is injected via dangerouslySetInnerHTML.
 * The useEffect then sets the correct one to display:inline.
 */
function preprocessSVG(text) {
  let result = text;
  HAND_IDS.forEach(id => {
    // Match the group tag that has this id and replace its display style
    // handles both display:inline and display:none cases
    result = result.replace(
      new RegExp(`(id="${id}"[^>]*style="[^"]*?)display:[^;]*(;?)`, 'g'),
      `$1display:none$2`
    );
    // Also handle style-before-id attribute order
    result = result.replace(
      new RegExp(`(style="[^"]*?)display:[^;]*(;?[^"]*"[^>]*id="${id}")`, 'g'),
      `$1display:none$2`
    );
  });
  return result;
}

function loadGaneshaSVG() {
  if (_svgContent) return Promise.resolve(_svgContent);
  if (!_fetchPromise) {
    _fetchPromise = fetch(SVG_PATH)
      .then(res => res.text())
      .then(text => {
        _svgContent = preprocessSVG(text);
        return _svgContent;
      })
      .catch(err => {
        _fetchPromise = null; // allow retry on next render
        console.warn('[GaneshaGestureCue] Failed to load SVG:', err);
        return null;
      });
  }
  return _fetchPromise;
}

export default function GaneshaGestureCue({
  gestureType = 'thumbsup',
  position = 'item',
  size = 120,
}) {
  const [svgHTML, setSvgHTML] = useState(_svgContent); // use cache immediately if available
  const [layerReady, setLayerReady] = useState(false);
  const containerRef = useRef(null);

  // Fetch SVG once on first mount (noop on subsequent mounts if cached)
  useEffect(() => {
    if (_svgContent) return; // already cached
    loadGaneshaSVG().then(text => {
      if (text) setSvgHTML(text);
    });
  }, []);

  // Toggle the correct hand layer whenever gestureType or svgHTML changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgHTML) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Hide every hand layer (overrides the inline display styles from Inkscape)
    HAND_IDS.forEach(id => {
      const el = svg.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Show only the requested gesture
    const active = svg.getElementById(`hand-${gestureType}`);
    if (active) active.style.display = 'inline';

    // Reveal the container now that the correct hand is shown
    setLayerReady(true);
  }, [gestureType, svgHTML]);

  // Nothing to render until SVG is loaded
  if (!svgHTML) return null;

  return (
    <div
      ref={containerRef}
      className={`ganesha-gesture-cue ganesha-gesture-cue--${position}`}
      style={{
        width: size,
        height: size,
        // Stay invisible until the useEffect has set the correct hand layer
        // — prevents the one-frame flash of hand-blessing (default:inline)
        visibility: layerReady ? 'visible' : 'hidden',
      }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgHTML }}
    />
  );
}
