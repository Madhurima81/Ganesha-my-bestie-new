---
name: ganesha-my-bestie
description: >
  Master skill for building Ganesha My Bestie — a children's cultural education PWA for NRI families.
  Use this skill whenever Madhurima asks to build, fix, or add anything to Ganesha My Bestie: new scenes,
  mini-games, components, zones, audio, navigation, animations, or any React/Vite code for this project.
  Also trigger for marketing content, pricing, zone structure, or UX decisions related to this app.
  This skill encodes ALL design rules, tech stack choices, architecture patterns, and cultural standards
  so every output is consistent with the existing codebase without needing reminders.
---

# Ganesha My Bestie — Master Build Skill

## Project Identity

**What it is:** A children's cultural education PWA teaching Hindu culture, Sanskrit, and mythology to NRI children aged 6–7.

**Target audience (always evaluate from ALL three lenses):**
1. Top children's edutainment developer (Disney/PBS Kids standards)
2. NRI parent (cultural authenticity, safety, pride)
3. NRI child aged 6–7 (fun, clear, rewarding, not overwhelming)

**Deployment:** Netlify via GitHub. PWA with service worker caching.

---

## Typography — ALWAYS USE THESE, NO EXCEPTIONS

```css
font-family: 'Baloo 2', cursive;   /* ALL headings, titles, buttons, zone names */
font-family: 'Nunito', sans-serif; /* ALL body text, instructions, labels */
```

Both fonts are pre-loaded in `index.html`. Never use system fonts or other Google Fonts.

---

## The 5 Zones

| Zone | Name | Status | Free/Paid |
|------|------|--------|-----------|
| 1 | Symbol Mountain | Complete | FREE (freemium entry) |
| 2 | Cave of Secrets | Complete | Paid |
| 3 | Shloka River | Complete | Paid |
| 4 | Festival Square | Complete | Paid |
| 5 | About Me Hut | Complete | Paid |

### Zone 1 — Symbol Mountain
- 4 scenes teaching 8 Ganesha symbols
- Sacred Assembly finale + SymbolPowerMission
- SimpleDiscoveryOverlay (NOT GameCoach)
- Phase headers + reload systems

### Zone 2 — Cave of Secrets
- 5 scenes, 8 Sanskrit words: Vakratunda, Mahakaya, Suryakoti, Samaprabha, Nirvighnam, Kurumedeva, Sarvakaryeshu, Sarvada
- DoorComponent with syllable audio
- CaveScene5MemoryFinale (two-round memory match)
- SymbolSidebar, RescueModal, CulturalProgressExtractor

### Zone 3 — Shloka River
- MemoryGameEngine, AutoPlayMode, ManualRoundMode
- Pause/resume, cross-mode progress, reload functionality
- ShlokaRiverFinale with sequential animal-boarding mechanics

### Zone 4 — Festival Square
- Festival Piano (Web Audio API, dancing animals, 4 Ganesha songs, challenge mode)
- Rangoli Art (SVG coloring, 3 designs)
- Modak Cooking (5-step sequential)
- Mandap Decoration (click-to-place, 4 mission types)
- FestivalSquareCompletion + SceneCompletionCelebration

### Zone 5 — About Me Hut
- Family Tree, Favorite Things, Obstacle Remover, Name & Birthday
- Balloon-popping, festival identification, drawing pad

---

## Architecture & Key Components

```
src/
├── components/
│   ├── SceneManager.jsx          — master scene router
│   ├── GameStateManager.jsx      — global game state
│   ├── ProgressManager.jsx       — cross-zone progress
│   ├── SimpleSceneManager.jsx    — lightweight scene wrapper
│   ├── BackToMapButton.jsx       — consistent back nav
│   ├── AppSidebar.jsx            — progress sidebar
│   ├── SmartwatchWidget.jsx      — cross-scene progress display
│   └── TocaBocaNav.jsx           — zone navigation
├── hooks/
│   └── useSceneReset.js          — reset hook
├── config/
│   ├── SceneResetConfigs.js      — per-scene reset rules
│   └── sceneWhisperConfig.js     — GaneshaSceneWhisper voice lines (all zones)
├── lib/components/
│   └── GaneshaSceneWhisper.jsx   — shared personalisation whisper component
└── zones/
    ├── zone1-symbol-mountain/
    ├── zone2-cave-of-secrets/
    ├── zone3-shloka-river/
    ├── zone4-festival-square/
    └── zone5-about-me-hut/
```

