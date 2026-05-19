import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function getClientConfirmationEmail(formData: any): string {
  const c = formData.step1Contact || {}
  const t = formData.step4Travel || {}

  const firstName = (c.fullName || '').split(' ')[0] || 'Hola'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#050505;color:#F0F0F0;">

  <!-- Header -->
  <div style="background:#0A0A0A;border-bottom:2px solid #C8FF00;padding:24px 32px;">
    <div style="font-size:24px;font-weight:900;color:#C8FF00;letter-spacing:-0.5px;">LATAM VISA</div>
  </div>

  <div style="padding:32px;">

    <p style="font-size:22px;font-weight:bold;color:#FFFFFF;margin:0 0 16px 0;">¡Hola ${firstName}!</p>

    <p style="font-size:15px;color:#CCC;line-height:1.7;margin:0 0 28px 0;">
      Recibimos tu aplicación de visa de turismo a Estados Unidos. 🇺🇸<br><br>
      Nuestro equipo va a revisar tu información y te contactaremos por WhatsApp en las próximas 24 horas con los siguientes pasos.
    </p>

    <!-- Application Summary -->
    <div style="background:#0F0F0F;border:1px solid #1E1E1E;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:12px;color:#C8FF00;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">📌 Resumen de tu aplicación</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;width:160px;">Nombre</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${c.fullName || '—'}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;">Email</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${c.email || '—'}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;">Tipo de visa</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${t.usaVisaType || 'B-1/B-2 Turismo'}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;">Fecha estimada de viaje</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${formatDate(t.arrivalDate)}</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <div style="background:#0A120A;border:1px solid #1A2E1A;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:14px;font-weight:bold;color:#C8FF00;margin-bottom:14px;">📸 IMPORTANTE — Próximos pasos</div>
      <p style="margin:0 0 14px 0;font-size:14px;color:#CCC;line-height:1.6;">
        Recibimos las fotos que subiste en el formulario. Nuestro equipo las va a revisar y te contactaremos por WhatsApp en las próximas 24 horas con los siguientes pasos.
      </p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">
        Si necesitamos alguna foto adicional o más nítida, te lo vamos a hacer saber.
      </p>
    </div>

    <!-- Contact -->
    <p style="font-size:14px;color:#888;line-height:1.6;margin:0 0 24px 0;">
      ¿Tenés preguntas urgentes? Escribinos por WhatsApp al
      <a href="https://wa.me/61426779734" style="color:#C8FF00;text-decoration:none;">+61 426 779 734</a>
      o respondé este email.
    </p>

    <p style="font-size:14px;color:#CCC;margin:0;">
      Un abrazo,<br>
      <strong style="color:#FFF;">El equipo de LATAM VISA</strong>
    </p>

  </div>

  <!-- Footer -->
  <div style="background:#0A0A0A;border-top:1px solid #1A1A1A;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:11px;color:#444;line-height:1.6;">
      LATAM VISA es una consultora de planeación de viaje y estudio. No somos agentes registrados de migración (RMA).
    </p>
    <p style="margin:0;font-size:11px;color:#333;">
      <a href="mailto:future@latamvisas.com.au" style="color:#555;text-decoration:none;">future@latamvisas.com.au</a>
      · latamvisatravel.com
    </p>
  </div>

</div>
</body>
</html>`
}
