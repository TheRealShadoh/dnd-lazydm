'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

export default function CampaignCharactersPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [characters, setCharacters] = useState<DnDBeyondCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

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
        alert('All characters synced successfully!')
      } else {
        alert('Failed to sync characters')
      }
    } catch (error) {
      console.error('Error syncing characters:', error)
      alert('Failed to sync characters')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading characters...</p>
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-white mb-4">No Characters Linked</h2>
        <p className="text-gray-400 mb-6">
          Link D&D Beyond characters to view party information here.
        </p>
        <Link
          href={`/admin/campaigns/${campaignId}`}
          className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg
                     font-semibold transition-colors duration-200"
        >
          Go to Campaign Admin
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Party Characters</h1>
          <p className="text-gray-400">View and manage your party&apos;s character information</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg
                     font-semibold transition-colors duration-200"
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync All from D&D Beyond'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character) => {
          const char = character.cachedData
          const hp = char?.currentHitPoints || 0
          const maxHp = char?.maxHitPoints || 0
          const tempHp = char?.temporaryHitPoints || 0
          const ac = char?.armorClass || 10
          const level = char?.level || 1
          const race = char?.race || 'Unknown'
          const classes = char?.classes || []
          const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0
          const hpColor =
            hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'

          return (
            <div
              key={character.characterId}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500
                         transition-all duration-200"
            >
              {/* Character Header */}
              <div className="relative h-32 bg-gradient-to-br from-purple-900/30 to-gray-900">
                {char?.avatarUrl && (
                  <img
                    src={char.avatarUrl}
                    alt={character.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{character.name}</h2>
                  <p className="text-sm text-gray-300">
                    Level {level} {race}
                  </p>
                </div>
              </div>

              {/* Character Details */}
              <div className="p-6 space-y-4">
                {/* Classes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Classes</h3>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold"
                      >
                        {cls.name} {cls.level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hit Points */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400">Hit Points</h3>
                    <span className="text-lg font-bold text-white">
                      {hp} / {maxHp}
                      {tempHp > 0 && <span className="text-blue-400 text-sm ml-2">(+{tempHp})</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${hpColor} transition-all duration-300`}
                      style={{ width: `${Math.min(100, hpPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Armor Class */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-sm font-semibold text-gray-400">Armor Class</span>
                  <span className="text-2xl font-bold text-blue-400">{ac}</span>
                </div>

                {/* Ability Scores */}
                {char?.stats && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Ability Scores</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'STR', value: char.stats.strength },
                        { name: 'DEX', value: char.stats.dexterity },
                        { name: 'CON', value: char.stats.constitution },
                        { name: 'INT', value: char.stats.intelligence },
                        { name: 'WIS', value: char.stats.wisdom },
                        { name: 'CHA', value: char.stats.charisma },
                      ].map((stat) => {
                        const modifier = Math.floor((stat.value - 10) / 2)
                        return (
                          <div
                            key={stat.name}
                            className="flex flex-col items-center p-2 bg-gray-800 rounded-lg"
                          >
                            <span className="text-xs text-gray-400 mb-1">{stat.name}</span>
                            <span className="text-lg font-bold text-white">{stat.value}</span>
                            <span className="text-xs text-gray-500">
                              {modifier >= 0 ? '+' : ''}
                              {modifier}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Death Saves */}
                {char?.deathSaves &&
                  (char.deathSaves.successCount > 0 || char.deathSaves.failCount > 0) && (
                    <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-red-400 mb-2">Death Saves</h3>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Successes:</span>
                          <span className="ml-2 text-green-400 font-semibold">
                            {char.deathSaves.successCount} / 3
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Failures:</span>
                          <span className="ml-2 text-red-400 font-semibold">
                            {char.deathSaves.failCount} / 3
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Conditions */}
                {char?.conditions && char.conditions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {char.conditions.map((condition: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold"
                        >
                          {condition.name || condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-800 flex gap-2">
                  <a
                    href={`https://www.dndbeyond.com/characters/${character.characterId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-center
                               font-semibold transition-colors duration-200"
                  >
                    View on D&D Beyond
                  </a>
                </div>

                {/* Last Sync */}
                {character.lastSync && (
                  <div className="text-xs text-gray-500 text-center">
                    Last synced: {new Date(character.lastSync).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-2">Need to add more characters?</h3>
        <p className="text-gray-400 mb-4">
          You can add or manage characters from the campaign admin panel.
        </p>
        <Link
          href={`/admin/campaigns/${campaignId}`}
          className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg
                     font-semibold transition-colors duration-200"
        >
          Go to Campaign Admin
        </Link>
      </div>
    </div>
  )
}
