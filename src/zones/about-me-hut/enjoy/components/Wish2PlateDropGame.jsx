import React from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

// Plates are CSS circles drawn directly on the scene.
// Drop zone = the visible circle. No image sizing, no container offset.
// Food positions and plate positions are both full-screen % values.

const FOOD_SIZE = 160;   // px
const PLATE_WIDTH = 180;   // px - wider
const PLATE_HEIGHT = 70;   // px - flat like a plate

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
                transform: 'translate(-50%, -50%)',
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
              // Circle styling — this IS the plate visually
              background: isFilled
                ? 'rgba(255, 255, 255, 0.92)'
                : 'rgba(255, 255, 255, 0.75)',
              border: isFilled
                ? '3px solid #c8a96e'
                : wish2IdleLevel >= 1
                  ? '3px solid #f7cc7a'
                  : '3px solid #ddc49a',
              boxShadow: isFilled
                ? '0 4px 16px rgba(180,140,80,0.25)'
                : '0 2px 8px rgba(180,140,80,0.15)',
              zIndex: 20,
              cursor: isFilled ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
            }}
            className={`${wish2IdleLevel >= 1 && !isFilled ? 'heartbeat-gentle' : ''}`}
            onClick={() => handleWish2PlateClick(index)}
          >
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
          { src: cowImg, height: '145px' },
          { src: mouseImg, height: '110px' },
          { src: peacockImg, height: '155px' },
        ].map((animal, index) => (
          <img
            key={index}
            src={animal.src}
            alt="animal"
            style={{
              position: 'absolute',
              left: `calc(${WISH2_PLATE_POSITIONS[index]?.left} + 90px)`,
              top: WISH2_PLATE_POSITIONS[index]?.top,
              transform: 'translateY(-50%)',
              height: animal.height,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}

        {/* idle hint under first unfilled plate */}
        {wish2IdleLevel >= 3 && firstUnfilledBowlIndex >= 0 && (
          <div style={{
            position: 'absolute',
            left: WISH2_PLATE_POSITIONS[firstUnfilledBowlIndex]?.left || '50%',
            top: `calc(${WISH2_PLATE_POSITIONS[firstUnfilledBowlIndex]?.top} + ${PLATE_HEIGHT / 2 + 6}px)`,
            transform: 'translateX(-50%)',
            fontWeight: 700,
            fontSize: '14px',
            color: '#8B5E34',
            pointerEvents: 'none',
            zIndex: 25,
          }}>
            Try this plate ↑
          </div>
        )}

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

