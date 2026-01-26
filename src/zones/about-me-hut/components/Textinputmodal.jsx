import React, { useState } from 'react';
import './Textinputmodal.css';

const TextInputModal = ({ 
  prompt = "What's your answer?",
  onSave,
  onCancel,
  maxLength = 50,
  initialValue, // <--- NEW: To restore text
  onAutoSave    // <--- NEW: To save while typing
}) => {
  // Initialize with saved draft if available
  const [textInput, setTextInput] = useState(initialValue || '');

  const handleSave = () => {
    if (textInput.trim()) {
      onSave(textInput.trim());
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    
    // Only update if within length limit
    if (val.length <= maxLength) {
      setTextInput(val);
      
      // Send updates to parent for auto-saving
      if (onAutoSave) {
        onAutoSave(val);
      }
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
          onChange={handleChange} // Use new handler
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