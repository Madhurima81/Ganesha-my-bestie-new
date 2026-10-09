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
import { isVoiceMuted, setVoiceMuted, subscribeVoiceMute, migrateLegacyVoicePref } from '../../utils/voiceMute'
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
  // Voice is the shared mute flag (same one the Home hold-to-mute button uses).
  migrateLegacyVoicePref()
  next.voice = !isVoiceMuted()
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

  // Home mute button flips the same flag: keep the Voice switch in step.
  useEffect(() => subscribeVoiceMute((muted) => {
    setSoundSettings((prev) => ({ ...prev, voice: !muted }))
  }), [])
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
    const nextValue = !soundSettings[key]
    localStorage.setItem(SOUND_PREF_KEYS[key], nextValue ? '1' : '0')
    setSoundSettings((prev) => ({ ...prev, [key]: nextValue }))
    if (key === 'voice') setVoiceMuted(!nextValue)
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
      <div
        className="pd-header"
        style={{
          background: CV.ivory,
          borderBottom: `1.5px solid ${CV.lavenderBg}`,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'Baloo 2, cursive',
            fontSize: '1.15rem', color: CV.brown,
            margin: 0, fontWeight: 800,
          }}>
            {name}'s GMB Journey
          </h1>
          <p className="pd-header-subtitle" style={{
            color: CV.softBrown,
            fontSize: '0.8rem', margin: 0, opacity: 0.75,
            fontFamily: 'Nunito, sans-serif',
          }}>
            Continue what they discovered
          </p>
        </div>
        <button
          className="pd-close-btn"
          onClick={onBack}
          aria-label="Close"
          style={{
            background: CV.lavenderBg,
            border: 'none', borderRadius: '50%',
            cursor: 'pointer',
            color: CV.lavender, fontSize: '1.1rem',
            position: 'relative',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div
        className="pd-tabs"
        style={{
          display: 'flex',
          background: CV.ivory,
          borderBottom: `1.5px solid ${CV.lavenderBg}`,
          position: 'sticky', zIndex: 40,
        }}
      >
        {tabs.map(t => (
          <button
            key={t.id}
            className="pd-tab"
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none',
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
          <div className="pd-panel">

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
          <div className="pd-panel">

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
    <div
      className="pd-setting-row"
      style={{
        background: CV.ivory,
        border: `1.5px solid ${CV.lavenderBg}`,
        borderRadius: 14,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
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
      <button className="pd-setting-action" onClick={action} style={{
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
        className="pd-sound-toggle"
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
          className="pd-simple-back"
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

// Copy finalized 2026-10-07 (Madhurima). The only open item is SUPPORT_EMAIL.
// TODO(release): replace with the real support address before shipping.
const SUPPORT_EMAIL = '[SUPPORT EMAIL]'

const HELP_ITEMS = [
  {
    title: 'Audio not working',
    body: "Open Settings → Sound and make sure Voice, Sound effects, and Ambience are turned on. Also check that your device isn't muted or in silent mode.",
  },
  {
    title: 'Game not responding',
    body: 'Return to the zone and open the scene again. If it still does not respond, close and reopen GMB.',
  },
  {
    title: 'Installation trouble',
    body: 'Open Settings → App → Install GMB for steps for this device and browser.',
  },
  {
    title: 'Something else?',
    body: `If the problem continues, contact us at ${SUPPORT_EMAIL} and tell us what happened.`,
  },
]

function HelpScreen({ onBack }) {
  return (
    <SimplePage title="Help" subtitle="Quick help when something isn't working." onBack={onBack}>
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

function AboutScreen({ onBack }) {
  return (
    <SimplePage
      title="About GMB"
      subtitle="Wisdom children can understand and use."
      onBack={onBack}
    >
      <p style={{ fontSize: '0.92rem', color: CV.brown, lineHeight: 1.7, margin: '0 0 1.1rem' }}>
        Ganesha My Bestie helps children experience the wisdom behind
        Ganesha through stories, play and simple real-life moments.
      </p>

      {[
        ['Explore', "Discover Ganesha's symbols and the words of a shloka, one at a time."],
        ['Play', 'Experience the meaning through something to do — not just something to hear.'],
        ['Remember', 'A simple affirmation helps bring the idea back when it matters.'],
        ['Use it', 'Small real-life prompts help the wisdom travel beyond the screen.'],
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

      <p style={{ fontSize: '0.88rem', color: CV.brown, lineHeight: 1.6, margin: '1.1rem 0 0' }}>
        Let your child discover first. You can use the parent prompts later
        to continue the conversation.
      </p>

      <p style={{
        fontSize: '0.78rem', color: CV.softBrown, opacity: 0.6,
        margin: '1.2rem 0 0', lineHeight: 1.6,
      }}>
        Your child's profiles and progress are stored on this device. See
        Privacy for details. Version 1.0 (beta).
      </p>
    </SimplePage>
  )
}
