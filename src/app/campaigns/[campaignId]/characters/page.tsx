'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, Users, RefreshCw, ExternalLink, Heart, Shield, Skull, AlertTriangle } from 'lucide-react'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

export default function CampaignCharactersPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const toast = useToast()
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
        toast.success('All characters synced successfully!')
      } else {
        toast.error('Failed to sync characters')
      }
    } catch (error) {
      console.error('Error syncing characters:', error)
      toast.error('Failed to sync characters')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading characters...</p>
          </div>
        </div>
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container max-w-6xl mx-auto py-8 px-4">
          <PageHeader
            title="Party Characters"
            description="View and manage your party's character information"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Campaign', href: `/campaigns/${campaignId}` },
              { label: 'Characters' },
            ]}
          />
          <Card variant="fantasy" className="text-center py-16 mt-8">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-4">No Characters Linked</h2>
              <p className="text-muted-foreground mb-6">
                Link D&D Beyond characters to view party information here.
              </p>
              <Button variant="primary" asChild>
                <Link href={`/admin/campaigns/${campaignId}`}>
                  Go to Campaign Admin
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-6xl mx-auto py-8 px-4">
        <PageHeader
          title="Party Characters"
          description="View and manage your party's character information"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Campaign', href: `/campaigns/${campaignId}` },
            { label: 'Characters' },
          ]}
          actions={
            <Button
              variant="primary"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All from D&D Beyond
                </>
              )}
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
              hpPercentage > 50 ? 'bg-success' : hpPercentage > 25 ? 'bg-warning' : 'bg-destructive'

            return (
              <Card
                key={character.characterId}
                variant="fantasy"
                className="overflow-hidden hover:border-primary/50 transition-all duration-200"
              >
                {/* Character Header */}
                <div className="relative h-32 bg-gradient-to-br from-primary/30 to-card">
                  {char?.avatarUrl && (
                    <img
                      src={char.avatarUrl}
                      alt={character.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold font-display text-foreground mb-1">{character.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Level {level} {race}
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Classes */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Classes</h3>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-semibold"
                        >
                          {cls.name} {cls.level}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hit Points */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Hit Points
                      </h3>
                      <span className="text-lg font-bold text-foreground">
                        {hp} / {maxHp}
                        {tempHp > 0 && <span className="text-info text-sm ml-2">(+{tempHp})</span>}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${hpColor} transition-all duration-300`}
                        style={{ width: `${Math.min(100, hpPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Armor Class */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Armor Class
                    </span>
                    <span className="text-2xl font-bold text-info">{ac}</span>
                  </div>

                  {/* Ability Scores */}
                  {char?.stats && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Ability Scores</h3>
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
                              className="flex flex-col items-center p-2 bg-muted/50 rounded-lg border border-border"
                            >
                              <span className="text-xs text-muted-foreground mb-1">{stat.name}</span>
                              <span className="text-lg font-bold text-foreground">{stat.value}</span>
                              <span className="text-xs text-primary font-mono">
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
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1">
                          <Skull className="h-4 w-4" />
                          Death Saves
                        </h3>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Successes:</span>
                            <span className="ml-2 text-success font-semibold">
                              {char.deathSaves.successCount} / 3
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Failures:</span>
                            <span className="ml-2 text-destructive font-semibold">
                              {char.deathSaves.failCount} / 3
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Conditions */}
                  {char?.conditions && char.conditions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Active Conditions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {char.conditions.map((condition: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-destructive/20 text-destructive rounded-lg text-sm font-semibold"
                          >
                            {condition.name || condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-border">
                    <Button variant="primary" className="w-full" asChild>
                      <a
                        href={`https://www.dndbeyond.com/characters/${character.characterId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on D&D Beyond
                      </a>
                    </Button>
                  </div>

                  {/* Last Sync */}
                  {character.lastSync && (
                    <div className="text-xs text-muted-foreground text-center">
                      Last synced: {new Date(character.lastSync).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card variant="fantasy" className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold font-display text-foreground mb-2">Need to add more characters?</h3>
            <p className="text-muted-foreground mb-4">
              You can add or manage characters from the campaign admin panel.
            </p>
            <Button variant="primary" asChild>
              <Link href={`/admin/campaigns/${campaignId}`}>
                Go to Campaign Admin
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
