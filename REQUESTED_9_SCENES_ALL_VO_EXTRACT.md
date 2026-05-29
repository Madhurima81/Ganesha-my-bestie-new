# Exact VO Extraction - Requested 9 Scenes

## A) Main Navigation Screens

### 1) Tap Gate (Audio Unlock)
- Intro VO: `Tap to continue.`
- Idle Hint VO: `Tap anywhere to begin.`

### 2) Main Welcome Screen
- Intro VO: `Hi bestie... I'm Ganesha. Come play with me.`
- Button VO: `Start.`
- Idle Hint VO: `Tap Start, and we'll begin our adventure.`

### 3) Create Profile / Profile Setup (3-step flow)

#### Step 3.1: Name Step
- Screen text: `What should I call you?`
- Intro VO: `What should I call you?`
- Idle Hint VO (if name not entered): `Tell me your name.`

#### Step 3.2: Age Step
- Screen text: `How old are you?`
- Intro VO: `How old are you?`

#### Step 3.3: Friend Step
- Screen text: `Pick your friend`
- Intro VO: `Pick your friend!`
- On avatar selection VO: `Nice choice!`

#### Step 3.4: Profile Created
- Success VO: `Yay, {childName}! Let's go!`

#### Profile Welcome / Dashboard VO
- First-time profile VO: `Welcome to the adventure, little explorer.`
- Returning profile VO: `Welcome back! Ready to continue your magical journey?`
- Idle Hint VO: `Tap Continue Journey to resume, or Explore Map to choose a zone.`

### 4) Story After Profile (Ganesha Intro Story)
- Story VO 1: `Are you ready? Let's meet Ganesha!`
- Story VO 2: `My mom Parvati made me with love and brought me to life!`
- Story VO 3: `Mom said, Guard the door! But uh-oh, the visitor was Dad Shiva!`
- Story VO 4: `Mom felt very sad, so Dad gave me a magical elephant head!`
- Story VO 5: `Now we were together again, as one happy family!`
- Story End VO: `And now, let's explore my world together!`

### 5) Main Map Screen
- First map intro VO: `Tap Symbol Mountain - that's where we start!`
- Idle nudge VO: `Tap Symbol Mountain whenever you are ready!`
- Zone unlock VO:
  - `Look! The Shloka River is flowing!`
  - `Come inside! The About Me Hut is open!`
  - `The cave doors are opening!`
  - `The festival has begun!`

### 6) Zone Welcome Screen (Generic, all zones)
- Intro VO template: `Welcome to {Zone Name}! Tap a card to begin.`
- Zone complete VO template: `You finished {Zone Name}! I'm so proud of you.`
- Idle Hint VO: `Tap Start to begin, Continue to resume, or Play Again to replay.`

---

---


Scope requested:
- Symbol Mountain: 4 scenes
- About Me Hut: 4 scenes
- Shloka River: Scene 1 only

Sources used:
- `src/lib/config/content/voiceGuidance.js`
- `VOICEOVER_SCENEWISE_WITH_IDLE_HINTS.md`
- `ABOUT_ME_VOICE_OVER_FINAL.md`

---

## 1) Symbol Mountain - Scene 1 (Modak)

### Intro VO
- `Mooshika is nearby. Let's find the sweet modaks.`

### Instruction VO
- `Mooshika is hiding. Tap the mounds to find him.`
- `Look... sweet modaks. Tap them to collect.`
- `Let's enjoy the sweet modaks... drag them here.`

### Progress / Emotion VO
- `There he is... my little friend.`
- `You looked closely... and found him. Say it with me... I can focus.`
- `You found them... one by one. That feels good. Say it with me... I am full of joy.`
- `You gave... and it felt good. Say it with me... I feel good inside.`
- `You have a kind heart!`
- `You found 3 special symbols! Tap each one to learn their secret!`

### Completion VO
- `You found Mooshika. You felt joy. You feel good inside. All yours.`

### Idle Hint VO
- `Tap the brown mounds to find who is hiding.`
- `Tap the modaks to collect all three.`
- `Tap a modak in your basket, then tap Ganesha.`

---

## 2) Symbol Mountain - Scene 2 (Pond)

### Intro VO
- `A golden lotus bud is waiting in this pond. Let's help it bloom.`

### Instruction VO
- `Tap the lotuses to help them bloom.`
- `Look... the golden lotus bud. Tap it.`
- `Tap Ganesha's trunk to spray water.`

### Idle Hint VO
- `Tap the closed lotuses first.`
- `The special golden lotus is ready. Tap it.`
- `Tap the trunk to water the golden lotus.`

---

## 3) Symbol Mountain - Scene 3 (Symbol: Eyes, Ears, Tusk)

### Intro VO
- `Look, listen, and find what awakens the tusk.`

### Instruction VO
- `Tap the Eyes symbol to begin.`
- `Tap the Ears symbol to begin.`
- `Tap the golden notes to build the sacred tusk.`

### Idle Hint VO
- `Find all hidden instruments in the mountain.`
- `Watch and listen, then repeat the rhythm pattern.`
- `Tap all 3 golden musical notes.`

---

## 4) Symbol Mountain - Scene 4 (Sacred Assembly / Final Scene)

### Intro VO
- `You found every symbol... let's place them together.`

### Instruction VO
- `Tap the right part of me.`
- Symbol card callouts:
  - `Eyes.`
  - `Ears.`
  - `Trunk.`
  - `Tusk.`
  - `Modak.`
  - `Lotus.`
  - `Belly.`
  - `Mooshika.`

### Progress VO
- `Yes... that's exactly right.`
- `Look... you're bringing me alive.`
- `Hmm... try again.`

