// ExplorerManager.jsx — "Explorers" in Parent Settings (behind the grown-up check).
// A row of the children on this device; tap one to open the Edit Explorer card: avatar (pencil badge),
// name (with clear button), age (stepper 3–14), Cancel / Okay, and a two-step "Delete explorer".
// Editing and deleting live here only, so a child can never rename or erase a profile by accident
// (the old way was a 900 ms long-press on the child-facing picker).
// Fonts: Baloo 2 (headings, buttons) · Nunito (body). Every control is a 60px touch target.

import React, { useEffect, useRef, useState } from 'react'
import './ExplorerManager.css'
import GameStateManager from '../../services/GameStateManager'
import { EXPLORER_AVATARS, getExplorerAvatarId } from '../../utils/explorerAvatar'

const MIN_AGE = 3
const MAX_AGE = 14
const NAME_MAX = 12

const readProfiles = () => {
  try {
    const store = GameStateManager.getProfiles?.()
    return Object.values(store?.profiles || {}).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  } catch (_) {
    return []
  }
}

function ExplorerAvatar({ avatar, className = '' }) {
  const id = getExplorerAvatarId(avatar) || 'owl'
  return (
    <img
      className={`pdex-avatar ${className}`.trim()}
      src={`/images/new-explorer-${id}.webp`}
      alt=""
      draggable={false}
      onError={(e) => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = '1'
          e.currentTarget.src = `/images/new-explorer-${id}.png`
        }
      }}
    />
  )
}

function EditExplorerCard({ profile, onCancel, onSave, onDelete }) {
  const [name, setName] = useState(profile.name || '')
  const [age, setAge] = useState(Number.isFinite(profile.age) ? profile.age : 7)
  const [avatar, setAvatar] = useState(getExplorerAvatarId(profile.avatar) || 'owl')
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const canSave = name.trim().length > 0

  return (
    <div className="pdex-backdrop" onClick={onCancel}>
      <div
        className="pdex-card"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Explorer"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pdex-title">Edit Explorer</h2>

        {confirmingDelete ? (
          <div className="pdex-confirm">
            <ExplorerAvatar avatar={avatar} className="pdex-avatar--confirm" />
            <p className="pdex-confirm-text">
              Delete <strong>{profile.name}</strong> and all their progress? This cannot be undone.
            </p>
            <div className="pdex-actions">
              <button type="button" className="pdex-btn pdex-btn--ghost" onClick={() => setConfirmingDelete(false)}>
                Keep
              </button>
              <button type="button" className="pdex-btn pdex-btn--danger" onClick={() => onDelete(profile.id)}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="pdex-edit-top">
              <button
                type="button"
                className="pdex-avatar-btn"
                aria-label="Change avatar"
                aria-expanded={pickingAvatar}
                onClick={() => setPickingAvatar((v) => !v)}
              >
                <ExplorerAvatar avatar={avatar} className="pdex-avatar--large" />
                <span className="pdex-pencil" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </span>
              </button>

              <div className="pdex-age" role="group" aria-label="Age">
                <button
                  type="button"
                  className="pdex-step"
                  aria-label="Younger"
                  disabled={age <= MIN_AGE}
                  onClick={() => setAge((a) => Math.max(MIN_AGE, a - 1))}
                >
                  −
                </button>
                <div className="pdex-age-value">
                  <span className="pdex-age-label">Age</span>
                  <span className="pdex-age-number">{age}</span>
                </div>
                <button
                  type="button"
                  className="pdex-step"
                  aria-label="Older"
                  disabled={age >= MAX_AGE}
                  onClick={() => setAge((a) => Math.min(MAX_AGE, a + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {pickingAvatar && (
              <div className="pdex-avatar-grid" role="listbox" aria-label="Choose an explorer friend">
                {EXPLORER_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={a.id === avatar}
                    aria-label={a.name}
                    className={`pdex-avatar-choice ${a.id === avatar ? 'is-selected' : ''}`}
                    onClick={() => { setAvatar(a.id); setPickingAvatar(false) }}
                  >
                    <ExplorerAvatar avatar={a.id} />
                  </button>
                ))}
              </div>
            )}

            <label className="pdex-field-label" htmlFor="pdex-name">Name</label>
            <div className="pdex-name-wrap">
              <input
                id="pdex-name"
                ref={nameRef}
                className="pdex-name"
                type="text"
                value={name}
                maxLength={NAME_MAX}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                <button
                  type="button"
                  className="pdex-clear"
                  aria-label="Clear name"
                  onClick={() => { setName(''); nameRef.current?.focus() }}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>

            <div className="pdex-actions">
              <button type="button" className="pdex-btn pdex-btn--ghost" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="pdex-btn pdex-btn--primary"
                disabled={!canSave}
                onClick={() => onSave(profile.id, { name: name.trim(), age, avatar })}
              >
                Okay
              </button>
            </div>

            <button type="button" className="pdex-delete-link" onClick={() => setConfirmingDelete(true)}>
              Delete explorer
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ExplorerManager({ onChanged }) {
  const [profiles, setProfiles] = useState(readProfiles)
  const [editingId, setEditingId] = useState(null)

  const editing = profiles.find((p) => p.id === editingId) || null

  const handleSave = (id, changes) => {
    GameStateManager.updateProfile(id, changes)
    setProfiles(readProfiles())
    setEditingId(null)
    onChanged?.()
  }

  const handleDelete = (id) => {
    GameStateManager.deleteProfile(id)
    setProfiles(readProfiles())
    setEditingId(null)
    onChanged?.()
  }

  return (
    <div className="pdex-wrap">
      {profiles.length === 0 ? (
        <p className="pdex-empty">No explorers on this device yet.</p>
      ) : (
        <div className="pdex-row">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className="pdex-tile"
              onClick={() => setEditingId(p.id)}
              aria-label={`Edit ${p.name}`}
            >
              <ExplorerAvatar avatar={p.avatar} />
              <span className="pdex-tile-name">{p.name}</span>
              <span className="pdex-tile-age">{Number.isFinite(p.age) ? `Age ${p.age}` : 'Tap to edit'}</span>
            </button>
          ))}
        </div>
      )}
      <p className="pdex-hint">Tap an explorer to edit.</p>

      {editing && (
        <EditExplorerCard
          profile={editing}
          onCancel={() => setEditingId(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
