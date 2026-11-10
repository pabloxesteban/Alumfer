import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const SW = '/home/user/Alumfer/apps/presupuestos/sw.js';
const original = fs.readFileSync(SW, 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
const p = await ctx.newPage();
let fallas = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) fallas++; };
const version = () => p.evaluate(() => new Promise(res => {
  const c = new MessageChannel(); c.port1.onmessage = e => res(e.data);
  navigator.serviceWorker.controller ? navigator.serviceWorker.controller.postMessage({ tipo: 'VERSION' }, [c.port2]) : res(null);
}));
let recargas = 0; p.on('load', () => recargas++);
try {
  await p.goto('http://localhost:8777/'); await p.waitForSelector('#btn-continuar');
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
  await p.waitForTimeout(500);
  ok(recargas === 1, 'la primera instalación no recarga la pantalla (cargas: ' + recargas + ')');
  const v1 = await version();
  fs.writeFileSync(SW, original.replace(/VERSION = '([^']+)'/, "VERSION = '$1-prueba'"));
  // Abrir de nuevo sin tocar nada: la versión nueva se aplica sola
  await p.goto('http://localhost:8777/'); await p.waitForSelector('#btn-continuar');
  for (let i = 0; i < 20; i++) {
    await p.waitForTimeout(500);
    try { if (/-prueba$/.test(await p.textContent('#version-app'))) break; } catch (e) { /* recargando */ }
  }
  await p.waitForSelector('#btn-continuar');
  const v2 = await version();
  ok(v2 && v2 !== v1 && /-prueba$/.test(v2), 'al abrir sin tocar nada se aplica la versión nueva: ' + v1 + ' → ' + v2);
  ok(await p.isHidden('#actualizar-app'), 'sin franja de "versión nueva" (ya está aplicada)');
  // Si llega mientras se usa, aparece la franja
  await p.click('#cli-nombre'); await p.fill('#cli-nombre', 'Ana');
  fs.writeFileSync(SW, original.replace(/VERSION = '([^']+)'/, "VERSION = '$1-prueba2'"));
  await p.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()));
  await p.waitForSelector('#actualizar-app:not([hidden])', { timeout: 15000 }).catch(() => {});
  ok(await p.isVisible('#actualizar-app'), 'si llega mientras se está usando, aparece la franja y no recarga sola');
  ok(await p.inputValue('#cli-nombre') === 'Ana', 'no se pierde lo que se estaba escribiendo');
} finally {
  fs.writeFileSync(SW, original);
  await b.close();
}
process.exitCode = fallas ? 1 : 0;
