# Three Active Zones: VO Inventory

Sources checked:
- `src/lib/config/content/voiceGuidance.js`
- `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx`
- `src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx`
- `src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx`
- `src/zones/symbol-mountain/scenes/tusk/TuskPathGame.jsx`
- `src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx`
- `src/zones/about-me-hut/family-tree/Familytreegame.jsx`
- `src/zones/about-me-hut/food/Favoritefoodgame.jsx`
- `src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx`
- `src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx`

Note: This lists actual currently-used VO text found in live config/components. Some VO still uses older wording and may need a later copy-sync pass.

---

## Symbol Mountain

| Scene | VO / Hint | When It Plays | Purpose |
|---|---|---|---|
| Calm Mooshika | `Mooshika is nearby. Let's find the sweet modaks.` | Opening modal / scene entry. | Welcomes child into the scene. |
| Calm Mooshika | `Mooshika is hiding. Tap the mounds to find him.` | After game starts, Mooshika search phase. | Gives first action. |
| Calm Mooshika | `Hold Mooshika gently when he pauses near an object.` | Idle hint during Mooshika search, level 2. | Guides child when stuck. |
| Calm Mooshika | `There he is... my little friend.` | When Mooshika is found. | Celebrates discovery. |
| Calm Mooshika | `You looked closely... and found him. Say it with me... I can guide my busy thoughts.` | Mooshika power reveal. | Connects action to self-regulation. |
| Calm Mooshika | `Look... sweet modaks. Tap them to collect.` | Modak collection starts. | Explains next mechanic. |
| Calm Mooshika | `Guide Mushika to each offering for Ganesha.` | Idle hint during offering/modak phase. | Nudges collection action. |
| Calm Mooshika | `You found them... one by one. Say it with me... I have joy inside me.` | Modak/sharing power reveal. | Names inner joy. |
| Calm Mooshika | `Let's enjoy the sweet modaks... drag them here.` | Belly/feeding phase starts. | Explains drag action. |
| Calm Mooshika | `Move a feeling into Ganesha's belly.` | Idle hint during belly/feeling phase. | Nudges final mechanic. |
| Calm Mooshika | `You gave... and it felt good. Say it with me... I feel good inside.` | Gratitude/belly power reveal. | Reinforces emotional payoff. |
| Calm Mooshika | `You found Mooshika. You found joy inside. All yours.` | Scene completion VO. | Closes scene with ownership of learning. |
| Find a Way to the Lotus | `The water can't get through... let's find it a way around.` | Scene entry/opening. | Sets up blocked-water problem. |
| Find a Way to the Lotus | `The rock is in the way. Guide the water around it, to the pond.` | Trunk/water path phase starts. | Explains route-around mechanic. |
| Find a Way to the Lotus | `Try curving the water around the rock...` | Idle hint during trunk/water path phase. | Nudges child to curve the water. |
| Find a Way to the Lotus | `You found a way around... Say it with me... I find my way.` | Trunk power reveal. | Connects trunk to flexibility. |
| Find a Way to the Lotus | `The lotus woke up... press and hold it gently... let it bloom.` | Lotus phase starts. | Explains press-and-hold mechanic. |
| Find a Way to the Lotus | `Hold it gently... watch it rise.` | Idle hint during lotus phase. | Nudges gentle holding. |
| Find a Way to the Lotus | `You stayed with it... nice and slow. Say it with me... I can stay calm when things get messy.` | Lotus bloom power reveal. | Connects lotus to calm. |
| Find a Way to the Lotus | `You found a way, and something beautiful grew. All yours.` | Scene completion VO. | Summarizes trunk + lotus payoff. |
| Look, Listen, Choose | `Let's explore... look and listen.` | Scene entry/opening. | Sets up the three-part scene. |
| Look, Listen, Choose | `Look closely and spot what is hidden.` | Eyes mini-game starts. | Explains visual search. |
| Look, Listen, Choose | `Look closely... you can find them.` | Idle hint during eyes phase. | Nudges hidden-object search. |
| Look, Listen, Choose | `You looked carefully... and found them all.` | Eyes completion. | Confirms careful seeing. |
| Look, Listen, Choose | `Listen carefully and match the sounds.` | Ears mini-game starts. | Explains sound matching. |
| Look, Listen, Choose | `Listen carefully... then choose the match.` | Idle hint during ears phase. | Nudges listening/matching. |
| Look, Listen, Choose | `You listened closely... and got it right.` | Ears completion. | Confirms careful listening. |
| Look, Listen, Choose | `My tusk is hidden beyond this blocked path. Let us clear the way together.` | Tusk phase setup. | Introduces obstacle path. |
| Look, Listen, Choose | `Who can help with these tangled vines?` | Tusk obstacle layer: vines. | Asks child to choose correct helper. |
| Look, Listen, Choose | `Who can clear the loose rocks?` | Tusk obstacle layer: rocks. | Asks child to choose correct helper. |
| Look, Listen, Choose | `Who can help clean this muddy path?` | Tusk obstacle layer: mud. | Asks child to choose correct helper. |
| Look, Listen, Choose | `Who is strong enough to move this giant boulder?` | Tusk obstacle layer: boulder. | Asks child to choose correct helper. |
| Look, Listen, Choose | `Choose the friend who can help, then clear the obstacle.` | Idle hint during Tusk phase. | Reframes tusk as focused choice. |
| Look, Listen, Choose | `Hooray! You did it! The tusk has appeared! You stayed focused and chose just what each obstacle needed. Great teamwork!` | Tusk finale VO. | Celebrates focused choice while allowing teamwork as story outcome. |
| Look, Listen, Choose | `You saw clearly. You listened well. You finished strong. All yours.` | Scene completion VO. | Wraps all three mechanics. |
| All Symbols Together | `You found every symbol... let's place them together.` | Opening modal / scene start. | Frames final assembly. |
| All Symbols Together | `Eyes.`, `Ears.`, `Trunk.`, `Tusk.`, `Modak.`, `Lotus.`, `Belly.`, `Mooshika.` | Each symbol card appears/lands. | Names current symbol. |
| All Symbols Together | `Tap the right part of me.` | Onboarding / placement prompt. | Explains final placement action. |
| All Symbols Together | `I notice the good around me.` | Idle hint for Eyes placement. | Gives meaning hint. |
| All Symbols Together | `I listen with care.` | Idle hint for Ears placement. | Gives meaning hint. |
| All Symbols Together | `I find my way.` | Idle hint for Trunk placement. | Gives meaning hint. |
| All Symbols Together | `I stay focused on what is true.` | Idle hint for Tusk placement. | Gives meaning hint. |
| All Symbols Together | `I have joy inside me.` | Idle hint for Modak placement. | Gives meaning hint. |
| All Symbols Together | `I can stay calm when things get messy.` | Idle hint for Lotus placement. | Gives meaning hint. |
| All Symbols Together | `I have room for all my feelings.` | Idle hint for Belly placement. | Gives meaning hint. |
| All Symbols Together | `I can guide my busy thoughts.` | Idle hint for Mooshika placement. | Gives meaning hint. |
| All Symbols Together | `Yes... that's exactly right.` | First/correct symbol placement. | Confirms correct placement. |
| All Symbols Together | `Look... you're bringing me alive.` | Mid-progress placement. | Encourages continued assembly. |
| All Symbols Together | `Hmm... try again.` | Wrong placement. | Gentle correction. |
| All Symbols Together | `You found all my symbols...` / `Now I am complete.` / `And all my powers... are with you now.` | Final assembly completion. | Celebratory close. |

