'use client'

import { useEffect, useRef, useState } from 'react'
import { Token, GridSettings, CreatureSize, CREATURE_SIZE_MULTIPLIER } from '@/types/vtt'

interface VTTCanvasProps {
  mapImageUrl: string
  tokens: Token[]
  gridSettings: GridSettings
  onTokensChange: (tokens: Token[]) => void
  selectedTokenId: string | null
  onTokenSelect: (tokenId: string | null) => void
  canvasWidth?: number
  canvasHeight?: number
  scale?: number
}

export function VTTCanvas({
  mapImageUrl,
  tokens,
  gridSettings,
  onTokensChange,
  selectedTokenId,
  onTokenSelect,
  canvasWidth = 1600,
  canvasHeight = 1200,
  scale = 1,
}: VTTCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null)
  const [tokenImages, setTokenImages] = useState<Map<string, HTMLImageElement>>(new Map())

  // Load map image
  useEffect(() => {
    const img = new Image()
    img.src = mapImageUrl
    img.onload = () => setMapImage(img)
    return () => {
      img.onload = null
    }
  }, [mapImageUrl])

  // Load token images
  useEffect(() => {
    const loadImages = async () => {
      const newImages = new Map<string, HTMLImageElement>()

      for (const token of tokens) {
        if (token.imageUrl && !tokenImages.has(token.id)) {
          const img = new Image()
          img.src = token.imageUrl
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
          newImages.set(token.id, img)
        }
      }

      if (newImages.size > 0) {
        setTokenImages((prev) => new Map([...prev, ...newImages]))
      }
    }

    loadImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mapImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawGrid = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      gridSize: number
    ) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    const drawToken = (
      ctx: CanvasRenderingContext2D,
      token: Token,
      isSelected: boolean,
      gridSize: number
    ) => {
      // Use tokenBaseSize if set, otherwise fall back to grid size
      const baseSize = gridSettings.tokenBaseSize || gridSize
      const tokenSize = baseSize * CREATURE_SIZE_MULTIPLIER[token.size]
      const tokenImage = token.imageUrl ? tokenImages.get(token.id) : null

      // Draw token circle or image
      if (tokenImage) {
        // Draw circular clipped image
        ctx.save()
        ctx.beginPath()
        ctx.arc(token.x, token.y, tokenSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(
          tokenImage,
          token.x - tokenSize / 2,
          token.y - tokenSize / 2,
          tokenSize,
          tokenSize
        )
        ctx.restore()
      } else {
        // Draw colored circle
        ctx.fillStyle = token.color || '#4ECDC4'
        ctx.beginPath()
        ctx.arc(token.x, token.y, tokenSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw border
      if (isSelected) {
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
      }
      ctx.beginPath()
      ctx.arc(token.x, token.y, tokenSize / 2, 0, Math.PI * 2)
      ctx.stroke()

      // Draw number or label
      const displayText = token.label || (token.number !== undefined ? token.number.toString() : '')
      if (displayText) {
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.font = `bold ${Math.max(16, tokenSize / 3)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeText(displayText, token.x, token.y)
        ctx.fillText(displayText, token.x, token.y)
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw map image
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (gridSettings.enabled) {
      drawGrid(ctx, canvas.width, canvas.height, gridSettings.size)
    }

    // Draw tokens
    tokens.forEach((token) => {
      drawToken(ctx, token, token.id === selectedTokenId, gridSettings.size)
    })
  }, [mapImage, tokens, gridSettings, selectedTokenId, tokenImages])

  const getTokenAtPosition = (x: number, y: number): Token | null => {
    // Check tokens in reverse order (top to bottom)
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i]
      const baseSize = gridSettings.tokenBaseSize || gridSettings.size
      const tokenSize = baseSize * CREATURE_SIZE_MULTIPLIER[token.size]
      const distance = Math.sqrt((token.x - x) ** 2 + (token.y - y) ** 2)

      if (distance <= tokenSize / 2) {
        return token
      }
    }
    return null
  }

  const snapToGrid = (value: number, gridSize: number): number => {
    // Snap to the center of grid squares instead of intersections
    return Math.floor(value / gridSize) * gridSize + gridSize / 2
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    const clickedToken = getTokenAtPosition(x, y)

    if (clickedToken) {
      onTokenSelect(clickedToken.id)
      setIsDragging(true)
      setDragOffset({
        x: x - clickedToken.x,
        y: y - clickedToken.y,
      })
    } else {
      onTokenSelect(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedTokenId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let x = (e.clientX - rect.left) / scale - dragOffset.x
    let y = (e.clientY - rect.top) / scale - dragOffset.y

    // Apply snap to grid if enabled
    if (gridSettings.enabled && gridSettings.snapToGrid) {
      x = snapToGrid(x, gridSettings.size)
      y = snapToGrid(y, gridSettings.size)
    }

    // Update token position
    const updatedTokens = tokens.map((token) =>
      token.id === selectedTokenId ? { ...token, x, y } : token
    )
    onTokensChange(updatedTokens)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border border-gray-700 rounded-lg shadow-2xl cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
