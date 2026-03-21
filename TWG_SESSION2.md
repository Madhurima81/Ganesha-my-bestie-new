# Time With Ganesha — Session 2 Opening Message
*Copy this exactly into the new Claude Code session.*

---

## Paste This to Start Session 2

```
Read SKILL.md, CLAUDE.md, and all 5 skill files in
.claude/skills/ganesha-my-bestie/ first.

We are building Time With Ganesha (TWG).
The dare bank is already done → src/lib/config/dareBank.js
Do NOT rewrite it. Just import from it.

Build in this order:

─────────────────────────────────────────
1. DailyDarePopup.jsx
   Path: src/lib/components/twg/DailyDarePopup.jsx
─────────────────────────────────────────
App.jsx level. Fires once per day on app open.
Date check: localStorage key 'gmb_last_dare_date'

Layout: exact OpeningModal pattern
  Left 35%  → GaneshaPresence, size=520, breathing=gentle,
               blink, pose changes per beat
  Right 50% → cream card, borderRadius 36px,
               speech bubble pointer toward Ganesha
  Backdrop  → rgba(255,244,214,0.45) + blur(8px)

Two-beat local state:

  Beat 1 — Gratitude check-in
    GaneshaPresence: pose=blessing, expression=encouraging
    Card shows:
      Title (Baloo 2, 60px): "Good morning, [childName]! 🌸"
      Body (Nunito, 36px): "Before today's adventure —
        what made you smile yesterday?"
      Input: tap or speak (30 seconds max)
      Button: "Next →"

  Beat 2 — Ganesha responds + Dare revealed
    GaneshaPresence: pose=pointing, expression=excited
    Card shows:
      Ganesha's warm response to the gratitude (1 line,
        hardcoded from a bank of 10 warm responses)
      Dare category icon (emoji)
      Dare text from getTodaysDare(childAge)
        → import { getTodaysDare } from
           '../../config/dareBank'
        → childAge from localStorage key 'gmb_child_age'
      Two buttons:
        Primary   → "I'll do it! 🐘"
        Secondary → "Remind me later"

  On "I'll do it!":
    localStorage.setItem('gmb_last_dare_date', today)
    localStorage.setItem('gmb_today_dare_id', dare.id)
    localStorage.setItem('gmb_today_dare_category',
      dare.category)
    Close popup

  On "Remind me later":
    localStorage.setItem('gmb_last_dare_date', today)
    Close popup (dare stored for DareAndShare later)

  Gratitude text logged to:
    localStorage.setItem('gmb_gratitude_today', text)
    → adds 1 modak to GratitudeJar count

─────────────────────────────────────────
2. TimeWithGaneshaHub.jsx
   Path: src/lib/components/twg/TimeWithGaneshaHub.jsx
─────────────────────────────────────────
Full screen destination from map button in CleanMapZone.jsx.
NOT a modal. Full page render.

Background: warm saffron linear-gradient
  'linear-gradient(160deg, #FFF8E7 0%, #FFE4B0 100%)'

Reads from localStorage:
  childName → 'gmb_child_name'
  childAge  → 'gmb_child_age' (number)

Age-adaptive greeting:
  Age 5–8:  "Hi [Name]! 🐘 Ready to spend time with me?"
  Age 9–12: "Hey [Name]. Good to see you. What's on your
              mind today?"
  Font: Baloo 2, 52px, color #6B5416

Sub-greeting (Nunito, 28px, #8B6914):
  "How do you want to spend time with me today?"

GaneshaPresence — central:
  pose=blessing, expression=happy
  size=280, breathing=gentle, blink
  positioned centre of screen

5 Mode tiles around Ganesha:
  🗣️  Talk to Me       → setActiveMode('talk')
  📖  Story Time       → setActiveMode('story')
  🕉️  Practice Shloka  → setActiveMode('shloka')
  🎯  Daily Dare       → setActiveMode('dare')
  🌟  Just Do Something → setActiveMode('just')

  Tile style: white card, borderRadius 20px,
    boxShadow warm, Baloo 2 label, 80px min touch target,
    saffron accent border on tap

Invisible 5-minute timer:
  Starts when hub mounts
  windDownLevel state: 0 (normal) → 1 (4 min) →
    2 (4.5 min) → 3 (5 min = close)
  Passed as prop to whichever modal is open

  At windDownLevel 1: shorten Claude responses (via prop)
  At windDownLevel 2: Ganesha says "one more minute"
    (hardcoded line, Web Speech)
  At windDownLevel 3: active modal closes →
    hub shows WarmClosingScreen

WarmClosingScreen (render when windDownLevel === 3):
  "See you tomorrow, [Name] 🐘"
  One line: what we talked about (from sessionLog state)
  Button: "Ask a parent for more time 🔒"
    (placeholder — parent unlock in Session 7)
  Tomorrow hook: one hardcoded offline suggestion
    (rotate from array of 10 by date)

Back button: HomeButton component (top left)
  → returns to zone map

─────────────────────────────────────────
3. TalkToGanesha.jsx (modal overlay on hub)
   Path: src/lib/components/twg/TalkToGanesha.jsx
─────────────────────────────────────────
Full screen modal overlay — slides up from bottom over hub.
NOT a route. Hub stays underneath.

Props:
  childName, childAge, windDownLevel, onClose

Voice loop states:
  'idle'      → mic button shown, waiting
  'listening' → Web Speech active, Ganesha ears animate
  'thinking'  → API call in progress
  'speaking'  → TTS reading response

GaneshaPresence expression per state:
  idle      → expression=happy,       pose=blessing
  listening → expression=encouraging, pose=blessing
  thinking  → expression=thinking,    pose=blessing
  speaking  → expression=excited,     pose=thumbs_up

Chat bubbles — scroll upward, full history visible:
  Child bubble (left):
    background #E8F5E9, borderRadius '18px 18px 18px 4px'
    label: "🎙️ [childName]"
    Nunito 24px

  Ganesha bubble (right):
    background #FFF8E7, borderRadius '18px 18px 4px 18px'
    label: "🐘 Ganesha"
    Nunito 24px
    Text appears word-by-word as TTS speaks

Silence handling:
  8 seconds silence → Ganesha says (Web Speech):
    "I'm still here. Take your time. 🌸"

Claude API system prompt — SEL-aware:
  Read sel-expert.md for zone detection logic.
  Every response internally considers:
    1. Child's Zone (Red/Yellow/Blue/Green)
    2. CASEL competency needed
    3. Technique offer if distressed
    4. Ganesha personality: unhurried, self-deprecating,
       practical, validates FIRST then teaches
    5. Age-adaptive tone from childAge prop

  windDownLevel adjustments to system prompt:
    windDownLevel 1: "Keep responses shorter now"
    windDownLevel 2: "Tell the child warmly you have
      one more minute together today"
    windDownLevel 3: onClose() called automatically

  Cap at 10 turns → offer co-regulation:
    "We've talked so much today! Want to do something
     together before you go? 🌸"

Safety net (keyword detection before API call):
  If child message contains: hurt / harm / scared /
    abuse / hit / unsafe →
  Ganesha responds (hardcoded, no API):
    "That sounds really hard. Please tell a grown-up
     you trust about this — a parent or teacher.
     You are safe and loved. 🌸"

X button: top right, closes modal → hub

─────────────────────────────────────────
WIRING INTO EXISTING FILES
─────────────────────────────────────────

App.jsx:
  Import DailyDarePopup
  Add date check logic (see above)
  Render <DailyDarePopup /> before map if showDare

CleanMapZone.jsx:
  Add TWG floating button — NOT a zone entry
  Position: bottom-centre of map, above zone labels
  Style: warm saffron pill button, Baloo 2,
    pulsing animation, "Time with Ganesha 🐘"
  On tap: call onZoneSelect('twg') or dedicated handler
    → mounts TimeWithGaneshaHub

─────────────────────────────────────────
WHAT NOT TO BUILD IN SESSION 2
─────────────────────────────────────────
❌ StoryTime.jsx        → Session 5
❌ ShlokaCoach.jsx      → Session 4
❌ DareAndShare.jsx     → Session 3
❌ JustDoSomething.jsx  → Session 6
❌ CoRegToolkit.jsx     → Session 6
❌ GratitudeJar.jsx     → Session 6
❌ ParentDashboard      → Session 7

─────────────────────────────────────────
COMPONENT PATTERNS — follow exactly
─────────────────────────────────────────
GaneshaPresence:
  src/lib/components/character/GaneshaPresence.jsx

OpeningModal layout reference:
  src/zones/shared/components/OpeningModal.jsx
  src/zones/shared/components/OpeningModal.css
  (font sizes: Baloo 2 60px titles, Nunito 36px body)

Zone themes:
  import { getZoneTheme } from
    'src/lib/config/ZoneThemes'

Dare bank:
  import { getTodaysDare, DARE_BANK }
    from 'src/lib/config/dareBank'

Benchmark before every component:
  Read NewModakSceneV7.jsx for import patterns,
  color system, and component wiring.

No TypeScript. Functional components only.
Baloo 2 all headings. Nunito all body.
Touch targets ≥ 60px.
```

