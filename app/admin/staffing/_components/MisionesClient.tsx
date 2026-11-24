"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy, Check, ExternalLink, Phone, Mail, MapPin, Info,
  UtensilsCrossed, DoorOpen, Flame, AlertTriangle, ClipboardList,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Copia al portapapeles con feedback visual (mismo patrón que el Kit)
// ---------------------------------------------------------------------------
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800)
    } catch {
      /* fallback silencioso */
    }
  }
  return { copied, copy }
}

const enc = (s: string) => encodeURIComponent(s)

// ---------------------------------------------------------------------------
// Datos de las misiones (editá acá cuando cambien)
// ---------------------------------------------------------------------------

interface Proveedor {
  nombre: string
  zona: string
  tel?: string
  email?: string
  web?: string
  fit: 'top' | 'backup'
  nota: string
}

const CANAPE_PROVEEDORES: Proveedor[] = [
  {
    nombre: 'Hypercater',
    zona: 'New Farm',
    tel: '0410270475',
    email: 'hello@hypercater.com.au',
    web: 'https://hypercater.com.au/delivered-pick-up-catering-menu',
    fit: 'top',
    nota: 'Venden para recoger (pickup en New Farm, sin mínimo de pedido). Avisar con 48h. Canapés casi idénticos a nuestro menú: salmón ahumado sobre blini de remolacha con caviar, ostras, vieiras, tartaletas de brie e higo. ~$5–$12 por pieza.',
  },
  {
    nombre: 'Rosalie Gourmet Market',
    zona: 'Paddington',
    tel: '0738766222',
    web: 'https://www.mustdobrisbane.com/node/36876',
    fit: 'top',
    nota: 'Canapés hechos frescos, pickup disponible casi todos los días del año (fríos y calientes). Sin email público — mejor llamar.',
  },
  {
    nombre: "The Canapé Shop (Wine & Dine'm)",
    zona: 'Woolloongabba',
    tel: '0738447810',
    web: 'https://express.winendinem.com/canape-shop',
    fit: 'backup',
    nota: 'Canapés pre-preparados y fríos (no necesitan chef en sitio). Confirmar que se puedan recoger.',
  },
  {
    nombre: 'William Wallace Group',
    zona: 'Brisbane (lujo)',
    web: 'https://williamwallacegroup.squarespace.com/luxury',
    fit: 'backup',
    nota: 'Nivel lujo — sus clientes son Tiffany, Louis Vuitton y Bvlgari (mismo nivel que Fendi). Probablemente servicio completo; preguntar si hacen bandejas para recoger. Contacto por su web.',
  },
]

const CANAPE_SUBJECT = 'Canapé order for pickup — Saturday 5 December'

const CANAPE_EMAIL_DEFAULT = `Hi there,

We're Colette et Louis — we provide front-of-house staff for luxury boutiques (Cartier, Fendi, Paspaley). We'd like to order canapés for pickup for a client event on Saturday 5 December.

What we're after:
• 4 canapé options — 3 savoury + 1 sweet
• 30 pieces of each flavour (120 pieces total)
• Elegant, premium presentation (e.g. smoked salmon blini, tartlets)
• Pickup / collection — no on-site chef needed

Could you please let us know:
1. Whether you can prepare this for Saturday 5 December
2. Which canapés you'd suggest for the 3 savoury + 1 sweet
3. Price per piece and the total
4. Pickup location & time, and how much notice you need

Thank you very much,
Cristian
Colette et Louis`

const CANAPE_LLAMADA = `"Hi, I need 4 canapé options — 3 savoury + 1 sweet, 30 pieces of each flavour (120 total) — for PICKUP (not catered on site) on Saturday 5 December. Can you do it, and what's the price per piece?"`

const DOORMAN_AD_DEFAULT = `Doorman – Luxury Boutique, Adelaide

We're looking for a reliable, well-presented Doorman for a luxury boutique in Adelaide. Ongoing position with fixed weekly shifts.

The role is simple: open the door, greet clients and give them a warm, professional welcome.

Shifts & pay
• Fixed weekly shifts, 20–34 hours per week
• Friday $33.00/hr
• Saturday $38.80/hr
• Sunday $42.41/hr

About you
• Polished, professional presentation
• Calm and composed, comfortable standing for long periods
• Good English
• Happy to buy a full black suit
• Looking for a long-term role
• Visa valid for at least one year (students welcome – we can work something out)
• No licence required

To apply, send me on WhatsApp: 2 photos, your experience and your English level. Please say you are applying for Adelaide.
WhatsApp: 0452 257 233`

