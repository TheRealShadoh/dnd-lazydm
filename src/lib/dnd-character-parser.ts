/**
 * D&D Character Sheet Parser
 * Parses D&D Beyond character sheet PDFs into structured TypeScript objects
 */

// Type Definitions
export interface AbilityScore {
  score: number
  modifier: number
}

export interface Abilities {
  strength: AbilityScore
  dexterity: AbilityScore
  constitution: AbilityScore
  intelligence: AbilityScore
  wisdom: AbilityScore
  charisma: AbilityScore
}

export interface Skill {
  name: string
  ability: string
  modifier: number
  proficient?: boolean
}

export interface SavingThrow {
  ability: string
  modifier: number
  proficient?: boolean
}

export interface WeaponAttack {
  name: string
  hitBonus: number
  damage: string
  damageType: string
  range?: string
}

export interface Equipment {
  name: string
  quantity: number
  weight?: number
  description?: string
}

export interface Spell {
  name: string
  level: number
  school?: string
  castingTime?: string
  range?: string
  components?: string
  duration?: string
}

export interface Feature {
  name: string
  source: string
  description: string
}

export interface CharacterSheet {
  // Basic Info
  characterName: string
  playerName: string
  class: string
  level: number
  race: string
  background: string
  alignment?: string
  experiencePoints: number

  // Physical Description
  gender?: string
  age?: string
  height?: string
  weight?: string
  eyes?: string
  skin?: string
  hair?: string

  // Abilities
  abilities: Abilities

  // Combat Stats
  armorClass: number
  hitPoints: {
    max: number
    current: number
    temp: number
  }
  hitDice: string
  speed: string
  initiative: number

  // Skills and Saves
  proficiencyBonus: number
  skills: Skill[]
  savingThrows: SavingThrow[]
  passivePerception: number
  inspiration: boolean

  // Combat
  weaponAttacks: WeaponAttack[]

  // Equipment and Treasure
  equipment: Equipment[]
  copper: number
  silver: number
  electrum: number
  gold: number
  platinum: number

  // Proficiencies and Languages
  languages: string[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]

  // Features and Traits
  features: Feature[]
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string

  // Spellcasting
  spellcastingClass?: string
  spellcastingAbility?: string
  spellSaveDC: number
  spellAttackBonus: number
  spells: Spell[]

  // Additional Info
  backstory: string
  alliesAndOrganizations: string
  additionalFeatures: string
  treasure: string
}

interface TextItem {
  text: string
  x: number
  y: number
}

