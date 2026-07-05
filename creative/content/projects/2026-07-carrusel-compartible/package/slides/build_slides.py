#!/usr/bin/env python3
# Genera las 8 slides del carrusel (versión restyle) + preview.html
import base64, os

ROOT="/home/user/Alumfer"
PKG=f"{ROOT}/creative/content/projects/2026-07-carrusel-compartible/package"
SLIDES=f"{PKG}/slides"

# --- logo real (emblema blanco) embebido ---
logo_b64 = base64.b64encode(open(f"{ROOT}/apps/website/solologo.png","rb").read()).decode()
LOGO_URI = f"data:image/png;base64,{logo_b64}"

# --- paleta (web + puente IG) ---
CARBON="#1A1C1E"; CARBON2="#141618"; STEEL="#2E3338"
CONCRETE="#B0A99A"; CONCRETE_L="#E8E4DC"
BLUE="#1B6CC8"; BLUEL="#4A9DE8"; WHITE="#FFFFFF"
ALU="#C9CDD1"; ALU_D="#8A9096"          # aluminio
WOOD="#9C6B3B"; WOOD_D="#6E4A26"        # madera
GLASS="#3A5566"                          # vidrio

FONT='font-family="Arial, \'Helvetica Neue\', Helvetica, sans-serif"'

def header():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" '
            f'width="1080" height="1080" {FONT}>')

def bg():
    return (f'<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{CARBON}"/><stop offset="1" stop-color="{CARBON2}"/>'
            f'</linearGradient></defs><rect width="1080" height="1080" fill="url(#bg)"/>')

def watermark():
    # marca ALUMFER simplificada (chevrones) arriba-derecha, sutil (nod al watermark del IG)
    x,y=childx=905,86
    ch=(f'<g opacity="0.13" fill="none" stroke="{WHITE}" stroke-width="9">'
        f'<polyline points="{x-46},{y+40} {x},{y} {x+46},{y+40}"/>'
        f'<polyline points="{x-46},{y+62} {x},{y+22} {x+46},{y+62}"/>'
        f'</g>'
        f'<text x="{x}" y="{y+92}" text-anchor="middle" fill="{WHITE}" opacity="0.13" '
        f'font-size="19" font-weight="800" letter-spacing="4">ALUMFER</text>')
    return ch

def kicker_bar(text_main, text_sub):
    # barra azul con la "Cuota N" (puente con las barras azules del IG)
    w = 60 + (len(text_main)+len(text_sub))*17
    return (f'<rect x="90" y="104" width="{w}" height="58" rx="6" fill="{BLUE}"/>'
            f'<text x="116" y="143" fill="{WHITE}" font-size="26" font-weight="800" '
            f'letter-spacing="2">{text_main}<tspan fill="{CONCRETE_L}" font-weight="600"> · {text_sub}</tspan></text>')

def logo_lockup(cx, y, h=104, center=True):
    # emblema real + wordmark, como en el header de la web
    w = h*1.42
    tx = cx - (w/2) - 8 if center else cx
    # si centrado, calculamos ancho total aprox y desplazamos
    total = w + 250
    x0 = cx - total/2 if center else cx
    img = f'<image href="{LOGO_URI}" x="{x0:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" preserveAspectRatio="xMidYMid meet"/>'
    txx = x0 + w + 6
    t = (f'<text x="{txx:.0f}" y="{y+h*0.52:.0f}" fill="{WHITE}" font-size="{h*0.44:.0f}" '
         f'font-weight="800" letter-spacing="6">ALUMFER</text>'
         f'<text x="{txx:.0f}" y="{y+h*0.82:.0f}" fill="{CONCRETE}" font-size="{h*0.17:.0f}" '
         f'font-weight="600" letter-spacing="3">CARPINTERÍA DE ALUMINIO</text>')
    return img+t

