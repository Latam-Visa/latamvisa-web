import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'LATAM VISA® — Asesoría Migratoria Premium para Australia',
  description:
    'Ayudamos a latinoamericanos a cumplir el sueño de estudiar, trabajar y vivir en Australia. Asesoría experta en visas de estudiante, turismo y más.',
  keywords: ['visa australia', 'visa estudiante australia', 'migración australia latinoamérica', 'asesoría migratoria'],
  icons: {
    icon: '/FotoPerfil.png',
    apple: '/FotoPerfil.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1966411244081767');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1966411244081767&ev=PageView&noscript=1"
          />
        </noscript>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
