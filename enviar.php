<?php
/**
 * ============================================================
 *  ALUMFER — Endpoint de envío del formulario de contacto
 * ------------------------------------------------------------
 *  Reemplaza a Web3Forms. Envía DOS correos con HTML de marca:
 *    1. Notificación al administrador (con los datos de la consulta)
 *    2. Confirmación premium al cliente (si dejó email)
 *
 *  Devuelve JSON { "success": true } para mantener compatibilidad
 *  con el flujo existente de main.js (que luego redirige a gracias.html).
 *
 *  Requiere PHP 7.x+ (disponible en cPanel). Usa la función mail().
 *  Para máxima entregabilidad podés cambiar a SMTP autenticado:
 *  ver la sección "ENVÍO" más abajo.
 * ============================================================
 */

require __DIR__ . '/email-template.php';

/* ─── Configuración ─────────────────────────────────────── */
const ADMIN_TO    = 'alumfercarpinteria@gmail.com';                  // recibe las consultas
const FROM_EMAIL  = 'no-reply@alumfer.com.ar';                       // remitente (casilla del dominio)
const FROM_NAME   = 'Alumfer — Web';

/* ─── Respuesta JSON uniforme ───────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
function respond(bool $ok, string $msg = ''): void {
    http_response_code($ok ? 200 : 422);
    echo json_encode(['success' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ─── Solo POST ─────────────────────────────────────────── */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Método no permitido.');
}

/* ─── Honeypot anti-spam (campo oculto botcheck) ────────── */
if (!empty($_POST['botcheck'])) {
    respond(true); // bot: simulamos éxito sin enviar
}

/* ─── Lectura + saneo ───────────────────────────────────── */
function field(string $name): string {
    return trim((string)($_POST[$name] ?? ''));
}
$nombre    = field('Nombre');
$telefono  = field('Teléfono');
$emailRaw  = field('Email');
$tipo      = field('Tipo');
$localidad = field('Localidad');
$consulta  = field('Consulta');

/* ─── Validación mínima ─────────────────────────────────── */
if ($nombre === '' || $telefono === '' || $tipo === '' || $consulta === '') {
    respond(false, 'Faltan datos obligatorios.');
}
$emailCliente = ($emailRaw !== '' && filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) ? $emailRaw : '';

