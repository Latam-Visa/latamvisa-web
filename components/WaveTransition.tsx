'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useInView } from 'framer-motion'

export default function WaveTransition({ inverted = false }: { inverted?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const path1Ref = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const inView = useInView(containerRef, { once: false, amount: 0.3 })
  // Unique gradient IDs so inverted + normal instances don't collide in the DOM
  const gId1 = inverted ? 'gradient1-inv' : 'gradient1'
  const gId2 = inverted ? 'gradient2-inv' : 'gradient2'
  
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const isOpenedObj = useRef({ value: false })
  const allPointsRef = useRef<number[][]>([])
  const pointsDelayRef = useRef<number[]>([])

  useEffect(() => {
    if (!path1Ref.current || !path2Ref.current) return

    const paths = [path1Ref.current, path2Ref.current]
    const numPoints = 10
    const numPaths = paths.length
    
    allPointsRef.current = []
    pointsDelayRef.current = []

    for (let i = 0; i < numPaths; i++) {
        let points: number[] = []
        allPointsRef.current.push(points)
        for (let j = 0; j < numPoints; j++) {
            points.push(100)
        }
    }

    const render = () => {
      const isOpened = isOpenedObj.current.value
      for (let i = 0; i < numPaths; i++) {
        let path = paths[i]
        let points = allPointsRef.current[i]
        
        let d = ""
        // Using exactly their logic
        d += isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`
        
        for (let j = 0; j < numPoints - 1; j++) {
            let p = (j + 1) / (numPoints - 1) * 100
            let cp = p - (1 / (numPoints - 1) * 100) / 2
            d += ` ${cp} ${points[j]} ${cp} ${points[j+1]} ${p} ${points[j+1]}`
        }
        
        d += isOpened ? ` V 100 H 0` : ` V 0 H 0`
        if (path) path.setAttribute("d", d)
      }  
    }

    const tl = gsap.timeline({
      onUpdate: render,
      defaults: {
        ease: "power2.inOut",
        duration: 1.5
      }
    })
    tlRef.current = tl

    // initial render
    render()

    return () => {
      if (tlRef.current) {
        tlRef.current.kill()
      }
    }
  }, [])

  // Trigger on inView changes
  useEffect(() => {
    if (!tlRef.current || allPointsRef.current.length === 0) return

    const tl = tlRef.current
    const numPoints = 10
    const numPaths = 2
    const delayPointsMax = 0.5
    const delayPerPath = 0.45

    // Invert mode for the splashing effect when scrolling in vs out
    isOpenedObj.current.value = inView

    tl.progress(0).clear()
    
    // reset points back to 100 before animating to 0
    for (let i = 0; i < numPaths; i++) {
      for (let j = 0; j < numPoints; j++) {
        allPointsRef.current[i][j] = 100
      }
    }
    
    for (let i = 0; i < numPoints; i++) {
        pointsDelayRef.current[i] = Math.random() * delayPointsMax
    }
    
    const isOpened = isOpenedObj.current.value
    for (let i = 0; i < numPaths; i++) {
        let points = allPointsRef.current[i]
        let pathDelay = delayPerPath * (isOpened ? i : (numPaths - i - 1))
        
        for (let j = 0; j < numPoints; j++) {      
            let delay = pointsDelayRef.current[j]      
            tl.to(points, {
                [j]: 0
            }, delay + pathDelay)
        }
    }
  }, [inView])

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0"
      style={{ marginTop: '-2px' }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={inverted ? { transform: 'scaleY(-1)' } : undefined}
      >
        <defs>
          {inverted ? (
            // Inverted: transparent at SVG-top (visual bottom) → green at SVG-bottom (visual top after flip)
            <>
              <linearGradient id={gId1} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C8FF00" stopOpacity="0"/>
                <stop offset="100%" stopColor="#C8FF00" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id={gId2} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A8D900" stopOpacity="0"/>
                <stop offset="100%" stopColor="#A8D900" stopOpacity="1"/>
              </linearGradient>
            </>
          ) : (
            // Normal: green at top → lighter green at bottom
            <>
              <linearGradient id={gId1} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C8FF00"/>
                <stop offset="100%" stopColor="#E9FF99"/>
              </linearGradient>
              <linearGradient id={gId2} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A8D900"/>
                <stop offset="100%" stopColor="#C8FF00"/>
              </linearGradient>
            </>
          )}
        </defs>

        <path ref={path1Ref} fill={`url(#${gId2})`} />
        <path ref={path2Ref} fill={`url(#${gId1})`} />
      </svg>
    </div>
  )
}
