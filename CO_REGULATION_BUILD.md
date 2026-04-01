# 🐘 GMB — Co-Regulation System Build Tracker
**Feature:** Talk with Ganesha + Time with Ganesha  
**Last Updated:** March 2026  
**Status Key:** 🔴 Not Started · 🟡 In Progress · 🟢 Done · ⏸ Paused

---

## 📱 CONFIRMED SCREEN FLOW (LOCKED)

```
Gameplay / Zone
   ↓  Talk with Ganesha  (chat modal — overlays zone BG, not a new route)
   ↓  Emotion chips inside chat
      "How is your heart feeling today?"
      🙂 😟 😡 😢 😴 💬 "Just talk"
   ↓  Conversation turns  (Listen → Validate → Guide)
      Keyword scan silent on every message
      Suggestion fires: keyword detected OR 4 turns
   ↓  ⭐ Invitation Modal  (separate soft overlay ON TOP of chat)
      "Sometimes worries make our heart flutter."
      "Shall we try something together?"
      [ Yes, let's try ]   [ Maybe later ]
   ↓  Doorway Choice Screen  (full screen, zone BG carries through)
   ↓  Guided Experience Scene  (zone BG + timed state machine)
   ↓  Completion Screen  (soft light wash)
   ↓  Return to Gameplay / Chat
```

### Visual Design Reference
![Invitation Modal](docs/invitation-modal-reference.png)
- Background: mystical purple/lavender pond scene (`/images/twg-bg.png`)
- Ganesha: seated full-body with modak bowl, bottom-left, floating animation
- Text: Baloo 2, deep purple `#5A4A7A`, centered right of Ganesha
- Primary CTA: orange gradient pill "Yes, let's try"
- Secondary CTA: white ghost pill "Maybe later"
- Entry: scale + fade-in cinematic feel

### Screen Type Clarification (LOCKED)
| Screen | Type | Notes |
|--------|------|-------|
| Talk with Ganesha | Chat modal — overlays zone BG | Zone BG still visible behind it |
| Emotion chips | Inside chat — NOT a separate screen | Appear as first message in chat |
| Invitation | Separate soft overlay ON TOP of chat modal | Distinct moment, not inline bubble |
| Doorway Choice | Full screen | Zone BG carries through |
| Guided Experience | Full screen | Zone BG + timed state machine |
| Completion | Full screen | Soft light wash |

### Skip Path Logic (LOCKED)
```
Child taps "Just talk"
   → emotion_cluster = null
   → keyword scan still runs silently on every message
   → IF keyword fires → cluster assigned mid-chat → standard invitation modal
   → IF no keyword + 4 turns pass → softer invitation modal (no cluster assumed)
   → cluster stays null until keyword fires
```

**Psychology lock:** Child thinks they're just chatting. Ganesha listens the whole time. Trust builds before guidance is offered.

---

## ⚙️ ARCHITECTURE NORTH STAR

> You are building an **Emotional Experience Runtime Engine** — NOT a script library.  
> Flow logic = engine. Text + audio = swappable content layer. Zone art = reused as-is.

### Full runtime flow:
```
emotion_cluster (from picker OR keyword detection mid-chat)
   ↓
doorway_set → child picks doorway_type
   ↓
experience_template loads
environment = existing zone BG
voice_pack = emotion-matched lines
   ↓
timed state machine runs phases
   ↓
completion → return to game
```

### Keyword detection — runs on EVERY chat message:
```
child speaks / types  →  Web Speech API / text input
                                  ↓
                    KeywordEngine.js scans transcript
                                  ↓
              cluster found?  →  YES → assign cluster, respond warmly
                               NO  →  increment turn counter
                                  ↓
              turn_count ≥ 4 OR cluster assigned → check suggestion trigger
```

### Suggestion bubble trigger rules:
| Condition | Bubble type | Cluster state |
|-----------|-------------|---------------|
| Keyword detected (any turn) | Standard suggestion bubble | Cluster assigned |
| 4 turns, no keyword, emotion picked | Standard suggestion bubble | Cluster from picker |
| 4 turns, no keyword, skip path | Softer suggestion bubble | Cluster = null → generic doorway set |

---

## 🗺️ EMOTION → ZONE MAPPING (Reuse existing art only)

| Emotion Cluster | Zone Used | Background Feel |
|----------------|-----------|-----------------|
| Frustration / Anger | Symbol Mountain | Rocky, strong, climb energy |
| Anxiety / Worry | Shloka River | Flowing water, mist, gentle |
| Fear | Cave of Secrets | Dark → slowly lighting up |
| Sadness / Loneliness | Shloka River (lotus mist variant) | Soft, still, warm glow |
| Confidence / Pride | Symbol Mountain (summit) | Bright, open, expansive |
| Overwhelm | About Me Hut | Cozy, small, safe |
| Excitement (dysregulated) | Festival Square | Channelled into rhythm |

