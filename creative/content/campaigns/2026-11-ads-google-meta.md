# Plan de publicidad paga — Google Ads + Meta Ads (Nov 2026)

> Plan de prueba de 3 meses con **US$100/mes en total** (~US$70 Google, ~US$30 Meta).
> Está escrito para pegarlo en **Claude en Chrome** y que vaya armando las campañas.
> Hay dos bloques independientes: **PARTE A (Google)** y **PARTE B (Meta)**.
> Pegá uno por vez, en sesiones separadas.

---

## Antes de pegar (lo hacés vos, no el agente)

1. Iniciá sesión en Chrome con la cuenta de Google del negocio (la misma del Perfil de Google y de Analytics).
2. Para Meta: iniciá sesión en Facebook con la cuenta que administra la página **alumfercarpinteria** y verificá que el **WhatsApp Business** del negocio (+54 11 6336-8643) esté vinculado a la página. Se hace en *Configuración de la página → WhatsApp*.
3. **Los datos de la tarjeta los cargás vos.** El plan le indica al agente que se frene en ese paso.
4. Los montos se cargan **en pesos**. Convertí al dólar del día: US$2,30/día (Google) y US$1/día (Meta). A eso se le pueden sumar IVA y percepciones que cobra el banco.

## Alcance esperado con US$100/mes (estimación, no promesa)

| Canal | Presupuesto | Qué podés esperar por mes (aprox.) |
|---|---|---|
| Google Búsqueda | ~US$70 | 2.000–6.000 veces que aparece el anuncio · 150–400 clics · **10–35 consultas** (WhatsApp, formulario o llamada) |
| Meta (IG + FB) | ~US$30 | **4.000–12.000 personas** de la zona lo ven (10.000–30.000 impresiones) · **15–50 conversaciones** de WhatsApp, de calidad más variable |

- Son rangos típicos para servicios locales en Argentina, no datos de tu cuenta. Los números reales los da cada plataforma al armar la campaña. El agente tiene que anotarlos (ver "Informe final" en cada parte).
- En Google el límite no es solo la plata: si poca gente busca esas palabras en la zona, quizás no se gasta todo el presupuesto. Eso es buena señal: no se paga de más.
- Lo que importa no es el alcance sino cuántas **consultas de obras grandes** llegan y cuántas se cierran.

---
---

# PARTE A — Pegar en Claude en Chrome: GOOGLE ADS

