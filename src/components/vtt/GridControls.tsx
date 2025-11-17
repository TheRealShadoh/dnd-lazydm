'use client'

import { GridSettings } from '@/types/vtt'

interface GridControlsProps {
  gridSettings: GridSettings
  onGridSettingsChange: (settings: GridSettings) => void
}

export function GridControls({ gridSettings, onGridSettingsChange }: GridControlsProps) {
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
              onChange={(e) =>
                onGridSettingsChange({
                  ...gridSettings,
                  size: parseInt(e.target.value),
                })
              }
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
