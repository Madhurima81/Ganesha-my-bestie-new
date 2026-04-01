# Ganesha Emotional Platform — Complete Build Specification
## A sub-product under the Ganesha My Bestie umbrella
> Generated from full design session — March 2026
> Load this file at the start of every Claude Code session.
> Say: "Read GANESHA_EMOTIONAL_PLATFORM_BUILDSPEC.md — this is the full context. Today we're building [specific component]."

---

## 1. PRODUCT IDENTITY

**What it is:** A daily emotional regulation platform for children aged 5–12, rooted in Ganesha's symbolic wisdom. Children develop emotional intelligence through guided sensory journeys, daily stories, a growing garden, and a companion that evolves with them.

**Relationship to GMB:** Sub-product under the Ganesha My Bestie umbrella. Separate codebase, separate repo, separate deployment. Shares: Ganesha character, 8 symbols, Baloo 2 + Nunito fonts, warm cream palette, NRI cultural identity.

**This is NOT:** therapy, meditation app, mythology teaching, or generic SEL. It IS emotional experience design for children.

**Revenue model:** Freemium. Sessions 1–5 free (Daily Story + Garden + Companion intro). Feeling Worlds + full Companion + full Garden = subscription. Gate triggers at session 6. India: ₹499/month or ₹3,999/year. Global: $9.99/month or $79.99/year.

**Retention target:** 40 complete sessions = measurable neuroplastic behavioural shift (research-backed). Every design decision must protect the path to session 40.

---

## 2. TARGET AUDIENCE — EVALUATE FROM ALL 3 LENSES ALWAYS

1. **Top children's edutainment developer** (Disney / PBS Kids standards)
2. **NRI parent** — cultural authenticity, safety, emotional connection tool
3. **NRI child aged 5–12** — fun, personal, rewarding, never boring

---

## 3. TECH STACK

```
Framework:    React + Vite (new repo, clean start)
Deployment:   Netlify + GitHub (same pipeline as GMB)
Fonts:        Baloo 2 (headings) + Nunito (body) — pre-load in index.html
State:        localStorage — childProfile object (see schema section)
Routing:      React Router v6
Audio:        Web Speech API (Ganesha narration) + Web Audio API (music/effects)
              Pre-recorded audio for Sanskrit content
Reuse from GMB: GuidedExperienceScene.jsx + CSS, symbol definitions,
                warm colour palette, Ganesha character assets
```

---

## 4. DESIGN SYSTEM

### Typography — NO EXCEPTIONS
```css
font-family: 'Baloo 2', cursive;    /* ALL headings, titles, Ganesha speech, buttons */
font-family: 'Nunito', sans-serif;  /* ALL body text, instructions, labels */
```

### Colours
```
#FF9933   Primary — Ganesha orange. CTAs, borders, accents
#FFD700   Gold — unlocked symbols, seeds, stars, streaks
#FF5722   Deep orange — emphasis, symbol names, Ganesha highlights
#FFF8E7   Warm cream — primary screen backgrounds
#5D2E0F   Dark brown — body text on light backgrounds
#A0835A   Muted brown — hints, secondary text
#1A0A2E   Deep night — Quiet Time + guided experience backgrounds
```

### World colour themes
```
Sun Meadow (Green Zone):   #87CEEB sky → #FFD700 → #FFF8E7
Wind Hills (Yellow Zone):  #FFA500 → #FFD700 → #FFF3CD
Thunder Forest (Red Zone): #4A0E0E → #8B2500 → #D4380D
Rain Lake (Blue Zone):     #0D2B5E → #1565C0 → #E3F2FD
Quiet Time (Night):        #0A0A1E → #1A0A2E → #2D0A4E
```

