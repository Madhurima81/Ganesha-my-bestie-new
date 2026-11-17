"""
Point code at the animated WebP twins made by gif_to_webp_swap.py. Path-aware: a quoted path ending in .gif is only
rewritten if it resolves to a GIF listed in docs/gif-webp-swap-map.json (so the 7 flagged GIFs, and same-named files in
other folders, are left alone). Comments / regexes that merely mention ".gif" are untouched.

  python scripts/rewrite_gif_refs.py [--dry]
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
DRY = '--dry' in sys.argv
MAP = {r['gif']: r['webp'] for r in json.load(open('docs/gif-webp-swap-map.json'))}
SKIP_PARTS = ('backup', 'original', 'copy', 'oldflow', 'pre-scene', '.test.', 'node_modules', 'meaning cave', '/dev/')
LIVE_V = ('NewModakSceneV7.jsx', 'PondSceneSimplifiedV4.jsx', 'SymbolMountainSceneV3.jsx', 'SacredAssemblySceneV8.jsx')  # live files with a version in the name
PATH_RE = re.compile(r"""(['"`])((?:\.{1,2}/|/)[^'"`\n]*?\.gif)\1""")


def resolve(file, ref):
    if ref.startswith('/'):
        return os.path.normpath(os.path.join('public', ref.lstrip('/'))).replace('\\', '/')
    return os.path.normpath(os.path.join(os.path.dirname(file), ref)).replace('\\', '/')


changed = {}
for top in ('src',):
    for d, dirs, files in os.walk(top):
        for f in files:
            if not f.endswith(('.js', '.jsx', '.json')):
                continue
            p = os.path.join(d, f).replace('\\', '/')
            low = p.lower()
            if any(s in low for s in SKIP_PARTS) or (re.search(r'V\d', f) and f not in LIVE_V):
                continue
            s = open(p, encoding='utf-8').read()
            n = 0

            def sub(m):
                global n
                target = resolve(p, m.group(2))
                if target in MAP:
                    n += 1
                    return m.group(1) + m.group(2)[:-4] + '-anim.webp' + m.group(1)
                return m.group(0)

            s2 = PATH_RE.sub(sub, s)
            if n:
                changed[p] = n
                if not DRY:
                    open(p, 'w', encoding='utf-8', newline='').write(s2)
for p, n in sorted(changed.items()):
    print('%2d  %s' % (n, p))
print('%d references in %d files%s' % (sum(changed.values()), len(changed), ' (dry run)' if DRY else ''))
