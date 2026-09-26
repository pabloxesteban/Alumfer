// Capturas para el video: página completa sin elementos fijos (navbar, botón
// flotante, barra inferior del celular) + esos elementos por separado, y la
// posición de cada sección. Así el video los superpone como en el sitio real.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import os from 'os';
import fs from 'fs';
const IP = process.env.HOST_IP || Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal).address;
const out = new URL('../_raw/video/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: IP } });
const fix = '.reveal{opacity:1!important;transform:none!important} .scroll-progress{display:none!important}';
const secs = ['.hero','#nosotros','#trabajos','.process-section','#productos','section[aria-labelledby=reviews-title]','.garantia-band','#faq','#contacto','footer'];
const meta = {};

async function prep(p) {
  // El sitio carga Inter y Montserrat desde Google Fonts: se reintenta hasta
  // que las dos estén cargadas, para no capturar con una letra de reemplazo.
  for (let i = 1; ; i++) {
    await p.goto(`http://${IP}:8765/`, { waitUntil: 'networkidle' }).catch(()=>{});
    await p.evaluate(()=>document.fonts.ready);
    const ok = await p.evaluate(()=>['Inter','Montserrat'].every(n=>[...document.fonts].some(f=>f.family.replace(/"/g,'')===n && f.status==='loaded')));
    if (ok) break;
    if (i === 4) throw new Error('No cargaron las tipografías del sitio');
    console.log('tipografías sin cargar, reintento', i);
  }
  await p.waitForTimeout(3500);
  await p.addStyleTag({ content: fix });
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for (let y=0; y<h; y+=400) { await p.evaluate(y=>window.scrollTo(0,y), y); await p.waitForTimeout(40); }
  await p.evaluate(()=>{document.querySelectorAll('[style]').forEach(e=>{if(e.style.opacity==='0'||e.style.visibility==='hidden'){e.style.opacity='1';e.style.visibility='visible';e.style.transform='none';}})});
}
async function scrollTo(p, y) {
  await p.evaluate(y=>{ window.scrollTo({top:y,behavior:'instant'}); if (window.lenis) window.lenis.scrollTo(y,{immediate:true}); }, y);
  await p.waitForTimeout(900);
}

for (const [name, opts] of [
  ['desk', { viewport:{width:1440,height:900}, deviceScaleFactor:2 }],
  ['mob',  { viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true }],
]) {
  const ctx = await b.newContext({ ...opts, ignoreHTTPSErrors:true });
  const p = await ctx.newPage();
  await prep(p);
  const navH = await p.evaluate(()=>Math.ceil(document.querySelector('.navbar').getBoundingClientRect().height));
  const W = opts.viewport.width;
  await scrollTo(p, 0);
  await p.screenshot({ path: out+name+'-nav-top.png', clip:{x:0,y:0,width:W,height:navH} });
  await scrollTo(p, 1400);
  // La barra es semitransparente: se captura sobre fondo liso para que no quede
  // impreso el contenido que tenía detrás en ese momento.
  const solo = await p.addStyleTag({ content: 'body > *:not(.navbar){visibility:hidden!important}' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: out+name+'-nav-solid.png', clip:{x:0,y:0,width:W,height:navH} });
  await solo.evaluate(e => e.remove());
  if (name === 'mob') {
    const r = await p.evaluate(()=>{ const e=document.querySelector('.mobile-bar').getBoundingClientRect(); return {y:Math.floor(e.top)-8, h:Math.ceil(e.height)+8}; });
    await p.screenshot({ path: out+'mob-bar.png', clip:{x:0,y:r.y,width:W,height:opts.viewport.height-r.y} });
    meta.mobBarTop = r.y;
  }
  await p.addStyleTag({ content: '.navbar,.whatsapp-float,.mobile-bar{visibility:hidden!important}' });
  await scrollTo(p, 0);
  await p.waitForTimeout(3500);   // la animación de entrada del hero se repite al volver arriba
  const measure = () => p.evaluate(sel=>Object.fromEntries(sel.map(s=>{const e=document.querySelector(s);return [s, e?Math.round(e.getBoundingClientRect().top+window.scrollY):null];})), secs);
  const before = await measure();
  await p.screenshot({ path: out+name+'-full.png', fullPage:true });
  console.log(name, 'antes', JSON.stringify(before));
  console.log(name, 'después', JSON.stringify(await measure()));
  meta[name] = {
    dsf: opts.deviceScaleFactor, width: W, viewportH: opts.viewport.height, navH,
    height: await p.evaluate(()=>document.documentElement.scrollHeight),
    sections: await p.evaluate(sel=>Object.fromEntries(sel.map(s=>{const e=document.querySelector(s);return [s, e?Math.round(e.getBoundingClientRect().top+window.scrollY):null];})), secs),
  };
  await ctx.close();
}
fs.writeFileSync(out+'meta.json', JSON.stringify(meta, null, 2));
await b.close();
