# ABOUT ME HUT — ZONE 5
## Comprehensive Production Freeze Checklist

**Date:** 2026-04-22 (updated)  
**Role:** Senior UI/UX Developer + QA  
**Scope:** Zone 5 — About Me Hut (Scenes 19–22)  
**Status:** Ready for Production Freeze Review

---

## LEGEND
- **RED BOLD** = PRODUCTION BLOCKER — Must pass before any deployment. Cannot hotfix post-launch.
- **Regular** = Quality Pass — Important but recoverable with a post-launch hotfix.

---

## SECTION 1 — SHARED CHROME (all 4 scenes)
**Status:** FROZEN ✅ (2026-04-23)
**Freeze Decision:** Shared chrome accepted for freeze.

### 1A · Opening Modal (T01)
- [ ] Opens on scene entry, no fade lag
- [ ] Baloo 2 title, Nunito description — no system fonts
- [ ] Action explains mechanic clearly, age 5–12 language
- [ ] CTA button touch-friendly ≥ 60 px
- [ ] Does NOT re-trigger on tab return
- [ ] VO narration syncs to modal text (if present)
- [ ] Closes cleanly — no lingering overlay or z-index ghost

### 1B · Completion Modal (T02) + SceneCompletionCelebration
- [ ] Fires on win condition — SceneCompletionCelebration renders
- [ ] 'We' language subtitle — celebratory tone
- [ ] Affirmation line present and correct for scene theme
- [ ] 'Next Scene' → next scene (or zone welcome if S22 is last)
- [ ] 'Replay' → full scene reset, all state cleared
- [ ] Confetti/sparkles fire once only, don't loop
- [ ] Modal closes on Continue/Replay — no stuck overlay

### 1C · Audio Toggle (T04) + Audio Preference Persistence
- [ ] **Toggle OFF stops ALL VO lines immediately with no stutter**
- [ ] **Toggle OFF stops ALL FX sounds (tap, chime, sparkle) immediately**
- [ ] Toggle ON resumes queue without replaying or skipping
- [ ] **Web Speech API: stopSpokenVoice() cancels in-flight utterance immediately — no tail-end bleed**
- [ ] **Preference persists across tab switch and hard reload via localStorage**
- [ ] **Preference persists across all 4 About Me scenes**
- [ ] Visual indicator clear (■ vs ■) and readable

### 1D · Home Button (T05) + Zone Badge (T13)
- [ ] **Home button mid-scene → confirmation dialog appears**
- [ ] 'Cancel' → returns to scene, no state change
- [ ] **'Home' → ProgressManager.updateProgress() called before navigation**
- [ ] Zone badge displays correct label, zone colour scheme applied
- [ ] Both components consistent position across all 4 scenes

---

## SCENE 19 — FAMILY TREE (Familytreegame.jsx) ✅

**Phases:** intro → ganeshaTree → transition → childInput → sideBySide

### 19A · TAB SWITCH — PRODUCTION BLOCKER
- [x] **onHide: stops all voice (stopVoice + stopSpokenVoice), clears idle hint timers, resets idleHintLevel to 0**
- [x] **onShow: triggers return hint VO, restarts idle hint timers if choice modal is still open**
- [x] After resumeDelay countdown clears → pointing hint arrow shows on first unplaced circle
- [x] Tab switch in ganeshaTree (no choice modal open) → returns cleanly, no VO replay spam
- [x] Tab switch with choice modal open → modal still visible on return, idle hints restart
- [x] Tab switch in childInput (name modal open) → modal still visible, draft text preserved
- [x] Tab switch in sideBySide → comparison card still visible on return
- [x] **No duplicate timers after tab return in any phase**

### 19B · RELOAD / CONTINUE — PRODUCTION BLOCKER
- [x] Reload in intro → no popup, opening modal shows fresh
- [x] **Reload in ganeshaTree (1–3 placed) → resume popup 'You've placed X/4 family members' + placed deities remain**
- [x] **Reload in ganeshaTree (all 4 placed) → resume popup 'Amazing! You completed Ganesha's tree!' + tree intact**
- [x] **Reload in childInput (some family added) → resume popup 'You've added X family members' + family avatars preserved**
- [x] Reload in transition or sideBySide → UI shows as-is, no popup needed
- [x] **ALL transient states cleared on reload: showChoiceModal, wrongChoice, showFunFactModal, showNameModal, justPlacedId, showTreeSparkles**
- [x] Resume popup auto-dismisses after 5s — does not block gameplay
- [x] **Completion 'Next Scene' → next scene; 'Replay' → full state cleared**

### 19C · IDLE HINTS
- [x] idleHintLevel 1: correct option wobbles (idle-wobble class)
- [x] **idleHintLevel 2: correct option glows (idle-glow class) + VO hint plays per-circle**
- [x] idleHintLevel 3: sparkle effect on correct option (idle-sparkle class)
- [x] **Pointer emoji appears at level 3 on correct option, hides on interaction**
- [x] Choosing wrong option resets idle hint cycle (timer restarts)
- [x] Idle hints restart on tab return if choice modal still open (faster on 2nd+ open)
- [x] No idle hints in childInput or sideBySide — acceptable gap, not a blocker

### 19D · VISUAL ASSETS
- [x] Background (family_background.jpg) — No 404
- [x] Family tree overlay (family_tree.png) — No stretch
- [x] 4 correct deity images (Shiva, Parvati, Kartikeya, Baby Ganesha) — All load
- [x] 8 distractor deity images (Brahma, Vishnu, Lakshmi, etc.) — All load
- [x] 7 child family avatars (Dad, Mom, Grandpa, Grandma, Brother, Sister, Myself, Pet) — All load
- [x] Family / heart / home icons — All load
- [x] Opening modal image + completion modal icons — Correct
- [x] Sparkle / confetti layer — Above gameplay

