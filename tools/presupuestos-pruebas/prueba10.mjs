// .18 "Hormigón guiado": letra propia, abertura a pantalla completa, hoja del vidrio,
// "Deshacer" al quitar, "Guardado" fijo, un aviso por vez, contrastes, 360 px y compu.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT = process.argv[2];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const nuevo = async (w, h, movil) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, serviceWorkers: 'block', hasTouch: !!movil, isMobile: !!movil });
  await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450, fechaActualizacion: new Date().toISOString() } }));
  const p = await ctx.newPage(); p.errores = []; p.on('pageerror', e => p.errores.push(e.message));
  await p.goto('http://localhost:8777/'); await p.waitForSelector('#btn-continuar');
  return p;
};
const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

const p = await nuevo(360, 740, true);
const pantallas = [];
const anotar = async n => { if (!(await sinDesborde(p))) pantallas.push(n); };

// Letra propia, servida desde la app (sin Google) y lista para usar
await p.evaluate(() => document.fonts.ready);
ok(await p.evaluate(() => document.fonts.check('18px Inter') && document.fonts.check('22px Newsreader')), 'Inter y Newsreader cargan desde la app');
ok(await p.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"], script[src]')].every(n => !/^https?:/.test(n.getAttribute('href') || n.getAttribute('src') || ''))), 'no se pide nada a otro servidor');
ok(await p.evaluate(() => getComputedStyle(document.querySelector('.tarjeta__header h2')).fontFamily.includes('Newsreader') && getComputedStyle(document.body).fontFamily.includes('Inter')), 'las preguntas van en Newsreader y el resto en Inter');
ok(await p.evaluate(() => getComputedStyle(document.getElementById('barra-total-valor')).fontVariantNumeric.includes('tabular-nums')), 'el total usa cifras tabulares');
ok(await p.isHidden('#estado-guardado'), 'presupuesto vacío: todavía no dice "Guardado"');
await anotar('paso 1');

await p.fill('#cli-nombre', 'Rosa Pérez'); await p.fill('#cli-telefono', '11 5555-1234');
ok(/Guardando/.test(await p.textContent('#estado-guardado')), 'mientras espera para guardar dice "Guardando…"');
await p.waitForTimeout(1300);
ok(/^Guardado \d\d:\d\d$/.test((await p.textContent('#estado-guardado')).trim()), 'y después "Guardado" con la hora');
await p.evaluate(() => document.activeElement.blur());
await p.click('#btn-continuar'); await anotar('paso 2 vacío');
await p.click('#btn-agregar-item'); await anotar('selector de tipos');
await p.click('.tipo-tile[data-tipo="vent-corr-2"]'); await p.waitForTimeout(250); await anotar('abertura');

// Cada bloque de la abertura es una tarjeta con una pregunta
const preguntas = await p.$$eval('.item--abierto .bloque__q, .item--abierto .bloque > .campo > span:first-child', ns => ns.map(n => n.textContent.trim()));
ok(['¿Cuántas hojas?', '¿Qué medidas tiene?', '¿Cuántas iguales?', '¿Cómo es?', '¿Lleva algo más?'].every(q => preguntas.includes(q)), 'la abertura pregunta en orden: ' + preguntas.join(' · '));
ok(await p.evaluate(() => scrollY === 0), 'la abertura abre desde arriba');
const alto = await p.evaluate(() => document.documentElement.scrollHeight);
ok(alto < 2200, 'la pantalla de una ventana mide ' + alto + ' px (antes 3.100)');
const chicos = await p.evaluate(() => [...document.querySelectorAll('.item--abierto button, .item--abierto input:not([type=checkbox]), .item--abierto .extra, #btn-atras')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 44; }).map(e => (e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height)));
ok(chicos.length === 0, 'en la abertura todo lo que se toca mide 44 px o más' + (chicos.length ? ': ' + chicos.join(', ') : ''));

// Vidrio: un renglón que abre la hoja con los dibujos
ok(/Simple 4 mm/.test(await p.textContent('.item--abierto [data-abrir-vidrio]')) && await p.isHidden('.variante--vidrio >> nth=0'), 'el vidrio es un renglón: "Simple 4 mm · Cambiar"');
const precioAntes = await p.textContent('.item--abierto [data-total] strong');
await p.click('.item--abierto [data-abrir-vidrio]'); await p.waitForTimeout(350); await anotar('hoja del vidrio');
ok(await p.isVisible('.variante--vidrio >> nth=0') && await p.locator('.variante--vidrio').count() >= 6, 'la hoja muestra los tipos de vidrio con dibujo');
await p.click('.variante--vidrio[data-vidrio^="dvh"]'); await p.waitForTimeout(200);
ok(await p.isVisible('[data-hoja-vidrio] .espesores') && await p.isVisible('[data-hoja-vidrio] .variante--vidrio.is-activa'), 'al elegir un tipo la hoja sigue abierta y pregunta cuál');
await p.screenshot({ path: OUT + '/v18-vidrio-360.png' });
await p.click('[data-accion="cerrar-vidrio"]'); await p.waitForTimeout(200);
ok(await p.locator('[data-hoja-vidrio]:not([hidden])').count() === 0 && /Doble vidrio/.test(await p.textContent('.item--abierto [data-abrir-vidrio]')), '"Listo" cierra la hoja y el renglón dice el vidrio nuevo');
ok(await p.textContent('.item--abierto [data-total] strong') !== precioAntes, 'el precio cambió con el vidrio');
await p.click('.item--abierto [data-abrir-vidrio]'); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
ok(await p.locator('[data-hoja-vidrio]:not([hidden])').count() === 0, 'la hoja también se cierra con Escape');
await p.screenshot({ path: OUT + '/v18-abertura-360.png' });

