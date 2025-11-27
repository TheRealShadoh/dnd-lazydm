'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loader2, FileText, Lightbulb } from 'lucide-react'

export default function NewScenePage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [sceneType, setSceneType] = useState('roleplay')
  const [content, setContent] = useState(`# Scene Title

> **Scene Type:** Roleplay | Combat | Puzzle | Exploration
> **Active Mechanics:** None

## Objective

Describe the scene's objective here.

## The Scene

Write your scene content here. You can use:

- **Bold** and *italic* text
- [Links](#)
- \`code\` and code blocks
- Images: ![Alt text](path/to/image.jpg)
- Tables
- And more!

### Encounters

- **Enemy:** 3x Goblin
- **DC 15 Perception check** to notice the trap

### DM Notes

!!! tip "Remember"
    Important notes for the DM

---

**Next:** [Next Scene](/campaigns/${campaignId}/scenes/next-scene)
`)

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
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
      const response = await fetch(`/api/campaigns/${campaignId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          sceneType,
          content,
        }),
      })

      if (response.ok) {
        router.push(`/admin/campaigns/${campaignId}`)
      } else {
        toast.error('Failed to create scene')
      }
    } catch (error) {
      console.error('Error creating scene:', error)
      toast.error('Error creating scene')
    } finally {
      setLoading(false)
    }
  }

  const sceneTemplates = {
    combat: `# {title}

> **Scene Type:** Combat
> **Active Mechanics:** Initiative, Attack Rolls, Damage

## Battle Overview

Description of the combat encounter.

## The Battlefield

![Battle Map](../img/map_name.jpg)

*Click the map to enlarge for tactical positioning.*

## Enemies

- **3x Goblin** - See [Monster Reference](../reference/monsters#goblin)
- **1x Hobgoblin Captain** - See [Monster Reference](../reference/monsters#hobgoblin-captain)

## Tactics

The enemies use the following tactics:
- Goblins flank and harass
- Captain commands from the rear

### Special Conditions

- **Difficult Terrain:** The muddy ground counts as difficult terrain
- **Cover:** Rocks provide half cover

---

**Next:** [Next Scene](/campaigns/${campaignId}/scenes/next-scene)
`,
    roleplay: `# {title}

> **Scene Type:** Roleplay
> **Active Mechanics:** Persuasion, Insight, Deception

## Objective

What the players need to accomplish in this scene.

## The Scene

Narrative description of the scene and NPCs.

### NPC: Character Name

![Character Image](../img/character.jpg)

**Personality:** Describe the NPC's personality
**Goals:** What does this NPC want?
**Information:** What can players learn from this NPC?

### Dialogue Options

- **Persuasion DC 15:** Convince the NPC
- **Insight DC 12:** Detect lies
- **Intimidation DC 18:** Threaten the NPC

---

**Next:** [Next Scene](/campaigns/${campaignId}/scenes/next-scene)
`,
    puzzle: `# {title}

> **Scene Type:** Puzzle
> **Active Mechanics:** Investigation, Arcana

## The Puzzle

Description of the puzzle.

### Solution

The solution to the puzzle is...

### Hints

If players are stuck, provide these hints:
1. First hint
2. Second hint
3. Final hint

### Consequences

**Success:** What happens when they solve it
**Failure:** What happens if they fail

---

**Next:** [Next Scene](/campaigns/${campaignId}/scenes/next-scene)
`,
  }

  const handleTemplateChange = (template: string) => {
    setSceneType(template)
    const templateContent = sceneTemplates[template as keyof typeof sceneTemplates]
    if (templateContent) {
      setContent(templateContent.replace('{title}', title || 'Scene Title'))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="Create New Scene"
          description={`Campaign: ${campaignId}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'Campaign', href: `/admin/campaigns/${campaignId}` },
            { label: 'New Scene' },
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
              <CardDescription>Basic details about your scene</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scene Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Scene Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="The Dark Forest"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="the-dark-forest"
                  />
                </div>

                {/* Scene Type */}
                <div className="space-y-2">
                  <Label htmlFor="sceneType">Scene Type</Label>
                  <select
                    id="sceneType"
                    value={sceneType}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                             text-foreground font-ui"
                  >
                    <option value="roleplay">Roleplay</option>
                    <option value="combat">Combat</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="exploration">Exploration</option>
                  </select>
                </div>
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
              disabled={loading || !title || !slug}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Scene...
                </>
              ) : (
                'Create Scene'
              )}
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
