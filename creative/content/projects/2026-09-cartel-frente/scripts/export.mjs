// Exporta el cartel: PNG 5400x1200 (3x) y PDF vectorial.
// Uso:  node scripts/export.mjs
// Requiere:  npm i playwright-core   (usa el Chromium del sistema; ajustar CHROMIUM si hace falta)
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const html = fileURLToPath(new URL('../cartel.html', import.meta.url));
const out = (f) => fileURLToPath(new URL('../export/' + f, import.meta.url));

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1800, height: 400 }, deviceScaleFactor: 3 });
await page.goto('file://' + html);
await page.evaluate(() => document.fonts.ready);

await page.locator('.sign').screenshot({ path: out('Alumfer_cartel_5400x1200.png') });

// PDF vectorial (texto e isologo en curvas/vector): escala libre sin pérdida.
await page.emulateMedia({ media: 'screen' });
await page.pdf({ path: out('Alumfer_cartel_vectorial.pdf'), width: '1800px', height: '400px',
  printBackground: true, pageRanges: '1' });

await browser.close();
console.log('Exportado en export/');