await p.click('.item--abierto [data-accion="listo"]'); await p.waitForTimeout(250); await anotar('lista');
ok(await p.locator('#avisos .aviso').count() === 1, 'un solo aviso por vez');
const renglon = (await p.textContent('.item__resumen')).replace(/\s+/g, ' ');
ok(/Ventana corrediza 2 hojas/.test(renglon) && /1,50 × 1,10 m/.test(renglon) && !/Herrero|blanco|Doble vidrio/i.test(renglon), 'el renglón es corto: qué es, medida y precio');

// Quitar con "Deshacer"
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="pano-fijo"]'); await p.waitForTimeout(200);
let dialogos = 0; p.on('dialog', d => { dialogos++; d.accept(); });
await p.click('.item--abierto [data-accion="borrar"]'); await p.waitForTimeout(200);
ok(dialogos === 0 && await p.locator('.item').count() === 1 && /PF1 quitada/.test(await p.textContent('#avisos')), 'quitar no abre una ventana de "¿Seguro?": avisa y ofrece Deshacer');
await p.click('#avisos .aviso__accion'); await p.waitForTimeout(200);
ok(await p.locator('.item').count() === 2 && /Paño fijo/.test(await p.textContent('#lista-items')), '"Deshacer" la devuelve a la lista');
await p.screenshot({ path: OUT + '/v18-lista-360.png' });

await p.click('#btn-continuar'); await p.waitForTimeout(250); await anotar('paso 3');
ok(/Lo que le llega a Rosa/.test(await p.textContent('#resumen-titulo')) && /¿Cómo se lo mandás\?/.test(await p.textContent('[data-paso-seccion="3"] h2')), 'paso 3: primero cómo se manda, después "Lo que le llega a Rosa"');
await p.waitForTimeout(1200);   // deja pasar el guardado automático
const total = await p.textContent('#barra-total-valor');
ok(total.trim() === (await p.textContent('.totales__fila--total span:last-child')).trim() && total.trim() === await p.evaluate(() => { const pr = window.Almacenamiento.listar()[0]; return window.Formato.moneda(window.Calculo.calcularPresupuesto(pr, pr.precios).total); }),
   'el total de la franja = el del resumen = el del motor: ' + total);
await p.screenshot({ path: OUT + '/v18-enviar-360.png', fullPage: true });
await p.click('.tab[data-vista="historial"]'); await p.waitForTimeout(200); await anotar('Guardados');
ok(await p.locator('.historial-fila__abrir').count() === 1 && await p.isVisible('.historial-fila [data-accion="duplicar"]'), 'Guardados: el renglón entero abre; Repetir y Borrar quedan como texto');
await p.screenshot({ path: OUT + '/v18-guardados-360.png', fullPage: true });
await p.click('.tab[data-vista="precios"]'); await anotar('Precios');
await p.click('[data-abrir="aberturas"]'); await anotar('Precios · Aberturas');
ok(pantallas.length === 0, 'ninguna pantalla se sale de 360 px' + (pantallas.length ? ': ' + pantallas.join(', ') : ''));
ok(p.errores.length === 0, 'sin errores de JavaScript' + (p.errores.length ? ': ' + p.errores[0] : ''));

// Contrastes de la paleta (WCAG 2.2 AA: 4,5:1 el texto, 3:1 los bordes de lo que se toca)
const cr = await p.evaluate(() => {
  const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const r = (a, b) => { const [x, y] = [lum(v(a)), lum(v(b))].sort((m, n) => n - m); return (x + .05) / (y + .05); };
  return { tinta2: r('--tinta-2', '--papel'), azul: r('--azul', '--sup'), blancoAzul: r('--sup', '--azul'), claroAzul: r('--azul-claro', '--azul'), verde: r('--sup', '--verde'), cobre: r('--cobre', '--sup'), rojo: r('--rojo', '--sup'), borde: r('--borde', '--sup') };
});
const bajos = Object.entries(cr).filter(([k, x]) => x < (k === 'borde' ? 3 : 4.5)).map(([k, x]) => k + ' ' + x.toFixed(1));
ok(bajos.length === 0, 'contrastes: texto ≥ 4,5:1 y bordes ≥ 3:1 (' + Object.entries(cr).map(([k, x]) => k + ' ' + x.toFixed(1)).join(', ') + ')');
await p.context().close();

// Compu: pestañas al costado y, en el paso 2, el resumen de plata a la vista
const d = await nuevo(1440, 900, false);
await d.fill('#cli-nombre', 'Rosa Pérez'); await d.fill('#cli-telefono', '11 5555-1234');
await d.click('#btn-continuar'); await d.click('#btn-agregar-item'); await d.click('.tipo-tile[data-tipo="vent-corr-2"]');
await d.click('.item--abierto [data-accion="listo"]'); await d.waitForTimeout(250);
const compu = await d.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(); return { nav: r('.barra__tabs'), lista: r('[data-paso-seccion="2"]'), resumen: r('#tarjeta-resumen') }; });
ok(compu.nav.left === 0 && compu.nav.height > 600 && compu.nav.width < 260, 'en la compu las pestañas van al costado');
ok(compu.resumen.width > 0 && compu.resumen.left >= compu.lista.right && /Total/.test(await d.textContent('#tarjeta-resumen')), 'en el paso 2 el resumen queda a la derecha de las aberturas');
ok(await sinDesborde(d) && d.errores.length === 0, 'compu sin scroll horizontal ni errores');
await d.screenshot({ path: OUT + '/v18-compu.png' });
await b.close();
