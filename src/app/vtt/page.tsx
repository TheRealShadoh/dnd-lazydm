'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { VTTCanvas } from '@/components/vtt/VTTCanvas'
import { TokenControls } from '@/components/vtt/TokenControls'
import { GridControls } from '@/components/vtt/GridControls'
import { InitiativeTracker } from '@/components/vtt/InitiativeTracker'
import { ShareControl } from '@/components/vtt/ShareControl'
import { Token, GridSettings, VTTState } from '@/types/vtt'
import { saveVTTState, loadVTTState, clearVTTState } from '@/lib/vtt-storage'
import { useConfirm } from '@/hooks/useConfirm'
import { MainNav } from '@/components/layout/MainNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Loader2, Map, Trash2, RotateCcw, X, ZoomIn, Lightbulb } from 'lucide-react'

function VTTContent() {
  const searchParams = useSearchParams()
  const mapImageUrl = searchParams.get('map') || ''
  const campaignId = searchParams.get('campaignId') || ''
  const vttId = searchParams.get('vttId') || mapImageUrl // Use map URL as vttId if not provided
  const { confirm } = useConfirm()
  const { data: session } = useSession()

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

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Tokens',
      message: 'Are you sure you want to clear all tokens? This cannot be undone.',
      confirmText: 'Clear All',
      variant: 'danger',
    })

    if (confirmed) {
      setTokens([])
      setSelectedTokenId(null)
    }
  }

  const handleResetVTT = async () => {
    const confirmed = await confirm({
      title: 'Reset VTT',
      message: 'Are you sure you want to reset the VTT? This will clear all tokens and grid settings.',
      confirmText: 'Reset',
      variant: 'danger',
    })

    if (confirmed) {
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
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Card variant="fantasy" className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <Map className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground mb-2">No Map Selected</h1>
              <p className="text-muted-foreground">Please select a map image to use the VTT.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="max-w-[2000px] mx-auto p-4">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-primary">Virtual Tabletop</h1>
            <p className="text-sm text-muted-foreground mt-1">D&D 5e - Lightweight VTT</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="destructive" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Tokens
            </Button>
            <Button variant="outline" onClick={handleResetVTT}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset VTT
            </Button>
            <Button variant="primary" onClick={() => window.close()}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Canvas Area */}
          <div className="flex flex-col">
            <div className="overflow-auto border border-border rounded-lg bg-card p-4">
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

            {/* Instructions - Mobile only */}
            <Card variant="fantasy" className="mt-4 lg:hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click and drag tokens to move them on the map</li>
                  <li>• Click on a token to select it (gold border)</li>
                  <li>• Use the controls on the right to create and manage tokens</li>
                  <li>• Enable &quot;Snap to Grid&quot; for precise token placement</li>
                  <li>• All changes are automatically saved to your browser</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Controls Sidebar - Fixed height with internal scrolling */}
          <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto sticky top-4 pr-2">
            <InitiativeTracker
              tokens={tokens}
              onUpdateToken={handleUpdateToken}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
            />

            {/* Share Control for DMs */}
            {session && campaignId && vttId && (
              <ShareControl campaignId={campaignId} vttId={vttId} />
            )}

            {/* Zoom Controls */}
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="h-5 w-5 text-primary" />
                  Zoom / Scale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scale">
                    Scale: {Math.round(scale * 100)}%
                  </Label>
                  <input
                    type="range"
                    id="scale"
                    min="0.25"
                    max="2"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>25%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(1)}
                  >
                    100%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(1.5)}
                  >
                    150%
                  </Button>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-start gap-1">
                    <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Use zoom to make the map larger or smaller without changing token positions.
                  </p>
                </div>
              </CardContent>
            </Card>

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
      </main>
    </div>
  )
}

export default function VTTPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-ui">Loading VTT...</p>
        </div>
      </div>
    }>
      <VTTContent />
    </Suspense>
  )
}
