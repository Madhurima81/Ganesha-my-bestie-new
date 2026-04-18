# ABOUT ME HUT — ZONE 5
## Comprehensive Production Freeze Checklist

**Date:** 2026-04-15  
**Role:** Senior UI/UX Developer + QA  
**Scope:** Zone 5 — About Me Hut (Scenes 19–22)  
**Status:** Ready for Production Freeze Review

---

## LEGEND
- **RED BOLD** = PRODUCTION BLOCKER — Must pass before any deployment. Cannot hotfix post-launch.
- **Regular** = Quality Pass — Important but recoverable with a post-launch hotfix.

---

## SECTION 1 — SHARED CHROME (all 4 scenes)

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

---

## SCENE 20 — FAVORITE FOOD (Favoritefoodgame.jsx)

**Status:** FULLY MAPPED — 16 phases in NAVIGATION.md. Run manual pass to mark each row.

**Phases (16 total):** intro, food-choice, food-correct, color-choice, color-correct, activity-choice, activity-correct, friend-choice, friend-correct, child-intro, child-food-choice, child-color-choice, child-activity-choice, child-friend-input, friend-celebration, comparison-card

### 20A · PHASES
- [ ] All 16 phases present and navigating correctly

### 20B · TAB SWITCH — PRODUCTION BLOCKER
- [ ] **Ganesha choice phases: tab return → phase restarts with VO + idle hints re-running**
- [ ] **color-choice after wrong click: wrong choices reset on return**
- [ ] **Child input phase (no selection yet): remains in same child phase, VO replay only**
- [ ] **food-draw modal open + tab return: modal restores with draft drawing**
- [ ] **activity-type modal open + tab return: modal restores with draft text**
- [ ] **No duplicate VO spam after any tab return**

### 20C · RELOAD / CONTINUE — PRODUCTION BLOCKER
**Design rule:** no resume popup in any phase. Child phases auto-advance if step already complete.

- [ ] **Reload in any Ganesha phase → phase restarts with VO only, no popup**
- [ ] **Child food already selected + reload → auto-advance to child-color-choice**
- [ ] **Child color already selected + reload → auto-advance to child-activity-choice**
- [ ] **Child activity already selected + reload → auto-advance to child-friend-input**
- [ ] **Child friend already entered + reload → moves to friend-celebration**
- [ ] **Completion 'Next Scene' → next scene; 'Replay' → full scene reset**

### 20D · IDLE HINTS
- [ ] Idle ladder in Ganesha phases: wobble → glow → VO → sparkle + pointer
- [ ] **Pointer emoji ONLY at hint level 3, on correct option, auto-hides on tap**
- [ ] Wrong click resets idle timer cycle
- [ ] No idle hints in child input phases (or gentle low-priority nudge only)

### 20E · CORE MECHANICS
- [ ] Circle tap → Opens choice modal for that slot
- [ ] Correct food choice → Sparkle + VO, advances to food-correct phase
- [ ] Wrong food choice → Gentle wiggle, user can retry, no progress lost
- [ ] Color choice sequence → After food correct, child selects favorite color
- [ ] Activity choice sequence → After color correct, child selects favorite activity
- [ ] Friend/animal choice sequence → After activity correct, child selects best friend
- [ ] child-intro transition → All 4 Ganesha phases complete → transition to child section
- [ ] Child food selection → Child picks from 7 food options, advance enabled
- [ ] Child color selection → Child picks favorite color, auto-advance to child-activity-choice
- [ ] Child activity selection → Child picks favorite activity, auto-advance to child-friend-input
- [ ] Friend name input → Child types best friend name, name persists to comparison card
- [ ] friend-celebration auto-advance → 2s celebration → auto-advance to comparison-card
- [ ] Comparison card shows → Ganesha's 4 favorites + Child's 4 favorites displayed side-by-side
- [ ] Completion → comparison-card complete → SceneCompletionCelebration, ProgressManager called

### 20F · VOICE & VO CHECKLIST
- [ ] Intro / opening modal VO → Scene opens with greeting
- [ ] Food phase entry VO → "Hmm... can you guess my favourite food?" + "Tap the one you think I love."
- [ ] Food correct VO → "Yes! Modak is my favourite. Sweet and yummy!"
- [ ] Color phase entry VO → "Can you guess my favourite color?"
- [ ] Color correct VO → "Yes! Yellow is my favourite color, bright like the sun!"
- [ ] Activity phase entry VO → "Can you guess my favourite activity?"
- [ ] Activity correct VO → "Yes! I love to dance. It makes me so happy!"
- [ ] Friend phase entry VO → "Can you guess who my best friend is?"
- [ ] Friend correct VO → "Yes! Mooshika is my little mouse friend!"
- [ ] Transition VO → "Now let's discover your favorite things! It's your turn. Tell me what makes you special."
- [ ] Child food entry VO → "What's your favorite food?"
- [ ] Child color entry VO → "What's your favorite color?"
- [ ] Child activity entry VO → "What do you love to do?"
- [ ] Child friend entry VO → "Who is your best friend?"
- [ ] Comparison card VO → "Now we know each other better. I'm happy we're friends!"
- [ ] Idle hint VO (Ganesha phases) → 4 phase-specific hints at 27s
- [ ] Return hint VO → Tab return in any phase — contextual to phase
- [ ] Tap SFX → All card taps — consistent, not clipping
- [ ] Sparkle SFX → Correct choices + friend-celebration
- [ ] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**

