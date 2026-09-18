import React, { useState, useRef, useEffect, useCallback } from 'react';

const FreeDraggableItem = ({
  id,
  children,
  position = { top: '0%', left: '0%' },
  bounds,
  dragDelay = 0,
  onPositionChange,
  onDragStart,
  onDragEnd,
  style = {},
  className = '',
  disabled = false,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [dragStarted, setDragStarted] = useState(false);
  
  const elementRef = useRef(null);
  const dragDataRef = useRef({
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    offsetX: 0,
    offsetY: 0,
    dragTimer: null,
    hasMoved: false
  });

  // Convert percentage to pixels for calculations
  const percentToPixels = useCallback((percent, dimension) => {
    if (!elementRef.current || !elementRef.current.parentElement) return 0;
    const parentSize = dimension === 'width' 
      ? elementRef.current.parentElement.offsetWidth
      : elementRef.current.parentElement.offsetHeight;
    return (parseFloat(percent) / 100) * parentSize;
  }, []);

  // Convert pixels to percentage
  const pixelsToPercent = useCallback((pixels, dimension) => {
    if (!elementRef.current || !elementRef.current.parentElement) return 0;
    const parentSize = dimension === 'width' 
      ? elementRef.current.parentElement.offsetWidth
      : elementRef.current.parentElement.offsetHeight;
    return (pixels / parentSize) * 100;
  }, []);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  // FIXED: Handle drag start with proper event handling
  const handleDragStart = useCallback((clientX, clientY, event) => {
    if (disabled) return;

    // Only prevent default for non-passive events
    if (event && event.cancelable) {
      event.preventDefault();
    }

    const rect = elementRef.current.getBoundingClientRect();
    const parentRect = elementRef.current.parentElement.getBoundingClientRect();
    
    dragDataRef.current = {
      startX: clientX,
      startY: clientY,
      startLeft: percentToPixels(currentPosition.left, 'width'),
      startTop: percentToPixels(currentPosition.top, 'height'),
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      dragTimer: null,
      hasMoved: false
    };

    if (dragDelay > 0) {
      dragDataRef.current.dragTimer = setTimeout(() => {
        if (!dragDataRef.current.hasMoved) {
          setIsDragging(true);
          setDragStarted(true);
          onDragStart?.();
        }
      }, dragDelay);
    } else {
      setIsDragging(true);
      setDragStarted(true);
      onDragStart?.();
    }
  }, [disabled, currentPosition, dragDelay, onDragStart, percentToPixels]);

  // FIXED: Handle drag move with proper event handling
  const handleDragMove = useCallback((clientX, clientY, event) => {
    if (!isDragging && !dragDataRef.current.dragTimer) return;

    // Only prevent default for non-passive events
    if (event && event.cancelable) {
      event.preventDefault();
    }

    const deltaX = clientX - dragDataRef.current.startX;
    const deltaY = clientY - dragDataRef.current.startY;
    
    // Check if we've moved enough to start dragging
    if (!dragDataRef.current.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragDataRef.current.hasMoved = true;
    }

    if (isDragging || dragStarted) {
      let newLeft = dragDataRef.current.startLeft + deltaX;
      let newTop = dragDataRef.current.startTop + deltaY;

      // Apply bounds if specified
      if (bounds && elementRef.current.parentElement) {
        const parentWidth = elementRef.current.parentElement.offsetWidth;
        const parentHeight = elementRef.current.parentElement.offsetHeight;
        const elementWidth = elementRef.current.offsetWidth;
        const elementHeight = elementRef.current.offsetHeight;

        const minLeft = percentToPixels(bounds.left || 0, 'width');
        const maxLeft = percentToPixels(bounds.right || 100, 'width') - elementWidth;
        const minTop = percentToPixels(bounds.top || 0, 'height');
        const maxTop = percentToPixels(bounds.bottom || 100, 'height') - elementHeight;

        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        newTop = Math.max(minTop, Math.min(maxTop, newTop));
      }

      const newPosition = {
        left: `${pixelsToPercent(newLeft, 'width')}%`,
        top: `${pixelsToPercent(newTop, 'height')}%`
      };

      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  }, [isDragging, dragStarted, bounds, onPositionChange, percentToPixels, pixelsToPercent]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    // Only prevent default for non-passive events
    if (event && event.cancelable) {
      event.preventDefault();
    }

    if (dragDataRef.current.dragTimer) {
      clearTimeout(dragDataRef.current.dragTimer);
      dragDataRef.current.dragTimer = null;
    }

    if (isDragging || dragStarted) {
      setIsDragging(false);
      setDragStarted(false);
      onDragEnd?.();
    }

    dragDataRef.current.hasMoved = false;
  }, [isDragging, dragStarted, onDragEnd]);

  // FIXED: Mouse event handlers
  const handleMouseDown = useCallback((event) => {
    handleDragStart(event.clientX, event.clientY, event);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((event) => {
    handleDragMove(event.clientX, event.clientY, event);
  }, [handleDragMove]);

  const handleMouseUp = useCallback((event) => {
    handleDragEnd(event);
  }, [handleDragEnd]);

  // FIXED: Touch event handlers with proper passive handling
  const handleTouchStart = useCallback((event) => {
    // Don't prevent default - let it be passive
    const touch = event.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((event) => {
    // Don't prevent default - let it be passive
    const touch = event.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback((event) => {
    // Don't prevent default - let it be passive
    handleDragEnd();
  }, [handleDragEnd]);

  const handleTouchCancel = useCallback((event) => {
    // Interrupted touch sequence (incoming call, notification, app switch) - end drag same as touchend
    handleDragEnd();
  }, [handleDragEnd]);

  // FIXED: Event listeners with proper passive options
  useEffect(() => {
    if (isDragging || dragDataRef.current.dragTimer) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Touch events - explicitly set as non-passive only when needed
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchCancel);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  // Self-terminate an in-progress drag the moment the caller disables the item mid-drag
  // (no call site currently wraps this with its own pause/interrupt handling).
  useEffect(() => {
    if (disabled && (isDragging || dragStarted)) {
      if (dragDataRef.current.dragTimer) {
        clearTimeout(dragDataRef.current.dragTimer);
        dragDataRef.current.dragTimer = null;
      }
      setIsDragging(false);
      setDragStarted(false);
      dragDataRef.current.hasMoved = false;
      onDragEnd?.();
    }
  }, [disabled, isDragging, dragStarted, onDragEnd]);

  return (
    <div
      ref={elementRef}
      className={`draggable-item ${className} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: currentPosition.left,
        top: currentPosition.top,
        cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        userSelect: 'none',
        touchAction: 'none', // This prevents browser default touch behaviors
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </div>
  );
};

export default FreeDraggableItem;