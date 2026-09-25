// Exporta el cartel de la camioneta (2000 x 420 mm). Se usa el MISMO diseño en los dos laterales (imprimir x2).
// (cartel.html#derecho conserva la variante espejada por si en algún momento se quiere volver a usar)
//   - PNG de vista 4000x840 (sin sangrado)
//   - IMPRENTA: PDF vectorial a tamaño real con 30 mm de sangrado por lado (2060 x 480 mm),
//     TrimBox (2000 x 420 mm) y BleedBox marcados
//   - IMPRENTA: PNG a tamaño real con sangrado a 150 dpi
// Uso:  node scripts/export.mjs
// Requiere:  npm i playwright-core pdf-lib sharp   (Chromium en CHROMIUM, por defecto /opt/pw-browsers/chromium)
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const html = fileURLToPath(new URL('../cartel.html', import.meta.url));
const out = (f) => fileURLToPath(new URL('../export/' + f, import.meta.url));
const W = 2000, H = 420;          // 1 px CSS = 1 mm
const BLEED = 30;                 // mm por lado
const PX_PER_MM = 96 / 25.4;      // para que 1 px de diseño mida 1 mm en el PDF

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(side, bleed, scale = 1, zoom = 1) {
  const page = await browser.newPage({
    viewport: { width: Math.ceil((W + 2 * bleed) * zoom), height: Math.ceil((H + 2 * bleed) * zoom) }, deviceScaleFactor: scale });
  await page.goto('file://' + html + (side === 'derecho' ? '#derecho' : ''));
  // con sangrado: el fondo de página en grafito tapa cualquier filo de redondeo en el borde exterior
  const bg = bleed ? '#1e2227' : 'transparent';
  await page.addStyleTag({ content: `html,body{background:${bg}} .sign{--bleed:${bleed}px} ${zoom !== 1 ? `body{zoom:${zoom}}` : ''}` });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

for (const side of ['izquierdo']) {
  const tag = 'AMBOS_LADOS_x2';

  // vista
  let page = await open(side, 0, 2);
  await page.locator('.sign').screenshot({ path: out(`Alumfer_camioneta_${tag}_vista.png`) });
  await page.close();

  // PNG imprenta: 2060 x 480 mm a 150 dpi
  const DPI = 150, wpx = Math.round((W + 2 * BLEED) / 25.4 * DPI), hpx = Math.round((H + 2 * BLEED) / 25.4 * DPI);
  page = await open(side, BLEED, wpx / (W + 2 * BLEED));
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W + 2 * BLEED, height: H + 2 * BLEED } });
  await sharp(buf, { limitInputPixels: false }).resize(wpx, hpx).withMetadata({ density: DPI }).png({ compressionLevel: 9 })
    .toFile(out(`IMPRENTA_Alumfer_camioneta_${tag}_206x48cm_150dpi.png`));
  await page.close();

  // PDF imprenta a tamaño real (vectorial)
  page = await open(side, BLEED, 1, PX_PER_MM);
  await page.emulateMedia({ media: 'screen' });
  const name = out(`IMPRENTA_Alumfer_camioneta_${tag}_206x48cm_TAMANO_REAL.pdf`);
  await page.pdf({ path: name, width: `${W + 2 * BLEED}mm`, height: `${H + 2 * BLEED}mm`, printBackground: true,
    pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
  const mm = (v) => v * 72 / 25.4;
  const doc = await PDFDocument.load(await readFile(name));
  const p = doc.getPage(0);
  const { height } = p.getSize();
  const Wt = mm(W + 2 * BLEED), Ht = mm(H + 2 * BLEED), b = mm(BLEED);
  p.setMediaBox(0, height - Ht, Wt, Ht);
  p.setBleedBox(0, height - Ht, Wt, Ht);
  p.setTrimBox(b, height - Ht + b, mm(W), mm(H));
  doc.setTitle('Alumfer - cartel camioneta (imprimir 2 iguales) 200 x 42 cm + 3 cm de sangrado (206 x 48 cm)');
  await writeFile(name, await doc.save());
}
await browser.close();
console.log('Exportado en export/');
