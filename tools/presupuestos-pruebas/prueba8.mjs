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
await p.fill('#cli-nombre', 'Laura Díaz');

// Abertura con precio a mano
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]'); await p.waitForTimeout(400);
const calc = await p.textContent(A + '[data-total] strong');
await centro(A + 'summary:has-text("Precio a mano")'); await p.click(A + 'summary:has-text("Precio a mano")');
await p.locator(A + '[data-campo="precioManual"]').fill('400000'); await p.waitForTimeout(200);
ok((await p.textContent(A + '[data-total] strong')).includes('400.000'), 'el precio a mano reemplaza al calculado (' + calc + ' → $ 400.000)');
ok(/el calculado era/.test(await p.textContent(A + '[data-total]')), 'muestra cuál era el calculado');
await p.screenshot({ path: OUT + '/x1-manual.png' });
await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');
ok(/Precio a mano/.test(await p.locator('.item').first().textContent()), 'el renglón avisa "Precio a mano"');

// Otro trabajo por unidad
await p.click('#btn-agregar-item');
ok(await p.locator('.tipo-tile[data-tipo="libre"]').count() === 1, 'el selector ofrece "Otro trabajo"');
await p.click('.tipo-tile[data-tipo="libre"]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.campo === 'descripcionLibre'), 'el cursor queda en "¿Qué es?"');
await p.locator(A + '[data-campo="descripcionLibre"]').fill('Retiro de las aberturas viejas');
ok(/Poné el precio/.test(await p.textContent(A + '[data-total]')), 'sin precio avisa "Poné el precio"');
await p.locator(A + '[data-campo="precioLibre"]').fill('20000');
await p.click(A + '[data-accion="mas"]'); await p.click(A + '[data-accion="mas"]');
await p.waitForTimeout(200);
ok(/3 ×\s\$\s20\.000/.test(await p.textContent(A + '[data-total]')) && (await p.textContent(A + '[data-total] strong')).includes('60.000'), 'otro trabajo: 3 × $ 20.000 = $ 60.000');
ok(await p.locator(A + '.elegible').count() === 0 && await p.locator(A + '.variante--vidrio').count() === 0, 'no pide línea, color ni vidrio');
await centro(A + 'summary:has-text("Lo que te cuesta")'); await p.click(A + 'summary:has-text("Lo que te cuesta")');
await p.locator(A + '[data-campo="costoLibre"]').fill('5000');
await p.screenshot({ path: OUT + '/x2-libre.png' });
await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');

// Otro trabajo por m²
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="libre"]'); await p.waitForTimeout(300);
await p.locator(A + '[data-campo="descripcionLibre"]').fill('Vidrio para mesa');
await p.click(A + '[data-modo-libre="m2"]');
await p.locator(A + '[data-campo="anchoCm"]').fill('120'); await p.locator(A + '[data-campo="altoCm"]').fill('80');
await p.locator(A + '[data-campo="precioLibre"]').fill('80000'); await p.waitForTimeout(200);
ok((await p.textContent(A + '[data-total] strong')).includes('76.800'), 'por m²: 1,20 × 0,80 m × $ 80.000 = $ 76.800');
await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');
const cods = await p.$$eval('.item .codigo', ns => ns.map(n => n.textContent));
ok(cods.join(' ') === 'V1 O1 O2', 'códigos: ' + cods.join(' '));
ok(/Retiro de las aberturas viejas/.test(await p.textContent('#lista-items')), 'el renglón muestra lo que se escribió');

// Aplicar a todas no cuenta los otros trabajos
await p.locator('.item').first().locator('.item__resumen').click();
await centro(A + '.elegible[data-elegir="colorId"]'); await p.click(A + '.elegible[data-elegir="colorId"]');
ok(await p.isHidden('#opciones-todas'), '"cambiarlo en las otras" no aparece (las otras son otros trabajos)');
await p.click('#btn-cerrar-opciones');
await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');

// PDF
await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/libre.pdf');
const pdf = execSync(`pdftotext -layout ${OUT}/libre.pdf -`).toString();
ok(/O1\s+Retiro de las aberturas viejas\s+—\s+3\s+\$ 20\.000\s+\$ 60\.000/.test(pdf), 'PDF: O1 Retiro … — 3 $ 20.000 $ 60.000');
ok(/V1[\s\S]*\$ 400\.000/.test(pdf) && !/a mano|calculado/i.test(pdf), 'PDF: la ventana con $ 400.000 y sin decir que es a mano');
ok(/Vidrio para mesa\s+1,20 × 0,80 m/.test(pdf), 'PDF: el vidrio para mesa con su medida');

// Ganancia considera el costo del otro trabajo y no suma herrajes por él
const gan = await p.evaluate(() => {
  const pr = window.Almacenamiento.listar()[0];
  const P = pr.precios; P.generales.costoHerrajes = 1000; P.generales.costoManoObra = 0;
  return window.Materiales.ganancia(pr, P, 0);
});
ok(gan.costos.comprado === 15000 && gan.costos.herrajes === 1000, 'ganancia: otro trabajo suma su costo (3 × 5.000) y no cuenta herrajes (solo la ventana)');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
