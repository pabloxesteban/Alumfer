#!/usr/bin/env python3
# Genera assets (textura de fondo, mockup iPhone, tarjetas serif) para el
# reel de lanzamiento estilo "OUR WEBSITE IS NOW LIVE" adaptado a Alumfer.
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

CAP = os.path.dirname(os.path.abspath(__file__))
NM  = os.path.join(CAP, "node_modules")
ASSETS = os.path.join(CAP, "assets")
os.makedirs(ASSETS, exist_ok=True)
W, H = 1080, 1920

# ── Convertir woff2 → ttf (ffmpeg/PIL necesitan ttf) ──
def woff2_ttf(pkg, name):
    src = os.path.join(NM, "@fontsource", pkg, "files", name + ".woff2")
    dst = os.path.join(ASSETS, name + ".ttf")
    if not os.path.exists(dst):
        f = TTFont(src); f.flavor = None; f.save(dst)
    return dst

PLAYFAIR   = woff2_ttf("playfair-display", "playfair-display-latin-500-normal")
PLAYFAIR_B = woff2_ttf("playfair-display", "playfair-display-latin-600-normal")
CORMORANT  = woff2_ttf("cormorant-garamond", "cormorant-garamond-latin-400-normal")
CORMORANT5 = woff2_ttf("cormorant-garamond", "cormorant-garamond-latin-500-normal")

# ── Textura de fondo: hormigón/yeso azul-gris (degradé + ruido fractal) ──
def make_texture():
    rng = np.random.default_rng(7)
    # gradiente vertical entre dos tonos fríos
    top = np.array([208, 213, 216], float)   # gris claro frío
    bot = np.array([168, 177, 184], float)   # gris azulado
    ramp = np.linspace(0, 1, H)[:, None]
    base = top[None, None, :] * (1 - ramp[:, :, None]) + bot[None, None, :] * ramp[:, :, None]
    base = np.repeat(base, W, axis=1)
    # ruido fractal (varias octavas) para textura de yeso
    noise = np.zeros((H, W), float)
    amp = 1.0
    for cells in [(6, 4), (12, 8), (24, 16), (48, 32)]:
        small = rng.random((cells[0], cells[1]))
        img = Image.fromarray((small * 255).astype('uint8')).resize((W, H), Image.BICUBIC)
        noise += amp * (np.asarray(img, float) / 255.0)
        amp *= 0.5
    noise = (noise - noise.min()) / (noise.max() - noise.min())
    base += (noise[:, :, None] - 0.5) * 22.0          # modulación sutil de brillo
    # luz radial suave (centro un poco más claro)
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = W * 0.5, H * 0.42
    d = np.sqrt(((xx - cx) / (W * 0.75)) ** 2 + ((yy - cy) / (H * 0.7)) ** 2)
    glow = np.clip(1 - d, 0, 1)
    base += glow[:, :, None] * 14.0
    # leve tinte azul de marca en las sombras
    blue = np.array([27, 108, 200], float)
    shadow = np.clip(1 - glow, 0, 1)[:, :, None]
    base = base * (1 - shadow * 0.05) + blue[None, None, :] * (shadow * 0.05)
    img = Image.fromarray(np.clip(base, 0, 255).astype('uint8'))
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img.save(os.path.join(ASSETS, "texture.png"))
    return img

# ── Helper: texto serif con tracking (letras espaciadas) ──
def draw_spaced(draw, cx, y, text, font, fill, tracking, align_center=True):
    widths = [draw.textbbox((0, 0), ch, font=font)[2] for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2 if align_center else cx
    for ch, wch in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += wch + tracking

def load(font, size):
    return ImageFont.truetype(font, size)

# ── Tarjeta INTRO: "NUESTRA WEB / YA ESTÁ ONLINE" + barra de búsqueda ──
def make_intro(texture):
    img = texture.copy().convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    white = (248, 250, 251, 235)
    soft  = (250, 251, 252, 255)
    f1 = load(CORMORANT, 92)
    f2 = load(PLAYFAIR, 96)
    draw_spaced(d, W/2, 560, "NUESTRA WEB", f1, white, 26)
    draw_spaced(d, W/2, 690, "YA ESTÁ ", f2, white, 14, align_center=False) if False else None
    # línea 2: "YA ESTÁ" + "ONLINE" (ONLINE más marcado)
    f2b = load(PLAYFAIR_B, 96)
    # construir centrada manualmente: "YA ESTÁ ONLINE"
    parts = [("YA ESTÁ ", f2, white, 14), ("ONLINE", f2b, soft, 14)]
    # medir total
    tot = 0
    for txt, fnt, _, tr in parts:
        ws = [d.textbbox((0,0),c,font=fnt)[2] for c in txt]
        tot += sum(ws) + tr*(len(txt)-1) if txt else 0
    x = W/2 - tot/2
    for txt, fnt, col, tr in parts:
        for c in txt:
            d.text((x, 700), c, font=fnt, fill=col)
            x += d.textbbox((0,0),c,font=fnt)[2] + tr
    # barra de búsqueda
    bx0, by0, bx1, by1 = 150, 880, 930, 980
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=50, outline=(255,255,255,210), width=3)
    fu = load(CORMORANT5, 46)
    d.text((bx0+44, by0+22), "alumfer.com.ar", font=fu, fill=(250,251,252,235))
    # lupa
    cxm, cym, r = bx1-70, (by0+by1)//2, 16
    d.ellipse([cxm-r, cym-r, cxm+r, cym+r], outline=(255,255,255,210), width=3)
    d.line([cxm+r*0.7, cym+r*0.7, cxm+r*1.5, cym+r*1.5], fill=(255,255,255,210), width=3)
    img.save(os.path.join(ASSETS, "intro.png"))