### 19E · CORE MECHANICS
- [x] Circle tap → Opens choice modal for that slot
- [x] Correct deity choice → Sparkle + VO, deity placed in correct slot
- [x] Wrong choice → Gentle wiggle, user can retry, no progress lost
- [x] Placement lock → Placed slot read-only, tap shows fun-fact modal
- [x] Sequence lock → Cannot open next slot while current in progress
- [x] childInput transition → All 4 deities placed → transition phase → child input prompt
- [x] Child avatar tap → Opens name input modal for that slot
- [x] Name input → Text saves, call name persists to comparison card
- [x] sideBySide phase → Ganesha's 4 + child's family shown side-by-side, all names visible
- [x] Completion → sideBySide complete → SceneCompletionCelebration, ProgressManager called

### 19F · VOICE & VO CHECKLIST
- [x] Intro / opening modal VO → Opening modal loads
- [x] ganeshaTree entry VO → Phase enters from intro
- [x] Per-circle idle hint VO → idleHintLevel 2 per open circle
- [x] Correct placement VO → Correct deity chosen
- [x] Wrong choice VO → Wrong deity chosen
- [x] Fun-fact / info VO → Already-placed slot tapped
- [x] Transition VO → transition phase enters
- [x] childInput entry VO → childInput phase enters
- [x] Name input prompt VO → Name modal opens per slot
- [x] sideBySide / comparison VO → sideBySide phase enters
- [x] Return hint VO → Tab return
- [x] Tap SFX → All taps
- [x] Sparkle SFX → Correct placements + completion
- [x] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**


### 19G · UX POLISH
- [ ] Correct placement: sparkle + scale-up feels satisfying and immediate (not delayed)
- [ ] Wrong choice: wiggle is gentle, not harsh — child not discouraged
- [ ] **Placed deity slots: visually distinct from empty slots at a glance**
- [ ] Fun-fact modal: dismisses cleanly, no stuck overlay
- [ ] Transition phase: clear visual handoff — Ganesha tree complete → child tree begins
- [ ] sideBySide layout: both trees balanced, names readable, no overflow on mobile
- [ ] All tap targets ≥ 60 px — circles, choice cards, name modal input
- [ ] Text contrast readable on family_background across all phases
- [ ] Z-index correct: choice modal > sparkle > tree overlay > background
- [ ] Mobile: family tree fits viewport, no horizontal scroll

---

## SCENE 20 — FAVORITE FOOD (Favoritefoodgame.jsx)

**Status:** FULLY MAPPED — 16 phases in NAVIGATION.md. Run manual pass to mark each row.

**Phases (16 total):** intro, food-choice, food-correct, color-choice, color-correct, activity-choice, activity-correct, friend-choice, friend-correct, child-intro, child-food-choice, child-color-choice, child-activity-choice, child-friend-input, friend-celebration, comparison-card

### 20A · PHASES
- [x] All 16 phases present and navigating correctly

### 20B · TAB SWITCH — PRODUCTION BLOCKER
- [x] **Ganesha choice phases: tab return → phase restarts with VO + idle hints re-running**
- [x] **color-choice after wrong click: wrong choices reset on return**
- [x] **Child input phase (no selection yet): remains in same child phase, VO replay only**
- [x] **food-draw modal open + tab return: modal restores with draft drawing**
- [x] **activity-type modal open + tab return: modal restores with draft text**
- [x] **No duplicate VO spam after any tab return**

### 20C · RELOAD / CONTINUE — PRODUCTION BLOCKER
**Design rule:** no resume popup in any phase. Child phases auto-advance if step already complete.

- [x] **Reload in any Ganesha phase → phase restarts with VO only, no popup**
- [x] **Child food already selected + reload → auto-advance to child-color-choice**
- [x] **Child color already selected + reload → auto-advance to child-activity-choice**
- [x] **Child activity already selected + reload → auto-advance to child-friend-input**
- [x] **Child friend already entered + reload → moves to friend-celebration**
- [x] **Completion 'Next Scene' → next scene; 'Replay' → full scene reset**

### 20D · IDLE HINTS
- [x] Idle ladder in Ganesha phases: wobble → glow → VO → sparkle + pointer
- [x] **Pointer emoji ONLY at hint level 3, on correct option, auto-hides on tap**
- [x] Wrong click resets idle timer cycle
- [x] No idle hints in child input phases (or gentle low-priority nudge only)

### 20E · CORE MECHANICS
- [x] Circle tap → Opens choice modal for that slot
- [x] Correct food choice → Sparkle + VO, advances to food-correct phase
- [x] Wrong food choice → Gentle wiggle, user can retry, no progress lost
- [x] Color choice sequence → After food correct, child selects favorite color
- [x] Activity choice sequence → After color correct, child selects favorite activity
- [x] Friend/animal choice sequence → After activity correct, child selects best friend
- [x] child-intro transition → All 4 Ganesha phases complete → transition to child section
- [x] Child food selection → Child picks from 7 food options, advance enabled
- [x] Child color selection → Child picks favorite color, auto-advance to child-activity-choice
- [x] Child activity selection → Child picks favorite activity, auto-advance to child-friend-input
- [x] Friend name input → Child types best friend name, name persists to comparison card
- [x] friend-celebration auto-advance → 2s celebration → auto-advance to comparison-card
- [x] Comparison card shows → Ganesha's 4 favorites + Child's 4 favorites displayed side-by-side
- [x] Completion → comparison-card complete → SceneCompletionCelebration, ProgressManager called

