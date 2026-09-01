# Three Active Zones: Actual VO Map

This file lists the VO that is currently mapped to the active scene flows. For scenes with newer local VO, the scene-local constants and trigger logic are treated as source of truth over older shared config.

Sources checked:
- `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx`
- `src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx`
- `src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx`
- `src/zones/symbol-mountain/scenes/tusk/TuskPathGame.jsx`
- `src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx`
- `src/lib/config/content/voiceGuidance.js`
- `src/zones/about-me-hut/family-tree/Familytreegame.jsx`
- `src/zones/about-me-hut/food/Favoritefoodgame.jsx`
- `src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx`
- `src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx`

---

## Symbol Mountain

| Scene | VO Text | When It Plays | Purpose |
|---|---|---|---|
| Calm Mooshika | `Mooshika is darting around. Press and hold him gently to help him settle.` | After Start, Mooshika search phase begins. | Explains new settle/hold mechanic. |
| Calm Mooshika | `Hold Mooshika gently when he pauses near an object.` | Idle hint, Mooshika search, level 2. | Helps child know when/how to hold. |
| Calm Mooshika | `There he is... calm and ready to walk with us.` | Mooshika is successfully settled/found. | Confirms calm state and transition. |
| Calm Mooshika | `You helped Mooshika slow down. Say it with me... I can guide my busy thoughts.` | Mooshika symbol reveal card. | Connects Mooshika to guiding busy thoughts. |
| Calm Mooshika | `Mushika is ready to gather three offerings for Ganesha. Drag her to each one.` | After Mooshika reveal flies to sidebar; offerings phase begins. | Explains drag-to-offerings mechanic. |
| Calm Mooshika | `Guide Mushika to each offering for Ganesha.` | Idle hint in offerings phase. | Nudges offering collection. |
| Calm Mooshika | `The sweetness of modak reminds us of a happy, peaceful feeling inside. Say it with me... I have joy inside me.` | Modak symbol reveal card. | Connects Modak/offering to peaceful inner sweetness. |
| Calm Mooshika | `Drag each feeling into Ganesha's belly. There is room for every feeling.` | After Modak reveal flies to sidebar; belly phase begins. | Explains feelings-to-belly mechanic. |
| Calm Mooshika | `Move a feeling into Ganesha's belly.` | Idle hint in belly phase. | Nudges final drag action. |
| Calm Mooshika | `There is room for all my feelings.` | Belly symbol reveal card. | Names belly acceptance payoff. |
| Calm Mooshika | `You helped Mooshika settle, found the sweetness inside, and made room for every feeling.` | Final fireworks / scene-complete VO. | Closes scene before completion modal. |
| Find a Way to the Lotus | `The water can't get through... let's find it a way around.` | Opening/current prompt before gameplay. | Sets blocked-water problem. |
| Find a Way to the Lotus | `The rock is in the way. Guide the water around it, to the pond.` | Trunk route phase prompt. | Explains guide-water-around-rock mechanic. |
| Find a Way to the Lotus | `Try curving the water around the rock...` | Idle hint in trunk route phase. | Nudges curved path. |
| Find a Way to the Lotus | `You found a way around... Say it with me... I find my way.` | Trunk reveal card. | Connects trunk to finding another way. |
| Find a Way to the Lotus | `The lotus woke up... press and hold it gently... let it bloom.` | Lotus phase prompt. | Explains press-and-hold bloom mechanic. |
| Find a Way to the Lotus | `Hold it gently... watch it bloom.` | Idle hint in lotus phase. | Nudges gentle hold. |
| Find a Way to the Lotus | `You stayed with it... nice and slow. Say it with me... I can stay calm when things get messy.` | Lotus reveal card. | Connects lotus to calm in messy moments. |
| Find a Way to the Lotus | `You found another way, and the lotus bloomed.` | Scene-complete VO. | Summarizes trunk + lotus flow. |
| Look, Listen, Choose | `Let's explore... look and listen.` | Opening modal is visible. | Sets up the scene. |
| Look, Listen, Choose | `Look closely and spot what is hidden.` | Eyes phase prompt, before entering telescope mini-game. | Explains visual search. |
| Look, Listen, Choose | `Look closely... you can find them.` | Idle hint in eyes phase. | Nudges visual search. |
| Look, Listen, Choose | `You looked carefully... and found them all.` | Eyes reveal/setup completion. | Confirms careful seeing. |
| Look, Listen, Choose | `Listen carefully and find where the sound is coming from.` | Ears phase prompt, before rhythm/sound mini-game. | Explains listening match. |
| Look, Listen, Choose | `Listen carefully... then choose where the sound came from.` | Idle hint in ears phase. | Nudges listening choice. |
| Look, Listen, Choose | `You listened closely... and got it right.` | Ears reveal/setup completion. | Confirms careful listening. |
| Look, Listen, Choose | `You stayed focused... now let's clear the path.` | Tusk setup after ears completion. | Transitions into obstacle path. |
| Look, Listen, Choose | `My tusk is beyond this blocked path. Stay focused and choose what each obstacle needs.` | Tusk phase prompt in wrapper scene. | Introduces blocked-path objective. |
| Look, Listen, Choose | `My tusk is beyond this blocked path. Stay focused and choose what each obstacle needs.` | TuskPathGame intro. | Starts helper/obstacle mini-game. |
| Look, Listen, Choose | `Who can help with these tangled vines?` | Vines obstacle prompt and idle hint. | Child chooses correct helper. |
| Look, Listen, Choose | `Great choice! Now rub the vines away!` | Correct helper selected for vines. | Tells child the clearing action. |
| Look, Listen, Choose | `Wonderful! The vines are cleared.` | Vines cleared. | Confirms progress. |
| Look, Listen, Choose | `Which friend can clear the loose rocks?` | Rocks obstacle prompt and idle hint. | Child chooses correct helper. |
| Look, Listen, Choose | `Great choice! Now rub the rocks away!` | Correct helper selected for rocks. | Tells child the clearing action. |
| Look, Listen, Choose | `Excellent! The rocks are gone.` | Rocks cleared. | Confirms progress. |
| Look, Listen, Choose | `Who can help clean this muddy path?` | Mud obstacle prompt and idle hint. | Child chooses correct helper. |
| Look, Listen, Choose | `Great choice! Now rub the mud away!` | Correct helper selected for mud. | Tells child the clearing action. |
| Look, Listen, Choose | `Fantastic! The path is almost clear.` | Mud cleared. | Confirms progress. |
| Look, Listen, Choose | `Who is strong enough to move this giant boulder?` | Boulder obstacle prompt and idle hint. | Child chooses correct helper. |
| Look, Listen, Choose | `Great choice! Press and hold to push the boulder!` | Correct helper selected for boulder. | Explains press-and-hold action. |
| Look, Listen, Choose | `Keep pushing... You are doing great!` | While pushing boulder. | Encourages sustained action. |
| Look, Listen, Choose | `Choose the friend who can help, then clear the obstacle.` | Wrapper scene idle hint in Tusk phase. | Reframes Tusk as focused choice. |
| Look, Listen, Choose | `Hooray! You did it! The tusk has appeared! You stayed focused and chose just what each obstacle needed. Great teamwork!` | TuskPathGame finale. | Celebrates focused choice and story teamwork. |
| Look, Listen, Choose | `You looked carefully, listened closely, and stayed focused.` | Scene complete prompt. | Wraps Eyes/Ears/Tusk. |
| All Symbols Together | `You found every symbol... let's place them together.` | Opening modal / first scene prompt. | Introduces final assembly. |
| All Symbols Together | `Eyes.`, `Ears.`, `Trunk.`, `Tusk.`, `Modak.`, `Lotus.`, `Belly.`, `Mooshika.` | Each symbol card lands for its round. | Names the symbol to place. |
| All Symbols Together | `Tap the right part of me.` | Onboarding prompt before placement. | Explains symbol placement. |
| All Symbols Together | `I notice the good around me.` | Idle hint for Eyes placement. | Gives meaning hint. |
| All Symbols Together | `I listen with care.` | Idle hint for Ears placement. | Gives meaning hint. |
| All Symbols Together | `I find my way.` | Idle hint for Trunk placement. | Gives meaning hint. |
| All Symbols Together | `I stay focused on what is true.` | Idle hint for Tusk placement. | Gives meaning hint. |
| All Symbols Together | `I have joy inside me.` | Idle hint for Modak placement. | Gives meaning hint. |
| All Symbols Together | `I can stay calm when things get messy.` | Idle hint for Lotus placement. | Gives meaning hint. |
| All Symbols Together | `I have room for all my feelings.` | Idle hint for Belly placement. | Gives meaning hint. |
| All Symbols Together | `I can guide my busy thoughts.` | Idle hint for Mooshika placement. | Gives meaning hint. |
| All Symbols Together | `Yes... that's exactly right.` | First/correct placement. | Confirms correct placement. |
| All Symbols Together | `Look... all the symbols are coming together.` | Mid-progress placement. | Encourages continued assembly. |
| All Symbols Together | `Hmm... try again.` | Wrong placement. | Gentle correction. |
| All Symbols Together | `You found all my symbols...` / `Now they are all together.` / `And their lessons can stay with you.` | Final completion sequence. | Final emotional close. |

