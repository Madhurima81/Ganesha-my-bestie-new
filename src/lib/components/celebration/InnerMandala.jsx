import { useState, useEffect, useRef, useCallback } from 'react';
import './InnerMandala.css';

const OUTER_PETALS = [
  { id: 2, d: 'm 7.0962243,7.8042142 c 0,0 -0.1727703,-1.1623311 0.5079506,-1.9539222 0.6807209,-0.7915911 1.9164426,-0.545657 1.9164426,-0.545657 0,0 0.1517514,1.2380732 -0.4767976,1.9214999 -0.628548,0.6834267 -1.9475956,0.5780793 -1.9475956,0.5780793 z' },
  { id: 3, d: 'm 7.0936362,7.9845938 c 0,0 0.699725,-0.944059 1.7408069,-1.0224563 1.0410822,-0.078398 1.7409669,0.969292 1.7409669,0.969292 0,0 -0.7681456,0.9827541 -1.6958519,1.0215588 C 7.9518518,8.9917934 7.0936362,7.9845938 7.0936362,7.9845938 Z' },
  { id: 4, d: 'm 6.9290672,8.2476714 c 0,0 1.1623311,-0.1727702 1.9539222,0.5079506 0.7915913,0.6807207 0.5456574,1.916443 0.5456574,1.916443 0,0 -1.2380737,0.151752 -1.9215005,-0.476797 C 6.8237198,9.5667187 6.9290672,8.2476714 6.9290672,8.2476714 Z' },
  { id: 5, d: 'm 6.6727192,8.255936 c 0,0 0.9440594,0.6997252 1.0224563,1.7408068 0.078398,1.0410822 -0.9692917,1.7409672 -0.9692917,1.7409672 0,0 -0.9827544,-0.768144 -1.0215591,-1.695852 C 5.6655206,9.1141517 6.6727192,8.255936 6.6727192,8.255936 Z' },
  { id: 6, d: 'm 6.48561,8.0805144 c 0,0 0.1727702,1.1623311 -0.5079503,1.9539226 -0.680721,0.791591 -1.916443,0.545657 -1.916443,0.545657 0,0 -0.1517512,-1.2380737 0.4767974,-1.9215005 C 5.1665623,7.9751671 6.48561,8.0805144 6.48561,8.0805144 Z' },
  { id: 7, d: 'm 6.4773454,7.8241665 c 0,0 -0.6997252,0.9440591 -1.7408066,1.0224565 C 3.695457,8.92502 2.995571,7.877331 2.995571,7.877331 c 0,0 0.7681461,-0.9827544 1.6958526,-1.021559 0.9277063,-0.038805 1.7859218,0.9683945 1.7859218,0.9683945 z' },
  { id: 8, d: 'm 6.652767,7.6370574 c 0,0 -1.1623312,0.1727701 -1.9539221,-0.5079505 C 3.9072536,6.4483861 4.1531876,5.212664 4.1531876,5.212664 c 0,0 1.2380737,-0.1517511 1.9215003,0.4767974 0.6834267,0.6285479 0.5780791,1.947596 0.5780791,1.947596 z' },
  { id: 1, d: 'm 6.9091149,7.6287928 c 0,0 -0.9440591,-0.6997252 -1.0224565,-1.7408068 -0.078398,-1.0410816 0.9692919,-1.7409677 0.9692919,-1.7409677 0,0 0.9827545,0.7681461 1.0215591,1.6958526 0.038805,0.9277063 -0.9683945,1.7859219 -0.9683945,1.7859219 z' },
];

