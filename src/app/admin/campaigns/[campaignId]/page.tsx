'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface CampaignMetadata {
  name: string
  slug: string
  description: string
  level?: string
  players?: string
  duration?: string
  genre?: string
  thumbnail?: string
  theme?: {
    primary: string
    secondary: string
  }
  createdAt: string
}

interface Scene {
  name: string
  slug: string
  path: string
}

interface Monster {
  name: string
  cr: string
}

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

export default function CampaignAdminPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [characters, setCharacters] = useState<DnDBeyondCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [characterIdInput, setCharacterIdInput] = useState('')
  const [campaignUrlInput, setCampaignUrlInput] = useState('')
  const [addingCharacter, setAddingCharacter] = useState(false)
  const [syncingCharacters, setSyncingCharacters] = useState(false)

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        // Load campaign metadata
        const metadataResponse = await fetch(`/api/campaigns/${campaignId}/metadata`)
        if (metadataResponse.ok) {
          const data = await metadataResponse.json()
          setCampaign(data)
        }

        // Load scenes list
        const scenesResponse = await fetch(`/api/campaigns/${campaignId}/scenes/list`)
        if (scenesResponse.ok) {
          const data = await scenesResponse.json()
          setScenes(data.scenes || [])
        }

        // Load monsters list
        const monstersResponse = await fetch(`/api/campaigns/${campaignId}/monsters/list`)
        if (monstersResponse.ok) {
          const data = await monstersResponse.json()
          setMonsters(data.monsters || [])
        }

        // Load characters list
        const charactersResponse = await fetch(`/api/campaigns/${campaignId}/characters`)
        if (charactersResponse.ok) {
          const data = await charactersResponse.json()
          setCharacters(data.characters || [])
          setCampaignUrlInput(data.campaignUrl || '')
        }
      } catch (error) {
        console.error('Error loading campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

  const handleAddCharacter = async () => {
    if (!characterIdInput.trim()) return

    setAddingCharacter(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: characterIdInput.trim(),
          campaignUrl: campaignUrlInput.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters((prev) => {
          const existing = prev.findIndex((c) => c.characterId === data.character.characterId)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = data.character
            return updated
          }
          return [...prev, data.character]
        })
        setCharacterIdInput('')
        alert(`Character "${data.character.name}" added successfully!`)
      } else {
        const error = await response.json()
        alert(`Failed to add character: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding character:', error)
      alert('Failed to add character')
    } finally {
      setAddingCharacter(false)
    }
  }

  const handleRemoveCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to remove this character?')) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/characters?characterId=${characterId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setCharacters((prev) => prev.filter((c) => c.characterId !== characterId))
      } else {
        alert('Failed to remove character')
      }
    } catch (error) {
      console.error('Error removing character:', error)
      alert('Failed to remove character')
    }
  }

  const handleSyncCharacters = async (characterId?: string) => {
    setSyncingCharacters(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters || [])
        alert(characterId ? 'Character synced successfully!' : 'All characters synced successfully!')
      } else {
        alert('Failed to sync characters')
      }
    } catch (error) {
      console.error('Error syncing characters:', error)
      alert('Failed to sync characters')
    } finally {
      setSyncingCharacters(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-400">Campaign not found</p>
          <Link
            href="/admin"
            className="mt-4 inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg
                       font-semibold transition-colors duration-200"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <Link
              href="/admin"
              className="inline-block mb-4 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-4xl font-bold text-purple-400 mb-2">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-400 text-lg">{campaign.description}</p>
            )}
            {(campaign.level || campaign.players || campaign.duration || campaign.genre) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {campaign.level && <div>📊 Level {campaign.level}</div>}
                {campaign.players && <div>👥 {campaign.players} players</div>}
                {campaign.duration && <div>⏱️ {campaign.duration}</div>}
                {campaign.genre && <div>🎭 {campaign.genre}</div>}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/campaigns/${campaignId}`}
              target="_blank"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold
                         transition-colors duration-200"
            >
              👁️ Preview
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/admin/campaigns/${campaignId}/scenes/new`}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Add Scene
            </h3>
            <p className="text-gray-400 text-sm">
              Create a new scene with combat, roleplay, or puzzle templates
            </p>
          </Link>

          <Link
            href={`/admin/campaigns/${campaignId}/monsters/new`}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">🐉</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Add Monster
            </h3>
            <p className="text-gray-400 text-sm">
              Build a new monster stat block with all D&D 5e attributes
            </p>
          </Link>

          <button
            onClick={() => alert('Image upload coming soon!')}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group text-left"
          >
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Upload Images
            </h3>
            <p className="text-gray-400 text-sm">
              Add images for scenes, monsters, and NPCs
            </p>
          </button>
        </div>

        {/* Campaign Content Sections */}
        <div className="space-y-6">
          {/* Scenes Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Scenes</h2>
              <Link
                href={`/admin/campaigns/${campaignId}/scenes/new`}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm
                           font-semibold transition-colors duration-200"
              >
                + New Scene
              </Link>
            </div>

            {scenes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenes.map((scene) => (
                  <div
                    key={scene.slug}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white">{scene.name}</div>
                      <div className="text-sm text-gray-500">{scene.slug}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/campaigns/${campaignId}/scenes/${scene.slug}/edit`}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm
                                   transition-colors duration-200"
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={scene.path}
                        target="_blank"
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded text-sm
                                   transition-colors duration-200"
                      >
                        👁️ View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📝</div>
                <p>No scenes yet. Create your first scene to get started.</p>
              </div>
            )}
          </div>

          {/* Monsters Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Monster Stat Blocks
                {monsters.length > 0 && (
                  <span className="ml-3 text-lg text-gray-400">({monsters.length})</span>
                )}
              </h2>
              <Link
                href={`/admin/campaigns/${campaignId}/monsters/new`}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm
                           font-semibold transition-colors duration-200"
              >
                + New Monster
              </Link>
            </div>

            {monsters.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {monsters.map((monster, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐉</span>
                        <div>
                          <div className="font-semibold text-white">{monster.name}</div>
                          <div className="text-sm text-gray-500">CR {monster.cr}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3">
                  <Link
                    href={`/campaigns/${campaignId}/reference/monsters`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600
                               rounded-lg text-sm transition-colors duration-200"
                  >
                    👁️ View Full Reference Page
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🐉</div>
                <p>No monsters yet. Create your first monster stat block to get started.</p>
              </div>
            )}
          </div>

          {/* D&D Beyond Characters Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                D&D Beyond Characters
                {characters.length > 0 && (
                  <span className="ml-3 text-lg text-gray-400">({characters.length})</span>
                )}
              </h2>
              {characters.length > 0 && (
                <button
                  onClick={() => handleSyncCharacters()}
                  disabled={syncingCharacters}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                             rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  {syncingCharacters ? '🔄 Syncing...' : '🔄 Sync All'}
                </button>
              )}
            </div>

            {/* Add Character Form */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Link D&D Beyond Character</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    D&D Beyond Campaign URL (optional)
                  </label>
                  <input
                    type="text"
                    value={campaignUrlInput}
                    onChange={(e) => setCampaignUrlInput(e.target.value)}
                    placeholder="https://www.dndbeyond.com/campaigns/12345"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded
                               text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Paste your D&D Beyond campaign URL for reference
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Character ID (required)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={characterIdInput}
                      onChange={(e) => setCharacterIdInput(e.target.value)}
                      placeholder="48690485"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded
                                 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddCharacter()
                      }}
                    />
                    <button
                      onClick={handleAddCharacter}
                      disabled={addingCharacter || !characterIdInput.trim()}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600
                                 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap"
                    >
                      {addingCharacter ? 'Adding...' : '+ Add Character'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Find the character ID in the URL: dndbeyond.com/characters/
                    <strong className="text-purple-400">12345678</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Characters List */}
            {characters.length > 0 ? (
              <div className="space-y-3">
                {characters.map((character) => {
                  const char = character.cachedData
                  const hp = char?.currentHitPoints || 0
                  const maxHp = char?.maxHitPoints || 0
                  const ac = char?.armorClass || 10
                  const level = char?.level || 1
                  const className = char?.classes
                    ?.map((c: any) => `${c.name} ${c.level}`)
                    .join(' / ') || 'Unknown'

                  return (
                    <div
                      key={character.characterId}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {char?.avatarUrl && (
                            <img
                              src={char.avatarUrl}
                              alt={character.name}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{character.name}</h3>
                              <span className="text-sm text-gray-400">Lvl {level}</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                              {char?.race} - {className}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">HP:</span>
                                <span className="font-semibold text-red-400">
                                  {hp} / {maxHp}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">AC:</span>
                                <span className="font-semibold text-blue-400">{ac}</span>
                              </div>
                            </div>
                            {character.lastSync && (
                              <div className="text-xs text-gray-500 mt-2">
                                Last synced: {new Date(character.lastSync).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSyncCharacters(character.characterId)}
                            disabled={syncingCharacters}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                                       rounded text-sm transition-colors duration-200"
                            title="Sync this character"
                          >
                            🔄
                          </button>
                          <a
                            href={`https://www.dndbeyond.com/characters/${character.characterId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded text-sm
                                       transition-colors duration-200"
                          >
                            👁️ View
                          </a>
                          <button
                            onClick={() => handleRemoveCharacter(character.characterId)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm
                                       transition-colors duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">👥</div>
                <p>No characters linked yet. Add a D&D Beyond character to get started.</p>
              </div>
            )}
          </div>

          {/* Theme Section */}
          {campaign.theme && (
            <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Campaign Theme</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Primary Color</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-700"
                      style={{ backgroundColor: campaign.theme.primary }}
                    />
                    <span className="font-mono text-gray-300">{campaign.theme.primary}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Secondary Color</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-700"
                      style={{ backgroundColor: campaign.theme.secondary }}
                    />
                    <span className="font-mono text-gray-300">{campaign.theme.secondary}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Info */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Campaign Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Slug:</span>
                <span className="font-mono text-gray-300">{campaign.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-300">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Path:</span>
                <span className="font-mono text-gray-300 text-xs">
                  src/app/campaigns/{campaign.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
