// ============================================================
//  ALUMFER — Generador de landing pages (dev-time, sin build en deploy)
// ------------------------------------------------------------
//  Genera páginas estáticas de servicio y de localidad reutilizando el
//  MISMO design system de la home (mismas clases CSS, mismos partials).
//  Salida: <slug>/index.html  (URLs limpias en cPanel/Apache).
//
//  Uso:  node tools/build-landings.mjs
//
//  Editar el HTML generado a mano también es válido: este script es solo
//  una conveniencia para producir/actualizar muchas páginas sin duplicar.
//  No se publica por FTP (ver exclude en .github/workflows/deploy.yml).
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WA = '5491163368643';
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

// SVG de WhatsApp (reutilizado) ------------------------------------------------
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
const waSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;

// Listas de enlazado interno (compartidas en navbar/footer) --------------------
const SERVICES = [
  ['Ventanas de aluminio', '/ventanas-de-aluminio/'],
  ['Ventanas DVH', '/ventanas-dvh/'],
  ['Puertas de aluminio', '/puertas-de-aluminio/'],
  ['Mosquiteros a medida', '/mosquiteros-a-medida/'],
  ['Cerramientos de aluminio', '/cerramientos-de-aluminio/'],
  ['Techos de policarbonato', '/techos-de-policarbonato/'],
];
const ZONES = [
  ['Capital Federal', '/aberturas-de-aluminio-capital-federal/'],
  ['Adrogué', '/aberturas-de-aluminio-adrogue/'],
  ['Almirante Brown', '/aberturas-de-aluminio-almirante-brown/'],
  ['Lomas de Zamora', '/aberturas-de-aluminio-lomas-de-zamora/'],
  ['Banfield', '/aberturas-de-aluminio-banfield/'],
  ['Temperley', '/aberturas-de-aluminio-temperley/'],
  ['Lanús', '/aberturas-de-aluminio-lanus/'],
  ['Avellaneda', '/aberturas-de-aluminio-avellaneda/'],
  ['Quilmes', '/aberturas-de-aluminio-quilmes/'],
  ['Berazategui', '/aberturas-de-aluminio-berazategui/'],
  ['Florencio Varela', '/aberturas-de-aluminio-florencio-varela/'],
  ['Burzaco', '/aberturas-de-aluminio-burzaco/'],
  ['Glew', '/aberturas-de-aluminio-glew/'],
  ['Monte Grande', '/aberturas-de-aluminio-monte-grande/'],
  ['Ezeiza', '/aberturas-de-aluminio-ezeiza/'],
];
const linkList = (items, current) => items.map(([label, href]) =>
  href === current
    ? `<li><a class="footer__link" aria-current="page" style="color:var(--text-on-dark)">${label}</a></li>`
    : `<li><a href="${href}" class="footer__link">${label}</a></li>`
).join('\n            ');

// Partials ---------------------------------------------------------------------
const head = (p) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title}</title>
  <meta name="description" content="${p.metaDesc}">
  <link rel="canonical" href="https://alumfer.com.ar${p.canonical}">

  <meta property="og:type"        content="website">
  <meta property="og:url"         content="https://alumfer.com.ar${p.canonical}">
  <meta property="og:title"       content="${p.ogTitle}">
  <meta property="og:description" content="${p.ogDesc}">
  <meta property="og:image"       content="https://alumfer.com.ar${p.heroBg}">
  <meta property="og:image:alt"   content="${p.ogImageAlt}">
  <meta property="og:locale"      content="es_AR">
  <meta property="og:site_name"   content="Alumfer Carpintería de Aluminio">
  <meta name="twitter:card"       content="summary_large_image">
  <meta name="twitter:title"      content="${p.ogTitle}">
  <meta name="twitter:description" content="${p.ogDesc}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

  <link rel="icon" type="image/png" href="/favicon.png">

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8N6BQW2FNJ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-8N6BQW2FNJ');
  </script>

  <link rel="stylesheet" href="/tokens.css?v=2">
  <link rel="stylesheet" href="/base.css?v=2">
  <link rel="stylesheet" href="/components.css?v=6">
  <link rel="stylesheet" href="/animations.css?v=2">
  <link rel="stylesheet" href="/cinematic.css?v=2">