### 20G · VISUAL ASSETS CHECKLIST
- [ ] Background (fav_background.jpg) — No 404, full viewport
- [ ] Ganesha food cards (modak, ladoo, barfi) — All load, visible
- [ ] Child food cards (pizza, burger, icecream, noodles, fruit, dosa, rice) — All 7 load
- [ ] Color options (red, orange, yellow, green, blue, purple, pink, brown) — All 8 load
- [ ] Activity icons (drawing, music, reading, playing, TV, dancing) — All 6 load
- [ ] Friend animals (mouse, cow, peacock) — All 3 load
- [ ] Baby Ganesha SVG — Loads from shared path, correct size
- [ ] Opening modal image — Scene-appropriate, no 404
- [ ] Completion modal icons (food, color, activity) — All load
- [ ] Sparkle/confetti layer — Renders above gameplay, celebratory

---

## SCENE 21 — DREAMS & WISHES (ObstacleRemoverGame.jsx)

**Status:** FULLY MAPPED — T38, T39, T40 implemented. Verify edge cases below.

**Phases (18 total):** intro, wish1-intro, wish1-active, wish1-complete, wish2-intro, wish2-active, wish2-complete, wish3-intro, wish3-active, wish3-complete, all-wishes-complete*, dream-drawing, dream-clouded, dream-clearing, dream-revealed, comparison-card, ending

*all-wishes-complete merged with dream-intro (T40) — skips dream-intro phase, goes straight to drawing.*

### 21A · PHASES
- [ ] All 18 phases present and navigating correctly

### 21B · TAB SWITCH — PRODUCTION BLOCKER
- [ ] **Tab switch during wish1-active (bubbles spawning) → return → bubbles resume at correct state, no duplicate timers**
- [ ] **Tab switch during dream-clouded (countdown) → return → countdown resumes remaining time, no duplicate timers**
- [ ] **No duplicate voice calls after any tab return in any phase**
- [ ] **No stuck animations (spinning, pulsing) after tab return**

### 21C · RELOAD / CONTINUE (T38 + T39) — PRODUCTION BLOCKER
**Design rule:** reload in intro phases restarts that phase. Reload in active phases jumps BACK to that wish's intro and resets counter.

- [ ] **Reload in wish1-intro → restarts wish1-intro with VO replay**
- [ ] **Reload mid-wish1-active (3 bubbles tapped) → back to wish1-intro, counter = 0, VO replays**
- [ ] **Same restart logic for wish2 and wish3 active phases**
- [ ] **Reload in dream-clouded mid-countdown → dream-clouded resumes at ~remaining time, no duplicate timers**
- [ ] **Reload with drawing modal open → resumes IN modal with VO (does not restart dream-drawing)**
- [ ] **T39 fix: return hint clears only phase-specific VO key — subsequent VOs still trigger (no stale keys)**
- [ ] **T40 fix: all-wishes-complete fires single combined modal, NO separate dream-intro modal ever shows**

### 21D · IDLE HINTS
- [ ] Idle hints active in wish1/2/3-active and dream-clouded/clearing via getPhaseReminderLine()
- [ ] IDLE_HINT_DELAY_MS = 15s with no interaction (markInteraction resets timer)
- [ ] wish1-active 15s no tap → 'Keep tapping the kind bubbles...'
- [ ] dream-clouded 15s no interaction → 'The dream is becoming clear...'

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
- [ ] Intro / opening modal VO → "Let's discover my dreams and yours."
- [ ] wish1-intro VO → "I have three giant wishes for the whole world! Will you help me make them come true?"
- [ ] wish1-active entry VO → "My wish is for a kinder world. Tap the bubbles that show kind actions!"
- [ ] wish1-complete VO → "The Earth is smiling. Thank you for helping the world."
- [ ] wish2-intro VO → "My second wish… is to share our food. So no one stays hungry."
- [ ] wish2-active entry VO → "My next wish is to share our food. Drag the food to the plates so everyone can eat."
- [ ] wish2-complete VO → "Wonderful! The bowls are full. Sharing makes everyone happy."
- [ ] wish3-intro VO → "My last wish… is for a green world full of life. Let's help this forest grow!"
- [ ] wish3-active entry VO → "My last wish is for a green world. Tap the spots on the land and help the garden grow."
- [ ] wish3-complete VO → "Wow! The forest is full of life. You helped nature grow."
- [ ] all-wishes-complete transition VO → "You made the world brighter. Now it's your turn. Draw your happy wish."
- [ ] dream-drawing prompt VO → "What would you draw?"
- [ ] dream-clouded entry VO → "Your dream is beautiful… but clouds are hiding it. Tap my trunk to clear them."
- [ ] dream-clearing nudge VO → "Keep tapping my trunk to clear the clouds!"
- [ ] dream-revealed VO → "There it is… your dream. Dream big, little friend. I believe in you."
- [ ] Comparison card VO → "My wishes… and your dream… When we help each other… dreams grow stronger."
- [ ] Ending VO → "Dream big, little friend. I'm always cheering for you."
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

