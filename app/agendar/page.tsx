import type { Metadata } from 'next'
import AgendarClient from './AgendarClient'

export const metadata: Metadata = {
  title: 'Agenda tu Consulta Migratoria — LATAM VISA®',
  description:
    'Consulta migratoria personalizada de 45 minutos por USD $50. Revisión de perfil, ruta exacta, lista de documentos y respuesta a todas tus preguntas. Reembolsable si contratas el servicio completo.',
  keywords: [
    'consulta migratoria',
    'visa australia consulta',
    'asesoría visa australia',
    'visa usa latinoamerica',
    'agendar consulta migratoria',
    'latam visa consulta',
  ],
  openGraph: {
    title: 'Agenda tu Consulta Migratoria — LATAM VISA®',
    description:
      '45 minutos con un experto migratorio. Analizamos tu perfil, definimos tu ruta y respondemos todas tus preguntas — USD $50, reembolsable.',
    url: 'https://latamvisatravel.com/agendar',
    siteName: 'LATAM VISA®',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/FotoPerfil.png',
        width: 1200,
        height: 630,
        alt: 'LATAM VISA — Consulta Migratoria Personalizada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agenda tu Consulta Migratoria — LATAM VISA®',
    description: '45 minutos con un experto. Ruta personalizada, documentos y claridad total — USD $50.',
  },
  alternates: {
    canonical: 'https://latamvisatravel.com/agendar',
  },
}

export default function AgendarPage() {
  return <AgendarClient />
}
