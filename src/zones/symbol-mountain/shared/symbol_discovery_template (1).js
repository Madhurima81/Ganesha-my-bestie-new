// ============================================
// SYMBOL DISCOVERY PATTERN - COMPLETE TEMPLATE
// Use this for all Symbol Mountain scenes
// ============================================

// ==================== IMPORTS ====================
import React, { useState, useEffect, useRef } from 'react';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';

// Symbol images (colored versions for sidebar)
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.png';

// Mission images (before/after states)
import mooshikaBefore from './assets/images/mooshika-before.png';
import mooshikaAfter from './assets/images/mooshika-after.png';
import modakBefore from './assets/images/modak-before.png';
import modakAfter from './assets/images/modak-after.png';
import bellyBefore from './assets/images/belly-before.png';
import bellyAfter from './assets/images/belly-after.png';

// ==================== POWER CONFIG ====================
const powerConfig = {
  mooshika: { 
    name: 'Divine Guidance', 
    image: symbolMooshikaColored,
    color: '#FF69B4' 
  },
  modak: { 
    name: 'Sweet Blessing', 
    image: symbolModakColored,
    color: '#FFD700' 
  },
  belly: { 
    name: 'Cosmic Container', 
    image: symbolBellyColored,
    color: '#FF8C42' 
  }
};

// ==================== IMAGE MAPPING ====================
const missionImages = {
  mooshika: { before: mooshikaBefore, after: mooshikaAfter },
  modak: { before: modakBefore, after: modakAfter },
  belly: { before: bellyBefore, after: bellyAfter }
};

// ==================== STATE VARIABLES ====================
const [showHintGlow, setShowHintGlow] = useState(false);
const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
const [showPowerModal, setShowPowerModal] = useState(false);
const [showPowerMission, setShowPowerMission] = useState(false);
const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);

// ==================== HELPER FUNCTION ====================
const getNextDiscoveryText = (currentSymbol) => {
  const nextActions = {
    mooshika: '🍬 Discover Modak',
    modak: '🌟 Discover Belly',
    belly: '✨ End Scene'
  };
  return nextActions[currentSymbol] || '➡️ Continue';
};

// ==================== AUTO-GLOW TIMER ====================
// Only starts AFTER "Start Mission" clicked (welcomeShown = true)
useEffect(() => {
  const glowPhases = [
    PHASES.MOOSHIKA_SEARCH,
    PHASES.MODAKS_UNLOCKED,
    PHASES.ROCK_VISIBLE
  ];
  
  if (glowPhases.includes(sceneState?.phase) && 
      sceneState?.welcomeShown && 
      !showPowerModal && 
      !showPowerMission) {
    const timer = setTimeout(() => {
      setShowHintGlow(true);
    }, 20000); // 20 seconds
    
    return () => clearTimeout(timer);
  } else {
    setShowHintGlow(false);
  }
}, [sceneState?.phase, sceneState?.welcomeShown, showPowerModal, showPowerMission]);

// ==================== SYMBOL LEARNING FLOW ====================
const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`${symbolKey} symbol learned`);
  
  // Step 1: Show big centered symbol + text (5 seconds)
  setShowCenteredSymbol(symbolKey);
  
  setTimeout(() => {
    // Step 2: Hide centered, start fly animation to sidebar
    setShowCenteredSymbol(null);
    setShowSparkle(`${symbolKey}-to-sidebar`);
    
    sceneActions.updateState({
      discoveredSymbols: {
        ...sceneState.discoveredSymbols,
        [symbolKey]: true
      }
    });
    
    setTimeout(() => {
      // Step 3: Symbol in sidebar, show power modal immediately
      setShowSparkle(null);
      setCurrentMissionSymbol(symbolKey);
      setShowPowerModal(true);
      
    }, 2000);
  }, 5000); // 5 seconds for symbol celebration
};

// ==================== SAVE ANIMAL HANDLER ====================
const handleSaveAnimal = () => {
  setShowPowerModal(false);
  setShowPowerMission(true);
};

// ==================== CONTINUE LEARNING HANDLER ====================
const handleContinueLearning = () => {
  setShowPowerModal(false);
  const symbolKey = currentMissionSymbol;
  
  if (symbolKey === 'mooshika') {
    // Show modaks with sparkles
    setTimeout(() => {
      setShowSparkle('modaks-appearing');
    }, 500);
    
    setTimeout(() => {
      sceneActions.updateState({
        modaksUnlocked: true,
        basketVisible: true,
        phase: PHASES.MODAKS_UNLOCKED
      });
      setTimeout(() => setShowSparkle(null), 2000);
    }, 1500);
    
  } else if (symbolKey === 'modak') {
    sceneActions.updateState({
      rockVisible: true,
      phase: PHASES.ROCK_VISIBLE
    });
    
  } else if (symbolKey === 'belly') {
    // Show GameCoach message FIRST
    showMessage(`Amazing work, ${profileName}! You've discovered Mooshika, Modaks, and Ganesha's cosmic belly!`, {
      duration: 6000,
      animation: 'bounce',
      position: 'top-right',
      source: 'scene',
      messageType: 'celebration'
    });
    
    // THEN trigger scene completion after message shows
    setTimeout(() => {
      sceneActions.updateState({
        phase: PHASES.COMPLETE,
        stars: 8,
        completed: true,
        progress: { percentage: 100, starsEarned: 8, completed: true }
      });
      setTimeout(() => setShowSparkle('final-fireworks'), 500);
    }, 6500);
  }
};

