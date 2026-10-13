"""Genera dos videos (1920x1080, 30 fps) en video/:

- desktop-walkthrough.mp4: placa de apertura -> el sitio en escritorio a
  pantalla completa, con una pausa en cada sección -> placa de cierre.
- mobile-walkthrough.mp4: placa de apertura -> el sitio en celular, en grande,
  con pausas -> placa de cierre.

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
OUT_DIR = os.path.join(HERE, '..', 'video')
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
    """Parada en una sección: su título queda justo debajo de la barra fija."""
    return max(0, min(m['sections'][sel] - m['navH'] + offset, m['height'] - m['viewportH']))


d, mo = meta['desk'], meta['mob']

desk_stops = [0,
              section(d, '#nosotros'),
              section(d, '#trabajos'),
              section(d, '#proceso'),
              section(d, '#lineas'),
              section(d, '#productos'),
              section(d, '#resenas'),
              section(d, '#faq'),
              section(d, '#contacto'),
              d['height'] - d['viewportH']]
mob_stops = [0,
             section(mo, '#nosotros'),
             section(mo, '#trabajos'),
             section(mo, '#proceso'),
             section(mo, '#lineas'),
             section(mo, '#resenas'),
             section(mo, '#contacto')]

dseg, dlen = timeline(desk_stops)
mseg, mlen = timeline(mob_stops)
INTRO, OUTRO, XF = 3.6, 3.6, 0.8

# Celular: pantalla de 900 px de alto centrada
PH = 900
PW = round(mo['width'] * PH / mo['viewportH'])
PX, PY = (W - PW) // 2, (H - PH) // 2
R = 44  # radio de las esquinas de la pantalla

# La barra de navegación es sticky: se superpone arriba cuando la página pasó la franja superior.
# La barra inferior del celular se esconde cuando aparece el formulario de contacto, como en el sitio.
d_y, m_y = y_expr(dseg, 1), y_expr(mseg, 1)
mbar_off = mo['sections']['#contacto'] - mo['viewportH'] + 120

def render(out, scene_inputs, scene_graph, scene_len, intro_card):
    """Placa de apertura -> escena -> placa de cierre, con fundidos."""
    inputs = []
    for path, dur in scene_inputs + [(intro_card, INTRO), ('card-outro.png', OUTRO)]:
        inputs += ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', os.path.join(RAW, path)]
    n = len(scene_inputs)
    total = INTRO + scene_len + OUTRO - 2 * XF
    graph = scene_graph + f"""
[{n}:v]format=yuv420p,fps={FPS}[intro];
[{n + 1}:v]format=yuv420p,fps={FPS}[outro];
[intro][scene]xfade=transition=fade:duration={XF}:offset={INTRO - XF:.3f}[a];
[a][outro]xfade=transition=fade:duration={XF}:offset={INTRO + scene_len - 2 * XF:.3f},fade=t=in:st=0:d=0.6,fade=t=out:st={total - 0.8:.3f}:d=0.8[v]
"""
    with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f:
        f.write(graph)
        script = f.name
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', *inputs, '-filter_complex_script', script,
                    '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-r', str(FPS), out], check=True)
    os.unlink(script)
    print(f'{os.path.basename(out)}: {total:.1f} s')


os.makedirs(OUT_DIR, exist_ok=True)

# Escritorio: pantalla completa, barra de navegación superpuesta
render(os.path.join(OUT_DIR, 'desktop-walkthrough.mp4'),
       [('desk-full.png', dlen), ('desk-nav.png', dlen)],
       f"""
[0:v]format=rgb24,crop={round(d['width'] * d['dsf'])}:{round(d['viewportH'] * d['dsf'])}:0:'{y_expr(dseg, d['dsf'])}',scale={W}:{H}:flags=lanczos,setsar=1[dpage];
[1:v]scale={W}:-1:flags=lanczos[dnav];
[dpage][dnav]overlay=0:0:enable='gte({d_y},{d['navTop']})',fps={FPS},format=yuv420p[scene];""",
       dlen, 'card-intro-desktop.png')

# Celular: pantalla grande centrada, barra superior y barra de contacto
render(os.path.join(OUT_DIR, 'mobile-walkthrough.mp4'),
       [('mob-full.png', mlen), ('mob-nav.png', mlen), ('mob-bar.png', mlen)],
       f"""
[0:v]format=rgb24,crop={round(mo['width'] * mo['dsf'])}:{round(mo['viewportH'] * mo['dsf'])}:0:'{y_expr(mseg, mo['dsf'])}',scale={PW}:{PH}:flags=lanczos,setsar=1[mpage];
[1:v]scale={PW}:-1:flags=lanczos[mnav];
[2:v]scale={PW}:-1:flags=lanczos[mbar];
[mpage][mnav]overlay=0:0:enable='gte({m_y},{mo['navTop']})'[m1];
[m1][mbar]overlay=0:{round(meta['mobBarTop'] * PH / mo['viewportH'])}:enable='lt({m_y},{mbar_off})',format=yuva444p,
  geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='if(gt(abs(X-{PW / 2}),{PW / 2 - R})*gt(abs(Y-{PH / 2}),{PH / 2 - R})*gt(hypot(abs(X-{PW / 2})-{PW / 2 - R},abs(Y-{PH / 2})-{PH / 2 - R}),{R}),0,255)'[mscreen];
color=c=0xE1DDD5:s={W}x{H}:r={FPS}:d={mlen:.3f}[mbg];
[mbg][mscreen]overlay={PX}:{PY}:shortest=1,format=yuv420p[scene];""",
       mlen, 'card-intro-mobile.png')
