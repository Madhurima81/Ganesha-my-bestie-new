import React, { useMemo } from 'react';
import { GANESHA_ZONES, ZONE_VISUAL_Z_INDEX, ZONE_HITBOX_Z_INDEX } from '../../../ganeshaZones';
import ganeshaBase from './assets/images/ganesha-base.png';
import ganeshaEyes from './assets/images/ganesha-eyes.png';
import ganeshaEar from './assets/images/ganesha-ear.png';
import ganeshaTrunk from './assets/images/ganesha-trunk.png';
import ganeshaTusk from './assets/images/ganesha-tusk.png';
import ganeshaModak from './assets/images/ganesha-modak.png';
import ganeshaLotus from './assets/images/ganesha-lotus.png';
import ganeshaBelly from './assets/images/ganesha-belly.png';
import ganeshaMooshika from './assets/images/ganesha-mooshika.png';

const ZONE_PARTS = {
  eyes: ganeshaEyes,
  ears: ganeshaEar,
  trunk: ganeshaTrunk,
  tusk: ganeshaTusk,
  'left-hand': ganeshaModak,
  'right-hand': ganeshaLotus,
  belly: ganeshaBelly,
  base: ganeshaMooshika
};

const SHOW_HIT_ZONES =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('hitzones');

// Build flat hitbox list from a (possibly overridden) zones array.
// One zone can have multiple hit areas (e.g., ears left + right).
const buildHitboxes = (zones) => {
  const list = [];
  zones.forEach(zone => {
    list.push({ hitId: `${zone.id}-main`, zoneId: zone.id, box: zone.position });
    (zone.extraHitboxes || []).forEach(extra => {
      list.push({ hitId: extra.hitId, zoneId: zone.id, box: extra.box });
    });
  });
  return list;
};

const isPointerInsideOval = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  const nx = (event.clientX - rect.left) / rect.width;
  const ny = (event.clientY - rect.top) / rect.height;
  const dx = (nx - 0.5) / 0.5;
  const dy = (ny - 0.5) / 0.5;
  return (dx * dx) + (dy * dy) <= 1;
};

const GaneshaIllustration = ({ zoneStates = {}, onZoneClick, activeZoneId = null, baseOpacity = 0.2, showTapMarkers = false, zoneOverrides = {}, showTapIntroPulse = false }) => {
  // Dev "Hint Debug" panel can drag a zone to a new spot without touching
  // ganeshaZones.js — when it does, that override fully replaces the
  // zone's `position` here so hitbox and visible tap marker move together.
  const zones = useMemo(
    () => GANESHA_ZONES.map((zone) => (
      zoneOverrides[zone.id] ? { ...zone, position: zoneOverrides[zone.id] } : zone
    )),
    [zoneOverrides]
  );
  const zoneHitboxes = useMemo(() => buildHitboxes(zones), [zones]);

  return (
    <div className="ganesha-illustration-breathing" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img
        src={ganeshaBase}
        alt="Ganesha"
        draggable={false}
        className="ganesha-base-breathing"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', opacity: baseOpacity, userSelect: 'none', transition: 'opacity 0.35s ease' }}
      />

      {Object.entries(ZONE_PARTS).map(([zoneId, src]) => {
        const state = zoneStates[zoneId] || 'idle';
        const isPlaced = state === 'placed';
        const isCorrect = state === 'correct';
        const opacity = isPlaced || isCorrect ? 1 : 0;

        return (
          <img
            key={zoneId}
            src={src}
            alt=""
            draggable={false}
            className={[isCorrect ? 'svg-zone-correct' : '', `ganesha-zone-part-${zoneId}`].filter(Boolean).join(' ')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity,
              transition: isPlaced ? 'opacity 0.5s ease' : 'none',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: ZONE_VISUAL_Z_INDEX[zoneId]
            }}
          />
        );
      })}

      {/* Small visible choice markers. The real hitboxes remain large/invisible below. */}
      {showTapMarkers && zones.map((zone) => {
        const state = zoneStates[zone.id] || 'idle';
        const unavailable = state === 'placed' || state === 'correct';
        if (unavailable) return null;

        const isWrong = state === 'wrong';
        const isFinalHint = zone.id === activeZoneId || state === 'hint-final';

        return (
          <div
            key={`tap-marker-${zone.id}`}
            className="assembly-tap-marker-anchor"
            style={{
              position: 'absolute',
              ...zone.position,
              zIndex: 18,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <span
              className={[
                'assembly-tap-marker',
                showTapIntroPulse ? 'is-intro' : '',
                isWrong ? 'is-wrong' : '',
                isFinalHint ? 'is-final-hint' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="assembly-tap-marker-dot" />
            </span>
          </div>
        );
      })}

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {zoneHitboxes.map(({ hitId, zoneId, box }) => {
          const state = zoneStates[zoneId] || 'idle';
          const disabled = state === 'placed';

          return (
            <button
              key={`hit-${hitId}`}
              type="button"
              className="ganesha-hitbox-btn"
              aria-label={`Tap ${zoneId}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPointerInsideOval(e)) return;
                if (!disabled) onZoneClick?.(zoneId);
              }}
              onMouseDown={(e) => e.currentTarget.blur()}
              style={{
                position: 'absolute',
                ...box,
                minWidth: '60px',
                minHeight: '60px',
                cursor: disabled ? 'default' : 'pointer',
                pointerEvents: disabled ? 'none' : 'auto',
                // border: '2px solid red', // debug only
                border: 'none',
                // backgroundColor: 'rgba(255, 0, 0, 0.3)', // debug only
                backgroundColor: 'transparent',
                zIndex: zoneId === activeZoneId ? 999 : (ZONE_HITBOX_Z_INDEX[zoneId] || 1),
                padding: 0,
                outline: 'none',
                boxShadow: 'none',
                // display: 'flex', // debug label layout
                // alignItems: 'center',
                // justifyContent: 'center',
                // color: 'black',
                // fontWeight: 'bold',
                // fontSize: '14px'
              }}
            >
              {SHOW_HIT_ZONES && (
                <span className={`assembly-hit-zone-outline assembly-hit-zone-outline--${zoneId}`}>
                  {zoneId}
                </span>
              )}
              {/* {zoneId} */} {/* debug label */}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GaneshaIllustration;
