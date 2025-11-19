/**
 * Validation schemas for API requests using Zod
 * Install with: npm install zod
 */

import { z } from 'zod'

/**
 * Campaign creation/update schema
 */
export const CampaignSchema = z.object({
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),

  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  synopsis: z.string()
    .max(2000, 'Synopsis must be less than 2000 characters')
    .optional(),

  level: z.string()
    .max(20, 'Level must be less than 20 characters')
    .optional(),

  players: z.string()
    .max(50, 'Players must be less than 50 characters')
    .optional(),

  duration: z.string()
    .max(50, 'Duration must be less than 50 characters')
    .optional(),

  genre: z.string()
    .max(50, 'Genre must be less than 50 characters')
    .optional(),

  thumbnail: z.string()
    .url('Thumbnail must be a valid URL')
    .optional()
    .or(z.literal('')),

  theme: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color'),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color'),
  }).optional(),
})

export type CampaignInput = z.infer<typeof CampaignSchema>

/**
 * Scene creation/update schema
 */
export const SceneSchema = z.object({
  title: z.string()
    .min(1, 'Scene title is required')
    .max(200, 'Scene title must be less than 200 characters'),

  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),

  content: z.string()
    .min(1, 'Scene content is required')
    .max(100000, 'Scene content must be less than 100KB'),
})

export type SceneInput = z.infer<typeof SceneSchema>

/**
 * Monster creation schema
 */
export const MonsterSchema = z.object({
  name: z.string()
    .min(1, 'Monster name is required')
    .max(100, 'Monster name must be less than 100 characters'),

  ac: z.number()
    .int('AC must be an integer')
    .min(1, 'AC must be at least 1')
    .max(30, 'AC must be at most 30'),

  hp: z.number()
    .int('HP must be an integer')
    .min(1, 'HP must be at least 1')
    .max(1000, 'HP must be at most 1000'),

  speed: z.string()
    .max(100, 'Speed must be less than 100 characters'),

  str: z.number()
    .int('STR must be an integer')
    .min(1, 'STR must be at least 1')
    .max(30, 'STR must be at most 30'),

  dex: z.number()
    .int('DEX must be an integer')
    .min(1, 'DEX must be at least 1')
    .max(30, 'DEX must be at most 30'),

  con: z.number()
    .int('CON must be an integer')
    .min(1, 'CON must be at least 1')
    .max(30, 'CON must be at most 30'),

  int: z.number()
    .int('INT must be an integer')
    .min(1, 'INT must be at least 1')
    .max(30, 'INT must be at most 30'),

  wis: z.number()
    .int('WIS must be an integer')
    .min(1, 'WIS must be at least 1')
    .max(30, 'WIS must be at most 30'),

  cha: z.number()
    .int('CHA must be an integer')
    .min(1, 'CHA must be at least 1')
    .max(30, 'CHA must be at most 30'),

  cr: z.string()
    .max(10, 'CR must be less than 10 characters'),

  traits: z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(1000),
  })).optional(),

  actions: z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(1000),
  })).optional(),

  reactions: z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(1000),
  })).optional(),

  legendaryActions: z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(1000),
  })).optional(),

  imageUrl: z.string()
    .url('Image URL must be valid')
    .optional()
    .or(z.literal('')),
})

export type MonsterInput = z.infer<typeof MonsterSchema>

/**
 * Character import schema (D&D Beyond)
 */
export const CharacterImportSchema = z.object({
  characterId: z.union([
    z.string().regex(/^[0-9]+$/, 'Character ID must be numeric'),
    z.number(),
  ]).transform(val => String(val)),

  characterData: z.record(z.any()).optional(), // Allow any structure from D&D Beyond

  fetchedAt: z.string()
    .datetime('Invalid datetime format')
    .optional(),
})

export type CharacterImportInput = z.infer<typeof CharacterImportSchema>

/**
 * Manual character add schema
 */
export const ManualCharacterSchema = z.object({
  characterData: z.object({
    id: z.string().optional(),
    name: z.string()
      .min(1, 'Character name is required')
      .max(100, 'Character name must be less than 100 characters'),
    level: z.number()
      .int()
      .min(1)
      .max(20)
      .optional(),
    class: z.string().max(50).optional(),
    race: z.string().max(50).optional(),
  }).passthrough(), // Allow additional properties
})

export type ManualCharacterInput = z.infer<typeof ManualCharacterSchema>

/**
 * VTT Token schema
 */
export const TokenSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  x: z.number(),
  y: z.number(),
  type: z.enum(['player', 'enemy', 'npc', 'object']),
  size: z.enum(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  imageUrl: z.string().url().optional(),
  hp: z.number().int().min(0).optional(),
  maxHp: z.number().int().min(1).optional(),
  ac: z.number().int().min(0).max(30).optional(),
  initiative: z.number().int().optional(),
  conditions: z.array(z.string().max(50)).optional(),
})

export type TokenInput = z.infer<typeof TokenSchema>

/**
 * File upload validation
 */
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSizeBytes: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default(['application/pdf']),
})

/**
 * Helper function to validate file uploads
 */
export function validateFileUpload(file: File, maxSizeBytes: number = 10 * 1024 * 1024): void {
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`)
  }
}

/**
 * D&D Beyond character ID schema
 */
export const DnDBeyondCharacterIdSchema = z.string()
  .regex(/^[0-9]+$/, 'D&D Beyond character ID must be numeric')

/**
 * Grid settings schema for VTT
 */
export const GridSettingsSchema = z.object({
  enabled: z.boolean(),
  size: z.number()
    .int()
    .min(20, 'Grid size must be at least 20px')
    .max(150, 'Grid size must be at most 150px'),
  snapToGrid: z.boolean(),
})

export type GridSettingsInput = z.infer<typeof GridSettingsSchema>
