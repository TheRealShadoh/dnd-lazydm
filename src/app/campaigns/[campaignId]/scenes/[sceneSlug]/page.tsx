'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Scroll,
  Target,
  Users,
  Swords,
  Gift,
  Eye,
} from 'lucide-react'

interface SceneData {
  title: string
  description: string
  readAloud?: string
  objectives?: string[]
  npcs?: Array<{ name: string; role: string; notes?: string }>
  encounters?: Array<{
    name: string
    description: string
    difficulty?: string
    monsters?: Array<{ name: string; count: number }>
  }>
  treasures?: string[]
  secrets?: string[]
}

interface SceneNav {
  prev?: { slug: string; name: string }
  next?: { slug: string; name: string }
}

export default function ScenePage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const sceneSlug = params.sceneSlug as string

  const [scene, setScene] = useState<SceneData | null>(null)
  const [campaignName, setCampaignName] = useState<string>('')
  const [nav, setNav] = useState<SceneNav>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadScene() {
      try {
        // Load scene data
        const sceneRes = await fetch(`/api/campaigns/${campaignId}/scenes/${sceneSlug}`)
        if (!sceneRes.ok) {
          throw new Error('Scene not found')
        }
        const sceneData = await sceneRes.json()
        setScene(sceneData.scene)
        setCampaignName(sceneData.campaignName || campaignId)

        // Load scenes list for navigation
        const scenesRes = await fetch(`/api/campaigns/${campaignId}/scenes/list`)
        if (scenesRes.ok) {
          const scenesData = await scenesRes.json()
          const scenes = scenesData.scenes || []
          const currentIndex = scenes.findIndex((s: { slug: string }) => s.slug === sceneSlug)

          setNav({
            prev: currentIndex > 0 ? scenes[currentIndex - 1] : undefined,
            next: currentIndex < scenes.length - 1 ? scenes[currentIndex + 1] : undefined,
          })
        }
      } catch (err) {
        console.error('Error loading scene:', err)
        setError(err instanceof Error ? err.message : 'Failed to load scene')
      } finally {
        setLoading(false)
      }
    }

    loadScene()
  }, [campaignId, sceneSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading scene...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !scene) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container max-w-4xl mx-auto py-8 px-4">
          <Card variant="fantasy" className="text-center py-16">
            <CardContent>
              <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                Scene Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || 'This scene does not exist.'}
              </p>
              <Link href={`/campaigns/${campaignId}`}>
                <Button variant="primary">Return to Campaign</Button>
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
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <PageHeader
          title={scene.title}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: campaignName, href: `/campaigns/${campaignId}` },
            { label: scene.title },
          ]}
        />

        <div className="space-y-8 mt-8">
          {/* Read Aloud Box */}
          {scene.readAloud && (
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6">
                <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-4">
                  {scene.readAloud}
                </blockquote>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card variant="fantasy">
            <CardContent className="pt-6">
              <p className="text-muted-foreground whitespace-pre-wrap">{scene.description}</p>
            </CardContent>
          </Card>

          {/* Objectives */}
          {scene.objectives && scene.objectives.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scene.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* NPCs */}
          {scene.npcs && scene.npcs.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  NPCs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scene.npcs.map((npc, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-bold text-foreground">{npc.name}</div>
                      <div className="text-sm text-primary">{npc.role}</div>
                      {npc.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{npc.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Encounters */}
          {scene.encounters && scene.encounters.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-destructive" />
                  Encounters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scene.encounters.map((enc, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-foreground">{enc.name}</div>
                        {enc.difficulty && (
                          <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive">
                            {enc.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{enc.description}</p>
                      {enc.monsters && enc.monsters.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-sm font-medium text-foreground mb-1">Monsters:</div>
                          <ul className="text-sm text-muted-foreground">
                            {enc.monsters.map((m, j) => (
                              <li key={j}>• {m.count}x {m.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Treasures */}
          {scene.treasures && scene.treasures.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-warning" />
                  Treasure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scene.treasures.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-warning">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* DM Secrets */}
          {scene.secrets && scene.secrets.length > 0 && (
            <Card variant="fantasy" className="border-warning/30 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-warning" />
                  DM Secrets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scene.secrets.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-warning">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            {nav.prev ? (
              <Link href={`/campaigns/${campaignId}/scenes/${nav.prev.slug}`}>
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {nav.prev.name}
                </Button>
              </Link>
            ) : (
              <Link href={`/campaigns/${campaignId}`}>
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Campaign Home
                </Button>
              </Link>
            )}

            {nav.next ? (
              <Link href={`/campaigns/${campaignId}/scenes/${nav.next.slug}`}>
                <Button variant="outline">
                  {nav.next.name}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href={`/campaigns/${campaignId}`}>
                <Button variant="outline">
                  Campaign Home
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
