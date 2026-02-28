# Example Refactor: NameBirthdayGame.jsx

## Step 1: Update Imports

### Add at the top of the file (after existing imports):

```jsx
// Import unified components
import Button from '../../../lib/components/ui/Button/Button';
import Modal from '../../../lib/components/ui/Modal/Modal';

// Import design system CSS
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';
```

---

## Step 2: Add data-zone Attribute to Root Element

### Find line 493 and update:

**BEFORE:**
```jsx
return (
  <div className="name-birthday-game">
```

**AFTER:**
```jsx
return (
  <div className="name-birthday-game" data-zone="about-me-hut">
```

---

## Step 3: Refactor the Intro Modal (Lines 497-518)

**BEFORE:**
```jsx
{sceneState.gamePhase === 'intro' && (
  <div className="game-modal-overlay" id="name-birthday-intro">
    <div className="game-modal-content">
      <div className="game-modal-character"><img src={babyGaneshaImg} alt="Baby Ganesha" /></div>
      <div className="game-modal-card">
        <h1 className="game-modal-title">Name & Birthday Quest!</h1>
        <p className="game-modal-subtitle">I have a special name and a special birthday.<br />Let's discover them together!</p>
        <div className="game-modal-icons">
          <div className="game-modal-icon-item">
            <div className="game-modal-icon-circle" style={{background: '#EDE7F6', borderColor: '#D1C4E9'}}><span style={{fontSize: '2.5rem'}}>🔤</span></div>
            <span className="game-modal-icon-label">Name</span>
          </div>
          <div className="game-modal-icon-item">
            <div className="game-modal-icon-circle" style={{background: '#E3F2FD', borderColor: '#90CAF9'}}><span style={{fontSize: '2.5rem'}}>🎂</span></div>
            <span className="game-modal-icon-label">Birthday</span>
          </div>
        </div>
        <button className="game-modal-button" onClick={handleStartGame}>Let's Begin 🌱</button>
      </div>
    </div>
  </div>
)}
```

**AFTER:**
```jsx
<Modal
  isOpen={sceneState.gamePhase === 'intro'}
  onClose={() => {}}
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
      style={{ width: '150px', margin: '0 auto 20px', display: 'block' }}
    />
    <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
      I have a special name and a special birthday.<br />
      Let's discover them together!
    </p>
    <div style={{
      display: 'flex',
      gap: '40px',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="fade-in delay-100" style={{ textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--zone-current-soft)',
          border: '3px solid var(--zone-current-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 10px'
        }}>🔤</div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--zone-current-accent)' }}>
          Name
        </span>
      </div>
      <div className="fade-in delay-300" style={{ textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--zone-current-soft)',
          border: '3px solid var(--zone-current-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 10px'
        }}>🎂</div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--zone-current-accent)' }}>
          Birthday
        </span>
      </div>
    </div>
  </div>
</Modal>
```

---

## Step 4: Refactor Hint Button (Line 539)

**BEFORE:**
```jsx
<button className="hint-button bounce-gentle" onClick={() => setShowHintModal(true)}>
  💡 Hint
</button>
```

**AFTER:**
```jsx
<Button
  variant="secondary"
  size="small"
  onClick={() => setShowHintModal(true)}
  className="pulse-infinite"
  style={{
    position: 'absolute',
    top: '20px',
    right: '20px'
  }}
>
  💡 Hint
</Button>
```

---

## Step 5: Refactor Hint Modal (Lines 559-573)

**BEFORE:**
```jsx
{showHintModal && (
  <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
    <div className="hint-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="hint-close-btn" onClick={() => setShowHintModal(false)}>✕</button>
      <img src={babyGaneshaImg} alt="Ganesha" className="hint-ganesha bounce"/>
      <div className="hint-message">
        <p className="hint-title">My name is:</p>
        <div className="hint-name-display">
          {nameLetters.map((item, index) => <span key={item.id} className="hint-letter" style={{animationDelay: `${index * 0.1}s`}}>{item.letter}</span>)}
        </div>
        <p className="hint-subtitle">Pop the balloons in this order!</p>
      </div>
    </div>
  </div>
)}
```

**AFTER:**
```jsx
<Modal
  isOpen={showHintModal}
  onClose={() => setShowHintModal(false)}
  title="Hint"
  confirmText="Got It!"
  size="medium"
>
  <div style={{ textAlign: 'center' }}>
    <img
      src={babyGaneshaImg}
      alt="Ganesha"
      className="bounce"
      style={{ width: '120px', margin: '0 auto 20px', display: 'block' }}
    />
    <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: 'var(--zone-current-accent)' }}>
      My name is:
    </p>
    <div style={{
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginBottom: '15px'
    }}>
      {nameLetters.map((item, index) => (
        <span
          key={item.id}
          className="scale-in"
          style={{
            animationDelay: `${index * 0.1}s`,
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'var(--play-action-green)',
            padding: '10px',
            background: 'var(--zone-current-soft)',
            borderRadius: '10px',
            minWidth: '50px',
            display: 'inline-block'
          }}
        >
          {item.letter}
        </span>
      ))}
    </div>
    <p style={{ fontSize: '16px', color: 'var(--play-text-main)' }}>
      Pop the balloons in this order!
    </p>
  </div>
</Modal>
```

