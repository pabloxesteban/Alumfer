# Validador: `text-length`

Verifica que cada texto del contenido entre en el espacio que la plantilla de destino reserva para él. Un titular que se corta o se sale del cuadro rompe la pieza en la herramienta de diseño.

## Input
- `LoadedPackage.content.blocks[].elements[]` (los elementos de texto)
- `TemplateBinding` — la plantilla define `maxChars` por tipo de variable

## Reglas
Cada plantilla declara límites por rol de texto. Ejemplo típico para Instagram:

| Elemento | Máximo recomendado | Duro (blocking) |
|---|---|---|
| `eyebrow` | 24 | 40 |
| `headline` | 60 | 90 |
| `body` | 160 | 220 |
| `cta.label` | 24 | 32 |

- Longitud entre recomendado y duro → `warning`.
- Longitud > límite duro (o > 130% del recomendado si la plantilla no define duro) → `blocking`.
- Se cuentan caracteres visibles (los `{{placeholders}}` se cuentan por su valor resuelto, no por el token).

## Output
Un hallazgo por cada texto fuera de rango, con `expected` (el máximo) y `actual` (la longitud real).

## Por qué importa para Alumfer
La voz de marca es breve por diseño (`brand/voice.md`: "sin relleno"). Un texto que no entra suele ser también un texto que sobra: el validador empuja a editar, no a achicar la tipografía.
