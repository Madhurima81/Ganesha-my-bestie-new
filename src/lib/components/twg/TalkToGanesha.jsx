// TalkToGanesha.jsx
// ─────────────────────────────────────────────────────────
// UPDATED: CoRegToolkit replaced with GuidedExperienceScene
// + CompletionScreen. useGaneshaEngine wired in alongside
// existing chat / voice / API logic (all preserved).
//
// What changed vs original:
//   - Added useGaneshaEngine hook
//   - CoRegToolkit → GuidedExperienceScene
//   - Added CompletionScreen after experience
//   - DoorwayChoiceScreen now receives engine prop
//   - handleEmotionSelect now also calls engine.setEmotionContext
//   - sendToGanesha also calls engine.processChildMessage
//   - Invitation logic defers to engine.shouldShowInvitation()
//   - All original voice / mic / API / safety logic unchanged
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react'
import GaneshaPresence       from '../character/GaneshaPresence'
import EmotionChipPanel      from './EmotionChipPanel'
import SuggestionBubble      from './SuggestionBubble'
import DoorwayChoiceScreen   from './DoorwayChoiceScreen'
import GuidedExperienceScene from './GuidedExperienceScene'
import CompletionScreen      from './CompletionScreen'
import { useGaneshaEngine }  from '../../hooks/useGaneshaEngine'
import './TalkToGanesha.css'

// ─────────────────────────────────────────────────────────
// EMOTION CHIP → ENGINE EMOTION MAP
// Maps old zone/feeling system to engine emotion names
// ─────────────────────────────────────────────────────────
const CHIP_TO_ENGINE_EMOTION = {
  angry:    { primary_emotion: 'anger',       intensity_level: 'strong',  nervous_system_need: 'energy_release', nature_zone: 'mountain', symbol_anchor: 'trunk'   },
  worried:  { primary_emotion: 'anxiety',     intensity_level: 'medium',  nervous_system_need: 'safety_signal',  nature_zone: 'cave',     symbol_anchor: 'mooshika'},
  sad:      { primary_emotion: 'sadness',     intensity_level: 'medium',  nervous_system_need: 'comfort',        nature_zone: 'river',    symbol_anchor: 'lotus'   },
  confused: { primary_emotion: 'confusion',   intensity_level: 'mild',    nervous_system_need: 'focus_reset',    nature_zone: 'cave',     symbol_anchor: 'eyes'    },
  happy:    { primary_emotion: 'overwhelm',   intensity_level: 'mild',    nervous_system_need: 'slowing_down',   nature_zone: 'festival', symbol_anchor: 'modak'   },
  tired:    { primary_emotion: 'overwhelm',   intensity_level: 'medium',  nervous_system_need: 'slowing_down',   nature_zone: 'hut',      symbol_anchor: 'belly'   },
  talk:     { primary_emotion: 'anxiety',     intensity_level: 'mild',    nervous_system_need: 'comfort',        nature_zone: 'hut',      symbol_anchor: 'belly'   },
}

const CHIP_DESIRED_AFTER_STATE = {
  angry: 'calm', worried: 'calm', sad: 'hopeful',
  confused: 'focused', happy: 'relaxed', tired: 'relaxed', talk: 'connected',
}

// ─────────────────────────────────────────────────────────
// PRESERVED from original — unchanged
// ─────────────────────────────────────────────────────────
const detectZone = (text) => {
  const t = text.toLowerCase()
  if (/angry|mad|furious|frustrated|hate|annoyed|rage/.test(t)) return 'Red'
  if (/sad|lonely|miss|cry|upset|depressed|alone/.test(t))      return 'Blue'
  if (/worried|scared|anxious|nervous|afraid|stress/.test(t))   return 'Yellow'
  return 'Yellow'
}

const detectFeeling = (text) => {
  const t = text.toLowerCase()
  if (/angry|mad|furious|frustrated/.test(t))       return 'angry'
  if (/sad|lonely|miss|cry|upset/.test(t))          return 'sad'
  if (/worried|scared|anxious|nervous/.test(t))     return 'worried'
  if (/belong|different|indian|culture|india/.test(t)) return 'identity'
  return 'universal'
}

const SAFETY_KEYWORDS = [
  'hurt', 'harm', 'scared', 'abuse', 'hit', 'unsafe', 'kill', 'die', 'blood',
]
const SAFETY_RESPONSE =
  "That sounds really hard. Please tell a grown-up you trust about this — a parent or teacher. You are safe and loved."

const ONE_MORE_MINUTE_RESPONSE =
  "I just want you to know — we have about one more minute together today. Let's make it a good one."

