'use client'
import { useEffect } from 'react'

/* Smooth-scroll provider for the App Router.
   Lenis drives the scroll, GSAP's ticker drives Lenis, and every Lenis scroll
   tick calls ScrollTrigger.update() so pinned/triggered animations stay in
   sync with the eased scroll position rather than the native one.

   Uses @studio-freight/lenis, already a dependency and already powering the
   homepage via hooks/useSmoothScroll — installing the renamed `lenis` package
   alongside it would put two copies of the same library in the bundle.

   prefers-reduced-motion: Lenis is never started and ScrollTrigger is left
   alone, so the page falls back to plain native scrolling. Components read
   the same media query to decide whether to animate at all. */

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let lenis: import('@studio-freight/lenis').default | null = null
    let tickerFn: ((time: number) => void) | null = null
    let gsapRef: typeof import('gsap').gsap | null = null
    let cancelled = false

    const init = async () => {
      const [Lenis, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('@studio-freight/lenis').then((m) => m.default),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)
      gsapRef = gsap

      lenis = new Lenis({ lerp: 0.09, smoothWheel: true })

      lenis.on('scroll', ScrollTrigger.update)

      tickerFn = (time: number) => lenis?.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)

      ScrollTrigger.refresh()
    }

    init()

    return () => {
      cancelled = true
      if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn)
      lenis?.destroy()
    }
  }, [enabled])
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