---

## Shloka River

| Scene | VO Text | When It Plays | Purpose |
|---|---|---|---|
| Your Journey Begins! | `Welcome!` | Opening / scene entry. | Welcomes child. |
| Your Journey Begins! | `The little frog wants to meet his family.` | Vakratunda rescue intro. | Sets first rescue goal. |
| Your Journey Begins! | `Help guide the lily pad another way.` | Vakratunda action prompt. | Guides alternate route. |
| Your Journey Begins! | `The river current is too strong there. Let's try another way.` | Wrong/blocked route. | Gentle correction. |
| Your Journey Begins! | `You found another way. The frog made it home to the family.` | Vakratunda rescue success. | Confirms another-way meaning. |
| Your Journey Begins! | `Now let's help the little calf.` | Mahakaya rescue intro. | Sets second rescue goal. |
| Your Journey Begins! | `A heavy log is trapping him!` | Mahakaya obstacle reveal. | Clarifies problem. |
| Your Journey Begins! | `Drag the rope to the log.` / `Now pull down!` | Mahakaya action prompts. | Guides rope/pull mechanic. |
| Your Journey Begins! | `You did it! The calf is free!` | Mahakaya rescue success. | Celebrates release. |
| Your Journey Begins! | `It means great strength.` | Mahakaya meaning reveal. | Teaches meaning. |
| Bring Back the Light! | `The river is dark today. Let's bring back the light!` | Opening / scene entry. | Sets visual problem. |
| Bring Back the Light! | `Swipe the dark patch.` | Suryakoti hint/action prompt. | Guides clearing darkness. |
| Bring Back the Light! | `The light showed the way!` | Suryakoti done. | Confirms light payoff. |
| Bring Back the Light! | `It means bright as ten million suns.` | Suryakoti meaning. | Teaches meaning. |
| Bring Back the Light! | `Drag the light across. Share the light evenly. Keep balancing.` | Samaprabha hint/action prompt. | Guides equal-light mechanic. |
| Bring Back the Light! | `Both sides are glowing now. You did it.` | Samaprabha done. | Confirms equal shine. |
| Bring Back the Light! | `It helps us share fairly.` | Samaprabha meaning. | Child-facing meaning. |
| Bring Back the Light! | `The light showed the way. Both shine equally now.` | Scene completion. | Summarizes both words. |
| The River Needs You! | `Let's help our river friend. The turtle wants to go home.` | Opening / scene entry. | Sets rescue goal. |
| The River Needs You! | `Something is blocking the way. Drag the obstacle away. Great job. Clear the next one.` | Nirvighnam hint/action prompt. | Guides obstacle clearing. |
| The River Needs You! | `The path is opening up. You did it. The turtle made it home.` | Nirvighnam done. | Confirms clear path. |
| The River Needs You! | `It helps clear obstacles.` | Nirvighnam meaning. | Teaches meaning. |
| The River Needs You! | `Now another friend needs help. The beaver needs a bridge. Tap the glowing friend. Look. They are helping. Tap the next friend.` | Kuru Me Deva hint/action prompt. | Guides asking helpers. |
| The River Needs You! | `The bridge is getting bigger. One more helper. The bridge is ready. The beaver made it across.` | Kuru Me Deva done. | Confirms bridge/help payoff. |
| The River Needs You! | `It means helping together.` | Kuru Me Deva meaning. | Child-facing meaning. |
| Care in Every Task | `Let's see who needs help. Look carefully.` | Opening / scene entry. | Sets scenario-matching task. |
| Care in Every Task | `Which power would help here? Tap a power. Nice choice. The problem is solved. Let's help another friend.` | Sarvakaryeshu hint/action prompt. | Guides power matching. |
| Care in Every Task | `Choose a power again. You got it. That helped too. One more challenge. Great thinking.` | Sarvakaryeshu progress prompt. | Sustains multi-scenario play. |
| Care in Every Task | `Sarvakaryeshu. Every task can be done with care.` | Sarvakaryeshu meaning. | Teaches meaning. |
| Care in Every Task | `Our journey is not over yet. Let's keep floating down the river. Tap the bubble.` | Sarvada action prompt. | Guides bubble sequence. |
| Care in Every Task | `Morning. Ganesha is there too. Tap the next bubble. Afternoon. Ganesha is there too. Tap the last bubble. Night. Ganesha is there too.` | Sarvada sequence. | Shows always/across day. |
| Care in Every Task | `Sarvada. What I learn stays with me.` | Sarvada meaning. | Teaches meaning. |
| Care in Every Task | `Every task can be done with care. Sarvada. Always.` | Scene completion. | Closes scene. |
| Complete the Shloka! | `You've learned all eight Ganesha powers. Now let's put the shloka together!` | Opening modal prompt. | Sets finale task. |
| Complete the Shloka! | `Tap the first word boat.` | Arrange game starts. | Starts sequencing. |
| Complete the Shloka! | `Tap the next word boat.` | Hint boat L1. | Gentle hint. |
| Complete the Shloka! | `Find the next word.` | Hint boat L2. | Stronger hint. |
| Complete the Shloka! | `Tap the glowing word boat.` | Hint boat L3. | Direct hint. |
| Complete the Shloka! | `Look! Your shloka is sailing across the river!` | Recap starts. | Celebrates completed order. |
| Complete the Shloka! | `Wonderful! You completed the Ganesha Shloka!` | Scene completion. | Confirms achievement. |
| Complete the Shloka! | `You remembered the whole Ganesha Shloka! All eight Ganesha powers are now with you.` | Final celebration. | Final close. |

