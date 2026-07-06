/**
 * compose-slides.mjs — carrusel Alumfer 1080x1350 (Instagram feed retrato)
 * Foto real (GPT Image) + overlay de marca (scrim + Montserrat/Inter + logo).
 *   node services/image-generation/compose-slides.mjs
 */
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const IMG = resolve(ROOT, 'generated/images');
const OUT = resolve(IMG, 'final');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const Wd = 1080, Ht = 1350;

const LOGO = 'data:image/png;base64,' + readFileSync(resolve(ROOT, 'apps/website/solologo.png')).toString('base64');
const W = (a) => `rgba(255,255,255,${a})`;

const defs = `
<defs>
  <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.34" stop-color="#0a0d10" stop-opacity="0"/>
    <stop offset="0.62" stop-color="#0a0d10" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#0a0d10" stop-opacity="0.95"/>
  </linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0d10" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#0a0d10" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="brand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1B6CC8" stop-opacity="0"/>
    <stop offset="1" stop-color="#1B6CC8" stop-opacity="0.20"/>
  </linearGradient>
</defs>`;

const scrims = (top = false) => `
  ${top ? `<rect width="${Wd}" height="320" fill="url(#top)"/>` : ''}
  <rect y="520" width="${Wd}" height="${Ht - 520}" fill="url(#bottom)"/>
  <rect y="700" width="${Wd}" height="${Ht - 700}" fill="url(#brand)"/>`;

function logo(cy = 1290) {
  const h = 56, w = h * 1.42, gap = 15, total = w + gap + 190, x0 = 540 - total / 2, tx = x0 + w + gap;
  return `
  <image href="${LOGO}" x="${x0.toFixed(0)}" y="${(cy - h / 2).toFixed(0)}" width="${w.toFixed(0)}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${tx.toFixed(0)}" y="${cy - 1}" fill="${W(0.98)}" font-family="Montserrat" font-size="31" font-weight="700" letter-spacing="1">ALUMFER</text>
  <text x="${tx.toFixed(0)}" y="${cy + 23}" fill="${W(0.62)}" font-family="Inter" font-size="14" font-weight="600" letter-spacing="2">CARPINTERÍA DE ALUMINIO</text>`;
}

