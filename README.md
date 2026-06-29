# Alumfer — Sitio web

Sitio web institucional y de captación de consultas de **Alumfer**, fábrica de
aberturas de aluminio a medida ubicada en Adrogué, Zona Sur del Gran Buenos
Aires, Argentina.

El objetivo del sitio es **generar consultas y pedidos de presupuesto** de
clientes potenciales (propietarios, arquitectos, constructoras y empresas) en
el área metropolitana de Buenos Aires.

---

## Stack

Sitio **estático** (sin framework ni build step) más un endpoint PHP para el
formulario de contacto. Se sirve desde hosting cPanel.

| Capa | Tecnología |
|------|------------|
| Markup | HTML5 semántico (`index.html`, `gracias.html`) |
| Estilos | CSS plano dividido en capas (`tokens` → `base` → `components` → `animations` → `cinematic`) |
| Interactividad | JavaScript vanilla (`main.js`) + motor de animación (`cinematic.js`) |
| Animación | GSAP + ScrollTrigger + Lenis + SplitType (vía CDN) |
| Formulario | `enviar.php` + `email-template.php` (función `mail()` de cPanel) |
| Analítica | Google Analytics 4 (gtag) |
| Deploy | GitHub Actions → FTP a cPanel (`.github/workflows/deploy.yml`) |

No hay `package.json`, `node_modules` ni dependencias instalables: todo lo que
se ve en el repositorio es lo que se publica.

---

## Estructura

```
.
├── index.html              # Landing principal (todo el contenido)
├── gracias.html            # Página de confirmación post-envío del formulario
├── tokens.css              # Variables de diseño (colores, tipografía, espaciado)
├── base.css                # Reset + estilos base de elementos
├── components.css          # Estilos de todos los componentes (archivo grande)
├── animations.css          # Reveals, contadores, barra de progreso, menú mobile
├── cinematic.css           # Ajustes CSS para el motor GSAP
├── main.js                 # Interacciones (navbar, galería, tabs, formulario, GA4)
├── cinematic.js            # Smooth scroll + animaciones de entrada (GSAP/Lenis)
├── enviar.php              # Endpoint del formulario (envía 2 emails)
├── email-template.php      # Helpers para construir los emails HTML de marca
├── preview-*.html          # Vistas previas de diseño (NO se publican)
├── robots.txt / sitemap.xml
├── .htaccess               # Cache control
├── *.png / *.jpg / *.jpeg  # Imágenes de obras, productos y fondos
└── docs/                   # Documentación técnica (ver más abajo)
```

Para entender cómo encajan las piezas, leé
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Desarrollo local

Al ser un sitio estático, alcanza con servir la carpeta. El formulario
(`enviar.php`) sólo funciona con PHP; para probarlo localmente necesitás PHP.

```bash
# Opción 1 — sin PHP (todo menos el envío real del formulario)
python3 -m http.server 8000

# Opción 2 — con PHP (incluye enviar.php)
php -S localhost:8000
```

Abrí <http://localhost:8000>.

---

## Deploy

El deploy es **automático**: cada push a `main` dispara el workflow de GitHub
Actions que sube los archivos por FTP a cPanel. Ver
[`DEPLOY.md`](DEPLOY.md) para la configuración de secrets.

> Los archivos `preview-*.html`, `README.md`, `DEPLOY.md`, `docs/` y `.github/`
> están excluidos de la publicación.

---

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitectura, flujo de datos y convenciones.
- [`docs/AUDIT.md`](docs/AUDIT.md) — auditoría técnica/comercial completa con puntajes y roadmap de mejoras.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — cómo hacer cambios de forma segura.
- [`DEPLOY.md`](DEPLOY.md) — despliegue a cPanel.

---

## Contacto del negocio

- **WhatsApp / Tel:** (011) 6336-8643
- **Email:** alumfercarpinteria@gmail.com
- **Dirección:** Av. San Martín 734, Adrogué, Buenos Aires
- **Web:** <https://alumfer.com.ar>