---

## About Me Hut

| Scene | VO Text | When It Plays | Purpose |
|---|---|---|---|
| Our Families | `Let's meet my family and yours!` | Opening modal. | Introduces both-family comparison. |
| Our Families | `Tap a circle to meet my family!` | Ganesha tree entry and idle hint. | Guides tapping circles. |
| Our Families | `Shiva Ji`, `Parvati Mata`, `Kartikeya`, `Ganesha`, `Vishnu`, `Lakshmi`, `Hanuman`, `Krishna`, `Mooshak`, `Brahma`, `Saraswati` | Family member name reveals. | Names characters. |
| Our Families | `That's my father!`, `That's my mother!`, `That's my brother!`, `That's me!` | Correct placements. | Teaches relationship labels. |
| Our Families | `My father is calm and strong...`, `My mother is kind and loving...`, `My brother is very brave...`, `That's me! I love modaks and helping my friends.` | Fun facts/info cards. | Adds story warmth. |
| Our Families | `Great start!` / `Almost done with my family!` / `Great! You met my loving family!` | Ganesha tree progress/complete. | Encourages progress. |
| Our Families | `Show me your family!` | Transition modal to child tree. | Moves to child's family. |
| Our Families | `Now it's your turn! Add your family to the tree.` | Child tree starts. | Explains child phase. |
| Our Families | `Tap someone below to add to your tree!` | Child tree hint. | Nudges adding members. |
| Our Families | `Nice! Your tree has started growing.` / `Beautiful! You added someone to your family tree.` / `Look at that! Your family tree is getting bigger.` / `Mmm. Your tree is filling with love.` | Child progress. | Affirms child's additions. |
| Our Families | `Look at your beautiful family tree… So many people care about you.` | Child tree complete. | Affirms child's family. |
| Our Families | `Look at our family trees. Connected by love.` | Scene complete. | Emotional close. |
| Our Favorite Things | `Let's explore my favorite things and yours!` | Opening modal. | Introduces comparison gameplay. |
| Our Favorite Things | `Tap my favorite food.` / `Yes! Modak is my favorite!` | Ganesha food choice and success. | Guides/confirms food. |
| Our Favorite Things | `Look for the sweet I love.` | Food idle hint. | Hint for modak. |
| Our Favorite Things | `Tap my favorite color.` / `Yes! Red is my favorite!` | Ganesha color choice and success. | Guides/confirms color. |
| Our Favorite Things | `Look for the bright red color.` | Color idle hint. | Hint for red. |
| Our Favorite Things | `Tap my favorite activity.` / `Yes! I love to dance!` | Ganesha activity choice and success. | Guides/confirms activity. |
| Our Favorite Things | `I love moving to music.` | Activity idle hint. | Hint for dance. |
| Our Favorite Things | `Tap my best friend.` / `Yes! Mooshika is my friend!` | Ganesha friend choice and success. | Guides/confirms friend. |
| Our Favorite Things | `My tiny friend runs very fast.` | Friend idle hint. | Hint for Mooshika. |
| Our Favorite Things | `Now it's your turn!` | Transition to child favorites. | Moves to child. |
| Our Favorite Things | `Tap your favorite food.` / `Tap your favorite color.` / `Tap what you love to do.` / `Type the name of your best friend.` | Child favorite phases. | Guides self-expression. |
| Our Favorite Things | `Yummy!` / `Nice choice!` / `That sounds like fun!` / `That's lovely!` | Child answer confirmations. | Affirms choices. |
| Our Favorite Things | `We like so many fun things!` | Connection moment. | Compares shared favorites. |
| Our Favorite Things | `We know what we both love! Let's make our dreams come true!` | Completion celebration. | Closes and bridges forward. |
| Dream Together | `Let’s help and dream together!` | Opening modal. | Introduces scene. |
| Dream Together | `Let's make the world smile!` / `Tap the kind actions.` / `You made the world kinder!` | Wish 1 intro/action/complete. | Kindness wish flow. |
| Dream Together | `Look for the kind actions.` | Wish 1 idle hint. | Nudges kind actions. |
| Dream Together | `My second wish… is to share our food. So no one stays hungry.` / `Drag food to the plates.` / `Everyone has food now!` | Wish 2 intro/action/complete. | Food sharing flow. |
| Dream Together | `Try dragging food to the plates.` | Wish 2 idle hint. | Nudges drag action. |
| Dream Together | `My last wish… is for a green world full of life. Let’s help this forest grow!` / `Tap to grow the garden.` / `The world is green and happy!` | Wish 3 intro/action/complete. | Garden growth flow. |
| Dream Together | `Tap the forest to make it grow.` | Wish 3 idle hint. | Nudges tap action. |
| Dream Together | `Now it’s your turn!` | After Ganesha's wishes complete. | Transitions to child's dream. |
| Dream Together | `Draw your happy dream.` | Dream drawing phase. | Guides drawing. |
| Dream Together | `Tap my trunk to clear the clouds.` / `Keep tapping to clear the clouds!` | Dream reveal phase and nudge. | Guides reveal mechanic. |
| Dream Together | `Wow, that’s a beautiful dream!` | Dream revealed. | Affirms child dream. |
| Dream Together | `This can help the world!` | Comparison card. | Connects dream to care/help. |
| Dream Together | `It’s shining bright! Now let’s discover your story!` | Completion celebration. | Bridges to My Indian Story. |
| Dream Together | `Keep dreaming and helping!` | Ending. | Warm close. |
| My Indian Story | `Tap to explore my India story and yours!` | Opening modal VO. | Starts story exploration. |
| My Indian Story | `Drag the magnifying glass to find me.` | Ganesha-home entry and idle hint. | Guides discovery. |
| My Indian Story | `You found my special places! I am everywhere!` | Ganesha-home complete. | Celebrates discoveries. |
| My Indian Story | `Tap where your family lives in India.` | Child-home entry. | Guides region selection. |
| My Indian Story | `Look closely… can you find your home?` | Child-home idle hint. | Nudges region selection. |
| My Indian Story | `Beautiful! This is your home.` | Region confirmed. | Affirms choice. |
| My Indian Story | `Tap play to listen.` / `Tap play.` | Language-Ganesha entry and hint. | Guides play button. |
| My Indian Story | `Vakratunda Mahakaya Suryakoti Samaprabha!` | Language audio playback. | Provides chant sample. |
| My Indian Story | `Tap the right language.` / `Listen carefully… look for the prayer scroll.` | Language guess prompt and idle hint. | Guides Sanskrit choice. |
| My Indian Story | `Yes! That's Sanskrit — the language of many mantras.` | Language correct. | Confirms answer. |
| My Indian Story | `Tap up to three languages you speak.` / `Tap the cards to choose.` / `Wonderful! These are your languages.` | Child language phase. | Guides and affirms language choices. |
| My Indian Story | `Tap my favorite festival.` / `Look for the sweet I love.` / `Yes! Ganesh Chaturthi is my birthday!` | Festival-Ganesha phase. | Guides and confirms festival. |
| My Indian Story | `Tap the festivals you celebrate.` / `Tap the cards to choose.` / `Lovely! These are your festivals.` | Child festival phase. | Guides and affirms festival choices. |
| My Indian Story | `We are part of India!` | Origin card. | Summarizes connection. |
| My Indian Story | `Your story is special. We're all connected!` | Completion screen. | Final affirmation. |
