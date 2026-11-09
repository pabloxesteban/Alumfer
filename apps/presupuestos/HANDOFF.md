# Handoff — App de presupuestos de Alumfer

Para retomar el trabajo sin tener que reconstruir el contexto: qué hay hecho, qué
se decidió y por qué, qué falta, y con qué trampas ya chocamos.

Estado al 9 de noviembre de 2026; todo lo descrito está publicado y andando.
**Si trabajás sobre la app, actualizá este archivo antes de cerrar.**

---

## 1. Qué es

App interna para presupuestar aberturas de aluminio, en `apps/presupuestos/` del
monorepo `pabloxesteban/Alumfer`. **La usa el papá de Pablo, desde el celular, en
obra.** No está familiarizado con la tecnología: esa es la restricción de diseño
que manda sobre todo lo demás.

**Link:** <https://pabloxesteban.github.io/Alumfer/apps/presupuestos/>
(GitHub Pages, sirve lo que haya en `main`. No usa el hosting del sitio.)

Se instala en la pantalla de inicio (PWA), funciona sin internet, y cada teléfono
guarda sus propios datos en `localStorage` — no hay servidor ni sincronización.

---

## 2. Estado del repositorio

- `main` = `77ac544` (7/11/2026). Incluye **todo** lo de presupuestos más trabajo
  del sitio hecho en otras sesiones (PRs #39 a #48).
- Rama designada: `claude/clever-pasteur-fzem7m`, hoy igual a `main`.
- Último commit de la app: `fa360d7`. Versión publicada: **2026-09-23.1**.

**Flujo de publicación (Pablo lo autorizó explícitamente, no hay que preguntar
cada vez):** commit en la rama → `git checkout main && git merge --ff-only <rama>`
→ `git push origin main`. Pages publica en ~1 minuto.

---

## 3. Archivos

```
apps/presupuestos/
├── index.html            Las tres vistas: Presupuesto, Anteriores, Precios
├── estilos.css           Pantalla (todo grande; fichas apiladas en celular)
├── impresion.css         Hoja A4 del presupuesto impreso
├── tokens.css            Copia de shared/design-system/tokens.css
├── sw.js                 Offline + aviso de versión nueva  ← subir VERSION
├── manifest.webmanifest  Instalación como app
├── logo-alumfer.jpg      Membrete (NO usar solologo.png: es blanco sobre transparente)
├── icono-*.png
└── js/
    ├── formato.js        Moneda, fechas, teléfonos, parseo de números es-AR
    ├── iconos.js         24 pictogramas de aberturas + íconos de interfaz
    ├── dolar.js          Blue: dolarapi.com, con bluelytics de respaldo
    ├── precios-base.js   Lista de fábrica (semilla) + datos de la empresa
    ├── calculo.js        Motor de cálculo puro, sin DOM (se puede probar en Node)
    ├── almacenamiento.js localStorage, numeración anual, export/import
    ├── documento.js      Hoja imprimible y texto de WhatsApp
    └── app.js            Interfaz
```

Documentación completa en `apps/presupuestos/README.md`.

---

## 4. Decisiones tomadas (no deshacer sin preguntar)

1. **Sin framework ni build step**, igual que el sitio. Scripts clásicos, sin
   módulos ES, para que también funcione abriendo el archivo con doble clic.
2. **Interfaz en tres pasos** (para quién es → qué lleva → cómo se entrega), una
   sola columna, texto y botones grandes.
3. **El tipo de abertura se elige por dibujo**, no por lista desplegable.
4. **Medidas en centímetros** en pantalla; se guardan en milímetros y se imprimen
   en metros (1,50 × 1,10 m).
5. **Cálculo:** `($/m² tipología × factor línea × (1 + recargo color) + $/m²
   vidrio) × m² facturables + adicionales`, con mínimo facturable por tipología y
   redondeo configurable del ítem.
6. **Cada presupuesto guarda una copia de la lista de precios** con la que se
   calculó: reabrir uno viejo muestra lo que se le pasó al cliente. El selector de
   tipos, en cambio, ofrece el catálogo de hoy, y si se elige una tipología que la
   copia no tiene, se copia con su precio actual.
7. **Todo se guarda solo**, sin botón de guardar, con un cartel verde "Guardado ✓".
8. **Dólar blue** (no oficial) en Precios; el total muestra el equivalente en USD
   **solo en pantalla**: no sale en el PDF ni en el WhatsApp del cliente.
9. **El kilo de aluminio se carga a mano**: no hay API gratis y con CORS que lo
   dé, y el precio local del extruido lo pasa el proveedor.
10. **Las actualizaciones se avisan**: el service worker no hace `skipWaiting`;
    aparece una franja azul "Hay una versión nueva" y recién al tocarla se recarga.

---

## 5. Reglas duras

- **Subir `VERSION` en `sw.js` en cada cambio de la app.** Si no, los celulares
  instalados no se enteran. Lo controla
  `.github/workflows/presupuestos-version.yml`, que falla si se cambió algún
  archivo sin tocar `VERSION`.
- **Los precios de `precios-base.js` son de referencia, inventados.** Los reales
  se cargan desde la app y viven en el navegador. **Nunca commitear precios
  reales**: el repositorio es público.
- Responder siempre en castellano rioplatense.

---

## 6. Pendientes

1. **Cargar los precios reales.** Es lo único que falta para que la app sirva de
   verdad. Hasta que Pablo entre a Precios y ponga los suyos, los totales no
   significan nada.
2. Simplificar la pestaña Precios si el papá también la va a tocar (hoy son
   tablas; en celular se ven como fichas, pero siguen siendo tablas).
3. Recalcular los $/m² a partir del kilo de aluminio + los kilos por m² de cada
   tipología, en vez de aplicar un porcentaje a ojo. Necesita que el papá pase los
   kilos por metro de cada línea.
4. Cotizador público simplificado en el sitio, con el mismo motor de cálculo.
5. Sincronizar presupuestos entre dispositivos (hoy cada teléfono es
   independiente; requiere backend).
6. Sacar la línea del total en dólares, si molesta.
7. Clave de acceso: el repositorio es público y el link lo abre cualquiera que lo
   tenga. Los precios reales no están en el código, pero si hiciera falta
   esconderla, la opción gratis es Cloudflare Pages con Access.

---

## 7. Cómo probar

No hay suite automatizada. Se probó con Playwright ad hoc; esos scripts vivían en
el scratchpad de la sesión anterior y se perdieron.

```bash
cd apps/presupuestos && python3 -m http.server 8777
# Playwright: /opt/node22/lib/node_modules/playwright
#   import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
```

- El proxy del entorno rompe el TLS del navegador de prueba contra HTTPS externo.
  Para probar **lo que está publicado**, bajar los archivos con `curl` a una
  carpeta y servirlos localmente.
- Mockear el dólar con `ctx.route(/dolarapi|bluelytics/, ...)`.
- `calculo.js` se puede probar desde Node cargando, en orden: `formato` →
  `precios-base` → `calculo`, con un `global.window = {}`.

---

## 8. Trampas ya encontradas (no repetirlas)

- `[hidden]` pierde contra `display: grid` → hay una regla
  `[hidden] { display: none !important; }`.
- Un `td` con `colspan` **no** puede ser `display: flex`: deja de ocupar la fila.
  El flex va en un `div` adentro.
- `solologo.png` es el logo blanco sobre transparente: invisible sobre papel.
- `window.print()` en Chromium headless bloquea el render: para capturar la hoja,
  inyectar el HTML y usar `emulateMedia({ media: 'print' })`.
- El deploy FTP del sitio (`deploy.yml`) corre en **cada** push a `main`, aunque
  solo cambie la app. Estuvo fallando con `530 Login authentication failed`
  porque el hosting estaba suspendido; hoy alumfer.com.ar responde 200, así que
  parece resuelto.
