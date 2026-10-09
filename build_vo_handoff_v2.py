# -*- coding: utf-8 -*-
# VO Artist Handoff v2 (2026-10-07).
# Every line below was re-read from the live source on 2026-10-07 (not copied from the
# older build_vo_artist_handoff.py, which had drifted). Source of truth per scene is noted
# in SOURCES at the bottom of the document.
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

OUTPUT = "VO_Artist_Handoff_2026-10-07.docx"
FONT = "Arial"
PURPLE = "5B2B7A"
ZONE_COLORS = {"APP": "5B2B7A", "SM": "E64A19", "SR": "2E7D32", "AH": "6D4C41"}

# ───────────────────────── 1. WORDS ─────────────────────────
SHLOKA_WORDS = [
    # word, devanagari, say it as, syllable clips, meaning in the app
    ("Vakratunda", "वक्रतुण्ड", "va-kra-tun-da", "va · kra · tun · da", "curved trunk — try another way"),
    ("Mahakaya", "महाकाय", "ma-ha-kaa-ya", "ma · ha · ka · ya", "great, mighty form — make space for others"),
    ("Suryakoti", "सूर्यकोटि", "sur-ya-ko-ti", "sur · ya · ko · ti", "bright as millions of suns"),
    ("Samaprabha", "समप्रभ", "sa-ma-pra-bha", "sa · ma · pra · bha", "steady, equal brightness — see what is really there"),
    ("Nirvighnam", "निर्विघ्नम्", "nir-vigh-nam", "nir · vigh · nam", "without obstacles — clear the way"),
    ("Kuru Me Deva", "कुरु मे देव", "ku-ru me de-va", "ku-ru · me · de · va", "please do it for me, O Lord — ask for help"),
    ("Sarva Karyeshu", "सर्वकार्येषु", "sar-va kar-rye-shu", "sar · va · kar · rye · shu", "in everything we do"),
    ("Sarvada", "सर्वदा", "sar-va-da", "sar · va · da", "always"),
]
OTHER_WORDS = [
    # word, devanagari, say it as, meaning in English, where it appears
    ("Ganesha", "गणेश", "Ga-NE-sha", "the elephant-headed friend and remover of obstacles", "Everywhere"),
    ("Shiva Ji", "शिव जी", "SHI-va Ji", "Ganesha’s father (“Ji” is a respectful ending)", "Intro story, Family Tree"),
    ("Parvati / Parvati Mata", "पार्वती / पार्वती माता", "Par-VA-ti MA-ta", "Ganesha’s mother (“Mata” means mother)", "Intro story, Family Tree"),
    ("Kartikeya", "कार्तिकेय", "Kar-ti-KAY-ya", "Ganesha’s brother, who rides a peacock", "Family Tree"),
    ("Mooshika", "मूषिक", "MOO-shi-ka", "mouse — Ganesha’s tiny friend", "Modak scene, Family Tree, Favourite Things"),
    ("Modak", "मोदक", "MO-dak", "Ganesha’s favourite sweet dumpling", "Modak scene, Favourite Things"),
    ("Lambodara", "लम्बोदर", "Lam-BO-da-ra", "“the one with a big belly” — a name of Ganesha", "Map lines (Lambodara Lodge)"),
    ("Ganesh Chaturthi", "गणेश चतुर्थी", "Ga-NESH Cha-TUR-thi", "the festival celebrating Ganesha’s birthday", "My Indian Story"),
    ("Sanskrit", "संस्कृत", "SAN-skrit", "the ancient language of shlokas and mantras", "My Indian Story"),
    ("Shloka", "श्लोक", "SHLO-ka", "a verse of sacred poetry", "Several lines"),
    ("Mantra", "मन्त्र", "MAN-tra", "a sacred word or phrase we chant", "Several lines"),
]


# word, devanagari, say it as, meaning in English
WORD_GROUPS = [
    ("Names", [
        ("Ganesha", "गणेश", "Ga-NE-sha", "the elephant-headed friend and remover of obstacles"),
        ("Shiva Ji", "शिव जी", "SHI-va Ji", "Ganesha’s father (“Ji” is a respectful ending)"),
        ("Parvati Mata", "पार्वती माता", "Par-VA-ti MA-ta", "Ganesha’s mother (“Mata” means mother)"),
        ("Kartikeya", "कार्तिकेय", "Kar-ti-KAY-ya", "Ganesha’s brother, who rides a peacock"),
        ("Mooshika", "मूषिक", "MOO-shi-ka", "mouse — Ganesha’s tiny friend"),
        ("Lambodara", "लम्बोदर", "Lam-BO-da-ra", "“the one with a big belly” — a name of Ganesha"),
    ]),
    ("Ganesha’s home — places on the map", [
        ("North India", "उत्तर भारत", "UT-tar BHAA-rat", "northern India"),
        ("West India", "पश्चिम भारत", "PASH-chim BHAA-rat", "western India"),
        ("Central India", "मध्य भारत", "MAD-hya BHAA-rat", "central India"),
        ("East India", "पूर्व भारत", "POOR-va BHAA-rat", "eastern India"),
        ("Northeast India", "पूर्वोत्तर भारत", "poor-VOT-tar BHAA-rat", "north-eastern India"),
        ("South India", "दक्षिण भारत", "DAK-shin BHAA-rat", "southern India"),
        ("Mount Kailash", "कैलाश पर्वत", "KAI-laash PAR-vat", "the mountain where Shiva and Parvati live"),
        ("Outside India", "भारत के बाहर", "BHAA-rat ke BAA-har", "anywhere outside India"),
    ]),
    ("Ganesha’s home — the three places to find", [
        ("Varanasi", "वाराणसी", "vaa-RAA-na-see", "the ancient holy city on the river Ganga, in North India"),
        ("Mumbai", "मुंबई", "MUM-bai", "the big coastal city in West India"),
        ("Tamil Nadu", "तमिलनाडु", "TA-mil NAA-du", "the state in South India"),
    ]),
    ("Languages", [
        ("Hindi", "हिंदी", "HIN-dee", "widely spoken across North India"),
        ("Tamil", "तमिल", "TA-mil", "spoken in Tamil Nadu"),
        ("Telugu", "तेलुगु", "TE-lu-gu", "spoken in Andhra Pradesh and Telangana"),
        ("Marathi", "मराठी", "ma-RAA-thi", "spoken in Maharashtra"),
        ("Gujarati", "गुजराती", "gu-ja-RAA-ti", "spoken in Gujarat"),
        ("Bengali", "बंगाली", "ban-GAA-li", "spoken in West Bengal"),
        ("Kannada", "कन्नड़", "KAN-na-da", "spoken in Karnataka"),
        ("Malayalam", "मलयालम", "ma-la-YAA-lam", "spoken in Kerala"),
        ("Punjabi", "पंजाबी", "pun-JAA-bee", "spoken in Punjab"),
        ("Sanskrit", "संस्कृत", "SAN-skrit", "the ancient language of shlokas and mantras"),
    ]),
    ("Festivals", [
        ("Pongal", "पोंगल", "PON-gal", "harvest festival of South India"),
        ("Holi", "होली", "HO-li", "the festival of colours"),
        ("Janmashtami", "जन्माष्टमी", "Jan-MASH-ta-mi", "Krishna’s birthday"),
        ("Ganesh Chaturthi", "गणेश चतुर्थी", "Ga-NESH Cha-TUR-thi", "the festival celebrating Ganesha’s birthday"),
        ("Durga Puja", "दुर्गा पूजा", "DUR-gaa POO-jaa", "worship of the goddess Durga"),
        ("Diwali", "दीवाली", "Dee-WAA-li", "the festival of lights"),
        ("Navratri", "नवरात्रि", "NAV-raa-tri", "nine nights of dance and worship"),
        ("Onam", "ओणम", "O-nam", "harvest festival of Kerala"),
        ("Eid", "ईद", "Eed", "festival at the end of Ramadan"),
        ("Christmas", "क्रिसमस", "KRIS-mas", "celebration of Christmas"),
        ("Dussehra", "दशहरा", "Da-SEH-raa", "the day good wins over evil"),
        ("Raksha Bandhan", "रक्षा बंधन", "RAK-shaa BAN-dhan", "the festival of the brother–sister bond"),
    ]),
    ("Favourite food", [
        ("Modak", "मोदक", "MO-dak", "Ganesha’s favourite sweet dumpling"),
        ("Ladoo", "लड्डू", "LAD-doo", "a round sweet"),
        ("Barfi", "बर्फी", "BAR-fee", "a sweet made from milk"),
        ("Dosa", "डोसा", "DO-saa", "a thin, crispy South Indian pancake"),
        ("Rice", "चावल", "CHAA-wal", "rice (“chawal” in Hindi)"),
    ]),
    ("Other words", [
        ("Shloka", "श्लोक", "SHLO-ka", "a verse of sacred poetry"),
        ("Mantra", "मन्त्र", "MAN-tra", "a sacred word or phrase we chant"),
    ]),
]

