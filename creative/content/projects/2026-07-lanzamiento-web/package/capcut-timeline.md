# CapCut — Guía de montaje · Reel "Abrimos una más" (Alumfer)

> Cómo pasar de este paquete a un Reel exportado en CapCut, corte por corte.
> El archivo `reel-animatic.mp4` ya es un **animatic real 9:16 (1080×1920, 22s)** con toda la
> tipografía, tiempos, transiciones y la línea de identidad animada. Sirve para: (a) aprobar el
> concepto tal cual, (b) usarlo de **plantilla exacta** para montar la versión final con tus clips.

## Sobre la "integración" con CapCut
CapCut **no tiene API pública** para renderizar desde afuera, así que la integración real es este
**kit importable**: un MP4 de referencia + overlays de texto listos + esta hoja de tiempos. En CapCut
sólo tenés que poner tus clips reales en cada slot y exportar. Todo respeta `shared/design-system`.

---

## Opción A — Montaje rápido (recomendado, ~15 min)
1. **Nuevo proyecto** en CapCut → 9:16 → 1080×1920 → 30fps.
2. **Pista 1 (video):** arrastrá tus 8 clips en orden, recortados a la duración de cada escena (tabla abajo).
3. **Pista 2 (overlay):** arrastrá los PNG de `overlays/scene-N.png` sobre la escena N correspondiente.
   Son transparentes, ya traen la tipografía y colores de marca. Alineá inicio con el clip.
4. **Animación de texto:** a cada overlay → *Animación → Entrada → "Subir y aparecer"* (~0.4s).
   Coincide con el `ease-out` del sistema.
5. **Transiciones:** entre clips, aplicar las de la columna "Transición" (todas suaves; nada de zooms bruscos).
6. **Audio:** música minimal con licencia comercial + SFX reales (ver `assets.json`). El animatic va sin audio a propósito.
7. **Portada:** frame de la escena 2/3 (luz + "Abrimos una más."). Elegir a mano.
8. **Exportar:** 1080×1920, 30fps, calidad alta.

## Opción B — Sólo overlays sobre tu propio corte
Si ya tenés un montaje, usá únicamente los `overlays/scene-N.png` como capas de texto. Respetan
zonas seguras (lejos del 14% inferior de la UI de Instagram).

---

## Hoja de tiempos (corte por corte)

| # | Timecode | Dur. | Clip (Pista 1) | Overlay (Pista 2) | Transición de salida | Audio |
|---|---------|:----:|----------------|-------------------|----------------------|-------|
| 1 | 0.0–2.5s | 2.5s | Abertura cerrada, rendija de luz que crece (sin logo) | `scene-1.png` (sin texto) | La luz crece / dip to light | ambiente + zumbido grave |
| 2 | 2.5–5.0s | 2.5s | **POV ventana/puerta Alumfer abriéndose**, entra luz | `scene-2.png` "Abrimos una más." | Flare / white flash corto | **CLICK real del cierre** + música entra |
| 3 | 5.0–7.0s | 2.0s | La luz recorre un living real | `scene-3.png` "Entra luz." | Slide L→R | música sube |
| 4 | 7.0–9.5s | 2.5s | Ventanal grande, obra Zona Sur | `scene-4.png` "ADROGUÉ" (+ línea azul) | Corte al ritmo | ambiente exterior |
| 5 | 9.5–12.5s | 3.0s | 3 tomas ×~0.8s: DVH / portón / cocina | `scene-5.png` "Lomas. Quilmes. Lanús." | Cortes secos al beat | beat minimal |
| 6 | 12.5–15.0s | 2.5s | Taller: corte a 45°, medición, sellado | `scene-6.png` "15 años de trabajo." | Match-cut a línea recta | **snip** + roce de metro |
| 7 | 15.0–18.5s | 3.5s | Captura real del sitio (2–3 pantallas) sobre Carbon | `scene-7.png` "Ahora, todo en un solo lugar." + línea azul | La línea azul se dibuja | música plena |
| 8 | 18.5–22.0s | 3.5s | Obra terminada con luz (reusar clip S2 → loop) | `scene-8.png` "ALUMFER · Pasá. · alumfer.com" | Cierre que reabre (loop al frame 1) | cola + click final |

**Reglas no negociables (del Brand Guardian):**
- Logo/wordmark **sólo en la escena 8**.
- **Un solo elemento azul** por composición (la línea de identidad).
- Web visible **1.5–2s** en la escena 7 — nunca screen-recording largo.
- Rótulos de barrio deben coincidir con la obra real mostrada.
- Sólo obra propia, nada de stock. Grade: −12% sat., temperatura fría, sombras con detalle.

---

## ¿Querés el proyecto CapCut editable (draft) en vez del kit?
Se puede generar un `draft_content.json` para abrir directo en CapCut Escritorio. No lo incluyo por
defecto porque el formato de draft **cambia entre versiones de CapCut** y no puedo validarlo contra tu
instalación desde acá (riesgo de que no abra). Si querés, decime tu versión de CapCut y lo armo.

## Reemplazar los placeholders
Cada escena con footage muestra un cartel `PLACEHOLDER — REEMPLAZAR POR CLIP` y qué toma va.
Sustituí cada slot por tu clip real y el Reel queda listo para publicar. El texto y los tiempos ya están resueltos.
