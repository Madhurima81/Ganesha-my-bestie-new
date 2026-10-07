import React from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

// Plates are CSS circles drawn directly on the scene.
// Drop zone = the visible circle. No image sizing, no container offset.
// Food positions and plate positions are both full-screen % values.

// ?hitzones outlines the real drop box of every plate.
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

// Sizes follow the screen so the three plate zones never overlap or run off the bottom:
// 264x116 / 132 at 1280x720 (the old fixed values), smaller on phones. Plates sit 17% of the
// width and 13% of the height apart; this width keeps the ovals clear of each other at every
// tested size (667x375, 812x375, 1024x768, 768x1024).
const PLATE_WIDTH = 'min(21vw, 36.7vh)';
const PLATE_HEIGHT = `calc(${PLATE_WIDTH} * 0.44)`;
const FOOD_SIZE = 'clamp(84px, 18.3vh, 132px)';
const PLATE_FOOD_WIDTH = '60.6%'; // of the plate zone (160px on a 264px zone)

// Phone landscape (same condition as DreamsWishesGame.css): a compact 3-over-3 layout. The desktop
// maps (passed in as props) put the plates down to 83% of a 390px screen and the animals at fixed
// px offsets, which clips the bottom row and runs the peacock into the Replay / Sound buttons.
const PHONE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';
const PHONE_FOOD_POSITIONS = {
  apple:  { left: '31%', top: '32%' },
  banana: { left: '50%', top: '27%' },
  rice:   { left: '69%', top: '32%' },
};
const PHONE_PLATE_POSITIONS = [
  { left: '31%', top: '76%' },
  { left: '50%', top: '72%' },
  { left: '69%', top: '76%' },
];
// Animals sit to the upper-right of their plate; sizes/offsets are phone-scaled versions of the desktop ones.
const DESKTOP_ANIMALS = [
  { height: '207px', xOffset: 62, yOffset: -20 },
  { height: '93px', xOffset: 90, yOffset: 0 },
  { height: '132px', xOffset: 90, yOffset: 0 },
];
const PHONE_ANIMALS = [
  { height: 'clamp(84px, 24vh, 104px)', xOffset: 62, yOffset: -34 },
  { height: 'clamp(48px, 13vh, 60px)', xOffset: 64, yOffset: -22 },
  { height: 'clamp(64px, 18vh, 80px)', xOffset: 64, yOffset: -30 },
];