### UI Rules
- Touch targets: minimum 60×60px — no exceptions
- Tap-first — never rely on hover states
- Visual + audio feedback on every interaction
- Never punish — wrong answers get gentle redirect, never buzzer
- One action per screen maximum
- Warm transitions: 300–400ms ease-in-out
- Progress always visible (streak, seeds, companion mood)
- Age 5–8: Baloo 2 everywhere, big emojis, lots of animation, confetti on wins
- Age 9–12: Cleaner layout, Nunito body, journal feel, no baby vibes

---

## 5. FULL NAVIGATION ARCHITECTURE

```
LAUNCH
  → Welcome Ritual (first time only)
  → Companion Selection (first time only — mouse named by child)
  → First Wisdom Seed Animation
  → HOME HUB

HOME HUB (routing brain — central screen)
  ├── Daily Story Path        (always visible)
  ├── Feeling Worlds          (unlocks session 6+)
  ├── My Garden               (always visible)
  ├── My Companion — Mushika  (always visible)
  ├── Quiet Time              (always visible)
  └── Parent Space            (hidden — math gate)
```

### Session Unlock Gates
```
Sessions 1–5:   Story Path + Garden + Companion only
Session 6+:     Feeling Worlds unlock
Session 15+:    Real-World Quests activate inside Feeling Worlds
Session 25+:    Advanced Symbol Journeys unlock
Session 40:     Maximum neuroplastic impact threshold
```

---

## 6. THE COMPANION — MUSHIKA

**Identity:** Ganesha's mouse vahana. Small, round, warm-eyed. Already GMB canon. Named by the child during onboarding (default name: Mushika).

**Why the mouse:** Culturally rooted — every Hindu child knows Ganesha's mouse. The mouse is small but carries Ganesha — small brave steps, outsized impact. Perfect metaphor for emotional courage.

**Companion state (stored in childProfile.companionState):**
```js
{
  name: 'Mushika',           // child-given name
  evolutionStage: 1,         // 1–4, unlocks at sessions 5/15/25/40
  mood: 'happy',             // happy | sleepy | waiting | celebrating
  lastVisitDaysAgo: 0,       // drives mood — 0=happy, 1=sleepy, 2+=waiting
  totalCareActions: 0,       // care interactions performed
  memoryHighlights: []       // array of session moments companion "remembers"
}
```

**Evolution stages:**
- Stage 1 (sessions 1–4): Tiny, round, big eyes. Curious baby mouse.
- Stage 2 (sessions 5–14): Slightly bigger. Wears a tiny marigold garland.
- Stage 3 (sessions 15–24): Confident. Small gold crown. Animated idle dance.
- Stage 4 (sessions 25–39): Full companion. Glows. Flies briefly. Remembers 5 moments.
- Stage 5 (session 40+): Transcendent. Golden shimmer. "Wisdom Keeper" title.

**Care mechanics:**
- Tap to pet (plays happy animation + sound)
- Feed a modak (unlocks once per day, plays eating animation)
- Companion shows sad eyes if child hasn't visited in 2+ days — gentle guilt, never punitive
- Ganesha says: "Mushika has been waiting for you! He missed you."

---

## 7. WISDOM SEEDS — THREE TYPES

Three different seed types, each earned differently. All grow in My Garden.

### Session Seeds (blue)
- Earned: one per completed session
- Grows into: a small blue flower
- 40 session seeds = full garden bed

### Symbol Seeds (gold)
- Earned: one per symbol unlocked (8 total)
- Grows into: a glowing Symbol Tree with the symbol icon
- 8 symbol trees = complete grove

### Story Seeds (green)
- Earned: one per Daily Story completed
- Grows into: a story vine with illustrated leaves
- Each leaf shows a scene from the story

---

## 8. MY GARDEN — PROGRESSION SYSTEM

**Visual:** A warm, illustrated garden that grows over time. Child's name on the garden gate. Mushika lives here between sessions.

**Three layers:**
1. **Flower Bed** — Session Seeds (blue flowers, one per session, up to 40)
2. **Symbol Grove** — Symbol Trees (gold, one per symbol unlocked, 8 total)
3. **Story Wall** — Story Vines (green, one per story, illustrated leaves)

