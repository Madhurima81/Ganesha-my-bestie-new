# ZoneWelcome — Complete Code Changes Spec

All edits go into **`ZoneWelcome.jsx`** and **`ZoneWelcome.css`** unless noted.
Apply changes in the order listed — Section 1 first (broken text), then 2 (header polish), then 3 (zone-complete CTA), then 4 (VO).

---

## 1. Fix Broken Bottom Progress Bar Text

**Problem:** Bottom bar renders `"All Symbols CompletedZone Complete"` mashed together because two spans collide inline.

### 1.1 — Simplify the progress label

**File:** `ZoneWelcome.jsx`
**Find (around line 1128-1135):**
```jsx
<div className="journey-left-text">
  <span className="journey-left-main zone-progress-label">
    {allScenesCompleted ? `All ${statLabel} Completed` : `${symbolCount}/8 ${statLabel}`}
  </span>
  {allScenesCompleted && (
    <span className="journey-left-sub">Zone Complete</span>
  )}
</div>
```

**Replace with:**
```jsx
<div className="journey-left-text">
  <span className="journey-left-main zone-progress-label">
    {symbolCount}/{totalScenes} {statLabel}
  </span>
</div>
```

> Reason: Header now carries the "you finished" signal (Section 2). Bottom bar is just a clean count. Also fixes the hardcoded `/8` which would break for zones with different scene counts.

---

## 2. Add "Mastered" Sub-Label Under Zone Title

**Problem:** A 6/7yo doesn't connect the scattered cues (card checks, bottom bar, Ganesha pose) to "I finished this zone." The most-looked-at element — the title — needs to carry the win.

### 2.1 — Replace existing sparkle chars with a proper Mastered badge

**File:** `ZoneWelcome.jsx`
**Find (around line 933-941):**
```jsx
<div className="zone-title-top zone-title">
  <ScreenHeader title={zoneData.name} glowColor="gold" />
  {isZoneComplete && (
    <>
      <span className="zone-sparkle" style={{ top: '-8px', left: '10%' }}>✦</span>
      <span className="zone-sparkle" style={{ top: '2px', right: '12%', animationDelay: '0.8s' }}>✦</span>
    </>
  )}
</div>
```

**Replace with:**
```jsx
<div className="zone-title-top zone-title">
  <ScreenHeader title={zoneData.name} glowColor="gold" />
  {isZoneComplete && (
    <div className="zone-mastered-badge" aria-label="Zone mastered">
      <span className="mastered-line" aria-hidden="true" />
      <span className="mastered-text">Mastered</span>
      <span className="mastered-line" aria-hidden="true" />
    </div>
  )}
</div>
```

### 2.2 — CSS for Mastered badge

**File:** `ZoneWelcome.css`
**Append to end:**
```css
/* ── ZONE MASTERED BADGE ──────────────────────────
   Shown only when every scene in the zone is completed.
   Sits below the zone title, replaces sparkle chars.
──────────────────────────────────────────────── */
.zone-mastered-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
  animation: masteredFadeIn 0.6s ease-out;
}

.mastered-text {
  font-family: 'Baloo 2', cursive;
  font-weight: 700;
  font-size: clamp(13px, 1.1vw, 16px);
  color: #C8860D;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.mastered-line {
  height: 2px;
  width: 28px;
  background: linear-gradient(90deg, transparent, #C8860D, transparent);
  border-radius: 2px;
}

@keyframes masteredFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

> "Mastered" is the right word, not "Complete" or "Finished." It signals skill earned, not box ticked. Parents will screenshot "my child mastered Symbol Mountain" — they won't screenshot "completed."

### 2.3 — Optional: Remove the `zone-sparkle` CSS

If `.zone-sparkle` class is no longer used anywhere else, search for and remove it from `ZoneWelcome.css` to keep the file clean. If it's used elsewhere, leave it.

---

## 3. Zone-Complete CTA Banner

**Problem:** When the zone is fully done, the screen shows 4 Replay buttons and Ganesha celebrating, but no signal of *what's next*. A 6/7yo won't know to tap the home button without a prompt.

### 3.1 — Add a single banner above the scenes grid

**File:** `ZoneWelcome.jsx`
**Find the line just before `{/* Scene Icons Grid */}` (around line 943):**
```jsx
{/* Zone Welcome Whisper removed per request */}

