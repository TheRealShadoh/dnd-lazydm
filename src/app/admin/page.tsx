'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Campaign {
  slug: string
  name: string
  description: string
  thumbnail: string
  level?: string
  players?: string
  duration?: string
  genre?: string
}

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        console.log('[Campaign Manager] Fetching campaigns from /api/campaigns')
        const response = await fetch('/api/campaigns')
        console.log('[Campaign Manager] Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('[Campaign Manager] Campaigns loaded:', data.campaigns?.length || 0)
          console.log('[Campaign Manager] Campaign data:', data.campaigns)
          setCampaigns(data.campaigns || [])
        } else {
          const errorText = await response.text()
          console.error('[Campaign Manager] Failed to load campaigns:', errorText)
          setError(`Failed to load campaigns: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error('[Campaign Manager] Error loading campaigns:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold
                           transition-colors duration-200 flex items-center gap-2"
              >
                <span>←</span>
                Back
              </Link>
              <h1 className="text-4xl font-bold text-purple-400">Campaign Manager</h1>
            </div>
            <p className="text-gray-400">Create and manage your D&D campaigns</p>
          </div>
          <Link
            href="/admin/campaigns/new"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold
                       transition-colors duration-200 flex items-center gap-2"
          >
            <span>➕</span>
            New Campaign
          </Link>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-400">Loading campaigns...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Campaigns</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold
                           transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          ) : campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <Link
                key={campaign.slug}
                href={`/admin/campaigns/${campaign.slug}`}
                className="group bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-800
                           hover:border-purple-500 transition-all duration-200 hover:shadow-xl
                           hover:shadow-purple-500/20"
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
                </div>

                {/* Campaign Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {campaign.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{campaign.description}</p>

                  {/* Campaign Details */}
                  {(campaign.level || campaign.players || campaign.genre) && (
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      {campaign.level && <div>Level: {campaign.level}</div>}
                      {campaign.players && <div>Players: {campaign.players}</div>}
                      {campaign.genre && <div>Genre: {campaign.genre}</div>}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/admin/campaigns/${campaign.slug}/scenes/new`
                      }}
                      className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm
                                 transition-colors duration-200"
                    >
                      Add Scene
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/admin/campaigns/${campaign.slug}/monsters/new`
                      }}
                      className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm
                                 transition-colors duration-200"
                    >
                      Add Monster
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            /* Empty State */
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to get started</p>
              <Link
                href="/admin/campaigns/new"
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg
                           font-semibold transition-colors duration-200"
              >
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
