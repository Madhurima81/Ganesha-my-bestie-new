import { useCallback, useEffect, useRef, useState } from 'react';
import './InnerMandala.css';
import { playCardRevealChime } from '../../services/AudioService';

const OUTER_PETALS = [
  { id: 2, d: 'm 7.0192951,7.7258315 c 0,0 -0.099564,-1.1708758 0.6294426,-1.9182355 C 8.3777444,5.0602362 9.595618,5.3831538 9.595618,5.3831538 c 0,0 0.073838,1.2451513 -0.5963184,1.88783 C 8.329144,7.9136627 7.0192951,7.7258315 7.0192951,7.7258315 Z' },
  { id: 3, d: 'm 7.0936362,7.9845938 c 0,0 0.699725,-0.944059 1.7408069,-1.0224563 1.0410822,-0.078398 1.7409669,0.969292 1.7409669,0.969292 0,0 -0.7681456,0.9827541 -1.6958519,1.0215588 C 7.9518518,8.9917934 7.0936362,7.9845938 7.0936362,7.9845938 Z' },
  { id: 4, d: 'm 6.9290672,8.1508738 c 0,0 1.1623311,-0.1727702 1.9539222,0.5079506 0.7915913,0.6807207 0.5456574,1.9164426 0.5456574,1.9164426 0,0 -1.2380737,0.151752 -1.9215005,-0.476797 C 6.8237198,9.4699211 6.9290672,8.1508738 6.9290672,8.1508738 Z' },
  { id: 5, d: 'm 6.6727192,8.255936 c 0,0 0.9440594,0.6997252 1.0224563,1.7408068 0.078398,1.0410822 -0.9692917,1.7409672 -0.9692917,1.7409672 0,0 -0.9827544,-0.768144 -1.0215591,-1.695852 C 5.6655206,9.1141517 6.6727192,8.255936 6.6727192,8.255936 Z' },
  { id: 6, d: 'm 6.48561,8.0805144 c 0,0 0.1727702,1.1623311 -0.5079503,1.9539226 -0.680721,0.791591 -1.916443,0.545657 -1.916443,0.545657 0,0 -0.1517512,-1.2380737 0.4767974,-1.9215005 C 5.1665623,7.9751671 6.48561,8.0805144 6.48561,8.0805144 Z' },
  { id: 7, d: 'm 6.4773454,7.8241665 c 0,0 -0.6997252,0.9440591 -1.7408066,1.0224565 C 3.695457,8.92502 2.995571,7.877331 2.995571,7.877331 c 0,0 0.7681461,-0.9827544 1.6958526,-1.021559 0.9277063,-0.038805 1.7859218,0.9683945 1.7859218,0.9683945 z' },
  { id: 8, d: 'm 6.5882353,7.6263021 c 0,0 -1.1623312,0.1727701 -1.9539221,-0.5079505 C 3.8427219,6.4376308 4.0886559,5.2019087 4.0886559,5.2019087 c 0,0 1.2380737,-0.1517511 1.9215003,0.4767974 0.6834267,0.6285479 0.5780791,1.947596 0.5780791,1.947596 z' },
  { id: 1, d: 'm 6.8072049,7.6274828 c 0,0 -0.9015001,-0.7537642 -0.9188485,-1.7976493 -0.017349,-1.0438851 1.069497,-1.6812708 1.069497,-1.6812708 0,0 0.9361259,0.824332 0.920583,1.7527197 -0.015542,0.9283874 -1.0712315,1.7262004 -1.0712315,1.7262004 z' },
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
  { id: 1, d: 'm 7.308,5.95 c 0,0 0.275,0.47 0.255,0.9 -0.02,0.43 -0.263,0.822 -0.263,0.822 0,0 -0.261,-0.43 -0.255,-0.852 C 7.051,6.399 7.308,5.95 7.308,5.95 Z' },
  { id: 2, d: 'm 8.186,6.306 c 0,0 0.507,0.192 0.774,0.53 0.266,0.338 0.308,0.797 0.308,0.797 0,0 -0.466,0.048 -0.792,-0.245 C 8.151,7.095 8.186,6.306 8.186,6.306 Z' },
  { id: 3, d: 'm 8.547,7.219 c 0,0 0.494,-0.215 0.918,-0.155 0.424,0.06 0.757,0.377 0.757,0.377 0,0 -0.33,0.332 -0.756,0.377 C 9.04,7.862 8.547,7.219 8.547,7.219 Z' },
  { id: 4, d: 'm 8.196,8.131 c 0,0 0.477,-0.236 0.902,-0.193 0.425,0.043 0.77,0.347 0.77,0.347 0,0 -0.316,0.346 -0.74,0.408 C 8.703,8.755 8.196,8.131 8.196,8.131 Z' },
  { id: 5, d: 'm 7.311,8.491 c 0,0 0.257,0.449 0.262,0.872 0.005,0.423 -0.248,0.853 -0.248,0.853 0,0 -0.243,-0.393 -0.263,-0.823 C 7.042,8.962 7.311,8.491 7.311,8.491 Z' },
  { id: 6, d: 'm 6.429,8.131 c 0,0 -0.507,0.624 -0.932,0.562 -0.424,-0.062 -0.74,-0.408 -0.74,-0.408 0,0 0.344,-0.304 0.769,-0.347 C 5.952,7.895 6.429,8.131 6.429,8.131 Z' },
  { id: 7, d: 'm 6.081,7.219 c 0,0 -0.493,0.643 -0.918,0.599 -0.425,-0.045 -0.756,-0.377 -0.756,-0.377 0,0 0.333,-0.317 0.757,-0.377 C 5.588,7.004 6.081,7.219 6.081,7.219 Z' },
  { id: 8, d: 'm 6.431,6.306 c 0,0 0.035,0.789 -0.29,1.082 -0.326,0.293 -0.793,0.245 -0.793,0.245 0,0 0.042,-0.459 0.309,-0.797 C 5.924,6.498 6.431,6.306 6.431,6.306 Z' },
];

