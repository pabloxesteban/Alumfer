#!/usr/bin/env python3
# Carrusel v3 — minimalista (Apple/Google), monocromo desde el blanco,
# tipografia Montserrat/Inter centrada, badges de iconos glass, logo real en todas.
import base64, os, math

ROOT="/home/user/Alumfer"
PKG=f"{ROOT}/creative/content/projects/2026-07-carrusel-compartible/package"
SLIDES=f"{PKG}/slides"
LOGO=base64.b64encode(open(f"{ROOT}/apps/website/solologo.png","rb").read()).decode()
LOGO_URI=f"data:image/png;base64,{LOGO}"

# paleta monocroma (blanco sobre gradiente sutil gris->negro)
def W(a): return f"rgba(255,255,255,{a})"
FONT_DISP="Montserrat, 'Helvetica Neue', Arial, sans-serif"
FONT_BODY="Inter, 'Helvetica Neue', Arial, sans-serif"

def defs():
    return (
    '<defs>'
    '<radialGradient id="bg" cx="50%" cy="33%" r="82%">'
    '<stop offset="0" stop-color="#2b2f33"/><stop offset="0.55" stop-color="#1b1e21"/>'
    '<stop offset="1" stop-color="#121316"/></radialGradient>'
    '<filter id="soft" x="-60%" y="-60%" width="220%" height="220%">'
    '<feGaussianBlur stdDeviation="18"/></filter>'
    '<radialGradient id="glass" cx="50%" cy="35%" r="70%">'
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>'
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0.03"/></radialGradient>'
    '</defs>')

def head(): return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" '
                     f'width="1080" height="1080" font-family="{FONT_BODY}">')

def bg(): return f'<rect width="1080" height="1080" fill="url(#bg)"/>'

def logo_header():
    # emblema real + wordmark, arriba-izquierda (igual criterio que el header web)
    h=46; w=h*1.42
    x=80; y=74
    s=f'<image href="{LOGO_URI}" x="{x}" y="{y}" width="{w:.0f}" height="{h}" preserveAspectRatio="xMidYMid meet"/>'
    tx=x+w+12
    s+=f'<text x="{tx:.0f}" y="{y+22}" fill="{W(0.92)}" font-family="{FONT_DISP}" font-size="24" font-weight="700" letter-spacing="1">ALUMFER</text>'
    s+=f'<text x="{tx:.0f}" y="{y+42}" fill="{W(0.45)}" font-size="13" font-weight="400" letter-spacing="2">CARPINTERÍA DE ALUMINIO</text>'
    # tag arriba-derecha
    s+=f'<text x="1000" y="{y+28}" text-anchor="end" fill="{W(0.4)}" font-size="16" letter-spacing="2">ZONA SUR · GBA</text>'
    return s

def pager(n):
    return (f'<text x="540" y="1016" text-anchor="middle" fill="{W(0.32)}" font-size="18" '
            f'letter-spacing="4">{n} / 8</text>')

def t(x,y,s,size,color,weight=400,disp=False,anchor="middle",ls=0):
    fam=FONT_DISP if disp else FONT_BODY
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-family="{fam}" '
            f'font-size="{size}" font-weight="{weight}" letter-spacing="{ls}">{s}</text>')

# ---------- iconos (linea blanca, centrados en cx,cy) ----------
def ic_cold(cx,cy,r=30):
    s='<g stroke="%s" stroke-width="4" stroke-linecap="round" fill="none">'%W(0.92)
    for ang in (90,30,-30,-90,-150,150):
        a=math.radians(ang); x2=cx+r*math.cos(a); y2=cy-r*math.sin(a)
        s+=f'<line x1="{cx}" y1="{cy}" x2="{x2:.1f}" y2="{y2:.1f}"/>'
    # puntas
    for ang in (90,-30,-150):
        a=math.radians(ang); ex=cx+r*math.cos(a); ey=cy-r*math.sin(a)
        for d in (35,-35):
            b=math.radians(ang+d); bx=ex+10*math.cos(b); by=ey-10*math.sin(b)
            s+=f'<line x1="{ex:.1f}" y1="{ey:.1f}" x2="{bx:.1f}" y2="{by:.1f}"/>'
    return s+'</g>'

def ic_sound(cx,cy,r=30):
    s=f'<circle cx="{cx-r+6}" cy="{cy}" r="5" fill="{W(0.92)}"/>'
    s+='<g stroke="%s" stroke-width="4" fill="none" stroke-linecap="round">'%W(0.92)
    for i,rr in enumerate((16,27,38)):
        s+=f'<path d="M{cx-r+12} {cy-rr} A {rr} {rr} 0 0 1 {cx-r+12} {cy+rr}" opacity="{1-0.22*i:.2f}"/>'
    return s+'</g>'

