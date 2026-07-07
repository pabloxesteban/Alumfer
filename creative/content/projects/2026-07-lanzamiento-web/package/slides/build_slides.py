#!/usr/bin/env python3
# "Una ventana mas" - 8 slides 1080x1080, editorial premium, sistema Alumfer.
# Line-art de ventana como motivo, fondo Carbon con wash azul, UN acento azul por slide.
# Tipografia: Montserrat (titulos) / Inter (cuerpo), con fallback Arial/Helvetica.
import base64, os

ROOT = "/home/user/Alumfer"
PKG = f"{ROOT}/creative/content/projects/2026-07-lanzamiento-web/package"
SLIDES = f"{PKG}/slides"
os.makedirs(SLIDES, exist_ok=True)

LOGO = f"{ROOT}/apps/website/solologo.png"
LOGO_URI = "data:image/png;base64," + base64.b64encode(open(LOGO, "rb").read()).decode()

# ---- design tokens (shared/design-system) ----
CARBON = "#1A1C1E"
STEEL = "#2E3338"
CONCRETE = "#B0A99A"
BLUE = "#1B6CC8"
WHITE = "#FFFFFF"
FT = "Montserrat, 'Helvetica Neue', Arial, sans-serif"   # titles
FB = "Inter, 'Helvetica Neue', Arial, sans-serif"        # body


def W(a):
    return f"rgba(255,255,255,{a})"


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def DEFS():
    return (
        '<defs>'
        '<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">'
        f'<stop offset="0" stop-color="#20252b"/>'
        f'<stop offset="0.45" stop-color="{CARBON}"/>'
        f'<stop offset="1" stop-color="#141619"/></linearGradient>'
        '<linearGradient id="alu" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#4b535b"/><stop offset="0.5" stop-color="#2b3036"/>'
        '<stop offset="1" stop-color="#191c20"/></linearGradient>'
        '<linearGradient id="glass" x1="0" y1="0" x2="0.6" y2="1">'
        f'<stop offset="0" stop-color="{BLUE}" stop-opacity="0.35"/>'
        '<stop offset="0.5" stop-color="#22303c" stop-opacity="0.5"/>'
        '<stop offset="1" stop-color="#12171c" stop-opacity="0.6"/></linearGradient>'
        '<linearGradient id="screen" x1="0" y1="0" x2="0.4" y2="1">'
        f'<stop offset="0" stop-color="{BLUE}"/><stop offset="0.6" stop-color="#123a63"/>'
        '<stop offset="1" stop-color="#0e1b2b"/></linearGradient>'
        '<radialGradient id="wash" cx="78%" cy="16%" r="70%">'
        f'<stop offset="0" stop-color="{BLUE}" stop-opacity="0.20"/>'
        f'<stop offset="1" stop-color="{BLUE}" stop-opacity="0"/></radialGradient>'
        '<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>'
        '</defs>'
    )


def HEAD():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" '
            f'width="1080" height="1080" font-family="{FT}">')


def BG():
    return ('<rect width="1080" height="1080" fill="url(#bg)"/>'
            '<rect width="1080" height="1080" fill="url(#wash)"/>')


def txt(x, y, s, size, color, weight=400, anchor="start", ls=0, font=FT, op=1.0):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" '
            f'font-family="{font}" font-size="{size}" font-weight="{weight}" '
            f'letter-spacing="{ls}" opacity="{op}">{esc(s)}</text>')


def lines(x, y, arr, size, color, weight, lh, font=FT, anchor="start", ls=0):
    out = ""
    for i, ln in enumerate(arr):
        out += txt(x, y + i * lh, ln, size, color, weight, anchor, ls, font)
    return out


def eyebrow(x, y, s):
    # kicker/eyebrow: uppercase-ish label with accent bar
    return (f'<rect x="{x}" y="{y-22}" width="34" height="3" fill="{BLUE}"/>'
            + txt(x + 48, y - 14, s, 21, CONCRETE, 600, "start", 3, FB))


def pager(n):
    return txt(1000, 1020, f"{n:02d} / 08", 17, W(0.38), 500, "end", 5, FB)


def footer(s):
    return txt(80, 1020, s, 17, W(0.42), 500, "start", 1.5, FB)


def brandline(x, y):
    return (txt(x, y, "ALUMFER", 22, W(0.9), 700, "start", 2, FT)
            + txt(x, y + 22, "CARPINTERIA DE ALUMINIO", 12, W(0.45), 500, "start", 3, FB))


