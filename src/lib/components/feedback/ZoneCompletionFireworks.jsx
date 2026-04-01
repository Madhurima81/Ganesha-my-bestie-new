import React, { useEffect, useMemo, useState } from 'react';
import './ZoneCompletionFireworks.css';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function ZoneCompletionFireworks({
  show = false,
  burstsPerWave = 5,
  particles = 24,
  radius = 130,
  duration = 2600,
  className = '',
  onComplete = () => {}
}) {
  const [wave, setWave] = useState(0);

  useEffect(() => {
    if (!show) {
      setWave(0);
      return;
    }

    setWave(1);

    const w2 = setTimeout(() => setWave(2), 700);
    const w3 = setTimeout(() => setWave(3), 1400);
    const end = setTimeout(() => {
      setWave(0);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(w2);
      clearTimeout(w3);
      clearTimeout(end);
    };
  }, [show, duration, onComplete]);

  const bursts = useMemo(() => {
    if (!wave) return [];

    const count = clamp(burstsPerWave, 3, 7);
    return Array.from({ length: count }, (_, i) => ({
      id: `${wave}-${i}-${Math.random()}`,
      x: `${15 + Math.random() * 70}%`,
      y: `${10 + Math.random() * 55}%`
    }));
  }, [wave, burstsPerWave]);

  const sparks = (burstId) => {
    const count = clamp(particles, 18, 30);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const dist = radius * (0.7 + Math.random() * 0.6);

      return {
        id: `${burstId}-${i}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      };
    });
  };

  if (!show) return null;

  return (
    <div className={`zone-fireworks ${className}`.trim()} aria-hidden="true">
      {bursts.map((b) => (
        <div
          key={b.id}
          className="zone-firework-burst"
          style={{ left: b.x, top: b.y }}
        >
          <div className="zone-firework-core" />
          {sparks(b.id).map((s) => (
            <span
              key={s.id}
              style={{
                '--x': `${s.x}px`,
                '--y': `${s.y}px`,
                '--duration': `${duration}ms`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
