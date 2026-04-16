# Scene 20 & 21 Technical Deep Dive
## Favorite Food & Dreams & Wishes — Phase Maps, Reload Behavior, VO Checklist

---

# SCENE 20 — FAVORITE FOOD (Favoritefoodgame.jsx)

## Phase Map

```
intro
  ↓ (VO: opening)
food-choice → food-correct → color-choice
color-choice → color-correct → activity-choice
activity-choice → activity-correct → friend-choice
friend-choice → friend-correct → child-intro
  ↓ (VO: transition to child section)
child-food-choice → child-color-choice → child-activity-choice → child-friend-input 
  ↓
friend-celebration → comparison-card → complete
```

## Reload Behavior — PRESERVE Progress Pattern

### Ganesha Choice Phases
**Phases:** food-choice, color-choice, activity-choice, friend-choice

- **Reload mid-phase** → restart same phase, replay phase VO, reset idle hints (lines 547-562)
- No resume popup shown
- idleHintLevel resets to 0
- All choice buttons re-enabled

### Child Input Phases
**Phases:** child-food-choice, child-color-choice, child-activity-choice, child-friend-input

- **Reload** → auto-advance if already completed (lines 564-585)
- Otherwise stay in phase + replay VO
- Preserve selected values (childFood, childColor, childActivity, childFriendName)

### Drawing/Text Modal Reload
**Modals:** 'food-draw', 'food-type', 'activity-draw', 'activity-type'

- Reload → restore drawing pad/text input at exact modal state (lines 530-545)
- Canvas state preserved in modal
- No progress loss

### Resume Behavior
- **No resume popup shown** (unlike Scene 22)
- Seamless continuation
- Phase restarts cleanly with VO

## Tab-Switch Behavior

### Hook Configuration
**usePauseAwareTimeout** (line 277-293)

```javascript
const { safeSetTimeout: scheduleTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
  onHide: () => {
    stopVoice();
    stopSpokenVoice();
    setShowCelebration(false);
  },
  onShow: () => {
    if (phaseVoiceRef.current?.skip) return; // Skip VO on return
    onReturnHint(); // Play return hint
    setShowCelebration(true);
  },
  resumeDelay: RESUME_DELAY_MS
});
```

**Actions on tab visibility change:**
- **onHide:** stops all VO (stopVoice + stopSpokenVoice), pauses celebration, clears phaseVoiceRef
- **onShow:** resumes celebration, calls onReturnHint(), resets idle hints
- **Resume delay:** RESUME_DELAY_MS = 3000ms (3 seconds)

## Idle Hint System

### Status
**PARTIAL** — Scene 20 = Ganesha choice phases ONLY  
**T27 gap in child phases** (child-food-choice, child-color-choice, child-activity-choice, child-friend-input have NO hints yet)

### Phases with Hints
- food-choice
- color-choice
- activity-choice
- friend-choice

### Idle Hint Levels

```
Level 0: none (no hint)
Level 1: wobble (setIdleHintLevel(1)) — 6s
Level 2: glow (setIdleHintLevel(2)) — 6s after wobble
Level 3: VO hint + pointer emoji (setIdleHintLevel(3), showPointerHint = true) — 15s after glow
Level 4: sparkle (setIdleHintLevel(4)) — 22s total
```

### Timing
- **6s:** wobble on correct option
- **12s:** glow on correct option
- **27s:** VO hint plays + pointer emoji shows on correct option
- **34s:** sparkle + final celebration

### Reset Triggers
- Any user tap/interaction via resetIdleHints()
- Phase change
- Tab return via onShow callback

## Hooks Used

### useVoiceGuidance() (line 237-245)
```javascript
const { 
  speakLine, 
  isPlayingHint, 
  onReturnHint, 
  stopVoice 
} = useVoiceGuidance({
  idleTimeout: 20, // seconds
  resumeDelay: RESUME_DELAY_MS, // 3000ms
  enableMusic: true
});
```

Manages:
- Idle hint timers
- Background music
- VO replay after resume
- Return hint on tab return

### usePauseAwareTimeout() (line 277-293)
- Pause/resume all pending timeouts on tab visibility
- Critical for idle hint timers
- Prevents duplicate timers on tab return

### useResumeCountdown() (line 271)
- Countdown display (NOT shown as popup in S20)
- Manages 3s resume delay timer

### useGameSounds()
- UI tap SFX
- Wrong tap SFX
- Sparkle SFX
- Chime SFX

