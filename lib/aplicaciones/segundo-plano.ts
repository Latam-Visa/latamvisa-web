// Tareas que corren DESPUÉS de guardar la aplicación y de responder al
// cliente (emails, PDF, carta con IA). Cada una tiene su propio timeout y
// try/catch: si falla, se alerta por correo pero nunca afecta la respuesta.
//
// waitUntil (Vercel) mantiene viva la función hasta que terminen, en lugar de
// congelarla al responder. Fuera de Vercel simplemente deja correr la promesa.

import { waitUntil } from '@vercel/functions'
import { alertarErrorFormulario, type AlertaFormulario } from './alertas'

export function conTimeout<T>(promesa: Promise<T>, ms: number, nombre: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  return Promise.race([
    promesa.finally(() => clearTimeout(timer)),
    new Promise<never>((_, rej) => {
      timer = setTimeout(() => rej(new Error(`Timeout de ${ms / 1000}s en "${nombre}"`)), ms)
    }),
  ])
}

export function enSegundoPlano(
  nombre: string,
  tarea: () => Promise<unknown>,
  opciones: { timeoutMs: number; alerta: Omit<AlertaFormulario, 'etapa' | 'error'> },
): void {
  const promesa = (async () => {
    try {
      await conTimeout(tarea(), opciones.timeoutMs, nombre)
      console.log(`[BG] ${nombre} OK`)
    } catch (error) {
      console.error(`[BG] ${nombre} falló:`, error)
      await alertarErrorFormulario({ ...opciones.alerta, etapa: nombre, error, aplicacionGuardada: true })
    }
  })()
  waitUntil(promesa)
}
