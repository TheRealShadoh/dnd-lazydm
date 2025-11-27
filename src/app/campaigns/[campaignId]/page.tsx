'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  Loader2,
  Map,
  Users,
  Swords,
  BookOpen,
  Clock,
  Target,
  Scroll,
} from 'lucide-react'

interface CampaignMetadata {
  name: string
  slug: string
  description?: string
  synopsis?: string
  level?: string
  players?: string
  duration?: string
  genre?: string
  thumbnail?: string
  plotHooks?: string[]
  themes?: string[]
}

interface Scene {
  name: string
  slug: string
  description?: string
}

interface Monster {
  name: string
  cr: string
}

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCampaign() {
      try {
        // Load campaign metadata
        const metadataRes = await fetch(`/api/campaigns/${campaignId}/metadata`)
        if (!metadataRes.ok) {
          throw new Error('Campaign not found')
        }
        const metadata = await metadataRes.json()
        setCampaign(metadata)

        // Load scenes
        const scenesRes = await fetch(`/api/campaigns/${campaignId}/scenes/list`)
        if (scenesRes.ok) {
          const scenesData = await scenesRes.json()
          setScenes(scenesData.scenes || [])
        }

        // Load monsters
        const monstersRes = await fetch(`/api/campaigns/${campaignId}/monsters/list`)
        if (monstersRes.ok) {
          const monstersData = await monstersRes.json()
          setMonsters(monstersData.monsters || [])
        }
      } catch (err) {
        console.error('Error loading campaign:', err)
        setError(err instanceof Error ? err.message : 'Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading campaign...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container max-w-4xl mx-auto py-8 px-4">
          <Card variant="fantasy" className="text-center py-16">
            <CardContent>
              <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                Campaign Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || 'This campaign does not exist or you do not have access to it.'}
              </p>
              <Link href="/dashboard">
                <Button variant="primary">Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <PageHeader
          title={campaign.name}
          description={campaign.description}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: campaign.name },
          ]}
        />

        {/* Campaign Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
          {campaign.level && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="font-bold text-foreground">{campaign.level}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {campaign.players && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Players</div>
                    <div className="font-bold text-foreground">{campaign.players}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {campaign.duration && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Clock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-bold text-foreground">{campaign.duration}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {campaign.genre && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Genre</div>
                    <div className="font-bold text-foreground">{campaign.genre}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Synopsis */}
        {campaign.synopsis && (
          <Card variant="fantasy" className="mb-8">
            <CardHeader>
              <CardTitle>Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{campaign.synopsis}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href={`/campaigns/${campaignId}/characters`}>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Characters
            </Button>
          </Link>
          <Link href={`/admin/campaigns/${campaignId}`}>
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Manage Campaign
            </Button>
          </Link>
        </div>

        {/* Scenes */}
        {scenes.length > 0 && (
          <Card variant="fantasy" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Scenes ({scenes.length})
              </CardTitle>
              <CardDescription>Adventure locations and encounters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenes.map((scene, i) => (
                  <Link
                    key={scene.slug}
                    href={`/campaigns/${campaignId}/scenes/${scene.slug}`}
                    className="block p-4 bg-muted/50 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="font-medium text-foreground">
                      {i + 1}. {scene.name}
                    </div>
                    {scene.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {scene.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monsters */}
        {monsters.length > 0 && (
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Monsters ({monsters.length})
              </CardTitle>
              <CardDescription>Custom creatures for this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {monsters.map((monster) => (
                  <div
                    key={monster.name}
                    className="p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="font-medium text-foreground">{monster.name}</div>
                    <div className="text-sm text-muted-foreground">CR {monster.cr}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {scenes.length === 0 && monsters.length === 0 && (
          <Card variant="fantasy" className="text-center py-12">
            <CardContent>
              <Scroll className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                Campaign is empty
              </h3>
              <p className="text-muted-foreground mb-4">
                Add scenes and monsters to bring your campaign to life.
              </p>
              <Link href={`/admin/campaigns/${campaignId}`}>
                <Button variant="primary">Manage Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
