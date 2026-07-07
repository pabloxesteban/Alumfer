# Render — animatic del Reel "Abrimos una más"

Genera el animatic 9:16 y los overlays de texto para CapCut, 100% desde `content.json`
y `shared/design-system` (Carbon/Steel/Concrete/Blue, Montserrat/Inter).

## Salidas
- `../reel-animatic.mp4` — animatic 1080×1920, 30fps, ~22s (8 escenas animadas, slots marcados).
- `../overlays/scene-1..8.png` — overlays de texto transparentes para arrastrar en CapCut.

## Requisitos
```bash
python3 -m pip install Pillow imageio-ffmpeg fonttools brotli
```
Fuentes en `./fonts/` (Montserrat 600/700, Inter 300/400/500). Se obtienen de los paquetes
npm `@fontsource/montserrat` y `@fontsource/inter` (woff2 → ttf con fontTools). Licencia OFL.

## Correr
```bash
python3 build_reel.py
```
Variables opcionales: `ALUMFER_FONTS` (dir de fuentes), `ALUMFER_FRAMES` (dir temporal de frames).

## Notas
- El MP4 va **sin audio** a propósito (el audio se agrega en CapCut: música con licencia + SFX reales).
- Los planos con footage aparecen como **SLOTS** (`PLACEHOLDER — REEMPLAZAR POR CLIP`): es una
  plantilla, no la pieza final. La versión publicable necesita las tomas reales de obra/taller
  (regla de marca: sólo obra propia, nada de stock).
- Para el montaje final ver `../capcut-timeline.md`.
