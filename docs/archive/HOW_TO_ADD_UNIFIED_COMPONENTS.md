# How to Add Unified Header & Buttons to Any Scene

## 📦 Quick Reference

### Files You Need:
- **Header V2**: `src/zones/shloka-river/core/UnifiedHeaderV2.jsx` + `.css`
- **Button V2**: `src/zones/shloka-river/core/UnifiedButtonV2.jsx` + `.css`

---

## 🎯 Step-by-Step Guide

### Step 1: Add Imports to Your Scene

At the **top of your scene file**, add these imports:

```jsx
// Example: src/zones/shloka-river/scenes/Scene2/YourScene.jsx

import React, { useState, useEffect } from 'react';
import UnifiedHeaderV2 from '../../core/UnifiedHeaderV2';
import UnifiedButtonV2 from '../../core/UnifiedButtonV2';

// ... rest of your imports
```

---

### Step 2: Add Header to Your Scene

Replace your old header with:

```jsx
{/* ✅ UNIFIED HEADER V2 - Use this */}
<UnifiedHeaderV2
  zone="shloka-river"
  title="MAHAKAYA - Click the elephants!"
  currentRound={playerProgress}  // Current progress (0, 1, 2, 3...)
  totalRounds={3}                // Total stars to show
/>
```

#### Header Props:
- `zone`: `"shloka-river"` | `"symbol-mountain"` | `"meaning-cave"`
- `title`: The instruction text (string)
- `currentRound`: Current progress number (0-based)
- `totalRounds`: Total number of stars (usually 3)

---

### Step 3: Replace Buttons

#### ✅ **Two-Line Button** (Main + Sub text):

```jsx
<UnifiedButtonV2
  variant="primary"
  size="large"
  onClick={handleClick}
>
  <div>
    <div style={{ fontSize: '20px', fontWeight: '800' }}>
      ▶️ Auto Play
    </div>
    <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
      Start from Round 1 and learn step by step
    </div>
  </div>
</UnifiedButtonV2>
```

#### ✅ **Single-Line Button**:

```jsx
<UnifiedButtonV2
  variant="success"
  onClick={handleClick}
>
  ✨ Continue Adventure
</UnifiedButtonV2>
```

---

## 🎨 Button Variants

| Variant | Color | Use Case | Example |
|---------|-------|----------|---------|
| `primary` | 🟢 Green | Go/Proceed actions | Continue, Start, Resume |
| `secondary` | 🔵 Blue | Alternative choice | Manual Mode, Explore |
| `success` | 🟡 Gold | Big wins/achievements | Continue Adventure, Scene Complete |
| `danger` | 🔴 Red | Exit/destructive | Exit to Menu, Cancel |

---

## 🎨 Button Sizes

```jsx
<UnifiedButtonV2 size="small">    {/* Compact */}
<UnifiedButtonV2>                 {/* Default */}
<UnifiedButtonV2 size="large">    {/* Primary CTA */}
```

---

## 💡 Complete Examples

### Example 1: Mode Selection Modal

```jsx
{showModeSelection && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>🎮 How do you want to play?</h2>
      <p>Choose your learning style for MAHAKAYA</p>

      {/* AUTO PLAY BUTTON */}
      <UnifiedButtonV2
        variant="primary"
        size="large"
        onClick={() => setMode('auto')}
      >
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>
            ▶️ Auto Play
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
            Start from Round 1 and learn step by step
          </div>
        </div>
      </UnifiedButtonV2>

      {/* MANUAL BUTTON */}
      <UnifiedButtonV2
        variant="secondary"
        size="large"
        onClick={() => setMode('manual')}
      >
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>
            🎯 Choose a Round
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
            Pick any round you like and practice!
          </div>
        </div>
      </UnifiedButtonV2>
    </div>
  </div>
)}
```

### Example 2: Scene Completion

```jsx
{showCompletion && (
  <div className="completion-modal">
    <h2>Amazing Work!</h2>

    {/* Main CTA - Gold with heartbeat */}
    <UnifiedButtonV2
      variant="success"
      size="large"
      heartbeat={true}
      onClick={handleContinue}
    >
      ✨ Continue Adventure
    </UnifiedButtonV2>

    {/* Secondary actions */}
    <UnifiedButtonV2
      variant="primary"
      onClick={handlePlayAgain}
    >
      🔄 Play Again
    </UnifiedButtonV2>

    <UnifiedButtonV2
      variant="secondary"
      onClick={handleExplore}
    >
      🗺️ Explore Scenes
    </UnifiedButtonV2>
  </div>
)}
```

