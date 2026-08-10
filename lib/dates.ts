const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * Formats a plain calendar-date string ("YYYY-MM-DD") for display, e.g. "12 de diciembre de 1990".
 *
 * Calendar dates (date of birth, passport issue/expiry, travel dates) are NOT moments in time —
 * they must never be run through `new Date()` / `Date.parse`, which interprets a bare "YYYY-MM-DD"
 * as UTC midnight and can render as the previous or next day once the runtime's local timezone
 * (server or browser) is applied. This parses the string manually instead, so the result is
 * identical regardless of where or when it renders.
 */
export function formatCalendarDate(value: string | null | undefined): string {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const [, year, month, day] = match
  const monthName = MESES[Number(month) - 1]
  if (!monthName) return value
  return `${Number(day)} de ${monthName} de ${year}`
}

/**
 * Computes age in whole years from a "YYYY-MM-DD" date of birth, comparing the
 * birth year/month/day directly against today's local wall-clock date — never
 * parses the DOB string through `new Date()`, so it can't be off by a year at
 * the Dec 31/Jan 1 boundary depending on the runtime's timezone.
 */
export function getAge(dob: string | null | undefined): number {
  if (!dob) return 0
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob)
  if (!match) return 0
  const birthYear = Number(match[1])
  const birthMonth = Number(match[2])
  const birthDay = Number(match[3])

  const today = new Date()
  let age = today.getFullYear() - birthYear
  const hadBirthdayThisYear =
    today.getMonth() + 1 > birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay)
  if (!hadBirthdayThisYear) age--
  return age
}
