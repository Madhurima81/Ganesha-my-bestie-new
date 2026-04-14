# Phase 5 (FESTIVALS_GANESHA) — Specification

## Current State
- Phase 5 displays 5 festival cards in a guessing game
- Cards: Pongal, Holi, Janmashtami, Ganesh Chaturthi, Diwali
- Each card shows icon + text label below

## Desired Changes

### Layout Structure
**Grid: 2 rows**
- **Row 1 (top):** 2 cards — Pongal, Holi (CENTERED horizontally on screen)
- **Row 2 (bottom):** 3 cards — Janmashtami, Ganesh Chaturthi, Diwali (CENTERED horizontally on screen)

### Card Content
- ✅ **Images/icons ONLY** — remove text labels completely
- ✅ **Bigger images** — icon size should be ~180–200px (much larger than current)

### Positioning
- ✅ **Move cards DOWN** — significant vertical spacing from top of container
- ✅ **TOP ROW CENTERED ABOVE BOTTOM ROW** — 
  - Currently: top 2 cards are RIGHT-aligned with bottom 3 cards (WRONG)
  - Fix: top 2 cards should be CENTERED above the bottom 3 cards
  - Visual alignment: 2 middle cards sit in the center gap between cards 3/4 and 4/5

### Visual Details
- Card background: white/light
- Border on hover/wrong guess: red/shake animation (unchanged)
- Border on correct guess: gold glow (unchanged)
- Gap between cards: ~48px (unchanged)

---

## Exact Implementation
- Find the FESTIVALS_GANESHA phase JSX section
- Locate the grid container and individual card buttons
- **Remove:** All `<p>` or text labels showing festival names
- **Increase:** Icon `width` and `height` from current to ~180–200px
- **Add:** `marginTop: 150–200px` to container (or grid wrapper) to move cards down
- **Ensure:** Both grid rows use `justifyContent: 'center'` for horizontal centering

---

## Approval Checklist
- [ ] User confirms layout structure (2 rows, 2+3 cards, centered)
- [ ] User confirms icon sizes (~180–200px)
- [ ] User confirms positioning (moved down, centered)
- [ ] User confirms no text labels visible

**Once approved, Claude will:**
1. Read Phase 5 JSX code
2. Remove text labels from all 5 cards
3. Increase icon sizes to ~180–200px
4. Add margin-top to position cards lower
5. Verify centering with flexbox `justifyContent: 'center'`
6. Test in browser
