/* Un único punto de entrada a WhatsApp para toda la campaña, con el mensaje
   precargado que pidió el brief. El número es el mismo CONTACT.whatsapp del
   sitio (+61 426 779 734), aquí ya normalizado a formato wa.me. */

export const WHATSAPP_NUMERO = '61426779734'

export const WHATSAPP_MESSAGE = 'Hola! Quiero cotizar mi Euro Trip antes de ir a Latam'

/* Arma el link de wa.me con un mensaje precargado (por defecto el del brief).
   Úsalo para mensajes por destino sin repetir el número. */
export function whatsappHref(mensaje: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`
}

export const WHATSAPP_HREF = whatsappHref()
