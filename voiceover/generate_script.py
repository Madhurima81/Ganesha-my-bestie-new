#!/usr/bin/env python3
"""Builds voiceover/script.csv + src/lib/config/content/voClipMap.generated.js.
Read-only over scene code. Inputs (made by the audit scripts): content.json (VOICE_SCRIPTS + OPENING_MODALS),
inline.json (inline strings per scene), tusk + family-tree extras are re-read here.
Usage: python3 -I generate_script.py <scratch_dir>
"""
import csv, json, os, re, sys, collections
S = sys.argv[1]; ROOT = os.getcwd()
content = json.load(open(f'{S}/content.json')); inline = json.load(open(f'{S}/inline.json'))

ZONES = {  # zone -> (file prefix, status note, [(scene id, slug)])
 'about-me-hut': ('hut', '', [('family-tree','family-tree'),('favorite-food','food'),('dreams-wishes','dreams'),('my-indian-story','story')]),
 'symbol-mountain': ('mountain', '', [('modak','modak'),('pond','pond'),('symbol','symbols'),('final-scene','final')]),
 'shloka-river': ('river', '', [('vakratunda-grove','grove'),('suryakoti-bank','bank'),('nirvighnam-chant','nirvighnam'),('sarvakaryeshu-chant','sarvakaryeshu'),('shloka-river-finale','finale')]),
 'cave-of-secrets': ('cave', 'OBSOLETE ZONE (not part of product) - ', [('vakratunda-mahakaya','vakratunda'),('suryakoti-samaprabha','suryakoti'),('nirvighnam-kurumedeva','nirvighnam'),('sarvakaryeshu-sarvada','sarvakaryeshu'),('final-meaning-scene','finale')]),
 'festival-square': ('festival', 'PARKED ZONE - ', [('game1','piano'),('game2','rangoli'),('game3','cooking'),('game4','mandap')]),
}
# Sanskrit / proper names that need a correct pronunciation. value = guide
SANSKRIT = {
 'vakratunda':'va-kra-TUN-da','mahakaya':'ma-ha-KA-ya','suryakoti':'sur-ya-KO-ti','samaprabha':'sa-ma-PRA-bha',
 'nirvighnam':'nir-VIGH-nam','kurumedeva':'ku-ru-ME-de-va','sarvakaryeshu':'sar-va-KAR-ye-shu','sarvada':'sar-VA-da',
 'ganesha':'ga-NE-sha','mooshika':'MOO-shi-ka','modak':'MO-dak','shiva':'SHI-va','parvati':'PAR-va-ti','kartikeya':'kar-ti-KAY-a',
 'shloka':'SHLO-ka','shlokas':'SHLO-kas','sanskrit':'SAN-skrit','mantra':'MAN-tra','mantras':'MAN-tras','brahma':'BRAH-ma',
 'lotus':None,'namaste':'na-ma-STAY','diwali':'di-WA-li','rangoli':'ran-GO-li','chaturthi':'cha-TUR-thi','lakshmi':'LAK-shmi',
 'dadi':'DA-di','nani':'NA-ni','dada':'DA-da','nana':'NA-na','tusk':None,
}
SANSKRIT = {k:v for k,v in SANSKRIT.items() if v}
SHLOKA_WORDS = {'vakratunda','mahakaya','suryakoti','samaprabha','nirvighnam','kurumedeva','sarvakaryeshu','sarvada'}
IMP = r'(Tap|Drag|Press|Hold|Look|Choose|Move|Swipe|Rub|Add|Draw|Listen|Think|Guide|Find|Pull|Try|Keep|Help|Place|Pick|Say|Chant|Repeat|Match|Touch|Gently|Clear|Collect|Fill|Name|Type|Write|Remember|Can you)\b'