### 20F · VOICE & VO CHECKLIST
- [x] Intro / opening modal VO → Scene opens with greeting
- [x] Food phase entry VO → "Hmm... can you guess my favourite food?" + "Tap the one you think I love."
- [x] Food correct VO → "Yes! Modak is my favourite. Sweet and yummy!"
- [x] Color phase entry VO → "Can you guess my favourite color?"
- [x] Color correct VO → "Yes! Yellow is my favourite color, bright like the sun!"
- [x] Activity phase entry VO → "Can you guess my favourite activity?"
- [x] Activity correct VO → "Yes! I love to dance. It makes me so happy!"
- [x] Friend phase entry VO → "Can you guess who my best friend is?"
- [x] Friend correct VO → "Yes! Mooshika is my little mouse friend!"
- [x] Transition VO → "Now let's discover your favorite things! It's your turn. Tell me what makes you special."
- [x] Child food entry VO → "What's your favorite food?"
- [x] Child color entry VO → "What's your favorite color?"
- [x] Child activity entry VO → "What do you love to do?"
- [x] Child friend entry VO → "Who is your best friend?"
- [x] Comparison card VO → "Now we know each other better. I'm happy we're friends!"
- [x] Idle hint VO (Ganesha phases) → 4 phase-specific hints at 27s
- [x] Return hint VO → Tab return in any phase — contextual to phase
- [x] Tap SFX → All card taps — consistent, not clipping
- [x] Sparkle SFX → Correct choices + friend-celebration
- [x] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**

### 20G · VISUAL ASSETS CHECKLIST
- [x] Background (fav_background.jpg) — No 404, full viewport
- [x] Ganesha food cards (modak, ladoo, barfi) — All load, visible
- [x] Child food cards (pizza, burger, icecream, noodles, fruit, dosa, rice) — All 7 load
- [x] Color options (red, orange, yellow, green, blue, purple, pink, brown) — All 8 load
- [x] Activity icons (drawing, music, reading, playing, TV, dancing) — All 6 load
- [x] Friend animals (mouse, cow, peacock) — All 3 load
- [x] Baby Ganesha SVG — Loads from shared path, correct size
- [x] Opening modal image — Scene-appropriate, no 404
- [x] Completion modal icons (food, color, activity) — All load
- [x] Sparkle/confetti layer — Renders above gameplay, celebratory

### 20H · UX POLISH
- [ ] Correct choice: glow + sparkle feedback is immediate and satisfying
- [ ] **Wrong choice: shake is gentle, option stays visible, no harsh red flash**
- [ ] **Ganesha food/color/activity/friend reveal: progressive cards feel discoverable, not overwhelming**
- [ ] Child choice selection: selected state is visually unambiguous (border, highlight, scale)
- [ ] Drawing pad (food-draw / activity-draw): canvas is large enough for small fingers, clear undo/confirm
- [ ] Text input (food-type / activity-type): keyboard does not obscure input field on mobile
- [ ] Comparison card: Ganesha's vs child's data clearly labelled, warm friendly layout
- [ ] friend-celebration animation: 2s window feels celebratory not rushed
- [ ] All tap targets ≥ 60 px — choice cards, child selection grid, drawing tools
- [ ] Text contrast readable on fav_background in all 16 phases
- [ ] Z-index correct: modals > sparkle > gameplay cards > background
- [ ] Mobile: card grid scrolls/wraps without overflow, no clipped images

## SCENE 21 — DREAMS & WISHES (ObstacleRemoverGame.jsx)

**Status:** FREEZE IN PROGRESS
**Freeze Decision:** Pending final checklist PASS run.

**Phases (14 total):** intro, wish1-intro, wish1-active, wish1-complete, wish2-active, wish2-complete, wish3-intro, wish3-active, wish3-complete, all-wishes-complete, dream-drawing, dream-clouded, dream-clearing, comparison-card

### 21A · PHASES
- [ ] All 14 phases present and navigating correctly
- [ ] Auto-transitions fire correctly (wish1-complete → wish2-active, dream-revealed → comparison-card)
- [ ] No frozen screens between phases

### 21B · TAB SWITCH — PRODUCTION BLOCKER
- [ ] **onHide: stops all VO + music immediately, clears phaseVoiceRef**
- [ ] **onShow: after resumeDelay (3s), contextual return hint VO plays for current phase**
- [ ] Tab switch during wish1-active → bubbles resume floating, no duplicate spawn on return
- [ ] Tab switch during wish2-active → drag state cleared, food items reset to start positions
- [ ] Tab switch during wish3-active → park spots preserve tapped state on return
- [ ] Tab switch during dream-drawing (pad open) → drawing preserved, pad still visible
- [ ] Tab switch during dream-clouded → trunk tap count preserved on return
- [ ] **No duplicate VO or timer spam after any tab return**
- [ ] **Return hint VO is phase-appropriate (not generic) for all 14 phases**

### 21C · RELOAD / CONTINUE — PRODUCTION BLOCKER
**Design rule (fixed this session):** reload fires entry VO at 500ms, resets partial counters, no blocking guards.

- [ ] **Reload in intro → opening modal shows fresh, opening VO plays**
- [ ] **Reload in wish1-intro → wish1Intro VO plays at 500ms**
- [ ] **Reload in wish1-active → taps reset to 0, wish1Active VO plays**
- [ ] **Reload in wish1-complete → rolls back to wish1-active, wish1Active VO plays**
- [ ] **Reload in wish2-active → bowl/food states reset, wish2Active VO plays**
- [ ] **Reload in wish2-complete → rolls back to wish2-active, wish2Active VO plays**
- [ ] **Reload in wish3-active → parkStates reset, wish3Active VO plays**
- [ ] **Reload in wish3-complete → rolls back to wish3-active, wish3Active VO plays**
- [ ] **Reload in all-wishes-complete → allWishesComplete VO plays**
- [ ] **Reload in dream-drawing → dreamDrawing VO plays, drawing canvas preserved**
- [ ] **Reload in dream-clouded → dreamClouded VO plays**
- [ ] **Reload in dream-clearing → trunkTaps reset, dreamClearing VO plays**
- [ ] **Reload with drawing modal open → returns to all-wishes-complete, VO plays**
- [ ] **Phase VO effect unblocked after reload — subsequent phase changes trigger VO normally**
- [ ] Completion 'Next Scene' → next scene; 'Replay' → full state cleared