def wa_icon(x,y,r=34,color="#25D366"):
    # ícono WhatsApp reconocible (verde de plataforma), sin botón/enlace
    # burbuja con cola + auricular clásico
    bub=(f'M{x} {y-19} a19 19 0 1 0 -16 29 l-9 3 3 -9 a19 19 0 0 0 22 -23 z')
    handset=(f'M{x-7} {y-8} c-1 -1 -3 -1 -4 1 c-2 3 -1 7 2 11 c4 4 8 5 11 3 '
             f'c2 -1 2 -3 1 -4 l-3 -3 c-1 -1 -2 -1 -3 0 l-1 1 c-2 -1 -3 -2 -4 -4 '
             f'l1 -1 c1 -1 1 -2 0 -3 z')
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'
            f'<path d="{bub}" fill="#FFFFFF"/>'
            f'<path d="{handset}" fill="{color}"/>')

def bottom_scrim():
    return ('<defs><linearGradient id="sc" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0.5" stop-color="{CARBON}" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="{CARBON}" stop-opacity="0.6"/></linearGradient></defs>')

def arrow(x1,y1,x2,y2,color,w=4):
    import math
    ang=math.atan2(y2-y1,x2-x1); a=14
    hx1=x2-a*math.cos(ang-0.5); hy1=y2-a*math.sin(ang-0.5)
    hx2=x2-a*math.cos(ang+0.5); hy2=y2-a*math.sin(ang+0.5)
    return (f'<g stroke="{color}" stroke-width="{w}" fill="none" stroke-linecap="round">'
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'
            f'<polyline points="{hx1:.0f},{hy1:.0f} {x2},{y2} {hx2:.0f},{hy2:.0f}"/></g>')

# ---------------- SLIDES ----------------
def slide1():
    s=header()+bg()
    s+=f'<rect x="64" y="64" width="952" height="952" fill="none" stroke="{CONCRETE}" stroke-opacity="0.16" stroke-width="2"/>'
    s+=f'<rect x="84" y="84" width="912" height="912" fill="none" stroke="{CONCRETE}" stroke-opacity="0.07" stroke-width="1"/>'
    s+=f'<text x="540" y="430" text-anchor="middle" fill="{WHITE}" font-size="128" font-weight="800" letter-spacing="-3">La ventana</text>'
    s+=f'<text x="540" y="566" text-anchor="middle" fill="{BLUEL}" font-size="128" font-weight="800" letter-spacing="-3">barata</text>'
    s+=f'<text x="540" y="702" text-anchor="middle" fill="{WHITE}" font-size="128" font-weight="800" letter-spacing="-3">no existe.</text>'
    s+=f'<line x1="490" y1="770" x2="590" y2="770" stroke="{BLUE}" stroke-width="4"/>'
    s+=logo_lockup(540, 872, h=96, center=True)
    return s+"</svg>"

