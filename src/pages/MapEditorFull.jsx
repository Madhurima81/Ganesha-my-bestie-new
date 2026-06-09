import React, { useState, useRef, useEffect, useCallback } from 'react';

const SRCS = {
  tree1:   '/images/map/tree1.png',
  tree2:   '/images/map/tree2.png',
  bush1:   '/images/map/bush1.png',
  bush2:   '/images/map/bush2.png',
  grass:   '/images/map/grass.png',
  flower1: '/images/map/flower1.png',
  flower2: '/images/map/flower2.png',
};

const DEFAULT_W = {
  tree1: 8, tree2: 8,
  bush1: 6, bush2: 6,
  grass: 5,
  flower1: 5, flower2: 5,
};

const ADD_BTNS = [
  ['tree1',   '🌲 Tree 1'],
  ['tree2',   '🌳 Tree 2'],
  ['bush1',   '🌿 Bush 1'],
  ['bush2',   '🍃 Bush 2'],
  ['grass',   '🪴 Grass'],
  ['flower1', '🌸 Flower 1'],
  ['flower2', '🌺 Flower 2'],
];

const STORAGE_KEY = 'gmb_map_props';

let nextId = 1;

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // bump nextId so new props never collide with saved ids
    parsed.forEach(p => {
      const n = parseInt(p.id?.split('-').pop(), 10);
      if (!isNaN(n) && n >= nextId) nextId = n + 1;
    });
    return parsed;
  } catch { return []; }
};

