'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sword, Dice6, Image as ImageIcon, Save, Smartphone, Loader2, ScrollText, LayoutDashboard } from 'lucide-react'
import { MainNav } from '@/components/layout/MainNav'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CampaignMetadata {
  name: string
  slug: string
  description?: string
  thumbnail?: string
  level?: string
  players?: string
  duration?: string
  genre?: string
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<CampaignMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data.campaigns || [])
        }
      } catch (error) {
        console.error('Error loading campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-3xl rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sword className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 animate-glow-pulse opacity-40 blur-lg">
                  <Sword className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              LazyDM Campaign Dashboard
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-body">
              Your ultimate companion for running D&D campaigns. Manage scenes, track monsters, and bring your adventures to life.
            </p>

            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/vtt">
                <Button variant="secondary" size="lg">
                  Virtual Tabletop
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-display mb-4">Available Campaigns</h2>
              <p className="text-muted-foreground">Select a campaign to begin your adventure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full flex justify-center py-16">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="col-span-full">
                  <Card variant="fantasy" className="text-center py-16">
                    <CardContent>
                      <ScrollText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold font-display text-foreground mb-2">No campaigns available</h3>
                      <p className="text-muted-foreground mb-6">Check back later or contact your DM</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <Link key={campaign.slug} href={`/campaigns/${campaign.slug}`}>
                    <Card
                      variant="fantasy"
                      className="group h-full overflow-hidden hover:shadow-fantasy-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                        {campaign.thumbnail ? (
                          <Image
                            src={campaign.thumbnail}
                            alt={campaign.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ScrollText className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                        <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                          {campaign.name}
                        </h3>
                      </div>

                      <CardContent className="p-6">
                        <p className="text-primary font-semibold mb-3 line-clamp-2">
                          {campaign.description || 'A D&D Adventure'}
                        </p>

                        <div className="flex gap-2 text-xs flex-wrap">
                          {campaign.level && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                              Level {campaign.level}
                            </span>
                          )}
                          {campaign.genre && (
                            <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                              {campaign.genre}
                            </span>
                          )}
                          {campaign.duration && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                              {campaign.duration}
                            </span>
                          )}
                          {campaign.players && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                              {campaign.players} players
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-display mb-4">Interactive Features</h2>
              <p className="text-muted-foreground">Everything you need to run amazing sessions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dice6 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold font-display mb-2">Auto-Detecting Dice Roller</h3>
                  <p className="text-sm text-muted-foreground">
                    Click any dice notation (1d20, 2d6+3, etc.) to roll instantly
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold font-display mb-2">Image Lightbox</h3>
                  <p className="text-sm text-muted-foreground">
                    Click any image to view in full-screen with zoom
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Save className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold font-display mb-2">State Persistence</h3>
                  <p className="text-sm text-muted-foreground">
                    Dice history, preferences, and progress saved locally
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold font-display mb-2">Mobile Responsive</h3>
                  <p className="text-sm text-muted-foreground">
                    Run sessions from tablets or phones seamlessly
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sword className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-primary">LazyDM</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built with Next.js, React, and TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}
