# Plantilla en Blanco: Content Package

> Esqueleto para copiar y completar. Es el punto de partida para producir **cualquier** pieza de contenido de Alumfer.

## Cómo usar

1. **Copiá** esta carpeta a `content/drafts/` con el nombre canónico:
   ```
   CP-{YYYYMMDD}-{plataforma}-{slug}-v1/
   ```
   Ejemplo: `CP-20260715-instagram-techos-adrogue-v1/`

2. **Completá** los 8 archivos reemplazando los valores `TODO` / `<...>`. Guía completa del estándar en `../../exporters/core/content-package.md`.

3. **Poné los assets reales** (fotos, logo) en `assets/` y referencialos por clave en `assets.json`.

4. **Dejá que el Quality Controller** marque `checklist.md`. Cuando esté aprobado, cambiá `manifest.status` a `ready-for-export`.

5. **Exportá** con el agente `canva-exporter` (`../../workflows/content-package-export.md`).

## Atajo
El skill `../../skills/content-packaging.md` hace estos pasos por vos a partir de un guión o carrusel ya escrito. Esta plantilla es el molde que ese skill rellena — útil para entender la estructura o para armar un paquete a mano.

## Los `{{brand.*}}`
Los placeholders como `{{brand.whatsapp}}` se resuelven automáticamente contra `../../brand/brand-profile.json` al exportar. No los reemplaces a mano: dejalos tal cual.
