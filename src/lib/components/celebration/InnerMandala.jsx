import { useCallback, useEffect, useRef, useState } from 'react';
import './InnerMandala.css';
import { playCardRevealChime } from '../../services/AudioService';

// Geometry from mandala-latest-plain.svg (Inkscape export, viewBox 0 0 14.816666 14.816667)
// Two rings only: OUTER = 8 shloka words, MIDDLE = 8 symbols. Inner daisy removed.

const OUTER_PETALS = [
  { id: 1, d: 'm 6.7104073,7.6920145 c 0,0 -0.9015001,-0.7537642 -0.9188485,-1.7976493 -0.017349,-1.0438851 1.069497,-1.6812708 1.069497,-1.6812708 0,0 0.9361259,0.824332 0.920583,1.7527197 -0.015542,0.9283874 -1.0712315,1.7262004 -1.0712315,1.7262004 z' },
  { id: 2, d: 'm 6.8472105,7.7043209 c 0,0 -0.099564,-1.1708758 0.6294426,-1.9182355 0.7290067,-0.7473598 1.9468803,-0.4244422 1.9468803,-0.4244422 0,0 0.073838,1.2451513 -0.5963184,1.88783 C 8.1570594,7.8921521 6.8472105,7.7043209 6.8472105,7.7043209 Z' },
  { id: 3, d: 'm 6.9538175,7.8232645 c 0,0 0.699725,-0.944059 1.7408069,-1.0224563 1.0410822,-0.078398 1.7409666,0.969292 1.7409666,0.969292 0,0 -0.7681453,0.9827541 -1.6958516,1.0215588 C 7.8120331,8.8304641 6.9538175,7.8232645 6.9538175,7.8232645 Z' },
  { id: 4, d: 'm 6.9398225,7.9895445 c 0,0 1.1623311,-0.1727702 1.9539222,0.5079506 0.7915913,0.6807207 0.5456574,1.9164429 0.5456574,1.9164429 0,0 -1.2380737,0.151752 -1.9215005,-0.4767973 C 6.8344751,9.3085918 6.9398225,7.9895445 6.9398225,7.9895445 Z' },
  { id: 5, d: 'm 6.8232932,8.0730962 c 0,0 0.9440594,0.6997252 1.0224563,1.7408068 0.078398,1.041082 -0.9692917,1.740967 -0.9692917,1.740967 0,0 -0.9827544,-0.768144 -1.0215591,-1.6958518 -0.038804,-0.9277063 0.9683945,-1.785922 0.9683945,-1.785922 z' },
  { id: 6, d: 'm 6.6684498,8.0590038 c 0,0 0.1727702,1.1623311 -0.5079503,1.9539222 -0.680721,0.791591 -1.916443,0.545657 -1.916443,0.545657 0,0 -0.1517512,-1.2380733 0.4767974,-1.9215001 C 5.3494021,7.9536565 6.6684498,8.0590038 6.6684498,8.0590038 Z' },
  { id: 7, d: 'm 6.5633877,7.9424746 c 0,0 -0.6997252,0.9440591 -1.7408066,1.0224565 -1.0410818,0.078397 -1.7409678,-0.969292 -1.7409678,-0.969292 0,0 0.7681461,-0.9827544 1.6958526,-1.021559 0.9277063,-0.038805 1.7859218,0.9683945 1.7859218,0.9683945 z' },
  { id: 8, d: 'm 6.57748,7.8091419 c 0,0 -1.1623312,0.1727701 -1.9539221,-0.5079505 C 3.8319666,6.6204706 4.0779006,5.3847485 4.0779006,5.3847485 c 0,0 1.2380737,-0.1517511 1.9215003,0.4767974 0.6834267,0.6285479 0.5780791,1.947596 0.5780791,1.947596 z' },
];