{/* Scene Icons Grid */}
```

**Insert before `{/* Scene Icons Grid */}`:**
```jsx
{isZoneComplete && (
  <div className="zone-complete-cta" role="status">
    <span className="zone-complete-cta-text">
      You did it! Tap a card to play again, or
    </span>
    <button
      type="button"
      className="zone-complete-cta-home-btn"
      onClick={() => onNavigate?.('home')}
    >
      back to map
    </button>
  </div>
)}
```

> Note: confirm `onNavigate?.('home')` is the right call for your router. If the home button at top-left uses a different prop (e.g. `onNavigate?.('zoneMap')` or similar), match that exact call. Check what `HomeButton` component does at line 10 import.

### 3.2 — CSS for the CTA banner

**File:** `ZoneWelcome.css`
**Append:**
```css
/* ── ZONE COMPLETE CTA ────────────────────────────
   Shows only when zone is fully mastered.
   Single banner above scenes — closes the loop for the child.
──────────────────────────────────────────────── */
.zone-complete-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px auto 16px;
  max-width: 92%;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.18), rgba(255, 153, 51, 0.12));
  border: 2px solid rgba(200, 134, 13, 0.35);
  border-radius: 999px;
  animation: ctaFloatIn 0.7s ease-out;
}

.zone-complete-cta-text {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: clamp(13px, 1.05vw, 16px);
  color: #6b4410;
}

.zone-complete-cta-home-btn {
  font-family: 'Baloo 2', cursive;
  font-weight: 700;
  font-size: clamp(13px, 1.05vw, 16px);
  color: #fff;
  background: linear-gradient(135deg, #FF9933, #FF5722);
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(255, 87, 34, 0.35);
  min-height: 40px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.zone-complete-cta-home-btn:hover,
.zone-complete-cta-home-btn:active {
  transform: scale(1.04);
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.5);
}

@keyframes ctaFloatIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

> Touch target meets 40px minimum. Uses Baloo 2 for button (action) and Nunito for instruction text — consistent with GMB typography rules.

---

## 4. Voice-Over (VO) Strategy

**Problem:** Original VO was too chatty (you muted it). Goal: keep only the lines that genuinely help a 6/7yo, each playing **once per profile**, persisted to localStorage.

### 4.1 — VO Lines to Keep (3 total)

| When | Line | Trigger |
|---|---|---|
| First entry to zone | *"Welcome to Symbol Mountain! Tap a card to begin."* (zone name dynamic) | First mount, never heard before for this zone |
| Zone fully complete (first view) | *"You finished Symbol Mountain! I'm so proud of you."* | First mount where `isZoneComplete === true` |
| Existing scene-unlock whisper (already coded) | *"Tap me!"* (or whatever the current whisper says) | Already firing via `shouldShowInviteWhisper` — **keep as-is, do NOT change** |

### 4.2 — VO Lines to Cut

- ❌ Per-card narration ("This is the Golden Lotus scene…") — title + icon already say it
- ❌ VO on hover/focus
- ❌ Repeat plays of welcome line on re-entry
- ❌ Any VO that fires automatically when Ganesha appears next to a card (let the child tap if they want it)

### 4.3 — VO Implementation

**File:** `ZoneWelcome.jsx`
**Add helper functions near other ref/state declarations (around line 50):**
```js
// VO persistence — once-per-profile-per-zone
const _voKey = (kind) => {
  const pid = localStorage.getItem('activeProfileId') || 'default';
  return `gzw_vo_${pid}_${zoneData?.id}_${kind}`;
};
const hasHeardZoneVo = (kind) => {
  try { return localStorage.getItem(_voKey(kind)) === '1'; } catch { return false; }
};
const markZoneVoHeard = (kind) => {
  try { localStorage.setItem(_voKey(kind), '1'); } catch {}
};

const speakZoneLine = (text) => {
  if (!text) return;
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
  // Respect global mute if your GameStateManager exposes one
  if (GameStateManager?.isMuted?.()) return;
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  u.pitch = 1;
  u.volume = 0.9;
  // Optional: set en-IN voice if available
  const voices = window.speechSynthesis.getVoices?.() || [];
  const indianVoice = voices.find(v => v.lang === 'en-IN');
  if (indianVoice) u.voice = indianVoice;
  window.speechSynthesis.speak(u);
};
```

**Add a `useEffect` for the welcome + completion VO (place after existing `useEffect`s, before render):**
```js
useEffect(() => {
  if (!zoneData?.id || isLoading) return;

  // Wait one beat so the screen renders before VO fires
  const timer = setTimeout(() => {
    if (isZoneComplete && !hasHeardZoneVo('complete')) {
      speakZoneLine(`You finished ${zoneData.name.replace('\n', ' ')}! I'm so proud of you.`);
      markZoneVoHeard('complete');
      return; // Don't double up with welcome
    }

    if (!hasHeardZoneVo('welcome')) {
      speakZoneLine(`Welcome to ${zoneData.name.replace('\n', ' ')}! Tap a card to begin.`);
      markZoneVoHeard('welcome');
    }
  }, 600);

  return () => {
    clearTimeout(timer);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
}, [zoneData?.id, isLoading, isZoneComplete]);
```

> The 600ms delay lets the screen settle before VO speaks — abrupt VO on a freshly rendered screen feels jarring for a 6yo.

### 4.4 — Mute Toggle

If your `GameStateManager` doesn't expose `isMuted()` yet, the `speakZoneLine` function will still work — it just won't respect mute. Adding a global mute check is a separate task; flag for later if needed.

---

## 5. Ganesha Behavior — What's Working, What to Leave Alone

**Already coded (confirmed in `getZoneWelcomeGaneshaState`, line 665):**
- ✅ Appears next to next-pending scene → `pose: 'pointing'`
- ✅ Disappears once that scene is started
- ✅ Switches to `celebration` pose when all scenes done, slot moves to `top`
- ✅ Per-scene whisper system (`hasHeardWhisper` / `markWhisperHeard`) — once-per-profile-per-scene

**Recommendation: don't touch any of this.** The Ganesha state machine here is well-designed. The only reason VO felt chatty is because every Ganesha appearance auto-spoke. With Section 4's VO trim, Ganesha still appears visually but doesn't auto-narrate — child can tap the card to proceed. That's the right balance.

**One small enhancement (optional):** when zone is complete and Ganesha is in `celebration` pose at `slot: 'top'`, add a gentle bounce to draw the eye to the new "Mastered" badge nearby.

**File:** `ZoneWelcome.css`
**Append:**
```css
.zone-ganesha-presence--top:has(+ .zone-mastered-badge),
.zone-welcome-container.zone-complete .zone-ganesha-presence--top {
  animation: ganeshaCelebrationBob 1.6s ease-in-out infinite;
}

