import React, { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────
   FireworksCompletion  –  subtle scene-end celebration
   Props
   ─────
   show        : boolean  – show / hide overlay
   message     : string   – headline  (default "Well Done!")
   subMessage  : string   – sub-line  (default "Keep it up! 🌟")
   onContinue  : fn       – Continue button → next scene
   onHome      : fn       – Home button → zone map
   autoShowCard: number   – ms before card appears (default 900)
───────────────────────────────────────────── */

// Soft, warm palette – not too loud
const COLORS = ['#FFB700', '#FF8C42', '#C77DFF', '#74B9FF', '#A8E6CF', '#FFDDD2'];

// ── single tiny spark ───────────────────────────────────────────
function Spark({ x, y, color, angle, delay, dist }) {
  const tx = Math.cos((angle * Math.PI) / 180) * dist;
  const ty = Math.sin((angle * Math.PI) / 180) * dist;
  return (
    <span
      style={{
        position     : 'absolute',
        left         : x,
        top          : y,
        width        : 3,
        height       : 3,
        borderRadius : '50%',
        background   : color,
        opacity      : 0,
        animation    : `fw-spark 0.9s ease-out ${delay}s both`,
        '--tx'       : `${tx}px`,
        '--ty'       : `${ty}px`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── one soft burst (fewer particles, shorter range) ─────────────
function SoftBurst({ x, y, color, delay }) {
  const count = 14;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Spark
          key={i}
          x={x} y={y}
          color={color}
          angle={(360 / count) * i}
          dist={28 + Math.random() * 22}
          delay={delay}
        />
      ))}
    </>
  );
}

// ── generate a small wave of bursts ─────────────────────────────
function useShells(show) {
  const [shells, setShells] = useState([]);

  useEffect(() => {
    if (!show) { setShells([]); return; }

    const make = (n = 4) =>
      Array.from({ length: n }, (_, i) => ({
        id   : Math.random(),
        x    : `${15 + Math.random() * 70}%`,
        y    : `${10 + Math.random() * 50}%`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: i * 0.28,
      }));

    setShells(make(4));
    const t1 = setTimeout(() => setShells(make(4)), 1500);
    const t2 = setTimeout(() => setShells([]),       3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  return shells;
}

// ── 3 subtle stars ───────────────────────────────────────────────
function Stars() {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '8px 0 2px' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            fontSize : 26,
            animation: `fw-star 0.4s ease-out ${0.25 + i * 0.12}s both`,
            display  : 'inline-block',
          }}
        >⭐</span>
      ))}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────
export default function FireworksCompletion({
  show         = false,
  message      = 'Well Done!',
  subMessage   = 'Keep it up! 🌟',
  onContinue,
  onHome,
  autoShowCard = 900,
}) {
  const shells            = useShells(show);
  const [cardIn, setCardIn] = useState(false);

  useEffect(() => {
    if (!show) { setCardIn(false); return; }
    const t = setTimeout(() => setCardIn(true), autoShowCard);
    return () => clearTimeout(t);
  }, [show, autoShowCard]);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes fw-spark {
          0%   { transform: translate(0,0) scale(1); opacity: 0.9; }
          70%  { opacity: 0.7; }
          100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes fw-card {
          0%   { transform: translate(-50%,-50%) scale(0.75); opacity: 0; }
          65%  { transform: translate(-50%,-50%) scale(1.03); }
          100% { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
        }
        @keyframes fw-star {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1);  opacity: 1; }
        }
        @keyframes fw-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fw-btn {
          border: none; cursor: pointer; border-radius: 999px;
          font-weight: 700; font-size: 14px; padding: 10px 26px;
          transition: transform 0.15s;
          font-family: inherit;
        }
        .fw-btn:hover  { transform: scale(1.06); }
        .fw-btn:active { transform: scale(0.95); }
      `}</style>

      {/* dim overlay – soft, not full-black */}
      <div style={{
        position  : 'fixed',
        inset     : 0,
        zIndex    : 9999,
        background: 'rgba(20,10,45,0.60)',
        animation : 'fw-fadein 0.5s ease both',
        overflow  : 'hidden',
      }}>

        {/* soft burst sparks */}
        {shells.map(s => (
          <SoftBurst key={s.id} x={s.x} y={s.y} color={s.color} delay={s.delay} />
        ))}

        {/* ── card ── */}
        {cardIn && (
          <div style={{
            position    : 'absolute',
            top         : '50%',
            left        : '50%',
            transform   : 'translate(-50%,-50%)',
            background  : 'linear-gradient(160deg,#2d1260,#4a1f9e)',
            border      : '2px solid #FFB70088',
            borderRadius: 20,
            padding     : '28px 36px 24px',
            textAlign   : 'center',
            minWidth    : 260,
            maxWidth    : 320,
            boxShadow   : '0 4px 28px #00000055',
            animation   : 'fw-card 0.45s cubic-bezier(.34,1.56,.64,1) both',
          }}>

            <div style={{ fontSize: 46, lineHeight: 1, marginBottom: 2 }}>🐘</div>

            <Stars />

            <h2 style={{
              margin    : '10px 0 3px',
              fontSize  : 24,
              color     : '#FFB700',
              fontFamily: 'inherit',
            }}>
              {message}
            </h2>

            <p style={{
              margin  : '3px 0 18px',
              fontSize: 14,
              color   : '#d4c4f0',
            }}>
              {subMessage}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {onHome && (
                <button
                  className="fw-btn"
                  onClick={onHome}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color     : '#e8e0ff',
                    border    : '1.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  🏠 Home
                </button>
              )}
              {onContinue && (
                <button
                  className="fw-btn"
                  onClick={onContinue}
                  style={{
                    background: 'linear-gradient(135deg,#FF8C42,#FFB700)',
                    color     : '#fff',
                    boxShadow : '0 3px 12px #FF8C4244',
                  }}
                >
                  Continue ➜
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
