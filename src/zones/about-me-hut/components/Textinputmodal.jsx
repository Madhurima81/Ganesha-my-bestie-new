import React, { useState } from 'react';
import './Textinputmodal.css';

const TextInputModal = ({ 
  prompt = "What's your answer?",
  onSave,
  onCancel,
  maxLength = 50,
  initialValue,
  onAutoSave
}) => {
  const [textInput, setTextInput] = useState(initialValue || '');

  const handleSave = () => {
    if (textInput.trim()) {
      onSave(textInput.trim());
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      setTextInput(val);
      if (onAutoSave) onAutoSave(val);
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

        <div className="text-input-wrapper">
          <textarea
            className="text-input-box"
            value={textInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
            maxLength={maxLength}
            autoFocus
            rows={3}
          />
        </div>

        <div className="text-input-actions">
          <button
            className={`text-save-btn ${!textInput.trim() ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!textInput.trim()}
          >
            Continue
          </button>
        </div>

        <button className="text-cancel-link" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TextInputModal;
