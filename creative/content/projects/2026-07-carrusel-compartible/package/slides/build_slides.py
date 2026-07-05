#!/usr/bin/env python3
# Carrusel v4 — ventanas realistas como ilustracion principal, iconos perifericos,
# gradiente azul->transparente (web), todo Montserrat, sin "Zona Sur".
import base64, os, math
ROOT="/home/user/Alumfer"
PKG=f"{ROOT}/creative/content/projects/2026-07-carrusel-compartible/package"
SLIDES=f"{PKG}/slides"
LOGO_URI="data:image/png;base64,"+base64.b64encode(open(f"{ROOT}/apps/website/solologo.png","rb").read()).decode()

F="Montserrat, 'Helvetica Neue', Arial, sans-serif"
def W(a): return f"rgba(255,255,255,{a})"

def DEFS():
    return ('<defs>'
    # fondo: base oscura + wash azul arriba
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#1B6CC8"/><stop offset="0.42" stop-color="#173a63"/>'
    '<stop offset="0.72" stop-color="#141a20"/><stop offset="1" stop-color="#101216"/></linearGradient>'
    # metal aluminio
    '<linearGradient id="alu" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#565d64"/><stop offset="0.5" stop-color="#2c3237"/>'
    '<stop offset="1" stop-color="#171a1e"/></linearGradient>'
    '<linearGradient id="aluBar" x1="0" y1="0" x2="1" y2="0">'
    '<stop offset="0" stop-color="#3b4147"/><stop offset="0.5" stop-color="#5a626a"/>'
    '<stop offset="1" stop-color="#2a2f34"/></linearGradient>'
    # vidrio
    '<linearGradient id="glass" x1="0" y1="0" x2="0.7" y2="1">'
    '<stop offset="0" stop-color="#5b7f98"/><stop offset="0.45" stop-color="#31485a"/>'
    '<stop offset="1" stop-color="#141f27"/></linearGradient>'
    # madera
    '<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#8a5f36"/><stop offset="0.5" stop-color="#5f4022"/>'
    '<stop offset="1" stop-color="#3c2815"/></linearGradient>'
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

def pager(n): return f'<text x="540" y="1018" text-anchor="middle" fill="{W(0.4)}" font-size="18" font-weight="500" letter-spacing="4">{n} / 8</text>'

def txt(x,y,s,size,color,weight=400,anchor="middle",ls=0):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-weight="{weight}" letter-spacing="{ls}">{s}</text>'

# ---------- VENTANA REALISTA ----------
def window(cx,cy,w,h,material="alu",kind="sliding",panes=2,reflection=True,screws=True,opacity=1.0):
    x=cx-w/2; y=cy-h/2; fr=max(16,w*0.055)
    frame_fill="url(#wood)" if material=="wood" else "url(#alu)"
    g=f'<g opacity="{opacity}">'
    # sombra
    g+=f'<ellipse cx="{cx}" cy="{y+h+26}" rx="{w*0.52:.0f}" ry="20" fill="#000000" opacity="0.45" filter="url(#shadow)"/>'
    # marco exterior
    g+=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{frame_fill}"/>'
    # bisel: highlight arriba/izq, sombra abajo/der
    g+=f'<path d="M{x+3} {y+h-3} L{x+3} {y+3} L{x+w-3} {y+3}" fill="none" stroke="{W(0.28)}" stroke-width="2"/>'
    g+=f'<path d="M{x+w-3} {y+3} L{x+w-3} {y+h-3} L{x+3} {y+h-3}" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>'
    # reveal interior (profundidad)
    gx=x+fr; gy=y+fr; gw=w-2*fr; gh=h-2*fr
    g+=f'<rect x="{gx-4}" y="{gy-4}" width="{gw+8}" height="{gh+8}" fill="#0e1114"/>'
    # vidrio
    g+=f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" fill="url(#glass)"/>'
    # reflejos en vidrio
    if reflection:
        g+=f'<polygon points="{gx},{gy+gh*0.62:.0f} {gx+gw*0.42:.0f},{gy} {gx+gw*0.66:.0f},{gy} {gx},{gy+gh:.0f}" fill="{W(0.07)}"/>'
        g+=f'<polygon points="{gx+gw*0.55:.0f},{gy} {gx+gw*0.68:.0f},{gy} {gx},{gy+gh:.0f} {gx},{gy+gh*0.86:.0f}" fill="{W(0.05)}"/>'
        g+=f'<line x1="{gx+gw*0.5:.0f}" y1="{gy}" x2="{gx}" y2="{gy+gh*0.75:.0f}" stroke="{W(0.16)}" stroke-width="2"/>'
    # divisiones
    if material=="wood":  # grilla colonial
        for i in (1,2):
            g+=f'<rect x="{gx+gw*i/3-5:.0f}" y="{gy}" width="10" height="{gh}" fill="url(#wood)"/>'
        for i in (1,2):
            g+=f'<rect x="{gx}" y="{gy+gh*i/3-5:.0f}" width="{gw}" height="10" fill="url(#wood)"/>'
    else:  # corrediza: barra central + travesano
        cxbar=gx+gw/2
        g+=f'<rect x="{cxbar-fr*0.42:.0f}" y="{gy}" width="{fr*0.84:.0f}" height="{gh}" fill="url(#aluBar)"/>'
        # manija
        g+=f'<rect x="{cxbar-fr*0.42-14:.0f}" y="{cy-22}" width="8" height="44" rx="4" fill="#0f1215"/>'
        g+=f'<rect x="{cxbar-fr*0.42-13:.0f}" y="{cy-21}" width="3" height="42" rx="2" fill="{W(0.2)}"/>'
    # tornillos
    if screws:
        for sx,sy in [(x+fr/2,y+fr/2),(x+w-fr/2,y+fr/2),(x+fr/2,y+h-fr/2),(x+w-fr/2,y+h-fr/2)]:
            g+=f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="3" fill="#0c0e10"/><circle cx="{sx:.0f}" cy="{sy-1:.0f}" r="1.2" fill="{W(0.25)}"/>'
    g+='</g>'
    return g

# ---------- iconos (para badges perifericos) ----------
def i_cold(cx,cy,r=24):
    s='<g stroke="%s" stroke-width="3.5" stroke-linecap="round" fill="none">'%W(0.95)
    for a in (90,30,-30,-90,-150,150):
        rad=math.radians(a); s+=f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(rad):.1f}" y2="{cy-r*math.sin(rad):.1f}"/>'
    return s+'</g>'
def i_sound(cx,cy,r=24):
    s=f'<circle cx="{cx-r+5}" cy="{cy}" r="4" fill="{W(0.95)}"/><g stroke="{W(0.95)}" stroke-width="3.5" fill="none" stroke-linecap="round">'
    for i,rr in enumerate((13,22,31)): s+=f'<path d="M{cx-r+10} {cy-rr} A {rr} {rr} 0 0 1 {cx-r+10} {cy+rr}" opacity="{1-0.25*i:.2f}"/>'
    return s+'</g>'
def i_drop(cx,cy,r=24):
    return f'<path d="M{cx} {cy-r} C {cx+r*0.85:.0f} {cy-r*0.1:.0f} {cx+r*0.7:.0f} {cy+r:.0f} {cx} {cy+r} C {cx-r*0.7:.0f} {cy+r:.0f} {cx-r*0.85:.0f} {cy-r*0.1:.0f} {cx} {cy-r} Z" fill="none" stroke="{W(0.95)}" stroke-width="3.5"/>'
def i_repeat(cx,cy,r=22):
    s=f'<g stroke="{W(0.95)}" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M{cx-r} {cy} A {r} {r} 0 1 1 {cx} {cy+r}"/><polyline points="{cx-r-7},{cy-9} {cx-r},{cy} {cx-r+9},{cy-7}"/></g>'
    return s+f'<text x="{cx+5}" y="{cy+8}" text-anchor="middle" fill="{W(0.95)}" font-size="22" font-weight="700">2</text>'
def i_shield(cx,cy,r=24):
    s=f'<path d="M{cx} {cy-r} L {cx+r*0.8:.0f} {cy-r*0.55:.0f} L {cx+r*0.8:.0f} {cy+r*0.2:.0f} Q {cx+r*0.8:.0f} {cy+r*0.9:.0f} {cx} {cy+r} Q {cx-r*0.8:.0f} {cy+r*0.9:.0f} {cx-r*0.8:.0f} {cy+r*0.2:.0f} L {cx-r*0.8:.0f} {cy-r*0.55:.0f} Z" fill="none" stroke="{W(0.95)}" stroke-width="3.5"/>'
    return s+f'<polyline points="{cx-9},{cy} {cx-2},{cy+8} {cx+11},{cy-9}" fill="none" stroke="{W(0.95)}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
def i_whatsapp(cx,cy,r=24):
    bub=f'M{cx} {cy-r} a{r} {r} 0 1 0 -{r*0.82:.0f} {r*1.45:.0f} l-{r*0.42:.0f} {r*0.14:.0f} {r*0.14:.0f} -{r*0.42:.0f} a{r} {r} 0 0 0 {r*1.1:.0f} -{r*1.17:.0f} z'
    hand=f'M{cx-r*0.22:.0f} {cy-r*0.26:.0f} c-1 -1 -3 -1 -4 1 c-1.6 2.6 -0.8 6.6 2.6 10 c3.4 3.4 7.4 4.2 10 2.6 c2 -1 2 -3 1 -4 l-2.6 -2.6 c-1 -1 -2 -1 -2.6 0 l-1 1 c-1.6 -0.8 -3.4 -2.6 -4.2 -4.2 l1 -1 c0.8 -0.8 0.8 -1.6 0 -2.6 z'
    return f'<path d="{bub}" fill="{W(0.95)}"/><path d="{hand}" fill="#173a63"/>'

def badge(cx,cy,r,icon,label=None,target=None):
    s=''
    if target:
        s+=f'<line x1="{cx}" y1="{cy}" x2="{target[0]}" y2="{target[1]}" stroke="{W(0.35)}" stroke-width="1.5" stroke-dasharray="2 5"/>'
        s+=f'<circle cx="{target[0]}" cy="{target[1]}" r="4" fill="{W(0.85)}"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r*1.2:.0f}" fill="{W(0.05)}" filter="url(#soft)"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glassBadge)" stroke="{W(0.22)}" stroke-width="1.5"/>'
    s+=f'<path d="M{cx-r*0.5:.0f} {cy-r*0.6:.0f} A {r} {r} 0 0 1 {cx+r*0.6:.0f} {cy-r*0.5:.0f}" fill="none" stroke="{W(0.3)}" stroke-width="2" stroke-linecap="round"/>'
    s+=icon
    if label: s+=f'<text x="{cx}" y="{cy+r+30}" text-anchor="middle" fill="{W(0.6)}" font-size="19" font-weight="600" letter-spacing="1.5">{label}</text>'
    return s

# ---------------- SLIDES ----------------
def s1():
    s=HEAD()+DEFS()+BG()+logo()
    s+=txt(540,262,"La ventana",64,W(0.82),400)
    s+=txt(540,372,"barata",118,"#FFFFFF",700,ls=-2)
    s+=txt(540,452,"no existe.",64,W(0.82),400)
    s+=window(540,720,392,330)
    s+=pager(1)
    return s+"</svg>"

def s2():
    s=HEAD()+DEFS()+BG()+logo()
    s+=txt(540,250,"Existen dos ventanas.",58,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,304,"La que comprás una vez —y la que pagás siempre.",29,W(0.7),400)
    s+=window(330,520,286,300,material="alu")
    s+=window(748,520,286,300,material="wood",panes=2)
    s+=txt(330,724,"ALUMINIO",30,"#FFFFFF",700,ls=1)
    s+=txt(330,760,"Una vez",25,W(0.6),400)
    s+=txt(748,724,"MADERA",30,W(0.9),700,ls=1)
    s+=txt(748,760,"En cuotas",25,W(0.6),400)
    s+=pager(2)
    return s+"</svg>"

def feature(kick,icon_fn,label,title,d1,d2,pg,target):
    s=HEAD()+DEFS()+BG()+logo()
    s+=window(500,430,420,360)
    s+=badge(886,258,54,icon_fn(886,258),label,target=target)
    s+=txt(540,706,kick,21,W(0.55),600,ls=3)
    s+=txt(540,772,title,72,"#FFFFFF",700,ls=-1)
    s+=txt(540,832,d1,32,W(0.72),400)
    if d2: s+=txt(540,874,d2,32,W(0.72),400)
    s+=pager(pg)
    return s+"</svg>"

def s3(): return feature("CUOTA 1 · EL INVIERNO",i_cold,"FRÍO","El frío",
    "Entra por el marco viejo, no por el vidrio.","Y lo pagás en gas, todos los inviernos.",3,(360,470))
def s4(): return feature("CUOTA 2 · EL RUIDO",i_sound,"RUIDO","El ruido",
    "La avenida, el colectivo, el vecino.","Una ventana barata los deja pasar.",4,(560,430))
def s5(): return feature("CUOTA 3 · LA HUMEDAD",i_drop,"HUMEDAD","La humedad",
    "Condensación, moho, el marco que se hincha.","El problema no era la casa. Era la abertura.",5,(470,470))

def s6():
    s=HEAD()+DEFS()+BG()+logo()
    s+=window(560,420,392,330,opacity=0.32,screws=False)   # ventana fantasma (la segunda)
    s+=window(500,455,392,330)
    s+=badge(892,262,52,i_repeat(892,262),"OTRA VEZ")
    s+=txt(540,742,"CUOTA FINAL · LA SEGUNDA VENTANA",21,W(0.55),600,ls=3)
    s+=txt(540,806,"A los pocos años la cambiás igual.",32,W(0.72),400)
    s+=txt(540,880,"Y la pagás dos veces.",64,"#FFFFFF",700,ls=-1)
    s+=pager(6)
    return s+"</svg>"

def s7():
    s=HEAD()+DEFS()+BG()+logo()
    # esquina de perfil de aluminio a 45° (corte inglete), realista
    cx,cy=540,380
    s+=f'<ellipse cx="{cx}" cy="{cy+180}" rx="230" ry="18" fill="#000" opacity="0.4" filter="url(#shadow)"/>'
    s+=(f'<g><path d="M{cx-190} {cy+150} L{cx-190} {cy-150} L{cx-70} {cy-150} L{cx-70} {cy+30} L{cx+150} {cy+30} L{cx+150} {cy+150} Z" fill="url(#alu)"/>'
        f'<path d="M{cx-190} {cy-150} L{cx-70} {cy-150} L{cx-70} {cy-30} L{cx-70} {cy+30} L{cx+150} {cy+30}" fill="none" stroke="{W(0.25)}" stroke-width="2"/>'
        f'<line x1="{cx-190}" y1="{cy-150}" x2="{cx-70}" y2="{cy-30}" stroke="{W(0.4)}" stroke-width="2"/>'   # linea inglete 45
        f'<line x1="{cx+150}" y1="{cy+150}" x2="{cx-70}" y2="{cy-30}" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>'
        f'</g>')
    s+=txt(cx-30,cy-70,"45°",22,W(0.6),600)
    s+=badge(852,250,50,i_shield(852,250),"CALIDAD")
    s+=txt(540,682,"No es cara la ventana buena.",50,W(0.8),400)
    s+=txt(540,748,"Es carísima la barata, pagada de a poco.",50,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,822,"Fabricamos las nuestras. Por eso te decimos la verdad.",29,W(0.62),400)
    s+=pager(7)
    return s+"</svg>"

def s8():
    s=HEAD()+DEFS()+BG()+logo()
    s+=window(540,400,404,336)
    s+=badge(872,250,54,i_whatsapp(872,250),"WHATSAPP")
    s+=txt(540,700,"¿Cuántas cuotas te falta pagar por tus ventanas?",44,"#FFFFFF",700,ls=-0.5)
    s+=txt(540,760,"Mandanos una foto. Te decimos qué necesitás de verdad.",31,W(0.72),400)
    s+=txt(540,842,"Escribinos por WhatsApp",30,"#FFFFFF",600)
    s+=txt(540,884,"wa.me/541163368643",23,W(0.55),500,ls=1)
    s+=pager(8)
    return s+"</svg>"

slides=[s1(),s2(),s3(),s4(),s5(),s6(),s7(),s8()]
os.makedirs(SLIDES,exist_ok=True)
for i,sv in enumerate(slides,1): open(f"{SLIDES}/slide-{i}.svg","w").write(sv)
print("SVGs:",len(slides))

caps=["Slide 1 · Hook","Slide 2 · Aluminio vs. Madera","Slide 3 · Cuota 1 · El frío",
"Slide 4 · Cuota 2 · El ruido","Slide 5 · Cuota 3 · La humedad","Slide 6 · Cuota final","Slide 7 · El giro","Slide 8 · CTA"]
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
<div class="wrap"><header><p class="eb">Alumfer · Carrusel v4</p>
<h1>La ventana barata no existe</h1>
<p class="l">Ilustraciones de ventanas realistas como protagonista (aluminio con reflejo, profundidad y sombra),
íconos glass como info periférica con conector, gradiente azul→transparente de la marca, todo Montserrat.
Nota: el preview usa fuente de sistema; en Canva se ve con Montserrat.</p></header>
{cards}
<div class="note"><b>Archivos:</b> <code>package/slides/slide-1..8.svg</code>. En Canva asigná <b>Montserrat</b> a todo el texto.</div></div>'''
open(f"{PKG}/preview.html","w").write(html)
print("preview OK")
