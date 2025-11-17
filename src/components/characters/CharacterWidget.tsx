'use client'

import { useState, useEffect } from 'react'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

interface CharacterWidgetProps {
  campaignId: string
}

export function CharacterWidget({ campaignId }: CharacterWidgetProps) {
  const [characters, setCharacters] = useState<DnDBeyondCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    loadCharacters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const loadCharacters = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters || [])
      }
    } catch (error) {
      console.error('Error loading characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters || [])
      }
    } catch (error) {
      console.error('Error syncing characters:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="text-gray-400 text-sm">Loading characters...</div>
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="text-gray-400 text-sm">
          No characters linked. Add characters in the{' '}
          <a href={`/admin/campaigns/${campaignId}`} className="text-purple-400 hover:underline">
            campaign admin
          </a>
          .
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{expanded ? '▼' : '▶'}</span>
          Party Characters ({characters.length})
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSync()
          }}
          disabled={syncing}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm
                     transition-colors duration-200"
          title="Sync all characters from D&D Beyond"
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync'}
        </button>
      </div>

      {/* Characters List */}
      {expanded && (
        <div className="border-t border-gray-800">
          {characters.map((character, index) => {
            const char = character.cachedData
            const hp = char?.currentHitPoints || 0
            const maxHp = char?.maxHitPoints || 0
            const tempHp = char?.temporaryHitPoints || 0
            const ac = char?.armorClass || 10
            const level = char?.level || 1
            const className = char?.classes
              ?.map((c: any) => `${c.name} ${c.level}`)
              .join(' / ') || 'Unknown'
            const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0
            const hpColor =
              hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'

            return (
              <div
                key={character.characterId}
                className={`p-4 hover:bg-gray-800/50 transition-colors ${
                  index !== characters.length - 1 ? 'border-b border-gray-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {char?.avatarUrl && (
                    <img
                      src={char.avatarUrl}
                      alt={character.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-gray-700"
                    />
                  )}

                  {/* Character Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white truncate">{character.name}</h4>
                      <span className="text-xs text-gray-400 ml-2">Lvl {level}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2 truncate">
                      {char?.race} - {className}
                    </div>

                    {/* HP Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">HP</span>
                        <span className="font-semibold text-white">
                          {hp} / {maxHp}
                          {tempHp > 0 && <span className="text-blue-400"> (+{tempHp})</span>}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${hpColor} transition-all duration-300`}
                          style={{ width: `${Math.min(100, hpPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">AC:</span>
                        <span className="font-semibold text-blue-400">{ac}</span>
                      </div>
                      {char?.stats && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">STR:</span>
                            <span className="font-semibold">{char.stats.strength}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">DEX:</span>
                            <span className="font-semibold">{char.stats.dexterity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">CON:</span>
                            <span className="font-semibold">{char.stats.constitution}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Conditions */}
                    {char?.conditions && char.conditions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {char.conditions.map((condition: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded"
                          >
                            {condition.name || condition}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