### 21D · IDLE HINTS — PRODUCTION BLOCKER
**Fixed this session:** all 4 hint systems (wish1/wish2/wish3/dream) now use setTimeout ladder — pulse-and-clear, not persistent glow.

- [ ] **wish1 idle level 1 @ 10s: kind bubbles glow once (wishHintRingSoft, 1 cycle) → returns to normal**
- [ ] **wish1 idle level 2 @ 18s: kind bubbles pulse 3× (wishHintRingStrong) + VO "Look for the kind action bubbles"**
- [ ] **wish1 idle level 3 @ 26s: kind bubbles pulse 4× (wishHintRingFinal) + VO + glow stays (child stuck)**
- [ ] Bubbles continue floating during all hint levels — hint is overlay only, not replacement
- [ ] Wrong bubble tap: shake animation plays while bubble keeps floating — no freeze
- [ ] **wish2 idle level 1 @ 10s: food/plate items glow once → returns to normal**
- [ ] **wish2 idle level 2 @ 18s: items pulse 3× + VO "Drag any food to a plate"**
- [ ] **wish2 idle level 3 @ 26s: items persist glow (child stuck)**
- [ ] **wish3 idle level 1 @ 10s: park hotspot divs glow once + background drop-shadow → returns to normal**
- [ ] **wish3 idle level 2 @ 18s: hotspots pulse 3× + VO "Tap the glowing spots on the land"**
- [ ] **wish3 idle level 3 @ 26s: hotspots persist + VO "Tap each glowing spot" + 👇 emoji**
- [ ] **dream-clouded idle level 1 @ 10s: Ganesha helper glows once → returns to normal**
- [ ] **dream-clouded idle level 2 @ 18s: Ganesha pulses 3× + VO "Tap my trunk to clear the clouds"**
- [ ] **dream-clouded idle level 3 @ 26s: Ganesha persists glow + 👆 emoji**
- [ ] User interaction (any tap) resets idle level to 0 immediately across all wish phases


### 21E · CORE MECHANICS
- [ ] wish1-intro VO plays → Sets context for wish 1 (kindness)
- [ ] **wish1-active bubble spawning → Bubbles appear with kind/unkind action images**
- [ ] **Bubble tap (kind action) → Removes bubble, increments counter, sparkle plays**
- [ ] **Bubble tap (unkind action) → No removal, gentle shake feedback, VO nudge**
- [ ] wish1 counter threshold → 4+ kind bubbles tapped → wish1-complete phase
- [ ] wish1-complete celebration → Earth transitions from sad to happy state
- [ ] Auto-transition to wish2 → 2-3s after wish1-complete
- [ ] wish2-intro context → Sets up food-sharing mechanic
- [ ] **wish2-active drag/drop → Drag food items from top to plates below**
- [ ] **Plate collision detection → Food placed on plate = accepted, sparkle SFX**
- [ ] **Wrong placement → Food returns to original position, gentle feedback**
- [ ] wish2 complete condition → All bowls full (all bowlStates === true)
- [ ] wish2-complete celebration → Bowls transform, satisfied VO
- [ ] Auto-transition to wish3 → 2-3s after wish2-complete
- [ ] wish3-intro context → Sets up forest-growth mechanic
- [ ] **wish3-active spot tapping → Child taps forest spots to reveal nature elements**
- [ ] **Each spot reveal → Grass, butterfly, slide appear with sparkle**
- [ ] wish3 complete condition → All 3 spots revealed (parkStates all true)
- [ ] wish3-complete celebration → Forest full of life, VO praise
- [ ] Auto-transition to all-wishes-complete → No separate dream-intro phase (T40)
- [ ] dream-drawing phase → Child draws wish on canvas
- [ ] dream-clouded phase → Child taps trunk to clear clouds covering dream
- [ ] **Trunk tap counter → Increments, clouds fade progressively**
- [ ] dream-clearing animation → Clouds dissolve, dream becoming visible
- [ ] dream-revealed state → Dream fully visible, celebratory VO
- [ ] Comparison card → Wishes + dream shown side-by-side
- [ ] Completion → All phases done → SceneCompletionCelebration, ProgressManager called

### 21F · VOICE & VO CHECKLIST
- [ ] Opening modal VO → "Let's help and dream together!"
- [ ] wish1-intro VO → "Let's make the world smile!"
- [ ] wish1-active entry VO → "Tap the kind actions."
- [ ] wish1-complete VO → "You made the world kinder!"
- [ ] wish2-intro VO → "My second wish… is to share our food. So no one stays hungry."
- [ ] wish2-active entry VO → "Drag food to the plates."
- [ ] wish2-complete VO → "Everyone has food now!"
- [ ] wish3-intro VO → "My last wish… is for a green world full of life. Let's help this forest grow!"
- [ ] wish3-active entry VO → "Tap to grow the garden."
- [ ] wish3-complete VO → "The world is green and happy!"
- [ ] all-wishes-complete transition VO → "Now it's your turn! Draw your happy dream."
- [ ] dream-drawing prompt VO → "Draw your happy dream."
- [ ] dream-clouded entry VO → "Tap my trunk to clear the clouds."
- [ ] dream-clearing nudge VO → "Keep tapping to clear the clouds!"
- [ ] dream-revealed VO → "Your dream is beautiful!"
- [ ] Comparison card VO → "Our dreams grow together!"
- [ ] Ending VO → "Keep dreaming and helping!"
- [ ] wish1 idle hint VO → "Look for the kind actions."
- [ ] wish2 idle hint VO → "Try dragging food to the plates."
- [ ] wish3 idle hint VO → "Tap the forest to make it grow."
- [ ] Return hint VO → Tab return in any phase — contextual to phase
- [ ] Idle hint VO (wish phases) → Contextual nudge at 15s+ idle
- [ ] Tap SFX → All bubble/spot taps — consistent, celebratory tone
- [ ] Sparkle SFX → Correct actions, kind bubbles, forest reveals
- [ ] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**

