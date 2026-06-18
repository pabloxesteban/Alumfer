# ALUMFER — Reel de lanzamiento del sitio web
### Paquete de producción completo · Formato 9:16 (1080×1920) · 18–20 s

> Documento elaborado como si lo firmara un equipo de **Dirección Creativa, Motion
> Senior, Especialista en Reels, UX/UI, Dirección de Arte y Conversión**.
> Todo está calibrado contra el código real del sitio (`index.html`, `tokens.css`,
> `cinematic.js`, `main.js`) para que las grabaciones de pantalla y el motion
> coincidan exactamente con lo que ya existe.

---

## 0. TL;DR (para producir rápido)

- **Protagonista:** el sitio en movimiento (no fotos sueltas). Grabás la pantalla del
  sitio real y la editás con ritmo musical.
- **Duración:** 18 s (versión recomendada). Variante corta 12 s para Stories.
- **Estructura:** Gancho (0–3 s) → Sitio en acción (3–13 s) → Prueba/diferenciales
  (13–16 s) → CTA (16–18 s).
- **Música:** electrónica minimal / cinematic house, 120–124 BPM, con un *drop* suave
  en el segundo ~3 que sincroniza con el primer scroll.
- **Tono:** estudio de arquitectura premium. Elegante, con aire, sin “marketing barato”.

---

## 1. Auditoría crítica del sitio (Dirección de Arte + UX)

### 1.1 Identidad de marca (de `tokens.css`)
| Elemento | Valor | Uso en el reel |
|---|---|---|
| Carbón (fondo) | `#1A1C1E` | Fondos de tarjetas, letterboxing |
| Acero | `#2E3338` | Fondos intermedios |
| **Azul aluminio (acento)** | `#1B6CC8` | Línea de identidad, subrayados, barra de progreso |
| Azul claro | `#4A9DE8` | Destacar URL y datos de contacto |
| Hormigón claro | `#E8E4DC` | Texto secundario sobre oscuro |
| Tipografía display | **Montserrat 600** | Títulos en pantalla |
| Tipografía texto | **Inter 300–600** | Subtítulos y datos |
| Firma visual | regla azul de 3 px que **crece de izquierda a derecha** | Repetirla como transición/wipe |

> **Conclusión de arte:** la marca ya tiene un sistema “industrial premium” (hormigón +
> azul aluminio). El reel NO debe inventar otra estética: debe **amplificar** esta.
> El azul `#1B6CC8` es el héroe cromático y el único color saturado permitido.

### 1.2 Activos de motion que YA existen en el sitio (de `cinematic.js`)
Estos son oro puro para un reel “web como protagonista”, porque ya se ven caros:

1. **Hero con SplitType** → el título *“Aberturas de aluminio a medida”* entra
   **palabra por palabra** desde abajo (`yPercent:110`, `power4.out`). → Plano de apertura.
2. **Parallax del hero** → la foto de fondo se mueve a distinta velocidad al scrollear
   (`yPercent:28`, scrub). → Sensación de profundidad cinematográfica gratis.
3. **Smooth scroll Lenis** (`duration:1.2`, easing exponencial) → el scroll se ve
   sedoso en grabación; es la base de todo el reel.
4. **Scroll progress bar** azul arriba → detalle premium, dejála visible.
5. **Count-up** de las estadísticas (`500+`, `15+`, `4.5★`) → momento de prueba social
   con número animándose: úsalo como “beat” de impacto.
6. **Tabs del catálogo con stagger** (`power3.out`, stagger 0.04) → al cambiar de
   categoría las cards entran escalonadas. → Plano de “variedad de producto”.
7. **Botones magnéticos** (desktop) → micro-interacción de lujo para el plano del CTA.

### 1.3 Secciones reales y su valor para captar clientes de GBA/CABA
Ordenadas por **potencia visual + conversión** (lo que más vende a propietarios,
barrios privados, arquitectos y constructoras):

