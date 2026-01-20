// zones/shared/components/LetterInputKeyboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import './LetterInputKeyboard.css';

const LetterInputKeyboard = ({
  onConfirm,
  minLetters = 2,
  maxLetters = 20,
  placeholder = "Type your Friend's Name",
  confirmButtonText = "That's My Friend! ✓",
  deleteButtonText = "⌫ Delete"
}) => {
  const [letters, setLetters] = useState([]);
  const [systemInput, setSystemInput] = useState('');
  const inputRef = useRef(null);
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Sync letters array with system input
  useEffect(() => {
    const lettersFromInput = systemInput.toUpperCase().split('').filter(char => /[A-Z]/.test(char));
    setLetters(lettersFromInput);
  }, [systemInput]);

  // Handle virtual keyboard click
  const handleLetterClick = (letter) => {
    if (letters.length < maxLetters) {
      const newLetters = [...letters, letter];
      setLetters(newLetters);
      setSystemInput(newLetters.join(''));
    }
    inputRef.current?.focus();
  };

  // Handle backspace
  const handleBackspace = () => {
    const newLetters = letters.slice(0, -1);
    setLetters(newLetters);
    setSystemInput(newLetters.join(''));
    inputRef.current?.focus();
  };

  // Handle confirm
  const handleConfirm = () => {
    if (letters.length >= minLetters) {
      onConfirm(letters.join(''));
    }
  };

  // Handle system keyboard input
  const handleSystemInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (value.length <= maxLetters) {
      setSystemInput(value);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && letters.length >= minLetters) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Backspace' && !systemInput) {
      // Allow natural backspace
      return;
    }
  };

  return (
    <div className="letter-input-keyboard">
      {/* Hidden system input */}
      <input
        ref={inputRef}
        type="text"
        className="system-keyboard-input"
        value={systemInput}
        onChange={handleSystemInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
        placeholder={placeholder}
      />

      {/* Visual letter display */}
      <div className="friend-name-display">
        {letters.length === 0 ? (
          <div className="name-placeholder">{placeholder}</div>
        ) : (
          letters.map((letter, index) => (
            <div key={index} className="friend-letter pop-in">
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Control buttons */}
      <div className="friend-controls">
        <button 
          className="friend-backspace-btn" 
          onClick={handleBackspace} 
          disabled={letters.length === 0}
        >
          {deleteButtonText}
        </button>
        <button 
          className="friend-confirm-btn" 
          onClick={handleConfirm} 
          disabled={letters.length < minLetters}
        >
          {confirmButtonText}
        </button>
      </div>

      {/* Virtual keyboard */}
      <div className="friend-keyboard">
        {alphabet.map((letter, index) => (
          <button
            key={index}
            className="friend-letter-tile bounce-gentle"
            onClick={() => handleLetterClick(letter)}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            style={{ animationDelay: `${index * 0.02}s` }}
            disabled={letters.length >= maxLetters}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Helper hint */}
      <div className="keyboard-hint">
        💡 Type or click letters • Press Enter to confirm
      </div>
    </div>
  );
};

export default LetterInputKeyboard;