# Handoff · Pablo Fernandez, diseño y desarrollo web

Contexto para continuar el trabajo en otra sesión. Resume quién es Pablo,
qué se hizo, qué decisiones se tomaron y qué falta.

---

## Quién es

- **Pablo Fernandez**, 30 años, Buenos Aires, Argentina (GMT-3).
- **Profesión:** diseñador y desarrollador web independiente (freelance).
  Diseña y programa sitios completos: arquitectura de la información, diseño
  UX/UI, desarrollo front-end, SEO local, textos y publicación.
- **Posicionamiento:** sitios web para empresas establecidas (fabricantes,
  oficios, empresas de servicios) cuyo trabajo es mejor que su presencia
  online. Sitios rápidos, mobile-first, fáciles de mantener, sin frameworks
  pesados ni costos mensuales de plataforma.
- **Mercado objetivo:** clientes fuera de Argentina (Estados Unidos, Europa).
  Todo lo público va en **inglés estadounidense**.
- **Trayectoria:** vivió y trabajó 7 años afuera (4 en Nueva Zelanda, 3 en
  Australia). Inglés profesional.
- **Formación:** aprendió por su cuenta. No tiene empleos previos en el rubro.
  **No quiere que eso se destaque en público**, pero tampoco se inventa nada:
  el perfil se apoya en proyectos reales, proceso y resultados verificables.

### Regla firme

No inventar empleadores, puestos, clientes, años de experiencia ni métricas.
Se presenta como profesional independiente con trabajo real. Omitir cómo
aprendió está bien; afirmar algo falso, no.

---

## Trabajo real que respalda el perfil

**Alumfer** (alumfer.com.ar): sitio corporativo para una fábrica familiar de
aberturas de aluminio a medida en Adrogué, Buenos Aires (desde 2010, más de 500
obras). Diseñado y desarrollado por Pablo.

- 38 páginas: inicio, 6 páginas de servicio, 27 páginas por localidad para
  búsquedas locales y 4 guías largas para clientes.
- Sitio estático (HTML, CSS con variables, JavaScript sin dependencias),
  ilustraciones SVG animadas con CSS, formulario en PHP, datos estructurados
  (LocalBusiness, FAQPage), WebP, Google Analytics 4, publicación automática
  con GitHub Actions.
- Repositorio: `pabloxesteban/Alumfer` (el sitio vive en `apps/website/`).
- El sitio está en español; la presentación del caso, en inglés.
- La app interna de presupuestos de Alumfer (`apps/presupuestos/`) **no se
  muestra** en el portfolio.

---

## Qué está hecho

### Behance (publicado o listo para publicar)

Todo en `portfolio/behance/` (rama `claude/focused-keller-3gizz1`):

- `laminas/`: 14 láminas en inglés a 2800 px de ancho + portada de grilla
  `cover-808x632.jpg`.
- `video/`: `desktop-walkthrough.mp4` (48 s) y `mobile-walkthrough.mp4` (36 s).
- `perfil/`: banner tipográfico (elegido) y banner con pantallas (alternativa).
- `README.md`: orden de carga definitivo, campos del proyecto (título, tags,
  categorías, herramientas, descripción) y texto de contacto final.
- `PERFIL.md`: textos del perfil personal en inglés (headline, About,
  servicios).
- `_src/`: fuente de las láminas (`boards.html`), scripts de captura,
  exportación y video, y las tipografías.

**Sistema visual de las láminas:** fondo `#EAE7E1`, Inter (500 títulos, 400
textos) y el logotipo de Alumfer tal como es (isotipo a la izquierda, ALUMFER
en mayúsculas en Archivo 800 expandida, bajada en IBM Plex Mono). En octubre de
2026 el sitio se rediseñó (azul noche y marino, Archivo + IBM Plex Mono,
lenguaje de plano técnico) y las láminas y los videos se rehicieron con el
sitio nuevo. Estilo editorial sobrio: sin brillos, sin
etiquetas numeradas, sin marcos de dispositivo falsos. Pablo pidió
explícitamente que nada se vea "hecho por IA".

**Campos de Behance:** título `Alumfer — Corporate Website`; categorías Web
Design, UI/UX y Web Development (no Branding: el logo ya existía).

### Textos de perfil (primera persona, sin "studio")

**Headline:** I design and build websites for established businesses: clear,
fast, and built to bring in inquiries.