**Milestone rewards:**
- 5 seeds: Mushika gets his garland (evolution stage 2)
- 8 seeds: First Symbol Tree appears
- 10 seeds: Garden gets a small fountain
- 15 seeds: Constellation map unlocks above the garden (night view)
- 25 seeds: Mushika gets his crown (evolution stage 3)
- 40 seeds: Garden glows gold. "Wisdom Keeper" ceremony.

**localStorage schema:**
```js
gardenState: {
  sessionSeeds: 4,          // count of blue flowers planted
  symbolSeeds: ['trunk', 'belly'],  // which symbol trees exist
  storySeeds: ['story_1', 'story_2'], // which story vines exist
  milestones: ['fountain'], // which milestone rewards are active
  lastWatered: '2026-03-25' // shows "watered today" animation
}
```

---

## 9. THE 4 FEELING WORLDS

Each world = one emotion zone. Same internal flow structure, different visual theme + Ganesha framing.

| World | Zone | Colour | Emotion cluster | Ganesha framing |
|-------|------|--------|-----------------|-----------------|
| Sun Meadow | Green | Gold + sky blue | Joy, calm, gratitude | "The animals are dancing — want to join?" |
| Wind Hills | Yellow | Amber + wind | Worry, anxiety, excitement | "The hills are windy today — let's find our footing" |
| Thunder Forest | Red | Deep red + orange | Anger, frustration, overwhelm | "The volcano is rumbling — let's work with it" |
| Rain Lake | Blue | Deep blue + silver | Sadness, tiredness, loneliness | "The lake is quiet today — let's sit beside it" |

### Realm Internal Flow (same structure for all 4 worlds)
```
World Entry → Realm Atmosphere Screen (5 sec immersive)
  → Emotion Entry (3 screens max for 5–8)
       Screen 1: Weather/Zone check-in (intensity slider or 4 snap tiles)
       Screen 2: Body map (tap where you feel it on Mushika's body)
       Screen 3: Story chip (what happened? — optional, skippable)
  → Ganesha responds + branching choice (2 options)
  → Regulation Loop Engine (age-adapted loop)
  → Symbol Glow Moment (THE peak)
  → Mission Screen
  → Wisdom Seed Growth Animation
  → Return to World Map
```

---

## 10. EMOTION ENTRY SYSTEM — 4 PATHWAYS

All 4 pathways produce the same output: `emotionCluster` + `intensity`. Different entry, same destination.

### Pathway unlock by session
- Sessions 1–5: Weather only (auto-selected, no choice shown)
- Sessions 6–14: Weather + Body (child picks)
- Session 3+ optional: Story/Narrative (always skippable)
- Sessions 15+: Direct label (face grid — "I know how I feel")

### Pathway 1 — Weather (default, ages 5+)
```
Thunderstorm → anger/frustration cluster
Windy        → worry/anxiety cluster
Rainy        → sadness/tiredness cluster
Sunny        → joy/calm cluster
Foggy        → confused/numb cluster
Dark night   → fear/scared cluster
```

### Pathway 2 — Body map (ages 6+, session 6+ unlock)
Tap on Mushika's body (not a generic silhouette):
```
Head tap  → heavy/hot → overwhelm/anger
Chest tap → tight/fast → fear/excitement
Tummy tap → twisty/fluttery → anxiety/nervousness
Hands tap → clenched/shaky → anger/fear
Legs tap  → heavy/wobbly → sadness/fear
```

### Pathway 3 — Story/Narrative (ages 7+, always optional)
```
"Felt unfair"      → anger/frustration
"Felt left out"    → sadness/belonging need
"Felt scary"       → fear cluster
"Got it wrong"     → shame/worry
"Something good!"  → joy/gratitude
"Don't know"       → default to calm, no block
```