export class DndCharacterParser {
  /**
   * Parse a D&D Beyond character sheet PDF
   * @param pdfBytes - PDF file as Uint8Array or Buffer
   * @returns Parsed character sheet data
   */
  static async parseCharacterSheet(pdfBytes: Uint8Array | Buffer): Promise<CharacterSheet> {
    try {
      // Import pdfjs-dist for form field extraction
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

      // Disable worker for server-side (Node.js) usage
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''

      // Convert Buffer to Uint8Array if needed
      const uint8Array = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)

      // Load PDF document without worker
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      })
      const pdfDocument = await loadingTask.promise

      console.log(`✓ PDF loaded successfully (${pdfDocument.numPages} pages)`)

      // Extract form fields from all pages
      const formFields: Record<string, string> = {}
      let totalFields = 0

      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum)
        const annotations = await page.getAnnotations()

        annotations.forEach(ann => {
          if (ann.fieldType && ann.fieldName) {
            // Store field value (convert to string, handle empty values)
            const value = ann.fieldValue !== null && ann.fieldValue !== undefined
              ? String(ann.fieldValue)
              : ''
            formFields[ann.fieldName] = value
            totalFields++
          }
        })
      }

      console.log(`✓ Extracted ${totalFields} form fields`)

      // Check if form is blank (most fields are empty)
      const filledFields = Object.values(formFields).filter(v => v && v !== '(empty)' && v !== '--').length
      if (filledFields < 10) {
        throw new Error('PDF appears to be a blank character sheet. Please upload a filled character sheet.')
      }

      // Parse form fields into character data
      return this.parseFormFields(formFields)
    } catch (error) {
      console.error('Failed to parse PDF:', error)
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Detect if PDF is a blank template by checking for common template indicators
   */
  private static isBlankTemplate(text: string): boolean {
    // Common indicators of blank D&D Beyond templates
    const blankIndicators = [
      /CHARACTER NAME\s+EXPERIENCE POINTS\s+BACKGROUND/i,
      /CLASS & LEVEL\s+PLAYER NAME/i,
      /--\s*\d+\s*of\s*\d+\s*--/,  // Page indicators like "-- 1 of 4 --"
      /PASSIVE PERCEPTION\s+SENSES/i,
      /WEAPON ATTACKS & CANTRIPS/i,
    ]

    // Check if multiple blank indicators are present
    const matchCount = blankIndicators.filter(pattern => pattern.test(text)).length

    // If 3 or more indicators match, it's likely a blank template
    if (matchCount >= 3) {
      return true
    }

    // Additional check: if text is very short and contains mostly field labels
    const fieldLabels = [
      'STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'CHARISMA',
      'ARMOR CLASS', 'HIT POINTS', 'SPEED', 'PROFICIENCY BONUS'
    ]

    const labelCount = fieldLabels.filter(label => text.includes(label)).length

    // If we have many labels but very little text, likely blank
    if (text.length < 3000 && labelCount >= 8) {
      return true
    }

    return false
  }

  /**
   * Parse form fields from D&D Beyond PDF into CharacterSheet structure
   */
  private static parseFormFields(fields: Record<string, string>): CharacterSheet {
    // Helper to get field value
    const get = (fieldName: string): string => fields[fieldName] || ''

    // Helper to get number from field
    const getNum = (fieldName: string): number => {
      const value = get(fieldName)
      // Extract first number from string (handles "+5", "20", etc.)
      const match = value.match(/-?\d+/)
      return match ? parseInt(match[0]) : 0
    }

    // Helper to calculate modifier from score
    const calcMod = (score: number): number => Math.floor((score - 10) / 2)

    // Parse class and level from "CLASS  LEVEL" field (e.g., "Barbarian 5")
    const classLevel = get('CLASS  LEVEL')
    const classMatch = classLevel.match(/^(.+?)\s+(\d+)$/)
    const characterClass = classMatch ? classMatch[1] : classLevel || 'Unknown'
    const level = classMatch ? parseInt(classMatch[2]) : 1

    // Parse ability scores
    const str = getNum('STR') || 10
    const dex = getNum('DEX') || 10
    const con = getNum('CON') || 10
    const int = getNum('INT') || 10
    const wis = getNum('WIS') || 10
    const cha = getNum('CHA') || 10

    // Parse HP
    const maxHp = getNum('MaxHP')
    const currentHp = getNum('CurrentHP') || maxHp
    const tempHp = getNum('TempHP')

    // Build character sheet
    const sheet: CharacterSheet = {
      // Basic Info
      characterName: get('CharacterName') || 'Unknown Character',
      playerName: get('PLAYER NAME'),
      class: characterClass,
      level,
      race: get('RACE') || get('RACE2'),
      background: get('BACKGROUND') || get('BACKGROUND2'),
      alignment: get('ALIGNMENT'),
      experiencePoints: getNum('EXPERIENCE POINTS') || 0,

      // Physical Description
      gender: get('GENDER'),
      age: get('AGE'),
      height: get('HEIGHT'),
      weight: get('WEIGHT'),
      eyes: get('EYES'),
      skin: get('SKIN'),
      hair: get('HAIR'),

      // Abilities
      abilities: {
        strength: { score: str, modifier: calcMod(str) },
        dexterity: { score: dex, modifier: calcMod(dex) },
        constitution: { score: con, modifier: calcMod(con) },
        intelligence: { score: int, modifier: calcMod(int) },
        wisdom: { score: wis, modifier: calcMod(wis) },
        charisma: { score: cha, modifier: calcMod(cha) },
      },

      // Combat Stats
      armorClass: getNum('AC') || 10,
      hitPoints: {
        max: maxHp,
        current: currentHp,
        temp: tempHp,
      },
      hitDice: get('Total'),
      speed: get('Speed') || '30 ft.',
      initiative: getNum('Init'),

      // Skills and Saves
      proficiencyBonus: getNum('ProfBonus') || 2,
      savingThrows: [
        { ability: 'Strength', modifier: getNum('ST Strength'), proficient: get('StrProf') === '•' },
        { ability: 'Dexterity', modifier: getNum('ST Dexterity'), proficient: get('DexProf') === '•' },
        { ability: 'Constitution', modifier: getNum('ST Constitution'), proficient: get('ConProf') === '•' },
        { ability: 'Intelligence', modifier: getNum('ST Intelligence'), proficient: get('IntProf') === '•' },
        { ability: 'Wisdom', modifier: getNum('ST Wisdom'), proficient: get('WisProf') === '•' },
        { ability: 'Charisma', modifier: getNum('ST Charisma'), proficient: get('ChaProf') === '•' },
      ],
      skills: [
        { name: 'Acrobatics', ability: 'DEX', modifier: getNum('Acrobatics'), proficient: get('AcrobaticsProf') === 'P' },
        { name: 'Animal Handling', ability: 'WIS', modifier: getNum('Animal'), proficient: get('AnimalHandlingProf') === 'P' },
        { name: 'Arcana', ability: 'INT', modifier: getNum('Arcana'), proficient: get('ArcanaProf') === 'P' },
        { name: 'Athletics', ability: 'STR', modifier: getNum('Athletics'), proficient: get('AthleticsProf') === 'P' },
        { name: 'Deception', ability: 'CHA', modifier: getNum('Deception'), proficient: get('DeceptionProf') === 'P' },
        { name: 'History', ability: 'INT', modifier: getNum('History'), proficient: get('HistoryProf') === 'P' },
        { name: 'Insight', ability: 'WIS', modifier: getNum('Insight'), proficient: get('InsightProf') === 'P' },
        { name: 'Intimidation', ability: 'CHA', modifier: getNum('Intimidation'), proficient: get('IntimidationProf') === 'P' },
        { name: 'Investigation', ability: 'INT', modifier: getNum('Investigation'), proficient: get('InvestigationProf') === 'P' },
        { name: 'Medicine', ability: 'WIS', modifier: getNum('Medicine'), proficient: get('MedicineProf') === 'P' },
        { name: 'Nature', ability: 'INT', modifier: getNum('Nature'), proficient: get('NatureProf') === 'P' },
        { name: 'Perception', ability: 'WIS', modifier: getNum('Perception'), proficient: get('PerceptionProf') === 'P' },
        { name: 'Performance', ability: 'CHA', modifier: getNum('Performance'), proficient: get('PerformanceProf') === 'P' },
        { name: 'Persuasion', ability: 'CHA', modifier: getNum('Persuasion'), proficient: get('PersuasionProf') === 'P' },
        { name: 'Religion', ability: 'INT', modifier: getNum('Religion'), proficient: get('ReligionProf') === 'P' },
        { name: 'Sleight of Hand', ability: 'DEX', modifier: getNum('SleightofHand'), proficient: get('SleightOfHandProf') === 'P' },
        { name: 'Stealth', ability: 'DEX', modifier: getNum('Stealth '), proficient: get('StealthProf') === 'P' },
        { name: 'Survival', ability: 'WIS', modifier: getNum('Survival'), proficient: get('SurvivalProf') === 'P' },
      ],
      passivePerception: getNum('Passive1') || (10 + getNum('Perception')),
      inspiration: get('Inspiration') === '•' || false,

      // Combat
      weaponAttacks: this.parseWeapons(fields),

      // Equipment and Treasure
      equipment: this.parseEquipment(get('Equipment')),
      copper: getNum('CP') || 0,
      silver: getNum('SP') || 0,
      electrum: getNum('EP') || 0,
      gold: getNum('GP') || 0,
      platinum: getNum('PP') || 0,

      // Proficiencies and Languages
      languages: this.extractProficiencies(get('ProficienciesLang'), 'LANGUAGES'),
      armorProficiencies: this.extractProficiencies(get('ProficienciesLang'), 'ARMOR'),
      weaponProficiencies: this.extractProficiencies(get('ProficienciesLang'), 'WEAPONS'),
      toolProficiencies: this.extractProficiencies(get('ProficienciesLang'), 'TOOLS'),

      // Features and Traits
      features: this.parseFeatures(get('FeaturesTraits1') + '\n' + get('FeaturesTraits2') + '\n' + get('FeaturesTraits3')),
      personalityTraits: get('PersonalityTraits ') || '',
      ideals: get('Ideals') || '',
      bonds: get('Bonds') || '',
      flaws: get('Flaws') || '',

      // Spellcasting
      spellcastingClass: get('spellCastingClass0'),
      spellcastingAbility: get('spellCastingAbility0'),
      spellSaveDC: getNum('spellSaveDC0') || 0,
      spellAttackBonus: getNum('spellAtkBonus0') || 0,
      spells: this.parseSpells(fields),

      // Additional Info
      backstory: get('Backstory') || '',
      alliesAndOrganizations: get('AlliesOrganizations') || '',
      additionalFeatures: get('AdditionalNotes1') + '\n' + get('AdditionalNotes2'),
      treasure: `${getNum('CP')} cp, ${getNum('SP')} sp, ${getNum('EP')} ep, ${getNum('GP')} gp, ${getNum('PP')} pp`,
    }

    console.log(`✓ Parsed character: ${sheet.characterName}`)
    return sheet
  }

  /**
   * Extract proficiencies from the combined proficiencies field
   */
  private static extractProficiencies(text: string, section: string): string[] {
    const sectionRegex = new RegExp(`===\\s*${section}\\s*===([^=]+)`, 'i')
    const match = text.match(sectionRegex)
    if (!match) return []

    return match[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  /**
   * Parse features from the features text
   */
  private static parseFeatures(text: string): Feature[] {
    const features: Feature[] = []
    const featureMatches = text.matchAll(/\*\s*([^•\n]+)([^*]+)/g)

    for (const match of featureMatches) {
      features.push({
        name: match[1].trim(),
        source: 'Character Sheet',
        description: match[2].trim(),
      })
    }

    return features
  }

  /**
   * Parse spells from form fields
   */
  private static parseSpells(fields: Record<string, string>): Spell[] {
    const spells: Spell[] = []

    // Iterate through spell fields (spellName0, spellName1, etc.)
    for (let i = 0; i < 100; i++) {
      const name = fields[`spellName${i}`]
      if (!name || name === '(empty)') continue

      spells.push({
        name,
        level: 0, // Would need to parse from spell headers
        school: '',
        castingTime: fields[`spellCastingTime${i}`] || '',
        range: fields[`spellRange${i}`] || '',
        components: fields[`spellComponents${i}`] || '',
        duration: fields[`spellDuration${i}`] || '',
      })
    }

    return spells
  }

  /**
   * Parse weapon attacks
   */
  private static parseWeapons(fields: Record<string, string>): WeaponAttack[] {
    const weapons: WeaponAttack[] = []

    // Parse weapon fields (Wpn Name, Wpn2 Name, Wpn3 Name)
    for (let i = 1; i <= 3; i++) {
      const prefix = i === 1 ? 'Wpn' : `Wpn${i}`
      const name = fields[`${prefix} Name`]
      if (!name) continue

      const hitBonus = parseInt(fields[`${prefix} AtkBonus`]) || 0
      const damage = fields[`${prefix} Damage`] || '1d6'

      weapons.push({
        name,
        hitBonus,
        damage,
        damageType: fields[`${prefix} DamageType`] || 'slashing',
        range: fields[`${prefix} Range`],
      })
    }

    return weapons
  }

  /**
   * Parse equipment
   */
  private static parseEquipment(equipmentText: string): Equipment[] {
    if (!equipmentText) return []

    const items: Equipment[] = []
    const lines = equipmentText.split('\n').filter((line) => line.trim())

    for (const line of lines) {
      // Try to parse quantity and name (e.g., "2 Daggers" or "Rope, 50ft")
      const match = line.match(/^(\d+)?\s*(.+)$/)
      if (match) {
        const [, quantityStr, name] = match
        items.push({
          name: name.trim(),
          quantity: quantityStr ? parseInt(quantityStr) : 1,
        })
      }
    }

    return items
  }

  private static parseText(text: string): CharacterSheet {
    // Helper function to find value after a label in text
    const findAfter = (label: string): string => {
      const regex = new RegExp(`${label}\\s*:?\\s*([^\\n\\t]+)`, 'i')
      const match = text.match(regex)
      if (!match) return ''

      const value = match[1].trim()

      // Reject if value appears to be a field label (all caps, common D&D terms)
      const commonLabels = [
        'CHARACTER NAME', 'PLAYER NAME', 'CLASS', 'LEVEL', 'RACE', 'BACKGROUND',
        'ALIGNMENT', 'EXPERIENCE POINTS', 'ARMOR CLASS', 'HIT POINTS', 'SPEED',
        'STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'CHARISMA',
        'PROFICIENCY BONUS', 'PASSIVE PERCEPTION', 'INITIATIVE', 'TOTAL', 'SUCCESSES',
        'FAILURES', 'SPECIES', 'GENDER', 'WEIGHT', 'SIZE', 'HAIR', 'SKIN', 'EYES',
        'BONDS', 'FLAWS', 'IDEALS', 'PERSONALITY TRAITS'
      ]

      // Check if value is mostly uppercase and matches common labels
      if (value === value.toUpperCase() && value.length > 3) {
        if (commonLabels.some(label => value.includes(label))) {
          return ''
        }
      }

      // Reject if value contains multiple field labels separated by tabs
      if (value.includes('\t') || value.includes('  ')) {
        const parts = value.split(/[\t\s]{2,}/)
        if (parts.some(part => commonLabels.includes(part.toUpperCase()))) {
          return ''
        }
      }

      return value
    }

    const findNumber = (label: string): number => {
      const value = findAfter(label)
      // Extract first number found in the value
      const numberMatch = value.match(/\d+/)
      if (!numberMatch) return 0

      const num = parseInt(numberMatch[0])

      // Validate D&D ability scores (should be 1-30)
      if (label.match(/strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha/i)) {
        if (num < 1 || num > 30) return 10 // Default to 10 if invalid
      }

      return num
    }

    const calculateModifier = (score: number): number => {
      return Math.floor((score - 10) / 2)
    }

    // Extract basic info
    const characterName = findAfter('Character Name') || findAfter('Name') || 'Unknown Character'
    const playerName = findAfter('Player Name') || findAfter('Player') || ''
    const classText = findAfter('Class') || findAfter('Class & Level') || 'Unknown'
    const level = findNumber('Level') || 1
    const race = findAfter('Race') || findAfter('Species') || 'Unknown'
    const background = findAfter('Background') || ''
    const alignment = findAfter('Alignment') || ''
    const experiencePoints = findNumber('Experience Points') || 0

    // Extract ability scores
    const strength = findNumber('Strength') || findNumber('STR') || 10
    const dexterity = findNumber('Dexterity') || findNumber('DEX') || 10
    const constitution = findNumber('Constitution') || findNumber('CON') || 10
    const intelligence = findNumber('Intelligence') || findNumber('INT') || 10
    const wisdom = findNumber('Wisdom') || findNumber('WIS') || 10
    const charisma = findNumber('Charisma') || findNumber('CHA') || 10

    const abilities: Abilities = {
      strength: { score: strength, modifier: calculateModifier(strength) },
      dexterity: { score: dexterity, modifier: calculateModifier(dexterity) },
      constitution: { score: constitution, modifier: calculateModifier(constitution) },
      intelligence: { score: intelligence, modifier: calculateModifier(intelligence) },
      wisdom: { score: wisdom, modifier: calculateModifier(wisdom) },
      charisma: { score: charisma, modifier: calculateModifier(charisma) },
    }

    // Combat stats
    const armorClass = findNumber('Armor Class') || findNumber('AC') || 10
    const maxHp = findNumber('Hit Point Maximum') || findNumber('Max HP') || findNumber('HP') || 0
    const speed = findAfter('Speed') || '30 ft'
    const initiative = findNumber('Initiative') || abilities.dexterity.modifier
    const proficiencyBonus = findNumber('Proficiency Bonus') || 2

    // Skills (simplified - just extract the modifiers if present)
    const skills: Skill[] = [
      { name: 'Acrobatics', ability: 'dexterity', modifier: findNumber('Acrobatics') || abilities.dexterity.modifier },
      { name: 'Animal Handling', ability: 'wisdom', modifier: findNumber('Animal Handling') || abilities.wisdom.modifier },
      { name: 'Arcana', ability: 'intelligence', modifier: findNumber('Arcana') || abilities.intelligence.modifier },
      { name: 'Athletics', ability: 'strength', modifier: findNumber('Athletics') || abilities.strength.modifier },
      { name: 'Deception', ability: 'charisma', modifier: findNumber('Deception') || abilities.charisma.modifier },
      { name: 'History', ability: 'intelligence', modifier: findNumber('History') || abilities.intelligence.modifier },
      { name: 'Insight', ability: 'wisdom', modifier: findNumber('Insight') || abilities.wisdom.modifier },
      { name: 'Intimidation', ability: 'charisma', modifier: findNumber('Intimidation') || abilities.charisma.modifier },
      { name: 'Investigation', ability: 'intelligence', modifier: findNumber('Investigation') || abilities.intelligence.modifier },
      { name: 'Medicine', ability: 'wisdom', modifier: findNumber('Medicine') || abilities.wisdom.modifier },
      { name: 'Nature', ability: 'intelligence', modifier: findNumber('Nature') || abilities.intelligence.modifier },
      { name: 'Perception', ability: 'wisdom', modifier: findNumber('Perception') || abilities.wisdom.modifier },
      { name: 'Performance', ability: 'charisma', modifier: findNumber('Performance') || abilities.charisma.modifier },
      { name: 'Persuasion', ability: 'charisma', modifier: findNumber('Persuasion') || abilities.charisma.modifier },
      { name: 'Religion', ability: 'intelligence', modifier: findNumber('Religion') || abilities.intelligence.modifier },
      { name: 'Sleight of Hand', ability: 'dexterity', modifier: findNumber('Sleight of Hand') || abilities.dexterity.modifier },
      { name: 'Stealth', ability: 'dexterity', modifier: findNumber('Stealth') || abilities.dexterity.modifier },
      { name: 'Survival', ability: 'wisdom', modifier: findNumber('Survival') || abilities.wisdom.modifier },
    ]

    // Saving throws
    const savingThrows: SavingThrow[] = [
      { ability: 'strength', modifier: findNumber('Strength Save') || abilities.strength.modifier },
      { ability: 'dexterity', modifier: findNumber('Dexterity Save') || abilities.dexterity.modifier },
      { ability: 'constitution', modifier: findNumber('Constitution Save') || abilities.constitution.modifier },
      { ability: 'intelligence', modifier: findNumber('Intelligence Save') || abilities.intelligence.modifier },
      { ability: 'wisdom', modifier: findNumber('Wisdom Save') || abilities.wisdom.modifier },
      { ability: 'charisma', modifier: findNumber('Charisma Save') || abilities.charisma.modifier },
    ]

    const passivePerception = findNumber('Passive Perception') || findNumber('Passive Wisdom') || 10 + abilities.wisdom.modifier
    const languages = findAfter('Languages')
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l)

    return {
      characterName,
      playerName,
      class: classText,
      level,
      race,
      background,
      alignment,
      experiencePoints,
      age: findAfter('Age'),
      height: findAfter('Height'),
      weight: findAfter('Weight'),
      eyes: findAfter('Eyes'),
      skin: findAfter('Skin'),
      hair: findAfter('Hair'),
      abilities,
      armorClass,
      hitPoints: {
        max: maxHp,
        current: maxHp,
        temp: 0,
      },
      hitDice: findAfter('Hit Dice') || `1d8`,
      speed,
      initiative,
      proficiencyBonus,
      skills,
      savingThrows,
      passivePerception,
      inspiration: false,
      weaponAttacks: [],
      equipment: [],
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
      languages,
      armorProficiencies: [],
      weaponProficiencies: [],
      toolProficiencies: [],
      features: [],
      personalityTraits: findAfter('Personality Traits'),
      ideals: findAfter('Ideals'),
      bonds: findAfter('Bonds'),
      flaws: findAfter('Flaws'),
      spellcastingClass: findAfter('Spellcasting Class'),
      spellcastingAbility: findAfter('Spellcasting Ability'),
      spellSaveDC: findNumber('Spell Save DC'),
      spellAttackBonus: findNumber('Spell Attack Bonus'),
      spells: [],
      backstory: findAfter('Backstory') || findAfter('Character Backstory'),
      alliesAndOrganizations: findAfter('Allies') || findAfter('Organizations'),
      additionalFeatures: findAfter('Features') || findAfter('Additional Features'),
      treasure: findAfter('Treasure'),
    }
  }

  private static parseTextItems(textItems: TextItem[]): CharacterSheet {
    // Helper functions
    const findAfterLabel = (label: string, maxDistance: number = 200): string => {
      const labelItem = textItems.find((item) =>
        item.text.toLowerCase().includes(label.toLowerCase())
      )
      if (!labelItem) return ''

      const rightItems = textItems
        .filter(
          (item) =>
            item.x > labelItem.x &&
            item.x < labelItem.x + maxDistance &&
            Math.abs(item.y - labelItem.y) < 10
        )
        .sort((a, b) => a.x - b.x)

      return rightItems.map((item) => item.text).join(' ').trim()
    }

    const findByPattern = (pattern: RegExp): string => {
      const item = textItems.find((item) => pattern.test(item.text))
      return item ? item.text : ''
    }

    const calculateModifier = (score: number): number => {
      return Math.floor((score - 10) / 2)
    }

    const parseAbilityScore = (label: string): AbilityScore => {
      const scoreText = findAfterLabel(label)
      const score = parseInt(scoreText) || 10
      return {
        score,
        modifier: calculateModifier(score),
      }
    }

    // Parse basic info
    const characterName =
      findAfterLabel('character name') || findAfterLabel('name') || 'Unknown Character'
    const playerName = findAfterLabel('player name') || findAfterLabel('player') || ''
    const classText = findAfterLabel('class') || 'Unknown'
    const levelText = findAfterLabel('level')
    const level = parseInt(levelText) || 1
    const race = findAfterLabel('race') || findAfterLabel('species') || 'Unknown'
    const background = findAfterLabel('background') || ''
    const alignment = findAfterLabel('alignment') || ''
    const experiencePoints = parseInt(findAfterLabel('experience points')) || 0

    // Parse ability scores
    const abilities: Abilities = {
      strength: parseAbilityScore('strength'),
      dexterity: parseAbilityScore('dexterity'),
      constitution: parseAbilityScore('constitution'),
      intelligence: parseAbilityScore('intelligence'),
      wisdom: parseAbilityScore('wisdom'),
      charisma: parseAbilityScore('charisma'),
    }

    // Parse combat stats
    const armorClass = parseInt(findAfterLabel('armor class') || findAfterLabel('ac')) || 10
    const maxHp =
      parseInt(findAfterLabel('hit point maximum') || findAfterLabel('max')) || 0
    const currentHp = parseInt(findAfterLabel('current hit points')) || maxHp
    const tempHp = parseInt(findAfterLabel('temporary hit points')) || 0
    const hitDice = findAfterLabel('hit dice') || `1d8`
    const speed = findAfterLabel('speed') || '30 ft'
    const initiativeBonus = parseInt(findAfterLabel('initiative')) || abilities.dexterity.modifier

    // Parse proficiency and skills
    const proficiencyBonus = parseInt(findAfterLabel('proficiency bonus')) || 2

    // Build skills array
    const skillDefinitions = [
      { name: 'Acrobatics', ability: 'dexterity' },
      { name: 'Animal Handling', ability: 'wisdom' },
      { name: 'Arcana', ability: 'intelligence' },
      { name: 'Athletics', ability: 'strength' },
      { name: 'Deception', ability: 'charisma' },
      { name: 'History', ability: 'intelligence' },
      { name: 'Insight', ability: 'wisdom' },
      { name: 'Intimidation', ability: 'charisma' },
      { name: 'Investigation', ability: 'intelligence' },
      { name: 'Medicine', ability: 'wisdom' },
      { name: 'Nature', ability: 'intelligence' },
      { name: 'Perception', ability: 'wisdom' },
      { name: 'Performance', ability: 'charisma' },
      { name: 'Persuasion', ability: 'charisma' },
      { name: 'Religion', ability: 'intelligence' },
      { name: 'Sleight of Hand', ability: 'dexterity' },
      { name: 'Stealth', ability: 'dexterity' },
      { name: 'Survival', ability: 'wisdom' },
    ]

    const skills: Skill[] = skillDefinitions.map((skill) => {
      const abilityKey = skill.ability as keyof Abilities
      const abilityMod = abilities[abilityKey].modifier
      const skillText = findAfterLabel(skill.name.toLowerCase())
      const modifier = parseInt(skillText) || abilityMod

      return {
        name: skill.name,
        ability: skill.ability,
        modifier,
        proficient: modifier > abilityMod,
      }
    })

    // Build saving throws
    const savingThrows: SavingThrow[] = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ].map((ability) => {
      const abilityKey = ability as keyof Abilities
      const abilityMod = abilities[abilityKey].modifier
      const saveText = findAfterLabel(`${ability} save`)
      const modifier = parseInt(saveText) || abilityMod

      return {
        ability,
        modifier,
        proficient: modifier > abilityMod,
      }
    })

    const passivePerception =
      parseInt(findAfterLabel('passive perception') || findAfterLabel('passive wisdom')) || 10

    // Parse languages
    const languagesText = findAfterLabel('languages') || ''
    const languages = languagesText
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l)

    // Parse weapons (basic extraction)
    const weaponAttacks: WeaponAttack[] = []
    // This would need more sophisticated parsing based on the PDF structure

    // Parse equipment (basic extraction)
    const equipment: Equipment[] = []

    // Parse features (basic extraction)
    const features: Feature[] = []

    // Physical description
    const age = findAfterLabel('age') || ''
    const height = findAfterLabel('height') || ''
    const weight = findAfterLabel('weight') || ''
    const eyes = findAfterLabel('eyes') || ''
    const skin = findAfterLabel('skin') || ''
    const hair = findAfterLabel('hair') || ''

    // Personality
    const personalityTraits = findAfterLabel('personality traits') || ''
    const ideals = findAfterLabel('ideals') || ''
    const bonds = findAfterLabel('bonds') || ''
    const flaws = findAfterLabel('flaws') || ''
    const backstory = findAfterLabel('backstory') || ''

    // Spellcasting
    const spellcastingClass = findAfterLabel('spellcasting class') || ''
    const spellcastingAbility = findAfterLabel('spellcasting ability') || ''
    const spellSaveDC = parseInt(findAfterLabel('spell save dc')) || 0
    const spellAttackBonus = parseInt(findAfterLabel('spell attack bonus')) || 0

    return {
      characterName,
      playerName,
      class: classText,
      level,
      race,
      background,
      alignment,
      experiencePoints,
      age,
      height,
      weight,
      eyes,
      skin,
      hair,
      abilities,
      armorClass,
      hitPoints: {
        max: maxHp,
        current: currentHp,
        temp: tempHp,
      },
      hitDice,
      speed,
      initiative: initiativeBonus,
      proficiencyBonus,
      skills,
      savingThrows,
      passivePerception,
      inspiration: false,
      weaponAttacks,
      equipment,
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
      languages,
      armorProficiencies: [],
      weaponProficiencies: [],
      toolProficiencies: [],
      features,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      spellcastingClass,
      spellcastingAbility,
      spellSaveDC,
      spellAttackBonus,
      spells: [],
      backstory,
      alliesAndOrganizations: '',
      additionalFeatures: '',
      treasure: '',
    }
  }
}
