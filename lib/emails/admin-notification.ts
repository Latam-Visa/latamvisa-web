import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const nationalityFlags: Record<string, string> = {
  'Colombia': '🇨🇴', 'Venezuela': '🇻🇪', 'México': '🇲🇽', 'Peru': '🇵🇪', 'Perú': '🇵🇪',
  'Argentina': '🇦🇷', 'Ecuador': '🇪🇨', 'Chile': '🇨🇱', 'Bolivia': '🇧🇴',
  'Brasil': '🇧🇷', 'Uruguay': '🇺🇾', 'Paraguay': '🇵🇾', 'Cuba': '🇨🇺',
  'Guatemala': '🇬🇹', 'Honduras': '🇭🇳', 'El Salvador': '🇸🇻', 'Nicaragua': '🇳🇮',
  'Costa Rica': '🇨🇷', 'Panamá': '🇵🇦', 'República Dominicana': '🇩🇴',
}

function flag(nationality: string): string {
  return nationalityFlags[nationality] || '🌎'
}

function sanitizeWhatsApp(phone: string): string {
  return phone.replace(/[\+\s\-\(\)]/g, '')
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function getAdminNotificationEmail(
  formData: any,
  applicationId: string,
  signedPhotoUrls: { passport?: string; previousVisa?: string; visaPhoto?: string },
  submittedAt: string,
  ipAddress: string
): string {
  const c = formData.step1Contact || {}
  const p = formData.step2Personal || {}
  const t = formData.step4Travel || {}
  const w = formData.step7Work || {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://latamvisatravel.com'
  const waNumber = sanitizeWhatsApp(c.whatsapp || '')
  const firstName = (c.fullName || '').split(' ')[0]

  const waMsg = encodeURIComponent(
    `Hola ${firstName}! Recibimos tu aplicación de visa USA. Para continuar necesito 2 fotos: 1) Pasaporte (página de datos) 2) Foto tipo visa con fondo blanco. ¡Gracias!`
  )

  const photoRow = (label: string, url: string | undefined) => {
    if (!url) return ''
    return `
      <tr>
        <td style="padding:8px 12px 8px 0;color:#888;font-size:13px;width:160px;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;font-size:13px;">
          <a href="${url}" target="_blank" style="color:#C8FF00;text-decoration:none;">🔗 Ver foto (válida 1h)</a>
        </td>
      </tr>`
  }

  const hasAnyPhoto = signedPhotoUrls.passport || signedPhotoUrls.visaPhoto || signedPhotoUrls.previousVisa

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#050505;color:#F0F0F0;">

  <!-- Header -->
  <div style="background:#0A0A0A;border-bottom:2px solid #C8FF00;padding:28px 32px;">
    <div style="font-size:26px;font-weight:900;color:#C8FF00;letter-spacing:-0.5px;">LATAM VISA</div>
    <div style="font-size:20px;color:#F0F0F0;margin-top:8px;font-weight:bold;">🚨 Nueva aplicación recibida</div>
  </div>

  <div style="padding:28px 32px;">

    <!-- Summary Card -->
    <div style="background:#0F0F0F;border:1px solid #222;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;width:160px;">Cliente</td>
          <td style="padding:6px 0;color:#F0F0F0;font-size:15px;font-weight:bold;">${c.fullName || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">País</td>
          <td style="padding:6px 0;color:#F0F0F0;font-size:13px;">${flag(p.nationality || '')} ${p.nationality || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Email</td>
          <td style="padding:6px 0;font-size:13px;">
            <a href="mailto:${c.email || ''}" style="color:#C8FF00;text-decoration:none;">${c.email || '—'}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">WhatsApp</td>
          <td style="padding:6px 0;font-size:13px;">
            <a href="https://wa.me/${waNumber}" style="color:#C8FF00;text-decoration:none;">${c.whatsapp || '—'}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Tipo de visa</td>
          <td style="padding:6px 0;color:#F0F0F0;font-size:13px;">${t.usaVisaType || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Fecha estimada de viaje</td>
          <td style="padding:6px 0;color:#F0F0F0;font-size:13px;">${formatDate(t.arrivalDate)}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Salario mensual</td>
          <td style="padding:6px 0;color:#F0F0F0;font-size:13px;">${w.monthlySalaryUsd ? 'USD ' + w.monthlySalaryUsd : '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Application ID</td>
          <td style="padding:6px 0;color:#555;font-size:11px;font-family:monospace;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;">Recibida</td>
          <td style="padding:6px 0;color:#777;font-size:12px;">${submittedAt}</td>
        </tr>
      </table>
    </div>

    <!-- Big CTA Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${appUrl}/admin/applications/${applicationId}"
         style="display:inline-block;background:#C8FF00;color:#050505;padding:16px 32px;border-radius:10px;font-weight:bold;font-size:15px;text-decoration:none;">
        📋 Ver aplicación completa en el dashboard
      </a>
    </div>

    <!-- Secondary Actions -->
    <div style="margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding-right:8px;width:50%;">
            <a href="https://wa.me/${waNumber}?text=${waMsg}"
               style="display:block;background:#25D366;color:#FFF;text-align:center;padding:12px 16px;border-radius:8px;font-weight:bold;font-size:13px;text-decoration:none;">
              💬 WhatsApp al cliente
            </a>
          </td>
          <td style="width:50%;">
            <a href="mailto:${c.email || ''}"
               style="display:block;background:#1C1C1C;color:#F0F0F0;border:1px solid #333;text-align:center;padding:12px 16px;border-radius:8px;font-weight:bold;font-size:13px;text-decoration:none;">
              ✉️ Responder email
            </a>
          </td>
        </tr>
      </table>
    </div>

    ${hasAnyPhoto ? `
    <!-- Photos -->
    <div style="background:#0A0A0A;border:1px solid #222;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:13px;font-weight:bold;color:#C8FF00;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">📸 Fotos del cliente</div>
      <table style="width:100%;border-collapse:collapse;">
        ${photoRow('Foto de pasaporte', signedPhotoUrls.passport)}
        ${photoRow('Foto tipo visa', signedPhotoUrls.visaPhoto)}
        ${photoRow('Visa anterior', signedPhotoUrls.previousVisa)}
      </table>
    </div>` : ''}

  </div>

  <!-- Footer -->
  <div style="background:#0A0A0A;border-top:1px solid #1A1A1A;padding:20px 32px;text-align:center;">
    <div style="font-size:11px;color:#444;">LATAM VISA — Travel & Education Consultancy</div>
  </div>

</div>
</body>
</html>`
}
