import React from 'react';
import { getMissionData } from '../utils/missionHelpers';

function MissionHeader({
  selectedMission,
  currentStep,
  completedSteps,
  fixedCount,
  selectedWrongItem,
  timeRemaining,
  ecoCount,
  lightsPlaced
}) {
const missionData = getMissionData(
  selectedMission, 
  currentStep, 
  selectedMission?.type === 'fix' ? fixedCount 
    : selectedMission?.type === 'eco' ? ecoCount
    : selectedMission?.type === 'light' ? lightsPlaced
    : currentStep
);
  
  if (!missionData) return null;

  return (
    <div className="mission-minimal-header">
      <div className="mission-instruction-minimal">
        <span className="instruction-icon">{missionData.emoji}</span>
        <span className="instruction-text">
          {missionData.type === 'fix' && selectedWrongItem 
            ? 'Tap the green spot!' 
            : missionData.instruction.split('!')[0]}
        </span>
      </div>
      <div className="mission-progress-minimal">
          {/* Show timer for Light Challenge */}
  {selectedMission?.type === 'light' && (
    <span className="mission-timer">⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
  )}
      <span className="progress-count">
  {missionData.currentProgress}/{missionData.totalSteps}
  {selectedMission?.type === 'eco' && ' 🌿'}
  {selectedMission?.type === 'light' && ' 💡'}
</span>
        <div className="progress-dots-minimal">
          {Array.from({ length: missionData.totalSteps }).map((_, i) => (
            <span 
              key={i} 
              className={`dot-mini ${
                i < (missionData.type === 'fix' ? fixedCount : completedSteps.length) 
                  ? 'filled' 
                  : ''
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MissionHeader;