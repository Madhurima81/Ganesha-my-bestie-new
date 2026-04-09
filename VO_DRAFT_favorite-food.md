# Voice Guidance Draft: Favorite Food Scene
## about-me-hut / favorite-food

**Status:** Synced with current VO in `Favoritefoodgame.jsx`

---

## PART 1: GANESHA'S STORY (Child learns about Ganesha)

### Opening
```js
opening: {
  text: "Let's discover our favorite things.",
  file: '/audio/voicenew/favoritefood/ganesha_favorite_opening.wav'
}
```

### Food Phase
```js
foodQuestion: {
  text: "Hmm... can you guess my favourite food?",
  file: '/audio/voicenew/favoritefood/ganesha_food_question.wav'
}

foodQuestionFollowup: {
  text: "Tap the one you think I love.",
  file: '/audio/voicenew/favoritefood/ganesha_food_question_followup.wav'
}

foodCorrect: {
  text: "Yes! Modak is my favourite. Sweet and yummy!",
  file: '/audio/voicenew/favoritefood/ganesha_food_correct.wav'
}
```

### Color Phase
```js
colorQuestion: {
  text: "Can you guess my favourite color?",
  file: '/audio/voicenew/favoritefood/ganesha_color_question.wav'
}

colorCorrect: {
  text: "Yes! Yellow is my favourite color, bright like the sun!",
  file: '/audio/voicenew/favoritefood/ganesha_color_correct.wav'
}
```

### Activity Phase
```js
activityQuestion: {
  text: "Can you guess my favourite activity?",
  file: '/audio/voicenew/favoritefood/ganesha_activity_question.wav'
}

activityCorrect: {
  text: "Yes! I love to dance. It makes me so happy!",
  file: '/audio/voicenew/favoritefood/ganesha_activity_correct.wav'
}
```

### Friend Phase
```js
friendQuestion: {
  text: "Can you guess who my best friend is?",
  file: '/audio/voicenew/favoritefood/ganesha_friend_question.wav'
}

friendCorrect: {
  text: "Yes! Mooshika is my little mouse friend!",
  file: '/audio/voicenew/favoritefood/ganesha_friend_correct.wav'
}
```

### Transition to Child's Turn
```js
transition: {
  text: "Now let's discover your favorite things! It's your turn. Tell me what makes you special.",
  file: '/audio/voicenew/favoritefood/ganesha_transition_to_child.wav'
}

childIntro: {
  text: "Now it's time to learn about YOU! Let's find out what makes you special.",
  file: '/audio/voicenew/favoritefood/ganesha_child_intro.wav'
}
```

---

## PART 2: CHILD'S STORY (Child tells Ganesha about themselves)

### Child's Food
```js
childFoodQuestion: {
  text: "What's your favorite food?",
  file: '/audio/voicenew/favoritefood/ganesha_child_food_question.wav'
}

childFoodCorrect: {
  text: "Mmm! That sounds yummy!",
  file: '/audio/voicenew/favoritefood/ganesha_child_food_correct.wav'
}
```

### Child's Color
```js
childColorQuestion: {
  text: "What's your favorite color?",
  file: '/audio/voicenew/favoritefood/ganesha_child_color_question.wav'
}

childColorCorrect: {
  text: "That's a beautiful color!",
  file: '/audio/voicenew/favoritefood/ganesha_child_color_correct.wav'
}

childColorMatch: {
  text: "Wow! We both love yellow!",
  file: '/audio/voicenew/favoritefood/ganesha_child_color_match.wav'
}
```

### Child's Activity
```js
childActivityQuestion: {
  text: "What do you love to do?",
  file: '/audio/voicenew/favoritefood/ganesha_child_activity_question.wav'
}

childActivityCorrect: {
  text: "That sounds like fun!",
  file: '/audio/voicenew/favoritefood/ganesha_child_activity_correct.wav'
}

childActivityMatch: {
  text: "Haha! We both love dancing!",
  file: '/audio/voicenew/favoritefood/ganesha_child_activity_match.wav'
}
```

### Child's Best Friend
```js
childFriendQuestion: {
  text: "Who is your best friend?",
  file: '/audio/voicenew/favoritefood/ganesha_child_friend_question.wav'
}

childFriendCorrect: {
  text: "What a wonderful friend to have!",
  file: '/audio/voicenew/favoritefood/ganesha_child_friend_correct.wav'
}

friendCelebration: {
  text: "Now we know each other better. I'm happy we're friends!",
  file: '/audio/voicenew/favoritefood/ganesha_friend_celebration.wav'
}
```

## IDLE HINT LINES (Ganesha Choices)
```js
foodHint: {
  text: "My favourite sweet looks like a little mountain.",
  file: '/audio/voicenew/favoritefood/ganesha_food_hint.wav'
}

colorHint: {
  text: "My favourite color shines like the bright sun.",
  file: '/audio/voicenew/favoritefood/ganesha_color_hint.wav'
}

activityHint: {
  text: "My favourite activity is when my feet move to music.",
  file: '/audio/voicenew/favoritefood/ganesha_activity_hint.wav'
}

friendHint: {
  text: "My tiny friend scurries very fast.",
  file: '/audio/voicenew/favoritefood/ganesha_friend_hint.wav'
}
```

---

## Notes
- Removed outdated draft lines (older question/correct variants) to match current game VO exactly.
- `foodQuestionFollowup` is spoken as a second line after a short pause.