---

## Scene ID Master Map (App.jsx SCENE_MAPPING)

These are the **real scene IDs** used at runtime. Always use these when passing `sceneId` to any component.

```js
// symbol-mountain
'modak'                  → NewModakSceneV7.jsx          (modak cooking)
'pond'                   → PondSceneSimplifiedV4.jsx     (lotus pond)
'symbol'                 → SymbolMountainSceneV3         (broken tusk)
'final-scene'            → SacredAssemblySceneV8         (all 8 symbols)

// cave-of-secrets
'vakratunda-mahakaya'    → CaveSceneFixedV2              (Vakratunda + Mahakaya)
'suryakoti-samaprabha'   → SuryakotiSceneV4              (Suryakoti + Samaprabha)
'nirvighnam-kurumedeva'  → NirvighnamSceneV5             (Nirvighnam + Kurumedeva)
'sarvakaryeshu-sarvada'  → SarvakaryeshuSarvadaV7        (Sarvakaryeshu + Sarvada)
'final-meaning-scene'    → Cavescene5memoryfinale        (memory match finale)

// shloka-river
'vakratunda-grove'       → VakratundaGroveSimplified
'suryakoti-bank'         → SuryakotiBankSimplified
'nirvighnam-chant'       → NirvighnamChantSimplified
'sarvakaryeshu-chant'    → SarvakaryeshuChantSimplified
'shloka-river-finale'    → ShlokaRiverFinale

// festival-square
'game1'                  → FestivalPianoGame
'game2'                  → FestivalRangoliGame
'game3'                  → ModakCookingGame
'game4'                  → MandapDecorationGame

// about-me-hut  ⚠️ keys are swapped vs file names — fix needed
'family-tree'            → Namebirthdaygame.jsx    (card says Family Tree)
'favorite-food'          → Familytreegame.jsx      (card says Favorite Food)
'dreams-wishes'          → Favoritefoodgame.jsx    (card says Dreams & Wishes)
'name-birthday'          → ObstacleRemoverGame.jsx (card says Name & Birthday)
```

> **About Me Hut bug:** SCENE_MAPPING keys and JSX files are mismatched. The card labels shown to the child are correct; the loaded components are wrong. Needs a fix in App.jsx.

---

## Design System

### Colors (warm, festive, child-friendly)
```js
// Primary palette — use these consistently
const colors = {
  saffron: '#FF9933',
  deepOrange: '#FF5722',
  gold: '#FFD700',
  forestGreen: '#2E7D32',
  skyBlue: '#03A9F4',
  warmCream: '#FFF8E7',
  deepPurple: '#6A1B9A',
  coral: '#FF6B6B',
};
```

### Touch Targets
- Minimum tap area: **60x60px** for all interactive elements
- Never rely on hover states — this is a touch-first app
- Provide visual + audio feedback on every interaction

### Animations
- Use CSS transitions and simple keyframes — keep it light
- Celebrate completions with confetti, bouncing, color bursts
- Characters should feel alive: subtle idle animations

### Child UX Rules
- Max **3 steps** to understand any game mechanic
- Always show **what to do** visually, not just in text
- Reward frequently — small wins every 30–60 seconds
- Never punish — wrong answers get a gentle redirect, not a buzzer
- Progress must be **visible** at all times (stars, stamps, fill bars)

---

## Audio Strategy

```
Hybrid approach:
- Sanskrit content (shlokas, mantras, names) → Pre-recorded audio files
- General guidance & UI narration → Web Speech API / Piper TTS
- Sound effects → Web Audio API (synthesized, no file dependency)
- Music → Web Audio API oscillators or small MP3s
```

Always include a mute toggle. Audio must not autoplay before user interaction (browser policy).

---

## Cultural Authenticity Standards

These are non-negotiable — Madhurima is both developer and NRI parent:

1. **Sanskrit accuracy** — all Sanskrit text must be correctly transliterated. Use IAST or Devanagari.
2. **Ganesha representation** — always respectful, joyful, never caricatured
3. **Festival accuracy** — Ganesh Chaturthi, Diwali, Holi references must be regionally accurate (Maharashtra/North India NRI context)
4. **Sanskrit words taught** are fixed — do not invent new ones without asking
5. **Modak is sacred** — it's Ganesha's favourite, treat it with affection in game design
6. **"About Me" zone** — deeply personal for NRI kids; family tree must support non-Western family structures

