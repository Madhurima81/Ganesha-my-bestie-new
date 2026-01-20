import React, { useState, useRef, useEffect } from 'react';
import './DrawingPad.css';

const DrawingPad = ({ 
  prompt = "Draw here!",
  onSave,
  onCancel 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    
    // Set canvas background to white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial blank state
    saveToHistory();
    
    // Set initial stroke style
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);
  
  // Update brush/eraser settings
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (isEraser) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = brushSize * 2;
      } else {
        context.strokeStyle = color;
        context.lineWidth = brushSize;
      }
    }
  }, [color, brushSize, isEraser]);
  
  // Save canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
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
      saveToHistory();
    }
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };
  
  // Undo
  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyStep - 1];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep - 1);
    }
  };
  
  // Redo
  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyStep + 1];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep + 1);
    }
  };
  
  // Toggle eraser
  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };
  
  // Save drawing
  const handleSave = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    if (onSave) {
      onSave(imageData);
    }
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
    { color: '#52C41A', name: 'Green' },
    { color: '#795548', name: 'Brown' },
    { color: '#000000', name: 'Black' }
  ];

  return (
    <div className="drawing-pad-container">
      <h2 className="drawing-prompt">{prompt}</h2>
      
      <div className="drawing-tools">
        {/* Color palette */}
        <div className="color-palette">
          {colorOptions.map((opt) => (
            <div
              key={opt.color}
              className={`color-option ${color === opt.color && !isEraser ? 'selected' : ''}`}
              onClick={() => {
                setColor(opt.color);
                setIsEraser(false);
              }}
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
          <button 
            className={`drawing-btn eraser ${isEraser ? 'active' : ''}`}
            onClick={toggleEraser}
          >
            {isEraser ? '✓ Eraser ON' : '🧹 Eraser'}
          </button>
          
          <button 
            className="drawing-btn undo"
            onClick={undo}
            disabled={historyStep <= 0}
          >
            ↶ Undo
          </button>
          
          <button 
            className="drawing-btn redo"
            onClick={redo}
            disabled={historyStep >= history.length - 1}
          >
            ↷ Redo
          </button>
          
          <button 
            className="drawing-btn clear"
            onClick={clearCanvas}
          >
            Clear 🗑️
          </button>
        </div>
        
        {/* Save/Cancel buttons */}
        <div className="drawing-submit-actions">
          <button 
            className="drawing-btn save"
            onClick={handleSave}
          >
            ✓ Done Drawing!
          </button>
          
          {onCancel && (
            <button 
              className="drawing-btn cancel"
              onClick={onCancel}
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </div>
      
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
        💡 Tip: Use your finger or mouse to draw! Use the eraser to fix mistakes.
      </div>
    </div>
  );
};

export default DrawingPad;