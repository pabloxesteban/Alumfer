# Skill: Content Packaging

> Transforma **cualquier** contenido generado por el Creative OS en un **Content Package** estándar. Es el paso obligatorio entre la producción creativa y cualquier exportador.

---

## Descripción del Skill

Todo workflow del Creative OS termina produciendo contenido: un guión de reel, un carrusel educativo, un caption, una comparativa. Este skill toma esa salida —cualquiera sea su forma— y la empaqueta en la estructura canónica de ocho archivos definida en `exporters/core/content-package.md`.

**Regla del sistema:** ningún workflow termina solo en texto. Termina en un Content Package. Este skill es cómo se cumple esa regla.

---

## INPUT

Cualquiera de estos, en cualquier combinación:
- Un guión de reel (con time codes o escenas).
- Un carrusel (secuencia de slides con titulares y textos).
- Un caption + hashtags.
- Una idea aprobada con material de obra disponible.
- La salida de `agents/copywriter.md`, `agents/creative-director.md`, etc.

Más el contexto estratégico mínimo: objetivo, plataforma, campaña, obra/zona de referencia.

---

## PROCESS

### Paso 1 — Determinar el `contentType`
Mapear la pieza al tipo del estándar: `instagram-carousel`, `story`, `quote`, `before-after`, `testimonial`, `faq`, `reel-cover`, `promo`, `oferta`, `comparativa`, `educativo`, `reel`, `photo`. Esto determina qué plantilla usará luego el exportador.

### Paso 2 — Descomponer en bloques
Convertir la pieza en `blocks[]`, cada uno con un `role` (`hook`, `context`, `value`, `proof`, `cta`, `cover`) y sus `elements` tipados (`eyebrow`, `headline`, `body`, `data`, `image`, `cta`, `logo`). Un slide/escena = un bloque.

### Paso 3 — Escribir `content.json`
- Textos en los elementos (nunca en los assets).
- Toda imagen por `assetRef`; todo CTA definido una vez en `ctas[]` y referenciado por `ctaRef`.
- Completar `narrative` (throughline, arco emocional, promesa a la audiencia).

### Paso 4 — Escribir `metadata.json`
Objetivo, embudo, campaña, autor, idioma, branding (voz artesano, paleta, logo al cierre), prioridad, plataformas compatibles, tipo de publicación, ratio, geo, scheduling.

### Paso 5 — Inventariar `assets.json`
Listar **todos** los recursos: logos, fotos, videos, colores (paleta de marca), tipografías (Montserrat/Inter), elementos gráficos, fondos. Rutas relativas. Marcar `required`.

### Paso 6 — Generar las proyecciones derivadas
- `captions.md` — caption por plataforma (Instagram, Facebook, LinkedIn, TikTok, Google Business), cada uno con el tono de `brand/voice.md`.
- `hashtags.txt` — clasificados: principales, secundarios, locales, SEO, marca.
- `preview.md` — resumen navegable (objetivo, resumen, miniatura textual, slides, caption, CTA, assets).
- `checklist.md` — el checklist de exportación (lo completa el Quality Controller, no este skill).

### Paso 7 — Escribir `manifest.json`
Índice del paquete, versión del estándar, estado inicial `draft`, lista de archivos, exportadores compatibles.

### Paso 8 — Validar contra los schemas
Correr los JSON Schemas de `exporters/canva/schemas/` sobre los cuatro JSON. Si alguno falla, el paquete no está bien formado: corregir antes de avanzar.

### Paso 9 — Entregar para revisión
Poner el paquete en `content/drafts/` en estado `draft`. El Brand Guardian y el Quality Controller lo revisan; cuando el checklist queda aprobado, el estado pasa a `ready-for-export` y queda listo para el Canva Exporter.

---

## OUTPUT

Una carpeta `CP-{YYYYMMDD}-{plataforma}-{slug}-v{n}/` con los ocho archivos + `assets/`, validada contra los schemas y en estado `draft` (o `ready-for-export` si ya pasó QC).

---

## Convención de nombre y ubicación

- **Nombre:** `CP-{YYYYMMDD}-{plataforma}-{slug}-v{n}/` (ver estándar).
- **En producción:** `content/drafts/` → `content/approved/` → al exportar, referenciado por el exportador.
- **Ejemplo de referencia:** `exporters/canva/examples/CP-20260701-instagram-dvh-quilmes-v1/`.

---

## Reglas de calidad del empaquetado

1. **Una fuente de verdad por dato.** Los `.md` derivan de los `.json`; nunca contradicen.
2. **Nada de rutas absolutas.** Todo relativo a la raíz del paquete.
3. **Nada de stock.** Todo asset es obra propia (`brand/voice.md`).
4. **Agnóstico de herramienta.** El paquete no menciona Canva/Figma/CapCut: eso es trabajo del exportador.
5. **Completo o no está listo.** Un asset `required` faltante o un CTA vacío impiden llegar a `ready-for-export`.

---

## ANTI-PATTERNS del empaquetado

- **Terminar un workflow en un `.md` suelto de caption.** No es un entregable del sistema; el entregable es el Content Package.
- **Meter texto en `assets.json`.** Los assets son recursos; el texto vive en `content.json`.
- **Copiar el valor de un asset en vez de referenciarlo.** Rompe la fuente única de verdad; usar `assetRef`.
- **Empaquetar contenido fuera de marca "para arreglarlo después".** El paquete refleja lo aprobado; lo no aprobado no se empaqueta.
- **Saltear la validación de schema.** Un paquete que no valida hace fallar al exportador más adelante, cuando es más caro.

---

## EXAMPLE

**Input:** guión aprobado de carrusel sobre DVH en Quilmes (dato ancla: 6 grados).

**Output:** `CP-20260701-instagram-dvh-quilmes-v1/` con 4 bloques (hook → valor → valor → CTA), assets de las 3 fotos + logo, captions por plataforma, hashtags clasificados, preview y checklist. Validado y listo para el Canva Exporter.

Ver el paquete completo en `exporters/canva/examples/CP-20260701-instagram-dvh-quilmes-v1/`.