export default function MapEditorFull({ onClose }) {
  const [items,  setItems]  = useState(loadSaved);
  const [sel,    setSel]    = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Panel position — starts top-left so it's out of the way on the right
  const [panelPos, setPanelPos] = useState({ x: 12, y: 12 });

  const canvasRef   = useRef(null);
  const propDrag    = useRef(null);   // dragging a map prop
  const panelDrag   = useRef(null);   // dragging the panel itself

  // ── % helpers for prop dragging ───────────────────────────────────
  const pct = useCallback((cx, cy) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
  }, []);

  const updateItem = (id, patch) =>
    setItems(it => it.map(i => i.id === id ? { ...i, ...patch } : i));

  // ── prop pointer events ───────────────────────────────────────────
  const onPropDown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSel(item.id);
    const p = pct(e.clientX, e.clientY);
    propDrag.current = { id: item.id, dx: p.x - item.left, dy: p.y - item.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPropMove = useCallback((e) => {
    if (!propDrag.current) return;
    const p = pct(e.clientX, e.clientY);
    updateItem(propDrag.current.id, {
      left: Math.max(-15, Math.min(110, +(p.x - propDrag.current.dx).toFixed(1))),
      top:  Math.max(-15, Math.min(110, +(p.y - propDrag.current.dy).toFixed(1))),
    });
  }, [pct]);

  const onPropUp = useCallback(() => { propDrag.current = null; }, []);

  // ── panel drag events ─────────────────────────────────────────────
  const onHandleDown = (e) => {
    e.stopPropagation();
    panelDrag.current = {
      startMx: e.clientX,
      startMy: e.clientY,
      startPx: panelPos.x,
      startPy: panelPos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandleMove = (e) => {
    if (!panelDrag.current) return;
    const dx = e.clientX - panelDrag.current.startMx;
    const dy = e.clientY - panelDrag.current.startMy;
    setPanelPos({
      x: Math.max(0, panelDrag.current.startPx + dx),
      y: Math.max(0, panelDrag.current.startPy + dy),
    });
  };

  const onHandleUp = () => { panelDrag.current = null; };

  // ── keyboard nudge ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (!sel) return;
      if (e.key === '[') { e.preventDefault(); setItems(it => it.map(i => i.id === sel ? { ...i, w: Math.max(2, +(i.w - 0.5).toFixed(1)) } : i)); return; }
      if (e.key === ']') { e.preventDefault(); setItems(it => it.map(i => i.id === sel ? { ...i, w: +(i.w + 0.5).toFixed(1) } : i)); return; }
      const s = e.shiftKey ? 2 : 0.5;
      const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
      if (!d) return;
      e.preventDefault();
      const cur = items.find(i => i.id === sel);
      if (cur) updateItem(sel, { left: +(cur.left + d[0]).toFixed(1), top: +(cur.top + d[1]).toFixed(1) });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, items]);

  // ── actions ───────────────────────────────────────────────────────
  const addItem = (type) => {
    const id = `${type}-${nextId++}`;
    setItems(it => [...it, { id, type, src: SRCS[type], left: 45, top: 48, w: DEFAULT_W[type], flip: false }]);
    setSel(id);
  };

  const selItem = items.find(i => i.id === sel);
  const scale   = (d) => selItem && updateItem(sel, { w: Math.max(2, +(selItem.w + d).toFixed(1)) });
  const flip    = () => selItem && updateItem(sel, { flip: !selItem.flip });
  const remove  = () => { setItems(it => it.filter(i => i.id !== sel)); setSel(null); };

  // Auto-save to localStorage whenever items change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const saveItems = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    if (!window.confirm('Clear all placed props?')) return;
    setItems([]);
    setSel(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyJSON = () => {
    const out = items.map(({ id, type, src, left, top, w, flip }) => ({ id, type, src, left, top, w, flip }));
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── render ────────────────────────────────────────────────────────
  return (
    <div
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 9999 }}
      onPointerMove={onPropMove}
      onPointerUp={onPropUp}
      onClick={() => setSel(null)}
    >
      {/* Map props */}
      {items.map(it => (
        <img
          key={it.id}
          src={it.src}
          alt=""
          draggable={false}
          onPointerDown={(e) => onPropDown(e, it)}
          onClick={(e) => { e.stopPropagation(); setSel(it.id); }}
          style={{
            position: 'absolute',
            left: `${it.left}%`,
            top: `${it.top}%`,
            width: `${it.w}%`,
            transform: it.flip ? 'scaleX(-1)' : 'none',
            outline: sel === it.id ? '3px solid #ff3b9a' : '1px dashed rgba(120,80,200,.4)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        />
      ))}

      {/* Floating panel — draggable via the handle bar */}
      <div
        style={{
          position: 'absolute',
          left: panelPos.x,
          top: panelPos.y,
          width: 224,
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 14,
          boxShadow: '0 8px 28px rgba(0,0,0,.25)',
          fontFamily: 'Nunito, sans-serif',
          fontSize: 13,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Drag handle ── */}
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          style={{
            background: '#5b3a9c',
            color: '#fff',
            padding: '8px 12px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <span style={{ fontFamily: '"Baloo 2", sans-serif', fontWeight: 700, fontSize: 14 }}>
            ☰ Prop Editor
          </span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>drag me</span>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: 12 }}>
          {/* Add buttons — 2 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
            {ADD_BTNS.map(([type, label]) => (
              <button key={type} onClick={() => addItem(type)} style={addBtn}>
                {label}
              </button>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

          {/* Scale / flip / delete */}
          <div style={{ opacity: selItem ? 1 : 0.35, pointerEvents: selItem ? 'auto' : 'none' }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
              {selItem ? `${selItem.type} · W: ${selItem.w}%` : 'Nothing selected'}
            </div>

            {selItem && (
              <input
                type="range" min={2} max={30} step={0.5}
                value={selItem.w}
                onChange={(e) => updateItem(sel, { w: +e.target.value })}
                style={{ width: '100%', marginBottom: 6, accentColor: '#5b3a9c' }}
              />
            )}

            <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
              <button onClick={() => scale(-1)} style={actBtn}>− Size</button>
              <button onClick={() => scale(1)}  style={actBtn}>+ Size</button>
              <button onClick={flip}            style={actBtn}>Flip</button>
            </div>
            <button onClick={remove} style={{ ...actBtn, width: '100%', color: '#c0392b', marginBottom: 2 }}>
              🗑 Delete
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

          <button
            onClick={saveItems}
            style={{ ...actBtn, width: '100%', marginBottom: 6, background: saved ? '#e8f5e9' : '#fff8e1', color: saved ? '#2e7d32' : '#e65100', fontWeight: 700 }}
          >
            {saved ? '✅ Saved!' : '💾 Save positions'}
          </button>
          <button
            onClick={copyJSON}
            style={{ ...actBtn, width: '100%', marginBottom: 6, background: copied ? '#e8f5e9' : '#f4eefe', color: copied ? '#2e7d32' : '#5b3a9c' }}
          >
            {copied ? '✅ Copied!' : '📋 Copy JSON'}
          </button>
          <div style={{ display: 'flex', gap: 5, marginBottom: 0 }}>
            <button onClick={onClose} style={{ ...actBtn, flex: 2 }}>✕ Close</button>
            <button onClick={clearAll} style={{ ...actBtn, flex: 1, color: '#c0392b', fontSize: 11 }}>🗑 Clear all</button>
          </div>

          <div style={{ fontSize: 10, color: '#bbb', marginTop: 8, lineHeight: 1.4 }}>
            Drag props · arrows nudge · Shift=big · [ ] scale
          </div>
        </div>
      </div>
    </div>
  );
}

const addBtn = {
  padding: '5px 6px', borderRadius: 8, border: '1px solid #ddd',
  background: '#f4eefe', color: '#5b3a9c',
  fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11,
  cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
};

const actBtn = {
  flex: 1, padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd',
  background: '#fafafa', color: '#333',
  fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12,
  cursor: 'pointer',
};
