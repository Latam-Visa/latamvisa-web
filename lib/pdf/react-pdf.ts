// Carga única de @react-pdf/renderer para todo el servidor.
//
// Se importa con un import nativo que webpack ignora:
// - como externo normal (lista por defecto de Next) es ESM con top-level
//   await y vuelve "async" a los módulos que lo usan: el build de producción
//   falla en Terser apenas se usa desde una ruta API o un componente servidor;
// - empaquetado en la capa de servidor usaría el React "react-server" (sin
//   Component) y falla al renderizar.
// Así Node lo carga desde node_modules con el React completo, y el tracer de
// Next igual lo incluye en las funciones de Vercel.

export type ReactPdf = typeof import('@react-pdf/renderer')

let modulo: ReactPdf | null = null

export async function cargarReactPdf(): Promise<ReactPdf> {
  modulo ??= (await import(/* webpackIgnore: true */ '@react-pdf/renderer')) as ReactPdf
  return modulo
}

// Para componentes que se renderizan después de cargarReactPdf().
export function reactPdf(): ReactPdf {
  if (!modulo) throw new Error('@react-pdf/renderer no está cargado: llama a cargarReactPdf() antes de renderizar')
  return modulo
}
