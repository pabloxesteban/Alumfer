# Alumfer · Behance case study (English)

Everything needed to publish the Alumfer website as a Behance project aimed at
international clients: the boards, the video, the cover and every text field,
ready to copy and paste.

Instrucciones en español; **todo lo que va entre bloques de cita o de código
se copia tal cual en Behance, en inglés.**

```
portfolio/behance/
├── laminas/          ← las láminas en inglés (2800 px de ancho, JPG)
├── video/            ← desktop-walkthrough.mp4 (42 s) y mobile-walkthrough.mp4 (28 s), 1920×1080
├── perfil/           ← banner del perfil
├── _src/             ← fuente de las láminas y scripts para regenerarlas
├── PERFIL.md         ← perfil y marca propia (textos en inglés)
└── README.md         ← este archivo
```

---

## 1. Orden de carga (definitivo)

`preview/` (tres partes) muestra cómo queda el proyecto completo, de arriba
abajo, tal como lo va a ver un visitante.

Subí los módulos **en este orden**, cada lámina **a ancho completo**, con
**espaciado 0** entre módulos y **color de fondo `#EAE7E1`** (Project settings →
Spacing / Background color).

| # | Módulo | Qué cuenta |
|---|--------|------------|
| 1 | `01-cover.jpg` | Quién es el cliente y qué se hizo |
| 2 | `02-overview.jpg` | El encargo, la ficha del proyecto y obras reales |
| 3 | `03-information-architecture.jpg` | Cómo se pensó: la estructura antes del diseño |
| 4 | `04-brand-system.jpg` | Con qué se diseñó: logo, paleta, tipografías |
| 5 | `05-homepage-hero.jpg` | El resultado, a pantalla completa |
| 6 | `video/desktop-walkthrough.mp4` | **Video:** el sitio funcionando en escritorio |
| 7 | `06-homepage.jpg` | La página completa de un vistazo |
| 8 | `07-project-gallery.jpg` | Galería de obras |
| 9 | `08-process-and-catalog.jpg` | Proceso y catálogo |
| 10 | `09-reviews-and-contact.jpg` | Confianza y contacto |
| 11 | `10-mobile.jpg` | La versión celular |
| 12 | `video/mobile-walkthrough.mp4` | **Video:** el sitio funcionando en celular |
| 13 | `11-local-search-pages.jpg` | Páginas para búsquedas locales |
| 14 | `12-buyer-guides.jpg` | Contenido: guías para clientes |
| 15 | `13-build.jpg` | Cómo está construido |
| 16 | `14-closing.jpg` | Cierre |
| 17 | *Módulo de texto* | Llamado a la acción con tu contacto (sección 4) |

**Por qué este orden.** Sigue la estructura de los casos de estudio mejor
valorados: contexto → proceso → sistema visual → resultado → detalle →
cierre. El video de escritorio aparece apenas se muestra el resultado, que es
cuando más atención hay; el de celular, junto a la lámina de celular.

**Cómo presentarlas.**

- **Todas a ancho completo, una debajo de otra.** Las láminas ya tienen su
  propia composición (imágenes chicas, grillas y textos dentro de cada una).
  Ponerlas en la grilla de Behance las achicaría a la mitad o a un tercio y
  los textos dejarían de leerse.
- **La variedad ya está en las láminas:** alternan fondo oscuro y claro,
  pantallas grandes y chicas, texto e imagen. Por eso no hace falta sumar
  grillas ni módulos extra.
- **Un solo módulo de texto de Behance, al final** (el de contacto): es texto
  real, se puede editar y deja tu email a mano. El resto del texto va dentro
  de las láminas para que la tipografía y el diseño se vean como los pensaste.
- **En el perfil**, la grilla muestra solo la portada de cada proyecto
  (`cover-808x632.jpg`). Todos los proyectos futuros deberían usar el mismo
  estilo de portada para que el perfil se lea como una marca.

**Project cover (grid thumbnail):** `laminas/cover-808x632.jpg` (exported at
2×, 1616 × 1264). Image only, no text on top, as Behance's curators recommend.
Use the full frame when cropping.

**Criterios que se mantuvieron en toda la serie**

- Inglés estadounidense en todos los textos: *aluminum*, *catalog*, *color*,
  *grays*.
- Terminología del rubro revisada: *double glazing* (DVH), *insect screens*
  (mosquiteros), *dry installation* (colocación en seco), *profile system*
  (línea de aluminio), *enclosures* (cerramientos).
- Las capturas quedan en español porque es el idioma real del sitio; se aclara
  donde corresponde. Traducirlas sería presentar un sitio que no existe.
