import React from 'react';
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

const ZONE_Z_INDEX = {
  base: 1,//mooshika
  ears: 2,
  belly: 3,
  'left-hand': 4,// modak
  'right-hand': 4,//lotus
  trunk: 5,
  tusk: 6,
  eyes: 7
};

// Keep as array so one zone can have multiple hit areas (ears left + right).
const ZONE_HITBOXES = [
  { hitId: 'eyes-main', zoneId: 'eyes', box: { top: '36%', left: '48%', width: '280px', height: '100px', transform: 'translateX(-50%)' } },
  { hitId: 'ears-left', zoneId: 'ears', box: { top: '24%', left: '13%', width: '200px', height: '340px' } },
  { hitId: 'ears-right', zoneId: 'ears', box: { top: '24%', right: '13%', width: '200px', height: '340px' } },
  { hitId: 'trunk-main', zoneId: 'trunk', box: { top: '45%', left: '50%', width: '220px', height: '240px', transform: 'translateX(-50%)' } },
  { hitId: 'tusk-main', zoneId: 'tusk', box: { top: '50%', right: '40%', width: '60px', height: '80px' } },
  { hitId: 'left-hand-main', zoneId: 'left-hand', box: { top: '55%', right: '20%', width: '180px', height: '120px' } },
  { hitId: 'right-hand-main', zoneId: 'right-hand', box: { top: '38%', right: '12%', width: '140px', height: '200px' } },
  { hitId: 'belly-main', zoneId: 'belly', box: { top: '50%', left: '50%', width: '300px', height: '250px', transform: 'translateX(-50%)' } },
  { hitId: 'base-main', zoneId: 'base', box: { bottom: '10%', left: '20%', width: '180px', height: '180px', transform: 'translateX(-50%)' } }
];

const HITBOX_Z_INDEX = {
  base: 10,
  belly: 20,
  'left-hand': 30,
  'right-hand': 30,
  ears: 40,
  trunk: 50,
  tusk: 60,
  eyes: 70
};

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
        const isWrong = state === 'wrong';
        const opacity = isPlaced || isCorrect ? 1 : isWrong ? 0.4 : 0;

        return (
          <img
            key={zoneId}
            src={src}
            alt=""
            draggable={false}
            className={isWrong ? 'svg-zone-wrong' : isCorrect ? 'svg-zone-correct' : ''}
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
              zIndex: ZONE_Z_INDEX[zoneId]
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
                zIndex: zoneId === activeZoneId ? 999 : (HITBOX_Z_INDEX[zoneId] || 1),
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
