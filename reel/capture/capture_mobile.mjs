// ============================================================
// ALUMFER — Captura MOBILE + simulación de usuario real (opción A v2)
// Viewport 432x768 @2.5 = 1080x1920 (layout responsive real, 9:16).
// Navegación humanizada: scroll con velocidad variable, pausas de lectura,
// micro-retrocesos, apertura del menú mobile, lightbox de galería y tabs.
// Reemplaza recursos externos (Unsplash, Google Maps) por placeholders
// premium para que nunca se vea una pantalla vacía.
// ============================================================
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = '/home/user/Alumfer';
const CAP  = path.join(ROOT, 'reel', 'capture');
const NM   = path.join(CAP, 'node_modules');
const OUT  = path.join(CAP, 'clips');
fs.mkdirSync(OUT, { recursive: true });

// Grabamos a ancho MOBILE real (720<768 dispara el layout responsive) en 9:16;
// luego se escala a 1080x1920 con ffmpeg. dsf=2 → render nítido.
const RECW = 720, RECH = 1280;
const SF = RECH / 768;                 // factor para deltas de scroll (tuneados a 768)
const HERO_IMG   = path.join(ROOT, 'obra-quincho-1.jpeg'); // hero
const GLASS_IMG  = path.join(ROOT, 'obra-ventanas-3.jpg'); // thumbnail "Espejado"

// ── Fuentes locales ──
function fontFace(f,w,file){return `@font-face{font-family:'${f}';font-style:normal;font-weight:${w};font-display:swap;src:url('file://${file}') format('woff2');}`;}
function buildFontCss(){const a=[];const m=path.join(NM,'@fontsource/montserrat/files/montserrat-latin-600-normal.woff2');if(fs.existsSync(m))a.push(fontFace('Montserrat',600,m));for(const w of[300,400,500,600]){const f=path.join(NM,`@fontsource/inter/files/inter-latin-${w}-normal.woff2`);if(fs.existsSync(f))a.push(fontFace('Inter',w,f));}return a.join('\n');}
const FONT_CSS=buildFontCss();
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
    if(url.includes('googletagmanager')||url.includes('google-analytics')||url.includes('web3forms'))return route.abort();
    if(url.includes('maps.google')||url.includes('/maps'))return route.abort(); // mapa → placeholder por DOM
    for(const r of routes){if(url.includes(r.match)){try{return route.fulfill({status:200,contentType:r.type,body:fs.readFileSync(r.file)});}catch{return route.continue();}}}
    if(url.includes('fonts.googleapis.com'))return route.fulfill({status:200,contentType:'text/css',body:FONT_CSS});
    if(url.includes('images.unsplash.com')){
      const img=url.includes('1583405751003')?GLASS_IMG:HERO_IMG; // espejado vs hero
      return route.fulfill({status:200,contentType:'image/jpeg',body:fs.readFileSync(img)});
    }
    return route.continue();
  });
}

async function waitReady(page){
  await page.waitForLoadState('load');
  await page.waitForFunction(()=>window.gsap&&window.ScrollTrigger&&document.documentElement.classList.contains('cinematic'),{timeout:8000}).catch(()=>{});
  // Reemplazar el iframe del mapa por un placeholder premium (sin pantalla vacía)
  await page.evaluate(()=>{
    const ifr=document.querySelector('iframe[src*="maps"]');
    if(ifr){const d=document.createElement('div');d.style.cssText='width:100%;height:100%;min-height:220px;border-radius:inherit;background:radial-gradient(120% 120% at 30% 20%, #2E3338 0%, #1A1C1E 70%);position:relative;overflow:hidden;';
      d.innerHTML='<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(27,108,200,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(27,108,200,.18) 1px,transparent 1px);background-size:34px 34px;"></div><div style="position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);text-align:center;color:#fff;font-family:Inter,sans-serif;"><div style="font-size:30px">📍</div><div style="font-weight:600;margin-top:6px">Av. San Martín 734</div><div style="opacity:.7;font-size:13px">Adrogué · Zona Sur GBA</div></div>';
      ifr.replaceWith(d);}
  });
  // Inyectar motor de scroll humano (velocidad variable + easings)
  await page.evaluate(()=>{
    const E={
      outCubic:t=>1-Math.pow(1-t,3),
      inOutQuad:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,
      outExpo:t=>t===1?1:1-Math.pow(2,-10*t),
      inOutCubic:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
    };
    window.__human=(delta,dur,easeName='outCubic')=>new Promise(res=>{
      const ease=E[easeName]||E.outCubic;
      const lenis=window.__lenis;
      const start=(lenis&&typeof lenis.scroll==='number')?lenis.scroll:window.scrollY;
      const t0=performance.now();
      function step(now){
        const p=Math.min(1,(now-t0)/dur);
        const y=start+delta*ease(p);
        if(lenis)lenis.scrollTo(y,{immediate:true});else window.scrollTo(0,y);
        if(p<1)requestAnimationFrame(step);else res();
      }
      requestAnimationFrame(step);
    });
  });
  await page.waitForTimeout(200);
}

