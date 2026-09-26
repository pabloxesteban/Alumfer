"""Genera video/homepage-walkthrough.mp4 (1920x1080, 30 fps).

Escenas: placa de apertura -> escritorio a pantalla completa con pausas en cada
sección -> celular en grande con pausas -> placa de cierre, unidas con fundidos.

Usa las capturas de _raw/video/ (capturar-video.mjs) y las placas que genera
exportar.mjs. Los elementos fijos del sitio (barra de navegación y barra
inferior del celular) se superponen por separado, como se comportan en el sitio.

Requiere ffmpeg (por ejemplo: pip install imageio-ffmpeg).
"""
import json
import os
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', '_raw', 'video')
OUT = os.path.join(HERE, '..', 'video', 'homepage-walkthrough.mp4')
FPS = 30
W, H = 1920, 1080

try:
    import imageio_ffmpeg
    FFMPEG = os.environ.get('FFMPEG') or imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')

meta = json.load(open(os.path.join(RAW, 'meta.json')))


def timeline(stops, first_hold=2.6, hold=2.2, last_hold=2.6):
    """Lista de tramos (t0, t1, y0, y1): pausas y desplazamientos entre paradas."""
    segs, t = [], 0.0
    for i, y in enumerate(stops):
        h = first_hold if i == 0 else (last_hold if i == len(stops) - 1 else hold)
        segs.append((t, t + h, y, y))
        t += h
        if i + 1 < len(stops):
            dist = abs(stops[i + 1] - y)
            d = min(2.6, max(1.5, 1.0 + dist / 900))   # más distancia, más tiempo
            segs.append((t, t + d, y, stops[i + 1]))
            t += d
    return segs, t


def y_expr(segs, scale):
    """Expresión de ffmpeg para la posición vertical, con aceleración y frenado."""
    expr = str(segs[-1][3] * scale)
    for t0, t1, y0, y1 in reversed(segs):
        if y0 == y1:
            part = f'{y0 * scale}'
        else:
            p = f'((t-{t0:.4f})/{t1 - t0:.4f})'
            ease = f'if(lt({p},0.5),4*{p}*{p}*{p},1-pow(-2*{p}+2,3)/2)'
            part = f'{y0 * scale}+{(y1 - y0) * scale}*{ease}'
        expr = f'if(lt(t,{t1:.4f}),{part},{expr})'
    return expr


def section(m, sel, offset=0):
    return max(0, min(m['sections'][sel] - m['navH'] + offset, m['height'] - VIEW[m['kind']]))


d, mo = meta['desk'], meta['mob']
d['kind'], mo['kind'] = 'desk', 'mob'
VIEW = {'desk': 810, 'mob': mo['viewportH']}   # escritorio: ventana 1440x810 (16:9)

desk_stops = [0,
              section(d, '#nosotros'),
              section(d, '#trabajos'),
              section(d, '.process-section'),
              section(d, '#productos', 380),
              section(d, 'section[aria-labelledby=reviews-title]'),
              section(d, '#faq'),
              section(d, '#contacto'),
              d['height'] - VIEW['desk']]
mob_stops = [0,
             section(mo, '#trabajos'),
             section(mo, '#productos'),
             section(mo, 'section[aria-labelledby=reviews-title]'),
             section(mo, '#contacto')]

dseg, dlen = timeline(desk_stops)
mseg, mlen = timeline(mob_stops)
INTRO, OUTRO, XF = 3.6, 3.6, 0.8

# Celular: pantalla de 900 px de alto centrada
PH = 900
PW = round(mo['width'] * PH / mo['viewportH'])
PX, PY = (W - PW) // 2, (H - PH) // 2
R = 44  # radio de las esquinas de la pantalla

nav_switch = dseg[0][1] + 0.25   # la barra pasa a sólida al empezar a bajar
mnav_switch = mseg[0][1] + 0.25

fg = f"""
[0:v]format=rgb24,crop={d['width'] * 2}:{VIEW['desk'] * 2}:0:'{y_expr(dseg, 2)}',scale={W}:{H}:flags=lanczos,setsar=1[dpage];
[1:v]scale={W}:-1:flags=lanczos[dnav0];
[2:v]scale={W}:-1:flags=lanczos[dnav1];
[dpage][dnav0]overlay=0:0:enable='lt(t,{nav_switch:.3f})'[d1];
[d1][dnav1]overlay=0:0:enable='gte(t,{nav_switch:.3f})',fps={FPS},format=yuv420p[desk];

[3:v]format=rgb24,crop={mo['width'] * 3}:{mo['viewportH'] * 3}:0:'{y_expr(mseg, 3)}',scale={PW}:{PH}:flags=lanczos,setsar=1[mpage];
[4:v]scale={PW}:-1:flags=lanczos[mnav0];
[5:v]scale={PW}:-1:flags=lanczos[mnav1];
[6:v]scale={PW}:-1:flags=lanczos[mbar];
[mpage][mnav0]overlay=0:0:enable='lt(t,{mnav_switch:.3f})'[m1];
[m1][mnav1]overlay=0:0:enable='gte(t,{mnav_switch:.3f})'[m2];
[m2][mbar]overlay=0:{round(meta['mobBarTop'] * PH / mo['viewportH'])},format=yuva444p,
  geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='if(gt(abs(X-{PW / 2}),{PW / 2 - R})*gt(abs(Y-{PH / 2}),{PH / 2 - R})*gt(hypot(abs(X-{PW / 2})-{PW / 2 - R},abs(Y-{PH / 2})-{PH / 2 - R}),{R}),0,255)'[mscreen];
color=c=0xE1DDD5:s={W}x{H}:r={FPS}:d={mlen:.3f}[mbg];
[mbg][mscreen]overlay={PX}:{PY}:shortest=1,format=yuv420p[mob];

[7:v]format=yuv420p,fps={FPS}[intro];
[8:v]format=yuv420p,fps={FPS}[outro];
[intro][desk]xfade=transition=fade:duration={XF}:offset={INTRO - XF:.3f}[a];
[a][mob]xfade=transition=fade:duration={XF}:offset={INTRO + dlen - 2 * XF:.3f}[b];
[b][outro]xfade=transition=fade:duration={XF}:offset={INTRO + dlen + mlen - 3 * XF:.3f},fade=t=in:st=0:d=0.6,fade=t=out:st={INTRO + dlen + mlen + OUTRO - 3 * XF - 0.8:.3f}:d=0.8[v]
"""

inputs = []
for path, dur in [('desk-full.png', dlen), ('desk-nav-top.png', dlen), ('desk-nav-solid.png', dlen),
                  ('mob-full.png', mlen), ('mob-nav-top.png', mlen), ('mob-nav-solid.png', mlen), ('mob-bar.png', mlen),
                  ('card-intro.png', INTRO), ('card-outro.png', OUTRO)]:
    inputs += ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', os.path.join(RAW, path)]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f:
    f.write(fg)
    script = f.name
total = INTRO + dlen + mlen + OUTRO - 3 * XF
print(f'escritorio {dlen:.1f} s · celular {mlen:.1f} s · total {total:.1f} s')
subprocess.run([FFMPEG, '-y', '-loglevel', 'error', *inputs, '-filter_complex_script', script,
                '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart', '-r', str(FPS), OUT], check=True)
os.unlink(script)
print(OUT)
