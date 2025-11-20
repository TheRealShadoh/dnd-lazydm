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
  campaignId?: string
  vttId?: string
}

export function ImageLightbox({
  src,
  alt = '',
  caption,
  className = '',
  width = 800,
  height = 600,
  campaignId,
  vttId,
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
        slides={[{ src, alt }]}
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
        toolbar={{
          buttons: [
            <button
              key="vtt"
              type="button"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold transition shadow-lg"
              onClick={() => {
                const params = new URLSearchParams({ map: src })
                if (campaignId) params.set('campaignId', campaignId)
                if (vttId) params.set('vttId', vttId)
                const vttUrl = `/vtt?${params.toString()}`
                window.open(vttUrl, '_blank', 'width=1920,height=1080')
              }}
            >
              🎲 Open VTT
            </button>,
            'close',
          ],
        }}
      />
    </>
  )
}
