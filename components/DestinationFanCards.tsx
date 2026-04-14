'use client'
import { useRef, useEffect } from 'react'

const destinations = [
  {
    name: 'Melbourne',
    img: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=85',
  },
  {
    name: 'Sydney',
    img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=85',
  },
  {
    name: 'Toronto',
    img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=85',
  },
  {
    name: 'Miami',
    img: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&q=85',
  },
  {
    name: 'Madrid',
    img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=85',
  },
]

export default function DestinationFanCards() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let gsapInstance: typeof import('gsap')['gsap'] | null = null

    const init = async () => {
      const { gsap } = await import('gsap')
      gsapInstance = gsap

      const container = containerRef.current
      if (!container) return

      const cards = Array.from(container.querySelectorAll<HTMLElement>('.fan-card'))

      // Set initial stacked positions
      cards.forEach((card, i) => {
        gsap.set(card, { x: i * 12, rotation: i * 2, transformOrigin: 'bottom left' })
      })

      const onEnter = () => {
        cards.forEach((card, i) => {
          gsap.to(card, {
            x: i * 110,
            rotation: (i - 2) * 6,
            duration: 0.4,
            ease: 'power2.out',
          })
        })
      }

      const onLeave = () => {
        cards.forEach((card, i) => {
          gsap.to(card, {
            x: i * 12,
            rotation: i * 2,
            duration: 0.4,
            ease: 'power2.inOut',
          })
        })
      }

      container.addEventListener('mouseenter', onEnter)
      container.addEventListener('mouseleave', onLeave)

      return () => {
        container.removeEventListener('mouseenter', onEnter)
        container.removeEventListener('mouseleave', onLeave)
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn })

    return () => { cleanup?.() }
  }, [])

  return (
    <section
      className="relative z-10 py-20 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, rgba(200,255,0,0.78) 0%, rgba(250,250,250,0.95) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <p
          className="font-monument font-light text-[#5B6A00] text-xs tracking-[0.35em] uppercase mb-3"
        >
          Destinos
        </p>
        <h2
          className="font-monument font-black text-[#111111] text-2xl md:text-4xl tracking-tight mb-16"
        >
          Elige tu <span className="text-[#5B6A00] italic">próxima ciudad</span>
        </h2>

        {/* Fan stack */}
        <div className="flex justify-center">
          {/* Wrapper sizes the hit area so cards don't overflow during fan */}
          <div
            style={{
              position: 'relative',
              width: `${160 + 4 * 110 + 80}px`,   /* enough for fully fanned state */
              height: '260px',
            }}
          >
            <div
              ref={containerRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              {destinations.map((dest, i) => (
                <div
                  key={dest.name}
                  className="fan-card"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '160px',
                    height: '240px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '2px solid #C8FF00',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                    transformOrigin: 'bottom left',
                    userSelect: 'none',
                    zIndex: i + 1,
                  }}
                >
                  {/* Background image */}
                  <img
                    src={dest.img}
                    alt={dest.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                    draggable={false}
                  />

                  {/* Dark gradient at bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
                    }}
                  />

                  {/* City name */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '14px',
                      left: '14px',
                      fontFamily: "'PPMonumentExtended', sans-serif",
                      fontWeight: 900,
                      fontSize: '12px',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      lineHeight: 1.1,
                    }}
                  >
                    {dest.name}
                  </span>

                  {/* Lime accent line bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(to right, #C8FF00, transparent)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p
          className="font-monument font-light text-[#111111]/40 text-[10px] tracking-widest uppercase text-center mt-10"
        >
          Pasa el cursor sobre las tarjetas
        </p>
      </div>
    </section>
  )
}
