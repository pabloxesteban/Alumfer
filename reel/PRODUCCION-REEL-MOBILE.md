# ALUMFER — Reel MOBILE "usuario real" · Paquete de producción v2
### 9:16 (1080×1920) · ~20–24s · Simulación de navegación desde el teléfono

> Equipo: Dirección Creativa · Motion Senior · Especialista en Reels · UX/UI ·
> Conversión · Dirección de Arte. Calibrado contra el código real del sitio.
> **Entregable rendereado:** `reel/alumfer-reel-mobile.mp4` (mudo, para audio
> trending). **Footage crudo:** `reel/footage/10-mobile-journey.mp4`.

---

## 1. Enfoque: que parezca una persona usando el sitio en su celular

A diferencia de un screen-recording lineal, el video simula a un **usuario real
navegando desde Instagram**:

- **Layout 100% mobile/responsive** (capturado a 720px de ancho → se dispara el
  breakpoint <768px: menú hamburguesa, barra sticky inferior "Llamar / WhatsApp",
  una sola columna). Escalado a 1080×1920.
- **Scroll humano:** velocidad variable (acelera al "skimear", frena al leer),
  **pausas de lectura**, **micro-retrocesos** (vuelve a mirar algo), nada de scroll
  constante ni robótico.
- **Interacción real:** abre el **menú mobile** y toca "Trabajos", **abre una obra en
  la galería** (lightbox) y pasa a la siguiente, **cambia los tabs** del catálogo,
  se **detiene en las reseñas** y en el **formulario**.

> Implementado en `reel/capture/capture_mobile.mjs` con un motor de scroll por
> `requestAnimationFrame` y easings variables (`outCubic`, `inOutQuad`, `inOutCubic`)
> + pausas con jitter aleatorio para sensación orgánica.

---

## 2. Recursos externos → sin pantallas vacías

Durante la captura, varios recursos externos no cargan (política de red / CDN). Se
reemplazaron para **preservar la percepción visual** y que el usuario final nunca note
que faltaba algo:

| Recurso original | Problema | Reemplazo premium |
|---|---|---|
| Hero (foto Unsplash) | No carga | **Obra real** local (`obra-quincho-1.jpeg`) |
| Thumbnail "Espejado" (Unsplash) | No carga | Foto real de ventana (`obra-ventanas-3.jpg`) |
| Mapa Google embebido (iframe) | Pantalla en blanco | **Placeholder con gradiente de marca** + grilla azul + 📍 "Av. San Martín 734 · Adrogué" |
| GSAP / Lenis / SplitType / Fuentes | CDN bloqueado | **Vendorizados desde npm** e inyectados (animaciones y tipografías Montserrat/Inter intactas) |

Resultado: el sitio se graba **con su identidad y animaciones completas**, sin huecos.

---

## 3. Auditoría mobile (UX/UI + Conversión)

- **Jerarquía visual:** excelente en mobile — H1 grande, subtítulo, **3 stats
  (500+/15+/4.5★)** y doble CTA fijo abajo siempre visible. El ojo va directo al valor.
- **Legibilidad:** alta. Tipografía Inter, buen contraste sobre fondos oscuros. Los
  textos de catálogo son pequeños pero el reel los muestra en bloque (no hay que leerlos).
- **Velocidad de navegación:** el smooth-scroll (Lenis) se siente premium en el dedo.
- **Secciones más atractivas (para captar GBA/CABA):**
  1. **Galería de trabajos + lightbox** → la prueba de calidad más fuerte.
  2. **Hero** (primer impacto + stats de confianza).
  3. **Catálogo** (amplitud: líneas, **DVH**, símil madera, colores).
  4. **Reseñas 4.5★** (prueba social).
- **Mejores puntos de conversión:** barra sticky inferior (siempre a un toque del
  WhatsApp) + botón "Consultar por este trabajo" dentro del lightbox + formulario.

---

## 4. Storyboard · 4 actos · guión segundo a segundo

> Tiempos del corte rendereado (~19.8s; ampliable a 24s). "src" = segundo del
> recorrido `mobile-journey.webm`.

### 🎬 ACTO 1 — HOOK (0.0–3.2s) · "Frená el scroll"
- **Visual:** hero mobile con obra real + título *"Aberturas de aluminio a medida"* +
  stats. Pill azul **"NUEVO SITIO WEB"** arriba.
