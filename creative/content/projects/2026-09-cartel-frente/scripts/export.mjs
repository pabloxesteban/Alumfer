// Exporta el cartel:
//   - PNG 5400x1200 (la medida pedida)
//   - PNG 10800x2400 (alta: ~50 DPI a 5,40 m, lo estándar para lona vista de lejos)
//   - PDF vectorial a escala 1:10 (540 x 120 mm) -> la imprenta lo agranda x10 sin perder calidad
// Uso:  node scripts/export.mjs
// Requiere:  npm i playwright-core   (usa el Chromium de CHROMIUM, por defecto /opt/pw-browsers/chromium)
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const html = fileURLToPath(new URL('../cartel.html', import.meta.url));
const out = (f) => fileURLToPath(new URL('../export/' + f, import.meta.url));

const browser = await chromium.launch({ executablePath: CHROMIUM });
for (const [scale, name] of [[3, 'Alumfer_cartel_5400x1200.png'], [6, 'Alumfer_cartel_10800x2400_alta.png']]) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 400 }, deviceScaleFactor: scale });
  await page.goto('file://' + html);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.sign').screenshot({ path: out(name) });
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1800, height: 400 } });
await page.goto('file://' + html);
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: 'screen' });
// 1800 px CSS = 476,25 mm -> escala para llenar 540 mm exactos
await page.pdf({ path: out('Alumfer_cartel_vectorial_escala_1-10.pdf'), width: '540mm', height: '120mm',
  scale: 540 / 476.25, printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });

await browser.close();
console.log('Exportado en export/');
