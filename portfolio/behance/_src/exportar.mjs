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
await p.evaluate(async()=>{ await Promise.all(['300 40px Inter','400 16px Inter','500 34px Inter','600 40px Inter','600 84px Montserrat'].map(f=>document.fonts.load(f))); await document.fonts.ready; });
const ok = await p.evaluate(()=>['Inter','Montserrat'].every(n=>[...document.fonts].some(f=>f.family.replace(/"/g,'')===n && f.status==='loaded')));
if (!ok) { console.error('No cargaron las tipografías (Inter y Montserrat)'); process.exit(1); } await p.waitForTimeout(800);
const ids = await p.$$eval('section.board', s=>s.map(e=>e.id));
const names={b01:'01-cover',b02:'02-overview',bmap:'03-information-architecture',b03:'04-brand-system',b04:'05-homepage-hero',b05:'06-homepage',b06:'07-project-gallery',b07:'08-process-and-catalog',b08:'09-reviews-and-contact',b09:'10-mobile',b10:'11-local-search-pages',b11:'12-buyer-guides',b12:'13-build',b13:'14-closing',thumb:'cover-808x632',banner:'../perfil/banner-3200x410'};
for (const id of ids) {
  const el = await p.$('#'+id);
  const name = names[id];
  await el.screenshot({ path: new URL(`../laminas/${name}.jpg`, import.meta.url).pathname, type:'jpeg', quality:90 });
}
// Placas de apertura y cierre del video
const pv = await ctx.newPage();
await pv.setViewportSize({ width:1920, height:1080 });
await pv.goto(base + 'video-placas.html', { waitUntil: 'networkidle' });
await pv.evaluate(async()=>{ await Promise.all(['600 88px Montserrat','400 24px Inter'].map(f=>document.fonts.load(f))); await document.fonts.ready; });
for (const id of ['intro','outro']) {
  await (await pv.$('#'+id)).screenshot({ path: new URL(`../_raw/video/card-${id}.png`, import.meta.url).pathname, scale: 'css' });
}
await b.close();
server.close();
