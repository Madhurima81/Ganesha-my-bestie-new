// InteractiveMaze.jsx - Standalone Test Component
import React, { useState, useRef } from 'react';
import './InteractiveMaze.css';

// Import actual images from your assets folder
import trunkGuideImg from '../assets/images/trunk-guide.png';
import pathSegment1 from '../assets/images/path-segment-1.png';
import pathSegment2 from '../assets/images/path-segment-2.png';
import pathSegment3 from '../assets/images/path-segment-3.png';
import pathSegment4 from '../assets/images/path-segment-4.png';
import pathSegment5 from '../assets/images/path-segment-5.png';

// Using your actual images
const SEGMENT_IMAGES = {
  segment1: pathSegment1,
  segment2: pathSegment2,
  segment3: pathSegment3,
  segment4: pathSegment4,
  segment5: pathSegment5,
  trunkGuide: trunkGuideImg
};

const SEGMENT_STATES = {
  INACTIVE: 'inactive',
  READY: 'ready', 
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

const InteractiveMaze = () => {
  const [gameState, setGameState] = useState({
    currentSegment: 0,
    nextAvailableSegment: 1,
    segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'], // FIXED: Segment 1 ready first
    completedSegments: [false, false, false, false, false],
    mazeStarted: false,
    mazeCompleted: false,
    trunkPosition: { segment: 0, x: 20, y: 20 }, // NEW: Track trunk coordinates
    segmentProgress: [0, 0, 0, 0, 0], // NEW: Track completion percentage of each segment (0-100)
    isAnimating: false // NEW: Prevent clicks during animation
  });

  const [showSparkle, setShowSparkle] = useState(null);
  const [messages, setMessages] = useState([]);
  const timeoutsRef = useRef([]);

  // Add message to log
  const addMessage = (message) => {
    console.log(`🐘 MAZE: ${message}`);
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-5));
  };

  // Safe timeout
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Start maze when trunk guide clicked
  const handleTrunkGuideClick = () => {
    if (gameState.mazeStarted) return;
    
    addMessage("Trunk guide clicked - Starting maze!");
    
    setGameState(prev => ({
      ...prev,
      mazeStarted: true,
      segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'], // FIXED: Segment 1 ready first
      nextAvailableSegment: 1,
      trunkPosition: { segment: 0, x: 20, y: 20 } // Position trunk at start
    }));

    setShowSparkle('trunk-guide-clicked');
    safeSetTimeout(() => setShowSparkle(null), 1000);
  };

  // Handle segment clicks with progressive animation
  const handleSegmentClick = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    // Prevent clicks during animation
    if (gameState.isAnimating) {
      addMessage("⏳ Please wait for current animation to complete");
      return;
    }
    
    addMessage(`Segment ${segmentNumber} clicked`);

    // Check if this is the correct segment
    if (segmentNumber !== gameState.nextAvailableSegment) {
      addMessage(`❌ Wrong segment! Expected: ${gameState.nextAvailableSegment}, clicked: ${segmentNumber}`);
      
      // Show error effect
      setShowSparkle('wrong-click');
      safeSetTimeout(() => {
        setShowSparkle(`hint-segment-${gameState.nextAvailableSegment}`);
        safeSetTimeout(() => setShowSparkle(null), 2000);
      }, 500);
      return;
    }

    // Correct segment clicked!
    addMessage(`✅ Correct! Trunk traveling through segment ${segmentNumber}`);
    animateProgressivePathTracing(segmentIndex);
  };

  // NEW: Progressive path tracing animation
  const animateProgressivePathTracing = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    // Start animation
    setGameState(prev => ({
      ...prev,
      isAnimating: true
    }));
    
    // Set segment to active state
    const newStates = [...gameState.segmentStates];
    newStates[segmentIndex] = SEGMENT_STATES.ACTIVE;
    
    setGameState(prev => ({
      ...prev,
      segmentStates: newStates
    }));

    // Progressive filling animation (0% to 100% over 3 seconds)
    let progress = 0;
    const fillInterval = setInterval(() => {
      progress += 5; // Increment by 5% each step
      
      // Update segment progress
      const newProgress = [...gameState.segmentProgress];
      newProgress[segmentIndex] = progress;
      
      setGameState(prev => ({
        ...prev,
        segmentProgress: newProgress
      }));

      // Show moving trunk effect
      if (progress % 20 === 0) { // Every 20% show trunk movement
        setShowSparkle(`trunk-moving-${segmentNumber}-${progress}`);
        safeSetTimeout(() => setShowSparkle(null), 300);
      }

      // Complete when 100%
      if (progress >= 100) {
        clearInterval(fillInterval);
        completeSegmentWithTrunkMovement(segmentIndex);
      }
    }, 120); // 3 seconds total (60 steps * 50ms = 3000ms)

    timeoutsRef.current.push(fillInterval);
  };

  // NEW: Complete segment and move trunk to next position
  const completeSegmentWithTrunkMovement = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    addMessage(`🎉 Segment ${segmentNumber} path traced! Moving trunk to next position...`);

    // Mark segment as completed
    const newCompleted = [...gameState.completedSegments];
    newCompleted[segmentIndex] = true;
    
    const newStates = [...gameState.segmentStates];
    newStates[segmentIndex] = SEGMENT_STATES.COMPLETED;
    
    // Prepare next segment (if exists)
    if (segmentNumber < 5) {
      newStates[segmentNumber] = SEGMENT_STATES.READY;
    }

    // Calculate trunk position for next segment
    const nextTrunkPosition = getNextTrunkPosition(segmentNumber);

    setGameState(prev => ({
      ...prev,
      currentSegment: segmentNumber,
      completedSegments: newCompleted,
      segmentStates: newStates,
      nextAvailableSegment: segmentNumber < 5 ? segmentNumber + 1 : null,
      trunkPosition: nextTrunkPosition,
      mazeCompleted: segmentNumber >= 5,
      isAnimating: false // Re-enable clicks
    }));

    // Show completion celebration
    setShowSparkle(`segment-complete-${segmentNumber}`);
    safeSetTimeout(() => setShowSparkle(null), 1500);

    // Trunk movement celebration
    if (segmentNumber < 5) {
      safeSetTimeout(() => {
        setShowSparkle(`trunk-arrival-${segmentNumber + 1}`);
        addMessage(`🐘 Trunk arrived at Segment ${segmentNumber + 1} entrance!`);
        safeSetTimeout(() => setShowSparkle(null), 1000);
      }, 800);
    }

    // Check if maze is complete
    if (segmentNumber >= 5) {
      safeSetTimeout(() => {
        addMessage("🏆 MAZE COMPLETED! All paths traced by Ganesha's trunk!");
        setShowSparkle('maze-complete');
        safeSetTimeout(() => setShowSparkle(null), 3000);
      }, 1000);
    }
  };

  // NEW: Calculate trunk position for next segment
  const getNextTrunkPosition = (completedSegment) => {
    const positions = {
      0: { x: 20, y: 20 }, // Starting position
      1: { x: 200, y: 80 }, // End of segment 1, start of segment 2
      2: { x: 150, y: 180 }, // End of segment 2, start of segment 3  
      3: { x: 350, y: 220 }, // End of segment 3, start of segment 4
      4: { x: 280, y: 300 }, // End of segment 4, start of segment 5
      5: { x: 430, y: 340 }  // Final treasure position
    };
    
    return positions[completedSegment] || positions[0];
  };

  // Complete segment connection
  const completeSegmentConnection = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    addMessage(`🎉 Segment ${segmentNumber} completed!`);

    // Mark segment as completed
    const newCompleted = [...gameState.completedSegments];
    newCompleted[segmentIndex] = true;
    
    const newStates = [...gameState.segmentStates];
    newStates[segmentIndex] = SEGMENT_STATES.COMPLETED;
    
    // Prepare next segment (if exists)
    if (segmentNumber < 5) {
      newStates[segmentNumber] = SEGMENT_STATES.READY;
    }

    setGameState(prev => ({
      ...prev,
      currentSegment: segmentNumber,
      completedSegments: newCompleted,
      segmentStates: newStates,
      nextAvailableSegment: segmentNumber < 5 ? segmentNumber + 1 : null,
      trunkPosition: { segment: segmentNumber, animating: false },
      mazeCompleted: segmentNumber >= 5
    }));

    // Show completion sparkle
    setShowSparkle(`segment-complete-${segmentNumber}`);
    safeSetTimeout(() => setShowSparkle(null), 1500);

    // Check if maze is complete
    if (segmentNumber >= 5) {
      safeSetTimeout(() => {
        addMessage("🏆 MAZE COMPLETED! All segments connected!");
        setShowSparkle('maze-complete');
        safeSetTimeout(() => setShowSparkle(null), 3000);
      }, 1000);
    }
  };

  // Reset maze
  const resetMaze = () => {
    addMessage("🔄 Resetting maze...");
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    
    setGameState({
      currentSegment: 0,
      nextAvailableSegment: 1,
      segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'], // FIXED: Consistent with initial state
      completedSegments: [false, false, false, false, false],
      mazeStarted: false,
      mazeCompleted: false,
      trunkPosition: { segment: 0, x: 20, y: 20 }, // Reset trunk position
      segmentProgress: [0, 0, 0, 0, 0], // Reset all progress
      isAnimating: false
    });
    
    setShowSparkle(null);
    setMessages([]);
  };

  // Render segments with progressive filling
  const renderSegments = () => {
    const segmentImages = [
      SEGMENT_IMAGES.segment1,
      SEGMENT_IMAGES.segment2,
      SEGMENT_IMAGES.segment3,
      SEGMENT_IMAGES.segment4,
      SEGMENT_IMAGES.segment5
    ];

    return segmentImages.map((imageSrc, index) => {
      const segmentNumber = index + 1;
      const state = gameState.segmentStates[index];
      const isClickable = state === SEGMENT_STATES.READY && !gameState.isAnimating;
      const progress = gameState.segmentProgress[index];
      
      return (
        <div
          key={index}
          className={`path-segment segment-${segmentNumber} ${state}`}
          onClick={() => isClickable && handleSegmentClick(index)}
          style={{ cursor: isClickable ? 'pointer' : 'default' }}
        >
          <img src={imageSrc} alt={`Path segment ${segmentNumber}`} />
          
          {/* NEW: Progressive fill overlay */}
          {progress > 0 && (
            <div 
              className="segment-progress-fill"
              style={{
                width: `${progress}%`,
                background: state === SEGMENT_STATES.ACTIVE 
                  ? 'linear-gradient(to right, rgba(255, 215, 0, 0.7), rgba(255, 140, 0, 0.8))'
                  : 'linear-gradient(to right, rgba(50, 205, 50, 0.6), rgba(34, 139, 34, 0.7))'
              }}
            />
          )}
          
          {/* State indicator */}
          <div className="segment-state-indicator">
            {state === 'ready' && !gameState.isAnimating && '✨'}
            {state === 'active' && '🔄'}
            {state === 'completed' && '✅'}
            {gameState.isAnimating && state === 'ready' && '⏳'}
          </div>
          
          {/* Sparkle effects */}
          {showSparkle?.startsWith(`trunk-moving-${segmentNumber}`) && (
            <div className="sparkle-effect moving">🐘 Traveling...</div>
          )}
          {showSparkle === `segment-complete-${segmentNumber}` && (
            <div className="sparkle-effect complete">🎉 Path Complete!</div>
          )}
          {showSparkle === `hint-segment-${segmentNumber}` && (
            <div className="sparkle-effect hint">👆 Click me!</div>
          )}
          {showSparkle === `trunk-arrival-${segmentNumber}` && (
            <div className="sparkle-effect arrival">🐘 Trunk Arrived!</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="interactive-maze-container">
      <h2>🕳️ Interactive Maze Test Component</h2>
      
      {/* Control Panel */}
      <div className="control-panel">
        <button onClick={resetMaze} className="reset-btn">
          🔄 Reset Maze
        </button>
        <div className="game-status">
          <span>Started: {gameState.mazeStarted ? '✅' : '❌'}</span>
          <span>Current: {gameState.currentSegment}/5</span>
          <span>Next: {gameState.nextAvailableSegment || 'Complete!'}</span>
          <span>Completed: {gameState.mazeCompleted ? '🏆' : '⏳'}</span>
          <span>Animating: {gameState.isAnimating ? '🎬' : '🎯'}</span>
        </div>
      </div>

      {/* Maze Area */}
      <div className="maze-test-area">
        
        {/* Trunk Guide */}
        {!gameState.mazeStarted && (
          <div className="trunk-guide-test" onClick={handleTrunkGuideClick}>
            <img src={SEGMENT_IMAGES.trunkGuide} alt="Trunk Guide" />
            <div className="guide-label">Click to Start!</div>
            {showSparkle === 'trunk-guide-clicked' && (
              <div className="sparkle-effect">🎯 Started!</div>
            )}
          </div>
        )}

        {/* Path Segments */}
        {gameState.mazeStarted && renderSegments()}

        {/* NEW: Moving Trunk Indicator */}
        {gameState.mazeStarted && (
          <div 
            className="moving-trunk"
            style={{
              left: `${gameState.trunkPosition.x}px`,
              top: `${gameState.trunkPosition.y}px`,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            🐘
            {gameState.isAnimating && (
              <div className="trunk-trail">✨</div>
            )}
          </div>
        )}

        {/* Wrong click effect */}
        {showSparkle === 'wrong-click' && (
          <div className="global-message error">
            ❌ Try clicking the glowing segment!
          </div>
        )}

        {/* Maze complete effect */}
        {showSparkle === 'maze-complete' && (
          <div className="global-message success">
            🏆 MAZE COMPLETED! Path of wisdom revealed!
          </div>
        )}
      </div>

      {/* Debug Messages */}
      <div className="debug-panel">
        <h3>🐛 Debug Messages</h3>
        <div className="message-log">
          {messages.map((msg, index) => (
            <div key={index} className="debug-message">{msg}</div>
          ))}
        </div>
      </div>

      {/* State Inspector */}
      <div className="state-inspector">
        <h3>🔍 Game State</h3>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </div>
    </div>
  );
};

export default InteractiveMaze;