#!/usr/bin/env python3
# "Una ventana mas" - version corta de 3 slides (alto impacto).
# Reusa los helpers de package/slides/build_slides.py (mismo sistema de diseno).
import sys, os
sys.path.insert(0, "/home/user/Alumfer/creative/content/projects/2026-07-lanzamiento-web/package/slides")
import build_slides as B  # noqa

OUT = "/home/user/Alumfer/creative/content/projects/2026-07-lanzamiento-web/package/slides-3"
os.makedirs(OUT, exist_ok=True)

WHITE, BLUE, CONCRETE = B.WHITE, B.BLUE, B.CONCRETE
W = B.W


def pager3(n):
    return B.txt(1000, 1020, f"{n:02d} / 03", 17, W(0.38), 500, "end", 5, B.FB)


def slide1():
    s = B.HEAD() + B.DEFS() + B.BG()
    s += B.window(900, 470, 300, 400, opacity=0.32)
    s += B.eyebrow(80, 300, "HACE 15 ANOS QUE FABRICAMOS VENTANAS")
    y = 470
    s += B.lines(80, y, ["Anoche", "terminamos", "una que"], 112, WHITE, 700, 124, B.FT, "start", -1)
    s += B.txt(80, y + 3 * 124, "no lleva ", 112, WHITE, 700, "start", -1)
    s += B.txt(80, y + 4 * 124, "aluminio.", 112, BLUE, 700, "start", -1)
    s += B.footer("Alumfer  ·  aberturas a medida  ·  Adrogue, Zona Sur")
    s += pager3(1)
    return s + "</svg>"


def slide2():
    s = B.HEAD() + B.DEFS() + B.BG()
    s += B.window(830, 470, 360, 460, screen=True, opacity=0.95)
    s += B.eyebrow(80, 300, "NO ERA OTRA VENTANA")
    s += B.lines(80, 440, ["Es nuestro"], 92, WHITE, 700, 100, B.FT, "start", -1)
    s += B.txt(80, 540, "nuevo sitio.", 92, BLUE, 700, "start", -1)
    s += B.lines(80, 660, [
        "Una ventana a todo lo que hacemos:",
        "la fabrica de Adrogue, las obras de tu",
        "zona y presupuesto sin que nadie te apure.",
    ], 31, W(0.84), 400, 46, B.FB)
    s += B.txt(80, 660 + 3 * 46 + 34, "Miras primero. Decidis despues.", 34, WHITE, 600, "start", -0.2, B.FT)
    s += B.footer("alumfer.com.ar  ·  Zona Sur GBA")
    s += pager3(2)
    return s + "</svg>"


def slide3():
    s = B.HEAD() + B.DEFS() + B.BG()
    s += B.window(858, 380, 300, 380, open_sash=True, opacity=0.4)
    s += f'<image href="{B.LOGO_URI}" x="80" y="150" width="120" height="84" preserveAspectRatio="xMidYMid meet"/>'
    s += B.brandline(212, 180)
    s += B.lines(80, 540, ["Asomate."], 132, WHITE, 700, 132, B.FT, "start", -1)
    s += f'<rect x="80" y="600" width="360" height="4" fill="{BLUE}"/>'
    s += B.txt(80, 682, "alumfer.com.ar", 56, BLUE, 700, "start", -0.5, B.FT)
    s += B.txt(80, 728, "link en la bio", 24, W(0.6), 400, "start", 1, B.FB)
    s += B.lines(80, 820, ["Guarda este posteo y mandaselo",
                           "a quien decide la obra con vos."], 26, W(0.8), 400, 40, B.FB)
    s += B.whatsapp_pill(80, 890)
    s += B.footer("Alumfer  ·  Carpinteria de aluminio  ·  Adrogue")
    s += pager3(3)
    return s + "</svg>"


if __name__ == "__main__":
    for i, b in enumerate([slide1, slide2, slide3], 1):
        with open(f"{OUT}/slide-{i}.svg", "w", encoding="utf-8") as f:
            f.write(b())
        print("wrote", f"{OUT}/slide-{i}.svg")
    print("done - 3 slides")
