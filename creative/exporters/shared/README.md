# Shared — Capa Reutilizable de Exportación

> Lógica común a **todos** los exportadores. Se escribe una vez acá y se reutiliza; nunca se duplica dentro de un exportador concreto.

Regla rectora: **dos usos → `shared/`**. Si un validador, mapper o serializador sirve a más de un exportador, vive acá.

```
shared/
├── validators/    ← reglas de verificación agnósticas de plataforma
├── mappers/       ← selección de plantilla y mapeo contenido → variables
└── serializers/   ← conversión de estructuras a formatos de archivo (CSV, JSON, …)
```

## Cómo encajan en el ciclo del exportador

| Etapa del ciclo (`core/exporter-interface.md`) | Capa shared que usa |
|---|---|
| `validate()` | `validators/` |
| `resolveTemplate()` + `map()` | `mappers/` |
| `transform()` | `serializers/` |

Cada exportador **compone** estas piezas y agrega solo lo específico de su destino. Un exportador que reescribe desde cero un validador de colores está violando el diseño: debe reusar `validators/branding.md`.

## Estándar de contrato

Toda pieza shared documenta: **input**, **output**, **reglas** y **severidad** (cuando aplica). Las severidades son siempre las mismas en todo el sistema:

| Severidad | Efecto en el pipeline |
|---|---|
| `blocking` | Aborta la exportación. |
| `warning` | No aborta; viaja hasta el `report`. |
| `info` | Solo informativo. |
