import { useRef, useEffect } from 'react'
import Image from 'next/image'

export default function TestimonialMedia({ item, active = false, large = false }: { item: { type: 'video' | 'image', src: string }, active?: boolean, large?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      if (active) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [active, item.type])

  if (item.type === 'video') {
    return (
      <video
        ref={videoRef}
        src={item.src}
        className="w-full h-full object-cover"
        muted={!large}
        loop
        playsInline
        controls={large}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.play().catch(() => {})
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.pause()
        }}
        style={{ borderRadius: large ? '24px' : '14px' }}
      />
    )
  }

  return (
    <Image
      src={item.src}
      className="w-full h-full object-cover"
      width={large ? 800 : 400}
      height={large ? 1600 : 800}
      alt="Testimonial"
      style={{ borderRadius: large ? '24px' : '14px' }}
    />
  )
}
