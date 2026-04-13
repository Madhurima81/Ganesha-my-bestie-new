# Scene 10 — Vakratunda Grove
## Claude Code Build Spec | Shloka River Zone 3
### Version 2.0 — Final

---

## Overview

Two-part scene teaching Vakratunda + Mahakaya through chanting.
Child's voice blooms the lotus and grows the banyan tree.
No popups. No world-breaks. Everything happens on the river bank.

---

## Design Principles For This Scene

```
1. The chanting IS the game
2. The blooming IS the reward  
3. The river bank world never breaks
4. Simple → magical → calm
5. Zone mood: peaceful, devotional, rhythmic
```

---

## File Location

```
src/zones/zone3-shloka-river/VakratundaGroveScene.jsx
```

---

## Components Used

```jsx
import BackToMapButton         from '../../components/BackToMapButton'
import SceneCompletionCelebration from '../../components/SceneCompletionCelebration'
import SymbolAutoReveal        from '../../components/SymbolAutoReveal'
import OpeningModal            from '../../components/OpeningModal'
import SyllableVoiceChallenge  from '../../components/SyllableVoiceChallenge'
import { useSceneReset }       from '../../hooks/useSceneReset'
```

---

## Scene Layout — Always Visible

```
┌─────────────────────────────────────────┐
│  [BackToMapButton]        [Mute] [⭐⭐]  │
│                                         │
│     🌤️  river bank background           │
│                                         │
│   🐘Elephant1   🌸LOTUS   🐘Elephant2   │
│                                         │
│         〰️〰️ river flowing 〰️〰️          │
│                                         │
│   [Sanskrit word builds up here]        │
└─────────────────────────────────────────┘
```

**Nothing leaves this layout at any point.**
Elephant speech bubble appears above the tapped elephant.
Waveform appears below the speech bubble.
Devanagari word floats up from lotus center.

---

## Zone Colors

```js
background: '#E8F5E9'   // light green
river:      '#03A9F4'   // sky blue  
accent:     '#2E7D32'   // forest green
gold:       '#FFD700'
text:       Baloo 2 (headings) · Nunito (body)
```

---

## State Machine

```js
const [part, setPart]           = useState('vakratunda') // 'vakratunda' | 'mahakaya'
const [step, setStep]           = useState(0)            // 0 | 1 | 2
const [lotusState, setLotus]    = useState(0)            // 0=closed 1=half 2=full
const [banyanState, setBanyan]  = useState(0)            // 0=tiny 1=growing 2=full
const [svcActive, setSvcActive] = useState(false)
const [svcSyllable, setSvc]     = useState('')
const [wordFragments, setFragments] = useState([])       // ['वक्र'] or ['वक्र','तुण्ड']
const [showModal, setShowModal] = useState('opening')    // 'opening'|'transition'|null
const [isComplete, setComplete] = useState(false)
```

---

## Part 1 — VAKRATUNDA

### Opening Modal
```
Title:       "Grow the Lotus"
Description: "Help the lotus bloom with your voice."
Button:      "Let's Grow"
onClose:     setShowModal(null)
```

### Step 0 — Child taps lotus (closed state)

```
Child taps lotus →
  Elephant 1 animates: trunk dips to river, scoops water, sprays lotus
  Audio plays: "वक्र" (VAKRA) — pre-recorded Sanskrit
  
  Elephant 1 turns toward child
  Speech bubble appears above Elephant 1:
    "Say वक्र! 🎤"
  Speech bubble glows with tap-pulse animation
  
  Child taps Elephant 1 →
    SyllableVoiceChallenge opens (inline, not modal)
    syllable="vakra"
    displayLabel="वक्र"
    
  Child speaks →
    PERFECT/GOOD:
      "वक्र" Devanagari text floats up from lotus center
      Text lodges at top-center of scene, glows gold
      Lotus → state 1 (half bloom)
      Elephant 1 trunk shoots up — sparkle burst from tip
      Speech bubble: "Beautiful! ✨"
      
    TRY AGAIN (attempts < 3):
      Elephant 1 shakes head gently, kindly
      Speech bubble: "Once more! 🎤"
      Audio replays automatically (SVC handles this)
      
    AFTER 3 TRIES:
      Speech bubble: "Keep going! 💪"
      "वक्र" still floats up and lodges (lotus blooms anyway)
      No child is left behind
      
  → setStep(1)
```

