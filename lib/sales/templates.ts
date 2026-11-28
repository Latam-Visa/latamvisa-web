// Plantillas de correo de ventas. La app NO envía correos: solo copia y abre mailto:.
import type { Segment } from './index'

export type TemplateKey = Segment | 'follow_up'

export const TEMPLATES: Record<TemplateKey, { label: string; subject: string; body: string }> = {
  luxury_retail: {
    label: 'Luxury retail',
    subject: 'Butlers and greeters for [Company] Brisbane',
    body: `Hi [Name],
I'm Cristian from Colette & Louis. We provide butlers, greeters and doormen for luxury boutiques, and we already work with brands like Cartier, Paspaley and Fendi here in Brisbane.
With the Christmas season coming, would extra support at the door or for VIP clients help your team?
Happy to send our rates or drop by the boutique.
Thanks,
Cristian
Reply STOP if you'd prefer not to hear from me.`,
  },
  office_cleaning: {
    label: 'Office cleaning',
    subject: 'After-hours cleaning for [Company]',
    body: `Hi [Name],
I'm Cristian from Savoy Cleaning, part of Colette & Louis. We clean luxury boutiques and corporate offices after hours, with teams trained for high-end spaces.
Would you be open to a quick quote for your space in Brisbane?
Thanks,
Cristian
Reply STOP if you'd prefer not to hear from me.`,
  },
  construction_cleaning: {
    label: 'Construction cleaning',
    subject: 'Builders clean for your sites',
    body: `Hi [Name],
I'm Cristian. I've worked on construction sites here in Brisbane and now work with Savoy Cleaning. We do builders cleans and final cleans before handover.
Do you have any project finishing soon where we could help?
Thanks,
Cristian
Reply STOP if you'd prefer not to hear from me.`,
  },
  follow_up: {
    label: 'Follow-up',
    subject: '',
    body: 'Hi [Name], just following up on my last email. Happy to send more info or meet in person. Thanks!',
  },
}

export function fillTemplate(key: TemplateKey, p: { full_name: string; company: string | null; segment: Segment }) {
  const nombre = p.full_name.trim().split(/\s+/)[0] || 'there'
  const empresa = p.company?.trim() || 'your company'
  const llenar = (t: string) => t.replaceAll('[Name]', nombre).replace(/\[(Company|Brand)\]/g, () => empresa)
  const t = TEMPLATES[key]
  // El follow-up responde al asunto del primer correo del segmento.
  const subject = key === 'follow_up' ? `Re: ${llenar(TEMPLATES[p.segment].subject)}` : llenar(t.subject)
  return { subject, body: llenar(t.body) }
}