### Example 3: Pause Modal

```jsx
<PauseModal isOpen={showPause} onContinue={handleContinue} onExit={handleExit} />

// PauseModal component already uses UnifiedButtonV2:
// - Green "Keep Playing" (primary)
// - Red "Exit to Menu" (danger)
```

---

## 📝 Files to Update for Mahakaya

### 1. **MahakayaGame.jsx** (Wrapper)
Location: `src/zones/shloka-river/scenes/Scene1/MahakayaGame.jsx`

**No changes needed!** It uses `MemoryGameEngine` which uses `AutoPlayMode` which already has the V2 header.

### 2. **If Mahakaya has custom buttons**

If you have any modals or buttons in the Mahakaya scene component itself, add:

```jsx
// At top of file
import UnifiedButtonV2 from '../../core/UnifiedButtonV2';

// Replace old buttons
<UnifiedButtonV2 variant="primary">
  Start Game
</UnifiedButtonV2>
```

---

## 🔧 Files to Update in Each Scene

For **any new scene** in Shloka River zone:

### Required Changes:

1. **Add imports** (top of file):
```jsx
import UnifiedHeaderV2 from '../../core/UnifiedHeaderV2';
import UnifiedButtonV2 from '../../core/UnifiedButtonV2';
```

2. **Replace old header** with:
```jsx
<UnifiedHeaderV2
  zone="shloka-river"
  title={instructionText}
  currentRound={progress}
  totalRounds={3}
/>
```

3. **Replace all `<button>` or old `<Button>` components** with:
```jsx
<UnifiedButtonV2 variant="primary">
  Button Text
</UnifiedButtonV2>
```

---

## 🎯 Scene Files in Shloka River to Update

| Scene | File Path | Status |
|-------|-----------|--------|
| Scene 1 - Vakratunda | `scenes/Scene1/VakratundaGroveSimplified.jsx` | ✅ DONE |
| Scene 1 - Mahakaya | Uses AutoPlayMode | ✅ AUTO |
| Scene 2 | `scenes/Scene2/[YourScene].jsx` | ⏳ TO DO |
| Scene 3 | `scenes/Scene3/[YourScene].jsx` | ⏳ TO DO |
| Scene 4+ | `scenes/Scene4+/[YourScene].jsx` | ⏳ TO DO |

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```jsx
// Wrong - text won't display properly
<UnifiedButtonV2>
  ▶️ Auto Play
  Start from Round 1
</UnifiedButtonV2>
```

### ✅ DO THIS:
```jsx
// Correct - wrapped in divs
<UnifiedButtonV2>
  <div>
    <div style={{ fontSize: '20px', fontWeight: '800' }}>
      ▶️ Auto Play
    </div>
    <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
      Start from Round 1 and learn step by step
    </div>
  </div>
</UnifiedButtonV2>
```

---

## 📊 Quick Copy-Paste Templates

### Template: Two-Line Button
```jsx
<UnifiedButtonV2 variant="primary" size="large" onClick={handleClick}>
  <div>
    <div style={{ fontSize: '20px', fontWeight: '800' }}>
      Main Text Here
    </div>
    <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.95, marginTop: '4px' }}>
      Subtitle text here
    </div>
  </div>
</UnifiedButtonV2>
```

### Template: Single-Line Button
```jsx
<UnifiedButtonV2 variant="success" onClick={handleClick}>
  ✨ Button Text
</UnifiedButtonV2>
```

### Template: Header
```jsx
<UnifiedHeaderV2
  zone="shloka-river"
  title="SCENE NAME - Instruction text"
  currentRound={currentProgress}
  totalRounds={3}
/>
```

---

## 🎨 Customization

### Change Button Width
Edit `UnifiedButtonV2.css` line 24-26:
```css
padding: 20px 30px;   /* height, width */
min-width: 280px;     /* minimum width */
max-width: 400px;     /* maximum width */
```

### Change Header Colors
Edit `UnifiedHeaderV2.css` lines 9-24 (zone color variables)

---

## ✅ Checklist for Each Scene

- [ ] Import `UnifiedHeaderV2` and `UnifiedButtonV2`
- [ ] Replace old header with `<UnifiedHeaderV2>`
- [ ] Replace all buttons with `<UnifiedButtonV2>`
- [ ] Use correct variant (primary/secondary/success/danger)
- [ ] Wrap two-line text in nested `<div>` elements
- [ ] Test on mobile and desktop
- [ ] Check star progression works
- [ ] Verify button animations (squish, heartbeat)

---

**Last Updated**: January 2026
**Version**: 2.0.0
