# Design System Implementation Guide

## Step-by-Step: How to Use the New Unified Design System

### 1. Import the CSS files and Components

```jsx
// At the top of your scene file, add these imports:

// Import unified components
import Button from '../../../lib/components/ui/Button/Button';
import Modal from '../../../lib/components/ui/Modal/Modal';
import Header from '../../../lib/components/ui/Header/Header';

// Import design system CSS
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';
```

### 2. Wrap Your Scene with data-zone Attribute

The root element of your scene should have the `data-zone` attribute:

```jsx
return (
  <div className="name-birthday-game" data-zone="about-me-hut">
    {/* All your content */}
  </div>
);
```

**Available zones:**
- `data-zone="about-me-hut"`
- `data-zone="symbol-mountain"`
- `data-zone="festival-square"`
- `data-zone="meaning-cave"`
- `data-zone="shloka-river"`

### 3. Replace Custom Buttons with Unified Button Component

**BEFORE (Custom Button):**
```jsx
<button className="game-modal-button" onClick={handleStartGame}>
  Let's Begin 🌱
</button>
```

**AFTER (Unified Button):**
```jsx
<Button
  variant="primary"    // Options: 'primary' | 'secondary' | 'info'
  size="large"         // Options: 'small' | 'medium' | 'large'
  onClick={handleStartGame}
>
  Let's Begin 🌱
</Button>
```

**Button Variants:**
- `primary` - Green action button (most common)
- `secondary` - Blue info/help button
- `info` - Gold success/reward button

### 4. Use Unified Modal Component

**BEFORE (Custom Modal):**
```jsx
{showHintModal && (
  <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
    <div className="hint-modal-content">
      <button className="hint-close-btn" onClick={() => setShowHintModal(false)}>✕</button>
      <h2>My name is:</h2>
      <p>GANESHA</p>
    </div>
  </div>
)}
```

**AFTER (Unified Modal):**
```jsx
<Modal
  isOpen={showHintModal}
  onClose={() => setShowHintModal(false)}
  title="Hint"
  confirmText="Got It!"
  size="medium"
>
  <p>My name is: <strong>GANESHA</strong></p>
  <p>Pop the balloons in this order!</p>
</Modal>
```

### 5. Use Unified Header Component

**Add a header to your scene:**
```jsx
<Header
  title="Name & Birthday Quest"
  subtitle="Discover Ganesha's special day!"
  leftElement={<BackToMapButton onNavigate={onNavigate} />}
/>
```

### 6. Use CSS Variables for Zone Colors

In your custom CSS, replace hardcoded colors with zone variables:

**BEFORE (Hardcoded Colors):**
```css
.game-background {
  background: #FFFDF2;
  border: 3px solid #8D4B38;
}

.game-title {
  color: #8D4B38;
}
```

**AFTER (Zone Variables):**
```css
.game-background {
  background: var(--zone-current-base);
  border: 3px solid var(--zone-current-accent);
}

.game-title {
  color: var(--zone-current-accent);
}
```

**Available Zone Variables:**
- `--zone-current-base` - Main background color (cream, mist, saffron, etc.)
- `--zone-current-accent` - Accent color (terracotta, slate, marigold, etc.)
- `--zone-current-shadow` - Shadow color (with opacity)
- `--zone-current-soft` - Soft secondary color

