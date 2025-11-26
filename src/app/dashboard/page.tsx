'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface CampaignMetadata {
  name: string
  slug: string
  description?: string
  thumbnail?: string
  level?: string
  players?: string
  duration?: string
  genre?: string
  access?: {
    ownerId: string
    dmIds: string[]
    playerAssignments: Array<{
      userId: string
      characterIds: string[]
      assignedTokenIds: string[]
    }>
  }
  createdAt?: string
}

interface Scene {
  name: string
  slug: string
}

interface Monster {
  name: string
  cr: string
}

interface Character {
  characterId: string
  name: string
  level?: number
  class?: string
  race?: string
}

interface CampaignStats {
  campaign: CampaignMetadata
  role: string
  scenes: Scene[]
  monsters: Monster[]
  characters: Character[]
  sceneCount: number
  monsterCount: number
  characterCount: number
}

interface SRDStatus {
  lastSyncDate?: string
  ageHours?: number
  needsSync: boolean
  counts?: {
    monsters: number
    races: number
    classes: number
    spells: number
    items: number
    backgrounds: number
  }
}

export default function UnifiedDashboard() {
  const { data: session, status } = useSession()
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'all'>('overview')
  const [srdStatus, setSrdStatus] = useState<SRDStatus | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  // Load campaigns and their stats
  useEffect(() => {
    if (status !== 'authenticated') return

    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Load all campaigns
        const campaignsResponse = await fetch('/api/campaigns')
        if (!campaignsResponse.ok) {
          throw new Error('Failed to load campaigns')
        }
        const campaignsData = await campaignsResponse.json()
        const allCampaigns: CampaignMetadata[] = campaignsData.campaigns || []

        // Determine user's role and load stats for each campaign
        const userId = session?.user?.id || ''
        const isAdmin = (session?.user as any)?.isAdmin || false
        const campaignStats: CampaignStats[] = []

        for (const campaign of allCampaigns) {
          // Determine role
          let role = ''
          const access = campaign.access

          if (access?.ownerId === userId) {
            role = 'Owner'
          } else if (access?.dmIds?.includes(userId)) {
            role = 'DM'
          } else if (access?.playerAssignments?.some(p => p.userId === userId)) {
            role = 'Player'
          } else if (isAdmin) {
            role = access?.ownerId ? 'Admin' : 'Unassigned (Admin)'
          }

          // Skip campaigns where user has no role
          if (!role) continue

          // Load campaign stats
          let scenes: Scene[] = []
          let monsters: Monster[] = []
          let characters: Character[] = []

          try {
            // Load scenes
            const scenesRes = await fetch(`/api/campaigns/${campaign.slug}/scenes/list`)
            if (scenesRes.ok) {
              const scenesData = await scenesRes.json()
              scenes = scenesData.scenes || []
            }

            // Load monsters
            const monstersRes = await fetch(`/api/campaigns/${campaign.slug}/monsters/list`)
            if (monstersRes.ok) {
              const monstersData = await monstersRes.json()
              monsters = monstersData.monsters || []
            }

            // Load characters
            const charactersRes = await fetch(`/api/campaigns/${campaign.slug}/characters`)
            if (charactersRes.ok) {
              const charactersData = await charactersRes.json()
              characters = charactersData.characters || []
            }
          } catch (err) {
            console.error(`Error loading stats for ${campaign.slug}:`, err)
          }

          campaignStats.push({
            campaign,
            role,
            scenes,
            monsters,
            characters,
            sceneCount: scenes.length,
            monsterCount: monsters.length,
            characterCount: characters.length,
          })
        }

        setCampaigns(campaignStats)

        // Load SRD status
        try {
          const srdRes = await fetch('/api/srd/sync')
          if (srdRes.ok) {
            const srdData = await srdRes.json()
            setSrdStatus(srdData)
          }
        } catch (err) {
          console.error('Error loading SRD status:', err)
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [status, session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const userCampaigns = campaigns.filter(c => c.role === 'Player' || c.role === 'Owner' || c.role === 'DM')
  const ownedCampaigns = campaigns.filter(c => c.role === 'Owner' || c.role === 'DM')
  const isAdmin = (session?.user as any)?.isAdmin || false

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-purple-400">
                Welcome, {session?.user?.name}!
              </h1>
              <p className="mt-2 text-gray-400">
                Manage your campaigns, characters, and adventures
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>←</span>
              Home
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              My Campaigns
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'all'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              All Campaigns {isAdmin && `(Admin)`}
            </button>
          </div>
        </div>

        {/* SRD Status Banner */}
        {srdStatus && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-1">SRD Reference Database</h3>
                <p className="text-xs text-gray-400">
                  {srdStatus.counts ? (
                    <>
                      {srdStatus.counts.monsters} monsters, {srdStatus.counts.spells} spells, {srdStatus.counts.items} items
                      {srdStatus.lastSyncDate && (
                        <> • Last synced {srdStatus.ageHours}h ago</>
                      )}
                    </>
                  ) : (
                    'Not initialized'
                  )}
                </p>
              </div>
              <Link
                href="/admin/srd"
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Manage SRD
              </Link>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {campaigns.length}
            </div>
            <div className="text-sm text-gray-400">Active Campaigns</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {campaigns.reduce((sum, c) => sum + c.characterCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Characters</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {campaigns.reduce((sum, c) => sum + c.sceneCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Scenes</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {campaigns.reduce((sum, c) => sum + c.monsterCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Monsters</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/campaigns/new"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>➕</span>
            New Campaign
          </Link>
          {ownedCampaigns.length > 0 && (
            <>
              <Link
                href={`/admin/campaigns/${ownedCampaigns[0].campaign.slug}/scenes/new`}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <span>🎭</span>
                New Scene
              </Link>
              <Link
                href={`/admin/campaigns/${ownedCampaigns[0].campaign.slug}/monsters/new`}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <span>👹</span>
                New Monster
              </Link>
            </>
          )}
          <Link
            href="/vtt"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>🗺️</span>
            Virtual Tabletop
          </Link>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to get started</p>
              <Link
                href="/admin/campaigns/new"
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-colors duration-200"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            (activeTab === 'overview' ? userCampaigns : campaigns).map(({ campaign, role, sceneCount, monsterCount, characterCount }) => (
              <div
                key={campaign.slug}
                className="group bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-800 hover:border-purple-500 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/20"
              >
                {/* Campaign Thumbnail */}
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  {campaign.thumbnail ? (
                    <img
                      src={campaign.thumbnail}
                      alt={campaign.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-campaign.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎲
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

                  {/* Role Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        role.includes('Unassigned')
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : role === 'Owner' || role === 'DM'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                    {campaign.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {campaign.description || 'No description'}
                  </p>

                  {/* Campaign Meta */}
                  {(campaign.level || campaign.players || campaign.genre) && (
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      {campaign.level && (
                        <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                          Level {campaign.level}
                        </span>
                      )}
                      {campaign.players && (
                        <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                          {campaign.players} players
                        </span>
                      )}
                      {campaign.genre && (
                        <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                          {campaign.genre}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-lg font-bold text-green-400">{sceneCount}</div>
                      <div className="text-xs text-gray-500">Scenes</div>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-lg font-bold text-blue-400">{characterCount}</div>
                      <div className="text-xs text-gray-500">Characters</div>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-lg font-bold text-red-400">{monsterCount}</div>
                      <div className="text-xs text-gray-500">Monsters</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/campaigns/${campaign.slug}`}
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm font-semibold text-center transition-colors duration-200"
                    >
                      View
                    </Link>
                    {(role === 'Owner' || role === 'DM' || role === 'Admin' || role.includes('Unassigned')) && (
                      <Link
                        href={`/admin/campaigns/${campaign.slug}`}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-semibold text-center transition-colors duration-200"
                      >
                        Manage
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
