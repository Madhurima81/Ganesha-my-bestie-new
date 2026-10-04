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
import pwaInstallManager, { isStandalone, getInstallGuide } from '../../services/PwaInstallManager'

const SOUND_PREF_KEYS = {
  ambience: 'gmb_parent_sound_ambience',
  voice: 'gmb_parent_sound_voice',
  sfx: 'gmb_parent_sound_sfx',
}

// Sound settings are ON/OFF, not volume — the repo's existing
// gmb_parent_sound_* keys still store a number, so ON/OFF is encoded as 1/0.
// Migration: any existing value > 0 (including old slider values like 0.35)
// counts as ON; only an explicit 0 counts as OFF. No new storage key.
const DEFAULT_SOUND_SETTINGS = {
  ambience: true,
  voice: true,
  sfx: true,
}

const readSoundSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS

  const next = { ...DEFAULT_SOUND_SETTINGS }
  Object.entries(SOUND_PREF_KEYS).forEach(([key, storageKey]) => {
    const raw = localStorage.getItem(storageKey)
    if (raw == null) return
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) next[key] = parsed > 0
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

export default function ParentDashboard({ onBack, onOpenChildProfile }) {
  const [unlocked, setUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('forParents')

  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState(null)
  const [profileId, setProfileId] = useState(null)
  const [unlockedLearnings, setUnlockedLearnings] = useState([])
  const [selectedLearningId, setSelectedLearningId] = useState(null)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [soundSettings, setSoundSettings] = useState(readSoundSettings)
  const [appInstalled, setAppInstalled] = useState(isStandalone())
  const [showInstallSteps, setShowInstallSteps] = useState(false)

  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId')
    setProfileId(activeId)

    const stored = localStorage.getItem('childName') || ''
    let profile = null
    if (activeId) {
      try {
        profile = GameStateManager.getProfiles?.()?.profiles?.[activeId] || null
      } catch (_) {}
    }

    if (stored) {
      setChildName(stored)
    } else if (profile?.name) {
      setChildName(profile.name)
    }
    if (profile?.age) setChildAge(profile.age)

    if (activeId) {
      setUnlockedLearnings(getUnlockedLearnings(activeId))
    }
  }, [])

  useEffect(() => {
    return pwaInstallManager.subscribe(() => setAppInstalled(isStandalone()))
  }, [])

  const handleInstallClick = async () => {
    if (pwaInstallManager.isAvailable()) {
      await pwaInstallManager.promptInstall()
      setAppInstalled(isStandalone())
    } else {
      setShowInstallSteps((v) => !v)
    }
  }

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

  const toggleSoundSetting = (key) => {
    setSoundSettings((prev) => {
      const nextValue = !prev[key]
      localStorage.setItem(SOUND_PREF_KEYS[key], nextValue ? '1' : '0')
      return { ...prev, [key]: nextValue }
    })
  }

  // ── PIN gate ──────────────────────────────────────────────────
  if (!unlocked) {
    return <PinScreen onSuccess={() => setUnlocked(true)} />
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />
  }

  if (showHelp) {
    return <HelpScreen onBack={() => setShowHelp(false)} />
  }

  if (showAbout) {
    return <AboutScreen onBack={() => setShowAbout(false)} />
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

            <SettingsSectionLabel>Sound</SettingsSectionLabel>
            <div style={{
              background: CV.ivory,
              border: `1.5px solid ${CV.lavenderBg}`,
              borderRadius: 16,
              padding: '1rem',
              marginBottom: '1.2rem',
            }}>
              <SoundToggleRow
                label="Voice & pronunciation"
                sublabel="Stories, hints & Sanskrit sounds"
                checked={soundSettings.voice}
                onChange={() => toggleSoundSetting('voice')}
              />
              <SoundToggleRow
                label="Sound effects"
                sublabel="Taps, movement & feedback"
                checked={soundSettings.sfx}
                onChange={() => toggleSoundSetting('sfx')}
              />
              <SoundToggleRow
                label="Ambience"
                sublabel="Background sounds & music"
                checked={soundSettings.ambience}
                onChange={() => toggleSoundSetting('ambience')}
                last
              />
            </div>

            <SettingsSectionLabel>Child</SettingsSectionLabel>
            <div style={{ marginBottom: '1.2rem' }}>
              <SettingRow
                label="Child profile"
                sublabel={childAge ? `${name} · Age ${childAge}` : name}
                action={onOpenChildProfile}
                actionLabel="Open"
              />
            </div>

            <SettingsSectionLabel>App</SettingsSectionLabel>
            <div style={{ marginBottom: '1.2rem' }}>
              {!appInstalled && (
                <>
                  <SettingRow
                    label="Install GMB"
                    sublabel="Add GMB to this device"
                    action={handleInstallClick}
                    actionLabel="Install"
                  />
                  {showInstallSteps && <InstallStepsCard />}
                </>
              )}
              <SettingRow
                label="Help"
                sublabel="Audio, gameplay, or installation trouble"
                action={() => setShowHelp(true)}
                actionLabel="Open"
              />
              <SettingRow
                label="About GMB"
                sublabel="What Ganesha My Bestie is, and why"
                action={() => setShowAbout(true)}
                actionLabel="Open"
              />
            </div>

            <SettingsSectionLabel>Privacy</SettingsSectionLabel>
            <div>
              <SettingRow
                label="Privacy"
                sublabel="Review what this local-only version stores on this device"
                action={() => setShowPrivacyPolicy(true)}
                actionLabel="Open"
              />
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
                label="Delete all data"
                sublabel="Remove profiles, progress, consent, and parent data from this device"
                action={handleDeleteAllData}
                actionLabel="Delete"
                danger
              />
            </div>
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

function SoundToggleRow({ label, sublabel, checked, onChange, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.9rem',
      paddingBottom: last ? 0 : '0.85rem',
      marginBottom: last ? 0 : '0.85rem',
      borderBottom: last ? 'none' : `1px solid ${CV.lavenderBg}`,
    }}>
      <div>
        <p style={{
          fontFamily: 'Baloo 2, cursive',
          fontSize: '0.88rem',
          color: CV.brown,
          fontWeight: 700,
          margin: 0,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.76rem',
          color: CV.softBrown,
          opacity: 0.7,
          margin: '0.15rem 0 0',
        }}>
          {sublabel}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        style={{
          flexShrink: 0,
          width: 46, height: 26,
          borderRadius: 999,
          border: 'none',
          background: checked ? CV.lavender : '#D9D4DF',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 180ms ease',
        }}
      >
        <span style={{
          position: 'absolute',
          top: 3, left: checked ? 23 : 3,
          width: 20, height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 5px rgba(40, 20, 80, 0.18)',
          transition: 'left 180ms ease',
        }} />
      </button>
    </div>
  )
}

function SettingsSectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: 'Baloo 2, cursive',
      fontSize: '0.74rem',
      fontWeight: 800,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: CV.lavender,
      margin: '0 0 0.5rem 0.2rem',
    }}>
      {children}
    </p>
  )
}

function InstallStepsCard() {
  const guide = getInstallGuide()
  return (
    <div style={{
      background: CV.lavenderBg,
      borderRadius: 14,
      padding: '0.9rem 1rem',
      margin: '0 0 0.6rem',
    }}>
      <p style={{
        fontFamily: 'Baloo 2, cursive',
        fontSize: '0.85rem', color: CV.brown,
        margin: '0 0 0.5rem', fontWeight: 700,
      }}>
        {guide.title}
      </p>
      {guide.steps.map((step, i) => (
        <p key={i} style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.84rem', color: CV.softBrown,
          margin: '0 0 0.3rem', lineHeight: 1.5,
        }}>
          {step.icon} {step.text}
        </p>
      ))}
    </div>
  )
}

// ─── Help & About — simple full-page overlays, same pattern as PrivacyPolicy ──

function SimplePage({ title, subtitle, onBack, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: '#FFFDF8', overflowY: 'auto',
      fontFamily: 'Nunito, sans-serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.2rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: CV.lavenderBg, border: 'none', borderRadius: 999,
            padding: '0.4rem 1rem', marginBottom: '1rem',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem',
            color: CV.lavender, cursor: 'pointer',
          }}
        >
          ‹ Back
        </button>
        <h1 style={{
          fontFamily: 'Baloo 2, cursive', fontSize: '1.3rem',
          color: CV.brown, margin: '0 0 0.3rem', fontWeight: 800,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.85rem', color: CV.softBrown, opacity: 0.75,
            margin: '0 0 1.2rem',
          }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

// DRAFT COPY — first pass per the Settings brief, not yet reviewed. Flagged
// for Madhurima to edit/approve before this is considered final.
const HELP_ITEMS = [
  {
    title: 'Audio not working',
    body: "Check Settings → Sound — each category (Voice, Sound effects, Ambience) has its own on/off switch. Also check your device isn't muted or in silent mode.",
  },
  {
    title: 'Game not responding',
    body: 'Close and reopen GMB. If a scene gets stuck mid-way, use the Home button inside the scene to return to the map and try again.',
  },
  {
    title: 'Installation trouble',
    body: 'Go to Settings → App → Install GMB for steps specific to your device and browser.',
  },
  {
    title: 'Something else, or report a problem',
    body: 'Contact us at support@example.com and tell us what happened — we read every message.',
  },
]

function HelpScreen({ onBack }) {
  return (
    <SimplePage title="Help" subtitle="Quick answers for common issues." onBack={onBack}>
      {HELP_ITEMS.map((item) => (
        <div key={item.title} style={{
          background: CV.ivory, border: `1.5px solid ${CV.lavenderBg}`,
          borderRadius: 14, padding: '0.9rem 1rem', marginBottom: '0.7rem',
        }}>
          <p style={{
            fontFamily: 'Baloo 2, cursive', fontSize: '0.9rem',
            color: CV.brown, margin: '0 0 0.3rem', fontWeight: 700,
          }}>
            {item.title}
          </p>
          <p style={{
            fontSize: '0.86rem', color: CV.softBrown, margin: 0, lineHeight: 1.55,
          }}>
            {item.body}
          </p>
        </div>
      ))}
    </SimplePage>
  )
}

// DRAFT COPY — first pass per the Settings brief, not yet reviewed. Flagged
// for Madhurima to edit/approve before this is considered final.
function AboutScreen({ onBack }) {
  return (
    <SimplePage title="About GMB" onBack={onBack}>
      <p style={{ fontSize: '0.92rem', color: CV.brown, lineHeight: 1.7, margin: '0 0 1.1rem' }}>
        Ganesha My Bestie turns Hindu culture and Sanskrit into wisdom children
        can use — not just stories to hear, but ideas to carry into their day.
      </p>

      {[
        ['Explore', "Discover Ganesha's symbols and the words of a shloka, one at a time."],
        ['Play', 'Each scene turns a symbol or word into something to do, not just watch.'],
        ['Practise', 'A small real-life dare connects what they learned to their actual day.'],
        ['Take it with you', 'The meaning stays with them long after the screen is off.'],
      ].map(([step, body]) => (
        <div key={step} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.7rem' }}>
          <span style={{
            fontFamily: 'Baloo 2, cursive', fontSize: '0.86rem', fontWeight: 800,
            color: CV.lavender, minWidth: 98,
          }}>
            {step}
          </span>
          <span style={{ fontSize: '0.86rem', color: CV.softBrown, lineHeight: 1.55 }}>
            {body}
          </span>
        </div>
      ))}

      <p style={{
        fontSize: '0.78rem', color: CV.softBrown, opacity: 0.6,
        margin: '1.2rem 0 0', lineHeight: 1.6,
      }}>
        This is a local-only version — see Privacy for what's stored on this
        device. Version 1.0 (beta).
      </p>
    </SimplePage>
  )
}
