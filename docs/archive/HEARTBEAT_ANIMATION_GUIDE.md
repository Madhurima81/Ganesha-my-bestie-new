# 💓 Heartbeat Animation Implementation Guide

## Overview

The heartbeat animation has been added to guide children's attention to primary action buttons with a **3-second delay** and **golden glow effect**.

---

## ✅ What Was Added

### 1. **New Animation Classes** (in `animations.css`)

```css
.heartbeat-delayed
/* Waits 3 seconds, then pulses 3 times with gold glow */

.heartbeat-gentle
/* Waits 3 seconds, then pulses forever with gold glow */
```

### 2. **Automatic Pause on Hover**
- Animation pauses when child hovers (reading/interacting)
- Resumes when mouse moves away

### 3. **Gold Glow Effect**
- Uses `--play-joy-gold` color for the glow
- Creates visual "call to action" effect

---

## 🎯 When to Use Each Type

### `heartbeat-delayed` (Recommended for most CTAs)
**Use for:** Primary action buttons where you want to draw attention
**Behavior:** Pulses 3 times, then stops
**Examples:**
- "Let's Begin 🌱"
- "Let's Explore 🌼"
- "Tell You My Birthday! 🎉"

```jsx
<Button
  variant="primary"
  size="large"
  onClick={handleNext}
  className="heartbeat-delayed"
>
  Let's Begin 🌱
</Button>
```

### `heartbeat-gentle` (Use sparingly)
**Use for:** Buttons that need continuous attention
**Behavior:** Pulses forever (until clicked)
**Examples:**
- Final "Finish" button
- "Claim Reward" buttons

```jsx
<Button
  variant="info"
  size="large"
  onClick={handleFinish}
  className="heartbeat-gentle"
>
  Finish Game ✨
</Button>
```

### No heartbeat
**Use for:** Secondary buttons, cancel buttons, back buttons
**Examples:**
- "Delete"
- "← Change Month"
- "Cancel"

```jsx
<Button
  variant="secondary"
  size="medium"
  onClick={handleBack}
  withHeartbeat={false}
>
  ← Back
</Button>
```

---

## 📋 Implementation Checklist

For the **Namebirthdaygame.jsx** file, add `heartbeat-delayed` to these buttons:

- [ ] Line 591: "What is your name? 👋" ✅ Primary CTA
- [ ] Line 633: "Tell You My Birthday! 🎉" ✅ Primary CTA
- [ ] Line 732: "Let's Explore 🌼" ✅ Primary CTA
- [ ] Line 713: "Finish Game ✨" ✅ Use `heartbeat-gentle` (final button)

**Don't add to these:**
- [ ] Line 611-619: Delete/Confirm buttons ❌ (User decision, not guided)
- [ ] Line 673: "← Change Month" ❌ (Secondary action)
- [ ] Line 539: "💡 Hint" ❌ (Already has `pulse-infinite`)

---

## 🎨 The 3-Second Delay Philosophy

**Why 3 seconds?**
1. ⏱️ **Reading time** - Child reads the title and description
2. 👀 **Natural discovery** - Child scans the screen first
3. 💡 **Gentle guidance** - Heartbeat appears as a "hint" after they've oriented

**Example timeline:**
```
0s:  Modal appears, child reads title
1s:  Child reads description
2s:  Child looks around screen
3s:  💓 Heartbeat starts - "Oh! I should click this!"
5s:  💓 Second pulse
7s:  💓 Third pulse
9s:  Animation stops (doesn't become annoying)
```

---

## 🔧 Technical Details

### Animation Specifications
- **Delay:** 3 seconds
- **Duration:** 2 seconds per pulse
- **Iterations:** 3 times (delayed) or infinite (gentle)
- **Scale:** 1.0 → 1.05 → 1.0
- **Glow:** 0 → 20px → 30px gold glow at peak

### CSS Variables Used
- `--play-joy-gold` - Gold glow color (#FFD230)
- Animation pauses on `:hover`

---

## 📝 Example: Before & After

### Before (No heartbeat):
```jsx
<Button
  variant="primary"
  size="large"
  onClick={() => sceneActions.updateState({ gamePhase: 'child-name-input' })}
>
  What is your name? 👋
</Button>
```

### After (With delayed heartbeat):
```jsx
<Button
  variant="primary"
  size="large"
  onClick={() => sceneActions.updateState({ gamePhase: 'child-name-input' })}
  className="heartbeat-delayed"
>
  What is your name? 👋
</Button>
```

**What the child experiences:**
1. Modal appears with Ganesha
2. Child reads "Hi! I am Ganesha."
3. Child sees button
4. *3 seconds pass*
5. Button starts glowing and pulsing gently 💓
6. Child's attention drawn to action
7. Pulses 2 more times
8. Stops (not overwhelming)

---

## ⚠️ Best Practices

### ✅ DO:
- Use `heartbeat-delayed` for primary CTAs
- Keep it to ONE button per screen
- Use 3-second delay (gives time to read)
- Pause on hover (child is interacting)
- Limit to 3 pulses (not annoying)

### ❌ DON'T:
- Add to multiple buttons on same screen
- Use for secondary actions
- Use for buttons requiring careful decision
- Use infinite heartbeat except for final actions
- Skip the delay (overwhelming for child)

---

## 🎯 Applying to Other Scenes

Pattern to follow:

```jsx
// 1. Find the primary "next step" button
<Button variant="primary" size="large" onClick={handleNext}>
  Continue
</Button>

// 2. Add heartbeat-delayed class
<Button
  variant="primary"
  size="large"
  onClick={handleNext}
  className="heartbeat-delayed"
>
  Continue
</Button>

// 3. Keep secondary buttons without heartbeat
<Button
  variant="secondary"
  size="medium"
  onClick={handleBack}
  withHeartbeat={false}
>
  Back
</Button>
```

---

## 🧪 Testing

Test these scenarios:

1. **Timing:** Button pulses start after 3 seconds
2. **Count:** Button pulses exactly 3 times (delayed version)
3. **Glow:** Gold glow appears during pulse
4. **Hover:** Animation pauses when hovering
5. **Resume:** Animation resumes when not hovering
6. **Scale:** Button grows 5% during pulse
7. **No conflict:** Doesn't interfere with click action

---

## 📊 Summary

**Files Modified:**
- ✅ `animations.css` - Added heartbeat-delayed and heartbeat-gentle
- ✅ `Button.jsx` - Updated to skip built-in heartbeat if delayed version used

**Ready to Apply:**
- Add `className="heartbeat-delayed"` to primary CTA buttons
- Add `className="heartbeat-gentle"` to final action buttons
- Keep `withHeartbeat={false}` for secondary buttons

**Result:**
- 🎯 Better user guidance
- 👶 Child-friendly attention system
- ✨ Beautiful gold glow effect
- ⏱️ Perfect 3-second timing
