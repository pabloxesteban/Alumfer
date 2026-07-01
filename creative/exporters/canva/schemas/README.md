# Schemas de Validación

> JSON Schemas (draft 2020-12) que validan automáticamente cada archivo del Content Package **antes** de exportar. Son la definición formal y ejecutable del estándar descrito en prosa en `../../core/content-package.md`.

La etapa `validate()` del exportador corre estos schemas primero (validación estructural), y luego los validadores semánticos de `../../shared/validators/` (reglas de negocio y marca). Un paquete debe pasar **ambos**.

## Schemas del estándar (agnósticos de plataforma)

| Schema | Valida |
|---|---|
| `manifest.schema.json` | `manifest.json` — índice e integridad |
| `content.schema.json` | `content.json` — bloques, elementos, CTAs |
| `metadata.schema.json` | `metadata.json` — contexto estratégico |
| `assets.schema.json` | `assets.json` — inventario de recursos |

## Schemas específicos de Canva

| Schema | Valida |
|---|---|
| `template.schema.json` | Cada definición de plantilla en `../templates/` |
| `canva-bulk.schema.json` | El `bulk-create.json` emitido (auto-verificación del output) |

## Por qué schemas reales y no solo prosa
La prosa documenta la intención; el schema la hace **verificable por máquina** y sin ambigüedad. Cualquier validador de JSON Schema estándar puede correr estos archivos en CI. Viven bajo `canva/` porque es el primer exportador; cuando exista un segundo exportador, los cuatro schemas del estándar se promoverán a un lugar compartido sin cambiar su contenido.
