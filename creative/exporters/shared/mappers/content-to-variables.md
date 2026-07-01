# Mapper: Contenido → Variables (`map`)

Convierte los `blocks` del Content Package en las filas de variables que la plantilla consume. Es el núcleo del "Bulk Create": una fila por slide.

## Input
- `LoadedPackage.content` (bloques, elementos, CTAs resueltos)
- `TemplateBinding.template.variables[]` (los nombres de variable de la plantilla)

## Modelo de mapeo por rol

Cada `role` de bloque tiene un mapeo canónico a **variables semánticas**. La plantilla luego renombra esas variables semánticas a sus nombres concretos (`Titular`, `Texto`, `Imagen`, `CTA`…).

| `role` del bloque | Variables semánticas que alimenta |
|---|---|
| `cover` / `hook` | `eyebrow`, `headline`, `image`, `background` |
| `context` | `headline`, `body`, `image` |
| `value` | `headline`, `body`, `image`, `data` |
| `proof` | `body`, `image`, `attribution` |
| `cta` | `headline`, `cta_label`, `cta_target`, `logo` |

## Reglas de resolución de elementos

| `type` de elemento | Se mapea a |
|---|---|
| `eyebrow` | `eyebrow` |
| `headline` | `headline` |
| `body` | `body` |
| `image` (`assetRef`) | `image` → ruta relativa resuelta desde `assets.json` |
| `cta` (`ctaRef`) | `cta_label` (label), `cta_target` (target resuelto) |
| `logo` (`assetRef`) | `logo` → ruta resuelta |
| `data` | `data` (dato ancla destacado) |

## Resolución de referencias
- `assetRef` → se resuelve a `assets.json[assetRef].path`. Si no existe, no se mapea (lo captura `asset-existence`).
- `ctaRef` → se resuelve a la entrada de `ctas[]`.
- Placeholders `{{brand.*}}` → se expanden con los valores de `../../../brand/brand-profile.json` (fuente única de verdad: WhatsApp, Instagram, web, zona). Ej: `{{brand.whatsapp}}` → `https://wa.me/5491163368643`. Un placeholder sin correspondencia en el perfil → `warning`.

## Output → `VariableMap`
Una fila por bloque, en orden de `index`:
```jsonc
{
  "rows": [
    { "slide": 1, "role": "hook",  "eyebrow": "Quilmes · DVH", "headline": "Este dormitorio tenía frío…", "image": "assets/fotos/quilmes-antes.jpg" },
    { "slide": 2, "role": "value", "headline": "6 grados de diferencia", "body": "El mismo ambiente…", "image": "assets/fotos/quilmes-despues.jpg" },
    { "slide": 3, "role": "cta",   "headline": "¿Tu casa tiene el mismo problema?", "cta_label": "Escribinos por WhatsApp", "logo": "assets/logos/alumfer-blanco.svg" }
  ],
  "unmapped": []
}
```

Las variables semánticas vacías se emiten como string vacío (no se omiten): así el CSV/JSON de Bulk Create mantiene columnas consistentes en todas las filas.