### 21G · VISUAL ASSETS CHECKLIST
- [ ] Background (dream_background.jpg) — No 404, full viewport
- [ ] wish1-active bubble images → Kind actions (helping, sharing, hugging, gifting) + Unkind actions (angry, fighting, hitting, teasing) — All 8 load
- [ ] wish1 Earth states → wish-earth-sad, wish-earth-happy — Both load, transition smooth
- [ ] wish2-active food items (7 total) → apple, banana, bread, broccoli, carrot, milk, rice — All draggable, visible
- [ ] wish2 bowl/plate states → wish-bowl-empty, wish-bowl-full, plate — All load, collision zones visible
- [ ] wish3-active forest states (4 backgrounds) → wish-forest-1, wish-forest-2, wish-forest-3, wish-forest-4 — All load, correct scale
- [ ] wish3 nature element icons → Grass, butterfly, slide — All load, appear on tap
- [ ] Wish phase icons → wish-icon-earth, wish-icon-flower, wish-icon-share, heart-icon, shootingstar-icon, world-icon — All 6 load
- [ ] Companion animals (mouse, cow, peacock) — All load, correct size
- [ ] Ganesha assets → babyGaneshaImg, babyGaneshaSit, cloud image — All load
- [ ] Drawing canvas → Renders correctly, no lag on draw events
- [ ] Sparkle/confetti layer → Renders above gameplay, celebratory

### 21H · UX POLISH
- [ ] **wish1 bubble size and float speed: comfortable for 5-yr-old fingers to tap (≥ 60px touch zone)**
- [ ] Kind vs unkind bubbles: visually distinct at a glance — no confusion about which to tap
- [ ] Wrong bubble shake: gentle, non-punishing — child encouraged to keep trying
- [ ] Wish completion Earth/bowl/forest transitions: smooth, celebratory, not abrupt
- [ ] **Idle hint glow: pulses briefly then returns to normal — does NOT stay on continuously**
- [ ] dream-drawing canvas: large enough, responsive to touch, clear save/submit action
- [ ] Trunk tap clouds: progressive fade feels magical, child understands causality
- [ ] Comparison card: wishes + dream shown warmly, child's drawing displayed with pride
- [ ] All tap targets ≥ 60 px — bubbles, food items, forest spots, Ganesha trunk, drawing tools
- [ ] Text contrast readable on dream_background in all phases
- [ ] Z-index correct: drawing modal > wish overlays > gameplay > background
- [ ] Mobile: bubbles don't spawn off-screen, drag targets accessible without scroll

### 21Z · FREEZE LOCK RUN (STRICT PASS/FAIL)
**Run once in sequence. For each row, tick exactly one box.**

| Test | PASS | FAIL |
|---|---|---|
| Opening modal VO plays from recorded audio on scene load | [ ] | [ ] |
| wish1 flow complete: correct taps, wrong taps, idle hints all behave correctly | [ ] | [ ] |
| wish2 flow complete: drag/drop, reset on wrong drop, idle hints all correct | [ ] | [ ] |
| wish3 flow complete: 3 spot taps, gesture + sparkle visible, SFX audible | [ ] | [ ] |
| Cloud-clear phase: trunk prompt plays once (no duplicate on tap 1/2) | [ ] | [ ] |
| Cloud-clear phase: sparkles are clearly visible while clearing clouds | [ ] | [ ] |
| Dream reveal VO plays immediately after final trunk tap | [ ] | [ ] |
| Comparison VO plays once when comparison card appears | [ ] | [ ] |
| Completion modal VO plays once with latest approved copy | [ ] | [ ] |
| Story header behavior: icon fly completes before icon appears in header chip | [ ] | [ ] |
| Pause/Resume at least once in each major phase (wish1, wish2, wish3, dream) | [ ] | [ ] |
| Hard reload in active phase restores expected state + phase entry VO | [ ] | [ ] |
| Audio toggle OFF immediately stops VO and SFX in every phase | [ ] | [ ] |
| Scene navigation path: 20 -> 21 -> 22 works (no jump to zone map) | [ ] | [ ] |
| Replay from completion resets all scene state cleanly | [ ] | [ ] |


---

## SCENE 22 — MY INDIAN STORY (MyIndianStoryGame.jsx)

**Status:** FULLY READ — all phases, hooks, and assets mapped from JSX. Complete pass required.

**Phases (9 total):** opening, ganesha_home, child_home, language_ganesha, language_child, festivals_ganesha, festivals_child, origin_card, complete

### 22A · PHASES
- [ ] opening — Intro modal
- [ ] ganesha_home — Drag magnifying glass over India map to discover Ganesha's 3 locations
- [ ] child_home — Child selects their region of India (6 options + Outside India)
- [ ] language_ganesha — Child guesses which language Ganesha speaks
- [ ] language_child — Child picks up to 3 languages they know from grid of 12
- [ ] festivals_ganesha — Child guesses Ganesha's favourite festival from 5 cards
- [ ] festivals_child — Child picks up to 4 festivals they celebrate from grid of 12
- [ ] origin_card — Story card reveals — cultural origin story shown
- [ ] complete — Completion modal