const MIDDLE_PETALS = [
  { id: 1, d: 'm 6.6820546,7.7112194 c 0,0 0.5871717,-0.4391297 0.6450014,-1.0802498 0.05783,-0.6411202 -0.5801739,-1.0619717 -0.5801739,-1.0619717 0,0 -0.6116052,0.481574 -0.6440344,1.0525889 -0.03243,0.5710146 0.5792069,1.0896326 0.5792069,1.0896326 z' },
  { id: 2, d: 'm 6.8381224,7.7180295 c 0,0 0.7257047,0.1046815 1.2199369,-0.3077671 0.4942324,-0.4124484 0.3406825,-1.1611723 0.3406825,-1.1611723 0,0 -0.7729945,-0.091946 -1.1996939,0.2888917 C 6.7723482,6.9188186 6.8381224,7.7180295 6.8381224,7.7180295 Z' },
  { id: 3, d: 'm 6.9436636,7.8332016 c 0,0 0.4391297,0.5871717 1.0802498,0.6450014 0.6411202,0.05783 1.0619717,-0.5801739 1.0619717,-0.5801739 0,0 -0.481574,-0.6116053 -1.0525889,-0.6440344 -0.5710146,-0.03243 -1.0896326,0.5792069 -1.0896326,0.5792069 z' },
  { id: 4, d: 'm 6.9368535,7.9892694 c 0,0 -0.1046815,0.7257047 0.3077671,1.2199369 0.4124485,0.4942324 1.1611723,0.3406825 1.1611723,0.3406825 0,0 0.091946,-0.7729945 -0.2888917,-1.1996939 C 7.7360644,7.9234952 6.9368535,7.9892694 6.9368535,7.9892694 Z' },
  { id: 5, d: 'm 6.8216814,8.0948106 c 0,0 -0.5871717,0.4391297 -0.6450014,1.0802498 -0.05783,0.6411203 0.5801739,1.0619716 0.5801739,1.0619716 0,0 0.6116053,-0.4815739 0.6440344,-1.0525888 C 7.4333183,8.6134286 6.8216814,8.0948106 6.8216814,8.0948106 Z' },
  { id: 6, d: 'm 6.6656136,8.0880005 c 0,0 -0.7257047,-0.1046815 -1.2199368,0.3077671 -0.4942325,0.4124485 -0.3406825,1.1611722 -0.3406825,1.1611722 0,0 0.7729945,0.091946 1.1996938,-0.2888916 C 6.7313879,8.8872114 6.6656136,8.0880005 6.6656136,8.0880005 Z' },
  { id: 7, d: 'm 6.5600725,7.9728284 c 0,0 -0.4391298,-0.5871717 -1.0802498,-0.6450013 C 4.8387024,7.269997 4.417851,7.9080009 4.417851,7.9080009 c 0,0 0.481574,0.6116053 1.0525889,0.6440344 0.5710146,0.03243 1.0896326,-0.5792069 1.0896326,-0.5792069 z' },
  { id: 8, d: 'm 6.5668825,7.8167606 c 0,0 0.1046815,-0.7257047 -0.3077671,-1.2199369 C 5.8466668,6.1025915 5.0979431,6.2561412 5.0979431,6.2561412 c 0,0 -0.091946,0.7729945 0.2888916,1.1996939 0.3808372,0.4266994 1.1800478,0.3609255 1.1800478,0.3609255 z' },
];

const OUTER_PETAL_SPARKLES = {
  1: [{ x: '31%', y: '23%' }, { x: '36%', y: '18%' }, { x: '28%', y: '29%' }],
  2: [{ x: '48%', y: '15%' }, { x: '55%', y: '14%' }, { x: '42%', y: '18%' }],
  3: [{ x: '67%', y: '22%' }, { x: '73%', y: '27%' }, { x: '61%', y: '18%' }],
  4: [{ x: '78%', y: '40%' }, { x: '82%', y: '46%' }, { x: '75%', y: '33%' }],
  5: [{ x: '67%', y: '66%' }, { x: '73%', y: '72%' }, { x: '61%', y: '61%' }],
  6: [{ x: '47%', y: '77%' }, { x: '54%', y: '81%' }, { x: '40%', y: '74%' }],
  7: [{ x: '28%', y: '66%' }, { x: '22%', y: '72%' }, { x: '33%', y: '61%' }],
  8: [{ x: '18%', y: '40%' }, { x: '14%', y: '47%' }, { x: '21%', y: '34%' }],
};

