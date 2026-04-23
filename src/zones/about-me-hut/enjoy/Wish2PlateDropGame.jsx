import React from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

const Wish2PlateDropGame = ({
  sceneState,
  wish2IdleLevel,
  firstUnfilledBowlIndex,
  selectedWish2FoodKey,
  setSelectedWish2FoodKey,
  markInteraction,
  handleWish2FoodDrop,
  handleWish2PlateClick,
  wish2Sparkle,
  WISH2_FOOD_KEYS,
  WISH2_FOOD_ASSETS,
  WISH2_FOOD_POSITIONS,
  WISH2_PLATE_LAYOUT,
  WISH2_PLATE_POSITIONS,
  plateImg,
  cowImg,
  mouseImg,
  peacockImg,
}) => {
  return (
    <div className="wish-screen">
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

      <div
        className="wish-interactive-container"
        style={{
          top: '72%',
          left: '53%',
          width: '100%',
          height: '100%',
        }}
      >
        {/* ── FOOD ITEMS ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 15 }}>
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
                  width: '120px',
                  height: '120px',
                  opacity: isAvailable ? 1 : 0,
                  pointerEvents: isAvailable ? 'auto' : 'none',
                  transition: 'opacity 0.25s ease',
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
                    }}
                  />
                </KidsDraggable>
              </div>
            );
          })}
        </div>

        {/* ── PLATES ── */}
        <div
          className="bowls-container"
          style={{
            position: 'absolute',
            left: '50%',
            top: `${WISH2_PLATE_LAYOUT.containerTop}%`,
            transform: 'translate(-50%, -50%)',
            width: `${WISH2_PLATE_LAYOUT.containerWidth}%`,
            height: `${WISH2_PLATE_LAYOUT.containerHeight}%`,
            display: 'block',
          }}
        >
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
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                zIndex: 20,
              }}
            >
              {/* clickable fallback for tap-to-select flow */}
              <div
                className={`bowl ${isFilled ? 'bowl-filled' : 'bowl-empty'} ${wish2IdleLevel >= 1 && !isFilled ? 'heartbeat-gentle' : ''}`}
                onClick={() => handleWish2PlateClick(index)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: isFilled ? 'default' : 'pointer',
                  ...(wish2IdleLevel >= 3 && index === firstUnfilledBowlIndex
                    ? { border: '3px dashed #f7cc7a', borderRadius: '50%' }
                    : {}),
                }}
              >
                {/* plate image — visually oversized so it looks natural */}
                <img
                  src={plateImg}
                  alt={`Plate ${index + 1}`}
                  className={`bowl-image ${isFilled ? 'bowl-glow-bounce' : ''}`}
                  style={{
                    position: 'absolute',
                    width: '165%',
                    height: '165%',
                    top: '-33%',
                    left: '-33%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />

                {/* food sitting on plate after successful drop */}
                {isFilled && (sceneState.wish2PlateFoods || [])[index] && (
                  <img
                    src={WISH2_FOOD_ASSETS[(sceneState.wish2PlateFoods || [])[index]]}
                    alt="Food on plate"
                    style={{
                      position: 'absolute',
                      width: '62%',
                      height: '62%',
                      objectFit: 'contain',
                      top: '56%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* per-plate sparkle on fill */}
                {wish2Sparkle.type === 'single' && wish2Sparkle.targetIndex === index && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: '42%',
                      height: '42%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  >
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
              </div>
            </KidsDropZone>
          ))}

          {/* idle hint label */}
          {wish2IdleLevel >= 3 && firstUnfilledBowlIndex >= 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '-22px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 700,
                color: '#8B5E34',
              }}
            >
              Try this plate
            </div>
          )}

          {/* all-plates sparkle on completion */}
          {wish2Sparkle.type === 'all' && (
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
          )}
        </div>

        {/* ── ANIMALS ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            zIndex: 5,
          }}
        >
          <img src={cowImg}     alt="Cow"     style={{ height: '80px', objectFit: 'contain', opacity: 0.85 }} />
          <img src={mouseImg}   alt="Mouse"   style={{ height: '70px', objectFit: 'contain', opacity: 0.85 }} />
          <img src={peacockImg} alt="Peacock" style={{ height: '85px', objectFit: 'contain', opacity: 0.85 }} />
        </div>
      </div>
    </div>
  );
};

export default Wish2PlateDropGame;
