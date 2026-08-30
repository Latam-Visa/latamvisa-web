import { CONTACT } from '@/lib/constants'

/* Shared tokens for the "Dos Vacaciones" campaign (/viajes).
   These are the campaign colours already in use across the travel work —
   lime #b5e533 on forest #006837 for actions — kept in one place so the six
   section components don't each restate them. Everything else (fonts, page
   greys) comes from tailwind.config.ts and globals.css. */

export const CAMPAIGN = {
  lime: '#b5e533',
  limeHover: '#a5d92a',
  forest: '#006837',
  ink: '#111111',
  card: '#FFFFFF',
  subtle: '#F5F5F0',
  border: '#E0E0E0',
} as const

export const whatsappHref = (message: string) =>
  `https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`

/** The campaign's single WhatsApp entry point, per the brief. */
export const WHATSAPP_MESSAGE = 'Hola! Quiero cotizar mi Euro Trip antes de ir a Latam'

/* Shared button classes — solid lime with forest text. Never a black fill:
   the project's design rules rule out black buttons and text boxes. */
const BTN_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-funnel ' +
  'text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.06em] sm:tracking-[0.08em] ' +
  'px-5 sm:px-7 h-12 transition-colors no-underline'

export const BTN_PRIMARY = `${BTN_BASE} bg-[#b5e533] text-[#006837] hover:bg-[#a5d92a]`

export const BTN_SECONDARY = `${BTN_BASE} border border-[#D4D4D4] bg-white text-[#111111] hover:border-[#111111]`

/** Small uppercase label used above each section title. */
export const KICKER =
  'font-funnel text-[11px] font-bold uppercase tracking-[0.18em] text-[#006837]'
