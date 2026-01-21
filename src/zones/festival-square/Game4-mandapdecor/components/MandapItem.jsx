import React from 'react';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem'; // Check your path!
import { DECORATION_IMAGES } from '../MandapDecorationGame'; // Importing the images we exported earlier

const MandapItem = ({ 
  decoration, 
  zoneId, 
  index, 
  zoneData,
  isFixMode, 
  selectedWrongId, 
  onWrongClick, 
  onUpdatePosition,
  onDragStart,
  onDragEnd 
}) => {

  // 1. Calculate Position
  // If customPosition exists (Free Play/Puja), use it. Otherwise calculate based on zone.
  const currentPosition = decoration.customPosition || {
    top: `${zoneData.y + zoneData.height/2 + Math.floor(index / 3) * 3}%`,
    left: `${zoneData.x + zoneData.width/2 + (index % 3) * 3}%`
  };

  // 2. Logic: Determine State (Wrong, Fixed, Selected)
  const isWrong = isFixMode && decoration.isWrong && !decoration.isFixed;
  const isSelected = isFixMode && selectedWrongId === decoration.fixId;
  const isFixed = isFixMode && decoration.isFixed;

  // 3. Logic: CSS Classes
  let className = '';
  
  if (isFixMode && isWrong) {
      // Fix Mode Broken Item: Wiggle
      className = 'decoration-image decoration-wrong';
      if (isSelected) className += ' decoration-selected';
  } else {
      // Normal Item (Free Play, Puja, or Fixed)
      className = 'placed-item-sticker'; 
      
      // Add Glow (if it's a light and not broken)
      if (decoration.hasLightEffect && !isWrong) className += ' glowing';
      
      // Add Poof (if just placed in Puja/Fix)
      if (decoration.justPlaced) className += ' item-appear-poof';
  }

  // 4. Helper: Get Size (Moved inside here for isolation)
  const getSize = (imgName) => {
    const sizes = {
      'garland_jasmine.png': '90px', 'garland_flower_leaf_mix.png': '100px', 
      'toran_fabric_flowers.png': '85px', 'garland_mixed_chain.png': '95px',
      'flower_marigold_bunch.png': '70px', 'flower_rose_petals.png': '55px',
      'flower_lotus_single.png': '65px', 'flower_petals.png': '50px',
      'diya_golden_ornate.png': '75px', 'diya_clay_traditional.png': '60px',
      'diya_painted_decorative.png': '65px', 'lights_string_festival.png': '100px',
      'lights_paper_lanterns.png': '105px', 'offering_coconut.png': '65px',
      'offering_fruits_plate.png': '70px', 'offering_sweets_modak.png': '68px',
      'offering_incense_sticks.png': '60px', 'fun_bunting_colorful.png': '80px',
      'fun_balloons_cluster.png': '85px', 'fun_streamers_flowing.png': '90px',
      'fun_confetti_scatter.png': '45px', 'special_fabric_draping.png': '110px',
      'special_peacock_feathers.png': '105px', 'special_kalash_pot.png': '80px',
      'special_rangoli_base.png': '95px'
    };
    return sizes[imgName] ? `${parseInt(sizes[imgName]) + 25}px` : '85px';
  };

  const decorationKey = `decoration-${zoneId}-${index}`;

  return (
    <FreeDraggableItem
      id={decorationKey}
      position={currentPosition}
      dragDelay={150}
      style={{ zIndex: 25 }}
      onPositionChange={(newPos) => onUpdatePosition(decorationKey, newPos)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <img 
        src={DECORATION_IMAGES[decoration.image]}
        alt={decoration.name}
        className={className}
        style={{ 
          width: getSize(decoration.image), 
          height: getSize(decoration.image), 
          pointerEvents: 'auto',
          ...decoration.stickerStyle // Supports dynamic sticker changes
        }}
        onClick={(e) => {
          if (isWrong) {
            e.stopPropagation();
            onWrongClick(decoration);
          }
        }}
      />
    </FreeDraggableItem>
  );
};

export default MandapItem;