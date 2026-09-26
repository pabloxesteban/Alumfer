import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
const ctx = await b.newContext({ viewport:{width:1400,height:1000}, deviceScaleFactor:2, ignoreHTTPSErrors:true });
const p = await ctx.newPage();
await p.goto(new URL('./boards.html', import.meta.url).href,{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
const ids = await p.$$eval('section.board', s=>s.map(e=>e.id));
const names={b01:'01-portada',b02:'02-el-proyecto',b03:'03-identidad-visual',b04:'04-home-hero',b05:'05-home-recorrido',b06:'06-galeria-de-obras',b07:'07-catalogo-y-proceso',b08:'08-confianza-y-conversion',b09:'09-mobile',b10:'10-seo-local',b11:'11-guias',b12:'12-app-presupuestos',b13:'13-como-esta-hecho',b14:'14-cierre',thumb:'portada-808x632'};
for (const id of ids) {
  const el = await p.$('#'+id);
  const name = names[id];
  await el.screenshot({ path: new URL(`../laminas/${name}.jpg`, import.meta.url).pathname, type:'jpeg', quality:90 });
}
await b.close();