---

## Navigation Patterns

**TocaBocaNav** is the primary navigation component — bright, icon-based, thumb-friendly.

Navigation rules:
- Always show **BackToMapButton** in every scene
- Zone map is the home base — all roads lead back to it
- Completion of a scene → SceneCompletionCelebration → auto-return or next scene prompt
- Never trap the child in a scene without an escape

---

## Completion & Progress System

Every mini-game must:
1. Have a clear **win condition** (stars collected, puzzle solved, song finished)
2. Trigger **SceneCompletionCelebration** on completion
3. Update **ProgressManager** with zone + scene ID
4. Show completion state persistently (star filled, stamp earned)

---

## Pricing & Business Model

```
India:  ₹1,999 one-time
Global: $39.99 one-time
Freemium: Symbol Mountain (Zone 1) is always free
Upsell: Unlock all 4 remaining zones
```

---

## Code Standards

### React/Vite conventions
- Functional components only (no class components)
- Props destructured at top of component
- CSS-in-JS via inline styles OR Tailwind utility classes
- No TypeScript — plain JavaScript
- File naming: PascalCase for components, camelCase for hooks/utils

### When building a new scene, always include:
```jsx
// 1. BackToMapButton at top
// 2. Zone-consistent color scheme
// 3. Baloo 2 for all headings
// 4. Nunito for instructions
// 5. useSceneReset hook wired up
// 6. SceneCompletionCelebration on win
// 7. ProgressManager.updateProgress() call
// 8. Mute button if audio is present
// 9. Touch targets ≥ 60px
// 10. Cultural review checklist (see Cultural Authenticity above)
```

### Typical scene scaffold:
```jsx
import { useState } from 'react';
import BackToMapButton from '../../components/BackToMapButton';
import SceneCompletionCelebration from '../../components/SceneCompletionCelebration';
import { useSceneReset } from '../../hooks/useSceneReset';

export default function ZoneXSceneY({ onComplete, onBack }) {
  const [isComplete, setIsComplete] = useState(false);
  useSceneReset('zone-x-scene-y');

  const handleWin = () => {
    setIsComplete(true);
    // ProgressManager.updateProgress(...)
  };

  if (isComplete) return <SceneCompletionCelebration onContinue={onBack} />;

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', minHeight: '100vh' }}>
      <BackToMapButton onClick={onBack} />
      <h1 style={{ fontFamily: 'Baloo 2, cursive' }}>Scene Title</h1>
      {/* game content */}
    </div>
  );
}
```

---

## Marketing Voice

When writing marketing copy for this app, always use:
- **Tone:** Warm, proud, culturally celebratory — speaks to NRI parent's heart
- **Hook:** "Your child, their roots" — identity + belonging
- **Social proof angle:** "Built by an NRI parent, for NRI families"
- **Platform:** Instagram-first, then email
- **Hashtags:** #NRIParenting #GaneshaMyBestie #HinduKidsApp #DesiParenting #IndianDiaspora

---

## What NOT to Do

- ❌ Never use `GameCoach` (removed — use `SimpleDiscoveryOverlay`)
- ❌ Never add hover-only interactions
- ❌ Never skip audio feedback on major interactions
- ❌ Never use fonts other than Baloo 2 + Nunito
- ❌ Never simplify cultural content for "Western" audiences — authenticity is the value proposition
- ❌ Never build a new zone structure without checking the existing SceneManager routing first
- ❌ Never hardcode Sanskrit incorrectly — when in doubt, ask Madhurima

---

## Quick Reference: Zone Color Schemes

These are the **exact values from `src/lib/config/ZoneThemes.js`** — use `getZoneTheme(zoneId)` in code.

