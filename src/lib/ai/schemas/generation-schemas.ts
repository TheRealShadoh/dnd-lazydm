/**
 * Zod schemas for AI-generated content validation
 */

import { z } from 'zod';

/**
 * Monster ability scores
 */
export const AbilitiesSchema = z.object({
  str: z.number().min(1).max(30),
  dex: z.number().min(1).max(30),
  con: z.number().min(1).max(30),
  int: z.number().min(1).max(30),
  wis: z.number().min(1).max(30),
  cha: z.number().min(1).max(30),
});

/**
 * Monster trait/ability
 */
export const TraitSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

/**
 * Speed schema - handles various AI output formats
 * Can be: "30 ft." or { walk: 30 } or { walk: "30 ft." }
 */
export const SpeedSchema = z.union([
  z.string(),
  z.record(z.string(), z.union([z.number(), z.string()])),
]);

/**
 * Senses schema - handles array or object format
 * Can be: ["darkvision 60 ft."] or { darkvision: "60 ft." }
 */
export const SensesSchema = z.union([
  z.array(z.string()),
  z.record(z.string(), z.union([z.string(), z.number()])),
]).optional();

/**
 * Generated Monster schema
 */
export const GeneratedMonsterSchema = z.object({
  name: z.string().min(1),
  size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']),
  type: z.string().min(1),
  alignment: z.string().optional(),
  armorClass: z.number().min(1).max(30),
  armorType: z.string().optional(),
  hitPoints: z.number().min(1),
  hitDice: z.string().min(1),
  speed: SpeedSchema,
  abilities: AbilitiesSchema,
  savingThrows: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  damageVulnerabilities: z.array(z.string()).optional(),
  damageResistances: z.array(z.string()).optional(),
  damageImmunities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: SensesSchema,
  languages: z.array(z.string()).optional(),
  challengeRating: z.number().min(0).max(30),
  xp: z.number().min(0).optional(),
  traits: z.array(TraitSchema).optional(),
  actions: z.array(TraitSchema).optional(),
  bonusActions: z.array(TraitSchema).optional(),
  reactions: z.array(TraitSchema).optional(),
  legendaryActions: z.array(TraitSchema).optional(),
  lairActions: z.array(TraitSchema).optional(),
  description: z.string().optional(),
  imagePrompt: z.string().optional(),
});

export type GeneratedMonster = z.infer<typeof GeneratedMonsterSchema>;

/**
 * Generated NPC schema
 */
export const GeneratedNPCSchema = z.object({
  name: z.string().min(1),
  race: z.string().min(1),
  class: z.string().optional(),
  level: z.number().min(1).max(20).optional(),
  background: z.string().optional(),
  alignment: z.string().optional(),
  personality: z.string().optional(),
  motivation: z.string().optional(),
  appearance: z.string().optional(),
  quirks: z.array(z.string()).optional(),
  secrets: z.array(z.string()).optional(),
  relationships: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
  })).optional(),
  abilities: AbilitiesSchema.optional(),
  skills: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  spells: z.array(z.string()).optional(),
  imagePrompt: z.string().optional(),
});

export type GeneratedNPC = z.infer<typeof GeneratedNPCSchema>;

/**
 * Encounter monster entry
 */
export const EncounterMonsterSchema = z.object({
  name: z.string().min(1),
  count: z.number().min(1),
  notes: z.string().optional(),
});

/**
 * Generated Encounter schema
 */
export const GeneratedEncounterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'deadly']),
  monsters: z.array(EncounterMonsterSchema),
  tactics: z.string().optional(),
  environment: z.string().optional(),
  rewards: z.array(z.string()).optional(),
  xpTotal: z.number().optional(),
});

export type GeneratedEncounter = z.infer<typeof GeneratedEncounterSchema>;

/**
 * Generated Scene schema
 */
export const GeneratedSceneSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  readAloud: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  encounters: z.array(GeneratedEncounterSchema).optional(),
  npcs: z.array(z.object({
    name: z.string(),
    role: z.string(),
    notes: z.string().optional(),
  })).optional(),
  treasures: z.array(z.string()).optional(),
  secrets: z.array(z.string()).optional(),
  transitions: z.object({
    next: z.union([z.array(z.string()), z.string()]).optional(),
    previous: z.union([z.array(z.string()), z.string()]).optional(),
  }).optional(),
  imagePrompt: z.string().optional(),
});

export type GeneratedScene = z.infer<typeof GeneratedSceneSchema>;

/**
 * Generated Campaign schema
 */
export const GeneratedCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  synopsis: z.string().optional(),
  genre: z.string().optional(),
  level: z.string().optional(), // e.g., "1-5" or "5"
  players: z.string().optional(), // e.g., "4-6"
  duration: z.string().optional(), // e.g., "3-5 sessions"
  plotHooks: z.array(z.string()).optional(),
  majorNPCs: z.array(GeneratedNPCSchema).optional(),
  scenes: z.array(GeneratedSceneSchema).optional(),
  customMonsters: z.array(GeneratedMonsterSchema).optional(),
  themes: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(), // Content warnings
  imagePrompt: z.string().optional(),
});

export type GeneratedCampaign = z.infer<typeof GeneratedCampaignSchema>;

/**
 * XP by CR lookup
 */
export const XP_BY_CR: Record<number | string, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};

/**
 * Get XP for a Challenge Rating
 */
export function getXPForCR(cr: number): number {
  if (cr in XP_BY_CR) {
    return XP_BY_CR[cr];
  }
  // Handle fractional CRs
  if (cr === 0.125) return 25;
  if (cr === 0.25) return 50;
  if (cr === 0.5) return 100;
  // Default to interpolation for unknown CRs
  const lowerCR = Math.floor(cr);
  const upperCR = Math.ceil(cr);
  const lowerXP = XP_BY_CR[lowerCR] || 0;
  const upperXP = XP_BY_CR[upperCR] || lowerXP;
  return Math.round(lowerXP + (upperXP - lowerXP) * (cr - lowerCR));
}
