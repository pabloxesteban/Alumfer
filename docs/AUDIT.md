# Auditoría técnica y comercial — Alumfer

> Documento de evaluación del repositorio y del sitio web de Alumfer.
> Cada afirmación se basa en evidencia observable dentro del repositorio.
> North Star: **aumentar consultas y presupuestos de clientes en Buenos Aires.**
> Las referencias `archivo:línea` apuntan al código en el momento de la auditoría.

---

## 1. Cómo funciona el proyecto (resumen ejecutivo)

Sitio **estático de una sola página** (`index.html`, 1.578 líneas) más una
página de gracias (`gracias.html`) y un endpoint PHP de formulario
(`enviar.php` + `email-template.php`). Sin framework, sin build step, sin
`package.json`: el repositorio **es** lo que se publica.

- **Estilos:** 5 archivos CSS en capas — `tokens.css` (design system) → `base.css`
  → `components.css` (3.4k líneas) → `animations.css` → `cinematic.css`.
- **Interactividad:** `main.js` (vanilla) para navbar, galería con lightbox, tabs,
  formulario y tracking GA4; `cinematic.js` para smooth scroll (Lenis) y
  animaciones de entrada (GSAP + ScrollTrigger + SplitType, vía CDN), con
  degradación elegante si el CDN falla.
- **Conversión:** múltiples caminos — links `wa.me` (WhatsApp), `tel:`, formulario
  → `enviar.php` → `gracias.html` (dispara evento de conversión en GA4).
- **SEO:** metadata completa, Open Graph, Twitter Cards, canonical, JSON-LD
  (`LocalBusiness` + `FAQPage`), `sitemap.xml`, `robots.txt`, `areaServed` con
  decenas de localidades de Zona Sur.
- **Deploy:** GitHub Actions → FTP a cPanel en cada push a `main`
  (`.github/workflows/deploy.yml`). Cache vía `.htaccess` + `?v=N`.

