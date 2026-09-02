'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { stopLenis, startLenis } from '@/lib/lenis'
import { useScramble } from './useScramble'

/* Overlay del menú a pantalla completa.
   Accesibilidad: role="dialog" + aria-modal, cierra con Escape, el foco entra
   al abrir, queda atrapado dentro mientras está abierto, y vuelve al botón
   que lo abrió al cerrar. */

const LINKS = [
  { label: 'La idea', href: '#la-idea' },
  { label: 'Rutas', href: '#vuelos' },
  { label: 'Destinos', href: '#destinos' },
  { label: 'Cotiza', href: '#cotiza' },
  { label: 'Contacto', href: '#contacto' },
  { label: 'LATAM VISA', href: '/' },
]

export default function MenuOverlay({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean
  onClose: () => void
  returnFocusTo?: React.RefObject<HTMLElement>
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Los links entran revueltos igual que el resto de la página
  useScramble(panelRef, open)

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    const prevOverflow = document.body.style.overflow

    // Body overflow alone doesn't hold: Lenis keeps scrolling the page from
    // wheel/touch events, so it has to be stopped too.
    document.body.style.overflow = 'hidden'
    stopLenis()

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((el) => el.offsetParent !== null)

    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panel?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      startLenis()
      returnFocusTo?.current?.focus()
    }
  }, [open, onClose, returnFocusTo])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: 'var(--viajes-ink)' }}
    >
      <div className="flex items-start justify-end" style={{ padding: '32px' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="viajes-label"
          style={{
            color: '#FFFFFF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.2em',
            padding: '10px',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center" style={{ padding: '0 32px 64px' }}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="viajes-wordmark"
            style={{
              fontSize: 'clamp(2rem, 7vw, 4.5rem)',
              lineHeight: 1.06,
              textAlign: 'left',
              textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            <span data-scramble>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
