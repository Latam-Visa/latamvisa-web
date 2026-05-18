import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'LATAM VISA — Asesoría Migratoria Premium para Latinoamericanos',
  description: 'Agencia de asesoría migratoria premium en Brisbane, Australia. Visas de estudio y turismo para Australia, Japón, Inglaterra, Canadá y USA. Atendemos clientes en toda Latinoamérica.',
  keywords: 'visa australia latinoamericanos, visa estudiante australia, visa turismo australia, agencia visas brisbane, latam visa, asesoría migratoria colombia perú méxico',
  openGraph: {
    title: 'LATAM VISA — Tu puerta de entrada a Australia',
    description: 'Asesoría migratoria premium para latinoamericanos. Visas de estudio, turismo y más.',
    url: 'https://www.latamvisatravel.com',
    siteName: 'LATAM VISA',
    images: [{ url: '/logo.png', width: 800, height: 400, alt: 'LATAM VISA Logo' }],
    locale: 'es_LA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LATAM VISA — Asesoría Migratoria Premium',
    description: 'Tu puerta de entrada a Australia.',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.latamvisatravel.com' },
  icons: {
    icon: '/FotoPerfil.png',
    apple: '/FotoPerfil.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "LATAM VISA",
              "alternateName": "Latam Visa Travel",
              "url": "https://www.latamvisatravel.com",
              "logo": "https://www.latamvisatravel.com/logo.png",
              "image": "https://www.latamvisatravel.com/logo.png",
              "description": "Agencia de asesoría migratoria premium para latinoamericanos. Especializada en visas de estudio y turismo para Australia, Japón, Inglaterra, Canadá y Estados Unidos.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Brisbane",
                "addressRegion": "Queensland",
                "addressCountry": "AU"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+61-426-779-731",
                "contactType": "customer service",
                "email": "future@latamvisas.com.au",
                "availableLanguage": ["Spanish", "English"]
              },
              "areaServed": [
                "Colombia", "México", "Perú", "Bolivia", 
                "Argentina", "Ecuador", "Venezuela", "Chile",
                "Paraguay", "Uruguay", "Brasil"
              ],
              "serviceType": [
                "Visa de Estudiante Australia",
                "Visa de Turismo Australia", 
                "Visa USA desde Australia",
                "Asesoría Migratoria"
              ],
              "sameAs": [
                "https://www.instagram.com/latamvisa",
                "https://www.facebook.com/latamvisa"
              ],
              "foundingDate": "2026",
              "founder": {
                "@type": "Person",
                "name": "Cristian Montenegro"
              }
            })
          }}
        />
      </head>
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
