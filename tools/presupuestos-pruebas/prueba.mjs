import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { conPasos } from './pasos.mjs';
import fs from 'fs';

const OUT = process.argv[2];
const URL = 'http://localhost:8777/';
const errores = [];
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALLA') + ' ' + msg); if (!cond) process.exitCode = 1; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, acceptDownloads: true, serviceWorkers: 'block' });
await ctx.route(/dolarapi|bluelytics/, r => r.fulfill({ json: { compra: 1400, venta: 1450, fechaActualizacion: new Date().toISOString() } }));

// Simula la lista para compartir del teléfono y registra qué se le pasó.
await ctx.addInitScript(() => {
  window.__compartido = [];
  if (location.search.includes('share')) {
    navigator.canShare = (d) => true;
    navigator.share = (d) => {
      window.__compartido.push({ text: d.text, title: d.title, files: (d.files || []).map(f => ({ name: f.name, type: f.type, size: f.size })) });
      return Promise.resolve();
    };
  }
});

const page = conPasos(await ctx.newPage());
page.on('pageerror', e => errores.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });

await page.goto(URL + '?share');
await page.waitForSelector('#btn-agregar-item');

// ── Cliente
await page.fill('#cli-nombre', 'María Gómez');
await page.fill('#cli-telefono', '11 5555-1234');
await page.fill('#cli-localidad', 'Temperley');
await page.fill('#cli-direccion', 'Av. Meeks 123');

// ── Tres aberturas
async function agregar(tipo) {
  await page.click('#btn-agregar-item');
  await page.click(`.tipo-tile[data-tipo="${tipo}"]`);
}
const tipos = await page.$$eval('#grilla-tipos .tipo-tile', ns => ns.map(n => n.dataset.tipo)).catch(() => []);
await agregar('vent-corr-2');
await agregar('vent-abrir-1');
const otros = await page.evaluate(() => window.PRECIOS_BASE.tipologias.map(t => t.id));
await agregar(otros.find(t => t.startsWith('puerta')) || otros[5]);

let items = await page.$$('.item');
ok(items.length === 3, 'se agregaron 3 aberturas');

ok(await page.locator('.item--abierto').count() === 1 && await page.locator('.item--cerrado').count() === 2, 'solo la última abertura queda abierta; las otras dos resumidas');
// abrir la primera tocando su renglón
await page.locator('.item').first().locator('.item__resumen').click();
ok(await page.locator('.item').first().evaluate(n => n.classList.contains('item--abierto')), 'tocando el renglón se abre la primera (y se cierra la otra)');
// medidas y cantidad del primero
const it0 = page.locator('.item').first();
await it0.locator('[data-campo="anchoCm"]').fill('180');
await it0.locator('[data-campo="altoCm"]').fill('120');
await it0.locator('[data-campo="cantidad"]').fill('2');
await page.waitForTimeout(200);
const totalItem0 = await it0.locator('[data-total]').textContent();
ok(/2 ×/.test(totalItem0), 'el ítem con cantidad 2 muestra "2 × unitario": ' + totalItem0);

// verificar cálculo contra el motor
const calc = await page.evaluate(() => {
  const lista = window.Almacenamiento.listar();
  return null;
});
const totalAntes = await page.textContent('#barra-total-valor');

// descuento general
await page.click('summary:has-text("Descuento, colocación")');
await page.fill('#aj-descuento', '10');
await page.waitForTimeout(1200);
const totalDespues = await page.textContent('#barra-total-valor');
ok(totalAntes !== totalDespues, `el descuento cambia el total (${totalAntes} → ${totalDespues})`);
const filaDesc = await page.textContent('#totales');
ok(/Descuento 10/.test(filaDesc), 'aparece la fila de descuento');

// consistencia: total de pantalla = motor de cálculo sobre lo guardado
const consistencia = await page.evaluate(() => {
  const p = window.Almacenamiento.listar()[0];
  const r = window.Calculo.calcularPresupuesto(p, p.precios);
  return { motor: window.Formato.moneda(r.total), guardado: window.Formato.moneda(p.total), numero: p.numero };
});
ok(consistencia.motor === totalDespues.trim() && consistencia.guardado === consistencia.motor,
   `total en pantalla = motor = guardado (${consistencia.motor}) · ${consistencia.numero}`);

await page.screenshot({ path: OUT + '/1-paso3-celular.png', fullPage: true });

// ── Descargar PDF (en este "celular" Android simulado: descarga directa)
const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('#btn-pdf')]);
const rutaPdf = OUT + '/presupuesto.pdf';
await descarga.saveAs(rutaPdf);
ok(fs.statSync(rutaPdf).size > 5000, 'PDF descargado: ' + descarga.suggestedFilename() + ' (' + fs.statSync(rutaPdf).size + ' bytes)');

// ── Enviar por WhatsApp (lista para compartir simulada)
await page.click('#btn-whatsapp');
await page.waitForFunction(() => window.__compartido.length > 0);
const comp = await page.evaluate(() => window.__compartido[0]);
ok(comp.files.length === 1 && comp.files[0].type === 'application/pdf', 'WhatsApp comparte 1 archivo PDF: ' + comp.files[0].name);
ok(/Hola María/.test(comp.text) && /Total/.test(comp.text), 'con mensaje: ' + JSON.stringify(comp.text));
await page.waitForTimeout(300);
ok(await page.inputValue('#pre-estado') === 'enviado', 'queda marcado como enviado');