### useGaneshaVoice()
- TTS voice for VO lines
- Voice settings by age/style

### useAudioPreference()
- Audio ON/OFF toggle state
- Persists across scenes

## VO Checklist (18+ lines)

| Trigger | VO Line | Phase |
|---------|---------|-------|
| Scene intro | "Let's find my favorite things and yours!" | intro |
| Food phase enters | "Hmm... can you guess my favourite food?" → "Tap the one you think I love." (2-part) | food-choice |
| Food correct | "Yes! Modak is my favourite. Sweet and yummy!" | food-correct |
| Color phase enters | "Can you guess my favourite color?" | color-choice |
| Color correct | "Yes! Yellow is my favourite color, bright like the sun!" | color-correct |
| Activity phase enters | "Can you guess my favourite activity?" | activity-choice |
| Activity correct | "Yes! I love to dance. It makes me so happy!" | activity-correct |
| Friend phase enters | "Can you guess who my best friend is?" | friend-choice |
| Friend correct | "Yes! Mooshika is my little mouse friend!" | friend-correct |
| Transition to child | "Now let's discover your favorite things! It's your turn. Tell me what makes you special." | child-intro |
| Food choice (child) | "What's your favorite food?" | child-food-choice |
| Color choice (child) | "What's your favorite color?" | child-color-choice |
| Activity choice (child) | "What do you love to do?" | child-activity-choice |
| Friend input (child) | "Who is your best friend?" | child-friend-input |
| Comparison card | "Now we know each other better. I'm happy we're friends!" | comparison-card |
| Idle hints (Ganesha phases) | 4 phase-specific hints (food/color/activity/friend) | *-choice @ 27s |

## Asset Audit

### Choice Cards

**Ganesha Foods (3 items):**
- modak
- ladoo
- barfi

**Kid Foods (7 items):**
- pizza
- burger
- icecream
- noodles
- fruit
- dosa
- rice

**Colors (8 items):**
- red, orange, yellow, green, blue, purple, pink, brown

**Activities (6 items):**
- drawing
- music
- reading
- playing
- TV
- dancing

**Animals (3 items):**
- mouse, cow, peacock

**Icons:**
- food-icon, color-icon, sports-icon

**UI:**
- draw canvas
- text input keyboard
- comparison card layout

### Ganesha Assets
- babyGaneshaImg
- babyGaneshaSit

### Background
- fav_background.jpg

## Production Blockers

- ❌ Drawing modal loses state on mid-draw reload → Blocked by T27 (currentModal persistence)
- ❌ Text input (friend name) validation missing → Check childFriendName !== ''
- ❌ Auto-transition timer (friend-celebration → comparison-card) @ 2000ms — may fire during pause
- ❌ Idle hint VO plays during muted state (check isAudioOn in speakLine)

## Edge Cases

| Scenario | Expected | Current State |
|----------|----------|---------------|
| Reload mid food-choice | Restart food-choice, replay VO, reset idle | ✓ |
| Reload in food-draw modal | Restore drawing pad | ✓ |
| Tab-switch during food-choice, return 5s later | Replay food question VO after 3s delay | ✓ |
| Child completes food but reloads before color phase | Auto-advance to color-choice | ✓ |
| Unmute audio while idle hint VO is queued | VO should play from queue | Need verify |

---

# SCENE 21 — DREAMS & WISHES (ObstacleRemoverGame.jsx)

## Phase Map

```
intro
  ↓ (VO: opening)
wish1-intro → wish1-active (bubble tapping)
  ↓ wish1 counter reaches threshold
wish1-complete
  ↓ auto-transition
wish2-intro → wish2-active (drag/drop food to plates)
  ↓ all plates full (bowlStates all true)
wish2-complete
  ↓ auto-transition
wish3-intro → wish3-active (tap forest spots)
  ↓ all spots revealed (parkStates all true)
wish3-complete
  ↓ auto-transition
all-wishes-complete
  ↓ (VO: transition to dream section)
dream-drawing (child draws) → dream-clouded (trunk tapping) 
  ↓
dream-clearing → dream-revealed
  ↓
comparison-card
  ↓
ending → complete
```

## Reload Behavior — RESTART Intro Pattern

### Drawing Modal Reload
**State:** currentModal === 'drawing'

- Reload → restart from all-wishes-complete with resume popup
- Message: "Let's start your drawing again!"
- Lines: 493-505

