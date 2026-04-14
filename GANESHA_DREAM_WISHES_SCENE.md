# Ganesha Dream Wishes — Scene Build Spec

## Overview

This is a multi-part story scene where Ganesha shares three wishes for the world and the child helps make them come true. After completing all three wishes, the child draws their own dream. This scene lives in the About Me Hut zone (Zone 5).

**File to create:** `src/zones/zone5-about-me-hut/GaneshaWishesScene.jsx`

**Scene ID:** `ganesha-wishes`

---

## Tech Stack Reminders

- Functional component, no TypeScript

- Fonts: `'Baloo 2', cursive` for all headings, titles, buttons — `'Nunito', sans-serif` for all body text, instructions, labels
- Touch targets minimum 60x60px on all interactive elements
- No hover states — touch first
- useSceneReset hook wired up
- SceneCompletionCelebration on final win
- ProgressManager.updateProgress() on completion
- Mute button present — audio must not autoplay before user interaction



## Scene Flow — State Machine

```
INTRO
  ↓
WISH_1_ACTIVE — Ganesha VO plays as game loads, bubbles appear after 2s
  ↓
WISH_1_COMPLETE
  ↓
WISH_2_ACTIVE — same pattern
  ↓
WISH_2_COMPLETE
  ↓
WISH_3_ACTIVE — same pattern
  ↓
WISH_3_COMPLETE
  ↓
TRANSITION_TO_DREAM
  ↓
DREAM_DRAW
  ↓
TRANSITION_TO_REVEAL
  ↓
CLOUD_CLEAR
  ↓
DREAM_REVEAL
  ↓
SCENE_COMPLETE

Use a single `phase` state string to drive all rendering. No nested state machines.

```jsx
const [phase, setPhase] = useState('INTRO')
```

---

## Phase 1 — INTRO

**Layout:**
- Ganesha illustration centred, floating animation (translateY -10px loop, 3s ease-in-out)
- Speech bubble below Ganesha
- One button

**VO line:** `"I have three wishes for the world. Will you help me make them come true?"`

**Text display:** Show VO text inside speech bubble for all ages (this is a story moment, not active play)

**Button:** `Let's Help` → sets phase to `WISH_1_INTRO`

**Button style:** Gold gradient, Baloo 2, 18px, 54px height minimum, pill shape

---

## Phase 2 — WISH_1_INTRO

**Layout:**
- Ganesha smaller, top of screen
- Speech bubble with wish intro text
- Sad scene preview below (3 sad character emojis in a row — child, adult, animal)
- Button to start game

**VO line:** `"My first wish is a kind and happy Earth."`

**Speech bubble text:** Same as VO

**Sad characters shown:** 😢👦 😢👩 😢🐘 — greyscale filter applied

**Button:** `Help Ganesha` → sets phase to `WISH_1_GAME`

---

## Phase 3 — WISH_1_GAME — Bubble Tap

**Mechanic:** Bubbles float upward. Tap kind action bubbles. Avoid unkind ones. 3 correct taps complete the wish.

**State needed:**
```jsx
const [correctTaps, setCorrectTaps] = useState(0)  // target: 3
const [bubbles, setBubbles] = useState([])           // active bubbles on screen
const [happyCount, setHappyCount] = useState(0)     // characters lit up: 0-3
```

**Bubble data — Kind actions (tap these):**
```js
const kindBubbles = [
  { id: 'k1', emoji: '🤝', label: 'Help a friend' },
  { id: 'k2', emoji: '🍱', label: 'Share food' },
  { id: 'k3', emoji: '🤗', label: 'Comfort someone' },
  { id: 'k4', emoji: '💧', label: 'Water a plant' },
  { id: 'k5', emoji: '🎁', label: 'Give a gift' },
]
```

**Bubble data — Unkind actions (avoid these):**
```js
const unkindBubbles = [
  { id: 'u1', emoji: '😤', label: 'Push someone' },
  { id: 'u2', emoji: '🙈', label: 'Ignore someone' },
  { id: 'u3', emoji: '🗑️', label: 'Litter' },
]
```

**Bubble generation:**
- Spawn a new bubble every 1.8 seconds
- Each bubble gets a random x position (10% to 80% of screen width)
- Bubbles float upward using CSS animation (translateY from bottom to -120px, 4s linear)
- Remove bubble from state after animation ends
- Mix kind and unkind randomly — roughly 60% kind, 40% unkind

**Bubble tap behaviour:**
- Correct tap (kind): bubble pops with green burst, correctTaps + 1, happyCount + 1, one sad character becomes happy (apply happy class by index)
- Wrong tap (unkind): bubble wobbles and disappears, no penalty, no counter change
- Sound: correct = soft chime, wrong = gentle wobble sound (Web Audio API)

