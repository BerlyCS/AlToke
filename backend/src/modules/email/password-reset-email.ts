const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character]!
  })

export const renderPasswordResetEmail = (resetUrl: string) => {
  const safeUrl = escapeHtml(resetUrl)

  return {
    subject: 'Restablece tu contraseña de AlToke',
    text: `Restablece tu contraseña de AlToke\n\nUsa este enlace para crear una nueva contraseña: ${resetUrl}\n\nEl enlace vence en 30 minutos y solo puede usarse una vez. Si no solicitaste este cambio, puedes ignorar este correo.`,
    html: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Restablece tu contraseña</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7ff;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:36px 32px 20px;">
                <div style="display:inline-block;background:#eef2ff;border-radius:14px;padding:10px 14px;color:#4f46e5;font-size:22px;font-weight:800;letter-spacing:-0.6px;">AlToke</div>
                <p style="margin:14px 0 0;color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Tus tareas, tu progreso, tu juego</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 36px;">
                <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;letter-spacing:-0.5px;color:#0f172a;">Crea una nueva contraseña</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.55;color:#475569;">Recibimos una solicitud para cambiar la contraseña de tu cuenta. Si ingresaste con Google, este paso también te permitirá iniciar sesión con correo y contraseña.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding:0 0 24px;">
                      <a href="${safeUrl}" style="display:inline-block;background:#4f46e5;border-radius:10px;color:#ffffff;font-size:16px;font-weight:700;line-height:20px;padding:14px 28px;text-decoration:none;">Restablecer contraseña</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;color:#3730a3;font-size:14px;line-height:1.5;">
                      <strong>Enlace seguro:</strong> vence en 30 minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, puedes ignorar este correo.
                    </td>
                  </tr>
                </table>
                <p style="margin:26px 0 8px;font-size:13px;line-height:1.5;color:#64748b;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.5;"><a href="${safeUrl}" style="color:#4f46e5;text-decoration:underline;">${safeUrl}</a></p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">Este es un correo automático de AlToke. No respondas a este mensaje.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  }
}
