// CurvedPathTracer.jsx - FIXED: SVG to Container Coordinate Conversion + RELOAD SUPPORT
import React, { useState, useRef, useEffect } from 'react';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import mooshikaTracing from './assets/images/mooshika-tracing.png';

const CurvedPathTracer = ({
  onComplete,
  onProgress,
  disabled = false,
  showDebug = true,
  showMooshika = true,
  mooshikaSize = 95,
  
  // ✅ NEW: Resume props (already being passed from CaveSceneFixed!)
  isResuming = false,
  resumeProgress = 0,
  resumeCurrentSegment = 0,
  resumeSegmentsCompleted = [],
  resumeIsTracing = false,
  resumeTracedPath = []
}) => {
  const svgRef = useRef(null);
  const [isTracing, setIsTracing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 120, y: 140 });
  const [tracedPath, setTracedPath] = useState([]);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState('good');
  const [showCursor, setShowCursor] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showCompletionSparkles, setShowCompletionSparkles] = useState(false);

  // NEW: Mooshika states (no rotation)
  const [mooshikaState, setMooshikaState] = useState('happy');
  const [mooshikaTrail, setMooshikaTrail] = useState([]);
  const [mooshikaRotation, setMooshikaRotation] = useState(0);

  const pathSegments = [
    { x: 120, y: 140, progress: 0, name: "start" },
    { x: 140, y: 148, progress: 8, name: "curve_start" },
    { x: 160, y: 154, progress: 15, name: "early_curve" },
    { x: 180, y: 159, progress: 22, name: "mid_curve1" },
    { x: 200, y: 163, progress: 30, name: "curve1_peak" },
    { x: 230, y: 167, progress: 37, name: "transition1" },
    { x: 260, y: 170, progress: 45, name: "rising" },
    { x: 290, y: 172, progress: 52, name: "high_point" },
    { x: 320, y: 174, progress: 60, name: "peak" },
    { x: 350, y: 172, progress: 67, name: "past_peak" },
    { x: 380, y: 168, progress: 74, name: "descending" },
    { x: 410, y: 162, progress: 81, name: "descent" },
    { x: 440, y: 154, progress: 88, name: "final_turn" },
    { x: 460, y: 140, progress: 94, name: "turning" },
    { x: 420, y: 110, progress: 97, name: "approach" },
    { x: 350, y: 80, progress: 100, name: "end" }
  ];

  // ✅ NEW: RELOAD HANDLER - The magic 15 lines!
  useEffect(() => {
    if (!isResuming) return;
    
    console.log('🔄 CurvedPathTracer: Resuming with:', {
      resumeProgress,
      resumeCurrentSegment,
      resumeIsTracing,
      resumeTracedPath: resumeTracedPath.length
    });

    // Restore all state from props
    setProgress(resumeProgress);
    setCurrentSegment(resumeCurrentSegment);
    setIsTracing(resumeIsTracing);
    setTracedPath(resumeTracedPath);
    
    // Restore position from last traced point
    if (resumeTracedPath.length > 0) {
      const lastPoint = resumeTracedPath[resumeTracedPath.length - 1];
      setCurrentPosition(lastPoint);
    }
    
    // Restore visual states
    setShowCursor(resumeIsTracing);
    setQuality(resumeProgress > 90 ? 'good' : resumeProgress > 50 ? 'okay' : 'good');
    
    // If we were mid-trace, show encouraging message
    if (resumeIsTracing && resumeProgress > 0 && resumeProgress < 100) {
      showFeedback(`Welcome back! Continue tracing from ${Math.round(resumeProgress)}%`);
    }
    
    console.log('✅ CurvedPathTracer: Reload complete - ready to continue!');
  }, [isResuming]); // Only run when isResuming changes

  // ✅ NUCLEAR FIX: Force SVG re-render after reload
