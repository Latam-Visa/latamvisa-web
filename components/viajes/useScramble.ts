'use client'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/lenis'

/* ScrambleText sobre cualquier elemento marcado con [data-scramble] dentro
   del scope. Se dispara cuando el elemento entra en pantalla.

   El texto definitivo vive en el HTML: el plugin solo lo reescribe encima
   mientras dura la animación. Así la página se lee con JS desactivado, y si
   desmontamos a media animación restauramos el texto real en vez de dejar
   caracteres revueltos.

   data-scramble="body" usa minúsculas para los párrafos; el resto va en
   mayúsculas, que es como se pintan display y label. */

const DURATION = 2.2
const SPEED = 0.25

export function useScramble(scopeRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const targets = Array.from(scope.querySelectorAll<HTMLElement>('[data-scramble]'))
    if (!targets.length) return
    if (prefersReducedMotion()) return // el HTML ya trae el texto final

    const originals = new Map<HTMLElement, string>()
    targets.forEach((el) => originals.set(el, el.textContent ?? ''))

    let cancelled = false
    const tweens: gsap.core.Tween[] = []
    let io: IntersectionObserver | null = null

    const run = async () => {
      const [{ gsap }, mod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrambleTextPlugin'),
      ])
      if (cancelled) return

      const ScrambleTextPlugin = (mod as any).ScrambleTextPlugin ?? (mod as any).default
      gsap.registerPlugin(ScrambleTextPlugin)

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const el = entry.target as HTMLElement
            io?.unobserve(el) // una sola vez por elemento
            const text = originals.get(el) ?? ''
            const chars = el.dataset.scramble === 'body' ? 'lowerCase' : 'upperCase'
            tweens.push(
              gsap.to(el, {
                duration: DURATION,
                scrambleText: { text, chars, speed: SPEED },
              }),
            )
          })
        },
        { threshold: 0.25 },
      )

      targets.forEach((el) => io?.observe(el))
    }

    run()

    return () => {
      cancelled = true
      io?.disconnect()
      tweens.forEach((t) => t.kill())
      originals.forEach((text, el) => { el.textContent = text })
    }
  }, [scopeRef])
}
