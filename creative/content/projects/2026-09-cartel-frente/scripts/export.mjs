// Exporta el cartel del frente. Medida TOTAL del archivo: 5400 x 1200 mm (540 x 120 cm), sin sangrado extra.
//   - PNG 5400x1200 y 10800x2400 (para ver / mandar por WhatsApp)
//   - IMPRENTA, A TAMAÑO REAL 540 x 120 cm:
//       * PDF vectorial. Como un PDF común no admite páginas de más de 5,08 m, se usa UserUnit = 10
//         (norma PDF 1.6): la página mide 540 x 120 cm reales al abrirla en Acrobat / el RIP de la imprenta.
//       * PNG 15307 x 3402 px = 540 x 120 cm a 72 dpi (resolución habitual para lona), con los dpi grabados.
//   Si la imprenta pidiera sangrado, subir BLEED_MM (el diseño extiende los fondos solo).
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
const BLEED_MM = 0;               // sangrado por lado, a tamaño real (0: el archivo mide exactamente 540 x 120 cm)
const BLEED_PX = BLEED_MM / PX_MM;

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(scale, bleedPx) {
  const w = Math.ceil(1800 + 2 * bleedPx), h = Math.ceil(400 + 2 * bleedPx);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.goto('file://' + html);
  // con sangrado, los fondos se extienden 2 px extra a la derecha/abajo para que el redondeo no deje un filo blanco
  const extra = bleedPx ? '.sign{overflow:visible} .sign::before,.sign::after{right:-2px} .sign::after{bottom:-2px}' : '';
  // fondo de página grafito: tapa cualquier filo de redondeo en el borde del archivo
  await page.addStyleTag({ content: `html,body{background:#1e2227} .sign{--bleed:${bleedPx}px} ${extra}` });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// PNG sin sangrado
for (const [scale, name] of [[3, 'Alumfer_cartel_5400x1200.png'], [6, 'Alumfer_cartel_10800x2400_alta.png']]) {
  const page = await open(scale, 0);
  await page.locator('.sign').screenshot({ path: out(name) });
  await page.close();
}
// PNG a tamaño real: 540 x 120 cm a 72 dpi = 15307 x 3402 px
{
  const DPI = 72, WPX = Math.round((5400 + 2 * BLEED_MM) / 25.4 * DPI), HPX = Math.round((1200 + 2 * BLEED_MM) / 25.4 * DPI);
  const page = await open(WPX / (1800 + 2 * BLEED_PX), BLEED_PX);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1800 + 2 * BLEED_PX, height: 400 + 2 * BLEED_PX } });
  await sharp(buf, { limitInputPixels: false }).resize(WPX, HPX)
    .withMetadata({ density: DPI }).png({ compressionLevel: 9 })
    .toFile(out(`IMPRENTA_Alumfer_cartel_${(5400 + 2 * BLEED_MM) / 10}x${(1200 + 2 * BLEED_MM) / 10}cm_TAMANO_REAL_72dpi.png`));
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

// Cajas exactas del PDF (Chrome redondea la página ~0,3 mm de más)
const mm = (v) => v * 72 / 25.4;
const doc = await PDFDocument.load(await readFile(out(bleedName)));
const p = doc.getPage(0);
const { height } = p.getSize();
const b = mm(BLEED_MM / 10), W = mm(540), H = mm(120);
// el origen del PDF es abajo a la izquierda y el diseño arranca arriba a la izquierda
p.setMediaBox(0, height - (H + 2 * b), W + 2 * b, H + 2 * b);
p.setBleedBox(0, height - (H + 2 * b), W + 2 * b, H + 2 * b);
p.setTrimBox(b, height - (H + b), W, H);
// UserUnit 10: cada unidad vale 10/72 de pulgada -> la página de 54 x 12 cm pasa a medir 540 x 120 cm reales
p.node.set(PDFName.of('UserUnit'), PDFNumber.of(10));
const T = `${(5400 + 2 * BLEED_MM) / 10}x${(1200 + 2 * BLEED_MM) / 10}cm`;
doc.setTitle(`Alumfer - cartel frente ${T} (tamaño real, medida total)`);
await writeFile(out(`IMPRENTA_Alumfer_cartel_${T}_TAMANO_REAL.pdf`), await doc.save());
await unlink(out(bleedName));

await browser.close();
console.log('Exportado en export/');
