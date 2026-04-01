// src/lib/utils/dashboardData.js
// ──────────────────────────────────────────────────────────────
// All localStorage read/write for parent dashboard v2.
// Single source of truth for PIN, sessions, kindness, stories.

// ─── Key constants ─────────────────────────────────────────────
export const KEYS = {
  PIN:           'gmb_parent_pin',
  PIN_SET:       'gmb_pin_set',
  TWG_SESSIONS:  'gmb_twg_sessions',
  KINDNESS_ACTS: 'gmb_kindness_acts',
  GRATITUDE_JAR: 'gmb_gratitude_jar',
  TECHNIQUES:    'gmb_recent_techniques',
  DARE_LOG:      'gmb_dare_log',
  UNLOCK_EXTRA:  'gmb_unlock_extra',
  WEEKLY_STORY:  'gmb_weekly_stories',
  CHILD_NAME:    'childName',
  CHILD_AGE:     'childAge',
}

// ─── PIN management ────────────────────────────────────────────
export const isPinSet = () =>
  localStorage.getItem(KEYS.PIN_SET) === 'true'

export const setPin = (pin) => {
  localStorage.setItem(KEYS.PIN, pin)
  localStorage.setItem(KEYS.PIN_SET, 'true')
}

export const verifyPin = (input) =>
  localStorage.getItem(KEYS.PIN) === input

export const clearPin = () => {
  localStorage.removeItem(KEYS.PIN)
  localStorage.removeItem(KEYS.PIN_SET)
}

// ─── TWG session log ───────────────────────────────────────────
export const getTWGSessions = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.TWG_SESSIONS) || '[]')
  } catch { return [] }
}

export const logTWGSession = (session) => {
  const sessions = getTWGSessions()
  sessions.push({
    id:        Date.now(),
    date:      new Date().toISOString(),
    ...session,
    // session shape:
    // { input, zone, caselSkill, techniques[],
    //   duration, turnCount }
  })
  if (sessions.length > 90) sessions.splice(0, 30)
  localStorage.setItem(
    KEYS.TWG_SESSIONS, JSON.stringify(sessions))
}

// ─── Kindness acts ─────────────────────────────────────────────
export const getKindnessActs = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.KINDNESS_ACTS) || '[]')
  } catch { return [] }
}

export const logKindnessAct = (act) => {
  const acts = getKindnessActs()
  acts.push({
    id:       Date.now(),
    date:     new Date().toISOString(),
    text:     act,
    category: detectCategory(act),
  })
  localStorage.setItem(
    KEYS.KINDNESS_ACTS, JSON.stringify(acts))
}

const detectCategory = (text) => {
  const t = text.toLowerCase()
  if (/friend|play|share/.test(t))       return 'friendship'
  if (/mama|papa|nani|dadi|family/.test(t)) return 'family'
  if (/plant|bird|animal|bug/.test(t))   return 'compassion'
  if (/grateful|thank|smile/.test(t))    return 'gratitude'
  return 'kindness'
}

// ─── Gratitude jar ─────────────────────────────────────────────
export const getGratitudeJar = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.GRATITUDE_JAR) ||
      '{"count":0,"items":[],"lastDate":null}')
  } catch {
    return { count: 0, items: [], lastDate: null }
  }
}

// ─── Techniques used ───────────────────────────────────────────
export const getTechniquesUsed = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.TECHNIQUES) || '[]')
  } catch { return [] }
}

// ─── Dare log ──────────────────────────────────────────────────
export const getDareLog = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.DARE_LOG) || '[]')
  } catch { return [] }
}

// ─── Weekly story history ──────────────────────────────────────
export const getWeeklyStories = () => {
  try {
    return JSON.parse(
      localStorage.getItem(KEYS.WEEKLY_STORY) || '[]')
  } catch { return [] }
}

export const saveWeeklyStory = (story) => {
  const stories = getWeeklyStories()
  stories.unshift({
    id:     Date.now(),
    date:   new Date().toISOString(),
    weekOf: getWeekLabel(),
    ...story,
  })
  if (stories.length > 12) stories.pop()
  localStorage.setItem(
    KEYS.WEEKLY_STORY, JSON.stringify(stories))
}

// ─── Parent unlock ─────────────────────────────────────────────
export const unlockExtraTime = () => {
  localStorage.setItem(KEYS.UNLOCK_EXTRA,
    new Date().toISOString())
}

export const isExtraTimeUnlocked = () => {
  const unlocked = localStorage.getItem(KEYS.UNLOCK_EXTRA)
  if (!unlocked) return false
  const today     = new Date().toDateString()
  const unlockDay = new Date(unlocked).toDateString()
  return today === unlockDay
}

export const clearExtraTime = () => {
  localStorage.removeItem(KEYS.UNLOCK_EXTRA)
}

// ─── Analytics helpers ─────────────────────────────────────────
export const getThisWeekSessions = () => {
  const sessions = getTWGSessions()
  const weekAgo  = Date.now() - 7 * 24 * 60 * 60 * 1000
  return sessions.filter(s =>
    new Date(s.date).getTime() > weekAgo)
}

export const getZoneCounts = (sessions) => {
  const counts = { Red: 0, Yellow: 0, Blue: 0, Green: 0 }
  sessions.forEach(s => {
    if (s.zone && counts[s.zone] !== undefined)
      counts[s.zone]++
  })
  return counts
}

export const getCASELCounts = (sessions) => {
  const counts = {}
  sessions.forEach(s => {
    if (s.caselSkill)
      counts[s.caselSkill] = (counts[s.caselSkill] || 0) + 1
  })
  return counts
}

export const getTechniqueCounts = (sessions) => {
  const counts = {}
  sessions.forEach(s => {
    ;(s.techniques || []).forEach(t => {
      counts[t] = (counts[t] || 0) + 1
    })
  })
  return counts
}

export const getTopItem = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0] || null

// ─── DESSA strength language ───────────────────────────────────
// Reframes CASEL/SEL data as positive child strengths
export const toStrengthLanguage = (caselSkill, count) => {
  const map = {
    'Self-Awareness':
      `noticed and named feelings ${count} time${count !== 1 ? 's' : ''}`,
    'Self-Management':
      `practised staying calm ${count} time${count !== 1 ? 's' : ''}`,
    'Social Awareness':
      `showed empathy ${count} time${count !== 1 ? 's' : ''}`,
    'Relationship Skills':
      `worked on friendships ${count} time${count !== 1 ? 's' : ''}`,
    'Responsible Decision-Making':
      `made thoughtful choices ${count} time${count !== 1 ? 's' : ''}`,
  }
  return map[caselSkill] ||
    `practised ${caselSkill} ${count} time${count !== 1 ? 's' : ''}`
}

// ─── Week label helper ─────────────────────────────────────────
export const getWeekLabel = () => {
  const now   = new Date()
  const day   = now.getDate()
  const month = now.toLocaleString('en-IN', { month: 'long' })
  return `Week of ${day} ${month}`
}

// ─── Streak calculator ─────────────────────────────────────────
export const getDareStreak = () => {
  const log = getDareLog()
  if (!log.length) return 0

  let streak    = 0
  let checkDate = new Date()

  for (let i = 0; i < 30; i++) {
    const dateStr = checkDate.toDateString()
    const found   = log.find(d =>
      new Date(d.date).toDateString() === dateStr)
    if (found) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
