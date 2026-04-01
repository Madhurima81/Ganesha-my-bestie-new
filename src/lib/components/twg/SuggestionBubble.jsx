// SuggestionBubble.jsx
// ─────────────────────────────────────────────────────────
// Inline suggestion bubble — appears inside the chat scroll
// as a Ganesha message. Replaces the full-screen
// InvitationModal for a more conversational feel.
//
// Props:
//   invitationLine  — string from engine.getInvitationLine()
//   onAccept        — child taps "Yes, let's try"
//   onDecline       — child taps "I want to keep talking"
// ─────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react'
import './SuggestionBubble.css'

export default function SuggestionBubble({ invitationLine, onAccept, onDecline }) {
  const bubbleRef = useRef(null)

  // Auto-scroll to reveal bubble fully when it appears
  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  // Use the engine-provided invitation line, or fall back to default
  const line = invitationLine || "Shall we do something together\nto help your heart feel lighter?"

  return (
    <div className="twg-suggestion" ref={bubbleRef}>
      <div className="twg-suggestion-bubble">

        {/* Ganesha ear badge */}
        <div className="twg-suggestion-badge">🐘</div>

        {/* Message text — supports \n line breaks */}
        <div className="twg-suggestion-text">
          {line.split('\n').map((part, i) => (
            <span key={i}>
              {part}
              {i < line.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Action pills */}
        <div className="twg-suggestion-actions">
          <button
            className="twg-suggest-btn primary"
            onClick={onAccept}
          >
            🌸 Yes, let's try
          </button>
          <button
            className="twg-suggest-btn ghost"
            onClick={onDecline}
          >
            🌿 I want to keep talking
          </button>
        </div>

      </div>
    </div>
  )
}