| Zone ID | accentColor | textPrimary | menuBg | btnTop | btnShadow |
|---------|-------------|-------------|--------|--------|-----------|
| `symbol-mountain` | `#F4C430` | `#6B5416` | cream/gold gradient | `#FFDA5A` | `#B8920A` |
| `cave-of-secrets` | `#C85A2E` | `#6B2F1A` | amber/rust gradient | `#E07045` | `#8B2E0A` |
| `shloka-river` | `#4A9B87` | `#1B4D3E` | aqua/sage gradient | `#5FBEA8` | `#1A6B5A` |
| `festival-square` | `#E67E22` | `#8B4513` | marigold gradient | `#F4962A` | `#A84E00` |
| `about-me-hut` | `#D89566` | `#7D4520` | clay/ochre gradient | `#E8AA7A` | `#9A5A20` |

---

## App Shell UI System — Navigation Screens

These are the colors/styles for ALL navigation screens (Welcome Back, Profile Selector, Map, TWG Hub).
**Different from zone modals** — do NOT use saffron/orange here.

```js
// App shell tokens (src/lib/components/navigation/CleanGameWelcomeScreen.css)
const APP_SHELL = {
  background:   "url('/images/profile-background.png') center/cover",  // purple forest
  bgTint:       'rgba(40, 30, 70, 0.45)',       // dark purple overlay on top of bg
  cardBg:       '#FAF6EE',                       // warm cream card
  cardRadius:   32,
  cardShadow:   '0 6px 16px rgba(60, 40, 80, 0.06)',
  titleColor:   '#6752B8',                       // Baloo 2, purple
  bodyColor:    '#5A4A7A',                       // Nunito
  subtleColor:  '#8B7AB0',                       // hints, labels, secondary text
  borderColor:  '#C4B5F4',                       // input borders, dividers
  primaryBtn:   'linear-gradient(180deg, #9a73d9, #7f5ac7)',  // import PrimaryBtn component
  primaryShadow:'#5a3fa0',
};
```

**Background:** Always `profile-background.png` + dark purple tint layer (`rgba(40,30,70,0.45)`)
**Card:** `#FAF6EE`, `borderRadius: 32px`, centered, max-width ~620–980px
**Primary button:** Import `PrimaryBtn` from `src/lib/components/shared/PrimaryBtn` — purple gradient, no override needed
**Secondary button:** `white` bg, `2px solid #C4B5F4` border, `#8B7AB0` text, `borderRadius: 80px`
**Parent Corner button:** `border: 1.5px solid #C4B5F4`, `color: #8B7AB0`, `background: none`

### Two-column layout (for TWG screens with Ganesha)
```jsx
// Ganesha left 38%, card right 54%, marginRight: -48 on Ganesha pulls card close
// Speech bubble pointer: absolute div, left: -13, top: 46%, rotate(45deg), bg: #FAF6EE
// Ganesha: transform scaleX(-1) so he faces the card
```

---

## UI Component System

### Button Hierarchy

**1. PrimaryBtn** — the purple 3D pill (main CTA on any screen)
```jsx
import PrimaryBtn from 'src/lib/components/shared/PrimaryBtn';
<PrimaryBtn label="Continue Journey" onClick={fn} size="md" fullWidth />
// sizes: 'sm' | 'md' | 'lg'
// Default color: purple gradient (#9a73d9 → #7f5ac7)
```

**Zone-colored PrimaryBtn** — for in-scene CTAs (e.g. "Start", "Keep Exploring"):
Inject CSS vars to override the purple to the zone's color:
```jsx
import { getZoneTheme } from 'src/lib/config/ZoneThemes';
const theme = getZoneTheme('shloka-river');
<PrimaryBtn
  label="Let's Explore"
  onClick={fn}
  size="md"
  style={{
    '--btn-color-top': theme.btnTop,
    '--btn-color-base': theme.accentColor,
    '--btn-color-shadow': theme.btnShadow,
    '--btn-color-glow': theme.glowColor,
  }}
/>
```

**2. Secondary button** — white outlined pill (second action, e.g. "Explore Scenes"):
```jsx
<button className="secondary-btn" onClick={fn}>Explore Scenes</button>
// Styling: white/transparent bg, zone-accent border, zone textPrimary color
// Inline equivalent:
<button style={{
  background: 'white',
  border: `2px solid ${theme.accentColor}`,
  borderRadius: '80px',
  padding: '14px 36px',
  color: theme.textPrimary,
  fontFamily: "'Baloo 2', cursive",
  fontWeight: 700,
  fontSize: '18px',
  cursor: 'pointer',
  width: '100%',
}}>Explore Scenes</button>
```