def slide2():
    s=header()+bg()+watermark()
    # --- ALUMINIO (izq): frame fino, sobrio, frío ---
    s+=f'<rect x="150" y="168" width="290" height="330" fill="#1f2325" stroke="{ALU}" stroke-width="7"/>'
    s+=f'<rect x="164" y="182" width="262" height="302" fill="{CONCRETE_L}" fill-opacity="0.05"/>'
    s+=f'<line x1="295" y1="168" x2="295" y2="498" stroke="{ALU}" stroke-width="4"/>'
    s+=f'<line x1="150" y1="333" x2="440" y2="333" stroke="{ALU}" stroke-width="4"/>'
    s+=f'<line x1="426" y1="196" x2="360" y2="262" stroke="{WHITE}" stroke-opacity="0.5" stroke-width="2"/>'
    s+=f'<line x1="426" y1="238" x2="372" y2="292" stroke="{WHITE}" stroke-opacity="0.4" stroke-width="2"/>'
    s+=f'<text x="295" y="548" text-anchor="middle" fill="{ALU}" font-size="27" font-weight="800" letter-spacing="3">ALUMINIO</text>'
    s+=f'<text x="295" y="580" text-anchor="middle" fill="{CONCRETE}" font-size="20" font-weight="600" letter-spacing="2">PAGÁS UNA VEZ</text>'
    # --- MADERA (der): frame grueso, cálido, colonial, gastado ---
    s+=f'<rect x="640" y="168" width="290" height="330" fill="#241f1a" stroke="{WOOD}" stroke-width="16"/>'
    s+=f'<rect x="656" y="184" width="258" height="298" fill="none" stroke="{WOOD_D}" stroke-width="3"/>'
    for gx in (785,):  # muntin vertical
        s+=f'<line x1="{gx}" y1="168" x2="{gx}" y2="498" stroke="{WOOD}" stroke-width="11"/>'
    for gy in (278,388):  # muntins horizontales (grilla colonial)
        s+=f'<line x1="640" y1="{gy}" x2="930" y2="{gy}" stroke="{WOOD}" stroke-width="11"/>'
    # desgaste: veta + esquina saltada
    s+=f'<path d="M664 470 q10 -12 0 -24" fill="none" stroke="{WOOD_D}" stroke-width="2"/>'
    s+=f'<path d="M912 190 l14 0 -14 14 z" fill="{CARBON}"/>'
    s+=f'<text x="785" y="548" text-anchor="middle" fill="{WOOD}" font-size="27" font-weight="800" letter-spacing="3">MADERA</text>'
    s+=f'<text x="785" y="580" text-anchor="middle" fill="{CONCRETE}" font-size="20" font-weight="600" letter-spacing="2">…Y EN CUOTAS</text>'
    # texto
    s+=f'<text x="90" y="720" fill="{WHITE}" font-size="94" font-weight="800" letter-spacing="-3">Existen dos.</text>'
    s+=f'<text x="90" y="820" fill="{CONCRETE_L}" font-size="40">La que pagás una vez. Y la que pagás en</text>'
    s+=f'<text x="90" y="874" font-size="40" font-weight="700"><tspan fill="{BLUEL}">cuotas</tspan><tspan fill="{CONCRETE_L}" font-weight="400"> —sin que nadie te avise— durante años.</tspan></text>'
    return s+"</svg>"

