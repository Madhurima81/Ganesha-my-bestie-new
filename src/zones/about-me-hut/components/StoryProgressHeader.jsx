import React from 'react';
import './StoryProgressHeader.css';

const StoryProgressHeader = ({ discoveries = [], isChildMode = false }) => {  if (discoveries.length === 0) return null;

  
return (
  <div className={`story-strip ${isChildMode ? 'child-mode' : ''}`}>      {discoveries.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="story-strip-arrow">→</span>
          )}
   <div className="story-strip-item">
  {item.image ? (
    <img 
      src={item.image} 
      alt={item.name} 
      className="story-strip-icon"
    />
  ) : item.emoji ? (
    <span className="story-strip-emoji">{item.emoji}</span>
  ) : null}
  <span className="story-strip-text">{item.name}</span>
</div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StoryProgressHeader;