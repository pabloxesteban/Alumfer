import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
const ctx = await b.newContext({ viewport:{width:1400,height:1000}, deviceScaleFactor:2, ignoreHTTPSErrors:true });
const p = await ctx.newPage();
await p.goto(new URL('./boards.html', import.meta.url).href,{waitUntil:'networkidle'});
await p.evaluate(async()=>{ await Promise.all(['700 58px Archivo','400 18px Archivo','300 46px Inter','600 46px Inter'].map(f=>document.fonts.load(f))); await document.fonts.ready; });
const ok = await p.evaluate(()=>document.fonts.check('700 58px Archivo') && document.fonts.check('400 18px Archivo'));
if (!ok) { console.error('No cargó la tipografía Archivo'); process.exit(1); } await p.waitForTimeout(800);
const ids = await p.$$eval('section.board', s=>s.map(e=>e.id));
const names={b01:'01-portada',b02:'02-el-proyecto',b03:'03-identidad-visual',b04:'04-inicio',b05:'05-pagina-completa',b06:'06-galeria-de-obras',b07:'07-proceso-y-catalogo',b08:'08-opiniones-y-contacto',b09:'09-celular',b10:'10-localidades-y-servicios',b11:'11-guias',b12:'12-desarrollo',b13:'13-cierre',thumb:'portada-808x632'};
for (const id of ids) {
  const el = await p.$('#'+id);
  const name = names[id];
  await el.screenshot({ path: new URL(`../laminas/${name}.jpg`, import.meta.url).pathname, type:'jpeg', quality:90 });
}
await b.close();