const MIDDLE_SYMBOL_POSITIONS = {
  1: { cx: 7.4, cy: 3.8 },
  2: { cx: 9.95, cy: 4.85 },
  3: { cx: 11.0, cy: 7.4 },
  4: { cx: 9.95, cy: 9.95 },
  5: { cx: 7.4, cy: 11.0 },
  6: { cx: 4.85, cy: 9.95 },
  7: { cx: 3.8, cy: 7.4 },
  8: { cx: 4.85, cy: 4.85 },
};

const MIDDLE_SYMBOL_SIZE = 1.35;

const isActive = (state) =>
  ['awakened', 'energized', 'bloomed', 'activated', 'glowing'].includes(state);

export default function InnerMandala({
  childName = 'Friend',
  petalStates = {},
  middlePetalStates = {},
  highlightPetals = [],
  onClose,
  showAsOverlay = true,
  message = 'My Inner Light is Growing',
  autoCloseMs = 5400,
  allowTapToSkip = true,
  onPetalClick,
  middleSymbolIcons = {},
  avatar = null,
}) {
  const [mounted, setMounted] = useState(false);
  const closedRef = useRef(false);
  const interactive = typeof onPetalClick === 'function';

  const handleDismiss = useCallback(() => {
    if (!onClose || closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (interactive) {
        e.stopPropagation();
        return;
      }

      if (showAsOverlay && allowTapToSkip) {
        handleDismiss();
      }
    },
    [allowTapToSkip, handleDismiss, interactive, showAsOverlay]
  );

  const handlePetalTap = useCallback(
    (ring, petalId) => (e) => {
      e.stopPropagation();
      onPetalClick?.(ring, petalId);
    },
    [onPetalClick]
  );

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    try {
      playCardRevealChime(0.42);
    } catch {}
  }, []);

  useEffect(() => {
    if (!showAsOverlay || !onClose || interactive) return undefined;
    const timer = setTimeout(() => handleDismiss(), autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, handleDismiss, interactive, onClose, showAsOverlay]);

  const currentZoneSet = new Set(highlightPetals);

  return (
    <div
      className={
        showAsOverlay
          ? `inner-mandala-overlay ${mounted ? 'is-mounted' : ''} ${interactive ? 'is-interactive' : ''}`
          : 'inner-mandala-inline'
      }
      onClick={handleOverlayClick}
    >
      <div className="inner-mandala ganesha-mandala" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 14.816666 14.816667" role="img" aria-label={`${childName}'s Inner Mandala`}>
          <g id="outer-petals" transform="matrix(1.7729952,0,0,1.7729952,-4.660599,-6.79381)">
            {OUTER_PETALS.map((petal) => {
              const active = isActive(petalStates[petal.id]);
              const isCurrentZone = currentZoneSet.has(petal.id);
              const stateClass = isCurrentZone ? 'current-zone' : active ? 'completed' : 'locked';

              return (
                <path
                  key={`outer-${petal.id}`}
                  id={`outer-petal-${petal.id}`}
                  d={petal.d}
                  className={`mandala-petal outer-petal outer-petal-${petal.id} ${stateClass}`}
                  onClick={interactive ? handlePetalTap('outer', petal.id) : undefined}
                />
              );
            })}
          </g>

          <g transform="matrix(0.85006751,0,0,0.85006751,1.1059115,1.0748866)">
            <ellipse className="outer-ring" cx="7.3760633" cy="7.169137" rx="4.6459513" ry="4.5528336" />
            <ellipse className="outer-ring-inner" cx="7.3760633" cy="7.169137" rx="4.4658055" ry="4.3762975" />
          </g>

          <g id="middle-petals" transform="matrix(1.5998576,0,0,1.5998576,-3.4813658,-5.4485889)">
            {MIDDLE_PETALS.map((petal) => (
              <path
                key={`middle-${petal.id}`}
                id={`middle-petal-${petal.id}`}
                d={petal.d}
                className={`mandala-petal middle-petal middle-petal-${petal.id} ${isActive(middlePetalStates[petal.id]) ? 'activated' : ''}`}
                onClick={interactive ? handlePetalTap('middle', petal.id) : undefined}
              />
            ))}
          </g>

          {interactive &&
            MIDDLE_PETALS.map((petal) => {
              const pos = MIDDLE_SYMBOL_POSITIONS[petal.id];
              return (
                <circle
                  key={`middle-hit-${petal.id}`}
                  className="petal-hit-target middle-hit-target"
                  cx={pos.cx}
                  cy={pos.cy}
                  r="0.98"
                  onClick={handlePetalTap('middle', petal.id)}
                />
              );
            })}

          {MIDDLE_PETALS.map((petal) => {
            const iconUrl = middleSymbolIcons[petal.id];
            if (!iconUrl) return null;
            const pos = MIDDLE_SYMBOL_POSITIONS[petal.id];

            return (
              <image
                key={`middle-symbol-${petal.id}`}
                href={iconUrl}
                x={pos.cx - MIDDLE_SYMBOL_SIZE / 2}
                y={pos.cy - MIDDLE_SYMBOL_SIZE / 2}
                width={MIDDLE_SYMBOL_SIZE}
                height={MIDDLE_SYMBOL_SIZE}
                className={`middle-petal-symbol middle-petal-symbol-${petal.id}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: 'none' }}
              />
            );
          })}

          <g transform="matrix(0.83677622,0,0,0.83677622,1.1918113,1.1798836)">
            <ellipse className="inner-ring-thin" cx="7.3017011" cy="7.2286258" rx="1.4095987" ry="1.3878689" />
            <circle className="inner-ring" cx="7.3230777" cy="7.2215004" r="1.243724" />
            <circle className="avatar-circle" cx="7.3145399" cy="7.22227" r="0.81771392" />
          </g>

          <g id="inner-petals" transform="matrix(1.289,0,0,1.289,-2.123,-2.093)">
            {INNER_PETALS.map((petal) => (
              <path
                key={`inner-${petal.id}`}
                d={petal.d}
                className={`mandala-petal inner-petal inner-petal-${petal.id}`}
              />
            ))}
          </g>
        </svg>

        {avatar ? (
          <div className="mandala-avatar-slot">{avatar}</div>
        ) : (
          <div className="mandala-center-emblem" aria-hidden="true">
            🪷
          </div>
        )}

        <div className="mandala-subtitle">{message}</div>
      </div>
    </div>
  );
}