# ───────────────────────── 2. SCENES ─────────────────────────
# (when, line, note)  — note is optional. Notes: DYN = child name / dynamic part, MP3 = existing recording.
def S(code, zone, title, does, sections):
    return dict(code=code, zone=zone, title=title, does=does, sections=sections)

APP = [
    S("APP", "APP", "Intro, Welcome And Map",
      "Lines spoken outside the scenes: the opening story, zone welcomes and the map.", [
        ("Intro story (6 slides, narrated by Ganesha)", [
            ("Slide 1", "My mom, Parvati, made me with love.", ""),
            ("Slide 2", "Mom asked me to guard the door. When Shiva came, I wouldn’t let him in.", ""),
            ("Slide 3", "Uh-oh… something went very wrong.", ""),
            ("Slide 4", "Shiva made things right, and I came back with my elephant head.", ""),
            ("Slide 5", "Soon, we were together again.", ""),
            ("End screen", "Now come explore my world!", ""),
        ]),
        ("Map", [
            ("First ever visit, map opens", "Come — let’s start at Modak Mountain.", ""),
            ("Shloka River unlocks", "The Shloka River is waiting for you.", ""),
            ("Lambodara Lodge unlocks", "Lambodara Lodge is waiting for you.", ""),
            ("Symbol Mountain completed", "Wonderful! You discovered all the symbols of Symbol Mountain.", ""),
            ("Shloka River completed", "Beautiful chanting! You completed the Shloka River.", ""),
            ("Lambodara Lodge completed", "I loved learning about you! You completed Lambodara Lodge.", ""),
        ]),
        ("Zone welcome screen", [
            ("First time in a zone", "Welcome to {zone name}!", "Zone name is read out: Modak Mountain, Shloka River, Lambodara Lodge."),
            ("Zone already finished", "You finished {zone name}!", "Same three zone names."),
        ]),
    ]),
]

