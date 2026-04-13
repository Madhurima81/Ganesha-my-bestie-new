# My Indian Story Game — Emoji Usage Mapping

Complete inventory of all emojis used in the scene, organized by location and purpose.

---

## 📊 Summary Statistics

| Category | Count | Type |
|----------|-------|------|
| Region Icons (INDIA_REGIONS) | 9 | Data property |
| Festival Icons (FESTIVALS) | 11 | Data property |
| Temple Spots (GANESHA_SPOTS) | 5 | Data property |
| UI Controls | 6 | Interactive buttons |
| Ganesha Character | 12+ | Character representation |
| Text/Story emojis | 20+ | Narrative/reactions |
| **Total** | **~63** | Across JSX & data |

---

## 🎯 Data Properties (Must Replace)

### 1. INDIA_REGIONS (Lines 21–31)
Replace `emoji` property in each region object:

| Region | Current | Use Case |
|--------|---------|----------|
| North India | ❄️ | Region selector button icon |
| Rajasthan & Gujarat | 🏜️ | Region selector button icon |
| Maharashtra | 🐘 | Region selector button icon |
| Madhya Pradesh | 🌿 | Region selector button icon |
| East India | 🌊 | Region selector button icon |
| Northeast India | 🌸 | Region selector button icon |
| South India | 🌴 | Region selector button icon |
| Mount Kailash | 🏔️ | Easter egg region button label + Ganesha's home icon |
| Other (Elsewhere) | 🌍 | Region selector button icon |

**JSX Usage:** Line 484 → `<span className="mis-region-emoji">{region.emoji}</span>`

**Replace Strategy:**
1. Create 9 region icon images (60×60px, about-me-hut theme colors)
2. Import each image
3. Replace `emoji: '❄️'` with `icon: northIcon` (or similar)
4. Update JSX: `<img src={region.icon} alt={region.label} />`

---

### 2. FESTIVALS (Lines 50–68)
Replace `emoji` property in each festival object:

| Festival | Current | Use Case | Triggered By |
|----------|---------|----------|--------------|
| Pongal | 🌾 | Festival wheel button | guessPhase='revealed' → line 640 |
| Holi | 🎨 | Festival wheel button | guessPhase='revealed' → line 640 |
| Ugadi | 🌸 | Festival wheel button | guessPhase='revealed' → line 640 |
| Raksha Bandhan | 🧵 | Festival wheel button | guessPhase='revealed' → line 640 |
| Janmashtami | 🪈 | Festival wheel button | guessPhase='revealed' → line 640 |
| **Ganesh Chaturthi** | 🐘 | Festival wheel + guess phase | Lines 59, 573 (guess option), 640 (wheel) |
| Navratri | 💃 | Festival wheel button | guessPhase='revealed' → line 640 |
| Dussehra | 🏹 | Festival wheel button | guessPhase='revealed' → line 640 |
| Diwali | 🪔 | Festival wheel button | guessPhase='revealed' → line 640 |
| Christmas | ⭐ | Festival wheel button | guessPhase='revealed' → line 640 |
| Eid | 🌙 | Festival wheel button | guessPhase='revealed' → line 640 |
| Onam | 🌺 | Festival wheel button | guessPhase='revealed' → line 640 |

**JSX Usage:** 
- Line 573: `<span className="mis-guess-emoji">{fest.emoji}</span>` (Guess phase)
- Line 640: `<span className="mis-wheel-emoji">{fest.emoji}</span>` (Wheel phase)
- Line 660: `<span key={f.id} className="mis-selected-fest-chip">{f.emoji} {f.label}</span>` (Selected chips)
- Line 730: `{f.emoji} {f.label}` (Origin card)

**Replace Strategy:**
1. Create 12 festival icon images (circular, 48×48px)
2. Import images into FESTIVALS array
3. Replace `emoji: '🎨'` with `icon: holiIcon`
4. Update JSX to render `<img src={fest.emoji}>`

---

### 3. GANESHA_SPOTS (Lines 74–80)
Replace `emoji` property in each spot object:

| Temple/Spot | Current | Purpose |
|-------------|---------|---------|
| Siddhivinayak, Mumbai | 🐘 | Revealed spot icon on map |
| Ashtavinayak, Pune | 🌸 | Revealed spot icon on map |
| Varanasi | 🕌 | Revealed spot icon on map |
| Hampi, Karnataka | 🌿 | Revealed spot icon on map |
| Tirupati | ⭐ | Revealed spot icon on map |

**JSX Usage:** Line 424 → `<span className="mis-spot-emoji">{spot.emoji}</span>`

**Replace Strategy:**
1. Create 5 temple/landmark icon images (40×40px)
2. Replace `emoji: '🐘'` with `icon: siddhivinayakIcon`
3. Update JSX: `<img src={spot.emoji}>`

---

## 🎮 UI Controls & Interactive Elements

### 1. Mute Button (Line 358)
```jsx
{isMuted ? '🔇' : isSpeaking ? '🔊' : '🔈'}
```

**Location:** Top-right corner  
**Replace with:** 3 icon images
- 🔇 = muted icon
- 🔊 = speaking icon  
- 🔈 = unmuted (idle) icon

**JSX:** Line 358 → `<img src={isMuted ? mutedIcon : ...} />`

---

### 2. Ganesha Character Face (Multiple Places)
Appears as tappable character throughout the game:

