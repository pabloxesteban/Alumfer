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
 *  Corto y comercial: hero azul con el nombre y el trabajo,
 *  tres argumentos reales con ícono, reseña de Google, acción
 *  (fotos/medidas o WhatsApp) y el resumen de la consulta.
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

    $ink   = '#16202B';   // títulos (carbón azulado)
    $text  = '#4B5563';   // cuerpo
    $muted = '#6B7A8C';   // etiquetas
    $outer = '#EAF0F7';   // fondo exterior (azul muy claro)
    $tint  = '#F3F7FC';   // tarjetas
    $blue  = ALF_BLUE;
    $navy  = '#0E4A94';
    $wag   = '#1EA952';   // verde WhatsApp (texto oscuro encima para contraste)

    /* Por qué Alumfer: tres argumentos reales del sitio, con ícono */
    $args = [
        ['icono-fabrica',     'Fábrica propia',      'Sin intermediarios'],
        ['icono-medicion',    'Medición sin cargo',  'Vamos a tu obra'],
        ['icono-instalacion', 'Instalación en seco', 'Sin romper paredes'],
    ];
    /* Una sola fila de celdas: las tres tarjetas quedan de la misma altura.
       En desktop el ícono va arriba; en celular, al costado (más compacto). */
    $cards = '';
    foreach ($args as $i => [$ico, $t, $s]) {
        if ($i > 0) {
            $cards .= '<td class="alf-gap" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>';
        }
        $cards .= '<td class="alf-col alf-card" width="31%" valign="top" bgcolor="' . $tint . '" style="width:31%;background:' . $tint . ';border-radius:16px;padding:18px 16px;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
            . '<td class="alf-ico" valign="top" style="display:block;width:44px;padding-bottom:12px;">'
            . '<img src="' . $site . '/email/' . $ico . '.png" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border:0;"></td>'
            . '<td class="alf-ico-txt" valign="middle" style="display:block;">'
            . '<div class="alf-ink" style="font-family:' . $fh . ';font-size:15px;font-weight:700;line-height:1.3;color:' . $ink . ';">' . $t . '</div>'
            . '<div class="alf-txt" style="font-family:' . $fb . ';font-size:13px;line-height:1.4;color:' . $text . ';padding-top:3px;">' . $s . '</div>'
            . '</td></tr></table></td>';
    }

    $chip = fn(string $label, string $value): string =>
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:top;margin:0 8px 8px 0;"><tr>'
        . '<td class="alf-chip" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:999px;padding:7px 14px;white-space:nowrap;font-family:' . $fb . ';font-size:13px;line-height:1.2;color:' . $muted . ';">'
        . $label . ' <strong class="alf-ink" style="color:' . $ink . ';font-weight:600;">' . $value . '</strong></td></tr></table>';

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
    @media only screen and (max-width:620px){
      .alf-container{width:100%!important;}
      .alf-pad{padding-left:22px!important;padding-right:22px!important;}
      .alf-h1{font-size:30px!important;}
      .alf-deco{display:none!important;}
      .alf-col{display:block!important;width:auto!important;padding:14px 16px!important;}
      .alf-gap{display:block!important;width:auto!important;height:10px!important;}
      .alf-ico{display:table-cell!important;padding:0 14px 0 0!important;}
      .alf-ico-txt{display:table-cell!important;}
      .alf-pill{display:none!important;}
      .alf-btn{display:block!important;width:100%!important;margin:0 0 10px 0!important;}
      .alf-btn a{display:block!important;}
    }
    @media (prefers-color-scheme: dark){
      .alf-outer{background:#0F1418!important;}
      .alf-paper{background:#1A2027!important;}
      .alf-card{background:#232B34!important;}
      .alf-review{background:#2A2618!important;}
      .alf-sum{background:#232B34!important;}
      .alf-chip{background:#1A2027!important;}
      .alf-foot{background:#151A20!important;}
      .alf-ink{color:#F1F4F8!important;}
      .alf-txt{color:#C3CBD5!important;}
      .alf-label{color:#8F9BAA!important;}
      .alf-link{color:#6FB2F0!important;}
    }
  </style>
</head>
<body class="alf-outer" style="margin:0;padding:0;background:$outer;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:$outer;opacity:0;">$pre&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;&nbsp;&#8199;&#65279;&#847;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="alf-outer" bgcolor="$outer" style="background:$outer;">
    <tr><td align="center" style="padding:28px 12px 36px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="alf-container" style="width:600px;max-width:600px;">

        <!-- Hero azul (bgcolor de respaldo para clientes sin degradé) -->
        <tr>
          <td class="alf-pad" bgcolor="$blue" style="background:$blue;background-image:linear-gradient(135deg,$blue 0%,$navy 100%);border-radius:24px 24px 0 0;padding:28px 40px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle">
                <a href="$site" target="_blank" style="text-decoration:none;">
                  <img src="$site/email/alumfer-logo-blanco.png" width="190" height="34" alt="ALUMFER" style="display:block;width:190px;height:34px;border:0;font-family:$fh;font-size:18px;font-weight:700;letter-spacing:0.18em;color:#FFFFFF;">
                </a>
              </td>
              <td class="alf-pill" align="right" valign="middle">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="background:rgba(255,255,255,0.14);border-radius:999px;padding:7px 14px;font-family:$fb;font-size:12px;font-weight:600;line-height:1;color:#FFFFFF;white-space:nowrap;">N°&nbsp;$numero</td>
                </tr></table>
              </td>
            </tr></table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;"><tr>
              <td valign="bottom">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="background:#FFFFFF;border-radius:999px;padding:7px 14px 7px 12px;font-family:$fb;font-size:12px;font-weight:600;line-height:1;color:$navy;">
                    <span style="color:#1EA952;font-size:13px;">&#9679;</span>&nbsp; Consulta recibida
                  </td>
                </tr></table>
                <h1 class="alf-h1" style="margin:18px 0 0;font-family:$fh;font-size:36px;line-height:1.12;font-weight:700;letter-spacing:-0.025em;color:#FFFFFF;">$nombre, $sujeto $verbo en&nbsp;marcha.</h1>
                <p style="margin:14px 0 0;font-family:$fb;font-size:17px;line-height:1.55;color:#D6E8F7;">
                  En menos de <strong style="color:#FFFFFF;font-weight:600;">24&nbsp;horas hábiles</strong> te contactamos con tu presupuesto. Sin cargo y sin compromiso.
                </p>
              </td>
              <td class="alf-deco" width="120" align="right" valign="bottom" style="width:120px;padding-left:12px;">
                <img src="$site/email/hero-marca.png" width="120" height="84" alt="" style="display:block;width:120px;height:84px;border:0;">
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td class="alf-paper alf-pad" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:32px 40px 36px;">

            <!-- Por qué Alumfer -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>$cards</tr></table>

            <!-- Reseña real de Google -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
              <td class="alf-review" bgcolor="#FFF6DD" style="background:#FFF6DD;border-radius:16px;padding:22px 24px;">
                <div style="font-family:$fb;font-size:16px;line-height:1;color:#F5A800;letter-spacing:2px;">★★★★★</div>
                <p class="alf-ink" style="margin:12px 0 0;font-family:$fh;font-size:19px;line-height:1.4;font-weight:700;color:$ink;">“Precio, tiempo de entrega y calidad, 10&nbsp;puntos.”</p>
                <p class="alf-txt" style="margin:8px 0 0;font-family:$fb;font-size:13px;line-height:1.5;color:$text;">
                  Marcelo V., mosquiteros a medida &nbsp;·&nbsp; <a href="$google" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">4,5 en Google, 37&nbsp;reseñas</a>
                </p>
              </td>
            </tr></table>

            <!-- Acción -->
            <p class="alf-ink" style="margin:34px 0 0;font-family:$fh;font-size:22px;line-height:1.3;font-weight:700;color:$ink;">¿Lo querés más rápido? 📸</p>
            <p class="alf-txt" style="margin:8px 0 0;font-family:$fb;font-size:16px;line-height:1.6;color:$text;">
              Mandanos fotos del lugar o medidas aproximadas y adelantamos tu presupuesto.
            </p>
            <div style="margin-top:20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="alf-btn" style="display:inline-block;vertical-align:top;margin:0 10px 10px 0;"><tr>
                <td align="center" bgcolor="$blue" style="background:$blue;border-radius:999px;">
                  <a href="$mailto" style="display:inline-block;padding:16px 28px;font-family:$fb;font-size:15px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:999px;">Enviar fotos o medidas</a>
                </td>
              </tr></table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="alf-btn" style="display:inline-block;vertical-align:top;margin:0 0 10px 0;"><tr>
                <td align="center" bgcolor="$wag" style="background:$wag;border-radius:999px;">
                  <a href="$wa" target="_blank" style="display:inline-block;padding:16px 28px;font-family:$fb;font-size:15px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:999px;">Escribir por WhatsApp</a>
                </td>
              </tr></table>
            </div>

            <!-- Resumen de la consulta -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>
              <td class="alf-sum" bgcolor="$tint" style="background:$tint;border-radius:16px;padding:20px 22px 18px;">
                <div class="alf-label" style="font-family:$fb;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:$muted;padding-bottom:12px;">Tu consulta</div>
                <div>{$chip('Trabajo', $tipo)}{$chip('Obra en', $localidad)}</div>
                <div class="alf-txt" style="font-family:$fb;font-size:14px;color:$text;line-height:1.6;padding-top:6px;">$mensaje</div>
              </td>
            </tr></table>

          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td class="alf-foot alf-pad" bgcolor="#F6F9FC" style="background:#F6F9FC;border-radius:0 0 24px 24px;padding:22px 40px 24px;">
            <p class="alf-txt" style="margin:0;font-family:$fb;font-size:13px;line-height:1.7;color:$text;">
              <strong class="alf-ink" style="color:$ink;font-weight:600;">Alumfer</strong> · Av. San Martín 734, Adrogué<br>
              <a href="https://wa.me/{$h(ALF_WA_NUMBER)}" target="_blank" class="alf-txt" style="color:$text;text-decoration:none;">(011) 6336-8643</a> &nbsp;·&nbsp;
              <a href="$site" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">alumfer.com.ar</a> &nbsp;·&nbsp;
              <a href="{$h(ALF_IG)}" target="_blank" class="alf-link" style="color:$blue;font-weight:600;text-decoration:none;">Instagram</a>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 24px 0;font-family:$fb;font-size:11px;line-height:1.6;color:$muted;" class="alf-label">
            Recibiste este email porque dejaste una consulta en alumfer.com.ar. © $year Alumfer.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
