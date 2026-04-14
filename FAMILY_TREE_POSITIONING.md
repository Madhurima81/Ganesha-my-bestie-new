# Family Tree Scene — Circle Positioning Guide

## Overview
The Family Tree game has **4 interactive circles** positioned on a tree illustration. Each circle aligns with a foliage lobe or the trunk, where players tap to place family members.

---

## Tree Anatomy
The tree illustration (`family_tree.png`) has:
- **3 foliage lobes** at the top (left, center, right)
- **1 trunk** below the foliage
- **Aspect ratio:** Portrait (taller than wide)
- **Layout:** Centered in viewport with `object-fit: contain`

---

## Current Positioning

| Member ID | Role | Current Position | Tree Zone | Visual Target |
|-----------|------|------------------|-----------|---------------|
| `father` | Father (Shiva) | `top: 30%, left: 35%` | Left lobe | Center of left foliage circle |
| `mother` | Mother (Parvati) | `top: 30%, right: 25%` | Right lobe | Center of right foliage circle |
| `brother` | Brother (Kartikeya) | `bottom: 25%, left: 45%` | Trunk/lower area | Left side of trunk base |
| `myself` | Me (Ganesha) | `bottom: 25%, right: 30%` | Trunk/lower area | Right side of trunk base |

---

## Refined Positioning Recommendations

### Why Adjust?
Current positioning is solid, but slight refinements ensure circles align **exactly** with foliage centers and trunk features, making the scene feel more cohesive with the soft glow design.

### Recommended Values

```javascript
// In Familytreegame.jsx, line 424-448
const ganeshaFamily = [
  {
    id: 'father',
    role: 'Father',
    // LEFT LOBE CENTER
    position: { top: '28%', left: '32%' },
    // Moved up slightly and left to center on left foliage
  },
  {
    id: 'mother',
    role: 'Mother',
    // RIGHT LOBE CENTER
    position: { top: '28%', right: '20%' },
    // Moved up slightly and left (in from right edge) to center on right foliage
  },
  {
    id: 'brother',
    role: 'Brother',
    // TRUNK LOWER LEFT
    position: { bottom: '28%', left: '42%' },
    // Moved down slightly and right to align with left-center trunk area
  },
  {
    id: 'myself',
    role: 'Me',
    // TRUNK LOWER RIGHT
    position: { bottom: '28%', right: '28%' },
    // Moved down slightly to align with right-center trunk area
  }
];
```

---

## Positioning Strategy

### For the Foliage Circles (Father & Mother)
- **Vertical:** `top: 28%` — This places them in the **upper-middle** of the foliage, accounting for the tree's rounded top
- **Horizontal:** 
  - Father (left): `left: 32%` — About 1/3 from the left edge
  - Mother (right): `right: 20%` — About 1/5 from the right edge (accounts for asymmetry in tree)

### For the Trunk Circles (Brother & Me)
- **Vertical:** `bottom: 28%` — This places them in the **lower foliage/upper trunk** area
- **Horizontal:**
  - Brother (left): `left: 42%` — Slightly left of center
  - Me (right): `right: 28%` — Slightly right of center

---

## Responsive Behavior
- The tree uses `object-fit: contain`, so it scales responsively
- Percentage-based positioning scales proportionally on all devices
- Circle sizes (250px × 250px) may appear larger on mobile — consider testing on tablet/phone to verify visual balance

---

## Implementation Checklist

- [ ] Update `position` values in `ganeshaFamily` array (Familytreegame.jsx, lines 427, 433, 439, 445)
- [ ] Test positioning on desktop (1920×1080, 1366×768)
- [ ] Test positioning on tablet (768×1024)
- [ ] Test positioning on mobile (375×812)
- [ ] Verify soft green glow aligns nicely with foliage in the updated positions
- [ ] Verify wooden tag labels don't overlap with other circles
- [ ] Confirm tap feedback animation (scale 1→1.06) works smoothly

---

## CSS Changes Applied ✅

| Change | File | Lines | Status |
|--------|------|-------|--------|
| Remove yellow dashed border | Familytreegame.css | 644-673 | ✅ Done |
| Add soft green leaf glow | Familytreegame.css | 637-673 | ✅ Done |
| Update glow animations | Familytreegame.css | 675-722 | ✅ Done |
| Style labels as wooden tags | Familytreegame.css | 725-761 | ✅ Done |
| Add "string" effect to labels | Familytreegame.css | 725-761 | ✅ Done |
| Add tap feedback animation | Familytreegame.css | 4055-4069 | ✅ Done |
| Apply tap feedback to circles | Familytreegame.css | 624-635 | ✅ Done |

---

## Next Steps

1. **Update JSX positioning** — Replace the 4 position values in Familytreegame.jsx
2. **Visual test** — Start the dev server and verify circles align beautifully
3. **Edge case test** — Tap circles, flip cards, check animations feel natural
4. **Multi-device test** — Test on mobile/tablet to ensure responsive scaling

---

## Design Reference

**Soft Green Leaf Glow (CSS)**
```css
/* Inner glow */
#9FE27D

/* Outer glow */
rgba(159, 226, 125, 0.35)

/* Subtle pulse every 1.6s — feels like light through leaves */
```

**Wooden Tag Labels (CSS)**
```css
Background: #F6E8C8 (warm tan)
Border: #D8C4A0 (warm brown)
Text: #6B4F2C (dark brown)
Shadow: 0 2px 4px rgba(0, 0, 0, 0.12)
```

**Tap Feedback**
```css
Scale: 1 → 1.06
Duration: 0.18s
Easing: ease-out
```

---

## Final Visual Effect

When positioned correctly with the new styling:
- ✨ Circles look like **sunlight patches in leaves**, not UI overlays
- 🏷️ Labels feel like **wooden tree tags**, not buttons
- 👆 Tap feedback is **subtle and playful**, inviting interaction
- 🌿 Overall scene feels **cohesive** — an integrated illustration, not UI on top

