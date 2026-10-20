// Fondos de Canva y fuentes que el PDF de cotizaciones lee del disco.
const ARCHIVOS_PDF = [
  './public/cotizacion/canada/*.png',
  './public/fonts/Funnel_Display/static/*.ttf',
  './public/fonts/PPMonument/PPMonumentExtended-Black.otf',
]

/* @react-pdf/renderer se carga con un import que webpack ignora
   (lib/pdf/react-pdf.ts) y el tracer de Next NO lo sigue: en Vercel las
   funciones salían sin el paquete y todo PDF fallaba con ERR_MODULE_NOT_FOUND
   (los correos salían sin adjunto). Se incluye a mano el paquete, todo su
   árbol de dependencias (calculado al compilar, así sigue correcto al
   actualizar) y `react`, que es peer y lo resuelve Node desde node_modules. */
const path = require('path')
const fs = require('fs')

function arbolDeDependencias(raiz) {
  const vistos = new Set()
  // Busca <dir>/node_modules/<nombre> subiendo carpetas, igual que Node. No
  // usa require.resolve('<pkg>/package.json'): falla con los paquetes cuyo
  // "exports" no publica package.json (fontkit, yoga-layout...).
  const ubicar = (nombre, desde) => {
    for (let d = desde; ; d = path.dirname(d)) {
      const pj = path.join(d, 'node_modules', nombre, 'package.json')
      if (fs.existsSync(pj)) return pj
      if (d === path.dirname(d)) return null
    }
  }
  const visitar = (nombre, desde) => {
    const pj = ubicar(nombre, desde)
    if (!pj) return
    const dir = path.dirname(pj)
    if (vistos.has(dir)) return
    vistos.add(dir)
    const p = JSON.parse(fs.readFileSync(pj, 'utf8'))
    for (const dep of Object.keys({ ...p.dependencies, ...p.optionalDependencies })) visitar(dep, dir)
  }
  visitar(raiz, __dirname)
  return [...vistos].map((dir) => `./${path.relative(__dirname, dir)}/**/*`)
}

const REACT_PDF = [...arbolDeDependencias('@react-pdf/renderer'), './node_modules/react/**/*']

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // El PDF de cotizaciones lee los fondos de Canva y las fuentes del disco en
    // tiempo de ejecución; en Vercel public/ no viaja con las funciones salvo
    // que se incluya aquí (rutas que generan o envían el PDF).
    // Rutas que generan PDF (cotizaciones y confirmación de las aplicaciones):
    // las que en el build contienen el import de @react-pdf/renderer.
    outputFileTracingIncludes: {
      '/api/cotizaciones/[token]/pdf': [...ARCHIVOS_PDF, ...REACT_PDF],
      '/convenio/[portalToken]': [...ARCHIVOS_PDF, ...REACT_PDF],
      '/admin/cotizaciones/nueva': [...ARCHIVOS_PDF, ...REACT_PDF],
      '/admin/cotizaciones/[id]': [...ARCHIVOS_PDF, ...REACT_PDF],
      '/api/aplicar/canada': REACT_PDF,
      '/api/aplicar/japon': REACT_PDF,
      '/aplicar/turismo-uk': REACT_PDF,
      '/aplicar/turismo-schengen': REACT_PDF,
      // La narrativa de Finanzas lee los principios del disco.
      '/finanzas/plan': ['./lib/finanzas/principios.md'],
    },
  },
  async redirects() {
    return [
      {
        source: '/visados',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
