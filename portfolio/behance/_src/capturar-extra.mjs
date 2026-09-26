import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import os from 'os';
const IP = process.env.HOST_IP || Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal).address;
const out = new URL('../_raw/', import.meta.url).pathname;

const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: IP } });
const mob = { viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true, ignoreHTTPSErrors:true };
const fix = '.reveal{opacity:1!important;transform:none!important} .scroll-progress{display:none!important}';
async function prep(p,url){ await p.goto(url,{waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(3000); await p.addStyleTag({content:fix});
  const h=await p.evaluate(()=>document.body.scrollHeight); for(let y=0;y<h;y+=400){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(40);}
  await p.evaluate(()=>{document.querySelectorAll('[style]').forEach(e=>{if(e.style.opacity==='0'||e.style.visibility==='hidden'){e.style.opacity='1';e.style.visibility='visible';e.style.transform='none';}})});}
async function at(p,sel,file,off=-60){ await p.evaluate(([s,o])=>{const e=document.querySelector(s); const y=e.getBoundingClientRect().top+window.scrollY+o; window.scrollTo({top:y,behavior:'instant'}); if(window.lenis) window.lenis.scrollTo(y,{immediate:true});},[sel,off]); await p.waitForTimeout(900); await p.screenshot({path:out+file}); }
let ctx=await b.newContext(mob); let p=await ctx.newPage();
await prep(p,`http://${IP}:8765/`);
await at(p,'#nosotros','m-nosotros.png'); await at(p,'#trabajos','m-trabajos.png'); await at(p,'.process-section','m-proceso.png');
await at(p,'#productos','m-productos.png'); await at(p,'section[aria-labelledby=reviews-title]','m-reviews.png'); await at(p,'#faq','m-faq.png'); await at(p,'#contacto','m-contacto.png');
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500); await p.screenshot({path:out+'m-hero.png'});
await ctx.close();
ctx=await b.newContext(mob); p=await ctx.newPage(); await prep(p,`http://${IP}:8765/guias/conviene-el-dvh/`);
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400); await p.screenshot({path:out+'m-guia-hero.png'});
await p.evaluate(()=>window.scrollTo(0,1100)); await p.waitForTimeout(600); await p.screenshot({path:out+'m-guia-body.png'});
await ctx.close();
// desktop guide body + landing body
ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true}); p=await ctx.newPage();
await prep(p,`http://${IP}:8765/guias/conviene-el-dvh/`); await p.addStyleTag({content:'.navbar,.whatsapp-float{visibility:hidden!important}'});
await p.evaluate(()=>window.scrollTo(0,1000)); await p.waitForTimeout(700); await p.screenshot({path:out+'d-guia-body.png'});
await p.evaluate(()=>window.scrollTo(0,2200)); await p.waitForTimeout(700); await p.screenshot({path:out+'d-guia-body2.png'});
await ctx.close();
await b.close();