const MIDDLE_PETALS = [
  { id: 8, d: 'm 6.5668825,7.8167606 c 0,0 0.1046815,-0.7257047 -0.3077671,-1.2199369 C 5.8466668,6.1025915 5.0979431,6.2561412 5.0979431,6.2561412 c 0,0 -0.091946,0.7729945 0.2888916,1.1996939 0.3808372,0.4266994 1.1800478,0.3609255 1.1800478,0.3609255 z' },
  { id: 1, d: 'm 6.6820546,7.7112194 c 0,0 0.5871717,-0.4391297 0.6450014,-1.0802498 0.05783,-0.6411202 -0.5801739,-1.0619717 -0.5801739,-1.0619717 0,0 -0.6116052,0.481574 -0.6440344,1.0525889 -0.03243,0.5710146 0.5792069,1.0896326 0.5792069,1.0896326 z' },
  { id: 2, d: 'm 6.8381224,7.7180295 c 0,0 0.7257047,0.1046815 1.2199369,-0.3077671 0.4942324,-0.4124484 0.3406825,-1.1611723 0.3406825,-1.1611723 0,0 -0.7729945,-0.091946 -1.1996939,0.2888917 C 6.7723482,6.9188186 6.8381224,7.7180295 6.8381224,7.7180295 Z' },
  { id: 3, d: 'm 6.9436636,7.8332016 c 0,0 0.4391297,0.5871717 1.0802498,0.6450014 0.6411202,0.05783 1.0619717,-0.5801739 1.0619717,-0.5801739 0,0 -0.481574,-0.6116053 -1.0525889,-0.6440344 -0.5710146,-0.03243 -1.0896326,0.5792069 -1.0896326,0.5792069 z' },
  { id: 4, d: 'm 6.9368535,7.9892694 c 0,0 -0.1046815,0.7257047 0.3077671,1.2199369 0.4124485,0.4942324 1.1611723,0.3406825 1.1611723,0.3406825 0,0 0.091946,-0.7729945 -0.2888917,-1.1996939 C 7.7360644,7.9234952 6.9368535,7.9892694 6.9368535,7.9892694 Z' },
  { id: 5, d: 'm 6.8216814,8.0948106 c 0,0 -0.5871717,0.4391297 -0.6450014,1.0802498 -0.05783,0.6411203 0.5801739,1.0619716 0.5801739,1.0619716 0,0 0.6116053,-0.4815739 0.6440344,-1.0525888 C 7.4333183,8.6134286 6.8216814,8.0948106 6.8216814,8.0948106 Z' },
  { id: 6, d: 'm 6.6656136,8.0880005 c 0,0 -0.7257047,-0.1046815 -1.2199368,0.3077671 -0.4942325,0.4124485 -0.3406825,1.1611722 -0.3406825,1.1611722 0,0 0.7729945,0.091946 1.1996938,-0.2888916 C 6.7313879,8.8872114 6.6656136,8.0880005 6.6656136,8.0880005 Z' },
  { id: 7, d: 'm 6.5600725,7.9728284 c 0,0 -0.4391298,-0.5871717 -1.0802498,-0.6450013 C 4.8387024,7.269997 4.417851,7.9080009 4.417851,7.9080009 c 0,0 0.481574,0.6116053 1.0525889,0.6440344 0.5710146,0.03243 1.0896326,-0.5792069 1.0896326,-0.5792069 z' },
];