---

## Shloka River

| Scene | VO / Hint | When It Plays | Purpose |
|---|---|---|---|
| Your Journey Begins! | `Welcome!` | Scene entry/opening. | Welcomes child. |
| Your Journey Begins! | `Round 1 done!`, `Round 2 done!`, `Lotus blooming!` | Vakratunda rounds complete. | Marks progress. |
| Your Journey Begins! | `I adapt!` | Vakratunda power reveal. | Names the power. |
| Your Journey Begins! | `The little frog wants to meet his family.` | Vakratunda rescue intro. | Sets up frog goal. |
| Your Journey Begins! | `Help guide the lily pad another way.` | Vakratunda rescue action prompt. | Explains alternate route. |
| Your Journey Begins! | `The river current is too strong there. Let's try another way.` | Wrong/blocked route. | Gentle correction. |
| Your Journey Begins! | `You found another way. The frog made it home to the family.` | Vakratunda rescue success. | Connects gameplay to another way. |
| Your Journey Begins! | `Mahakaya - start!` | Mahakaya section starts. | Starts second word. |
| Your Journey Begins! | `Now let's help the little calf.` | Mahakaya rescue intro. | Sets up calf goal. |
| Your Journey Begins! | `A heavy log is trapping him!` | Mahakaya obstacle reveal. | Clarifies problem. |
| Your Journey Begins! | `Drag the rope to the log.` / `Now pull down!` | Mahakaya action prompts. | Explains drag/pull mechanic. |
| Your Journey Begins! | `You did it! The calf is free!` | Mahakaya success. | Celebrates rescue. |
| Your Journey Begins! | `It means great strength.` | Mahakaya meaning reveal. | Names meaning. |
| Your Journey Begins! | `Scene complete!` | Scene completion. | Closes scene. |
| Bring Back the Light! | `The river is dark today. Let's bring back the light!` | Scene entry/opening. | Sets visual problem. |
| Bring Back the Light! | `Swipe the dark patch.` | Suryakoti hint/action prompt. | Tells child how to reveal light. |
| Bring Back the Light! | `The light showed the way!` | Suryakoti done. | Confirms light/clarity payoff. |
| Bring Back the Light! | `It means bright as ten million suns.` | Suryakoti meaning. | Teaches meaning. |
| Bring Back the Light! | `Drag the light across. Share the light evenly. Keep balancing.` | Samaprabha hint/action prompt. | Explains balance/equal-light mechanic. |
| Bring Back the Light! | `Both sides are glowing now. You did it.` | Samaprabha done. | Confirms equal shine. |
| Bring Back the Light! | `It helps us share fairly.` | Samaprabha meaning. | Child-facing meaning. |
| Bring Back the Light! | `The light showed the way. Both shine equally now.` | Scene completion. | Summarizes both words. |
| The River Needs You! | `Let's help our river friend. The turtle wants to go home.` | Scene entry/opening. | Sets rescue goal. |
| The River Needs You! | `Something is blocking the way. Drag the obstacle away. Great job. Clear the next one.` | Nirvighnam hint/action prompt. | Guides obstacle clearing. |
| The River Needs You! | `The path is opening up. You did it. The turtle made it home.` | Nirvighnam done. | Confirms cleared path. |
| The River Needs You! | `It helps clear obstacles.` | Nirvighnam meaning. | Teaches meaning. |
| The River Needs You! | `Now another friend needs help. The beaver needs a bridge. Tap the glowing friend. Look. They are helping. Tap the next friend.` | Kuru Me Deva hint/action prompt. | Guides asking/helpers bridge mechanic. |
| The River Needs You! | `The bridge is getting bigger. One more helper. The bridge is ready. The beaver made it across.` | Kuru Me Deva done. | Confirms bridge/help payoff. |
| The River Needs You! | `It means helping together.` | Kuru Me Deva meaning. | Child-facing meaning. |
| The River Needs You! | `The turtle made it home. The beaver made it across. Both powers are yours now.` | Scene completion. | Summarizes both rescues. |
| Care in Every Task | `Let's see who needs help. Look carefully.` | Scene entry/opening. | Sets observational/helping task. |
| Care in Every Task | `The piece wouldn't fit.` / `So she twisted it a new way!` | Puzzle scenario before/after. | Shows a task solved with care. |
| Care in Every Task | `He wanted to give up.` / `But he stayed strong and kept trying!` | Sports scenario before/after. | Shows persistence. |
| Care in Every Task | `Both wanted the bike.` / `So they took fair turns!` | Bike scenario before/after. | Shows fairness. |
| Care in Every Task | `Grandma's bags were heavy.` / `So he ran to help!` | Grandma scenario before/after. | Shows helpful action. |
| Care in Every Task | `Which power would help here? Tap a power. Nice choice. The problem is solved. Let's help another friend.` | Sarvakaryeshu hint/action prompt. | Guides power matching. |
| Care in Every Task | `Choose a power again. You got it. That helped too. One more challenge. Great thinking.` | Sarvakaryeshu continued hint/progress. | Keeps child moving through scenarios. |
| Care in Every Task | `Sarvakaryeshu. Every task can be done with care.` | Sarvakaryeshu meaning. | Names meaning. |
| Care in Every Task | `Our journey is not over yet. Let's keep floating down the river. Tap the bubble.` | Sarvada hint/action prompt. | Guides bubble sequence. |
| Care in Every Task | `Morning. Ganesha is there too. Tap the next bubble. Afternoon. Ganesha is there too. Tap the last bubble. Night. Ganesha is there too.` | Sarvada bubble sequence. | Shows always/across the day. |
| Care in Every Task | `Sarvada. What I learn stays with me.` | Sarvada meaning. | Names meaning. |
| Care in Every Task | `Every task can be done with care. Sarvada. Always.` | Scene completion. | Closes with final meaning. |
| Complete the Shloka! | `You've learned all eight Ganesha powers. Now let's put the shloka together!` | Opening modal prompt. | Sets finale task. |
| Complete the Shloka! | `Tap the first word boat.` | Arrange game start. | Starts sequencing. |
| Complete the Shloka! | `Tap the next word boat.` | Hint boat L1. | Gentle next-step hint. |
| Complete the Shloka! | `Find the next word.` | Hint boat L2. | Stronger sequencing hint. |
| Complete the Shloka! | `Tap the glowing word boat.` | Hint boat L3. | Direct visual hint. |
| Complete the Shloka! | `Look! Your shloka is sailing across the river!` | Recap starts. | Celebrates completed sequence visually. |
| Complete the Shloka! | `Wonderful! You completed the Ganesha Shloka!` | Scene completion. | Confirms achievement. |
| Complete the Shloka! | `You remembered the whole Ganesha Shloka! All eight Ganesha powers are now with you.` | Final celebration. | Final emotional close. |

