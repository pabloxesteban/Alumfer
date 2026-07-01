# Validador: `typography`

Verifica que toda la tipografía del paquete use el sistema tipográfico de Alumfer. Una fuente ajena rompe la identidad tanto como un color fuera de paleta.

## Input
- `assets.json` → `typography`
- Cualquier override tipográfico en elementos de `content.json`

## Sistema tipográfico autorizado (`brand/visual-language.md`)

| Rol | Familia | Peso | Tracking | Transform |
|---|---|---|---|---|
| `heading` | Montserrat | 600 | -0.02em | — |
| `subhead` | Inter | 400 | 0.06em | uppercase |
| `body` | Inter | 400 | — | — |

## Reglas
- Familia distinta de `Montserrat` o `Inter` → `blocking`.
- Peso fuera de los declarados por rol (p. ej. Montserrat 300) → `warning`.
- Más de **2 pesos tipográficos** en una misma gráfica/bloque → `blocking` (regla explícita: "nunca mezclar más de 2 pesos").
- Uso de Montserrat para `body` largo o Inter para `heading` principal → `warning` (roles cruzados).

## Output
```jsonc
{ "validator": "typography", "severity": "blocking",
  "target": { "location": "typography.heading" },
  "message": "Familia 'Poppins' no pertenece al sistema (Montserrat / Inter)",
  "expected": "Montserrat | Inter", "actual": "Poppins" }
```

## Nota para exportadores
Canva y CapCut pueden no tener las fuentes cargadas por defecto. El `report()` del exportador debe recordar al usuario cargar Montserrat e Inter en la herramienta — pero eso es un `nextStep`, no una falla de este validador.
