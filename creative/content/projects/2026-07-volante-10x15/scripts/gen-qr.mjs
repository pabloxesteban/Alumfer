// Regenera el QR de WhatsApp del volante.
// Uso:  node scripts/gen-qr.mjs
// Requiere:  npm i qrcode
//
// Si cambia el numero o el mensaje, edita las constantes de abajo y volve a correr.
import QRCode from 'qrcode';

const PHONE = '5491163368643';                                   // +54 9 11 6336-8643
const MESSAGE = 'Hola Alumfer, quisiera pedir un presupuesto de...';
const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

await QRCode.toFile(new URL('../assets/qr.png', import.meta.url), url, {
  errorCorrectionLevel: 'M',
  margin: 1,
  scale: 20,
  color: { dark: '#000000ff', light: '#ffffffff' },
});
console.log('QR actualizado ->', url);