const T = (x, y, s, size, { w = 400, c = '#fff', f = 'Montserrat', anchor = 'middle', ls = 0, op = 1 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${c}" fill-opacity="${op}" font-family="${f}" font-size="${size}" font-weight="${w}" letter-spacing="${ls}">${s}</text>`;

// pill azul sutil detrás de la "Cuota N" (contraste + marca)
// ancho = ancho estimado del texto + padding simétrico consistente en todas
const KICK_SIZE = 22, KICK_LS = 2, KICK_PAD = 22;
function kicker(y, text) {
  const textW = text.length * (KICK_SIZE * 0.62 + KICK_LS); // ancho real aprox (incluye tracking)
  const w = textW + KICK_PAD * 2, x = 540 - w / 2;
  return `<rect x="${x.toFixed(0)}" y="${(y - 38).toFixed(0)}" width="${w.toFixed(0)}" height="50" rx="25" fill="#1B6CC8" fill-opacity="0.92"/>` +
    T(540, y - 4, text, KICK_SIZE, { f: 'Inter', w: 600, ls: KICK_LS });
}

const svg = (inner, top = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}">${defs}${scrims(top)}${inner}</svg>`;

// ícono real de WhatsApp — glifo oficial (SimpleIcons, viewBox 24x24) sobre círculo verde
const WA_GLYPH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
const waIcon = (cx, cy, r = 26) => {
  const g = r * 1.34, s = g / 24, x = cx - g / 2, y = cy - g / 2; // glifo centrado en el círculo
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#25D366"/>` +
    `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><path d="${WA_GLYPH}" fill="#fff"/></g>`;
};

// ---- overlays ----
const overlays = {
  s1: svg(
    T(540, 1000, 'La ventana', 58, { w: 400, op: 0.9 }) +
    T(540, 1112, 'barata', 118, { w: 700 }) +
    T(540, 1188, 'no existe.', 58, { w: 400, op: 0.9 }) +
    logo(1300)),
  s3: svg(kicker(1000, 'CUOTA 1 · EL INVIERNO') +
    T(540, 1110, 'El frío', 100, { w: 700 }) +
    T(540, 1170, 'Entra por el marco viejo. Lo pagás en gas.', 32, { f: 'Inter', op: 0.9 }) +
    logo(1298)),
  s4: svg(kicker(1000, 'CUOTA 2 · EL RUIDO') +
    T(540, 1110, 'El ruido', 100, { w: 700 }) +
    T(540, 1170, 'La calle que una ventana barata deja pasar.', 32, { f: 'Inter', op: 0.9 }) +
    logo(1298)),
  s5: svg(kicker(1000, 'CUOTA 3 · LA HUMEDAD') +
    T(540, 1108, 'La humedad', 90, { w: 700 }) +
    T(540, 1168, 'Condensación y moho. No era la casa, era la abertura.', 30, { f: 'Inter', op: 0.9 }) +
    logo(1298)),
  s6: svg(kicker(1000, 'CUOTA FINAL · LA SEGUNDA VENTANA') +
    T(540, 1108, 'La pagás dos veces', 66, { w: 700 }) +
    T(540, 1166, 'A los pocos años la cambiás, y pagás la instalación de nuevo.', 29, { f: 'Inter', op: 0.9 }) +
    logo(1298)),
  s7: svg(
    T(540, 1050, 'La buena no es cara.', 60, { w: 700 }) +
    T(540, 1108, 'La barata es carísima, pagada de a poco.', 34, { f: 'Inter', op: 0.92 }) +
    T(540, 1150, 'Fabricamos las nuestras. Por eso te decimos la verdad.', 27, { f: 'Inter', op: 0.62 }) +
    logo(1298)),
  s8: svg(
    T(540, 1024, '¿Cuántas cuotas te falta pagar?', 54, { w: 700 }) +
    T(540, 1078, 'Mandanos una foto de tu abertura.', 31, { f: 'Inter', op: 0.9 }) +
    // fila ícono + número, centrada en x=540 y alineada verticalmente al centro del ícono (y=1150)
    `<g transform="translate(340,1124)">${waIcon(26, 26, 26)}</g>` +
    T(410, 1166, '11-6336-8643', 46, { w: 700, anchor: 'start' }) +
    logo(1298)),
};

const s2overlay = svg(
  T(540, 140, 'Existen dos ventanas', 48, { w: 700 }) +
  `<line x1="540" y1="200" x2="540" y2="1180" stroke="${W(0.4)}" stroke-width="1"/>` +
  T(270, 1120, 'ALUMINIO', 44, { w: 700 }) +
  T(270, 1164, 'se paga una vez', 27, { f: 'Inter', op: 0.9 }) +
  T(810, 1120, 'MADERA', 44, { w: 700 }) +
  T(810, 1164, 'se paga siempre', 27, { f: 'Inter', op: 0.9 }) +
  logo(1300), true);

async function buildSplit() {
  const left = await sharp(resolve(IMG, 'slide-2a-aluminio.png')).resize(540, Ht, { fit: 'cover' }).toBuffer();
  const right = await sharp(resolve(IMG, 'slide-2b-madera.png')).resize(540, Ht, { fit: 'cover' }).toBuffer();
  return sharp({ create: { width: Wd, height: Ht, channels: 3, background: '#000' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 540, top: 0 }]).png().toBuffer();
}

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
  await sharp(resolve(IMG, photo)).resize(Wd, Ht, { fit: 'cover' })
    .composite([{ input: Buffer.from(ov) }]).png().toFile(resolve(OUT, `${name}.png`));
  console.log('✓', name);
}
await sharp(await buildSplit()).composite([{ input: Buffer.from(s2overlay) }]).png().toFile(resolve(OUT, 'slide-2.png'));
console.log('✓ slide-2 (split)');
console.log('\nListo → generated/images/final/ (1080x1350)');
