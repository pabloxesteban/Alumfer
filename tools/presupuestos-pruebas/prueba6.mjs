import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { conPasos } from './pasos.mjs';
import { execSync } from 'child_process';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', acceptDownloads: true });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
await ctx.addInitScript(() => { window.__abiertos = []; window.open = (u) => { window.__abiertos.push(u); return null; }; });
const p = conPasos(await ctx.newPage());
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8777/');
const A = '.item--abierto ';
const centro = async (sel) => { await p.locator(sel).first().evaluate(n => n.scrollIntoView({ block: 'center' })); await p.waitForTimeout(120); };
async function agregar(tile, extra) {
  await p.click('#btn-agregar-item'); await p.click(tile); await p.waitForTimeout(400);
  if (extra) await extra();
  await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');
}
ok(await p.isHidden('#tarjeta-compras'), 'sin aberturas no aparece "Para hacer las compras"');
await p.fill('#cli-nombre', 'Quincho Gómez');
await agregar('.tipo-tile[data-tipo="vent-corr-2"]', async () => {
  await p.click('[data-variante="vent-corr-4"]');
  await centro(A + '[data-accion="mas"]'); await p.click(A + '[data-accion="mas"]');
  await centro(A + '.extra:has-text("Premarco")'); await p.click(A + '.extra:has-text("Premarco")');
});
await agregar('.tipo-tile[data-tipo="pano-fijo"]', async () => { await centro('[data-forma="arco"]'); await p.click('[data-forma="arco"]'); });
await agregar('.tipo-tile:has-text("Cortina de enrollar PVC")');
await agregar('.tipo-tile:has-text("Reja de hierro")');
ok(await p.isVisible('#tarjeta-compras'), 'con aberturas aparece la tarjeta "Para hacer las compras"');

await centro('#btn-compras'); await p.click('#btn-compras');
await p.waitForSelector('#modal-compras:not([hidden])');
const cuerpo = await p.textContent('#compras-cuerpo');
ok(/Solo para vos/.test(cuerpo) && /no sale en el presupuesto/.test(cuerpo), 'avisa que es solo para él');
ok(/tiras?dealuminiode6m/.test(cuerpo.replace(/\s+/g, '')) && !/barra/i.test(cuerpo), 'resumen con tiras de 6 m (no dice "barras")');
ok(/Marco corrediza/.test(cuerpo) && /Hoja corrediza/.test(cuerpo) && /Premarco/.test(cuerpo), 'perfiles: marco, hoja corrediza y premarco');
ok(/Va curvado/.test(cuerpo), 'el marco del arco avisa que va curvado');
ok(/Retazos que quedan/.test(cuerpo), 'dice qué retazos sobran');
ok(/Simple 4 mm/.test(cuerpo) && /8 ×/.test(cuerpo), 'vidrios: 8 paños de la corrediza de 4 hojas × 2');
ok(/Cortina de enrollar PVC con cajón blanca/.test(cuerpo) && /Reja de hierro redondo/.test(cuerpo), 'cortina blanca y reja de hierro en m²');
ok(/peso por metro/.test(cuerpo), 'sin peso por metro, explica dónde cargarlo');
await p.screenshot({ path: OUT + '/m1-compras.png' });
await p.locator('.compras-titulo').first().evaluate(n => n.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(200);
await p.screenshot({ path: OUT + '/m2-aluminio.png' });
await p.click('#btn-compras-whatsapp');
const lista = decodeURIComponent((await p.evaluate(() => window.__abiertos.pop())).split('text=')[1]);
ok(/^\*Materiales/.test(lista) && /tiras/.test(lista) && !/barra/i.test(lista) && !/wa\.me\/\d/.test(lista), 'la lista va por WhatsApp sin número fijo (elige a quién)');
const barrasAntes = await p.locator('.compras-dato strong').first().textContent();
await p.click('#btn-cerrar-compras');

// Peso por metro y barra más larga
await p.click('.tab[data-vista="precios"]');
await p.locator('#tabla-lineas .fila-precio:has(input[value="Herrero"]) [data-campo="kgMetro"]').fill('0.85');
await p.fill('#gen-barra', '6.5');
await p.click('.tab[data-vista="presupuesto"]');
await centro('#btn-compras'); await p.click('#btn-compras');
const cuerpo2 = await p.textContent('#compras-cuerpo');
ok(/kg/.test(await p.locator('#compras-cuerpo .compras-resumen').textContent()), 'con peso por metro aparecen los kilos: ' + (await p.locator('#compras-cuerpo .compras-resumen').textContent()).replace(/\s+/g, ' '));
ok(/6,5 m/.test(cuerpo2), 'con barra de 6,5 m la lista lo usa');
await p.click('#btn-cerrar-compras');

// Nada de esto llega al cliente
await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/cliente.pdf');
const pdf = execSync(`pdftotext -layout ${OUT}/cliente.pdf -`).toString();
ok(!/barra|tira|retazo|kg|Materiales|sobra/i.test(pdf), 'el PDF del cliente no tiene nada de materiales');
ok(/blanca/.test(pdf), 'el PDF dice que la cortina es blanca');
await p.click('summary:has-text("Otras formas")');
await p.click('#btn-whatsapp-texto');
const wa = decodeURIComponent((await p.evaluate(() => window.__abiertos.pop())).split('text=')[1]);
ok(!/barra|tiras de aluminio|retazo|Materiales/i.test(wa), 'el WhatsApp del cliente no tiene nada de materiales');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