### Pathway 4 — Direct label (ages 9+, session 15+ unlock)
Standard 6-face grid. "I know how I feel" shortcut.

### "I don't know" rule
NEVER block the journey. If child can't identify:
Ganesha: "That's okay — sometimes feelings are sneaky! Let's just do something gentle together."
→ Defaults to `cluster: 'calm'`, routes to gentlest experience.

### emotionSession object
```js
{
  entryGate: 'weather' | 'body' | 'story' | 'direct' | 'skipped',
  weatherPick: 'storm' | 'wind' | 'rain' | 'sun' | 'fog' | 'night' | null,
  bodyZones: ['tummy', 'chest', ...],
  storyChip: 'unfair' | 'leftout' | 'scary' | 'wrong' | 'good' | 'dunno' | null,
  directLabel: 'scared' | 'angry' | 'sad' | 'worried' | 'happy' | 'meh' | null,
  emotionCluster: 'fear' | 'anger' | 'sadness' | 'anxiety' | 'joy' | 'calm' | 'confused',
  clusterConfidence: 'confirmed' | 'inferred' | 'default',
  intensity: 'big_wave' | 'small_wave',
  selectedExperience: 'breathe' | 'imagine' | 'move' | 'stillness' | 'affirm',
  symbolUnlocked: 'trunk' | 'tusk' | 'belly' | 'mouse' | 'ears' | 'eyes' | 'mouth' | 'head',
  missionText: '',
  durationSeconds: 0,
  safetyFlag: false
}
```

---

## 11. INTENSITY ROUTING — THE ALGORITHM

Zone (intensity) determines which modality runs FIRST. This is non-negotiable — the wrong tool for the wrong intensity makes regulation worse.

| Zone | Intensity | First modality | Loop entry |
|------|-----------|----------------|------------|
| Red (Thunderstorm) | High | Movement first — gross motor discharge | Step 1 |
| Yellow (Windy) | Medium | Grounding + stillness — prevent escalation | Step 3 |
| Blue (Rainy) | Low | Uplifting affirmation + gentle visualisation | Step 4 |
| Green (Sunny) | Maintenance | SEL skill-building — empathy, growth | Step 2 |

**Big wave → grounding first:** If intensity = big_wave, run a 30-second grounding tool BEFORE the experience picker:
- "Push your hands against the wall for 5 seconds — like Ganesha moves obstacles!"
- "Squeeze your fists tight... now let go. Feel it leave!"
Then re-check: small wave now? → experience picker.

---

## 12. THE REGULATION LOOP — 7-STEP HOLISTIC SEQUENCE

Scientifically ordered physiological ramp from agitation to stillness. DO NOT reorder.

```
1. Move    — Warm-up, expel excess energy (Tusk symbol)
2. Play    — Quick joy game with Mushika (Modak symbol)
3. Stretch — Physical balance + inner strength (Trunk symbol)
4. Feel    — Body check / observation quest (Ears symbol)
5. Breathe — Core breath regulation (Belly symbol)
6. Believe — Ganesha affirmation (Mouth symbol)
7. Relax   — Symbol glow + deep visualisation (Session symbol)
```

### Age-adapted loop lengths
```
Ages 5–8:  4 steps — Move → Feel → Breathe → Relax (60–90 sec)
Ages 8–10: 5 steps — Move → Stretch → Feel → Breathe → Believe+Relax (2–3 min)
Ages 11–12: All 7 steps — full loop (4–5 min)
```

### The Observation Quest (Step 4 — Ears symbol)
"Ganesha's big ears notice everything! Can YOU? Find 3 things in your room that are [colour]. Come back when you've found them!"
- Timer pauses
- Child leaves screen, explores real room
- Returns, taps "I found them!"
- Journey continues
- Breaks screen barrier at zero tech cost

---

## 13. THE 5 MODALITIES

All 5 must be present in experience_templates.json. Each uses a different sense.

