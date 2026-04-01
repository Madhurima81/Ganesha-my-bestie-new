// EmotionChipPanel.jsx
// Entry point into Talk With Ganesha — child picks their feeling
// Chip tap = conversation starter (not navigation)
import React from 'react';
import './EmotionChipPanel.css';

function EmotionChip({ id, label, emoji, onClick }) {
  return (
    <button className={`emotion-chip emotion-chip--${id}`} onClick={onClick}>
      <span className="chip-emoji">{emoji}</span>
      <span className="chip-label">{label}</span>
    </button>
  );
}

export default function EmotionChipPanel({
  emotions = [],
  onSelectEmotion,
  prompt = "How is your heart feeling today?",
}) {
  return (
    <div className="emotion-panel">
      <div className="emotion-prompt">{prompt}</div>
      <div className="emotion-chip-grid">
        {emotions.map((emotion) => (
          <EmotionChip
            key={emotion.id}
            {...emotion}
            onClick={() => onSelectEmotion(emotion)}
          />
        ))}
      </div>
    </div>
  );
}
