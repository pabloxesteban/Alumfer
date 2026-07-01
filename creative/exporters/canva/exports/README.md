# exports/ — Salida Generada

> Directorio de **output** del Canva Exporter. Cada exportación crea aquí una subcarpeta `<packageId>/` con los artefactos listos para Canva.

```
exports/
└── CP-20260701-instagram-dvh-quilmes-v1/     ← una carpeta por paquete exportado
    ├── bulk-create.csv
    ├── bulk-create.json
    ├── variables.json
    ├── template-map.json
    ├── asset-manifest.csv
    └── report.md
```

## Características
- **Contenido generado, no fuente.** No se edita a mano. Para cambiar el output, se corrige el Content Package y se re-exporta.
- **Idempotente.** Re-exportar el mismo paquete (misma versión) produce los mismos archivos.
- **Efímero por diseño.** Se puede borrar y regenerar. Por eso está `.gitignore`-ado (ver `.gitignore` del repo si se decide no versionar salidas).

Para ver un ejemplo completo de cómo se ve una exportación, mirá `../examples/expected-canva-export/`.