// ==================== MISSION COMPLETE HANDLER ====================
const handleMissionComplete = (symbolKey) => {
  console.log('Mission complete for:', symbolKey);
  setShowPowerMission(false);
  
  // Auto-continue to next phase (same as handleContinueLearning)
  if (symbolKey === 'mooshika') {
    setTimeout(() => {
      setShowSparkle('modaks-appearing');
    }, 500);
    
    setTimeout(() => {
      sceneActions.updateState({
        modaksUnlocked: true,
        basketVisible: true,
        phase: PHASES.MODAKS_UNLOCKED
      });
      setTimeout(() => setShowSparkle(null), 2000);
    }, 1500);
    
  } else if (symbolKey === 'modak') {
    sceneActions.updateState({
      rockVisible: true,
      phase: PHASES.ROCK_VISIBLE
    });
    
  } else if (symbolKey === 'belly') {
    // Show GameCoach message FIRST
    showMessage(`Amazing work, ${profileName}! You've discovered all three symbols!`, {
      duration: 6000,
      animation: 'bounce',
      position: 'top-right',
      source: 'scene',
      messageType: 'celebration'
    });
    
    setTimeout(() => {
      sceneActions.updateState({
        phase: PHASES.COMPLETE,
        stars: 8,
        completed: true,
        progress: { percentage: 100, starsEarned: 8, completed: true }
      });
      setTimeout(() => setShowSparkle('final-fireworks'), 500);
    }, 6500);
  }
};

// ==================== JSX: PHASE HEADERS ====================
// Always visible instruction banner at top of screen
{!showPowerModal && !showPowerMission && sceneState?.welcomeShown && (
  <>
    {sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.mooshikaFound && (
      <div className="phase-header">
        WHERE IS MOOSHIKA? Click the mounds!
      </div>
    )}
    
    {sceneState.phase === PHASES.MODAKS_UNLOCKED && !sceneState.basketFull && (
      <div className="phase-header">
        HELP MOOSHIKA! Click modaks to collect!
      </div>
    )}
    
    {sceneState.phase === PHASES.ROCK_VISIBLE && !sceneState.rockTransformed && (
      <div className="phase-header">
        FEED GANESHA! Click modaks from basket!
      </div>
    )}
  </>
)}

// ==================== JSX: PHASE HEADERS ====================
// Always visible instruction banner at top of screen
{!showPowerModal && !showPowerMission && sceneState?.welcomeShown && (
  <>
    {sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.mooshikaFound && (
      <div className="phase-header">
        WHERE IS MOOSHIKA? Click the mounds!
      </div>
    )}
    
    {sceneState.phase === PHASES.MODAKS_UNLOCKED && !sceneState.basketFull && (
      <div className="phase-header">
        HELP MOOSHIKA! Click modaks to collect!
      </div>
    )}
    
    {sceneState.phase === PHASES.ROCK_VISIBLE && !sceneState.rockTransformed && (
      <div className="phase-header">
        FEED GANESHA! Click modaks from basket!
      </div>
    )}
  </>
)}

// ==================== JSX: OPENING MODAL ====================
{sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown && (
  <>
    {/* Background preview items */}
    <div style={{
      position: 'absolute',
      left: '20%',
      top: '50%',
      animation: 'gentle-glow 3s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={mudMound} alt="Mysterious Mound" style={{width: '70px', opacity: 0.8}} />
    </div>
    
    <div style={{
      position: 'absolute',
      right: '25%',
      top: '45%',
      animation: 'gentle-breathe 4s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={modak1} alt="Golden Modak" style={{width: '50px', opacity: 0.9}} />
    </div>

    {/* Opening Modal */}
    <div style={{
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '30px 40px',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 100,
      maxWidth: '480px'
    }}>
      <div style={{
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: '12px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        Help Ganesha Save the Forest!
      </div>
      
      <div style={{
        fontSize: '16px',
        color: '#FF6B6B',
        marginBottom: '15px',
        fontWeight: '600'
      }}>
        3 magical symbols have special powers!
      </div>
      
      <div style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '25px',
        lineHeight: '1.5'
      }}>
        Discover <strong>Mooshika, Modak & Belly</strong> to unlock their magic and rescue trapped animals
      </div>
      
      <button
        onClick={() => {
          sceneActions.updateState({ welcomeShown: true });
        }}
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          border: 'none',
          color: 'white',
          padding: '14px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '25px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Start Mission!
      </button>
    </div>
  </>
)}

// ==================== JSX: SYMBOL DISCOVERY CELEBRATION ====================
{showCenteredSymbol && (
  <>
    {/* Dark background overlay */}
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 199,
      animation: 'fadeIn 0.3s ease-out'
    }} />
    
    {/* Symbol + Text + Sparkles */}
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 200,
      textAlign: 'center',
      animation: 'symbolAppear 0.5s ease-out'
    }}>
      {/* Symbol Image */}
      <img 
        src={powerConfig[showCenteredSymbol]?.image}
        alt={showCenteredSymbol}
        style={{
          width: '180px',
          height: '180px',
          filter: `drop-shadow(0 0 40px ${powerConfig[showCenteredSymbol]?.color})`,
          animation: 'symbolGlow 2s ease-in-out infinite alternate',
          marginBottom: '25px'
        }}
      />
      
      {/* Sparkles */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        pointerEvents: 'none'
      }}>
        <SparkleAnimation
          type="glitter"
          count={30}
          color={powerConfig[showCenteredSymbol]?.color}
          size={12}
          duration={3000}
          fadeOut={true}
          area="full"
        />
      </div>
      
      {/* Text Label */}
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: `3px 3px 6px ${powerConfig[showCenteredSymbol]?.color}`,
        animation: 'textPulse 1.5s ease-in-out infinite',
        letterSpacing: '2px'
      }}>
        {powerConfig[showCenteredSymbol]?.name}
      </div>
    </div>
  </>
)}

