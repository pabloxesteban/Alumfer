# Reporte de Exportación — Canva

**Paquete:** CP-20260701-instagram-4-preguntas-aberturas-v1
**Exportador:** canva v1.0.0
**Plantilla:** Educativo Alumfer (`educativo`, 4:5)
**Resultado:** ✅ SUCCESS
**Fecha:** 2026-07-01T17:20:00-03:00

## Resumen
- Slides generados: **6** (hook → 4 preguntas → CTA)
- Artefactos: bulk-create.csv/json, variables.json, template-map.json, asset-manifest.csv, report
- Assets a subir a Canva: **1** (logo)
- Producción: **no requiere fotografía** — los slides ya están renderizados en `assets/slides/`

## Validación
| Validador | Resultado |
|---|---|
| duplicate-names | ✅ |
| missing-variables | ✅ (Titular en los 6 slides) |
| empty-cta | ✅ (WhatsApp resuelto) |
| asset-existence | ✅ (1/1 — detectó y bloqueó cuando faltaba el logo; corregido) |
| text-length | ✅ |
| colors | ✅ |
| typography | ✅ |
| branding | ✅ (sin palabras prohibidas, logo solo al cierre) |

**Branding verificado:** ✅
**Placeholder resuelto:** `{{brand.whatsapp}}` → `https://wa.me/5491163368643`

## Dos caminos para publicar
1. **Directo (recomendado):** las imágenes ya están en `assets/slides/slide-1..6.png` (1080×1350). Publicar tal cual siguiendo `PUBLICAR.md`.
2. **Retoque en Canva:** usar `bulk-create.csv` + la plantilla *Educativo Alumfer* si se quiere ajustar el diseño antes de publicar.

## Publicación sugerida
- Miércoles 19:00–21:00. Ubicación: Adrogué, Buenos Aires.
- Registrar performance en `analytics/template-performance.md` (template=`educativo`).