const EMOTION_OPTIONS = [
  { id: 'angry',   label: 'Angry',     emoji: '😡', zone: 'Red',    feeling: 'angry'    },
  { id: 'worried', label: 'Worried',   emoji: '😟', zone: 'Yellow', feeling: 'worried'  },
  { id: 'sad',     label: 'Sad',       emoji: '😢', zone: 'Blue',   feeling: 'sad'      },
  { id: 'confused',label: 'Confused',  emoji: '😕', zone: 'Yellow', feeling: 'universal'},
  { id: 'happy',   label: 'Happy',     emoji: '😊', zone: 'Green',  feeling: 'universal'},
  { id: 'tired',   label: 'Tired',     emoji: '😴', zone: 'Blue',   feeling: 'universal'},
  { id: 'talk',    label: 'Just talk', emoji: '💬', zone: 'Yellow', feeling: 'universal'},
]

const buildSystemPrompt = (childName, childAge, windDownLevel) => {
  const ageNote =
    childAge <= 8
      ? 'This child is 5–8 years old. Use very simple words. Short sentences. Concrete and warm. No abstract concepts.'
      : 'This child is 9–12 years old. You can be slightly more nuanced. Still warm, never preachy or lecture-y.'

  const windNote =
    windDownLevel >= 2
      ? 'IMPORTANT: Tell the child warmly that you have about one more minute together today. Keep your response to 1–2 sentences only.'
      : windDownLevel === 1
      ? 'Keep your responses shorter now — just 1–2 sentences.'
      : ''

  return `You are Ganesha — the beloved elephant-headed deity, remover of obstacles. You are speaking live with ${childName}.

Your personality: unhurried, warm, gently self-deprecating, practical. You NEVER lecture. You validate FIRST, then offer one gentle thought or question. You are genuinely curious about the child's world.

${ageNote}
${windNote}

INTERNAL SEL FRAMEWORK (never mention these to the child):
- Detect the child's emotional zone:
  RED = overwhelmed, angry, out of control → validate deeply, offer one breathing technique naturally
  YELLOW = anxious, silly, worried → validate, ask one curiosity question, optionally suggest a technique
  GREEN = happy, calm, curious → engage warmly, affirm, explore further together
  BLUE = sad, tired, withdrawn → extra warmth, gentle check-in, never push
- If distressed (RED or BLUE): weave in ONE simple co-regulation offer (e.g., "Want to try three slow breaths with me?")

Your voice:
- First person as Ganesha ("I", "me", "my Mooshika")
- Occasionally reference your elephant nature with warmth (big ears, love of modak, broken tusk)
- NRI children: bridge their Indian roots and the world they live in gently
- NEVER shame, judge, or give homework
- End with a question or gentle invitation — not a statement

Keep responses to 2–4 sentences. You are in a 5-minute session. Be present, not performative.`
}

