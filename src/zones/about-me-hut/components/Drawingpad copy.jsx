import React, { useState, useRef, useEffect } from 'react';
import './Drawingpad.css';

const DrawingPad = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [showStickers, setShowStickers] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    
    // Set canvas background to transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set initial stroke style
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);
  
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize]);
  
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    context.lineTo(x, y);
    context.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.closePath();
      setIsDrawing(false);
    }
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const addSticker = (sticker) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Add sticker text to center of canvas
    context.font = '48px Arial';
    context.fillText(sticker, canvas.width / 2 - 24, canvas.height / 2);
    setShowStickers(false);
  };
  
  const colorOptions = [
    { color: '#FF6B6B', name: 'Red' },
    { color: '#4ECDC4', name: 'Teal' },
    { color: '#45B7D1', name: 'Blue' },
    { color: '#FFA07A', name: 'Orange' },
    { color: '#98D8C8', name: 'Mint' },
    { color: '#F7DC6F', name: 'Yellow' },
    { color: '#BB8FCE', name: 'Purple' },
    { color: '#F8B4D9', name: 'Pink' },
    { color: '#85C1E2', name: 'Sky' },
    { color: '#52C41A', name: 'Green' }
  ];

  const stickers = ['❤️', '😊', '⭐', '🎂', '🎉', '✨', '💫', '🌟', '💖', '🎈'];

  return (
    <div className="drawing-pad-container">
      <div className="drawing-tools">
        {/* Color palette */}
        <div className="color-palette">
          {colorOptions.map((opt) => (
            <div
              key={opt.color}
              className={`color-option ${color === opt.color ? 'selected' : ''}`}
              onClick={() => setColor(opt.color)}
              style={{ backgroundColor: opt.color }}
              title={opt.name}
            />
          ))}
        </div>
        
        {/* Brush size */}
        <div className="brush-controls">
          <label>Brush Size: {brushSize}px</label>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
        </div>
        
        {/* Action buttons */}
        <div className="drawing-actions">
          <button className="drawing-btn stickers" onClick={() => setShowStickers(!showStickers)}>
            Add Stickers 🎨
          </button>
          <button className="drawing-btn clear" onClick={clearCanvas}>
            Clear 🗑️
          </button>
        </div>
      </div>
      
      {/* Stickers panel */}
      {showStickers && (
        <div className="stickers-panel">
          {stickers.map((sticker, idx) => (
            <button
              key={idx}
              className="sticker-btn"
              onClick={() => addSticker(sticker)}
            >
              {sticker}
            </button>
          ))}
        </div>
      )}
      
      {/* Canvas */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="drawing-instructions">
        Draw, add colors and stickers to make your poster special!
      </div>
    </div>
  );
};

export default DrawingPad;