**Decision:** No new zone art needed for V1. ✅

---

## 🚪 V1 DOORWAY TYPES (5 only)

| # | Doorway Type | What it does |
|---|-------------|--------------|
| 1 | `slow_breath` | Belly breathing with visual sync |
| 2 | `movement_reset` | Shake / stomp / stretch sequence |
| 3 | `focus_stillness` | Gaze on one object, mind quiets |
| 4 | `courage_words` | Affirmations + Ganesha symbol moment |
| 5 | `sensory_hum` | Hum / sound vibration grounding |

Each emotion cluster gets 3 of these as doorway options.

---

## 📦 EXPERIENCE TEMPLATE STRUCTURE

**8 core templates in V1.** Content team only changes the text/audio layer.

```json
experience = [
  { "phase": "arrival",       "type": "focus_object",    "asset": "star|lotus|tusk",  "duration": 8  },
  { "phase": "settle",        "type": "breath_sync",     "pattern": "slow|box|wave",  "duration": 15 },
  { "phase": "release",       "type": "imagination_fx",  "effect": "cloud_clear|shake_out|river_flow", "duration": 10 },
  { "phase": "affirmation",   "type": "affirmation",     "text": "[CONTENT SLOT]",    "duration": 8  },
  { "phase": "symbol_moment", "type": "symbol_glow",     "symbol": "[SYMBOL SLOT]",   "duration": 6  },
  { "phase": "completion",    "type": "completion",      "next": "return_game|chat"               }
]
```

**8 V1 Template Names:**
1. `strong_movement_reset`
2. `calm_belly_breathing`
3. `focus_gaze_journey`
4. `courage_step_journey`
5. `comfort_hug_ritual`
6. `release_frustration_blow`
7. `joyful_energy_balance`
8. `reflective_quiet_stillness`

**Scale:** 8 templates × 5 zones = **perceived 40 experiences. Dev work = 8.** ✅

---

## 🧩 COMPONENTS NEEDED

### New Components (build fresh)

| Component | What it does | Used in |
|-----------|-------------|---------|
| `TalkWithGanesha.jsx` | Main chat entry. Mic button, emotion icons, text fallback | Entry point |
| `EmotionPicker.jsx` | Grid of emotion icons. Age-conditional (5–7: 6 big faces / 8–12: nuanced set) | Part 1 |
| `VoiceInputButton.jsx` | Mic trigger → Web Speech API → transcript string | Part 1 |
| `KeywordEngine.js` | Pure JS util. String in → `emotion_cluster` out. No library. | Parts 1, 2 |
| `GaneshaChat.jsx` | Chat bubble UI. Ganesha response lines, typing animation, turn memory | Part 2 |
| `ConversationEngine.js` | State machine: turn count, keyword scan on every message, mid-chat cluster assignment, suggestion trigger (keyword OR 4 turns), skip path handled | Part 2 |
| `InvitationModal.jsx` | Soft overlay ON TOP of chat modal. "Shall we do something together?" YES / LATER. Distinct moment from chat. | Part 3 |
| `DoorwayPicker.jsx` | 3-card choice. Loads `doorway_set` for detected emotion cluster | Part 4 |
| `ExperienceRuntime.jsx` | Core engine. Reads phase array, runs timed state machine | Part 5 |
| `PhaseRenderer.jsx` | Renders each phase type: breath / focus / affirmation / symbol_glow | Part 5 |
| `BreathSyncAnimation.jsx` | Expanding/contracting circle synced to breath phase duration | Part 5 |
| `SymbolGlowMoment.jsx` | Reuses Symbol Mountain assets. Glow + one-line meaning | Parts 5, 7 |
| `ExperienceCompletion.jsx` | After-state screen. Completion line + 3 CTAs | Part 6 |

### Existing Components to Reuse (wire in, don't rebuild)

| Component | How reused |
|-----------|-----------|
| Zone background art (all 5 zones) | Loaded as BG in `ExperienceRuntime` + crossfade after `InvitationModal` YES |
| `SceneCompletionCelebration` | Optional trigger at experience end |
| `BackToMapButton` | Always present — child must never be trapped |
| Symbol Mountain assets | Used in `SymbolGlowMoment` |
| `OpeningModal` | Entry modal for Talk with Ganesha access point |

### Data / Config Files (not components)

