import { chromium } from 'playwright';
const ROOT = '/home/user/Alumfer';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:1 });
const reqs = {gsap:false,lenis:false,split:false,fonts:false,unsplash:false};
p.on('response', r => { const u=r.url();
  if(u.includes('gsap'))reqs.gsap=r.ok(); if(u.includes('lenis'))reqs.lenis=r.ok();
  if(u.includes('split-type'))reqs.split=r.ok(); if(u.includes('fonts.g'))reqs.fonts=r.ok();
  if(u.includes('unsplash'))reqs.unsplash=r.ok(); });
await p.goto('file://'+ROOT+'/index.html',{waitUntil:'load',timeout:30000}).catch(e=>console.log('goto err',e.message));
await p.waitForTimeout(4000);
console.log('external loads:', JSON.stringify(reqs));
console.log('gsap+ST:', await p.evaluate(()=>!!window.gsap&&!!window.ScrollTrigger),
  '| Lenis:', await p.evaluate(()=>!!window.Lenis),
  '| .cinematic:', await p.evaluate(()=>document.documentElement.classList.contains('cinematic')));
console.log('hero bg loaded?', await p.evaluate(()=>{const i=document.querySelector('.hero__bg img');return i?i.naturalWidth>0:'no-img';}));
console.log('page height:', await p.evaluate(()=>document.body.scrollHeight));
await p.screenshot({path:'probe.png'});
await b.close();