### Step 1 — Child taps lotus (half bloom)

```
Child taps lotus →
  Elephant 2 animates: trunk dips to river, sprays lotus
  Audio plays: "तुण्ड" (TUNDA) — pre-recorded Sanskrit
  
  Elephant 2 turns toward child
  Speech bubble: "Say तुण्ड! 🎤"
  
  Child taps Elephant 2 →
    SyllableVoiceChallenge opens
    syllable="tunda"  
    displayLabel="तुण्ड"
    
  Child speaks →
    PERFECT/GOOD:
      "तुण्ड" floats up, joins "वक्र" at top
      Both fragments sit side by side, glowing
      Lotus → state 2 (fuller bloom)
      Elephant 2 celebrates
      
    AFTER 3 TRIES: same graceful fallback
    
  → setStep(2)
```

### Step 2 — THE CHANT MOMENT — Child taps lotus (fuller state)

```
Child taps lotus →
  BOTH elephants animate together — trunks raise in unison
  Audio plays: "वक्रतुण्ड" (VAKRATUNDA) full word — pre-recorded
  
  Both elephants turn toward child
  Speech bubbles: "Say वक्रतुण्ड! 🎤"
  
  Child taps either elephant →
    SyllableVoiceChallenge opens
    syllable="vakratunda"
    displayLabel="वक्रतुण्ड"
    
  Child speaks →
    PERFECT/GOOD:
      "वक्र" + "तुण्ड" MERGE → "वक्रतुण्ड" glows golden
      Word pulses once — large, proud, golden
      
      LOTUS FULLY BLOOMS (state 3):
        Petals unfurl with shimmer animation
        Golden pollen particles drift upward slowly
        Soft golden wash over entire scene
        River ripples with golden rings outward
        
      Both elephants raise trunks — sparkles cascade
      
      VO plays (Web Speech API):
        "Vakratunda — the curved trunk."
        [pause]
        "I am flexible, like water."
        
      → SymbolAutoReveal fires:
        Vakratunda card blooms to sidebar
        Card: Title "Vakratunda" | Affirmation "I adapt."
        
    AFTER 3 TRIES: same graceful fallback + full bloom anyway
    
  → setPart('mahakaya') after 1.5s delay
```

---

## Transition Modal — Vakratunda → Mahakaya

```
Title:       "Vakratunda! 🌸"
Description: "The lotus bloomed with your voice. Now grow something even mightier."
Button:      "Grow the Banyan"
onClose:     setShowModal(null), show Mahakaya scene
```

---

## Part 2 — MAHAKAYA

**Same river bank. Lotus stays fully bloomed (visible, background).**
**Tiny sapling appears center stage, replaces lotus as tap target.**
**Same two elephants. Same mechanic. Different object.**

### Step 0 — Child taps sapling

```
Child taps sapling →
  Elephant 1 animates: stomps ground firmly, earth ripple effect
  Audio plays: "महा" (MAHA)
  
  Elephant 1 speech bubble: "Say महा! 🎤"
  
  Child taps Elephant 1 →
    SVC: syllable="maha" displayLabel="महा"
    
  PERFECT/GOOD:
    "महा" floats up, lodges at top
    Sapling → state 1 (small shoot visible, first leaves)
    
  → setStep(1)
```

### Step 1 — Child taps sapling (state 1)

