'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { VTTCanvas } from '@/components/vtt/VTTCanvas'
import { TokenControls } from '@/components/vtt/TokenControls'
import { GridControls } from '@/components/vtt/GridControls'
import { Token, GridSettings, VTTState } from '@/types/vtt'
import { saveVTTState, loadVTTState, clearVTTState } from '@/lib/vtt-storage'

function VTTContent() {
  const searchParams = useSearchParams()
  const mapImageUrl = searchParams.get('map') || ''

  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    enabled: true,
    size: 50,
    snapToGrid: true,
  })
  const [canvasWidth, setCanvasWidth] = useState(1600)
  const [canvasHeight, setCanvasHeight] = useState(1200)
  const [scale, setScale] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    if (mapImageUrl) {
      const savedState = loadVTTState(mapImageUrl)
      if (savedState) {
        setTokens(savedState.tokens)
        setGridSettings(savedState.gridSettings)
        if (savedState.canvasWidth) setCanvasWidth(savedState.canvasWidth)
        if (savedState.canvasHeight) setCanvasHeight(savedState.canvasHeight)
        if (savedState.scale) setScale(savedState.scale)
      }
      setIsLoaded(true)
    }
  }, [mapImageUrl])

  // Auto-save state whenever it changes
  useEffect(() => {
    if (isLoaded && mapImageUrl) {
      const state: VTTState = {
        mapImageUrl,
        tokens,
        gridSettings,
        canvasWidth,
        canvasHeight,
        scale,
      }
      saveVTTState(state)
    }
  }, [tokens, gridSettings, canvasWidth, canvasHeight, scale, mapImageUrl, isLoaded])

  const handleAddToken = useCallback((token: Token) => {
    setTokens((prev) => [...prev, token])
  }, [])

  const handleDeleteToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null)
    }
  }, [selectedTokenId])

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all tokens? This cannot be undone.')) {
      setTokens([])
      setSelectedTokenId(null)
    }
  }

  const handleResetVTT = () => {
    if (
      confirm(
        'Are you sure you want to reset the VTT? This will clear all tokens and grid settings.'
      )
    ) {
      setTokens([])
      setSelectedTokenId(null)
      setGridSettings({
        enabled: true,
        size: 50,
        snapToGrid: true,
      })
      setCanvasWidth(1600)
      setCanvasHeight(1200)
      setScale(1)
      if (mapImageUrl) {
        clearVTTState(mapImageUrl)
      }
    }
  }

  if (!mapImageUrl) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">No Map Selected</h1>
          <p className="text-gray-400">Please select a map image to use the VTT.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Virtual Tabletop</h1>
            <p className="text-sm text-gray-400 mt-1">D&D 5e - Lightweight VTT</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Clear All Tokens
            </button>
            <button
              onClick={handleResetVTT}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              Reset VTT
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
          {/* Canvas Area */}
          <div className="flex flex-col">
            <div className="overflow-auto border border-gray-700 rounded-lg bg-gray-900 p-4">
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <VTTCanvas
                  mapImageUrl={mapImageUrl}
                  tokens={tokens}
                  gridSettings={gridSettings}
                  onTokensChange={setTokens}
                  selectedTokenId={selectedTokenId}
                  onTokenSelect={setSelectedTokenId}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  scale={scale}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="font-semibold text-purple-300 mb-2">Instructions</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Click and drag tokens to move them on the map</li>
                <li>• Click on a token to select it (gold border)</li>
                <li>• Use the controls on the right to create and manage tokens</li>
                <li>• Enable &quot;Snap to Grid&quot; for precise token placement</li>
                <li>• All changes are automatically saved to your browser</li>
              </ul>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Zoom / Scale</h3>

              <div>
                <label htmlFor="scale" className="block text-sm text-gray-300 mb-2">
                  Scale: {Math.round(scale * 100)}%
                </label>
                <input
                  type="range"
                  id="scale"
                  min="0.25"
                  max="2"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>25%</span>
                  <span>200%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setScale(0.5)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  50%
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  100%
                </button>
                <button
                  onClick={() => setScale(1.5)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  150%
                </button>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  💡 Tip: Use zoom to make the map larger or smaller without changing token positions.
                </p>
              </div>
            </div>

            <TokenControls
              tokens={tokens}
              onAddToken={handleAddToken}
              onDeleteToken={handleDeleteToken}
              selectedTokenId={selectedTokenId}
              gridSize={gridSettings.size}
            />
            <GridControls
              gridSettings={gridSettings}
              onGridSettingsChange={setGridSettings}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VTTPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading VTT...</p>
        </div>
      </div>
    }>
      <VTTContent />
    </Suspense>
  )
}
