/**
 * D&D 5e SRD Data Models
 * Unified data structures for all D&D reference material
 */

export interface SRDMonster {
  id: string;
  name: string;
  source: 'official' | 'custom';
  ac: number;
  hp: number;
  speed: string | Record<string, number>;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows?: Record<string, number>;
  skills?: Record<string, number>;
  damageImmunities?: string[];
  damageResistances?: string[];
  damageVulnerabilities?: string[];
  conditionImmunities?: string[];
  senses?: string[];
  languages?: string[];
  challengeRating: number;
  traits?: Array<{
    name: string;
    description: string;
  }>;
  actions?: Array<{
    name: string;
    description: string;
  }>;
  reactions?: Array<{
    name: string;
    description: string;
  }>;
  legendaryActions?: Array<{
    name: string;
    description: string;
  }>;
  imageUrl?: string;
  alignment?: string;
  size?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SRDRace {
  id: string;
  name: string;
  source: 'official' | 'custom';
  abilityScoreBonuses?: Record<string, number>;
  abilityScoreMax?: number;
  size?: string;
  speed?: number;
  languages?: string[];
  proficiencies?: string[];
  traits?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SRDClass {
  id: string;
  name: string;
  source: 'official' | 'custom';
  hitDice?: string;
  armorProficiencies?: string[];
  weaponProficiencies?: string[];
  skillChoices?: string[];
  savingThrowProficiencies?: string[];
  spellcastingAbility?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SRDSpell {
  id: string;
  name: string;
  source: 'official' | 'custom';
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string[];
  duration?: string;
  description: string;
  higherLevel?: string;
  classes?: string[];
  ritual?: boolean;
  concentration?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SRDItem {
  id: string;
  name: string;
  source: 'official' | 'custom';
  type?: string;
  rarity?: string;
  weight?: number;
  cost?: string;
  description: string;
  properties?: string[];
  magicalProperties?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SRDBackgroundOption {
  id: string;
  name: string;
  source: 'official' | 'custom';
  description?: string;
  skillProficiencies?: string[];
  languageChoices?: string[];
  equipment?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SRDDataType = 'monsters' | 'races' | 'classes' | 'spells' | 'items' | 'backgrounds';

export interface SRDMetadata {
  lastSyncDate: string;
  lastSyncTimestamp: number;
  apiVersion: string;
  sourceUrl: string;
  officialEntryCount: Record<SRDDataType, number>;
  customEntryCount: Record<SRDDataType, number>;
}

export interface SRDDatabase {
  monsters: {
    official: SRDMonster[];
    custom: SRDMonster[];
  };
  races: {
    official: SRDRace[];
    custom: SRDRace[];
  };
  classes: {
    official: SRDClass[];
    custom: SRDClass[];
  };
  spells: {
    official: SRDSpell[];
    custom: SRDSpell[];
  };
  items: {
    official: SRDItem[];
    custom: SRDItem[];
  };
  backgrounds: {
    official: SRDBackgroundOption[];
    custom: SRDBackgroundOption[];
  };
  metadata: SRDMetadata;
}
