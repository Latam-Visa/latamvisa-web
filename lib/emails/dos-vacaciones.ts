import type { CotizacionInterna, CotizacionPublica } from '@/lib/viajes/cotizador'

/* Correos del cotizador "Dos Vacaciones". Funciones puras (asunto + html)
   para poder testearlas; el envío vive en lib/viajes/solicitud.ts.

   - cliente: resumen + rango aproximado + WhatsApp. NUNCA lleva netas.
   - interno: todos los datos del lead + el desglose legible. */

export const WHATSAPP_DOS_VACACIONES = '61426779734'
export const NOTA_RANGO = 'Valores aproximados, sujetos a disponibilidad. Tu cotización exacta te llega en las próximas 24 horas.'

export interface DatosLead {
  solicitud_id: string | null
  guardado: boolean
  nombre: string
  email: string
  celular: string
  ciudad_salida: string
  pais_latam: string
  fecha_ida: string
  fecha_vuelta: string
  europa_momento: 'ida' | 'vuelta'
  adultos: number
  ninos: number
  pasaporte: string
  visa_usa: boolean
  ciudades_europa: string[]
  sorprendanme: boolean
  dias_europa: number
  estilo: string[]
}

const SALIDAS: Record<string, string> = { BNE: 'Brisbane', SYD: 'Sídney', MEL: 'Melbourne' }

const esc = (t: unknown) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function fechaCorta(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', '')
}

const aud = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} AUD`

const personasTexto = (a: number, n: number) =>
  `${a} ${a === 1 ? 'adulto' : 'adultos'}${n > 0 ? ` y ${n} ${n === 1 ? 'niño' : 'niños'}` : ''}`

function ciudadesTexto(lead: DatosLead, publico: CotizacionPublica | null): string {
  if (publico && publico.ciudades.length > 0) return publico.ciudades.map((c) => `${c.ciudad} (${c.noches} ${c.noches === 1 ? 'noche' : 'noches'})`).join(', ')
  if (lead.sorprendanme) return `Sorpréndanme${lead.estilo.length ? ` · ${lead.estilo.join(', ')}` : ''}`
  return lead.ciudades_europa.join(', ') || '—'
}

const fila = (etiqueta: string, valor: string) => `
  <tr>
    <td style="padding:6px 12px 6px 0;color:#6B6B6B;font-size:14px;vertical-align:top;width:120px;">${etiqueta}</td>
    <td style="padding:6px 0;color:#0A0A0A;font-size:14px;">${valor}</td>
  </tr>`

const marco = (contenido: string) => `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;font-family:Arial,Helvetica,sans-serif;">
      ${contenido}
    </table>
  </td></tr>
