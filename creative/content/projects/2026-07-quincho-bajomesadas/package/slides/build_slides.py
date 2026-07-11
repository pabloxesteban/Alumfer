#!/usr/bin/env python3
# Carrusel "A prueba de asados" — bajo mesada de aluminio para parrilla.
# Estetica basada en creative/content/projects/2026-07-carrusel-compartible:
# fondo degrade azul->carbon, Montserrat, logo lockup, ilustracion vectorial
# del producto, badges glass con iconos, pager N/5. Suma 2 fotos reales.
import base64, os, math
ROOT="/home/user/Alumfer"
PKG=f"{ROOT}/creative/content/projects/2026-07-quincho-bajomesadas/package"
SLIDES=f"{PKG}/slides"
LOGO_URI="data:image/png;base64,"+base64.b64encode(open(f"{ROOT}/apps/website/solologo.png","rb").read()).decode()
IMG1="data:image/jpeg;base64,"+base64.b64encode(open(f"{ROOT}/apps/website/bajomesada1.jpeg","rb").read()).decode()
IMG2="data:image/jpeg;base64,"+base64.b64encode(open(f"{ROOT}/apps/website/bajomesada2.jpeg","rb").read()).decode()

F="Montserrat, 'Helvetica Neue', Arial, sans-serif"
def W(a): return f"rgba(255,255,255,{a})"

def DEFS():
    return ('<defs>'
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#1B6CC8"/><stop offset="0.42" stop-color="#173a63"/>'
    '<stop offset="0.72" stop-color="#141a20"/><stop offset="1" stop-color="#101216"/></linearGradient>'
    # aluminio negro (bajo mesada)
    '<linearGradient id="aluDark" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#3a4046"/><stop offset="0.5" stop-color="#1e2226"/>'
    '<stop offset="1" stop-color="#0e1012"/></linearGradient>'
    '<linearGradient id="aluPanel" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#2c3237"/><stop offset="0.5" stop-color="#181b1e"/>'
    '<stop offset="1" stop-color="#0d0f11"/></linearGradient>'
    '<linearGradient id="aluBar" x1="0" y1="0" x2="1" y2="0">'
    '<stop offset="0" stop-color="#3b4147"/><stop offset="0.5" stop-color="#5a626a"/>'
    '<stop offset="1" stop-color="#2a2f34"/></linearGradient>'
    # hormigon (mesada)
    '<linearGradient id="concrete" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#c4bdaf"/><stop offset="1" stop-color="#8b8475"/></linearGradient>'
    '<filter id="soft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="16"/></filter>'
    '<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>'
    '<radialGradient id="glassBadge" cx="50%" cy="35%" r="70%">'
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.03"/></radialGradient>'
    '</defs>')

def HEAD(): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080" font-family="{F}">'
def BG(): return '<rect width="1080" height="1080" fill="url(#bg)"/>'

def logo():
    h=44; w=h*1.42; x=80; y=72
    return (f'<image href="{LOGO_URI}" x="{x}" y="{y}" width="{w:.0f}" height="{h}" preserveAspectRatio="xMidYMid meet"/>'
            f'<text x="{x+w+12:.0f}" y="{y+21}" fill="{W(0.95)}" font-size="23" font-weight="700" letter-spacing="1">ALUMFER</text>'
            f'<text x="{x+w+12:.0f}" y="{y+40}" fill="{W(0.5)}" font-size="12.5" font-weight="500" letter-spacing="2">CARPINTERÍA DE ALUMINIO</text>')

def pager(n): return f'<text x="540" y="1018" text-anchor="middle" fill="{W(0.4)}" font-size="18" font-weight="500" letter-spacing="4">{n} / 5</text>'

def txt(x,y,s,size,color,weight=400,anchor="middle",ls=0):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-weight="{weight}" letter-spacing="{ls}">{s}</text>'