# ── Tarjeta OUTRO: logo ALUMFER serif + datos ──
def make_outro(texture):
    img = texture.copy().convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    white = (250, 251, 252, 240)
    f = load(PLAYFAIR, 150)
    draw_spaced(d, W/2, 720, "ALUMFER", f, white, 22)
    fs = load(CORMORANT5, 50)
    draw_spaced(d, W/2, 905, "CARPINTERÍA DE ALUMINIO", fs, (250,251,252,210), 16)
    # regla fina
    d.line([W/2-90, 1000, W/2+90, 1000], fill=(255,255,255,180), width=2)
    fd = load(CORMORANT5, 44)
    draw_spaced(d, W/2, 1060, "alumfer.com.ar", fd, white, 6)
    draw_spaced(d, W/2, 1130, "WhatsApp 11 6336 8643", fd, (250,251,252,200), 4)
    img.save(os.path.join(ASSETS, "outro.png"))

# ── Marco iPhone sobre la textura, con pantalla recortada (transparente) ──
SCREEN = dict(w=600, h=1067, x=(W-600)//2, y=486)   # zona de la pantalla (footage)
def make_phone_frame(texture):
    sx, sy, sw, sh = SCREEN['x'], SCREEN['y'], SCREEN['w'], SCREEN['h']
    bez_s, bez_t, bez_b = 20, 28, 28
    bx0, by0 = sx - bez_s, sy - bez_t
    bx1, by1 = sx + sw + bez_s, sy + sh + bez_b
    base = texture.copy().convert("RGBA")
    # sombra
    sh_layer = Image.new("RGBA", (W, H), (0,0,0,0))
    sd = ImageDraw.Draw(sh_layer)
    sd.rounded_rectangle([bx0, by0+34, bx1, by1+44], radius=90, fill=(20,24,28,150))
    sh_layer = sh_layer.filter(ImageFilter.GaussianBlur(40))
    base = Image.alpha_composite(base, sh_layer)
    # cuerpo del teléfono
    body = Image.new("RGBA", (W, H), (0,0,0,0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([bx0, by0, bx1, by1], radius=88, fill=(16,17,19,255))          # cuerpo
    bd.rounded_rectangle([bx0, by0, bx1, by1], radius=88, outline=(82,90,98,255), width=3)  # rim titanio
    bd.rounded_rectangle([bx0+5, by0+5, bx1-5, by1-5], radius=84, outline=(8,9,10,255), width=4)
    base = Image.alpha_composite(base, body)
    # recortar la pantalla (transparente) con esquinas redondeadas
    hole = Image.new("L", (W, H), 0)
    hd = ImageDraw.Draw(hole)
    hd.rounded_rectangle([sx, sy, sx+sw, sy+sh], radius=58, fill=255)
    px = np.array(base)
    px[..., 3] = np.where(np.array(hole) > 0, 0, px[..., 3])   # alpha=0 en la pantalla
    base = Image.fromarray(px, "RGBA")
    # dynamic island (encima del footage)
    di = ImageDraw.Draw(base)
    iw, ih = 132, 36
    ix, iy = sx + (sw-iw)//2, sy + 22
    di.rounded_rectangle([ix, iy, ix+iw, iy+ih], radius=18, fill=(6,6,7,255))
    # caption superior serif
    cap = ImageDraw.Draw(base, "RGBA")
    fc = load(CORMORANT5, 50)
    draw_spaced(cap, W/2, 300, "EL NUEVO SITIO, EN TU TELÉFONO", fc, (60,66,72,255), 8)
    base.convert("RGBA").save(os.path.join(ASSETS, "phone_frame.png"))

tex = make_texture()
make_intro(tex)
make_outro(tex)
make_phone_frame(tex)
print("assets OK:", os.listdir(ASSETS))
print("SCREEN", SCREEN)