/* ─── Helpers ───────────────────────────────────────────── */
/** Escapa para inyección segura en HTML. */
function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}
/** Convierte saltos de línea a <br> tras escapar. */
function e_nl(string $s): string {
    return nl2br(e($s));
}
/** Best-effort: número argentino -> link wa.me. */
function wa_from_phone(string $phone): string {
    $d = preg_replace('/\D+/', '', $phone);
    if ($d === '') return ALF_WA_LINK;
    $d = preg_replace('/^0/', '', $d);          // saca 0 inicial
    $d = preg_replace('/^(\d{2,4})15/', '$1', $d); // saca 15 de celular
    if (strpos($d, '54') !== 0) $d = '549' . $d;   // prefijo país + 9 (móvil)
    return 'https://wa.me/' . $d;
}
/** Codifica el asunto para UTF-8 (acentos en todos los clientes). */
function subj(string $s): string {
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

/* ============================================================
 *  CONTENIDO — Notificación al administrador
 * ========================================================== */
$waCliente   = wa_from_phone($telefono);
$telLink      = 'tel:+' . preg_replace('/\D+/', '', $telefono);
$fecha        = date('d/m/Y · H:i') . ' hs';

$rows = [
    ['label' => 'Nombre',        'value' => e($nombre)],
    ['label' => 'Teléfono',      'value' => '<a href="' . e($telLink) . '" style="color:' . ALF_BLUE . ';">' . e($telefono) . '</a>'
        . ' &nbsp;·&nbsp; <a href="' . e($waCliente) . '" target="_blank" style="color:' . ALF_WA . ';">WhatsApp</a>'],
];
if ($emailCliente !== '') {
    $rows[] = ['label' => 'Email', 'value' => '<a href="mailto:' . e($emailCliente) . '" style="color:' . ALF_BLUE . ';">' . e($emailCliente) . '</a>'];
}
$rows[] = ['label' => 'Tipo de trabajo', 'value' => e($tipo)];
if ($localidad !== '') {
    $rows[] = ['label' => 'Localidad de la obra', 'value' => e($localidad)];
}

$adminContent  = em_eyebrow('Nueva consulta web');
$adminContent .= em_h1('Consulta de ' . $nombre);
$adminContent .= em_p('Recibida el <strong style="color:' . ALF_HEADING . ';">' . e($fecha) . '</strong> desde alumfer.com.ar.');
$adminContent .= em_spacer(6);
$adminContent .= '<div class="alf-data">' . em_data_table($rows) . '</div>';
$adminContent .= em_spacer(22);
$adminContent .= em_section_title('Detalle de la consulta');
$adminContent .= '<div class="alf-quote">' . em_quote_box(e_nl($consulta)) . '</div>';
$adminContent .= em_spacer(26);
$adminContent .= em_button('Responder por WhatsApp', $waCliente, 'whatsapp');
if ($emailCliente !== '') {
    $adminContent .= em_button('Responder por email', 'mailto:' . $emailCliente, 'ghost');
}

$adminHtml = em_shell('Nueva consulta de ' . $nombre . ' — ' . $tipo, $adminContent);

/* ============================================================
 *  CONTENIDO — Confirmación al cliente
 * ========================================================== */
$resumen = [
    ['label' => 'Tipo de trabajo', 'value' => e($tipo)],
];
if ($localidad !== '') {
    $resumen[] = ['label' => 'Localidad', 'value' => e($localidad)];
}

$cliContent  = em_eyebrow('Recibimos tu consulta');
$cliContent .= em_h1('¡Gracias, ' . $nombre . '!');
$cliContent .= em_p('Recibimos tu consulta sobre <strong style="color:' . ALF_HEADING . ';">' . e($tipo) . '</strong> y ya estamos sobre ella. '
    . 'Un asesor te va a responder <strong style="color:' . ALF_HEADING . ';">en menos de 24 horas</strong> por teléfono o WhatsApp con tu presupuesto sin cargo.');
$cliContent .= em_spacer(6);
$cliContent .= em_section_title('Esto es lo que nos contaste');
$cliContent .= '<div class="alf-data">' . em_data_table($resumen) . '</div>';
$cliContent .= em_spacer(10);
$cliContent .= '<div class="alf-quote">' . em_quote_box(e_nl($consulta)) . '</div>';
$cliContent .= em_spacer(26);
$cliContent .= em_p('¿Tenés fotos, planos o medidas? Es el momento ideal para enviárnoslos y agilizar tu presupuesto:', 'margin-bottom:14px;');
$cliContent .= em_button('Enviar fotos por WhatsApp', ALF_WA_LINK, 'whatsapp');
$cliContent .= em_button('Ver nuestros trabajos', ALF_SITE . '/#trabajos', 'ghost');
$cliContent .= em_spacer(28);
$cliContent .= em_divider();
$cliContent .= em_spacer(20);
$cliContent .= em_p('<strong style="color:' . ALF_HEADING . ';">Alumfer</strong> — fabricantes de aberturas de aluminio a medida en Adrogué. '
    . 'Fabricación propia, asesoramiento personalizado e instalación profesional.', 'font-size:13px;color:' . ALF_CONCRETE . ';margin-bottom:0;');

$cliHtml = em_shell('Recibimos tu consulta — te respondemos en menos de 24 hs', $cliContent);

/* ============================================================
 *  ENVÍO
 *  (mail() de cPanel. Para SMTP autenticado, reemplazá este
 *   bloque por PHPMailer apuntando a mail.alumfer.com.ar.)
 * ========================================================== */
$headersBase = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'X-Mailer: Alumfer-Web',
];
$envelope = '-f' . FROM_EMAIL;

/* 1) Notificación al admin (Reply-To = cliente, para responder directo) */
$replyTo  = $emailCliente !== '' ? $emailCliente : ADMIN_TO;
$hAdmin   = array_merge($headersBase, ['Reply-To: ' . e($nombre) . ' <' . $replyTo . '>']);
$asunto   = '[' . $tipo . '] ' . $nombre . ($localidad !== '' ? ' · ' . $localidad : '') . ' — alumfer.com.ar';
$okAdmin  = @mail(ADMIN_TO, subj($asunto), $adminHtml, implode("\r\n", $hAdmin), $envelope);

/* 2) Confirmación al cliente (Reply-To = Alumfer) */
if ($emailCliente !== '') {
    $hCli = array_merge($headersBase, ['Reply-To: Alumfer <' . ADMIN_TO . '>']);
    @mail($emailCliente, subj('Recibimos tu consulta — Alumfer'), $cliHtml, implode("\r\n", $hCli), $envelope);
}

/* La consulta del admin es la crítica: su resultado define el éxito. */
if ($okAdmin) {
    respond(true);
}
respond(false, 'No se pudo enviar la consulta. Por favor escribinos por WhatsApp.');
