#!/usr/bin/env python3
"""
build_reel.py — Anima el Reel "Abrimos una más" (Alumfer) a partir de content.json.

Genera:
  - reel-animatic.mp4   : animatic 9:16 (1080x1920, 30fps, ~22s) con tipografía,
                          tiempos, transiciones y la línea de identidad animada.
                          Los planos con footage real quedan como SLOTS marcados.
  - overlays/scene-N.png: overlay de texto por escena (fondo transparente) para
                          arrastrar sobre tus clips en CapCut.

Diseño 100% atado a shared/design-system (Carbon/Steel/Concrete/Blue, Montserrat/Inter).
Uso:  python3 build_reel.py   (requiere Pillow + imageio-ffmpeg + las fuentes en ./fonts)
"""
import os, math, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------- rutas ----------
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.environ.get("ALUMFER_FONTS", os.path.join(HERE, "fonts"))
OUT_DIR = os.path.dirname(HERE)                      # .../package
FRAMES = os.environ.get("ALUMFER_FRAMES", "/tmp/alumfer_frames")
OVERLAYS = os.path.join(OUT_DIR, "overlays")
MP4 = os.path.join(OUT_DIR, "reel-animatic.mp4")

W, H, FPS = 1080, 1920, 30

# ---------- paleta (design-system) ----------
CARBON=(26,28,30); STEEL=(46,51,56); STEEL_L=(61,68,75)
CONCRETE=(176,169,154); CONCRETE_L=(232,228,220)
BLUE=(27,108,200); BLUE_L=(74,157,232); WHITE=(255,255,255)

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

def M(size, bold=False): return font("Montserrat-700.ttf" if bold else "Montserrat-600.ttf", size)
def I(size, w=400):
    return font({300:"Inter-300.ttf",400:"Inter-400.ttf",500:"Inter-500.ttf"}[w], size)

# ---------- easings ----------
def clamp(x,a=0.0,b=1.0): return max(a,min(b,x))
def ease_out(t): t=clamp(t); return 1-(1-t)**3           # ~cubic-bezier(0.22,1,0.36,1)
def ease_slide(t): t=clamp(t); return 1-(1-t)**4          # cubic-bezier(0.16,1,0.3,1)
def ease_in_out(t):
    t=clamp(t); return 4*t*t*t if t<0.5 else 1-((-2*t+2)**3)/2

# ---------- helpers de texto ----------
def text_w(draw, s, fnt, tracking=0):
    if not s: return 0
    w=sum(draw.textlength(ch, font=fnt) for ch in s)
    return w + tracking*(len(s)-1)

def draw_tracked(draw, cx, y, s, fnt, fill, tracking=0, alpha=255, center=True):
    if alpha<=0 or not s: return
    col=fill+(int(alpha),)
    tw=text_w(draw, s, fnt, tracking)
    x = cx - tw/2 if center else cx
    for ch in s:
        draw.text((x,y), ch, font=fnt, fill=col)
        x += draw.textlength(ch, font=fnt) + tracking

def fit_font(draw, s, maker, max_w, start, minimum=28):
    sz=start
    while sz>minimum:
        f=maker(sz)
        if text_w(draw, s, f) <= max_w: return f
        sz-=2
    return maker(minimum)

def wrap(draw, s, fnt, max_w):
    words=s.split(); lines=[]; cur=""
    for wd in words:
        test=(cur+" "+wd).strip()
        if draw.textlength(test, font=fnt) <= max_w: cur=test
        else:
            if cur: lines.append(cur)
            cur=wd
    if cur: lines.append(cur)
    return lines

def glow(size, center, radius, color, strength):
    """Halo suave de luz (dentro de paleta: blanco/azul tenue, nunca naranja)."""
    lay=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
    r=int(radius)
    d.ellipse([center[0]-r,center[1]-r,center[0]+r,center[1]+r],
              fill=color+(int(255*strength),))
    return lay.filter(ImageFilter.GaussianBlur(radius*0.55))

def base():  # fondo Carbon con viñeta muy sutil
    img=Image.new("RGBA",(W,H),CARBON+(255,))
    return img

