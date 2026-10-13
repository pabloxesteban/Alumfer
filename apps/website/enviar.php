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
 *  con el flujo existente de site.js (que luego redirige a gracias.html).
 *
 *  Requiere PHP 7.x+ (disponible en cPanel). Usa la función mail().
 *  Para máxima entregabilidad podés cambiar a SMTP autenticado:
 *  ver la sección "ENVÍO" más abajo.
 * ============================================================
 */

require __DIR__ . '/email-template.php';

date_default_timezone_set('America/Argentina/Buenos_Aires');

/* ─── Configuración ─────────────────────────────────────── */
const ADMIN_TO    = 'alumfercarpinteria@gmail.com';                  // recibe las consultas
const FROM_EMAIL  = 'info@alumfer.com.ar';                           // remitente (casilla del dominio)
const FROM_NAME   = 'Alumfer';

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
$tipo      = field('Tipo') !== '' ? field('Tipo') : 'Otros'; // el form de la home no lo manda
$localidad = field('Localidad');
$consulta  = field('Consulta');

/* ─── Validación mínima ─────────────────────────────────── */
if ($nombre === '' || $telefono === '' || $emailRaw === '' || $consulta === '') {
    respond(false, 'Faltan datos obligatorios.');
}
if (!filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'El email no es válido.');
}
$emailCliente = $emailRaw;

/* ─── Plano en PDF (sólo desde el diseñador) ───────────── */
/* El navegador arma el PDF y lo sube en el campo "Plano". Se manda al
   cliente (por eso el email es obligatorio) y la copia a Alumfer.
   Para que nadie use el formulario para mandar archivos a cualquier
   casilla: sólo PDF, tamaño acotado y como máximo 6 planos por hora
   desde la misma IP. */
$planoPdf = '';
$esPlano  = ($tipo === 'Plano desde el sitio web');
if ($esPlano && isset($_FILES['Plano']) && is_uploaded_file($_FILES['Plano']['tmp_name'] ?? '')) {
    if ($emailCliente === '') {
        respond(false, 'Para recibir el plano necesitamos tu email.');
    }
    $f = $_FILES['Plano'];
    if (($f['error'] ?? 1) !== UPLOAD_ERR_OK || $f['size'] <= 0 || $f['size'] > 8 * 1024 * 1024) {
        respond(false, 'El plano no se pudo adjuntar.');
    }
    $planoPdf = (string)file_get_contents($f['tmp_name']);
    if (strncmp($planoPdf, '%PDF-', 5) !== 0) {
        respond(false, 'El archivo del plano no es válido.');
    }
    $ip  = preg_replace('/[^0-9a-f:.]/i', '', $_SERVER['REMOTE_ADDR'] ?? 'x');
    $reg = sys_get_temp_dir() . '/alumfer-planos-' . md5($ip) . '.txt';
    $ahora = time();
    $previos = array_filter(array_map('intval', @file($reg, FILE_IGNORE_NEW_LINES) ?: []), function ($t) use ($ahora) { return $t > $ahora - 3600; });
    if (count($previos) >= 6) {
        respond(false, 'Recibimos varios planos seguidos. Esperá un rato o escribinos por WhatsApp.');
    }
    $previos[] = $ahora;
    @file_put_contents($reg, implode("\n", $previos));
}

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
$ahora        = time();
$fecha        = date('d/m/Y · H:i', $ahora) . ' hs';
$numero       = date('ymd-Hi', $ahora);               // N° de consulta: mismo en ambos emails

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