- El logotipo de Alumfer se muestra sin traducir: es su marca.
- Ninguna métrica inventada. Las cifras que aparecen (desde 2010, más de 500
  obras, 38 páginas, 27 localidades) son reales y verificables.

---

## 2. Project fields

**Project title**

```
Alumfer — Corporate Website
```

Corto a propósito: en la grilla de Behance el título se corta a los ~30
caracteres, y "Corporate Website" es lo que busca un cliente.

**Short description** (Behance shows it under the title and in search)

```
Corporate website for Alumfer, a family-run aluminum window and door manufacturer in Buenos Aires. Information architecture, UX/UI design, front-end development and local SEO, built to turn visits into quote requests.
```

**Category** (3, por tu rol en el proyecto)

1. Web Design
2. UI/UX
3. Web Development

*No usar "Branding": el logo y la identidad de Alumfer ya existían. Si un
cliente pregunta, tiene que coincidir con lo que hiciste.*

**Tags** (10)

```
web design, website, ui/ux, ux design, landing page, corporate website, responsive design, web development, seo, website design
```

**Tools used** (elegir de la lista que sugiere Behance al escribir)

```
Figma, Visual Studio Code, HTML, CSS, JavaScript, PHP, GSAP, GitHub
```

*Dejá solo las que realmente usaste.*

**Credits**

- Client: Alumfer
- Design and development: *[Studio name]*
- Project photography: Alumfer

**Project links** (panel lateral del proyecto)

- Live site: https://alumfer.com.ar

---

## 3. Project description (body text)

Behance permite un texto largo en la descripción del proyecto. Este es el
texto completo, en el orden de un caso de estudio (contexto, desafío, enfoque,
resultado):

```
Alumfer is a family-run manufacturer in the southern suburbs of Buenos Aires. Since 2010 it has fabricated and installed custom aluminum windows, doors, shutters and enclosures in its own workshop, with more than 500 completed projects.

THE CHALLENGE
A manufacturer earns trust through three things: finished work, technical knowledge and fast answers. The website had to carry all three: show real projects, explain product lines and glazing in plain language, and make a quote request effortless on any device.

THE APPROACH
We structured the content before designing a single screen, around four customer intents: finding a product, finding a local supplier, researching before buying, and asking for a price. The visual system comes from the trade itself, concrete and steel grays with a single blue accent, and keeps the company's existing logo intact.

The homepage reads the way a customer decides: who the company is, finished work, how the process works, the product catalog, client reviews, warranty, questions and contact. On mobile, call and WhatsApp stay within thumb's reach on every screen.

THE RESULT
A 38-page site: a homepage, 6 service pages, 27 location pages for local search, and 4 long-form buyer guides written in the workshop's own voice. Built as a lightweight static site, fast on mid-range phones and easy to maintain, with structured data and automated deployment.

Site language: Spanish.
```

---

## 4. Closing text module

Agregalo como **módulo de texto** después de la última lámina. Es lo que
convierte una visita en una consulta:

```
Planning a website for your business?
We design and build websites for companies that want to look as good online as their work is in real life.

[email] · [website] · Available for new projects
```

---

## 5. Before publishing

- [ ] Publish the project **complete**: curators review each project once, on
      first publish.
- [ ] Cover set to `cover-808x632.jpg`, full frame.
- [ ] Background `#EAE7E1`, spacing 0.
- [ ] Both videos uploaded as video modules, not as GIFs.
- [ ] Alumfer has approved publication (it uses their brand and photos).
- [ ] Share the link the same day on LinkedIn and Instagram: views in the
      first hours help the project circulate.

---

## 6. Cómo regenerar las láminas

```bash
# 1) Servir el sitio (desde la raíz del repo)
(cd apps/website && python3 -m http.server 8765) &

# 2) Capturas de pantalla → portfolio/behance/_raw/
node portfolio/behance/_src/capturar.mjs
node portfolio/behance/_src/capturar-extra.mjs
node portfolio/behance/_src/capturar-video.mjs

# 3) Láminas, portada, banner y placas del video
node portfolio/behance/_src/exportar.mjs

# 4) Videos → video/desktop-walkthrough.mp4 y video/mobile-walkthrough.mp4
python3 portfolio/behance/_src/video.py
```

Requiere Playwright con Chromium y ffmpeg (`pip install imageio-ffmpeg`).
Las paradas del video, sus pausas y la duración de cada desplazamiento se
ajustan en `_src/video.py`. Las
capturas en crudo (`_raw/`) no se versionan porque pesan ~30 MB. El diseño de
las láminas está en `_src/boards.html`; las tipografías (Inter y Montserrat)
están en `_src/fonts/` para que el resultado no dependa de la red.