**Characters row:**
- Show 3 characters at top of game area
- Characters start greyscale
- Each correct tap lights up one character (remove greyscale, scale pop animation)

**Win condition:** correctTaps === 3 → stop spawning bubbles → show Ganesha celebration line → after 2s set phase to `WISH_1_COMPLETE`

**Ganesha win line VO:** `"When we help each other, the Earth becomes happy."`

---

## Phase 4 — WISH_1_COMPLETE

- All 3 characters shown happy and animated
- Earth emoji glowing (use filter: brightness animation)
- Ganesha celebration line displayed in speech bubble
- After 2.5s auto-advance to `WISH_2_INTRO`
- No button needed — auto transition feels more story-like

---

## Phase 5 — WISH_2_INTRO

**VO line:** `"My second wish is that everyone has food."`

**Speech bubble text:** Same as VO

**Preview:** Show 3 empty bowl emojis 🥣🥣🥣

**Button:** `Fill the Bowls` → sets phase to `WISH_2_GAME`

---

## Phase 6 — WISH_2_GAME — Drag to Fill

**Mechanic:** 3 empty bowls at bottom. Food items float slowly across screen. Child drags food into any bowl. All 3 bowls filled = wish complete.

**State needed:**
```jsx
const [bowlsFilled, setBowlsFilled] = useState([false, false, false])
const [dragItem, setDragItem] = useState(null)  // currently dragged item id
```

**Food items:**
```js
const foodItems = [
  { id: 'f1', emoji: '🫓', label: 'Bread' },
  { id: 'f2', emoji: '🍎', label: 'Apple' },
  { id: 'f3', emoji: '🍚', label: 'Rice' },
  { id: 'f4', emoji: '🥕', label: 'Carrot' },
  { id: 'f5', emoji: '🫙', label: 'Modak' },
  { id: 'f6', emoji: '🍌', label: 'Banana' },
]
```

**No unkind/wrong items in this game.** All floating items are valid food. Challenge comes purely from the drag gesture.

**Drag implementation:**
- Use onPointerDown, onPointerMove, onPointerUp for touch compatibility
- Dragged item follows finger/cursor position
- Bowls have a drop zone — detect overlap between dragged item position and bowl bounds using getBoundingClientRect
- On valid drop over an unfilled bowl: bowl fills (swap empty emoji for full emoji + glow), food item disappears, play drop sound
- On drop over already-filled bowl: item returns to original position with gentle bounce
- Food items that are not dragged float slowly left to right across screen (CSS animation)
- Respawn floating items after they leave screen

**Bowl states:**
```js
// Empty
{ emoji: '🥣', filled: false }
// Filled
{ emoji: '🍲', filled: true, glowing: true }
```

**Win condition:** All 3 bowls filled → play celebration sound → show Ganesha win line → after 2s set phase to `WISH_2_COMPLETE`

**Ganesha win line VO:** `"Sharing food fills hearts with joy."`

---

## Phase 7 — WISH_2_COMPLETE

- 3 filled glowing bowls shown
- Warm glow animation on bowls (box-shadow pulse)
- Ganesha line in speech bubble
- After 2.5s auto-advance to `WISH_3_INTRO`

---

## Phase 8 — WISH_3_INTRO

**VO line:** `"My third wish is for nature to grow strong."`

**Speech bubble text:** Same as VO

**Preview:** Show dull grey landscape (greyscale emoji row — 🌱🌱🌱 with greyscale filter)

**Button:** `Wake Up Nature` → sets phase to `WISH_3_GAME`

---

## Phase 9 — WISH_3_GAME — Tap to Place

**Mechanic:** Dull landscape shown. 3 glowing spots appear one at a time. Child taps each glowing spot. Each tap grows something. All 3 tapped = wish complete.

**State needed:**
```jsx
const [activeSpot, setActiveSpot] = useState(0)   // 0, 1, 2 — which spot is currently glowing
const [revealed, setRevealed] = useState([false, false, false])
```

**Spot positions (fixed, not random):**
```js
const spots = [
  { x: '20%', y: '65%', grows: { emoji: '🌸', label: 'Flower' } },
  { x: '52%', y: '55%', grows: { emoji: '🌳', label: 'Tree' } },
  { x: '78%', y: '68%', grows: { emoji: '🦋', label: 'Butterfly' } },
]
```

