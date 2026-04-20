// KidsDraggable.jsx
// Clean drag-and-drop for kids apps using pointer events + floating clone.
// No HTML5 drag API. No offset math. Works on touch and mouse.
// Pattern: Duolingo Kids / Khan Academy Kids approach.
//
// Usage:
//   <KidsDraggable id="apple" data={{ type: 'wish2-food', foodKey: 'apple' }} disabled={false}>
//     <img src={appleImg} />
//   </KidsDraggable>
//
//   <KidsDropZone accepts="wish2-food" onDrop={(data) => handleDrop(data)}>
//     <img src={plateImg} />
//   </KidsDropZone>

import React, { useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// KidsDraggable
// ─────────────────────────────────────────────────────────────
export const KidsDraggable = ({
  id,
  data,
  disabled = false,
  onDragStart,
  onDragEnd,
  children,
  style = {},
}) => {
  const wrapperRef = useRef(null);
  // Store clone ref so pointermove/up handlers always have it
  const cloneRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      if (disabled) return;
      // Only left mouse button or any touch/pen
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      isDraggingRef.current = true;
      onDragStart?.(id, data);

      // Ghost the original
      el.style.opacity = '0.35';

      // Create floating clone that follows the finger
      const rect = el.getBoundingClientRect();
      const clone = el.cloneNode(true);

      clone.style.position = 'fixed';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      // Center clone on finger/cursor
      clone.style.left = `${e.clientX - rect.width / 2}px`;
      clone.style.top = `${e.clientY - rect.height / 2}px`;
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '1';
      clone.style.transform = 'scale(1.08)';
      clone.style.transition = 'transform 0.1s ease';
      clone.style.borderRadius = '50%';
      clone.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))';
      clone.setAttribute('aria-hidden', 'true');
      document.body.appendChild(clone);
      cloneRef.current = clone;

      // Capture pointer so we get move/up even outside element
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current || !cloneRef.current) return;
      const clone = cloneRef.current;
      const w = parseFloat(clone.style.width);
      const h = parseFloat(clone.style.height);
      // Keep clone centered on finger at all times
      clone.style.left = `${e.clientX - w / 2}px`;
      clone.style.top  = `${e.clientY - h / 2}px`;
    };

    const onPointerUp = (e) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Restore original
      el.style.opacity = '';

      // Remove clone
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }

      // Find what is under the finger at release point
      // Use the CENTER of where the clone was (= finger position)
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const dropTarget = elements.find(
        (node) => node.dataset && node.dataset.kidsDropzone
      );

      if (dropTarget) {
        // Fire drop event on the target
        dropTarget.dispatchEvent(
          new CustomEvent('kids-drop', {
            bubbles: false,
            detail: { id, data },
          })
        );
      }

      onDragEnd?.(id);
    };

    const onPointerCancel = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      el.style.opacity = '';
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }
    };

    el.addEventListener('pointerdown',   onPointerDown,   { passive: false });
    el.addEventListener('pointermove',   onPointerMove,   { passive: true });
    el.addEventListener('pointerup',     onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.removeEventListener('pointerdown',   onPointerDown);
      el.removeEventListener('pointermove',   onPointerMove);
      el.removeEventListener('pointerup',     onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
      // Safety: remove any orphaned clone on unmount
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }
    };
  }, [id, data, disabled, onDragStart, onDragEnd]);

  return (
    <div
      ref={wrapperRef}
      style={{
        cursor: disabled ? 'default' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        WebkitUserSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      data-kids-draggable={id}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// KidsDropZone
// ─────────────────────────────────────────────────────────────
export const KidsDropZone = ({
  id,
  accepts,           // string — matches data.type from KidsDraggable
  onDrop,            // ({ id, data }) => void
  disabled = false,
  children,
  style = {},
  className,
}) => {
  const zoneRef = useRef(null);

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;

    const handleDrop = (e) => {
      if (disabled) return;
      const { id: dragId, data } = e.detail;
      // Type check — only accept matching food type
      if (accepts && data?.type !== accepts) return;
      onDrop?.({ id: dragId, data });
    };

    el.addEventListener('kids-drop', handleDrop);
    return () => el.removeEventListener('kids-drop', handleDrop);
  }, [id, accepts, onDrop, disabled]);

  return (
    <div
      ref={zoneRef}
      data-kids-dropzone={id}
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default KidsDraggable;
