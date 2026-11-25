/* Correos de los aplicantes de un mismo pago (asesoría para 2+ personas).
   El checkout los guarda en metadata.emails_aplicantes (separados por coma;
   Stripe limita cada valor a 500 caracteres). Puro: se prueba sin Stripe. */

const EMAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/

export function normalizarEmails(lista: unknown): string[] {
  if (!Array.isArray(lista)) return []
  return lista.map((e) => String(e ?? '').trim().toLowerCase())
}

/** Devuelve un mensaje de error, o null si la lista es válida para `aplicantes`. */
export function validarEmails(emails: string[], aplicantes: number): string | null {
  if (emails.length !== aplicantes) return 'Falta el correo de uno de los aplicantes'
  if (emails.some((e) => !EMAIL_RE.test(e))) return 'Revisa los correos: alguno no es válido'
  if (new Set(emails).size !== emails.length) return 'Cada aplicante necesita un correo distinto'
  if (emails.join(',').length > 500) return 'Los correos son demasiado largos'
  return null
}

/** Correos del pago: los de metadata si hay, o el del pagador como único aplicante. */
export function emailsDelPago(metadata: Record<string, string> | null | undefined, emailPagador: string): string[] {
  const guardados = (metadata?.emails_aplicantes || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return guardados.length > 1 ? Array.from(new Set(guardados)) : [emailPagador]
}