def slide3():
    # DVH isométrico: el frío se frena en el vidrio; se cuela por el marco viejo
    s=header()+bg()+watermark()
    s+=kicker_bar("CUOTA 1","EL INVIERNO")
    # etiquetas afuera/adentro
    s+=f'<text x="150" y="250" fill="{CONCRETE}" font-size="20" font-weight="700" letter-spacing="3">AFUERA</text>'
    s+=f'<text x="930" y="250" text-anchor="end" fill="{CONCRETE}" font-size="20" font-weight="700" letter-spacing="3">ADENTRO</text>'
    # glow cálido interior
    s+=f'<defs><radialGradient id="warm" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="{CONCRETE_L}" stop-opacity="0.16"/><stop offset="1" stop-color="{CONCRETE_L}" stop-opacity="0"/></radialGradient></defs>'
    s+=f'<ellipse cx="820" cy="430" rx="180" ry="180" fill="url(#warm)"/>'
    # unidad DVH isométrica (proyección oblicua, profundidad hacia arriba-derecha)
    Ax,Ay,fw,fh=430,540,180,300; dx,dy=64,-36
    # cara frontal (vidrio exterior)
    s+=f'<rect x="{Ax}" y="{Ay-fh}" width="{fw}" height="{fh}" fill="{GLASS}" fill-opacity="0.55" stroke="{ALU}" stroke-width="6"/>'
    s+=f'<rect x="{Ax+16}" y="{Ay-fh+16}" width="{fw-32}" height="{fh-32}" fill="{GLASS}" fill-opacity="0.35"/>'
    # cara superior (muestra doble vidrio + cámara de aire)
    top=f'{Ax},{Ay-fh} {Ax+fw},{Ay-fh} {Ax+fw+dx},{Ay-fh+dy} {Ax+dx},{Ay-fh+dy}'
    s+=f'<polygon points="{top}" fill="{ALU_D}" fill-opacity="0.85" stroke="{ALU}" stroke-width="3"/>'
    # dos láminas de vidrio en la cara superior
    s+=f'<line x1="{Ax+21}" y1="{Ay-fh}" x2="{Ax+21+dx}" y2="{Ay-fh+dy}" stroke="{BLUEL}" stroke-width="6"/>'
    s+=f'<line x1="{Ax+fw-21}" y1="{Ay-fh}" x2="{Ax+fw-21+dx}" y2="{Ay-fh+dy}" stroke="{BLUEL}" stroke-width="6"/>'
    s+=f'<text x="{Ax+fw//2+dx//2}" y="{Ay-fh+dy-14}" text-anchor="middle" fill="{CONCRETE}" font-size="18" font-weight="800" letter-spacing="2">DVH</text>'
    # cara derecha (canto / marco aluminio)
    right=f'{Ax+fw},{Ay} {Ax+fw},{Ay-fh} {Ax+fw+dx},{Ay-fh+dy} {Ax+fw+dx},{Ay+dy}'
    s+=f'<polygon points="{right}" fill="{ALU_D}" fill-opacity="0.6" stroke="{ALU}" stroke-width="3"/>'
    # flechas de frío frenadas por el vidrio
    s+=arrow(300,320,Ax-6,320,BLUEL)
    s+=arrow(300,390,Ax-6,390,BLUEL)
    # marca de bloqueo
    s+=f'<line x1="{Ax-4}" y1="300" x2="{Ax-4}" y2="410" stroke="{WHITE}" stroke-width="3" stroke-opacity="0.7"/>'
    # una flecha se cuela por el MARCO (abajo) -> sigue de largo
    s+=arrow(300,516,720,516,CONCRETE_L)
    s+=f'<text x="512" y="500" text-anchor="middle" fill="{CONCRETE_L}" font-size="17" font-weight="700" letter-spacing="1">…pero por el marco viejo, sí</text>'
    # headline
    s+=f'<text x="90" y="742" fill="{WHITE}" font-size="60" font-weight="800" letter-spacing="-1.5">El frío no pasa por el DVH.</text>'
    s+=f'<text x="90" y="812" font-size="60" font-weight="800" letter-spacing="-1.5"><tspan fill="{WHITE}">Pasa por el </tspan><tspan fill="{BLUEL}">marco viejo</tspan><tspan fill="{WHITE}">.</tspan></text>'
    s+=f'<text x="90" y="884" fill="{CONCRETE}" font-size="36">Y ese frío lo pagás en la factura de gas.</text>'
    s+=f'<text x="90" y="936" fill="{CONCRETE}" font-size="36">Todos los meses fríos. Todos los años.</text>'
    return s+"</svg>"

def slide4():
    s=header()+bg()+watermark()
    s+=kicker_bar("CUOTA 2","EL RUIDO")
    s+=f'<rect x="560" y="250" width="300" height="300" fill="#202225" stroke="{CONCRETE}" stroke-width="3"/>'
    s+=f'<line x1="710" y1="250" x2="710" y2="550" stroke="{CONCRETE}" stroke-opacity="0.6" stroke-width="2"/>'
    s+=f'<line x1="560" y1="400" x2="860" y2="400" stroke="{CONCRETE}" stroke-opacity="0.6" stroke-width="2"/>'
    s+=(f'<g fill="none" stroke="{BLUEL}" stroke-linecap="round">'
        f'<path d="M470 400 a90 90 0 0 0 -150 0" stroke-opacity="0.9" stroke-width="4"/>'
        f'<path d="M430 400 a130 130 0 0 0 -230 0" stroke-opacity="0.55" stroke-width="3"/>'
        f'<path d="M390 400 a170 170 0 0 0 -300 0" stroke-opacity="0.3" stroke-width="2"/></g>')
    s+=f'<circle cx="470" cy="400" r="7" fill="{BLUEL}"/>'
    s+=f'<text x="90" y="712" fill="{WHITE}" font-size="70" font-weight="800" letter-spacing="-2">La avenida, el colectivo,</text>'
    s+=f'<text x="90" y="788" fill="{WHITE}" font-size="70" font-weight="800" letter-spacing="-2">el vecino.</text>'
    s+=f'<text x="90" y="874" fill="{CONCRETE}" font-size="38">Una ventana barata no los frena:</text>'
    s+=f'<text x="90" y="926" font-size="38" font-weight="700"><tspan fill="{CONCRETE}" font-weight="400">los deja pasar a tu </tspan><tspan fill="{BLUEL}">living.</tspan></text>'
    return s+"</svg>"