</table>
</body>
</html>`

// ── Al cliente ──────────────────────────────────────────────────────────────

export function correoCliente(lead: DatosLead, publico: CotizacionPublica | null): { asunto: string; html: string } {
  const primerNombre = lead.nombre.trim().split(/\s+/)[0] || 'viajero'
  const mensajeWa = `Hola, soy ${primerNombre}. Acabo de pedir mi cotización de Dos Vacaciones y tengo una pregunta.`
  const linkWa = `https://wa.me/${WHATSAPP_DOS_VACACIONES}?text=${encodeURIComponent(mensajeWa)}`
  const momento = lead.europa_momento === 'ida' ? 'camino a Latam' : 'de regreso a Australia'

  const rango = publico
    ? `
      <tr><td style="padding:8px 28px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4FFC4;border-radius:10px;">
          <tr><td style="padding:18px 20px;">
            <div style="font-size:13px;color:#2F4A00;">Rango aproximado para tu Euro Trip</div>
            <div style="font-size:26px;font-weight:bold;color:#0A0A0A;margin-top:4px;">${esc(aud(publico.rango_min_aud))} – ${esc(aud(publico.rango_max_aud))}</div>
            <div style="font-size:13px;color:#2F4A00;margin-top:6px;">${publico.vuelos_estado === 'incluidos' ? 'Incluye vuelos aproximados, hoteles y traslados.' : 'Incluye hoteles y traslados. Los vuelos te los confirmamos en tu cotización.'}</div>
            <div style="font-size:12px;color:#525252;margin-top:10px;">${NOTA_RANGO}</div>
          </td></tr>
        </table>
      </td></tr>`
    : `
      <tr><td style="padding:8px 28px 0;font-size:15px;color:#0A0A0A;line-height:1.5;">
        Ya tenemos todo lo que necesitamos. ${NOTA_RANGO.replace('Valores aproximados, sujetos a disponibilidad. ', '')}
      </td></tr>`

  const advertencias = publico && publico.advertencias.length > 0
    ? `
      <tr><td style="padding:16px 28px 0;">
        ${publico.advertencias.map((a) => `<p style="margin:0 0 8px;font-size:14px;color:#92400E;line-height:1.5;">• ${esc(a)}</p>`).join('')}
      </td></tr>`
    : ''

  const html = marco(`
      <tr><td style="padding:24px 28px 8px;">
        <div style="font-size:12px;letter-spacing:1px;color:#2F4A00;font-weight:bold;">LATAM VISA · DOS VACACIONES</div>
        <h1 style="margin:10px 0 0;font-size:22px;color:#0A0A0A;">¡Hola, ${esc(primerNombre)}!</h1>
        <p style="margin:10px 0 0;font-size:15px;color:#0A0A0A;line-height:1.5;">
          Recibimos tu solicitud y ya estamos armando tu escala en Europa ${momento}. Esto es lo que nos contaste:
        </p>
      </td></tr>
      <tr><td style="padding:8px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${fila('Sales de', esc(SALIDAS[lead.ciudad_salida] ?? lead.ciudad_salida))}
          ${fila('Vas a', esc(lead.pais_latam))}
          ${fila('Fechas', `${esc(fechaCorta(lead.fecha_ida))} – ${esc(fechaCorta(lead.fecha_vuelta))}`)}
          ${fila('En Europa', esc(ciudadesTexto(lead, publico)))}
          ${fila('Viajan', esc(personasTexto(lead.adultos, lead.ninos)))}
        </table>
      </td></tr>
      ${rango}
      ${advertencias}
      <tr><td style="padding:22px 28px 8px;font-size:15px;color:#0A0A0A;line-height:1.5;">
        ¿Tienes una pregunta o quieres ajustar algo? Escríbenos por WhatsApp y lo vemos contigo.
      </td></tr>
      <tr><td style="padding:8px 28px 28px;">
        <a href="${esc(linkWa)}" style="display:inline-block;background:#0B7A3E;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 24px;border-radius:8px;">Escríbenos por WhatsApp</a>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #E5E5E5;font-size:12px;color:#6B6B6B;">
        LATAM VISA · Brisbane, Australia · Consultoría de viajes y educación
      </td></tr>`)

  return { asunto: 'Tu Euro Trip antes de Latam — ya lo estamos armando ✈️', html }
}

// ── Interno ─────────────────────────────────────────────────────────────────

const celda = (t: string, extra = '') => `<td style="padding:6px 8px;border-bottom:1px solid #EDEDED;font-size:13px;color:#0A0A0A;vertical-align:top;${extra}">${t}</td>`
const celdaAncha = (t: string) => `<td colspan="3" style="padding:6px 8px;border-bottom:1px solid #EDEDED;font-size:13px;color:#92400E;">${t}</td>`
const encabezado = (t: string) => `<td style="padding:6px 8px;border-bottom:2px solid #E5E5E5;font-size:12px;color:#6B6B6B;font-weight:bold;">${t}</td>`
const seccion = (titulo: string) => `<tr><td style="padding:20px 24px 6px;font-size:13px;font-weight:bold;color:#2F4A00;letter-spacing:0.5px;">${titulo.toUpperCase()}</td></tr>`