SM = [
    S("SM1", "SM", "Scene 1 — Modak (Mooshika’s journey)",
      "Child calms Mooshika, swipes and pulls branches to find six flowers, guides him across the mud, makes a garland and gives it to Ganesha.", [
        ("Opening", [
            ("Scene opens", "Mooshika has a journey ahead. Let’s help him.", ""),
        ]),
        ("Calm Mooshika (press and hold)", [
            ("Scene starts", "Mooshika’s thoughts keep jumping around. Press and hold to help him focus.", ""),
            ("Idle hint", "Press and hold Mooshika.", ""),
            ("Child lets go early", "Keep holding until Mooshika settles.", ""),
            ("Child lets go early (short)", "Keep holding.", ""),
            ("Success", "Mooshika stayed with it and made a little progress.", ""),
            ("Power reveal — child repeats", "I can keep going, one small step at a time.", "Say-with-me line."),
        ]),
        ("Flowers 1–2 (swipe the leaves)", [
            ("Part starts", "Two flowers are hiding in the leaves. Swipe them apart.", ""),
            ("Hint", "Swipe the branches apart.", ""),
            ("Hint", "Swipe all the way to open the branches.", ""),
            ("Hint", "Swipe the leaves apart again.", ""),
            ("Swipe not wide enough", "Try swiping sideways.", ""),
            ("Swipe not wide enough", "Swipe sideways.", ""),
            ("Swipe not wide enough", "Swipe a little farther.", ""),
            ("Swipe not wide enough", "Swipe farther.", ""),
            ("Success", "There they are! Two flowers.", ""),
        ]),
        ("Flowers 3–4 (pull the branch down)", [
            ("Part starts", "Two flowers are too high for Mooshika. Pull the branch down.", ""),
            ("Hint", "Pull the branch down and hold it.", ""),
            ("Hint", "Pull the branch down and keep holding.", ""),
            ("Hint", "Keep holding the branch.", ""),
            ("Hint", "Pull it downward.", ""),
            ("Hint", "Pull downward.", ""),
            ("Hint", "Keep pulling down.", ""),
            ("Success", "Got them! Two more flowers.", ""),
        ]),
        ("Flowers 5–6 (safe spots across the mud)", [
            ("Part starts", "The last two flowers are across the mud. Guide Mooshika from safe spot to safe spot.", ""),
            ("Hint", "Guide Mooshika to the next safe spot.", ""),
            ("Hint", "Find the glowing safe spot.", ""),
            ("Good jump", "Good jump! Now the next safe spot.", ""),
            ("Mooshika wobbles", "Ooh… that’s wobbly.", ""),
            ("Back to start spot", "Back to the safe spot. Try again.", ""),
            ("All six found", "You made it! All six flowers.", ""),
        ]),
        ("Feelings and Ganesha’s belly", [
            ("After crossing", "Mooshika felt upset, sad, nervous, pleased, happy, and excited.", ""),
            ("Right after", "His big belly held all those feelings.", ""),
            ("Power reveal — child repeats", "I can have lots of feelings and keep going.", "Say-with-me line."),
        ]),
        ("Garland and Modak", [
            ("Part starts", "You found all six flowers. Tap them to make a garland for Ganesha.", ""),
            ("Hint", "Tap any flower.", ""),
            ("Hint, after first tap", "Tap another flower.", ""),
            ("Garland done", "The garland is ready! Drag it to Ganesha.", ""),
            ("Hint", "Drag the garland to Ganesha.", ""),
            ("Garland given", "You brought the garland to Ganesha — and look, a sweet Modak!", ""),
            ("Power reveal — child repeats", "I can learn, keep trying, and find joy.", "Say-with-me line."),
            ("Mandala reveal — Mooshika", "One small step at a time.", "Plays as the Mooshika petal lands."),
            ("Mandala reveal — Big Belly", "You held lots of feelings and kept going.", "Plays as the Big Belly petal lands."),
            ("Mandala reveal — Modak", "You kept trying and found joy.", "Plays as the Modak petal lands."),
            ("Scene complete", "Small steps, big feelings, and lots of trying brought Mooshika to Ganesha.", "Plays inside the Mandala, right after the Modak petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SM2", "SM", "Scene 2 — Pond (lotus and trunk)",
      "Child presses and holds to move a rock, gently moves flowers aside so water flows, then holds the bud so the lotus blooms.", [
        ("Pond", [
            ("Scene opens", "The lotus needs water to bloom. Let’s help the water reach it.", ""),
            ("Rock step starts", "The rock is blocking the stream. Press and hold to move it.", ""),
            ("Lets go of rock early", "Keep holding.", ""),
            ("Flowers step starts", "The flowers are in the water’s way. Gently move them aside.", ""),
            ("Lets go of flowers early", "A little farther.", ""),
            ("Water reaches the lotus", "The water reached the lotus.", ""),
            ("Power reveal — child repeats", "I can be strong and gentle.", "Say-with-me line (Trunk)."),
            ("Lotus step starts", "Hold the bud to help it bloom.", ""),
            ("Lets go of bud early", "Keep holding.", ""),
            ("Lotus blooms", "The lotus bloomed, even in the muddy pond.", ""),
            ("Power reveal — child repeats", "I can keep growing when things are hard.", "Say-with-me line (Lotus)."),
            ("Mandala reveal — Trunk", "You were strong and gentle.", "Plays as the Trunk petal lands."),
            ("Mandala reveal — Lotus", "You kept growing through something hard.", "Plays as the Lotus petal lands."),
            ("Scene complete", "You used strength, then gentleness, and helped the lotus bloom.", "Plays inside the Mandala, right after the Lotus petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SM3", "SM", "Scene 3 — Symbol (Eyes, Ears and the broken Tusk)",
      "Child finds hidden things (Eyes), taps where sounds came from (Ears), then drags small broken things to rebuild a nest (Tusk).", [
        ("Opening", [
            ("Scene opens", "The forest friends need your help. Let’s see what they need.", ""),
        ]),
        ("Eyes game", [
            ("Game starts", "Some things are hiding. Look closely and tap each one you find.", ""),
            ("Game starts (story)", "Monkey is hungry, and Peacock has lost a special feather. Look carefully. Can you find what they need?", ""),
            ("Next target", "Now find the feather.", ""),
            ("Next target", "Now find the mango.", ""),
            ("Hint", "Look near the bushes. Something is peeking out.", ""),
            ("Feather found", "Feather found! Peacock will be so happy.", ""),
            ("Mango found", "Mango found! Monkey is hungry no more.", ""),
            ("Both found", "You looked closely and found them both!", ""),
            ("Idle", "Look closely — there’s still one hiding.", ""),
            ("Power reveal — child repeats", "I can focus on what matters.", "Say-with-me line (Eyes)."),
        ]),
        ("Ears game", [
            ("Intro", "Listen carefully.", ""),
            ("Elephant round starts", "Elephant is thirsty. Listen for water.", ""),
            ("Each place is played", "Listen for the water drip.", ""),
            ("Child should choose", "Where did you hear the water?", ""),
            ("Cow round starts", "Cow is hungry. Listen for the grass.", ""),
            ("Each place is played", "Listen for the grass rustle.", ""),
            ("Child should choose", "Where did you hear the grass?", ""),
            ("Replay prompt", "Listen again.", ""),
            ("Idle", "Listen again — where did it come from?", ""),
            ("Elephant round done", "Elephant found water.", ""),
            ("Cow round done", "Cow found grass.", ""),
            ("Both done", "You listened carefully and found the sounds.", ""),
            ("Power reveal — child repeats", "I can listen for what helps me.", "Say-with-me line (Ears)."),
        ]),
        ("Tusk nest game", [
            ("Game starts", "Oh no, the little bird’s nest is broken. Bunny wants to rebuild it. Can the broken twig help? Drag it to the nest.", ""),
            ("Hint", "Add the twig to the nest.", ""),
            ("Twig placed", "What about the short grass?", ""),
            ("Hint", "Add the grass to the nest.", ""),
            ("Grass placed", "Can the torn leaf help?", ""),
            ("Hint", "Add the leaf to the nest.", ""),
            ("Leaf placed", "And the bent feather?", ""),
            ("Hint", "Add the feather to the nest.", ""),
            ("Feather placed", "You did it! All those little things helped rebuild the nest.", ""),
            ("Power reveal — child repeats", "I can use what I have for something important.", "Say-with-me line (Tusk)."),
        ]),
        ("Mandala reveal", [
            ("Eyes petal lands", "You focused on what mattered.", ""),
            ("Ears petal lands", "You listened for what helped.", ""),
            ("Tusk petal lands", "You used what you had for something important.", ""),
        ]),
        ("Scene complete", [
            ("Scene complete", "You looked, listened, and used what you had to help.", "Plays inside the Mandala, right after the Tusk petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SM4", "SM", "Scene 4 — Sacred Assembly (remember all eight symbols)",
      "Child sees each symbol and taps where it belongs on Ganesha. Each correct tap plays that symbol’s line.", [
        ("Opening and instruction", [
            ("Scene opens", "You found all eight symbols. Let’s see what you remember.", ""),
            ("First instruction", "Look at the symbol, then tap where it belongs.", ""),
        ]),
        ("When the symbol is placed correctly", [
            ("Eyes placed", "Eyes. I can focus on what matters.", ""),
            ("Ears placed", "Ears. I can listen for what helps me.", ""),
            ("Trunk placed", "Trunk. I can be strong and gentle.", ""),
            ("Tusk placed", "Tusk. I can use what I have for something important.", ""),
            ("Modak placed", "Modak. I can learn, keep trying, and find joy.", ""),
            ("Lotus placed", "Lotus. I can keep growing when things are hard.", ""),
            ("Big Belly placed", "Big Belly. I can have lots of feelings and keep going.", ""),
            ("Mooshika placed", "Mooshika. I can keep going, one small step at a time.", ""),
        ]),
        ("Hints when the child is stuck", [
            ("Eyes", "Which part helps you see what matters?", ""),
            ("Ears", "Which part helps you listen for what helps?", ""),
            ("Trunk", "Which part can lift something heavy and pick up something tiny?", ""),
            ("Tusk", "Which part can still help, even when it’s broken?", ""),
            ("Modak", "Where does Ganesha hold his sweet?", ""),
            ("Lotus", "Where does the lotus belong with Ganesha?", ""),
            ("Big Belly", "Which part can hold lots of feelings?", ""),
            ("Mooshika", "Where does Ganesha’s tiny friend belong?", ""),
        ]),
        ("Progress and finale", [
            ("Six symbols placed", "Almost there — six symbols are back with Ganesha.", ""),
            ("Final screen, line 1", "You remembered all eight symbols and what they mean.", "Two lines play back to back with a short pause."),
            ("Final screen, line 2", "Now when you see Ganesha, you can remember their wisdom.", ""),
        ]),
    ]),
]

SR = [
    S("SR1", "SR", "Scene 1 — Vakratunda Grove (Vakratunda and Mahakaya)",
      "Child learns two words, then helps Frog find another way across the river (Vakratunda) and builds a raft so everyone can cross (Mahakaya).", [
        ("Opening", [
            ("Scene opens", "Our river friends need a way across. Let’s help.", ""),
        ]),
        ("Vakratunda — Frog finds another way", [
            ("Game starts", "Frog’s way to his family is blocked. Drag Frog to find another way.", ""),
            ("Frog goes the blocked way", "That way is blocked. Can you find another way around?", ""),
            ("Hint", "Look for another way through.", ""),
            ("Frog reaches his family", "Frog reached his family.", ""),
            ("Success", "Vakratunda! You found another way and helped Frog reach his family.", ""),
            ("Power reveal — child repeats", "I can change my plan and try another way.", "Say-with-me line."),
        ]),
        ("Mahakaya — build the raft", [
            ("Game starts", "Everyone wants to cross the river. Drag the logs to build a raft.", ""),
            ("Hint", "Drag the log into the water.", ""),
            ("Hint", "Put the log here.", ""),
            ("After a log is placed", "Keep adding logs to the raft.", ""),
            ("After a log is placed", "Drag the next log.", ""),
            ("Raft done", "Everyone could come along.", ""),
            ("Success", "Mahakaay! You made space so everyone could come along.", "Spelt “Mahakaay” in the script; say it as ma-ha-KAA-ya."),
            ("Power reveal — child repeats", "I can make space in my heart for others.", "Say-with-me line."),
        ]),
        ("Mandala reveal", [
            ("Vakratunda petal lands", "You changed your plan and found another way.", ""),
            ("Mahakaya petal lands", "You made space for others.", ""),
        ]),
        ("Scene complete", [
            ("Scene complete", "You found another way, and made sure everyone could come along.", "Plays inside the Mandala, right after the Mahakaya petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SR2", "SR", "Scene 2 — Suryakoti Bank (Suryakoti and Samaprabha)",
      "Child rubs a glowing spot to bring back light for Bunny (Suryakoti), then presses and holds on a scary shadow to see what it really is (Samaprabha).", [
        ("Opening", [
            ("Scene opens", "The river is dark. Let’s bring back some light.", ""),
        ]),
        ("Suryakoti — bring back the light", [
            ("Game starts", "Bunny can’t find home. Rub the glow to bring back the light.", ""),
            ("Hint", "Rub the glowing spot.", ""),
            ("Hint", "Keep rubbing.", ""),
            ("Hint, nearly done", "Almost there!", ""),
            ("Keep going", "Keep rubbing to bring back more light.", ""),
            ("Success", "Suryakoti! You brought back the light and helped Bunny home.", ""),
            ("Power reveal — child repeats", "I can find hope inside me.", "Say-with-me line."),
        ]),
        ("Samaprabha — look closely at the shadow", [
            ("Game starts", "Deer sees a strange shadow. Press and hold to look closely.", ""),
            ("Hint", "Press and hold on the shadow.", ""),
            ("Child lets go early", "Keep holding.", ""),
            ("Move to another part", "Press and hold another part of the shadow.", ""),
            ("Hint", "Look for another part of the shadow.", ""),
            ("Reveal 1", "That part is just a branch.", ""),
            ("Reveal 2", "Those are just reeds and leaves.", ""),
            ("Reveal 3", "That part is a tree stump.", ""),
            ("Reveal 4", "And those are just rocks and grass.", ""),
            ("Success", "Samaprabha! You looked closely and helped Deer feel safe.", ""),
            ("Power reveal — child repeats", "I can see what is really there.", "Say-with-me line."),
        ]),
        ("Mandala reveal", [
            ("Suryakoti petal lands", "You found hope and brought back the light.", ""),
            ("Samaprabha petal lands", "You looked closely and saw what was really there.", ""),
        ]),
        ("Scene complete", [
            ("Scene complete", "You brought back the light and saw what was really there.", "Plays inside the Mandala, right after the Samaprabha petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SR3", "SR", "Scene 3 — Nirvighnam Chant (Nirvighnam and Kuru Me Deva)",
      "Child clears Turtle’s path (rock, branch, reeds) one thing at a time, then asks Elephant and Monkey for help to build a bridge for Baby Beaver.", [
        ("Opening", [
            ("Scene opens", "The way ahead is tricky. Let’s help our friends through.", ""),
        ]),
        ("Nirvighnam — clear Turtle’s path", [
            ("Game starts", "Turtle’s way home is blocked. Press and hold the rock to move it.", ""),
            ("Hint", "Hold the rock.", ""),
            ("Lets go of rock early", "Keep holding.", ""),
            ("Rock moved, branch next", "The branch is still blocking the way. Drag it onto the bank.", ""),
            ("Hint", "Drag the branch onto the bank.", ""),
            ("Branch moved, reeds next", "The reeds are blocking the way. Swipe them apart.", ""),
            ("Hint", "Swipe the reeds apart.", ""),
            ("General nudge", "Something’s still blocking Turtle’s way.", ""),
            ("Success", "You cleared the way and helped Turtle through.", ""),
            ("Power reveal — child repeats", "I can solve one thing at a time.", "Say-with-me line."),
        ]),
        ("Kuru Me Deva — ask for help", [
            ("Game starts", "Baby Beaver is across the river.", ""),
            ("Logs step", "The logs are too heavy. Drag the help bubble to someone who can help.", ""),
            ("Hint", "Drag the help bubble to someone who can help.", ""),
            ("Hint", "Drag the help bubble to Elephant.", ""),
            ("Elephant helps", "Elephant helped put the logs in place.", ""),
            ("Rope step hint", "Who can help tie the rope?", ""),
            ("Hint", "Drag the help bubble to Monkey.", ""),
            ("Monkey helps", "Monkey helped tie the rope.", ""),
            ("Planks step", "Now drag the planks into place.", ""),
            ("Hint", "Drag a plank toward the bridge.", ""),
            ("Hint", "Drag the plank onto the glowing place.", ""),
            ("Child keeps going", "Good. Continue dragging the planks.", ""),
            ("Success", "Kuru Me Deva! You asked for help and built the bridge.", ""),
            ("Power reveal — child repeats", "I can ask for help when I need it.", "Say-with-me line."),
        ]),
        ("Mandala reveal", [
            ("Nirvighnam petal lands", "You solved one thing at a time.", ""),
            ("Kuru Me Deva petal lands", "You asked for help when you needed it.", ""),
        ]),
        ("Scene complete", [
            ("Scene complete", "You cleared the path and asked for help when things got hard.", "Plays inside the Mandala, right after the Kuru Me Deva petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SR4", "SR", "Scene 4 — Sarvakaryeshu Chant (Sarvakaryeshu and Sarvada)",
      "Child picks the Ganesha symbol that helps in four everyday moments (Sarvakaryeshu), then follows a day from morning to night and finds Ganesha’s hidden symbol each time (Sarvada).", [
        ("Opening", [
            ("Scene opens", "Let’s see where Ganesha is with you today.", ""),
        ]),
        ("Sarvakaryeshu — pick the symbol", [
            ("Moment 1 starts", "So much to do. Which symbol can help him start small?", ""),
            ("Hint 1", "Which symbol can help him start small?", ""),
            ("Hint 2", "Think of a symbol that reminds us to begin with one small step.", ""),
            ("Hint 3", "Remember? Mooshika helps us start small.", ""),
            ("Right answer", "Mooshika helped him begin with one small thing.", ""),
            ("Moment 2 starts", "So many distractions. Which symbol can help him focus?", ""),
            ("Hint 1", "Which symbol can help him focus?", ""),
            ("Hint 2", "Think of the symbol that helps us notice what matters.", ""),
            ("Hint 3", "Remember? The Eyes help us focus on what matters.", ""),
            ("Right answer", "The Eyes helped him focus on what mattered.", ""),
            ("Moment 3 starts", "Heavy here, gentle there. Which symbol can help?", ""),
            ("Hint 1", "Which symbol helps us be strong and gentle?", ""),
            ("Hint 2", "Think of a symbol that can be strong and gentle.", ""),
            ("Hint 3", "Remember? The Trunk can be strong and gentle.", ""),
            ("Right answer", "The Trunk helped him use strength, then gentleness.", ""),
            ("Moment 4 starts", "The crayon is broken. Which symbol can help?", ""),
            ("Hint 1", "Which symbol reminds us broken things can still help?", ""),
            ("Hint 2", "Think of a symbol that shows something broken can still be useful.", ""),
            ("Hint 3", "Remember? The Tusk can still help, even when it’s broken.", ""),
            ("Right answer", "The Tusk reminded her that something broken can still help.", ""),
            ("All four done", "Sarvakaryeshu! You chose a Ganesha symbol for each task.", ""),
        ]),
        ("Sarvada — Ganesha all day", [
            ("Part starts", "Morning, afternoon and night — let’s find Ganesha through your day.", ""),
            ("Morning", "Morning can be busy. What can help him listen?", ""),
            ("Morning hint", "Think of the symbol that helps us listen.", ""),
            ("Afternoon", "Things didn’t go his way. What can help him keep going?", ""),
            ("Afternoon hint", "Think of the symbol that can hold lots of feelings.", ""),
            ("Night", "He kept trying and finished the puzzle. What can remind him of that happy feeling?", ""),
            ("Night hint", "Think of the sweet that reminds us of joy.", ""),
            ("Find the hidden symbol", "Can you find the hidden symbol?", ""),
            ("Day finished", "You found Ganesha through the whole day.", ""),
        ]),
        ("Mandala reveal", [
            ("Sarva Karyeshu petal lands", "You remembered Ganesha in what you did.", ""),
            ("Sarvada petal lands", "You found Ganesha with you through the whole day.", ""),
        ]),
        ("Scene complete", [
            ("Scene complete", "From morning to night, Ganesha was with you.", "Plays inside the Mandala, right after the Sarvada petal line. No separate line for the fireworks."),
        ]),
    ]),
    S("SR5", "SR", "Scene 5 — Shloka River Finale (put the shloka together)",
      "Child chooses the eight symbol boats in the right order, then hears and says the whole shloka together.", [
        ("Arranging the shloka", [
            ("Scene opens", "You found all eight words. Now let’s put them together.", ""),
            ("Game starts", "Watch the Shloka come alive.", ""),
            ("Choose the first boat", "Now, choose the first symbol boat in the Shloka.", ""),
            ("Choose the next boat", "Now, choose the next one.", ""),
            ("Child is doing well", "Great! Keep choosing.", ""),
            ("All boats placed", "You did it! The whole Shloka is in place.", ""),
        ]),
        ("Saying it together", [
            ("Recap starts", "Now, let’s say it together.", ""),
            ("Finale", "You remembered the whole Ganesha Shloka. Now you can carry it with you.", ""),
        ]),
        ("Hints per word — second hint then third hint", [
            ("Vakratunda, hint 2", "Which symbol can help you try another way?", ""),
            ("Vakratunda, hint 3", "Remember Vakratunda.", ""),
            ("Mahakaya, hint 2", "Which symbol reminds you to make space for others?", ""),
            ("Mahakaya, hint 3", "Remember Mahakaay.", "Spelt “Mahakaay” in the script; say it as ma-ha-KAA-ya."),
            ("Suryakoti, hint 2", "Which symbol can help you find hope inside?", ""),
            ("Suryakoti, hint 3", "Remember Suryakoti.", ""),
            ("Samaprabha, hint 2", "Which symbol can help you see what is really there?", ""),
            ("Samaprabha, hint 3", "Remember Samaprabha.", ""),
            ("Nirvighnam, hint 2", "Which symbol can help you solve one thing at a time?", ""),
            ("Nirvighnam, hint 3", "Remember Nirvighnam.", ""),
            ("Kuru Me Deva, hint 2", "Which symbol reminds you to ask for help?", ""),
            ("Kuru Me Deva, hint 3", "Remember Kuru Me Deva.", ""),
            ("Sarva Karyeshu, hint 2", "Which symbol reminds you of Ganesha in all you do?", ""),
            ("Sarva Karyeshu, hint 3", "Remember Sarva Karyeshu.", ""),
            ("Sarvada, hint 2", "Which symbol reminds you Ganesha is always with you?", ""),
            ("Sarvada, hint 3", "Remember Sarvada.", ""),
        ]),
    ]),
]

AH = [
    S("AH1", "AH", "Scene 1 — Family Tree",
      "Child meets Ganesha’s family by placing them on the tree, then builds their own family tree.", [
        ("Opening", [
            ("Scene opens", "Let’s meet my family, then make your family tree.", ""),
            ("Instruction", "Tap a circle to meet someone in my family.", "Also the idle hint, after a short wait."),
        ]),
        ("Correct placement", [
            ("Father placed", "This is my father, Shiva.", ""),
            ("Mother placed", "This is my mother, Parvati.", ""),
            ("Brother placed", "This is my brother, Kartikeya.", ""),
            ("Ganesha placed", "And that’s me, Ganesha!", ""),
        ]),
        ("Progress", [
            ("Ganesha’s tree done", "You met everyone in my family.", ""),
            ("Fun-fact card left open", "Tap anywhere to close.", "Plays if the card stays open for about 5 seconds."),
            ("Switch to child’s tree", "Now let’s make your family tree.", ""),
        ]),
        ("Child’s own tree", [
            ("Child’s part starts", "Tap the people or pets you want to add.", ""),
            ("As the tree grows", "Your family tree is growing.", "Same line, played when the 1st, 3rd, 6th and 15th person is added."),
            ("Tree completely full", "These are the people and pets you chose for your family.", "Plays only when all 21 places are filled."),
            ("Scene complete", "Our family trees are different, and each one tells a story.", ""),
        ]),
    ]),
    S("AH2", "AH", "Scene 2 — Favourite Things",
      "Child guesses Ganesha’s favourite food, colour, activity and friend, then picks their own.", [
        ("Opening", [
            ("Scene opens", "Let’s find my favorites, then yours.", ""),
        ]),
        ("Ganesha’s favourites — child guesses", [
            ("Food question", "Can you guess my favorite food?", ""),
            ("Food hint", "Look for the sweet I love.", ""),
            ("Food correct", "Yes — I love modak!", ""),
            ("Colour question", "Can you guess my favorite color?", ""),
            ("Colour hint", "What color is an apple?", ""),
            ("Colour correct", "Yes — red!", ""),
            ("Activity question", "What do you think I love doing?", ""),
            ("Activity hint", "What lets me move to music?", ""),
            ("Activity correct", "Yes — I love to dance!", ""),
            ("Friend question", "Who do you think my friend is?", ""),
            ("Friend hint", "Look for my tiny friend.", ""),
            ("Friend correct", "Yes — Mooshika!", ""),
        ]),
        ("Child’s favourites", [
            ("Switch to the child", "Now I want to know your favorites.", ""),
            ("Food question", "Choose your favorite food.", ""),
            ("Food chosen", "Yummy!", ""),
            ("Colour question", "Choose your favorite color.", ""),
            ("Colour chosen", "Nice choice!", ""),
            ("Activity question", "Choose something you love to do.", ""),
            ("Activity chosen", "That sounds like fun!", ""),
            ("Friend question", "Add the name of a friend you care about.", ""),
            ("Friend added", "Thanks for telling me!", ""),
        ]),
        ("Connection moment", [
            ("Comparison screen", "Now we know some things we each enjoy.", ""),
        ]),
    ]),
    S("AH3", "AH", "Scene 3 — Wishes And Dreams",
      "Child helps with three of Ganesha’s wishes (kindness, food, a greener world), then draws their own dream and taps Ganesha to clear the clouds hiding it.", [
        ("Opening", [
            ("Scene opens", "I have a few wishes. Will you help me — then share yours?", ""),
        ]),
        ("Wish 1 — kindness", [
            ("Wish starts", "My first wish is for more kindness.", ""),
            ("Instruction", "Tap the kind actions you can spot.", ""),
            ("Idle hint", "Can you find another kind action?", ""),
            ("Idle hint 2", "Look for actions that help or care for someone.", ""),
            ("Kind action tapped", "Helping / Sharing / Hugging / Gifting", "One word, spoken for the action the child tapped. Unkind actions are not spoken."),
            ("Wish done", "You found all the kind choices.", "Always preceded by a random cheer — see list below."),
        ]),
        ("Wish 2 — enough food", [
            ("Wish starts", "My next wish is for everyone to have enough food.", ""),
            ("Instruction", "Drag food to each empty plate.", ""),
            ("Idle hint, nothing placed yet", "Drag one food toward an empty plate.", ""),
            ("Idle hint, after first food", "There’s still an empty plate.", ""),
            ("Wish done", "Now every plate has food.", "Always preceded by a random cheer — see list below."),
        ]),
        ("Wish 3 — a greener world", [
            ("Wish starts", "My next wish is for a greener world.", ""),
            ("Instruction", "Tap the bare spaces to help the garden grow.", ""),
            ("Idle hint", "There’s still space for more to grow.", ""),
            ("Wish done", "Look how green it has become.", "Always preceded by a random cheer — see list below."),
        ]),
        ("Random cheer before each “Wish done” line", [
            ("One of six", "Awesome! / Amazing! / Great job! / Wonderful! / Fantastic! / Brilliant!", "Picked at random, never the same one twice in a row."),
        ]),
        ("The child’s dream", [
            ("Switch to the child", "Now it’s your turn to make a wish.", ""),
            ("Drawing starts", "Draw something you hope for or dream about.", ""),
            ("Dream is hidden", "Your dream is hiding behind the clouds. Help me clear them — tap me.", ""),
            ("Idle hint", "Tap me to clear the clouds.", ""),
            ("Idle hint, after first tap", "Keep tapping.", ""),
            ("Dream revealed", "There it is — your dream!", ""),
            ("Comparison screen", "Everyone can dream about something different.", ""),
        ]),
    ]),
    S("AH4", "AH", "Scene 4 — My Indian Story",
      "Child finds Ganesha’s places on a map, then picks their own places, languages and festivals.", [
        ("Opening", [
            ("Scene opens", "Let’s explore my India story, then yours.", ""),
        ]),
        ("Places", [
            ("Ganesha’s places", "Move the magnifying glass around the map to find my places.", ""),
            ("Idle hint, first (about 12 seconds)", "Move the magnifying glass around the map.", "Skipped if the child has already started dragging."),
            ("Idle hint, second", "Drag the magnifying glass to find me.", ""),
            ("Phase 1 done", "You found some places connected to my story.", ""),
            ("Child’s place", "Now choose a place your family feels connected to.", ""),
            ("Idle hint", "Which place feels connected to your family?", ""),
            ("Reminder", "Choose the place connected with your family.", ""),
            ("Place chosen", "This is the place you chose.", "The region name is read first, for example “South India. This is the place you chose.”"),
        ]),
        ("Languages", [
            ("First time", "Tap play and listen carefully.", ""),
            ("Audio played", "Vakratunda Mahakaya Suryakoti Samaprabha!", "Read as a chant — Sanskrit."),
            ("Guess", "Which language do you hear?", ""),
            ("Hint", "Think of the language many shlokas are in.", ""),
            ("Correct", "Yes — that’s Sanskrit, a language used in many mantras.", ""),
            ("Child’s languages", "Now choose up to three languages you use or hear.", ""),
            ("Idle hint", "Choose the languages that are part of your life.", ""),
            ("Reminder", "Choose up to three languages you use or hear.", ""),
            ("Languages chosen", "These are the languages you chose.", ""),
        ]),
        ("Festivals", [
            ("Guess", "Can you find my festival?", ""),
            ("Hint", "Think of the festival that celebrates Ganesha.", ""),
            ("Reminder", "Tap my favorite festival.", ""),
            ("Correct", "Yes — Ganesh Chaturthi!", ""),
            ("Child’s festivals", "Now choose the festivals your family celebrates.", ""),
            ("Idle hint", "Which celebrations are part of your family?", ""),
            ("Reminder", "Tap the festivals you celebrate.", ""),
            ("Festivals chosen", "These are the festivals you chose.", ""),
        ]),
        ("Names read aloud when tapped", [
            ("Ganesha’s places", "Varanasi / Mumbai / Tamil Nadu", "Each name is read when the child finds that place."),
            ("Regions", "North India / West India / Central India / East India / Northeast India / South India / Mount Kailash / Outside India", "Read when the child picks a region."),
            ("Languages", "Hindi / Tamil / Telugu / Marathi / Gujarati / Bengali / Kannada / Malayalam / Punjabi / Sanskrit / English / Other", "Read when the child taps a language."),
            ("Festivals", "Pongal / Holi / Janmashtami / Ganesh Chaturthi / Durga Puja / Diwali / Navratri / Onam / Eid / Christmas / Dussehra / Raksha Bandhan", "Read when the child taps a festival."),
        ]),
        ("Ending", [
            ("Origin card", "Your places, languages, and celebrations can all be part of that connection.", ""),
        ]),
    ]),
]

SOURCES = [
    "Shared VO: src/lib/config/content/voiceGuidance.js, openingModals.js",
    "Intro story: src/components/GaneshaIntroStory.jsx · Map: src/pages/CleanMapZone.jsx · Zone welcome: src/lib/components/zone/ZoneWelcome.jsx",
    "Symbol Mountain: modak/NewModakSceneV7.jsx + FlowerJourneyGame2.jsx + GarlandGame3.jsx · pond/PondSceneSimplifiedV4.jsx · tusk/SymbolMountainSceneV3.jsx + EyesPopUpGame.jsx + EarsSoundMatchGame.jsx + tuskNestFlow.json · final scene/SacredAssemblySceneV8.jsx",
    "Shloka River: Scene1–Scene3 and scene4 chant scene files (their spoken-line maps), scene5/ShlokaRiverFinale.jsx",
    "About Me Hut: family-tree/Familytreegame.jsx · food/Favoritefoodgame.jsx · enjoy/ObstacleRemoverGame.jsx · indian-story/MyIndianStoryGame.jsx",
]

# ───────────────────────── 3. DOCX HELPERS ─────────────────────────
def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), fill)
    tcPr.append(shd)

def set_cell_margins(table, top=50, bottom=50, left=80, right=80):
    tblPr = table._tbl.tblPr
    m = OxmlElement("w:tblCellMar")
    for k, v in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        e = OxmlElement(f"w:{k}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
    tblPr.append(m)

def set_borders(table, color="D0C8D8"):
    tblPr = table._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for k in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{k}")
        e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:space"), "0"); e.set(qn("w:color"), color)
        b.append(e)
    tblPr.append(b)

def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    e = OxmlElement("w:tblHeader"); e.set(qn("w:val"), "true"); trPr.append(e)

def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    e = OxmlElement("w:cantSplit"); e.set(qn("w:val"), "true"); trPr.append(e)

def run(p, text, size=10, bold=False, color=None, italic=False):
    r = p.add_run(text)
    r.font.name = FONT; r._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    r.font.size = Pt(size); r.bold = bold; r.italic = italic
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return r

def para(doc, text="", size=10, bold=False, color=None, italic=False, align=None, after=4, before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(before)
    if align: p.alignment = align
    if text: run(p, text, size, bold, color, italic)
    return p

def widths(table, ws):
    table.autofit = False
    for row in table.rows:
        for i, w in enumerate(ws):
            row.cells[i].width = Inches(w)

def cell_text(cell, text, size=9.5, bold=False, color=None, italic=False):
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    run(p, text, size, bold, color, italic)

def banner(doc, text, sub, fill):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]; shade(c, fill)
    c.width = Inches(7.4)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    run(p, text, 14, True, "FFFFFF")
    if sub:
        p2 = c.add_paragraph(); p2.paragraph_format.space_after = Pt(2)
        run(p2, sub, 9.5, False, "FFFFFF", italic=True)
    set_cell_margins(t, 90, 90, 140, 140)

def sub_head(doc, text, color):
    p = para(doc, "", after=3, before=8)
    run(p, text, 11, True, color)

def line_table(doc, code, sec_idx, rows, fill):
    t = doc.add_table(rows=1, cols=5)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_borders(t); set_cell_margins(t)
    for i, h in enumerate(["ID", "When it plays", "Line to record", "Notes", "Done"]):
        c = t.rows[0].cells[i]; shade(c, fill); cell_text(c, h, 9, True, "FFFFFF")
    repeat_header(t.rows[0])
    for n, (when, line, note) in enumerate(rows, 1):
        r = t.add_row(); no_split(r)
        cells = r.cells
        cell_text(cells[0], f"{code}-{sec_idx}{chr(96+n) if n < 27 else n}", 8.5, False, "6B6B6B")
        cell_text(cells[1], when, 9, False, "555555")
        cell_text(cells[2], line, 11, True, "1A1A1A")
        cell_text(cells[3], note, 8.5, False, "7A3E00", italic=bool(note))
        cell_text(cells[4], "☐", 11)
        cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        if n % 2 == 0:
            for c in cells: shade(c, "F7F4FA")
    widths(t, [0.62, 1.55, 3.55, 1.38, 0.4])

# ───────────────────────── 4. BUILD ─────────────────────────
def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    for side in ("top_margin", "bottom_margin"): setattr(sec, side, Inches(0.6))
    for side in ("left_margin", "right_margin"): setattr(sec, side, Inches(0.55))
    doc.styles["Normal"].font.name = FONT

    # footer page number
    fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run(fp, "Ganesha My Bestie — VO Artist Handoff · page ", 8, color="888888")
    for tag, txt in (("begin", None), (None, "PAGE"), ("end", None)):
        r = fp.add_run(); r.font.size = Pt(8)
        if tag:
            f = OxmlElement("w:fldChar"); f.set(qn("w:fldCharType"), tag); r._r.append(f)
        else:
            it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = txt; r._r.append(it)

    # ── cover
    para(doc, "Ganesha My Bestie", 26, True, PURPLE, align=WD_ALIGN_PARAGRAPH.CENTER, before=40, after=2)
    para(doc, "Voice-Over Artist Handoff", 18, True, "333333", align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
    para(doc, "Every line spoken in the 13 live scenes, in recording order", 11, False, "666666", italic=True,
         align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
    para(doc, "Built from the live code on 7 October 2026", 9.5, False, "888888", align=WD_ALIGN_PARAGRAPH.CENTER, after=18)

    para(doc, "About the voice", 13, True, PURPLE, after=4)
    for s in [
        "Ganesha is the narrator — a warm, joyful, gentle friend speaking to a child of 5–12. Respectful and playful, never silly or babyish.",
        "Warm and clear, slightly slower than normal chat. Short pauses between sentences so a 5-year-old can follow.",
        "Lines marked “child repeats” are said with the child. Leave a short gap after them.",
        "Hint lines (“Keep holding.”, “Try swiping sideways.”) are quiet nudges — softer and calmer than the story lines. Never a scold.",
        "Hindi/Sanskrit words stay clean and unhurried — do not anglicise them. See Part 1 for the pronunciation.",
    ]:
        p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(2); run(p, s, 10)

    para(doc, "How to use this document", 13, True, PURPLE, after=4, before=10)
    for s in [
        "Part 1 — the Hindi / Sanskrit words, with Devanagari and how to say them.",
        "Part 2 — the lines, scene by scene, in the order a child hears them.",
        "Every line has an ID (for example SM1-2c). Please name each audio file with its ID so we can drop it straight in.",
        "The Notes column flags a line that needs a decision. Tick “Done” as you go.",
        "Line counts: " + ", ".join(f"{k} {sum(len(r) for s in v for _, r in s['sections'])}" for k, v in
                                    (("Intro/Map", APP), ("Symbol Mountain", SM), ("Shloka River", SR), ("About Me Hut", AH)))
        + ".",
    ]:
        p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(2); run(p, s, 10)

    para(doc, "Decisions we need from you or the team before recording", 13, True, PURPLE, after=4, before=10)
    for s in [
        "“Mahakaya” is written “Mahakaay” in a few spoken lines (SR1, SR5). Please say ma-ha-KAA-ya in all of them; the on-screen spelling is already Mahakaya.",
    ]:
        p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(2); run(p, s, 10)
    doc.add_page_break()

    # ── Part 1 words
    banner(doc, "Part 1 — Hindi / Sanskrit Words", "Record these first. They return in many scenes.", PURPLE)
    sub_head(doc, "The eight shloka words", PURPLE)
    para(doc, "Capitals mark the stressed syllable. The words are also played one syllable at a time in the word-learning game, "
              "so each syllable must be clean on its own.",
         9.5, False, "555555", after=4)
    t = doc.add_table(rows=1, cols=6); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_borders(t); set_cell_margins(t)
    for i, h in enumerate(["#", "Word", "Devanagari", "Say it as", "Syllable clips", "In English"]):
        c = t.rows[0].cells[i]; shade(c, PURPLE); cell_text(c, h, 9, True, "FFFFFF")
    repeat_header(t.rows[0])
    for n, (w, d, say, syl, mean) in enumerate(SHLOKA_WORDS, 1):
        r = t.add_row(); no_split(r)
        cell_text(r.cells[0], str(n), 9.5)
        cell_text(r.cells[1], w, 11, True)
        cell_text(r.cells[2], d, 12)
        cell_text(r.cells[3], say, 10.5, True, PURPLE)
        cell_text(r.cells[4], syl, 9); cell_text(r.cells[5], mean, 9)
        m = r.add_row() if False else None
        if n % 2 == 0:
            for c in r.cells: shade(c, "F7F4FA")
    widths(t, [0.3, 1.15, 1.1, 1.45, 1.35, 2.15])

    para(doc, "", after=2)
    para(doc, "What each word means in the app (so the tone fits the line)", 10.5, True, "333333", after=3, before=4)
    mt = doc.add_table(rows=1, cols=2); set_borders(mt); set_cell_margins(mt)
    for i, h in enumerate(["Word", "Meaning the child learns"]):
        c = mt.rows[0].cells[i]; shade(c, PURPLE); cell_text(c, h, 9, True, "FFFFFF")
    for w, d, say, syl, mean in SHLOKA_WORDS:
        r = mt.add_row(); no_split(r)
        cell_text(r.cells[0], w, 10, True); cell_text(r.cells[1], mean, 10)
    widths(mt, [1.8, 5.7])

    sub_head(doc, "Other Hindi / Sanskrit words and names", PURPLE)
    t2 = doc.add_table(rows=1, cols=5); set_borders(t2); set_cell_margins(t2)
    for i, h in enumerate(["Word", "Devanagari", "Say it as", "In English", "Where it appears"]):
        c = t2.rows[0].cells[i]; shade(c, PURPLE); cell_text(c, h, 9, True, "FFFFFF")
    repeat_header(t2.rows[0])
    for n, (w, d, say, mean, where) in enumerate(OTHER_WORDS, 1):
        r = t2.add_row(); no_split(r)
        cell_text(r.cells[0], w, 10, True); cell_text(r.cells[1], d, 10.5)
        cell_text(r.cells[2], say, 9.5, True, PURPLE); cell_text(r.cells[3], mean, 9); cell_text(r.cells[4], where, 9)
        if n % 2 == 0:
            for c in r.cells: shade(c, "F7F4FA")
    widths(t2, [1.3, 1.3, 1.45, 2.2, 1.25])
    doc.add_page_break()

    # ── Part 2 scenes
    banner(doc, "Part 2 — Scene-By-Scene Scripts", "Order of play: Intro and map → Symbol Mountain → Shloka River → Lambodara Lodge.", PURPLE)
    para(doc, "", after=4)
    first = True
    for group in (APP, SM, SR, AH):
        for sc in group:
            if not first: doc.add_page_break()
            first = False
            fill = ZONE_COLORS[sc["zone"]]
            banner(doc, sc["title"], sc["does"], fill)
            for idx, (sec_title, rows) in enumerate(sc["sections"], 1):
                sub_head(doc, sec_title, fill)
                line_table(doc, sc["code"], idx, rows, fill)
    doc.add_page_break()

    banner(doc, "Where these lines come from", "For the production team — verified against the live code on 2026-10-07.", "666666")
    para(doc, "", after=4)
    for s in SOURCES:
        p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(3); run(p, s, 9.5)

    doc.save(OUTPUT)
    n = sum(len(r) for g in (APP, SM, SR, AH) for s in g for _, r in s["sections"])
    print(OUTPUT, n, "lines")

if __name__ == "__main__":
    build()
