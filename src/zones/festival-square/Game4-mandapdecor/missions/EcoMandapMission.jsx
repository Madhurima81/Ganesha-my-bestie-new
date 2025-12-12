import { useState, useEffect } from 'react';

function EcoMandapMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  onComplete,
  safeSetTimeout
}) {
  const [ecoCount, setEcoCount] = useState(0);
  const [nonEcoCount, setNonEcoCount] = useState(0);
  const [placedItems, setPlacedItems] = useState([]);

  // Initialize mission
  useEffect(() => {
    if (selectedMission?.type === 'eco') {
      setEcoCount(0);
      setNonEcoCount(0);
      setPlacedItems([]);
      setGuidanceMessage('Choose only eco-friendly decorations! 🌿');
    }
  }, [selectedMission, setGuidanceMessage]);

  // If not Eco mission, return null functions
  if (!selectedMission || selectedMission.type !== 'eco') {
    return {
      ecoCount: 0,
      nonEcoCount: 0,
      validatePlacement: () => true,
      isEcoItem: () => false,
      isNonEcoItem: () => false
    };
  }

  // Check if item is eco-friendly
  const isEcoItem = (itemId) => {
    return selectedMission.ecoItems?.includes(itemId) || false;
  };

  // Check if item is non-eco
  const isNonEcoItem = (itemId) => {
    return selectedMission.nonEcoItems?.includes(itemId) || false;
  };

  // Validate placement
  const validatePlacement = (decorationId, zoneId) => {
    const isEco = isEcoItem(decorationId);
    const isNonEco = isNonEcoItem(decorationId);

    // Check if item was already placed
    if (placedItems.includes(decorationId)) {
      return true; // Allow re-placement
    }

    if (isNonEco) {
      // Non-eco item placed - penalty!
      setGuidanceMessage('❌ Oh no! That\'s not eco-friendly! Choose natural items! 🌿');
      setNonEcoCount(prev => prev + 1);
      
      safeSetTimeout(() => {
        setGuidanceMessage('Choose only eco-friendly decorations! 🌿');
      }, 2500);
      
      return false; // Don't place
    }

    if (isEco) {
      // Eco item placed - success!
      const newEcoCount = ecoCount + 1;
      const newPlacedItems = [...placedItems, decorationId];
      
      setEcoCount(newEcoCount);
      setPlacedItems(newPlacedItems);

      // Success feedback
      setShowStepSuccess(true);
      setLastCompletedStep({
        emoji: '🌿',
        successMessage: `Great choice! ${newEcoCount}/${selectedMission.targetEcoCount} eco items!`
      });

      safeSetTimeout(() => setShowStepSuccess(false), 2000);

      // Check if mission complete
      if (newEcoCount >= selectedMission.targetEcoCount) {
        safeSetTimeout(() => {
          setMissionStars(prev => prev + 5);
          setCompletedMissions(prev => ({ 
            ...prev, 
            [selectedMission.id]: true 
          }));
          
          if (onComplete) {
            onComplete();
          } else {
            setSelectedMission(null);
            setEcoCount(0);
            setNonEcoCount(0);
            setPlacedItems([]);
            setGuidanceMessage('');
          }
        }, 2500);
      } else {
        safeSetTimeout(() => {
          setGuidanceMessage(`Keep going! ${selectedMission.targetEcoCount - newEcoCount} more eco items needed! 🌿`);
        }, 2500);
      }

      return true;
    }

    // Neutral item (not in either list) - allow but don't count
    return true;
  };

  return {
    ecoCount,
    nonEcoCount,
    validatePlacement,
    isEcoItem,
    isNonEcoItem
  };
}

export default EcoMandapMission;