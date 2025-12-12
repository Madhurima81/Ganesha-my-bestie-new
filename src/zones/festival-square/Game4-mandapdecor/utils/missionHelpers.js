// Helper function to get mission-specific data
export function getMissionData(selectedMission, currentStep, progressCount = 0) {
  if (!selectedMission) return null;

  // Fix Mandap Mission
  if (selectedMission.type === 'fix') {
    return {
      type: 'fix',
      currentProgress: progressCount,
      totalSteps: selectedMission.wrongPlacements?.length || 5,
      instruction: 'Tap RED decorations, then GREEN spots!'
    };
  }

  // Eco Mandap Mission
  if (selectedMission.type === 'eco') {
    return {
      type: 'eco',
      currentProgress: progressCount,
      totalSteps: selectedMission.targetEcoCount || 5,
      instruction: 'Choose only eco-friendly decorations!'
    };
  }

  // Light Challenge Mission
  if (selectedMission.type === 'light') {
    return {
      type: 'light',
      currentProgress: progressCount,
      totalSteps: selectedMission.items?.length || 5,
      instruction: 'Quick! Place lights before time runs out!'
    };
  }

  // Puja Prep Mission
  const currentStepData = selectedMission.steps?.[currentStep - 1];
  return {
    type: 'steps',
    currentStepData,
    currentProgress: currentStep,
    totalSteps: selectedMission.steps?.length || 5,
    instruction: currentStepData?.instruction || ''
  };
}

export const GAME_MODES = {
  INTRO: 'intro',
  SELECTION: 'selection',
  FREE_PLAY: 'free_play',
  CHALLENGE: 'challenge'
};

export const PHASES = {
  CHOOSING: 'choosing',
  DECORATION: 'decoration',
  COMPLETE: 'complete'
};