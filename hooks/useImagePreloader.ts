'use client'
import { useEffect, useRef } from 'react'
import { FRAME_EXT, FRAME_PREFIX, TOTAL_FRAMES } from '@/lib/constants'

export function useImagePreloader() {
  const images = useRef<HTMLImageElement[]>([])
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `${FRAME_PREFIX}${String(i).padStart(3, '0')}${FRAME_EXT}`
      images.current.push(img)
    }
  }, [])

  return images
}
