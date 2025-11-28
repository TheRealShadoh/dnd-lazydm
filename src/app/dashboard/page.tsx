'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2,
  Plus,
  Map,
  Users,
  Swords,
  ScrollText,
  RefreshCw,
  Crown,
  Shield,
  User,
  Sparkles
} from 'lucide-react'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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


function getRoleIcon(role: string) {
  if (role === 'Owner') return <Crown className="h-3 w-3" />
  if (role === 'DM') return <Shield className="h-3 w-3" />
  return <User className="h-3 w-3" />
}

function getRoleColor(role: string) {
  if (role.includes('Unassigned')) return 'bg-warning/20 text-warning border-warning/30'
  if (role === 'Owner' || role === 'DM') return 'bg-primary/20 text-primary border-primary/30'
  return 'bg-secondary/20 text-secondary border-secondary/30'
}

export default function UnifiedDashboard() {
  const { data: session, status } = useSession()
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'all'>('overview')

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
        const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin || false
        const campaignStats: CampaignStats[] = []

        for (const campaign of allCampaigns) {
          // Determine role
          let role = ''
          const access = campaign.access

          // Only match if userId is non-empty to prevent empty string matching empty ownerId
          if (userId && access?.ownerId && access.ownerId === userId) {
            role = 'Owner'
          } else if (userId && access?.dmIds?.includes(userId)) {
            role = 'DM'
          } else if (userId && access?.playerAssignments?.some(p => p.userId === userId)) {
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
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading your adventures...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Card variant="fantasy" className="max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} variant="primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const userCampaigns = campaigns.filter(c => c.role === 'Player' || c.role === 'Owner' || c.role === 'DM')
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin || false

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title={`Welcome, ${session?.user?.name}!`}
          description="Manage your campaigns, characters, and adventures"
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-6 py-3 font-semibold transition-colors border-b-2 font-ui',
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            My Campaigns
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-6 py-3 font-semibold transition-colors border-b-2 font-ui',
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            All Campaigns {isAdmin && '(Admin)'}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ScrollText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-primary">
                    {activeTab === 'overview' ? userCampaigns.length : campaigns.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Campaigns</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-secondary">
                    {campaigns.reduce((sum, c) => sum + c.characterCount, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Characters</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Map className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-success">
                    {campaigns.reduce((sum, c) => sum + c.sceneCount, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Scenes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Swords className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-destructive">
                    {campaigns.reduce((sum, c) => sum + c.monsterCount, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Monsters</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/admin/campaigns/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
          <Link href="/admin/campaigns/generate">
            <Button variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
          </Link>
          <Link href="/vtt">
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Virtual Tabletop
            </Button>
          </Link>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-full">
              <Card variant="fantasy" className="text-center py-16">
                <CardContent>
                  <ScrollText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold font-display text-foreground mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first campaign to get started</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/admin/campaigns/new">
                      <Button variant="primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </Link>
                    <Link href="/admin/campaigns/generate">
                      <Button variant="secondary">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Generate
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            (activeTab === 'overview' ? userCampaigns : campaigns).map(({ campaign, role, sceneCount, monsterCount, characterCount }) => (
              <Card
                key={campaign.slug}
                variant="fantasy"
                className="group overflow-hidden hover:shadow-fantasy-lg transition-all duration-300"
              >
                {/* Campaign Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {campaign.thumbnail ? (
                    <Image
                      src={campaign.thumbnail}
                      alt={campaign.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-campaign.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ScrollText className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Role Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full border',
                        getRoleColor(role)
                      )}
                    >
                      {getRoleIcon(role)}
                      {role}
                    </span>
                  </div>
                </div>

                {/* Campaign Info */}
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {campaign.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {campaign.description || 'No description'}
                  </p>

                  {/* Campaign Meta */}
                  {(campaign.level || campaign.players || campaign.genre) && (
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      {campaign.level && (
                        <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                          Level {campaign.level}
                        </span>
                      )}
                      {campaign.players && (
                        <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                          {campaign.players} players
                        </span>
                      )}
                      {campaign.genre && (
                        <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                          {campaign.genre}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold font-display text-success">{sceneCount}</div>
                      <div className="text-xs text-muted-foreground">Scenes</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold font-display text-secondary">{characterCount}</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold font-display text-destructive">{monsterCount}</div>
                      <div className="text-xs text-muted-foreground">Monsters</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/campaigns/${campaign.slug}`}>
                      <Button variant="primary" className="w-full" size="sm">
                        View
                      </Button>
                    </Link>
                    {(role === 'Owner' || role === 'DM' || role === 'Admin' || role.includes('Unassigned')) && (
                      <Link href={`/admin/campaigns/${campaign.slug}`}>
                        <Button variant="outline" className="w-full" size="sm">
                          Manage
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
