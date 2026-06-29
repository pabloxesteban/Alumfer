// ============================================================
//  ALUMFER — Datos de las landing pages (consumido por build-landings.mjs)
//  Contenido real y diferenciado por página. Editar acá y re-generar.
// ============================================================

// Bloque reutilizable: "Por qué Alumfer"
const porque = {
  type: 'features', id: 'porque', variant: 'dark', eyebrow: 'Por qué Alumfer',
  title: 'Fabricantes directos, sin intermediarios',
  items: [
    { title: 'Fábrica propia', desc: 'Producimos en nuestro taller de Adrogué. Controlamos cada etapa y mejor precio sin terceros.' },
    { title: 'Colocación en seco', desc: 'Sobre el marco existente, sin demolición ni suciedad. Rápido y limpio.' },
    { title: 'A medida real', desc: 'Medimos en tu obra y fabricamos según las medidas exactas. Nada estándar forzado.' },
    { title: '15+ años', desc: 'Empresa familiar con más de 40 años de oficio acumulado y 500+ obras realizadas.' },
  ],
};

// Servicios listados como features con enlace (para páginas de localidad)
const serviciosLinks = {
  type: 'features', id: 'servicios', variant: 'mid', eyebrow: 'Servicios',
  title: 'Qué fabricamos e instalamos',
  items: [
    { title: 'Ventanas de aluminio', desc: 'Corredizas, batientes y con mosquitero, a medida.', linkHref: '/ventanas-de-aluminio/' },
    { title: 'Ventanas con DVH', desc: 'Doble vidriado hermético: menos frío y ruido.', linkHref: '/ventanas-dvh/' },
    { title: 'Puertas de aluminio', desc: 'De entrada, balcón y con reja.', linkHref: '/puertas-de-aluminio/' },
    { title: 'Mosquiteros a medida', desc: 'Corredizos, reforzados y enrollables.', linkHref: '/mosquiteros-a-medida/' },
    { title: 'Cerramientos', desc: 'Balcones, galerías, quinchos y locales.', linkHref: '/cerramientos-de-aluminio/' },
    { title: 'Techos de policarbonato', desc: 'Galerías, patios y pérgolas.', linkHref: '/techos-de-policarbonato/' },
  ],
};

// Helper de localidad ----------------------------------------------------------
const locality = ({ slug, name, heroBg, introText, barrios, cercanias, faqExtra }) => ({
  slug,
  canonical: `/${slug}/`,
  title: `Aberturas de Aluminio en ${name} — Ventanas, Puertas y Mosquiteros | Alumfer`,
  metaDesc: `Aberturas de aluminio a medida en ${name}: ventanas, puertas, mosquiteros, cerramientos y DVH. Fábrica propia en Adrogué, colocación en seco. Presupuesto sin cargo en 24 hs.`,
  ogTitle: `Aberturas de Aluminio en ${name} | Alumfer`,
  ogDesc: `Ventanas, puertas, mosquiteros y cerramientos de aluminio a medida en ${name}. Presupuesto sin cargo.`,
  ogImageAlt: `Aberturas de aluminio a medida en ${name} — Alumfer`,
  heroBg,
  heroEyebrow: `Aberturas · ${name}`,
  heroH1a: 'Aberturas de aluminio',
  heroH1b: `en ${name}`,
  heroSubtitle: 'Ventanas, puertas, mosquiteros y cerramientos.<br>Fabricamos, instalamos y garantizamos.',
  waText: `Hola, quiero pedir un presupuesto de aberturas en ${name}`,
  ctaSecondaryHref: '#servicios', ctaSecondaryLabel: 'Ver servicios',
  introEyebrow: `${name}, Zona Sur GBA`,
  introTitle: `Carpintería de aluminio que llega a ${name}`,
  introText: introText,
  blocks: [serviciosLinks, porque],
  contactTitle: `Pedí tu presupuesto<br>en ${name}`,
  faqTitle: `Aberturas de aluminio en ${name}`,
  faqs: [
    { q: `¿Trabajan en ${name}?`, a: `Sí. Atendemos ${name} y alrededores (${cercanias}). Vamos a tomar las medidas a tu obra y coordinamos la colocación. Si tenés dudas sobre tu dirección exacta, consultanos.` },
    { q: '¿Pueden cambiar las ventanas sin romper paredes?', a: 'Sí. En la mayoría de los casos instalamos en seco, sobre el marco existente. Sin demolición, sin revoques y sin suciedad.' },
    { q: '¿Hacen el presupuesto sin cargo?', a: 'Sí, el presupuesto es gratuito y sin compromiso. Escribinos por WhatsApp o completá el formulario y respondemos en menos de 24 horas.' },
    ...(faqExtra || []),
  ],
  formTipo: 'Otros',
  formLocalidad: name,
  formPlaceholder: `Qué necesitás (ventanas, puertas, mosquiteros…), medidas aproximadas y si es obra nueva o reemplazo. Obra en ${name}.`,
  serviceName: `Aberturas de aluminio en ${name}`,
  serviceType: 'Fabricación e instalación de aberturas de aluminio',
  areaServed: [name, ...cercanias.split(', ')],
  breadcrumbName: `Aberturas de aluminio en ${name}`,
});

