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

export function getClientConfirmationEmail(
  formData: any,
  destination: 'usa' | 'canada' | 'uk' | 'schengen' = 'usa'
): string {
  let name = '';
  let email = '';
  let visaType = '';
  let travelDate = '';
  let destName = '';

  if (destination === 'usa') {
    name = formData.step1Contact?.fullName || '';
    email = formData.step1Contact?.email || '';
    visaType = formData.step4Travel?.usaVisaType || 'Turismo';
    travelDate = formatDate(formData.step4Travel?.arrivalDate);
    destName = 'Estados Unidos';
  } else if (destination === 'canada') {
    name = `${formData.given_name || ''} ${formData.surname || ''}`.trim();
    email = formData.email || '';
    visaType = formData.apply_for || 'Turismo';
    travelDate = formatDate(formData.entry_date);
    destName = 'Canadá';
  } else if (destination === 'uk') {
    name = `${formData.first_name || ''} ${formData.last_name || ''}`.trim();
    email = formData.email || '';
    visaType = 'UK Visitor Visa';
    travelDate = formatDate(formData.proposed_entry_date);
    destName = 'Reino Unido';
  } else if (destination === 'schengen') {
    name = `${formData.first_names || ''} ${formData.surname || ''}`.trim();
    email = formData.home_email || '';
    visaType = `Schengen - ${formData.destination_country || 'Europa'}`;
    travelDate = formatDate(formData.entry_date);
    destName = 'Europa (Schengen)';
  }

  const firstName = name.split(' ')[0] || 'Hola';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;color:#0A0A0A;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);margin-top:20px;margin-bottom:20px;">

  <!-- Header -->
  <div style="background:#2F4A00;border-bottom:4px solid #C8FF00;padding:24px 32px;text-align:center;">
    <div style="font-size:24px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">LATAM VISA</div>
  </div>

  <div style="padding:40px 32px;">

    <p style="font-size:24px;font-weight:bold;color:#2F4A00;margin:0 0 16px 0;">¡Hola, ${firstName}!</p>

    <p style="font-size:16px;color:#333333;line-height:1.7;margin:0 0 28px 0;">
      Recibimos tu solicitud de visa para ${destName} con éxito. Nos emociona acompañarte en este paso y conectar tus sueños con nuevas oportunidades.
    </p>

    <!-- Application Summary -->
    <div style="background:#FAFAF7;border:1px solid #E5E5E5;border-left:4px solid #2F4A00;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:13px;color:#2F4A00;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">📌 Resumen de tu solicitud</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#666666;font-size:14px;width:160px;font-weight:500;">Nombre</td>
          <td style="padding:6px 0;color:#0A0A0A;font-size:14px;font-weight:600;">${name || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#666666;font-size:14px;font-weight:500;">Email</td>
          <td style="padding:6px 0;color:#0A0A0A;font-size:14px;font-weight:600;">${email || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#666666;font-size:14px;font-weight:500;">Tipo de visa</td>
          <td style="padding:6px 0;color:#0A0A0A;font-size:14px;font-weight:600;">${visaType || 'Turismo'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#666666;font-size:14px;font-weight:500;">Fecha de viaje</td>
          <td style="padding:6px 0;color:#0A0A0A;font-size:14px;font-weight:600;">${travelDate}</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <p style="margin:0 0 24px 0;font-size:16px;color:#333333;line-height:1.6;">
      <strong>Próximos pasos:</strong> Nuestro equipo revisará tu información detalladamente y te contactaremos por WhatsApp en las próximas 24 horas para indicarte cómo continuamos.
    </p>
    
    <p style="margin:0 0 28px 0;font-size:16px;color:#333333;line-height:1.6;">
      Hemos adjuntado un documento PDF con el resumen completo de la información que nos enviaste para tus registros.
    </p>

    <!-- Button -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://wa.me/61426779731" style="display:inline-block;background:#C8FF00;color:#0A0A0A;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:8px;">Contáctanos por WhatsApp</a>
    </div>

    <p style="font-size:15px;color:#555555;margin:0;">
      Un cálido saludo,<br>
      <strong style="color:#2F4A00;">El equipo de LATAM VISA</strong>
    </p>

  </div>

  <!-- Footer -->
  <div style="background:#FAFAF7;border-top:1px solid #E5E5E5;padding:24px 32px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:12px;color:#888888;line-height:1.6;">
      LATAM VISA es una agencia de asesoría migratoria y educativa.
    </p>
    <p style="margin:0;font-size:12px;color:#888888;">
      <a href="mailto:future@latamvisas.com.au" style="color:#2F4A00;text-decoration:none;font-weight:500;">future@latamvisas.com.au</a>
      &nbsp;·&nbsp; latamvisa.com
    </p>
  </div>

</div>
</body>
</html>`
}
