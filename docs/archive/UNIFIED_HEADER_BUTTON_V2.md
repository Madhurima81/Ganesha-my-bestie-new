# Unified Header & Button System V2 - Implementation Guide

## Overview
V2 introduces a **solid sticker-style design** with 3D shadows, replacing the translucent V1 approach. This creates a more grounded, tactile feel that's easier for children to read and interact with.

---

## 📋 Files Created

### Header V2
1. **`UnifiedHeaderV2.jsx`** - React component with solid background
2. **`UnifiedHeaderV2.css`** - Sticker-style CSS with 3D shadows

### Button V2
1. **`UnifiedButtonV2.jsx`** - React component with gradient buttons
2. **`UnifiedButtonV2.css`** - 3D pill buttons with heartbeat animation

### V1 Files (Preserved)
- `UnifiedHeader.jsx` / `UnifiedHeader.css` - Original translucent design
- (V1 buttons were not created yet)

---

## 🎨 Design Philosophy: The Two-Layer System

### The Walls (Grounded Elements)
- **Solid backgrounds** with zone-specific colors
- **3D shadows** for depth and tactility
- Headers, modals, and containers

### The Toys (Interactive Elements)
- **Gradient surfaces** to catch light
- **Squish animations** on press
- **Heartbeat animations** to draw attention
- Buttons and interactive icons

---

## 🏛️ Header V2 - Solid Sticker Style

### Visual Features
- **Solid background** (no transparency)
- **4px solid border** in zone accent color
- **8px 3D shadow** below for depth
- **Stars directly under text** for clear progress

### Zone Color Palettes

#### Shloka River (Green)
```css
--zone-river-base: #C8E6C9;        /* Pale Moss Green */
--zone-river-accent: #4CAF50;      /* Sacred Forest Green */
--zone-river-shadow: #388E3C;      /* Deep Forest Shadow */
```

#### Symbol Mountain (Gold)
```css
--zone-mountain-base: #FFE082;     /* Soft Gold */
--zone-mountain-accent: #FFD700;   /* Bright Gold */
--zone-mountain-shadow: #F57C00;   /* Deep Orange Shadow */
```

#### Meaning Cave (Amber)
```css
--zone-cave-base: #FFECB3;         /* Warm Cream */
--zone-cave-accent: #FFC107;       /* Amber */
--zone-cave-shadow: #F57C00;       /* Deep Amber Shadow */
```

### Usage Example

```jsx
import UnifiedHeaderV2 from './UnifiedHeaderV2';

<UnifiedHeaderV2
  zone="shloka-river"
  title="VAKRATUNDA - Get Ready... 3"
  currentRound={2}
  totalRounds={3}
/>
```

---

## 🔘 Button V2 - 3D Toy Buttons

### Button Variants & Use Cases

#### 🟢 Primary (Green) - "Go/Proceed"
- **Continue Adventure**
- **Start Game**
- **Play Again**
- **Resume**

```jsx
<UnifiedButtonV2 variant="primary">
  Continue Adventure
</UnifiedButtonV2>
```

#### 🔵 Secondary (Blue) - "Alternative Choice"
- **Manual Mode** (when paired with Auto Mode)
- **Explore Scenes**
- **Alternative options**

```jsx
<UnifiedButtonV2 variant="secondary">
  Manual Mode
</UnifiedButtonV2>
```

#### 🟡 Success (Gold) - "Big Win/Achievement"
- **Continue Adventure** (after scene complete)
- **Claim Reward**
- **Scene completion CTAs**

```jsx
<UnifiedButtonV2 variant="success" size="large" heartbeat={true}>
  Continue Adventure
</UnifiedButtonV2>
```

#### 🔴 Danger (Red) - "Exit/Destructive"
- **Exit to Menu**
- **Cancel**
- **Leave Game**

```jsx
<UnifiedButtonV2 variant="danger">
  Exit to Menu
</UnifiedButtonV2>
```

### Button Sizes

```jsx
// Small (Secondary actions)
<UnifiedButtonV2 size="small">Close</UnifiedButtonV2>

// Default (Standard buttons)
<UnifiedButtonV2>Continue</UnifiedButtonV2>

// Large (Primary CTAs)
<UnifiedButtonV2 size="large">Start Adventure</UnifiedButtonV2>
```

### Heartbeat Animation

Adds pulsing animation after 3 seconds to draw attention:

```jsx
<UnifiedButtonV2 variant="success" heartbeat={true}>
  Continue Adventure
</UnifiedButtonV2>
```

---

## 🎯 Common Use Cases

### 1. Scene Completion Screen
```jsx
// Main CTA (Gold with heartbeat)
<UnifiedButtonV2 variant="success" size="large" heartbeat={true}>
  Continue Adventure
</UnifiedButtonV2>

// Secondary options (Green + Blue)
<UnifiedButtonV2 variant="primary">
  Play Again
</UnifiedButtonV2>

<UnifiedButtonV2 variant="secondary">
  Explore Scenes
</UnifiedButtonV2>
```

