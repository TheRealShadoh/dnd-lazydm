'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { VTTCanvas } from '@/components/vtt/VTTCanvas'
import { TokenControls } from '@/components/vtt/TokenControls'
import { GridControls } from '@/components/vtt/GridControls'
import { InitiativeTracker } from '@/components/vtt/InitiativeTracker'
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
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    if (mapImageUrl) {
      const savedState = loadVTTState(mapImageUrl)
      if (savedState) {
        setTokens(savedState.tokens)
        setGridSettings(savedState.gridSettings)
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
        canvasWidth: 1600,
        canvasHeight: 1200,
      }
      saveVTTState(state)
    }
  }, [tokens, gridSettings, mapImageUrl, isLoaded])

  const handleAddToken = useCallback((token: Token) => {
    setTokens((prev) => [...prev, token])
  }, [])

  const handleUpdateToken = useCallback((tokenId: string, updates: Partial<Token>) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, ...updates } : t)))
  }, [])

  const handleDeleteToken = useCallback(
    (tokenId: string) => {
      setTokens((prev) => prev.filter((t) => t.id !== tokenId))
      if (selectedTokenId === tokenId) {
        setSelectedTokenId(null)
      }
    },
    [selectedTokenId]
  )

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
            <VTTCanvas
              mapImageUrl={mapImageUrl}
              tokens={tokens}
              gridSettings={gridSettings}
              onTokensChange={setTokens}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
            />

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
            <InitiativeTracker
              tokens={tokens}
              onUpdateToken={handleUpdateToken}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
            />
            <TokenControls
              tokens={tokens}
              onAddToken={handleAddToken}
              onUpdateToken={handleUpdateToken}
              onDeleteToken={handleDeleteToken}
              selectedTokenId={selectedTokenId}
              gridSize={gridSettings.size}
              canvasWidth={1600}
              canvasHeight={1200}
            />
            <GridControls
              gridSettings={gridSettings}
              onGridSettingsChange={setGridSettings}
              tokens={tokens}
              onTokensChange={setTokens}
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
