/**
 * compose-slides.mjs
 * ---------------------------------------------------------------------------
 * Monta el carrusel final: foto real (GPT Image) de fondo + overlay de marca
 * (scrim de legibilidad + texto Montserrat/Inter + logo Alumfer) → PNG 1080x1080.
 *
 *   node services/image-generation/compose-slides.mjs
 *
 * Requiere: sharp instalado y las fuentes Montserrat/Inter en el sistema.
 * Entrada:  generated/images/slide-*.png (fotos)
 * Salida:   generated/images/final/slide-N.png
 */
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const IMG = resolve(ROOT, 'generated/images');
const OUT = resolve(IMG, 'final');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const LOGO = 'data:image/png;base64,' + readFileSync(resolve(ROOT, 'apps/website/solologo.png')).toString('base64');
const W = (a) => `rgba(255,255,255,${a})`;

// ---- helpers de overlay (SVG transparente 1080x1080) ----
const defs = `
<defs>
  <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.42" stop-color="#0c0e11" stop-opacity="0"/>
    <stop offset="0.72" stop-color="#0c0e11" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#0c0e11" stop-opacity="0.94"/>
  </linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0c0e11" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#0c0e11" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="brand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1B6CC8" stop-opacity="0.0"/>
    <stop offset="1" stop-color="#1B6CC8" stop-opacity="0.22"/>
  </linearGradient>
</defs>`;

const scrims = `
  <rect width="1080" height="300" fill="url(#top)"/>
  <rect y="360" width="1080" height="720" fill="url(#bottom)"/>
  <rect y="360" width="1080" height="720" fill="url(#brand)"/>`;

function logo(cy) {
  const h = 54, w = h * 1.42, gap = 14;
  const total = w + gap + 184;
  const x0 = 540 - total / 2;
  const tx = x0 + w + gap;
  return `
  <image href="${LOGO}" x="${x0.toFixed(0)}" y="${cy - h / 2}" width="${w.toFixed(0)}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${tx.toFixed(0)}" y="${cy - 2}" fill="${W(0.97)}" font-family="Montserrat" font-size="30" font-weight="700" letter-spacing="1">ALUMFER</text>
  <text x="${tx.toFixed(0)}" y="${cy + 22}" fill="${W(0.6)}" font-family="Inter" font-size="13.5" font-weight="600" letter-spacing="2">CARPINTERÍA DE ALUMINIO</text>`;
}

