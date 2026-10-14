import React from 'react';
import './DiscoveryFlight.css';

// The icon that pops up in the middle of the screen and floats up to the sidebar.
// Shared by Dreams and Favourite Food. Visual only: the games time their own voice lines with their
// own constants (DISCOVERY_CENTER_REACH_MS etc.); this component only needs the total flight length.
//   durationMs - whole flight, set by the game (Dreams 2200, Food 3200)
//   size       - 'sm' (Dreams) or 'lg' (Food)
// The caller gives it a `key` so each new flight restarts.
const DiscoveryFlight = ({
  image = null,
  emoji = null,
  name = '',
  durationMs = 2200,
  size = 'sm',
  isChild = false,
  isModak = false,
  showName = false,
}) => {
  const cls = [
    'am-discovery-fly',
    `am-discovery-fly--${size === 'lg' ? 'lg' : 'sm'}`,
    isChild ? 'am-discovery-fly--child' : '',
    isModak ? 'am-discovery-fly--modak' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={{ '--am-discovery-duration': `${durationMs}ms` }} aria-hidden="true">
      {image ? (
        <img src={image} alt={name} className="am-discovery-fly__image" />
      ) : (
        <span className="am-discovery-fly__emoji">{emoji}</span>
      )}
      {showName && name && <div className="am-discovery-fly__label">{name}</div>}
    </div>
  );
};

export default DiscoveryFlight;