@keyframes ganeshaCelebrationBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
```

> If `:has()` selector isn't supported in your target browsers, the second selector (using the existing `zone-complete` class on the container at line 865) will catch it.

---

## 6. Summary of Files Touched

| File | Sections | What Changes |
|------|----------|--------------|
| `ZoneWelcome.jsx` | 1.1, 2.1, 3.1, 4.3 | Progress label simplified, sparkle chars → Mastered badge, CTA banner added, VO helpers + effect added |
| `ZoneWelcome.css` | 2.2, 3.2, 5 | Mastered badge styles, CTA banner styles, optional Ganesha celebration bob |

**Nothing else gets touched.** No changes to:
- Scene card rendering
- Whisper system
- Zone theme config
- ScreenHeader, HomeButton, ProfileChip components
- Cultural progress extractor
- Confetti logic

---

## 7. Order of Implementation

1. **Section 1 first** — fixes the visibly broken bottom bar text. 2-minute change.
2. **Section 2 next** — Mastered badge. Test that it only appears when zone is complete.
3. **Section 3 next** — CTA banner. **Verify the `onNavigate?.('home')` call matches your router's actual prop** before testing.
4. **Section 4 last** — VO. Test with mute on AND off to confirm both paths work.
5. **Section 5 (optional)** — only if you want the celebration bob.

---

## 8. Things to Verify Before Shipping

- [ ] Bottom progress bar reads cleanly: `"3/4 Symbols"` while in progress, `"4/4 Symbols"` when done
- [ ] "Mastered" sub-label only shows when every scene is complete
- [ ] CTA banner only shows when zone complete; the "back to map" button actually navigates home
- [ ] Welcome VO plays exactly once on first zone entry, never again for that profile
- [ ] Completion VO plays exactly once when zone is first mastered, never again
- [ ] Both VO lines respect mute (if `GameStateManager.isMuted()` exists)
- [ ] Existing scene whisper system still works (don't break what's working)
- [ ] On a fresh profile, no localStorage `gzw_vo_*` keys exist; after first visit they appear

---

## 9. What I'd Push Back On (Not Recommending)

- ❌ **Adding fireworks/confetti loop in zone-complete state** — annoying after visit #2. The existing one-time confetti at zone completion (line 129) is enough.
- ❌ **Auto-navigating away from completed zones** — child should choose to leave, never be pushed.
- ❌ **Disabling Replay buttons after zone complete** — replaying scenes is a core engagement loop for this age. Keep them tappable.
- ❌ **Adding more VO lines for "good job" on every replay** — repetitive praise loses meaning fast. Save praise for the milestone moments only.