def words(t): return re.findall(r"[A-Za-z’']+", t)
def classify(text, key):
    ws = [w.lower().strip("’'") for w in words(text)]
    if ws and all(w in SHLOKA_WORDS for w in ws): return 'shloka'
    if len(ws) <= 4 and any(w in SHLOKA_WORDS for w in ws) and re.search(r'chant|shloka|word|syll', key or '', re.I): return 'shloka'
    if re.search(IMP, text) and re.search(r'(^|[.!?—–-]\s*)'+IMP, text): return 'instruction'
    if re.search(r'hint|intro|instruction|clue|prompt|question|Active|Start|tapCircle', key or ''): return 'instruction'
    if re.search(r'(^|[.!?—–-]\s*)(Great|Amazing|Nice|Well|Good|Yes|Wonderful|Magnificent|Got them|There it is|There they are|Thanks|You\b|Found|Round|Lotus)', text): return 'feedback'
    if re.search(r'after|done|round|success|correct|complete|crossed|reunion|celebrat|finish|Power|claim', key or '', re.I): return 'feedback'
    return 'story'

rows = collections.OrderedDict()   # (zone, normalized text) -> row dict
def norm(t): return re.sub(r'\s+',' ',t.replace('\\n',' ').replace('’',"'")).strip().lower()
def add(zone, scene, text, key, src, typ=None, extra=''):
    text = text.replace('\\n', ' ').replace("\\'", "'").replace('\\"', '"').strip()
    if not text or 'gradient' in text or len(words(text)) < 1: return
    k = (zone, norm(text))
    if k in rows:
        r = rows[k]
        if scene not in r['scenes']: r['scenes'].append(scene)
        r['srcs'].append(src); return
    rows[k] = dict(zone=zone, scene=scene, scenes=[scene], text=text, key=key, srcs=[src], typ=typ, extra=extra)

# A. central voice scripts
for zone, scenes in content['VOICE_SCRIPTS'].items():
    if zone not in ZONES: continue
    for scene, items in scenes.items():
        for key, v in items.items():
            if isinstance(v, dict) and v.get('text'):
                add(zone, scene, v['text'], key, f'voiceGuidance.js[{zone}.{scene}.{key}]', extra=('existing file: '+v['file']) if v.get('file') else '')
# B. opening-modal voiceovers
for zone, scenes in content['OPENING_MODALS'].items():
    for scene, v in scenes.items():
        if v.get('voiceover'): add(zone, scene, v['voiceover'], 'opening', f'openingModals.js[{zone}.{scene}]', typ='story')
# C. inline strings in scene code
for zs, rs in inline.items():
    zone, scene = zs.split('/')
    for r in rs:
        add(zone, scene, r['text'], r['src'].split(':')[1], f"{r['file'].split('zones/')[-1]}:{r['line']}")
# D. extras: Tusk beat flow + family-tree member lines
def walk(o, p=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, p+'/'+k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, f'{p}[{i}]')
    elif isinstance(o, str) and p.rsplit('/',1)[-1] in ('voText','l2VoText'): yield p, o
tf = 'src/zones/symbol-mountain/scenes/tusk/tuskNestFlow.json'
for p, t in walk(json.load(open(tf))): add('symbol-mountain', 'symbol', t, p.split('/')[-1], f'{tf.split("zones/")[1]}{p}')
ft = open('src/zones/about-me-hut/family-tree/Familytreegame.jsx', errors='ignore').read()
for m in re.finditer(r"(voiceLine:|MYSELF_LINE\s*=)\s*(['\"])(.*?)\2", ft):
    add('about-me-hut', 'family-tree', m.group(3), 'voiceLine', f'family-tree/Familytreegame.jsx:{ft.count(chr(10),0,m.start())+1}')
# E. shloka words (already recorded in /audio/words) - one row each + the full verse
order = ['vakratunda','mahakaya','suryakoti','samaprabha','nirvighnam','kurumedeva','sarvakaryeshu','sarvada']
for w in order:
    add('shloka-river', 'shloka-river-finale', w.capitalize(), 'word', 'getWordPath() -> /audio/words/'+w+'.mp3', typ='shloka',
        extra='existing file: /audio/words/'+w+'.mp3' if os.path.exists(f'public/audio/words/{w}.mp3') else 'MISSING /audio/words/'+w+'.mp3')
add('shloka-river', 'shloka-river-finale', ' '.join(w.capitalize() for w in order), 'verse', 'MyIndianStoryGame.jsx VOICE (verse spoken as 4 words) - full 8-word line', typ='shloka')

