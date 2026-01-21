import React from 'react';
import { DECORATION_IMAGES, DECORATION_CATEGORIES } from '../../MandapDecorationGame'; // Adjust import path if needed

const PujaSidebar = ({ 
  steps, 
  completedSteps, 
  currentStep, 
  onSelectStep 
}) => {
  return (
    <div className="inventory-tray items-mode"> 
      <div className="items-title" style={{marginBottom: '15px'}}>
        Puja Steps 🌸
      </div>

      <div className="puja-steps-list">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isFuture = !isCompleted && !isCurrent;
          
          // Find Item Data
          const decorationData = Object.values(DECORATION_CATEGORIES)
            .flatMap(cat => cat.items)
            .find(item => item.id === step.item);
          
          return (
            <div
              key={step.step}
              className={`puja-item-pill ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isFuture ? 'locked' : ''}`}
              onClick={() => {
                if (isCurrent && decorationData) {
                  onSelectStep(decorationData, step.zone);
                }
              }}
            >
              <div className="puja-icon-circle">
                {decorationData && (
                  <img 
                    src={DECORATION_IMAGES[decorationData.image]} 
                    alt={decorationData.name}
                    className="puja-icon-img"
                  />
                )}
                {isCompleted && <div className="mini-check-badge">✓</div>}
              </div>

              <div className="puja-text-col">
                <span className="puja-item-name">
                  {decorationData ? decorationData.name : 'Item'}
                </span>
                <span className="puja-item-sub">
                  {isCompleted ? 'Placed!' : isCurrent ? 'Tap to place' : 'Wait...'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PujaSidebar;