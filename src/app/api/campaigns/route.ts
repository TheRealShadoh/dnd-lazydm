import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/lib/auth/auth-options'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, slug, description, synopsis, level, players, duration, genre, thumbnail, theme, scenes, customMonsters, majorNPCs, plotHooks } = data

    // Create campaign directory structure
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', slug)
    const publicPath = path.join(process.cwd(), 'public', 'campaigns', slug, 'img')

    // Create directories
    await fs.mkdir(campaignPath, { recursive: true })
    await fs.mkdir(path.join(campaignPath, 'scenes'), { recursive: true })
    await fs.mkdir(path.join(campaignPath, 'reference'), { recursive: true })
    await fs.mkdir(publicPath, { recursive: true })

    // Create campaign homepage (page.mdx)
    const campaignPageContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# ${name}

${synopsis || ''}

## Campaign Details

- **Level:** ${level || 'TBD'}
- **Players:** ${players || 'TBD'}
- **Duration:** ${duration || 'TBD'}
- **Genre:** ${genre || 'TBD'}

---

**Next:** [Scene 1](scenes/scene-01)
`

    await fs.writeFile(path.join(campaignPath, 'page.mdx'), campaignPageContent)

    // Create layout.tsx with theme colors
    const layoutContent = `'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { title: 'Campaign Home', href: '/campaigns/${slug}' },
  { title: 'Characters', href: '/campaigns/${slug}/characters' },
  { title: 'Scenes', href: '/campaigns/${slug}/scenes' },
  { title: 'Monsters', href: '/campaigns/${slug}/reference/monsters' },
  { title: 'Reference', href: '/campaigns/${slug}/reference' },
]

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 sticky top-0 h-screen overflow-y-auto bg-gray-900/50">
        <div className="p-6" style={{ borderLeftColor: '${theme?.primary || '#ab47bc'}' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '${theme?.primary || '#ab47bc'}' }}>
            ${name}
          </h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={\`block px-3 py-2 rounded-lg transition-colors duration-200 \${
                    isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }\`}
                  style={isActive ? { color: '${theme?.primary || '#ab47bc'}' } : {}}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-8 prose prose-invert prose-purple max-w-none">
          {children}
        </div>
      </main>
    </div>
  )
}
`

    await fs.writeFile(path.join(campaignPath, 'layout.tsx'), layoutContent)

    // Create reference/monsters/page.mdx
    const monstersPageContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# Monster Stat Blocks

Add your monster stat blocks here.

---

[Return to Campaign Home](/campaigns/${slug})
`

    const monstersPath = path.join(campaignPath, 'reference', 'monsters')
    await fs.mkdir(monstersPath, { recursive: true })
    await fs.writeFile(path.join(monstersPath, 'page.mdx'), monstersPageContent)

    // Create scene files if provided
    const scenesPath = path.join(campaignPath, 'scenes')
    const scenesList: Array<{ name: string; slug: string; description?: string }> = []

    if (scenes && Array.isArray(scenes)) {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i]
        const sceneSlug = scene.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `scene-${i + 1}`

        const scenePath = path.join(scenesPath, sceneSlug)
        await fs.mkdir(scenePath, { recursive: true })

        // Build scene MDX content
        let sceneContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# ${scene.title}

`
        if (scene.readAloud) {
          sceneContent += `> *${scene.readAloud.replace(/\n/g, '*\n> *')}*

`
        }

        sceneContent += `${scene.description || ''}

`
        // Add objectives if present
        const objectives = Array.isArray(scene.objectives) ? scene.objectives : []
        if (objectives.length > 0) {
          sceneContent += `## Objectives

${objectives.map((obj: string) => `- ${obj}`).join('\n')}

`
        }

        // Add NPCs if present
        const npcs = Array.isArray(scene.npcs) ? scene.npcs : []
        if (npcs.length > 0) {
          sceneContent += `## NPCs

${npcs.map((npc: { name: string; role: string; notes?: string }) =>
  `### ${npc.name}
**Role:** ${npc.role}
${npc.notes ? `\n${npc.notes}` : ''}`
).join('\n\n')}

`
        }

        // Add encounters if present
        const encounters = Array.isArray(scene.encounters) ? scene.encounters : []
        if (encounters.length > 0) {
          sceneContent += `## Encounters

${encounters.map((enc: { name: string; description: string; difficulty?: string; monsters?: Array<{ name: string; count: number }> }) => {
  let encText = `### ${enc.name}
${enc.difficulty ? `**Difficulty:** ${enc.difficulty}` : ''}

${enc.description}
`
  const monsters = Array.isArray(enc.monsters) ? enc.monsters : []
  if (monsters.length > 0) {
    encText += `\n**Monsters:**\n${monsters.map((m: { name: string; count: number }) => `- ${m.count}x ${m.name}`).join('\n')}\n`
  }
  return encText
}).join('\n')}

`
        }

        // Add treasures if present
        const treasures = Array.isArray(scene.treasures) ? scene.treasures : []
        if (treasures.length > 0) {
          sceneContent += `## Treasure

${treasures.map((t: string) => `- ${t}`).join('\n')}

`
        }

        // Add secrets if present
        const secrets = Array.isArray(scene.secrets) ? scene.secrets : []
        if (secrets.length > 0) {
          sceneContent += `## DM Secrets

${secrets.map((s: string) => `- ${s}`).join('\n')}

`
        }

        // Navigation
        sceneContent += `---

`
        if (i > 0) {
          const prevScene = scenes[i - 1]
          const prevSlug = prevScene.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `scene-${i}`
          sceneContent += `**Previous:** [${prevScene.title}](../${prevSlug})
`
        } else {
          sceneContent += `**Previous:** [Campaign Home](/campaigns/${slug})
`
        }

        if (i < scenes.length - 1) {
          const nextScene = scenes[i + 1]
          const nextSlug = nextScene.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `scene-${i + 2}`
          sceneContent += `**Next:** [${nextScene.title}](../${nextSlug})
`
        }

        await fs.writeFile(path.join(scenePath, 'page.mdx'), sceneContent)
        scenesList.push({
          name: scene.title,
          slug: sceneSlug,
          description: scene.description,
        })
      }
    }

    // Update monsters page with custom monsters if provided
    if (customMonsters && Array.isArray(customMonsters) && customMonsters.length > 0) {
      let monstersContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# Monster Stat Blocks

`
      for (const monster of customMonsters) {
        // Format abilities
        const abilities = monster.abilities || {}
        const formatMod = (score: number) => {
          const mod = Math.floor((score - 10) / 2)
          return mod >= 0 ? `+${mod}` : `${mod}`
        }

        monstersContent += `## ${monster.name}
*${monster.size || 'Medium'} ${monster.type || 'creature'}, ${monster.alignment || 'unaligned'}*

---

**Armor Class** ${monster.armorClass || 10}${monster.armorType ? ` (${monster.armorType})` : ''}

**Hit Points** ${monster.hitPoints || 10} (${monster.hitDice || '2d8'})

**Speed** ${typeof monster.speed === 'string' ? monster.speed : '30 ft.'}

---

| STR | DEX | CON | INT | WIS | CHA |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ${abilities.str || 10} (${formatMod(abilities.str || 10)}) | ${abilities.dex || 10} (${formatMod(abilities.dex || 10)}) | ${abilities.con || 10} (${formatMod(abilities.con || 10)}) | ${abilities.int || 10} (${formatMod(abilities.int || 10)}) | ${abilities.wis || 10} (${formatMod(abilities.wis || 10)}) | ${abilities.cha || 10} (${formatMod(abilities.cha || 10)}) |

---

**Challenge** ${monster.challengeRating || 1}

`
        // Add traits
        const traits = Array.isArray(monster.traits) ? monster.traits : []
        if (traits.length > 0) {
          monstersContent += `### Traits

${traits.map((t: { name: string; description: string }) => `***${t.name}.*** ${t.description}`).join('\n\n')}

`
        }

        // Add actions
        const actions = Array.isArray(monster.actions) ? monster.actions : []
        if (actions.length > 0) {
          monstersContent += `### Actions

${actions.map((a: { name: string; description: string }) => `***${a.name}.*** ${a.description}`).join('\n\n')}

`
        }

        monstersContent += `---

`
      }

      monstersContent += `[Return to Campaign Home](/campaigns/${slug})
`

      await fs.writeFile(path.join(monstersPath, 'page.mdx'), monstersContent)
    }

    // Save campaign metadata with access control
    const metadataPath = path.join(campaignPath, 'campaign.json')
    const metadata = {
      name,
      slug,
      description,
      synopsis,
      level,
      players,
      duration,
      genre,
      thumbnail,
      theme,
      plotHooks: Array.isArray(plotHooks) ? plotHooks : [],
      scenes: scenesList,
      majorNPCs: Array.isArray(majorNPCs) ? majorNPCs : [],
      createdAt: new Date().toISOString(),
      access: {
        ownerId: session.user.id,
        dmIds: [],
        playerAssignments: [],
      },
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({ success: true, slug, message: 'Campaign created successfully' })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignSlug = searchParams.get('slug')
    const confirmation = searchParams.get('confirmation')

    if (!campaignSlug) {
      return NextResponse.json({ error: 'Campaign slug is required' }, { status: 400 })
    }

    // Require typing "DELETE" as confirmation
    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Confirmation required. Please type DELETE to confirm.' }, { status: 400 })
    }

    const userId = session.user.id || ''
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin || false

    // Check campaign exists and user has permission
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignSlug)
    const metadataPath = path.join(campaignPath, 'campaign.json')

    try {
      const metadata = await fs.readFile(metadataPath, 'utf-8')
      const campaign = JSON.parse(metadata)

      // Only owner or admin can delete
      if (!isAdmin && campaign.access?.ownerId !== userId) {
        return NextResponse.json({ error: 'Only the campaign owner or admin can delete this campaign' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Delete campaign directory recursively
    await fs.rm(campaignPath, { recursive: true, force: true })

    // Also delete public assets if they exist
    const publicPath = path.join(process.cwd(), 'public', 'campaigns', campaignSlug)
    try {
      await fs.rm(publicPath, { recursive: true, force: true })
    } catch {
      // Public folder may not exist, that's ok
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get the current session for access control
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ campaigns: [] })
    }

    const userId = session.user.id || ''
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin || false

    // List all campaigns
    const campaignsPath = path.join(process.cwd(), 'src', 'app', 'campaigns')

    try {
      await fs.access(campaignsPath)
    } catch {
      return NextResponse.json({ campaigns: [] })
    }

    const entries = await fs.readdir(campaignsPath, { withFileTypes: true })
    const campaigns = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = path.join(campaignsPath, entry.name, 'campaign.json')
        try {
          const metadata = await fs.readFile(metadataPath, 'utf-8')
          const campaign = JSON.parse(metadata)

          // Check if user has access to this campaign
          const access = campaign.access
          const hasAccess =
            isAdmin ||
            (userId && access?.ownerId && access.ownerId === userId) ||
            (userId && access?.dmIds?.includes(userId)) ||
            (userId && access?.playerAssignments?.some((p: { userId: string }) => p.userId === userId))

          if (hasAccess) {
            campaigns.push(campaign)
          }
        } catch {
          // Skip directories without campaign.json
          continue
        }
      }
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list campaigns' },
      { status: 500 }
    )
  }
}
