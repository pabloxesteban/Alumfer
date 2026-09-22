/* ============================================================
   ALUMFER — Presupuestos · Formato de números, fechas y texto
   ============================================================ */

window.Formato = (function () {
  'use strict';

  var fmtMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  var fmtNumero = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  function moneda(n) {
    if (!isFinite(n)) n = 0;
    return fmtMoneda.format(Math.round(n));
  }

  function numero(n, decimales) {
    if (!isFinite(n)) n = 0;
    if (decimales == null) return fmtNumero.format(n);
    return n.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  }

  /** Acepta "1.234,56", "1234.56", "$ 1.234" y devuelve Number. */
  function aNumero(valor) {
    if (typeof valor === 'number') return isFinite(valor) ? valor : 0;
    if (valor == null) return 0;
    var s = String(valor).trim().replace(/[^0-9.,-]/g, '');
    if (!s) return 0;
    var ultimaComa = s.lastIndexOf(','), ultimoPunto = s.lastIndexOf('.');
    if (ultimaComa > -1 && ultimaComa > ultimoPunto) {
      s = s.replace(/\./g, '').replace(',', '.');      // formato es-AR
    } else if (ultimaComa > -1 && ultimoPunto > ultimaComa) {
      s = s.replace(/,/g, '');                          // formato en-US
    } else if (ultimaComa > -1) {
      s = s.replace(',', '.');                          // única coma: es el decimal
    } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');                         // 1.234.567 → separador de miles
    }
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  function medidas(anchoMm, altoMm) {
    return numero(anchoMm, 0) + ' × ' + numero(altoMm, 0) + ' mm';
  }

  function fechaISO(d) {
    var f = d ? new Date(d) : new Date();
    var mes = String(f.getMonth() + 1).padStart(2, '0');
    var dia = String(f.getDate()).padStart(2, '0');
    return f.getFullYear() + '-' + mes + '-' + dia;
  }

  function fechaLarga(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    var f = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function fechaCorta(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function sumarDias(iso, dias) {
    var p = String(iso).slice(0, 10).split('-');
    var f = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    f.setDate(f.getDate() + Number(dias || 0));
    return fechaISO(f);
  }

  /** Deja solo dígitos y antepone 54 si el número parece argentino sin prefijo. */
  function telefonoWhatsapp(tel) {
    var d = String(tel || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.indexOf('54') === 0) return d;
    if (d.indexOf('0') === 0) d = d.slice(1);
    if (d.length >= 10 && d.indexOf('15') === 2) d = d.slice(0, 2) + d.slice(4); // 11 15 xxxx xxxx
    return '549' + d;
  }

  function escapar(txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return {
    moneda: moneda, numero: numero, aNumero: aNumero, medidas: medidas,
    fechaISO: fechaISO, fechaLarga: fechaLarga, fechaCorta: fechaCorta,
    sumarDias: sumarDias, telefonoWhatsapp: telefonoWhatsapp, escapar: escapar
  };
})();