### 22B · TAB SWITCH — PRODUCTION BLOCKER
- [ ] **Tab switch during ganesha_home (dragging mglass) → return → hint VO plays, idle hint level resets**
- [ ] **Tab switch during child_home (region not yet selected) → return → return hint VO plays**
- [ ] **Tab switch during language_ganesha (mid-guess) → return → return hint VO plays, shake state cleared**
- [ ] **Tab switch during language_child (cards selected) → return → selections preserved, return hint plays**
- [ ] **Tab switch during festivals_child → return → selections preserved**
- [ ] **No duplicate timers or VO calls after any tab return**
- [ ] **Audio stops immediately on tab hide — no background playback**

### 22C · RELOAD / CONTINUE — PRODUCTION BLOCKER
**Design rule:** reload restores the saved phase + shows 3s resume countdown. Selections (region/languages/festivals) are fully restored.

- [ ] **Reload in opening → no popup, opening modal shows fresh**
- [ ] **Reload in ganesha_home → 3s countdown popup → resumes in ganesha_home (no location progress lost)**
- [ ] **Reload in child_home before region selected → 3s countdown → resumes in child_home**
- [ ] **Reload in child_home after region selected → 3s countdown → resumes in child_home, region pre-selected**
- [ ] **Reload in language_ganesha → 3s countdown → resumes in language_ganesha, guess state cleared**
- [ ] **Reload in language_child (2 langs picked) → 3s countdown → resumes, 2 langs restored and visible as selected**
- [ ] **Reload in festivals_ganesha → 3s countdown → resumes, guess state cleared**
- [ ] **Reload in festivals_child (3 festivals picked) → 3s countdown → resumes, 3 festivals restored**
- [ ] **Reload in origin_card → 3s countdown → resumes in origin_card**
- [ ] **Completion 'Next Scene' → next scene; 'Replay' → full state cleared including localStorage**

### 22D · IDLE HINTS (T27 ✅ COMPLETE)
**T27 fully implemented across all phases. Manual QA pass required.**

- [ ] ganesha_home: ganeshaHomeIdleLevel 0→1→2→3 — glow → repeating glow → steady glow (idleGlowSteady animation)
- [ ] ganesha_home idle level 3: undiscovered location icons animate with idleWobble
- [ ] ganesha_home interaction: setGaneshaHomeIdleLevel(0) resets on discovery
- [ ] child_home: idle hint fires when child stalls on region selection
- [ ] language_ganesha: idle hint fires when child stalls on guess
- [ ] festivals_ganesha: idle hint fires when child stalls on guess
- [ ] language_child / festivals_child: gentle nudge fires when child hasn't made min selection
- [ ] **All idle hints use Web Speech API — verify VO fires correctly per phase**

### 22E · CORE MECHANICS
- [ ] ganesha_home drag → Drag mglass over India map → Varanasi, Mumbai, TamilNadu spots discovered with sparkle
- [ ] child_home region pick → Tap a region card → selected state shows, Continue button enables
- [ ] Kailash option → Tap Kailash → Ganesha reacts 'That's where my Amma and Appa live!' → then prompts for earth region
- [ ] language_ganesha guess → Tap wrong → shake animation, retry allowed. Tap correct → glow/sparkle, advance
- [ ] language_child select → Pick up to 3 from 12 languages. 4th tap either blocked or replaces last. Continue enables at ≥1
- [ ] festivals_ganesha guess → Tap wrong → shake, retry. Tap correct (Ganesh Chaturthi) → sparkle, advance
- [ ] festivals_child select → Pick up to 4 from 12 festivals. Continue enables at ≥1
- [ ] origin_card → Story card shows with animation, Continue to completion
- [ ] Comparison card → Selected region, languages, festivals all appear correctly on comparison card
- [ ] Completion → All phases done → SceneCompletionCelebration, ProgressManager.updateProgress called
- [ ] Language cap enforcement → Cannot select more than 3 languages — 4th tap blocked or replaces
- [ ] Festival cap enforcement → Cannot select more than 4 festivals — 5th tap blocked or replaces

### 22F · VOICE & VO CHECKLIST
- [ ] Opening modal VO → opening phase
- [ ] ganesha_home entry VO → Phase enters
- [ ] Location discovery VO → Each spot tapped/discovered
- [ ] ganesha_home idle hint VO → ganeshaHomeIdleLevel 2–3
- [ ] child_home entry VO → Phase enters
- [ ] Region selection VO → Region tapped
- [ ] language_ganesha entry VO → Phase enters
- [ ] Wrong guess VO → Wrong language/festival tapped
- [ ] Correct guess VO → Correct language/festival tapped
- [ ] language_child entry VO → Phase enters
- [ ] festivals_ganesha entry VO → Phase enters
- [ ] Festival react VO → Each festival tapped in festivals_child
- [ ] festivals_child entry VO → Phase enters
- [ ] origin_card VO → origin_card phase enters
- [ ] Return hint VO → Tab return in any RESUMABLE phase
- [ ] Tap SFX → All card taps
- [ ] Sparkle SFX → Correct guess + location discover
- [ ] Shake SFX / feedback → Wrong guess
- [ ] **Audio toggle OFF → During any VO — All stop immediately — BLOCKER**

### 22G · VISUAL ASSETS CHECKLIST
- [ ] Background (name_background.jpg) — Full viewport, no tile
- [ ] India map image (india-map.png) — Correct scale on mobile + desktop
- [ ] Magnifying glass (mglass.png) — Draggable, renders above map
- [ ] 3 Ganesha spot icons (Varanasi, Mumbai, TamilNadu) — Visible on map at correct positions
- [ ] 6 region icons — All load, no missing
- [ ] 12 language icons — All 12 load
- [ ] Play language icon — Renders correctly in language grid
- [ ] 12 festival icons — All 12 load
- [ ] Modak image — Used in festivals section
- [ ] 3 progress header icons — Show selected chips correctly
- [ ] Baby Ganesha SVG — Loads from shared path
- [ ] Opening modal image + completion modal icons — Scene-appropriate
- [ ] SparkleAnimation component — Renders above gameplay

