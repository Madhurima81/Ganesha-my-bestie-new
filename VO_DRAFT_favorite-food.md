# Voice Guidance Draft: Favorite Food Scene
## about-me-hut / favorite-food

**Status:** Draft for review — NO FILES RECORDED YET

---

## PART 1: GANESHA'S STORY (Child learns about Ganesha)

### Opening Modal
```
welcome: {
  text: "Let's discover what makes me special. My favorite things tell my story.",
  file: '/audio/voicenew/favoritefood/ganesha_favorite_opening.wav'
}
```

### Food Phase
```
foodQuestion: {
  text: "Which food do you think is my favorite?",
  file: '/audio/voicenew/favoritefood/ganesha_food_question.wav'
}

foodCorrect: {
  text: "Yes! Modak is my favorite. Sweet and yummy!",
  file: '/audio/voicenew/favoritefood/ganesha_food_correct.wav'
}

foodWrong: {
  text: "Not that one! Try again.",
  file: '/audio/voicenew/favoritefood/ganesha_food_wrong.wav'
}
```

### Color Phase
```
colorQuestion: {
  text: "What's my favorite color?",
  file: '/audio/voicenew/favoritefood/ganesha_color_question.wav'
}

colorCorrect: {
  text: "Right! I love yellow like the sun!",
  file: '/audio/voicenew/favoritefood/ganesha_color_correct.wav'
}

colorWrong: {
  text: "Not that one! Try again.",
  file: '/audio/voicenew/favoritefood/ganesha_color_wrong.wav'
}
```

### Activity Phase
```
activityQuestion: {
  text: "What do I love to do?",
  file: '/audio/voicenew/favoritefood/ganesha_activity_question.wav'
}

activityCorrect: {
  text: "Yes! I love to help my friends!",
  file: '/audio/voicenew/favoritefood/ganesha_activity_correct.wav'
}

activityWrong: {
  text: "Not that one! Try again.",
  file: '/audio/voicenew/favoritefood/ganesha_activity_wrong.wav'
}
```

### Friend Phase
```
friendQuestion: {
  text: "Who is my best friend?",
  file: '/audio/voicenew/favoritefood/ganesha_friend_question.wav'
}

friendCorrect: {
  text: "Yes! Mooshika is my little mouse friend!",
  file: '/audio/voicenew/favoritefood/ganesha_friend_correct.wav'
}

friendWrong: {
  text: "Not that one! Try again.",
  file: '/audio/voicenew/favoritefood/ganesha_friend_wrong.wav'
}
```

### Transition to Child's Turn
```
transitionCard: {
  text: "Now I know you better. Let's discover YOUR favorite things!",
  file: '/audio/voicenew/favoritefood/ganesha_transition_to_child.wav'
}

childIntro: {
  text: "It's your turn! Tell me what makes you special.",
  file: '/audio/voicenew/favoritefood/ganesha_child_intro.wav'
}
```

---

## PART 2: CHILD'S STORY (Child tells Ganesha about themselves)

### Child's Food
```
childFoodQuestion: {
  text: "What's YOUR favorite food?",
  file: '/audio/voicenew/favoritefood/ganesha_child_food_question.wav'
}

childFoodCorrect: {
  text: "Mmm, that's yummy!",
  file: '/audio/voicenew/favoritefood/ganesha_child_food_correct.wav'
}
```

### Child's Color
```
childColorQuestion: {
  text: "What's YOUR favorite color?",
  file: '/audio/voicenew/favoritefood/ganesha_child_color_question.wav'
}

childColorCorrect: {
  text: "That's a beautiful color!",
  file: '/audio/voicenew/favoritefood/ganesha_child_color_correct.wav'
}
```

### Child's Activity
```
childActivityQuestion: {
  text: "What do YOU love to do?",
  file: '/audio/voicenew/favoritefood/ganesha_child_activity_question.wav'
}

childActivityCorrect: {
  text: "That sounds fun! I love that too!",
  file: '/audio/voicenew/favoritefood/ganesha_child_activity_correct.wav'
}
```

### Child's Best Friend
```
childFriendQuestion: {
  text: "Who is YOUR best friend?",
  file: '/audio/voicenew/favoritefood/ganesha_child_friend_question.wav'
}

childFriendCorrect: {
  text: "What a wonderful friend to have!",
  file: '/audio/voicenew/favoritefood/ganesha_child_friend_correct.wav'
}

friendCelebration: {
  text: "We're connected — your heart and mine. We know each other now!",
  file: '/audio/voicenew/favoritefood/ganesha_friend_celebration.wav'
}
```

### Scene Complete
```
sceneComplete: {
  text: "You shared your favorite things with me. That makes you special. Come back and tell me more!",
  file: '/audio/voicenew/favoritefood/ganesha_scene_complete.wav'
}
```

---

## RECORDING NOTES

**Tone:** Warm, curious, celebratory. Ganesha is discovering the child's personality.

**Audience:** 5–12 year olds

**Wrong answers:** Keep gentle, never harsh. "Not that one! Try again."

**Correct answers:** Match the moment:
- Food/color/activity correct: Small celebration (joy, affirmation)
- Friend correct: Bigger celebration (emotional connection)
- Scene complete: Warmth + invitation to return

**Optional SFX backing:**
- After each correct answer: small chime or sparkle SFX
- After friend celebration: softer, longer celebration sound

---

## Next Steps

1. **Madhurima reviews** — approve text or suggest rewrites
2. **Record all 20 audio files** (following modak VO pattern)
3. **Add to voiceGuidance.js** under `'about-me-hut': { 'favorite-food': { ... } }`
4. **Remove speech bubbles** from FavoritefoodGame.jsx once VO is live
5. **Test phase transitions** — confirm VO triggers at right moments

