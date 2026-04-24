---
name: ganesha-my-bestie
description: >,
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
│   └── SceneResetConfigs.js      — per-scene reset rules
└── zones/
    ├── zone1-symbol-mountain/
    ├── zone2-cave-of-secrets/
    ├── zone3-shloka-river/
    ├── zone4-festival-square/
    └── zone5-about-me-hut/
```

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

| Zone | Primary | Accent | Background |
|------|---------|--------|------------|
| Symbol Mountain | Deep orange `#FF5722` | Gold `#FFD700` | Warm cream `#FFF8E7` |
| Cave of Secrets | Deep purple `#6A1B9A` | Teal `#00BCD4` | Dark `#1A0A2E` |
| Shloka River | Forest green `#2E7D32` | Sky blue `#03A9F4` | Light green `#E8F5E9` |
| Festival Square | Hot pink `#E91E63` | Saffron `#FF9933` | Festive cream `#FFF3E0` |
| About Me Hut | Warm brown `#795548` | Coral `#FF6B6B` | Cozy beige `#FBE9E7` |