```
Child taps sapling →
  Elephant 2 animates: wraps trunk around sapling, strength flows in
  Audio plays: "काय" (KAYA)
  
  Elephant 2 speech bubble: "Say काय! 🎤"
  
  Child taps Elephant 2 →
    SVC: syllable="kaya" displayLabel="काय"
    
  PERFECT/GOOD:
    "काय" floats up, joins "महा"
    Sapling → state 2 (trunk thickens, branches extend)
    
  → setStep(2)
```

### Step 2 — THE CHANT MOMENT

```
Child taps sapling (state 2) →
  BOTH elephants animate: stand beside tree, golden light flows
  from their bodies into roots
  Audio plays: "महाकाय" (MAHAKAYA) full word
  
  Both speech bubbles: "Say महाकाय! 🎤"
  
  Child taps either elephant →
    SVC: syllable="mahakaya" displayLabel="महाकाय"
    
  Child speaks →
    PERFECT/GOOD:
      "महा" + "काय" MERGE → "महाकाय" glows golden
      
      BANYAN FULLY GROWS (state 3):
        Trunk expands dramatically
        Wide canopy spreads across upper scene
        Aerial roots descend slowly from branches
        Leaves shimmer — golden light radiates from trunk
        Both lotuses (new bloom) appear at base of tree
        
      Both elephants stand proudly under canopy
      
      VO plays:
        "Mahakaya — the great body."
        [pause]  
        "I am strong, like the banyan tree."
        
      → SymbolAutoReveal fires:
        Mahakaya card blooms to sidebar
        Card: Title "Mahakaya" | Affirmation "I am strong."
        
  → Scene completion after 2s delay
```

---

## Scene Completion

```jsx
// Final state:
// - Lotus fully bloomed (left of scene)
// - Banyan fully grown (center/right)  
// - Both Devanagari words glowing at top
// - Both elephants under banyan canopy
// - Both symbol cards in sidebar

// Completion celebration:
<SceneCompletionCelebration
  theme="river"          // golden ripples, floating petals
  message="The lotus bloomed. The banyan grew. Your voice did this."
  onContinue={onComplete}
/>
```

---

## SyllableVoiceChallenge Integration

**SVC is NOT a modal overlay in this scene.**
It renders inline below the elephant's speech bubble.
The speech bubble + waveform + mic button = one unified elephant UI.

```jsx
// Elephant component renders:
<div className="elephant-coach">
  <img src={elephantImg} />
  
  {svcActive && (
    <div className="elephant-speech-bubble">
      <SyllableVoiceChallenge
        syllable={svcSyllable}
        displayLabel={svcLabel}
        onComplete={handleSvcComplete}
        replayAudio={replayCurrentAudio}
        stopAudio={stopAllAudio}
        // No mooshikaImage prop — elephant IS the coach
      />
    </div>
  )}
</div>
```

---

## Devanagari Word Build Animation

```css
@keyframes wordFloat {
  0%   { transform: translateY(0) scale(0.5); opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: translateY(-60px) scale(1); opacity: 1; }
}

@keyframes wordMerge {
  0%   { letter-spacing: 8px; opacity: 0.7; }
  100% { letter-spacing: 2px; opacity: 1; transform: scale(1.15); }
}

@keyframes wordGlow {
  0%, 100% { text-shadow: 0 0 8px #FFD700; }
  50%       { text-shadow: 0 0 24px #FFD700, 0 0 40px #FF9933; }
}
```

```jsx
// Word fragments render at top-center of scene
<div className="word-stage">
  {wordFragments.map((fragment, i) => (
    <span 
      key={i}
      className={`devanagari-fragment ${merged ? 'merged' : ''}`}
      style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: '#FFD700' }}
    >
      {fragment}
    </span>
  ))}
</div>
```

---

## Lotus Bloom Animation

