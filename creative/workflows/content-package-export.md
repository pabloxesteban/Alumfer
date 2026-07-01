# Workflow: Del Content Package a la Herramienta de Diseño

> Cómo un Content Package aprobado se convierte en artefactos listos para Canva (o cualquier exportador). Este workflow arranca donde terminan `idea-to-reel.md` y `obra-to-reels.md`: con un Content Package en la mano.

---

## Visión general

```
CONTENT PACKAGE (ready-for-export)
    ↓
SELECCIÓN DE EXPORTADOR
    ↓
VALIDACIÓN PRE-FLIGHT
    ↓
SELECCIÓN + MAPEO DE PLANTILLA
    ↓
TRANSFORMACIÓN (CSV / JSON / manifest)
    ↓
EMISIÓN A exports/
    ↓
REPORTE FINAL
    ↓
ARMADO EN LA HERRAMIENTA (paso humano mecánico)
    ↓
PUBLICACIÓN + REGISTRO DE PERFORMANCE
```

Todo el tramo del exportador es responsabilidad del agente `canva-exporter` e implementa el ciclo de `../exporters/core/exporter-interface.md`.

---

## Paso 1 — Punto de partida
**Input:** un Content Package en `content/drafts/` o `content/approved/` en estado `ready-for-export`, con `checklist.md` aprobado por el Quality Controller.

Si el paquete no está `ready-for-export`, este workflow no arranca: vuelve al empaquetado / QC.

## Paso 2 — Selección de exportador
Se lee `manifest.compatibleExporters` y se corre `supports()` de cada candidato. Para una pieza de Instagram estática, el exportador es `canva`. (Un mismo paquete podría ir a Canva para la portada y a CapCut para el reel.)

## Paso 3 — Validación pre-flight
El agente `canva-exporter` corre `validate()`: los 8 validadores de `../exporters/shared/validators/` más los específicos de Canva.
- **Con errores bloqueantes:** el proceso se detiene, no se emite nada, y el paquete vuelve al responsable (Copywriter / Brand Guardian / QC) con la lista exacta.
- **Solo warnings:** continúa, y los warnings viajan al reporte.

## Paso 4 — Selección y mapeo de plantilla
`resolveTemplate()` elige la plantilla (`../exporters/canva/templates/`) por `contentType`; `map()` traduce los bloques a las variables de la plantilla (una fila por slide).

## Paso 5 — Transformación
`transform()` genera los artefactos: `bulk-create.csv`, `bulk-create.json`, `variables.json`, `template-map.json`, `asset-manifest.csv`.

## Paso 6 — Emisión
`emit()` escribe todo en `../exporters/canva/exports/<packageId>/`. Idempotente.

## Paso 7 — Reporte final
`report()` produce `report.md` + `report.json`: resultado, branding verificado, warnings y **próximos pasos** operativos en Canva.

## Paso 8 — Armado en Canva (humano, mecánico)
Siguiendo el `report.md`:
1. Abrir la plantilla de Canva indicada.
2. Subir los assets de `asset-manifest.csv`.
3. Bulk Create → importar `bulk-create.csv` → conectar columnas según `template-map.json`.
4. Generar y revisar contra `preview.md`.

**No hay decisiones creativas en este paso.** Si algo no cierra, se corrige el paquete y se re-versiona (v+1); nunca se edita en Canva.

## Paso 9 — Publicación y registro de performance
Tras publicar, se registra la performance ligada al `packageId` y la plantilla (`analytics/template-performance.md`). Ese dato cierra el loop y alimenta el próximo `campaign-planning.md`.

---

## Criterios de avance

| De | A | Criterio |
|---|---|---|
| Paquete | Exportador | Estado `ready-for-export` + checklist aprobado |
| Validación | Mapeo | Cero errores bloqueantes |
| Emisión | Armado | Reporte `success` o `success-with-warnings` |
| Publicación | Analytics | Post publicado con `packageId` trazable |

---

## Qué NO hace este workflow
- No diseña en Canva (eso es el paso humano mecánico).
- No corrige contenido (eso vuelve al flujo creativo).
- No es específico de Canva: el mismo workflow sirve para Figma o CapCut cambiando solo el exportador seleccionado en el Paso 2.
