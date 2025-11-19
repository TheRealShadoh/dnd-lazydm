'use client'

import { useState, useEffect } from 'react'
import { Token, TokenType, CreatureSize, TOKEN_COLORS, TokenCondition } from '@/types/vtt'
import { nanoid } from 'nanoid'

interface CampaignImage {
  url: string
  campaign: string
  name: string
}

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
  const [imageSource, setImageSource] = useState<'color' | 'url' | 'campaign' | 'player'>('color')
  const [campaignImages, setCampaignImages] = useState<CampaignImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [hasLoadedImages, setHasLoadedImages] = useState(false)
  const [tokenHp, setTokenHp] = useState('')
  const [tokenMaxHp, setTokenMaxHp] = useState('')
  const [tokenAc, setTokenAc] = useState('')
  const [tokenInitiative, setTokenInitiative] = useState('')

  const selectedToken = tokens.find((t) => t.id === selectedTokenId)

  // Load campaign images when campaign source is selected
  useEffect(() => {
    if (imageSource === 'campaign' && !hasLoadedImages) {
      setLoadingImages(true)
      fetch('/api/campaigns/images')
        .then((res) => res.json())
        .then((data) => {
          setCampaignImages(data.images || [])
          setHasLoadedImages(true)
        })
        .catch((error) => {
          console.error('Failed to load campaign images:', error)
          setHasLoadedImages(true)
        })
        .finally(() => {
          setLoadingImages(false)
        })
    }
  }, [imageSource, hasLoadedImages])

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
      imageUrl: imageSource === 'url' || imageSource === 'campaign' ? tokenImageUrl : undefined,
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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setImageSource('color')}
              className={`px-3 py-2 rounded text-sm ${
                imageSource === 'color'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setImageSource('url')}
              className={`px-3 py-2 rounded text-sm ${
                imageSource === 'url'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              URL
            </button>
            <button
              onClick={() => setImageSource('campaign')}
              className={`px-3 py-2 rounded text-sm ${
                imageSource === 'campaign'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Campaign Images
            </button>
            <button
              onClick={() => setImageSource('player')}
              className={`px-3 py-2 rounded text-sm ${
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

        {/* Campaign Images Browser */}
        {imageSource === 'campaign' && (
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Select Campaign Image {tokenImageUrl && '✓'}
            </label>
            {loadingImages ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                Loading images...
              </div>
            ) : campaignImages.length > 0 ? (
              <div className="max-h-64 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-2">
                <div className="grid grid-cols-3 gap-2">
                  {campaignImages.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => setTokenImageUrl(img.url)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                        tokenImageUrl === img.url
                          ? 'border-purple-500 ring-2 ring-purple-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      title={`${img.name}\n(${img.campaign})`}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40"%3E?%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      {tokenImageUrl === img.url && (
                        <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                          <span className="text-white text-2xl">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {campaignImages.length} image{campaignImages.length !== 1 ? 's' : ''} available
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded text-center">
                <p className="text-sm text-gray-400">No campaign images found</p>
                <p className="text-xs text-gray-500 mt-1">
                  Add images to /public/campaigns/[campaign-name]/img/
                </p>
              </div>
            )}
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
            {/* Image Editor */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Token Image</label>

              {/* Current Image Preview */}
              {selectedToken.imageUrl && (
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={selectedToken.imageUrl}
                    alt="Current token"
                    className="w-12 h-12 rounded-full border-2 border-gray-600 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23374151" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3E?%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <span className="text-xs text-gray-400 flex-1 truncate">
                    {selectedToken.imageUrl}
                  </span>
                </div>
              )}

              {/* Image Source Selector */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                <button
                  onClick={() => {
                    // Remove image, use color instead
                    onUpdateToken(selectedToken.id, {
                      imageUrl: undefined,
                      color: selectedToken.color || TOKEN_COLORS[0]
                    })
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  Use Color
                </button>
                <button
                  onClick={() => {
                    const url = prompt('Enter image URL:', selectedToken.imageUrl || '')
                    if (url !== null) {
                      onUpdateToken(selectedToken.id, {
                        imageUrl: url || undefined,
                        color: undefined
                      })
                    }
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  URL
                </button>
                <button
                  onClick={() => {
                    // Toggle campaign images view
                    const currentSource = (selectedToken as any)._editingImage
                    onUpdateToken(selectedToken.id, {
                      _editingImage: currentSource === 'campaign' ? undefined : 'campaign'
                    } as any)
                  }}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                >
                  Campaign
                </button>
              </div>

              {/* Campaign Images Selector for Selected Token */}
              {(selectedToken as any)._editingImage === 'campaign' && (
                <div className="bg-gray-800 border border-gray-700 rounded p-2">
                  {loadingImages && campaignImages.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      Loading...
                    </div>
                  ) : campaignImages.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-1">
                        {campaignImages.map((img) => (
                          <button
                            key={img.url}
                            onClick={() => {
                              onUpdateToken(selectedToken.id, {
                                imageUrl: img.url,
                                color: undefined,
                                _editingImage: undefined
                              } as any)
                            }}
                            className={`relative aspect-square rounded overflow-hidden border ${
                              selectedToken.imageUrl === img.url
                                ? 'border-purple-500'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                            title={img.name}
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">
                      No campaign images found
                    </p>
                  )}
                </div>
              )}
            </div>

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
