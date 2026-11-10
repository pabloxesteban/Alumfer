import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { conPasos } from './pasos.mjs';
import { execSync } from 'child_process';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', acceptDownloads: true });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
await ctx.addInitScript(() => {
  window.__abiertos = []; window.open = (u) => { window.__abiertos.push(u); return null; };
  window.__compartido = []; navigator.canShare = () => true;
  navigator.share = (d) => { window.__compartido.push({ title: d.title, files: (d.files || []).map(f => f.name + '|' + f.type + '|' + f.size) }); return Promise.resolve(); };
});
const p = conPasos(await ctx.newPage());
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8777/');
const A = '.item--abierto ';
const centro = async (sel) => { await p.locator(sel).first().evaluate(n => n.scrollIntoView({ block: 'center' })); await p.waitForTimeout(120); };
async function presupuesto(nombre, tel, tipo) {
  page_nuevo: {
    if (await p.locator('.item').count()) { p.once('dialog', d => d.accept()); await p.click('#btn-nuevo'); await p.waitForTimeout(300); }
  }
  await p.fill('#cli-nombre', nombre); await p.fill('#cli-telefono', tel);
  await p.click('#btn-agregar-item'); await p.click(`.tipo-tile[data-tipo="${tipo}"]`); await p.waitForTimeout(400);
  await centro(A + '[data-accion="listo"]'); await p.click(A + '[data-accion="listo"]');
}

ok((await p.textContent('.tab[data-vista="historial"]')).includes('Guardados'), 'la pestaña se llama Guardados');
await presupuesto('María Gómez', '11 5555-1234', 'vent-corr-2');
await centro('#btn-guardar'); await p.click('#btn-guardar');
const conf = await p.textContent('#confirmacion-guardado');
ok(/Guardado como P-\d{4}-0001/.test(conf) && /Guardados/.test(conf) && /María/.test(conf), 'confirmación: ' + conf.replace(/\s+/g, ' '));
await p.screenshot({ path: OUT + '/g1-guardado.png' });

// ganancia sin costos
ok(/cargá tus costos/.test(await p.textContent('#ganancia-resumen')) && !/\$/.test(await p.textContent('#ganancia-resumen')), 'sin costos no muestra una ganancia engañosa: pide cargarlos');

// enviar (marca enviado y fecha)
await centro('#btn-whatsapp'); await p.click('#btn-whatsapp'); await p.waitForTimeout(500);
await presupuesto('Juan Pérez', '11 4444-9999', 'puerta-abrir');
await centro('#btn-guardar'); await p.click('#btn-guardar');
await presupuesto('Ana Ruiz', '11 3333-1111', 'pano-fijo');
await centro('#btn-guardar'); await p.click('#btn-guardar');
ok(await p.isVisible('#aviso-copia'), 'con 3 presupuestos y sin copia aparece el aviso de copia');

// Simular que el de María se mandó hace 5 días
await p.evaluate(() => {
  const k = 'alumfer.presupuestos.v1'; const l = JSON.parse(localStorage.getItem(k));
  l.forEach(x => { if (x.cliente.nombre === 'María Gómez') x.enviadoEl = new Date(Date.now() - 5 * 86400000).toISOString(); });
  localStorage.setItem(k, JSON.stringify(l));
});
await p.click('.tab[data-vista="historial"]');
await p.waitForTimeout(300);
ok(await p.isVisible('#tarjeta-llamar') && /María Gómez/.test(await p.textContent('#lista-llamar')), '"Para volver a llamar" muestra a María (enviado hace 5 días)');
ok(!/Juan/.test(await p.textContent('#lista-llamar')), 'no muestra los que no se enviaron');
ok(await p.isVisible('#alerta-historial'), 'la pestaña Guardados tiene el punto de aviso');
ok(/hace 5 días/.test(await p.textContent('#lista-llamar')), 'dice hace cuántos días se mandó');
await p.screenshot({ path: OUT + '/g2-llamar.png' });
await p.click('#lista-llamar [data-accion="seguir"]');
const wa = decodeURIComponent((await p.evaluate(() => window.__abiertos.pop())).split('text=')[1]);
const waUrl = await p.evaluate(() => 1);
ok(/Hola María/.test(wa) && /¿Pudiste verlo\?/.test(wa) && /P-\d{4}-0001/.test(wa), 'mensaje de seguimiento: ' + wa.slice(0, 90));
ok(await p.isHidden('#tarjeta-llamar'), 'después de escribirle deja de aparecer (hasta que pasen los días de nuevo)');