const OUTER_PETAL_TOKEN_POSITIONS = {
  1: { x: '41%', y: '35%' },
  2: { x: '50%', y: '31%' },
  3: { x: '59%', y: '35%' },
  4: { x: '63%', y: '43%' },
  5: { x: '59%', y: '52%' },
  6: { x: '50%', y: '56%' },
  7: { x: '41%', y: '52%' },
  8: { x: '37%', y: '43%' },
};

const isActive = (state) =>
  ['awakened', 'energized', 'bloomed', 'activated', 'glowing'].includes(state);

export default function InnerMandala({
  childName = 'Friend',
  // Legacy prop names (still accepted so existing call sites don't break)
  petalStates = {},
  middlePetalStates = {},
  // New semantic names
  shlokaPetalStates = petalStates,       // OUTER ring: 8 shloka words
  symbolPetalStates = middlePetalStates, // MIDDLE ring: 8 symbols
  highlightPetals = [],
  onClose,
  showAsOverlay = true,
  message = 'My Inner Light is Growing',
  autoCloseMs = 5400,
  allowTapToSkip = true,
  onPetalClick,
  avatar = null,
  justEarnedPetal = null,
  justEarnedPetals = null,
  earnedSymbols = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [earnedShownIds, setEarnedShownIds] = useState([]);
  const closedRef = useRef(false);
  const interactive = typeof onPetalClick === 'function';
  const earnedPetals = Array.isArray(justEarnedPetals)
    ? justEarnedPetals
    : justEarnedPetal
      ? [justEarnedPetal]
      : [];

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
    if (!earnedPetals.length) return undefined;
    setEarnedShownIds([]);
    const timers = [];

    earnedPetals.forEach((earnedPetal, index) => {
      const t = setTimeout(() => {
        setEarnedShownIds((prev) => {
          const key = `${earnedPetal.ring}-${earnedPetal.id}`;
          return prev.includes(key) ? prev : [...prev, key];
        });
        try { playCardRevealChime(index === 0 ? 0.42 : 0.34); } catch {}
      }, 1500 + (index * 950));
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [earnedPetals.length, JSON.stringify(earnedPetals)]);

  useEffect(() => {
    if (!showAsOverlay || !onClose || interactive) return undefined;
    const timer = setTimeout(() => handleDismiss(), autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, handleDismiss, interactive, onClose, showAsOverlay]);

  const currentZoneSet = new Set(highlightPetals);
  const earnedPetalKeySet = new Set(
    earnedPetals.map((earnedPetal) => `${earnedPetal?.ring}-${earnedPetal?.id}`)
  );

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
          {/* OUTER ring: shloka words */}
          <g id="outer-petals" transform="matrix(1.7729952,0,0,1.7729952,-4.660599,-6.79381)">
            {OUTER_PETALS.map((petal) => {
              const active = isActive(shlokaPetalStates[petal.id]);
              const justEarnedKey = `outer-${petal.id}`;
              const isJustEarnedTarget = earnedPetalKeySet.has(justEarnedKey);
              const justEarned =
                earnedShownIds.includes(justEarnedKey) &&
                isJustEarnedTarget;
              const isCurrentZone = currentZoneSet.has(petal.id) && !isJustEarnedTarget;
              const activeFinal = active || justEarned;
              const stateClass = isCurrentZone ? 'current-zone' : activeFinal ? 'completed' : 'locked';
              return (
                <path
                  key={`outer-${petal.id}`}
                  id={`outer-petal-${petal.id}`}
                  d={petal.d}
                  className={`mandala-petal outer-petal outer-petal-${petal.id} ${stateClass} ${justEarned ? 'just-earned' : ''}`}
                  onClick={interactive ? handlePetalTap('outer', petal.id) : undefined}
                />
              );
            })}
          </g>

          {/* Outer double ring */}
          <g transform="matrix(0.85006751,0,0,0.85006751,1.1059115,1.0748866)">
            <ellipse className="outer-ring" cx="7.3760633" cy="7.169137" rx="4.6459513" ry="4.5528336" />
            <ellipse className="outer-ring-inner" cx="7.3760633" cy="7.169137" rx="4.4658055" ry="4.3762975" />
          </g>

          {/* MIDDLE ring: 8 symbols */}
          <g id="middle-petals" transform="matrix(1.5998576,0,0,1.5998576,-3.4813658,-5.4485889)">
            {MIDDLE_PETALS.map((petal) => {
              const justEarnedKey = `middle-${petal.id}`;
              const justEarnedM =
                earnedShownIds.includes(justEarnedKey) &&
                earnedPetals.some((earnedPetal) => earnedPetal?.ring === 'middle' && earnedPetal.id === petal.id);
              return (
                <path
                  key={`middle-${petal.id}`}
                  id={`middle-petal-${petal.id}`}
                  d={petal.d}
                  className={`mandala-petal middle-petal middle-petal-${petal.id} ${(isActive(symbolPetalStates[petal.id]) || justEarnedM) ? 'activated' : 'locked'} ${justEarnedM ? 'just-earned' : ''}`}
                  onClick={interactive ? handlePetalTap('middle', petal.id) : undefined}
                />
              );
            })}
          </g>

          {/* Center rings + avatar circle */}
          <g transform="matrix(0.83677622,0,0,0.83677622,1.1918113,1.1798836)">
            <ellipse className="inner-ring-thin" cx="7.3017011" cy="7.2286258" rx="1.4095987" ry="1.3878689" />
            <circle className="inner-ring" cx="7.3230777" cy="7.2215004" r="1.243724" />
            <circle className="avatar-circle" cx="7.3145399" cy="7.22227" r="0.81771392" />
          </g>
        </svg>

        <div className="mandala-token-layer" aria-hidden="true">
          {earnedSymbols.map((symbol, index) => {
            const petalId = symbol?.petalId;
            const position = OUTER_PETAL_TOKEN_POSITIONS[petalId];
            if (!symbol?.image || !position) return null;
            return (
              <img
                key={`${symbol.id || `symbol-${index}`}-${petalId}`}
                src={symbol.image}
                alt=""
                className="mandala-earned-symbol"
                style={{
                  '--target-x': position.x,
                  '--target-y': position.y,
                  animationDelay: `${0.95 + (index * 0.95)}s`,
                }}
              />
            );
          })}
        </div>

        <div className="mandala-sparkle-layer" aria-hidden="true">
          {earnedShownIds
            .filter((key) => key.startsWith('outer-'))
            .flatMap((key, revealIndex) => {
              const petalId = Number(key.replace('outer-', ''));
              const sparkles = OUTER_PETAL_SPARKLES[petalId] || [];
              return sparkles.map((sparkle, sparkleIndex) => (
                <span
                  key={`${key}-sparkle-${sparkleIndex}`}
                  className="mandala-sparkle"
                  style={{
                    left: sparkle.x,
                    top: sparkle.y,
                    animationDelay: `${(revealIndex * 0.35) + (sparkleIndex * 0.18)}s`,
                  }}
                />
              ));
            })}
        </div>

        {avatar && <div className="mandala-avatar-slot">{avatar}</div>}

        {message ? <div className="mandala-subtitle">{message}</div> : null}
        {interactive && (
          <div className="mandala-hint">Tap a petal to see what you've collected!</div>
        )}
      </div>
    </div>
  );
}
