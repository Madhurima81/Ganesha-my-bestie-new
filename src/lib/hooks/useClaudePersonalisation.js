// src/lib/hooks/useClaudePersonalisation.js
// ─────────────────────────────────────────
// Handles ALL in-game Claude API personalisation calls.
// One hook — all 6 personalisation types go through here.
//
// Features:
//   - Session cache (same call = no repeat API cost)
//   - Silent fallback if API key missing or call fails
//   - Uses Haiku (cheap + fast — perfect for 25-40 word reactions)
//   - AbortController cancels stale in-flight requests
//   - Child profile auto-injected per prompt type
//
// Usage:
//   const { ask, isLoading, response, clear } = useClaudePersonalisation()
//   ask({ type: 'symbol-reveal', context: { childName, childAge, symbol, symbolMeaning } })
//
// ⚠️  API key note:
//   Reads from import.meta.env.VITE_ANTHROPIC_API_KEY (Vite env var).
//   Add to your .env file:  VITE_ANTHROPIC_API_KEY=sk-ant-...
//   For production, replace this with a Netlify function proxy so the
//   key never ships to the browser.

import { useState, useRef, useCallback } from 'react'

// ─── Session cache ───────────────────────────────────────────────────────────
// Keyed on type + JSON-serialised context.
// Cleared automatically when the browser tab closes.
const sessionCache = new Map()

const getCacheKey = (type, context) =>
  `${type}::${JSON.stringify(context)}`

// ─── Prompt builders ─────────────────────────────────────────────────────────
// One entry per personalisation type.
// Each returns { system, user } strings sent to Haiku.
// Keep system prompts short — we pay for every token.

const PROMPTS = {

  // After a Ganesha symbol is revealed in Symbol Mountain
  'symbol-reveal': ({ childName, childAge, symbol, symbolMeaning }) => ({
    system: [
      `You are Ganesha — warm, wise, gently funny.`,
      `One sentence only. Max 25 words.`,
      `Respond to ${childName} (age ${childAge}) discovering your ${symbol} symbol.`,
      childAge <= 7
        ? `Age 5-7 style: simple, physical, one vivid image.`
        : childAge <= 10
        ? `Age 8-10 style: add the "why" behind the symbol.`
        : `Age 10-12 style: respect + depth, treat them as almost grown.`,
      `Plain text only. Do not start with "I".`,
    ].join(' '),
    user: `${childName} just discovered my ${symbol} symbol. It means: ${symbolMeaning}.`,
  }),

  // SymbolSidebar — "which of my symbols suits you best?"
  // Only Claude API call that uses About Me profile data
  'symbol-match': ({ childName, childAge, symbolsCollected, favAnimal, favFood, obstacle }) => ({
    system: [
      `You are Ganesha — warm, wise, gently funny.`,
      `${childName} is age ${childAge}.`,
      `Look at their profile and tell them which of your symbols suits them best and why.`,
      `Max 40 words. Warm, specific, personal.`,
      `Plain text only. Do not start with "I".`,
    ].join(' '),
    user: [
      `Symbols ${childName} has collected: ${(symbolsCollected || []).join(', ') || 'none yet'}.`,
      `Favourite animal: ${favAnimal || 'not set'}.`,
      `Favourite food: ${favFood || 'not set'}.`,
      `Their biggest obstacle: ${obstacle || 'not set'}.`,
      `Which of your 8 symbols (Lotus, Axe, Broken Tusk, Modak, Mouse, Rope, Ankush, Conch) suits them best?`,
    ].join(' '),
  }),

  // After a Sanskrit word is learned in Cave of Secrets
  'word-connection': ({ childName, childAge, word, meaning, favAnimal, favFood }) => ({
    system: [
      `You are Ganesha — warm, wise, gently funny.`,
      `Connect the Sanskrit word to ${childName}'s real life (age ${childAge}).`,
      childAge <= 7
        ? `Use a simple physical comparison they already know.`
        : childAge <= 10
        ? `Explain the why with a relatable example from everyday life.`
        : `Give brief historical or philosophical context, respectfully.`,
      `Max 35 words. One sentence or two short ones.`,
      `Plain text only. Do not start with "I".`,
    ].join(' '),
    user: [
      `${childName} just learned: ${word} = "${meaning}".`,
      `Their favourite animal: ${favAnimal || 'not set'}.`,
      `Favourite food: ${favFood || 'not set'}.`,
      `Connect this Sanskrit word to their world.`,
    ].join(' '),
  }),

  // Festival Square — after any game is completed
  'game-complete': ({ childName, childAge, gameName, achievement }) => ({
    system: [
      `You are Ganesha — warm, gently funny, celebratory.`,
      `${childName} just completed ${gameName}.`,
      `Max 25 words.`,
      childAge <= 7
        ? `Age 5-7: pure joy, one physical image.`
        : childAge <= 10
        ? `Age 8-10: celebrate + brief cultural context.`
        : `Age 10-12: celebrate + deeper meaning of what they just did.`,
      `Plain text only. Do not start with "I".`,
    ].join(' '),
    user: `${childName} (age ${childAge}) just completed: ${gameName}. Achievement: ${achievement || 'completed'}.`,
  }),

  // About Me Hut — after a family member is added to the tree
  'family-callback': ({ childName, childAge, relation, name: memberName }) => ({
    system: [
      `You are Ganesha — warm, curious, personal.`,
      `${childName} just added a family member to their tree.`,
      `One warm observation or gentle question about that relationship.`,
      `Max 25 words. Plain text only. Do not start with "I".`,
    ].join(' '),
    user: `${childName} added their ${relation}${memberName ? ` (${memberName})` : ''} to their family tree.`,
  }),

  // Cross-zone callback — reference a favourite thing from About Me in another zone
  'callback': ({ childName, childAge, currentContext, favThing, favAnimal }) => ({
    system: [
      `You are Ganesha — warm, specific, slightly magical.`,
      `Make a connection between ${childName}'s favourite thing and what they just learned.`,
      `This should feel like Ganesha remembers and notices details about this child.`,
      `Max 30 words. Plain text only. Do not start with "I".`,
    ].join(' '),
    user: [
      `${childName} just learned: ${currentContext}.`,
      `Their favourite animal is ${favAnimal || 'not set'}.`,
      `Their favourite thing is ${favThing || 'not set'}.`,
      `Make the connection feel natural and warm.`,
    ].join(' '),
  }),
}

