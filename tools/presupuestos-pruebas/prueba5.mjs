import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { conPasos } from './pasos.mjs';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', acceptDownloads: true });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
const p = conPasos(await ctx.newPage());
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8777/');
const A = '.item--abierto ';
const centro = async (sel) => { await p.locator(sel).first().evaluate(n => n.scrollIntoView({ block: 'center' })); await p.waitForTimeout(120); };
async function agregar(tile, lugar, extra) {
  await p.click('#btn-agregar-item');
  await p.click(tile);
  await p.waitForTimeout(450);
  if (extra) await extra();
  if (lugar) {
    if (await p.locator(A + `.lugar:has-text("${lugar}")`).count()) { await centro(A + `.lugar:has-text("${lugar}")`); await p.click(A + `.lugar:has-text("${lugar}")`); }
    else { await centro(A + '.lugar-otro'); await p.locator(A + '.lugar-otro').fill(lugar); }
  }
  await centro(A + '[data-accion="listo"]');
  await p.click(A + '[data-accion="listo"]');
}
await p.fill('#cli-nombre', 'Quincho Gómez');
await agregar('.tipo-tile[data-tipo="vent-corr-2"]', 'Quincho', async () => { await p.click('[data-variante="vent-corr-4"]'); });
await agregar('.tipo-tile[data-tipo="pano-fijo"]', 'Quincho', async () => { await centro('[data-forma="triangulo"]'); await p.click('[data-forma="triangulo"]'); });
await agregar('.tipo-tile[data-tipo="pano-fijo"]', 'Quincho');
await agregar('.tipo-tile[data-tipo="puerta-abrir"]', 'Quincho');
await agregar('.tipo-tile[data-tipo="vent-abrir-1"]', 'Baño');
await agregar('.tipo-tile:has-text("Reja de hierro")', 'Baño');

const cods = await p.$$eval('.item .codigo', ns => ns.map(n => n.textContent));
ok(cods.join(' ') === 'V1 PF1 PF2 P1 V2 R1', 'códigos por tipo: ' + cods.join(' '));
const grupos = await p.$$eval('.grupo-lugar', ns => ns.map(n => n.textContent.replace(/\s+/g, ' ').trim()));
ok(grupos.length === 2 && /^QUINCHO|^Quincho/i.test(grupos[0]) && /4 aberturas/.test(grupos[0]) && /Baño/i.test(grupos[1]), 'lista agrupada por lugar con cantidad y subtotal: ' + grupos.join(' | '));
await p.locator('.grupo-lugar').first().evaluate(n => { n.scrollIntoView({ block: 'start' }); window.scrollBy(0, -140); });
await p.waitForTimeout(300);
await p.screenshot({ path: OUT + '/q1-lista.png' });

// rejas: redondo / cuadrado
await p.locator('.item').last().locator('.item__resumen').click();
ok((await p.$$eval(A + '[data-variante]', ns => ns.map(n => n.textContent))).join(',') === 'Redondo,Cuadrado', 'la reja pregunta Redondo / Cuadrado');
ok(await p.locator(A + '.elegible').count() === 0, 'la reja de hierro no pide línea ni color de aluminio');
await p.click(A + '[data-variante]:has-text("Cuadrado")');
await p.click(A + '[data-accion="listo"]');

// aplicar color a todas desde la primera
await p.locator('.item').first().locator('.item__resumen').click();
await centro(A + '.elegible[data-elegir="colorId"]');
await p.click(A + '.elegible[data-elegir="colorId"]');
ok(await p.isVisible('#opciones-todas'), 'la lista de colores ofrece cambiarlo en las otras');
ok(/otras 4 aberturas/.test(await p.textContent('#opciones-todas-texto')), 'cuenta solo las que llevan color (4, sin la reja): ' + await p.textContent('#opciones-todas-texto'));
await p.click('#opciones-todas');
await p.screenshot({ path: OUT + '/q2-todas.png' });
await p.click('.opcion:has-text("Negro")');
const colores = await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('alumfer.presupuestos.v1') || '[]'); return null; });
await p.waitForTimeout(1200);
const items = await p.evaluate(() => window.Almacenamiento.listar()[0].items.map(i => i.tipologiaId + ':' + i.colorId));
ok(items.filter(x => /:negro$/.test(x)).length === 5, 'quedan negras las 5 que llevan color: ' + items.join(', '));
// vidrio a todas
await p.click(A + '.variante--vidrio:has-text("Laminado")');
await centro(A + '[data-accion="vidrio-a-todas"]');
ok(/otras 4 aberturas/.test(await p.textContent(A + '[data-accion="vidrio-a-todas"]')), 'botón "Poner este vidrio en las otras 4 aberturas"');
await p.click(A + '[data-accion="vidrio-a-todas"]');
await p.waitForTimeout(1200);
const vidrios = await p.evaluate(() => window.Almacenamiento.listar()[0].items.map(i => i.vidrioId));
ok(vidrios.filter(v => v === 'lam33').length === 5, 'laminado en las 5 que llevan vidrio: ' + vidrios.join(', '));
ok(await p.locator(A + '[data-accion="vidrio-a-todas"]').count() === 0, 'después ya no ofrece el botón (todas iguales)');
ok(/afuera a afuera/.test(await p.textContent(A + '.item__ayuda-medida')), 'aclara que la medida es de afuera a afuera');
await p.click(A + '[data-accion="listo"]');

await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/quincho.pdf');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
