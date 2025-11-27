/**
 * Monster Generation Prompt Templates
 */

import type { GenerationContext } from '../context-builder';
import { formatContextForPrompt } from '../context-builder';

export const MONSTER_SYSTEM_PROMPT = `You are an expert D&D 5e monster designer. Your task is to create balanced, creative monsters that fit the D&D 5e ruleset.

When designing monsters, follow these guidelines:
1. Use the standard D&D 5e stat block format
2. Balance the creature's abilities for its Challenge Rating
3. Include interesting and thematic abilities that make combat engaging
4. Use SRD-compatible mechanics (no homebrew systems)
5. Provide vivid, evocative descriptions

For Challenge Rating calculations, consider:
- Defensive CR: Hit points and AC
- Offensive CR: Damage per round and attack bonus/save DC
- Final CR is the average of defensive and offensive CR

Standard HP by CR guidelines:
- CR 0: 1-6 HP
- CR 1/8: 7-35 HP
- CR 1/4: 36-49 HP
- CR 1/2: 50-70 HP
- CR 1: 71-85 HP
- CR 2: 86-100 HP
- CR 3: 101-115 HP
- CR 4: 116-130 HP
- CR 5: 131-145 HP
- CR 6-10: +15 HP per CR
- CR 11+: +20 HP per CR

Standard AC by CR:
- CR 0-3: 13 AC
- CR 4-7: 14 AC
- CR 8-11: 15 AC
- CR 12-16: 17 AC
- CR 17+: 18+ AC

IMPORTANT: Output must be valid JSON matching the provided schema. Do not include markdown formatting.`;

export interface MonsterPromptParams {
  concept: string;           // User's concept description
  targetCR?: number;         // Target Challenge Rating
  monsterType?: string;      // Creature type (Beast, Undead, etc.)
  size?: string;             // Size category
  context: GenerationContext;
}

export function buildMonsterPrompt(params: MonsterPromptParams): string {
  const { concept, targetCR, monsterType, size, context } = params;

  const contextInfo = formatContextForPrompt(context);

  let prompt = `Create a D&D 5e monster based on this concept:

"${concept}"

`;

  if (targetCR !== undefined) {
    prompt += `Target Challenge Rating: ${targetCR}\n`;
  }

  if (monsterType) {
    prompt += `Creature Type: ${monsterType}\n`;
  }

  if (size) {
    prompt += `Size: ${size}\n`;
  }

  prompt += `
${contextInfo}

Generate a complete monster stat block in JSON format with the following structure:
{
  "name": "Monster Name",
  "size": "Medium",
  "type": "beast",
  "alignment": "neutral",
  "armorClass": 13,
  "armorType": "natural armor",
  "hitPoints": 45,
  "hitDice": "6d8+18",
  "speed": "30 ft.",
  "abilities": {
    "str": 16,
    "dex": 12,
    "con": 16,
    "int": 6,
    "wis": 12,
    "cha": 8
  },
  "savingThrows": ["Con +5"],
  "skills": ["Perception +3", "Stealth +3"],
  "damageResistances": [],
  "damageImmunities": [],
  "conditionImmunities": [],
  "senses": ["darkvision 60 ft.", "passive Perception 13"],
  "languages": ["understands Common but can't speak"],
  "challengeRating": 3,
  "xp": 700,
  "traits": [
    {
      "name": "Trait Name",
      "description": "Description of the trait and its mechanical effects."
    }
  ],
  "actions": [
    {
      "name": "Multiattack",
      "description": "The creature makes two claw attacks."
    },
    {
      "name": "Claw",
      "description": "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) slashing damage."
    }
  ],
  "reactions": [],
  "legendaryActions": [],
  "description": "A vivid description of the monster's appearance, behavior, and lore.",
  "imagePrompt": "A detailed description for generating artwork of this monster."
}

Make the monster creative, balanced for its CR, and interesting to fight. Include unique abilities that reflect the concept provided.`;

  return prompt;
}

/**
 * Generate an image prompt for a monster
 */
export function buildMonsterImagePrompt(monster: {
  name: string;
  size: string;
  type: string;
  description?: string;
}): string {
  return `A ${monster.size.toLowerCase()} ${monster.type} creature called "${monster.name}". ${monster.description || ''} Fantasy art style, detailed, dramatic lighting, D&D monster artwork, suitable for a tabletop RPG sourcebook.`;
}