# ---------- BAJO MESADA REALISTA (aluminio negro, listones + manijas) ----------
def bajomesada(cx,cy,w,h,opacity=1.0,doors=2,mesada=True):
    x=cx-w/2; y=cy-h/2; fr=max(12,w*0.045)
    g=f'<g opacity="{opacity}">'
    g+=f'<ellipse cx="{cx}" cy="{y+h+24:.0f}" rx="{w*0.52:.0f}" ry="18" fill="#000" opacity="0.45" filter="url(#shadow)"/>'
    if mesada:
        mh=24
        g+=f'<rect x="{x-16:.0f}" y="{y-mh:.0f}" width="{w+32:.0f}" height="{mh}" rx="3" fill="url(#concrete)"/>'
        g+=f'<rect x="{x-16:.0f}" y="{y-mh:.0f}" width="{w+32:.0f}" height="4" fill="{W(0.18)}"/>'
    g+=f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="4" fill="url(#aluDark)"/>'
    g+=f'<path d="M{x+3:.0f} {y+h-3:.0f} L{x+3:.0f} {y+3:.0f} L{x+w-3:.0f} {y+3:.0f}" fill="none" stroke="{W(0.18)}" stroke-width="2"/>'
    g+=f'<path d="M{x+w-3:.0f} {y+3:.0f} L{x+w-3:.0f} {y+h-3:.0f} L{x+3:.0f} {y+h-3:.0f}" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2"/>'
    dw=(w-2*fr)/doors; ph=h-2*fr
    for i in range(doors):
        dx=x+fr+i*dw; pw=dw-3
        g+=f'<rect x="{dx:.1f}" y="{y+fr:.1f}" width="{pw:.1f}" height="{ph:.1f}" fill="url(#aluPanel)"/>'
        n=9
        for k in range(n):
            ly=y+fr+ph*(k+1)/(n+1)
            g+=f'<rect x="{dx:.1f}" y="{ly-2:.1f}" width="{pw:.1f}" height="2" fill="{W(0.06)}"/>'
            g+=f'<rect x="{dx:.1f}" y="{ly:.1f}" width="{pw:.1f}" height="1.4" fill="rgba(0,0,0,0.45)"/>'
        hx = dx+pw-16 if i==0 else dx+10
        g+=f'<rect x="{hx:.0f}" y="{cy-26:.0f}" width="6" height="52" rx="3" fill="#0c0e10"/>'
        g+=f'<rect x="{hx:.0f}" y="{cy-25:.0f}" width="2" height="50" rx="1" fill="{W(0.22)}"/>'
    if doors==2:
        g+=f'<rect x="{cx-3:.0f}" y="{y+fr:.0f}" width="6" height="{ph:.0f}" fill="url(#aluBar)"/>'
    for sx,sy in [(x+fr/2,y+fr/2),(x+w-fr/2,y+fr/2),(x+fr/2,y+h-fr/2),(x+w-fr/2,y+h-fr/2)]:
        g+=f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="3" fill="#0c0e10"/><circle cx="{sx:.0f}" cy="{sy-1:.0f}" r="1.2" fill="{W(0.25)}"/>'
    g+='</g>'
    return g

# ---------- foto real enmarcada (mismo lugar que la ilustracion) ----------
def photo_card(cx,cy,w,h,uri,cid):
    x=cx-w/2; y=cy-h/2
    s=f'<clipPath id="{cid}"><rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="10"/></clipPath>'
    s+=f'<ellipse cx="{cx}" cy="{y+h+22:.0f}" rx="{w*0.5:.0f}" ry="18" fill="#000" opacity="0.45" filter="url(#shadow)"/>'
    s+=f'<image href="{uri}" x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" preserveAspectRatio="xMidYMid slice" clip-path="url(#{cid})"/>'
    s+=f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="10" fill="none" stroke="{W(0.16)}" stroke-width="2"/>'
    return s