```
Sos mi asistente para armar una campaña de Google Ads para mi negocio. Trabajá en el navegador, paso a paso, y seguí estas reglas:

REGLAS
- No cargues datos de pago ni de facturación. Cuando llegues a ese paso, frená y pedime que lo haga yo.
- Dejá la campaña PAUSADA al terminar. No la actives sin que yo te lo confirme.
- No aceptes "recomendaciones" ni "sugerencias automáticas" de Google salvo que este plan lo diga. Si Google insiste con una campaña "Inteligente" o "Performance Max", rechazala.
- Si algo de la interfaz no coincide con este plan, frená, contame qué ves y preguntame.
- Al final dame el informe que pido al pie.

DATOS DEL NEGOCIO
- Nombre: Alumfer — fábrica de aberturas de aluminio a medida
- Dirección: Av. San Martín 734, Adrogué, Buenos Aires, Argentina
- Web: https://alumfer.com.ar
- Teléfono / WhatsApp: +54 11 6336-8643
- Horario de atención: lunes a viernes 9 a 13 h, sábados 9 a 14 h
- Google Analytics 4: propiedad con ID de medición G-8N6BQW2FNJ (ya instalada en la web)
- La web ya envía a GA4 un evento llamado "whatsapp_click" cuando alguien toca un botón de WhatsApp.
- Cuando alguien envía el formulario, la web lo lleva a la página https://alumfer.com.ar/gracias.html

PASO 1 — Medición en Google Analytics (analytics.google.com)
1. Entrá a la propiedad G-8N6BQW2FNJ.
2. Administrar → Eventos → Crear evento. Nombre: "formulario_enviado". Condiciones: event_name es igual a page_view Y page_location contiene "gracias". Guardar.
3. Administrar → Eventos clave (o "Conversiones"): marcá como evento clave "whatsapp_click". Marcá también "formulario_enviado" (si todavía no aparece en la lista, creálo como nuevo evento clave con ese nombre exacto).
4. Avisame si algo de esto ya estaba hecho.

PASO 2 — Cuenta de Google Ads (ads.google.com)
1. Si no hay cuenta, creala. Cuando ofrezca crear una "campaña inteligente", buscá la opción "Cambiar al modo experto" y usala. Si te pide crear una campaña para terminar el alta, elegí "Crear una cuenta sin campaña".
2. País: Argentina. Zona horaria: (GMT-03:00) Buenos Aires. Moneda: ARS (peso argentino). Ojo: moneda y zona horaria no se pueden cambiar después.
3. Facturación: FRENÁ y pedime que cargue la tarjeta.
4. Configuración de la cuenta → "Recomendaciones de aplicación automática": desactivá todas.

PASO 3 — Vincular y conversiones
1. Herramientas → Cuentas vinculadas → Google Analytics (GA4): vincular la propiedad G-8N6BQW2FNJ.
2. Herramientas → Conversiones → Nueva acción de conversión → Importar → Google Analytics 4 → Web: importá "whatsapp_click" y "formulario_enviado". Las dos como acción "Principal". Valor: no usar valor. Recuento: "Una".
3. Si alguno no aparece todavía, avisame (GA4 puede tardar hasta 24 h en mostrarlo) y seguí con el resto.

PASO 4 — Crear la campaña
- Objetivo: "Clientes potenciales" (o "Crear una campaña sin un objetivo" si no deja elegir lo siguiente).
- Tipo: Búsqueda.
- Nombre: "Busqueda - Alumfer - Zona Sur"
- Redes: DESTILDAR "Socios de búsqueda de Google" y DESTILDAR "Red de Display".
- Ubicaciones: "Introducir otra ubicación" → "Búsqueda avanzada" → "Radio": 15 km alrededor de "Av. San Martín 734, Adrogué".
- Opciones de ubicación (desplegar "Opciones de ubicación"): elegir "Presencia: personas que están o suelen estar en las ubicaciones incluidas". NO la opción recomendada de "presencia o interés".
- Idiomas: español.
- Segmentos de audiencia: no agregar ninguno.
- Presupuesto diario: el equivalente en pesos a US$2,30 (te lo confirmo yo antes de guardar; preguntame el monto).
- Oferta: "Clics" / "Maximizar clics". Tildar "Establecer un límite máximo de oferta de CPC" y preguntarme el monto (aprox. el equivalente a US$0,50).
- Programación de anuncios: lunes a sábado, de 8:00 a 21:00.
- Fecha de inicio: hoy. Sin fecha de finalización.
- Si aparecen "Recursos generados automáticamente" o "Expansión de URL final": desactivarlos.

PASO 5 — Grupo de anuncios 1: "Ventanas y DVH"
Palabras clave (copiarlas tal cual, con comillas y corchetes):
"ventanas de aluminio a medida"
"ventanas de aluminio"
"ventanas dvh"
"ventanas con dvh"
"doble vidrio hermetico"
"cambiar ventanas"
"fabrica de ventanas de aluminio"
"carpinteria de aluminio"
"aberturas de aluminio a medida"
"aberturas de aluminio"
[ventanas de aluminio adrogue]
[ventanas de aluminio lomas de zamora]
[aberturas de aluminio zona sur]

Anuncio de búsqueda responsivo:
- URL final: https://alumfer.com.ar/ventanas-dvh/
- Ruta visible: ventanas / dvh
- Títulos (15):
Ventanas de Aluminio a Medida
Ventanas DVH en Zona Sur
Fábrica Propia en Adrogué
Medición Sin Cargo
Presupuesto Sin Cargo
Sin Intermediarios
Colocación en Seco
Doble Vidrio Hermético (DVH)
Menos Frío, Menos Ruido
40 Años de Oficio
Pedí Presupuesto por WhatsApp
Fabricamos e Instalamos
Cambiá tus Ventanas por DVH
Alumfer Aberturas
Garantía en Fabricación
- Fijar (con el ícono de chincheta) "Ventanas de Aluminio a Medida" en la posición 1. El resto sin fijar.
- Descripciones (4):
Fabricamos tus ventanas en nuestro taller de Adrogué y las colocamos nosotros.
Ventanas con DVH: menos frío en invierno y menos ruido de la calle. Presupuesto sin cargo.
Medimos tu obra, fabricamos a medida y colocamos en seco. Zona Sur del GBA.
40 años de oficio y más de 500 obras. Mandanos una foto por WhatsApp y te orientamos.

PASO 6 — Grupo de anuncios 2: "Cerramientos y techos"
Palabras clave:
"cerramiento de aluminio"
"cerramientos de aluminio"
"cerramiento de galeria"
"cerrar galeria"
"cerramiento de quincho"
"cerrar quincho"
"cerramiento de balcon"
"techo de policarbonato"
"techos de policarbonato"
"techo de policarbonato con estructura de aluminio"

Anuncio de búsqueda responsivo:
- URL final: https://alumfer.com.ar/cerramientos-de-aluminio/
- Ruta visible: cerramientos / a-medida
- Títulos (15):
Cerramientos de Aluminio
Cerrá tu Galería o Quincho
Techos de Policarbonato
Fábrica Propia en Adrogué
Medición Sin Cargo
Presupuesto Sin Cargo
Sin Intermediarios
Usá el Quincho Todo el Año
Estructura de Aluminio
Fabricamos e Instalamos
Pedí Presupuesto por WhatsApp
40 Años de Oficio
Cerramientos a Medida
Balcones y Galerías Cerrados
Alumfer Aberturas
- Fijar "Cerramientos de Aluminio" en la posición 1.
- Descripciones (4):
Cerramos galerías, quinchos y balcones con aluminio a medida. Fábrica propia en Adrogué.
Techos de policarbonato con estructura de aluminio. Medimos, fabricamos y colocamos.
Mandanos una foto del espacio por WhatsApp y te pasamos un presupuesto sin cargo.
40 años de oficio y más de 500 obras en Zona Sur. Garantía en fabricación.

PASO 7 — Palabras clave negativas (a nivel campaña)
Herramientas → Biblioteca compartida → Listas de palabras clave negativas → nueva lista "Negativas Alumfer", aplicarla a la campaña. Contenido (concordancia amplia, una por línea):
kilo
kg
perfil
perfiles
mayorista
mayor
distribuidor
curso
cursos
capacitacion
empleo
trabajo
trabajar
sueldo
usada
usadas
usado
segunda mano
mercadolibre
mercado libre
easy
sodimac
como hacer
como armar
tutorial
pdf
manual
dibujo
autocad
precio del aluminio
reciclaje
chatarra
gratis

PASO 8 — Recursos (extensiones) a nivel campaña
- Llamada: +54 11 6336-8643. Programación: lunes a viernes 9:00–13:00, sábado 9:00–14:00.
- Enlaces de sitio (4):
  1. "Ventanas DVH" → https://alumfer.com.ar/ventanas-dvh/ · desc: "Menos frío y menos ruido" / "Fabricadas a medida"
  2. "Cerramientos" → https://alumfer.com.ar/cerramientos-de-aluminio/ · desc: "Galerías, quinchos, balcones" / "Medición sin cargo"
  3. "Techos de Policarbonato" → https://alumfer.com.ar/techos-de-policarbonato/ · desc: "Con estructura de aluminio" / "Fabricación propia"
  4. "Puertas de Aluminio" → https://alumfer.com.ar/puertas-de-aluminio/ · desc: "Entrada, patio y balcón" / "A medida de tu obra"
- Textos destacados: Fábrica propia en Adrogué · Medición sin cargo · Colocación en seco · Presupuesto sin cargo · Sin intermediarios · 40 años de oficio
- Ubicación: vincular el Perfil de Empresa de Google de Alumfer (Adrogué) si aparece para vincular.

PASO 9 — Revisión y cierre
1. Revisá que no haya errores ni advertencias de política. Si hay, contame cuáles.
2. Publicá la campaña y PAUSALA enseguida (o guardala pausada si la interfaz lo permite).
3. No actives nada: yo lo hago después de revisar.

INFORME FINAL (dámelo al terminar)
- Qué quedó hecho y qué no (y por qué).
- Las estimaciones que muestre Google: clics por semana/mes, costo por clic estimado e impresiones. Si existen, también los datos del Planificador de palabras clave (Herramientas → Planificador de palabras clave → "Obtener volumen de búsquedas y previsiones") para las palabras de los dos grupos de anuncios.
- Si las conversiones "whatsapp_click" y "formulario_enviado" quedaron activas o "sin verificar".
```

