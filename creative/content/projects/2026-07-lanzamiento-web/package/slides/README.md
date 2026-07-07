# Slides SVG — "Una ventana más" · Exportar a Canva / Publicar

8 slides vectoriales **1080×1080**, terminadas y autónomas (no dependen de fotos).
Dirección de arte: sistema gráfico industrial ilustrado (line-art de ventana/aluminio) sobre Carbon,
**un solo acento azul por slide**. Color y tipografía según `shared/design-system/`.

```
slide-1.svg  Hook — "Anoche terminamos una que no lleva aluminio."
slide-2.svg  Reveal — "Es nuestro nuevo sitio."
slide-3.svg  Vista 1 · la fábrica (Adrogué)
slide-4.svg  Vista 2 · tu barrio (Zona Sur)
slide-5.svg  Vista 3 · la obra (casas reales)
slide-6.svg  Vista 4 · el primer paso (presupuesto sin apuro)
slide-7.svg  El giro — "No cambió quién está detrás." + oficio/45°
slide-8.svg  CTA — "Asomate." + alumfer.com.ar + WhatsApp
```

## Regenerar
```bash
python3 build_slides.py   # reescribe los 8 SVG (embebe el logo de apps/website/solologo.png)
```

## Opción A — Importar los SVG a Canva (texto editable)
1. Canva → **Uploads** → subí los 8 `.svg`.
2. Diseño **1080×1080** con 8 páginas. Arrastrá cada SVG a su página en orden 1→8 (escala 100%).
3. El texto queda editable. Para máxima fidelidad, reemplazá la fuente por **Montserrat 700** (el SVG usa Arial/Helvetica como fallback seguro).
4. Descargá como PNG/JPG (calidad alta).

## Opción B — Bulk Create con texto
Usá `../canva.csv` (Canva → Bulk Create). Columnas: `kicker, headline, body, accent_word, footer, visual_note`.

## Opción C — Versión fotográfica
Si querés fotos de obra real de fondo, ver `../assets.json` (dirección de arte por slide) y usar
los overlays de texto transparente descritos ahí. Regla: **solo obra propia**, color grade Alumfer
(satur. −10/−15%, temperatura fría). **Nunca stock, nunca Orange & Teal, nunca screenshots del sitio.**

## Notas de marca
- **Acento azul:** máximo 1 elemento azul por slide (regla `shared/design-system/colors.md`). El slide 8 (CTA) usa azul como color de acción — excepción aceptada.
- **Logo:** únicamente en slide 8.
- **URL:** confirmar `alumfer.com.ar` y el link en bio antes de publicar.
