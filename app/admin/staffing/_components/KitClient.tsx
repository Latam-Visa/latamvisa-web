"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, Megaphone, Shirt, Sparkles, Info } from 'lucide-react'

// ---------------------------------------------------------------------------
// Copia al portapapeles con feedback visual
// ---------------------------------------------------------------------------
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800)
    } catch {
      // Fallback silencioso: seleccionar no es crítico
    }
  }
  return { copied, copy }
}

export function KitClient() {
  const { copied, copy } = useCopy()
  const [mensaje, setMensaje] = useState(MENSAJE_LARGO)

  return (
    <div className="space-y-8">
      {/* ===================== MENSAJE ===================== */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C8FF00] text-[#2F4A00]"><Megaphone className="h-4 w-4" /></span>
          <h2 className="text-[17px] font-bold text-[#0d2b0d]">Mensaje para publicar</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-[#E8E8E3] bg-white"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#F2F2EC] bg-[#FBFBF8] px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#0d2b0d]"><Megaphone className="h-3.5 w-3.5 text-[#2F4A00]" /> Waiters &amp; Waitresses · Brisbane CBD</span>
            <span className="rounded-full bg-[#F2FBDD] px-2 py-0.5 text-[10px] font-bold text-[#2F4A00]">Editable</span>
          </div>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={22}
            spellCheck={false}
            className="w-full resize-y border-0 px-4 py-4 text-[13.5px] leading-relaxed text-[#2A2A24] focus:outline-none focus:ring-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F2F2EC] p-3">
            <p className="flex items-center gap-1.5 text-[12px] text-[#9A9A94]"><Info className="h-3.5 w-3.5 shrink-0" /> Edítalo si cambian turnos, pagos o el número. Se copia tal cual lo ves.</p>
            <div className="flex items-center gap-2">
              {mensaje !== MENSAJE_LARGO && (
                <button onClick={() => setMensaje(MENSAJE_LARGO)} className="rounded-xl border border-[#E8E8E3] px-3 py-2.5 text-sm font-bold text-[#6B6B6B] hover:bg-[#F6F6F2]">
                  Restaurar
                </button>
              )}
              <button
                onClick={() => copy('msg', mensaje)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${copied === 'msg' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#C8FF00] text-[#2F4A00] hover:bg-[#bdf000]'}`}
              >
                {copied === 'msg' ? <><Check className="h-4 w-4" /> ¡Copiado!</> : <><Copy className="h-4 w-4" /> Copiar mensaje</>}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===================== GUÍA DE PRESENTACIÓN ===================== */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2b0d] text-[#C8FF00]"><Shirt className="h-4 w-4" /></span>
          <h2 className="text-[17px] font-bold text-[#0d2b0d]">Guía de presentación para el candidato</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E8E8E3] bg-white">
          <div className="border-b border-[#F2F2EC] bg-gradient-to-br from-[#0d2b0d] to-[#1c4722] p-5 text-white">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#C8FF00]" />
              <div>
                <h3 className="text-[15px] font-bold">Vas a trabajar en tiendas de lujo (Cartier, Paspaley, Fendi).</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/70">
                  La primera impresión lo es todo: ropa formal, sobria y bien planchada. No necesitas gastar una fortuna, pero sí invertir en un
                  look pulcro. <strong className="text-[#C8FF00]">La actitud y la sonrisa pesan más que la marca.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Checklist esencial */}
          <div className="border-b border-[#F2F2EC] p-5">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">El look base</h4>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px] text-[#3A3A34]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2F4A00]" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Lista de compras con precios */}
          <div className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Dónde comprarlo · precio aprox.</h4>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#2F4A00]" /> Zara · mejor presentación</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#C8A2FF]" /> Forever 21 · económico</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#EFEFEA]">
              <table className="min-w-[560px] w-full text-[13px]">
                <thead className="bg-[#FBFBF8] text-[11px] uppercase tracking-wide text-[#B6B6AE]">
                  <tr>
                    <th className="p-3 text-left font-bold">Prenda</th>
                    <th className="p-3 text-left font-bold">Zara (AUD)</th>
                    <th className="p-3 text-left font-bold">Forever 21 (AUD)</th>
                    <th className="p-3 text-right font-bold">Buscar</th>
                  </tr>
                </thead>
                <tbody>
                  {LOOK.map((l) => (
                    <tr key={l.item} className="border-t border-[#F2F2EC]">
                      <td className="p-3 font-semibold text-[#0d2b0d]">{l.item}</td>
                      <td className="p-3"><span className="rounded-full bg-[#F2FBDD] px-2 py-0.5 text-[12px] font-bold text-[#2F4A00]">{l.zara}</span></td>
                      <td className="p-3"><span className="rounded-full bg-[#F3EDFF] px-2 py-0.5 text-[12px] font-bold text-[#6D3BBF]">{l.f21}</span></td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={zaraUrl(l.q)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E3] px-2 py-1 text-[11px] font-bold text-[#2F4A00] hover:bg-[#F2FBDD]">Zara <ExternalLink className="h-3 w-3" /></a>
                          <a href={f21Url(l.q)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E3] px-2 py-1 text-[11px] font-bold text-[#6D3BBF] hover:bg-[#F3EDFF]">F21 <ExternalLink className="h-3 w-3" /></a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#EFEFEA] bg-[#FBFBF8]">
                    <td className="p-3 font-bold text-[#0d2b0d]">Look completo (aprox.)</td>
                    <td className="p-3 font-bold text-[#2F4A00]">~$300–$400</td>
                    <td className="p-3 font-bold text-[#6D3BBF]">~$150–$200</td>
                    <td className="p-3" />
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[12px] text-[#9A9A94]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Precios aproximados en AUD; varían por temporada y disponibilidad. Los botones abren la búsqueda de cada prenda en la tienda.
            </p>

            <button
              onClick={() => copy('guia', textoGuia())}
              className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${copied === 'guia' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#0d2b0d] text-white hover:bg-[#143b16]'}`}
            >
              {copied === 'guia' ? <><Check className="h-4 w-4" /> ¡Copiada!</> : <><Copy className="h-4 w-4" /> Copiar guía para enviar al candidato</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contenido
// ---------------------------------------------------------------------------

const MENSAJE_LARGO = `WAITERS & WAITRESSES WANTED – BRISBANE CBD ✨

Hi everyone!

We're looking for waiters and waitresses for luxury boutiques in Brisbane CBD.

Regular shifts until Christmas, maybe longer.

Shifts: weekdays and weekends, 10am–5pm, and Thursday to Sunday, 11am–3pm.

Pay:
$33.05/hr weekdays,
$38.86 Saturdays,
$42.41 Sundays.

You need good English, a professional look and to be reliable until 24 December.

No experience needed, we train you.

If you're interested, send me a WhatsApp at 0426779734 with 2 photos, your English level and your availability.

Thanks!`

const CHECKLIST = [
  'Blazer estructurado (negro o azul marino)',
  'Blusa o camisa blanca impecable',
  'Pantalón sastre o vestido formal a la rodilla',
  'Zapato cerrado o tacón bajo cómodo',
  'Accesorios discretos (nada llamativo)',
  'Cabello recogido/peinado y uñas limpias',
  'Maquillaje natural / afeitado prolijo',
  'Ropa planchada y sin manchas',
]

const LOOK = [
  { item: 'Blazer estructurado', zara: '$99–$139', f21: '$45–$60', q: 'blazer' },
  { item: 'Camisa / blusa blanca', zara: '$49–$69', f21: '$25–$35', q: 'white shirt' },
  { item: 'Pantalón sastre negro', zara: '$69–$89', f21: '$35–$45', q: 'tailored trousers' },
  { item: 'Vestido formal (alternativa)', zara: '$79–$119', f21: '$40–$55', q: 'midi dress' },
  { item: 'Zapato cerrado / tacón bajo', zara: '$69–$99', f21: '$40', q: 'court heels' },
]

const zaraUrl = (q: string) => `https://www.zara.com/au/en/search?searchTerm=${encodeURIComponent(q)}`
const f21Url = (q: string) => `https://www.forever21.com/us/shop?q=${encodeURIComponent(q)}`

function textoGuia() {
  return `👔 GUÍA DE PRESENTACIÓN

Vas a trabajar en tiendas de lujo, así que la presentación es clave. No tienes que gastar una fortuna, pero sí lucir pulcro y formal. La actitud y la sonrisa pesan más que la marca ✨

EL LOOK BASE:
${CHECKLIST.map((c) => `• ${c}`).join('\n')}

DÓNDE COMPRARLO (precios aprox. en AUD):
${LOOK.map((l) => `• ${l.item}: Zara ${l.zara} / Forever 21 ${l.f21}`).join('\n')}

Look completo: ~$300–$400 en Zara (mejor presentación) o ~$150–$200 en Forever 21 (económico).

Tip: busca cada prenda en zara.com/au o forever21.com. ¡Nos vemos pronto! 💚`
}
