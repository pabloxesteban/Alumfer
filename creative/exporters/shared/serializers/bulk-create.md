# Serializer: Bulk Create

Perfil de serialización específico para flujos de **generación masiva** (Canva Bulk Create, Adobe Express Bulk). No es un formato nuevo: es una configuración de `csv` + `json` con las convenciones que estos flujos exigen.

## Qué agrega sobre CSV/JSON crudos

1. **Una fila = un diseño.** Cada fila del `VariableMap` genera un slide/diseño independiente en la herramienta. El serializer garantiza una fila por bloque, en orden de `index`.

2. **Nombres de columna = nombres de variable de la plantilla.** Toma los nombres finales del `TemplateBinding` (no las variables semánticas). Ej: `eyebrow` → `Volanta`, `headline` → `Titular`.

3. **Columnas de imagen por nombre de archivo, no por ruta.** Bulk Create conecta imágenes por su nombre tal como fueron subidas a la herramienta. El serializer emite el basename (`quilmes-antes.jpg`), y la ruta completa queda en el `asset-manifest` aparte.

4. **Columna de control `__slide` y `__role`** (opcionales, con prefijo `__`): ayudan a depurar el mapeo sin interferir con las variables de la plantilla. Se pueden omitir con `options.debugColumns: false`.

## Input
- `VariableMap` + `TemplateBinding` (para los nombres finales de columna)
- `options` — `{ format: "csv" | "json", debugColumns?: false, imageAs?: "basename" }`

## Output
Uno o ambos:
- `{ "name": "bulk-create.csv", "format": "canva-bulk-csv", "bytes": "…" }`
- `{ "name": "bulk-create.json", "format": "canva-bulk-json", "bytes": "…" }`

## Ejemplo (CSV, plantilla con nombres en español)
```csv
Volanta,Titular,Texto,Imagen,CTA
Quilmes · DVH,Este dormitorio tenía frío en los cuatro costados.,,quilmes-antes.jpg,
,6 grados de diferencia,"El mismo ambiente, sin tocar la calefacción.",quilmes-despues.jpg,
,¿Tu casa tiene el mismo problema?,,,Escribinos por WhatsApp
```

## Regla de oro del Bulk Create
El CSV describe *contenido por diseño*; el **asset-manifest** describe *qué archivos subir y con qué nombre*. Los dos juntos son suficientes para que un humano ejecute Bulk Create en Canva sin volver al Creative OS.
