#!/usr/bin/env bash
# Corre todas las pruebas de la app de presupuestos contra un servidor local.
# Uso (desde la raíz del repo):  bash tools/presupuestos-pruebas/correr.sh
# Necesita Playwright en /opt/node22/lib/node_modules/playwright (lo trae el
# entorno de Claude Code en la nube) y python3 para servir la app.
set -u
AQUI="$(cd "$(dirname "$0")" && pwd)"
APP="$AQUI/../../apps/presupuestos"
SALIDA="${SALIDA:-$(mktemp -d)}"
# Si no hay un servidor andando, levanta uno y lo apaga al terminar.
if ! curl -s -o /dev/null http://localhost:8777/; then
  python3 -m http.server 8777 --directory "$APP" >/dev/null 2>&1 &
  SERVIDOR=$!
  trap 'kill $SERVIDOR 2>/dev/null' EXIT
  sleep 1
fi
fallas=0
for t in prueba prueba2 prueba3 prueba4 prueba5 prueba6 prueba7 prueba8 prueba9 prueba10 angosto360 precios-menu actualiza; do
  r=$(cd "$AQUI" && node "$t.mjs" "$SALIDA" 2>&1)
  ok=$(echo "$r" | grep -c '^OK'); mal=$(echo "$r" | grep -c '^FALLA')
  echo "$t: $ok OK, $mal FALLA"
  echo "$r" | grep -E '^FALLA|Error' | head -3
  if [ "$mal" != "0" ] || echo "$r" | grep -q 'Error'; then fallas=1; fi
done
echo "Capturas y PDFs en: $SALIDA"
exit $fallas