---
---

# PARTE B — Pegar en Claude en Chrome: META ADS (Instagram + Facebook)

```
Sos mi asistente para armar una campaña en el Administrador de anuncios de Meta (adsmanager.facebook.com) para mi negocio. Trabajá paso a paso con estas reglas:

REGLAS
- No cargues datos de pago. Cuando llegues a ese paso, frená y pedime que lo haga yo.
- Dejá la campaña EN BORRADOR o PAUSADA. No la publiques activa sin mi confirmación.
- Usá el Administrador de anuncios, NO el botón "Promocionar" de Instagram.
- No inventes datos del negocio ni promesas (descuentos, plazos, precios). Usá solo los textos de este plan.
- Si algo de la interfaz no coincide con el plan, frená y preguntame.
- Al final dame el informe que pido al pie.

DATOS DEL NEGOCIO
- Alumfer — fábrica de aberturas de aluminio a medida, Av. San Martín 734, Adrogué, Buenos Aires.
- Página de Facebook: facebook.com/alumfercarpinteria · Instagram: @alumfercarpinteria
- WhatsApp Business: +54 11 6336-8643
- Web: https://alumfer.com.ar

PASO 1 — Revisar la cuenta
1. Verificá que exista una cuenta publicitaria del negocio, conectada a la página de Facebook y a la cuenta de Instagram @alumfercarpinteria. Si falta conectar Instagram, guiame.
2. Verificá que el WhatsApp +54 11 6336-8643 esté vinculado a la página. Si no lo está, frená y avisame (el código de verificación me llega a mí).
3. Moneda ARS y zona horaria Buenos Aires (si la cuenta es nueva). Pago: FRENÁ y pedime que lo cargue yo.

PASO 2 — Campaña
- Crear → Objetivo: "Interacción" (Engagement).
- Nombre: "WhatsApp - Alumfer - Zona Sur"
- Presupuesto de campaña Advantage: desactivado (el presupuesto va en el conjunto de anuncios).
- Categoría especial de anuncios: ninguna.

PASO 3 — Conjunto de anuncios
- Nombre: "Zona Sur 15km - 30-65"
- Ubicación de la conversión: "Apps de mensajes" → solo WhatsApp, número +54 11 6336-8643.
- Objetivo de rendimiento: "Maximizar el número de conversaciones".
- Presupuesto: diario, el equivalente en pesos a US$1 (preguntame el monto antes de guardar).
- Calendario: comienza hoy, sin fecha de fin.
- Público:
  - Ubicación: "Personas que viven en esta ubicación" (no "que estuvieron recientemente"). Radio de 15 km alrededor de Av. San Martín 734, Adrogué.
  - Edad: 30 a 65+. Sexo: todos. Idioma: español.
  - Intereses: no agregar (público amplio). Si la interfaz usa "Público Advantage+", dejalo activado con estos controles: ubicación y edad mínima 30.
- Ubicaciones: "Ubicaciones Advantage+" (automáticas).
- Mensaje de bienvenida de WhatsApp (plantilla): "Hola, vi el anuncio de Alumfer y quiero pedir un presupuesto." con estas preguntas frecuentes rápidas:
  1. "Quiero presupuesto de ventanas"
  2. "Quiero cerrar una galería o quincho"
  3. "Quiero un techo de policarbonato"

PASO 4 — Anuncios (3 dentro del mismo conjunto)
Para la imagen o el video, PRIMERO intentá "Usar publicación existente" y elegí publicaciones de @alumfercarpinteria que muestren obras reales del tipo indicado (preferí reels y antes/después). Mostrame cuáles elegiste antes de guardar. Si no hay una buena, usá estas fotos de la web (descargalas o subilas desde la URL):

Anuncio 1 — "Ventanas DVH"
- Imagen/video: obra de ventanas. Fotos: https://alumfer.com.ar/obra-ventanas-1.jpg · https://alumfer.com.ar/obra-ventanas-2.jpg · https://alumfer.com.ar/obra-ventanas-3.jpg
- Texto principal:
Ventanas de aluminio con DVH, fabricadas en nuestro taller de Adrogué y colocadas por nosotros.
Menos frío en invierno, menos ruido de la calle.
Mandanos una foto de tu ventana actual y te pasamos presupuesto sin cargo.
- Título: Ventanas a medida en Zona Sur
- Botón: "Enviar mensaje de WhatsApp"

Anuncio 2 — "Cerramientos"
- Imagen/video: quincho o galería cerrada. Fotos: https://alumfer.com.ar/obra-quincho-1.jpeg · https://alumfer.com.ar/obra-quincho-2.jpeg · https://alumfer.com.ar/obra-quincho-3.jpeg
- Texto principal:
Cerramos quinchos, galerías y balcones con aluminio a medida, para usarlos también cuando hace frío.
Medimos, fabricamos y colocamos nosotros. Sin intermediarios.
Contanos cómo es tu espacio por WhatsApp.
- Título: Cerramientos de aluminio a medida
- Botón: "Enviar mensaje de WhatsApp"

Anuncio 3 — "Techos de policarbonato"
- Imagen/video: techo de policarbonato. Fotos: https://alumfer.com.ar/obra-techo1.jpeg · https://alumfer.com.ar/obra-techo2.jpeg · https://alumfer.com.ar/obra-techo3.jpeg
- Texto principal:
Techos de policarbonato con estructura de aluminio, hechos a la medida de tu patio o galería.
Fábrica propia en Adrogué, 40 años de oficio.
Mandanos una foto del lugar y te pasamos presupuesto sin cargo.
- Título: Techos de policarbonato en Zona Sur
- Botón: "Enviar mensaje de WhatsApp"

En los 3 anuncios: desactivá las "Mejoras creativas de Advantage+" que agregan música, cambian el texto o generan imágenes con IA. Dejá solo los ajustes de recorte/brillo si no se pueden desactivar.

PASO 5 — Revisión y cierre
1. Revisá la vista previa en Feed de Instagram, Reels e Historias. Si algún recorte tapa la obra, contame.
2. Guardá todo en borrador o publicá y pausá enseguida. No lo dejes activo.

INFORME FINAL (dámelo al terminar)
- Qué quedó hecho y qué no (y por qué).
- El "Tamaño estimado del público" y los "Resultados diarios estimados" (alcance y conversaciones) que muestra Meta en el conjunto de anuncios.
- Qué publicaciones o fotos quedaron en cada anuncio.
```