const Wish2PlateDropGame = ({
  sceneState,
  wish2IdleLevel,
  wish2TeachingReady,
  firstUnfilledBowlIndex,
  markInteraction,
  handleWish2FoodDrop,
  handleWish2PlateClick,
  wish2Sparkle,
  WISH2_FOOD_KEYS,
  WISH2_FOOD_ASSETS,
  WISH2_FOOD_POSITIONS,
  WISH2_PLATE_POSITIONS,
  plateImg,
  cowImg,
  mouseImg,
  peacockImg,
  onWish2Miss,
}) => {
  const isPhone = typeof window !== 'undefined' && window.matchMedia(PHONE_LANDSCAPE_QUERY).matches;
  const FOOD_POS = isPhone ? PHONE_FOOD_POSITIONS : WISH2_FOOD_POSITIONS;
  const PLATE_POS = isPhone ? PHONE_PLATE_POSITIONS : WISH2_PLATE_POSITIONS;
  const animalSizes = isPhone ? PHONE_ANIMALS : DESKTOP_ANIMALS;

  // A drag that ends off every plate (or on a full one) is a gentle miss: the food glides back
  // to where it started and a soft sound plays. KidsDraggable fires the plate's drop first and
  // onDragEnd after, so "no plate took it" = miss. Release point comes from a capture listener.
  const droppedRef = React.useRef(false);
  const releasePointRef = React.useRef(null);
  const foodWrapRefs = React.useRef({});
  React.useEffect(() => {
    const onUp = (e) => { releasePointRef.current = { x: e.clientX, y: e.clientY }; };
    document.addEventListener('pointerup', onUp, true);
    return () => document.removeEventListener('pointerup', onUp, true);
  }, []);
  const handleFoodDragEnd = (foodKey) => {
    const hit = droppedRef.current;
    droppedRef.current = false;
    if (hit) return;
    onWish2Miss?.();
    const wrap = foodWrapRefs.current[foodKey];
    const img = wrap?.querySelector('img');
    const up = releasePointRef.current;
    if (!wrap || !img || !up || !img.animate) return;
    const r = wrap.getBoundingClientRect();
    const dx = up.x - (r.left + r.width / 2);
    const dy = up.y - (r.top + r.height / 2);
    img.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(1.08)` }, { transform: 'translate(0, 0) scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  };
  // One-time teaching demo — once the child starts a real drag, it must
  // never auto-reappear (a child who understood immediately shouldn't keep
  // seeing the hand just because wish2Taps is still 0).
  const [teachingGestureDismissed, setTeachingGestureDismissed] = React.useState(false);
  const activeFoodPool = sceneState.wish2FoodPool || WISH2_FOOD_KEYS;
  const firstAvailableFoodKey = activeFoodPool[0];
  const pointerStart = FOOD_POS[firstAvailableFoodKey] || { left: '18%', top: '62%' };
  const pointerTarget = PLATE_POS[firstUnfilledBowlIndex] || { left: '50%', top: '62%' };

  const startPoint = {
    x: Number.parseFloat(pointerStart.left) || 18,
    y: Number.parseFloat(pointerStart.top) || 62,
  };
  const targetPoint = {
    x: Number.parseFloat(pointerTarget.left) || 50,
    y: Number.parseFloat(pointerTarget.top) || 62,
  };

  return (
    <div className="wish-screen">

      {/* Progress header */}
      <div className="game-header-hud">
        <div className="wish-progress-header">
          <div className="wish-progress-title">Wish 2: Fill The Bowls</div>
          <div className="wish-progress-count">{sceneState.wish2Taps}/3</div>
        </div>
      </div>

      {/* Stage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <GestureDemo
          type="drag"
          from={startPoint}
          to={targetPoint}
          active={
            !teachingGestureDismissed &&
            wish2TeachingReady &&
            wish2IdleLevel === 0 &&
            (sceneState.wish2Taps || 0) === 0 &&
            activeFoodPool.length > 0 &&
            firstUnfilledBowlIndex !== null &&
            firstUnfilledBowlIndex !== undefined
          }
          idleDelay={250}
          iterations={2}
          zIndex={24}
        />

        {/* Teaching reminder — only while the child has NOT yet placed a food (still learning to
            drag). After the first food the hand never returns; the cues below are goal-only. */}
        {wish2IdleLevel >= 1 && (sceneState.wish2Taps || 0) === 0 && firstUnfilledBowlIndex !== null && firstUnfilledBowlIndex !== undefined && (
          <GestureDemo
            key={`wish2-hint-${firstAvailableFoodKey}-${firstUnfilledBowlIndex}`}
            type="drag"
            from={startPoint}
            to={targetPoint}
            active
            idleDelay={0}
            iterations={2}
            zIndex={24}
          />
        )}

        {/* Food items */}
        {WISH2_FOOD_KEYS.map((foodKey) => {
          const isAvailable = (sceneState.wish2FoodPool || WISH2_FOOD_KEYS).includes(foodKey);
          const pos = FOOD_POS[foodKey];
          const inwardX =
            foodKey === 'apple' ? 10 :
            foodKey === 'rice' ? -10 :
            0;

          return (
            <div
              key={foodKey}
              ref={(el) => { foodWrapRefs.current[foodKey] = el; }}
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                transform: `translate(calc(-50% + ${inwardX}px), -50%)`,
                width: FOOD_SIZE,
                height: FOOD_SIZE,
                opacity: isAvailable ? 1 : 0,
                pointerEvents: isAvailable ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
                zIndex: 15,
              }}
            >
              <KidsDraggable
                id={`wish2-food-${foodKey}`}
                data={{ type: 'wish2-food', foodKey }}
                disabled={!isAvailable}
                onDragEnd={() => handleFoodDragEnd(foodKey)}
                onDragStart={() => {
                  setTeachingGestureDismissed(true);
                  markInteraction();
                }}
                style={{ width: '100%', height: '100%' }}
              >
                <img
                  src={WISH2_FOOD_ASSETS[foodKey]}
                  alt={foodKey}
                  className={`
                    wish2-food-img
                    ${wish2IdleLevel === 1 && isAvailable && foodKey === firstAvailableFoodKey ? 'wish2-food-hint-attention' : ''}
                    ${wish2IdleLevel >= 2 && isAvailable && foodKey === firstAvailableFoodKey ? 'wish2-food-hint-source' : ''}
                  `}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    display: 'block',
                  }}
                />
              </KidsDraggable>
            </div>
          );
        })}

        {/* Plates */}
        {sceneState.bowlStates.map((isFilled, index) => (
          <KidsDropZone
            key={index}
            id={`wish2-plate-${index}`}
            accepts="wish2-food"
            disabled={isFilled}
            onDrop={({ data }) => {
              if (!isFilled) { droppedRef.current = true; handleWish2FoodDrop(index, data?.foodKey); }
            }}
            style={{
              position: 'absolute',
              left: PLATE_POS[index]?.left || '50%',
              top: PLATE_POS[index]?.top || '50%',
              transform: 'translate(-50%, -50%)',
              width: PLATE_WIDTH,
              // phone: 0.5 x width (not 0.44) so the drop target stays >= 60px tall at 740x360
              height: isPhone ? `calc(${PLATE_WIDTH} * 0.5)` : PLATE_HEIGHT,
              borderRadius: '50%',
              background: SHOW_HIT_ZONES ? 'rgba(233, 30, 99, 0.16)' : 'transparent',
              border: 'none',
              outline: SHOW_HIT_ZONES ? '3px dashed #E91E63' : 'none',
              boxShadow: 'none',
              zIndex: 20,
              cursor: isFilled ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleWish2PlateClick(index)}
          >
            {wish2IdleLevel >= 1 && index === firstUnfilledBowlIndex && !isFilled && (
              <div className={`wish2-hint-target-ring${wish2IdleLevel === 1 ? ' is-soft' : ''}`} />
            )}
            <img
              src={plateImg}
              alt=""
              style={{
                position: 'absolute',
                width: '210%',
                height: '210%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {isFilled && (sceneState.wish2PlateFoods || [])[index] && (
              <img
                src={WISH2_FOOD_ASSETS[(sceneState.wish2PlateFoods || [])[index]]}
                alt="Food on plate"
                style={{
                  position: 'absolute',
                  width: PLATE_FOOD_WIDTH,
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -80%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}

            {wish2Sparkle.type === 'single' && wish2Sparkle.targetIndex === index && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
                <SparkleAnimation
                  key={`wish2-single-${wish2Sparkle.key}-${index}`}
                  type="magic"
                  count={14}
                  color="rgba(255, 210, 92, 0.98)"
                  size={10}
                  duration={1700}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}
          </KidsDropZone>
        ))}

        {/* Animals next to each plate */}
        {[
          { src: cowImg, ...animalSizes[0] },
          { src: mouseImg, ...animalSizes[1] },
          { src: peacockImg, ...animalSizes[2] },
        ].map((animal, index) => (
          <img
            key={index}
            src={animal.src}
            alt="animal"
            style={{
              position: 'absolute',
              left: `calc(${PLATE_POS[index]?.left} + ${animal.xOffset}px)`,
              top: PLATE_POS[index]?.top,
              transform: `translateY(calc(-50% + ${animal.yOffset}px))`,
              height: animal.height,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}

        {wish2Sparkle.type === 'all' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
            <SparkleAnimation
              key={`wish2-all-${wish2Sparkle.key}`}
              type="magic"
              count={42}
              color="rgba(255, 214, 102, 0.92)"
              size={12}
              duration={2400}
              fadeOut={true}
              area="full"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Wish2PlateDropGame;