def slide5():
    s=header()+bg()+watermark()
    s+=kicker_bar("CUOTA 3","LA HUMEDAD")
    s+=f'<rect x="420" y="240" width="300" height="300" fill="#202225" stroke="{CONCRETE}" stroke-width="3"/>'
    s+=f'<line x1="570" y1="240" x2="570" y2="540" stroke="{CONCRETE}" stroke-opacity="0.6" stroke-width="2"/>'
    s+=f'<line x1="420" y1="390" x2="720" y2="390" stroke="{CONCRETE}" stroke-opacity="0.6" stroke-width="2"/>'
    drops=[(470,300,6,9),(520,340,5,8),(495,450,7,11),(640,310,5,8),(660,470,6,10),(450,500,5,8),(610,430,4,7),(540,500,6,9)]
    s+='<g fill="%s" fill-opacity="0.5">'%CONCRETE + ''.join(f'<ellipse cx="{a}" cy="{b}" rx="{c}" ry="{d}"/>' for a,b,c,d in drops)+'</g>'
    s+=f'<g fill="#4a4a3d" fill-opacity="0.9"><circle cx="435" cy="525" r="10"/><circle cx="452" cy="530" r="7"/><circle cx="428" cy="512" r="6"/><circle cx="446" cy="516" r="5"/><circle cx="460" cy="524" r="4"/></g>'
    s+=f'<text x="90" y="700" fill="{WHITE}" font-size="56" font-weight="800" letter-spacing="-1.5">Condensación en el vidrio.</text>'
    s+=f'<text x="90" y="766" fill="{WHITE}" font-size="56" font-weight="800" letter-spacing="-1.5">Moho en la pared.</text>'
    s+=f'<text x="90" y="832" fill="{WHITE}" font-size="56" font-weight="800" letter-spacing="-1.5">El marco que se hincha.</text>'
    s+=f'<text x="90" y="920" font-size="38" font-weight="700"><tspan fill="{CONCRETE}" font-weight="400">El problema no era la casa. Era la </tspan><tspan fill="{BLUEL}">abertura.</tspan></text>'
    return s+"</svg>"

def slide6():
    s=header()+bg()+watermark()
    s+=f'<rect x="640" y="150" width="330" height="330" fill="none" stroke="{CONCRETE}" stroke-opacity="0.12" stroke-width="2"/>'
    s+=f'<rect x="700" y="210" width="330" height="330" fill="none" stroke="{CONCRETE}" stroke-opacity="0.20" stroke-width="2"/>'
    s+=kicker_bar("CUOTA FINAL","LA SEGUNDA VENTANA")
    s+=f'<text x="90" y="560" fill="{WHITE}" font-size="80" font-weight="800" letter-spacing="-2">A los pocos años</text>'
    s+=f'<text x="90" y="652" fill="{WHITE}" font-size="80" font-weight="800" letter-spacing="-2">la cambiás igual.</text>'
    s+=f'<text x="90" y="792" fill="{CONCRETE}" font-size="46">Y pagás la instalación</text>'
    s+=f'<text x="90" y="944" fill="{BLUEL}" font-size="150" font-weight="800" letter-spacing="-5">dos veces.</text>'
    return s+"</svg>"

