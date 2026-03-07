import React, { useEffect, useRef, useMemo } from 'react';
import './CalmGoldenFireworks.css';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const CalmGoldenFireworks = ({
  show = false,
  particles = 14,   // 12–16 allowed
  radius = 80,
  duration = 900,
  className = '',
  style = {},
  onComplete = () => {}
}) => {
  // Keep a stable ref so re-renders never reset the timer
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  const sparks = useMemo(() => {
    if (!show) return [];
    const count = clamp(particles, 12, 16);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 10;
      return { id: i, x: Math.cos(angle) * (radius + jitter), y: Math.sin(angle) * (radius + jitter) };
    });
  }, [show, particles, radius]);

  // Timer only depends on show/duration — onCompleteRef keeps it stable
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onCompleteRef.current?.(), duration);
    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!show) return null;

  return (
    <div className={`soft-fireworks ${className}`.trim()} style={style} aria-hidden="true">
      {sparks.map(spark => (
        <span
          key={spark.id}
          style={{
            '--x': `${spark.x}px`,
            '--y': `${spark.y}px`,
            '--duration': `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default CalmGoldenFireworks;