| Modality | Sense | Child does | Ganesha symbol |
|----------|-------|------------|----------------|
| Movement | Kinesthetic | Shakes, stomps, squeezes, pushes | Tusk |
| Breathing | Somatic | Follows animated breath ring | Belly |
| Visualization | Imagination | Closes eyes, imagines scene | Trunk |
| Stillness | Visual/observational | Observation quest or body scan | Ears |
| Affirmation | Auditory/verbal | Repeats or writes Ganesha's line | Mouth |

---

## 14. THE 8 GANESHA SYMBOLS — LOCKED DEFINITIONS

| Symbol | GMB name | SEL skill | Emotion cluster | Unlock condition |
|--------|----------|-----------|-----------------|------------------|
| &#128024; Trunk | Try anyway | High adaptability | Fear / anxiety | Complete fear journey |
| &#128400; Big Belly | Inner safety | Resilience | Sadness / low | Complete sadness journey |
| &#128061; Large Ears | Listen + observe | Active empathy | Confused / numb | Complete 5 sessions |
| &#129372; One Tusk | Perseverance | Emotional filtering | Anger / frustration | Complete anger journey |
| &#128018; Mouse | Small brave steps | Courage in steps | Anxiety / worry | Complete worry journey |
| &#127775; Small Eyes | Focus clarity | Mindfulness | Distracted / scattered | Complete 10 sessions |
| &#128172; Small Mouth | Speak your truth | Mindful speech | Shame / frustration | Complete story path x3 |
| &#127371; Big Head | Think big | Growth mindset | Stuck / closed | Complete 15 sessions |

**Symbol unlock rule:** Symbols are keys, not stickers. Unlocking a symbol grants access to a new scenario type inside Feeling Worlds. Trunk unlock → "brave quest" scenarios available. Mouse unlock → "small steps" challenges appear.

---

## 15. DAILY STORY PATH — CONTENT SPEC

### Story structure (5 acts, JSON-driven)
```
Act 1: Situation Scene       — Child + Mushika face a real-life scenario
Act 2: Emotion Confusion     — Neither knows what the feeling is
Act 3: Ganesha Guidance      — Ganesha appears, links feeling to symbol
Act 4: Symbol Activity       — Short interactive activity using the symbol
Act 5: Resolution Scene      — Situation resolves, Wisdom Seed planted
```

### 5 MVP stories (sessions 1–5)
```
Story 1: The Big Test         — Fear cluster → Trunk symbol
Story 2: The Broken Plan      — Anger cluster → Tusk symbol
Story 3: The Empty Lunch Table — Sadness cluster → Belly symbol
Story 4: The New Place        — Anxiety cluster → Mouse symbol
Story 5: The Foggy Feeling    — Confused cluster → Ears symbol
```

### Story JSON structure
```js
{
  id: 'story_1',
  title: 'The Big Test',
  emotionCluster: 'fear',
  symbol: 'trunk',
  acts: [
    { id: 'act_1', type: 'situation', text: '...', ganesha_line: '...', visual: '...' },
    { id: 'act_2', type: 'confusion', text: '...', mushika_reaction: '...' },
    { id: 'act_3', type: 'guidance', ganesha_line: '...', symbol_intro: 'trunk' },
    { id: 'act_4', type: 'activity', activity_type: 'breathe' | 'move' | 'affirm' },
    { id: 'act_5', type: 'resolution', text: '...', seed_type: 'story' }
  ],
  duration_seconds: 120,
  age_min: 5
}
```

---

## 16. GANESHA'S VOICE — COPY RULES BY AGE

### Ages 5–7
- Ganesha reads every line aloud (Web Speech API)
- Max 10 words per sentence
- No emotion vocabulary — only body language
- "Your tummy feels twisty!" not "You feel anxious"
- Always warm, always bestie energy

