'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/campaigns/${campaignId}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Campaign
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-purple-400">Create New Scene</h1>
            <p className="text-gray-400 mt-1">Campaign: {campaignId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scene Information */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Scene Information</h2>

            <div className="space-y-4">
              {/* Scene Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Scene Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="The Dark Forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    pattern="[a-z0-9-]+"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white font-mono"
                    placeholder="the-dark-forest"
                  />
                </div>

                {/* Scene Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Scene Type
                  </label>
                  <select
                    value={sceneType}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option value="roleplay">Roleplay</option>
                    <option value="combat">Combat</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="exploration">Exploration</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Scene Content Editor */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Scene Content</h2>
              <div className="text-sm text-gray-400">
                Supports Markdown, images, tables, and dice notation
              </div>
            </div>

            <MarkdownEditor value={content} onChange={setContent} height={600} />

            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-purple-400 mb-2">💡 Tips</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Use <code className="text-purple-300">&lt;DiceNotation value=&quot;1d20&quot; /&gt;</code> for clickable dice</li>
                <li>• Use <code className="text-purple-300">&lt;ImageLightbox src=&quot;...&quot; /&gt;</code> for images with lightbox</li>
                <li>• Reference monsters: <code className="text-purple-300">[Goblin](../reference/monsters#goblin)</code></li>
                <li>• Add battle maps: <code className="text-purple-300">![Map](../img/map_name.jpg)</code></li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !title || !slug}
              className="flex-1 px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700
                       disabled:cursor-not-allowed rounded-lg font-semibold text-lg
                       transition-colors duration-200"
            >
              {loading ? 'Creating Scene...' : 'Create Scene'}
            </button>
            <Link
              href={`/admin/campaigns/${campaignId}`}
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg
                       transition-colors duration-200 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
