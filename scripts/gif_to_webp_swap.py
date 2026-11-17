"""
Regenerate <name>-anim.webp for every project GIF EXCEPT the flagged ones (their WebP versions come from the artist),
exactly matching the GIF's frame delays and loop setting (play-once stays play-once, the baked rest is kept).
Then print the map  gif path -> webp path  as JSON to docs/gif-webp-swap-map.json for the reference rewrite.

  python scripts/gif_to_webp_swap.py
"""
import io, json, os
from multiprocessing import Pool
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SKIP = ('meaning cave', 'backup', '_worktree', 'node_modules', '.claude', 'dist', 'tmp', 'scratch', 'deliverables')
KEEP_AS_GIF = {   # flagged in the comparison page: the artist is supplying WebP versions
    'public/intro-story/story-s5-family.gif',
    'src/zones/about-me-hut/family-tree/assets/images/ganesha-gifs/kartikeya.gif',
    'src/zones/about-me-hut/family-tree/assets/images/ganesha-gifs/parvati.gif',
    'src/zones/shloka-river/scenes/Scene1/assets/images/mahakaya/aboard-peacock.gif',
    'src/zones/shloka-river/scenes/scene4/assets/images/sarvakaryeshu/eyes-layers/boy-after.gif',
    'src/zones/shloka-river/shared/images/symbol-gifs/samaprabha.gif',
    'src/zones/symbol-mountain/scenes/tusk/assets/images-opt/margin35/success-gifs/peacock_happy_feather.gif',
}


def find_gifs():
    out = []
    for top in ('src', 'public'):
        for d, dirs, files in os.walk(top):
            dirs[:] = [x for x in dirs if not any(s in os.path.join(d, x).lower() for s in SKIP)]
            for f in files:
                p = os.path.join(d, f).replace('\\', '/')
                if f.lower().endswith('.gif') and not any(s in d.lower() for s in SKIP):
                    out.append(p)
    return sorted(out)


def convert(path):
    raw = open(path, 'rb').read()
    infinite = b'NETSCAPE2.0' in raw
    im = Image.open(path)
    frames, durs = [], []
    for i in range(im.n_frames):
        im.seek(i)
        frames.append(im.convert('RGBA'))
        durs.append(int(im.info.get('duration', 100)))
    out = path[:-4] + '-anim.webp'
    buf = io.BytesIO()
    frames[0].save(buf, 'WEBP', save_all=True, append_images=frames[1:], duration=durs,
                   loop=0 if infinite else 1, quality=80, alpha_quality=100, method=4)
    open(out, 'wb').write(buf.getvalue())
    w = Image.open(out)
    ok = w.n_frames == len(frames) and w.info.get('loop') == (0 if infinite else 1)
    return dict(gif=path, webp=out, gif_kb=len(raw) / 1024, webp_kb=len(buf.getvalue()) / 1024,
                frames=len(frames), loop='loop' if infinite else 'once', ok=ok)


if __name__ == '__main__':
    todo = [p for p in find_gifs() if p not in KEEP_AS_GIF]
    with Pool(4) as pool:
        rows = pool.map(convert, todo)
    bad = [r for r in rows if not r['ok']]
    json.dump(rows, open('docs/gif-webp-swap-map.json', 'w'), indent=1)
    tg, tw = sum(r['gif_kb'] for r in rows), sum(r['webp_kb'] for r in rows)
    print('converted %d GIFs (kept %d as GIF): %.1f MB -> %.1f MB (%.0f%% saved); mismatches: %d'
          % (len(rows), len(KEEP_AS_GIF), tg / 1024, tw / 1024, 100 * (1 - tw / tg), len(bad)))
    for r in bad:
        print('MISMATCH', r['gif'])