</head>
<body>

  <div class="scroll-progress" aria-hidden="true"></div>`;

const navbar = (waText) => `
  <nav class="navbar navbar--transparent" aria-label="Navegación principal">
    <div class="navbar__inner">
      <a href="/" class="navbar__logo" aria-label="Alumfer — inicio">
        <img src="/solologo.png" alt="" class="navbar__logo-img" aria-hidden="true">
        <div class="navbar__logo-text">
          <span class="navbar__logo-name">ALUMFER</span>
          <span class="navbar__logo-sub">Carpintería de aluminio</span>
        </div>
      </a>
      <ul class="navbar__links" role="list">
        <li><a href="/#nosotros"  class="navbar__link">Nosotros</a></li>
        <li><a href="/#trabajos"  class="navbar__link">Trabajos</a></li>
        <li><a href="/#productos" class="navbar__link">Productos</a></li>
        <li><a href="#presupuesto" class="navbar__link">Contacto</a></li>
      </ul>
      <a href="${wa(waText)}" class="btn btn--primary navbar__cta" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">Pedir presupuesto</a>
      <button class="navbar__menu-btn" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <nav class="mobile-nav" aria-label="Menú mobile" aria-hidden="true">
    <button class="mobile-nav__close" aria-label="Cerrar menú">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <a href="/#nosotros"  class="mobile-nav__link">Nosotros</a>
    <a href="/#trabajos"  class="mobile-nav__link">Trabajos</a>
    <a href="/#productos" class="mobile-nav__link">Productos</a>
    <a href="#presupuesto" class="mobile-nav__link">Contacto</a>
    <a href="${wa(waText)}" class="btn btn--primary mobile-nav__cta" target="_blank" rel="noopener">Pedir presupuesto</a>
  </nav>`;

const hero = (p) => `
  <section class="hero" aria-label="${p.heroH1a} ${p.heroH1b}">
    <div class="hero__bg"><img src="${p.heroBg}" alt="" aria-hidden="true" fetchpriority="high"></div>
    <div class="hero__overlay" aria-hidden="true"></div>
    <div class="hero__content">
      <p class="hero__eyebrow hero--animate-0">${p.heroEyebrow}</p>
      <h1 class="hero__title hero--animate-1">${p.heroH1a}<br><strong>${p.heroH1b}</strong></h1>
      <p class="hero__subtitle hero--animate-2">${p.heroSubtitle}</p>
      <div class="hero__actions hero--animate-3">
        <a href="${wa(p.waText)}" class="btn btn--whatsapp btn--lg" target="_blank" rel="noopener">${waSvg(18)} Pedir presupuesto</a>
        <a href="${p.ctaSecondaryHref}" class="btn btn--ghost btn--lg">${p.ctaSecondaryLabel}</a>
      </div>
      <div class="hero__stats" aria-label="Estadísticas">
        <div><div class="hero__stat-num"><span class="count-up" data-target="500" data-suffix="+">500+</span></div><div class="hero__stat-label">Obras realizadas</div></div>
        <div><div class="hero__stat-num"><span class="count-up" data-target="15" data-suffix="+">15+</span></div><div class="hero__stat-label">Años en el mercado</div></div>
        <div><div class="hero__stat-num"><a href="https://www.google.com/search?q=Alumfer+carpinter%C3%ADa+aluminio+Adrog%C3%BCe" target="_blank" rel="noopener" aria-label="Ver reseñas en Google" class="hero__stat-link">4.5<span>★</span></a></div><div class="hero__stat-label">Google Reviews</div></div>
      </div>
    </div>
  </section>`;

const intro = (p, variant = 'dark') => `
  <section class="section section--${variant}" aria-labelledby="intro-title">
    <div class="container">
      <div class="section-header reveal"><p class="eyebrow">${p.introEyebrow}</p><h2 id="intro-title">${p.introTitle}</h2></div>
      <p class="reveal section-intro">${p.introText}</p>
    </div>
  </section>`;

const features = (b, variant = 'mid') => `
  <section class="section section--${variant}" id="${b.id || 'opciones'}" aria-labelledby="${b.id || 'opciones'}-title">
    <div class="container">
      <div class="section-header reveal"><p class="eyebrow">${b.eyebrow}</p><h2 id="${b.id || 'opciones'}-title">${b.title}</h2></div>
      <div class="features-grid">
        ${b.items.map((it, i) => `<div class="feature reveal reveal--stagger-${i + 1}">
          ${it.linkHref ? `<a href="${it.linkHref}" style="text-decoration:none;color:inherit">` : ''}
          <h3 class="feature__title">${it.title}</h3>
          <p class="feature__desc">${it.desc}</p>
          ${it.linkHref ? `</a>` : ''}
        </div>`).join('\n        ')}
      </div>
    </div>
  </section>`;

const products = (b, variant = 'mid') => `
  <section class="section section--${variant}" id="${b.id || 'lineas'}" aria-labelledby="${b.id || 'lineas'}-title">
    <div class="container">
      <div class="section-header reveal"><p class="eyebrow">${b.eyebrow}</p><h2 id="${b.id || 'lineas'}-title">${b.title}</h2></div>
      <div class="product-list-wrap"><div class="product-list">
        ${b.rows.map((r) => `<div class="product-row">
          <div class="product-row__media"><img src="${r.img}" alt="${r.alt}" loading="lazy"></div>
          <div class="product-row__info"><h3 class="product-row__name">${r.name}</h3><p class="product-row__desc">${r.desc}</p></div>
        </div>`).join('\n        ')}
      </div></div>
      ${b.cta ? `<div class="section-cta-wrap"><a href="${b.cta.href}" class="btn btn--outline">${b.cta.label}</a></div>` : ''}
    </div>
  </section>`;

const faqSection = (p, variant = 'mid') => `
  <section class="section section--${variant}" id="faq" aria-labelledby="faq-title">
    <div class="container">
      <div class="section-header reveal"><p class="eyebrow">Preguntas frecuentes</p><h2 id="faq-title">${p.faqTitle}</h2></div>
      <div class="faq-list">
        ${p.faqs.map((f) => `<details class="faq-item reveal"><summary class="faq-item__q">${f.q}</summary><p class="faq-item__a">${f.a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>`;

const contact = (p) => `
  <section class="section section--mid" id="presupuesto" aria-labelledby="contact-title">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-left">
          <div class="contact-header">
            <div class="section-header reveal"><p class="eyebrow">Presupuesto sin cargo</p><h2 id="contact-title">${p.contactTitle || 'Pedí tu presupuesto<br>sin cargo'}</h2></div>
            <div class="ruled reveal contact-desc"><p class="contact-desc__text">Completá el formulario o escribinos por WhatsApp. Respondemos en menos de 24 horas.</p></div>
          </div>
        </div>
        <form class="contact-form reveal" name="cotizacion" method="POST" action="/enviar.php" aria-label="Formulario de cotización">
          <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input type="hidden" name="Tipo" value="${p.formTipo}">
          <input type="hidden" name="Localidad" value="${p.formLocalidad || ''}">
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="nombre">Nombre</label><input class="form-input" type="text" id="nombre" name="Nombre" placeholder="Tu nombre" required autocomplete="given-name"></div>
            <div class="form-group"><label class="form-label" for="telefono">Teléfono</label><input class="form-input" type="tel" id="telefono" name="Teléfono" placeholder="11 XXXX-XXXX" required autocomplete="tel"></div>
          </div>
          <div class="form-group"><label class="form-label" for="mensaje">¿Qué necesitás?</label><textarea class="form-textarea" id="mensaje" name="Consulta" placeholder="${p.formPlaceholder}" rows="4" required></textarea></div>
          <p style="font-size:0.8rem; color:var(--text-on-dark-3); margin-bottom:0.5rem;">¿Tenés fotos o planos? Enviálos por <a href="${wa(p.waText)}" target="_blank" rel="noopener" style="color:var(--blue-light); text-decoration:none;">WhatsApp</a>.</p>
          <button type="submit" class="btn btn--primary btn--lg contact-submit">Enviar consulta</button>
        </form>
      </div>
    </div>
  </section>`;

const footer = (current) => `
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer__inner footer__inner--wide">
        <div class="footer__brand">
          <a href="/" class="navbar__logo" aria-label="Alumfer — inicio" style="text-decoration:none">
            <div class="navbar__logo-rule" aria-hidden="true"></div>
            <div class="navbar__logo-text"><span class="navbar__logo-name">ALUMFER</span><span class="navbar__logo-sub">Carpintería de aluminio</span></div>
          </a>
          <p class="footer__tagline">Fabricantes de aberturas de aluminio a medida en Adrogué, Buenos Aires.</p>
        </div>
        <div class="footer__links">
          <p class="footer__col-title">Servicios</p>
          <ul role="list">
            ${linkList(SERVICES, current)}
          </ul>
        </div>
        <div class="footer__links footer__links--zones">
          <p class="footer__col-title">Zonas</p>
          <ul role="list">
            ${linkList(ZONES, current)}
          </ul>
        </div>
        <div class="footer__contact-col">
          <p class="footer__col-title">Contacto</p>
          <ul role="list">
            <li><a href="${wa('Hola, quiero pedir un presupuesto')}" class="footer__link" target="_blank" rel="noopener">WhatsApp: (011) 6336-8643</a></li>
            <li><a href="mailto:alumfercarpinteria@gmail.com" class="footer__link">alumfercarpinteria@gmail.com</a></li>
            <li><a href="https://maps.google.com/?q=Av.+San+Martín+734+Adrogué" class="footer__link" target="_blank" rel="noopener">Av. San Martín 734, Adrogué</a></li>
          </ul>
        </div>
        <div class="footer__social">
          <p class="footer__col-title">Seguinos</p>
          <div class="footer__social-links">
            <a href="https://www.instagram.com/alumfercarpinteria/" class="footer__social-link" target="_blank" rel="noopener" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="https://www.facebook.com/alumfercarpinteria/" class="footer__social-link" target="_blank" rel="noopener" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer__bottom"><p class="footer__copy">© 2026 Alumfer. Adrogué, Buenos Aires.</p><p class="footer__copy">Av. San Martín 734 · (011) 6336-8643</p></div>
    </div>
  </footer>`;

const floatingCta = (waText) => `
  <div class="mobile-bar" aria-label="Contacto rápido">
    <a href="tel:+${WA}" class="mobile-bar__btn mobile-bar__btn--call" aria-label="Llamar a Alumfer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>
      Llamar
    </a>
    <a href="${wa(waText)}" class="mobile-bar__btn mobile-bar__btn--wa" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${waSvg(18)} WhatsApp</a>
  </div>

  <a href="${wa(waText)}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${WA_PATH}"/></svg>
  </a>`;

const scripts = () => `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
  <script src="/cinematic.js?v=2"></script>
  <script src="/main.js?v=2"></script>`;

const jsonLd = (p) => `
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: p.serviceName,
        serviceType: p.serviceType,
        url: `https://alumfer.com.ar${p.canonical}`,
        areaServed: p.areaServed || ['Zona Sur GBA', 'Adrogué', 'Lomas de Zamora', 'Quilmes', 'Lanús', 'Ciudad Autónoma de Buenos Aires'],
        provider: { '@type': 'LocalBusiness', '@id': 'https://alumfer.com.ar/#business', name: 'Alumfer Carpintería de Aluminio' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://alumfer.com.ar/' },
          { '@type': 'ListItem', position: 2, name: p.breadcrumbName, item: `https://alumfer.com.ar${p.canonical}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  }, null, 2)}
  </script>`;

// Render de una página ---------------------------------------------------------
function render(p) {
  const body = [
    head(p),
    navbar(p.waText),
    hero(p),
    intro(p, 'dark'),
    ...p.blocks.map((b) => (b.type === 'features' ? features(b, b.variant) : products(b, b.variant))),
    faqSection(p, 'mid'),
    contact(p),
    footer(p.canonical),
    floatingCta(p.waText),
    scripts(),
    jsonLd(p),
    '</body>\n</html>\n',
  ].join('\n');
  const dir = join(ROOT, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), body, 'utf8');
  return `${p.slug}/index.html`;
}

// ============================================================================
//  DATOS DE LAS PÁGINAS
// ============================================================================
import { PAGES } from './landing-data.mjs';

const written = PAGES.map(render);
console.log(`Generadas ${written.length} páginas:`);
written.forEach((w) => console.log('  ✓ ' + w));
