import { useRef, useEffect } from 'react'

export default function VideoTestimonialCard({ src, active }: { src: string, active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (active && videoRef.current) {
      videoRef.current.play()
    } else if (!active && videoRef.current) {
      videoRef.current.pause()
    }
  }, [active])

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.play()
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.pause()
      }}
      style={{
        borderRadius: 'inherit',
      }}
    />
  )
}