El detalle de arquitectura está en [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 2. Puntaje técnico del repositorio (0–10)

| Dimensión | Puntaje | Fundamento (evidencia) |
|-----------|:------:|------------------------|
| Arquitectura | **6.5** | Stack simple y apropiado para el objetivo, pero repositorio plano (~90 archivos en la raíz) y CSS monolítico. |
| Escalabilidad | **5.0** | Toda la web vive en un único HTML. Agregar páginas de servicio/ubicación implica duplicar markup; no hay templating. |
| Mantenibilidad | **6.0** | Buenos tokens + BEM, pero código muerto, `components.css` de 3.4k líneas e inline styles dispersos. |
| Legibilidad | **7.0** | CSS y JS bien comentados, con encabezados de bloque y nombres claros. |
| Experiencia del desarrollador (DX) | **5.0** | README era una sola línea (corregido en esta auditoría); sin linter/format/editorconfig. El proyecto, sin embargo, se entiende rápido. |
| Calidad del código | **6.5** | JS limpio y defensivo; HTML semántico. Resta deuda por duplicación y muertos. |
| Performance | **5.0** | Hero `background-alumfer.png` de **629 KB** como LCP; varias fotos 150–225 KB; sin WebP, sin `srcset`, sin `width/height`. |
| Accesibilidad | **7.0** | `aria-label`/roles/`focus-visible` presentes; faltan `aria-selected`/`aria-controls` en las tabs. |
| SEO | **8.0** | Base de SEO local sólida (JSON-LD, OG, sitemap, areaServed). |
| Seguridad | **7.0** | Honeypot, saneo, `htmlspecialchars`, envelope fijo; sin CSP ni rate-limit (superficie baja). |
| Organización de carpetas | **4.0** | Todo en la raíz: CSS, JS, PHP, imágenes y previews mezclados. |
| Consistencia de nombres | **6.0** | BEM consistente, pero archivos con doble extensión (`*.jpg.jpeg`, `*.jpg.jpg`). |
| Reutilización de componentes | **6.0** | Componentes CSS reutilizados; el SVG de WhatsApp se repite inline ~8 veces. |
| Deuda técnica | **5.0** | Código muerto (catalog-card, fantasia-wrap, hero__location, scroll-hint), mosaico duplicado oculto, imágenes sin uso. |
| Animaciones | **7.5** | Pulidas, progresivas y respetan `prefers-reduced-motion`. |
| Consistencia visual | **8.0** | Identidad industrial (hormigón + azul) coherente en todo el sitio. |
| Responsive Design | **7.5** | Breakpoints extensos, carruseles mobile, barra sticky de contacto. |
| Preparación para producción | **7.0** | Está en vivo, funcional y con deploy automatizado. |
| Preparación para crecer | **5.0** | Estructura de página única limita SEO programático y nuevas secciones. |
| Calidad general del repositorio | **6.5** | Buen producto, con deuda acotada y muy mejorable. |

### PUNTAJE GENERAL DEL REPOSITORIO: **6.4 / 10**

**Por qué 6.4 y no más:** el sitio es claramente superior al promedio del rubro,
con un design system real, SEO local fuerte y animación de calidad. Lo frenan
cuatro cosas concretas y medibles: (1) **performance** —el hero pesa 629 KB y no
hay optimización de imágenes ni `width/height`, lo que perjudica LCP y CLS justo
en mobile, el dispositivo dominante para búsquedas locales; (2) **organización**
—repositorio plano que cuesta navegar; (3) **deuda técnica** —código y assets
muertos; (4) **escalabilidad** —una sola página estática.

**Por qué 6.4 y no menos:** nada de esto es estructural ni bloqueante. El código
es legible, el SEO está bien hecho, la conversión está pensada (WhatsApp omni­
presente, formulario que califica el lead, tracking de eventos) y el deploy es
automático. Es una base sana sobre la que iterar.

---

## 3. Simplificación (KISS · DRY · SOLID)

Hallazgos concretos:

- **Código muerto eliminado en esta auditoría:**
  - JS: handler de `.fantasia-card` y bloque `.catalog-card-grid`/`.catalog-inline-detail`
    en `main.js` (consultaban elementos inexistentes → no-ops).
  - CSS: `.hero__location` (`components.css`, `animations.css`) y todo el bloque
    `.scroll-hint` (`cinematic.css`) — sin uso en HTML.
  - Imágenes sin referencias: `dvh.jfif`, `fantasia.jfif`.
- **Pendiente (recomendado, requiere prueba visual):**
  - Bloques CSS de `.catalog-card*` y `.catalog-inline-detail*` (~150 líneas en
    `components.css`) y `.fantasia-wrap/__card/__grid` (versión expandible vieja).
    Conviven con `.fantasia-tile` que **sí** se usa, por eso requieren remoción
    quirúrgica con render test.
  - Mosaico de fantasía **duplicado** y oculto (`index.html:1035‑1053`,
    `style="display:none"`): repite las 15 tiles del panel activo. Se deja por
    ambigüedad de cierre de `<div>` que renderiza bien en producción; sacarlo
    necesita validar el balance del DOM.
  - Imagen de "Espejado" **hotlinkeada a Unsplash** (`index.html:704`): foto de
    stock externa, riesgo de 404 y de percepción (no es un producto real de Alumfer).

Estas remociones reducen bundle y ruido sin cambiar comportamiento.

---

## 4. Organización profesional

Estado actual: **todos los archivos en la raíz**. Para un onboarding < 10 minutos
se agregó documentación (`README.md`, `docs/ARCHITECTURE.md`, `docs/AUDIT.md`,
`CONTRIBUTING.md`). La reorganización física en carpetas (`assets/`, `css/`,
`js/`, `php/`) **se recomienda pero se deja para una iteración dedicada**, porque
mover archivos obliga a reescribir todas las rutas en HTML/CSS/PHP/sitemap/htaccess
y a re‑probar el deploy FTP; el riesgo de romper el sitio en vivo no compensa
hacerlo "a ciegas" en la misma pasada que el resto.

Propuesta de estructura objetivo:

```
/                 index.html, gracias.html, robots.txt, sitemap.xml, .htaccess
/assets/img/      todas las fotos (renombradas sin doble extensión, en WebP)
/assets/css/      tokens, base, components, animations, cinematic
/assets/js/       main.js, cinematic.js
/server/          enviar.php, email-template.php
/previews/        preview-*.html
/docs/            documentación
```

---

## 5. Calidad de ingeniería (bugs, performance, React/TS)

No aplica React/TS (sitio vanilla). Hallazgos relevantes:

- **LCP:** `background-alumfer.png` (629 KB) con `fetchpriority="high"` es el
  cuello de botella. Servir en WebP + `srcset` responsivo bajaría el peso ~70–85 %.
- **CLS:** los `<img>` no declaran `width`/`height` ni `aspect-ratio`. En la
  galería y el catálogo esto provoca reflow al cargar. Agregar dimensiones
  intrínsecas elimina el salto.
- **JS de animación:** GSAP + ScrollTrigger + Lenis + SplitType (4 archivos CDN)
  para un sitio brochure es pesado. Está al final del `<body>` (no bloquea), pero
  es candidato a recorte si se prioriza performance.
- **Dependencia de CDN:** 6 recursos externos (4 JS de animación + Google Fonts +
  gtag). Cada uno es latencia y un punto de falla. `cinematic.js` ya degrada bien.
- **Consistencia de versión de assets:** `gracias.html` cargaba `components.css?v=2`
  mientras `index.html` usa `?v=3` → riesgo de estilos viejos cacheados.
  **Corregido** en esta auditoría.
- **Lazy loading:** bien aplicado (`loading="lazy"`) en galería, catálogo y mapa.

---

## 6. Design System

- **Fortalezas:** `tokens.css` centraliza color, tipografía, escala de espaciado,
  radios y curvas de easing. BEM consistente. Identidad visual fuerte ("regla
  azul" `.ruled`, eyebrows en mayúscula, paleta hormigón+azul).
- **Inconsistencias:** estilos inline en `index.html` (sección de contacto con
  `display:flex` inline, nota del formulario, círculos de color con `style=`) que
  deberían vivir en clases. El SVG de WhatsApp se repite inline 8 veces (candidato
  a `<symbol>`/sprite o a un único SVG referenciado).
- **Recomendación:** extraer los inline styles a clases utilitarias y consolidar
  los íconos repetidos. No requiere componentes nuevos: el sistema ya existe, solo
  hay que aplicarlo de forma uniforme.

---

## 7. Evaluación comercial (confianza)

¿Transmite confianza a cada perfil?

| Perfil | Percepción | Sustento en el sitio |
|--------|-----------|----------------------|
| Propietario de vivienda | **Alta** | "Colocación en seco, sin romper paredes", FAQ claras, WhatsApp, presupuesto sin cargo, reseñas reales. |
| Arquitecto | **Media-alta** | Catálogo de líneas (A30, Herrero, Módena), colores anodizados, DVH. Falta material técnico/descargable. |
| Constructora | **Media** | "Fabricantes, sin intermediarios" ayuda; faltan obras de escala y plazos/condiciones para volumen. |
| Desarrollador inmobiliario | **Media** | Sin casos de obra grande ni referencias B2B visibles. |
| Empresa industrial | **Media-baja** | Foco residencial; poco contenido de cerramientos industriales/comerciales. |

**Conclusión:** el sitio convence muy bien al segmento residencial (su core) y se
queda corto en señales B2B/obra grande, que son justamente los tickets altos.

---

## 8. Marketing y Conversión (CRO)

**Fortalezas**
- Hero directo: "Aberturas de aluminio a medida", subtítulo "Fabricamos,
  instalamos y garantizamos. Sin intermediarios." CTA de WhatsApp + "Ver trabajos".
- Prueba social: badge Google 4.5★ (37 reseñas), 3 testimonios, "500+ obras / 15+ años".
- Fricción baja: WhatsApp flotante, barra sticky mobile (Llamar/WhatsApp), `tel:`,
  formulario que **califica** (tipo de trabajo, localidad).
- Proceso en 4 pasos y FAQ que responden objeciones (zonas, plazos, "¿fabrican o revenden?").
- Tracking GA4 de clicks de WhatsApp/teléfono y conversión en `gracias.html`.

**Fricciones / oportunidades**
- Los 3 testimonios son **todos de mosquiteros** (ticket bajo): no muestran obras grandes.
- **No hay "antes / después"**, recurso de altísima conversión en este rubro.
- Sin garantía/certificaciones destacadas como sello visible.
- Imagen "Espejado" externa con riesgo de romperse → daña percepción premium.
- OG image es `logo.jpg` (chico): el preview al compartir por WhatsApp/redes es débil.

**Estimación de conversión:** para tráfico local cualificado, un sitio así suele
convertir **3–6 %** a consulta (WhatsApp + formulario). Con las mejoras de
performance, antes/después y prueba social ampliada, es razonable apuntar a **6–9 %**.
**Principales motivos de abandono:** (1) espera del hero pesado en mobile;
(2) falta de obras de su tipo de proyecto; (3) dudas de precio sin orientación.

---

## 9. Auditoría SEO (roadmap por impacto)

| # | Hallazgo | Impacto | Esfuerzo |
|---|----------|:-------:|:--------:|
| 1 | Crear **páginas por servicio** (ventanas, puertas, DVH, mosquiteros, etc.) | Alto | Medio |
| 2 | Crear **páginas por localidad** (Adrogué, Lomas, Quilmes, Lanús…) | Alto | Medio |
| 3 | Mejorar **performance mobile** (LCP/CLS) — afecta ranking y conversión | Alto | Medio |
| 4 | **OG image** real de obra (1200×630) en vez del logo | Medio | Bajo |
| 5 | Sumar `BreadcrumbList`/`Service` a JSON-LD cuando haya páginas internas | Medio | Bajo |
| 6 | `alt` más descriptivos en galería (hoy genéricos: "Ventanas de aluminio") | Medio | Bajo |
| 7 | Mantener `sitemap.xml` actualizado (hoy un solo URL) | Bajo | Bajo |
| 8 | Optimizar Google Business Profile (fotos, posts, reseñas) — fuera del repo | Alto | Bajo |

**Ya bien resuelto:** title/description, canonical, OG/Twitter, `lang="es"`,
JSON-LD `LocalBusiness` + `FAQPage`, `areaServed`, `robots`/`sitemap`,
`gracias.html` con `noindex`.

---

## 10. Crecimiento comercial (propuestas priorizadas)

| Iniciativa | Impacto | Dificultad | Costo | ROI |
|------------|:------:|:---------:|:-----:|:---:|
| Páginas por localidad (SEO local long-tail) | Alto | Media | Bajo | Alto |
| Páginas por servicio + FAQ específicas | Alto | Media | Bajo | Alto |
| Sección **Antes/Después** con casos reales | Alto | Baja | Bajo | Alto |
| Optimización Google Business Profile + pedido sistemático de reseñas | Alto | Baja | Bajo | Muy alto |
| Mejora de performance mobile (WebP/srcset) | Alto | Media | Bajo | Alto |
| Calculadora/estimador de presupuesto online | Medio | Alta | Medio | Medio |
| Campañas Google Ads locales + remarketing | Alto | Media | Medio-Alto | Medio-Alto |
| Alianzas con arquitectos/constructoras (material técnico) | Alto | Media | Bajo | Alto |
| Blog técnico (DVH, ahorro energético, elección de línea) | Medio | Media | Bajo | Medio |
| Garantía y certificaciones visibles | Medio | Baja | Bajo | Medio |

El mayor retorno con menor costo está en **Google Business Profile + reseñas**,
**antes/después** y **páginas locales** — todas alineadas con el North Star.

---

## 13. Benchmark competitivo (rubro aluminio, Buenos Aires)

Comparación cualitativa contra el patrón típico de competidores locales
(carpinterías y corralones con sitio propio o solo redes):

| Eje | Alumfer | Competidor típico BA | Veredicto |
|-----|:------:|:--------------------:|-----------|
| Diseño / UI | 8 | 4–5 | **Supera** — estética moderna vs. plantillas datadas. |
| UX | 7.5 | 5 | **Supera** — navegación clara, CTAs omnipresentes. |
| Performance | 5.5 | 5 | **Empata** — pierde la ventaja por el hero pesado. |
| SEO | 8 | 4–6 | **Supera** en on-page/schema; **falta** profundidad de páginas. |
| Imagen de marca | 7.5 | 4 | **Supera** — identidad consistente. |
| Claridad / Profesionalismo | 8 | 5 | **Supera**. |
| Conversión | 7 | 4–6 | **Supera** — WhatsApp + form cualificador + prueba social. |
| Diferenciación | 7 | 4 | **Supera** ("fabricantes, sin intermediarios, colocación en seco"). |

**Dónde aún está por detrás de los mejores:** sitios líderes del rubro suelen
tener páginas por producto/zona (más superficie SEO), galerías con antes/después
y performance mobile más afinada. Alumfer gana en marca y UX; debe cerrar la
brecha en **profundidad de contenido** y **velocidad**.

---

## 14. Informe final

### Puntajes

| Área | Puntaje |
|------|:------:|
| Repositorio | **6.4** |
| Sitio web | **7.5** |
| UX | **7.5** |
| UI | **8.0** |
| Performance | **5.5** |
| SEO | **8.0** |
| Accesibilidad | **7.0** |
| Conversión | **7.0** |
| Branding | **7.5** |
| Marketing | **7.0** |
| Comercial | **7.0** |
| Competitivo | **7.5** |
| **General** | **7.2** |

### Las 20 mejoras más importantes (priorizadas)

| # | Mejora | Prioridad | Horizonte | Impacto |
|---|--------|:--------:|:--------:|:------:|
| 1 | Optimizar el hero a WebP + `srcset` (de 629 KB a <120 KB) | Crítica | Quick win | LCP↓, conversión↑ |
| 2 | Reemplazar la imagen "Espejado" externa por un asset propio | Crítica | Quick win | Confianza |
| 3 | Agregar `width`/`height`/`aspect-ratio` a todos los `<img>` | Alta | Corto | CLS↓ |
| 4 | OG image real de obra (1200×630) | Alta | Quick win | CTR social |
| 5 | Optimizar el resto de fotos (>150 KB) a WebP | Alta | Corto | Performance |
| 6 | Sección Antes/Después | Alta | Corto | Conversión |
| 7 | Páginas por localidad (Adrogué, Lomas, Quilmes…) | Alta | Mediano | SEO local |
| 8 | Páginas por servicio (ventanas, DVH, mosquiteros…) | Alta | Mediano | SEO |
| 9 | Google Business Profile + sistema de reseñas | Alta | Corto | Leads |
| 10 | Ampliar testimonios a obras de mayor ticket | Media | Corto | Confianza B2B |
| 11 | Reorganizar el repo en carpetas (`assets/`, `css/`, `js/`) | Media | Corto | Mantenibilidad |
| 12 | Eliminar CSS muerto restante (catalog-card, fantasia-wrap) | Media | Quick win | Deuda↓ |
| 13 | Quitar el mosaico de fantasía duplicado oculto | Media | Quick win | Deuda↓ |
| 14 | Renombrar archivos con doble extensión (`*.jpg.jpeg`) | Media | Corto | Consistencia |
| 15 | `aria-selected`/`aria-controls` en tabs | Media | Quick win | A11y |
| 16 | Extraer inline styles a clases | Media | Corto | Mantenibilidad |
| 17 | Consolidar el SVG de WhatsApp repetido en un sprite | Baja | Corto | DRY |
| 18 | `alt` descriptivos por obra en la galería | Media | Corto | SEO/A11y |
| 19 | Garantía y certificaciones como sello visible | Media | Corto | Conversión |
| 20 | Evaluar recorte del stack de animación (peso CDN) | Baja | Mediano | Performance |

### Quick Wins (< 1 hora) — ya aplicados en esta auditoría
- ✅ Eliminado JS muerto (`fantasia-card`, `catalog-card-grid`).
- ✅ Eliminado CSS muerto (`hero__location`, `scroll-hint`).
- ✅ Eliminadas imágenes sin uso (`dvh.jfif`, `fantasia.jfif`).
- ✅ Corregida la inconsistencia de versión de `components.css` en `gracias.html`.
- ✅ Documentación profesional (`README`, `ARCHITECTURE`, `CONTRIBUTING`, este informe).

### Quick Wins pendientes (< 1 hora c/u)
- Hero a WebP · OG image real · `aria-selected` en tabs · quitar mosaico duplicado.

### Corto plazo (días)
- Optimización integral de imágenes · `width/height` global · Antes/Después ·
  reorganización en carpetas · renombrado de archivos · GBP + reseñas.

### Mediano plazo (semanas)
- Páginas por servicio y por localidad · blog técnico · ampliación de prueba social B2B.

### Largo plazo
- Calculadora de presupuesto · campañas Ads + remarketing · alianzas con
  arquitectos/desarrolladores · posible migración a un generador estático (Astro/Eleventy)
  si el volumen de páginas lo justifica.

### Costo / Impacto / ROI
La mayoría de las mejoras de alto impacto son de **bajo costo** (optimización de
imágenes, contenido, GBP). La inversión mayor está en Ads y en el contenido de
páginas internas, ambos con ROI medible vía GA4 (eventos `whatsapp_click`,
`phone_click`, `conversion`).

---

## ¿Entregarías este proyecto a un cliente que paga por un sitio premium?

### **Sí, con condiciones.**

**Por qué sí:** el sitio está objetivamente por encima del promedio del rubro en
Buenos Aires. Tiene identidad de marca real, design system con tokens, SEO local
bien implementado (JSON-LD, OG, areaServed), animación pulida con degradación
elegante, y una arquitectura de conversión pensada (WhatsApp omnipresente,
formulario que califica, tracking GA4, página de gracias con evento de
conversión). Funciona, está en producción y se despliega solo.

**Las condiciones (bloqueantes para llamarlo "premium entregado"):**
1. **Performance mobile.** Un hero de 629 KB y la falta de `width/height` penalizan
   LCP/CLS en el dispositivo donde ocurre la mayoría de las búsquedas locales.
   Es lo primero a resolver porque afecta a la vez ranking y conversión.
2. **La imagen externa de "Espejado".** Una foto de stock hotlinkeada a Unsplash
   en un sitio premium es un riesgo de credibilidad y de rotura.
3. **Deuda técnica y orden.** El código muerto (en parte ya removido) y el
   repositorio plano deben terminar de limpiarse y reorganizarse.

Resueltas esas tres condiciones —todas acotadas y de bajo costo— el proyecto pasa
de "muy bueno" a "premium" con tranquilidad. No exagero virtudes ni invento
problemas: el sitio ya vende; las mejoras son para que **venda más** y sea más
fácil de mantener y escalar.