### Intro Phase Reload
**Phases:** wish1-intro, wish2-intro, wish3-intro

- Reload → restart same intro phase with resume popup
- Message: "Let's try that again!"
- Replay intro VO
- Reset counters
- Lines: 507-533

### Active Phase Reload
**Phases:** wish1-active, wish2-active, wish3-active

- **Critical:** Reload → jump BACK to intro, reset counter
- Message: "Let's try that again!"
- wish1Taps = 0, wish2Bowls reset, wish3Parks reset
- Lines: 535-565

### Complete/End Phase Reload
**Phases:** wish1-complete, wish2-complete, wish3-complete, all-wishes-complete

- Reload → resume at exact phase WITHOUT popup
- No restart required
- Continue from where left off

### Resume Popup Timing
- Shown for 3000ms (3 seconds)
- Auto-dismisses
- Does not block gameplay

## Tab-Switch Behavior

### Hook Configuration
**usePauseAwareTimeout** (line 299-316)

```javascript
const { safeSetTimeout: scheduleTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
  onHide: () => {
    stopVoice();
    stopSpokenVoice();
    setShowCelebration(false);
  },
  onShow: () => {
    // useVoiceGuidance already handles return hint after resumeDelay
    setShowCelebration(true);
  },
  resumeDelay: RESUME_DELAY_MS
});
```

**Actions on tab visibility change:**
- **onHide:** stops all VO, pauses celebration, clears phaseVoiceRef
- **onShow:** resumes celebration (does NOT call onReturnHint — useVoiceGuidance already handles it after resumeDelay)
- **Resume delay:** RESUME_DELAY_MS = 3000ms (3 seconds)

## Idle Hint System

### Status
**PARTIAL** — Scene 21 = intro phases ONLY  
**T27 gaps in active phases** (wish1-active, wish2-active, wish3-active have NO idle hints)

### Phases with Hints
- wish1-intro
- wish2-intro
- wish3-intro

### State per Wish

```javascript
wish1IdleLevel (0-3: none → glow → sparkle → VO hint)
wish2IdleLevel
wish3IdleLevel

// Track which VO flags have fired
idleVoFlagsRef.current {
  wish1Level2: false,
  wish1Level3: false,
  wish2Level2: false,
  wish2Level3: false,
  wish3Level2: false,
  wish3Level3: false
}
```

### Idle Hint Levels

```
Level 0: none (no hint)
Level 1: glow on correct option
Level 2: sparkle + prepare to play VO hint
Level 3: VO hint plays
```

### Timing
- **IDLE_HINT_DELAY_MS = 15000ms (15 seconds before first hint)**
- After 15s with no interaction: glow appears
- After another delay: sparkle + pointer
- After another delay: VO hint plays

### Reset Triggers
- Any user interaction via markInteraction()
- Phase change via resetIdleHintsForActiveWish()
- Tab return via onShow callback → setReturnHintNonce increment

## Hooks Used

### useVoiceGuidance() (line 259-267)
```javascript
const { 
  speakLine, 
  isPlayingHint, 
  onReturnHint, 
  stopVoice 
} = useVoiceGuidance({
  idleTimeout: 20, // seconds
  resumeDelay: RESUME_DELAY_MS, // 3000ms
  enableMusic: true
});
```

Manages:
- Idle timers
- Background music
- VO replay after resume
- Return hint on tab return

### usePauseAwareTimeout() (line 299-316)
- Pause/resume all pending timeouts on tab visibility
- Critical for wish1/2/3 active phase timers (bubble spawn, plate fill, spot reveal)
- Prevents duplicate timers on tab return

### useResumeCountdown() (line 293)
- Countdown display for resume popup
- Manages 3s countdown before resuming

### useGameSounds()
- UI tap SFX
- Sparkle SFX
- Chime SFX

### useGaneshaVoice()
- TTS voice for VO lines
- Voice settings by age/style/moment

## VO Checklist (15+ lines)

