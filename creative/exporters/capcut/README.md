# CapCut Exporter — Preparado (no implementado)

> Espacio reservado para el exportador de CapCut (video/reels). **La arquitectura ya lo contempla.** El mismo Content Package que alimenta un carrusel de Canva puede alimentar un reel de CapCut sin cambios en el contenido.

## Estado
`planned` — sin implementar.

## Por qué el mismo estándar sirve para video
El modelo de bloques de `content.json` es agnóstico: un `block` es un slide en Canva y una **escena/clip** en CapCut. Los `role` (hook, value, cta) mapean igual de bien a la estructura narrativa de un reel (`brand/storytelling.md`, `templates/reel-structures.md`). El `metadata.publication.duration` y `aspectRatio: 9:16` ya existen en el estándar justamente para esto.

## Qué implementará (contrato)
Las mismas **siete etapas** de `../core/exporter-interface.md`. Reutilizará:
- **validators/** — todos, más validadores propios de video (duración total, texto en zona segura, longitud por escena).
- **mappers/** — `template-selection` (plantillas tipo "Reel Cover", "Proceso", "Antes/Después en video") y `content-to-variables` (variables = texto sobreimpreso + clip + timing).
- **serializers/** — `json` (CapCut consume estructuras temporales, no CSV).

## Especificidades previstas de CapCut
| Tema | Enfoque previsto |
|---|---|
| Salida | JSON de guión/timeline: por escena → clip, texto sobreimpreso, duración, transición. |
| Timing | Cada `block` gana `startAt`/`duration`; el exportador reparte la duración total del `metadata`. |
| Texto en pantalla | Mapea `headline`/`data` a text overlays con Montserrat 600 / Inter 400. |
| B-roll | Usa `assets.brollHints` para sugerir clips de relleno. |
| Música | Referencia de estilo (no canción), como en `workflows/idea-to-reel.md`. |
| Zonas seguras | Validador propio: texto fuera de la UI de Instagram/TikTok. |

## Estructura a crear (espejo de canva/)
```
capcut/
├── exporter.md
├── templates/
├── schemas/
├── examples/
└── exports/
```

## Relación con el pipeline de reels existente
CapCut es la herramienta de edición mencionada en `workflows/obra-to-reels.md` (paso 8). Cuando exista este exportador, el guión aprobado saldrá como Content Package y CapCut lo consumirá directamente — cerrando la brecha entre el guión y la línea de tiempo de edición.
