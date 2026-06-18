// ============================================================
// ALUMFER — Captura cinematográfica del sitio (opción A)
// Vendoriza GSAP/Lenis/SplitType + fuentes desde npm e inyecta
// todo localmente (los CDN están bloqueados por red). Reemplaza
// el hero placeholder por una obra real y graba el sitio en
// movimiento (parallax, reveals, count-up, tabs) en 1080x1920.
// ============================================================
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = '/home/user/Alumfer';
const CAP  = path.join(ROOT, 'reel', 'capture');
const NM   = path.join(CAP, 'node_modules');
const OUT  = path.join(CAP, 'clips');
fs.mkdirSync(OUT, { recursive: true });

const W = 1080, H = 1920;
const HERO_IMG = path.join(ROOT, 'obra-quincho-1.jpeg'); // obra real para el hero

// ── Construir CSS de fuentes locales (Montserrat 600 + Inter 300-600) ──
function fontFace(family, weight, file) {
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
         `font-display:swap;src:url('file://${file}') format('woff2');}`;
}
function buildFontCss() {
  const faces = [];
  const mont = path.join(NM, '@fontsource/montserrat/files/montserrat-latin-600-normal.woff2');
  if (fs.existsSync(mont)) faces.push(fontFace('Montserrat', 600, mont));
  for (const w of [300, 400, 500, 600]) {
    const f = path.join(NM, `@fontsource/inter/files/inter-latin-${w}-normal.woff2`);
    if (fs.existsSync(f)) faces.push(fontFace('Inter', w, f));
  }
  return faces.join('\n');
}
const FONT_CSS = buildFontCss();

// ── Mapa de archivos locales para interceptar los CDN ──
const local = (p) => path.join(NM, p);
const routes = [
  { match: 'ScrollTrigger.min.js', file: local('gsap/dist/ScrollTrigger.min.js'), type: 'application/javascript' },
  { match: 'gsap.min.js',          file: local('gsap/dist/gsap.min.js'),          type: 'application/javascript' },
  { match: 'split-type',           file: local('split-type/umd/index.min.js'),    type: 'application/javascript' },
  { match: 'lenis',                file: local('lenis/dist/lenis.min.js'),        type: 'application/javascript' },
];

async function setupRouting(context) {
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    // Bloquear analytics
    if (url.includes('googletagmanager') || url.includes('google-analytics')) {
      return route.abort();
    }
    // Librerías JS
    for (const r of routes) {
      if (url.includes(r.match)) {
        try {
          return route.fulfill({ status: 200, contentType: r.type, body: fs.readFileSync(r.file) });
        } catch { return route.continue(); }
      }
    }
    // Fuentes Google → CSS con @font-face local
    if (url.includes('fonts.googleapis.com')) {
      return route.fulfill({ status: 200, contentType: 'text/css', body: FONT_CSS });
    }
    // Foto del hero (Unsplash) → obra real local
    if (url.includes('images.unsplash.com')) {
      return route.fulfill({ status: 200, contentType: 'image/jpeg', body: fs.readFileSync(HERO_IMG) });
    }
    return route.continue();
  });
}

// ── Esperar a que el motor cinemático esté listo ──
async function waitReady(page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(
    () => window.gsap && window.ScrollTrigger && document.documentElement.classList.contains('cinematic'),
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(300);
}

// Scroll suave usando Lenis (idéntico al sitio real)
async function lenisTo(page, target, duration = 1.8) {
  await page.evaluate(([t, d]) => {
    const lenis = window.__lenis;
    let y = t;
    if (typeof t === 'string') {
      const el = document.querySelector(t);
      y = el ? el.getBoundingClientRect().top + window.scrollY - 60 : window.scrollY;
    }
    if (lenis) lenis.scrollTo(y, { duration: d });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }, [target, duration]);
  await page.waitForTimeout(duration * 1000 + 250);
}

// ── Definición de clips: cada uno se graba en su propio contexto ──
const clips = [
  {
    name: 'A_hero',
    actions: async (page) => {
      // El hero entra solo (SplitType palabra por palabra) + count-up de stats
      await page.waitForTimeout(4200);
    },
  },
  {
    name: 'B_nosotros',
    actions: async (page) => {
      await page.waitForTimeout(700);
      await lenisTo(page, '#nosotros', 2.2);   // parallax + reveal de diferenciales
      await page.waitForTimeout(900);
    },
  },
  {
    name: 'C_trabajos',
    actions: async (page) => {
      await page.waitForTimeout(500);
      await lenisTo(page, '#trabajos', 1.6);
      await page.waitForTimeout(700);
      // recorrido lento por la galería
      await lenisTo(page, '#trabajos', 0.1);
      await page.evaluate(() => {
        const el = document.querySelector('#trabajos');
        const y = el.getBoundingClientRect().top + window.scrollY + 700;
        window.__lenis ? window.__lenis.scrollTo(y, { duration: 2.6 }) : window.scrollTo({ top: y, behavior: 'smooth' });
      });
      await page.waitForTimeout(3000);
    },
  },
  {
    name: 'D_productos',
    actions: async (page) => {
      await page.waitForTimeout(400);
      await lenisTo(page, '#productos', 1.8);
      await page.waitForTimeout(900);
      for (const tab of ['vidrios', 'terminaciones', 'extras']) {
        await page.click(`.catalog-tab[data-tab="${tab}"]`).catch(() => {});
        await page.waitForTimeout(1300);  // capturar el stagger de las cards
      }
    },
  },
  {
    name: 'E_contacto',
    actions: async (page) => {
      await page.waitForTimeout(400);
      await lenisTo(page, '#contacto', 2.0);
      await page.waitForTimeout(800);
      await page.hover('.btn--whatsapp, a[href*="wa.me"]').catch(() => {});
      await page.waitForTimeout(900);
    },
  },
];

async function recordClip(browser, clip) {
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await setupRouting(context);
  const page = await context.newPage();
  await page.goto('file://' + ROOT + '/index.html', { waitUntil: 'load', timeout: 30000 });
  await waitReady(page);
  const lead = Date.now();
  await clip.actions(page);
  const leadMs = lead - (page.__t0 || lead); // informativo
  const video = page.video();
  await context.close(); // finaliza el video
  const raw = await video.path();
  const dst = path.join(OUT, clip.name + '.webm');
  fs.renameSync(raw, dst);
  console.log(`✓ ${clip.name}  → ${path.basename(dst)}`);
  return dst;
}

const browser = await chromium.launch();
console.log('Fuentes locales:', FONT_CSS ? 'OK' : 'FALTAN');
for (const clip of clips) {
  await recordClip(browser, clip).catch(e => console.log('✗', clip.name, e.message));
}
await browser.close();
console.log('\nListo. Clips en', OUT);