export const PAGES = [
  // ── SERVICIO: Ventanas ────────────────────────────────────────────────────
  {
    slug: 'ventanas-de-aluminio',
    canonical: '/ventanas-de-aluminio/',
    title: 'Ventanas de Aluminio a Medida en Zona Sur GBA — Precio y Líneas | Alumfer',
    metaDesc: 'Ventanas de aluminio a medida en Zona Sur GBA: corredizas, batientes, con mosquitero y DVH. Fábrica propia en Adrogué, colocación en seco sin romper paredes. Presupuesto sin cargo en 24 hs.',
    ogTitle: 'Ventanas de Aluminio a Medida en Zona Sur GBA | Alumfer',
    ogDesc: 'Corredizas, batientes, con mosquitero y DVH. Fábrica propia en Adrogué. Colocación en seco. Presupuesto sin cargo.',
    ogImageAlt: 'Ventanas de aluminio a medida — Alumfer, Zona Sur GBA',
    heroBg: '/obra-ventanas-1.jpg',
    heroEyebrow: 'Ventanas · Fábrica propia en Adrogué',
    heroH1a: 'Ventanas de aluminio', heroH1b: 'a medida',
    heroSubtitle: 'Corredizas, batientes, con mosquitero y DVH.<br>Las fabricamos, instalamos y garantizamos.',
    waText: 'Hola, quiero pedir un presupuesto de ventanas',
    ctaSecondaryHref: '#lineas', ctaSecondaryLabel: 'Ver líneas',
    introEyebrow: 'Ventanas de aluminio',
    introTitle: 'Cada ventana, a la medida exacta de tu obra',
    introText: 'Fabricamos ventanas de aluminio a medida en nuestro taller de Adrogué y las instalamos en toda la Zona Sur del GBA y CABA. Medimos, asesoramos sobre perfiles y vidrios, fabricamos sin intermediarios y colocamos en seco: en la mayoría de los casos, sin romper paredes ni revoques.',
    blocks: [
      {
        type: 'features', id: 'tipos', variant: 'mid', eyebrow: 'Tipos', title: 'Qué ventanas fabricamos',
        items: [
          { title: 'Corredizas', desc: 'La opción más elegida en viviendas. Con o sin mosquitero, en todas las medidas estándar y a medida.' },
          { title: 'Batientes y banderolas', desc: 'Apertura hacia adentro o proyectante. Ideales para baños, cocinas y ventilación controlada.' },
          { title: 'Con mosquitero', desc: 'Mosquitero integrado, corredizo o reforzado. Para ventilar sin insectos.' },
          { title: 'Con DVH', desc: 'Doble vidriado hermético: mucho menos frío y ruido. Ideal para avenidas y plantas altas.' },
        ],
      },
      {
        type: 'products', id: 'lineas', variant: 'mid', eyebrow: 'Líneas', title: 'Las líneas que trabajamos',
        rows: [
          { img: '/linea-herrero.png', alt: 'Ventana de aluminio Línea Herrero', name: 'Línea Herrero', desc: 'La más elegida por nuestros clientes. Mayor estabilidad estructural, ideal para vanos grandes. Corredizas, batientes y celosías. Compatible con vidrio simple, esmerilado, espejado y DVH.' },
          { img: '/linea-modena1.png', alt: 'Ventana de aluminio Línea Módena', name: 'Módena', desc: 'Excelente relación calidad-precio para viviendas. Corredizas con y sin mosquitero, en medidas estándar y a medida. La Módena 2 suma perfil reforzado para vanos más grandes.' },
          { img: '/linea-a30new.png', alt: 'Ventana de aluminio perfil A30 New', name: 'A30 New', desc: 'Perfil de 30 mm con líneas limpias: menor perfil visible y mayor superficie de vidrio. Elegida por arquitectos para proyectos de diseño. Disponible en todas las terminaciones.' },
        ],
        cta: { href: '/#productos', label: 'Ver vidrios y colores →' },
      },
      porque,
    ],
    faqTitle: 'Sobre las ventanas de aluminio',
    faqs: [
      { q: '¿Pueden cambiar las ventanas sin romper las paredes?', a: 'Sí. En la mayoría de los casos instalamos en seco, colocando la nueva ventana sobre el marco existente. Sin demolición, sin revoques y sin suciedad. Es la opción más rápida y económica para reemplazar ventanas viejas.' },
      { q: '¿Cuánto sale una ventana de aluminio a medida?', a: 'Depende de las medidas, la línea de perfil, el tipo de vidrio (simple o DVH) y si lleva mosquitero o cortina. Por eso el presupuesto es sin cargo y a medida: contanos qué necesitás por WhatsApp o el formulario y te lo pasamos en menos de 24 hs.' },
      { q: '¿Conviene poner DVH (doble vidriado hermético)?', a: 'Si tu ventana da a una avenida, a una zona ventosa o buscás eficiencia energética, sí: el DVH reduce notablemente el frío y el ruido. Lo fabricamos en todas nuestras líneas de perfil.' },
      { q: '¿En qué zonas instalan?', a: 'En toda la Zona Sur del GBA y CABA: Adrogué, Lomas de Zamora, Banfield, Temperley, Quilmes, Lanús, Almirante Brown, Monte Grande, Ezeiza y más. Si tenés dudas sobre tu localidad, consultanos.' },
    ],
    formTipo: 'Ventanas',
    formPlaceholder: 'Medidas aproximadas, si es obra nueva o reemplazo, con o sin mosquitero, DVH...',
    contactTitle: 'Pedí tu cotización<br>de ventanas',
    serviceName: 'Ventanas de aluminio a medida', serviceType: 'Fabricación e instalación de ventanas de aluminio',
    breadcrumbName: 'Ventanas de aluminio',
  },

  // ── SERVICIO: Ventanas DVH ────────────────────────────────────────────────
  {
    slug: 'ventanas-dvh',
    canonical: '/ventanas-dvh/',
    title: 'Ventanas con DVH (Doble Vidriado Hermético) — Aislación Térmica y Acústica | Alumfer',
    metaDesc: 'Ventanas con DVH a medida en Zona Sur GBA. El doble vidriado hermético reduce el frío y el ruido de la calle. Fábrica propia en Adrogué. Presupuesto sin cargo en 24 hs.',
    ogTitle: 'Ventanas con DVH — Doble Vidriado Hermético | Alumfer',
    ogDesc: 'Menos frío, menos ruido. DVH a medida en todas nuestras líneas de perfil. Presupuesto sin cargo.',
    ogImageAlt: 'Ventanas con DVH — Alumfer, Zona Sur GBA',
    heroBg: '/obra-ventanas-3.jpg',
    heroEyebrow: 'DVH · Aislación térmica y acústica',
    heroH1a: 'Ventanas con DVH', heroH1b: 'doble vidriado hermético',
    heroSubtitle: 'Menos frío en invierno y menos ruido de la calle.<br>A medida, en todas nuestras líneas.',
    waText: 'Hola, quiero pedir un presupuesto de ventanas con DVH',
    ctaSecondaryHref: '#beneficios', ctaSecondaryLabel: 'Ver beneficios',
    introEyebrow: 'Doble vidriado hermético',
    introTitle: 'Dos vidrios, una cámara de aire, mucho más confort',
    introText: 'El DVH son dos vidrios separados por una cámara de aire sellada que reduce de forma notable la pérdida de calor y el ingreso de ruido exterior. Lo fabricamos a medida en todas nuestras líneas de perfil. Ideal para departamentos sobre avenidas, plantas altas con viento o proyectos que priorizan la eficiencia energética.',
    blocks: [
      {
        type: 'features', id: 'beneficios', variant: 'mid', eyebrow: 'Beneficios', title: 'Por qué elegir DVH',
        items: [
          { title: 'Aislación térmica', desc: 'La cámara de aire frena el paso del frío y el calor. Casa más templada y menos gasto de climatización.' },
          { title: 'Aislación acústica', desc: 'Reduce significativamente el ruido de la calle, avenidas y vecinos. Ideal para descansar mejor.' },
          { title: 'Menos condensación', desc: 'Al mantener el vidrio interior más templado, baja la formación de humedad en el cristal.' },
          { title: 'Eficiencia energética', desc: 'Menos pérdidas significan menos uso de calefacción y aire. Confort que se nota en la factura.' },
        ],
      },
      {
        type: 'products', id: 'detalle', variant: 'mid', eyebrow: 'El cristal', title: 'Cómo es nuestro DVH',
        rows: [
          { img: '/vidrio-dvh.jpg', alt: 'Vidrio DVH doble vidriado hermético', name: 'DVH — Doble Vidriado Hermético', desc: 'Dos vidrios separados por una cámara de aire sellada. Combinable con vidrio simple, laminado de seguridad o esmerilado según el ambiente. Lo integramos en las líneas Herrero, Módena, Rotonda 640 y A30.' },
        ],
        cta: { href: '/ventanas-de-aluminio/', label: 'Ver todas las ventanas →' },
      },
      porque,
    ],
    faqTitle: 'Sobre el DVH',
    faqs: [
      { q: '¿Qué es el DVH?', a: 'El DVH (doble vidriado hermético) son dos vidrios separados por una cámara de aire sellada. Reduce la pérdida de calor y el ingreso de ruido respecto de un vidrio simple.' },
      { q: '¿Cuánto ahorra el DVH?', a: 'El ahorro depende de la orientación, el tamaño de la ventana y el uso de climatización, pero la mejora de confort térmico y acústico es notable, sobre todo en ambientes que dan a la calle o a avenidas.' },
      { q: '¿En qué líneas lo fabrican?', a: 'En todas nuestras líneas de perfil (Herrero, Módena, Rotonda 640 y A30). En la visita técnica te asesoramos sobre cuál conviene según tu vano.' },
      { q: '¿Conviene DVH si vivo sobre una avenida?', a: 'Sí. Es uno de los casos donde más se nota: baja el ruido del tránsito y mejora la aislación térmica de ambientes muy expuestos.' },
    ],
    formTipo: 'Ventanas',
    formPlaceholder: 'Medidas aproximadas, cantidad de ventanas, si da a la calle/avenida, obra nueva o reemplazo...',
    contactTitle: 'Pedí tu presupuesto<br>de ventanas DVH',
    serviceName: 'Ventanas con DVH (doble vidriado hermético)', serviceType: 'Fabricación e instalación de ventanas con DVH',
    breadcrumbName: 'Ventanas DVH',
  },

  // ── SERVICIO: Puertas ─────────────────────────────────────────────────────
  {
    slug: 'puertas-de-aluminio',
    canonical: '/puertas-de-aluminio/',
    title: 'Puertas de Aluminio a Medida en Zona Sur GBA — Entrada, Balcón y con Reja | Alumfer',
    metaDesc: 'Puertas de aluminio a medida en Zona Sur GBA: de entrada, puerta balcón y con reja. Fábrica propia en Adrogué, colocación en seco. Presupuesto sin cargo en 24 hs.',
    ogTitle: 'Puertas de Aluminio a Medida | Alumfer',
    ogDesc: 'De entrada, balcón y con reja. Fábrica propia en Adrogué. Presupuesto sin cargo.',
    ogImageAlt: 'Puertas de aluminio a medida — Alumfer, Zona Sur GBA',
    heroBg: '/obra-puertas-1.jpg',
    heroEyebrow: 'Puertas · Fábrica propia en Adrogué',
    heroH1a: 'Puertas de aluminio', heroH1b: 'a medida',
    heroSubtitle: 'De entrada, puerta balcón y con reja.<br>Las fabricamos, instalamos y garantizamos.',
    waText: 'Hola, quiero pedir un presupuesto de puertas',
    ctaSecondaryHref: '#tipos', ctaSecondaryLabel: 'Ver tipos',
    introEyebrow: 'Puertas de aluminio',
    introTitle: 'Puertas a medida, para entrada y para el patio',
    introText: 'Fabricamos puertas de aluminio a medida para entrada principal, balcón y patio, con o sin reja integrada. Las producimos en nuestro taller de Adrogué y las colocamos en toda la Zona Sur del GBA y CABA, en seco y sin obra.',
    blocks: [
      {
        type: 'features', id: 'tipos', variant: 'mid', eyebrow: 'Tipos', title: 'Qué puertas fabricamos',
        items: [
          { title: 'Puerta de abrir', desc: 'Para entrada principal o de servicio. Una o dos hojas, con paño de vidrio o ciega.' },
          { title: 'Puerta balcón', desc: 'Corrediza, con gran superficie de vidrio. Ideal para patios, balcones y galerías.' },
          { title: 'Con reja o postigón', desc: 'Seguridad integrada en la misma abertura: reja fija o rebatible y postigones de aluminio.' },
          { title: 'Con DVH', desc: 'Puerta balcón con doble vidriado hermético para mayor aislación térmica y acústica.' },
        ],
      },
      {
        type: 'products', id: 'lineas', variant: 'mid', eyebrow: 'Líneas', title: 'Líneas recomendadas',
        rows: [
          { img: '/linea-herrero.png', alt: 'Puerta de aluminio Línea Herrero', name: 'Línea Herrero', desc: 'La más robusta: ideal para puertas de entrada y vanos grandes que requieren estabilidad estructural. Compatible con reja, postigón y todos los vidrios.' },
          { img: '/linea-modena2.png', alt: 'Puerta de aluminio Línea Módena 2', name: 'Módena 2', desc: 'Perfil reforzado para puertas balcón de mayor tamaño. Buena rigidez y aislación, excelente relación calidad-precio.' },
        ],
        cta: { href: '/#productos', label: 'Ver vidrios y colores →' },
      },
      porque,
    ],
    faqTitle: 'Sobre las puertas de aluminio',
    faqs: [
      { q: '¿Hacen puertas de entrada a medida?', a: 'Sí. Fabricamos puertas de entrada de aluminio a medida, en una o dos hojas, con paño de vidrio o ciegas, y con reja integrada si lo necesitás.' },
      { q: '¿Pueden poner reja en la misma puerta?', a: 'Sí. Integramos reja fija o rebatible y postigones de aluminio en la misma abertura, fabricados a medida para tu vano.' },
      { q: '¿Cambian la puerta sin romper la pared?', a: 'En la mayoría de los casos sí: colocamos en seco sobre el marco existente, sin demolición ni suciedad.' },
      { q: '¿En qué zonas instalan?', a: 'En toda la Zona Sur del GBA y CABA: Adrogué, Lomas de Zamora, Quilmes, Lanús, Almirante Brown y más. Consultanos por tu localidad.' },
    ],
    formTipo: 'Puertas',
    formPlaceholder: 'Tipo de puerta (entrada, balcón), medidas aproximadas, con o sin reja, obra nueva o reemplazo...',
    contactTitle: 'Pedí tu cotización<br>de puertas',
    serviceName: 'Puertas de aluminio a medida', serviceType: 'Fabricación e instalación de puertas de aluminio',
    breadcrumbName: 'Puertas de aluminio',
  },

  // ── SERVICIO: Mosquiteros ─────────────────────────────────────────────────
  {
    slug: 'mosquiteros-a-medida',
    canonical: '/mosquiteros-a-medida/',
    title: 'Mosquiteros a Medida en Zona Sur GBA — Corredizos y Reforzados | Alumfer',
    metaDesc: 'Mosquiteros de aluminio a medida en Zona Sur GBA: corredizos, reforzados, enrollables y para puertas. Fabricación e instalación rápida. Presupuesto sin cargo.',
    ogTitle: 'Mosquiteros a Medida | Alumfer',
    ogDesc: 'Corredizos, reforzados y enrollables. Fabricación e instalación rápida en Zona Sur GBA.',
    ogImageAlt: 'Mosquiteros de aluminio a medida — Alumfer',
    heroBg: '/mosquitero1.jpeg',
    heroEyebrow: 'Mosquiteros · Entrega rápida',
    heroH1a: 'Mosquiteros', heroH1b: 'a medida',
    heroSubtitle: 'Corredizos, reforzados y enrollables.<br>Medición y colocación rápidas.',
    waText: 'Hola, quiero pedir un presupuesto de mosquiteros',
    ctaSecondaryHref: '#tipos', ctaSecondaryLabel: 'Ver tipos',
    introEyebrow: 'Mosquiteros de aluminio',
    introTitle: 'Disfrutá la ventilación, sin insectos',
    introText: 'Fabricamos mosquiteros de aluminio a medida para ventanas y puertas, en versión corrediza, reforzada o enrollable. Es uno de nuestros trabajos más ágiles: tomamos medidas y, según la agenda, colocamos en pocos días. Marco de aluminio en varios colores y tela resistente.',
    blocks: [
      {
        type: 'features', id: 'tipos', variant: 'mid', eyebrow: 'Tipos', title: 'Qué mosquiteros hacemos',
        items: [
          { title: 'Corredizos', desc: 'Para ventanas corredizas. Se desplazan junto a la hoja, prácticos y discretos.' },
          { title: 'Reforzados / de puerta', desc: 'Marco más resistente para puertas y aberturas de uso intensivo, con o sin cierre.' },
          { title: 'Enrollables', desc: 'Se enrollan cuando no se usan. Cómodos para puertas balcón y galerías.' },
          { title: 'A medida', desc: 'Cualquier vano, en distintos colores de marco. Tela mosquitera resistente y prolija.' },
        ],
      },
      porque,
    ],
    faqTitle: 'Sobre los mosquiteros',
    faqs: [
      { q: '¿Cuánto tardan en colocar los mosquiteros?', a: 'Es uno de nuestros trabajos más rápidos. Tomamos medidas y, según la agenda, fabricamos y colocamos en pocos días. Contanos cuántos necesitás y coordinamos.' },
      { q: '¿Hacen mosquiteros para puertas?', a: 'Sí, fabricamos mosquiteros reforzados y enrollables para puertas balcón y de servicio, además de los corredizos para ventanas.' },
      { q: '¿De qué color es el marco?', a: 'El marco de aluminio está disponible en varios colores (blanco, negro y otros) para que combine con tu abertura.' },
      { q: '¿Trabajan en mi zona?', a: 'Atendemos toda la Zona Sur del GBA y CABA. Consultanos por tu localidad y coordinamos la medición.' },
    ],
    formTipo: 'Mosquiteros',
    formPlaceholder: 'Cantidad de mosquiteros, si son para ventanas o puertas, medidas aproximadas...',
    contactTitle: 'Pedí tu presupuesto<br>de mosquiteros',
    serviceName: 'Mosquiteros a medida', serviceType: 'Fabricación e instalación de mosquiteros de aluminio',
    breadcrumbName: 'Mosquiteros a medida',
  },

  // ── SERVICIO: Cerramientos ────────────────────────────────────────────────
  {
    slug: 'cerramientos-de-aluminio',
    canonical: '/cerramientos-de-aluminio/',
    title: 'Cerramientos de Aluminio en Zona Sur GBA — Balcones, Quinchos y Locales | Alumfer',
    metaDesc: 'Cerramientos de aluminio y vidrio a medida en Zona Sur GBA: balcones, galerías, quinchos y frentes de local. Fábrica propia en Adrogué. Presupuesto sin cargo en 24 hs.',
    ogTitle: 'Cerramientos de Aluminio | Alumfer',
    ogDesc: 'Balcones, galerías, quinchos y frentes de local. A medida, en aluminio y vidrio. Presupuesto sin cargo.',
    ogImageAlt: 'Cerramiento de aluminio y vidrio a medida — Alumfer',
    heroBg: '/obra-quincho-1.jpeg',
    heroEyebrow: 'Cerramientos · Aluminio y vidrio',
    heroH1a: 'Cerramientos de aluminio', heroH1b: 'a medida',
    heroSubtitle: 'Balcones, galerías, quinchos y locales.<br>Ganá un ambiente todo el año.',
    waText: 'Hola, quiero pedir un presupuesto de un cerramiento',
    ctaSecondaryHref: '#tipos', ctaSecondaryLabel: 'Ver tipos',
    introEyebrow: 'Cerramientos de aluminio',
    introTitle: 'Convertí un espacio abierto en un ambiente usable',
    introText: 'Fabricamos cerramientos de aluminio y vidrio a medida para balcones, galerías, quinchos y frentes de local. Ganás un ambiente protegido del viento, la lluvia y el frío sin perder luz natural. Los producimos en nuestro taller de Adrogué y los instalamos en toda la Zona Sur del GBA.',
    blocks: [
      {
        type: 'features', id: 'tipos', variant: 'mid', eyebrow: 'Tipos', title: 'Qué cerramientos hacemos',
        items: [
          { title: 'Balcones', desc: 'Cerramiento de balcón con paños corredizos o fijos. Más espacio útil y aislación.' },
          { title: 'Galerías y quinchos', desc: 'Cerrá la galería o el quincho con aluminio y vidrio para usarlo todo el año.' },
          { title: 'Frentes de local', desc: 'Vidrieras y frentes comerciales en aluminio, con vidrio simple, espejado o laminado.' },
          { title: 'Patios y SUM', desc: 'Cerramientos para patios internos y espacios comunes, a medida del vano.' },
        ],
      },
      {
        type: 'products', id: 'coberturas', variant: 'mid', eyebrow: 'Coberturas', title: 'Para techar el cerramiento',
        rows: [
          { img: '/policarbonato-alveolar.jpg', alt: 'Techo de policarbonato alveolar para cerramiento', name: 'Policarbonato Alveolar', desc: 'Panel liviano con cámaras de aire, excelente aislación térmica y paso de luz. Ideal para techar galerías y quinchos cerrados.' },
        ],
        cta: { href: '/techos-de-policarbonato/', label: 'Ver techos de policarbonato →' },
      },
      porque,
    ],
    faqTitle: 'Sobre los cerramientos',
    faqs: [
      { q: '¿Hacen cerramientos de balcón?', a: 'Sí. Fabricamos cerramientos de balcón a medida con paños corredizos o fijos, en aluminio y vidrio, para ganar espacio útil y aislación.' },
      { q: '¿Puedo cerrar mi quincho o galería?', a: 'Sí. Cerramos galerías y quinchos con aluminio y vidrio, y los techamos con policarbonato si hace falta, para usarlos todo el año.' },
      { q: '¿Necesito permiso del consorcio?', a: 'En PH y edificios suele requerirse autorización del consorcio para cerrar balcones. Te asesoramos sobre el tipo de cerramiento, pero la gestión del permiso corre por tu cuenta.' },
      { q: '¿Trabajan en mi zona?', a: 'Atendemos toda la Zona Sur del GBA y CABA. Consultanos por tu localidad.' },
    ],
    formTipo: 'Otros',
    formPlaceholder: 'Qué querés cerrar (balcón, quincho, local), medidas aproximadas del vano, con o sin techo...',
    contactTitle: 'Pedí tu presupuesto<br>de cerramiento',
    serviceName: 'Cerramientos de aluminio', serviceType: 'Fabricación e instalación de cerramientos de aluminio y vidrio',
    breadcrumbName: 'Cerramientos de aluminio',
  },

  // ── SERVICIO: Techos de policarbonato ─────────────────────────────────────
  {
    slug: 'techos-de-policarbonato',
    canonical: '/techos-de-policarbonato/',
    title: 'Techos de Policarbonato en Zona Sur GBA — Galerías, Patios y Pérgolas | Alumfer',
    metaDesc: 'Techos de policarbonato a medida en Zona Sur GBA con estructura de aluminio: galerías, patios, quinchos y pérgolas. Alveolar y compacto. Presupuesto sin cargo en 24 hs.',
    ogTitle: 'Techos de Policarbonato | Alumfer',
    ogDesc: 'Galerías, patios y pérgolas. Estructura de aluminio + policarbonato alveolar o compacto. Presupuesto sin cargo.',
    ogImageAlt: 'Techo de policarbonato con estructura de aluminio — Alumfer',
    heroBg: '/obra-techo1.jpeg',
    heroEyebrow: 'Techos y coberturas',
    heroH1a: 'Techos de policarbonato', heroH1b: 'a medida',
    heroSubtitle: 'Galerías, patios, quinchos y pérgolas.<br>Estructura de aluminio, paso de luz natural.',
    waText: 'Hola, quiero pedir un presupuesto de un techo de policarbonato',
    ctaSecondaryHref: '#materiales', ctaSecondaryLabel: 'Ver materiales',
    introEyebrow: 'Techos de policarbonato',
    introTitle: 'Cubrí tu patio sin perder la luz',
    introText: 'Fabricamos techos de policarbonato a medida con estructura de aluminio para galerías, patios, quinchos y pérgolas. El policarbonato deja pasar la luz natural y protege del sol y la lluvia. Trabajamos con paneles alveolares y compactos, en distintos espesores según el uso.',
    blocks: [
      {
        type: 'features', id: 'usos', variant: 'mid', eyebrow: 'Usos', title: 'Dónde se usa',
        items: [
          { title: 'Galerías y patios', desc: 'Techá el patio o la galería y ganá un espacio protegido del sol y la lluvia.' },
          { title: 'Quinchos', desc: 'Cubrí el quincho con paso de luz para usarlo todo el año.' },
          { title: 'Pérgolas', desc: 'Pérgolas de aluminio con cubierta de policarbonato, a medida de tu espacio.' },
          { title: 'Claraboyas', desc: 'Aporte de luz natural a ambientes internos con paneles compactos de alta resistencia.' },
        ],
      },
      {
        type: 'products', id: 'materiales', variant: 'mid', eyebrow: 'Materiales', title: 'Qué policarbonato usamos',
        rows: [
          { img: '/policarbonato-alveolar.jpg', alt: 'Policarbonato alveolar para techos', name: 'Policarbonato Alveolar', desc: 'Panel liviano con cámaras de aire: excelente aislación térmica y acústica y buen paso de luz. Disponible en 4, 6, 8 y 10 mm. Ideal para techos de galería y pérgolas.' },
          { img: '/policarbonato-compacto.png', alt: 'Policarbonato compacto para techos', name: 'Policarbonato Compacto', desc: 'Panel sólido de alta resistencia al impacto, alta transparencia y protección UV. Para claraboyas, mamparas y frentes que requieren más resistencia.' },
        ],
      },
      porque,
    ],
    faqTitle: 'Sobre los techos de policarbonato',
    faqs: [
      { q: '¿Qué espesor de policarbonato conviene?', a: 'Depende de la luz a cubrir y del uso. Para galerías y patios suele usarse alveolar de 6 a 10 mm; para claraboyas o más resistencia, policarbonato compacto. En la visita te asesoramos.' },
      { q: '¿La estructura es de aluminio?', a: 'Sí. Fabricamos la estructura de soporte en aluminio y montamos sobre ella los paneles de policarbonato, a medida de tu espacio.' },
      { q: '¿El policarbonato aísla el calor?', a: 'El alveolar, gracias a sus cámaras de aire, ofrece buena aislación térmica y difunde la luz. El compacto prioriza resistencia y transparencia.' },
      { q: '¿Hacen techos corredizos?', a: 'Consultanos tu caso: según el proyecto podemos resolver coberturas fijas o con sectores móviles. Te asesoramos en la medición.' },
    ],
    formTipo: 'Policarbonato',
    formPlaceholder: 'Qué querés techar (patio, galería, quincho), medidas aproximadas, alveolar o compacto...',
    contactTitle: 'Pedí tu presupuesto<br>de techo',
    serviceName: 'Techos de policarbonato', serviceType: 'Fabricación e instalación de techos de policarbonato con estructura de aluminio',
    breadcrumbName: 'Techos de policarbonato',
  },

  // ── LOCALIDADES ───────────────────────────────────────────────────────────
  locality({
    slug: 'aberturas-de-aluminio-adrogue', name: 'Adrogué', heroBg: '/obra-ventanas-2.jpg',
    introText: 'Nuestra fábrica está en Adrogué, en Av. San Martín 734. Eso nos da una ventaja en tu zona: medición rápida, fabricación en el taller y colocación coordinada sin intermediarios. Hacemos ventanas, puertas, mosquiteros, cerramientos y DVH a medida para casas, PH y locales de Adrogué y toda la cabecera de Almirante Brown.',
    cercanias: 'Burzaco, Longchamps, Glew, Ministro Rivadavia, Malvinas Argentinas, San José',
    faqExtra: [{ q: '¿Dónde queda el local de Alumfer en Adrogué?', a: 'Estamos en Av. San Martín 734, Adrogué. Podés retirar trabajos en el local o coordinamos la colocación en tu obra.' }],
  }),
  locality({
    slug: 'aberturas-de-aluminio-lomas-de-zamora', name: 'Lomas de Zamora', heroBg: '/obra-ventanas-5.jpg',
    introText: 'Llegamos a Lomas de Zamora y todo su partido con aberturas de aluminio a medida: ventanas, puertas, mosquiteros, cerramientos y DVH. Desde nuestro taller de Adrogué, a pocos kilómetros, coordinamos la medición y la colocación en seco, sin romper paredes. Atendemos casas, departamentos y comercios.',
    cercanias: 'Banfield, Temperley, Turdera, Llavallol, Ingeniero Budge',
    faqExtra: [{ q: '¿Atienden Banfield y Temperley?', a: 'Sí. Banfield, Temperley, Turdera y Llavallol están dentro de nuestra zona habitual de trabajo, a pocos minutos de la fábrica.' }],
  }),
  locality({
    slug: 'aberturas-de-aluminio-quilmes', name: 'Quilmes', heroBg: '/obra-ventanas-1.jpg',
    introText: 'Fabricamos e instalamos aberturas de aluminio a medida en Quilmes y alrededores: ventanas corredizas y con DVH, puertas, mosquiteros y cerramientos de balcón o galería. Producimos en nuestro taller de Adrogué y coordinamos la colocación en tu obra, con instalación en seco y sin demolición.',
    cercanias: 'Bernal, Don Bosco, Ezpeleta, San Francisco Solano, Wilde',
    faqExtra: [{ q: '¿Llegan hasta Bernal y Ezpeleta?', a: 'Sí. Bernal, Don Bosco, Ezpeleta y Solano están dentro de nuestra cobertura. Coordinamos la medición sin cargo.' }],
  }),
  locality({
    slug: 'aberturas-de-aluminio-lanus', name: 'Lanús', heroBg: '/obra-puertas-2.jpg',
    introText: 'Atendemos Lanús (Este y Oeste) y su zona con aberturas de aluminio a medida: ventanas, puertas, mosquiteros, cerramientos y DVH para departamentos sobre avenida, casas y locales. Desde Adrogué coordinamos medición y colocación en seco, una opción rápida y limpia para reemplazar aberturas viejas.',
    cercanias: 'Remedios de Escalada, Gerli, Valentín Alsina, Monte Chingolo',
    faqExtra: [{ q: '¿El DVH conviene en departamentos de Lanús sobre avenida?', a: 'Sí. En departamentos sobre avenidas el DVH baja notablemente el ruido del tránsito y mejora la aislación térmica. Es uno de los casos donde más se nota.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-banfield', name: 'Banfield', heroBg: '/obra-ventanas-4.jpg',
    introText: 'Desde nuestra fábrica en Adrogué, llegamos a Banfield a pocos minutos. Fabricamos e instalamos ventanas, puertas, mosquiteros, cerramientos y DVH a medida para casas, PH y locales comerciales. Colocamos en seco sobre el marco existente: sin demolición, sin escombros y sin vecinos molestos.',
    cercanias: 'Lomas de Zamora, Temperley, Llavallol, Remedios de Escalada, Gerli',
    faqExtra: [{ q: '¿Cuánto tardan en llegar a Banfield desde el taller?', a: 'Banfield está a 10–15 minutos de nuestro taller en Adrogué. Eso nos permite coordinar medición, ajustes y colocación con más agilidad que proveedores de otras zonas.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-temperley', name: 'Temperley', heroBg: '/obra-ventanas-3.jpg',
    introText: 'Atendemos Temperley con aberturas de aluminio a medida: ventanas, puertas, mosquiteros, cerramientos y DVH. El barrio tiene muchas casas antiguas con ventanas de hierro o madera que se reemplazan perfectamente con aluminio en seco —sin romper paredes— y quedan como nuevas. La fábrica está en Adrogué, a 10 minutos.',
    cercanias: 'Adrogué, Banfield, Turdera, Llavallol, Longchamps',
    faqExtra: [{ q: '¿Pueden cambiar ventanas de hierro viejas en Temperley?', a: 'Sí. Es uno de los trabajos más frecuentes en la zona. Retiramos la carpintería de hierro y colocamos la nueva de aluminio en seco, sin romper la mampostería ni generar escombros.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-almirante-brown', name: 'Almirante Brown', heroBg: '/obra-puertas-1.jpg',
    introText: 'Nuestra fábrica está en Adrogué, la cabecera del partido de Almirante Brown. Eso nos da ventaja real en todo el partido: Burzaco, Longchamps, Glew, Rafael Calzada, Malvinas Argentinas, Ministro Rivadavia y San José. Fabricamos e instalamos aberturas de aluminio a medida en toda la zona, con medición y colocación propias.',
    cercanias: 'Burzaco, Longchamps, Glew, Rafael Calzada, Malvinas Argentinas, Ministro Rivadavia',
    faqExtra: [{ q: '¿Alumfer atiende todo el partido de Almirante Brown?', a: 'Sí. Burzaco, Longchamps, Glew, Rafael Calzada, Malvinas Argentinas y Ministro Rivadavia son parte de nuestra zona habitual. Al tener la fábrica en Adrogué, la cobertura es rápida y sin sobrecosto.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-monte-grande', name: 'Monte Grande', heroBg: '/obra-portones-1.jpg',
    introText: 'Monte Grande tiene mucha vivienda unifamiliar con jardín, y es una de las zonas donde más pedimos presupuesto para cerramientos de galería, portones y mosquiteros. Fabricamos a medida en nuestro taller de Adrogué e instalamos en Monte Grande y todo el partido de Ezeiza con colocación en seco, prolija y garantizada.',
    cercanias: 'Ezeiza, Luis Guillón, Tristán Suárez, Canning, La Unión',
    faqExtra: [{ q: '¿Hacen portones y cerramientos de galería en Monte Grande?', a: 'Sí, es uno de los trabajos más comunes que hacemos en la zona. Portones de aluminio corredizos y batientes, y cerramientos de galería con vidrio o policarbonato, todo a medida y con instalación incluida.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-avellaneda', name: 'Avellaneda', heroBg: '/obra-puertas-4.jpg',
    introText: 'Atendemos Avellaneda y todo su partido con aberturas de aluminio a medida: ventanas, puertas, frentes de local, cerramientos y DVH. La zona tiene mucha densidad de comercios y departamentos, y somos expertos en trabajos sobre avenidas donde el DVH marca la diferencia en ruido y temperatura. Desde Adrogué llegamos rápido a toda el área.',
    cercanias: 'Wilde, Gerli, Sarandi, Dock Sud, Villa Domínico, Piñeyro',
    faqExtra: [{ q: '¿Hacen frentes de local en Avellaneda?', a: 'Sí. Frentes comerciales en aluminio y vidrio, mamparas y aberturas para locales. Trabajamos tanto en renovaciones de negocios existentes como en obras nuevas de planta baja.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-burzaco', name: 'Burzaco', heroBg: '/obra-postigones-1.jpg',
    introText: 'Burzaco está a 5 minutos de nuestro taller en Adrogué, lo que nos da tiempos de respuesta difíciles de igualar. Fabricamos e instalamos ventanas, puertas, mosquiteros, postigones, cerramientos y DVH a medida para casas y PH de Burzaco. Medición sin cargo, colocación en seco y garantía de fabricación.',
    cercanias: 'Adrogué, Longchamps, Rafael Calzada, Malvinas Argentinas, San José',
    faqExtra: [{ q: '¿Por qué conviene elegir Alumfer en Burzaco?', a: 'Porque fabricamos en Adrogué, a 5 minutos. Eso permite medición rápida, ajuste sin demoras y colocación coordinada. No dependemos de proveedores de otras zonas ni tercerizamos la instalación.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-glew', name: 'Glew', heroBg: '/obra-postigones-3.jpg',
    introText: 'Llegamos a Glew y sus alrededores con aberturas de aluminio a medida: ventanas, puertas, mosquiteros, portones y cerramientos. Muchas casas de la zona tienen aberturas antiguas de madera o hierro que se pueden reemplazar en seco, sin demolición, en uno o dos días. Coordinamos medición y colocación desde nuestro taller en Adrogué.',
    cercanias: 'Adrogué, Longchamps, Guernica, Tristán Suárez, Ministro Rivadavia',
    faqExtra: [{ q: '¿Atienden también Guernica y Tristán Suárez?', a: 'Sí. Guernica, Tristán Suárez y alrededores están dentro de nuestra cobertura. Coordinamos la visita de medición y la colocación directamente con el cliente.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-ezeiza', name: 'Ezeiza', heroBg: '/obra-quincho-2.jpeg',
    introText: 'El partido de Ezeiza tiene muchas quintas, countries y casas con galería o jardín, y es una zona donde los cerramientos de galería, techos de policarbonato y portones son muy demandados. Fabricamos e instalamos a medida desde Adrogué y cubrimos Monte Grande, Canning, Tristán Suárez y toda el área de Ezeiza.',
    cercanias: 'Monte Grande, Canning, Tristán Suárez, Luis Guillón, Moisés Ville',
    faqExtra: [{ q: '¿Hacen cerramientos y techos para quintas en Ezeiza?', a: 'Sí. Cerramientos de galería, techos de policarbonato para patio y portones de aluminio son los trabajos más comunes que hacemos en la zona de Ezeiza y alrededores.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-florencio-varela', name: 'Florencio Varela', heroBg: '/obra-puertas-3.jpg',
    introText: 'Atendemos Florencio Varela y sus localidades con aberturas de aluminio a medida. El partido tiene mucha vivienda nueva y en construcción, y fabricamos aberturas para obra en curso o para reemplazo de aberturas viejas. Colocamos en seco —sin romper paredes— y garantizamos fabricación e instalación desde nuestro taller de Adrogué.',
    cercanias: 'Quilmes, Berazategui, San Juan Bautista, Villa Brown, Bosques',
    faqExtra: [{ q: '¿Trabajan en obras en construcción en Florencio Varela?', a: 'Sí. Podemos proveer aberturas para obra nueva o en refacción. Coordinamos la entrega según el avance de la obra y hacemos la medición cuando la albañilería esté terminada.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-rafael-calzada', name: 'Rafael Calzada', heroBg: '/obra-ventanas-2.jpg',
    introText: 'Rafael Calzada es una localidad del partido de Almirante Brown con mucha vivienda familiar. Fabricamos e instalamos aberturas de aluminio a medida: ventanas corredizas, puertas, postigones y mosquiteros. Llegamos desde nuestra fábrica en Adrogué —a pocos minutos— y hacemos la instalación en seco, sin demolición ni escombros.',
    cercanias: 'Adrogué, Burzaco, Longchamps, Claypole, Malvinas Argentinas',
    faqExtra: [{ q: '¿Llegan a Rafael Calzada sin costo adicional?', a: 'Sí. Rafael Calzada está dentro de nuestra zona de cobertura habitual. La visita de medición y la colocación no tienen costo adicional por distancia.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-claypole', name: 'Claypole', heroBg: '/obra-portones-1.jpg',
    introText: 'Claypole es una de las localidades más activas del partido de Almirante Brown en materia de refacción y obra nueva. Instalamos ventanas de aluminio, puertas, postigones y cerramientos con fabricación propia y colocación en seco. Cubrimos todo Claypole y alrededores desde nuestra fábrica en Adrogué.',
    cercanias: 'Longchamps, Rafael Calzada, Adrogué, Burzaco, Malvinas Argentinas',
    faqExtra: [{ q: '¿Hacen portones y cerramientos en Claypole?', a: 'Sí. Portones de aluminio, cerramientos de galería y rejas son trabajos frecuentes en Claypole. Todo se fabrica a medida en nuestro taller y se instala en seco.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-longchamps', name: 'Longchamps', heroBg: '/obra-postigones-2.jpg',
    introText: 'Longchamps tiene muchas casas de lote grande donde el cambio de aberturas es frecuente: ventanas de hierro o madera que se reemplazan por aluminio con DVH, cerramientos de galería y techos de policarbonato. Fabricamos a medida en Adrogué y llegamos a toda la zona en pocos días.',
    cercanias: 'Claypole, Rafael Calzada, Adrogué, Burzaco, Glew',
    faqExtra: [{ q: '¿Hacen postigones y techos de policarbonato en Longchamps?', a: 'Sí. Postigones de aluminio y techos de policarbonato para galería son dos de los trabajos más frecuentes en Longchamps. Fabricamos a medida y coordinamos la colocación directamente.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-llavallol', name: 'Llavallol', heroBg: '/obra-ventanas-3.jpg',
    introText: 'Llavallol es una localidad del partido de Lomas de Zamora con mucha demanda de renovación de aberturas. Instalamos ventanas de aluminio corredizas y con DVH, puertas y mosquiteros a medida, con colocación en seco y sin obra. Cubrimos Llavallol y localidades vecinas desde nuestra fábrica en Adrogué.',
    cercanias: 'Temperley, Banfield, Turdera, Longchamps, Adrogué',
    faqExtra: [{ q: '¿Pueden renovar ventanas de hierro en Llavallol sin obra?', a: 'Sí. En la mayoría de los casos instalamos sobre el marco existente —en seco— sin romper paredes ni generar escombros. La colocación se hace en un solo día.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-turdera', name: 'Turdera', heroBg: '/obra-puertas-2.jpg',
    introText: 'Turdera es parte del partido de Lomas de Zamora, limítrofe con Almirante Brown. Atendemos fabricación e instalación de ventanas, puertas, postigones y cerramientos de aluminio a medida. Llegamos sin costo adicional y hacemos la instalación en seco para no generar obra sucia.',
    cercanias: 'Llavallol, Temperley, Adrogué, Longchamps, Burzaco',
    faqExtra: [{ q: '¿Atienden toda la zona de Turdera y Llavallol?', a: 'Sí. Turdera y Llavallol forman parte de nuestra cobertura regular en el partido de Lomas de Zamora. Coordinamos medición y colocación sin cargo adicional.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-gerli', name: 'Gerli', heroBg: '/obra-ventanas-5.jpg',
    introText: 'Gerli es una localidad densamente poblada del partido de Lanús, con mucha vivienda familiar y de PH. Renovamos aberturas viejas de hierro o madera por aluminio moderno, sin demolición. Fabricamos ventanas, puertas y cerramientos a medida desde Adrogué con instalación en seco.',
    cercanias: 'Lanús, Valentín Alsina, Avellaneda, Banfield, Lomas de Zamora',
    faqExtra: [{ q: '¿Trabajan en PH y casas antiguas en Gerli?', a: 'Sí. Tenemos mucha experiencia en PH y casas de construcción antigua donde los marcos de hierro están deteriorados. Instalamos aluminio en seco, sin romper el revoque.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-valentin-alsina', name: 'Valentín Alsina', heroBg: '/obra-puertas-3.jpg',
    introText: 'Valentín Alsina está en el límite de Lanús con Avellaneda y tiene alta densidad de viviendas y locales comerciales. Fabricamos aberturas de aluminio a medida: ventanas corredizas, puertas, cerramientos y DVH para casas, PH y frentes de local. Instalamos en seco desde Adrogué.',
    cercanias: 'Lanús, Gerli, Avellaneda, Lomas de Zamora, Temperley',
    faqExtra: [{ q: '¿Hacen frentes de local en Valentín Alsina?', a: 'Sí. Cerramientos y frentes de vidrio con aluminio para locales comerciales son trabajos que realizamos en Valentín Alsina y toda la zona de Lanús.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-bernal', name: 'Bernal', heroBg: '/obra-quincho-3.jpeg',
    introText: 'Bernal es una de las localidades más grandes y pobladas del partido de Quilmes. Fabricamos e instalamos ventanas, puertas, mosquiteros, postigones y cerramientos de aluminio a medida. Atendemos viviendas familiares, locales y edificios con instalación en seco y presupuesto sin cargo.',
    cercanias: 'Quilmes, Ezpeleta, Berazategui, Wilde, Don Bosco',
    faqExtra: [{ q: '¿Atienden Bernal Oeste y Bernal Este?', a: 'Sí. Cubrimos todo el partido de Quilmes incluyendo Bernal Oeste, Bernal Este y las localidades vecinas. La visita de medición es sin cargo y coordinamos según disponibilidad.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-ezpeleta', name: 'Ezpeleta', heroBg: '/obra-ventanas-4.jpg',
    introText: 'Ezpeleta, entre los partidos de Quilmes y Berazategui, tiene mucha vivienda familiar con necesidad de renovación de aberturas. Fabricamos ventanas corredizas, puertas, mosquiteros y cerramientos a medida. Llegamos desde Adrogué y hacemos la colocación en seco, sin romper paredes.',
    cercanias: 'Quilmes, Bernal, Berazategui, Hudson, Ranelagh',
    faqExtra: [{ q: '¿Cubren Ezpeleta Oeste y Este?', a: 'Sí. Atendemos todo Ezpeleta y sus zonas limítrofes. Coordinamos la visita de medición sin cargo y la colocación en el día acordado.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-luis-guillon', name: 'Luis Guillón', heroBg: '/obra-quincho-1.jpeg',
    introText: 'Luis Guillón forma parte del partido de Esteban Echeverría, zona con muchas viviendas de lote amplio y casas en barrios cerrados. Instalamos ventanas de aluminio, puertas, cerramientos de galería y techos de policarbonato a medida. Cubrimos toda la zona desde nuestra fábrica en Adrogué.',
    cercanias: 'Monte Grande, Canning, Tristán Suárez, Ezeiza, La Unión',
    faqExtra: [{ q: '¿Hacen cerramientos de galería en Luis Guillón?', a: 'Sí. Cerramientos de galería con aluminio y vidrio son uno de los trabajos más demandados en la zona. Fabricamos a medida y coordinamos la instalación directamente.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-tristan-suarez', name: 'Tristán Suárez', heroBg: '/obra-postigones-3.jpg',
    introText: 'Tristán Suárez es una localidad del partido de Ezeiza con muchas casas en quintas y barrios privados. Fabricamos e instalamos aberturas de aluminio a medida: ventanas DVH, puertas, portones, cerramientos de galería y techos de policarbonato para patio. Llegamos desde Adrogué y coordinamos todo sin cargo adicional.',
    cercanias: 'Ezeiza, Monte Grande, Canning, Luis Guillón, Glew',
    faqExtra: [{ q: '¿Trabajan en quintas y barrios privados de Tristán Suárez?', a: 'Sí. Atendemos propiedades grandes, quintas y barrios cerrados de la zona. Fabricamos puertas de acceso, portones, cerramientos y techos de policarbonato para galería o patio.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-canning', name: 'Canning', heroBg: '/obra-puertas-1.jpg',
    introText: 'Canning es una de las zonas de mayor crecimiento inmobiliario del conurbano sur, con muchos barrios privados, countries y viviendas nuevas. Fabricamos aberturas de aluminio a medida para obra nueva y para reemplazo: ventanas con DVH, puertas, cerramientos y techos de policarbonato. Llegamos desde Adrogué.',
    cercanias: 'Monte Grande, Luis Guillón, Tristán Suárez, Ezeiza, La Unión',
    faqExtra: [{ q: '¿Atienden countries y barrios privados de Canning?', a: 'Sí. Trabajamos con regulaciones de barrios privados y countries. Podemos proveer aberturas que cumplan con los estándares estéticos del barrio, incluyendo colores y terminaciones específicas.' }],
  }),

  locality({
    slug: 'aberturas-de-aluminio-berazategui', name: 'Berazategui', heroBg: '/obra-ventanas-5.jpg',
    introText: 'Fabricamos e instalamos aberturas de aluminio a medida en Berazategui y todo su partido: ventanas corredizas y DVH, puertas, mosquiteros y cerramientos. La zona tiene mucha vivienda familiar con aberturas de hierro o madera que se pueden renovar sin obra sucia con nuestra instalación en seco. Coordinamos desde Adrogué.',
    cercanias: 'Quilmes, Ezpeleta, Hudson, Ranelagh, Villa España',
    faqExtra: [{ q: '¿Llegan a Hudson y Ranelagh?', a: 'Sí. Hudson, Ranelagh y Ezpeleta están dentro de nuestra zona de cobertura. Coordinamos la medición sin cargo y luego la colocación según la disponibilidad del cliente.' }],
  }),

  {
    ...locality({
      slug: 'aberturas-de-aluminio-capital-federal', name: 'Capital Federal', heroBg: '/obra-puertas-2.jpg',
      introText: 'Fabricamos e instalamos aberturas de aluminio a medida en toda la Ciudad Autónoma de Buenos Aires: ventanas con DVH, puertas, mosquiteros, cerramientos de balcón y frentes de local. Llegamos a todos los barrios porteños —Palermo, Belgrano, Caballito, Flores, San Telmo, Villa Urquiza y más— desde nuestra fábrica propia en Adrogué. Especialistas en departamentos, PH y edificios.',
      cercanias: 'Palermo, Belgrano, Caballito, Flores, Villa Urquiza, Barracas, San Telmo',
      faqExtra: [
        { q: '¿Trabajan en departamentos y edificios de Capital Federal?', a: 'Sí. Tenemos experiencia en todo tipo de edificio porteño: departamentos en altura, PH y plantas bajas. En la mayoría de los casos instalamos en seco, sin permiso de obra ni modificaciones en la mampostería.' },
        { q: '¿Vale la pena el DVH en un departamento sobre avenida en CABA?', a: 'Es la inversión que más se nota. En departamentos sobre Corrientes, Santa Fe, Rivadavia u otras arterias de alto tránsito, el DVH reduce el ruido entre un 60% y 80% según el tipo de vidrio. Además mejora la aislación térmica y baja la calefacción.' },
      ],
    }),
    introEyebrow: 'Capital Federal, Buenos Aires',
    title: 'Aberturas de Aluminio en Capital Federal — Ventanas, Puertas y DVH | Alumfer',
    metaDesc: 'Aberturas de aluminio a medida en Capital Federal (CABA): ventanas DVH, puertas, mosquiteros y cerramientos para departamentos y casas. Fábrica propia en Adrogué. Presupuesto sin cargo.',
    ogTitle: 'Aberturas de Aluminio en Capital Federal | Alumfer',
  },
];
