import { useState, useEffect, useRef, useCallback } from 'react';
import './InnerMandala.css';

const OUTER_PETALS = [
  { id: 8, d: 'm 6.8485965,6.9213782 c 0,0 -0.058181,-2.388571 -0.7959878,-3.1551617 C 5.3148021,2.9996251 3.049432,2.8850987 3.049432,2.8850987 c 0,0 0.018021,2.3281424 0.7471695,3.1028063 0.7291443,0.7746678 3.051995,0.9334732 3.051995,0.9334732 z' },
  { id: 7, d: 'm 6.7578672,7.4255807 c 0,0 -1.7301152,-1.6478343 -2.7938846,-1.6681878 -1.06377,-0.020354 -2.746611,1.5005222 -2.746611,1.5005222 0,0 1.658988,1.6335025 2.722344,1.6656867 1.0633557,0.03219 2.8181516,-1.4980211 2.8181516,-1.4980211 z' },
  { id: 6, d: 'm 7.0502369,7.8462609 c 0,0 -2.388571,0.058181 -3.1551616,0.7959878 -0.7665915,0.7378065 -0.8811179,3.0031773 -0.8811179,3.0031773 0,0 2.3281424,-0.01802 3.1028063,-0.74717 0.7746676,-0.729144 0.9334732,-3.0519951 0.9334732,-3.0519951 z' },
  { id: 5, d: 'm 7.5544393,7.9369902 c 0,0 -1.6478343,1.7301152 -1.6681878,2.7938848 -0.020354,1.06377 1.5005222,2.746611 1.5005222,2.746611 0,0 1.6335025,-1.658988 1.6656867,-2.722344 C 9.0846501,9.6917861 7.5544393,7.9369902 7.5544393,7.9369902 Z' },
  { id: 4, d: 'm 11.772727,11.682458 c 0,0 -0.05818,-2.3885712 -0.795988,-3.1551622 C 10.238932,7.7607047 7.973562,7.6461781 7.973562,7.6461781 c 0,0 0.018021,2.3281422 0.7471694,3.1028059 0.7291446,0.774668 3.0519956,0.933474 3.0519956,0.933474 z' },
  { id: 3, d: 'm 13.606345,7.3102865 c 0,0 -1.730115,-1.6478343 -2.793885,-1.6681878 -1.06377,-0.020354 -2.7466112,1.5005222 -2.7466112,1.5005222 0,0 1.6589882,1.6335025 2.7223442,1.6656867 1.063356,0.03219 2.818152,-1.4980211 2.818152,-1.4980211 z' },
  { id: 2, d: 'm 11.811317,2.9221309 c 0,0 -2.388572,0.058181 -3.1551625,0.795988 -0.7665911,0.7378061 -0.8811177,3.0031765 -0.8811177,3.0031765 0,0 2.3281422,-0.018021 3.1028062,-0.7471694 0.774668,-0.7291446 0.933474,-3.0519951 0.933474,-3.0519951 z' },
  { id: 1, d: 'm 7.4391451,1.088513 c 0,0 -1.6478343,1.7301152 -1.6681878,2.7938848 -0.020354,1.0637695 1.5005222,2.7466108 1.5005222,2.7466108 0,0 1.6335025,-1.6589878 1.6656867,-2.7223438 C 8.9693562,2.8433089 7.4391451,1.088513 7.4391451,1.088513 Z' },
];

const MIDDLE_PETALS = [
  { id: 8, d: 'm 4.5123675,4.4685915 c 0,0 1.6628828,0.040505 2.1965703,0.5541533 0.5336878,0.5136483 0.6134194,2.090761 0.6134194,2.090761 0,0 -1.6208136,-0.012546 -2.1601214,-0.5201669 C 4.6229251,6.0857208 4.5123675,4.4685915 4.5123675,4.4685915 Z' },
  { id: 7, d: 'm 3.3997478,7.2960113 c 0,0 1.2044768,-1.1471946 1.9450553,-1.1613643 0.7405785,-0.01417 1.9121443,1.0446383 1.9121443,1.0446383 0,0 -1.1549595,1.137217 -1.89525,1.159623 -0.7402905,0.02241 -1.9619496,-1.042897 -1.9619496,-1.042897 z' },
  { id: 6, d: 'm 4.6122946,10.08204 c 0,0 0.040505,-1.6628825 0.5541532,-2.1965701 0.5136484,-0.5336878 2.090761,-0.6134194 2.090761,-0.6134194 0,0 -0.012546,1.6208136 -0.5201668,2.1601214 C 6.2294238,9.9714826 4.6122946,10.08204 4.6122946,10.08204 Z' },
  { id: 5, d: 'm 7.4397146,11.19466 c 0,0 -1.1471946,-1.204477 -1.1613643,-1.9450555 -0.01417,-0.7405785 1.0446383,-1.9121443 1.0446383,-1.9121443 0,0 1.137217,1.1549595 1.159623,1.89525 0.02241,0.7402905 -1.042897,1.9619498 -1.042897,1.9619498 z' },
  { id: 4, d: 'm 10.142121,10.065735 c 0,0 -0.0405,-1.6628829 -0.554153,-2.1965704 C 9.0743193,7.3354768 7.4972067,7.2557452 7.4972067,7.2557452 c 0,0 0.012546,1.6208135 0.5201668,2.1601214 0.5076182,0.5393107 2.1247475,0.6498684 2.1247475,0.6498684 z' },
  { id: 3, d: 'm 11.338363,7.2729525 c 0,0 -1.204477,-1.1471946 -1.945056,-1.1613643 -0.7405781,-0.01417 -1.9121439,1.0446383 -1.9121439,1.0446383 0,0 1.1549595,1.137217 1.8952499,1.159623 0.740291,0.02241 1.96195,-1.042897 1.96195,-1.042897 z' },
  { id: 2, d: 'm 10.209438,4.4522865 c 0,0 -1.6628828,0.040505 -2.1965704,0.5541535 -0.5336878,0.5136484 -0.6134194,2.090761 -0.6134194,2.090761 0,0 1.6208136,-0.012546 2.1601218,-0.5201668 0.53931,-0.5076182 0.649868,-2.1247477 0.649868,-2.1247477 z' },
  { id: 1, d: 'm 7.4166558,3.2560445 c 0,0 -1.1471946,1.2044772 -1.1613643,1.9450557 -0.01417,0.7405785 1.0446383,1.9121443 1.0446383,1.9121443 0,0 1.137217,-1.1549595 1.159623,-1.89525 0.02241,-0.7402905 -1.042897,-1.96195 -1.042897,-1.96195 z' },
];