# ---------- iconos glass ----------
def i_flame(cx,cy,r=24):
    R=r
    outer=(f'M {cx:.1f} {cy-R:.1f} '
           f'C {cx+0.60*R:.1f} {cy-0.35*R:.1f} {cx+0.52*R:.1f} {cy+0.22*R:.1f} {cx+0.30*R:.1f} {cy+0.45*R:.1f} '
           f'C {cx+0.52*R:.1f} {cy+0.10*R:.1f} {cx+0.14*R:.1f} {cy-0.05*R:.1f} {cx+0.20*R:.1f} {cy-0.44*R:.1f} '
           f'C {cx-0.02*R:.1f} {cy-0.12*R:.1f} {cx-0.22*R:.1f} {cy+0.28*R:.1f} {cx-0.12*R:.1f} {cy+0.52*R:.1f} '
           f'A {0.56*R:.1f} {0.56*R:.1f} 0 1 1 {cx+0.30*R:.1f} {cy+0.45*R:.1f} Z')
    inner=(f'M {cx:.1f} {cy+0.02*R:.1f} '
           f'C {cx+0.26*R:.1f} {cy+0.18*R:.1f} {cx+0.24*R:.1f} {cy+0.55*R:.1f} {cx:.1f} {cy+0.60*R:.1f} '
           f'C {cx-0.24*R:.1f} {cy+0.55*R:.1f} {cx-0.16*R:.1f} {cy+0.24*R:.1f} {cx:.1f} {cy+0.02*R:.1f} Z')
    return f'<path d="{outer}" fill="{W(0.95)}"/><path d="{inner}" fill="rgba(23,58,99,0.85)"/>'
def i_drop(cx,cy,r=24):
    return f'<path d="M{cx} {cy-r} C {cx+r*0.85:.0f} {cy-r*0.1:.0f} {cx+r*0.7:.0f} {cy+r:.0f} {cx} {cy+r} C {cx-r*0.7:.0f} {cy+r:.0f} {cx-r*0.85:.0f} {cy-r*0.1:.0f} {cx} {cy-r} Z" fill="none" stroke="{W(0.95)}" stroke-width="3.5"/>'
def i_shield(cx,cy,r=24):
    s=f'<path d="M{cx} {cy-r} L {cx+r*0.8:.0f} {cy-r*0.55:.0f} L {cx+r*0.8:.0f} {cy+r*0.2:.0f} Q {cx+r*0.8:.0f} {cy+r*0.9:.0f} {cx} {cy+r} Q {cx-r*0.8:.0f} {cy+r*0.9:.0f} {cx-r*0.8:.0f} {cy+r*0.2:.0f} L {cx-r*0.8:.0f} {cy-r*0.55:.0f} Z" fill="none" stroke="{W(0.95)}" stroke-width="3.5"/>'
    return s+f'<polyline points="{cx-9},{cy} {cx-2},{cy+8} {cx+11},{cy-9}" fill="none" stroke="{W(0.95)}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
def i_ruler(cx,cy,r=24):
    s=f'<rect x="{cx-r:.0f}" y="{cy-r*0.42:.0f}" width="{2*r:.0f}" height="{r*0.84:.0f}" rx="3" fill="none" stroke="{W(0.95)}" stroke-width="3.5"/>'
    for i in range(1,6):
        tx=cx-r+(2*r)*i/6; hh=r*0.4 if i%2==0 else r*0.22
        s+=f'<line x1="{tx:.0f}" y1="{cy-r*0.42:.0f}" x2="{tx:.0f}" y2="{cy-r*0.42+hh:.0f}" stroke="{W(0.95)}" stroke-width="3"/>'
    return s
def i_whatsapp(cx,cy,r=24):
    bub=f'M{cx} {cy-r} a{r} {r} 0 1 0 -{r*0.82:.0f} {r*1.45:.0f} l-{r*0.42:.0f} {r*0.14:.0f} {r*0.14:.0f} -{r*0.42:.0f} a{r} {r} 0 0 0 {r*1.1:.0f} -{r*1.17:.0f} z'
    hand=f'M{cx-r*0.22:.0f} {cy-r*0.26:.0f} c-1 -1 -3 -1 -4 1 c-1.6 2.6 -0.8 6.6 2.6 10 c3.4 3.4 7.4 4.2 10 2.6 c2 -1 2 -3 1 -4 l-2.6 -2.6 c-1 -1 -2 -1 -2.6 0 l-1 1 c-1.6 -0.8 -3.4 -2.6 -4.2 -4.2 l1 -1 c0.8 -0.8 0.8 -1.6 0 -2.6 z'
    return f'<path d="{bub}" fill="{W(0.95)}"/><path d="{hand}" fill="#173a63"/>'

