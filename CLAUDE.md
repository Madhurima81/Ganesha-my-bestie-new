# Ganesha My Bestie — Claude Code Context

## What This Project Is
A children's cultural education PWA for NRI families. Teaches Hindu culture, Sanskrit, and mythology to kids aged 5-12. Built with React + Vite, deployed on Netlify via GitHub.

**Tagline:** *"Where your roots become your superpower."*

---

## Always Evaluate From These 3 Lenses
1. Top children's edutainment developer (Disney / PBS Kids standards)
2. NRI parent (cultural authenticity, pride, safety)
3. 2. NRI child aged 5–12 (fun, clear, rewarding, age-appropriate — 
   simple enough for a 5 year old, engaging enough for a 12 year old)

---

## Tech Stack
- **Framework:** React + Vite (plain JavaScript, no TypeScript)
- **Deployment:** Netlify via GitHub CI/CD
- **Styling:** Inline styles, CSS files, or Tailwind utility classes — use whichever is cleanest for the component
- **Audio:** Hybrid — pre-recorded MP3s for Sanskrit, Web Audio API for SFX/music, Web Speech API for narration
- **Storage:** localStorage for progress persistence

When sizing scene visuals, never add fixed-px `!important` size overrides; extend the element's existing `clamp(...)` or shared size token instead.

---

## Fonts — NO EXCEPTIONS
```
Headings, titles, buttons → Baloo 2 (loaded in index.html)
Body, instructions, labels → Nunito (loaded in index.html)
```
Never use system fonts or other Google Fonts.

---

## Project Structure
```
src/
├── components/         # Shared components
│   ├── SceneManager.jsx
│   ├── GameStateManager.jsx
│   ├── ProgressManager.jsx
│   ├── BackToMapButton.jsx
│   ├── SceneCompletionCelebration.jsx
│   ├── TocaBocaNav.jsx
│   └── SimpleDiscoveryOverlay.jsx   ← use this, NOT GameCoach
├── hooks/
│   └── useSceneReset.js
├── config/
│   └── SceneResetConfigs.js
└── zones/
    ├── zone1-symbol-mountain/
    ├── zone2-cave-of-secrets/
    ├── zone3-shloka-river/
    ├── zone4-festival-square/
    └── zone5-about-me-hut/
```

---

## The 5 Zones

| # | Zone | Free/Paid |
|---|------|-----------|
| 1 | Symbol Mountain — 8 Ganesha symbols | FREE |
| 2 | Cave of Secrets — 8 Sanskrit words | Paid |
| 3 | Shloka River — Vakratunda Shloka scenes | Paid |
| 4 | Festival Square — Piano, Rangoli, Modak, Mandap | Paid |
| 5 | About Me Hut — Family Tree, Name, Food, Friends | Paid |

---

## New Scene Checklist
Every new scene must have:
- [ ] `BackToMapButton` at top
- [ ] `useSceneReset` hook wired up
- [ ] `SceneCompletionCelebration` on win condition
- [ ] `ProgressManager.updateProgress()` call on completion
- [ ] Baloo 2 for all headings
- [ ] Nunito for all body/instructions
- [ ] Touch targets ≥ 60px (touch-first, no hover-only states)
- [ ] Mute button if audio is present
- [ ] Visual + audio feedback on every interaction
- [ ] Zone color scheme applied (see below)

---

## Zone Color Schemes

| Zone | Primary | Accent | Background |
|------|---------|--------|------------|
| Symbol Mountain | `#FF5722` | `#FFD700` | `#FFF8E7` |
| Cave of Secrets | `#6A1B9A` | `#00BCD4` | `#1A0A2E` |
| Shloka River | `#2E7D32` | `#03A9F4` | `#E8F5E9` |
| Festival Square | `#E91E63` | `#FF9933` | `#FFF3E0` |
| About Me Hut | `#795548` | `#FF6B6B` | `#FBE9E7` |

---

## Child UX Rules
- Max 3 steps to understand any game mechanic
- Show what to do **visually**, not just in text
- Reward every 30–60 seconds (stars, stamps, confetti)
- Never punish wrong answers — gentle redirect only
- Progress always visible (fill bars, stars, stamps)

---

## Cultural Standards (Non-Negotiable)
- Sanskrit text must be correctly transliterated
- Ganesha is always respectful, joyful, never caricatured
- Modak is Ganesha's favourite — treat with affection
- Family Tree supports non-Western family structures
- Do not invent new Sanskrit words — use only the 8 established ones

