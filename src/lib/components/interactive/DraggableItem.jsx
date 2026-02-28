// DraggableItem.jsx
// Uses refs for drag state so touch handlers never have stale closures —
// eliminates the "sudden jump on first drag" offset bug.
// touchOffsetX/Y captures where within the element the finger landed so the
// element follows the finger at exactly that grab point (no center-snap).
import React, { useRef, useState, useEffect } from 'react';

const DraggableItem = ({
  id,
  data,
  onDragStart,
  onDragEnd,
  onPositionUpdate,
  disabled = false,
  children,
  allowFreeMovement = false,
  style = {}
}) => {
  const elementRef = useRef(null);

  // ── Refs for drag logic — always current, never stale in closures ─────────
  const isDraggingRef   = useRef(false);
  const dragModeRef     = useRef('dropzone');
  const originalSizeRef = useRef({ width: 0, height: 0, touchOffsetX: 0, touchOffsetY: 0 });

  // ── State only for rendering (opacity, draggable attr) ────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode,   setDragMode]   = useState('dropzone');

  // Pre-cache element size after mount
  useEffect(() => {
    if (elementRef.current && originalSizeRef.current.width === 0) {
      const timer = setTimeout(() => {
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect();
          originalSizeRef.current = { width: rect.width, height: rect.height };
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id]);

  // ── Touch event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      if (disabled) return;
      e.preventDefault();

      // Capture current size AND where within the element the finger landed —
      // this keeps the grab point under the finger throughout the drag (no center-snap).
      const rect   = element.getBoundingClientRect();
      const touch0 = e.touches[0];
      originalSizeRef.current = {
        width:        rect.width,
        height:       rect.height,
        touchOffsetX: touch0.clientX - rect.left,
        touchOffsetY: touch0.clientY - rect.top,
      };

      const mode = (allowFreeMovement || onPositionUpdate) ? 'free' : 'dropzone';

      // Set refs SYNCHRONOUSLY — no React async delay
      isDraggingRef.current = true;
      dragModeRef.current   = mode;

      // Update state for render (draggable attr / opacity) — async is fine here
      setIsDragging(true);
      setDragMode(mode);

      if (onDragStart) onDragStart(id, data);

      if (mode === 'dropzone') {
        window.__dragData = { id, data };
      }

      element.style.opacity = '0.6';
    };

    const handleTouchMove = (e) => {
      // Use ref — always current, no stale closure issue
      if (!isDraggingRef.current) return;

      const touch   = e.touches[0];
      // Use the recorded grab-point offset so the element stays exactly where
      // the finger first touched it (not snapping its center to the finger).
      const offsetX = originalSizeRef.current.touchOffsetX;
      const offsetY = originalSizeRef.current.touchOffsetY;

      element.style.position     = 'fixed';
      element.style.top          = `${touch.clientY - offsetY}px`;
      element.style.left         = `${touch.clientX - offsetX}px`;
      element.style.zIndex       = '1000';
      element.style.pointerEvents = 'none';
      element.style.width        = `${originalSizeRef.current.width}px`;
      element.style.height       = `${originalSizeRef.current.height}px`;

      if (dragModeRef.current === 'dropzone') {
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementsUnderTouch.find(el => el.getAttribute('data-dropzone'));
        if (dropZone) {
          dropZone.dispatchEvent(new CustomEvent('custom-dragover', { detail: { id, data } }));
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (!isDraggingRef.current) return;

      // Reset ref immediately
      isDraggingRef.current = false;
      setIsDragging(false);

      const touch = e.changedTouches[0];
      const mode  = dragModeRef.current;

      // Clean up inline styles
      element.style.position     = '';
      element.style.top          = '';
      element.style.left         = '';
      element.style.zIndex       = '';
      element.style.opacity      = '';
      element.style.pointerEvents = '';
      element.style.width        = '';
      element.style.height       = '';

      if (mode === 'free') {
        const finalPosition = {
          top:  `${(touch.clientY / window.innerHeight) * 100}%`,
          left: `${(touch.clientX / window.innerWidth)  * 100}%`,
        };
        if (onPositionUpdate) onPositionUpdate(finalPosition);
      } else {
        // Find drop zone under finger
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementsUnderTouch.find(el => el.getAttribute('data-dropzone'));
        if (dropZone) {
          dropZone.dispatchEvent(new CustomEvent('custom-drop', {
            detail: { id, data, sourceElement: element }
          }));
        }
        window.__dragData = null;
      }

      if (onDragEnd) onDragEnd(id);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    element.addEventListener('touchend',   handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove',  handleTouchMove);
      element.removeEventListener('touchend',   handleTouchEnd);
    };
    // isDragging and dragMode intentionally NOT in deps — using refs instead
  }, [id, data, onDragStart, onDragEnd, onPositionUpdate, disabled, allowFreeMovement]);

  // ── Mouse / desktop drag handlers (dropzone mode) ─────────────────────────
  const handleDragStart = (e) => {
    if (disabled) { e.preventDefault(); return; }

    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      // Capture where within the element the mouse clicked (grab-point offset)
      originalSizeRef.current = {
        width:        rect.width,
        height:       rect.height,
        touchOffsetX: e.clientX - rect.left,
        touchOffsetY: e.clientY - rect.top,
      };
    }

    const mode = (allowFreeMovement || onPositionUpdate) ? 'free' : 'dropzone';
    isDraggingRef.current = true;
    dragModeRef.current   = mode;
    setIsDragging(true);
    setDragMode(mode);

    if (mode === 'dropzone') {
      e.dataTransfer.setData('application/json', JSON.stringify({ id, data }));
      e.dataTransfer.effectAllowed = 'move';

      if (elementRef.current) {
        const rect   = elementRef.current.getBoundingClientRect();
        const w      = Math.round(rect.width);
        const h      = Math.round(rect.height);
        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        const img = elementRef.current.querySelector('img');
        if (img) {
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          e.dataTransfer.setDragImage(canvas, w / 2, h / 2);
        }
      }
    } else {
      e.preventDefault();

      const handleMouseMove = (moveEvent) => {
        if (!elementRef.current) return;
        // Use the recorded grab-point so the element stays under the click spot
        const offsetX = originalSizeRef.current.touchOffsetX;
        const offsetY = originalSizeRef.current.touchOffsetY;
        elementRef.current.style.position     = 'fixed';
        elementRef.current.style.top          = `${moveEvent.clientY - offsetY}px`;
        elementRef.current.style.left         = `${moveEvent.clientX - offsetX}px`;
        elementRef.current.style.zIndex       = '1000';
        elementRef.current.style.pointerEvents = 'none';
        elementRef.current.style.opacity      = '0.6';
        elementRef.current.style.width        = `${originalSizeRef.current.width}px`;
        elementRef.current.style.height       = `${originalSizeRef.current.height}px`;
      };

      const handleMouseUp = (upEvent) => {
        const finalPosition = {
          top:  `${(upEvent.clientY / window.innerHeight) * 100}%`,
          left: `${(upEvent.clientX / window.innerWidth)  * 100}%`,
        };
        if (elementRef.current) {
          elementRef.current.style.position     = '';
          elementRef.current.style.top          = '';
          elementRef.current.style.left         = '';
          elementRef.current.style.zIndex       = '';
          elementRef.current.style.pointerEvents = '';
          elementRef.current.style.opacity      = '';
          elementRef.current.style.width        = '';
          elementRef.current.style.height       = '';
        }
        if (onPositionUpdate) onPositionUpdate(finalPosition);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup',   handleMouseUp);
        isDraggingRef.current = false;
        setIsDragging(false);
        if (onDragEnd) onDragEnd(id);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup',   handleMouseUp);
    }

    if (onDragStart) onDragStart(id, data);
  };

  const handleDragEnd = () => {
    if (dragModeRef.current === 'dropzone') {
      isDraggingRef.current = false;
      setIsDragging(false);
      if (onDragEnd) onDragEnd(id);
    }
  };

  return (
    <div
      ref={elementRef}
      draggable={!disabled && dragMode === 'dropzone'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        cursor:     disabled ? 'default' : 'grab',
        opacity:    isDragging ? 0.6 : 1,
        userSelect: 'none',
        touchAction: 'none',
        width:  '100%',
        height: '100%',
        ...style
      }}
      data-draggable={id}
    >
      {children}
    </div>
  );
};

export default DraggableItem;