### 22D · IDLE HINTS (T27 — PARTIALLY IMPLEMENTED)
**T27 is still PENDING in TASKS.md.** ganesha_home has idle hints; other phases do not yet.

- [ ] ganesha_home: ganeshaHomeIdleLevel 0→1→2→3 — glow → repeating glow → steady glow (idleGlowSteady animation)
- [ ] ganesha_home idle level 3: undiscovered location icons animate with idleWobble
- [ ] ganesha_home interaction: setGaneshaHomeIdleLevel(0) resets on discovery
- [ ] **child_home: idle hint MISSING — child may stall on region selection (T27 gap)**
- [ ] **language_ganesha: idle hint MISSING — child may stall on guess (T27 gap)**
- [ ] **festivals_ganesha: idle hint MISSING — child may stall on guess (T27 gap)**
- [ ] **language_child / festivals_child: gentle idle nudge needed when child hasn't made min selection**

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
- [ ] **Wrong guess: shake animation feels gentle, not harsh**
- [ ] Correct guess: glow + sparkle feedback is satisfying and immediate
- [ ] **Language / festival selected state is visually clear**
- [ ] **Language cap (3) and festival cap (4) enforced — clear feedback when limit reached**
- [ ] Continue button enables/disables correctly based on required selections
- [ ] Text contrast readable on all backgrounds and in all phases
- [ ] Z-index correct: modal > sparkle > overlay > gameplay
- [ ] All tap targets ≥ 60 px — region cards, language cards, festival cards all touchable
- [ ] Mobile: cards grid scrolls or wraps without overflow
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
| Tab Switch | ✓ EXISTS | ✓ EXISTS | ✓ EXISTS | ✓ EXISTS |
| Continue / Resume | ✓ EXISTS | ✓ EXISTS | ✓ EXISTS | ✓ EXISTS |
| Idle Hints (T27) | PARTIAL* | ✓ EXISTS | ✓ EXISTS | PARTIAL* |
| Voice & VO | ■ | ■ | ■ | ■ |
| Content Accuracy | — | — | — | ■ |
| UX Polish | ■ | ■ | ■ | ■ |
| Mobile Responsive | ■ | ■ | ■ | ■ |
| Edge Cases | ■ | ■ | ■ | ■ |
| Progress Persistence | ■ | ■ | ■ | ■ |

*PARTIAL = active in ganesha_home / ganeshaTree only. Other phases still need T27 implementation.*

---

## SECTION 9 — FINAL SIGN-OFF

### 9A · Pre-Launch Gates (every row must be ✓)
- [ ] **S19 freeze complete — all sections above marked Pass**
- [ ] **S20 freeze complete — all 15 NAVIGATION.md checklist items manually verified**
- [ ] **S21 freeze complete — T38, T39, T40 edge cases verified**
- [ ] **S22 freeze complete — all sections above including content + VO + assets**
- [ ] **Cross-zone: all 4 scenes chain, progress persists, audio pref syncs**
- [ ] **Desktop (1280×800): no console errors, no network 404s**
- [ ] **Mobile (375×812): all tap targets work, no overflow, keyboard safe**
- [ ] **Audio: all VO lines trigger, toggle mutes immediately, no overlaps**
- [ ] **Edge cases: rapid tap, tab switch, reload, rotate all stable**
- [ ] **T14 VO MP3 files: all lines recorded, in /public/audio, matched to triggers**
- [ ] **T15 SFX finalized: tap, chime, sparkle balanced and not clipping**
- [ ] **T27 Idle hints: implemented in ALL phases for all 4 scenes**
- [ ] **T28 Ganesha gestures: mapped per scene phase, sparkle timing correct**

### 9B · Outstanding Action Items

#### **T27 — Idle Hints (BLOCKER)**
- [ ] S19 missing in childInput
- [ ] S22 missing in child_home, language_ganesha, language_child, festivals_ganesha, festivals_child
- [ ] Must implement before freeze

#### **T28 — Ganesha Gestures**
- [ ] About Me scenes (19–22) need gesture map per phase — point, celebrate, wave minimum

#### **T14/T15/T16 — Audio Files**
- [ ] All VO and SFX must be recorded, named, and placed in /public/audio
- [ ] Checklist cannot fully clear until files exist

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