const INDEED_AVISO = 'https://employers.indeed.com/jobs/view?employerJobId=aXJpOi8vYXBpcy5pbmRlZWQuY29tL0VtcGxveWVySm9iLzA3YzQ4YWUzLWM1MDUtNGVmZS1hM2NlLTkyMWVlMGVmMGU4ZA%3D%3D'

const GUMTREE_AVISO = 'https://www.gumtree.com.au/web/seller/listing/1345895915?posted=true'

const DOORMAN_CANALES: { label: string; url: string }[] = [
  { label: 'Indeed · aviso publicado (en revisión)', url: INDEED_AVISO },
  { label: 'Gumtree · aviso publicado', url: GUMTREE_AVISO },
  { label: 'SEEK · Adelaide', url: 'https://www.seek.com.au/' },
  { label: 'Indeed AU', url: 'https://au.indeed.com/' },
  { label: 'Gumtree Jobs · Adelaide', url: 'https://www.gumtree.com.au/s-jobs/adelaide/c9302l3001366' },
  { label: 'Jora', url: 'https://au.jora.com/' },
  { label: 'FB · "Latinos en Adelaide"', url: 'https://www.facebook.com/search/groups/?q=latinos%20en%20adelaide' },
  { label: 'FB · "Trabajos en Adelaide"', url: 'https://www.facebook.com/search/groups/?q=trabajos%20en%20adelaide' },
]

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
function Badge({ tone, children }: { tone: 'prio' | 'curso' | 'falta'; children: React.ReactNode }) {
  const map = {
    prio: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]',
    curso: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
    falta: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
  }
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[tone]}`}>{children}</span>
}

function CopyBtn({ id, text, label, copied, copy, dark }: { id: string; text: string; label: string; copied: string | null; copy: (id: string, t: string) => void; dark?: boolean }) {
  const active = copied === id
  const base = dark ? 'bg-[#0d2b0d] text-white hover:bg-[#143b16]' : 'bg-[#C8FF00] text-[#2F4A00] hover:bg-[#bdf000]'
  return (
    <button
      onClick={() => copy(id, text)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${active ? 'bg-[#DCFCE7] text-[#166534]' : base}`}
    >
      {active ? <><Check className="h-4 w-4" /> ¡Copiado!</> : <><Copy className="h-4 w-4" /> {label}</>}
    </button>
  )
}

