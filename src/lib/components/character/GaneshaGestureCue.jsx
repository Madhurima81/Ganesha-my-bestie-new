import React, { useEffect, useState } from 'react';
import GaneshaPresence from './GaneshaPresence';

const GaneshaGestureCue = ({
  show = false,
  pose = 'pointing',
  size = 58,
  durationMs = 1500,
  className = '',
  style = {},
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs]);

  if (!visible) return null;

  return (
    <div
      className={`ganesha-gesture-cue ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <GaneshaPresence pose={pose} size={size} />
    </div>
  );
};

export default GaneshaGestureCue;
