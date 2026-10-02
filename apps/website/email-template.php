<?php
/**
 * ============================================================
 *  ALUMFER — Sistema de diseño de emails (componentes reutilizables)
 * ------------------------------------------------------------
 *  Extiende la identidad visual del sitio (alumfer.com.ar) a los
 *  correos: hormigón + carbón + azul aluminio, tipografía Inter,
 *  regla azul de identidad y wordmark "ALUMFER".
 *
 *  Compatible con Gmail, Outlook (desktop/365), Apple Mail, Yahoo
 *  y clientes mobile. HTML basado en tablas + estilos inline,
 *  600px, botones a prueba de Outlook y soporte de dark mode.
 *
 *  Usado por enviar.php para construir:
 *   - Notificación al administrador
 *   - Confirmación al cliente
 * ============================================================
 */

/* ─── Marca ─────────────────────────────────────────────── */
const ALF_SITE       = 'https://alumfer.com.ar';
const ALF_WA_NUMBER  = '5491163368643';
const ALF_WA_LINK    = 'https://wa.me/5491163368643?text=Hola%2C%20quiero%20pedir%20un%20presupuesto';
const ALF_EMAIL      = 'alumfercarpinteria@gmail.com';
const ALF_PHONE_DISP = '(011) 6336-8643';
const ALF_ADDRESS    = 'Av. San Martín 734, Adrogué, Buenos Aires';
const ALF_IG         = 'https://www.instagram.com/alumfercarpinteria/';
const ALF_FB         = 'https://www.facebook.com/alumfercarpinteria/';

/* ─── Paleta (espejo de tokens.css) ─────────────────────── */
const ALF_CARBON     = '#1A1C1E';
const ALF_STEEL      = '#2E3338';
const ALF_CONCRETE   = '#B0A99A';
const ALF_CONC_LIGHT = '#E8E4DC';
const ALF_CONC_FAINT = '#F5F4F1';
const ALF_BLUE       = '#1B6CC8';
const ALF_BLUE_LIGHT = '#4A9DE8';
const ALF_BLUE_FAINT = '#D6E8F7';
const ALF_TEXT       = '#5A5A55';
const ALF_HEADING    = '#1A1C1E';
const ALF_WA         = '#128C7E';

const ALF_FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ============================================================
 *  COMPONENTES
 * ========================================================== */

/** Etiqueta "eyebrow": azul, mayúsculas, tracking (igual que .eyebrow del sitio). */
function em_eyebrow(string $text): string {
    return '<p style="margin:0 0 10px;font-family:' . ALF_FONT . ';font-size:12px;'
        . 'font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:' . ALF_BLUE . ';">'
        . htmlspecialchars($text, ENT_QUOTES, 'UTF-8') . '</p>';
}

/** Título principal del cuerpo. */
function em_h1(string $text): string {
    return '<h1 style="margin:0 0 16px;font-family:' . ALF_FONT . ';font-size:26px;line-height:1.25;'
        . 'font-weight:700;letter-spacing:-0.02em;color:' . ALF_HEADING . ';">'
        . htmlspecialchars($text, ENT_QUOTES, 'UTF-8') . '</h1>';
}

/** Párrafo de cuerpo (acepta HTML ya seguro). */
function em_p(string $html, string $extra = ''): string {
    return '<p style="margin:0 0 18px;font-family:' . ALF_FONT . ';font-size:15px;line-height:1.7;'
        . 'color:' . ALF_TEXT . ';' . $extra . '">' . $html . '</p>';
}

/** Título de sección con la regla azul de identidad a la izquierda. */
function em_section_title(string $text): string {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 14px;"><tr>'
        . '<td width="3" style="background:' . ALF_BLUE . ';width:3px;font-size:0;line-height:0;">&nbsp;</td>'
        . '<td style="padding-left:12px;font-family:' . ALF_FONT . ';font-size:12px;font-weight:600;'
        . 'letter-spacing:0.12em;text-transform:uppercase;color:' . ALF_HEADING . ';">'
        . htmlspecialchars($text, ENT_QUOTES, 'UTF-8') . '</td></tr></table>';
}

/** Separador sutil. */
function em_divider(): string {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
        . '<tr><td style="border-top:1px solid ' . ALF_CONC_LIGHT . ';font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>'
        . '</table>';
}

