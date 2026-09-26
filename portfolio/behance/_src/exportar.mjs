import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Servidor local mínimo: las fuentes no cargan si la página se abre como file://
const root = new URL('../../../', import.meta.url).pathname;
const types = { '.html':'text/html', '.css':'text/css', '.woff2':'font/woff2', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise(r => server.on('listening', r));
const base = `http://127.0.0.1:${server.address().port}/portfolio/behance/_src/`;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1400,height:1000}, deviceScaleFactor:2, ignoreHTTPSErrors:true });
const p = await ctx.newPage();
p.on('requestfailed', r => console.error('falló', r.url(), r.failure()?.errorText));
p.on('response', r => { if (r.status() >= 400) console.error('HTTP', r.status(), r.url()); });
await p.goto(base + 'boards.html', { waitUntil: 'networkidle' });
await p.evaluate(async()=>{ await Promise.all(['300 46px Inter','400 17px Inter','500 52px Inter','600 168px Inter'].map(f=>document.fonts.load(f))); await document.fonts.ready; });
const ok = await p.evaluate(()=>[...document.fonts].some(f=>f.family.replace(/"/g,'')==='Inter' && f.status==='loaded'));
if (!ok) { console.error('No cargó la tipografía Inter'); process.exit(1); } await p.waitForTimeout(800);
const ids = await p.$$eval('section.board', s=>s.map(e=>e.id));
const names={b01:'01-portada',b02:'02-el-proyecto',b03:'03-identidad-visual',b04:'04-inicio',b05:'05-pagina-completa',b06:'06-galeria-de-obras',b07:'07-proceso-y-catalogo',b08:'08-opiniones-y-contacto',b09:'09-celular',b10:'10-localidades-y-servicios',b11:'11-guias',b12:'12-desarrollo',b13:'13-cierre',thumb:'portada-808x632'};
for (const id of ids) {
  const el = await p.$('#'+id);
  const name = names[id];
  await el.screenshot({ path: new URL(`../laminas/${name}.jpg`, import.meta.url).pathname, type:'jpeg', quality:90 });
}
await b.close();
server.close();