# ---------- window motif (line-art) ----------
def window(cx, cy, w, h, glass="url(#glass)", open_sash=False, screen=False, opacity=1.0):
    x = cx - w / 2
    y = cy - h / 2
    fr = max(14, w * 0.05)
    g = f'<g opacity="{opacity}">'
    g += f'<ellipse cx="{cx}" cy="{y+h+22}" rx="{w*0.5:.0f}" ry="16" fill="#000" opacity="0.35" filter="url(#soft)"/>'
    # outer frame
    g += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="url(#alu)" stroke="{W(0.10)}" stroke-width="1"/>'
    fill = "url(#screen)" if screen else glass
    g += f'<rect x="{x+fr}" y="{y+fr}" width="{w-2*fr}" height="{h-2*fr}" fill="{fill}"/>'
    # mullion
    mx = cx
    g += f'<rect x="{mx-fr/2}" y="{y+fr}" width="{fr}" height="{h-2*fr}" fill="url(#alu)"/>'
    # highlight on glass
    g += (f'<polygon points="{x+fr+8},{y+fr+8} {x+fr+70},{y+fr+8} {x+fr+18},{y+h-fr-8} {x+fr+8},{y+h-fr-8}" '
          f'fill="{W(0.06)}"/>')
    if screen:
        # tiny screen ui hint
        g += f'<rect x="{x+fr+14}" y="{y+fr+16}" width="70" height="6" rx="3" fill="{W(0.5)}"/>'
        g += f'<rect x="{x+fr+14}" y="{y+fr+30}" width="120" height="5" rx="2.5" fill="{W(0.28)}"/>'
        g += f'<rect x="{x+fr+14}" y="{y+fr+42}" width="96" height="5" rx="2.5" fill="{W(0.28)}"/>'
    if open_sash:
        # an open sash swinging out
        ox = x + w - fr
        g += (f'<polygon points="{ox},{y+fr} {ox+120},{y+fr-30} {ox+120},{y+h-fr+30} {ox},{y+h-fr}" '
              f'fill="url(#glass)" stroke="url(#alu)" stroke-width="{fr*0.7:.0f}" opacity="0.9"/>')
    g += '</g>'
    return g


def whatsapp_pill(x, y):
    return (f'<rect x="{x}" y="{y}" width="360" height="72" rx="36" fill="{BLUE}"/>'
            + txt(x + 180, y + 46, "WhatsApp  (011) 6336-8643", 24, WHITE, 600, "middle", 0.5, FB))


# ================= SLIDES =================
def slide1():
    s = HEAD() + DEFS() + BG()
    s += window(900, 470, 300, 400, opacity=0.32)
    s += eyebrow(80, 300, "HACE 15 ANOS QUE FABRICAMOS VENTANAS")
    y = 470
    s += lines(80, y, ["Anoche", "terminamos", "una que"], 112, WHITE, 700, 124, FT, "start", -1)
    s += txt(80, y + 3 * 124, "no lleva ", 112, WHITE, 700, "start", -1)
    # accent word "aluminio"
    s += txt(80, y + 4 * 124, "aluminio.", 112, BLUE, 700, "start", -1)
    s += footer("Alumfer  ·  aberturas a medida  ·  Adrogue, Zona Sur")
    s += pager(1)
    return s + "</svg>"


def slide2():
    s = HEAD() + DEFS() + BG()
    s += window(800, 560, 380, 470, screen=True)
    s += eyebrow(80, 360, "LO QUE ESTUVIMOS ARMANDO")
    s += lines(80, 500, ["Es nuestro"], 96, WHITE, 700, 104, FT, "start", -1)
    s += txt(80, 604, "nuevo sitio.", 96, BLUE, 700, "start", -1)
    s += lines(80, 730, [
        "Una ventana que se abre",
        "desde el telefono y da a",
        "todo lo que hacemos.",
    ], 34, W(0.82), 400, 48, FB)
    s += footer("alumfer.com.ar")
    s += pager(2)
    return s + "</svg>"


def _vista(n, kicker, head_arr, accent_line, body_arr, motif):
    s = HEAD() + DEFS() + BG()
    s += motif
    s += eyebrow(80, 330, kicker)
    y = 470
    s += lines(80, y, head_arr, 74, WHITE, 700, 84, FT, "start", -0.5)
    s += txt(80, y + len(head_arr) * 84, accent_line, 74, BLUE, 700, "start", -0.5)
    by = y + len(head_arr) * 84 + 120
    s += lines(80, by, body_arr, 31, W(0.8), 400, 46, FB)
    s += footer("alumfer.com.ar  ·  Adrogue, Zona Sur")
    s += pager(n)
    return s + "</svg>"


def slide3():
    motif = window(860, 320, 250, 320, opacity=0.3)
    # workshop hint: 45 degree cut lines
    motif += ('<g opacity="0.5">'
              f'<line x1="720" y1="760" x2="1000" y2="620" stroke="{CONCRETE}" stroke-width="3"/>'
              f'<line x1="820" y1="840" x2="1000" y2="740" stroke="{W(0.25)}" stroke-width="2"/>'
              '</g>')
    return _vista(3, "VISTA 1  ·  LA FABRICA",
                  ["Miras donde", "y como se hace,", "en"], "Adrogue.",
                  ["El taller, las maquinas, las manos.",
                   "Sin misterio: fabricamos nosotros."], motif)


