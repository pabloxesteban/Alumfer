# Empezar a Crear Contenido

> Guía operativa. De cero a un post listo para publicar. Si es tu primera vez, seguí esto de arriba a abajo.

---

## Antes de empezar (una sola vez)

Todo lo que el sistema necesita saber de Alumfer ya está cargado:
- **Identidad y voz** → `../brand/` (voz artesano, territorio, promesa).
- **Datos de marca** (WhatsApp, Instagram, paleta, tipografía) → `../brand/brand-profile.json` (fuente única de verdad; no hace falta re-tipear nada).
- **Formatos disponibles** → 11 plantillas en `../exporters/canva/templates/`.

No hay nada más que configurar. Ya se puede producir.

---

## El flujo, en 6 pasos

```
1. ELEGIR IDEA        →  content/ideas/backlog.md (ya hay 10 ideas listas)
2. ESCRIBIR           →  agents/copywriter.md + la plantilla elegida
3. EMPAQUETAR         →  skills/content-packaging.md  → Content Package en content/drafts/
4. REVISAR (QC)       →  agents/quality-controller.md marca checklist.md → ready-for-export
5. EXPORTAR A CANVA   →  agents/canva-exporter.md  → artefactos en exporters/canva/exports/
6. ARMAR Y PUBLICAR   →  seguir el report.md en Canva (paso mecánico) → publicar
```

Al publicar, registrar la performance por plantilla (`../analytics/template-performance.md`). Eso hace que el sistema aprenda qué formato convierte mejor.

---

## Paso a paso detallado

### 1. Elegir idea
Abrí `ideas/backlog.md`. Tiene 10 ideas concretas ya mapeadas a una plantilla, ordenadas por prioridad. Elegí una con material disponible (fotos de obra propia).

### 2. Escribir el contenido
Activá `../agents/copywriter.md` con la idea. Escribí los titulares y textos de cada slide según la plantilla elegida (ej: `instagram-carousel` = hook → valor → valor → CTA).

### 3. Empaquetar
Dos caminos:
- **Automático:** activá el skill `../skills/content-packaging.md` con lo que escribiste. Produce el Content Package completo.
- **A mano:** copiá la plantilla en blanco `../templates/content-package/` a `drafts/` y completá los `TODO`.

Nombre de la carpeta: `CP-{YYYYMMDD}-instagram-{slug}-v1/`. Poné las fotos reales en `assets/`.

### 4. Revisar (Quality Controller)
Activá `../agents/quality-controller.md`. Marca `checklist.md`. Si hay algo fuera de marca, vuelve al copywriter. Cuando está OK, cambiá `manifest.status` a `ready-for-export`.

### 5. Exportar a Canva
Activá `../agents/canva-exporter.md`. Valida el paquete y genera en `../exporters/canva/exports/<packageId>/`:
`bulk-create.csv`, `bulk-create.json`, `asset-manifest.csv`, `template-map.json` y un `report.md` con los próximos pasos.

### 6. Armar en Canva y publicar
Seguí el `report.md`: subí los assets, importá el CSV en Bulk Create, conectá columnas → generá los diseños. Publicá en el horario del calendario (`../skills/instagram.md`). No se diseña de cero: todo viene resuelto.

---

## Regla de oro
El entregable **nunca** es "un caption suelto" ni "un archivo de Canva". El entregable es un **Content Package**. Eso garantiza que todo sea reutilizable, auditable y exportable a cualquier herramienta.

## Ejemplo de referencia
Un paquete real y completo, de punta a punta:
`../exporters/canva/examples/CP-20260701-instagram-dvh-quilmes-v1/` (+ su export en `expected-canva-export/`).

## Atajo mental
> Idea → Copy → **Content Package** → QC → Export → Publicar → Aprender
