# Shared Design System

Fuente de verdad visual de Alumfer. Usada por todos los productos del monorepo.

## Archivos

| Archivo            | Qué es                                                       |
|--------------------|--------------------------------------------------------------|
| `tokens.css`       | Variables CSS listas para consumir (colores, tipos, espacios)|
| `brand-tokens.md`  | Documentación y razonamiento de cada token                   |

## Regla de uso

**Ningún producto define sus propios colores o tipografías.**
Todo cambio visual parte de aquí y se propaga.

- **Website**: importa `tokens.css` directamente (está copiado en `apps/website/` para deploy estático)
- **Presupuestos**: misma copia en `apps/presupuestos/tokens.css`
- **Creative OS**: usa `brand-tokens.md` como referencia al generar contenido, prompts y plantillas
- **Futuros productos**: importan desde esta carpeta

## Sincronización

Si modificás `tokens.css` en `apps/website/` o en `apps/presupuestos/`, refleja el cambio aquí también.
Si modificás aquí, copiá a `apps/presupuestos/tokens.css`. El sitio web ya no usa este archivo: desde octubre de 2026 sus tokens viven en `apps/website/site.css` (`:root`).

> Próxima mejora: script de sync automático en `tools/sync-tokens.mjs`