// Helpers de “usuario real”
const rnd=(a,b)=>a+Math.random()*(b-a);
const pause=(page,ms)=>page.waitForTimeout(ms+rnd(-80,140));
const scrollBy=(page,delta,dur,ease)=>page.evaluate(([d,t,e])=>window.__human(d,t,e),[Math.round(delta*SF),dur,ease]);
const tap=(page,sel,idx=0)=>page.evaluate(([s,i])=>{const els=document.querySelectorAll(s);if(els[i])els[i].click();},[sel,idx]);

const marks={};const t0=Date.now();const mark=k=>{marks[k]=((Date.now()-t0)/1000).toFixed(2);};

const browser=await chromium.launch();
const context=await browser.newContext({
  viewport:{width:RECW,height:RECH},deviceScaleFactor:2,
  isMobile:true,hasTouch:true,reducedMotion:'no-preference',
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  recordVideo:{dir:OUT,size:{width:RECW,height:RECH}},
});
await setupRouting(context);
const page=await context.newPage();
await page.goto('file://'+ROOT+'/index.html',{waitUntil:'load',timeout:30000});
await waitReady(page);

// ───────── Guion de navegación humanizada ─────────
mark('hero');
await pause(page,2300);                                   // observa el hero (entrada del título)
await scrollBy(page,180,650,'outCubic'); await pause(page,700);   // baja a leer subtítulo
await scrollBy(page,150,700,'inOutQuad');await pause(page,1100);  // se detiene en las stats
await scrollBy(page,-90,500,'outCubic'); await pause(page,600);   // re-lee (micro retroceso)

mark('menu');
await tap(page,'.navbar__menu-btn'); await pause(page,1200);      // abre el menú mobile
await tap(page,'.mobile-nav__link',1); await pause(page,1700);    // toca "Trabajos" → navega

mark('trabajos');
await pause(page,900);
await scrollBy(page,260,900,'inOutQuad'); await pause(page,1200); // recorre la galería, observa
await tap(page,'.works-item',2); await pause(page,1900);          // abre una obra (lightbox)
await tap(page,'#lightbox-next'); await pause(page,1500);         // pasa a la siguiente
await tap(page,'#lightbox-next'); await pause(page,1400);
await tap(page,'#lightbox-close'); await pause(page,800);

mark('productos');
await scrollBy(page,560,1100,'inOutCubic'); await pause(page,1100);
await tap(page,'.catalog-tab[data-tab="vidrios"]'); await pause(page,1500);
await tap(page,'.catalog-tab[data-tab="terminaciones"]'); await pause(page,1600);
await scrollBy(page,220,800,'outCubic'); await pause(page,1100);  // observa los colores

mark('reviews');
await scrollBy(page,640,1200,'inOutQuad'); await pause(page,1800); // lee reseñas (confianza)

mark('contacto');
await scrollBy(page,720,1300,'inOutCubic'); await pause(page,1400);
await scrollBy(page,260,800,'outCubic'); await pause(page,1500);  // se detiene en el formulario
mark('end');

const video=page.video();
await context.close();
const raw=await video.path();
const dst=path.join(OUT,'mobile-journey.webm');
fs.renameSync(raw,dst);
fs.writeFileSync(path.join(OUT,'marks-mobile.json'),JSON.stringify(marks,null,2));
console.log('✓ mobile-journey.webm');
console.log('marks:',JSON.stringify(marks));
await browser.close();
