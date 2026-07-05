# Slides SVG — Exportar a Canva / Publicar

8 slides vectoriales 1080×1080, terminadas y autónomas (no dependen de fotos).
Dirección de arte: sistema gráfico industrial ilustrado (line-art de aluminio) sobre Carbon,
un solo acento azul por slide. Sistema de color y tipografía según `shared/design-system`.

```
slide-1.svg  Hook — "La ventana barata no existe."
slide-2.svg  Reencuadre — "Existen dos."
slide-3.svg  Cuota 1 · el invierno (gas)
slide-4.svg  Cuota 2 · el ruido (living)
slide-5.svg  Cuota 3 · la humedad (abertura)
slide-6.svg  Cuota final — "dos veces."
slide-7.svg  El giro — "carísima" + oficio/45°
slide-8.svg  CTA — WhatsApp + Alumfer
```

## Opción A — Importar los SVG a Canva (recomendada, texto editable)
1. Canva → **Uploads** → subí los 8 `.svg` (Canva Pro importa SVG).
2. Creá un diseño **1080×1080** con 8 páginas.
3. Arrastrá cada SVG a su página **en orden 1→8**. Escala al 100% (encaja exacto).
4. El texto queda **editable**: podés ajustar tipografía a Montserrat 800 si la tenés en tu marca (el SVG usa Arial/Helvetica como fallback seguro).
5. Descargá como **PNG** o **JPG** (calidad alta) → carrusel listo.

## Opción B — Bulk Create con texto (para re-templating)
Usá `../canva.csv` (Canva → Bulk Create → Connect data). Cada fila es una slide;
columnas: `kicker, headline, body, accent_word, footer, visual_note`. Útil si querés
rediseñar el layout desde cero manteniendo el copy.

## Opción C — Directo (sin Canva)
Convertí cada SVG a PNG (cualquier editor, o abrir en navegador y exportar) y subí
los 8 como carrusel. Copy, CTA y comentario fijado en `../caption.md`; hashtags en
`../hashtags.txt` (van en el primer comentario).

## Notas de marca
- **Acento azul:** máximo 1 elemento azul por slide (regla `shared/design-system/colors.md`). Respetado.
- **Tipografía:** los SVG usan Arial/Helvetica (presente en Canva). Para máxima fidelidad al sistema, reemplazá por **Montserrat 800** en Canva si está en tu kit de marca.
- **Fotos:** esta versión es 100% gráfica. Si en el futuro querés una variante fotográfica, ver `../assets.json` (dirección de arte para foto de obra real).