| File | What it holds |
|------|--------------|
| `emotionClusters.js` | Emotion list by age + keywords per cluster |
| `keywordMap.js` | Flat keyword → cluster lookup object (incl. Hinglish) |
| `ganeshaResponses.js` | Pattern-matched response lines per cluster (3–5 per emotion) |
| `doorwaySets.js` | emotion_cluster → array of 3 doorway_type options |
| `experienceTemplates.js` | 8 phase arrays — runtime loads from here |
| `voicePacks.js` | Narration text per template per emotion (swappable content layer) |
| `symbolSkillMap.js` | symbol → SEL skill + one-line meaning |
| `zoneEnvironmentMap.js` | emotion_cluster → zone BG asset path |

---

## 📝 CONTENT TEMPLATE (use this to generate all scripts)

Fill one per experience template × emotion cluster combo. ~30–35 total for V1.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE NAME:      [e.g. calm_belly_breathing]
EMOTION CLUSTER:    [frustration / anxiety / fear / sadness / confidence / overwhelm / excitement]
ZONE:               [mountain / river / cave / hut / festival]
GANESHA VOICE TONE: [warm-strong / gentle-soft / playful-brave / quiet-steady]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 — ARRIVAL (focus_object)
  Object shown:    [star / lotus / tusk / modak / drum]
  Narration:       "[Max 10 words. e.g. Let's find something beautiful to look at together.]"

PHASE 2 — SETTLE (breath_sync)
  Pattern:         [slow / box / wave]
  Narration:       "[e.g. Breathe in with me. Nice and slow.]"
  Inhale cue:      "[Breathe in / Suno / Fill up]"
  Exhale cue:      "[Let go / Chodo / Float out]"

PHASE 3 — RELEASE (imagination_fx)
  Effect:          [cloud_clear / shake_out / river_flow / blow_away]
  Narration:       "[e.g. Imagine that big feeling floating away like a cloud.]"

PHASE 4 — AFFIRMATION
  Ganesha line:    "[e.g. I am brave. Ganesha is right here with me.]"
  Child echo:      "[e.g. I am brave.] (optional — skip for 5–7)"

PHASE 5 — SYMBOL MOMENT
  Symbol:          [tusk / trunk / mouse / modak / axe / rope / lotus / om]
  Meaning shown:   "[e.g. Ganesha's tusk says: you are stronger than you think.]"

PHASE 6 — COMPLETION
  After-state:     "[e.g. Your heart feels a little lighter now. I felt it too. 🐘]"
  CTA 1:           "Go back to playing"
  CTA 2:           "Talk more with Ganesha"
  CTA 3:           "Visit the Hut"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## PART 1 — Emotion Identification Layer
**Status:** 🔴 Not Started  
**Screen:** Talk with Ganesha chat modal → emotion chips appear as first message in chat

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 1.1 | Child taps "Talk to me" from gameplay → Chat Screen opens | — | New route: `/talk` or `TalkWithGanesha.jsx` as dedicated screen | Soft entry — no hard transition | 🔴 |
| 1.2 | EmotionPicker floats up from bottom: "How is your heart feeling today?" | Emotion labels (5 emotions: Happy / Worried / Angry / Sad / Tired) | `EmotionPicker.jsx` — age-conditional icon set. Returns cluster string OR null. | 5 large emoji faces + "✨ I just want to talk" below. Gentle float-up animation. NOT a blocking modal. | 🔴 |
| 1.3 | Child picks emotion → cluster assigned. OR taps skip → cluster = null | `keywordMap.js` — keywords per cluster incl. Hinglish | Either path → chat opens. Keyword scan starts immediately regardless. | Both paths feel equally valid — skip option styled warmly, not like a lesser choice | 🔴 |

**Notes / Decisions:**
- Input hierarchy: 👆 Emotion icon tap → 🎤 Voice → ⌨️ Type
- Skip path: `emotion_cluster = null`. Keyword scan runs silently. Cluster can be assigned mid-chat.
- Keyword list must include Hinglish: "gussa", "dar lag raha", "achha nahi lag raha"
- Psychologically: giving autonomy here builds trust and improves honesty later ← LOCK THIS

---

