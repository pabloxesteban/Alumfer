# Alumfer · Presentación para Behance

Todo lo necesario para publicar el sitio de Alumfer como proyecto en Behance:
las láminas listas para subir, la portada y los textos para copiar y pegar.

```
portfolio/behance/
├── laminas/          ← las imágenes que se suben (2800 px de ancho, JPG)
├── _src/             ← fuente de las láminas y scripts para regenerarlas
└── README.md         ← este archivo: textos, tags y orden de carga
```

---

## 1. Qué subir y en qué orden

Las láminas están exportadas a 2800 px de ancho (el doble de los 1400 px que
muestra Behance), así se ven nítidas en pantallas retina. Subilas **en este
orden**, una debajo de otra, con **espaciado 0 entre módulos** y
**fondo `#1A1C1E`** (Behance → *Configuración del proyecto* → *Espaciado* y
*Color de fondo*). Así las láminas se leen como una sola pieza continua.

| # | Archivo | Qué muestra |
|---|---------|-------------|
| 1 | `01-portada.jpg` | Logotipo de la empresa, rubro, ubicación y el sitio |
| 2 | `02-el-proyecto.jpg` | Ficha del proyecto y fotos de obras reales |
| 3 | `03-identidad-visual.jpg` | Logotipo sobre fondo oscuro y azul, paleta y tipografías |
| 4 | `04-inicio.jpg` | La primera pantalla del sitio, a ancho completo |
| 5 | `05-pagina-completa.jpg` | La página de inicio completa, en tres tramos |
| 6 | `06-galeria-de-obras.jpg` | Galería de obras, escritorio y celular |
| 7 | `07-proceso-y-catalogo.jpg` | Los 4 pasos del servicio y el catálogo de líneas |
| 8 | `08-opiniones-y-contacto.jpg` | Reseñas, garantía, preguntas frecuentes y formulario |
| 9 | `09-celular.jpg` | Cinco pantallas en celular |
| 10 | `10-localidades-y-servicios.jpg` | Páginas por localidad y por servicio |
| 11 | `11-guias.jpg` | Las cuatro guías para clientes |
| 12 | `12-desarrollo.jpg` | Ficha técnica del desarrollo |
| 13 | `13-cierre.jpg` | Cierre con datos de la empresa |

Tipografía de las láminas: Inter, la misma del sitio (500 en títulos y 400
en textos). El logotipo se muestra como en la marca: isotipo a la izquierda y
ALUMFER en mayúsculas, en Montserrat 600 espaciada.

**Portada del proyecto (la miniatura de la grilla):** `portada-808x632.jpg`.
Behance pide 808 × 632 como mínimo recomendado; la exportada está al doble
(1616 × 1264). Al recortarla en Behance, usá el encuadre completo.

> Tip: entre la lámina 4 y la 5 podés agregar un módulo de **video** (grabación
> de pantalla de 15–20 s scrolleando el home, con la animación del hero). Es lo
> que más suma en Behance para proyectos web. Grabalo desde alumfer.com.ar con
> la ventana a 1440 × 900.

---

## 2. Datos del proyecto (formulario de Behance)

**Título**

> Alumfer — Sitio web para una fábrica de aberturas de aluminio

Alternativas más cortas: *Alumfer · Web Design & Development* · *Alumfer — Aberturas a medida*

**Campos creativos** (Behance deja elegir hasta 3)

1. Web Design
2. UI/UX
3. Web Development

**Herramientas usadas** (agregar las que correspondan a cómo trabajaste)

HTML · CSS · JavaScript · PHP · GSAP · Google Analytics · GitHub · Figma
*(Figma solo si diseñaste ahí; si no, sacalo)*

**Tags** (Behance permite hasta 10)

```
web design, ui design, responsive design, corporate website, local seo, aluminium, carpinteria de aluminio, aberturas, argentina, buenos aires
```

**Links del proyecto**

| Etiqueta | URL |
|----------|-----|
| Sitio en vivo | https://alumfer.com.ar |
| Guía de ejemplo | https://alumfer.com.ar/guias/conviene-el-dvh/ |
| Landing local de ejemplo | https://alumfer.com.ar/aberturas-de-aluminio-adrogue/ |
| Instagram del cliente | https://www.instagram.com/alumfercarpinteria/ |

**Créditos**

- Cliente: Alumfer · Carpintería de aluminio (Adrogué, Buenos Aires)
- Diseño y desarrollo: *tu nombre / tu usuario de Behance*
- Fotografía de obras: Alumfer

