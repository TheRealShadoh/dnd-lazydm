/**
 * Zod validation schemas for SRD data
 */

import { z } from 'zod';

export const SRDMonsterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  source: z.enum(['official', 'custom']),
  ac: z.number().int().min(1).max(30),
  hp: z.number().int().min(1).max(1000),
  speed: z.string().max(200),
  abilities: z.object({
    strength: z.number().int().min(1).max(30),
    dexterity: z.number().int().min(1).max(30),
    constitution: z.number().int().min(1).max(30),
    intelligence: z.number().int().min(1).max(30),
    wisdom: z.number().int().min(1).max(30),
    charisma: z.number().int().min(1).max(30),
  }),
  savingThrows: z.record(z.string(), z.number()).optional(),
  skills: z.record(z.string(), z.number()).optional(),
  damageImmunities: z.array(z.string()).optional(),
  damageResistances: z.array(z.string()).optional(),
  damageVulnerabilities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  challengeRating: z.number().min(0).max(30),
  traits: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(2000),
  })).optional(),
  actions: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(2000),
  })).optional(),
  reactions: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(2000),
  })).optional(),
  legendaryActions: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(2000),
  })).optional(),
  imageUrl: z.string().url().optional(),
  alignment: z.string().optional(),
  size: z.string().optional(),
  type: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SRDRaceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  source: z.enum(['official', 'custom']),
  abilityScoreBonuses: z.record(z.string(), z.number()).optional(),
  abilityScoreMax: z.number().int().optional(),
  size: z.string().optional(),
  speed: z.number().optional(),
  languages: z.array(z.string()).optional(),
  proficiencies: z.array(z.string()).optional(),
  traits: z.array(z.string()).optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SRDClassSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  source: z.enum(['official', 'custom']),
  hitDice: z.string().optional(),
  armorProficiencies: z.array(z.string()).optional(),
  weaponProficiencies: z.array(z.string()).optional(),
  skillChoices: z.array(z.string()).optional(),
  savingThrowProficiencies: z.array(z.string()).optional(),
  spellcastingAbility: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SRDSpellSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  source: z.enum(['official', 'custom']),
  level: z.number().int().min(0).max(9),
  school: z.string().optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  components: z.array(z.string()).optional(),
  duration: z.string().optional(),
  description: z.string().min(1),
  higherLevel: z.string().optional(),
  classes: z.array(z.string()).optional(),
  ritual: z.boolean().optional(),
  concentration: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SRDItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  source: z.enum(['official', 'custom']),
  type: z.string().optional(),
  rarity: z.string().optional(),
  weight: z.number().optional(),
  cost: z.string().optional(),
  description: z.string().min(1),
  properties: z.array(z.string()).optional(),
  magicalProperties: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SRDBackgroundSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  source: z.enum(['official', 'custom']),
  description: z.string().optional(),
  skillProficiencies: z.array(z.string()).optional(),
  languageChoices: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