### Completion VO
- `You found all my symbols...`
- `Now I am complete.`
- `And all my powers... are with you now.`

### Hint VO
- `I see clearly.`
- `I listen with care.`
- `I find my way.`
- `I finish what I start.`
- `I am full of joy.`
- `I stay calm.`
- `I feel safe inside.`
- `I can focus.`
- (Artist script idle lines)
  - `Match each symbol card to the correct part.`
  - `Try this: Eyes - I see clearly; Ears - I listen with care.`

---

## 5) About Me Hut - Scene 19 (Family Tree)

### Intro VO
- `Let's meet my family and yours!`

### Ganesha phase VO
- `Tap a circle to meet my family!`
- Deity names VO:
  - `Shiva Ji`
  - `Parvati Mata`
  - `Kartikeya`
  - `Ganesha`
  - `Vishnu`
  - `Lakshmi`
  - `Hanuman`
  - `Krishna`
  - `Mooshak`
  - `Brahma`
  - `Saraswati`

### Correct / Reveal VO
- `That's my father!`
- `That's my mother!`
- `That's my brother!`
- `That's me!`

### Fun fact / info VO
- `My father is calm and strong. He protects us and teaches me peace.`
- `My mother is kind and loving. She gives the best hugs and keeps me safe.`
- `My brother is very brave. He travels the world on his peacock.`
- `That's me! I love modaks and helping my friends.`
- `This is my father.`
- `This is my mother.`
- `This is my brother.`
- `This is me!`

### Progress / transition VO
- `Great start!`
- `Almost done with my family!`
- `Tap a circle to meet my family!`
- `Great! You met my loving family!`
- `Show me your family!`
- `Now it's your turn! Add your family to the tree.`
- `Tap someone below to add to your tree!`
- `Nice! Your tree has started growing.`
- `Beautiful! You added someone to your family tree.`
- `Look at that! Your family tree is getting bigger.`
- `Mmm. Your tree is filling with love.`
- `Look at your beautiful family tree... So many people care about you.`

### Completion VO
- `Look at our family trees. Connected by love.`

### Idle / return hints from final VO doc
- `Tap empty circles to place family members.`
- `Tap icons below to add your family members.`

---

## 6) About Me Hut - Scene 20 (Favorite Food)

### Intro VO
- `Let's explore my favorite things and yours!`

### Ganesha choices VO
- `Tap my favorite food.`
- `Yes! Modak is my favorite!`
- `Tap my favorite color.`
- `Yes! Yellow is my favorite!`
- `Tap my favorite activity.`
- `Yes! I love to dance!`
- `Tap my best friend.`
- `Yes! Mooshika is my friend!`

### Transition + child phase VO
- `Now it's your turn!`
- `Tap your favorite food.`
- `Tap your favorite color.`
- `Tap what you love to do.`
- `Type the name of your best friend.`

### Compare / end VO
- `We like so many fun things!`

### Idle / return hints
- `Tap to guess Ganesha's favorite first.`
- `Then pick or draw your own favorite.`
- Contextual return hint for tab return

---

## 7) About Me Hut - Scene 21 (Dreams & Wishes)

### Intro VO
- `Let's help and dream together!`

### Wish sequence VO
- `Let's make the world smile!`
- `Tap the kind actions.`
- `You made the world kinder!`
- `My second wish... is to share our food. So no one stays hungry.`
- `Drag food to the plates.`
- `Everyone has food now!`
- `My last wish... is for a green world full of life. Let's help this forest grow!`
- `Tap to grow the garden.`
- `The world is green and happy!`

### Child dream phase VO
- `Now it's your turn!`
- `Draw your happy dream.`
- `Tap my trunk to clear the clouds.`
- `Keep tapping to clear the clouds!`
- `Wow, that's a beautiful dream!`
- `This can help the world!`
- `Keep dreaming and helping!`

### Idle hints
- `Each wish needs three taps to complete.`
- `Tap Ganesha's trunk to clear fear clouds.`
- `Look for the kind actions.`
- `Try dragging food to the plates.`
- `Tap the forest to make it grow.`

---

## 8) About Me Hut - Scene 22 (My Indian Story)

### Intro VO
- `Tap to explore my India story and yours!`

### Phase VO
- `Drag the magnifying glass to find me.`
- Location discovery callouts + phase completion line
- `Tap where your family lives in India.`
- Region confirmation line
- `Tap play to listen.`
- Wrong guess line (language/festival)
- `Yes! That's Sanskrit - the language of many mantras.`
- `Tap up to three languages you speak.`
- `Tap my favorite festival.`
- Festival selection/confirmation lines
- `Tap the festivals you celebrate.`
- `We are part of India!`

### Idle / return hints
- `Tap through each story step and then share your own choices.`
- `ganeshaHomeIdleLevel 2-3` hints
- contextual return hint in resumable phases

---

## 9) Shloka River - Scene 1 (Vakratunda Grove)

### Intro VO
- `Welcome!`
- (Artist script line) `Bloom the flowers. Listen and repeat.`

### Gameplay / round VO
- `Round 1 done!`
- `Round 2 done!`
- `Lotus blooming!`
- `I adapt!`
- `Mahakaya - start!`
- `Mahakaya round 1 done!`
- `Mahakaya round 2 done!`
- `Amazing!`
- `I am strong!`
- `Wonderful!`
- `Mahakaya - strong!`

### Completion VO
- `Scene complete!`

### Idle / replay hint VO (artist script)
- `Watch the sequence, then repeat it.`
- `Tap the speaker button to hear it again.`
