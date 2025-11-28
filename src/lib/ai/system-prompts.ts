/**
 * System Prompts Storage and Management
 * Allows admins to customize AI generation prompts through the web UI
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Types of system prompts available
 */
export type SystemPromptType =
  | 'campaign'
  | 'monster'
  | 'npc'
  | 'scene'
  | 'encounter';

/**
 * System prompt entry
 */
export interface SystemPrompt {
  type: SystemPromptType;
  name: string;
  description: string;
  prompt: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * System prompts data file structure
 */
interface SystemPromptsData {
  prompts: SystemPrompt[];
}

const PROMPTS_FILE = path.join(process.cwd(), 'src', 'data', 'system-prompts.json');
const DEFAULT_PROMPTS_FILE = path.join(process.cwd(), 'src', 'data', 'system-prompts.default.json');

// Default prompts imported from their respective files
import { DEFAULT_CAMPAIGN_SYSTEM_PROMPT } from './prompts/campaign-generator';
import { MONSTER_SYSTEM_PROMPT } from './prompts/monster-generator';

/**
 * Default system prompts
 */
const DEFAULT_PROMPTS: Omit<SystemPrompt, 'createdAt' | 'updatedAt'>[] = [
  {
    type: 'campaign',
    name: 'Campaign Generator',
    description: 'System prompt for generating complete D&D campaigns with scenes, NPCs, and encounters',
    prompt: DEFAULT_CAMPAIGN_SYSTEM_PROMPT,
    isDefault: true,
  },
  {
    type: 'monster',
    name: 'Monster Generator',
    description: 'System prompt for generating balanced D&D 5e monster stat blocks',
    prompt: MONSTER_SYSTEM_PROMPT,
    isDefault: true,
  },
  {
    type: 'npc',
    name: 'NPC Generator',
    description: 'System prompt for generating memorable NPCs with personalities and motivations',
    prompt: `You are an expert D&D 5e NPC designer. Create memorable, well-rounded non-player characters with:
- Distinct personalities and speaking styles
- Clear motivations and goals
- Interesting backgrounds and secrets
- Appropriate stat suggestions for their role
- Potential plot hooks and quest opportunities

Focus on creating NPCs that players will want to interact with and remember. Include quirks, mannerisms, and dialogue suggestions.

Respond with valid JSON only.`,
    isDefault: true,
  },
  {
    type: 'scene',
    name: 'Scene Generator',
    description: 'System prompt for generating individual adventure scenes',
    prompt: `You are an expert D&D 5e scene designer. Create engaging, playable scenes that include:
- Vivid "read aloud" descriptions
- Clear objectives and challenges
- Multiple paths to success
- Interesting environmental features
- Appropriate encounters and NPCs
- Meaningful rewards and consequences

Balance combat, exploration, and roleplay opportunities. Provide tactical notes for DMs.

Respond with valid JSON only.`,
    isDefault: true,
  },
  {
    type: 'encounter',
    name: 'Encounter Generator',
    description: 'System prompt for generating balanced combat encounters',
    prompt: `You are an expert D&D 5e encounter designer. Create balanced, tactically interesting combat encounters that:
- Match the specified difficulty and party level
- Include varied monster types and roles
- Feature interesting terrain and environmental factors
- Provide tactical suggestions for running the encounter
- Include appropriate treasure and rewards
- Consider action economy and party composition

Use official 5e monsters when possible, with clear notes on tactics and behavior.

Respond with valid JSON only.`,
    isDefault: true,
  },
];

/**
 * Initialize system prompts file with defaults if it doesn't exist
 * First tries to copy from the git-tracked default file, then falls back to code defaults
 */
async function initializePrompts(): Promise<void> {
  try {
    await fs.access(PROMPTS_FILE);
  } catch {
    // File doesn't exist - try to copy from default file first
    const dir = path.dirname(PROMPTS_FILE);
    await fs.mkdir(dir, { recursive: true });

    try {
      // Try to copy from the git-tracked default file
      const defaultData = await fs.readFile(DEFAULT_PROMPTS_FILE, 'utf-8');
      const parsed = JSON.parse(defaultData) as SystemPromptsData;

      // Add timestamps if missing
      const now = new Date().toISOString();
      const data: SystemPromptsData = {
        prompts: parsed.prompts.map(p => ({
          ...p,
          createdAt: p.createdAt || now,
          updatedAt: p.updatedAt || now,
        })),
      };

      await fs.writeFile(PROMPTS_FILE, JSON.stringify(data, null, 2));
    } catch {
      // Default file doesn't exist or is invalid, use code defaults
      const now = new Date().toISOString();
      const data: SystemPromptsData = {
        prompts: DEFAULT_PROMPTS.map(p => ({
          ...p,
          createdAt: now,
          updatedAt: now,
        })),
      };
      await fs.writeFile(PROMPTS_FILE, JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Read all system prompts
 */
async function readPrompts(): Promise<SystemPromptsData> {
  await initializePrompts();
  const data = await fs.readFile(PROMPTS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write system prompts
 */
async function writePrompts(data: SystemPromptsData): Promise<void> {
  await fs.writeFile(PROMPTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get all system prompts
 */
export async function getAllSystemPrompts(): Promise<SystemPrompt[]> {
  const data = await readPrompts();
  return data.prompts;
}

/**
 * Get system prompt by type
 */
export async function getSystemPrompt(type: SystemPromptType): Promise<SystemPrompt | null> {
  const data = await readPrompts();
  return data.prompts.find(p => p.type === type) || null;
}

/**
 * Get the active prompt text for a type
 */
export async function getSystemPromptText(type: SystemPromptType): Promise<string> {
  const prompt = await getSystemPrompt(type);
  if (!prompt) {
    // Return default from code if not in file
    const defaultPrompt = DEFAULT_PROMPTS.find(p => p.type === type);
    return defaultPrompt?.prompt || '';
  }
  return prompt.prompt;
}

/**
 * Update a system prompt
 */
export async function updateSystemPrompt(
  type: SystemPromptType,
  newPrompt: string
): Promise<SystemPrompt> {
  const data = await readPrompts();
  const index = data.prompts.findIndex(p => p.type === type);

  const now = new Date().toISOString();

  if (index === -1) {
    // Add new prompt
    const defaultInfo = DEFAULT_PROMPTS.find(p => p.type === type);
    const newEntry: SystemPrompt = {
      type,
      name: defaultInfo?.name || type,
      description: defaultInfo?.description || '',
      prompt: newPrompt,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    data.prompts.push(newEntry);
    await writePrompts(data);
    return newEntry;
  }

  // Update existing
  data.prompts[index] = {
    ...data.prompts[index],
    prompt: newPrompt,
    isDefault: false,
    updatedAt: now,
  };

  await writePrompts(data);
  return data.prompts[index];
}

/**
 * Reset a system prompt to default
 */
export async function resetSystemPrompt(type: SystemPromptType): Promise<SystemPrompt | null> {
  const defaultPrompt = DEFAULT_PROMPTS.find(p => p.type === type);
  if (!defaultPrompt) return null;

  const data = await readPrompts();
  const index = data.prompts.findIndex(p => p.type === type);

  const now = new Date().toISOString();
  const resetEntry: SystemPrompt = {
    ...defaultPrompt,
    createdAt: data.prompts[index]?.createdAt || now,
    updatedAt: now,
  };

  if (index === -1) {
    data.prompts.push(resetEntry);
  } else {
    data.prompts[index] = resetEntry;
  }

  await writePrompts(data);
  return resetEntry;
}

/**
 * Get default prompt for a type (from code, not file)
 */
export function getDefaultPrompt(type: SystemPromptType): string {
  const defaultPrompt = DEFAULT_PROMPTS.find(p => p.type === type);
  return defaultPrompt?.prompt || '';
}
