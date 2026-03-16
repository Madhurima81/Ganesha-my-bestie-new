// lib/components/scenes/InteractionManager.jsx
import React from 'react';
import InteractiveElementWrapper from '../interactive/InteractiveElementWrapper';

export const InteractionManager = ({ 
  children, 
  sceneState, 
  sceneActions 
}) => {
  const handleInteraction = (elementId, interactionType, data = {}) => {
    console.log(`Interaction: ${elementId} - ${interactionType}`, data);
    sceneActions.trackInteraction(elementId, {
      type: interactionType,
      ...data
    });
  };
  
  // Provide interaction handlers to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onInteraction: handleInteraction,
        interactions: sceneState.interactions
      });
    }
    return child;
  });
  
  return <>{childrenWithProps}</>;
};

// Simple clickable element wrapper
export const ClickableElement = ({ 
  id, 
  children, 
  onClick,
  completed = false,
  onInteraction,
  zone = "default-zone",
  disableTransformFeedback = false
}) => {
  const handleClick = () => {
    if (onInteraction) {
      onInteraction(id, 'click');
    }
    if (onClick) {
      onClick(id);
    }
  };
  
  return (
    <InteractiveElementWrapper
      onClick={handleClick}
      zone={zone}
      completed={completed ? "true" : undefined}
      disableTransformFeedback={disableTransformFeedback}
    >
      {children}
    </InteractiveElementWrapper>
  );
};

export default InteractionManager;
