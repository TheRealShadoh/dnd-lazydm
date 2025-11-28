import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAIClientForUser } from '@/lib/ai/claude-client';

const ENHANCE_SYSTEM_PROMPT = `You are an expert at crafting detailed, evocative prompts for D&D content generation.
Your task is to take a user's basic idea and enhance it into a rich, detailed prompt that will generate better results.

Guidelines:
- Expand on the core concept with specific details
- Add evocative descriptive language
- Include relevant D&D-specific elements (mechanics, lore, themes)
- Suggest interesting twists or unique elements
- Keep the enhanced prompt concise but comprehensive (2-4 sentences)
- Maintain the original intent and tone
- Don't add content the user didn't imply

Respond with ONLY the enhanced prompt text, no explanations or formatting.`;

/**
 * POST /api/ai/enhance-prompt
 * Enhance a user's prompt using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getAIClientForUser(session.user.id);

    if (!client) {
      return NextResponse.json(
        { error: 'No AI API key configured. Please add your API key in Settings.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Customize the enhancement based on type
    let typeContext = '';
    switch (type) {
      case 'monster':
        typeContext = 'This prompt is for generating a D&D 5e monster. Consider creature type, abilities, combat role, and narrative hooks.';
        break;
      case 'campaign':
        typeContext = 'This prompt is for generating a D&D campaign. Consider plot hooks, themes, memorable NPCs, interesting locations, and dramatic tension.';
        break;
      case 'image':
        typeContext = 'This prompt is for generating fantasy artwork. Consider composition, lighting, mood, style, and visual details.';
        break;
      case 'npc':
        typeContext = 'This prompt is for generating a D&D NPC. Consider personality, motivation, appearance, secrets, and how they interact with players.';
        break;
      case 'scene':
        typeContext = 'This prompt is for generating a D&D scene/encounter. Consider atmosphere, challenges, rewards, and player agency.';
        break;
      default:
        typeContext = 'This prompt is for D&D content generation.';
    }

    const enhancedPrompt = await client.generate({
      prompt: `${typeContext}\n\nOriginal prompt: "${prompt}"\n\nEnhance this prompt:`,
      systemPrompt: ENHANCE_SYSTEM_PROMPT,
      maxTokens: 500,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      original: prompt,
      enhanced: enhancedPrompt.trim(),
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API key') || errorMessage.includes('401')) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return NextResponse.json(
      { error: `Failed to enhance prompt: ${errorMessage}` },
      { status: 500 }
    );
  }
}
