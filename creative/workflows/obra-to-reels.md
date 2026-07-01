# Workflow: Obra to Reels

> Pipeline completo desde una obra real hasta el reel publicado en Instagram

---

## Visión General del Pipeline

```
OBRA REAL
    ↓
BRIEFING FOTOGRÁFICO
    ↓
CAPTURA DE MATERIAL (foto + video)
    ↓
SELECCIÓN DE MATERIAL
    ↓
CONCEPTO NARRATIVO
    ↓
GUIONES MÚLTIPLES (3 versiones)
    ↓
SELECCIÓN DE GUIÓN
    ↓
EDICIÓN
    ↓
ANÁLISIS DE VIDEO EDITOR ANALYST
    ↓
MOTION REVIEW
    ↓
QC FINAL
    ↓
CAPTION + HASHTAGS + ALT TEXT
    ↓
CONTENT PACKAGE
    ↓
APROBACIÓN INSTAGRAM DIRECTOR
    ↓
PUBLICACIÓN
```

> **Regla del Creative OS:** este pipeline **no termina en un archivo de video suelto más un caption**. Termina en un **Content Package** reutilizable (`../exporters/core/content-package.md`), que luego alimenta a la publicación y a cualquier exportador (Canva para la portada/gráficas, CapCut para el reel).

---

## Paso 1 — Obra Real

**¿Cuándo comienza el pipeline?**

Cuando hay una obra terminada o en proceso que tiene potencial de contenido. No toda obra necesita ser contenido — pero toda obra debería ser evaluada.

**Criterios para activar el pipeline:**

| Criterio | Descripción |
|---|---|
| Resultado visual fuerte | ¿La obra tiene un resultado que se ve bien en foto/video? |
| Historia disponible | ¿Hay un problema que se resolvió, un antes interesante, un dato técnico que vale contar? |
| Material obtenible | ¿Se puede ir a filmar/fotografiar la obra, o el cliente puede enviar fotos de calidad? |
| Representatividad | ¿Es representativa de lo que Alumfer hace bien? |

Si una obra no pasa al menos 3 de estos 4 criterios, puede pasar al archivo de referencia interna pero no necesariamente se produce contenido.

---

## Paso 2 — Briefing Fotográfico

Antes de la visita a la obra (o antes de pedir fotos al cliente), definir qué material se necesita.

**Template de briefing fotográfico:**

```
OBRA: [dirección / barrio]
PRODUCTO: [ventanas DVH / portón / cerramiento / etc.]
TIPO DE CONTENIDO OBJETIVO: [reel / foto sola / carrusel]
DURACIÓN OBJETIVO: [15s / 30s / 45s / 60s]

PLANOS NECESARIOS:
□ Plano ANTES (si está disponible): [descripción]
□ Plano general del resultado: [descripción]
□ Plano detalle: [qué detalle específico — sellado / herraje / vidrio / etc.]
□ Plano de proceso (si aplica): [instalación, fábrica, etc.]
□ Plano de contexto del espacio: [el ambiente completo, no solo la abertura]

DATO TÉCNICO A INCLUIR: [DVH / policarbonato 10mm / perfil Herrero / etc.]
ZONA/BARRIO: [para mención en el contenido]
HISTORIA EN UNA LÍNEA: [ej: "quincho que no se usaba en invierno → ahora sí"]
```

---

## Paso 3 — Captura de Material

**Opción A — Visita de obra (ideal):**
- Llevar equipo de filmación: celular con cámara de calidad suficiente (iPhone 12+ o equivalente)
- Grabar en formato vertical (9:16) para facilitar la edición de reels
- Grabar también horizontal para opciones de carrusel o foto
- Iluminación natural siempre preferible — no usar flash directo en aluminio (genera reflejo)
- Grabar siempre el detalle del sellado, del herraje, y del cierre de la abertura

**Opción B — Fotos del cliente:**
- Enviar el briefing fotográfico al cliente con ejemplos visuales de qué se busca
- Pedir mínimo 5 fotos: general del resultado + 2-3 detalles + 1 foto de contexto del ambiente
- Especificar: buena iluminación natural, sin flash, si es posible sin personas en el encuadre

**Lo que nunca:**
- Fotos con marcas de agua de otros
- Material de stock genérico
- Fotos de catálogo del fabricante de perfiles
- Video grabado en horizontal si el destino es Reel

---

## Paso 4 — Selección de Material

Antes de editar, curar el material.

**Proceso de selección:**

1. Ver todo el material disponible una vez completo, sin editar
2. Elegir los 6-10 mejores planos (para un reel de 30-45s se necesitan 5-8 planos bien elegidos)
3. Verificar calidad técnica de cada plano seleccionado: enfoque, exposición, estabilidad
4. Identificar el "plano estrella" — el mejor plano del resultado final
5. Identificar el "plano proceso" — el más interesante del trabajo en ejecución
6. Confirmar: ¿hay suficiente material para el arco ANTES → PROCESO → DESPUÉS?

Si el material no alcanza para el arco completo, definir qué versión simplificada es posible con lo disponible.

---

## Paso 5 — Concepto Narrativo

