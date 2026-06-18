#!/usr/bin/env python3
"""
Genera un reel vertical (1080x1920) para Instagram presentando el sitio de Alumfer.
Ensambla fotos de obra reales con efecto Ken Burns, textos de marca y transiciones.

Uso:  python3 reel/build_reel.py
Salida: reel/alumfer-reel.mp4

Sin audio a propósito: agregá un audio en tendencia desde Instagram al subirlo.
"""
import os
import subprocess
import tempfile

# ─── Rutas y constantes ──────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "reel")
WORK = os.path.join(OUT_DIR, "_clips")
os.makedirs(WORK, exist_ok=True)

W, H = 1080, 1920
FPS = 30
DUR = 3.4          # duración de cada segmento (s)
XF = 0.6           # duración de la transición (s)

FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# Paleta de marca (tokens.css)
CARBON = "0x1A1C1E"
STEEL  = "0x2E3338"
BLUE   = "0x1B6CC8"

# ─── Helper: escribir texto a archivo (evita problemas de escaping) ──
_tmpfiles = []
def tf(text):
    p = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, dir=WORK, encoding="utf-8")
    p.write(text)
    p.close()
    _tmpfiles.append(p.name)
    return p.name

def drawtext(textfile, x, y, size, font=FONT_BOLD, color="white", line_spacing=0):
    return (f"drawtext=fontfile={font}:textfile={textfile}:fontcolor={color}:"
            f"fontsize={size}:x={x}:y={y}:line_spacing={line_spacing}")

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERROR:", " ".join(cmd[:6]), "...")
        print(r.stderr[-2000:])
        raise SystemExit(1)