// ─── Fallback responses ───────────────────────────────────────────────────────
// Used silently when the API call fails or the key is missing.
// Always warm, always on-brand. Child never sees an error.

const FALLBACKS = {
  'symbol-reveal':    (ctx) => `${ctx.childName}! You found it — this one was waiting for exactly you. 🌟`,
  'symbol-match':     (ctx) => `${ctx.childName}, the ${(ctx.symbolsCollected || ['Lotus'])[0]} feels right for you. I can sense it. 🌸`,
  'word-connection':  (ctx) => `${ctx.childName}, this word is ancient and powerful — and now it lives in you. 🕉️`,
  'game-complete':    (ctx) => `${ctx.childName}! You did it! My trunk is doing a happy dance right now. 🐘`,
  'family-callback':  (ctx) => `${ctx.childName}, every person in that tree loves you. That is your superpower. 💛`,
  'callback':         (ctx) => `${ctx.childName}, I knew that would make sense to you. You just get it. 🌟`,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useClaudePersonalisation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse]   = useState('')
  const [error, setError]         = useState(null)
  const abortRef = useRef(null)

  const ask = useCallback(async ({ type, context }) => {
    if (!type || !context) return

    // ── Cache hit ────────────────────────────────────────────────────────────
    const cacheKey = getCacheKey(type, context)
    if (sessionCache.has(cacheKey)) {
      setResponse(sessionCache.get(cacheKey))
      return
    }

    // ── Unknown type → silent fallback ───────────────────────────────────────
    const promptBuilder = PROMPTS[type]
    if (!promptBuilder) {
      console.warn(`useClaudePersonalisation: unknown type "${type}"`)
      setResponse(FALLBACKS[type]?.(context) ?? '')
      return
    }

    // ── No API key → silent fallback ─────────────────────────────────────────
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn('useClaudePersonalisation: VITE_ANTHROPIC_API_KEY not set — using fallback')
      const fallback = FALLBACKS[type]?.(context) ?? ''
      setResponse(fallback)
      return
    }

    const { system, user } = promptBuilder(context)

    setIsLoading(true)
    setError(null)
    setResponse('')

    try {
      // Cancel any stale in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Content-Type':         'application/json',
          'x-api-key':            apiKey,
          'anthropic-version':    '2023-06-01',
          // Required for browser requests
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5',   // Haiku: cheap + fast for 25-40 word reactions
          max_tokens: 120,                   // ~30-40 words comfortably
          system,
          messages: [{ role: 'user', content: user }],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(`API ${res.status}: ${body?.error?.message ?? res.statusText}`)
      }

      const data = await res.json()
      const text = data.content?.[0]?.text?.trim() ?? ''
      const result = text || FALLBACKS[type]?.(context) ?? ''

      // Cache for this browser session
      sessionCache.set(cacheKey, result)
      setResponse(result)

    } catch (err) {
      if (err.name === 'AbortError') return  // Intentional cancel — do nothing

      // Any other error → silent fallback
      console.warn('useClaudePersonalisation: API error — using fallback', err.message)
      const fallback = FALLBACKS[type]?.(context) ?? ''
      setResponse(fallback)
      setError(err.message)

    } finally {
      setIsLoading(false)
    }
  }, [])

  // Call before asking a new question to clear stale state
  const clear = useCallback(() => {
    setResponse('')
    setError(null)
    abortRef.current?.abort()
  }, [])

  return { ask, isLoading, response, error, clear }
}

export default useClaudePersonalisation
