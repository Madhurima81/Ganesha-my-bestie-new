import React, { useState, useRef, useEffect } from 'react';
import GestureDemo from '../../../lib/components/feedback/GestureDemo';
import './Drawingpad.css';

// Shared "draw it" pad (Favourite Food, Dreams & Wishes).
// The canvas has a FIXED logical size, so strokes, typed text and the exported PNG always line up no
// matter how the pad is laid out on screen. Typed text is drawn straight onto the canvas, so Undo,
// the eraser and the saved image all treat it like any other mark.
const W = 900;
const H = 600;
const BRUSH = [4, 10, 20];
const TEXT_SIZE = [30, 44, 62];
const ERASER_SCALE = 2.5;
const MAX_UNDO = 20;
const FONT = '"Baloo 2", "Nunito", sans-serif';

const COLORS = [
  { hex: '#E53935', label: 'Red' },
  { hex: '#FB8C00', label: 'Orange' },
  { hex: '#FDD835', label: 'Yellow' },
  { hex: '#43A047', label: 'Green' },
  { hex: '#1E88E5', label: 'Blue' },
  { hex: '#8E24AA', label: 'Purple' },
  { hex: '#F06292', label: 'Pink' },
  { hex: '#6D4C41', label: 'Brown' },
  { hex: '#263238', label: 'Black' },
];

const SIZE_LABEL = ['Thin', 'Medium', 'Thick'];

const Icon = ({ name }) => {
  const common = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (name) {
    case 'brush':
      return (
        <svg {...common}>
          <path d="M3 21c3 0 5-1.2 5.4-3.6.2-1.4-.6-2.4-1.9-2.4C4.7 15 3 16.8 3 21Z" fill="currentColor" stroke="none" />
          <path d="M8.5 14.5 19 4a2.1 2.1 0 0 1 3 3L11.5 17.5" />
        </svg>
      );
    case 'eraser':
      return (
        <svg {...common}>
          <path d="m7 21-4-4a2 2 0 0 1 0-2.8L14.2 3a2 2 0 0 1 2.8 0l4 4a2 2 0 0 1 0 2.8L10 21H7Z" />
          <path d="M10 21h11M8 8l8 8" />
        </svg>
      );
    case 'text':
      return (
        <svg {...common} strokeWidth={2.6}>
          <path d="M4 19 10 5l6 14M6.2 14.5h7.6M19 10v9M19 10c-1.8 0-3 1-3 2.4S17.2 15 19 15" />
        </svg>
      );
    case 'undo':
      return (
        <svg {...common}>
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </svg>
      );
    case 'redo':
      return (
        <svg {...common}>
          <path d="m15 14 5-5-5-5" />
          <path d="M20 9H10a6 6 0 0 0 0 12h3" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} strokeWidth={3.4}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common} strokeWidth={3}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m3 21 1.2-5.2L16.4 3.6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8.2 19.8 3 21Z" />
        </svg>
      );
    default:
      return null;
  }
};

