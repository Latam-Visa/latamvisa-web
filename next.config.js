// Fondos de Canva y fuentes que el PDF de cotizaciones lee del disco.
const ARCHIVOS_PDF = [
  './public/cotizacion/canada/*.png',
  './public/fonts/Funnel_Display/static/*.ttf',
  './public/fonts/PPMonument/PPMonumentExtended-Black.otf',
]

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
    outputFileTracingIncludes: {
      '/api/cotizaciones/[token]/pdf': ARCHIVOS_PDF,
      '/convenio/[portalToken]': ARCHIVOS_PDF,
      '/admin/cotizaciones/nueva': ARCHIVOS_PDF,
      '/admin/cotizaciones/[id]': ARCHIVOS_PDF,
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
