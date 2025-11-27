'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loader2, ScrollText, Palette } from 'lucide-react'

export default function NewCampaignPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [level, setLevel] = useState('')
  const [players, setPlayers] = useState('')
  const [duration, setDuration] = useState('')
  const [genre, setGenre] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  // Theme colors
  const [primaryColor, setPrimaryColor] = useState('#ab47bc')
  const [secondaryColor, setSecondaryColor] = useState('#7b1fa2')

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          synopsis,
          level,
          players,
          duration,
          genre,
          thumbnail,
          theme: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Campaign created successfully!')
        router.push(`/admin/campaigns/${data.slug}`)
      } else {
        toast.error('Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Error creating campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <PageHeader
          title="Create New Campaign"
          description="Set up your campaign details and theme"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'New Campaign' },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          {/* Basic Information */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Core details about your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="The Court of Thorns and Mire"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  className="font-mono"
                  placeholder="court-of-thorns-mire"
                />
                <p className="text-sm text-muted-foreground">
                  URL: /campaigns/{slug || 'your-campaign-slug'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A romantasy one-shot adventure"
                />
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level Range</Label>
                  <Input
                    id="level"
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="players">Players</Label>
                  <Input
                    id="players"
                    type="text"
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    placeholder="1-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="One-shot (3-4 hours)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Romantasy"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                <Input
                  id="thumbnail"
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="/campaigns/your-campaign/img/thumbnail.jpg"
                />
                {thumbnail && (
                  <div className="mt-2">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-48 h-32 object-cover rounded-lg border-2 border-border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Synopsis */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle>Campaign Synopsis</CardTitle>
              <CardDescription>
                Write a detailed synopsis of your campaign (supports Markdown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={synopsis}
                onChange={setSynopsis}
                height={300}
                placeholder="## Campaign Overview&#10;&#10;Write your campaign synopsis here..."
              />
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Theme Customization
              </CardTitle>
              <CardDescription>
                Choose colors for your campaign&apos;s visual theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-12 rounded-lg border-2 border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                  <div
                    className="h-8 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-12 rounded-lg border-2 border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                  <div
                    className="h-8 rounded-lg"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !name || !slug}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push('/admin')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