$adminContent  = em_eyebrow('Nueva consulta web · N° ' . $numero);
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
if ($planoPdf !== '') {
    /* Plano desde el diseñador: email propio, con el PDF adjunto */
    $resumen = [['label' => 'N° de consulta', 'value' => e($numero)]];
    if ($localidad !== '') {
        $resumen[] = ['label' => 'Localidad', 'value' => e($localidad)];
    }
    $cliContent  = em_eyebrow('Tu plano de Alumfer · N° ' . $numero);
    $cliContent .= em_h1('¡Acá está tu plano, ' . $nombre . '!');
    $cliContent .= em_p('Te adjuntamos el PDF con tu plano técnico (cotas y planilla) y la vista ilustrativa en color. '
        . 'Ya lo tenemos para preparar tu presupuesto: te respondemos <strong style="color:' . ALF_HEADING . ';">en menos de 24 horas</strong>.');
    $cliContent .= em_p('Las medidas son las que cargaste vos: en la visita las verificamos sin cargo.', 'font-size:13px;color:' . ALF_CONCRETE . ';');
    $cliContent .= em_spacer(6);
    $cliContent .= '<div class="alf-data">' . em_data_table($resumen) . '</div>';
    $cliContent .= em_spacer(10);
    $cliContent .= '<div class="alf-quote">' . em_quote_box(e_nl($consulta)) . '</div>';
    $cliContent .= em_spacer(20);
    $cliContent .= em_p('<strong style="color:' . ALF_HEADING . ';">Alumfer</strong> — fabricantes de aberturas de aluminio a medida en Adrogué.', 'font-size:13px;color:' . ALF_CONCRETE . ';margin-bottom:0;');
    $cliHtml = em_shell('Tu plano en PDF — te respondemos en menos de 24 hs', $cliContent);
} else {
    $cliHtml = em_cliente([
        'nombre'    => $nombre,
        'tipo'      => $tipo,
        'localidad' => $localidad,
        'consulta'  => $consulta,
        'numero'    => $numero,
        'ts'        => $ahora,
    ]);
}

/* ============================================================
 *  ENVÍO
 *  (mail() de cPanel. Para SMTP autenticado, reemplazá este
 *   bloque por PHPMailer apuntando a mail.alumfer.com.ar.)
 * ========================================================== */
$headersBase = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'X-Mailer: Alumfer-Web',
];
$envelope = '-f' . FROM_EMAIL;

/* El HTML se codifica en base64 (líneas de 76 chars) para no superar el
   límite de longitud de línea del transporte SMTP (Exim rechaza >2048). */
$adminBody = chunk_split(base64_encode($adminHtml), 76, "\r\n");
$cliBody   = chunk_split(base64_encode($cliHtml), 76, "\r\n");

/* Con plano: multipart/mixed con el HTML y el PDF adjunto */
function con_adjunto(array $headers, string $html, string $pdf, string $nombreArchivo): array {
    $b = 'alf-' . bin2hex(random_bytes(12));
    $h = array_values(array_filter($headers, function ($x) { return stripos($x, 'Content-Type:') !== 0 && stripos($x, 'Content-Transfer-Encoding:') !== 0; }));
    $h[] = 'Content-Type: multipart/mixed; boundary="' . $b . '"';
    $cuerpo  = "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html), 76, "\r\n");
    $cuerpo .= "--$b\r\nContent-Type: application/pdf; name=\"$nombreArchivo\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$nombreArchivo\"\r\n\r\n" . chunk_split(base64_encode($pdf), 76, "\r\n");
    $cuerpo .= "--$b--\r\n";
    return [$h, $cuerpo];
}
$archivoPlano = 'plano-alumfer-' . date('Y-m-d') . '.pdf';

/* 1) Notificación al admin (Reply-To = cliente, para responder directo) */
$replyTo  = $emailCliente !== '' ? $emailCliente : ADMIN_TO;
$hAdmin   = array_merge($headersBase, ['Reply-To: ' . e($nombre) . ' <' . $replyTo . '>']);
$asunto   = '[' . $tipo . '] ' . $nombre . ($localidad !== '' ? ' · ' . $localidad : '') . ' — alumfer.com.ar';
if ($planoPdf !== '') { [$hAdmin, $adminBody] = con_adjunto($hAdmin, $adminHtml, $planoPdf, $archivoPlano); }
$okAdmin  = @mail(ADMIN_TO, subj($asunto), $adminBody, implode("\r\n", $hAdmin), $envelope);

/* 2) Confirmación al cliente (Reply-To = Alumfer) */
if ($emailCliente !== '') {
    $hCli = array_merge($headersBase, ['Reply-To: Alumfer <' . ADMIN_TO . '>']);
    if ($planoPdf !== '') { [$hCli, $cliBody] = con_adjunto($hCli, $cliHtml, $planoPdf, $archivoPlano); }
    $asuntoCli = $planoPdf !== '' ? strtok($nombre, ' ') . ', acá está tu plano (N° ' . $numero . ')' : strtok($nombre, ' ') . ', recibimos tu consulta (N° ' . $numero . ')';
    @mail($emailCliente, subj($asuntoCli), $cliBody, implode("\r\n", $hCli), $envelope);
}

/* La consulta del admin es la crítica: su resultado define el éxito. */
if ($okAdmin) {
    respond(true);
}
respond(false, 'No se pudo enviar la consulta. Por favor escribinos por WhatsApp.');
