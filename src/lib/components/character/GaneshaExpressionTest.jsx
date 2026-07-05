import React, { useState } from 'react';
import GaneshaCharacter from './GaneshaCharacter';

const EXPRESSIONS = ['happy', 'excited', 'thinking', 'surprised', 'encouraging'];

const EXPRESSION_META = {
  happy:       { emoji: '😊', label: 'Happy',       color: '#FFD700', when: 'Default / greeting / idle' },
  excited:     { emoji: '🎉', label: 'Excited',      color: '#FF6B35', when: 'Correct answer / game win / zone unlocked' },
  thinking:    { emoji: '🤔', label: 'Thinking',     color: '#7B68EE', when: 'Quiz / puzzle / choosing answer' },
  surprised:   { emoji: '😲', label: 'Surprised',    color: '#FF69B4', when: 'Unexpected discovery / bonus found' },
  encouraging: { emoji: '💪', label: 'Encouraging',  color: '#32CD32', when: 'Wrong answer / retry / coach tip' },
};

export default function GaneshaExpressionTest() {
  const [active, setActive] = useState(null); // null = show all

  const show = active ? [active] : EXPRESSIONS;

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a3a2a 100%)',
      fontFamily: 'system-ui, sans-serif',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ color: '#FFD700', fontSize: 28, margin: 0, letterSpacing: 1 }}>
          ✨ GaneshaCharacter — Expression Preview
        </h1>
        <p style={{ color: '#ccc', marginTop: 8, fontSize: 14 }}>
          Click an expression to zoom in · Click again to see all
        </p>
      </div>

      {/* Expression grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        justifyContent: 'center',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        {show.map(expr => {
          const meta = EXPRESSION_META[expr];
          const isZoomed = active === expr;
          return (
            <div
              key={expr}
              onClick={() => setActive(isZoomed ? null : expr)}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `2px solid ${isZoomed ? meta.color : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                width: isZoomed ? 320 : 160,
                boxShadow: isZoomed ? `0 0 32px ${meta.color}55` : 'none',
              }}
            >
              <GaneshaCharacter
                expression={expr}
                size={isZoomed ? 220 : 130}
                style={{ transition: 'all 0.25s ease' }}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isZoomed ? 22 : 18, marginBottom: 4 }}>
                  {meta.emoji} <span style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</span>
                </div>
                {isZoomed && (
                  <div style={{
                    color: '#ccc',
                    fontSize: 13,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: '#FFD700', fontWeight: 600 }}>Use when: </span>
                    {meta.when}
                  </div>
                )}
                <div style={{ color: '#888', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>
                  expression="{expr}"
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage snippet */}
      <div style={{
        maxWidth: 560,
        margin: '48px auto 0',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ color: '#FFD700', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
          📋 Usage
        </div>
        <pre style={{ color: '#a8e6cf', fontSize: 12, margin: 0, lineHeight: 1.7, overflow: 'auto' }}>{`import GaneshaCharacter from '@/lib/components/character/GaneshaCharacter';

// In your scene:
<GaneshaCharacter expression="happy"       size={200} />
<GaneshaCharacter expression="excited"     size={200} />
<GaneshaCharacter expression="thinking"    size={200} />
<GaneshaCharacter expression="surprised"   size={200} />
<GaneshaCharacter expression="encouraging" size={200} />`}</pre>
      </div>
    </div>
  );
}