def ic_drop(cx,cy,r=30):
    return (f'<path d="M{cx} {cy-r} C {cx+r*0.85} {cy-r*0.15} {cx+r*0.7} {cy+r} {cx} {cy+r} '
            f'C {cx-r*0.7} {cy+r} {cx-r*0.85} {cy-r*0.15} {cx} {cy-r} Z" '
            f'fill="none" stroke="{W(0.92)}" stroke-width="4"/>')

def ic_repeat(cx,cy,r=30):
    s='<g stroke="%s" stroke-width="4" fill="none" stroke-linecap="round">'%W(0.92)
    s+=f'<path d="M{cx-r} {cy} A {r} {r} 0 1 1 {cx} {cy+r}"/>'
    s+=f'<polyline points="{cx-r-8},{cy-10} {cx-r},{cy} {cx-r+10},{cy-8}"/>'
    s+='</g>'
    s+=f'<text x="{cx+6}" y="{cy+9}" text-anchor="middle" fill="{W(0.92)}" font-family="{FONT_DISP}" font-size="26" font-weight="700">2</text>'
    return s

def ic_shield(cx,cy,r=30):
    s=(f'<path d="M{cx} {cy-r} L {cx+r*0.8} {cy-r*0.6} L {cx+r*0.8} {cy+r*0.2} '
       f'Q {cx+r*0.8} {cy+r*0.9} {cx} {cy+r} Q {cx-r*0.8} {cy+r*0.9} {cx-r*0.8} {cy+r*0.2} '
       f'L {cx-r*0.8} {cy-r*0.6} Z" fill="none" stroke="{W(0.92)}" stroke-width="4"/>')
    s+=f'<polyline points="{cx-11},{cy} {cx-3},{cy+9} {cx+13},{cy-11}" fill="none" stroke="{W(0.92)}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    return s

def ic_whatsapp(cx,cy,r=30):
    bub=f'M{cx} {cy-r} a{r} {r} 0 1 0 -{r*0.85:.0f} {r*1.5:.0f} l-{r*0.45:.0f} {r*0.16:.0f} {r*0.16:.0f} -{r*0.45:.0f} a{r} {r} 0 0 0 {r*1.14:.0f} -{r*1.21:.0f} z'
    hand=(f'M{cx-r*0.23:.0f} {cy-r*0.27:.0f} c-1 -1 -3 -1 -4 1 c-2 3 -1 8 3 12 c4 4 9 5 12 3 '
          f'c2 -1 2 -3 1 -4 l-3 -3 c-1 -1 -2 -1 -3 0 l-1 1 c-2 -1 -4 -3 -5 -5 l1 -1 c1 -1 1 -2 0 -3 z')
    return f'<path d="{bub}" fill="{W(0.92)}"/><path d="{hand}" fill="none" stroke="#1b1e21" stroke-width="0"/>'

def glass_badge(cx,cy,r,icon,label=None):
    s=f'<circle cx="{cx}" cy="{cy}" r="{r*1.15}" fill="{W(0.05)}" filter="url(#soft)"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glass)" stroke="{W(0.18)}" stroke-width="1.5"/>'
    s+=f'<path d="M{cx-r*0.55} {cy-r*0.62} A {r} {r} 0 0 1 {cx+r*0.62} {cy-r*0.55}" fill="none" stroke="{W(0.28)}" stroke-width="2" stroke-linecap="round"/>'
    s+=icon
    if label:
        s+=f'<text x="{cx}" y="{cy+r+42}" text-anchor="middle" fill="{W(0.55)}" font-size="22" font-weight="500" letter-spacing="2">{label}</text>'
    return s

def win_glyph(cx,cy,w,h,grid=False,handle=False,grain=False,sw=3):
    x=cx-w/2; y=cy-h/2
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{W(0.85)}" stroke-width="{sw+2}"/>'
    if grid:
        for gx in (x+w/3, x+2*w/3): s+=f'<line x1="{gx}" y1="{y}" x2="{gx}" y2="{y+h}" stroke="{W(0.7)}" stroke-width="{sw}"/>'
        for gy in (y+h/3, y+2*h/3): s+=f'<line x1="{x}" y1="{gy}" x2="{x+w}" y2="{gy}" stroke="{W(0.7)}" stroke-width="{sw}"/>'
    else:
        s+=f'<line x1="{cx}" y1="{y}" x2="{cx}" y2="{y+h}" stroke="{W(0.8)}" stroke-width="{sw}"/>'
        if handle: s+=f'<line x1="{cx-8}" y1="{cy-16}" x2="{cx-8}" y2="{cy+16}" stroke="{W(0.8)}" stroke-width="{sw}"/>'
    if grain:
        for gy in (y+h*0.3, y+h*0.6, y+h*0.8):
            s+=f'<path d="M{x+8} {gy} q {w*0.25} -6 {w*0.5} 0 t {w*0.4} 0" fill="none" stroke="{W(0.14)}" stroke-width="1.5"/>'
    return s

