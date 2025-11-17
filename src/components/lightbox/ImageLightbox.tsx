'use client'

import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import Image from 'next/image'

interface ImageLightboxProps {
  src: string
  alt?: string
  caption?: string
  className?: string
  width?: number
  height?: number
}

export function ImageLightbox({
  src,
  alt = '',
  caption,
  className = '',
  width = 800,
  height = 600,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50
                     hover:scale-[1.02] transition-all duration-300 w-full h-auto"
          loading="lazy"
        />
        {caption && (
          <p className="text-sm text-gray-400 mt-2 italic text-center">{caption}</p>
        )}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt, description: caption }]}
        plugins={[Zoom]}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
          button: {
            filter: 'none',
            backgroundColor: 'rgba(171, 71, 188, 0.8)',
          },
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
      />
    </>
  )
}
