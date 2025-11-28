/**
 * Campaign Generation Prompts
 * These prompts guide the AI in generating complete D&D campaigns
 */

import type { GeneratedCampaign } from '../schemas/generation-schemas';

/**
 * Default system prompt for campaign generation
 * This can be customized by admins through the web UI
 */
export const DEFAULT_CAMPAIGN_SYSTEM_PROMPT = `You are an expert Dungeons & Dragons 5th Edition campaign designer and Dungeon Master with decades of experience creating memorable adventures. Your task is to generate complete, playable campaign content.

## Your Design Philosophy
- Create campaigns that balance combat, exploration, roleplay, and puzzle-solving
- Design encounters that challenge players without being unfair
- Write memorable NPCs with clear motivations and distinct personalities
- Build worlds that feel lived-in with history and consequences
- Include hooks that give players agency and meaningful choices
- Ensure accessibility by providing content warnings when appropriate

## D&D 5e Expertise
- Follow 5e rules accurately for monster stats, spell effects, and mechanics
- Balance encounters appropriately for the specified party level
- Use official monster stat blocks as templates for custom creatures
- Include varied encounter types: combat, social, exploration, puzzle
- Reference SRD content when appropriate

## Writing Style
- Use vivid, evocative descriptions that engage the senses
- Write "read aloud" text in second person present tense
- Keep DM notes concise but informative
- Include tactical suggestions without railroading
- Provide multiple solutions to obstacles when possible

## Output Format
You must respond with valid JSON only. Do not include markdown formatting, code blocks, or explanatory text outside the JSON structure.`;

/**
 * Build the user prompt for campaign generation
 */
export interface CampaignGenerationOptions {
  concept: string;
  genre?: string;
  level?: string;
  players?: string;
  duration?: string;
  themes?: string[];
  includeMonsters?: boolean;
  includeNPCs?: boolean;
  sceneCount?: number;
  tone?: 'serious' | 'lighthearted' | 'dark' | 'heroic' | 'comedic';
  setting?: string;
  context?: string;
}

export function buildCampaignPrompt(options: CampaignGenerationOptions): string {
  const {
    concept,
    genre = 'Fantasy Adventure',
    level = '1-5',
    players = '4-5',
    duration = '3-5 sessions',
    themes = [],
    includeMonsters = true,
    includeNPCs = true,
    sceneCount = 5,
    tone = 'heroic',
    setting,
    context,
  } = options;

  let prompt = `Generate a complete D&D 5e campaign based on the following concept:

## Campaign Concept
${concept}

## Parameters
- **Genre:** ${genre}
- **Party Level:** ${level}
- **Number of Players:** ${players}
- **Expected Duration:** ${duration}
- **Tone:** ${tone}
- **Number of Scenes:** ${sceneCount}
`;

  if (themes.length > 0) {
    prompt += `- **Themes:** ${themes.join(', ')}\n`;
  }

  if (setting) {
    prompt += `- **Setting:** ${setting}\n`;
  }

  if (context) {
    prompt += `\n## Additional Context\n${context}\n`;
  }

  prompt += `
## Required Output Structure
Generate a campaign with the following structure:

{
  "name": "Campaign title",
  "description": "Brief tagline or hook (1-2 sentences)",
  "synopsis": "Detailed campaign overview (2-3 paragraphs)",
  "genre": "${genre}",
  "level": "${level}",
  "players": "${players}",
  "duration": "${duration}",
  "plotHooks": ["Array of plot hooks to get players involved"],
  "themes": ["Major themes explored in the campaign"],
  "warnings": ["Content warnings if applicable, or empty array"],
  "imagePrompt": "A description for generating campaign artwork",
`;

  if (includeNPCs) {
    prompt += `  "majorNPCs": [
    {
      "name": "NPC Name",
      "race": "Race",
      "class": "Class if applicable",
      "background": "Brief background",
      "alignment": "Alignment",
      "personality": "Personality description",
      "motivation": "What drives this NPC",
      "appearance": "Physical description",
      "quirks": ["Notable quirks or habits"],
      "secrets": ["Hidden information about this NPC"],
      "imagePrompt": "Description for generating NPC artwork"
    }
  ],
`;
  }

  prompt += `  "scenes": [
    {
      "title": "Scene Title",
      "description": "DM overview of the scene",
      "readAloud": "Atmospheric text to read to players",
      "objectives": ["What players should accomplish"],
      "encounters": [
        {
          "name": "Encounter name",
          "description": "Encounter description",
          "difficulty": "easy|medium|hard|deadly",
          "monsters": [
            {"name": "Monster name", "count": 2, "notes": "Tactical notes"}
          ],
          "tactics": "How enemies behave",
          "environment": "Environmental factors",
          "rewards": ["Treasure and rewards"]
        }
      ],
      "npcs": [
        {"name": "NPC name", "role": "Their role in scene", "notes": "Interaction notes"}
      ],
      "treasures": ["Items found in this scene"],
      "secrets": ["Hidden information in this scene"],
      "transitions": {
        "next": ["Possible next scenes"],
        "previous": "Scene that leads here"
      },
      "imagePrompt": "Description for generating scene artwork"
    }
  ]`;

  if (includeMonsters) {
    prompt += `,
  "customMonsters": [
    {
      "name": "Monster Name",
      "size": "Medium",
      "type": "humanoid",
      "alignment": "neutral evil",
      "armorClass": 15,
      "armorType": "natural armor",
      "hitPoints": 52,
      "hitDice": "8d8+16",
      "speed": "30 ft.",
      "abilities": {"str": 16, "dex": 14, "con": 14, "int": 10, "wis": 12, "cha": 8},
      "savingThrows": ["Str +5", "Con +4"],
      "skills": ["Athletics +5", "Perception +3"],
      "senses": ["darkvision 60 ft.", "passive Perception 13"],
      "languages": ["Common"],
      "challengeRating": 3,
      "traits": [{"name": "Trait Name", "description": "Trait effect"}],
      "actions": [{"name": "Action Name", "description": "Action effect with attack bonus and damage"}],
      "description": "Lore and background for this creature",
      "imagePrompt": "Description for generating monster artwork"
    }
  ]`;
  }

  prompt += `
}

Generate exactly ${sceneCount} scenes that form a coherent narrative arc. Each scene should flow naturally into the next while allowing for player agency.`;

  if (includeMonsters) {
    prompt += ` Include 2-4 custom monsters that fit the campaign theme and are balanced for the party level.`;
  }

  if (includeNPCs) {
    prompt += ` Create 3-5 major NPCs including allies, antagonists, and neutral parties.`;
  }

  return prompt;
}

/**
 * Type for the generated campaign response
 */
export type GeneratedCampaignResponse = GeneratedCampaign;
