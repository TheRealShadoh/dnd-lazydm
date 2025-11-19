'use client'

import { GridSettings, Token, CREATURE_SIZE_MULTIPLIER } from '@/types/vtt'

interface GridControlsProps {
  gridSettings: GridSettings
  onGridSettingsChange: (settings: GridSettings) => void
  tokens: Token[]
  onTokensChange: (tokens: Token[]) => void
}

export function GridControls({
  gridSettings,
  onGridSettingsChange,
  tokens,
  onTokensChange,
}: GridControlsProps) {
  const handleGridSizeChange = (newSize: number) => {
    onGridSettingsChange({
      ...gridSettings,
      size: newSize,
    })
  }

  const handleRealignTokens = () => {
    // Re-snap all tokens to the new grid
    const snapToGridCenter = (value: number, gridSize: number) => {
      return Math.round((value - gridSize / 2) / gridSize) * gridSize + gridSize / 2
    }

    const realignedTokens = tokens.map((token) => ({
      ...token,
      x: snapToGridCenter(token.x, gridSettings.size),
      y: snapToGridCenter(token.y, gridSettings.size),
    }))

    onTokensChange(realignedTokens)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Grid Settings</h3>

      {/* Enable Grid */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="gridEnabled"
          checked={gridSettings.enabled}
          onChange={(e) =>
            onGridSettingsChange({
              ...gridSettings,
              enabled: e.target.checked,
            })
          }
          className="w-5 h-5 rounded bg-gray-800 border-gray-700"
        />
        <label htmlFor="gridEnabled" className="text-gray-300 font-medium">
          Show Grid
        </label>
      </div>

      {/* Grid Size */}
      {gridSettings.enabled && (
        <>
          <div>
            <label htmlFor="gridSize" className="block text-sm text-gray-300 mb-2">
              Grid Size: {gridSettings.size}px
            </label>
            <input
              type="range"
              id="gridSize"
              min="20"
              max="150"
              step="5"
              value={gridSettings.size}
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20px</span>
              <span>150px</span>
            </div>
          </div>

          {/* Snap to Grid */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="snapToGrid"
              checked={gridSettings.snapToGrid}
              onChange={(e) =>
                onGridSettingsChange({
                  ...gridSettings,
                  snapToGrid: e.target.checked,
                })
              }
              className="w-5 h-5 rounded bg-gray-800 border-gray-700"
            />
            <label htmlFor="snapToGrid" className="text-gray-300 font-medium">
              Snap to Grid
            </label>
          </div>
        </>
      )}

      {/* Re-align Button */}
      {gridSettings.enabled && tokens.length > 0 && (
        <div className="pt-3 border-t border-gray-700">
          <button
            onClick={handleRealignTokens}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
          >
            Re-align All Tokens to Grid
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Snap all tokens to the nearest grid center
          </p>
        </div>
      )}

      {/* Info */}
      <div className="pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          💡 Tip: Medium creatures (1x1) fit in one grid square. Adjust grid size to match your
          map&apos;s scale.
        </p>
      </div>
    </div>
  )
}