### 2. Pause Modal
```jsx
// Resume (Green)
<UnifiedButtonV2 variant="primary">
  Continue Playing
</UnifiedButtonV2>

// Exit (Red)
<UnifiedButtonV2 variant="danger">
  Exit to Menu
</UnifiedButtonV2>
```

### 3. Mode Selection (Auto vs Manual)
```jsx
// Both same visual weight, different colors
<UnifiedButtonV2 variant="primary">
  Auto Mode
</UnifiedButtonV2>

<UnifiedButtonV2 variant="secondary">
  Manual Mode
</UnifiedButtonV2>
```

### 4. Game Header
```jsx
<UnifiedHeaderV2
  zone="shloka-river"
  title="VAKRATUNDA - Click the elephants!"
  currentRound={playerInput.length}
  totalRounds={currentSequence.length + 1}
/>
```

---

## 🎨 Visual Design Details

### 3D Shadow Effect
- **Shadow height**: 6-8px (creates the "side" of the button)
- **Shadow color**: Darker, saturated version of button color
- **Floor shadow**: Subtle gray shadow for realism

### Gradient Direction
- **Top to bottom**: Light → Dark
- Makes buttons look like plastic toys catching light

### The "Squish" Animation
```css
.btn-toy-3d:active {
  transform: translateY(4px);  /* Move down half the shadow height */
  box-shadow: /* Reduced shadow to simulate press */
}
```

### Inner Highlight (White Sticker Edge)
```css
.btn-toy-3d::after {
  border: 2px solid rgba(255, 255, 255, 0.3);
}
```

---

## 📱 Responsive Design

All components automatically adjust for:
- **Mobile**: Smaller text, compact spacing
- **Tablet**: Medium sizes
- **Desktop**: Full sizes
- **4K+**: Larger text for readability

---

## 🚀 Migration from V1 to V2

### Replace V1 Header
```jsx
// OLD (V1)
import UnifiedHeader from './UnifiedHeader';
<UnifiedHeader zone="shloka-river" title="..." />

// NEW (V2)
import UnifiedHeaderV2 from './UnifiedHeaderV2';
<UnifiedHeaderV2 zone="shloka-river" title="..." />
```

### Update Button Styling
```jsx
// OLD (Custom styled buttons)
<button className="continue-btn" onClick={...}>
  Continue
</button>

// NEW (V2 Unified)
import UnifiedButtonV2 from './UnifiedButtonV2';
<UnifiedButtonV2 variant="success" onClick={...}>
  Continue
</UnifiedButtonV2>
```

---

## 🎭 Animation Timing

| Animation | Duration | Delay | Purpose |
|-----------|----------|-------|---------|
| Header Slide Down | 0.5s | 0s | Entry animation |
| Star Pop | 0.5s | 0s | When star fills |
| Star Glow | 1.5s loop | 0s | Current star pulse |
| Button Press | 0.1s | 0s | Tactile feedback |
| Heartbeat | 1.5s loop | 3s | Draw attention |

---

## 🔧 Customization

### Change Zone Colors
Edit the CSS variables in `UnifiedHeaderV2.css`:

```css
:root {
  --zone-river-base: #YourColor;
  --zone-river-accent: #YourAccent;
  --zone-river-shadow: #YourShadow;
}
```

### Adjust Button Gradients
Edit the variant classes in `UnifiedButtonV2.css`:

```css
.btn-primary {
  background: linear-gradient(to bottom, #TopColor, #BottomColor);
  box-shadow: 0 6px 0 #ShadowColor;
}
```

---

## 📊 Button Color Decision Tree

```
Is it a destructive action (Exit, Cancel)?
  YES → Red (danger)
  NO ↓

Is it a success/achievement action?
  YES → Gold (success)
  NO ↓

Is the user choosing between 2 options?
  YES → Green (recommended) + Blue (alternative)
  NO ↓

Is it a primary forward action (Continue, Start)?
  YES → Green (primary)
  NO → Blue (secondary)
```

---

## ✅ Testing Checklist

- [ ] Header displays with solid background
- [ ] Stars fill automatically as rounds progress
- [ ] Buttons show 3D shadow effect
- [ ] Buttons "squish" when clicked
- [ ] Heartbeat animation starts after 3 seconds
- [ ] Responsive on mobile, tablet, desktop
- [ ] Zone colors apply correctly
- [ ] All button variants render correctly

---

**Version**: 2.0.0
**Created**: January 2026
**Zones**: Shloka River, Symbol Mountain, Meaning Cave
**Design System**: Two-Layer (Walls + Toys)
