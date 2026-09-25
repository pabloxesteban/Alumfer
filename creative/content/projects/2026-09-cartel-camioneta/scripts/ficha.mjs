// Genera export/Alumfer_camioneta_FICHA_TECNICA.pdf (A4 apaisado) a partir de ficha-tecnica.html
// Uso: node scripts/ficha.mjs   (requiere: npm i playwright-core)
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const html = fileURLToPath(new URL('../ficha-tecnica.html', import.meta.url));
const out = fileURLToPath(new URL('../export/Alumfer_camioneta_FICHA_TECNICA.pdf', import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: out, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
await b.close(); console.log('Ficha ->', out);