**Spot appearance:**
- Only one spot glows at a time (activeSpot index)
- Glowing spot: pulsing gold circle, 60x60px minimum tap target
- CSS animation: scale 1 → 1.3 → 1 loop, 1.2s ease-in-out, gold color

**Tap behaviour:**
- Child taps glowing spot
- Spot disappears
- Growth emoji bursts out at that position (scale from 0 to 1.2 to 1, 0.4s)
- revealed[activeSpot] = true
- activeSpot advances to next index
- Play nature grow sound (Web Audio API — soft whoosh + chime)

**Landscape transformation:**
- Start: greyscale filter on entire landscape area
- After each tap: reduce greyscale by 33% (so 3 taps = full colour)
- Use CSS filter: `grayscale(${100 - revealed.filter(Boolean).length * 33}%)`

**Win condition:** All 3 spots tapped → full colour landscape → all growth emojis visible and animated → play celebration → show Ganesha win line → after 2s set phase to `WISH_3_COMPLETE`

**Ganesha win line VO:** `"When we care for nature, it grows beautifully."`

---

## Phase 10 — WISH_3_COMPLETE

- Full colour landscape shown
- All 3 growth emojis bouncing gently
- Ganesha line in speech bubble
- After 2.5s auto-advance to `TRANSITION_TO_DREAM`

---

## Phase 11 — TRANSITION_TO_DREAM

**This is a modal overlay — not a new page.**

**Modal content:**
- Ganesha line above modal: *"You helped make my wishes come true."* (VO plays first)
- Pause 1.5s
- Then modal appears

**Modal:**
```
Title (Baloo 2, 22px, gold): Now It's Your Dream
Body (Nunito, 15px, white): You helped others. Now draw a dream that matters to you.
Button: Draw My Dream
```

**Button:** `Draw My Dream` → sets phase to `DREAM_DRAW`

**VO for modal:** `"Now draw your own dream."`

---

## Phase 12 — DREAM_DRAW

**Two modes based on child age from profile:**

**Age 5–8 — Dream Chips mode:**
- Show a cloud-shaped frame in centre
- Below it: a horizontal scrollable row of dream chip options
- Each chip is an emoji + label in a tappable card (min 70x70px)
- Child taps a chip → it appears inside the cloud frame
- Child can tap up to 3 chips (chips stack/arrange inside cloud)

**Dream chip options:**
```js
const dreamChips = [
  { emoji: '🐶', label: 'Puppy' },
  { emoji: '✈️', label: 'Flying' },
  { emoji: '👨‍👩‍👧', label: 'Family' },
  { emoji: '🏰', label: 'Castle' },
  { emoji: '🌻', label: 'Garden' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '💃', label: 'Dancing' },
  { emoji: '🏊', label: 'Swimming' },
]
```