---
---

## Después de activar: rutina de seguimiento (la hacés vos, o pedísela al agente)

**Cada semana (15 minutos):**
- Google → Palabras clave → **Términos de búsqueda**: lo que no tenga que ver con hacer una obra (ej. "perfil", "precio por kilo", otra marca) va a la lista "Negativas Alumfer".
- Meta → mirá cuántas conversaciones hubo y costo por conversación. Si un anuncio gasta y no trae mensajes en 7–10 días, pausalo.
- Anotá en una planilla cada consulta con: fecha, de dónde vino (Google / Instagram / Facebook / orgánico), qué pidió, y si se cerró. Preguntar "¿cómo nos encontraste?" en el primer mensaje.

**A los 30 días:** si Google tiene 15+ conversiones, cambiar la oferta a "Maximizar conversiones".

**A los 60–90 días, decidir:**
- Costo por consulta de cada canal = gasto ÷ consultas.
- Costo por obra cerrada = gasto ÷ obras cerradas.
- Mover el presupuesto al canal con menor costo por **obra cerrada** (no por clic ni por mensaje). Si el total da ganancia, subir de a 20–30% por mes.

**Fase 2 (si funciona):** sumar un grupo "Puertas" (→ `/puertas-de-aluminio/`), ampliar el radio a 25 km o sumar CABA, e instalar el Pixel de Meta en la web.
