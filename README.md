# Alumfer — Monorepo

Sistema completo de marca y presencia digital de **Alumfer**, fábrica de aberturas de aluminio a medida en Adrogué, Zona Sur GBA.

Este repositorio contiene tres productos conectados por un design system compartido:

| Producto        | Ruta                 | Qué es                                              |
|-----------------|----------------------|-----------------------------------------------------|
| **Website**     | `apps/website/`      | Sitio web de captación de consultas (alumfer.com.ar) |
| **Presupuestos**| `apps/presupuestos/` | App interna para presupuestar aberturas (no se publica) |
| **Creative OS** | `creative/`          | Sistema operativo de contenido y branding           |
| **Design System** | `shared/`          | Fuente de verdad visual compartida                  |

---

## Estructura del monorepo

```
Alumfer/
│
├── apps/
│   ├── website/          ← Sitio web (HTML + CSS + JS + PHP)
│   │   ├── index.html
│   │   ├── tokens.css     (copia sincronizada desde shared/)
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── cinematic.css
│   │   ├── main.js
│   │   ├── cinematic.js
│   │   ├── enviar.php
│   │   ├── docs/          (documentación técnica del sitio)
│   │   └── tools/         (scripts de generación de landings)
│   │
│   └── presupuestos/     ← App de presupuestos (uso interno, no se publica)
│       ├── index.html
│       ├── estilos.css    (pantalla)
│       ├── impresion.css  (hoja A4 del presupuesto)
│       ├── tokens.css     (copia sincronizada desde shared/)
│       └── js/            (cálculo, precios, almacenamiento, documento)
│
├── creative/             ← Creative OS (sistema de contenido)
│   ├── brand/            (ADN, voz, personalidad, visual, storytelling)
│   ├── agents/           (director creativo, copywriter, guardian, estratega)
│   ├── skills/           (instagram, video, copy)
│   ├── workflows/        (proceso de reel, proceso de campaña)
│   ├── templates/        (hooks, captions, briefs)
│   ├── knowledge/        (referencias de diseño y marca)
│   ├── analytics/        (evaluación de contenido)
│   └── content/          (ideas y drafts activos)
│
└── shared/               ← Design system compartido
    ├── design-system/
    │   ├── tokens.css         (fuente de verdad CSS)
    │   └── brand-tokens.md    (documentación de cada token)
    └── assets/               (logos, iconos, archivos de marca)
```

---

## Productos

### Website (`apps/website/`)

Sitio estático (sin framework, sin build step) que convierte visitas en consultas de presupuesto.

```bash
# Dev local sin PHP (todo menos el formulario)
cd apps/website && python3 -m http.server 8000

# Dev local con PHP (incluye enviar.php)
cd apps/website && php -S localhost:8000
```

Deploy automático: cada push a `main` que modifique `apps/website/**` activa el workflow de FTP a cPanel.

Ver `apps/website/docs/ARCHITECTURE.md` para la arquitectura del sitio.

### Presupuestos (`apps/presupuestos/`)

App interna: carga de aberturas por medida, precio por m² según línea y
tipología, PDF con membrete, envío por WhatsApp e historial. Los datos viven en
el navegador de la máquina donde se usa.

```bash
cd apps/presupuestos && python3 -m http.server 8080
```

Se usa desde el celular, instalada como app y funcionando sin señal:
<https://pabloxesteban.github.io/Alumfer/apps/presupuestos/> (GitHub Pages,
servido desde `main`). **No va por el FTP del sitio**: ese workflow solo sube
`apps/website/`.

Los precios reales se cargan desde la app y viven en el navegador de cada
teléfono, nunca en el repositorio.

Ver [`apps/presupuestos/README.md`](apps/presupuestos/README.md).

### Creative OS (`creative/`)

Sistema de documentos que funciona como director creativo IA de la marca.
No tiene runtime. Se consume como base de conocimiento.

Punto de entrada: [`creative/README.md`](creative/README.md)

### Design System (`shared/`)

Fuente de verdad visual. Todo cambio de color, tipo o espaciado parte de aquí.

Ver [`shared/design-system/README.md`](shared/design-system/README.md) para reglas de sincronización.

---

## Deploy

El workflow `.github/workflows/deploy.yml` solo despliega `apps/website/` a cPanel.
Los cambios en `apps/presupuestos/`, `creative/` o `shared/` **no disparan deploy**
(son herramientas y documentos internos).

Ver `apps/website/docs/` y el `DEPLOY.md` original para configuración de secrets.

---

## Contacto del negocio

- **WhatsApp / Tel:** (011) 6336-8643
- **Email:** alumfercarpinteria@gmail.com
- **Dirección:** Av. San Martín 734, Adrogué, Buenos Aires
- **Web:** <https://alumfer.com.ar>