## PART 2 — Chat Flow + Suggestion Trigger
**Status:** 🔴 Not Started  
**Screen:** Chat Screen (same screen, below EmotionPicker)  
**Rule: Listen → Validate → Guide. NEVER push regulation before trust is built.**

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 2.1 | Chat opens. Ganesha responds to first message warmly. | `ganeshaResponses.js` — 3–5 validation lines per cluster. If cluster=null, use generic warm lines. | `ConversationEngine.js` — checks cluster state, picks response line, increments turn counter | Chat bubble with Ganesha avatar. Gentle appear animation. Listening pulse while child speaks. | 🔴 |
| 2.2 | Keyword scan runs on every child message silently | `keywordMap.js` finalised | `KeywordEngine.js` called on every transcript. If cluster was null and keyword found → assign cluster now. Update response strategy. | Invisible to child | 🔴 |
| 2.3 | Suggestion trigger fires: keyword detected OR turn_count ≥ 4 | Suggestion bubble copy — 2 versions: standard (cluster known) + softer (cluster null after 4 turns) | `ConversationEngine.js` sets state → `suggestion_ready` → renders inline suggestion bubble inside chat | Inline bubble inside chat thread — NOT a popup. Feels like conversation, not feature navigation. | 🔴 |

**Suggestion bubble copy (draft):**
```
Standard  (cluster known): "Shall we do something together to feel better? 🐘"
Softer    (cluster null):  "I have an idea — want to try something calming with me?"
```

**Notes / Decisions:**
- Max turns before suggestion: 4 (not 3 — give more room to talk)
- Suggestion is NEVER a hard popup — always inline bubble in chat
- Child can ignore the bubble and keep chatting — system must handle this gracefully
- "Later" → bubble dismisses, chat continues, counter resets to 0 (not penalised)

---

## PART 3 — Invitation Modal ⭐
**Status:** 🔴 Not Started  
**Screen:** Separate soft overlay — appears ON TOP of chat modal. A distinct moment. NOT an inline bubble.

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 3.1 | Invitation overlay appears after suggestion trigger fires | 1 invitation line per cluster (7 lines) + 1 softer line for null cluster | `InvitationModal.jsx` — soft overlay, YES / LATER buttons | Distinct from chat — child feels a new moment beginning. Gentle animate-in. | 🔴 |
| 3.2 | YES → overlay closes, zone BG crossfades, Doorway screen loads | `zoneEnvironmentMap.js` finalised | cluster → zone BG → load `DoorwayPicker.jsx` | BG crossfade — feels like stepping into a world | 🔴 |
| 3.3 | LATER → overlay closes, returns to chat | — | Dismiss modal, reset turn counter to 0 | Clean dismiss, no guilt, chat continues naturally | 🔴 |

**Notes / Decisions:**
- `InvitationModal` replaces `RegulationEntryScreen` — it's an overlay, not a route
- LATER → child not penalised, turn counter resets, invitation can reappear later in session
- Zone BG from existing assets — no new art needed

---

## PART 4 — Doorway Choice Screen
**Status:** 🔴 Not Started

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 4.1 | 3 doorway cards shown | `doorwaySets.js` maps each cluster to 3 doorway_types | `DoorwayPicker.jsx` reads cluster → renders 3 cards | 3 large tap cards, icon + label, zone-coloured | 🔴 |
| 4.2 | Each card = regulation mode | 1 label + 1-line description per doorway type (5 types = 5 lines) | Load metadata from `doorwaySets.js` | Card idle micro-animation (breath card breathes, movement card shakes gently) | 🔴 |
| 4.3 | Child picks → experience loads | — | Selection → loads `experienceTemplates.js` + `voicePacks.js` | Card zoom → fade into experience | 🔴 |

**Doorway Sets (draft):**
```
frustration  → [movement_reset, release_frustration_blow, slow_breath]
anxiety      → [slow_breath, focus_stillness, sensory_hum]
fear         → [courage_words, sensory_hum, focus_stillness]
sadness      → [comfort_hug_ritual, slow_breath, courage_words]
confidence   → [courage_words, joyful_energy_balance, movement_reset]
overwhelm    → [focus_stillness, slow_breath, comfort_hug_ritual]
excitement   → [movement_reset, joyful_energy_balance, sensory_hum]
```

---

## PART 5 — Experience Runtime Engine
**Status:** 🔴 Not Started

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 5.1 | Zone BG visible, first phase loads | Arrival narration line per template (from content template) | `ExperienceRuntime.jsx` reads phase array, starts timed state machine | One continuous feel — no jarring cuts | 🔴 |
| 5.2 | Phases run sequentially | Fill content template for each template × cluster combo (~30 combos) | `PhaseRenderer.jsx` switches component per phase type. `BreathSyncAnimation.jsx` for breath. | Phase transitions invisible — child feels one flow | 🔴 |
| 5.3 | Symbol appears at symbol_moment phase | `symbolSkillMap.js` — one-line meaning per symbol (8 lines) | `SymbolGlowMoment.jsx` reuses Symbol Mountain assets | Soft glow, symbol floats in, meaning fades up | 🔴 |

