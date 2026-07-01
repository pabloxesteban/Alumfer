# Validador: `colors`

Verifica que todo color usado en el paquete pertenezca a la paleta de marca. Un color fuera de paleta rompe el "industrial elegante" de Alumfer (`brand/visual-language.md`).

## Input
- `assets.json` → `palette`, `backgrounds`, `graphicElements[].color`
- Cualquier color literal referenciado en `content.json` (`layoutHint` o estilos de elemento)

## Paleta de marca autorizada

| Clave | Valor |
|---|---|
| `brand.carbon` | `#1A1C1E` |
| `brand.steel` | `#2E3338` |
| `brand.concrete.faint` | `#F5F4F1` |
| `brand.concrete.light` | `#E8E4DC` |
| `brand.blue` | `#1B6CC8` |
| `text.on-dark.strong` | `#FFFFFF` |
| `text.on-dark.muted` | `rgba(255,255,255,0.60)` |

## Reglas
- Todo color debe referenciarse por **clave de paleta** (`brand.blue`), no por valor literal (`#1B6CC8`). Un literal que coincide con la paleta → `warning` (usar la clave). Un literal que **no** coincide → `blocking`.
- Un color hexadecimal o RGB fuera de la tabla → `blocking`.
- El azul de acento (`brand.blue`) debe usarse "con economía": si aparece como fondo de más del 50% de los bloques → `warning`.

## Output
```jsonc
{ "validator": "colors", "severity": "blocking",
  "target": { "location": "graphicElements.accent.bar" },
  "message": "Color '#00A3FF' fuera de la paleta de marca",
  "expected": "brand.blue (#1B6CC8)", "actual": "#00A3FF" }
```

## Tolerancia
Sin tolerancia de "casi igual". Un `#1B6DC9` no es `brand.blue`. La consistencia cromática es binaria: o es de marca, o no lo es.
