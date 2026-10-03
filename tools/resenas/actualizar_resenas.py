#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Trae la puntuación y las reseñas de la ficha de Google y las escribe en el sitio.

El sitio es HTML estático, así que no hay forma de consultar Google cuando el
visitante abre la página sin meter JavaScript de terceros (lento, y el contenido
no lo ve ni Google ni las IA). Lo que hace este script es traer los datos una vez
por semana desde GitHub Actions y dejarlos escritos en el HTML: el sitio sigue
siendo estático y el dato nunca queda viejo más de siete días.

Toca tres cosas, en las 28 páginas que muestran reseñas:
  - el badge con la puntuación y la cantidad
  - las tres tarjetas de reseñas
  - el aggregateRating del LocalBusiness (solo en la home)

Si la API falla, responde raro o devuelve menos de tres reseñas usables, el
script sale con error SIN tocar ningún archivo. Es a propósito: preferimos
publicar un dato de la semana pasada antes que vaciar la sección del sitio.

Uso:
    GOOGLE_PLACES_API_KEY=... python3 tools/resenas/actualizar_resenas.py
    ... --dry-run          muestra qué cambiaría y no escribe nada
    ... --json archivo     usa una respuesta guardada en vez de llamar a la API

Variables de entorno:
    GOOGLE_PLACES_API_KEY   obligatoria (salvo con --json)
    GOOGLE_PLACE_ID         opcional; si no está, se busca la ficha por nombre
                            y el script imprime el ID para que lo guardes
