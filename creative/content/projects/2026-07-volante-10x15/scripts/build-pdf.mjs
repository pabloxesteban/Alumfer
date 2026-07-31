// Genera los PDF listos para imprenta a partir del PNG con sangrado.
// Uso:  node scripts/build-pdf.mjs <bleed.png>
// Requiere:  npm i pdf-lib sharp
//
// El PNG de entrada debe ser el arte COMPLETO con 3 mm de sangrado por lado
// (relacion 106 x 156 mm). Ver README para como generarlo desde volante-print.html.
//
// Salidas (en ../export):
//   Alumfer_volante_10x15_sangrado.pdf   -> imagen a resolucion nativa del PNG
//   Alumfer_volante_10x15_300dpi.pdf     -> imagen reescalada a 300 DPI exactos
import { PDFDocument, PDFName, PDFArray, PDFNumber } from 'pdf-lib';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('falta el PNG con sangrado: node scripts/build-pdf.mjs <bleed.png>'); process.exit(1); }

const mm = (v) => (v * 72) / 25.4;                 // mm -> pt
const W = mm(106), H = mm(156), T = mm(3);         // 10x15 cm + 3 mm de sangrado

async function makePdf(pngBuffer, outName) {
  const doc = await PDFDocument.create();
  doc.setTitle('Alumfer - Volante 10x15cm');
  doc.setCreator('Alumfer'); doc.setProducer('Alumfer');
  const png = await doc.embedPng(pngBuffer);
  const page = doc.addPage([W, H]);
  page.drawImage(png, { x: 0, y: 0, width: W, height: H });
  const box = (x0, y0, x1, y1) => {
    const a = PDFArray.withContext(doc.context);
    [x0, y0, x1, y1].forEach((n) => a.push(PDFNumber.of(n)));
    return a;
  };
  page.node.set(PDFName.of('TrimBox'), box(T, T, W - T, H - T));   // corte 100x150
  page.node.set(PDFName.of('BleedBox'), box(0, 0, W, H));          // sangrado completo
  const bytes = await doc.save();
  writeFileSync(new URL(`../export/${outName}`, import.meta.url), bytes);
  console.log(`${outName}: ${(bytes.length / 1048576).toFixed(2)} MB (${png.width}x${png.height}px)`);
}

const native = readFileSync(src);
await makePdf(native, 'Alumfer_volante_10x15_sangrado.pdf');

const wpx = Math.round((106 / 25.4) * 300), hpx = Math.round((156 / 25.4) * 300); // 1252 x 1843
const dpi300 = await sharp(src).resize(wpx, hpx, { fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
await makePdf(dpi300, 'Alumfer_volante_10x15_300dpi.pdf');
