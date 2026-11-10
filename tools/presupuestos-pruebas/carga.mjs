// Mide cuánto tarda en verse la app con red de celular lenta y CPU de gama baja.
// Primera visita (sin nada guardado) y segunda (con el service worker).
// Las fuentes de Google se simulan lentas (el proxy de este entorno no las deja pasar).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = process.argv[2] || 'http://localhost:8777/';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/dolarapi|bluelytics/, async r => { await new Promise(s => setTimeout(s, 1500)); r.fulfill({ json: { compra: 1400, venta: 1450 } }); });
// Google Fonts: 1,2 s de demora (DNS + TLS + CSS + woff2 por 3G) y luego vacío.
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, async r => { await new Promise(s => setTimeout(s, 1200)); r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
async function medir(nombre) {
  const t0 = Date.now();
  await p.goto(URL, { waitUntil: 'commit' });
  await p.waitForSelector('#btn-continuar', { state: 'visible' });
  const visible = Date.now() - t0;
  await p.waitForLoadState('load');
  const fcp = await p.evaluate(() => { const e = performance.getEntriesByName('first-contentful-paint')[0]; return e ? Math.round(e.startTime) : null; });
  const bytes = await p.evaluate(() => Math.round(performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0) / 1024));
  console.log(nombre + ': primer dibujo ' + fcp + ' ms · botón visible ' + visible + ' ms · ' + bytes + ' KB por red');
}
await medir('1ª visita');
await p.waitForTimeout(4000);           // que el service worker termine de instalarse
await medir('2ª visita');
await medir('3ª visita');
await b.close();