def slide4():
    # stylized zona sur dots
    import math
    dots = '<g opacity="0.85">'
    pts = [(760, 300), (880, 360), (980, 300), (820, 430), (940, 470),
           (760, 540), (880, 560), (1000, 600), (840, 660), (700, 420)]
    for i, (px, py) in enumerate(pts):
        c = BLUE if i == 3 else W(0.28)
        r = 9 if i == 3 else 6
        dots += f'<circle cx="{px}" cy="{py}" r="{r}" fill="{c}"/>'
    # connect a few
    dots += f'<path d="M700,420 L820,430 L880,360 L980,300" stroke="{W(0.14)}" stroke-width="2" fill="none"/>'
    dots += f'<path d="M820,430 L840,660 L1000,600" stroke="{W(0.14)}" stroke-width="2" fill="none"/>'
    dots += '</g>'
    dots += window(880, 430, 120, 150, opacity=0.9)  # marker window over the map
    return _vista(4, "VISTA 2  ·  TU BARRIO",
                  ["Miras si ya", "trabajamos", "cerca tuyo, en"], "Zona Sur.",
                  ["Obras por localidad: Almirante Brown,",
                   "Lomas, Quilmes, Ezeiza, Lanus."], dots)


def slide5():
    motif = window(760, 300, 200, 250, opacity=0.28)
    motif += window(940, 380, 170, 210, glass="url(#screen)", opacity=0.9)
    motif += window(830, 560, 150, 190, opacity=0.5)
    return _vista(5, "VISTA 3  ·  LA OBRA",
                  ["Miras el", "resultado,", "no un"], "catalogo.",
                  ["Ventanas, DVH, cerramientos, portones.",
                   "Terminados, en casas reales."], motif)


def slide6():
    motif = window(850, 400, 320, 400, open_sash=True, opacity=0.9)
    return _vista(6, "VISTA 4  ·  EL PRIMER PASO",
                  ["Pedis", "presupuesto", "cuando quieras,"], "sin apuro.",
                  ["A las 11 de la noche, sin que nadie",
                   "te venda. Miras primero, decidis despues."], motif)


def slide7():
    s = HEAD() + DEFS() + BG()
    # split: cut at 45 (taller) | screen (web), same hand/exigencia
    s += window(858, 340, 260, 330, screen=True, opacity=0.32)
    s += ('<g opacity="0.5">'
          f'<line x1="700" y1="840" x2="1010" y2="680" stroke="{CONCRETE}" stroke-width="3"/>'
          '</g>')
    # identity line 3px blue (firma visual)
    s += f'<rect x="80" y="360" width="360" height="3" fill="{BLUE}"/>'
    s += lines(80, 470, ["La hicimos como", "hacemos todo."], 72, WHITE, 700, 84, FT, "start", -0.5)
    s += lines(80, 680, ["Midiendo, probando, sin apuro.",
                          "Cambio la herramienta."], 33, W(0.82), 400, 48, FB)
    s += txt(80, 680 + 2 * 48 + 30, "No cambio quien esta detras.", 40, BLUE, 700, "start", -0.3, FT)
    s += footer("Alumfer  ·  fabricantes, no revendedores")
    s += pager(7)
    return s + "</svg>"


def slide8():
    s = HEAD() + DEFS() + BG()
    s += window(858, 360, 300, 380, open_sash=True, screen=False, opacity=0.4)
    # brand + logo (only slide with logo)
    s += f'<image href="{LOGO_URI}" x="80" y="140" width="120" height="84" preserveAspectRatio="xMidYMid meet"/>'
    s += brandline(212, 170)
    s += lines(80, 520, ["Asomate."], 132, WHITE, 700, 132, FT, "start", -1)
    s += f'<rect x="80" y="580" width="360" height="4" fill="{BLUE}"/>'
    s += txt(80, 660, "alumfer.com.ar", 56, BLUE, 700, "start", -0.5, FT)
    s += txt(80, 706, "link en la bio", 24, W(0.6), 400, "start", 1, FB)
    s += lines(80, 800, ["Guarda este posteo para cuando arranques tu obra",
                         "y mandaselo a quien la decide con vos."], 26, W(0.8), 400, 40, FB)
    s += whatsapp_pill(80, 870)
    s += footer("Alumfer  ·  Adrogue, Zona Sur GBA")
    s += pager(8)
    return s + "</svg>"


BUILDERS = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8]

if __name__ == "__main__":
    for i, b in enumerate(BUILDERS, 1):
        path = f"{SLIDES}/slide-{i}.svg"
        with open(path, "w", encoding="utf-8") as f:
            f.write(b())
        print("wrote", path)
    print("done - 8 slides")