- **Movimiento:** entrada del título (SplitType) + leve scroll de "asomada" a las stats.
- **Texto:** kicker *"Carpintería de aluminio · Adrogué"* / título **"Estrenamos sitio"**.
- **Transición:** fade 0.4s.

### 🎬 ACTO 2 — DESCUBRIMIENTO (3.2–9.0s) · experiencia mobile
- **3.2–5.0 · Navegación:** se abre el **menú hamburguesa** y se toca una sección →
  scroll fluido. Texto: *"Pensado para tu teléfono / Navegación fluida"*.
- **5.0–7.6 · Trabajos:** recorrido por la **galería de obras** con pausa.
  Texto: *"Obras reales / Mirá nuestros trabajos"*.

### 🎬 ACTO 3 — EXPLORACIÓN (9.0–16.0s) · confianza
- **9.0–11.8 · Lightbox:** se **abre una obra a pantalla completa** (ventana símil
  madera) y se pasa a la siguiente. Texto: *"Cada detalle importa / Calidad que se ve"*.
- **11.8–15.6 · Catálogo:** **cambio de tabs** (Vidrios → Colores) con stagger;
  swatches de terminaciones. Texto: *"Catálogo completo / Todas las líneas · DVH"*.
- **15.6–17.0 · Reseñas:** bloque **4.5★ · 37 reseñas en Google**.
  Texto: *"Reseñas verificadas / 4.5★ en Google"*.

### 🎬 ACTO 4 — CIERRE (17.0–19.8s) · branding + CTA
- **17.0–17.8 · Contacto:** formulario *"Pedinos tu cotización"* + placeholder del mapa.
  Texto: *"Sin intermediarios / Pedí tu presupuesto"*.
- **17.8–19.8 · Tarjeta CTA:** fondo carbón + **logo** + tagline **"Transformamos tu
  espacio"** / *"Diseño · Calidad · Precisión"* + **alumfer.com.ar** + WhatsApp + IG.
- **Frame final loop-friendly.**

**Resumen de movimientos/transiciones:** scroll humano variable (sin cámara virtual
agresiva); transiciones **fade 0.4s** (elegantes, estilo Awwwards); cero glitch/zoom-blur.
Los lower-thirds entran junto al corte (en CapCut/AE conviene darles un *mask reveal*).

---

## 5. Música · análisis competitivo + 5 opciones

**Qué usan hoy las marcas del rubro** (arquitectura premium, reformas, interiorismo,
cerramientos, real estate de alto ticket) según el relevamiento: predominan dos
familias — (a) **lo-fi / downtempo** y **piano calmo cinematográfico** para
recorridos de espacios "soñados", y (b) **deep/organic house** y **electrónica
minimal** con groove constante para dar sensación moderna y premium. El **upbeat
corporativo** aparece en contenido más comercial/promocional. Rango típico:
**90–110 BPM** (contemplativo) y **118–124 BPM** (moderno con drive).

> Nota honesta: no puedo verificar en tiempo real qué *canción puntual* es viral esta
> semana (cambia constantemente y depende de licencias por región). Lo recomendable es
> abrir la **biblioteca de audio de Instagram**, filtrar por el estilo de cada opción y
> elegir un tema **en tendencia** con ese mood; o licenciar en Epidemic Sound / Artlist.
> Abajo, estilos + ejemplos representativos (referencia de mood, no de ranking actual).

### Opción 1 — Comercial popular (audio trending de IG) 🔥 *recomendada para alcance*
- **Qué es:** un tema que ya esté sonando fuerte en Reels, de mood limpio/elegante
  (deep house melódico o pop instrumental cálido).
- **Por qué funciona:** el algoritmo de IG premia el **audio en tendencia** → más alcance.
- **Momento ideal:** todo el reel; sincronizá el *drop* con el corte Hook→Descubrimiento (~3s).
- **Sensación:** actual, cercano, "esto está pasando ahora".

### Opción 2 — Corporate premium
- **Estilo/Referencia:** corporate uplifting instrumental (piano + claps + pads suaves),
  estilo *Epidemic Sound "Corporate"* / artistas tipo Tobu/ikson. **110–120 BPM**.
- **Por qué funciona:** transmite **confianza y profesionalismo** sin sonar frío.
- **Momento ideal:** versión para **anuncio/pauta** dirigida a constructoras y arquitectos.
- **Sensación:** seriedad, solidez, empresa establecida (15+ años).

