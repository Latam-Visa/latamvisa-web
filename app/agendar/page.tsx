import type { Metadata } from 'next'
import AgendarClient from './AgendarClient'

export const metadata: Metadata = {
  title: 'Agenda tu Sesión de Planeación — LATAM VISA®',
  description:
    'Sesión de planeación de viaje y estudio de 45 minutos por USD $59. Revisión de perfil, ruta educativa exacta, lista de pasos y respuesta a todas tus preguntas. Reembolsable si contratas el servicio completo.',
  keywords: [
    'sesión de planeación',
    'estudiar en australia',
    'asesoría educación internacional',
    'viajar a australia',
    'agendar sesión de planeación',
    'latam visa asesoría',
  ],
  openGraph: {
    title: 'Agenda tu Sesión de Planeación — LATAM VISA®',
    description:
      '45 minutos con un consultor experto. Analizamos tu perfil, definimos tus instituciones ideales y respondemos todas tus preguntas — USD $59, reembolsable.',
    url: 'https://latamvisatravel.com/agendar',
    siteName: 'LATAM VISA®',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/FotoPerfil.png',
        width: 1200,
        height: 630,
        alt: 'LATAM VISA — Sesión de Planeación de Viaje y Estudio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agenda tu Sesión de Planeación — LATAM VISA®',
    description: '45 minutos con un experto. Ruta personalizada de estudio, procesos y claridad total — USD $59.',
  },
  alternates: {
    canonical: 'https://latamvisatravel.com/agendar',
  },
}

export default function AgendarPage() {
  return <AgendarClient />
}
