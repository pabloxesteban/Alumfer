# Figma Exporter — Preparado (no implementado)

> Espacio reservado para el exportador de Figma. **La arquitectura ya lo contempla; solo falta escribir la implementación.** Agregarlo no requerirá tocar nada fuera de esta carpeta y el registro de exportadores.

## Estado
`planned` — sin implementar. El Creative OS sigue produciendo Content Packages agnósticos; cuando exista este exportador, los paquetes actuales serán consumibles sin cambios.

## Qué implementará (contrato)
Las mismas **siete etapas** de `../core/exporter-interface.md`:
`describe` → `supports` → `load` → `validate` → `resolveTemplate` → `map` → `transform` → `emit` → `report`.

Reutilizará de `../shared/`:
- **validators/** — todos (son agnósticos de plataforma).
- **mappers/** — `template-selection` y `content-to-variables` (los nombres de variable serán los de Figma).
- **serializers/** — `json` (Figma se maneja por JSON, no por CSV de Bulk Create).

## Especificidades previstas de Figma
| Tema | Enfoque previsto |
|---|---|
| Formato de salida | JSON para plugin de Figma / Figma REST API; sin CSV. |
| Plantillas | `figma/templates/` con nombres de capa (layer names) en lugar de variables de Bulk Create. |
| Variables → capas | El `map()` conecta variables semánticas a **nombres de capa** de un componente/frame de Figma. |
| Assets | Figma sí permite subir/embeber imágenes vía API → `capabilities.assetUpload: true`. |
| Design tokens | La paleta y tipografía del paquete se mapean a **Figma Variables / Styles**. |
| Round-trip | Potencial `roundTrip: true` (leer de Figma para cerrar el loop con analytics). |

## Estructura a crear (espejo de canva/)
```
figma/
├── exporter.md
├── templates/
├── schemas/
├── examples/
└── exports/
```

## Cómo activarlo (checklist)
Ver "Cómo agregar un exportador nuevo" en `../core/exporter-interface.md`. Resumen: crear `exporter.md` implementando el contrato, definir plantillas/schemas propios, reutilizar `shared/`, registrarlo en `compatibleExporters` y en `../README.md`. **No modificar el core ni otros exportadores.**
