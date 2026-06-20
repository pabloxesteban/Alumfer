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
          <td style="background:#1A1C1E;border-radius:16px 16px 0 0;padding:26px 36px;" class="alf-pad">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="vertical-align:middle;">
                    <img src="https://alumfer.com.ar/solologo.png" width="48" height="34" alt="" style="display:block;border:0;outline:none;height:34px;width:48px;">
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <div style="font-family:$font;font-size:20px;font-weight:700;letter-spacing:0.16em;color:#ffffff;line-height:1;">ALUMFER</div>
                    <div style="font-family:$font;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#B0A99A;line-height:1;padding-top:6px;">Carpintería de aluminio</div>
                  </td>
                </tr></table>
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
