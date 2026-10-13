// Capturas para el video: página completa sin elementos flotantes + la barra
// de navegación y la barra inferior del celular por separado, y la posición
// de cada sección. Así el video las superpone como se comportan en el sitio.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import os from 'os';
import fs from 'fs';
const IP = process.env.HOST_IP || Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal).address;
const out = new URL('../_raw/video/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: IP } });
const SHOW = '.rv{opacity:1!important;transform:none!important;transition:none!important} .rv-img{clip-path:none!important;transition:none!important} .map{display:none!important}';
const secs = ['#nosotros','#trabajos','#proceso','#lineas','#productos','#resenas','#faq','#contacto','footer.footer'];
const meta = {};

async function prep(p) {
  for (let i = 1; ; i++) {
    await p.goto(`http://${IP}:8765/`, { waitUntil: 'networkidle' }).catch(()=>{});
    await p.evaluate(()=>document.fonts.ready);
    const ok = await p.evaluate(()=>['Archivo','IBM Plex Mono'].every(n=>[...document.fonts].some(f=>f.family.replace(/"/g,'')===n && f.status==='loaded')));
    if (ok) break;
    if (i === 4) throw new Error('No cargaron las tipografías del sitio');
  }
  await p.waitForTimeout(2500);
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for (let y=0; y<h; y+=400) { await p.evaluate(y=>window.scrollTo(0,y), y); await p.waitForTimeout(60); }
  await p.addStyleTag({ content: SHOW });
  await p.evaluate(()=>document.querySelectorAll('.rv,.rv-img').forEach(e=>e.classList.add('is-in')));
}
const scrollTo = async (p, y) => { await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}), y); await p.waitForTimeout(900); };

for (const [name, opts] of [
  // Escalas elegidas para no pasar los ~16.000 px de alto que Chromium puede capturar:
  // escritorio sale a 1920 px de ancho (el ancho del video), celular a ~430 px
  // (la pantalla del video mide 416).
  ['desk', { viewport:{width:1440,height:810}, deviceScaleFactor:4/3 }],
  ['mob',  { viewport:{width:390,height:844}, deviceScaleFactor:1.1, isMobile:true, hasTouch:true }],
]) {
  const ctx = await b.newContext({ ...opts, ignoreHTTPSErrors:true });
  const p = await ctx.newPage();
  await prep(p);
  const W = opts.viewport.width;
  // La barra de navegación es sticky: en el flujo de la página hasta que llega arriba
  await scrollTo(p, 0);
  const nav = await p.evaluate(()=>{ const e=document.querySelector('.nav'); return { top: Math.round(e.offsetTop), h: Math.ceil(e.getBoundingClientRect().height) }; });
  await scrollTo(p, 1400);
  const solo = await p.addStyleTag({ content: 'body > *:not(.nav){visibility:hidden!important}' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: out+name+'-nav.png', clip:{x:0,y:0,width:W,height:nav.h} });
  await solo.evaluate(e => e.remove());
  if (name === 'mob') {
    // La barra flota con márgenes: se captura sola, sobre fondo transparente
    await scrollTo(p, 600);
    const r = await p.evaluate(()=>{ const e=document.querySelector('.mbar').getBoundingClientRect(); return {y:Math.floor(e.top)-10, h:Math.ceil(e.height)+20}; });
    const sola = await p.addStyleTag({ content: 'html,body{background:transparent!important} body > *:not(.mbar){visibility:hidden!important}' });
    await p.waitForTimeout(300);
    await p.screenshot({ path: out+'mob-bar.png', omitBackground:true, clip:{x:0,y:r.y,width:W,height:Math.min(r.h, opts.viewport.height-r.y)} });
    await sola.evaluate(e => e.remove());
    meta.mobBarTop = r.y;
  }
  await p.addStyleTag({ content: '.wa-float,.mbar{visibility:hidden!important}' });
  await scrollTo(p, 0);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out+name+'-full.png', fullPage:true });
  meta[name] = {
    dsf: opts.deviceScaleFactor, width: W, viewportH: opts.viewport.height, navTop: nav.top, navH: nav.h,
    height: await p.evaluate(()=>document.documentElement.scrollHeight),
    sections: await p.evaluate(sel=>Object.fromEntries(sel.map(s=>{const e=document.querySelector(s);return [s, Math.round(e.getBoundingClientRect().top+window.scrollY)];})), secs),
  };
  await ctx.close();
}
fs.writeFileSync(out+'meta.json', JSON.stringify(meta, null, 2));
await b.close();
