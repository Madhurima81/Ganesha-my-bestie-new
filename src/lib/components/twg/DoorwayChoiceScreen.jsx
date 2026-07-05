// DoorwayChoiceScreen.jsx
// ─────────────────────────────────────────────────────────
// Full-scene emotional transition — child picks one gentle
// co-regulation path. Sits between InvitationModal and
// GuidedExperienceScene.
//
// UPDATED: Now driven by useGaneshaEngine.getDoorwayTools()
// instead of the old selectTechniques / coRegConfig system.
//
// Props:
//   engine            — useGaneshaEngine() instance
//   onSelectDoorway   — fires with selected tool object
//   onTalkMore        — child wants to return to chat
// ─────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import './DoorwayScene.css'

// ─────────────────────────────────────────────────────────
// ZONE → background image + heading copy
// Uses your existing zone names (mountain, river etc.)
// ─────────────────────────────────────────────────────────
const ZONE_CONFIG = {
  mountain: {
    heading: "Let's find your strength",
    sub:     'Pick one gentle way to begin',
    bg:      '/images/twg-bg.webp',
  },
  river: {
    heading: "Let's let it flow gently",
    sub:     'Choose something that feels right',
    bg:      '/images/twg-bg.webp',
  },
  cave: {
    heading: "Let's find our quiet place",
    sub:     'Pick one gentle step forward',
    bg:      '/images/twg-bg.webp',
  },
  hut: {
    heading: "Let's feel safe together",
    sub:     'Choose something warm to try',
    bg:      '/images/twg-bg.webp',
  },
  forest: {
    heading: "Let's breathe with the forest",
    sub:     'Pick something gentle',
    bg:      '/images/twg-bg.webp',
  },
  festival: {
    heading: "Let's find your spark again",
    sub:     'Choose something that lights you up',
    bg:      '/images/twg-bg.webp',
  },
  default: {
    heading: "Let's feel better together",
    sub:     'Pick something gentle',
    bg:      '/images/twg-bg.webp',
  },
}

// ─────────────────────────────────────────────────────────
// REGULATION MODE → card colour class
// Maps tool.regulation_mode → existing CSS class in DoorwayScene.css
// breath = gold, affirm = purple, hum = teal
// ─────────────────────────────────────────────────────────
const MODE_TO_CLASS = {
  movement:    'hum',
  breathing:   'breath',
  stillness:   'breath',
  affirmation: 'affirm',
  creative:    'affirm',
  sensory:     'hum',
}

// ─────────────────────────────────────────────────────────
// REGULATION MODE → emoji icon
// ─────────────────────────────────────────────────────────
const MODE_TO_EMOJI = {
  movement:    '🐘',
  breathing:   '🌊',
  stillness:   '⭐',
  affirmation: '✨',
  creative:    '🎨',
  sensory:     '🌿',
}

// ─────────────────────────────────────────────────────────
// DOORWAY CARD
// Unchanged from original — just uses tool fields now
// ─────────────────────────────────────────────────────────
function DoorwayCard({ title, subtitle, icon, mode, onClick }) {
  return (
    <div
      className={`door-option ${mode}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className="door-option-icon">{icon}</span>
      <div>
        <div className="door-option-title">{title}</div>
        <div className="door-option-desc">{subtitle}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function DoorwayChoiceScreen({
  engine,
  onSelectDoorway,
  onTalkMore,
}) {
  const { session } = engine

  // Zone config — falls back to default if zone not found
  const zone   = session.nature_zone || 'mountain'
  const config = ZONE_CONFIG[zone] || ZONE_CONFIG.default

  // Load tools from engine when component mounts
  const [tools, setTools] = useState([])

  useEffect(() => {
    const selected = engine.getDoorwayTools()
    setTools(selected)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tool selection
  const handleSelect = (tool) => {
    const { template, affirmation } = engine.selectTool(tool)
    onSelectDoorway({ tool, template, affirmation })
  }

  return (
    <div className="door-scene door-scene-enter">

      {/* Background — zone-specific image */}
      <div
        className="door-bg"
        style={{ backgroundImage: `url('${config.bg}')` }}
      />

      {/* Calm vignette overlay */}
      <div className="door-overlay" />

      {/* Ganesha — bottom-left floating */}
      <img
        className="door-ganesha"
        src="/images/ganesha-sit-final.svg"
        alt="Ganesha"
        draggable={false}
      />

      {/* Title block — upper centre */}
      <div className="door-title-wrap">
        <div className="door-title">{config.heading}</div>
        <div className="door-subtitle">{config.sub}</div>
      </div>

      {/* Option cards — right side */}
      <div className="door-options">
        {tools.length === 0 ? (
          // Loading fallback — shows briefly while engine selects
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Nunito',
            textAlign: 'center',
            padding: 20,
          }}>
            Finding the right path...
          </div>
        ) : (
          tools.map((tool) => (
            <DoorwayCard
              key={tool.tool_id}
              title={tool.tool_name}
              subtitle={tool.short_subtitle}
              icon={MODE_TO_EMOJI[tool.regulation_mode] || '🐘'}
              mode={MODE_TO_CLASS[tool.regulation_mode] || 'breath'}
              onClick={() => handleSelect(tool)}
            />
          ))
        )}
      </div>

      {/* Talk-more escape hatch — unchanged */}
      <button className="door-talk-link" onClick={onTalkMore}>
        I just want to talk
      </button>

    </div>
  )
}
