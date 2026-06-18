// Recorrido continuo del sitio (un solo contexto) con permanencia por sección.
// Sirve como asset crudo ("walkthrough") y como fuente para cortar el reel.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = '/home/user/Alumfer';
const CAP  = path.join(ROOT, 'reel', 'capture');
const NM   = path.join(CAP, 'node_modules');
const OUT  = path.join(CAP, 'clips');
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920;
const HERO_IMG = path.join(ROOT, 'obra-quincho-1.jpeg');

function fontFace(f, w, file){return `@font-face{font-family:'${f}';font-style:normal;font-weight:${w};font-display:swap;src:url('file://${file}') format('woff2');}`;}
function buildFontCss(){const a=[];const m=path.join(NM,'@fontsource/montserrat/files/montserrat-latin-600-normal.woff2');if(fs.existsSync(m))a.push(fontFace('Montserrat',600,m));for(const w of[300,400,500,600]){const f=path.join(NM,`@fontsource/inter/files/inter-latin-${w}-normal.woff2`);if(fs.existsSync(f))a.push(fontFace('Inter',w,f));}return a.join('\n');}
const FONT_CSS = buildFontCss();
const local=(p)=>path.join(NM,p);
const routes=[
  {match:'ScrollTrigger.min.js',file:local('gsap/dist/ScrollTrigger.min.js'),type:'application/javascript'},
  {match:'gsap.min.js',file:local('gsap/dist/gsap.min.js'),type:'application/javascript'},
  {match:'split-type',file:local('split-type/umd/index.min.js'),type:'application/javascript'},
  {match:'lenis',file:local('lenis/dist/lenis.min.js'),type:'application/javascript'},
];
async function setupRouting(context){
  await context.route('**/*', async (route)=>{
    const url=route.request().url();
    if(url.includes('googletagmanager')||url.includes('google-analytics'))return route.abort();
    for(const r of routes){if(url.includes(r.match)){try{return route.fulfill({status:200,contentType:r.type,body:fs.readFileSync(r.file)});}catch{return route.continue();}}}
    if(url.includes('fonts.googleapis.com'))return route.fulfill({status:200,contentType:'text/css',body:FONT_CSS});
    if(url.includes('images.unsplash.com'))return route.fulfill({status:200,contentType:'image/jpeg',body:fs.readFileSync(HERO_IMG)});
    return route.continue();
  });
}
async function waitReady(page){
  await page.waitForLoadState('load');
  await page.waitForFunction(()=>window.gsap&&window.ScrollTrigger&&document.documentElement.classList.contains('cinematic'),{timeout:8000}).catch(()=>{});
  await page.waitForTimeout(300);
}
async function scrollTo(page,target,duration){
  await page.evaluate(([t,d])=>{const lenis=window.__lenis;let y=t;if(typeof t==='string'){const el=document.querySelector(t);y=el?el.getBoundingClientRect().top+window.scrollY-72:window.scrollY;}if(lenis)lenis.scrollTo(y,{duration:d});else window.scrollTo({top:y,behavior:'smooth'});},[target,duration]);
  await page.waitForTimeout(duration*1000+150);
}

const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,reducedMotion:'no-preference',recordVideo:{dir:OUT,size:{width:W,height:H}}});
await setupRouting(context);
const page=await context.newPage();
await page.goto('file://'+ROOT+'/index.html',{waitUntil:'load',timeout:30000});
await waitReady(page);

const marks={};                          // timestamps por sección (desde t0)
const t0=Date.now();
const mark=(k)=>{marks[k]=((Date.now()-t0)/1000).toFixed(2);};

mark('hero');         await page.waitForTimeout(3200);     // entrada SplitType + count-up
mark('nosotros');     await scrollTo(page,'#nosotros',1.5); await page.waitForTimeout(1800);
mark('trabajos');     await scrollTo(page,'#trabajos',1.5); await page.waitForTimeout(2200);
mark('productos');    await scrollTo(page,'#productos',1.5); await page.waitForTimeout(700);
mark('tab_vidrios');  await page.click('.catalog-tab[data-tab="vidrios"]').catch(()=>{});       await page.waitForTimeout(1300);
mark('tab_colores');  await page.click('.catalog-tab[data-tab="terminaciones"]').catch(()=>{}); await page.waitForTimeout(1300);
mark('tab_extras');   await page.click('.catalog-tab[data-tab="extras"]').catch(()=>{});         await page.waitForTimeout(1300);
mark('reviews');      await scrollTo(page,'#reviews',1.4); await page.waitForTimeout(1500);
mark('contacto');     await scrollTo(page,'#contacto',1.5); await page.waitForTimeout(1400);
                      await page.hover('.btn--whatsapp, a[href*="wa.me"]').catch(()=>{}); await page.waitForTimeout(900);
mark('end');

const video=page.video();
await context.close();
const raw=await video.path();
const dst=path.join(OUT,'walkthrough.webm');
fs.renameSync(raw,dst);
fs.writeFileSync(path.join(OUT,'marks.json'),JSON.stringify(marks,null,2));
console.log('✓ walkthrough.webm');
console.log('marks (s):',JSON.stringify(marks));
await browser.close();
