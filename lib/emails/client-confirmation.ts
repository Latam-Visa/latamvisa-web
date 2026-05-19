import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

function tripDuration(arrival: string | undefined, departure: string | undefined): string {
  if (!arrival || !departure) return '—'
  try {
    const days = differenceInDays(new Date(departure), new Date(arrival))
    if (days <= 0) return '—'
    return `${days} día${days !== 1 ? 's' : ''}`
  } catch {
    return '—'
  }
}

export function getClientConfirmationEmail(formData: any): string {
  const c = formData.step1Contact || {}
  const t = formData.step4Travel || {}

  const firstName = (c.fullName || '').split(' ')[0] || c.fullName || 'Hola'

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

    <!-- Greeting -->
    <p style="font-size:22px;font-weight:bold;color:#FFFFFF;margin:0 0 16px 0;">¡Hola ${firstName}!</p>
    <p style="font-size:15px;color:#CCC;line-height:1.6;margin:0 0 28px 0;">
      Recibimos tu aplicación de visa de turismo a Estados Unidos. Nuestro equipo va a revisar tu información y te contactaremos por WhatsApp en menos de 24 horas con los siguientes pasos para diligenciar tu DS-160.
    </p>

    <!-- Recap Card -->
    <div style="background:#0F0F0F;border:1px solid #1E1E1E;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:12px;color:#C8FF00;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">Resumen de tu aplicación</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;width:160px;">Nombre completo</td>
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
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;">Fecha estimada</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${formatDate(t.arrivalDate)}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px 5px 0;color:#888;font-size:13px;">Duración del viaje</td>
          <td style="padding:5px 0;color:#F0F0F0;font-size:13px;">${tripDuration(t.arrivalDate, t.departureDate)}</td>
        </tr>
      </table>
    </div>

    <!-- What's next -->
    <div style="margin-bottom:28px;">
      <div style="font-size:16px;font-weight:bold;color:#FFFFFF;margin-bottom:16px;">¿Qué sigue?</div>
      <div style="display:flex;margin-bottom:14px;">
        <div style="min-width:28px;height:28px;background:#C8FF00;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#050505;margin-right:14px;flex-shrink:0;text-align:center;line-height:28px;">1</div>
        <p style="margin:0;font-size:14px;color:#CCC;line-height:1.6;padding-top:4px;">Revisaremos tu aplicación y validaremos que toda la información esté correcta</p>
      </div>
      <div style="display:flex;margin-bottom:14px;">
        <div style="min-width:28px;height:28px;background:#C8FF00;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#050505;margin-right:14px;flex-shrink:0;text-align:center;line-height:28px;">2</div>
        <p style="margin:0;font-size:14px;color:#CCC;line-height:1.6;padding-top:4px;">Agendaremos tu sesión 1-on-1 para diligenciar el DS-160 oficial juntos</p>
      </div>
      <div style="display:flex;margin-bottom:14px;">
        <div style="min-width:28px;height:28px;background:#C8FF00;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#050505;margin-right:14px;flex-shrink:0;text-align:center;line-height:28px;">3</div>
        <p style="margin:0;font-size:14px;color:#CCC;line-height:1.6;padding-top:4px;">Te preparamos para tu entrevista en la embajada con tips y simulacros</p>
      </div>
    </div>

    <!-- Photo notice -->
    <div style="background:#0F1A0F;border:1px solid #1E3A1E;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:14px;font-weight:bold;color:#C8FF00;margin-bottom:10px;">📸 Sobre las fotos</div>
      <p style="margin:0 0 10px 0;font-size:13px;color:#CCC;line-height:1.5;">En las próximas horas te vamos a escribir por WhatsApp pidiéndote 2 fotos importantes:</p>
      <ol style="margin:0 0 8px 0;padding-left:18px;color:#CCC;font-size:13px;line-height:1.9;">
        <li>Foto de la página de datos de tu pasaporte</li>
        <li>Foto tipo visa (fondo blanco, frente, sin lentes ni sombrero)</li>
      </ol>
      <p style="margin:0;font-size:12px;color:#666;">Tenelas listas en tu celular para que el proceso sea más rápido.</p>
    </div>

    <!-- Error correction note -->
    <div style="background:#0F0F0F;border:1px solid #1E1E1E;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">Si encontraste algún error en lo que llenaste, no te preocupes — respondé este email y lo corregimos al toque.</p>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#0A0A0A;border-top:1px solid #1A1A1A;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:13px;color:#666;">¿Preguntas urgentes? Escribinos a <a href="mailto:future@latamvisas.com.au" style="color:#C8FF00;">future@latamvisas.com.au</a></p>
    <p style="margin:0;font-size:11px;color:#333;line-height:1.5;">LATAM VISA es una consultora de planeación de viaje y estudio. No somos agentes registrados de migración (RMA).</p>
  </div>

</div>
</body>
</html>`
}