**Age 9–12 — Free draw mode:**
- Canvas element inside cloud frame
- Simple finger draw (onPointerDown/Move/Up on canvas, ctx.lineTo)
- Stroke colour: gold (#FFD700), line width 3px
- Clear button in corner

**Done button:**
- Appears once at least 1 chip is selected (age 5–8) or after first stroke (age 9–12)
- `Done` → sets phase to `TRANSITION_TO_REVEAL`

**Age check:**
```jsx
const childAge = parseInt(localStorage.getItem('childAge') || '7')
const useChipMode = childAge <= 8
```

---

## Phase 13 — TRANSITION_TO_REVEAL

**Modal overlay:**

```
Title (Baloo 2, 22px, gold): Reveal Your Dream
Body (Nunito, 15px, white): Sometimes clouds hide our dreams. Tap to clear them away.
Button: Reveal My Dream
```

**Button:** `Reveal My Dream` → sets phase to `CLOUD_CLEAR`

---

## Phase 14 — CLOUD_CLEAR

**State needed:**
```jsx
const [cloudsRemaining, setCloudsRemaining] = useState(3)
```

**Layout:**
- Child's dream (cloud frame with chips or drawing) is shown underneath
- 3 cloud layers sit on top covering it
- Each cloud is a semi-transparent white shape

**Tap behaviour:**
- Child taps anywhere on clouds
- Each tap removes one cloud layer (fade out animation, 0.3s)
- cloudsRemaining decreases by 1
- Play soft whoosh sound on each tap

**Win condition:** cloudsRemaining === 0 → dream fully revealed → set phase to `DREAM_REVEAL`

---

## Phase 15 — DREAM_REVEAL

- Dream shown in full with golden glow frame animation
- Ganesha appears
- Ganesha VO + speech bubble: `"What a beautiful dream! I will always remember this."`
- Pause 2s
- Confetti/star burst celebration
- After 3s → set phase to `SCENE_COMPLETE`

---

## Phase 16 — SCENE_COMPLETE

```jsx
if (phase === 'SCENE_COMPLETE') {
  ProgressManager.updateProgress('zone5', 'ganesha-wishes')
  return <SceneCompletionCelebration onContinue={onBack} />
}
```

---

## Audio — All Lines

Use Web Speech API for all VO. Wrap in a `speakLine(text)` utility that checks mute state before speaking.

```js
// All VO lines
const VO = {
  intro: "I have three wishes for the world. Will you help me make them come true?",
  wish1Intro: "My first wish is a kind and happy Earth.",
  wish1Win: "When we help each other, the Earth becomes happy.",
  wish2Intro: "My second wish is that everyone has food.",
  wish2Win: "Sharing food fills hearts with joy.",
  wish3Intro: "My third wish is for nature to grow strong.",
  wish3Win: "When we care for nature, it grows beautifully.",
  transitionDream: "You helped make my wishes come true. Now tell me… what is your dream?",
  dreamModal: "Now draw your own dream.",
  dreamReveal: "What a beautiful dream! I will always remember this.",
}
```

**Sound effects via Web Audio API (no files):**
- Correct bubble tap: short ascending chime (440hz → 660hz, 0.3s)
- Wrong bubble tap: soft low wobble (220hz, 0.2s)
- Food drop success: gentle plop (300hz, 0.15s)
- Nature grow: soft whoosh + chime (0.4s)
- Cloud clear: airy whoosh (0.2s each)
- Wish complete: 3-note ascending celebration (C-E-G, 0.6s total)
- Dream reveal: long warm chime (0.8s)

---

## Wish Progress Indicator

Show 3 small icons at top of screen during the 3 wish games. Each lights up gold when that wish is complete.

```jsx
const wishIcons = ['🌍', '🍲', '🌿']
// Render with opacity 0.3 until complete, 1.0 when complete
```

---

## Assets Needed

All assets are emoji-based for now. No image files required for initial build.

**Characters (emoji stand-ins):**
- Sad: 😢 😟 🙁
- Happy: 😊 😄 🥰
- Animals sad: 🐘 🐦 🦌 (with greyscale filter)
- Animals happy: same emojis, filter removed

**Landscape:**
- Dull: 🌱🌱🌱 row with greyscale CSS filter
- Grown: 🌸🌳🦋 at tap positions

When real illustrated assets are ready, swap emoji for `<img>` tags at same positions.

---

## Component Structure

```
GaneshaWishesScene.jsx         — main scene, all phases
  ├── IntroScreen               — inline, no separate file
  ├── WishIntroScreen           — reusable for all 3 wish intros (pass wishNumber prop)
  ├── BubbleTapGame             — Wish 1 mechanic
  ├── DragFillGame              — Wish 2 mechanic
  ├── TapPlaceGame              — Wish 3 mechanic
  ├── WishCompleteScreen        — reusable for all 3 completions
  ├── TransitionModal           — reusable for both transition modals
  ├── DreamDrawScreen           — chips mode + canvas mode
  ├── CloudClearScreen          — cloud tap reveal
  └── DreamRevealScreen         — final reveal + Ganesha response
```

Keep all sub-components as functions inside the same file unless they exceed 80 lines — then extract to same folder.

---

## Build Order for Claude Code

1. Scaffold main file with phase state and all phase renders returning placeholder divs
2. Build INTRO phase fully
3. Build WISH_1_INTRO + WISH_1_GAME (bubble tap) + WISH_1_COMPLETE
4. Build WISH_2_INTRO + WISH_2_GAME (drag fill) + WISH_2_COMPLETE
5. Build WISH_3_INTRO + WISH_3_GAME (tap place) + WISH_3_COMPLETE
6. Build TRANSITION_TO_DREAM modal
7. Build DREAM_DRAW (chips mode first, canvas mode second)
8. Build TRANSITION_TO_REVEAL modal
9. Build CLOUD_CLEAR
10. Build DREAM_REVEAL
11. Wire ProgressManager + SceneCompletionCelebration
12. Add all VO lines via Web Speech API
13. Add Web Audio API sound effects
14. Add wish progress indicator
15. Test full flow end to end

---

## Cultural Checklist

- [ ] Ganesha always shown with respect — joyful, warm, never comic
- [ ] Modak included in food items (Wish 2)
- [ ] Nature wish reflects Indian cultural value of caring for earth
- [ ] Dream chips include family as an option — NRI kids value family highly
- [ ] Ganesha's final line acknowledges the child's dream personally
- [ ] No Western-only cultural references in any bubble or chip content
