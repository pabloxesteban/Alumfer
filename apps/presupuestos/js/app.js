/* ============================================================
   ALUMFER — Presupuestos · Interfaz

   La pantalla sigue tres pasos: para quién es, qué lleva y cómo
   se entrega. El tipo de abertura se elige por dibujo, las
   medidas van en centímetros y lo poco frecuente queda plegado.

   Cada presupuesto guarda una copia de la tabla de precios con la
   que se calculó. Así, al reabrir uno viejo, los números son los
   que se le pasaron al cliente aunque la lista ya haya aumentado.
   ============================================================ */

(function () {
  'use strict';

  var F = window.Formato, C = window.Calculo, A = window.Almacenamiento,
      D = window.Documento, I = window.Iconos;

  /* Los extras que se usan casi siempre quedan a la vista; el resto, plegado. */
  var EXTRAS_FRECUENTES = ['mosquitero', 'premarco', 'cortina-pvc', 'reja-adic'];

  var precios = A.cargarPrecios();   // lista vigente (pestaña Precios)
  var actual = null;                 // presupuesto en edición
  var hayCambios = false;
  var temporizadorGuardado = null;
  var itemAlQueCambiarTipo = null;   // id del ítem abierto en el selector, o null si es uno nuevo

  function $(id) { return document.getElementById(id); }
  function clonar(x) { return JSON.parse(JSON.stringify(x)); }
  function idUnico(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /** Precios con los que se calcula el presupuesto abierto. */
  function preciosDelPresupuesto() { return (actual && actual.precios) || precios; }

  function avisar(texto, tipo) {
    var nodo = document.createElement('div');
    nodo.className = 'aviso' + (tipo === 'error' ? ' aviso--error' : '');
    nodo.textContent = texto;
    $('avisos').appendChild(nodo);
    setTimeout(function () { nodo.remove(); }, tipo === 'error' ? 5000 : 2600);
  }

  /** Mete el dibujo correspondiente dentro de cada botón marcado con data-icono. */
  function ponerIconos(raiz) {
    (raiz || document).querySelectorAll('[data-icono]').forEach(function (nodo) {
      if (nodo.querySelector('svg')) return;
      nodo.insertAdjacentHTML('afterbegin', I.ui(nodo.dataset.icono));
    });
  }

  /* ════════ Presupuesto ════════ */

  function presupuestoNuevo() {
    var g = precios.generales;
    return {
      id: idUnico('pr_'),
      numero: '',
      fecha: F.fechaISO(),
      estado: 'borrador',
      cliente: { nombre: '', telefono: '', email: '', direccion: '', localidad: '' },
      items: [],
      ajustes: {
        descuentoPct: g.descuentoPct, colocacionModo: g.colocacionModo, colocacionValor: g.colocacionValor,
        flete: g.flete, aplicaIva: g.aplicaIva, ivaPct: g.ivaPct,
        anticipoPct: g.anticipoPct, validezDias: g.validezDias
      },
      notas: '',
      precios: clonar(precios),
      creado: new Date().toISOString(),
      modificado: new Date().toISOString(),
      total: 0
    };
  }

  function abrir(presupuesto) {
    actual = presupuesto;
    if (!actual.precios) actual.precios = clonar(precios);
    volcarEnFormulario();
    render();
    hayCambios = false;
    mostrarVista('presupuesto');
  }

  function volcarEnFormulario() {
    var c = actual.cliente || {}, a = actual.ajustes || {};
    $('cli-nombre').value = c.nombre || '';
    $('cli-telefono').value = c.telefono || '';
    $('cli-email').value = c.email || '';
    $('cli-direccion').value = c.direccion || '';
    $('cli-localidad').value = c.localidad || '';
    $('pre-fecha').value = actual.fecha || F.fechaISO();
    $('pre-estado').value = actual.estado || 'borrador';
    $('pre-notas').value = actual.notas || '';
    $('numero-presupuesto').textContent = actual.numero || 'Nuevo';

    $('aj-descuento').value = a.descuentoPct;
    $('aj-colocacion-modo').value = a.colocacionModo;
    $('aj-colocacion-valor').value = a.colocacionValor;
    $('aj-flete').value = a.flete;
    $('aj-iva').value = a.aplicaIva ? 'si' : 'no';
    $('aj-iva-pct').value = a.ivaPct;
    $('aj-anticipo').value = a.anticipoPct;
    $('aj-validez').value = a.validezDias;
    etiquetaColocacion();
  }

  function leerFormulario() {
    actual.cliente = {
      nombre: $('cli-nombre').value.trim(),
      telefono: $('cli-telefono').value.trim(),
      email: $('cli-email').value.trim(),
      direccion: $('cli-direccion').value.trim(),
      localidad: $('cli-localidad').value.trim()
    };
    actual.fecha = $('pre-fecha').value || F.fechaISO();
    actual.estado = $('pre-estado').value;
    actual.notas = $('pre-notas').value;
    actual.ajustes = {
      descuentoPct: F.aNumero($('aj-descuento').value),
      colocacionModo: $('aj-colocacion-modo').value,
      colocacionValor: F.aNumero($('aj-colocacion-valor').value),
      flete: F.aNumero($('aj-flete').value),
      aplicaIva: $('aj-iva').value === 'si',
      ivaPct: F.aNumero($('aj-iva-pct').value),
      anticipoPct: F.aNumero($('aj-anticipo').value),
      validezDias: F.aNumero($('aj-validez').value)
    };
  }

  function etiquetaColocacion() {
    var modo = $('aj-colocacion-modo').value;
    var texto = modo === 'porcentaje' ? 'Porcentaje (%)'
              : modo === 'm2' ? '$ por m²'
              : modo === 'monto' ? 'Monto ($)' : 'Sin colocación';
    $('aj-colocacion-label').textContent = texto;
    $('aj-colocacion-valor').disabled = (modo === 'sin');
  }

  function guardar(silencioso) {
    leerFormulario();
    if (!actual.numero) actual.numero = A.siguienteNumero();
    actual.total = C.calcularPresupuesto(actual, preciosDelPresupuesto()).total;
    A.guardar(actual);
    hayCambios = false;
    $('numero-presupuesto').textContent = actual.numero;
    renderHistorial();
    if (!silencioso) avisar('Presupuesto ' + actual.numero + ' guardado');
  }

  /** Guarda solo lo que ya vale la pena conservar, sin molestar. */
  function autoguardar() {
    clearTimeout(temporizadorGuardado);
    temporizadorGuardado = setTimeout(function () {
      if (!actual) return;
      leerFormulario();
      if (!actual.items.length && !actual.cliente.nombre) return;
      guardar(true);
    }, 900);
  }

  /* ════════ Elegir el tipo de abertura ════════ */

  function abrirSelectorTipo(itemId) {
    itemAlQueCambiarTipo = itemId || null;
    var p = preciosDelPresupuesto();
    var item = itemId ? itemPorId(itemId) : null;

    $('modal-titulo').textContent = item ? '¿Por cuál la cambiamos?' : '¿Qué abertura querés agregar?';

    var grupos = [], porGrupo = {};
    p.tipologias.forEach(function (t) {
      if (!porGrupo[t.grupo]) { porGrupo[t.grupo] = []; grupos.push(t.grupo); }
      porGrupo[t.grupo].push(t);
    });

    $('grilla-tipos').innerHTML = grupos.map(function (g) {
      return '<h3 class="tipos-grupo">' + F.escapar(g) + '</h3><div class="tipos-grilla">' +
        porGrupo[g].map(function (t) {
          var activo = item && item.tipologiaId === t.id;
          return '<button class="tipo-tile' + (activo ? ' is-activo' : '') + '" data-tipo="' + t.id + '">' +
            I.abertura(t.id, t.grupo) + '<span>' + F.escapar(t.nombre) + '</span></button>';
        }).join('') + '</div>';
    }).join('');

    $('modal-tipos').hidden = false;
    document.querySelector('.modal__cuerpo').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function cerrarSelectorTipo() {
    $('modal-tipos').hidden = true;
    document.body.style.overflow = '';
    itemAlQueCambiarTipo = null;
  }

  function elegirTipo(tipoId) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, tipoId);

    if (itemAlQueCambiarTipo) {
      var item = itemPorId(itemAlQueCambiarTipo);
      if (item) {
        item.tipologiaId = tipoId;
        if (tip && tip.lineas && tip.lineas.indexOf(item.lineaId) === -1) item.lineaId = tip.lineas[0];
        if (tip && tip.sinVidrio) item.vidrioId = 'sin';
        else if (item.vidrioId === 'sin') item.vidrioId = 'float4';
      }
      cerrarSelectorTipo();
      render();
    } else {
      var nuevo = C.itemNuevo(p);
      nuevo.tipologiaId = tipoId;
      if (tip && tip.lineas) nuevo.lineaId = tip.lineas[0];
      if (tip && tip.sinVidrio) nuevo.vidrioId = 'sin';
      var ultimo = actual.items[actual.items.length - 1];
      if (ultimo) {   // la línea y el color casi siempre se repiten en la misma obra
        if (!tip || !tip.lineas || tip.lineas.indexOf(ultimo.lineaId) > -1) nuevo.lineaId = ultimo.lineaId;
        nuevo.colorId = ultimo.colorId;
        if (!tip || !tip.sinVidrio) nuevo.vidrioId = ultimo.vidrioId === 'sin' ? 'float4' : ultimo.vidrioId;
      }
      actual.items.push(nuevo);
      cerrarSelectorTipo();
      render();
      var nodos = $('lista-items').children;
      var ultimoNodo = nodos[nodos.length - 1];
      if (ultimoNodo) ultimoNodo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hayCambios = true;
    autoguardar();
  }

  /* ════════ Ítems ════════ */

  function opciones(lista, seleccion) {
    return lista.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === seleccion ? ' selected' : '') + '>' +
        F.escapar(x.nombre) + (x.ayuda ? F.escapar(' — ' + x.ayuda) : '') + '</option>';
    }).join('');
  }

  function chipExtra(ad, item) {
    var activo = (item.adicionales || []).indexOf(ad.id) > -1;
    return '<label class="extra' + (activo ? ' is-activo' : '') + '">' +
      '<input type="checkbox" data-adicional="' + ad.id + '"' + (activo ? ' checked' : '') + '> ' +
      F.escapar(ad.nombre) + '</label>';
  }

  function nodoItem(item, indice) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, item.tipologiaId);
    var lineasValidas = p.lineas.filter(function (l) {
      return !tip || !tip.lineas || tip.lineas.indexOf(l.id) > -1;
    });
    var sinVidrio = !!(tip && tip.sinVidrio);

    var frecuentes = [], resto = [], hayElegidoEnElResto = false;
    p.adicionales.forEach(function (ad) {
      if (EXTRAS_FRECUENTES.indexOf(ad.id) > -1) return frecuentes.push(ad);
      resto.push(ad);
      if ((item.adicionales || []).indexOf(ad.id) > -1) hayElegidoEnElResto = true;
    });

    var nodo = document.createElement('div');
    nodo.className = 'item';
    nodo.dataset.id = item.id;
    nodo.innerHTML = '' +
      '<div class="item__tipo">' +
        '<span class="item__dibujo">' + I.abertura(item.tipologiaId, tip && tip.grupo) + '</span>' +
        '<span class="item__nombre">' +
          '<strong>' + F.escapar(tip ? tip.nombre : 'Abertura') + '</strong>' +
          '<span>Abertura ' + (indice + 1) + '</span>' +
        '</span>' +
        '<button class="btn btn--fantasma btn--sm" data-accion="cambiar-tipo" data-icono="cambiar">Cambiar</button>' +
      '</div>' +

      '<div class="item__medidas">' +
        '<label class="campo"><span>Ancho (cm)</span>' +
          '<input type="number" data-campo="anchoCm" min="0" step="1" inputmode="numeric" value="' + (item.ancho / 10) + '"></label>' +
        '<label class="campo"><span>Alto (cm)</span>' +
          '<input type="number" data-campo="altoCm" min="0" step="1" inputmode="numeric" value="' + (item.alto / 10) + '"></label>' +
        '<label class="campo campo--cantidad"><span>¿Cuántas?</span>' +
          '<input type="number" data-campo="cantidad" min="1" step="1" inputmode="numeric" value="' + item.cantidad + '"></label>' +
      '</div>' +
      '<p class="item__equivale" data-equivale></p>' +

      '<div class="item__opciones">' +
        '<label class="campo"><span>Línea</span>' +
          '<select data-campo="lineaId">' + opciones(lineasValidas, item.lineaId) + '</select>' +
          '<span class="campo__ayuda" data-ayuda="lineaId"></span></label>' +
        (sinVidrio ? '' :
        '<label class="campo"><span>Vidrio</span>' +
          '<select data-campo="vidrioId">' + opciones(p.vidrios, item.vidrioId) + '</select>' +
          '<span class="campo__ayuda" data-ayuda="vidrioId"></span></label>') +
        '<label class="campo"><span>Color</span>' +
          '<select data-campo="colorId">' + opciones(p.colores, item.colorId) + '</select></label>' +
      '</div>' +

      '<div>' +
        '<p class="extras__titulo">Extras</p>' +
        '<div class="extras">' + frecuentes.map(function (ad) { return chipExtra(ad, item); }).join('') + '</div>' +
        (resto.length
          ? '<details class="desplegable"' + (hayElegidoEnElResto ? ' open' : '') + '>' +
              '<summary>Más extras</summary>' +
              '<div class="extras">' + resto.map(function (ad) { return chipExtra(ad, item); }).join('') + '</div>' +
            '</details>'
          : '') +
      '</div>' +

      '<details class="desplegable"' + ((item.descuentoPct || item.nota) ? ' open' : '') + '>' +
        '<summary>Descuento y nota</summary>' +
        '<div class="grilla-campos">' +
          '<label class="campo"><span>Descuento de esta abertura (%)</span>' +
            '<input type="number" data-campo="descuentoPct" min="0" max="100" step="1" inputmode="numeric" value="' + item.descuentoPct + '"></label>' +
          '<label class="campo campo--ancho"><span>Nota (sale impresa)</span>' +
            '<input type="text" data-campo="nota" value="' + F.escapar(item.nota || '') + '" placeholder="Ej.: hoja derecha corrediza"></label>' +
        '</div>' +
      '</details>' +

      '<div class="item__pie">' +
        '<div class="item__acciones">' +
          '<button class="btn btn--fantasma btn--sm" data-accion="duplicar" data-icono="duplicar">Repetir</button>' +
          '<button class="btn btn--fantasma btn--sm btn--peligro" data-accion="borrar" data-icono="borrar">Borrar</button>' +
        '</div>' +
        '<div class="item__total" data-total></div>' +
      '</div>';

    ponerIconos(nodo);
    pintarPieItem(nodo, item);
    return nodo;
  }

  function pintarPieItem(nodo, item) {
    var r = C.calcularItem(item, preciosDelPresupuesto());

    nodo.querySelector('[data-equivale]').innerHTML =
      F.medidasMetros(r.anchoMm, r.altoMm) + ' · ' + F.numero(r.m2Fact, 2) + ' m²' +
      (r.aplicaMinimo ? ' <span class="marca-minimo">(mínimo facturable)</span>' : '');

    var p = preciosDelPresupuesto();
    nodo.querySelectorAll('[data-ayuda]').forEach(function (span) {
      var campo = span.dataset.ayuda;
      var lista = campo === 'lineaId' ? p.lineas : p.vidrios;
      var elegido = C.buscar(lista, item[campo]);
      span.textContent = (elegido && elegido.ayuda) || '';
    });

    nodo.querySelector('[data-total]').innerHTML =
      '<strong>' + F.moneda(r.total) + '</strong>' +
      (r.cantidad > 1 ? '<span>' + r.cantidad + ' × ' + F.moneda(r.unitario) + '</span>' : '');
  }

  function itemPorId(id) {
    for (var i = 0; i < actual.items.length; i++) if (actual.items[i].id === id) return actual.items[i];
    return null;
  }

  function render() {
    var lista = $('lista-items');
    lista.replaceChildren.apply(lista, actual.items.map(nodoItem));
    $('items-vacio').hidden = actual.items.length > 0;
    renderTotales();
  }

  /** Recalcula sin reconstruir los campos, para no perder el foco al tipear. */
  function refrescarCalculos() {
    Array.prototype.forEach.call($('lista-items').children, function (nodo) {
      var item = itemPorId(nodo.dataset.id);
      if (item) pintarPieItem(nodo, item);
    });
    renderTotales();
  }

  function renderTotales() {
    leerFormulario();
    var p = preciosDelPresupuesto();
    var r = C.calcularPresupuesto(actual, p);
    var filas = [];
    var fila = function (rotulo, valor, clase) {
      filas.push('<div class="totales__fila' + (clase ? ' ' + clase : '') + '"><span>' + rotulo + '</span><span>' + valor + '</span></div>');
    };

    fila('Aberturas', F.moneda(r.subtotal));
    if (r.descuento > 0) fila('Descuento ' + F.numero(r.descuentoPct, 0) + ' %', '− ' + F.moneda(r.descuento));
    if (r.colocacion > 0) fila('Colocación', F.moneda(r.colocacion));
    if (r.flete > 0) fila('Flete', F.moneda(r.flete));
    if (r.aplicaIva) fila('IVA ' + F.numero(r.ivaPct, 0) + ' %', F.moneda(r.iva));
    fila('Total', F.moneda(r.total), 'totales__fila--total');
    if (r.anticipoPct > 0 && r.total > 0) {
      fila('Seña ' + F.numero(r.anticipoPct, 0) + ' %', F.moneda(r.anticipo), 'totales__fila--tenue');
      fila('Saldo contra entrega', F.moneda(r.saldo), 'totales__fila--tenue');
    }

    if (p.revision !== precios.revision) {
      filas.push('<div class="totales__fila totales__fila--tenue"><span>Calculado con los precios del ' + F.fechaCorta(p.actualizado) + '</span>' +
        '<span><button class="btn btn--fantasma btn--sm" id="btn-actualizar-precios-pres">Actualizar</button></span></div>');
    }

    $('totales').innerHTML = filas.join('');
    var btn = $('btn-actualizar-precios-pres');
    if (btn) btn.addEventListener('click', function () {
      if (!confirm('¿Recalcular este presupuesto con los precios de hoy?')) return;
      actual.precios = clonar(precios);
      render();
      autoguardar();
      avisar('Presupuesto recalculado con los precios de hoy');
    });

    $('resumen-items').textContent = actual.items.length
      ? actual.items.length + (actual.items.length === 1 ? ' abertura · ' : ' aberturas · ') + F.numero(r.m2Total, 2) + ' m²'
      : '';

    $('barra-total-valor').textContent = F.moneda(r.total);
    $('barra-total').hidden = !actual.items.length;
  }

  /* ════════ Anteriores ════════ */

  var ESTADOS = { borrador: 'En preparación', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado' };

  function renderHistorial() {
    var lista = A.listar();
    $('badge-historial').textContent = lista.length;
    var q = ($('buscar-historial').value || '').toLowerCase().trim();
    if (q) {
      lista = lista.filter(function (p) {
        return (p.numero || '').toLowerCase().indexOf(q) > -1 ||
               ((p.cliente && p.cliente.nombre) || '').toLowerCase().indexOf(q) > -1 ||
               ((p.cliente && p.cliente.localidad) || '').toLowerCase().indexOf(q) > -1;
      });
    }

    var cont = $('lista-historial');
    if (!lista.length) {
      cont.innerHTML = '<p class="vacio">' + (q ? 'Ningún presupuesto coincide con la búsqueda.' : 'Todavía no guardaste presupuestos.') + '</p>';
      return;
    }

    cont.innerHTML = lista.map(function (p) {
      var cli = p.cliente || {};
      var estado = p.estado || 'borrador';
      return '<div class="historial-fila" data-id="' + p.id + '">' +
        '<div class="historial-fila__datos">' +
          '<strong>' + F.escapar(cli.nombre || 'Sin nombre') + '</strong>' +
          '<span>' + F.escapar(p.numero || '') + ' · ' + F.fechaCorta(p.fecha) +
            (cli.localidad ? ' · ' + F.escapar(cli.localidad) : '') + '</span>' +
        '</div>' +
        '<span class="estado estado--' + F.escapar(estado) + '">' + F.escapar(ESTADOS[estado] || estado) + '</span>' +
        '<span class="historial-fila__total">' + F.moneda(p.total || 0) + '</span>' +
        '<span class="historial-fila__acciones">' +
          '<button class="btn btn--primario btn--sm" data-accion="abrir">Abrir</button>' +
          '<button class="btn btn--fantasma btn--sm" data-accion="duplicar" data-icono="duplicar">Repetir</button>' +
          '<button class="btn btn--fantasma btn--sm btn--peligro" data-accion="borrar" data-icono="borrar">Borrar</button>' +
        '</span>' +
      '</div>';
    }).join('');
    ponerIconos(cont);
  }

  /* ════════ Precios ════════ */

  function guardarPrecios() {
    precios.revision = (precios.revision || 0) + 1;
    A.guardarPrecios(precios);
    $('precios-actualizado').textContent = F.fechaCorta(precios.actualizado);
  }

  /**
   * Tabla editable genérica.
   * columnas: [{campo, etiqueta, tipo: 'texto'|'numero'|'porcentaje'|'check'|'select', clase, opciones}]
   */
  function tablaEditable(contenedorId, lista, columnas, opts) {
    opts = opts || {};
    var cont = $(contenedorId);

    function celda(x, col) {
      var v = x[col.campo];
      if (col.tipo === 'check') {
        return '<input type="checkbox" data-campo="' + col.campo + '"' + (v ? ' checked' : '') + '>';
      }
      if (col.tipo === 'select') {
        return '<select data-campo="' + col.campo + '">' + col.opciones.map(function (o) {
          return '<option value="' + o.valor + '"' + (o.valor === v ? ' selected' : '') + '>' + F.escapar(o.texto) + '</option>';
        }).join('') + '</select>';
      }
      if (col.tipo === 'porcentaje') {
        return '<input type="number" step="1" data-campo="' + col.campo + '" data-porcentaje="1" value="' + Math.round((v || 0) * 100) + '">';
      }
      if (col.tipo === 'numero') {
        return '<input type="number" step="' + (col.paso || 1) + '" min="0" data-campo="' + col.campo + '" value="' + (v == null ? '' : v) + '">';
      }
      return '<input type="text" data-campo="' + col.campo + '" value="' + F.escapar(v || '') + '">';
    }

    function pintar() {
      var filas = '', grupoActual = null;
      lista.forEach(function (x, i) {
        if (opts.agrupar && x[opts.agrupar] !== grupoActual) {
          grupoActual = x[opts.agrupar];
          filas += '<tr class="grupo"><td colspan="' + (columnas.length + 1) + '">' + F.escapar(grupoActual || 'Otros') + '</td></tr>';
        }
        filas += '<tr data-indice="' + i + '">' +
          columnas.map(function (c) { return '<td class="' + (c.clase || '') + '">' + celda(x, c) + '</td>'; }).join('') +
          '<td class="alineado-der"><button class="btn btn--fantasma btn--sm btn--peligro" data-accion="borrar">Borrar</button></td>' +
        '</tr>';
      });

      cont.innerHTML = '<table class="tabla-precios"><thead><tr>' +
        columnas.map(function (c) { return '<th class="' + (c.clase || '') + '">' + F.escapar(c.etiqueta) + '</th>'; }).join('') +
        '<th></th></tr></thead><tbody>' + filas + '</tbody></table>' +
        '<p><button class="btn btn--fantasma btn--sm" data-accion="agregar">+ Agregar fila</button></p>';
    }

    cont.addEventListener('input', function (ev) {
      var campo = ev.target.dataset.campo;
      var fila = ev.target.closest('tr');
      if (!campo || !fila) return;
      var x = lista[Number(fila.dataset.indice)];
      if (!x) return;
      if (ev.target.type === 'checkbox') x[campo] = ev.target.checked;
      else if (ev.target.dataset.porcentaje) x[campo] = F.aNumero(ev.target.value) / 100;
      else if (ev.target.type === 'number') x[campo] = F.aNumero(ev.target.value);
      else x[campo] = ev.target.value;
      guardarPrecios();
    });

    cont.addEventListener('click', function (ev) {
      var boton = ev.target.closest('button');
      if (!boton) return;
      if (boton.dataset.accion === 'agregar') {
        lista.push(Object.assign({ id: idUnico(opts.prefijo || 'x_') }, opts.nuevo || {}));
        guardarPrecios(); pintar();
      } else if (boton.dataset.accion === 'borrar') {
        var i = Number(boton.closest('tr').dataset.indice);
        if (!confirm('¿Eliminar "' + (lista[i].nombre || 'esta fila') + '" de la lista?')) return;
        lista.splice(i, 1);
        guardarPrecios(); pintar();
      }
    });

    pintar();
  }

  function renderPrecios() {
    $('precios-actualizado').textContent = F.fechaCorta(precios.actualizado);
    $('gen-min-m2').value = precios.generales.minM2Global;
    $('gen-redondeo').value = precios.generales.redondeo;
    $('gen-plazo').value = precios.generales.plazoEntrega || '';

    tablaEditable('tabla-lineas', precios.lineas, [
      { campo: 'nombre', etiqueta: 'Línea' },
      { campo: 'ayuda', etiqueta: 'Descripción' },
      { campo: 'factor', etiqueta: 'Multiplicador', tipo: 'numero', paso: 0.01, clase: 'col-min' }
    ], { prefijo: 'ln_', nuevo: { nombre: 'Línea nueva', factor: 1 } });

    tablaEditable('tabla-tipologias', precios.tipologias, [
      { campo: 'grupo', etiqueta: 'Grupo', clase: 'col-min' },
      { campo: 'nombre', etiqueta: 'Abertura' },
      { campo: 'precioM2', etiqueta: '$ / m²', tipo: 'numero', paso: 1000, clase: 'col-num' },
      { campo: 'minM2', etiqueta: 'm² mínimos', tipo: 'numero', paso: 0.05, clase: 'col-min' },
      { campo: 'sinVidrio', etiqueta: 'Sin vidrio', tipo: 'check', clase: 'col-min' }
    ], { agrupar: 'grupo', prefijo: 'tp_', nuevo: { grupo: 'Otros', nombre: 'Abertura nueva', precioM2: 0, minM2: 0.5 } });

    tablaEditable('tabla-vidrios', precios.vidrios, [
      { campo: 'nombre', etiqueta: 'Vidrio' },
      { campo: 'ayuda', etiqueta: 'Descripción' },
      { campo: 'precioM2', etiqueta: '$ / m²', tipo: 'numero', paso: 1000, clase: 'col-num' }
    ], { prefijo: 'vd_', nuevo: { nombre: 'Vidrio nuevo', precioM2: 0 } });

    tablaEditable('tabla-colores', precios.colores, [
      { campo: 'nombre', etiqueta: 'Color / terminación' },
      { campo: 'recargo', etiqueta: 'Recargo (%)', tipo: 'porcentaje', clase: 'col-min' }
    ], { prefijo: 'cl_', nuevo: { nombre: 'Color nuevo', recargo: 0 } });

    tablaEditable('tabla-adicionales', precios.adicionales, [
      { campo: 'nombre', etiqueta: 'Adicional' },
      { campo: 'modo', etiqueta: 'Se cobra', tipo: 'select', clase: 'col-min', opciones: [
        { valor: 'm2', texto: 'Por m²' }, { valor: 'ml', texto: 'Por metro lineal' }, { valor: 'unidad', texto: 'Por unidad' }
      ] },
      { campo: 'precio', etiqueta: 'Precio', tipo: 'numero', paso: 1000, clase: 'col-num' }
    ], { prefijo: 'ad_', nuevo: { nombre: 'Adicional nuevo', modo: 'unidad', precio: 0 } });
  }

  /* ════════ Vistas ════════ */

  function mostrarVista(nombre) {
    ['presupuesto', 'historial', 'precios'].forEach(function (v) {
      $('vista-' + v).hidden = (v !== nombre);
    });
    document.querySelectorAll('.tab').forEach(function (t) {
      var activa = t.dataset.vista === nombre;
      t.classList.toggle('is-activa', activa);
      t.setAttribute('aria-selected', activa ? 'true' : 'false');
    });
    if (nombre === 'historial') renderHistorial();
    if (nombre === 'presupuesto' && actual) render();   // refleja cambios hechos en la pestaña Precios
    $('barra-total').hidden = (nombre !== 'presupuesto') || !actual || !actual.items.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ════════ Acciones finales ════════ */

  function imprimir() {
    if (!actual.items.length) return avisar('Agregá al menos una abertura antes de imprimir.', 'error');
    guardar(true);
    var p = preciosDelPresupuesto();
    D.imprimir(actual, C.calcularPresupuesto(actual, p), p);
  }

  function enviarWhatsapp() {
    if (!actual.items.length) return avisar('Agregá al menos una abertura antes de enviar.', 'error');
    guardar(true);
    var p = preciosDelPresupuesto();
    if (!actual.cliente.telefono) avisar('Sin teléfono cargado: WhatsApp te va a pedir el contacto.');
    window.open(D.urlWhatsapp(actual, C.calcularPresupuesto(actual, p), p), '_blank');
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise(function (resolver, rechazar) {
      var area = document.createElement('textarea');
      area.value = texto;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand('copy');
      area.remove();
      ok ? resolver() : rechazar(new Error('copy falló'));
    });
  }

  /* ════════ Eventos ════════ */

  function conectarEventos() {
    document.querySelector('.barra__tabs').addEventListener('click', function (ev) {
      var tab = ev.target.closest('.tab');
      if (tab) mostrarVista(tab.dataset.vista);
    });

    $('btn-nuevo').addEventListener('click', function () {
      if (hayCambios && actual.items.length && !confirm('Hay cambios sin guardar. ¿Empezar un presupuesto nuevo igual?')) return;
      abrir(presupuestoNuevo());
      avisar('Presupuesto nuevo');
    });

    // Datos del cliente y ajustes
    ['cli-nombre','cli-telefono','cli-email','cli-direccion','cli-localidad','pre-fecha','pre-estado','pre-notas',
     'aj-descuento','aj-colocacion-valor','aj-flete','aj-iva-pct','aj-anticipo','aj-validez'].forEach(function (id) {
      $(id).addEventListener('input', function () { hayCambios = true; renderTotales(); autoguardar(); });
    });
    $('aj-colocacion-modo').addEventListener('change', function () {
      etiquetaColocacion(); hayCambios = true; renderTotales(); autoguardar();
    });
    $('aj-iva').addEventListener('change', function () { hayCambios = true; renderTotales(); autoguardar(); });

    // Elegir tipo de abertura
    $('btn-agregar-item').addEventListener('click', function () { abrirSelectorTipo(null); });
    $('btn-cerrar-modal').addEventListener('click', cerrarSelectorTipo);
    $('modal-tipos').addEventListener('click', function (ev) {
      if (ev.target === $('modal-tipos')) return cerrarSelectorTipo();
      var tile = ev.target.closest('.tipo-tile');
      if (tile) elegirTipo(tile.dataset.tipo);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !$('modal-tipos').hidden) cerrarSelectorTipo();
    });

    var lista = $('lista-items');

    lista.addEventListener('input', function (ev) {
      var nodo = ev.target.closest('.item');
      if (!nodo) return;
      var item = itemPorId(nodo.dataset.id);
      if (!item) return;
      var campo = ev.target.dataset.campo;

      if (ev.target.dataset.adicional) {
        var id = ev.target.dataset.adicional;
        item.adicionales = item.adicionales || [];
        var i = item.adicionales.indexOf(id);
        if (ev.target.checked && i === -1) item.adicionales.push(id);
        if (!ev.target.checked && i > -1) item.adicionales.splice(i, 1);
        ev.target.closest('.extra').classList.toggle('is-activo', ev.target.checked);
      } else if (campo === 'anchoCm') {
        item.ancho = F.aNumero(ev.target.value) * 10;
      } else if (campo === 'altoCm') {
        item.alto = F.aNumero(ev.target.value) * 10;
      } else if (campo === 'nota') {
        item.nota = ev.target.value;
      } else if (campo) {
        item[campo] = ev.target.type === 'number' ? F.aNumero(ev.target.value) : ev.target.value;
      }

      hayCambios = true;
      refrescarCalculos();
      autoguardar();
    });

    lista.addEventListener('click', function (ev) {
      var boton = ev.target.closest('button[data-accion]');
      if (!boton) return;
      var nodo = boton.closest('.item');
      var item = itemPorId(nodo.dataset.id);
      if (!item) return;

      if (boton.dataset.accion === 'cambiar-tipo') {
        return abrirSelectorTipo(item.id);
      }
      if (boton.dataset.accion === 'duplicar') {
        var copia = clonar(item);
        copia.id = idUnico('it_');
        actual.items.splice(actual.items.indexOf(item) + 1, 0, copia);
      } else if (boton.dataset.accion === 'borrar') {
        var tip = C.buscar(preciosDelPresupuesto().tipologias, item.tipologiaId);
        if (!confirm('¿Borrar "' + (tip ? tip.nombre : 'esta abertura') + '" del presupuesto?')) return;
        actual.items.splice(actual.items.indexOf(item), 1);
      }
      render();
      hayCambios = true;
      autoguardar();
    });

    $('btn-pdf').addEventListener('click', imprimir);
    $('btn-pdf-fijo').addEventListener('click', imprimir);
    $('btn-whatsapp').addEventListener('click', enviarWhatsapp);
    $('btn-whatsapp-fijo').addEventListener('click', enviarWhatsapp);

    $('btn-copiar').addEventListener('click', function () {
      var p = preciosDelPresupuesto();
      var texto = D.texto(actual, C.calcularPresupuesto(actual, p), p);
      copiar(texto)
        .then(function () { avisar('Resumen copiado'); })
        .catch(function () { avisar('No se pudo copiar automáticamente.', 'error'); });
    });

    // Anteriores
    $('buscar-historial').addEventListener('input', function () { renderHistorial(); });

    $('lista-historial').addEventListener('click', function (ev) {
      var boton = ev.target.closest('button[data-accion]');
      if (!boton) return;
      var id = boton.closest('.historial-fila').dataset.id;
      var p = A.obtener(id);
      if (!p) return;
      if (boton.dataset.accion === 'abrir') {
        if (hayCambios && actual.items.length) guardar(true);
        abrir(p);
      } else if (boton.dataset.accion === 'duplicar') {
        var copia = clonar(p);
        copia.id = idUnico('pr_');
        copia.numero = '';
        copia.fecha = F.fechaISO();
        copia.estado = 'borrador';
        copia.items.forEach(function (it) { it.id = idUnico('it_'); });
        abrir(copia);
        avisar('Copia lista para editar');
      } else if (boton.dataset.accion === 'borrar') {
        if (!confirm('¿Borrar el presupuesto de ' + ((p.cliente && p.cliente.nombre) || p.numero) + '? No se puede deshacer.')) return;
        A.borrar(id);
        if (actual && actual.id === id) abrir(presupuestoNuevo());
        renderHistorial();
        avisar('Presupuesto borrado');
      }
    });

    $('btn-exportar').addEventListener('click', function () {
      var datos = JSON.stringify(A.exportarTodo(), null, 2);
      var enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(new Blob([datos], { type: 'application/json' }));
      enlace.download = 'alumfer-presupuestos-' + F.fechaISO() + '.json';
      enlace.click();
      URL.revokeObjectURL(enlace.href);
      avisar('Copia guardada en Descargas');
    });

    $('btn-importar').addEventListener('click', function () { $('archivo-importar').click(); });

    $('archivo-importar').addEventListener('change', function (ev) {
      var archivo = ev.target.files[0];
      if (!archivo) return;
      if (!confirm('Recuperar una copia reemplaza los presupuestos y los precios guardados. ¿Seguir?')) { ev.target.value = ''; return; }
      var lector = new FileReader();
      lector.onload = function () {
        try {
          A.importarTodo(JSON.parse(lector.result));
          precios = A.cargarPrecios();
          renderPrecios();
          renderHistorial();
          abrir(presupuestoNuevo());
          avisar('Copia recuperada');
        } catch (e) {
          avisar(e.message || 'No se pudo leer el archivo.', 'error');
        }
        ev.target.value = '';
      };
      lector.readAsText(archivo);
    });

    // Precios
    $('btn-aplicar-ajuste').addEventListener('click', function () {
      var pct = F.aNumero($('ajuste-pct').value);
      if (!pct) return avisar('Indicá un porcentaje distinto de cero.', 'error');
      var ambitos = {
        tipologias: $('ajuste-tipologias').checked,
        vidrios: $('ajuste-vidrios').checked,
        adicionales: $('ajuste-adicionales').checked,
        colocacion: true
      };
      if (!ambitos.tipologias && !ambitos.vidrios && !ambitos.adicionales) return avisar('Elegí al menos una tabla.', 'error');
      if (!confirm('¿Aplicar ' + (pct > 0 ? '+' : '') + pct + ' % a los precios elegidos?')) return;
      precios = C.ajustarPrecios(precios, pct, ambitos);
      guardarPrecios();
      renderPrecios();
      avisar('Precios actualizados ' + (pct > 0 ? '+' : '') + pct + ' %');
    });

    $('btn-restaurar-precios').addEventListener('click', function () {
      if (!confirm('¿Volver a los precios originales? Se pierden los valores que cargaste.')) return;
      precios = A.restaurarPrecios();
      renderPrecios();
      avisar('Precios originales restaurados');
    });

    ['gen-min-m2', 'gen-redondeo', 'gen-plazo'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        precios.generales.minM2Global = F.aNumero($('gen-min-m2').value);
        precios.generales.redondeo = F.aNumero($('gen-redondeo').value);
        precios.generales.plazoEntrega = $('gen-plazo').value;
        guardarPrecios();
      });
    });

    // Atajos
    document.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey)) return;
      if (ev.key === 's') { ev.preventDefault(); guardar(); }
      if (ev.key === 'p') { ev.preventDefault(); imprimir(); }
    });

    window.addEventListener('beforeunload', function (ev) {
      if (!hayCambios || !actual.items.length) return;
      ev.preventDefault();
      ev.returnValue = '';
    });
  }

  /* ════════ Arranque ════════ */

  function iniciar() {
    if (!A.disponible) $('aviso-almacenamiento').hidden = false;
    ponerIconos();
    renderPrecios();
    renderHistorial();
    var ultimos = A.listar();
    abrir(ultimos.length && ultimos[0].estado === 'borrador' ? ultimos[0] : presupuestoNuevo());
    conectarEventos();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
