// Regenera el QR de WhatsApp del cartel (en SVG, para que quede nítido a cualquier tamaño).
// Uso:  node scripts/gen-qr.mjs
// Requiere:  npm i qrcode
//
// Si cambia el numero o el mensaje, edita las constantes de abajo y volve a correr.
import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';

const PHONE = '5491163368643';                                   // +54 9 11 6336-8643
const MESSAGE = 'Hola Alumfer, quisiera pedir un presupuesto de...';
const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 0,
  color: { dark: '#000000ff', light: '#ffffffff' },
});
await writeFile(new URL('../assets/qr.svg', import.meta.url), svg);
console.log('QR actualizado ->', url);
