/**
 * Open5e API Client
 * Fetches official D&D 5e SRD data from the Open5e API
 */

import {
  SRDMonster,
  SRDRace,
  SRDClass,
  SRDSpell,
  SRDItem,
  SRDBackgroundOption,
} from './models';

const OPEN5E_API = 'https://api.open5e.com/v1';

interface Open5eMonster {
  slug: string;
  name: string;
  armor_class: number;
  hit_points: number;
  speed: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  saving_throws?: Record<string, number>;
  skills?: Record<string, number>;
  damage_immunities?: string;
  damage_resistances?: string;
  damage_vulnerabilities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  challenge_rating: number;
  traits?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string }>;
  reactions?: Array<{ name: string; desc: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
  image_url?: string;
  alignment?: string;
  size?: string;
  type?: string;
}

interface Open5eRace {
  slug: string;
  name: string;
  ability_bonuses?: Record<string, number>;
  ability_score_maximum?: number;
  size?: string;
  speed?: number;
  languages?: string[];
  proficiencies?: string[];
  desc?: string;
}

interface Open5eClass {
  slug: string;
  name: string;
  hit_dice?: string;
  desc?: string;
}

interface Open5eSpell {
  slug: string;
  name: string;
  level: number;
  school?: string;
  casting_time?: string;
  range?: string;
  components?: string;
  duration?: string;
  desc: string;
  higher_level?: string;
  classes?: string[];
  ritual?: boolean;
  concentration?: boolean;
}

interface Open5eWeapon {
  slug: string;
  name: string;
  damage_dice?: string;
  damage_type?: string;
  weight?: string;
  properties?: string[];
  rarity?: string;
  desc?: string;
}

interface Open5eArmor {
  slug: string;
  name: string;
  armor_class?: string;
  weight?: string;
  rarity?: string;
  desc?: string;
}

interface Open5eBackground {
  slug: string;
  name: string;
  skill_proficiencies?: string;
  desc?: string;
}

interface Open5eApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Fetch paginated data from Open5e API
async function fetchPaginatedData<T>(
  endpoint: string,
  maxPages: number = 10
): Promise<T[]> {
  const results: T[] = [];
  let url: string | undefined = `${OPEN5E_API}/${endpoint}?limit=100`;
  let pageCount = 0;

  while (url && pageCount < maxPages) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        break;
      }

      const data = (await response.json()) as Open5eApiResponse<T>;
      results.push(...data.results);

      url = data.next;
      pageCount++;

      // Be nice to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      break;
    }
  }

  return results;
}

// Convert Open5e monster to SRD format
function convertOpen5eMonster(monster: Open5eMonster): SRDMonster {
  return {
    id: `open5e_${monster.slug}`,
    name: monster.name,
    source: 'official',
    ac: monster.armor_class,
    hp: monster.hit_points,
    speed: monster.speed,
    abilities: {
      strength: monster.strength,
      dexterity: monster.dexterity,
      constitution: monster.constitution,
      intelligence: monster.intelligence,
      wisdom: monster.wisdom,
      charisma: monster.charisma,
    },
    savingThrows: monster.saving_throws,
    skills: monster.skills,
    damageImmunities: monster.damage_immunities
      ? monster.damage_immunities.split(',').map((s) => s.trim())
      : undefined,
    damageResistances: monster.damage_resistances
      ? monster.damage_resistances.split(',').map((s) => s.trim())
      : undefined,
    damageVulnerabilities: monster.damage_vulnerabilities
      ? monster.damage_vulnerabilities.split(',').map((s) => s.trim())
      : undefined,
    conditionImmunities: monster.condition_immunities
      ? monster.condition_immunities.split(',').map((s) => s.trim())
      : undefined,
    senses: monster.senses ? [monster.senses] : undefined,
    languages: monster.languages ? monster.languages.split(',').map((s) => s.trim()) : undefined,
    challengeRating: monster.challenge_rating,
    traits: monster.traits?.map((t) => ({
      name: t.name,
      description: t.desc,
    })),
    actions: monster.actions?.map((a) => ({
      name: a.name,
      description: a.desc,
    })),
    reactions: monster.reactions?.map((r) => ({
      name: r.name,
      description: r.desc,
    })),
    legendaryActions: monster.legendary_actions?.map((la) => ({
      name: la.name,
      description: la.desc,
    })),
    imageUrl: monster.image_url,
    alignment: monster.alignment,
    size: monster.size,
    type: monster.type,
  };
}

// Convert Open5e race to SRD format
function convertOpen5eRace(race: Open5eRace): SRDRace {
  return {
    id: `open5e_${race.slug}`,
    name: race.name,
    source: 'official',
    abilityScoreBonuses: race.ability_bonuses,
    abilityScoreMax: race.ability_score_maximum,
    size: race.size,
    speed: race.speed,
    languages: race.languages,
    proficiencies: race.proficiencies,
    description: race.desc,
  };
}

