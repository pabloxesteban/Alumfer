# Alumfer · Behance case study (English)

Everything needed to publish the Alumfer website as a Behance project aimed at
international clients: the boards, the video, the cover and every text field,
ready to copy and paste.

Instrucciones en español; **todo lo que va entre bloques de cita o de código
se copia tal cual en Behance, en inglés.**

```
portfolio/behance/
├── laminas/          ← las láminas en inglés (2800 px de ancho, JPG)
├── video/            ← homepage-walkthrough.mp4 (1920×1080, 25 s)
├── perfil/           ← banner del perfil
├── _src/             ← fuente de las láminas y scripts para regenerarlas
├── PERFIL.md         ← perfil y marca propia (textos en inglés)
└── README.md         ← este archivo
```

---

## 1. Orden de carga

Subí los módulos **en este orden**, con **espaciado 0** entre módulos y
**color de fondo `#EAE7E1`** (Project settings → Spacing / Background color).

| # | Módulo | Contenido |
|---|--------|-----------|
| 1 | `01-cover.jpg` | Alumfer logo, positioning line, the live site |
| 2 | `02-overview.jpg` | Brief, project facts, real project photography |
| 3 | `03-information-architecture.jpg` | Site structure around four customer intents |
| 4 | `04-brand-system.jpg` | Logo on dark and blue, palette, typefaces |
| 5 | `05-homepage-hero.jpg` | Homepage first screen, full bleed |
| 6 | `video/homepage-walkthrough.mp4` | **Video module:** full homepage, desktop and mobile |
| 7 | `06-homepage.jpg` | The full homepage in three sections |
| 8 | `07-project-gallery.jpg` | Filterable project gallery, desktop and mobile |
| 9 | `08-process-and-catalog.jpg` | Service process and product catalog |
| 10 | `09-reviews-and-contact.jpg` | Reviews, warranty, FAQ, quote form |
| 11 | `10-mobile.jpg` | Five mobile screens |
| 12 | `11-local-search-pages.jpg` | 27 location pages and 6 service pages |
| 13 | `12-buyer-guides.jpg` | Four long-form buyer guides |
| 14 | `13-build.jpg` | Technical build |
| 15 | `14-closing.jpg` | Closing board |
| 16 | *Text module* | Call to action, see section 4 |

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
Alumfer — Corporate Website for an Aluminum Window Manufacturer
```

**Short description** (Behance shows it under the title and in search)

```
Corporate website for Alumfer, a family-run aluminum window and door manufacturer in Buenos Aires. Information architecture, UX/UI design, front-end development and local SEO, built to turn visits into quote requests.
```

**Creative fields** (choose 3, by role)

1. Web Design
2. UI/UX
3. Web Development

**Tags** (10)

```
web design, ui ux, website design, corporate website, responsive design, information architecture, local seo, front-end development, manufacturing, windows and doors
```

**Tools used**

```
Figma, HTML, CSS, JavaScript, PHP, GSAP, Google Analytics, GitHub
```

*Dejá solo las que realmente usaste. Si no diseñaste en Figma, sacalo: un
cliente puede preguntar por los archivos de diseño.*

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
- [ ] Video uploaded as a video module, not as a GIF.
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

# 3) Láminas, portada y banner → laminas/ y perfil/
node portfolio/behance/_src/exportar.mjs

# 4) Video → video/homepage-walkthrough.mp4
bash portfolio/behance/_src/video.sh
```

Requiere Playwright con Chromium y ffmpeg (`pip install imageio-ffmpeg`). Las
capturas en crudo (`_raw/`) no se versionan porque pesan ~30 MB. El diseño de
las láminas está en `_src/boards.html`; las tipografías (Inter y Montserrat)
están en `_src/fonts/` para que el resultado no dependa de la red.
