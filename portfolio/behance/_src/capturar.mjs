import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import os from 'os';
const IP = process.env.HOST_IP || Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal).address;
const out = new URL('../_raw/', import.meta.url).pathname;
const base = `http://${IP}:8765/`;
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: IP } });
async function shoot(name, url, vp, opts={}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ignoreHTTPSErrors: true, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  const p = await ctx.newPage();
  await p.goto((opts.base||base)+url, { waitUntil: 'networkidle' }).catch(()=>{});
  await p.waitForTimeout(3500);
  await p.screenshot({ path: out+name+'-top.png' });
  await p.addStyleTag({ content: '*{animation-delay:0s!important} .reveal{opacity:1!important;transform:none!important} .scroll-progress{display:none!important}' });
  // scroll through to trigger lazy/reveal
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for (let y=0;y<h;y+=500){ await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(60); }
  await p.evaluate(()=>{document.querySelectorAll('[style]').forEach(e=>{ if(e.style.opacity==='0'||e.style.visibility==='hidden'){e.style.opacity='1';e.style.visibility='visible';e.style.transform='none';} })});
  await p.waitForTimeout(800);
  if (opts.sections) {
    for (const [n,sel] of opts.sections) {
      const el = await p.$(sel); if (!el) { console.log('miss',sel); continue; }
      await p.addStyleTag({content: n==='hero'?'/**/':'.navbar,.whatsapp-float,[class*=wa-float],[class*=float]{visibility:hidden!important}'});
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
      await el.screenshot({ path: out+name+'-'+n+'.png' });
    }
  }
  if (opts.full) await p.screenshot({ path: out+name+'-full.png', fullPage: true });
  await ctx.close();
}
const secs = [['hero','.hero'],['nosotros','#nosotros'],['trabajos','#trabajos'],['proceso','.process-section'],['productos','#productos'],['reviews','section[aria-labelledby=reviews-title]'],['garantia','.garantia-band'],['faq','#faq'],['contacto','#contacto'],['footer','footer']];
await shoot('desk','', {width:1440,height:900}, {sections: secs, full:true});
await shoot('mob','', {width:390,height:844}, {mobile:true, sections: secs, full:true});
await shoot('guia-desk','guias/conviene-el-dvh/', {width:1440,height:900}, {full:true});
await shoot('guia-mob','guias/conviene-el-dvh/', {width:390,height:844}, {mobile:true, full:true});
await shoot('landing-desk','aberturas-de-aluminio-adrogue/', {width:1440,height:900}, {full:true});
await shoot('landing-mob','aberturas-de-aluminio-adrogue/', {width:390,height:844}, {mobile:true});
await shoot('pres-mob','presupuestos/', {width:390,height:844}, {mobile:true, base:`http://${IP}:8766/`, full:true});
await shoot('pres-desk','presupuestos/', {width:1440,height:900}, {base:`http://${IP}:8766/`});
await b.close();
