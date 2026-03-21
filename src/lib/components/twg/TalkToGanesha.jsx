import React, { useState, useEffect, useRef, useCallback } from 'react';
import GaneshaPresence from '../character/GaneshaPresence';
import './TalkToGanesha.css';

// ── Safety net — hardcoded, never goes to API ─────────────────────
const SAFETY_KEYWORDS = [
  'hurt', 'harm', 'scared', 'abuse', 'hit', 'unsafe', 'kill', 'die', 'blood',
];
const SAFETY_RESPONSE =
  "That sounds really hard. Please tell a grown-up you trust about this — a parent or teacher. You are safe and loved.";

const SILENCE_RESPONSE = "I'm still here. Take your time.";

const ONE_MORE_MINUTE_RESPONSE =
  "I just want you to know — we have about one more minute together today. Let's make it a good one.";

// ── SEL-aware system prompt ───────────────────────────────────────
const buildSystemPrompt = (childName, childAge, windDownLevel) => {
  const ageNote =
    childAge <= 8
      ? 'This child is 5–8 years old. Use very simple words. Short sentences. Concrete and warm. No abstract concepts.'
      : 'This child is 9–12 years old. You can be slightly more nuanced. Still warm, never preachy or lecture-y.';

  const windNote =
    windDownLevel >= 2
      ? 'IMPORTANT: Tell the child warmly that you have about one more minute together today. Keep your response to 1–2 sentences only.'
      : windDownLevel === 1
      ? 'Keep your responses shorter now — just 1–2 sentences.'
      : '';

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
- Choose the CASEL competency that fits best: self-awareness, self-management, social awareness, relationship skills, responsible decision-making

Your voice:
- First person as Ganesha ("I", "me", "my Mooshika")
- Occasionally reference your elephant nature with warmth (big ears, love of modak, broken tusk)
- NRI children: bridge their Indian roots and the world they live in gently
- NEVER shame, judge, or give homework
- End with a question or gentle invitation — not a statement

Keep responses to 2–4 sentences. You are in a 5-minute session. Be present, not performative.`;
};

// ── Ganesha state → GaneshaPresence props ────────────────────────
const GANESHA_STATE_MAP = {
  idle:      { pose: 'blessing',  expression: 'happy' },
  listening: { pose: 'blessing',  expression: 'encouraging' },
  thinking:  { pose: 'blessing',  expression: 'encouraging' },
  speaking:  { pose: 'thumbs_up', expression: 'excited' },
};

export default function TalkToGanesha({
  childName,
  childAge,
  windDownLevel,
  onClose,
  onSessionNote,
}) {
  const [voiceState, setVoiceState] = useState('idle');
  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState('');
  const [turnCount, setTurnCount]   = useState(0);
  const [windSpoken2, setWindSpoken2] = useState(false);

  const recognitionRef  = useRef(null);
  const silenceTimerRef = useRef(null);
  const chatEndRef      = useRef(null);
  const submittingRef   = useRef(false);
  // Stable ref to current messages — lets event callbacks read latest state
  const messagesRef     = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Scroll to latest bubble
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // windDownLevel 3 → hub auto-closes this modal
  useEffect(() => {
    if (windDownLevel >= 3) onClose();
  }, [windDownLevel, onClose]);

  // windDownLevel 2 → speak one-more-minute line (once)
  useEffect(() => {
    if (windDownLevel >= 2 && !windSpoken2 && voiceState === 'idle') {
      setWindSpoken2(true);
      const msg = { role: 'assistant', content: ONE_MORE_MINUTE_RESPONSE };
      setMessages(prev => [...prev, msg]);
      speak(ONE_MORE_MINUTE_RESPONSE);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windDownLevel]);

  // ── Text-to-speech ────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.85;
    utt.pitch = 0.95;
    utt.onend = () => setVoiceState('idle');
    setVoiceState('speaking');
    window.speechSynthesis.speak(utt);
  }, []);

  // ── Send message to Claude API ────────────────────────────────
  const sendToGanesha = useCallback(async (userText, currentMessages) => {
    // Safety check — hardcoded, never reaches API
    const lower = userText.toLowerCase();
    if (SAFETY_KEYWORDS.some(kw => lower.includes(kw))) {
      const safeMsg = { role: 'assistant', content: SAFETY_RESPONSE };
      setMessages(prev => [...prev, safeMsg]);
      speak(SAFETY_RESPONSE);
      return;
    }

    setVoiceState('thinking');

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const keyIsReal = apiKey && apiKey.startsWith('sk-ant-');

    // Fallback when no real API key (dev / demo mode)
    if (!keyIsReal) {
      const fallback =
        "I'm so happy you're here with me. Tell me more — I'm listening with both of my big elephant ears!";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      onSessionNote?.(userText.slice(0, 50));
      speak(fallback);
      return;
    }

    // currentMessages already includes the user message
    const history = currentMessages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: buildSystemPrompt(childName, childAge, windDownLevel),
          messages: history,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data  = await res.json();
      const reply = data.content?.[0]?.text || "I'm listening. Tell me more.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      onSessionNote?.(userText.slice(0, 50));
      setTurnCount(c => c + 1);
      speak(reply);
    } catch {
      const fallback =
        "My ears are listening — the wind must have carried your words away. Try again?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speak(fallback);
    } finally {
      submittingRef.current = false;
    }
  }, [childName, childAge, windDownLevel, speak, onSessionNote]);

  // ── Voice input via Web Speech API ───────────────────────────
  const startListening = useCallback(() => {
    if (voiceState !== 'idle') return;

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      document.querySelector('.ttg-text-input')?.focus();
      return;
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.continuous     = false;
    recognition.interimResults = false;
    recognition.lang           = 'en-US';

    // 8-second silence fallback
    silenceTimerRef.current = setTimeout(() => {
      recognition.stop();
      setMessages(prev => [...prev, { role: 'assistant', content: SILENCE_RESPONSE }]);
      speak(SILENCE_RESPONSE);
    }, 8000);

    recognition.onresult = (e) => {
      clearTimeout(silenceTimerRef.current);
      const transcript  = e.results[0][0].transcript;
      const userMsg     = { role: 'user', content: transcript };
      // Build new array outside setMessages to avoid side-effects in updater
      const newMessages = [...messagesRef.current, userMsg];
      setMessages(newMessages);
      sendToGanesha(transcript, newMessages);
    };

    recognition.onerror = () => {
      clearTimeout(silenceTimerRef.current);
      setVoiceState('idle');
    };

    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      if (voiceState === 'listening') setVoiceState('idle');
    };

    setVoiceState('listening');
    recognition.start();
  }, [voiceState, speak, sendToGanesha]);

  // ── Text submit ───────────────────────────────────────────────
  const handleTextSubmit = useCallback(() => {
    const text = inputText.trim();
    if (!text || voiceState !== 'idle' || submittingRef.current) return;
    submittingRef.current = true;
    setInputText('');
    const userMsg     = { role: 'user', content: text };
    // Build new array outside setMessages to avoid side-effects in updater
    const newMessages = [...messagesRef.current, userMsg];
    setMessages(newMessages);
    sendToGanesha(text, newMessages);
  }, [inputText, voiceState, sendToGanesha]);

  // 10-turn cap
  const hitCap = turnCount >= 10;

  const { pose, expression } = GANESHA_STATE_MAP[voiceState];

  return (
    <div className="ttg-overlay">
      <div className="ttg-root">

        {/* Close button */}
        <button className="ttg-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Ganesha + state ring */}
        <div className="ttg-ganesha-col">
          <div className={`ttg-state-ring ttg-state-ring--${voiceState}`} aria-hidden="true" />
          <GaneshaPresence
            pose={pose}
            expression={expression}
            size={130}
            breathing="gentle"
            blink
            style={{ position: 'relative', zIndex: 1 }}
          />
          <p className="ttg-state-label">
            {voiceState === 'idle'      && 'Tap the mic to speak'}
            {voiceState === 'listening' && 'Listening...'}
            {voiceState === 'thinking'  && 'Thinking...'}
            {voiceState === 'speaking'  && 'Ganesha is speaking'}
          </p>
        </div>

        {/* Chat history */}
        <div className="ttg-chat">
          {messages.map((msg, i) => (
            <div key={i} className={`ttg-bubble ttg-bubble--${msg.role}`}>
              <span className="ttg-bubble__label">
                {msg.role === 'user' ? childName : 'Ganesha'}
              </span>
              <p className="ttg-bubble__text">{msg.content}</p>
            </div>
          ))}

          {hitCap && (
            <div className="ttg-bubble ttg-bubble--assistant ttg-cap-msg">
              <span className="ttg-bubble__label">Ganesha</span>
              <p className="ttg-bubble__text">
                We've talked so much today! Want to do something together before you go?
              </p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        {!hitCap && (
          <div className="ttg-input-area">
            <button
              className={`ttg-mic-btn ttg-mic-btn--${voiceState}`}
              onClick={startListening}
              disabled={voiceState !== 'idle'}
              aria-label="Speak to Ganesha"
            >
              {voiceState === 'idle'      && <span>Mic</span>}
              {voiceState === 'listening' && <span className="ttg-pulse">Listening</span>}
              {voiceState === 'thinking'  && <span className="ttg-spin">...</span>}
              {voiceState === 'speaking'  && <span>Speaking</span>}
            </button>

            <div className="ttg-text-row">
              <input
                className="ttg-text-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Or type here..."
                disabled={voiceState !== 'idle'}
                aria-label="Type a message"
              />
              <button
                className="ttg-send-btn"
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || voiceState !== 'idle'}
                aria-label="Send"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
