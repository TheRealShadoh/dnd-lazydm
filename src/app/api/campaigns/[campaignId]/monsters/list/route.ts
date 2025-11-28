import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const monstersPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'reference',
      'monsters',
      'page.mdx'
    )

    try {
      const content = await fs.readFile(monstersPath, 'utf-8')

      // Parse monsters from the content
      // Look for ## headings that are monster names (excluding the main title)
      const lines = content.split('\n')
      const monsters: Array<{ name: string; slug: string; cr: string }> = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // Match monster headings (## Monster Name (CR X) or ## Monster Name)
        if (line.startsWith('## ') && !line.includes('# Monster Stat Blocks')) {
          const monsterLine = line.replace(/^## /, '').trim()

          // Extract CR if present
          const crMatch = monsterLine.match(/\(CR\s+([^)]+)\)/)
          const cr = crMatch ? crMatch[1] : 'N/A'

          // Extract name (everything before the CR or the whole line)
          const name = crMatch
            ? monsterLine.substring(0, monsterLine.indexOf('(CR')).trim()
            : monsterLine

          monsters.push({ name, slug: slugify(name), cr })
        }
      }

      return NextResponse.json({
        monsters,
        count: monsters.length
      })
    } catch {
      // Monsters file doesn't exist
      return NextResponse.json({ monsters: [], count: 0 })
    }
  } catch (error) {
    console.error('Error listing monsters:', error)
    return NextResponse.json(
      { error: 'Failed to list monsters', details: (error as Error).message },
      { status: 500 }
    )
  }
}