### Opción 3 — Cinematic architecture
- **Estilo/Referencia:** cinematic minimal con piano + cuerdas + sub-bass, estilo
  *Hans Zimmer / Ólafur Arnalds / Max Richter* (versión instrumental sobria). **80–100 BPM**.
- **Por qué funciona:** estética **Awwwards / estudio de arquitectura**; eleva el diseño
  del sitio y las obras a "obra de autor".
- **Momento ideal:** versión "brand film" más contemplativa (24s), menos comercial.
- **Sensación:** exclusividad, calidad, emoción.

### Opción 4 — Luxury brand
- **Estilo/Referencia:** deep/organic house elegante, estilo *Ben Böhmer / Lane 8 /
  Tinlicker* (instrumental). **118–122 BPM**, graves redondos, hi-hats sutiles.
- **Por qué funciona:** es el sonido de las **marcas de lujo y diseño contemporáneo**;
  combina exactamente con la paleta hormigón+azul.
- **Momento ideal:** **mi recomendación principal de mood** para el master 9:16.
- **Sensación:** premium, sofisticado, aspiracional.

### Opción 5 — Modern technology
- **Estilo/Referencia:** electrónica limpia y rítmica tipo *tech/future-garage*, pads
  brillantes + percusión seca (estilo demos de Apple/keynotes). **120–126 BPM**.
- **Por qué funciona:** subraya la **innovación** (web moderna, UX premium).
- **Momento ideal:** acentuar el Acto 2 (experiencia mobile) y las animaciones.
- **Sensación:** innovador, preciso, "marca que invierte en tecnología".

**Puntos de sincronización (hit points) sugeridos:** ~3.0s (Hook→Descubrimiento),
~9.0s (entra galería/lightbox), ~15.6s (reseñas), ~17.8s (impacto → logo).

---

## 6. CTA final

- Jerarquía: tagline **"Transformamos tu espacio"** → **alumfer.com.ar** (recordación)
  → **WhatsApp 11 6336 8643** (acción) → **@alumfercarpinteria**.
- Verbos en presente argentino: *"Pedí tu presupuesto"*, *"Visitá el sitio"*.
- En la bio/caption dejar el link directo:
  `https://wa.me/5491163368643?text=Hola%2C%20quiero%20pedir%20un%20presupuesto`.
- Geolocalizar el reel en **Adrogué**; caption con foco GBA/CABA + 8–12 hashtags
  (mezcla volumen + nicho local: `#aluminio #DVH #cerramientos #adrogue #zonasur #gba`).

---

## 7. Mejoras del sitio para más impacto (priorizadas)

🔴 **ALTA**
1. **Reemplazar el hero placeholder de Unsplash por una obra real propia** (hoy es una
   foto de stock). Es el primer plano de la web y del reel. *(En el reel ya se hizo el
   reemplazo; conviene aplicarlo también en `index.html`.)*
2. **Optimizar imágenes de galería para vertical** (1–2 "portada" por categoría en alta
   resolución y orientación cuadrada/vertical → mejor recorte 9:16 y lightbox más limpio).

🟠 **MEDIA**
3. **Mapa:** servir un fallback estático (imagen del mapa) para que nunca quede en blanco
   si el iframe falla (como el placeholder que se usó en el reel).
4. **Badges "DVH" y "Símil madera"** destacados en el catálogo (son los diferenciales
   que más impresionan a arquitectos/constructoras).
5. **Lazy-load + peso**: comprimir fotos de obra (WebP) para que el sitio "vuele" en
   mobile — la velocidad percibida es parte del lujo.

🟢 **BAJA**
6. **Antes/Después** con slider (oro para reels futuros).
7. Sección/ancla **"Obra nueva y barrios privados"** orientada a constructoras.

---

### Cómo regenerar
- Footage: `node reel/capture/capture_mobile.mjs` → `clips/mobile-journey.webm`
- Corte: `python3 reel/build_reel_mobile.py` → `reel/alumfer-reel-mobile.mp4`

### Fuentes (relevamiento musical)
- [Trending Instagram Reels Songs — Dash Social](https://www.dashsocial.com/blog/trending-instagram-reels-songs)
- [Instagram Reels Trends: Trending Audio (2026) — SocialPilot](https://www.socialpilot.co/blog/instagram-reels-trends)
- [Architecture / Interior music (No-Copyright) — Pixabay](https://pixabay.com/music/search/architecture/)