# number + write
counters = collections.Counter(); out = []; excluded = []; mapping = {}
sceneorder = {(z, s): (zi, si) for zi, (z, (_, _, sc)) in enumerate(ZONES.items()) for si, (s, _) in enumerate(sc)}
slug = {(z, s): sl for z, (_, _, sc) in ZONES.items() for s, sl in sc}
for r in sorted(rows.values(), key=lambda r: (sceneorder.get((r['zone'], r['scene']), (9, 9)), 0)):
    z = r['zone']; prefix, zstat, _ = ZONES[z]; text = r['text']
    typ = r['typ'] or classify(text, r['key'])
    sl = 'shloka' if typ == 'shloka' else slug.get((z, r['scene']), r['scene'])
    counters[(prefix, sl)] += 1
    fn = f'{prefix}-{sl}-{counters[(prefix, sl)]:02d}.mp3'
    ws = words(text); notes = []
    if zstat: notes.append(zstat.strip(' -'))
    if '${' in text: notes.append('DYNAMIC: contains runtime variable (name/choice) - cannot be one clip; record without it or record variants')
    elif len(ws) > 20: notes.append(f'TOO LONG: {len(ws)} words (>20) - split into 2 clips for ages 5-7')
    elif len(ws) > 14: notes.append(f'long-ish: {len(ws)} words')
    hits = []; seen = set()
    for w in ws:
        lw = w.lower().strip("’'")
        if lw in SANSKRIT and lw not in seen: seen.add(lw); hits.append(f'{w} [{SANSKRIT[lw]}]')
    if hits: notes.append(('SHLOKA - needs correct pronunciation: ' if typ == 'shloka' else 'PRONOUNCE: ') + ', '.join(hits))
    # respelled / split Sanskrit (TTS-era spellings) - the canonical 8 are in SHLOKA_WORDS; flag anything else
    bad = [m.group(0) for m in re.finditer(r"Mahakaay\w*|Sarva\s+Karyeshu|Surya\s+Koti|Sama\s+Prabha|Vakra\s+Tunda|Kuru\s+Me\s+Deva|Nir\s+Vighnam|Sarv\s+Ada", text, re.I)]
    if bad: notes.append('SPELLING CHECK: non-canonical Sanskrit spelling ' + ', '.join(f'"{b}"' for b in bad) + ' - confirm correct form with Madhurima before recording')
    if re.search(r'[\u2600-\u27BF\U0001F300-\U0001FAFF]', text): notes.append('contains emoji - do not voice the emoji')
    if r['extra']: notes.append(r['extra'])
    if len(r['scenes']) > 1: notes.append('same line also used in: ' + ', '.join(s for s in r['scenes'][1:]))
    notes.append(f"source: {r['srcs'][0]}" + (f" (+{len(r['srcs'])-1} more)" if len(r['srcs']) > 1 else ''))
    # Recording priority: P1 = Shloka River + opening-modal lines; P2 = everything else. Cave is OBSOLETE: not recorded.
    prio = 'P1' if (z == 'shloka-river' or r['key'] == 'opening') else 'P2'
    if z == 'cave-of-secrets':
        excluded.append([fn, z, r['scene'], typ, text, ' | '.join(notes)]); continue
    out.append([fn, z, r['scene'], typ, text, prio + ' | ' + ' | '.join(notes)])
    mapping[norm(text)] = fn[:-4]

os.makedirs('voiceover', exist_ok=True)
with open('voiceover/script.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['file_name','zone','scene','type','exact_text','notes']); w.writerows(out)
out.sort(key=lambda r: r[5][:2])  # stable: P1 first, original order kept inside each priority
with open('voiceover/excluded-cave.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['file_name','zone','scene','type','exact_text','notes']); w.writerows(excluded)
with open('src/lib/config/content/voClipMap.generated.js', 'w') as f:
    f.write('// GENERATED by voiceover/generate_script.py - do not edit by hand.\n// spoken line (normalised) -> /audio/<name>.mp3 name. Used by lib/audio/voClip.js\n')
    f.write('export const VO_CLIP_BY_TEXT = ' + json.dumps(mapping, indent=1, ensure_ascii=False) + ';\n')
print(len(out), 'rows'); print(collections.Counter(r[1] for r in out)); print(collections.Counter(r[3] for r in out))
print('too long:', sum('TOO LONG' in r[5] for r in out), 'dynamic:', sum('DYNAMIC' in r[5] for r in out))
