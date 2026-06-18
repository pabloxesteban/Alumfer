#!/usr/bin/env python3
"""
Reel MOBILE — simulación de usuario real (opción A v2).
Fuente: reel/capture/clips/mobile-journey.webm (recorrido humanizado, layout
responsive 720x1280) escalado a 1080x1920. Narrativa en 4 actos.
Mudo (audio trending en IG).

Uso:   python3 reel/build_reel_mobile.py
Salida: reel/alumfer-reel-mobile.mp4
"""
import os, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "reel")
CLIPS = os.path.join(OUT_DIR, "capture", "clips")
WORK = os.path.join(OUT_DIR, "_mob")
os.makedirs(WORK, exist_ok=True)

W, H, FPS = 1080, 1920, 30
XF = 0.4
FB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
CARBON, BLUE, BLUE_LT = "0x1A1C1E", "0x1B6CC8", "0x4A9DE8"
SRC = os.path.join(CLIPS, "mobile-journey.webm")

_tmp = []
def tf(t):
    p = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, dir=WORK, encoding="utf-8")
    p.write(t); p.close(); _tmp.append(p.name); return p.name
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERR", " ".join(cmd[:8])); print(r.stderr[-1800:]); raise SystemExit(1)

def lower(kicker, title, pill=None):
    # Lower-third por encima de la barra sticky inferior del sitio (~96px)
    BY = H - 250
    k, t = tf(kicker), tf(title)
    f = (f"drawbox=x=0:y={BY-60}:w={W}:h=320:color=black@0.0:t=fill,"  # placeholder
         f"drawbox=x=0:y={BY-44}:w={W}:h=200:color=black@0.45:t=fill,"
         f"drawbox=x=56:y={BY+2}:w=70:h=6:color={BLUE}:t=fill,"
         f"drawtext=fontfile={FR}:textfile={k}:fontcolor=0xCFE0F0:fontsize=30:x=56:y={BY-38},"
         f"drawtext=fontfile={FB}:textfile={t}:fontcolor=white:fontsize=62:x=56:y={BY+20}")
    if pill:
        p = tf(pill)
        f = (f"drawbox=x=48:y=210:w=430:h=66:color={BLUE}:t=fill,"
             f"drawtext=fontfile={FB}:textfile={p}:fontcolor=white:fontsize=33:x=76:y=228,") + f
    return f

def seg(idx, start, dur, kicker, title, pill=None):
    out = os.path.join(WORK, f"s{idx:02d}.mp4")
    vf = (f"scale={W}:{H}:flags=lanczos,setsar=1,fps={FPS}," + lower(kicker, title, pill) + ",format=yuv420p")
    run(["ffmpeg", "-y", "-ss", str(start), "-i", SRC, "-t", str(dur),
         "-vf", vf, "-an", "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out, dur

def cta(idx, dur=3.6):
    out = os.path.join(WORK, f"s{idx:02d}.mp4")
    lines = [
        ("Diseño · Calidad · Precisión", 46, FR, "0x9DB6CC", 880),
        ("Transformamos tu espacio",     64, FB, "white",    955),
        ("alumfer.com.ar",               80, FB, BLUE_LT,    1130),
        ("Presupuesto sin cargo · WhatsApp 11 6336 8643", 36, FR, "0xE8E4DC", 1300),
        ("@alumfercarpinteria",          40, FR, "0x9DB6CC", 1380),
    ]
    draws = []
    for (txt, size, font, color, y) in lines:
        fp = tf(txt)
        draws.append(f"drawtext=fontfile={font}:textfile={fp}:fontcolor={color}:fontsize={size}:x=(w-text_w)/2:y={y}")
    filt = (f"[0:v]drawbox=x=0:y=0:w={W}:h=12:color={BLUE}:t=fill,"
            f"drawbox=x=0:y={H-12}:w={W}:h=12:color={BLUE}:t=fill," + ",".join(draws) + "[txt];"
            f"[1:v]scale=400:-1[lg];[txt][lg]overlay=x=(W-w)/2:y=470[v]")
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c={CARBON}:s={W}x{H}:r={FPS}:d={dur}",
         "-i", os.path.join(ROOT, "solologo.png"), "-filter_complex", filt, "-map", "[v]",
         "-t", str(dur), "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out, dur

# ── ACTOS (tiempos sobre mobile-journey.webm) ──
plan = []
# ACTO 1 · HOOK
plan.append(seg(0, 3.6, 3.2, "Carpintería de aluminio · Adrogué", "Estrenamos sitio", pill="NUEVO SITIO WEB"))
# ACTO 2 · DESCUBRIMIENTO (experiencia mobile)
plan.append(seg(1, 10.2, 1.8, "Pensado para tu teléfono", "Navegación fluida"))
plan.append(seg(2, 13.6, 2.6, "Obras reales", "Mirá nuestros trabajos"))
# ACTO 3 · EXPLORACIÓN (galería + catálogo = confianza)
plan.append(seg(3, 16.2, 2.8, "Cada detalle importa", "Calidad que se ve"))
plan.append(seg(4, 23.8, 3.8, "Catálogo completo", "Todas las líneas · DVH"))
plan.append(seg(5, 30.6, 2.2, "Reseñas verificadas", "4.5★ en Google"))
# ACTO 4 · CIERRE
plan.append(seg(6, 34.6, 2.6, "Sin intermediarios", "Pedí tu presupuesto"))
plan.append(cta(7, 3.6))

segs = [p[0] for p in plan]
durs = [p[1] for p in plan]
n = len(segs)
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

out_path = os.path.join(OUT_DIR, "alumfer-reel-mobile.mp4")
print("Ensamblando reel mobile (usuario real)...")
run(["ffmpeg", "-y"] + inputs + ["-filter_complex", fc, "-map", "[v]",
     "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", "-r", str(FPS), out_path])
for f in _tmp:
    try: os.remove(f)
    except OSError: pass
total = sum(durs) - (n-1)*XF
print(f"\n✅ {out_path}\n   {n} segmentos · ~{total:.1f}s · {W}x{H} · {FPS}fps · sin audio")