// ===========================================================================
export function MisionesClient() {
  const { copied, copy } = useCopy()
  const [email, setEmail] = useState(CANAPE_EMAIL_DEFAULT)
  const [ad, setAd] = useState(DOORMAN_AD_DEFAULT)

  return (
    <div className="space-y-8">
      {/* ===================== MISIÓN 1 · CANAPÉS ===================== */}
      <section className="overflow-hidden rounded-2xl border border-[#E8E8E3] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2F2EC] bg-[#FBFBF8] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8FF00] text-[#2F4A00]"><UtensilsCrossed className="h-[18px] w-[18px]" /></span>
            <div>
              <h2 className="text-[16px] font-bold text-[#0d2b0d]">Canapés para Fendi</h2>
              <p className="text-[12px] text-[#9A9A94]">Pedido para el sábado 5 diciembre · recoger (sin chef en sitio)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge tone="prio"><Flame className="mr-1 inline h-3 w-3" />Prioridad</Badge>
            <Badge tone="curso">Correo enviado · esperar respuesta</Badge>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* El encargo */}
          <div className="rounded-xl border border-[#EFEFEA] bg-[#FBFBF8] p-4">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">El encargo (de Breno)</h3>
            <ul className="space-y-1 text-[13.5px] text-[#2A2A24]">
              <li>• <strong>4 opciones</strong>: 3 saladas + 1 dulce</li>
              <li>• <strong>30 piezas de cada sabor</strong> (120 en total)</li>
              <li>• Presentación elegante, estilo nuestro menú (salmón/blini, tartaletas…)</li>
              <li>• Que <strong>vendan para recoger</strong> (NO mandar chef) y puedan para el <strong>5/12</strong></li>
              <li>• <strong>Elegido por la clienta: Wine &amp; Dine&apos;m</strong> (Canape Shop, Woolloongabba) con mezcla 3x1: 25 jamón + 25 whipped ricotta · 25 smoked chicken + 25 yuzu lemon</li>
              <li>• Correo enviado a Emma Rushby el 24/11. <strong>Si no responden, llamar el miércoles 25/11 al (07) 3844 7810.</strong> Cerrar antes del 2/12; retiro el <strong>sábado 5/12, 9:30–11:00</strong></li>
              <li className="text-[#9A9A94]">• Descartados: Cuisine on Cue (ya probado) · FoodByWayne (es de Sídney)</li>
            </ul>
          </div>

          {/* Proveedores */}
          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Proveedores para llamar</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {CANAPE_PROVEEDORES.map((p) => (
                <div key={p.nombre} className={`rounded-xl border p-4 ${p.fit === 'top' ? 'border-[#C8FF00] bg-[#FBFFE9]' : 'border-[#E8E8E3] bg-white'}`}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#0d2b0d]">
                        {p.nombre}
                        {p.fit === 'top' && <span className="rounded-full bg-[#C8FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#2F4A00]">MEJOR</span>}
                      </div>
                      <p className="flex items-center gap-1 text-[12px] text-[#9A9A94]"><MapPin className="h-3 w-3" /> {p.zona}</p>
                    </div>
                  </div>
                  <p className="mb-3 text-[12.5px] leading-snug text-[#3A3A34]">{p.nota}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tel && (
                      <a href={`tel:${p.tel}`} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E3] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#2F4A00] hover:bg-[#F2FBDD]">
                        <Phone className="h-3.5 w-3.5" /> {p.tel.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}
                      </a>
                    )}
                    {p.email && (
                      <a href={`mailto:${p.email}?subject=${enc(CANAPE_SUBJECT)}&body=${enc(email)}`} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E3] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#1C7AE5] hover:bg-[#EAF3FF]">
                        <Mail className="h-3.5 w-3.5" /> Enviar correo
                      </a>
                    )}
                    {p.web && (
                      <a href={p.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E3] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#6B6B6B] hover:bg-[#F6F6F2]">
                        Web <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correo armado */}
          <div className="overflow-hidden rounded-xl border border-[#E8E8E3]">
            <div className="flex items-center justify-between gap-2 border-b border-[#F2F2EC] bg-[#FBFBF8] px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#0d2b0d]"><Mail className="h-3.5 w-3.5 text-[#1C7AE5]" /> Correo listo para enviar</span>
              <span className="rounded-full bg-[#F2FBDD] px-2 py-0.5 text-[10px] font-bold text-[#2F4A00]">Editable</span>
            </div>
            <div className="border-b border-[#F2F2EC] px-4 py-2 text-[12px] text-[#6B6B6B]">
              <span className="font-bold text-[#0d2b0d]">Asunto:</span> {CANAPE_SUBJECT}
            </div>
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rows={18}
              spellCheck={false}
              className="w-full resize-y border-0 px-4 py-3 text-[13px] leading-relaxed text-[#2A2A24] focus:outline-none focus:ring-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F2F2EC] p-3">
              <p className="flex items-center gap-1.5 text-[12px] text-[#9A9A94]"><Info className="h-3.5 w-3.5 shrink-0" /> El botón "Enviar correo" de cada proveedor abre tu correo con esto ya puesto.</p>
              <div className="flex items-center gap-2">
                {email !== CANAPE_EMAIL_DEFAULT && (
                  <button onClick={() => setEmail(CANAPE_EMAIL_DEFAULT)} className="rounded-xl border border-[#E8E8E3] px-3 py-2.5 text-sm font-bold text-[#6B6B6B] hover:bg-[#F6F6F2]">Restaurar</button>
                )}
                <CopyBtn id="canape-email" text={`Asunto: ${CANAPE_SUBJECT}\n\n${email}`} label="Copiar correo" copied={copied} copy={copy} />
              </div>
            </div>
          </div>

          {/* Guion de llamada */}
          <div className="rounded-xl border border-[#EFEFEA] bg-[#FBFBF8] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]"><Phone className="h-3.5 w-3.5" /> Qué decir por teléfono</h3>
              <CopyBtn id="canape-call" text={CANAPE_LLAMADA} label="Copiar" copied={copied} copy={copy} dark />
            </div>
            <p className="text-[13px] italic leading-relaxed text-[#3A3A34]">{CANAPE_LLAMADA}</p>
          </div>
        </div>
      </section>

      {/* ===================== MISIÓN 2 · DOORMAN ADELAIDE ===================== */}
      <section className="overflow-hidden rounded-2xl border border-[#E8E8E3] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2F2EC] bg-[#FBFBF8] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2b0d] text-[#C8FF00]"><DoorOpen className="h-[18px] w-[18px]" /></span>
            <div>
              <h2 className="text-[16px] font-bold text-[#0d2b0d]">Doorman nuevo · Adelaide</h2>
              <p className="text-[12px] text-[#9A9A94]">Conseguir un empleado (doorman/butler) para Adelaide</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge tone="prio"><Flame className="mr-1 inline h-3 w-3" />Prioridad</Badge>
            <Badge tone="curso">Indeed + Gumtree publicados</Badge>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Estado */}
          <div className="rounded-xl border border-[#EFEFEA] bg-[#FBFBF8] p-4 text-[13px] leading-relaxed text-[#2A2A24]">
            <p><strong>Publicado en Indeed</strong> (en revisión). <a href={INDEED_AVISO} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1C7AE5] underline underline-offset-2">Abrir el aviso</a></p>
            <p className="mt-1.5"><strong>Publicado en Gumtree</strong> (24/11). <a href={GUMTREE_AVISO} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1C7AE5] underline underline-offset-2">Abrir el aviso</a></p>
            <p className="mt-1.5">Turnos fijos 20–34 h/semana · Vie $33 · Sáb $38.80 · Dom $42.41/h. SEEK: pendiente (Basic $400 + GST); se decide si hacen falta más candidatos tras unos días.</p>
          </div>

          {/* Aviso editable */}
          <div className="overflow-hidden rounded-xl border border-[#E8E8E3]">
            <div className="flex items-center justify-between gap-2 border-b border-[#F2F2EC] bg-[#FBFBF8] px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#0d2b0d]"><DoorOpen className="h-3.5 w-3.5 text-[#2F4A00]" /> Aviso para publicar</span>
              <span className="rounded-full bg-[#F2FBDD] px-2 py-0.5 text-[10px] font-bold text-[#2F4A00]">Editable</span>
            </div>
            <textarea
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              rows={22}
              spellCheck={false}
              className="w-full resize-y border-0 px-4 py-3 text-[13px] leading-relaxed text-[#2A2A24] focus:outline-none focus:ring-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F2F2EC] p-3">
              <p className="flex items-center gap-1.5 text-[12px] text-[#9A9A94]"><Info className="h-3.5 w-3.5 shrink-0" /> Rellená pago, horario y fecha antes de publicarlo.</p>
              <div className="flex items-center gap-2">
                {ad !== DOORMAN_AD_DEFAULT && (
                  <button onClick={() => setAd(DOORMAN_AD_DEFAULT)} className="rounded-xl border border-[#E8E8E3] px-3 py-2.5 text-sm font-bold text-[#6B6B6B] hover:bg-[#F6F6F2]">Restaurar</button>
                )}
                <CopyBtn id="doorman-ad" text={ad} label="Copiar aviso" copied={copied} copy={copy} dark />
              </div>
            </div>
          </div>

          {/* Dónde publicar */}
          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Dónde publicarlo</h3>
            <div className="flex flex-wrap gap-2">
              {DOORMAN_CANALES.map((c) => (
                <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E8E3] bg-white px-3 py-2 text-[12.5px] font-bold text-[#2F4A00] hover:bg-[#F2FBDD]">
                  {c.label} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PENDIENTES ===================== */}
      <section className="overflow-hidden rounded-2xl border border-[#E8E8E3] bg-white">
        <div className="border-b border-[#F2F2EC] bg-[#FBFBF8] px-5 py-4">
          <h2 className="text-[16px] font-bold text-[#0d2b0d]">Pendientes</h2>
        </div>
        <ul className="divide-y divide-[#F2F2EC]">
          <li className="p-5 text-[13.5px] leading-relaxed text-[#2A2A24]">
            <p className="font-bold text-[#0d2b0d]">Luiza y los viernes</p>
            <p className="mt-1">Luiza <strong>sí puede trabajar los viernes</strong>, excepto <strong>este viernes 27/11</strong>. Al armar turnos, no asignarla ese día. Revisado el 24/11: no tiene turno el 27/11; su único viernes asignado más adelante es el 11/12.</p>
          </li>
          <li className="p-5 text-[13.5px] leading-relaxed text-[#2A2A24]">
            <p className="font-bold text-[#0d2b0d]">Seguimiento del doorman</p>
            <p className="mt-1">Revisar en unos días las respuestas de Indeed y Gumtree. Si no llegan candidatos con visa válida, decidir si se paga SEEK (Basic $400 + GST).</p>
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 px-1 text-[12px] text-[#B6B6AE]">
        <ClipboardList className="h-3.5 w-3.5 shrink-0" /> Estas misiones están escritas en el código (se actualizan con un cambio). Si querés poder agregarlas/marcarlas como hechas desde acá, lo conecto a la base de datos.
      </p>
    </div>
  )
}