| # | Sección (id real) | Qué muestra | Por qué importa | Prioridad reel |
|---|---|---|---|---|
| 1 | `hero` | Título animado + foto de obra + stats | Primera impresión, marca | ⭐⭐⭐⭐⭐ |
| 2 | `#trabajos` (Trabajos recientes) | Galería filtrable de obras reales | **Prueba de calidad** = el mayor disparador de confianza | ⭐⭐⭐⭐⭐ |
| 3 | `#nosotros` (15+ años / fabricantes) | 4 diferenciales + “500+ obras” | Confianza y autoridad | ⭐⭐⭐⭐ |
| 4 | `#productos` (Catálogo de líneas) | Líneas, vidrios DVH, colores, policarbonato | Muestra **amplitud premium** (DVH, símil madera) | ⭐⭐⭐⭐ |
| 5 | Proceso “Así trabajamos” | 4 pasos | Reduce fricción de compra | ⭐⭐⭐ |
| 6 | `#reviews` (Reseñas) | 4.5★ Google | Prueba social | ⭐⭐⭐ |
| 7 | `#contacto` | Formulario + WhatsApp | CTA | ⭐⭐⭐⭐⭐ (cierre) |

### 1.4 Diferenciales de negocio a comunicar (copy real del sitio)
- **Fabricantes directos — sin intermediarios** (precio + control de calidad).
- **A medida** (cada abertura se fabrica para la obra).
- **Colocación en seco** (obra limpia, sin romper).
- **15+ años en el mercado · 40+ de oficio · 500+ obras · 4.5★ Google.**
- **Hacen envíos.**
- Líneas premium: **DVH (Doble Vidriado Hermético)**, símil madera, microtexturados.

---

## 2. Concepto creativo (Dirección Creativa)

**Idea fuerza:** *“No es solo una web nueva. Es la forma más rápida de ver de qué somos
capaces.”*

El reel trata al sitio como el **showroom digital** de Alumfer. En vez de mostrar fotos
sueltas, mostramos a alguien **recorriendo el sitio**, y el sitio responde con su propio
motion (parallax, reveals, count-up). El mensaje implícito: *una empresa que hace una web
así de cuidada, cuida igual cada abertura.*

**Título del concepto:** `ALUMFER ONLINE — Tu próxima obra empieza acá.`

---

## 3. Storyboard detallado (Motion Senior)

> Formato: **18 s @ 30 fps** (540 frames). Resolución 1080×1920.
> “MOV” = movimiento de cámara/keyframe. Tiempos en segundos.

| Esc | Tiempo | Visual (fuente) | Movimiento / Animación | Texto en pantalla | Transición de salida |
|---|---|---|---|---|---|
| **1 · Gancho** | 0.0–3.0 | Hero del sitio. Arranca en negro `#1A1C1E`; aparece el título con **SplitType palabra por palabra** ya existente | **Smooth zoom-in** lento del 100→106 %. La barra azul de scroll asoma arriba | Overlay propio: **“Estrenamos sitio”** (pequeño, arriba) + dejar leer el H1 real *“Aberturas de aluminio a medida”* | Cut on beat (drop musical) |
| **2 · Inmersión** | 3.0–6.0 | Scroll del hero → sección **Nosotros**. Se ve el **parallax** del fondo y entra “15+ años / Más de 40 de oficio” | **Scroll reveal** real (Lenis) + leve **parallax**. Speed-ramp: entra rápido, frena suave | **“15+ años fabricando a medida”** | Whip/blur corto |
| **3 · Prueba (stats)** | 6.0–8.0 | Bloque de stats con **count-up** `500+ · 15+ · 4.5★` | Congelar 1 frame cuando los números terminan de contar → **punch zoom** sutil | **“+500 obras realizadas”** | Wipe con la **regla azul** (crece izq→der) |
| **4 · Obras** | 8.0–11.0 | Sección **#trabajos**: galería de obras reales (ventanas, portones, quinchos, techos) | **Camera pan** vertical fluido por la grilla + micro **scroll reveal** de cada card | **“Mirá nuestros trabajos”** (aparece y se va) | Cut rápido al ritmo (2–3 cortes internos sobre obras) |
| **5 · Catálogo** | 11.0–13.5 | Sección **#productos**: clic en tabs → cards entran con **stagger**. Mostrar líneas + **DVH** + colores símil madera | Grabar el **cambio de tab** (Líneas → Vidrios → Colores). Aprovechar el stagger nativo | **“Todas las líneas del mercado”** · chip pequeño **“DVH · Símil madera”** | Dissolve suave |
| **6 · Diferenciales** | 13.5–16.0 | Volver al hero o usar fondo carbón. 3 keywords en motion typo | Texto que entra con **mask reveal** (estilo GSAP), una línea por beat | **“Fabricantes”** → **“Sin intermediarios”** → **“Colocación en seco”** | Cut a negro |
| **7 · CTA** | 16.0–18.0 | Tarjeta final carbón con **logo** (`solologo.png`) + acento azul | Logo entra con scale 0.9→1 + botón WhatsApp con micro-bounce (magnético) | **“Visitá alumfer.com.ar”** · **“WhatsApp 11 6336 8643”** · **@alumfercarpinteria** | Fin (loop-friendly: último frame ≈ primer frame en color) |

