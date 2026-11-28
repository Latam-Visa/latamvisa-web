"use client"

import { useEffect, useRef } from 'react'
import { RUEDA } from '@/lib/bandanas/config'

/* Portada: anillo de cuadros que "rodea" la palabra BANDANAS.
   Capas: 1) anillo completo detrás · 2) la palabra · 3) el mismo anillo
   recortado a la mitad izquierda, delante. Las dos copias giran a la vez, así
   que cada cuadro pasa por delante de las letras a la izquierda y por detrás a
   la derecha. */

const CUADROS = RUEDA.length * 2
const COLORES = ['#33503C', '#EFCBD6', '#6E8B63', '#3F5F8A', '#C9D8E6', '#A4473C', '#B96F4B']
const RADIO = 355
const RADIO_INT = 262
const HUECO = 9
const ESQUINA = 13
const VELOCIDAD = 4 // grados por segundo

// Sector de anillo con esquinas redondeadas, centrado arriba (12 en punto).
function sector() {
  const medio = Math.PI / CUADROS
  const aExt = medio - HUECO / 2 / RADIO
  const aInt = medio - HUECO / 2 / RADIO_INT
  const p = (r: number, a: number) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`
  const dE = ESQUINA / RADIO
  const dI = ESQUINA / RADIO_INT
  // punto sobre el borde lateral a `d` px del radio dado
  const lado = (r: number, signo: 1 | -1, d: number) => {
    const t = (r + d - RADIO_INT) / (RADIO - RADIO_INT)
    return p(r + d, signo * (aInt + (aExt - aInt) * t))
  }
  return [
    `M ${p(RADIO, -aExt + dE)}`,
    `A ${RADIO} ${RADIO} 0 0 1 ${p(RADIO, aExt - dE)}`,
    `Q ${p(RADIO, aExt)} ${lado(RADIO, 1, -ESQUINA)}`,
    `L ${lado(RADIO_INT, 1, ESQUINA)}`,
    `Q ${p(RADIO_INT, aInt)} ${p(RADIO_INT, aInt - dI)}`,
    `A ${RADIO_INT} ${RADIO_INT} 0 0 0 ${p(RADIO_INT, -aInt + dI)}`,
    `Q ${p(RADIO_INT, -aInt)} ${lado(RADIO_INT, -1, ESQUINA)}`,
    `L ${lado(RADIO, -1, -ESQUINA)}`,
    `Q ${p(RADIO, -aExt)} ${p(RADIO, -aExt + dE)} Z`,
  ].join(' ')
}
const FORMA = sector()
const ANCHO_CUADRO = Math.ceil(2 * RADIO * Math.sin(Math.PI / CUADROS))
const ARRIBA = -RADIO
const ALTO_CUADRO = Math.ceil(RADIO - RADIO_INT * Math.cos(Math.PI / CUADROS))

function Cuadros({ id }: { id: string }) {
  return (
    <>
      {Array.from({ length: CUADROS }, (_, i) => {
        const n = i % RUEDA.length
        const foto = RUEDA[n]
        return (
          <g key={i} transform={`rotate(${(i * 360) / CUADROS})`}>
            <path d={FORMA} fill={COLORES[n % COLORES.length]} />
            {foto && (
              <image href={foto} x={-ANCHO_CUADRO / 2} y={ARRIBA} width={ANCHO_CUADRO} height={ALTO_CUADRO}
                preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-forma)`} />
            )}
          </g>
        )
      })}
    </>
  )
}

// Un mismo dibujo con dos encuadres: ancho (escritorio) y cuadrado (celular).
function Escena({ id, ancho, anchoPalabra, tamano, escala = 1, className }: { id: string; ancho: number; anchoPalabra: number; tamano: number; escala?: number; className: string }) {
  const cx = ancho / 2
  const cy = 390
  const caja = `0 0 ${ancho} 780`
  return (
    <div className={className}>
      <svg viewBox={caja} className="block w-full" aria-hidden="true">
        <defs><clipPath id={`${id}-forma`}><path d={FORMA} /></clipPath></defs>
        <g transform={`translate(${cx} ${cy}) scale(${escala})`}><g data-giro><Cuadros id={id} /></g></g>
        <text x={cx} y={cy + 10} textAnchor="middle" textLength={anchoPalabra} lengthAdjust="spacingAndGlyphs"
          fill="#D5F89A" fontSize={tamano} fontWeight={900} style={{ fontFamily: 'var(--font-monument-black)' }}>
          BANDANAS
        </text>
      </svg>
      <svg viewBox={caja} className="pointer-events-none absolute inset-0 block w-full" aria-hidden="true">
        <defs><clipPath id={`${id}-frente`}><rect x="0" y="0" width={cx} height="780" /></clipPath></defs>
        <g clipPath={`url(#${id}-frente)`}>
          <g transform={`translate(${cx} ${cy}) scale(${escala})`}><g data-giro><Cuadros id={id} /></g></g>
        </g>
      </svg>
    </div>
  )
}

