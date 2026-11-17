"""
Fit a blink animation (GIF / animated WebP) onto an existing static picture, so it can replace that picture
without any size or position change. The blink's content is scaled to the static picture's content box and
aligned bottom-centre on the same canvas (optionally scaled down by k to save bytes). The last frame gets a rest
so the blink repeats with a pause; the result loops forever. Needs only Pillow.

  python scripts/fit_blink_to_static.py BLINK STATIC OUT [k=1.0] [rest_ms=2500]
"""
import io, sys
from PIL import Image


def frames(path):
    im = Image.open(path)
    fr, du = [], []
    for i in range(im.n_frames):
        im.seek(i)
        fr.append(im.convert('RGBA'))
        du.append(int(im.info.get('duration', 80)))
    return fr, du


def solid_bbox(img, thr=24):
    # bounding box of the clearly visible pixels: faint specks / halos must not inflate the measured size
    return img.getchannel('A').point(lambda v: 255 if v > thr else 0).getbbox()


def union_bbox(fr):
    b = None
    for f in fr:
        x = solid_bbox(f)
        b = x if b is None else (min(b[0], x[0]), min(b[1], x[1]), max(b[2], x[2]), max(b[3], x[3]))
    return b


def fit(blink, static, out, k=1.0, rest=2500):
    fr, du = frames(blink)
    st = Image.open(static).convert('RGBA')
    W, H = st.size
    sb, fb = solid_bbox(st), union_bbox(fr)
    sw, sh, fw, fh = sb[2] - sb[0], sb[3] - sb[1], fb[2] - fb[0], fb[3] - fb[1]
    s = min(sh / fh, sw / fw) * k
    cw, ch = int(round(W * k)), int(round(H * k))
    bx, by = (sb[0] + sb[2]) / 2 * k, sb[3] * k
    res = []
    for f in fr:
        c = f.crop(fb).resize((max(1, int(round(fw * s))), max(1, int(round(fh * s)))), Image.LANCZOS)
        cv = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        cv.alpha_composite(c, (int(round(bx - c.width / 2)), int(round(by - c.height))))
        res.append(cv)
    du = du[:-1] + [du[-1] + rest]
    buf = io.BytesIO()
    res[0].save(buf, 'WEBP', save_all=True, append_images=res[1:], duration=du, loop=0,
                quality=82, alpha_quality=100, method=4)
    open(out, 'wb').write(buf.getvalue())
    print('%s  canvas %dx%d  content %dx%d vs static %dx%d  %d KB' % (
        out.replace('\\', '/').split('/')[-1], cw, ch, fw * s, fh * s, sw * k, sh * k, len(buf.getvalue()) // 1024))


if __name__ == '__main__':
    a = sys.argv[1:]
    fit(a[0], a[1], a[2], float(a[3]) if len(a) > 3 else 1.0, int(a[4]) if len(a) > 4 else 2500)
