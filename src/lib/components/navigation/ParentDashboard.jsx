// ParentDashboard.jsx — "For Parents" area for Ganesha My Bestie
// Design register: calm, adult, still clearly GMB — not an analytics/LMS dashboard.
// Fonts: Baloo 2 (headings) · Nunito (body) — NO EXCEPTIONS
//
// Role: help the parent continue the learning without becoming the teacher.
// Content is driven entirely by learningCatalog.js + LearningProgress.js —
// no hardcoded symbol meanings, no CASEL/DESSA/zone analytics, no streaks,
// no rewards. See GMB — Build Shared Learning Layer prompt for the full brief.

import React, { useState, useEffect } from 'react'
import './ParentDashboard.css'
import PinScreen     from '../dashboard/PinScreen'
import PrivacyPolicy from '../onboarding/PrivacyPolicy'
import GameStateManager from '../../services/GameStateManager'
import { getUnlockedLearnings, getLatestLearning, getLearningById } from '../../services/LearningProgress'
import { clearPin } from '../../utils/dashboardData'

const SOUND_PREF_KEYS = {
  ambience: 'gmb_parent_sound_ambience',
  voice: 'gmb_parent_sound_voice',
  sfx: 'gmb_parent_sound_sfx',
}

const DEFAULT_SOUND_SETTINGS = {
  ambience: 0.35,
  voice: 1,
  sfx: 0.75,
}

const clamp01 = (value) => Math.max(0, Math.min(1, value))

const readSoundSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS

  const next = { ...DEFAULT_SOUND_SETTINGS }
  Object.entries(SOUND_PREF_KEYS).forEach(([key, storageKey]) => {
    const raw = localStorage.getItem(storageKey)
    if (raw == null) return
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) next[key] = clamp01(parsed)
  })
  return next
}

// ─── Color tokens (GMB adult-facing palette) ────────────────────
const CV = {
  cream:      '#FFF8E7',
  ivory:      '#FFFDF8',
  lavender:   '#8E7BD8',
  lavenderBg: '#EFEAFB',
  peach:      '#FFB088',
  gold:       '#FFD700',
  brown:      '#5D2E0F',
  softBrown:  '#8B4513',
  red:        '#C62828',
}

