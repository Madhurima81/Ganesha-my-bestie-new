// DraggableItem.jsx - ENHANCED VERSION
// 🎯 Supports both drop zones AND free movement
import React, { useRef, useState, useEffect } from 'react';

const DraggableItem = ({
  id,
  data,
  onDragStart,
  onDragEnd,
  onPositionUpdate, // 🆕 NEW: Add position update support
  disabled = false,
  children,
  allowFreeMovement = false, // 🆕 NEW: Enable free movement mode
  style = {} // Allow custom styles to override defaults
}) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState('dropzone'); // 'dropzone' or 'free'
  const originalSizeRef = useRef({ width: 0, height: 0 }); // 🔧 Store original size

  // 🔧 FIX: Pre-cache element size after render to avoid first-drag offset issues
  // Use setTimeout to ensure CSS layout has completed before measuring
  useEffect(() => {
    if (elementRef.current && originalSizeRef.current.width === 0) {
      // Wait for next frame to ensure CSS has been applied
      const timer = setTimeout(() => {
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect();
          originalSizeRef.current = {
            width: rect.width,
            height: rect.height
          };
          console.log(`📐 Pre-cached size for ${id}:`, originalSizeRef.current);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id]);

  // Add touch event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleTouchStart = (e) => {
      if (disabled) return;

      // Prevent default to avoid scrolling while dragging
      e.preventDefault();

      // 🔧 FIX: Capture original size BEFORE any transformations
      const rect = element.getBoundingClientRect();
      originalSizeRef.current = {
        width: rect.width,
        height: rect.height
      };

      // Get touch position
      const touch = e.touches[0];
      setTouchStartPos({
        x: touch.clientX,
        y: touch.clientY
      });

      // Determine drag mode based on allowFreeMovement and onPositionUpdate
      const mode = (allowFreeMovement || onPositionUpdate) ? 'free' : 'dropzone';
      setDragMode(mode);

      console.log(`🎮 Touch drag started for ${id} in ${mode} mode`);

      // Notify parent of drag start
      if (onDragStart) {
        onDragStart(id, data);
      }

      setIsDragging(true);

      if (mode === 'dropzone') {
        // Set data transfer for drop zones to recognize
        const dataTransfer = { id, data };
        window.__dragData = dataTransfer;
      }

      // Add visual indicator
      element.style.opacity = '0.6';
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;

      // Get current touch position
      const touch = e.touches[0];

      // 🔧 FIX: Use the ORIGINAL captured size for offset calculation
      const offsetX = originalSizeRef.current.width / 2;
      const offsetY = originalSizeRef.current.height / 2;

      if (dragMode === 'free') {
        // 🆕 FREE MOVEMENT MODE - Follow finger exactly, centered
        element.style.position = 'fixed';
        element.style.top = `${touch.clientY - offsetY}px`;
        element.style.left = `${touch.clientX - offsetX}px`;
        element.style.zIndex = '1000';
        element.style.pointerEvents = 'none';
        // 🔧 FIX: Lock the size to original dimensions
        element.style.width = `${originalSizeRef.current.width}px`;
        element.style.height = `${originalSizeRef.current.height}px`;
      } else {
        // 🔄 EXISTING DROPZONE MODE
        element.style.position = 'fixed';
        element.style.top = `${touch.clientY - offsetY}px`;
        element.style.left = `${touch.clientX - offsetX}px`;
        element.style.zIndex = '1000';
        element.style.pointerEvents = 'none';
        // 🔧 FIX: Lock the size to original dimensions
        element.style.width = `${originalSizeRef.current.width}px`;
        element.style.height = `${originalSizeRef.current.height}px`;
        
        // Find drop zone element under finger
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementsUnderTouch.find(el => el.getAttribute('data-dropzone'));
        
        if (dropZone) {
          const event = new CustomEvent('custom-dragover', {
            detail: { id, data }
          });
          dropZone.dispatchEvent(event);
        }
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Get final touch position
      const touch = e.changedTouches[0];
      
      console.log(`🎮 Touch drag ended for ${id} in ${dragMode} mode`);
      
      if (dragMode === 'free') {
        // 🆕 FREE MOVEMENT MODE - Update position

        // Calculate final position as percentage
        const finalPosition = {
          top: `${(touch.clientY / window.innerHeight) * 100}%`,
          left: `${(touch.clientX / window.innerWidth) * 100}%`
        };

        console.log(`🐭 Free movement final position:`, finalPosition);

        // Clean up styles - let parent handle positioning
        element.style.position = '';
        element.style.top = '';
        element.style.left = '';
        element.style.zIndex = '';
        element.style.opacity = '';
        element.style.pointerEvents = '';
        element.style.width = ''; // 🔧 Clear locked size
        element.style.height = ''; // 🔧 Clear locked size

        // Update parent with new position
        if (onPositionUpdate) {
          onPositionUpdate(finalPosition);
        }
      } else {
        // 🔄 EXISTING DROPZONE MODE

        // Clean up styles
        element.style.position = '';
        element.style.top = '';
        element.style.left = '';
        element.style.zIndex = '';
        element.style.opacity = '';
        element.style.pointerEvents = '';
        element.style.width = ''; // 🔧 Clear locked size
        element.style.height = ''; // 🔧 Clear locked size
        
        // Find drop zone under touch
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementsUnderTouch.find(el => el.getAttribute('data-dropzone'));
        
        if (dropZone) {
          // Trigger drop event
          const event = new CustomEvent('custom-drop', {
            detail: { id, data, sourceElement: element }
          });
          dropZone.dispatchEvent(event);
        }
        
        // Clean up global state
        window.__dragData = null;
      }
      
      // Notify parent of drag end
      if (onDragEnd) {
        onDragEnd(id);
      }
    };
    
    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [id, data, onDragStart, onDragEnd, onPositionUpdate, disabled, isDragging, allowFreeMovement, dragMode]);
  
  // 🔄 EXISTING: Standard drag and drop handlers with mouse support
  const handleDragStart = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // 🔧 FIX: Capture original size BEFORE any transformations
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      originalSizeRef.current = {
        width: rect.width,
        height: rect.height
      };
    }

    // Determine drag mode for mouse/desktop
    const mode = (allowFreeMovement || onPositionUpdate) ? 'free' : 'dropzone';
    setDragMode(mode);

    console.log(`🖱️ Mouse drag started for ${id} in ${mode} mode`);
    
    if (mode === 'dropzone') {
      // 🔄 EXISTING DROPZONE BEHAVIOR
      e.dataTransfer.setData('application/json', JSON.stringify({ id, data }));
      e.dataTransfer.effectAllowed = 'move';
      
      // Create drag image
      if (elementRef.current) {
        // 🔧 FIX: Use actual element size for drag image
        const rect = elementRef.current.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const img = elementRef.current.querySelector('img');
        if (img) {
          ctx.drawImage(img, 0, 0, width, height);
          ctx.globalAlpha = 0.6;
          e.dataTransfer.setDragImage(canvas, width / 2, height / 2);
        }
      }
    } else {
      // 🆕 FREE MOVEMENT MODE - Prevent default drag behavior and handle manually
      e.preventDefault();
      
      // Add mouse move listeners for free movement
      const handleMouseMove = (moveEvent) => {
        if (elementRef.current) {
          // 🔧 FIX: Use the ORIGINAL captured size for offset calculation
          const offsetX = originalSizeRef.current.width / 2;
          const offsetY = originalSizeRef.current.height / 2;

          elementRef.current.style.position = 'fixed';
          elementRef.current.style.top = `${moveEvent.clientY - offsetY}px`;
          elementRef.current.style.left = `${moveEvent.clientX - offsetX}px`;
          elementRef.current.style.zIndex = '1000';
          elementRef.current.style.pointerEvents = 'none';
          elementRef.current.style.opacity = '0.6';
          // 🔧 FIX: Lock the size to original dimensions
          elementRef.current.style.width = `${originalSizeRef.current.width}px`;
          elementRef.current.style.height = `${originalSizeRef.current.height}px`;
        }
      };
      
      const handleMouseUp = (upEvent) => {
        // Calculate final position
        const finalPosition = {
          top: `${(upEvent.clientY / window.innerHeight) * 100}%`,
          left: `${(upEvent.clientX / window.innerWidth) * 100}%`
        };
        
        console.log(`🖱️ Mouse free movement final position:`, finalPosition);
        
        // Clean up
        if (elementRef.current) {
          elementRef.current.style.position = '';
          elementRef.current.style.top = '';
          elementRef.current.style.left = '';
          elementRef.current.style.zIndex = '';
          elementRef.current.style.pointerEvents = '';
          elementRef.current.style.opacity = '';
          elementRef.current.style.width = ''; // 🔧 Clear locked size
          elementRef.current.style.height = ''; // 🔧 Clear locked size
        }
        
        // Update position
        if (onPositionUpdate) {
          onPositionUpdate(finalPosition);
        }
        
        // Clean up listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // End drag
        setIsDragging(false);
        if (onDragEnd) {
          onDragEnd(id);
        }
      };
      
      // Add listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    setIsDragging(true);
    
    // Notify parent component
    if (onDragStart) {
      onDragStart(id, data);
    }
  };
  
  const handleDragEnd = (e) => {
    if (dragMode === 'dropzone') {
      setIsDragging(false);
      
      // Notify parent component
      if (onDragEnd) {
        onDragEnd(id);
      }
    }
    // Free movement mode handles this in mouse up handler
  };

  return (
    <div
      ref={elementRef}
      draggable={!disabled && dragMode === 'dropzone'} // Only draggable in dropzone mode
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={dragMode === 'free' ? handleDragStart : undefined} // Handle mouse down for free mode
      style={{
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.6 : 1,
        userSelect: 'none',
        touchAction: 'none',
        width: '100%',
        height: '100%',
        ...style // Allow custom styles to override
      }}
      data-draggable={id}
    >
      {children}
    </div>
  );
};

export default DraggableItem;