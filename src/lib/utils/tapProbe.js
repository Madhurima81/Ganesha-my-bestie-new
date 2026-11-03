// Debug aid (URL must contain ?debug=1): tap anywhere and a small panel lists the elements under the finger
// (tag.class, size, position) so a stray line seen only on the iPad can be traced to the element that owns it
// without Safari DevTools. Does nothing without ?debug=1. Remove once the Inner Mandala line is solved.
export function installTapProbe() {
  if (typeof window === 'undefined') return () => {};
  let enabled = false;
  try { enabled = new URLSearchParams(window.location.search).get('debug') === '1'; } catch { /* ignore */ }
  if (!enabled) return () => {};

  const panel = document.createElement('pre');
  panel.setAttribute('data-tap-probe', '');
  panel.style.cssText =
    'position:fixed;top:8px;left:8px;z-index:2147483647;max-width:92vw;max-height:60vh;overflow:auto;margin:0;' +
    'padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.82);color:#fff;font:11px/1.35 ui-monospace,Menlo,monospace;' +
    'pointer-events:none;white-space:pre-wrap;';
  panel.textContent = 'Tap probe on: tap the line, then screenshot this panel';
  document.body.appendChild(panel);

  const describe = (el) => {
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '';
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls.trim().split(/\s+/).slice(0, 3).join('.') : ''}  ${Math.round(r.width)}x${Math.round(r.height)} @ ${Math.round(r.left)},${Math.round(r.top)}`;
  };
  const onDown = (e) => {
    const stack = (document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : [e.target])
      .filter((el) => el !== panel).slice(0, 9);
    panel.textContent = `tap at ${Math.round(e.clientX)},${Math.round(e.clientY)}  (top element first)\n` + stack.map(describe).join('\n');
  };
  window.addEventListener('pointerdown', onDown, true);
  return () => {
    window.removeEventListener('pointerdown', onDown, true);
    panel.remove();
  };
}
