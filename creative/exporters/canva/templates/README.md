# Sistema de Plantillas de Canva

> Plantillas reutilizables que definen **cómo** un Content Package se estructura para Canva. Cada plantilla es un archivo JSON que cumple `../schemas/template.schema.json`.

Una plantilla **no** contiene contenido de Alumfer; contiene la **forma**: qué variables acepta, cuántos slides admite, en qué orden van los roles, qué restricciones impone y dónde va el CTA. El contenido lo aporta el Content Package; la plantilla lo acomoda.

## Qué define cada plantilla

| Campo | Significado |
|---|---|
| `variables` | Las variables de Canva (`Titular`, `Texto`, `Imagen`…) y de qué variable semántica se alimentan, con `maxChars`. |
| `maxSlides` / `minSlides` | Cantidad de slides que la plantilla admite. |
| `structure` | Secuencia esperada de roles de bloque (`hook → value → cta`). |
| `constraints` | Reglas duras: requiere CTA, logo solo al cierre, máx. 2 pesos tipográficos, paleta. |
| `cta` | Si el CTA es obligatorio y dónde va. |
| `layout` | Guía de layout por rol para el diseñador. |

## Catálogo

| Plantilla | Uso | Ratio | Slides |
|---|---|---|---|
| `instagram-carousel` | Carrusel educativo/transformación | 4:5 | hasta 10 |
| `story` | Story vertical, una idea directa | 9:16 | 1–3 |
| `quote` | Frase / principio de marca | 1:1 | 1 |
| `before-after` | Antes y después de una obra | 4:5 | 2–4 |
| `testimonial` | Testimonio de cliente | 4:5 | 1–3 |
| `faq` | Pregunta frecuente respondida | 4:5 | 2–6 |
| `reel-cover` | Portada (cover) de un reel | 9:16 | 1 |
| `promo` | Anuncio de producto/servicio | 4:5 | 1–3 |
| `oferta` | Oferta o promoción estacional real | 4:5 | 1–2 |
| `comparativa` | Comparar dos opciones (ej: DVH vs simple) | 4:5 | 2–5 |
| `educativo` | Explicación técnica en pasos | 4:5 | 3–8 |

## Cómo se elige una plantilla
La selección es automática (`../../shared/mappers/template-selection.md`): por `contentType`, luego por `publication.type` + `aspectRatio`, con fallback genérico. Nadie elige plantilla a mano salvo override explícito en el paquete.

## Cómo agregar una plantilla nueva
1. Crear `mi-plantilla.json` cumpliendo `../schemas/template.schema.json`.
2. Registrar su `contentType` en la tabla de `../../shared/mappers/template-selection.md`.
3. Agregarla a este catálogo. Nada más del sistema cambia.