# ─── Segmento tipo FOTO (Ken Burns + barra + textos) ────────────────
def photo_clip(idx, img, kicker, title, subtitle):
    out = os.path.join(WORK, f"seg{idx:02d}.mp4")
    frames = int(DUR * FPS)
    k = tf(kicker)
    t = tf(title)
    s = tf(subtitle)

    vf = (
        # Rellenar el encuadre vertical
        f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,"
        # Ken Burns: zoom lento hacia adentro
        f"zoompan=z='min(zoom+0.0009,1.16)':d={frames}:"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        # Oscurecido general suave para legibilidad
        f"drawbox=x=0:y=0:w={W}:h={H}:color=black@0.18:t=fill,"
        # Barra inferior para textos
        f"drawbox=x=0:y={H-470}:w={W}:h=470:color=black@0.62:t=fill,"
        # Acento azul (línea de identidad)
        f"drawbox=x=80:y={H-360}:w=90:h=8:color={BLUE}:t=fill,"
        # Kicker (categoría pequeña arriba a la izquierda)
        f"drawbox=x=80:y=110:w=14:h=58:color={BLUE}:t=fill,"
        + drawtext(k, x=110, y=118, size=40, color="white") + ","
        # Título grande
        + drawtext(t, x=80, y=H-320, size=92, color="white") + ","
        # Subtítulo
        + drawtext(s, x=80, y=H-180, size=44, font=FONT_REG, color="0xE8E4DC")
    )
    run(["ffmpeg", "-y", "-loop", "1", "-i", os.path.join(ROOT, img),
         "-t", str(DUR), "-r", str(FPS), "-vf", vf,
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", out])
    return out

# ─── Segmento tipo TARJETA (fondo de color sólido + textos) ─────────
def card_clip(idx, lines, bg=CARBON, logo=None):
    """lines: lista de (texto, size, font, color, dy) centrados horizontalmente."""
    out = os.path.join(WORK, f"seg{idx:02d}.mp4")
    src = f"color=c={bg}:s={W}x{H}:r={FPS}:d={DUR}"
    parts = [src]
    inputs = ["ffmpeg", "-y", "-f", "lavfi", "-i", src]

    filt = "[0:v]"
    # textura sutil: dos cajas tenues
    filt += f"drawbox=x=0:y=0:w={W}:h=14:color={BLUE}:t=fill,"
    filt += f"drawbox=x=0:y={H-14}:w={W}:h=14:color={BLUE}:t=fill,"

    overlay_logo = ""
    if logo:
        inputs += ["-i", os.path.join(ROOT, logo)]
        # el logo se compone como segunda entrada; lo escalamos y centramos arriba
        filt = (f"[1:v]scale=460:-1[lg];[0:v]"
                f"drawbox=x=0:y=0:w={W}:h=14:color={BLUE}:t=fill,"
                f"drawbox=x=0:y={H-14}:w={W}:h=14:color={BLUE}:t=fill,")
        overlay_logo = True

    draws = []
    for (text, size, font, color, dy) in lines:
        fpath = tf(text)
        draws.append(
            f"drawtext=fontfile={font}:textfile={fpath}:fontcolor={color}:"
            f"fontsize={size}:x=(w-text_w)/2:y={dy}")
    filt += ",".join(draws)

    if overlay_logo:
        filt += "[txt];[txt][lg]overlay=x=(W-w)/2:y=300[v]"
        run(inputs + ["-filter_complex", filt, "-map", "[v]",
                      "-t", str(DUR), "-r", str(FPS),
                      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", out])
    else:
        run(inputs + ["-vf", filt, "-t", str(DUR), "-r", str(FPS),
                      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", out])
    return out

# ─── Definición del reel ─────────────────────────────────────────────
segments = []

# 1) Intro de marca
segments.append(card_clip(0, [
    ("ALUMFER",                 150, FONT_BOLD, "white",      720),
    ("CARPINTERÍA DE ALUMINIO", 50,  FONT_REG,  "0xE8E4DC",   900),
    ("Zona Sur · GBA",          44,  FONT_REG,  "0x9DB6CC",   985),
]))

# 2-7) Showcase de obras (foto, kicker, título, subtítulo)
showcase = [
    ("obra-ventanas-3.jpg",   "ABERTURAS",     "Ventanas a medida",      "Línea Modena · A30 · Herrero"),
    ("obra-puertas-3.jpg",    "ABERTURAS",     "Puertas y frentes",      "Diseño, hermeticidad y seguridad"),
    ("obra-portones-1.jpg",   "EXTERIORES",    "Portones",               "Corredizos y levadizos"),
    ("obra-quincho-1.jpeg",   "CERRAMIENTOS",  "Cerramientos y quinchos","Ampliá tus espacios todo el año"),
    ("obra-techo2.jpeg",      "CUBIERTAS",     "Techos y policarbonato", "Alveolar y compacto"),
    ("mosquitero1.jpeg",      "COMPLEMENTOS",  "Mosquiteros y barandas", "Terminación prolija a medida"),
]
for i, (img, k, t, s) in enumerate(showcase, start=1):
    segments.append(photo_clip(i, img, k, t, s))

# 8) Anuncio del sitio web
segments.append(card_clip(7, [
    ("YA ESTAMOS ONLINE",  46,  FONT_REG,  "0x9DB6CC",  640),
    ("NUEVO",              150, FONT_BOLD, "white",     720),
    ("SITIO WEB",          150, FONT_BOLD, "white",     880),
    ("alumfer.com.ar",     72,  FONT_BOLD, "0x4A9DE8", 1120),
], bg=STEEL))

# 9) CTA final
segments.append(card_clip(8, [
    ("PEDÍ TU PRESUPUESTO",   62,  FONT_BOLD, "white",     780),
    ("Sin cargo · Respuesta en 24 hs", 40, FONT_REG, "0xE8E4DC", 870),
    ("WhatsApp  11 6336 8643", 60, FONT_BOLD, "0x4A9DE8", 1080),
    ("@alumfercarpinteria",    46, FONT_REG,  "0x9DB6CC", 1180),
], bg=CARBON, logo="solologo.png"))

# ─── Ensamblado con transiciones xfade ──────────────────────────────
n = len(segments)
inputs = []
for seg in segments:
    inputs += ["-i", seg]

# Cadena de xfade
fc = ""
prev = "[0:v]"
step = DUR - XF
for i in range(1, n):
    offset = round(i * step, 3)
    label = f"[x{i}]" if i < n - 1 else "[v]"
    fc += f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={offset}{label};"
    prev = label
fc = fc.rstrip(";")

out_path = os.path.join(OUT_DIR, "alumfer-reel.mp4")
cmd = ["ffmpeg", "-y"] + inputs + [
    "-filter_complex", fc, "-map", "[v]",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
    "-movflags", "+faststart", "-r", str(FPS), out_path]
print("Ensamblando reel final...")
run(cmd)

# limpieza de textos temporales
for f in _tmpfiles:
    try: os.remove(f)
    except OSError: pass

total = n * DUR - (n - 1) * XF
print(f"\n✅ Listo: {out_path}")
print(f"   {n} segmentos · {total:.1f}s · {W}x{H} · {FPS}fps")
