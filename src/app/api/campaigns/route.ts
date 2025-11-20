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
    const { name, slug, description, synopsis, level, players, duration, genre, thumbnail, theme } = data

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

    // Save campaign metadata with access control
    const metadataPath = path.join(campaignPath, 'campaign.json')
    const metadata = {
      name,
      slug,
      description,
      level,
      players,
      duration,
      genre,
      thumbnail,
      theme,
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

export async function GET() {
  try {
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
          campaigns.push(JSON.parse(metadata))
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
