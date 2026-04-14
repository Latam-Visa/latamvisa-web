'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

function getLuminance(el: Element): number {
  let node: Element | null = el
  while (node && node !== document.body) {
    const bg = getComputedStyle(node).backgroundColor
    const m = bg.match(/\d+/g)
    if (m && !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent') {
      const [r, g, b, a] = m.map(Number)
      if (a === 0 || bg === 'rgba(0,0,0,0)') { node = node.parentElement; continue }
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }
    node = node.parentElement
  }
  return 0 // dark by default (hero)
}

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotX = useMotionValue(0)
  const dotY = useMotionValue(0)
  const ringXVal = useMotionValue(0)
  const ringYVal = useMotionValue(0)

  const springX     = useSpring(dotX,     { stiffness: 800, damping: 35 })
  const springY     = useSpring(dotY,     { stiffness: 800, damping: 35 })
  const ringSpringX = useSpring(ringXVal, { stiffness: 280, damping: 26 })
  const ringSpringY = useSpring(ringYVal, { stiffness: 280, damping: 26 })

  useEffect(() => {
    let frame = 0
    const move = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
      ringXVal.set(e.clientX)
      ringYVal.set(e.clientY)

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (!el) return
        const lum = getLuminance(el)
        const isLight = lum > 0.72
        dotRef.current?.classList.toggle('is-light', isLight)
        ringRef.current?.classList.toggle('is-light', isLight)
      })
    }
    window.addEventListener('mousemove', move)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame) }
  }, [dotX, dotY, ringXVal, ringYVal])

  return (
    <>
      <motion.div
        ref={dotRef}
        className="cursor-dot"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{ x: ringSpringX, y: ringSpringY, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  )
}
