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
| Modak | `Mooshika has a journey ahead. Let’s help him.` | Opening modal is visible. | Sets the journey goal. |
| Modak | `Mooshika’s thoughts keep jumping around. Press and hold to help him focus.` | Game 1 / Mooshika focus starts. | Explains focus hold mechanic. |
| Modak | `Mooshika stayed with it and made a little progress.` | Mooshika focus succeeds. | Confirms focus success. |
| Modak | `I can keep going, one small step at a time.` | Mooshika reveal card affirmation. | Connects Mooshika to steady effort. |
| Modak | `Two flowers are hiding in the leaves. Swipe them apart.` | Game 2 / bush phase starts. | Explains leaf swipe. |
| Modak | `Two flowers are too high for Mooshika. Pull the branch down.` | Game 2 / tree branch phase starts. | Combines tree setup and action. |
| Modak | `Keep holding the branch.` | Tree branch idle / early release hint. | Nudges continued hold. |
| Modak | `The last two flowers are across the mud. Guide Mooshika from safe spot to safe spot.` | Game 2 / marsh phase starts. | Explains safe-spot path. |
| Modak | `You made it! All six flowers.` | Game 2 success after all flowers. | Confirms all flowers found. |
| Modak | `I can have lots of feelings and keep going.` | Big Belly reveal card affirmation. | Connects Belly to feelings + persistence. |
| Modak | `You found all six flowers. Tap them to make a garland for Ganesha.` | Game 3 / garland making starts. | Explains garland tap mechanic. |
| Modak | `The garland is ready! Drag it to Ganesha.` | Garland completed. | Starts carry step. |
| Modak | `You brought the garland to Ganesha — and look, a sweet Modak!` | Garland offered / Modak reveal. | Combines offering success and Modak reveal. |
| Modak | `I can learn, keep trying, and find joy.` | Modak reveal card affirmation. | Connects Modak to effort → joy. |
| Modak | `Small steps, big feelings, and lots of trying brought Mooshika to Ganesha.` | Final fireworks / scene-complete VO. | Closes full Modak scene. |
| Find a Way to the Lotus | `The lotus needs water to bloom. Let’s help the water reach it.` | Opening modal is visible. | Sets blocked-water story goal. |
| Find a Way to the Lotus | `The rock is blocking the stream. Press and hold to move it.` | Rock phase prompt. | Explains first hold mechanic. |
| Find a Way to the Lotus | `Keep holding to move the rock.` | Idle hint in rock phase. | Nudges continued hold. |
| Find a Way to the Lotus | `The flowers are in the water’s way. Gently move them aside.` | Flowers phase prompt. | Explains gentle movement mechanic. |
| Find a Way to the Lotus | `Move the flowers gently so the water can pass.` | Idle hint in flowers phase. | Nudges gentle flower move. |
| Find a Way to the Lotus | `The water reached the lotus.` | Trunk success beat. | Confirms the water reached the lotus before Trunk reveal. |
| Find a Way to the Lotus | `I can be strong and gentle.` | Trunk reveal card affirmation. | Connects Trunk to strength + gentleness. |
| Find a Way to the Lotus | `The water reached the lotus. Hold the bud to help it bloom.` | Lotus phase prompt. | Explains hold-to-bloom mechanic. |
| Find a Way to the Lotus | `Keep holding the bud.` | Idle hint in lotus phase. | Nudges continued hold. |
| Find a Way to the Lotus | `The lotus bloomed, even in the muddy pond.` | Lotus success beat. | Confirms bloom before Lotus reveal. |
| Find a Way to the Lotus | `I can keep growing when things are hard.` | Lotus reveal card affirmation. | Connects Lotus to growing through hard things. |
| Find a Way to the Lotus | `You used strength, then gentleness, and helped the lotus bloom.` | Final fireworks / scene-complete VO. | Summarizes trunk + lotus flow. |
| Look, Listen, Choose | `Let's explore... look and listen.` | Opening modal is visible. | Sets up the scene. |
| Look, Listen, Choose | `Look closely and spot what is hidden.` | Eyes phase prompt, before entering telescope mini-game. | Explains visual search. |
| Look, Listen, Choose | `Look closely — there's still one hiding.` | Idle hint in eyes phase. | Nudges visual search. |
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
| Vakratunda Grove | `Our river friends need a way across. Let’s help.` | Opening modal is visible. | Sets river-crossing goal. |
| Vakratunda Grove | `Frog’s way to his family is blocked. Drag Frog to find another way.` | Vakratunda start. | Gives problem + action. |
| Vakratunda Grove | `That way is blocked. Can you find another way around?` | Blocked / choose prompt. | Nudges alternate route. |
| Vakratunda Grove | `Look for another way through.` | Hint. | Helps child keep searching. |
| Vakratunda Grove | `Vakratunda! You found another way and helped Frog reach his family.` | Vakratunda success. | Confirms another-way payoff. |
| Vakratunda Grove | `I can change my plan and try another way.` | Vakratunda reveal card affirmation. | Say-with-me affirmation. |
| Vakratunda Grove | `The friends are waiting. Let’s build a raft with space for everyone.` | Mahakaay start. | Sets raft goal. |
| Vakratunda Grove | `Bring the rope to the log.` | Rope instruction. | Starts rope/log mechanic. |
| Vakratunda Grove | `Drag the rope to a log.` | Drag hint. | Clarifies action. |
| Vakratunda Grove | `Now pull down.` | Pull prompt. | Guides pull action. |
| Vakratunda Grove | `Mahakaay! You made space so everyone could come along.` | Mahakaay success. | Confirms space-for-everyone payoff. |
| Vakratunda Grove | `I can make space in my heart for others.` | Mahakaay reveal card affirmation. | Say-with-me affirmation. |
| Vakratunda Grove | `You found another way, and made sure everyone could come along.` | Final fireworks / scene-complete VO. | Summarizes both words. |
| Suryakoti Bank | `The river is dark. Let’s bring back some light.` | Opening modal is visible. | Sets dark-river goal. |
| Suryakoti Bank | `Bunny can’t find home. Rub the glow to bring back the light.` | Suryakoti start. | Gives problem + action. |
| Suryakoti Bank | `Rub the glowing spot.` / `Keep rubbing.` | Suryakoti hints. | Nudges rubbing action. |
| Suryakoti Bank | `Suryakoti! You brought back the light and helped Bunny home.` | Suryakoti success. | Confirms light helped Bunny. |
| Suryakoti Bank | `I can find hope inside me.` | Suryakoti reveal card affirmation. | Say-with-me affirmation. |
| Suryakoti Bank | `A little deer sees a strange shadow. Move the light and look closely.` | Samaprabha start. | Gives shadow problem + action. |
| Suryakoti Bank | `Move the light and look closely.` / `Look again — what is really there?` | Samaprabha hints. | Nudges close-looking action. |
| Suryakoti Bank | `Samaprabha! You looked closely and helped Deer feel safe.` | Samaprabha success. | Confirms seeing clearly. |
| Suryakoti Bank | `I can see what is really there.` | Samaprabha reveal card affirmation. | Say-with-me affirmation. |
| Suryakoti Bank | `You brought back the light and saw what was really there.` | Final fireworks / scene-complete VO. | Summarizes both words. |
| Nirvighnam Chant | `The way ahead is tricky. Let’s help our friends through.` | Opening modal is visible. | Sets blocked-way goal. |
| Nirvighnam Chant | `Turtle’s way home is blocked. Press and hold the rock to move it.` | Nirvighnam start. | Gives Turtle problem + action. |
| Nirvighnam Chant | `Something’s still blocking Turtle’s way.` | Nirvighnam hint. | Nudges clearing remaining obstacle. |
| Nirvighnam Chant | `Nirvighnam! You cleared the way and helped Turtle through.` | Nirvighnam success. | Confirms cleared path. |
| Nirvighnam Chant | `I can solve one thing at a time.` | Nirvighnam reveal card affirmation. | Say-with-me affirmation. |
| Nirvighnam Chant | `Baby Beaver is across the broken bridge. Press and hold to lift the logs and help rebuild it.` | Kuru Me Deva start. | Gives Beaver bridge problem. |
| Nirvighnam Chant | `Who can help with the logs?` / `Who can help with the rope?` | Kuru Me Deva helper hints. | Nudges asking helpers. |
| Nirvighnam Chant | `Kuru Me Deva! You asked for help and finished the bridge.` | Kuru Me Deva success. | Confirms asking-for-help payoff. |
| Nirvighnam Chant | `I can ask for help when I need it.` | Kuru Me Deva reveal card affirmation. | Say-with-me affirmation. |
| Nirvighnam Chant | `You cleared the path and asked for help when things got hard.` | Final fireworks / scene-complete VO. | Summarizes both words. |
| Sarvakaryeshu Chant | `Let’s see where Ganesha is with you today.` | Opening modal is visible. | Sets daily-life goal. |
| Sarvakaryeshu Chant | `So much to do. Which symbol can help him start small?` | Mooshika task prompt. | Starts small-step choice. |
| Sarvakaryeshu Chant | `Mooshika helped him begin with one small thing.` | Mooshika task success. | Confirms start-small payoff. |
| Sarvakaryeshu Chant | `So many distractions. Which symbol can help him focus?` | Eyes task prompt. | Starts focus choice. |
| Sarvakaryeshu Chant | `The Eyes helped him focus on what mattered.` | Eyes task success. | Confirms focus payoff. |
| Sarvakaryeshu Chant | `Heavy here, gentle there. Which symbol can help?` | Trunk task prompt. | Starts strength/gentleness choice. |
| Sarvakaryeshu Chant | `The Trunk helped him use strength, then gentleness.` | Trunk task success. | Confirms strong + gentle payoff. |
| Sarvakaryeshu Chant | `The crayon is broken. Which symbol can help?` | Tusk task prompt. | Starts broken-but-useful choice. |
| Sarvakaryeshu Chant | `The Tusk reminded her that something broken can still help.` | Tusk task success. | Confirms broken-but-useful payoff. |
| Sarvakaryeshu Chant | `Try another symbol.` | Wrong choice hint. | Gentle correction. |
| Sarvakaryeshu Chant | `Sarvakaryeshu! You chose a Ganesha symbol for each task.` | Sarvakaryeshu success. | Confirms symbol matching. |
| Sarvakaryeshu Chant | `I can remember Ganesha in everything I do.` | Sarvakaryeshu reveal card affirmation. | Say-with-me affirmation. |
| Sarvakaryeshu Chant | `Morning, afternoon and night — let’s find Ganesha through your day.` | Sarvada start. | Sets day-sequence goal. |
| Sarvakaryeshu Chant | `Let’s look at the morning.` | Morning memory. | Starts morning search. |
| Sarvakaryeshu Chant | `Now the afternoon.` | Afternoon memory. | Starts afternoon search. |
| Sarvakaryeshu Chant | `Now the night.` | Night memory. | Starts night search. |
| Sarvakaryeshu Chant | `Can you find the hidden symbol?` | Sarvada hidden-symbol prompt. | Nudges finding symbol. |
| Sarvakaryeshu Chant | `Sarvada! You found Ganesha through the whole day.` | Sarvada success. | Confirms whole-day discovery. |
| Sarvakaryeshu Chant | `Ganesha is always with me.` | Sarvada reveal card affirmation. | Say-with-me affirmation. |
| Sarvakaryeshu Chant | `From morning to night, Ganesha was with you.` | Final fireworks / scene-complete VO. | Final wrap for the scene. |
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