export function correoInterno(lead: DatosLead, publico: CotizacionPublica | null, interno: CotizacionInterna | null, errorCalculo?: string | null) {
  const ciudades = interno?.ciudades.map((c) => c.ciudad) ?? (lead.sorprendanme ? ['Sorpréndanme'] : lead.ciudades_europa)
  const asunto = `${lead.guardado ? '' : '⚠️ SIN GUARDAR — '}Nuevo lead Dos Vacaciones — ${lead.nombre} — ${ciudades.join(', ') || 'sin ciudades'}`

  const hotel = (h: CotizacionInterna['ciudades'][number]['hotel_min']) =>
    h
      ? `<strong>${esc(h.hotel)}</strong>${h.cadena ? ` (${esc(h.cadena)})` : ''}<br>${esc(h.tarifa_por_noche)} ${esc(h.moneda)}/noche × ${h.noches} noches × ${h.habitaciones} hab. (occ ${h.ocupacion}) · ${esc(h.temporada)} · ${esc(h.tipo_tarifa)}<br>= ${esc(h.total_moneda)} ${esc(h.moneda)} → <strong>${esc(aud(h.total_aud))}</strong>`
      : '<span style="color:#B91C1C;">Sin hotel válido</span>'

  const desglose = interno
    ? `
      ${seccion('Tramo en Europa')}
      <tr><td style="padding:0 24px;font-size:14px;color:#0A0A0A;">${esc(fechaCorta(interno.tramo_europa.check_in))} → ${esc(fechaCorta(interno.tramo_europa.check_out))} · ${interno.tramo_europa.noches} noches · ${interno.personas} personas</td></tr>
      ${seccion('Hoteles por ciudad')}
      <tr><td style="padding:0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>${encabezado('Ciudad')}${encabezado('Más barato (mínimo)')}${encabezado('Más caro (máximo)')}</tr>
          ${interno.ciudades
            .map(
              (c) => `<tr>${celda(`<strong>${esc(c.ciudad)}</strong><br>${c.noches} noches<br>${esc(fechaCorta(c.check_in))} → ${esc(fechaCorta(c.check_out))}<br>${c.validos} válidos`)}${celda(hotel(c.hotel_min))}${celda(hotel(c.hotel_max))}</tr>${
                c.descartados.length
                  ? `<tr>${celdaAncha(`Descartados: ${c.descartados.map((d) => `${esc(d.hotel)} (${esc(d.motivo)})`).join('; ')}`)}</tr>`
                  : ''
              }`,
            )
            .join('')}
        </table>
      </td></tr>
      ${seccion('Cálculo')}
      <tr><td style="padding:0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>${encabezado('')}${encabezado('Mínimo')}${encabezado('Máximo')}</tr>
          <tr>${celda('Hoteles netos (AUD, tasa EUR→AUD ' + esc(interno.conversion.eur_aud) + ')')}${celda(esc(aud(interno.hoteles.neta_min_aud)))}${celda(esc(aud(interno.hoteles.neta_max_aud)))}</tr>
          <tr>${celda('Hoteles referencia web (sin margen)')}${celda(esc(aud(interno.hoteles.referencia_min_aud)))}${celda(esc(aud(interno.hoteles.referencia_max_aud)))}</tr>
          <tr>${celda('Traslados')}${celda(esc(aud(interno.traslados_aud)))}${celda(esc(aud(interno.traslados_aud)))}</tr>
          <tr>${celda(`Con margen ${esc(interno.margen_pct)} %`)}${celda(esc(aud(interno.con_margen.min_aud)))}${celda(esc(aud(interno.con_margen.max_aud)))}</tr>
          <tr>${celda(`Vuelos (${esc(interno.vuelos.estado)})`)}${celda(esc(aud(interno.vuelos.total_min_aud)))}${celda(esc(aud(interno.vuelos.total_max_aud)))}</tr>
          <tr>${celda('Antes del colchón')}${celda(esc(aud(interno.antes_colchon.min_aud)))}${celda(esc(aud(interno.antes_colchon.max_aud)))}</tr>
          <tr>${celda(`<strong>Rango público (colchón ${esc(interno.colchon_pct)} %)</strong>`)}${celda(`<strong>${esc(aud(publico?.rango_min_aud))}</strong>`)}${celda(`<strong>${esc(aud(publico?.rango_max_aud))}</strong>`)}</tr>
        </table>
      </td></tr>
      ${seccion('Vuelos')}
      <tr><td style="padding:0 24px;font-size:14px;color:#0A0A0A;line-height:1.5;">
        Estado: <strong>${esc(interno.vuelos.estado)}</strong> · búsqueda ${esc(lead.ciudad_salida)} → ${esc(interno.ciudades[0]?.ciudad ?? '—')} → ${esc(interno.vuelos.destino_buscado)} el ${esc(fechaCorta(interno.vuelos.fecha_busqueda))}<br>
        Por persona: ${esc(aud(interno.vuelos.por_persona_min_aud))} – ${esc(aud(interno.vuelos.por_persona_max_aud))} · rutas usadas: ${interno.vuelos.rutas_usadas.length} · excluidas por USA: ${interno.vuelos.excluidas_por_usa}
      </td></tr>
      ${seccion('Advertencias internas')}
      <tr><td style="padding:0 24px;font-size:14px;color:#92400E;line-height:1.5;">
        ${interno.advertencias_internas.length ? interno.advertencias_internas.map((a) => `• ${esc(a)}`).join('<br>') : '<span style="color:#6B6B6B;">Ninguna</span>'}
      </td></tr>`
    : `
      ${seccion('Cálculo')}
      <tr><td style="padding:0 24px;font-size:14px;color:#B91C1C;">No se pudo calcular el rango${errorCalculo ? `: ${esc(errorCalculo)}` : ''}. El cliente recibió el mensaje de "te escribimos en 24 horas".</td></tr>`

  const html = marco(`
      <tr><td style="padding:22px 24px 6px;">
        <div style="font-size:12px;letter-spacing:1px;color:#2F4A00;font-weight:bold;">LATAM VISA · ADMIN · DOS VACACIONES</div>
        <div style="font-size:20px;font-weight:bold;color:#0A0A0A;margin-top:6px;">Nuevo lead: ${esc(lead.nombre)}</div>
        <div style="font-size:22px;font-weight:bold;color:#2F4A00;margin-top:4px;">${publico ? `${esc(aud(publico.rango_min_aud))} – ${esc(aud(publico.rango_max_aud))}` : 'Sin rango'}</div>
        ${lead.guardado ? '' : '<div style="margin-top:10px;padding:10px 12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;color:#B91C1C;font-size:14px;">No se pudo guardar en solicitudes_dos_vacaciones. Estos son todos los datos del lead.</div>'}
      </td></tr>
      ${seccion('Contacto')}
      <tr><td style="padding:0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${fila('Nombre', esc(lead.nombre))}
          ${fila('Email', `<a href="mailto:${esc(lead.email)}" style="color:#2F4A00;">${esc(lead.email)}</a>`)}
          ${fila('Celular', `<a href="https://wa.me/${esc(lead.celular.replace(/\D/g, ''))}" style="color:#2F4A00;">${esc(lead.celular)}</a>`)}
          ${fila('Solicitud', esc(lead.solicitud_id ?? 'sin guardar'))}
        </table>
      </td></tr>
      ${seccion('Viaje')}
      <tr><td style="padding:0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${fila('Sale de', esc(`${SALIDAS[lead.ciudad_salida] ?? lead.ciudad_salida} (${lead.ciudad_salida})`))}
          ${fila('Destino Latam', esc(lead.pais_latam))}
          ${fila('Fechas', `${esc(fechaCorta(lead.fecha_ida))} → ${esc(fechaCorta(lead.fecha_vuelta))} · Europa de ${esc(lead.europa_momento)}`)}
          ${fila('Personas', esc(personasTexto(lead.adultos, lead.ninos)))}
          ${fila('Pasaporte', `${esc(lead.pasaporte)} · visa USA: ${lead.visa_usa ? 'sí' : 'no'}`)}
          ${fila('Europa', `${esc(lead.sorprendanme ? 'Sorpréndanme' : lead.ciudades_europa.join(', '))} · ${lead.dias_europa} noches`)}
          ${fila('Estilo', esc(lead.estilo.join(', ') || '—'))}
          ${fila('Advert. públicas', esc(publico?.advertencias.join(' · ') || '—'))}
        </table>
      </td></tr>
      ${desglose}
      <tr><td style="padding:24px;font-size:11px;color:#A3A3A3;">Confidencial: contiene tarifas netas. No reenviar al cliente.</td></tr>`)

  return { asunto, html }
}
