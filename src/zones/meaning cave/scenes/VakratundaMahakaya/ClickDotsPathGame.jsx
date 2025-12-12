// ClickDotsPathGame.jsx - COMPLETE PROTECTED VERSION with Reload Support
import React, { useState, useRef, useEffect } from 'react';

const ClickDotsPathGame = ({
  onComplete,
  onProgress,
  mooshikaImage,
  disabled = false,
  showDebug = false,
  
  // Positioning props
  progressBarStyle = {},
  gameAreaStyle = {},
  showProgressBar = true,
  
  // 🛡️ Protection props
  modalOpen = false,
  
  // ✅ NEW: Reload/Resume props
  initialDot = 0,           // Which dot to start from (for reload)
  initialProgress = 0,      // Progress percentage (for display)
  isResuming = false        // Is this a reload/resume?
}) => {
  const svgRef = useRef(null);
  
  // ========== 🛡️ CLICK PROTECTION STATE ==========
  const lastClickTimeRef = useRef(0);
  const isProcessingClickRef = useRef(false);
  const activeTouchesRef = useRef(0);
  const [clickLocked, setClickLocked] = useState(false);

  // Curved path dots - matches the elephant trunk curve (END AT DOT 10)
  const pathDots = [
    { x: 120, y: 140, label: 'START' },
    { x: 160, y: 154, label: '1' },
    { x: 200, y: 163, label: '2' },
    { x: 250, y: 168, label: '3' },
    { x: 300, y: 172, label: '4' },
    { x: 350, y: 172, label: '5' },
    { x: 400, y: 165, label: '6' },
    { x: 440, y: 152, label: '7' },
    { x: 460, y: 135, label: '8' },
    { x: 430, y: 110, label: '9' },
    { x: 380, y: 90, label: '10' }
  ];
  
  // ========== 🔄 GAME STATE (with reload support) ==========
  const [currentDot, setCurrentDot] = useState(() => {
    console.log('🎮 ClickDotsPathGame: Initializing with dot', initialDot);
    return initialDot;
  });

  const [completedDots, setCompletedDots] = useState(() => {
    // ✅ Rebuild completed dots array from initialDot
    if (initialDot > 0) {
      const completed = [];
      for (let i = 1; i <= initialDot; i++) {
        completed.push(i);
      }
      console.log('🔄 ClickDotsPathGame: Restored completed dots:', completed);
      return completed;
    }
    return [];
  });

  const [mooshikaPosition, setMooshikaPosition] = useState(() => {
    // ✅ Start Mooshika at the correct dot
    const startDot = pathDots[initialDot] || pathDots[0];
    console.log('🐭 ClickDotsPathGame: Mooshika starting at dot', initialDot, startDot);
    return startDot;
  });

  const [isComplete, setIsComplete] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState(() => {
    // ✅ Show correct message based on progress
    if (initialDot === 0) {
      return 'Click dot 1 to start!';
    } else if (initialDot >= pathDots.length - 1) {
      return '🎉 Perfect! You traced the whole path!';
    } else {
      return `Great! Now click dot ${initialDot + 1}!`;
    }
  });

  const [wrongDotShake, setWrongDotShake] = useState(null);
  const [showSparkles, setShowSparkles] = useState(false);

  // ========== 🔍 DEBUG: Log when resuming ==========
  useEffect(() => {
    if (isResuming && initialDot > 0) {
      console.log('🔄 DOTS RESUME:', {
        initialDot,
        initialProgress,
        completedDots,
        mooshikaPosition,
        feedbackMessage
      });
    }
  }, [isResuming, initialDot]);

  const showFeedback = (message, duration = null) => {
    setFeedbackMessage(message);
    if (duration) {
      setTimeout(() => setFeedbackMessage(''), duration);
    }
  };

  // ========== 🛡️ PROTECTED DOT CLICK HANDLER ==========
  const handleDotClick = (index) => {
    const now = Date.now();
    
    // ========== 🛡️ PROTECTION LAYER 1: DISABLED CHECK ==========
    if (disabled) {
      console.log('🚫 DOT BLOCKED: Game is disabled!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 2: COMPLETION CHECK ==========
    if (isComplete) {
      console.log('🚫 DOT BLOCKED: Game already complete!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 3: COOLDOWN ==========
    // Faster cooldown (200ms) for smooth tracing feel
    if (now - lastClickTimeRef.current < 200) {
      console.log('🚫 DOT BLOCKED: Click too fast! Wait 200ms between dots');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 4: ANIMATION LOCK ==========
    if (clickLocked) {
      console.log('🚫 DOT BLOCKED: Animation playing!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 5: RACE CONDITION ==========
    if (isProcessingClickRef.current) {
      console.log('🚫 DOT BLOCKED: Already processing another dot!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 6: MULTI-TOUCH ==========
    if (activeTouchesRef.current > 1) {
      console.log('🚫 DOT BLOCKED: Multi-touch detected! (' + activeTouchesRef.current + ' fingers)');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 7: MODAL CHECK ==========
    if (modalOpen) {
      console.log('🚫 DOT BLOCKED: Modal is open!');
      return;
    }
    
    // ========== 🛡️ PROTECTION LAYER 8: SEQUENCE VALIDATION ==========
    // Check if clicking the correct next dot (sequential order enforced)
    if (index !== currentDot + 1) {
      console.log(`🚫 DOT BLOCKED: Wrong sequence! Expected dot ${currentDot + 1}, got ${index}`);
      
      // Show error feedback
      setWrongDotShake(index);
      showFeedback(`Oops! Click dot ${currentDot + 1} next!`, 2000);
      setTimeout(() => setWrongDotShake(null), 500);
      return;
    }
    
    // ========== ✅ ALL CHECKS PASSED - PROCESS CLICK ==========
    console.log(`✅ Dot ${index} click APPROVED!`);
    
    // Record this click and lock processing
    lastClickTimeRef.current = now;
    isProcessingClickRef.current = true;
    setClickLocked(true);
    
    // Correct dot!
    const newCompleted = [...completedDots, index];
    setCompletedDots(newCompleted);
    setCurrentDot(index);
    
    // Move Mooshika to this dot
    setMooshikaPosition(pathDots[index]);

    // Report progress
    const progressPercent = Math.round((index / (pathDots.length - 1)) * 100);
    if (onProgress) {
      onProgress(progressPercent, index);
    }

    // Check completion - dot 10 is the last dot (index 10)
    if (index === pathDots.length - 1) {
      setIsComplete(true);
      showFeedback('🎉 Perfect! You traced the whole path!');
      
      // Show sparkles
      setShowSparkles(true);
      
      // Trigger celebration after sparkles
      setTimeout(() => {
        setShowSparkles(false);
        isProcessingClickRef.current = false;
        setClickLocked(false);
        
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    } else {
      // Keep message visible, show next dot number
      showFeedback(`Great! Now click dot ${index + 1}!`);
      
      // ✅ Release lock after animation (FASTER - 400ms instead of 600ms)
      setTimeout(() => {
        isProcessingClickRef.current = false;
        setClickLocked(false);
      }, 400);
    }
  };

  const reset = () => {
    // Clear protection locks
    lastClickTimeRef.current = 0;
    isProcessingClickRef.current = false;
    setClickLocked(false);
    
    // Reset game state
    setCurrentDot(0);
    setCompletedDots([]);
    setMooshikaPosition(pathDots[0]);
    setIsComplete(false);
    setFeedbackMessage('Click dot 1 to start!');
    setWrongDotShake(null);
    setShowSparkles(false);
  };

  // Draw path segments between completed dots
  const renderPathSegments = () => {
    const segments = [];
    for (let i = 0; i < completedDots.length; i++) {
      const start = pathDots[completedDots[i - 1] || 0];
      const end = pathDots[completedDots[i]];
      
      segments.push(
        <line
          key={`segment-${i}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#00FF88"
          strokeWidth="8"
          strokeLinecap="round"
        />
      );
    }
    return segments;
  };

  // Convert SVG coordinates to container pixel coordinates
  const svgToContainerCoords = (svgX, svgY) => {
    if (!svgRef.current) return { x: svgX, y: svgY };
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = svgRef.current.viewBox.baseVal;
    
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;
    
    return {
      x: (svgX / viewBox.width) * 100,
      y: (svgY / viewBox.height) * 100
    };
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto',
      ...gameAreaStyle
    }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes mooshikaHop {
          0% { transform: translate(-50%, -50%) scale(1); }
          40% { transform: translate(-50%, -60%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-30px) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Feedback Message - Always Visible */}
      {feedbackMessage && (
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #8B4513, #A0522D)',
          color: '#FFD700',
          padding: '12px 24px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '3px solid #D2691E',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          textAlign: 'center',
          zIndex: 10,
          whiteSpace: 'nowrap',
          minWidth: '200px'
        }}>
          {feedbackMessage}
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && (
        <div style={{
          width: '70%',
          maxWidth: '400px',
          height: '16px',
          background: 'linear-gradient(135deg, #8B4513, #654321)',
          borderRadius: '25px',
          padding: '3px',
          border: '3px solid #D2691E',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          margin: '0 auto 10px',
          position: 'relative',
          ...progressBarStyle
        }}>
          <div style={{
            width: `${(currentDot / (pathDots.length - 1)) * 100}%`,
            height: '100%',
            background: currentDot < 4 ? 
              'linear-gradient(90deg, #FF6B6B, #FF8E53)' :
              currentDot < 8 ?
              'linear-gradient(90deg, #4ECDC4, #44A08D)' :
              'linear-gradient(90deg, #FFD700, #FFA500)',
            borderRadius: '20px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(255,215,0,0.6)'
          }} />
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            {currentDot} / 10
          </div>
        </div>
      )}

      {/* ========== 🛡️ PROTECTED GAME CANVAS ========== */}
      <div 
        style={{ position: 'relative', height: '250px' }}
        // ✅ Multi-touch protection for iPad
        onTouchStart={(e) => {
          activeTouchesRef.current = e.touches.length;
          if (e.touches.length > 1) {
            console.log('🚫 DOTS MULTI-TOUCH BLOCKED: Detected ' + e.touches.length + ' fingers');
            e.preventDefault();
          }
        }}
        onTouchEnd={() => {
          activeTouchesRef.current = 0;
        }}
      >
        <svg 
          ref={svgRef}
          viewBox="0 0 600 200"
          style={{ 
            width: '100%', 
            height: '100%', 
            background: 'transparent'
          }}
        >
          {/* Background guide path (faded) */}
          <path
            d="M 120 140 Q 200 165 320 175 Q 420 165 450 135 Q 460 115 380 90"
            stroke="rgba(255, 140, 66, 0.3)"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10,5"
          />

          {/* Completed path segments */}
          {renderPathSegments()}

          {/* Dots */}
          {pathDots.map((dot, index) => {
            const isStart = index === 0;
            const isEnd = index === pathDots.length - 1;
            const isCompleted = completedDots.includes(index);
            const isNext = index === currentDot + 1;
            const isWrongShake = wrongDotShake === index;

            let fillColor = '#999999';
            let strokeColor = '#666666';
            let radius = 18;
            let showGlow = false;

            if (isStart) {
              fillColor = '#00FF00';
              strokeColor = '#00CC00';
              radius = 22;
            } else if (isEnd) {
              fillColor = isComplete ? '#FFD700' : '#FF4444';
              strokeColor = isComplete ? '#FFA500' : '#CC0000';
              radius = 25;
              showGlow = isNext;
            } else if (isCompleted) {
              fillColor = '#00FF88';
              strokeColor = '#00CC66';
            } else if (isNext) {
              fillColor = '#FFD700';
              strokeColor = '#FFA500';
              radius = 22;
              showGlow = true;
            }

            return (
              <g key={index}>
                {/* Glow effect for next dot */}
                {showGlow && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={radius + 6}
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values={`${radius + 4};${radius + 8};${radius + 4}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.6;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Dot circle */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="4"
                  style={{
                    cursor: isNext && !isComplete ? 'pointer' : 'default',
                    animation: isWrongShake ? 'shake 0.5s ease-in-out' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    // ✅ Multi-touch check before processing
                    if (activeTouchesRef.current > 1) {
                      console.log('🚫 Dot click blocked: Multi-touch detected');
                      return;
                    }
                    handleDotClick(index);
                  }}
                />

                {/* Dot label */}
                <text
                  x={dot.x}
                  y={dot.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize={isStart || isEnd ? "11" : "14"}
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {dot.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Mooshika Character */}
    {/* Mooshika Character */}
{mooshikaImage && (
  <div style={{
    position: 'absolute',
    // ✅ FIX: Use simple positioning on initial render
    left: currentDot === 0 && completedDots.length === 0 
      ? '20%'  // Start position (simple, no calculation needed)
      : `${svgToContainerCoords(mooshikaPosition.x, mooshikaPosition.y).x}%`,
    top: currentDot === 0 && completedDots.length === 0
      ? '70%'  // Start position (simple, no calculation needed)
      : `${svgToContainerCoords(mooshikaPosition.x, mooshikaPosition.y).y}%`,
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            zIndex: 10,
            pointerEvents: 'none',
            // ✅ FIX: Faster animation (400ms), no transition on reload
            transition: completedDots.length > 0 && !isComplete ? 'left 0.4s ease-out, top 0.4s ease-out' : 'none',
            animation: completedDots.length > 0 && !isComplete ? 'mooshikaHop 0.4s ease-out' : 'none'
          }}>
        <img
  src={mooshikaImage}
  alt="Mooshika"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
    display: 'block'  // ✅ ADD: Force visible
  }}
  onLoad={() => console.log('🐭 Mooshika image loaded and visible')}
  onError={() => console.error('❌ Mooshika failed to load')}
/>
          </div>
        )}

        {/* Completion Sparkles */}
        {showSparkles && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 20
          }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${50 + Math.cos(i * 18 * Math.PI / 180) * 35}%`,
                  top: `${30 + Math.sin(i * 18 * Math.PI / 180) * 35}%`,
                  fontSize: '24px',
                  animation: `sparkleFloat 2s ease-out ${i * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                {['⭐', '✨', '💫', '🌟'][i % 4]}
              </div>
            ))}
          </div>
        )}

        {/* Debug Info 
        {showDebug && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            zIndex: 20
          }}>
            <div>Current: {currentDot}</div>
            <div>Progress: {Math.round((currentDot / (pathDots.length - 1)) * 100)}%</div>
            <div>Complete: {String(isComplete)}</div>
            <div>Locked: {String(clickLocked)}</div>
            <div>Touches: {activeTouchesRef.current}</div>
            <div>Resuming: {String(isResuming)}</div>
          </div>
        )}*/}
      </div>

      {/* Reset Button */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            color: 'white',
            border: '2px solid #FF4444',
            padding: '8px 20px',
            borderRadius: '15px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          🔄 Reset Path
        </button>
      </div>
    </div>
  );
};

export default ClickDotsPathGame;
