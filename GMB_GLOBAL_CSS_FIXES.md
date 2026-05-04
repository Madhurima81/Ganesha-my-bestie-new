# GMB Global CSS Fixes — iPad & Font Issues

**Apply these fixes in order BEFORE auditing individual scenes.** These are app-wide fixes; scene-specific issues come after.

---

## 1. `index.html` — Fix Font Loading

**Replace** the existing Google Fonts `<link>` with this block (loads all weights, fixes iOS CORS):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Why:** Old link only loaded weights 600/800 — but CSS uses 400/700 too, causing iPad to fall back to a cursive system font.

---

## 2. `App.css` — Remove Broken Scaling Block

### Delete this entire section
The block starting with `/* RESPONSIVE UI SCALING FOR CHILDREN'S APP */` down to the file's final `}`.

It contains `transform: scale(1.3 / 1.6 / 1.8)` rules that force everything to be 130–180% bigger on iPad. **This is the #1 cause of "everything looks huge."** Bonus bug: the block is nested inside `@media (max-width: 480px)` — invalid CSS that older Safari mishandles.

### Also delete the old body font-family
Find:
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
}
```
Delete it.

### Add this at the end of `App.css`
```css
:root {
  --font-heading: 'Baloo 2', system-ui, -apple-system, sans-serif;
  --font-body: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

---

## 3. `ZoneWelcome.css` — Two Fixes

### Fix A: Delete the duplicate `@import` (line 5)
```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&...');
```
Already loaded in `index.html` — `@import` blocks rendering and slows iPad.

### Fix B: Remove `cursive` fallback
Find-and-replace in this file:
- **Find:** `'Baloo 2', cursive`
- **Replace:** `'Baloo 2', system-ui, sans-serif`
- 5 occurrences

**Why:** When Baloo 2 hasn't loaded yet, `cursive` tells iOS Safari to render in Snell Roundhand / handwriting fonts. That's the cursive flash you saw.

---

## 4. `OpeningModal.css` — Sizing + Font Fix

### Fix A: Replace `.game-modal-content` and `.game-modal-card`
```css
.game-modal-content {
  position: relative;
  width: 95%;
  max-width: 1700px;
  max-height: 90vh;        /* was: height: 80vh */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 0 60px;
  transform: translateY(-30px);
}

.game-modal-card {
  position: relative;
  flex: 0 0 50%;
  max-width: 700px;
  min-height: auto;        /* was: 600px */
  max-height: 85vh;        /* added */
  background: linear-gradient(180deg, #FFFDF4 0%, #FFF4D8 100%);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.18),
    0 0 0 6px rgba(255,255,255,0.35);
  border-radius: 36px;
  padding: 50px 50px;      /* was: 70px 60px */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: cardEntry 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
  overflow-y: auto;        /* added */
}
```

### Fix B: Use clamp() on title, subtitle, button
```css
.game-modal-title {
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-size: clamp(32px, 4vw, 60px) !important;
  font-weight: 800;
  color: var(--modal-text-primary);
  margin-bottom: 24px;
  line-height: 1.1;
  width: 100%;
}

.game-modal-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: clamp(18px, 2.2vw, 36px) !important;
  color: var(--modal-text-secondary);
  line-height: 1.4;
  margin-bottom: 24px !important;
  max-width: 90%;
}

.game-modal-button {
  font-family: 'Baloo 2', system-ui, sans-serif;
  background: var(--modal-btn-bg);
  color: var(--modal-btn-text);
  border: 2px solid var(--modal-btn-border, transparent);
  min-height: 64px;
  padding: clamp(14px, 2vw, 24px) clamp(40px, 5vw, 80px);
  font-size: clamp(18px, 2.2vw, 34px);
  font-weight: 800;
  border-radius: 90px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  box-shadow: 0 10px 28px var(--modal-btn-shadow);
  text-transform: capitalize;
  white-space: nowrap;
  margin-top: 16px;
}
```

### Fix C: Replace iPad media query
```css
@media (min-width: 768px) and (max-width: 1024px) {
  .game-modal-content { max-height: 88vh; padding: 0 30px; gap: 16px; }
  .game-modal-card { padding: 36px 32px; max-height: 80vh; }
  .game-modal-character img,
  .game-modal-character .game-modal-ganesha { max-width: 380px; }
  .game-modal-title { font-size: 36px !important; margin-bottom: 16px; }
  .game-modal-subtitle { font-size: 20px !important; margin-bottom: 16px !important; }
  .game-modal-icons { gap: 14px; margin: 12px 0 20px; }
  .game-modal-icon-item img,
  .game-modal-icon-circle { width: 100px !important; height: 100px !important; }
  .game-modal-button { font-size: 22px; min-height: 56px; padding: 14px 50px; }
}
```

### Fix D: Find-and-replace `'Baloo 2', cursive`
- **Find:** `'Baloo 2', cursive`
- **Replace:** `'Baloo 2', system-ui, sans-serif`
- 4 occurrences

---

## 5. `SymbolMountainSceneV3.jsx` — Instrument Sizes

**Replace lines 165–170** — instruments are hardcoded too large:

```js
const isTablet = typeof window !== 'undefined' && window.innerWidth <= 1024;
const s = isTablet ? 0.7 : 1;

const instrumentSizesByType = {
  tabla:     { eyes: { discovered: 290*s, glow: 150*s, hidden: 120*s }, ears: 290*s, pattern: 102*s },
  dholak:    { eyes: { discovered: 290*s, glow: 150*s, hidden: 120*s }, ears: 290*s, pattern: 102*s },
  harmonium: { eyes: { discovered: 350*s, glow: 150*s, hidden: 120*s }, ears: 390*s, pattern: 102*s },
  tanpura:   { eyes: { discovered: 290*s, glow: 170*s, hidden: 135*s }, ears: 310*s, pattern: 122*s }
};
```

Tweak `0.7` to `0.65` or `0.75` after testing on real iPad.

---

## 6. Image Best Practices (do alongside CSS)

| Image Type | Format | Max Size | Dimensions |
|---|---|---|---|
| Scene backgrounds | WebP (PNG fallback) | 150–250 KB | 1536×1152 max |
| Characters / sprites | WebP or PNG-8 | 30–80 KB | 2x display size |
| UI icons | SVG | < 10 KB | vector |
| Modal illustrations | WebP | 80–150 KB | 1024px wide max |

**Total scene weight target: under 1.5 MB.**

### Quick wins
1. Convert PNGs to WebP at 75% quality → use [Squoosh.app](https://squoosh.app) (free, drag-drop)
2. Add `loading="lazy"` to non-critical `<img>` tags
3. Preload next scene's hero image while child is in current scene
4. Use 2x retina max — iPad Gen 6 doesn't need 3x

---

## Testing Order

1. Apply all fixes above → `npm run build` → push to Netlify
2. **On iPad: Settings → Safari → Clear History and Website Data** (critical — Safari aggressively caches old fonts/CSS)
3. Reopen app on real iPad
4. Verify: Baloo 2 displays correctly + modal isn't iPad-height + welcome page proportional

---

## Rule of Thumb for Scene-by-Scene Audit

When auditing each scene CSS:

- **`clamp()`** = primary tool for fonts, padding, sizes (works on all iPads automatically)
- **Media queries** = only for *layout shifts* (flex direction change, hide element, different grid)
- **Never use both** for the same property — pick one
- **Find-and-replace** `'Baloo 2', cursive` → `'Baloo 2', system-ui, sans-serif` in every scene CSS
- **Hardcoded `px` values above ~50px** are usually wrong — convert to `clamp()` or scale via `vw`
- **`transform: scale()` in media queries** = remove (use proper sizing instead)

---

## Send Scenes One-by-One

When ready, send each scene CSS (one per message) and I'll audit:
1. Cursive fallbacks
2. Conflicting clamp + media query rules
3. Hardcoded oversized values
4. Layout-breaking transform: scale