const DrawingPad = ({
  prompt = 'Draw your dream 💛',
  onSave,
  onCancel,
  initialData, // saved draft to restore
  onAutoSave,  // called with a PNG data URL after every finished stroke / text / undo
}) => {
  const canvasRef = useRef(null);
  const paperRef = useRef(null);
  const textElRef = useRef(null);
  const drawingRef = useRef(false);
  const pathRef = useRef({ last: null, mid: null });
  const undoRef = useRef([]);
  const redoRef = useRef([]);
  const busyRef = useRef(false); // an undo/redo image is still loading
  const textRef = useRef(null); // mirror of textInput for async handlers
  const dragRef = useRef(null); // { px, py, x, y, moved } while the text box is being moved

  const [color, setColor] = useState(COLORS[0].hex);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [tool, setTool] = useState('draw'); // 'draw' | 'erase' | 'text'
  // { x, y, value, placed } in canvas px. `placed` = typed and confirmed, but still floating: it can be
  // dragged or tapped to edit until the child taps something else, which draws it onto the canvas.
  const [textInput, setTextInput] = useState(null);
  const [counts, setCounts] = useState({ undo: 0, redo: 0 });
  const [showIntro, setShowIntro] = useState(true);

  const ctx = () => canvasRef.current.getContext('2d');

  const setText = (value) => {
    textRef.current = value;
    setTextInput(value);
  };

  const syncCounts = () => setCounts({ undo: undoRef.current.length, redo: redoRef.current.length });

  const snapshot = () => canvasRef.current.toDataURL('image/png');

  const autoSave = () => {
    if (onAutoSave) onAutoSave(snapshot());
  };

  const pushUndo = () => {
    undoRef.current = [...undoRef.current.slice(-(MAX_UNDO - 1)), snapshot()];
    redoRef.current = [];
    syncCounts();
  };

  // Blank white page, then the saved draft on top of it.
  useEffect(() => {
    const c = ctx();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, W, H);
    if (initialData) {
      const img = new Image();
      img.onload = () => c.drawImage(img, 0, 0, W, H);
      img.src = initialData;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the text box as soon as it opens.
  useEffect(() => {
    if (textInput && !textInput.placed && textElRef.current) textElRef.current.focus();
  }, [textInput === null, textInput?.placed]); // eslint-disable-line react-hooks/exhaustive-deps

  const toCanvas = (p) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((p.clientX - rect.left) * W) / rect.width, y: ((p.clientY - rect.top) * H) / rect.height };
  };

  /* ---------- text ---------- */

  // Typed + confirmed: keep it floating so it can still be moved.
  const placeText = () => {
    const t = textRef.current;
    if (!t) return;
    if (!t.value.trim()) {
      setText(null);
      return;
    }
    setText({ ...t, placed: true });
  };

  // Draws the typed line onto the canvas exactly where the box shows it, at the size it shows.
  const commitText = async () => {
    const t = textRef.current;
    if (!t) return;
    const value = t.value.trim();
    const el = textElRef.current;
    const paper = paperRef.current;
    let x = 0;
    let y = 0;
    if (el && paper) {
      const pr = paper.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const k = W / pr.width;
      x = (er.left - pr.left) * k;
      y = (er.top - pr.top) * k + (er.height * k) / 2;
    }
    setText(null);
    if (!value || !el || !paper) return;

    const size = TEXT_SIZE[sizeIdx];
    try {
      await document.fonts?.load(`700 ${size}px "Baloo 2"`);
    } catch (err) { /* fall back to the next font */ }

    pushUndo();
    const c = ctx();
    c.save();
    c.font = `700 ${size}px ${FONT}`;
    c.textBaseline = 'middle';
    c.fillStyle = color;
    c.fillText(value, x, y, Math.max(40, W - x - 8));
    c.restore();
    autoSave();
  };

  // Move the text box by its grip. Kept inside the paper so it can never be lost off the edge.
  const onGripDown = (e) => {
    if (!e.isPrimary || !textRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: textRef.current.x, y: textRef.current.y, moved: false };
  };

  const onGripMove = (e) => {
    const d = dragRef.current;
    if (!d || !paperRef.current) return;
    e.preventDefault();
    if (!d.moved && Math.hypot(e.clientX - d.px, e.clientY - d.py) < 6) return;
    d.moved = true;
    const pr = paperRef.current.getBoundingClientRect();
    const k = W / pr.width;
    const boxW = Math.min(pr.width * 0.92, 600);
    const maxX = ((pr.width - boxW) / pr.width) * W;
    const maxY = ((pr.height - 72) / pr.height) * H;
    const x = Math.min(Math.max(0, d.x + (e.clientX - d.px) * k), maxX);
    const y = Math.min(Math.max(0, d.y + (e.clientY - d.py) * k), maxY);
    setText({ ...textRef.current, x, y });
  };

  const onGripUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    const t = textRef.current;
    if (t?.placed && !d.moved) setText({ ...t, placed: false }); // a tap on placed text edits it again
    else if (!t?.placed) textElRef.current?.focus();
  };

  const openTextAt = async (pt) => {
    await commitText();
    setText({ x: pt.x, y: pt.y, value: '' });
  };

  /* ---------- drawing ---------- */

  const onPointerDown = (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    setShowIntro(false);
    const pt = toCanvas(e);
    if (tool === 'text') {
      openTextAt(pt);
      return;
    }
    pushUndo();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    const c = ctx();
    const erase = tool === 'erase';
    const width = BRUSH[sizeIdx] * (erase ? ERASER_SCALE : 1);
    c.fillStyle = erase ? '#ffffff' : color;
    c.strokeStyle = erase ? '#ffffff' : color;
    c.lineWidth = width;
    c.beginPath();
    c.arc(pt.x, pt.y, width / 2, 0, Math.PI * 2);
    c.fill();
    pathRef.current = { last: pt, mid: pt };
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current || !e.isPrimary) return;
    e.preventDefault();
    const c = ctx();
    const native = e.nativeEvent;
    const events = native.getCoalescedEvents?.() || [];
    (events.length ? events : [native]).forEach((ev) => {
      const pt = toCanvas(ev);
      const { last, mid } = pathRef.current;
      const nextMid = { x: (last.x + pt.x) / 2, y: (last.y + pt.y) / 2 };
      c.beginPath();
      c.moveTo(mid.x, mid.y);
      c.quadraticCurveTo(last.x, last.y, nextMid.x, nextMid.y);
      c.stroke();
      pathRef.current = { last: pt, mid: nextMid };
    });
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const { last, mid } = pathRef.current;
    const c = ctx();
    c.beginPath();
    c.moveTo(mid.x, mid.y);
    c.lineTo(last.x, last.y);
    c.stroke();
    autoSave();
  };

  /* ---------- tools ---------- */

  const pickColor = (hex) => {
    setColor(hex);
    if (tool === 'erase') setTool('draw');
  };

  const pickSize = (i) => {
    setSizeIdx(i);
    if (tool === 'erase') setTool('draw');
  };

  const pickTool = async (next) => {
    if (next !== 'text') await commitText();
    setTool(next);
  };

  const restoreFrom = (url) => {
    busyRef.current = true;
    const img = new Image();
    img.onload = () => {
      const c = ctx();
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, W, H);
      c.drawImage(img, 0, 0, W, H);
      busyRef.current = false;
      autoSave();
    };
    img.onerror = () => { busyRef.current = false; };
    img.src = url;
  };

  const handleUndo = () => {
    if (textRef.current) {
      setText(null);
      return;
    }
    if (busyRef.current || !undoRef.current.length) return;
    const prev = undoRef.current[undoRef.current.length - 1];
    undoRef.current = undoRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, snapshot()];
    syncCounts();
    restoreFrom(prev);
  };

  const handleRedo = () => {
    if (busyRef.current || !redoRef.current.length) return;
    const next = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    undoRef.current = [...undoRef.current, snapshot()];
    syncCounts();
    restoreFrom(next);
  };

  const handleSave = async () => {
    await commitText();
    if (onSave) onSave({ image: snapshot() });
  };

  const handleDownload = async () => {
    await commitText();
    const link = document.createElement('a');
    link.href = snapshot();
    link.download = 'my-drawing.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const textStyle = textInput
    ? {
        '--dpad-x': textInput.x / W,
        '--dpad-y': textInput.y / H,
        '--dpad-ts': TEXT_SIZE[sizeIdx],
        '--dpad-ink': color,
      }
    : undefined;

  return (
    <div className="dpad" role="dialog" aria-label={prompt}>
      <header className="dpad-header">
        <h2 className="dpad-title">
          <span className="dpad-title-icon"><Icon name="pencil" /></span>
          <span>{prompt}</span>
        </h2>
        {onCancel && (
          <button type="button" className="dpad-close" onClick={onCancel} aria-label="Close drawing">
            <Icon name="close" />
          </button>
        )}
      </header>

      <div className="dpad-side">
        <div className="dpad-tools" role="toolbar" aria-label="Drawing tools">
          {COLORS.map((c) => {
            const active = color === c.hex && tool !== 'erase';
            return (
              <button
                key={c.hex}
                type="button"
                className={`dpad-swatch ${active ? 'is-active' : ''}`}
                style={{ '--dpad-dab': c.hex }}
                onClick={() => pickColor(c.hex)}
                aria-label={c.label}
                aria-pressed={active}
              >
                <span className="dpad-dab">{active && <Icon name="check" />}</span>
              </button>
            );
          })}

          <button
            type="button"
            className={`dpad-tool ${tool === 'draw' ? 'is-active' : ''}`}
            onClick={() => pickTool('draw')}
            aria-label="Brush"
            aria-pressed={tool === 'draw'}
          >
            <Icon name="brush" />
          </button>
          <button
            type="button"
            className={`dpad-tool ${tool === 'erase' ? 'is-active' : ''}`}
            onClick={() => pickTool('erase')}
            aria-label="Eraser"
            aria-pressed={tool === 'erase'}
          >
            <Icon name="eraser" />
          </button>
          <button
            type="button"
            className={`dpad-tool ${tool === 'text' ? 'is-active' : ''}`}
            onClick={() => { setShowIntro(false); pickTool('text'); }}
            aria-label="Write words"
            aria-pressed={tool === 'text'}
          >
            <Icon name="text" />
          </button>

          {BRUSH.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dpad-size ${sizeIdx === i ? 'is-active' : ''}`}
              onClick={() => pickSize(i)}
              aria-label={SIZE_LABEL[i]}
              aria-pressed={sizeIdx === i}
            >
              <span
                className="dpad-size-dot"
                style={{ width: 10 + i * 9, height: 10 + i * 9, background: tool === 'erase' ? '#B0A094' : color }}
              />
            </button>
          ))}
        </div>

        <div className="dpad-actions">
          <div className="dpad-history">
            <button type="button" className="dpad-round" onClick={handleUndo} disabled={!counts.undo && !textInput} aria-label="Undo">
              <Icon name="undo" />
            </button>
            <button type="button" className="dpad-round" onClick={handleRedo} disabled={!counts.redo} aria-label="Redo">
              <Icon name="redo" />
            </button>
          </div>
          <button type="button" className="dpad-done" onClick={handleSave}>
            <Icon name="check" />
            <span>Done</span>
          </button>
          <button type="button" className="dpad-save" onClick={handleDownload}>
            Save
          </button>
        </div>
      </div>

      <div className="dpad-stage">
        <div className={`dpad-paper tool-${tool}`} ref={paperRef}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="dpad-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onContextMenu={(e) => e.preventDefault()}
          />

          {textInput && (
            <div
              className={`dpad-textbox ${textInput.placed ? 'is-placed' : ''}`}
              style={textStyle}
              {...(textInput.placed
                ? { onPointerDown: onGripDown, onPointerMove: onGripMove, onPointerUp: onGripUp, onPointerCancel: onGripUp }
                : {})}
            >
              <button
                type="button"
                className="dpad-grip"
                aria-label="Drag to move the words"
                tabIndex={textInput.placed ? -1 : 0}
                {...(textInput.placed
                  ? {}
                  : { onPointerDown: onGripDown, onPointerMove: onGripMove, onPointerUp: onGripUp, onPointerCancel: onGripUp })}
              >
                <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true" fill="currentColor">
                  <circle cx="6" cy="6" r="2.6" /><circle cx="16" cy="6" r="2.6" />
                  <circle cx="6" cy="15" r="2.6" /><circle cx="16" cy="15" r="2.6" />
                  <circle cx="6" cy="24" r="2.6" /><circle cx="16" cy="24" r="2.6" />
                </svg>
              </button>
              {textInput.placed ? (
                <span ref={textElRef} className="dpad-textinput dpad-placed-text">{textInput.value}</span>
              ) : (
                <input
                  ref={textElRef}
                  className="dpad-textinput"
                  type="text"
                  value={textInput.value}
                  maxLength={28}
                  placeholder="Type here…"
                  enterKeyHint="done"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(e) => setText({ ...textRef.current, value: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); placeText(); }
                    if (e.key === 'Escape') { e.preventDefault(); setText(null); }
                  }}
                />
              )}
              {!textInput.placed && (
                <button type="button" className="dpad-text-ok" onClick={placeText} aria-label="Place the words">
                  <Icon name="check" />
                </button>
              )}
              <button
                type="button"
                className="dpad-text-no"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setText(null)}
                aria-label="Delete the words"
              >
                <Icon name="close" />
              </button>
            </div>
          )}

          <GestureDemo
            type="drag"
            from={{ x: 30, y: 60 }}
            to={{ x: 65, y: 35 }}
            active={showIntro}
            idleDelay={300}
            zIndex={5}
          />
        </div>
      </div>

    </div>
  );
};

export default DrawingPad;
