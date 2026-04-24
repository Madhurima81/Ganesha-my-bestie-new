// src/hooks/useGaneshaEngine.js
// ─────────────────────────────────────────────────────────
// Central engine hook for Talk with Ganesha feature.
// Wires emotion detection → doorway selection → template
// routing → affirmation → completion → invitation logic.
//
// Usage:
//   const engine = useGaneshaEngine({ childAge: 8 })
//
// Data files required in src/data/:
//   doorway_tool_library.json
//   doorway_routing_map.json
//   experience_templates.json
//   affirmation_bank.json
//   completion_messages.json
//   invitation_lines.json
//   safety_flag_logic.json
//   emotion_scenario_master_database.json
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'

import toolLibrary     from '../data/doorway_tool_library.json'
import routingMap      from '../data/doorway_routing_map.json'
import templates       from '../data/experience_templates.json'
import affirmationBank from '../data/affirmation_bank.json'
import completionMsgs  from '../data/completion_messages.json'
import invitationLines from '../data/invitation_lines.json'
import safetyFlags     from '../data/safety_flag_logic.json'
import scenarioDb      from '../data/emotion_scenario_master_database.json'

// ─────────────────────────────────────────────────────────
// INITIAL SESSION STATE
// ─────────────────────────────────────────────────────────
const INITIAL_STATE = {
  childAge: null,
  ageBand: null,

  turn_count: 0,
  chat_mode: null,
  invitation_already_offered: false,
  child_message_sentiment: null,

  primary_emotion: null,
  secondary_emotion: null,
  intensity_level: null,
  nervous_system_need: null,
  nature_zone: null,
  symbol_anchor: null,
  desired_after_state: null,

  safety_flag: 'none',
  negative_self_language_flag: false,
  withdrawal_flag: false,

  selected_tools: [],
  selected_tool: null,
  selected_template: null,
  selected_affirmation: null,

  completion_message: null,
  completion_addon: null,

  recently_used_tools: [],
  recently_used_invitations: [],
  recently_used_completions: [],
}

// ─────────────────────────────────────────────────────────
// NEGATIVE SELF-LANGUAGE DETECTION
// Using double quotes throughout to avoid apostrophe issues
// ─────────────────────────────────────────────────────────
const NEGATIVE_SELF_PATTERNS = [
  "i am stupid",
  "i am ugly",
  "nobody likes me",
  "i cant do anything right",
  "i can't do anything right",
  "i am bad",
  "i am worthless",
  "i hate myself",
  "nobody cares",
  "i am a burden",
  "i dont matter",
  "i don't matter",
  "i am useless",
  "whats wrong with me",
  "what's wrong with me",
  "i always mess up",
  "i am so dumb",
  "i wish i wasnt here",
  "i wish i wasn't here",
]

const WITHDRAWAL_PATTERNS = [
  "never mind",
  "forget it",
  "doesnt matter",
  "doesn't matter",
  "dont care",
  "don't care",
  "whatever",
]

function detectNegativeSelfLanguage(message) {
  const lower = message.toLowerCase()
  return NEGATIVE_SELF_PATTERNS.some(p => lower.includes(p))
}

function detectWithdrawal(message) {
  const lower = message.toLowerCase()
  if (lower.length < 8) return true
  return WITHDRAWAL_PATTERNS.some(p => lower.includes(p))
}