---

## What Is Already Done

| Item | Status | Location |
|---|---|---|
| Dare bank (150 dares, 2 age bands) | ✅ Done | `src/lib/config/dareBank.js` |
| `getTodaysDare()` helper | ✅ Done | `src/lib/config/dareBank.js` |
| `getDareByCategory()` helper | ✅ Done | `src/lib/config/dareBank.js` |
| Unlock map | ✅ Done | `src/lib/config/dareBank.js` |
| 5 SEL skill files | ✅ Done | `.claude/skills/ganesha-my-bestie/` |
| Three architecture decisions | ✅ Confirmed | This doc |
| Full dependency chain | ✅ Confirmed | This doc |

## Three Architecture Decisions (Confirmed)

1. **DailyDarePopup** → App.jsx level (not hub entry)
2. **Voice loop + all 5 modes** → modal overlays on hub (not routes)
3. **Gratitude check-in + dare** → same screen, two beats, one flow

## Dependency Chain (Confirmed)

```
App.jsx
  ↓
DailyDarePopup (date-gated, once per day)
  → gratitude check-in → Ganesha responds → dare revealed
  ↓
Zone Map (CleanMapZone.jsx)
  → "Time with Ganesha 🐘" floating button
  ↓
TimeWithGaneshaHub.jsx
  → reads childName + childAge from localStorage
  → age-adaptive greeting
  → 5 mode tiles
  → invisible timer starts (windDownLevel 0→1→2→3)
  ↓
Modal overlay (mode selected)
  → TalkToGanesha / StoryTime / ShlokaCoach /
     DareAndShare / JustDoSomething
  → receives windDownLevel prop
  → timer continues running under modal
  ↓
At windDownLevel 3:
  → modal closes
  → WarmClosingScreen renders on hub
  → session summary + tomorrow hook
```