/**
 * Botón a prueba de clientes (padding en el <td> → Outlook lo respeta).
 * $variant: primary | whatsapp | ghost
 */
function em_button(string $label, string $url, string $variant = 'primary'): string {
    switch ($variant) {
        case 'whatsapp': $bg = ALF_WA;    $fg = '#ffffff'; $bd = ALF_WA;    break;
        case 'ghost':    $bg = '#ffffff'; $fg = ALF_HEADING; $bd = '#D8D5CD'; break;
        default:         $bg = ALF_BLUE;  $fg = '#ffffff'; $bd = ALF_BLUE;  break;
    }
    $label = htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
    $url   = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 6px 10px 0;display:inline-block;vertical-align:top;"><tr>'
        . '<td align="center" bgcolor="' . $bg . '" style="border-radius:8px;border:1px solid ' . $bd . ';">'
        . '<a href="' . $url . '" target="_blank" style="display:inline-block;padding:13px 26px;font-family:' . ALF_FONT . ';'
        . 'font-size:14px;font-weight:600;line-height:1;color:' . $fg . ';text-decoration:none;border-radius:8px;">'
        . $label . '</a></td></tr></table>';
}

/**
 * Bloque de datos etiqueta/valor (para la notificación al admin).
 * $rows = [ ['label'=>'', 'value'=>'(HTML seguro)'], ... ]
 */
function em_data_table(array $rows): string {
    $out = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
         . 'style="border:1px solid ' . ALF_CONC_LIGHT . ';border-radius:12px;overflow:hidden;">';
    $n = count($rows);
    foreach (array_values($rows) as $i => $r) {
        $bg     = ($i % 2 === 0) ? '#FBFAF8' : '#ffffff';
        $border = ($i < $n - 1) ? 'border-bottom:1px solid ' . ALF_CONC_LIGHT . ';' : '';
        $out .= '<tr><td style="background:' . $bg . ';padding:13px 18px;' . $border . '">'
            . '<p style="margin:0 0 3px;font-family:' . ALF_FONT . ';font-size:11px;font-weight:600;'
            . 'letter-spacing:0.08em;text-transform:uppercase;color:' . ALF_CONCRETE . ';">'
            . htmlspecialchars($r['label'], ENT_QUOTES, 'UTF-8') . '</p>'
            . '<div style="font-family:' . ALF_FONT . ';font-size:15px;line-height:1.55;color:' . ALF_HEADING . ';">'
            . $r['value'] . '</div></td></tr>';
    }
    return $out . '</table>';
}

/** Caja destacada (p. ej. el mensaje del cliente) con regla azul. */
function em_quote_box(string $html): string {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        . 'style="background:' . ALF_CONC_FAINT . ';border-left:3px solid ' . ALF_BLUE . ';border-radius:8px;">'
        . '<tr><td style="padding:16px 20px;font-family:' . ALF_FONT . ';font-size:15px;line-height:1.7;color:' . ALF_TEXT . ';">'
        . $html . '</td></tr></table>';
}

/** Espaciador vertical. */
function em_spacer(int $h = 24): string {
    return '<div style="line-height:' . $h . 'px;height:' . $h . 'px;font-size:0;">&nbsp;</div>';
}

/* ============================================================
 *  SHELL (header + cuerpo + footer)
 * ========================================================== */
