import React, { useState, useRef, useEffect, useCallback } from 'react';

const SRCS = {
  tree1: '/images/map/tree1.png',
  tree2: '/images/map/tree2.png',
  bush1: '/images/map/bush1.png',
  bush2: '/images/map/bush2.png',
  grass: '/images/map/grass.png',
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
  ['tree1', 'Tree 1'],
  ['tree2', 'Tree 2'],
  ['bush1', 'Bush 1'],
  ['bush2', 'Bush 2'],
  ['grass', 'Grass'],
  ['flower1', 'Flower 1'],
  ['flower2', 'Flower 2'],
];

const STORAGE_KEY = 'gmb_map_props';

let nextId = 1;

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    parsed.forEach((p) => {
      const n = parseInt(p.id?.split('-').pop(), 10);
      if (!Number.isNaN(n) && n >= nextId) nextId = n + 1;
    });
    return parsed;
  } catch {
    return [];
  }
};

const getTransforms = (item) => {
  const transforms = [];
  if (item.centered) transforms.push('translate(-50%, -50%)');
  if (item.flip) transforms.push('scaleX(-1)');
  if (item.rotateY) transforms.push(`rotateY(${item.rotateY}deg)`);
  if (item.rotate) transforms.push(`rotate(${item.rotate}deg)`);
  return transforms.length ? transforms.join(' ') : 'none';
};