"""
import argparse
import json
import os
import pathlib
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[2]
WEB = RAIZ / "apps" / "website"

# Con qué buscamos la ficha si no tenemos el place_id guardado.
BUSQUEDA = "Alumfer Carpintería de Aluminio, Av. San Martín 734, Adrogué, Buenos Aires"

TARJETAS = 4           # cuántas reseñas mostramos
LARGO_IDEAL = 300      # caracteres; más que esto descuadra la grilla
LARGO_MINIMO = 40      # "Excelente" solo ocupa una tarjeta y no convence
ESTRELLAS_MINIMO = 4   # no publicamos reseñas de 3 o menos

MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.",
         "jul.", "ago.", "sept.", "oct.", "nov.", "dic."]


# ─── API de Google ─────────────────────────────────────────────────────────

def pedir(url, clave, campos, cuerpo=None):
    cabeceras = {
        "X-Goog-Api-Key": clave,
        "X-Goog-FieldMask": campos,
        "Accept": "application/json",
    }
    datos = None
    if cuerpo is not None:
        datos = json.dumps(cuerpo).encode()
        cabeceras["Content-Type"] = "application/json"
    pedido = urllib.request.Request(url, data=datos, headers=cabeceras)
    try:
        with urllib.request.urlopen(pedido, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detalle = e.read().decode(errors="replace")[:600]
        raise SystemExit(
            "Google respondió %s al pedir %s\n%s\n\n"
            "Las causas habituales son: la clave no tiene habilitada la Places API "
            "(New), el proyecto no tiene facturación activada, o la clave está "
            "restringida por IP y GitHub Actions no entra en esa lista."
            % (e.code, url, detalle)
        )


def buscar_place_id(clave):
    r = pedir(
        "https://places.googleapis.com/v1/places:searchText",
        clave,
        "places.id,places.displayName,places.formattedAddress",
        {"textQuery": BUSQUEDA, "languageCode": "es-419",
         "regionCode": "AR", "maxResultCount": 3},
    )
    lugares = r.get("places") or []
    if not lugares:
        raise SystemExit("La búsqueda '%s' no encontró ninguna ficha." % BUSQUEDA)
    primero = lugares[0]
    print("Ficha encontrada: %s — %s"
          % (primero.get("displayName", {}).get("text", "?"),
             primero.get("formattedAddress", "?")))
    print("place_id: %s" % primero["id"])
    print("  (guardalo como secret GOOGLE_PLACE_ID para no gastar una búsqueda "
          "por corrida y para que no se confunda de ficha nunca)")
    return primero["id"]


def traer_ficha(clave, place_id):
    url = "https://places.googleapis.com/v1/places/%s?%s" % (
        urllib.parse.quote(place_id),
        urllib.parse.urlencode({"languageCode": "es-419", "regionCode": "AR"}),
    )
    return pedir(url, clave, "id,displayName,rating,userRatingCount,reviews")


# ─── Elección y armado de las reseñas ──────────────────────────────────────

def texto_de(reseña):
    """El texto original si está en castellano; si no, la traducción de Google."""
    original = reseña.get("originalText") or {}
    if (original.get("languageCode") or "").startswith("es"):
        crudo = original.get("text", "")
    else:
        crudo = (reseña.get("text") or {}).get("text", "") or original.get("text", "")
    crudo = re.sub(r"\s+", " ", crudo).strip()
    # La tarjeta ya pone las comillas por CSS.
    return crudo.strip("\"'“”«» ")


def iniciales(nombre):
    partes = [p for p in re.split(r"\s+", nombre.strip()) if p]
    letras = "".join(p[0] for p in partes[:2])
    sin_tilde = unicodedata.normalize("NFD", letras)
    return "".join(c for c in sin_tilde if not unicodedata.combining(c)).upper() or "?"


def fecha_corta(publish_time):
    m = re.match(r"(\d{4})-(\d{2})", publish_time or "")
    if not m:
        return ""
    return "%s %s" % (MESES[int(m.group(2)) - 1], m.group(1))


def elegir(reseñas):
    """Las TARJETAS más nuevas, de la más reciente a la más vieja.

    El criterio es la fecha y nada más. Así el archivo de datos se puede ir
    engordando: se agregan las nuevas arriba, el script muestra las tres
    últimas y las viejas quedan guardadas sin mostrarse. Si alguna reseña
    después se borra de la ficha, la que había quedado afuera vuelve sola.
    """
    candidatas = []
    for r in reseñas:
        texto = texto_de(r)
        estrellas = int(r.get("rating") or 0)
        nombre = (r.get("authorAttribution") or {}).get("displayName", "").strip()
        cuando = (r.get("publishTime") or "")
        if estrellas < ESTRELLAS_MINIMO or not nombre or len(texto) < LARGO_MINIMO:
            continue
        if not re.match(r"\d{4}-\d{2}", cuando):
            # Sin fecha no se puede ordenar, y publicar en orden equivocado es
            # peor que dejarla afuera.
            print("  (sin fecha utilizable, queda afuera: %s)" % nombre)
            continue
        fecha = fecha_corta(cuando)
        if r.get("localGuide"):
            fecha = "Local Guide · " + fecha
        candidatas.append({
            "texto": texto,
            "estrellas": estrellas,
            "nombre": nombre,
            "fecha": fecha,
            "cuando": cuando,
        })

    # De la más nueva a la más vieja. El orden del archivo desempata, así que
    # dos reseñas del mismo día salen como están escritas.
    ordenadas = [c for _, c in sorted(enumerate(candidatas),
                                      key=lambda par: (par[1]["cuando"], -par[0]),
                                      reverse=True)]
    elegidas = ordenadas[:TARJETAS]

    for c in elegidas:
        if len(c["texto"]) > LARGO_IDEAL:
            corte = c["texto"][:LARGO_IDEAL].rsplit(" ", 1)[0]
            c["texto"] = corte.rstrip(" ,.;:") + "…"
    return elegidas


def escapar(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))


def estrellas_html(n):
    if n >= 5:
        return "★★★★★"
    return "★" * n + '<span class="review-card__stars-off">%s</span>' % ("★" * (5 - n))


def html_tarjetas(elegidas):
    bloques = []
    for i, c in enumerate(elegidas, start=1):
        bloques.append(
            '        <div class="review-card reveal reveal-delay-%d">\n'
            '          <div class="review-card__stars" aria-label="%d estrellas">%s</div>\n'
            '          <p class="review-card__text">%s</p>\n'
            '          <div class="review-card__footer">\n'
            '            <div class="review-card__avatar review-card__avatar--%d" aria-hidden="true">%s</div>\n'
            '            <div>\n'
            '              <p class="review-card__author">%s</p>\n'
            '              <p class="review-card__location">%s</p>\n'
            '            </div>\n'
            '          </div>\n'
            '        </div>\n'
            % (i, c["estrellas"], estrellas_html(c["estrellas"]),
               escapar(c["texto"]), i, escapar(iniciales(c["nombre"])),
               escapar(c["nombre"]), escapar(c["fecha"]))
        )
    return ('      <div class="reviews-grid">\n\n'
            + "\n".join(bloques)
            + '\n      </div>\n')


def html_badge(puntaje_visible, puntaje_aria, cantidad, url):
    palabra = "reseña" if cantidad == 1 else "reseñas"
    return (
        '        <a href="%s"\n'
        '           class="google-badge" target="_blank" rel="noopener"\n'
        '           aria-label="%s de 5 estrellas en Google · %d %s">\n'
        '          <span class="google-badge__g" aria-hidden="true">G</span>\n'
        '          <span class="google-badge__stars" aria-hidden="true">★★★★★</span>\n'
        '          <strong class="google-badge__score">%s</strong>\n'
        '          <span class="google-badge__sep" aria-hidden="true">·</span>\n'
        '          <span class="google-badge__count">%d %s en Google</span>\n'
        '        </a>'
        % (escapar(url), puntaje_aria, cantidad, palabra,
           puntaje_visible, cantidad, palabra)
    )


# ─── Reescritura de las páginas ────────────────────────────────────────────

# El \1 es importante: sin anclar la indentación del cierre, el .*? corta en el
# </div> de la primera tarjeta y parte el bloque al medio.
RE_GRID = re.compile(r'([ \t]*)<div class="reviews-grid">.*?\n\1</div>\n', re.S)
RE_BADGE = re.compile(r'[ \t]*<a href="[^"]*"\s*\n\s*class="google-badge".*?</a>', re.S)
RE_VER = re.compile(r'(<a href=")[^"]*("[^>]*class="btn btn--outline"\s*\n\s*'
                    r'target="_blank" rel="noopener">\s*\n\s*Ver las reseñas en Google)')
RE_RATING = re.compile(r'([ \t]*)"aggregateRating":\s*\{.*?\n\s*\}', re.S)
# El número del hero, arriba de todo. Está en más páginas que el bloque de
# reseñas: también en las guías y en las fichas de producto.
RE_HERO = re.compile(r'(class="hero__stat-link">)[0-9][.,][0-9](<span>)')
RE_HERO_LINK = re.compile(r'(<a href=")[^"]*("[^>]*\n\s*aria-label="Ver reseñas en '
                          r'Google" class="hero__stat-link")')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="no escribe archivos, solo informa")
    ap.add_argument("--json", help="respuesta de la API guardada en un archivo")
    args = ap.parse_args()

    if args.json:
        ficha = json.loads(pathlib.Path(args.json).read_text())
        place_id = ficha.get("id", "")
    else:
        clave = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
        if not clave:
            raise SystemExit("Falta GOOGLE_PLACES_API_KEY.")
        place_id = os.environ.get("GOOGLE_PLACE_ID", "").strip() or buscar_place_id(clave)
        ficha = traer_ficha(clave, place_id)

    # Validación: si algo no cierra, nos vamos sin tocar nada.
    puntaje = ficha.get("rating")
    cantidad = ficha.get("userRatingCount")
    if not isinstance(puntaje, (int, float)) or not (1 <= puntaje <= 5):
        raise SystemExit("Puntuación inesperada: %r. No se tocó ningún archivo." % (puntaje,))
    if not isinstance(cantidad, int) or cantidad < 1:
        raise SystemExit("Cantidad de reseñas inesperada: %r. No se tocó ningún archivo." % (cantidad,))

    elegidas = elegir(ficha.get("reviews") or [])
    if len(elegidas) < TARJETAS:
        raise SystemExit(
            "Google devolvió %d reseñas publicables y necesitamos %d. "
            "No se tocó ningún archivo." % (len(elegidas), TARJETAS))

    puntaje_visible = ("%.1f" % puntaje).replace(".", ",")
    puntaje_schema = "%.1f" % puntaje
    if place_id:
        url_resenas = ("https://search.google.com/local/reviews?placeid=%s"
                       % urllib.parse.quote(place_id))
    else:
        # Carga a mano sin place_id: dejamos el link que ya tenían las páginas.
        actual = re.search(r'<a href="([^"]*)"\s*\n\s*class="google-badge"',
                           (WEB / "index.html").read_text())
        if not actual:
            raise SystemExit("No pude leer el link del badge en la home para "
                             "conservarlo. No se tocó ningún archivo.")
        url_resenas = actual.group(1)

    print("\nFicha: %s con %d reseñas" % (puntaje_visible, cantidad))
    for c in elegidas:
        print("  %d★ %s (%s) — %s" % (c["estrellas"], c["nombre"], c["fecha"],
                                      c["texto"][:70] + ("…" if len(c["texto"]) > 70 else "")))

    grid = html_tarjetas(elegidas)
    badge = html_badge(puntaje_visible, puntaje_visible, cantidad, url_resenas)

    inicio = WEB / "index.html"
    paginas = sorted(WEB.rglob("*.html"))
    con_resenas = con_hero = 0

    cambiadas = []
    for p in paginas:
        t = original = p.read_text()

        if '<div class="reviews-grid">' in t:
            con_resenas += 1
            for rx, nuevo in ((RE_GRID, grid), (RE_BADGE, badge)):
                t, n = rx.subn(lambda _m, v=nuevo: v, t, count=1)
                if n != 1:
                    raise SystemExit("No encontré el bloque esperado en %s. "
                                     "No se escribió nada." % p.relative_to(RAIZ))
            if url_resenas:
                t = RE_VER.sub(lambda m: m.group(1) + escapar(url_resenas) + m.group(2), t)

        if "hero__stat-link" in t:
            con_hero += 1
            t, n = RE_HERO.subn(lambda m: m.group(1) + puntaje_visible + m.group(2), t, count=1)
            if n != 1:
                raise SystemExit("No encontré la puntuación del hero en %s. "
                                 "No se escribió nada." % p.relative_to(RAIZ))
            if url_resenas:
                t = RE_HERO_LINK.sub(
                    lambda m: m.group(1) + escapar(url_resenas) + m.group(2), t)

        if p == inicio:
            t, n = RE_RATING.subn(
                lambda m: '%s"aggregateRating": {\n%s  "@type": "AggregateRating",\n'
                          '%s  "ratingValue": "%s",\n%s  "ratingCount": "%d"\n%s}'
                          % (m.group(1), m.group(1), m.group(1), puntaje_schema,
                             m.group(1), cantidad, m.group(1)),
                t, count=1)
            if n != 1:
                raise SystemExit("No encontré el aggregateRating en la home. No se escribió nada.")
        if t != original:
            cambiadas.append(p)
            if not args.dry_run:
                p.write_text(t)

    print("\n%d páginas %s · %d con bloque de reseñas, %d con el dato del hero"
          % (len(cambiadas), "cambiarían" if args.dry_run else "actualizadas",
             con_resenas, con_hero))
    return 0


if __name__ == "__main__":
    sys.exit(main())
