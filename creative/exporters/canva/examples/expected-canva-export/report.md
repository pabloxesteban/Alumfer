# Reporte de Exportación — Canva

**Paquete:** CP-20260701-instagram-dvh-quilmes-v1
**Exportador:** canva v1.0.0
**Plantilla:** Instagram Carousel Alumfer (`instagram-carousel`, 4:5)
**Resultado:** ✅ SUCCESS
**Fecha:** 2026-07-01T14:40:00-03:00

## Resumen
- Slides generados: **4** (hook → valor → valor → CTA)
- Artefactos emitidos: **6** (bulk-create.csv, bulk-create.json, variables.json, template-map.json, asset-manifest.csv, report)
- Assets a subir a Canva: **4** (3 fotos + 1 logo)

## Validación
| Validador | Resultado |
|---|---|
| duplicate-names | ✅ |
| missing-variables | ✅ |
| empty-cta | ✅ |
| asset-existence | ✅ (4/4 encontrados) |
| text-length | ✅ (máximo usado: 90 chars en Titular, dentro de límite) |
| colors | ✅ (paleta de marca) |
| typography | ✅ (Montserrat / Inter) |
| branding | ✅ (tono artesano, sin palabras prohibidas, logo solo al cierre) |

**Branding verificado:** ✅

## Warnings
Ninguno.

## Próximos pasos (en Canva)
1. Abrir la plantilla **Instagram Carousel Alumfer** (4:5).
2. Subir a Canva los 4 assets de `asset-manifest.csv` con su `nombre_en_canva` exacto.
3. **Apps → Bulk Create → Import CSV** → cargar `bulk-create.csv`.
4. Conectar columnas → elementos según `template-map.json` (Volanta→volanta, Titular→titular, etc.).
5. Generar los 4 diseños y revisar contra `preview.md` del paquete.
6. Verificar que Montserrat 600 e Inter 400 estén cargadas en la marca de Canva.

## Nota
El exportador no diseñó nada: preparó los datos para que el armado en Canva sea mecánico. Cualquier ajuste de contenido debe hacerse en el Content Package y re-versionarse (v2), nunca directamente en Canva.
