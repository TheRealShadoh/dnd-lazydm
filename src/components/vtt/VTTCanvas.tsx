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
  userTokenIds?: string[] // Token IDs the user can control (for player mode)
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
  userTokenIds,
}: VTTCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null)
  const [tokenImages, setTokenImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [measureMode, setMeasureMode] = useState(false)
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null)
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null)

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
  }, [tokens, tokenImages])

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
      const tokenSize = gridSize * CREATURE_SIZE_MULTIPLIER[token.size]
      const tokenImage = token.imageUrl ? tokenImages.get(token.id) : null
      const isUserToken = userTokenIds && userTokenIds.includes(token.id)

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
      } else if (isUserToken) {
        ctx.strokeStyle = '#22C55E' // Green border for user-controlled tokens
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
      }
      ctx.beginPath()
      ctx.arc(token.x, token.y, tokenSize / 2, 0, Math.PI * 2)
      ctx.stroke()

      // Draw HP bar if token has HP
      if (token.currentHp !== undefined && token.maxHp !== undefined && token.maxHp > 0) {
        const barWidth = tokenSize * 0.8
        const barHeight = 6
        const barX = token.x - barWidth / 2
        const barY = token.y + tokenSize / 2 + 4

        // Background
        ctx.fillStyle = '#000000'
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2)

        // HP bar
        const hpPercent = Math.max(0, Math.min(1, token.currentHp / token.maxHp))
        ctx.fillStyle = hpPercent > 0.5 ? '#22C55E' : hpPercent > 0.25 ? '#EAB308' : '#EF4444'
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight)

        // Border
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.strokeRect(barX, barY, barWidth, barHeight)

        // HP text
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.font = `bold ${Math.max(10, tokenSize / 6)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const hpText = `${token.currentHp}/${token.maxHp}`
        ctx.strokeText(hpText, token.x, barY + barHeight + 2)
        ctx.fillText(hpText, token.x, barY + barHeight + 2)
      }

      // Draw conditions
      if (token.conditions && token.conditions.length > 0) {
        const conditionSize = Math.max(12, tokenSize / 5)
        const startY = token.y - tokenSize / 2 - conditionSize - 2
        token.conditions.slice(0, 3).forEach((condition, i) => {
          const condX = token.x - conditionSize + i * (conditionSize + 2)

          // Condition background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.beginPath()
          ctx.arc(condX, startY, conditionSize / 2, 0, Math.PI * 2)
          ctx.fill()

          // Condition icon (first letter)
          ctx.fillStyle = '#FFFFFF'
          ctx.font = `bold ${conditionSize * 0.7}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(condition[0].toUpperCase(), condX, startY)
        })
      }

      // Draw number or label in center
      const displayText = token.label || token.name || (token.number !== undefined ? token.number.toString() : '')
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

      // Draw AC badge if available
      if (token.ac !== undefined) {
        const badgeSize = Math.max(16, tokenSize / 4)
        const badgeX = token.x + tokenSize / 2 - badgeSize / 2
        const badgeY = token.y - tokenSize / 2 + badgeSize / 2

        // Badge background
        ctx.fillStyle = '#1E40AF'
        ctx.beginPath()
        ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2)
        ctx.fill()

        // Badge border
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2)
        ctx.stroke()

        // AC text
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `bold ${badgeSize * 0.6}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(token.ac.toString(), badgeX, badgeY)
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

    // Draw measurement line
    if (measureMode && measureStart) {
      ctx.strokeStyle = '#FFFF00'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(measureStart.x, measureStart.y)
      ctx.lineTo(measureEnd?.x || measureStart.x, measureEnd?.y || measureStart.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw distance text
      if (measureEnd) {
        const dx = measureEnd.x - measureStart.x
        const dy = measureEnd.y - measureStart.y
        const distancePixels = Math.sqrt(dx * dx + dy * dy)
        const distanceFeet = Math.round((distancePixels / gridSettings.size) * 5)

        const midX = (measureStart.x + measureEnd.x) / 2
        const midY = (measureStart.y + measureEnd.y) / 2

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(midX - 30, midY - 15, 60, 30)

        // Text
        ctx.fillStyle = '#FFFF00'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${distanceFeet} ft`, midX, midY)
      }

      // Draw start/end markers
      ctx.fillStyle = '#FFFF00'
      ctx.beginPath()
      ctx.arc(measureStart.x, measureStart.y, 5, 0, Math.PI * 2)
      ctx.fill()
      if (measureEnd) {
        ctx.beginPath()
        ctx.arc(measureEnd.x, measureEnd.y, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [mapImage, tokens, gridSettings, selectedTokenId, measureMode, measureStart, measureEnd, tokenImages, userTokenIds])

  const getTokenAtPosition = (x: number, y: number): Token | null => {
    // Check tokens in reverse order (top to bottom)
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i]
      const tokenSize = gridSettings.size * CREATURE_SIZE_MULTIPLIER[token.size]
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

    // Measure mode
    if (measureMode) {
      if (!measureStart) {
        setMeasureStart({ x, y })
        setMeasureEnd({ x, y })
      } else {
        setMeasureEnd({ x, y })
      }
      return
    }

    const clickedToken = getTokenAtPosition(x, y)

    if (clickedToken) {
      onTokenSelect(clickedToken.id)

      // Check if user can control this token (in player mode)
      const canControl = !userTokenIds || userTokenIds.includes(clickedToken.id)

      if (canControl) {
        setIsDragging(true)
        setDragOffset({
          x: x - clickedToken.x,
          y: y - clickedToken.y,
        })
      }
    } else {
      onTokenSelect(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    // Update measure end point if measuring
    if (measureMode && measureStart) {
      setMeasureEnd({ x, y })
      return
    }

    if (!isDragging || !selectedTokenId) return

    let tokenX = x - dragOffset.x
    let tokenY = y - dragOffset.y

    // Apply snap to grid if enabled
    if (gridSettings.enabled && gridSettings.snapToGrid) {
      tokenX = snapToGrid(tokenX, gridSettings.size)
      tokenY = snapToGrid(tokenY, gridSettings.size)
    }

    // Apply bounds checking - keep tokens on canvas
    const selectedToken = tokens.find((t) => t.id === selectedTokenId)
    if (selectedToken) {
      const tokenSize = gridSettings.size * CREATURE_SIZE_MULTIPLIER[selectedToken.size]
      const radius = tokenSize / 2
      tokenX = Math.max(radius, Math.min(canvas.width - radius, tokenX))
      tokenY = Math.max(radius, Math.min(canvas.height - radius, tokenY))
    }

    // Update token position
    const updatedTokens = tokens.map((token) =>
      token.id === selectedTokenId ? { ...token, x: tokenX, y: tokenY } : token
    )
    onTokensChange(updatedTokens)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - delete selected token
      if (e.key === 'Delete' && selectedTokenId) {
        const updatedTokens = tokens.filter((t) => t.id !== selectedTokenId)
        onTokensChange(updatedTokens)
        onTokenSelect(null)
      }

      // M key - toggle measure mode
      if (e.key === 'm' || e.key === 'M') {
        setMeasureMode((prev) => !prev)
        setMeasureStart(null)
        setMeasureEnd(null)
      }

      // Escape - clear measurement or deselect
      if (e.key === 'Escape') {
        if (measureMode) {
          setMeasureStart(null)
          setMeasureEnd(null)
        } else {
          onTokenSelect(null)
        }
      }

      // C key - clear measurement
      if ((e.key === 'c' || e.key === 'C') && measureMode) {
        setMeasureStart(null)
        setMeasureEnd(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTokenId, tokens, onTokensChange, onTokenSelect, measureMode])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`border border-gray-700 rounded-lg shadow-2xl ${
          measureMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {/* Measure mode indicator */}
      {measureMode && (
        <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold shadow-lg">
          📏 Measure Mode - Click two points | Press M to exit | Press C to clear
        </div>
      )}
      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-gray-900/90 text-gray-300 rounded-lg text-xs space-y-1 border border-gray-700">
        <div className="font-semibold text-purple-400 mb-1">Keyboard Shortcuts:</div>
        <div><kbd className="px-1 py-0.5 bg-gray-700 rounded">M</kbd> - Measure distance</div>
        <div><kbd className="px-1 py-0.5 bg-gray-700 rounded">Del</kbd> - Delete selected</div>
        <div><kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> - Deselect/Clear</div>
      </div>
    </div>
  )
}
