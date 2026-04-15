'use client'
import { useEffect } from 'react'

export function useSmoothScroll() {
  useEffect(() => {
    // Prevent browser from restoring previous scroll position
    if (typeof window !== 'undefined') {
      history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
    }

    let lenis: import('@studio-freight/lenis').default | null = null

    const init = async () => {
      const [Lenis, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('@studio-freight/lenis').then((m) => m.default),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      gsap.registerPlugin(ScrollTrigger)

      lenis = new Lenis({
        lerp: 0.07,
        smoothWheel: true,
      })

      // Keep ScrollTrigger in sync with Lenis smooth scroll
      lenis.on('scroll', () => ScrollTrigger.update())

      // Drive Lenis via GSAP ticker (replaces requestAnimationFrame loop)
      gsap.ticker.add((time) => {
        lenis?.raf(time * 1000)
      })
      gsap.ticker.lagSmoothing(0)
    }

    init()

    return () => {
      lenis?.destroy()
    }
  }, [])
}
