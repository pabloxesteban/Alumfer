#!/usr/bin/env python3
"""
Reel de lanzamiento estilo "OUR WEBSITE IS NOW LIVE" (referencia Libra Interiors)
adaptado a Alumfer:
  1) Fondo = textura/degradé hormigón azul-gris generada (no Unsplash).
  2) iPhone (en vez de laptop) mostrando la web responsive real.

Requiere: python3 reel/capture/make_assets.py (genera assets/).
Uso:    python3 reel/build_launch_reel.py
Salida: reel/alumfer-reel-launch.mp4  (mudo, para audio trending)
"""
import os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "reel")
CAP = os.path.join(OUT_DIR, "capture")
ASSETS = os.path.join(CAP, "assets")
WORK = os.path.join(OUT_DIR, "_launch")
os.makedirs(WORK, exist_ok=True)
W, H, FPS = 1080, 1920, 30
XF = 0.6
FOOT = os.path.join(CAP, "clips", "mobile-journey.webm")

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERR", " ".join(cmd[:8])); print(r.stderr[-1800:]); raise SystemExit(1)

def still(name, dur, zoom_to=1.06):
    """Imagen estática con zoom lento premium."""
    out = os.path.join(WORK, name + ".mp4")
    frames = int(dur * FPS)
    vf = (f"scale={W}:{H},setsar=1,"
          f"zoompan=z='min(zoom+{(zoom_to-1)/frames:.6f},{zoom_to})':d={frames}:"
          f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},format=yuv420p")
    run(["ffmpeg", "-y", "-loop", "1", "-i", os.path.join(ASSETS, name + ".png"),
         "-t", str(dur), "-r", str(FPS), "-vf", vf,
         "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out, dur

def phone_scene(dur, foot_start):
    """iPhone con la web responsive adentro, sobre la textura."""
    out = os.path.join(WORK, "phone.mp4")
    sx, sy, sw, sh = 240, 486, 600, 1067
    fc = (f"[1:v]scale={sw}:{sh},setsar=1[scr];"
          f"[0:v][scr]overlay={sx}:{sy}[t];"
          f"[t][2:v]overlay=0:0[v]")
    run(["ffmpeg", "-y",
         "-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:r={FPS}:d={dur}",
         "-ss", str(foot_start), "-t", str(dur), "-i", FOOT,
         "-loop", "1", "-t", str(dur), "-i", os.path.join(ASSETS, "phone_frame.png"),
         "-filter_complex", fc, "-map", "[v]", "-t", str(dur),
         "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", out])
    return out, dur

# ── Escenas (estructura de la referencia) ──
plan = [
    still("intro", 3.8),          # "NUESTRA WEB YA ESTÁ ONLINE" + buscador
    phone_scene(8.0, 3.5),        # iPhone con la web responsive
    still("outro", 3.8),          # logo ALUMFER + datos
]
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

out_path = os.path.join(OUT_DIR, "alumfer-reel-launch.mp4")
print("Ensamblando reel de lanzamiento (textura + iPhone)...")
run(["ffmpeg", "-y"] + inputs + ["-filter_complex", fc, "-map", "[v]",
     "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", "-r", str(FPS), out_path])
total = sum(durs) - (n - 1) * XF
print(f"\n✅ {out_path}\n   {n} escenas · ~{total:.1f}s · {W}x{H} · {FPS}fps · sin audio")