const INNER_PETALS = [
  { id: 8, d: 'm 5.6569019,5.4956939 c 0,0 0.057112,0.8505398 0.3405037,1.1177096 0.2725711,0.2569681 1.0924487,0.2636368 1.0924487,0.2636368 0,0 -0.047068,-0.8346709 -0.3220822,-1.0997839 C 6.4927524,5.5121384 5.6569019,5.4956939 5.6569019,5.4956939 Z' },
  { id: 2, d: 'm 9.208524,5.4237733 c 0,0 -0.8505397,0.057112 -1.1177095,0.3405037 -0.2569681,0.2725711 -0.2636368,1.0924487 -0.2636368,1.0924487 0,0 0.8346709,-0.047068 1.0997839,-0.3220822 C 9.19208,6.2596238 9.208524,5.4237733 9.208524,5.4237733 Z' },
  { id: 4, d: 'm 9.208524,8.9984542 c 0,0 -0.05711,-0.8505398 -0.3405038,-1.1177096 C 8.5954493,7.6237765 7.7755717,7.6171078 7.7755717,7.6171078 c 0,0 0.047068,0.8346709 0.3220822,1.0997839 0.2750197,0.265118 1.1108701,0.2815625 1.1108701,0.2815625 z' },
  { id: 6, d: 'm 5.6107843,9.047316 c 0,0 0.8505398,-0.057112 1.1177096,-0.3405037 0.2569681,-0.2725711 0.2636368,-1.0924487 0.2636368,-1.0924487 0,0 -0.8346709,0.047068 -1.0997839,0.3220822 C 5.6272288,8.2114655 5.6107843,9.047316 5.6107843,9.047316 Z' },
  { id: 5, d: 'm 7.3765397,9.6090056 c 0,0 0.5915477,-0.6138006 0.5989986,-1.003204 C 7.9827083,8.2312669 7.4367437,7.619572 7.4367437,7.619572 c 0,0 -0.5865438,0.595699 -0.5981005,0.9775159 -0.011557,0.3818243 0.5378965,1.0119177 0.5378965,1.0119177 z' },
  { id: 7, d: 'm 4.9456204,7.2027685 c 0,0 0.6138004,0.5915476 1.0032039,0.5989986 0.3745348,0.00717 0.9862297,-0.5387946 0.9862297,-0.5387946 0,0 -0.595699,-0.5865439 -0.977516,-0.5981005 C 5.5757137,6.6533149 4.9456204,7.2027685 4.9456204,7.2027685 Z' },
  { id: 1, d: 'm 7.4888867,4.8620837 c 0,0 -0.591549,0.6137991 -0.5989984,1.0032042 -0.00717,0.3745346 0.5387944,0.9862294 0.5387944,0.9862294 0,0 0.5865438,-0.5956989 0.5981006,-0.9775158 C 8.0383401,5.4921771 7.4888867,4.8620837 7.4888867,4.8620837 Z' },
  { id: 3, d: 'm 9.804512,7.2683208 c 0,0 -0.613801,-0.5915476 -1.0032042,-0.5989986 -0.3745349,-0.00717 -0.9862297,0.5387946 -0.9862297,0.5387946 0,0 0.595699,0.5865438 0.9775158,0.5981005 C 9.174418,7.8177743 9.804512,7.2683208 9.804512,7.2683208 Z' },
];

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

  const anyOuterAwake = Object.values(petalStates).some(isActive);
  const interactive = typeof onPetalClick === 'function';
  const orbPositions = {
    1: { cx: 7.39, cy: 1.2 },    // top (outward)
    2: { cx: 11.46, cy: 2.82 },  // upper-right (outward)
    3: { cx: 11.9, cy: 6.95 },   // right (outward)
    4: { cx: 10.08, cy: 10.82 }, // lower-right (outward)
    5: { cx: 7.39, cy: 11.98 },  // bottom (outward)
    6: { cx: 3.3, cy: 2.86 },    // upper-left (outward)
    7: { cx: 2.9, cy: 6.92 },    // left (outward)
    8: { cx: 4.7, cy: 10.7 },    // lower-left (outward)
  };
  const outerPetalPalette = {
    1: { fill: 'rgba(214, 168, 244, 0.38)', stroke: 'rgba(186, 120, 236, 0.9)' },
    2: { fill: 'rgba(255, 213, 142, 0.38)', stroke: 'rgba(245, 180, 86, 0.92)' },
    3: { fill: 'rgba(163, 220, 255, 0.38)', stroke: 'rgba(98, 178, 236, 0.9)' },
    4: { fill: 'rgba(186, 234, 166, 0.38)', stroke: 'rgba(122, 196, 114, 0.9)' },
    5: { fill: 'rgba(255, 183, 196, 0.38)', stroke: 'rgba(244, 126, 155, 0.9)' },
    6: { fill: 'rgba(201, 196, 255, 0.38)', stroke: 'rgba(150, 139, 236, 0.9)' },
    7: { fill: 'rgba(255, 201, 156, 0.38)', stroke: 'rgba(238, 154, 93, 0.9)' },
    8: { fill: 'rgba(181, 237, 222, 0.38)', stroke: 'rgba(108, 197, 171, 0.9)' },
  };

  return (
    <div
      className={showAsOverlay ? `inner-mandala-overlay ${mounted ? 'is-mounted' : ''}` : 'inner-mandala-inline'}
      onClick={showAsOverlay && allowTapToSkip ? handleDismiss : undefined}
    >
      <div
        className="inner-mandala"
        onClick={showAsOverlay && allowTapToSkip ? handleDismiss : (e) => e.stopPropagation()}
      >
        <svg viewBox="0 0 14.816666 14.816667" role="img" aria-label={`${childName}'s Inner Mandala`}>
          <defs>
            <radialGradient id="petal-orb-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="35%" stopColor="rgba(255,226,122,0.95)" />
              <stop offset="60%" stopColor="rgba(255,196,72,0.75)" />
              <stop offset="100%" stopColor="rgba(255,196,72,0)" />
            </radialGradient>
          </defs>
          <g id="outer-ring">
            {OUTER_PETALS.map((petal) => {
              const state = petalStates[petal.id];
              const awakened = isActive(state);
              return (
                <g
                  key={`outer-${petal.id}`}
                  onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('outer', petal.id); } : undefined}
                  className={interactive ? 'mandala-petal-group' : ''}
                >
                  <path
                    id={`outer-petal-${petal.id}`}
                    d={petal.d}
                    className={`mandala-petal outer-petal ${awakened ? 'awakened discovered' : 'locked'} ${highlightPetals.includes(petal.id) ? 'highlighted' : ''}`}
                    style={{
                      animationDelay: `${petal.id * 0.35}s`,
                      '--outer-fill': outerPetalPalette[petal.id].fill,
                      '--outer-stroke': outerPetalPalette[petal.id].stroke,
                    }}
                  />
                  {awakened ? (
                    <circle
                      className="petal-orb"
                      cx={orbPositions[petal.id].cx}
                      cy={orbPositions[petal.id].cy}
                      r="0.42"
                    />
                  ) : null}
                </g>
              );
            })}
          </g>

          <g id="middle-ring">
            {MIDDLE_PETALS.map((petal) => {
              const activated = isActive(middlePetalStates[petal.id]);
              return (
                <path
                  key={`middle-${petal.id}`}
                  id={`middle-petal-${petal.id}`}
                  d={petal.d}
                  className={`mandala-petal middle-petal ${activated ? 'activated active' : ''}`}
                  style={{ animationDelay: `${petal.id * 0.28}s` }}
                  onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('middle', petal.id); } : undefined}
                />
              );
            })}
          </g>

          <g id="inner-ring" className={`center-flower ${anyOuterAwake ? 'active' : ''}`}>
            {INNER_PETALS.map((petal) => {
              const activated = isActive(innerPetalStates[petal.id]) || anyOuterAwake;
              return (
                <path
                  key={`inner-${petal.id}`}
                  id={`inner-petal-${petal.id}`}
                  d={petal.d}
                  className={`mandala-petal inner-petal middle-petal ${activated ? 'activated active' : ''}`}
                  onClick={interactive ? (e) => { e.stopPropagation(); onPetalClick('inner', petal.id); } : undefined}
                />
              );
            })}
          </g>

          <circle id="inner_circle" className="center-core-svg" cx="7.3877516" cy="7.2097878" r="0.83" />
        </svg>

        <div className="mandala-particles" />
        <div className="center-light" />
        <div className="mandala-subtitle">{message}</div>
      </div>
    </div>
  );
}
