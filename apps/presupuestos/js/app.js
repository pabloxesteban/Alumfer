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
  var itemAbierto = null;            // la única abertura desplegada; las demás se ven resumidas
  var itemQueEntra = null;
  var codigosActuales = [];          // V1, PF1, P1… de cada abertura, en el orden de carga           // solo la recién agregada se anima: si no, cada toque haría parpadear la ficha

  /*
   * Tipos que son el mismo modelo con distinta cantidad de hojas (o forma de
   * abrir). En el selector aparecen una sola vez y en la ficha se pregunta
   * "¿Cuántas hojas?" con botones. Los precios siguen siendo por tipo exacto.
   * La primera variante es la más común y la que se elige por defecto.
   */
  var FAMILIAS = [
    { nombre: 'Ventana corrediza', pregunta: '¿Cuántas hojas?', resumen: '2, 3 o 4 hojas',
      variantes: [['vent-corr-2', '2 hojas'], ['vent-corr-3', '3 hojas'], ['vent-corr-4', '4 hojas']] },
    { nombre: 'Ventana de abrir', pregunta: '¿Cuántas hojas?', resumen: '1 o 2 hojas',
      variantes: [['vent-abrir-1', '1 hoja'], ['vent-abrir-2', '2 hojas']] },
    { nombre: 'Puerta de abrir', pregunta: '¿Cuántas hojas?', resumen: '1 o 2 hojas',
      variantes: [['puerta-abrir', '1 hoja'], ['puerta-doble', '2 hojas']] },
    { nombre: 'Puerta balcón corrediza', pregunta: '¿Cuántas hojas?', resumen: '2 o 3 hojas',
      variantes: [['pbalcon-corr-2', '2 hojas'], ['pbalcon-corr-3', '3 hojas']] },
    { nombre: 'Mosquitero', pregunta: '¿Cómo es?', resumen: 'corredizo o fijo',
      variantes: [['mosq-corr', 'Corredizo'], ['mosq-fijo', 'Fijo']] },
    { nombre: 'Portón', pregunta: '¿Cómo abre?', resumen: 'corredizo o levadizo',
      variantes: [['porton-corr', 'Corredizo'], ['porton-levad', 'Levadizo']] },
    // Etiqueta null: se toma del nombre en la lista de precios, así al renombrar
    // los tipos de reja en Precios el botón dice el nombre nuevo.
    { nombre: 'Reja de hierro', pregunta: '¿Redondo o cuadrado?', resumen: 'redondo o cuadrado',
      variantes: [['reja', null], ['reja-2', null]] },
    { nombre: 'Cortina de enrollar PVC', pregunta: '¿Lleva cajón?', resumen: 'con o sin cajón',
      variantes: [['cortina-pvc-cajon', 'Con cajón'], ['cortina-pvc-sola', 'Sin cajón']] }
  ];

  /**
   * Texto del botón de una variante sin etiqueta fija: lo que la distingue de
   * las otras ("Reja de aluminio tipo 1" y "... tipo 2" → "Tipo 1", "Tipo 2").
   */
  function etiquetasDe(vars) {
    var p = preciosDelPresupuesto();
    var nombres = vars.map(function (v) {
      var t = C.buscar(p.tipologias, v[0]) || C.buscar(precios.tipologias, v[0]);
      return v[1] != null ? v[1] : (t ? t.nombre : v[0]);
    });
    var sinFijas = vars.every(function (v) { return v[1] == null; });
    if (!sinFijas) return nombres;
    return distintivos(nombres);
  }

  /** De nombres con el mismo comienzo, lo que los distingue, con mayúscula. */
  function distintivos(nombres) {
    if (nombres.length < 2) return nombres;
    var comun = nombres[0];
    nombres.forEach(function (n) { while (n.indexOf(comun) !== 0) comun = comun.slice(0, -1); });
    comun = comun.slice(0, comun.lastIndexOf(' ') + 1);
    // "tipo 1" / "tipo 2": si solo quedara el número, se conserva la palabra de antes.
    var soloNumeros = nombres.every(function (n) { return /^\d+$/.test(n.slice(comun.length).trim()); });
    if (soloNumeros) comun = comun.slice(0, comun.trimEnd().lastIndexOf(' ') + 1);
    return nombres.map(function (n) {
      var r = n.slice(comun.length).trim() || n;
      return r.charAt(0).toUpperCase() + r.slice(1);
    });
  }

  /*
   * Vidrios agrupados como las hojas: primero el tipo (con dibujo) y, si tiene
   * variantes, el espesor. `defecto` es la variante que se elige al tocar el tipo.
   * Un vidrio agregado a mano en Precios aparece solo, como un tipo más.
   */
  var TEXTURAS = {
    'poli-amazonia': 'amazonia', 'poli-agua-viva': 'agua-viva', 'poli-bebe': 'bebe', 'poli-canalado': 'canalado-plus',
    'poli-niagara': 'niagara', 'poli-diamante': 'diamante', 'poli-espuma': 'espuma', 'poli-foresta': 'foresta',
    'poli-gaviota': 'gaviota', 'poli-iberia': 'iberia', 'poli-laberinto': 'laberinto', 'poli-monocril': 'monocril',
    'poli-puntillado': 'puntillado', 'poli-pantanal': 'pantanal', 'poli-pantanal-cristal': 'pantanal-cristal'
  };
  var VIDRIOS_FAMILIAS = [
    { clave: 'simple', nombre: 'Simple', ayuda: 'transparente, el común', pregunta: '¿Qué espesor?', defecto: 'float4',
      variantes: [['float3', '3 mm'], ['float4', '4 mm'], ['float5', '5 mm'], ['float6', '6 mm']] },
    { clave: 'esmerilado', nombre: 'Esmerilado', ayuda: 'no se ve a través', variantes: [['esmerilado', '4 mm']] },
    { clave: 'espejado', nombre: 'Espejado', ayuda: 'da sombra', variantes: [['espejado', '5 mm']] },
    { clave: 'seguridad', nombre: 'Laminado', ayuda: 'de seguridad: si se rompe no se cae', pregunta: '¿Qué espesor?',
      variantes: [['lam33', '3+3'], ['lam44', '4+4']] },
    { clave: 'doble', nombre: 'Doble vidrio (DVH)', ayuda: 'aísla frío y ruido', pregunta: '¿Cuál?',
      variantes: [['dvh494', '4/9/4'], ['dvh4126', '4/12/6 (ruido)'], ['dvh-lam', 'Con laminado']] },
    { clave: 'poliestireno', nombre: 'Poliestireno', ayuda: 'para mamparas y divisiones', pregunta: '¿Qué diseño?',
      variantes: Object.keys(TEXTURAS).map(function (id) { return [id, null]; }) },   // nombre: el de la lista, sin "Poliestireno"
    { clave: 'policarbonato', nombre: 'Policarbonato alveolar', ayuda: 'para techos, aísla', pregunta: '¿Qué espesor?', defecto: 'policarb-alv',
      variantes: [['policarb-alv4', '4 mm'], ['policarb-alv', '6 mm'], ['policarb-alv8', '8 mm'], ['policarb-alv10', '10 mm']] },
    { clave: 'compacto', nombre: 'Policarbonato compacto', ayuda: 'macizo, resiste golpes', variantes: [['policarb-comp', '4 mm']] }
  ];
  var TONOS_PLACA = ['Transparente', 'Opal', 'Bronce'];   // color del policarbonato: no cambia el precio

  /** Tipos de vidrio que existen en la lista del presupuesto, con sus variantes. */
  function tiposDeVidrio() {
    var p = preciosDelPresupuesto();
    var enFamilia = {};
    var tipos = [];
    VIDRIOS_FAMILIAS.forEach(function (f) {
      var vars = f.variantes.filter(function (v) { enFamilia[v[0]] = true; return C.buscar(p.vidrios, v[0]); })
        .map(function (v) {
          return [v[0], v[1] != null ? v[1] : C.buscar(p.vidrios, v[0]).nombre.replace(/^poliestireno\s*/i, '')];
        });
      if (vars.length) tipos.push(Object.assign({}, f, { variantes: vars }));
    });
    p.vidrios.forEach(function (v) {
      if (v.id === 'sin' || enFamilia[v.id]) return;
      tipos.push({ clave: 'otro', nombre: v.nombre, ayuda: v.ayuda || '', variantes: [[v.id, '']] });
    });
    return tipos;
  }

  /* Formas que no son rectángulo: solo en las aberturas que pueden tenerlas. */
  var FORMAS_UI = [['rect', 'Recta'], ['inclinada', 'Inclinada'], ['triangulo', 'Triangular'],
                   ['arco', 'Con arco'], ['redonda', 'Redonda']];
  var TIPOS_CON_FORMA = ['pano-fijo', 'banderola', 'vent-abrir-1', 'cerramiento', 'mosq-fijo', 'reja', 'reja-2'];

  /* Medida con la que arranca cada tipo, en cm (las mismas del diseñador del sitio). */
  var MEDIDA_INICIAL = {
    'vent-corr-2': [150, 110], 'vent-corr-3': [200, 110], 'vent-corr-4': [260, 120], 'vent-abrir-1': [60, 90],
    'vent-abrir-2': [120, 110], 'banderola': [60, 40], 'oscilo': [70, 110], 'pano-fijo': [100, 100],
    'puerta-abrir': [90, 205], 'puerta-doble': [150, 205], 'puerta-tablero': [90, 205],
    'pbalcon-corr-2': [180, 205], 'pbalcon-corr-3': [240, 205], 'pbalcon-abrir': [140, 205],
    'cerramiento': [400, 220], 'baranda': [300, 100], 'techo-policarb': [300, 300], 'porton-corr': [300, 200],
    'porton-levad': [250, 210], 'bajo-mesada': [120, 85], 'mosq-corr': [150, 110], 'mosq-fijo': [100, 100],
    'postigon': [150, 110], 'reja': [150, 110], 'reja-2': [150, 110]
  };

  /* ¿Dónde va? Lugares comunes; se suman los que ya se usaron en el presupuesto. */
  var LUGARES = ['Cocina', 'Baño', 'Dormitorio', 'Living', 'Quincho', 'Frente'];

  function familiaDe(tipoId) {
    for (var i = 0; i < FAMILIAS.length; i++) {
      for (var j = 0; j < FAMILIAS[i].variantes.length; j++) {
        if (FAMILIAS[i].variantes[j][0] === tipoId) return FAMILIAS[i];
      }
    }
    return null;
  }

  /** Variantes que existen en la lista de precios de hoy o en la del presupuesto. */
  function variantesDe(familia) {
    var p = preciosDelPresupuesto();
    return familia.variantes.filter(function (v) {
      return C.buscar(precios.tipologias, v[0]) || C.buscar(p.tipologias, v[0]);
    });
  }

  function $(id) { return document.getElementById(id); }
  function clonar(x) { return JSON.parse(JSON.stringify(x)); }
  function idUnico(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /** Inserta al final de su grupo: si fuera al final de todo, el grupo saldría repetido. */
  function insertarEnGrupo(lista, fila, campoGrupo) {
    var grupo = fila[campoGrupo];
    var ultima = -1;
    lista.forEach(function (x, i) { if (x[campoGrupo] === grupo) ultima = i; });
    lista.splice(ultima + 1, 0, fila);
    return fila;
  }

  /** Precios con los que se calcula el presupuesto abierto. */
  function preciosDelPresupuesto() { return (actual && actual.precios) || precios; }

  /**
   * Para la hoja y el PDF: precios y condiciones del presupuesto, pero
   * los datos y el logo de la empresa de hoy (si cambió el teléfono, el
   * presupuesto viejo que se reenvía tiene que salir con el nuevo).
   */
  function preciosParaDocumento() {
    var p = preciosDelPresupuesto();
    return Object.assign({}, p, {
      empresa: Object.assign({}, p.empresa, precios.empresa, { logo: A.cargarLogo() || '' })
    });
  }

  function avisar(texto, tipo) {
    var nodo = document.createElement('div');
    nodo.className = 'aviso' + (tipo === 'error' ? ' aviso--error' : '');
    nodo.textContent = texto;
    $('avisos').appendChild(nodo);
    setTimeout(function () { nodo.remove(); }, tipo === 'error' ? 5000 : 2600);
    return nodo;
  }

  /** Muestra un "Guardado ✓" que se apaga solo: la app guarda sin botón. */
  var relojesGuardado = {};
  function marcarGuardado(id) {
    var nodo = $(id);
    if (!nodo) return;
    nodo.hidden = false;
    clearTimeout(relojesGuardado[id]);
    relojesGuardado[id] = setTimeout(function () { nodo.hidden = true; }, 2500);
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
    $('confirmacion-guardado').hidden = true;
    itemAbierto = null;                      // al abrir se ven todas resumidas
    $('sugerencias-clientes').hidden = true;
    if (!actual.precios) actual.precios = clonar(precios);
    A.actualizarNombres(actual.precios);   // solo nombres más claros; los precios no se tocan
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
    $('numero-presupuesto').textContent = actual.numero || '';
    $('numero-presupuesto').hidden = !actual.numero;   // sin número todavía: no mostrar nada que parezca un botón

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
    $('numero-presupuesto').hidden = false;
    marcarGuardado('presupuesto-guardado');
    renderHistorial();
    if (!silencioso) avisar('Presupuesto ' + actual.numero + ' guardado');
  }

  /**
   * Botón "Guardar presupuesto". La app ya guarda sola cada cambio, pero quien
   * no está acostumbrado necesita un botón y ver que quedó guardado y dónde
   * encontrarlo. Hace lo mismo que el guardado automático, al instante.
   */
  function guardarConAviso() {
    leerFormulario();
    if (!actual.items.length && !actual.cliente.nombre) {
      return avisar('Todavía no hay nada para guardar: poné el nombre del cliente o agregá una abertura.', 'error');
    }
    clearTimeout(temporizadorGuardado);
    guardar(true);
    var cli = actual.cliente.nombre;
    $('confirmacion-guardado').innerHTML = '<strong>✓ Guardado como ' + F.escapar(actual.numero) + '</strong>' +
      '<span>Para volver a verlo: pestaña <b>Guardados</b> y buscá ' +
      (cli ? '«' + F.escapar(cli.split(' ')[0]) + '» o ' : '') + 'el número ' + F.escapar(actual.numero.split('-').pop()) + '.</span>';
    $('confirmacion-guardado').hidden = false;
    avisar('Presupuesto ' + actual.numero + ' guardado');
    revisarCopia();
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
    // El presupuesto guarda los precios con los que se calculó, pero el
    // catálogo de aberturas que se ofrece es el de hoy: si se agregó una
    // tipología nueva, tiene que poder elegirse igual.
    var p = precios;
    var item = itemId ? itemPorId(itemId) : null;

    $('modal-titulo').textContent = item ? '¿Por cuál la cambiamos?' : '¿Qué abertura querés agregar?';

    var grupos = [], porGrupo = {};
    p.tipologias.forEach(function (t) {
      if (!porGrupo[t.grupo]) { porGrupo[t.grupo] = []; grupos.push(t.grupo); }
      porGrupo[t.grupo].push(t);
    });

    var familiaActual = item ? familiaDe(item.tipologiaId) : null;
    var yaPuestas = [];

    $('grilla-tipos').innerHTML = grupos.map(function (g) {
      return '<h3 class="tipos-grupo">' + F.escapar(g) + '</h3><div class="tipos-grilla">' +
        porGrupo[g].map(function (t) {
          var fam = familiaDe(t.id);
          if (fam) {
            if (yaPuestas.indexOf(fam) > -1) return '';      // el modelo va una sola vez
            yaPuestas.push(fam);
            var vars = variantesDe(fam);
            // Si se está cambiando una abertura del mismo modelo, se conserva su variante.
            var destino = fam === familiaActual ? item.tipologiaId : vars[0][0];
            return '<button class="tipo-tile' + (fam === familiaActual ? ' is-activo' : '') + '" data-tipo="' + destino + '">' +
              I.abertura(destino, t.grupo) + '<span>' + F.escapar(fam.nombre) + '</span>' +
              (vars.length > 1 ? '<small>' + F.escapar(fam.resumen) + '</small>' : '') + '</button>';
          }
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

  /**
   * Tipología con precio en el presupuesto abierto. Si es una agregada después
   * de empezarlo, no tiene precio viejo que conservar: entra con el de hoy.
   */
  function tipologiaParaPresupuesto(tipoId) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, tipoId);
    if (tip) return tip;
    var deHoy = C.buscar(precios.tipologias, tipoId);
    return deHoy ? insertarEnGrupo(p.tipologias, clonar(deHoy), 'grupo') : null;
  }

  /** Cambia el tipo de una abertura ya cargada, dejando línea y vidrio válidos. */
  function cambiarTipologia(item, tipoId) {
    var tip = tipologiaParaPresupuesto(tipoId);
    if (!tip) return false;
    item.tipologiaId = tipoId;
    if (TIPOS_CON_FORMA.indexOf(tipoId) === -1) item.forma = 'rect';   // una corrediza no puede ser redonda
    if (tip.lineas && tip.lineas.indexOf(item.lineaId) === -1) item.lineaId = tip.lineas[0];
    if (tip.sinVidrio) item.vidrioId = 'sin';
    else if (item.vidrioId === 'sin') item.vidrioId = 'float4';
    return true;
  }

  function elegirTipo(tipoId) {
    var p = preciosDelPresupuesto();
    var tip = tipologiaParaPresupuesto(tipoId);
    if (!tip) return cerrarSelectorTipo();

    if (itemAlQueCambiarTipo) {
      var item = itemPorId(itemAlQueCambiarTipo);
      if (item) cambiarTipologia(item, tipoId);
      cerrarSelectorTipo();
      render();
    } else {
      var nuevo = C.itemNuevo(p);
      nuevo.tipologiaId = tipoId;
      // Medida: la de otra abertura igual de esta obra (suelen repetirse) o la típica del tipo.
      var igual = actual.items.slice().reverse().filter(function (it) { return it.tipologiaId === tipoId; })[0];
      var inicial = MEDIDA_INICIAL[tipoId];
      if (igual) { nuevo.ancho = igual.ancho; nuevo.alto = igual.alto; if (igual.forma) { nuevo.forma = igual.forma; nuevo.alto2 = igual.alto2; } }
      else if (inicial) { nuevo.ancho = inicial[0] * 10; nuevo.alto = inicial[1] * 10; }
      if (tip && tip.lineas) nuevo.lineaId = tip.lineas[0];
      if (tip && tip.sinVidrio) nuevo.vidrioId = 'sin';
      var ultimo = actual.items[actual.items.length - 1];
      if (ultimo) {   // la línea y el color casi siempre se repiten en la misma obra
        if (!tip || !tip.lineas || tip.lineas.indexOf(ultimo.lineaId) > -1) nuevo.lineaId = ultimo.lineaId;
        nuevo.colorId = ultimo.colorId;
        if (!tip || !tip.sinVidrio) nuevo.vidrioId = ultimo.vidrioId === 'sin' ? 'float4' : ultimo.vidrioId;
      }
      actual.items.push(nuevo);
      itemAbierto = itemQueEntra = nuevo.id;   // la nueva queda abierta; las demás se resumen
      cerrarSelectorTipo();
      render();
      mostrarItem(nuevo.id);
    }

    hayCambios = true;
    autoguardar();
  }

  /* ════════ Ítems ════════ */

  var NOMBRE_FAMILIA_EXTRA = { reja: 'Reja' };

  function chipExtra(ad, item) {
    if (ad.miembros) {   // una casilla para toda la familia; el tipo se pregunta aparte
      var marcada = ad.miembros.some(function (m) { return (item.adicionales || []).indexOf(m.id) > -1; });
      return '<label class="extra' + (marcada ? ' is-activo' : '') + '">' +
        '<input type="checkbox" data-adicional-familia="' + ad.familia + '"' + (marcada ? ' checked' : '') + '>' +
        '<span class="extra__tilde" aria-hidden="true"></span>' +
        F.escapar(NOMBRE_FAMILIA_EXTRA[ad.familia] || ad.miembros[0].nombre) + '</label>';
    }
    var activo = (item.adicionales || []).indexOf(ad.id) > -1;
    return '<label class="extra' + (activo ? ' is-activo' : '') + '">' +
      '<input type="checkbox" data-adicional="' + ad.id + '"' + (activo ? ' checked' : '') + '>' +
      '<span class="extra__tilde" aria-hidden="true"></span>' +
      F.escapar(ad.nombre) + '</label>';
  }

  /* Muestra de color para reconocerlo sin leer (los colores agregados a mano no tienen). */
  var MUESTRAS = {      // mismos tonos que el diseñador del sitio
    blanco: '#ffffff', negro: '#1E1F21', bronce: '#4A3B30', gris: '#8A8E94', marron: '#5C3A21',
    'simil-madera': 'repeating-linear-gradient(100deg,#9a6230 0 6px,#7c4a20 6px 9px)',
    microtexturado: 'radial-gradient(#bdbdb9 1px, #dcdcd8 1px) 0 0/4px 4px',
    azul: '#1B4F8A', verde: '#2E7D32', rojo: '#B71C1C', amarillo: '#F9A825',
    natural: 'linear-gradient(135deg,#B8B8B8,#DADADA,#A8A8A8)',
    'anod-oro': 'linear-gradient(135deg,#C8A84B,#E8C86A,#B89438)',
    'anod-negro': 'linear-gradient(135deg,#1A1A1A,#2E2E2E,#111111)',
    'anod-champagne': 'linear-gradient(135deg,#D4C5A0,#E8DCC0,#C4B590)',
    'anod-peltre': 'linear-gradient(135deg,#8A8A8A,#A8A8A8,#787878)'
  };
  function muestra(campo, id) {
    if (campo !== 'colorId' || !MUESTRAS[id]) return '';
    return '<span class="muestra" style="background:' + MUESTRAS[id] + '" aria-hidden="true"></span>';
  }

  var ROTULOS = { lineaId: 'Línea de aluminio', vidrioId: 'Vidrio', colorId: 'Color' };

  /** Botón grande que muestra lo elegido y abre la lista para cambiarlo. */
  function elegible(campo, lista, item) {
    var x = C.buscar(lista, item[campo]);
    return '<button type="button" class="elegible" data-elegir="' + campo + '">' +
      '<span class="elegible__rotulo">' + ROTULOS[campo] + '</span>' +
      '<span class="elegible__valor">' + muestra(campo, item[campo]) +
        '<span><strong>' + F.escapar(x ? x.nombre : 'Elegir') + '</strong>' +
        (x && x.ayuda ? '<span>' + F.escapar(x.ayuda) + '</span>' : '') + '</span>' +
      '</span>' +
      '<span class="elegible__cambiar">Cambiar</span>' +
    '</button>';
  }

  /** Opciones válidas de cada campo para este ítem. */
  function opcionesDe(campo, item) {
    var p = preciosDelPresupuesto();
    if (campo === 'lineaId') {
      var tip = C.buscar(p.tipologias, item.tipologiaId);
      return p.lineas.filter(function (l) { return !tip || !tip.lineas || tip.lineas.indexOf(l.id) > -1; });
    }
    if (campo === 'vidrioId') return p.vidrios.filter(function (v) { return v.id !== 'sin'; });
    return p.colores;
  }

  function campoMedida(campo, rotulo, icono, valorMm) {
    return '<label class="campo"><span>' + (icono ? I.ui(icono) + ' ' : '') + rotulo + '</span>' +
      '<span class="con-unidad"><input type="number" data-campo="' + campo + '" min="0" step="1" inputmode="numeric" value="' +
      (valorMm / 10) + '"><span>cm</span></span></label>';
  }

  /** Las medidas que se piden dependen de la forma. */
  function bloqueMedidas(item) {
    var forma = C.formaDe(item);
    if (forma === 'redonda') {
      return '<div class="item__medidas item__medidas--una">' + campoMedida('anchoCm', 'Diámetro', 'ancho', item.ancho) + '</div>';
    }
    if (forma === 'inclinada') {
      return '<div class="item__medidas item__medidas--tres">' +
        campoMedida('anchoCm', 'Ancho', 'ancho', item.ancho) +
        campoMedida('altoCm', 'Alto del lado alto', 'alto', item.alto) +
        campoMedida('alto2Cm', 'Alto del lado bajo', 'alto', item.alto2 || 0) +
      '</div>';
    }
    var rotAncho = forma === 'triangulo' ? 'Ancho de abajo' : 'Ancho';
    var rotAlto = forma === 'triangulo' ? 'Alto en la punta' : forma === 'arco' ? 'Alto total' : 'Alto';
    return '<div class="item__medidas">' +
      campoMedida('anchoCm', rotAncho, 'ancho', item.ancho) +
      '<span class="item__por" aria-hidden="true">×</span>' +
      campoMedida('altoCm', rotAlto, 'alto', item.alto) +
    '</div>';
  }

  function bloqueForma(item) {
    if (TIPOS_CON_FORMA.indexOf(item.tipologiaId) === -1) return '';
    var actualForma = C.formaDe(item);
    return '<div class="campo"><span id="forma-' + item.id + '">¿Qué forma tiene?</span>' +
      '<div class="variantes variantes--forma" role="radiogroup" aria-labelledby="forma-' + item.id + '">' +
      FORMAS_UI.map(function (f) {
        var activa = f[0] === actualForma;
        return '<button type="button" class="variante' + (activa ? ' is-activa' : '') + '" role="radio" aria-checked="' + activa +
          '" data-forma="' + f[0] + '">' + I.forma(f[0]) + '<span>' + f[1] + '</span></button>';
      }).join('') +
      '</div></div>';
  }

  /** Vidrio en dos preguntas: el tipo (con dibujo) y, si hace falta, el espesor. */
  function bloqueVidrio(item) {
    var tipos = tiposDeVidrio();
    var elegido = null;
    tipos.forEach(function (t) {
      t.variantes.forEach(function (v) { if (v[0] === item.vidrioId) elegido = t; });
    });
    var html = '<div class="campo"><span id="vid-' + item.id + '">¿Qué vidrio lleva?</span>' +
      '<div class="variantes variantes--vidrio" role="radiogroup" aria-labelledby="vid-' + item.id + '">' +
      tipos.map(function (t) {
        var activa = t === elegido;
        var hayDefecto = t.defecto && t.variantes.some(function (v) { return v[0] === t.defecto; });
        var destino = activa ? item.vidrioId : hayDefecto ? t.defecto : t.variantes[0][0];
        return '<button type="button" class="variante variante--vidrio' + (activa ? ' is-activa' : '') + '" role="radio" aria-checked="' + activa +
          '" data-vidrio="' + F.escapar(destino) + '">' + I.vidrio(t.clave) +
          '<span>' + F.escapar(t.nombre) + '</span>' + (t.ayuda ? '<small>' + F.escapar(t.ayuda) + '</small>' : '') + '</button>';
      }).join('') +
      '</div></div>';
    if (elegido && elegido.variantes.length > 1) {
      html += '<div class="campo"><span id="esp-' + item.id + '">' + F.escapar(elegido.pregunta || '¿Cuál?') + '</span>' +
        '<div class="espesores" role="radiogroup" aria-labelledby="esp-' + item.id + '">' +
        elegido.variantes.map(function (v) {
          var activa = v[0] === item.vidrioId;
          var textura = TEXTURAS[v[0]];
          return '<button type="button" class="espesor' + (textura ? ' espesor--textura' : '') + (activa ? ' is-activa' : '') +
            '" role="radio" aria-checked="' + activa + '" data-vidrio="' + F.escapar(v[0]) + '">' +
            (textura ? '<img src="texturas/' + textura + '.webp" alt="" width="72" height="60" loading="lazy">' : '') +
            '<span>' + F.escapar(v[1]) + '</span></button>';
        }).join('') +
        '</div></div>';
    }
    var distintas = aplicables('vidrioId', item).filter(function (it) {
      return it.vidrioId !== item.vidrioId || (it.tono || '') !== (item.tono || '');
    }).length;
    var botonTodas = distintas
      ? '<button type="button" class="btn btn--fantasma btn--sm btn--bloque" data-accion="vidrio-a-todas">' +
          'Poner este vidrio en las otras ' + (distintas === 1 ? 'abertura' : distintas + ' aberturas') + '</button>'
      : '';
    if (/^policarb/.test(item.vidrioId)) {
      var tono = item.tono || TONOS_PLACA[0];
      html += '<div class="campo"><span id="tono-' + item.id + '">¿De qué color es la placa?</span>' +
        '<div class="espesores" role="radiogroup" aria-labelledby="tono-' + item.id + '">' +
        TONOS_PLACA.map(function (t) {
          var activa = t === tono;
          return '<button type="button" class="espesor' + (activa ? ' is-activa' : '') + '" role="radio" aria-checked="' + activa +
            '" data-tono="' + t + '">' + t + '</button>';
        }).join('') + '</div></div>';
    }
    return html + botonTodas;
  }

  /** ¿Dónde va? Opcional: sirve para que el cliente reconozca cada abertura y agrupa el PDF. */
  function bloqueLugar(item) {
    var lugares = LUGARES.slice();
    actual.items.forEach(function (it) {
      var l = String(it.lugar || '').trim();
      if (l && lugares.indexOf(l) === -1) lugares.push(l);
    });
    var propio = item.lugar && lugares.indexOf(item.lugar) === -1 ? item.lugar : '';
    return '<div class="campo"><span>¿Dónde va? <small class="opcional">(si querés)</small></span>' +
      '<div class="lugares">' +
      lugares.map(function (l) {
        var activa = l === item.lugar;
        return '<button type="button" class="lugar' + (activa ? ' is-activa' : '') + '" aria-pressed="' + activa +
          '" data-lugar="' + F.escapar(l) + '">' + F.escapar(l) + '</button>';
      }).join('') +
      '</div>' +
      '<input type="text" class="lugar-otro" data-campo="lugar" value="' + F.escapar(propio) + '" placeholder="Otro lugar: escribilo acá" aria-label="Otro lugar">' +
    '</div>';
  }

  function nodoItem(item, indice) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, item.tipologiaId);
    var sinVidrio = !!(tip && tip.sinVidrio);

    var frecuentes = [], resto = [], hayElegidoEnElResto = false, familiasVistas = {}, preguntasExtra = '';
    p.adicionales.forEach(function (ad) {
      var unidad = ad, ids = [ad.id];
      if (ad.familia) {
        if (familiasVistas[ad.familia]) return;
        familiasVistas[ad.familia] = true;
        var miembros = p.adicionales.filter(function (x) { return x.familia === ad.familia; });
        unidad = { familia: ad.familia, id: ad.id, miembros: miembros };
        ids = miembros.map(function (m) { return m.id; });
        var elegido = miembros.filter(function (m) { return (item.adicionales || []).indexOf(m.id) > -1; })[0];
        if (elegido && miembros.length > 1) {
          var et = distintivos(miembros.map(function (m) { return m.nombre; }));
          preguntasExtra += '<div class="campo"><span>¿Qué tipo de ' + F.escapar((NOMBRE_FAMILIA_EXTRA[ad.familia] || '').toLowerCase()) + '?</span>' +
            '<div class="espesores">' + miembros.map(function (m, k) {
              var activa = m === elegido;
              return '<button type="button" class="espesor' + (activa ? ' is-activa' : '') + '" aria-pressed="' + activa +
                '" data-adicional-tipo="' + F.escapar(m.id) + '" data-familia="' + F.escapar(ad.familia) + '">' + F.escapar(et[k]) + '</button>';
            }).join('') + '</div></div>';
        }
      }
      if (EXTRAS_FRECUENTES.indexOf(ad.id) > -1) return frecuentes.push(unidad);
      resto.push(unidad);
      if (ids.some(function (id) { return (item.adicionales || []).indexOf(id) > -1; })) hayElegidoEnElResto = true;
    });

    var fam = familiaDe(item.tipologiaId);
    var vars = fam ? variantesDe(fam) : [];

    var nodo = document.createElement('div');
    nodo.className = 'item item--abierto' + (item.id === itemQueEntra ? ' item--entra' : '');
    nodo.dataset.id = item.id;
    nodo.innerHTML = '' +
      '<div class="item__tipo">' +
        '<span class="item__dibujo">' + I.abertura(item.tipologiaId, tip && tip.grupo) + '</span>' +
        '<span class="item__nombre">' +
          '<span><b class="codigo">' + F.escapar(codigosActuales[indice] || '') + '</b>' +
            (item.lugar ? ' · ' + F.escapar(item.lugar) : '') + '</span>' +
          '<strong>' + F.escapar(fam ? fam.nombre : (tip ? tip.nombre : 'Abertura')) + '</strong>' +
        '</span>' +
        '<button class="btn btn--fantasma btn--sm" data-accion="cambiar-tipo" data-icono="cambiar">Cambiar tipo</button>' +
      '</div>' +

      (vars.length > 1
        ? '<div class="campo"><span id="var-' + item.id + '">' + F.escapar(fam.pregunta) + '</span>' +
            '<div class="variantes" role="radiogroup" aria-labelledby="var-' + item.id + '">' +
            (function () { var et = etiquetasDe(vars); vars.forEach(function (v, k) { v.etiqueta = et[k]; }); return ''; })() +
            vars.map(function (v) {
              var activa = v[0] === item.tipologiaId;
              return '<button type="button" class="variante' + (activa ? ' is-activa' : '') + '" role="radio" ' +
                'aria-checked="' + activa + '" data-variante="' + v[0] + '">' +
                I.abertura(v[0], tip && tip.grupo) + '<span>' + F.escapar(v.etiqueta) + '</span></button>';
            }).join('') +
            '</div></div>'
        : '') +

      bloqueForma(item) +
      bloqueMedidas(item) +
      '<p class="item__equivale" data-equivale></p>' +
      '<p class="item__ayuda-medida">Medida de afuera a afuera del marco, en centímetros.</p>' +

      '<div class="campo"><span id="cant-' + item.id + '">¿Cuántas iguales?</span>' +
        '<div class="contador" role="group" aria-labelledby="cant-' + item.id + '">' +
          '<button type="button" class="contador__btn" data-accion="menos" aria-label="Una menos">−</button>' +
          '<input type="number" data-campo="cantidad" min="1" step="1" inputmode="numeric" value="' + item.cantidad + '" aria-labelledby="cant-' + item.id + '">' +
          '<button type="button" class="contador__btn" data-accion="mas" aria-label="Una más">+</button>' +
        '</div>' +
      '</div>' +

      (sinVidrio ? '' : bloqueVidrio(item)) +

      ((tip && tip.sinLinea && tip.sinColor) ? '' :
      '<div class="item__opciones">' +
        (tip && tip.sinLinea ? '' : elegible('lineaId', p.lineas, item)) +
        (tip && tip.sinColor ? '' : elegible('colorId', p.colores, item)) +
      '</div>') +

      bloqueLugar(item) +

      '<div>' +
        '<p class="extras__titulo">¿Lleva algo más? Tocá para agregar</p>' +
        '<div class="extras">' + frecuentes.map(function (ad) { return chipExtra(ad, item); }).join('') + '</div>' +
        (resto.length
          ? '<details class="desplegable desplegable--suave"' + (hayElegidoEnElResto ? ' open' : '') + '>' +
              '<summary>Ver más agregados</summary>' +
              '<div class="extras">' + resto.map(function (ad) { return chipExtra(ad, item); }).join('') + '</div>' +
            '</details>'
          : '') +
        preguntasExtra +
      '</div>' +

      '<details class="desplegable desplegable--suave"' + ((item.descuentoPct || item.nota) ? ' open' : '') + '>' +
        '<summary>Descuento o nota para esta abertura</summary>' +
        '<div class="grilla-campos">' +
          '<label class="campo"><span>Descuento (%)</span>' +
            '<input type="number" data-campo="descuentoPct" min="0" max="100" step="1" inputmode="numeric" value="' + item.descuentoPct + '"></label>' +
          '<label class="campo campo--ancho"><span>Nota (sale en el presupuesto)</span>' +
            '<input type="text" data-campo="nota" value="' + F.escapar(item.nota || '') + '" placeholder="Ej.: hoja derecha corrediza"></label>' +
        '</div>' +
      '</details>' +

      '<div class="item__pie">' +
        '<div class="item__total" data-total></div>' +
        '<button class="btn btn--primario btn--grande btn--bloque" data-accion="listo" data-icono="guardar">Listo</button>' +
        '<div class="item__acciones">' +
          '<button class="btn btn--fantasma btn--sm" data-accion="duplicar" data-icono="duplicar">Agregar otra igual</button>' +
          '<button class="btn btn--fantasma btn--sm btn--peligro" data-accion="borrar" data-icono="borrar">Quitar</button>' +
        '</div>' +
      '</div>';

    ponerIconos(nodo);
    pintarPieItem(nodo, item);
    return nodo;
  }

  /** Abertura ya cargada, en un renglón: se toca para volver a abrirla. */
  function nodoResumen(item, indice) {
    var p = preciosDelPresupuesto();
    var tip = C.buscar(p.tipologias, item.tipologiaId);
    var r = C.calcularItem(item, p);
    var nodo = document.createElement('div');
    nodo.className = 'item item--cerrado';
    nodo.dataset.id = item.id;
    nodo.innerHTML =
      '<button type="button" class="item__resumen" data-accion="abrir-item">' +
        '<span class="item__dibujo">' + (r.forma !== 'rect' ? I.forma(r.forma) : I.abertura(item.tipologiaId, tip && tip.grupo)) + '</span>' +
        '<span class="item__resumen-texto">' +
          '<span class="item__resumen-n"><b class="codigo">' + F.escapar(codigosActuales[indice] || '') + '</b>' +
            (r.lugar ? ' · ' + F.escapar(r.lugar) : '') + '</span>' +
          '<strong>' + F.escapar(tip ? tip.nombre : 'Abertura') + '</strong>' +
          '<span>' + F.medidasItem(r) +
            (r.cantidad > 1 ? ' · <b>' + r.cantidad + ' iguales</b>' : '') + '</span>' +
          (r.descripcion.detalle ? '<span class="item__resumen-detalle">' + F.escapar(r.descripcion.detalle) + '</span>' : '') +
          '<span class="item__resumen-precio">' +
            '<strong>' + F.moneda(r.total) + '</strong>' +
            '<span class="item__resumen-cambiar">Cambiar</span>' +
          '</span>' +
        '</span>' +
      '</button>';
    return nodo;
  }

  /**
   * Las aberturas en pantalla, agrupadas igual que en el PDF: si alguna tiene
   * lugar ("Quincho", "Baño"), un título por lugar con su subtotal, en el orden
   * en que aparecen. Así un quincho de muchas piezas se lee de un vistazo.
   */
  function nodosAgrupados(p) {
    var hayLugar = actual.items.some(function (it) { return String(it.lugar || '').trim(); });
    var nodo = function (it) {
      var i = actual.items.indexOf(it);
      return it.id === itemAbierto ? nodoItem(it, i) : nodoResumen(it, i);
    };
    if (!hayLugar) return actual.items.map(nodo);

    var grupos = [], porLugar = {};
    actual.items.forEach(function (it) {
      var k = String(it.lugar || '').trim();
      if (!porLugar[k]) { porLugar[k] = { lugar: k || 'Sin lugar', items: [] }; grupos.push(porLugar[k]); }
      porLugar[k].items.push(it);
    });
    var nodos = [];
    grupos.forEach(function (g) {
      var subtotal = 0, unidades = 0;
      g.items.forEach(function (it) { var r = C.calcularItem(it, p); subtotal += r.total; unidades += r.cantidad; });
      var h = document.createElement('div');
      h.className = 'grupo-lugar';
      h.innerHTML = '<strong>' + F.escapar(g.lugar) + '</strong>' +
        '<span>' + unidades + (unidades === 1 ? ' abertura' : ' aberturas') + ' · ' + F.moneda(subtotal) + '</span>';
      nodos.push(h);
      g.items.forEach(function (it) { nodos.push(nodo(it)); });
    });
    return nodos;
  }

  /** Lleva a la vista una abertura, debajo de la barra de arriba. */
  function mostrarItem(id) {
    var nodo = $('lista-items').querySelector('[data-id="' + id + '"]');
    if (nodo) nodo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ════════ Lista de opciones (línea, vidrio, color) ════════ */

  var eligiendo = null;   // { itemId, campo }

  function abrirOpciones(item, campo) {
    eligiendo = { itemId: item.id, campo: campo };
    $('opciones-titulo').textContent = campo === 'lineaId' ? '¿Qué línea de aluminio?'
                                     : campo === 'vidrioId' ? '¿Qué vidrio lleva?' : '¿De qué color?';
    var grupoAnterior = null;
    $('opciones-lista').innerHTML = opcionesDe(campo, item).map(function (x) {
      var activo = x.id === item[campo];
      var titulo = '';
      if (x.grupo && x.grupo !== grupoAnterior) {   // colores: "Pintado" / "Anodizado"
        grupoAnterior = x.grupo;
        titulo = '<h3 class="tipos-grupo">' + F.escapar(x.grupo) + '</h3>';
      }
      return titulo + '<button type="button" class="opcion' + (activo ? ' is-activa' : '') + '" data-opcion="' + F.escapar(x.id) + '"' +
        (activo ? ' aria-current="true"' : '') + '>' +
        '<span class="opcion__marca" aria-hidden="true"></span>' +
        muestra(campo, x.id) +
        '<span class="opcion__texto"><strong>' + F.escapar(x.nombre) + '</strong>' +
          (x.ayuda ? '<span>' + F.escapar(x.ayuda) + '</span>' : '') + '</span>' +
        (activo ? '<span class="opcion__elegida">Elegida</span>' : '') +
      '</button>';
    }).join('');
    var otras = aplicables(campo, item).length;
    $('opciones-todas').hidden = otras === 0;
    $('opciones-todas-check').checked = false;
    $('opciones-todas-texto').textContent = 'Cambiarlo también en las otras ' +
      (otras === 1 ? 'abertura' : otras + ' aberturas') + ' de este presupuesto';

    $('modal-opciones').hidden = false;
    document.body.style.overflow = 'hidden';
    var activa = $('opciones-lista').querySelector('.is-activa') || $('opciones-lista').firstChild;
    if (activa) { activa.scrollIntoView({ block: 'nearest' }); activa.focus(); }
  }

  function cerrarOpciones() {
    $('modal-opciones').hidden = true;
    document.body.style.overflow = '';
    eligiendo = null;
  }

  /**
   * Las otras aberturas a las que se puede pasar una línea, un color o un
   * vidrio (como "aplicar a todos los productos" de los programas de cómputo):
   * no a las que no llevan ese dato ni a las que no admiten esa línea.
   */
  function aplicables(campo, item, valor) {
    var p = preciosDelPresupuesto();
    return actual.items.filter(function (it) {
      if (it === item) return false;
      var tip = C.buscar(p.tipologias, it.tipologiaId);
      if (campo === 'lineaId') {
        if (tip && tip.sinLinea) return false;
        if (valor && tip && tip.lineas && tip.lineas.indexOf(valor) === -1) return false;
      }
      if (campo === 'colorId' && tip && tip.sinColor) return false;
      if (campo === 'vidrioId' && tip && tip.sinVidrio) return false;
      return true;
    });
  }

  function aplicarATodas(campo, item, valor) {
    var otras = aplicables(campo, item, valor);
    otras.forEach(function (it) {
      it[campo] = valor;
      if (campo === 'vidrioId' && /^policarb/.test(valor)) it.tono = item.tono || TONOS_PLACA[0];
    });
    return otras.length;
  }

  function elegirOpcion(id) {
    if (!eligiendo) return;
    var item = itemPorId(eligiendo.itemId);
    var campo = eligiendo.campo;
    var aTodas = $('opciones-todas-check').checked;
    cerrarOpciones();
    if (!item) return;
    item[campo] = id;
    var cambiadas = aTodas ? aplicarATodas(campo, item, id) : 0;
    hayCambios = true;
    render();
    autoguardar();
    var x = C.buscar(opcionesDe(campo, item), id);
    avisar(ROTULOS[campo] + ': ' + (x ? x.nombre : '') +
      (cambiadas ? ' (también en ' + (cambiadas === 1 ? 'otra abertura' : 'otras ' + cambiadas) + ')' : ''));
  }

  function pintarPieItem(nodo, item) {
    var r = C.calcularItem(item, preciosDelPresupuesto());

    var caja = F.medidasMetros(r.anchoMm, Math.max(r.altoMm, r.alto2Mm || 0));
    nodo.querySelector('[data-equivale]').innerHTML =
      (r.forma === 'rect'
        ? 'Son ' + caja + ' (' + F.numero(r.m2Real, 2) + ' m²)'
        : 'Se cobra como un rectángulo de ' + caja + ' (' + F.numero(r.m2Real, 2) + ' m²)' +
          (r.recargoForma > 0 ? ', con ' + F.numero(r.recargoForma * 100, 0) + ' % por la forma' : '')) +
      (r.aplicaMinimo ? '<span class="marca-minimo">Es chica: se cobra el mínimo de ' + F.numero(r.m2Fact, 2) + ' m²</span>' : '');

    nodo.querySelector('[data-total]').innerHTML =
      '<span>' + (r.cantidad > 1 ? r.cantidad + ' × ' + F.moneda(r.unitario) : 'Precio') + '</span>' +
      '<strong>' + F.moneda(r.total) + '</strong>';
  }

  function itemPorId(id) {
    for (var i = 0; i < actual.items.length; i++) if (actual.items[i].id === id) return actual.items[i];
    return null;
  }

  function render() {
    var lista = $('lista-items');
    var p = preciosDelPresupuesto();
    codigosActuales = C.codigos(actual.items, p);
    lista.replaceChildren.apply(lista, nodosAgrupados(p));
    itemQueEntra = null;
    var hay = actual.items.length > 0;
    $('items-vacio').hidden = hay;
    $('btn-agregar-item').lastChild.textContent = hay ? 'Agregar otra abertura' : 'Agregar una abertura';
    $('entrega').hidden = !hay;
    $('entrega-vacia').hidden = hay;
    $('tarjeta-compras').hidden = !hay;
    renderTotales();
  }

  /** Recalcula sin reconstruir los campos, para no perder el foco al tipear. */
  function refrescarCalculos() {
    Array.prototype.forEach.call($('lista-items').children, function (nodo) {
      if (!nodo.classList.contains('item--abierto')) return;   // resumidas y títulos no cambian al tipear en otra
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

    var dolar = window.Dolar.guardado();
    if (dolar && dolar.venta > 0 && r.total > 0) {
      fila('En dólares (blue ' + F.moneda(dolar.venta) + ')',
           'US$ ' + F.numero(Math.round(r.total / dolar.venta), 0), 'totales__fila--tenue');
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
    renderGanancia();
    $('barra-total').hidden = !actual.items.length;
  }

  /* ════════ Copia de seguridad ════════ */

  /*
   * Todo vive en el teléfono. La copia es un archivo que se manda por la lista
   * para compartir (WhatsApp a Pablo, Drive, email) y se recupera con
   * "Recuperar una copia". Se recuerda cada 7 días si hubo cambios.
   */
  var CLAVE_COPIA = 'alumfer.copia.v1';
  function infoCopia() {
    try { return JSON.parse(window.localStorage.getItem(CLAVE_COPIA)) || {}; } catch (e) { return {}; }
  }
  function anotarCopia(cambios) {
    var info = infoCopia();
    Object.assign(info, cambios);
    try { window.localStorage.setItem(CLAVE_COPIA, JSON.stringify(info)); } catch (e) {}
  }

  /** Huella de lo guardado: si cambió desde la última copia, conviene otra. */
  function huella() {
    var lista = A.listar();   // ya viene ordenada por última modificación
    return lista.length + '|' + ((lista[0] && lista[0].modificado) || '');
  }

  function revisarCopia() {
    var cantidad = A.listar().length;
    var info = infoCopia();
    var ahora = Date.now();
    var hace = info.fecha ? (ahora - new Date(info.fecha).getTime()) / DIA : Infinity;
    var pospuesta = info.luegoHasta && new Date(info.luegoHasta).getTime() > ahora;
    var hayNovedades = info.huella !== huella();
    var toca = cantidad >= 3 && hayNovedades && hace >= 7 && !pospuesta;
    $('aviso-copia').hidden = !toca;
    if (toca) {
      $('aviso-copia-texto').textContent = info.fecha
        ? 'Hace ' + Math.floor(hace) + ' días que no guardás una copia de tus ' + cantidad + ' presupuestos.'
        : 'Guardá una copia de tus ' + cantidad + ' presupuestos, por si se rompe o se pierde el teléfono.';
    }
  }

  function renderCopiaUltima() {
    var info = infoCopia();
    $('copia-ultima').textContent = info.fecha
      ? 'Última copia: ' + F.fechaHoraRelativa(info.fecha) + '.'
      : 'Todavía no guardaste ninguna copia.';
  }

  function guardarCopia() {
    var datos = JSON.stringify(A.exportarTodo(), null, 2);
    var nombre = 'Copia presupuestos Alumfer ' + F.fechaISO() + '.json';
    var listo = function () {
      anotarCopia({ fecha: new Date().toISOString(), huella: huella(), luegoHasta: null });
      revisarCopia();
      renderCopiaUltima();
    };
    var archivo = window.File ? new File([datos], nombre, { type: 'application/json' }) : null;
    var puede = false;
    try { puede = !!(archivo && navigator.canShare && navigator.canShare({ files: [archivo] })); } catch (e) {}
    if (puede) {
      navigator.share({ files: [archivo], title: 'Copia de los presupuestos', text: 'Copia de los presupuestos de Alumfer del ' + F.fechaCorta(F.fechaISO()) })
        .then(function () { listo(); avisar('Copia guardada'); })
        .catch(function (err) { if (!err || err.name !== 'AbortError') avisar('No se pudo compartir la copia.', 'error'); });
      return;
    }
    var enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([datos], { type: 'application/json' }));
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(function () { URL.revokeObjectURL(enlace.href); }, 60000);
    listo();
    avisar('Copia guardada en Descargas');
  }

  /* ════════ Guardados ════════ */

  var ESTADOS = { borrador: 'En preparación', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado' };

  var DIA = 86400000;

  /** Presupuestos enviados que pasaron los días configurados sin respuesta. */
  function paraLlamar() {
    var dias = Number(precios.generales.diasSeguimiento) || 3;
    var ahora = Date.now();
    return A.listar().filter(function (p) {
      if (p.estado !== 'enviado') return false;
      if (p.llamarDesde && new Date(p.llamarDesde).getTime() > ahora) return false;   // "más tarde"
      var desde = new Date(p.ultimoSeguimiento || p.enviadoEl || p.modificado).getTime();
      return ahora - desde >= dias * DIA;
    });
  }

  function venceEl(p) {
    var g = (p.precios && p.precios.generales) || precios.generales;
    var a = p.ajustes || {};
    return F.sumarDias(p.fecha || F.fechaISO(), a.validezDias != null ? a.validezDias : g.validezDias);
  }

  function renderLlamar() {
    var lista = paraLlamar();
    $('alerta-historial').hidden = !lista.length;
    $('tarjeta-llamar').hidden = !lista.length;
    if (!lista.length) return;
    $('llamar-guia').textContent = lista.length === 1
      ? 'Se lo mandaste hace unos días y todavía no contestó. ¿Le escribimos?'
      : 'Se los mandaste hace unos días y todavía no contestaron. ¿Les escribimos?';
    var hoy = F.fechaISO();
    $('lista-llamar').innerHTML = lista.map(function (p) {
      var cli = p.cliente || {};
      var dias = Math.floor((Date.now() - new Date(p.ultimoSeguimiento || p.enviadoEl || p.modificado).getTime()) / DIA);
      var vence = venceEl(p);
      var vencido = vence < hoy;
      return '<div class="llamar-fila" data-id="' + p.id + '">' +
        '<div class="llamar-fila__datos"><strong>' + F.escapar(cli.nombre || 'Sin nombre') + '</strong>' +
          '<span>' + F.escapar(p.numero || '') + ' · ' + F.moneda(p.total || 0) + '</span>' +
          '<span>' + (p.ultimoSeguimiento ? 'Le escribiste hace ' : 'Se lo mandaste hace ') + dias + (dias === 1 ? ' día' : ' días') +
            (vencido ? ' · <b class="vencido">venció el ' + F.fechaCorta(vence) + '</b>' : ' · vence el ' + F.fechaCorta(vence)) + '</span>' +
        '</div>' +
        '<button class="btn btn--whatsapp btn--bloque" data-accion="seguir" data-icono="whatsapp">Preguntarle por WhatsApp</button>' +
        '<div class="llamar-fila__acciones">' +
          '<button class="btn btn--fantasma btn--sm" data-accion="acepto">Aceptó</button>' +
          '<button class="btn btn--fantasma btn--sm" data-accion="no-acepto">No aceptó</button>' +
          '<button class="btn btn--fantasma btn--sm" data-accion="luego">Más tarde</button>' +
        '</div>' +
      '</div>';
    }).join('');
    ponerIconos($('lista-llamar'));
  }

  /** Mensaje para preguntarle al cliente si vio el presupuesto. */
  function mensajeSeguimiento(p) {
    var cli = p.cliente || {};
    var nombre = String(cli.nombre || '').trim().split(/\s+/)[0];
    var e = precios.empresa || {};
    return 'Hola' + (nombre ? ' ' + nombre : '') + ', ¿cómo estás? Te escribo de ' + (e.nombre || 'Alumfer') +
      ' por el presupuesto ' + (p.numero || '') + ' que te mandé el ' + F.fechaCorta((p.enviadoEl || p.fecha || '').slice(0, 10)) +
      '. ¿Pudiste verlo? Si tenés alguna duda o querés cambiar algo, avisame y lo vemos.';
  }

  /** Resumen del mes (solo para Alumfer): presupuestado, aceptado y lo que deja. */
  function renderMes() {
    var mes = F.fechaISO().slice(0, 7);
    var delMes = A.listar().filter(function (p) { return String(p.fecha || '').slice(0, 7) === mes && (p.items || []).length; });
    $('tarjeta-mes').hidden = !delMes.length;
    if (!delMes.length) return;
    var nombreMes = new Date().toLocaleDateString('es-AR', { month: 'long' });
    $('mes-titulo').textContent = 'En ' + nombreMes;
    var total = 0, aceptados = [], totalAceptado = 0, contestados = 0, ganancia = 0, completa = true, conCostos = false;
    delMes.forEach(function (p) {
      total += p.total || 0;
      if (p.estado === 'aceptado' || p.estado === 'rechazado') contestados++;
      if (p.estado === 'aceptado') {
        aceptados.push(p);
        totalAceptado += p.total || 0;
        var gn = gananciaDe(p);
        ganancia += gn.ganancia;
        if (!gn.completa) completa = false;
        if (gn.costoTotal) conCostos = true;
      }
    });
    var dato = function (fuerte, texto) {
      return '<div class="compras-dato"><strong>' + fuerte + '</strong><span>' + texto + '</span></div>';
    };
    $('mes-datos').innerHTML =
      dato(delMes.length, (delMes.length === 1 ? 'presupuesto' : 'presupuestos') + ' por ' + F.moneda(total)) +
      dato(aceptados.length, (aceptados.length === 1 ? 'aceptado' : 'aceptados') + ' por ' + F.moneda(totalAceptado)) +
      (contestados ? dato(F.numero(aceptados.length / contestados * 100, 0) + ' %', 'de los que contestaron, aceptaron') : '') +
      (aceptados.length && conCostos ? dato(F.moneda(ganancia), 'de ganancia aproximada' + (completa ? '' : ' (faltan costos)')) : '') +
      (aceptados.length && !conCostos ? dato('—', 'ganancia: cargá tus costos en Precios para verla') : '');
  }

  function renderHistorial() {
    var lista = A.listar();
    $('badge-historial').textContent = lista.length;
    var q = ($('buscar-historial').value || '').toLowerCase().trim();
    if (q) {
      lista = lista.filter(function (p) {
        return (p.numero || '').toLowerCase().indexOf(q) > -1 ||
               ((p.cliente && p.cliente.nombre) || '').toLowerCase().indexOf(q) > -1 ||
               ((p.cliente && p.cliente.localidad) || '').toLowerCase().indexOf(q) > -1 ||
               (q.replace(/\D/g, '').length >= 3 &&
                String((p.cliente && p.cliente.telefono) || '').replace(/\D/g, '').indexOf(q.replace(/\D/g, '')) > -1);
      });
    }
    renderLlamar();
    renderMes();
    renderCopiaUltima();

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
    marcarGuardado('precios-guardado');
  }

  /**
   * Tabla editable genérica.
   * columnas: [{campo, etiqueta, tipo: 'texto'|'numero'|'porcentaje'|'check'|'select', clase, opciones}]
   */
  var CAMPOS_DE_COSTO = ['costoM2', 'costo', 'kgMetro'];

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
          grupoActual = x[opts.agrupar] || 'Otros';
          // El grupo se dice una sola vez, arriba, y trae su propio botón:
          // así no hace falta repetirlo como columna en cada fila.
          filas += '<tr class="grupo"><td colspan="' + (columnas.length + 1) + '">' +
            '<div class="grupo__fila">' +
              '<span>' + F.escapar(grupoActual) + '</span>' +
              '<button class="btn btn--fantasma btn--sm" data-accion="agregar" data-grupo="' +
                F.escapar(grupoActual) + '">+ Agregar</button>' +
            '</div>' +
          '</td></tr>';
        }
        filas += '<tr data-indice="' + i + '">' +
          columnas.map(function (c) {
            return '<td class="' + (c.clase || '') + '" data-rotulo="' + F.escapar(c.etiqueta) + '">' + celda(x, c) + '</td>';
          }).join('') +
          '<td class="alineado-der"><button class="btn btn--fantasma btn--sm btn--peligro" data-accion="borrar">Borrar</button></td>' +
        '</tr>';
      });

      cont.innerHTML = '<table class="tabla-precios"><thead><tr>' +
        columnas.map(function (c) { return '<th class="' + (c.clase || '') + '">' + F.escapar(c.etiqueta) + '</th>'; }).join('') +
        '<th></th></tr></thead><tbody>' + filas + '</tbody></table>' +
        (opts.agrupar ? '' : '<p><button class="btn btn--fantasma btn--sm" data-accion="agregar">+ Agregar fila</button></p>');
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
      // Costos y peso por metro no son precios de venta: no marcan los presupuestos como desactualizados.
      if (CAMPOS_DE_COSTO.indexOf(campo) > -1) { A.guardarPrecios(precios); marcarGuardado('precios-guardado'); }
      else guardarPrecios();
    });

    cont.addEventListener('click', function (ev) {
      var boton = ev.target.closest('button');
      if (!boton) return;
      if (boton.dataset.accion === 'agregar') {
        var fila = Object.assign({ id: idUnico(opts.prefijo || 'x_') }, opts.nuevo || {});
        var grupo = boton.dataset.grupo;
        if (opts.agrupar && grupo) {
          fila[opts.agrupar] = grupo;
          insertarEnGrupo(lista, fila, opts.agrupar);
        } else {
          lista.push(fila);
        }
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
    $('alu-precio').value = precios.aluminio.precio || '';
    $('alu-moneda').value = precios.aluminio.moneda || 'usd';
    renderAluminio();
    $('gen-min-m2').value = precios.generales.minM2Global;
    $('gen-redondeo').value = precios.generales.redondeo;
    $('gen-plazo').value = precios.generales.plazoEntrega || '';
    $('gen-pago').value = precios.generales.formaPago || '';
    $('gen-barra').value = (Number(precios.generales.largoBarra) || 6000) / 1000;
    $('gen-herrajes').value = precios.generales.costoHerrajes || '';
    $('gen-mano-obra').value = precios.generales.costoManoObra || '';
    $('gen-dias-llamar').value = precios.generales.diasSeguimiento || 3;
    $('gen-corte').value = precios.generales.corteSierra != null ? precios.generales.corteSierra : 5;
    renderEmpresa();

    tablaEditable('tabla-lineas', precios.lineas, [
      { campo: 'nombre', etiqueta: 'Línea', clase: 'col-nombre' },
      { campo: 'ayuda', etiqueta: 'Descripción' },
      { campo: 'factor', etiqueta: 'Multiplicador', tipo: 'numero', paso: 0.01, clase: 'col-min' },
      { campo: 'kgMetro', etiqueta: 'Peso (kg por metro)', tipo: 'numero', paso: 0.01, clase: 'col-min' }
    ], { prefijo: 'ln_', nuevo: { nombre: 'Línea nueva', factor: 1 } });

    tablaEditable('tabla-tipologias', precios.tipologias, [
      { campo: 'nombre', etiqueta: 'Abertura', clase: 'col-nombre' },
      { campo: 'precioM2', etiqueta: '$ / m²', tipo: 'numero', paso: 1000, clase: 'col-num' },
      { campo: 'minM2', etiqueta: 'm² mínimos', tipo: 'numero', paso: 0.05, clase: 'col-min' },
      { campo: 'costoM2', etiqueta: 'Costo $/m² (si lo comprás hecho)', tipo: 'numero', paso: 1000, clase: 'col-num' },
      { campo: 'sinVidrio', etiqueta: 'Sin vidrio', tipo: 'check', clase: 'col-min' }
    ], { agrupar: 'grupo', prefijo: 'tp_', nuevo: { grupo: 'Otros', nombre: 'Abertura nueva', precioM2: 0, minM2: 0.5 } });

    tablaEditable('tabla-vidrios', precios.vidrios, [
      { campo: 'nombre', etiqueta: 'Vidrio', clase: 'col-nombre' },
      { campo: 'ayuda', etiqueta: 'Descripción' },
      { campo: 'precioM2', etiqueta: '$ / m²', tipo: 'numero', paso: 1000, clase: 'col-num' },
      { campo: 'costoM2', etiqueta: 'Lo que pagás $/m²', tipo: 'numero', paso: 1000, clase: 'col-num' }
    ], { prefijo: 'vd_', nuevo: { nombre: 'Vidrio nuevo', precioM2: 0 } });

    tablaEditable('tabla-colores', precios.colores, [
      { campo: 'nombre', etiqueta: 'Color / terminación', clase: 'col-nombre' },
      { campo: 'recargo', etiqueta: 'Recargo (%)', tipo: 'porcentaje', clase: 'col-min' }
    ], { prefijo: 'cl_', nuevo: { nombre: 'Color nuevo', recargo: 0 } });

    $('tabla-formas').innerHTML = (precios.formas || []).map(function (f, i) {
      return '<label class="campo"><span>' + I.forma(f.id) + ' ' + F.escapar(f.nombre) + ': recargo (%)</span>' +
        '<input type="number" min="0" step="1" inputmode="numeric" data-forma-i="' + i + '" value="' +
        Math.round((Number(f.recargo) || 0) * 100) + '"></label>';
    }).join('');

    tablaEditable('tabla-adicionales', precios.adicionales, [
      { campo: 'nombre', etiqueta: 'Adicional', clase: 'col-nombre' },
      { campo: 'modo', etiqueta: 'Se cobra', tipo: 'select', clase: 'col-min', opciones: [
        { valor: 'm2', texto: 'Por m²' }, { valor: 'ml', texto: 'Por metro lineal' }, { valor: 'unidad', texto: 'Por unidad' }
      ] },
      { campo: 'precio', etiqueta: 'Precio', tipo: 'numero', paso: 1000, clase: 'col-num' },
      { campo: 'costo', etiqueta: 'Lo que te cuesta', tipo: 'numero', paso: 1000, clase: 'col-num' }
    ], { prefijo: 'ad_', nuevo: { nombre: 'Adicional nuevo', modo: 'unidad', precio: 0 } });
  }

  /* ════════ Dólar blue ════════ */

  function pintarDolar(valor, estado) {
    var cont = $('dolar');
    if (estado === 'cargando' && !valor) {
      cont.innerHTML = '<p class="dolar__pie">Consultando la cotización…</p>';
      return;
    }
    if (!valor) {
      cont.innerHTML = '<p class="dolar__pie dolar__pie--viejo">No se pudo consultar la cotización. ' +
        'Probá de nuevo cuando tengas señal.</p>';
      return;
    }

    // Un valor de otro día se marca, para no tomar por bueno el de ayer.
    var consultado = new Date(valor.consultado);
    var delDia = (Date.now() - consultado.getTime()) < 12 * 60 * 60 * 1000;

    cont.innerHTML =
      '<div class="dolar">' +
        '<span class="dolar__dato"><span>Compra</span><strong>' + F.moneda(valor.compra) + '</strong></span>' +
        '<span class="dolar__dato"><span>Venta</span><strong>' + F.moneda(valor.venta) + '</strong></span>' +
        '<p class="dolar__pie' + (delDia ? '' : ' dolar__pie--viejo') + '">' +
          (estado === 'sin-conexion' ? 'Sin conexión, último valor guardado: ' : 'Actualizado ') +
          F.escapar(F.fechaHoraRelativa(valor.consultado)) +
          ' · fuente ' + F.escapar(valor.fuente || '') +
        '</p>' +
      '</div>';
  }

  function cargarDolar(aPedido) {
    var previo = window.Dolar.guardado();
    pintarDolar(previo, previo ? null : 'cargando');
    return window.Dolar.actualizar()
      .then(function (valor) {
        pintarDolar(valor);
        renderAluminio();
        renderTotales();
        if (aPedido) avisar('Cotización actualizada');
      })
      .catch(function () {
        pintarDolar(previo, 'sin-conexion');
        if (aPedido) avisar('No se pudo consultar la cotización.', 'error');
      });
  }

  /* ════════ Aluminio: precio del kilo ════════ */

  var relojAluminio = null;

  /** Los dos valores del kilo: el que se cargó y el convertido con el blue. */
  function valoresAluminio(alu, blueVenta) {
    var precio = num(alu.precio);
    if (!precio) return null;
    if (alu.moneda === 'ars') {
      return { ars: precio, usd: blueVenta > 0 ? precio / blueVenta : null };
    }
    return { usd: precio, ars: blueVenta > 0 ? precio * blueVenta : null };
  }

  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }

  function renderAluminio() {
    var alu = precios.aluminio || {};
    var dolar = window.Dolar.guardado();
    var blueVenta = dolar ? num(dolar.venta) : 0;
    var v = valoresAluminio(alu, blueVenta);
    var cont = $('aluminio-resumen');

    if (!v) {
      cont.innerHTML = '<p class="dolar__pie">Cargá el precio que te pasa el proveedor y la app lo ' +
        'convierte sola con el blue del día.</p>';
      return;
    }

    var partes = '<div class="dolar">' +
      '<span class="dolar__dato"><span>En dólares</span><strong>' +
        (v.usd == null ? '—' : 'US$ ' + F.numero(v.usd, 2)) + '</strong></span>' +
      '<span class="dolar__dato"><span>En pesos</span><strong>' +
        (v.ars == null ? '—' : F.moneda(v.ars)) + '</strong></span>';

    var pie = [];
    if (alu.actualizado) {
      var dias = Math.floor((Date.now() - new Date(alu.actualizado + 'T12:00:00').getTime()) / 86400000);
      pie.push(dias <= 0 ? 'Cargado hoy'
             : dias === 1 ? 'Cargado ayer'
             : 'Cargado hace ' + dias + ' días (' + F.fechaCorta(alu.actualizado) + ')');
    }
    if (blueVenta > 0) pie.push('convertido con el blue ' + F.moneda(blueVenta));
    else pie.push('falta la cotización del blue para convertirlo');

    var viejo = alu.actualizado &&
      (Date.now() - new Date(alu.actualizado + 'T12:00:00').getTime()) > 30 * 86400000;
    partes += '<p class="dolar__pie' + (viejo ? ' dolar__pie--viejo' : '') + '">' +
      F.escapar(pie.join(' · ')) + (viejo ? ' — conviene pedirle la lista al proveedor' : '') + '</p>';

    // Cuánto se movió desde la vez anterior, comparando en dólares.
    var h = alu.historial || [];
    var previo = h.length > 1 ? h[h.length - 2] : null;
    if (previo && v.usd != null) {
      var usdPrevio = previo.moneda === 'ars'
        ? (num(previo.blue) > 0 ? num(previo.precio) / num(previo.blue) : null)
        : num(previo.precio);
      if (usdPrevio > 0) {
        var var_ = ((v.usd - usdPrevio) / usdPrevio) * 100;
        var signo = var_ > 0 ? 'subió' : var_ < 0 ? 'bajó' : 'igual que';
        partes += '<p class="dolar__pie">Antes: US$ ' + F.numero(usdPrevio, 2) +
          ' (' + F.escapar(F.fechaCorta(previo.fecha)) + ') — ' +
          F.escapar(signo) + (var_ === 0 ? '' : ' ' + F.numero(Math.abs(var_), 1) + ' %') + '</p>';
      }
    }

    cont.innerHTML = partes + '</div>';
  }

  /** Guarda el precio del kilo; una entrada de historial por día. */
  function guardarAluminio() {
    var dolar = window.Dolar.guardado();
    var alu = precios.aluminio;
    alu.precio = F.aNumero($('alu-precio').value);
    alu.moneda = $('alu-moneda').value;
    alu.actualizado = F.fechaISO();
    alu.blue = dolar ? num(dolar.venta) : 0;

    if (alu.precio > 0) {
      var entrada = { precio: alu.precio, moneda: alu.moneda, blue: alu.blue, fecha: alu.actualizado };
      var h = alu.historial || (alu.historial = []);
      if (h.length && h[h.length - 1].fecha === entrada.fecha) h[h.length - 1] = entrada;
      else h.push(entrada);
      if (h.length > 12) h.splice(0, h.length - 12);
    }

    // El kilo no cambia ningún precio de venta: no marca los presupuestos como desactualizados.
    A.guardarPrecios(precios);
    marcarGuardado('aluminio-guardado');
    renderAluminio();
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

  /* ════════ Entregar: PDF, WhatsApp, email ════════ */

  /*
   * Un link de WhatsApp (wa.me) solo puede llevar texto: no adjunta archivos.
   * Para mandar el PDF se usa la lista para compartir del teléfono
   * (navigator.share con archivos), que existe en Android y en iPhone.
   * En la computadora no está: ahí se abre el chat con el mensaje y el PDF
   * queda en Descargas para adjuntarlo.
   */

  var pdfListo = null;    // último PDF armado, para no rehacerlo si no cambió nada
  var alTocarListo = null;
  var ES_IPHONE = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function puedeCompartirArchivos() {
    if (!navigator.share || !navigator.canShare || !window.File) return false;
    try { return navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] }); }
    catch (e) { return false; }
  }

  function listoParaEntregar(accion) {
    if (!actual.items.length) {
      avisar('Agregá al menos una abertura antes de ' + accion + '.', 'error');
      return false;
    }
    guardar(true);
    return true;
  }

  function armarPdf() {
    var p = preciosParaDocumento();
    var r = C.calcularPresupuesto(actual, p);
    var clave = JSON.stringify([actual.numero, actual.fecha, actual.cliente, actual.items, actual.ajustes,
                                actual.notas, p.revision, p.generales, p.empresa]);
    if (pdfListo && pdfListo.clave === clave) return Promise.resolve(pdfListo);
    var preparando = avisar('Preparando el PDF…');
    return window.PDF.generar(actual, r, p).then(function (blob) {
      preparando.remove();
      var nombre = window.PDF.nombreArchivo(actual);
      pdfListo = {
        clave: clave, blob: blob, nombre: nombre, r: r, p: p,
        archivo: new File([blob], nombre, { type: 'application/pdf' })
      };
      return pdfListo;
    });
  }

  function errorPdf(e) {
    console.error(e);
    avisar('No se pudo armar el PDF. Probá con "Imprimir en papel", más abajo.', 'error');
  }

  function descargarArchivo(listo) {
    var enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(listo.blob);
    enlace.download = listo.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(function () { URL.revokeObjectURL(enlace.href); }, 60000);
  }

  /**
   * Abre la lista para compartir. Si el navegador la bloquea porque armar
   * el PDF tardó y "se perdió" el toque, pide un toque más con una
   * ventanita: el PDF ya está hecho, así que ese segundo toque es instantáneo.
   */
  function compartir(listo, datos, textoBoton, despues) {
    var abrir = function () { return navigator.share(Object.assign({ files: [listo.archivo] }, datos)); };
    var fallo = function (err) {
      if (err && err.name === 'AbortError') return;       // cerró la lista: no pasa nada
      avisar('No se pudo abrir la lista para compartir. Probá con "Descargar PDF".', 'error');
    };
    abrir().then(despues).catch(function (err) {
      if (err && err.name === 'NotAllowedError') {
        return pedirOtroToque(textoBoton, function () { abrir().then(despues).catch(fallo); });
      }
      fallo(err);
    });
  }

  function pedirOtroToque(textoBoton, accion) {
    alTocarListo = accion;
    $('btn-listo').innerHTML = I.ui('whatsapp') + F.escapar(textoBoton);
    $('modal-listo').hidden = false;
    $('btn-listo').focus();
  }

  function cerrarListo() {
    $('modal-listo').hidden = true;
    alTocarListo = null;
  }

  /** Lo enviado deja de estar "en preparación", así se ve en Guardados. */
  function marcarEnviado() {
    if (!actual.enviadoEl) actual.enviadoEl = new Date().toISOString();   // para saber cuándo volver a llamar
    if (actual.estado !== 'borrador') return guardar(true);
    $('pre-estado').value = 'enviado';
    guardar(true);
    avisar('Quedó marcado como "Enviado al cliente"');
  }

  function enviarWhatsapp() {
    if (!listoParaEntregar('enviar')) return;
    if (!puedeCompartirArchivos()) return whatsappConDescarga();
    armarPdf().then(function (listo) {
      compartir(listo, { text: D.mensajeCorto(actual, listo.r, listo.p) }, 'Elegir WhatsApp', marcarEnviado);
    }).catch(errorPdf);
  }

  /** Computadora: abre el chat con el resumen y deja el PDF en Descargas. */
  function whatsappConDescarga() {
    var p = preciosParaDocumento();
    if (!actual.cliente.telefono) avisar('Sin teléfono cargado: WhatsApp te va a pedir el contacto.');
    window.open(D.urlWhatsapp(actual, C.calcularPresupuesto(actual, p), p), '_blank');
    armarPdf().then(function (listo) {
      descargarArchivo(listo);
      avisar('El PDF quedó en Descargas: adjuntalo en el chat con el clip.');
      marcarEnviado();
    }).catch(errorPdf);
  }

  /** Solo el texto, directo al número del cliente (sirve si no está agendado). */
  function whatsappSoloTexto() {
    if (!listoParaEntregar('enviar')) return;
    var p = preciosParaDocumento();
    if (!actual.cliente.telefono) avisar('Sin teléfono cargado: WhatsApp te va a pedir el contacto.');
    window.open(D.urlWhatsapp(actual, C.calcularPresupuesto(actual, p), p), '_blank');
    marcarEnviado();
  }

  function descargarPdf() {
    if (!listoParaEntregar('descargar el PDF')) return;
    armarPdf().then(function (listo) {
      // En iPhone la descarga directa abre un visor del que cuesta volver:
      // la lista para compartir ofrece "Guardar en Archivos".
      if (ES_IPHONE && puedeCompartirArchivos()) {
        return compartir(listo, {}, 'Guardar el PDF', function () {});
      }
      descargarArchivo(listo);
      avisar('PDF descargado');
    }).catch(errorPdf);
  }

  function enviarEmail() {
    if (!listoParaEntregar('enviar')) return;
    var p = preciosParaDocumento();
    if (puedeCompartirArchivos()) {
      return armarPdf().then(function (listo) {
        compartir(listo, {
          title: D.asuntoEmail(actual, listo.p),
          text: D.mensajeCorto(actual, listo.r, listo.p)
        }, 'Elegir el correo', marcarEnviado);
      }).catch(errorPdf);
    }
    // Computadora: mailto no puede adjuntar, así que el PDF queda en Descargas.
    window.location.href = D.urlEmail(actual, C.calcularPresupuesto(actual, p), p);
    armarPdf().then(function (listo) {
      descargarArchivo(listo);
      avisar('El PDF quedó en Descargas: adjuntalo al correo.');
      marcarEnviado();
    }).catch(errorPdf);
  }

  function imprimir() {
    if (!listoParaEntregar('imprimir')) return;
    var p = preciosParaDocumento();
    D.imprimir(actual, C.calcularPresupuesto(actual, p), p);
  }

  /** El texto de ayuda dice lo que va a pasar en ESTE aparato. */
  function ayudaEntrega() {
    $('ayuda-whatsapp').innerHTML = puedeCompartirArchivos()
      ? 'Se abre la lista para compartir: elegí <strong>WhatsApp</strong> y después el contacto. El PDF va adjunto.'
      : 'Se abre WhatsApp con el resumen y el PDF queda en <strong>Descargas</strong> para adjuntarlo con el clip.';
  }

  /* ════════ Para hacer las compras (solo para Alumfer) ════════ */

  /*
   * Lista de materiales aproximada: tiras de aluminio, vidrios y lo que va
   * por m². Es de uso interno: no se usa en documento.js ni en pdf.js, así
   * que nunca le llega al cliente.
   */
  var M = window.Materiales;

  function metros(mm) { return F.numero(mm / 1000, 2) + ' m'; }

  /**
   * Precios para compras y ganancia: los precios de venta son los del
   * presupuesto (los que se le pasaron al cliente), pero costos, peso por
   * metro, largo de tira y corte se toman de los datos de hoy, aunque el
   * presupuesto sea viejo: no son precios de venta.
   */
  function preciosCompras(pres) {
    var p = Object.assign({}, (pres && pres.precios) || precios);
    var g = precios.generales;
    p.generales = Object.assign({}, p.generales, {
      largoBarra: g.largoBarra, corteSierra: g.corteSierra,
      costoHerrajes: g.costoHerrajes, costoManoObra: g.costoManoObra
    });
    ['lineas', 'vidrios', 'tipologias', 'adicionales'].forEach(function (k) {
      p[k] = (p[k] || []).map(function (x) {
        var hoy = C.buscar(precios[k], x.id) || {};
        var copia = Object.assign({}, x);
        CAMPOS_DE_COSTO.forEach(function (c) { if (hoy[c] != null) copia[c] = hoy[c]; });
        return copia;
      });
    });
    return p;
  }

  /** Precio del kilo de aluminio en pesos (0 si no se cargó o falta el dólar). */
  function kiloEnPesos() {
    var alu = precios.aluminio || {};
    var kilo = Number(alu.precio) || 0;
    if (alu.moneda === 'ars') return kilo;
    var dolar = window.Dolar.guardado();
    return dolar && dolar.venta ? kilo * dolar.venta : 0;
  }

  function gananciaDe(pres) { return M.ganancia(pres, preciosCompras(pres), kiloEnPesos()); }

  /** "Ganancia aproximada" en la tarjeta interna, debajo del paso 3. */
  function renderGanancia() {
    var cont = $('ganancia-resumen');
    if (!cont || !actual.items.length) return;
    var gn = gananciaDe(actual);
    // Sin ningún costo cargado la "ganancia" sería todo lo cobrado: mejor no mostrar un número engañoso.
    if (!gn.costoTotal) {
      cont.innerHTML = '<p class="ganancia__falta ganancia__falta--sola">Para ver cuánto te deja, cargá tus costos en ' +
        '<strong>Precios</strong> (precio del kilo de aluminio, peso por metro, lo que pagás el vidrio, herrajes y mano de obra).</p>';
      return;
    }
    cont.innerHTML =
      '<div class="ganancia__monto"><span>Ganancia aproximada</span><strong>' + F.moneda(gn.ganancia) + '</strong>' +
        '<em>' + F.numero(gn.porcentaje, 0) + ' % de lo que cobrás sin IVA</em></div>' +
      (gn.completa ? '' : '<p class="ganancia__falta">Faltan costos por cargar en Precios, así que en realidad es menos. ' +
        'Tocá el botón de abajo para ver cuáles.</p>');
  }
  function cm(mm) { return F.numero(mm / 10, 0); }

  /** Retazos que sirven (desde 30 cm) uno por uno; los más chicos, contados. */
  function retazosTexto(retazos) {
    var sirven = retazos.filter(function (x) { return x >= 300; });
    var chicos = retazos.length - sirven.length;
    if (!retazos.length) return '';
    return '<span>' + (sirven.length ? 'Retazos que quedan: ' + sirven.map(metros).join(' · ') : 'Sin retazos que sirvan') +
      (chicos ? (sirven.length ? ', y ' : ' (') + chicos + (chicos === 1 ? ' recorte chico' : ' recortes chicos') + (sirven.length ? '' : ')') : '') +
      '</span>';
  }

  function abrirCompras() {
    if (!actual.items.length) return;
    leerFormulario();
    var p = preciosCompras(actual);
    var m = M.calcular(actual, p);
    var t = m.totales;
    var barra = F.numero(m.largoBarra / 1000, m.largoBarra % 1000 ? 1 : 0) + ' m';
    var h = [];

    var gn = M.ganancia(actual, p, kiloEnPesos());
    h.push('<h3 class="compras-titulo compras-titulo--primero">Ganancia aproximada</h3>' +
      '<div class="compras-fila ganancia-detalle">' +
        filaGanancia('Cobrás (sin IVA)', gn.venta) +
        filaGanancia('− Aluminio', -gn.costos.aluminio) +
        filaGanancia('− Vidrios y placas', -gn.costos.vidrio) +
        (gn.costos.comprado ? filaGanancia('− Lo que comprás hecho (rejas, cortinas)', -gn.costos.comprado) : '') +
        filaGanancia('− Herrajes y accesorios', -gn.costos.herrajes) +
        filaGanancia('− Mano de obra', -gn.costos.manoObra) +
        '<div class="ganancia-detalle__total"><span>Te queda</span><strong>' + F.moneda(gn.ganancia) +
          ' <small>(' + F.numero(gn.porcentaje, 0) + ' %)</small></strong></div>' +
      '</div>' +
      (gn.completa ? '' : '<p class="ganancia__falta">Para que el número sea real, cargá en <strong>Precios</strong>: ' +
        F.escapar(gn.faltan.join(', ')) + '.</p>'));
    h.push('<h3 class="compras-titulo">Materiales para comprar</h3>');
    h.push('<p class="compras-aviso"><strong>Solo para vos:</strong> esto no sale en el presupuesto del cliente. ' +
      'Es aproximado: cada pieza se cuenta con la medida de afuera a afuera, sin los descuentos de cada línea, ' +
      'así que sobra un poco y nunca falta.</p>');

    // Resumen grande
    var kgTxt = '';
    if (t.kg > 0) {
      var alu = precios.aluminio || {};
      var dolar = window.Dolar.guardado();
      var kilo = Number(alu.precio) || 0;
      var kiloArs = alu.moneda === 'ars' ? kilo : (dolar && dolar.venta ? kilo * dolar.venta : 0);
      kgTxt = '<div class="compras-dato"><strong>≈ ' + F.numero(t.kg, 0) + ' kg</strong><span>de aluminio' +
        (t.kgCompleto ? '' : ' (faltan líneas sin peso)') +
        (kiloArs ? ' · ≈ ' + F.moneda(t.kg * kiloArs) : '') + '</span></div>';
    }
    h.push('<div class="compras-resumen">' +
      '<div class="compras-dato"><strong>' + t.barras + (t.barras === 1 ? ' tira' : ' tiras') + '</strong><span>de aluminio de ' + barra + '</span></div>' +
      '<div class="compras-dato"><strong>≈ ' + F.numero(t.metrosSobran, 1) + ' m</strong><span>sobran en retazos</span></div>' +
      (t.m2Vidrio ? '<div class="compras-dato"><strong>' + F.numero(t.m2Vidrio, 2) + ' m²</strong><span>de vidrio o placa</span></div>' : '') +
      kgTxt +
    '</div>');
    if (!t.kg) h.push('<p class="apunte">Para ver los kilos y lo que cuesta el aluminio, cargá el peso por metro de cada línea en <strong>Precios → Líneas</strong>.</p>');

    // Aluminio
    if (m.perfiles.length) {
      h.push('<h3 class="compras-titulo">Aluminio, en tiras de ' + barra + '</h3>');
      var grupoAnterior = '';
      m.perfiles.forEach(function (g) {
        var cab = [g.linea ? 'Línea ' + g.linea : '', g.color].filter(Boolean).join(' · ');
        if (cab !== grupoAnterior) { grupoAnterior = cab; h.push('<p class="compras-grupo">' + F.escapar(cab || 'Sin línea') + '</p>'); }
        h.push('<div class="compras-fila">' +
          '<div class="compras-fila__titulo"><strong>' + F.escapar(g.perfil) + '</strong>' +
            '<b>' + g.barras + (g.barras === 1 ? ' tira' : ' tiras') + '</b></div>' +
          '<span>' + g.piezas + (g.piezas === 1 ? ' pieza' : ' piezas') + ' · se usan ' + metros(g.usadoMm) + ' · sobran ' + metros(g.sobranteMm) + '</span>' +
          retazosTexto(g.retazos) +
          (g.curvas ? '<span class="compras-ojo">Va curvado: ' + g.curvas + (g.curvas === 1 ? ' pieza' : ' piezas') + ' para curvar.</span>' : '') +
          (g.empalmes ? '<span class="compras-ojo">' + g.empalmes + (g.empalmes === 1 ? ' pieza es' : ' piezas son') + ' más larga que la tira: lleva empalme.</span>' : '') +
          (g.kg ? '<span>≈ ' + F.numero(g.kg, 1) + ' kg</span>' : '') +
        '</div>');
      });
    }

    // Vidrios
    if (m.vidrios.length) {
      h.push('<h3 class="compras-titulo">Vidrios y placas</h3>');
      m.vidrios.forEach(function (v) {
        h.push('<div class="compras-fila">' +
          '<div class="compras-fila__titulo"><strong>' + F.escapar(v.vidrio) + '</strong>' +
            '<b>' + F.numero(v.m2, 2) + ' m²</b></div>' +
          '<ul class="compras-panos">' + v.panos.map(function (q) {
            return '<li><b>' + q.cantidad + ' ×</b> ' + cm(q.ancho) + ' × ' + cm(q.alto) + ' cm' +
              (q.especial ? ' <em>(corte ' + ({ inclinada: 'inclinado', triangulo: 'triangular', arco: 'con arco', redonda: 'redondo' }[q.especial] || 'especial') + ')</em>' : '') + '</li>';
          }).join('') + '</ul>' +
        '</div>');
      });
    }

    // Por m²
    if (m.m2.length) {
      h.push('<h3 class="compras-titulo">Por metro cuadrado</h3>');
      m.m2.forEach(function (x) {
        h.push('<div class="compras-fila"><div class="compras-fila__titulo"><strong>' + F.escapar(x.nombre) + '</strong>' +
          '<b>' + F.numero(x.m2, 2) + ' m²</b></div><span>' + x.unidades + (x.unidades === 1 ? ' unidad' : ' unidades') + '</span></div>');
      });
    }

    h.push('<div class="acciones-finales compras-acciones">' +
      '<button class="btn btn--whatsapp btn--grande btn--bloque" id="btn-compras-whatsapp" data-icono="whatsapp">Mandar la lista por WhatsApp</button>' +
      '<button class="btn btn--fantasma btn--bloque" id="btn-compras-copiar" data-icono="copiar">Copiar la lista</button>' +
    '</div>');

    $('compras-cuerpo').innerHTML = h.join('');
    ponerIconos($('compras-cuerpo'));
    $('compras-cuerpo')._texto = textoCompras(m, barra);
    $('modal-compras').hidden = false;
    $('compras-cuerpo').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function filaGanancia(rotulo, valor) {
    return '<div class="ganancia-detalle__fila"><span>' + F.escapar(rotulo) + '</span><span>' +
      (valor < 0 ? '− ' : '') + F.moneda(Math.abs(valor)) + '</span></div>';
  }

  function cerrarCompras() {
    $('modal-compras').hidden = true;
    document.body.style.overflow = '';
  }

  /** La lista en texto, para mandarla al proveedor o guardarla. */
  function textoCompras(m, barra) {
    var L = [];
    var cli = (actual.cliente && actual.cliente.nombre) || '';
    L.push('*Materiales ' + (actual.numero || '') + (cli ? ' — ' + cli : '') + '* (aproximado)');
    if (m.perfiles.length) {
      L.push('', '*Aluminio (tiras de ' + barra + ')*');
      m.perfiles.forEach(function (g) {
        L.push('• ' + [g.linea ? 'Línea ' + g.linea : '', g.perfil, g.color].filter(Boolean).join(' · ') + ': ' +
          g.barras + (g.barras === 1 ? ' tira' : ' tiras') + (g.curvas ? ' (curvado)' : ''));
      });
      L.push('Total: ' + m.totales.barras + ' tiras' + (m.totales.kg ? ' · ≈ ' + F.numero(m.totales.kg, 0) + ' kg' : ''));
    }
    if (m.vidrios.length) {
      L.push('', '*Vidrios y placas*');
      m.vidrios.forEach(function (v) {
        L.push('• ' + v.vidrio + ' (' + F.numero(v.m2, 2) + ' m²):');
        v.panos.forEach(function (q) {
          L.push('   ' + q.cantidad + ' × ' + cm(q.ancho) + ' × ' + cm(q.alto) + ' cm' + (q.especial ? ' (corte especial)' : ''));
        });
      });
    }
    if (m.m2.length) {
      L.push('', '*Por metro cuadrado*');
      m.m2.forEach(function (x) { L.push('• ' + x.nombre + ': ' + F.numero(x.m2, 2) + ' m²'); });
    }
    return L.join('\n');
  }

  /* ════════ Clientes anteriores ════════ */

  function sugerirClientes() {
    var cont = $('sugerencias-clientes');
    var c = actual.cliente || {};
    var lista = A.buscarClientes($('cli-nombre').value, actual.id).filter(function (x) {
      return !(x.nombre === c.nombre && (x.telefono || '') === (c.telefono || ''));   // ya elegido
    }).slice(0, 4);
    if (!lista.length) { cont.hidden = true; return; }

    $('sugerencias-lista').innerHTML = lista.map(function (x, i) {
      var datos = [x.localidad, x.telefono,
                   x.presupuestos + (x.presupuestos === 1 ? ' presupuesto' : ' presupuestos')].filter(Boolean);
      return '<button type="button" class="cliente-sugerido" data-indice="' + i + '">' + I.ui('persona') +
        '<span><strong>' + F.escapar(x.nombre) + '</strong><span>' + F.escapar(datos.join(' · ')) + '</span></span></button>';
    }).join('');
    cont._lista = lista;
    cont.hidden = false;
  }

  function usarCliente(x) {
    $('cli-nombre').value = x.nombre || '';
    $('cli-telefono').value = x.telefono || '';
    $('cli-email').value = x.email || '';
    $('cli-direccion').value = x.direccion || '';
    $('cli-localidad').value = x.localidad || '';
    $('sugerencias-clientes').hidden = true;
    hayCambios = true;
    renderTotales();
    autoguardar();
    avisar('Datos de ' + x.nombre + ' cargados');
  }

  /* ════════ Tu empresa ════════ */

  var CAMPOS_EMPRESA = ['nombre', 'slogan', 'telefono', 'email', 'direccion', 'web'];

  function renderEmpresa() {
    var e = precios.empresa || {};
    CAMPOS_EMPRESA.forEach(function (k) { $('emp-' + k).value = e[k] || ''; });
    var logo = A.cargarLogo();
    $('logo-vista').src = logo || 'logo-alumfer.jpg';
    $('btn-logo-original').hidden = !logo;
  }

  /** Achica la imagen elegida (las fotos del celular pesan varios MB). */
  function prepararLogo(archivo) {
    return new Promise(function (resolver, rechazar) {
      var lector = new FileReader();
      lector.onerror = rechazar;
      lector.onload = function () {
        var img = new Image();
        img.onerror = function () { rechazar(new Error('No es una imagen que se pueda abrir.')); };
        img.onload = function () {
          var escala = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * escala);
          c.height = Math.round(img.naturalHeight * escala);
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#fff';            // sale sobre papel blanco
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolver(c.toDataURL('image/jpeg', 0.9));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(archivo);
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
      if (ev.key === 'Escape' && !$('modal-listo').hidden) cerrarListo();
      if (ev.key === 'Escape' && !$('modal-opciones').hidden) cerrarOpciones();
      if (ev.key === 'Escape' && !$('modal-compras').hidden) cerrarCompras();
    });

    var lista = $('lista-items');

    lista.addEventListener('input', function (ev) {
      var nodo = ev.target.closest('.item');
      if (!nodo) return;
      var item = itemPorId(nodo.dataset.id);
      if (!item) return;
      var campo = ev.target.dataset.campo;

      if (ev.target.dataset.adicionalFamilia) {
        var fam = ev.target.dataset.adicionalFamilia;
        var miembros = preciosDelPresupuesto().adicionales.filter(function (x) { return x.familia === fam; })
          .map(function (x) { return x.id; });
        item.adicionales = (item.adicionales || []).filter(function (id) { return miembros.indexOf(id) === -1; });
        if (ev.target.checked && miembros.length) item.adicionales.push(miembros[0]);
        hayCambios = true;
        render();          // muestra u oculta la pregunta del tipo
        autoguardar();
        return;
      }
      if (ev.target.dataset.adicional) {
        var id = ev.target.dataset.adicional;
        item.adicionales = item.adicionales || [];
        var i = item.adicionales.indexOf(id);
        if (ev.target.checked && i === -1) item.adicionales.push(id);
        if (!ev.target.checked && i > -1) item.adicionales.splice(i, 1);
        ev.target.closest('.extra').classList.toggle('is-activo', ev.target.checked);
      } else if (campo === 'anchoCm') {
        item.ancho = F.aNumero(ev.target.value) * 10;
        if (C.formaDe(item) === 'redonda') item.alto = item.ancho;
      } else if (campo === 'altoCm') {
        item.alto = F.aNumero(ev.target.value) * 10;
      } else if (campo === 'alto2Cm') {
        item.alto2 = F.aNumero(ev.target.value) * 10;
      } else if (campo === 'lugar') {
        item.lugar = ev.target.value.trim();
        nodo.querySelectorAll('.lugar').forEach(function (b) {
          var activa = b.dataset.lugar === item.lugar;
          b.classList.toggle('is-activa', activa);
          b.setAttribute('aria-pressed', activa);
        });
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
      var tocado = ev.target.closest('[data-forma],[data-vidrio],[data-lugar],[data-tono],[data-adicional-tipo]');
      if (tocado) {
        var itx = itemPorId(tocado.closest('.item').dataset.id);
        if (!itx) return;
        if (tocado.dataset.forma) {
          itx.forma = tocado.dataset.forma;
          var pp = preciosDelPresupuesto();
          if (!pp.formas) pp.formas = clonar(precios.formas || []);   // presupuesto anterior a las formas
          if (itx.forma === 'inclinada' && !itx.alto2) itx.alto2 = Math.round(itx.alto * 0.7 / 10) * 10;
          if (itx.forma === 'redonda') itx.alto = itx.ancho;
        } else if (tocado.dataset.vidrio) {
          itx.vidrioId = tocado.dataset.vidrio;
          if (/^policarb/.test(itx.vidrioId) && !itx.tono) itx.tono = TONOS_PLACA[0];
        } else if (tocado.dataset.tono) {
          itx.tono = tocado.dataset.tono;
        } else if (tocado.dataset.adicionalTipo) {
          var famT = tocado.dataset.familia;
          var deFam = preciosDelPresupuesto().adicionales.filter(function (x) { return x.familia === famT; })
            .map(function (x) { return x.id; });
          itx.adicionales = (itx.adicionales || []).filter(function (id) { return deFam.indexOf(id) === -1; });
          itx.adicionales.push(tocado.dataset.adicionalTipo);
        } else {
          itx.lugar = itx.lugar === tocado.dataset.lugar ? '' : tocado.dataset.lugar;   // tocar de nuevo lo saca
        }
        hayCambios = true;
        render();
        autoguardar();
        return;
      }
      var variante = ev.target.closest('[data-variante]');
      if (variante) {
        var iv = itemPorId(variante.closest('.item').dataset.id);
        if (iv && iv.tipologiaId !== variante.dataset.variante && cambiarTipologia(iv, variante.dataset.variante)) {
          hayCambios = true;
          render();
          autoguardar();
        }
        return;
      }
      var elegir = ev.target.closest('[data-elegir]');
      if (elegir) {
        var it = itemPorId(elegir.closest('.item').dataset.id);
        if (it) abrirOpciones(it, elegir.dataset.elegir);
        return;
      }
      var boton = ev.target.closest('button[data-accion]');
      if (!boton) return;
      var nodo = boton.closest('.item');
      var item = itemPorId(nodo.dataset.id);
      if (!item) return;

      if (boton.dataset.accion === 'cambiar-tipo') {
        return abrirSelectorTipo(item.id);
      }
      if (boton.dataset.accion === 'abrir-item') {
        itemAbierto = item.id;
        render();
        mostrarItem(item.id);
        return;
      }
      if (boton.dataset.accion === 'vidrio-a-todas') {
        var n = aplicarATodas('vidrioId', item, item.vidrioId);
        hayCambios = true;
        render();
        autoguardar();
        avisar('Vidrio cambiado en ' + (n === 1 ? 'otra abertura' : 'otras ' + n));
        return;
      }
      if (boton.dataset.accion === 'listo') {
        itemAbierto = null;
        render();
        mostrarItem(item.id);
        avisar((codigosActuales[actual.items.indexOf(item)] || 'Abertura') + ' lista');
        return;
      }
      if (boton.dataset.accion === 'mas' || boton.dataset.accion === 'menos') {
        item.cantidad = Math.max(1, (Math.round(item.cantidad) || 1) + (boton.dataset.accion === 'mas' ? 1 : -1));
        nodo.querySelector('[data-campo="cantidad"]').value = item.cantidad;
        hayCambios = true;
        refrescarCalculos();
        autoguardar();
        return;
      }
      if (boton.dataset.accion === 'duplicar') {
        var copia = clonar(item);
        copia.id = idUnico('it_');
        actual.items.splice(actual.items.indexOf(item) + 1, 0, copia);
        itemAbierto = itemQueEntra = copia.id;   // queda abierta la copia, lista para cambiarle la medida
        render();
        mostrarItem(copia.id);
        avisar('Agregada otra igual: cambiale lo que haga falta');
      } else if (boton.dataset.accion === 'borrar') {
        var tip = C.buscar(preciosDelPresupuesto().tipologias, item.tipologiaId);
        if (!confirm('¿Quitar "' + (tip ? tip.nombre : 'esta abertura') + '" del presupuesto?')) return;
        actual.items.splice(actual.items.indexOf(item), 1);
        if (itemAbierto === item.id) itemAbierto = null;
        render();
        avisar('Abertura quitada');
      }
      hayCambios = true;
      autoguardar();
    });

    $('btn-pdf').addEventListener('click', descargarPdf);
    $('btn-pdf-fijo').addEventListener('click', descargarPdf);
    $('btn-whatsapp').addEventListener('click', enviarWhatsapp);
    $('btn-whatsapp-fijo').addEventListener('click', enviarWhatsapp);
    $('btn-email').addEventListener('click', enviarEmail);
    $('btn-whatsapp-texto').addEventListener('click', whatsappSoloTexto);
    $('btn-imprimir').addEventListener('click', imprimir);

    $('btn-listo').addEventListener('click', function () {
      var accion = alTocarListo;
      cerrarListo();
      if (accion) accion();
    });
    $('btn-listo-cancelar').addEventListener('click', cerrarListo);

    $('btn-cerrar-opciones').addEventListener('click', cerrarOpciones);

    $('btn-compras').addEventListener('click', abrirCompras);
    $('btn-cerrar-compras').addEventListener('click', cerrarCompras);
    $('modal-compras').addEventListener('click', function (ev) {
      if (ev.target === $('modal-compras')) return cerrarCompras();
      var texto = $('compras-cuerpo')._texto || '';
      if (ev.target.closest('#btn-compras-whatsapp')) {
        // Sin número: WhatsApp pregunta a quién (al proveedor, o a uno mismo para tenerla).
        window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
      }
      if (ev.target.closest('#btn-compras-copiar')) {
        copiar(texto.replace(/\*/g, ''))
          .then(function () { avisar('Lista copiada'); })
          .catch(function () { avisar('No se pudo copiar automáticamente.', 'error'); });
      }
    });
    $('modal-opciones').addEventListener('click', function (ev) {
      if (ev.target === $('modal-opciones')) return cerrarOpciones();
      var op = ev.target.closest('[data-opcion]');
      if (op) elegirOpcion(op.dataset.opcion);
    });
    $('modal-listo').addEventListener('click', function (ev) { if (ev.target === $('modal-listo')) cerrarListo(); });

    // Clientes anteriores
    $('cli-nombre').addEventListener('input', sugerirClientes);
    $('cli-telefono').addEventListener('input', function () { if (!$('sugerencias-clientes').hidden) sugerirClientes(); });
    $('sugerencias-lista').addEventListener('click', function (ev) {
      var boton = ev.target.closest('.cliente-sugerido');
      var lista = $('sugerencias-clientes')._lista || [];
      if (boton && lista[Number(boton.dataset.indice)]) usarCliente(lista[Number(boton.dataset.indice)]);
    });

    $('btn-copiar').addEventListener('click', function () {
      var p = preciosDelPresupuesto();
      var texto = D.texto(actual, C.calcularPresupuesto(actual, p), p);
      copiar(texto)
        .then(function () { avisar('Resumen copiado'); })
        .catch(function () { avisar('No se pudo copiar automáticamente.', 'error'); });
    });

    // Anteriores
    $('buscar-historial').addEventListener('input', function () { renderHistorial(); });

    $('lista-llamar').addEventListener('click', function (ev) {
      var boton = ev.target.closest('button[data-accion]');
      if (!boton) return;
      var p = A.obtener(boton.closest('.llamar-fila').dataset.id);
      if (!p) return;
      var accion = boton.dataset.accion;
      if (accion === 'seguir') {
        var tel = F.telefonoWhatsapp(p.cliente && p.cliente.telefono);
        window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(mensajeSeguimiento(p)), '_blank');
        p.ultimoSeguimiento = new Date().toISOString();       // vuelve a aparecer si sigue sin contestar
      } else if (accion === 'acepto') {
        p.estado = 'aceptado';
        avisar('¡Bien! Quedó como aceptado');
      } else if (accion === 'no-acepto') {
        p.estado = 'rechazado';
        avisar('Quedó como no aceptado');
      } else if (accion === 'luego') {
        p.llamarDesde = new Date(Date.now() + 2 * DIA).toISOString();
        avisar('Te lo vuelvo a mostrar en 2 días');
      }
      A.guardar(p);
      // Si está abierto en la pantalla principal, que el guardado automático no lo pise.
      if (actual && actual.id === p.id) {
        ['estado', 'ultimoSeguimiento', 'llamarDesde'].forEach(function (k) { actual[k] = p[k]; });
        $('pre-estado').value = p.estado;
      }
      renderHistorial();
    });

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

    $('btn-exportar').addEventListener('click', guardarCopia);
    $('btn-copia-aviso').addEventListener('click', guardarCopia);
    $('btn-copia-luego').addEventListener('click', function () {
      anotarCopia({ luegoHasta: new Date(Date.now() + 2 * DIA).toISOString() });
      $('aviso-copia').hidden = true;
    });
    $('btn-guardar').addEventListener('click', guardarConAviso);

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
    $('tabla-formas').addEventListener('input', function (ev) {
      var i = ev.target.dataset.formaI;
      if (i == null || !precios.formas[i]) return;
      precios.formas[i].recargo = F.aNumero(ev.target.value) / 100;
      guardarPrecios();
    });

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

    $('btn-dolar').addEventListener('click', function () { cargarDolar(true); });

    ['alu-precio', 'alu-moneda'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        clearTimeout(relojAluminio);
        relojAluminio = setTimeout(guardarAluminio, 700);
      });
    });

    $('btn-restaurar-precios').addEventListener('click', function () {
      if (!confirm('¿Volver a los precios originales? Se pierden los valores que cargaste.')) return;
      var empresa = precios.empresa;     // los datos de la empresa no son precios: se conservan
      precios = A.restaurarPrecios();
      precios.empresa = empresa;
      A.guardarPrecios(precios);
      renderPrecios();
      avisar('Precios originales restaurados');
    });

    ['gen-herrajes', 'gen-mano-obra', 'gen-dias-llamar'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        precios.generales.costoHerrajes = F.aNumero($('gen-herrajes').value);
        precios.generales.costoManoObra = F.aNumero($('gen-mano-obra').value);
        precios.generales.diasSeguimiento = Math.max(1, Math.round(F.aNumero($('gen-dias-llamar').value)) || 3);
        A.guardarPrecios(precios);      // no son precios de venta
        marcarGuardado('precios-guardado');
      });
    });

    ['gen-barra', 'gen-corte'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        // No son precios: no marcan los presupuestos como calculados con precios viejos.
        precios.generales.largoBarra = Math.round(F.aNumero($('gen-barra').value) * 1000) || 6000;
        precios.generales.corteSierra = F.aNumero($('gen-corte').value);
        A.guardarPrecios(precios);
      });
    });

    ['gen-min-m2', 'gen-redondeo', 'gen-plazo', 'gen-pago'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        precios.generales.minM2Global = F.aNumero($('gen-min-m2').value);
        precios.generales.redondeo = F.aNumero($('gen-redondeo').value);
        precios.generales.plazoEntrega = $('gen-plazo').value;
        precios.generales.formaPago = $('gen-pago').value;
        guardarPrecios();
      });
    });

    // Tu empresa: no son precios, así que no marcan los presupuestos como desactualizados.
    CAMPOS_EMPRESA.forEach(function (k) {
      $('emp-' + k).addEventListener('input', function () {
        precios.empresa[k] = $('emp-' + k).value.trim();
        if (k === 'telefono') precios.empresa.whatsapp = F.telefonoWhatsapp(precios.empresa.telefono);
        A.guardarPrecios(precios);
        marcarGuardado('empresa-guardado');
      });
    });

    $('btn-logo').addEventListener('click', function () { $('archivo-logo').click(); });
    $('archivo-logo').addEventListener('change', function (ev) {
      var archivo = ev.target.files[0];
      ev.target.value = '';
      if (!archivo) return;
      prepararLogo(archivo).then(function (dataUrl) {
        if (!A.guardarLogo(dataUrl)) throw new Error('No hay lugar para guardar la imagen en este teléfono.');
        renderEmpresa();
        marcarGuardado('empresa-guardado');
        avisar('Logo cambiado: así va a salir en los presupuestos');
      }).catch(function (e) { avisar(e.message || 'No se pudo usar esa imagen.', 'error'); });
    });
    $('btn-logo-original').addEventListener('click', function () {
      if (!confirm('¿Volver al logo de Alumfer?')) return;
      A.guardarLogo('');
      renderEmpresa();
      avisar('Logo de Alumfer restaurado');
    });

    // Atajos
    document.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey)) return;
      if (ev.key === 's') { ev.preventDefault(); guardarConAviso(); }
      if (ev.key === 'p') { ev.preventDefault(); imprimir(); }
    });

    window.addEventListener('beforeunload', function (ev) {
      if (!hayCambios || !actual.items.length) return;
      ev.preventDefault();
      ev.returnValue = '';
    });
  }

  /* ════════ Versiones: cómo llega una actualización ════════ */

  /**
   * La app se actualiza sola, pero avisando: cuando el navegador baja una
   * versión nueva, queda esperando y aparece la franja azul. Recién al tocar
   * Actualizar se activa y se recarga la pantalla, así nunca se cambia la app
   * por debajo mientras se está cargando un presupuesto.
   */
  function configurarActualizaciones() {
    if (!('serviceWorker' in navigator)) return;
    var enEspera = null;
    var recargando = false;

    function avisarVersionNueva(worker) {
      enEspera = worker;
      $('actualizar-app').hidden = false;
    }

    function mostrarVersion(registro) {
      var activo = registro.active || navigator.serviceWorker.controller;
      if (!activo || !window.MessageChannel) return;
      var canal = new MessageChannel();
      canal.port1.onmessage = function (ev) { $('version-app').textContent = 'Versión ' + ev.data; };
      activo.postMessage({ tipo: 'VERSION' }, [canal.port2]);
    }

    navigator.serviceWorker.register('sw.js').then(function (registro) {
      mostrarVersion(registro);

      // Ya había una versión nueva esperando de una visita anterior.
      if (registro.waiting && navigator.serviceWorker.controller) avisarVersionNueva(registro.waiting);

      registro.addEventListener('updatefound', function () {
        var nuevo = registro.installing;
        if (!nuevo) return;
        nuevo.addEventListener('statechange', function () {
          // Sin controller es la primera instalación, no una actualización.
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisarVersionNueva(nuevo);
        });
      });

      // Buscar novedades al abrir y cada vez que se vuelve a la app.
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) registro.update().catch(function () {});
      });
    }).catch(function (e) {
      console.warn('Sin modo offline:', e);
    });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (recargando) return;
      recargando = true;
      window.location.reload();
    });

    $('btn-actualizar-app').addEventListener('click', function () {
      $('btn-actualizar-app').textContent = 'Actualizando…';
      if (enEspera) enEspera.postMessage({ tipo: 'ACTUALIZAR' });
      else window.location.reload();
    });
  }

  /* ════════ Instalar en el celular ════════ */

  var CLAVE_INSTALAR = 'alumfer.instalar.oculto';
  var promptInstalar = null;

  /**
   * En Android el navegador avisa cuándo se puede instalar (beforeinstallprompt).
   * En iPhone no existe ese aviso, así que se explican los dos toques a mano.
   */
  function configurarInstalacion() {
    var franja = $('instalar');
    var yaEsApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    var rechazada = false;
    try { rechazada = window.localStorage.getItem(CLAVE_INSTALAR) === '1'; } catch (e) {}
    if (yaEsApp || rechazada) return;

    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      $('instalar-texto').textContent = 'Para tenerla como app: tocá Compartir y después "Agregar a inicio".';
      $('btn-instalar').hidden = true;
      franja.hidden = false;
    }

    window.addEventListener('beforeinstallprompt', function (ev) {
      ev.preventDefault();
      promptInstalar = ev;
      $('btn-instalar').hidden = false;
      franja.hidden = false;
    });

    $('btn-instalar').addEventListener('click', function () {
      if (!promptInstalar) return;
      promptInstalar.prompt();
      promptInstalar.userChoice.then(function () {
        promptInstalar = null;
        franja.hidden = true;
      });
    });

    $('btn-instalar-no').addEventListener('click', function () {
      franja.hidden = true;
      try { window.localStorage.setItem(CLAVE_INSTALAR, '1'); } catch (e) {}
    });

    window.addEventListener('appinstalled', function () {
      franja.hidden = true;
      avisar('Listo: ya la tenés como app');
    });
  }

  /* ════════ Arranque ════════ */

  function iniciar() {
    if (!A.disponible) $('aviso-almacenamiento').hidden = false;
    // Que el navegador no borre los datos solo cuando le falta espacio.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    ponerIconos();
    ayudaEntrega();
    configurarActualizaciones();
    configurarInstalacion();
    renderPrecios();
    renderHistorial();
    cargarDolar(false);
    var ultimos = A.listar();
    abrir(ultimos.length && ultimos[0].estado === 'borrador' ? ultimos[0] : presupuestoNuevo());
    conectarEventos();
    revisarCopia();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
