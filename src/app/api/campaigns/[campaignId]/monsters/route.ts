import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/lib/auth/auth-options'
import * as storage from '@/lib/srd/storage'
import { SRDMonsterSchema } from '@/lib/srd/schemas'
import type { SRDMonster } from '@/lib/srd/models'

// Helper function to calculate ability modifier
function calculateModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Helper to format speed - handles both string and object formats
function formatSpeed(speed: string | Record<string, number> | undefined): string {
  if (!speed) return '30 ft.'
  if (typeof speed === 'string') return speed

  // Handle object format like {walk: 30, swim: 40, fly: 60}
  const parts: string[] = []
  if ('walk' in speed) parts.push(`${speed.walk} ft.`)
  if ('swim' in speed) parts.push(`swim ${speed.swim} ft.`)
  if ('fly' in speed) parts.push(`fly ${speed.fly} ft.`)
  if ('burrow' in speed) parts.push(`burrow ${speed.burrow} ft.`)
  if ('climb' in speed) parts.push(`climb ${speed.climb} ft.`)

  return parts.length > 0 ? parts.join(', ') : '30 ft.'
}

// Generate MDX content from monster data
function generateMonsterMDX(
  name: string,
  size: string | undefined,
  type: string | undefined,
  alignment: string | undefined,
  cr: number,
  ac: number,
  acType: string | undefined,
  hp: number,
  hitDice: string | undefined,
  speed: string,
  str: number,
  dex: number,
  con: number,
  int: number,
  wis: number,
  cha: number,
  saves: string | undefined,
  skills: string | undefined,
  resistances: string | undefined,
  immunities: string | undefined,
  senses: string | undefined,
  languages: string | undefined,
  traits: Array<{ name: string; description: string }> | undefined,
  actions: Array<{ name: string; description: string }> | undefined,
  imageUrl: string | undefined
): string {
  let content = `\n\n## ${name}\n\n`

  if (imageUrl) {
    content += `<ImageLightbox src="${imageUrl}" alt="${name}" />\n\n`
  }

  if (size && type && alignment) {
    content += `*${size} ${type}, ${alignment}*\n\n`
  }

  content += `---\n\n`

  content += `**Armor Class** ${ac}${acType ? ` (${acType})` : ''}\n\n`
  content += `**Hit Points** ${hp}${hitDice ? ` (<DiceNotation value="${hitDice}" />)` : ''}\n\n`
  content += `**Speed** ${speed}\n\n`

  content += `---\n\n`

  content += `| STR | DEX | CON | INT | WIS | CHA |\n`
  content += `|-----|-----|-----|-----|-----|-----|\n`
  content += `| ${str} (${calculateModifier(str)}) | ${dex} (${calculateModifier(dex)}) | ${con} (${calculateModifier(con)}) | ${int} (${calculateModifier(int)}) | ${wis} (${calculateModifier(wis)}) | ${cha} (${calculateModifier(cha)}) |\n\n`

  content += `---\n\n`

  if (saves) content += `**Saving Throws** ${saves}\n\n`
  if (skills) content += `**Skills** ${skills}\n\n`
  if (resistances) content += `**Damage Resistances** ${resistances}\n\n`
  if (immunities) content += `**Damage Immunities** ${immunities}\n\n`
  if (senses) content += `**Senses** ${senses}\n\n`
  if (languages) content += `**Languages** ${languages}\n\n`

  content += `**Challenge** ${cr}\n\n`

  content += `---\n\n`

  if (traits && traits.length > 0) {
    traits.forEach((trait: { name: string; description: string }) => {
      content += `***${trait.name}.*** ${trait.description}\n\n`
    })
    content += `---\n\n`
  }

  if (actions && actions.length > 0) {
    content += `### Actions\n\n`
    actions.forEach((action: { name: string; description: string }) => {
      content += `***${action.name}.*** ${action.description}\n\n`
    })
  }

  return content
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      fromSRD, // If true, use SRD monster instead of creating new
      srdMonsterName, // Name of SRD monster to use
    } = data

    let srdMonsterData: SRDMonster | null = null

    // If pulling from SRD, look up the monster
    if (fromSRD && srdMonsterName) {
      const results = storage.searchEntries<SRDMonster>('monsters', srdMonsterName)
      const official = results.official.find((m) => m.name.toLowerCase() === srdMonsterName.toLowerCase())
      const custom = results.custom.find((m) => m.name.toLowerCase() === srdMonsterName.toLowerCase())
      srdMonsterData = official ?? custom ?? null

      if (!srdMonsterData) {
        return NextResponse.json(
          { error: `Monster '${srdMonsterName}' not found in SRD` },
          { status: 404 }
        )
      }
    } else {
      // Create new custom monster in SRD
      const { str, dex, con, int, wis, cha } = abilityScores

      const newMonster = {
        name,
        source: 'custom' as const,
        ac,
        hp,
        speed,
        abilities: { strength: str, dexterity: dex, constitution: con, intelligence: int, wisdom: wis, charisma: cha },
        challengeRating: parseFloat(cr),
        size,
        type,
        alignment,
        imageUrl,
        traits,
        actions,
        savingThrows: saves
          ? Object.fromEntries(
              saves.split(',').map((s: string) => {
                const [abil, val] = s.trim().split(/\s+/)
                return [abil.toLowerCase(), parseInt(val)]
              })
            )
          : undefined,
        skills: skills
          ? Object.fromEntries(
              skills.split(',').map((s: string) => {
                const [skill, val] = s.trim().split(/\s+/)
                return [skill.toLowerCase(), parseInt(val)]
              })
            )
          : undefined,
        damageResistances: resistances ? resistances.split(',').map((s: string) => s.trim()) : undefined,
        damageImmunities: immunities ? immunities.split(',').map((s: string) => s.trim()) : undefined,
      }

      const validation = SRDMonsterSchema.safeParse(newMonster)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid monster data', details: validation.error.errors },
          { status: 400 }
        )
      }

      storage.addCustomEntry('monsters', validation.data)
      srdMonsterData = validation.data as SRDMonster
    }

    // Ensure srdMonsterData is not null
    if (!srdMonsterData) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve monster' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = srdMonsterData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate MDX content
    const mdxContent = generateMonsterMDX(
      srdMonsterData.name,
      srdMonsterData.size,
      srdMonsterData.type,
      srdMonsterData.alignment,
      srdMonsterData.challengeRating,
      srdMonsterData.ac,
      undefined, // acType from SRD might not be available
      srdMonsterData.hp,
      undefined, // hitDice not in SRD model
      formatSpeed(srdMonsterData.speed),
      srdMonsterData.abilities.strength,
      srdMonsterData.abilities.dexterity,
      srdMonsterData.abilities.constitution,
      srdMonsterData.abilities.intelligence,
      srdMonsterData.abilities.wisdom,
      srdMonsterData.abilities.charisma,
      undefined, // Convert savingThrows object to string
      undefined, // Convert skills object to string
      srdMonsterData.damageResistances?.join(', '),
      srdMonsterData.damageImmunities?.join(', '),
      srdMonsterData.senses?.join(', '),
      srdMonsterData.languages?.join(', '),
      srdMonsterData.traits,
      srdMonsterData.actions,
      srdMonsterData.imageUrl
    )

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
      existingContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

# Monster Stat Blocks

`
    }

    const updatedContent = existingContent + mdxContent
    await fs.writeFile(monstersPath, updatedContent)

    return NextResponse.json({
      success: true,
      message: 'Monster added successfully',
      slug,
      monsterId: srdMonsterData.id,
    })
  } catch (error) {
    console.error('Error creating monster:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create monster', details: (error as Error).message },
      { status: 500 }
    )
  }
}