// ==================== JSX: POWER MODAL ====================
{showPowerModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 100%)',
      borderRadius: '25px',
      padding: '40px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      {/* NO CLOSE BUTTON - User must choose */}
      
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#8B4513', 
        marginBottom: '25px' 
      }}>
        {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
      </div>

      {/* Layout: Text left, Symbol+Buttons right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        {/* Left: Description */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '15px',
            lineHeight: '1.6'
          }}>
            You can now use this power to help animals in need!
          </div>
          <div style={{
            fontSize: '14px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            Choose your next action:
          </div>
        </div>

        {/* Right: Symbol + Buttons */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px', 
          alignItems: 'center' 
        }}>
          <img 
            src={powerConfig[currentMissionSymbol]?.image}
            alt="power symbol"
            style={{
              width: '100px',
              height: '100px',
              filter: `drop-shadow(0 0 20px ${powerConfig[currentMissionSymbol]?.color})`,
              animation: 'powerPulse 2s ease-in-out infinite',
              marginBottom: '10px'
            }}
          />
          
          <button 
            onClick={handleSaveAnimal}
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🐾 Save an Animal
          </button>
          
          <button 
            onClick={handleContinueLearning}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(78,205,196,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {getNextDiscoveryText(currentMissionSymbol)}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

// ==================== JSX: SYMBOL POWER MISSION ====================
<SymbolPowerMission
  show={showPowerMission}
  symbolKey={currentMissionSymbol}
  beforeImage={missionImages[currentMissionSymbol]?.before}
  afterImage={missionImages[currentMissionSymbol]?.after}
  powerConfig={powerConfig[currentMissionSymbol]}
  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowPowerMission(false);
    setShowPowerModal(true);
  }}
/>

// ==================== CSS ANIMATIONS ====================
/*
Add to your CSS file:

.phase-header {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FF6B6B, #FFD93D);
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  z-index: 100;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  animation: gentle-bounce 2s infinite;
  text-align: center;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes symbolAppear {
  0% { 
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes symbolGlow {
  0% { 
    filter: drop-shadow(0 0 30px currentColor) brightness(1);
    transform: scale(1);
  }
  100% { 
    filter: drop-shadow(0 0 60px currentColor) brightness(1.4);
    transform: scale(1.05);
  }
}

@keyframes textPulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes powerPulse {
  0%, 100% { 
    transform: scale(1);
  }
  50% { 
    transform: scale(1.08);
  }
}

@keyframes gentle-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes gentle-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
*/

// ==================== FLOW SUMMARY ====================
/*
1. Opening Modal → Sets mission context ("Save the Forest!")
2. User clicks "Start Mission" → welcomeShown = true → Auto-glow timer starts
3. Phase Header appears → Tells user what to do (e.g., "WHERE IS MOOSHIKA? Click the mounds!")
4. User finds symbol → completeSymbolLearning() triggered
5. Big symbol celebration (5 seconds) with sparkles
6. Symbol flies to sidebar (2 seconds)
7. Power Modal appears immediately (no speech bubble, no close button)
8. User chooses: Save Animal OR Discover Next Symbol
9. If Save Animal → SymbolPowerMission modal
10. If Discover Next → Progress to next game phase → New phase header appears
11. After last symbol → GameCoach message → Wait 8.5s → Fireworks
12. Scene completion modal

KEY ELEMENTS:
- Phase headers = Persistent instruction at top (hidden during modals)
- Auto-glow = Starts 20 seconds AFTER "Start Mission" (not on page load)
- Symbol celebration = 5 seconds with dark overlay + sparkles
- Power modal = No close button, forces user to choose action
- GameCoach = Shows BEFORE fireworks for final celebration
*/

