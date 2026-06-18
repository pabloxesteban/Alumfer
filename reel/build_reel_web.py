#!/usr/bin/env python3
"""
Primer corte del reel "web como protagonista" (opción A).
Usa el recorrido real del sitio (reel/capture/clips/walkthrough.webm + E_contacto.webm)
y le agrega lower-thirds de marca + tarjeta CTA. Mudo (audio trending en IG).

Uso:   python3 reel/build_reel_web.py
Salida: reel/alumfer-reel-web.mp4
"""
import os, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "reel")
CLIPS = os.path.join(OUT_DIR, "capture", "clips")
WORK = os.path.join(OUT_DIR, "_web")
os.makedirs(WORK, exist_ok=True)

W, H, FPS = 1080, 1920, 30
XF = 0.45
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
CARBON, STEEL, BLUE, BLUE_LT = "0x1A1C1E", "0x2E3338", "0x1B6CC8", "0x4A9DE8"

WALK = os.path.join(CLIPS, "walkthrough.webm")
ECON = os.path.join(CLIPS, "E_contacto.webm")

_tmp = []
def tf(t):
    p = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, dir=WORK, encoding="utf-8")
    p.write(t); p.close(); _tmp.append(p.name); return p.name

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERR", " ".join(cmd[:8])); print(r.stderr[-1800:]); raise SystemExit(1)

def lower_third(kicker, title, pill=None):
    """Filtro de lower-third de marca sobre el footage."""
    k, t = tf(kicker), tf(title)
    f = (
        # scrim inferior para legibilidad
        f"drawbox=x=0:y={H-330}:w={W}:h=330:color=black@0.55:t=fill,"
        f"drawbox=x=64:y={H-205}:w=78:h=7:color={BLUE}:t=fill,"            # acento azul
        f"drawtext=fontfile={FONT_REG}:textfile={k}:fontcolor=0xE8E4DC:fontsize=34:x=64:y={H-262},"
        f"drawtext=fontfile={FONT_BOLD}:textfile={t}:fontcolor=white:fontsize=74:x=64:y={H-180}"
    )
    if pill:
        p = tf(pill)
        f = (f"drawbox=x=56:y=150:w=470:h=72:color={BLUE}:t=fill,"
             f"drawtext=fontfile={FONT_BOLD}:textfile={p}:fontcolor=white:fontsize=36:"
             f"x=86:y=170,") + f
    return f

def video_seg(idx, src, start, dur, kicker, title, pill=None):
    out = os.path.join(WORK, f"v{idx:02d}.mp4")
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,"
          f"fps={FPS}," + lower_third(kicker, title, pill) + ",format=yuv420p")
    run(["ffmpeg", "-y", "-ss", str(start), "-i", src, "-t", str(dur),
         "-vf", vf, "-an", "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out

def cta_card(idx, dur=3.0):
    out = os.path.join(WORK, f"v{idx:02d}.mp4")
    lines = [
        ("VISITÁ NUESTRO NUEVO SITIO", 44, FONT_REG, "0x9DB6CC", 980),
        ("alumfer.com.ar",            86, FONT_BOLD, BLUE_LT,    1050),
        ("Pedí tu presupuesto sin cargo", 40, FONT_REG, "0xE8E4DC", 1240),
        ("WhatsApp  11 6336 8643",    58, FONT_BOLD, "white",    1320),
        ("@alumfercarpinteria",       42, FONT_REG, "0x9DB6CC",  1420),
    ]
    draws = []
    for (txt, size, font, color, y) in lines:
        fp = tf(txt)
        draws.append(f"drawtext=fontfile={font}:textfile={fp}:fontcolor={color}:fontsize={size}:x=(w-text_w)/2:y={y}")
    filt = (f"[0:v]drawbox=x=0:y=0:w={W}:h=12:color={BLUE}:t=fill,"
            f"drawbox=x=0:y={H-12}:w={W}:h=12:color={BLUE}:t=fill," + ",".join(draws) + "[txt];"
            f"[1:v]scale=420:-1[lg];[txt][lg]overlay=x=(W-w)/2:y=470[v]")
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c={CARBON}:s={W}x{H}:r={FPS}:d={dur}",
         "-i", os.path.join(ROOT, "solologo.png"), "-filter_complex", filt, "-map", "[v]",
         "-t", str(dur), "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out

# ── Segmentos (footage real del sitio) ──
segs = []
segs.append(video_seg(0, WALK, 2.5, 3.1, "Carpintería de aluminio · Adrogué", "Aberturas a medida", pill="ESTRENAMOS SITIO"))
segs.append(video_seg(1, WALK, 7.9, 2.5, "Fabricantes directos", "15+ años de oficio"))
segs.append(video_seg(2, WALK, 10.5, 2.5, "Obras reales", "Mirá nuestros trabajos"))
segs.append(video_seg(3, WALK, 14.9, 3.8, "Catálogo completo", "Todas las líneas · DVH"))
segs.append(video_seg(4, WALK, 22.4, 2.1, "Reseñas verificadas", "4.5★ en Google"))
segs.append(video_seg(5, ECON, 3.3, 2.2, "Sin intermediarios", "Pedí tu cotización"))
segs.append(cta_card(6, 3.0))

# ── Ensamblado con xfade ──
n = len(segs)
durs = [3.1, 2.5, 2.5, 3.8, 2.1, 2.2, 3.0]
inputs = []
for s in segs:
    inputs += ["-i", s]
fc, prev, acc = "", "[0:v]", 0.0
for i in range(1, n):
    acc += durs[i-1] - XF
    label = f"[x{i}]" if i < n-1 else "[v]"
    fc += f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={round(acc,3)}{label};"
    prev = label
fc = fc.rstrip(";")

out_path = os.path.join(OUT_DIR, "alumfer-reel-web.mp4")
print("Ensamblando primer corte (web como protagonista)...")
run(["ffmpeg", "-y"] + inputs + ["-filter_complex", fc, "-map", "[v]",
     "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", "-r", str(FPS), out_path])

for f in _tmp:
    try: os.remove(f)
    except OSError: pass
total = sum(durs) - (n-1)*XF
print(f"\n✅ {out_path}\n   {n} segmentos · ~{total:.1f}s · {W}x{H} · {FPS}fps · sin audio")