### 22H · CONTENT CHECKLIST
- [ ] Opening modal text — Ganesha 1st person, explains mechanic, age 5–12 friendly
- [ ] Completion modal subtitle — 'We' language, celebratory
- [ ] Affirmation line — Culturally grounded
- [ ] 6 region ganeshaFact strings — Correct geography, no factual errors, joyful tone
- [ ] Kailash special reaction — Ganesha redirects to 'but where on Earth?' — handled gracefully
- [ ] 12 language script labels — All scripts render correctly — no tofu boxes
- [ ] Festival ganeshaReact strings (12 festivals) — Accurate, culturally respectful, no stereotypes
- [ ] Language guess hint / clue text — Gives fair clue without giving away answer immediately
- [ ] Festival guess hint / clue text — Fair clue, Ganesh Chaturthi is correct answer
- [ ] origin_card story text — Culturally accurate, age-appropriate, inspiring
- [ ] StoryProgressHeader chips — Show selected region/languages/festivals accurately
- [ ] Comparison card labels — Ganesha's vs child's data clearly labelled side-by-side

### 22I · UX POLISH
- [ ] **Wrong guess: shake animation feels gentle, not harsh — child not discouraged**
- [ ] Correct guess: glow + sparkle feedback is satisfying and immediate
- [ ] **Language / festival selected state is visually unambiguous (border, fill, checkmark)**
- [ ] **Language cap (3): 4th tap blocked with clear visual feedback — no silent failure**
- [ ] **Festival cap (4): 5th tap blocked with clear visual feedback — no silent failure**
- [ ] Deselect works cleanly — count decrements, visual state updates immediately
- [ ] Continue button enables/disables correctly based on required selections
- [ ] ganesha_home: magnifying glass drag feels smooth and responsive on touch
- [ ] ganesha_home discovery moments: each location sparkle feels rewarding, not abrupt
- [ ] child_home: region cards large enough, selected card clearly highlighted
- [ ] language_ganesha / festivals_ganesha: wrong guess shake is immediate, card stays visible
- [ ] language_child / festivals_child: grid is scannable, icons have labels, no tofu boxes on any device
- [ ] origin_card: story text readable, culturally warm presentation
- [ ] Comparison card: selected region/languages/festivals all appear correctly, warm layout
- [ ] Text contrast readable on all backgrounds and in all 9 phases
- [ ] Z-index correct: modal > sparkle > overlay > gameplay
- [ ] All tap targets ≥ 60 px — region cards, language cards, festival cards all touchable
- [ ] Mobile: cards grid scrolls or wraps without overflow, no clipped icons
- [ ] SymbolSidebar does NOT appear in this scene

---

## SECTION 6 — CROSS-SCENE INTEGRATION
- [ ] S19 complete → progress saved, zone bar updates (1/4)
- [ ] S20 complete → zone bar reflects 2/4
- [ ] S21 complete → zone bar reflects 3/4
- [ ] **S22 complete → Zone 5 FULLY COMPLETE, zone badge shows ✓**
- [ ] **Reload after S20 complete → S21 entry allowed, S20 badge shown**
- [ ] **Toggle OFF in S19 → persists through S20, S21, S22**
- [ ] **Completion 'Next Scene' chains: S19 → S20 → S21 → S22 → Zone Welcome or Map**
- [ ] 'Replay' per scene resets only that scene — other scenes unaffected

---

## SECTION 7 — EDGE CASE TESTING

### 7A · Rapid Interaction
- [ ] **Double-tap same button → second tap ignored, no duplicate VO or progression**
- [ ] Tap while long VO playing → does not block gameplay; VO can be interrupted or queued
- [ ] **Rapid modal close/open → no stacked or ghost modals**

### 7B · Audio Edge Cases
- [ ] **Toggle mid-VO → stops immediately, no stutter or replay**
- [ ] **Tab switch mid-VO → on return VO does not restart from beginning**
- [ ] **Multiple VO triggers simultaneously → queue prevents overlap or mixing**
- [ ] **Web Speech API: window.speechSynthesis.cancel() called on phase change — no ghost utterances**

### 7C · Input Edge Cases (S22 language/festival caps specifically)
- [ ] **Tap 4th language → clear feedback, no crash, cap enforced**
- [ ] **Tap 5th festival → clear feedback, no crash, cap enforced**
- [ ] Deselect then reselect → count updates correctly
- [ ] Continue with 0 selections → button stays disabled, nudge shown

### 7D · Reload / Persistence Edge Cases
- [ ] **Close browser tab mid-scene → reopen app → restores correct phase**
- [ ] **Clear localStorage mid-zone → fallback to fresh zone state, no crash**
- [ ] **Browser Back button during scene → confirmation dialog prevents accidental exit**
- [ ] **Device rotate mid-scene → layout reflows, no stuck modals**
- [ ] **SymbolSidebar never appears in any About Me scene**

---

## SECTION 8 — PRODUCTION READINESS SCORECARD

| Category | S19 Family Tree | S20 Fav Food | S21 Dreams | S22 My Indian Story |
|----------|-----------------|--------------|-----------|-------------------|
| Visual Assets | ■ | ■ | ■ | ■ |
| Core Mechanics | ■ | ■ | ■ | ■ |
| Tab Switch | ✓ EXISTS | ✓ EXISTS | ✓ FIXED† | ✓ EXISTS |
| Continue / Resume | ✓ EXISTS | ✓ FIXED† | ✓ FIXED† | ✓ EXISTS |
| Idle Hints (T27) | ✓ FIXED† | ✓ EXISTS | ✓ FIXED† | ✓ FIXED† |
| Voice & VO | ■ | ✓ FIXED† | ✓ FIXED† | ■ |
| UX Polish | ■ | ■ | ■ | ■ |
| Content Accuracy | — | — | — | ■ |
| Mobile Responsive | ■ | ■ | ■ | ■ |
| Edge Cases | ■ | ■ | ■ | ■ |
| Progress Persistence | ■ | ■ | ■ | ■ |