# ---------------- SLIDES ----------------
def s1():
    s=head()+defs()+bg()+logo_header()
    s+=t(540,438,"La ventana",76,W(0.72),300,disp=True,ls=1)
    s+=t(540,566,"barata",130,"#FFFFFF",700,disp=True,ls=-2)
    s+=t(540,676,"no existe.",76,W(0.72),300,disp=True,ls=1)
    s+=f'<line x1="490" y1="748" x2="590" y2="748" stroke="{W(0.3)}" stroke-width="2"/>'
    s+=pager(1)
    return s+"</svg>"

def s2():
    s=head()+defs()+bg()+logo_header()
    s+=t(540,318,"Existen dos ventanas.",62,"#FFFFFF",600,disp=True,ls=-0.5)
    s+=t(540,372,"La que comprás una vez —y la que pagás siempre.",30,W(0.6),400)
    # aluminio (izq)
    s+=win_glyph(352,560,210,244,grid=False,handle=True)
    s+=t(352,676,"ALUMINIO",30,"#FFFFFF",600,disp=True,ls=1)
    s+=t(352,712,"Una vez",26,W(0.55),400)
    # madera (der)
    s+=win_glyph(728,560,210,244,grid=True,grain=True)
    s+=t(728,676,"MADERA",30,W(0.85),600,disp=True,ls=1)
    s+=t(728,712,"En cuotas",26,W(0.55),400)
    s+=pager(2)
    return s+"</svg>"

def feature(n,total,kick,icon_fn,keyword,desc1,desc2,pg):
    s=head()+defs()+bg()+logo_header()
    s+=t(540,300,kick,22,W(0.5),500,ls=3)
    s+=glass_badge(540,462,92,icon_fn(540,462,40))
    s+=t(540,678,keyword,74,"#FFFFFF",700,disp=True,ls=-1)
    s+=t(540,742,desc1,33,W(0.68),400)
    if desc2: s+=t(540,786,desc2,33,W(0.68),400)
    s+=pager(pg)
    return s+"</svg>"

def s3(): return feature(1,4,"CUOTA 1 · EL INVIERNO",ic_cold,"El frío",
        "Entra por el marco viejo, no por el vidrio.","Y lo pagás en gas, todos los inviernos.",3)
def s4(): return feature(2,4,"CUOTA 2 · EL RUIDO",ic_sound,"El ruido",
        "La avenida, el colectivo, el vecino.","Una ventana barata los deja pasar.",4)
def s5(): return feature(3,4,"CUOTA 3 · LA HUMEDAD",ic_drop,"La humedad",
        "Condensación, moho, el marco que se hincha.","El problema no era la casa. Era la abertura.",5)

def s6():
    s=head()+defs()+bg()+logo_header()
    s+=t(540,300,"CUOTA FINAL · LA SEGUNDA VENTANA",22,W(0.5),500,ls=3)
    s+=glass_badge(540,462,92,ic_repeat(540,462,38))
    s+=t(540,676,"A los pocos años la cambiás igual.",34,W(0.68),400)
    s+=t(540,772,"Y la pagás dos veces.",70,"#FFFFFF",700,disp=True,ls=-1)
    s+=pager(6)
    return s+"</svg>"

def s7():
    s=head()+defs()+bg()+logo_header()
    s+=glass_badge(540,332,64,ic_shield(540,332,30))
    s+=t(540,506,"No es cara la ventana buena.",54,W(0.75),300,disp=True,ls=-0.5)
    s+=t(540,584,"Es carísima la barata,",54,"#FFFFFF",700,disp=True,ls=-1)
    s+=t(540,648,"pagada de a poco.",54,W(0.75),300,disp=True,ls=-0.5)
    s+=t(540,742,"Fabricamos las nuestras. Por eso te decimos la verdad.",30,W(0.6),400)
    s+=pager(7)
    return s+"</svg>"

def s8():
    s=head()+defs()+bg()+logo_header()
    s+=t(540,372,"¿Cuántas cuotas te falta",60,"#FFFFFF",600,disp=True,ls=-1)
    s+=t(540,442,"pagar por tus ventanas?",60,"#FFFFFF",600,disp=True,ls=-1)
    s+=t(540,522,"Mandanos una foto. Te decimos qué necesitás de verdad.",32,W(0.65),400)
    s+=glass_badge(540,672,80,ic_whatsapp(540,672,34))
    s+=t(540,812,"Escribinos por WhatsApp",32,"#FFFFFF",500)
    s+=t(540,856,"wa.me/541163368643",24,W(0.5),400,ls=1)
    s+=pager(8)
    return s+"</svg>"

