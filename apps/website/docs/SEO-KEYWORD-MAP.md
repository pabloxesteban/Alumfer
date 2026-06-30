# Mapa Keyword → Página (Fase 3 ejecutable)

> Traduce las **TOP 100 keywords** de `GROWTH-STRATEGY.md` en un plan de
> arquitectura de contenidos: a qué URL pertenece cada keyword, cuál es la
> **keyword primaria** de cada página y qué keywords la acompañan (secundarias).
> Evita canibalización (una intención = una página) y define el on-page target.
>
> **Estado:** `HOME` = lo captura la home hoy · `NUEVA` = requiere landing (Fase 4)
> · `BLOG` = artículo (Fase 6). Volúmenes/dificultad son estimaciones a validar.

---

## 1. Principio de arquitectura

```
/  (HOME = hub de marca + términos cabeza/locales genéricos)
├── Servicios (BOFU, 1 página por intención de producto)
│   ├── /ventanas-de-aluminio
│   ├── /ventanas-dvh
│   ├── /puertas-de-aluminio
│   ├── /mosquiteros-a-medida
│   ├── /cerramientos-de-aluminio
│   ├── /cerramiento-de-quincho
│   ├── /techos-de-policarbonato
│   ├── /portones-de-aluminio
│   ├── /postigones-y-celosias
│   ├── /frentes-y-fachadas-de-aluminio
│   └── /rejas-y-cortinas-de-pvc
├── Localidades (SEO local, 1 por zona, contenido único)
│   └── /aberturas-de-aluminio-{localidad}
├── Segmento B2B
│   ├── /para-arquitectos
│   └── /para-constructoras
├── Conversión
│   ├── /presupuesto
│   └── /antes-y-despues
└── Blog (TOFU/MOFU → enlaza a Servicios/Localidades)
    └── /blog/{slug}
```

**Regla anti-canibalización:** la home **no** debe optimizarse para "ventanas de
aluminio a medida" (esa es la primaria de `/ventanas-de-aluminio`). La home
apunta a los términos **paraguas + marca + local genérico**.

---

## 2. Definición de cada página (primaria / secundarias / on-page)

### `/` — HOME (hub) · **estado: optimizada en este commit**
- **Primaria:** `aberturas de aluminio buenos aires` / `carpintería de aluminio zona sur`
- **Secundarias:** fábrica de aberturas de aluminio · aberturas de aluminio adrogué ·
  fabricante de aberturas a medida · empresa de aberturas de aluminio · alumfer (+ marca)
- **On-page aplicado:** `<title>` con keyword-first + "Zona Sur GBA" · JSON-LD
  `LocalBusiness`+`HomeAndConstructionBusiness` con `OfferCatalog` (8 servicios) ·
  `alt` de galería enriquecidos con producto+marca+zona.
- **Pendiente (Fase 4/6):** enlazar desde la home a cada página de servicio con
  anchor text de keyword exacta (hoy el nav es "Productos/Trabajos", genérico).

### `/ventanas-de-aluminio` — NUEVA · P1
- **Primaria:** `ventanas de aluminio a medida`
- **Secundarias:** ventana corrediza de aluminio · ventana con mosquitero ·
  ventanas de aluminio precio · reemplazar ventanas viejas
- **Title:** "Ventanas de Aluminio a Medida en Zona Sur GBA — Precio y Líneas | Alumfer"
- **H1:** "Ventanas de aluminio a medida" · bloques: tipos, líneas, vidrios, precio "desde", FAQ, CTA.

### `/ventanas-dvh` — NUEVA · P1
- **Primaria:** `ventanas dvh` / `dvh doble vidriado hermético precio`
- **Secundarias:** qué es el dvh · ventana con aislación acústica · ventana que aísla el frío · mejores ventanas para el frío
- **Title:** "Ventanas con DVH (Doble Vidriado Hermético) | Aislación Térmica y Acústica — Alumfer"

### `/puertas-de-aluminio` — NUEVA · P1
- **Primaria:** `puertas de aluminio a medida`
- **Secundarias:** puerta balcón de aluminio · puerta de aluminio con reja