def badge(cx,cy,r,icon,label=None):
    s=f'<circle cx="{cx}" cy="{cy}" r="{r*1.2:.0f}" fill="{W(0.05)}" filter="url(#soft)"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glassBadge)" stroke="{W(0.22)}" stroke-width="1.5"/>'
    s+=f'<path d="M{cx-r*0.5:.0f} {cy-r*0.6:.0f} A {r} {r} 0 0 1 {cx+r*0.6:.0f} {cy-r*0.5:.0f}" fill="none" stroke="{W(0.3)}" stroke-width="2" stroke-linecap="round"/>'
    s+=icon
    if label: s+=f'<text x="{cx}" y="{cy+r+28:.0f}" text-anchor="middle" fill="{W(0.6)}" font-size="18" font-weight="600" letter-spacing="1.5">{label}</text>'
    return s

def mini_badge(cx,cy,r,icon,label):
    s=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glassBadge)" stroke="{W(0.22)}" stroke-width="1.5"/>'
    s+=icon
    s+=f'<text x="{cx}" y="{cy+r+26:.0f}" text-anchor="middle" fill="{W(0.65)}" font-size="19" font-weight="600" letter-spacing="1">{label}</text>'
    return s

# ---------------- SLIDES ----------------
def s1():  # HOOK (ilustracion)
    s=HEAD()+DEFS()+BG()+logo()
    s+=txt(540,268,"A prueba",108,"#FFFFFF",700,ls=-2)
    s+=txt(540,384,"de asados.",108,"#FFFFFF",700,ls=-2)
    s+=txt(540,452,"El bajo mesada de aluminio de tu parrilla.",29,W(0.72),400)
    s+=bajomesada(540,738,430,300)
    s+=badge(884,560,52,i_flame(884,560),"FUEGO")
    s+=pager(1)
    return s+"</svg>"

def s2():  # QUE ES (foto real 1)
    s=HEAD()+DEFS()+BG()+logo()
    s+=photo_card(540,428,478,384,IMG1,"rc2")
    s+=txt(540,706,"LO QUE VA DEBAJO DE LA PARRILLA",21,W(0.55),600,ls=3)
    s+=txt(540,772,"Bajo mesada a medida.",54,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,830,"Ahí van la leña, el carbón y los fierros.",31,W(0.72),400)
    s+=txt(540,872,"Cerrado, prolijo y a mano.",31,W(0.72),400)
    s+=pager(2)
    return s+"</svg>"

def s3():  # POR QUE AGUANTA (ilustracion + 3 badges)
    s=HEAD()+DEFS()+BG()+logo()
    s+=bajomesada(540,500,404,308)
    s+=mini_badge(300,232,44,i_flame(300,232),"FUEGO")
    s+=mini_badge(540,232,44,i_drop(540,232),"HUMEDAD")
    s+=mini_badge(780,232,44,i_shield(780,232),"ÓXIDO")
    s+=txt(540,742,"No lo tocan.",72,"#FFFFFF",700,ls=-1)
    s+=txt(540,802,"Es aluminio, no madera ni hierro.",32,W(0.72),400)
    s+=txt(540,844,"No se pudre. No se oxida. No se hincha.",32,W(0.72),400)
    s+=pager(3)
    return s+"</svg>"

def s4():  # A MEDIDA (ilustracion)
    s=HEAD()+DEFS()+BG()+logo()
    s+=bajomesada(500,452,420,346)
    s+=badge(882,262,52,i_ruler(882,262),"A MEDIDA")
    s+=txt(540,742,"FABRICACIÓN PROPIA",21,W(0.55),600,ls=3)
    s+=txt(540,806,"A la medida de tu hueco.",54,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,864,"En negro, que hace juego con la parrilla.",31,W(0.72),400)
    s+=pager(4)
    return s+"</svg>"

def s5():  # CTA (foto real 2)
    s=HEAD()+DEFS()+BG()+logo()
    s+=photo_card(540,398,452,336,IMG2,"rc5")
    s+=badge(872,236,52,i_whatsapp(872,236),"WHATSAPP")
    s+=txt(540,706,"¿Hacemos el de tu parrilla?",46,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,760,"Mandanos una foto de tu parrilla y te lo hacemos a medida.",29,W(0.72),400)
    s+=txt(540,838,"Escribinos por WhatsApp",30,"#FFFFFF",600)
    s+=txt(540,880,"wa.me/541163368643",23,W(0.55),500,ls=1)
    s+=pager(5)
    return s+"</svg>"

