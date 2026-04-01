// src/lib/components/GaneshaSceneWhisper.jsx
// ───────────────────────────────────────────
// Renders Ganesha with a speech bubble.
// Plays voice line on mount or on tap.
// Used in ZoneWelcome (zone-welcome + scene-invite)
// and SceneCompletionCelebration (scene-bridge).
//
// Props:
//   type           → 'zone-welcome' | 'scene-invite' | 'scene-bridge'
//   sceneId        → matches key in sceneWhisperConfig.js
//   childName      → string (falls back to active profile if empty)
//   childAge       → number (default 7)
//   autoPlay       → bool (default false)
//   autoDismissMs  → ms after voice ends to hide bubble (0 = never, default 0)
//   onDone         → callback when voice line ends
//   size           → 'small' | 'medium' (default 'small')

import { useState, useEffect, useRef } from 'react'
import useGaneshaVoice from '../hooks/useGaneshaVoice'
import GaneshaPresence from './character/GaneshaPresence'
import GameStateManager from '../services/GameStateManager'
import {
  ZONE_WELCOMES,
  SCENE_INVITES,
  SCENE_BRIDGES,
} from '../../config/sceneWhisperConfig'

const resolveChildName = (propName) => {
  if (propName) return propName
  try {
    return GameStateManager.getActiveProfile()?.name || ''
  } catch {
    return ''
  }
}

export default function GaneshaSceneWhisper({
  type          = 'scene-invite',
  sceneId       = '',
  childName     = '',
  childAge      = 7,
  autoPlay      = false,
  autoDismissMs = 0,
  onDone        = null,
  size          = 'small',
}) {
  const { speak, stop, isSpeaking } = useGaneshaVoice()
  const [played, setPlayed]         = useState(false)
  const [visible, setVisible]       = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const dismissTimerRef             = useRef(null)

  const getConfig = () => {
    switch (type) {
      case 'zone-welcome':  return ZONE_WELCOMES[sceneId]
      case 'scene-invite':  return SCENE_INVITES[sceneId]
      case 'scene-bridge':  return SCENE_BRIDGES[sceneId]
      default: return null
    }
  }

  const interpolate = (text) => {
    if (!text) return ''
    return text.replace(/\{\{name\}\}/g, resolveChildName(childName))
  }

  const scheduleDismiss = () => {
    if (!autoDismissMs) return
    clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = setTimeout(() => setVisible(false), autoDismissMs)
  }

  const dismiss = (e) => {
    if (e) e.stopPropagation()
    clearTimeout(dismissTimerRef.current)
    stop()
    setVisible(false)
    // Treat dismiss as "heard" — child saw and interacted with the whisper
    onDone?.()
  }

  const playLine = (e) => {
    if (e) e.stopPropagation()
    const config = getConfig()
    if (!config) return

    // Cancel any existing dismiss timer when replaying
    clearTimeout(dismissTimerRef.current)

    const text = interpolate(config.text)
    setBubbleText(text)
    setVisible(true)

    if (config.preRecorded) {
      const audio = new Audio(config.preRecorded)
      audio.play()
      audio.onended = () => {
        setPlayed(true)
        scheduleDismiss()
        onDone?.()
      }
      return
    }

    const moment = type === 'scene-bridge' ? 'encouragement' : 'greeting'
    speak(text, {
      age: childAge,
      moment,
      onEnd: () => {
        setPlayed(true)
        scheduleDismiss()
        onDone?.()
      },
    })
  }

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !played) {
      const delay = type === 'zone-welcome' ? 500 : 300
      const t = setTimeout(playLine, delay)
      return () => clearTimeout(t)
    }
  }, [autoPlay, sceneId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      stop()
      clearTimeout(dismissTimerRef.current)
    }
  }, [stop])

  const config = getConfig()
  if (!config) return null

  const ganeshaSize = size === 'small' ? 52 : 72

  // scene-invite in tap mode: just show the Ganesha icon, no "ask me" text
  // (child learns quickly that tapping Ganesha = voice)
  const showAskHint = !visible && !autoPlay && type === 'scene-invite' && !played

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'flex-end',
        gap:        '0.4rem',
        position:   'relative',
        maxWidth:   size === 'small' ? 280 : 360,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Ganesha tap target */}
      <button
        onClick={playLine}
        style={{
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          padding:        0,
          flexShrink:     0,
          width:          ganeshaSize,
          height:         ganeshaSize,
          animation:      isSpeaking
            ? 'gswBob 0.8s ease-in-out infinite'
            : 'gswBob 3s ease-in-out infinite',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          position:       'relative',
        }}
        aria-label="Hear what Ganesha says"
      >
        <GaneshaPresence pose="blessing" size={ganeshaSize} breathing="gentle" />

        {/* Pulse ring while speaking */}
        {isSpeaking && (
          <div style={{
            position:     'absolute',
            inset:        -4,
            borderRadius: '50%',
            border:       '2px solid #FF9933',
            animation:    'gswPulse 1s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* Speech bubble */}
      {visible && bubbleText && (
        <div style={{
          background:             'rgba(255,255,255,0.97)',
          border:                 '2px solid rgba(255,215,0,0.55)',
          borderRadius:           16,
          borderBottomLeftRadius: 4,
          padding:                size === 'small' ? '0.45rem 2rem 0.45rem 0.7rem' : '0.6rem 2.2rem 0.6rem 0.9rem',
          boxShadow:              '0 4px 16px rgba(139,69,19,0.1)',
          animation:              'gswFadeIn 0.25s ease',
          flex:                   1,
          position:               'relative',
        }}>
          {/* × dismiss */}
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position:   'absolute',
              top:        4,
              right:      6,
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              fontSize:   '0.85rem',
              color:      '#8B4513',
              opacity:    0.4,
              lineHeight: 1,
              padding:    '2px 4px',
            }}
          >
            ×
          </button>

          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize:   size === 'small' ? '0.76rem' : '0.86rem',
            color:      '#5D2E0F',
            margin:     0,
            lineHeight: 1.5,
          }}>
            {bubbleText}
          </p>

          {/* Replay link — only after first play finishes */}
          {!isSpeaking && played && (
            <button
              onClick={playLine}
              style={{
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                fontSize:   '0.65rem',
                color:      '#8B4513',
                opacity:    0.4,
                padding:    '0.1rem 0',
                marginTop:  '0.2rem',
                fontFamily: 'Nunito, sans-serif',
                display:    'block',
              }}
            >
              hear again
            </button>
          )}
        </div>
      )}

      {/* Subtle tap hint — only before first play on scene-invite */}
      {showAskHint && (
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize:   '0.65rem',
          color:      '#8B4513',
          opacity:    0.4,
          alignSelf:  'center',
        }}>
          tap me
        </span>
      )}

      <style>{`
        @keyframes gswBob {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes gswPulse {
          0%   { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0;   transform: scale(1.45); }
        }
        @keyframes gswFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