---

## 3. Descripción del proyecto

### Versión corta (la que aparece debajo del título)

> Sitio institucional para Alumfer, fábrica familiar de aberturas de aluminio a
> medida en Adrogué, Buenos Aires, con más de 15 años en el mercado. Diseño y
> desarrollo del sitio, páginas por servicio y por localidad, y guías técnicas
> para clientes.

### Versión completa (para el cuerpo del proyecto o el primer módulo de texto)

> **Alumfer** es una empresa familiar de Adrogué que fabrica e instala ventanas,
> puertas, mosquiteros y cerramientos de aluminio a medida. Tiene más de 15 años
> en el mercado, más de 40 de oficio y más de 500 obras en Zona Sur y CABA.
>
> **El objetivo:** presentar a la empresa con la seriedad de un fabricante:
> mostrar las obras terminadas, explicar las líneas y los vidrios que trabajan,
> y facilitar el pedido de presupuesto desde cualquier dispositivo.
>
> **Identidad.** Un sistema "moderno industrial" que sale del propio material:
> grises de hormigón y acero, y un azul aluminio como único acento. Inter en
> pesos livianos para los titulares y una línea azul de 3 px como firma de cada
> sección. Todo definido en variables CSS compartidas.
>
> **Estructura.** Una sola página, de arriba abajo: propuesta y cifras,
> quiénes son, obras por categoría, proceso de trabajo, catálogo de líneas y
> vidrios, reseñas de Google, garantía, preguntas frecuentes y formulario. En
> mobile, una barra fija con "Llamar" y "WhatsApp" siempre a mano.
>
> **SEO local.** 27 landings por localidad y 6 por servicio, generadas desde un
> único archivo de datos, cada una con sus textos, preguntas frecuentes y datos
> estructurados. Cuatro guías escritas con la voz de quien fabrica —¿conviene el
> DVH?, aluminio o PVC, colocación en seco y qué línea elegir— para responder
> las búsquedas antes de la compra.
>
> **Tecnología.** HTML, CSS y JavaScript sin frameworks ni build step; GSAP y
> Lenis para el movimiento, con degradación si el CDN falla y respeto por
> `prefers-reduced-motion`; formulario en PHP con mail de confirmación de marca;
> medición con GA4 y publicación automática con GitHub Actions.

### English version (optional, for international reach)

> Website design and development for **Alumfer**, a family-owned aluminium
> window and door manufacturer in Adrogué, Buenos Aires, working since 2010
> with more than 500 completed projects.
>
> An industrial visual system (concrete greys, steel and an aluminium blue
> accent), a single-page home ordered like a sales conversation, 27 local
> landing pages plus 6 service pages for local SEO, and four in-house buying
> guides written in the company's own voice.
>
> Built with plain HTML, CSS and JavaScript — no framework, no build step —
> with GSAP motion, a PHP contact form, GA4 tracking and automatic deploys via
> GitHub Actions.

---

## 4. Checklist antes de publicar

- [ ] Completar tu nombre en *Créditos* y revisar que el rol (diseño,
      desarrollo, SEO, contenido) sea el que efectivamente hiciste.
- [ ] Confirmar con el cliente que está de acuerdo con que el proyecto se
      publique (usa su marca y fotos de sus obras).
- [ ] Revisar que las cifras sigan vigentes (500+ obras, 15+ años, 4,5 ★ en
      Google): salen del sitio a la fecha de esta presentación.
- [ ] Espaciado entre módulos en 0 y fondo `#1A1C1E`.
- [ ] Subir la portada 808 × 632 y marcar el proyecto como *visible para
      todos*.

---

## 5. Cómo regenerar las láminas

Si cambia el sitio y hay que rehacer las capturas:

```bash
# 1) Servir el sitio (desde la raíz del repo)
(cd apps/website && python3 -m http.server 8765) &

# 2) Capturar pantallas (desktop y mobile) → portfolio/behance/_raw/
node portfolio/behance/_src/capturar.mjs
node portfolio/behance/_src/capturar-extra.mjs

# 3) Exportar las láminas → portfolio/behance/laminas/
node portfolio/behance/_src/exportar.mjs
```

Requiere Playwright con Chromium. Las capturas en crudo (`_raw/`) no se
versionan porque pesan ~30 MB; se regeneran con el paso 2. El diseño de las
láminas está en `_src/boards.html`: cada `<section class="board">` es una
lámina de 1400 px de ancho.
