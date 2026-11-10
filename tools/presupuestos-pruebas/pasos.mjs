// Ayudante de las pruebas: el presupuesto ahora va en 3 pantallas (1 Cliente · 2 Aberturas
// · 3 Enviar). Antes de tocar o leer algo, va al paso donde está ese elemento tocando el
// indicador de pasos, como lo haría la persona. Si el elemento no está en un paso, no hace nada.
export function conPasos(p) {
  const loc = p.locator.bind(p);
  async function irAlPaso(sel) {
    if (typeof sel !== 'string') return;
    try {
      const L = loc(sel).first();
      if (await L.count() === 0) return;
      // Desde la .15, Precios es un menú: abre la pantalla y el renglón donde está el elemento.
      const ajuste = await L.evaluate(el => {
        const sec = el.closest('[data-ajuste]');
        const vista = document.getElementById('vista-precios');
        if (!sec || !vista || vista.hidden) return null;
        return { sub: vista.dataset.sub === sec.dataset.ajuste ? null : sec.dataset.ajuste,
                 fila: !!el.closest('.fila-precio__detalle[hidden]') };
      });
      if (ajuste && ajuste.sub) {
        if (await loc('#btn-atras').isVisible()) { await loc('#btn-atras').click(); await loc('#menu-precios').waitFor(); }
        await loc('[data-abrir="' + ajuste.sub + '"]').click();
      }
      if (ajuste && ajuste.fila) await L.evaluate(el => el.closest('.fila-precio').querySelector('[data-accion="detalle"]').click());
      const paso = await L.evaluate(el => {
        const sec = el.closest('[data-paso-seccion]');
        const vista = document.getElementById('vista-presupuesto');
        if (!sec || !vista || vista.hidden) return null;
        return vista.dataset.paso === sec.dataset.pasoSeccion ? null : sec.dataset.pasoSeccion;
      });
      if (paso) {
        await loc('#pasos [data-paso="' + paso + '"]').click();
        // Desde la .13 no se puede avanzar sin nombre y teléfono: si la app frenó,
        // se completan (como haría la persona al ver el aviso) y se vuelve a intentar.
        const quedo = await loc('#vista-presupuesto').evaluate(v => v.dataset.paso);
        if (quedo !== paso) {
          await loc('#vista-presupuesto').evaluate(() => {
            const n = document.getElementById('cli-nombre'), t = document.getElementById('cli-telefono');
            if (!n.value.trim()) { n.value = 'Cliente de prueba'; n.dispatchEvent(new Event('input', { bubbles: true })); }
            if (t.value.replace(/\D/g, '').length < 8) { t.value = '11 4000-0000'; t.dispatchEvent(new Event('input', { bubbles: true })); }
            document.activeElement && document.activeElement.blur && document.activeElement.blur();
          });
          await loc('#pasos [data-paso="' + paso + '"]').click();
        }
      }
    } catch (e) { /* selector que no resuelve todavía: sigue de largo */ }
  }
  for (const m of ['click', 'fill', 'textContent', 'isVisible', 'isHidden', 'inputValue', '$eval', '$$eval', 'waitForSelector', 'innerHTML']) {
    const orig = p[m].bind(p);
    p[m] = async (sel, ...r) => { await irAlPaso(sel); return orig(sel, ...r); };
  }
  const envolver = (L, sel) => new Proxy(L, {
    get(t, k) {
      const v = t[k];
      if (typeof v !== 'function') return v;
      if (['first', 'last', 'nth', 'locator', 'filter'].includes(k)) return (...a) => envolver(v.apply(t, a), sel);
      return async (...a) => { await irAlPaso(sel); return v.apply(t, a); };
    }
  });
  p.locator = (sel, ...r) => envolver(loc(sel, ...r), sel);
  return p;
}
