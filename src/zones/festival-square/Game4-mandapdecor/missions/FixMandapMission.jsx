import { useState, useEffect } from 'react';

function FixMandapMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setShowSparkle,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  DECORATION_CATEGORIES,
  onComplete,
  safeSetTimeout
}) {
  const [wrongItemsMap, setWrongItemsMap] = useState(new Map());
  const [selectedWrongItem, setSelectedWrongItem] = useState(null);
  const [fixedCount, setFixedCount] = useState(0);

  // Initialize wrong placements when mission starts
  useEffect(() => {
    if (selectedMission?.type === 'fix') {
      console.log('🔧 Initializing Fix Mandap mission');
      
      const wrongMap = new Map();
      const placements = new Map();
      
      selectedMission.wrongPlacements.forEach((item, index) => {
        const decorationData = Object.values(DECORATION_CATEGORIES)
          .flatMap(cat => cat.items)
          .find(i => i.id === item.id);
        
        if (decorationData) {
          const wrongItem = {
            ...decorationData,
            wrongZone: item.wrongZone,
            correctZone: item.correctZone,
            isWrong: true,
            fixId: `fix-${index}`
          };
          
          wrongMap.set(`fix-${index}`, wrongItem);
          
          const zoneItems = placements.get(item.wrongZone) || [];
          zoneItems.push(wrongItem);
          placements.set(item.wrongZone, zoneItems);
        }
      });
      
      setWrongItemsMap(wrongMap);
      setGameState(prev => ({
        ...prev,
        placedDecorations: placements
      }));
      setFixedCount(0);
      setGuidanceMessage('Tap the RED glowing decorations to fix them!');
    }
  }, [selectedMission, DECORATION_CATEGORIES, setGameState, setGuidanceMessage]);

  // If not Fix mission, return null functions
  if (!selectedMission || selectedMission.type !== 'fix') {
    return {
      wrongItemsMap: new Map(),
      selectedWrongItem: null,
      fixedCount: 0,
      handleWrongItemClick: () => {},
      handleFix: () => false
    };
  }

  // Handle clicking a wrong decoration
  const handleWrongItemClick = (decoration) => {
    console.log('🔧 Clicked wrong item:', decoration.id);
    setSelectedWrongItem(decoration);
    setGuidanceMessage('Good! Now tap the GREEN glowing spot to fix it!');
    setHighlightedZones(new Set([decoration.correctZone]));
  };

  // Handle fixing (placing in correct zone)
  const handleFix = (zoneId) => {
    if (!selectedWrongItem) return false;
    
    if (zoneId !== selectedWrongItem.correctZone) {
      setGuidanceMessage('Not there! Tap the GREEN glowing spot!');
      return false;
    }
    
    // ✅ CORRECT ZONE!
    console.log('🔧 Fixing item:', selectedWrongItem.id, 'to zone:', zoneId);
    
    // Remove from wrong zone
    const newPlacements = new Map(gameState.placedDecorations);
    const wrongZoneItems = newPlacements.get(selectedWrongItem.wrongZone) || [];
    const filteredWrong = wrongZoneItems.filter(
      d => d.fixId !== selectedWrongItem.fixId
    );
    
    if (filteredWrong.length > 0) {
      newPlacements.set(selectedWrongItem.wrongZone, filteredWrong);
    } else {
      newPlacements.delete(selectedWrongItem.wrongZone);
    }
    
    // Add to correct zone
    const correctZoneItems = newPlacements.get(zoneId) || [];
    correctZoneItems.push({ 
      ...selectedWrongItem, 
      isFixed: true, 
      isWrong: false 
    });
    newPlacements.set(zoneId, correctZoneItems);
    
    setGameState(prev => ({
      ...prev,
      placedDecorations: newPlacements
    }));
    
    // Update progress
    const newFixedCount = fixedCount + 1;
    setFixedCount(newFixedCount);
    
    // Success feedback
    setShowStepSuccess(true);
    setLastCompletedStep({
      emoji: '🔧',
      successMessage: `Perfect! ${newFixedCount}/5 decorations fixed!`
    });
    
    setShowSparkle(zoneId);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowStepSuccess(false);
    }, 2000);
    
    // Clear selection
    setSelectedWrongItem(null);
    setHighlightedZones(new Set());
    
    // Check if mission complete
    if (newFixedCount >= 5) {
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
          setFixedCount(0);
          setWrongItemsMap(new Map());
          setGuidanceMessage('');
        }
      }, 2500);
    } else {
      safeSetTimeout(() => {
        setGuidanceMessage(
          `Great! ${5 - newFixedCount} more to fix. Tap the next RED decoration!`
        );
      }, 2000);
    }
    
    return true;
  };

  return {
    wrongItemsMap,
    selectedWrongItem,
    fixedCount,
    handleWrongItemClick,
    handleFix
  };
}

export default FixMandapMission;