// Convert Open5e class to SRD format
function convertOpen5eClass(klass: Open5eClass): SRDClass {
  return {
    id: `open5e_${klass.slug}`,
    name: klass.name,
    source: 'official',
    hitDice: klass.hit_dice,
    description: klass.desc,
  };
}

// Convert Open5e spell to SRD format
function convertOpen5eSpell(spell: Open5eSpell): SRDSpell {
  return {
    id: `open5e_${spell.slug}`,
    name: spell.name,
    source: 'official',
    level: spell.level,
    school: spell.school,
    castingTime: spell.casting_time,
    range: spell.range,
    components: spell.components ? spell.components.split(',').map((c) => c.trim()) : undefined,
    duration: spell.duration,
    description: spell.desc,
    higherLevel: spell.higher_level,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
  };
}

// Convert Open5e weapon to SRD item format
function convertOpen5eWeapon(weapon: Open5eWeapon): SRDItem {
  return {
    id: `open5e_${weapon.slug}`,
    name: weapon.name,
    source: 'official',
    type: 'weapon',
    rarity: weapon.rarity,
    weight: weapon.weight ? parseFloat(weapon.weight) : undefined,
    description: weapon.desc || '',
    properties: weapon.properties,
  };
}

// Convert Open5e armor to SRD item format
function convertOpen5eArmor(armor: Open5eArmor): SRDItem {
  return {
    id: `open5e_${armor.slug}`,
    name: armor.name,
    source: 'official',
    type: 'armor',
    rarity: armor.rarity,
    description: armor.desc || '',
  };
}

// Convert Open5e background to SRD format
function convertOpen5eBackground(bg: Open5eBackground): SRDBackgroundOption {
  return {
    id: `open5e_${bg.slug}`,
    name: bg.name,
    source: 'official',
    description: bg.desc,
    skillProficiencies: bg.skill_proficiencies
      ? bg.skill_proficiencies.split(',').map((s) => s.trim())
      : undefined,
  };
}

// Public API functions

export async function fetchMonsters(): Promise<SRDMonster[]> {
  console.log('Fetching monsters from Open5e API...');
  const monsters = await fetchPaginatedData<Open5eMonster>('monsters');
  return monsters.map(convertOpen5eMonster);
}

export async function fetchRaces(): Promise<SRDRace[]> {
  console.log('Fetching races from Open5e API...');
  const races = await fetchPaginatedData<Open5eRace>('races');
  return races.map(convertOpen5eRace);
}

export async function fetchClasses(): Promise<SRDClass[]> {
  console.log('Fetching classes from Open5e API...');
  const classes = await fetchPaginatedData<Open5eClass>('classes');
  return classes.map(convertOpen5eClass);
}

export async function fetchSpells(): Promise<SRDSpell[]> {
  console.log('Fetching spells from Open5e API...');
  const spells = await fetchPaginatedData<Open5eSpell>('spells');
  return spells.map(convertOpen5eSpell);
}

export async function fetchWeapons(): Promise<SRDItem[]> {
  console.log('Fetching weapons from Open5e API...');
  const weapons = await fetchPaginatedData<Open5eWeapon>('weapons');
  return weapons.map(convertOpen5eWeapon);
}

export async function fetchArmor(): Promise<SRDItem[]> {
  console.log('Fetching armor from Open5e API...');
  const armor = await fetchPaginatedData<Open5eArmor>('armor');
  return armor.map(convertOpen5eArmor);
}

export async function fetchBackgrounds(): Promise<SRDBackgroundOption[]> {
  console.log('Fetching backgrounds from Open5e API...');
  const backgrounds = await fetchPaginatedData<Open5eBackground>('backgrounds');
  return backgrounds.map(convertOpen5eBackground);
}

// Fetch all data
export async function fetchAllOfficialData() {
  console.log('Starting comprehensive SRD data fetch from Open5e...');

  try {
    const [monsters, races, classes, spells, weapons, armor, backgrounds] =
      await Promise.all([
        fetchMonsters(),
        fetchRaces(),
        fetchClasses(),
        fetchSpells(),
        fetchWeapons(),
        fetchArmor(),
        fetchBackgrounds(),
      ]);

    // Combine weapons and armor into items
    const items = [...weapons, ...armor];

    console.log(
      `Fetched: ${monsters.length} monsters, ${races.length} races, ${classes.length} classes, ${spells.length} spells, ${items.length} items, ${backgrounds.length} backgrounds`
    );

    return {
      monsters,
      races,
      classes,
      spells,
      items,
      backgrounds,
    };
  } catch (error) {
    console.error('Error fetching official SRD data:', error);
    throw error;
  }
}
