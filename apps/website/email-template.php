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
 *  EMAIL AL CLIENTE — confirmación de consulta
 * ------------------------------------------------------------
 *  Corto y comercial: titular con el nombre y el trabajo, banda
 *  con tres argumentos reales, reseña de Google, una sola acción
 *  (mandar fotos o medidas) y el resumen de la consulta.
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

/** ["tus ventanas", true] → sujeto del titular y si va en plural. */
function em_tipo_frase(string $tipo): array {
    $map = [
        'ventanas'      => ['tus ventanas', true],
        'puertas'       => ['tus puertas', true],
        'mosquiteros'   => ['tus mosquiteros', true],
        'policarbonato' => ['tu techo de policarbonato', false],
    ];
    return $map[mb_strtolower(trim($tipo), 'UTF-8')] ?? ['tu proyecto', false];
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
    $tipoRaw   = trim($d['tipo']);
    $tipo      = ($tipoRaw === '' || mb_strtolower($tipoRaw, 'UTF-8') === 'otros') ? 'A definir' : $h($tipoRaw);
    [$sujeto, $plural] = em_tipo_frase($tipoRaw);
    $verbo     = $plural ? 'ya están' : 'ya está';
    $localidad = trim($d['localidad']) !== '' ? $h($d['localidad']) : 'A confirmar';
    $mensaje   = nl2br($h($d['consulta']));
    $numero    = $h($d['numero']);
    $year      = date('Y', $d['ts']);

    $mailto = $h('mailto:' . ALF_EMAIL . '?subject=' . rawurlencode('Consulta N° ' . $d['numero'] . ' — fotos y medidas'));
    $wa     = $h('https://wa.me/' . ALF_WA_NUMBER . '?text=' . rawurlencode('Hola, les escribo por la consulta N° ' . $d['numero'] . '.'));
    $google = $h('https://www.google.com/search?q=Alumfer+carpinter%C3%ADa+aluminio+Adrog%C3%BCe');

    $site  = ALF_SITE;
    $fh    = ALF_FONT_HEAD;
    $fb    = ALF_FONT;
    $pre   = $h('Te contactamos en menos de 24 horas hábiles con tu presupuesto sin cargo.');

    $ink   = '#1A1C1E';
    $text  = '#45474A';
    $muted = '#857E72';
    $rule  = '#DCD7CD';
    $outer = '#ECE9E3';
    $blue  = ALF_BLUE;

    /* Por qué Alumfer: tres argumentos reales del sitio */
    $args = [
        ['Fábrica propia',      'Sin intermediarios'],
        ['Medición sin cargo',  'Vamos a tu obra'],
        ['Instalación en seco', 'Sin romper paredes'],
    ];
    $band = '';
    foreach ($args as $i => [$t, $s]) {
        $sep = $i < 2 ? 'border-right:1px solid #3D444B;' : '';
        $band .= '<td class="alf-arg' . ($i === 2 ? ' alf-arg-last' : '') . '" width="33%" valign="top" style="width:33%;padding:22px 16px;' . $sep . '">'
            . '<div style="font-family:' . $fh . ';font-size:15px;font-weight:600;line-height:1.3;color:#FFFFFF;">' . $t . '</div>'
            . '<div style="font-family:' . $fb . ';font-size:12px;line-height:1.4;color:#B0A99A;padding-top:4px;">' . $s . '</div>'
            . '</td>';
    }

    $label = fn(string $t): string => '<div class="alf-label" style="font-family:' . $fb . ';font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:' . $muted . ';line-height:1;">' . $t . '</div>';
    $val   = fn(string $t): string => '<div class="alf-ink" style="font-family:' . $fb . ';font-size:15px;font-weight:500;color:' . $ink . ';line-height:1.4;padding-top:6px;">' . $t . '</div>';

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
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
      .alf-h1{font-size:30px!important;}
      .alf-num{display:none!important;}
      .alf-arg{display:block!important;width:auto!important;border-right:0!important;border-bottom:1px solid #3D444B!important;padding:16px 0!important;}
      .alf-arg-last{border-bottom:0!important;}
      .alf-btn a{display:block!important;}
    }
    @media (prefers-color-scheme: dark){
      .alf-outer{background:#111214!important;}
      .alf-paper{background:#1A1C1E!important;}
      .alf-band{background:#2E3338!important;}
      .alf-ink{color:#F2F0EC!important;}
      .alf-txt{color:#C9C5BD!important;}
      .alf-label{color:#958E82!important;}
      .alf-link{color:#4A9DE8!important;}
      .alf-frame{border-color:#3D444B!important;}
      .alf-frame td{border-color:#3D444B!important;}
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

        <!-- Encabezado: el fondo va en bgcolor para que el texto alternativo se lea si se bloquean imágenes -->
        <tr>
          <td bgcolor="#1A1C1E" class="alf-pad" style="background:#1A1C1E;padding:24px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle">
                <a href="$site" target="_blank" style="text-decoration:none;">
                  <img src="$site/email/alumfer-logo-blanco.png" width="216" height="39" alt="ALUMFER" style="display:block;width:216px;height:39px;border:0;font-family:$fh;font-size:18px;font-weight:600;letter-spacing:0.18em;color:#FFFFFF;">
                </a>
              </td>
              <td class="alf-num" align="right" valign="middle" style="font-family:$fb;font-size:11px;line-height:1.5;letter-spacing:0.06em;color:#B0A99A;">
                Consulta<br><span style="color:#FFFFFF;font-weight:600;">N°&nbsp;$numero</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td bgcolor="$blue" style="background:$blue;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

        <!-- Titular -->
        <tr>
          <td class="alf-paper alf-pad" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:44px 40px 36px;">
            <h1 class="alf-h1 alf-ink" style="margin:0;font-family:$fh;font-size:36px;line-height:1.12;font-weight:700;letter-spacing:-0.025em;color:$ink;">$nombre, $sujeto $verbo en&nbsp;marcha.</h1>
            <p class="alf-txt" style="margin:18px 0 0;font-family:$fb;font-size:17px;line-height:1.6;color:$text;">
              En menos de <strong class="alf-ink" style="color:$ink;font-weight:600;">24&nbsp;horas hábiles</strong> te contactamos con tu presupuesto. Sin cargo y sin compromiso.
            </p>
          </td>
        </tr>

        <!-- Por qué Alumfer -->
        <tr>
          <td class="alf-band" bgcolor="$ink" style="background:$ink;padding:0 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>$band</tr></table>
          </td>
        </tr>

        <tr>
          <td class="alf-paper alf-pad" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:36px 40px 40px;">

            <!-- Reseña real de Google -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="border-left:3px solid $blue;padding:2px 0 2px 18px;">
                <div style="font-family:$fb;font-size:14px;line-height:1;color:#F2B01E;letter-spacing:2px;">★★★★★</div>
                <p class="alf-ink" style="margin:10px 0 0;font-family:$fh;font-size:19px;line-height:1.4;font-weight:600;color:$ink;">“Precio, tiempo de entrega y calidad, 10&nbsp;puntos.”</p>
                <p class="alf-txt" style="margin:8px 0 0;font-family:$fb;font-size:13px;line-height:1.5;color:$text;">
                  Marcelo V., mosquiteros a medida &nbsp;·&nbsp; <a href="$google" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">4,5 en Google, 37&nbsp;reseñas</a>
                </p>
              </td>
            </tr></table>

            <!-- Acción -->
            <p class="alf-ink" style="margin:36px 0 0;font-family:$fh;font-size:20px;line-height:1.3;font-weight:600;color:$ink;">¿Lo querés más rápido?</p>
            <p class="alf-txt" style="margin:8px 0 0;font-family:$fb;font-size:16px;line-height:1.6;color:$text;">
              Mandanos fotos del lugar o medidas aproximadas y adelantamos tu presupuesto.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="alf-btn" style="margin-top:20px;"><tr>
              <td bgcolor="$blue" style="background:$blue;border-radius:3px;">
                <!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="$mailto" style="height:50px;v-text-anchor:middle;width:300px;" stroke="f" fillcolor="$blue"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Enviar fotos o medidas</center></v:rect><![endif]-->
                <!--[if !mso]><!-->
                <a href="$mailto" style="display:inline-block;padding:17px 30px;font-family:$fb;font-size:15px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:3px;text-align:center;">Enviar fotos o medidas</a>
                <!--<![endif]-->
              </td>
            </tr></table>
            <p class="alf-txt" style="margin:14px 0 0;font-family:$fb;font-size:14px;line-height:1.6;color:$text;">
              o por WhatsApp: <a href="$wa" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">(011)&nbsp;6336-8643&nbsp;→</a>
            </p>

            <!-- Resumen de la consulta -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="alf-frame" style="margin-top:36px;border:1px solid $rule;border-collapse:collapse;">
              <tr>
                <td width="50%" valign="top" style="width:50%;padding:12px 14px;border-right:1px solid $rule;border-bottom:1px solid $rule;">{$label('Trabajo')}{$val($tipo)}</td>
                <td width="50%" valign="top" style="width:50%;padding:12px 14px;border-bottom:1px solid $rule;">{$label('Obra en')}{$val($localidad)}</td>
              </tr>
              <tr><td colspan="2" style="padding:12px 14px 14px;">
                {$label('Tu mensaje')}
                <div class="alf-txt" style="font-family:$fb;font-size:14px;color:$text;line-height:1.6;padding-top:6px;">$mensaje</div>
              </td></tr>
            </table>

          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td class="alf-pad" style="padding:26px 40px 0;">
            <div class="alf-light-only">
              <img src="$site/email/alumfer-logo-carbon.png" width="132" height="24" alt="ALUMFER" style="display:block;width:132px;height:24px;border:0;font-family:$fh;font-size:12px;font-weight:600;letter-spacing:0.18em;color:$ink;">
            </div>
            <!--[if !mso]><!-->
            <div class="alf-dark-only">
              <img src="$site/email/alumfer-logo-blanco.png" width="132" height="24" alt="ALUMFER" style="display:block;width:132px;height:24px;border:0;">
            </div>
            <!--<![endif]-->
            <p class="alf-txt" style="margin:14px 0 0;font-family:$fb;font-size:12px;line-height:1.8;color:$text;">
              Av. San Martín 734, Adrogué &nbsp;·&nbsp; (011) 6336-8643 &nbsp;·&nbsp;
              <a href="$site" target="_blank" class="alf-txt" style="color:$text;text-decoration:none;">alumfer.com.ar</a>
            </p>
            <p class="alf-label" style="margin:8px 0 0;font-family:$fb;font-size:11px;line-height:1.6;color:$muted;">
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