| Location | Line | Context |
|----------|------|---------|
| Modal opening | 291 | Fallback (if image fails) |
| Opening title bar | 297 | Title decoration (right side) |
| Step 1 instructions | 383 | Tappable "tap to hear again" |
| Step 2 instructions | 468 | Tappable "tap to hear again" |
| Step 3 instructions | 516 | Tappable "tap to hear again" |
| Step 3 (repeat) | 555 | Tappable "tap to hear again" |
| Step 4a (correct) | 585 | Large celebration display (size: 80×80) |
| Step 4b instructions | 599 | Tappable "tap to hear again" |
| Step 4b (wheel center) | 618 | Center of festival wheel |
| Step 5 instructions | 681 | Tappable "tap to hear again" |
| Origin card | 693, 700, 708 | Card display (connected with child region) |

**Current:** All use `🐘` (unicode elephant emoji)  
**Replace with:** Ganesha character image (already have `/assets/about-me-hut/ganesha-sitting.png` for modal)

**Strategy:**
- Use the same Ganesha image across all locations
- For small tappable instances (line 383, 468, etc), resize to 40×40px
- For large celebration (line 585), use 80×80px
- For origin card (line 708), use 60×60px in circular container

---

## 📝 Text Emojis (Narrative & Reactions)

These appear **within text strings** (not as data properties). Consider replacing for custom narration or keeping as-is since they're embedded in dialogue:

### Region Ganesha Facts (embedded in `ganeshaFact` strings)
- 🕌 (temple) — Line 22
- 🚪 (door) — Line 23  
- 🍬 (modak) — Line 24
- 🐭 (mouse Mushika) — Lines 25, 61
- 🎊 (celebration) — Line 26
- ☕ (tea) — Line 27
- 🙏 (prayer) — Line 28
- 😄 (happy face) — Lines 29, 55
- 💛 (heart) — Lines 30, 57, 589, 704, 738
- 🇮🇳 (India flag) — Line 392

### Festival Ganesha Reactions (embedded in `ganeshaReact` strings)
- ☀️ (sun) — Line 52
- 🕺 (dancer) — Lines 54, 61
- 🥰 (love eyes) — Line 58
- 🎉 (celebration) — Lines 59, 587, 738
- 🙌 (hands up) — Line 62
- ✨ (sparkle) — Lines 65, 747
- 🌙 (moon) — Line 66
- 🍽️ (feast) — Line 67

### UI Text Emojis
- 🌏 (globe) — Line 295 (modal left decoration)
- 🐘 (elephant) — Line 297 (modal right decoration)
- 🏡 (home) — Line 308 (home icon in step 1)
- 🌍 (globe) — Line 504 (text in button)
- 🎉 (celebration) — Lines 584, 591 (burst animation)
- 💛 (heart connector) — Line 704 (between Ganesha and child on origin card)

---

## 🛠️ Replacement Checklist

### High Priority (Visible UI)
- [ ] 9 Region icons — create/import
- [ ] 12 Festival icons — create/import  
- [ ] 5 Temple spot icons — create/import
- [ ] Mute button icons (3 states) — create/import
- [ ] Ganesha character — use existing or new image

### Medium Priority (Decorative)
- [ ] Modal decoration emojis (🌏, 🐘)
- [ ] Home icon 🏡 (can reuse from Ganesha icon set)
- [ ] Celebration burst 🎉
- [ ] Heart connector 💛

### Low Priority (Embedded in Text)
- [ ] Reaction emojis in dialogue — consider keeping or swapping for text descriptions
- [ ] Festival/region fact emojis — contextual, can be text-only or small inline icons

---

## 🔄 Implementation Path

1. **Create asset images:**
   - 9 region icons (60×60px, PNG)
   - 12 festival icons (48×48px, PNG)
   - 5 temple spot icons (40×40px, PNG)
   - 3 mute state icons (32×32px, PNG)
   - 1 Ganesha character (multiple sizes: 40, 60, 80px)

2. **Update data arrays** (Lines 21–80):
   ```js
   // OLD:
   { emoji: '❄️', ... }
   
   // NEW:
   { icon: northIcon, iconAlt: 'North India', ... }
   ```

3. **Update JSX rendering**:
   ```jsx
   // OLD:
   <span>{region.emoji}</span>
   
   // NEW:
   <img src={region.icon} alt={region.iconAlt} className="region-icon" />
   ```

4. **Update CSS** (MyIndianStoryGame.css):
   - Add `.region-icon`, `.festival-icon`, `.spot-icon` classes
   - Set consistent sizing + aspect ratio preservation

5. **Test each section:**
   - Region selection (Step 2)
   - Festival guess & wheel (Step 4)
   - Origin card (Step 5)

---

## 📂 Suggested File Structure

```
src/zones/about-me-hut/indian-story/assets/
├── icons/
│   ├── regions/
│   │   ├── north.png
│   │   ├── rajasthan.png
│   │   ├── ... (7 more)
│   │   └── kailash.png
│   ├── festivals/
│   │   ├── pongal.png
│   │   ├── holi.png
│   │   ├── ... (10 more)
│   │   └── onam.png
│   ├── temples/
│   │   ├── siddhivinayak.png
│   │   ├── ashtavinayak.png
│   │   ├── varanasi.png
│   │   ├── hampi.png
│   │   └── tirupati.png
│   ├── controls/
│   │   ├── mute.png
│   │   ├── speaker.png
│   │   └── speaker-wave.png
│   └── ganesha-character.png
```

---

## Notes

- **Aspect Ratio:** Preserve 1:1 (square) for all icons
- **Color Scheme:** Use About Me Hut zone colors (#795548, #FF6B6B, #FBE9E7)
- **Consistency:** Match style with existing About Me Hut game assets (FamilyTreeGame, FavoriteFoodGame)
- **Accessibility:** Always include `alt` text for images
- **Fallback:** Consider keeping emoji in `alt` text as fallback if image fails to load