export default function MapEditorFull({
  onClose,
  zoneArtItems = {},
  onZoneArtItemsChange = () => {},
  zoneArtDefaults = {},
}) {
  const [items, setItems] = useState(loadSaved);
  const [sel, setSel] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('props');
  const [panelPos, setPanelPos] = useState({ x: 12, y: 12 });

  const canvasRef = useRef(null);
  const itemDrag = useRef(null);
  const panelDrag = useRef(null);

  const zoneArtList = Object.values(zoneArtItems);
  const isZoneArtMode = mode === 'zone-art';
  const currentItems = isZoneArtMode ? zoneArtList : items;
  const selItem = currentItems.find((i) => i.id === sel);

  const pct = useCallback((cx, cy) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
  }, []);

  const updatePropItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const updateZoneArtItem = useCallback((id, patch) => {
    onZoneArtItemsChange((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }, [onZoneArtItemsChange]);

  const updateCurrentItem = useCallback((id, patch) => {
    if (isZoneArtMode) {
      updateZoneArtItem(id, patch);
      return;
    }
    updatePropItem(id, patch);
  }, [isZoneArtMode, updatePropItem, updateZoneArtItem]);

  const onItemDown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSel(item.id);
    const p = pct(e.clientX, e.clientY);
    itemDrag.current = { id: item.id, dx: p.x - item.left, dy: p.y - item.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onItemMove = useCallback((e) => {
    if (!itemDrag.current) return;
    const p = pct(e.clientX, e.clientY);
    updateCurrentItem(itemDrag.current.id, {
      left: Math.max(-15, Math.min(110, +(p.x - itemDrag.current.dx).toFixed(1))),
      top: Math.max(-15, Math.min(110, +(p.y - itemDrag.current.dy).toFixed(1))),
    });
  }, [pct, updateCurrentItem]);

  const onItemUp = useCallback(() => {
    itemDrag.current = null;
  }, []);

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

  const onHandleUp = () => {
    panelDrag.current = null;
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // best effort only
    }
  }, [items]);

  useEffect(() => {
    const onKey = (e) => {
      if (!sel) return;

      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const current = currentItems.find((item) => item.id === sel);
        if (!current) return;
        const delta = e.key === '[' ? -0.5 : 0.5;

        if (isZoneArtMode) {
          updateZoneArtItem(sel, {
            w: Math.max(2, +(current.w + delta).toFixed(1)),
            h: Math.max(2, +(current.h + delta).toFixed(1)),
          });
        } else {
          updatePropItem(sel, {
            w: Math.max(2, +(current.w + delta).toFixed(1)),
          });
        }
        return;
      }

      const step = e.shiftKey ? 2 : 0.5;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[e.key];

      if (!delta) return;
      e.preventDefault();
      const current = currentItems.find((item) => item.id === sel);
      if (!current) return;
      updateCurrentItem(sel, {
        left: +(current.left + delta[0]).toFixed(1),
        top: +(current.top + delta[1]).toFixed(1),
      });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentItems, isZoneArtMode, sel, updateCurrentItem, updatePropItem, updateZoneArtItem]);

  const addItem = (type) => {
    const id = `${type}-${nextId++}`;
    setItems((prev) => [
      ...prev,
      { id, type, src: SRCS[type], left: 45, top: 48, w: DEFAULT_W[type], flip: false },
    ]);
    setSel(id);
    setMode('props');
  };

  const scale = (delta) => {
    if (!selItem) return;
    if (isZoneArtMode) {
      updateZoneArtItem(sel, {
        w: Math.max(2, +(selItem.w + delta).toFixed(1)),
        h: Math.max(2, +(selItem.h + delta).toFixed(1)),
      });
      return;
    }
    updatePropItem(sel, {
      w: Math.max(2, +(selItem.w + delta).toFixed(1)),
    });
  };

  const flip = () => {
    if (!selItem) return;
    updateCurrentItem(sel, { flip: !selItem.flip });
  };

  const remove = () => {
    if (isZoneArtMode || !sel) return;
    setItems((prev) => prev.filter((item) => item.id !== sel));
    setSel(null);
  };

  const saveItems = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    if (isZoneArtMode) {
      if (!window.confirm('Reset all zone art positions to default?')) return;
      onZoneArtItemsChange(zoneArtDefaults);
      setSel(null);
      return;
    }

    if (!window.confirm('Clear all placed props?')) return;
    setItems([]);
    setSel(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyJSON = () => {
    const out = isZoneArtMode
      ? zoneArtList.map(({ id, label, src, left, top, w, h, centered, flip: artFlip, rotate, rotateY, opacity }) => ({
          id, label, src, left, top, w, h, centered, flip: artFlip, rotate, rotateY, opacity,
        }))
      : items.map(({ id, type, src, left, top, w, flip: propFlip }) => ({
          id, type, src, left, top, w, flip: propFlip,
        }));

    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 9999 }}
      onPointerMove={onItemMove}
      onPointerUp={onItemUp}
      onClick={() => setSel(null)}
    >
      {!isZoneArtMode && items.map((item) => (
        <img
          key={item.id}
          src={item.src}
          alt=""
          draggable={false}
          onPointerDown={(e) => onItemDown(e, item)}
          onClick={(e) => {
            e.stopPropagation();
            setSel(item.id);
          }}
          style={{
            position: 'absolute',
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: `${item.w}%`,
            transform: item.flip ? 'scaleX(-1)' : 'none',
            outline: sel === item.id ? '3px solid #ff3b9a' : '1px dashed rgba(120, 80, 200, 0.4)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        />
      ))}

      {isZoneArtMode && zoneArtList.map((item) => (
        <div
          key={item.id}
          onPointerDown={sel === item.id ? (e) => onItemDown(e, item) : undefined}
          onClick={sel === item.id ? (e) => {
            e.stopPropagation();
            setSel(item.id);
          } : undefined}
          style={{
            position: 'absolute',
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: `${item.w}%`,
            height: `${item.h}%`,
            transform: getTransforms(item),
            outline: sel === item.id ? '3px solid #ff3b9a' : '1px dashed rgba(120, 80, 200, 0.55)',
            background: sel === item.id ? 'rgba(255, 59, 154, 0.12)' : 'rgba(91, 58, 156, 0.08)',
            borderRadius: 12,
            boxSizing: 'border-box',
            cursor: sel === item.id ? 'grab' : 'default',
            pointerEvents: sel === item.id ? 'auto' : 'none',
            touchAction: sel === item.id ? 'none' : 'auto',
            userSelect: 'none',
            zIndex: sel === item.id ? 2 : 1,
          }}
        >
          <div style={{
            position: 'absolute',
            top: -22,
            left: 0,
            background: sel === item.id ? '#ff3b9a' : '#5b3a9c',
            color: '#fff',
            borderRadius: 8,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {item.label}
          </div>
        </div>
      ))}

      <div
        style={{
          position: 'absolute',
          left: panelPos.x,
          top: panelPos.y,
          zIndex: 10002,
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
            Map Editor
          </span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>drag me</span>
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
            <button onClick={() => { setMode('props'); setSel(null); }} style={{ ...addBtn, background: mode === 'props' ? '#e3d7ff' : '#f4eefe' }}>
              Props
            </button>
            <button onClick={() => { setMode('zone-art'); setSel(null); }} style={{ ...addBtn, background: mode === 'zone-art' ? '#e3d7ff' : '#f4eefe' }}>
              Zone Art
            </button>
          </div>

          {!isZoneArtMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
              {ADD_BTNS.map(([type, label]) => (
                <button key={type} onClick={() => addItem(type)} style={addBtn}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {isZoneArtMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
              {zoneArtList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSel(item.id)}
                  style={{ ...addBtn, background: sel === item.id ? '#e3d7ff' : '#f4eefe' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

          <div style={{ opacity: selItem ? 1 : 0.35, pointerEvents: selItem ? 'auto' : 'none' }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
              {selItem
                ? isZoneArtMode
                  ? `${selItem.label} · W: ${selItem.w}% · H: ${selItem.h}%`
                  : `${selItem.type} · W: ${selItem.w}%`
                : 'Nothing selected'}
            </div>

            {selItem && (
              <input
                type="range"
                min={2}
                max={isZoneArtMode ? 140 : 30}
                step={0.5}
                value={selItem.w}
                onChange={(e) => {
                  const nextW = +e.target.value;
                  if (isZoneArtMode) {
                    const delta = nextW - selItem.w;
                    updateZoneArtItem(sel, {
                      w: nextW,
                      h: Math.max(2, +(selItem.h + delta).toFixed(1)),
                    });
                    return;
                  }
                  updatePropItem(sel, { w: nextW });
                }}
                style={{ width: '100%', marginBottom: 6, accentColor: '#5b3a9c' }}
              />
            )}

            <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
              <button onClick={() => scale(-1)} style={actBtn}>- Size</button>
              <button onClick={() => scale(1)} style={actBtn}>+ Size</button>
              <button onClick={flip} style={actBtn}>Flip</button>
            </div>

            {isZoneArtMode && (sel === 'bridge1' || sel === 'bridge2') && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                <button
                  onClick={() => updateZoneArtItem(sel, { rotate: +((selItem.rotate || 0) - 2).toFixed(1) })}
                  style={actBtn}
                >
                  - Rotate
                </button>
                <button
                  onClick={() => updateZoneArtItem(sel, { rotate: +((selItem.rotate || 0) + 2).toFixed(1) })}
                  style={actBtn}
                >
                  + Rotate
                </button>
              </div>
            )}

            {isZoneArtMode && sel === 'bridge2' && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                <button
                  onClick={() => updateZoneArtItem(sel, { rotateY: selItem.rotateY === 180 ? 0 : 180 })}
                  style={actBtn}
                >
                  {selItem.rotateY === 180 ? 'Unset Y Flip' : 'Set Y Flip'}
                </button>
              </div>
            )}

            {!isZoneArtMode && (
              <button onClick={remove} style={{ ...actBtn, width: '100%', color: '#c0392b', marginBottom: 2 }}>
                Delete
              </button>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

          <button
            onClick={saveItems}
            style={{
              ...actBtn,
              width: '100%',
              marginBottom: 6,
              background: saved ? '#e8f5e9' : '#fff8e1',
              color: saved ? '#2e7d32' : '#e65100',
              fontWeight: 700,
            }}
          >
            {saved ? 'Saved!' : 'Save positions'}
          </button>
          <button
            onClick={copyJSON}
            style={{
              ...actBtn,
              width: '100%',
              marginBottom: 6,
              background: copied ? '#e8f5e9' : '#f4eefe',
              color: copied ? '#2e7d32' : '#5b3a9c',
            }}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <div style={{ display: 'flex', gap: 5, marginBottom: 0 }}>
            <button onClick={onClose} style={{ ...actBtn, flex: 2 }}>Close</button>
            <button onClick={clearAll} style={{ ...actBtn, flex: 1, color: '#c0392b', fontSize: 11 }}>
              {isZoneArtMode ? 'Reset' : 'Clear all'}
            </button>
          </div>

          <div style={{ fontSize: 10, color: '#bbb', marginTop: 8, lineHeight: 1.4 }}>
            {isZoneArtMode
              ? 'Drag zone art · arrows nudge · Shift=big · [ ] scale'
              : 'Drag props · arrows nudge · Shift=big · [ ] scale'}
          </div>
        </div>
      </div>
    </div>
  );
}

const addBtn = {
  padding: '5px 6px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#f4eefe',
  color: '#5b3a9c',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 600,
  fontSize: 11,
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

const actBtn = {
  flex: 1,
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fafafa',
  color: '#333',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
};