**Available Play Palette Variables (consistent across all zones):**
- `--play-action-green` - Primary buttons (#8ED641)
- `--play-joy-gold` - Success/stars (#FFD230)
- `--play-magic-blue` - Info/help (#4FC3F7)
- `--play-sticker-white` - Borders (#FFFFFF)
- `--play-text-main` - Main text (#4E342E)
- `--play-error-red` - Errors (#F44336)
- `--play-warning-orange` - Warnings (#FF9800)

### 7. Add Animation Classes

Use the shared animation classes:

```jsx
// Heartbeat animation
<div className="star-icon heartbeat">⭐</div>

// Bounce animation
<img src={ganesha} className="ganesha-avatar bounce" />

// Pulse for attention
<button className="hint-button pulse-infinite">💡 Hint</button>

// Fade in content
<div className="game-content fade-in">Welcome!</div>

// Glow effect
<div className="reward-badge glow">🏆</div>

// With delay
<div className="confetti-piece bounce delay-300">🎉</div>
```

**Available Animation Classes:**
- `heartbeat`, `heartbeat-infinite`
- `pulse`, `pulse-once`, `pulse-infinite`
- `bounce`, `bounce-infinite`
- `shake`
- `wobble`, `wobble-infinite`
- `fade-in`, `fade-in-slow`, `fade-in-fast`
- `fade-out`, `fade-out-slow`, `fade-out-fast`
- `scale-in`, `scale-in-slow`, `scale-out`
- `slide-in-top`, `slide-in-bottom`, `slide-in-left`, `slide-in-right`
- `spin`, `spin-slow`, `spin-fast`
- `glow`, `glow-green`
- `float`, `float-slow`
- `jiggle`
- `flip`
- `rotate-360`

**Utility Classes:**
- `delay-100`, `delay-200`, `delay-300`, `delay-500`, `delay-1000`
- `duration-fast`, `duration-normal`, `duration-slow`

---

## Complete Example: Refactored Intro Modal

### BEFORE:
```jsx
{sceneState.gamePhase === 'intro' && (
  <div className="game-modal-overlay" id="name-birthday-intro">
    <div className="game-modal-content">
      <div className="game-modal-character">
        <img src={babyGaneshaImg} alt="Baby Ganesha" />
      </div>
      <div className="game-modal-card">
        <h1 className="game-modal-title">Name & Birthday Quest!</h1>
        <p className="game-modal-subtitle">
          I have a special name and a special birthday.
          Let's discover them together!
        </p>
        <button className="game-modal-button" onClick={handleStartGame}>
          Let's Begin 🌱
        </button>
      </div>
    </div>
  </div>
)}
```

### AFTER:
```jsx
<Modal
  isOpen={sceneState.gamePhase === 'intro'}
  onClose={() => {}} // No close button needed
  title="Name & Birthday Quest!"
  confirmText="Let's Begin 🌱"
  onConfirm={handleStartGame}
  showCloseButton={false}
  closeOnOverlayClick={false}
  size="large"
>
  <div style={{ textAlign: 'center' }}>
    <img
      src={babyGaneshaImg}
      alt="Baby Ganesha"
      className="heartbeat"
      style={{ width: '150px', marginBottom: '20px' }}
    />
    <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
      I have a special name and a special birthday.<br />
      Let's discover them together!
    </p>
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
      <div className="fade-in delay-100">🔤 Name</div>
      <div className="fade-in delay-300">🎂 Birthday</div>
    </div>
  </div>
</Modal>
```

---

## Best Practices

### ✅ DO:
1. **Use unified Button component** for all action buttons
2. **Use zone-current-* variables** for backgrounds, headers, borders
3. **Use play-* variables** for interactive elements (buttons, stars, rewards)
4. **Add data-zone attribute** to the root element of each scene
5. **Use animation classes** instead of custom animations
6. **Keep text in normal case** (not uppercase) unless it's a badge/label

### ❌ DON'T:
1. Don't hardcode colors - use CSS variables
2. Don't create custom button styles - use the unified Button
3. Don't use zone colors for buttons - always use play colors
4. Don't create custom modals - use the unified Modal
5. Don't mix multiple zone accents on one screen
6. Don't use saturated/neon colors for backgrounds

---

## Quick Reference Card

```jsx
// IMPORTS
import Button from '../../../lib/components/ui/Button/Button';
import Modal from '../../../lib/components/ui/Modal/Modal';
import Header from '../../../lib/components/ui/Header/Header';
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';

// ROOT ELEMENT
<div data-zone="about-me-hut">

// BUTTON
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

// MODAL
<Modal
  isOpen={show}
  onClose={() => setShow(false)}
  title="Title"
  confirmText="OK"
>
  Content here
</Modal>

// HEADER
<Header
  title="Scene Title"
  subtitle="Scene subtitle"
  leftElement={<BackButton />}
/>

// ANIMATIONS
<div className="bounce delay-200">🎉</div>

// CSS VARIABLES
background: var(--zone-current-base);
color: var(--zone-current-accent);
border: 4px solid var(--play-sticker-white);
```

---

## Migration Checklist

For each scene file:

- [ ] Add imports for Button, Modal, Header, and CSS files
- [ ] Add `data-zone="zone-name"` to root element
- [ ] Replace custom buttons with `<Button>` component
- [ ] Replace custom modals with `<Modal>` component
- [ ] Replace hardcoded colors with CSS variables in custom CSS
- [ ] Add animation classes where appropriate
- [ ] Test in all zones to ensure colors adapt properly
- [ ] Remove unused custom button/modal CSS
