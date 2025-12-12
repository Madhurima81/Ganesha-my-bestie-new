import React from 'react';
import { getMissionData } from '../utils/missionHelpers';

function MissionSidebar({
  selectedMission,
  currentStep,
  completedSteps,
  fixedCount,
  wrongItemsMap,
  selectedWrongItem,
  lightsPlaced,
  onStepClick,
  DECORATION_CATEGORIES,
  DECORATION_IMAGES
}) {
  
  // DEBUG LOG
  console.log('🔍 MissionSidebar Rendering:', {
    missionType: selectedMission?.type,
    missionId: selectedMission?.id,
    lightsPlaced: lightsPlaced,
    hasItems: !!selectedMission?.items,
    itemsLength: selectedMission?.items?.length,
    items: selectedMission?.items
  });

  const missionData = getMissionData(selectedMission, currentStep, fixedCount);

  return (
    <div className="mission-sidebar">
      <div className="mission-sidebar-header">
        <h3 className="mission-sidebar-title">
          {selectedMission?.name || 'Mission'}
        </h3>
      </div>

      <div className="mission-steps-list">
        {/* PUJA PREP STEPS */}
        {selectedMission?.id === 'puja-prep' && selectedMission.steps?.map((step, index) => {
          const decorationData = Object.values(DECORATION_CATEGORIES)
            .flatMap(cat => cat.items)
            .find(d => d.id === step.item);
          
          if (!decorationData) return null;
          
          const isCompleted = completedSteps.includes(step.step);
          const isCurrent = currentStep === step.step;
          
          return (
            <div 
              key={step.step}
              className={`mission-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => {
                if (isCurrent) {
                  onStepClick(decorationData, step.zone);
                }
              }}
            >
              <div className="step-number">{step.step}</div>
              <img 
                src={DECORATION_IMAGES[decorationData.image]}
                alt={decorationData.name}
                className="step-decoration-icon"
              />
              <div className="step-info">
                <span className="step-item-name">{decorationData.name}</span>
                {isCompleted && <span className="step-status">✓ Done!</span>}
                {isCurrent && <span className="step-status">👉 Place this!</span>}
              </div>
            </div>
          );
        })}

        {/* FIX MANDAP ITEMS */}
        {selectedMission?.type === 'fix' && Array.from(wrongItemsMap.values()).map((item, index) => {
          const isFixed = item.isFixed;
          const isSelected = selectedWrongItem?.fixId === item.fixId;
          
          return (
            <div 
              key={item.fixId}
              className={`mission-step-item ${isFixed ? 'completed' : ''} ${isSelected ? 'current' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <img 
                src={DECORATION_IMAGES[item.image]}
                alt={item.name}
                className="step-decoration-icon"
              />
              <div className="step-info">
                <span className="step-item-name">{item.name}</span>
                {isFixed && <span className="step-status">✓ Fixed!</span>}
                {!isFixed && !isSelected && <span className="step-status">❌ Fix this!</span>}
                {isSelected && <span className="step-status">👉 Tap green!</span>}
              </div>
            </div>
          );
        })}
{/* LIGHT CHALLENGE ITEMS */}
{selectedMission?.type === 'light' && selectedMission.items?.map((item, index) => {
  const decorationData = Object.values(DECORATION_CATEGORIES)
    .flatMap(cat => cat.items)
    .find(d => d.id === item.id);
  
  console.log('🔍 Light item lookup:', {
    lookingFor: item.id,
    found: !!decorationData,
    decorationData: decorationData
  });
  
  if (!decorationData) {
    console.error('❌ Decoration not found for:', item.id);
    return null;
  }
          
          const isCompleted = index < (lightsPlaced || 0);
          const isCurrent = index === (lightsPlaced || 0);
          
          return (
            <div 
              key={index}
              className={`mission-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => {
                if (isCurrent) {
                  onStepClick(decorationData, item.zone);
                }
              }}
            >
              <div className="step-number">{index + 1}</div>
              <img 
                src={DECORATION_IMAGES[decorationData.image]}
                alt={decorationData.name}
                className="step-decoration-icon"
              />
              <div className="step-info">
                <span className="step-item-name">{decorationData.name}</span>
                {isCompleted && <span className="step-status">✓ Placed!</span>}
                {isCurrent && <span className="step-status">⏰ Place now!</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MissionSidebar;