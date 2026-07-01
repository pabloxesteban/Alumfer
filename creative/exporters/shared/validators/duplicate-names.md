# Validador: `duplicate-names`

Garantiza la unicidad de todas las claves e identificadores del paquete. Un nombre duplicado hace ambigua una referencia y produce resultados no deterministas en la exportación (¿a cuál de los dos `logo.principal` apunta?).

## Input
- `assets.json` → claves de `assets`, `graphicElements`, `palette`, `typography`
- `content.json` → `blocks[].id`, `ctas[].id`, claves de `copyVariants`
- `manifest.json` → `files[].path`
- `VariableMap` → nombres de columna/variable (por plantilla)

## Reglas — todos `blocking`
- Dos assets con la misma clave → duplicado.
- Dos bloques con el mismo `id` → duplicado.
- Dos CTAs con el mismo `id` → duplicado.
- Dos variables de plantilla con el mismo nombre en el mismo `row` → duplicado.
- Dos archivos con el mismo `path` en el manifest → duplicado.
- Índices de bloque (`index`) repetidos → `blocking` (rompe el orden de slides).

## Output
```jsonc
{ "validator": "duplicate-names", "severity": "blocking",
  "target": { "scope": "assets", "key": "photo.antes.dormitorio" },
  "message": "Clave de asset duplicada: aparece 2 veces en assets.json" }
```

## Por qué siempre blocking
No hay forma segura de "elegir" entre dos claves iguales. La deduplicación automática arriesga exportar el asset equivocado. Se corrige en el paquete y se re-versiona.