### `/mosquiteros-a-medida` — NUEVA · P1
- **Primaria:** `mosquiteros a medida zona sur`
- **Secundarias:** colocación de mosquiteros · ventana con mosquitero · mosquitero corredizo vs enrollable

### `/cerramientos-de-aluminio` — NUEVA · P1
- **Primaria:** `cerramientos de aluminio buenos aires`
- **Secundarias:** cerramiento de balcón aluminio · cerramiento de policarbonato

### `/cerramiento-de-quincho` — NUEVA · P2
- **Primaria:** `cerramiento de quincho`
- **Secundarias:** pérgola de aluminio · techo para galería · techo para patio

### `/techos-de-policarbonato` — NUEVA · P1
- **Primaria:** `techo de policarbonato precio`
- **Secundarias:** policarbonato alveolar · techo corredizo de policarbonato · claraboya de policarbonato · cerramiento de policarbonato

### `/portones-de-aluminio` — NUEVA · P2
- **Primaria:** `portones de aluminio a medida`

### `/postigones-y-celosias` — NUEVA · P2
- **Primaria:** `postigones de aluminio` · **Secundaria:** celosías de aluminio

### `/frentes-y-fachadas-de-aluminio` — NUEVA · P2
- **Primaria:** `frente de aluminio para local` · **Secundaria:** frentes de local comercial · mampara de aluminio y vidrio

### `/rejas-y-cortinas-de-pvc` — NUEVA · P3
- **Primaria:** `reja para ventana a medida` · **Secundaria:** cortina de pvc · ventana corrediza con cortina de pvc

### `/aberturas-de-aluminio-{localidad}` — NUEVA (xN) · P1–P3
- **Primaria:** `aberturas de aluminio {localidad}` · **Secundarias:** ventanas de aluminio {localidad} · carpintería de aluminio {localidad}
- **Contenido único obligatorio:** barrios, obra real de la zona, reseña local, distancia desde Adrogué.

### `/para-arquitectos` — NUEVA (B2B) · P1
- **Primaria:** `aberturas de aluminio para arquitectos`
- **Secundarias:** línea herrero / módena / perfil a30 · colores anodizado vs pintado · descargables

### `/para-constructoras` — NUEVA (B2B) · P2
- **Primaria:** `aberturas de aluminio para constructora` · **Secundaria:** aberturas de aluminio mayorista

### `/presupuesto` — NUEVA (conversión) · P1
- **Primaria:** `presupuesto ventanas de aluminio` · **Secundaria:** cuánto cuesta cambiar las ventanas de una casa

---

## 3. Mapeo de las 100 keywords → página destino

