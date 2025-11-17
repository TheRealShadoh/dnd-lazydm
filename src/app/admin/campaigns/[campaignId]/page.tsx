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

export default function CampaignAdminPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error loading campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

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
