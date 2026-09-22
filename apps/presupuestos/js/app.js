/* ============================================================
   ALUMFER — Presupuestos · Interfaz

   Cada presupuesto guarda una copia de la tabla de precios con la
   que se calculó. Así, al reabrir uno viejo, los números son los
   que se le pasaron al cliente aunque la lista ya haya aumentado.
   ============================================================ */

(function () {
  'use strict';

  var F = window.Formato, C = window.Calculo, A = window.Almacenamiento, D = window.Documento;

  var precios = A.cargarPrecios();   // lista vigente (pestaña Precios)
  var actual = null;                 // presupuesto en edición
  var hayCambios = false;
  var temporizadorGuardado = null;

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
    $('numero-presupuesto').textContent = actual.numero || 'Sin guardar';

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

  function cambio() {
    hayCambios = true;
    render();
    autoguardar();
  }

  /* ════════ Ítems ════════ */

  function opcionesTipologias(seleccion, p) {
    var grupos = [], porGrupo = {};
    p.tipologias.forEach(function (t) {
      if (!porGrupo[t.grupo]) { porGrupo[t.grupo] = []; grupos.push(t.grupo); }
      porGrupo[t.grupo].push(t);
    });
    return grupos.map(function (g) {
      return '<optgroup label="' + F.escapar(g) + '">' + porGrupo[g].map(function (t) {
        return '<option value="' + t.id + '"' + (t.id === seleccion ? ' selected' : '') + '>' + F.escapar(t.nombre) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function opciones(lista, seleccion) {
    return lista.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === seleccion ? ' selected' : '') + '>' + F.escapar(x.nombre) + '</option>';
    }).join('');
  }

  function nodoItem(item, indice) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, item.tipologiaId);
    var lineasValidas = p.lineas.filter(function (l) {
      return !tip || !tip.lineas || tip.lineas.indexOf(l.id) > -1;
    });
    var sinVidrio = !!(tip && tip.sinVidrio);

    var nodo = document.createElement('div');
    nodo.className = 'item';
    nodo.dataset.id = item.id;
    nodo.innerHTML = '' +
      '<div class="item__cabecera">' +
        '<span class="item__indice">Abertura ' + (indice + 1) + '</span>' +
        '<div class="item__acciones">' +
          '<button class="btn btn--icono" data-accion="duplicar" title="Duplicar">⧉</button>' +
          '<button class="btn btn--icono btn--peligro" data-accion="borrar" title="Eliminar">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="item__campos">' +
        '<label class="campo campo-tipologia"><span>Tipo de abertura</span>' +
          '<select data-campo="tipologiaId">' + opcionesTipologias(item.tipologiaId, p) + '</select></label>' +
        '<label class="campo campo-linea"><span>Línea</span>' +
          '<select data-campo="lineaId">' + opciones(lineasValidas, item.lineaId) + '</select></label>' +
        '<label class="campo campo-medida"><span>Ancho (mm)</span>' +
          '<input type="number" data-campo="ancho" min="0" step="10" value="' + item.ancho + '"></label>' +
        '<label class="campo campo-medida"><span>Alto (mm)</span>' +
          '<input type="number" data-campo="alto" min="0" step="10" value="' + item.alto + '"></label>' +
        '<label class="campo campo-vidrio"><span>Vidrio</span>' +
          '<select data-campo="vidrioId"' + (sinVidrio ? ' disabled' : '') + '>' +
            opciones(p.vidrios, sinVidrio ? 'sin' : item.vidrioId) + '</select></label>' +
        '<label class="campo campo-color"><span>Color</span>' +
          '<select data-campo="colorId">' + opciones(p.colores, item.colorId) + '</select></label>' +
        '<label class="campo campo-cantidad"><span>Cantidad</span>' +
          '<input type="number" data-campo="cantidad" min="1" step="1" value="' + item.cantidad + '"></label>' +
        '<label class="campo campo-descuento"><span>Desc. (%)</span>' +
          '<input type="number" data-campo="descuentoPct" min="0" max="100" step="1" value="' + item.descuentoPct + '"></label>' +
        '<div class="adicionales">' + p.adicionales.map(function (ad) {
          var activo = (item.adicionales || []).indexOf(ad.id) > -1;
          return '<label class="chip' + (activo ? ' is-activo' : '') + '">' +
            '<input type="checkbox" data-adicional="' + ad.id + '"' + (activo ? ' checked' : '') + '> ' +
            F.escapar(ad.nombre) + '</label>';
        }).join('') + '</div>' +
        '<label class="campo campo-nota"><span>Nota (sale impresa)</span>' +
          '<input type="text" data-campo="nota" value="' + F.escapar(item.nota || '') + '" placeholder="Ej.: hoja derecha corrediza, vidrio a confirmar"></label>' +
      '</div>' +
      '<div class="item__pie"></div>';

    pintarPieItem(nodo, item);
    return nodo;
  }

  function pintarPieItem(nodo, item) {
    var r = C.calcularItem(item, preciosDelPresupuesto());
    var partes = [
      '<b>' + F.numero(r.m2Fact, 2) + ' m²</b>' + (r.aplicaMinimo ? ' <span class="marca-minimo">(mínimo facturable)</span>' : ''),
      'aluminio ' + F.moneda(r.importeAluminio)
    ];
    if (!r.sinVidrio && r.importeVidrio > 0) partes.push('vidrio ' + F.moneda(r.importeVidrio));
    if (r.importeAdicionales > 0) partes.push('adicionales ' + F.moneda(r.importeAdicionales));
    if (r.descuentoPct > 0) partes.push('desc. ' + F.numero(r.descuentoPct, 0) + '%');

    nodo.querySelector('.item__pie').innerHTML =
      '<div class="item__desglose">' + partes.join(' · ') + '</div>' +
      '<div class="item__total">' + F.moneda(r.total) +
        (r.cantidad > 1 ? '<small>' + r.cantidad + ' × ' + F.moneda(r.unitario) + '</small>' : '') +
      '</div>';
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

    fila('Subtotal', F.moneda(r.subtotal));
    if (r.descuento > 0) fila('Descuento ' + F.numero(r.descuentoPct, 0) + ' %', '− ' + F.moneda(r.descuento));
    if (r.colocacion > 0) fila('Colocación', F.moneda(r.colocacion));
    if (r.flete > 0) fila('Flete', F.moneda(r.flete));
    if (r.aplicaIva) fila('IVA ' + F.numero(r.ivaPct, 0) + ' %', F.moneda(r.iva));
    fila('Total', F.moneda(r.total), 'totales__fila--total');
    if (r.anticipoPct > 0 && r.total > 0) {
      fila('Anticipo ' + F.numero(r.anticipoPct, 0) + ' %', F.moneda(r.anticipo), 'totales__fila--tenue');
      fila('Saldo contra entrega', F.moneda(r.saldo), 'totales__fila--tenue');
    }
    if (r.m2Total > 0) fila('Promedio por m²', F.moneda(r.precioM2Promedio), 'totales__fila--tenue');

    if (p.revision !== precios.revision) {
      filas.push('<div class="totales__fila totales__fila--tenue"><span>Precios del ' + F.fechaCorta(p.actualizado) + '</span>' +
        '<span><button class="btn btn--fantasma btn--sm" id="btn-actualizar-precios-pres">Actualizar</button></span></div>');
    }

    $('totales').innerHTML = filas.join('');
    var btn = $('btn-actualizar-precios-pres');
    if (btn) btn.addEventListener('click', function () {
      if (!confirm('Recalcular este presupuesto con la lista de precios vigente?')) return;
      actual.precios = clonar(precios);
      render();
      autoguardar();
      avisar('Presupuesto recalculado con los precios de hoy');
    });

    $('resumen-items').textContent = actual.items.length
      ? actual.items.length + (actual.items.length === 1 ? ' abertura · ' : ' aberturas · ') + F.numero(r.m2Total, 2) + ' m² · ' + r.unidades + ' unidades'
      : 'Sin ítems';
  }

  /* ════════ Historial ════════ */

  function renderHistorial(filtro) {
    var lista = A.listar();
    $('badge-historial').textContent = lista.length;
    var q = (filtro || $('buscar-historial').value || '').toLowerCase().trim();
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
      return '<div class="historial-fila" data-id="' + p.id + '">' +
        '<span class="historial-fila__numero">' + F.escapar(p.numero || '—') + '<br><span class="apunte">' + F.fechaCorta(p.fecha) + '</span></span>' +
        '<div class="historial-fila__cliente"><strong>' + F.escapar(cli.nombre || 'Sin nombre') + '</strong>' +
          '<span>' + F.escapar([cli.localidad, cli.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto') + '</span></div>' +
        '<span><span class="estado estado--' + F.escapar(p.estado || 'borrador') + '">' + F.escapar(p.estado || 'borrador') + '</span></span>' +
        '<span class="historial-fila__total">' + F.moneda(p.total || 0) + '<br><span class="apunte">' + (p.items || []).length + ' ítems</span></span>' +
        '<span class="historial-fila__acciones">' +
          '<button class="btn btn--fantasma btn--sm" data-accion="abrir">Abrir</button>' +
          '<button class="btn btn--icono" data-accion="duplicar" title="Duplicar">⧉</button>' +
          '<button class="btn btn--icono btn--peligro" data-accion="borrar" title="Eliminar">✕</button>' +
        '</span>' +
      '</div>';
    }).join('');
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
          '<td class="alineado-der"><button class="btn btn--icono btn--peligro" data-accion="borrar" title="Eliminar">✕</button></td>' +
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
        if (!confirm('Eliminar "' + (lista[i].nombre || 'esta fila') + '" de la lista?')) return;
        lista.splice(i, 1);
        guardarPrecios(); pintar();
      }
    });

    pintar();
    return pintar;
  }

  function renderPrecios() {
    $('precios-actualizado').textContent = F.fechaCorta(precios.actualizado);
    $('gen-min-m2').value = precios.generales.minM2Global;
    $('gen-redondeo').value = precios.generales.redondeo;
    $('gen-plazo').value = precios.generales.plazoEntrega || '';

    tablaEditable('tabla-lineas', precios.lineas, [
      { campo: 'nombre', etiqueta: 'Línea' },
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
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
      var activa = t.dataset.vista === nombre;
      t.classList.toggle('is-activa', activa);
      t.setAttribute('aria-selected', activa ? 'true' : 'false');
    });
    if (nombre === 'historial') renderHistorial();
    if (nombre === 'presupuesto' && actual) render();   // refleja cambios hechos en la pestaña Precios
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    $('btn-guardar').addEventListener('click', function () { guardar(); });

    // Datos del cliente y ajustes
    ['cli-nombre','cli-telefono','cli-email','cli-direccion','cli-localidad','pre-fecha','pre-estado','pre-notas',
     'aj-descuento','aj-colocacion-valor','aj-flete','aj-iva-pct','aj-anticipo','aj-validez'].forEach(function (id) {
      $(id).addEventListener('input', function () { hayCambios = true; renderTotales(); autoguardar(); });
    });
    $('aj-colocacion-modo').addEventListener('change', function () { etiquetaColocacion(); cambio(); });
    $('aj-iva').addEventListener('change', cambio);

    $('btn-agregar-item').addEventListener('click', function () {
      var item = C.itemNuevo(preciosDelPresupuesto());
      var ultimo = actual.items[actual.items.length - 1];
      if (ultimo) {  // heredar línea y color del ítem anterior: casi siempre se repiten
        item.lineaId = ultimo.lineaId;
        item.colorId = ultimo.colorId;
        item.vidrioId = ultimo.vidrioId;
      }
      actual.items.push(item);
      render();
      hayCambios = true;
      autoguardar();
      var nodos = $('lista-items').children;
      var nuevo = nodos[nodos.length - 1];
      if (nuevo) nuevo.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        ev.target.closest('.chip').classList.toggle('is-activo', ev.target.checked);
      } else if (campo === 'tipologiaId') {
        item.tipologiaId = ev.target.value;
        var tip = C.buscar(preciosDelPresupuesto().tipologias, item.tipologiaId);
        if (tip && tip.lineas && tip.lineas.indexOf(item.lineaId) === -1) item.lineaId = tip.lineas[0];
        if (tip && tip.sinVidrio) item.vidrioId = 'sin';
        else if (item.vidrioId === 'sin') item.vidrioId = 'float4';
        nodo.replaceWith(nodoItem(item, Array.prototype.indexOf.call(lista.children, nodo)));
        renderTotales();
        hayCambios = true; autoguardar();
        return;
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
      if (boton.dataset.accion === 'duplicar') {
        var copia = clonar(item);
        copia.id = idUnico('it_');
        actual.items.splice(actual.items.indexOf(item) + 1, 0, copia);
      } else if (boton.dataset.accion === 'borrar') {
        actual.items.splice(actual.items.indexOf(item), 1);
      }
      render();
      hayCambios = true;
      autoguardar();
    });

    // Acciones finales
    $('btn-pdf').addEventListener('click', function () {
      if (!actual.items.length) return avisar('Agregá al menos una abertura antes de imprimir.', 'error');
      guardar(true);
      var p = preciosDelPresupuesto();
      D.imprimir(actual, C.calcularPresupuesto(actual, p), p);
    });

    $('btn-whatsapp').addEventListener('click', function () {
      if (!actual.items.length) return avisar('Agregá al menos una abertura antes de enviar.', 'error');
      guardar(true);
      var p = preciosDelPresupuesto();
      if (!actual.cliente.telefono) avisar('Sin teléfono cargado: WhatsApp te va a pedir el contacto.');
      window.open(D.urlWhatsapp(actual, C.calcularPresupuesto(actual, p), p), '_blank');
    });

    $('btn-copiar').addEventListener('click', function () {
      var p = preciosDelPresupuesto();
      var texto = D.texto(actual, C.calcularPresupuesto(actual, p), p);
      copiar(texto)
        .then(function () { avisar('Resumen copiado'); })
        .catch(function () { avisar('No se pudo copiar automáticamente.', 'error'); });
    });

    // Historial
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
        if (!confirm('Eliminar el presupuesto ' + (p.numero || '') + '? No se puede deshacer.')) return;
        A.borrar(id);
        if (actual && actual.id === id) abrir(presupuestoNuevo());
        renderHistorial();
        avisar('Presupuesto eliminado');
      }
    });

    $('btn-exportar').addEventListener('click', function () {
      var datos = JSON.stringify(A.exportarTodo(), null, 2);
      var enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(new Blob([datos], { type: 'application/json' }));
      enlace.download = 'alumfer-presupuestos-' + F.fechaISO() + '.json';
      enlace.click();
      URL.revokeObjectURL(enlace.href);
      avisar('Copia de seguridad descargada');
    });

    $('btn-importar').addEventListener('click', function () { $('archivo-importar').click(); });

    $('archivo-importar').addEventListener('change', function (ev) {
      var archivo = ev.target.files[0];
      if (!archivo) return;
      if (!confirm('Restaurar la copia reemplaza los presupuestos y los precios guardados. ¿Seguir?')) { ev.target.value = ''; return; }
      var lector = new FileReader();
      lector.onload = function () {
        try {
          A.importarTodo(JSON.parse(lector.result));
          precios = A.cargarPrecios();
          renderPrecios();
          renderHistorial();
          abrir(presupuestoNuevo());
          avisar('Copia restaurada');
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
      if (!confirm('Aplicar ' + (pct > 0 ? '+' : '') + pct + ' % a los precios seleccionados?')) return;
      precios = C.ajustarPrecios(precios, pct, ambitos);
      guardarPrecios();
      renderPrecios();
      avisar('Precios actualizados ' + (pct > 0 ? '+' : '') + pct + ' %');
    });

    $('btn-restaurar-precios').addEventListener('click', function () {
      if (!confirm('Volver a los precios de fábrica? Se pierden los valores que cargaste.')) return;
      precios = A.restaurarPrecios();
      renderPrecios();
      avisar('Precios de fábrica restaurados');
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
      if (ev.key === 'p') { ev.preventDefault(); $('btn-pdf').click(); }
    });

    window.addEventListener('beforeunload', function (ev) {
      if (!hayCambios || !actual.items.length) return;
      ev.preventDefault();
      ev.returnValue = '';
    });
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

  /* ════════ Arranque ════════ */

  function iniciar() {
    if (!A.disponible) $('aviso-almacenamiento').hidden = false;
    renderPrecios();
    renderHistorial();
    var ultimos = A.listar();
    abrir(ultimos.length && ultimos[0].estado === 'borrador' ? ultimos[0] : presupuestoNuevo());
    conectarEventos();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
