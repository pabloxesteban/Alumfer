#!/usr/bin/env bash
# Genera video/homepage-walkthrough.mp4: recorrido de 25 s por la página de inicio,
# escritorio y celular a la vez. Usa las capturas completas de _raw/.
# Requiere ffmpeg (por ejemplo: pip install imageio-ffmpeg).
set -euo pipefail
cd "$(dirname "$0")/.."
FF=${FFMPEG:-$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")}
DH=$(python3 -c "import struct;f=open('_raw/desk-full.png','rb');f.seek(20);print(struct.unpack('>I',f.read(4))[0])")
MH=$(python3 -c "import struct;f=open('_raw/mob-full.png','rb');f.seek(20);print(struct.unpack('>I',f.read(4))[0])")
P="clip((t-1.5)/21\,0\,1)"; E="($P*$P*(3-2*$P))"   # pausa inicial, desplazamiento suave, pausa final
mkdir -p video
"$FF" -y -loglevel error -loop 1 -framerate 30 -t 25 -i _raw/desk-full.png -loop 1 -framerate 30 -t 25 -i _raw/mob-full.png \
  -f lavfi -i "color=c=0xE1DDD5:s=1920x1080:r=30:d=25" \
  -filter_complex "[0:v]crop=2880:1800:0:'($DH-1800)*$E',scale=1400:875:flags=lanczos[d];[1:v]crop=780:1688:0:'($MH-1688)*$E',scale=300:649:flags=lanczos,format=yuva420p,geq=lum='p(X,Y)':a='if(gt(abs(X-150),128)*gt(abs(Y-324.5),302.5)*gt(hypot(abs(X-150)-128,abs(Y-324.5)-302.5),22),0,255)'[m];[2:v][d]overlay=90:102[b];[b][m]overlay=1530:215,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 -movflags +faststart -t 25 video/homepage-walkthrough.mp4
