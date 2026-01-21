import React from 'react';
import { DECORATION_IMAGES, DECORATION_CATEGORIES } from '../../MandapDecorationGame';

const FixSidebar = ({ 
  wrongPlacements, 
  wrongItemsMap, 
  selectedWrongItem, 
  onSelectWrongItem 
}) => {
  return (
    <div className="inventory-tray items-mode">
      <div className="items-title" style={{marginBottom: '15px'}}>
        Fix Items 🔧
      </div>

      <div className="fix-steps-list">
        {wrongPlacements.map((item, index) => {
          const fixId = `fix-${index}`;
          const wrongItem = wrongItemsMap.get(fixId);
          const isFixed = wrongItem?.isFixed || false;
          const isSelected = selectedWrongItem?.fixId === fixId;
          
          const decorationData = Object.values(DECORATION_CATEGORIES)
            .flatMap(cat => cat.items)
            .find(i => i.id === item.id);
          
          return (
            <div
              key={fixId}
              className={`fix-item-pill ${isFixed ? 'completed' : ''} ${isSelected ? 'active' : ''}`}
              onClick={() => {
                if (!isFixed && wrongItem) {
                  onSelectWrongItem(wrongItem);
                }
              }}
            >
              <div className="fix-icon-circle">
                {decorationData && (
                  <img 
                    src={DECORATION_IMAGES[decorationData.image]} 
                    alt={decorationData.name}
                    className="fix-icon-img"
                  />
                )}
                
                {isFixed ? (
                  <div className="mini-check-badge">✓</div>
                ) : (
                  <div className="mini-cross-badge">✖</div>
                )}
              </div>

              <div className="fix-text-col">
                <span className="fix-item-name">
                  {decorationData ? decorationData.name : 'Item'}
                </span>
                <span className="fix-item-sub">
                  {isFixed ? 'Fixed!' : isSelected ? 'Tap glowing spot!' : 'Needs fixing'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FixSidebar;