**About:**
> I'm Pablo Fernandez, a web designer and developer based in Buenos Aires,
> working with clients worldwide.
>
> I design and build websites for established businesses: manufacturers,
> trades and service companies whose work is better than their online
> presence. I handle every project end to end, from information architecture
> and interface design to front-end development, local SEO and launch. You
> work directly with me from the first call to the final release, with no
> handoffs and nothing lost in between.
>
> My approach is simple: understand how your customers decide, structure the
> content around that, then design and build a site that is fast, clear and
> easy to maintain. No bloated frameworks, no monthly platform fees.
>
> Based in GMT-3, with working hours that overlap with the US East Coast and
> Europe. I reply within one business day.

### LinkedIn (en curso)

- Headline: `Web Designer & Developer · UX/UI · Websites for established businesses · Available worldwide`
- Ubicación: Greater Buenos Aires. Industria: Design Services.
- Servicios publicados: Web Design, Web Development, User Experience Design
  (UED), Interaction Design, Search Engine Optimization (SEO), Content
  Strategy, Copywriting.
- Media de servicios: caso en Behance, láminas seleccionadas y enlace al sitio.
- Alumfer cambió su `og:image` a `og-alumfer.png`; LinkedIn tenía cacheada la
  vista previa vieja. Solución: Post Inspector o enlace con `?ref=linkedin`.

---

## Pendiente inmediato: actualizar el proyecto en Behance

El sitio se rediseñó y las láminas y los videos ya están rehechos en esta
rama. Falta reemplazarlos en el proyecto publicado de Behance. Eso se hace
desde una sesión local con Claude in Chrome, porque Behance no tiene API y la
sesión de Pablo está abierta en su Chrome.

**Archivos** (rama `claude/focused-keller-3gizz1`): `portfolio/behance/laminas/`
y `portfolio/behance/video/`.

**Pasos en Behance** (proyecto "Alumfer — Corporate Website" → Edit project):

1. Borrar todas las imágenes y videos actuales. **No borrar** el módulo de
   texto de contacto del final.
2. Subir, a ancho completo y en este orden: `01-cover.jpg`, `02-overview.jpg`,
   `03-information-architecture.jpg`, `04-brand-system.jpg`,
   `05-homepage-hero.jpg`, `desktop-walkthrough.mp4`, `06-homepage.jpg`,
   `07-project-gallery.jpg`, `08-process-and-catalog.jpg`,
   `09-reviews-and-contact.jpg`, `10-mobile.jpg`, `mobile-walkthrough.mp4`,
   `11-local-search-pages.jpg`, `12-buyer-guides.jpg`, `13-build.jpg`,
   `14-closing.jpg`. El módulo de texto de contacto queda al final.
3. Espaciado entre módulos 0 y fondo `#EAE7E1`.
4. Portada (Project cover): `cover-808x632.jpg`, encuadre completo.
5. Descripción: reemplazar los dos párrafos bajo "THE APPROACH" y la última
   oración de "THE RESULT" por los de `portfolio/behance/README.md`,
   sección 3.
6. Tools: quitar GSAP.
7. No tocar título, etiquetas ni categorías.
8. **Antes de guardar, mostrarle a Pablo cómo quedó y esperar su OK.** Si
   aparece una ventana del sistema para elegir archivos que Claude no puede
   manejar, pedirle a Pablo que los seleccione.

---

## Pendientes

1. **Experiencia en LinkedIn:** falta que Pablo indique los trabajos reales en
   Nueva Zelanda y Australia (puesto, empresa, años) y desde qué año hace
   sitios para otros. Con eso se redactan las entradas: freelance actual
   (Self-employed) y los empleos afuera, destacando inglés, trato con
   clientes y adaptación.
2. **Foto de perfil:** el archivo .heic no llegó (la app no acepta HEIC).
   Hay que recibirla en JPG/PNG y dejarla en 1000 × 1000 px, cara centrada.
3. **Testimonio y recomendación de Alumfer** para Behance y LinkedIn.
4. **Más casos:** el objetivo son 3 proyectos con el mismo formato de
   presentación. Si faltan clientes, un rediseño conceptual de un sitio real,
   aclarado como concepto.
5. **Sitio propio de Pablo**, con el mismo nivel de cuidado.
6. Completar `[email]` y `[website]` en el texto de contacto del proyecto de
   Behance.

---

## Cómo trabaja Pablo

- Escribe en español rioplatense; las respuestas van en español.
- Prioriza que todo se vea profesional, sobrio y "no hecho por IA".
- Prefiere decisiones tomadas con criterio y explicadas en pocas palabras.
- Revisa cada pieza con atención y pide ajustes concretos.
