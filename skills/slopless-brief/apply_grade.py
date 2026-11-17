"""Apply a slopless grade preset to an image, or build a strip of several presets on one frame.
usage: apply_grade.py in.png out.png golden-warm
       apply_grade.py in.png strip.png --strip golden-warm cool-dawn moody-green
       apply_grade.py in.png out.png --from-ref reference.jpg     (derive a grade from a reference image, print it, apply it)"""
import json, sys, pathlib
import numpy as np
from PIL import Image, ImageDraw
G = json.load(open(pathlib.Path(__file__).with_name('grades.json')))
rgb = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255
def grade(img, name):
    g = G[name]; a = np.asarray(img.convert('RGB'), dtype=np.float32) / 255
    t = rgb(g['wash'][0]); a = a * g['exposure'] * (1 + g['wash'][1] * (t / t.max() - 1))      # overall colour wash + exposure
    L = (a * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
    ws, wh = (1 - L) ** 2, L ** 2                                   # shadow / highlight weights
    a = a + ws * g['shadows'][1] * (rgb(g['shadows'][0]) - 0.5) * 2 + wh * g['highlights'][1] * (rgb(g['highlights'][0]) - 0.5) * 2
    L2 = (a * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
    a = L2 + (a - L2) * g['saturation']
    a = (a - 0.5) * g['contrast'] + 0.5
    a = g['fade'] + a * (1 - g['fade'])                             # lifted blacks
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
def from_ref(ref):
    """Derive a grade from a reference image: average colour of its darkest and brightest quarters, its saturation and its black level."""
    a = np.asarray(ref.convert('RGB').resize((320, 180)), dtype=np.float32).reshape(-1, 3) / 255
    L = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32); o = np.argsort(L); q = len(o) // 4
    hexc = lambda c: '#' + ''.join(f'{int(round(float(v) * 255)):02x}' for v in np.clip(c, 0, 1))
    norm = lambda c: c / max(float(c.max()), 1e-3)
    sat = float(np.mean((a.max(1) - a.min(1)) / (a.max(1) + 1e-3))); mid = a[o[q:-q]].mean(0)
    return {"mood": "from reference", "shadows": [hexc(norm(a[o[:q]].mean(0)) * .5), 0.2], "highlights": [hexc(norm(a[o[-q:]].mean(0))), 0.15],
            "wash": [hexc(norm(mid)), 0.45], "exposure": round(float(np.clip(0.55 + L.mean(), .7, 1.05)), 2),
            "saturation": round(float(np.clip(sat / 0.42, .3, 1.15)), 2), "contrast": round(float(np.clip(0.8 + L.std() * 1.4, .9, 1.25)), 2), "fade": round(float(np.clip(L[o[len(o)//50]], 0, .12)), 2)}
if __name__ == '__main__':
    src = Image.open(sys.argv[1])
    if sys.argv[3] == '--from-ref':
        G['ref'] = from_ref(Image.open(sys.argv[4])); print(json.dumps(G['ref'])); grade(src, 'ref').save(sys.argv[2]); sys.exit()
    if sys.argv[3] == '--strip':
        names = sys.argv[4:]; w = 640; h = round(src.height * w / src.width); cols = min(3, len(names)); rows = -(-len(names) // cols)
        sheet = Image.new('RGB', (w * cols, h * rows)); small = src.resize((w, h))
        for i, n in enumerate(names):
            im = grade(small, n); d = ImageDraw.Draw(im); d.rectangle([0, h - 34, w, h], fill=(0, 0, 0)); d.text((12, h - 26), f"{n}  ·  {G[n]['mood']}", fill=(255, 255, 255))
            sheet.paste(im, ((i % cols) * w, (i // cols) * h))
        sheet.save(sys.argv[2])
    else:
        grade(src, sys.argv[3]).save(sys.argv[2])