// búsqueda
await p.fill('#buscar-historial', 'juan');
ok(await p.locator('#lista-historial .historial-fila').count() === 1, 'buscar por nombre');
await p.fill('#buscar-historial', '0003');
ok(/Ana Ruiz/.test(await p.textContent('#lista-historial')), 'buscar por número');
await p.fill('#buscar-historial', '3333');
ok(/Ana Ruiz/.test(await p.textContent('#lista-historial')), 'buscar por teléfono');
await p.fill('#buscar-historial', '');

// aceptado -> resumen del mes
await p.evaluate(() => {
  const k = 'alumfer.presupuestos.v1'; const l = JSON.parse(localStorage.getItem(k));
  l.forEach(x => { if (x.cliente.nombre === 'María Gómez') { x.ultimoSeguimiento = new Date(Date.now() - 5 * 86400000).toISOString(); } });
  localStorage.setItem(k, JSON.stringify(l));
});
await p.click('.tab[data-vista="presupuesto"]'); await p.click('.tab[data-vista="historial"]');
await p.click('#lista-llamar [data-accion="acepto"]');
const mes = await p.textContent('#mes-datos');
ok(/3\s*presupuestos/.test(mes) && /1\s*aceptado/.test(mes) && /cargá tus costos/.test(mes), 'resumen del mes (sin costos, sin ganancia engañosa): ' + mes.replace(/\s+/g, ' '));
await p.screenshot({ path: OUT + '/g3-mes.png' });

// copia de seguridad
await p.click('#btn-exportar');
await p.waitForTimeout(200);
const comp = await p.evaluate(() => window.__compartido.pop());
ok(comp && /Copia presupuestos Alumfer .*\.json\|application\/json\|\d+/.test(comp.files[0]), 'la copia se comparte como archivo: ' + (comp && comp.files[0]));
ok(await p.isHidden('#aviso-copia') && /Última copia/.test(await p.textContent('#copia-ultima')), 'después de la copia se va el aviso y dice cuándo fue');

// costos -> ganancia real, sin marcar precios viejos
await p.click('.tab[data-vista="precios"]');
await p.fill('#alu-precio', '6'); await p.waitForTimeout(900);
await p.locator('#tabla-lineas .fila-precio:has(input[value="Herrero"]) [data-campo="kgMetro"]').fill('0.9');
await p.locator('#tabla-vidrios .fila-precio:has(input[value="Simple 4 mm"]) [data-campo="costoM2"]').fill('20000');
await p.fill('#gen-herrajes', '15000'); await p.fill('#gen-mano-obra', '40000');
await p.click('.tab[data-vista="historial"]');
await p.locator('.historial-fila:has-text("Ana Ruiz") [data-accion="abrir"]').click();
await p.waitForTimeout(300);
ok(await p.locator('#btn-actualizar-precios-pres').count() === 0, 'cargar costos no marca el presupuesto como "precios viejos"');
const gTxt = await p.textContent('#ganancia-resumen');
ok(!/Faltan costos/.test(gTxt), 'con los costos cargados la ganancia es completa: ' + gTxt.replace(/\s+/g, ' ').slice(0, 80));
await centro('#btn-compras'); await p.click('#btn-compras');
const det = await p.textContent('#compras-cuerpo');
ok(/Cobrás \(sin IVA\)/.test(det) && /Aluminio/.test(det) && /Mano de obra/.test(det) && /Te queda/.test(det), 'detalle de la ganancia en la pantalla interna');
await p.screenshot({ path: OUT + '/g4-ganancia.png' });
await p.click('#btn-cerrar-compras');

// Nada de ganancia al cliente
await p.waitForTimeout(1000);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/cliente2.pdf');
const pdf = execSync(`pdftotext -layout ${OUT}/cliente2.pdf -`).toString();
ok(!/ganancia|te queda|costo|mano de obra/i.test(pdf), 'el PDF del cliente no dice nada de ganancia ni costos');
await p.click('summary:has-text("Otras formas")'); await p.click('#btn-whatsapp-texto');
const wa2 = decodeURIComponent((await p.evaluate(() => window.__abiertos.pop())).split('text=')[1]);
ok(!/ganancia|te queda|costo/i.test(wa2), 'el WhatsApp del cliente tampoco');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