**3. Parent Corner button** — subtle, de-emphasized (always below main actions):
```jsx
<button style={{
  background: 'none',
  border: '1.5px solid #C4B5F4',
  borderRadius: '24px',
  padding: '10px 20px',
  fontFamily: 'Nunito, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  color: '#8B7AB0',
  width: '100%',
  minHeight: '44px',
}}>👨‍👩‍👧 Parent Corner</button>
```

**4. Text/ghost action** — e.g. "Play Again" (least prominent):
```jsx
<button style={{
  background: 'none', border: 'none',
  color: '#94A3B8', fontFamily: 'Nunito, sans-serif',
  fontSize: '14px', cursor: 'pointer',
}}>Play Again</button>
```

---

### Modal / Overlay Pattern

Used for all pop-ups, challenges, confirmations. The SyllableVoiceChallenge is the canonical reference.

```jsx
// Backdrop
<div style={{
  position: 'absolute', inset: 0, zIndex: 400,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.50)',
  animation: 'fadeIn 0.22s ease-out',
  padding: '24px',
}}>
  {/* Card */}
  <div style={{
    position: 'relative',
    width: '100%', maxWidth: '780px',
    background: 'linear-gradient(160deg, #FFFBF0 0%, #FFF9E8 100%)',
    borderRadius: '36px',
    padding: '52px 56px 80px',
    boxShadow: '0 12px 48px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.14)',
    animation: 'popIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden',
  }}>
    {/* × close */}
    <button style={{
      position: 'absolute', top: 14, right: 16,
      width: 36, height: 36, borderRadius: '50%',
      border: 'none', background: 'rgba(0,0,0,0.08)',
      fontSize: 20, cursor: 'pointer',
    }}>×</button>
    {/* content */}
  </div>
</div>
```

**Keyframes to define** (add as `<style>` or in CSS file):
```css
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn   { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes bounce  { 0% { transform: translateY(0); } 30% { transform: translateY(-14px); } 100% { transform: translateY(0); } }
```

---

### Scene Opening Modal Pattern

Every scene starts with an intro modal (see `OpeningModal` component):
- Title in Baloo 2, bold
- Instruction text in Nunito
- Two icons (modak `🌙` + Ganesha figure) as visual cue
- Single CTA: zone-colored `PrimaryBtn` labeled "Let's Explore"
- Background: warm cream `linear-gradient(160deg, #FFFBF0, #FFF9E8)`

### Scene Completion Modal Pattern

After win condition (from screenshots):
- Title: "The Flowers Have Bloomed!" style — Baloo 2, warm color
- Subtitle in Nunito, slate gray
- Two buttons stacked:
  1. PrimaryBtn (zone color) → "Keep Exploring"
  2. Secondary btn → "Explore Scenes"
  3. Ghost text → "Play Again"
- Floating star burst animation on success

---

### Feedback / Result Colors (used in voice challenges, games)

```js
const RESULT_STYLES = {
  perfect: { bg: 'linear-gradient(160deg, #FFFBEB, #FEF3C7)', titleColor: '#D97706' }, // amber
  good:    { bg: 'linear-gradient(160deg, #F0FDF4, #DCFCE7)', titleColor: '#059669' }, // green
  tryAgain:{ bg: 'linear-gradient(160deg, #FFF7ED, #FFEDD5)', titleColor: '#EA580C' }, // orange
};
```

---

### How to Apply Zone Theme in a New Feature

```jsx
import { getZoneTheme } from 'src/lib/config/ZoneThemes';

export default function MyNewFeature({ zoneId = 'shloka-river', onBack }) {
  const theme = getZoneTheme(zoneId);

  return (
    <div style={{ background: theme.menuBg, color: theme.textPrimary, fontFamily: theme.fontFamilyBody }}>
      <h1 style={{ fontFamily: theme.fontFamily, color: theme.textPrimary }}>Title</h1>
      {/* Zone-accented primary CTA */}
      <PrimaryBtn
        label="Continue"
        onClick={onBack}
        style={{
          '--btn-color-top': theme.btnTop,
          '--btn-color-base': theme.accentColor,
          '--btn-color-shadow': theme.btnShadow,
          '--btn-color-glow': theme.glowColor,
        }}
      />
    </div>
  );
}
```