def slide7():
    s=header()+bg()+watermark()
    s+=f'<g stroke="{ALU}" stroke-width="4" fill="none"><path d="M400 200 H840 V260 H460 V640 H400 Z"/></g>'
    s+=f'<line x1="400" y1="200" x2="460" y2="260" stroke="{BLUEL}" stroke-width="2"/>'
    s+=f'<text x="486" y="300" fill="{CONCRETE}" font-size="24" font-weight="700" letter-spacing="1">45°</text>'
    s+=f'<g stroke="{CONCRETE}" stroke-opacity="0.6" stroke-width="2"><line x1="400" y1="680" x2="840" y2="680"/><line x1="400" y1="668" x2="400" y2="692"/><line x1="840" y1="668" x2="840" y2="692"/></g>'
    s+=f'<text x="620" y="722" text-anchor="middle" fill="{CONCRETE}" font-size="20" font-weight="700" letter-spacing="3">MEDIDA VERIFICADA · FABRICACIÓN PROPIA</text>'
    s+=f'<text x="90" y="812" fill="{WHITE}" font-size="58" font-weight="800" letter-spacing="-1.5">No es cara la ventana buena.</text>'
    s+=f'<text x="90" y="880" font-size="58" font-weight="800" letter-spacing="-1.5"><tspan fill="{WHITE}">Es </tspan><tspan fill="{BLUEL}">carísima</tspan><tspan fill="{WHITE}"> la barata,</tspan></text>'
    s+=f'<text x="90" y="948" fill="{WHITE}" font-size="58" font-weight="800" letter-spacing="-1.5">pagada de a poco.</text>'
    s+=f'<text x="90" y="1006" fill="{CONCRETE}" font-size="30">Fabricamos las nuestras, sin intermediarios. Por eso te decimos la verdad.</text>'
    return s+"</svg>"

def slide8():
    s=header()+bg()
    s+=f'<rect x="90" y="150" width="210" height="240" fill="#232629" stroke="{ALU}" stroke-width="4"/>'
    s+=f'<rect x="102" y="162" width="186" height="216" fill="{CONCRETE_L}" fill-opacity="0.07"/>'
    s+=f'<line x1="195" y1="150" x2="195" y2="390" stroke="{ALU}" stroke-width="3"/>'
    s+=f'<line x1="90" y1="270" x2="300" y2="270" stroke="{ALU}" stroke-width="3"/>'
    s+=(f'<g stroke="{WHITE}" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round">'
        f'<line x1="324" y1="200" x2="414" y2="170"/><line x1="324" y1="250" x2="434" y2="250"/><line x1="324" y1="300" x2="414" y2="330"/></g>')
    s+=f'<text x="90" y="500" fill="{WHITE}" font-size="66" font-weight="800" letter-spacing="-2">¿Cuántas cuotas te falta</text>'
    s+=f'<text x="90" y="572" fill="{WHITE}" font-size="66" font-weight="800" letter-spacing="-2">pagar por tus ventanas?</text>'
    s+=f'<text x="90" y="658" fill="{CONCRETE_L}" font-size="36">Mandanos una foto de tu abertura y te</text>'
    s+=f'<text x="90" y="704" fill="{CONCRETE_L}" font-size="36">decimos, sin vueltas, qué necesitás de verdad.</text>'
    # ícono WhatsApp (sin botón) + texto
    s+=wa_icon(124,800,34)
    s+=f'<text x="176" y="812" fill="{WHITE}" font-size="34" font-weight="700">Escribinos por WhatsApp</text>'
    # logo real
    s+=f'<line x1="90" y1="900" x2="990" y2="900" stroke="{CONCRETE}" stroke-opacity="0.18" stroke-width="1"/>'
    s+=logo_lockup(90, 928, h=92, center=False)
    s+=f'<text x="990" y="984" text-anchor="end" fill="{CONCRETE}" font-size="22" font-weight="700" letter-spacing="3">FÁBRICA · ZONA SUR GBA</text>'
    return s+"</svg>"

slides=[slide1(),slide2(),slide3(),slide4(),slide5(),slide6(),slide7(),slide8()]
os.makedirs(SLIDES,exist_ok=True)
for i,sv in enumerate(slides,1):
    open(f"{SLIDES}/slide-{i}.svg","w").write(sv)
print("SVGs escritos:",len(slides))

# ---- preview.html ----
caps=[("Slide 1 · Hook","logo real"),("Slide 2 · Aluminio vs. Madera","aluminio / madera"),
("Slide 3 · Cuota 1 · DVH isométrico","el frío no pasa por el DVH"),("Slide 4 · Cuota 2 · el ruido",""),
("Slide 5 · Cuota 3 · la humedad",""),("Slide 6 · Cuota final",""),("Slide 7 · El giro",""),
("Slide 8 · CTA","ícono WhatsApp + logo")]
cards=""
for i,sv in enumerate(slides,1):
    inner=sv[sv.index(">")+1:sv.rindex("</svg>")]
    n,tag=caps[i-1]
    cards+=(f'<figure class="frame"><div class="card"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" {FONT}>{inner}</svg></div>'
            f'<figcaption><span class="n">{n}</span><span>{tag}</span></figcaption></figure>')