### Ages 8–10
- Voice available, text visible too
- Emotional words introduced gently: "That sounds a bit like feeling worried"
- Always rejectable: "Yes / Sort of / Not really"
- More conversational, slightly less bouncy

### Ages 11–12
- Text-first, voice opt-in
- Peer-level tone — no cuteness, no baby language
- Full symbolic meaning + cultural context
- "Fear isn't weakness. It means something matters to you."
- Journal-style missions: child writes their own

---

## 17. QUIET TIME ZONE — SPEC

**Theme:** Dark sky, slow stars, Mushika sleeping. Night mode — different from everything else.

**UI rules for Quiet Time:**
- Dark backgrounds (#0A0A1E → #1A0A2E)
- No confetti, no celebration animations
- Slower transitions (600ms)
- Audio-first — visuals are ambient, not interactive
- Ganesha speaks in a whisper voice (lower pitch, slower cadence)

**Content (MVP):**
- 3 Sleep Stories (Ganesha narrates a slow symbolic tale, 5 min each)
- Calm Breathing Visual (slower breath ring, 4-7-8 pattern)
- Mantra Music (Om Gam Ganapataye — looping, gentle)
- Night Closure Ritual ("Tell Ganesha one good thing from today" → Mushika saves it)

---

## 18. PARENT SPACE — SPEC

**Access:** Math gate ("What is 8 + 7?") on long-press of Ganesha icon in top corner of Home Hub.

**Visual:** Clinical white background. Adult typography. Clearly a different space from the child's world.

**Content:**
- Today's session summary (emotion, pathway used, symbol, mission, duration)
- Emotional pattern this week (emotion cluster frequency)
- Symbol collection (which symbols unlocked, what they mean in plain language)
- Conversation starters ("Ask Arjun: what was your Trunk Move today?")
- Gentle safety flags (soft, non-alarmist: "Worried/scared 3+ days — consider checking in")
- Session history log
- Settings (child age, name, notification time, audio preferences)
- Subscription management

**Privacy note (always shown at bottom):**
"[Child name]'s sharing stays between them and Ganesha. This summary helps you connect — not monitor."

---

## 19. COMPLETE childProfile SCHEMA

```js
childProfile: {
  // Identity
  name: '',
  age: 0,                    // 5–12 — drives ALL UX adaptation
  enjoys: [],                // ['Games', 'Music', ...]
  spirit: '',                // 'a helper' | 'a maker' | 'an explorer' | 'calm inside'
  createdAt: '',

  // Progress
  totalSessions: 0,
  streakCount: 0,
  lastVisitDate: '',
  unlockedPaths: ['story'],  // grows: ['story','worlds','quests','advanced']
  unlockedSymbols: [],       // ['trunk', 'belly', ...]

  // Emotion pathway
  unlockedPathways: ['weather'],  // grows: ['weather','body','story','direct']
  preferredGate: 'weather',       // most used — shown first
  emotionHistory: [],             // last 30 emotionCluster strings

  // Garden
  gardenState: {
    sessionSeeds: 0,
    symbolSeeds: [],
    storySeeds: [],
    milestones: [],
    lastWatered: ''
  },

  // Companion
  companionState: {
    name: 'Mushika',
    evolutionStage: 1,
    mood: 'happy',
    lastVisitDaysAgo: 0,
    totalCareActions: 0,
    memoryHighlights: []
  },

  // Session history
  sessionLog: [],            // array of emotionSession objects
  missionLog: [],            // array of {date, mission, symbol} objects
  safetyFlags: []            // array of flagged sessions
}
```

---

## 20. BUILD ORDER — EXACT SEQUENCE

### Phase 1A — Core loop (build this first)
```
1. childProfile schema + useChildProfile.js hook          1–2 hrs
2. Home Hub screen (session-aware, lock/unlock logic)      3–4 hrs
3. Daily Story Engine + 5 MVP stories                      3–4 days
4. My Garden (visual front-end for seed/symbol data)       4–5 hrs
5. Feeling Worlds map + realm atmosphere screens           1–2 days
6. Emotion Entry flow (3 screens: weather+body+story)      4–5 hrs
7. Regulation Loop Engine (wires GuidedExperienceScene)    1–2 days
8. Symbol Glow Screen + Mission Screen                     3–4 hrs
9. Session completion + Wisdom Seed animation              2–3 hrs
```

### Phase 1B — Retention + delight
```
10. My Companion — Mushika (after character design)        2–3 days
11. Quiet Time zone                                        2–3 days
12. Parent Space                                           1–2 days
13. Welcome Ritual + Onboarding (build last)               1–2 days
```

### Phase 2 — Scale
```
14. Subscription gate at session 6
15. More stories (sessions 6–15)
16. Real-World Quests (session 15+)
17. Advanced Symbol Journeys (session 25+)
18. Capacitor wrap for iOS/Android
19. AR — Ganesha/Mushika in the living room
```

---

## 21. WHAT ALREADY EXISTS (reuse from GMB)

| Component | Location in GMB | How to reuse |
|-----------|-----------------|--------------|
| GuidedExperienceScene.jsx | src/features/talk-with-ganesha/ | Copy directly. IS the Regulation Loop Engine. |
| GuidedExperienceScene.css | Same folder | Copy with the JSX |
| Symbol definitions | sceneRegistry.js + data/ | Extract symbol objects into shared symbols.json |
| Emotion data files | src/data/ | doorway_routing_map.json, doorway_tool_library.json, emotion_scenario_master_d.json, experience_templates.json, affirmation_bank.json, completion_messages.json, invitation_lines.json, safety_flag_logic.json |
| Design tokens | Inline styles throughout GMB | Extract into theme.js |

### Known bug in GuidedExperienceScene.jsx to fix on copy
Line ~193: `.gmb-bg-layer` div has `style={{ background: ZONE_THEMES[zone]?.bg }}` — `bg` property doesn't exist in `ZONE_THEMES`. CSS handles background via `.gmb-theme-[zone]` class already. Remove the inline style prop.

---

## 22. THE COMPETITIVE MOAT

Five things no Western SEL app can replicate:

1. **Cultural rootedness is structural** — Ganesha's symbols are ancient wisdom + living deity, not invented game mechanics
2. **Progressive emotional literacy** — the app grows with the child (session-based pathway unlock)
3. **The observation quest** — breaks the screen barrier, child physically moves around their room
4. **Parent connection layer** — conversation starters rooted in the child's actual session ("Ask about their Trunk Move")
5. **Mushika the companion** — parasocial attachment through a culturally authentic character, not a generic mascot

---

## 23. QUESTIONS LOCKED

| Question | Answer | Locked |
|----------|--------|--------|
| What is the companion? | Ganesha's mouse vahana — Mushika | YES |
| What is a Wisdom Seed? | Three types: session (blue) / symbol (gold) / story (green) | YES |
| New product or GMB? | Sub-product under GMB umbrella | YES |
| Age bands | 5–7 / 8–10 / 11–12 | YES |
| Session unlock gates | 1–5 / 6+ / 15+ / 25+ / 40 | YES |
| Retention target | 40 sessions = max neuroplastic impact | YES |
| Freemium gate | Session 6 (Feeling Worlds unlock) | YES |
| Revenue model | Subscription (monthly + annual) | YES |
| Tech stack | React + Vite + Netlify, same as GMB | YES |
| Symbol meanings | See Section 14 — locked | YES |
| Intensity routing | Red=Move first, Yellow=Ground, Blue=Affirm, Green=Build | YES |
| Loop sequence | Move→Play→Stretch→Feel→Breathe→Believe→Relax | YES |

---

*End of specification. Version: March 2026.*
*Next session: Start with Build Order Step 1 — childProfile schema + useChildProfile.js*
