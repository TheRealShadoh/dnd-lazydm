/**
 * AI Context Builder
 * Builds rich context for AI prompts by querying SRD and campaign data
 */

import * as storage from '@/lib/srd/storage';
import type { SRDMonster, SRDSpell, SRDRace, SRDClass, SRDItem } from '@/lib/srd/models';
import { promises as fs } from 'fs';
import path from 'path';

export interface GenerationContext {
  // SRD reference data
  srdMonsters: SRDMonster[];
  srdSpells: SRDSpell[];
  srdRaces: SRDRace[];
  srdClasses: SRDClass[];
  srdItems: SRDItem[];

  // Campaign context (if generating for existing campaign)
  campaignInfo?: {
    name: string;
    description: string;
    level: string;
    genre: string;
    existingMonsters?: string[];
    existingNPCs?: string[];
  };

  // Generation parameters
  targetLevel?: number;
  partySize?: number;
  theme?: string;
}

export interface ContextBuilderParams {
  campaignId?: string;        // If generating for existing campaign
  theme?: string;             // Genre/theme hints
  playerLevel?: number;       // Target level range
  partySize?: number;
  targetCR?: number;          // For monster generation
  monsterType?: string;       // For monster generation
  includeSpells?: boolean;    // Include relevant spells
  includeItems?: boolean;     // Include relevant items
  maxExamples?: number;       // Max reference examples to include
}

/**
 * Build context for AI generation
 */
export async function buildContext(params: ContextBuilderParams): Promise<GenerationContext> {
  const {
    campaignId,
    theme,
    playerLevel = 5,
    partySize = 4,
    targetCR,
    monsterType,
    includeSpells = false,
    includeItems = false,
    maxExamples = 5,
  } = params;

  const context: GenerationContext = {
    srdMonsters: [],
    srdSpells: [],
    srdRaces: [],
    srdClasses: [],
    srdItems: [],
    targetLevel: playerLevel,
    partySize,
    theme,
  };

  // Load SRD data
  const db = storage.loadSRDDatabase();

  // Get relevant monsters by CR
  const crMin = targetCR ? targetCR - 2 : Math.max(0, playerLevel - 3);
  const crMax = targetCR ? targetCR + 2 : playerLevel + 3;

  let allMonsters = [...db.monsters.official, ...db.monsters.custom];

  // Filter by CR range
  allMonsters = allMonsters.filter(m => {
    const cr = m.challengeRating;
    return cr >= crMin && cr <= crMax;
  });

  // Filter by type if specified
  if (monsterType) {
    allMonsters = allMonsters.filter(m =>
      m.type?.toLowerCase().includes(monsterType.toLowerCase())
    );
  }

  // Take sample of monsters as examples
  context.srdMonsters = sampleArray(allMonsters, maxExamples);

  // Load races and classes for NPC generation
  context.srdRaces = sampleArray([...db.races.official, ...db.races.custom], 5);
  context.srdClasses = [...db.classes.official, ...db.classes.custom];

  // Optionally load spells
  if (includeSpells) {
    const maxSpellLevel = Math.min(9, Math.floor((playerLevel + 1) / 2));
    const relevantSpells = [...db.spells.official, ...db.spells.custom].filter(
      s => s.level <= maxSpellLevel
    );
    context.srdSpells = sampleArray(relevantSpells, maxExamples);
  }

  // Optionally load items
  if (includeItems) {
    context.srdItems = sampleArray(
      [...db.items.official, ...db.items.custom],
      maxExamples
    );
  }

  // Load campaign context if specified
  if (campaignId) {
    context.campaignInfo = await loadCampaignContext(campaignId);
  }

  return context;
}

/**
 * Build context specifically for monster generation
 */
export async function buildMonsterContext(params: {
  targetCR?: number;
  monsterType?: string;
  theme?: string;
  campaignId?: string;
}): Promise<GenerationContext> {
  return buildContext({
    ...params,
    maxExamples: 3,
    includeSpells: params.targetCR !== undefined && params.targetCR >= 3, // Include spells for higher CR
  });
}

/**
 * Build context for campaign generation
 */
export async function buildCampaignContext(params: {
  playerLevel?: number;
  partySize?: number;
  theme?: string;
  sessionCount?: number;
}): Promise<GenerationContext> {
  return buildContext({
    ...params,
    includeSpells: true,
    includeItems: true,
    maxExamples: 10,
  });
}

/**
 * Load campaign context from existing campaign
 */
async function loadCampaignContext(campaignId: string): Promise<GenerationContext['campaignInfo']> {
  try {
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId);
    const metadataPath = path.join(campaignPath, 'campaign.json');

    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    // Try to find existing monsters in the campaign
    const existingMonsters: string[] = [];
    const monstersPath = path.join(campaignPath, 'reference', 'monsters');
    try {
      const files = await fs.readdir(monstersPath);
      for (const file of files) {
        if (file.endsWith('.mdx')) {
          const monsterName = file.replace('.mdx', '').replace(/-/g, ' ');
          existingMonsters.push(monsterName);
        }
      }
    } catch {
      // Monsters directory might not exist
    }

    return {
      name: metadata.name,
      description: metadata.description || '',
      level: metadata.level || '',
      genre: metadata.genre || '',
      existingMonsters,
    };
  } catch (error) {
    console.error('Failed to load campaign context:', error);
    return undefined;
  }
}

/**
 * Format context for prompt injection
 */
export function formatContextForPrompt(context: GenerationContext): string {
  const parts: string[] = [];

  if (context.theme) {
    parts.push(`Theme/Genre: ${context.theme}`);
  }

  if (context.targetLevel) {
    parts.push(`Target Party Level: ${context.targetLevel}`);
  }

  if (context.partySize) {
    parts.push(`Party Size: ${context.partySize} players`);
  }

  if (context.campaignInfo) {
    parts.push(`\nCampaign Context:`);
    parts.push(`- Name: ${context.campaignInfo.name}`);
    if (context.campaignInfo.description) {
      parts.push(`- Description: ${context.campaignInfo.description}`);
    }
    if (context.campaignInfo.genre) {
      parts.push(`- Genre: ${context.campaignInfo.genre}`);
    }
    if (context.campaignInfo.existingMonsters?.length) {
      parts.push(`- Existing Monsters: ${context.campaignInfo.existingMonsters.join(', ')}`);
    }
  }

  if (context.srdMonsters.length > 0) {
    parts.push(`\nReference Monsters (for balance and style):`);
    for (const m of context.srdMonsters.slice(0, 3)) {
      parts.push(`- ${m.name} (CR ${m.challengeRating}, ${m.type}, HP ${m.hp})`);
    }
  }

  if (context.srdRaces.length > 0) {
    parts.push(`\nAvailable Races: ${context.srdRaces.map(r => r.name).join(', ')}`);
  }

  if (context.srdClasses.length > 0) {
    parts.push(`Available Classes: ${context.srdClasses.map(c => c.name).join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Get a random sample from an array
 */
function sampleArray<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
