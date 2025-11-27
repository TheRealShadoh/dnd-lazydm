'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loader2, FileText, Lightbulb, Eye, AlertCircle } from 'lucide-react'

export default function EditScenePage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const sceneSlug = params.sceneSlug as string
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const loadScene = async () => {
      try {
        // Fetch the scene content
        const response = await fetch(`/api/campaigns/${campaignId}/scenes/${sceneSlug}`)
        if (response.ok) {
          const data = await response.json()
          setTitle(data.title)
          setContent(data.content)
        } else {
          toast.error('Failed to load scene')
        }
      } catch (error) {
        console.error('Error loading scene:', error)
        toast.error('Error loading scene')
      } finally {
        setLoading(false)
      }
    }

    loadScene()
  }, [campaignId, sceneSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/scenes/${sceneSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (response.ok) {
        router.push(`/admin/campaigns/${campaignId}`)
      } else {
        toast.error('Failed to update scene')
      }
    } catch (error) {
      console.error('Error updating scene:', error)
      toast.error('Error updating scene')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading scene...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="Edit Scene"
          description={`Campaign: ${campaignId} / Scene: ${sceneSlug}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'Campaign', href: `/admin/campaigns/${campaignId}` },
            { label: 'Edit Scene' },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* Scene Information */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Scene Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scene Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Scene Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="The Dark Forest"
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> The scene slug ({sceneSlug}) cannot be changed when editing.
                  To change the URL, create a new scene.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scene Content Editor */}
          <Card variant="fantasy">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle>Scene Content</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Supports Markdown, images, tables, and dice notation
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MarkdownEditor value={content} onChange={setContent} height={600} />

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Tips
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use <code className="text-primary bg-primary/10 px-1 rounded">&lt;DiceNotation value=&quot;1d20&quot; /&gt;</code> for clickable dice</li>
                  <li>• Use <code className="text-primary bg-primary/10 px-1 rounded">&lt;ImageLightbox src=&quot;...&quot; /&gt;</code> for images with lightbox</li>
                  <li>• Reference monsters: <code className="text-primary bg-primary/10 px-1 rounded">[Goblin](../reference/monsters#goblin)</code></li>
                  <li>• Add battle maps: <code className="text-primary bg-primary/10 px-1 rounded">![Map](../img/map_name.jpg)</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={saving || !title}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => window.open(`/campaigns/${campaignId}/scenes/${sceneSlug}`, '_blank')}
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