const T = (x, y, s, size, { w = 400, c = '#fff', f = 'Montserrat', anchor = 'middle', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${c}" font-family="${f}" font-size="${size}" font-weight="${w}" letter-spacing="${ls}">${s}</text>`;

function svg(inner, { withScrim = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${defs}${withScrim ? scrims : ''}${inner}</svg>`;
}

const kicker = (s) => T(540, 706, s, 23, { f: 'Inter', w: 600, c: W(0.85), ls: 3 });

// ---- overlays por slide ----
const overlays = {
  's1': svg(
    T(540, 812, 'La ventana barata', 66, { w: 700 }) +
    T(540, 884, 'no existe.', 66, { w: 700 }) +
    logo(990)),
  's3': svg(kicker('CUOTA 1 · EL INVIERNO') +
    T(540, 806, 'El frío', 92, { w: 700 }) +
    T(540, 868, 'Entra por el marco viejo. Lo pagás en gas.', 31, { f: 'Inter', c: W(0.85) }) +
    logo(990)),
  's4': svg(kicker('CUOTA 2 · EL RUIDO') +
    T(540, 806, 'El ruido', 92, { w: 700 }) +
    T(540, 868, 'La calle que una ventana barata deja pasar.', 31, { f: 'Inter', c: W(0.85) }) +
    logo(990)),
  's5': svg(kicker('CUOTA 3 · LA HUMEDAD') +
    T(540, 806, 'La humedad', 84, { w: 700 }) +
    T(540, 868, 'Condensación y moho. No era la casa, era la abertura.', 30, { f: 'Inter', c: W(0.85) }) +
    logo(990)),
  's6': svg(kicker('CUOTA FINAL · LA SEGUNDA VENTANA') +
    T(540, 800, 'La pagás dos veces', 62, { w: 700 }) +
    T(540, 862, 'A los pocos años la cambiás, y pagás la instalación de nuevo.', 29, { f: 'Inter', c: W(0.85) }) +
    logo(986)),
  's7': svg(
    T(540, 792, 'No es cara la buena.', 60, { w: 700 }) +
    T(540, 850, 'Es carísima la barata, pagada de a poco.', 32, { f: 'Inter', c: W(0.88) }) +
    T(540, 892, 'Fabricamos las nuestras. Por eso te decimos la verdad.', 27, { f: 'Inter', c: W(0.62) }) +
    logo(986)),
  's8': svg(
    T(540, 792, '¿Cuántas cuotas te falta pagar?', 52, { w: 700 }) +
    T(540, 846, 'Mandanos una foto de tu abertura por WhatsApp.', 30, { f: 'Inter', c: W(0.85) }) +
    // ícono WhatsApp + handle
    `<g transform="translate(432,884)"><circle cx="20" cy="20" r="20" fill="#25D366"/><path d="M20 6 a14 14 0 1 0 -12 21 l-6 2 2 -6 a14 14 0 0 0 16 -17z" fill="#fff"/><path d="M15 13 c-1 0 -2 1 -2 3 c0 5 5 8 9 8 c2 0 3 -1 3 -2 l-2 -2 c-1 0 -2 1 -3 0 c-2 -1 -3 -2 -3 -4 c0 -1 1 -1 1 -2 l-2 -2z" fill="#25D366"/></g>` +
    T(486, 910, 'wa.me/541163368643', 26, { f: 'Inter', w: 600, anchor: 'start' }) +
    logo(986)),
};

// slide 2: split aluminio | madera
async function buildSplit() {
  const left = await sharp(resolve(IMG, 'slide-2a-aluminio.png')).resize(540, 1080, { fit: 'cover' }).toBuffer();
  const right = await sharp(resolve(IMG, 'slide-2b-madera.png')).resize(540, 1080, { fit: 'cover' }).toBuffer();
  return sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#000' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 540, top: 0 }])
    .png().toBuffer();
}
const s2overlay = svg(
  T(540, 150, 'Existen dos ventanas', 46, { w: 700 }) +
  `<line x1="540" y1="200" x2="540" y2="880" stroke="${W(0.35)}" stroke-width="1"/>` +
  T(270, 812, 'ALUMINIO', 40, { w: 700 }) +
  T(270, 852, 'se paga una vez', 26, { f: 'Inter', c: W(0.85) }) +
  T(810, 812, 'MADERA', 40, { w: 700 }) +
  T(810, 852, 'se paga siempre', 26, { f: 'Inter', c: W(0.85) }) +
  logo(986), { withScrim: true });

// ---- render ----
const jobs = [
  ['slide-1', 'slide-1-hero.png', overlays.s1],
  ['slide-3', 'slide-3-frio.png', overlays.s3],
  ['slide-4', 'slide-4-ruido.png', overlays.s4],
  ['slide-5', 'slide-5-humedad.png', overlays.s5],
  ['slide-6', 'slide-6-segunda-ventana.png', overlays.s6],
  ['slide-7', 'slide-7-taller.png', overlays.s7],
  ['slide-8', 'slide-8-cta.png', overlays.s8],
];

for (const [name, photo, ov] of jobs) {
  await sharp(resolve(IMG, photo)).resize(1080, 1080, { fit: 'cover' })
    .composite([{ input: Buffer.from(ov) }]).png().toFile(resolve(OUT, `${name}.png`));
  console.log('✓', name);
}
// slide 2
const base2 = await buildSplit();
await sharp(base2).composite([{ input: Buffer.from(s2overlay) }]).png().toFile(resolve(OUT, 'slide-2.png'));
console.log('✓ slide-2 (split aluminio|madera)');

console.log('\nListo → generated/images/final/');
