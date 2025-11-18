'use client'

import { useState } from 'react'
import { Token, TokenType, CreatureSize, TOKEN_COLORS, TokenCondition } from '@/types/vtt'
import { nanoid } from 'nanoid'

interface TokenControlsProps {
  tokens: Token[]
  onAddToken: (token: Token) => void
  onDeleteToken: (tokenId: string) => void
  onUpdateToken: (tokenId: string, updates: Partial<Token>) => void
  selectedTokenId: string | null
  gridSize: number
  canvasWidth: number
  canvasHeight: number
}

export function TokenControls({
  tokens,
  onAddToken,
  onDeleteToken,
  onUpdateToken,
  selectedTokenId,
  gridSize,
  canvasWidth,
  canvasHeight,
}: TokenControlsProps) {
  const [tokenType, setTokenType] = useState<TokenType>('monster')
  const [tokenSize, setTokenSize] = useState<CreatureSize>('medium')
  const [tokenColor, setTokenColor] = useState(TOKEN_COLORS[0])
  const [tokenNumber, setTokenNumber] = useState('')
  const [tokenLabel, setTokenLabel] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [tokenImageUrl, setTokenImageUrl] = useState('')
  const [imageSource, setImageSource] = useState<'color' | 'url' | 'player'>('color')
  const [tokenHp, setTokenHp] = useState('')
  const [tokenMaxHp, setTokenMaxHp] = useState('')
  const [tokenAc, setTokenAc] = useState('')
  const [tokenInitiative, setTokenInitiative] = useState('')

  const selectedToken = tokens.find((t) => t.id === selectedTokenId)

  const handleCreateToken = () => {
    // Calculate grid-centered spawn position (center of canvas, snapped to grid)
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const snapToGridCenter = (value: number, gridSize: number) => {
      return Math.round((value - gridSize / 2) / gridSize) * gridSize + gridSize / 2
    }
    const spawnX = snapToGridCenter(centerX, gridSize)
    const spawnY = snapToGridCenter(centerY, gridSize)

    const newToken: Token = {
      id: nanoid(),
      x: spawnX,
      y: spawnY,
      size: tokenSize,
      type: tokenType,
      color: imageSource === 'color' ? tokenColor : undefined,
      number: tokenNumber ? parseInt(tokenNumber) : undefined,
      label: tokenLabel || undefined,
      name: tokenName || undefined,
      imageUrl: imageSource === 'url' ? tokenImageUrl : undefined,
      currentHp: tokenHp ? parseInt(tokenHp) : undefined,
      maxHp: tokenMaxHp ? parseInt(tokenMaxHp) : undefined,
      ac: tokenAc ? parseInt(tokenAc) : undefined,
      initiative: tokenInitiative ? parseInt(tokenInitiative) : undefined,
      conditions: [],
    }

    onAddToken(newToken)

    // Reset number for next token
    if (tokenNumber) {
      setTokenNumber((parseInt(tokenNumber) + 1).toString())
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Token Controls</h3>

      {/* Token Creation */}
      <div className="space-y-3">
        <h4 className="font-semibold text-purple-300">Create New Token</h4>

        {/* Token Type */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Type</label>
          <select
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value as TokenType)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="monster">Monster</option>
            <option value="player">Player</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Creature Size */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Size</label>
          <select
            value={tokenSize}
            onChange={(e) => setTokenSize(e.target.value as CreatureSize)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="tiny">Tiny (0.5x)</option>
            <option value="small">Small (1x)</option>
            <option value="medium">Medium (1x)</option>
            <option value="large">Large (2x)</option>
            <option value="huge">Huge (3x)</option>
            <option value="gargantuan">Gargantuan (4x)</option>
          </select>
        </div>

        {/* Image Source */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Image Source</label>
          <div className="flex gap-2">
            <button
              onClick={() => setImageSource('color')}
              className={`px-3 py-1 rounded ${
                imageSource === 'color'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setImageSource('url')}
              className={`px-3 py-1 rounded ${
                imageSource === 'url'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Image URL
            </button>
            <button
              onClick={() => setImageSource('player')}
              className={`px-3 py-1 rounded ${
                imageSource === 'player'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              title="Player import feature coming soon"
            >
              Player Art
            </button>
          </div>
        </div>

        {/* Color Picker (if color source) */}
        {imageSource === 'color' && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {TOKEN_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTokenColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    tokenColor === color ? 'border-white' : 'border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Image URL (if URL source) */}
        {imageSource === 'url' && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Image URL</label>
            <input
              type="text"
              value={tokenImageUrl}
              onChange={(e) => setTokenImageUrl(e.target.value)}
              placeholder="/path/to/image.jpg"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
        )}

        {/* Player Art Selection (placeholder for future feature) */}
        {imageSource === 'player' && (
          <div className="p-3 bg-gray-800 border border-gray-700 rounded">
            <p className="text-sm text-gray-400 italic">
              🚧 Player art import feature coming soon!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This will allow you to select from player character art in your campaign.
            </p>
          </div>
        )}

        {/* Number */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Number (optional)</label>
          <input
            type="number"
            value={tokenNumber}
            onChange={(e) => setTokenNumber(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Name (optional)</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Goblin Scout"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Label (optional)</label>
          <input
            type="text"
            value={tokenLabel}
            onChange={(e) => setTokenLabel(e.target.value)}
            placeholder="Boss"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>

        {/* Combat Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-300 mb-1">HP</label>
            <input
              type="number"
              value={tokenHp}
              onChange={(e) => setTokenHp(e.target.value)}
              placeholder="Current"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Max HP</label>
            <input
              type="number"
              value={tokenMaxHp}
              onChange={(e) => setTokenMaxHp(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">AC</label>
            <input
              type="number"
              value={tokenAc}
              onChange={(e) => setTokenAc(e.target.value)}
              placeholder="Armor Class"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Initiative</label>
            <input
              type="number"
              value={tokenInitiative}
              onChange={(e) => setTokenInitiative(e.target.value)}
              placeholder="Init"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateToken}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold transition"
        >
          Create Token
        </button>
      </div>

      {/* Selected Token Editor */}
      {selectedToken && (
        <div className="pt-4 border-t border-gray-700">
          <h4 className="font-semibold text-purple-300 mb-3">Edit Selected Token</h4>
          <div className="space-y-3 text-sm">
            {/* Name */}
            {selectedToken.name !== undefined && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedToken.name || ''}
                  onChange={(e) => onUpdateToken(selectedToken.id, { name: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
            )}

            {/* HP */}
            {selectedToken.maxHp !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Current HP</label>
                  <input
                    type="number"
                    value={selectedToken.currentHp || 0}
                    onChange={(e) =>
                      onUpdateToken(selectedToken.id, { currentHp: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max HP</label>
                  <input
                    type="number"
                    value={selectedToken.maxHp || 0}
                    onChange={(e) =>
                      onUpdateToken(selectedToken.id, { maxHp: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
            )}

            {/* AC and Initiative */}
            <div className="grid grid-cols-2 gap-2">
              {selectedToken.ac !== undefined && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">AC</label>
                  <input
                    type="number"
                    value={selectedToken.ac || 0}
                    onChange={(e) =>
                      onUpdateToken(selectedToken.id, { ac: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              )}
              {selectedToken.initiative !== undefined && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Initiative</label>
                  <input
                    type="number"
                    value={selectedToken.initiative || 0}
                    onChange={(e) =>
                      onUpdateToken(selectedToken.id, { initiative: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Conditions</label>
              <div className="flex flex-wrap gap-1">
                {(['prone', 'stunned', 'poisoned', 'blinded', 'invisible', 'concentrating'] as TokenCondition[]).map(
                  (condition) => {
                    const hasCondition = selectedToken.conditions?.includes(condition)
                    return (
                      <button
                        key={condition}
                        onClick={() => {
                          const currentConditions = selectedToken.conditions || []
                          const newConditions = hasCondition
                            ? currentConditions.filter((c) => c !== condition)
                            : [...currentConditions, condition]
                          onUpdateToken(selectedToken.id, { conditions: newConditions })
                        }}
                        className={`px-2 py-1 rounded text-xs transition ${
                          hasCondition
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {condition}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Quick HP adjustment */}
            {selectedToken.currentHp !== undefined && selectedToken.maxHp !== undefined && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Quick HP Adjust</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newHp = Math.max(0, (selectedToken.currentHp || 0) - 5)
                      onUpdateToken(selectedToken.id, { currentHp: newHp })
                    }}
                    className="flex-1 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => {
                      const newHp = Math.max(0, (selectedToken.currentHp || 0) - 1)
                      onUpdateToken(selectedToken.id, { currentHp: newHp })
                    }}
                    className="flex-1 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => {
                      const newHp = Math.min(
                        selectedToken.maxHp || 0,
                        (selectedToken.currentHp || 0) + 1
                      )
                      onUpdateToken(selectedToken.id, { currentHp: newHp })
                    }}
                    className="flex-1 px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => {
                      const newHp = Math.min(
                        selectedToken.maxHp || 0,
                        (selectedToken.currentHp || 0) + 5
                      )
                      onUpdateToken(selectedToken.id, { currentHp: newHp })
                    }}
                    className="flex-1 px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
                  >
                    +5
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <p className="text-gray-400 text-xs">
              Type: {selectedToken.type} | Size: {selectedToken.size}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const duplicate = {
                    ...selectedToken,
                    id: nanoid(),
                    x: selectedToken.x + gridSize,
                    y: selectedToken.y + gridSize,
                  }
                  onAddToken(duplicate)
                }}
                className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
              >
                Duplicate
              </button>
              <button
                onClick={() => onDeleteToken(selectedToken.id)}
                className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token List */}
      {tokens.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <h4 className="font-semibold text-purple-300 mb-2">All Tokens ({tokens.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="text-sm text-gray-400 flex items-center gap-2 p-2 rounded hover:bg-gray-800"
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: token.color || '#4ECDC4' }}
                />
                <span>
                  {token.label || token.number || 'Token'} ({token.type}, {token.size})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
