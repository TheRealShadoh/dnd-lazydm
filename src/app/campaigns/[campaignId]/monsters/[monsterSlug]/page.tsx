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
  Scroll,
  Shield,
  Heart,
  Footprints,
  Swords,
  Zap,
  Star,
} from 'lucide-react'

interface MonsterData {
  name: string
  slug: string
  size?: string
  type?: string
  alignment?: string
  armorClass?: string
  hitPoints?: string
  speed?: string
  abilities?: {
    str: string
    dex: string
    con: string
    int: string
    wis: string
    cha: string
  }
  challengeRating?: string
  traits?: Array<{ name: string; description: string }>
  actions?: Array<{ name: string; description: string }>
  reactions?: Array<{ name: string; description: string }>
  legendaryActions?: Array<{ name: string; description: string }>
}

export default function MonsterDetailPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const monsterSlug = params.monsterSlug as string

  const [monster, setMonster] = useState<MonsterData | null>(null)
  const [campaignName, setCampaignName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMonster() {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/monsters/${monsterSlug}`)
        if (!res.ok) {
          throw new Error('Monster not found')
        }
        const data = await res.json()
        setMonster(data.monster)
        setCampaignName(data.campaignName || campaignId)
      } catch (err) {
        console.error('Error loading monster:', err)
        setError(err instanceof Error ? err.message : 'Failed to load monster')
      } finally {
        setLoading(false)
      }
    }

    loadMonster()
  }, [campaignId, monsterSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading monster...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !monster) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container max-w-4xl mx-auto py-8 px-4">
          <Card variant="fantasy" className="text-center py-16">
            <CardContent>
              <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                Monster Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || 'This monster does not exist.'}
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
          title={monster.name}
          description={monster.size && monster.type ? `${monster.size} ${monster.type}${monster.alignment ? `, ${monster.alignment}` : ''}` : undefined}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: campaignName, href: `/campaigns/${campaignId}` },
            { label: monster.name },
          ]}
        />

        <div className="space-y-6 mt-8">
          {/* Basic Stats */}
          <Card variant="fantasy">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monster.armorClass && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Armor Class</div>
                      <div className="font-bold text-foreground">{monster.armorClass}</div>
                    </div>
                  </div>
                )}
                {monster.hitPoints && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Heart className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Hit Points</div>
                      <div className="font-bold text-foreground">{monster.hitPoints}</div>
                    </div>
                  </div>
                )}
                {monster.speed && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Footprints className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Speed</div>
                      <div className="font-bold text-foreground">{monster.speed}</div>
                    </div>
                  </div>
                )}
              </div>

              {monster.challengeRating && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Star className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Challenge Rating</div>
                    <div className="font-bold text-foreground">{monster.challengeRating}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ability Scores */}
          {monster.abilities && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle>Ability Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2 text-center">
                  {Object.entries(monster.abilities).map(([ability, score]) => (
                    <div key={ability} className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs uppercase text-muted-foreground font-bold">
                        {ability}
                      </div>
                      <div className="font-bold text-foreground">{score}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Traits */}
          {monster.traits && monster.traits.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Traits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monster.traits.map((trait, i) => (
                    <div key={i}>
                      <div className="font-bold text-foreground">{trait.name}</div>
                      <p className="text-muted-foreground">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {monster.actions && monster.actions.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-destructive" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monster.actions.map((action, i) => (
                    <div key={i}>
                      <div className="font-bold text-foreground">{action.name}</div>
                      <p className="text-muted-foreground">{action.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reactions */}
          {monster.reactions && monster.reactions.length > 0 && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle>Reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monster.reactions.map((reaction, i) => (
                    <div key={i}>
                      <div className="font-bold text-foreground">{reaction.name}</div>
                      <p className="text-muted-foreground">{reaction.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legendary Actions */}
          {monster.legendaryActions && monster.legendaryActions.length > 0 && (
            <Card variant="fantasy" className="border-warning/30 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  Legendary Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monster.legendaryActions.map((action, i) => (
                    <div key={i}>
                      <div className="font-bold text-foreground">{action.name}</div>
                      <p className="text-muted-foreground">{action.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="pt-8 border-t border-border">
            <Link href={`/campaigns/${campaignId}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