// ── Email
await page.click('#btn-email');
await page.waitForFunction(() => window.__compartido.length > 1);
const compE = await page.evaluate(() => window.__compartido[1]);
ok(compE.files.length === 1 && /Presupuesto P-/.test(compE.title || ''), 'email comparte el PDF con asunto: ' + compE.title);

// ── NotAllowedError → ventana "El PDF está listo"
await page.evaluate(() => {
  let primera = true;
  navigator.share = (d) => {
    if (primera) { primera = false; return Promise.reject(new DOMException('gesto', 'NotAllowedError')); }
    window.__compartido.push({ reintento: true, files: d.files.map(f => f.name) });
    return Promise.resolve();
  };
});
await page.click('#btn-whatsapp');
await page.waitForSelector('#modal-listo:not([hidden])');
await page.screenshot({ path: OUT + '/2-pdf-listo.png' });
await page.click('#btn-listo');
await page.waitForFunction(() => window.__compartido.some(c => c.reintento));
ok(true, 'con el toque perdido aparece "El PDF está listo" y el segundo toque comparte');

// ── Cliente reutilizable en un presupuesto nuevo
page.once('dialog', d => d.accept());
await page.click('#btn-nuevo');
await page.fill('#cli-nombre', 'mari');
await page.waitForSelector('#sugerencias-clientes:not([hidden])');
await page.screenshot({ path: OUT + '/3-sugerencia-cliente.png' });
await page.click('.cliente-sugerido');
ok(await page.inputValue('#cli-telefono') === '11 5555-1234' && await page.inputValue('#cli-localidad') === 'Temperley',
   'tocando la sugerencia se completan teléfono y localidad');
ok(await page.isHidden('#sugerencias-clientes'), 'la sugerencia se cierra al elegir');
await page.fill('#cli-nombre', 'Zzz Nadie');
ok(await page.isHidden('#sugerencias-clientes'), 'sin coincidencias no se muestra nada');

// ── Presupuesto largo (varias páginas)
await page.fill('#cli-nombre', 'Constructora Los Álamos S.R.L.');
for (let i = 0; i < 22; i++) {
  await page.click('#btn-agregar-item');
  const tiles = page.locator('#grilla-tipos .tipo-tile:not([data-tipo="libre"])');   // "Otro trabajo" pide precio
  await tiles.nth(i % await tiles.count()).click();
}
await page.evaluate(() => {
  document.querySelector('#pre-notas').value = 'Las medidas se confirman en obra.\nIncluye retiro de las aberturas viejas.';
  document.querySelector('#pre-notas').dispatchEvent(new Event('input', { bubbles: true }));
  const n = document.querySelector('.item--abierto [data-campo="nota"]');
  n.value = 'Hoja derecha corrediza, vidrio esmerilado en el baño — confirmar color con la clienta';
  n.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(1200);
const [d2] = await Promise.all([page.waitForEvent('download'), page.click('#btn-pdf')]);
await d2.saveAs(OUT + '/presupuesto-largo.pdf');
ok(true, 'PDF largo descargado: ' + d2.suggestedFilename());

// ── Tu empresa: datos y logo
await page.click('.tab[data-vista="precios"]');
await page.fill('#emp-telefono', '(011) 4444-0000');
await page.waitForTimeout(100);
const empGuardada = await page.evaluate(() => window.Almacenamiento.cargarPrecios().empresa.telefono);
ok(empGuardada === '(011) 4444-0000', 'el teléfono de la empresa se guarda solo');
await page.setInputFiles('#archivo-logo', '/home/user/Alumfer/apps/presupuestos/icono-512.png');
await page.waitForFunction(() => document.querySelector('#logo-vista').src.startsWith('data:'));
ok(await page.isVisible('#btn-logo-original'), 'logo propio cargado y botón para volver al original');
await page.locator('#tarjeta-empresa').screenshot({ path: OUT + '/4-empresa.png' });
await page.click('.tab[data-vista="presupuesto"]');
const [d3] = await Promise.all([page.waitForEvent('download'), page.click('#btn-pdf')]);
await d3.saveAs(OUT + '/presupuesto-logo.pdf');

// la versión del SW nueva no rompe nada y la app no tiró errores
ok(errores.length === 0, 'sin errores en consola' + (errores.length ? ': ' + errores.join(' | ') : ''));

// ── Computadora sin "compartir": WhatsApp abre el chat + descarga el PDF
const pc = conPasos(await ctx.newPage());
await pc.setViewportSize({ width: 1280, height: 900 });
await pc.goto(URL);
await pc.waitForSelector('#btn-agregar-item');
await pc.click('.tab[data-vista="historial"]');
await pc.click('.historial-fila [data-accion="abrir"]');
ok(/Descargas/.test(await pc.textContent('#ayuda-whatsapp')), 'en la compu la ayuda explica que el PDF queda en Descargas');
const [popup, d4] = await Promise.all([pc.waitForEvent('popup'), pc.waitForEvent('download'), pc.click('#btn-whatsapp')]);
ok(/wa\.me\/5491155551234/.test(popup.url()) || /whatsapp/.test(popup.url()), 'abre WhatsApp al número del cliente: ' + popup.url().slice(0, 60));
ok(/\.pdf$/.test(d4.suggestedFilename()), 'y descarga el PDF para adjuntarlo');
await pc.screenshot({ path: OUT + '/5-compu.png', fullPage: false });

await browser.close();
