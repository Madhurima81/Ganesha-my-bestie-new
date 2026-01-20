import React, { useState } from 'react';
import './DrawOrWritePad.css';
import DrawingPad from './Drawingpad';

const DrawOrWritePad = ({ 
  onSave, 
  onCancel, 
  prompt = "Create your answer!",
  mode = "both", // "both", "draw-only", "text-only"
  defaultTab = "draw", // "draw" or "text"
  maxTextLength = 50
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [textInput, setTextInput] = useState('');
  const [drawingSaved, setDrawingSaved] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handleSave = () => {
    if (activeTab === 'draw' && hasDrawn && drawingSaved) {
      onSave({
        type: 'drawing',
        content: drawingSaved
      });
    } else if (activeTab === 'text' && textInput.trim()) {
      onSave({
        type: 'text',
        content: textInput.trim()
      });
    }
  };

  const canSave = 
    (activeTab === 'draw' && hasDrawn) || 
    (activeTab === 'text' && textInput.trim().length > 0);

  // Determine which tabs to show
  const showDrawTab = mode === 'both' || mode === 'draw-only';
  const showTextTab = mode === 'both' || mode === 'text-only';

  return (
    <div className="draw-or-write-overlay">
      <div className="draw-or-write-modal">
        
        {/* Header */}
        <div className="draw-or-write-header">
          <h2 className="draw-or-write-prompt">{prompt}</h2>
        </div>

        {/* Tabs */}
        {mode === 'both' && (
          <div className="draw-or-write-tabs">
            {showDrawTab && (
              <button
                className={`tab-button ${activeTab === 'draw' ? 'active' : ''}`}
                onClick={() => setActiveTab('draw')}
              >
                🎨 Draw
              </button>
            )}
            {showTextTab && (
              <button
                className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                ✏️ Type
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="draw-or-write-content">
          
          {/* Drawing Tab - Uses existing DrawingPad */}
          {activeTab === 'draw' && (
            <div className="drawing-area-wrapper">
              <DrawingPad
                onSave={(imageData) => {
                  setDrawingSaved(imageData);
                  setHasDrawn(true);
                }}
                onCancel={onCancel}
              />
            </div>
          )}

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div className="text-area">
              <textarea
                className="text-input"
                value={textInput}
                onChange={(e) => {
                  if (e.target.value.length <= maxTextLength) {
                    setTextInput(e.target.value);
                  }
                }}
                placeholder="Type your answer here..."
                maxLength={maxTextLength}
                autoFocus
              />
              <div className="text-counter">
                {textInput.length} / {maxTextLength}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="draw-or-write-actions">
          <button 
            className="cancel-btn"
            onClick={onCancel}
          >
            ❌ Cancel
          </button>
          <button 
            className={`save-btn ${!canSave ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            ✅ Save {activeTab === 'draw' ? 'Drawing' : 'Text'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawOrWritePad;