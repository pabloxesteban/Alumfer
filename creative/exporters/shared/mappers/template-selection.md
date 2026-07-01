# Mapper: Selección de Plantilla (`resolveTemplate`)

Elige la plantilla de destino apropiada para un paquete. Determinista y explicable: siempre reporta **por qué** eligió esa plantilla (`matchedBy`).

## Input
- `LoadedPackage.content.contentType`
- `LoadedPackage.metadata.publication` (`type`, `aspectRatio`, `slideCount`)
- El catálogo de plantillas del exportador (`<exporter>/templates/`)

## Algoritmo de selección (en orden de prioridad)

```
1. Override explícito
   Si metadata.branding o content declaran un templateId → usarlo. (matchedBy: "explicit")

2. Match por contentType
   Si content.contentType coincide con el id de una plantilla → usarla. (matchedBy: "contentType")

3. Match por publication.type + aspectRatio
   Buscar plantilla cuyo tipo y ratio coincidan (ej: carrusel + 4:5 → instagram-carousel).
   (matchedBy: "publication")

4. Fallback genérico
   Usar la plantilla base del tipo (carrusel → generic-carousel; video → generic-video).
   (matchedBy: "fallback", agrega un warning)
```

## Tabla de correspondencia `contentType` → plantilla (Canva)

| contentType | Plantilla |
|---|---|
| `instagram-carousel` | `instagram-carousel` |
| `story` | `story` |
| `quote` | `quote` |
| `before-after` | `before-after` |
| `testimonial` | `testimonial` |
| `faq` | `faq` |
| `reel-cover` | `reel-cover` |
| `promo` | `promo` |
| `oferta` | `oferta` |
| `comparativa` | `comparativa` |
| `educativo` | `educativo` |

## Verificación de restricciones
Antes de confirmar el binding, valida las **restricciones** de la plantilla contra el paquete:
- `maxSlides` ≥ `blocks.length` — si no, `blocking` (la pieza no entra en la plantilla).
- `aspectRatio` compatible — si no, `warning` (se puede reencuadrar, pero se avisa).

## Output → `TemplateBinding`
```jsonc
{ "templateId": "instagram-carousel", "templateVersion": "1.0",
  "matchedBy": "contentType", "constraintsChecked": true, "unboundVariables": [] }
```
