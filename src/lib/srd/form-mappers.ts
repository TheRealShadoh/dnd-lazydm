/**
 * Form Mapping Utilities for SRD Data
 * Converts SRD models to form-compatible formats for creators/editors
 */

import type { SRDMonster, SRDRace, SRDClass, SRDBackgroundOption } from './models'

/**
 * Monster form data structure matching the new monster form
 */
export interface MonsterFormData {
  name: string
  size: string
  type: string
  alignment: string
  cr: string
  ac: string
  acType: string
  hp: string
  hitDice: string
  speed: string
  str: string
  dex: string
  con: string
  int: string
  wis: string
  cha: string
  saves: string
  skills: string
  resistances: string
  immunities: string
  senses: string
  languages: string
  traits: Array<{ name: string; description: string }>
  actions: Array<{ name: string; description: string }>
  reactions?: Array<{ name: string; description: string }>
  legendaryActions?: Array<{ name: string; description: string }>
  imageUrl: string
}

/**
 * Format CR for display (e.g., 0.5 -> "1/2", 0.25 -> "1/4")
 */
function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return cr.toString()
}

/**
 * Calculate average HP from hit dice formula
 * This is approximate and used when HP is not directly available
 */
function calculateAverageHP(hitDice: string): number {
  // Parse format like "4d8+4" or "12d10+48"
  const match = hitDice.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) return 0

  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  // Average roll = (sides + 1) / 2
  const avgRoll = (sides + 1) / 2
  return Math.floor(count * avgRoll + modifier)
}

/**
 * Format saving throws from record to string
 */
function formatSavingThrows(saves?: Record<string, number>): string {
  if (!saves) return ''

  const abbrev: Record<string, string> = {
    strength: 'Str',
    dexterity: 'Dex',
    constitution: 'Con',
    intelligence: 'Int',
    wisdom: 'Wis',
    charisma: 'Cha'
  }

  return Object.entries(saves)
    .map(([key, value]) => {
      const name = abbrev[key.toLowerCase()] || key
      const sign = value >= 0 ? '+' : ''
      return `${name} ${sign}${value}`
    })
    .join(', ')
}

/**
 * Format skills from record to string
 */
function formatSkills(skills?: Record<string, number>): string {
  if (!skills) return ''

  return Object.entries(skills)
    .map(([name, value]) => {
      const sign = value >= 0 ? '+' : ''
      return `${name} ${sign}${value}`
    })
    .join(', ')
}

/**
 * Format speed - handles both string and object formats
 */
function formatSpeed(speed: string | Record<string, number> | undefined): string {
  if (!speed) return ''
  if (typeof speed === 'string') return speed

  // Handle object format like {walk: 30, swim: 40, fly: 60}
  const parts: string[] = []
  if ('walk' in speed) parts.push(`${speed.walk} ft.`)
  if ('swim' in speed) parts.push(`swim ${speed.swim} ft.`)
  if ('fly' in speed) parts.push(`fly ${speed.fly} ft.`)
  if ('burrow' in speed) parts.push(`burrow ${speed.burrow} ft.`)
  if ('climb' in speed) parts.push(`climb ${speed.climb} ft.`)

  return parts.length > 0 ? parts.join(', ') : ''
}

/**
 * Convert SRD Monster to form data structure
 */
export function srdMonsterToFormData(monster: SRDMonster): MonsterFormData {
  return {
    name: monster.name,
    size: monster.size || 'Medium',
    type: monster.type || 'Humanoid',
    alignment: monster.alignment || 'Neutral',
    cr: formatCR(monster.challengeRating),
    ac: monster.ac.toString(),
    acType: '', // SRD doesn't always have AC type separated
    hp: monster.hp.toString(),
    hitDice: '', // Would need additional data
    speed: formatSpeed(monster.speed),
    str: monster.abilities.strength.toString(),
    dex: monster.abilities.dexterity.toString(),
    con: monster.abilities.constitution.toString(),
    int: monster.abilities.intelligence.toString(),
    wis: monster.abilities.wisdom.toString(),
    cha: monster.abilities.charisma.toString(),
    saves: formatSavingThrows(monster.savingThrows),
    skills: formatSkills(monster.skills),
    resistances: monster.damageResistances?.join(', ') || '',
    immunities: monster.damageImmunities?.join(', ') || '',
    senses: monster.senses?.join(', ') || '',
    languages: monster.languages?.join(', ') || '',
    traits: monster.traits || [],
    actions: monster.actions || [],
    reactions: monster.reactions,
    legendaryActions: monster.legendaryActions,
    imageUrl: monster.imageUrl || ''
  }
}

/**
 * Character form data structure for races
 */
export interface RaceFormData {
  raceName: string
  abilityBonuses: Record<string, number>
  size: string
  speed: number
  languages: string[]
  proficiencies: string[]
  traits: string[]
  description: string
}

/**
 * Convert SRD Race to form data
 */
export function srdRaceToFormData(race: SRDRace): RaceFormData {
  return {
    raceName: race.name,
    abilityBonuses: race.abilityScoreBonuses || {},
    size: race.size || 'Medium',
    speed: race.speed || 30,
    languages: race.languages || [],
    proficiencies: race.proficiencies || [],
    traits: race.traits || [],
    description: race.description || ''
  }
}

/**
 * Character form data structure for classes
 */
export interface ClassFormData {
  className: string
  hitDice: string
  armorProficiencies: string[]
  weaponProficiencies: string[]
  skillChoices: string[]
  savingThrows: string[]
  spellcastingAbility: string
  description: string
}

/**
 * Convert SRD Class to form data
 */
export function srdClassToFormData(cls: SRDClass): ClassFormData {
  return {
    className: cls.name,
    hitDice: cls.hitDice || 'd8',
    armorProficiencies: cls.armorProficiencies || [],
    weaponProficiencies: cls.weaponProficiencies || [],
    skillChoices: cls.skillChoices || [],
    savingThrows: cls.savingThrowProficiencies || [],
    spellcastingAbility: cls.spellcastingAbility || '',
    description: cls.description || ''
  }
}

/**
 * Character form data structure for backgrounds
 */
export interface BackgroundFormData {
  backgroundName: string
  skillProficiencies: string[]
  languageChoices: string[]
  equipment: string[]
  description: string
}

/**
 * Convert SRD Background to form data
 */
export function srdBackgroundToFormData(bg: SRDBackgroundOption): BackgroundFormData {
  return {
    backgroundName: bg.name,
    skillProficiencies: bg.skillProficiencies || [],
    languageChoices: bg.languageChoices || [],
    equipment: bg.equipment || [],
    description: bg.description || ''
  }
}
