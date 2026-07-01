# Validador: `asset-existence`

Confirma que cada recurso visual declarado exista realmente en el paquete. Un `assetRef` que apunta a un archivo inexistente produce una exportación rota que solo se descubre dentro de la herramienta de diseño — demasiado tarde.

## Input
- `assets.json` → todas las categorías con `path`
- El sistema de archivos del paquete (carpeta `assets/`)

## Reglas
- Todo asset con `required: true` cuyo `path` no exista en disco → `blocking`.
- Todo asset con `required: false` inexistente → `warning`.
- Todo `assetRef` usado en `content.json` que **no** esté declarado en `assets.json` → `blocking` (referencia colgante).
- Todo asset declarado en `assets.json` que **ningún** bloque referencia → `info` (asset huérfano; probablemente sobra).
- Rutas absolutas o que escapen de la raíz del paquete (`../`) → `blocking` (violan la regla de auto-contención).

## Output
```jsonc
{ "validator": "asset-existence", "severity": "blocking",
  "target": { "assetRef": "photo.despues.dormitorio", "path": "assets/fotos/quilmes-despues.jpg" },
  "message": "Archivo no encontrado" }
```

## Por qué es blocking y no warning
Alumfer nunca usa stock ni placeholders (`brand/voice.md`). Un asset faltante significa que la pieza está incompleta, no que se pueda "rellenar después". Sin el archivo real, no hay exportación.
