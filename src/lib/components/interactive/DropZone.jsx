// DropZone.jsx
import React, { useRef, useState, useEffect } from 'react';

const DropZone = ({
  id,
  acceptTypes = [],
  onDrop,
  disabled = false,
  children,
  className,
  style = {}
}) => {
  const [isOver, setIsOver] = useState(false);
  const zoneRef = useRef(null);

  // ── Refs so the touch handlers always have current values
  //    without re-registering listeners on every render ──────────────────────
  const acceptTypesRef = useRef(acceptTypes);
  const onDropRef      = useRef(onDrop);
  const disabledRef    = useRef(disabled);

  // Keep refs in sync with props on every render (cheap, no effect re-run)
  useEffect(() => { acceptTypesRef.current = acceptTypes; });
  useEffect(() => { onDropRef.current      = onDrop; });
  useEffect(() => { disabledRef.current    = disabled; });

  // Set up custom event listeners for touch devices — registered ONCE per id
  useEffect(() => {
    const element = zoneRef.current;
    if (!element) return;

    element.setAttribute('data-dropzone', id);

    const handleCustomDragOver = (e) => {
      if (disabledRef.current) return;
      const { data } = e.detail;
      const types = acceptTypesRef.current;
      const isAcceptable = types.length === 0 ||
        (data && data.type && types.includes(data.type));
      if (isAcceptable) {
        setIsOver(true);
        e.preventDefault();
      }
    };

    const handleCustomDrop = (e) => {
      if (disabledRef.current) return;
      setIsOver(false);
      const { id: itemId, data } = e.detail;
      const types = acceptTypesRef.current;
      const isAcceptable = types.length === 0 ||
        (data && data.type && types.includes(data.type));
      if (isAcceptable && onDropRef.current) {
        onDropRef.current({ id: itemId, data });
      }
    };

    element.addEventListener('custom-dragover', handleCustomDragOver);
    element.addEventListener('custom-drop',     handleCustomDrop);

    return () => {
      element.removeEventListener('custom-dragover', handleCustomDragOver);
      element.removeEventListener('custom-drop',     handleCustomDrop);
    };
  }, [id]); // Only re-register if the zone id itself changes
  
  // Standard HTML5 drag and drop handlers
  const handleDragOver = (e) => {
    if (disabled) {
      return;
    }
    
    // Prevent default to allow drop
    e.preventDefault();
    
    // Get the dragged item data
    let itemData;
    try {
      const dataTransfer = e.dataTransfer.getData('application/json');
      if (dataTransfer) {
        itemData = JSON.parse(dataTransfer);
      }
    } catch (error) {
      // Ignore parsing errors
      console.log('Error parsing data:', error);
    }
    
    // For touch events, check the global variable
    if (!itemData && window.__dragData) {
      itemData = window.__dragData;
    }
    
    // Check if the item type is acceptable
    const isAcceptable = acceptTypes.length === 0 || 
      (itemData && itemData.data && itemData.data.type && 
       acceptTypes.includes(itemData.data.type));
    
    if (isAcceptable) {
      // Set drop effect
      e.dataTransfer.dropEffect = 'move';
      
      // Update visual state
      setIsOver(true);
    }
  };
  
  const handleDragEnter = (e) => {
    if (disabled) return;
    
    // Similar logic to handleDragOver
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = (e) => {
    if (disabled) return;
    
    // Update visual state
    setIsOver(false);
  };
  
  const handleDrop = (e) => {
    if (disabled) return;
    
    // Prevent default browser actions
    e.preventDefault();
    
    // Reset visual state
    setIsOver(false);
    
    // Get the dropped item data
    let itemData;
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        itemData = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
    
    // If no data from dataTransfer, check global state (for touch)
    if (!itemData && window.__dragData) {
      itemData = window.__dragData;
    }
    
    // Check if the item type is acceptable
    const isAcceptable = acceptTypes.length === 0 || 
      (itemData && itemData.data && itemData.data.type && 
       acceptTypes.includes(itemData.data.type));
    
    if (isAcceptable && itemData && onDrop) {
      // Call the onDrop handler
      onDrop(itemData);
    }
  };

  // Remove visual feedback border — no green box
  const dropZoneStyle = {
    border: 'none',
    background: 'transparent',
    transition: 'all 0.3s ease',
    ...style // Apply user styles after defaults
  };

  return (
    <div
      ref={zoneRef}
      className={className}
      style={dropZoneStyle}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-dropzone={id} // For identification with touch events
    >
      {children}
    </div>
  );
};

export default DropZone;