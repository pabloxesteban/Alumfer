// Exporta el cartel (5,40 x 1,20 m):
//   - PNG 5400x1200 y 10800x2400 (sin sangrado, para ver / mandar por WhatsApp)
//   - IMPRENTA, A TAMAÑO REAL (5,50 x 1,30 m = 5,40 x 1,20 m + 5 cm de sangrado por lado):
//       * PDF vectorial. Como un PDF común no admite páginas de más de 5,08 m, se usa UserUnit = 10
//         (norma PDF 1.6): la página mide 550 x 130 cm reales al abrirla en Acrobat / el RIP de la imprenta.
//         TrimBox marca el corte (540 x 120 cm) y BleedBox el sangrado.
//       * PNG 15591 x 3685 px = 550 x 130 cm a 72 dpi (resolución habitual para lona), con los dpi grabados.
// Uso:  node scripts/export.mjs
// Requiere:  npm i playwright-core pdf-lib sharp   (usa el Chromium de CHROMIUM, por defecto /opt/pw-browsers/chromium)
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { PDFName, PDFNumber } from 'pdf-lib';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const html = fileURLToPath(new URL('../cartel.html', import.meta.url));
const out = (f) => fileURLToPath(new URL('../export/' + f, import.meta.url));

const PX_MM = 3;                  // 1 px CSS = 3 mm a tamaño real
const BLEED_MM = 50;              // sangrado por lado, a tamaño real
const BLEED_PX = BLEED_MM / PX_MM;

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(scale, bleedPx) {
  const w = Math.ceil(1800 + 2 * bleedPx), h = Math.ceil(400 + 2 * bleedPx);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.goto('file://' + html);
  // con sangrado, los fondos se extienden 2 px extra a la derecha/abajo para que el redondeo no deje un filo blanco
  const extra = bleedPx ? '.sign{overflow:visible} .sign::before,.sign::after{right:-2px} .sign::after{bottom:-2px}' : '';
  await page.addStyleTag({ content: `html,body{background:transparent} .sign{--bleed:${bleedPx}px} ${extra}` });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// PNG sin sangrado
for (const [scale, name] of [[3, 'Alumfer_cartel_5400x1200.png'], [6, 'Alumfer_cartel_10800x2400_alta.png']]) {
  const page = await open(scale, 0);
  await page.locator('.sign').screenshot({ path: out(name) });
  await page.close();
}
// PNG a tamaño real con sangrado: 550 x 130 cm a 72 dpi = 15591 x 3685 px
{
  const DPI = 72, WPX = Math.round(5500 / 25.4 * DPI), HPX = Math.round(1300 / 25.4 * DPI);
  const page = await open(WPX / (1800 + 2 * BLEED_PX), BLEED_PX);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1834, height: 434 } });
  await sharp(buf, { limitInputPixels: false }).extract({ left: 0, top: 0, width: WPX, height: HPX })
    .withMetadata({ density: DPI }).png({ compressionLevel: 9 })
    .toFile(out('IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL_72dpi.png'));
  await page.close();
}

// PDF 1:10. 1 px CSS = 0,2646 mm en PDF; escala para que 1 px = 0,3 mm (3 mm / 10)
const scale = 0.3 / (25.4 / 96);
async function pdf(bleedPx, name) {
  const page = await open(1, bleedPx);
  await page.emulateMedia({ media: 'screen' });
  const wmm = (1800 + 2 * bleedPx) * 0.3, hmm = (400 + 2 * bleedPx) * 0.3;
  await page.pdf({ path: out(name), width: `${wmm}mm`, height: `${hmm}mm`, scale,
    printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
  return [wmm, hmm];
}
const bleedName = '_tmp_escala_1-10.pdf';
await pdf(BLEED_PX, bleedName);

// Marcar corte (TrimBox) y sangrado (BleedBox) en el PDF de imprenta
const mm = (v) => v * 72 / 25.4;
const doc = await PDFDocument.load(await readFile(out(bleedName)));
const p = doc.getPage(0);
const { height } = p.getSize();   // Chrome redondea la página ~0,3 mm de más: se fijan las cajas exactas
const b = mm(BLEED_MM / 10), W = mm(540), H = mm(120);
// el origen del PDF es abajo a la izquierda y el diseño arranca arriba a la izquierda
p.setMediaBox(0, height - (H + 2 * b), W + 2 * b, H + 2 * b);
p.setBleedBox(0, height - (H + 2 * b), W + 2 * b, H + 2 * b);
p.setTrimBox(b, height - (H + b), W, H);
// UserUnit 10: cada unidad vale 10/72 de pulgada -> la página de 55 x 13 cm pasa a medir 550 x 130 cm reales
p.node.set(PDFName.of('UserUnit'), PDFNumber.of(10));
doc.setTitle('Alumfer - cartel frente 540 x 120 cm + 5 cm de sangrado (550 x 130 cm, tamaño real)');
await writeFile(out('IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL.pdf'), await doc.save());
await unlink(out(bleedName));

await browser.close();
console.log('Exportado en export/');
