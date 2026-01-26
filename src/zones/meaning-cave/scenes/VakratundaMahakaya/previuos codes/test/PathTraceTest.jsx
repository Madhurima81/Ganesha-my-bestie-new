// PathTraceTest.jsx - Drag & Trace Path Following Test Component
import React, { useState, useRef, useEffect } from 'react';
import './PathTraceTest.css';

const PathTraceTest = () => {
  const [gameState, setGameState] = useState({
    isTracing: false,
    traceStarted: false,
    tracedPoints: [],
    traceProgress: 0,
    isOnPath: true,
    pathCompleted: false,
    currentPathIndex: 0
  });

  const [messages, setMessages] = useState([]);
  const [showEffect, setShowEffect] = useState(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  // Define trunk-shaped path (curved like elephant trunk)
  const trunkPath = "M 50 100 Q 150 80 250 120 Q 350 160 400 100 Q 450 40 500 80";
  const pathLength = useRef(0);

  useEffect(() => {
    if (pathRef.current) {
      pathLength.current = pathRef.current.getTotalLength();
    }
  }, []);

  const addMessage = (message) => {
    console.log(`🎨 TRACE: ${message}`);
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-5));
  };

  // Get point on path at given distance
  const getPointOnPath = (distance) => {
    if (!pathRef.current) return { x: 0, y: 0 };
    return pathRef.current.getPointAtLength(distance);
  };

  // Check if coordinates are near the path
  const isNearPath = (x, y, tolerance = 25) => {
    if (!pathRef.current) return false;
    
    const pathLen = pathLength.current;
    const segments = 50; // Check 50 points along path
    
    for (let i = 0; i <= segments; i++) {
      const distance = (i / segments) * pathLen;
      const pathPoint = getPointOnPath(distance);
      
      const dx = x - pathPoint.x;
      const dy = y - pathPoint.y;
      const distanceToPath = Math.sqrt(dx * dx + dy * dy);
      
      if (distanceToPath <= tolerance) {
        return { isNear: true, progress: distance / pathLen };
      }
    }
    
    return { isNear: false, progress: 0 };
  };

  // Calculate progress along path
  const calculateProgress = (tracedPoints) => {
    if (tracedPoints.length === 0) return 0;
    
    let maxProgress = 0;
    tracedPoints.forEach(point => {
      if (point.progress > maxProgress) {
        maxProgress = point.progress;
      }
    });
    
    return Math.round(maxProgress * 100);
  };

  // Get SVG coordinates from mouse/touch event
  const getSVGCoordinates = (event) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Start tracing
  const handleTraceStart = (event) => {
    const coords = getSVGCoordinates(event);
    const pathCheck = isNearPath(coords.x, coords.y);
    
    if (!pathCheck.isNear) {
      addMessage("❌ Start tracing from the orange trunk path!");
      setShowEffect('start-error');
      setTimeout(() => setShowEffect(null), 1500);
      return;
    }
    
    addMessage(`🎯 Started tracing at (${Math.round(coords.x)}, ${Math.round(coords.y)})`);
    
    setGameState(prev => ({
      ...prev,
      isTracing: true,
      traceStarted: true,
      tracedPoints: [{ x: coords.x, y: coords.y, progress: pathCheck.progress }],
      traceProgress: 0,
      isOnPath: true,
      pathCompleted: false
    }));

    setShowEffect('trace-start');
    setTimeout(() => setShowEffect(null), 800);
  };

  // Continue tracing
  const handleTraceMove = (event) => {
    if (!gameState.isTracing) return;
    
    event.preventDefault();
    const coords = getSVGCoordinates(event);
    const pathCheck = isNearPath(coords.x, coords.y);
    
    const newPoint = {
      x: coords.x,
      y: coords.y,
      progress: pathCheck.progress,
      onPath: pathCheck.isNear
    };
    
    const newTracedPoints = [...gameState.tracedPoints, newPoint];
    const progress = calculateProgress(newTracedPoints);
    
    setGameState(prev => ({
      ...prev,
      tracedPoints: newTracedPoints,
      traceProgress: progress,
      isOnPath: pathCheck.isNear
    }));

    // Show sparkles for good tracing
    if (pathCheck.isNear && Math.random() > 0.8) {
      setShowEffect(`sparkle-${Date.now()}`);
      setTimeout(() => setShowEffect(null), 400);
    }

    // Check for completion
    if (progress >= 90 && pathCheck.isNear) {
      completeTrace();
    }
  };

  // End tracing
  const handleTraceEnd = () => {
    if (!gameState.isTracing) return;
    
    addMessage(`🏁 Finished tracing. Progress: ${gameState.traceProgress}%`);
    
    setGameState(prev => ({
      ...prev,
      isTracing: false
    }));

    if (gameState.traceProgress < 80) {
      setShowEffect('encourage-more');
      setTimeout(() => setShowEffect(null), 2000);
    }
  };

  // Complete the trace
  const completeTrace = () => {
    addMessage("🎉 TRUNK PATH COMPLETED!");
    
    setGameState(prev => ({
      ...prev,
      pathCompleted: true,
      isTracing: false,
      traceProgress: 100
    }));

    setShowEffect('path-complete');
    setTimeout(() => setShowEffect(null), 3000);
  };

  // Reset test
  const resetTest = () => {
    addMessage("🔄 Resetting trace test...");
    
    setGameState({
      isTracing: false,
      traceStarted: false,
      tracedPoints: [],
      traceProgress: 0,
      isOnPath: true,
      pathCompleted: false,
      currentPathIndex: 0
    });
    
    setShowEffect(null);
    setMessages([]);
  };

  // Render traced path
  const renderTracedPath = () => {
    if (gameState.tracedPoints.length < 2) return null;
    
    const pathData = gameState.tracedPoints.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
    
    return (
      <path
        d={pathData}
        stroke={gameState.isOnPath ? "#00ff00" : "#ff6b6b"}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        className="traced-path"
      />
    );
  };

  return (
    <div className="path-trace-test-container">
      <h2>🐘 Trunk Path Tracing Test</h2>
      
      {/* Control Panel */}
      <div className="control-panel">
        <button onClick={resetTest} className="reset-btn">
          🔄 Reset Test
        </button>
        <div className="trace-status">
          <span>Tracing: {gameState.isTracing ? '✋' : '🎯'}</span>
          <span>Progress: {gameState.traceProgress}%</span>
          <span>On Path: {gameState.isOnPath ? '✅' : '❌'}</span>
          <span>Completed: {gameState.pathCompleted ? '🏆' : '⏳'}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>🎯 <strong>Instructions:</strong> Drag your finger along the orange trunk path!</p>
        <p>✨ Stay close to the path and complete 90% to succeed</p>
      </div>

      {/* SVG Tracing Area */}
      <div className="trace-area">
        <svg
          ref={svgRef}
          width="600"
          height="200"
          viewBox="0 0 600 200"
          onMouseDown={handleTraceStart}
          onMouseMove={handleTraceMove}
          onMouseUp={handleTraceEnd}
          onTouchStart={handleTraceStart}
          onTouchMove={handleTraceMove}
          onTouchEnd={handleTraceEnd}
          className="trace-svg"
        >
          {/* Background */}
          <rect width="600" height="200" fill="#2a1810" opacity="0.1" />
          
          {/* Target path (trunk shape) */}
          <path
            ref={pathRef}
            d={trunkPath}
            stroke="#ff8c42"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10,5"
            opacity="0.8"
            className="target-path"
          />
          
          {/* Progress fill */}
          <path
            d={trunkPath}
            stroke="#ffd700"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${pathLength.current * (gameState.traceProgress / 100)} ${pathLength.current}`}
            strokeDashoffset="0"
            opacity="0.9"
            className="progress-path"
          />
          
          {/* User traced path */}
          {renderTracedPath()}
          
          {/* Start indicator */}
          <circle cx="50" cy="100" r="8" fill="#00ff00" opacity="0.7">
            <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* End indicator */}
          <circle cx="500" cy="80" r="8" fill="#ff0000" opacity="0.7">
            <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* Effects */}
          {showEffect === 'trace-start' && (
            <circle cx="50" cy="100" r="20" fill="none" stroke="#00ff00" strokeWidth="3" opacity="0.8">
              <animate attributeName="r" values="20;40;20" dur="0.8s" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" />
            </circle>
          )}
          
          {showEffect === 'path-complete' && (
            <>
              <circle cx="500" cy="80" r="30" fill="none" stroke="#ffd700" strokeWidth="4">
                <animate attributeName="r" values="30;60;30" dur="2s" />
                <animate attributeName="opacity" values="1;0;1" dur="2s" />
              </circle>
              <text x="300" y="30" textAnchor="middle" fill="#ffd700" fontSize="24" fontWeight="bold">
                🎉 TRUNK PATH MASTERED! 🎉
              </text>
            </>
          )}
        </svg>

        {/* Overlay Effects */}
        {showEffect === 'start-error' && (
          <div className="overlay-message error">
            ❌ Start from the orange path!
          </div>
        )}
        
        {showEffect === 'encourage-more' && (
          <div className="overlay-message encourage">
            💪 Keep tracing! You're at {gameState.traceProgress}%
          </div>
        )}
        
        {showEffect?.startsWith('sparkle-') && (
          <div className="sparkle-effect">✨</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-label">Trunk Path Progress: {gameState.traceProgress}%</div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${gameState.traceProgress}%`,
              backgroundColor: gameState.traceProgress >= 90 ? '#ffd700' : '#ff8c42'
            }}
          />
        </div>
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
      <details className="state-inspector">
        <summary>🔍 Game State</summary>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </details>
    </div>
  );
};

export default PathTraceTest;