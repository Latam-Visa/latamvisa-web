/* Un único punto de entrada a WhatsApp para toda la campaña, con el mensaje
   precargado que pidió el brief. El número es el mismo CONTACT.whatsapp del
   sitio (+61 426 779 734), aquí ya normalizado a formato wa.me. */

export const WHATSAPP_MESSAGE = 'Hola! Quiero cotizar mi Euro Trip antes de ir a Latam'

export const WHATSAPP_HREF =
  `https://wa.me/61426779734?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
