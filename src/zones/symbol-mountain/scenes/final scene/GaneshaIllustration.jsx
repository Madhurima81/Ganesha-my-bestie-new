import React from 'react';
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

// Build flat hitbox list from shared GANESHA_ZONES config.
// One zone can have multiple hit areas (e.g., ears left + right).
const buildHitboxes = () => {
  const list = [];
  GANESHA_ZONES.forEach(zone => {
    list.push({ hitId: `${zone.id}-main`, zoneId: zone.id, box: zone.position });
    (zone.extraHitboxes || []).forEach(extra => {
      list.push({ hitId: extra.hitId, zoneId: zone.id, box: extra.box });
    });
  });
  return list;
};

const ZONE_HITBOXES = buildHitboxes();

const GaneshaIllustration = ({ zoneStates = {}, onZoneClick, activeZoneId = null, baseOpacity = 0.2 }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img
        src={ganeshaBase}
        alt="Ganesha"
        draggable={false}
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
            className={isCorrect ? 'svg-zone-correct' : ''}
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

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {ZONE_HITBOXES.map(({ hitId, zoneId, box }) => {
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
              {/* {zoneId} */} {/* debug label */}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GaneshaIllustration;
