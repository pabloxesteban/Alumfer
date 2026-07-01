# Ejemplos

> Un Content Package **completo y real** más su exportación a Canva. Sirve como referencia canónica para agentes y como caso de prueba de los validadores y del exportador.

## Contenido

```
examples/
├── CP-20260701-instagram-dvh-quilmes-v1/   ← Content Package de ejemplo (input)
│   ├── manifest.json
│   ├── content.json
│   ├── metadata.json
│   ├── assets.json
│   ├── captions.md
│   ├── hashtags.txt
│   ├── checklist.md
│   ├── preview.md
│   └── assets/                              ← recursos (placeholders documentados)
└── expected-canva-export/                   ← output esperado del Canva Exporter
    ├── bulk-create.csv
    ├── bulk-create.json
    ├── variables.json
    ├── template-map.json
    ├── asset-manifest.csv
    └── report.md
```

## Cómo leerlo

1. Abrí `CP-.../preview.md` para entender la pieza sin tocar los JSON.
2. Mirá `CP-.../content.json` para ver el modelo de bloques/elementos en acción.
3. Compará con `expected-canva-export/bulk-create.csv`: cada bloque del content se volvió una fila del CSV.
4. `expected-canva-export/report.md` muestra cómo se ve un reporte final exitoso.

Este ejemplo es el mismo que se usa como caso a lo largo de toda la documentación del módulo (DVH en Quilmes, dato ancla: 6 grados de diferencia).

## Nota sobre los assets
Los archivos en `assets/` son **placeholders documentados** (`.txt` que describen la foto real que iría ahí). En un paquete de producción serían las fotos/logos reales de la obra. El validador `asset-existence` verifica presencia de archivo, no que sea una imagen válida — por eso el ejemplo es autoconsistente.