slides=[s1(),s2(),s3(),s4(),s5(),s6(),s7(),s8()]
os.makedirs(SLIDES,exist_ok=True)
for i,sv in enumerate(slides,1): open(f"{SLIDES}/slide-{i}.svg","w").write(sv)
print("SVGs:",len(slides))

caps=["Slide 1 · Hook","Slide 2 · Aluminio vs. Madera","Slide 3 · Cuota 1 · El frío",
"Slide 4 · Cuota 2 · El ruido","Slide 5 · Cuota 3 · La humedad","Slide 6 · Cuota final",
"Slide 7 · El giro","Slide 8 · CTA"]
cards=""
for i,sv in enumerate(slides,1):
    inner=sv[sv.index(">")+1:sv.rindex("</svg>")]
    cards+=(f'<figure class="frame"><div class="card"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">{inner}</svg></div>'
            f'<figcaption><span class="n">{caps[i-1]}</span></figcaption></figure>')

html=f'''<style>
 :root{{--page-bg:#111315;--page-panel:#191b1e;--page-ink:#E8E4DC;--page-ink-dim:#9a978f;--page-line:rgba(255,255,255,.10);
 --body:system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--disp:"Helvetica Neue",Arial,system-ui,sans-serif;}}
 @media (prefers-color-scheme:light){{:root{{--page-bg:#EDEAE3;--page-panel:#F5F4F1;--page-ink:#26282a;--page-ink-dim:#6b6a64;--page-line:rgba(26,28,30,.12)}}}}
 :root[data-theme="dark"]{{--page-bg:#111315;--page-panel:#191b1e;--page-ink:#E8E4DC;--page-ink-dim:#9a978f;--page-line:rgba(255,255,255,.10)}}
 :root[data-theme="light"]{{--page-bg:#EDEAE3;--page-panel:#F5F4F1;--page-ink:#26282a;--page-ink-dim:#6b6a64;--page-line:rgba(26,28,30,.12)}}
 *{{box-sizing:border-box}} body{{margin:0;background:var(--page-bg);color:var(--page-ink);font-family:var(--body);line-height:1.5;-webkit-font-smoothing:antialiased}}
 .wrap{{max-width:640px;margin:0 auto;padding:clamp(1.25rem,5vw,3rem) clamp(1rem,4vw,2rem)}}
 header{{border-bottom:1px solid var(--page-line);padding-bottom:1.6rem;margin-bottom:2rem}}
 .eyebrow{{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#9a978f;font-weight:700;margin:0 0 .7rem}}
 h1{{font-family:var(--disp);font-weight:800;letter-spacing:-.02em;line-height:1.05;font-size:clamp(1.6rem,5.5vw,2.3rem);margin:0 0 .8rem}}
 .lede{{color:var(--page-ink-dim);font-size:.95rem;margin:0;max-width:58ch}}
 .frame{{margin:0 0 2rem}} .card{{border-radius:2px;overflow:hidden;box-shadow:0 18px 50px -20px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.06)}}
 .card svg{{display:block;width:100%;height:auto}}
 figcaption{{margin-top:.7rem;font-size:.8rem;color:var(--page-ink-dim)}} figcaption .n{{font-weight:700;color:var(--page-ink)}}
 .note{{background:var(--page-panel);border:1px solid var(--page-line);border-radius:10px;padding:1.2rem 1.3rem;font-size:.85rem;color:var(--page-ink-dim)}}
 .note b{{color:var(--page-ink)}} .note code{{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.8em;background:rgba(127,127,127,.16);padding:.1em .4em;border-radius:4px}}
</style>
<div class="wrap"><header>
 <p class="eyebrow">Alumfer · Carrusel v3 · minimalista</p>
 <h1>La ventana barata no existe</h1>
 <p class="lede">Rediseño minimalista (Apple/Google): monocromo desde el blanco, tipografía Montserrat/Inter
  centrada con jerarquía por peso, badges de íconos glass para cada "cuota", logo real en todas las slides
  y fondo con gradiente sutil gris→negro. Nota: el preview usa fuente de sistema; en Canva/export se ve con Montserrat/Inter.</p>
</header>
{cards}
 <div class="note"><b>Archivos:</b> <code>package/slides/slide-1..8.svg</code>. Para máxima fidelidad,
 en Canva asigná <b>Montserrat</b> (títulos) e <b>Inter</b> (cuerpo).</div>
</div>'''
open(f"{PKG}/preview.html","w").write(html)
print("preview.html OK")