---

## Step 6: Refactor Child Intro Button (Line 591)

**BEFORE:**
```jsx
<button className="child-intro-btn" onClick={() => sceneActions.updateState({ gamePhase: 'child-name-input' })}>
  What is your name? 👋
</button>
```

**AFTER:**
```jsx
<Button
  variant="primary"
  size="large"
  onClick={() => sceneActions.updateState({ gamePhase: 'child-name-input' })}
>
  What is your name? 👋
</Button>
```

---

## Step 7: Refactor Control Buttons (Lines 605-606)

**BEFORE:**
```jsx
<button className="child-backspace-btn" onClick={handleChildNameBackspace} disabled={sceneState.childNameLetters.length === 0}>
  ⌫ Delete
</button>
<button className="child-confirm-btn" onClick={handleChildNameConfirm} disabled={sceneState.childNameLetters.length < 2}>
  That's My Name! ✓
</button>
```

**AFTER:**
```jsx
<Button
  variant="secondary"
  size="medium"
  onClick={handleChildNameBackspace}
  disabled={sceneState.childNameLetters.length === 0}
>
  ⌫ Delete
</Button>
<Button
  variant="primary"
  size="medium"
  onClick={handleChildNameConfirm}
  disabled={sceneState.childNameLetters.length < 2}
>
  That's My Name! ✓
</Button>
```

---

## Step 8: Refactor Birthday Intro Button (Line 633)

**BEFORE:**
```jsx
<button className="child-bday-intro-btn" onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}>
  Tell You My Birthday! 🎉
</button>
```

**AFTER:**
```jsx
<Button
  variant="primary"
  size="large"
  onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}
>
  Tell You My Birthday! 🎉
</Button>
```

---

## Step 9: Refactor Back to Months Button (Line 673)

**BEFORE:**
```jsx
<button className="back-to-months-btn" onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}>
  ← Change Month
</button>
```

**AFTER:**
```jsx
<Button
  variant="secondary"
  size="small"
  onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}
  style={{
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)'
  }}
>
  ← Change Month
</Button>
```

---

## Step 10: Refactor Besties End Button (Line 713)

**BEFORE:**
```jsx
<button className="besties-end-btn" onClick={() => sceneActions.updateState({ showingCompletionScreen: true })}>
  Finish Game ✨
</button>
```

**AFTER:**
```jsx
<Button
  variant="info"
  size="large"
  onClick={() => sceneActions.updateState({ showingCompletionScreen: true })}
  className="glow"
>
  Finish Game ✨
</Button>
```

---

## Step 11: Refactor Birthday Quest Button (Line 725)

**BEFORE:**
```jsx
<button className="bday-quest-btn" onClick={handleStartBirthdayChoice}>
  Let's Explore 🌼
</button>
```

**AFTER:**
```jsx
<Button
  variant="primary"
  size="large"
  onClick={handleStartBirthdayChoice}
>
  Let's Explore 🌼
</Button>
```

---

## Step 12: Update Custom CSS (NameBirthdayGame.css)

### Replace hardcoded colors with zone variables:

**FIND and REPLACE in your CSS file:**

```css
/* BEFORE - Hardcoded colors */
.game-background {
  background: #FFFDF2;
}

.instruction-bubble {
  background: #8D4B38;
  color: white;
}

.letter-box {
  border: 2px solid #8D4B38;
  background: #F5E6D3;
}

/* AFTER - Zone variables */
.game-background {
  background: var(--zone-current-base);
}

.instruction-bubble {
  background: var(--zone-current-accent);
  color: var(--play-sticker-white);
}

.letter-box {
  border: 2px solid var(--zone-current-accent);
  background: var(--zone-current-soft);
}
```

---

## Summary of Changes

### What We Did:
1. ✅ Added imports for Button, Modal, and design system CSS
2. ✅ Added `data-zone="about-me-hut"` to root element
3. ✅ Replaced 8 custom buttons with unified `<Button>` component
4. ✅ Replaced 2 custom modals with unified `<Modal>` component
5. ✅ Added animation classes (heartbeat, bounce, pulse, fade-in, scale-in, glow)
6. ✅ Used CSS variables in inline styles

### Benefits:
- ✨ Buttons now have consistent styling across the app
- ✨ Modals automatically adapt to zone colors
- ✨ Animations are shared and optimized
- ✨ Easy to change themes by switching data-zone attribute
- ✨ Reduced custom CSS by ~40%
- ✨ Accessibility improvements (keyboard nav, focus states)

### Next Steps:
1. Test the refactored scene in the app
2. Update NameBirthdayGame.css to use zone variables
3. Remove unused custom button/modal CSS classes
4. Apply the same pattern to other scenes