†FIXED = code bugs resolved in this session (2026-04-22). Manual QA pass still required.

---

## SECTION 9 — FINAL SIGN-OFF

### 9A · Pre-Launch Gates (every row must be ✓)
- [ ] **S19 freeze complete — all sections above marked Pass**
- [x] **S20 freeze complete — all 15 NAVIGATION.md checklist items manually verified**
- [ ] **S21 freeze complete — T38, T39, T40 edge cases verified**
- [ ] **S22 freeze complete — all sections above including content + VO + assets**
- [ ] **Cross-zone: all 4 scenes chain, progress persists, audio pref syncs**
- [ ] **Desktop (1280×800): no console errors, no network 404s**
- [ ] **Mobile (375×812): all tap targets work, no overflow, keyboard safe**
- [ ] **Audio: all VO lines trigger, toggle mutes immediately, no overlaps**
- [ ] **Edge cases: rapid tap, tab switch, reload, rotate all stable**
- [x] **T14 VO: Web Speech API via useGaneshaVoice — no MP3 files required**
- [ ] **T15 SFX: tap, chime, sparkle, bloom — verify all play, balanced, not clipping**
- [ ] **iOS Safari: opening modal CTA tap → first VO fires without async gap (gesture context intact)**
- [ ] **iOS Safari: speechSynthesis.getVoices() empty array handled — fallback voice is audible, not silent**
- [ ] **iOS Safari: tab return → OS-cancelled utterance correctly replayed by return hint system**
- [ ] **iOS PWA (home screen install): first VO after cold launch fires on CTA tap**
- [x] **T27 Idle hints: implemented in ALL phases for all 4 scenes (Web Speech API)**
- [ ] **T28 Ganesha gestures: mapped per scene phase, sparkle timing correct**

### 9B · Outstanding Action Items

#### **S21 — Code Fixes Applied (2026-04-22) — Manual QA Required**
- [x] VO reload bug fixed: `blockPhaseVoDuringReloadReplayRef` permanent-stuck issue resolved
- [x] Reload handler rewritten to Modak pattern (`useEffect []`, `setTimeout 500ms` per phase)
- [x] Duplicate phase VO effect removed
- [x] `isReload` permanent session block replaced with `reloadVoFiredRef` (one-time flag)
- [x] Tab-switch resume VO fixed: `intro` phase added to `getResumeVoiceLine`
- [x] Idle hints fixed: all 4 wish/dream systems now use setTimeout ladder (pulse-and-clear)
- [x] CSS class names corrected: `hint-glow`→`hint-strong`, `hint-strng`→`hint-final`
- [ ] **Manual QA: verify all 14 phases play entry VO correctly on fresh load**
- [ ] **Manual QA: verify all 14 phases play entry VO correctly on reload**
- [ ] **Manual QA: verify idle hint pulse-and-clear in wish1/2/3 and dream-clouded**

#### **S20 — Code Fixes Applied (2026-04-22) — Manual QA Required**
- [x] Reload handler rewritten to Modak pattern (`useEffect []`)
- [x] 4 dead refs removed (`reloadHandledRef`, `hasHydratedOnceRef`, `suppressCelebrationVoOnReloadRef`, `suppressPhaseVoUntilReloadSettlesRef`)
- [x] Phase VO effect simplified: single `reloadVoFiredRef` guard replaces 3-layer guard block
- [ ] **Manual QA: verify all 16 phases play entry VO correctly on reload**
- [ ] **Manual QA: verify celebration phase rollback on reload (food-correct → food-choice etc.)**

#### **T27 — Idle Hints ✅ COMPLETE**
- [x] S19 childInput — implemented
- [x] S22 child_home, language_ganesha, language_child, festivals_ganesha, festivals_child — implemented
- [x] S21 wish1/wish2/wish3/dream — fixed this session (pulse-and-clear pattern)
- [ ] **Manual QA: verify all idle hint levels fire and reset correctly in all scenes**

#### **T28 — Ganesha Gestures**
- [ ] About Me scenes (19–22) need gesture map per phase — point, celebrate, wave minimum

#### **T14/T15/T16 — Audio & VO**
- [x] All VO uses Web Speech API (useGaneshaVoice hook) — no MP3 recording required
- [ ] **SFX (tap, chime, sparkle, bloom) — verify all play via useGameSounds, no missing sounds**
- [ ] **Web Speech API: verify VO fires on iOS Safari (requires user gesture unlock)**
- [ ] **Web Speech API: verify en-IN male voice available or graceful fallback on target devices**

#### **S22 Content Review**
- [ ] All 6 region ganeshaFact strings verified
- [ ] 12 festival ganeshaReact strings verified
- [ ] origin_card story text verified
- [ ] Need cultural accuracy review before shipping

#### **S22 Language Scripts**
- [ ] Verify all 12 language script labels render without tofu boxes on target devices

### 9C · QA & UX Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Tester | | | PENDING |
| Senior UI/UX Reviewer | | | PENDING |
| Product Owner / Madhurima | | | PENDING |

**Freeze only after ALL red bold rows are ✓ and all 3 signatures obtained.**  
**Any FAIL on a blocker = no ship.**

---

## Notes
- Mark items with `[x]` as you complete them
- Focus on RED BOLD items first — these are blockers
- Update as you test each scene
