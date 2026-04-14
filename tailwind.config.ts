import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050505',
        'bg-secondary': '#0D0D0D',
        'neon': '#C8FF00',
        'neon-dim': '#A8D900',
        'border-subtle': '#1A1A1A',
        'text-secondary': '#8A8A8A',
      },
      fontFamily: {
        sans: ['PPMonumentExtended', 'sans-serif'],
        monument: ['PPMonumentExtended', 'sans-serif'],
        funnel: ['FunnelDisplay', 'sans-serif'],
        iceland: ['Iceland', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