## Sanskrit Words (Cave of Secrets)
Vakratunda · Mahakaya · Suryakoti · Samaprabha · Nirvighnam · Kurumedeva · Sarvakaryeshu · Sarvada

---

## What NOT To Do
- ❌ Never use `GameCoach` — use `SimpleDiscoveryOverlay`
- ❌ Never use fonts other than Baloo 2 + Nunito
- ❌ Never use hover-only interactions
- ❌ Never skip audio feedback on major interactions
- ❌ Never add class components — functional only
- ❌ Never skip `BackToMapButton` — every scene needs an escape
- ❌ Never hardcode incorrect Sanskrit

---

## Pricing
- India: ₹1,999 one-time
- Global: $39.99 one-time
- Freemium: Zone 1 (Symbol Mountain) always free

---

## Scene Registry
All 22 scene files are listed in `src/config/sceneRegistry.js`.
When Madhurima says "apply X to all scenes" or "add X to all 22 scenes":
1. Read sceneRegistry.js first to get all file paths
2. Apply consistently to every file listed
3. Confirm each file updated with ✅

When she says "apply X to Zone 2" or "only Shloka River scenes":
1. Filter sceneRegistry.js by zone field
2. Apply only to those files

Quick zone reference:
- symbol-mountain → 4 scenes (01–04)
- cave-of-secrets → 5 scenes (05–09)
- shloka-river    → 5 scenes (10–14)
- festival-square → 4 scenes (15–18)
- about-me-hut    → 4 scenes (19–22)

---

## Benchmark Rule — applies to every task
Before making any change to any scene, Claude Code must:
1. Read `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx` fully
2. Extract the exact pattern for the task at hand
3. Read the target scene file
4. Compare — identify what is missing or different
5. Add only what is missing — do not rewrite existing code
6. Confirm with a per-file checklist ✅

---

## Global Rule — tasks are component wiring, not component building
Almost all tasks involve SHARED components that already exist.
The work is: import + render + pass props. Not rebuild.

For every task, Claude Code workflow is:
1. Find the shared component path via NewModakSceneV7.jsx imports
2. Check if target scene already imports it
3. If missing → add import at top of file
4. Check if it is rendered in JSX
5. If missing → add <ComponentName /> with correct props
6. Check props match NewModakV7 exactly
7. If props differ → fix props only

Never rewrite a shared component.
Never duplicate a shared component into a scene folder.
If a component does not exist yet — STOP and tell Madhurima before creating.

---

## T01 — Opening Modal
OpeningModal is a SHARED component with ONE shared OpeningModal.css.
Find exact path via import in NewModakSceneV7.jsx.

For each scene check:
1. Is OpeningModal imported from the correct shared path?
2. Is <OpeningModal /> rendered in JSX?
3. Are all required props passed — match NewModakV7 exactly
4. OpeningModal.css is imported inside the component itself — do NOT re-import in scene files
5. T11 (remove fade-out) — fix ONCE in OpeningModal.css, affects all 22 scenes automatically

---

## Always update docs after every change
After completing ANY task on ANY scene, Claude Code MUST:

### Update IMAGE_AUDIT.md
- After scanning any scene → fill in that scene's image table
- Flag any new broken references or oversized files

### Update CONTENT_AUDIT.md
- After reading any scene → fill in scores and flag issues
- Suggest rewrites inline — do not change content without Madhurima approval

### Update TASKS.md
- Mark the scene/task cell as [x] in the progress tracker
- If ALL scenes done for a task → mark the task checkbox at top as [x]

### Update NAVIGATION.md
- After scanning or fixing any scene → fill in that scene's section
- Update EXISTS / MISSING / PARTIAL status
- Check off any gaps that were fixed
- Update the SUMMARY section at the bottom

### Update TESTCASES.md (once T21 starts)
- After each scene is tested → mark test cases as PASS / FAIL / SKIP
- Log any edge cases found during implementation

### End of every session — run this before closing
"Update TASKS.md, NAVIGATION.md, and TESTCASES.md
to reflect everything completed in this session."

---

## NAVIGATION.md — how to fill it
When asked to fill NAVIGATION.md for a scene:
1. Read the scene JSX fully
2. Find all state variables that represent phases
   (look for: gamePhase, sceneState, currentStep, phase, step, stage)
3. For each phase, search for:
   - useAppVisibility or visibilitychange handlers → tab switch
   - localStorage.getItem resume logic → continue/resume
   - idle timer, setTimeout hint, useVoiceGuidance → idle hints
4. Mark each as EXISTS / MISSING / PARTIAL
5. List specific gaps with line number references
6. Always do Scene 01 (NewModakSceneV7) first as benchmark

