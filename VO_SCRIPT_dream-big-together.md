# Voice Guidance Script: Dream Big Together (Obstacle Remover Game)
## about-me-hut / dreams-wishes

**Theme:** Removing obstacles to make dreams come true. Child learns Ganesha removes obstacles, then removes obstacles to reveal their own dream.

---

# GANESHA'S WISHES (Learn obstacle removal)

## Opening

> Let's discover... how to make our wishes come true!

*(pause for modal to close)*

---

## Wish 1 — Earth (Happiness)

**Setup**

> Look at the Earth...
> It's sad because it needs care.

**Question/Action**

> Can you tap... to bring happiness back?

*(child taps 3 times)*

**Celebration**

> Yes! ... The Earth is smiling!
> When we care for nature... happiness grows.

*(sparkle SFX)*

---

## Wish 2 — Sharing (Abundance)

**Setup**

> The bowl is empty...
> It needs to be filled with sharing.

**Question/Action**

> Can you tap... to fill it with kindness?

*(child taps 3 times)*

**Celebration**

> Yes! ... The bowl is full!
> When we share... there is enough for everyone.

*(sparkle SFX)*

---

## Wish 3 — Growth (Beauty)

**Setup**

> The flower is sleeping...
> It wants to bloom... but something is blocking it.

**Question/Action**

> Can you tap... to help it grow?

*(child taps 3 times)*

**Celebration**

> Yes! ... It's blooming!
> When we help things grow... the world becomes beautiful.

*(sparkle SFX)*

---

## All Wishes Complete — Transition to Dream

> Do you see... what just happened?

*(pause)*

> You removed obstacles...
> And made wishes come true!

*(beat)*

> Now... it's time for YOUR dream.

---

# CHILD'S DREAM (Remove obstacles to reveal dream)

## Dream Intro

> I want to show you something...
> We all have dreams inside us.

*(pause)*

> Draw your dream here...
> What do you wish for?

*(child draws)*

---

## Dream Clouded (Obstacle Appearing)

> Beautiful!

*(pause)*

> But... clouds are covering your dream.
> Obstacles hide our dreams sometimes.

*(beat)*

> Can you... remove the clouds?

---

## Dream Clearing (Child Taps)

> Keep going! ...
> Tap... tap... tap!

---

## Dream Revealed

> There it is! ...
> YOUR dream!

*(pause for emotion)*

> Obstacles cannot stop... what you believe in!

*(celebration SFX — longer, warmer)*

---

## Connection Moment (Important emotional beat)

> Your dream... my dreams...
> We dream big together!

*(softer, more intimate)*

> And I believe... your dream will come true.

---

## Scene Complete

> You learned something powerful today...
> You can remove obstacles.

*(pause)*

> Keep dreaming, little one.
> I will be with you.

---

---

# RECORDING NOTES

**Total lines:** 15 main VO segments

**Voice style:**
- Warm, encouraging, like a wise friend
- Slower pace (kids need time to absorb)
- Emotional peaks:
  1. **Wish celebrations** → joyful, playful
  2. **Dream revealed** → wonder, amazement
  3. **Connection moment** → sincere, tender

**SFX placement:**
- After each wish: small sparkle SFX
- After dream revealed: LONGER celebration SFX (1.5–2s)

**Pauses & pacing:**
- Ellipsis ( ... ) = 0.5–0.8s breath pause
- Line breaks = natural beat for processing
- After setup = pause for child to read screen

---

# VOICE_LINES Keys for Code

```javascript
const VOICE_LINES = {
  opening: "Let's discover... how to make our wishes come true!",

  wish1Setup: "Look at the Earth... It's sad because it needs care.",
  wish1Question: "Can you tap... to bring happiness back?",
  wish1Correct: "Yes! ... The Earth is smiling! When we care for nature... happiness grows.",

  wish2Setup: "The bowl is empty... It needs to be filled with sharing.",
  wish2Question: "Can you tap... to fill it with kindness?",
  wish2Correct: "Yes! ... The bowl is full! When we share... there is enough for everyone.",

  wish3Setup: "The flower is sleeping... It wants to bloom... but something is blocking it.",
  wish3Question: "Can you tap... to help it grow?",
  wish3Correct: "Yes! ... It's blooming! When we help things grow... the world becomes beautiful.",

  transitionStart: "Do you see... what just happened? You removed obstacles... And made wishes come true!",
  transitionToDream: "Now... it's time for YOUR dream.",

  dreamIntro: "I want to show you something... We all have dreams inside us. Draw your dream here... What do you wish for?",

  dreamClouded: "Beautiful! But... clouds are covering your dream. Obstacles hide our dreams sometimes. Can you... remove the clouds?",

  dreamClearing: "Keep going! ... Tap... tap... tap!",

  dreamRevealed: "There it is! ... YOUR dream! Obstacles cannot stop... what you believe in!",

  connection: "Your dream... my dreams... We dream big together! And I believe... your dream will come true.",

  complete: "You learned something powerful today... You can remove obstacles. Keep dreaming, little one. I will be with you."
};
```

---

# Next Steps

1. Madhurima reviews & approves text
2. Record 16 VO files following pacing marks
3. Update VOICE_LINES in ObstacleRemoverGame.jsx
4. Wire up phase triggers (same pattern as favorite-food)
5. Test emotional flow

