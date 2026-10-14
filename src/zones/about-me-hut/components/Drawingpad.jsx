import React, { useState, useRef, useEffect } from 'react';
import GestureDemo from '../../../lib/components/feedback/GestureDemo';
import './Drawingpad.css';

const DrawingPad = ({ 
  prompt = "Draw your dream 💛",
  onSave,
  onCancel,
  initialData, // <--- NEW: Data to restore
  onAutoSave   // <--- NEW: Function to save progress
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [tool, setTool] = useState('draw');
  const [textInput, setTextInput] = useState(null);
  // Drawing is a free-form drag, not a tap — show a quick "move your finger
  // to draw" demo the first time this pad opens, same as other drag mechanics.
  const [showDrawIntro, setShowDrawIntro] = useState(true);

  // Initialize canvas & Restore Data
  useEffect(() => {
    const canvas = canvasRef.current;

    // Set canvas resolution from rendered size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');

    // 1. Basic Setup
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;

    // 2. Fill White Background (Default)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 3. RESTORE PREVIOUS DRAWING (If it exists)
    if (initialData) {
      const img = new Image();
      img.src = initialData;
      img.onload = () => {
        // Draw the saved image onto the canvas
        context.drawImage(img, 0, 0);
      };
    }
  }, []); // Run once on mount
  
  // Update brush/eraser settings dynamically
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (isEraser) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = brushSize * 3;
      } else {
        context.strokeStyle = color;
        context.lineWidth = brushSize;
      }
    }
  }, [color, brushSize, isEraser]);

  const activateText = () => {
    setTool('text');
    setIsEraser(false);
    setShowDrawIntro(false);
  };
  
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };
  
  const startDrawing = (e) => {
    e.preventDefault();
    setShowDrawIntro(false);
    const { x, y } = getCoordinates(e);

    if (tool === 'text') {
      setTextInput({ x, y, value: '' });
      return;
    }

    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (tool !== 'draw' || !isDrawing) return;
    e.preventDefault();
    const context = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      canvas.getContext('2d').closePath();
      setIsDrawing(false);

      // --- AUTO SAVE LOGIC ---
      // Save every time a stroke is finished
      if (onAutoSave) {
        const imageData = canvas.toDataURL('image/png');
        onAutoSave(imageData);
      }
    }
  };

  const commitText = () => {
    if (!textInput?.value.trim()) {
      setTextInput(null);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.save();
    context.fillStyle = color;
    context.font = '700 34px "Baloo 2", sans-serif';
    context.textBaseline = 'top';
    context.fillText(textInput.value.trim(), textInput.x, textInput.y);
    context.restore();

    if (onAutoSave) {
      onAutoSave(canvas.toDataURL('image/png'));
    }

    setTextInput(null);
    setTool('draw');
  };
  
  const handleSave = () => {
    const imageData = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      // Pass image data back
      onSave({ image: imageData });
    }
  };

  const handleDownload = () => {
    const imageData = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'my-dream.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const colors = [
    '#FFA500', // Orange
    '#FF6B6B', // Red
    '#52C41A', // Green
    '#45B7D1', // Blue
    '#BB8FCE', // Purple
    '#795548'  // Brown
  ];
  
  const brushSizes = [3, 8, 15]; // Small, Medium, Large

  return (
    <div className="simple-drawing-pad">
      {/* Title with close button */}
      <div className="title-row">
        <h2 className="simple-title">{prompt}</h2>
        {onCancel && (
          <button className="close-x-btn" onClick={onCancel} title="Close">
            x
          </button>
        )}
      </div>
      
      {/* Main Container */}
      <div className="simple-container">
        {/* Left Sidebar - Colors & Tools */}
        <div className="simple-sidebar">
          {/* Colors */}
          {colors.map((clr) => (
            <button
              key={clr}
              className={`simple-color ${color === clr && !isEraser ? 'active' : ''}`}
              style={{ backgroundColor: clr }}
              onClick={() => {
                setColor(clr);
                setIsEraser(false);
                setTool('draw');
                setTextInput(null);
              }}
            />
          ))}
          
          {/* Eraser */}
          <button
            className={`simple-eraser ${isEraser ? 'active' : ''}`}
            onClick={() => {
              setTool('draw');
              setTextInput(null);
              setIsEraser((prev) => !prev);
            }}
            title="Eraser"
          >
            {'\u{1F9FD}'}
          </button>

          <button
            className={`simple-text-tool ${tool === 'text' ? 'active' : ''}`}
            onClick={activateText}
            title="Add text"
            aria-label="Add text"
          >
            Aa
          </button>
          
          {/* Brush Sizes */}
          <div className="brush-size-icons">
            {brushSizes.map((size, idx) => (
              <button
                key={size}
                className={`brush-size-btn ${brushSize === size ? 'active' : ''}`}
                onClick={() => {
                  setBrushSize(size);
                  setIsEraser(false);
                  setTool('draw');
                  setTextInput(null);
                }}
                title={['Small', 'Medium', 'Large'][idx]}
              >
                <div 
                  className="brush-dot" 
                  style={{ 
                    width: `${8 + idx * 6}px`, 
                    height: `${8 + idx * 6}px`,
                    backgroundColor: color
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Canvas */}
        <div className="simple-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="simple-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {textInput && canvasRef.current && (
            <input
              autoFocus
              className="canvas-text-input"
              value={textInput.value}
              maxLength={24}
              onChange={(e) =>
                setTextInput((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitText();
                }

                if (e.key === 'Escape') {
                  setTextInput(null);
                  setTool('draw');
                }
              }}
              onBlur={commitText}
              style={{
                left: `${(textInput.x / canvasRef.current.width) * 100}%`,
                top: `${(textInput.y / canvasRef.current.height) * 100}%`,
              }}
            />
          )}
          <GestureDemo
            type="drag"
            from={{ x: 30, y: 60 }}
            to={{ x: 65, y: 35 }}
            active={showDrawIntro}
            idleDelay={300}
            zIndex={5}
          />
        </div>
      </div>
      
      {/* Done Button */}
      <div className="drawing-actions">
          <button className="done-btn" onClick={handleSave}>
            Done
          </button>

          <button className="download-btn" onClick={handleDownload} title="Save to device">
            Save
          </button>
      </div>
    </div>
  );
};

export default DrawingPad;
