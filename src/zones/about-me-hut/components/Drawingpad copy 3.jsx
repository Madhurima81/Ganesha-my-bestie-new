import React, { useState, useRef, useEffect } from 'react';
import './DrawingPad.css';

const DrawingPad = ({ 
  prompt = "Draw your dream 💛",
  onSave,
  onCancel 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textToAdd, setTextToAdd] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);
  
  // Update brush/eraser
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
  
  // Get the actual canvas dimensions
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
  
  // Calculate position relative to canvas with scaling
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
      canvasRef.current.getContext('2d').closePath();
      setIsDrawing(false);
    }
  };
  
  // Add text to canvas
  const handleAddText = () => {
    if (!textToAdd.trim()) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.font = 'bold 32px "Baloo 2", cursive';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.fillText(textToAdd, canvas.width / 2, canvas.height / 2);
    
    setTextToAdd('');
    setShowTextInput(false);
  };
  
  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Microphone access needed!');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };
  
  const playAudio = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };
  
  const handleSave = () => {
    const imageData = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      onSave({ image: imageData, audio: audioBlob });
    }
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
      
      {/* Bottom Tools */}
{/* Bottom Tools - Hidden for now */}
{false && (
  <div className="bottom-tools">
    {/* Text and Voice buttons hidden */}
  </div>
)}
      
      {/* Done Button */}
      <button className="done-btn" onClick={handleSave}>
        Done Drawing!
      </button>
      
      {onCancel && (
        <button className="cancel-link" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default DrawingPad;