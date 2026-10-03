// ============================================================
// ALUMFER — disena.js
// Diseñador de aberturas: el cliente elige tipología, medidas,
// color, vidrio y mosquitero, ve el plano a escala, arma una
// lista y la manda por WhatsApp o email, o descarga el boceto.
// La lista se guarda en este navegador (localStorage).
// ============================================================

(() => {
  'use strict';
  const A = window.Aberturas;
  if (!A) return;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const WA = '5491163368643';
  const KEY = 'alumfer-boceto-v1';

  // Íconos de tipología (mismos dibujos que la app de presupuestos)
  const MA = '<rect x="5" y="9" width="38" height="30" rx="1.5"/>';
  const MV = '<rect x="12" y="4" width="24" height="40" rx="1.5"/>';
  const FL = '<path d="M14 24h9m0 0-3.2-3.2M23 24l-3.2 3.2"/>';
  const ICO = {
    'vent-corr-2': MA + '<path d="M24 9v30"/>' + FL,
    'vent-corr-3': MA + '<path d="M17.7 9v30M30.3 9v30"/><path d="M8 24h6.5m0 0-2.6-2.6M14.5 24l-2.6 2.6"/>',
    'vent-corr-4': MA + '<path d="M14.5 9v30M24 9v30M33.5 9v30"/><path d="M7 24h5m0 0-2-2M12 24l-2 2"/><path d="M41 24h-5m0 0 2-2M36 24l2 2"/>',
    'vent-abrir-1': MA + '<path d="M40 11 9 24l31 13"/><circle cx="39" cy="24" r="1.6" fill="currentColor"/>',
    'vent-abrir-2': MA + '<path d="M24 9v30"/><path d="M22 11 7 24l15 13"/><path d="M26 11l15 13-15 13"/>',
    'banderola': MA + '<path d="M7 11 24 36l17-25"/>',
    'oscilo': MA + '<path d="M40 11 9 24l31 13"/><path d="M7 11 24 36l17-25"/>',
    'pano-fijo': MA + '<rect x="11" y="15" width="26" height="18" rx="1"/>',
    'puerta-abrir': MV + '<path d="M33 7 15 24l18 17"/><circle cx="31" cy="25" r="1.6" fill="currentColor"/>',
    'puerta-doble': MV + '<path d="M24 4v40"/><circle cx="21.5" cy="25" r="1.4" fill="currentColor"/><circle cx="26.5" cy="25" r="1.4" fill="currentColor"/>',
    'pbalcon-corr-2': MV + '<path d="M24 4v40"/><path d="M16 24h7m0 0-2.6-2.6M23 24l-2.6 2.6"/>',
    'pbalcon-corr-3': '<rect x="7" y="4" width="34" height="40" rx="1.5"/><path d="M18.3 4v40M29.7 4v40"/><path d="M10 24h6m0 0-2.4-2.4M16 24l-2.4 2.4"/>',
  };
  const icono = (id) => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[id] || MA}</svg>`;

  const storage = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) {} },
  };

  const nuevo = (tipoId = 'vent-corr-2') => {
    const t = A.tipo(tipoId);
    return { tipo: t.id, ancho: t.ancho, alto: t.alto, color: 'blanco', vidrio: 'transparente', mosquitero: false, cantidad: 1, nota: '' };
  };

  let item = nuevo();
  let lista = storage.get();
  let editando = -1;        // índice en la lista si se está editando
  let persona = true;
  let medidasPropias = false; // pasa a true cuando el cliente toca ancho o alto

  // ── Referencias ────────────────────────────────────────────
  const plano     = $('#plano');
  const planoCap  = $('#plano-cap');
  const tiposBox  = $('#tipos');
  const anchoIn   = $('#ancho'), anchoRg = $('#ancho-rango');
  const altoIn    = $('#alto'),  altoRg  = $('#alto-rango');
  const coloresBx = $('#colores');
  const vidriosBx = $('#vidrios');
  const mosqIn    = $('#mosquitero');
  const mosqRow   = $('#fila-mosquitero');
  const cantIn    = $('#cantidad');
  const notaIn    = $('#nota');
  const agregar   = $('#agregar');
  const cancelar  = $('#cancelar');
  const listaBox  = $('#lista');
  const vacia     = $('#lista-vacia');
  const envio     = $('#envio');
  const waBtn     = $('#enviar-wa');
  const pngBtn    = $('#descargar');
  const consulta  = $('#consulta-boceto');
  const contador  = $$('.js-contador');
  const personaIn = $('#ver-persona');

  // ── Construcción de controles ─────────────────────────────
  ['Ventanas', 'Puertas'].forEach(g => {
    const grupo = document.createElement('div');
    grupo.className = 'tipos__grupo';
    grupo.innerHTML = `<p class="mono tipos__titulo">${g}</p><div class="tipos__grid" role="radiogroup" aria-label="${g}"></div>`;
    const grid = $('.tipos__grid', grupo);
    A.TIPOS.filter(t => t.grupo === g).forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tipo';
      b.dataset.tipo = t.id;
      b.setAttribute('role', 'radio');
      b.innerHTML = `${icono(t.id)}<span>${t.nombre.replace(/^Ventana |^Puerta /, (m) => m === 'Ventana ' ? '' : 'Puerta ')}</span>`;
      b.addEventListener('click', () => { cambiarTipo(t.id); });
      grid.appendChild(b);
    });
    tiposBox.appendChild(grupo);
  });

  ['Pintura', 'Anodizado'].forEach(g => {
    const wrap = document.createElement('div');
    wrap.className = 'swatch-group';
    wrap.innerHTML = `<p class="swatch-group__t mono">${g}</p><div class="swatches" role="radiogroup" aria-label="Colores ${g.toLowerCase()}"></div>`;
    const box = $('.swatches', wrap);
    A.COLORES.filter(c => c.grupo === g).forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.dataset.color = c.id;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', `${g} ${c.nombre}`);
      b.title = c.nombre;
      b.style.background = c.grad ? `linear-gradient(100deg, ${c.grad[0]}, ${c.grad[1]} 40%, ${c.grad[2]})` : c.solido;
      b.addEventListener('click', () => { item.color = c.id; render(); });
      box.appendChild(b);
    });
    coloresBx.appendChild(wrap);
  });

  A.VIDRIOS.forEach(v => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-opt';
    b.dataset.vidrio = v.id;
    b.setAttribute('role', 'radio');
    b.textContent = v.nombre;
    b.addEventListener('click', () => { item.vidrio = v.id; render(); });
    vidriosBx.appendChild(b);
  });

  // ── Medidas: número, rango y botones ± ─────────────────────
  const clamp = (n, [a, b]) => Math.min(b, Math.max(a, Math.round(n) || a));
  function enlazarMedida(input, rango, campo) {
    const lim = A.LIMITES[campo];
    rango.min = lim[0]; rango.max = lim[1];
    input.min = lim[0]; input.max = lim[1];
    const set = (val, fin) => {
      if (fin) val = clamp(val, lim);
      item[campo] = fin ? val : (+val || item[campo]);
      medidasPropias = true;
      render(false);
    };
    input.addEventListener('input', () => { if (input.value !== '') set(+input.value, false); });
    input.addEventListener('change', () => set(+input.value, true));
    rango.addEventListener('input', () => set(+rango.value, true));
    $$(`[data-paso="${campo}"]`).forEach(b => b.addEventListener('click', () => set(item[campo] + (+b.dataset.delta), true)));
  }
  enlazarMedida(anchoIn, anchoRg, 'ancho');
  enlazarMedida(altoIn, altoRg, 'alto');

  mosqIn.addEventListener('change', () => { item.mosquitero = mosqIn.checked; render(false); });
  cantIn.addEventListener('change', () => { item.cantidad = clamp(+cantIn.value, [1, 50]); render(false); });
  $$('[data-paso="cantidad"]').forEach(b => b.addEventListener('click', () => { item.cantidad = clamp(item.cantidad + (+b.dataset.delta), [1, 50]); render(false); }));
  notaIn.addEventListener('input', () => { item.nota = notaIn.value.slice(0, 80); });
  personaIn.addEventListener('change', () => { persona = personaIn.checked; render(false); });

  function cambiarTipo(id) {
    const t = A.tipo(id);
    // Medidas típicas del tipo nuevo, salvo que el cliente ya haya cargado
    // las suyas (y siga dentro de la misma familia ventana/puerta)
    if (!medidasPropias || A.tipo(item.tipo).grupo !== t.grupo) {
      item.ancho = t.ancho; item.alto = t.alto; medidasPropias = false;
    }
    item.tipo = id;
    if (!t.mosq) item.mosquitero = false;
    render(true);
  }

  // ── Render del editor ──────────────────────────────────────
  function render(anim = false) {
    const t = A.tipo(item.tipo);
    plano.innerHTML = A.dibujar(item, { cotas: true, persona, anim });
    if (anim) { plano.classList.remove('is-drawing'); void plano.offsetWidth; plano.classList.add('is-drawing'); }
    planoCap.textContent = `${t.nombre} · ${item.ancho} × ${item.alto} cm`;
    $$('.tipo').forEach(b => b.setAttribute('aria-checked', String(b.dataset.tipo === item.tipo)));
    $$('#colores .swatch').forEach(b => b.setAttribute('aria-checked', String(b.dataset.color === item.color)));
    $$('#vidrios .chip-opt').forEach(b => b.setAttribute('aria-checked', String(b.dataset.vidrio === item.vidrio)));
    if (document.activeElement !== anchoIn) anchoIn.value = item.ancho;
    if (document.activeElement !== altoIn) altoIn.value = item.alto;
    anchoRg.value = item.ancho; altoRg.value = item.alto;
    mosqRow.hidden = !t.mosq;
    mosqIn.checked = !!item.mosquitero;
    cantIn.value = item.cantidad;
    notaIn.value = item.nota || '';
    $('#color-elegido').textContent = `${A.color(item.color).grupo} · ${A.color(item.color).nombre}`;
    $('#vidrio-elegido').textContent = A.vidrio(item.vidrio).nombre;
  }

  // ── Lista ──────────────────────────────────────────────────
  function guardar() { storage.set(lista); }
  function renderLista() {
    listaBox.innerHTML = '';
    lista.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'pieza' + (i === editando ? ' is-editing' : '');
      li.innerHTML = `
        <div class="pieza__dibujo">${A.dibujar(it, { cotas: true, mini: true })}</div>
        <div class="pieza__info">
          <span class="mono">Abertura ${String(i + 1).padStart(2, '0')}</span>
          <p>${A.resumen(it).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>
          <div class="pieza__acciones">
            <button type="button" data-accion="editar">Editar</button>
            <button type="button" data-accion="duplicar">Duplicar</button>
            <button type="button" data-accion="borrar">Quitar</button>
          </div>
        </div>`;
      $$('button', li).forEach(b => b.addEventListener('click', () => accion(b.dataset.accion, i)));
      listaBox.appendChild(li);
    });
    const n = lista.reduce((s, it) => s + (+it.cantidad || 1), 0);
    contador.forEach(c => { c.textContent = n; });
    vacia.hidden = lista.length > 0;
    envio.hidden = lista.length === 0;
    document.body.classList.toggle('has-boceto', lista.length > 0);
    const texto = textoLista();
    waBtn.href = `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
    consulta.value = texto;
  }

  function accion(a, i) {
    if (a === 'borrar') { lista.splice(i, 1); if (editando === i) salirEdicion(); else if (editando > i) editando--; }
    if (a === 'duplicar') lista.splice(i + 1, 0, { ...lista[i] });
    if (a === 'editar') {
      editando = i;
      item = { ...lista[i] };
      medidasPropias = true;
      agregar.querySelector('span').textContent = 'Guardar cambios';
      cancelar.hidden = false;
      render(true);
      $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    guardar();
    renderLista();
  }

  function salirEdicion() {
    editando = -1;
    agregar.querySelector('span').textContent = 'Agregar a mi lista';
    cancelar.hidden = true;
  }

  agregar.addEventListener('click', () => {
    item.ancho = clamp(item.ancho, A.LIMITES.ancho);
    item.alto = clamp(item.alto, A.LIMITES.alto);
    if (editando >= 0) { lista[editando] = { ...item }; salirEdicion(); }
    else lista.push({ ...item });
    guardar();
    renderLista();
    item = { ...item, nota: '', cantidad: 1 };
    render(false);
    // aviso breve
    agregar.classList.add('is-ok');
    setTimeout(() => agregar.classList.remove('is-ok'), 1200);
  });
  cancelar.addEventListener('click', () => { salirEdicion(); item = nuevo(item.tipo); render(true); renderLista(); });

  function textoLista() {
    if (!lista.length) return '';
    const lineas = lista.map((it, i) => `${i + 1}) ${A.resumen(it)}`);
    return `Hola, armé este boceto en alumfer.com.ar:\n\n${lineas.join('\n')}\n\nSon medidas aproximadas. ¿Me pasan presupuesto?`;
  }

  // ── Descargar boceto (PNG) ─────────────────────────────────
  pngBtn.addEventListener('click', async () => {
    if (!lista.length) return;
    pngBtn.classList.add('is-loading');
    try {
      const cols = lista.length > 1 ? 2 : 1;
      const cw = 560, ch = 470, pad = 40, head = 120;
      const rows = Math.ceil(lista.length / cols);
      const cv = document.createElement('canvas');
      const scale = 2;
      cv.width = (pad * 2 + cols * cw) * scale;
      cv.height = (head + rows * ch + pad) * scale;
      const g = cv.getContext('2d');
      g.scale(scale, scale);
      g.fillStyle = '#FBFAF7'; g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = '#1B6CC8'; g.fillRect(0, 0, cv.width, 8);
      g.fillStyle = '#15171A'; g.font = '700 30px Archivo, Arial, sans-serif';
      g.fillText('ALUMFER · Boceto de aberturas', pad, 58);
      g.fillStyle = '#6F6D67'; g.font = '14px "IBM Plex Mono", monospace';
      g.fillText(`Medidas aproximadas · ${new Date().toLocaleDateString('es-AR')} · alumfer.com.ar · (011) 6336-8643`, pad, 88);
      for (let i = 0; i < lista.length; i++) {
        const it = lista[i];
        const x = pad + (i % cols) * cw, y = head + Math.floor(i / cols) * ch;
        const svg = A.dibujar(it, { cotas: true, persona: false }).replace('<svg ', '<svg width="500" height="360" style="color:#3F444B" ');
        const img = await cargar(svg);
        g.drawImage(img, x, y, 500, 360);
        g.fillStyle = '#1B6CC8'; g.font = '500 13px "IBM Plex Mono", monospace';
        g.fillText(`ABERTURA ${String(i + 1).padStart(2, '0')}`, x, y + 388);
        g.fillStyle = '#15171A'; g.font = '15px Archivo, Arial, sans-serif';
        partir(A.resumen(it), 62).slice(0, 3).forEach((l, k) => g.fillText(l, x, y + 412 + k * 20));
      }
      const a = document.createElement('a');
      a.download = 'boceto-alumfer.png';
      a.href = cv.toDataURL('image/png');
      a.click();
      if (typeof gtag !== 'undefined') gtag('event', 'boceto_descarga', { event_category: 'Disenador', value: lista.length });
    } catch (_) {
      alert('No pudimos generar la imagen en este navegador. Podés mandar la lista por WhatsApp.');
    } finally {
      pngBtn.classList.remove('is-loading');
    }
  });
  function cargar(svg) {
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = mal;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  function partir(texto, max) {
    const out = []; let l = '';
    texto.split(' ').forEach(p => { if ((l + ' ' + p).trim().length > max) { out.push(l.trim()); l = p; } else l += ' ' + p; });
    if (l.trim()) out.push(l.trim());
    return out;
  }

  waBtn.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') gtag('event', 'boceto_whatsapp', { event_category: 'Disenador', value: lista.length });
  });

  // Inicio
  personaIn.checked = persona;
  render(true);
  renderLista();
})();
