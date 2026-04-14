'use client'
import { motion, type Variants } from 'framer-motion'

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

// Expo-out cubic-bezier — organic, never robotic
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function buildVariants(
  direction: RevealDirection = 'up',
  distance = 36,
  delay = 0,
  duration = 0.82,
): Variants {
  const offsets: Record<RevealDirection, { x?: number; y?: number }> = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: -distance },
    right: { x: distance },
    none:  {},
  }
  return {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: EASE, delay },
    },
  }
}

// Variants for a stagger container (children inherit and stagger)
export function staggerContainerVariants(stagger = 0.11, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

// Single element with directional reveal
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.82,
  distance = 36,
  className,
}: {
  children: React.ReactNode
  direction?: RevealDirection
  delay?: number
  duration?: number
  distance?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={buildVariants(direction, distance, delay, duration)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}
