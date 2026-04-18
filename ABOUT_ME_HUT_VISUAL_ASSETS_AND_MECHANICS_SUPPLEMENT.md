# ABOUT ME HUT - VISUAL ASSETS & MECHANICS FREEZE SUPPLEMENT
## Add these checks to your main Scene Freeze Checklist

Purpose: Comprehensive freeze checklist for About Me Hut scenes so QA can print, tick, and sign off with minimal regression risk.

Scenes covered:
- Scene A1: Family Tree (`family-tree`)
- Scene A2: Favorite Food (`favorite-food`)
- Scene A3: Dreams & Wishes / Obstacle Remover (`dreams-wishes`)
- Scene A4: My Indian Story (`my-indian-story`)

---

## COMMON CHECKS FOR ALL ABOUT ME HUT SCENES

### 1) VISUAL ASSET INTEGRITY

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Background image loads correctly (no broken image icon) | | |
| | All interactive PNG/SVG/JPG assets load with zero 404 in DevTools Network | | |
| | Opening modal image and completion modal icons render correctly | | |
| | No stretched, pixelated, or wrongly cropped assets on desktop and mobile | | |
| | Hover/tap states use correct asset variant if designed (normal/selected/correct) | | |

### 2) AUDIO, VOICEOVER, AND TAP-TRIGGER BEHAVIOR

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Voice line triggers on scene start intro as expected | | |
| | Voice line triggers on correct tap/choice at right moment (no missing trigger) | | |
| | Voice line triggers on wrong tap/choice where expected | | |
| | No overlapping voice lines (old voice stops or queues correctly) | | |
| | Audio toggle ON/OFF works immediately and persists correctly | | |
| | FX sounds (tap/chime/sparkle) are balanced and not clipping | | |

### 3) TAB SWITCH, PAUSE/RESUME, AND RELOAD SAFETY

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Switching browser tab away and back does not break gameplay state | | |
| | Resume countdown/popup appears where implemented and then clears | | |
| | Idle hints reset correctly after return from tab switch | | |
| | No duplicate VO replay spam after tab return | | |
| | Reload mid-scene restores safe phase (no stuck modal/overlay) | | |
| | Reload does not duplicate sparkles, timers, or voice timers | | |

### 4) UI/UX QUALITY BAR (SENIOR UI/UX REVIEW)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tap targets are child-friendly size (no overly tiny hitboxes) | | |
| | Correct option emphasis is visible (glow, wobble, sparkle, pointer) | | |
| | Wrong option feedback is clear but not harsh | | |
| | Text contrast is readable over backgrounds in all phases | | |
| | Overlay z-index order is correct (modal > overlay > gameplay) | | |
| | No accidental hidden UI behind fullscreen elements | | |
| | Progress headers, badges, and counters are visually consistent | | |

### 5) SYMBOL SIDEBAR EXPECTATION (ABOUT ME HUT)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | SymbolSidebar should NOT unexpectedly appear in About Me Hut scenes | | |
| | Completion icons in scene completion modal are correct and clickable behavior is safe | | |

---

## SCENE A1 - FAMILY TREE (`family-tree`)

### A1.1 Visual and Asset Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Family tree background and deity/member images load correctly | | |
| | Empty circle, placed deity, and sparkle visuals all render correctly | | |
| | Fun-fact modal card visuals and flip card styling are correct | | |
| | Child family avatars and tray visuals do not overflow/crop badly | | |

### A1.2 Core Mechanics Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Circle tap opens choice modal for unplaced slots | | |
| | Already placed circle tap opens info/fun-fact behavior correctly | | |
| | Correct deity choice places member in correct slot | | |
| | Wrong deity choice feedback appears and user can retry | | |
| | Sequence lock/block states prevent accidental double actions | | |
| | Transition to child input phase triggers at right completion point | | |
| | Side-by-side/finale phase appears only after intended conditions | | |

### A1.3 Glow, Idle Hint, and Sparkle Checks (Important)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Empty circle hint glow appears in active tree phase | | |
| | Choice modal idle progression works: wobble -> glow -> VO clue -> sparkle | | |
| | Correct answer option receives idle glow/sparkle classes when idle | | |
| | Just-placed glow triggers once and settles cleanly | | |
| | Tree sparkle layer appears and clears without persistence bugs | | |

### A1.4 Voice and Input Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Welcome VO plays in intro modal as designed | | |
| | Tap-circle hint VO triggers in tree phase | | |
| | Info/fun-fact VO maps correctly per selected member | | |
| | Recording UI (if used for name input) starts/stops safely | | |
| | Closing modals/cards stops active VO cleanly | | |

---

## SCENE A2 - FAVORITE FOOD (`favorite-food`)

### A2.1 Visual and Asset Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | All choice cards load for food/color/activity/friend steps | | |
| | Child draw/write tools and input panels render correctly | | |
| | Comparison card images and layout are aligned | | |
| | Completion modal icons map to discovered items correctly | | |