export default function ParentDashboard({ onBack }) {
  const [unlocked, setUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('forParents')

  const [childName, setChildName] = useState('')
  const [profileId, setProfileId] = useState(null)
  const [unlockedLearnings, setUnlockedLearnings] = useState([])
  const [selectedLearningId, setSelectedLearningId] = useState(null)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [soundSettings, setSoundSettings] = useState(readSoundSettings)

  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId')
    setProfileId(activeId)

    const stored = localStorage.getItem('childName') || ''
    if (stored) {
      setChildName(stored)
    } else if (activeId) {
      try {
        const p = GameStateManager.getProfiles?.()?.profiles?.[activeId]
        if (p?.name) setChildName(p.name)
      } catch (_) {}
    }

    if (activeId) {
      setUnlockedLearnings(getUnlockedLearnings(activeId))
    }
  }, [])

  const handleDeleteAllData = () => {
    const confirmed = window.confirm(
      'Delete all saved child profiles, progress, parent consent, and dashboard data from this device?'
    )
    if (!confirmed) return

    try {
      const profilesStore = GameStateManager.getProfiles?.()
      const profileIds = Object.keys(profilesStore?.profiles || {})

      profileIds.forEach((id) => {
        localStorage.removeItem(`${id}_gameProgress`)
      })

      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('temp_session_') ||
          key.startsWith('replay_session_') ||
          key.endsWith('_state') ||
          key === 'gameProfiles' ||
          key === 'activeProfileId' ||
          key === 'parentConsent' ||
          key === 'childName' ||
          key === 'childBirthday' ||
          key === 'gmb_parent_pin' ||
          key === 'gmb_pin_set' ||
          key.startsWith('gmb_') ||
          key.startsWith('parent_')
        ) {
          localStorage.removeItem(key)
        }
      })

      window.location.reload()
    } catch (error) {
      console.error('Failed to delete local data:', error)
      window.alert('Something went wrong while deleting local data.')
    }
  }

  const handleSoundSettingChange = (key, value) => {
    const clamped = clamp01(value)
    setSoundSettings((prev) => {
      const next = { ...prev, [key]: clamped }
      localStorage.setItem(SOUND_PREF_KEYS[key], String(clamped))
      return next
    })
  }

  // ── PIN gate ──────────────────────────────────────────────────
  if (!unlocked) {
    return <PinScreen onSuccess={() => setUnlocked(true)} />
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />
  }

  const name = childName || 'Your child'
  const latestLearning = getLatestLearning(profileId)
  const displayedLearning = selectedLearningId
    ? getLearningById(selectedLearningId)
    : latestLearning

  const tabs = [
    { id: 'forParents', label: 'For Parents' },
    { id: 'settings',   label: 'Settings' },
  ]

  return (
    <div className="pd-root">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        background: CV.ivory,
        borderBottom: `1.5px solid ${CV.lavenderBg}`,
        padding: '1.1rem 1.2rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Baloo 2, cursive',
            fontSize: '1.15rem', color: CV.brown,
            margin: 0, fontWeight: 800,
          }}>
            {name}'s GMB Journey
          </h1>
          <p style={{
            color: CV.softBrown,
            fontSize: '0.8rem', margin: 0, opacity: 0.75,
            fontFamily: 'Nunito, sans-serif',
          }}>
            Continue what they discovered
          </p>
        </div>
        <button
          onClick={onBack}
          aria-label="Close"
          style={{
            background: CV.lavenderBg,
            border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer',
            color: CV.lavender, fontSize: '1.1rem',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: CV.ivory,
        borderBottom: `1.5px solid ${CV.lavenderBg}`,
        padding: '0 0.4rem',
        position: 'sticky', top: 66, zIndex: 40,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none',
              padding: '0.75rem 1rem',
              fontFamily: 'Baloo 2, cursive',
              fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer',
              color: activeTab === t.id ? CV.lavender : CV.softBrown,
              borderBottom: activeTab === t.id
                ? `2.5px solid ${CV.lavender}` : '2.5px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pd-scroll" style={{ paddingTop: 0 }}>

        {/* ── FOR PARENTS TAB ─────────────────────────────────── */}
        {activeTab === 'forParents' && (
          <div style={{ padding: '1.2rem', maxWidth: 560, margin: '0 auto' }}>

            {!displayedLearning ? (
              <div style={{
                background: CV.ivory,
                border: `1.5px solid ${CV.lavenderBg}`,
                borderRadius: 20, padding: '1.6rem 1.2rem',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.92rem', color: CV.softBrown,
                  margin: 0, lineHeight: 1.6,
                }}>
                  Nothing discovered yet. Once {name} explores Symbol Mountain
                  or Shloka River, their journey will show up here.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  background: CV.ivory,
                  border: `1.5px solid ${CV.lavenderBg}`,
                  borderRadius: 20, padding: '1.4rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{
                    fontFamily: 'Baloo 2, cursive',
                    fontSize: '1.05rem', color: CV.lavender,
                    margin: '0 0 1rem', fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}>
                    {displayedLearning.title}
                  </p>

                  <GuidanceSection label="What your child explored">
                    {displayedLearning.parent.explored}
                  </GuidanceSection>

                  <GuidanceSection label="Their GMB words">
                    <span style={{ fontStyle: 'italic' }}>
                      "{displayedLearning.affirmation}"
                    </span>
                  </GuidanceSection>

                  <GuidanceSection label="Ask">
                    {displayedLearning.parent.ask}
                  </GuidanceSection>

                  <GuidanceSection label="Try">
                    {displayedLearning.parent.try}
                  </GuidanceSection>

                  <GuidanceSection label="Watch for" last>
                    {displayedLearning.parent.watchFor}
                  </GuidanceSection>
                </div>

                <p style={{
                  fontFamily: 'Baloo 2, cursive',
                  fontSize: '0.88rem', color: CV.softBrown,
                  margin: '0 0 0.6rem', fontWeight: 700,
                }}>
                  Their discoveries
                </p>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                }}>
                  {unlockedLearnings.map(({ learningId }) => {
                    const entry = getLearningById(learningId)
                    if (!entry) return null
                    const isActive = displayedLearning.id === learningId
                    return (
                      <button
                        key={learningId}
                        onClick={() => setSelectedLearningId(learningId)}
                        style={{
                          background: isActive ? CV.lavender : CV.lavenderBg,
                          color: isActive ? '#fff' : CV.brown,
                          border: 'none', borderRadius: 999,
                          padding: '0.5rem 1rem',
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700, fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {entry.title}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div style={{ padding: '1.2rem', maxWidth: 560, margin: '0 auto' }}>
            <div style={{
              background: CV.ivory,
              border: `1.5px solid ${CV.lavenderBg}`,
              borderRadius: 16,
              padding: '1rem',
              marginBottom: '0.8rem',
            }}>
              <p style={{
                fontFamily: 'Baloo 2, cursive',
                fontSize: '0.95rem',
                color: CV.brown,
                margin: '0 0 0.2rem',
                fontWeight: 700,
              }}>
                Sound
              </p>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.8rem',
                color: CV.softBrown,
                margin: '0 0 0.9rem',
                lineHeight: 1.5,
              }}>
                Separate settings for ambience sound, voice, and SFX.
              </p>

              <SoundSettingRow
                label="Ambience sound"
                value={soundSettings.ambience}
                onChange={(value) => handleSoundSettingChange('ambience', value)}
                accent={CV.lavender}
              />
              <SoundSettingRow
                label="Voice"
                value={soundSettings.voice}
                onChange={(value) => handleSoundSettingChange('voice', value)}
                accent={CV.peach}
              />
              <SoundSettingRow
                label="SFX"
                value={soundSettings.sfx}
                onChange={(value) => handleSoundSettingChange('sfx', value)}
                accent={CV.gold}
              />
            </div>

            <SettingRow
              label="Change PIN"
              sublabel="Update your 4-digit parent PIN"
              action={() => {
                clearPin()
                setUnlocked(false)
              }}
              actionLabel="Change"
            />
            <SettingRow
              label="Privacy Policy"
              sublabel="Review what this local-only version stores on this device"
              action={() => setShowPrivacyPolicy(true)}
              actionLabel="Open"
            />
            <SettingRow
              label="Delete all data"
              sublabel="Remove profiles, progress, consent, and parent data from this device"
              action={handleDeleteAllData}
              actionLabel="Delete"
              danger
            />
          </div>
        )}

      </div>{/* /scroll */}
    </div>
  )
}

// ─── Small reusable components ─────────────────────────────────

function GuidanceSection({ label, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : '0.9rem' }}>
      <p style={{
        fontFamily: 'Baloo 2, cursive',
        fontSize: '0.78rem', color: CV.softBrown,
        margin: '0 0 0.25rem', fontWeight: 700,
        opacity: 0.75,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.92rem', color: CV.brown,
        margin: 0, lineHeight: 1.6,
      }}>
        {children}
      </p>
    </div>
  )
}

function SettingRow({ label, sublabel, action, actionLabel, danger }) {
  return (
    <div style={{
      background: CV.ivory,
      border: `1.5px solid ${CV.lavenderBg}`,
      borderRadius: 14, padding: '0.9rem',
      marginBottom: '0.6rem',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.9rem', color: CV.brown,
          margin: 0, fontWeight: 700,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.78rem', color: CV.softBrown,
          margin: 0, opacity: 0.6,
        }}>
          {sublabel}
        </p>
      </div>
      <button onClick={action} style={{
        background: danger ? '#FDECEA' : CV.lavenderBg,
        border: 'none',
        borderRadius: 999, padding: '0.4rem 0.9rem',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700,
        fontSize: '0.82rem',
        color: danger ? CV.red : CV.lavender,
        cursor: 'pointer',
      }}>
        {actionLabel}
      </button>
    </div>
  )
}

function SoundSettingRow({ label, value, onChange, accent }) {
  const percent = Math.round(clamp01(value) * 100)

  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.4rem',
      }}>
        <span style={{
          fontFamily: 'Baloo 2, cursive',
          fontSize: '0.88rem',
          color: CV.brown,
          fontWeight: 700,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.78rem',
          color: CV.softBrown,
          fontWeight: 700,
        }}>
          {percent}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        style={{
          width: '100%',
          accentColor: accent,
          cursor: 'pointer',
        }}
      />
    </div>
  )
}
