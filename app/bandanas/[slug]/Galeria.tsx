"use client"

import Image from 'next/image'
import { useRef, useState } from 'react'

// Carrusel con scroll nativo (deslizar en el celular) y miniaturas.
export function Galeria({ images, name }: { images: string[]; name: string }) {
  const [actual, setActual] = useState(0)
  const pista = useRef<HTMLDivElement>(null)

  if (!images.length) return <div className="flex aspect-square items-center justify-center text-sm text-black/40">Foto pronto</div>

  const ir = (i: number) => pista.current?.scrollTo({ left: i * pista.current.clientWidth, behavior: 'smooth' })

  return (
    <div className="min-w-0">
      <div ref={pista} onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <div key={src} className="relative aspect-square w-full shrink-0 snap-center">
            <Image src={src} alt={`${name} — foto ${i + 1}`} fill sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} className="object-contain" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, i) => (
            <button key={src} onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual}
              className={`relative h-16 w-16 shrink-0 border ${i === actual ? 'border-black' : 'border-transparent opacity-60'}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
