# Ganesha My Bestie — Freeze Checklist (Scene by Scene)
*Final QA pass before freezing scenes*

**Last Updated:** 2026-04-13  
**Purpose:** Verify each scene has all required components before commit.

---

## How to Use This Checklist
1. For each scene, go through all 5 categories
2. Mark [x] if present and working
3. Mark [ ] if missing or broken
4. Mark [~] if partial/needs work
5. Add notes in parentheses
6. When ALL scenes are green, ready to freeze

---

## ZONE 1: Symbol Mountain (Scenes 01–04)

### Scene 01 — Modak (NewModakSceneV7)

**Modal & UI**
- [x] T01 — OpeningModal imported & rendered
- [x] T02 — SceneCompletionCelebration + getCompletionModal working
- [x] T04 — AudioToggle (Sound on/off) wired
- [x] T05 — HomeButton with zone label visible
- [x] T13 — ZoneBadgeButton for zone progress

**Voice & Audio**
- [x] T03 — FWKS (first time V/O) wired
- [x] T09 — useVoiceGuidance hook imported & wired
- [x] T07 — Audio hints simplified (needs emoji position check per NAVIGATION)
- [ ] T10 — First time vs returning user logic (VO off on returning)

**Behavior & Navigation**
- [x] T08 — useAppVisibility hook wired (tab switch pause/resume)
- [x] T06 — SymbolAutoReveal working (no inline overlays)
- [x] T22 — Idle hints on Modak phase (15s timer + visual emoji nudge)
- [x] Tab Switch — pause/resume audio + anim (mooshika found VO bug noted)
- [x] Continue/Resume — phase + progress restored from localStorage
- [x] Completion Modal Button — "Continue" button works

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture mapping (which gesture per phase)
- [x] Sparkles — CalmGoldenFireworks on symbol reveal

**Quality**
- [ ] T19 — Image audit (all PNG/SVG listed)
- [ ] T20 — CSS clamp() check (responsive)
- [ ] T21 — Test cases documented

**Notes:**
- Mooshika found VO continues during tab switch — fix T39-style voiceRef clear
- Need gesture map for intro → success phases

---

### Scene 02 — Pond (PondSceneSimplifiedV4)

**Modal & UI**
- [x] T01 — OpeningModal imported & rendered
- [x] T02 — SceneCompletionCelebration wired
- [x] T04 — AudioToggle wired
- [x] T05 — HomeButton visible
- [x] T13 — ZoneBadgeButton visible

**Voice & Audio**
- [x] T03 — FWKS V/O for intro lotus
- [x] T09 — useVoiceGuidance hook wired
- [x] T07 — Audio hints (idle emoji needs position check)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility wired (tab switch pauses)
- [x] T06 — SymbolAutoReveal (lotus + trunk symbols)
- [x] T22 — Idle hints on first lotus (15s timer)
- [x] Tab Switch — returns to same phase, VO + idle hints restart
- [x] Continue/Resume — phase restored; in-phase reload restarts phase, card reveal restarts card
- [x] Completion Modal Button — working

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture mapping
- [x] Sparkles — WaterSprayArc + FireworksCompletion on success

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

**Notes:**
- Emoji position needs adjustment (per NAVIGATION notes)
- Gesture mapping missing for bloom phases

---

### Scene 03 — Symbol (SymbolMountainSceneV3)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS (eyes symbol intro)
- [x] T09 — useVoiceGuidance
- [x] T07 — Audio hints (emoji position)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [x] T06 — SymbolAutoReveal (eyes symbol)
- [x] T22 — Idle hints on eyes symbol
- [x] Tab Switch — returns to same phase
- [x] Continue/Resume — phase + progress restored
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — FireworksCompletion on success

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 04 — Final Scene (SacredAssemblySceneV8)

**Modal & UI**
- [x] T01 — OpeningModal
- [ ] T02 — SceneCompletionCelebration (check if final scene needs it)
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS V/O (check if present)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Audio hints (should be none — final scene)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal (not applicable — assembly scene)
- [ ] T22 — Idle hints (should be none — final scene)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button → Zone Completion Screen (T12)

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture
- [x] Sparkles — final celebratory fireworks

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

## ZONE 2: Cave of Secrets (Scenes 05–09)

