import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'LATAM VISA® — Asesoría Migratoria Premium para Australia',
  description:
    'Ayudamos a latinoamericanos a cumplir el sueño de estudiar, trabajar y vivir en Australia. Asesoría experta en visas de estudiante, turismo y más.',
  keywords: ['visa australia', 'visa estudiante australia', 'migración australia latinoamérica', 'asesoría migratoria'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
