# Reporte de Exportación — Canva

**Paquete:** CP-20260701-instagram-policarbonato-quincho-v1
**Exportador:** canva v1.0.0
**Plantilla:** Instagram Carousel Alumfer (`instagram-carousel`, 4:5)
**Resultado:** ✅ SUCCESS
**Fecha:** 2026-07-01T16:15:00-03:00

## Resumen
- Slides generados: **5** (hook → valor 1 → valor 2 → valor 3 → CTA)
- Artefactos emitidos: **6** (bulk-create.csv, bulk-create.json, variables.json, template-map.json, asset-manifest.csv, report)
- Assets a subir a Canva: **5** (4 fotos + 1 logo)

## Validación
| Validador | Resultado |
|---|---|
| duplicate-names | ✅ |
| missing-variables | ✅ (Titular presente en los 5 slides) |
| empty-cta | ✅ (CTA WhatsApp resuelto) |
| asset-existence | ✅ (5/5 encontrados) |
| text-length | ✅ (máximo: 88 chars en Titular slide 1, dentro de 90) |
| colors | ✅ (paleta de marca) |
| typography | ✅ (Montserrat / Inter) |
| branding | ✅ (tono artesano, sin palabras prohibidas, logo solo al cierre) |

**Branding verificado:** ✅
**Placeholder resuelto:** `{{brand.whatsapp}}` → `https://wa.me/5491163368643` (desde brand-profile.json)

## Warnings
Ninguno.

## Próximos pasos (en Canva)
1. Abrir la plantilla **Instagram Carousel Alumfer** (4:5).
2. Subir a Canva los 5 assets de `asset-manifest.csv` con su `nombre_en_canva` exacto.
3. **Apps → Bulk Create → Import CSV** → cargar `bulk-create.csv`.
4. Conectar columnas → elementos según `template-map.json`
   (Volanta→volanta/numeral, Titular→titular, Texto→cuerpo, Dato→dato, Imagen→foto, CTA→botón, Logo→cierre).
5. Generar los 5 diseños y revisar contra `preview.md` del paquete.
6. Verificar que Montserrat 600 e Inter 400 estén cargadas en la marca de Canva.

## Publicación sugerida
- Sábado 10:00–12:00 (mañana relajada, proyectos del hogar — ver skills/instagram.md).
- Relevancia estacional: primavera pre-verano (el quincho se piensa antes del calor).
- Al publicar, registrar performance en analytics/template-performance.md con template=instagram-carousel.

## Nota
El exportador no diseñó nada: preparó los datos para que el armado en Canva sea mecánico. Cualquier ajuste de contenido se hace en el Content Package y se re-versiona (v2), nunca en Canva.
