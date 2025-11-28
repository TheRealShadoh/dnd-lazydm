import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface ParsedMonster {
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
  rawContent: string
}

function parseMonsterFromMDX(content: string, targetSlug: string): ParsedMonster | null {
  const lines = content.split('\n')
  let inTargetMonster = false
  let currentMonster: ParsedMonster | null = null
  let monsterLines: string[] = []
  let currentSection = 'header'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Monster heading starts with ## (not the main title)
    if (trimmed.startsWith('## ') && !trimmed.includes('Monster Stat Blocks')) {
      // If we were building a monster, check if it's our target
      if (currentMonster) {
        if (slugify(currentMonster.name) === targetSlug) {
          currentMonster.rawContent = monsterLines.join('\n')
          return currentMonster
        }
      }

      // Start new monster
      const monsterLine = trimmed.replace(/^## /, '').trim()
      const crMatch = monsterLine.match(/\(CR\s+([^)]+)\)/)
      const name = crMatch
        ? monsterLine.substring(0, monsterLine.indexOf('(CR')).trim()
        : monsterLine

      currentMonster = {
        name,
        slug: slugify(name),
        rawContent: '',
      }
      monsterLines = [line]
      currentSection = 'header'
      inTargetMonster = slugify(name) === targetSlug
      continue
    }

    if (!currentMonster) continue
    monsterLines.push(line)

    // Parse size/type/alignment line (e.g., "*Large monstrosity, chaotic evil*")
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('***')) {
      const typeInfo = trimmed.slice(1, -1)
      const parts = typeInfo.split(',')
      if (parts.length >= 1) {
        const sizeType = parts[0].trim().split(' ')
        currentMonster.size = sizeType[0]
        currentMonster.type = sizeType.slice(1).join(' ')
      }
      if (parts.length >= 2) {
        currentMonster.alignment = parts.slice(1).join(',').trim()
      }
      continue
    }

    // Parse AC
    if (trimmed.startsWith('**Armor Class**')) {
      currentMonster.armorClass = trimmed.replace('**Armor Class**', '').trim()
      continue
    }

    // Parse HP
    if (trimmed.startsWith('**Hit Points**')) {
      currentMonster.hitPoints = trimmed.replace('**Hit Points**', '').trim()
      continue
    }

    // Parse Speed
    if (trimmed.startsWith('**Speed**')) {
      currentMonster.speed = trimmed.replace('**Speed**', '').trim()
      continue
    }

    // Parse Challenge Rating
    if (trimmed.startsWith('**Challenge**')) {
      currentMonster.challengeRating = trimmed.replace('**Challenge**', '').trim()
      continue
    }

    // Parse ability scores from table row
    if (trimmed.startsWith('|') && trimmed.includes('+') || trimmed.includes('-')) {
      const cells = trimmed.split('|').filter(c => c.trim())
      if (cells.length === 6) {
        currentMonster.abilities = {
          str: cells[0].trim(),
          dex: cells[1].trim(),
          con: cells[2].trim(),
          int: cells[3].trim(),
          wis: cells[4].trim(),
          cha: cells[5].trim(),
        }
      }
      continue
    }

    // Section headers
    if (trimmed === '### Traits') {
      currentSection = 'traits'
      currentMonster.traits = currentMonster.traits || []
      continue
    }
    if (trimmed === '### Actions') {
      currentSection = 'actions'
      currentMonster.actions = currentMonster.actions || []
      continue
    }
    if (trimmed === '### Reactions') {
      currentSection = 'reactions'
      currentMonster.reactions = currentMonster.reactions || []
      continue
    }
    if (trimmed === '### Legendary Actions') {
      currentSection = 'legendaryActions'
      currentMonster.legendaryActions = currentMonster.legendaryActions || []
      continue
    }

    // Parse trait/action entries (***Name.*** Description)
    if (trimmed.startsWith('***') && trimmed.includes('.***')) {
      const match = trimmed.match(/^\*\*\*(.+?)\.\*\*\*\s*(.*)$/)
      if (match) {
        const entry = { name: match[1], description: match[2] }
        if (currentSection === 'traits' && currentMonster.traits) {
          currentMonster.traits.push(entry)
        } else if (currentSection === 'actions' && currentMonster.actions) {
          currentMonster.actions.push(entry)
        } else if (currentSection === 'reactions' && currentMonster.reactions) {
          currentMonster.reactions.push(entry)
        } else if (currentSection === 'legendaryActions' && currentMonster.legendaryActions) {
          currentMonster.legendaryActions.push(entry)
        }
      }
    }
  }

  // Check the last monster
  if (currentMonster && slugify(currentMonster.name) === targetSlug) {
    currentMonster.rawContent = monsterLines.join('\n')
    return currentMonster
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; monsterSlug: string }> }
) {
  try {
    const { campaignId, monsterSlug } = await params
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
      const monster = parseMonsterFromMDX(content, monsterSlug)

      if (!monster) {
        return NextResponse.json(
          { error: 'Monster not found' },
          { status: 404 }
        )
      }

      // Get campaign name
      let campaignName = campaignId
      try {
        const metadataPath = path.join(
          process.cwd(),
          'src',
          'app',
          'campaigns',
          campaignId,
          'campaign.json'
        )
        const metadata = await fs.readFile(metadataPath, 'utf-8')
        const campaign = JSON.parse(metadata)
        campaignName = campaign.name || campaignId
      } catch {
        // Use campaignId as fallback
      }

      return NextResponse.json({
        monster,
        campaignName,
      })
    } catch {
      return NextResponse.json(
        { error: 'Monsters not found for this campaign' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error loading monster:', error)
    return NextResponse.json(
      { error: 'Failed to load monster', details: (error as Error).message },
      { status: 500 }
    )
  }
}
