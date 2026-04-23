import React, { useState, useRef, useEffect } from 'react';
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
  
  // Unused features commented out for cleanliness based on your snippet
  // const [showTextInput, setShowTextInput] = useState(false);
  // const [textToAdd, setTextToAdd] = useState('');
  
  // Initialize canvas & Restore Data
  useEffect(() => {
    const canvas = canvasRef.current;
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
    const context = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
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
      {/* Title */}
      <h2 className="simple-title">{prompt}</h2>
      
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
              }}
            />
          ))}
          
          {/* Eraser */}
          <button
            className={`simple-eraser ${isEraser ? 'active' : ''}`}
            onClick={() => setIsEraser(!isEraser)}
            title="Eraser"
          >
            🧹
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
        <canvas
          ref={canvasRef}
          width={700}
          height={450}
          className="simple-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {/* Done Button */}
      <div className="drawing-actions">
          <button className="done-btn" onClick={handleSave}>
            Done Drawing
          </button>

          <button className="download-btn" onClick={handleDownload} title="Save to device">
            💾 Save
          </button>

          {onCancel && (
            <button className="cancel-link" onClick={onCancel}>
              Cancel
            </button>
          )}
      </div>
    </div>
  );
};

export default DrawingPad;