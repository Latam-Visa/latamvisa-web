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

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

function bool(val: boolean | string | undefined): string {
  if (val === undefined || val === null || val === '') return '—'
  return val === true || val === 'true' ? 'Sí' : 'No'
}

function str(val: any): string {
  if (val === undefined || val === null || val === '') return '—'
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
  return String(val)
}

function sanitizeWhatsApp(phone: string): string {
  return phone.replace(/[\+\s\-\(\)]/g, '')
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;width:180px;">${label}</td>
      <td style="padding:6px 0;color:#F0F0F0;font-size:13px;vertical-align:top;">${value || '—'}</td>
    </tr>`
}

function section(title: string, rows: string): string {
  return `
    <div style="margin-bottom:24px;">
      <div style="background:#111;border-left:3px solid #C8FF00;padding:8px 14px;margin-bottom:12px;">
        <span style="color:#C8FF00;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${title}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`
}

export function getAdminNotificationEmail(
  formData: any,
  applicationId: string,
  signedPhotoUrls: { passport?: string; previousVisa?: string; visaPhoto?: string },
  submittedAt: string,
  ipAddress: string
): string {
  const d = formData
  const c = d.step1Contact || {}
  const p = d.step2Personal || {}
  const pas = d.step3Passport || {}
  const t = d.step4Travel || {}
  const v = d.step5VisaHistory || {}
  const f = d.step6Family || {}
  const w = d.step7Work || {}
  const a = d.step8Additional || {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://latamvisatravel.com'
  const waNumber = sanitizeWhatsApp(c.whatsapp || '')
  const submittedFormatted = formatDate(submittedAt.split('T')[0])

  // Travel companions list
  const companionsList = Array.isArray(t.travelCompanions) && t.travelCompanions.length
    ? t.travelCompanions.map((tc: any, i: number) =>
        `<li style="margin-bottom:4px;">${i + 1}. ${str(tc.fullName)} — ${str(tc.relationship)}</li>`
      ).join('')
    : '<li style="color:#888;">—</li>'

  // Family in USA list
  const familyInUsaList = Array.isArray(f.familyInUsaDetails) && f.familyInUsaDetails.length
    ? f.familyInUsaDetails.map((fm: any, i: number) =>
        `<li style="margin-bottom:4px;">${i + 1}. ${str(fm.fullName)} — ${str(fm.relationship)} (${str(fm.statusInUsa)})</li>`
      ).join('')
    : '<li style="color:#888;">—</li>'

  // Education details
  const educationList = Array.isArray(w.educationDetails) && w.educationDetails.length
    ? w.educationDetails.map((ed: any, i: number) =>
        `<li style="margin-bottom:4px;">${i + 1}. ${str(ed.institution)} — ${str(ed.courseOfStudy)} (${str(ed.startDate)} a ${str(ed.endDate)})</li>`
      ).join('')
    : '<li style="color:#888;">—</li>'

  // Accommodation
  const accommodationList = Array.isArray(t.accommodation) && t.accommodation.length
    ? t.accommodation.map((ac: any, i: number) =>
        `<li style="margin-bottom:4px;">${i + 1}. ${str(ac.type)}: ${str(ac.address)}</li>`
      ).join('')
    : '<li style="color:#888;">—</li>'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#050505;color:#F0F0F0;">

  <!-- Header -->
  <div style="background:#0A0A0A;border-bottom:2px solid #C8FF00;padding:28px 32px;">
    <div style="font-size:26px;font-weight:900;color:#C8FF00;letter-spacing:-0.5px;">LATAM VISA</div>
    <div style="font-size:20px;color:#F0F0F0;margin-top:8px;font-weight:bold;">🚨 Nueva aplicación recibida</div>
    <div style="font-size:12px;color:#555;margin-top:6px;font-family:monospace;">${applicationId}</div>
    <div style="font-size:12px;color:#555;margin-top:2px;">${submittedFormatted} · IP: ${ipAddress}</div>
  </div>

  <div style="padding:28px 32px;">

    <!-- Summary Card -->
    <div style="background:#0F0F0F;border:1px solid #222;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:22px;font-weight:bold;color:#FFFFFF;margin-bottom:4px;">${str(c.fullName)}</div>
      <div style="font-size:14px;color:#888;margin-bottom:16px;">${flag(str(p.nationality))} ${str(p.nationality)}</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Email', `<a href="mailto:${str(c.email)}" style="color:#C8FF00;">${str(c.email)}</a>`)}
        ${row('WhatsApp', `<a href="https://wa.me/${waNumber}" style="color:#C8FF00;">+${waNumber}</a>`)}
        ${row('Tipo de visa', str(t.usaVisaType))}
        ${row('Fecha estimada', str(t.arrivalDate))}
        ${row('Salario mensual', str(w.monthlySalaryUsd) !== '—' ? 'USD ' + str(w.monthlySalaryUsd) : '—')}
      </table>
    </div>

    <!-- Quick Actions -->
    <div style="margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${appUrl}/admin/applications/${applicationId}"
               style="display:block;background:#C8FF00;color:#050505;text-align:center;padding:12px 16px;border-radius:8px;font-weight:bold;font-size:13px;text-decoration:none;">
              📋 Ver en Dashboard
            </a>
          </td>
          <td style="padding-right:8px;">
            <a href="https://wa.me/${waNumber}"
               style="display:block;background:#25D366;color:#FFF;text-align:center;padding:12px 16px;border-radius:8px;font-weight:bold;font-size:13px;text-decoration:none;">
              💬 WhatsApp
            </a>
          </td>
          <td>
            <a href="mailto:${str(c.email)}"
               style="display:block;background:#1C1C1C;color:#F0F0F0;border:1px solid #333;text-align:center;padding:12px 16px;border-radius:8px;font-weight:bold;font-size:13px;text-decoration:none;">
              ✉️ Responder email
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Photo Links -->
    <div style="background:#0A0A0A;border:1px solid #222;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:14px;font-weight:bold;color:#C8FF00;margin-bottom:12px;">📷 Fotos del aplicante</div>
      ${signedPhotoUrls.passport
        ? `<p style="margin:0 0 8px 0;font-size:13px;">🛂 <strong>Foto del pasaporte:</strong> <a href="${signedPhotoUrls.passport}" style="color:#C8FF00;">Ver foto</a></p>`
        : `<p style="margin:0 0 8px 0;font-size:13px;color:#555;">🛂 Foto del pasaporte: no adjuntada</p>`}
      ${signedPhotoUrls.visaPhoto
        ? `<p style="margin:0 0 8px 0;font-size:13px;">🖼️ <strong>Foto tipo visa:</strong> <a href="${signedPhotoUrls.visaPhoto}" style="color:#C8FF00;">Ver foto</a></p>`
        : `<p style="margin:0 0 8px 0;font-size:13px;color:#555;">🖼️ Foto tipo visa: no adjuntada</p>`}
      ${signedPhotoUrls.previousVisa
        ? `<p style="margin:0 0 8px 0;font-size:13px;">📋 <strong>Foto visa anterior:</strong> <a href="${signedPhotoUrls.previousVisa}" style="color:#C8FF00;">Ver foto</a></p>`
        : ''}
      <p style="margin:12px 0 0 0;font-size:11px;color:#444;">Los enlaces expiran en 1 hora. Si necesitás verlas después, abrí la aplicación en el dashboard.</p>
    </div>

    <!-- Full Data Sections -->
    <div style="font-size:16px;font-weight:bold;color:#FFF;margin-bottom:20px;border-bottom:1px solid #222;padding-bottom:12px;">
      Datos completos del formulario
    </div>

    ${section('Paso 1 — Contacto', [
      row('Nombre completo', str(c.fullName)),
      row('Email', str(c.email)),
      row('WhatsApp', str(c.whatsapp)),
      row('País de residencia', str(c.currentCountry)),
      row('Ciudad', str(c.currentCity)),
      row('Dirección', str(c.currentAddress)),
      row('Código postal', str(c.currentPostcode)),
      row('Visa actual', str(c.currentVisaType)),
      row('Visa actual (otro)', str(c.currentVisaOther)),
      row('Redes sociales', str(c.socialMedia)),
    ].join(''))}

    ${section('Paso 2 — Información personal', [
      row('Género', str(p.gender)),
      row('Estado civil', str(p.maritalStatus)),
      row('Fecha de nacimiento', formatDate(p.dateOfBirth)),
      row('Ciudad de nacimiento', str(p.cityOfBirth)),
      row('Estado/Provincia de nacimiento', str(p.stateOfBirth)),
      row('Nacionalidad', `${flag(str(p.nationality))} ${str(p.nationality)}`),
      row('Número de identificación', str(p.identificationNumber)),
    ].join(''))}

    ${section('Paso 3 — Pasaporte', [
      row('Número de pasaporte', str(pas.passportNumber)),
      row('Fecha de emisión', formatDate(pas.passportIssueDate)),
      row('Fecha de expiración', formatDate(pas.passportExpiryDate)),
      row('País de emisión', str(pas.passportIssueCountry)),
      row('¿Perdido o robado?', bool(pas.passportLostStolen)),
      row('Detalles pérdida/robo', str(pas.passportLostDetails)),
    ].join(''))}

    ${section('Paso 4 — Viaje a USA', [
      row('Tipo de visa solicitada', str(t.usaVisaType)),
      row('Fecha de llegada estimada', formatDate(t.arrivalDate)),
      row('Fecha de salida estimada', formatDate(t.departureDate)),
      row('Ciudades a visitar', str(t.citiesToVisit)),
      row('Propósito del viaje', str((t as any).tripPurpose)),
      row('¿Quién paga el viaje?', str(t.tripPaidBy)),
      row('Detalles del pagador', str(t.tripPayerDetails)),
    ].join(''))}

    <div style="margin-bottom:24px;">
      <div style="background:#111;border-left:3px solid #C8FF00;padding:8px 14px;margin-bottom:12px;">
        <span style="color:#C8FF00;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Acompañantes de viaje</span>
      </div>
      <ul style="margin:0;padding-left:20px;color:#F0F0F0;font-size:13px;">${companionsList}</ul>
      <div style="margin-top:12px;">
        <span style="color:#888;font-size:13px;">Alojamiento:</span>
        <ul style="margin:4px 0 0 0;padding-left:20px;color:#F0F0F0;font-size:13px;">${accommodationList}</ul>
      </div>
    </div>

    ${section('Paso 5 — Historial de visas', [
      row('¿Visa negada antes?', bool(v.visaDeniedBefore)),
      row('Detalles negación', str(v.visaDeniedDetails)),
      row('¿Tuvo visa USA previa?', bool(v.hadPreviousUsaVisa)),
      row('Detalles visa previa', str(v.previousVisaDetails)),
    ].join(''))}

    ${section('Paso 6 — Familia', [
      row('Nombre del padre', str(f.fatherFullName)),
      row('Nacionalidad del padre', str(f.fatherNationality)),
      row('Fecha nac. del padre', formatDate(f.fatherDateOfBirth)),
      row('Nombre de la madre', str(f.motherFullName)),
      row('Nacionalidad de la madre', str(f.motherNationality)),
      row('Fecha nac. de la madre', formatDate(f.motherDateOfBirth)),
      row('¿Tiene familia en USA?', bool(f.familyInUsa)),
    ].join(''))}

    ${f.familyInUsa ? `
    <div style="margin-bottom:24px;">
      <div style="background:#111;border-left:3px solid #C8FF00;padding:8px 14px;margin-bottom:12px;">
        <span style="color:#C8FF00;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Familia en USA</span>
      </div>
      <ul style="margin:0;padding-left:20px;color:#F0F0F0;font-size:13px;">${familyInUsaList}</ul>
    </div>` : ''}

    ${section('Paso 7 — Trabajo y educación', [
      row('Ocupación', str(w.occupation)),
      row('Empresa actual', str(w.currentEmployer)),
      row('Salario mensual USD', str(w.monthlySalaryUsd) !== '—' ? 'USD ' + str(w.monthlySalaryUsd) : '—'),
      row('Responsabilidades', str(w.currentJobResponsibilities)),
      row('Empleador anterior', str(w.previousEmployer)),
      row('Nivel de educación', str(w.highestEducation)),
      row('Idiomas', str(w.languages)),
      row('Países visitados (5 años)', str(w.countriesVisited5Years)),
      row('Membresías u organizaciones', str(w.organizationsMembership)),
    ].join(''))}

    <div style="margin-bottom:24px;">
      <div style="background:#111;border-left:3px solid #C8FF00;padding:8px 14px;margin-bottom:12px;">
        <span style="color:#C8FF00;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Educación — detalle</span>
      </div>
      <ul style="margin:0;padding-left:20px;color:#F0F0F0;font-size:13px;">${educationList}</ul>
    </div>

    ${section('Paso 8 — Información adicional', [
      row('¿Servicio militar?', bool(a.militaryService)),
      row('¿Antecedentes penales?', bool(a.criminalRecord)),
      row('¿Condiciones médicas?', bool(a.medicalConditions)),
      row('¿Historial de deportación?', bool(a.deportationHistory)),
    ].join(''))}

  </div>

  <!-- Footer -->
  <div style="background:#0A0A0A;border-top:1px solid #1A1A1A;padding:20px 32px;text-align:center;">
    <div style="font-size:11px;color:#444;margin-bottom:4px;">Application ID: ${applicationId}</div>
    <div style="font-size:11px;color:#444;margin-bottom:4px;">Submitted: ${submittedAt} · IP: ${ipAddress}</div>
    <div style="font-size:11px;color:#333;margin-top:8px;">Generated by LATAM VISA system</div>
  </div>

</div>
</body>
</html>`
}
