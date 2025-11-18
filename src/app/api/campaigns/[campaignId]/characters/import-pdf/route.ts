import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { DndCharacterParser, CharacterSheet } from '@/lib/dnd-character-parser'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  avatarUrl?: string
  cachedData: any
  lastSync: string
}

/**
 * Convert parsed character sheet to campaign character format
 */
function convertToCampaignFormat(parsed: CharacterSheet): any {
  // Helper to convert skill name to camelCase
  const skillNameMap: Record<string, string> = {
    'Acrobatics': 'acrobatics',
    'Animal Handling': 'animalHandling',
    'Arcana': 'arcana',
    'Athletics': 'athletics',
    'Deception': 'deception',
    'History': 'history',
    'Insight': 'insight',
    'Intimidation': 'intimidation',
    'Investigation': 'investigation',
    'Medicine': 'medicine',
    'Nature': 'nature',
    'Perception': 'perception',
    'Performance': 'performance',
    'Persuasion': 'persuasion',
    'Religion': 'religion',
    'Sleight of Hand': 'sleightOfHand',
    'Stealth': 'stealth',
    'Survival': 'survival',
  }

  // Build skills object
  const skills: Record<string, number> = {}
  parsed.skills.forEach((skill) => {
    const key = skillNameMap[skill.name]
    if (key) {
      skills[key] = skill.modifier
    }
  })

  // Build saving throws object
  const savingThrows: Record<string, number> = {}
  parsed.savingThrows.forEach((save) => {
    savingThrows[save.ability] = save.modifier
  })

  return {
    id: `pdf-${Date.now()}`,
    name: parsed.characterName,
    level: parsed.level,
    race: parsed.race,
    background: parsed.background,
    alignment: parsed.alignment || '',
    experiencePoints: parsed.experiencePoints,
    playerName: parsed.playerName,

    // Ability scores
    stats: {
      strength: parsed.abilities.strength.score,
      dexterity: parsed.abilities.dexterity.score,
      constitution: parsed.abilities.constitution.score,
      intelligence: parsed.abilities.intelligence.score,
      wisdom: parsed.abilities.wisdom.score,
      charisma: parsed.abilities.charisma.score,
    },

    modifiers: {
      strength: parsed.abilities.strength.modifier,
      dexterity: parsed.abilities.dexterity.modifier,
      constitution: parsed.abilities.constitution.modifier,
      intelligence: parsed.abilities.intelligence.modifier,
      wisdom: parsed.abilities.wisdom.modifier,
      charisma: parsed.abilities.charisma.modifier,
    },

    // Combat stats
    armorClass: parsed.armorClass,
    initiative: parsed.initiative,
    speed: parsed.speed,
    maxHitPoints: parsed.hitPoints.max,
    currentHitPoints: parsed.hitPoints.current,
    temporaryHitPoints: parsed.hitPoints.temp,
    hitDice: parsed.hitDice,
    hitDiceRemaining: parsed.hitDice,

    // Saves and skills
    proficiencyBonus: parsed.proficiencyBonus,
    savingThrows,
    skills,
    passivePerception: parsed.passivePerception,
    inspiration: parsed.inspiration,

    // Equipment and languages
    languages: parsed.languages.join(', '),
    equipment: parsed.equipment.map((e) => e.name).join(', '),

    // Currency
    cp: parsed.copper,
    sp: parsed.silver,
    ep: parsed.electrum,
    gp: parsed.gold,
    pp: parsed.platinum,

    // Features and personality
    featuresAndTraits: parsed.features.map((f) => `${f.name}: ${f.description}`).join('\n\n'),
    personalityTraits: parsed.personalityTraits,
    ideals: parsed.ideals,
    bonds: parsed.bonds,
    flaws: parsed.flaws,

    // Physical description
    age: parsed.age || '',
    height: parsed.height || '',
    weight: parsed.weight || '',
    eyes: parsed.eyes || '',
    skin: parsed.skin || '',
    hair: parsed.hair || '',

    // Additional
    backstory: parsed.backstory,
    alliesAndOrganizations: parsed.alliesAndOrganizations,
    treasure: parsed.treasure,

    // Spellcasting
    spellcastingClass: parsed.spellcastingClass || '',
    spellcastingAbility: parsed.spellcastingAbility || '',
    spellSaveDC: parsed.spellSaveDC,
    spellAttackBonus: parsed.spellAttackBonus,

    // Death saves
    deathSaves: {
      successCount: 0,
      failCount: 0,
    },

    // Classes
    classes: [{ name: parsed.class, level: parsed.level }],

    // Weapons
    attacks: parsed.weaponAttacks
      .map((w) => `${w.name}: ${w.hitBonus >= 0 ? '+' : ''}${w.hitBonus} to hit, ${w.damage} ${w.damageType}`)
      .join('\n'),
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params

    // Handle file upload
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'PDF file is required' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdfBytes = new Uint8Array(arrayBuffer)

    console.log(`Parsing PDF "${file.name}", size: ${pdfBytes.length} bytes`)

    // Parse character sheet using comprehensive parser
    const parsedCharacter = await DndCharacterParser.parseCharacterSheet(pdfBytes)
    console.log(`✓ Parsed character: ${parsedCharacter.characterName}`)

    // Convert to campaign format
    const characterData = convertToCampaignFormat(parsedCharacter)

    // Read existing campaign data
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId)
    const campaignFile = path.join(campaignPath, 'campaign.json')

    let campaignData
    try {
      const fileContent = await fs.readFile(campaignFile, 'utf-8')
      campaignData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Initialize dndbeyond object if it doesn't exist
    if (!campaignData.dndbeyond) {
      campaignData.dndbeyond = { characters: [] }
    }

    // Create new character record
    const newCharacter: DnDBeyondCharacter = {
      characterId: characterData.id,
      name: characterData.name,
      avatarUrl: '',
      cachedData: characterData,
      lastSync: new Date().toISOString(),
    }

    // Add or update character
    const existingIndex = campaignData.dndbeyond.characters.findIndex(
      (c: DnDBeyondCharacter) => c.characterId === characterData.id
    )

    if (existingIndex >= 0) {
      campaignData.dndbeyond.characters[existingIndex] = newCharacter
      console.log(`Updated existing character: ${characterData.name}`)
    } else {
      campaignData.dndbeyond.characters.push(newCharacter)
      console.log(`Added new character: ${characterData.name}`)
    }

    // Save updated campaign
    await fs.writeFile(campaignFile, JSON.stringify(campaignData, null, 2))

    return NextResponse.json({
      success: true,
      character: newCharacter,
      message: `Character "${characterData.name}" imported from PDF`,
    })
  } catch (error) {
    console.error('PDF import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import PDF',
      },
      { status: 500 }
    )
  }
}