slides=[s1(),s2(),s3(),s4(),s5()]
os.makedirs(SLIDES,exist_ok=True)
for i,sv in enumerate(slides,1): open(f"{SLIDES}/slide-{i}.svg","w").write(sv)
print("SVGs:",len(slides))

caps=["Slide 1 · Hook","Slide 2 · Qué es (foto)","Slide 3 · Por qué aguanta",
      "Slide 4 · A medida","Slide 5 · CTA (foto)"]
cards=""
for i,sv in enumerate(slides,1):
    inner=sv[sv.index(">")+1:sv.rindex("</svg>")]
    cards+=(f'<figure class="frame"><div class="card"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">{inner}</svg></div>'
            f'<figcaption><span class="n">{caps[i-1]}</span></figcaption></figure>')
html=f'''<style>
 :root{{--pg:#111315;--pn:#191b1e;--ink:#E8E4DC;--dim:#9a978f;--ln:rgba(255,255,255,.10);--b:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;--d:"Helvetica Neue",Arial,system-ui,sans-serif}}
 @media (prefers-color-scheme:light){{:root{{--pg:#EDEAE3;--pn:#F5F4F1;--ink:#26282a;--dim:#6b6a64;--ln:rgba(26,28,30,.12)}}}}
 :root[data-theme=dark]{{--pg:#111315;--pn:#191b1e;--ink:#E8E4DC;--dim:#9a978f;--ln:rgba(255,255,255,.10)}}
 :root[data-theme=light]{{--pg:#EDEAE3;--pn:#F5F4F1;--ink:#26282a;--dim:#6b6a64;--ln:rgba(26,28,30,.12)}}
 *{{box-sizing:border-box}}body{{margin:0;background:var(--pg);color:var(--ink);font-family:var(--b);line-height:1.5}}
 .wrap{{max-width:640px;margin:0 auto;padding:clamp(1.25rem,5vw,3rem) clamp(1rem,4vw,2rem)}}
 header{{border-bottom:1px solid var(--ln);padding-bottom:1.6rem;margin-bottom:2rem}}
 .eb{{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);font-weight:700;margin:0 0 .7rem}}
 h1{{font-family:var(--d);font-weight:800;letter-spacing:-.02em;font-size:clamp(1.6rem,5.5vw,2.3rem);margin:0 0 .8rem}}
 .l{{color:var(--dim);font-size:.95rem;margin:0;max-width:58ch}}
 .frame{{margin:0 0 2rem}}.card{{border-radius:2px;overflow:hidden;box-shadow:0 18px 50px -20px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.06)}}
 .card svg{{display:block;width:100%;height:auto}}
 figcaption{{margin-top:.7rem;font-size:.8rem;color:var(--dim)}}figcaption .n{{font-weight:700;color:var(--ink)}}
 .note{{background:var(--pn);border:1px solid var(--ln);border-radius:10px;padding:1.2rem 1.3rem;font-size:.85rem;color:var(--dim)}}
 .note b{{color:var(--ink)}}.note code{{font-family:ui-monospace,Menlo,monospace;font-size:.8em;background:rgba(127,127,127,.16);padding:.1em .4em;border-radius:4px}}
</style>
<div class="wrap"><header><p class="eb">Alumfer · Carrusel</p>
<h1>A prueba de asados</h1>
<p class="l">Bajo mesada de aluminio para la parrilla. Misma estética del carrusel del repo:
fondo degradé azul→carbón, Montserrat, logo lockup, ilustración vectorial del producto y badges glass.
Slides 2 y 5 con foto real de obra. Nota: el preview usa fuente de sistema; en Canva se ve con Montserrat.</p></header>
{cards}
<div class="note"><b>Archivos:</b> <code>package/slides/slide-1..5.svg</code>. En Canva asigná <b>Montserrat</b> a todo el texto. Fotos reales en slides 2 y 5.</div></div>'''
open(f"{PKG}/preview.html","w").write(html)
print("preview OK")