### Scene 05 — Vakratunda Mahakaya (CaveSceneFixedV2)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS V/O (Vakratunda intro)
- [x] T09 — useVoiceGuidance
- [x] T07 — Audio hints (Door 1 idle)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [x] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on Door 1 (15s timer; reset on syllable/stone clicks)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — symbols revealed

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 06 — Suryakoti Samaprabha (SuryakotiSceneV4)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints (first healing sun)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [x] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on first sun (reset on sun + hint btn)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — sun/light effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 07 — Nirvighnam Kurumedeva (NirvighnamSceneV5)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints (first crystal)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [x] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on first crystal (reset on crystal/fog/rock)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — crystal/magic effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 08 — Sarvakaryeshu Sarvada (SarvakaryeshuSarvadaV7)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints (Door 1)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [x] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on Door 1 (reset on char/symbol/helper)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — symbol reveals

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 09 — Final Meaning Scene (Cavescene5memoryfinale)

**Modal & UI**
- [ ] T01 — OpeningModal (check if needed)
- [ ] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS V/O (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints (should be none)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal (not applicable)
- [ ] T22 — Idle hints (not applicable)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button → Zone Completion (T12)

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture
- [x] Sparkles — celebratory effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

## ZONE 3: Shloka River (Scenes 10–14)

### Scene 10 — Vakratunda Grove (VakratundaGroveSimplified)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS V/O (chant intro)
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints (inline in this scene — do NOT duplicate)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal (not applicable — chant scene)
- [x] T22 — Idle hints already inline; do not add useIdleNudge
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — mantra visualization

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

**Notes:**
- Idle hints inline — do NOT add useIdleNudge wrapper

---

### Scene 11 — Suryakoti Bank (SuryakotiBankSimplified)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints on AppSidebar (reset on app + hint btn)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on AppSidebar
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — app interaction effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 12 — Nirvighnam Chant (NirvighnamChantSimplified)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints on AppSidebar
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on AppSidebar (reset on app + hint btn)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — chant effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 13 — Sarvakaryeshu Chant (SarvakaryeshuChantSimplified)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints on AppSidebar
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [x] T22 — Idle hints on AppSidebar (reset on app click)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture map
- [x] Sparkles — chant effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 14 — Shloka River Finale (ShlokaRiverFinale)

**Modal & UI**
- [ ] T01 — OpeningModal (check if needed)
- [ ] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints (should be none)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T22 — Idle hints (not applicable)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button → Zone Completion (T12)

**Ganesha & Sparkles**
- [ ] T18 — Ganesha gesture
- [x] Sparkles — finale celebration

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

## ZONE 4: Festival Square (Scenes 15–18)

### Scene 15 — Piano Game (FestivalPianoGame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints (check if applicable)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal (not applicable)
- [ ] T27 — Idle hints (About Me/Festival Square)
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map (Zones 4–5)
- [x] Sparkles — music effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 16 — Rangoli Game (FestivalRangoliGame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints (check)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T27 — Idle hints
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — color/drawing effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 17 — Modak Cooking (ModakCookingGame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T27 — Idle hints
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — cooking effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 18 — Mandap Decoration (MandapDecorationGame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T27 — Idle hints
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button → Zone Completion (T12)

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — decoration effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

## ZONE 5: About Me Hut (Scenes 19–22)

### Scene 19 — Family Tree (Namebirthdaygame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T27 — Idle hints
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — connection effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

### Scene 20 — Favorite Food (Favoritefoodgame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS V/O (Ganesha food choice intro)
- [x] T09 — useVoiceGuidance
- [x] T07 — Idle hints (Ganesha choice phases)
- [x] T10 — First time vs returning (child phases auto-advance on reload)

**Behavior & Navigation**
- [x] T08 — useAppVisibility (complete with modal+draft restoration)
- [ ] T06 — SymbolAutoReveal (not applicable)
- [x] T27 — Idle hints (Ganesha choice phases only)
- [x] Tab Switch (Ganesha phases restart cleanly; child phases resume with VO)
- [x] Continue/Resume (no popup; Completion Continue goes next scene; mid-scene reload restores modal)
- [x] Completion Modal Button

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — choice celebration effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [x] T21 — Full freeze checklist in NAVIGATION.md (12 test cases)

**Notes (Per NAVIGATION.md):**
- Freeze checklist has 12 items; all must PASS before commit
- Pointer emoji only at Hint 3, then auto-hides
- Modal draft restoration working (food-draw + activity-type)

---

### Scene 21 — Dreams Wishes (ObstacleRemoverGame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [x] T03 — FWKS (intro + wish phases)
- [x] T09 — useVoiceGuidance (with phaseVoiceRef)
- [x] T07 — Idle hints (active + cloud-clearing phases)
- [x] T10 — First time vs returning (intro phases play VO; active phases restart on continue)

**Behavior & Navigation**
- [x] T08 — useAppVisibility (usePauseAwareTimeout + phaseVoiceRef clear)
- [ ] T06 — SymbolAutoReveal (not applicable)
- [x] T27 — Idle hints (getPhaseReminderLine() + 15s timer)
- [x] Tab Switch (pause/resume hooks; phaseVoiceRef clears)
- [x] Continue/Resume (T38+T39 implemented; active phases jump back to intro; hint clears only phase-specific VO key)
- [x] Completion Modal Button → Zone Completion (T12)

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — dream reveal effects (dream-clearing animation)

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [x] T21 — Test cases (dream-intro + dream-drawing restart logic commented; uncomment when finalizing)

**Notes (Per NAVIGATION.md):**
- All phases: intro + wish1/2/3 (intro+active+complete) + dream (drawing+clouded+clearing+revealed) + comparison + ending
- T40 completed: "all-wishes-complete" + "dream-intro" merged; skip intro, go straight to drawing
- T39 fixed: return hint clears only phase-specific VO, allows subsequent VOs

---

### Scene 22 — Name Birthday (Namebirthdaygame)

**Modal & UI**
- [x] T01 — OpeningModal
- [x] T02 — SceneCompletionCelebration
- [x] T04 — AudioToggle
- [x] T05 — HomeButton
- [x] T13 — ZoneBadgeButton

**Voice & Audio**
- [ ] T03 — FWKS (check)
- [x] T09 — useVoiceGuidance
- [ ] T07 — Idle hints (check if applicable)
- [ ] T10 — First time vs returning

**Behavior & Navigation**
- [x] T08 — useAppVisibility
- [ ] T06 — SymbolAutoReveal
- [ ] T27 — Idle hints
- [x] Tab Switch
- [x] Continue/Resume
- [x] Completion Modal Button (last scene — final celebration)

**Ganesha & Sparkles**
- [ ] T28 — Ganesha gesture map
- [x] Sparkles — name celebration effects

**Quality**
- [ ] T19 — Image audit
- [ ] T20 — CSS clamp() check
- [ ] T21 — Test cases

---

## Summary — Status by Category

### Overall Completion
| Category | Count | Status |
|----------|-------|--------|
| Modal & UI (T01/T02/T04/T05/T13) | 22 scenes | ~95% |
| Voice & Audio (T03/T09/T07/T10) | 22 scenes | ~60% |
| Behavior (T08/T06/T22/T27) | 22 scenes | ~85% |
| Navigation (Tab/Resume/Buttons) | 22 scenes | ~90% |
| Ganesha & Sparkles (T18/T28) | 22 scenes | ~20% |
| Quality (T19/T20/T21) | 22 scenes | ~5% |

### Critical Gaps
- **T10** (First time vs returning) — 0/22 scenes ← Do first across all
- **T18 / T28** (Ganesha gesture map) — 0/22 scenes ← Needs mapping doc before building
- **T27** (Idle hints in Zones 4–5) — 0/4 scenes
- **T19 / T20 / T21** (Audits) — 0/22 scenes ← Do after all code frozen

### Ready to Freeze (Green)
- ✅ Scene 01 — Modak (fix mooshika VO + gesture map)
- ✅ Scene 02 — Pond (fix emoji position + gesture map)
- ✅ Scene 20 — Favorite Food (all 12 freeze checks pass)
- ✅ Scene 21 — Dreams Wishes (all phase logic working)

---

## How to Update This File

After each task completion:
1. Read the scene file
2. Update the relevant checkboxes [x] or [ ]
3. Add notes in parentheses if needed
4. Re-tally the Summary section
5. Commit with scene name in message

Before final freeze:
1. All checkboxes must be [x]
2. All notes should be resolved or documented
3. Run full TESTCASES.md manual QA pass
4. Commit with message: "Freeze all 22 scenes for production"
