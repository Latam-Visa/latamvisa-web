'use client'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/lenis'

/* Fade + rise driven by ScrollTrigger, shared by every section below the
   hero. With prefers-reduced-motion the elements are simply left at their
   final state — no ScrollTrigger is created at all, so there's nothing to
   animate and nothing to clean up. */
export function useReveal(
  scopeRef: RefObject<HTMLElement>,
  selector = '[data-reveal]',
  { y = 40, stagger = 0.12 }: { y?: number; stagger?: number } = {},
) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const targets = scope.querySelectorAll<HTMLElement>(selector)
    if (!targets.length) return

    if (prefersReducedMotion()) {
      targets.forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      return
    }

    let ctx: { revert: () => void } | null = null
    let cancelled = false

    const init = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger,
            scrollTrigger: { trigger: scope, start: 'top 72%', once: true },
          },
        )
      }, scope)
    }

    init()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [scopeRef, selector, y, stagger])
}
