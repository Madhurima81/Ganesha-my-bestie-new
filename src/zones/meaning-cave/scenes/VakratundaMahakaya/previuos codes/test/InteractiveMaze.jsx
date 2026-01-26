// InteractiveMaze.jsx - Updated with Drag & Trace Integration (Option A)
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
    segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'],
    completedSegments: [false, false, false, false, false],
    mazeStarted: false,
    mazeCompleted: false,
    trunkPosition: { segment: 0, x: 20, y: 20 },
    segmentProgress: [0, 0, 0, 0, 0],
    isAnimating: false,
    
    // NEW: Drag & Trace state
    dragState: {
      isTracing: false,
      tracedPoints: [],
      traceProgress: 0,
      dragPhaseCompleted: false, // true when segments 1-3 are drag-completed
      activeDragArea: 1 // which segment area (1, 2, or 3) is currently draggable
    }
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

  // NEW: Get coordinates for drag detection
  const getDragCoordinates = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    
    let clientX, clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // NEW: Check if coordinates are near segments 1-3 path
  const isNearSegmentPath = (x, y) => {
    // Define rough path area covering segments 1-3
    // Segment 1: x: 50-200, y: 50-130
    // Segment 2: x: 220-300, y: 80-200  
    // Segment 3: x: 150-350, y: 180-260
    
    const tolerance = 40; // Generous tolerance for kids
    
    // Check if in any of the three segment areas
    const inSegment1 = (x >= 50-tolerance && x <= 200+tolerance && y >= 50-tolerance && y <= 130+tolerance);
    const inSegment2 = (x >= 220-tolerance && x <= 300+tolerance && y >= 80-tolerance && y <= 200+tolerance);
    const inSegment3 = (x >= 150-tolerance && x <= 350+tolerance && y >= 180-tolerance && y <= 260+tolerance);
    
    if (inSegment1) return { isNear: true, segment: 1, progress: Math.min(100, ((x - 50) / 150) * 33) };
    if (inSegment2) return { isNear: true, segment: 2, progress: 33 + Math.min(33, ((y - 80) / 120) * 33) };
    if (inSegment3) return { isNear: true, segment: 3, progress: 66 + Math.min(34, ((x - 150) / 200) * 34) };
    
    return { isNear: false, segment: 0, progress: 0 };
  };

  // NEW: Start drag tracing
  const handleDragStart = (event) => {
    if (gameState.dragState.dragPhaseCompleted || gameState.isAnimating) return;
    
    const coords = getDragCoordinates(event);
    const pathCheck = isNearSegmentPath(coords.x, coords.y);
    
    addMessage(`Drag started at (${Math.round(coords.x)}, ${Math.round(coords.y)})`);
    
    if (!pathCheck.isNear) {
      addMessage("❌ Start tracing from the orange trunk path!");
      setShowSparkle('drag-start-error');
      safeSetTimeout(() => setShowSparkle(null), 1500);
      return;
    }
    
    addMessage("✅ Started tracing trunk path!");
    
    setGameState(prev => ({
      ...prev,
      dragState: {
        ...prev.dragState,
        isTracing: true,
        tracedPoints: [{ x: coords.x, y: coords.y, progress: pathCheck.progress }],
        traceProgress: pathCheck.progress,
        activeDragArea: pathCheck.segment
      }
    }));

    setShowSparkle('drag-start-success');
    safeSetTimeout(() => setShowSparkle(null), 800);
  };

  // NEW: Continue drag tracing
  const handleDragMove = (event) => {
    if (!gameState.dragState.isTracing) return;
    
    const coords = getDragCoordinates(event);
    const pathCheck = isNearSegmentPath(coords.x, coords.y);
    
    const newPoint = {
      x: coords.x,
      y: coords.y,
      progress: pathCheck.progress,
      onPath: pathCheck.isNear
    };
    
    const newTracedPoints = [...gameState.dragState.tracedPoints, newPoint];
    const maxProgress = Math.max(gameState.dragState.traceProgress, pathCheck.progress);
    
    setGameState(prev => ({
      ...prev,
      dragState: {
        ...prev.dragState,
        tracedPoints: newTracedPoints,
        traceProgress: maxProgress
      }
    }));

    // Show sparkles for good tracing
    if (pathCheck.isNear && Math.random() > 0.7) {
      setShowSparkle(`drag-sparkle-${Date.now()}`);
      safeSetTimeout(() => setShowSparkle(null), 400);
    }

    // Check for completion of drag phase
    if (maxProgress >= 85) {
      completeDragPhase();
    }
  };

  // NEW: End drag tracing
  const handleDragEnd = () => {
    if (!gameState.dragState.isTracing) return;
    
    addMessage(`Drag ended. Progress: ${Math.round(gameState.dragState.traceProgress)}%`);
    
    setGameState(prev => ({
      ...prev,
      dragState: {
        ...prev.dragState,
        isTracing: false
      }
    }));

    if (gameState.dragState.traceProgress < 75) {
      addMessage("💪 Keep tracing more of the trunk path!");
      setShowSparkle('encourage-more-drag');
      safeSetTimeout(() => setShowSparkle(null), 2000);
    }
  };

  // NEW: Complete drag phase and transition to click mode
  const completeDragPhase = () => {
    if (gameState.dragState.dragPhaseCompleted) return;
    
    addMessage("🎉 TRUNK PATH MASTERED! Now click the remaining segments!");
    
    // Mark first 3 segments as completed
    const newCompleted = [...gameState.completedSegments];
    newCompleted[0] = true;
    newCompleted[1] = true;
    newCompleted[2] = true;
    
    const newStates = [...gameState.segmentStates];
    newStates[0] = SEGMENT_STATES.COMPLETED;
    newStates[1] = SEGMENT_STATES.COMPLETED;
    newStates[2] = SEGMENT_STATES.COMPLETED;
    newStates[3] = SEGMENT_STATES.READY; // Enable segment 4 for clicking
    
    setGameState(prev => ({
      ...prev,
      currentSegment: 3,
      completedSegments: newCompleted,
      segmentStates: newStates,
      nextAvailableSegment: 4, // Now ready for clicking
      dragState: {
        ...prev.dragState,
        dragPhaseCompleted: true,
        isTracing: false
      },
      trunkPosition: getNextTrunkPosition(3) // Move trunk to segment 4
    }));

    setShowSparkle('drag-phase-complete');
    safeSetTimeout(() => setShowSparkle(null), 3000);
  };

  // Start maze when trunk guide clicked
  const handleTrunkGuideClick = () => {
    if (gameState.mazeStarted) return;
    
    addMessage("Trunk guide clicked - Starting maze!");
    
    setGameState(prev => ({
      ...prev,
      mazeStarted: true,
      segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'],
      nextAvailableSegment: 1,
      trunkPosition: { segment: 0, x: 20, y: 20 }
    }));

    setShowSparkle('trunk-guide-clicked');
    safeSetTimeout(() => setShowSparkle(null), 1000);
  };

  // MODIFIED: Handle segment clicks (now only for segments 4-5)
  const handleSegmentClick = (segmentIndex) => {
    const segmentNumber = segmentIndex + 1;
    
    // NEW: Only allow clicking segments 4-5 after drag phase is complete
    if (segmentNumber <= 3) {
      if (!gameState.dragState.dragPhaseCompleted) {
        addMessage("🐘 First trace the trunk path through segments 1-3!");
        setShowSparkle('drag-first-reminder');
        safeSetTimeout(() => setShowSparkle(null), 2000);
        return;
      }
    }
    
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

  // Progressive path tracing animation (existing - for segments 4-5)
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
    }, 120); // 3 seconds total

    timeoutsRef.current.push(fillInterval);
  };

  // Complete segment and move trunk to next position (existing)
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

  // Calculate trunk position for next segment (existing)
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

  // Reset maze (updated to include drag state)
  const resetMaze = () => {
    addMessage("🔄 Resetting maze...");
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    
    setGameState({
      currentSegment: 0,
      nextAvailableSegment: 1,
      segmentStates: ['ready', 'inactive', 'inactive', 'inactive', 'inactive'],
      completedSegments: [false, false, false, false, false],
      mazeStarted: false,
      mazeCompleted: false,
      trunkPosition: { segment: 0, x: 20, y: 20 },
      segmentProgress: [0, 0, 0, 0, 0],
      isAnimating: false,
      
      // Reset drag state
      dragState: {
        isTracing: false,
        tracedPoints: [],
        traceProgress: 0,
        dragPhaseCompleted: false,
        activeDragArea: 1
      }
    });
    
    setShowSparkle(null);
    setMessages([]);
  };

  // Render segments with progressive filling (existing)
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
      const isClickable = state === SEGMENT_STATES.READY && !gameState.isAnimating && segmentNumber >= 4; // Only segments 4-5 clickable
      const progress = gameState.segmentProgress[index];
      
      return (
        <div
          key={index}
          className={`path-segment segment-${segmentNumber} ${state} ${segmentNumber <= 3 ? 'drag-segment' : 'click-segment'}`}
          onClick={() => isClickable && handleSegmentClick(index)}
          style={{ cursor: isClickable ? 'pointer' : 'default' }}
        >
          <img src={imageSrc} alt={`Path segment ${segmentNumber}`} />
          
          {/* Progressive fill overlay */}
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
            {state === 'ready' && !gameState.isAnimating && segmentNumber >= 4 && '✨'}
            {state === 'ready' && segmentNumber <= 3 && !gameState.dragState.dragPhaseCompleted && '🐘'}
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

  // NEW: Render drag progress visualization
  const renderDragProgress = () => {
    if (gameState.dragState.tracedPoints.length < 2) return null;
    
    return (
      <svg className="drag-trace-overlay" viewBox="0 0 500 400">
        <polyline
          points={gameState.dragState.tracedPoints.map(p => `${p.x},${p.y}`).join(' ')}
          stroke="#ffd700"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    );
  };

  return (
    <div className="interactive-maze-container">
      <h2>🕳️ Interactive Maze - Drag & Click Integration</h2>
      
      {/* Control Panel */}
      <div className="control-panel">
        <button onClick={resetMaze} className="reset-btn">
          🔄 Reset Maze
        </button>
        <div className="game-status">
          <span>Started: {gameState.mazeStarted ? '✅' : '❌'}</span>
          <span>Drag Phase: {gameState.dragState.dragPhaseCompleted ? '✅' : '🐘'}</span>
          <span>Current: {gameState.currentSegment}/5</span>
          <span>Next: {gameState.nextAvailableSegment || 'Complete!'}</span>
          <span>Completed: {gameState.mazeCompleted ? '🏆' : '⏳'}</span>
        </div>
      </div>

      {/* Drag Progress Bar */}
      {gameState.mazeStarted && !gameState.dragState.dragPhaseCompleted && (
        <div className="drag-progress-container">
          <div className="drag-progress-label">
            🐘 Trunk Path Progress: {Math.round(gameState.dragState.traceProgress)}%
          </div>
          <div className="drag-progress-bar">
            <div 
              className="drag-progress-fill"
              style={{ width: `${gameState.dragState.traceProgress}%` }}
            />
          </div>
        </div>
      )}

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

        {/* NEW: Drag Overlay for Segments 1-3 */}
        {gameState.mazeStarted && !gameState.dragState.dragPhaseCompleted && (
          <div 
            className="drag-overlay-area"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ touchAction: 'none' }}
          >
            {/* Visual guide for drag path */}
            <div className="drag-path-guide">
              <div className="drag-instruction">🐘 Drag along the trunk path through segments 1-3!</div>
            </div>
            
            {/* Render traced path */}
            {renderDragProgress()}
          </div>
        )}

        {/* Path Segments */}
        {gameState.mazeStarted && renderSegments()}

        {/* Moving Trunk Indicator */}
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
            {(gameState.isAnimating || gameState.dragState.isTracing) && (
              <div className="trunk-trail">✨</div>
            )}
          </div>
        )}

        {/* Drag-specific effects */}
        {showSparkle === 'drag-start-error' && (
          <div className="global-message error">
            ❌ Start tracing from the trunk path segments!
          </div>
        )}
        
        {showSparkle === 'drag-start-success' && (
          <div className="global-message success">
            ✅ Great! Keep tracing the trunk path!
          </div>
        )}
        
        {showSparkle === 'drag-phase-complete' && (
          <div className="global-message success">
            🎉 TRUNK PATH MASTERED! Now click segments 4 & 5!
          </div>
        )}
        
        {showSparkle === 'drag-first-reminder' && (
          <div className="global-message info">
            🐘 First trace the trunk path through segments 1-3!
          </div>
        )}
        
        {showSparkle === 'encourage-more-drag' && (
          <div className="global-message encourage">
            💪 Keep tracing! You're at {Math.round(gameState.dragState.traceProgress)}%
          </div>
        )}

        {/* Existing effects */}
        {showSparkle === 'wrong-click' && (
          <div className="global-message error">
            ❌ Try clicking the glowing segment!
          </div>
        )}

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
        <pre>{JSON.stringify({
          ...gameState,
          dragState: {
            ...gameState.dragState,
            tracedPoints: `${gameState.dragState.tracedPoints.length} points`
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default InteractiveMaze;