import React from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

// Plates are CSS circles drawn directly on the scene.
// Drop zone = the visible circle. No image sizing, no container offset.
// Food positions and plate positions are both full-screen % values.

const FOOD_SIZE = 132;   // px (further reduced)
const PLATE_WIDTH = 264;   // px (further reduced)
const PLATE_HEIGHT = 116;   // px (further reduced)

const Wish2PlateDropGame = ({
  sceneState,
  wish2IdleLevel,
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
}) => {
  return (
    <div className="wish-screen">

      {/* ── PROGRESS HEADER ── */}
      <div className="game-header-hud">
        <div className="wish-progress-header">
          <div className="wish-progress-title">Wish 2: Fill The Bowls</div>
          <div className="wish-smiley-row">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`wish-smiley-icon ${i < sceneState.wish2Taps ? 'filled' : ''}`}>
                {i < sceneState.wish2Taps ? '😊' : '😶'}
              </span>
            ))}
          </div>
          <div className="wish-progress-count">{sceneState.wish2Taps}/3</div>
        </div>
      </div>

      {/* ── STAGE — full screen, all elements absolute inside ── */}
      <div style={{ position: 'absolute', inset: 0 }}>

        {/* ── FOOD ITEMS ── */}
        {WISH2_FOOD_KEYS.map((foodKey) => {
          const isAvailable = (sceneState.wish2FoodPool || WISH2_FOOD_KEYS).includes(foodKey);
          const pos = WISH2_FOOD_POSITIONS[foodKey];
          const inwardX =
            foodKey === 'apple' ? 10 :
            foodKey === 'rice' ? -10 :
            0;

          return (
            <div
              key={foodKey}
              className={`
                ${wish2IdleLevel === 1 ? 'hint' : ''}
                ${wish2IdleLevel === 2 ? 'hint-strong' : ''}
                ${wish2IdleLevel === 3 ? 'hint-final' : ''}
              `}
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                transform: `translate(calc(-50% + ${inwardX}px), -50%)`,
                width: `${FOOD_SIZE}px`,
                height: `${FOOD_SIZE}px`,
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
                onDragStart={() => markInteraction()}
                style={{ width: '100%', height: '100%' }}
              >
                <img
                  src={WISH2_FOOD_ASSETS[foodKey]}
                  alt={foodKey}
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

        {/* ── PLATES — CSS circles, drop zone = the circle ── */}
        {sceneState.bowlStates.map((isFilled, index) => (
          <KidsDropZone
            key={index}
            id={`wish2-plate-${index}`}
            accepts="wish2-food"
            disabled={isFilled}
            onDrop={({ data }) => {
              if (!isFilled) handleWish2FoodDrop(index, data?.foodKey);
            }}
            style={{
              position: 'absolute',
              left: WISH2_PLATE_POSITIONS[index]?.left || '50%',
              top: WISH2_PLATE_POSITIONS[index]?.top || '50%',
              transform: 'translate(-50%, -50%)',
              width: `${PLATE_WIDTH}px`,
              height: `${PLATE_HEIGHT}px`,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              zIndex: 20,
              cursor: isFilled ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleWish2PlateClick(index)}
          >
            {/* plate image — pure decoration, sits inside the circle */}
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

            {/* food on plate after drop */}
            {isFilled && (sceneState.wish2PlateFoods || [])[index] && (
              <img
                src={WISH2_FOOD_ASSETS[(sceneState.wish2PlateFoods || [])[index]]}
                alt="Food on plate"
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  objectFit: 'contain',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -80%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* per-plate sparkle */}
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
          { src: cowImg, height: '207px', xOffset: 62, yOffset: -20 },
          { src: mouseImg, height: '93px', xOffset: 90, yOffset: 0 },
          { src: peacockImg, height: '132px', xOffset: 90, yOffset: 0 },
        ].map((animal, index) => (
          <img
            key={index}
            src={animal.src}
            alt="animal"
            style={{
              position: 'absolute',
              left: `calc(${WISH2_PLATE_POSITIONS[index]?.left} + ${animal.xOffset}px)`,
              top: WISH2_PLATE_POSITIONS[index]?.top,
              transform: `translateY(calc(-50% + ${animal.yOffset}px))`,
              height: animal.height,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}

        {/* all-plates completion sparkle */}
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
