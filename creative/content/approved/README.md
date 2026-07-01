# Approved — Contenido Aprobado Esperando Publicar

> Este directorio contiene contenido que completó el pipeline completo (QC + aprobación del Instagram Director) y está listo para publicar según el calendario.

---

## Qué significa "Aprobado"

Una pieza en approved/ cumplió:
- QC final de quality-control.md sin errores CRÍTICOS
- Aprobación del Instagram Director
- Caption, hashtags y alt text listos
- Fecha y hora de publicación agendada

**No publicar desde approved/ sin verificar que la fecha y hora agendada es correcta.**

---

## Naming convention

`YYYYMMDD-[producto]-[barrio]-READY.md`

Ejemplo: `20240825-dvh-quilmes-READY.md`

El sufijo `-READY` indica que la pieza está lista para publicar.

---

## Contenido mínimo del archivo

```markdown
# Pieza Lista: [título]

**Aprobado por:** [quién]
**Fecha de aprobación:** YYYY-MM-DD
**Fecha de publicación:** YYYY-MM-DD
**Hora de publicación:** HH:MM (Argentina, UTC-3)

## Archivo de video/imagen
[ruta o nombre del archivo final]

## Caption final
[El caption completo listo para copiar-pegar]

## Hashtags
[El set de hashtags listo para copiar-pegar]

## Alt Text
[El alt text manual para la imagen/cover del reel]

## Miniatura del reel
[Descripción o timecode del frame elegido como miniatura]

## Configuración de publicación
- Ubicación de Instagram: [barrio / ciudad]
- Categoría (si aplica): [construcción / diseño de interiores / etc.]
```

---

## Flujo

```
drafts/ → (QC + aprobación) → approved/
approved/ → (publicado) → published/
```

**Después de publicar:** mover el archivo a `published/` con los datos de publicación real (hora exacta, link del post).