function detectSentiment(message, prevMessage) {
  if (message.length > (prevMessage ? prevMessage.length : 0) * 1.5) return 'rising'
  if (/[A-Z]{3,}/.test(message)) return 'rising'
  if ((message.match(/!/g) || []).length > 1) return 'rising'

  if (detectWithdrawal(message)) return 'withdrawing'

  if (/[?]/.test(message)) return 'stabilising'
  if (/i think|maybe|i dont know|i don't know|not sure/i.test(message)) return 'stabilising'
  if (prevMessage && message.length < prevMessage.length * 0.7) return 'stabilising'

  return 'neutral'
}

// ─────────────────────────────────────────────────────────
// CHAT MODE DETECTION
// ─────────────────────────────────────────────────────────
const DEEP_MODE_EMOTIONS = [
  'shame', 'embarrassment', 'low_confidence',
  'loneliness', 'rejection', 'guilt', 'confusion'
]

function detectChatMode(emotion, intensity, negSelfFlag, withdrawFlag) {
  if (negSelfFlag || withdrawFlag) return 'DEEP'
  if (DEEP_MODE_EMOTIONS.includes(emotion) && ['medium', 'strong'].includes(intensity)) return 'DEEP'
  return 'FAST'
}

// ─────────────────────────────────────────────────────────
// SCENARIO LOOKUP
// Find a scenario row by emotion + intensity + social context
// ─────────────────────────────────────────────────────────
function findScenario(emotion, intensity, socialContext) {
  return scenarioDb.find(s =>
    s.primary_emotion === emotion &&
    s.intensity_level === intensity &&
    (!socialContext || s.social_context === socialContext)
  ) || scenarioDb.find(s => s.primary_emotion === emotion) || null
}

// ─────────────────────────────────────────────────────────
// DOORWAY TOOL SELECTION
// 3 tools: 1 body + 1 breath/stillness + 1 affirmation
// ─────────────────────────────────────────────────────────
function selectDoorwayTools(emotion, intensity, nervousNeed, recentlyUsed) {
  let pool = toolLibrary.filter(t => t.primary_emotion_family === emotion)
  if (pool.length === 0) pool = toolLibrary

  const bodyPool = pool.filter(t =>
    t.regulation_mode === 'movement' &&
    (t.intensity_fit === intensity || t.intensity_fit === 'all') &&
    !recentlyUsed.includes(t.tool_id)
  )

  const calmPool = pool.filter(t =>
    ['breathing', 'stillness'].includes(t.regulation_mode) &&
    (t.intensity_fit === intensity || t.intensity_fit === 'all') &&
    !recentlyUsed.includes(t.tool_id)
  )

  const affPool = pool.filter(t =>
    t.regulation_mode === 'affirmation' &&
    !recentlyUsed.includes(t.tool_id)
  )

  const pick = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null

  const t1 = pick(bodyPool)
  const t2 = pick(calmPool.filter(t => t !== t1))
  const t3 = pick(affPool.filter(t => t !== t1 && t !== t2))

  return [t1, t2, t3].filter(Boolean)
}

// ─────────────────────────────────────────────────────────
// TEMPLATE ROUTING
// ─────────────────────────────────────────────────────────
function routeToTemplate(toolId) {
  const templateId = routingMap.tool_to_template[toolId]
  if (!templateId) return null

  const templateList = templates.templates || templates
  return templateList.find(t => t.template_id === templateId) || null
}

// ─────────────────────────────────────────────────────────
// AFFIRMATION SELECTION
// ─────────────────────────────────────────────────────────
const EMOTION_TO_AFFIRMATION_CATEGORY = {
  anger: 'courage_trying',
  frustration: 'courage_trying',
  fear: 'calm_safety',
  anxiety: 'calm_safety',
  worry: 'calm_safety',
  sadness: 'emotional_release',
  grief: 'emotional_release',
  shame: 'confidence_belief',
  embarrassment: 'confidence_belief',
  low_confidence: 'confidence_belief',
  loneliness: 'connection_belonging',
  rejection: 'connection_belonging',
  overwhelm: 'focus_clarity',
  confusion: 'focus_clarity',
  jealousy: 'connection_belonging',
  guilt: 'emotional_release',
}

function selectAffirmation(emotion, overrideCategory) {
  const cat = overrideCategory || EMOTION_TO_AFFIRMATION_CATEGORY[emotion] || 'courage_trying'
  const pool = affirmationBank[cat] || affirmationBank.courage_trying || []
  if (pool.length === 0) return { id: 'default', line: 'I can try once more', breath: 'inhale' }
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─────────────────────────────────────────────────────────
// COMPLETION MESSAGE SELECTION
// ─────────────────────────────────────────────────────────
function selectCompletionMessage(afterState, chatMode, safetyFlag, recentlyUsed) {
  const category = (routingMap.after_state_to_completion_category || {})[afterState] || 'calm'
  const pool = (completionMsgs[category] || completionMsgs.calm || []).filter(m => {
    const modeOk = m.mode === 'both' || m.mode === (chatMode || 'FAST').toLowerCase()
    const notUsed = !recentlyUsed.includes(m.id)
    return modeOk && notUsed
  })

  const msg = pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : (completionMsgs[category] || completionMsgs.calm || [])[0]

  const addon = (safetyFlag && safetyFlag !== 'none')
    ? (completionMsgs.safety_addon || {})[safetyFlag]
    : null

  return { message: msg ? msg.message : 'Something shifted just now.', addon }
}

// ─────────────────────────────────────────────────────────
// INVITATION LINE SELECTION
// ─────────────────────────────────────────────────────────
function selectInvitationLine(emotion, intensity, nervousNeed, negSelfFlag, withdrawFlag, recentlyUsed) {
  if (negSelfFlag || withdrawFlag) {
    const safePool = (invitationLines.safety_mode || []).filter(l => !recentlyUsed.includes(l.id))
    if (safePool.length > 0) return safePool[Math.floor(Math.random() * safePool.length)]
    return { id: 'saf_default', line: 'Shall we just breathe for a moment? Nothing more.' }
  }

  const emotionToTone = routingMap.emotion_to_tone || {}
  const needOverride = (routingMap.nervous_need_override || {})[nervousNeed]

  let toneCategory = emotionToTone[emotion] || 'safety_grounding'

  if (needOverride) {
    const overrideKey = Object.keys(invitationLines).find(k =>
      k.includes(needOverride.split('_')[0])
    )
    if (overrideKey) toneCategory = overrideKey
  }

  const categoryLines = invitationLines[toneCategory] || invitationLines.safety_grounding || []
  const pool = categoryLines.filter(l => {
    const intensityOk = !intensity || l.intensity === intensity || l.intensity === 'all'
    const notUsed = !recentlyUsed.includes(l.id)
    return intensityOk && notUsed
  })

  if (pool.length === 0) return categoryLines[0] || { id: 'default', line: 'Shall we try something together?' }
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────
export function useGaneshaEngine({ childAge = 8 } = {}) {
  const ageBand = childAge <= 7 ? '5-7' : '8-12'
  const prevMessageRef = useRef('')

  const [session, setSession] = useState({
    ...INITIAL_STATE,
    childAge,
    ageBand,
  })

  // ── Set emotion context ──
  const setEmotionContext = useCallback((emotionData) => {
    const {
      primary_emotion,
      secondary_emotion,
      intensity_level,
      nervous_system_need,
      nature_zone,
      symbol_anchor,
      desired_after_state,
      safety_flag,
    } = emotionData

    const chatMode = detectChatMode(
      primary_emotion,
      intensity_level,
      session.negative_self_language_flag,
      session.withdrawal_flag
    )

    setSession(prev => ({
      ...prev,
      primary_emotion,
      secondary_emotion: secondary_emotion || null,
      intensity_level,
      nervous_system_need: nervous_system_need || null,
      nature_zone: nature_zone || 'mountain',
      symbol_anchor: symbol_anchor || 'trunk',
      desired_after_state: desired_after_state || 'calm',
      safety_flag: safety_flag || 'none',
      chat_mode: chatMode,
    }))
  }, [session.negative_self_language_flag, session.withdrawal_flag])

  // ── Set emotion from scenario_id ──
  const setEmotionFromScenario = useCallback((scenarioId) => {
    const scenario = scenarioDb.find(s => s.scenario_id === scenarioId)
    if (!scenario) return
    setEmotionContext({
      primary_emotion: scenario.primary_emotion,
      secondary_emotion: scenario.secondary_emotion,
      intensity_level: scenario.intensity_level,
      nervous_system_need: scenario.nervous_system_need,
      nature_zone: scenario.nature_zone_environment,
      symbol_anchor: scenario.ganesha_symbol_healer,
      desired_after_state: scenario.desired_emotional_after_state,
      safety_flag: scenario.safety_escalation_flag,
    })
  }, [setEmotionContext])

  // ── Process child message ──
  const processChildMessage = useCallback((message) => {
    const negSelfFlag  = detectNegativeSelfLanguage(message)
    const withdrawFlag = detectWithdrawal(message)
    const sentiment    = detectSentiment(message, prevMessageRef.current)
    prevMessageRef.current = message

    setSession(prev => {
      const newTurn = prev.turn_count + 1
      const chatMode = (negSelfFlag || withdrawFlag)
        ? 'DEEP'
        : prev.chat_mode || detectChatMode(prev.primary_emotion, prev.intensity_level, negSelfFlag, withdrawFlag)

      return {
        ...prev,
        turn_count: newTurn,
        negative_self_language_flag: negSelfFlag || prev.negative_self_language_flag,
        withdrawal_flag: withdrawFlag,
        child_message_sentiment: sentiment,
        chat_mode: chatMode,
      }
    })
  }, [])

  // ── Should invitation appear? ──
  const shouldShowInvitation = useCallback(() => {
    const { turn_count, child_message_sentiment, invitation_already_offered } = session
    if (invitation_already_offered) return false
    if (turn_count < 2) return false
    if (turn_count >= 3) return true
    if (child_message_sentiment === 'rising') return false
    if (child_message_sentiment === 'stabilising' || child_message_sentiment === 'neutral') return true
    return false
  }, [session])

  // ── Get invitation line ──
  const getInvitationLine = useCallback(() => {
    const line = selectInvitationLine(
      session.primary_emotion,
      session.intensity_level,
      session.nervous_system_need,
      session.negative_self_language_flag,
      session.withdrawal_flag,
      session.recently_used_invitations
    )

    setSession(prev => ({
      ...prev,
      invitation_already_offered: true,
      recently_used_invitations: [...prev.recently_used_invitations, line.id].filter(Boolean).slice(-6),
    }))

    return line.line || "Shall we try something together?"
  }, [session])

  // ── Get doorway tools ──
  const getDoorwayTools = useCallback(() => {
    const tools = selectDoorwayTools(
      session.primary_emotion,
      session.intensity_level,
      session.nervous_system_need,
      session.recently_used_tools
    )
    setSession(prev => ({ ...prev, selected_tools: tools }))
    return tools
  }, [session])

  // ── Tool tapped → get template + affirmation ──
  const selectTool = useCallback((tool) => {
    const template    = routeToTemplate(tool.tool_id)
    const affirmation = selectAffirmation(session.primary_emotion, null)

    const enrichedTemplate = template ? {
      ...template,
      phases: (template.phases || []).map(p =>
        p.phase === 'affirmation'
          ? { ...p, text: affirmation.line || p.text }
          : p
      ),
    } : null

    setSession(prev => ({
      ...prev,
      selected_tool: tool,
      selected_template: enrichedTemplate,
      selected_affirmation: affirmation,
      recently_used_tools: [...prev.recently_used_tools, tool.tool_id].slice(-6),
    }))

    return { template: enrichedTemplate, affirmation }
  }, [session])

  // ── Experience complete → get completion message ──
  const getCompletionMessage = useCallback(() => {
    const result = selectCompletionMessage(
      session.desired_after_state,
      session.chat_mode,
      session.safety_flag,
      session.recently_used_completions
    )

    setSession(prev => ({
      ...prev,
      completion_message: result.message,
      completion_addon: result.addon,
      recently_used_completions: [...prev.recently_used_completions, result.message].slice(-8),
    }))

    return result
  }, [session])

  // ── Reset session ──
  const resetSession = useCallback(() => {
    setSession({ ...INITIAL_STATE, childAge, ageBand })
    prevMessageRef.current = ''
  }, [childAge, ageBand])

  return {
    session,
    setEmotionContext,
    setEmotionFromScenario,
    processChildMessage,
    shouldShowInvitation,
    getInvitationLine,
    getDoorwayTools,
    selectTool,
    getCompletionMessage,
    resetSession,
  }
}
