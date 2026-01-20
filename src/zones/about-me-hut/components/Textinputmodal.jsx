import React, { useState } from 'react';
import './TextInputModal.css';

const TextInputModal = ({ 
  prompt = "What's your answer?",
  onSave,
  onCancel,
  maxLength = 50
}) => {
  const [textInput, setTextInput] = useState('');

  const handleSave = () => {
    if (textInput.trim()) {
      onSave(textInput.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && textInput.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="text-input-overlay">
      <div className="text-input-modal">
        
        <h2 className="text-input-prompt">{prompt}</h2>
        
        <textarea
          className="text-input-box"
          value={textInput}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setTextInput(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          maxLength={maxLength}
          autoFocus
          rows={3}
        />
        
        <div className="text-counter">
          {textInput.length} / {maxLength}
        </div>
        
        <div className="text-input-actions">
          <button 
            className="text-cancel-btn"
            onClick={onCancel}
          >
            ✖ Cancel
          </button>
          <button 
            className={`text-save-btn ${!textInput.trim() ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!textInput.trim()}
          >
            ✅ Save
          </button>
        </div>
        
        <div className="text-input-hint">
          Press Enter to save • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default TextInputModal;