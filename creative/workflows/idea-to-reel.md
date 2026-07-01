# Workflow: De Idea a Reel Publicado

## Visión general

```
IDEA → BRIEF → GUIÓN → STORYBOARD → GRABACIÓN → EDICIÓN → APROBACIÓN → CAPTION → CONTENT PACKAGE → PUBLICACIÓN
```

Cada etapa tiene un responsable, un output y un criterio de avance.

> **Regla del Creative OS:** este workflow **nunca termina solo en texto**. Siempre finaliza produciendo un **Content Package** (ver `../exporters/core/content-package.md`), una estructura reutilizable que cualquier exportador (Canva, CapCut…) puede consumir. La publicación se hace a partir del paquete, no de archivos sueltos.

---

## Etapa 1: IDEA
**Responsable**: Strategist (o cualquiera del equipo)
**Duración**: 5 min

Preguntas a responder:
- ¿Qué obra / producto / proceso queremos mostrar?
- ¿Por qué ahora? (obra reciente, temporada, pregunta frecuente)
- ¿Qué queremos que sienta o haga el espectador al terminar?

Output: 2-3 líneas que capturen la idea central.

---

## Etapa 2: BRIEF
**Responsable**: Strategist + Creative Director
**Duración**: 10 min

Template de brief (ver `templates/brief-reel.md`):
- Tipo de reel: proceso / resultado / educativo / testimonial
- Hook propuesto (primeros 2 segundos)
- Material disponible: fotos/videos existentes o nueva grabación necesaria
- Duración objetivo: 15s / 30s / 60s
- Música: referencia de estilo (no canción específica)

---

## Etapa 3: GUIÓN
**Responsable**: Copywriter
**Duración**: 15-30 min

Agente a usar: `agents/copywriter.md` → formato "Guión de reel"

Output: doc en `content/reels/[slug]-guion.md` con:
- Time codes
- Texto sobreimpreso (si aplica)
- Narración (si aplica)
- Descripción de transiciones

---

## Etapa 4: STORYBOARD
**Responsable**: Creative Director
**Duración**: 15 min

No necesita ser visual complejo. Puede ser lista de tomas:
```
00:00-00:02 — Primer plano: detalle de herraje cerrando
00:02-00:05 — Wide: ventana instalada con luz natural
00:05-00:12 — Proceso: corte de perfil en taller
00:12-00:18 — Texto: "Lo fabricamos. Lo instalamos."
00:18-00:22 — Logo + WhatsApp
```

Output: lista de tomas en el mismo doc de guión.

---

## Etapa 5: GRABACIÓN
**Responsable**: equipo Alumfer en obra/taller
**Duración**: variable

Checklist de grabación:
- [ ] Horizontal (para feed) O vertical (para reels — preferido)
- [ ] Buena luz natural o iluminación artificial estable
- [ ] Audio: sin ruido de herramientas si hay narración
- [ ] Mínimo 3 tomas de cada escena (para editar)
- [ ] Primer plano de terminación/detalle siempre

---

## Etapa 6: EDICIÓN
**Responsable**: editor (CapCut / Premiere / DaVinci)
**Duración**: 30-60 min

Estilo visual:
- Transiciones: corte limpio o deslizamiento suave (sin efectos recargados)
- Color: mantener temperatura original de la foto (no sobrefiltar)
- Texto sobreimpreso: Montserrat 600 o Inter 400, blanco sobre oscuro
- No usar plantillas de CapCut con marca de agua o estilos ajenos

---

## Etapa 7: APROBACIÓN
**Responsable**: Brand Guardian + Creative Director
**Duración**: 10 min

Agente a usar: `agents/brand-guardian.md`

Criterios de aprobación rápida:
- Material es de obra propia ✓
- Texto respeta voz de marca ✓
- No hay elementos visuales ajenos al sistema ✓
- Puntaje Brand Guardian ≥ 4/5 ✓

---

## Etapa 8: CAPTION
**Responsable**: Copywriter
**Duración**: 10 min

Agente a usar: `agents/copywriter.md` → formato "Caption de foto de obra"

Output: caption final + 8 hashtags en comentario

---

## Etapa 8.5: CONTENT PACKAGE
**Responsable**: skill `content-packaging` + Quality Controller
**Duración**: 15 min

Antes de publicar, todo lo producido (guión, cover, caption, hashtags, assets) se empaqueta en un **Content Package** estándar.

Skill a usar: `skills/content-packaging.md`

Output: carpeta `content/drafts/CP-{fecha}-instagram-{slug}-v1/` con los 8 archivos del estándar (`content.json`, `metadata.json`, `assets.json`, `captions.md`, `hashtags.txt`, `checklist.md`, `preview.md`, `manifest.json`) + `assets/`.

Criterio de avance: el `checklist.md` queda aprobado por el Quality Controller y el paquete pasa a estado `ready-for-export`. A partir de acá, si se quiere una portada o gráfica en Canva, la produce el agente `canva-exporter` desde el paquete — nunca a mano.

---

## Etapa 9: PUBLICACIÓN
**Responsable**: quien maneja el perfil
**Timing**: según calendario del Strategist

Checklist final:
- [ ] Reel subido en calidad original (no comprimir antes de subir)
- [ ] Caption copiado (sin errores de tipeo)
- [ ] Hashtags en primer comentario (no en caption)
- [ ] Link en bio actualizado si el reel lleva a algo específico
- [ ] Notificar al equipo para interactuar en la primera hora (boost de alcance)

---

## Tiempo total estimado

Sin grabación nueva: **1-2 horas**
Con grabación nueva: **1 día** (más el tiempo de obra)
