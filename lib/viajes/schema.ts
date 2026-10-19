import { z } from 'zod'

/* Esquema de la solicitud "Dos Vacaciones". Lo usan el formulario (cliente)
   y POST /api/viajes/cotizar (servidor), que siempre vuelve a validar. Sin
   datos confidenciales: se puede importar desde el navegador. */

export const ESTILOS = ['rumba', 'cultura', 'playa', 'comida', 'descanso'] as const

// Campo trampa: invisible para personas, los bots lo llenan.
export const CAMPO_HONEYPOT = 'sitio_web'

const fecha = z.iso.date({ error: 'Fecha inválida.' })

/* Formato internacional: "+61 426 779 734", "+57 300-123-4567", "0426 779 734".
   Entre 8 y 15 dígitos (E.164), con espacios, guiones, puntos o paréntesis. */
const celular = z
  .string()
  .trim()
  .regex(/^\+?[\d\s().-]+$/, { error: 'Escribe el celular solo con números (puede empezar con +).' })
  .refine((v) => {
    const digitos = v.replace(/\D/g, '').length
    return digitos >= 8 && digitos <= 15
  }, { error: 'El celular debe tener entre 8 y 15 dígitos, con código de país.' })

export const solicitudSchema = z
  .object({
    nombre: z.string().trim().min(2, { error: 'Escribe tu nombre.' }).max(100),
    email: z.email({ error: 'Escribe un correo válido.' }).trim().max(200),
    celular,
    ciudad_salida: z.enum(['BNE', 'SYD', 'MEL'], { error: 'Escoge desde qué ciudad sales.' }),
    pais_latam: z.string().trim().min(2, { error: 'Escoge a qué país de Latam vas.' }).max(60),
    fecha_ida: fecha,
    fecha_vuelta: fecha,
    europa_momento: z.enum(['ida', 'vuelta'], { error: 'Escoge si la escala va de ida o de vuelta.' }),
    adultos: z.coerce.number().int().min(1, { error: 'Mínimo 1 adulto.' }).max(10),
    ninos: z.coerce.number().int().min(0).max(10).default(0),
    pasaporte: z.string().trim().min(2, { error: 'Escoge tu pasaporte.' }).max(60),
    visa_usa: z.boolean(),
    ciudades_europa: z.array(z.string().trim().min(1).max(60)).max(4).default([]),
    sorprendanme: z.boolean().default(false),
    dias_europa: z.coerce.number().int().min(2, { error: 'Mínimo 2 noches en Europa.' }).max(21, { error: 'Máximo 21 noches en Europa.' }),
    estilo: z.array(z.enum(ESTILOS)).max(ESTILOS.length).default([]),
    [CAMPO_HONEYPOT]: z.string().optional(),
  })
  .refine((d) => d.fecha_vuelta > d.fecha_ida, { path: ['fecha_vuelta'], error: 'La vuelta debe ser después de la ida.' })
  .refine((d) => d.sorprendanme || d.ciudades_europa.length > 0, {
    path: ['ciudades_europa'],
    error: 'Escoge al menos una ciudad o marca "sorpréndanme".',
  })

export type SolicitudInput = z.infer<typeof solicitudSchema>
