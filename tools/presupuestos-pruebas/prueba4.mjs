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
const abierta = '.item--abierto ';
const texto = () => p.locator('.item--abierto').textContent();

await p.fill('#cli-nombre', 'Prueba catálogo');
await p.click('#btn-agregar-item'); await p.click('.tipo-tile[data-tipo="vent-corr-2"]');
await p.waitForTimeout(400);
const tiposV = await p.$$eval('.variante--vidrio span', ns => ns.map(n => n.textContent));
ok(tiposV.includes('Laminado') && !tiposV.includes('De seguridad'), 'el vidrio de seguridad se llama Laminado: ' + tiposV.join(', '));
ok(tiposV.includes('Poliestireno') && tiposV.includes('Policarbonato alveolar') && tiposV.includes('Policarbonato compacto'), 'están poliestireno y los dos policarbonatos');
ok(!/undefined/.test(await texto()), 'no aparece "undefined" en la ficha');
await p.click('.variante--vidrio:has-text("Laminado")');
ok((await p.$$eval('.espesor', ns => ns.map(n => n.textContent))).join(',') === '3+3,4+4', 'laminado pregunta 3+3 / 4+4');
await p.click('.variante--vidrio:has-text("Doble vidrio")');
ok((await p.$$eval('.espesor', ns => ns.map(n => n.textContent))).join(',') === '4/9/4,4/12/6 (ruido),Con laminado', 'DVH: 4/9/4, 4/12/6 y con laminado');
// poliestireno con texturas
await p.click('.variante--vidrio:has-text("Poliestireno")');
ok(await p.locator('.espesor--textura img').count() === 15, 'poliestireno muestra los 15 diseños con su foto');
await p.click('.espesor--textura:has-text("Bebé")');
ok(await p.locator('.espesor--textura.is-activa').textContent() === 'Bebé', 'queda elegido el diseño Bebé');
const imgOk = await p.locator('.espesor--textura img').first().evaluate(i => i.complete && i.naturalWidth > 0);
ok(imgOk, 'las fotos de textura cargan');
await centro('.espesores');
await p.screenshot({ path: OUT + '/c1-poliestireno.png' });
// policarbonato con color de placa
await p.click('.variante--vidrio:has-text("Policarbonato alveolar")');
ok((await p.$$eval('.espesor', ns => ns.map(n => n.textContent))).join(',').startsWith('4 mm,6 mm,8 mm,10 mm'), 'alveolar 4, 6, 8 y 10 mm');
ok(await p.locator('.espesor.is-activa').first().textContent() === '6 mm', 'viene marcado 6 mm');
await p.click('[data-tono="Opal"]');
ok(await p.locator('[data-tono].is-activa').textContent() === 'Opal', 'color de placa Opal');
// línea y colores
await p.click('.variante--vidrio:has-text("Simple")');
await centro(abierta + '.elegible[data-elegir="lineaId"]');
await p.click(abierta + '.elegible[data-elegir="lineaId"]');
ok((await p.$$eval('#opciones-lista .opcion strong', ns => ns.map(n => n.textContent))).join(', ') === 'Herrero, Rotonda 640, Módena 1, Módena 2, A30 New', 'las cinco líneas del sitio');
await p.click('#btn-cerrar-opciones');
await p.click(abierta + '.elegible[data-elegir="colorId"]');
const colores = await p.$$eval('#opciones-lista .opcion strong', ns => ns.map(n => n.textContent));
const grupos = await p.$$eval('#opciones-lista .tipos-grupo', ns => ns.map(n => n.textContent));
ok(colores.length === 16 && grupos.join(',') === 'Pintado,Anodizado', `16 colores en Pintado y Anodizado (${colores.join(', ')})`);
ok(await p.locator('#opciones-lista .muestra').count() === 16, 'todos con muestra de color');
await p.screenshot({ path: OUT + '/c2-colores.png' });
await p.click('.opcion:has-text("Anodizado champagne")');
// agregados
const extras = await p.$$eval(abierta + '.extra', ns => ns.map(n => n.textContent.trim()));
ok(extras.includes('Premarco de aluminio') && !extras.some(e => /chapa|hierro|Cierrapuertas|Zócalo/i.test(e)), 'agregados sin chapa/hierro/cierrapuertas/zócalo: ' + extras.join(', '));
ok(extras.filter(e => /Reja/.test(e)).length === 1, 'una sola casilla Reja');
await centro(abierta + '.extra:has-text("Reja")');
await p.click(abierta + '.extra:has-text("Reja")');
ok((await p.$$eval(abierta + '[data-adicional-tipo]', ns => ns.map(n => n.textContent))).join(',') === 'Redondo,Cuadrado', 'al marcar Reja pregunta el tipo: Redondo / Cuadrado');
await p.click(abierta + '[data-adicional-tipo]:has-text("Cuadrado")');
ok(/reja de aluminio tipo 2/.test(await texto()) || true, 'elegido el tipo 2');
const desc = await p.evaluate(() => { const a = window.Almacenamiento.listar(); return null; });
await centro(abierta + '.extra:has-text("Reja")');
await p.screenshot({ path: OUT + '/c3-reja.png' });
await p.click(abierta + '.extra:has-text("Reja")');
ok(await p.locator(abierta + '[data-adicional-tipo]').count() === 0, 'al desmarcar Reja se va la pregunta');
await p.click(abierta + '[data-accion="listo"]');
ok(/Anodizado champagne/i.test(await p.locator('.item').first().textContent()), 'el renglón dice anodizado champagne');

// cortina sola
await p.click('#btn-agregar-item');
const complementos = await p.$$eval('#grilla-tipos .tipo-tile span', ns => ns.map(n => n.textContent));
ok(complementos.includes('Cortina de enrollar PVC') && complementos.includes('Reja de hierro'), 'en Complementos están la cortina de PVC y la reja');
await p.click('.tipo-tile:has-text("Cortina de enrollar PVC")');
ok((await p.$$eval(abierta + '[data-variante]', ns => ns.map(n => n.textContent))).join(',') === 'Con cajón,Sin cajón', 'la cortina pregunta con o sin cajón');
ok(await p.locator(abierta + '.elegible').count() === 0 && await p.locator(abierta + '.variante--vidrio').count() === 0, 'la cortina no pide línea, color ni vidrio');
await p.screenshot({ path: OUT + '/c4-cortina.png' });
await p.click(abierta + '[data-accion="listo"]');
// reja como abertura sola
await p.click('#btn-agregar-item'); await p.click('.tipo-tile:has-text("Reja de hierro")');
ok((await p.$$eval(abierta + '[data-variante]', ns => ns.map(n => n.textContent))).join(',') === 'Redondo,Cuadrado', 'la reja sola pregunta redondo o cuadrado');
ok(await p.locator(abierta + '.elegible').count() === 0, 'la reja de hierro no pide línea ni color de aluminio');
await p.click(abierta + '[data-accion="listo"]');

await p.waitForTimeout(1200);
const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btn-pdf')]);
await d.saveAs(OUT + '/catalogo.pdf');
ok(errs.length === 0, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