---

## About Me Hut

| Scene | VO / Hint | When It Plays | Purpose |
|---|---|---|---|
| Our Families | `Let's meet my family and yours!` | Opening modal. | Warmly introduces compare-and-share family theme. |
| Our Families | `Tap a circle to meet my family!` | Ganesha family phase entry and idle hint. | Directs child to tap family circles. |
| Our Families | `Shiva Ji`, `Parvati Mata`, `Kartikeya`, `Ganesha`, etc. | After deity/person is placed or introduced. | Names family members. |
| Our Families | `That's my father!`, `That's my mother!`, `That's my brother!`, `That's me!` | Correct placement reveal. | Teaches relationship labels. |
| Our Families | `My father is calm and strong...`, `My mother is kind and loving...`, etc. | Fun fact / placed-avatar info. | Adds warmth and story detail. |
| Our Families | `Great start!` / `Almost done with my family!` | Ganesha-tree progress. | Encourages progress. |
| Our Families | `Great! You met my loving family!` | Ganesha family complete. | Closes Ganesha side. |
| Our Families | `Show me your family!` | Transition to child phase. | Moves from Ganesha story to child's story. |
| Our Families | `Now it's your turn! Add your family to the tree.` | Child family phase starts. | Explains child input. |
| Our Families | `Tap someone below to add to your tree!` | Child phase hint. | Nudges adding family members. |
| Our Families | `Nice! Your tree has started growing.` / `Beautiful! You added someone...` / `Look at that! Your family tree is getting bigger.` / `Mmm. Your tree is filling with love.` | Child tree progress. | Encourages child additions. |
| Our Families | `Look at your beautiful family tree… So many people care about you.` | Child tree complete. | Affirms child's family. |
| Our Families | `Look at our family trees. Connected by love.` | Scene complete. | Emotional comparison close. |
| Our Favorite Things | `Let's explore my favorite things and yours!` | Opening modal. | Introduces compare-and-share favorites. |
| Our Favorite Things | `Tap my favorite food.` | Ganesha food question. | Directs first choice. |
| Our Favorite Things | `Look for the sweet I love.` | Food idle hint. | Helps child find modak. |
| Our Favorite Things | `Yes! Modak is my favorite!` | Correct food. | Confirms answer. |
| Our Favorite Things | `Tap my favorite color.` | Ganesha color question. | Directs color choice. |
| Our Favorite Things | `Look for the bright red color.` | Color idle hint. | Helps child find red. |
| Our Favorite Things | `Yes! Red is my favorite!` | Correct color. | Confirms answer. |
| Our Favorite Things | `Tap my favorite activity.` | Ganesha activity question. | Directs activity choice. |
| Our Favorite Things | `I love moving to music.` | Activity idle hint. | Helps child infer dancing. |
| Our Favorite Things | `Yes! I love to dance!` | Correct activity. | Confirms answer. |
| Our Favorite Things | `Tap my best friend.` | Ganesha friend question. | Directs friend choice. |
| Our Favorite Things | `My tiny friend runs very fast.` | Friend idle hint. | Helps child infer Mooshika. |
| Our Favorite Things | `Yes! Mooshika is my friend!` | Correct friend. | Confirms answer. |
| Our Favorite Things | `Now it's your turn!` | Transition to child choices. | Moves from Ganesha to child. |
| Our Favorite Things | `Tap your favorite food.` / `Tap your favorite color.` / `Tap what you love to do.` / `Type the name of your best friend.` | Child favorite phases. | Guides child self-expression. |
| Our Favorite Things | `Yummy!` / `Nice choice!` / `That sounds like fun!` / `That's lovely!` | Child answer confirmations. | Affirms child choices. |
| Our Favorite Things | `We like so many fun things!` | Connection moment. | Highlights friendship/comparison. |
| Our Favorite Things | `We know what we both love! Let's make our dreams come true!` | Completion celebration. | Closes and bridges to next scene. |
| Dream Together | `Let’s help and dream together!` | Opening modal. | Introduces helping + dreaming. |
| Dream Together | `Let's make the world smile!` | Wish 1 intro. | Sets first wish. |
| Dream Together | `Tap the kind actions.` | Wish 1 active prompt. | Directs kindness interaction. |
| Dream Together | `Look for the kind actions.` | Wish 1 idle hint. | Helps child find targets. |
| Dream Together | `You made the world kinder!` | Wish 1 complete. | Celebrates kindness. |
| Dream Together | `My second wish… is to share our food. So no one stays hungry.` | Wish 2 intro. | Sets sharing-food wish. |
| Dream Together | `Drag food to the plates.` | Wish 2 active prompt. | Explains drag mechanic. |
| Dream Together | `Try dragging food to the plates.` | Wish 2 idle hint. | Nudges drag action. |
| Dream Together | `Everyone has food now!` | Wish 2 complete. | Celebrates sharing. |
| Dream Together | `My last wish… is for a green world full of life. Let’s help this forest grow!` | Wish 3 intro. | Sets green-world wish. |
| Dream Together | `Tap to grow the garden.` | Wish 3 active prompt. | Explains tap-to-grow mechanic. |
| Dream Together | `Tap the forest to make it grow.` | Wish 3 idle hint. | Nudges garden action. |
| Dream Together | `The world is green and happy!` | Wish 3 complete. | Celebrates growth. |
| Dream Together | `Now it’s your turn!` | All wishes complete. | Transitions to child's dream. |
| Dream Together | `Draw your happy dream.` | Dream drawing phase. | Guides self-expression. |
| Dream Together | `Tap my trunk to clear the clouds.` / `Keep tapping to clear the clouds!` | Dream reveal phase and nudge. | Guides reveal mechanic. |
| Dream Together | `Wow, that’s a beautiful dream!` | Dream revealed. | Affirms child's dream. |
| Dream Together | `This can help the world!` | Comparison card. | Connects dream back to helping. |
| Dream Together | `It’s shining bright! Now let’s discover your story!` | Completion celebration. | Bridges to My Indian Story. |
| Dream Together | `Keep dreaming and helping!` | Ending VO. | Warm close. |
| My Indian Story | `Tap to explore my India story and yours!` | Opening modal VO. | Starts story exploration. |
| My Indian Story | `Drag the magnifying glass to find me.` | Ganesha-home entry and idle hint. | Guides discovery mechanic. |
| My Indian Story | `You found my special places! I am everywhere!` | Ganesha-home complete. | Celebrates location discovery. |
| My Indian Story | `Tap where your family lives in India.` | Child-home entry. | Guides region/home selection. |
| My Indian Story | `Look closely… can you find your home?` | Child-home idle hint. | Nudges selection. |
| My Indian Story | `Beautiful! This is your home.` | Region selected. | Confirms choice. |
| My Indian Story | `Tap play to listen.` / `Tap play.` | Language-Ganesha entry and hint. | Directs audio playback. |
| My Indian Story | `Vakratunda Mahakaya Suryakoti Samaprabha!` | Language audio playback. | Gives chant sample. |
| My Indian Story | `Tap the right language.` | Language guess prompt. | Guides language choice. |
| My Indian Story | `Listen carefully… look for the prayer scroll.` | Language guess idle hint. | Nudges Sanskrit choice. |
| My Indian Story | `Yes! That's Sanskrit — the language of many mantras.` | Language correct. | Confirms answer. |
| My Indian Story | `Tap up to three languages you speak.` | Child language phase. | Invites child's languages. |
| My Indian Story | `Tap the cards to choose.` | Child language idle hint. | Nudges card selection. |
| My Indian Story | `Wonderful! These are your languages.` | Child languages confirmed. | Affirms choices. |
| My Indian Story | `Tap my favorite festival.` | Festival-Ganesha prompt. | Guides festival guess. |
| My Indian Story | `Look for the sweet I love.` | Festival guess idle hint. | Nudges Ganesh Chaturthi/modak cue. |
| My Indian Story | `Yes! Ganesh Chaturthi is my birthday!` | Festival correct. | Confirms festival. |
| My Indian Story | `Tap the festivals you celebrate.` | Child festival phase. | Invites child's festivals. |
| My Indian Story | `Tap the cards to choose.` | Child festival idle hint. | Nudges selection. |
| My Indian Story | `Lovely! These are your festivals.` | Child festivals confirmed. | Affirms choices. |
| My Indian Story | `We are part of India!` | Origin card. | Summarizes connection. |
| My Indian Story | `Your story is special. We're all connected!` | Completion screen. | Final affirmation. |