---

## Task → Component Map
| Task | Component | Shared? | CSS file? |
|------|-----------|---------|-----------|
| T01 | OpeningModal | YES | OpeningModal.css |
| T02 | SceneCompletionCelebration | YES | TBD |
| T03 | FWKS / new V/O system | TBD | — |
| T04 | SoundToggle | TBD | TBD |
| T05 | HomeButton | YES | TBD |
| T06 | SymbolAutoReveal | YES | TBD |
| T07 | useVoiceGuidance hook | YES | — |
| T08 | useAppVisibility hook | YES | — |
| T09 | useVoiceGuidance hook | YES | — |
| T10 | first-time vs returning logic | TBD | — |
| T11 | OpeningModal.css — one line fix | YES | OpeningModal.css |
| T12 | ZoneCompletionScreen | YES | TBD |
| T13 | ZoneBadge | YES | TBD |
| T14 | new V/O audio files | — | — |
| T15 | new SFX audio files | — | — |
| T16 | new Ambient audio files | — | — |
| T17 | ZoneCompletionModal | YES | TBD |
| T18 | GaneshaGesture | TBD | TBD |
| T19 | image audit — scan only, no component | — | — |
| T20 | CSS audit — clamp() check per scene | — | per scene |
| T21 | test cases — document in TESTCASES.md | — | — |

## Content Generation from JSX — how to do it

When asked to suggest content for any scene:

1. Read the scene JSX file fully
2. Identify the core game mechanic in 1 line
   — what does the child actually DO in this scene?
3. Identify the emotional moment
   — what does the child FEEL when they succeed?
4. Identify the cultural element
   — what Sanskrit word, symbol, or festival moment is at the heart of it?
5. Write a 2–3 line summary in this format:

   MECHANIC: [what the child does]
   EMOTION: [what they feel on success]
   CULTURE: [the cultural/Sanskrit element]

6. Based on that summary suggest:
   - Opening modal description (1–2 sentences, Ganesha first person, 
     clear action, age 5–12)
   - Completion modal subtitle (1 sentence, "we" language, 
     visual and celebratory)
   - Affirmation if missing (2–3 words, "I ..." first person)

7. NEVER change any content file directly
   — present all suggestions for Madhurima to review first
   — only update files after explicit approval

## Example output format

Scene: Pond (PondSceneSimplifiedV4)

MECHANIC: Child taps lotus flowers to make them bloom
EMOTION: Wonder — watching something beautiful come alive because of them
CULTURE: Lotus — Ganesha's symbol of calm and kindness

Suggested opening modal:
"I love this quiet pond. See that golden lotus? 
Tap it gently and watch it bloom just for you!"

Suggested completion modal subtitle:
"We woke the lotus together — and it's beautiful."

Suggested affirmation: "I stay calm."
```

And the Claude Code prompt to kick it all off:
```
Read CLAUDE.md and sceneRegistry.js.
For each of the 22 scenes, read the JSX file.
Write a MECHANIC / EMOTION / CULTURE summary for each scene.
Then suggest opening modal, completion modal, and affirmation content.
Output everything into a new file called CONTENT_SUGGESTIONS.md.
Do not change any existing content files.
Wait for Madhurima's approval before anything is updated.
```

---

## Session-End Protocol (run automatically before ending any work session)

### 1. Update CHANGELOG.md
Run: `git log --oneline -20` and `git diff --stat HEAD~N` (N = commits this session)
Append entry:
```
## [YYYY-MM-DD]
**Touched:** file1.jsx, file2.js
**Changed:** what + why (1-2 lines)
**Open:** anything left incomplete / flagged for next session
```

### 2. Check DECISIONS.md before answering
Before proposing any architecture/logic fix, grep DECISIONS.md for related keywords. If a decision already exists, follow it — don't re-litigate or re-ask.

### 3. Update DECISIONS.md (only for locked architectural/logic calls, not routine fixes)
Format: `[date] - decision - reason - don't revisit unless X changes`

---

## Session-Start Protocol (run automatically BEFORE starting any work)

1. Read TASKS.md — list any tasks not marked complete.
2. Read CHANGELOG.md — pull the "Open" line from the most recent dated entry.
3. Scan DECISIONS.md for any entry tagged `PENDING` (unresolved, needs Madhurima's call).
4. Print a 3-line summary before doing anything else:
   - Pending tasks: ...
   - Left open last session: ...
   - Decisions awaiting confirmation: ...

Do not skip this even for small requests — it's the first output of every session.
