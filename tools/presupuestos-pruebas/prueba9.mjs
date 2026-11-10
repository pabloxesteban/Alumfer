import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, serviceWorkers: 'block', hasTouch: true, isMobile: true });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8777/');
const paso = () => p.evaluate(() => document.getElementById('vista-presupuesto').dataset.paso);
ok(await paso() === '1', 'arranca en el paso 1 (Cliente)');
ok(await p.isVisible('#btn-continuar') && await p.isHidden('#barra-total-monto'), 'paso 1: solo "Continuar" abajo');
ok(await p.isVisible('.barra__tabs .tab[data-vista="historial"]'), 'pestañas abajo visibles');
ok(await p.isHidden('#btn-agregar-item'), 'el paso 2 no se ve en el paso 1');
ok(/Vas 0 %/.test(await p.textContent('#avance-texto')), 'la barrita arranca en 0 %: ' + await p.textContent('#avance-texto'));
// Obligatorios del paso 1
await p.click('#btn-continuar');
ok(await paso() === '1' && await p.locator('#campo-cli-nombre.con-error').count() === 1 && /Falta el nombre/.test(await p.textContent('#err-cli-nombre')), 'sin nombre no avanza y marca el campo');
ok(await p.evaluate(() => document.activeElement.id) === 'cli-nombre', 'el cursor va al campo que falta');
await p.fill('#cli-nombre', 'Rosa Pérez');
ok(await p.locator('#campo-cli-nombre.con-error').count() === 0, 'al escribir se saca la marca roja');
ok(/Rosa Pérez/.test(await p.textContent('#subtitulo-vista')), 'el encabezado muestra el cliente: ' + await p.textContent('#subtitulo-vista'));
await p.click('#btn-continuar');
ok(await paso() === '1' && /Falta el teléfono/.test(await p.textContent('#err-cli-telefono')), 'sin teléfono no avanza');
await p.fill('#cli-telefono', '1234');
await p.click('#btn-continuar');
ok(await paso() === '1' && /incompleto/.test(await p.textContent('#err-cli-telefono')), 'un teléfono muy corto tampoco');
await p.click('#pasos [data-paso="3"]');
ok(await paso() === '1', 'tampoco se puede saltar al paso 3 desde el indicador');
await p.fill('#cli-telefono', '11 5555-1234');
ok(/Vas 33 %/.test(await p.textContent('#avance-texto')) && /agregar las aberturas/.test(await p.textContent('#avance-texto')), 'con nombre y teléfono la barrita va 33 % y dice qué falta: ' + await p.textContent('#avance-texto'));
await p.evaluate(() => document.activeElement.blur());
await p.click('#btn-continuar');
ok(await paso() === '2', 'Continuar → paso 2');
await p.click('#btn-continuar');
ok(await paso() === '2' && /Agregá al menos una abertura/.test(await p.textContent('#avisos')), 'sin aberturas no deja pasar al paso 3 y explica por qué');
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]'); await p.waitForTimeout(300);
ok(await p.isVisible('#barra-total-monto'), 'paso 2 con aberturas: total + Continuar');
// Medidas obligatorias
await p.locator('.item--abierto [data-campo="altoCm"]').fill('');
await p.click('.item--abierto [data-accion="listo"]');
ok(await p.locator('.item--abierto').count() === 1 && /Falta el alto/.test(await p.textContent('.item--abierto .campo__error:not([hidden])')) && await p.locator('.item--abierto .con-error [data-campo="altoCm"]').count() === 1 && (1), '"Listo" sin alto no cierra y marca el alto');
await p.locator('.item--abierto [data-campo="altoCm"]').fill('110');
await p.evaluate(() => document.activeElement.blur());
await p.click('.item--abierto [data-accion="listo"]');
// Otro trabajo sin precio frena el Continuar y se abre solo
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="libre"]'); await p.waitForTimeout(300);
await p.locator('.item--abierto [data-campo="descripcionLibre"]').fill('Retiro de las viejas');
await p.evaluate(() => document.activeElement.blur());
await p.click('#btn-continuar');
ok(await paso() === '2' && /Falta el precio/.test(await p.textContent('.item--abierto .con-error')), 'Continuar con un trabajo sin precio frena y lo marca');
await p.locator('.item--abierto [data-campo="precioLibre"]').fill('20000');
await p.evaluate(() => document.activeElement.blur());
await p.click('#btn-continuar');
ok(await paso() === '3' && await p.isVisible('#btn-whatsapp-fijo') && await p.isHidden('#btn-continuar') && await p.isVisible('#btn-pdf'), 'paso 3: total + WhatsApp abajo, PDF en la pantalla');
ok(await p.locator('#pasos [data-paso="1"].is-hecho').count() === 1 && await p.locator('#pasos [data-paso="3"][aria-current="step"]').count() === 1, 'el indicador marca hechos y actual');
await p.click('#pasos [data-paso="1"]');
ok(await paso() === '1', 'tocando el indicador se vuelve al paso 1');
// Medidas mínimas de toque (≥ 48 px; principales ≥ 56 px)
const chicos = await p.evaluate(() => {
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return [...document.querySelectorAll('button, input, select, textarea')].filter(vis)
    .filter(el => el.getBoundingClientRect().height < 44).map(el => (el.id || el.className || el.tagName) + ':' + Math.round(el.getBoundingClientRect().height));
});
ok(chicos.length === 0, 'ningún control visible mide menos de 44 px de alto' + (chicos.length ? ': ' + chicos.join(', ') : ''));
const alto = await p.evaluate(() => document.getElementById('btn-continuar').getBoundingClientRect().height);
ok(alto >= 56, 'Continuar mide ' + Math.round(alto) + ' px (≥ 56)');
// Guardar y enviar completan la barrita; el estado se pone solo
await p.click('#pasos [data-paso="3"]'); await p.click('#btn-guardar');
ok(/Vas 83 %/.test(await p.textContent('#avance-texto')) && /mandárselo al cliente/.test(await p.textContent('#avance-texto')), 'guardado: 83 % · falta mandarlo: ' + await p.textContent('#avance-texto'));
await p.evaluate(() => { window.open = () => null; });
await p.click('#btn-whatsapp');
await p.waitForTimeout(1500);
ok(/Listo/.test(await p.textContent('#avance-texto')) && await p.locator('#avance-pres.completo').count() === 1, 'enviado: la barrita llega al 100 %');
ok(await p.isHidden('#pre-estado') && /Más datos \(email, fecha\)/.test(await p.textContent('summary >> nth=0')), 'el estado ya no se elige a mano');
// Guardados: sin barra de abajo
await p.click('.tab[data-vista="historial"]');
ok(await p.isHidden('#barra-total') && /Guardados/.test(await p.textContent('#titulo-vista')), 'en Guardados no está la barra del total y el título cambia');
ok(/Enviado hoy/.test(await p.textContent('#lista-historial')), 'en Guardados el estado dice "Enviado hoy" solo');
await p.click('.historial-fila [data-accion="abrir"]');
ok(await paso() === '2', 'un presupuesto guardado se abre en el paso 2 (sus aberturas)');
ok(await p.isVisible('#pregunta-acepto') && /¿Rosa aceptó/.test(await p.textContent('#pregunta-acepto')), 'al reabrir uno enviado pregunta "¿Rosa aceptó este presupuesto?"');
await p.click('#pregunta-acepto [data-respuesta="aceptado"]');
ok(await p.isHidden('#pregunta-acepto'), 'al contestar, la pregunta se va');
await p.click('.tab[data-vista="historial"]');
ok(/Aceptó/.test(await p.textContent('#lista-historial')), 'y en Guardados queda "Aceptó"');
await p.click('.historial-fila [data-accion="abrir"]');
p.once('dialog', d => d.accept());
await p.click('#btn-nuevo');
ok(await paso() === '1', 'Nuevo vuelve al paso 1');
// Sin desborde horizontal en un teléfono angosto
const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok(desborde <= 0, 'sin scroll horizontal en 360 px');
// Nada cortado en la barra de abajo ni en el total del paso 3
await p.fill('#cli-nombre', 'Rosa'); await p.fill('#cli-telefono', '11 4444-5555'); await p.evaluate(() => document.activeElement.blur());
await p.click('#btn-continuar'); await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]');
await p.locator('.item--abierto [data-campo="cantidad"]').fill('9'); await p.evaluate(() => document.activeElement.blur());
await p.click('.item--abierto [data-accion="listo"]'); await p.click('#btn-continuar');
const cortados = await p.evaluate(() => [...document.querySelectorAll('#barra-total > *:not([hidden]), .totales__fila--total span')]
  .filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > window.innerWidth + 1 || r.left < -1); })
  .map(el => el.id || el.className || el.textContent));
ok(cortados.length === 0, 'paso 3 en 360 px: nada se sale de la pantalla' + (cortados.length ? ': ' + cortados.join(', ') : ''));
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await p.screenshot({ path: OUT + '/z-360.png' });
await b.close();
