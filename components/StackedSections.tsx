'use client'
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function StackedSections({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    // Safety check for mobile (where sticky pinning can sometimes be jittery, 
    // though GSAP handles it well with pinType: 'fixed' by default)
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.stacked-panel') as HTMLElement[]
      
      panels.forEach((panel, i) => {
        // We don't pin the very last panel so it can just scroll normally out of the document flow
        if (i === panels.length - 1) return

        ScrollTrigger.create({
          trigger: panel,
          // If the section is taller than the screen, pin it when its BOTTOM reaches the bottom.
          // Otherwise, pin it when its TOP reaches the top.
          start: () => panel.offsetHeight > window.innerHeight ? "bottom bottom" : "top top",
          pin: true,
          pinSpacing: false, // This removes the spacer GSAP normally adds, forcing the NEXT section to scroll over it!
        })
      })
    }, containerRef)

    // Cleanup and recalculate on resize is automatically handled by ctx.revert()
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full z-20">
      {React.Children.map(children, (child, index) => {
        // Ignore null/undefined children
        if (!child) return null
        
        return (
          <div 
            key={index} 
            className="stacked-panel relative w-full bg-[#050505] lg:bg-black/85 backdrop-blur-3xl shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-white/5"
            style={{ 
              zIndex: index + 10,
              // Transform ensures GPU acceleration for the sliding panels
              transform: 'translateZ(0)'
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}
