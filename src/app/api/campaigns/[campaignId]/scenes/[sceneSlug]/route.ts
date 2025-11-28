import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Parse MDX content to extract structured scene data
 */
function parseSceneMDX(content: string): {
  title: string
  description: string
  readAloud?: string
  objectives?: string[]
  npcs?: Array<{ name: string; role: string; notes?: string }>
  encounters?: Array<{ name: string; description: string; difficulty?: string; monsters?: Array<{ name: string; count: number }> }>
  treasures?: string[]
  secrets?: string[]
} {
  const lines = content.split('\n')
  let title = ''
  let description = ''
  let readAloud = ''
  const objectives: string[] = []
  const npcs: Array<{ name: string; role: string; notes?: string }> = []
  const encounters: Array<{ name: string; description: string; difficulty?: string; monsters?: Array<{ name: string; count: number }> }> = []
  const treasures: string[] = []
  const secrets: string[] = []

  let currentSection = 'intro'
  let currentNPC: { name: string; role: string; notes?: string } | null = null
  let currentEncounter: { name: string; description: string; difficulty?: string; monsters?: Array<{ name: string; count: number }> } | null = null
  const descriptionLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip imports
    if (trimmed.startsWith('import ')) continue

    // Title (# heading)
    if (trimmed.startsWith('# ') && !title) {
      title = trimmed.replace(/^# /, '').trim()
      continue
    }

    // Read-aloud text (blockquote)
    if (trimmed.startsWith('> ')) {
      const text = trimmed.replace(/^> \*?/, '').replace(/\*$/, '').trim()
      readAloud += (readAloud ? ' ' : '') + text
      continue
    }

    // Section headers (## heading)
    if (trimmed.startsWith('## ')) {
      // Save current NPC/encounter if any
      if (currentNPC) {
        npcs.push(currentNPC)
        currentNPC = null
      }
      if (currentEncounter) {
        encounters.push(currentEncounter)
        currentEncounter = null
      }

      const sectionName = trimmed.replace(/^## /, '').toLowerCase()
      if (sectionName.includes('objective')) currentSection = 'objectives'
      else if (sectionName.includes('npc')) currentSection = 'npcs'
      else if (sectionName.includes('encounter')) currentSection = 'encounters'
      else if (sectionName.includes('treasure')) currentSection = 'treasures'
      else if (sectionName.includes('secret') || sectionName.includes('dm')) currentSection = 'secrets'
      else currentSection = 'other'
      continue
    }

    // Sub-section headers (### heading)
    if (trimmed.startsWith('### ')) {
      const name = trimmed.replace(/^### /, '').trim()
      if (currentSection === 'npcs') {
        if (currentNPC) npcs.push(currentNPC)
        currentNPC = { name, role: '', notes: '' }
      } else if (currentSection === 'encounters') {
        if (currentEncounter) encounters.push(currentEncounter)
        currentEncounter = { name, description: '', monsters: [] }
      }
      continue
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.replace(/^[-*] /, '').trim()
      if (currentSection === 'objectives') objectives.push(item)
      else if (currentSection === 'treasures') treasures.push(item)
      else if (currentSection === 'secrets') secrets.push(item)
      else if (currentSection === 'encounters' && currentEncounter) {
        // Check for monster format: "2x Goblin"
        const monsterMatch = item.match(/^(\d+)x\s+(.+)$/i)
        if (monsterMatch) {
          if (!currentEncounter.monsters) currentEncounter.monsters = []
          currentEncounter.monsters.push({
            count: parseInt(monsterMatch[1]),
            name: monsterMatch[2].trim(),
          })
        }
      }
      continue
    }

    // Role line for NPCs
    if (currentSection === 'npcs' && currentNPC && trimmed.startsWith('**Role:**')) {
      currentNPC.role = trimmed.replace(/^\*\*Role:\*\*/, '').trim()
      continue
    }

    // Difficulty line for encounters
    if (currentSection === 'encounters' && currentEncounter && trimmed.startsWith('**Difficulty:**')) {
      currentEncounter.difficulty = trimmed.replace(/^\*\*Difficulty:\*\*/, '').trim()
      continue
    }

    // Regular content
    if (trimmed && !trimmed.startsWith('---') && !trimmed.startsWith('**Previous:**') && !trimmed.startsWith('**Next:**')) {
      if (currentSection === 'intro' && !title) continue
      if (currentSection === 'intro') {
        descriptionLines.push(trimmed)
      } else if (currentSection === 'npcs' && currentNPC) {
        currentNPC.notes = (currentNPC.notes || '') + (currentNPC.notes ? ' ' : '') + trimmed
      } else if (currentSection === 'encounters' && currentEncounter) {
        currentEncounter.description += (currentEncounter.description ? ' ' : '') + trimmed
      }
    }
  }

  // Save any remaining NPC/encounter
  if (currentNPC) npcs.push(currentNPC)
  if (currentEncounter) encounters.push(currentEncounter)

  description = descriptionLines.join('\n').trim()

  return {
    title,
    description,
    readAloud: readAloud || undefined,
    objectives: objectives.length > 0 ? objectives : undefined,
    npcs: npcs.length > 0 ? npcs : undefined,
    encounters: encounters.length > 0 ? encounters : undefined,
    treasures: treasures.length > 0 ? treasures : undefined,
    secrets: secrets.length > 0 ? secrets : undefined,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; sceneSlug: string }> }
) {
  try {
    const { campaignId, sceneSlug } = await params
    const scenePath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'scenes',
      sceneSlug,
      'page.mdx'
    )

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

    try {
      const content = await fs.readFile(scenePath, 'utf-8')
      const scene = parseSceneMDX(content)

      return NextResponse.json({
        scene,
        campaignName,
        slug: sceneSlug,
        rawContent: content,
      })
    } catch {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error loading scene:', error)
    return NextResponse.json(
      { error: 'Failed to load scene', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; sceneSlug: string }> }
) {
  try {
    const { campaignId, sceneSlug } = await params
    const data = await request.json()
    const { title, content } = data

    const scenePath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'scenes',
      sceneSlug,
      'page.mdx'
    )

    // Ensure imports are present
    let mdxContent = content
    if (!content.includes('import {')) {
      mdxContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

${content}`
    }

    // Write updated scene file
    await fs.writeFile(scenePath, mdxContent)

    return NextResponse.json({
      success: true,
      message: 'Scene updated successfully',
      slug: sceneSlug,
    })
  } catch (error) {
    console.error('Error updating scene:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update scene', details: (error as Error).message },
      { status: 500 }
    )
  }
}