useEffect(() => {
  if (isResuming && resumeProgress > 0) {
    console.log('🔧 NUCLEAR: Force refreshing entire SVG after reload');
    
    const timer = setTimeout(() => {
      const svg = svgRef.current;
      if (svg) {
        // Force SVG to recalculate by toggling display
        svg.style.display = 'none';
        
        requestAnimationFrame(() => {
          svg.style.display = 'block';
          
          // Double-check: manually set the dasharray again
          const greenPath = svg.querySelector('path[stroke="#00FF88"]');
          if (greenPath) {
            greenPath.setAttribute('stroke-dasharray', `${resumeProgress * 4.5} 500`);
            console.log('✅ NUCLEAR: Green path dasharray forced to:', `${resumeProgress * 4.5} 500`);
          }
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [isResuming, resumeProgress]);

  // Convert SVG coordinates to container pixel coordinates
  const svgToContainerCoords = (svgX, svgY) => {
    if (!svgRef.current) return { x: svgX, y: svgY };
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = svgRef.current.viewBox.baseVal;
    
    // Scale from SVG viewBox to actual container size
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;
    
    return {
      x: svgX * scaleX,
      y: svgY * scaleY
    };
  };

  // Mooshika state based on quality (no rotation)
  useEffect(() => {
    if (quality === 'good' || quality === 'perfect') {
      setMooshikaState('happy');
    } else if (quality === 'off-path') {
      setMooshikaState('concerned');
    }
  }, [quality]);

  // Mooshika trail effect
  useEffect(() => {
    if (isTracing && tracedPath.length > 0) {
      const newTrail = tracedPath.slice(-8).map((point, index) => ({
        ...point,
        opacity: (index + 1) / 8,
        size: ((index + 1) / 8) * 12
      }));
      setMooshikaTrail(newTrail);
    } else {
      setMooshikaTrail([]);
    }
  }, [tracedPath, isTracing]);

  // Mooshika rotation calculation - FIXED
  useEffect(() => {
    if (tracedPath.length > 3 && isTracing) {
      const lastTwo = tracedPath.slice(-2);
      const [prev, curr] = lastTwo;
      
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      
      // Only rotate if there's significant movement
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        const angle = Math.atan2(-deltaY, deltaX) * (180 / Math.PI);
        setMooshikaRotation(angle);
      }
    }
  }, [tracedPath, isTracing]);

  // Using stricter tolerances from previous fix
  const getSequentialProgress = (x, y) => {
    if (currentSegment >= pathSegments.length) return { progress: 100, quality: 'complete' };
    const targetSegment = pathSegments[currentSegment];
    if (!targetSegment) return { progress: 100, quality: 'complete' };
    const distance = Math.sqrt(Math.pow(x - targetSegment.x, 2) + Math.pow(y - targetSegment.y, 2));
    const okayTolerance = 28;
    if (distance < okayTolerance) {
      let quality = 'okay';
      if (distance < 12) quality = 'perfect';
      else if (distance < 20) quality = 'good';
      return { progress: targetSegment.progress, quality, segmentReached: currentSegment, segmentName: targetSegment.name };
    }
    return { progress: currentSegment > 0 ? pathSegments[currentSegment - 1].progress : 0, quality: 'off-path' };
  };

  const getCoordinates = (event) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = svgRef.current.viewBox.baseVal;
    let clientX, clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const getQualityColor = (currentQuality) => {
    switch (currentQuality) {
      case 'perfect': return '#00FF00';
      case 'good': return '#FFFF00';
      case 'okay': return '#FFA500';
      case 'off-path': return '#FF4444';
      case 'complete': return '#00FFFF';
      default: return '#FFD700';
    }
  };

  const showFeedback = (message, duration = 2500) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), duration);
  };

  const handleStart = (e) => {
    if (disabled) return;
    const coords = getCoordinates(e);
    const distanceFromStart = Math.sqrt(Math.pow(coords.x - 120, 2) + Math.pow(coords.y - 140, 2));
    
    // ✅ ENHANCED: Allow resume from current position if we were already tracing
    const allowResumeFromCurrent = isResuming && progress > 0 && progress < 100;
    const distanceFromCurrent = allowResumeFromCurrent ? 
      Math.sqrt(Math.pow(coords.x - currentPosition.x, 2) + Math.pow(coords.y - currentPosition.y, 2)) : 
      Infinity;
    
    if ((distanceFromStart < 30 && !isTracing) || (allowResumeFromCurrent && distanceFromCurrent < 40)) {
      setIsTracing(true);
      setShowCursor(true);
      
      // If resuming, start from current position; otherwise start from beginning
      if (!allowResumeFromCurrent) {
        setCurrentPosition({ x: 120, y: 140 });
        setTracedPath([{ x: 120, y: 140 }]);
        setProgress(0);
        setCurrentSegment(1);
        setQuality('good');
        showFeedback("Great start! Follow the orange path!");
      } else {
        showFeedback(`Continuing from ${Math.round(progress)}%!`);
      }
    } else if (!isTracing && !allowResumeFromCurrent) {
      showFeedback("Click the green circle to start!");
    } else if (allowResumeFromCurrent) {
      showFeedback("Click near Mooshika to continue tracing!");
    }
  };

  const handleMove = (e) => {
    if (!isTracing) return;

    const coords = getCoordinates(e);
    setCurrentPosition(coords);
    
    // ✅ FIXED: Create updated path for immediate use
    const updatedPath = [...tracedPath, coords];
    setTracedPath(updatedPath);

    const result = getSequentialProgress(coords.x, coords.y);

    setQuality(result.quality);

    if (result.segmentReached !== undefined && result.segmentReached === currentSegment) {
      setProgress(result.progress);

      const nextSegment = currentSegment + 1;
      if (nextSegment < pathSegments.length) {
        setCurrentSegment(nextSegment);
      }

      // ✅ FIXED: Pass updated traced path to parent for ongoing progress
      if (onProgress) {
        onProgress(result.progress, result.quality, updatedPath, currentSegment);
      }

      if (result.progress >= 100) {
        console.log('🎉 COMPLETED! All segments reached!');
        showFeedback("Perfect! You traced the whole elephant trunk!");

        setShowCompletionSparkles(true);
        setTimeout(() => setShowCompletionSparkles(false), 5000);

        const finalPath = [...updatedPath, { x: 350, y: 80 }];
        setTracedPath(finalPath);
        setIsTracing(false);
        setShowCursor(false);
        
        // ✅ FIXED: Pass final traced path to parent
        if (onProgress) {
          onProgress(100, 'complete', finalPath, pathSegments.length - 1);
        }
        
        if (onComplete) onComplete();
        return;
      }
    } else {
      if (result.quality === 'off-path') {
        const targetSegment = pathSegments[currentSegment];
        if (targetSegment) {
          showFeedback(`Stay on the path to reach ${targetSegment.name}!`);
        }
      }

      const distanceToEnd = Math.sqrt(Math.pow(coords.x - 350, 2) + Math.pow(coords.y - 80, 2));
      if ((distanceToEnd < 40 && progress >= 85) || distanceToEnd < 30) {
        console.log('🎉 EMERGENCY COMPLETION! Close enough!');
        setProgress(100);
        setCurrentSegment(pathSegments.length - 1);
        setQuality('complete');

        setShowCompletionSparkles(true);
        setTimeout(() => setShowCompletionSparkles(false), 3000);

        const finalPath = [...updatedPath, { x: 350, y: 80 }];
        setTracedPath(finalPath);
        setIsTracing(false);
        setShowCursor(false);
        showFeedback("Wonderful! You guided Mooshika to Ganesha!");
        
        // ✅ FIXED: Pass final traced path to parent
        if (onProgress) {
          onProgress(100, 'complete', finalPath, pathSegments.length - 1);
        }
        
        if (onComplete) onComplete();
        return;
      }
    }
  };

  const handleEnd = (e) => {
    if (!isTracing) return;
    setShowCursor(false);
    if (progress > 0 && progress < 100) {
      showFeedback(`Progress: ${Math.round(progress)}% - Continue tracing!`);
    }
  };

  const reset = () => {
    setIsTracing(false);
    setShowCursor(false);
    setTracedPath([]);
    setCurrentPosition({ x: 120, y: 140 });
    setProgress(0);
    setCurrentSegment(0);
    setQuality('good');
    setFeedbackMessage('');
    setMooshikaTrail([]);
    setMooshikaRotation(0);
  };

  const forceComplete = () => {
    console.log('⚡ Force completing trace');
    setProgress(100);
    setCurrentSegment(pathSegments.length - 1);

    setShowCompletionSparkles(true);
    setTimeout(() => setShowCompletionSparkles(false), 5000);

    // ✅ FIXED: Build final path from current state
    const finalPath = tracedPath.length > 0 ? [...tracedPath, { x: 350, y: 80 }] : [{ x: 120, y: 140 }, { x: 350, y: 80 }];
    setTracedPath(finalPath);
    setIsTracing(false);
    setShowCursor(false);
    setQuality('complete');
    showFeedback("Force completed!");
    
    // ✅ FIXED: Pass final traced path to parent
    if (onProgress) {
      onProgress(100, 'complete', finalPath, pathSegments.length - 1);
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const renderTracedPath = () => {
    console.log('🎨 renderTracedPath called:', {
      'tracedPath.length': tracedPath.length,
      'first_point': tracedPath[0],
      'last_point': tracedPath[tracedPath.length - 1],
      'isResuming': isResuming,
      'progress': progress
    });
    
    if (tracedPath.length < 2) {
      console.log('❌ Not rendering traced path: less than 2 points');
      return null;
    }
    
    const pathPoints = tracedPath.map(p => `${p.x},${p.y}`).join(' ');
    console.log('✅ Rendering traced path with points:', pathPoints.substring(0, 100) + '...');
    
    return (
      <polyline
        points={pathPoints}
        stroke={getQualityColor(quality)}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '20px auto' }}>
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes completionPop {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes mooshikaBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes mooshikaIdle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50% { transform: translateY(-5px); opacity: 0.7; }
        }
        
        @keyframes warningPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>

      {/* ✨ DEBUG: Show traced path info ✨ 
      {showDebug && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 10,
          maxWidth: '200px'
        }}>
          <div>Path Points: {tracedPath.length}</div>
          <div>Progress: {Math.round(progress)}%</div>
          <div>Segment: {currentSegment}</div>
          <div>Resuming: {String(isResuming)}</div>
          {tracedPath.length > 0 && (
            <div>Last: ({Math.round(tracedPath[tracedPath.length-1]?.x)}, {Math.round(tracedPath[tracedPath.length-1]?.y)})</div>
          )}
        </div>
      )}*/}
      <div style={{ 
        position: 'absolute',
        left: '10px',
        top: '10px',
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
        zIndex: 5
      }}>
        <button 
          onClick={reset} 
          style={{ 
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', 
            color: 'white', 
            border: '2px solid #FF4444', 
            padding: '8px 16px',
            borderRadius: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontFamily: 'Comic Sans MS, cursive',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            fontSize: '12px'
          }}
        >
          🔄 Reset
        </button>
        <button 
          onClick={forceComplete} 
          style={{ 
            background: 'linear-gradient(135deg, #4ECDC4, #44A08D)', 
            color: 'white', 
            border: '2px solid #4ECDC4', 
            padding: '8px 16px',
            borderRadius: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontFamily: 'Comic Sans MS, cursive',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            fontSize: '12px'
          }}
        >
          ⚡ Complete
        </button>
      </div>

      {feedbackMessage && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 20 
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #8B4513, #A0522D)', 
            color: '#FFD700', 
            padding: '12px 20px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            border: '3px solid #D2691E',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,215,0,0.3)',
            textAlign: 'center',
            maxWidth: '350px',
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 30%, rgba(255,215,0,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,165,0,0.1) 0%, transparent 50%)',
              borderRadius: '17px'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {feedbackMessage}
            </span>
          </div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '5px', 
        marginTop: '2px'
      }}>
        <div style={{ 
          width: '70%', 
          maxWidth: '400px',
          height: '16px', 
          background: 'linear-gradient(135deg, #8B4513, #654321)', 
          borderRadius: '25px', 
          padding: '3px',
          border: '3px solid #D2691E',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(255,215,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cdefs%3E%3Cpattern id=\\"sparkle\\" x=\\"0\\" y=\\"0\\" width=\\"20\\" height=\\"20\\" patternUnits=\\"userSpaceOnUse\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"0.5\\" fill=\\"%23FFD700\\" opacity=\\"0.6\\"/%3E%3Ccircle cx=\\"15\\" cy=\\"8\\" r=\\"0.3\\" fill=\\"%23FFA500\\" opacity=\\"0.8\\"/%3E%3Ccircle cx=\\"8\\" cy=\\"15\\" r=\\"0.4\\" fill=\\"%23FFD700\\" opacity=\\"0.7\\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" fill=\\"url(%23sparkle)\\"/%3E%3C/svg%3E") repeat',
            borderRadius: '20px'
          }} />
          
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: progress < 30 ? 
              'linear-gradient(90deg, #FF6B6B, #FF8E53)' : 
              progress < 70 ? 
              'linear-gradient(90deg, #4ECDC4, #44A08D)' : 
              'linear-gradient(90deg, #FFD700, #FFA500)',
            borderRadius: '20px',
            transition: 'width 0.5s ease, background 0.3s ease',
            boxShadow: '0 0 10px rgba(255,215,0,0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: progress > 0 ? 'shine 2s infinite' : 'none'
            }} />
          </div>
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            fontFamily: 'Comic Sans MS, cursive'
          }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
        <svg 
          ref={svgRef} 
          viewBox="0 0 600 200" 
          style={{ width: '100%', height: '100%', cursor: isTracing ? 'none' : 'pointer', touchAction: 'none', background: 'transparent' }} 
          onMouseDown={handleStart} 
          onMouseMove={handleMove} 
          onMouseUp={handleEnd} 
          onTouchStart={handleStart} 
          onTouchMove={handleMove} 
          onTouchEnd={handleEnd}
        >
          <path d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="70" fill="none" strokeLinecap="round" />
          <path d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" stroke="#FF8C42" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray="12,6" opacity="0.9" />

