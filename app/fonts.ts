import localFont from 'next/font/local'

export const monument = localFont({
  src: [
    { path: '../public/fonts/PPMonument/PPMonumentExtended-Light.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/PPMonument/PPMonumentExtended-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/PPMonument/PPMonumentExtended-Black.otf', weight: '900', style: 'normal' },
    { path: '../public/fonts/PPMonument/PPMonumentExtended-LightItalic.otf', weight: '300', style: 'italic' },
    { path: '../public/fonts/PPMonument/PPMonumentExtended-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: '../public/fonts/PPMonument/PPMonumentExtended-BlackItalic.otf', weight: '900', style: 'italic' },
  ],
  variable: '--font-monument',
  display: 'swap',
})

export const monumentBlack = localFont({
  src: [
    { path: '../public/fonts/PPMonument/PPMonumentNormal-Black.otf', weight: '900', style: 'normal' },
    { path: '../public/fonts/PPMonument/PPMonumentNormal-BlackItalic.otf', weight: '900', style: 'italic' },
  ],
  variable: '--font-monument-black',
  display: 'swap',
})

export const funnel = localFont({
  src: [
    { path: '../public/fonts/Funnel_Display/static/FunnelDisplay-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/Funnel_Display/static/FunnelDisplay-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Funnel_Display/static/FunnelDisplay-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Funnel_Display/static/FunnelDisplay-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Funnel_Display/static/FunnelDisplay-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-funnel',
  display: 'swap',
})