const INNER_PETALS = [
  { id: 1, d: 'm 6.4748057,7.2784162 c 0,0 -0.069814,-0.5969677 0.3214442,-0.5969677 0.2587064,0 0.229603,0.6428885 0.229603,0.6428885 0,0 -0.068744,0.3025604 -0.2825799,0.2702223 C 6.4925253,7.5566392 6.4748057,7.2784162 6.4748057,7.2784162 Z' },
  { id: 3, d: 'm 7.4005012,7.6286697 c 0,0 0.5969677,-0.069814 0.5969677,0.3214442 0,0.2587065 -0.6428885,0.229603 -0.6428885,0.229603 0,0 -0.3025604,-0.068744 -0.270221,-0.2825812 0.03792,-0.2507476 0.3161432,-0.2684672 0.3161432,-0.2684672 z' },
  { id: 4, d: 'm 7.4170923,8.1640573 c 0,0 0.4714858,0.372754 0.1948245,0.6494153 -0.1829331,0.1829331 -0.6169446,-0.292237 -0.6169446,-0.292237 0,0 -0.1653332,-0.2625518 0.00874,-0.3908901 0.2041188,-0.1504919 0.413382,0.033712 0.413382,0.033712 z' },
  { id: 5, d: 'm 7.0502477,8.5543652 c 0,0 0.069814,0.5969677 -0.3214442,0.5969677 -0.2587065,0 -0.2296029,-0.6428885 -0.2296029,-0.6428885 0,0 0.068744,-0.3025603 0.2825811,-0.2702209 0.2507477,0.03792 0.2684673,0.3161432 0.2684673,0.3161432 z' },
  { id: 6, d: 'm 6.5148601,8.5709563 c 0,0 -0.372754,0.4714858 -0.6494153,0.1948245 -0.1829331,-0.1829331 0.2922371,-0.6169446 0.2922371,-0.6169446 0,0 0.2625517,-0.1653331 0.39089,0.00874 0.1504919,0.2041189 -0.033712,0.4133821 -0.033712,0.4133821 z' },
  { id: 7, d: 'm 6.1245522,8.2041118 c 0,0 -0.5969677,0.069814 -0.5969677,-0.3214443 0,-0.2587064 0.6428886,-0.2296029 0.6428886,-0.2296029 0,0 0.3025602,0.068744 0.2702208,0.2825811 C 6.4027739,8.1863934 6.1245507,8.204113 6.1245507,8.204113 Z' },
  { id: 8, d: 'm 6.1079611,7.6687242 c 0,0 -0.4714859,-0.372754 -0.1948245,-0.6494154 0.1829331,-0.182933 0.6169447,0.2922371 0.6169447,0.2922371 0,0 0.165333,0.2625517 -0.00874,0.39089 -0.2041189,0.1504919 -0.413382,-0.033712 -0.413382,-0.033712 z' },
  { id: 2, d: 'm 7.0101933,7.2618251 c 0,0 0.372754,-0.4714858 0.6494153,-0.1948245 0.1829331,0.1829331 -0.292237,0.6169447 -0.292237,0.6169447 0,0 -0.2625518,0.1653331 -0.3908902,-0.00874 -0.1504918,-0.2041189 0.033712,-0.413382 0.033712,-0.413382 z' },
];

// Petal-to-symbol mapping (matches existing symbolIconsByPetal)
const PETAL_SYMBOL_KEYS = {
  1: 'mooshika',
  2: 'modak',
  3: 'belly',
  4: 'lotus',
  5: 'trunk',
  6: 'ear',
  7: 'eye',
  8: 'tusk',
};

// Center of each outer petal (in SVG viewBox units, radius=5 from mandala center)
const SYMBOL_POSITIONS = {
  1: { cx: 7.40, cy: 2.00 },   // top — Mooshika
  2: { cx: 11.22, cy: 3.58 },  // upper-right — Modak
  3: { cx: 12.80, cy: 7.40 },  // right — Belly
  4: { cx: 11.22, cy: 11.22 }, // lower-right — Lotus
  5: { cx: 7.40, cy: 12.80 },  // bottom — Trunk
  6: { cx: 3.58, cy: 11.22 },  // lower-left — Ear
  7: { cx: 2.00, cy: 7.40 },   // left — Eye
  8: { cx: 3.58, cy: 3.58 },   // upper-left — Tusk
};

const SYMBOL_SIZE = 1.6; // SVG units

const isActive = (state) => ['awakened', 'energized', 'bloomed', 'activated', 'glowing'].includes(state);

