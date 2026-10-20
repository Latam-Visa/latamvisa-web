/* Correos del portal del cliente: activación de la cuenta tras el pago,
   confirmación de correo y recuperación de contraseña. Funciones puras; el
   envío vive en el webhook de Stripe y en app/(portal)/acciones.ts.
   Fondo claro siempre: el neón solo como fondo del botón. */

function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function primerNombre(nombre: string | null | undefined): string | null {
  const primero = (nombre || '').trim().split(/\s+/)[0]
  return primero ? primero.charAt(0).toUpperCase() + primero.slice(1).toLowerCase() : null
}

function plantilla({ saludo, parrafos, boton, link, nota }: { saludo: string; parrafos: string[]; boton: string; link: string; nota?: string }): string {
  const p = (t: string) => `<p style="color:#0d2b0d;font-size:16px;line-height:1.6;margin:0 0 16px">${t}</p>`
  return `<div style="background-color:#FAFAF7;font-family:Arial,Helvetica,sans-serif;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background-color:#FFFFFF;border:1px solid #E5E5E5;border-radius:16px;padding:32px 24px">
    <p style="color:#2F4A00;font-size:20px;font-weight:bold;margin:0 0 20px">${saludo}</p>
    ${parrafos.map(p).join('\n    ')}
    <div style="text-align:center;margin:28px 0">
      <a href="${escaparHtml(link)}" style="display:inline-block;background-color:#C8FF00;color:#0d2b0d;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:12px">${boton}</a>
    </div>
    <p style="color:#525252;font-size:13px;line-height:1.5;margin:0 0 16px">Si el botón no funciona, copia este enlace en tu navegador:<br><span style="color:#2F4A00;word-break:break-all">${escaparHtml(link)}</span></p>
    ${nota ? `<p style="color:#525252;font-size:13px;line-height:1.5;margin:0 0 16px">${nota}</p>` : ''}
    <p style="color:#0d2b0d;font-size:15px;margin:24px 0 0">El equipo de LATAM VISA</p>
  </div>
</div>`
}

export function construirCorreoActivacion(datos: { nombre: string | null | undefined; pais: string; link: string }) {
  const nombre = primerNombre(datos.nombre)
  return {
    asunto: 'Recibimos tu pago: crea tu cuenta en LATAM VISA',
    html: plantilla({
      saludo: nombre ? `Hola, ${escaparHtml(nombre)}` : 'Hola',
      parrafos: [
        `Recibimos tu pago para tu visa de <strong>${escaparHtml(datos.pais)}</strong>. Gracias por confiar en nosotros.`,
        'El siguiente paso es crear tu cuenta. Desde ahí vas a llenar tu solicitud y subir tus documentos, y siempre vas a poder ver en qué va tu trámite.',
        'Te toma un minuto: puedes usar este mismo correo u otro que prefieras.',
      ],
      boton: 'Crear mi cuenta',
      link: datos.link,
      nota: 'Este enlace es personal: no lo compartas. ¿Dudas? Responde a este correo o escríbenos por WhatsApp.',
    }),
  }
}

export function construirCorreoConfirmar(datos: { link: string }) {
  return {
    asunto: 'Confirma tu correo para terminar tu cuenta en LATAM VISA',
    html: plantilla({
      saludo: 'Ya casi',
      parrafos: ['Confirma que este correo es tuyo y tu cuenta queda lista. Puedes abrir el enlace desde cualquier celular o computador.'],
      boton: 'Confirmar mi correo',
      link: datos.link,
      nota: 'Si no fuiste tú, ignora este mensaje.',
    }),
  }
}

export function construirCorreoRecuperar(datos: { link: string }) {
  return {
    asunto: 'Cambia tu contraseña de LATAM VISA',
    html: plantilla({
      saludo: 'Hola',
      parrafos: ['Pediste cambiar la contraseña de tu cuenta. Toca el botón para elegir una nueva. El enlace vence en una hora.'],
      boton: 'Elegir nueva contraseña',
      link: datos.link,
      nota: 'Si no lo pediste tú, ignora este mensaje: tu contraseña sigue igual.',
    }),
  }
}
