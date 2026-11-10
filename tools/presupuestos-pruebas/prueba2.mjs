import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { conPasos } from './pasos.mjs';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, serviceWorkers: 'block', acceptDownloads: true });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450 } }));
// Teléfono con precios guardados de antes (nombres viejos y un nombre puesto a mano)
await ctx.addInitScript(() => {
  if (sessionStorage.getItem('sembrado')) return;
  sessionStorage.setItem('sembrado', '1');
  const p = JSON.parse(JSON.stringify(window.PRECIOS_BASE || {}));
  localStorage.setItem('alumfer.precios.v1', JSON.stringify({
    vidrios: [{ id: 'sin', nombre: 'Sin vidrio', precioM2: 0 },
              { id: 'float4', nombre: 'Float 4 mm', precioM2: 50000, ayuda: 'el más usado' },
              { id: 'dvh494', nombre: 'Mi DVH especial', precioM2: 170000 }]
  }));
});
const p = conPasos(await ctx.newPage());
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8777/');
const vid = await p.evaluate(() => window.Almacenamiento.cargarPrecios().vidrios.map(v => v.nombre + '=' + v.precioM2));
ok(vid.includes('Simple 4 mm=50000'), 'migración: "Float 4 mm" guardado pasa a "Simple 4 mm" sin tocar el precio');
ok(vid.includes('Mi DVH especial=170000'), 'migración: un nombre puesto a mano se respeta');
await p.click('#pasos [data-paso="3"]');
ok(await p.evaluate(() => document.getElementById('vista-presupuesto').dataset.paso) !== '3' && /Falta|al menos una abertura/.test(await p.textContent('#avisos')),
   'sin datos ni aberturas no deja ir al paso 3 y explica por qué');

await p.fill('#cli-nombre', 'Ana Ruiz');
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]');
ok(await p.isVisible('#entrega'), 'con una abertura aparece el total y los botones');
ok((await p.textContent('#btn-agregar-item')).includes('Agregar otra abertura'), 'el botón pasa a decir "Agregar otra abertura"');
await p.click('.item__resumen');   // .18: la abertura se edita en su propia pantalla
const desc0 = await p.textContent('.variante--vidrio.is-activa');
ok(/Simple/.test(desc0), 'el vidrio por defecto es Simple');

// hojas: un solo "Ventana corrediza" en el selector y la pregunta en la ficha
ok(/Ventana corrediza/.test(await p.textContent('.item__nombre strong')), 'la ficha dice "Ventana corrediza" (sin "2 hojas" en el título)');
ok(await p.locator('[data-variante]').count() === 3, 'pregunta ¿Cuántas hojas? con 3 botones');
ok(await p.locator('[data-variante].is-activa').textContent() === '2 hojas', 'viene marcada 2 hojas');
const precio2 = await p.textContent('.item [data-total] strong');
await p.click('[data-variante]:has-text("3 hojas")');
ok(await p.locator('[data-variante].is-activa').textContent() === '3 hojas', 'tocando 3 hojas queda elegida');
const tip3 = await p.evaluate(() => window.Almacenamiento.listar()[0] ? null : null);
ok(await p.textContent('.item [data-total] strong') !== precio2, 'el precio cambia con las hojas');
await p.click('[data-variante]:has-text("2 hojas")');
await p.click('#btn-agregar-item');
const nombresTiles = await p.$$eval('#grilla-tipos .tipo-tile span', ns => ns.map(n => n.textContent));
ok(nombresTiles.filter(n => /Ventana corrediza/.test(n)).length === 1 && !nombresTiles.some(n => /3 hojas|4 hojas/.test(n)),
   'en el selector hay un solo "Ventana corrediza" (' + nombresTiles.length + ' dibujos en total)');
await p.click('#btn-cerrar-modal');
await p.click('.item__resumen');

// cantidad con + y −
const tot1 = await p.textContent('.item [data-total] strong');
await p.click('.item [data-accion="mas"]'); await p.click('.item [data-accion="mas"]');
ok(await p.inputValue('.item [data-campo="cantidad"]') === '3', 'con + dos veces la cantidad queda en 3');
await p.click('.item [data-accion="menos"]');
ok(await p.inputValue('.item [data-campo="cantidad"]') === '2', 'con − baja a 2');
for (let i = 0; i < 4; i++) await p.click('.item [data-accion="menos"]');
ok(await p.inputValue('.item [data-campo="cantidad"]') === '1', 'nunca baja de 1');
await p.click('.item [data-accion="mas"]');

// vidrio: tipos con dibujo (el teléfono tiene guardados solo Simple 4 y Mi DVH especial)
const tiposV = await p.$$eval('.variante--vidrio span', ns => ns.map(n => n.textContent));
ok(!tiposV.some(o => /Float|Sin vidrio/.test(o)), 'los tipos de vidrio no dicen "Float" ni "Sin vidrio": ' + tiposV.join(', '));
await p.click('.variante--vidrio:has-text("Doble vidrio")');
ok((await p.locator('.variante--vidrio.is-activa span').textContent()) === 'Doble vidrio (DVH)', 'el DVH renombrado a mano sigue dentro de "Doble vidrio" y se elige');
const tot2 = await p.textContent('.item [data-total] strong');
ok(tot1 !== tot2, `el precio se recalcula (${tot1} → ${tot2})`);

// color con muestra
await p.click('.elegible[data-elegir="colorId"]');
ok(await p.locator('#opciones-lista .muestra').count() >= 5, 'los colores muestran su muestra de color');
await p.screenshot({ path: OUT + '/lista-colores.png' });
await p.click('.opcion:has-text("Blanco")');

// agregado con tilde
await p.click('.extra:has-text("Mosquitero")');
ok(await p.locator('.extra:has-text("Mosquitero")').evaluate(n => n.classList.contains('is-activo')), 'el agregado Mosquitero queda tildado');

// banderola chica: mínimo
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="banderola"]');
const it2 = p.locator('.item--abierto');   // .18: la que se edita ocupa la pantalla
await it2.locator('[data-campo="anchoCm"]').fill('50'); await it2.locator('[data-campo="altoCm"]').fill('40');
ok(/se cobra el mínimo/.test(await it2.locator('[data-equivale]').textContent()), 'una abertura chica explica que se cobra el mínimo');

await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/rediseno.pdf');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
