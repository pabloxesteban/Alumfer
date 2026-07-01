# Serializer: CSV

Convierte filas de variables en un CSV conforme a RFC 4180, apto para el "Bulk Create" de Canva y cualquier import tabular.

## Input
- `rows[]` — objetos homogéneos (misma clave-set)
- `options` — `{ columns?: string[], delimiter?: "," }`

## Reglas de formato
- **Header** obligatorio: la primera fila son los nombres de columna. Si `options.columns` se provee, define el orden; si no, se usa el orden de aparición de las claves en la primera fila.
- **Orden de columnas estable** en todas las filas (columnas ausentes en una fila → celda vacía).
- **Escapado RFC 4180:** un campo se envuelve en comillas dobles si contiene `,`, `"`, salto de línea o comienza/termina con espacio. Las comillas internas se duplican (`"` → `""`).
- **Saltos de línea** dentro de un campo se preservan (Canva los respeta en textos multilínea).
- **UTF-8 sin BOM**, salto de línea `\n`.

## Ejemplo

Filas:
```jsonc
[
  { "Titular": "6 grados de diferencia", "Texto": "El mismo ambiente, sin tocar la calefacción.", "Imagen": "assets/fotos/quilmes-despues.jpg" },
  { "Titular": "¿Tu casa tiene el mismo problema?", "Texto": "", "Imagen": "" }
]
```

CSV:
```csv
Titular,Texto,Imagen
6 grados de diferencia,"El mismo ambiente, sin tocar la calefacción.",assets/fotos/quilmes-despues.jpg
¿Tu casa tiene el mismo problema?,,
```

## Output
`{ "name": "bulk-create.csv", "format": "canva-bulk-csv", "bytes": "…" }`

## Notas para Canva Bulk Create
- Columnas de **texto** se conectan a elementos de texto de la plantilla por nombre.
- Columnas de **imagen** deben contener la **referencia al asset** (nombre del archivo tal como se subió a Canva). Canva las conecta por nombre de imagen, no por ruta local — de ahí la importancia de `asset-manifest`.