### A2.2 Core Mechanics Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Flow order is correct: intro -> food -> color -> activity -> friend -> child steps -> comparison | | |
| | Correct choices move to correct phase with correct delay timing | | |
| | Wrong choices append feedback but do not break progression | | |
| | Child custom choices (draw/write/select) save and display properly | | |
| | Friend name input validation works and transitions safely | | |

### A2.3 Idle Hint, Glow, and Pointer Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Idle hint ladder runs correctly per phase (wobble/glow/VO/sparkle/pulse) | | |
| | Correct option receives highlight classes at proper idle stages | | |
| | Pointer hint appears only when expected and disappears on interaction | | |
| | Idle hint resets after user tap/click | | |

### A2.4 Voice and Audio Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Phase VO prompts play exactly once per phase entry (no repeats) | | |
| | Correct feedback VO plays for each correct answer | | |
| | Child-phase VO prompts match child step context | | |
| | Audio toggle mutes/unmutes speech and FX immediately | | |

---

## SCENE A3 - DREAMS & WISHES / OBSTACLE REMOVER (`dreams-wishes`)

### A3.1 Visual and Asset Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Wish backgrounds, Earth states, bubble images, bowls/food, and nature assets load correctly | | |
| | No bubble/image clipping at screen edges in desktop/mobile | | |
| | Sparkle overlays and mini thumbs-up gesture are visible above gameplay | | |
| | Completion visuals (comparison/ending/completion modal) render cleanly | | |

### A3.2 Wish 1 (Bubbles) Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Bubbles spawn continuously in active phase without lane overlap bugs | | |
| | Duplicate same bubble type does not appear simultaneously (if intended by latest logic) | | |
| | Tap on kind bubble increments progress correctly | | |
| | Tap on unkind bubble removes bubble without progress increment | | |
| | Word VO on bubble tap plays correct label (helping/sharing/hugging/gifting, fighting/teasing/ignoring/snatching) | | |
| | Sparkles appear reliably on correct taps and final completion tap | | |

### A3.3 Wish 2 and Wish 3 Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Drag/drop food to plates works with correct accept/reject behavior | | |
| | Plate capacity and visual stacking behave correctly | | |
| | Wish 2 completion transitions at right timing with VO and FX | | |
| | Wish 3 spot tapping reveals nature elements correctly | | |
| | Wish 3 completion transitions correctly with sparkle/VO | | |

### A3.4 Resume/Reload and Voice Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Mid-phase reload resets/continues according to intended logic | | |
| | Return from tab does not create duplicate timers/voice calls | | |
| | Idle hints/levels reset properly after interaction | | |

---

## SCENE A4 - MY INDIAN STORY (`my-indian-story`)

### A4.1 Visual and Asset Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | India map base and region assets load correctly | | |
| | Language card icons and festival card icons load correctly | | |
| | Magnifying glass/hint UI appears correctly in home discovery phase | | |
| | Selected card visual state (border/bg/shadow/checkmark) is consistent | | |
| | Progress header discovery chips show selected region/languages/festivals correctly | | |

### A4.2 Core Mechanics Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Phase flow is correct: opening -> Ganesha home -> child home -> languages -> festivals -> comparison -> complete | | |
| | Region selection saves correctly and persists through phase transition | | |
| | Language selection cap (up to 3) enforces correctly | | |
| | Festival selection cap (up to 4) enforces correctly | | |
| | Continue buttons enable/disable correctly based on required selections | | |
| | Completion data includes selected region/languages/festivals | | |

### A4.3 Guess, Glow, and Idle Hint Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Wrong guess triggers shake animation and proper retry UX | | |
| | Correct guess triggers glow/sparkle feedback | | |
| | Home phase idle hints progress correctly (glow/wobble/VO/pointer levels) | | |
| | Language/festival idle hint levels trigger and reset on interaction | | |
| | No stuck idle animation after leaving phase | | |

### A4.4 Voice and Audio Checks

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | VO lines trigger for opening, origin, language, and festival context | | |
| | Tap-triggered VO is not cut off unexpectedly by transition | | |
| | Audio toggle works in all phases including overlays | | |
| | Completion phase voice and FX timing are clean | | |

---

## FINAL ABOUT ME HUT FREEZE SIGN-OFF BLOCK

### Pre-Freeze Validation

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tested on desktop viewport | | |
| | Tested on mobile viewport | | |
| | Tested with audio ON and OFF | | |
| | Tested with tab switch during each scene | | |
| | Tested with at least one mid-scene reload per scene | | |
| | DevTools console has no red errors in each scene | | |
| | DevTools network has no 404 asset failures in each scene | | |

### QA + UX Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Tester | | | |
| Senior UI/UX Reviewer | | | |
| Scene Owner | | | |

---

## HOW TO USE

1. Print this checklist.
2. Run each About Me scene end-to-end and mid-flow reload tests.
3. Tick every row. Any Fail must include exact repro note.
4. Freeze only after all critical rows pass (asset load, tap mechanics, VO trigger, tab/reload stability, z-index/glow behavior).