export default function InnerMandala({
  childName = 'Friend',
  petalStates = {},
  middlePetalStates = {},
  innerPetalStates = {},
  highlightPetals = [],
  onClose,
  showAsOverlay = true,
  message = 'My Inner Light is Growing',
  autoCloseMs = 5400,
  allowTapToSkip = true,
  onPetalClick,
  symbolIcons = {},
  avatar = null,
}) {
  const [mounted, setMounted] = useState(false);
  const closedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (!onClose || closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!showAsOverlay || !onClose) return;
    const timer = setTimeout(() => handleDismiss(), autoCloseMs);
    return () => clearTimeout(timer);
  }, [showAsOverlay, onClose, autoCloseMs, handleDismiss]);

  const interactive = typeof onPetalClick === 'function';

  return (
    <div
      className={showAsOverlay ? `inner-mandala-overlay ${mounted ? 'is-mounted' : ''}` : 'inner-mandala-inline'}
      onClick={showAsOverlay && allowTapToSkip ? handleDismiss : undefined}
    >
      <div
        className="inner-mandala ganesha-mandala"
        onClick={showAsOverlay && allowTapToSkip ? handleDismiss : (e) => e.stopPropagation()}
      >
        <svg
          viewBox="0 0 14.816666 14.816667"
          width="920"
          height="920"
          role="img"
          aria-label={`${childName}'s Inner Mandala`}
        >
          {/* OUTER PETALS — scaled out from center to form the 8-pointed star */}
          <g
            id="outer-petals"
            transform="matrix(1.7729952,0,0,1.7729952,-4.660599,-6.79381)"
          >
            {OUTER_PETALS.map((petal) => (
              <path
                key={`outer-${petal.id}`}
                id={`outer-petal-${petal.id}`}
                d={petal.d}
                className={`mandala-petal outer-petal outer-petal-${petal.id} ${isActive(petalStates[petal.id]) ? 'awakened' : 'locked'}`}
                onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('outer', petal.id); } : undefined}
              />
            ))}
          </g>

          {/* SYMBOL ICONS — show only on awakened outer petals */}
          {OUTER_PETALS.map((petal) => {
            const awakened = isActive(petalStates[petal.id]);
            const iconUrl = symbolIcons[petal.id] || symbolIcons[PETAL_SYMBOL_KEYS[petal.id]];
            if (!awakened || !iconUrl) return null;
            const pos = SYMBOL_POSITIONS[petal.id];
            return (
              <image
                key={`symbol-${petal.id}`}
                href={iconUrl}
                x={pos.cx - SYMBOL_SIZE / 2}
                y={pos.cy - SYMBOL_SIZE / 2}
                width={SYMBOL_SIZE}
                height={SYMBOL_SIZE}
                className={`petal-symbol petal-symbol-${petal.id}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: 'none' }}
              />
            );
          })}

          {/* OUTER CIRCLES — the lavender disc behind middle petals */}
          <ellipse className="outer-ring" cx="7.3760633" cy="7.169137" rx="4.6459513" ry="4.5528336" />
          <ellipse className="outer-ring-inner" cx="7.3760633" cy="7.169137" rx="4.2873373" ry="4.2014065" />

          {/* MIDDLE PETALS — slightly smaller scale, outline only */}
          <g
            id="middle-petals"
            transform="matrix(1.7864668,0,0,1.7864668,-4.7510983,-6.9187835)"
          >
            {MIDDLE_PETALS.map((petal) => (
              <path
                key={`middle-${petal.id}`}
                id={`middle-petal-${petal.id}`}
                d={petal.d}
                className={`mandala-petal middle-petal middle-petal-${petal.id} ${isActive(middlePetalStates[petal.id]) ? 'activated' : ''}`}
                onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('middle', petal.id); } : undefined}
              />
            ))}
          </g>

          {/* INNER RING CIRCLES — small lavender disc behind daisy */}
          <ellipse className="inner-ring-thin" cx="7.3017011" cy="7.2286258" rx="2.0423188" ry="2.0108352" />
          <circle className="inner-ring" cx="7.3326731" cy="7.2183022" r="1.8019887" />

          {/* INNER (DAISY) PETALS — scaled and offset to form the small flower */}
          <g
            id="inner-petals"
            transform="matrix(1.4611578,0,0,1.4611578,-2.5655313,-4.3352321)"
          >
            {INNER_PETALS.map((petal) => (
              <path
                key={`inner-${petal.id}`}
                id={`inner-petal-${petal.id}`}
                d={petal.d}
                className={`mandala-petal inner-petal inner-petal-${petal.id}`}
                onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('inner', petal.id); } : undefined}
              />
            ))}
          </g>

          {/* CENTER YELLOW SUN */}
          <circle className="avatar-circle" cx="7.3145399" cy="7.22227" r="0.81771392" />
        </svg>

        {avatar && <div className="mandala-avatar-slot">{avatar}</div>}

        <div className="mandala-subtitle">{message}</div>
      </div>
    </div>
  );
}