def slot(img, label, sub, tone=STEEL, light=0.0, lx=None):
    """Dibuja un plano-placeholder elegante: marco fino + etiqueta discreta ARRIBA
    (nunca en el centro, donde va el titular)."""
    d=ImageDraw.Draw(img)
    d.rectangle([0,0,W,H], fill=tone+(255,))
    # marco interior
    m=90; d.rectangle([m,m,W-m,H-m], outline=CONCRETE+(60,), width=2)
    if light>0:
        img.alpha_composite(glow((W,H),(lx or W//2, H//2), 640, WHITE, 0.09*light))
    d=ImageDraw.Draw(img)
    # bloque de etiqueta en el tercio superior
    ty=int(H*0.12)
    d.rectangle([W//2-30, ty, W//2+30, ty+4], fill=BLUE+(255,))          # tick azul (acento)
    draw_tracked(d, W//2, ty+20, "PLACEHOLDER — REEMPLAZAR POR CLIP", I(24,500), CONCRETE, tracking=4)
    lf=fit_font(d, label, lambda s:I(s,500), W-2*m-80, 40)
    draw_tracked(d, W//2, ty+62, label, lf, CONCRETE_L)
    if sub:
        draw_tracked(d, W//2, ty+110, sub, I(26,400), CONCRETE, tracking=1)
    return img

def footer(d, brand=False):
    y=H-150
    txt="Alumfer · Aberturas de aluminio · Adrogué · Zona Sur GBA"
    draw_tracked(d, W//2, y, txt, I(26,400), CONCRETE, tracking=2)

# ---------- render por escena (t = seg. global) ----------
SCENES=[(0.0,2.5),(2.5,5.0),(5.0,7.0),(7.0,9.5),(9.5,12.5),(12.5,15.0),(15.0,18.5),(18.5,22.0)]
TOTAL=SCENES[-1][1]

def in_up(p, dur=0.5):
    """alpha, dy para una entrada fade+rise segun progreso local p (0..1)."""
    a=ease_out(p/dur) if p<dur else 1.0
    dy=(1-ease_out(p/dur))*40 if p<dur else 0
    return int(255*clamp(a)), dy

def render_frame(t):
    img=base(); d=ImageDraw.Draw(img)

    # ---- S1: la sombra (línea de luz que crece) ----
    if t < 2.5:
        p=(t-0.0)/2.5
        # rendija vertical de luz azulada que crece
        h=ease_in_out(p)
        lay=Image.new("RGBA",(W,H),(0,0,0,0)); ld=ImageDraw.Draw(lay)
        lh=int(H*0.62*h); cy=H//2
        ld.rectangle([W//2-3, cy-lh//2, W//2+3, cy+lh//2], fill=BLUE_L+(200,))
        lay=lay.filter(ImageFilter.GaussianBlur(6))
        img.alpha_composite(lay)
        img.alpha_composite(glow((W,H),(W//2,cy), 120+380*h, BLUE, 0.05+0.06*h))

    # ---- S2: se abre — "Abrimos una más." ----
    elif t < 5.0:
        p=(t-2.5)/2.5
        slot(img, "CLIP: POV ventana/puerta Alumfer abriéndose", "la luz entra al encuadre",
             tone=STEEL, light=ease_out(p), lx=W//2)
        img.alpha_composite(glow((W,H),(W//2,H//2), 520*ease_out(p), WHITE, 0.16*ease_out(p)))
        d=ImageDraw.Draw(img)
        a,dy=in_up(p,0.55)
        f=fit_font(d,"Abrimos una más.",lambda s:M(s,True), W-160, 116)
        draw_tracked(d, W//2, H*0.40+dy, "Abrimos una más.", f, WHITE, tracking=-1, alpha=a)

    # ---- S3: "Entra luz." ----
    elif t < 7.0:
        p=(t-5.0)/2.0
        slot(img, "CLIP: la luz recorre un living real", "el ambiente respira",
             tone=STEEL, light=1.0, lx=int(W*(0.2+0.6*ease_slide(p))))
        d=ImageDraw.Draw(img)
        a,dy=in_up(p,0.5)
        draw_tracked(d, W//2, H*0.44+dy, "Entra luz.", M(88,True), WHITE, tracking=-1, alpha=a)

    # ---- S4: anclaje "ADROGUÉ" ----
    elif t < 9.5:
        p=(t-7.0)/2.5
        slot(img, "CLIP: ventanal grande — obra Zona Sur", "", tone=STEEL_L, light=0.5)
        d=ImageDraw.Draw(img)
        a,dy=in_up(p,0.5)
        # barra de identidad azul (acento único)
        bw=int(120*ease_slide(clamp(p/0.6)))
        d.rectangle([W//2-bw//2, H*0.46, W//2+bw//2, H*0.46+4], fill=BLUE+(a,))
        draw_tracked(d, W//2, H*0.48, "ADROGUÉ", M(64,True), WHITE, tracking=6, alpha=a)

    # ---- S5: recorrido "Lomas. Quilmes. Lanús." (3 cortes) ----
    elif t < 12.5:
        p=(t-9.5)/3.0
        idx=min(2,int(p*3)); local=(p*3)-idx
        barrios=["LOMAS","QUILMES","LANÚS"]
        clips=["CLIP: DVH en casa (Lomas)","CLIP: portón corredizo (Quilmes)","CLIP: cocina con luz (Lanús)"]
        slot(img, clips[idx], "", tone=STEEL if idx%2==0 else STEEL_L, light=0.6, lx=W//2)
        d=ImageDraw.Draw(img)
        a=int(255*ease_out(clamp(local/0.25)))
        draw_tracked(d, W//2, H*0.47, barrios[idx], M(72,True), WHITE, tracking=4, alpha=a)
        # progreso (3 puntos)
        for i in range(3):
            col=BLUE if i==idx else CONCRETE
            d.ellipse([W//2-40+i*40-6, H*0.56, W//2-40+i*40+6, H*0.56+12], fill=col+(220,))

    # ---- S6: oficio "15 años de trabajo." ----
    elif t < 15.0:
        p=(t-12.5)/2.5
        slot(img, "CLIP: taller — corte a 45°, medición, sellado", "ASMR de precisión",
             tone=STEEL, light=0.35)
        d=ImageDraw.Draw(img)
        a,dy=in_up(p,0.5)
        draw_tracked(d, W//2, H*0.42+dy, "15 años", M(96,True), WHITE, tracking=-1, alpha=a)
        draw_tracked(d, W//2, H*0.42+120, "de trabajo.", M(64,True), WHITE, tracking=-1, alpha=a)

    # ---- S7: consecuencia digital — línea azul + sitio ----
    elif t < 18.5:
        p=(t-15.0)/3.5
        d=ImageDraw.Draw(img)  # fondo Carbon puro
        # la línea de identidad se dibuja I->D (clímax, único azul)
        lw=int((W-320)*ease_slide(clamp(p/0.5)))
        d.rectangle([160, H*0.30, 160+lw, H*0.30+4], fill=BLUE+(255,))
        a,dy=in_up(p,0.55)
        f=fit_font(d,"Ahora, todo en un solo lugar.",lambda s:M(s,False), W-200, 56)
        draw_tracked(d, W//2, H*0.34+dy, "Ahora, todo en un solo lugar.", f, WHITE, tracking=-0.5, alpha=a)
        # mock del sitio como SLOT (aparece last, breve)
        if p>0.45:
            q=ease_out((p-0.45)/0.55)
            cardx0,cardy0,cardx1,cardy1=200,int(H*0.46),W-200,int(H*0.78)
            card=Image.new("RGBA",(W,H),(0,0,0,0)); cd=ImageDraw.Draw(card)
            cd.rounded_rectangle([cardx0,cardy0,cardx1,cardy1], radius=18,
                                 fill=STEEL+(int(255*q),), outline=CONCRETE+(int(70*q),), width=2)
            cd.rectangle([cardx0,cardy0,cardx1,cardy0+4], fill=BLUE+(int(255*q),))  # línea azul de la web
            img.alpha_composite(card)
            d=ImageDraw.Draw(img)
            draw_tracked(d,(cardx0+cardx1)//2, cardy0+50, "alumfer.com", M(40,False), WHITE, alpha=int(255*q))
            draw_tracked(d,(cardx0+cardx1)//2, cardy0+120, "SLOT: captura real del sitio", I(28,400), CONCRETE, tracking=1, alpha=int(220*q))

    # ---- S8: CTA + logo + loop ----
    else:
        p=(t-18.5)/3.5
        slot(img, "CLIP: obra terminada con luz (reusar S2, loop)", "",
             tone=STEEL, light=0.5)
        # oscurecer para CTA
        ov=Image.new("RGBA",(W,H),CARBON+(int(150),)); img.alpha_composite(ov)
        d=ImageDraw.Draw(img)
        a,dy=in_up(p,0.5)
        # wordmark (reemplazar por logo real en CapCut)
        draw_tracked(d, W//2, H*0.40+dy, "ALUMFER", M(70,True), WHITE, tracking=10, alpha=a)
        bw=int(180*ease_slide(clamp(p/0.6)))
        d.rectangle([W//2-bw//2, H*0.40+90, W//2+bw//2, H*0.40+94], fill=BLUE+(a,))
        draw_tracked(d, W//2, H*0.50, "Pasá.", M(84,True), WHITE, tracking=0, alpha=a)
        draw_tracked(d, W//2, H*0.50+120, "alumfer.com  ·  link en bio", I(34,500), CONCRETE_L, tracking=2, alpha=a)
        footer(d, brand=True)

    return img.convert("RGB")

# ---------- overlays de texto (transparentes) para CapCut ----------
def render_overlay(n):
    """Solo el texto/gráfico de la escena n (1..8) sobre transparente."""
    img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    def line(cx,y,bw,col=BLUE): d.rectangle([cx-bw//2,y,cx+bw//2,y+4], fill=col+(255,))
    if n==1: pass
    elif n==2:
        f=fit_font(d,"Abrimos una más.",lambda s:M(s,True),W-160,116)
        draw_tracked(d,W//2,H*0.40,"Abrimos una más.",f,WHITE,tracking=-1)
    elif n==3:
        draw_tracked(d,W//2,H*0.44,"Entra luz.",M(88,True),WHITE,tracking=-1)
    elif n==4:
        line(W//2,int(H*0.46),120); draw_tracked(d,W//2,H*0.48,"ADROGUÉ",M(64,True),WHITE,tracking=6)
    elif n==5:
        draw_tracked(d,W//2,H*0.47,"Lomas. Quilmes. Lanús.",M(60,True),WHITE,tracking=1)
    elif n==6:
        draw_tracked(d,W//2,H*0.42,"15 años",M(96,True),WHITE,tracking=-1)
        draw_tracked(d,W//2,H*0.42+120,"de trabajo.",M(64,True),WHITE,tracking=-1)
    elif n==7:
        line(160+((W-320)//2)-((W-320)//2),int(H*0.30),W-320)  # línea completa
        d.rectangle([160,int(H*0.30),W-160,int(H*0.30)+4],fill=BLUE+(255,))
        f=fit_font(d,"Ahora, todo en un solo lugar.",lambda s:M(s,False),W-200,56)
        draw_tracked(d,W//2,H*0.34,"Ahora, todo en un solo lugar.",f,WHITE,tracking=-0.5)
    elif n==8:
        draw_tracked(d,W//2,H*0.40,"ALUMFER",M(70,True),WHITE,tracking=10)
        d.rectangle([W//2-90,int(H*0.40)+90,W//2+90,int(H*0.40)+94],fill=BLUE+(255,))
        draw_tracked(d,W//2,H*0.50,"Pasá.",M(84,True),WHITE,tracking=0)
        draw_tracked(d,W//2,H*0.50+120,"alumfer.com  ·  link en bio",I(34,500),CONCRETE_L,tracking=2)
    return img

def main():
    import imageio_ffmpeg
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    if os.path.isdir(FRAMES): shutil.rmtree(FRAMES)
    os.makedirs(FRAMES); os.makedirs(OVERLAYS, exist_ok=True)

    n=int(TOTAL*FPS)
    print(f"Renderizando {n} frames ({TOTAL}s @ {FPS}fps)...")
    for i in range(n):
        t=i/FPS
        render_frame(t).save(os.path.join(FRAMES,f"f{i:05d}.png"))
        if i%60==0: print(f"  {i}/{n}")
    print("Overlays CapCut...")
    for s in range(1,9):
        render_overlay(s).save(os.path.join(OVERLAYS,f"scene-{s}.png"))

    print("Encodeando MP4 (H.264, yuv420p, faststart)...")
    cmd=[ff,"-y","-framerate",str(FPS),"-i",os.path.join(FRAMES,"f%05d.png"),
         "-c:v","libx264","-pix_fmt","yuv420p","-profile:v","high","-crf","18",
         "-movflags","+faststart",MP4]
    subprocess.run(cmd,check=True,capture_output=True)
    print("OK ->", MP4)

if __name__=="__main__":
    main()
