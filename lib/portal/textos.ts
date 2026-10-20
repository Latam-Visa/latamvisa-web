/* Textos del portal del cliente. Funciones puras: se testean sin red. */

const PAISES: Record<string, string> = {
  usa: 'Estados Unidos',
  canada: 'Canadá',
  uk: 'Reino Unido',
  australia: 'Australia',
  nz: 'Nueva Zelanda',
  japon: 'Japón',
  schengen: 'Europa (Schengen)',
}

export function nombrePaisPortal(pais: string | null | undefined): string {
  if (!pais) return 'Tu destino'
  return PAISES[pais] || pais.charAt(0).toUpperCase() + pais.slice(1)
}

// El cliente nunca ve el valor interno del estado.
const ESTADOS: Record<string, string> = {
  pendiente_activacion: 'Falta crear tu cuenta',
  activa: 'Falta llenar tu formulario',
  enviada: 'Recibimos tu formulario, lo estamos revisando',
  completada: 'Trámite completado',
}

export function estadoEnPalabras(estado: string | null | undefined): string {
  return (estado && ESTADOS[estado]) || 'En proceso'
}

/* "2026-10-20T09:00:00Z" -> "20 de octubre de 2026" */
export function fechaCompra(iso: string): string {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Brisbane' }).format(new Date(iso))
}

// Solo rutas internas: evita que ?next= mande al cliente a otro sitio.
export function rutaSegura(next: string | null | undefined, porDefecto = '/mi-cuenta'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return porDefecto
  return next
}

export const esTokenValido = (token: string) => /^[0-9a-f]{64}$/.test(token)

/* Errores de Supabase Auth -> español entendible. Nunca el texto crudo. */
export function mensajeErrorAuth(err: { code?: string | null; status?: number | null } | null | undefined): string {
  switch (err?.code) {
    case 'invalid_credentials':
      return 'El correo o la contraseña no coinciden. Revisa e intenta otra vez.'
    case 'email_not_confirmed':
      return 'Primero confirma tu correo con el enlace que te enviamos.'
    case 'email_exists':
    case 'user_already_exists':
      return 'Ya existe una cuenta con este correo. Elige "Ya tengo cuenta" para entrar.'
    case 'weak_password':
      return 'Esa contraseña es muy fácil de adivinar. Usa al menos 8 caracteres, mezclando letras y números.'
    case 'same_password':
      return 'La nueva contraseña tiene que ser distinta a la anterior.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Hiciste varios intentos seguidos. Espera unos minutos y vuelve a intentar.'
  }
  if (err?.status === 429) return 'Hiciste varios intentos seguidos. Espera unos minutos y vuelve a intentar.'
  return 'Algo falló de nuestro lado. Intenta otra vez en un momento.'
}