| # | Keyword | Página destino | Rol | Estado |
|---|---------|----------------|:---:|:------:|
| 1 | aberturas de aluminio buenos aires | `/` | Primaria | HOME |
| 2 | ventanas de aluminio a medida | `/ventanas-de-aluminio` | Primaria | NUEVA |
| 3 | carpintería de aluminio zona sur | `/` | Primaria | HOME |
| 4 | fábrica de aberturas de aluminio | `/` | Secundaria | HOME |
| 5 | ventanas de aluminio precio | `/ventanas-de-aluminio` | Secundaria | NUEVA |
| 6 | puertas de aluminio a medida | `/puertas-de-aluminio` | Primaria | NUEVA |
| 7 | cerramientos de aluminio buenos aires | `/cerramientos-de-aluminio` | Primaria | NUEVA |
| 8 | aberturas de aluminio adrogué | `/` | Secundaria | HOME |
| 9 | ventanas dvh buenos aires | `/ventanas-dvh` | Primaria | NUEVA |
| 10 | mosquiteros a medida zona sur | `/mosquiteros-a-medida` | Primaria | NUEVA |
| 11 | ventanas de aluminio adrogué | `/aberturas-...-adrogue` | Secundaria | NUEVA |
| 12 | aberturas de aluminio lomas de zamora | `/aberturas-...-lomas-de-zamora` | Primaria | NUEVA |
| 13 | ventanas de aluminio quilmes | `/aberturas-...-quilmes` | Primaria | NUEVA |
| 14 | aberturas de aluminio lanús | `/aberturas-...-lanus` | Primaria | NUEVA |
| 15 | carpintería de aluminio banfield | `/aberturas-...-banfield` | Primaria | NUEVA |
| 16 | ventanas de aluminio temperley | `/aberturas-...-temperley` | Primaria | NUEVA |
| 17 | aberturas de aluminio almirante brown | `/aberturas-...-almirante-brown` | Primaria | NUEVA |
| 18 | ventanas de aluminio berazategui | `/aberturas-...-berazategui` | Primaria | NUEVA |
| 19 | aberturas de aluminio ezeiza | `/aberturas-...-ezeiza` | Primaria | NUEVA |
| 20 | carpintería de aluminio monte grande | `/aberturas-...-monte-grande` | Primaria | NUEVA |
| 21 | ventanas de aluminio burzaco | `/aberturas-...-burzaco` | Primaria | NUEVA |
| 22 | aberturas de aluminio glew | `/aberturas-...-glew` | Primaria | NUEVA |
| 23 | ventanas de aluminio canning | `/aberturas-...-canning` | Primaria | NUEVA |
| 24 | aberturas de aluminio bernal | `/aberturas-...-bernal` | Primaria | NUEVA |
| 25 | carpintería de aluminio wilde | `/aberturas-...-wilde` | Primaria | NUEVA |
| 26 | ventanas de aluminio rafael calzada | `/aberturas-...-rafael-calzada` | Primaria | NUEVA |
| 27 | aberturas de aluminio claypole | `/aberturas-...-claypole` | Primaria | NUEVA |
| 28 | ventanas de aluminio longchamps | `/aberturas-...-longchamps` | Primaria | NUEVA |
| 29 | carpintería de aluminio turdera | `/aberturas-...-turdera` | Primaria | NUEVA |
| 30 | aberturas de aluminio san vicente | `/aberturas-...-san-vicente` | Primaria | NUEVA |
| 31 | ventana corrediza de aluminio | `/ventanas-de-aluminio` | Secundaria | NUEVA |
| 32 | ventana de aluminio con mosquitero | `/ventanas-de-aluminio` | Secundaria | NUEVA |
| 33 | puerta balcón de aluminio | `/puertas-de-aluminio` | Secundaria | NUEVA |
| 34 | puerta de aluminio con reja | `/puertas-de-aluminio` | Secundaria | NUEVA |
| 35 | ventana banderola aluminio | `/ventanas-de-aluminio` | Secundaria | NUEVA |
| 36 | postigones de aluminio | `/postigones-y-celosias` | Primaria | NUEVA |
| 37 | celosías de aluminio | `/postigones-y-celosias` | Secundaria | NUEVA |
| 38 | portones de aluminio a medida | `/portones-de-aluminio` | Primaria | NUEVA |
| 39 | frente de aluminio para local | `/frentes-y-fachadas-de-aluminio` | Primaria | NUEVA |
| 40 | mampara de aluminio y vidrio | `/frentes-y-fachadas-de-aluminio` | Secundaria | NUEVA |
| 41 | ventana de pvc vs aluminio | `/blog/aluminio-vs-pvc-vs-madera` | Primaria | BLOG |
| 42 | ventana corrediza con cortina de pvc | `/rejas-y-cortinas-de-pvc` | Secundaria | NUEVA |
| 43 | reja para ventana a medida | `/rejas-y-cortinas-de-pvc` | Primaria | NUEVA |
| 44 | cerramiento de balcón aluminio | `/cerramientos-de-aluminio` | Secundaria | NUEVA |
| 45 | cerramiento de quincho | `/cerramiento-de-quincho` | Primaria | NUEVA |
| 46 | dvh doble vidriado hermético precio | `/ventanas-dvh` | Primaria | NUEVA |
| 47 | qué es el dvh | `/ventanas-dvh` (+`/blog`) | Secundaria | NUEVA |
| 48 | vidrio esmerilado para baño | `/blog/tipos-de-vidrio` | Secundaria | BLOG |
| 49 | vidrio espejado para ventana | `/blog/tipos-de-vidrio` | Secundaria | BLOG |
| 50 | ventana con aislación acústica | `/ventanas-dvh` | Secundaria | NUEVA |
| 51 | ventana que aísla el frío | `/ventanas-dvh` | Secundaria | NUEVA |
| 52 | vidrio laminado de seguridad | `/blog/tipos-de-vidrio` | Secundaria | BLOG |
| 53 | línea herrero aluminio | `/para-arquitectos` (+`/blog`) | Secundaria | NUEVA |
| 54 | línea módena aluminio | `/para-arquitectos` (+`/blog`) | Secundaria | NUEVA |
| 55 | perfil a30 aluminio | `/para-arquitectos` (+`/blog`) | Secundaria | NUEVA |
| 56 | techo de policarbonato precio | `/techos-de-policarbonato` | Primaria | NUEVA |
| 57 | policarbonato alveolar | `/techos-de-policarbonato` | Secundaria | NUEVA |
| 58 | techo corredizo de policarbonato | `/techos-de-policarbonato` | Secundaria | NUEVA |
| 59 | pérgola de aluminio | `/cerramiento-de-quincho` | Secundaria | NUEVA |
| 60 | techo para galería | `/cerramiento-de-quincho` | Secundaria | NUEVA |
| 61 | cerramiento de policarbonato | `/techos-de-policarbonato` | Secundaria | NUEVA |
| 62 | poliestireno fantasía | `/techos-de-policarbonato` | Secundaria | NUEVA |
| 63 | techo para patio | `/cerramiento-de-quincho` | Secundaria | NUEVA |
| 64 | media sombra vs policarbonato | `/blog/media-sombra-vs-policarbonato` | Primaria | BLOG |
| 65 | claraboya de policarbonato | `/techos-de-policarbonato` | Secundaria | NUEVA |
| 66 | cambiar ventanas sin romper pared | `/blog/cambiar-ventanas-sin-romper-paredes` | Primaria | BLOG |
| 67 | colocación de aberturas en seco | `/blog/colocacion-en-seco` (+ home) | Primaria | BLOG |
| 68 | presupuesto ventanas de aluminio | `/presupuesto` | Primaria | NUEVA |
| 69 | reparación de aberturas de aluminio | `/ventanas-de-aluminio` (FAQ) | Secundaria | NUEVA |
| 70 | colocación de mosquiteros | `/mosquiteros-a-medida` | Secundaria | NUEVA |
| 71 | fabricante de aberturas a medida | `/` | Secundaria | HOME |
| 72 | empresa de aberturas de aluminio | `/` | Secundaria | HOME |
| 73 | aberturas de aluminio mayorista | `/para-constructoras` | Secundaria | NUEVA |
| 74 | aberturas de aluminio para constructora | `/para-constructoras` | Primaria | NUEVA |
| 75 | aberturas de aluminio para arquitectos | `/para-arquitectos` | Primaria | NUEVA |
| 76 | cuánto cuesta cambiar las ventanas de una casa | `/blog/cuanto-cuesta-cambiar-ventanas-2026` | Primaria | BLOG |
| 77 | cómo elegir ventanas de aluminio | `/blog/como-elegir-ventanas-de-aluminio` | Primaria | BLOG |
| 78 | ventajas del aluminio vs pvc vs madera | `/blog/aluminio-vs-pvc-vs-madera` | Secundaria | BLOG |
| 79 | cómo medir una ventana para presupuesto | `/blog/como-medir-una-ventana` | Primaria | BLOG |
| 80 | colores de aberturas de aluminio | `/blog/colores-de-aberturas` | Primaria | BLOG |
| 81 | aluminio anodizado vs pintado | `/blog/anodizado-vs-pintado` | Primaria | BLOG |
| 82 | cómo aislar el ruido de la calle | `/blog/aislar-ruido-ventana` | Primaria | BLOG |
| 83 | mejores ventanas para el frío | `/ventanas-dvh` (+`/blog`) | Secundaria | NUEVA |
| 84 | mantenimiento de aberturas de aluminio | `/blog/mantenimiento-aberturas` | Primaria | BLOG |
| 85 | cuánto tarda la fabricación de aberturas | `/blog/tiempos-de-fabricacion` (FAQ) | Primaria | BLOG |
| 86 | qué línea de aluminio elegir | `/blog/como-elegir-linea-aluminio` | Primaria | BLOG |
| 87 | ventana corrediza vs ventana de abrir | `/blog/corrediza-vs-de-abrir` | Primaria | BLOG |
| 88 | reemplazar ventanas viejas por nuevas | `/ventanas-de-aluminio` | Secundaria | NUEVA |
| 89 | aberturas para casa de campo | `/blog/aberturas-casa-de-campo` | Primaria | BLOG |
| 90 | aberturas para departamento en avenida | `/ventanas-dvh` | Secundaria | NUEVA |
| 91 | alumfer | `/` | Marca | HOME |
| 92 | alumfer adrogué | `/` | Marca | HOME |
| 93 | alumfer opiniones / reseñas | `/` (+ GBP) | Marca | HOME |
| 94 | carpintería de aluminio adrogué | `/` | Secundaria | HOME |
| 95 | aberturas de aluminio opiniones | `/` (+ GBP) | Secundaria | HOME |
| 96 | mejores aberturas de aluminio zona sur | `/` (+`/blog`) | Secundaria | HOME |
| 97 | aberturas de aluminio recomendadas gba | `/` (+`/blog`) | Secundaria | HOME |
| 98 | fábrica de aberturas zona sur | `/` | Secundaria | HOME |
| 99 | aberturas de aluminio cerca mío | `/` + páginas locales | Secundaria | HOME |
| 100 | carpintería de aluminio precios 2026 | `/blog/cuanto-cuesta-cambiar-ventanas-2026` | Secundaria | BLOG |

