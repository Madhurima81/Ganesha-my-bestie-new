import { useState, useRef, useCallback, useEffect } from 'react';

/*
  Drag-to-merge, 2 chunks. English primary, Devanagari small underneath.
  props: {
    blocks:   ['Vakra','Tunda'],     // English labels (big)
    deva:     ['वक्र','तुण्ड'],        // Devanagari (small, under)
    roman:    ['vakra','tunda'],     // audio filenames
    fullWord: 'Vakratunda',
    fullDeva: 'वक्रतुण्ड',
    onBuilt
  }
*/

export default function WordBlockBuilder({
  blocks = [], deva = [], roman = [], fullWord = '', fullDeva = '', onBuilt,
}) {
  const [placed, setPlaced] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const slotRef = useRef(null);
  const solvedRef = useRef(false);
  const wrapRef = useRef(null);

  const allPlaced = placed.length === blocks.length;

  const playSyllable = (i) => {
    const name = (roman[i] || blocks[i]).toLowerCase();
    new Audio(`/audio/syllables/${name}.mp3`).play().catch(() => {});
  };

  const startDrag = (i, clientX, clientY) => {
    if (solvedRef.current || placed.includes(i)) return;
    setDragIdx(i); setPos({ x: clientX, y: clientY });
  };

  const move = useCallback((clientX, clientY) => {
    if (dragIdx === null) return;
    setPos({ x: clientX, y: clientY });
  }, [dragIdx]);

  const endDrag = useCallback((clientX, clientY) => {
    if (dragIdx === null) return;
    const slot = slotRef.current?.getBoundingClientRect();
    const over = slot && clientX >= slot.left && clientX <= slot.right &&
                 clientY >= slot.top && clientY <= slot.bottom;
    if (over) {
      playSyllable(dragIdx);
      const next = [...placed, dragIdx];
      setPlaced(next);
      if (next.length === blocks.length) {
        solvedRef.current = true;
        setTimeout(() => onBuilt?.(), 900);
      }
    }
    setDragIdx(null);
  }, [dragIdx, placed, blocks.length, onBuilt]);

  // passive-safe touch handlers
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const tm = (e) => { const t = e.touches[0]; move(t.clientX, t.clientY); e.preventDefault(); };
    const te = (e) => { const t = e.changedTouches[0]; endDrag(t.clientX, t.clientY); };
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te);
    return () => { el.removeEventListener('touchmove', tm); el.removeEventListener('touchend', te); };
  }, [move, endDrag]);

  const Block = ({ en, dv }) => (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span style={{ fontSize: 26 }}>{en}</span>
      <span style={{ fontSize: 13, opacity: 0.85 }}>{dv}</span>
    </span>
  );

  return (
    <div ref={wrapRef}
      style={{ textAlign: 'center', fontFamily: 'Baloo 2, cursive', touchAction: 'none' }}
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerUp={(e) => endDrag(e.clientX, e.clientY)}>
      <p style={{ fontFamily: 'Nunito, sans-serif', color: '#2E7D32' }}>Drag the pieces together!</p>

      {/* slot */}
      <div ref={slotRef} style={{
        minHeight: 86, margin: '14px auto', maxWidth: 340,
        border: '3px dashed #6A1B9A', borderRadius: 18,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#FFF8E7',
      }}>
        {allPlaced
          ? <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 40, color: '#FF9933' }}>{fullWord}</span>
              <span style={{ fontSize: 16, color: '#6A1B9A' }}>{fullDeva}</span>
            </span>
          : placed.map((i) => <span key={i} style={{ color: '#FF9933' }}><Block en={blocks[i]} dv={deva[i]} /></span>)}
      </div>

      {/* chunks */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, minHeight: 86 }}>
        {blocks.map((b, i) => placed.includes(i) ? null : (
          <div key={i}
            onPointerDown={(e) => startDrag(i, e.clientX, e.clientY)}
            onTouchStart={(e) => startDrag(i, e.touches[0].clientX, e.touches[0].clientY)}
            style={{
              minWidth: 86, minHeight: 86, borderRadius: 16, background: '#FF9933', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.2)', cursor: 'grab',
              opacity: dragIdx === i ? 0.3 : 1, touchAction: 'none',
            }}><Block en={b} dv={deva[i]} /></div>
        ))}
      </div>

      {/* drag ghost */}
      {dragIdx !== null && (
        <div style={{
          position: 'fixed', left: pos.x - 43, top: pos.y - 43, width: 86, height: 86,
          borderRadius: 16, background: '#FF5722', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 999, boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
        }}><Block en={blocks[dragIdx]} dv={deva[dragIdx]} /></div>
      )}
    </div>
  );
}
