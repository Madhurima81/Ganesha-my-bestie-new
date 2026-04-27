// dareBank.js — Time With Ganesha Daily Dare Bank
// 150 dares × 3 age tiers = 450 unique experiences
// ~5 months of daily use before any repeat
//
// Structure:
//   category:  'kindness' | 'compassion' | 'gratitude' | 'cultural' | 'courage'
// text_5_7: ages 5-7 - concrete, single action, simple words, Ganesha companion
// text_8_10: ages 8-10 - slightly richer, light reflection, mission framing
// text_11_12: ages 11-12 - internal growth, identity, nuance (no cuteness)
//
// Unlock logic (matches DareAndShare.jsx):
//   kindness    → unlocks: cat story
//   compassion  → unlocks: draw with Ganesha
//   gratitude   → unlocks: Ganesha card
//   cultural    → unlocks: secret festival story
//   courage     → unlocks: Mooshika badge

export const DARE_BANK = [

  // ─────────────────────────────────────────────
  // CATEGORY 1 — KINDNESS (toward people)
  // CASEL: Social Awareness + Relationship Skills
  // ─────────────────────────────────────────────

  {
    id: 'k01',
    category: 'kindness',
 text_5_7: "Ganesha has a smile mission for you! Tell Mama or Papa one thing you love about them.",
 text_8_10: "Today Ganesha is sending you a smile mission. Tell one person one lovely thing about them. Watch their face light up.",
 text_11_12: "Notice something beautiful about someone today - a skill, a habit, a kindness - and tell them clearly. Real compliments are powerful.",
  },
  {
    id: 'k02',
    category: 'kindness',
 text_5_7: "Make someone laugh today! A silly face, a funny dance - pick your magic.",
 text_8_10: "Make someone laugh today with a silly face, a funny walk, or a tiny joke.",
 text_11_12: "Find someone whose day feels heavy. Lighten it with humour or warmth. Joy is a gift you can give.",
  },
  {
    id: 'k03',
    category: 'kindness',
 text_5_7: "Use your strong elephant power! Help someone carry something today.",
 text_8_10: "Use your elephant strength today. Help someone lift or carry something.",
 text_11_12: "Offer help before anyone asks. Kind leaders notice first and act quietly.",
  },
  {
    id: 'k04',
    category: 'kindness',
 text_5_7: "Draw a happy picture for Nana, Dadi, or someone you love far away.",
 text_8_10: "Draw a happy picture for someone far away. Send your love travelling.",
 text_11_12: "Reach out to someone you don't speak to enough. A short thoughtful message can change a day.",
  },
  {
    id: 'k05',
    category: 'kindness',
 text_5_7: "Share something you really like with someone today.",
 text_8_10: "Share something you really like today. Sharing makes hearts grow bigger.",
 text_11_12: "Give something you actually value - not something you no longer want. Generosity feels different when it costs a little.",
  },
  {
    id: 'k06',
    category: 'kindness',
 text_5_7: "Say thank you to Mama, Papa, or whoever helps you today. Look in their eyes.",
 text_8_10: "Say thank you to someone who helps you every day. Look into their eyes when you say it.",
 text_11_12: "Thank someone today for an old kindness you never fully noticed.",
  },
  {
    id: 'k07',
    category: 'kindness',
 text_5_7: "Let someone go first today - in a game or in a line.",
 text_8_10: "Let someone else go first today, in a game, in a line, anywhere.",
 text_11_12: "Choose to put someone else's wish before yours once today. Notice what happens inside you.",
  },
  {
    id: 'k08',
    category: 'kindness',
 text_5_7: "Hold the door open like a tiny hero today!",
 text_8_10: "Hold the door open like a tiny hero today.",
 text_11_12: "Do one small action that makes someone's work easier - a teacher, a helper, a worker.",
  },
  {
    id: 'k09',
    category: 'kindness',
 text_5_7: "If someone looks sad, give them a soft smile.",
 text_8_10: "If someone looks sad, give them a kind word or a soft smile.",
 text_11_12: "Sit beside someone who is alone today. Presence itself is kindness.",
  },
  {
    id: 'k10',
    category: 'kindness',
 text_5_7: "Invite someone new to play with you today!",
 text_8_10: "Invite someone new to play with you today.",
 text_11_12: "Include someone who is usually left out. You are choosing courage and kindness together.",
  },
  {
    id: 'k11',
    category: 'kindness',
 text_5_7: "Walk in with a big smile today. It makes the room sparkle!",
 text_8_10: "Give a big cheerful smile when you enter a room today.",
 text_11_12: "Be the first to greet someone quiet or new. Confidence can be shared.",
  },
  {
    id: 'k12',
    category: 'kindness',
 text_5_7: "Tell your brother, sister, or cousin one sweet thing about them.",
 text_8_10: "Tell your sibling or cousin one sweet thing about them.",
 text_11_12: "Say something kind to a sibling even when you feel irritated. That is advanced kindness.",
  },
  {
    id: 'k13',
    category: 'kindness',
 text_5_7: "Give someone a high-five or a big warm hug today!",
 text_8_10: "Give someone a high-five, hug, or warm wave today.",
 text_11_12: "Check on a friend with a real question: 'How are you feeling... really?'",
  },
  {
    id: 'k14',
    category: 'kindness',
 text_5_7: "Make a tiny surprise for someone - a drawing or a paper flower.",
 text_8_10: "Make a tiny surprise gift today - a drawing, a flower, a note.",
 text_11_12: "Create something thoughtful for someone who isn't expecting it. The surprise is part of the gift.",
  },
  {
    id: 'k15',
    category: 'kindness',
 text_5_7: "Tell Mama or Papa: 'I love having you in my life.'",
 text_8_10: "Tell a grown-up at home that you love having them in your life.",
 text_11_12: "Tell a parent one specific thing they do that helps you feel safe or happy.",
  },
  {
    id: 'k16',
    category: 'kindness',
 text_5_7: "Use only soft, kind words today. Your voice can be soft like cotton!",
 text_8_10: "Use only gentle words today. Your voice can be soft like cotton.",
 text_11_12: "Notice unkind thoughts before they become words. Choose better words consciously.",
  },
  {
    id: 'k17',
    category: 'kindness',
 text_5_7: "Help tidy up at home without being asked!",
 text_8_10: "Help tidy or set something at home without being asked.",
 text_11_12: "Do one invisible helpful act today. Let kindness be a secret.",
  },
  {
    id: 'k18',
    category: 'kindness',
 text_5_7: "Wave and smile at a neighbour today!",
 text_8_10: "Wave and smile at a neighbour today.",
 text_11_12: "Talk kindly with an elder today. Listen to one full story.",
  },
  {
    id: 'k19',
    category: 'kindness',
 text_5_7: "Tell your best friend why you love being their friend.",
 text_8_10: "Tell your best friend why you like being their friend.",
 text_11_12: "Say something meaningful to a close friend you've been keeping inside.",
  },
  {
    id: 'k20',
    category: 'kindness',
 text_5_7: "Wait for your turn with a big smile today!",
 text_8_10: "Be extra patient with someone today, even if they're slow.",
 text_11_12: "Match someone else's pace instead of rushing ahead.",
  },
  {
    id: 'k21',
    category: 'kindness',
 text_5_7: "Teach someone a fun thing you know how to do!",
 text_8_10: "Teach someone a fun thing you know how to do.",
 text_11_12: "Help someone learn a skill patiently. Teaching is leadership.",
  },
  {
    id: 'k22',
    category: 'kindness',
 text_5_7: "Cheer loudly for someone today - clap, dance, celebrate!",
 text_8_10: "Cheer loudly for someone today - a friend, a sibling, anyone.",
 text_11_12: "Celebrate someone else's success as if it were your own.",
  },
  {
    id: 'k23',
    category: 'kindness',
 text_5_7: "Pick up something someone dropped and give it back kindly.",
 text_8_10: "Pick up something someone dropped and return it kindly.",
 text_11_12: "Do one good action today where nobody knows you did it.",
  },
  {
    id: 'k24',
    category: 'kindness',
 text_5_7: "Sit or play with someone new today!",
 text_8_10: "Sit or play with someone different today.",
 text_11_12: "Start a real conversation with someone outside your usual circle.",
  },
  {
    id: 'k25',
    category: 'kindness',
 text_5_7: "Be very gentle with a younger child today.",
 text_8_10: "Be very gentle and helpful to a younger child today.",
 text_11_12: "Be a calm guide to someone younger - patient, protective, encouraging.",
  },
  {
    id: 'k26',
    category: 'kindness',
 text_5_7: "Listen with your whole face when someone talks. No looking away!",
 text_8_10: "Listen carefully when someone talks. No looking away.",
 text_11_12: "Give someone your full attention today. Listening deeply is rare kindness.",
  },
  {
    id: 'k27',
    category: 'kindness',
 text_5_7: "If you were not kind to someone, say sorry today.",
 text_8_10: "Say sorry if you hurt someone earlier this week.",
 text_11_12: "Repair one relationship today - through apology, action, or message.",
  },
  {
    id: 'k28',
    category: 'kindness',
 text_5_7: "Be kind to someone, even if they were not kind to you.",
 text_8_10: "Be kind even to someone who wasn't kind to you.",
 text_11_12: "Offer kindness without expecting fairness back. That shows inner strength.",
  },
  {
    id: 'k29',
    category: 'kindness',
 text_5_7: "Help a grown-up with something they are doing today!",
 text_8_10: "Help a grown-up with something they are doing today.",
 text_11_12: "Notice the emotional or physical load at home. Offer real support.",
  },
  {
    id: 'k30',
    category: 'kindness',
 text_5_7: "Before sleep, tell someone you love them.",
 text_8_10: "Before sleep, tell someone you love them.",
 text_11_12: "End your day by letting one person know they matter to you.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 2 — COMPASSION (toward all living things)
  // CASEL: Social Awareness | Ahimsa
  // ─────────────────────────────────────────────

  {
    id: 'c01',
    category: 'compassion',
 text_5_7: "Ganesha has a green friend for you! Water a plant and say 'I love you' to it.",
 text_8_10: "Today Ganesha gives you a tiny green friend. Water a plant and say one loving word to it.",
 text_11_12: "Care for something living today that cannot ask you for help - a plant, a pet, a small creature.",
  },
  {
    id: 'c02',
    category: 'compassion',
 text_5_7: "If you see a tiny bug today, be gentle. Let it go safely!",
 text_8_10: "If you see a tiny insect today, be gentle. Let it go safely.",
 text_11_12: "Go through the day trying not to harm any living being - even the smallest.",
  },
  {
    id: 'c03',
    category: 'compassion',
 text_5_7: "Put a little bowl of water outside for birds!",
 text_8_10: "Put a little bowl of water outside for birds or animals.",
 text_11_12: "Do one thoughtful action today for an animal that is not yours.",
  },
  {
    id: 'c04',
    category: 'compassion',
 text_5_7: "Be a litter rescuer! Pick up one piece and throw it away.",
 text_8_10: "Rescue one piece of litter and throw it away.",
 text_11_12: "Quietly clean up your surroundings today - at least three small acts.",
  },
  {
    id: 'c05',
    category: 'compassion',
 text_5_7: "Touch a tree gently today and say 'thank you'.",
 text_8_10: "Touch a tree gently and say thank you.",
 text_11_12: "Spend five mindful minutes with something in nature - really notice it.",
  },
  {
    id: 'c06',
    category: 'compassion',
 text_5_7: "Give extra love to a pet or animal you see today!",
 text_8_10: "Give extra love to a pet or animal you meet today.",
 text_11_12: "Spend time understanding what an animal needs - not just what you enjoy.",
  },
  {
    id: 'c07',
    category: 'compassion',
 text_5_7: "Try to finish all the food on your plate today!",
 text_8_10: "Try not to waste food today. Finish what you take.",
 text_11_12: "Think about the journey of your food and feel gratitude for every hand involved.",
  },
  {
    id: 'c08',
    category: 'compassion',
 text_5_7: "Turn off a tap or light if no one is using it!",
 text_8_10: "Turn off a tap or light that was left on.",
 text_11_12: "Make one eco-friendly choice today - reduce water, energy, or waste.",
  },
  {
    id: 'c09',
    category: 'compassion',
 text_5_7: "Be gentle with plants and trees today. Don't pull leaves!",
 text_8_10: "Be gentle with plants and trees today.",
 text_11_12: "Give something back to nature today - water, plant, or protect.",
  },
  {
    id: 'c10',
    category: 'compassion',
 text_5_7: "Watch a bird today and see where it flies!",
 text_8_10: "Watch a bird today and see where it flies.",
 text_11_12: "Sit outdoors quietly for ten minutes and observe the life around you.",
  },
  {
    id: 'c11',
    category: 'compassion',
 text_5_7: "If you see worms after rain, walk carefully around them.",
 text_8_10: "If you see worms after rain, walk carefully around them.",
 text_11_12: "Notice a creature people ignore or dislike. Find one reason to respect it.",
  },
  {
    id: 'c12',
    category: 'compassion',
 text_5_7: "Ask a grown-up to tell you about a tree they love.",
 text_8_10: "Ask a grown-up about animals or trees that lived here long ago.",
 text_11_12: "Learn about one endangered animal today and share its story.",
  },
  {
    id: 'c13',
    category: 'compassion',
 text_5_7: "Use both sides of your paper before throwing it!",
 text_8_10: "Use both sides of your paper before throwing it away.",
 text_11_12: "Reuse something today that you would normally waste.",
  },
  {
    id: 'c14',
    category: 'compassion',
 text_5_7: "Did you forget to water a plant? Say sorry and water it now!",
 text_8_10: "Say sorry to a plant you forgot to care for.",
 text_11_12: "Take responsibility for something living you've neglected.",
  },
  {
    id: 'c15',
    category: 'compassion',
 text_5_7: "Draw your favourite animal and smile at it!",
 text_8_10: "Draw your favourite animal and smile at it.",
 text_11_12: "Write three qualities you admire in a wild animal.",
  },
  {
    id: 'c16',
    category: 'compassion',
 text_5_7: "Keep water clean today! Don't put dirty things in it.",
 text_8_10: "Keep water clean today - don't pour dirty things outside.",
 text_11_12: "Think about where water comes from and where it goes after use.",
  },
  {
    id: 'c17',
    category: 'compassion',
 text_5_7: "Look at the clouds! Find one that looks like an animal.",
 text_8_10: "Look at the sky and imagine cloud animals.",
 text_11_12: "Notice the weather deeply today - colours, smells, sounds.",
  },
  {
    id: 'c18',
    category: 'compassion',
 text_5_7: "Feed birds or squirrels safely if you can!",
 text_8_10: "Feed birds or squirrels safely if you can.",
 text_11_12: "Learn the names of three animals or birds that live near you.",
  },
  {
    id: 'c19',
    category: 'compassion',
 text_5_7: "Hug a tree today. Yes, really!",
 text_8_10: "Hug a tree today. Yes, really.",
 text_11_12: "Stand near a tree and imagine how many years it has lived.",
  },
  {
    id: 'c20',
    category: 'compassion',
 text_5_7: "Be quiet for one whole minute. What sounds do you hear?",
 text_8_10: "Be quiet for one minute and listen to nature sounds.",
 text_11_12: "Spend time in silence today without screens or music.",
  },
  {
    id: 'c21',
    category: 'compassion',
 text_5_7: "Tell someone about an animal you really love!",
 text_8_10: "Tell someone about an animal you want to protect.",
 text_11_12: "Share something new you learned about nature today.",
  },
  {
    id: 'c22',
    category: 'compassion',
 text_5_7: "Find something beautiful outside - flower, leaf, or stone!",
 text_8_10: "Find something beautiful outside and look closely.",
 text_11_12: "Find beauty in something most people ignore.",
  },
  {
    id: 'c23',
    category: 'compassion',
 text_5_7: "Use a little water when washing hands. Don't waste!",
 text_8_10: "Use only the water you really need today.",
 text_11_12: "Notice your daily water use and reduce it slightly.",
  },
  {
    id: 'c24',
    category: 'compassion',
 text_5_7: "If you see a hurt animal, tell a grown-up right away.",
 text_8_10: "If you see a hurt animal, tell a grown-up quickly.",
 text_11_12: "Learn what to do if you encounter an injured animal.",
  },
  {
    id: 'c25',
    category: 'compassion',
 text_5_7: "Plant a seed today, or imagine planting one!",
 text_8_10: "Plant a seed today if you have one.",
 text_11_12: "Start growing something today - even in a small cup, even a bean.",
  },
  {
    id: 'c26',
    category: 'compassion',
 text_5_7: "Be kind to every living thing today - even the tiny ones!",
 text_8_10: "Be kind to every living thing today, even tiny ones.",
 text_11_12: "Treat all living beings today as important and worthy.",
  },
  {
    id: 'c27',
    category: 'compassion',
 text_5_7: "Ask Mama or Papa about an animal from Indian stories!",
 text_8_10: "Ask about an animal from Indian stories or traditions.",
 text_11_12: "Learn why certain animals are sacred in Indian culture.",
  },
  {
    id: 'c28',
    category: 'compassion',
 text_5_7: "Ganesha rides a tiny mouse! Find something tiny doing something amazing today.",
 text_8_10: "Remember Ganesha rides a little mouse. Notice something tiny doing something amazing.",
 text_11_12: "Find strength or intelligence in something small today.",
  },
  {
    id: 'c29',
    category: 'compassion',
 text_5_7: "Try not to hurt even a mosquito today. Just move away gently!",
 text_8_10: "Try not to hurt even a mosquito today - just move away.",
 text_11_12: "Practice ahimsa consciously today. Notice every moment you choose gentleness.",
  },
  {
    id: 'c30',
    category: 'compassion',
 text_5_7: "Do one loving thing for the Earth today!",
 text_8_10: "Do one loving action today for the Earth.",
 text_11_12: "Make one decision today guided by care for the planet, not convenience.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 3 — GRATITUDE (noticing beauty)
  // CASEL: Self-Awareness | Louise Hay
  // ─────────────────────────────────────────────

  {
    id: 'g01',
    category: 'gratitude',
 text_5_7: "Beauty treasure hunt! Find the most beautiful thing at home and show someone.",
 text_8_10: "Today go on a beauty treasure hunt at home. Find the most beautiful thing and show someone.",
 text_11_12: "Pause in a place you usually rush past. Find something quietly beautiful there.",
  },
  {
    id: 'g02',
    category: 'gratitude',
 text_5_7: "Tell three people why you like them today!",
 text_8_10: "Tell three people why you like them today.",
 text_11_12: "Think of three people you are grateful for. Tell each one specific reason.",
  },
  {
    id: 'g03',
    category: 'gratitude',
 text_5_7: "Look at your food and say a tiny thank you before eating!",
 text_8_10: "Before eating, look at your food and say a tiny thank you.",
 text_11_12: "Eat one meal slowly today. Notice every flavour and the journey it took to reach you.",
  },
  {
    id: 'g04',
    category: 'gratitude',
 text_5_7: "Look at the sky and whisper 'thank you for today'!",
 text_8_10: "Look at the sky and whisper thank you for this day.",
 text_11_12: "Begin your morning with one grateful thought before touching your phone.",
  },
  {
    id: 'g05',
    category: 'gratitude',
 text_5_7: "Find something lovely outside - a flower, cloud, or bird - and show someone!",
 text_8_10: "Find something lovely outside and share it with someone.",
 text_11_12: "Notice one beautiful detail others miss today. Point it out gently.",
  },
  {
    id: 'g06',
    category: 'gratitude',
 text_5_7: "Draw something you feel thankful for!",
 text_8_10: "Draw something you feel thankful for.",
 text_11_12: "Write a few lines about one blessing - go deeper than the obvious.",
  },
  {
    id: 'g07',
    category: 'gratitude',
 text_5_7: "Say thank you for your home or your favourite food!",
 text_8_10: "Say thank you for your home or your favourite food.",
 text_11_12: "Notice one everyday comfort that would feel like a miracle to someone else.",
  },
  {
    id: 'g08',
    category: 'gratitude',
 text_5_7: "Tell your body thank you - your legs, your hands, your eyes!",
 text_8_10: "Tell your body thank you. Your legs, hands, and bright eyes.",
 text_11_12: "Appreciate one thing your body helped you do today.",
  },
  {
    id: 'g09',
    category: 'gratitude',
 text_5_7: "Find an old thing at home and ask its story!",
 text_8_10: "Find an old object at home and ask its story.",
 text_11_12: "Discover the history behind something meaningful in your house.",
  },
  {
    id: 'g10',
    category: 'gratitude',
 text_5_7: "Smell your favourite smell today and enjoy it slowly!",
 text_8_10: "Smell your favourite scent today and enjoy it slowly.",
 text_11_12: "Notice five different smells today and stay present with each.",
  },
  {
    id: 'g11',
    category: 'gratitude',
 text_5_7: "Tell your teacher 'thank you' tomorrow!",
 text_8_10: "Think of one nice thing about your school or teacher.",
 text_11_12: "Be grateful for a difficult moment that helped you grow.",
  },
  {
    id: 'g12',
    category: 'gratitude',
 text_5_7: "Tell Nana, Dadi, Nani, or Dada you love them today!",
 text_8_10: "Tell an elder in your family you love them.",
 text_11_12: "Thank an elder for a value or story they passed on to you.",
  },
  {
    id: 'g13',
    category: 'gratitude',
 text_5_7: "Notice one tiny happy moment from today!",
 text_8_10: "Notice one tiny happy moment today.",
 text_11_12: "Before sleep, remember three gentle good moments from your day.",
  },
  {
    id: 'g14',
    category: 'gratitude',
 text_5_7: "Find something at home from India and ask what it is!",
 text_8_10: "Find something at home that connects to India and ask about it.",
 text_11_12: "Learn the deeper story behind a cultural object or tradition in your home.",
  },
  {
    id: 'g15',
    category: 'gratitude',
 text_5_7: "When someone is kind to you today, feel happy inside!",
 text_8_10: "Notice when someone is kind to you today.",
 text_11_12: "Count every kindness you receive today - even the small ones.",
  },
  {
    id: 'g16',
    category: 'gratitude',
 text_5_7: "Say thank you to someone who makes your day easier!",
 text_8_10: "Say thank you to someone who makes your day easier.",
 text_11_12: "Thank someone whose work you benefit from but rarely notice.",
  },
  {
    id: 'g17',
    category: 'gratitude',
 text_5_7: "Enjoy something free today - sunshine, breeze, or laughter!",
 text_8_10: "Enjoy something free today - sunshine, breeze, laughter.",
 text_11_12: "List five free gifts life gives you every day.",
  },
  {
    id: 'g18',
    category: 'gratitude',
 text_5_7: "Share a happy memory with someone today!",
 text_8_10: "Share a happy memory with someone.",
 text_11_12: "Remind someone of a joyful memory you both shared.",
  },
  {
    id: 'g19',
    category: 'gratitude',
 text_5_7: "Find something in nature that makes you feel calm.",
 text_8_10: "Notice something in nature that makes you feel calm.",
 text_11_12: "Spend five quiet minutes observing the world around you.",
  },
  {
    id: 'g20',
    category: 'gratitude',
 text_5_7: "Find one thing that was hard today but you did it!",
 text_8_10: "Find one hard thing today that might be teaching you something.",
 text_11_12: "Reflect on a current challenge and one hidden lesson inside it.",
  },
  {
    id: 'g21',
    category: 'gratitude',
 text_5_7: "Laugh again at the funniest thing from today!",
 text_8_10: "Laugh again at the funniest moment from today.",
 text_11_12: "Collect one pure joyful moment today and hold it in your memory.",
  },
  {
    id: 'g22',
    category: 'gratitude',
 text_5_7: "Look at your hands! They helped you do so many things today.",
 text_8_10: "Look at your hands and think about all they helped you do.",
 text_11_12: "Choose one sense today and experience the world deeply through it.",
  },
  {
    id: 'g23',
    category: 'gratitude',
 text_5_7: "Hug something cosy - a blanket, a teddy, or someone you love!",
 text_8_10: "Feel grateful for something cosy - a blanket, a hug, warm food.",
 text_11_12: "Notice comfort in your life and respect its privilege.",
  },
  {
    id: 'g24',
    category: 'gratitude',
 text_5_7: "Tell someone why you love your favourite food!",
 text_8_10: "Tell someone why you love your favourite food.",
 text_11_12: "Help cook or prepare a meal today and appreciate the effort involved.",
  },
  {
    id: 'g25',
    category: 'gratitude',
 text_5_7: "Tell Ganesha one thank-you thought before sleeping!",
 text_8_10: "Tell Ganesha one thank-you thought before sleeping.",
 text_11_12: "Write a private gratitude note - to Ganesha, to life, to the universe.",
  },
  {
    id: 'g26',
    category: 'gratitude',
 text_5_7: "Say thank you to someone who fixed something for you!",
 text_8_10: "Thank someone who fixed or helped something for you.",
 text_11_12: "Revisit a past kindness you never fully appreciated.",
  },
  {
    id: 'g27',
    category: 'gratitude',
 text_5_7: "Listen carefully to your favourite song today!",
 text_8_10: "Listen carefully to music you enjoy today.",
 text_11_12: "Let music move you emotionally without multitasking.",
  },
  {
    id: 'g28',
    category: 'gratitude',
 text_5_7: "Ask why your name was chosen - it's a love story!",
 text_8_10: "Ask why your name was chosen. Names carry love.",
 text_11_12: "Learn the meaning and story behind your name.",
  },
  {
    id: 'g29',
    category: 'gratitude',
 text_5_7: "Look in the mirror and say one nice thing about yourself!",
 text_8_10: "Tell the mirror one nice thing about yourself.",
 text_11_12: "Appreciate three qualities about who you are - beyond appearance.",
  },
  {
    id: 'g30',
    category: 'gratitude',
 text_5_7: "Before sleep say: 'Today was good because...' and finish the sentence!",
 text_8_10: "Before sleep say: 'Today was good because...' and finish the sentence.",
 text_11_12: "Write one meaningful sentence about today and keep it.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 4 — CULTURAL (identity in action)
  // CASEL: Self-Awareness | NRI identity | Wayne Dyer
  // ─────────────────────────────────────────────

  {
    id: 'cu01',
    category: 'cultural',
 text_5_7: "Make a tiny star on Earth! Light a diya with a grown-up tonight.",
 text_8_10: "Tonight make a tiny star on Earth. Light a diya with a grown-up and watch it glow.",
 text_11_12: "Light a diya tonight and sit quietly for one minute. Notice the thoughts that visit you.",
  },
  {
    id: 'cu02',
    category: 'cultural',
 text_5_7: "Learn one Sanskrit word today and say it proudly!",
 text_8_10: "Learn one magical Sanskrit word today and say it proudly.",
 text_11_12: "Use one Sanskrit word from your learning in a real conversation today.",
  },
  {
    id: 'cu03',
    category: 'cultural',
 text_5_7: "Ask Mama or Papa to teach you an Indian song today!",
 text_8_10: "Ask someone at home to teach you an Indian song or lullaby.",
 text_11_12: "Learn one verse of a bhajan, chant, or folk song today.",
  },
  {
    id: 'cu04',
    category: 'cultural',
 text_5_7: "Wear something Indian today and feel super special!",
 text_8_10: "Wear something Indian today - even at home - and feel special.",
 text_11_12: "Wear something Indian confidently outside your home today.",
  },
  {
    id: 'cu05',
    category: 'cultural',
 text_5_7: "Ask Dada, Dadi, Nana, or Nani to tell you a story from when they were little!",
 text_8_10: "Ask a grandparent or elder to tell you a story from their childhood.",
 text_11_12: "Listen deeply to an elder's memory about growing up in India.",
  },
  {
    id: 'cu06',
    category: 'cultural',
 text_5_7: "Find your family's state on a map and try to draw its shape!",
 text_8_10: "Find your family's state on a map and draw its shape.",
 text_11_12: "Learn one food, language, or festival from your family's region.",
  },
  {
    id: 'cu07',
    category: 'cultural',
 text_5_7: "Say 'Jai Ganesha!' before starting something important today.",
 text_8_10: "Say 'Jai Ganesha' before starting something important today.",
 text_11_12: "Begin an important task with an intention, mantra, or quiet focus.",
  },
  {
    id: 'cu08',
    category: 'cultural',
 text_5_7: "Help make an Indian dish with a grown-up today!",
 text_8_10: "Help make an Indian dish with a grown-up today.",
 text_11_12: "Cook or assist in cooking and learn the names of every ingredient.",
  },
  {
    id: 'cu09',
    category: 'cultural',
 text_5_7: "Do a warm namaste to three people today!",
 text_8_10: "Do a warm namaste greeting to three people today.",
 text_11_12: "Use namaste mindfully today and explain its meaning if asked.",
  },
  {
    id: 'cu10',
    category: 'cultural',
 text_5_7: "Look at a Ganesha picture. What is he holding?",
 text_8_10: "Look at a picture of Ganesha and notice what he is holding.",
 text_11_12: "Observe a murti or image of Ganesha and recall the symbols you know.",
  },
  {
    id: 'cu11',
    category: 'cultural',
 text_5_7: "Ask which Indian festival is coming next!",
 text_8_10: "Ask which Indian festival is coming next and learn one fun fact.",
 text_11_12: "Explore the origin story of a Hindu festival you don't know well.",
  },
  {
    id: 'cu12',
    category: 'cultural',
 text_5_7: "Tell a friend a simple story about Ganesha!",
 text_8_10: "Tell a friend one simple story about Ganesha.",
 text_11_12: "Explain who Ganesha is to someone unfamiliar with confidence.",
  },
  {
    id: 'cu13',
    category: 'cultural',
 text_5_7: "Count to ten in Hindi or your family's language!",
 text_8_10: "Count to ten in Hindi or your family's language.",
 text_11_12: "Have a short greeting conversation in your heritage language.",
  },
  {
    id: 'cu14',
    category: 'cultural',
 text_5_7: "Ask what your name means!",
 text_8_10: "Ask what your name means.",
 text_11_12: "Learn the deeper meaning and story behind your name.",
  },
  {
    id: 'cu15',
    category: 'cultural',
 text_5_7: "Find your family's city on a map with help!",
 text_8_10: "Find your family's city on a map with help.",
 text_11_12: "Discover what your family's city or region is known for.",
  },
  {
    id: 'cu16',
    category: 'cultural',
 text_5_7: "Make a simple rangoli with chalk or colours!",
 text_8_10: "Make a simple rangoli with chalk or colours.",
 text_11_12: "Create a rangoli today and learn when it is traditionally used.",
  },
  {
    id: 'cu17',
    category: 'cultural',
 text_5_7: "Try one yoga pose today and breathe slowly!",
 text_8_10: "Try one yoga pose today and breathe slowly.",
 text_11_12: "Practice five minutes of yoga or pranayama mindfully.",
  },
  {
    id: 'cu18',
    category: 'cultural',
 text_5_7: "Say your favourite shloka three times today!",
 text_8_10: "Say your favourite shloka from the app three times.",
 text_11_12: "Practice reciting a full shloka from memory.",
  },
  {
    id: 'cu19',
    category: 'cultural',
 text_5_7: "Find out which flowers people give Ganesha!",
 text_8_10: "Find out which flowers people offer to Ganesha.",
 text_11_12: "Learn the symbolism of one item used in puja.",
  },
  {
    id: 'cu20',
    category: 'cultural',
 text_5_7: "Ask to hear one story from Ramayana or Mahabharata!",
 text_8_10: "Ask to hear one story from Ramayana or Mahabharata.",
 text_11_12: "Be able to retell one epic story in your own words.",
  },
  {
    id: 'cu21',
    category: 'cultural',
 text_5_7: "Find one spice in your kitchen and learn its name!",
 text_8_10: "Find one spice in your kitchen and learn its name.",
 text_11_12: "Trace where one spice comes from and why it is used.",
  },
  {
    id: 'cu22',
    category: 'cultural',
 text_5_7: "Join a short puja or aarti at home today!",
 text_8_10: "Join a short puja or aarti at home today.",
 text_11_12: "Participate fully and mindfully in a family ritual.",
  },
  {
    id: 'cu23',
    category: 'cultural',
 text_5_7: "Draw a happy picture of Ganesha!",
 text_8_10: "Draw a happy picture of Ganesha.",
 text_11_12: "Create an artistic version of Ganesha from memory.",
  },
  {
    id: 'cu24',
    category: 'cultural',
 text_5_7: "Ask Mama or Papa about their favourite tradition from when they were kids!",
 text_8_10: "Ask your parents one tradition they loved as children.",
 text_11_12: "Understand what traditions your family had to leave behind.",
  },
  {
    id: 'cu25',
    category: 'cultural',
 text_5_7: "Tell a friend one cool thing about being Indian!",
 text_8_10: "Think of one thing about being Indian that makes you proud.",
 text_11_12: "Reflect on a time your identity felt challenging - and what you learned.",
  },
  {
    id: 'cu26',
    category: 'cultural',
 text_5_7: "Learn 'I love you' in your family's language!",
 text_8_10: "Learn how to say 'I love you' in your family's language.",
 text_11_12: "Speak a few meaningful sentences in your heritage language today.",
  },
  {
    id: 'cu27',
    category: 'cultural',
 text_5_7: "Find out what prasad means!",
 text_8_10: "Find out what prasad means.",
 text_11_12: "Reflect on the deeper idea of sharing in spiritual traditions.",
  },
  {
    id: 'cu28',
    category: 'cultural',
 text_5_7: "Tell a friend one fun thing about an Indian festival!",
 text_8_10: "Tell someone at school one fun thing about an Indian festival.",
 text_11_12: "Represent your culture naturally in a space you usually stay quiet.",
  },
  {
    id: 'cu29',
    category: 'cultural',
 text_5_7: "Ask your family: What does Ganesha mean to us?",
 text_8_10: "Ask your family what Ganesha means to them.",
 text_11_12: "Have an honest conversation about what faith or spirituality means to you.",
  },
  {
    id: 'cu30',
    category: 'cultural',
 text_5_7: "Your roots are your superpower! Name one thing you love about being Indian.",
 text_8_10: "Remember - your roots are your superpower.",
 text_11_12: "Write a short reflection about what your heritage gives you.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 5 — COURAGE (doing hard things)
  // CASEL: Self-Management + Responsible Decision-Making
  // Ganesha's broken tusk | Sean Covey Habit 1
  // ─────────────────────────────────────────────

  {
    id: 'co01',
    category: 'courage',
 text_5_7: "Try one tiny scary thing today like a brave explorer. Ganesha is right beside you!",
 text_8_10: "Today choose one tiny thing that feels a little scary. Try it like a brave explorer. Ganesha is right beside you.",
 text_11_12: "Do one thing today you've been avoiding because it feels uncomfortable. Growth begins exactly there.",
  },
  {
    id: 'co02',
    category: 'courage',
 text_5_7: "If something feels unfair today, speak kindly but bravely!",
 text_8_10: "If something feels unfair today, speak kindly but bravely.",
 text_11_12: "Stand up for what feels right today - calmly and clearly - even if others stay silent.",
  },
  {
    id: 'co03',
    category: 'courage',
 text_5_7: "Try something new today! New things make courage muscles strong.",
 text_8_10: "Try something new today. New things make your courage muscles strong.",
 text_11_12: "Attempt something you might fail at. Trying is how confidence is built.",
  },
  {
    id: 'co04',
    category: 'courage',
 text_5_7: "Say sorry first if there's a fight. Brave hearts heal faster!",
 text_8_10: "Say sorry first today if there is a fight. Brave hearts heal faster.",
 text_11_12: "Take the first step to fix a misunderstanding. Leadership often begins with humility.",
  },
  {
    id: 'co05',
    category: 'courage',
 text_5_7: "Ask for help when you need it. Even heroes need helpers!",
 text_8_10: "Ask for help when you need it. Even heroes need helpers.",
 text_11_12: "Admit where you need support today. Self-awareness is strength.",
  },
  {
    id: 'co06',
    category: 'courage',
 text_5_7: "Tell the truth today even if your voice feels tiny!",
 text_8_10: "Tell the truth today even if your voice feels tiny.",
 text_11_12: "Choose honesty over comfort in one situation today.",
  },
  {
    id: 'co07',
    category: 'courage',
 text_5_7: "Raise your hand once today - like a little sun rising!",
 text_8_10: "Raise your hand once today like a little sun rising.",
 text_11_12: "Share your thought in a group today even if you feel unsure.",
  },
  {
    id: 'co08',
    category: 'courage',
 text_5_7: "Talk to someone new today! New friends are hidden adventures.",
 text_8_10: "Talk to someone new today. New friends are hidden adventures.",
 text_11_12: "Start a conversation outside your comfort circle.",
  },
  {
    id: 'co09',
    category: 'courage',
 text_5_7: "Help someone who is being left out today!",
 text_8_10: "Help someone who is being left out.",
 text_11_12: "Quietly support fairness when you see exclusion or unkindness. You don't have to be loud to be brave.",
  },
  {
    id: 'co10',
    category: 'courage',
 text_5_7: "Tell someone proudly about something special from being Indian!",
 text_8_10: "Tell someone proudly about something special from your culture.",
 text_11_12: "Own your identity today without shrinking or over-explaining.",
  },
  {
    id: 'co11',
    category: 'courage',
 text_5_7: "If someone says your name wrong, help them say it right!",
 text_8_10: "If someone says your name wrong, help them say it right.",
 text_11_12: "Correct mispronunciation calmly and confidently. Your name deserves respect.",
  },
  {
    id: 'co12',
    category: 'courage',
 text_5_7: "Share your favourite Indian food proudly today!",
 text_8_10: "Share your favourite Indian food proudly today.",
 text_11_12: "Talk about your culture today without apologising for it.",
  },
  {
    id: 'co13',
    category: 'courage',
 text_5_7: "Try the thing you thought you couldn't do!",
 text_8_10: "Try the thing you thought you couldn't do.",
 text_11_12: "Start a small version of something you keep postponing.",
  },
  {
    id: 'co14',
    category: 'courage',
 text_5_7: "Finish one thing you left halfway today!",
 text_8_10: "Finish one thing you left halfway.",
 text_11_12: "Return to an unfinished task and give it focused effort.",
  },
  {
    id: 'co15',
    category: 'courage',
 text_5_7: "Make a mistake and try again with a smile!",
 text_8_10: "Make a mistake today and try again with a smile.",
 text_11_12: "Do something imperfectly on purpose. Notice that nothing breaks.",
  },
  {
    id: 'co16',
    category: 'courage',
 text_5_7: "Show someone something you made today!",
 text_8_10: "Show someone something you made.",
 text_11_12: "Share a creative work you have been hiding.",
  },
  {
    id: 'co17',
    category: 'courage',
 text_5_7: "Say 'I don't know' when you really don't know!",
 text_8_10: "Say 'I don't know' when you really don't know.",
 text_11_12: "Admit uncertainty or being wrong once today.",
  },
  {
    id: 'co18',
    category: 'courage',
 text_5_7: "Do a kind thing even if you don't feel like it today!",
 text_8_10: "Do a kind action even if you don't feel like it.",
 text_11_12: "Act with integrity today when no one is watching.",
  },
  {
    id: 'co19',
    category: 'courage',
 text_5_7: "Face one tiny nervous feeling today!",
 text_8_10: "Face one tiny nervous feeling today.",
 text_11_12: "Name a fear today and take one step toward it.",
  },
  {
    id: 'co20',
    category: 'courage',
 text_5_7: "Share your idea today! Ideas are like little stars.",
 text_8_10: "Share your idea today. Ideas are like little stars.",
 text_11_12: "Voice an idea today that you're unsure will be accepted.",
  },
  {
    id: 'co21',
    category: 'courage',
 text_5_7: "Be your real self today - even if someone giggles!",
 text_8_10: "Be your real self today even if someone giggles.",
 text_11_12: "Drop the performance in one situation today. Choose authenticity.",
  },
  {
    id: 'co22',
    category: 'courage',
 text_5_7: "Do something today without asking if it's perfect!",
 text_8_10: "Do something without asking if it's perfect.",
 text_11_12: "Make one independent decision and trust yourself.",
  },
  {
    id: 'co23',
    category: 'courage',
 text_5_7: "Taste a new food today like a brave explorer!",
 text_8_10: "Taste a new food today like an explorer.",
 text_11_12: "Try something unfamiliar today - food, idea, or experience.",
  },
  {
    id: 'co24',
    category: 'courage',
 text_5_7: "If words hurt you, tell someone kindly today.",
 text_8_10: "Tell someone kindly if their words hurt you.",
 text_11_12: "Set one calm boundary today without guilt.",
  },
  {
    id: 'co25',
    category: 'courage',
 text_5_7: "Change your mind if you learn something better!",
 text_8_10: "Change your mind if you learn something better.",
 text_11_12: "Update your opinion when evidence appears. Flexibility is strength.",
  },
  {
    id: 'co26',
    category: 'courage',
 text_5_7: "Choose the right thing today, even if it's harder!",
 text_8_10: "Choose the harder right thing once today.",
 text_11_12: "Act according to values today, not convenience.",
  },
  {
    id: 'co27',
    category: 'courage',
 text_5_7: "Ganesha kept going even with a broken tusk! Keep going today even when things feel tricky.",
 text_8_10: "Ganesha kept going even with a broken tusk. Keep going even if things feel tricky.",
 text_11_12: "Use what you have today instead of waiting for perfect conditions.",
  },
  {
    id: 'co28',
    category: 'courage',
 text_5_7: "Start something new today! Small beginnings are powerful.",
 text_8_10: "Start something new today. Small beginnings are powerful.",
 text_11_12: "Begin something today before you feel ready.",
  },
  {
    id: 'co29',
    category: 'courage',
 text_5_7: "Practice patience when waiting today!",
 text_8_10: "Practice patience when waiting today.",
 text_11_12: "Stay steady in a frustrating moment instead of reacting fast.",
  },
  {
    id: 'co30',
    category: 'courage',
 text_5_7: "Ask for help from someone small or unexpected today!",
 text_8_10: "Ask for help from someone small or unexpected today.",
 text_11_12: "Find the smallest brave step you can take - and take it.",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Pick the right text variant based on age.
 * 5–7   → text_5_7   (concrete, single-action, simple words)
 * 8–10  → text_8_10  (mission framing, light reflection)
 * 11–12 → text_11_12 (internal growth, identity, no cuteness)
 */
function pickTextForAge(dare, childAge) {
  if (childAge <= 7)  return dare.text_5_7;
  if (childAge <= 10) return dare.text_8_10;
  return dare.text_11_12;
}

/**
 * Get today's dare for a child.
 * Rotates by date across the full bank — no repeats for ~5 months.
 * @param {number} childAge
 * @returns {{ id, category, text }}
 */
export function getTodaysDare(childAge) {
  const dayIndex = Math.floor(Date.now() / 86400000); // days since epoch
  const dare = DARE_BANK[dayIndex % DARE_BANK.length];
  return {
    id: dare.id,
    category: dare.category,
    text: pickTextForAge(dare, childAge),
  };
}

/**
 * Get a dare by category (for unlock flows).
 * @param {string} category
 * @param {number} childAge
 * @returns {{ id, category, text }}
 */
export function getDareByCategory(category, childAge) {
  const pool = DARE_BANK.filter(d => d.category === category);
  const dayIndex = Math.floor(Date.now() / 86400000);
  const dare = pool[dayIndex % pool.length];
  return {
    id: dare.id,
    category: dare.category,
    text: pickTextForAge(dare, childAge),
  };
}

// Unlock map — what each category unlocks in DareAndShare
export const DARE_UNLOCK_MAP = {
  kindness:    { story: 'cat',              label: '🐱 The Cat Story' },
  compassion:  { activity: 'draw',          label: '🌸 Draw with Ganesha' },
  gratitude:   { card: 'ganesha-card',      label: '💌 Ganesha Card' },
  cultural:    { story: 'festival-secret',  label: '🪔 Secret Festival Story' },
  courage:     { badge: 'mooshika',         label: '🏆 Mooshika Badge' },
};