**Notas de ritmo:** cortes alineados al beat. Escenas 1–3 más contemplativas (respiran);
4–5 más dinámicas (varios cortes); 6–7 resolución. Total 7 escenas, ~18 s.

---

## 4. Guión / Copy en pantalla (Especialista en Reels + Conversión)

Texto **mínimo y jerárquico** (Montserrat 600 para títulos, Inter para apoyos). Nada de
párrafos: el ojo en mobile lee 3–5 palabras por plano.

```
0–3 s   ESTRENAMOS SITIO
        Aberturas de aluminio a medida        ← (es el H1 real del hero)

3–6 s   15+ años fabricando a medida

6–8 s   +500 OBRAS  ·  4.5★ Google

8–11 s  Mirá nuestros trabajos

11–13 s Todas las líneas del mercado
        DVH · Símil madera · Policarbonato

13–16 s FABRICANTES · SIN INTERMEDIARIOS · COLOCACIÓN EN SECO

16–18 s Visitá  →  alumfer.com.ar
        Presupuesto sin cargo · WhatsApp 11 6336 8643
        @alumfercarpinteria
```

**Caption de Instagram (sugerido):**
> 🚀 Estrenamos sitio web. Mirá +500 obras, todas las líneas de aberturas, vidrios DVH y
> nuestro proceso de fabricación a medida — fabricantes directos, sin intermediarios, en
> Zona Sur y CABA. 📲 Presupuesto sin cargo por WhatsApp (link en bio).
> `#aberturas #aluminio #carpinteriadealuminio #DVH #zonasur #adrogue #reformas #arquitectura #obra #cerramientos`