html=f'''<style>
 :root{{--blue-light:{BLUEL};--page-bg:#111315;--page-panel:#191b1e;--page-ink:#E8E4DC;--page-ink-dim:#9a978f;--page-line:rgba(255,255,255,.10);
 --body:system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--disp:"Helvetica Neue",Arial,system-ui,sans-serif;}}
 @media (prefers-color-scheme:light){{:root{{--page-bg:#EDEAE3;--page-panel:#F5F4F1;--page-ink:#26282a;--page-ink-dim:#6b6a64;--page-line:rgba(26,28,30,.12)}}}}
 :root[data-theme="dark"]{{--page-bg:#111315;--page-panel:#191b1e;--page-ink:#E8E4DC;--page-ink-dim:#9a978f;--page-line:rgba(255,255,255,.10)}}
 :root[data-theme="light"]{{--page-bg:#EDEAE3;--page-panel:#F5F4F1;--page-ink:#26282a;--page-ink-dim:#6b6a64;--page-line:rgba(26,28,30,.12)}}
 *{{box-sizing:border-box}} body{{margin:0;background:var(--page-bg);color:var(--page-ink);font-family:var(--body);line-height:1.5;-webkit-font-smoothing:antialiased}}
 .wrap{{max-width:640px;margin:0 auto;padding:clamp(1.25rem,5vw,3rem) clamp(1rem,4vw,2rem)}}
 header{{border-bottom:1px solid var(--page-line);padding-bottom:1.6rem;margin-bottom:2rem}}
 .eyebrow{{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--blue-light);font-weight:700;margin:0 0 .7rem}}
 h1{{font-family:var(--disp);font-weight:800;letter-spacing:-.02em;line-height:1.05;font-size:clamp(1.6rem,5.5vw,2.3rem);margin:0 0 .8rem}}
 .lede{{color:var(--page-ink-dim);font-size:.95rem;margin:0;max-width:58ch}}
 .frame{{margin:0 0 2rem}} .card{{border-radius:2px;overflow:hidden;box-shadow:0 18px 50px -20px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.06)}}
 .card svg{{display:block;width:100%;height:auto}}
 figcaption{{display:flex;justify-content:space-between;gap:1rem;margin-top:.7rem;font-size:.8rem;color:var(--page-ink-dim)}}
 figcaption .n{{font-weight:700;color:var(--page-ink)}}
 .note{{background:var(--page-panel);border:1px solid var(--page-line);border-radius:10px;padding:1.2rem 1.3rem;font-size:.85rem;color:var(--page-ink-dim)}}
 .note b{{color:var(--page-ink)}} .note code{{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.8em;background:rgba(127,127,127,.16);padding:.1em .4em;border-radius:4px}}
</style>
<div class="wrap"><header>
 <p class="eyebrow">Alumfer · Carrusel v2 · restyle con referencias</p>
 <h1>La ventana barata no existe</h1>
 <p class="lede">Cambios aplicados: aluminio vs. madera (slide 2), corte DVH isométrico que muestra
  que el frío se frena en el vidrio y se cuela por el marco (slide 3), logo real del header web en
  el cierre, ícono de WhatsApp (sin botón), y puente de paleta web + Instagram (barras azules + watermark).</p>
</header>
{cards}
 <div class="note"><b>Archivos:</b> <code>package/slides/slide-1..8.svg</code> (vectoriales, logo real embebido).
 Import a Canva: Uploads → arrastrá los 8 SVG a páginas 1080×1080 en orden. Guía en <code>slides/README.md</code>.</div>
</div>'''
open(f"{PKG}/preview.html","w").write(html)
print("preview.html escrito")
PY_DONE=True
print("OK")
