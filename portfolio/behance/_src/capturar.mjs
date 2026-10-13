// Capturas del sitio para las láminas → portfolio/behance/_raw/
// Requiere el sitio servido en :8765 (ver README, sección 6).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import os from 'os';
import fs from 'fs';
const IP = process.env.HOST_IP || Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal).address;
const out = new URL('../_raw/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const base = `http://${IP}:8765/`;
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: IP } });

const DESK = { viewport:{width:1440,height:900}, deviceScaleFactor:2 };
const MOB  = { viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true };
// Elementos que aparecen con el scroll: se muestran ya terminados
const SHOW = '.rv{opacity:1!important;transform:none!important;transition:none!important} .rv-img{clip-path:none!important;transition:none!important}';
const FLOATING = '.wa-float,.mbar{visibility:hidden!important}';
// El mapa de Google no carga desde el entorno de captura: se oculta para no mostrar un recuadro vacío
const NOMAP = '.map{display:none!important}';

async function open(url, opts) {
  const ctx = await b.newContext({ ...opts, ignoreHTTPSErrors:true });
  const p = await ctx.newPage();
  for (let i = 1; ; i++) {
    await p.goto(base + url, { waitUntil:'networkidle' }).catch(()=>{});
    await p.evaluate(()=>document.fonts.ready);
    const ok = await p.evaluate(()=>['Archivo','IBM Plex Mono'].every(n=>[...document.fonts].some(f=>f.family.replace(/"/g,'')===n && f.status==='loaded')));
    if (ok) break;
    if (i === 4) throw new Error('No cargaron las tipografías del sitio');
  }
  await p.waitForTimeout(2500);
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for (let y=0; y<h; y+=400) { await p.evaluate(y=>window.scrollTo(0,y), y); await p.waitForTimeout(60); }
  await p.addStyleTag({ content: SHOW + NOMAP });
  await p.evaluate(()=>document.querySelectorAll('.rv,.rv-img').forEach(e=>e.classList.add('is-in')));
  await p.waitForTimeout(1500);   // mapa embebido e imágenes diferidas
  return { ctx, p };
}
async function at(p, sel, file, off = 0) {
  await p.evaluate(([s,o])=>{ const e=document.querySelector(s); window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY+o, behavior:'instant'}); }, [sel, off]);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out+file });
}
async function top(p, file) {
  await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out+file });
}

const SECS = [['nosotros','#nosotros'],['trabajos','#trabajos'],['proceso','#proceso'],['lineas','#lineas'],['productos','#productos'],
              ['resenas','#resenas'],['faq','#faq'],['contacto','#contacto'],['footer','footer.footer']];

// Inicio, escritorio
let { ctx, p } = await open('', DESK);
await top(p, 'desk-top.png');
await p.addStyleTag({ content: FLOATING });
await top(p, 'desk-hero.png');
await p.addStyleTag({ content: '.nav,.topbar{visibility:hidden!important}' });
for (const [n, sel] of SECS) {
  const el = await p.$(sel);
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await el.screenshot({ path: out+`desk-${n}.png` });
}
await ctx.close();
// Página completa a 1×: Chromium no captura más de ~16.000 px de alto y a 2× la home los supera
({ ctx, p } = await open('', { ...DESK, deviceScaleFactor:1 }));
await p.addStyleTag({ content: FLOATING });
await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'})); await p.waitForTimeout(1500);
await p.screenshot({ path: out+'desk-full.png', fullPage:true });
await ctx.close();

// Inicio, celular
({ ctx, p } = await open('', MOB));
await top(p, 'mob-top.png');
await p.addStyleTag({ content: '.mbar{visibility:hidden!important}' });
for (const [n, sel] of SECS.slice(0, 8)) await at(p, sel, `m-${n}.png`, -60);
await p.addStyleTag({ content: '.mbar{visibility:visible!important}' });
await top(p, 'mob-hero.png');
await ctx.close();

// Guía y página de localidad
({ ctx, p } = await open('guias/conviene-el-dvh/', DESK));
await p.addStyleTag({ content: FLOATING });
await top(p, 'guia-desk-top.png');
await p.addStyleTag({ content: '.nav,.topbar{visibility:hidden!important}' });
await p.evaluate(()=>window.scrollTo({top:900,behavior:'instant'})); await p.waitForTimeout(900); await p.screenshot({ path: out+'d-guia-body.png' });
await ctx.close();
({ ctx, p } = await open('guias/conviene-el-dvh/', MOB));
await top(p, 'm-guia-hero.png');
await p.evaluate(()=>window.scrollTo({top:1100,behavior:'instant'})); await p.waitForTimeout(900); await p.screenshot({ path: out+'m-guia-body.png' });
await ctx.close();
({ ctx, p } = await open('aberturas-de-aluminio-adrogue/', DESK));
await p.addStyleTag({ content: FLOATING });
await top(p, 'landing-desk-top.png');
await ctx.close();
({ ctx, p } = await open('aberturas-de-aluminio-adrogue/', MOB));
await top(p, 'landing-mob-top.png');
await ctx.close();
await b.close();
