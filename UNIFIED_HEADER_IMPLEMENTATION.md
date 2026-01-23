# Unified Header with Star Progress - Implementation Guide

## Overview
Replaced traditional progress bars with a star-based progress system that automatically tracks rounds during gameplay (VA, KRA, TUN/DA).

## Files Created/Modified

### ✨ New Files

1. **`src/zones/shloka-river/core/UnifiedHeader.jsx`**
   - React component for star-based progress header
   - Automatically animates stars as rounds complete
   - Accepts zone theming (shloka-river, symbol-mountain, meaning-cave)

2. **`src/zones/shloka-river/core/UnifiedHeader.css`**
   - Complete styling with zone-specific colors
   - Star animations (fill, pulse, glow)
   - Fully responsive (mobile to 4K)

3. **`unified-header-demo.html`**
   - Interactive demo to test the header
   - Shows all three zone themes
   - Click buttons to see star progression

### 🔧 Modified Files

1. **`src/zones/shloka-river/core/AutoPlayMode.jsx`**
   - Added import: `import UnifiedHeader from './UnifiedHeader';`
   - Replaced old header (lines 836-854)
   - Now uses `<UnifiedHeader>` component

## How It Works

### Star Progression Logic
For VAKRATUNDA (3 syllables):
- **Round 1**: VA - 1 star filled
- **Round 2**: KRA - 2 stars filled
- **Round 3**: TUN/DA - 3 stars filled (complete)

The component tracks `playerInput.length` to automatically fill stars as the player progresses.

### Props

```jsx
<UnifiedHeader
  zone="shloka-river"          // Theme: shloka-river | symbol-mountain | meaning-cave
  title="VAKRATUNDA - Get Ready... 3"  // Dynamic header text
  currentRound={2}             // Current progress (0-3)
  totalRounds={3}              // Total stars to show
/>
```

## Zone-Specific Theming

### Shloka River (Cyan)
```css
.zone-shloka-river {
  border-color: #4DD0E1;
  --star-filled: #4DD0E1;
}
```

### Symbol Mountain (Gold)
```css
.zone-symbol-mountain {
  border-color: #FFD700;
  --star-filled: #FFD700;
}
```

### Meaning Cave (Amber)
```css
.zone-meaning-cave {
  border-color: #FFC107;
  --star-filled: #FFC107;
}
```

## Features

### ✨ Animations
1. **Star Fill Animation**: Rotates and scales when filled
2. **Pulse Effect**: Filled stars continuously pulse
3. **Glow Effect**: Current star has glowing effect
4. **Slide Down**: Header slides down on mount

### 📱 Responsive Design
- **Mobile (< 600px)**: 24px stars, compact layout
- **Tablet (768-1023px)**: 36px stars
- **Desktop (1920px+)**: 42px stars
- **All sizes**: Maintains proportions and readability

## Testing

### 1. Test the Demo HTML
Open `unified-header-demo.html` in your browser:
```bash
# Windows
start unified-header-demo.html

# Mac
open unified-header-demo.html
```

### 2. Test in Vakratunda Scene
1. Navigate to Shloka River zone
2. Start Vakratunda scene
3. Watch stars fill automatically as you complete syllables:
   - VA completes → 1st star fills
   - KRA completes → 2nd star fills
   - TUN/DA completes → 3rd star fills

## Next Steps

### To Apply to Other Zones

#### Symbol Mountain
```jsx
// In symbol-mountain scene
import UnifiedHeader from '../../shloka-river/core/UnifiedHeader';

<UnifiedHeader
  zone="symbol-mountain"
  title="EKADANTA Power!"
  currentRound={currentProgress}
  totalRounds={8}  // 8 symbols
/>
```

#### Meaning Cave
```jsx
// In meaning-cave scene
import UnifiedHeader from '../../shloka-river/core/UnifiedHeader';

<UnifiedHeader
  zone="meaning-cave"
  title="Discover Meaning"
  currentRound={unlockedMantras}
  totalRounds={6}  // 6 mantras
/>
```

## Customization

### Change Star Count
Simply adjust `totalRounds` prop:
```jsx
<UnifiedHeader
  totalRounds={5}  // Shows 5 stars instead of 3
/>
```

### Change Colors
Edit `UnifiedHeader.css`:
```css
:root {
  --star-filled: #your-color;
  --star-empty: rgba(your-color, 0.3);
}
```

### Change Star Size
Modify in `UnifiedHeader.css`:
```css
.star {
  width: 40px;   /* Change from 32px */
  height: 40px;
}
```

## Troubleshooting

### Stars not showing
- Check console for errors
- Verify SVG definitions are loaded
- Ensure CSS file is imported

### Wrong number of stars
- Check `totalRounds` prop matches syllables
- Verify `currentRound` is updating correctly

### Colors not zone-specific
- Check `zone` prop is set correctly
- Verify zone-specific CSS classes exist

## Architecture

```
UnifiedHeader.jsx (Logic)
    ↓
UnifiedHeader.css (Styles)
    ↓
Zone-specific themes
    ↓
Responsive breakpoints
```

## Performance
- Uses CSS animations (GPU-accelerated)
- Minimal re-renders (memoized state updates)
- SVG for crisp stars at any resolution

---

**Created**: January 2026
**Version**: 1.0.0
**Zones**: Shloka River, Symbol Mountain, Meaning Cave
