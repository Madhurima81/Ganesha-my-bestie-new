# CleanProfileSelector — 3-Step Onboarding Refactor

## Goal
Split the single profile-creation modal into 3 sequential steps for better cognitive flow for kids 5–12.
**Only the create-profile modal changes.** Grid, delete, info, welcome-back logic stay untouched.

---

## Scope

**File to edit:** `CleanProfileSelector.jsx` + `CleanProfileSelector.css`
**Don't touch:** `GameStateManager`, `PrimaryBtn`, `ScreenHeader`, profile grid logic, delete modal, info modal, returning-user flow.

---

## State Changes

Replace the single modal block with a step-driven view.

```jsx
// ADD this state near the other useState calls
const [currentStep, setCurrentStep] = useState(1); // 1=name, 2=age, 3=friend

// REMOVE the old single-modal `showCreateProfile && (...)` block.
// REPLACE with: showCreateProfile && <CreateFlow ... />
```

Reset `currentStep` to 1 whenever the create flow opens or closes:
```jsx
useEffect(() => {
  if (showCreateProfile) setCurrentStep(1);
}, [showCreateProfile]);
```

---

## The 3 Steps

All 3 steps live inside ONE modal shell (`explorer-modal`). Only the inner content swaps.
This keeps Ganesha + background continuous = no jarring re-mount.

### Shared shell (always visible during create flow)
- Background (forest + dust + vignette) — already exists
- Ganesha image at top of card (NEW — needs to be added)
- 3 progress dots below Ganesha (NEW)
- Card body (changes per step)
- Primary button at bottom (changes per step)
- Back/Cancel link

### Step 1 — Name
- **Heading:** "What should I call you?"
- **Subheading:** "Tell me your name"
- **Input:** existing `name-input`
- **Button:** "Next" (disabled if name.trim().length < 2)
- **Back link:** "Cancel" (closes modal entirely, calls onCancel or setShowCreateProfile(false))

### Step 2 — Age
- **Heading:** "How old are you?"
- **Subheading:** small text above heading: `Hi {name}!` (in lavender, ~14px)
- **Stepper:** existing `age-stepper` (default 7, range 5–12 — clamp here)
- **Button:** "Next"
- **Back link:** "Back" → setCurrentStep(1)

### Step 3 — Friend
- **Heading:** "Pick your friend"
- **Subheading:** "Who will join your adventure?"
- **Grid:** existing `friend-grid` (4 animals)
- **Button:** "Start Adventure!" → calls existing `handleCreateProfile`
- **Back link:** "Back" → setCurrentStep(2)

---

## Voice-Over (VO) Updates

**Remove the current intro VO** ("Let's create your profile. Type your name and pick a friend") — it previews all steps. Replace with per-step VO:

| Step | VO line | Trigger |
|------|---------|---------|
| 1 | "Hi! What should I call you?" | On step 1 mount, once per session |
| 2 | "Nice to meet you, {name}! How old are you?" | On step 2 mount, once per session |
| 3 | "Now pick a friend to join your adventure!" | On step 3 mount, once per session |
| Avatar tap | "Nice choice!" | Existing — KEEP |
| On submit | "Yay, {name}! Let's go!" | Existing — KEEP |

Use a `playedStepVoRef` ref (object: `{1: false, 2: false, 3: false}`) to guard re-plays.
Cancel `window.speechSynthesis` before each new step utterance.

Respect existing `ganesha_audio_enabled` localStorage flag.
Drop the `PROFILE_CREATE_INTRO_VO_KEY` localStorage flag — per-step VO doesn't need persistence.

---

## Transitions

- 250ms slide-left between steps (Next) / slide-right (Back)
- Use CSS `transform: translateX()` + `transition`
- Don't unmount steps — render conditionally with opacity/transform for smoothness
- OR simpler: just fade (200ms opacity) — kids won't notice, easier to debug

**Recommend the fade approach for v1.** Slide can be added later if it feels static.

---

## Progress Dots

Below Ganesha, above heading:
```jsx
<div className="step-dots">
  <span className={currentStep >= 1 ? 'active' : ''} />
  <span className={currentStep >= 2 ? 'active' : ''} />
  <span className={currentStep >= 3 ? 'active' : ''} />
</div>
```

CSS:
```css
.step-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 8px 0 16px;
}
.step-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.25);
  transition: background 0.3s ease;
}
.step-dots span.active {
  background: #7c3aed; /* purple */
}
```

---

## Ganesha Image

Add at top of `explorer-modal`:
```jsx
<div className="ganesha-onboarding-portrait">
  <img src="/images/ganesha-greeting.png" alt="Ganesha" />
</div>
```

CSS:
```css
.ganesha-onboarding-portrait {
  display: flex;
  justify-content: center;
  margin: -40px 0 8px; /* lifts him above the card edge like Image 2 */
}
.ganesha-onboarding-portrait img {
  width: 110px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.3));
}
```

If you don't have `/images/ganesha-greeting.png` yet, fall back to whatever Ganesha portrait already exists in the project. Flag it as a TODO asset if needed.

---

## Validation Rules

- **Name:** trim, min 2 chars, max 12 chars (existing maxLength)
- **Age:** clamp to range 5–12 (currently unclamped on the upper side — fix while we're here)
  ```jsx
  onClick={() => setSelectedAge(Math.min(12, (selectedAge || 7) + 1))}
  onClick={() => setSelectedAge(Math.max(5, (selectedAge || 7) - 1))}
  ```
- **Avatar:** default 'monkey' (existing)

---

## Button Behavior

| Step | Button label | Disabled when | onClick |
|------|--------------|---------------|---------|
| 1 | Next | name.trim().length < 2 | setCurrentStep(2) |
| 2 | Next | never (age has default) | setCurrentStep(3) |
| 3 | Start Adventure! | never (avatar has default) | handleCreateProfile() |

---

## What NOT to change

- `handleCreateProfile` logic — works as is
- `handleAvatarSelect` VO — works as is
- `GameStateManager.createProfile` call — works as is
- Profile grid, empty slots, manage mode, delete modal, info modal — all untouched
- The `forceCreate` prop behavior — same trigger, just renders the new 3-step UI

---

## Acceptance Test

1. First-time user lands → 3-step flow opens at step 1, Ganesha visible, dot 1 filled, VO plays "Hi! What should I call you?"
2. Type 1 char → Next stays disabled. Type 2+ chars → Next enables.
3. Tap Next → step 2 fades in, dot 2 fills, VO plays "Nice to meet you, [Name]!", "Hi [Name]!" visible above heading.
4. Tap +/− → age changes, clamped 5–12.
5. Tap Next → step 3, dot 3 fills, VO plays "Now pick a friend!"
6. Tap an avatar → "Nice choice!" plays once (only on first selection).
7. Tap Start Adventure → "Yay, [Name]! Let's go!" plays, profile saved, onProfileSelect fires.
8. Back link on step 2/3 returns one step. Cancel on step 1 closes the create flow.
9. Refresh during step 2 → no broken state (we don't persist mid-flow, by design).

---

## Estimated effort
Single Claude Code session, ~30–45 min. Low risk because all backend logic is reused.