### Resumen de cobertura
- **HOME (hoy):** 16 keywords (cabeza paraguas + marca + local genérico).
- **Páginas de servicio (NUEVA):** ~45 keywords.
- **Páginas locales (NUEVA):** 20 keywords.
- **B2B (NUEVA):** 5 keywords.
- **Blog (BLOG):** ~18 keywords.

---

## 4. On-page aplicado a la HOME en este commit

| Cambio | Antes | Ahora | Beneficio |
|--------|-------|-------|-----------|
| `<title>` | "Alumfer — Aberturas de Aluminio a Medida \| Buenos Aires" | "Aberturas de Aluminio a Medida en Zona Sur GBA \| Alumfer" | Keyword-first + modificador local fuerte |
| JSON-LD tipo | `LocalBusiness` | `["LocalBusiness","HomeAndConstructionBusiness"]` + `@id` + `slogan` + `knowsLanguage` | Tipo más específico, entidad enlazable |
| JSON-LD servicios | — | `hasOfferCatalog` con 8 servicios | Relevancia para keywords de servicio sin página nueva |
| `alt` de galería | genéricos repetidos ("Ventanas de aluminio") | descriptivos con producto + marca + zona | Image SEO + accesibilidad |

> No se modificaron CSS/JS, por lo que **no hace falta** subir el `?v=` (el HTML
> se revalida siempre vía `.htaccess`). JSON-LD validado con parser.

---

## 5. Siguiente paso natural

Con el mapa cerrado, la **Fase 4** (crear las landings) ya tiene definidos URL,
keyword primaria, secundarias y title de cada página. Recomendado arrancar por
las 5 de mayor retorno: `/ventanas-de-aluminio`, `/techos-de-policarbonato`,
`/ventanas-dvh`, `/cerramientos-de-aluminio`, `/mosquiteros-a-medida`, más las 4
localidades P1 (Adrogué, Lomas, Quilmes, Lanús).
