# SYMBOL MOUNTAIN - PRODUCTION FREEZE CHECKLIST
## Scenes 01-04: Complete Production Readiness Verification

**Last Updated:** 2026-04-17  
**Status:** Ready for Comprehensive Freeze Review  
**Scope:** All 4 Symbol Mountain scenes (Modak, Pond, Symbol, Sacred Assembly)

---

## TABLE OF CONTENTS
1. [Master Gate (All Scenes)](#master-gate)
2. [Scene 01 - Modak](#scene-01---modak)
3. [Scene 02 - Pond](#scene-02---pond)
4. [Scene 03 - Symbol](#scene-03---symbol)
5. [Scene 04 - Sacred Assembly](#scene-04---sacred-assembly-detailed)
6. [Cross-Scene Features](#cross-scene-features)
7. [Final Sign-Off](#final-sign-off)

---

# MASTER GATE

All 4 scenes must pass these core requirements before production freeze.

## MG-1: Shared Chrome (T01-T10, T13, T18-T22)

### Opening Modal (T01)
- [ ] Imported from correct shared path (`../../shared/components/OpeningModal`)
- [ ] Rendered on scene mount (first phase)
- [ ] Baloo 2 title font — no system fonts
- [ ] Nunito description text — correct weight
- [ ] Action button is ≥60px touch target
- [ ] CTA explains mechanic clearly in age 5-12 language
- [ ] Does NOT re-trigger on tab return
- [ ] VO narration syncs to modal text
- [ ] Modal closes cleanly on CTA tap — no lingering overlay
- [ ] Correct zone color scheme applied (Symbol Mountain = #FF5722 primary)

### Completion Celebration (T02)
- [ ] SceneCompletionCelebration imported from correct path
- [ ] Fires exactly on win condition (no early/late trigger)
- [ ] Title and subtitle displayed correctly
- [ ] Affirmation line present and culturally grounded
- [ ] "Continue" button advances to next scene (`scene-complete-continue` or direct navigation)
- [ ] "Replay" button fully resets scene state (localStorage cleared)
- [ ] Confetti/sparkles fire ONCE only — no loop
- [ ] Ganesha presence visible (pose=blessing or appropriate)
- [ ] Modal closes cleanly after button tap — no stuck overlay
- [ ] ProgressManager.updateProgress() called on completion

### Audio Toggle (T04)
- [ ] AudioToggle component renders (usually top-right UI area)
- [ ] Toggle OFF stops ALL VO lines immediately with no stutter
- [ ] Toggle OFF stops ALL SFX (tap, chime, sparkle) immediately
- [ ] Toggle ON resumes VO queue without replay or skip
- [ ] Audio preference persists across tab switch via localStorage
- [ ] Audio preference persists across scene reload
- [ ] Audio preference persists across all 4 Symbol Mountain scenes
- [ ] Visual indicator clear (toggle style changes visually)
- [ ] Muted state indicator visible to child users

### Home Button (T05)
- [ ] HomeButton visible in consistent position (usually top-left)
- [ ] Mid-scene tap opens confirmation dialog
- [ ] "Cancel" returns to scene with no state change
- [ ] "Home" calls ProgressManager.updateProgress() before navigation
- [ ] Navigates safely to home/map screen
- [ ] Button is ≥60px touch target

### Zone Badge (T13)
- [ ] ZoneBadgeButton displays correct zone label (Symbol Mountain)
- [ ] Zone color scheme applied (#FF5722 primary, #FFD700 accent)
- [ ] Badge updates progress bar (1/4 → 2/4 → 3/4 → 4/4)
- [ ] Badge position consistent across all 4 scenes
- [ ] Shows completion checkmark (✓) after zone fully complete

### Voice Guidance (T07 + T09)
- [ ] useVoiceGuidance hook integrated in main component
- [ ] idleTimeout configured (typically 15-20s)
- [ ] resumeDelay set (typically 3000ms)
- [ ] enableMusic set appropriately
- [ ] Return hint VO plays after tab return (after resumeDelay)
- [ ] Idle hint VO plays on inactivity
- [ ] stopVoice() called on scene unmount
- [ ] No stale voice refs after tab switch

### Tab Visibility + Pause (T08)
- [ ] usePauseAwareTimeout hook integrated
- [ ] onHide: stops all VO (stopVoice + stopSpokenVoice)
- [ ] onHide: clears idle hint timers
- [ ] onHide: pauses celebration if showing
- [ ] onShow: resumes celebration
- [ ] onShow: triggers return hint VO after resumeDelay
- [ ] No duplicate timers after tab return
- [ ] No stuck animations (spinning, pulsing) after return

### Gesture Mapping (T18)
- [ ] Ganesha gesture defined per scene phase
- [ ] Blessing pose on completion
- [ ] Pointing/nudging pose during idle hints
- [ ] Wave or celebrate pose on symbol reveal
- [ ] Gesture transitions smoothly (no stutter)
- [ ] Gesture timing aligns with VO/sparkle moments

### Image Audit (T19)
- [ ] Zero 404s in DevTools Network tab
- [ ] Background image correct per scene (no wrong fallback)
- [ ] All symbol icon variants load (colored + gray where applicable)
- [ ] Popup/card images match per-symbol content
- [ ] Side rail icons load correctly
- [ ] Completion modal badge image loads
- [ ] No missing PNG/SVG in any phase

### Responsive Design (T20)
- [ ] Desktop (1280×800): all text readable, no overflow
- [ ] Tablet (768×1024): touch targets all ≥60px, layout adapts
- [ ] Mobile (375×812): cards/modals fit viewport, scrollable if needed
- [ ] clamp() functions used for responsive scaling (no hardcoded px)
- [ ] Font scaling tested at all breakpoints
- [ ] Images scale proportionally (no stretching/squishing)

### Test Cases (T21)
- [ ] Test matrix documented in TESTCASES.md
- [ ] Edge cases logged (rapid tap, tab switch mid-phase, reload timing)
- [ ] All critical paths tested (early phase, mid phase, completion)
- [ ] Cross-browser tested (Chrome, Safari, Firefox if applicable)

### Idle Hints (T22)
- [ ] Idle hint VO triggers after configured delay (15-20s typically)
- [ ] Hint targets correct interactive element per phase
- [ ] Pointer emoji or glow animation visible
- [ ] Hint clears on any user interaction
- [ ] Hint clears on phase transition
- [ ] Hint does NOT re-trigger after cleared in same phase
- [ ] Reload mid-hint clears hint state safely

## MG-2: State Persistence & Resume

### Reload Behavior (All Scenes)
- [ ] Reload in `intro` phase → opening modal shows fresh (no resume popup)
- [ ] Reload in active gameplay phase → safe state restored (no stuck card/modal)
- [ ] Resume countdown displays (typically 3s) if resuming mid-scene
- [ ] Resume countdown does NOT block gameplay
- [ ] All transient UI states cleared on reload (modals, popovers, overlays)
- [ ] Completion state persists (if already won, don't restart)
- [ ] Symbol unlocks persist (side rail shows correct state)
- [ ] localStorage keys correctly namespaced (no cross-scene collision)

### Tab Switch Behavior (All Scenes)
- [ ] Tab switch away: VO stops, timers pause, celebration pauses
- [ ] Tab switch back: completion resumes visually (no jank)
- [ ] Tab switch back: return hint VO plays after resumeDelay
- [ ] No duplicate VO lines after tab return (stale ref cleanup)
- [ ] No duplicate sparkle/animation timers after return
- [ ] Mid-modal tab switch: modal still visible on return
- [ ] Mid-drag/interaction tab switch: can resume safely (no hung state)

---

# SCENE 01 - MODAK (NewModakSceneV7)

## Phase Sequence
```
intro 
  → mooshika-search (find Mooshika in scene)
  → modak-collect (collect modaks into basket)
  → modak-feed (drag modaks from basket to rock)
  → belly-reveal (Ganesha belly shows Modak symbol)
  → symbol-card (flip card shows symbol, affirmation, meaning)
  → completion
```

## S01-A: Visual Assets & Layout

### Background & Main Assets
- [ ] Background image (scene1-background.jpg or similar) loads with no 404
- [ ] Background fills viewport without tiling or stretching
- [ ] Mooshika sprite renders at correct size
- [ ] Modak sprites (multiple instances) render crisply
- [ ] Basket asset appears on-screen when active
- [ ] Rock asset positioned correctly
- [ ] Ganesha belly area visually aligns with reveal moment
- [ ] All assets use Symbol Mountain color scheme (#FF5722 accents)

### Symbol Card UI
- [ ] Card appears with smooth animation (scale/fade)
- [ ] Card front shows symbol icon (Modak)
- [ ] Card back shows "Modak" text + association ("Ganesha's favorite sweet")
- [ ] Card affirmation line ("I enjoy sweet moments") renders
- [ ] Card close/dismiss button is ≥60px
- [ ] Card flies to sidebar smoothly on completion (no jump)
- [ ] Card lands in sidebar icon position
- [ ] Sidebar icon highlights when new symbol unlocked

### Sparkle/Fireworks
- [ ] Sparkles appear on modak tap (collection)
- [ ] Sparkles appear on correct drop (basket → rock)
- [ ] Fireworks trigger on symbol reveal (belly)
- [ ] Fireworks trigger on card completion (move to sidebar)
- [ ] Sparkles/fireworks render ABOVE all game elements (z-index)
- [ ] No clipping at viewport edges
- [ ] Animation duration is satisfying (not too fast/slow)

## S01-B: Game Mechanics

### Mooshika Discovery
- [ ] Mooshika tap (or click) registers as interaction
- [ ] Discovery triggers phase transition to modak-collect
- [ ] Discovery VO plays ("I love modaks...")
- [ ] Visual feedback (glow, bounce) on Mooshika

### Modak Collection
- [ ] Modak tap increments collection counter
- [ ] Counter updates visually (1/5, 2/5, etc. or similar)
- [ ] Basket visual updates (modaks appear in basket)
- [ ] Collection continues until threshold reached
- [ ] Reaching threshold auto-advances to modak-feed phase

### Modak Feed Mechanic
- [ ] Drag from basket to rock hitbox detects correctly
- [ ] Correct drop triggers sparkle + celebration
- [ ] Wrong drop (off target) returns modak to basket with gentle feedback
- [ ] Drop counter increments per successful feed
- [ ] Feed threshold triggers belly reveal phase

### Belly Reveal
- [ ] Ganesha belly visually changes (opens, glows, reveals symbol)
- [ ] Symbol icon (Modak) displays on belly
- [ ] Completion VO plays ("Look! The Modak symbol...")
- [ ] Transition to symbol-card phase is smooth

### Symbol Card Flow
- [ ] Card appears with flip animation
- [ ] Card content (name, meaning, affirmation) displays correctly
- [ ] Card can be flipped between front/back (if interaction enabled)
- [ ] Card tap-to-fly works (flies to sidebar)
- [ ] Sidebar icon locked/unlocked state updates
- [ ] Completion modal triggers after card settles

## S01-C: Voice & Hints

### VO Triggers
- [ ] Intro VO ("Modak is my favorite sweet...") plays once on scene enter
- [ ] Mooshika discovery VO plays once ("I love modaks...")
- [ ] Collection phase encouragement VO plays ("Collect more modaks...")
- [ ] Feed phase instruction VO plays ("Feed me the modaks...")
- [ ] Belly reveal celebration VO plays ("The Modak symbol is unlocked...")
- [ ] Completion VO plays on card completion
- [ ] No VO lines duplicate after tab switch/reload
- [ ] All VO uses age 5-12 friendly language

### Idle Hints
- [ ] Idle hint triggers after 15s+ inactivity in active phase
- [ ] Hint targets correct object (Mooshika, modak, basket, rock per phase)
- [ ] Hint visual (glow, pointer, wobble) is clear
- [ ] Hint VO is encouraging ("Try tapping the modak...")
- [ ] Hint clears on any user interaction
- [ ] No hint re-trigger in same phase after cleared

### Return Hint
- [ ] Tab return: return hint VO plays after 3s resume delay
- [ ] Return hint contextual ("You were collecting modaks...")
- [ ] Return hint does NOT re-trigger mid-phase

## S01-D: Reload & Resume

### Reload in Each Phase
- [ ] Reload in mooshika-search → Mooshika still findable, phase restarts
- [ ] Reload in modak-collect (5/5 collected) → counter preserved, ready to feed
- [ ] Reload in modak-feed (2/3 fed) → fed count preserved, continue feeding
- [ ] Reload in belly-reveal → reveals still showing, card ready
- [ ] Reload in symbol-card (before move to sidebar) → card still in place
- [ ] Reload after completion → completion state persists (no restart)

### Resume Countdown
- [ ] Shows "Resuming in 3..." for active phases
- [ ] Auto-advances after countdown expires
- [ ] Does not block gameplay during countdown
- [ ] Countdown does NOT appear on fresh intro

---

# SCENE 02 - POND (PondSceneSimplifiedV4)

## Phase Sequence
```
intro
  → lotus-waiting (lotus flowers wait to bloom)
  → lotus-bloom (tap to bloom each lotus)
  → golden-lotus (optional: special golden lotus interaction)
  → trunk-reveal (elephant trunk reveals symbol)
  → symbol-card (flip card reveals symbol meaning)
  → completion
```

## S02-A: Visual Assets & Layout

### Background & Main Assets
- [ ] Background image (pond scene) loads with no 404
- [ ] Lotus flowers render at correct positions (grid or scattered)
- [ ] Lotus closed/bloomed states both visible and animate smoothly
- [ ] Golden lotus (if used) visually distinct from regular lotus
- [ ] Elephant/trunk asset positioned correctly
- [ ] Water/ripple effects visible (if animated)
- [ ] All colors match Calm theme (soft greens, blues, Symbol Mountain accents)

### Lotus Bloom Animation
- [ ] Lotus closed state (bud, folded petals)
- [ ] Lotus bloom state (open petals, golden center)
- [ ] Transition animation smooth (0.5-1s duration)
- [ ] Bloom sparkle/glow effect visible
- [ ] Audio feedback (soft chime or water sound) on bloom

### Trunk Reveal & Symbol Card
- [ ] Trunk emerges from water smoothly
- [ ] Symbol card appears after trunk reveal
- [ ] Card visuals correct (Lotus symbol, meaning, affirmation)
- [ ] Card flies to sidebar on completion
- [ ] Sidebar icon updates (Lotus unlocked)

## S02-B: Game Mechanics

### Lotus Tap Mechanics
- [ ] Lotus tap registers reliably (hitbox correct)
- [ ] Tap triggers bloom animation
- [ ] Already-bloomed lotus cannot be re-tapped (locked state)
- [ ] Bloom counter increments
- [ ] Visual feedback (sparkle/glow) on tap

### Progression Requirements
- [ ] All lotus blooms required before trunk reveal
- [ ] Lotus order does NOT matter (can bloom any lotus)
- [ ] Golden lotus (if any) counted toward threshold
- [ ] Reaching threshold auto-triggers trunk reveal

### Trunk Reveal & Completion
- [ ] Trunk emerges after threshold reached
- [ ] Trunk reveal VO plays ("The trunk appears...")
- [ ] Symbol card appears (auto or on trunk tap)
- [ ] Card displays Lotus symbol + meaning + affirmation
- [ ] Card move to sidebar triggers completion modal

## S02-C: Voice & Hints

### VO Triggers
- [ ] Intro VO ("This pond is calm and beautiful...")
- [ ] Bloom encouragement VO ("Tap the lotus to make it bloom...")
- [ ] All-bloomed transition VO ("The lotus is so beautiful...")
- [ ] Trunk reveal VO ("Look! The trunk brings the symbol...")
- [ ] Completion VO on card move to sidebar
- [ ] No duplicate VO after tab switch

### Idle Hints
- [ ] Idle hint triggers after 15s+ in bloom phase
- [ ] Hint targets unblocked lotus
- [ ] Hint VO ("Try tapping this lotus...")
- [ ] Hint visual (glow/pointer) clear and non-blocking
- [ ] Hint clears on tap

## S02-D: Reload & Resume

### Reload Scenarios
- [ ] Reload in intro → opening modal shows fresh
- [ ] Reload in lotus-bloom (3/5 bloomed) → bloom count preserved, continue
- [ ] Reload after trunk-reveal → trunk still visible
- [ ] Reload during symbol-card → card still visible
- [ ] Reload after completion → completion state persists

---

# SCENE 03 - SYMBOL (SymbolMountainSceneV3)

## Phase Sequence
```
intro
  → eyes-game (telescope/sight interaction)
  → ears-game (rhythm/listening interaction)
  → tusk-game (assembly/construction interaction)
  → all-complete (all 3 sub-games done)
  → completion
```

## S03-A: Visual Assets & Layout

### Eyes Game Visuals
- [ ] Telescope/viewing asset renders correctly
- [ ] Symbol preview (eyes) visible through telescope
- [ ] Focus/zoom animation on interaction
- [ ] Reveal card appears after eyes unlock
- [ ] Card flies to sidebar smoothly

### Ears Game Visuals
- [ ] Musical notes/instruments render
- [ ] Rhythm pattern visual (if shown) correct
- [ ] Audio visualizer or animation plays with music
- [ ] Ear symbol displays on unlock
- [ ] Reveal card appears and moves to sidebar

### Tusk Game Visuals
- [ ] Assembly puzzle pieces visible and draggable
- [ ] Tusk shape visual updates as pieces placed
- [ ] Completed tusk renders with glow/celebration
- [ ] Reveal card triggers

### Progress & Sidebar
- [ ] Progress indicator (3 sub-games) visible
- [ ] Sidebar shows symbols as they unlock
- [ ] Icon states (locked/unlocked) update correctly
- [ ] Completion badge appears when all 3 done

## S03-B: Game Mechanics

### Eyes Game
- [ ] Tap/click telescope interaction registers
- [ ] Telescope opens/zooms smoothly
- [ ] Eyes symbol preview shown
- [ ] Interaction threshold met → symbol unlocks
- [ ] SymbolAutoReveal card appears
- [ ] Card move to sidebar auto-advances to ears game

### Ears Game
- [ ] Musical notes or rhythm pattern plays
- [ ] Child interaction (tap/hold notes OR listen to pattern) works
- [ ] Correct interaction triggers celebration
- [ ] Wrong interaction gives gentle feedback (retry allowed)
- [ ] Completion threshold (e.g., 3 correct notes) triggers unlock
- [ ] Ears symbol unlocks + card appears → sidebar
- [ ] Auto-advances to tusk game

### Tusk Game
- [ ] Tusk puzzle pieces visible and draggable
- [ ] Drag mechanics work (correct hitbox, smooth animation)
- [ ] Drop zone detects correct placement
- [ ] Wrong placement allows retry (piece returns to start)
- [ ] Correct placement locks piece
- [ ] Progress bar/visual updates (3/3 pieces placed)
- [ ] All pieces placed → tusk complete with celebration
- [ ] Tusk symbol unlocks + card appears → sidebar

### All-Complete Transition
- [ ] After all 3 games done, final celebration triggers
- [ ] Fireworks appear
- [ ] Completion modal appears
- [ ] All 3 symbols visible in sidebar

## S03-C: Voice & Hints

### Per-Phase VO
- [ ] Eyes game entry VO ("Look through the telescope...")
- [ ] Eyes unlock VO ("The eyes symbol is revealed...")
- [ ] Ears game entry VO ("Listen to the rhythm...")
- [ ] Ears unlock VO ("The ears symbol is revealed...")
- [ ] Tusk game entry VO ("Assemble the tusk...")
- [ ] Tusk unlock VO ("The tusk symbol is revealed...")
- [ ] All-complete VO ("All three symbols are together...")
- [ ] No duplicate VO after reload/tab switch

### Idle Hints
- [ ] Eyes game: hint targets telescope (glow/pointer)
- [ ] Ears game: hint hints at rhythm/interaction point
- [ ] Tusk game: hint shows assembly area or next piece
- [ ] All hints contextual to sub-game phase
- [ ] Clear on interaction

## S03-D: Reload & Resume

### Reload Safety
- [ ] Reload in eyes-game (unlocked) → eyes still unlocked, eyes card gone
- [ ] Reload in ears-game (mid-rhythm) → rhythm phase resets (safe)
- [ ] Reload in tusk-game (1/3 pieces) → piece count preserved
- [ ] Reload after all-complete → all 3 symbols persist in sidebar
- [ ] Reload after completion → completion state persists

---

# SCENE 04 - SACRED ASSEMBLY (SacredAssemblySceneV8) [DETAILED]

**This is the most complex Symbol Mountain scene. All mechanics must be rock-solid.**

## Phase Sequence
```
intro
  → round-start (card appears, lands on side)
  → card-play (card flips, guide arrow appears, child taps symbol)
  → round-feedback (celebration or retry)
  → [repeat for all 8 symbols]
  → round-8-complete (all symbols placed)
  → completion
```

## S04-A: Visual Layout & Assembly Canvas

### Sacred Background & Canvas
- [ ] Sacred Assembly background loads with no 404
- [ ] Ganesha silhouette/base rendered correctly
- [ ] All 8 symbol drop zones (head, neck, arms, torso, legs) visible
- [ ] Drop zones have subtle visual guides (color, glow, or outline)
- [ ] Drop zone hitboxes are generous (easy to hit on mobile)
- [ ] Progress bar/counter visible ("1/8", "2/8", etc.)
- [ ] Symbol count updates as each is placed

### Card Position & Movement

#### Card Appearance Phase
- [ ] Card appears on-screen with entrance animation (scale + fade)
- [ ] Card lands in card-slot position (left side, typically)
- [ ] No jump or jank in appearance
- [ ] Card is always visible (no clipping behind other elements)

#### Card Flipped State (Play Phase)
- [ ] Card flips to show symbol (left to right, smooth rotation)
- [ ] After flip, card content visible: symbol name + association text
- [ ] Association text is age 5-12 friendly ("Head = thinking part")
- [ ] Card remains in card-slot after flip (does NOT move yet)
- [ ] Guide arrow appears pointing FROM card TOWARD Ganesha assembly area
- [ ] Arrow color matches card/zone color

#### Card Side Movement (Transition to Next Round)
- [ ] After round completes (correct placement + celebration)
- [ ] Card slides LEFT off-screen smoothly (no jump, duration ~0.5s)
- [ ] Off-screen card does NOT linger or block new card
- [ ] New card appears on-screen and repeats sequence
- [ ] Card movement NEVER clips into other UI (sidebar, buttons)
- [ ] Mobile: card movement respects viewport width (no off-screen clipping)

### Sidebar & Symbol Display
- [ ] Sidebar shows all 8 symbol icons in a vertical rail
- [ ] Icons display correctly (correct color, not stretched)
- [ ] As symbols are placed, sidebar icons light up/glow
- [ ] Locked symbols (not yet placed) have muted appearance
- [ ] Unlocked symbols have full color + glow

## S04-B: Card Lifecycle (Critical)

### Card Content Mapping
- [ ] Card 1: Head symbol + "The head helps me think"
- [ ] Card 2: Neck symbol + "The neck connects..."
- [ ] Card 3: Right arm symbol + "The right arm..."
- [ ] Card 4: Left arm symbol + "The left arm..."
- [ ] Card 5: Torso symbol + "The belly holds..."
- [ ] Card 6: Right leg symbol + "The right leg..."
- [ ] Card 7: Left leg symbol + "The left leg..."
- [ ] Card 8: Final symbol + "All together, we are whole"
- [ ] All text is CORRECT (not swapped or wrong symbol)
- [ ] Font sizes readable on mobile (clamp() used)

### Card State Recovery (Reload/Tab Switch)
- [ ] Reload mid-card-appear → card re-appears and animates
- [ ] Reload mid-flip → card in flipped state when reloading
- [ ] Reload mid-play (arrow showing) → arrow + card state preserved
- [ ] Reload after placement (card sliding) → card completes slide or restarts
- [ ] Reload during celebration → celebration resumes or new round starts safely
- [ ] Tab switch mid-card → card state preserved (appears same on return)
- [ ] Tab switch during guide arrow → arrow reappears after resume delay
- [ ] No card duplication or ghost cards after reload/tab switch

## S04-C: Symbol Tap/Placement Mechanics (Critical)

### Symbol Selection (Play Phase)
- [ ] Symbol icon (on card or separate UI) is tappable (≥60px target)
- [ ] Tap registers correctly (no double-tap needed)
- [ ] Visual feedback on tap (glow, scale, highlight)
- [ ] Tapping wrong symbol (not current card symbol) does nothing
- [ ] Tapping already-placed symbol does nothing

### Zone Detection & Drop
- [ ] Tapping symbol puts child in "placement mode"
- [ ] Cursor/touch shows symbol icon or visual indicator
- [ ] Guide arrow appears (if not already showing)
- [ ] Tapping correct zone places symbol
- [ ] Correct zone visual updates (symbol appears in zone, zone locks)
- [ ] Sparkle/celebration plays on correct placement
- [ ] Round advances immediately after correct placement

### Wrong Zone Handling
- [ ] Tapping wrong zone gives gentle feedback (shake, sound, or brief red flash)
- [ ] Wrong zone does NOT place symbol
- [ ] Wrong zone does NOT lock
- [ ] After wrong tap, child can retry immediately (no delay)
- [ ] Up to X wrong attempts allowed before idle hint (if configured)
- [ ] Wrong attempt does NOT trigger completion modal or end round

### Already-Placed Zone Protection
- [ ] Tapping zone with already-placed symbol does nothing
- [ ] No error message, no stutter, no state change
- [ ] Zone is visually locked (appears grayed out or with checkmark)

## S04-D: Round Flow & Completion

### Round Sequence
- [ ] Card appears (round N of 8)
- [ ] Card shows correct symbol + association text
- [ ] Guide arrow appears
- [ ] Child taps correct zone
- [ ] Placement triggers celebration (sparkle + brief VO)
- [ ] Card slides off-screen
- [ ] New card appears (round N+1)
- [ ] Pattern repeats through round 8

### Round 8 Completion
- [ ] After 8th correct placement, special celebration triggers (larger fireworks)
- [ ] Completion modal appears
- [ ] Modal shows "All 8 symbols placed!" or similar
- [ ] Progress bar shows 8/8
- [ ] All symbol zones show placed symbols

### No Duplication/Skipping
- [ ] Symbol queue has exactly 8 items (no duplicates)
- [ ] Rounds occur in order (no skip from round 3 to 5)
- [ ] Placement is 1:1 with zones (8 placements = 8 zones filled)
- [ ] No round repeats ("Round 1 is asked twice")

### Completion Modal
- [ ] Appears after 8/8 symbols placed
- [ ] Shows zone badge image (if applicable)
- [ ] Shows "Continue" button (proceeds to next scene)
- [ ] Shows "Replay" button (resets and replays)
- [ ] ProgressManager.updateProgress() called
- [ ] Continue navigates to correct next scene

## S04-E: Voice & Guidance

### Onboarding VO
- [ ] Opening modal VO plays once ("Welcome to the Sacred Assembly...")
- [ ] Intro VO before first round ("Let's place each symbol...") plays once per session
- [ ] Does NOT replay on reload within session (check localStorage key)

### Per-Card VO
- [ ] Card 1 VO ("The head is where I think...") plays as card flips
- [ ] Card 2-7 VO mapping correct (not swapped)
- [ ] Card 8 VO ("All together, we are complete...") plays
- [ ] VO timing: plays AFTER card lands on side (not before flip)
- [ ] VO duration does NOT exceed card-play phase (child can interact during VO if designed)

### Idle Hint VO
- [ ] Trigger: 15s+ inactivity in play phase (card showing, arrow visible)
- [ ] Hint VO: ("Try tapping the symbol and then the [zone]...")
- [ ] Hint VO contextual to current round symbol
- [ ] Hint VO triggers ONCE per round (not repeatedly)
- [ ] Clear on any user interaction (tap symbol or zone)
- [ ] Hint does NOT trigger if child just interacted

### Return Hint VO
- [ ] Tab return: after 3s resume delay, return hint plays
- [ ] Return hint: ("You were placing the [symbol name]...")
- [ ] Return hint contextual to current round
- [ ] Does NOT replay if child was already in same round

## S04-F: Idle Hints & Gesture Feedback

### Visual Idle Hints
- [ ] Idle level 1 (after 5s): Ganesha or current zone glows/pulses
- [ ] Idle level 2 (after 10s): Pointer emoji appears near target zone
- [ ] Idle level 3 (after 15s): Guide arrow thickens/brightens as nudge
- [ ] All hints clear on interaction (symbol tap or zone tap)
- [ ] No hint persists after round completes

### Ganesha Gestures Per Round
- [ ] Round start: Ganesha waves or smiles (welcoming pose)
- [ ] Round play (arrow showing): Ganesha points toward zone (gesture matches arrow direction)
- [ ] Correct placement: Ganesha celebrates (arms up, spin, or joy pose)
- [ ] Wrong placement: Ganesha shakes gently (no harsh judgment)
- [ ] Round 8 correct: Ganesha full celebration (spin + arms + joy)
- [ ] All gesture transitions smooth (no jerky pose changes)

### Sparkle/Celebration Timing
- [ ] Correct placement: sparkle appears at zone
- [ ] Sparkle duration ~1s (visible but not too long)
- [ ] Sparkle does NOT block new round (card slides while sparkle plays)
- [ ] Round 8: larger fireworks across entire screen
- [ ] Fireworks render ABOVE all UI (correct z-index)

## S04-G: State Persistence & Reload

### localStorage Keys
- [ ] Key: `sacred-assembly-session-[sessionId]-round` (current round)
- [ ] Key: `sacred-assembly-session-[sessionId]-placedZones` (array of placed zone IDs)
- [ ] Key: `sacred-assembly-session-[sessionId]-card-state` (card phase: appear/flip/play/slide)
- [ ] Keys namespaced to avoid cross-scene collision
- [ ] Keys cleared on completion

### Reload Scenarios

#### Reload in Round 1 (Card Appearing)
- [ ] Card re-appears and animates
- [ ] Round counter shows "1/8"
- [ ] No placed symbols shown (placedZones empty)
- [ ] Safe to continue from round 1

#### Reload in Round 3 (Mid-Play)
- [ ] Round counter shows "3/8"
- [ ] Zones 1-2 show placed symbols
- [ ] Card 3 appears (flipped, arrow visible)
- [ ] Guide arrow pointing to correct zone
- [ ] Child can tap symbol and complete round 3

#### Reload in Round 5 (Card Sliding)
- [ ] Round counter shows "5/8"
- [ ] Zones 1-4 show placed symbols
- [ ] Card 5 either completes slide or restarts (graceful recovery)
- [ ] Auto-advances to round 6 after card settles

#### Reload After Round 8 (In Completion Modal)
- [ ] Modal still visible
- [ ] All 8 symbols placed and visible
- [ ] Progress bar shows 8/8
- [ ] Continue/Replay buttons functional
- [ ] No restart

#### Reload After Completion Exit
- [ ] Scene persists completion state
- [ ] Completion modal appears (or auto-navigates)
- [ ] All progress saved to permanent storage (GameStateManager)

### Tab Switch Scenarios

#### Tab Switch in Round 2 (Arrow Showing)
- [ ] Tab away: VO stops, timers pause, card frozen
- [ ] Tab back (3s later): completion resumes visually
- [ ] Return hint VO plays ("You were placing round 2...")
- [ ] Guide arrow re-appears
- [ ] Child can complete round 2
- [ ] No duplicate timers

#### Tab Switch During Celebration
- [ ] Tab away: sparkle animation pauses
- [ ] Tab back: sparkle resumes
- [ ] Card slide resumes smoothly
- [ ] New round appears
- [ ] No card duplication

#### Tab Switch in Round 8 (Final Placement)
- [ ] Tab away: celebration pauses
- [ ] Tab back: fireworks resume
- [ ] Completion modal appears
- [ ] Safe navigation to next scene

## S04-H: Edge Cases & Safety

### Rapid Tapping
- [ ] Double-tap symbol: recognized as single tap (no duplicate placement)
- [ ] Tap multiple zones in succession: only first correct tap registers
- [ ] Tap wrong zone then correct zone: wrong zone ignored, correct zone registers
- [ ] Tap symbol multiple times: only first tap counts (symbol "locks" after tap)

### Drag-Like Interactions (if applicable)
- [ ] Drag symbol to zone: registers as tap at drop location
- [ ] Drag off-screen: symbol returns to start (safe)
- [ ] Drag while mid-animation: waits for animation to complete, then accepts tap

### Modal Interruptions
- [ ] Confirmation dialog appears if Home button tapped mid-round
- [ ] "Cancel" resumes round safely (no state loss)
- [ ] "Home" saves progress and navigates away

### Network/Latency
- [ ] No "hung" state if network slow (UX remains responsive)
- [ ] Placement confirmation sent to backend (if applicable) with retry logic
- [ ] Symbol remains placed even if backend lag (optimistic update)

---

# CROSS-SCENE FEATURES

## Symbol Sidebar Popup System

### Sidebar Icon Behavior
- [ ] Sidebar displays all 8 symbols (vertical rail, right or left side)
- [ ] Locked symbols appear muted/grayed out
- [ ] Unlocked symbols appear bright + glow
- [ ] Newly unlocked symbols highlight/pulse briefly
- [ ] Icon size consistent across all scenes

### Popup Interaction (All Scenes)
- [ ] Tap unlocked symbol icon → popup overlay appears
- [ ] Popup shows symbol name (e.g., "Modak")
- [ ] Popup shows symbol meaning/association (e.g., "Symbol of sweetness and devotion")
- [ ] Popup shows "Close" button (clear, ≥60px)
- [ ] Close button returns to gameplay (no state loss)
- [ ] Popup does NOT pause current phase (child can close and continue)
- [ ] Popup z-index correct (above gameplay, below alerts)

### Popup Content Accuracy
- [ ] Symbol 1: Modak — Correct image + meaning
- [ ] Symbol 2: Lotus — Correct image + meaning
- [ ] Symbol 3: Eyes — Correct image + meaning
- [ ] Symbol 4: Ears — Correct image + meaning
- [ ] Symbol 5: Tusk — Correct image + meaning
- [ ] Symbol 6: Trunk — Correct image + meaning
- [ ] Symbol 7: Mouse (Mooshika) — Correct image + meaning
- [ ] Symbol 8: Pot/Modak (variant) — Correct image + meaning
- [ ] All meanings culturally accurate + age-appropriate

### Sidebar Persistence
- [ ] Unlocked state persists across scenes
- [ ] Unlocked state persists across reload
- [ ] Symbol progression order respected (Scene 1 unlocks Modak, etc.)

---

# FINAL SIGN-OFF

## FS-1: Complete Test Matrix

### Desktop Testing (1280×800)
- [ ] Scene 01 (Modak): Full playthrough, all phases
- [ ] Scene 02 (Pond): Full playthrough, all lotus bloomed
- [ ] Scene 03 (Symbol): All 3 sub-games completed
- [ ] Scene 04 (Sacred Assembly): All 8 rounds completed
- [ ] All 4 scenes with Audio ON
- [ ] All 4 scenes with Audio OFF
- [ ] Tab switch tested in early/mid/late phase of each scene
- [ ] Mid-scene reload tested at least 2x per scene (different phases)
- [ ] DevTools Console: Zero blocking errors or red logs
- [ ] DevTools Network: Zero 404 assets, all images load

### Mobile Testing (375×812)
- [ ] Scene 01-04: Layout responsive (no overflow, readable text)
- [ ] All tap targets ≥60px on mobile (test on actual device if possible)
- [ ] Touch interactions responsive (no lag > 100ms)
- [ ] Card/popup positioning correct on small screen
- [ ] Sidebar accessible on mobile (scroll if needed)
- [ ] Font scaling appropriate (clamp() functions working)

### Tablet Testing (768×1024)
- [ ] Intermediate viewport testing (landscape + portrait)
- [ ] Touch targets sized appropriately
- [ ] Sidebar and main UI layout adapt smoothly

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (iOS + macOS if possible)
- [ ] Firefox (if applicable)
- [ ] All animations smooth, no jank

### Audio & VO Verification
- [ ] All VO files (.mp3) load correctly (no 404)
- [ ] VO timing syncs with animations
- [ ] All SFX (tap, sparkle, chime) trigger at correct moments
- [ ] Audio toggle mutes/unmutes all sounds
- [ ] Audio preference persists across reload

### Accessibility (Optional but Recommended)
- [ ] Color contrast meets WCAG AA standards (Symbol Mountain #FF5722 + #FFD700)
- [ ] Text alternatives provided for non-text content (alt text on images)
- [ ] Keyboard navigation functional (Tab through interactive elements)
- [ ] Touch targets large enough for young children (≥60px confirmed)

## FS-2: Production Readiness Checklist

### Code Quality
- [ ] No TypeScript errors in any scene file
- [ ] No eslint warnings that block deployment
- [ ] All imports reference correct shared paths
- [ ] No hardcoded URLs or environment-specific values
- [ ] LocalStorage keys properly namespaced

### Performance
- [ ] Scene load time < 2 seconds (on 3G)
- [ ] Animations smooth (60 FPS target, no dropped frames)
- [ ] No memory leaks on tab switch or reload (DevTools Memory check)
- [ ] Asset files optimized (images compressed, no oversized PNG)

### Documentation
- [ ] Scene phase diagram documented (ascii or markdown)
- [ ] VO mapping documented (which VO line plays at which phase)
- [ ] localStorage key schema documented
- [ ] Idle hint timing documented (15s for S01-04)
- [ ] Asset paths documented (background, symbols, popups)

### Compliance
- [ ] No copyrighted content (all assets proprietary or licensed)
- [ ] All Sanskrit text reviewed for cultural accuracy
- [ ] All content reviewed for age-appropriateness (5-12 years)
- [ ] No ads, tracking, or third-party scripts (unless explicitly allowed)

## FS-3: QA Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| **QA Tester** | | | |
| **Senior UI/UX Reviewer** | | | |
| **Scene Owner / Madhurima** | | | |

---

## FS-4: Deployment Checklist

- [ ] All critical blockers (Red items) resolved
- [ ] All test cases passed
- [ ] All 3 sign-offs obtained
- [ ] Release notes prepared (if applicable)
- [ ] Rollback plan documented (if applicable)
- [ ] Deployment scheduled (date/time)
- [ ] Post-deployment smoke test plan ready

---

## Notes & Known Issues

### Known Limitations (Document if any)
- [ ] Scene 03 rhythm game: if rhythm is difficult for young children, consider adding visual beat indicator
- [ ] Scene 04: if card-slide sometimes jerky on older mobile devices, consider reducing duration

### Future Enhancements (Post-Freeze)
- [ ] Symbol Sidebar: add detailed symbol encyclopedia entries
- [ ] Idle Hints: add more granular levels (wobble → glow → VO → sparkle → voice)
- [ ] Gesture System: expand Ganesha pose library with T28 implementation
- [ ] VO: consider pre-recorded MP3s (T14) instead of TTS for production polish

---

**End of Symbol Mountain Production Freeze Checklist**
