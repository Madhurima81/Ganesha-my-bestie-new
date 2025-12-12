import { useState, useEffect } from 'react';

function LightChallengeMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  DECORATION_CATEGORIES,
  onComplete,
  safeSetTimeout
}) {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [lightsPlaced, setLightsPlaced] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [requiredItems, setRequiredItems] = useState([]);

useEffect(() => {
  if (selectedMission?.type === 'light') {
    setTimeRemaining(selectedMission.timeLimit || 60);
    setLightsPlaced(0);
    setTimerActive(true);
    
    // Get required light items
    const items = selectedMission.items || [];
    setRequiredItems(items);
    
    // Highlight first zone
    if (items.length > 0) {
      setHighlightedZones(new Set([items[0].zone]));
    }
    
    setGuidanceMessage('Quick! Place all the lights before time runs out! 💡');
  }
}, [selectedMission, setGuidanceMessage, setHighlightedZones]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || !selectedMission || selectedMission.type !== 'light') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up!
          setTimerActive(false);
          setGuidanceMessage('⏰ Time\'s up! Try again!');
          
          safeSetTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              setSelectedMission(null);
              setTimeRemaining(60);
              setLightsPlaced(0);
              setGuidanceMessage('');
            }
          }, 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, selectedMission, onComplete, setSelectedMission, setGuidanceMessage, safeSetTimeout]);

  // If not Light mission, return null functions
  if (!selectedMission || selectedMission.type !== 'light') {
    return {
      timeRemaining: 0,
      lightsPlaced: 0,
      timerActive: false,
      validatePlacement: () => true,
      getNextRequiredItem: () => null
    };
  }

  // Get next required item
  const getNextRequiredItem = () => {
    if (lightsPlaced >= requiredItems.length) return null;
    return requiredItems[lightsPlaced];
  };

  // Validate placement
  const validatePlacement = (decorationId, zoneId) => {
    const nextItem = getNextRequiredItem();
    
    if (!nextItem) return true; // All items placed

    // Check if correct item
    if (decorationId !== nextItem.id) {
      setGuidanceMessage('Wrong light! Follow the sequence! 💡');
      safeSetTimeout(() => {
        setGuidanceMessage(`Place ${getItemName(nextItem.id)} next!`);
      }, 2000);
      return false;
    }

    // Check if correct zone
    if (zoneId !== nextItem.zone) {
      setGuidanceMessage('Wrong place! Check the glowing zone! 💡');
      return false;
    }

    // Success!
    const newLightsPlaced = lightsPlaced + 1;
    setLightsPlaced(newLightsPlaced);

    // Highlight next zone
    if (newLightsPlaced < requiredItems.length) {
      const nextZone = requiredItems[newLightsPlaced].zone;
      setHighlightedZones(new Set([nextZone]));
    }

    // Success feedback
    setShowStepSuccess(true);
    setLastCompletedStep({
      emoji: '💡',
      successMessage: `Perfect! ${newLightsPlaced}/${requiredItems.length} lights placed!`
    });

    safeSetTimeout(() => setShowStepSuccess(false), 1500);

    // Check if mission complete
    if (newLightsPlaced >= requiredItems.length) {
      setTimerActive(false);
      safeSetTimeout(() => {
        const timeBonus = Math.floor(timeRemaining / 10);
        setMissionStars(prev => prev + 5 + timeBonus);
        setCompletedMissions(prev => ({ 
          ...prev, 
          [selectedMission.id]: true 
        }));
        
        setGuidanceMessage(`🎉 All lights placed with ${timeRemaining}s remaining! +${timeBonus} bonus stars!`);
        
        safeSetTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            setSelectedMission(null);
            setTimeRemaining(60);
            setLightsPlaced(0);
            setGuidanceMessage('');
          }
        }, 3000);
      }, 2000);
    } else {
      safeSetTimeout(() => {
        setGuidanceMessage(`Hurry! ${requiredItems.length - newLightsPlaced} more lights! ⏰`);
      }, 2000);
    }

    return true;
  };

  // Helper to get item name
  const getItemName = (itemId) => {
    const allItems = Object.values(DECORATION_CATEGORIES)
      .flatMap(cat => cat.items);
    const item = allItems.find(i => i.id === itemId);
    return item?.name || itemId;
  };

  return {
    timeRemaining,
    lightsPlaced,
    timerActive,
    validatePlacement,
    getNextRequiredItem
  };
}

export default LightChallengeMission;