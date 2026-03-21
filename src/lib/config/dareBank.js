// dareBank.js — Time With Ganesha Daily Dare Bank
// 150 dares × 2 age bands = 300 unique experiences
// ~5 months of daily use before any repeat
//
// Structure:
//   category: 'kindness' | 'compassion' | 'gratitude' | 'cultural' | 'courage'
//   youngText: age 5–8 version
//   olderText: age 9–12 version
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
    youngText: "Tell one person something you love about them today. Maybe Mama, maybe a friend.",
    olderText: "Notice one thing someone does really well — and tell them. Not just 'you're good at that.' Be specific.",
  },
  {
    id: 'k02',
    category: 'kindness',
    youngText: "Make someone laugh today. A funny face, a silly dance — whatever works!",
    olderText: "Make someone smile who hasn't smiled yet today. You'll know who.",
  },
  {
    id: 'k03',
    category: 'kindness',
    youngText: "Help someone carry something heavy today.",
    olderText: "Offer to help before someone has to ask. Watch for the moment.",
  },
  {
    id: 'k04',
    category: 'kindness',
    youngText: "Draw a picture for someone who lives far away. Give it to a grown-up to send.",
    olderText: "Write three sentences to someone you don't talk to enough — a grandparent, an old friend.",
  },
  {
    id: 'k05',
    category: 'kindness',
    youngText: "Share something you really like with someone else today.",
    olderText: "Give something away today — not something you don't want. Something you actually like.",
  },
  {
    id: 'k06',
    category: 'kindness',
    youngText: "Say thank you to someone who helps you every day but you forget to thank.",
    olderText: "Thank someone for something they did a long time ago that you never said thank you for.",
  },
  {
    id: 'k07',
    category: 'kindness',
    youngText: "Let someone else go first today — in line, in a game, anywhere.",
    olderText: "Put someone else first today, even when you really wanted it. Notice how that feels.",
  },
  {
    id: 'k08',
    category: 'kindness',
    youngText: "Hold the door open for someone.",
    olderText: "Do one small thing today to make someone's job easier — a teacher, a cashier, anyone working.",
  },
  {
    id: 'k09',
    category: 'kindness',
    youngText: "Say something kind to someone who looks sad.",
    olderText: "Sit with someone who's alone today. You don't even have to say much. Just be there.",
  },
  {
    id: 'k10',
    category: 'kindness',
    youngText: "Invite someone to play who isn't playing yet.",
    olderText: "Include someone today who's usually left out. Not because anyone told you to — because you chose to.",
  },
  {
    id: 'k11',
    category: 'kindness',
    youngText: "Give someone a big smile when you walk into school or home.",
    olderText: "Be the first to say hello to someone new or quiet today.",
  },
  {
    id: 'k12',
    category: 'kindness',
    youngText: "Tell your sibling or cousin one nice thing about them.",
    olderText: "Say something kind to a sibling even if you're annoyed with them. That's the harder kindness.",
  },
  {
    id: 'k13',
    category: 'kindness',
    youngText: "Give someone a high-five or a hug today.",
    olderText: "Check in on a friend with one message — 'hey, how are you actually doing?'",
  },
  {
    id: 'k14',
    category: 'kindness',
    youngText: "Make something for someone — a card, a drawing, a paper flower.",
    olderText: "Create something for someone who wasn't expecting it. The surprise is part of the gift.",
  },
  {
    id: 'k15',
    category: 'kindness',
    youngText: "Tell a grown-up at home that you appreciate them today.",
    olderText: "Tell a parent or guardian one specific thing they do that makes your life better. Watch their face.",
  },
  {
    id: 'k16',
    category: 'kindness',
    youngText: "Be extra gentle with your words today. No unkind words — not even small ones.",
    olderText: "Watch your words today. Notice every time an unkind thought almost became a word — and stop it.",
  },
  {
    id: 'k17',
    category: 'kindness',
    youngText: "Help set the table or tidy up without being asked.",
    olderText: "Do one chore today that no one asked you to do, for someone else's benefit.",
  },
  {
    id: 'k18',
    category: 'kindness',
    youngText: "Wave at your neighbour today.",
    olderText: "Have a real conversation with an elder today — a grandparent, a neighbour. Ask them something you genuinely want to know.",
  },
  {
    id: 'k19',
    category: 'kindness',
    youngText: "Tell your best friend what you love about being their friend.",
    olderText: "Tell your best friend something you've always meant but never said.",
  },
  {
    id: 'k20',
    category: 'kindness',
    youngText: "Be extra patient with someone today, even if they're slow.",
    olderText: "Slow down to someone's pace today instead of rushing them.",
  },
  {
    id: 'k21',
    category: 'kindness',
    youngText: "Teach someone something you know how to do.",
    olderText: "Teach someone a skill they want to learn. Take your time.",
  },
  {
    id: 'k22',
    category: 'kindness',
    youngText: "Cheer for someone else today — a friend, a sibling, anyone.",
    olderText: "Celebrate someone else's win today as if it were your own.",
  },
  {
    id: 'k23',
    category: 'kindness',
    youngText: "Pick up something someone dropped and give it back.",
    olderText: "Do something kind today where you'll never get credit. Nobody needs to know.",
  },
  {
    id: 'k24',
    category: 'kindness',
    youngText: "Sit next to someone different at lunch or during play.",
    olderText: "Start a conversation today with someone you've never properly talked to.",
  },
  {
    id: 'k25',
    category: 'kindness',
    youngText: "Be extra gentle with a younger child today.",
    olderText: "Be a big-sibling energy today — protect, guide, be patient with someone younger.",
  },
  {
    id: 'k26',
    category: 'kindness',
    youngText: "Give someone your full attention when they're talking. No looking away.",
    olderText: "Really listen to someone today. No thinking about what you'll say next. Just hear them.",
  },
  {
    id: 'k27',
    category: 'kindness',
    youngText: "Say sorry to someone if you've been unkind — even if it was a few days ago.",
    olderText: "Repair something today. An apology, a message, a gesture. Something left unfinished.",
  },
  {
    id: 'k28',
    category: 'kindness',
    youngText: "Do something nice for someone who wasn't kind to you. See how it feels.",
    olderText: "Be kind to someone who hasn't been kind to you — not because they deserve it, but because you do.",
  },
  {
    id: 'k29',
    category: 'kindness',
    youngText: "Help a grown-up with something they're doing today.",
    olderText: "Notice what a grown-up at home is carrying today — not just physically. Ask if you can help.",
  },
  {
    id: 'k30',
    category: 'kindness',
    youngText: "End your day by telling someone you love them.",
    olderText: "Before you sleep, tell one person you're glad they exist. Send it if you can't say it.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 2 — COMPASSION (toward all living things)
  // CASEL: Social Awareness | Ahimsa
  // ─────────────────────────────────────────────

  {
    id: 'c01',
    category: 'compassion',
    youngText: "Water a plant today and tell it something nice.",
    olderText: "Take care of something living today that can't ask you for help — a plant, a pet, an insect outside.",
  },
  {
    id: 'c02',
    category: 'compassion',
    youngText: "If you see an ant or bug today, don't squish it. Move it gently or let it be.",
    olderText: "Go through today without harming a single living thing — even a bug. Notice how many chances you get.",
  },
  {
    id: 'c03',
    category: 'compassion',
    youngText: "Put out a small bowl of water for birds or street animals near your home.",
    olderText: "Do something today for an animal near you that isn't yours — feed them, give water, just watch them.",
  },
  {
    id: 'c04',
    category: 'compassion',
    youngText: "Pick up one piece of litter today and throw it away.",
    olderText: "Pick up litter without anyone seeing you. Three pieces minimum.",
  },
  {
    id: 'c05',
    category: 'compassion',
    youngText: "Touch a tree or plant gently and say thank you to it.",
    olderText: "Spend 5 minutes outside noticing something natural — a tree, a cloud, a bird. Really look.",
  },
  {
    id: 'c06',
    category: 'compassion',
    youngText: "If your family has a pet, give it extra love today.",
    olderText: "Spend time with a pet today that's truly about what they need — not what you want from them.",
  },
  {
    id: 'c07',
    category: 'compassion',
    youngText: "Don't waste food today. Eat everything on your plate.",
    olderText: "Think about where your food came from — the hands that grew it, picked it, cooked it. Say a quiet thank you.",
  },
  {
    id: 'c08',
    category: 'compassion',
    youngText: "Turn off a light or tap that was left on.",
    olderText: "Do one thing today to use less — less water, less electricity, less waste.",
  },
  {
    id: 'c09',
    category: 'compassion',
    youngText: "Be gentle with the earth today — don't pull leaves off trees, don't break branches.",
    olderText: "Do one thing today that gives back to nature. Plant something, clear litter, water something wild.",
  },
  {
    id: 'c10',
    category: 'compassion',
    youngText: "Notice a bird today. Watch where it goes.",
    olderText: "Sit outside for 10 minutes and just observe — don't do anything. Watch what lives around you.",
  },
  {
    id: 'c11',
    category: 'compassion',
    youngText: "If it's raining, notice the worms that come out. Don't step on them.",
    olderText: "Think of one creature most people ignore or dislike. Find something worth respecting about it.",
  },
  {
    id: 'c12',
    category: 'compassion',
    youngText: "Ask a grown-up what your area was like before buildings — were there trees? Animals?",
    olderText: "Find out about one endangered animal today. Know its name and why it's disappearing.",
  },
  {
    id: 'c13',
    category: 'compassion',
    youngText: "Use both sides of a piece of paper before throwing it away.",
    olderText: "Make one swap today — something you'd normally throw away, reuse it.",
  },
  {
    id: 'c14',
    category: 'compassion',
    youngText: "Say sorry to a plant you forgot to water this week.",
    olderText: "Take responsibility for something living that you've been neglecting.",
  },
  {
    id: 'c15',
    category: 'compassion',
    youngText: "Draw an animal you love and put it somewhere you can see it.",
    olderText: "Write three things you genuinely admire about a wild animal — not a pet.",
  },
  {
    id: 'c16',
    category: 'compassion',
    youngText: "Don't pour anything dirty into a drain today.",
    olderText: "Think about water today — where it comes from before your tap, where it goes after your drain.",
  },
  {
    id: 'c17',
    category: 'compassion',
    youngText: "Look at the sky today and find one cloud that looks like an animal.",
    olderText: "Notice the weather today — really notice it. What does the sky look like? What can you smell?",
  },
  {
    id: 'c18',
    category: 'compassion',
    youngText: "Feed birds or squirrels if you can — just a few safe crumbs.",
    olderText: "Find out what birds or animals are native to where you live. Name three.",
  },
  {
    id: 'c19',
    category: 'compassion',
    youngText: "Hug a tree today. No, really. Do it.",
    olderText: "Stand near a tree and think about how old it might be, what it has seen.",
  },
  {
    id: 'c20',
    category: 'compassion',
    youngText: "Be quiet for one minute and just listen to the sounds around you.",
    olderText: "Go somewhere quiet and listen. No music, no phone. Just the world.",
  },
  {
    id: 'c21',
    category: 'compassion',
    youngText: "Tell a grown-up about one animal that needs protection.",
    olderText: "Share something you learned about nature or animals today with one person.",
  },
  {
    id: 'c22',
    category: 'compassion',
    youngText: "Look for something beautiful outside — a flower, a leaf, a spider web.",
    olderText: "Find beauty in something most people walk past. Photograph it or just remember it.",
  },
  {
    id: 'c23',
    category: 'compassion',
    youngText: "Don't use more water than you need when washing hands or brushing teeth.",
    olderText: "Roughly calculate how much water you use in a day. Find one thing you could reduce.",
  },
  {
    id: 'c24',
    category: 'compassion',
    youngText: "If you see an animal that's hurt, tell a grown-up immediately.",
    olderText: "Know what to do if you find an injured animal. Ask a grown-up or look it up.",
  },
  {
    id: 'c25',
    category: 'compassion',
    youngText: "Plant a seed today if you have one. Or ask to.",
    olderText: "Start something growing today — even in a cup, even a bean.",
  },
  {
    id: 'c26',
    category: 'compassion',
    youngText: "Be kind to every living thing today — even the tiny ones easy to forget.",
    olderText: "Treat every living thing today — insect, plant, animal, person — as if it matters. Because it does.",
  },
  {
    id: 'c27',
    category: 'compassion',
    youngText: "Ask your parent or grandparent about an animal from India they remember.",
    olderText: "Find out about an animal sacred in Hindu tradition — peacock, cow, elephant, snake. Pick one and learn why.",
  },
  {
    id: 'c28',
    category: 'compassion',
    youngText: "Ganesha's vehicle is a mouse. Today, notice something tiny doing something amazing.",
    olderText: "Ganesha chose the smallest animal as his vehicle. Find the power in something small today.",
  },
  {
    id: 'c29',
    category: 'compassion',
    youngText: "Don't kill a mosquito today if you can help it — just move it outside.",
    olderText: "Ahimsa means not harming. Go through today noticing every moment you could harm something — and don't.",
  },
  {
    id: 'c30',
    category: 'compassion',
    youngText: "Do one thing today that helps the earth, not just yourself.",
    olderText: "Make one decision today based on what's good for the earth, not just what's convenient for you.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 3 — GRATITUDE (noticing beauty)
  // CASEL: Self-Awareness | Louise Hay
  // ─────────────────────────────────────────────

  {
    id: 'g01',
    category: 'gratitude',
    youngText: "Find the most beautiful thing in your house and tell someone about it.",
    olderText: "Find something beautiful in a place you normally rush past. Stand there for a moment.",
  },
  {
    id: 'g02',
    category: 'gratitude',
    youngText: "Tell three people what you love about them today.",
    olderText: "Write down three people you're grateful for and one specific reason for each.",
  },
  {
    id: 'g03',
    category: 'gratitude',
    youngText: "Notice something yummy you ate and say thank you before eating it.",
    olderText: "Eat one meal slowly today and notice every flavour. Think about everyone who made it possible.",
  },
  {
    id: 'g04',
    category: 'gratitude',
    youngText: "Look at the sky and say thank you for the day.",
    olderText: "Start the day with one thought of gratitude before you reach for your phone.",
  },
  {
    id: 'g05',
    category: 'gratitude',
    youngText: "Find something beautiful outside — a flower, a cloud, a bird — and show someone.",
    olderText: "Find something beautiful that no one else has noticed today. Point it out to one person.",
  },
  {
    id: 'g06',
    category: 'gratitude',
    youngText: "Draw something you're grateful for today.",
    olderText: "Write about one thing you're grateful for — but go deeper. Not 'my family.' What specifically?",
  },
  {
    id: 'g07',
    category: 'gratitude',
    youngText: "Say thank you for something you usually take for granted — like your home or your food.",
    olderText: "Name one thing that would feel like a miracle to someone else but you barely notice.",
  },
  {
    id: 'g08',
    category: 'gratitude',
    youngText: "Tell your body thank you today — your legs for running, your eyes for seeing.",
    olderText: "Notice something your body did today that you never thanked it for.",
  },
  {
    id: 'g09',
    category: 'gratitude',
    youngText: "Find something old in your home and ask the story behind it.",
    olderText: "Find an object at home with a story — inherited, from India, something old. Ask about it.",
  },
  {
    id: 'g10',
    category: 'gratitude',
    youngText: "Notice your favourite smell today. Really stop and smell it.",
    olderText: "Notice five things today only through smell. Describe each one.",
  },
  {
    id: 'g11',
    category: 'gratitude',
    youngText: "Think of one thing about your school or teacher you're grateful for.",
    olderText: "Think of something difficult that happened to you that made you stronger. Be grateful for the lesson.",
  },
  {
    id: 'g12',
    category: 'gratitude',
    youngText: "Tell a grandparent or older family member you love them today.",
    olderText: "Tell an elder one specific thing they gave you — a story, a skill, a value — that you carry.",
  },
  {
    id: 'g13',
    category: 'gratitude',
    youngText: "Notice something small that made you happy today — even a tiny thing.",
    olderText: "Before you sleep, write the three best moments of today. Not the biggest — the best.",
  },
  {
    id: 'g14',
    category: 'gratitude',
    youngText: "Find something at home that came from India and ask what it is.",
    olderText: "Find something at home that connects you to India — an object, a recipe, a tradition. Learn its story.",
  },
  {
    id: 'g15',
    category: 'gratitude',
    youngText: "Notice when someone is kind to you today and feel it properly.",
    olderText: "Count every act of kindness you receive today — big and small. Count them at the end of the day.",
  },
  {
    id: 'g16',
    category: 'gratitude',
    youngText: "Say thank you to someone who makes your life easier but you forgot to thank.",
    olderText: "Thank someone whose work you benefit from but rarely see — a cleaner, a driver, someone behind the scenes.",
  },
  {
    id: 'g17',
    category: 'gratitude',
    youngText: "Find something free that makes you happy — sunshine, music, laughter.",
    olderText: "List five things that cost nothing that make your life better.",
  },
  {
    id: 'g18',
    category: 'gratitude',
    youngText: "Think of your favourite memory and share it with someone.",
    olderText: "Tell someone a happy memory involving them that they might have forgotten.",
  },
  {
    id: 'g19',
    category: 'gratitude',
    youngText: "Notice something in nature that makes you feel peaceful.",
    olderText: "Spend 5 minutes in silence noticing what's around you. Write or draw what you found.",
  },
  {
    id: 'g20',
    category: 'gratitude',
    youngText: "Be grateful for something hard today — maybe it's teaching you something.",
    olderText: "Find one difficult thing happening in your life right now and write one way it might be helping you.",
  },
  {
    id: 'g21',
    category: 'gratitude',
    youngText: "Find the funniest thing that happened today and laugh about it again.",
    olderText: "Collect one moment of joy today — really hold it. Remember it before you sleep.",
  },
  {
    id: 'g22',
    category: 'gratitude',
    youngText: "Notice your hands today — everything they helped you do.",
    olderText: "Pick one sense — sight, hearing, taste, smell, touch — and spend 10 minutes really using it.",
  },
  {
    id: 'g23',
    category: 'gratitude',
    youngText: "Find the softest, cosiest thing near you and feel grateful for comfort.",
    olderText: "Notice your comfort today — warmth, food, safety — and know not everyone has it. Hold that gratitude carefully.",
  },
  {
    id: 'g24',
    category: 'gratitude',
    youngText: "Think of your favourite food and tell someone why you love it.",
    olderText: "Cook or help cook something today. Notice how much goes into feeding one person.",
  },
  {
    id: 'g25',
    category: 'gratitude',
    youngText: "Tell Ganesha one thing you're grateful for today.",
    olderText: "Write a gratitude letter to Ganesha — or to the universe. No one has to read it.",
  },
  {
    id: 'g26',
    category: 'gratitude',
    youngText: "Find something broken that someone fixed for you. Say thank you.",
    olderText: "Think of a time someone helped you that you never fully appreciated. Is it too late to thank them?",
  },
  {
    id: 'g27',
    category: 'gratitude',
    youngText: "Notice music you like today and really listen to it — not as background noise.",
    olderText: "Listen to music today that makes you feel something. Just listen. Don't multitask.",
  },
  {
    id: 'g28',
    category: 'gratitude',
    youngText: "Be grateful for your name today. Ask your parents why they chose it.",
    olderText: "Learn the meaning of your name if you don't know it. Know why you were given it.",
  },
  {
    id: 'g29',
    category: 'gratitude',
    youngText: "Find something beautiful about yourself today and tell the mirror.",
    olderText: "Stand in front of a mirror and name three things you genuinely like about yourself. Not looks — you.",
  },
  {
    id: 'g30',
    category: 'gratitude',
    youngText: "End today by saying: 'Today was good because...' Finish the sentence.",
    olderText: "Write one sentence that captures something worth remembering. Date it. Keep it.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 4 — CULTURAL (identity in action)
  // CASEL: Self-Awareness | NRI identity | Wayne Dyer
  // ─────────────────────────────────────────────

  {
    id: 'cu01',
    category: 'cultural',
    youngText: "Light a diya with a grown-up tonight.",
    olderText: "Light a diya tonight and sit quietly with it for one minute. Notice what you think about.",
  },
  {
    id: 'cu02',
    category: 'cultural',
    youngText: "Learn to say one Sanskrit word and use it in a sentence today.",
    olderText: "Use one Sanskrit word from the app in a real conversation today. Explain it if they ask.",
  },
  {
    id: 'cu03',
    category: 'cultural',
    youngText: "Ask your parent to teach you one Indian song they know.",
    olderText: "Learn a bhajan, folk song, or lullaby from your family. Know at least one verse by tonight.",
  },
  {
    id: 'cu04',
    category: 'cultural',
    youngText: "Wear something Indian today — a bindi, a dupatta, a kurta — even at home.",
    olderText: "Wear something Indian today outside. Own it when someone notices.",
  },
  {
    id: 'cu05',
    category: 'cultural',
    youngText: "Ask a grandparent or parent to tell you a story from when they were little.",
    olderText: "Ask an elder to tell you something about their childhood in India. Record it if you can.",
  },
  {
    id: 'cu06',
    category: 'cultural',
    youngText: "Find out what state in India your family is from and draw its shape.",
    olderText: "Know your family's home state. Know one thing about its food, its language, and its festival.",
  },
  {
    id: 'cu07',
    category: 'cultural',
    youngText: "Say Jai Ganesha to start something important today.",
    olderText: "Begin something important today with an intention — a shloka, a prayer, a thought. Your choice.",
  },
  {
    id: 'cu08',
    category: 'cultural',
    youngText: "Help make an Indian recipe with a grown-up today.",
    olderText: "Cook an Indian dish today — or help cook one. Know the name of every ingredient.",
  },
  {
    id: 'cu09',
    category: 'cultural',
    youngText: "Put your hands together and do a namaste to three people today.",
    olderText: "Use namaste today and explain to someone who asks. 'The light in me bows to the light in you.'",
  },
  {
    id: 'cu10',
    category: 'cultural',
    youngText: "Find a picture of Ganesha in your home and notice everything he's holding.",
    olderText: "Look at a murti or image of Ganesha and name every symbol without looking at the app first.",
  },
  {
    id: 'cu11',
    category: 'cultural',
    youngText: "Ask what festival is coming next and find out one new thing about it.",
    olderText: "Research one Hindu festival you don't know well. Find its origin story and one regional variation.",
  },
  {
    id: 'cu12',
    category: 'cultural',
    youngText: "Tell someone outside your family about Ganesha today.",
    olderText: "Explain who Ganesha is to someone who doesn't know — in your own words, confidently.",
  },
  {
    id: 'cu13',
    category: 'cultural',
    youngText: "Learn to count to ten in Hindi or your family's language.",
    olderText: "Have a short conversation in Hindi or your family's language — even just greetings. One full exchange.",
  },
  {
    id: 'cu14',
    category: 'cultural',
    youngText: "Find out what your name means in Sanskrit or Hindi.",
    olderText: "Know the etymology of your name. Share it with someone today — your name has a story.",
  },
  {
    id: 'cu15',
    category: 'cultural',
    youngText: "Ask a parent to show you India on a map and find your family's city.",
    olderText: "Find your family's city on a map. Know what it's famous for — food, history, architecture, culture.",
  },
  {
    id: 'cu16',
    category: 'cultural',
    youngText: "Make a rangoli today — even a simple one with chalk or paper.",
    olderText: "Make a rangoli today. Know what occasion it would traditionally be made for.",
  },
  {
    id: 'cu17',
    category: 'cultural',
    youngText: "Learn one yoga pose today and hold it for 10 breaths.",
    olderText: "Do 5 minutes of yoga or pranayama today. Know the Sanskrit name of at least one pose.",
  },
  {
    id: 'cu18',
    category: 'cultural',
    youngText: "Say your shloka from the app out loud three times today.",
    olderText: "Say the full Vakratunda shloka from memory today. If you can't — practice until you can.",
  },
  {
    id: 'cu19',
    category: 'cultural',
    youngText: "Find out what flower is used to worship Ganesha.",
    olderText: "Learn about one flower or material used in puja and why it's significant.",
  },
  {
    id: 'cu20',
    category: 'cultural',
    youngText: "Ask about one story from the Mahabharata or Ramayana.",
    olderText: "Know one story from the Mahabharata and one from the Ramayana. Be able to tell each in 5 sentences.",
  },
  {
    id: 'cu21',
    category: 'cultural',
    youngText: "Find something in your kitchen that came from India's food traditions.",
    olderText: "Trace the origin of one spice in your kitchen. Know where it comes from and why it's used.",
  },
  {
    id: 'cu22',
    category: 'cultural',
    youngText: "Do a puja or aarti with a grown-up today, even a short one.",
    olderText: "Participate in puja today — not just watching. Be present for it.",
  },
  {
    id: 'cu23',
    category: 'cultural',
    youngText: "Draw Ganesha today — even a simple cartoon version.",
    olderText: "Draw or paint Ganesha today. Notice which features you remember and which you had to look up.",
  },
  {
    id: 'cu24',
    category: 'cultural',
    youngText: "Ask your parent about one Indian tradition they grew up with that they miss.",
    olderText: "Ask your parents what traditions they had to leave behind when they moved countries. Listen fully.",
  },
  {
    id: 'cu25',
    category: 'cultural',
    youngText: "Find one brave thing about being Indian in a country that isn't India.",
    olderText: "Think about one time your culture made you feel different in a hard way. What would you tell that younger you?",
  },
  {
    id: 'cu26',
    category: 'cultural',
    youngText: "Learn to say 'I love you' in Hindi or your family's language.",
    olderText: "Have a conversation with a family member in your family's Indian language today — even if it's messy.",
  },
  {
    id: 'cu27',
    category: 'cultural',
    youngText: "Find out what Prasad is and why it's given after puja.",
    olderText: "Think about the ritual of sharing in Hindu tradition — prasad, langar, communal eating. What does it mean?",
  },
  {
    id: 'cu28',
    category: 'cultural',
    youngText: "Tell someone at school one thing about Diwali, Holi, or Ganesh Chaturthi.",
    olderText: "Represent your culture today somewhere you normally don't. Don't shrink. Don't over-explain. Just be it.",
  },
  {
    id: 'cu29',
    category: 'cultural',
    youngText: "Ask your family: what does Ganesha mean to us?",
    olderText: "Have a real conversation with your family about faith — not beliefs forced on you, but what you actually feel.",
  },
  {
    id: 'cu30',
    category: 'cultural',
    youngText: "Remember: your roots are your superpower. Name one thing about your culture that makes you proud.",
    olderText: "Write one paragraph about what your heritage means to you. No one has to read it. It's for you.",
  },

  // ─────────────────────────────────────────────
  // CATEGORY 5 — COURAGE (doing hard things)
  // CASEL: Self-Management + Responsible Decision-Making
  // Ganesha's broken tusk | Sean Covey Habit 1
  // ─────────────────────────────────────────────

  {
    id: 'co01',
    category: 'courage',
    youngText: "Do something today that feels a little scary — ask a question in class, try a new food.",
    olderText: "Do one thing today you've been putting off because it feels hard.",
  },
  {
    id: 'co02',
    category: 'courage',
    youngText: "Tell someone when something isn't fair — politely and kindly.",
    olderText: "Speak up for something you believe in today, even if you're the only one saying it.",
  },
  {
    id: 'co03',
    category: 'courage',
    youngText: "Try something new that you've been afraid to try.",
    olderText: "Attempt something you've been avoiding because you're afraid of failing.",
  },
  {
    id: 'co04',
    category: 'courage',
    youngText: "Say sorry first, even if it feels hard.",
    olderText: "Be the first to apologise today. Don't wait for the other person.",
  },
  {
    id: 'co05',
    category: 'courage',
    youngText: "Ask for help when you need it today — that's brave, not weak.",
    olderText: "Ask for help with something you've been trying to handle alone.",
  },
  {
    id: 'co06',
    category: 'courage',
    youngText: "Tell the truth today even if it's uncomfortable.",
    olderText: "Have an honest conversation about something you've been avoiding.",
  },
  {
    id: 'co07',
    category: 'courage',
    youngText: "Raise your hand in class even if you're not 100% sure of the answer.",
    olderText: "Contribute something in a group today — a class, a meeting, a family discussion — even if your voice shakes.",
  },
  {
    id: 'co08',
    category: 'courage',
    youngText: "Talk to someone you don't normally talk to.",
    olderText: "Start a conversation today with someone outside your usual group.",
  },
  {
    id: 'co09',
    category: 'courage',
    youngText: "Stand up for someone who's being left out or treated unkindly.",
    olderText: "Intervene today — even quietly — when you see something unfair. You don't have to be loud to be brave.",
  },
  {
    id: 'co10',
    category: 'courage',
    youngText: "Tell someone about your Indian heritage proudly today — a friend, a teacher, anyone.",
    olderText: "Own your identity today in a space where you usually hide it. Don't shrink.",
  },
  {
    id: 'co11',
    category: 'courage',
    youngText: "If someone mispronounces your name, correct them gently today.",
    olderText: "Correct someone who mispronounces your name or a word from your culture. Once, clearly, kindly.",
  },
  {
    id: 'co12',
    category: 'courage',
    youngText: "Bring Indian food somewhere outside home — and be proud of it.",
    olderText: "Talk about Indian food today without apologising for the smell or the unfamiliarity.",
  },
  {
    id: 'co13',
    category: 'courage',
    youngText: "Try the thing you said you couldn't do.",
    olderText: "What's one small version of the thing you've been saying you can't do? Start it today.",
  },
  {
    id: 'co14',
    category: 'courage',
    youngText: "Finish something you started and gave up on.",
    olderText: "Return to something you abandoned. Pick it back up — even for 10 minutes.",
  },
  {
    id: 'co15',
    category: 'courage',
    youngText: "Make a mistake today and don't give up. Just try again like Ganesha.",
    olderText: "Do something imperfectly today — on purpose. Notice that you survived it.",
  },
  {
    id: 'co16',
    category: 'courage',
    youngText: "Share something you made — a drawing, a story, a song — with someone.",
    olderText: "Share something creative you've been keeping private because you weren't sure it was good enough.",
  },
  {
    id: 'co17',
    category: 'courage',
    youngText: "Say 'I don't know' when you don't know — that's honest and brave.",
    olderText: "Admit uncertainty today — 'I don't know' or 'I was wrong.' See what happens.",
  },
  {
    id: 'co18',
    category: 'courage',
    youngText: "Do something kind even when you don't feel like it.",
    olderText: "Act with integrity today when it would be easier not to — when no one would know if you didn't.",
  },
  {
    id: 'co19',
    category: 'courage',
    youngText: "Face something today that makes you nervous. Even a tiny version of it.",
    olderText: "Name your fear. Write it down. Do one small thing that points toward it.",
  },
  {
    id: 'co20',
    category: 'courage',
    youngText: "Speak up when you have an idea — your ideas matter.",
    olderText: "Share an idea today that you're afraid won't land. Say it anyway.",
  },
  {
    id: 'co21',
    category: 'courage',
    youngText: "Be yourself today even if you think someone might laugh.",
    olderText: "Be fully yourself today in one situation where you'd normally perform a version of yourself.",
  },
  {
    id: 'co22',
    category: 'courage',
    youngText: "Do something without asking if you're doing it right — trust yourself.",
    olderText: "Make a decision today without seeking approval. Trust your own judgment.",
  },
  {
    id: 'co23',
    category: 'courage',
    youngText: "Try a food you've never tried before.",
    olderText: "Try something genuinely unfamiliar today — a food, a conversation, a point of view.",
  },
  {
    id: 'co24',
    category: 'courage',
    youngText: "Tell someone when their words hurt you — calmly and kindly.",
    olderText: "Set a boundary today. Calmly, without apology, say what is and isn't okay.",
  },
  {
    id: 'co25',
    category: 'courage',
    youngText: "Be brave enough to change your mind if someone shows you something better.",
    olderText: "Change your position on something today if the evidence is there. That's strength, not weakness.",
  },
  {
    id: 'co26',
    category: 'courage',
    youngText: "Do the right thing today even when it's harder than the easy thing.",
    olderText: "Make the harder right choice instead of the easier wrong one.",
  },
  {
    id: 'co27',
    category: 'courage',
    youngText: "Ganesha broke his tusk to keep going. What can you keep going with today?",
    olderText: "Ganesha didn't stop to find a new pen — he used what he had. What's the tusk you can break today?",
  },
  {
    id: 'co28',
    category: 'courage',
    youngText: "Start something new today. Don't wait until it feels perfect.",
    olderText: "Begin something you've been waiting to feel ready for. You won't feel ready. Start anyway.",
  },
  {
    id: 'co29',
    category: 'courage',
    youngText: "Be patient when something is taking a long time. That's a kind of bravery too.",
    olderText: "Practice patience today with something testing it. Stillness is courage too.",
  },
  {
    id: 'co30',
    category: 'courage',
    youngText: "Remember: Ganesha rides a mouse. Even the greatest ask for help from small things. Ask for help today.",
    olderText: "Ganesha's vehicle is the smallest animal. Courage isn't about being the biggest. What's the smallest, bravest thing you can do today?",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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
    text: childAge >= 9 ? dare.olderText : dare.youngText,
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
    text: childAge >= 9 ? dare.olderText : dare.youngText,
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
