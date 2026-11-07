"""Avisa a los buscadores que usan IndexNow (Bing, Yandex, Naver, Seznam)
qué páginas cambiaron en este deploy. Si no se puede saber qué cambió
(primer deploy, lanzado a mano), avisa todas las del sitemap."""
import json, os, re, subprocess, urllib.request

HOST = "alumfer.com.ar"
KEY = "58b6b671d429e11c939abaf3286bde35"
SITE = "apps/website/"

sitemap = open(SITE + "sitemap.xml", encoding="utf-8").read()
todas = re.findall(r"<loc>(.*?)</loc>", sitemap)

antes = os.environ.get("BEFORE", "")
urls = todas
if antes and set(antes) != {"0"}:
    try:
        cambios = subprocess.run(["git", "diff", "--name-only", antes, "HEAD", "--", SITE],
                                 capture_output=True, text=True, check=True).stdout.split()
        paginas = set()
        for f in cambios:
            f = f[len(SITE):]
            if f.endswith("index.html"):
                paginas.add("https://%s/%s" % (HOST, f[: -len("index.html")]))
            elif f.endswith((".css", ".js")) or f in ("sitemap.xml", "llms.txt"):
                paginas.add("https://%s/" % HOST)
        urls = [u for u in todas if u in paginas]
    except subprocess.CalledProcessError:
        urls = todas

if not urls:
    print("Sin páginas para avisar.")
    raise SystemExit(0)

cuerpo = json.dumps({"host": HOST, "key": KEY,
                     "keyLocation": "https://%s/%s.txt" % (HOST, KEY),
                     "urlList": urls}).encode()
pedido = urllib.request.Request("https://api.indexnow.org/indexnow", data=cuerpo,
                                headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(pedido, timeout=30) as r:
    print("IndexNow respondió %s para %d páginas" % (r.status, len(urls)))
    for u in urls:
        print("  " + u)