{(() => {
  console.log('🔍 Green path render check:', {
    progress,
    progressGreaterThanZero: progress > 0,
    dashArray: `${progress * 4.5} 500`,
    isResuming
  });
  
  if (progress > 0) {
    return (
      <path 
        d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" 
        stroke="#00FF88" 
        strokeWidth="18" 
        fill="none" 
        strokeLinecap="round" 
        strokeDasharray={`${progress * 4.5} 500`} 
        opacity="1"
        key={`green-path-${progress}-${Date.now()}`}  // Force re-render
      />
    );
  }
  return null;
})()}
          {renderTracedPath()}
          <circle cx="120" cy="140" r="16" fill="#00FF00" stroke="#fff" strokeWidth="3"><animate attributeName="r" values="13;19;13" dur="2s" repeatCount="indefinite" /></circle>
          <text x="120" y="147" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">START</text>
          <circle cx="350" cy="80" r="20" fill="#FF4444" stroke="#fff" strokeWidth="3"><animate attributeName="r" values="17;23;17" dur="2s" repeatCount="indefinite" /></circle>
          <text x="350" y="87" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">END</text>
          {showDebug && currentSegment < pathSegments.length && <circle cx={pathSegments[currentSegment].x} cy={pathSegments[currentSegment].y} r="12" fill="none" stroke="#FFFF00" strokeWidth="3" opacity="0.8"><animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" /></circle>}
          {showCursor && <circle cx={currentPosition.x} cy={currentPosition.y} r="8" fill={getQualityColor(quality)} stroke="#000" strokeWidth="2" opacity="0.9"><animate attributeName="r" values="6;12;6" dur="1s" repeatCount="indefinite" /></circle>}

          {/* ✨ Sparkles - INCLUDE OFF-PATH + MORE SPARKLES */}
          {isTracing && Math.random() < 0.3 && (
            <g>
              {[...Array(8)].map((_, i) => (
                <circle key={i}
                  cx={currentPosition.x + Math.cos(i * 45) * 15}
                  cy={currentPosition.y + Math.sin(i * 45) * 15}
                  r="3"
                  fill={quality === 'perfect' ? '#00FF00' : 
                        quality === 'good' ? '#FFD700' : 
                        quality === 'okay' ? '#FFA500' : '#FF6B6B'}
                  opacity="0.9"
                >
                  <animate attributeName="r" values="1;4;1" dur="1s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                </circle>
              ))}
            </g>
          )}   
        </svg>

        {/* 🐭 INTEGRATED MOOSHIKA CHARACTER - FIXED COORDINATES */}
        {showMooshika && (
          <>
            {/* Mooshika Trail */}
            {mooshikaTrail.map((point, index) => {
              const containerCoords = svgToContainerCoords(point.x, point.y);
              return (
                <div
                  key={`trail-${index}-${Date.now()}`}
                  style={{
                    position: 'absolute',
                    left: `${containerCoords.x}px`,
                    top: `${containerCoords.y}px`,
                    width: `${point.size}px`,
                    height: `${point.size}px`,
                    opacity: point.opacity,
                    transform: 'translate(-50%, -50%)',
                    background: mooshikaState === 'happy' ? 
                      'radial-gradient(circle, #00FF88, #4ECDC4)' : 
                      'radial-gradient(circle, #FF6B6B, #FF8E53)',
                    borderRadius: '50%',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                />
              );
            })}

            {/* Main Mooshika Character */}
            <div style={{
              position: 'absolute',
              left: `${svgToContainerCoords(currentPosition.x, currentPosition.y).x}px`,
              top: `${svgToContainerCoords(currentPosition.x, currentPosition.y).y}px`,
              width: `${mooshikaSize * 0.6}px`,
              height: `${mooshikaSize * 0.6}px`,
              transform: `translate(-50%, -50%) rotate(${mooshikaRotation}deg)`,
              zIndex: 20,
              pointerEvents: 'none',
              transition: isTracing ? 'left 0.1s ease-out, top 0.1s ease-out' : 'none'
            }}>
              <img 
                src={mooshikaTracing}
                alt="Mooshika"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  animation: isTracing ? 'mooshikaBounce 0.5s ease-in-out infinite' : 'mooshikaIdle 2s ease-in-out infinite',
                  filter: mooshikaState === 'happy' ? 
                    'brightness(1.2) saturate(1.2)' : 
                    'brightness(0.8) saturate(0.7) hue-rotate(15deg)',
                  userSelect: 'none'
                }}
              />
              {/* Quality Indicator */}
              {isTracing && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-10px',
                  fontSize: '16px',
                  animation: 'sparkleFloat 1s ease-in-out infinite'
                }}>
                  😊
                </div>
              )}
            </div>
          </>
        )}

        {/* 🎊 Completion Sparkles */}
        {showCompletionSparkles && (
          <div style={{
            position: 'absolute',
            left: '55%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 25,
            width: '300px',
            height: '300px'
          }}>
            {[...Array(16)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${50 + Math.cos(i * 22.5 * Math.PI / 180) * 40}%`,
                top: `${50 + Math.sin(i * 22.5 * Math.PI / 180) * 40}%`,
                width: '16px',
                height: '16px',
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#F39C12', '#E74C3C'][i % 6],
                borderRadius: '50%',
                animation: `completionPop 3s ease-out ${i * 0.15}s`,
                boxShadow: '0 0 10px rgba(255,215,0,0.6)'
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurvedPathTracer;