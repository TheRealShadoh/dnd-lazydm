import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const data = await request.json()
    const {
      name,
      size,
      type,
      alignment,
      cr,
      ac,
      acType,
      hp,
      hitDice,
      speed,
      abilityScores,
      saves,
      skills,
      resistances,
      immunities,
      senses,
      languages,
      traits,
      actions,
      imageUrl,
    } = data

    // Extract ability scores
    const { str, dex, con, int, wis, cha } = abilityScores

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Helper function to calculate ability modifier
    const calculateModifier = (score: number) => {
      const mod = Math.floor((score - 10) / 2)
      return mod >= 0 ? `+${mod}` : `${mod}`
    }

    // Generate monster stat block MDX content
    let monsterContent = `\n\n## ${name}\n\n`

    // Add image if provided
    if (imageUrl) {
      monsterContent += `<ImageLightbox src="${imageUrl}" alt="${name}" />\n\n`
    }

    // Basic info line
    monsterContent += `*${size} ${type}, ${alignment}*\n\n`

    // Divider
    monsterContent += `---\n\n`

    // Combat stats
    monsterContent += `**Armor Class** ${ac}${acType ? ` (${acType})` : ''}\n\n`
    monsterContent += `**Hit Points** ${hp}${hitDice ? ` (<DiceNotation value="${hitDice}" />)` : ''}\n\n`
    monsterContent += `**Speed** ${speed}\n\n`

    // Divider
    monsterContent += `---\n\n`

    // Ability scores table
    monsterContent += `| STR | DEX | CON | INT | WIS | CHA |\n`
    monsterContent += `|-----|-----|-----|-----|-----|-----|\n`
    monsterContent += `| ${str} (${calculateModifier(parseInt(str))}) | ${dex} (${calculateModifier(parseInt(dex))}) | ${con} (${calculateModifier(parseInt(con))}) | ${int} (${calculateModifier(parseInt(int))}) | ${wis} (${calculateModifier(parseInt(wis))}) | ${cha} (${calculateModifier(parseInt(cha))}) |\n\n`

    // Divider
    monsterContent += `---\n\n`

    // Optional stats
    if (saves) {
      monsterContent += `**Saving Throws** ${saves}\n\n`
    }
    if (skills) {
      monsterContent += `**Skills** ${skills}\n\n`
    }
    if (resistances) {
      monsterContent += `**Damage Resistances** ${resistances}\n\n`
    }
    if (immunities) {
      monsterContent += `**Damage Immunities** ${immunities}\n\n`
    }
    if (senses) {
      monsterContent += `**Senses** ${senses}\n\n`
    }
    if (languages) {
      monsterContent += `**Languages** ${languages}\n\n`
    }

    monsterContent += `**Challenge** ${cr}\n\n`

    // Divider
    monsterContent += `---\n\n`

    // Traits
    if (traits && traits.length > 0) {
      traits.forEach((trait: { name: string; description: string }) => {
        monsterContent += `***${trait.name}.*** ${trait.description}\n\n`
      })
      monsterContent += `---\n\n`
    }

    // Actions
    if (actions && actions.length > 0) {
      monsterContent += `### Actions\n\n`
      actions.forEach((action: { name: string; description: string }) => {
        monsterContent += `***${action.name}.*** ${action.description}\n\n`
      })
    }

    // Read existing monsters page
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

    let existingContent = ''
    try {
      existingContent = await fs.readFile(monstersPath, 'utf-8')
    } catch {
      // File doesn't exist, create with imports
      existingContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# Monster Stat Blocks

`
    }

    // Append new monster to the file
    const updatedContent = existingContent + monsterContent

    // Write updated content
    await fs.writeFile(monstersPath, updatedContent)

    return NextResponse.json({
      success: true,
      message: 'Monster created successfully',
      slug,
    })
  } catch (error) {
    console.error('Error creating monster:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create monster', details: (error as Error).message },
      { status: 500 }
    )
  }
}