function em_shell(string $preheader, string $content): string {
    $year     = date('Y');
    $font     = ALF_FONT;
    $pre      = htmlspecialchars($preheader, ENT_QUOTES, 'UTF-8');

    return <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="es" xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Alumfer</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    html,body{margin:0!important;padding:0!important;width:100%!important;}
    *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;}
    a{text-decoration:none;}
    @media only screen and (max-width:620px){
      .alf-container{width:100%!important;}
      .alf-pad{padding-left:24px!important;padding-right:24px!important;}
      .alf-h1{font-size:23px!important;}
      .alf-stack{display:block!important;width:100%!important;}
    }
    @media (prefers-color-scheme: dark){
      .alf-bg{background:#15171a!important;}
      .alf-card{background:#1f2326!important;}
      .alf-card h1,.alf-card h2{color:#ffffff!important;}
      .alf-card p,.alf-card div,.alf-card td{color:#cfcdc7!important;}
      .alf-quote{background:#26292d!important;}
      .alf-data td{background:#1f2326!important;}
      .alf-muted{color:#8a8a85!important;}
    }
  </style>
</head>
<body class="alf-bg" style="margin:0;padding:0;background:#F5F4F1;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F5F4F1;opacity:0;">$pre&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="alf-bg" style="background:#F5F4F1;">
    <tr><td align="center" style="padding:28px 12px;">

      <!-- Contenedor 600px -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="alf-container" style="width:600px;max-width:600px;">

        <!-- ░░ HEADER ░░ -->
        <tr>
          <td bgcolor="#1A1C1E" style="background:#1A1C1E;border-radius:16px 16px 0 0;padding:26px 36px;" class="alf-pad">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;">
                <img src="https://alumfer.com.ar/email/alumfer-logo-blanco.png" width="216" height="39" alt="ALUMFER" style="display:block;width:216px;height:39px;border:0;outline:none;font-family:$font;font-size:16px;font-weight:700;letter-spacing:0.16em;color:#ffffff;">
              </td>
              <td align="right" style="vertical-align:middle;font-family:$font;font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.55);">
                Aberturas a medida
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- ░░ BANDA AZUL DE IDENTIDAD ░░ -->
        <tr><td style="background:#1B6CC8;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- ░░ CUERPO ░░ -->
        <tr>
          <td class="alf-card alf-pad" style="background:#ffffff;padding:38px 36px 32px;">
            $content
          </td>
        </tr>

        <!-- ░░ FOOTER ░░ -->
        <tr>
          <td class="alf-pad" style="background:#1A1C1E;border-radius:0 0 16px 16px;padding:30px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding-bottom:16px;">
                <div style="font-family:$font;font-size:16px;font-weight:700;letter-spacing:0.16em;color:#ffffff;">ALUMFER</div>
                <div style="font-family:$font;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.55);padding-top:8px;">
                  Fabricantes de aberturas de aluminio a medida en Adrogué, Buenos Aires.
                </div>
              </td></tr>
              <tr><td style="border-top:1px solid rgba(255,255,255,0.10);padding-top:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td class="alf-stack" style="vertical-align:top;font-family:$font;font-size:12px;line-height:1.9;color:rgba(255,255,255,0.65);">
                    <a href="https://wa.me/5491163368643" target="_blank" style="color:#4A9DE8;">WhatsApp · (011) 6336-8643</a><br>
                    <a href="mailto:alumfercarpinteria@gmail.com" style="color:rgba(255,255,255,0.65);">alumfercarpinteria@gmail.com</a><br>
                    <span class="alf-muted" style="color:rgba(255,255,255,0.45);">Av. San Martín 734, Adrogué</span>
                  </td>
                  <td class="alf-stack" align="right" style="vertical-align:top;font-family:$font;font-size:12px;line-height:1.9;">
                    <a href="https://alumfer.com.ar" target="_blank" style="color:#4A9DE8;">alumfer.com.ar</a><br>
                    <a href="https://www.instagram.com/alumfercarpinteria/" target="_blank" style="color:rgba(255,255,255,0.65);">Instagram</a> &nbsp;·&nbsp;
                    <a href="https://www.facebook.com/alumfercarpinteria/" target="_blank" style="color:rgba(255,255,255,0.65);">Facebook</a>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding-top:18px;font-family:$font;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.35);">
                © $year Alumfer. Todos los derechos reservados.<br>
                Recibiste este correo porque te contactaste con Alumfer a través de alumfer.com.ar.
              </td></tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}

/* ============================================================
 *  EMAIL AL CLIENTE — "Ficha de consulta"
 * ------------------------------------------------------------
 *  Formato de carta: fecha y lugar, saludo con nombre, cómo
 *  sigue el proceso (seguimiento tipo envío) y un cajetín como
 *  el de un plano de obra con los datos de la consulta.
 *  Las imágenes viven en /email/ del sitio; si el cliente de
 *  correo las bloquea, todo el contenido sigue legible en texto.
 * ========================================================== */

const ALF_FONT_HEAD = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Fecha en castellano: "2 de octubre de 2026". */
function em_fecha_larga(int $ts): string {
    $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
              'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return date('j', $ts) . ' de ' . $meses[(int)date('n', $ts) - 1] . ' de ' . date('Y', $ts);
}

/** "tus ventanas", "tu proyecto"… según el tipo de trabajo del formulario. */
function em_tipo_frase(string $tipo): string {
    $map = [
        'ventanas'      => 'tus ventanas',
        'puertas'       => 'tus puertas',
        'mosquiteros'   => 'tus mosquiteros',
        'policarbonato' => 'tu techo de policarbonato',
    ];
    return $map[mb_strtolower(trim($tipo), 'UTF-8')] ?? 'tu proyecto';
}

/**
 * $d = [
 *   'nombre'    => string (crudo),
 *   'tipo'      => string (crudo),
 *   'localidad' => string (crudo, puede ser ''),
 *   'consulta'  => string (crudo),
 *   'numero'    => string, p. ej. "261002-1435",
 *   'ts'        => int (timestamp de recepción),
 * ]
 */
function em_cliente(array $d): string {
    $h = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

    $nombre    = $h(trim(preg_split('/\s+/', trim($d['nombre']))[0] ?? ''));
    $nombreFull = $h($d['nombre']);
    $tipoRaw   = trim($d['tipo']);
    $tipo      = ($tipoRaw === '' || mb_strtolower($tipoRaw, 'UTF-8') === 'otros') ? 'A definir' : $h($tipoRaw);
    $frase     = em_tipo_frase($tipoRaw);
    $localidad = trim($d['localidad']) !== '' ? $h($d['localidad']) : 'A confirmar';
    $mensaje   = nl2br($h($d['consulta']));
    $numero    = $h($d['numero']);
    $fechaL    = em_fecha_larga($d['ts']);
    $fechaC    = date('d.m.Y', $d['ts']);
    $year      = date('Y', $d['ts']);

    $mailto = 'mailto:' . ALF_EMAIL . '?subject=' . rawurlencode('Consulta N° ' . $d['numero'] . ' — fotos y medidas');
    $wa     = 'https://wa.me/' . ALF_WA_NUMBER . '?text=' . rawurlencode('Hola, les escribo por la consulta N° ' . $d['numero'] . '.');
    $mailto = $h($mailto);
    $wa     = $h($wa);

    $site   = ALF_SITE;
    $fh     = ALF_FONT_HEAD;
    $fb     = ALF_FONT;
    $pre    = $h('Te contactamos dentro de las próximas 24 horas hábiles. Consulta N° ' . $d['numero'] . '.');

    /* Paleta propia del email (más contraste que la del sitio sobre papel claro) */
    $ink   = '#1A1C1E';   // títulos
    $text  = '#45474A';   // cuerpo
    $muted = '#857E72';   // etiquetas (concreto oscurecido: AA sobre blanco)
    $rule  = '#DCD7CD';   // líneas finas
    $paper = '#FFFFFF';
    $outer = '#ECE9E3';
    $blue  = ALF_BLUE;

    /* Seguimiento: 4 pasos reales del proceso (ver FAQ del sitio) */
    $pasos = [
        ['01', 'Consulta recibida', 'Hoy',                      true],
        ['02', 'Te contactamos',    'Antes de 24 hs hábiles',  false],
        ['03', 'Visita y medición', 'Sin cargo',               false],
        ['04', 'Fabricación',       '1 a 3 semanas',           false],
    ];
    $track = '';
    foreach ($pasos as $i => [$n, $t, $s, $done]) {
        $bar  = $done ? $blue : $rule;
        $barC = $done ? 'alf-bar-on' : 'alf-bar';
        $num  = $done ? $blue : $muted;
        $pad  = $i < 3 ? 'padding-right:12px;' : '';
        $mark = $done ? ' &#10003;' : '';
        $track .= '<td class="alf-step" width="25%" valign="top" style="width:25%;' . $pad . '">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
            . '<td class="' . $barC . '" style="border-top:3px solid ' . $bar . ';padding-top:12px;">'
            . '<div style="font-family:' . $fh . ';font-size:12px;font-weight:600;letter-spacing:0.08em;color:' . $num . ';line-height:1;">' . $n . $mark . '</div>'
            . '<div class="alf-ink" style="font-family:' . $fb . ';font-size:14px;font-weight:600;color:' . $ink . ';line-height:1.35;padding-top:8px;">' . $t . '</div>'
            . '<div class="alf-txt" style="font-family:' . $fb . ';font-size:12px;color:' . $text . ';line-height:1.45;padding-top:3px;">' . $s . '</div>'
            . '</td></tr></table></td>';
    }

    /* Celda del cajetín */
    $cell = function (string $label, string $value, string $extra = '') use ($muted, $ink, $fb): string {
        return '<td valign="top" style="padding:12px 14px;' . $extra . '">'
            . '<div class="alf-label" style="font-family:' . $fb . ';font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:' . $muted . ';line-height:1;">' . $label . '</div>'
            . '<div class="alf-ink" style="font-family:' . $fb . ';font-size:15px;font-weight:500;color:' . $ink . ';line-height:1.4;padding-top:6px;">' . $value . '</div>'
            . '</td>';
    };
    $line  = 'border-color:' . $rule . ';';
    $cajetin = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="alf-frame" style="border:1px solid ' . $ink . ';border-collapse:collapse;">'
        . '<tr><td colspan="2" class="alf-frame-head" bgcolor="' . $ink . '" style="background:' . $ink . ';padding:9px 14px;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
            . '<td style="font-family:' . $fb . ';font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#FFFFFF;">Ficha de consulta</td>'
            . '<td align="right" style="font-family:' . $fb . ';font-size:11px;font-weight:600;letter-spacing:0.06em;color:#B0A99A;">N°&nbsp;' . $numero . '</td>'
            . '</tr></table></td></tr>'
        . '<tr>' . $cell('Trabajo', $tipo, 'width:50%;border-right:1px solid ' . $rule . ';border-bottom:1px solid ' . $rule . ';')
                 . $cell('Obra en', $localidad, 'width:50%;border-bottom:1px solid ' . $rule . ';') . '</tr>'
        . '<tr>' . $cell('A nombre de', $nombreFull, 'border-right:1px solid ' . $rule . ';border-bottom:1px solid ' . $rule . ';')
                 . $cell('Fecha', $fechaC, 'border-bottom:1px solid ' . $rule . ';') . '</tr>'
        . '<tr><td colspan="2" style="padding:14px 14px 16px;">'
            . '<div class="alf-label" style="font-family:' . $fb . ';font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:' . $muted . ';line-height:1;">Lo que nos escribiste</div>'
            . '<div class="alf-txt" style="font-family:' . $fb . ';font-size:15px;color:' . $text . ';line-height:1.65;padding-top:8px;">' . $mensaje . '</div>'
        . '</td></tr>'
        . '</table>';

    /* Trabajos recientes */
    $obras = [
        ['trabajo-corrediza.jpg', 'Corrediza símil madera'],
        ['trabajo-techo.jpg',     'Ventana a medida en techo'],
        ['trabajo-repartido.jpg', 'Ventana de abrir con repartido'],
    ];
    $thumbs = '';
    foreach ($obras as $i => [$img, $cap]) {
        $pad = ['padding-right:10px;', 'padding:0 5px;', 'padding-left:10px;'][$i];
        $thumbs .= '<td width="33%" valign="top" style="width:33%;' . $pad . '">'
            . '<a href="' . $site . '/#trabajos" target="_blank" style="text-decoration:none;">'
            . '<img src="' . $site . '/email/' . $img . '" width="164" alt="' . $cap . '" style="display:block;width:100%;max-width:164px;height:auto;border:0;background:#E8E4DC;">'
            . '</a>'
            . '<div class="alf-txt" style="font-family:' . $fb . ';font-size:12px;color:' . $text . ';line-height:1.4;padding-top:8px;">' . $cap . '</div>'
            . '</td>';
    }

    return <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Recibimos tu consulta — Alumfer</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <!--<![endif]-->
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>td,div,p,a,h1{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
  <style>
    html,body{margin:0!important;padding:0!important;width:100%!important;}
    *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;}
    a{text-decoration:none;}
    .alf-dark-only{display:none;max-height:0;overflow:hidden;mso-hide:all;}
    @media only screen and (max-width:620px){
      .alf-container{width:100%!important;}
      .alf-pad{padding-left:24px!important;padding-right:24px!important;}
      .alf-h1{font-size:26px!important;}
      .alf-step{display:block!important;width:100%!important;padding-right:0!important;padding-bottom:14px!important;}
      .alf-num{display:none!important;}
      .alf-btn a{display:block!important;}
    }
    @media (prefers-color-scheme: dark){
      .alf-outer{background:#111214!important;}
      .alf-paper{background:#1A1C1E!important;}
      .alf-ink{color:#F2F0EC!important;}
      .alf-txt{color:#C9C5BD!important;}
      .alf-label{color:#958E82!important;}
      .alf-frame{border-color:#5A5F66!important;}
      .alf-frame td{border-color:#34383D!important;}
      .alf-frame-head{background:#2E3338!important;}
      .alf-rule{border-color:#34383D!important;}
      .alf-bar{border-top-color:#34383D!important;}
      .alf-bar-on{border-top-color:#4A9DE8!important;}
      .alf-link{color:#4A9DE8!important;}
      .alf-light-only{display:none!important;}
      .alf-dark-only{display:block!important;max-height:none!important;}
    }
  </style>
</head>
<body class="alf-outer" style="margin:0;padding:0;background:$outer;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:$outer;opacity:0;">$pre&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="alf-outer" bgcolor="$outer" style="background:$outer;">
    <tr><td align="center" style="padding:32px 12px 40px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="alf-container" style="width:600px;max-width:600px;">

        <!-- Encabezado: logo sobre carbón (el fondo va en bgcolor para que el texto alternativo se lea si se bloquean imágenes) -->
        <tr>
          <td bgcolor="#1A1C1E" class="alf-pad" style="background:#1A1C1E;padding:24px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle">
                <a href="$site" target="_blank" style="text-decoration:none;">
                  <img src="$site/email/alumfer-logo-blanco.png" width="216" height="39" alt="ALUMFER" style="display:block;width:216px;height:39px;border:0;font-family:$fh;font-size:16px;font-weight:600;letter-spacing:0.18em;color:#FFFFFF;">
                </a>
              </td>
              <td class="alf-num" align="right" valign="middle" style="font-family:$fb;font-size:11px;line-height:1.5;letter-spacing:0.06em;color:#B0A99A;">
                Consulta<br><span style="color:#FFFFFF;font-weight:600;">N°&nbsp;$numero</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <!-- Línea de identidad -->
        <tr><td bgcolor="$blue" style="background:$blue;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

        <!-- Carta -->
        <tr>
          <td class="alf-paper alf-pad" bgcolor="$paper" style="background:$paper;padding:40px 40px 8px;">

            <div class="alf-txt" style="font-family:$fb;font-size:13px;color:$text;line-height:1;padding-bottom:28px;">Adrogué, $fechaL</div>

            <h1 class="alf-h1 alf-ink" style="margin:0;font-family:$fh;font-size:30px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:$ink;">$nombre, recibimos tu&nbsp;consulta.</h1>

            <p class="alf-txt" style="margin:20px 0 0;font-family:$fb;font-size:16px;line-height:1.7;color:$text;">
              Gracias por escribirnos. Tu pedido ya está con nuestro equipo y te vamos a contactar dentro de las próximas <strong class="alf-ink" style="color:$ink;font-weight:600;">24&nbsp;horas hábiles</strong>, por teléfono o por este mismo email, para avanzar con el presupuesto de $frase. No tiene costo ni compromiso.
            </p>

            <!-- Cómo sigue -->
            <div class="alf-label" style="font-family:$fb;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:$muted;padding:40px 0 14px;">Cómo sigue</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>$track</tr></table>

            <!-- Cajetín -->
            <div style="height:36px;line-height:36px;font-size:0;">&nbsp;</div>
            $cajetin

            <!-- Pedido concreto + acción -->
            <p class="alf-txt" style="margin:32px 0 0;font-family:$fb;font-size:16px;line-height:1.7;color:$text;">
              <strong class="alf-ink" style="color:$ink;font-weight:600;">Te pedimos una sola cosa:</strong> si tenés fotos del lugar, medidas aproximadas o un plano, respondé este email y adjuntalos. Con eso el presupuesto sale más preciso y más rápido.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="alf-btn" style="margin-top:22px;"><tr>
              <td bgcolor="$blue" style="background:$blue;border-radius:3px;">
                <!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="$mailto" style="height:48px;v-text-anchor:middle;width:300px;" stroke="f" fillcolor="$blue"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Enviar fotos o medidas</center></v:rect><![endif]-->
                <!--[if !mso]><!-->
                <a href="$mailto" style="display:inline-block;padding:16px 28px;font-family:$fb;font-size:15px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:3px;text-align:center;">Enviar fotos o medidas</a>
                <!--<![endif]-->
              </td>
            </tr></table>

            <p class="alf-txt" style="margin:16px 0 0;font-family:$fb;font-size:14px;line-height:1.6;color:$text;">
              ¿Te queda más cómodo por WhatsApp? <a href="$wa" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">Escribinos al (011)&nbsp;6336-8643&nbsp;→</a>
            </p>

            <!-- Firma -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;"><tr>
              <td class="alf-rule" style="border-top:1px solid $rule;padding-top:24px;">
                <p class="alf-txt" style="margin:0;font-family:$fb;font-size:16px;line-height:1.6;color:$text;">Un saludo,</p>
                <p class="alf-ink" style="margin:4px 0 0;font-family:$fh;font-size:16px;font-weight:600;line-height:1.4;color:$ink;">El equipo de Alumfer</p>
                <p class="alf-txt" style="margin:4px 0 0;font-family:$fb;font-size:13px;line-height:1.6;color:$text;">Empresa familiar · Fabricamos en Adrogué desde 2010</p>
              </td>
            </tr></table>

            <!-- Trabajos recientes -->
            <div class="alf-label" style="font-family:$fb;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:$muted;padding:44px 0 14px;">Algunos trabajos nuestros</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>$thumbs</tr></table>
            <p style="margin:16px 0 0;font-family:$fb;font-size:14px;line-height:1.6;">
              <a href="$site/#trabajos" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">Ver más trabajos en alumfer.com.ar&nbsp;→</a>
            </p>
            <div style="height:32px;line-height:32px;font-size:0;">&nbsp;</div>
          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td class="alf-pad" style="padding:28px 40px 0;">
            <div class="alf-light-only">
              <img src="$site/email/alumfer-logo-carbon.png" width="132" height="24" alt="ALUMFER" style="display:block;width:132px;height:24px;border:0;font-family:$fh;font-size:12px;font-weight:600;letter-spacing:0.18em;color:$ink;">
            </div>
            <!--[if !mso]><!-->
            <div class="alf-dark-only">
              <img src="$site/email/alumfer-logo-blanco.png" width="132" height="24" alt="ALUMFER" style="display:block;width:132px;height:24px;border:0;">
            </div>
            <!--<![endif]-->
            <p class="alf-txt" style="margin:16px 0 0;font-family:$fb;font-size:12px;line-height:1.8;color:$text;">
              Av. San Martín 734, Adrogué, Buenos Aires<br>
              <a href="https://wa.me/{$h(ALF_WA_NUMBER)}" target="_blank" style="color:$text;text-decoration:none;" class="alf-txt">(011) 6336-8643</a> &nbsp;·&nbsp;
              <a href="mailto:{$h(ALF_EMAIL)}" style="color:$text;text-decoration:none;" class="alf-txt">{$h(ALF_EMAIL)}</a><br>
              <a href="$site" target="_blank" style="color:$text;text-decoration:none;" class="alf-txt">alumfer.com.ar</a> &nbsp;·&nbsp;
              <a href="{$h(ALF_IG)}" target="_blank" style="color:$text;text-decoration:none;" class="alf-txt">Instagram</a> &nbsp;·&nbsp;
              <a href="{$h(ALF_FB)}" target="_blank" style="color:$text;text-decoration:none;" class="alf-txt">Facebook</a>
            </p>
            <p class="alf-label" style="margin:14px 0 0;font-family:$fb;font-size:11px;line-height:1.6;color:$muted;">
              Recibiste este email porque dejaste una consulta en alumfer.com.ar. © $year Alumfer.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
