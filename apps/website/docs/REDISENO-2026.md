# Evolución visual del sitio — Auditoría, investigación y propuesta

> Octubre 2026. La consigna fue **evolucionar** el sitio, no rehacerlo: conservar
> lo que funciona (70–85 %) y sacar la sensación de "web genérica / de template".
> Este documento es el análisis previo a tocar código y el registro de lo que se
> implementó. Complementa a [`AUDIT.md`](AUDIT.md) (auditoría técnica y comercial
> anterior) y a [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## A. Auditoría del sitio actual

### Qué es técnicamente

- Sitio estático sin framework ni build: `index.html` + 6 páginas de servicio +
  27 landings de localidad + hub de guías y 4 guías + `gracias.html`.
  Todas comparten `tokens.css → base.css → components.css → animations.css →
  cinematic.css` y `main.js` + `cinematic.js`.
- Animación "de lujo" cargada desde CDN en las 39 páginas: GSAP, ScrollTrigger,
  Lenis (smooth scroll) y SplitType (título palabra por palabra). Son 4 requests
  externos y ~140 KB de JS sin comprimir para un sitio de folleto.
- `tools/build-landings.mjs` **ya no coincide** con las páginas publicadas
  (las páginas se editaron a mano después: guías en el menú, `og:image`,
  `?v=9`, logo en WebP). Regenerarlas hoy pisaría esas mejoras. Por eso todos
  los cambios de esta pasada se hicieron sobre el HTML real.

### Fortalezas (se conservan)

| Qué | Por qué funciona |
|---|---|
| Paleta hormigón + carbón + un solo azul | Es sobria, de rubro, y ya es identidad. No se toca. |
| Inter como única familia | Neutra y legible. Cambiarla sería cambiar identidad. Se ajusta el uso, no la familia. |
| Copy | Concreto y con voz propia: "Más de 40 de oficio", "colocación en seco", "sobre el marco existente", "sin intermediarios". Es lo menos genérico del sitio. |
| Fotos de obra propias (≈45) | Fotos de celular, honestas: obra terminada, aberturas en el taller, envueltas en film. Es el activo más valioso del sitio. |
| Estructura de la home | Hero → empresa → trabajos → proceso → catálogo → reseñas → garantía → FAQ → contacto. Es el recorrido correcto para el rubro. |
| Conversión | WhatsApp en todos lados, barra fija Llamar/WhatsApp en mobile, formulario corto con ejemplo de consulta real, `tel:`. |
| SEO local | JSON-LD, FAQ schema, 27 landings, sitemap, guías con voz propia. |
| Catálogo | Líneas reales (Herrero, Rotonda 640, Módena 1/2, A30 New), vidrios, colores con nombre, policarbonato, 15 diseños de poliestireno. |

### Problemas concretos

1. **El hero de la home es una foto de stock** (`background-alumfer.webp`:
   ventana de un edificio con palmeras y torres; en el código dice "Reemplazá
   el src con una foto real de obra"). Es lo primero que se ve y no es Alumfer.
2. **Las fotos reales están escondidas o mal recortadas.** En la galería se
   recortan a 4:3 cuando casi todas son verticales: se cortan marcos, manijas y
   herrajes, justo lo que hay que mostrar.
3. **Las páginas de producto no muestran obras.** `/ventanas-de-aluminio/` no
   tiene ni una foto de ventanas hechas por Alumfer en el cuerpo de la página;
   solo los renders de perfil del proveedor. Lo mismo en puertas, mosquiteros,
   cerramientos, techos y DVH.
4. **Mismo hero en las 39 páginas**: 100 % de alto, texto centrado sobre foto
   oscurecida al 35 %, dos botones y la fila 500+ / 15+ / 4.5★. Incluso las
   guías (que son artículos) abren con estadísticas de venta.
5. **Bug**: en las 5 páginas de guías el botón secundario "Ver beneficios"
   apunta a `#beneficios`, que no existe. En el hub de guías el `aria-label`
   del hero y el texto de WhatsApp dicen "ventanas con DVH" (copiado de otra guía).
6. **Kit de animación de template**: smooth scroll que secuestra la rueda,
   título que entra palabra por palabra, botones "magnéticos", parallax del
   fondo, barra de progreso de lectura y contadores que arrancan en 0.
7. **Todo es pill o card redondeada**: tabs de 999 px, botón de WhatsApp de
   99 px, cards de 16 px, pasos del proceso en cajas, garantía en caja con borde
   azul, íconos en cuadraditos. Variable `--radius-full` y `--radius` usadas
   pero **no definidas** (quedan en 0 por accidente).
8. **Íconos genéricos** en "Nosotros": casita, libro abierto (para "a medida"),
   escudo con tilde y camión. No dicen nada del oficio.
9. **Título "Todas las líneas del mercado"**: promesa genérica que el propio
   catálogo no sostiene (muestra 5 líneas).
10. **Tabs sin `aria-selected`**: un lector de pantalla no sabe cuál está activa.

### Mobile

Es de lo mejor del sitio: barra fija Llamar/WhatsApp, carruseles con swipe
nativo, tabs con scroll horizontal. Problemas: el hero ocupa toda la pantalla
sin mostrar ningún producto real, y los 4 scripts de animación pesan más en
celulares de gama media, que son la mayoría del tráfico local.

### Performance / accesibilidad / SEO

- LCP de la home: foto de stock de 41 KB (bien de peso, mal de contenido).
- 4 scripts de CDN bloquean el hilo principal al cargar (GSAP + plugins).
- `prefers-reduced-motion` respetado. `:focus-visible` presente. Faltaba
  `aria-selected` en tabs.
- SEO técnico bien resuelto (no se toca).

---

## B. Competencia argentina — qué hacen y qué aprender

Sitios efectivamente cargados (no se infirió nada de los que no cargaron):

| Sitio | Qué hace bien | Qué hace mal |
|---|---|---|
| [Aluar Soluciones Arquitectura](https://soluciones-arquitectura.aluar.com.ar) | Obras filtrables por sistema usado (A30 New, Módena…): la obra prueba el producto. Guía "¿Cómo elegir tu ventana?". Ficha A30 New en tabla por tipología (marco 60 mm, DVH 18–32 mm, EPDM). | Datos solo en PDF; PDFs viejos dan 404. |
| [Alcemar](https://www.alcemar.com.ar) (Quilmes) | Obras con nombre propio, sellos IRAM/INTI/Aluar, dirección y WhatsApp visibles. | Sección de novedades abandonada → parece empresa quieta. |
| [REHAU Argentina](https://www.rehau.com/ar-es) | Sistemas con nombre propio, showroom físico, folletos. | Promete "superior" sin números. |
| [Durlock](https://www.durlock.com) | Menú de acciones: Productos / Cotizá / Calculá / Dónde comprar. | La cotización te saca a otra plataforma. |
| [Hunter Douglas AR](https://www.hunterdouglas.com.ar) | Obras con crédito al estudio, programa para profesionales. | Mucho adjetivo, poco dato. |
| [Loma Negra](https://www.lomanegra.com) | Categorías claras, "100 años". | Un contador animado muestra **"+0 Colaboradores"**: un número roto destruye confianza. |
| [VASA](https://www.vasa.com.ar) | Navegación por solución (térmico, acústico, seguridad). | Datos escondidos en boletines. |
| [Aberturas Malvinas](https://www.aberturasmalvinas.com.ar) | El caso más parecido a Alumfer: familiar, 20 años, fotos de obra propia, Módena y A30. | Texto relleno de keywords, mezcla stock con propias, sin testimonios ni garantía. |
| [Santiago Aberturas](https://santiagoaberturas.com) | Nombra líneas y "fábrica propia de DVH". | Carrito sin precios: confunde en producto a medida. |
| [Aberturas Mundo](https://www.aberturasmundo.com.ar) | — | Galerías sin texto, mail de hotmail, sin datos: lo que hay que evitar. |

**Conclusión del mercado local:** en Zona Sur la vara es baja (muchos
fabricantes viven en directorios, MercadoLibre e Instagram). Alumfer ya está
por encima; lo que lo separa de "empresa consolidada" no son efectos sino
**fotos propias protagonistas, datos concretos y cero stock**.

Patrones que se toman:
1. Decir quién, qué y dónde arriba de todo (Alumfer ya lo hace).
2. La obra demuestra el producto: fotos reales en cada página de producto.
3. Datos técnicos cortos y verdaderos; nunca inventar valores U o clases IRAM.
4. Nada de contadores animados: el número tiene que estar escrito.
5. Tono sobrio, palabras de oficio.

## C. Referencias internacionales

Premios confirmados en Awwwards: **Mutina** (Honorable Mention 2019) y **Vitra
Office Chair Finder** (SOTD 2022). Del resto (Sky-Frame, Panoramah, Crittall,
Maxlight, Schüco, Reynaers, Technal) no se encontró premio verificable: se usan
como referentes del rubro, no como "premiados".

| Sitio | Qué aprender | Qué NO trasladar |
|---|---|---|
| [Sky-Frame](https://www.sky-frame.com/en/products/classic/) | Ficha con números grandes y unidades chicas; opcionales como tiles con nombre corto. Radios 0. | Virtual House / 3D. |
| [Panoramah](https://www.panoramah.com/ah38/) | "Anatomía" del perfil con 6 piezas rotuladas: un corte vale más que diez fotos de ambiente. | Datos de performance sin ensayo propio. |
| [Crittall](https://www.crittall-windows.co.uk) | Radios de 4 px; **una sola transición `.3s ease` en todo el sitio**. Casos con crédito al instalador. | — |
| [Reynaers](https://www.reynaers.com/en) | Debajo de cada foto de obra, el sistema usado. | — |
| [Maxlight](https://maxlight.com/) | Inter + serif de Google Fonts; "4.9★ Google" como prueba social sobria. | — |
| [Schüco](https://schueco.com/uk/specifiers/products/windows/aluminium/aws-75-wf-si-) | Plantilla de ficha repetible: beneficio → info técnica → galería → documentación. | Áreas con login. |
| [Mutina](https://www.mutina.it/en) | `border-radius: 0`, casi monocromo con un acento. | Transiciones de página con Barba/GSAP. |
| [Technal](https://www.technal.com) | La más sobria: un azul sobre grises, transiciones de 0.3 s. | Portales por divisiones. |

Denominador común de todos: **canto recto (0–4 px), un acento sobre neutros,
foto de obra real, motion casi invisible**. Ninguno usa pills, glassmorphism ni
títulos que entran palabra por palabra.

## D. Diagnóstico: qué hace que esta web parezca generada por IA

### Lo que SÍ tiene

| # | Problema | Por qué se lee genérico | Solución | Impacto | Complejidad | Cuándo |
|---|---|---|---|---|---|---|
| 1 | Hero con foto de stock (palmeras, torres) | Es la imagen de cualquier inmobiliaria. No es una obra de Alumfer ni de Zona Sur. | Foto propia como protagonista, sin oscurecer, en composición texto + foto. | Muy alto | Baja | **Ahora** |
| 2 | Hero idéntico en 39 páginas (centrado, 100vh, foto al 35 %, fila de stats) | Es *la* estructura de template de Framer/Webflow. | Mismo contenido, composición en dos columnas con la foto real a la vista. En guías, hero corto sin stats. | Alto | Baja | **Ahora** |
| 3 | Título palabra por palabra + smooth scroll + botones magnéticos + parallax + barra de progreso | Es el kit de efectos que traen los templates "premium" y las webs hechas con IA. No aporta a entender el producto. | Sacarlos. Quedan: fade corto de entrada y reveal suave al scrollear (ya existen en CSS). | Alto | Baja | **Ahora** |
| 4 | Contadores que suben desde 0 | Efecto de landing SaaS; si falla el JS queda "0+" (caso Loma Negra). | Número escrito y fijo. | Medio | Baja | **Ahora** |
| 5 | Pills (999 px) y cards de 16 px | Lenguaje de app/SaaS. El rubro (aluminio, vidrio, perfiles) es de canto recto. | Radios 2–4 px en todo. | Alto | Baja (tokens) | **Ahora** |
| 6 | Íconos genéricos en cajitas (casa, libro, escudo, camión) | Set de íconos de cualquier landing. El libro para "a medida" no significa nada. | Sacar los íconos; el texto ya dice todo. Una regla azul arriba de cada columna (firma que ya existe). | Medio | Baja | **Ahora** |
| 7 | Todo en cards con borde (proceso, garantía) | "Todo es card" es el patrón más reconocible de UI generada. | Proceso en columnas con regla superior y número; garantía sin caja. | Medio | Baja | **Ahora** |
| 8 | Productos sin fotos de obra en sus páginas | Una página de ventanas sin ventanas reales parece contenido genérico de SEO. | Franja "Trabajos de Alumfer" con fotos propias en cada página de producto. | Muy alto | Baja | **Ahora** |
| 9 | Galería que recorta verticales a 4:3 | Se pierde el producto; parece grilla automática. | Proporción 4:5 en desktop, que respeta las fotos verticales. | Alto | Baja | **Ahora** |
| 10 | "Todas las líneas del mercado" | Promesa vacía y comprobablemente falsa. | "Líneas, vidrios y terminaciones" + aclarar perfiles Aluar. | Medio | Baja | **Ahora** |
| 11 | Hero con título liviano (300) + negrita | Contraste light/bold típico de landing startup. | Peso 400 parejo con la palabra clave en 600: más sólido. | Bajo | Baja | **Ahora** |
| 12 | Fotos sin epígrafe (solo "Ventanas") | Galerías sin dato parecen relleno. | Epígrafe con localidad + línea + vidrio de cada obra. **Requiere que la empresa aporte los datos**; no se inventan. | Alto | Media | Después |
| 13 | Renders de perfil del proveedor como única imagen de cada línea | Son las mismas imágenes de todos los revendedores de Aluar. | Foto propia del perfil cortado / esquina armada en el taller. **Requiere sesión de fotos.** | Alto | Media | Después |

### Lo que NO tiene (y no hay que agregar)

- Gradientes decorativos: los 7 que hay son funcionales (legibilidad sobre foto, logo de Google). Se quedan.
- Glassmorphism: solo el `blur` de la navbar al scrollear, que es funcional. Se queda.
- Copy genérico: el copy es lo más auténtico del sitio. Se toca solo el título del catálogo.
- Web oscura futurista: el oscuro es carbón/acero, coherente con aluminio. Se mantiene.
- Imágenes generadas por IA: no hay. No se agregan.

## E. Design direction

**Cómo debe sentirse:** un taller serio de Zona Sur que hace bien su trabajo.
Real, sólido, de oficio, cuidado. No "premium de agencia", no startup.

| Elemento | Decisión |
|---|---|
| Tipografía | Inter (se mantiene). Titulares en 400–500, sin pesos 300. Números en `tabular-nums`. Escala actual de tokens sin cambios. |
| Color | Se mantiene: carbón `#1A1C1E`, acero `#2E3338`, hormigón, un azul aluminio `#1B6CC8`. Verde WhatsApp solo en botones de WhatsApp. |
| Radios | 2 px (sm) / 4 px (md, lg) / 6 px (xl). Nada de pills. Canto recto como el perfil. |
| Bordes | 1 px finos (`--border-dark`). La regla azul de 3 px es la firma y se usa en lugar de cajas. |
| Sombras | Solo donde hay superposición real (lightbox, menú). |
| Fotografía | Propia siempre. Sin oscurecer cuando es protagonista. Respetar la proporción vertical. Epígrafes con dato real cuando existan. |
| Iconografía | Solo íconos que nombran un objeto concreto (tipos de abertura en las tabs). Fuera íconos decorativos. |
| Botones | Rectangulares, 4 px. Azul = acción principal; verde = WhatsApp; outline = secundaria. |
| Cards | Solo cuando agrupan algo clickeable o comparable (reseñas, colores). El resto, columnas con regla. |
| Layout | Grilla de 1200 px existente. Hero en dos columnas (texto / foto). |
| Motion | Una sola regla: entradas con fade + 8–24 px en 220–400 ms; hover de 220 ms; zoom de imagen ≤ 3 % en hover de galería. Nada que secuestre el scroll. `prefers-reduced-motion` respetado. |

## F. Roadmap priorizado

| Cambio | Impacto UX | Impacto visual | Complejidad | Prioridad |
|---|---|---|---|---|
| Hero home: foto de stock → foto propia, composición texto + foto | Alto | Muy alto | Baja | **P0** |
| Hero en dos columnas en las 39 páginas (foto real visible, no al 35 %) | Medio | Alto | Baja | **P0** |
| Sacar GSAP/Lenis/SplitType/botones magnéticos/parallax/barra de progreso | Medio (scroll nativo, menos JS) | Alto | Baja | **P0** |
| Fotos de obra propias en las 6 páginas de producto | Muy alto | Alto | Baja | **P0** |
| Arreglar "Ver beneficios" roto y copy del hub de guías | Medio | — | Baja | **P0** |
| Radios rectos (tokens), fuera pills | Bajo | Alto | Baja | **P1** |
| Contadores fijos (sin animación desde 0) | Bajo | Medio | Baja | **P1** |
| Galería 4:5 que no corte las fotos verticales + hover con zoom mínimo | Alto | Alto | Baja | **P1** |
| Proceso y garantía sin cajas; "Nosotros" sin íconos genéricos | Bajo | Medio | Baja | **P1** |
| Título del catálogo honesto | Medio | Bajo | Baja | **P1** |
| Hero de guías corto y sin estadísticas | Medio | Medio | Baja | **P1** |
| `aria-selected` en tabs | Medio (accesibilidad) | — | Baja | **P1** |
| Epígrafes de obra (localidad · línea · vidrio) | Alto | Alto | Media (necesita datos) | **P2** |
| Sesión de fotos (lista abajo) y reemplazo de renders de proveedor | Muy alto | Muy alto | Media (producción) | **P2** |
| Tabla técnica corta por línea con datos del folleto Aluar (tipologías, vidrio admitido, hermeticidad) | Alto | Medio | Media | **P2** |
| Reseñas de obras grandes, no solo mosquiteros | Alto | Bajo | Baja (elegir reseñas reales) | **P2** |
| "Anatomía" del perfil rotulada (marco, hoja, DVH, burlete, herraje) | Medio | Alto | Media | **P3** |
| Sección "Para arquitectos y constructoras" con fichas descargables | Medio | Bajo | Media | **P3** |
| Sincronizar `tools/build-landings.mjs` con el HTML publicado | — (mantenimiento) | — | Media | **P3** |

### Fotografías que conviene producir (P2)

No se inventó ninguna. Donde falta, se usan fotos existentes. Lista concreta
para una tarde de taller + 3 o 4 obras:

1. **Hero horizontal** (16:10, ≥ 2000 px): una abertura terminada en una casa
   real de Zona Sur, de día, desde afuera, con la fachada en contexto. Reemplaza
   a la foto vertical actual del hero.
2. **Taller**: el banco de trabajo con perfiles, la ingletadora cortando, una
   persona armando una hoja (escala humana, manos). Para "Nosotros" y "Fabricación
   en taller propio".
3. **Macro de cada línea**: esquina armada a 45°, felpa/burlete, herraje. Una
   por línea (Herrero, Rotonda 640, Módena, A30 New). Reemplaza los renders del
   proveedor en el catálogo.
4. **Muestras de color reales**: un trozo de perfil por color (blanco, negro,
   bronce colonial, símil madera…) sobre fondo neutro. Reemplaza los círculos.
5. **Antes / después**: misma toma, ventana de hierro vieja y la de aluminio
   colocada en seco. Es el recurso que mejor vende "sin romper paredes".
6. **Colocación**: el equipo instalando sobre el marco existente.
7. **Obra con escala humana**: alguien abriendo una corrediza grande o un
   cerramiento de quincho.

Tomas horizontales y verticales de cada cosa, con luz de día, sin filtros.
Al cargarlas: anotar localidad, línea, vidrio y color de cada obra para los epígrafes.

---

## G. Propuesta por página e implementación (P0 + P1)

### Home (`index.html`)

- **Conservar:** orden de secciones, copy, CTAs, stats, galería con tabs,
  catálogo con tabs, reseñas, garantía, FAQ, formulario, footer.
- **Modificar:** hero → mismo texto alineado a la izquierda y foto propia a la
  derecha (`obra-postigones-6.webp`, postigones símil madera en el taller) con
  epígrafe. Título del catálogo → "Líneas, vidrios y terminaciones".
  Galería 4:5. Proceso sin cajas. Garantía sin caja.
- **Eliminar:** foto de stock del hero, íconos de "Nosotros", barra de progreso,
  scripts de animación de CDN, contadores animados.
- **No tocar:** paleta, tipografía, navegación, formulario, JSON-LD.

### Páginas de producto (6)

- **Conservar:** todo el contenido y orden.
- **Agregar:** franja "Trabajos de Alumfer" con 3–4 fotos propias de la
  categoría y epígrafe que describe lo que se ve, con link a la galería completa.
  En DVH se usan fotos de ventanas con la aclaración "no todas llevan DVH".
  **Mosquiteros queda sin franja**: hay una sola foto de mosquitero y ya es la
  del hero. Es la primera foto a producir.
- **Modificar:** hero en dos columnas.

### Landings de localidad (27)

- **Modificar:** hero en dos columnas, sin scripts de animación.
- **No tocar:** contenido local, reseñas, zonas cercanas, schema.

### Guías (hub + 4)

- **Modificar:** hero corto (sin estadísticas, sin "Ver beneficios" roto).
  Copy del hub corregido.
- **No tocar:** el texto de las guías.


---

## H. Revisión final (después de implementar)

Verificado en navegador (Chromium) a 1440, 1000, 900 y 390 px, en la home, una
página de producto, una de localidad, el hub de guías, una guía y `gracias.html`.

| Punto | Resultado |
|---|---|
| Consistencia | Las 39 páginas usan el mismo hero en dos columnas, los mismos radios (2–4 px) y ningún script externo de animación. |
| Responsive | Sin scroll horizontal en mobile. En mobile el hero es texto → stats → foto 4:3. Se corrigió un bug previo: entre 769 y 960 px el botón "Pedir presupuesto" de la navbar quedaba cortado; ahora en ese rango los links pasan al menú. |
| UX | Tabs, filtro de galería, lightbox, catálogo, menú mobile y anclas (con compensación de navbar) probados automáticamente: todo OK, sin errores de JS. El link del logo (`href="#"`) ya no lanza error. El botón roto "Ver beneficios" de las guías se eliminó. |
| Performance | 4 requests de CDN menos (~140 KB de JS sin comprimir) en cada página. El hero de la home sigue siendo una sola imagen WebP con `fetchpriority="high"`. |
| Accesibilidad | `aria-selected` en las 14 tabs. La foto del hero de la home dejó de ser decorativa: tiene `alt` y epígrafe. Scroll nativo; `prefers-reduced-motion` respetado también en las anclas. |
| Animaciones | Quedan: fade de entrada del hero, reveal al scrollear, transición de tabs y hovers. Se fueron: smooth scroll, título palabra por palabra, botones magnéticos, parallax, barra de progreso y contadores. |
| Jerarquía | El producto aparece en el primer pantallazo de las 39 páginas. Proceso, garantía y "Nosotros" se leen como columnas con filete, no como cajas. |
| Productos | La galería ya no corta las fotos verticales (4:5, 4 columnas). Las páginas de producto muestran obras propias con epígrafe. |
| Look genérico | Sin foto de stock, sin pills, sin íconos decorativos, sin efectos de template. |

### Pendientes que necesitan a la empresa (no se inventaron)

- **Fotos sin marca de agua.** Postigones 2–4, puertas 1–3 y ventanas 1 y 5
  tienen la marca de Alumfer impresa. Se sacaron de todos los heroes; siguen
  en la galería. Conviene conseguir los originales sin marca.
- **Epígrafes con datos** (localidad, línea, vidrio, color) de cada obra.
- **Rotonda 640 y "Perfiles Aluar"**: la garantía dice "Aluminio Aluar en todos
  nuestros trabajos", pero Rotonda 640 es una línea de Hydro, no de Aluar.
  Confirmar con la empresa y ajustar uno de los dos textos.
- **Reseñas**: las 3 de la home son de mosquiteros. Elegir de Google alguna
  reseña real de ventanas, puertas o cerramientos.
- **Foto horizontal para el hero** (ver lista de fotografías arriba).

---

## I. Segunda pasada: rediseño de la home (feedback del cliente)

La primera pasada fue demasiado conservadora: sacó lo genérico pero no le dio
a la web un lenguaje propio. El cliente pidió explícitamente algo más moderno,
con otros colores, más imágenes e interacción en las secciones informativas.
Se rehízo la home con un sistema visual nuevo, **sin inventar contenido**: todo
el texto, las fotos, las líneas, los vidrios, los colores, las reseñas y las FAQ
son los mismos del sitio.

**Archivos:** `index.html`, `home.css` y `home.js` son autónomos (la home ya no
carga `base.css`/`components.css`/`main.js`). Las fuentes están en `fonts/`
(Archivo variable + IBM Plex Mono, licencia OFL), servidas desde el propio sitio.
Las demás páginas siguen con el sistema anterior hasta que se apruebe la home.

| Decisión | Por qué |
|---|---|
| Fondo claro cálido (hormigón) + secciones en acero azulado oscuro | Las fotos de celular se ven mucho mejor sobre claro; el gris oscuro uniforme era lo que más "template" parecía. El azul de marca queda como acento. |
| Archivo (grotesca de ancho variable) + mono técnica | Sale de Inter. La mono para rótulos, números y medidas da lenguaje de plano/taller. |
| Cotas de plano como motivo (hero, paso "medición") | "A medida" es la promesa central: se dibuja literalmente. |
| Fotos como **archivo de obra**: copia impresa con marco blanco, número y tipo | Unifica fotos dispares sin retocarlas ni recortarlas (masonry, proporción original). Siguen siendo reales. |
| Tira de obras en movimiento en el hero | 12 trabajos visibles en el primer pantallazo; volumen = prueba. Pausa al pasar el mouse; estática con movimiento reducido. |
| Proceso interactivo | Cada paso tiene su panel: chat de ejemplo (marcado como tal), plano con cotas, foto de taller y foto colocada. |
| Selector de líneas | Corte de perfil sobre papel cuadriculado + fichas con lo que dice el texto de cada línea (aberturas, vidrios, ideal para). Sin datos técnicos inventados. |
| Configurador vidrio + color | Ventana ilustrativa que cambia en vivo; el botón manda la combinación por WhatsApp. Es información útil y a la vez un CTA. |
| Formulario con "Tipo de trabajo" | **Bug corregido:** `enviar.php` exige `Tipo` y el formulario anterior de la home no lo enviaba, así que toda consulta desde la home fallaba. |

Corrección de dato: el círculo de "Bronce colonial" era gris azulado (`#3A3F47`);
se usa un marrón oscuro. Confirmar con una muestra real.

---

## J. Tercera pasada: todo el sitio, más azul y mobile propio

Pedido del cliente: aplicar el sistema a todas las páginas, que el azul
predomine un poco más (estaba "muy blanco y negro") y un mobile más trabajado,
porque es de donde llega la mayoría de las visitas.

- **Más azul:** las secciones oscuras pasan de gris carbón a azul marino
  (`#0F2847`), "Así trabajamos" es una banda en azul de marca, los botones
  principales, filtros y pestañas activas son azules, la barra superior es
  azul y el hero tiene una grilla de plano en azul tenue.
- **Todas las páginas** (6 de producto, 27 de zona, hub + 4 guías, gracias)
  usan `site.css` + `pages.css` + `site.js`. Se conservó el `<head>` (SEO, OG,
  GA4, evento de conversión) y el texto de cada página; se cambiaron la
  navegación, el hero (ahora con miga de pan y la foto como copia impresa),
  el footer y el contacto. Las páginas de zona suman una franja de 4 fotos de
  obra (sin afirmar que sean de esa localidad).
- **Mobile:** dock flotante Llamar/WhatsApp que se esconde sobre el formulario
  y el pie, menú a pantalla completa en azul marino con teléfono y horarios,
  tira de obras deslizable con imán, filtros en una fila, configurador con la
  ventana fija arriba mientras se eligen vidrio y color, carruseles
  deslizables para fichas, líneas, complementos y reseñas, y proceso como
  línea de tiempo vertical.
- **Limpieza:** se borraron `tokens.css`, `base.css`, `components.css`,
  `animations.css` y `main.js` (ninguna página los usa). `tools/build-landings.mjs`
  queda marcado como obsoleto.

---

## K. Cuarta pasada: punto medio entre oscuro y claro

El cliente encontró la versión clara "demasiado clara" y pidió un punto medio
con la página original (oscura). Se invirtió el tema base:

- **Base azul pizarra oscuro** (`#1E2935` / `#243242`): más claro que el carbón
  casi negro del sitio original, pero oscuro.
- **Negro como punto fuerte** (`#0D141C`): barra superior, navegación y pie.
- **Papel claro sólo donde suma:** las fotos impresas, el panel de líneas, las
  fichas, los complementos, el formulario y dos secciones enteras (archivo de
  obra y preguntas frecuentes; en las internas, la franja de obras y las FAQ).
- Los tokens claros se aplican con un "alcance claro" en `site.css`, así cada
  tarjeta de papel mantiene tinta oscura sin duplicar estilos.
- Los acentos de texto usan `--accent`: azul más luminoso sobre fondo oscuro y
  azul de marca sobre papel.

---

## L. Quinta pasada: animación con sentido y diseñador de aberturas

- **Fichas informativas con dibujos animados:** cada ficha recibe el dibujo de
  lo que describe (según su título): corrediza que se desliza, hoja que se
  abre, banderola que se inclina, mosquitero, frío que rebota contra el DVH,
  lluvia sobre el techo, abertura que entra en el vano (colocación en seco),
  perfiles que se unen a 45° (fábrica). Se trazan al entrar en pantalla y se
  mueven en loop suave; con movimiento reducido quedan quietos.
- **Líneas de tiempo:** la línea se dibuja, los números aparecen en secuencia
  y un punto de luz la recorre (horizontal en desktop, vertical en mobile).
  Los rótulos de sección se subrayan como una cota que se traza.
- **Diseñador de aberturas** (`/disena-tu-abertura/`, en el menú y con un
  adelanto animado en la home): tipología, medidas (con límites 30–400 ×
  30–260 cm), color, vidrio, mosquitero, cantidad y ubicación; plano a escala
  con cotas y persona de 1,70 m; lista editable que se guarda en el navegador;
  envío por WhatsApp, descarga del boceto en PNG o formulario por email.
  Se probaron las 2.880 combinaciones de dibujo como SVG válido.
- **Ideas para siguientes pasos** (no implementadas): foto del vano con la
  abertura superpuesta, guía animada de "cómo medir", precio orientativo
  (sólo si la empresa lo aprueba), modo profesional para arquitectos con
  varias plantas/ambientes.

## M. Sexta pasada: "Probalo en tu pared"

Pedido: que la herramienta de la foto del vano sea lo más real posible,
fluida en compu y celular, y que se use como las apps que la gente ya conoce
(historias de Instagram/WhatsApp).

- **Entrada**: "Sacar foto" (abre la cámara trasera), "Elegir de la galería"
  o "pared de ejemplo" para curiosear sin foto. La foto no sale del teléfono.
- **Editor tipo historia**: pantalla completa negra, "×" y "Listo" arriba,
  opciones en círculos deslizables abajo (Tipo · Color · Vidrio · Luz),
  ayuda inicial con mano animada que se muestra una sola vez.
- **Gestos conocidos**: arrastrar con un dedo, pellizcar para agrandar y
  girar, esquinas para encajarla en perspectiva; en compu, rueda del mouse
  (Shift para girar), doble clic para reiniciar y teclado. El botón "atrás"
  del celular cierra el editor en vez de salir de la página.
- **Realismo**: medidas reales de la tipología, vidrio transparente que deja
  ver la foto detrás (DVH, esmerilado y espejado con su aspecto propio),
  sombra de apoyo en el vano y control de luz con "Igualar a la foto".
- **Sin trabas**: la vista en vivo es sólo un `transform: matrix3d` por
  cuadro (`requestAnimationFrame`), la foto se reduce a 1600 px y la imagen
  final se arma recién al tocar "Listo". Medido en pruebas: ~17–19 ms por
  movimiento del puntero.
- **Salida**: JPG con marca "ALUMFER · vista ilustrativa", compartir directo
  a WhatsApp (Web Share), guardar, abrir chat con el resumen o sumarlo al
  boceto. Aclara que es ilustrativo y que la medida exacta se toma en la
  visita.

## N. Séptima pasada: "Hacé tu plano" (estilo CAD, no una app de filtros)

Pedido: poder dibujar un techo o un plano y mandarlo detallado para
presupuestar, de la forma más profesional posible, estilo AutoCAD.

- **Página propia `/plano/`**, a pantalla completa, con la lógica de un
  programa de dibujo: espacio *Modelo* (fondo oscuro, grilla, cursor en cruz
  con caja de selección, coordenadas X/Y, ícono de ejes, escala gráfica) y
  *Presentación* (la lámina A4 tal como se imprime). Pestañas de láminas,
  barra de herramientas, paleta de propiedades, línea de comandos (`?` lista
  los comandos: AB, COL, Z, U, B, LAM, PDF, DXF…) y barra de estado con
  GRILLA (F7), ORTO (F8) y REFENT (F3).
- **Fachada con aberturas**: se insertan desde una biblioteca dibujada con
  convención de planos (hojas, sentido de corredizas, triángulo de abrir
  hacia las bisagras, mano izq./der.). Arrastrar con imán a bordes, centro y
  alineaciones; pinzamientos para estirar; medidas exactas en Propiedades.
  Cotas en cadena y de niveles automáticas, aviso en rojo si se superponen o
  salen de la pared, y **planilla de carpinterías** (marca, medida, cantidad,
  terminación, antepecho) con un mini dibujo de cada tipo.
- **Techo de policarbonato**: planta poligonal con largos editables por lado,
  lado contra la pared, columnas, altura en la pared y en el frente →
  pendiente y superficie calculadas; **corte A-A** generado solo; materiales
  reales del sitio (alveolar 4/6/8/10 mm, compacto o "que me asesoren").
- **Salidas profesionales**: PDF con todas las láminas en A4 apaisado con
  rótulo (cliente, localidad, escala, fecha, lámina n de N, "medidas a
  verificar en obra"); PNG a 300 dpi; **DXF para AutoCAD** por capas
  (verificado con un lector DXF: 0 errores); link que abre el plano
  editable. Enviar a Alumfer por WhatsApp (resumen + link) o por formulario.
- **Celular**: barra de herramientas abajo, propiedades en hoja deslizable
  que se abre al tocar un objeto, pellizco para zoom, corte debajo de la
  planta en pantalla vertical.
- Accesos: desde la lista del diseñador ("Ubicalas en un plano de
  fachada", trae la lista), desde la home, la página de techos ("Dibujá tu
  techo") y el pie de todas las páginas.

### N.1 Modo Simple y modo Avanzado

El editor CAD es cómodo para quien usa AutoCAD, no para cualquiera. Ahora el
plano abre en **Simple** y se puede pasar a **Avanzado** en cualquier
momento (selector arriba y en la pantalla de inicio); el plano es el mismo.

- **Simple**: lienzo claro tipo papel, sin línea de comandos, barra de
  estado, ORTO/REFENT ni vértices. Panel guiado por pasos con palabras
  comunes y campos grandes con − / + (de a 5 cm):
  - Fachada: 1) Medí la pared → 2) Ventanas y puertas (tarjetas
    desplegables: medida, "desde la izquierda", "desde el piso", color,
    vidrio, bisagras) con **Repartir parejo** y avisos en palabras ("V1 y P1
    se superponen") → 3) Tus datos y envío.
  - Techo: 1) ¿Qué forma tiene? (rectangular / en L, con dibujito numerado)
    → 2) Medidas numeradas igual que el dibujito → 3) Alturas (con un mini
    corte, pendiente y superficie al instante) → 4) Cubierta y estructura →
    5) Tus datos y envío.
  - En el celular el dibujo queda arriba y los pasos abajo, para ver cada
    cambio; se quitan del dibujo las letras de lados y el corte (que sigue
    en la hoja final).
- **Avanzado**: la interfaz CAD de antes, sin cambios.

### N.2 Vista realista en el plano

Pedido: que en el plano se vea la ventana simulada con su color y vidrio.

- Botón **Vista realista** (encendido por defecto, en Simple y Avanzado):
  ventanas y puertas con el color del perfil, el vidrio (transparente,
  esmerilado, espejado, DVH) y el mosquitero, con el mismo motor del
  diseñador y de "Probalo en tu pared"; a través del vidrio se ve cielo si
  la pared se mira desde adentro, o el interior si se mira desde afuera.
- **Color de la pared**: blanca, arena, gris, gris oscuro o ladrillo visto,
  más la opción "La estás mirando desde adentro/afuera".
- **Techos**: policarbonato traslúcido con los perfiles de aluminio en el
  color elegido (ilustrativo, no indica la separación real de perfiles).
- Las cotas, marcas y avisos siguen encima. La hoja que se manda (PDF/PNG)
  y el DXF quedan en formato técnico, que es lo que sirve para presupuestar.

### N.3 Simulación de apertura, catálogo completo y protección

- **"Ver cómo abren"**: en la vista realista, cada abertura se abre y se
  cierra con su movimiento real (corrediza se desliza, de abrir y puertas
  giran sobre las bisagras, banderola bascula, oscilobatiente bascula y
  después abre, portón corredizo sale de costado, levadizo sube, bajo
  mesada y postigón abren sus hojas). Todas juntas o una por una.
- **Catálogo completo** con los nombres de la app de presupuestos: se suman
  puerta balcón de abrir, puerta de tablero / inyectada, cerramiento de
  quincho / galería, baranda de aluminio y vidrio, portón corredizo y
  levadizo, bajo mesada, mosquitero corredizo y fijo, postigón y reja
  (sueltos, o como "agregados" de una ventana: mosquitero, reja, postigón).
  Línea de perfiles: Herrero, Rotonda, A30 New, Módena o "que me asesoren".
  Marcas por grupo en la planilla: V, P, C (cerramientos) y A (complementos).
- **Protección contra el uso de la competencia** (todo del lado del
  navegador, sin cobrar ni pedir cuenta):
  - No se descarga, imprime ni comparte nada sin enviarlo antes a Alumfer
    con nombre y teléfono; si el plano se cambia, hay que reenviarlo.
  - Marca de agua ALUMFER en la pantalla (queda en cualquier captura) y en
    las hojas exportadas, con nombre, teléfono y fecha de quien lo generó.
  - El DXF (lo que más le serviría a otro taller) y las hojas sin marca son
    sólo para Alumfer, con código de taller.
  - Ctrl+P / imprimir la página muestra un aviso en vez del plano.
  - Aviso legal de uso exclusivo en el inicio y en el envío.
  - Límites honestos: una página web no puede bloquear capturas de pantalla
    ni impedir del todo que alguien copie el código; cobrar por guardar
    requiere una cuenta de Mercado Pago y un servidor (queda como opción).

### N.4 PDF con la versión en color, y sin descargas desde la página

- El PDF trae, por cada lámina, la **hoja técnica** y la **hoja ilustrativa
  en color** (misma escala, mismas cotas y planilla; pared con su color o
  ladrillo, aberturas con perfil, vidrio y agregados; techo traslúcido con
  perfiles).
- **No se descarga nada desde la página.** El cliente:
  - lo manda por **WhatsApp** (resumen + link al chat de Alumfer), o
  - deja su **email** y le llega el **PDF adjunto**; a Alumfer le llega
    siempre la copia con el mismo PDF.
- `enviar.php` acepta el adjunto sólo para planos, verifica que sea PDF,
  limita el tamaño y frena a más de 6 planos por hora desde la misma IP
  (para que nadie use el formulario para mandar archivos a cualquiera).
- El taller (con código) sigue pudiendo descargar PDF, imagen y DXF.
- Recomendación para el hosting: `upload_max_filesize` y `post_max_size`
  de al menos 4 MB (el PDF se achica solo para quedar por debajo de 2 MB).

### N.5 Ajustes finales antes de publicar

- Botón **"Enviar por email"** (el cliente envía el plano; le llega una copia
  del PDF).
- **WhatsApp**: el mensaje lleva el link del plano. Al abrirlo aparece
  "Plano recibido · Descargar PDF"; la descarga pide el código de taller
  una sola vez por dispositivo (queda recordado en ese celular o compu).
- **Peso**: PDF de 2 láminas (4 hojas, técnica + color) ≈ 270 KB; se ajusta
  solo para quedar liviano. `plano.js` 42 KB, `aberturas.js` 9 KB y
  `plano.css` 7 KB comprimidos: se activó la compresión (mod_deflate) en
  `.htaccess` para HTML, CSS, JS y SVG.