const GANESHA_STATE_MAP = {
  idle:      { pose: 'blessing',  expression: 'happy'       },
  listening: { pose: 'blessing',  expression: 'encouraging' },
  thinking:  { pose: 'blessing',  expression: 'encouraging' },
  speaking:  { pose: 'thumbs_up', expression: 'excited'     },
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function TalkToGanesha({
  childName,
  childAge,
  windDownLevel,
  onClose,
  onSessionNote,
}) {
  // ── Engine (new) ──────────────────────────────────────
  const engine = useGaneshaEngine({ childAge: childAge || 8 })

  // 🐛 DEBUG — remove before release
  useEffect(() => { window._engine = engine }, [engine])

  // ── Original state — all preserved ───────────────────
  const [phase,          setPhase]          = useState('entry')
  const [voiceState,     setVoiceState]     = useState('idle')
  const [messages,       setMessages]       = useState([])
  const [inputText,      setInputText]      = useState('')
  const [turnCount,      setTurnCount]      = useState(0)
  const [windSpoken2,    setWindSpoken2]    = useState(false)
  const [showInvitation, setShowInvitation] = useState(false)
  const [showDoorway,    setShowDoorway]    = useState(false)
  const [showCoReg,      setShowCoReg]      = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)   // NEW
  const invitationShownRef                 = useRef(false)
  const [coRegZone,      setCoRegZone]      = useState('Yellow')
  const [coRegFeeling,   setCoRegFeeling]   = useState('universal')
  const [showTypeBox,    setShowTypeBox]    = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')

  // Template passed from doorway to experience (new)
  const [activeTemplate,  setActiveTemplate]  = useState(null)
  const [invitationLine,  setInvitationLine]  = useState(null)

  const recognitionRef = useRef(null)
  const chatEndRef     = useRef(null)
  const submittingRef  = useRef(false)
  const messagesRef    = useRef([])
  useEffect(() => { messagesRef.current = messages }, [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (windDownLevel >= 3) onClose()
  }, [windDownLevel, onClose])

  // ── Invitation logic — now defers to engine ──────────
  useEffect(() => {
    if (invitationShownRef.current) return
    if (showCoReg || showCompletion) return
    if (voiceState !== 'idle') return
    if (engine.shouldShowInvitation()) {
      invitationShownRef.current = true
      // Capture line here — safe to call setSession inside an effect
      setInvitationLine(engine.getInvitationLine())
      setShowInvitation(true)
    }
  }, [turnCount, showCoReg, showCompletion, voiceState, engine])

  useEffect(() => {
    if (windDownLevel >= 2 && !windSpoken2 && voiceState === 'idle') {
      setWindSpoken2(true)
      setMessages(prev => [...prev, { role: 'assistant', content: ONE_MORE_MINUTE_RESPONSE }])
      speak(ONE_MORE_MINUTE_RESPONSE)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windDownLevel])

  // ─────────────────────────────────────────────────────
  // TTS — unchanged
  // ─────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt   = new SpeechSynthesisUtterance(text)
    utt.rate    = 0.85
    utt.pitch   = 0.95
    utt.onend   = () => setVoiceState('idle')
    setVoiceState('speaking')
    window.speechSynthesis.speak(utt)
  }, [])

  // ─────────────────────────────────────────────────────
  // SEND TO GANESHA — original API logic + engine.processChildMessage
  // ─────────────────────────────────────────────────────
  const sendToGanesha = useCallback(async (userText, currentMessages) => {
    const lower = userText.toLowerCase()

    // Safety check — unchanged
    if (SAFETY_KEYWORDS.some(kw => lower.includes(kw))) {
      setMessages(prev => [...prev, { role: 'assistant', content: SAFETY_RESPONSE }])
      speak(SAFETY_RESPONSE)
      return
    }

    // Feed to engine — detects flags, updates turn count, chat mode
    engine.processChildMessage(userText)

    setCoRegZone(detectZone(userText))
    setCoRegFeeling(detectFeeling(userText))
    setVoiceState('thinking')

    const apiKey    = import.meta.env.VITE_ANTHROPIC_API_KEY
    const keyIsReal = apiKey && apiKey.startsWith('sk-ant-')

    if (!keyIsReal) {
      const fallback = "I'm so happy you're here with me. Tell me more — I'm listening with both of my big elephant ears!"
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      onSessionNote?.(userText.slice(0, 50))
      setTurnCount(c => c + 1)
      speak(fallback)
      submittingRef.current = false
      return
    }

    const history = currentMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-api-key':     apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system:     buildSystemPrompt(childName, childAge, windDownLevel),
          messages:   history,
        }),
      })

      if (!res.ok) throw new Error(`API ${res.status}`)

      const data  = await res.json()
      const reply = data.content?.[0]?.text || "I'm listening. Tell me more."

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      onSessionNote?.(userText.slice(0, 50))
      setTurnCount(c => c + 1)
      speak(reply)
    } catch {
      const fallback = "My ears are listening — the wind must have carried your words away. Try again?"
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      speak(fallback)
    } finally {
      submittingRef.current = false
    }
  }, [childName, childAge, windDownLevel, speak, onSessionNote, engine])

  // ─────────────────────────────────────────────────────
  // MIC / INPUT HANDLERS — all unchanged from original
  // ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (voiceState !== 'idle') return
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) { setShowTypeBox(true); return }

    const recognition           = new SpeechRec()
    recognitionRef.current      = recognition
    recognition.continuous      = true
    recognition.interimResults  = true
    recognition.lang            = 'en-US'

    recognition.onstart  = () => setVoiceState('listening')
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setLiveTranscript(transcript)
    }
    recognition.onend    = () => { if (voiceState === 'listening') setVoiceState('idle') }
    recognition.onerror  = (e) => {
      if (e.error === 'no-speech') return
      setVoiceState('idle')
      setShowTypeBox(true)
    }

    setLiveTranscript('')
    recognition.start()
  }, [voiceState])

  // ── Emotion chip tapped ──────────────────────────────
  const handleEmotionSelect = useCallback((emotion) => {
    setPhase('chat')
    setCoRegZone(emotion.zone)
    setCoRegFeeling(emotion.feeling)

    // NEW: also set engine emotion context
    const engineCtx = CHIP_TO_ENGINE_EMOTION[emotion.id] || CHIP_TO_ENGINE_EMOTION.talk
    engine.setEmotionContext({
      ...engineCtx,
      desired_after_state: CHIP_DESIRED_AFTER_STATE[emotion.id] || 'calm',
      safety_flag: 'none',
    })

    const text        = `I am feeling ${emotion.label.toLowerCase()}`
    submittingRef.current = true
    const userMsg     = { role: 'user', content: text }
    const newMessages = [...messagesRef.current, userMsg]
    setMessages(newMessages)
    sendToGanesha(text, newMessages)
  }, [sendToGanesha, engine])

  const handleEntryMic = useCallback(() => {
    setPhase('chat')
    startListening()
  }, [startListening])

  const handleRetry = useCallback(() => {
    recognitionRef.current?.stop()
    setLiveTranscript('')
    setVoiceState('idle')
    setTimeout(() => startListening(), 200)
  }, [startListening])

  const handleMicDone = useCallback(() => {
    recognitionRef.current?.stop()
    const text = liveTranscript.trim()
    setLiveTranscript('')
    if (!text || submittingRef.current) { setVoiceState('idle'); return }
    submittingRef.current = true
    const userMsg     = { role: 'user', content: text }
    const newMessages = [...messagesRef.current, userMsg]
    setMessages(newMessages)
    sendToGanesha(text, newMessages)
  }, [liveTranscript, sendToGanesha])

  const handleTextSubmit = useCallback(() => {
    const text = inputText.trim()
    if (!text || voiceState !== 'idle' || submittingRef.current) return
    submittingRef.current = true
    setPhase('chat')
    setInputText('')
    const userMsg     = { role: 'user', content: text }
    const newMessages = [...messagesRef.current, userMsg]
    setMessages(newMessages)
    sendToGanesha(text, newMessages)
  }, [inputText, voiceState, sendToGanesha])

  // ─────────────────────────────────────────────────────
  // DOORWAY → EXPERIENCE HANDLER (new)
  // ─────────────────────────────────────────────────────
  const handleDoorwaySelect = useCallback(({ tool, template, affirmation }) => {
    setActiveTemplate(template)
    setShowDoorway(false)
    setShowCoReg(true)
  }, [])

  // ─────────────────────────────────────────────────────
  // EXPERIENCE → COMPLETION HANDLER (new)
  // ─────────────────────────────────────────────────────
  const handleExperienceComplete = useCallback(() => {
    setShowCoReg(false)
    setShowCompletion(true)
  }, [])

  // ─────────────────────────────────────────────────────
  // COMPLETION → NEXT ACTION HANDLERS (new)
  // ─────────────────────────────────────────────────────
  const handleCompletionContinue = useCallback(() => {
    setShowCompletion(false)
    engine.resetSession()
    onClose()
  }, [engine, onClose])

  const handleTryAnother = useCallback(() => {
    setShowCompletion(false)
    invitationShownRef.current = false
    setShowDoorway(true)
  }, [])

  const handleCompletionTalkMore = useCallback(() => {
    setShowCompletion(false)
    engine.resetSession()
    // Returns to chat — session continues
  }, [engine])

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  const hitCap = turnCount >= 10
  const { pose, expression } = GANESHA_STATE_MAP[voiceState]

  const ZONE_TO_THEME   = { Red: 'mountain', Blue: 'river', Yellow: 'river', Green: 'festival' }
  const inviteTheme     = ZONE_TO_THEME[coRegZone] || 'default'
  const INVITE_LINE1    = {
    Red:    'Sometimes big feelings can feel like a storm inside.',
    Blue:   'Sometimes our heart feels a little heavy.',
    Yellow: 'Sometimes worries make our heart flutter.',
    Green:  "You're feeling great — let's make it even better!",
  }
  const inviteLine1 = INVITE_LINE1[coRegZone] || 'Sometimes our heart needs a little help.'

  return (
    <div className="ttg-overlay">

      <div className="ttg-panel">

        <button className="ttg-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Header — unchanged */}
        <div className="ttg-header">
          <div className={`ttg-avatar-ring ttg-avatar-ring--${voiceState}`}>
            <GaneshaPresence pose={pose} expression={expression} size={72} />
          </div>
          <div className="ttg-header-text">
            <span className="ttg-header-name">Ganesha</span>
            <span className="ttg-header-status">
              {phase === 'entry'                               && 'Tap or type to speak'}
              {phase === 'chat' && voiceState === 'idle'      && 'Tap the mic to speak'}
              {phase === 'chat' && voiceState === 'listening' && 'Listening...'}
              {phase === 'chat' && voiceState === 'thinking'  && 'Thinking...'}
              {phase === 'chat' && voiceState === 'speaking'  && 'Speaking...'}
            </span>
          </div>
        </div>

        {/* Chat area — unchanged */}
        <div className="ttg-chat">
          {phase === 'entry' ? (
            <EmotionChipPanel
              emotions={EMOTION_OPTIONS}
              onSelectEmotion={handleEmotionSelect}
              prompt="How is your heart feeling today?"
            />
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`ttg-bubble ttg-bubble--${msg.role}`}>
                  <span className="ttg-bubble__label">{msg.role === 'user' ? childName : 'Ganesha'}</span>
                  <p className="ttg-bubble__text">{msg.content}</p>
                </div>
              ))}
              {hitCap && (
                <div className="ttg-bubble ttg-bubble--assistant ttg-cap-msg">
                  <span className="ttg-bubble__label">Ganesha</span>
                  <p className="ttg-bubble__text">We've talked so much today! Want to do something together before you go?</p>
                </div>
              )}

              {/* Inline suggestion bubble — replaces full-screen InvitationModal */}
              {showInvitation && !showDoorway && !showCoReg && !showCompletion && (
                <SuggestionBubble
                  invitationLine={invitationLine}
                  onAccept={() => {
                    setShowInvitation(false)
                    setShowDoorway(true)
                  }}
                  onDecline={() => setShowInvitation(false)}
                />
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input area — unchanged */}
        {!hitCap && (
          <div className="ttg-input-area">
            {phase === 'entry' && (
              <div className="ttg-voice-area">
                <button className="ttg-mic-btn ttg-mic-btn--idle" onClick={handleEntryMic} aria-label="Tap to speak">
                  <svg viewBox="0 0 24 24" fill="none" className="ttg-mic-icon">
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
                    <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="9"  y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="ttg-type-toggle" onClick={() => { setPhase('chat'); setShowTypeBox(true) }}>
                  or type instead
                </button>
              </div>
            )}

            {phase === 'chat' && (
              !showTypeBox ? (
                <div className="ttg-voice-area">
                  <button
                    className={`ttg-mic-btn ttg-mic-btn--${voiceState}`}
                    onClick={voiceState === 'idle' ? startListening : undefined}
                    disabled={voiceState === 'thinking' || voiceState === 'speaking'}
                    aria-label="Tap to speak"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="ttg-mic-icon">
                      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
                      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="9"  y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {voiceState === 'listening' && <span className="ttg-mic-ring" />}
                  </button>
                  {liveTranscript && (
                    <div className="ttg-transcript-row">
                      <p className="ttg-transcript">{liveTranscript}</p>
                      <button className="ttg-retry-btn" onClick={handleRetry} aria-label="Clear and try again">✕</button>
                    </div>
                  )}
                  {voiceState === 'listening' && (
                    <button className="ttg-done-btn" onClick={handleMicDone}>Done</button>
                  )}
                  {voiceState === 'idle' && (
                    <button className="ttg-type-toggle" onClick={() => setShowTypeBox(true)}>or type instead</button>
                  )}
                </div>
              ) : (
                <div className="ttg-text-area-wrapper">
                  <div className="ttg-text-row">
                    <input
                      className="ttg-text-input"
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Type here..."
                      disabled={voiceState !== 'idle'}
                      autoFocus
                    />
                    <button
                      className="ttg-send-btn"
                      onClick={handleTextSubmit}
                      disabled={!inputText.trim() || voiceState !== 'idle'}
                    >Send</button>
                  </div>
                  <button className="ttg-type-toggle" onClick={() => setShowTypeBox(false)}>use mic instead</button>
                </div>
              )
            )}
          </div>
        )}

      </div>

      {/* InvitationModal removed — SuggestionBubble renders inline in chat instead */}

      {/* ── Doorway — now receives engine prop ── */}
      {showDoorway && !showCoReg && !showCompletion && (
        <DoorwayChoiceScreen
          engine={engine}
          onSelectDoorway={handleDoorwaySelect}
          onTalkMore={() => setShowDoorway(false)}
        />
      )}

      {/* ── Guided Experience — replaces CoRegToolkit ── */}
      {showCoReg && !showCompletion && (
        <GuidedExperienceScene
          template={activeTemplate}
          zone={engine.session.nature_zone || 'mountain'}
          onComplete={handleExperienceComplete}
          onExit={() => setShowCoReg(false)}
        />
      )}

      {/* ── Completion Screen — new ── */}
      {showCompletion && (
        <CompletionScreen
          engine={engine}
          zone={engine.session.nature_zone || 'mountain'}
          onContinue={handleCompletionContinue}
          onTryAnother={handleTryAnother}
          onTalkMore={handleCompletionTalkMore}
        />
      )}

    </div>
  )
}