| Trigger | VO Line | Phase |
|---------|---------|-------|
| Scene intro | "Let's discover my dreams and yours." | intro |
| Wish 1 intro | "I have three giant wishes for the whole world! Will you help me make them come true?" | wish1-intro |
| Wish 1 active (start) | "My wish is for a kinder world. Tap the bubbles that show kind actions!" | wish1-active |
| Wish 1 complete | "The Earth is smiling. Thank you for helping the world." | wish1-complete |
| Wish 2 intro | "My second wish… is to share our food. So no one stays hungry." | wish2-intro |
| Wish 2 active (start) | "My next wish is to share our food. Drag the food to the plates so everyone can eat." | wish2-active |
| Wish 2 complete | "Wonderful! The bowls are full. Sharing makes everyone happy." | wish2-complete |
| Wish 3 intro | "My last wish… is for a green world full of life. Let's help this forest grow!" | wish3-intro |
| Wish 3 active (start) | "My last wish is for a green world. Tap the spots on the land and help the garden grow." | wish3-active |
| Wish 3 complete | "Wow! The forest is full of life. You helped nature grow." | wish3-complete |
| All wishes complete → dream draw | "You made the world brighter. Now it's your turn. Draw your happy wish." | all-wishes-complete |
| Dream drawing phase | "What would you draw?" | dream-drawing |
| Dream clouded (trunk tapping) | "Your dream is beautiful… but clouds are hiding it. Tap my trunk to clear them." | dream-clouded |
| Dream clearing (mid-tap) | "Keep tapping my trunk to clear the clouds!" | dream-clearing |
| Dream revealed | "There it is… your dream. Dream big, little friend. I believe in you." | dream-revealed |
| Comparison card | "My wishes… and your dream… When we help each other… dreams grow stronger." | comparison-card |
| Ending | "Dream big, little friend. I'm always cheering for you." | ending |

## Asset Audit (Grouped)

### Wish Icons (6 items)
- wish-icon-earth
- wish-icon-flower
- wish-icon-share
- heart-icon
- shootingstar-icon
- world-icon

### Wish Images

**Wish 1 Earth states (2 items):**
- wish-earth-sad
- wish-earth-happy

**Wish 2 Bowls (3 items):**
- wish-bowl-empty
- wish-bowl-full
- plate

**Wish 3 Forest (4 backgrounds):**
- wish-forest-1
- wish-forest-2
- wish-forest-3
- wish-forest-4

### Wish 1 Bubbles (8 action images)

**Kind actions (4 items):**
- helping
- sharing
- hugging
- gifting

**Unkind actions (4 items):**
- angry
- fighting
- hitting
- teasing

### Wish 2 Drag Items (7 foods)
Positioned via WISH2_FOOD_POSITIONS object:
- apple
- banana
- bread
- broccoli
- carrot
- milk
- rice

### Wish 3 Spots (3 nature elements)
From parkStates[3]:
- Grass
- butterfly
- slide

### Companion Animals (3 items)
Reused from Scene 20:
- mouse
- cow
- peacock

### Ganesha Assets
- babyGaneshaImg
- babyGaneshaSit
- cloud

### Background
- dream_background.jpg

## Production Blockers

- ❌ Bubble spawn logic may overlap on reload — no deduplication check
- ❌ wish1-active tap counter (wish1Taps) not reset on tab-switch, only on reload
- ❌ Drag/drop collision detection on plates — verify accept/reject boundaries
- ❌ Dream revealed state (dreamRevealed) not persisted to localStorage
- ❌ Trunk tap counter (trunkTaps) may not clear on phase transition

## Edge Cases

| Scenario | Expected | Current State |
|----------|----------|---------------|
| Reload in wish1-active (mid-bubble tapping) | Jump to wish1-intro, reset wish1Taps | ✓ |
| Reload in dream-drawing modal | Resume at all-wishes-complete, show 3s popup | ✓ |
| Tab-switch during wish2-active, return after 10s | Resume wish2-active, bubble state preserved | ✓ |
| Child drags food, tab-switch mid-drag | Drag state unclear — may revert | Need verify |
| Reload at dream-revealed, check dreamRevealed flag | Flag should persist via sceneState | Check localStorage |
| Unmute audio during wish1-active intro VO | VO should not re-trigger | Need verify |

---

## Summary

**Scene 20:** 16 phases, partial idle hints (Ganesha only), NO resume popup, 18+ VO lines, 7 food choices per child  
**Scene 21:** 17 phases, partial idle hints (intro only), resume popup on reload, 17+ VO lines, 3-phase wish structure with 3 interactive mechanics (bubble tap, drag-drop, forest reveal)

Both scenes use **usePauseAwareTimeout** for tab-switch resilience and **useVoiceGuidance** for idle hint management.

Production blockers must be cleared before freeze.