export function Rueda({ lema }: { lema: string }) {
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = raiz.current!
    const giros = Array.from(el.querySelectorAll<SVGGElement>('[data-giro]'))
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const base = quieto ? 0 : VELOCIDAD
    let angulo = 0
    let velocidad = base
    let arrastre: number | null = null // ángulo del puntero mientras se arrastra
    let antes = performance.now()
    let tAntes = antes
    let frame = 0
    let visible = true

    const pintar = () => giros.forEach((g) => g.setAttribute('transform', `rotate(${angulo.toFixed(3)})`))
    const paso = (t: number) => {
      const dt = Math.min(0.05, (t - antes) / 1000)
      antes = t
      if (arrastre === null) {
        // inercia: tras soltar, vuelve poco a poco a la velocidad base
        velocidad += (base - velocidad) * Math.min(1, dt * 2)
        angulo = (angulo + velocidad * dt) % 360
        pintar()
      }
      frame = visible ? requestAnimationFrame(paso) : 0
    }

    const anguloDe = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
    }
    const baja = (e: PointerEvent) => {
      if ((e.target as Element).closest('a')) return
      arrastre = anguloDe(e)
      velocidad = 0
      tAntes = performance.now()
      el.setPointerCapture(e.pointerId)
    }
    const mueve = (e: PointerEvent) => {
      if (arrastre === null) return
      const a = anguloDe(e)
      const d = ((a - arrastre + 540) % 360) - 180
      const t = performance.now()
      velocidad = Math.max(-240, Math.min(240, d / Math.max(0.016, (t - tAntes) / 1000)))
      tAntes = t
      arrastre = a
      angulo = (angulo + d) % 360
      pintar()
    }
    const suelta = () => { arrastre = null }

    el.addEventListener('pointerdown', baja)
    el.addEventListener('pointermove', mueve)
    el.addEventListener('pointerup', suelta)
    el.addEventListener('pointercancel', suelta)
    // Fuera de pantalla no se anima (ahorra batería en el celular).
    const ojo = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) { antes = performance.now(); frame = requestAnimationFrame(paso) }
    })
    ojo.observe(el)
    frame = requestAnimationFrame(paso)
    return () => {
      cancelAnimationFrame(frame)
      ojo.disconnect()
      el.removeEventListener('pointerdown', baja)
      el.removeEventListener('pointermove', mueve)
      el.removeEventListener('pointerup', suelta)
      el.removeEventListener('pointercancel', suelta)
    }
  }, [])

  return (
    <div ref={raiz} className="relative mx-auto w-full max-w-[1120px] cursor-grab touch-pan-y select-none active:cursor-grabbing">
      <Escena id="ancha" ancho={1180} anchoPalabra={1110} tamano={190} className="relative hidden sm:block" />
      <Escena id="movil" ancho={730} anchoPalabra={714} tamano={122} escala={0.8} className="relative sm:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-[55%] flex flex-col items-center px-[22%] text-center sm:top-[57%] sm:px-0">
        <p className="max-w-[300px] text-[13px] font-bold leading-tight text-[#F5F1E6] sm:text-[clamp(14px,1.9vw,22px)]">{lema}</p>
        <a href="#disenos" className="pointer-events-auto mt-3 rounded-full bg-[#2C4A35] px-5 py-2.5 text-[12px] font-bold text-[#D5F89A] transition-colors hover:bg-[#D5F89A] hover:text-[#13261B] sm:mt-5 sm:text-[14px]">
          Ver los diseños
        </a>
      </div>
    </div>
  )
}