**Hashtags:** 8–12, mezclando volumen alto (#aluminio #reformas) con nicho local
(#adrogue #zonasur #gba). Geolocalizá el reel en **Adrogué**.

---

## 5. Lista de assets necesarios (Producción)

### 5.1 Grabaciones de pantalla (lo principal — “web como protagonista”)
Grabar el sitio real en **viewport mobile 1080×1920** (o desktop y recortar a 9:16).
Recomendado: Chrome en modo dispositivo (DevTools → 390×844 @3x) + grabación de pantalla.

| Clip | Qué grabar | Duración bruta | Notas |
|---|---|---|---|
| A | Carga del hero (entrada SplitType) | 4 s | Recargar para capturar la animación de entrada |
| B | Scroll lento hero → Nosotros (parallax) | 5 s | Scroll suave y constante |
| C | Stats con count-up | 3 s | Entrar a la sección para disparar el count-up |
| D | Scroll por galería **#trabajos** | 6 s | Movimiento parejo, dejar ver 4–6 obras |
| E | Catálogo: click tabs Líneas→Vidrios→Colores | 6 s | Capturar el stagger de cards |
| F | Hover botón WhatsApp / CTA contacto | 3 s | Para el cierre |

> Tip pro: subí el zoom del navegador a 110–125 % antes de grabar para que los textos del
> sitio se lean en mobile.

### 5.2 Assets de marca (ya en el repo)
- `solologo.png` (logo isotipo blanco, 368×259) → tarjeta CTA.
- Paleta `tokens.css` (valores arriba).
- Fotos de obra de respaldo por si falta footage: `obra-ventanas-*.jpg`,
  `obra-puertas-*.jpg`, `obra-portones-*.jpg`, `obra-quincho-*.jpeg`,
  `obra-techo*.jpeg`, `mosquitero1.jpeg`, `baranda*.jpeg`.

### 5.3 A crear en edición
- 7 títulos animados (Montserrat 600 / Inter).
- 1 wipe con la “regla azul” (3 px → barra).
- 1 tarjeta CTA final.
- 1 pista de música licenciable.

---

## 6. Audio (Especialista en Reels)

- **Estilo:** *cinematic house / minimal electrónico* — limpio, con graves controlados y
  un hi-hat sutil. Referencias de mood: bandas sonoras de estudios de arquitectura,
  “deep/organic house” instrumental. Evitar trap o EDM agresivo.
- **BPM:** 120–124 (≈ 0.5 s por beat) → facilita cortar “en tiempo”.
- **Estructura sugerida:**
  - 0–3 s: intro con un *swell*/riser que **revienta en el beat del segundo 3** (sync con
    el primer scroll y el cut de Escena 1→2).
  - 3–13 s: groove constante; cortes de obras (Escena 4) **cada 1 o 2 beats**.
  - 13–16 s: pequeño *build* bajo los 3 diferenciales (un beat por palabra).
  - 16–18 s: resolución / acorde sostenido bajo el CTA.
- **Puntos de sincronización (hit points):**
  - `3.0 s` → drop → cut Hero→Nosotros.
  - `8.0 s` → wipe azul → entra galería.
  - `13.5 s` → un “stab” por cada keyword (Fabricantes / Sin intermediarios / En seco).
  - `16.0 s` → impacto final → aparece logo.
- **Para Instagram:** lo ideal es montar con una pista licenciable de fondo, **pero al
  publicar elegí también un audio en tendencia de la biblioteca de IG** (mejora el
  alcance). Mezclá: música de fondo al ~60 % + audio trending al ~100 %.

---

## 7. CTA — cierre elegante (Conversión)

Objetivo del cierre: **una sola acción clara**. No saturar.

```
┌──────────────────────────────┐
│        [ LOGO ALUMFER ]       │   ← isotipo blanco, scale-in 0.9→1
│                               │
│      Visitá nuestro sitio      │   (Inter 400, hormigón claro)
│       alumfer.com.ar           │   (Montserrat 600, azul #4A9DE8)
│                               │
│   ▸ Presupuesto sin cargo      │
│   ▸ WhatsApp 11 6336 8643      │   ← botón con micro-bounce
│      @alumfercarpinteria       │
└──────────────────────────────┘
```
- **Jerarquía:** primero la URL (recordación), luego WhatsApp (acción inmediata).
- **Verbo de acción en presente:** “Visitá”, “Pedí tu presupuesto”.
- **Frame final loop-friendly:** que el último frame combine con el primero para que el
  reel se sienta continuo si IG lo repite.
- En el copy/bio dejá el **link directo de WhatsApp**:
  `https://wa.me/5491163368643?text=Hola%2C%20quiero%20pedir%20un%20presupuesto`.

---

## 8. Instrucciones por herramienta (Motion Senior)

### 8.1 CapCut (rápido, mobile/desktop) — flujo recomendado para publicar ya
1. **Proyecto:** Nuevo → relación **9:16**, 1080×1920, 30 fps.
2. Importá los clips A–F (grabaciones) + `solologo.png` + la música.
3. **Velocidad/“speed ramp”:** seleccioná clip B y D → *Velocidad → Curva → “Flash in”*
   (suaviza entradas). No exageres: máximo 1.5×–0.8×.
4. **Smooth zoom:** clip A → *Animación → no*; en su lugar keyframeá **Escala 100→106 %**
   en 3 s (mueve el rombo de escala con 2 keyframes). Esto evita el look “zoom brusco”.
5. **Cortes al beat:** activá *Beats* en la pista de música (icono de tambor → “Auto”) y
   alineá los cortes a las marcas.
6. **Textos:** Texto → fuente **Montserrat** (o similar bold) para títulos; animación de
   entrada *“Subir”/“Máscara”* (≈ scroll reveal). Color blanco; subrayados en `#1B6CC8`.
7. **Wipe azul:** poné un *Adjustment/forma rectángulo* azul fino y animá su **ancho**
   (de 0 a pantalla) en 0.3 s en el segundo 8.
8. **Transiciones:** usá solo *Disolver* y *Desplazamiento* suaves (≤ 0.3 s). Evitá glitch,
   zoom-blur fuerte o “3D”.
9. **CTA:** tarjeta final con fondo `#1A1C1E`, logo con animación *Escala* + texto.
10. **Exportar:** 1080×1920, 30 fps, bitrate alto. Subí **sin** la música si vas a poner
    audio trending; o con música al 60 %.

### 8.2 Adobe After Effects (máxima calidad de motion typo)
1. **Composición:** 1080×1920, 30 fps, 18 s, color de fondo `#1A1C1E`.
2. **Estructura:** una pre-comp por escena (`S1_Hero`…`S7_CTA`) anidadas en `MAIN`.
3. **Smooth zoom (Escena 1):** Transform → Scale 100→106 %, **Easy Ease** + *Graph Editor*
   con curva suave (salida lenta). Activá *Motion Blur*.
4. **Scroll reveal de textos:** texto → *Animate → Position* (y: 120→0) + *Opacity 0→100*,
   con **Range Selector** y *Advanced → Shape: Ramp Up* para stagger por palabra
   (replica el SplitType del sitio). Easing `power4.out` ≈ keyframe velocity 80–90 %.
5. **Wipe regla azul:** sólido `#1B6CC8`, máscara animada o *Scale X* con anchor a la
   izquierda (replica la firma `ruleGrow` del sitio).
6. **Parallax:** si recreás el hero, separá fondo y texto en capas y animá Position a
   distinta velocidad (fondo más lento).
7. **Count-up:** capa de texto + expresión:
   `Math.round(linear(time, inPoint, inPoint+1.2, 0, 500))` y un sufijo “+”.
8. **Sync al audio:** importá la música, `LL` para ver el waveform, marcadores (`*`) en
   los hit points (3.0 / 8.0 / 13.5 / 16.0 s) y pegá los cortes ahí.
9. **Motion Blur + Frame Blending** ON. Easing global con *Ease & Wizard* o KBar.
10. **Exportar:** Media Encoder → H.264, 1080×1920, ~12–16 Mbps, audio AAC 320k.

### 8.3 Adobe Premiere Pro (mejor para montar las grabaciones de pantalla)
1. **Secuencia:** 1080×1920, 30 fps (creá un preset vertical o arrastrá un clip y ajustá).
2. **Importá** A–F + música + `solologo.png`.
3. **Reencuadre auto:** Effects → *Auto Reframe* en clips grabados en horizontal → 9:16.
4. **Smooth zoom:** *Motion → Scale* con keyframes + **Temporal Interpolation: Ease
   In/Out** y curvas Bezier en el panel *Effect Controls*.
5. **Speed ramp:** botón derecho → *Time Remapping → Speed*, agregá keyframes y arrastrá
   para rampa suave (entrada 60 % → 100 %).
6. **Beats:** marcá la música con tecla `M` en cada golpe; alineá cortes a los marcadores.
7. **Títulos:** *Essential Graphics* → plantilla propia con Montserrat; animación
   *Position/Opacity* con keyframes (entrada desde abajo 12 px, 0.4 s, ease out).
8. **Wipe azul:** *Graphics → rectángulo* `#1B6CC8`, animar *Scale/Crop* horizontal 0.3 s.
9. **Transiciones:** *Film Dissolve* / *Cross Dissolve* (≤ 8 frames). Nada estridente.
10. **Lumetri:** un grado sutil y coherente — contraste suave, leve *teal/azul* en sombras
    para amarrar con `#1B6CC8`, blancos limpios. No saturar de más.
11. **Exportar:** H.264, *Match Source* → 1080×1920, VBR 2-pass ~12 Mbps, audio AAC.

---

## 9. Mejoras del sitio para potenciar el reel (UX/UI + Dirección de Arte)

Priorizadas por **impacto visual/comercial** (alto → bajo). Cada una mejora también el
sitio en sí, no solo el reel.

### 🔴 Prioridad ALTA
1. **Reemplazar la foto placeholder del hero.**
   Hoy el hero carga una imagen de **Unsplash** (`images.unsplash.com/...`), no una obra
   propia (ver `index.html`, `.hero__bg`). *Por qué:* es el primer plano del reel y de la
   web; debe ser **una obra real espectacular de Alumfer** (un frente de aluminio con DVH,
   buena luz). Sube la conversión y la autenticidad. **Impacto: máximo.**
2. **Video corto de obra en el hero (opcional pero potente).**
   Un loop de 4–6 s (taller fabricando o un ventanal terminado) detrás del título. Da
   material premium para la Escena 1 y moderniza la web. Mantener `prefers-reduced-motion`.

### 🟠 Prioridad MEDIA
3. **Asegurar 1–2 obras “portada” por categoría** en `#trabajos`, en alta resolución y
   orientación vertical/cuadrada (mejor recorte 9:16). Hoy hay mezcla de horizontales.
4. **Destacar visualmente “DVH” y “Símil madera”** en el catálogo (badge/etiqueta), porque
   son los diferenciales premium que más impresionan a arquitectos/constructoras.
5. **Micro-animación en el count-up** que “rebote” al terminar — refuerza el beat del reel
   y el wow en la web.

### 🟢 Prioridad BAJA (pulido)
6. **Sección “Antes / Después”** con un slider — contenido altísimo para reels futuros.
7. **Página/ancla de “Barrios privados y obra nueva”** orientada a constructoras (segmento
   de alto ticket en GBA).
8. **Botón “Compartir”/OG image dedicada** para que el reel y la web compartan estética.

---

## 10. Variantes y entregables sugeridos
- **Master 18 s** (este storyboard) → feed Reels.
- **Corte 12 s** (Escenas 1, 4, 7) → Stories / anuncios.
- **Versión sin texto quemado** → para correr como **ad** y testear copys.
- **9:16 + 1:1** → el 1:1 sirve para el feed clásico.

---

### Anexo · Datos de marca (para no buscarlos)
- **Sitio:** alumfer.com.ar
- **WhatsApp:** +54 9 11 6336 8643 → `https://wa.me/5491163368643`
- **Instagram:** @alumfercarpinteria
- **Ubicación:** Adrogué — Zona Sur GBA (alcance CABA/GBA)
- **Claims:** 15+ años · 40+ de oficio · 500+ obras · 4.5★ Google · Fabricantes directos
- **Colores:** `#1A1C1E` · `#2E3338` · `#1B6CC8` · `#4A9DE8` · `#E8E4DC`
- **Tipos:** Montserrat 600 (display) · Inter 300–600 (texto)