Aplicar el skill `storytelling.md` para definir el eje de la historia.

**Output de esta etapa:** Una línea de concepto + ángulo narrativo seleccionado.

Ejemplo:
> Concepto: "Quincho en Temperley que pasó de usarse 4 meses a usarse 12."
> Ángulo: Transformación del uso del espacio.
> Dato ancla: "Primera reunión familiar en julio adentro del quincho."

---

## Paso 6 — Tres Versiones de Guión

Aplicar el skill `reel-creation.md` para generar 3 versiones del guión con distintos enfoques.

**Por qué 3 versiones:**
- Versión A: máximo impacto emocional (antes/después)
- Versión B: máximo peso técnico (proceso + especificación)
- Versión C: balance (brief estándar de Alumfer)

El Instagram Director o el Creative Director selecciona una versión para producir.

**No se producen las 3 versiones.** Se elige una y se ejecuta con calidad.

---

## Paso 7 — Selección de Guión

El Instagram Director revisa las 3 versiones y selecciona considerando:
- ¿Cuál se adapta mejor al material disponible?
- ¿Cuál encaja mejor con el mix del mes (calendario de contenido)?
- ¿Cuál tiene el gancho más fuerte para el momento?

La selección es documentada con la razón.

---

## Paso 8 — Edición

El editor recibe:
- Guión seleccionado (secuencia de planos, duración estimada por plano)
- Specsheet de motion del Motion Designer (energía, transiciones, tipografía, grade)
- Material visual curado (solo los planos seleccionados)

Output de edición: reel en 9:16, con audio, texto en pantalla si corresponde, color grade aplicado.

**Primera entrega del editor es un "cut" sin refinamiento de color — para aprobar la secuencia antes de invertir tiempo en el grade.**

---

## Paso 9 — Análisis de Video Editor Analyst

El Video Editor Analyst recibe el cut y lo evalúa en 5 dimensiones (ver `video-editing-analysis.md`).

- Si hay problemas críticos → vuelve al editor con lista de cambios
- Si hay ajustes menores → el editor los aplica antes del Motion Review
- Si está APROBADO → pasa al Motion Review

---

## Paso 10 — Motion Review

El Motion Designer verifica específicamente las decisiones de motion del reel (ver `motion-design.md`).

- Transiciones dentro del repertorio
- Tipografía correcta y legible
- Color grade en paleta de marca

Si hay ajustes → editor los aplica.
Si está APROBADO → pasa al QC.

---

## Paso 11 — QC Final

El Quality Controller corre el checklist completo de `quality-control.md`.

- Bloque técnico, contenido, texto, marca, y publicación
- Si hay errores CRÍTICOS → rechaza y devuelve con lista exacta de qué corregir
- Si está APROBADO → pasa a caption + publicación

---

## Paso 12 — Caption + Hashtags + Alt Text

El Copywriter redacta el caption final usando `copywriting.md` y `caption-structure.md`.
El SEO skill `seo-instagram.md` define los hashtags y el alt text manual.

Output: caption listo + hashtags (5-15) + alt text para cada imagen o cover del reel.

---

## Paso 12.5 — Content Package

Todo lo producido se empaqueta en un **Content Package** estándar antes de la aprobación final.

Skill a usar: `skills/content-packaging.md`

- El reel, la cover, el caption por plataforma, los hashtags clasificados y los assets se estructuran en la carpeta `content/drafts/CP-{fecha}-instagram-{slug}-v1/`.
- El `contentType` será `reel` (con `reel-cover` para la portada si se genera en Canva).
- El `metadata.json` registra objetivo, campaña, obra/zona y tipo de publicación — datos que luego usa `analytics/template-performance.md`.

Output: Content Package en estado `ready-for-export` con `checklist.md` aprobado por el Quality Controller. Si se necesita portada o gráfica en Canva, la produce el agente `canva-exporter` desde el paquete.

---

## Paso 13 — Aprobación del Instagram Director

El Instagram Director revisa la pieza completa (video + caption + hashtags) y confirma publicación.

En el 90% de los casos que llegaron hasta acá, la aprobación es inmediata. Si hay observación, se resuelve puntualmente antes de publicar.

---

## Paso 14 — Publicación

- Publicar en la fecha/hora agendada según el calendario del mes
- Configurar: ubicación, miniatura manual del reel, categoría si corresponde
- Publicado → registrar en `content/published/` con datos básicos de la obra y el post

---

## Tiempos Estimados del Pipeline

| Paso | Tiempo estimado |
|---|---|
| Briefing fotográfico | 15 min |
| Captura en obra | 30-60 min |
| Selección de material | 20 min |
| Concepto narrativo | 15 min |
| 3 versiones de guión | 30 min |
| Selección de guión | 10 min |
| Edición (cut) | 45-90 min |
| Video Editor Analyst | 20 min |
| Ajustes de edición | 20-30 min |
| Motion Review | 15 min |
| QC Final | 15 min |
| Caption + hashtags | 20 min |
| **Total estimado** | **~4-5 horas de trabajo** |

El pipeline completo de una obra a un reel publicado requiere aproximadamente medio día de trabajo distribuido entre varios roles.