**Notes / Decisions:**
- `ExperienceRuntime` = timed state machine via `setTimeout`/`useEffect` stepping through phase array
- Child POV: one continuous guided moment — not 5 screens
- Voice narration per phase via Web Speech API

---

## PART 6 — Completion & Reinforcement
**Status:** 🔴 Not Started

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 6.1 | Completion message shown | After-state line per template (COMPLETION field in content template) | `ExperienceCompletion.jsx` triggered when final phase ends | Soft light wash, Ganesha glows warmly | 🔴 |
| 6.2 | 3 CTAs offered | CTA lines per template (already in content template) | Navigation routing per CTA | Clear hierarchy — primary CTA largest | 🔴 |
| 6.3 | Return to game / chat / hut | — | Restore game state — no progress lost | Seamless fade back | 🔴 |

---

## PART 7 — Symbol & SEL Layer (Background)
**Status:** 🔴 Not Started

| Step | Product Flow | Content Task | Tech Task | UX Task | Status |
|------|-------------|--------------|-----------|---------|--------|
| 7.1 | Symbol glows in Phase 5.3 of every experience | `symbolSkillMap.js` — 8 symbols × 1 meaning line | Symbol tagged in each experience template. `SymbolGlowMoment.jsx` loads from map. | Small glow, one soft line — never interrupts flow | 🔴 |
| 7.2 | Repetition builds memory across sessions | Symbol reinforcement line variations | Track which symbols shown via localStorage. Rotate. | No explicit badge — learning is ambient | 🔴 |

**Symbol → SEL Skill Map (draft):**
```
tusk   → Courage.     "Ganesha broke his tusk to keep going. So can you."
trunk  → Flexibility. "The trunk bends easily — and so can we."
mouse  → Focus.       "The tiny mouse carries the biggest God. Small = powerful."
modak  → Reward.      "Sweet things come after we do the hard thing."
axe    → Letting go.  "The axe cuts away what we don't need."
rope   → Connection.  "Ganesha's rope pulls us back when we drift."
lotus  → Calm.        "The lotus grows in mud but stays clean and beautiful."
om     → Stillness.   "Om is the sound of everything being okay."
```

---

## 🔢 BUILD ORDER (do not change)

```
Step 1  →  emotionClusters.js + keywordMap.js           ← unlocks everything
Step 2  →  doorwaySets.js                               ← unlocks Part 4
Step 3  →  experienceTemplates.js (8 phase arrays)      ← unlocks Part 5
Step 4  →  ExperienceRuntime.jsx + PhaseRenderer.jsx    ← core engine
Step 5  →  voicePacks.js (fill content template above)  ← content layer
Step 6  →  TalkWithGanesha.jsx + GaneshaChat.jsx        ← entry + chat
Step 7  →  DoorwayPicker + RegulationEntryScreen        ← routing UI
Step 8  →  ExperienceCompletion + SymbolGlowMoment      ← finish layer
```

---

## ❓ OPEN QUESTIONS

- [ ] Age split: does EmotionPicker show different icon sets for 5–7 vs 8–12?
- [ ] LATER flow: where does child land — map screen or previous scene?
- [ ] `sensory_hum` — audio only or needs visual component too?
- [ ] Which 3 symbols used most in regulation (to prioritise assets)?
- [ ] Hinglish keyword list — who writes/reviews for accuracy?

---

## 📋 CONTENT ASSETS TRACKER

| Asset | File | Status | Notes |
|-------|------|--------|-------|
| Emotion list 5–7 | `emotionClusters.js` | 🔴 | 6 core clusters |
| Emotion list 8–12 | `emotionClusters.js` | 🔴 | Add nuance layer |
| Keyword map (English + Hinglish) | `keywordMap.js` | 🔴 | Must include Hinglish |
| Ganesha response lines (3–5 per cluster) | `ganeshaResponses.js` | 🔴 | Warm, metaphor-led |
| Doorway sets per cluster | `doorwaySets.js` | 🟡 Draft above | Needs review |
| 8 experience phase arrays | `experienceTemplates.js` | 🔴 | Structure only, no text |
| Content template fills (~30 combos) | `voicePacks.js` | 🔴 | Use template above |
| Symbol → SEL map (8 lines) | `symbolSkillMap.js` | 🟡 Draft above | Needs review |
| Zone → emotion BG map | `zoneEnvironmentMap.js` | 🟡 Draft above | Needs review |
| Invitation lines (1 per cluster, 7 total) | `ganeshaResponses.js` | 🔴 | "Shall we try something?" variants |
| After-state / completion lines | `voicePacks.js` | 🔴 | Part of content template |
