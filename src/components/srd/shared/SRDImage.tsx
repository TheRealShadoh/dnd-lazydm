'use client'

import { useState } from 'react'
import { Skull, Upload, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SRDImageProps {
  src?: string | null
  alt: string
  type?: 'monster' | 'item' | 'spell' | 'race' | 'class' | 'background'
  className?: string
  onUpload?: (file: File) => void
  showUploadButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const SIZE_CLASSES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  full: 'w-full aspect-square max-w-xs',
}

export function SRDImage({
  src,
  alt,
  type = 'monster',
  className = '',
  onUpload,
  showUploadButton = false,
  size = 'md',
}: SRDImageProps) {
  const [error, setError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleImageError = () => {
    setError(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
  }

  const showPlaceholder = !src || error

  return (
    <div
      className={`relative ${SIZE_CLASSES[size]} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showPlaceholder ? (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg border border-border">
          <PlaceholderIcon type={type} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg border border-border"
          onError={handleImageError}
        />
      )}

      {/* Upload overlay */}
      {showUploadButton && isHovering && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* Small upload indicator when not hovering but upload is available */}
      {showUploadButton && !isHovering && showPlaceholder && (
        <div className="absolute bottom-1 right-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="p-1 bg-primary/80 rounded text-primary-foreground hover:bg-primary transition-colors">
              <Upload className="h-3 w-3" />
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

function PlaceholderIcon({ type }: { type: SRDImageProps['type'] }) {
  const iconClass = 'h-8 w-8 text-muted-foreground'

  switch (type) {
    case 'monster':
      return <Skull className={iconClass} />
    case 'spell':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    case 'item':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case 'race':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      )
    case 'class':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'background':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    default:
      return <ImageOff className={iconClass} />
  }
}
