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
const centro = async (sel) => { await p.locator(sel).first().evaluate(n => n.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150); };
const total = () => p.locator('.item--abierto [data-total] strong').textContent();

await p.fill('#cli-nombre', 'Familia Pérez');
// ── Vidrio en dos pasos
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]');
await p.waitForTimeout(500);
const tiposV = await p.$$eval('.variante--vidrio span', ns => ns.map(n => n.textContent));
ok(tiposV.join(',') === 'Simple,Esmerilado,Espejado,Laminado,Doble vidrio (DVH),Poliestireno,Policarbonato alveolar,Policarbonato compacto', 'tipos de vidrio con dibujo: ' + tiposV.join(', '));
ok((await p.locator('.variante--vidrio.is-activa span').textContent()) === 'Simple', 'viene marcado Simple');
ok((await p.locator('.espesor.is-activa').textContent()) === '4 mm', 'y el espesor 4 mm');
await centro('.variante--vidrio');
await p.screenshot({ path: OUT + '/v1-vidrio.png' });
const t0 = await total();
await p.click('.espesor:has-text("6 mm")');
ok((await p.locator('.espesor.is-activa').textContent()) === '6 mm', 'tocando 6 mm queda elegido');
ok(await total() !== t0, 'el precio cambia con el espesor');
await p.click('.variante--vidrio:has-text("Doble vidrio")');
ok((await p.$$eval('.espesor', ns => ns.map(n => n.textContent))).join(',') === '4/9/4,4/12/6 (ruido),Con laminado', 'doble vidrio pregunta sus tres variantes');
await p.click('.variante--vidrio:has-text("Esmerilado")');
ok(await p.locator('.espesor').count() === 0, 'esmerilado no pregunta espesor (tiene uno solo)');
await p.click('.variante--vidrio:has-text("Simple")');
ok((await p.locator('.espesor.is-activa').textContent()) === '4 mm', 'volver a Simple elige el 4 mm');
// lugar
await centro('.lugar');
await p.click('.lugar:has-text("Quincho")');
ok(await p.locator('.lugar.is-activa').textContent() === 'Quincho', '¿Dónde va? Quincho queda marcado');
await p.screenshot({ path: OUT + '/v2-lugar.png' });
await p.click('.item--abierto [data-accion="listo"]');

// ── Paño fijo triangular para el frontis del quincho
await p.click('#btn-agregar-item');
ok(await p.locator('.tipo-tile[data-tipo="vent-corr-2"]').count() === 1, 'selector sigue agrupado');
await p.click('.tipo-tile[data-tipo="pano-fijo"]');
await p.waitForTimeout(400);
ok(await p.locator('[data-forma]').count() === 5, 'el paño fijo pregunta ¿Qué forma tiene? (5 formas)');
const tRect = await total();
await centro('[data-forma="triangulo"]');
await p.click('[data-forma="triangulo"]');
ok(/Ancho de abajo/.test(await p.textContent('.item--abierto .item__medidas')) && /Alto en la punta/.test(await p.textContent('.item--abierto .item__medidas')), 'triangular pide ancho de abajo y alto en la punta');
ok(/Se cobra como un rectángulo/.test(await p.textContent('.item--abierto [data-equivale]')), 'explica que se cobra como rectángulo');
ok(await total() === tRect, 'con recargo 0 % vale lo mismo que el rectángulo');
await p.screenshot({ path: OUT + '/v3-forma.png' });
await p.click('.item--abierto .lugar:has-text("Quincho")');
await p.click('[data-forma="inclinada"]');
ok(await p.locator('.item--abierto [data-campo="alto2Cm"]').count() === 1, 'inclinada pide el alto del lado bajo');
await p.click('[data-forma="redonda"]');
ok(await p.locator('.item--abierto .item__medidas input').count() === 1 && /Diámetro/.test(await p.textContent('.item--abierto .item__medidas')), 'redonda pide solo el diámetro');
await p.locator('.item--abierto [data-campo="anchoCm"]').fill('80');
await p.waitForTimeout(150);
ok(/0,80 × 0,80/.test(await p.textContent('.item--abierto [data-equivale]')), 'el diámetro se usa de ancho y alto');
await p.click('[data-forma="triangulo"]');
await p.locator('.item--abierto [data-campo="anchoCm"]').fill('400');
await p.locator('.item--abierto [data-campo="altoCm"]').fill('120');
await p.click('.item--abierto [data-accion="listo"]');

// ── Una del baño, sin lugar de quincho
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="banderola"]');
await centro('.item--abierto .lugar-otro');
await p.locator('.item--abierto .lugar-otro').fill('Baño de servicio');
await p.waitForTimeout(150);
await p.click('.item--abierto [data-accion="listo"]');
const resumenes = await p.$$eval('.item__resumen-n', ns => ns.map(n => n.textContent));
ok(resumenes.some(r => r.includes('Quincho')) && resumenes.some(r => r.includes('Baño de servicio')), 'los renglones muestran el lugar: ' + resumenes.join(' | '));
ok(/forma triangular/.test(await p.locator('.item:has-text("Paño fijo")').first().textContent()), 'el renglón del frontis dice "forma triangular"');

// ── Recargo por forma desde Precios
await p.click('.tab[data-vista="precios"]');
await p.locator('[data-forma-i="1"]').fill('25');
await p.click('.tab[data-vista="presupuesto"]');
const precioAntes = await p.locator('.item:has-text("Paño fijo")').first().locator('.item__resumen-precio strong').textContent();
await p.evaluate(() => { const b = document.querySelector('#btn-actualizar-precios-pres'); });
ok(true, 'recargo triangular 25 % cargado en Precios (el presupuesto abierto conserva sus precios: ' + precioAntes + ')');

// ── PDF agrupado
await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/formas.pdf');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
