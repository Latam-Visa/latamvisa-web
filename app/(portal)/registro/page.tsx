import Link from 'next/link'
import { WHATSAPP, btnPrimario, enlace, tarjeta, titulo } from '../_componentes/ui'

// El registro suelto no está habilitado: las cuentas solo se crean desde el
// link /activar/<token> que llega por correo después de pagar.
export default function RegistroPage() {
  return (
    <div className="space-y-6">
      <h1 className={`${titulo} text-xl sm:text-2xl`}>Cómo crear tu cuenta</h1>
      <div className={`${tarjeta} p-5 space-y-4 text-base text-[#0d2b0d]/80`}>
        <p>Tu cuenta se crea con el link que te enviamos por correo después de pagar tu servicio. Busca el correo de LATAM VISA con el asunto &quot;Recibimos tu pago&quot; (revisa también spam) y toca &quot;Crear mi cuenta&quot;.</p>
        <p>¿Ya la creaste? Entra con tu correo y contraseña.</p>
        <Link href="/entrar" className={btnPrimario}>Entrar a mi cuenta</Link>
        <p className="text-sm">
          ¿No te llegó el correo?{' '}
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={enlace}>Escríbenos por WhatsApp</a>.
        </p>
      </div>
    </div>
  )
}