```css
@keyframes petalUnfurl {
  0%   { transform: scale(0.6) rotate(-10deg); opacity: 0.7; }
  100% { transform: scale(1) rotate(0deg);     opacity: 1; }
}

@keyframes pollenDrift {
  0%   { transform: translateY(0) translateX(0); opacity: 1; }
  100% { transform: translateY(-40px) translateX(var(--dx)); opacity: 0; }
}

@keyframes goldenRipple {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
```

---

## Idle Hint System

```js
// If child hasn't tapped within 12-15s:
// → VO: hint text (per step, see below)

// If child still hasn't tapped at 18-22s:  
// → Glow pulse on correct tap target
// → Gesture arrow points to it

const IDLE_HINTS = {
  vakratunda: {
    0: { vo: "Tap the lotus to begin.", target: 'lotus' },
    1: { vo: "Tap the lotus again.", target: 'lotus' },
    2: { vo: "One final tap on the lotus.", target: 'lotus' },
  },
  mahakaya: {
    0: { vo: "Tap the little sapling.", target: 'sapling' },
    1: { vo: "Tap the growing tree.", target: 'sapling' },
    2: { vo: "One more tap to make it mighty.", target: 'sapling' },
  },
}
```

---

## Audio Map

```
Pre-recorded Sanskrit (required):
  /audio/shloka/vakra.mp3
  /audio/shloka/tunda.mp3
  /audio/shloka/vakratunda.mp3
  /audio/shloka/maha.mp3
  /audio/shloka/kaya.mp3
  /audio/shloka/mahakaya.mp3

Web Speech API (TTS — meaning + affirmation):
  "Vakratunda — the curved trunk. I am flexible, like water."
  "Mahakaya — the great body. I am strong, like the banyan tree."

Web Audio API (sound effects):
  - water spray sound (elephant watering)
  - soft bloom sound (lotus opening)
  - growth rumble (banyan expanding)
  - sparkle chime (celebration)
  - gentle merge sound (words combining)
```

---

## Asset Checklist

```
Elephant assets (shared across Part 1 + 2):
  □ elephant1_neutral.png
  □ elephant1_celebrate.png    ← trunk up, sparkles
  □ elephant1_encourage.png    ← gentle nod, kind
  □ elephant2_neutral.png
  □ elephant2_celebrate.png
  □ elephant2_encourage.png

Lotus assets:
  □ lotus_closed.png           ← bud, tight
  □ lotus_half.png             ← half open, petals visible
  □ lotus_full.png             ← fully open, golden center

Banyan assets:
  □ sapling_tiny.png           ← small green shoot
  □ sapling_growing.png        ← young tree, branches forming
  □ banyan_full.png            ← mighty, wide canopy, aerial roots

Background:
  □ vakratunda_grove_bg.png    ← river bank, misty morning
                                  river visible in background
                                  lotus pads on water
                                  lush green bank
```

---

## Touch Target Rules

```
Lotus:    minimum 80×80px (primary tap target — make it generous)
Elephant: minimum 80×80px (tap to activate mic)
All interactive elements: visual + audio feedback on every tap
Never rely on hover states — touch first
```

---

## What NOT To Build

```
❌ No Mooshika character
❌ No popup/overlay modal for SVC (inline only)
❌ No separate mic button outside elephant
❌ No syllable breakdown rounds (Vak → Ra → Vakra)
❌ No story unlock or mini-game after bloom
❌ No confetti explosion (wrong zone mood — keep it calm/devotional)
❌ No hover states
❌ No TypeScript
```

---

## Benchmark

All patterns follow `NewModakSceneV7.jsx`.
SVC integration follows existing `SyllableVoiceChallenge.jsx` (already built).
OpeningModal follows shared CSS file (do not create new modal CSS).

---

## Zone Mood Reminder

```
Shloka River = calm · rhythmic · devotional
The chanting IS the game.
The blooming IS the reward.
Keep it peaceful. Keep it simple. Keep it magical.
```

---

*Build spec v2.0 — Ready for Claude Code*
*Scene: VakratundaGroveScene.jsx*
*Zone 3 — Shloka River*
