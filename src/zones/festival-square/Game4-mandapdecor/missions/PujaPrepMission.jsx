import { useEffect } from 'react';

function PujaPrepMission({
  selectedMission,
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  onComplete
}) {
  
  // Set initial guidance when mission starts
  useEffect(() => {
    if (selectedMission?.id === 'puja-prep' && selectedMission.steps) {
      const firstStep = selectedMission.steps[0];
      setGuidanceMessage(firstStep.instruction);
    }
  }, [selectedMission, setGuidanceMessage]);

  // If not Puja Prep mission, return null functions
  if (!selectedMission || selectedMission.id !== 'puja-prep') {
    return {
      validatePlacement: () => false,
      currentStepData: null
    };
  }

  // Handle step completion
  const handleStepComplete = (stepNumber) => {
    const currentStepData = selectedMission.steps[stepNumber - 1];
    
    // Store completed step data for success message
    setLastCompletedStep(currentStepData);
    
    // Show success
    setShowStepSuccess(true);
    setTimeout(() => setShowStepSuccess(false), 2000);
    
    // Update progress
    const newCompletedSteps = [...completedSteps, stepNumber];
    setCompletedSteps(newCompletedSteps);
    
    // Move to next step or complete mission
    if (stepNumber < selectedMission.steps.length) {
      setTimeout(() => {
        setCurrentStep(stepNumber + 1);
        const nextStepData = selectedMission.steps[stepNumber];
        setGuidanceMessage(nextStepData.instruction);
      }, 2500);
    } else {
      // Mission complete!
      setTimeout(() => {
        setMissionStars(prev => prev + 5);
        setCompletedMissions(prev => ({ 
          ...prev, 
          [selectedMission.id]: true 
        }));
        
        if (onComplete) {
          onComplete();
        } else {
          setSelectedMission(null);
          setCurrentStep(1);
          setCompletedSteps([]);
          setGuidanceMessage('');
        }
      }, 3000);
    }
  };

  // Validate placement
  const validatePlacement = (decorationId, zoneId) => {
    const currentStepData = selectedMission.steps[currentStep - 1];
    
    // Check if correct item
    if (decorationId !== currentStepData.item) {
      setGuidanceMessage(
        "That's beautiful, but let's follow the steps! " + 
        currentStepData.instruction
      );
      setTimeout(() => {
        setGuidanceMessage(currentStepData.instruction);
      }, 3000);
      return false;
    }
    
    // Check if correct zone
    if (zoneId !== currentStepData.zone) {
      setGuidanceMessage(`Not there! ${currentStepData.instruction}`);
      setTimeout(() => {
        setGuidanceMessage(currentStepData.instruction);
      }, 2000);
      return false;
    }
    
    // Success!
    handleStepComplete(currentStep);
    return true;
  };

  return {
    validatePlacement,
    currentStepData: selectedMission.steps?.[currentStep - 1]
  };
}

export default PujaPrepMission;