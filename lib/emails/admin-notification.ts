export function getAdminNotificationEmail(fullName: string, email: string, visaType: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #FF3D00;">Nueva Solicitud Recibida: Visa USA</h2>
      <p>Se ha recibido una nueva aplicación completa en la plataforma.</p>
      <ul>
        <li><strong>Nombre:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Tipo de Visa Solicitada:</strong> ${visaType}</li>
      </ul>
      <p>El PDF con la información completa del cliente se encuentra adjunto a este correo.</p>
      <p>También puedes revisar los detalles en el panel de Supabase.</p>
    </div>
  `
}
