export function getClientConfirmationEmail(fullName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #050505; padding: 20px; text-align: center;">
        <h1 style="color: #C8FF00; margin: 0;">LATAM VISA</h1>
      </div>
      <div style="padding: 30px; background-color: #F9F9F9; border: 1px solid #EEE;">
        <h2 style="margin-top: 0;">¡Hola ${fullName}!</h2>
        <p>Hemos recibido correctamente tu información para la solicitud de Visa de Estados Unidos.</p>
        <p>Nuestro equipo de asesores revisará tu perfil en las próximas 24 horas y te contactaremos por WhatsApp para indicarte los siguientes pasos y proceder con el llenado de tu DS-160.</p>
        <p>Adjuntamos a este correo un PDF con el resumen de la información que nos proporcionaste.</p>
        <br/>
        <p>Saludos cordiales,</p>
        <p><strong>El equipo de LATAM VISA</strong></p>
      </div>
    </div>
  `
}
