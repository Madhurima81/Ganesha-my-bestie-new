// CurvedPathTracer.jsx - FIXED: Visual path now completes to the end point
import React, { useState, useRef, useEffect } from 'react';
import MooshikaCharacter from '../../components/MooshikaCharacter';

const CurvedPathTracer = ({
  onComplete,
  onProgress,
  disabled = false,
  showDebug = true,
  showMooshika = true,
  mooshikaSize = 95
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
    if (distanceFromStart < 30 && !isTracing) {
      setIsTracing(true);
      setShowCursor(true);
      setCurrentPosition({ x: 120, y: 140 });
      setTracedPath([{ x: 120, y: 140 }]);
      setProgress(0);
      setCurrentSegment(1);
      setQuality('good');
      showFeedback("Great start! Follow the orange path!");
    } else if (!isTracing) {
      showFeedback("Click the green circle to start!");
    }
  };

    // ✅ FIXED: Handle move with stricter completion and VISUAL path completion
    const handleMove = (e) => {
        if (!isTracing) return;

        const coords = getCoordinates(e);
        setCurrentPosition(coords);
        setTracedPath(prev => [...prev, coords]);

        const result = getSequentialProgress(coords.x, coords.y);

        setQuality(result.quality);

        if (result.segmentReached !== undefined && result.segmentReached === currentSegment) {
            setProgress(result.progress);

            const nextSegment = currentSegment + 1;
            if (nextSegment < pathSegments.length) {
                setCurrentSegment(nextSegment);
            }

            if (onProgress) {
                onProgress(result.progress, result.quality);
            }

            if (result.progress >= 100) {
                console.log('🎉 COMPLETED! All segments reached!');
                showFeedback("Perfect! You traced the whole elephant trunk!");
                setTracedPath(prev => [...prev, { x: 350, y: 80 }]);
                setIsTracing(false);
                setShowCursor(false);
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
                setTracedPath(prev => [...prev, { x: 350, y: 80 }]);
                setIsTracing(false);
                setShowCursor(false);
                showFeedback("Wonderful! You guided Mooshika to Ganesha!");
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
  };

  // ✅ Force complete (for testing) with visual path fix
  const forceComplete = () => {
      console.log('⚡ Force completing trace');
      setProgress(100);
      setCurrentSegment(pathSegments.length - 1);
      setTracedPath(prev => [...prev, { x: 350, y: 80 }]);
      setIsTracing(false);
      setShowCursor(false);
      setQuality('complete');
      showFeedback("Force completed!");
      if (onComplete) {
          onComplete();
      }
  };

  const renderTracedPath = () => {
    if (tracedPath.length < 2) return null;
    const pathPoints = tracedPath.map(p => `${p.x},${p.y}`).join(' ');
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

  // The rest of the return statement (JSX) remains the same.
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '20px auto' }}>
        {feedbackMessage && (
            <div style={{ position: 'absolute', top: '-0px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255, 68, 68, 0.95)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', zIndex: 20, border: '2px solid #FFD700', maxWidth: '400px', textAlign: 'center' }}>
                {feedbackMessage}
            </div>
        )}
        <div style={{ width: '50%', height: '12px', background: '#444', borderRadius: '4px', marginBottom: '15px', overflow: 'hidden', border: '1px solid #445' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: getQualityColor(quality), transition: 'width 0.3s ease, background-color 0.3s ease' }} />
        </div>
        {/*{showDebug && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', zIndex: 10, fontFamily: 'monospace' }}>
                <div>Progress: {Math.round(progress)}%</div>
                <div>Quality: {quality}</div>
                <div>Segment: {currentSegment}/{pathSegments.length - 1}</div>
                <div>Target: {pathSegments[Math.min(currentSegment, pathSegments.length - 1)]?.name || 'complete'}</div>
                <div>End Dist: {Math.round(Math.sqrt(Math.pow(currentPosition.x - 350, 2) + Math.pow(currentPosition.y - 80, 2)))}px</div>
            </div>
        )}*/}
        <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
            <svg ref={svgRef} viewBox="0 0 600 200" style={{ width: '100%', height: '100%', cursor: isTracing ? 'none' : 'pointer', touchAction: 'none', background: 'transparent' }} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}>
                <path d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="70" fill="none" strokeLinecap="round" />
                <path d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" stroke="#FF8C42" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray="12,6" opacity="0.9" />
                {progress > 0 && <path d="M 120 140 Q 200 165 320 175 Q 420 165 450 140 Q 480 110 350 80" stroke="#00FF88" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray={`${progress * 4.5} 500`} opacity="1" />}
                {renderTracedPath()}
                <circle cx="120" cy="140" r="16" fill="#00FF00" stroke="#fff" strokeWidth="3"><animate attributeName="r" values="13;19;13" dur="2s" repeatCount="indefinite" /></circle>
                <text x="120" y="147" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">START</text>
                <circle cx="350" cy="80" r="20" fill="#FF4444" stroke="#fff" strokeWidth="3"><animate attributeName="r" values="17;23;17" dur="2s" repeatCount="indefinite" /></circle>
                <text x="350" y="87" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">END</text>
                {showDebug && currentSegment < pathSegments.length && <circle cx={pathSegments[currentSegment].x} cy={pathSegments[currentSegment].y} r="12" fill="none" stroke="#FFFF00" strokeWidth="3" opacity="0.8"><animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" /></circle>}
                {showCursor && <circle cx={currentPosition.x} cy={currentPosition.y} r="8" fill={getQualityColor(quality)} stroke="#000" strokeWidth="2" opacity="0.9"><animate attributeName="r" values="6;12;6" dur="1s" repeatCount="indefinite" /></circle>}
                {showMooshika && <MooshikaCharacter position={currentPosition} tracedPath={tracedPath} pathQuality={quality} isTracing={isTracing} isVisible={tracedPath.length > 0} size={mooshikaSize} />}
            </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
            <button onClick={reset} style={{ background: '#FF6B6B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Reset</button>
            <button onClick={forceComplete} style={{ background: '#4ECDC4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⚡ Complete</button>
        </div>
        {/*<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 10px' }}>
{pathSegments.map((segment, index) => (
                  <div key={index} style={{ width: '8px', height: '8px', borderRadius: '50%', background: index < currentSegment ? '#00FF00' : index === currentSegment ? '#FFFF00' : '#666', border: '2px solid white' }} />
            ))}
        </div>*/}
    </div>
  );
};

export default CurvedPathTracer;